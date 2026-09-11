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
      statusColor: 'text-[#d9a441] bg-[#d9a441]/10 border-[#d9a441]/30',
    },
    {
      title: 'Human Verification Audit',
      subtitle: 'Field Reviewer Inspection',
      desc: 'Authorized humanitarian coordinators inspect physical photographs, identifying marks, and interview notes in person.',
      status: 'HUMAN DECISION',
      statusColor: 'text-[#006400] bg-[#006400]/10 border-[#006400]/30',
      isCore: true,
    },
    {
      title: 'Confirmed Identity',
      subtitle: 'Coordinated Safe Reunion',
      desc: 'Dual-officer chain of custody is authorized, official reunion desk coordinates handover, and next of kin is notified.',
      status: 'CERTIFIED REUNION',
      statusColor: 'text-[#006400] bg-[#006400]/10 border-[#006400]/30',
    },
  ];

  return (
    <div className="space-y-8 select-none font-body">
      {/* 4-Stage Human-in-the-Loop Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl border transition-all relative flex flex-col justify-between space-y-4 ${
              stage.isCore
                ? 'bg-[#181d26] text-white border-[#181d26] shadow-elevation-2'
                : 'bg-white text-[#181d26] border-[#dddddd] shadow-elevation-1'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${stage.statusColor}`}
                >
                  {stage.status}
                </span>
                <span
                  className={`font-mono text-xs ${
                    stage.isCore ? 'text-white/50' : 'text-[#9297a0]'
                  }`}
                >
                  0{idx + 1}
                </span>
              </div>

              <div>
                <h4
                  className={`font-display font-normal text-base ${
                    stage.isCore ? 'text-white' : 'text-[#181d26]'
                  }`}
                >
                  {stage.title}
                </h4>
                <span
                  className={`text-[11px] font-mono block mt-0.5 ${
                    stage.isCore ? 'text-[#a8d8c4]' : 'text-[#41454d]'
                  }`}
                >
                  {stage.subtitle}
                </span>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  stage.isCore ? 'text-white/70' : 'text-[#41454d]'
                }`}
              >
                {stage.desc}
              </p>
            </div>

            {idx < stages.length - 1 ? (
              <div
                className={`pt-2 border-t flex items-center justify-between text-[11px] font-mono ${
                  stage.isCore ? 'border-white/10 text-white/50' : 'border-[#f1f3f5] text-[#9297a0]'
                }`}
              >
                <span>Proceeds to</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            ) : (
              <div className="pt-2 border-t border-[#f1f3f5] flex items-center gap-1.5 text-[11px] font-mono text-[#006400] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Handover</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Child Anti-Trafficking & Disaster Safeguards Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#dddddd] shadow-elevation-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dddddd] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#aa2d00]" />
              <h3 className="font-display font-normal text-lg sm:text-xl text-[#181d26]">
                Child Protection & Anti-Trafficking Protocol (Section 370 IPC)
              </h3>
            </div>
            <p className="text-xs text-[#41454d] max-w-2xl">
              Disaster chaos creates severe vulnerability to child trafficking and fraud. MILAN incorporates statutory anti-trafficking safeguards into every candidate reunion workflow.
            </p>
          </div>

          <span className="font-mono text-xs font-bold text-[#006400] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
            STATUTORY COMPLIANCE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#dddddd] space-y-2">
            <div className="font-semibold text-[#181d26] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#006400]" />
              1. Dual-Officer Sign-Off
            </div>
            <p className="text-[#41454d] leading-relaxed">
              No unaccompanied minor can be released without concurrent sign-off from both the camp magistrate and child welfare officer.
            </p>
          </div>

          <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#dddddd] space-y-2">
            <div className="font-semibold text-[#181d26] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#aa2d00]" />
              2. Strict Next-of-Kin Proof
            </div>
            <p className="text-[#41454d] leading-relaxed">
              Claimants must verify identity through pre-disaster documents, family photographs, and biometric cross-checks before physical custody transfer.
            </p>
          </div>

          <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#dddddd] space-y-2">
            <div className="font-semibold text-[#181d26] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#181d26]" />
              3. Tamper-Proof Audit Trail
            </div>
            <p className="text-[#41454d] leading-relaxed">
              Every identity verification and evidence match produces an immutable, cryptographic audit record to ensure full accountability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
