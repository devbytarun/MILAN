import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { ShieldAlert, Clock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-slate-600 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-xl shadow-sm text-center">
        <div className="inline-flex p-3 bg-rose-100 text-rose-700 rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Unauthorized Access</h2>
        <p className="text-slate-600 mb-6">
          Your current role (<span className="font-semibold text-rose-600">{profile.role}</span>) is not permitted to access this module.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Return to Dashboard <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (profile.verification_status !== 'APPROVED') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-amber-200 rounded-xl shadow-sm text-center">
        <div className="inline-flex p-3 bg-amber-100 text-amber-700 rounded-full mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Pending Verification</h2>
        <p className="text-slate-600 mb-4">
          Your organization account (<span className="font-semibold text-slate-800">{profile.organization_name || profile.role}</span>) is awaiting administrative approval before you can submit official rescue/hospital reports.
        </p>
        <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-800 mb-6 border border-amber-200/60 text-left">
          <p className="font-medium mb-1">Prototype Note:</p>
          For hackathon testing, click the role-switcher in the top navbar or select an approved Demo account on the login page.
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
        >
          Sign Out / Change Account
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
