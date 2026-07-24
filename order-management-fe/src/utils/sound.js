const SOUND_PATHS = {
    bell: '/sounds/bell.mp3',
    placed: '/sounds/place.mp3',
    ready: '/sounds/ready.mp3',
    cancelled: '/sounds/cancel.mp3'
};

const lastPlayedAt = new Map();

const canPlay = (key, cooldownMs) => {
    const now = Date.now();
    const previous = lastPlayedAt.get(key) || 0;

    if (now - previous < cooldownMs) {
        return false;
    }

    lastPlayedAt.set(key, now);
    return true;
};

export const playSound = async (soundName, options = {}) => {
    if (localStorage.getItem('rcdineNotificationSound') === 'off') return false;
    const {
        dedupeKey = soundName,
        cooldownMs = 1500,
        volume = 1
    } = options;

    const src = SOUND_PATHS[soundName];

    if (!src || !canPlay(dedupeKey, cooldownMs)) {
        return false;
    }

    try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = Math.max(0, Math.min(1, Number(volume) || 1));
        await audio.play();
        return true;
    } catch (error) {
        console.warn(`Unable to play ${soundName} sound`, error);
        return false;
    }
};

export const playManagerBell = (orderKey = 'new-order') =>
    playSound('bell', {
        dedupeKey: `manager-bell-${orderKey}`,
        cooldownMs: 10000,
        volume: 1
    });

export const playOrderPlacedSound = (orderKey = 'placed') =>
    playSound('placed', {
        dedupeKey: `customer-placed-${orderKey}`,
        cooldownMs: 10000,
        volume: 0.9
    });

export const playOrderReadySound = (orderKey = 'ready') =>
    playSound('ready', {
        dedupeKey: `customer-ready-${orderKey}`,
        cooldownMs: 60000,
        volume: 1
    });

export const playOrderCancelledSound = (orderKey = 'cancelled') =>
    playSound('cancelled', {
        dedupeKey: `order-cancelled-${orderKey}`,
        cooldownMs: 10000,
        volume: 1
    });
