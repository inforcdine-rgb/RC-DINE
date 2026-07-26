import { db } from '../../config/database.js';

const DEFAULT_FEATURES = [
    'Online menu ordering',
    'Live order notifications',
    'Business statistics dashboard',
    'Customer feedback',
    'Online payment integration',
    'E-Invoice for orders'
];

const DEFAULT_PLANS = [
    {
        code: 'MONTHLY',
        name: 'Basic',
        subtitle: 'Monthly',
        amount: 1000,
        days: 30,
        features: DEFAULT_FEATURES,
        isPopular: false,
        isActive: true,
        displayOrder: 1,
        buttonText: 'Choose Basic'
    },
    {
        code: 'HALF_YEARLY',
        name: 'Pro',
        subtitle: '6 Months',
        amount: 5500,
        days: 180,
        features: DEFAULT_FEATURES,
        isPopular: true,
        isActive: true,
        displayOrder: 2,
        buttonText: 'Choose Pro'
    },
    {
        code: 'YEARLY',
        name: 'Premium',
        subtitle: 'Yearly',
        amount: 11000,
        days: 365,
        features: DEFAULT_FEATURES,
        isPopular: false,
        isActive: true,
        displayOrder: 3,
        buttonText: 'Choose Premium'
    }
];

const normalizeCode = (code) => {
    const value = String(code || '').trim().toUpperCase();
    return value === 'SIX_MONTHS' ? 'HALF_YEARLY' : value;
};

const ensureDefaults = async () => {
    for (const plan of DEFAULT_PLANS) {
        await db.subscriptionPlans.findOrCreate({
            where: { code: plan.code },
            defaults: plan
        });
    }
};

const findActive = async () =>
    db.subscriptionPlans.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC'], ['id', 'ASC']]
    });

const findAll = async () =>
    db.subscriptionPlans.findAll({
        order: [['displayOrder', 'ASC'], ['id', 'ASC']]
    });

const findByCode = async (code, activeOnly = true) => {
    const where = { code: normalizeCode(code) };
    if (activeOnly) where.isActive = true;
    return db.subscriptionPlans.findOne({ where });
};

const updateByCode = async (code, payload) => {
    const normalizedCode = normalizeCode(code);
    const plan = await db.subscriptionPlans.findOne({
        where: { code: normalizedCode }
    });
    if (!plan) return null;
    await plan.update(payload);
    return plan;
};

export default {
    DEFAULT_FEATURES,
    ensureDefaults,
    findActive,
    findAll,
    findByCode,
    updateByCode,
    normalizeCode
};
