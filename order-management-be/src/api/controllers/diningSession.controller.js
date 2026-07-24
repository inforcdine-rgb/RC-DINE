import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { emitToRcRequest, emitToRcSession } from '../../config/socket.js';
import diningSessionService from '../services/diningSession.service.js';
import notificationService from '../services/notification.service.js';
import { STATUS_CODE } from '../utils/common.js';
import { resolveHotelAccessByTableId } from '../utils/hotelAccess.js';
import {
    closeSessionValidation,
    joinSessionValidation,
    memberActionValidation,
    managerSessionActionValidation,
    requestStatusValidation,
    respondJoinRequestValidation,
    startSessionValidation,
    tableAvailabilityValidation
} from '../validations/diningSession.validation.js';

const validationError = (res, result) =>
    res.status(STATUS_CODE.BAD_REQUEST).send({ message: result.error.message });
const maskPhone = (value) => {
    const phone = String(value || '').replace(/\D/g, '').slice(-10);
    return phone.length === 10 ? `${phone.slice(0, 2)}xxxxxx${phone.slice(-2)}` : 'Hidden';
};

const sendRcNotification = (phoneNumbers, data) =>
    notificationService.sendNotification(undefined, data, undefined, { phoneNumbers });

const scheduleJoinRequestExpiry = (requestId, expiresAt) => {
    const delay = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    const timer = setTimeout(async () => {
        try {
            const request = await db.sessionJoinRequests.findOne({ where: { id: requestId } });
            if (!request || request.status !== 'PENDING' || new Date(request.expiresAt).getTime() > Date.now()) return;
            await request.update({ status: 'EXPIRED', respondedAt: new Date() });
            const payload = {
                requestId,
                status: 'EXPIRED',
                message: 'Request expired.'
            };
            emitToRcRequest(requestId, 'session:join-expired', payload);
            await sendRcNotification([request.mobileNumber], {
                title: 'Join request expired',
                message: 'Your RC Session join request expired.',
                type: 'RC_JOIN_EXPIRED',
                category: 'RC_SESSION',
                entityId: requestId,
                dedupeKey: `rc-join-expired:${requestId}`,
                preservePath: true,
                meta: { action: 'session:join-expired', requestId }
            });
        } catch (error) {
            logger('error', 'RC Session request expiry notification failed', { message: error.message });
        }
    }, delay + 50);
    if (typeof timer.unref === 'function') timer.unref();
};

