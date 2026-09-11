import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { VoiceInputPanel } from '../components/voice/VoiceInputPanel.tsx';
import { submitCaseReport } from '../services/caseService.ts';
import type { ParsedVoiceReport } from '../lib/voice-parser.ts';
import type { CreateCaseWithReportInput } from '../types/index.ts';
import {
  Radio,
  Sparkles,
  CheckCircle2,
  Shield,
  Loader2,
  Edit3,
  ArrowRight,
  Mic,
  User,
  MapPin,
  HeartPulse,
  Tag,
  ChevronLeft,
  Copy,
  Check,
} from 'lucide-react';

type PageMode = 'input' | 'review' | 'submitted';

/**
 * Converts backend ParsedVoiceReport.attributes (Partial<CreateCaseWithReportInput>)
 * into a full CreateCaseWithReportInput with sensible defaults.
 */
function toFullInput(attrs: Partial<CreateCaseWithReportInput>, rawTranscript: string): CreateCaseWithReportInput {
  return {
    p_case_type: attrs.p_case_type || 'FOUND',
    p_source_type: attrs.p_source_type || 'NGO',
    p_comm_status: attrs.p_comm_status,
    p_full_name: attrs.p_full_name,
    p_age: attrs.p_age,
    p_approximate_age: attrs.p_approximate_age,
    p_gender: attrs.p_gender,
    p_blood_group: attrs.p_blood_group,
    p_height_cm: attrs.p_height_cm,
    p_weight_kg: attrs.p_weight_kg,
    p_build: attrs.p_build,
    p_hair_description: attrs.p_hair_description,
    p_hair_colour: attrs.p_hair_colour,
    p_eye_colour: attrs.p_eye_colour,
    p_skin_description: attrs.p_skin_description,
    p_birthmarks: attrs.p_birthmarks,
    p_scars: attrs.p_scars,
    p_tattoos: attrs.p_tattoos,
    p_anatomical_features: attrs.p_anatomical_features,
    p_clothing: attrs.p_clothing,
    p_footwear: attrs.p_footwear,
    p_accessories: attrs.p_accessories,
    p_belongings: attrs.p_belongings,
    p_identifying_clue: attrs.p_identifying_clue,
    p_condition_status: attrs.p_condition_status,
    p_found_location: attrs.p_found_location,
    p_report_notes: rawTranscript,
  };
}

