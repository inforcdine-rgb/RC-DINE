import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import { DEFAULT_ACTIVE_QR_TEMPLATE_IDS, normalizeActiveQrTemplateIds } from './qrTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsPath = path.join(__dirname, 'admin_settings.json');

const defaultSettings = {
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || ''
    },
    plans: {
        MONTHLY: { days: 30, amount: 1000 },
        HALF_YEARLY: { days: 180, amount: 5500 },
        SIX_MONTHS: { days: 180, amount: 5500 },
        YEARLY: { days: 365, amount: 11000 }
    },
    qrTemplates: {
        activeIds: DEFAULT_ACTIVE_QR_TEMPLATE_IDS
    }
};

const normalizeSettings = (settings = {}) => ({
    ...defaultSettings,
    ...settings,
    razorpay: { ...defaultSettings.razorpay, ...(settings.razorpay || {}) },
    plans: { ...defaultSettings.plans, ...(settings.plans || {}) },
    qrTemplates: {
        activeIds: normalizeActiveQrTemplateIds(settings.qrTemplates?.activeIds)
    }
});

export const getAdminSettings = () => {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return normalizeSettings(JSON.parse(data));
        }
    } catch (error) {
        logger('error', 'Error reading admin settings file', { error: error.message });
    }
    // Initialize file if not exists
    const initialSettings = normalizeSettings(defaultSettings);
    saveAdminSettings(initialSettings);
    return initialSettings;
};

export const saveAdminSettings = (settings) => {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(normalizeSettings(settings), null, 4), 'utf8');
        return true;
    } catch (error) {
        logger('error', 'Error writing admin settings file', { error: error.message });
        return false;
    }
};
