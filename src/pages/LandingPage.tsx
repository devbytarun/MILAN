import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import { useI18n } from '../context/I18nContext.tsx';
import type { UserRole } from '../types/index.ts';
import {
  Building2,
  Stethoscope,
  Search,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Radio,
  FileText,
  WifiOff,
  Zap,
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
    <div className="bg-white text-[#333840] min-h-screen">
      {/* ── Emergency First Responders Alert Band (Subtle Hairline Notice) ── */}
      <div className="border-b border-[#dddddd] bg-[#f8fafc] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#41454d]">
            <span className="w-2 h-2 rounded-full bg-[#aa2d00]" />
            <strong className="text-[#181d26]">{t('emergency_notice_title')}:</strong>
            <span className="hidden sm:inline">{t('emergency_notice_desc')}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#41454d]">
            <span>NDRF: <strong className="text-[#181d26]">1078</strong></span>
            <span>POLICE: <strong className="text-[#181d26]">112</strong></span>
            <span>AMBULANCE: <strong className="text-[#181d26]">108</strong></span>
          </div>
        </div>
      </div>

      {/* ── Airtable Hero Band: Pure White Canvas, 96px Spacing, Zero Gradients ── */}
      <section className="py-20 sm:py-24 border-b border-[#dddddd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Editorial Eyebrow Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="shade" size="md">
                {t('hero_tag')}
              </Badge>
              <span className="text-[11px] font-mono text-[#9297a0] bg-[#f8fafc] px-2 py-0.5 rounded-sm border border-[#dddddd]">
                [SIMULATED DRILL / DEMO DATA]
              </span>
            </div>

            {/* Headline: Haas Grotesk 40px/48px, modest weight 400 (never bold) */}
            <h1 className="font-display text-4xl sm:text-5xl text-[#181d26] font-normal tracking-tight leading-[1.15]">
              Reuniting Families in Crisis When Names & Faces Aren't Enough.
            </h1>

            {/* Supporting Copy: 16px / 18px body in #333840 */}
            <p className="text-base sm:text-lg text-[#333840] leading-relaxed max-w-2xl">
              {t('hero_subheadline')}
            </p>

            {/* Signature Button Row: Primary near-black button + White secondary button with hairline border */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('hero_cta_missing')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleLaunchRole('NGO', '/report/found')}
                leftIcon={<Building2 className="w-4 h-4" />}
              >
                {t('hero_cta_found')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/cases')}
                leftIcon={<Search className="w-4 h-4" />}
              >
                Browse Cases
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Voltage 1: Signature Coral Card (#aa2d00) ── */}
      <section className="py-16 sm:py-24 border-b border-[#dddddd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="signature-coral-card rounded-xl p-8 sm:p-12 space-y-6">
            <div className="max-w-2xl space-y-3">
              <Badge variant="dark" size="sm">
                Distressed Relatives Portal
              </Badge>
              <h2 className="font-display text-2xl sm:text-4xl font-normal text-white leading-tight">
                Missing Person Intake with Multimodal Audio Clues
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                Families can file comprehensive 6-stage reports indexing clothing, scars, birthmarks, and jewelry. Speak or paste Hindi/English voice calls with the built-in natural language parser to extract structured case clues automatically.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary-on-dark"
                size="md"
                onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Family Report Form
              </Button>
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="text-sm font-medium text-white underline underline-offset-4 hover:text-white/80 transition-colors"
              >
                Check live registry status
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial Section 2: Demo-Grid Cluster on Warm Pastel Surfaces ── */}
      <section className="py-16 sm:py-24 border-b border-[#dddddd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9297a0]">
              Operational Telemetry
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26]">
              Real-Time Field Coordination Grid
            </h2>
            <p className="text-sm text-[#41454d]">
              Live operational telemetry linking active relief camps, trauma centers, and verified reunions:
            </p>
          </div>

          {/* Uneven Multi-Card Grid on Pastel Surfaces (Airtable Spec) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mint surface */}
            <div className="p-6 rounded-md bg-[#a8d8c4]/25 border border-[#a8d8c4] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006400]">
                  Shelters Active
                </span>
                <Building2 className="w-4 h-4 text-[#006400]" />
              </div>
              <div className="font-display text-3xl font-normal text-[#006400]">
                14 Camps
              </div>
              <p className="text-xs text-[#333840] leading-relaxed">
                Relief Sector Bravo active with offline sync queues and localized emergency dispatch.
              </p>
            </div>

            {/* Card 2: Cream surface */}
            <div className="p-6 rounded-md bg-[#f5e9d4] border border-[#e0d0b5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181d26]">
                  Trauma Wards
                </span>
                <Stethoscope className="w-4 h-4 text-[#181d26]" />
              </div>
              <div className="font-display text-3xl font-normal text-[#181d26]">
                8 Hospitals
              </div>
              <p className="text-xs text-[#333840] leading-relaxed">
                Direct clinical inpatient triage with strict role-based medical diagnostic privacy locks.
              </p>
            </div>

            {/* Card 3: Peach surface */}
            <div className="p-6 rounded-md bg-[#fcab79]/25 border border-[#fcab79] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#aa2d00]">
                  Cases Registered
                </span>
                <FileSpreadsheet className="w-4 h-4 text-[#aa2d00]" />
              </div>
              <div className="font-display text-3xl font-normal text-[#aa2d00]">
                142 Cases
              </div>
              <p className="text-xs text-[#333840] leading-relaxed">
                Unified cross-matching across family reports, rescue admissions, and trauma wards.
              </p>
            </div>

            {/* Card 4: Yellow surface */}
            <div className="p-6 rounded-md bg-[#f4d35e]/30 border border-[#d9a441] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181d26]">
                  Reconciled
                </span>
                <ShieldCheck className="w-4 h-4 text-[#181d26]" />
              </div>
              <div className="font-display text-3xl font-normal text-[#181d26]">
                47 Reunited
              </div>
              <p className="text-xs text-[#333840] leading-relaxed">
                100% human-verified reunions with anti-trafficking guardian verification tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Voltage 2: Signature Forest Card (#0a2e0e) ── */}
      <section className="py-16 sm:py-24 border-b border-[#dddddd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="signature-forest-card rounded-xl p-8 sm:p-12 space-y-6">
            <div className="max-w-2xl space-y-3">
              <Badge variant="mint" size="sm">
                NDRF & Army Field Rescue
              </Badge>
              <h2 className="font-display text-2xl sm:text-4xl font-normal text-white leading-tight">
                Field Camp Admission & Rapid VHF Radio Parser
              </h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                Designed for field rescue workers handling non-verbal, infant, or trauma shock survivors. Includes offline-first local queueing and rapid VHF radio transcript parsing for zero-connectivity disaster zones.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary-on-dark"
                size="md"
                onClick={() => handleLaunchRole('NGO', '/report/found')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register Rescued Person
              </Button>
              <Button
                variant="outline-dark"
                size="md"
                onClick={() => handleLaunchRole('HOSPITAL', '/report/hospital')}
                leftIcon={<Stethoscope className="w-4 h-4" />}
              >
                Hospital Emergency Intake
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Voltage 3: Signature Cream Callout Band (#f5e9d4) ── */}
      <section className="py-16 sm:py-24 border-b border-[#dddddd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cream-callout-card rounded-xl p-8 sm:p-12 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#181d26]">
                  Clinical Data Protection
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26]">
                  Hospital Emergency Triage & HIPAA-Grade Privacy
                </h3>
                <p className="text-sm text-[#333840] leading-relaxed">
                  Trauma wards record clinical condition, surgical history, and anatomical marks behind role-based privacy locks. Sensitive medical notes are strictly quarantined to certified clinical personnel.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleLaunchRole('HOSPITAL', '/report/hospital')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                Open Medical Intake
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Voltage 4: Dark Navy Hero Card (#181d26) ── */}
      <section className="py-16 sm:py-24 border-b border-[#dddddd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-card-dark rounded-xl p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl space-y-3">
              <Badge variant="mint" size="sm">
                Reconciliation Intelligence
              </Badge>
              <h2 className="font-display text-2xl sm:text-4xl font-normal text-white leading-tight">
                Explainable Deterministic Matching & Human Audit
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                No black boxes, no false promises. Milan compares 9 distinct physical attributes using transparent weighted scoring and enforces mandatory side-by-side human audit before any family reunion is confirmed.
              </p>
            </div>

            {/* 4 Pipeline Steps inside Dark Hero Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-xs text-[#a8d8c4] font-bold">01 / INTAKE</div>
                <div className="font-semibold text-white text-sm">{t('pipeline_step1_title')}</div>
                <div className="text-xs text-white/70 leading-relaxed">{t('pipeline_step1_desc')}</div>
              </div>
              <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-xs text-[#a8d8c4] font-bold">02 / SAFETY</div>
                <div className="font-semibold text-white text-sm">{t('pipeline_step2_title')}</div>
                <div className="text-xs text-white/70 leading-relaxed">{t('pipeline_step2_desc')}</div>
              </div>
              <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-xs text-[#a8d8c4] font-bold">03 / SCORING</div>
                <div className="font-semibold text-white text-sm">{t('pipeline_step3_title')}</div>
                <div className="text-xs text-white/70 leading-relaxed">{t('pipeline_step3_desc')}</div>
              </div>
              <div className="p-5 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-xs text-[#a8d8c4] font-bold">04 / AUDIT</div>
                <div className="font-semibold text-white text-sm">{t('pipeline_step4_title')}</div>
                <div className="text-xs text-white/70 leading-relaxed">{t('pipeline_step4_desc')}</div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary-on-dark"
                size="md"
                onClick={() => handleLaunchRole('REVIEWER', '/review')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Reviewer Audit Workspace
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Voltage 5: Light Gray CTA Banner (cta-band-light #e0e2e6) ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-band-light rounded-xl p-8 sm:p-12 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#181d26]" />
                  Instant Evaluation Sandbox
                </h3>
                <p className="text-sm text-[#41454d] mt-1">
                  Select any persona to immediately evaluate the disaster coordination platform:
                </p>
              </div>
              <Badge variant="shade" size="sm">
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
                    className={`p-3.5 rounded-lg border text-left transition-colors select-none ${
                      isCurrent
                        ? 'bg-[#181d26] text-white border-[#181d26] font-semibold'
                        : 'bg-white border-[#dddddd] text-[#181d26] hover:bg-[#f8fafc]'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-white/70' : 'text-[#9297a0]'}`}>
                      {r.replace('_', ' ')}
                    </div>
                    <div className="text-xs font-semibold truncate mt-1">{user.fullName}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-white/60' : 'text-[#41454d]'}`}>
                      {user.orgName?.split(' ')[0] || r}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
