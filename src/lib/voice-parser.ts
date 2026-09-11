// ============================================================
// MILAN — Disaster Voice & Radio Natural Language Parser
// HackX 4.0 Innovation 1: Multimodal Voice/Radio-to-Case
// Extracts structured Milan attributes from unstructured transcripts
// Zero-dependency deterministic parser with high-accuracy disaster heuristics
// ============================================================

import type { CreateCaseWithReportInput, CommunicationStatus, SourceType } from '../types/index.ts';

export interface ParsedVoiceReport {
  attributes: Partial<CreateCaseWithReportInput>;
  confidence: number; // 0-100
  extractedEntities: {
    field: string;
    value: string | number;
    rawSnippet: string;
  }[];
  rawTranscript: string;
}

// Spoken English number conversion map for age & measurements
const WORD_TO_NUMBER: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, 'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
  'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27, 'twenty-eight': 28,
  'twenty-nine': 29, thirty: 30, 'thirty-five': 35, forty: 40, 'forty-five': 45, fifty: 50,
  'fifty-five': 55, sixty: 60, 'sixty-four': 64, 'sixty-five': 65, seventy: 70, eighty: 80, ninety: 90
};

function parseSpokenNumber(str: string): number | null {
  if (!str) return null;
  const clean = str.toLowerCase().trim().replace(/[-]/g, '-');
  if (/^\d+$/.test(clean)) {
    return parseInt(clean, 10);
  }
  if (WORD_TO_NUMBER[clean] !== undefined) {
    return WORD_TO_NUMBER[clean];
  }
  // Handles "twenty one" with space
  const parts = clean.split(/\s+/);
  if (parts.length === 2 && WORD_TO_NUMBER[parts[0]] && WORD_TO_NUMBER[parts[1]]) {
    return WORD_TO_NUMBER[parts[0]] + WORD_TO_NUMBER[parts[1]];
  }
  return null;
}

/**
 * Extracts structured person attributes from a freeform English / Hinglish voice transcript or radio log.
 * Resilient against colloquial disaster phrases, approximate ages, and mixed languages.
 */
