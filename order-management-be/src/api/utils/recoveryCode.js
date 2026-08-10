import bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.RECOVERY_CODE_SALT_ROUNDS || process.env.PASSWORD_SALT_ROUNDS || 12);
const RECOVERY_CODE_PATTERN = /^\d{6}$/;

// Created once at process startup. Unknown emails still perform the same
// bcrypt comparison work as known accounts without exposing a real hash.
const dummyRecoveryCodeHash = bcrypt.hashSync('RC000000', SALT_ROUNDS);

export const normalizeRecoveryCode = (digits) => {
    const value = String(digits ?? '');
    return RECOVERY_CODE_PATTERN.test(value) ? `RC${value}` : null;
};

export const hashRecoveryCode = async (digits) => {
    const normalized = normalizeRecoveryCode(digits);
    if (!normalized) throw new Error('Recovery code must be exactly 6 numeric digits.');
    return bcrypt.hash(normalized, SALT_ROUNDS);
};

export const compareRecoveryCode = async (digits, storedHash) => {
    const normalized = normalizeRecoveryCode(digits) || 'RC000000';
    const comparisonHash = storedHash || dummyRecoveryCodeHash;
    return bcrypt.compare(normalized, comparisonHash);
};

export const safeDummyRecoveryCodeComparison = async (digits) =>
    bcrypt.compare(normalizeRecoveryCode(digits) || 'RC000000', dummyRecoveryCodeHash);
