import { io } from 'socket.io-client';
import env from '../config/env';

const PRESENCE_HEARTBEAT_MS = 15000;
const PRESENCE_ACK_TIMEOUT_MS = 5000;

let socket = null;
let notificationPresenceToken = '';
let visibilityBound = false;
let heartbeatTimer = null;
let pageExiting = false;

const logPushEvent = (event, details = {}) => {
    console.info('[RCDINE_PUSH]', { event, ...details, timestamp: new Date().toISOString() });
};

const isPageVisible = () =>
    !pageExiting && document.visibilityState === 'visible' && document.hasFocus();

const stopPresenceHeartbeat = () => {
    if (!heartbeatTimer) return;
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
};

const emitWithAcknowledgement = (eventName, payload, onAcknowledged) => {
    if (!socket?.connected) return;
    socket.timeout(PRESENCE_ACK_TIMEOUT_MS).emit(eventName, payload, (error, response) => {
        if (error) {
            logPushEvent('presence_ack_timeout', { eventName });
            return;
        }
        if (response?.success === false) {
            logPushEvent('presence_rejected', { eventName, message: response.message });
            window.dispatchEvent(new CustomEvent('rcdine:push-presence-invalid'));
            return;
        }
        onAcknowledged?.(response);
    });
};

const emitNotificationPresence = () => {
    if (!socket?.connected || !notificationPresenceToken) return;
    const visible = isPageVisible();
    emitWithAcknowledgement('notification:bind', {
        presenceToken: notificationPresenceToken,
        visible,
        clientTimestamp: Date.now()
    }, () => logPushEvent('presence_bound', { visible, socketId: socket?.id }));
};

const emitNotificationVisibility = (explicitVisible) => {
    if (!socket?.connected || !notificationPresenceToken) return;
    const visible = typeof explicitVisible === 'boolean' ? explicitVisible : isPageVisible();
    emitWithAcknowledgement('notification:visibility', {
        visible,
        clientTimestamp: Date.now()
    }, () => logPushEvent('visibility_updated', { visible }));
};

const emitPresenceHeartbeat = () => {
    if (!socket?.connected || !notificationPresenceToken) return;
    const visible = isPageVisible();
    emitWithAcknowledgement('notification:heartbeat', {
        visible,
        clientTimestamp: Date.now()
    });
};

const startPresenceHeartbeat = () => {
    stopPresenceHeartbeat();
    if (!socket?.connected || !notificationPresenceToken) return;
    heartbeatTimer = window.setInterval(emitPresenceHeartbeat, PRESENCE_HEARTBEAT_MS);
};

const handleVisibilityChange = () => emitNotificationVisibility();
const handleFocus = () => {
    pageExiting = false;
    emitNotificationVisibility(true);
};
const handleBlur = () => emitNotificationVisibility(false);
const handlePageHide = () => {
    pageExiting = true;
    emitNotificationVisibility(false);
};
const handlePageShow = () => {
    pageExiting = false;
    emitNotificationPresence();
    startPresenceHeartbeat();
};

const bindVisibilityEvents = () => {
    if (visibilityBound) return;
    visibilityBound = true;
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('focus', handleFocus, { passive: true });
    window.addEventListener('blur', handleBlur, { passive: true });
    window.addEventListener('pagehide', handlePageHide, { passive: true });
    window.addEventListener('beforeunload', handlePageHide, { passive: true });
    window.addEventListener('pageshow', handlePageShow, { passive: true });
};

const getSocketUrl = () => {
    const baseUrl = String(env.baseUrl || '').trim();

    if (!baseUrl) {
        return window.location.origin;
    }

    return baseUrl.replace(/\/api\/?$/, '');
};

export const connectSocket = () => {
    if (socket?.connected) {
        return socket;
    }

    if (!socket) {
        socket = io(getSocketUrl(), {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        socket.on('connect', () => {
            logPushEvent('socket_connected', { socketId: socket.id });
            emitNotificationPresence();
            startPresenceHeartbeat();
        });

        socket.on('notification:new', (payload, acknowledge) => {
            const visible = isPageVisible();
            window.dispatchEvent(new CustomEvent('rcdine:notification', { detail: payload }));
            acknowledge?.({ received: true, visible });
            logPushEvent('socket_notification_received', {
                visible,
                notificationId: payload?.notificationId,
                type: payload?.type
            });
        });

        socket.on('connect_error', (error) => {
            logPushEvent('socket_connect_failed', { message: error.message });
        });

        socket.on('disconnect', (reason) => {
            stopPresenceHeartbeat();
            logPushEvent('socket_disconnected', { reason });
        });
    }

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (!socket) return;

    if (socket.connected && notificationPresenceToken) socket.emit('notification:unbind');
    stopPresenceHeartbeat();
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
};

export const joinRcSessionRoom = (sessionId) => {
    const activeSocket = connectSocket();
    if (sessionId) activeSocket.emit('join-rc-session', sessionId);
    return activeSocket;
};

export const leaveRcSessionRoom = (sessionId) => {
    if (socket && sessionId) socket.emit('leave-rc-session', sessionId);
};

export const joinRcRequestRoom = (requestId) => {
    const activeSocket = connectSocket();
    if (requestId) activeSocket.emit('join-rc-request', requestId);
    return activeSocket;
};

export const leaveRcRequestRoom = (requestId) => {
    if (socket && requestId) socket.emit('leave-rc-request', requestId);
};

export const bindNotificationPresence = (presenceToken) => {
    notificationPresenceToken = presenceToken || '';
    bindVisibilityEvents();
    const activeSocket = connectSocket();
    emitNotificationPresence();
    startPresenceHeartbeat();
    return activeSocket;
};

export const clearNotificationPresence = () => {
    if (socket?.connected && notificationPresenceToken) socket.emit('notification:unbind');
    stopPresenceHeartbeat();
    notificationPresenceToken = '';
    logPushEvent('presence_cleared');
};
