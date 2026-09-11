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

const FAMILY_STEPS: FormStep[] = [
  { id: 'identity', title: 'Basic Identity', subtitle: 'Name, age, gender and blood group' },
  { id: 'appearance', title: 'Physical Appearance', subtitle: 'Height, build, hair and eye details' },
  { id: 'clothing', title: 'Clothing & Belongings', subtitle: 'What the missing person was wearing' },
  { id: 'incident', title: 'Last Known Location', subtitle: 'Date, time, and last observed location' },
  { id: 'clues', title: 'Identifying Clues', subtitle: 'Scars, birthmarks, tattoos, distinguishing features' },
  { id: 'review', title: 'Review & Submit', subtitle: 'Confirm all details before generating Milan UID' },
];

export const FamilyReportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    alternativeNames: '',
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
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
    setSubmitting(true);
    const res = await submitCaseReport({
      p_case_type: 'MISSING',
      p_source_type: 'FAMILY',
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

    setSubmitting(false);
    if (res.success && res.caseUid) {
      setSubmittedUid(res.caseUid);
    }
  };

  // Success Confirmation Screen
  if (submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-emerald-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Report Successfully Filed
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Missing Person Case Created
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Your report has been broadcast to all active camp rescue shelters and hospital triage registries.
          </p>
        </div>

        {/* UID Box */}
        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md max-w-sm mx-auto space-y-1">
          <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-widest">
            Case Identification UID
          </div>
          <div className="text-3xl font-mono font-extrabold tracking-wider text-emerald-400">
            {submittedUid}
          </div>
          <div className="text-[11px] text-slate-400">
            Save this UID to track case status or quote to relief officers.
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs text-emerald-950 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> What Happens Next:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-emerald-900">
            <li>The algorithmic matching engine is actively cross-referencing field rescue intakes.</li>
            <li>If a high-confidence candidate is found, human reviewers will audit evidence before notifying you.</li>
            <li>You can check real-time progress anytime in the Cases Registry.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/cases"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Search className="w-4 h-4" /> View in Cases Registry
          </Link>
          <button
            onClick={() => {
              setSubmittedUid(null);
              setCurrentStep(0);
            }}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            File Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <strong>Key Matching Feature:</strong> Physical clues (scars, birthmarks, accessories) are weighted highest in our algorithm when persons cannot speak their names.
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
    </FormStepWrapper>
  );
};
