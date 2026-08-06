import { Op, col, fn, where } from 'sequelize';
import { db } from '../../config/database.js';
import { USER_ROLES, USER_STATUS } from '../models/user.model.js';
import { CustomError, STATUS_CODE, isCustomError } from '../utils/common.js';
import { comparePassword } from '../utils/password.js';

const DUPLICATE_EMAIL_MESSAGE = 'This email is already registered.';

const changeEmail = async (ownerId, payload) => {
    let transaction;

    try {
        const newEmail = String(payload.newEmail || '')
            .trim()
            .toLowerCase();
        const confirmEmail = String(payload.confirmEmail || '')
            .trim()
            .toLowerCase();

        if (newEmail !== confirmEmail) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'New email and confirmation must match.');
        }

        transaction = await db.users.sequelize.transaction();
        const owner = await db.users.findOne({
            where: { id: ownerId, role: USER_ROLES[0], status: USER_STATUS[0] },
            attributes: ['id', 'email', 'password', 'tokenVersion'],
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!owner) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Owner account not found.');
        }

        const validPassword = await comparePassword(payload.currentPassword, owner.password);
        if (!validPassword) {
            throw CustomError(STATUS_CODE.UNAUTHORIZED, 'Current password is incorrect.');
        }

        if (String(owner.email || '').trim().toLowerCase() === newEmail) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'New email must be different from your current email.');
        }

        const existingAccount = await db.users.findOne({
            where: {
                id: { [Op.ne]: owner.id },
                [Op.and]: where(fn('LOWER', col('email')), newEmail)
            },
            attributes: ['id'],
            paranoid: false,
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (existingAccount) {
            throw CustomError(STATUS_CODE.CONFLICT, DUPLICATE_EMAIL_MESSAGE);
        }

        await db.users.update(
            {
                email: newEmail,
                tokenVersion: Number(owner.tokenVersion || 0) + 1
            },
            { where: { id: owner.id }, transaction }
        );

        await transaction.commit();
        transaction = null;

        return {
            success: true,
            message: 'Email updated successfully. Please sign in again.'
        };
    } catch (error) {
        if (transaction) await transaction.rollback();
        if (isCustomError(error)) throw error;
        if (error?.name === 'SequelizeUniqueConstraintError') {
            throw CustomError(STATUS_CODE.CONFLICT, DUPLICATE_EMAIL_MESSAGE);
        }
        throw CustomError(STATUS_CODE.INTERNAL_SERVER_ERROR, 'Unable to update email. Please try again.');
    }
};

export default { changeEmail };
