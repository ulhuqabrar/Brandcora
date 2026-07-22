import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BrandProfilePage } from './pages/brand/BrandProfilePage';
import { BrandExtractPage } from './pages/brand/BrandExtractPage';
import { NewSocialCheckPage } from './pages/scans/NewSocialCheckPage';
import { NewWebsiteCheckPage } from './pages/scans/NewWebsiteCheckPage';
import { ScanReportPage } from './pages/scans/ScanReportPage';
import { ReportHistoryPage } from './pages/scans/ReportHistoryPage';
import { ProfileSettingsPage } from './pages/settings/ProfileSettingsPage';
import { AccountSettingsPage } from './pages/settings/AccountSettingsPage';
import { WorkspaceSettingsPage } from './pages/settings/WorkspaceSettingsPage';
import { TeamSettingsPage } from './pages/settings/TeamSettingsPage';
import { BillingSettingsPage } from './pages/settings/BillingSettingsPage';
import { SubscriptionPage } from './pages/billing/SubscriptionPage';
import { CheckoutSuccessPage } from './pages/billing/CheckoutSuccessPage';
import { CheckoutCancelledPage } from './pages/billing/CheckoutCancelledPage';
import { AccessDeniedPage } from './pages/errors/AccessDeniedPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

export function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/email-verified" element={<EmailVerificationPage />} />

      {/* Dashboard routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Navigate to="/brand" replace />} />
        <Route path="/brand" element={<BrandProfilePage />} />
        <Route path="/brand/extract" element={<BrandExtractPage />} />
        <Route path="/scans" element={<ReportHistoryPage />} />
        <Route path="/scans/new-social" element={<NewSocialCheckPage />} />
        <Route path="/scans/new-website" element={<NewWebsiteCheckPage />} />
        <Route path="/scans/:scanId" element={<ScanReportPage />} />
        <Route path="/settings/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings/account" element={<AccountSettingsPage />} />
        <Route path="/settings/workspace" element={<WorkspaceSettingsPage />} />
        <Route path="/settings/team" element={<TeamSettingsPage />} />
        <Route path="/billing" element={<SubscriptionPage />} />
      </Route>

      {/* Checkout routes */}
      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
      <Route path="/checkout/cancelled" element={<CheckoutCancelledPage />} />

      {/* Error routes */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
