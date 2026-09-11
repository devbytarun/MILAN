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
    <div className="relative rounded-2xl bg-white text-slate-900 border border-orange-200/90 shadow-card overflow-hidden font-sans select-none">
      {/* Subtle Background Ambience */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative border-b border-orange-100 bg-orange-50/40 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
              Signal Extraction & Normalization
            </h3>
            <span className="text-[11px] text-slate-500 block">
              Converting unstructured voice, handwritten notes, and field reports into identity signals
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-orange-800 bg-orange-100/70 border border-orange-200 px-2.5 py-1 rounded">
          <Sparkles className="w-3 h-3 text-orange-600" />
          <span>ZERO DATA LOSS</span>
        </div>
      </div>

      {/* Main Split Transformation Grid */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-orange-100">
        {/* Left: Unstructured Field Signal */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <Volume2 className="w-3.5 h-3.5 text-orange-600" />
              {t('trans_raw_title')}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
              FIELD INPUT
            </span>
          </div>

          {/* Soundwave Simulation Graphic */}
          <div className="p-4 rounded-xl bg-orange-50/30 border border-orange-100 space-y-3">
            <div className="flex items-center gap-1 h-6 justify-center text-orange-500">
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

            <div className="text-xs text-slate-800 leading-relaxed font-sans italic border-t border-orange-100 pt-3">
              "Rescue team intake report: Adult male survivor located near riverine evacuation zone. Approximate age 28 years. Wearing blue denim jacket and dark trousers. Distinct scar observed near left eyebrow. Survivor is in shock and unable to communicate home details."
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-orange-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Multi-Dialect NLP & Phonetic Parsing</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field personnel operate in noisy, torrential conditions. MILAN automatically parses free-form Hindi, Hinglish, Bengali, Tamil, and 20 other regional languages into uniform attribute vectors.
            </p>
          </div>
        </div>

        {/* Right: Normalized Structured Evidence Clues */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-900 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              {t('trans_table_title')}
            </span>
            <span className="text-[10px] font-bold text-orange-800 bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded">
              STANDARDIZED CLUES
            </span>
          </div>

          {/* Structured Clues Table */}
          <div className="border border-orange-100 rounded-xl overflow-hidden divide-y divide-orange-100/60 text-xs">
            <div className="grid grid-cols-12 p-3 bg-orange-50/40 font-mono text-slate-500 text-[11px]">
              <div className="col-span-4">{t('trans_col_attr')}</div>
              <div className="col-span-8">{t('trans_col_extracted')}</div>
            </div>

            {structuredClues.map((clue, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-3 items-center gap-2 transition-colors ${
                  clue.isHighlight ? 'bg-orange-50/80 border-l-2 border-orange-500' : 'hover:bg-orange-50/20'
                }`}
              >
                <div className="col-span-4 font-mono text-slate-600 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>{clue.category}</span>
                </div>
                <div className="col-span-8 flex items-center justify-between gap-2">
                  <span
                    className={`font-semibold ${
                      clue.isHighlight ? 'text-slate-900 font-bold' : 'text-slate-900'
                    }`}
                  >
                    {clue.extracted}
                  </span>
                  <span className="font-mono text-[9px] text-orange-800 bg-orange-100/60 border border-orange-200 px-1.5 py-0.5 rounded shrink-0">
                    {clue.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Deterministic Attribute Weighting</span>
            <span className="text-orange-600 font-semibold flex items-center gap-1">
              Ready for Cross-Matching <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
