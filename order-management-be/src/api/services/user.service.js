import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { INVITE_STATUS } from '../models/invite.model.js';
import { NOTIFICATION_PREFERENCE, ORDER_PREFERENCE, PAYMENT_PREFERENCE } from '../models/preferences.model.js';
import { USER_ROLES, USER_STATUS } from '../models/user.model.js';
import inviteRepo from '../repositories/invite.repository.js';
import preferencesRepo from '../repositories/preferences.repository.js';
import userRepo from '../repositories/user.repository.js';
import { EMAIL_ACTIONS, CustomError, STATUS_CODE, isCustomError, mapSequelizeError } from '../utils/common.js';
import { getAssignedHotelId } from '../utils/hotelAccess.js';
import { comparePassword, hashPassword, isBcryptHash } from '../utils/password.js';
import { compareRecoveryCode, hashRecoveryCode, safeDummyRecoveryCodeComparison } from '../utils/recoveryCode.js';
import { sendEmail } from './email.service.js';

const isDev = env.app.isDevelopment;
const OWNER_RECOVERY_ERROR = 'Email or recovery code is incorrect.';
const OWNER_RECOVERY_LOCK_MINUTES = 30;
const OWNER_RECOVERY_MAX_ATTEMPTS = 5;

const encryptPassword = async (password) => hashPassword(password);

const sanitizeUser = (value) => {
    const source = typeof value?.toJSON === 'function' ? value.toJSON() : value?.dataValues || value || {};
    const result = { ...source };
    delete result.password;
    delete result.recoveryCodeHash;
    delete result.recoveryCodeFailedAttempts;
    delete result.recoveryCodeLockedUntil;
    delete result.tokenVersion;
    return result;
};

const activateUser = async (userId) => {
    await userRepo.update({ where: { id: userId } }, { status: USER_STATUS[0] });
};

const sendVerificationEmail = async (user) => {
    if (isDev) {
        return;
    }
    const verifyOptions = {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        expires: moment().add(1, 'hour').valueOf()
    };

    const token = CryptoJS.AES.encrypt(JSON.stringify(verifyOptions), env.cryptoSecret).toString();
    await sendEmail({ token: encodeURIComponent(token) }, user.email, EMAIL_ACTIONS.VERIFY_USER);
};

const create = async (payload) => {
    let transaction;

    try {
        if (payload.invite) {
            logger('debug', `Check if invite is still valid: ${payload.invite}`);
            const res = await inviteRepo.findOne({
                where: { id: payload.invite }
            });

            if (!res) {
                logger('debug', `Invite not found in database for ${payload.invite}`);
                throw CustomError(STATUS_CODE.NOT_FOUND, 'Invite is not valid. Please contact the provider.');
            }
        }

        const phoneNumber = String(payload.phoneNumber);
        const existingUser = await userRepo.findOne({ where: { email: payload.email } });

        if (existingUser) {
            if (existingUser.status === USER_STATUS[1]) {
                if (isDev) {
                    logger('info', `Auto-activating unverified user in development: ${payload.email}`);
                    await activateUser(existingUser.id);
                    return { ...existingUser, status: USER_STATUS[0] };
                }

                logger('info', `Resending verification email for unverified user: ${payload.email}`);
                try {
                    await sendVerificationEmail(existingUser);
                } catch (emailError) {
                    logger('error', `Verification email failed for ${payload.email}: ${emailError.message}`);
                    if (env.app.env === 'production') {
                        throw CustomError(
                            STATUS_CODE.SERVICE_UNAVAILABLE,
                            'Verification email could not be sent. Please try again later.'
                        );
                    }
                }
                return existingUser;
            }

            throw CustomError(STATUS_CODE.CONFLICT, 'Email already registered');
        }

        const existingPhone = await userRepo.findOne({ where: { phoneNumber } });
        if (existingPhone) {
            throw CustomError(STATUS_CODE.CONFLICT, 'Phone number already registered');
        }

        const user = {
            id: uuidv4(),
            firstName: payload.firstName,
            lastName: payload.lastName,
            phoneNumber,
            email: payload.email,
            password: await encryptPassword(payload.password),
            status: USER_STATUS[0],
            role: payload.invite ? USER_ROLES[1] : USER_ROLES[0]
        };

        if (!payload.invite) {
            user.recoveryCodeHash = await hashRecoveryCode(payload.recoveryCode);
            user.trialStartAt = moment().toISOString();
            user.trialEndAt = moment().add(2, 'minutes').toISOString();
            user.subscriptionStatus = 'TRIAL';
        }

        transaction = await db.users.sequelize.transaction();

        const data = await userRepo.save(user, { transaction });
        logger('info', 'User details saved successfully', { userId: user.id, role: user.role });

        if (payload.invite) {
            logger('debug', `Updating invite status for invite ID: ${payload.invite}`);
            await inviteRepo.update({ id: payload.invite }, { status: INVITE_STATUS[1], userId: user.id });
        }

        const preferences = {
            id: uuidv4(),
            userId: user.id,
            notification: NOTIFICATION_PREFERENCE[0],
            payment: PAYMENT_PREFERENCE[0],
            orders: ORDER_PREFERENCE[1]
        };
        await preferencesRepo.save(preferences, { transaction });
        logger('info', 'User preferences saved successfully', { userId: user.id });

        await transaction.commit();
        transaction = null;

        // Email verification is disabled; accounts are active instantly.
        logger('info', `Skipping email verification for ${user.email}`);

        const response = sanitizeUser(data);
        return isDev ? { ...response, status: USER_STATUS[0] } : response;
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }

        logger('error', `Error occurred during user creation: ${error}`);
        if (isCustomError(error)) {
            throw error;
        }
        throw mapSequelizeError(error);
    }
};

