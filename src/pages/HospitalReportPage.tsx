import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormStepWrapper, FormStep } from '../components/forms/FormStepWrapper.tsx';
import { submitCaseReport } from '../services/caseService.ts';
import {
  CheckCircle2,
  Lock,
  Search,
} from 'lucide-react';

const HOSPITAL_STEPS: FormStep[] = [
  { id: 'triage', title: 'Hospital Referral & Triage', subtitle: 'Link existing Milan UID or register new clinical patient' },
  { id: 'clinical', title: 'Medical & Anatomical Observations', subtitle: 'Blood group, trauma marks, scars and clinical status' },
  { id: 'review', title: 'Review & Medical Privacy Lock', subtitle: 'Confirm clinical intake under HIPAA / Disaster Medical Privacy' },
];

export const HospitalReportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);

  const [hasExistingUid, setHasExistingUid] = useState(false);
  const [existingUid, setExistingUid] = useState('');

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    setSubmitting(false);
    if (res.success && res.caseUid) {
      setSubmittedUid(res.caseUid);
    }
  };

  if (submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-purple-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Clinical Patient Registered
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Hospital Case Synchronized
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Patient record created with privacy protection for clinical diagnostics.
          </p>
        </div>

        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md max-w-sm mx-auto space-y-1">
          <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-widest">
            Case Clinical UID
          </div>
          <div className="text-3xl font-mono font-extrabold tracking-wider text-purple-400">
            {submittedUid}
          </div>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-left text-xs text-purple-950 flex items-start gap-2">
          <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <strong>Medical Privacy Active:</strong> Sensitive clinical details (condition, surgical history) are strictly quarantined to Hospital and Admin roles.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/cases"
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
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
            Admit Another Patient
          </button>
        </div>
      </div>
    );
  }

  return (
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
      {/* STEP 1: Referral & Triage */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
            <div className="text-xs text-purple-900 font-medium">
              Did patient arrive with an existing Milan UID (from NGO or Army referral)?
            </div>
            <button
              type="button"
              onClick={() => setHasExistingUid(!hasExistingUid)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                hasExistingUid ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
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
    </FormStepWrapper>
  );
};
