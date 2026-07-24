import crypto from 'crypto';
import { Op } from 'sequelize';

import { db } from '../../config/database.js';
import diningSessionRepo from '../repositories/diningSession.repository.js';
import sessionJoinRequestRepo from '../repositories/sessionJoinRequest.repository.js';
import sessionMemberRepo from '../repositories/sessionMember.repository.js';
import tableRepo from '../repositories/table.repository.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const ACTIVE_SESSION_STATUSES = ['ACTIVE', 'PAYMENT_PENDING'];
const JOIN_REQUEST_TTL_MS = 60 * 1000;
const normalizeMobile = (value) => String(value || '').replace(/\D/g, '').slice(-10);

const generateSessionCode = async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
        const exists = await diningSessionRepo.findOne({ where: { sessionCode: code }, attributes: ['id'] });
        if (!exists) return code;
    }
    throw CustomError(STATUS_CODE.INTERNAL_SERVER_ERROR, 'Unable to generate RC Session code');
};

const getTable = async (tableId, options = {}) => {
    const table = await tableRepo.findOne({
        where: { id: tableId },
        attributes: ['id', 'hotelId', 'tableNumber', 'tableName', 'status', 'qrEnabled', 'activeSessionId'],
        ...options
    });
    if (!table) throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');
    return table;
};

const getActiveSession = async (tableId, options = {}) =>
    diningSessionRepo.findOne({
        where: { tableId, status: { [Op.in]: ACTIVE_SESSION_STATUSES } },
        order: [['startedAt', 'DESC']],
        ...options
    });

const expireRequestIfNeeded = async (request, options = {}) => {
    if (!request || request.status !== 'PENDING') return request;
    if (new Date(request.expiresAt).getTime() > Date.now()) return request;

    await request.update(
        { status: 'EXPIRED', respondedAt: new Date() },
        options
    );
    return request;
};

const assertOwner = (session, mobileNumber) => {
    const mobile = normalizeMobile(mobileNumber);
    if (!session || normalizeMobile(session.ownerMobile) !== mobile) {
        throw CustomError(STATUS_CODE.FORBIDDEN, 'Only the RC Session host can perform this action');
    }
};

const serializeSession = (session) => ({
    id: session.id,
    sessionCode: session.sessionCode,
    status: session.status,
    tableId: session.tableId,
    hotelId: session.hotelId,
    ownerMobile: session.ownerMobile,
    startedAt: session.startedAt
});

const getCustomerSessionDetails = async ({ tableId, mobileNumber }) => {
    const mobile = normalizeMobile(mobileNumber);
    const session = await getActiveSession(tableId);
    if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');

    const currentMember = await sessionMemberRepo.findOne({
        where: { sessionId: session.id, mobileNumber: mobile, status: 'ACTIVE' }
    });
    if (!currentMember) throw CustomError(STATUS_CODE.FORBIDDEN, 'You are not a member of this RC Session');

    const members = await db.sessionMembers.findAll({
        where: { sessionId: session.id, status: 'ACTIVE' },
        attributes: ['id', 'mobileNumber', 'role', 'status', 'joinedAt'],
        order: [['role', 'DESC'], ['joinedAt', 'ASC']]
    });

    return {
        session: serializeSession(session),
        currentMemberId: currentMember.id,
        isHost: currentMember.role === 'OWNER',
        members
    };
};

