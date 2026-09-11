import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { ShieldAlert, Clock, ArrowRight, LogOut } from 'lucide-react';
import { Button } from './ui/Button.tsx';
import { Badge } from './ui/Badge.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="h-9 w-9 animate-spin rounded-pill border-2 border-ink border-t-transparent mb-4"></div>
        <p className="type-caption text-shade-50 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-canvas-light border border-hairline-light rounded-lg shadow-elevation-3 text-center space-y-4">
        <div className="inline-flex p-3 bg-canvas-cream text-ink rounded-pill border border-hairline-light mb-2">
          <ShieldAlert className="w-8 h-8 text-ink" />
        </div>
        <h2 className="type-heading-lg text-ink">Restricted Role Module</h2>
        <p className="type-caption text-shade-50">
          Your current authenticated persona (
          <span className="font-semibold text-ink">{profile.role}</span>
          ) does not hold authorization credentials to access this disaster module.
        </p>
        <div className="pt-2 flex justify-center">
          <Link to="/dashboard">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Return to Operations Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (profile.verification_status !== 'APPROVED') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-canvas-light border border-hairline-light rounded-lg shadow-elevation-3 text-center space-y-4">
        <div className="inline-flex p-3 bg-canvas-cream text-ink rounded-pill border border-hairline-light mb-2">
          <Clock className="w-8 h-8 text-ink" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-center mb-1">
            <Badge variant="pending" size="sm">Verification Pending</Badge>
          </div>
          <h2 className="type-heading-lg text-ink">Account Pending Verification</h2>
        </div>
        <p className="type-caption text-shade-50">
          Your organization credential (<span className="font-semibold text-ink">{profile.organization_name || profile.role}</span>) is awaiting administrative audit before you can register official disaster records.
        </p>
        <div className="p-4 bg-canvas-cream rounded-md text-xs text-shade-70 border border-hairline-light text-left space-y-1">
          <p className="font-semibold text-ink">Evaluation Shortcut:</p>
          <p className="type-caption text-shade-50">
            For rapid evaluation, switch personas from the top navigation bar or select an authorized Demo account on the login page.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <Button
            variant="outline-light"
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
