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
import { VoiceIntakePage } from './pages/VoiceIntakePage.tsx';
import { DossierPage } from './pages/DossierPage.tsx';
import { AccessDenied } from './pages/AccessDenied.tsx';

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

            {/* Access Denied Route */}
            <Route path="/access-denied" element={<AccessDenied />} />

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
                <ProtectedRoute requiredPermission="CREATE_MISSING_REPORT" moduleName="Missing Person Report Portal">
                  <FamilyReportPage />
                </ProtectedRoute>
              }
            />

            {/* NGO & Army Rescue Found Intake (NGO, ARMY_RESCUE, ADMIN) */}
            <Route
              path="/report/found"
              element={
                <ProtectedRoute requiredPermission="CREATE_FOUND_REPORT" moduleName="Rescued Person Intake">
                  <FoundReportPage />
                </ProtectedRoute>
              }
            />

            {/* Hospital Medical Intake (HOSPITAL, ADMIN) */}
            <Route
              path="/report/hospital"
              element={
                <ProtectedRoute requiredPermission="CREATE_HOSPITAL_REPORT" moduleName="Hospital Medical Intake">
                  <HospitalReportPage />
                </ProtectedRoute>
              }
            />

            {/* Voice/Radio AI Transcript Parser (Authorized operational & field responders) */}
            <Route
              path="/report/voice"
              element={
                <ProtectedRoute requiredPermission="USE_VOICE_AI" moduleName="Voice AI & Radio Transcript Intake">
                  <VoiceIntakePage />
                </ProtectedRoute>
              }
            />

            {/* Match Candidate Review (REVIEWER, ADMIN strictly) */}
            <Route
              path="/review"
              element={
                <ProtectedRoute requiredPermission="REVIEW_MATCH" moduleName="Match Verification Queue">
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            {/* Forensic Verification Dossier (REVIEWER, ADMIN strictly) */}
            <Route
              path="/dossier"
              element={
                <ProtectedRoute requiredPermission="VIEW_FORENSIC_DOSSIER" moduleName="Forensic Verification Dossier">
                  <DossierPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dossier/:sourceId/:candidateId"
              element={
                <ProtectedRoute requiredPermission="VIEW_FORENSIC_DOSSIER" moduleName="Forensic Verification Dossier">
                  <DossierPage />
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