const removeMember = async ({ tableId, memberId, mobileNumber }) =>
    db.tables.sequelize.transaction(async (transaction) => {
        const session = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');
        assertOwner(session, mobileNumber);

        const member = await sessionMemberRepo.findOne({
            where: { id: memberId, sessionId: session.id, status: 'ACTIVE' },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!member) throw CustomError(STATUS_CODE.NOT_FOUND, 'Session member not found');
        if (member.role === 'OWNER') throw CustomError(STATUS_CODE.BAD_REQUEST, 'The host cannot be removed');

        await member.update({ status: 'REMOVED', leftAt: new Date() }, { transaction });
        return { message: 'Member removed', sessionId: session.id, memberId, mobileNumber: member.mobileNumber };
    });

const leave = async ({ tableId, mobileNumber }) =>
    db.tables.sequelize.transaction(async (transaction) => {
        const session = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');
        const member = await sessionMemberRepo.findOne({
            where: { sessionId: session.id, mobileNumber: normalizeMobile(mobileNumber), status: 'ACTIVE' },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!member) throw CustomError(STATUS_CODE.NOT_FOUND, 'Session membership not found');
        if (member.role === 'OWNER') throw CustomError(STATUS_CODE.BAD_REQUEST, 'Host must end the session');
        await member.update({ status: 'LEFT', leftAt: new Date() }, { transaction });
        return { message: 'You left the RC Session', sessionId: session.id, memberId: member.id };
    });

const end = async ({ tableId, mobileNumber }) =>
    db.tables.sequelize.transaction(async (transaction) => {
        const table = await getTable(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        const session = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');
        assertOwner(session, mobileNumber);
        const now = new Date();

        await session.update({ status: 'CLOSED', closedAt: now }, { transaction });
        await db.sessionMembers.update(
            { status: 'LEFT', leftAt: now },
            { where: { sessionId: session.id, status: 'ACTIVE' }, transaction }
        );
        await db.sessionJoinRequests.update(
            { status: 'CANCELLED', respondedAt: now },
            { where: { sessionId: session.id, status: 'PENDING' }, transaction }
        );
        await table.update(
            { status: 'AVAILABLE', activeSessionId: null, qrEnabled: true },
            { transaction }
        );
        return { message: 'RC Session ended', sessionId: session.id, tableId: session.tableId };
    });

const getAvailability = async (tableId) => {
    const table = await getTable(tableId);
    const session = await getActiveSession(tableId, {
        attributes: ['id', 'status', 'startedAt']
    });

    return {
        table: {
            id: table.id,
            hotelId: table.hotelId,
            tableNumber: table.tableNumber,
            tableName: table.tableName,
            status: table.status,
            qrEnabled: Boolean(table.qrEnabled)
        },
        canOrder: Boolean(table.qrEnabled) && table.status !== 'PAYMENT_PENDING',
        hasActiveSession: Boolean(session),
        session: session
            ? { id: session.id, status: session.status, startedAt: session.startedAt }
            : null
    };
};

const start = async ({ tableId, customerId, mobileNumber }) => {
    const mobile = normalizeMobile(mobileNumber);
    if (mobile.length !== 10) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Valid mobile number is required');

    return db.tables.sequelize.transaction(async (transaction) => {
        const table = await getTable(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!table.qrEnabled) throw CustomError(STATUS_CODE.FORBIDDEN, 'This table QR is currently unavailable');
        if (table.status === 'PAYMENT_PENDING') {
            throw CustomError(STATUS_CODE.CONFLICT, 'Payment is pending for this table');
        }

        const existing = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (existing) {
            throw CustomError(STATUS_CODE.CONFLICT, 'An active RC Session already exists for this table');
        }

        const sessionCode = await generateSessionCode();
        const session = await diningSessionRepo.create(
            {
                sessionCode,
                hotelId: table.hotelId,
                tableId,
                ownerCustomerId: customerId || null,
                ownerMobile: mobile,
                status: 'ACTIVE'
            },
            { transaction }
        );

        await sessionMemberRepo.create(
            {
                sessionId: session.id,
                customerId: customerId || null,
                mobileNumber: mobile,
                role: 'OWNER',
                status: 'ACTIVE'
            },
            { transaction }
        );

        await table.update(
            { status: 'OCCUPIED', activeSessionId: session.id, qrEnabled: true },
            { transaction }
        );

        return {
            message: 'RC Session started successfully',
            session: {
                id: session.id,
                sessionCode: session.sessionCode,
                status: session.status,
                tableId: session.tableId,
                hotelId: session.hotelId,
                ownerMobile: session.ownerMobile,
                startedAt: session.startedAt
            }
        };
    });
};

const requestJoin = async ({ tableId, sessionCode, customerId, mobileNumber }) => {
    const mobile = normalizeMobile(mobileNumber);
    if (mobile.length !== 10) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Valid mobile number is required');

    return db.tables.sequelize.transaction(async (transaction) => {
        const table = await getTable(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!table.qrEnabled) throw CustomError(STATUS_CODE.FORBIDDEN, 'This table QR is currently unavailable');
        if (table.status === 'PAYMENT_PENDING') {
            throw CustomError(STATUS_CODE.CONFLICT, 'Payment is pending for this table');
        }

        const session = await diningSessionRepo.findOne({
            where: {
                tableId,
                sessionCode: String(sessionCode).trim().toUpperCase(),
                status: 'ACTIVE'
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Invalid session code');
        if (normalizeMobile(session.ownerMobile) === mobile) {
            throw CustomError(STATUS_CODE.CONFLICT, 'You are already the host of this RC Session');
        }
        const requestingCustomer = await db.customer.findOne({
            where: { phoneNumber: mobile },
            attributes: ['name'],
            transaction
        });
        const requesterName = requestingCustomer?.name || 'Friend';

        const existingMember = await sessionMemberRepo.findOne({
            where: { sessionId: session.id, mobileNumber: mobile, status: 'ACTIVE' },
            transaction
        });
        if (existingMember) {
            return {
                message: 'You are already a member of this RC Session',
                joined: true,
                session: {
                    id: session.id,
                    sessionCode: session.sessionCode,
                    status: session.status,
                    tableId: session.tableId,
                    hotelId: session.hotelId
                }
            };
        }

        const previousRequest = await sessionJoinRequestRepo.findOne({
            where: { sessionId: session.id, mobileNumber: mobile, status: 'PENDING' },
            order: [['requestedAt', 'DESC']],
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (previousRequest) {
            await expireRequestIfNeeded(previousRequest, { transaction });
            if (previousRequest.status === 'PENDING') {
                return {
                    message: 'Join request is already waiting for host approval',
                    joined: false,
                    request: {
                        id: previousRequest.id,
                        status: previousRequest.status,
                        expiresAt: previousRequest.expiresAt,
                        requesterName
                    }
                };
            }
        }

        const now = new Date();
        const request = await sessionJoinRequestRepo.create(
            {
                sessionId: session.id,
                tableId,
                customerId: customerId || null,
                mobileNumber: mobile,
                status: 'PENDING',
                requestedAt: now,
                expiresAt: new Date(now.getTime() + JOIN_REQUEST_TTL_MS)
            },
            { transaction }
        );

        return {
            message: 'Join request sent. Waiting for host approval',
            joined: false,
            request: {
                id: request.id,
                status: request.status,
                expiresAt: request.expiresAt,
                requesterName
            },
            session: {
                id: session.id,
                status: session.status,
                tableId: session.tableId,
                hotelId: session.hotelId
            }
        };
    });
};

const getPendingRequests = async ({ tableId, mobileNumber }) => {
    const session = await getActiveSession(tableId);
    if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');
    assertOwner(session, mobileNumber);

    await db.sessionJoinRequests.update(
        { status: 'EXPIRED', respondedAt: new Date() },
        {
            where: {
                sessionId: session.id,
                status: 'PENDING',
                expiresAt: { [Op.lte]: new Date() }
            }
        }
    );

    const requests = await sessionJoinRequestRepo.findAll({
        where: {
            sessionId: session.id,
            status: 'PENDING',
            expiresAt: { [Op.gt]: new Date() }
        },
        attributes: ['id', 'customerId', 'mobileNumber', 'status', 'requestedAt', 'expiresAt'],
        order: [['requestedAt', 'ASC']]
    });

    return {
        session: {
            id: session.id,
            sessionCode: session.sessionCode,
            tableId: session.tableId,
            status: session.status
        },
        requests
    };
};

const respondToJoinRequest = async ({ tableId, requestId, action, mobileNumber, customerId }) =>
    db.tables.sequelize.transaction(async (transaction) => {
        const session = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!session || session.status !== 'ACTIVE') {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');
        }
        assertOwner(session, mobileNumber);

        const request = await sessionJoinRequestRepo.findOne({
            where: { id: requestId, sessionId: session.id },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!request) throw CustomError(STATUS_CODE.NOT_FOUND, 'Join request not found');

        await expireRequestIfNeeded(request, { transaction });
        if (request.status === 'EXPIRED') {
            throw CustomError(STATUS_CODE.GONE, 'Join request expired');
        }
        if (request.status !== 'PENDING') {
            throw CustomError(STATUS_CODE.CONFLICT, `Join request is already ${request.status.toLowerCase()}`);
        }

        const now = new Date();
        if (action === 'REJECT') {
            await request.update(
                {
                    status: 'REJECTED',
                    respondedAt: now,
                    respondedByCustomerId: customerId || session.ownerCustomerId || null
                },
                { transaction }
            );
            return {
                message: 'Host rejected your request.',
                requestId: request.id,
                sessionId: session.id,
                status: 'REJECTED'
            };
        }

        let member = await sessionMemberRepo.findOne({
            where: { sessionId: session.id, mobileNumber: request.mobileNumber },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (member) {
            await member.update(
                {
                    customerId: request.customerId || member.customerId,
                    role: 'MEMBER',
                    status: 'ACTIVE',
                    leftAt: null
                },
                { transaction }
            );
        } else {
            member = await sessionMemberRepo.create(
                {
                    sessionId: session.id,
                    customerId: request.customerId || null,
                    mobileNumber: request.mobileNumber,
                    role: 'MEMBER',
                    status: 'ACTIVE'
                },
                { transaction }
            );
        }

        await request.update(
            {
                status: 'ACCEPTED',
                respondedAt: now,
                respondedByCustomerId: customerId || session.ownerCustomerId || null
            },
            { transaction }
        );

        return {
            message: 'Join request accepted',
            requestId: request.id,
            status: 'ACCEPTED',
            member: {
                id: member.id,
                mobileNumber: member.mobileNumber,
                role: member.role,
                status: member.status
            },
            session: {
                id: session.id,
                sessionCode: session.sessionCode,
                status: session.status,
                tableId: session.tableId,
                hotelId: session.hotelId
            }
        };
    });

const getJoinRequestStatus = async ({ requestId, mobileNumber }) => {
    const mobile = normalizeMobile(mobileNumber);
    const request = await sessionJoinRequestRepo.findOne({ where: { id: requestId } });
    if (!request) throw CustomError(STATUS_CODE.NOT_FOUND, 'Join request not found');
    if (normalizeMobile(request.mobileNumber) !== mobile) {
        throw CustomError(STATUS_CODE.FORBIDDEN, 'You cannot view this join request');
    }

    await expireRequestIfNeeded(request);
    const session = await diningSessionRepo.findOne({ where: { id: request.sessionId } });

    return {
        request: {
            id: request.id,
            status: request.status,
            requestedAt: request.requestedAt,
            expiresAt: request.expiresAt,
            respondedAt: request.respondedAt
        },
        joined: request.status === 'ACCEPTED',
        message:
            request.status === 'ACCEPTED'
                ? 'RC Session joined successfully'
                : request.status === 'REJECTED'
                    ? 'Host rejected your request'
                    : request.status === 'EXPIRED'
                        ? 'Join request expired. Please try again'
                        : 'Waiting for host approval',
        session: request.status === 'ACCEPTED' && session
            ? {
                id: session.id,
                sessionCode: session.sessionCode,
                status: session.status,
                tableId: session.tableId,
                hotelId: session.hotelId
            }
            : null
    };
};

const getDetails = async (hotelId, tableId) => {
    const table = await tableRepo.findOne({
        where: { id: tableId, hotelId },
        attributes: ['id', 'hotelId', 'tableNumber', 'tableName', 'status', 'qrEnabled', 'activeSessionId']
    });
    if (!table) throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');

    const session = await diningSessionRepo.findOne({
        where: { tableId, status: { [Op.in]: ACTIVE_SESSION_STATUSES } },
        include: [
            {
                model: db.sessionMembers,
                attributes: ['id', 'mobileNumber', 'role', 'status', 'joinedAt'],
                where: { status: 'ACTIVE' },
                required: false
            }
        ],
        order: [['startedAt', 'DESC']]
    });

    return { table, session };
};

const setTableAction = async (hotelId, tableId, action) =>
    db.tables.sequelize.transaction(async (transaction) => {
        const table = await tableRepo.findOne({
            where: { id: tableId, hotelId },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!table) throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');

        const activeSession = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        const updates = {};

        if (action === 'ACTIVATE') {
            updates.qrEnabled = true;
            updates.status = activeSession ? 'OCCUPIED' : 'AVAILABLE';
        } else if (action === 'DISABLE') {
            updates.qrEnabled = false;
            if (!activeSession) updates.status = 'AVAILABLE';
        } else if (action === 'PAYMENT_PENDING') {
            if (!activeSession || activeSession.status !== 'ACTIVE') {
                throw CustomError(STATUS_CODE.CONFLICT, 'No active RC Session found');
            }
            await activeSession.update({ status: 'PAYMENT_PENDING' }, { transaction });
            updates.status = 'PAYMENT_PENDING';
            updates.qrEnabled = false;
        } else if (action === 'REOPEN') {
            if (!activeSession || activeSession.status !== 'PAYMENT_PENDING') {
                throw CustomError(STATUS_CODE.CONFLICT, 'No payment-pending RC Session found');
            }
            await activeSession.update({ status: 'ACTIVE', paymentCompletedAt: null }, { transaction });
            updates.status = 'OCCUPIED';
            updates.qrEnabled = true;
        }

        await table.update(updates, { transaction });
        return { message: `Table action ${action} completed`, table: await table.reload({ transaction }) };
    });

const close = async (hotelId, tableId, userId, keepTableActive = false) =>
    db.tables.sequelize.transaction(async (transaction) => {
        const table = await tableRepo.findOne({
            where: { id: tableId, hotelId },
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!table) throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');

        const session = await getActiveSession(tableId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!session) throw CustomError(STATUS_CODE.NOT_FOUND, 'Active RC Session not found');

        const now = new Date();
        await session.update(
            {
                status: 'CLOSED',
                paymentCompletedAt: session.paymentCompletedAt || now,
                closedAt: now,
                closedByUserId: userId || null
            },
            { transaction }
        );

        await db.sessionMembers.update(
            { status: 'LEFT', leftAt: now },
            { where: { sessionId: session.id, status: 'ACTIVE' }, transaction }
        );

        await db.sessionJoinRequests.update(
            { status: 'CANCELLED', respondedAt: now },
            { where: { sessionId: session.id, status: 'PENDING' }, transaction }
        );

        await table.update(
            {
                status: 'AVAILABLE',
                activeSessionId: null,
                qrEnabled: Boolean(keepTableActive)
            },
            { transaction }
        );

        return {
            message: keepTableActive
                ? 'RC Session closed; table is ready for a new session'
                : 'RC Session closed and table QR disabled',
            tableId,
            closedSessionId: session.id,
            qrEnabled: Boolean(keepTableActive)
        };
    });

export default {
    getAvailability,
    start,
    requestJoin,
    getPendingRequests,
    respondToJoinRequest,
    getJoinRequestStatus,
    getCustomerSessionDetails,
    removeMember,
    leave,
    end,
    getDetails,
    setTableAction,
    close
};