const availability = async (req, res) => {
    try {
        const valid = tableAvailabilityValidation({ tableId: req.params.tableId });
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.getAvailability(req.params.tableId);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session availability error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const start = async (req, res) => {
    try {
        const payload = { ...req.body, tableId: req.params.tableId };
        const valid = startSessionValidation(payload);
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.start({
            ...valid.value,
            mobileNumber: req.customer.phoneNumber,
            customerId: req.customer.customerId || valid.value.customerId || null
        });
        return res.status(STATUS_CODE.CREATED).send(result);
    } catch (error) {
        logger('error', 'RC Session start error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const requestJoin = async (req, res) => {
    try {
        const payload = { ...req.body, tableId: req.params.tableId };
        const valid = joinSessionValidation(payload);
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.requestJoin({
            ...valid.value,
            mobileNumber: req.customer.phoneNumber,
            customerId: req.customer.customerId || valid.value.customerId || null
        });

        if (!result.joined && result.request?.id && result.session?.id) {
            emitToRcSession(result.session.id, 'session:join-requested', {
                requestId: result.request.id,
                sessionId: result.session.id,
                tableId: result.session.tableId,
                mobileNumber: req.customer.phoneNumber,
                requesterName: result.request.requesterName,
                requestedAt: new Date().toISOString(),
                expiresAt: result.request.expiresAt
            });
            const session = await db.diningSessions.findOne({
                where: { id: result.session.id },
                attributes: ['ownerMobile']
            });
            await sendRcNotification([session?.ownerMobile], {
                title: 'RC Session join request',
                message: `${result.request.requesterName} wants to join your session. Phone: ${maskPhone(req.customer.phoneNumber)}`,
                type: 'RC_JOIN_REQUEST',
                category: 'RC_SESSION',
                entityId: result.request.id,
                dedupeKey: `rc-join-request:${result.request.id}`,
                preservePath: true,
                requireInteraction: true,
                actions: [
                    { action: 'open', title: 'Review' }
                ],
                meta: {
                    action: 'session:join-requested',
                    requestId: result.request.id,
                    sessionId: result.session.id
                }
            });
            scheduleJoinRequestExpiry(result.request.id, result.request.expiresAt);
        }

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session join request error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const pendingRequests = async (req, res) => {
    try {
        const valid = tableAvailabilityValidation({ tableId: req.params.tableId });
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.getPendingRequests({
            tableId: req.params.tableId,
            mobileNumber: req.customer.phoneNumber
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session pending requests error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const respondToRequest = async (req, res) => {
    try {
        const valid = respondJoinRequestValidation(req.body);
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.respondToJoinRequest({
            tableId: req.params.tableId,
            requestId: valid.value.requestId,
            action: valid.value.action,
            mobileNumber: req.customer.phoneNumber,
            customerId: req.customer.customerId || null
        });

        const eventName = result.status === 'ACCEPTED' ? 'session:join-approved' : 'session:join-rejected';
        emitToRcRequest(result.requestId, eventName, {
            requestId: result.requestId,
            status: result.status,
            message: result.message,
            session: result.session || null
        });
        emitToRcSession(result.session?.id || result.sessionId, 'session:members-updated', {
            sessionId: result.session?.id || result.sessionId
        });
        const request = await db.sessionJoinRequests.findOne({
            where: { id: result.requestId },
            attributes: ['mobileNumber']
        });
        await sendRcNotification([request?.mobileNumber], {
            title: result.status === 'ACCEPTED' ? 'Join request approved' : 'Join request rejected',
            message: result.message,
            type: result.status === 'ACCEPTED' ? 'RC_JOIN_APPROVED' : 'RC_JOIN_REJECTED',
            category: 'RC_SESSION',
            entityId: result.requestId,
            dedupeKey: `rc-join-${result.status.toLowerCase()}:${result.requestId}`,
            preservePath: true,
            meta: { action: eventName, requestId: result.requestId, sessionId: result.session?.id || result.sessionId }
        });

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session respond join request error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const customerDetails = async (req, res) => {
    try {
        const result = await diningSessionService.getCustomerSessionDetails({
            tableId: req.params.tableId,
            mobileNumber: req.customer.phoneNumber
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const valid = memberActionValidation({ memberId: req.params.memberId });
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.removeMember({
            tableId: req.params.tableId,
            memberId: valid.value.memberId,
            mobileNumber: req.customer.phoneNumber
        });
        emitToRcSession(result.sessionId, 'session:member-removed', result);
        emitToRcSession(result.sessionId, 'session:members-updated', { sessionId: result.sessionId });
        await sendRcNotification([result.mobileNumber], {
            title: 'Removed from RC Session',
            message: 'The host removed you from the RC Session.',
            type: 'RC_MEMBER_REMOVED',
            category: 'RC_SESSION',
            entityId: result.sessionId,
            dedupeKey: `rc-member-removed:${result.sessionId}:${result.memberId}`,
            preservePath: true,
            meta: { action: 'session:member-removed', ...result }
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const leave = async (req, res) => {
    try {
        const result = await diningSessionService.leave({
            tableId: req.params.tableId,
            mobileNumber: req.customer.phoneNumber
        });
        emitToRcSession(result.sessionId, 'session:member-left', result);
        emitToRcSession(result.sessionId, 'session:members-updated', { sessionId: result.sessionId });
        const session = await db.diningSessions.findOne({ where: { id: result.sessionId }, attributes: ['ownerMobile'] });
        await sendRcNotification([session?.ownerMobile], {
            title: 'RC Session member left',
            message: 'A member left your RC Session.',
            type: 'RC_MEMBER_LEFT',
            category: 'RC_SESSION',
            entityId: result.sessionId,
            dedupeKey: `rc-member-left:${result.sessionId}:${result.memberId}`,
            preservePath: true,
            meta: { action: 'session:member-left', ...result }
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const end = async (req, res) => {
    try {
        const result = await diningSessionService.end({
            tableId: req.params.tableId,
            mobileNumber: req.customer.phoneNumber
        });
        emitToRcSession(result.sessionId, 'session:ended', result);
        const members = await db.sessionMembers.findAll({
            where: { sessionId: result.sessionId },
            attributes: ['mobileNumber']
        });
        await sendRcNotification(members.map(({ mobileNumber }) => mobileNumber), {
            title: 'RC Session ended',
            message: 'The host ended the RC Session.',
            type: 'RC_SESSION_ENDED',
            category: 'RC_SESSION',
            entityId: result.sessionId,
            dedupeKey: `rc-session-ended:${result.sessionId}`,
            preservePath: true,
            meta: { action: 'session:ended', ...result }
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const requestStatus = async (req, res) => {
    try {
        const valid = requestStatusValidation({ requestId: req.params.requestId });
        if (valid.error) return validationError(res, valid);
        const result = await diningSessionService.getJoinRequestStatus({
            requestId: req.params.requestId,
            mobileNumber: req.customer.phoneNumber
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session join request status error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const details = async (req, res) => {
    try {
        const hotelId = await resolveHotelAccessByTableId(req.user, req.params.tableId);
        const result = await diningSessionService.getDetails(hotelId, req.params.tableId);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session details error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const tableAction = async (req, res) => {
    try {
        const valid = managerSessionActionValidation(req.body);
        if (valid.error) return validationError(res, valid);
        const hotelId = await resolveHotelAccessByTableId(req.user, req.params.tableId);
        const result = await diningSessionService.setTableAction(
            hotelId,
            req.params.tableId,
            valid.value.action
        );
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session table action error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const close = async (req, res) => {
    try {
        const valid = closeSessionValidation(req.body || {});
        if (valid.error) return validationError(res, valid);
        const hotelId = await resolveHotelAccessByTableId(req.user, req.params.tableId);
        const result = await diningSessionService.close(
            hotelId,
            req.params.tableId,
            req.user.id,
            valid.value.keepTableActive
        );
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'RC Session close error', { error: error.message });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

export default {
    availability,
    start,
    requestJoin,
    pendingRequests,
    respondToRequest,
    requestStatus,
    customerDetails,
    removeMember,
    leave,
    end,
    details,
    tableAction,
    close
};
