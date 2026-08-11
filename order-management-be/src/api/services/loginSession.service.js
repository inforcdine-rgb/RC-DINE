import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const ACTIVE_SESSION_LIMIT = 20;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

const safeText = (value, maxLength = 180) =>
    [...String(value || '')]
        .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
        .join('')
        .trim()
        .slice(0, maxLength);

const durationToMilliseconds = (value = '18h') => {
    const match = String(value).match(/^(\d+)\s*([mhd])$/i);
    if (!match) return 18 * 60 * 60 * 1000;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier = unit === 'd' ? 24 * 60 * 60 * 1000 : unit === 'h' ? 60 * 60 * 1000 : 60 * 1000;
    return amount * multiplier;
};
const detectBrowser = (userAgent) => {
    if (/Edg\//i.test(userAgent)) return 'Microsoft Edge';
    if (/OPR\//i.test(userAgent)) return 'Opera';
    if (/SamsungBrowser\//i.test(userAgent)) return 'Samsung Internet';
    if (/CriOS\//i.test(userAgent)) return 'Chrome';
    if (/Chrome\//i.test(userAgent)) return 'Chrome';
    if (/FxiOS\//i.test(userAgent) || /Firefox\//i.test(userAgent)) return 'Firefox';
    if (/Safari\//i.test(userAgent)) return 'Safari';
    return 'Web browser';
};

const detectOperatingSystem = (userAgent, clientPlatform) => {
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Windows NT/i.test(userAgent)) return 'Windows';
    if (/Mac OS X|Macintosh/i.test(userAgent)) return 'macOS';
    if (/CrOS/i.test(userAgent)) return 'ChromeOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    return safeText(clientPlatform, 80) || 'Unknown OS';
};

const detectDeviceType = (userAgent, requestedType) => {
    const normalized = safeText(requestedType, 30).toUpperCase();
    if (['PHONE', 'TABLET', 'DESKTOP'].includes(normalized)) return normalized;
    if (/iPad|Tablet/i.test(userAgent)) return 'TABLET';
    if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return 'PHONE';
    return 'DESKTOP';
};

const maskIpAddress = (value) => {
    const ip = safeText(value, 64).replace(/^::ffff:/, '');
    if (!ip) return 'Unavailable';
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
        const parts = ip.split('.');
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    if (ip.includes(':')) return `${ip.split(':').slice(0, 3).join(':')}::`;
    return ip;
};

const describeSession = ({ userAgent, ipAddress, deviceInfo = {} } = {}) => {
    const cleanedUserAgent = safeText(userAgent, 1000);
    const browser = detectBrowser(cleanedUserAgent);
    const operatingSystem = detectOperatingSystem(cleanedUserAgent, deviceInfo.platform);
    const deviceType = detectDeviceType(cleanedUserAgent, deviceInfo.deviceType);
    const appMode = deviceInfo.appMode === 'STANDALONE' ? 'STANDALONE' : 'BROWSER';
    const installedLabel = appMode === 'STANDALONE' ? ' Â· Installed app' : '';

    return {
        deviceId: safeText(deviceInfo.deviceId, 128) || null,
        deviceName: `${browser} on ${operatingSystem}${installedLabel}`,
        deviceType,
        browser,
        operatingSystem,
        appMode,
        ipAddress: safeText(ipAddress, 64) || null,
        timezone: safeText(deviceInfo.timezone, 80) || null,
        userAgent: cleanedUserAgent || null
    };
};

const create = async ({ userId, expiresIn = '18h', context } = {}) => {
    const now = new Date();
    const id = uuidv4();
    const session = describeSession(context);

    await db.loginSessions.create({
        id,
        userId,
        ...session,
        lastActiveAt: now,
        expiresAt: new Date(now.getTime() + durationToMilliseconds(expiresIn))
    });

    const activeSessions = await db.loginSessions.findAll({
        where: {
            userId,
            revokedAt: null,
            expiresAt: { [Op.gt]: now }
        },
        attributes: ['id'],
        order: [['createdAt', 'DESC']],
        raw: true
    });

    const staleSessions = activeSessions.slice(ACTIVE_SESSION_LIMIT).map((item) => item.id);
    if (staleSessions.length) {
        await db.loginSessions.update(
            { revokedAt: now, revokedReason: 'SESSION_LIMIT' },
            { where: { id: { [Op.in]: staleSessions }, userId } }
        );
    }

    return id;
};

const validateAndTouch = async (sessionId, userId) => {
    if (!sessionId) return true;

    const now = new Date();
    const session = await db.loginSessions.findOne({
        where: {
            id: sessionId,
            userId,
            revokedAt: null,
            expiresAt: { [Op.gt]: now }
        },
        attributes: ['id', 'lastActiveAt'],
        raw: true
    });

    if (!session) return false;

    if (!session.lastActiveAt || now.getTime() - new Date(session.lastActiveAt).getTime() >= TOUCH_INTERVAL_MS) {
        await db.loginSessions.update({ lastActiveAt: now }, { where: { id: sessionId, userId, revokedAt: null } });
    }

    return true;
};

const list = async (userId, currentSessionId) => {
    const now = new Date();
    const rows = await db.loginSessions.findAll({
        where: {
            userId,
            revokedAt: null,
            expiresAt: { [Op.gt]: now }
        },
        attributes: [
            'id',
            'deviceName',
            'deviceType',
            'browser',
            'operatingSystem',
            'appMode',
            'ipAddress',
            'timezone',
            'lastActiveAt',
            'expiresAt',
            'createdAt'
        ],
        order: [['lastActiveAt', 'DESC']],
        raw: true
    });

    const sessions = rows
        .map((row) => ({
            ...row,
            ipAddress: maskIpAddress(row.ipAddress),
            isCurrent: Boolean(currentSessionId && row.id === currentSessionId)
        }))
        .sort((first, second) => Number(second.isCurrent) - Number(first.isCurrent));

    return {
        sessions,
        count: sessions.length,
        trackingReady: Boolean(currentSessionId)
    };
};

const revoke = async ({ userId, sessionId, currentSessionId } = {}) => {
    const [updated] = await db.loginSessions.update(
        { revokedAt: new Date(), revokedReason: sessionId === currentSessionId ? 'CURRENT_LOGOUT' : 'REMOTE_LOGOUT' },
        { where: { id: sessionId, userId, revokedAt: null } }
    );

    if (!updated) {
        throw CustomError(STATUS_CODE.NOT_FOUND, 'Login session not found or already signed out.');
    }

    return {
        message: sessionId === currentSessionId ? 'Current device signed out.' : 'Device signed out successfully.',
        currentSessionRevoked: sessionId === currentSessionId
    };
};

const revokeOthers = async (userId, currentSessionId) => {
    if (!currentSessionId) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Please sign out and sign in once to activate device security.');
    }

    const [revokedCount] = await db.loginSessions.update(
        { revokedAt: new Date(), revokedReason: 'LOGOUT_OTHERS' },
        {
            where: {
                userId,
                id: { [Op.ne]: currentSessionId },
                revokedAt: null
            }
        }
    );

    return { message: 'All other devices signed out successfully.', revokedCount };
};

const revokeCurrent = async (userId, currentSessionId) => {
    if (!currentSessionId) return { message: 'Current device signed out.', currentSessionRevoked: true };
    return revoke({ userId, sessionId: currentSessionId, currentSessionId });
};

const revokeAll = async (userId, reason = 'SECURITY_CHANGE', options = {}) => {
    const [revokedCount] = await db.loginSessions.update(
        { revokedAt: new Date(), revokedReason: safeText(reason, 80) || 'SECURITY_CHANGE' },
        { where: { userId, revokedAt: null }, ...options }
    );
    return revokedCount;
};

export default {
    create,
    list,
    revoke,
    revokeOthers,
    revokeCurrent,
    revokeAll,
    validateAndTouch
};
