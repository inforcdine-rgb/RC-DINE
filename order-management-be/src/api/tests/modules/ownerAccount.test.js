import { db } from '../../../config/database.js';
import { ownerAuthentication } from '../../middlewares/roleAuth.js';
import ownerAccountService from '../../services/ownerAccount.service.js';
import { hashPassword } from '../../utils/password.js';
import { changeOwnerEmailValidation } from '../../validations/ownerAccount.validation.js';

jest.mock('../../../config/database.js', () => ({
    db: {
        users: {
            findOne: jest.fn(),
            update: jest.fn(),
            sequelize: { transaction: jest.fn() }
        }
    }
}));

jest.mock('../../../config/env.js', () => ({
    __esModule: true,
    default: {
        cryptoSecret: 'test-secret',
        jwtSecret: 'test-jwt-secret',
        app: { isDevelopment: false, env: 'test' }
    }
}));

describe('OWNER account email change', () => {
    let passwordHash;
    let transaction;

    beforeAll(async () => {
        passwordHash = await hashPassword('Strong@123');
    });

    beforeEach(() => {
        transaction = {
            LOCK: { UPDATE: 'UPDATE' },
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };
        db.users.sequelize.transaction.mockResolvedValue(transaction);
        db.users.findOne.mockReset();
        db.users.update.mockReset().mockResolvedValue([1]);
    });

    const owner = () => ({
        id: 'owner-1',
        email: 'owner@example.com',
        password: passwordHash,
        tokenVersion: 4,
        role: 'OWNER',
        status: 'ACTIVE'
    });

    test('correct password normalizes email and invalidates the active session', async () => {
        db.users.findOne.mockResolvedValueOnce(owner()).mockResolvedValueOnce(null);

        const result = await ownerAccountService.changeEmail('owner-1', {
            currentPassword: 'Strong@123',
            newEmail: '  NEW.Owner@Example.COM ',
            confirmEmail: 'new.owner@example.com'
        });

        expect(result).toEqual({
            success: true,
            message: 'Email updated successfully. Please sign in again.'
        });
        expect(db.users.update).toHaveBeenCalledWith(
            { email: 'new.owner@example.com', tokenVersion: 5 },
            { where: { id: 'owner-1' }, transaction }
        );
        expect(transaction.commit).toHaveBeenCalledTimes(1);
    });

    test('wrong password does not update email', async () => {
        db.users.findOne.mockResolvedValueOnce(owner());

        await expect(
            ownerAccountService.changeEmail('owner-1', {
                currentPassword: 'Wrong@123',
                newEmail: 'new@example.com',
                confirmEmail: 'new@example.com'
            })
        ).rejects.toMatchObject({ code: 401, message: 'Current password is incorrect.' });
        expect(db.users.update).not.toHaveBeenCalled();
        expect(transaction.rollback).toHaveBeenCalledTimes(1);
    });

    test('case-insensitive duplicate email is rejected', async () => {
        db.users.findOne.mockResolvedValueOnce(owner()).mockResolvedValueOnce({ id: 'manager-1' });

        await expect(
            ownerAccountService.changeEmail('owner-1', {
                currentPassword: 'Strong@123',
                newEmail: 'MANAGER@EXAMPLE.COM',
                confirmEmail: 'manager@example.com'
            })
        ).rejects.toMatchObject({ code: 409, message: 'This email is already registered.' });
        expect(db.users.update).not.toHaveBeenCalled();
    });

    test('current email cannot be reused with different casing', async () => {
        db.users.findOne.mockResolvedValueOnce(owner());

        await expect(
            ownerAccountService.changeEmail('owner-1', {
                currentPassword: 'Strong@123',
                newEmail: 'OWNER@EXAMPLE.COM',
                confirmEmail: 'owner@example.com'
            })
        ).rejects.toMatchObject({ code: 400, message: 'New email must be different from your current email.' });
        expect(db.users.update).not.toHaveBeenCalled();
    });

    test('invalid and mismatched emails fail request validation', () => {
        expect(
            changeOwnerEmailValidation({
                currentPassword: 'Strong@123',
                newEmail: 'invalid-email',
                confirmEmail: 'invalid-email'
            }).error
        ).toBeDefined();
        expect(
            changeOwnerEmailValidation({
                currentPassword: 'Strong@123',
                newEmail: 'new@example.com',
                confirmEmail: 'other@example.com'
            }).error?.message
        ).toBe('New email and confirmation must match.');
    });

    test('manager role is denied before reaching the controller', () => {
        const req = { user: { id: 'manager-1', role: 'MANAGER' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        ownerAuthentication(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
