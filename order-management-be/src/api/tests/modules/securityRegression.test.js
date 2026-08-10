import CryptoJS from 'crypto-js';

import sanitizeErrorResponse from '../../middlewares/sanitizeErrorResponse.js';
import {
    decryptServerSecret,
    encryptServerSecret,
    isEncryptedWithServerKey
} from '../../utils/secretEncryption.js';
import { createTableQrToken, verifyTableQrToken } from '../../utils/tableQr.js';
import { paymentConfirmationValidation } from '../../validations/checkout.validations.js';
import { customerRegistrationValidation, orderPlacementValidation } from '../../validations/order.validation.js';

jest.mock('../../../config/env.js', () => ({
    __esModule: true,
    default: {
        app: { env: 'production' },
        tableQrSecret: 'test-table-qr-secret-that-is-long-enough',
        serverEncryptionKey: 'server-only-encryption-key',
        cryptoSecret: 'legacy-browser-visible-key',
        jwtSecret: 'jwt-test-key'
    }
}));

describe('critical security regressions', () => {
    test('table QR binds the hotel and table and rejects a tampered signature', () => {
        const token = createTableQrToken({ tableId: 'table-1', hotelId: 'hotel-1' });

        expect(verifyTableQrToken(token)).toEqual({ tableId: 'table-1', hotelId: 'hotel-1' });

        const finalCharacter = token.slice(-1) === 'a' ? 'b' : 'a';
        expect(() => verifyTableQrToken(`${token.slice(0, -1)}${finalCharacter}`)).toThrow(
            'This table QR is invalid'
        );
    });

    test('customer registration requires a server-signed table QR', () => {
        const { error } = customerRegistrationValidation({
            name: 'Guest',
            phoneNumber: 9876543210,
            hotelId: 'hotel-1',
            tableId: 'table-1',
            tableNumber: 1
        });

        expect(error?.details[0].path).toEqual(['qrToken']);
    });

    test('order validation strips client-controlled price and menu name', () => {
        const { error, value } = orderPlacementValidation({
            customerId: 'customer-1',
            hotelId: 'hotel-1',
            tableId: 'table-1',
            tableNumber: 1,
            menus: [{ menuId: 'menu-1', quantity: 2, menuName: 'Forged', price: 1 }]
        });

        expect(error).toBeUndefined();
        expect(value.menus).toEqual([{ menuId: 'menu-1', quantity: 2 }]);
    });

    test('settlement confirmation cannot use the old unsigned manual payload', () => {
        const { error } = paymentConfirmationValidation({
            customerId: 'customer-1',
            hotelId: 'hotel-1',
            manual: true
        });

        expect(error).toBeDefined();
    });

    test('production 5xx JSON responses do not expose internal error details', () => {
        const originalSend = jest.fn();
        const originalJson = jest.fn();
        const next = jest.fn();
        const res = {
            statusCode: 500,
            getHeader: jest.fn().mockReturnValue('application/json; charset=utf-8'),
            send: originalSend,
            json: originalJson
        };

        sanitizeErrorResponse({}, res, next);
        res.json({ message: 'database password leaked', stack: 'private stack' });

        expect(next).toHaveBeenCalledTimes(1);
        expect(originalJson).toHaveBeenCalledWith({ message: 'Internal server error' });
        expect(originalJson).not.toHaveBeenCalledWith(expect.objectContaining({ stack: expect.anything() }));
    });

    test('new payment secrets use the server-only encryption key', () => {
        const encrypted = encryptServerSecret('razorpay-secret');
        const exposedKeyResult = CryptoJS.AES.decrypt(encrypted, 'legacy-browser-visible-key').toString(
            CryptoJS.enc.Utf8
        );

        expect(decryptServerSecret(encrypted)).toBe('razorpay-secret');
        expect(isEncryptedWithServerKey(encrypted)).toBe(true);
        expect(exposedKeyResult).toBe('');
    });

    test('payment secrets encrypted by an older release remain readable', () => {
        const legacyEncrypted = CryptoJS.AES.encrypt('legacy-secret', 'legacy-browser-visible-key').toString();

        expect(decryptServerSecret(legacyEncrypted)).toBe('legacy-secret');
        expect(isEncryptedWithServerKey(legacyEncrypted)).toBe(false);
    });
});
