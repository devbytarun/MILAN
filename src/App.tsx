import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { I18nProvider } from './context/I18nContext.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { SignupPage } from './pages/SignupPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CasesPage } from './pages/CasesPage.tsx';
import { CaseDetailPage } from './pages/CaseDetailPage.tsx';
import { FamilyStatusView } from './pages/FamilyStatusView.tsx';
import { FamilyReportPage } from './pages/FamilyReportPage.tsx';
import { FoundReportPage } from './pages/FoundReportPage.tsx';
import { HospitalReportPage } from './pages/HospitalReportPage.tsx';
import { ReviewPage } from './pages/ReviewPage.tsx';

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/cases/:id/status" element={<FamilyStatusView />} />

            {/* Authenticated Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Family Missing Person Intake (FAMILY, ADMIN) */}
            <Route
              path="/report/missing"
              element={
                <ProtectedRoute allowedRoles={['FAMILY', 'ADMIN']}>
                  <FamilyReportPage />
                </ProtectedRoute>
              }
            />

            {/* NGO & Army Rescue Found Intake (NGO, ARMY_RESCUE, ADMIN) */}
            <Route
              path="/report/found"
              element={
                <ProtectedRoute allowedRoles={['NGO', 'ARMY_RESCUE', 'ADMIN']}>
                  <FoundReportPage />
                </ProtectedRoute>
              }
            />

            {/* Hospital Medical Intake (HOSPITAL, ADMIN) */}
            <Route
              path="/report/hospital"
              element={
                <ProtectedRoute allowedRoles={['HOSPITAL', 'ADMIN']}>
                  <HospitalReportPage />
                </ProtectedRoute>
              }
            />

            {/* Match Candidate Review (REVIEWER, ADMIN) */}
            <Route
              path="/review"
              element={
                <ProtectedRoute allowedRoles={['REVIEWER', 'ADMIN']}>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </I18nProvider>
  );
};

export default App;
