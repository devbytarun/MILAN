import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import { useI18n } from '../context/I18nContext.tsx';
import type { UserRole } from '../types/index.ts';
import {
  ArrowRight,
  Search,
  Building2,
  Stethoscope,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { LandingReconciliationVisual } from '../components/landing/LandingReconciliationVisual.tsx';
import { LandingSignalExtraction } from '../components/landing/LandingSignalExtraction.tsx';
import { LandingPipeline } from '../components/landing/LandingPipeline.tsx';
import { LandingHumanVerification } from '../components/landing/LandingHumanVerification.tsx';

export const LandingPage: React.FC = () => {
  const { profile, switchDemoRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLaunchRole = (role: UserRole, targetRoute: string) => {
    switchDemoRole(role);
    navigate(targetRoute);
  };

  return (
    <div className="bg-white text-[#333840] min-h-screen font-body selection:bg-[#181d26] selection:text-white">
      {/* ── 00. COMPACT EMERGENCY NOTICE STRIP ── */}
      <div className="border-b border-[#dddddd] bg-[#f8fafc] px-6 sm:px-8 lg:px-12 py-2">
        <div className="w-full max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#41454d]">
            <span className="w-2 h-2 rounded-full bg-[#aa2d00] shrink-0" />
            <strong className="text-[#181d26] font-semibold">
              {t('notice_banner_title')}
            </strong>
            <span className="hidden md:inline text-[#41454d]">
              {t('notice_banner_desc')}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#41454d]">
            <span>{t('notice_ndrf')}</span>
            <span>•</span>
            <span>{t('notice_police')}</span>
            <span>•</span>
            <span>{t('notice_ambulance')}</span>
            <span>•</span>
            <span>{t('notice_childline')}</span>
          </div>
        </div>
      </div>

      {/* ── 01. HERO SECTION: ASYMMETRIC EDITORIAL NARRATIVE + OPERATIONAL RECONCILIATION DOSSIER ── */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-[#dddddd]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left: Narrative & Structured Action Hierarchy */}
            <div className="lg:col-span-7 space-y-6">
              {/* Plain Eyebrow Metadata (No Pill) */}
              <div className="text-[11px] font-mono tracking-widest uppercase text-[#9297a0] font-semibold flex items-center gap-2">
                <span>{t('hero_network_tag')}</span>
                <span>•</span>
                <span>{t('hero_simulated_tag')}</span>
              </div>

              {/* Editorial Headline */}
              <h1 className="font-display font-normal text-4xl sm:text-5xl lg:text-6xl text-[#181d26] tracking-tight leading-[1.08]">
                {t('hero_title')}
              </h1>

              {/* Supporting Statement */}
              <p className="text-base sm:text-lg text-[#333840] leading-relaxed max-w-2xl font-normal">
                {t('hero_subtitle')}
              </p>

              {/* Strict Action Hierarchy: Primary solid, Secondary outline, Tertiary quiet */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Primary CTA: Solid Near-Black Ink */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t('hero_cta_missing')}
                </Button>

                {/* Secondary CTA: Outline White Button */}
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleLaunchRole('NGO', '/report/found')}
                  leftIcon={<Building2 className="w-4 h-4" />}
                >
                  {t('hero_cta_found')}
                </Button>

                {/* Tertiary CTA: Quiet Text Link */}
                <Link
                  to="/cases"
                  className="px-4 py-3 text-sm font-medium text-[#181d26] hover:text-[#aa2d00] hover:underline transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4 text-[#9297a0]" />
                  {t('hero_cta_search')}
                </Link>
              </div>

              {/* Operational Capabilities Footnote */}
              <div className="pt-4 border-t border-[#dddddd] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#9297a0] font-mono">
                <span className="flex items-center gap-1.5 text-[#41454d]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#006400]" /> {t('hero_trust_offline')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#41454d]">
                  <Lock className="w-3.5 h-3.5 text-[#181d26]" /> {t('hero_trust_privacy')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#41454d]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#aa2d00]" /> {t('hero_trust_safeguard')}
                </span>
              </div>
            </div>

            {/* Right: Public-Safe Conceptual Identity Reconciliation Visual */}
            <div className="lg:col-span-5">
              <LandingReconciliationVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── 02. COMPACT OPERATIONAL STATUS STRIP ── */}
      <section className="border-b border-[#dddddd] bg-[#f8fafc] py-3.5 px-6 sm:px-8 lg:px-12">
        <div className="w-full max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs font-mono text-[#41454d]">
          <div className="flex items-center gap-2 text-[#181d26] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#006400] animate-pulse" />
            <span>{t('status_operational_mesh')}</span>
          </div>
          <div>{t('status_sync_frequency')}</div>
          <div>{t('status_active_nodes')}</div>
          <div>{t('status_connected_camps')}</div>
          <div>{t('status_triage_wards')}</div>
          <div>{t('status_verified_reunions')}</div>
        </div>
      </section>

      {/* ── 03. THE PROBLEM: INFORMATION CHAOS IN DISASTERS (Editorial Section, NO cards) ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#dddddd]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left: Problem Narrative */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aa2d00]">
                {t('problem_tag')}
              </span>
              <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#181d26] leading-tight">
                {t('problem_title')}
              </h2>
              <p className="text-sm sm:text-base text-[#41454d] leading-relaxed">
                {t('problem_desc')}
              </p>
            </div>

            {/* Right: Connective Diagram of Fragmented Field Signals Converging */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border border-[#dddddd] rounded-xl p-6 sm:p-8 bg-[#f8fafc] space-y-6">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#9297a0] font-semibold">
                  FRAGMENTED FIELD SIGNALS GENERATED DURING EVACUATION
                </div>

                {/* 4 Fragmented Signals */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-white border border-[#dddddd] rounded-lg space-y-1">
                    <span className="text-[#aa2d00] font-bold block">{t('problem_family_label')}</span>
                    <p className="text-[#181d26] font-body text-xs">
                      {t('problem_family_desc')}
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-[#dddddd] rounded-lg space-y-1">
                    <span className="text-[#0a2e0e] font-bold block">{t('problem_field_label')}</span>
                    <p className="text-[#181d26] font-body text-xs">
                      {t('problem_field_desc')}
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-[#dddddd] rounded-lg space-y-1">
                    <span className="text-[#254fad] font-bold block">{t('problem_hospital_label')}</span>
                    <p className="text-[#181d26] font-body text-xs">
                      {t('problem_hospital_desc')}
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-[#dddddd] rounded-lg space-y-1">
                    <span className="text-[#181d26] font-bold block">{t('problem_milan_core')}</span>
                    <p className="text-[#181d26] font-body text-xs">
                      {t('problem_milan_desc')}
                    </p>
                  </div>
                </div>

                {/* Visual Convergence Indicator */}
                <div className="pt-2 border-t border-[#dddddd] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-[#41454d]">
                    WEIGHTED MULTI-ATTRIBUTE RECONCILIATION ENGINE
                  </span>
                  <span className="text-[#006400] font-bold flex items-center gap-1 bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" /> RECONCILED INTO ONE UNIFIED CANDIDATE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04. DATA TRANSFORMATION: CHAOS TO STRUCTURED ATTRIBUTES ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#dddddd] bg-[#f8fafc]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aa2d00]">
              {t('trans_tag')}
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#181d26] leading-tight">
              {t('trans_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#41454d] leading-relaxed">
              {t('trans_desc')}
            </p>
          </div>

          {/* Cinematic Public-Safe Extraction Visual */}
          <LandingSignalExtraction />
        </div>
      </section>

      {/* ── 05. CONTINUOUS RECONCILIATION PIPELINE (Single Flow, NO card soup) ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#dddddd]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aa2d00]">
              {t('pipeline_tag')}
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#181d26] leading-tight">
              {t('pipeline_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#41454d] leading-relaxed">
              {t('pipeline_desc')}
            </p>
          </div>

          {/* 5-Step Continuous End-to-End Pipeline */}
          <LandingPipeline />
        </div>
      </section>

      {/* ── 06. HUMAN VERIFICATION & CHILD ANTI-TRAFFICKING (Trust Differentiator) ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#dddddd] bg-[#f8fafc]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aa2d00]">
                {t('safeguards_tag')}
              </span>
              <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#181d26] leading-tight">
                {t('safeguards_title')}
              </h2>
              <p className="text-sm sm:text-base text-[#41454d] leading-relaxed">
                {t('safeguards_desc')}
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleLaunchRole('REVIEWER', '/review')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Coordinator Review Queue
              </Button>
            </div>
          </div>

          {/* 4-Stage Human-in-the-Loop Progression & Anti-Trafficking Safeguards */}
          <LandingHumanVerification />
        </div>
      </section>

      {/* ── 07. THREE OPERATIONAL WORKSPACES (Distinct Editorial Rows, NOT 3 clone cards) ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-[#dddddd]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aa2d00]">
              {t('domains_tag')}
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#181d26] leading-tight">
              {t('domains_title')}
            </h2>
            <p className="text-sm sm:text-base text-[#41454d] leading-relaxed">
              {t('domains_desc')}
            </p>
          </div>

          {/* 3 Distinct Full-Width Rows */}
          <div className="space-y-6">
            {/* Domain 1: Family */}
            <div className="p-6 sm:p-8 border border-[#dddddd] rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#aa2d00]" />
                  <span className="font-mono text-xs font-bold uppercase text-[#aa2d00]">
                    STAKEHOLDER 01 / FAMILY & NEXT-OF-KIN
                  </span>
                </div>
                <h3 className="font-display text-xl font-normal text-[#181d26]">
                  {t('domains_family_title')}
                </h3>
                <p className="text-sm text-[#41454d] leading-relaxed">
                  {t('domains_family_desc')}
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                {t('domains_family_cta')}
              </Button>
            </div>

            {/* Domain 2: Field Rescue (NDRF / Army) */}
            <div className="p-6 sm:p-8 border border-[#dddddd] rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0a2e0e]" />
                  <span className="font-mono text-xs font-bold uppercase text-[#0a2e0e]">
                    STAKEHOLDER 02 / FIELD RESCUE & ARMY NDRF
                  </span>
                </div>
                <h3 className="font-display text-xl font-normal text-[#181d26]">
                  {t('domains_rescue_title')}
                </h3>
                <p className="text-sm text-[#41454d] leading-relaxed">
                  {t('domains_rescue_desc')}
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleLaunchRole('NGO', '/report/found')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                {t('domains_rescue_cta')}
              </Button>
            </div>

            {/* Domain 3: Hospital & Trauma Units */}
            <div className="p-6 sm:p-8 border border-[#dddddd] rounded-xl bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#254fad]" />
                  <span className="font-mono text-xs font-bold uppercase text-[#254fad]">
                    STAKEHOLDER 03 / HOSPITAL & CLINICAL TRIAGE
                  </span>
                </div>
                <h3 className="font-display text-xl font-normal text-[#181d26]">
                  {t('domains_hospital_title')}
                </h3>
                <p className="text-sm text-[#41454d] leading-relaxed">
                  {t('domains_hospital_desc')}
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleLaunchRole('HOSPITAL', '/report/hospital')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                {t('domains_hospital_cta')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 08. 1-CLICK STAKEHOLDER PERSONA EVALUATION STRIP ── */}
      <section className="py-12 sm:py-16 border-b border-[#dddddd] bg-[#f8fafc]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#9297a0]">
                {t('personas_tag')}
              </span>
              <h2 className="font-display font-normal text-2xl text-[#181d26]">
                {t('personas_title')}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#9297a0]">
              {t('personas_desc')}
            </span>
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
      </section>

      {/* ── 09. CLOSING EDITORIAL CALL TO ACTION ── */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="border border-[#dddddd] rounded-xl p-8 sm:p-14 bg-white space-y-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aa2d00]">
                OPEN HUMANITARIAN INFRASTRUCTURE
              </span>
              <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#181d26] leading-tight">
                {t('closing_title')}
              </h2>
              <p className="text-sm sm:text-base text-[#41454d] leading-relaxed">
                {t('closing_desc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('closing_cta_report')}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/cases')}
                leftIcon={<Search className="w-4 h-4" />}
              >
                {t('closing_cta_directory')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