const login = async (payload) => {
    try {
        const { password, role } = payload;
        const email = String(payload.email || '')
            .trim()
            .toLowerCase();

        logger('debug', `Login request received for email: ${email}`);
        const user = await userRepo.findOne({ where: { email } });

        if (!user) {
            logger('error', `Email ${email} not registered.`);
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Email not registered');
        }

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            logger('error', 'Invalid password provided.');
            throw CustomError(STATUS_CODE.UNAUTHORIZED, 'Invalid password');
        }

        // Migrate old AES-encrypted passwords to bcrypt after a successful login.
        if (!isBcryptHash(user.password)) {
            await userRepo.update({ where: { id: user.id } }, { password: await hashPassword(password) });
        }

        // Validate that selected role matches user's actual role (case-insensitive)
        if (String(user.role).toUpperCase() !== String(role).toUpperCase()) {
            logger('error', `Role mismatch for user ${email}. Selected: ${role}, Actual: ${user.role}`);
            // Return a clear, actionable message to the client
            throw CustomError(STATUS_CODE.FORBIDDEN, `You are not authorized as ${role}`);
        }

        // Verification checks are removed; users can login immediately.

        const { id, firstName, lastName, phoneNumber } = user;
        let managerHotelId = null;
        if (user.role === USER_ROLES[1]) {
            managerHotelId = await getAssignedHotelId(id);
            if (!managerHotelId) {
                logger('error', `Manager ${id} has no assigned hotel`);
                throw CustomError(STATUS_CODE.FORBIDDEN, 'Manager is not assigned to any cafe');
            }
        }

        const sessionPayload = { role: user.role };
        if (managerHotelId) {
            sessionPayload.hotelId = managerHotelId;
        }
        const data = CryptoJS.AES.encrypt(JSON.stringify(sessionPayload), env.cryptoSecret).toString();

        const tokenPayload = {
            id,
            firstName,
            lastName,
            status: user.status,
            phoneNumber,
            role: user.role,
            tokenVersion: Number(user.tokenVersion || 0)
        };
        if (managerHotelId) {
            tokenPayload.hotelId = managerHotelId;
        }
        const token = jwt.sign(tokenPayload, env.jwtSecret, { expiresIn: '18h' });

        return { token, data };
    } catch (error) {
        logger('error', `Error occurred during login: ${error.message}`);
        throw CustomError(error.code, error.message);
    }
};

