import { db } from '../../config/database.js';
import env from '../../config/env.js';
import { DEFAULT_ACTIVE_QR_TEMPLATE_IDS, normalizeActiveQrTemplateIds } from '../../config/qrTemplates.js';
import { decryptServerSecret, encryptServerSecret } from '../utils/secretEncryption.js';

const ensureRow = async () => {
    const [row] = await db.appSettings.findOrCreate({
        where: { id: 1 },
        defaults: {
            id: 1,
            razorpayKeyId: env.razorpay.keyId || null,
            razorpayKeySecret: encryptServerSecret(env.razorpay.keySecret),
            activeQrTemplateIds: DEFAULT_ACTIVE_QR_TEMPLATE_IDS
        }
    });
    return row;
};

const get = async () => {
    const row = await ensureRow();
    return {
        razorpay: {
            keyId: row.razorpayKeyId || env.razorpay.keyId || '',
            keySecret: decryptServerSecret(row.razorpayKeySecret) || env.razorpay.keySecret || ''
        },
        qrTemplates: {
            activeIds: normalizeActiveQrTemplateIds(row.activeQrTemplateIds)
        }
    };
};

const update = async ({ razorpay, qrTemplates } = {}) => {
    const row = await ensureRow();
    const changes = {};
    if (razorpay?.keyId) changes.razorpayKeyId = String(razorpay.keyId).trim();
    const submittedSecret = String(razorpay?.keySecret || '').trim();
    const isMaskedSecret = submittedSecret.includes('*') || submittedSecret.includes('•') || submittedSecret.includes('â€¢');
    if (submittedSecret && !isMaskedSecret) {
        changes.razorpayKeySecret = encryptServerSecret(submittedSecret);
    }
    if (Array.isArray(qrTemplates?.activeIds)) {
        changes.activeQrTemplateIds = normalizeActiveQrTemplateIds(qrTemplates.activeIds);
    }
    if (Object.keys(changes).length) await row.update(changes);
    return get();
};

export default { get, update };
