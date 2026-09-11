import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLocalCases } from '../services/caseService.ts';
import { scoreCandidate } from '../lib/matching.ts';
import { generateVerificationDossier } from '../lib/dossier.ts';
import type { VerificationDossier, DiscrepancyAlert } from '../lib/dossier.ts';
import type { CandidateRow, FieldComparison } from '../types/index.ts';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Printer,
  Download,
  ArrowLeft,
  Clock,
  TrendingUp,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { hasPermission } from '../lib/permissions.ts';
import { AccessDenied } from './AccessDenied.tsx';

// Clean radial score gauge for Airtable / Editorial design
const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 140 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 18) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const color =
    score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="7"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{animatedScore}</span>
        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
};

// Evidence bar chart row in clean editorial styling
const EvidenceBar: React.FC<{ field: FieldComparison }> = ({ field }) => {
  const pct = Math.round(field.score * 100);
  const barColor =
    field.status === 'match' ? 'bg-emerald-600' :
    field.status === 'partial' ? 'bg-amber-500' :
    field.status === 'mismatch' ? 'bg-rose-600' : 'bg-slate-400';
  const textColor =
    field.status === 'match' ? 'text-emerald-700' :
    field.status === 'partial' ? 'text-amber-700' :
    field.status === 'mismatch' ? 'text-rose-700' : 'text-slate-500';
  const StatusIcon =
    field.status === 'match' ? CheckCircle2 :
    field.status === 'partial' ? AlertTriangle :
    field.status === 'mismatch' ? XCircle : HelpCircle;

  return (
    <div className="p-3.5 hover:bg-slate-50/80 rounded-xl transition-colors border-b border-slate-100 last:border-b-0 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-3.5 h-3.5 ${textColor} shrink-0`} />
          <span className="font-mono text-xs font-semibold text-slate-800 uppercase tracking-wide">
            {field.field.replace(/_/g, ' ')}
          </span>
        </div>
        <span className={`font-mono text-xs font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {(field.sourceValue || field.candidateValue) && (
        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
          <span className="truncate max-w-[48%]">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Source:</span> {field.sourceValue || '—'}
          </span>
          <span className="truncate max-w-[48%] text-right">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Candidate:</span> {field.candidateValue || '—'}
          </span>
        </div>
      )}
    </div>
  );
};

// Discrepancy alert card in clean editorial styling
const AlertCard: React.FC<{ alert: DiscrepancyAlert }> = ({ alert }) => {
  const isCritical = alert.severity === 'CRITICAL_CONFLICT';
  const isGap = alert.severity === 'DATA_GAP';

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        isCritical
          ? 'bg-rose-50/70 border-rose-200'
          : isGap
          ? 'bg-slate-50/80 border-slate-200/90'
          : 'bg-amber-50/70 border-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isCritical ? 'bg-rose-100 text-rose-700' : isGap ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isCritical ? (
            <AlertOctagon className="w-4 h-4" />
          ) : isGap ? (
            <HelpCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isCritical ? 'bg-rose-100 text-rose-800' :
              isGap ? 'bg-slate-200 text-slate-700' :
              'bg-amber-100 text-amber-800'
            }`}>
              {alert.severity.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">{alert.field}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900">{alert.title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.description}</p>
          {(alert.sourceValue || alert.candidateValue) && (
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              {alert.sourceValue && (
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 shadow-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Source:</span>{' '}
                  <strong className="text-slate-900 font-medium">{alert.sourceValue}</strong>
                </span>
              )}
              {alert.candidateValue && (
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 shadow-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Candidate:</span>{' '}
                  <strong className="text-slate-900 font-medium">{alert.candidateValue}</strong>
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
  const { profile } = useAuth();
  const [dossier, setDossier] = useState<VerificationDossier | null>(null);
  const [showRawDossier, setShowRawDossier] = useState(false);

  if (!hasPermission(profile?.role, 'VIEW_FORENSIC_DOSSIER')) {
    return (
      <AccessDenied
        moduleName="Forensic Verification Dossier"
        reason="Forensic similarity dossiers and algorithmic matrices are strictly restricted to humanitarian verification reviewers and system administrators."
      />
    );
  }

  useEffect(() => {
    if (!sourceId || !candidateId) return;

    const allCases = getLocalCases();
    const sourceCase = allCases.find((c) => c.case.id === sourceId);
    const candidateCase = allCases.find((c) => c.case.id === candidateId);

    if (!sourceCase || !candidateCase) return;

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

  // Demo fallback if no route params provided
  useEffect(() => {
    if (sourceId && candidateId) return;

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
        <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Generating Forensic Dossier...</h2>
        <p className="text-sm text-slate-600">Retrieving case records and calculating attribute matrix.</p>
      </div>
    );
  }

  const recConfig =
    dossier.recommendation === 'APPROVE_RECOMMENDED'
      ? {
          bg: 'bg-emerald-50/80',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          badgeText: 'RECOMMENDED FOR APPROVAL',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
        }
      : dossier.recommendation === 'REJECT_RECOMMENDED'
      ? {
          bg: 'bg-rose-50/80',
          border: 'border-rose-200',
          text: 'text-rose-900',
          badgeText: 'REJECT RECOMMENDED',
          icon: XCircle,
          iconColor: 'text-rose-600',
        }
      : {
          bg: 'bg-amber-50/80',
          border: 'border-amber-200',
          text: 'text-amber-900',
          badgeText: 'MANUAL REVIEW REQUIRED',
          icon: Clock,
          iconColor: 'text-amber-600',
        };

  const RecIcon = recConfig.icon;
  const criticalCount = dossier.discrepancyAlerts.filter((a) => a.severity === 'CRITICAL_CONFLICT').length;
  const benignCount = dossier.discrepancyAlerts.filter((a) => a.severity === 'BENIGN_VARIATION').length;
  const gapCount = dossier.discrepancyAlerts.filter((a) => a.severity === 'DATA_GAP').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 text-slate-700">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/review"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Match Review Queue</span>
        </Link>
        <div className="text-xs font-mono text-slate-400">
          CASE ID: <strong className="text-slate-900">{dossier.sourceCaseId}</strong> ⟷ <strong className="text-slate-900">{dossier.candidateCaseId}</strong>
        </div>
      </div>

      {/* 01. Hero Dossier Summary Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Forensic Verification Dossier
            </h1>
          </div>
          <Badge variant="shade" size="sm">
            [SIMULATED DRILL / DEMO DATA]
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Radial Score Gauge */}
          <ScoreGauge score={dossier.score} />

          {/* Stats KPI Boxes */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confidence
              </div>
              <div
                className={`text-lg font-bold font-mono ${
                  dossier.confidenceTier === 'HIGH'
                    ? 'text-emerald-700'
                    : dossier.confidenceTier === 'MEDIUM'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {dossier.confidenceTier}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Completeness
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {dossier.dataCompleteness}%
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Evidence Fields
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {dossier.evidenceBreakdown.matched.length + dossier.evidenceBreakdown.conflicting.length}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Alerts
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {dossier.discrepancyAlerts.length}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Recommendation Banner */}
        <div className={`p-4 rounded-xl border ${recConfig.bg} ${recConfig.border} flex items-start gap-3`}>
          <RecIcon className={`w-5 h-5 ${recConfig.iconColor} shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <strong className={`text-sm font-semibold ${recConfig.text}`}>
                {recConfig.badgeText}
              </strong>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {dossier.summaryRationale}
            </p>
          </div>
        </div>

        {/* Action Controls & Metadata */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-3">
          <div className="text-xs font-mono text-slate-400">
            Generated: {new Date(dossier.generatedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-none"
            >
              Print Dossier
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-none shadow-sm"
            >
              Download (.txt)
            </Button>
          </div>
        </div>
      </div>

      {/* 02. Evidence Breakdown Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Deterministic Evidence Matrix
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {dossier.evidenceBreakdown.matched.length} matched • {dossier.evidenceBreakdown.conflicting.length} conflicting • {dossier.evidenceBreakdown.missing.length} data gaps
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {[...dossier.evidenceBreakdown.matched, ...dossier.evidenceBreakdown.conflicting]
            .sort((a, b) => b.score - a.score)
            .map((field, idx) => (
              <EvidenceBar key={idx} field={field} />
            ))}
        </div>

        {/* Missing Fields Note */}
        {dossier.evidenceBreakdown.missing.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Unavailable Fields (Normalized Weight Redistribution):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dossier.evidenceBreakdown.missing.map((f) => (
                <span
                  key={f}
                  className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200/80"
                >
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 03. Investigation Alerts */}
      {dossier.discrepancyAlerts.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Investigation Alerts & Safeguard Gates
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                  {criticalCount} CRITICAL
                </span>
              )}
              {benignCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                  {benignCount} BENIGN
                </span>
              )}
              {gapCount > 0 && (
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
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

      {/* 04. Official Printable Verification Certificate Preview */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
        <button
          type="button"
          onClick={() => setShowRawDossier(!showRawDossier)}
          className="flex items-center justify-between w-full text-left transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700 group-hover:text-orange-600 transition-colors" />
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
              Official Handover Certificate & Forensic Audit Log
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1 group-hover:text-slate-600 transition-colors">
            {showRawDossier ? (
              <>
                Collapse <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Expand Raw Certificate <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </span>
        </button>

        {showRawDossier && (
          <div className="pt-2 animate-fade-in">
            <pre className="p-4 bg-slate-900 text-slate-100 border border-slate-800 rounded-xl text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-auto shadow-inner">
              {dossier.officialDossierText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
