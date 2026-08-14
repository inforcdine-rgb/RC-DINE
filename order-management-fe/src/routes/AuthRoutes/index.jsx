import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getUserRequest } from '../../store/slice';

const MANAGER_SUBSCRIPTION_EXPIRED_KEY = 'rcManagerSubscriptionExpired';

const isSubscriptionExpired = ({ status, subscriptionEndAt, trialEndAt }) =>
    status === 'EXPIRED' ||
    (status === 'ACTIVE' && subscriptionEndAt && new Date(subscriptionEndAt).getTime() < Date.now()) ||
    (status === 'TRIAL' && trialEndAt && new Date(trialEndAt).getTime() < Date.now());

function AuthRoutes() {
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const location = useLocation();
    const user = useSelector((state) => state.user.data);

    useEffect(() => {
        if (token && Object.keys(user).length === 0) {
            dispatch(getUserRequest());
        }
    }, [token, user, dispatch]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (Object.keys(user).length === 0) {
        return <Loader />;
    }

    if (user.role === 'OWNER') {
        if (
            user.recoveryCodeConfigured === false &&
            !['/create-recovery-code', '/settings'].includes(location.pathname)
        ) {
            return <Navigate to="/create-recovery-code" replace />;
        }

        const isExpired = isSubscriptionExpired({
            status: user.subscriptionStatus,
            subscriptionEndAt: user.subscriptionEndAt,
            trialEndAt: user.trialEndAt
        });

        if (isExpired) {
            if (location.pathname !== '/subscription') {
                return <Navigate to="/subscription" replace />;
            }
        }

        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/hotels" replace />;
        }
    }

    if (user.role === 'MANAGER') {
        const managerSubscriptionExpired =
            isSubscriptionExpired({
                status: user.ownerSubscriptionStatus,
                subscriptionEndAt: user.ownerSubscriptionEndAt,
                trialEndAt: user.ownerTrialEndAt
            }) || localStorage.getItem(MANAGER_SUBSCRIPTION_EXPIRED_KEY) === 'true';

        if (managerSubscriptionExpired) {
            localStorage.setItem(MANAGER_SUBSCRIPTION_EXPIRED_KEY, 'true');
            if (location.pathname !== '/subscription-expired') {
                return <Navigate to="/subscription-expired" replace />;
            }
            return <Outlet />;
        }

        localStorage.removeItem(MANAGER_SUBSCRIPTION_EXPIRED_KEY);
        if (location.pathname === '/subscription-expired') {
            return <Navigate to="/walkin-pos" replace />;
        }

        if (location.pathname === '/subscription') {
            return <Navigate to="/walkin-pos" replace />;
        }

        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/walkin-pos" replace />;
        }
    }

    if (user.role === 'ADMIN') {
        if (!location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return (
        <>
            <Navbar />
            <Sidebar />
        </>
    );
}

export default AuthRoutes;
