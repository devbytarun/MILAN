// ============================================================
// MILAN — HackX 4.0 Innovations Test Suite
// Validates:
// 1. Voice & Radio Natural Language Parser
// 2. Explainable Evidence & Forensic Dossier Engine
// 3. Offline Disaster Queue & Storage Engine
// 4. Anti-Trafficking Child Handover Safeguards
// ============================================================

import { parseDisasterVoiceTranscript } from '../src/lib/voice-parser.ts';
import { generateVerificationDossier } from '../src/lib/dossier.ts';
import { enqueueOfflineReport, getOfflineQueue, getPendingOfflineCount, offlineStorage } from '../src/lib/offline-sync.ts';
import { evaluateChildSafeguards, issueHandoverCertificate } from '../src/lib/anti-trafficking.ts';
import { scoreCandidate } from '../src/lib/matching.ts';
import type { PersonAttributes, CandidateRow, CreateCaseWithReportInput } from '../src/types/index.ts';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

console.log('\n========================================');
console.log('1. TESTING VOICE & RADIO PARSER');
console.log('========================================');

// Test Case 1: English Child Radio Report
const radioLog1 = "Found an unconscious girl, around 4 years old, near the Haldwani bypass bridge. Wearing pink floral top with blue denim pants. Has a small heart-shaped birthmark on right shoulder. She cannot speak due to shock.";
const parsed1 = parseDisasterVoiceTranscript(radioLog1);

console.log('Parsed Child Entities:', parsed1.extractedEntities.map(e => `${e.field}: ${e.value}`));
assert(parsed1.attributes.p_gender === 'Female', 'Voice parser detects Female gender');
assert(parsed1.attributes.p_approximate_age === 4, 'Voice parser detects approximate age 4');
assert(parsed1.attributes.p_comm_status === 'CANNOT_COMMUNICATE', 'Voice parser detects non-verbal status');
assert(parsed1.attributes.p_clothing?.includes('pink') === true, 'Voice parser captures clothing colors');
assert(parsed1.attributes.p_birthmarks?.includes('heart') === true, 'Voice parser extracts heart birthmark');
assert(parsed1.attributes.p_found_location?.toLowerCase().includes('haldwani') === true, 'Voice parser identifies Haldwani location');
assert(parsed1.confidence >= 80, 'High extraction confidence for complete radio transcript');

// Test Case 2: Hinglish Rescuer Log
const radioLog2 = "Ek ladka mila Bhimtal relief camp ke paas. Umar lagbhag 28 saal. Blue denim jacket pehni hai. Right eyebrow ke upar scar hai. Blood group B+ bataya. Name is Bir Kumar.";
const parsed2 = parseDisasterVoiceTranscript(radioLog2);

console.log('Parsed Hinglish Entities:', parsed2.extractedEntities.map(e => `${e.field}: ${e.value}`));
assert(parsed2.attributes.p_gender === 'Male', 'Detects Male gender from Hinglish');
assert(parsed2.attributes.p_blood_group === 'B+', 'Extracts blood group B+');
assert(parsed2.attributes.p_full_name === 'Bir Kumar', 'Extracts self-reported name Bir Kumar');
assert(parsed2.attributes.p_scars?.includes('scar') === true, 'Extracts eyebrow scar');


console.log('\n========================================');
console.log('2. TESTING EVIDENCE DOSSIER & DISCREPANCIES');
console.log('========================================');

const veerSource: PersonAttributes = {
  id: 'pa-v1', report_id: 'r-v1', full_name: 'Veer Kumar', alternative_names: 'Vir, Bir Kumar',
  age: 28, approximate_age: null, gender: 'Male', date_of_birth: null, blood_group: 'B+',
  height_cm: 175, weight_kg: 72, build: 'Medium', hair_description: 'Short black',
  hair_colour: 'Black', eye_colour: 'Brown', skin_description: 'Wheatish',
  birthmarks: null, scars: 'Scar above right eyebrow', tattoos: null, anatomical_features: null,
  clothing: 'Blue denim jacket, grey pants', footwear: 'Boots', accessories: null, belongings: null,
  identifying_clue: null, condition_status: null,
};

