import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { ADMIN_OTP_PURPOSES, ADMIN_OTP_STAGES } from '../models/adminOtpChallenge.model.js';
import { USER_ROLES, USER_STATUS } from '../models/user.model.js';
import userRepo from '../repositories/user.repository.js';
import { EMAIL_ACTIONS, CustomError, STATUS_CODE } from '../utils/common.js';
import { comparePassword, hashPassword, isBcryptHash } from '../utils/password.js';
import { sendEmail } from './email.service.js';
import { createLoginSession } from './user.service.js';

const OTP_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const purposeLabels = {
    LOGIN: 'your admin login',
    CURRENT_EMAIL: 'your current email verification',
    NEW_EMAIL: 'your new email verification',
    PASSWORD: 'your admin password change'
};

const normalizeEmail = (value) =>
    String(value || '')
        .trim()
        .toLowerCase();

const maskEmail = (email) => {
    const [name = '', domain = ''] = normalizeEmail(email).split('@');
    const visible = name.slice(0, Math.min(2, name.length));
    return `${visible}${'*'.repeat(Math.max(3, name.length - visible.length))}@${domain}`;
};

const readPassword = (value) => {
    const rawValue = String(value || '');
    if (!rawValue || !env.cryptoSecret) return rawValue;

    try {
        // Backward compatibility for an older frontend that encrypted password
        // fields with the public frontend key. Current clients send passwords
        // over HTTPS and the server stores only bcrypt hashes.
        return CryptoJS.AES.decrypt(rawValue, env.cryptoSecret).toString(CryptoJS.enc.Utf8) || rawValue;
    } catch (_error) {
        return rawValue;
    }
};

const generateOtp = () => String(crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH));

const hashOtp = ({ challengeId, purpose, stage, otp }) =>
    crypto
        .createHmac('sha256', env.adminAuth.otpHashSecret)
        .update(`${challengeId}:${purpose}:${stage}:${otp}`)
        .digest('hex');

const isMatchingOtp = (challenge, otp) => {
    const expected = Buffer.from(challenge.otpHash, 'hex');
    const received = Buffer.from(
        hashOtp({ challengeId: challenge.id, purpose: challenge.purpose, stage: challenge.stage, otp }),
        'hex'
    );
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

const getAdmin = async (adminId) => {
    const admin = await userRepo.findOne({ where: { id: adminId, role: USER_ROLES[2] }, raw: true });
    if (!admin) throw CustomError(STATUS_CODE.NOT_FOUND, 'Admin account not found');
    return admin;
};

const sendOtp = async ({ admin, email, otp, stage }) =>
    sendEmail(
        {
            name: `${admin.firstName || 'Admin'} ${admin.lastName || ''}`.trim(),
            otp,
            purposeLabel: purposeLabels[stage] || 'this security request',
            expiryMinutes: env.adminAuth.otpExpiryMinutes
        },
        email,
        EMAIL_ACTIONS.ADMIN_OTP
    );

const sendSecurityNotice = async ({ to, actionLabel, detail }) => {
    try {
        await sendEmail(
            { actionLabel, detail, timestamp: new Date().toISOString() },
            to,
            EMAIL_ACTIONS.ADMIN_SECURITY_NOTICE
        );
    } catch (error) {
        logger('error', 'Admin security notification email failed', { error: error.message });
    }
};

const publicChallenge = (challenge) => ({
    challengeId: challenge.id,
    maskedEmail: maskEmail(challenge.targetEmail),
    phase: challenge.stage,
    expiresInSeconds: env.adminAuth.otpExpiryMinutes * 60,
    resendAfterSeconds: env.adminAuth.resendCooldownSeconds
});

const createChallenge = async ({ admin, purpose, stage, targetEmail, pendingValue = null, metadata = {} }) => {
    await db.adminOtpChallenges.destroy({
        where: { adminId: admin.id, purpose, consumedAt: null }
    });

    const id = uuidv4();
    const otp = generateOtp();
    const now = new Date();
    const challenge = await db.adminOtpChallenges.create({
        id,
        adminId: admin.id,
        purpose,
        stage,
        targetEmail,
        pendingValue,
        otpHash: hashOtp({ challengeId: id, purpose, stage, otp }),
        expiresAt: new Date(now.getTime() + env.adminAuth.otpExpiryMinutes * 60 * 1000),
        lastSentAt: now,
        attempts: 0,
        sendCount: 1,
        ipAddress: String(metadata.ipAddress || '').slice(0, 64) || null,
        userAgent: String(metadata.userAgent || '').slice(0, 255) || null
    });

    try {
        await sendOtp({ admin, email: targetEmail, otp, stage });
    } catch (error) {
        await challenge.destroy();
        throw error;
    }

    return publicChallenge(challenge);
};

const findChallenge = async ({ challengeId, adminId, purpose }) => {
    const where = { id: String(challengeId || ''), consumedAt: null };
    if (adminId) where.adminId = adminId;
    if (purpose) where.purpose = purpose;
    const challenge = await db.adminOtpChallenges.findOne({ where });
    if (!challenge) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid or expired verification request');
    return challenge;
};

const validateOtp = async (challenge, rawOtp) => {
    const otp = String(rawOtp || '').trim();
    if (!/^\d{6}$/.test(otp)) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Enter a valid 6-digit OTP');
    if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
        throw CustomError(STATUS_CODE.GONE, 'OTP expired. Request a new code.');
    }
    if (Number(challenge.attempts || 0) >= env.adminAuth.maxAttempts) {
        throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, 'Too many incorrect attempts. Request a new code.');
    }
    if (!isMatchingOtp(challenge, otp)) {
        const attempts = Number(challenge.attempts || 0) + 1;
        await challenge.update({ attempts });
        const left = Math.max(0, env.adminAuth.maxAttempts - attempts);
        throw CustomError(STATUS_CODE.UNAUTHORIZED, `Incorrect OTP. ${left} attempt(s) left.`);
    }
};

