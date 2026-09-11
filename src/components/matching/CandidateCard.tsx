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
    <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1 space-y-6">
      {/* Top Bar: UID, Score & Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dddddd] pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-[#181d26] bg-[#f8fafc] px-2.5 py-1 rounded border border-[#dddddd]">
              PAIR #{sourceCase.case.case_uid} ↔ {candidateCase.case.case_uid}
            </span>
            <Badge
              variant={matchResult.confidenceTier === 'HIGH' ? 'mint' : matchResult.confidenceTier === 'MEDIUM' ? 'pending' : 'shade'}
              size="sm"
            >
              {matchResult.confidenceTier} CONFIDENCE
            </Badge>
          </div>
          <p className="type-caption text-[#41454d] mt-1.5">
            Reconciling missing person report with field rescue admission
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="type-heading-xl font-bold text-[#181d26] leading-none">
              {matchResult.score}%
            </div>
            <div className="text-[10px] uppercase font-semibold text-[#9297a0] tracking-wider">Match Score</div>
          </div>
          <div className="w-16 bg-[#e0e2e6] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                matchResult.confidenceTier === 'HIGH'
                  ? 'bg-[#006400]'
                  : matchResult.confidenceTier === 'MEDIUM'
                  ? 'bg-[#181d26]'
                  : 'bg-[#9297a0]'
              }`}
              style={{ width: `${matchResult.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Mini Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Case (Missing) */}
        <div className="bg-[#f8fafc] border border-[#dddddd] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="shade" size="sm">Reported Missing</Badge>
            <span className="font-mono text-xs font-semibold text-[#181d26]">
              {sourceCase.case.case_uid}
            </span>
          </div>
          <div className="font-semibold text-[#181d26] text-sm flex items-center gap-1.5 pt-1">
            <User className="w-4 h-4 text-[#9297a0]" />
            {sourceCase.attributes.full_name || 'Name Unknown'}
          </div>
          <div className="type-caption text-[#41454d] space-y-1">
            <div>
              Age: <strong className="text-[#181d26]">{sourceCase.attributes.age || 'Unknown'} yrs</strong> • Blood: <strong className="text-[#181d26]">{sourceCase.attributes.blood_group || 'Unknown'}</strong>
            </div>
            <div className="flex items-start gap-1 text-xs text-[#9297a0]">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9297a0]" />
              <span className="truncate">{sourceCase.report.found_location || 'Last location not noted'}</span>
            </div>
            <div className="text-xs text-[#41454d] truncate">
              Clue: <span className="text-[#181d26] font-medium">{sourceCase.attributes.identifying_clue || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Candidate Case (Found) */}
        <div className="bg-[#f8fafc] border border-[#dddddd] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="mint" size="sm">Found / Rescued</Badge>
            <span className="font-mono text-xs font-semibold text-[#181d26]">
              {candidateCase.case.case_uid}
            </span>
          </div>
          <div className="font-semibold text-[#181d26] text-sm flex items-center gap-1.5 pt-1">
            <User className="w-4 h-4 text-[#9297a0]" />
            {candidateCase.attributes.full_name || 'Unidentified'}
          </div>
          <div className="type-caption text-[#41454d] space-y-1">
            <div>
              Age: <strong className="text-[#181d26]">~{candidateCase.attributes.approximate_age || 'Unknown'} yrs</strong> • Blood: <strong className="text-[#181d26]">{candidateCase.attributes.blood_group || 'Unknown'}</strong>
            </div>
            <div className="flex items-start gap-1 text-xs text-[#9297a0]">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#9297a0]" />
              <span className="truncate">{candidateCase.report.found_location || 'Shelter location'}</span>
            </div>
            <div className="text-xs text-[#41454d] truncate">
              Clue: <span className="text-[#181d26] font-medium">{candidateCase.attributes.identifying_clue || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithmic Evidence Explanations */}
      <div className="p-4 bg-[#f8fafc] border border-[#dddddd] rounded-lg space-y-2.5">
        <div className="text-xs font-semibold text-[#181d26] flex items-center justify-between">
          <span>Evidence Analysis:</span>
          <span className="text-xs text-[#9297a0] font-normal">
            Data Completeness: {matchResult.dataCompleteness}%
          </span>
        </div>
        <p className="type-caption text-[#41454d] leading-relaxed">
          {matchResult.explanation}
        </p>

        {/* Attribute Breakdown Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {matchResult.matchedFields.map((f) => (
            <span
              key={f.field}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1 border ${
                f.status === 'match'
                  ? 'bg-[#a8d8c4]/30 text-[#006400] border-[#a8d8c4]'
                  : 'bg-[#f8fafc] text-[#181d26] border-[#dddddd]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {f.field.replace('_', ' ')}: {Math.round(f.score * 100)}%
            </span>
          ))}
          {matchResult.conflictingFields.map((f) => (
            <span
              key={f.field}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/30 flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              {f.field.replace('_', ' ')} mismatch
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons using Airtable Button Specs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSelectReview}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="w-full sm:w-auto"
        >
          Compare Side-by-Side
        </Button>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link to={`/dossier/${sourceCase.case.id}/${candidateCase.case.id}`}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Forensic Dossier
            </Button>
          </Link>
          {onReject && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onReject}
              leftIcon={<XCircle className="w-3.5 h-3.5 text-[#aa2d00]" />}
              className="flex-1 sm:flex-initial text-[#aa2d00] hover:bg-[#aa2d00]/10"
            >
              Reject Match
            </Button>
          )}
          {onVerify && (
            <Button
              type="button"
              variant="primary"
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
