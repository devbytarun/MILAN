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

interface CandidatePair {
  sourceCase: FullCaseData;
  candidateCase: FullCaseData;
  matchResult: MatchResult;
}

export const ReviewPage: React.FC = () => {
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
    loadAndScorePairs();
  }, []);

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
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Badge variant="mint" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
              Human Verification Audit
            </Badge>
            <span className="text-xs text-[#9297a0] font-medium font-mono">
              Deterministic Matching Engine v1.0
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-normal text-[#181d26] mt-2">
            Match Verification Queue
          </h1>
          <p className="text-sm text-[#41454d] mt-1">
            Audit ranked candidate pairs, inspect conflicting attributes, and verify positive reunions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#f8fafc] p-1.5 rounded-xl border border-[#dddddd] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial ${
              activeTab === 'PENDING'
                ? 'bg-[#181d26] text-white font-semibold shadow-sm'
                : 'text-[#41454d] hover:text-[#181d26]'
            }`}
          >
            Pending Review ({pairs.filter((p) => p.sourceCase.case.status !== 'VERIFIED_MATCH').length})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-1 sm:flex-initial ${
              activeTab === 'VERIFIED'
                ? 'bg-[#0a2e0e] text-white font-semibold shadow-sm'
                : 'text-[#41454d] hover:text-[#181d26]'
            }`}
          >
            Verified Reunions ({pairs.filter((p) => p.sourceCase.case.status === 'VERIFIED_MATCH').length})
          </button>
        </div>
      </div>

      {/* Live Notification Banner */}
      {notification && (
        <div className="p-4 bg-[#a8d8c4]/30 border border-[#a8d8c4] rounded-lg text-xs text-[#006400] flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#006400]" />
            {notification}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[#006400] hover:text-[#0a2e0e] font-bold px-2 py-1"
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
        <div className="bg-white border border-[#dddddd] rounded-xl p-16 text-center space-y-3 shadow-elevation-1">
          <div className="w-12 h-12 rounded-full bg-[#f8fafc] text-[#9297a0] flex items-center justify-center mx-auto border border-[#dddddd]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-normal text-[#181d26]">No Candidate Pairs in this Queue</h3>
          <p className="text-xs text-[#41454d] max-w-sm mx-auto">
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
