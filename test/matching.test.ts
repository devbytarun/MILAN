// ============================================================
// MILAN Matching Engine & Similarity Tests
// Validates acceptance criteria from implementation_plan.md
// ============================================================

import { diceSimilarity, scoreNumerical, exactMatch } from '../src/lib/similarity.ts';
import { scoreCandidate, scoreAllCandidates } from '../src/lib/matching.ts';
import type { PersonAttributes, CandidateRow } from '../src/types/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('\n--- SIMILARITY HELPERS TESTS ---');

// Test Dice Similarity
assert(diceSimilarity('Veer Kumar', 'Veer Kumar') === 1.0, 'Identical strings have similarity 1.0');
assert(diceSimilarity('Veer Kumar', 'Bir Kumar') > 0.5, 'Spelling variant Veer Kumar vs Bir Kumar has partial similarity');
assert(diceSimilarity('', 'Test') === 0, 'Empty string returns 0');
assert(diceSimilarity(null, 'Test') === 0, 'Null string returns 0');

// Test Numerical Tolerance
assert(scoreNumerical(28, 28, 1, 5) === 1.0, 'Exact age matches 1.0');
assert(scoreNumerical(28, 27, 1, 5) === 1.0, 'Age diff within exact tolerance (1) matches 1.0');
assert(scoreNumerical(28, 30, 1, 5) === 0.75, 'Age diff 2 with tol 1-5 gives 0.75');
assert(scoreNumerical(28, 35, 1, 5) === 0.0, 'Age diff >= max tolerance gives 0.0');

// Test Exact Match
assert(exactMatch('Male', 'male') === 1.0, 'Case-insensitive exact match works');
assert(exactMatch('B+', 'B+') === 1.0, 'Blood group exact match works');
assert(exactMatch('B+', 'A+') === 0.0, 'Different blood group gives 0.0');


console.log('\n--- DEMO SCENARIO 1: VEER KUMAR ---');

const veerMissingAttrs: PersonAttributes = {
  id: 'pa-1',
  report_id: 'r-1',
  full_name: 'Veer Kumar',
  alternative_names: 'Vir, Bir Kumar',
  age: 28,
  approximate_age: null,
  gender: 'Male',
  date_of_birth: null,
  blood_group: 'B+',
  height_cm: 175,
  weight_kg: 72,
  build: 'Medium',
  hair_description: 'Short black hair',
  hair_colour: null,
  eye_colour: 'Brown',
  skin_description: 'Wheatish',
  birthmarks: 'Small birthmark on left forearm',
  scars: 'Scar above right eyebrow from childhood',
  tattoos: null,
  anatomical_features: null,
  clothing: 'Blue denim jacket, grey hiking pants, brown boots',
  footwear: null,
  accessories: null,
  belongings: 'Black backpack, red water bottle',
  identifying_clue: 'Distinctive scar above right eyebrow',
  condition_status: null,
};

const birFoundCandidate: CandidateRow = {
  report_id: 'r-2',
  case_id: 'c-2',
  case_uid: 'MILAN-0002',
  case_type: 'FOUND',
  found_location: 'Bhimtal relief camp, Uttarakhand',
  full_name: 'Bir Kumar',
  alternative_names: null,
  age: 27,
  approximate_age: null,
  gender: 'Male',
  blood_group: null, // NGO did not have blood group
  height_cm: 174,
  weight_kg: null,
  build: 'Medium',
  hair_description: 'Short dark hair',
  hair_colour: null,
  eye_colour: 'Brown',
  skin_description: null,
  birthmarks: null,
  scars: 'Visible scar near right eyebrow',
  tattoos: null,
  anatomical_features: null,
  clothing: 'Blue jacket, grey pants, muddy boots',
  footwear: null,
  accessories: null,
  belongings: null,
  identifying_clue: null,
  condition_status: null,
};

const veerResult = scoreCandidate(veerMissingAttrs, birFoundCandidate, 'Nainital, Uttarakhand');
console.log('Veer Score:', veerResult.score, 'Tier:', veerResult.confidenceTier, 'Completeness:', veerResult.dataCompleteness + '%');
console.log('Explanation:', veerResult.explanation);

assert(veerResult.score >= 75, 'Veer scenario achieves HIGH score (>= 75)');
assert(veerResult.confidenceTier === 'HIGH', 'Veer scenario confidence tier is HIGH');
assert(veerResult.missingFields.includes('blood_group'), 'Missing blood group recorded in missingFields');
assert(!veerResult.conflictingFields.some(f => f.field === 'blood_group'), 'Missing blood group is NOT recorded as a conflict');