export function parseDisasterVoiceTranscript(transcript: string): ParsedVoiceReport {
  const text = transcript.trim();
  const lower = text.toLowerCase();
  const entities: ParsedVoiceReport['extractedEntities'] = [];
  const attrs: Partial<CreateCaseWithReportInput> = {};

  // 1. GENDER DETECTION
  if (/\b(girl|woman|female|lady|daughter|mother|sister|ladki|mahila|aurat|nani|dadi)\b/i.test(lower)) {
    attrs.p_gender = 'Female';
    entities.push({ field: 'gender', value: 'Female', rawSnippet: 'Female' });
  } else if (/\b(boy|man|male|gentleman|son|father|brother|ladka|purush|aadmi|bhai|chota ladka)\b/i.test(lower)) {
    attrs.p_gender = 'Male';
    entities.push({ field: 'gender', value: 'Male', rawSnippet: 'Male' });
  }

  // 2. AGE DETECTION (Exact or Approximate, handles digits or word numbers)
  const ageWordRegex = '(?:\\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty-one|twenty one|thirty|forty|fifty|sixty|sixty-four|sixty four|seventy|eighty)';
  const agePattern = new RegExp(`(?:age(?:d)?|umar|lagbhag|around|about|approx(?:imately)?)\\s*(?:is|was|hai|of)?\\s*(${ageWordRegex})\\b`, 'i');
  const ageSuffixPattern = new RegExp(`\\b(${ageWordRegex})\\s*(?:years?(?:\\s*old)?|saal|yr|yrs|yo)\\b`, 'i');

  const ageMatch = lower.match(agePattern) || lower.match(ageSuffixPattern);

  if (ageMatch) {
    const parsedAge = parseSpokenNumber(ageMatch[1]);
    if (parsedAge && parsedAge > 0 && parsedAge < 120) {
      if (/around|about|approx|lagbhag/i.test(ageMatch[0]) || /child|kid|baccha|elderly|old/i.test(lower)) {
        attrs.p_approximate_age = parsedAge;
        entities.push({ field: 'approximate_age', value: parsedAge, rawSnippet: ageMatch[0].trim() });
      } else {
        attrs.p_age = parsedAge;
        attrs.p_approximate_age = parsedAge;
        entities.push({ field: 'age', value: parsedAge, rawSnippet: ageMatch[0].trim() });
      }
    }
  } else if (/\b(toddler|infant|baby|chota baccha)\b/i.test(lower)) {
    attrs.p_approximate_age = 2;
    entities.push({ field: 'approximate_age', value: 2, rawSnippet: 'toddler' });
  }

  // 3. COMMUNICATION STATUS
  if (
    /\b(cannot speak|unable to speak|cannot communicate|unable to communicate|mute|unconscious|in shock|non-verbal|bol nahi|behosh|shock me|silent|cannot answer|speechless)\b/i.test(
      lower
    )
  ) {
    attrs.p_comm_status = 'CANNOT_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CANNOT_COMMUNICATE', rawSnippet: 'CANNOT_COMMUNICATE' });
  } else if (
    /\b(can communicate|able to communicate|speaks|able to speak|talked|said|told|bol raha|naam bataya|answers questions|responsive|conscious)\b/i.test(
      lower
    )
  ) {
    attrs.p_comm_status = 'CAN_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CAN_COMMUNICATE', rawSnippet: 'CAN_COMMUNICATE' });
  }

  // 4. NAME DETECTION (Full Name takes highest priority over partial names)
  const fullNameMatch = text.match(
    /(?:full\s*name(?:\s*is)?|poora\s*naam(?:\s*hai)?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)(?=\s+(?:and|at|in|my|is|age|gender|with|from)|[.,;!]|\s|$)/i
  );
  const generalNameMatch = text.match(
    /(?:(?:named|name is|name as|calls (?:himself|herself)|naam hai|naam bataya)\s+)([A-Za-z]+(?:\s+[A-Za-z]+)?)(?=\s+(?:and|at|in|my|is|age|gender|with|from)|[.,;!]|\s|$)/i
  );
  const familyRoleNameMatch = text.match(
    /(?:missing grandmother|missing person|patient|victim|survivor)\s+(?:named|is)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?=\s+(?:and|at|in|my|is|age|gender|with|from)|[.,;!]|\s|$)/i
  );
  const selfNameMatch = text.match(
    /(?:my name is|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?=\s+(?:and|at|in|my|is|age|gender|with|from)|[.,;!]|\s|$)/i
  );

  const candidateName = fullNameMatch
    ? fullNameMatch[1]
    : generalNameMatch
    ? generalNameMatch[1]
    : familyRoleNameMatch
    ? familyRoleNameMatch[1]
    : selfNameMatch
    ? selfNameMatch[1]
    : null;

  if (candidateName) {
    const rawName = candidateName.trim();
    const disallowed = [
      'male', 'female', 'boy', 'girl', 'child', 'doctor', 'camp', 'control', 'ndrf',
      'hospital', 'boat', 'team', 'relief', 'and', 'my', 'the', 'reporting', 'at', 'in',
      'unconscious', 'stable', 'critical', 'looking', 'searching'
    ];
    if (!disallowed.includes(rawName.toLowerCase())) {
      const cleanName = rawName.replace(/\b\w/g, (c) => c.toUpperCase());
      attrs.p_full_name = cleanName;
      entities.push({ field: 'full_name', value: cleanName, rawSnippet: cleanName });
    }
  }

  // 5. BLOOD GROUP DETECTION
  const bloodMatch =
    text.match(/\b(A|B|AB|O)\s*(\+|\-|positive|negative|pos|neg)(?!\w)/i) ||
    lower.match(/blood(?:\s*group)?(?:\s*is)?\s*(A|B|AB|O)\s*(\+|\-|positive|negative|pos|neg)?/i);

  if (bloodMatch) {
    const type = bloodMatch[1].toUpperCase();
    const rawSign = bloodMatch[2] ? bloodMatch[2].toLowerCase() : '+';
    const sign = rawSign.startsWith('pos') || rawSign === '+' ? '+' : rawSign.startsWith('neg') || rawSign === '-' ? '-' : '+';
    attrs.p_blood_group = `${type}${sign}`;
    entities.push({ field: 'blood_group', value: `${type}${sign}`, rawSnippet: bloodMatch[0].trim() });
  }

  // 6. HEIGHT EXTRACTION (Supports cm and feet/inches)
  const heightFeetMatch = lower.match(/(?:height(?:\s*is|\s*was)?)\s*(\d{1})\s*(?:feet|foot|ft|\')\s*(\d{1,2})?\s*(?:inches|in|\")?/i);
  const heightCmMatch =
    lower.match(/(?:height(?:\s*is|\s*was)?|lambai)\s*(\d{2,3})\s*(?:cm|centimeters?|cms)?\b/i) ||
    lower.match(/\b(\d{2,3})\s*(?:cm|centimeters?|cms)\b/i);

  if (heightFeetMatch) {
    const feet = parseInt(heightFeetMatch[1], 10);
    const inches = heightFeetMatch[2] ? parseInt(heightFeetMatch[2], 10) : 0;
    const totalCm = Math.round((feet * 12 + inches) * 2.54);
    if (totalCm >= 40 && totalCm <= 250) {
      attrs.p_height_cm = totalCm;
      entities.push({ field: 'height_cm', value: totalCm, rawSnippet: heightFeetMatch[0] });
    }
  } else if (heightCmMatch) {
    const h = parseInt(heightCmMatch[1], 10);
    if (h >= 40 && h <= 250) {
      attrs.p_height_cm = h;
      entities.push({ field: 'height_cm', value: h, rawSnippet: `${h} cm` });
    }
  }

  // Weight
  const weightMatch =
    lower.match(/(?:weight(?:\s*is|\s*was)?|vajan)\s*(\d{2,3})\s*(?:kg|kgs|kilos?|kilograms?)\b/i) ||
    lower.match(/\b(\d{2,3})\s*(?:kg|kgs|kilos?)\b/i);
  if (weightMatch) {
    const w = parseInt(weightMatch[1], 10);
    if (w >= 3 && w <= 200) {
      attrs.p_weight_kg = w;
      entities.push({ field: 'weight_kg', value: w, rawSnippet: `${w} kg` });
    }
  }

  // 7. BUILD & HAIR
  const buildMatch =
    lower.match(/\b(slim|athletic|medium|thin|heavy|stocky|lean|muscular|stout)\s*(?:type)?\s*build\b/i) ||
    lower.match(/build(?:\s*is|\s*type)?\s*(slim|athletic|medium|thin|heavy|stocky|lean|muscular|stout)\b/i);
  if (buildMatch) {
    const b = buildMatch[1].charAt(0).toUpperCase() + buildMatch[1].slice(1).toLowerCase();
    attrs.p_build = b;
    entities.push({ field: 'build', value: b, rawSnippet: buildMatch[0] });
  }

  const hairMatch =
    lower.match(/\b(short black|long black|gray and white|curly|bald|wavy|white curly|blonde|straight|brown|shoulder length)\s+hair\b/i) ||
    lower.match(/hair(?:\s*description)?(?:\s*is)?\s*([a-z\s]+?hair)\b/i);
  if (hairMatch) {
    const h = (hairMatch[1] || hairMatch[0]).trim();
    const cleanHair = h.charAt(0).toUpperCase() + h.slice(1);
    attrs.p_hair_description = cleanHair;
    entities.push({ field: 'hair', value: cleanHair, rawSnippet: cleanHair });
  }

  // 8. PHYSICAL MARKS (Birthmarks, Scars, Tattoos)
  const markSnippets: string[] = [];

  const birthmarkMatch = lower.match(
    /(?:small|large|distinctive|heart-shaped)?\s*(?:\bbirthmark\b|\bmole\b|\btil\b)\s*(?:on|near|around|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i
  );
  if (birthmarkMatch) {
    const mark = birthmarkMatch[0].trim();
    attrs.p_birthmarks = mark;
    markSnippets.push(mark);
    entities.push({ field: 'birthmarks', value: mark, rawSnippet: birthmarkMatch[0].trim() });
  }

  const scarMatch = lower.match(
    /(?:visible\s+)?(?:\bscar\b|\bwound\b|\bcut\b|\blaceration\b|\bchot\b)\s*(?:on|above|near|around|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i
  );
  if (scarMatch) {
    const scar = scarMatch[0].trim();
    attrs.p_scars = scar;
    markSnippets.push(scar);
    entities.push({ field: 'scars', value: scar, rawSnippet: scarMatch[0].trim() });
  }

  const tattooMatch = lower.match(
    /(?:\btattoo\b|\bgodna\b)\s*(?:of|on|near|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i
  );
  if (tattooMatch) {
    const tattoo = tattooMatch[0].trim();
    attrs.p_tattoos = tattoo;
    markSnippets.push(tattoo);
    entities.push({ field: 'tattoos', value: tattoo, rawSnippet: tattooMatch[0].trim() });
  }

  // 9. ACCESSORIES & IDENTIFYING CLUES
  const clueMatch = text.match(
    /(?:black thread[a-zA-Z\s,'-]*wrist[a-zA-Z\s,'-]*charm|rudraksha bead|spectacles|digital watch|silver ring|canvas bag|glasses|hearing aid|necklace)/i
  );
  if (clueMatch) {
    attrs.p_accessories = clueMatch[0].trim();
    markSnippets.push(clueMatch[0].trim());
    entities.push({ field: 'accessories', value: clueMatch[0].trim(), rawSnippet: clueMatch[0].trim() });
  }

  if (markSnippets.length > 0) {
    attrs.p_identifying_clue = markSnippets.join(', ');
  }

  // 10. CLOTHING EXTRACTION
  const clothingMatch = lower.match(
    /(?:wearing|dressed in|pehne hue|pehni hai)\s+([a-z0-9,\s'-]+?)(?=[.;!]|has\b|with a\b|condition\b|blood\b|currently\b|she carries|$)/i
  );
  if (clothingMatch && clothingMatch[1].trim().length > 3 && !/^(shock|fear|pain|danger)/i.test(clothingMatch[1].trim())) {
    attrs.p_clothing = clothingMatch[1].trim();
    entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: clothingMatch[0].trim() });
  } else {
    const garmentRegex =
      /\b(?:soiled\s+|torn\s+|pink\s+|red\s+|blue\s+|green\s+|dark\s+|black\s+|grey\s+|white\s+|yellow\s+)?(?:denim\s+|cotton\s+|leather\s+)?(?:polo shirt|t-shirt|shirt|shorts|jacket|saree|hoodie|track pants|pants|top|kurta|jeans)\b/gi;
    const garments = lower.match(garmentRegex);
    if (garments && garments.length > 0) {
      attrs.p_clothing = garments.join(', ');
      entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: garments.join(', ') });
    }
  }

  // 11. LOCATION EXTRACTION
  const locationMatch = text.match(
    /(?:from|near|at|around|rescued from|pulled[a-zA-Z\s]*from)\s+(?:a\s+|the\s+)?([A-Za-z0-9\s,'-]+?(?:riverside market|bypass|camp|bridge|market|hospital|road|valley|relief zone \d+|colony|hall|station|riverside|river|bhimtal|haldwani|mukteshwar|nainital|uttarakhand|sector \d+|ngo field|field camp|shelter))/i
  );
  if (locationMatch && locationMatch[1]) {
    attrs.p_found_location = locationMatch[1].trim();
    entities.push({ field: 'found_location', value: attrs.p_found_location, rawSnippet: locationMatch[0].trim() });
  }

  // 12. SOURCE TYPE INFERENCE
  if (/\b(?:ngo field|relief alliance|volunteer camp|ngo)\b/i.test(lower)) {
    attrs.p_source_type = 'NGO' as SourceType;
  } else if (/\b(?:ndrf|army|battalion|rescue team|boat team|air-lift)\b/i.test(lower)) {
    attrs.p_source_type = 'ARMY_RESCUE' as SourceType;
  } else if (/\b(?:hospital|emergency department|trauma center|ambulance|iv fluids|doctor)\b/i.test(lower)) {
    attrs.p_source_type = 'HOSPITAL' as SourceType;
  }

  // 13. CONDITION STATUS
  const conditionMatch = lower.match(/\b(unconscious|critical|stable|shock|injured|dehydrated|fracture|burns|fever|lacerations|trauma)\b/i);
  if (conditionMatch) {
    attrs.p_condition_status = conditionMatch[0].toUpperCase();
    entities.push({ field: 'condition_status', value: attrs.p_condition_status, rawSnippet: conditionMatch[0].trim() });
  }

  // Calculate extraction confidence score based on entity density
  const score = Math.min(100, Math.round((entities.length / 5) * 100));

  return {
    attributes: attrs,
    confidence: score,
    extractedEntities: entities,
    rawTranscript: text,
  };
}
