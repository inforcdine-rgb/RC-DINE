import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import env from './env.js';
import logger from './logger.js';

let io = null;
const pushPresence = new Map();
const PUSH_PRESENCE_TTL_MS = 45000;
const PUSH_PRESENCE_SWEEP_MS = 15000;
const SOCKET_NOTIFICATION_ACK_TIMEOUT_MS = 1800;
let presenceSweepTimer = null;

const getEndpointReference = (endpointHash) => String(endpointHash || '').slice(0, 12);

const updatePushPresence = (socket, visible) => {
    const endpointHash = socket.data?.pushEndpointHash;
    if (!endpointHash) return false;

    const activeSockets = pushPresence.get(endpointHash) || new Map();
    activeSockets.set(socket.id, {
        visible: Boolean(visible),
        lastSeenAt: Date.now()
    });
    pushPresence.set(endpointHash, activeSockets);
    socket.data.pushVisible = Boolean(visible);
    return true;
};

const removePushPresence = (socket) => {
    const endpointHash = socket.data?.pushEndpointHash;
    if (!endpointHash) return;

    const activeSockets = pushPresence.get(endpointHash);
    activeSockets?.delete(socket.id);
    if (!activeSockets?.size) pushPresence.delete(endpointHash);
};

const pruneExpiredPushPresence = (endpointHash) => {
    const activeSockets = pushPresence.get(endpointHash);
    if (!activeSockets) return null;

    const expiresBefore = Date.now() - PUSH_PRESENCE_TTL_MS;
    activeSockets.forEach((presence, socketId) => {
        if (!presence?.lastSeenAt || presence.lastSeenAt < expiresBefore) {
            activeSockets.delete(socketId);
        }
    });

    if (!activeSockets.size) {
        pushPresence.delete(endpointHash);
        return null;
    }
    return activeSockets;
};

const sweepExpiredPushPresence = () => {
    pushPresence.forEach((_activeSockets, endpointHash) => {
        pruneExpiredPushPresence(endpointHash);
    });
};

