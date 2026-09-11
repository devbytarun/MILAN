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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-300 font-mono font-bold">
              <span>{sourceCase.case.case_uid} (Missing)</span>
              <span>↔</span>
              <span>{candidateCase.case.case_uid} (Found)</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Side-by-Side Verification Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Scrollable Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Match Score Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Algorithmic Confidence Assessment
              </div>
              <p className="text-xs text-emerald-900 mt-1">
                {matchResult.explanation}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-700">
                  {matchResult.score}%
                </div>
                <div className="text-[10px] font-semibold text-emerald-800">Overall Match</div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-1/4">Attribute</th>
                  <th className="p-3.5 w-[37.5%] bg-emerald-50/70 text-emerald-900 border-l border-r border-slate-200">
                    Family Missing Report ({sourceCase.case.case_uid})
                  </th>
                  <th className="p-3.5 w-[37.5%] bg-blue-50/70 text-blue-900">
                    Rescue Intake Report ({candidateCase.case.case_uid})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr
                    key={r.label}
                    className={r.highlight ? 'bg-amber-50/40 font-medium' : 'hover:bg-slate-50/70 transition'}
                  >
                    <td className="p-3.5 font-bold text-slate-800">
                      {r.label}
                      {r.highlight && (
                        <span className="block text-[10px] text-amber-600 font-semibold">
                          ★ High Weight Factor
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-800 border-l border-r border-slate-200 bg-emerald-50/10">
                      {r.source}
                    </td>
                    <td className="p-3.5 text-slate-800 bg-blue-50/10">
                      {r.candidate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reviewer Action Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Coordinator Verification Decision
            </h3>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAction('VERIFIED')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  selectedAction === 'VERIFIED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">VERIFY MATCH</div>
                  <div className={`text-[10px] ${selectedAction === 'VERIFIED' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Confirmed positive reunion
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('REJECTED')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  selectedAction === 'REJECTED'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">REJECT MATCH</div>
                  <div className={`text-[10px] ${selectedAction === 'REJECTED' ? 'text-rose-100' : 'text-slate-400'}`}>
                    False positive candidate
                  </div>
                </div>
                <XCircle className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('MORE_INFO_NEEDED')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  selectedAction === 'MORE_INFO_NEEDED'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">REQUEST MORE INFO</div>
                  <div className={`text-[10px] ${selectedAction === 'MORE_INFO_NEEDED' ? 'text-amber-100' : 'text-slate-400'}`}>
                    Require shelter photo/call
                  </div>
                </div>
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Reviewer Audit Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the evidentiary justification for this verification decision..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmAction(selectedAction, reason)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <ShieldCheck className="w-4 h-4" />
            Record Decision in Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
