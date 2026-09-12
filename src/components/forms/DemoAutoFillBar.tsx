import React, { useState } from 'react';
import { Sparkles, Zap, FastForward, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { DEMO_PRESETS, DemoPresetKey } from '../../data/demoPresets.ts';

interface DemoAutoFillBarProps {
  onFill: (key: DemoPresetKey) => void;
  onFillAndFastForward?: (key: DemoPresetKey) => void;
  formType: 'family' | 'found' | 'hospital' | 'voice';
  currentStep?: number;
  totalSteps?: number;
}

export const DemoAutoFillBar: React.FC<DemoAutoFillBarProps> = ({
  onFill,
  onFillAndFastForward,
  formType,
  currentStep = 0,
  totalSteps = 5,
}) => {
  const [selectedKey, setSelectedKey] = useState<DemoPresetKey>('aarav_child');
  const [filledFeedback, setFilledFeedback] = useState<string | null>(null);

  const activePreset = DEMO_PRESETS[selectedKey];

  const handleApply = (fastForward = false) => {
    if (fastForward && onFillAndFastForward) {
      onFillAndFastForward(selectedKey);
    } else {
      onFill(selectedKey);
    }

    setFilledFeedback(`Loaded: ${activePreset.shortName}`);
    setTimeout(() => {
      setFilledFeedback(null);
    }, 4000);
  };

  const formTypeLabels: Record<string, string> = {
    family: 'Missing Person Report',
    found: 'Rescued Survivor Intake',
    hospital: 'Trauma Ward Registry',
    voice: 'Voice / Radio AI Parser',
  };

  return (
    <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-orange-50/90 border border-orange-200/90 rounded-2xl p-4 shadow-sm space-y-3 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator & Preset Selector */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pitch Presentation Demo Mode
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-200">
                {formTypeLabels[formType] || 'Intake Form'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Instantly populate all required fields with coordinated disaster case details for live judging.
            </p>
          </div>
        </div>

        {/* Preset Selector Dropdown */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value as DemoPresetKey)}
            className="w-full sm:w-auto h-9 px-3 text-xs font-semibold text-slate-800 bg-white border border-orange-300 rounded-xl shadow-xs outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="aarav_child">⚡ Aarav Sharma (Child, 6) — Alaknanda Flood</option>
            <option value="veer_adult">⚡ Veer Kumar (Adult, 24) — Bhimtal Landslide</option>
          </select>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-orange-200/70">
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          {filledFeedback ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {filledFeedback} (Ready to proceed)
            </span>
          ) : (
            <span className="text-slate-500">
              Scenario: <strong className="text-slate-800">{activePreset.description}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={() => handleApply(false)}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="flex-1 sm:flex-initial shadow-sm whitespace-nowrap"
          >
            ⚡ Auto-Fill Demo Details
          </Button>

          {onFillAndFastForward && currentStep < totalSteps - 1 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleApply(true)}
              leftIcon={<FastForward className="w-3.5 h-3.5 text-orange-600" />}
              className="flex-1 sm:flex-initial whitespace-nowrap"
              title="Auto-fills all fields and skips directly to final review step"
            >
              Fill & Skip to Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
