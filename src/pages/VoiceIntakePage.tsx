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
  AlertCircle,
  Loader2,
  Edit3,
  ArrowRight,
  FileText,
  Mic,
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

  const handleParseComplete = useCallback((result: ParsedVoiceReport) => {
    setParseResult(result);
    setEditableData(toFullInput(result.attributes, result.rawTranscript));
    setMode('review');
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
    }
  };

  const handleStartOver = () => {
    setMode('input');
    setParseResult(null);
    setEditableData(null);
    setSubmittedUid(null);
  };

  // Submitted view
  if (mode === 'submitted' && submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Voice-Parsed Case Registered
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Case Created from Radio/Voice Transcript
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            The AI parser extracted {parseResult?.extractedEntities.length || 0} entities with{' '}
            {parseResult?.confidence || 0}% confidence. The case is now active in the matching pipeline.
          </p>
        </div>

        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md max-w-sm mx-auto space-y-1">
          <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-widest">
            Milan Case UID
          </div>
          <div className="text-3xl font-mono font-extrabold tracking-wider text-emerald-400">
            {submittedUid}
          </div>
          <div className="text-[11px] text-slate-400">
            This case was auto-generated from a voice/radio transcript.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/review"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Shield className="w-4 h-4" /> Check Candidate Matches
          </Link>
          <button
            onClick={handleStartOver}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Parse Another Transcript
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
            <Radio className="inline w-3 h-3 mr-1" />
            Innovation: AI Voice Parser
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Voice / Radio{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Transcript Parser
          </span>
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Convert unstructured radio communications, voice memos, or field notes into structured Milan case records.
          The AI parser extracts names, ages, physical descriptions, locations, and identifying marks automatically.
        </p>
      </div>

      {/* Mode Toggle Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => mode !== 'submitted' && setMode('input')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'input'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice / Text Input
          </button>
          <button
            onClick={() => editableData && mode !== 'submitted' && setMode('review')}
            disabled={!editableData}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'review'
                ? 'bg-white text-slate-900 shadow-sm'
                : editableData
                ? 'text-slate-500 hover:text-slate-700'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Review & Edit
          </button>
        </div>
      </div>

      {/* INPUT MODE */}
      {mode === 'input' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <VoiceInputPanel onParseComplete={handleParseComplete} />
        </div>
      )}

      {/* REVIEW MODE */}
      {mode === 'review' && editableData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Confidence Banner */}
          {parseResult && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                parseResult.confidence >= 80
                  ? 'bg-emerald-50 border-emerald-200'
                  : parseResult.confidence >= 40
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <Sparkles
                className={`w-5 h-5 shrink-0 ${
                  parseResult.confidence >= 80
                    ? 'text-emerald-600'
                    : parseResult.confidence >= 40
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-900">
                  AI Parser extracted {parseResult.extractedEntities.length} entities at{' '}
                  {parseResult.confidence}% confidence
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Review and correct any fields below before submitting. Edits improve matching accuracy.
                </div>
              </div>
              <button
                onClick={() => setMode('input')}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition shrink-0"
              >
                Re-Parse
              </button>
            </div>
          )}

          {/* Editable Fields */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Case Classification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Case Type</label>
                <select
                  value={editableData.p_case_type}
                  onChange={(e) => handleFieldChange('p_case_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MISSING">MISSING</option>
                  <option value="FOUND">FOUND</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source Type</label>
                <select
                  value={editableData.p_source_type}
                  onChange={(e) => handleFieldChange('p_source_type', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FAMILY">FAMILY</option>
                  <option value="NGO">NGO</option>
                  <option value="ARMY_RESCUE">ARMY_RESCUE</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                  <option value="VOLUNTEER">VOLUNTEER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Communication</label>
                <select
                  value={editableData.p_comm_status || 'UNKNOWN'}
                  onChange={(e) => handleFieldChange('p_comm_status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CAN_COMMUNICATE">Can Communicate</option>
                  <option value="CANNOT_COMMUNICATE">Cannot Communicate</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-2">
              Person Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editableData.p_full_name || ''}
                  onChange={(e) => handleFieldChange('p_full_name', e.target.value)}
                  placeholder="Unknown"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age / Approximate Age</label>
                <input
                  type="number"
                  value={editableData.p_age ?? editableData.p_approximate_age ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : undefined;
                    handleFieldChange('p_approximate_age', val);
                  }}
                  placeholder="e.g. 9"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={editableData.p_gender || ''}
                  onChange={(e) => handleFieldChange('p_gender', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unknown</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <input
                  type="text"
                  value={editableData.p_blood_group || ''}
                  onChange={(e) => handleFieldChange('p_blood_group', e.target.value)}
                  placeholder="e.g. B+"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={editableData.p_height_cm ?? ''}
                  onChange={(e) => handleFieldChange('p_height_cm', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 128"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={editableData.p_weight_kg ?? ''}
                  onChange={(e) => handleFieldChange('p_weight_kg', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 27"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Build</label>
                <select
                  value={editableData.p_build || ''}
                  onChange={(e) => handleFieldChange('p_build', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unknown</option>
                  <option value="Slim">Slim</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                  <option value="Athletic">Athletic</option>
                </select>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-2">
              Physical Description & Identifying Marks
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clothing</label>
              <textarea
                rows={2}
                value={editableData.p_clothing || ''}
                onChange={(e) => handleFieldChange('p_clothing', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scars / Surgical Marks</label>
                <input
                  type="text"
                  value={editableData.p_scars || ''}
                  onChange={(e) => handleFieldChange('p_scars', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tattoos</label>
                <input
                  type="text"
                  value={editableData.p_tattoos || ''}
                  onChange={(e) => handleFieldChange('p_tattoos', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Birthmarks</label>
                <input
                  type="text"
                  value={editableData.p_birthmarks || ''}
                  onChange={(e) => handleFieldChange('p_birthmarks', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Identifying Clue</label>
                <input
                  type="text"
                  value={editableData.p_identifying_clue || ''}
                  onChange={(e) => handleFieldChange('p_identifying_clue', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 pt-2">
              Location & Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Found Location</label>
                <input
                  type="text"
                  value={editableData.p_found_location || ''}
                  onChange={(e) => handleFieldChange('p_found_location', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Condition</label>
                <input
                  type="text"
                  value={editableData.p_condition_status || ''}
                  onChange={(e) => handleFieldChange('p_condition_status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Original Transcript (Report Notes)</label>
              <textarea
                rows={3}
                value={editableData.p_report_notes || ''}
                onChange={(e) => handleFieldChange('p_report_notes', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-500"
              />
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2 flex-1 mr-4">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                Submitting will create an official case from this voice-parsed transcript. The matching engine
                will immediately start cross-referencing against the case registry.
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-sm transition shadow-sm shrink-0 ${
                submitting
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:shadow-lg'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Parsed Case <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
