import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    }
};

export const getAdminSettings = () => {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading admin settings file:', error);
    }
    // Initialize file if not exists
    saveAdminSettings(defaultSettings);
    return defaultSettings;
};

export const saveAdminSettings = (settings) => {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing admin settings file:', error);
        return false;
    }
};
