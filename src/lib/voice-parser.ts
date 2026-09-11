// ============================================================
// MILAN — Disaster Voice & Radio Natural Language Parser
// HackX 4.0 Innovation 1: Multimodal Voice/Radio-to-Case
// Extracts structured Milan attributes from unstructured transcripts
// Zero-dependency deterministic parser with optional LLM enhancement
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
    entities.push({ field: 'gender', value: 'Female', rawSnippet: RegExp.lastMatch });
  } else if (/\b(boy|man|male|gentleman|son|father|brother|ladka|purush|aadmi)\b/i.test(lower)) {
    attrs.p_gender = 'Male';
    entities.push({ field: 'gender', value: 'Male', rawSnippet: RegExp.lastMatch });
  }

  // 2. AGE DETECTION (Exact or Approximate)
  const ageMatch = lower.match(/(?:age(?:d)?|around|about|approx(?:imately)?|umar|lagbhag)?\s*(\d{1,2})\s*(?:years?(?:\s*old)?|saal|yr)/i)
    || lower.match(/\b(\d{1,2})\s*(?:years?\s*old|saal)\b/i);

  if (ageMatch) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum > 0 && ageNum < 120) {
      if (/around|about|approx|lagbhag/i.test(ageMatch[0]) || /child|kid|baccha|elderly/i.test(lower)) {
        attrs.p_approximate_age = ageNum;
        entities.push({ field: 'approximate_age', value: ageNum, rawSnippet: ageMatch[0] });
      } else {
        attrs.p_age = ageNum;
        entities.push({ field: 'age', value: ageNum, rawSnippet: ageMatch[0] });
      }
    }
  } else if (/\b(toddler|infant|baby|chota baccha)\b/i.test(lower)) {
    attrs.p_approximate_age = 2;
    entities.push({ field: 'approximate_age', value: 2, rawSnippet: RegExp.lastMatch });
  }

  // 3. COMMUNICATION STATUS
  if (/\b(cannot speak|unable to speak|mute|unconscious|in shock|non-verbal|bol nahi|behosh|shock me)\b/i.test(lower)) {
    attrs.p_comm_status = 'CANNOT_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CANNOT_COMMUNICATE', rawSnippet: RegExp.lastMatch });
  } else if (/\b(speaks|able to speak|talked|said|told|bol raha|naam bataya)\b/i.test(lower)) {
    attrs.p_comm_status = 'CAN_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CAN_COMMUNICATE', rawSnippet: RegExp.lastMatch });
  }

  // 4. NAME DETECTION
  const nameMatch = text.match(/(?:named|name is|called|self-reported name as|calls (?:himself|herself)|naam hai|naam bataya)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i)
    || lower.match(/(?:named|name is|called|naam)\s+([a-z]+(?:\s+[a-z]+)?)/i);

  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    if (!['male', 'female', 'boy', 'girl', 'child', 'doctor', 'camp'].includes(rawName.toLowerCase())) {
      const cleanName = rawName.replace(/\b\w/g, c => c.toUpperCase());
      attrs.p_full_name = cleanName;
      entities.push({ field: 'full_name', value: cleanName, rawSnippet: nameMatch[0] });
    }
  }

  // 5. BLOOD GROUP DETECTION
  const bloodMatch = text.match(/\b(A|B|AB|O)\s*(\+|\-|positive|negative)(?!\w)/i);
  if (bloodMatch) {
    const type = bloodMatch[1].toUpperCase();
    const sign = bloodMatch[2].toLowerCase().startsWith('pos') || bloodMatch[2] === '+' ? '+' : '-';
    attrs.p_blood_group = `${type}${sign}`;
    entities.push({ field: 'blood_group', value: `${type}${sign}`, rawSnippet: bloodMatch[0] });
  }

  // 6. PHYSICAL MARKS (Birthmarks, Scars, Tattoos)
  const markSnippets: string[] = [];
  const birthmarkMatch = lower.match(/(?:(?:small|large|distinctive|heart-shaped)?\s*(?:birthmark|mark|til))\s*(?:on|near|around)?\s*([a-z\s]+?)(?=[.,;]|wearing|and|has|$)/i);
  if (birthmarkMatch) {
    const mark = birthmarkMatch[0].trim();
    attrs.p_birthmarks = mark;
    markSnippets.push(mark);
    entities.push({ field: 'birthmarks', value: mark, rawSnippet: birthmarkMatch[0] });
  }

  const scarMatch = lower.match(/(?:scar|wound|cut|laceration|chot)\s*(?:on|above|near|around)?\s*([a-z\s]+?)(?=[.,;]|wearing|and|has|$)/i);
  if (scarMatch) {
    const scar = scarMatch[0].trim();
    attrs.p_scars = scar;
    markSnippets.push(scar);
    entities.push({ field: 'scars', value: scar, rawSnippet: scarMatch[0] });
  }

  const tattooMatch = lower.match(/(?:tattoo|godna)\s*(?:of|on|near)?\s*([a-z\s]+?)(?=[.,;]|wearing|and|has|$)/i);
  if (tattooMatch) {
    const tattoo = tattooMatch[0].trim();
    attrs.p_tattoos = tattoo;
    markSnippets.push(tattoo);
    entities.push({ field: 'tattoos', value: tattoo, rawSnippet: tattooMatch[0] });
  }

  if (markSnippets.length > 0) {
    attrs.p_identifying_clue = markSnippets.join(', ');
  }

  // 7. CLOTHING EXTRACTION
  const clothingMatch = lower.match(/(?:wearing|in|dressed in|pehne hue)\s+([a-z0-9,\s]+?)(?=[.,;]|has|with|found|unable|rescued|$)/i);
  if (clothingMatch && clothingMatch[1].trim().length > 3) {
    attrs.p_clothing = clothingMatch[1].trim();
    entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: clothingMatch[0] });
  } else {
    // Fallback: search for common clothing color-garment combos
    const garmentRegex = /\b(blue|pink|red|green|yellow|black|white|grey|dark)?\s*(?:denim\s*)?(jacket|kurta|shirt|t-shirt|top|jeans|pants|trousers|sari|dhoti|boots|shoes|braids)\b/gi;
    const garments = lower.match(garmentRegex);
    if (garments && garments.length > 0) {
      attrs.p_clothing = garments.join(', ');
      entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: garments.join(', ') });
    }
  }

  // 8. LOCATION EXTRACTION
  const locationMatch = text.match(/(?:found|rescued|last seen|at|near|from)\s+(?:the\s+)?([A-Za-z0-9\s]+?(?:bypass|camp|trail|bridge|market|hospital|road|valley|river|bhimtal|haldwani|mukteshwar|nainital|uttarakhand))/i);
  if (locationMatch && locationMatch[1]) {
    attrs.p_found_location = locationMatch[1].trim();
    entities.push({ field: 'found_location', value: attrs.p_found_location, rawSnippet: locationMatch[0] });
  }


  // 9. CONDITION STATUS
  if (/\b(dehydrated|injured|fracture|burns|stable|critical|unconscious|fever|lacerations)\b/i.test(lower)) {
    const condition = lower.match(/\b(dehydrated|injured|fracture|burns|stable|critical|unconscious|fever|lacerations)\b/i);
    if (condition) {
      attrs.p_condition_status = condition[0].toUpperCase();
      entities.push({ field: 'condition_status', value: attrs.p_condition_status, rawSnippet: condition[0] });
    }
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
