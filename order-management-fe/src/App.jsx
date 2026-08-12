import React, { lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './assets/styles/Responsive.css';
import './assets/styles/auth.css';
import './assets/styles/button.css';
import Loader from './components/Loader';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import RefreshExperience from './components/RefreshExperience';
import Routes from './routes';

const ManagerLiveOrders = lazy(() => import('./components/ManagerLiveOrders'));

const runWhenBrowserIsIdle = (callback) => {
    if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(callback, { timeout: 1500 });
        return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(callback, 500);
    return () => window.clearTimeout(timeoutId);
};

function App() {
    const { isLoading } = useSelector((state) => state.app);
    const user = useSelector((state) => state.user?.data || state.user || null);

    useEffect(() => {
        let disposed = false;
        let cleanupNotificationSounds = () => {};

        const cancelScheduledStart = runWhenBrowserIsIdle(async () => {
            try {
                const [notificationService, appUpdateService, soundService] = await Promise.all([
                    import('./services/notification.service'),
                    import('./services/appUpdate.service'),
                    import('./utils/sound')
                ]);
                if (disposed) return;

                cleanupNotificationSounds = soundService.initializeNotificationSounds();
                notificationService.initializeNotificationLifecycle();
                const registration = await notificationService.registerServiceWorker();
                if (!disposed && registration) {
                    appUpdateService.initializeAppUpdateLifecycle(registration);
                }
            } catch (error) {
                console.warn('PWA background services failed to start:', error?.message || error);
            }
        });

        return () => {
            disposed = true;
            cancelScheduledStart();
            cleanupNotificationSounds();
        };
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('token') || !user?.id) return undefined;
        let disposed = false;

        const cancelScheduledStart = runWhenBrowserIsIdle(async () => {
            try {
                const { initializeWebPush } = await import('./services/notification.service');
                if (!disposed) await initializeWebPush({ audience: 'manager' });
            } catch (error) {
                console.warn('Web Push registration failed:', error?.message || error);
            }
        });

        return () => {
            disposed = true;
            cancelScheduledStart();
        };
    }, [user?.id]);

    return (
        <>
            {isLoading && <Loader />}
            {user?.id && (
                <Suspense fallback={null}>
                    <ManagerLiveOrders />
                </Suspense>
            )}
            <PwaInstallPrompt />
            <RefreshExperience>
                <Routes />
            </RefreshExperience>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </>
    );
}

export default App;
