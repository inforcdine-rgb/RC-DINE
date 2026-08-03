import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../../config/database.js';
import authenticate from '../../middlewares/auth.js';
import { ownerRecoveryEmailLimiter, ownerRecoveryIpLimiter } from '../../middlewares/ownerRecoveryRateLimit.js';
import userService from '../../services/user.service.js';
import { comparePassword } from '../../utils/password.js';
import { compareRecoveryCode, hashRecoveryCode } from '../../utils/recoveryCode.js';
import { registrationValidation } from '../../validations/user.validations.js';

jest.mock('../../../config/database.js', () => ({
    db: {
        users: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            sequelize: { transaction: jest.fn() }
        },
        preferences: { create: jest.fn() }
    }
}));

jest.mock('../../../config/env.js', () => ({
    __esModule: true,
    default: {
        cryptoSecret: 'test-secret',
        jwtSecret: 'test-jwt-secret',
        app: { isDevelopment: false, env: 'test' },
        email: { user: 'test@example.com', pass: 'test-password' }
    }
}));

const ownerPayload = {
    firstName: 'Rachit',
    lastName: 'Kumar',
    phoneNumber: '9876543210',
    email: 'owner@example.com',
    password: 'Strong@123',
    recoveryCode: '4829',
    confirmRecoveryCode: '4829'
};

const startRateLimitServer = async (middleware) => {
    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json());
    app.post('/reset', middleware, (_req, res) =>
        res.status(401).json({ message: 'Email or recovery code is incorrect.' })
    );
    const server = await new Promise((resolve) => {
        const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    return { server, url: `http://127.0.0.1:${server.address().port}/reset` };
};

const postReset = (url, email) =>
    fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
    });

