import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import type {
  Case,
  Report,
  PersonAttributes,
  CaseStatus,
  CreateCaseWithReportInput,
} from '../types/index.ts';

export interface FullCaseData {
  case: Case;
  report: Report;
  attributes: PersonAttributes;
}

const STORAGE_KEY = 'milan_demo_cases';

export const INITIAL_DEMO_CASES: FullCaseData[] = [
  {
    case: {
      id: 'case-demo-1',
      case_uid: 'MILAN-2026-081',
      case_type: 'MISSING',
      status: 'POSSIBLE_MATCH',
      created_by: 'family-demo',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    report: {
      id: 'rep-demo-1',
      case_id: 'case-demo-1',
      reporter_id: 'family-demo',
      source_type: 'FAMILY',
      comm_status: 'CAN_COMMUNICATE',
      report_notes: 'Separated during sudden flash flood near riverside market.',
      found_location: 'Alaknanda Riverside Market, Sector 4',
      found_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      referral_info: null,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    attributes: {
      id: 'attr-demo-1',
      report_id: 'rep-demo-1',
      full_name: 'Aarav Sharma',
      alternative_names: 'Guddu',
      age: 9,
      approximate_age: 9,
      gender: 'Male',
      date_of_birth: '2017-05-14',
      blood_group: 'B+',
      height_cm: 128,
      weight_kg: 27,
      build: 'Slim',
      hair_description: 'Short straight black hair with small cowlick on crown',
      hair_colour: 'Black',
      eye_colour: 'Dark Brown',
      skin_description: 'Fair to wheatish',
      birthmarks: 'Small oval birthmark on right shoulder',
      scars: 'Prominent 2-inch surgical scar on left forearm from childhood fracture',
      tattoos: null,
      anatomical_features: null,
      clothing: 'Bright red collared polo t-shirt with navy stripes, blue denim shorts',
      footwear: 'Blue sandals with velcro straps',
      accessories: 'Black sacred thread (dhaga) on right wrist with silver charm',
      belongings: 'Small yellow cartoon water bottle',
      identifying_clue: 'Surgical scar on left forearm and black thread with silver charm on right wrist',
      condition_status: null,
    },
  },
  {
    case: {
      id: 'case-demo-2',
      case_uid: 'MILAN-2026-094',
      case_type: 'FOUND',
      status: 'POSSIBLE_MATCH',
      created_by: 'army-demo',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    report: {
      id: 'rep-demo-2',
      case_id: 'case-demo-2',
      reporter_id: 'army-demo',
      source_type: 'ARMY_RESCUE',
      comm_status: 'CANNOT_COMMUNICATE',
      report_notes: 'Child in acute psychological shock, unable to articulate full name or address. Rescued from rooftop near market perimeter.',
      found_location: 'Camp Relief Zone 2 (NDRF Intake)',
      found_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      referral_info: 'Evacuated by NDRF Battalion 4 boat team',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    attributes: {
      id: 'attr-demo-2',
      report_id: 'rep-demo-2',
      full_name: 'Unidentified Minor',
      alternative_names: null,
      age: null,
      approximate_age: 9,
      gender: 'Male',
      date_of_birth: null,
      blood_group: 'B+',
      height_cm: 130,
      weight_kg: 26,
      build: 'Slim',
      hair_description: 'Short black hair, damp/mud-stained',
      hair_colour: 'Black',
      eye_colour: 'Dark Brown',
      skin_description: 'Wheatish, mild scratches on cheeks',
      birthmarks: 'Faint birthmark right upper arm',
      scars: 'Noticeable surgical scar across left forearm',
      tattoos: null,
      anatomical_features: null,
      clothing: 'Red collared polo shirt (soiled), dark shorts',
      footwear: 'One blue sandal recovered',
      accessories: 'Black thread on right wrist with metallic charm',
      belongings: null,
      identifying_clue: 'Left forearm surgical scar; black wrist thread with charm',
      condition_status: 'Stable, minor abrasions, non-verbal due to trauma shock',
    },
  },
  {
    case: {
      id: 'case-demo-3',
      case_uid: 'MILAN-2026-065',
      case_type: 'MISSING',
      status: 'VERIFIED_MATCH',
      created_by: 'family-demo',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    report: {
      id: 'rep-demo-3',
      case_id: 'case-demo-3',
      reporter_id: 'family-demo',
      source_type: 'FAMILY',
      comm_status: 'CAN_COMMUNICATE',
      report_notes: 'Elderly grandmother separated during bridge colony evacuation.',
      found_location: 'Bridge Colony, Block C',
      found_at: new Date(Date.now() - 3600000 * 14).toISOString(),
      referral_info: null,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    attributes: {
      id: 'attr-demo-3',
      report_id: 'rep-demo-3',
      full_name: 'Meera Sen',
      alternative_names: 'Dida',
      age: 64,
      approximate_age: 64,
      gender: 'Female',
      date_of_birth: '1962-08-20',
      blood_group: 'O+',
      height_cm: 155,
      weight_kg: 58,
      build: 'Medium',
      hair_description: 'Gray and white curly hair tied in bun',
      hair_colour: 'Gray',
      eye_colour: 'Brown',
      skin_description: 'Fair',
      birthmarks: null,
      scars: null,
      tattoos: null,
      anatomical_features: 'Wears bifocal spectacles with golden metal frame',
      clothing: 'Green cotton saree with maroon border',
      footwear: 'Brown leather slippers',
      accessories: 'Gold chain with rudraksha bead',
      belongings: 'Canvas shoulder bag with blood pressure prescription',
      identifying_clue: 'Bifocal glasses, rudraksha gold chain',
      condition_status: null,
    },
  },
  {
    case: {
      id: 'case-demo-4',
      case_uid: 'MILAN-2026-102',
      case_type: 'FOUND',
      status: 'SEARCHING',
      created_by: 'hospital-demo',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    report: {
      id: 'rep-demo-4',
      case_id: 'case-demo-4',
      reporter_id: 'hospital-demo',
      source_type: 'HOSPITAL',
      comm_status: 'CANNOT_COMMUNICATE',
      report_notes: 'Admitted via Army ambulance from Sector 9 bridge collapse. Unconscious on arrival.',
      found_location: 'City Trauma Center (Emergency Ward, Bed 14)',
      found_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      referral_info: 'Ambulance #NDRF-07',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    attributes: {
      id: 'attr-demo-4',
      report_id: 'rep-demo-4',
      full_name: 'Unknown Adult Male',
      alternative_names: null,
      age: null,
      approximate_age: 40,
      gender: 'Male',
      date_of_birth: null,
      blood_group: 'A+',
      height_cm: 172,
      weight_kg: 70,
      build: 'Athletic',
      hair_description: 'Short black hair with slight receding hairline',
      hair_colour: 'Black',
      eye_colour: 'Dark Brown',
      skin_description: 'Tanned/wheatish',
      birthmarks: null,
      scars: 'Old appendectomy scar',
      tattoos: 'Om tattoo on inner right wrist',
      anatomical_features: null,
      clothing: 'Torn grey athletic hoodie, black track pants',
      footwear: 'None',
      accessories: 'Silver ring on left ring finger',
      belongings: 'Waterlogged Casio digital watch',
      identifying_clue: 'Om tattoo on inner right wrist, Casio watch',
      condition_status: 'Moderate head concussion, receiving IV fluids, responsive to tactile stimuli',
    },
  },
];

export function getLocalCases(): FullCaseData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CASES));
    return INITIAL_DEMO_CASES;
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CASES));
    return INITIAL_DEMO_CASES;
  }
}

export function saveLocalCase(newCase: FullCaseData) {
  const current = getLocalCases();
  const updated = [newCase, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateCaseStatus(caseId: string, status: CaseStatus) {
  const current = getLocalCases();
  const updated = current.map((item) => {
    if (item.case.id === caseId) {
      return {
        ...item,
        case: { ...item.case, status, updated_at: new Date().toISOString() },
      };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function submitCaseReport(input: CreateCaseWithReportInput): Promise<{
  success: boolean;
  caseUid?: string;
  caseId?: string;
  error?: string;
}> {
  // Generate friendly Milan UID: MILAN-YYYY-XXX
  const randomNum = Math.floor(100 + Math.random() * 900);
  const generatedUid = `MILAN-${new Date().getFullYear()}-${randomNum}`;
  const caseId = `case-${Date.now()}`;
  const reportId = `rep-${Date.now()}`;
  const attrId = `attr-${Date.now()}`;

  const fullRecord: FullCaseData = {
    case: {
      id: caseId,
      case_uid: generatedUid,
      case_type: input.p_case_type,
      status: 'SUBMITTED',
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    report: {
      id: reportId,
      case_id: caseId,
      reporter_id: 'current-user',
      source_type: input.p_source_type,
      comm_status: input.p_comm_status || 'UNKNOWN',
      report_notes: input.p_report_notes || null,
      found_location: input.p_found_location || null,
      found_at: input.p_found_at || new Date().toISOString(),
      referral_info: input.p_referral_info || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    attributes: {
      id: attrId,
      report_id: reportId,
      full_name: input.p_full_name || null,
      alternative_names: input.p_alternative_names || null,
      age: input.p_age || null,
      approximate_age: input.p_approximate_age || null,
      gender: input.p_gender || null,
      date_of_birth: input.p_date_of_birth || null,
      blood_group: input.p_blood_group || null,
      height_cm: input.p_height_cm || null,
      weight_kg: input.p_weight_kg || null,
      build: input.p_build || null,
      hair_description: input.p_hair_description || null,
      hair_colour: input.p_hair_colour || null,
      eye_colour: input.p_eye_colour || null,
      skin_description: input.p_skin_description || null,
      birthmarks: input.p_birthmarks || null,
      scars: input.p_scars || null,
      tattoos: input.p_tattoos || null,
      anatomical_features: input.p_anatomical_features || null,
      clothing: input.p_clothing || null,
      footwear: input.p_footwear || null,
      accessories: input.p_accessories || null,
      belongings: input.p_belongings || null,
      identifying_clue: input.p_identifying_clue || null,
      condition_status: input.p_condition_status || null,
    },
  };

  saveLocalCase(fullRecord);

  // If Supabase is configured with active keys, persist to database
  if (isSupabaseConfigured) {
    try {
      await supabase.rpc('create_case_with_report', {
        p_case_type: input.p_case_type,
        p_source_type: input.p_source_type,
        p_comm_status: input.p_comm_status,
        p_report_notes: input.p_report_notes,
        p_found_location: input.p_found_location,
        p_found_at: input.p_found_at,
        p_referral_info: input.p_referral_info,
        p_full_name: input.p_full_name,
        p_alternative_names: input.p_alternative_names,
        p_age: input.p_age,
        p_approximate_age: input.p_approximate_age,
        p_gender: input.p_gender,
        p_date_of_birth: input.p_date_of_birth,
        p_blood_group: input.p_blood_group,
        p_height_cm: input.p_height_cm,
        p_weight_kg: input.p_weight_kg,
        p_build: input.p_build,
        p_hair_description: input.p_hair_description,
        p_hair_colour: input.p_hair_colour,
        p_eye_colour: input.p_eye_colour,
        p_skin_description: input.p_skin_description,
        p_birthmarks: input.p_birthmarks,
        p_scars: input.p_scars,
        p_tattoos: input.p_tattoos,
        p_anatomical_features: input.p_anatomical_features,
        p_clothing: input.p_clothing,
        p_footwear: input.p_footwear,
        p_accessories: input.p_accessories,
        p_belongings: input.p_belongings,
        p_identifying_clue: input.p_identifying_clue,
        p_condition_status: input.p_condition_status,
      });
    } catch (e) {
      console.warn('Supabase remote sync warning (using local store):', e);
    }
  }

  return { success: true, caseUid: generatedUid, caseId };
}
