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
    <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-[#dddddd] rounded-xl shadow-elevation-1 text-center space-y-5 font-body">
      <div className="w-12 h-12 rounded-full bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center mx-auto text-[#181d26]">
        <ShieldAlert className="w-6 h-6 text-[#aa2d00]" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-center mb-1">
          <Badge variant="shade" size="sm">
            {isFamily ? 'Operational Quarantine' : 'Access Restricted'}
          </Badge>
        </div>
        <h1 className="font-display text-2xl font-normal text-[#181d26]">
          {isFamily ? 'Operational Module Restricted' : 'Restricted Access Module'}
        </h1>
      </div>

      <div className="text-xs text-[#41454d] leading-relaxed max-w-md mx-auto">
        {effectiveMessage ? (
          <p>{effectiveMessage}</p>
        ) : isFamily ? (
          <p>
            This section ({effectiveModule || 'the requested module'}) contains internal operational tools reserved for trained field rescue teams and forensic auditors. If you are searching for your loved one, your case progress and verified updates are displayed safely on your Family Dashboard.
          </p>
        ) : (
          <p>
            Your current authenticated role (
            <span className="font-semibold text-[#181d26]">{profile?.role || 'Guest'}</span>
            ) does not hold authorization credentials to access {requiredModule ? `the ${requiredModule}` : 'this module'}. If this is required for field operations, contact your nodal coordinator.
          </p>
        )}
      </div>

      <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#dddddd] text-left text-xs text-[#41454d] space-y-1.5">
        <div className="font-semibold text-[#181d26]">Security & Privacy Protocol:</div>
        <p className="text-[11px] text-[#9297a0] leading-normal">
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
            variant="primary"
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