const getAllowedOrigins = () => {
    const origins = [...env.cors.origins];

    if (env.app.isDevelopment) {
        origins.push(
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        );
    }

    return [...new Set(origins)];
};

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin(origin, callback) {
                if (!origin) {
                    return callback(null, true);
                }

                const allowedOrigins = getAllowedOrigins();

                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }

                logger('error', `Socket.IO CORS blocked origin: ${origin}`);
                return callback(new Error('Socket.IO CORS origin not allowed'));
            },
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 20000
    });

    io.on('connection', (socket) => {
        logger('info', `Socket connected: ${socket.id}`);

        socket.on('join-hotel', (hotelId) => {
            if (!hotelId) return;

            const roomName = `hotel:${hotelId}`;
            socket.join(roomName);

            logger('info', `Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave-hotel', (hotelId) => {
            if (!hotelId) return;

            const roomName = `hotel:${hotelId}`;
            socket.leave(roomName);
        });

        socket.on('join-order', (orderId) => {
            if (!orderId) return;

            const roomName = `order:${orderId}`;
            socket.join(roomName);

            logger('info', `Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave-order', (orderId) => {
            if (!orderId) return;

            const roomName = `order:${orderId}`;
            socket.leave(roomName);
        });

        socket.on('join-rc-session', (sessionId) => {
            if (!sessionId) return;

            const roomName = `rc-session:${sessionId}`;
            socket.join(roomName);
            logger('info', `Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave-rc-session', (sessionId) => {
            if (!sessionId) return;
            socket.leave(`rc-session:${sessionId}`);
        });

        socket.on('join-rc-request', (requestId) => {
            if (!requestId) return;

            const roomName = `rc-request:${requestId}`;
            socket.join(roomName);
            logger('info', `Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave-rc-request', (requestId) => {
            if (!requestId) return;
            socket.leave(`rc-request:${requestId}`);
        });

        socket.on('notification:bind', ({ presenceToken, visible } = {}, acknowledge = () => {}) => {
            try {
                const payload = jwt.verify(presenceToken, env.jwtSecret);
                if (payload.type !== 'PUSH_PRESENCE' || !payload.endpointHash) {
                    throw new Error('Invalid push presence token');
                }

                const previousEndpointHash = socket.data?.pushEndpointHash;
                removePushPresence(socket);
                if (previousEndpointHash) socket.leave(`push:${previousEndpointHash}`);
                socket.data.pushEndpointHash = payload.endpointHash;
                socket.join(`push:${payload.endpointHash}`);
                updatePushPresence(socket, visible);
                logger('debug', 'Notification presence bound', {
                    event: 'presence_bound',
                    endpoint: getEndpointReference(payload.endpointHash),
                    socketId: socket.id,
                    visible: Boolean(visible)
                });
                acknowledge({ success: true });
            } catch (error) {
                logger('warn', 'Notification presence rejected', {
                    event: 'presence_rejected',
                    socketId: socket.id,
                    message: error.message
                });
                acknowledge({ success: false, message: 'Invalid notification presence' });
            }
        });

        socket.on('notification:visibility', ({ visible } = {}, acknowledge = () => {}) => {
            const updated = updatePushPresence(socket, visible);
            if (updated) {
                logger('debug', 'Notification visibility updated', {
                    event: 'presence_visibility',
                    endpoint: getEndpointReference(socket.data.pushEndpointHash),
                    socketId: socket.id,
                    visible: Boolean(visible)
                });
            }
            acknowledge({ success: updated });
        });

        socket.on('notification:heartbeat', ({ visible } = {}, acknowledge = () => {}) => {
            const updated = updatePushPresence(socket, visible);
            acknowledge({ success: updated, serverTimestamp: Date.now() });
        });

        socket.on('notification:unbind', () => {
            const endpointHash = socket.data?.pushEndpointHash;
            removePushPresence(socket);
            if (endpointHash) socket.leave(`push:${endpointHash}`);
            socket.data.pushEndpointHash = null;
            socket.data.pushVisible = false;
            logger('debug', 'Notification presence removed', {
                event: 'presence_removed',
                endpoint: getEndpointReference(endpointHash),
                socketId: socket.id
            });
        });

        socket.on('disconnect', (reason) => {
            removePushPresence(socket);
            logger('info', `Socket disconnected: ${socket.id}, reason: ${reason}`);
        });

        socket.on('error', (error) => {
            logger('error', `Socket error ${socket.id}: ${error.message}`);
        });
    });

    logger('info', 'Socket.IO initialized successfully');

    if (presenceSweepTimer) clearInterval(presenceSweepTimer);
    presenceSweepTimer = setInterval(sweepExpiredPushPresence, PUSH_PRESENCE_SWEEP_MS);
    presenceSweepTimer.unref?.();
    httpServer.once('close', () => {
        clearInterval(presenceSweepTimer);
        presenceSweepTimer = null;
        pushPresence.clear();
    });

    return io;
};

export const getSocketIO = () => {
    if (!io) {
        throw new Error('Socket.IO has not been initialized');
    }

    return io;
};

export const emitToHotel = (hotelId, eventName, payload) => {
    if (!io || !hotelId) return;

    io.to(`hotel:${hotelId}`).emit(eventName, payload);
};

export const emitToOrder = (orderId, eventName, payload) => {
    if (!io || !orderId) return;

    io.to(`order:${orderId}`).emit(eventName, payload);
};


export const emitToRcSession = (sessionId, eventName, payload) => {
    if (!io || !sessionId) return;
    io.to(`rc-session:${sessionId}`).emit(eventName, payload);
};

export const emitToRcRequest = (requestId, eventName, payload) => {
    if (!io || !requestId) return;
    io.to(`rc-request:${requestId}`).emit(eventName, payload);
};

export const isPushEndpointVisible = (endpointHash) => {
    const activeSockets = pruneExpiredPushPresence(endpointHash);
    return Boolean(activeSockets && [...activeSockets.values()].some(({ visible }) => visible));
};

export const emitToPushEndpoint = async (endpointHash, payload) => {
    if (!io || !endpointHash) return false;

    return new Promise((resolve) => {
        io.timeout(SOCKET_NOTIFICATION_ACK_TIMEOUT_MS)
            .to(`push:${endpointHash}`)
            .emit('notification:new', payload, (error, responses = []) => {
                const acknowledgements = Array.isArray(responses) ? responses : [];
                const visibleAcknowledged = acknowledgements.some((response) => response?.visible === true);
                logger(visibleAcknowledged ? 'debug' : 'warn', 'Socket notification acknowledgement', {
                    event: 'socket_delivery_ack',
                    endpoint: getEndpointReference(endpointHash),
                    acknowledged: visibleAcknowledged,
                    responseCount: acknowledgements.length,
                    timedOut: Boolean(error)
                });
                resolve(visibleAcknowledged);
            });
    });
};
