import React, { useState } from 'react';
import type { MatchResult } from '../../types/index.ts';
import type { FullCaseData } from '../../services/caseService.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

interface SideBySideCompareProps {
  matchResult: MatchResult;
  sourceCase: FullCaseData;
  candidateCase: FullCaseData;
  onClose: () => void;
  onConfirmAction: (action: 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED', reason: string) => void;
}

export const SideBySideCompare: React.FC<SideBySideCompareProps> = ({
  matchResult,
  sourceCase,
  candidateCase,
  onClose,
  onConfirmAction,
}) => {
  const [selectedAction, setSelectedAction] = useState<'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED'>('VERIFIED');
  const [reason, setReason] = useState(
    'Strong multi-attribute alignment on distinct forearm scar, sacred thread charm, and red polo shirt. Confirmed match.'
  );

  const rows = [
    {
      label: 'Subject Name',
      source: sourceCase.attributes.full_name || 'Not provided',
      candidate: candidateCase.attributes.full_name || 'Unidentified',
    },
    {
      label: 'Age / Approx Age',
      source: `${sourceCase.attributes.age || 'Unknown'} yrs`,
      candidate: `~${candidateCase.attributes.approximate_age || candidateCase.attributes.age || 'Unknown'} yrs`,
    },
    {
      label: 'Gender',
      source: sourceCase.attributes.gender || 'Unknown',
      candidate: candidateCase.attributes.gender || 'Unknown',
    },
    {
      label: 'Blood Group',
      source: sourceCase.attributes.blood_group || 'Unknown',
      candidate: candidateCase.attributes.blood_group || 'Unknown',
    },
    {
      label: 'Build & Appearance',
      source: `${sourceCase.attributes.build || '—'}, Hair: ${sourceCase.attributes.hair_colour || '—'}`,
      candidate: `${candidateCase.attributes.build || '—'}, Hair: ${candidateCase.attributes.hair_colour || '—'}`,
    },
    {
      label: 'Physical Marks & Scars',
      source: sourceCase.attributes.scars || sourceCase.attributes.birthmarks || 'None noted',
      candidate: candidateCase.attributes.scars || candidateCase.attributes.birthmarks || 'None noted',
    },
    {
      label: 'Clothing Observed',
      source: sourceCase.attributes.clothing || 'None noted',
      candidate: candidateCase.attributes.clothing || 'None noted',
    },
    {
      label: 'Accessories / Items',
      source: sourceCase.attributes.accessories || 'None noted',
      candidate: candidateCase.attributes.accessories || 'None noted',
    },
    {
      label: 'Location / Landmark',
      source: sourceCase.report.found_location || 'Not specified',
      candidate: candidateCase.report.found_location || 'Not specified',
    },
    {
      label: 'Primary Distinguishing Clue',
      source: sourceCase.attributes.identifying_clue || 'None',
      candidate: candidateCase.attributes.identifying_clue || 'None',
      highlight: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-modal bg-canvas-night/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-canvas-light border border-hairline-light rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-elevation-4 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-canvas-night text-on-dark flex items-center justify-between border-b border-hairline-dark">
          <div>
            <div className="flex items-center gap-2 text-xs text-aloe font-mono font-bold">
              <span>{sourceCase.case.case_uid} (Missing)</span>
              <span>↔</span>
              <span>{candidateCase.case.case_uid} (Found)</span>
            </div>
            <h2 className="type-heading-lg text-on-dark mt-1">
              Side-by-Side Verification Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-shade-40 hover:text-on-dark rounded-pill hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Match Score Banner */}
          <div className="p-5 bg-canvas-cream border border-hairline-light rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-ink uppercase tracking-wide">
                Algorithmic Confidence Assessment
              </div>
              <p className="type-caption text-shade-60 mt-1">
                {matchResult.explanation}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge
                variant={matchResult.confidenceTier === 'HIGH' ? 'verified' : matchResult.confidenceTier === 'MEDIUM' ? 'pending' : 'shade'}
                size="sm"
              >
                {matchResult.confidenceTier} CONFIDENCE
              </Badge>
              <div className="text-right">
                <div className="type-heading-xl font-bold text-ink">
                  {matchResult.score}%
                </div>
                <div className="text-[10px] uppercase font-semibold text-shade-40">Confidence Score</div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border border-hairline-light rounded-md overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-canvas-cream text-shade-70 font-semibold border-b border-hairline-light">
                <tr>
                  <th className="p-3.5 w-1/4">Attribute</th>
                  <th className="p-3.5 w-[37.5%] border-l border-r border-hairline-light bg-aloe/15 text-ink font-bold">
                    Family Missing Report ({sourceCase.case.case_uid})
                  </th>
                  <th className="p-3.5 w-[37.5%] bg-canvas-cream text-ink font-bold">
                    Rescue Intake Report ({candidateCase.case.case_uid})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-light">
                {rows.map((r) => (
                  <tr
                    key={r.label}
                    className={r.highlight ? 'bg-aloe/10 font-medium' : 'hover:bg-canvas-cream/60 transition-colors'}
                  >
                    <td className="p-3.5 font-bold text-ink">
                      {r.label}
                      {r.highlight && (
                        <span className="block text-[10px] text-shade-50 font-semibold">
                          ★ High Weight Factor
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-ink border-l border-r border-hairline-light">
                      {r.source}
                    </td>
                    <td className="p-3.5 text-ink">
                      {r.candidate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reviewer Action Box */}
          <div className="bg-canvas-cream border border-hairline-light rounded-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-ink" />
              Coordinator Verification Decision
            </h3>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedAction('VERIFIED')}
                className={`p-3.5 rounded-md border text-left transition-all duration-150 flex items-center justify-between ${
                  selectedAction === 'VERIFIED'
                    ? 'bg-aloe text-ink border-aloe/80 shadow-sm font-semibold'
                    : 'bg-canvas-light hover:bg-canvas-cream border-hairline-light text-shade-70'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">VERIFY MATCH</div>
                  <div className="text-[10px] text-shade-50">
                    Confirmed positive reunion
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('REJECTED')}
                className={`p-3.5 rounded-md border text-left transition-all duration-150 flex items-center justify-between ${
                  selectedAction === 'REJECTED'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-sm font-semibold'
                    : 'bg-canvas-light hover:bg-canvas-cream border-hairline-light text-shade-70'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">REJECT MATCH</div>
                  <div className="text-[10px] text-shade-50">
                    False positive candidate
                  </div>
                </div>
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('MORE_INFO_NEEDED')}
                className={`p-3.5 rounded-md border text-left transition-all duration-150 flex items-center justify-between ${
                  selectedAction === 'MORE_INFO_NEEDED'
                    ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a] shadow-sm font-semibold'
                    : 'bg-canvas-light hover:bg-canvas-cream border-hairline-light text-shade-70'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">REQUEST MORE INFO</div>
                  <div className="text-[10px] text-shade-50">
                    Require shelter photo/call
                  </div>
                </div>
                <HelpCircle className="w-4 h-4 text-[#92400e] shrink-0" />
              </button>
            </div>

            {/* Audit Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-shade-70 uppercase tracking-wider">
                Mandatory Reviewer Audit Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the evidentiary justification for this verification decision..."
                className="w-full px-3.5 py-2.5 text-xs font-normal text-ink border border-hairline-light rounded-md outline-none focus:border-ink bg-canvas-light"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-canvas-cream border-t border-hairline-light flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline-light"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="aloe"
            size="sm"
            onClick={() => onConfirmAction(selectedAction, reason)}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Record Decision in Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
};