export const VoiceIntakePage: React.FC = () => {
  const [mode, setMode] = useState<PageMode>('input');
  const [parseResult, setParseResult] = useState<ParsedVoiceReport | null>(null);
  const [editableData, setEditableData] = useState<CreateCaseWithReportInput | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const handleParseComplete = useCallback((result: ParsedVoiceReport) => {
    setParseResult(result);
    setEditableData(toFullInput(result.attributes, result.rawTranscript));
    setMode('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFieldChange = (field: keyof CreateCaseWithReportInput, value: string | number | undefined) => {
    if (!editableData) return;
    setEditableData({ ...editableData, [field]: value || undefined });
  };

  const handleSubmit = async () => {
    if (!editableData) return;
    setSubmitting(true);
    const res = await submitCaseReport(editableData);
    setSubmitting(false);
    if (res.success && res.caseUid) {
      setSubmittedUid(res.caseUid);
      setMode('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartOver = () => {
    setMode('input');
    setParseResult(null);
    setEditableData(null);
    setSubmittedUid(null);
  };

  const handleCopyTranscript = () => {
    if (editableData?.p_report_notes) {
      navigator.clipboard.writeText(editableData.p_report_notes);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    }
  };

  // Helper to check if field was auto-populated by AI
  const isAiExtracted = (field: keyof CreateCaseWithReportInput): boolean => {
    if (!parseResult) return false;
    return Boolean(parseResult.attributes[field]);
  };

  // ============================================================
  // SUBMITTED VIEW
  // ============================================================
  if (mode === 'submitted' && submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4">
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
              Voice-Parsed Case Registered
            </span>
            <h2 className="text-3xl font-extrabold text-white pt-2">
              Case Successfully Initialized
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The AI speech parser extracted {parseResult?.extractedEntities.length || 0} disaster entities with{' '}
              {parseResult?.confidence || 0}% confidence. The case is now registered in the live reconciliation pipeline.
            </p>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner max-w-sm mx-auto space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Milan Master Case UID
            </div>
            <div className="text-3xl font-mono font-black tracking-wider text-emerald-400">
              {submittedUid}
            </div>
            <div className="text-[11px] text-slate-500 pt-1">
              Deterministic verification ready for review
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/review"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition hover:scale-105"
            >
              <Shield className="w-4 h-4" /> Check Candidate Matches
            </Link>
            <button
              onClick={handleStartOver}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700"
            >
              Parse Another Transcript
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          HackX 4.0 Innovation 2: Multimodal Voice & Radio AI
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Voice / Radio{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI Triage Suite
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          First responders in boats or helicopters cannot type. Speak naturally or paste emergency radio transcripts —
          our zero-dependency NLP maps unstructured audio straight into standardized Milan case records.
        </p>
      </div>

      {/* Mode Step Stepper Bar */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-xl gap-2">
          <button
            onClick={() => mode !== 'submitted' && setMode('input')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'input'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>1. Voice & Text Intake</span>
          </button>
          <button
            onClick={() => editableData && mode !== 'submitted' && setMode('review')}
            disabled={!editableData}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'review'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : editableData
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>2. AI Extraction & Review</span>
            {editableData && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Ready
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. INPUT MODE */}
      {/* ============================================================ */}
      {mode === 'input' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
          <VoiceInputPanel onParseComplete={handleParseComplete} />
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. REVIEW & EDIT MODE */}
      {/* ============================================================ */}
      {mode === 'review' && editableData && (
        <div className="space-y-6 animate-fade-in">
          {/* Top AI Confidence & Entity Banner */}
          {parseResult && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 p-5 shadow-2xl flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white">
                      AI Extracted {parseResult.extractedEntities.length} Disaster Attributes
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border font-mono ${
                        parseResult.confidence >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : parseResult.confidence >= 40
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {parseResult.confidence}% {parseResult.confidence >= 80 ? 'HIGH' : 'MEDIUM'} CONFIDENCE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Highlighted fields were auto-populated from voice analysis. Review and edit any values before official registration.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMode('input')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Re-Dictate
              </button>
            </div>
          )}

          {/* Form Section Cards */}
          <div className="space-y-6">
            {/* Card 1: Protocol & Source */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Shield className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Case Classification & Protocol
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Case Type</label>
                  <select
                    value={editableData.p_case_type}
                    onChange={(e) => handleFieldChange('p_case_type', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-cyan-400 transition"
                  >
                    <option value="MISSING">MISSING (Inquiry)</option>
                    <option value="FOUND">FOUND (Rescued/Sighted)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Intake Channel</label>
                  <select
                    value={editableData.p_source_type}
                    onChange={(e) => handleFieldChange('p_source_type', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 outline-none focus:border-cyan-400 transition"
                  >
                    <option value="NGO">NGO Field Worker</option>
                    <option value="ARMY_RESCUE">Army / NDRF Rescue</option>
                    <option value="HOSPITAL">Hospital Triage</option>
                    <option value="FAMILY">Family Member</option>
                    <option value="VOLUNTEER">Community Volunteer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Communication Status</span>
                    {isAiExtracted('p_comm_status') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <select
                    value={editableData.p_comm_status || 'UNKNOWN'}
                    onChange={(e) => handleFieldChange('p_comm_status', e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 outline-none transition ${
                      isAiExtracted('p_comm_status') ? 'border-cyan-500/50' : 'border-slate-700'
                    }`}
                  >
                    <option value="CAN_COMMUNICATE">Can Communicate</option>
                    <option value="CANNOT_COMMUNICATE">Cannot Communicate / Shock</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Identity & Biometrics */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <User className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Person Identity & Physical Attributes
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Full Name</span>
                    {isAiExtracted('p_full_name') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_full_name || ''}
                    onChange={(e) => handleFieldChange('p_full_name', e.target.value)}
                    placeholder="Unknown / Unidentified"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 outline-none transition ${
                      isAiExtracted('p_full_name') ? 'border-cyan-500/50' : 'border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Age / Approximate Age</span>
                    {(isAiExtracted('p_age') || isAiExtracted('p_approximate_age')) && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={editableData.p_age ?? editableData.p_approximate_age ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFieldChange('p_approximate_age', val);
                    }}
                    placeholder="e.g. 9"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 outline-none transition ${
                      isAiExtracted('p_approximate_age') ? 'border-cyan-500/50' : 'border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Gender</span>
                    {isAiExtracted('p_gender') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <select
                    value={editableData.p_gender || ''}
                    onChange={(e) => handleFieldChange('p_gender', e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 outline-none transition ${
                      isAiExtracted('p_gender') ? 'border-cyan-500/50' : 'border-slate-700'
                    }`}
                  >
                    <option value="">Unknown</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Blood Group</span>
                    {isAiExtracted('p_blood_group') && (
                      <span className="text-[9px] font-mono text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_blood_group || ''}
                    onChange={(e) => handleFieldChange('p_blood_group', e.target.value)}
                    placeholder="e.g. B+"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 outline-none transition ${
                      isAiExtracted('p_blood_group') ? 'border-rose-500/50' : 'border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Build</span>
                    {isAiExtracted('p_build') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_build || ''}
                    onChange={(e) => handleFieldChange('p_build', e.target.value)}
                    placeholder="e.g. Slim, Athletic"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Hair Description</span>
                    {isAiExtracted('p_hair_description') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        AI
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_hair_description || ''}
                    onChange={(e) => handleFieldChange('p_hair_description', e.target.value)}
                    placeholder="e.g. Short black hair"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={editableData.p_height_cm ?? ''}
                    onChange={(e) => handleFieldChange('p_height_cm', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g. 135"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Physical Description & Distinguishing Clues */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Tag className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Clothing & Distinguishing Forensic Clues
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Clothing Attire</span>
                  {isAiExtracted('p_clothing') && (
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                      AI EXTRACTED
                    </span>
                  )}
                </label>
                <textarea
                  rows={2}
                  value={editableData.p_clothing || ''}
                  onChange={(e) => handleFieldChange('p_clothing', e.target.value)}
                  placeholder="e.g. Soiled red collared polo shirt with dark shorts"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 outline-none transition ${
                    isAiExtracted('p_clothing') ? 'border-cyan-500/50 focus:border-cyan-400' : 'border-slate-700'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Scars / Surgical Marks</span>
                    {isAiExtracted('p_scars') && (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_scars || ''}
                    onChange={(e) => handleFieldChange('p_scars', e.target.value)}
                    placeholder="e.g. Visible scar on left forearm"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 outline-none transition ${
                      isAiExtracted('p_scars') ? 'border-amber-500/50' : 'border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Accessories & Identifying Clues</span>
                    {isAiExtracted('p_accessories') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_accessories || editableData.p_identifying_clue || ''}
                    onChange={(e) => {
                      handleFieldChange('p_accessories', e.target.value);
                      handleFieldChange('p_identifying_clue', e.target.value);
                    }}
                    placeholder="e.g. Black thread on right wrist with metallic charm"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Birthmarks</span>
                    {isAiExtracted('p_birthmarks') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_birthmarks || ''}
                    onChange={(e) => handleFieldChange('p_birthmarks', e.target.value)}
                    placeholder="None recorded"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Tattoos</span>
                    {isAiExtracted('p_tattoos') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_tattoos || ''}
                    onChange={(e) => handleFieldChange('p_tattoos', e.target.value)}
                    placeholder="None recorded"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Disaster Coordinates & Medical Notes */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <MapPin className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  4. Location Coordinates & Clinical Condition
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Found Location</span>
                    {isAiExtracted('p_found_location') && (
                      <span className="text-[9px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/40">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_found_location || ''}
                    onChange={(e) => handleFieldChange('p_found_location', e.target.value)}
                    placeholder="e.g. A rooftop near Alaknanda Riverside Market"
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-950 border rounded-xl text-slate-100 placeholder-slate-600 outline-none transition ${
                      isAiExtracted('p_found_location') ? 'border-rose-500/50' : 'border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Clinical Condition</span>
                    {isAiExtracted('p_condition_status') && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editableData.p_condition_status || ''}
                    onChange={(e) => handleFieldChange('p_condition_status', e.target.value)}
                    placeholder="e.g. STABLE, SHOCK"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-cyan-400" />
                    Original Audio Dispatch Log (Report Notes)
                  </label>
                  <button
                    onClick={handleCopyTranscript}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedTranscript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedTranscript ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={editableData.p_report_notes || ''}
                  onChange={(e) => handleFieldChange('p_report_notes', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-400 font-mono resize-none leading-relaxed outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-6 z-30 p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => setMode('input')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Discard & Re-Dictate
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">
                Verified attributes will enter matching pipeline
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering Case...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Register Case
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
