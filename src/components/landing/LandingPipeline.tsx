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
      accent: 'border-orange-500 text-orange-600 bg-orange-50',
    },
    {
      step: '02',
      tag: 'STRUCTURE',
      title: 'Signal Extraction',
      desc: 'Multilingual NLP transforms unstructured transcripts into normalized physical attributes and tolerance windows.',
      icon: Cpu,
      accent: 'border-amber-600 text-amber-600 bg-amber-50',
    },
    {
      step: '03',
      tag: 'RECONCILE',
      title: 'Signal Convergence',
      desc: 'Deterministic matching algorithm correlates physical scars, clothing clues, and locations across separate databases.',
      icon: GitMerge,
      accent: 'border-orange-600 text-orange-600 bg-orange-50',
    },
    {
      step: '04',
      tag: 'VERIFY',
      title: 'Human Audit',
      desc: 'Humanitarian officers inspect evidence side-by-side, enforce child anti-trafficking protocols, and resolve conflicts.',
      icon: ShieldCheck,
      accent: 'border-orange-700 text-orange-700 bg-orange-100/70',
    },
    {
      step: '05',
      tag: 'REUNITE',
      title: 'Confirmed Identity',
      desc: 'Official handover protocol is signed, next of kin are notified securely, and family reunion is completed.',
      icon: HeartHandshake,
      accent: 'border-orange-500 text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className="w-full space-y-8 select-none font-sans">
      {/* Visual Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={idx}
              className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:border-orange-300 hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${item.accent}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {item.step}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-orange-600 font-semibold">
                    {item.tag}
                  </div>
                  <h3 className="font-sans font-semibold text-base text-slate-900 mt-0.5">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Phase {item.step}</span>
                {!isLast && (
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                )}
                {isLast && (
                  <span className="text-orange-600 font-semibold flex items-center gap-1">
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
