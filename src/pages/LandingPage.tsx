import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.tsx';
import type { UserRole } from '../types/index.ts';
import {
  Users,
  ShieldCheck,
  Building2,
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Database,
  Radio,
  FileText,
  WifiOff,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { profile, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleLaunchRole = (role: UserRole, targetRoute: string) => {
    switchDemoRole(role);
    navigate(targetRoute);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-blue-900/40">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            MULTI-SOURCE DISASTER RECONCILIATION
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Reuniting Families in Crisis When Names & Faces Aren't Enough.
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed">
            MILAN connects missing person inquiries from families with field rescue camps, NGOs, and hospital triage records using explainable weighted multi-attribute matching and human verification.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:scale-[1.02] transition"
            >
              <Users className="w-5 h-5" />
              File Missing Person Report
            </button>
            <button
              onClick={() => handleLaunchRole('NGO', '/report/found')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:scale-[1.02] transition"
            >
              <Building2 className="w-5 h-5" />
              Register Found / Rescued Person
            </button>
            <Link
              to="/cases"
              className="px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
            >
              <Search className="w-5 h-5" />
              Browse Cases
            </Link>
          </div>
        </div>

        {/* Subtle Background Glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* ============================================================ */}
      {/* HACKX 4.0 INSTITUTIONAL INNOVATIONS SHOWCASE */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              MUJ HackX 4.0 Institutional Innovations
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Disaster-Grade AI & Resilience Engines
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Engineered for zero-connectivity blackout zones, chaotic radio dispatches, and forensic verification rigor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Innovation 1: Blackout Engine */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <WifiOff className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Innovation 1
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                  "The Blackout Protocol"
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Disaster zones suffer 100% cell tower failures. Intakes are cached locally in encrypted browser queues and batch-reconciled with conflict resolution when network returns.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">See top banner to toggle</span>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                Active in Header <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Innovation 2: Voice/Radio AI Intake */}
          <Link
            to="/report/voice"
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white rounded-2xl p-6 border border-cyan-900/50 shadow-xl flex flex-col justify-between group hover:border-cyan-400/60 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Innovation 2
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                  Voice & Radio-to-Case AI
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  First responders in boats or helicopters cannot type. Speak or paste chaotic radio logs in Hindi/English — zero-dependency NLP maps 8+ attributes straight to intake records.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-cyan-900/60 flex items-center justify-between">
              <span className="text-[11px] text-cyan-400 font-mono">Live Mic & Sample Radios</span>
              <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                Launch Voice AI <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Innovation 3: Forensic Dossier Engine */}
          <Link
            to="/dossier"
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white rounded-2xl p-6 border border-violet-900/50 shadow-xl flex flex-col justify-between group hover:border-violet-400/60 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Innovation 3
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition">
                  Forensic Verification Dossier
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Prevents false child handovers. Generates explainable evidence breakdown charts, flags severe discrepancies (e.g. blood group mismatches), and produces printable certificates.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-violet-900/60 flex items-center justify-between">
              <span className="text-[11px] text-violet-400 font-mono">Institutional Dossier</span>
              <span className="text-xs text-violet-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition">
                Open Dossier Engine <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4 Intake Portals */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Structured Intake Across 4 Channels</h2>
          <p className="text-slate-600 text-sm">
            Standardized data capture for families, rescue workers, medical facilities, and verification coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Family Portal */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Families & Relatives
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Missing Person Intake</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  6-step comprehensive intake: physical identifiers, clothing, birthmarks, and distinguishing personal clues.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchRole('FAMILY', '/report/missing')}
              className="mt-6 w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Family Form <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* NGO & Army Portal */}
          <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  NGO & Army Rescue
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Found Person Intake</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Branching form designed for field camps: handles both communicative and unconscious / shock survivors.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchRole('NGO', '/report/found')}
              className="mt-6 w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Rescue Form <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hospital Portal */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Hospitals & Clinics
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Medical Intake</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Triage observations, blood group, trauma markings, and referral tracking with strict role-based privacy locks.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchRole('HOSPITAL', '/report/hospital')}
              className="mt-6 w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Hospital Form <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reviewer Portal */}
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Review Coordinators
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Match Reviewer Portal</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Side-by-side candidate comparison with confidence tiers, evidence scores, and human verify/reject actions.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchRole('REVIEWER', '/review')}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              Open Reviewer Portal <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Instant Demo Sandbox Roles */}
      <section className="bg-slate-100 border border-slate-200 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              1-Click Demo Personas (Evaluation Sandbox)
            </h3>
            <p className="text-xs text-slate-600">
              Select any role to immediately test the platform with pre-configured permissions:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
            const user = DEMO_USERS[r];
            const isCurrent = profile?.role === r;
            return (
              <button
                key={r}
                onClick={() => handleLaunchRole(r, '/dashboard')}
                className={`p-3 rounded-xl border text-left transition relative ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                  {r.replace('_', ' ')}
                </div>
                <div className="text-xs font-bold truncate mt-1">{user.fullName}</div>
                <div className={`text-[10px] truncate ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                  {user.orgName?.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Core Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Deterministic Weighted Matching</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Transparent, explainable scoring across names, age brackets, scars, tattoos, and clothing without black-box false positives.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Mandatory Human Verification</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Matches are never confirmed automatically. Authorized reviewers audit evidence side-by-side before notifying families.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Honest Family Status Timeline</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Transparent case milestones (`SUBMITTED` $\rightarrow$ `SEARCHING` $\rightarrow$ `POSSIBLE_MATCH` $\rightarrow$ `VERIFIED`) so families always know their case is actively tracked.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
