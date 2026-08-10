import CryptoJS from 'crypto-js';

import env from '../../config/env.js';

const uniqueKeys = (values) => [...new Set(values.filter((value) => String(value || '').trim()))];

const writeKey = () => env.serverEncryptionKey || env.cryptoSecret || env.jwtSecret;

export const encryptServerSecret = (value) => {
    if (!value) return null;
    return CryptoJS.AES.encrypt(String(value), writeKey()).toString();
};

export const isEncryptedWithServerKey = (cipherText) => {
    if (!cipherText || !env.serverEncryptionKey) return false;
    try {
        return Boolean(
            CryptoJS.AES.decrypt(String(cipherText), env.serverEncryptionKey).toString(CryptoJS.enc.Utf8)
        );
    } catch (_error) {
        return false;
    }
};

export const decryptServerSecret = (cipherText) => {
    if (!cipherText) return '';

    // cryptoSecret is a read-only fallback so credentials saved by older
    // releases continue working; every new production write uses the server key.
    const keys = uniqueKeys([env.serverEncryptionKey, env.cryptoSecret, env.jwtSecret]);
    for (const key of keys) {
        try {
            const plainText = CryptoJS.AES.decrypt(String(cipherText), key).toString(CryptoJS.enc.Utf8);
            if (plainText) return plainText;
        } catch (_error) {
            // Try the next legacy key.
        }
    }
    return '';
};