const verify = async (payload) => {
    try {
        const { email, expires } = payload;
        logger('debug', `Verifying user with email: ${email}`);

        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            logger('error', 'User not found for verification.');
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Invalid request');
        }

        if (user.status === USER_STATUS[0]) {
            logger('error', 'User is already verified.');
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'User already verified Please try login');
        }

        if (moment().valueOf() > expires) {
            logger('info', 'Verification link expired. Resending email for verification.');
            const verifyOptions = {
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                expires: moment().add(1, 'hour').valueOf()
            };
            const token = CryptoJS.AES.encrypt(JSON.stringify(verifyOptions), env.cryptoSecret).toString();
            await sendEmail({ token: encodeURIComponent(token) }, user.email, EMAIL_ACTIONS.VERIFY_USER);
            throw CustomError(
                STATUS_CODE.GONE,
                `Sorry, the link has expired. We've sent a new one to your email. Please check and try again.`
            );
        }

        user.status = USER_STATUS[0];
        await userRepo.update({ where: { id: user.id } }, { status: USER_STATUS[0] });

        const { id, firstName, lastName, phoneNumber, role } = user;
        const data = CryptoJS.AES.encrypt(JSON.stringify({ role }), env.cryptoSecret).toString();

        const token = jwt.sign(
            {
                id,
                firstName,
                lastName,
                status: user.status,
                phoneNumber,
                role: user.role,
                tokenVersion: Number(user.tokenVersion || 0)
            },
            env.jwtSecret,
            { expiresIn: '12h' }
        );

        return { token, data };
    } catch (error) {
        logger('error', `Error occurred during user verification: ${error.message}`);
        throw CustomError(error.code, error.message);
    }
};

const forget = async (payload) => {
    try {
        const { email } = payload;
        logger('debug', `Initiating forgot password for email: ${email}`);

        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            logger('error', 'User not found with the provided email.');
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid Email');
        }

        // Verification checks are removed.

        if (isDev) {
            logger('info', `Skipping forgot-password email in development for ${email}`);
            return { message: 'Password recovery is disabled in development. Use your existing password to log in.' };
        }

        const verifyOptions = {
            email: user.email,
            expires: moment().add(1, 'hour').valueOf()
        };

        const token = CryptoJS.AES.encrypt(JSON.stringify(verifyOptions), env.cryptoSecret).toString();

        logger('info', 'Sending verification email for forgot password');
        await sendEmail({ token: encodeURIComponent(token) }, user.email, EMAIL_ACTIONS.FORGOT_PASSWORD);

        return { message: 'Recover password link sent. Please check your email.' };
    } catch (error) {
        logger('error', `Error occurred during forgot password process: ${error.message}`);
        throw CustomError(error.code, error.message);
    }
};

const reset = async (payload) => {
    try {
        const { email, newPassword, expires } = payload;
        logger('debug', `Initiating password reset for email: ${email}`);

        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            logger('error', 'User not found for password reset.');
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid request');
        }

        // Verification checks are removed.

        if (isDev) {
            await userRepo.update(
                { where: { id: user.id } },
                { password: await encryptPassword(newPassword), status: USER_STATUS[0] }
            );
            return { message: 'Password reset successfully' };
        }

        if (moment().valueOf() > expires) {
            logger('info', 'Password reset link expired. Resending email for password reset.');
            const options = {
                email: user.email,
                password: user.password,
                expires: moment().add(1, 'hour').valueOf()
            };
            const token = CryptoJS.AES.encrypt(JSON.stringify(options), env.cryptoSecret).toString();
            await sendEmail({ token: encodeURIComponent(token) }, user.email, EMAIL_ACTIONS.FORGOT_PASSWORD);
            throw CustomError(
                STATUS_CODE.GONE,
                `Sorry, the link has expired. We've sent a new one to your email. Please check and try again.`
            );
        }

        await userRepo.update({ where: { id: user.id } }, { password: await encryptPassword(newPassword) });
        return { message: 'Password reset successfully' };
    } catch (error) {
        logger('error', `Error occurred during password reset process: ${error.message}`);
        throw CustomError(error.code, error.message);
    }
};

