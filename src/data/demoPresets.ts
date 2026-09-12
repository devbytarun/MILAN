/**
 * MILAN - Presentation Demo Presets
 * Pre-configured realistic disaster scenarios for live judging presentations.
 */

export interface FamilyDemoPreset {
  fullName: string;
  alternativeNames: string;
  age: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  heightCm: string;
  weightKg: string;
  build: string;
  hairDescription: string;
  hairColour: string;
  eyeColour: string;
  skinDescription: string;
  clothing: string;
  footwear: string;
  accessories: string;
  belongings: string;
  foundLocation: string;
  foundAt: string;
  reportNotes: string;
  birthmarks: string;
  scars: string;
  tattoos: string;
  anatomicalFeatures: string;
  identifyingClue: string;
}

export interface FoundDemoPreset {
  commStatus: 'CAN_COMMUNICATE' | 'CANNOT_COMMUNICATE' | 'UNKNOWN';
  fullName: string;
  approximateAge: string;
  gender: string;
  bloodGroup: string;
  build: string;
  hairColour: string;
  clothing: string;
  footwear: string;
  accessories: string;
  birthmarks: string;
  scars: string;
  tattoos: string;
  identifyingClue: string;
  foundLocation: string;
  foundAt: string;
  referralInfo: string;
  reportNotes: string;
  conditionStatus: string;
}

export interface HospitalDemoPreset {
  hospitalName: string;
  wardBed: string;
  referralAmbulance: string;
  fullName: string;
  approximateAge: string;
  gender: string;
  bloodGroup: string;
  weightKg: string;
  conditionStatus: string;
  anatomicalFeatures: string;
  clothing: string;
  accessories: string;
  identifyingClue: string;
  reportNotes: string;
}

