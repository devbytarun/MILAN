import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { 
  LogIn, 
  AlertCircle, 
  Users, 
  HeartHandshake, 
  Shield, 
  Stethoscope, 
  FileCheck, 
  Lock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const LoginPage: React.FC = () => {
  const { signIn, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCardRole, setActiveCardRole] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    setActiveCardRole(role);
    switchDemoRole(role);
    setTimeout(() => {
      navigate('/dashboard');
    }, 200);
  };

  const roleConfigs: Record<string, { 
    icon: React.ComponentType<{ className?: string }>; 
    label: string;
    description: string;
  }> = {
    FAMILY: {
      icon: Users,
      label: 'Family Member',
      description: 'Search & file missing reports',
    },
    NGO: {
      icon: HeartHandshake,
      label: 'Field Rescue Volunteer',
      description: 'Camp admission & survivor intake',
    },
    ARMY_RESCUE: {
      icon: Shield,
      label: 'Army / NDRF Officer',
      description: 'Frontline rescue & rapid intake',
    },
    HOSPITAL: {
      icon: Stethoscope,
      label: 'Hospital Trauma Desk',
      description: 'Emergency admissions & beds',
    },
    REVIEWER: {
      icon: FileCheck,
      label: 'Incident Coordinator',
      description: 'Audit & verify forensic dossiers',
    },
    ADMIN: {
      icon: Lock,
      label: 'System Administrator',
      description: 'Emergency grid governance',
    },
  };

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8fafc] border border-[#dddddd] text-xs font-semibold text-[#181d26]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          <span>MILAN Disaster Coordination Grid</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#181d26] tracking-tight">
          Sign In to Portal
        </h1>
        <p className="text-xs sm:text-sm text-[#41454d] max-w-md mx-auto leading-relaxed">
          Authorized personnel authentication & fast-track evaluation access.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[#dddddd] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Authorized Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. family@milan.demo or your@email.com"
          />

          <Input
            label="Security Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="w-full"
            >
              Sign In to Portal
            </Button>
          </div>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#dddddd]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#9297a0] font-bold tracking-wider text-[10px]">
              1-Click Fast Track Evaluation Personas
            </span>
          </div>
        </div>

        {/* Quick Demo Logins Persona Grid */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-medium text-[#41454d]">
            Select persona to evaluate role-specific disaster response capabilities:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(DEMO_USERS) as UserRole[]).filter((r) => r !== 'VOLUNTEER').map((role) => {
              const cfg = roleConfigs[role] || {
                icon: Shield,
                label: role,
                description: 'Operational role',
              };
              const Icon = cfg.icon;
              const isSelected = activeCardRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleQuickLogin(role)}
                  className={`group relative p-3 border rounded-xl text-left transition-all duration-150 overflow-hidden ${
                    isSelected
                      ? 'border-[#181d26] bg-[#f8fafc] ring-1 ring-[#181d26]'
                      : 'border-[#dddddd] bg-white hover:bg-[#f8fafc] hover:border-[#9297a0]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-[#dddddd] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#181d26]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#f8fafc] text-[#181d26] border border-[#dddddd] font-mono tracking-tight uppercase">
                          {role.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-[#9297a0] font-medium">
                          {DEMO_USERS[role]?.fullName.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#181d26] truncate">
                        {cfg.label}
                      </div>
                      <div className="text-[10px] text-[#41454d] truncate">
                        {cfg.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="text-center text-xs text-[#41454d] space-y-1">
        <div>
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-[#181d26] font-semibold hover:underline">
            Register new account
          </Link>
        </div>
        <p className="text-[10px] text-[#9297a0]">
          MILAN Disaster Portal • Offline Sync & IndexedDB Enabled
        </p>
      </div>
    </div>
  );
};
