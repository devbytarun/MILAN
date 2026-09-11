import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { VoiceInputPanel } from '../components/voice/VoiceInputPanel.tsx';
import { submitCaseReport } from '../services/caseService.ts';
import type { ParsedVoiceReport } from '../lib/voice-parser.ts';
import type { CreateCaseWithReportInput } from '../types/index.ts';
import { Button } from '../components/ui/Button.tsx';
import {
  Radio,
  Sparkles,
  CheckCircle2,
  Shield,
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

  const isAiExtracted = (field: keyof CreateCaseWithReportInput): boolean => {
    if (!parseResult) return false;
    return Boolean(parseResult.attributes[field]);
  };

  // ============================================================
  // SUBMITTED VIEW
  // ============================================================
  if (mode === 'submitted' && submittedUid) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-white border border-[#dddddd] rounded-xl p-8 sm:p-10 shadow-elevation-2 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Case Registered
            </span>
            <h2 className="text-2xl font-semibold text-[#181d26] pt-1">
              Field Audio Intake Registered
            </h2>
            <p className="text-xs text-[#41454d] max-w-sm mx-auto leading-relaxed">
              The speech parser extracted {parseResult?.extractedEntities.length || 0} forensic entities with{' '}
              {parseResult?.confidence || 0}% transcription confidence. The case is now registered in the live reconciliation pipeline.
            </p>
          </div>

          <div className="p-5 bg-[#f8fafc] border border-[#dddddd] rounded-xl space-y-1 max-w-sm mx-auto">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#9297a0]">
              Milan Master Case UID
            </div>
            <div className="text-2xl font-mono font-bold text-[#181d26]">
              {submittedUid}
            </div>
            <div className="text-[11px] text-[#41454d] pt-0.5">
              Deterministic verification ready for review
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/review" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Shield className="w-4 h-4" />}
                className="w-full"
              >
                Check Candidate Matches
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="md"
              onClick={handleStartOver}
              className="w-full sm:w-auto"
            >
              Transcribe Another Dispatch
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#181d26] pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#dddddd] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#9297a0]">
            <Radio className="w-3.5 h-3.5 text-[#181d26]" />
            <span>MILAN // Automated Field Audio Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#181d26] tracking-tight">
            Voice & Radio Dispatch Intake
          </h1>
          <p className="text-sm text-[#41454d] max-w-2xl leading-relaxed">
            Dictate naturally in the field or paste emergency radio transcripts. MILAN extracts standardized forensic entities without external cloud dependencies.
          </p>
        </div>

        {/* Mode Step Stepper Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="inline-flex items-center p-1 bg-[#f1f3f5] border border-[#dddddd] rounded-lg">
            <button
              type="button"
              onClick={() => mode !== 'submitted' && setMode('input')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'input'
                  ? 'bg-white text-[#181d26] shadow-sm font-semibold'
                  : 'text-[#41454d] hover:text-[#181d26]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>1. Voice & Text Intake</span>
            </button>
            <button
              type="button"
              onClick={() => editableData && mode !== 'submitted' && setMode('review')}
              disabled={!editableData}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'review'
                  ? 'bg-white text-[#181d26] shadow-sm font-semibold'
                  : editableData
                  ? 'text-[#41454d] hover:text-[#181d26]'
                  : 'text-[#9297a0] opacity-50 cursor-not-allowed'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>2. Forensic Extraction & Review</span>
              {editableData && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Ready
                </span>
              )}
            </button>
          </div>

          <div className="text-xs font-mono text-[#9297a0]">
            Deterministic Zero-Dependency NLP
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. INPUT MODE */}
        {/* ============================================================ */}
        {mode === 'input' && (
          <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-8 shadow-elevation-1">
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
              <div className="bg-[#f8fafc] border border-[#dddddd] rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#dddddd] flex items-center justify-center text-[#181d26] shadow-sm shrink-0">
                    <Sparkles className="w-5 h-5 text-[#181d26]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#181d26]">
                        Extracted {parseResult.extractedEntities.length} Forensic Attributes
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          parseResult.confidence >= 80
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : parseResult.confidence >= 40
                            ? 'bg-[#fff8e6] text-[#5c3d00] border-[#f5d485]'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {parseResult.confidence}% {parseResult.confidence >= 80 ? 'HIGH' : 'MEDIUM'} CONFIDENCE
                      </span>
                    </div>
                    <p className="text-xs text-[#41454d] mt-0.5">
                      Highlighted fields were auto-populated from voice analysis. Review and edit any values before official registration.
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMode('input')}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Re-Dictate
                </Button>
              </div>
            )}

            {/* Form Section Cards */}
            <div className="space-y-6">
              {/* Card 1: Protocol & Source */}
              <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-7 shadow-elevation-1 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#dddddd]">
                  <Shield className="w-4 h-4 text-[#181d26]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#181d26]">
                    1. Case Classification & Protocol
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5">
                      Case Type
                    </label>
                    <select
                      value={editableData.p_case_type}
                      onChange={(e) => handleFieldChange('p_case_type', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] rounded-lg outline-none transition-colors"
                    >
                      <option value="MISSING">MISSING (Inquiry)</option>
                      <option value="FOUND">FOUND (Rescued/Sighted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Intake Channel</span>
                      {isAiExtracted('p_source_type') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </label>
                    <select
                      value={editableData.p_source_type}
                      onChange={(e) => handleFieldChange('p_source_type', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] rounded-lg outline-none transition-colors"
                    >
                      <option value="NGO">NGO Field Worker</option>
                      <option value="ARMY_RESCUE">Army / NDRF Rescue</option>
                      <option value="HOSPITAL">Hospital Triage</option>
                      <option value="FAMILY">Family Member</option>
                      <option value="VOLUNTEER">Community Volunteer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Communication Status</span>
                      {isAiExtracted('p_comm_status') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </label>
                    <select
                      value={editableData.p_comm_status || 'UNKNOWN'}
                      onChange={(e) => handleFieldChange('p_comm_status', e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                        isAiExtracted('p_comm_status')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    >
                      <option value="CAN_COMMUNICATE">Can Communicate</option>
                      <option value="CANNOT_COMMUNICATE">Cannot Communicate / Shock</option>
                      <option value="UNKNOWN">Unknown</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Identity & Biometrics */}
              <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-7 shadow-elevation-1 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#dddddd]">
                  <User className="w-4 h-4 text-[#181d26]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#181d26]">
                    2. Person Identity & Physical Attributes
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Full Name</span>
                      {isAiExtracted('p_full_name') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_full_name || ''}
                      onChange={(e) => handleFieldChange('p_full_name', e.target.value)}
                      placeholder="Unknown / Unidentified"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_full_name')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Age / Approximate Age</span>
                      {(isAiExtracted('p_age') || isAiExtracted('p_approximate_age')) && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={editableData.p_age ?? editableData.p_approximate_age ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value) : undefined;
                        handleFieldChange('p_approximate_age', val);
                        handleFieldChange('p_age', val);
                      }}
                      placeholder="e.g. 21"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_age') || isAiExtracted('p_approximate_age')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Gender</span>
                      {isAiExtracted('p_gender') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <select
                      value={editableData.p_gender || ''}
                      onChange={(e) => handleFieldChange('p_gender', e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_gender')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
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
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Blood Group</span>
                      {isAiExtracted('p_blood_group') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_blood_group || ''}
                      onChange={(e) => handleFieldChange('p_blood_group', e.target.value)}
                      placeholder="e.g. O+"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_blood_group')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Height (cm)</span>
                      {isAiExtracted('p_height_cm') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={editableData.p_height_cm ?? ''}
                      onChange={(e) => handleFieldChange('p_height_cm', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g. 184"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_height_cm')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Build</span>
                      {isAiExtracted('p_build') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_build || ''}
                      onChange={(e) => handleFieldChange('p_build', e.target.value)}
                      placeholder="e.g. Athletic, Slim"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_build')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Hair Description</span>
                      {isAiExtracted('p_hair_description') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_hair_description || ''}
                      onChange={(e) => handleFieldChange('p_hair_description', e.target.value)}
                      placeholder="e.g. Long black hair"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors font-medium ${
                        isAiExtracted('p_hair_description')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Physical Description & Distinguishing Clues */}
              <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-7 shadow-elevation-1 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#dddddd]">
                  <Tag className="w-4 h-4 text-[#181d26]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#181d26]">
                    3. Clothing & Distinguishing Forensic Clues
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                    <span>Clothing Attire</span>
                    {isAiExtracted('p_clothing') && (
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        AI EXTRACTED
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    value={editableData.p_clothing || ''}
                    onChange={(e) => handleFieldChange('p_clothing', e.target.value)}
                    placeholder="e.g. Blue denim jacket, dark jeans"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                      isAiExtracted('p_clothing')
                        ? 'border-blue-300 bg-blue-50/30'
                        : 'border-[#dddddd] bg-[#f8fafc]'
                    } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Scars / Surgical Marks</span>
                      {isAiExtracted('p_scars') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_scars || ''}
                      onChange={(e) => handleFieldChange('p_scars', e.target.value)}
                      placeholder="e.g. Right eyebrow scar"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                        isAiExtracted('p_scars')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Accessories & Distinguishing Clues</span>
                      {isAiExtracted('p_accessories') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
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
                      placeholder="e.g. Black thread on wrist, silver ring"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] rounded-lg outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Birthmarks</span>
                      {isAiExtracted('p_birthmarks') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_birthmarks || ''}
                      onChange={(e) => handleFieldChange('p_birthmarks', e.target.value)}
                      placeholder="None recorded"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] rounded-lg outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Tattoos</span>
                      {isAiExtracted('p_tattoos') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_tattoos || ''}
                      onChange={(e) => handleFieldChange('p_tattoos', e.target.value)}
                      placeholder="None recorded"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] rounded-lg outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Disaster Coordinates & Medical Notes */}
              <div className="bg-white border border-[#dddddd] rounded-xl p-6 sm:p-7 shadow-elevation-1 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#dddddd]">
                  <MapPin className="w-4 h-4 text-[#181d26]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#181d26]">
                    4. Location Coordinates & Clinical Condition
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Found Location</span>
                      {isAiExtracted('p_found_location') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_found_location || ''}
                      onChange={(e) => handleFieldChange('p_found_location', e.target.value)}
                      placeholder="e.g. NGO field, Bhimtal bypass"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                        isAiExtracted('p_found_location')
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-[#dddddd] bg-[#f8fafc]'
                      } focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26]`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333840] mb-1.5 flex items-center justify-between">
                      <span>Clinical Condition</span>
                      {isAiExtracted('p_condition_status') && (
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          AI EXTRACTED
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editableData.p_condition_status || ''}
                      onChange={(e) => handleFieldChange('p_condition_status', e.target.value)}
                      placeholder="e.g. STABLE, CRITICAL"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] rounded-lg outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#333840] uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-[#181d26]" />
                      Original Audio Dispatch Log (Report Notes)
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="text-xs text-[#41454d] hover:text-[#181d26] flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedTranscript ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedTranscript ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={editableData.p_report_notes || ''}
                    onChange={(e) => handleFieldChange('p_report_notes', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-[#dddddd] bg-[#f8fafc] focus:bg-white focus:border-[#181d26] focus:ring-1 focus:ring-[#181d26] text-[#181d26] outline-none leading-relaxed resize-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="sticky bottom-6 z-30 p-4 rounded-xl shadow-elevation-2 bg-white/95 backdrop-blur-md border border-[#dddddd] flex items-center justify-between flex-wrap gap-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setMode('input')}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Discard & Re-Dictate
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#9297a0] hidden sm:inline">
                  Verified attributes will enter matching pipeline
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  isLoading={submitting}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Confirm & Register Case
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