describe('OWNER recovery-code security flow', () => {
    let transaction;

    beforeEach(() => {
        transaction = {
            LOCK: { UPDATE: 'UPDATE' },
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };
        db.users.sequelize.transaction.mockResolvedValue(transaction);
        db.users.findOne.mockReset();
        db.users.update.mockReset().mockResolvedValue([1]);
        db.users.create.mockReset();
        db.preferences.create.mockReset().mockResolvedValue({});
    });

    test('owner signup validates and stores only a bcrypt recovery hash', async () => {
        const validation = registrationValidation(ownerPayload);
        expect(validation.error).toBeUndefined();

        db.users.findOne.mockResolvedValue(null);
        db.users.create.mockImplementation(async (payload) => ({ ...payload }));

        const response = await userService.create(validation.value);
        const savedOwner = db.users.create.mock.calls[0][0];

        expect(savedOwner.recoveryCodeHash).toMatch(/^\$2[aby]\$/);
        expect(await compareRecoveryCode('4829', savedOwner.recoveryCodeHash)).toBe(true);
        expect(JSON.stringify(savedOwner)).not.toContain('RC4829');
        expect(response).not.toHaveProperty('recoveryCodeHash');
        expect(response).not.toHaveProperty('recoveryCode');
    });

    test('manager invite validation remains valid without a recovery code', () => {
        const validation = registrationValidation({
            ...ownerPayload,
            invite: 'invite-id',
            recoveryCode: undefined,
            confirmRecoveryCode: undefined
        });
        expect(validation.error).toBeUndefined();
    });

    test('existing owner without a hash is marked for mandatory setup', async () => {
        db.users.findOne
            .mockResolvedValueOnce({
                id: 'owner-1',
                firstName: 'Existing',
                lastName: 'Owner',
                role: 'OWNER'
            })
            .mockResolvedValueOnce({ recoveryCodeHash: null });

        const result = await userService.getUser({ id: 'owner-1' });
        expect(result.recoveryCodeConfigured).toBe(false);
        expect(result).not.toHaveProperty('recoveryCodeHash');
    });

    test('correct email and code reset password, clear failures, and invalidate old tokens', async () => {
        const recoveryCodeHash = await hashRecoveryCode('4829');
        db.users.findOne.mockResolvedValue({
            id: 'owner-1',
            recoveryCodeHash,
            recoveryCodeFailedAttempts: 3,
            recoveryCodeLockedUntil: null,
            tokenVersion: 7
        });

        const result = await userService.resetOwnerPassword({
            email: ' OWNER@EXAMPLE.COM ',
            recoveryCode: '4829',
            newPassword: 'Changed@123'
        });
        const update = db.users.update.mock.calls[0][0];

        expect(result.message).toBe('Password reset successfully. Please login with your new password.');
        expect(await comparePassword('Changed@123', update.password)).toBe(true);
        expect(update.password).not.toBe('Changed@123');
        expect(update.passwordChangedAt).toBeInstanceOf(Date);
        expect(update.tokenVersion).toBe(8);
        expect(update.recoveryCodeFailedAttempts).toBe(0);
        expect(update.recoveryCodeLockedUntil).toBeNull();
        expect(db.users.findOne.mock.calls[0][0].where.email).toBe('owner@example.com');
    });

    test('wrong and unknown credentials use the same generic response', async () => {
        db.users.findOne
            .mockResolvedValueOnce({
                id: 'owner-1',
                recoveryCodeHash: await hashRecoveryCode('4829'),
                recoveryCodeFailedAttempts: 0,
                recoveryCodeLockedUntil: null,
                tokenVersion: 0
            })
            .mockResolvedValueOnce(null);

        await expect(
            userService.resetOwnerPassword({
                email: 'owner@example.com',
                recoveryCode: '1111',
                newPassword: 'Changed@123'
            })
        ).rejects.toMatchObject({ code: 401, message: 'Email or recovery code is incorrect.' });
        await expect(
            userService.resetOwnerPassword({
                email: 'unknown@example.com',
                recoveryCode: '1111',
                newPassword: 'Changed@123'
            })
        ).rejects.toMatchObject({ code: 401, message: 'Email or recovery code is incorrect.' });
    });

    test('fifth failed code locks the owner for 30 minutes', async () => {
        db.users.findOne.mockResolvedValue({
            id: 'owner-1',
            recoveryCodeHash: await hashRecoveryCode('4829'),
            recoveryCodeFailedAttempts: 4,
            recoveryCodeLockedUntil: null,
            tokenVersion: 0
        });

        await expect(
            userService.resetOwnerPassword({
                email: 'owner@example.com',
                recoveryCode: '1111',
                newPassword: 'Changed@123'
            })
        ).rejects.toMatchObject({ code: 401, message: 'Email or recovery code is incorrect.' });

        const update = db.users.update.mock.calls[0][0];
        expect(update.recoveryCodeFailedAttempts).toBe(5);
        expect(update.recoveryCodeLockedUntil.getTime()).toBeGreaterThan(Date.now() + 29 * 60 * 1000);
    });

    test('active lock returns only the generic response', async () => {
        db.users.findOne.mockResolvedValue({
            id: 'owner-1',
            recoveryCodeHash: await hashRecoveryCode('4829'),
            recoveryCodeFailedAttempts: 5,
            recoveryCodeLockedUntil: new Date(Date.now() + 10 * 60 * 1000),
            tokenVersion: 0
        });

        await expect(
            userService.resetOwnerPassword({
                email: 'owner@example.com',
                recoveryCode: '4829',
                newPassword: 'Changed@123'
            })
        ).rejects.toMatchObject({ code: 429, message: 'Email or recovery code is incorrect.' });
        expect(db.users.update).not.toHaveBeenCalled();
    });

    test('a token issued before password reset is rejected by authentication', async () => {
        const oldToken = jwt.sign({ id: 'owner-1', role: 'OWNER', tokenVersion: 2 }, 'test-jwt-secret');
        db.users.findOne.mockResolvedValue({ id: 'owner-1', tokenVersion: 3 });

        const response = await new Promise((resolve) => {
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn((body) => resolve({ res, body }))
            };
            authenticate({ headers: { authorization: `Bearer ${oldToken}` } }, res, () => resolve({ res, body: null }));
        });

        expect(response.res.status).toHaveBeenCalledWith(403);
        expect(response.body).toEqual({ message: 'TOKEN_VERIFICATION_FAILED' });
    });
});

describe('OWNER recovery route rate limits', () => {
    test('email limiter rejects the sixth failed request in 30 minutes', async () => {
        const { server, url } = await startRateLimitServer(ownerRecoveryEmailLimiter);
        try {
            const statuses = [];
            const email = `rate-email-${Date.now()}@example.com`;
            for (let attempt = 0; attempt < 6; attempt += 1) {
                statuses.push((await postReset(url, email)).status);
            }
            expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test('IP limiter rejects the twenty-first failed request', async () => {
        const { server, url } = await startRateLimitServer(ownerRecoveryIpLimiter);
        try {
            const statuses = [];
            for (let attempt = 0; attempt < 21; attempt += 1) {
                statuses.push((await postReset(url, `rate-ip-${attempt}-${Date.now()}@example.com`)).status);
            }
            expect(statuses.slice(0, 20).every((status) => status === 401)).toBe(true);
            expect(statuses[20]).toBe(429);
        } finally {
            await new Promise((resolve) => server.close(resolve));
        }
    });
});
