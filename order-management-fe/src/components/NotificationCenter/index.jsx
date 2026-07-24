import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import {
    clear,
    clearCustomerNotifications,
    deleteCustomerNotification,
    enableWebPush,
    fetch,
    fetchCustomerNotifications,
    getCustomerNotificationToken,
    getPushCapability,
    readCustomerNotification,
    remove,
    restore,
    restoreCustomerNotification,
    update
} from '../../services/notification.service';
import { playManagerBell, playOrderCancelledSound, playOrderReadySound, playSound } from '../../utils/sound';
import './style.css';

const PAGE_SIZE = 20;
const SOUND_SETTING_KEY = 'rcdineNotificationSound';
const FILTERS = ['ALL', 'ORDERS', 'PAYMENTS', 'RC_SESSION', 'GENERAL'];

const normalizeNotification = (item = {}) => ({
    ...item,
    id: item.id || item.notificationId || `${item.type || 'notification'}-${item.createdAt || Date.now()}`,
    title: item.title || 'R&C Dine',
    message: item.message || item.body || item.text || 'New update received',
    category: item.category || item.meta?.category || 'GENERAL',
    type: item.type || item.meta?.action || 'UPDATE',
    path: item.path || (item.orderId ? `/cart/${item.orderId}` : ''),
    isRead: item.status === 'INACTIVE' || item.read === true,
    createdAt: item.createdAt || new Date().toISOString()
});

const mergeNotifications = (current, incoming) => {
    const merged = new Map();
    [...incoming, ...current].forEach((item) => {
        const normalized = normalizeNotification(item);
        if (!merged.has(normalized.id)) merged.set(normalized.id, normalized);
    });
    return [...merged.values()].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
};

