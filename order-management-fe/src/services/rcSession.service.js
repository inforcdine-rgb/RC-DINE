import axios from 'axios';

import env from '../config/env';

const client = axios.create({
    baseURL: env.baseUrl,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

const unwrap = (request) =>
    request
        .then((response) => response.data)
        .catch((error) => {
            const nextError = new Error(error?.response?.data?.message || error.message || 'Request failed');
            nextError.retryAfter = error?.response?.data?.retryAfter;
            nextError.status = error?.response?.status;
            throw nextError;
        });

export const getRcSessionAvailability = (tableId) =>
    unwrap(client.get(`/rc-session/table/${tableId}/availability`));

export const sendRcSessionOtp = (mobileNumber) =>
    unwrap(client.post('/customer-auth/send-otp', { phoneNumber: mobileNumber }));

export const verifyRcSessionOtp = ({ mobileNumber, otp, verificationId }) =>
    unwrap(client.post('/customer-auth/verify-otp', { phoneNumber: mobileNumber, otp, verificationId }));

const customerHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const startRcSession = ({ tableId, token }) =>
    unwrap(client.post(`/rc-session/table/${tableId}/start`, {}, { headers: customerHeaders(token) }));

export const joinRcSession = ({ tableId, sessionCode, token }) =>
    unwrap(
        client.post(
            `/rc-session/table/${tableId}/join`,
            { sessionCode },
            { headers: customerHeaders(token) }
        )
    );

export const getRcSessionPendingRequests = ({ tableId, token }) =>
    unwrap(
        client.get(`/rc-session/table/${tableId}/pending-requests`, {
            headers: customerHeaders(token)
        })
    );

export const respondRcSessionJoinRequest = ({ tableId, requestId, action, token }) =>
    unwrap(
        client.post(
            `/rc-session/table/${tableId}/respond-request`,
            { requestId, action },
            { headers: customerHeaders(token) }
        )
    );

export const getRcSessionJoinRequestStatus = ({ requestId, token }) =>
    unwrap(
        client.get(`/rc-session/join-request/${requestId}/status`, {
            headers: customerHeaders(token)
        })
    );

export const getRcSessionDetails = ({ tableId, token }) =>
    unwrap(
        client.get(`/rc-session/table/${tableId}/details`, {
            headers: customerHeaders(token)
        })
    );

export const removeRcSessionMember = ({ tableId, memberId, token }) =>
    unwrap(
        client.delete(`/rc-session/table/${tableId}/members/${memberId}`, {
            headers: customerHeaders(token)
        })
    );

export const leaveRcSession = ({ tableId, token }) =>
    unwrap(client.post(`/rc-session/table/${tableId}/leave`, {}, { headers: customerHeaders(token) }));

export const endRcSession = ({ tableId, token }) =>
    unwrap(client.post(`/rc-session/table/${tableId}/end`, {}, { headers: customerHeaders(token) }));
