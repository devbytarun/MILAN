import React, { useState, useEffect } from 'react';
import { getLocalCases, updateCaseStatus, FullCaseData } from '../services/caseService.ts';
import { scoreCandidate } from '../lib/matching.ts';
import type { CandidateRow, MatchResult } from '../types/index.ts';
import { CandidateCard } from '../components/matching/CandidateCard.tsx';
import { SideBySideCompare } from '../components/matching/SideBySideCompare.tsx';
import {
  CheckCircle2,
  Inbox,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { hasPermission } from '../lib/permissions.ts';
import { AccessDenied } from './AccessDenied.tsx';

interface CandidatePair {
  sourceCase: FullCaseData;
  candidateCase: FullCaseData;
  matchResult: MatchResult;
}

export const ReviewPage: React.FC = () => {
  const { profile } = useAuth();
  const [pairs, setPairs] = useState<CandidatePair[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED'>('PENDING');
  const [selectedPair, setSelectedPair] = useState<CandidatePair | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load and score candidate pairs
  const loadAndScorePairs = () => {
    const allCases = getLocalCases();
    const missingCases = allCases.filter((c) => c.case.case_type === 'MISSING');
    const foundCases = allCases.filter((c) => c.case.case_type === 'FOUND');

    const generatedPairs: CandidatePair[] = [];

    missingCases.forEach((missing) => {
      foundCases.forEach((found) => {
        const candidateRow: CandidateRow = {
          report_id: found.report.id,
          case_id: found.case.id,
          case_uid: found.case.case_uid,
          case_type: found.case.case_type,
          found_location: found.report.found_location,
          full_name: found.attributes.full_name,
          alternative_names: found.attributes.alternative_names,
          age: found.attributes.age,
          approximate_age: found.attributes.approximate_age,
          gender: found.attributes.gender,
          blood_group: found.attributes.blood_group,
          height_cm: found.attributes.height_cm,
          weight_kg: found.attributes.weight_kg,
          build: found.attributes.build,
          hair_description: found.attributes.hair_description,
          hair_colour: found.attributes.hair_colour,
          eye_colour: found.attributes.eye_colour,
          skin_description: found.attributes.skin_description,
          birthmarks: found.attributes.birthmarks,
          scars: found.attributes.scars,
          tattoos: found.attributes.tattoos,
          anatomical_features: found.attributes.anatomical_features,
          clothing: found.attributes.clothing,
          footwear: found.attributes.footwear,
          accessories: found.attributes.accessories,
          belongings: found.attributes.belongings,
          identifying_clue: found.attributes.identifying_clue,
          condition_status: found.attributes.condition_status,
        };

        const result = scoreCandidate(missing.attributes, candidateRow, missing.report.found_location);

        if (result.score >= 25) {
          generatedPairs.push({
            sourceCase: missing,
            candidateCase: found,
            matchResult: result,
          });
        }
      });
    });

    generatedPairs.sort((a, b) => b.matchResult.score - a.matchResult.score);
    setPairs(generatedPairs);
  };

  useEffect(() => {
    if (hasPermission(profile?.role, 'REVIEW_MATCH')) {
      loadAndScorePairs();
    }
  }, [profile?.role]);

  if (!hasPermission(profile?.role, 'REVIEW_MATCH')) {
    return (
      <AccessDenied
        moduleName="Candidate Review Queue"
        reason="Only authorized verification officers and administrators can access the candidate review queue."
      />
    );
  }

  const handleDecision = (
    pair: CandidatePair,
    action: 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED',
    _reason: string
  ) => {
    if (action === 'VERIFIED') {
      updateCaseStatus(pair.sourceCase.case.id, 'VERIFIED_MATCH');
      updateCaseStatus(pair.candidateCase.case.id, 'VERIFIED_MATCH');
      setNotification(
        `Case pair verified! ${pair.sourceCase.case.case_uid} and ${pair.candidateCase.case.case_uid} are now linked.`
      );
    } else if (action === 'REJECTED') {
      updateCaseStatus(pair.sourceCase.case.id, 'SEARCHING');
      setNotification(`Candidate match rejected. Search continues for ${pair.sourceCase.case.case_uid}.`);
    } else {
      updateCaseStatus(pair.sourceCase.case.id, 'MORE_INFO_NEEDED');
      setNotification(`Clarification requested for ${pair.sourceCase.case.case_uid}.`);
    }

    setSelectedPair(null);
    loadAndScorePairs();
    setTimeout(() => setNotification(null), 6000);
  };

  const filteredPairs = pairs.filter((p) => {
    const isVerified =
      p.sourceCase.case.status === 'VERIFIED_MATCH' ||
      p.candidateCase.case.status === 'VERIFIED_MATCH';
    return activeTab === 'VERIFIED' ? isVerified : !isVerified;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Badge variant="verified" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
              Human Verification Audit
            </Badge>
            <span className="text-xs text-slate-400 font-medium font-mono">
              Deterministic Matching Engine v1.0
            </span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Match Verification Queue
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Audit ranked candidate pairs, inspect conflicting attributes, and verify positive reunions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial ${
              activeTab === 'PENDING'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review ({pairs.filter((p) => p.sourceCase.case.status !== 'VERIFIED_MATCH').length})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Reunions ({pairs.filter((p) => p.sourceCase.case.status === 'VERIFIED_MATCH').length})
          </button>
        </div>
      </div>

      {/* Live Notification Banner */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {notification}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Candidate Cards Grid */}
      {filteredPairs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredPairs.map((pair) => (
            <CandidateCard
              key={`${pair.sourceCase.case.id}-${pair.candidateCase.case.id}`}
              matchResult={pair.matchResult}
              sourceCase={pair.sourceCase}
              candidateCase={pair.candidateCase}
              onSelectReview={() => setSelectedPair(pair)}
              onVerify={
                pair.sourceCase.case.status !== 'VERIFIED_MATCH'
                  ? () =>
                      handleDecision(
                        pair,
                        'VERIFIED',
                        'Verified positive match based on multi-attribute physical scar and clothing evidence.'
                      )
                  : undefined
              }
              onReject={
                pair.sourceCase.case.status !== 'VERIFIED_MATCH'
                  ? () =>
                      handleDecision(
                        pair,
                        'REJECTED',
                        'Reviewer determined contradictory features.'
                      )
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-slate-900">No Candidate Pairs in this Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All candidates in this category have been processed, or no pairs exceed the 25% coarse similarity threshold.
          </p>
        </div>
      )}

      {/* Side by Side Modal */}
      {selectedPair && (
        <SideBySideCompare
          matchResult={selectedPair.matchResult}
          sourceCase={selectedPair.sourceCase}
          candidateCase={selectedPair.candidateCase}
          onClose={() => setSelectedPair(null)}
          onConfirmAction={(action, reason) => handleDecision(selectedPair, action, reason)}
        />
      )}
    </div>
  );
};
