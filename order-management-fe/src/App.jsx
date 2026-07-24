import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './assets/styles/Responsive.css';
import './assets/styles/auth.css';
import './assets/styles/button.css';
import Loader from './components/Loader';
import ManagerLiveOrders from './components/ManagerLiveOrders';
import RefreshExperience from './components/RefreshExperience';
import Routes from './routes';
import { initializeNotificationLifecycle, initializeWebPush } from './services/notification.service';

function App() {
    const { isLoading } = useSelector((state) => state.app);
    const user = useSelector((state) => state.user?.data || state.user || null);

    useEffect(() => {
        initializeNotificationLifecycle();
    }, []);

    useEffect(() => {
        const initializeNotifications = async () => {
            if (!localStorage.getItem('token') || !user?.id) return;

            try {
                await initializeWebPush({ audience: 'manager' });
            } catch (error) {
                console.warn('Web Push registration failed:', error?.message || error);
            }
        };

        initializeNotifications();
    }, [user?.id]);

    return (
        <>
            {isLoading && <Loader />}
            <ManagerLiveOrders />
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
