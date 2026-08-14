import React, { lazy, Suspense } from 'react';
import { Routes as Switch, Route, BrowserRouter, Navigate } from 'react-router-dom';

import features from '../config/features';

const AuthRoutes = lazy(() => import('./AuthRoutes'));
const Landing = lazy(() => import('../pages/Landing'));
const NotFound = lazy(() => import('../pages/NotFound'));
const PublicRoutes = lazy(() => import('./PublicRoutes'));
const RCSessionGuard = lazy(() => import('../components/RCSessionGuard'));
const AdminContactEnquiries = lazy(() => import('../pages/AdminContactEnquiries'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminLandingSettings = lazy(() => import('../pages/AdminLandingSettings'));
const AdminLegalPages = lazy(() => import('../pages/AdminLegalPages'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const AdminOwnerDetail = lazy(() => import('../pages/AdminOwnerDetail'));
const AdminOwners = lazy(() => import('../pages/AdminOwners'));
const AdminRevenue = lazy(() => import('../pages/AdminRevenue'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const Contact = lazy(() => import('../pages/Contact'));
const CreateRecoveryCode = lazy(() => import('../pages/CreateRecoveryCode'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const EmailForgotPassword = lazy(() => import('../pages/EmailForgotPassword'));
const ForgotPassword = lazy(() => import('../pages/ForgetPassword'));
const Hotels = lazy(() => import('../pages/Hotels'));
const LegalPage = lazy(() => import('../pages/LegalPage'));
const Login = lazy(() => import('../pages/Login'));
const ManagerPOS = lazy(() => import('../pages/ManagerPOS'));
const ManagerSubscriptionExpired = lazy(() => import('../pages/ManagerSubscriptionExpired'));
const Managers = lazy(() => import('../pages/Managers'));
const Menu = lazy(() => import('../pages/Menu'));
const OrderPlacement = lazy(() => import('../pages/OrderPlacement'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderTracking = lazy(() => import('../pages/OrderTracking'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Revenue = lazy(() => import('../pages/Revenue'));
const Settings = lazy(() => import('../pages/Settings'));
const Signup = lazy(() => import('../pages/Signup'));
const Subscription = lazy(() => import('../pages/Subscription'));
const Tables = lazy(() => import('../pages/Tables'));
const VerifyUser = lazy(() => import('../pages/VerifyUser'));

export default function Routes() {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <Switch>
                    <Route path="/" element={<PublicRoutes />}>
                        <Route index element={<Landing />} />
                        <Route path="login" element={<Login />} />
                        <Route path="signup" element={<Signup />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />
                        <Route path="email-forgot-password" element={<EmailForgotPassword />} />
                        <Route path="verify" element={<VerifyUser />} />
                        <Route path="reset" element={<ResetPassword />} />
                        <Route path="menu-preview" element={<Navigate to="/#demo" replace />} />
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
                        <Route path="create-recovery-code" element={<CreateRecoveryCode />} />
                        <Route path="tables" element={<Tables />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="walkin-pos" element={<ManagerPOS />} />
                        <Route path="subscription-expired" element={<ManagerSubscriptionExpired />} />
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
            </Suspense>
        </BrowserRouter>
    );
}
