import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import env from '../../config/env.js';

const BCRYPT_PREFIX = '$2';
const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 12);

export const isBcryptHash = (value = '') => String(value).startsWith(BCRYPT_PREFIX);

export const hashPassword = async (password) => {
    if (!password) return password;
    if (isBcryptHash(password)) return password;
    return bcrypt.hash(String(password), SALT_ROUNDS);
};

export const comparePassword = async (plainPassword, storedPassword) => {
    if (!plainPassword || !storedPassword) return false;

    if (isBcryptHash(storedPassword)) {
        return bcrypt.compare(String(plainPassword), storedPassword);
    }

    // Backward compatibility for old AES-encrypted passwords.
    try {
        const decryptedPassword = CryptoJS.AES.decrypt(storedPassword, env.cryptoSecret).toString(CryptoJS.enc.Utf8);
        return decryptedPassword === String(plainPassword);
    } catch (_error) {
        return false;
    }
};