const getDateGroup = (value) => {
    const date = new Date(value);
    const today = new Date();
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const days = Math.round((startToday - startDate) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return 'Earlier';
};

const getCategoryIcon = (category, type) => {
    if (category === 'PAYMENTS') return '₹';
    if (category === 'RC_SESSION') return 'RC';
    if (category === 'ORDERS' || String(type).includes('ORDER')) return '🍽';
    return '🔔';
};

const getLocalCustomerNotifications = () => {
    try {
        return JSON.parse(sessionStorage.getItem('rcdineNotifications') || '[]')
            .map((item) => normalizeNotification({ ...item, localOnly: true }));
    } catch (_error) {
        return [];
    }
};

const persistLocalCustomerNotifications = (notifications) => {
    const localItems = notifications.filter((item) => item.localOnly).map((item) => ({
        ...item,
        read: item.isRead,
        text: item.message
    }));
    sessionStorage.setItem('rcdineNotifications', JSON.stringify(localItems));
    sessionStorage.setItem('rcdineUnreadCount', String(localItems.filter((item) => !item.isRead).length));
};

function NotificationCenter({ open, onClose, audience = 'manager', token, onUnreadChange }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(() =>
        audience === 'customer' ? getLocalCustomerNotifications() : []);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('ALL');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [undoItem, setUndoItem] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem(SOUND_SETTING_KEY) !== 'off');
    const [capability, setCapability] = useState(() => getPushCapability());
    const [permissionBusy, setPermissionBusy] = useState(false);
    const observerTarget = useRef(null);
    const undoTimer = useRef(null);
    const touchStart = useRef(new Map());
    const resolvedToken = token || getCustomerNotificationToken();

    const loadNotifications = useCallback(async () => {
        if (audience === 'customer' && !resolvedToken) {
            setNotifications((current) => mergeNotifications(current, getLocalCustomerNotifications()));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = audience === 'customer'
                ? await fetchCustomerNotifications('', resolvedToken)
                : await fetch();
            setNotifications((current) => mergeNotifications(current, response.rows || []));
            onUnreadChange?.(response.unreadCount ?? 0);
        } catch (requestError) {
            setError(navigator.onLine ? requestError.message : 'You\'re offline');
        } finally {
            setLoading(false);
        }
    }, [audience, onUnreadChange, resolvedToken]);

    useEffect(() => {
        if (open) loadNotifications();
    }, [loadNotifications, open]);

    useEffect(() => {
        const handleNotification = (event) => {
            const item = normalizeNotification(event.detail || {});
            setNotifications((current) => mergeNotifications(current, [item]));
            if (soundEnabled && document.visibilityState === 'visible') {
                const eventKey = item.entityId || item.meta?.orderId || item.id;
                if (audience === 'manager') playManagerBell(eventKey);
                else if (item.type.includes('CANCEL')) playOrderCancelledSound(eventKey);
                else if (item.type.includes('READY')) playOrderReadySound(eventKey);
                else playSound('bell', { dedupeKey: `customer-bell-${eventKey}`, cooldownMs: 2500, volume: 0.85 });
            }
            window.navigator.vibrate?.([60, 30, 60]);
            loadNotifications();
        };
        window.addEventListener('rcdine:notification', handleNotification);
        const handleLocalNotification = () => setNotifications((current) =>
            mergeNotifications(current, getLocalCustomerNotifications()));
        window.addEventListener('rcdineNotificationsUpdated', handleLocalNotification);
        return () => {
            window.removeEventListener('rcdine:notification', handleNotification);
            window.removeEventListener('rcdineNotificationsUpdated', handleLocalNotification);
        };
    }, [audience, loadNotifications, soundEnabled]);

    const filtered = useMemo(() => notifications.filter((item) => {
        const matchesSearch = !search || `${item.title} ${item.message}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'ALL' || item.category === category;
        return matchesSearch && matchesCategory && (!unreadOnly || !item.isRead);
    }), [category, notifications, search, unreadOnly]);

    const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
    const grouped = useMemo(() => visible.reduce((result, item) => {
        const group = getDateGroup(item.createdAt);
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {}), [visible]);
    const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

    useEffect(() => {
        onUnreadChange?.(unreadCount);
    }, [onUnreadChange, unreadCount]);

    useEffect(() => {
        if (!observerTarget.current || visibleCount >= filtered.length) return undefined;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisibleCount((count) => count + PAGE_SIZE);
        }, { rootMargin: '160px' });
        observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [filtered.length, visibleCount]);

    useEffect(() => () => clearTimeout(undoTimer.current), []);

    const markAllRead = async () => {
        if (!unreadCount) return;
        if (audience === 'customer') {
            if (resolvedToken) await readCustomerNotification(undefined, resolvedToken);
        } else await update();
        setNotifications((current) => {
            const next = current.map((item) => ({ ...item, isRead: true, status: 'INACTIVE' }));
            if (audience === 'customer') persistLocalCustomerNotifications(next);
            return next;
        });
    };

    const openNotification = async (item) => {
        if (!item.isRead) {
            if (audience === 'customer') {
                if (!item.localOnly) await readCustomerNotification(item.id, resolvedToken);
            } else await update(item.id);
            setNotifications((current) => {
                const next = current.map((entry) =>
                    entry.id === item.id ? { ...entry, isRead: true, status: 'INACTIVE' } : entry);
                if (audience === 'customer') persistLocalCustomerNotifications(next);
                return next;
            });
        }
        if (item.path) {
            onClose?.();
            navigate(item.path.startsWith('/') ? item.path : `/${item.path}`);
        }
    };

    const deleteNotification = async (item) => {
        if (audience === 'customer') {
            if (!item.localOnly) await deleteCustomerNotification(item.id, resolvedToken);
        } else await remove(item.id);
        setNotifications((current) => {
            const next = current.filter(({ id }) => id !== item.id);
            if (audience === 'customer') persistLocalCustomerNotifications(next);
            return next;
        });
        clearTimeout(undoTimer.current);
        setUndoItem(item);
        undoTimer.current = setTimeout(() => setUndoItem(null), 6000);
        window.navigator.vibrate?.(30);
    };

    const undoDelete = async () => {
        if (!undoItem) return;
        if (audience === 'customer') {
            if (!undoItem.localOnly) await restoreCustomerNotification(undoItem.id, resolvedToken);
        } else await restore(undoItem.id);
        setNotifications((current) => {
            const next = mergeNotifications(current, [undoItem]);
            if (audience === 'customer') persistLocalCustomerNotifications(next);
            return next;
        });
        setUndoItem(null);
    };

    const clearAll = async () => {
        if (!window.confirm('Clear all notifications?')) return;
        if (audience === 'customer') {
            if (resolvedToken) await clearCustomerNotifications(resolvedToken);
        } else await clear();
        if (audience === 'customer') persistLocalCustomerNotifications([]);
        setNotifications([]);
    };

    const enableNotifications = async () => {
        setPermissionBusy(true);
        setError('');
        try {
            const result = await enableWebPush({ audience, token: resolvedToken, requestPermission: true });
            setCapability(getPushCapability());
            if (result.status === 'ios-install-required') {
                setError('On iPhone, add R&C Dine to your Home Screen first, then enable notifications.');
            } else if (result.status === 'denied') {
                setError('Notifications are blocked. Allow them from browser site settings.');
            } else if (result.status === 'enabled') {
                setError('Notifications are enabled and synchronized.');
            }
        } catch (enableError) {
            setError(enableError.message);
        } finally {
            setPermissionBusy(false);
        }
    };

    const toggleSound = () => {
        setSoundEnabled((current) => {
            localStorage.setItem(SOUND_SETTING_KEY, current ? 'off' : 'on');
            return !current;
        });
    };

    const handlePointerDown = (event, item) => {
        touchStart.current.set(item.id, event.clientX);
    };

    const handlePointerUp = (event, item) => {
        const start = touchStart.current.get(item.id);
        touchStart.current.delete(item.id);
        if (typeof start === 'number' && start - event.clientX > 75) deleteNotification(item);
    };

    if (!open) return null;

    return createPortal(
        <div className="notification-center-layer" role="presentation">
            <button className="notification-center-backdrop" type="button" aria-label="Close notifications" onClick={onClose} />
            <section className="notification-center" role="dialog" aria-modal="true" aria-label="Notifications">
                <header className="notification-center-header">
                    <div>
                        <span className="notification-center-eyebrow">R&C Dine</span>
                        <h2>Notifications {unreadCount > 0 && <b>{unreadCount}</b>}</h2>
                    </div>
                    <button className="notification-icon-button" type="button" aria-label="Close" onClick={onClose}>×</button>
                </header>

                {capability.supported && (
                    <button className="notification-enable" type="button" disabled={permissionBusy} onClick={enableNotifications}>
                        <span>{capability.permission === 'granted' ? '✓' : '🔔'}</span>
                        <span>
                            <b>{capability.permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}</b>
                            <small>
                                {capability.permission === 'granted'
                                    ? 'Tap Sync to repair or refresh background notifications'
                                    : 'Get live updates when the app is closed'}
                            </small>
                        </span>
                        <strong>
                            {permissionBusy ? '…' : capability.permission === 'granted' ? 'Sync' : 'Enable'}
                        </strong>
                    </button>
                )}

                <div className="notification-toolbar">
                    <label className="notification-search">
                        <span>⌕</span>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications" />
                    </label>
                    <button type="button" aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'} onClick={toggleSound}>
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>
                </div>

                <div className="notification-filters" aria-label="Notification filters">
                    {FILTERS.map((filter) => (
                        <button key={filter} type="button" className={category === filter ? 'active' : ''} onClick={() => setCategory(filter)}>
                            {filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="notification-actions">
                    <label><input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} /> Unread only</label>
                    <span>
                        <button type="button" disabled={!unreadCount} onClick={markAllRead}>Mark all read</button>
                        <button type="button" disabled={!notifications.length} onClick={clearAll}>Clear all</button>
                    </span>
                </div>

                <div className="notification-feed" data-preserve-scroll>
                    {error && <div className="notification-error" role="status">{error}</div>}
                    {loading && !notifications.length && <NotificationSkeleton />}
                    {!loading && !filtered.length && (
                        <div className="notification-empty"><span>✓</span><h3>You&apos;re all caught up</h3><p>New updates will appear here.</p></div>
                    )}
                    {['Today', 'Yesterday', 'Earlier'].map((group) => grouped[group]?.length ? (
                        <section key={group} className="notification-group">
                            <h3>{group}</h3>
                            {grouped[group].map((item) => (
                                <article
                                    key={item.id}
                                    className={`notification-card ${item.isRead ? 'is-read' : 'is-unread'} category-${item.category.toLowerCase()}`}
                                    onPointerDown={(event) => handlePointerDown(event, item)}
                                    onPointerUp={(event) => handlePointerUp(event, item)}
                                >
                                    <button className="notification-card-main" type="button" onClick={() => openNotification(item)}>
                                        <span className="notification-card-icon">{getCategoryIcon(item.category, item.type)}</span>
                                        <span className="notification-card-copy"><b>{item.title}</b><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></span>
                                        {!item.isRead && <i aria-label="Unread" />}
                                    </button>
                                    <button className="notification-delete" type="button" aria-label={`Delete ${item.title}`} onClick={() => deleteNotification(item)}>Delete</button>
                                </article>
                            ))}
                        </section>
                    ) : null)}
                    <div ref={observerTarget} className="notification-observer" />
                </div>

                {undoItem && <div className="notification-undo" role="status"><span>Notification deleted</span><button type="button" onClick={undoDelete}>Undo</button></div>}
            </section>
        </div>,
        document.body
    );
}

function NotificationSkeleton() {
    return <div className="notification-skeleton" aria-label="Loading notifications">
        {[0, 1, 2, 3].map((item) => <div key={item}><span /><p /><small /></div>)}
    </div>;
}

export default memo(NotificationCenter);
