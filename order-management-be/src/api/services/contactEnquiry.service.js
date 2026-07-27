import { Op } from 'sequelize';
import { db } from '../../config/database.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const clean = (value, maxLength = 5000) =>
    String(value ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .trim()
        .slice(0, maxLength);

const normalizePayload = (payload = {}) => ({
    name: clean(payload.name, 100),
    mobile: clean(payload.mobile, 20).replace(/[^0-9+ -]/g, ''),
    email: clean(payload.email, 160).toLowerCase(),
    restaurantName: clean(payload.restaurantName, 160),
    message: clean(payload.message, 3000)
});

const validate = (data) => {
    if (data.name.length < 2) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Please enter a valid name');
    const digits = data.mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Please enter a valid mobile number');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Please enter a valid email address');
    if (data.message.length < 10) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Message must be at least 10 characters');
};

const create = async (payload) => {
    const data = normalizePayload(payload);
    validate(data);
    const recent = await db.contactEnquiries.findOne({
        where: {
            mobile: data.mobile,
            createdAt: { [Op.gte]: new Date(Date.now() - 60 * 1000) }
        }
    });
    if (recent) throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, 'Please wait a minute before sending another enquiry');
    const enquiry = await db.contactEnquiries.create(data);
    return { message: 'Thank you. Our team will contact you soon.', enquiryId: enquiry.id };
};

const list = async ({ page = 1, limit = 20, status = '', search = '' } = {}) => {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const where = {};
    if (['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].includes(status)) where.status = status;
    const q = clean(search, 100);
    if (q) {
        where[Op.or] = [
            { name: { [Op.like]: `%${q}%` } },
            { mobile: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } },
            { restaurantName: { [Op.like]: `%${q}%` } }
        ];
    }
    const result = await db.contactEnquiries.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: safeLimit,
        offset: (safePage - 1) * safeLimit
    });
    return { enquiries: result.rows, total: result.count, page: safePage, totalPages: Math.max(1, Math.ceil(result.count / safeLimit)) };
};

const update = async (id, payload = {}) => {
    const enquiry = await db.contactEnquiries.findByPk(id);
    if (!enquiry) throw CustomError(STATUS_CODE.NOT_FOUND, 'Contact enquiry not found');
    const status = clean(payload.status, 20).toUpperCase();
    if (status && !['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'].includes(status)) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid enquiry status');
    await enquiry.update({
        ...(status ? { status } : {}),
        ...(payload.adminNotes !== undefined ? { adminNotes: clean(payload.adminNotes, 3000) } : {})
    });
    return enquiry;
};

export default { create, list, update };