const resend = async ({ challengeId }) => {
    const challenge = await findChallenge({ challengeId });
    const sinceLastSend = Math.floor((Date.now() - new Date(challenge.lastSentAt).getTime()) / 1000);
    if (sinceLastSend < env.adminAuth.resendCooldownSeconds) {
        throw CustomError(
            STATUS_CODE.TOO_MANY_REQUEST,
            `Please wait ${env.adminAuth.resendCooldownSeconds - sinceLastSend} seconds before resending.`
        );
    }
    if (Number(challenge.sendCount || 0) >= env.adminAuth.maxSends) {
        throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, 'OTP resend limit reached. Start again later.');
    }

    const admin = await getAdmin(challenge.adminId);
    const otp = generateOtp();
    const now = new Date();
    await challenge.update({
        otpHash: hashOtp({
            challengeId: challenge.id,
            purpose: challenge.purpose,
            stage: challenge.stage,
            otp
        }),
        expiresAt: new Date(now.getTime() + env.adminAuth.otpExpiryMinutes * 60 * 1000),
        lastSentAt: now,
        attempts: 0,
        sendCount: Number(challenge.sendCount || 0) + 1
    });
    await sendOtp({ admin, email: challenge.targetEmail, otp, stage: challenge.stage });
    return publicChallenge(challenge);
};

const startLogin = async ({ email, password }, metadata) => {
    const normalizedEmail = normalizeEmail(email);
    const plainPassword = readPassword(password);
    const admin = await userRepo.findOne({ where: { email: normalizedEmail, role: USER_ROLES[2] }, raw: true });

    if (!admin || !(await comparePassword(plainPassword, admin.password))) {
        throw CustomError(STATUS_CODE.UNAUTHORIZED, 'Invalid email or password');
    }
    if (admin.status !== USER_STATUS[0] || admin.isBlocked) {
        throw CustomError(STATUS_CODE.FORBIDDEN, 'Admin account is not active');
    }
    if (!isBcryptHash(admin.password)) {
        await userRepo.update({ where: { id: admin.id } }, { password: await hashPassword(plainPassword) });
    }

    return createChallenge({
        admin,
        purpose: ADMIN_OTP_PURPOSES[0],
        stage: ADMIN_OTP_STAGES[0],
        targetEmail: admin.email,
        metadata
    });
};

const verifyLogin = async ({ challengeId, otp }) => {
    const challenge = await findChallenge({ challengeId, purpose: ADMIN_OTP_PURPOSES[0] });
    await validateOtp(challenge, otp);
    const admin = await getAdmin(challenge.adminId);
    await challenge.update({ consumedAt: new Date() });

    const session = await createLoginSession(admin, { expiresIn: env.adminAuth.tokenExpiry });
    sendSecurityNotice({
        to: admin.email,
        actionLabel: 'Admin login completed',
        detail: `A secure admin login was completed. IP: ${challenge.ipAddress || 'Unavailable'}.`
    });
    return session;
};

const requestEmailChange = async (adminId, { currentPassword, newEmail }, metadata) => {
    const admin = await getAdmin(adminId);
    const plainCurrentPassword = readPassword(currentPassword);
    if (!(await comparePassword(plainCurrentPassword, admin.password))) {
        throw CustomError(STATUS_CODE.UNAUTHORIZED, 'Current password is incorrect');
    }

    const normalizedNewEmail = normalizeEmail(newEmail);
    if (!EMAIL_PATTERN.test(normalizedNewEmail)) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Enter a valid new email');
    if (normalizedNewEmail === normalizeEmail(admin.email)) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'New email must be different from current email');
    }
    const existing = await userRepo.findOne({ where: { email: normalizedNewEmail }, raw: true });
    if (existing) throw CustomError(STATUS_CODE.CONFLICT, 'Email is already registered');

    return createChallenge({
        admin,
        purpose: ADMIN_OTP_PURPOSES[1],
        stage: ADMIN_OTP_STAGES[1],
        targetEmail: admin.email,
        pendingValue: normalizedNewEmail,
        metadata
    });
};

