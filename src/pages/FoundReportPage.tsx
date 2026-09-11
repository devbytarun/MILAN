import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormStepWrapper, FormStep } from '../components/forms/FormStepWrapper.tsx';
import { submitCaseReport } from '../services/caseService.ts';
import type { CommunicationStatus } from '../types/index.ts';
import {
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

const FOUND_STEPS: FormStep[] = [
  { id: 'comm', title: 'Communication Status', subtitle: 'Determine if survivor can provide their own details' },
  { id: 'details', title: 'Survivor Attributes', subtitle: 'Identity or observational physical characteristics' },
  { id: 'shelter', title: 'Camp / Shelter Location', subtitle: 'Intake location, date/time, and rescue unit' },
  { id: 'review', title: 'Review & Submit', subtitle: 'Confirm details and generate Milan Found UID' },
];

export const FoundReportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUid, setSubmittedUid] = useState<string | null>(null);

  const [commStatus, setCommStatus] = useState<CommunicationStatus>('CANNOT_COMMUNICATE');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    approximateAge: '',
    gender: 'Male',
    bloodGroup: '',
    build: 'Slim',
    hairColour: 'Black',
    clothing: '',
    footwear: '',
    accessories: '',
    birthmarks: '',
    scars: '',
    tattoos: '',
    identifyingClue: '',
    foundLocation: 'Camp Relief Zone 2 (NDRF Intake)',
    foundAt: new Date().toISOString().slice(0, 16),
    referralInfo: 'Evacuated by NDRF Battalion 4',
    reportNotes: '',
    conditionStatus: 'Stable, responsive',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < FOUND_STEPS.length - 1) {
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
      p_source_type: 'NGO',
      p_comm_status: commStatus,
      p_full_name: commStatus === 'CAN_COMMUNICATE' && formData.fullName ? formData.fullName : 'Unidentified Survivor',
      p_approximate_age: formData.approximateAge ? parseInt(formData.approximateAge, 10) : undefined,
      p_gender: formData.gender,
      p_blood_group: formData.bloodGroup || undefined,
      p_build: formData.build || undefined,
      p_hair_colour: formData.hairColour || undefined,
      p_clothing: formData.clothing || undefined,
      p_footwear: formData.footwear || undefined,
      p_accessories: formData.accessories || undefined,
      p_birthmarks: formData.birthmarks || undefined,
      p_scars: formData.scars || undefined,
      p_tattoos: formData.tattoos || undefined,
      p_identifying_clue: formData.identifyingClue || undefined,
      p_found_location: formData.foundLocation,
      p_found_at: formData.foundAt,
      p_referral_info: formData.referralInfo,
      p_report_notes: formData.reportNotes,
      p_condition_status: formData.conditionStatus,
    });

    setSubmitting(false);
    if (res.success && res.caseUid) {
      setSubmittedUid(res.caseUid);
    }
  };

  if (submittedUid) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-blue-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Found Person Intake Registered
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">
            Case Assigned to Shelter Registry
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            The record is live and actively matched against missing person inquiries from family members.
          </p>
        </div>

        {/* UID Box */}
        <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md max-w-sm mx-auto space-y-1">
          <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-widest">
            Milan Found UID
          </div>
          <div className="text-3xl font-mono font-extrabold tracking-wider text-blue-400">
            {submittedUid}
          </div>
          <div className="text-[11px] text-slate-400">
            Reference this UID on camp identification badges and triage logs.
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
            onClick={() => {
              setSubmittedUid(null);
              setCurrentStep(0);
            }}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Intake Next Person
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormStepWrapper
      steps={FOUND_STEPS}
      currentStep={currentStep}
      onPrev={handlePrev}
      onNext={handleNext}
      onSubmit={handleSubmit}
      isSubmitting={submitting}
      badgeText="Rescue Camp Intake"
      badgeColor="blue"
    >
      {/* STEP 1: Communication Status */}
      {currentStep === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              Can the rescued person communicate their identity? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'CANNOT_COMMUNICATE',
                  title: 'Cannot Communicate',
                  desc: 'Unconscious, trauma shock, infant/toddler, or severe cognitive distress.',
                  badge: 'Observation-Only Intake',
                },
                {
                  id: 'CAN_COMMUNICATE',
                  title: 'Can Communicate',
                  desc: 'Person is conscious and articulates full or partial identity details.',
                  badge: 'Self-Reported Intake',
                },
                {
                  id: 'UNKNOWN',
                  title: 'Uncertain / Intermittent',
                  desc: 'Delirious, language barrier, or fluctuating consciousness.',
                  badge: 'Hybrid Intake',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setCommStatus(opt.id as CommunicationStatus)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    commStatus === opt.id
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                      {commStatus === opt.id ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {opt.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Survivor Attributes (Branching) */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {commStatus === 'CAN_COMMUNICATE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Self-Reported Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated / Apparent Age <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.approximateAge}
                onChange={(e) => handleChange('approximateAge', e.target.value)}
                placeholder="e.g. 9"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Indeterminate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apparent Build
              </label>
              <select
                value={formData.build}
                onChange={(e) => handleChange('build', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Slim">Slim</option>
                <option value="Medium">Medium</option>
                <option value="Heavy">Heavy</option>
                <option value="Athletic">Athletic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observed Clothing on Recovery <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.clothing}
              onChange={(e) => handleChange('clothing', e.target.value)}
              placeholder="e.g. Soiled red collared polo shirt, dark blue shorts"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observable Scars / Surgical Marks
              </label>
              <input
                type="text"
                value={formData.scars}
                onChange={(e) => handleChange('scars', e.target.value)}
                placeholder="e.g. Visible surgical scar across left forearm"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Accessories / Threads / Jewelry
              </label>
              <input
                type="text"
                value={formData.accessories}
                onChange={(e) => handleChange('accessories', e.target.value)}
                placeholder="e.g. Black thread on right wrist with metallic charm"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Key Identifying Clue (High Priority Matcher) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.identifyingClue}
              onChange={(e) => handleChange('identifyingClue', e.target.value)}
              placeholder="e.g. Left forearm surgical scar, black wrist thread with charm"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Camp & Shelter Location */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shelter Camp Location / Zone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.foundLocation}
              onChange={(e) => handleChange('foundLocation', e.target.value)}
              placeholder="e.g. Camp Relief Zone 2 (NDRF Intake)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date & Time of Shelter Admission
              </label>
              <input
                type="datetime-local"
                value={formData.foundAt}
                onChange={(e) => handleChange('foundAt', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rescue Unit / Rescuing Agency
              </label>
              <input
                type="text"
                value={formData.referralInfo}
                onChange={(e) => handleChange('referralInfo', e.target.value)}
                placeholder="e.g. NDRF Battalion 4 Evacuation Boat #2"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Survivor Status / Condition Notes
            </label>
            <input
              type="text"
              value={formData.conditionStatus}
              onChange={(e) => handleChange('conditionStatus', e.target.value)}
              placeholder="e.g. Physically stable, non-verbal due to acute trauma shock"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* STEP 4: Review & Submit */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              Found Survivor Intake Summary
            </h4>
            <div className="grid grid-cols-2 gap-y-2 text-slate-700">
              <div><strong>Status:</strong> {commStatus}</div>
              <div><strong>Apparent Age:</strong> ~{formData.approximateAge || 'Unknown'} yrs, {formData.gender}</div>
              <div><strong>Camp:</strong> {formData.foundLocation}</div>
              <div><strong>Unit:</strong> {formData.referralInfo}</div>
              <div className="col-span-2"><strong>Clothing:</strong> {formData.clothing || '—'}</div>
              <div className="col-span-2"><strong>Key Clues:</strong> {formData.identifyingClue || '—'}</div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              This report creates an official `FOUND` case. The matching pipeline will cross-match it against missing child and family records immediately.
            </div>
          </div>
        </div>
      )}
    </FormStepWrapper>
  );
};
