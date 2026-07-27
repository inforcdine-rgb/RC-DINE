import { db } from '../../config/database.js';

const DEFAULT_PAGES = {
    privacy: {
        title: 'Privacy Policy',
        content: `RC Dine respects your privacy. This policy explains how information is collected, used and protected when you use our restaurant management and QR ordering services.

Information we may collect
We may collect account details, restaurant information, contact information, order information, payment status and technical information required to operate the service.

How information is used
Information is used to provide the service, process subscriptions, support users, improve security and communicate important service updates.

Data protection
We use reasonable technical and organisational safeguards. Users should also protect their passwords and account access.

Contact
For privacy questions, contact RC Dine through the Contact page.`,
        metaTitle: 'Privacy Policy | RC Dine',
        metaDescription: 'Read how RC Dine collects, uses and protects information.'
    },
    terms: {
        title: 'Terms & Conditions',
        content: `These Terms & Conditions govern access to and use of RC Dine. By creating an account or using the service, you agree to these terms.

Service use
Users must provide accurate information, protect account credentials and use RC Dine only for lawful restaurant operations.

Subscriptions and payments
Paid features are available according to the selected subscription plan. Fees, duration and renewal details are shown before payment.

Restaurant responsibility
Each restaurant is responsible for its menu, pricing, taxes, customer service, fulfilment and compliance with applicable laws.

Availability
We work to keep the service available, but uninterrupted operation cannot be guaranteed during maintenance, network failures or events outside our control.

Termination
Access may be suspended or terminated for misuse, fraud, security risk or material breach of these terms.`,
        metaTitle: 'Terms & Conditions | RC Dine',
        metaDescription: 'Read the terms governing use of the RC Dine platform.'
    }
};

const normalizeSlug = (slug) => {
    const value = String(slug || '')
        .trim()
        .toLowerCase();

    if (!Object.prototype.hasOwnProperty.call(DEFAULT_PAGES, value)) {
        const error = new Error('Legal page not found');
        error.code = 404;
        throw error;
    }

    return value;
};

const getOrCreate = async (slug) => {
    const safeSlug = normalizeSlug(slug);
    let page = await db.legalPages.findOne({ where: { slug: safeSlug } });

    if (!page) {
        page = await db.legalPages.create({
            slug: safeSlug,
            ...DEFAULT_PAGES[safeSlug],
            lastUpdatedAt: new Date(),
            isPublished: true
        });
    }

    return page;
};

const getPublic = async (slug) => {
    const page = await getOrCreate(slug);

    if (!page.isPublished) {
        const error = new Error('This legal page is not published');
        error.code = 404;
        throw error;
    }

    return page.toJSON();
};

const getAdmin = async (slug) => {
    const page = await getOrCreate(slug);
    return page.toJSON();
};

const update = async (slug, payload = {}) => {
    const page = await getOrCreate(slug);
    const changes = {};

    if (payload.title !== undefined) {
        const title = String(payload.title).trim();
        if (!title) throw new Error('Title is required');
        changes.title = title.slice(0, 180);
    }

    if (payload.content !== undefined) {
        const content = String(payload.content).trim();
        if (!content) throw new Error('Content is required');
        changes.content = content.slice(0, 100000);
    }

    if (payload.metaTitle !== undefined) {
        changes.metaTitle =
            String(payload.metaTitle || '')
                .trim()
                .slice(0, 180) || null;
    }

    if (payload.metaDescription !== undefined) {
        changes.metaDescription =
            String(payload.metaDescription || '')
                .trim()
                .slice(0, 320) || null;
    }

    if (payload.isPublished !== undefined) {
        changes.isPublished = Boolean(payload.isPublished);
    }

    changes.lastUpdatedAt = new Date();
    await page.update(changes);

    return page.toJSON();
};

export default { getPublic, getAdmin, update };
