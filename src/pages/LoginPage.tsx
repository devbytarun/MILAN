import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import { 
  LifeBuoy, 
  LogIn, 
  AlertCircle, 
  Users, 
  HeartHandshake, 
  Shield, 
  Stethoscope, 
  FileCheck, 
  Lock,
  Radio,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeThemeColor, setActiveThemeColor] = useState<'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan'>('blue');
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
    }, 280);
  };

  const roleConfigs: Record<string, { 
    icon: React.ComponentType<{ className?: string }>; 
    theme: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';
    label: string;
    description: string;
    borderClass: string;
    bgClass: string;
    badgeClass: string;
    glowClass: string;
  }> = {
    FAMILY: {
      icon: Users,
      theme: 'blue',
      label: 'Family Member',
      description: 'Search & file reports',
      borderClass: 'hover:border-blue-500 hover:shadow-blue-500/20',
      bgClass: 'hover:bg-blue-50/60 dark:hover:bg-blue-950/20',
      badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
      glowClass: 'from-blue-500/15 via-sky-500/10 to-transparent',
    },
    NGO: {
      icon: HeartHandshake,
      theme: 'emerald',
      label: 'NGO Volunteer',
      description: 'Relief distribution & camp logs',
      borderClass: 'hover:border-emerald-500 hover:shadow-emerald-500/20',
      bgClass: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20',
      badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      glowClass: 'from-emerald-500/15 via-teal-500/10 to-transparent',
    },
    ARMY_RESCUE: {
      icon: Shield,
      theme: 'amber',
      label: 'Army / NDRF Officer',
      description: 'Field air-lift & frontline evac',
      borderClass: 'hover:border-amber-500 hover:shadow-amber-500/20',
      bgClass: 'hover:bg-amber-50/60 dark:hover:bg-amber-950/20',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      glowClass: 'from-amber-500/15 via-orange-500/10 to-transparent',
    },
    HOSPITAL: {
      icon: Stethoscope,
      theme: 'rose',
      label: 'Hospital Station',
      description: 'Triage admissions & patient beds',
      borderClass: 'hover:border-rose-500 hover:shadow-rose-500/20',
      bgClass: 'hover:bg-rose-50/60 dark:hover:bg-rose-950/20',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      glowClass: 'from-rose-500/15 via-red-500/10 to-transparent',
    },
    REVIEWER: {
      icon: FileCheck,
      theme: 'purple',
      label: 'Audit Officer',
      description: 'Verify high-confidence matches',
      borderClass: 'hover:border-purple-500 hover:shadow-purple-500/20',
      bgClass: 'hover:bg-purple-50/60 dark:hover:bg-purple-950/20',
      badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
      glowClass: 'from-purple-500/15 via-indigo-500/10 to-transparent',
    },
    ADMIN: {
      icon: Lock,
      theme: 'cyan',
      label: 'System Commander',
      description: 'Full portal governance & sync',
      borderClass: 'hover:border-cyan-500 hover:shadow-cyan-500/20',
      bgClass: 'hover:bg-cyan-50/60 dark:hover:bg-cyan-950/20',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      glowClass: 'from-cyan-500/15 via-teal-500/10 to-transparent',
    },
  };

  const themeAmbientStyles = {
    blue: 'from-blue-600/10 via-cyan-500/5 to-transparent',
    emerald: 'from-emerald-600/10 via-teal-500/5 to-transparent',
    amber: 'from-amber-600/10 via-yellow-500/5 to-transparent',
    rose: 'from-rose-600/10 via-red-500/5 to-transparent',
    purple: 'from-purple-600/10 via-indigo-500/5 to-transparent',
    cyan: 'from-cyan-600/10 via-blue-500/5 to-transparent',
  };

  return (
    <div className="relative max-w-xl mx-auto my-6 space-y-6">
      {/* Ambient Interactive Color Glow Layer */}
      <div 
        className={`absolute -inset-4 bg-gradient-to-tr ${themeAmbientStyles[activeThemeColor]} rounded-3xl blur-2xl transition-all duration-700 pointer-events-none`} 
      />

      {/* Header Banner */}
      <div className="relative text-center space-y-3">
        {/* Interactive Badge that shifts accent color on click */}
        <div 
          onClick={() => {
            const themes: ('blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan')[] = ['blue', 'emerald', 'amber', 'rose', 'purple', 'cyan'];
            const next = themes[(themes.indexOf(activeThemeColor) + 1) % themes.length];
            setActiveThemeColor(next);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 shadow-sm border border-slate-200/80 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Click to cycle dynamic portal theme color!"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 relative" />
          </div>
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            Live Relief Ops Network Active
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>

        <div className="flex justify-center">
          <div 
            onClick={() => setActiveThemeColor('cyan')}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 transform hover:rotate-6 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Click to burst cyber glow"
          >
            <LifeBuoy className="w-8 h-8 animate-spin-very-slow" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">MILAN</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Centralized AI-Assisted Disaster Person Reconciliation & Emergency Field Operations Portal.
        </p>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Authorized Email</span>
              <span className="text-[10px] text-slate-400 font-normal">Official or Demo</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. family@milan.demo or your@email.com"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Security Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Authenticating Credentials...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> 
                <span>Authenticate & Enter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider text-[10px]">
              Or 1-Click Fast Track Demo Access
            </span>
          </div>
        </div>

        {/* Quick Demo Logins Persona Grid with Interactive Click Shifts */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-500">
              Select persona to test role-based disaster capabilities:
            </p>
            <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 1-Click
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(DEMO_USERS) as UserRole[]).filter((r) => r !== 'VOLUNTEER').map((role) => {
              const cfg = roleConfigs[role] || {
                icon: Shield,
                theme: 'blue' as const,
                label: role,
                description: 'Operational role',
                borderClass: 'hover:border-blue-500',
                bgClass: 'hover:bg-blue-50/50',
                badgeClass: 'bg-blue-100 text-blue-700',
                glowClass: '',
              };
              const Icon = cfg.icon;
              const isSelected = activeCardRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setActiveThemeColor(cfg.theme);
                    handleQuickLogin(role);
                  }}
                  onMouseEnter={() => setActiveThemeColor(cfg.theme)}
                  className={`group relative p-3 border border-slate-200 rounded-2xl text-left transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${cfg.borderClass} ${cfg.bgClass} ${
                    isSelected ? 'ring-2 ring-blue-500 scale-[0.98]' : 'hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-white shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                      <Icon className="w-4 h-4 text-slate-700 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border font-mono tracking-tight uppercase ${cfg.badgeClass}`}>
                          {role.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-600 transition-colors">
                          {DEMO_USERS[role]?.fullName.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {cfg.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
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
      <div className="text-center text-xs text-slate-600 space-y-1">
        <div>
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Register new account
          </Link>
        </div>
        <p className="text-[10px] text-slate-400">
          MILAN Disaster Portal • Encrypted & PWA Offline Sync Enabled
        </p>
      </div>

      <style>{`
        @keyframes spinVerySlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-very-slow {
          animation: spinVerySlow 24s linear infinite;
        }
      `}</style>
    </div>
  );
};
