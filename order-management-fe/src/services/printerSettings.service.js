import CryptoJS from 'crypto-js';

import env from '../config/env';
import {
    getPrinterSettings as fetchPrinterSettings,
    updatePrinterSettings as persistPrinterSettings
} from './hotel.service';

const ALLOWED_PRINTER_WIDTHS = ['58', '80', 'auto'];
const DEFAULT_FOOTER = 'Thank you! Visit again.';

const getSecurePrinterStorageKey = (hotelId) =>
    `rcdine-printer-secure-${hotelId}`;

const getLegacyPrinterStorageKey = (hotelId) =>
    `rcdine-printer-${hotelId}`;

const getDefaultSettings = (hotelId = '') => ({
    version: 2,
    hotelId: String(hotelId || ''),
    printerWidth: '58',
    address: '',
    phone: '',
    gstNumber: '',
    showLogo: true,
    logo: '',
    footerMessage: DEFAULT_FOOTER,
    savedAt: ''
});

export const sanitizePrinterSettings = (settings = {}, hotelId = '') => ({
    version: 2,
    hotelId: String(hotelId || settings.hotelId || ''),
    printerWidth: ALLOWED_PRINTER_WIDTHS.includes(String(settings.printerWidth))
        ? String(settings.printerWidth)
        : '58',
    address: String(settings.address || '').trim().slice(0, 250),
    phone: String(settings.phone || settings.careNumber || '')
        .replace(/[^0-9+\- ]/g, '')
        .trim()
        .slice(0, 20),
    gstNumber: String(settings.gstNumber || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 15),
    showLogo: settings.showLogo !== false,
    logo: String(settings.logo || ''),
    footerMessage: String(settings.footerMessage || DEFAULT_FOOTER)
        .trim()
        .slice(0, 120) || DEFAULT_FOOTER,
    savedAt: String(settings.savedAt || '')
});

const encryptSettings = (settings) => {
    if (!env.cryptoSecret) return JSON.stringify(settings);
    return CryptoJS.AES.encrypt(JSON.stringify(settings), env.cryptoSecret).toString();
};

const decryptSettings = (value) => {
    if (!env.cryptoSecret) return JSON.parse(value);
    const text = CryptoJS.AES.decrypt(value, env.cryptoSecret).toString(CryptoJS.enc.Utf8);
    if (!text) throw new Error('Printer settings could not be decrypted');
    return JSON.parse(text);
};

export const savePrinterSettingsLocally = (hotelId, settings) => {
    if (!hotelId) throw new Error('Hotel ID is required');
    const clean = sanitizePrinterSettings({
        ...settings,
        hotelId,
        savedAt: new Date().toISOString()
    }, hotelId);
    localStorage.setItem(getSecurePrinterStorageKey(hotelId), encryptSettings(clean));
    localStorage.removeItem(getLegacyPrinterStorageKey(hotelId));
    return clean;
};

export const readPrinterSettings = (hotelId) => {
    if (!hotelId) return getDefaultSettings();
    const secureKey = getSecurePrinterStorageKey(hotelId);
    const encrypted = localStorage.getItem(secureKey);
    if (encrypted) {
        try {
            return sanitizePrinterSettings(decryptSettings(encrypted), hotelId);
        } catch (error) {
            localStorage.removeItem(secureKey);
        }
    }

    const legacyKey = getLegacyPrinterStorageKey(hotelId);
    const legacy = localStorage.getItem(legacyKey);
    if (legacy) {
        try {
            return savePrinterSettingsLocally(hotelId, JSON.parse(legacy));
        } catch (error) {
            localStorage.removeItem(legacyKey);
        }
    }
    return getDefaultSettings(hotelId);
};

export const loadPrinterSettings = async (hotelId) => {
    const cached = readPrinterSettings(hotelId);
    if (!hotelId) return cached;
    try {
        const remote = await fetchPrinterSettings(hotelId);
        return savePrinterSettingsLocally(hotelId, { ...cached, ...remote });
    } catch (error) {
        return cached;
    }
};

export const savePrinterSettings = async (hotelId, settings) => {
    if (!hotelId) throw new Error('Hotel ID is required');
    const clean = sanitizePrinterSettings(settings, hotelId);
    const remote = await persistPrinterSettings(hotelId, clean);
    return savePrinterSettingsLocally(hotelId, { ...clean, ...(remote?.settings || remote) });
};

export const removePrinterSettings = (hotelId) => {
    if (!hotelId) return;
    localStorage.removeItem(getSecurePrinterStorageKey(hotelId));
    localStorage.removeItem(getLegacyPrinterStorageKey(hotelId));
};
