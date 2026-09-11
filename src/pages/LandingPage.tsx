import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import { useI18n } from '../context/I18nContext.tsx';
import type { UserRole } from '../types/index.ts';
import {
  Users,
  ShieldCheck,
  Building2,
  Stethoscope,
  Search,
  Clock,
  Database,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';

export const LandingPage: React.FC = () => {
  const { profile, switchDemoRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLaunchRole = (role: UserRole, targetRoute: string) => {
    switchDemoRole(role);
    navigate(targetRoute);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* ── Emergency First Responders Alert Bar ── */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{t('emergency_notice_title')}:</span>
            <span className="text-amber-200/90 hidden sm:inline">{t('emergency_notice_desc')}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-amber-200">
            <span>NDRF: <strong className="text-white">1078</strong></span>
            <span>POLICE: <strong className="text-white">112</strong></span>
            <span>AMBULANCE: <strong className="text-white">108</strong></span>
          </div>
        </div>
      </div>

      {/* ── Hero Crisis Gateway ── */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl space-y-6">
            {/* National Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="mint" size="md">
                {t('hero_tag')}
              </Badge>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                [SIMULATED DRILL / DEMO DATA]
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {t('hero_headline')}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
              {t('hero_subheadline')}
            </p>

            {/* 3-Way Crisis Triage Primary Gateway */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Missing Report Gateway */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-900/40 hover:border-rose-500/60 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Missing Relative</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      For distressed families reporting a lost loved one with physical marks, clothing, and audio notes.
                    </p>
                  </div>
                </div>
                <div className="pt-5">
                  <Button
                    variant="critical"
                    size="md"
                    onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full justify-between"
                  >
                    {t('hero_cta_missing')}
                  </Button>
                </div>
              </div>

              {/* Found Survivor Gateway */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-900/40 hover:border-emerald-500/60 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Rescued Survivor</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      For NDRF, Army & NGO teams registering persons admitted to field relief shelters or in shock.
                    </p>
                  </div>
                </div>
                <div className="pt-5">
                  <Button
                    variant="rescue"
                    size="md"
                    onClick={() => handleLaunchRole('NGO', '/report/found')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full justify-between"
                  >
                    {t('hero_cta_found')}
                  </Button>
                </div>
              </div>

              {/* Hospital Intake Gateway */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-sky-900/40 hover:border-sky-500/60 transition-all duration-200 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Hospital Emergency</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      For triage nurses & emergency wards logging admitted trauma patients under privacy locks.
                    </p>
                  </div>
                </div>
                <div className="pt-5">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleLaunchRole('HOSPITAL', '/report/hospital')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full justify-between"
                  >
                    {t('hero_cta_hospital')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Directory & Review Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="ghost-dark"
                size="sm"
                onClick={() => navigate('/cases')}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Search Public Case Directory
              </Button>
              <Button
                variant="ghost-dark"
                size="sm"
                onClick={() => handleLaunchRole('REVIEWER', '/review')}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Reviewer Audit Workspace
              </Button>
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── Simulated Operational Telemetry Grid ── */}
      <section className="bg-slate-900/60 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-blue-400">14</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                {t('shelters_connected')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Disaster Sector Bravo</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-sky-400">8</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                {t('hospitals_linked')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Emergency Trauma Wards</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-400">142</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                Active Cases Registered
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Family & Field Reports</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">47</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                {t('cases_reconciled')}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">100% Human Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reconciliation Pipeline (How MILAN Works) ── */}
      <section className="py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Explainable Architecture
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
              {t('pipeline_title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {t('pipeline_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold">
                01
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">{t('pipeline_step1_title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('pipeline_step1_desc')}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-blue-400 font-medium">
                <Activity className="w-3.5 h-3.5" />
                <span>Offline-first Queue</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold">
                02
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">{t('pipeline_step2_title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('pipeline_step2_desc')}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Invasive Biometrics</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold">
                03
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">{t('pipeline_step3_title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('pipeline_step3_desc')}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>Weighted Fuzzy Matching</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold">
                04
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">{t('pipeline_step4_title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('pipeline_step4_desc')}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anti-Trafficking Sign-off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1-Click Evaluation Persona Sandbox ── */}
      <section className="py-16 sm:py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  Instant Evaluation Sandbox
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Evaluate the disaster reconciliation platform with pre-configured authority roles:
                </p>
              </div>
              <Badge variant="mint" size="sm">
                1-CLICK AUTH
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
                const user = DEMO_USERS[r];
                const isCurrent = profile?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleLaunchRole(r, '/dashboard')}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-150 select-none ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                      {r.replace('_', ' ')}
                    </div>
                    <div className="text-xs font-bold truncate mt-1">{user.fullName}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-blue-200' : 'text-slate-500'}`}>
                      {user.orgName?.split(' ')[0] || r}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Human-Centric Humanitarian Principles ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">
                Deterministic Weighted Similarity
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explainable scoring across names, age brackets, scars, tattoos, and clothing without black-box false positives.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">
                Mandatory Human Verification
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matches are never confirmed automatically. Authorized reviewers audit evidence side-by-side before notifying families.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">
                Empathetic Family Status Timeline
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent case milestones (SUBMITTED → SEARCHING → POSSIBLE_MATCH → VERIFIED) so families always know their case is actively tracked.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
