// ============================================================
// MILAN — Disaster Voice & Radio Natural Language Parser
// HackX 4.0 Innovation 1: Multimodal Voice/Radio-to-Case
// Extracts structured Milan attributes from unstructured transcripts
// Zero-dependency deterministic parser with high-accuracy disaster heuristics
// ============================================================

import type { CreateCaseWithReportInput, CommunicationStatus } from '../types/index.ts';

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
  if (/\b(girl|woman|female|lady|daughter|mother|sister|ladki|mahila|aurat)\b/i.test(lower)) {
    attrs.p_gender = 'Female';
    entities.push({ field: 'gender', value: 'Female', rawSnippet: 'Female' });
  } else if (/\b(boy|man|male|gentleman|son|father|brother|ladka|purush|aadmi)\b/i.test(lower)) {
    attrs.p_gender = 'Male';
    entities.push({ field: 'gender', value: 'Male', rawSnippet: 'Male' });
  }

  // 2. AGE DETECTION (Exact or Approximate)
  const ageMatch =
    lower.match(/(?:age(?:d)?|around|about|approx(?:imately)?|umar|lagbhag)\s*(\d{1,2})\s*(?:years?(?:\s*old)?|saal|yr)?/i) ||
    lower.match(/\b(\d{1,2})\s*(?:years?\s*old|saal|yr)\b/i);

  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum > 0 && ageNum < 120) {
      if (/around|about|approx|lagbhag/i.test(ageMatch[0]) || /child|kid|baccha|elderly/i.test(lower)) {
        attrs.p_approximate_age = ageNum;
        entities.push({ field: 'approximate_age', value: ageNum, rawSnippet: ageMatch[0].trim() });
      } else {
        attrs.p_age = ageNum;
        entities.push({ field: 'age', value: ageNum, rawSnippet: ageMatch[0].trim() });
      }
    }
  } else if (/\b(toddler|infant|baby|chota baccha)\b/i.test(lower)) {
    attrs.p_approximate_age = 2;
    entities.push({ field: 'approximate_age', value: 2, rawSnippet: 'toddler' });
  }

  // 3. COMMUNICATION STATUS
  if (/\b(cannot speak|unable to speak|mute|unconscious|in shock|non-verbal|bol nahi|behosh|shock me)\b/i.test(lower)) {
    attrs.p_comm_status = 'CANNOT_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CANNOT_COMMUNICATE', rawSnippet: 'CANNOT_COMMUNICATE' });
  } else if (/\b(speaks|able to speak|talked|said|told|bol raha|naam bataya)\b/i.test(lower)) {
    attrs.p_comm_status = 'CAN_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CAN_COMMUNICATE', rawSnippet: 'CAN_COMMUNICATE' });
  }

  // 4. NAME DETECTION
  // Avoid capturing structural radio terms like "NDRF Battalion", "Control", "Emergency department", "Disaster Relief"
  const nameMatch =
    text.match(/(?:(?:named|name is|name as|calls (?:himself|herself)|naam hai|naam bataya)\s+)([A-Za-z]+(?:\s+[A-Za-z]+)?)/i) ||
    text.match(/(?:missing grandmother|missing person|patient|victim)\s+(?:named|is)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);

  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    const disallowed = ['male', 'female', 'boy', 'girl', 'child', 'doctor', 'camp', 'control', 'ndrf', 'hospital', 'boat', 'team', 'relief'];
    if (!disallowed.includes(rawName.toLowerCase())) {
      const cleanName = rawName.replace(/\b\w/g, (c) => c.toUpperCase());
      attrs.p_full_name = cleanName;
      entities.push({ field: 'full_name', value: cleanName, rawSnippet: cleanName });
    }
  }

  // 5. BLOOD GROUP DETECTION
  const bloodMatch = text.match(/\b(A|B|AB|O)\s*(\+|\-|positive|negative)(?!\w)/i);
  if (bloodMatch) {
    const type = bloodMatch[1].toUpperCase();
    const sign = bloodMatch[2].toLowerCase().startsWith('pos') || bloodMatch[2] === '+' ? '+' : '-';
    attrs.p_blood_group = `${type}${sign}`;
    entities.push({ field: 'blood_group', value: `${type}${sign}`, rawSnippet: bloodMatch[0].trim() });
  }

  // 6. BUILD & HAIR
  const buildMatch = lower.match(/\b(slim|athletic|medium|thin|heavy|stocky|lean)\s+build\b/i);
  if (buildMatch) {
    const b = buildMatch[1].charAt(0).toUpperCase() + buildMatch[1].slice(1).toLowerCase();
    attrs.p_build = b;
    entities.push({ field: 'build', value: b, rawSnippet: buildMatch[0] });
  }

  const hairMatch = lower.match(/\b(short black|gray and white|curly|long black|bald|wavy|white curly)\s+hair\b/i);
  if (hairMatch) {
    const h = hairMatch[0].charAt(0).toUpperCase() + hairMatch[0].slice(1);
    attrs.p_hair_description = h;
    entities.push({ field: 'hair', value: h, rawSnippet: hairMatch[0] });
  }

  // 7. PHYSICAL MARKS (Birthmarks, Scars, Tattoos) — STRICT WORD BOUNDARIES to never match "market"!
  const markSnippets: string[] = [];

  // Birthmark: explicitly requires birthmark, mole, or til
  const birthmarkMatch = lower.match(/(?:small|large|distinctive|heart-shaped)?\s*(?:\bbirthmark\b|\bmole\b|\btil\b)\s*(?:on|near|around|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i);
  if (birthmarkMatch) {
    const mark = birthmarkMatch[0].trim();
    attrs.p_birthmarks = mark;
    markSnippets.push(mark);
    entities.push({ field: 'birthmarks', value: mark, rawSnippet: birthmarkMatch[0].trim() });
  }

  // Scars
  const scarMatch = lower.match(/(?:visible\s+)?(?:\bscar\b|\bwound\b|\bcut\b|\blaceration\b|\bchot\b)\s*(?:on|above|near|around|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i);
  if (scarMatch) {
    const scar = scarMatch[0].trim();
    attrs.p_scars = scar;
    markSnippets.push(scar);
    entities.push({ field: 'scars', value: scar, rawSnippet: scarMatch[0].trim() });
  }

  // Tattoos
  const tattooMatch = lower.match(/(?:\btattoo\b|\bgodna\b)\s*(?:of|on|near|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i);
  if (tattooMatch) {
    const tattoo = tattooMatch[0].trim();
    attrs.p_tattoos = tattoo;
    markSnippets.push(tattoo);
    entities.push({ field: 'tattoos', value: tattoo, rawSnippet: tattooMatch[0].trim() });
  }

  // 8. ACCESSORIES & IDENTIFYING CLUES
  const clueMatch = text.match(/(?:black thread[a-zA-Z\s,'-]*wrist[a-zA-Z\s,'-]*charm|rudraksha bead|spectacles|digital watch|silver ring|canvas bag)/i);
  if (clueMatch) {
    attrs.p_accessories = clueMatch[0].trim();
    markSnippets.push(clueMatch[0].trim());
    entities.push({ field: 'accessories', value: clueMatch[0].trim(), rawSnippet: clueMatch[0].trim() });
  }

  if (markSnippets.length > 0) {
    attrs.p_identifying_clue = markSnippets.join(', ');
  }

  // 9. CLOTHING EXTRACTION — Strict: requires wearing, dressed in, pehne, or garment keyword
  const clothingMatch = lower.match(/(?:wearing|dressed in|pehne hue|pehni hai)\s+([a-z0-9,\s'-]+?)(?=[.;!]|has\b|with a\b|condition\b|blood\b|currently\b|she carries|$)/i);
  if (clothingMatch && clothingMatch[1].trim().length > 3 && !/^(shock|fear|pain|danger)/i.test(clothingMatch[1].trim())) {
    attrs.p_clothing = clothingMatch[1].trim();
    entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: clothingMatch[0].trim() });
  } else {
    // Garment regex fallback
    const garmentRegex = /\b(?:soiled\s+|torn\s+|pink\s+|red\s+|blue\s+|green\s+|dark\s+|black\s+|grey\s+|white\s+)?(?:denim\s+|cotton\s+)?(?:polo shirt|t-shirt|shirt|shorts|jacket|saree|hoodie|track pants|pants|top|kurta)\b/gi;
    const garments = lower.match(garmentRegex);
    if (garments && garments.length > 0) {
      attrs.p_clothing = garments.join(', ');
      entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: garments.join(', ') });
    }
  }

  // 10. LOCATION EXTRACTION
  const locationMatch = text.match(/(?:from|near|at|around|rescued from|pulled[a-zA-Z\s]*from)\s+(?:a\s+|the\s+)?([A-Za-z0-9\s,'-]+?(?:riverside market|bypass|camp|bridge|market|hospital|road|valley|relief zone \d+|colony|hall|station|riverside|river|bhimtal|haldwani|mukteshwar|nainital|uttarakhand|sector \d+))/i);
  if (locationMatch && locationMatch[1]) {
    attrs.p_found_location = locationMatch[1].trim();
    entities.push({ field: 'found_location', value: attrs.p_found_location, rawSnippet: locationMatch[0].trim() });
  }

  // 11. CONDITION STATUS
  const conditionMatch = lower.match(/\b(unconscious|critical|stable|shock|injured|dehydrated|fracture|burns|fever|lacerations)\b/i);
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
