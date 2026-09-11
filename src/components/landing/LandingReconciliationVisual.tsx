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
      statusColor: 'text-[#a8d8c4] border-[#a8d8c4]/30 bg-[#a8d8c4]/10',
    },
    {
      label: 'Clothing Clues',
      detail: 'Blue jacket & dark trousers match on both records',
      status: 'SIGNAL ALIGNED',
      statusColor: 'text-[#a8d8c4] border-[#a8d8c4]/30 bg-[#a8d8c4]/10',
    },
    {
      label: 'Distinctive Mark',
      detail: 'Facial scar observed during medical triage',
      status: 'SIGNAL ALIGNED',
      statusColor: 'text-[#a8d8c4] border-[#a8d8c4]/30 bg-[#a8d8c4]/10',
    },
    {
      label: 'Location Vectors',
      detail: 'Sector basin correlated with downriver shelter camp',
      status: 'CORRELATED',
      statusColor: 'text-[#f5e9d4] border-[#f5e9d4]/30 bg-[#f5e9d4]/10',
    },
    {
      label: 'Clinical Data',
      detail: 'Family record incomplete ↔ Shelter record available',
      status: 'DATA GAP NOTED',
      statusColor: 'text-[#9297a0] border-white/10 bg-white/5',
    },
  ];

  return (
    <div className="relative rounded-2xl bg-[#181d26] text-white border border-[#2d3139] shadow-2xl overflow-hidden font-body select-none">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#006400]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#a8d8c4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative border-b border-white/10 bg-white/[0.02] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39bf45] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006400]" />
          </span>
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-white/90">
            {t('dossier_title')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded border border-white/10">
          <Sparkles className="w-3 h-3 text-[#a8d8c4]" />
          <span>CONCEPTUAL DEMONSTRATION</span>
        </div>
      </div>

      {/* Compared Anonymous Records (Report A + Report B) */}
      <div className="relative p-5 space-y-4 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Report A */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 uppercase">
              <span>{t('dossier_source_a')}</span>
              <span className="text-[#a8d8c4]">FAMILY DESK</span>
            </div>
            <div className="text-sm font-semibold text-white">Missing Person Report</div>
            <div className="text-xs text-white/60 font-mono">
              Approx. 28 Yrs • Male • Relative Registry
            </div>
          </div>

          {/* Report B */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 relative overflow-hidden group">
            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 uppercase">
              <span>{t('dossier_source_b')}</span>
              <span className="text-[#a8d8c4]">SHELTER INTAKE</span>
            </div>
            <div className="text-sm font-semibold text-[#a8d8c4]">Rescue Shelter Arrival</div>
            <div className="text-xs text-white/60 font-mono">
              Approx. 27 Yrs • Male • Evacuation Camp
            </div>
          </div>
        </div>

        {/* Convergence Indicator Bar (Conceptual, NO numeric scores) */}
        <div className="p-3.5 rounded-xl bg-[#006400]/15 border border-[#39bf45]/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/80 font-medium flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5 text-[#a8d8c4]" />
              {t('dossier_confidence_label')}
            </span>
            <span className="text-[#a8d8c4] font-bold">
              {t('dossier_confidence_val')}
            </span>
          </div>

          {/* Stylized Signal Convergence Flow */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-[#a8d8c4] h-full rounded-full w-4/5 animate-pulse" />
          </div>
          <div className="text-[11px] text-white/60 flex items-center justify-between font-mono pt-0.5">
            <span>Deterministic Attribute Alignment</span>
            <span className="text-[#a8d8c4] font-semibold">Candidate Flagged</span>
          </div>
        </div>
      </div>

      {/* Aligned Evidence Signals List */}
      <div className="relative divide-y divide-white/5 text-xs">
        {signals.map((item, idx) => (
          <div
            key={idx}
            className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
          >
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-white block truncate">{item.label}</span>
              <span className="text-[11px] text-white/60 truncate block">{item.detail}</span>
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
      <div className="relative p-4 bg-white/[0.04] border-t border-white/10 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#a8d8c4]/15 border border-[#a8d8c4]/30 flex items-center justify-center text-[#a8d8c4] shrink-0 mt-0.5">
          <UserCheck className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <span>Human Verification Required</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/70">
              MANDATORY
            </span>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            Automated algorithms never confirm reunions alone. An authorized disaster reviewer audits physical evidence and photo verification before family contact.
          </p>
        </div>
      </div>
    </div>
  );
};