const birCand: CandidateRow = {
  report_id: 'r-b1', case_id: 'c-b1', case_uid: 'MILAN-0002', case_type: 'FOUND',
  found_location: 'Bhimtal camp', full_name: 'Bir Kumar', alternative_names: null,
  age: 27, approximate_age: null, gender: 'Male', blood_group: null, // missing
  height_cm: 174, weight_kg: null, build: 'Medium', hair_description: 'Short dark',
  hair_colour: null, eye_colour: 'Brown', skin_description: null, birthmarks: null,
  scars: 'Visible scar near right eyebrow', tattoos: null, anatomical_features: null,
  clothing: 'Blue jacket, grey pants', footwear: null, accessories: null, belongings: null,
  identifying_clue: null, condition_status: 'Stable',
};

const matchRes = scoreCandidate(veerSource, birCand, 'Nainital');
const dossier = generateVerificationDossier(matchRes, 'MILAN-0001', 'MILAN-0002');

console.log('Dossier Recommendation:', dossier.recommendation);
console.log('Dossier Discrepancy Count:', dossier.discrepancyAlerts.length);
assert(dossier.recommendation === 'APPROVE_RECOMMENDED', 'High-confidence Veer match recommended for approval');
assert(dossier.discrepancyAlerts.some(a => a.field === 'blood_group' && a.severity === 'DATA_GAP'), 'Missing blood group flagged as DATA_GAP');
assert(dossier.officialDossierText.includes('MILAN DISASTER REUNIFICATION DOSSIER'), 'Generated official printable certificate text');


console.log('\n========================================');
console.log('3. TESTING OFFLINE BLACKOUT QUEUE');
console.log('========================================');

offlineStorage.clear();
assert(getPendingOfflineCount() === 0, 'Offline queue starts empty');

const offlinePayload: CreateCaseWithReportInput = {
  p_case_type: 'FOUND',
  p_source_type: 'ARMY_RESCUE',
  p_gender: 'Female',
  p_approximate_age: 4,
  p_clothing: 'Pink top, blue jeans',
  p_found_location: 'Haldwani bypass',
};

const queued = enqueueOfflineReport(offlinePayload);
console.log('Queued Offline Report ID:', queued.id);
assert(getPendingOfflineCount() === 1, 'Offline report successfully queued in local storage');
const queue = getOfflineQueue();
assert(queue[0].payload.p_found_location === 'Haldwani bypass', 'Queued payload persisted accurately');


console.log('\n========================================');
console.log('4. TESTING ANTI-TRAFFICKING SAFEGUARDS');
console.log('========================================');

// Test A: Minor cannot be handed over without guardian proof
const minorCheck = evaluateChildSafeguards(4, null, undefined);
assert(minorCheck.isMinor === true, 'Correctly identifies child as minor');
assert(minorCheck.allowedToClose === false, 'Blocks handover without verified guardian proof');
assert(minorCheck.alerts.some(a => a.includes('VICTIM IS A MINOR')), 'Engages mandatory minor protection alert');

// Test B: Authorized handover with officer sign-off
const cert = issueHandoverCertificate({
  caseUid: 'MILAN-0004',
  victimName: 'Ananya Sharma',
  age: 4,
  approximateAge: null,
  guardianProof: {
    docType: 'AADHAAR',
    docNumberMasked: 'XXXX-XXXX-9874',
    claimantName: 'Ravi Sharma',
    relationshipToVictim: 'PARENT',
    verifiedByOfficerId: 'NDRF-OFFICER-741',
    verifiedAt: new Date().toISOString(),
  },
  campOfficerName: 'Capt. S. Sengupta',
  campOfficerBadge: 'NDRF-HQ-482',
  handoverLocation: 'Haldwani Emergency Relief Camp #2',
});

console.log('Generated Verification Token:', cert.verificationToken);
assert(cert.currentStage === 'REUNIFICATION_COMPLETED', 'Advances stage to REUNIFICATION_COMPLETED');
assert(cert.verificationToken.startsWith('MILAN-SAFE-'), 'Generates cryptographic tamper-proof audit token');

console.log('\n🎉 ALL HACKX 4.0 INNOVATION SUITES PASSED FLAWLESSLY!\n');
