const SOUND_PATHS = {
    bell: '/sounds/bell.mp3',
    placed: '/sounds/place.mp3',
    ready: '/sounds/ready.mp3',
    cancelled: '/sounds/cancel.mp3'
};

const SOUND_SETTING_KEY = 'rcdineNotificationSound';
const AUDIO_RESUME_TIMEOUT_MS = 350;
const lastPlayedAt = new Map();
const pendingPlayKeys = new Set();
const audioCache = new Map();
const audioBufferCache = new Map();
const audioBufferPromises = new Map();

let audioContext = null;
let unlockPromise = null;
let removeUnlockListeners = null;

const isSoundEnabled = () => {
    if (typeof window === 'undefined') return false;

    try {
        return window.localStorage.getItem(SOUND_SETTING_KEY) !== 'off';
    } catch (error) {
        return true;
    }
};

const wasPlayedRecently = (key, cooldownMs) => {
    const previous = lastPlayedAt.get(key) || 0;
    return Date.now() - previous < cooldownMs;
};

const markPlayed = (key) => {
    lastPlayedAt.set(key, Date.now());
};

const getAudio = (soundName, src) => {
    if (!audioCache.has(soundName)) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.playsInline = true;
        audio.load();
        audioCache.set(soundName, audio);
    }

    return audioCache.get(soundName);
};

const getAudioContext = () => {
    if (audioContext && audioContext.state !== 'closed') return audioContext;
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
    return audioContext;
};

const resumeAudioContext = async (context) => {
    if (!context || context.state === 'closed') return false;
    if (context.state === 'running') return true;

    try {
        await Promise.race([
            context.resume(),
            new Promise((resolve) => window.setTimeout(resolve, AUDIO_RESUME_TIMEOUT_MS))
        ]);
    } catch (error) {
        return false;
    }

    return context.state === 'running';
};

const decodeAudioData = (context, arrayBuffer) =>
    new Promise((resolve, reject) => {
        context.decodeAudioData(arrayBuffer, resolve, reject);
    });

const loadAudioBuffer = async (soundName, src, context) => {
    if (audioBufferCache.has(soundName)) return audioBufferCache.get(soundName);
    if (audioBufferPromises.has(soundName)) return audioBufferPromises.get(soundName);

    const bufferPromise = window
        .fetch(src, { cache: 'force-cache' })
        .then((response) => {
            if (!response.ok) throw new Error(`Sound request failed with status ${response.status}`);
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => decodeAudioData(context, arrayBuffer))
        .then((buffer) => {
            audioBufferCache.set(soundName, buffer);
            audioBufferPromises.delete(soundName);
            return buffer;
        })
        .catch((error) => {
            audioBufferPromises.delete(soundName);
            throw error;
        });

    audioBufferPromises.set(soundName, bufferPromise);
    return bufferPromise;
};

const playWithWebAudio = async (soundName, src, volume) => {
    const context = getAudioContext();
    if (!(await resumeAudioContext(context))) return false;

    const buffer = await loadAudioBuffer(soundName, src, context);
    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
        source.disconnect();
        gain.disconnect();
    };
    source.start(0);
    return true;
};

const playWithHtmlAudio = async (soundName, src, volume) => {
    const audio = getAudio(soundName, src);
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    await audio.play();
    return true;
};

const unlockHtmlAudio = async () => {
    const audio = getAudio('bell', SOUND_PATHS.bell);
    const previousVolume = audio.volume;

    try {
        audio.volume = 0;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.volume = previousVolume;
        return true;
    } catch (error) {
        audio.volume = previousVolume;
        return false;
    }
};

export const unlockNotificationSounds = async () => {
    if (typeof window === 'undefined') return false;
    if (unlockPromise) return unlockPromise;

    unlockPromise = (async () => {
        const context = getAudioContext();
        const contextReady = await resumeAudioContext(context);

        if (contextReady) {
            const preloadResults = await Promise.allSettled(
                Object.entries(SOUND_PATHS).map(([soundName, src]) => loadAudioBuffer(soundName, src, context))
            );
            return preloadResults.some((result) => result.status === 'fulfilled');
        }

        return unlockHtmlAudio();
    })();

    try {
        const unlocked = await unlockPromise;
        if (!unlocked) unlockPromise = null;
        return unlocked;
    } catch (error) {
        unlockPromise = null;
        return false;
    }
};

export const initializeNotificationSounds = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
    if (removeUnlockListeners) return removeUnlockListeners;

    const events = ['pointerdown', 'touchend', 'keydown'];
    const removeListeners = () => {
        events.forEach((eventName) => document.removeEventListener(eventName, handleUserGesture, true));
        if (removeUnlockListeners === removeListeners) removeUnlockListeners = null;
    };
    const handleUserGesture = () => {
        unlockNotificationSounds()
            .then((unlocked) => {
                if (unlocked) removeListeners();
            })
            .catch(() => {});
    };

    events.forEach((eventName) => document.addEventListener(eventName, handleUserGesture, true));
    removeUnlockListeners = removeListeners;
    return removeListeners;
};

export const playSound = async (soundName, options = {}) => {
    if (!isSoundEnabled()) return false;

    const { dedupeKey = soundName, cooldownMs = 1500, volume = 1 } = options;
    const src = SOUND_PATHS[soundName];
    const normalizedVolume = Math.max(0, Math.min(1, Number(volume) || 1));

    if (!src || pendingPlayKeys.has(dedupeKey) || wasPlayedRecently(dedupeKey, cooldownMs)) {
        return false;
    }

    pendingPlayKeys.add(dedupeKey);

    try {
        let played = false;

        try {
            played = await playWithWebAudio(soundName, src, normalizedVolume);
        } catch (webAudioError) {
            console.warn(`Web Audio could not play ${soundName}`, webAudioError);
        }

        if (!played) {
            played = await playWithHtmlAudio(soundName, src, normalizedVolume);
        }

        if (played) markPlayed(dedupeKey);
        return played;
    } catch (error) {
        console.warn(`Unable to play ${soundName} sound`, error);
        return false;
    } finally {
        pendingPlayKeys.delete(dedupeKey);
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
