import { api, method } from '../api/apiClient';

export const startLogin = (payload) => api(method.POST, '/admin-auth/login', payload);
export const verifyLogin = (payload) => api(method.POST, '/admin-auth/login/verify', payload);
export const resendOtp = (challengeId) => api(method.POST, '/admin-auth/otp/resend', { challengeId });

export const requestEmailChange = (payload) => api(method.POST, '/admin-auth/security/email/request', payload);
export const verifyEmailChange = (payload) => api(method.POST, '/admin-auth/security/email/verify', payload);

export const requestPasswordChange = (payload) => api(method.POST, '/admin-auth/security/password/request', payload);
export const verifyPasswordChange = (payload) => api(method.POST, '/admin-auth/security/password/verify', payload);
