import React from 'react';
import {
  GitCompare,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';

/**
 * LandingReconciliationVisual:
 * A cinematic, public-safe explanation of MILAN's identity reconciliation engine.
 * Demonstrates multi-signal alignment without exposing internal case UIDs,
 * database fields, or raw percentage scores.
 */
export const LandingReconciliationVisual: React.FC = () => {
  const { t } = useI18n();

  const signals = [
    {
      label: 'Age Proximity',
      detail: '28 Yrs ↔ 27 Yrs (Within Tolerance Window)',
      status: 'SIGNAL ALIGNED',
      statusColor: 'text-orange-800 border-orange-300 bg-orange-100/80',
    },
    {
      label: 'Clothing Clues',
      detail: 'Blue jacket & dark trousers match on both records',
      status: 'SIGNAL ALIGNED',
      statusColor: 'text-orange-800 border-orange-300 bg-orange-100/80',
    },
    {
      label: 'Distinctive Mark',
      detail: 'Facial scar observed during medical triage',
      status: 'SIGNAL ALIGNED',
      statusColor: 'text-orange-800 border-orange-300 bg-orange-100/80',
    },
    {
      label: 'Location Vectors',
      detail: 'Sector basin correlated with downriver shelter camp',
      status: 'CORRELATED',
      statusColor: 'text-amber-800 border-amber-300 bg-amber-100/70',
    },
    {
      label: 'Clinical Data',
      detail: 'Family record incomplete ↔ Shelter record available',
      status: 'DATA GAP NOTED',
      statusColor: 'text-slate-600 border-slate-200 bg-slate-100',
    },
  ];

  return (
    <div className="relative rounded-2xl bg-white text-[#181d26] border border-orange-200 shadow-xl overflow-hidden font-body select-none">
      {/* Subtle Warm Amber Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative border-b border-orange-100 bg-orange-50/40 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#181d26]">
            {t('dossier_title')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-orange-800 bg-orange-100/70 px-2.5 py-1 rounded border border-orange-200">
          <Sparkles className="w-3 h-3 text-orange-600" />
          <span>CONCEPTUAL DEMONSTRATION</span>
        </div>
      </div>

      {/* Compared Anonymous Records (Report A + Report B) */}
      <div className="relative p-5 space-y-4 border-b border-orange-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Report A */}
          <div className="p-3.5 rounded-xl bg-orange-50/20 border border-orange-100 space-y-1.5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span>{t('dossier_source_a')}</span>
              <span className="text-orange-600 font-bold">FAMILY DESK</span>
            </div>
            <div className="text-sm font-semibold text-[#181d26]">Missing Person Report</div>
            <div className="text-xs text-[#41454d] font-mono">
              Approx. 28 Yrs • Male • Relative Registry
            </div>
          </div>

          {/* Report B */}
          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-1.5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span>{t('dossier_source_b')}</span>
              <span className="text-orange-700 font-bold">SHELTER INTAKE</span>
            </div>
            <div className="text-sm font-bold text-orange-950">Rescue Shelter Arrival</div>
            <div className="text-xs text-orange-900/70 font-mono">
              Approx. 27 Yrs • Male • Evacuation Camp
            </div>
          </div>
        </div>

        {/* Convergence Indicator Bar (Warm Orange Accent, NO numeric scores) */}
        <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-300/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#181d26] font-medium flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5 text-orange-600" />
              {t('dossier_confidence_label')}
            </span>
            <span className="text-orange-700 font-bold">
              {t('dossier_confidence_val')}
            </span>
          </div>

          {/* Stylized Signal Convergence Flow */}
          <div className="w-full bg-orange-200/70 h-2 rounded-full overflow-hidden flex">
            <div className="bg-orange-500 h-full rounded-full w-4/5 animate-pulse" />
          </div>
          <div className="text-[11px] text-[#41454d] flex items-center justify-between font-mono pt-0.5">
            <span>Deterministic Attribute Alignment</span>
            <span className="text-orange-700 font-bold">Candidate Flagged</span>
          </div>
        </div>
      </div>

      {/* Aligned Evidence Signals List */}
      <div className="relative divide-y divide-orange-100/60 text-xs">
        {signals.map((item, idx) => (
          <div
            key={idx}
            className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-orange-50/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-[#181d26] block truncate">{item.label}</span>
              <span className="text-[11px] text-[#41454d] truncate block">{item.detail}</span>
            </div>
            <span
              className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${item.statusColor}`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* Human-in-the-Loop Safeguard Notice */}
      <div className="relative p-4 bg-orange-50/40 border-t border-orange-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0 mt-0.5">
          <UserCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-xs font-semibold text-[#181d26] flex items-center gap-1.5">
            <span>Human Verification Required</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 font-semibold">
              MANDATORY
            </span>
          </div>
          <p className="text-[11px] text-[#41454d] leading-relaxed">
            Automated algorithms never confirm reunions alone. An authorized disaster reviewer audits physical evidence and photo verification before family contact.
          </p>
        </div>
      </div>
    </div>
  );
};
