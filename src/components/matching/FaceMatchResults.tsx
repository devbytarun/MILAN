import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanFace,
  AlertTriangle,
  User,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  SearchX,
  Phone,
  Dna,
  Info,
} from 'lucide-react';
import type { FaceMatchCandidate } from '../../lib/faceSimilarity.ts';
import type { FullCaseData } from '../../services/caseService.ts';
import { Button } from '../ui/Button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { canViewField } from '../../lib/permissions.ts';
import { formatIndianPhoneNumber } from '../../lib/phoneValidation.ts';
import { hasDnaReportSync, canViewDnaReport } from '../../services/dnaReportService.ts';

interface FaceMatchResultsProps {
  candidates: FaceMatchCandidate[];
  allCases: FullCaseData[];
  isSearching: boolean;
  searchError: string | null;
  hasSearched: boolean;
  profileMatchScores?: Record<string, number>; // caseId → profile match score 0–100
}

function getTierStyle(tier: FaceMatchCandidate['tier']) {
  switch (tier) {
    case 'STRONG':
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        bar: 'bg-emerald-500',
        ring: 'ring-emerald-200',
        label: 'Strong Candidate',
      };
    case 'POSSIBLE':
      return {
        badge: 'bg-orange-50 text-orange-800 border-orange-200',
        bar: 'bg-orange-500',
        ring: 'ring-orange-200',
        label: 'Possible Candidate',
      };
    default:
      return {
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        bar: 'bg-slate-400',
        ring: 'ring-slate-200',
        label: 'Low Similarity',
      };
  }
}

function getOverallConfidence(facePct: number, profilePct?: number): { label: string; color: string } {
  const score = profilePct !== undefined ? (facePct + profilePct) / 2 : facePct;
  if (score >= 80) return { label: 'HIGH', color: 'text-emerald-700' };
  if (score >= 65) return { label: 'MEDIUM', color: 'text-orange-700' };
  return { label: 'LOW', color: 'text-slate-600' };
}

export const FaceMatchResults: React.FC<FaceMatchResultsProps> = ({
  candidates,
  allCases,
  isSearching,
  searchError,
  hasSearched,
  profileMatchScores,
}) => {
  const { profile } = useAuth();
  const canViewContact = canViewField(profile?.role, 'contact', false);
  const canViewDna = canViewDnaReport(profile?.role);

  if (isSearching) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Searching missing person database...</p>
          <p className="text-xs text-slate-500 mt-1">
            Comparing face profile against all registered missing person cases
          </p>
        </div>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rose-800">Search Failed</p>
          <p className="text-xs text-rose-700 mt-1">{searchError}</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) return null;

  if (candidates.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
          <SearchX className="w-7 h-7 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">No matching face candidates found.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            No registered missing person cases have a face similarity score above the matching threshold.
            The case has been registered and profile-based matching will continue automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ScanFace className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">Possible Matches</h3>
            <p className="text-xs text-slate-500 mt-0.5">Face similarity analysis — {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-wider">
          AI-Assisted
        </span>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-4">
        {candidates.map((candidate, idx) => {
          const tierStyle = getTierStyle(candidate.tier);
          const caseData = allCases.find((c) => c.case.id === candidate.caseId);
          const profileScore = profileMatchScores?.[candidate.caseId];
          const overall = getOverallConfidence(candidate.similarityPercent, profileScore);
          const hasDna = hasDnaReportSync(candidate.caseId);
          const isMinor = (caseData?.attributes?.age && caseData.attributes.age < 18) ||
                          (caseData?.attributes?.approximate_age && caseData.attributes.approximate_age < 18);

          return (
            <div
              key={candidate.caseId}
              className={`bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-card ring-1 ${tierStyle.ring} space-y-4`}
            >
              {/* Rank + tier badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono">
                    #{idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${tierStyle.badge}`}>
                    {tierStyle.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 leading-none">
                    {candidate.similarityPercent}%
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Face Similarity
                  </div>
                </div>
              </div>

              {/* Similarity bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${tierStyle.bar}`}
                  style={{ width: `${candidate.similarityPercent}%` }}
                />
              </div>

              {/* Person info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    {candidate.personName || 'Name Unknown'}
                  </p>
                  {caseData && (
                    <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                      {caseData.attributes.age || caseData.attributes.approximate_age ? (
                        <div>
                          Age:{' '}
                          <strong className="text-slate-900">
                            {caseData.attributes.age || caseData.attributes.approximate_age} yrs
                          </strong>
                          {caseData.attributes.gender ? (
                            <> · Gender: <strong className="text-slate-900">{caseData.attributes.gender}</strong></>
                          ) : null}
                        </div>
                      ) : null}
                      {caseData.report.found_location && (
                        <div>
                          Last Known Location:{' '}
                          <strong className="text-slate-900">{caseData.report.found_location}</strong>
                        </div>
                      )}
                      <div className="font-mono text-[10px] text-slate-400 pt-0.5">
                        Case UID: {candidate.caseUid || candidate.caseId}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Family Contact for Authorized Responders */}
              {canViewContact && caseData?.case?.family_contact_phone && (
                <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-500 font-medium">Family Contact: </span>
                      <strong className="font-mono text-slate-900">
                        {formatIndianPhoneNumber(caseData.case.family_contact_phone)}
                      </strong>
                    </div>
                  </div>
                  <a
                    href={`tel:${caseData.case.family_contact_phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs"
                  >
                    <Phone className="w-3 h-3" /> Contact Family
                  </a>
                </div>
              )}

              {/* DNA Report Status */}
              <div className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                hasDna ? 'bg-indigo-50/70 border-indigo-200' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2">
                  <Dna className={`w-4 h-4 ${hasDna ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-slate-500 font-medium">DNA Report: </span>
                    <strong className={hasDna ? 'text-indigo-900' : 'text-slate-600'}>
                      {hasDna ? '🧬 DNA REPORT AVAILABLE' : 'Not Available'}
                    </strong>
                  </div>
                </div>
                {hasDna && canViewDna && (
                  <Link
                    to={`/cases/${candidate.caseId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs"
                  >
                    View Report <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Child Safeguard Multi-Signal Notice */}
              {isMinor && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Minor Multi-Modal Identification Protocol:</strong> For children where face features may shift, facial recognition is only ONE signal. Responders must evaluate <strong>Face + Profile details + Physical marks + Location + DNA report (where available) + Human verification</strong>.
                  </div>
                </div>
              )}

              {/* Combined scores if profile match available */}
              {profileScore !== undefined && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-slate-900">{candidate.similarityPercent}%</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Face Similarity</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-slate-900">{profileScore}%</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Profile Match</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className={`text-lg font-bold ${overall.color}`}>{overall.label}</div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Overall</div>
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="pt-1">
                <Link to={`/cases/${candidate.caseId}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="w-full sm:w-auto"
                  >
                    View Full Case File
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="block mb-0.5">Important — Human Verification Required</strong>
          Face similarity is an AI-assisted candidate-ranking signal only. It is <strong>not</strong> proof of identity.
          Final identification requires authorized human review and verification. Do not notify families without
          completing the verification process.
        </div>
      </div>

      {/* Success signal */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        Search complete. Top {candidates.length} candidates shown above threshold.
      </div>
    </div>
  );
};