const resetOwnerPassword = async (payload) => {
    let transaction;

    try {
        const email = String(payload.email || '')
            .trim()
            .toLowerCase();
        transaction = await db.users.sequelize.transaction();
        const user = await db.users.findOne({
            where: {
                email,
                role: USER_ROLES[0],
                status: USER_STATUS[0],
                isBlocked: false
            },
            attributes: [
                'id',
                'recoveryCodeHash',
                'recoveryCodeFailedAttempts',
                'recoveryCodeLockedUntil',
                'tokenVersion'
            ],
            transaction,
            lock: transaction.LOCK?.UPDATE
        });

        if (!user) {
            await safeDummyRecoveryCodeComparison(payload.recoveryCode);
            await transaction.commit();
            transaction = null;
            throw CustomError(STATUS_CODE.UNAUTHORIZED, OWNER_RECOVERY_ERROR);
        }

        const now = new Date();
        if (user.recoveryCodeLockedUntil && new Date(user.recoveryCodeLockedUntil) > now) {
            await safeDummyRecoveryCodeComparison(payload.recoveryCode);
            await transaction.commit();
            transaction = null;
            throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, OWNER_RECOVERY_ERROR);
        }

        const isValidCode = await compareRecoveryCode(payload.recoveryCode, user.recoveryCodeHash);
        if (!isValidCode || !user.recoveryCodeHash) {
            const lockExpired =
                user.recoveryCodeLockedUntil && new Date(user.recoveryCodeLockedUntil).getTime() <= now.getTime();
            const previousAttempts = lockExpired ? 0 : Number(user.recoveryCodeFailedAttempts || 0);
            const failedAttempts = previousAttempts + 1;
            const recoveryCodeLockedUntil =
                failedAttempts >= OWNER_RECOVERY_MAX_ATTEMPTS
                    ? moment(now).add(OWNER_RECOVERY_LOCK_MINUTES, 'minutes').toDate()
                    : null;

            await db.users.update(
                {
                    recoveryCodeFailedAttempts: failedAttempts,
                    recoveryCodeLockedUntil
                },
                { where: { id: user.id }, transaction }
            );
            await transaction.commit();
            transaction = null;
            throw CustomError(STATUS_CODE.UNAUTHORIZED, OWNER_RECOVERY_ERROR);
        }

        await db.users.update(
            {
                password: await encryptPassword(payload.newPassword),
                passwordChangedAt: now,
                tokenVersion: Number(user.tokenVersion || 0) + 1,
                recoveryCodeFailedAttempts: 0,
                recoveryCodeLockedUntil: null
            },
            { where: { id: user.id }, transaction }
        );

        await transaction.commit();
        transaction = null;
        return { message: 'Password reset successfully. Please login with your new password.' };
    } catch (error) {
        if (transaction) await transaction.rollback();
        if (isCustomError(error)) throw error;
        throw CustomError(STATUS_CODE.INTERNAL_SERVER_ERROR, 'Unable to reset password. Please try again.');
    }
};

const setRecoveryCode = async (ownerId, payload) => {
    try {
        const user = await db.users.findOne({
            where: { id: ownerId, role: USER_ROLES[0], status: USER_STATUS[0] },
            attributes: ['id', 'password', 'recoveryCodeHash', 'tokenVersion']
        });

        if (!user) throw CustomError(STATUS_CODE.NOT_FOUND, 'Owner account not found.');

        const validPassword = await comparePassword(payload.currentPassword, user.password);
        if (!validPassword) throw CustomError(STATUS_CODE.UNAUTHORIZED, 'Current password is incorrect.');

        const wasConfigured = Boolean(user.recoveryCodeHash);
        const updateData = {
            recoveryCodeHash: await hashRecoveryCode(payload.recoveryCode),
            recoveryCodeFailedAttempts: 0,
            recoveryCodeLockedUntil: null
        };

        if (payload.invalidateSessions) {
            updateData.tokenVersion = Number(user.tokenVersion || 0) + 1;
        }

        await db.users.update(updateData, { where: { id: user.id } });
        return {
            message: wasConfigured ? 'Recovery code changed successfully.' : 'Recovery code created successfully.',
            recoveryCodeConfigured: true,
            sessionsInvalidated: Boolean(payload.invalidateSessions)
        };
    } catch (error) {
        if (isCustomError(error)) throw error;
        throw CustomError(error.code, error.message);
    }
};

const invite = async (payload) => {
    try {
        const { email } = payload;

        if (!email) {
            logger('error', 'Invite payload missing email', { payload });
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Email is required to create an invite');
        }

        const user = await userRepo.findOne({ where: { email } });
        if (user) {
            logger('error', 'Email already registered', { email });
            throw CustomError(STATUS_CODE.CONFLICT, 'Email already registered');
        }

        const data = {
            id: uuidv4(),
            email: payload.email,
            status: INVITE_STATUS[0],
            ownerId: payload.owner
        };
        // save the invite details to the database
        const inviteData = await inviteRepo.save(data);

        const options = {
            email,
            inviteId: inviteData.id,
            expires: moment().add(1, 'hour').valueOf()
        };

        const token = CryptoJS.AES.encrypt(JSON.stringify(options), env.cryptoSecret).toString();
        await sendEmail({ token: encodeURIComponent(token), name: payload.name }, email, EMAIL_ACTIONS.INVITE_MANAGER);
        logger('info', 'Invite link sent successfully', { email });

        return { message: 'Invite link sent' };
    } catch (error) {
        logger('error', 'Error while sending invitation', { error });
        throw CustomError(error.code, error.message);
    }
};

