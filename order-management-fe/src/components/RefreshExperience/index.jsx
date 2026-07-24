import React, { memo, useEffect, useRef, useState } from 'react';
import { hasRefreshHandlers, runRefreshHandlers } from '../../utils/refreshBus';
import './style.css';

const THRESHOLD = 72;
const MAX_PULL = 112;

const getScrollContainer = (target) => {
    let element = target instanceof Element ? target : null;
    while (element && element !== document.body) {
        const { overflowY } = window.getComputedStyle(element);
        const canScroll = /(auto|scroll)/.test(overflowY) && element.scrollHeight > element.clientHeight;
        if (canScroll) return element;
        element = element.parentElement;
    }
    return document.scrollingElement;
};

const isAtTop = (scrollContainer) => (
    scrollContainer === document.scrollingElement
        ? window.scrollY <= 0
        : scrollContainer?.scrollTop <= 0
);

function RefreshExperience({ children }) {
    const [pull, setPull] = useState(0);
    const [status, setStatus] = useState('idle');
    const [online, setOnline] = useState(() => navigator.onLine);
    const [dragging, setDragging] = useState(false);
    const touchStart = useRef(0);
    const pulling = useRef(false);
    const frame = useRef(null);
    const resetTimer = useRef(null);
    const hapticTriggered = useRef(false);
    const pullRef = useRef(0);
    const statusRef = useRef('idle');
    const scrollContainerRef = useRef(null);
    const onlineRef = useRef(navigator.onLine);
    const retryTimer = useRef(null);
    const retryAttempt = useRef(0);

    useEffect(() => {
        const setNetworkState = (isOnline) => {
            const reconnected = isOnline && !onlineRef.current;
            onlineRef.current = isOnline;
            setOnline(isOnline);
            if (reconnected && hasRefreshHandlers()) {
                window.setTimeout(() => runRefreshHandlers().catch(() => {}), 250);
            }
        };
        const updateOnline = () => setNetworkState(navigator.onLine);
        const updateNetworkState = (event) => setNetworkState(event.detail?.online !== false);
        const refreshVisibleScreen = () => {
            if (document.visibilityState === 'visible' && navigator.onLine && hasRefreshHandlers()) {
                runRefreshHandlers().catch(() => {});
            }
        };
        window.addEventListener('online', updateOnline);
        window.addEventListener('offline', updateOnline);
        window.addEventListener('focus', refreshVisibleScreen);
        window.addEventListener('rcdine:network-state', updateNetworkState);
        document.addEventListener('visibilitychange', refreshVisibleScreen);
        const backgroundRefreshTimer = window.setInterval(refreshVisibleScreen, 60 * 1000);

        const optimizeImage = (image) => {
            if (!image.hasAttribute('loading')) image.loading = 'lazy';
            if (!image.hasAttribute('decoding')) image.decoding = 'async';
        };
        document.querySelectorAll('img').forEach(optimizeImage);

        const imageObserver = new MutationObserver((mutations) => {
            mutations.forEach(({ addedNodes }) => addedNodes.forEach((node) => {
                if (node?.nodeType !== Node.ELEMENT_NODE) return;
                const images = node.tagName === 'IMG'
                    ? [node]
                    : [...node.querySelectorAll('img')];
                images.forEach(optimizeImage);
            }));
        });
        imageObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('online', updateOnline);
            window.removeEventListener('offline', updateOnline);
            window.removeEventListener('focus', refreshVisibleScreen);
            window.removeEventListener('rcdine:network-state', updateNetworkState);
            document.removeEventListener('visibilitychange', refreshVisibleScreen);
            window.clearInterval(backgroundRefreshTimer);
            imageObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (online) {
            retryAttempt.current = 0;
            if (retryTimer.current) window.clearTimeout(retryTimer.current);
            return undefined;
        }

        let cancelled = false;
        const retry = async () => {
            if (cancelled) return;
            if (navigator.onLine && hasRefreshHandlers()) {
                window.__rcdineNetworkOffline = false;
                try {
                    await runRefreshHandlers();
                    onlineRef.current = true;
                    setOnline(true);
                    return;
                } catch (error) {
                    window.__rcdineNetworkOffline = true;
                }
            }

            retryAttempt.current += 1;
            const delay = Math.min(30000, 3000 * (2 ** retryAttempt.current));
            retryTimer.current = window.setTimeout(retry, delay);
        };

        retryTimer.current = window.setTimeout(retry, 3000);
        return () => {
            cancelled = true;
            if (retryTimer.current) window.clearTimeout(retryTimer.current);
        };
    }, [online]);

    useEffect(() => {
        const finishPull = async () => {
            if (!pulling.current) return;
            pulling.current = false;
            setDragging(false);

            if (pullRef.current < THRESHOLD) {
                pullRef.current = 0;
                setPull(0);
                return;
            }

            pullRef.current = THRESHOLD;
            setPull(THRESHOLD);
            statusRef.current = 'refreshing';
            setStatus('refreshing');
            try {
                const changed = await runRefreshHandlers();
                statusRef.current = changed ? 'updated' : 'current';
                setStatus(changed ? 'updated' : 'current');
            } catch (error) {
                statusRef.current = 'offline';
                setStatus('offline');
            }

            resetTimer.current = window.setTimeout(() => {
                pullRef.current = 0;
                statusRef.current = 'idle';
                setPull(0);
                setStatus('idle');
            }, 950);
        };

        const onTouchStart = (event) => {
            if (!event.touches.length || !hasRefreshHandlers() || statusRef.current === 'refreshing') return;
            if (event.target.closest('input, textarea, select, [data-no-pull-refresh]')) return;
            const scrollContainer = getScrollContainer(event.target);
            if (!isAtTop(scrollContainer)) return;

            touchStart.current = event.touches[0].clientY;
            scrollContainerRef.current = scrollContainer;
            pulling.current = true;
            hapticTriggered.current = false;
            setDragging(true);
        };

        const onTouchMove = (event) => {
            if (!pulling.current || !event.touches.length) return;
            const delta = event.touches[0].clientY - touchStart.current;
            if (delta <= 0 || !isAtTop(scrollContainerRef.current)) {
                pulling.current = false;
                pullRef.current = 0;
                setPull(0);
                setDragging(false);
                return;
            }

            event.preventDefault();
            const distance = Math.min(MAX_PULL, delta * 0.48);
            if (frame.current) window.cancelAnimationFrame(frame.current);
            frame.current = window.requestAnimationFrame(() => {
                pullRef.current = distance;
                setPull(distance);
            });

            if (distance >= THRESHOLD && !hapticTriggered.current) {
                hapticTriggered.current = true;
                navigator.vibrate?.(12);
            }
        };

        const onTouchCancel = () => {
            pulling.current = false;
            pullRef.current = 0;
            setPull(0);
            setDragging(false);
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', finishPull, { passive: true });
        document.addEventListener('touchcancel', onTouchCancel, { passive: true });

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', finishPull);
            document.removeEventListener('touchcancel', onTouchCancel);
            if (frame.current) window.cancelAnimationFrame(frame.current);
            if (resetTimer.current) window.clearTimeout(resetTimer.current);
        };
    }, []);

    const message = status === 'refreshing'
        ? 'Refreshing…'
        : status === 'updated'
            ? '✓ Updated'
            : status === 'current'
                ? '✓ Already up to date'
                : status === 'offline'
                    ? 'You\'re offline'
                    : pull >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh';

    return (
        <div
            className={`refresh-experience ${
                dragging ? 'is-dragging' : ''
            } ${
                pull > 0 || status === 'refreshing' ? 'is-pulling' : ''
            }`}
        >
            {!online && <div className="offline-banner" role="status">You&apos;re offline · Retrying automatically</div>}
            <div
                className={`pull-refresh-indicator ${pull > 0 || status !== 'idle' ? 'visible' : ''}`}
                style={{ '--pull-distance': `${pull}px` }}
                aria-live="polite"
            >
                <span
                    className={`pull-spinner ${status === 'refreshing' ? 'spinning' : ''}`}
                    style={{ '--pull-progress': Math.min(1, pull / THRESHOLD) }}
                />
                <b>{message}</b>
            </div>
            <div
                className="refresh-content"
                style={{ '--content-pull': `${status === 'refreshing' ? THRESHOLD : pull}px` }}
            >
                {children}
            </div>
        </div>
    );
}

export default memo(RefreshExperience);
