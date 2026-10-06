import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormStepWrapper, FormStep } from '../components/forms/FormStepWrapper.tsx';
import { submitCaseReport } from '../services/caseService.ts';
import {
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
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
import { saveFaceEmbeddingLocally } from '../lib/faceSimilarity.ts';
import { validateIndianPhoneNumber, formatIndianPhoneNumber } from '../lib/phoneValidation.ts';

const FAMILY_STEPS: FormStep[] = [
  { id: 'identity', title: 'Basic Identity', subtitle: 'Name, age, gender and blood group' },
  { id: 'appearance', title: 'Physical Appearance', subtitle: 'Height, build, hair and eye details' },
  { id: 'clothing', title: 'Clothing & Belongings', subtitle: 'What the missing person was wearing' },
  { id: 'incident', title: 'Last Known Location', subtitle: 'Date, time, and last observed location' },
  { id: 'clues', title: 'Identifying Clues', subtitle: 'Scars, birthmarks, tattoos, distinguishing features' },
  { id: 'review', title: 'Review & Submit', subtitle: 'Confirm all details before generating Milan UID' },
];

export const FamilyReportPage: React.FC = () => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);
  const [_submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [voiceParseNotification, setVoiceParseNotification] = useState<string | null>(null);
  const [faceUploadResult, setFaceUploadResult] = useState<FaceUploadResult | null>(null);
  const [faceEmbedStatus, setFaceEmbedStatus] = useState<'none' | 'stored' | 'failed'>('none');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    alternativeNames: '',
    familyContactPhone: '',
    age: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: '',
    heightCm: '',
    weightKg: '',
    build: 'Medium',
    hairDescription: '',
    hairColour: 'Black',
    eyeColour: 'Brown',
    skinDescription: '',
    clothing: '',
    footwear: '',
    accessories: '',
    belongings: '',
    foundLocation: '',
    foundAt: new Date().toISOString().slice(0, 16),
    reportNotes: '',
    birthmarks: '',
    scars: '',
    tattoos: '',
    anatomicalFeatures: '',
    identifyingClue: '',
  });

  if (!hasPermission(profile?.role, 'CREATE_MISSING_REPORT')) {
    return (
      <AccessDenied
        moduleName="Missing Person Report Portal"
        reason="Missing person reports are filed by families and verified disaster case officers."
      />
    );
  }

  const handleApplyVoice = (parsed: ParsedVoiceReport) => {
    const a = parsed.attributes;
    setFormData((prev) => ({
      ...prev,
      fullName: a.p_full_name || prev.fullName,
      age: a.p_approximate_age !== undefined ? a.p_approximate_age.toString() : (a.p_age !== undefined ? a.p_age.toString() : prev.age),
      gender: a.p_gender || prev.gender,
      bloodGroup: a.p_blood_group || prev.bloodGroup,
      clothing: a.p_clothing || prev.clothing,
      birthmarks: a.p_birthmarks || prev.birthmarks,
      scars: a.p_scars || prev.scars,
      tattoos: a.p_tattoos || prev.tattoos,
      foundLocation: a.p_found_location || prev.foundLocation,
      reportNotes: parsed.rawTranscript
        ? `${prev.reportNotes ? prev.reportNotes + '\n' : ''}[Voice / Audio Log]: ${parsed.rawTranscript}`
        : prev.reportNotes,
    }));
    setVoiceParseNotification(
      `Voice intake parsed ${parsed.extractedEntities.length} attributes (${parsed.confidence}% confidence). Review the auto-populated fields below.`
    );
    setVoiceModalOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoFillDemo = (key: DemoPresetKey, fastForward = false) => {
    const preset = DEMO_PRESETS[key].family;
    setFormData({
      fullName: preset.fullName,
      alternativeNames: preset.alternativeNames,
      familyContactPhone: preset.familyContactPhone || '+91 98765 43210',
      age: preset.age,
      gender: preset.gender,
      dateOfBirth: preset.dateOfBirth,
      bloodGroup: preset.bloodGroup,
      heightCm: preset.heightCm,
      weightKg: preset.weightKg,
      build: preset.build,
      hairDescription: preset.hairDescription,
      hairColour: preset.hairColour,
      eyeColour: preset.eyeColour,
      skinDescription: preset.skinDescription,
      clothing: preset.clothing,
      footwear: preset.footwear,
      accessories: preset.accessories,
      belongings: preset.belongings,
      foundLocation: preset.foundLocation,
      foundAt: preset.foundAt,
      reportNotes: preset.reportNotes,
      birthmarks: preset.birthmarks,
      scars: preset.scars,
      tattoos: preset.tattoos,
      anatomicalFeatures: preset.anatomicalFeatures,
      identifyingClue: preset.identifyingClue,
    });

    if (fastForward) {
      setCurrentStep(FAMILY_STEPS.length - 1);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.fullName.trim()) {
        alert('Please enter the missing person’s full legal name.');
        return;
      }
      const phoneCheck = validateIndianPhoneNumber(formData.familyContactPhone);
      if (!phoneCheck.isValid) {
        setPhoneError(phoneCheck.error || 'Please enter a valid 10-digit Indian mobile number.');
        return;
      }
      setPhoneError(null);
      setFormData((prev) => ({ ...prev, familyContactPhone: phoneCheck.canonical }));
    }

    if (currentStep < FAMILY_STEPS.length - 1) {
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
    const phoneCheck = validateIndianPhoneNumber(formData.familyContactPhone);
    const validPhone = phoneCheck.isValid ? phoneCheck.canonical : undefined;

    setSubmitting(true);
    const res = await submitCaseReport({
      p_case_type: 'MISSING',
      p_source_type: 'FAMILY',
      p_family_contact_phone: validPhone,
      p_comm_status: 'CAN_COMMUNICATE',
      p_full_name: formData.fullName,
      p_alternative_names: formData.alternativeNames || undefined,
      p_age: formData.age ? parseInt(formData.age, 10) : undefined,
      p_approximate_age: formData.age ? parseInt(formData.age, 10) : undefined,
      p_gender: formData.gender,
      p_date_of_birth: formData.dateOfBirth || undefined,
      p_blood_group: formData.bloodGroup || undefined,
      p_height_cm: formData.heightCm ? parseInt(formData.heightCm, 10) : undefined,
      p_weight_kg: formData.weightKg ? parseInt(formData.weightKg, 10) : undefined,
      p_build: formData.build || undefined,
      p_hair_description: formData.hairDescription || undefined,
      p_hair_colour: formData.hairColour || undefined,
      p_eye_colour: formData.eyeColour || undefined,
      p_skin_description: formData.skinDescription || undefined,
      p_clothing: formData.clothing || undefined,
      p_footwear: formData.footwear || undefined,
      p_accessories: formData.accessories || undefined,
      p_belongings: formData.belongings || undefined,
      p_found_location: formData.foundLocation || undefined,
      p_found_at: formData.foundAt || undefined,
      p_report_notes: formData.reportNotes || undefined,
      p_birthmarks: formData.birthmarks || undefined,
      p_scars: formData.scars || undefined,
      p_tattoos: formData.tattoos || undefined,
      p_anatomical_features: formData.anatomicalFeatures || undefined,
      p_identifying_clue: formData.identifyingClue || undefined,
    });

    // Store face embedding if we have one
    if (res.success && res.caseId && faceUploadResult?.descriptor) {
      try {
        saveFaceEmbeddingLocally({
          caseId: res.caseId,
          caseUid: res.caseUid || null,
          embedding: faceUploadResult.descriptor,
          personName: formData.fullName || null,
          createdAt: new Date().toISOString(),
        });
        setFaceEmbedStatus('stored');
      } catch {
        setFaceEmbedStatus('failed');
      }
    }

    setSubmitting(false);
    if (res.success && res.caseUid) {
      setSubmittedUid(res.caseUid);
      setSubmittedCaseId(res.caseId || null);
    }
  };

  // Success Confirmation Screen
  if (submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-slate-200/90 rounded-2xl p-8 shadow-card text-center space-y-6 font-body">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 font-mono">
            Report Successfully Filed
          </span>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight mt-3">
            Missing Person Case Created
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Your report has been broadcast to all active camp rescue shelters and hospital triage registries.
          </p>
        </div>

        {/* UID Box */}
        <div className="p-6 bg-slate-900 text-white rounded-xl shadow-sm max-w-sm mx-auto space-y-1 border border-slate-800">
          <div className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
            Case Identification UID
          </div>
          <div className="text-3xl font-mono font-bold tracking-wider text-orange-400">
            {submittedUid}
          </div>
          <div className="text-[11px] text-slate-400">
            Save this UID to track case status or quote to relief officers.
          </div>
        </div>

        {/* Face Embedding Status */}
        {faceEmbedStatus === 'stored' && (
          <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <strong>✓ Face Profile Generated & Stored.</strong> This case is now eligible for AI face-matching with found person reports.
            </div>
          </div>
        )}
        {faceEmbedStatus === 'failed' && (
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              Face profile could not be stored. The case has been registered, but face matching will not be available for this case.
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl text-left text-xs text-slate-700 space-y-2">
          <div className="font-semibold flex items-center gap-1.5 text-slate-900">
            <Sparkles className="w-4 h-4 text-orange-600" /> What Happens Next:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>The algorithmic matching engine is actively cross-referencing field rescue intakes.</li>
            {faceEmbedStatus === 'stored' && <li>AI face-matching is now active for this case — found-person photographs will be compared against this face profile.</li>}
            <li>If a high-confidence candidate is found, human reviewers will audit evidence before notifying you.</li>
            <li>You can check real-time progress anytime in the Cases Registry.</li>
          </ul>
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
            File Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DemoAutoFillBar
        formType="family"
        onFill={(key) => handleAutoFillDemo(key, false)}
        onFillAndFastForward={(key) => handleAutoFillDemo(key, true)}
        currentStep={currentStep}
        totalSteps={FAMILY_STEPS.length}
      />

      <FormStepWrapper
        steps={FAMILY_STEPS}
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        badgeText="Family Intake Portal"
        badgeColor="emerald"
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

      {/* STEP 1: Basic Identity */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nickname / Alternative Names
              </label>
              <input
                type="text"
                value={formData.alternativeNames}
                onChange={(e) => handleChange('alternativeNames', e.target.value)}
                placeholder="e.g. Guddu / Chintu"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="e.g. 9"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Non-binary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth (if known)
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group (if known)
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Unknown</option>
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Family Contact Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.familyContactPhone}
                  onChange={(e) => {
                    handleChange('familyContactPhone', e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2 text-sm border ${
                    phoneError ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-300 focus:ring-emerald-500'
                  } rounded-lg outline-none focus:ring-2`}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {phoneError}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Authorized MILAN responders may use this number to contact your family regarding this case.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Physical Appearance */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approximate Height (cm)
              </label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => handleChange('heightCm', e.target.value)}
                placeholder="e.g. 130"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approximate Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => handleChange('weightKg', e.target.value)}
                placeholder="e.g. 28"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Body Build
              </label>
              <select
                value={formData.build}
                onChange={(e) => handleChange('build', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Slim">Slim</option>
                <option value="Medium">Medium</option>
                <option value="Heavy">Heavy</option>
                <option value="Athletic">Athletic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skin Tone / Complexion
              </label>
              <input
                type="text"
                value={formData.skinDescription}
                onChange={(e) => handleChange('skinDescription', e.target.value)}
                placeholder="e.g. Wheatish / Fair"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hair Colour
              </label>
              <select
                value={formData.hairColour}
                onChange={(e) => handleChange('hairColour', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Black">Black</option>
                <option value="Dark Brown">Dark Brown</option>
                <option value="Gray">Gray</option>
                <option value="White">White</option>
                <option value="Blonde">Blonde</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eye Colour
              </label>
              <select
                value={formData.eyeColour}
                onChange={(e) => handleChange('eyeColour', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Dark Brown">Dark Brown</option>
                <option value="Brown">Brown</option>
                <option value="Black">Black</option>
                <option value="Hazel">Hazel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hair Description / Style
            </label>
            <input
              type="text"
              value={formData.hairDescription}
              onChange={(e) => handleChange('hairDescription', e.target.value)}
              placeholder="e.g. Short straight hair with slight wave, parted on left"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Clothing & Belongings */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clothing Description (Upper & Lower) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.clothing}
              onChange={(e) => handleChange('clothing', e.target.value)}
              placeholder="e.g. Bright red polo t-shirt with navy collar, blue denim knee-length shorts"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footwear
              </label>
              <input
                type="text"
                value={formData.footwear}
                onChange={(e) => handleChange('footwear', e.target.value)}
                placeholder="e.g. Blue sandals with velcro straps"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jewelry & Accessories
              </label>
              <input
                type="text"
                value={formData.accessories}
                onChange={(e) => handleChange('accessories', e.target.value)}
                placeholder="e.g. Black sacred thread on right wrist with silver charm"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Carried Belongings / Bags
            </label>
            <input
              type="text"
              value={formData.belongings}
              onChange={(e) => handleChange('belongings', e.target.value)}
              placeholder="e.g. Small yellow cartoon water bottle, school pouch"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* STEP 4: Last Known Location */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Last Known Location / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.foundLocation}
              onChange={(e) => handleChange('foundLocation', e.target.value)}
              placeholder="e.g. Alaknanda Riverside Market, Sector 4"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date & Approximate Time Last Observed
            </label>
            <input
              type="datetime-local"
              value={formData.foundAt}
              onChange={(e) => handleChange('foundAt', e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disaster Context & Circumstances
            </label>
            <textarea
              rows={3}
              value={formData.reportNotes}
              onChange={(e) => handleChange('reportNotes', e.target.value)}
              placeholder="Describe how separation occurred (e.g. flash flood evacuation, bridge rush, building collapse)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* STEP 5: Identifying Clues */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50/60 border border-orange-200/80 rounded-xl text-xs text-slate-700 leading-relaxed">
            <strong className="text-orange-900 font-semibold">Key Matching Feature:</strong> Physical clues (scars, birthmarks, accessories) are weighted highest in our algorithm when persons cannot speak their names.
          </div>

          {/* Face Photo Upload — AI Face Matching */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 bg-slate-900 rounded-md flex items-center justify-center text-orange-400 text-[10px] font-bold">AI</span>
              Face Photo — AI Matching (Optional)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a clear, recent photograph of the missing person. The system will generate a face profile to enable AI-assisted face matching with found persons.
              <strong className="text-slate-800"> This does not replace identity verification — it is a candidate-finding tool.</strong>
            </p>
            <FacePhotoUpload
              label="Missing Person Photograph"
              helperText="Clear, front-facing photo required. No groups — only the missing person."
              accentColor="emerald"
              onResult={(result) => setFaceUploadResult(result)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scars & Marks
              </label>
              <input
                type="text"
                value={formData.scars}
                onChange={(e) => handleChange('scars', e.target.value)}
                placeholder="e.g. 2-inch surgical scar on left forearm"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Birthmarks
              </label>
              <input
                type="text"
                value={formData.birthmarks}
                onChange={(e) => handleChange('birthmarks', e.target.value)}
                placeholder="e.g. Small oval birthmark on right shoulder"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tattoos
              </label>
              <input
                type="text"
                value={formData.tattoos}
                onChange={(e) => handleChange('tattoos', e.target.value)}
                placeholder="e.g. None"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Anatomical / Medical Features
              </label>
              <input
                type="text"
                value={formData.anatomicalFeatures}
                onChange={(e) => handleChange('anatomicalFeatures', e.target.value)}
                placeholder="e.g. Wears spectacles, limp on left leg"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Distinguishing Clue (Highest Matching Priority) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.identifyingClue}
              onChange={(e) => handleChange('identifyingClue', e.target.value)}
              placeholder="e.g. Surgical scar across left forearm and black thread with silver charm on right wrist"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* STEP 6: Review & Confirmation */}
      {currentStep === 5 && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              Summary of Report Submission
            </h4>
            <div className="grid grid-cols-2 gap-y-2 text-slate-700">
              <div><strong>Name:</strong> {formData.fullName || 'Not provided'}</div>
              <div><strong>Age / Gender:</strong> {formData.age || 'Unknown'} yrs, {formData.gender}</div>
              <div>
                <strong>Family Contact:</strong>{' '}
                <span className="font-mono font-semibold text-slate-900">
                  {formData.familyContactPhone ? formatIndianPhoneNumber(formData.familyContactPhone) : 'Not provided'}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 ml-1.5">
                  Private
                </span>
              </div>
              <div><strong>Blood Group:</strong> {formData.bloodGroup || 'Unknown'}</div>
              <div><strong>Height / Weight:</strong> {formData.heightCm || '—'} cm, {formData.weightKg || '—'} kg</div>
              <div className="col-span-2"><strong>Clothing:</strong> {formData.clothing || 'Not specified'}</div>
              <div className="col-span-2"><strong>Last Seen:</strong> {formData.foundLocation || 'Not specified'}</div>
              <div className="col-span-2"><strong>Primary Clue:</strong> {formData.identifyingClue || 'Not specified'}</div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Submission Verification:</strong> By submitting, this case will be registered in MILAN under your account. A tracking UID will be assigned and matched against live rescue intakes.
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
