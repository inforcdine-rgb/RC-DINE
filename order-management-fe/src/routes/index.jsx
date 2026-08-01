import React from 'react';
import { Routes as Switch, Route, BrowserRouter, Navigate } from 'react-router-dom';

import RCSessionGuard from '../components/RCSessionGuard';
import features from '../config/features';
import AdminContactEnquiries from '../pages/AdminContactEnquiries';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLandingSettings from '../pages/AdminLandingSettings';
import AdminLegalPages from '../pages/AdminLegalPages';
import AdminLogin from '../pages/AdminLogin';
import AdminOwnerDetail from '../pages/AdminOwnerDetail';
import AdminOwners from '../pages/AdminOwners';
import AdminRevenue from '../pages/AdminRevenue';
import AdminSettings from '../pages/AdminSettings';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import ForgotPassword from '../pages/ForgetPassword';
import Hotels from '../pages/Hotels';
import Landing from '../pages/Landing';
import LegalPage from '../pages/LegalPage';
import Login from '../pages/Login';
import ManagerPOS from '../pages/ManagerPOS';
import Managers from '../pages/Managers';
import Menu from '../pages/Menu';
import NotFound from '../pages/NotFound';
import OrderPlacement from '../pages/OrderPlacement';
import Orders from '../pages/Orders';
import OrderTracking from '../pages/OrderTracking';
import ResetPassword from '../pages/ResetPassword';
import Revenue from '../pages/Revenue';
import Settings from '../pages/Settings';
import Signup from '../pages/Signup';
import Subscription from '../pages/Subscription';
import Tables from '../pages/Tables';
import VerifyUser from '../pages/VerifyUser';
import AuthRoutes from './AuthRoutes';
import PublicRoutes from './PublicRoutes';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" element={<PublicRoutes />}>
                    <Route index element={<Landing />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="verify" element={<VerifyUser />} />
                    <Route path="reset" element={<ResetPassword />} />
                    <Route
                        path="place/:token"
                        element={
                            features.customerOtpLogin && features.rcSession ? (
                                <RCSessionGuard>
                                    <OrderPlacement />
                                </RCSessionGuard>
                            ) : (
                                <OrderPlacement />
                            )
                        }
                    />
                    <Route path="cart/:orderId" element={<OrderTracking />} />
                    <Route path="admin/login" element={<AdminLogin />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="privacy" element={<LegalPage />} />
                    <Route path="terms" element={<LegalPage />} />
                    <Route path="refund-policy" element={<LegalPage />} />
                    <Route path="shipping-policy" element={<LegalPage />} />
                </Route>

                <Route path="/" element={<AuthRoutes />}>
                    <Route path="analytics" element={<Dashboard />} />
                    <Route path="hotels" element={<Hotels />} />
                    <Route path="manager" element={<Managers />} />
                    <Route path="revenue" element={<Revenue />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="walkin-pos" element={<ManagerPOS />} />
                    <Route path="subscription" element={<Subscription />} />
                    <Route path="admin/dashboard" element={<AdminDashboard />} />
                    <Route path="admin/owners" element={<AdminOwners />} />
                    <Route path="admin/owners/:id" element={<AdminOwnerDetail />} />
                    <Route path="admin/revenue" element={<AdminRevenue />} />
                    <Route path="admin/settings" element={<AdminSettings />} />
                    <Route path="admin/landing-settings" element={<AdminLandingSettings />} />
                    <Route path="admin/contact-enquiries" element={<AdminContactEnquiries />} />
                    <Route path="admin/legal-pages" element={<AdminLegalPages />} />
                </Route>

                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" />} />
            </Switch>
        </BrowserRouter>
    );
}
