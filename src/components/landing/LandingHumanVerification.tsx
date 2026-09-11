import React from 'react';
import {
  UserCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Scale,
  FileCheck2,
} from 'lucide-react';

/**
 * LandingHumanVerification:
 * Public-safe storytelling component illustrating the essential Human-in-the-Loop principle:
 * AI Reconciliation → Potential Match → Human Verification → Confirmed Identity.
 * Explains the anti-trafficking and ethical safeguards without exposing internal reviewer controls.
 */
export const LandingHumanVerification: React.FC = () => {

  const stages = [
    {
      title: 'AI Signal Alignment',
      subtitle: 'Surfaces Candidate Pairs',
      desc: 'Multi-factor algorithm groups high-similarity records, reducing thousands of possibilities to actionable candidate pairs.',
      status: 'AUTOMATED STEP',
      statusColor: 'text-[#1b61c9] bg-[#1b61c9]/10 border-[#1b61c9]/30',
    },
    {
      title: 'Potential Match Flagged',
      subtitle: 'Candidate Notification',
      desc: 'System flags matching clues and highlights any conflicting evidence or data gaps for reviewer inspection.',
      status: 'CANDIDATE GATE',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      title: 'Human Verification Audit',
      subtitle: 'Field Reviewer Inspection',
      desc: 'Authorized humanitarian coordinators inspect physical photographs, identifying marks, and interview notes in person.',
      status: 'HUMAN DECISION',
      statusColor: 'text-orange-900 bg-orange-100 border-orange-300',
      isCore: true,
    },
    {
      title: 'Confirmed Identity',
      subtitle: 'Coordinated Safe Reunion',
      desc: 'Dual-officer chain of custody is authorized, official reunion desk coordinates handover, and next of kin is notified.',
      status: 'CERTIFIED REUNION',
      statusColor: 'text-orange-800 bg-orange-50 border-orange-200',
    },
  ];

  return (
    <div className="space-y-8 select-none font-sans">
      {/* 4-Stage Human-in-the-Loop Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-4 ${
              stage.isCore
                ? 'bg-white text-slate-900 border-2 border-orange-500 shadow-card hover:shadow-card-hover ring-4 ring-orange-500/10'
                : 'bg-white text-slate-900 border-slate-200/90 shadow-card hover:border-orange-300 hover:shadow-card-hover'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${stage.statusColor}`}
                >
                  {stage.status}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  0{idx + 1}
                </span>
              </div>

              <div>
                <h4 className="font-sans font-semibold text-base text-slate-900">
                  {stage.title}
                </h4>
                <span
                  className={`text-[11px] font-mono block mt-0.5 ${
                    stage.isCore ? 'text-orange-600 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {stage.subtitle}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-600">
                {stage.desc}
              </p>
            </div>

            {idx < stages.length - 1 ? (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Proceeds to</span>
                <ArrowRight className="w-3 h-3 text-orange-500" />
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-orange-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Handover</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Child Anti-Trafficking & Disaster Safeguards Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-orange-600" />
              <h3 className="font-sans font-bold text-lg sm:text-xl text-slate-900">
                Child Protection & Anti-Trafficking Protocol (Section 370 IPC)
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Disaster chaos creates severe vulnerability to child trafficking and fraud. MILAN incorporates statutory anti-trafficking safeguards into every candidate reunion workflow.
            </p>
          </div>

          <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
            STATUTORY COMPLIANCE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-orange-50/20 rounded-xl border border-orange-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-orange-600" />
              1. Dual-Officer Sign-Off
            </div>
            <p className="text-slate-600 leading-relaxed">
              No unaccompanied minor can be released without concurrent sign-off from both the camp magistrate and child welfare officer.
            </p>
          </div>

          <div className="p-4 bg-orange-50/20 rounded-xl border border-orange-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-orange-600" />
              2. Strict Next-of-Kin Proof
            </div>
            <p className="text-slate-600 leading-relaxed">
              Claimants must verify identity through pre-disaster documents, family photographs, and biometric cross-checks before physical custody transfer.
            </p>
          </div>

          <div className="p-4 bg-orange-50/20 rounded-xl border border-orange-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-orange-600" />
              3. Tamper-Proof Audit Trail
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every identity verification and evidence match produces an immutable, cryptographic audit record to ensure full accountability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
