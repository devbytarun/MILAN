import React, { useState } from 'react';
import type { MatchResult } from '../../types/index.ts';
import type { FullCaseData } from '../../services/caseService.ts';
import { evaluateChildSafeguards } from '../../lib/anti-trafficking.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  FileCheck,
  AlertTriangle,
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
    'Strong multi-attribute alignment on distinct physical scars, clothing clues, and facial identifiers. Confirmed positive match.'
  );
  const [guardianProofVerified, setGuardianProofVerified] = useState(false);

  const isMinor =
    evaluateChildSafeguards(sourceCase.attributes.age, sourceCase.attributes.approximate_age).isMinor ||
    evaluateChildSafeguards(candidateCase.attributes.age, candidateCase.attributes.approximate_age).isMinor;

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
    <div className="fixed inset-0 z-modal bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Airtable dark surface) */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400">
              <span>{sourceCase.case.case_uid} (Missing)</span>
              <span>↔</span>
              <span>{candidateCase.case.case_uid} (Found)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Side-by-Side Verification Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Match Score Banner */}
          <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Algorithmic Confidence Assessment
              </div>
              <p className="text-xs text-slate-600 mt-1">
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
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {matchResult.score}%
                </div>
                <div className="text-[10px] uppercase font-semibold text-slate-400">Confidence Score</div>
              </div>
            </div>
          </div>

          {/* Child Safeguard Banner (if minor detected) */}
          {isMinor && (
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ANTI-TRAFFICKING CHILD SAFEGUARD ENGAGED (MINOR UNDER 18)</span>
              </div>
              <p className="leading-relaxed text-rose-700">
                National SOP mandates that unaccompanied minors cannot be discharged without verified government identification of the claimant guardian and anti-trafficking clearance.
              </p>
              <label className="flex items-center gap-2 font-semibold pt-1 cursor-pointer select-none text-rose-900">
                <input
                  type="checkbox"
                  checked={guardianProofVerified}
                  onChange={(e) => setGuardianProofVerified(e.target.checked)}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>I confirm that valid guardian identity proof and biometric/photo alignment have been audited.</span>
              </label>
            </div>
          )}

          {/* Comparison Table */}
          <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-1/4">Attribute</th>
                  <th className="p-3.5 w-[37.5%] border-l border-r border-slate-200 bg-orange-50/40 text-slate-900 font-bold">
                    Family Missing Report ({sourceCase.case.case_uid})
                  </th>
                  <th className="p-3.5 w-[37.5%] bg-slate-50 text-slate-900 font-bold">
                    Rescue Intake Report ({candidateCase.case.case_uid})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr
                    key={r.label}
                    className={r.highlight ? 'bg-orange-50/30 font-medium' : 'hover:bg-slate-50/60 transition-colors'}
                  >
                    <td className="p-3.5 font-bold text-slate-900">
                      {r.label}
                      {r.highlight && (
                        <span className="block text-[10px] text-orange-600 font-semibold">
                          ★ High Weight Feature
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-800 border-l border-r border-slate-200">
                      {r.source}
                    </td>
                    <td className="p-3.5 text-slate-800">
                      {r.candidate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reviewer Action Box */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-orange-600" />
              Coordinator Verification Decision
            </h3>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedAction('VERIFIED')}
                className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  selectedAction === 'VERIFIED'
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">VERIFY MATCH</div>
                  <div className={`text-[10px] ${selectedAction === 'VERIFIED' ? 'text-white/70' : 'text-slate-400'}`}>
                    Confirmed positive reunion
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('REJECTED')}
                className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  selectedAction === 'REJECTED'
                    ? 'bg-rose-700 text-white border-rose-700 font-semibold shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">REJECT MATCH</div>
                  <div className={`text-[10px] ${selectedAction === 'REJECTED' ? 'text-white/70' : 'text-slate-400'}`}>
                    False positive candidate
                  </div>
                </div>
                <XCircle className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('MORE_INFO_NEEDED')}
                className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${
                  selectedAction === 'MORE_INFO_NEEDED'
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">REQUEST MORE INFO</div>
                  <div className={`text-[10px] ${selectedAction === 'MORE_INFO_NEEDED' ? 'text-white/80' : 'text-slate-400'}`}>
                    Require shelter photo/call
                  </div>
                </div>
                <HelpCircle className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* Audit Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Evidentiary Audit Justification <span className="text-orange-600">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the evidentiary justification for this verification decision..."
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200/90 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="brand"
            size="sm"
            disabled={isMinor && selectedAction === 'VERIFIED' && !guardianProofVerified}
            onClick={() => onConfirmAction(selectedAction, reason)}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            className="shadow-sm"
          >
            Confirm Decision in Audit Log
          </Button>
        </div>
      </div>
    </div>
  );
};
