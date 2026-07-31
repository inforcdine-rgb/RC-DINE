import React, { useEffect, useMemo, useState } from 'react';
import './style.css';

const DISMISSED_AT_KEY = 'rcdinePwaInstallDismissedAt';
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000;

const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => {
    const userAgent = window.navigator.userAgent || '';
    return (
        /iPad|iPhone|iPod/.test(userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
    );
};

const recentlyDismissed = () => {
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY) || 0);
    return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_FOR_MS;
};

function PwaInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [installing, setInstalling] = useState(false);
    const ios = useMemo(isIos, []);

    useEffect(() => {
        if (isStandalone() || recentlyDismissed()) return undefined;

        const handleInstallable = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
            setVisible(true);
        };
        const handleInstalled = () => {
            setInstallPrompt(null);
            setVisible(false);
            window.localStorage.removeItem(DISMISSED_AT_KEY);
        };

        window.addEventListener('beforeinstallprompt', handleInstallable);
        window.addEventListener('appinstalled', handleInstalled);
        if (ios) setVisible(true);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleInstallable);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, [ios]);

    const dismiss = () => {
        window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
        setVisible(false);
    };

    const install = async () => {
        if (!installPrompt) return;
        setInstalling(true);
        try {
            await installPrompt.prompt();
            const choice = await installPrompt.userChoice;
            if (choice.outcome === 'accepted') setVisible(false);
            else dismiss();
        } finally {
            setInstallPrompt(null);
            setInstalling(false);
        }
    };

    if (!visible || isStandalone()) return null;

    return (
        <aside className="pwa-install" aria-label="Install R&C Dine app">
            <img className="pwa-install__icon" src="/icons/icon-192.png" alt="" />
            <div className="pwa-install__content">
                <strong>Install R&C Dine</strong>
                <span>
                    {ios
                        ? 'Tap Share, then “Add to Home Screen” for the app experience.'
                        : 'Add it to your home screen for quicker access and offline support.'}
                </span>
            </div>
            <div className="pwa-install__actions">
                {!ios && installPrompt && (
                    <button type="button" className="pwa-install__primary" onClick={install} disabled={installing}>
                        {installing ? 'Installing…' : 'Install'}
                    </button>
                )}
                <button
                    type="button"
                    className="pwa-install__dismiss"
                    onClick={dismiss}
                    aria-label="Dismiss install prompt"
                >
                    Not now
                </button>
            </div>
        </aside>
    );
}

export default PwaInstallPrompt;
