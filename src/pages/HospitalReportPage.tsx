import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormStepWrapper, FormStep } from '../components/forms/FormStepWrapper.tsx';
import { submitCaseReport, getLocalCases } from '../services/caseService.ts';
import {
  CheckCircle2,
  Lock,
  Search,
  ScanFace,
  AlertCircle,
  Dna,
  Upload,
} from 'lucide-react';
import { VoiceIntakeModal } from '../components/common/VoiceIntakeModal.tsx';
import type { ParsedVoiceReport } from '../lib/voice-parser.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { hasPermission } from '../lib/permissions.ts';
import { AccessDenied } from './AccessDenied.tsx';
import { Button } from '../components/ui/Button.tsx';
import { DemoAutoFillBar } from '../components/forms/DemoAutoFillBar.tsx';
import { DEMO_PRESETS, DemoPresetKey } from '../data/demoPresets.ts';
import { FacePhotoUpload, FaceUploadResult } from '../components/common/FacePhotoUpload.tsx';
import { getLocalFaceEmbeddings, findFaceMatches, FaceMatchCandidate } from '../lib/faceSimilarity.ts';
import { FaceMatchResults } from '../components/matching/FaceMatchResults.tsx';
import { uploadDnaReport as _uploadDnaReport } from '../services/dnaReportService.ts';

const HOSPITAL_STEPS: FormStep[] = [
  { id: 'triage', title: 'Hospital Referral & Triage', subtitle: 'Link existing Milan UID or register new clinical patient' },
  { id: 'clinical', title: 'Medical & Anatomical Observations', subtitle: 'Blood group, trauma marks, scars and clinical status' },
  { id: 'review', title: 'Review & Medical Privacy Lock', subtitle: 'Confirm clinical intake under HIPAA / Disaster Medical Privacy' },
];

