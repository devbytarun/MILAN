import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldAlert, ArrowLeft, Home, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

interface AccessDeniedProps {
  message?: string;
  reason?: string;
  requiredModule?: string;
  moduleName?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  message,
  reason,
  requiredModule,
  moduleName,
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isFamily = profile?.role === 'FAMILY';
  const effectiveModule = moduleName || requiredModule;
  const effectiveMessage = reason || message;

  return (
    <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200/90 rounded-2xl shadow-card text-center space-y-5 font-body">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center mx-auto text-rose-600 shadow-sm">
        <ShieldAlert className="w-7 h-7 text-rose-600" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-center mb-1">
          <Badge variant={isFamily ? 'critical' : 'shade'} size="sm">
            {isFamily ? 'Operational Quarantine' : 'Access Restricted'}
          </Badge>
        </div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 tracking-tight">
          {isFamily ? 'Operational Module Restricted' : 'Restricted Access Module'}
        </h1>
      </div>

      <div className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        {effectiveMessage ? (
          <p>{effectiveMessage}</p>
        ) : isFamily ? (
          <p>
            This section ({effectiveModule || 'the requested module'}) contains internal operational tools reserved for trained field rescue teams and forensic auditors. If you are searching for your loved one, your case progress and verified updates are displayed safely on your Family Dashboard.
          </p>
        ) : (
          <p>
            Your current authenticated role (
            <span className="font-semibold text-slate-900">{profile?.role || 'Guest'}</span>
            ) does not hold authorization credentials to access {requiredModule ? `the ${requiredModule}` : 'this module'}. If this is required for field operations, contact your nodal coordinator.
          </p>
        )}
      </div>

      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-1.5">
        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
          <span>Security & Privacy Protocol</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          MILAN enforces strict role-based data quarantine to protect vulnerable disaster survivors from unauthorized data harvesting, trafficking risks, and misinformation.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Go Back
        </Button>

        <Link to="/dashboard">
          <Button
            variant="brand"
            size="sm"
            leftIcon={isFamily ? <FileText className="w-4 h-4" /> : <Home className="w-4 h-4" />}
          >
            {isFamily ? 'Return to My Case Status' : 'Return to Operations Hub'}
          </Button>
        </Link>
      </div>
    </div>
  );
};
