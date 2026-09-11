import React from 'react';
import { Link } from 'react-router-dom';
import type { MatchResult } from '../../types/index.ts';
import type { FullCaseData } from '../../services/caseService.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  MapPin,
  FileText,
} from 'lucide-react';

interface CandidateCardProps {
  matchResult: MatchResult;
  sourceCase: FullCaseData;
  candidateCase: FullCaseData;
  onSelectReview: () => void;
  onVerify?: () => void;
  onReject?: () => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  matchResult,
  sourceCase,
  candidateCase,
  onSelectReview,
  onVerify,
  onReject,
}) => {
  const tierStyles = {
    HIGH: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
    LOW: 'bg-rose-100 text-rose-800 border-rose-300',
  };

  const tierProgress = {
    HIGH: 'bg-emerald-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-rose-500',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-5">
      {/* Top Bar: UID, Score & Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-700">
              PAIR #{sourceCase.case.case_uid} ↔ {candidateCase.case.case_uid}
            </span>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                tierStyles[matchResult.confidenceTier]
              }`}
            >
              {matchResult.confidenceTier} CONFIDENCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconciling missing report with shelter admission
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 leading-none">
              {matchResult.score}%
            </div>
            <div className="text-[10px] font-semibold text-slate-400">Match Score</div>
          </div>
          <div className="w-14 bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${tierProgress[matchResult.confidenceTier]}`}
              style={{ width: `${matchResult.score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Mini Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Case (Missing) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Reported Missing
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {sourceCase.case.case_uid}
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            {sourceCase.attributes.full_name || 'Name Unknown'}
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>
              Age: <strong>{sourceCase.attributes.age || 'Unknown'} yrs</strong> • Blood: <strong>{sourceCase.attributes.blood_group || 'Unknown'}</strong>
            </div>
            <div className="flex items-start gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="truncate">{sourceCase.report.found_location || 'Last location not noted'}</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Clue: <span className="text-slate-700 font-medium">{sourceCase.attributes.identifying_clue || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Candidate Case (Found) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
              Found / Rescued
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {candidateCase.case.case_uid}
            </span>
          </div>
          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            {candidateCase.attributes.full_name || 'Unidentified'}
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>
              Age: <strong>~{candidateCase.attributes.approximate_age || 'Unknown'} yrs</strong> • Blood: <strong>{candidateCase.attributes.blood_group || 'Unknown'}</strong>
            </div>
            <div className="flex items-start gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="truncate">{candidateCase.report.found_location || 'Shelter location'}</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              Clue: <span className="text-slate-700 font-medium">{candidateCase.attributes.identifying_clue || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Evidence Explanations */}
      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
        <div className="text-xs font-semibold text-blue-900 flex items-center justify-between">
          <span>Evidence Analysis:</span>
          <span className="text-[11px] text-blue-700 font-normal">
            Completeness: {matchResult.dataCompleteness}%
          </span>
        </div>
        <p className="text-xs text-blue-800 leading-relaxed">
          {matchResult.explanation}
        </p>

        {/* Attribute Breakdown Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {matchResult.matchedFields.map((f) => (
            <span
              key={f.field}
              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                f.status === 'match'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {f.field.replace('_', ' ')}: {Math.round(f.score * 100)}%
            </span>
          ))}
          {matchResult.conflictingFields.map((f) => (
            <span
              key={f.field}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              {f.field.replace('_', ' ')} mismatch
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onSelectReview}
          className="w-full sm:w-auto px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
        >
          Compare Side-by-Side <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <Link
          to={`/dossier/${sourceCase.case.id}/${candidateCase.case.id}`}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
        >
          <FileText className="w-3.5 h-3.5" /> Forensic Dossier
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-200"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject Match
            </button>
          )}
          {onVerify && (
            <button
              type="button"
              onClick={onVerify}
              className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 transition"
            >
              <ShieldCheck className="w-4 h-4" /> Verify Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