const verifyEmailChange = async (adminId, { challengeId, otp }) => {
    const challenge = await findChallenge({
        challengeId,
        adminId,
        purpose: ADMIN_OTP_PURPOSES[1]
    });
    await validateOtp(challenge, otp);
    const admin = await getAdmin(adminId);

    if (challenge.stage === ADMIN_OTP_STAGES[1]) {
        const nextOtp = generateOtp();
        const now = new Date();
        await challenge.update({
            stage: ADMIN_OTP_STAGES[2],
            targetEmail: challenge.pendingValue,
            otpHash: hashOtp({
                challengeId: challenge.id,
                purpose: challenge.purpose,
                stage: ADMIN_OTP_STAGES[2],
                otp: nextOtp
            }),
            expiresAt: new Date(now.getTime() + env.adminAuth.otpExpiryMinutes * 60 * 1000),
            lastSentAt: now,
            attempts: 0,
            sendCount: 1
        });
        await sendOtp({ admin, email: challenge.pendingValue, otp: nextOtp, stage: ADMIN_OTP_STAGES[2] });
        return publicChallenge(challenge);
    }

    if (challenge.stage !== ADMIN_OTP_STAGES[2]) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid email verification stage');
    }

    const existing = await userRepo.findOne({ where: { email: challenge.pendingValue }, raw: true });
    if (existing && existing.id !== adminId) throw CustomError(STATUS_CODE.CONFLICT, 'Email is already registered');

    const oldEmail = admin.email;
    const tokenVersion = Number(admin.tokenVersion || 0) + 1;
    await userRepo.update({ where: { id: adminId } }, { email: challenge.pendingValue, tokenVersion });
    await challenge.update({ consumedAt: new Date() });

    const detail = `Admin login email changed from ${oldEmail} to ${challenge.pendingValue}. All previous sessions were signed out.`;
    Promise.allSettled([
        sendSecurityNotice({ to: oldEmail, actionLabel: 'Admin email changed', detail }),
        sendSecurityNotice({ to: challenge.pendingValue, actionLabel: 'Admin email activated', detail })
    ]);

    return { success: true, message: 'Admin email changed successfully', logoutRequired: true };
};

const isStrongPassword = (value) =>
    String(value).length >= 12 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value);

const requestPasswordChange = async (adminId, payload, metadata) => {
    const admin = await getAdmin(adminId);
    const currentPassword = readPassword(payload.currentPassword);
    const newPassword = readPassword(payload.newPassword);
    const confirmPassword = readPassword(payload.confirmPassword);

    if (!(await comparePassword(currentPassword, admin.password))) {
        throw CustomError(STATUS_CODE.UNAUTHORIZED, 'Current password is incorrect');
    }
    if (newPassword !== confirmPassword) throw CustomError(STATUS_CODE.BAD_REQUEST, 'New passwords do not match');
    if (!isStrongPassword(newPassword)) {
        throw CustomError(
            STATUS_CODE.BAD_REQUEST,
            'Use at least 12 characters with uppercase, lowercase, number and special character'
        );
    }
    if (await comparePassword(newPassword, admin.password)) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'New password must be different from current password');
    }

    return createChallenge({
        admin,
        purpose: ADMIN_OTP_PURPOSES[2],
        stage: ADMIN_OTP_STAGES[3],
        targetEmail: admin.email,
        pendingValue: await hashPassword(newPassword),
        metadata
    });
};

const verifyPasswordChange = async (adminId, { challengeId, otp }) => {
    const challenge = await findChallenge({
        challengeId,
        adminId,
        purpose: ADMIN_OTP_PURPOSES[2]
    });
    await validateOtp(challenge, otp);
    if (challenge.stage !== ADMIN_OTP_STAGES[3]) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid password verification stage');
    }

    const admin = await getAdmin(adminId);
    await userRepo.update(
        { where: { id: adminId } },
        {
            password: challenge.pendingValue,
            passwordChangedAt: new Date(),
            tokenVersion: Number(admin.tokenVersion || 0) + 1
        }
    );
    await challenge.update({ consumedAt: new Date() });
    sendSecurityNotice({
        to: admin.email,
        actionLabel: 'Admin password changed',
        detail: 'Your RC DINE admin password was changed and all previous sessions were signed out.'
    });

    return { success: true, message: 'Admin password changed successfully', logoutRequired: true };
};

export default {
    startLogin,
    verifyLogin,
    resend,
    requestEmailChange,
    verifyEmailChange,
    requestPasswordChange,
    verifyPasswordChange
};