export const DEMO_PRESETS = {
  // --------------------------------------------------------------------------
  // Primary Presentation Case: Aarav Sharma (Child, 6) — Alaknanda Flash Flood
  // --------------------------------------------------------------------------
  aarav_child: {
    key: 'aarav_child',
    name: 'Aarav Sharma (Child, 6 yrs) — Alaknanda Flood',
    shortName: 'Aarav Sharma (Child, 6)',
    badge: 'PRIMARY DEMO SCENARIO',
    description: 'Separated 6yo child with Batman t-shirt, right eyebrow scar, and black wrist thread.',
    family: {
      fullName: 'Aarav Sharma',
      alternativeNames: 'Golu / Chhotu',
      age: '6',
      gender: 'Male',
      dateOfBirth: '2020-03-14',
      bloodGroup: 'B+',
      heightCm: '115',
      weightKg: '20',
      build: 'Slim',
      hairDescription: 'Short wavy black hair, side parting',
      hairColour: 'Black',
      eyeColour: 'Dark Brown',
      skinDescription: 'Fair / Wheatish complexion',
      clothing: 'Blue superhero Batman t-shirt, dark denim shorts with red stitching',
      footwear: 'Blue Velcro running sneakers with light-up soles',
      accessories: 'Black protective sacred thread around right wrist',
      belongings: 'Small red emergency safety whistle worn on lanyard',
      foundLocation: 'Alaknanda Riverside Market, Lower Ghats Sector 2',
      foundAt: new Date().toISOString().slice(0, 16),
      reportNotes: 'Separated during sudden flash flood surge at riverside market. Speaks Hindi and basic English. Answers to nickname Golu. High priority minor search inquiry.',
      birthmarks: 'Small oval brown birthmark on upper left shoulder',
      scars: 'Distinct 2cm curved scar above right eyebrow from childhood fall',
      tattoos: '',
      anatomicalFeatures: 'Slight gap between front upper milk teeth',
      identifyingClue: 'Curved right eyebrow scar, black wrist thread, red whistle lanyard',
    } as FamilyDemoPreset,

    found: {
      commStatus: 'CANNOT_COMMUNICATE' as const,
      fullName: '',
      approximateAge: '6',
      gender: 'Male',
      bloodGroup: 'B+',
      build: 'Slim',
      hairColour: 'Black',
      clothing: 'Mud-stained blue Batman t-shirt, dark denim shorts',
      footwear: 'Single blue Velcro running sneaker on left foot',
      accessories: 'Black protective thread on right wrist, red whistle lanyard',
      birthmarks: 'Small oval birthmark on left shoulder blade',
      scars: 'Visible 2cm curved scar above right eyebrow',
      tattoos: '',
      identifyingClue: 'Right eyebrow scar, black sacred wrist thread, red whistle',
      foundLocation: 'Camp Relief Zone 4 (Alaknanda Downstream River Basin)',
      foundAt: new Date().toISOString().slice(0, 16),
      referralInfo: 'Evacuated from debris by NDRF Battalion 8 Rescue Boat #3',
      reportNotes: 'Child pulled from flooded riverbank by NDRF rescue boat. Non-verbal due to acute shock and hypothermia. Transferred to Camp 4 child welfare tent under protective custody.',
      conditionStatus: 'Exhausted, mild hypothermia, stable vital signs, non-verbal from shock',
    } as FoundDemoPreset,

    hospital: {
      hospitalName: 'Rishikesh Emergency Disaster Trauma Center',
      wardBed: 'Pediatric Emergency Ward, Bed #08',
      referralAmbulance: 'Ambulance NDRF-Air-02 (Helicopter Evac)',
      fullName: 'Unidentified Minor Child (Ref: Aarav S.)',
      approximateAge: '6',
      gender: 'Male',
      bloodGroup: 'B+',
      weightKg: '20',
      conditionStatus: 'Mild hypothermia treated, minor forehead abrasion sutured, stable vital signs, responsive to calm speech',
      anatomicalFeatures: 'Sutured 2cm laceration above right eyebrow over existing scar, small mole left shoulder',
      clothing: 'Blue superhero t-shirt (Batman motif), dark shorts (stored in hospital locker #08)',
      accessories: 'Black thread around right wrist (kept on patient)',
      identifyingClue: 'Curved scar above right eyebrow, black sacred wrist thread',
      reportNotes: 'Admitted from flash flood zone via NDRF helicopter. Patient unable to state full home address or contact number. Under continuous pediatric observation.',
    } as HospitalDemoPreset,

    voiceTranscript: `Control, this is NDRF Battalion 8 Boat 3 reporting. We pulled a 6-year-old male child from the flooded riverbank near Alaknanda market. The boy is in shock and non-verbal. He is wearing a blue Batman superhero t-shirt with dark denim shorts, and one blue Velcro sneaker. He has a distinct curved scar above his right eyebrow, a small brown mole on his left shoulder, and a black sacred thread tied on his right wrist with a small red whistle lanyard. Blood group B+, slim build, short black wavy hair. Currently transferring to Camp Relief Zone 4 child welfare tent. Over.`,
  },

  // --------------------------------------------------------------------------
  // Secondary Presentation Case: Veer Kumar (Adult, 24) — Bhimtal Landslide
  // --------------------------------------------------------------------------
  veer_adult: {
    key: 'veer_adult',
    name: 'Veer Kumar (Adult, 24 yrs) — Bhimtal Landslide',
    shortName: 'Veer Kumar (Adult, 24)',
    badge: 'ADULT TRIAGE SCENARIO',
    description: 'Athletic 24yo male survivor with forearm mountain tattoo, Casio watch, and ACL scar.',
    family: {
      fullName: 'Veer Kumar Singhania',
      alternativeNames: 'Veer / Viru',
      age: '24',
      gender: 'Male',
      dateOfBirth: '2002-08-10',
      bloodGroup: 'O+',
      heightCm: '184',
      weightKg: '78',
      build: 'Athletic',
      hairDescription: 'Long black wavy hair, usually tied in a low bun',
      hairColour: 'Black',
      eyeColour: 'Dark Brown',
      skinDescription: 'Wheatish athletic build',
      clothing: 'Grey sports hoodie with zip, dark track pants',
      footwear: 'Grey trekking boots (size 10)',
      accessories: 'Casio water-resistant digital watch, silver ring on right pinky',
      belongings: 'Black waterproof backpack with laptop sleeve',
      foundLocation: 'Bhimtal Bypass Road near KM 14 landslide sector',
      foundAt: new Date().toISOString().slice(0, 16),
      reportNotes: 'Was travelling via taxi when upper landslide triggered near KM 14. Phone switched off since 4:00 AM.',
      birthmarks: 'Heart-shaped birthmark on right upper arm',
      scars: 'Surgical scar on right knee from ACL football surgery',
      tattoos: 'Mountain silhouette tattoo on left inner forearm',
      anatomicalFeatures: 'Tall athletic build, broad shoulders',
      identifyingClue: 'Mountain tattoo left forearm, Casio watch, right knee ACL scar',
    } as FamilyDemoPreset,

    found: {
      commStatus: 'CAN_COMMUNICATE' as const,
      fullName: 'Veer Kumar',
      approximateAge: '24',
      gender: 'Male',
      bloodGroup: 'O+',
      build: 'Athletic',
      hairColour: 'Black',
      clothing: 'Torn grey athletic hoodie, dark track pants',
      footwear: 'Single trekking boot',
      accessories: 'Casio digital watch, silver ring',
      birthmarks: 'Birthmark on right upper arm',
      scars: 'Surgical scar on right knee',
      tattoos: 'Mountain tattoo on left forearm',
      identifyingClue: 'Casio digital watch, mountain tattoo, right knee scar',
      foundLocation: 'Bhimtal Relief Base Camp Alpha',
      foundAt: new Date().toISOString().slice(0, 16),
      referralInfo: 'Walked in with local volunteer squad from landslide perimeter',
      reportNotes: 'Survivor reached relief station on foot. Suffered knee sprain and mild exhaustion. Can state his first name.',
      conditionStatus: 'Conscious, oriented, mild dehydration and right knee contusion',
    } as FoundDemoPreset,

    hospital: {
      hospitalName: 'District Community Health Center, Bhimtal',
      wardBed: 'Orthopedic Ward, Bed #03',
      referralAmbulance: 'Civil Emergency 108 Ambulance Unit',
      fullName: 'Veer Kumar Singhania',
      approximateAge: '24',
      gender: 'Male',
      bloodGroup: 'O+',
      weightKg: '78',
      conditionStatus: 'Right knee ligament strain splinted, mild abrasions dressed, hemodynamically stable',
      anatomicalFeatures: 'Old surgical scar on right knee, mountain tattoo on left forearm',
      clothing: 'Grey athletic hoodie, dark track pants',
      accessories: 'Casio digital watch (intact)',
      identifyingClue: 'Forearm mountain tattoo, Casio watch',
      reportNotes: 'Admitted from landslide zone for knee immobilization and hydration.',
    } as HospitalDemoPreset,

    voiceTranscript: `Control, volunteer unit Bhimtal reporting. We have identified survivor Veer Kumar, male, age 24, athletic build, 184 centimeters tall. Has long black hair, mountain tattoo on left forearm, Casio digital watch. Suffering from right knee pain. Transferred to Camp Alpha medical tent for checkup. Over.`,
  },
};

export type DemoPresetKey = keyof typeof DEMO_PRESETS;
