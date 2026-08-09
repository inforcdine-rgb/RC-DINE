export const QR_TEMPLATE_IDS = [
    'neo-ivory',
    'noir-chrome',
    'terracotta-brew',
    'botanical-luxe',
    'digital-aura',
    'mocha-studio',
    'matcha-mist',
    'caramel-grid',
    'espresso-club',
    'peach-brunch',
    'cobalt-cafe',
    'lavender-latte',
    'sunrise-pop',
    'paper-cup',
    'roastery-mark',
    'minimal-sand',
    'berry-social',
    'mint-counter',
    'retro-diner',
    'midnight-bistro'
];

export const DEFAULT_ACTIVE_QR_TEMPLATE_IDS = QR_TEMPLATE_IDS.slice(0, 5);

export const normalizeActiveQrTemplateIds = (value) => {
    if (!Array.isArray(value)) return [...DEFAULT_ACTIVE_QR_TEMPLATE_IDS];

    const allowed = new Set(QR_TEMPLATE_IDS);
    return [...new Set(value.map((item) => String(item)).filter((item) => allowed.has(item)))];
};
