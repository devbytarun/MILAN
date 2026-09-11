import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext.tsx';

/**
 * LandingSignalExtraction:
 * A cinematic, public-safe visual demonstrating how MILAN converts noisy,
 * unstructured disaster field inputs into normalized, searchable identity clues.
 * Completely free of operational VHF frequencies, real timestamps, internal UIDs, or patient data.
 */
export const LandingSignalExtraction: React.FC = () => {
  const { t } = useI18n();

  const structuredClues = [
    {
      category: 'Gender',
      extracted: 'Male',
      tag: 'NORMALIZED',
    },
    {
      category: 'Estimated Age',
      extracted: 'Approx. 28 Years (±2 yrs tolerance window)',
      tag: 'TOLERANCE VECTOR',
    },
    {
      category: 'Clothing Recorded',
      extracted: 'Blue denim jacket, dark trousers',
      tag: 'COLOR & FABRIC',
    },
    {
      category: 'Distinctive Mark',
      extracted: 'Facial scar observed near left eyebrow',
      tag: 'HIGH DISCRIMINATION',
    },
    {
      category: 'Evacuation Zone',
      extracted: 'Sector riverine bypass shelter area',
      tag: 'GEOGRAPHIC ZONE',
    },
    {
      category: 'Communication Status',
      extracted: 'Non-Verbal / Shock Disoriented',
      tag: 'VULNERABILITY LOCK',
      isHighlight: true,
    },
  ];

  return (
    <div className="relative rounded-2xl bg-[#181d26] text-white border border-[#2d3139] shadow-2xl overflow-hidden font-body select-none">
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#006400]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a8d8c4]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative border-b border-white/10 bg-white/[0.02] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#a8d8c4]/15 border border-[#a8d8c4]/30 flex items-center justify-center text-[#a8d8c4]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Signal Extraction & Normalization
            </h3>
            <span className="text-[11px] text-white/50 block">
              Converting unstructured voice, handwritten notes, and field reports into identity signals
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#a8d8c4] bg-[#a8d8c4]/10 border border-[#a8d8c4]/20 px-2.5 py-1 rounded">
          <Sparkles className="w-3 h-3" />
          <span>ZERO DATA LOSS</span>
        </div>
      </div>

      {/* Main Split Transformation Grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Left: Unstructured Field Signal */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-white/60">
            <span className="flex items-center gap-1.5 text-white/90 font-semibold">
              <Volume2 className="w-3.5 h-3.5 text-[#a8d8c4]" />
              {t('trans_raw_title')}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
              FIELD INPUT
            </span>
          </div>

          {/* Soundwave Simulation Graphic */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center gap-1 h-6 justify-center text-[#a8d8c4]/70">
              <span className="w-1 h-2 bg-current rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-current rounded-full" />
              <span className="w-1 h-6 bg-current rounded-full animate-pulse" />
              <span className="w-1 h-3 bg-current rounded-full" />
              <span className="w-1 h-5 bg-current rounded-full" />
              <span className="w-1 h-2 bg-current rounded-full animate-pulse" />
              <span className="w-1 h-6 bg-current rounded-full" />
              <span className="w-1 h-4 bg-current rounded-full animate-pulse" />
              <span className="w-1 h-2 bg-current rounded-full" />
              <span className="w-1 h-5 bg-current rounded-full animate-pulse" />
              <span className="w-1 h-3 bg-current rounded-full" />
              <span className="w-1 h-6 bg-current rounded-full" />
              <span className="w-1 h-2 bg-current rounded-full" />
            </div>

            <div className="text-xs text-white/90 leading-relaxed font-body italic border-t border-white/5 pt-3">
              "Rescue team intake report: Adult male survivor located near riverine evacuation zone. Approximate age 28 years. Wearing blue denim jacket and dark trousers. Distinct scar observed near left eyebrow. Survivor is in shock and unable to communicate home details."
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#a8d8c4] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Dialect NLP & Phonetic Parsing</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Field personnel operate in noisy, torrential conditions. MILAN automatically parses free-form Hindi, Hinglish, Bengali, Tamil, and 20 other regional languages into uniform attribute vectors.
            </p>
          </div>
        </div>

        {/* Right: Normalized Structured Evidence Clues */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/90 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#a8d8c4]" />
              {t('trans_table_title')}
            </span>
            <span className="text-[10px] font-bold text-[#a8d8c4] bg-[#a8d8c4]/10 border border-[#a8d8c4]/20 px-2 py-0.5 rounded">
              STANDARDIZED CLUES
            </span>
          </div>

          {/* Structured Clues Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10 text-xs">
            <div className="grid grid-cols-12 p-3 bg-white/[0.04] font-mono text-white/50 text-[11px]">
              <div className="col-span-4">{t('trans_col_attr')}</div>
              <div className="col-span-8">{t('trans_col_extracted')}</div>
            </div>

            {structuredClues.map((clue, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-3 items-center gap-2 transition-colors ${
                  clue.isHighlight ? 'bg-[#f5e9d4]/10' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="col-span-4 font-mono text-white/60 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a8d8c4]" />
                  <span>{clue.category}</span>
                </div>
                <div className="col-span-8 flex items-center justify-between gap-2">
                  <span
                    className={`font-semibold ${
                      clue.isHighlight ? 'text-[#f5e9d4]' : 'text-white'
                    }`}
                  >
                    {clue.extracted}
                  </span>
                  <span className="font-mono text-[9px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded shrink-0">
                    {clue.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-white/50">
            <span>Deterministic Attribute Weighting</span>
            <span className="text-[#a8d8c4] flex items-center gap-1">
              Ready for Cross-Matching <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
