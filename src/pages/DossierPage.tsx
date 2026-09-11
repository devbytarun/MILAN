import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLocalCases } from '../services/caseService.ts';
import { scoreCandidate } from '../lib/matching.ts';
import { generateVerificationDossier } from '../lib/dossier.ts';
import type { VerificationDossier, DiscrepancyAlert } from '../lib/dossier.ts';
import type { CandidateRow, FieldComparison } from '../types/index.ts';
import {
  Shield,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Printer,
  Download,
  ArrowLeft,
  Zap,
  Eye,
  TrendingUp,
  Lock,
} from 'lucide-react';

// Animated radial gauge
const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 160 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const color =
    score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{animatedScore}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
      </div>
    </div>
  );
};

// Evidence bar chart row
const EvidenceBar: React.FC<{ field: FieldComparison }> = ({ field }) => {
  const pct = Math.round(field.score * 100);
  const color =
    field.status === 'match' ? 'bg-emerald-500' :
    field.status === 'partial' ? 'bg-amber-500' :
    field.status === 'mismatch' ? 'bg-rose-500' : 'bg-slate-600';
  const textColor =
    field.status === 'match' ? 'text-emerald-400' :
    field.status === 'partial' ? 'text-amber-400' :
    field.status === 'mismatch' ? 'text-rose-400' : 'text-slate-500';
  const StatusIcon =
    field.status === 'match' ? CheckCircle2 :
    field.status === 'partial' ? AlertTriangle :
    field.status === 'mismatch' ? XCircle : HelpCircle;

  return (
    <div className="group hover:bg-slate-800/40 rounded-lg px-3 py-2 transition">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-3.5 h-3.5 ${textColor}`} />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            {field.field.replace(/_/g, ' ')}
          </span>
        </div>
        <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-slate-500 truncate max-w-[45%]" title={field.sourceValue || '—'}>
          Source: {field.sourceValue || '—'}
        </span>
        <span className="text-[10px] text-slate-500 truncate max-w-[45%] text-right" title={field.candidateValue || '—'}>
          Candidate: {field.candidateValue || '—'}
        </span>
      </div>
    </div>
  );
};

// Discrepancy alert card
const AlertCard: React.FC<{ alert: DiscrepancyAlert }> = ({ alert }) => {
  const isCritical = alert.severity === 'CRITICAL_CONFLICT';
  const isGap = alert.severity === 'DATA_GAP';

  return (
    <div
      className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
        isCritical
          ? 'bg-rose-950/40 border-rose-800/50 hover:border-rose-600/60'
          : isGap
          ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/60'
          : 'bg-amber-950/30 border-amber-800/40 hover:border-amber-600/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isCritical ? 'bg-rose-900/60' : isGap ? 'bg-slate-700/60' : 'bg-amber-900/60'
        }`}>
          {isCritical ? (
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          ) : isGap ? (
            <HelpCircle className="w-4 h-4 text-slate-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
              isCritical ? 'bg-rose-900/60 text-rose-300' :
              isGap ? 'bg-slate-700/60 text-slate-400' :
              'bg-amber-900/60 text-amber-300'
            }`}>
              {alert.severity.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] text-slate-500 uppercase">{alert.field}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-200">{alert.title}</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.description}</p>
          {(alert.sourceValue || alert.candidateValue) && (
            <div className="flex items-center gap-4 mt-2">
              {alert.sourceValue && (
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                  Source: <span className="text-slate-300 font-medium">{alert.sourceValue}</span>
                </span>
              )}
              {alert.candidateValue && (
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                  Candidate: <span className="text-slate-300 font-medium">{alert.candidateValue}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DossierPage: React.FC = () => {
  const { sourceId, candidateId } = useParams<{ sourceId: string; candidateId: string }>();
  const [dossier, setDossier] = useState<VerificationDossier | null>(null);
  const [showRawDossier, setShowRawDossier] = useState(false);

  useEffect(() => {
    if (!sourceId || !candidateId) return;

    const allCases = getLocalCases();
    const sourceCase = allCases.find((c) => c.case.id === sourceId);
    const candidateCase = allCases.find((c) => c.case.id === candidateId);

    if (!sourceCase || !candidateCase) return;

    // Build CandidateRow from found case
    const candidateRow: CandidateRow = {
      report_id: candidateCase.report.id,
      case_id: candidateCase.case.id,
      case_uid: candidateCase.case.case_uid,
      case_type: candidateCase.case.case_type,
      found_location: candidateCase.report.found_location,
      full_name: candidateCase.attributes.full_name,
      alternative_names: candidateCase.attributes.alternative_names,
      age: candidateCase.attributes.age,
      approximate_age: candidateCase.attributes.approximate_age,
      gender: candidateCase.attributes.gender,
      blood_group: candidateCase.attributes.blood_group,
      height_cm: candidateCase.attributes.height_cm,
      weight_kg: candidateCase.attributes.weight_kg,
      build: candidateCase.attributes.build,
      hair_description: candidateCase.attributes.hair_description,
      hair_colour: candidateCase.attributes.hair_colour,
      eye_colour: candidateCase.attributes.eye_colour,
      skin_description: candidateCase.attributes.skin_description,
      birthmarks: candidateCase.attributes.birthmarks,
      scars: candidateCase.attributes.scars,
      tattoos: candidateCase.attributes.tattoos,
      anatomical_features: candidateCase.attributes.anatomical_features,
      clothing: candidateCase.attributes.clothing,
      footwear: candidateCase.attributes.footwear,
      accessories: candidateCase.attributes.accessories,
      belongings: candidateCase.attributes.belongings,
      identifying_clue: candidateCase.attributes.identifying_clue,
      condition_status: candidateCase.attributes.condition_status,
    };

    const matchResult = scoreCandidate(sourceCase.attributes, candidateRow, sourceCase.report.found_location);
    const generatedDossier = generateVerificationDossier(
      matchResult,
      sourceCase.case.case_uid || sourceCase.case.id,
      candidateCase.case.case_uid || candidateCase.case.id
    );

    setDossier(generatedDossier);
  }, [sourceId, candidateId]);

  // Also generate a dossier from the demo data if no IDs provided
  useEffect(() => {
    if (sourceId && candidateId) return; // skip if params exist

    const allCases = getLocalCases();
    const missing = allCases.find((c) => c.case.case_type === 'MISSING' && c.case.status === 'POSSIBLE_MATCH');
    const found = allCases.find((c) => c.case.case_type === 'FOUND' && c.case.status === 'POSSIBLE_MATCH');

    if (!missing || !found) return;

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

    const matchResult = scoreCandidate(missing.attributes, candidateRow, missing.report.found_location);
    const generatedDossier = generateVerificationDossier(
      matchResult,
      missing.case.case_uid || missing.case.id,
      found.case.case_uid || found.case.id
    );

    setDossier(generatedDossier);
  }, [sourceId, candidateId]);

  const handlePrint = () => {
    if (!dossier) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;max-width:800px;margin:40px auto;">${dossier.officialDossierText}</pre>`);
    w.document.title = 'MILAN Verification Dossier';
    w.document.close();
    w.print();
  };

  const handleDownload = () => {
    if (!dossier) return;
    const blob = new Blob([dossier.officialDossierText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MILAN_Dossier_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!dossier) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Generating Dossier...</h2>
        <p className="text-sm text-slate-500">Loading case data and computing forensic analysis.</p>
      </div>
    );
  }

  const recColor = dossier.recommendation === 'APPROVE_RECOMMENDED'
    ? { bg: 'bg-emerald-900/40', border: 'border-emerald-700/50', text: 'text-emerald-300', icon: CheckCircle2 }
    : dossier.recommendation === 'REJECT_RECOMMENDED'
    ? { bg: 'bg-rose-900/40', border: 'border-rose-700/50', text: 'text-rose-300', icon: XCircle }
    : { bg: 'bg-amber-900/40', border: 'border-amber-700/50', text: 'text-amber-300', icon: Eye };

  const RecIcon = recColor.icon;

  const criticalCount = dossier.discrepancyAlerts.filter(a => a.severity === 'CRITICAL_CONFLICT').length;
  const benignCount = dossier.discrepancyAlerts.filter(a => a.severity === 'BENIGN_VARIATION').length;
  const gapCount = dossier.discrepancyAlerts.filter(a => a.severity === 'DATA_GAP').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          to="/review"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reviewer
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl border border-slate-800 p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
            Milan Forensic Verification Dossier
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Score Gauge */}
          <div className="shrink-0">
            <ScoreGauge score={dossier.score} />
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</div>
              <div className={`text-xl font-black ${
                dossier.confidenceTier === 'HIGH' ? 'text-emerald-400' :
                dossier.confidenceTier === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {dossier.confidenceTier}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Completeness</div>
              <div className="text-xl font-black text-blue-400">{dossier.dataCompleteness}%</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Evidence Fields</div>
              <div className="text-xl font-black text-slate-200">
                {dossier.evidenceBreakdown.matched.length + dossier.evidenceBreakdown.conflicting.length}
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Alerts</div>
              <div className="text-xl font-black text-slate-200">{dossier.discrepancyAlerts.length}</div>
            </div>
          </div>
        </div>

        {/* Recommendation Badge */}
        <div className={`mt-6 p-4 rounded-xl border ${recColor.bg} ${recColor.border} flex items-center gap-3`}>
          <RecIcon className={`w-6 h-6 ${recColor.text} shrink-0`} />
          <div>
            <div className={`text-sm font-bold ${recColor.text}`}>
              {dossier.recommendation.replace(/_/g, ' ')}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{dossier.summaryRationale}</div>
          </div>
        </div>

        {/* Generated timestamp */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-[10px] text-slate-600">
            Generated: {new Date(dossier.generatedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" /> Download .txt
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Breakdown */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-200">Evidence Breakdown</h2>
          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full ml-auto">
            {dossier.evidenceBreakdown.matched.length} matched · {dossier.evidenceBreakdown.conflicting.length} conflicting · {dossier.evidenceBreakdown.missing.length} missing
          </span>
        </div>

        <div className="space-y-1">
          {[...dossier.evidenceBreakdown.matched, ...dossier.evidenceBreakdown.conflicting]
            .sort((a, b) => b.score - a.score)
            .map((field, idx) => (
              <EvidenceBar key={idx} field={field} />
            ))}
        </div>

        {/* Missing fields */}
        {dossier.evidenceBreakdown.missing.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Unavailable Fields (Weight Redistributed)
            </div>
            <div className="flex flex-wrap gap-2">
              {dossier.evidenceBreakdown.missing.map((f) => (
                <span key={f} className="text-[10px] px-2.5 py-1 bg-slate-800 text-slate-500 rounded-lg border border-slate-700/50">
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Discrepancy Alerts */}
      {dossier.discrepancyAlerts.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-200">Investigation Alerts</h2>
            <div className="flex items-center gap-2 ml-auto">
              {criticalCount > 0 && (
                <span className="text-[10px] font-bold bg-rose-900/60 text-rose-300 px-2 py-0.5 rounded">
                  {criticalCount} CRITICAL
                </span>
              )}
              {benignCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded">
                  {benignCount} BENIGN
                </span>
              )}
              {gapCount > 0 && (
                <span className="text-[10px] font-bold bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded">
                  {gapCount} GAPS
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {dossier.discrepancyAlerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Official Dossier Text */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
        <button
          onClick={() => setShowRawDossier(!showRawDossier)}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition w-full"
        >
          <Lock className="w-4 h-4 text-indigo-400" />
          Official Verification Certificate
          <span className="text-[10px] text-slate-500 ml-auto">
            {showRawDossier ? '▲ Collapse' : '▼ Expand'}
          </span>
        </button>
        {showRawDossier && (
          <pre className="mt-4 p-4 bg-black/40 rounded-xl text-[11px] text-green-400/80 font-mono overflow-auto max-h-[500px] border border-slate-700/40 leading-relaxed whitespace-pre-wrap">
            {dossier.officialDossierText}
          </pre>
        )}
      </div>
    </div>
  );
};
