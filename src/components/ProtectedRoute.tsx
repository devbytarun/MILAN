import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { hasPermission, Permission } from '../lib/permissions.ts';
import { AccessDenied } from '../pages/AccessDenied.tsx';
import { Clock, LogOut } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { Badge } from './ui/Badge.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  moduleName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  moduleName,
}) => {
  const { profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-pill border-2 border-[#181d26] border-t-transparent mb-4"></div>
        <p className="text-xs text-[#9297a0] font-medium">Verifying authorization credentials...</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  // Permission-based access check
  if (requiredPermission && !hasPermission(profile.role, requiredPermission)) {
    return <AccessDenied requiredModule={moduleName} />;
  }

  // Role-based access check (if explicitly supplied)
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <AccessDenied requiredModule={moduleName} />;
  }

  // Verification status check for operational roles
  if (profile.verification_status !== 'APPROVED') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-[#dddddd] rounded-xl shadow-elevation-1 text-center space-y-4">
        <div className="inline-flex p-3 bg-[#f8fafc] text-[#181d26] rounded-full border border-[#dddddd] mb-2">
          <Clock className="w-8 h-8 text-[#d9a441]" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-center mb-1">
            <Badge variant="pending" size="sm">Verification Pending</Badge>
          </div>
          <h2 className="font-display text-xl font-normal text-[#181d26]">Account Pending Verification</h2>
        </div>
        <p className="text-xs text-[#41454d] leading-relaxed">
          Your organization credential (<span className="font-semibold text-[#181d26]">{profile.organization_name || profile.role}</span>) is awaiting administrative audit before you can register official disaster records.
        </p>
        <div className="p-4 bg-[#f8fafc] rounded-md text-xs text-[#41454d] border border-[#dddddd] text-left space-y-1">
          <p className="font-semibold text-[#181d26]">Evaluation Mode:</p>
          <p className="text-[11px] text-[#9297a0]">
            For rapid evaluation, switch personas from the top navigation bar or select an authorized Demo account on the login page.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => signOut()}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out / Switch Persona
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