export const HospitalReportPage: React.FC = () => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);

  const [hasExistingUid, setHasExistingUid] = useState(false);
  const [existingUid, setExistingUid] = useState('');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceParseNotification, setVoiceParseNotification] = useState<string | null>(null);

  // Face matching state
  const [faceUploadResult, setFaceUploadResult] = useState<FaceUploadResult | null>(null);
  const [faceMatches, setFaceMatches] = useState<FaceMatchCandidate[]>([]);
  const [faceSearching, setFaceSearching] = useState(false);
  const [faceSearchError, setFaceSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // DNA upload state
  const [dnaFile, setDnaFile] = useState<File | null>(null);
  const [_dnaUploading, _setDnaUploading] = useState(false);
  const [dnaUploadMsg, _setDnaUploadMsg] = useState<string | null>(null);
  const [dnaNotes, setDnaNotes] = useState('');

  const [formData, setFormData] = useState({
    hospitalName: 'City Trauma Center',
    wardBed: 'Emergency Triage, Bed #14',
    referralAmbulance: 'Ambulance NDRF-07',
    fullName: '',
    approximateAge: '40',
    gender: 'Male',
    bloodGroup: 'A+',
    weightKg: '70',
    conditionStatus: 'Moderate head trauma, stabilized with IV fluids',
    anatomicalFeatures: 'Fracture on left fibula, old appendectomy scar',
    clothing: 'Torn athletic hoodie, black track pants',
    accessories: 'Silver ring left ring finger, Casio watch',
    identifyingClue: 'Om tattoo on inner right wrist, Casio watch',
    reportNotes: 'Admitted from bridge collapse sector; unconscious upon initial arrival.',
  });

  if (!hasPermission(profile?.role, 'CREATE_HOSPITAL_REPORT')) {
    return (
      <AccessDenied
        moduleName="Hospital Patient Intake"
        reason="Clinical patient intake and trauma triage logs are restricted to verified medical personnel."
      />
    );
  }

  const handleApplyVoice = (parsed: ParsedVoiceReport) => {
    const a = parsed.attributes;
    setFormData((prev) => ({
      ...prev,
      fullName: a.p_full_name || prev.fullName,
      approximateAge: a.p_approximate_age !== undefined ? a.p_approximate_age.toString() : prev.approximateAge,
      gender: a.p_gender || prev.gender,
      bloodGroup: a.p_blood_group || prev.bloodGroup,
      clothing: a.p_clothing || prev.clothing,
      anatomicalFeatures: [
        a.p_scars ? `Scars: ${a.p_scars}` : '',
        a.p_birthmarks ? `Birthmarks: ${a.p_birthmarks}` : '',
        a.p_tattoos ? `Tattoos: ${a.p_tattoos}` : '',
        prev.anatomicalFeatures,
      ].filter(Boolean).join('; '),
      conditionStatus: a.p_condition_status ? `Status: ${a.p_condition_status}` : prev.conditionStatus,
      reportNotes: parsed.rawTranscript
        ? `${prev.reportNotes ? prev.reportNotes + '\n' : ''}[Paramedic / Clinical Voice Log]: ${parsed.rawTranscript}`
        : prev.reportNotes,
    }));
    setVoiceParseNotification(
      `Clinical voice log parsed ${parsed.extractedEntities.length} attributes (${parsed.confidence}% confidence). Review populated patient observations below.`
    );
    setVoiceModalOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoFillDemo = (key: DemoPresetKey, fastForward = false) => {
    const preset = DEMO_PRESETS[key].hospital;
    setHasExistingUid(false);
    setExistingUid('');
    setFormData({
      hospitalName: preset.hospitalName,
      wardBed: preset.wardBed,
      referralAmbulance: preset.referralAmbulance,
      fullName: preset.fullName,
      approximateAge: preset.approximateAge,
      gender: preset.gender,
      bloodGroup: preset.bloodGroup,
      weightKg: preset.weightKg,
      conditionStatus: preset.conditionStatus,
      anatomicalFeatures: preset.anatomicalFeatures,
      clothing: preset.clothing,
      accessories: preset.accessories,
      identifyingClue: preset.identifyingClue,
      reportNotes: preset.reportNotes,
    });

    if (fastForward) {
      setCurrentStep(HOSPITAL_STEPS.length - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < HOSPITAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitCaseReport({
      p_case_type: 'FOUND',
      p_source_type: 'HOSPITAL',
      p_comm_status: 'CANNOT_COMMUNICATE',
      p_full_name: formData.fullName || 'Unidentified Clinical Inpatient',
      p_approximate_age: formData.approximateAge ? parseInt(formData.approximateAge, 10) : undefined,
      p_gender: formData.gender,
      p_blood_group: formData.bloodGroup || undefined,
      p_weight_kg: formData.weightKg ? parseInt(formData.weightKg, 10) : undefined,
      p_condition_status: formData.conditionStatus,
      p_anatomical_features: formData.anatomicalFeatures,
      p_clothing: formData.clothing,
      p_accessories: formData.accessories,
      p_identifying_clue: formData.identifyingClue,
      p_found_location: `${formData.hospitalName} (${formData.wardBed})`,
      p_referral_info: `${formData.referralAmbulance}${hasExistingUid ? ` • Linked UID: ${existingUid}` : ''}`,
      p_report_notes: formData.reportNotes,
    });

    // Store face embedding for matching if we have one
    if (res.success && res.caseId && faceUploadResult?.descriptor) {
      try {
        const { saveFaceEmbeddingLocally } = await import('../lib/faceSimilarity.ts');
        saveFaceEmbeddingLocally({
          caseId: res.caseId,
          caseUid: res.caseUid || null,
          embedding: faceUploadResult.descriptor,
          personName: formData.fullName || null,
          createdAt: new Date().toISOString(),
        });
      } catch { /* non-critical */ }
    }

    setSubmitting(false);
    if (res.success && res.caseUid) {
      setSubmittedUid(res.caseUid);
    }
  };

  if (submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card text-center space-y-6 font-body">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
            Clinical Patient Registered
          </span>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight mt-3">
            Hospital Case Synchronized
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Patient record created with privacy protection for clinical diagnostics.
          </p>
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-xl shadow-sm max-w-sm mx-auto space-y-1 border border-slate-800">
          <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
            Case Clinical UID
          </div>
          <div className="text-3xl font-mono font-bold tracking-wider text-orange-400">
            {submittedUid}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl text-left text-xs text-slate-700 flex items-start gap-2">
          <Lock className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div className="text-slate-600">
            <strong className="text-slate-900 font-semibold">Medical Privacy Active:</strong> Sensitive clinical details (condition, surgical history) are strictly quarantined to Hospital and Admin roles.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/cases" className="w-full sm:w-auto">
            <Button
              variant="brand"
              size="md"
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              View in Cases Registry
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setSubmittedUid(null);
              setCurrentStep(0);
            }}
            className="w-full sm:w-auto"
          >
            Admit Another Patient
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DemoAutoFillBar
        formType="hospital"
        onFill={(key) => handleAutoFillDemo(key, false)}
        onFillAndFastForward={(key) => handleAutoFillDemo(key, true)}
        currentStep={currentStep}
        totalSteps={HOSPITAL_STEPS.length}
      />

      <FormStepWrapper
        steps={HOSPITAL_STEPS}
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        badgeText="Hospital Clinical Intake"
        badgeColor="purple"
      >


      {voiceParseNotification && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{voiceParseNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceParseNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* STEP 1: Referral & Triage */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-700 font-medium">
              Did patient arrive with an existing Milan UID (from NGO or Army referral)?
            </div>
            <button
              type="button"
              onClick={() => setHasExistingUid(!hasExistingUid)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                hasExistingUid
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {hasExistingUid ? 'Yes, Link UID' : 'No, New Case'}
            </button>
          </div>

          {hasExistingUid && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Existing Milan UID
              </label>
              <input
                type="text"
                value={existingUid}
                onChange={(e) => setExistingUid(e.target.value)}
                placeholder="e.g. MILAN-2026-094"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital / Trauma Center Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ward / Bed Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.wardBed}
                onChange={(e) => handleChange('wardBed', e.target.value)}
                placeholder="e.g. ICU Ward 3, Bed #12"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Referral Ambulance / Unit
            </label>
            <input
              type="text"
              value={formData.referralAmbulance}
              onChange={(e) => handleChange('referralAmbulance', e.target.value)}
              placeholder="e.g. NDRF Ambulance Unit 7"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Medical & Clinical */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Age
              </label>
              <input
                type="number"
                value={formData.approximateAge}
                onChange={(e) => handleChange('approximateAge', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Clinical Condition Status <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.conditionStatus}
              onChange={(e) => handleChange('conditionStatus', e.target.value)}
              placeholder="e.g. Critical / Stable / Head trauma under observation"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anatomical Observations & Surgical Scars
            </label>
            <textarea
              rows={2}
              value={formData.anatomicalFeatures}
              onChange={(e) => handleChange('anatomicalFeatures', e.target.value)}
              placeholder="e.g. Old appendectomy scar, fracture on left fibula, orthopedic plates"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Distinguishing Tattoos / Markings <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.identifyingClue}
              onChange={(e) => handleChange('identifyingClue', e.target.value)}
              placeholder="e.g. Om tattoo on inner right wrist, Casio watch"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* === AI FACE MATCHING — DURING HOSPITAL INTAKE === */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4 mt-2">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                <ScanFace className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Face Matching — Identify Patient</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload a photo of the unidentified patient to search for missing person matches.
                </p>
              </div>
              <span className="ml-auto text-[10px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0">
                Optional
              </span>
            </div>

            <FacePhotoUpload
              label="Patient Photograph"
              helperText="Upload a clear, front-facing photo of the patient for AI face matching."
              accentColor="blue"
              onResult={(result) => {
                setFaceUploadResult(result);
                setHasSearched(false);
                setFaceMatches([]);
                setFaceSearchError(null);
              }}
            />

            {faceUploadResult?.descriptor && !faceSearching && (
              <Button
                variant="brand"
                size="md"
                onClick={async () => {
                  if (!faceUploadResult?.descriptor) return;
                  setFaceSearching(true);
                  setFaceSearchError(null);
                  try {
                    const allEmbeddings = getLocalFaceEmbeddings();
                    const matches = findFaceMatches(faceUploadResult.descriptor, allEmbeddings, 0.70, 3);
                    setFaceMatches(matches);
                    setHasSearched(true);
                  } catch (err) {
                    setFaceSearchError(`Face search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                  } finally {
                    setFaceSearching(false);
                  }
                }}
                leftIcon={<ScanFace className="w-4 h-4" />}
                className="w-full"
              >
                Find Face Matches
              </Button>
            )}

            {faceUploadResult && !faceUploadResult.descriptor && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>Face could not be extracted. You can continue without face matching.</div>
              </div>
            )}

            <FaceMatchResults
              candidates={faceMatches}
              allCases={getLocalCases()}
              isSearching={faceSearching}
              searchError={faceSearchError}
              hasSearched={hasSearched}
              profileMatchScores={{}}
            />
          </div>

          {/* === DNA REPORT UPLOAD — DURING HOSPITAL INTAKE === */}
          <div className="p-4 sm:p-5 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-4 mt-2">
            <div className="flex items-center gap-3 border-b border-indigo-200 pb-3">
              <div className="w-9 h-9 bg-indigo-100 border border-indigo-300 rounded-xl flex items-center justify-center shrink-0">
                <Dna className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Attach DNA Report / Lab Document</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload an official forensic DNA report (PDF, JPEG, PNG) for this patient case.
                </p>
              </div>
              <span className="ml-auto text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg uppercase tracking-wider shrink-0">
                Optional
              </span>
            </div>

            {dnaUploadMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dnaUploadMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DNA Report File (PDF, JPG, PNG — Max 15 MB)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setDnaFile(file);
                }}
                className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-300 rounded-lg p-1 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lab / Specimen Notes
              </label>
              <input
                type="text"
                value={dnaNotes}
                onChange={(e) => setDnaNotes(e.target.value)}
                placeholder="e.g. Buccal swab reference collected at triage desk"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {dnaFile && (
              <div className="flex items-center gap-2 text-xs text-indigo-700 bg-white rounded-lg p-2 border border-indigo-100">
                <Upload className="w-3.5 h-3.5" />
                <span className="font-medium truncate">{dnaFile.name}</span>
                <span className="text-slate-400">({(dnaFile.size / 1024).toFixed(0)} KB)</span>
              </div>
            )}

            <p className="text-[10px] text-slate-500 leading-relaxed">
              <strong>Note:</strong> MILAN does not perform DNA analysis. This is document storage only. The DNA report will be attached to the case after submission.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Privacy */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              Clinical Intake Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-2 text-slate-700">
              <div><strong>Facility:</strong> {formData.hospitalName}</div>
              <div><strong>Bed:</strong> {formData.wardBed}</div>
              <div><strong>Blood Group:</strong> {formData.bloodGroup}</div>
              <div><strong>Condition:</strong> {formData.conditionStatus}</div>
              <div className="col-span-2"><strong>Anatomical Features:</strong> {formData.anatomicalFeatures}</div>
              <div className="col-span-2"><strong>Key Clues:</strong> {formData.identifyingClue}</div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <strong>Role-Based Privacy:</strong> Clinical findings are secured under role-based authorization. Only Hospital and Reviewer/Admin accounts can inspect medical data.
            </div>
          </div>
        </div>
      )}
      <VoiceIntakeModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onApplyParsedData={handleApplyVoice}
      />
    </FormStepWrapper>
    </div>
  );
};