const listInvites = async (payload) => {
    try {
        const { owner, limit, skip, sortKey, sortOrder, filterKey, filterValue } = payload;
        const defaults = {
            sortKey: 'updatedAt',
            sortOrder: 'DESC',
            limit: 10,
            offset: 0
        };

        let where = { ownerId: owner };
        if (filterKey && filterValue) {
            where = {
                [Op.and]: [
                    { ownerId: owner },
                    {
                        [filterKey]: {
                            [Op.like]: `%${filterValue}%`
                        }
                    }
                ]
            };
        }

        const options = {
            where,
            order: [[sortKey || defaults.sortKey, sortOrder || defaults.sortOrder]],
            offset: Number(skip) || defaults.offset,
            limit: Number(limit) || defaults.limit
        };
        logger('debug', 'Fetching invites with options:', { options });

        return await inviteRepo.find(options);
    } catch (error) {
        logger('error', 'Error while fetching invites', { error });
        throw CustomError(error.code, error.message);
    }
};

const removeInvite = async (id) => {
    try {
        const data = await inviteRepo.find({ where: { id } });
        if (!data.rows.length) {
            logger('error', 'Invited user not found', { id });
            await inviteRepo.remove({ where: { id } });
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Invited user not found');
        }

        if (data.rows[0].status === INVITE_STATUS[1]) {
            logger('error', 'Invited user is active', { id });
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invited user is active');
        }

        const options = {
            where: {
                id,
                status: INVITE_STATUS[0]
            }
        };
        await inviteRepo.remove(options);
        return { message: 'Invite deleted successfully' };
    } catch (error) {
        logger('error', 'Error while removing invite', { id, error });
        throw CustomError(error.code, error.message);
    }
};

const getUser = async (user) => {
    try {
        const { id } = user;

        const fetchOptions = {
            where: { id },
            attributes: [
                'id',
                'firstName',
                'lastName',
                'email',
                'phoneNumber',
                'role',
                'trialStartAt',
                'trialEndAt',
                'subscriptionStartAt',
                'subscriptionEndAt',
                'subscriptionStatus',
                'subscriptionPlan',
                'razorpayOrderId',
                'razorpayPaymentId'
            ],
            include: [
                {
                    model: db.preferences,
                    attributes: ['notification', 'payment', 'orders']
                }
            ]
        };
        const result = await userRepo.findOne(fetchOptions);
        const recoveryState =
            result.role === USER_ROLES[0]
                ? await db.users.findOne({ where: { id }, attributes: ['recoveryCodeHash'] })
                : null;
        result.recoveryCodeConfigured = result.role === USER_ROLES[0] ? Boolean(recoveryState?.recoveryCodeHash) : true;
        result.hotelId = null;
        if (result.role === USER_ROLES[1]) {
            result.hotelId = await getAssignedHotelId(id);
        }
        return result;
    } catch (error) {
        logger('error', 'Error while getting user details', { id: user.id, error });
        throw CustomError(error.code, error.message);
    }
};

const update = async (id, payload) => {
    try {
        const options = { where: { id } };
        const { preferences, ...rest } = payload;

        logger('debug', `Preferences options : ${JSON.stringify(preferences)}`);
        logger('debug', `User updates : ${JSON.stringify(rest)}`);

        if (rest.password) {
            rest.password = await encryptPassword(rest.password);
        }

        const updateData = await userRepo.update(options, rest);
        logger('debug', `${id} User updated successfully with status ${updateData[0]}`);

        const preferenceOptions = { where: { userId: id } };
        await preferencesRepo.update(preferenceOptions, preferences);
        logger('debug', `${id} User preferences updated successfully`);

        const fetchOptions = {
            where: { id },
            attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'role'],
            include: [
                {
                    model: db.preferences,
                    attributes: ['notification', 'payment', 'orders']
                }
            ]
        };
        return await userRepo.findOne(fetchOptions);
    } catch (error) {
        logger('error', `Error while updating user details ${id} ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export default {
    create,
    login,
    verify,
    forget,
    reset,
    resetOwnerPassword,
    setRecoveryCode,
    invite,
    listInvites,
    removeInvite,
    getUser,
    update
};
