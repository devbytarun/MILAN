import React from 'react';
import {
  FileText,
  Cpu,
  GitMerge,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/**
 * LandingPipeline:
 * Cinematic 5-step interactive pipeline visual explaining the complete MILAN workflow:
 * Raw Information → Structured Signals → Candidate Reconciliation → Human Verification → Confirmed Identity
 */
export const LandingPipeline: React.FC = () => {
  const steps = [
    {
      step: '01',
      tag: 'INTAKE',
      title: 'Raw Information',
      desc: 'Fragmented reports arrive from family hotlines, shelter handwritten logs, and emergency medical admissions.',
      icon: FileText,
      accent: 'border-[#aa2d00] text-[#aa2d00] bg-[#aa2d00]/10',
    },
    {
      step: '02',
      tag: 'STRUCTURE',
      title: 'Signal Extraction',
      desc: 'Multilingual NLP transforms unstructured transcripts into normalized physical attributes and tolerance windows.',
      icon: Cpu,
      accent: 'border-[#1b61c9] text-[#1b61c9] bg-[#1b61c9]/10',
    },
    {
      step: '03',
      tag: 'RECONCILE',
      title: 'Signal Convergence',
      desc: 'Deterministic matching algorithm correlates physical scars, clothing clues, and locations across separate databases.',
      icon: GitMerge,
      accent: 'border-[#d9a441] text-[#d9a441] bg-[#d9a441]/10',
    },
    {
      step: '04',
      tag: 'VERIFY',
      title: 'Human Audit',
      desc: 'Humanitarian officers inspect evidence side-by-side, enforce child anti-trafficking protocols, and resolve conflicts.',
      icon: ShieldCheck,
      accent: 'border-[#006400] text-[#006400] bg-[#006400]/10',
    },
    {
      step: '05',
      tag: 'REUNITE',
      title: 'Confirmed Identity',
      desc: 'Official handover protocol is signed, next of kin are notified securely, and family reunion is completed.',
      icon: HeartHandshake,
      accent: 'border-[#39bf45] text-[#39bf45] bg-[#39bf45]/10',
    },
  ];

  return (
    <div className="w-full space-y-8 select-none font-body">
      {/* Visual Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={idx}
              className="relative p-5 rounded-xl bg-white border border-[#dddddd] shadow-elevation-1 hover:border-[#181d26] transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.accent}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-xs font-bold text-[#9297a0]">
                    {item.step}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#9297a0] font-semibold">
                    {item.tag}
                  </div>
                  <h3 className="font-display font-normal text-base text-[#181d26] mt-0.5">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-[#41454d] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f1f3f5] flex items-center justify-between text-[11px] font-mono text-[#9297a0]">
                <span>Phase {item.step}</span>
                {!isLast && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#9297a0] group-hover:translate-x-0.5 transition-transform" />
                )}
                {isLast && (
                  <span className="text-[#006400] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Reunited
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