console.log('\n--- DEMO SCENARIO 2: UNNAMED CHILD ---');

const ananyaMissingAttrs: PersonAttributes = {
  id: 'pa-3',
  report_id: 'r-3',
  full_name: 'Ananya Sharma',
  alternative_names: null,
  age: 5,
  approximate_age: null,
  gender: 'Female',
  date_of_birth: null,
  blood_group: 'O+',
  height_cm: 105,
  weight_kg: 18,
  build: null,
  hair_description: 'Long black hair with two braids',
  hair_colour: null,
  eye_colour: 'Dark brown',
  skin_description: null,
  birthmarks: 'Heart-shaped birthmark on right shoulder',
  scars: null,
  tattoos: null,
  anatomical_features: null,
  clothing: 'Pink kurta with white flowers, blue jeans, white shoes',
  footwear: null,
  accessories: null,
  belongings: 'Small teddy bear keychain on bag',
  identifying_clue: 'Heart-shaped birthmark on right shoulder',
  condition_status: null,
};

const unnamedFoundCandidate: CandidateRow = {
  report_id: 'r-4',
  case_id: 'c-4',
  case_uid: 'MILAN-0004',
  case_type: 'FOUND',
  found_location: 'Army rescue camp, Haldwani bypass',
  full_name: null, // NAME IS NULL (CANNOT_COMMUNICATE)
  alternative_names: null,
  age: null,
  approximate_age: 4,
  gender: 'Female',
  blood_group: null,
  height_cm: null,
  weight_kg: null,
  build: null,
  hair_description: 'Long dark hair, braided',
  hair_colour: null,
  eye_colour: 'Brown',
  skin_description: null,
  birthmarks: 'Heart-shaped mark on right shoulder area',
  scars: null,
  tattoos: null,
  anatomical_features: null,
  clothing: 'Pink top with flower pattern, blue jeans, no shoes',
  footwear: null,
  accessories: null,
  belongings: 'Small stuffed animal charm',
  identifying_clue: null,
  condition_status: null,
};

const childResult = scoreCandidate(ananyaMissingAttrs, unnamedFoundCandidate, 'Haldwani market area');
console.log('Unnamed Child Score:', childResult.score, 'Tier:', childResult.confidenceTier, 'Completeness:', childResult.dataCompleteness + '%');
console.log('Explanation:', childResult.explanation);

assert(childResult.score >= 75, 'Unnamed child scenario achieves HIGH similarity (>= 75)');
assert(childResult.confidenceTier === 'HIGH', 'Unnamed child confidence tier is HIGH');
assert(childResult.missingFields.includes('name'), 'Name is recorded in missingFields when candidate name is null');


console.log('\n--- EDGE CASE: COMPLETE MISMATCH ---');

const mismatchCandidate: CandidateRow = {
  report_id: 'r-5',
  case_id: 'c-5',
  case_uid: 'MILAN-0005',
  case_type: 'FOUND',
  found_location: 'Chennai, Tamil Nadu',
  full_name: 'Ramesh Patel',
  alternative_names: null,
  age: 65,
  approximate_age: null,
  gender: 'Male',
  blood_group: 'AB-',
  height_cm: 160,
  weight_kg: 85,
  build: 'Heavy',
  hair_description: 'Bald',
  hair_colour: null,
  eye_colour: 'Black',
  skin_description: null,
  birthmarks: null,
  scars: null,
  tattoos: null,
  anatomical_features: null,
  clothing: 'Yellow shirt, white dhoti',
  footwear: null,
  accessories: null,
  belongings: null,
  identifying_clue: null,
  condition_status: null,
};

const mismatchResult = scoreCandidate(ananyaMissingAttrs, mismatchCandidate, 'Haldwani market area');
console.log('Mismatch Score:', mismatchResult.score, 'Tier:', mismatchResult.confidenceTier);
assert(mismatchResult.score < 30, 'Complete mismatch scores < 30');
assert(mismatchResult.confidenceTier === 'LOW', 'Complete mismatch is LOW tier');


console.log('\n--- RANKING TEST ---');

const allResults = scoreAllCandidates(ananyaMissingAttrs, [mismatchCandidate, unnamedFoundCandidate], 'Haldwani market area');
assert(allResults[0].candidateCaseId === unnamedFoundCandidate.case_id, 'Candidate sorting places best match first');

console.log('\n🎉 ALL MATCHING ENGINE AND SIMILARITY TESTS PASSED SUCCESSFULLY!\n');
