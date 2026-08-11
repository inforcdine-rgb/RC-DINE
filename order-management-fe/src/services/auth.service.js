import { api, instance, method } from '../api/apiClient';

const DEVICE_ID_KEY = 'rcdine-device-id';

const getDeviceId = () => {
    try {
        const existing = localStorage.getItem(DEVICE_ID_KEY);
        if (existing) return existing;

        const generated =
            window.crypto?.randomUUID?.() || `rc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem(DEVICE_ID_KEY, generated);
        return generated;
    } catch (error) {
        return `temporary-${Date.now().toString(36)}`;
    }
};

const getDeviceType = () => {
    const userAgent = navigator.userAgent || '';
    if (/iPad|Tablet/i.test(userAgent)) return 'TABLET';
    if (/Mobile|Android|iPhone|iPod/i.test(userAgent) || navigator.userAgentData?.mobile) return 'PHONE';
    return 'DESKTOP';
};

const getLoginDeviceInfo = () => {
    let timezone = '';
    try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (error) {
        timezone = '';
    }

    const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

    return {
        deviceId: getDeviceId(),
        deviceType: getDeviceType(),
        platform: navigator.userAgentData?.platform || navigator.platform || '',
        timezone,
        appMode: standalone ? 'STANDALONE' : 'BROWSER'
    };
};

export const registerUser = async (payload) => {
    try {
        return await api(method.POST, '/user/register', payload);
    } catch (error) {
        console.error(`Error to register user ${error}`);
        throw error;
    }
};

export const loginUser = async (payload) => {
    try {
        return await api(method.POST, '/user/login', { ...payload, deviceInfo: getLoginDeviceInfo() });
    } catch (error) {
        console.error(`Error to login user ${error}`);
        throw error;
    }
};

export const googleLoginUser = async (payload) => {
    try {
        return await api(method.POST, '/user/google-login', { ...payload, deviceInfo: getLoginDeviceInfo() });
    } catch (error) {
        console.error(`Error during Google login ${error}`);
        throw error;
    }
};

export const verifyUser = async (payload) => {
    try {
        return await api(method.POST, '/user/verify', payload);
    } catch (error) {
        console.error(`Error on verifying user ${error}`);
        throw error;
    }
};

export const forgotPasswordUser = async (payload) => {
    try {
        const response = await instance.post('/user/forget', payload, {
            timeout: 20000
        });

        return response.data;
    } catch (error) {
        console.error('Error in forgot password:', error);

        if (error.code === 'ECONNABORTED') {
            throw new Error('Email server response timeout. Check backend email configuration.');
        }

        throw new Error(error?.response?.data?.message || error.message || 'Unable to send password reset email.');
    }
};

export const resetPasswordUser = async (payload) => {
    try {
        return await api(method.POST, '/user/reset', payload);
    } catch (error) {
        console.error(`Error in reset password ${error}`);
        throw error;
    }
};

export const resetOwnerPassword = async (payload) => api(method.POST, '/user/owner/recovery/reset', payload);

export const updateOwnerRecoveryCode = async (payload) => api(method.PUT, '/user/owner/recovery-code', payload);

export const changeOwnerEmail = async (payload) => api(method.PATCH, '/owner/account/email', payload);

export const getUser = async () => {
    try {
        return await api(method.GET, '/user');
    } catch (error) {
        console.error(`Error while fetching user ${error}`);
        throw error;
    }
};

export const updateUser = async (payload) => {
    try {
        return await api(method.PUT, '/user', payload);
    } catch (error) {
        console.error(`Error while updating user ${error}`);
        throw error;
    }
};

export const getLoginSessions = async () => api(method.GET, '/user/sessions');

export const revokeLoginSession = async (sessionId) =>
    api(method.DELETE, `/user/sessions/${encodeURIComponent(sessionId)}`);

export const revokeOtherLoginSessions = async () => api(method.DELETE, '/user/sessions');

export const logoutCurrentSession = async () => api(method.POST, '/user/logout');
