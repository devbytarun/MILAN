import React from 'react';
import type { MatchResult } from '../../types/index.ts';
import type { FullCaseData } from '../../services/caseService.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  MapPin,
} from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { Badge } from '../ui/Badge.tsx';

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
  return (
    <div className="bg-canvas-light border border-hairline-light rounded-lg p-6 sm:p-8 shadow-elevation-3 space-y-6">
      {/* Top Bar: UID, Score & Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-light pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-ink bg-canvas-cream px-2.5 py-1 rounded border border-hairline-light">
              PAIR #{sourceCase.case.case_uid} ↔ {candidateCase.case.case_uid}
            </span>
            <Badge
              variant={matchResult.confidenceTier === 'HIGH' ? 'verified' : matchResult.confidenceTier === 'MEDIUM' ? 'pending' : 'shade'}
              size="sm"
            >
              {matchResult.confidenceTier} CONFIDENCE
            </Badge>
          </div>
          <p className="type-caption text-shade-50 mt-1.5">
            Reconciling missing report with shelter admission
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="type-heading-xl font-bold text-ink leading-none">
              {matchResult.score}%
            </div>
            <div className="text-[10px] uppercase font-semibold text-shade-40 tracking-wider">Match Score</div>
          </div>
          <div className="w-16 bg-shade-30/40 h-2.5 rounded-pill overflow-hidden">
            <div
              className={`h-full ${
                matchResult.confidenceTier === 'HIGH'
                  ? 'bg-ink'
                  : matchResult.confidenceTier === 'MEDIUM'
                  ? 'bg-shade-70'
                  : 'bg-shade-40'
              }`}
              style={{ width: `${matchResult.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Mini Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Case (Missing) */}
        <div className="bg-canvas-cream border border-hairline-light rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="shade" size="sm">Reported Missing</Badge>
            <span className="font-mono text-xs font-semibold text-shade-70">
              {sourceCase.case.case_uid}
            </span>
          </div>
          <div className="font-semibold text-ink text-sm flex items-center gap-1.5 pt-1">
            <User className="w-4 h-4 text-shade-40" />
            {sourceCase.attributes.full_name || 'Name Unknown'}
          </div>
          <div className="type-caption text-shade-60 space-y-1">
            <div>
              Age: <strong className="text-ink">{sourceCase.attributes.age || 'Unknown'} yrs</strong> • Blood: <strong className="text-ink">{sourceCase.attributes.blood_group || 'Unknown'}</strong>
            </div>
            <div className="flex items-start gap-1 text-xs text-shade-50">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-shade-40" />
              <span className="truncate">{sourceCase.report.found_location || 'Last location not noted'}</span>
            </div>
            <div className="text-xs text-shade-50 truncate">
              Clue: <span className="text-ink font-medium">{sourceCase.attributes.identifying_clue || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Candidate Case (Found) */}
        <div className="bg-canvas-cream border border-hairline-light rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="mint" size="sm">Found / Rescued</Badge>
            <span className="font-mono text-xs font-semibold text-shade-70">
              {candidateCase.case.case_uid}
            </span>
          </div>
          <div className="font-semibold text-ink text-sm flex items-center gap-1.5 pt-1">
            <User className="w-4 h-4 text-shade-40" />
            {candidateCase.attributes.full_name || 'Unidentified'}
          </div>
          <div className="type-caption text-shade-60 space-y-1">
            <div>
              Age: <strong className="text-ink">~{candidateCase.attributes.approximate_age || 'Unknown'} yrs</strong> • Blood: <strong className="text-ink">{candidateCase.attributes.blood_group || 'Unknown'}</strong>
            </div>
            <div className="flex items-start gap-1 text-xs text-shade-50">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-shade-40" />
              <span className="truncate">{candidateCase.report.found_location || 'Shelter location'}</span>
            </div>
            <div className="text-xs text-shade-50 truncate">
              Clue: <span className="text-ink font-medium">{candidateCase.attributes.identifying_clue || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Evidence Explanations */}
      <div className="p-4 bg-canvas-cream border border-hairline-light rounded-md space-y-2.5">
        <div className="text-xs font-semibold text-ink flex items-center justify-between">
          <span>Evidence Analysis:</span>
          <span className="text-xs text-shade-50 font-normal">
            Completeness: {matchResult.dataCompleteness}%
          </span>
        </div>
        <p className="type-caption text-shade-60 leading-relaxed">
          {matchResult.explanation}
        </p>

        {/* Attribute Breakdown Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {matchResult.matchedFields.map((f) => (
            <span
              key={f.field}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill flex items-center gap-1 border ${
                f.status === 'match'
                  ? 'bg-aloe text-ink border-aloe/60'
                  : 'bg-shade-30 text-ink border-shade-40/40'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-ink" />
              {f.field.replace('_', ' ')}: {Math.round(f.score * 100)}%
            </span>
          ))}
          {matchResult.conflictingFields.map((f) => (
            <span
              key={f.field}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-pill bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              {f.field.replace('_', ' ')} mismatch
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons using canonical Pill Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline-light"
          size="sm"
          onClick={onSelectReview}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="w-full sm:w-auto"
        >
          Compare Side-by-Side
        </Button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onReject && (
            <Button
              type="button"
              variant="outline-light"
              size="sm"
              onClick={onReject}
              leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
              className="flex-1 sm:flex-initial text-rose-700 hover:bg-rose-50"
            >
              Reject Match
            </Button>
          )}
          {onVerify && (
            <Button
              type="button"
              variant="aloe"
              size="sm"
              onClick={onVerify}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              className="flex-1 sm:flex-initial"
            >
              Verify Match
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
