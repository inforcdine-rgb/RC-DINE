import React, { useCallback, useEffect, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FaBell } from 'react-icons/fa';
import { IoCaretBack } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import User from '../../assets/images/user.png';
import '../../assets/styles/navbar.css';
import env from '../../config/env';
import {
    getNotificationRequest,
    getUserRequest,
    logoutRequest,
    setGlobalHotelId,
    setNotificationData
} from '../../store/slice';
import { USER_ROLES } from '../../utils/constants';
import {
    getBackgroundRequestVersion,
    registerRefreshHandler,
    runBackgroundTask,
    waitForBackgroundRequests
} from '../../utils/refreshBus';
import CustomButton from '../CustomButton';
import NotificationCenter from '../NotificationCenter';

function Navbars() {
    const user = useSelector((state) => state.user.data);
    const { notificationsData } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notificationSnapshotRef = useRef('');
    const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
    const notificationsDataRef = useRef(notificationsData);
    const seenNotificationKeysRef = useRef(new Set());
    notificationSnapshotRef.current = JSON.stringify(notificationsData);
    notificationsDataRef.current = notificationsData;

    const handleLogout = () => {
        dispatch(logoutRequest());
    };

    const handleUnreadChange = useCallback((count) => {
        const currentNotifications = notificationsDataRef.current;
        if (currentNotifications.count === count) return;
        dispatch(setNotificationData({
            ...currentNotifications,
            count
        }));
    }, [dispatch]);

    let viewData = {};
    try {
        const encryptedData = localStorage.getItem('data');
        if (encryptedData) {
            const decrypted = CryptoJS.AES.decrypt(encryptedData, env.cryptoSecret).toString(CryptoJS.enc.Utf8);
            if (decrypted) {
                viewData = JSON.parse(decrypted);
            }
        }
    } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
    }

    useEffect(() => {
        const syncNotifications = () => runBackgroundTask(async () => {
            const checkpoint = getBackgroundRequestVersion();
            dispatch(getNotificationRequest());
            await waitForBackgroundRequests({ checkpoint });
        }).catch(() => {});
        const incrementNotification = (key) => {
            if (key && seenNotificationKeysRef.current.has(key)) return;
            if (key) {
                seenNotificationKeysRef.current.add(key);
                if (seenNotificationKeysRef.current.size > 100) {
                    const [oldestKey] = seenNotificationKeysRef.current;
                    seenNotificationKeysRef.current.delete(oldestKey);
                }
            }
            const currentNotifications = notificationsDataRef.current;
            dispatch(
                setNotificationData({
                    ...currentNotifications,
                    count: currentNotifications.count + 1
                })
            );
            syncNotifications();
        };
        const handleSocketNotification = (event) => incrementNotification(event.detail?.key);

        window.addEventListener('rcdine:manager-notification', handleSocketNotification);
        return () => {
            window.removeEventListener('rcdine:manager-notification', handleSocketNotification);
        };
    }, [dispatch]);

    useEffect(() => registerRefreshHandler('manager-notifications', async () => {
        const before = notificationSnapshotRef.current;
        const checkpoint = getBackgroundRequestVersion();
        dispatch(getNotificationRequest());
        await waitForBackgroundRequests({ checkpoint });
        return before !== notificationSnapshotRef.current;
    }), [dispatch]);

    useEffect(() => {
        if (!user.id) {
            dispatch(getUserRequest({ navigate }));
        } else if (viewData.hotelId && user.role?.toUpperCase() === USER_ROLES[0]) {
            dispatch(setGlobalHotelId(viewData.hotelId));
        }
        if (!notificationsData.count) {
            dispatch(getNotificationRequest());
        }
    }, []);

    return (
        <Navbar className="py-1 navbar-container">
            <Nav className="ms-auto d-flex align-items-center">
                {Object.keys(viewData).length > 1 && viewData.role && viewData.role.toUpperCase() === USER_ROLES[0] && (
                    <CustomButton
                        className="switch-button mx-sm-4 d-flex align-items-center fw-bold"
                        onClick={() => {
                            const details = CryptoJS.AES.encrypt(
                                JSON.stringify({ role: user.role }),
                                env.cryptoSecret
                            ).toString();
                            dispatch(setGlobalHotelId(null));
                            localStorage.setItem('data', details);
                            navigate('/hotels');
                        }}
                        label={
                            <>
                                <IoCaretBack size={20} className="me-1" />
                                Owner View
                            </>
                        }
                        disabled={false}
                    />
                )}
                <button
                    className="notification-bell-button"
                    type="button"
                    aria-label={`Open notifications${notificationsData.count ? `, ${notificationsData.count} unread` : ''}`}
                    onClick={() => setNotificationCenterOpen(true)}
                >
                    {notificationsData.count > 0 && (
                        <span key={notificationsData.count} className="notification-text notification-pop">
                            {notificationsData.count > 99 ? '99+' : notificationsData.count}
                        </span>
                    )}
                    <FaBell color="white" size={25} />
                </button>
                <NotificationCenter
                    open={notificationCenterOpen}
                    onClose={() => setNotificationCenterOpen(false)}
                    audience="manager"
                    onUnreadChange={handleUnreadChange}
                />
                <NavDropdown
                    key={'user-icon'}
                    data-testid="navbar-options"
                    title={
                        <img data-testid="navbar-user" className="p-1 bg-warning user-logo" src={User} alt="user pic" />
                    }
                    drop="down-start"
                    className="hide-dropdown-arrow mx-sm-3 p-0"
                >
                    <NavDropdown.Item onClick={() => handleLogout()}>Logout</NavDropdown.Item>
                </NavDropdown>
            </Nav>
        </Navbar>
    );
}

export default Navbars;
