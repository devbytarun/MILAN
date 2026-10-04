// ============================================================
// MILAN — Disaster Voice & Radio Natural Language Parser
// HackX 4.0 Innovation 1: Multimodal Voice/Radio-to-Case
// Extracts structured Milan attributes from unstructured transcripts
// High-accuracy zero-dependency deterministic parser for English, Hinglish, & Hindi (Devanagari)
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
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, 'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
  'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27, 'twenty-eight': 28,
  'twenty-nine': 29, thirty: 30, 'thirty-five': 35, forty: 40, 'forty-five': 45, fifty: 50,
  'fifty-five': 55, sixty: 60, 'sixty-four': 64, 'sixty-five': 65, seventy: 70, eighty: 80, ninety: 90
};

// Spoken Hindi Devanagari numbers map
const HINDI_WORD_TO_NUMBER: Record<string, number> = {
  'शून्य': 0, 'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'छः': 6, 'सात': 7,
  'आठ': 8, 'नौ': 9, 'दस': 10, 'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
  'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20, 'इक्कीस': 21, 'बाईस': 22,
  'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25, 'छब्बीस': 26, 'सत्ताईस': 27, 'अट्ठाईस': 28, 'उनतीस': 29,
  'तीस': 30, 'इकतीस': 31, 'बत्तीस': 32, 'तैंतीस': 33, 'चौंतीस': 34, 'पैंतीस': 35, 'छत्तीस': 36,
  'सैंतीस': 37, 'अड़तीस': 38, 'उनतालीस': 39, 'चालीस': 40, 'इकतालीस': 41, 'बयालीस': 42, 'तैंतालीस': 43,
  'चवालीस': 44, 'पैंतालीस': 45, 'छियालीस': 46, 'सैंतालीस': 47, 'अड़तालीस': 48, 'उनचास': 49, 'पचास': 50,
  'इक्यावन': 51, 'बावन': 52, 'तिरेपन': 53, 'चौवन': 54, 'पचपन': 55, 'छप्पन': 56, 'सत्तावन': 57,
  'अट्ठावन': 58, 'उनसठ': 59, 'साठ': 60, 'इकसठ': 61, 'बासठ': 62, 'तिरेसठ': 63, 'चौंसठ': 64,
  'पैंसठ': 65, 'छियासठ': 66, 'सरसठ': 67, 'अड़सठ': 68, 'उनहत्तर': 69, 'सत्तर': 70, 'इकहत्तर': 71,
  'बहत्तर': 72, 'तिहत्तर': 73, 'चौहत्तर': 74, 'पचहत्तर': 75, 'छिहत्तर': 76, 'सतहत्तर': 77, 'अठहत्तर': 78,
  'उन्नासी': 79, 'अस्सी': 80, 'इक्यासी': 81, 'बयासी': 82, 'तिरासी': 83, 'चौरासी': 84, 'पचासी': 85,
  'छियासी': 86, 'सत्तासी': 87, 'अट्ठासी': 88, 'नवासी': 89, 'नब्बे': 90, 'इक्यानवे': 91, 'बानवे': 92,
  'तिरानवे': 93, 'चौरानवे': 94, 'पंचानवे': 95, 'छियानवे': 96, 'सत्तानवे': 97, 'अट्ठानवे': 98, 'निन्यानवे': 99,
  'सौ': 100
};

export function normalizeDevanagariNumerals(str: string): string {
  if (!str) return '';
  return str.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

export function parseSpokenNumber(str: string): number | null {
  if (!str) return null;
  const clean = normalizeDevanagariNumerals(str).toLowerCase().trim().replace(/[-]/g, '-');
  if (/^\d+$/.test(clean)) {
    return parseInt(clean, 10);
  }
  if (WORD_TO_NUMBER[clean] !== undefined) {
    return WORD_TO_NUMBER[clean];
  }
  if (HINDI_WORD_TO_NUMBER[clean] !== undefined) {
    return HINDI_WORD_TO_NUMBER[clean];
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 2 && WORD_TO_NUMBER[parts[0]] && WORD_TO_NUMBER[parts[1]]) {
    return WORD_TO_NUMBER[parts[0]] + WORD_TO_NUMBER[parts[1]];
  }
  return null;
}

/**
 * Extracts structured person attributes from a freeform English, Hinglish, or Hindi (Devanagari) transcript.
 * Accurately handles Hindi grammatical gender, numbers, Devanagari proper nouns, physical markers, and rescue phrasing.
 */
export function parseDisasterVoiceTranscript(transcript: string): ParsedVoiceReport {
  const text = transcript.trim();
  const lower = text.toLowerCase();
  const entities: ParsedVoiceReport['extractedEntities'] = [];
  const attrs: Partial<CreateCaseWithReportInput> = {};

  // 1. GENDER DETECTION (English, Hinglish & Devanagari Hindi)
  const femaleDevanagari = /(?:^|[^\p{L}\p{N}])(लड़की|महिला|औरत|स्त्री|बेटी|पुत्री|माता|माँ|बहन|दादी|नानी|बच्ची|कन्या)(?=[^\p{L}\p{N}]|$)/iu;
  const femaleEnglish = /\b(girl|woman|female|lady|daughter|mother|sister|ladki|mahila|aurat|nani|dadi|beti)\b/i;

  const maleDevanagari = /(?:^|[^\p{L}\p{N}])(लड़का|पुरुष|आदमी|बेटा|पुत्र|पिता|बाप|भाई|दादा|नाना|बच्चा|बालक)(?=[^\p{L}\p{N}]|$)/iu;
  const maleEnglish = /\b(boy|man|male|gentleman|son|father|brother|ladka|purush|aadmi|bhai|chota ladka|beta)\b/i;

  if (femaleDevanagari.test(text) || femaleEnglish.test(lower)) {
    attrs.p_gender = 'Female';
    entities.push({ field: 'gender', value: 'Female', rawSnippet: 'Female' });
  } else if (maleDevanagari.test(text) || maleEnglish.test(lower)) {
    attrs.p_gender = 'Male';
    entities.push({ field: 'gender', value: 'Male', rawSnippet: 'Male' });
  }

  // 2. AGE DETECTION (Exact or Approximate, Digits, English Words & Hindi Words)
  const ageWordList = [
    '\\d{1,2}', '[०-९]{1,2}',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
    'twenty', 'twenty-one', 'twenty one', 'thirty', 'forty', 'fifty', 'sixty', 'sixty-four', 'sixty four', 'seventy', 'eighty',
    'एक', 'दो', 'तीन', 'चार', 'पाँच', 'पांच', 'छह', 'छः', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस',
    'बीस', 'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस',
    'तीस', 'पैंतीस', 'चालीस', 'पैंतालीस', 'पचास', 'पचपन', 'साठ', 'पैंसठ', 'सत्तर', 'अस्सी', 'नब्बे'
  ].join('|');

  const agePrefixPattern = new RegExp(
    `(?:age(?:d)?|umar|उम्र|आयु|वय|lagbhag|लगभग|करीब|around|about|approx(?:imately)?)\\s*(?:is|was|hai|of|है|की|का|के|होगी)?\\s*(${ageWordList})`,
    'iu'
  );
  const ageSuffixPattern = new RegExp(
    `(${ageWordList})\\s*(?:years?(?:\\s*old)?|saal|साल|वर्ष|yr|yrs|yo|की उम्र|का बच्चा|की बच्ची)`,
    'iu'
  );

  const ageMatch = text.match(agePrefixPattern) || text.match(ageSuffixPattern);

  if (ageMatch) {
    const rawVal = ageMatch[1];
    const parsedAge = parseSpokenNumber(rawVal);
    if (parsedAge && parsedAge > 0 && parsedAge < 120) {
      const isApprox =
        /around|about|approx|lagbhag|लगभग|करीब/i.test(ageMatch[0]) ||
        /child|kid|baccha|बच्चा|बच्ची|elderly|old|वृद्ध|बुजुर्ग/iu.test(text);

      if (isApprox) {
        attrs.p_approximate_age = parsedAge;
        entities.push({ field: 'approximate_age', value: parsedAge, rawSnippet: ageMatch[0].trim() });
      } else {
        attrs.p_age = parsedAge;
        attrs.p_approximate_age = parsedAge;
        entities.push({ field: 'age', value: parsedAge, rawSnippet: ageMatch[0].trim() });
      }
    }
  } else if (/\b(toddler|infant|baby|chota baccha)\b/i.test(lower) || /(?:छोटा\s*बच्चा|नवजात|शिशु)/u.test(text)) {
    attrs.p_approximate_age = 2;
    entities.push({ field: 'approximate_age', value: 2, rawSnippet: 'toddler' });
  }

  // 3. COMMUNICATION STATUS
  const cannotCommDevanagari = /(?:बोल\s*नहीं\s*सक|बोल\s*नहीं\s*पा|बोलने\s*में\s*असमर्थ|बातचीत\s*नहीं|अचेत|बेहोश|मूक|गूँगा|गूंगा|सदमे\s*में|शांत\s*है|जवाब\s*नहीं\s*दे|चुप\s*है|संवाद\s*नहीं)/u;
  const cannotCommEnglish = /\b(cannot speak|unable to speak|cannot communicate|unable to communicate|mute|unconscious|in shock|non-verbal|bol nahi|behosh|shock me|silent|cannot answer|speechless)\b/i;

  const canCommDevanagari = /(?:बोल\s*सक|बात\s*कर\s*सक|बात\s*कर\s*रहा|बात\s*कर\s*रही|नाम\s*बताया|जवाब\s*दे|सचेत|होश\s*में|बातचीत\s*करने\s*में\s*सक्षम|संवाद\s*कर)/u;
  const canCommEnglish = /\b(can communicate|able to communicate|speaks|able to speak|talked|said|told|bol raha|naam bataya|answers questions|responsive|conscious)\b/i;

  if (cannotCommDevanagari.test(text) || cannotCommEnglish.test(lower)) {
    attrs.p_comm_status = 'CANNOT_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CANNOT_COMMUNICATE', rawSnippet: 'CANNOT_COMMUNICATE' });
  } else if (canCommDevanagari.test(text) || canCommEnglish.test(lower)) {
    attrs.p_comm_status = 'CAN_COMMUNICATE' as CommunicationStatus;
    entities.push({ field: 'comm_status', value: 'CAN_COMMUNICATE', rawSnippet: 'CAN_COMMUNICATE' });
  }

  // 4. NAME DETECTION (Full Name takes highest priority, supports English and Hindi Devanagari)
  const disallowed = [
    'male', 'female', 'boy', 'girl', 'child', 'doctor', 'camp', 'control', 'ndrf',
    'hospital', 'boat', 'team', 'relief', 'and', 'my', 'the', 'reporting', 'at', 'in',
    'unconscious', 'stable', 'critical', 'looking', 'searching',
    'लड़का', 'लड़की', 'बच्चा', 'बच्चे', 'महिला', 'पुरुष', 'आदमी', 'डॉक्टर', 'अस्पताल',
    'कंट्रोल', 'संदेश', 'शिविर', 'कैंप', 'राहत', 'टीम', 'एनडीआरएफ', 'सदमे', 'चोट',
    'अलकनंदा', 'स्थान', 'नदी', 'रक्त', 'समूह', 'लापता', 'घायल', 'मरीज'
  ];

  let candidateName: string | null = null;

  // 4a. Hindi Devanagari Name Patterns
  const hindiNamePatterns = [
    /(?:पूरा\s*नाम|नाम\s*है|नाम\s*बताया|नाम\s*का|नाम\s*की|का\s*नाम|की\s*नाम|बच्चे\s*का\s*नाम|लड़के\s*का\s*नाम|लड़की\s*का\s*नाम|मरीज\s*का\s*नाम|लापता\s*का\s*नाम|मेरा\s*नाम)\s*(?:है\s*)?[:\-]?\s*([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)?)(?=\s+(?:है|और|का|की|के|में|पर|उम्र|[.,;!|।]|\s|$))/u,
    /(?:नाम)\s+([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)?)\s+है/u,
    /(?:नामक|नाम\s*का)\s+([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+)?)/u,
  ];

  for (const pat of hindiNamePatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const trimmed = m[1].trim();
      const firstWord = trimmed.split(/\s+/)[0];
      if (!disallowed.includes(firstWord.toLowerCase()) && !disallowed.includes(trimmed.toLowerCase())) {
        candidateName = trimmed;
        break;
      }
    }
  }

  // 4b. English Name Patterns
  if (!candidateName) {
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

    const engCandidate = fullNameMatch
      ? fullNameMatch[1]
      : generalNameMatch
      ? generalNameMatch[1]
      : familyRoleNameMatch
      ? familyRoleNameMatch[1]
      : selfNameMatch
      ? selfNameMatch[1]
      : null;

    if (engCandidate) {
      const rawName = engCandidate.trim();
      if (!disallowed.includes(rawName.toLowerCase())) {
        candidateName = rawName.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
  }

  if (candidateName) {
    attrs.p_full_name = candidateName;
    entities.push({ field: 'full_name', value: candidateName, rawSnippet: candidateName });
  }

  // 5. BLOOD GROUP DETECTION (English, Devanagari & Signs)
  // Handles: B+, B positive, बी+, बी पॉजिटिव, रक्त समूह बी पॉजिटिव, blood group O+, etc.
  const bloodMatch =
    text.match(/(?:रक्त\s*(?:समूह|वर्ग)|ब्लड\s*ग्रुप|blood(?:\s*group)?)\s*(?:is|was|hai|है|:)?\s*([ABOएबीओ]{1,2})\s*(\+|-|पॉजिटिव|पोज़िटिव|पॉज़िटिव|नेगेटिव|positive|negative|pos|neg)?/iu) ||
    text.match(/(?:^|[^\p{L}\p{N}])([ABOएबीओ]{1,2})\s*(\+|-|पॉजिटिव|पोज़िटिव|पॉज़िटिव|नेगेटिव|positive|negative|pos|neg)(?=[^\p{L}\p{N}]|$)/iu);

  if (bloodMatch) {
    let type = bloodMatch[1].toUpperCase();
    if (type === 'ए') type = 'A';
    else if (type === 'बी') type = 'B';
    else if (type === 'एबी') type = 'AB';
    else if (type === 'ओ') type = 'O';

    const rawSign = (bloodMatch[2] || '').toLowerCase();
    const isNeg = rawSign.startsWith('neg') || rawSign === '-' || rawSign.includes('नेगेटिव');
    const sign = isNeg ? '-' : '+';

    if (['A', 'B', 'AB', 'O'].includes(type)) {
      attrs.p_blood_group = `${type}${sign}`;
      entities.push({ field: 'blood_group', value: `${type}${sign}`, rawSnippet: bloodMatch[0].trim() });
    }
  }

  // 6. HEIGHT & WEIGHT EXTRACTION
  const heightFeetMatch =
    lower.match(/(?:height(?:\s*is|\s*was)?|कद|ऊंचाई|लम्बाई)\s*([०-९\d]{1})\s*(?:feet|foot|ft|फिट|फीट|')\s*([०-९\d]{1,2})?\s*(?:inches|in|इंच|")?/iu);
  const heightCmMatch =
    text.match(/(?:height(?:\s*is|\s*was)?|lambai|ऊंचाई|लम्बाई|कद)\s*([०-९\d]{2,3})\s*(?:cm|centimeters?|cms|सेमी|सेंटीमीटर)?/iu) ||
    text.match(/([०-९\d]{2,3})\s*(?:cm|centimeters?|cms|सेमी|सेंटीमीटर)/iu);

  if (heightFeetMatch) {
    const feet = parseSpokenNumber(heightFeetMatch[1]) || 0;
    const inches = heightFeetMatch[2] ? (parseSpokenNumber(heightFeetMatch[2]) || 0) : 0;
    const totalCm = Math.round((feet * 12 + inches) * 2.54);
    if (totalCm >= 40 && totalCm <= 250) {
      attrs.p_height_cm = totalCm;
      entities.push({ field: 'height_cm', value: totalCm, rawSnippet: heightFeetMatch[0] });
    }
  } else if (heightCmMatch) {
    const h = parseSpokenNumber(heightCmMatch[1]);
    if (h && h >= 40 && h <= 250) {
      attrs.p_height_cm = h;
      entities.push({ field: 'height_cm', value: h, rawSnippet: `${h} cm` });
    }
  }

  // Weight
  const weightMatch =
    text.match(/(?:weight(?:\s*is|\s*was)?|vajan|वजन|भार)\s*([०-९\d]{2,3})\s*(?:kg|kgs|kilos?|kilograms?|किलो|किग्रा|किलोग्राम)?/iu) ||
    text.match(/([०-९\d]{2,3})\s*(?:kg|kgs|kilos?|किलो|किग्रा|किलोग्राम)/iu);

  if (weightMatch) {
    const w = parseSpokenNumber(weightMatch[1]);
    if (w && w >= 3 && w <= 200) {
      attrs.p_weight_kg = w;
      entities.push({ field: 'weight_kg', value: w, rawSnippet: `${w} kg` });
    }
  }

  // 7. BUILD & HAIR
  const buildDevanagari = text.match(/(?:^|[^\p{L}\p{N}])(पतला|पतली|छरहरा|दुबला|दुबली|हल्का शरीर|एथलेटिक|मजबूत|कसरती|मध्यम|सामान्य|साधारण|भारी|मोटा|मोटी|तगड़ा)(?=[^\p{L}\p{N}]|$)/iu);
  const buildEnglish =
    lower.match(/\b(slim|athletic|medium|thin|heavy|stocky|lean|muscular|stout)\s*(?:type)?\s*build\b/i) ||
    lower.match(/build(?:\s*is|\s*type)?\s*(slim|athletic|medium|thin|heavy|stocky|lean|muscular|stout)\b/i);

  if (buildDevanagari) {
    const raw = buildDevanagari[1];
    let norm = 'Medium';
    if (/पतला|पतली|छरहरा|दुबला|दुबली|हल्का शरीर/u.test(raw)) norm = 'Slim';
    else if (/एथलेटिक|मजबूत|कसरती/u.test(raw)) norm = 'Athletic';
    else if (/भारी|मोटा|मोटी|तगड़ा/u.test(raw)) norm = 'Heavy';
    attrs.p_build = norm;
    entities.push({ field: 'build', value: norm, rawSnippet: raw });
  } else if (buildEnglish) {
    const b = buildEnglish[1].charAt(0).toUpperCase() + buildEnglish[1].slice(1).toLowerCase();
    attrs.p_build = b;
    entities.push({ field: 'build', value: b, rawSnippet: buildEnglish[0] });
  }

  const hairDevanagari = text.match(/(?:बाल\s*हैं|बाल|सिर के बाल)?\s*(छोटे\s*काले\s*बाल|लंबे\s*काले\s*बाल|काले\s*बाल|सफेद\s*बाल|भूरे\s*बाल|घुंघराले\s*बाल|गंजा|सीधे\s*बाल)/u);
  const hairEnglish =
    lower.match(/\b(short black|long black|gray and white|curly|bald|wavy|white curly|blonde|straight|brown|shoulder length)\s+hair\b/i) ||
    lower.match(/hair(?:\s*description)?(?:\s*is)?\s*([a-z\s]+?hair)\b/i);

  if (hairDevanagari) {
    const cleanHair = hairDevanagari[1].trim();
    attrs.p_hair_description = cleanHair;
    entities.push({ field: 'hair', value: cleanHair, rawSnippet: cleanHair });
  } else if (hairEnglish) {
    const h = (hairEnglish[1] || hairEnglish[0]).trim();
    const cleanHair = h.charAt(0).toUpperCase() + h.slice(1);
    attrs.p_hair_description = cleanHair;
    entities.push({ field: 'hair', value: cleanHair, rawSnippet: cleanHair });
  }

  // 8. PHYSICAL MARKS (Birthmarks, Scars, Tattoos, Accessories)
  const markSnippets: string[] = [];

  // Birthmarks (English & Hindi: तिल, मस्सा, जन्मचिह्न)
  const birthmarkDevanagari = text.match(/(?:कंधे|हाथ|पैर|पीठ|गाल|चेहरे)?\s*(?:पर)?\s*(?:छोटा|बड़ा)?\s*(?:तिल|मस्सा|जन्मचिह्न|दाग)/u);
  const birthmarkEnglish = lower.match(
    /(?:small|large|distinctive|heart-shaped)?\s*(?:\bbirthmark\b|\bmole\b|\btil\b)\s*(?:on|near|around|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i
  );
  if (birthmarkDevanagari) {
    const mark = birthmarkDevanagari[0].trim();
    attrs.p_birthmarks = mark;
    markSnippets.push(mark);
    entities.push({ field: 'birthmarks', value: mark, rawSnippet: mark });
  } else if (birthmarkEnglish) {
    const mark = birthmarkEnglish[0].trim();
    attrs.p_birthmarks = mark;
    markSnippets.push(mark);
    entities.push({ field: 'birthmarks', value: mark, rawSnippet: mark });
  }

  // Scars (English & Hindi: चोट का निशान, टांके, घाव, निशान)
  const scarDevanagari = text.match(/(?:भौंह|हाथ|माथे|कलाई|पैर|चेहरे|गाल|पेट)?\s*(?:पर|के ऊपर)?\s*(?:चोट\s*का\s*निशान|टांके\s*का\s*निशान|पुराना\s*निशान|चोट|घाव|जख्म|कटा\s*हुआ)/u);
  const scarEnglish = lower.match(
    /(?:visible\s+)?(?:\bscar\b|\bwound\b|\bcut\b|\blaceration\b|\bchot\b)\s*(?:on|above|near|around|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i
  );
  if (scarDevanagari) {
    const scar = scarDevanagari[0].trim();
    attrs.p_scars = scar;
    markSnippets.push(scar);
    entities.push({ field: 'scars', value: scar, rawSnippet: scar });
  } else if (scarEnglish) {
    const scar = scarEnglish[0].trim();
    attrs.p_scars = scar;
    markSnippets.push(scar);
    entities.push({ field: 'scars', value: scar, rawSnippet: scar });
  }

  // Tattoos (English & Hindi: गोदना, टैटू, ॐ, ओम)
  const tattooDevanagari = text.match(/(?:कलाई|हाथ|गर्दन|बांह)?\s*(?:पर)?\s*(?:गोदना|टैटू|ॐ|ओम)/u);
  const tattooEnglish = lower.match(
    /(?:\btattoo\b|\bgodna\b)\s*(?:of|on|near|ke upar)?\s*([a-z\s]+?)(?=[.,;!]|wearing|and|has|$)/i
  );
  if (tattooDevanagari) {
    const tattoo = tattooDevanagari[0].trim();
    attrs.p_tattoos = tattoo;
    markSnippets.push(tattoo);
    entities.push({ field: 'tattoos', value: tattoo, rawSnippet: tattoo });
  } else if (tattooEnglish) {
    const tattoo = tattooEnglish[0].trim();
    attrs.p_tattoos = tattoo;
    markSnippets.push(tattoo);
    entities.push({ field: 'tattoos', value: tattoo, rawSnippet: tattoo });
  }

  // Accessories (English & Hindi: काला धागा, ताबीज, रुद्राक्ष, चश्मा, अंगूठी, घड़ी, सीटी)
  const clueDevanagari = text.match(
    /(?:काला\s*धागा|रुद्राक्ष\s*(?:की\s*माला)?|ताबीज|चश्मा|सोने\s*की\s*चेन|अंगूठी|घड़ी|कड़ा|सीटी|लॉकेट)/u
  );
  const clueEnglish = text.match(
    /(?:black thread[a-zA-Z\s,'-]*wrist[a-zA-Z\s,'-]*charm|rudraksha bead|spectacles|digital watch|silver ring|canvas bag|glasses|hearing aid|necklace|whistle)/i
  );

  if (clueDevanagari) {
    const clue = clueDevanagari[0].trim();
    attrs.p_accessories = clue;
    markSnippets.push(clue);
    entities.push({ field: 'accessories', value: clue, rawSnippet: clue });
  } else if (clueEnglish) {
    const clue = clueEnglish[0].trim();
    attrs.p_accessories = clue;
    markSnippets.push(clue);
    entities.push({ field: 'accessories', value: clue, rawSnippet: clue });
  }

  if (markSnippets.length > 0) {
    attrs.p_identifying_clue = markSnippets.join(', ');
  }

  // 9. CLOTHING EXTRACTION (English & Hindi)
  const clothingDevanagariSuffix = text.match(
    /(?:^|[.,;!|।]|\s)(?:उसने|उन्होंने)?\s*([^\n.,;!|।]*(?:साड़ी|सूट|कुर्ता|पायजामा|शर्ट|टी-शर्ट|पैंट|जींस|निक्कर|हाफ\s*पैंट|हुडी|जैकेट|दुपट्टा|कपड़े|वस्त्र))\s*(?:पहना\s*है|पहनी\s*है|पहने\s*हुए|पहने\s*हैं)/u
  );
  const clothingDevanagariPrefix = text.match(
    /(?:उसने|उन्होंने)?\s*(?:पहने\s*हुए|पहनी\s*है|पहना\s*है|पहने\s*हैं|कपड़े)\s*[:\-]?\s*([^\n.;!|]+?)(?=[.;!|]|दाहिनी|बाएं|रक्त|शरीर|चोट|कलाई|हालत|और|$)/u
  );
  const clothingEnglish = lower.match(
    /(?:wearing|dressed in|pehne hue|pehni hai)\s+([a-z0-9,\s'-]+?)(?=[.;!]|has\b|with a\b|condition\b|blood\b|currently\b|she carries|$)/i
  );

  if (clothingDevanagariSuffix && clothingDevanagariSuffix[1].trim().length > 2) {
    attrs.p_clothing = clothingDevanagariSuffix[1].trim();
    entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: clothingDevanagariSuffix[0].trim() });
  } else if (clothingDevanagariPrefix && clothingDevanagariPrefix[1].trim().length > 3) {
    attrs.p_clothing = clothingDevanagariPrefix[1].trim();
    entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: clothingDevanagariPrefix[0].trim() });
  } else if (clothingEnglish && clothingEnglish[1].trim().length > 3 && !/^(shock|fear|pain|danger)/i.test(clothingEnglish[1].trim())) {
    attrs.p_clothing = clothingEnglish[1].trim();
    entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: clothingEnglish[0].trim() });
  } else {
    // Fallback: match known garments
    const garmentDevanagari = text.match(
      /(?:नीली|नीला|लाल|सफेद|काला|काली|हरा|हरी|पीला|पीली|गुलाबी|गहरे\s*रंग\s*का)?\s*(?:टी-शर्ट|शर्ट|कमीज|कुर्ता|पायजामा|साड़ी|पैंट|जींस|निक्कर|हाफ\s*पैंट|हुडी|जैकेट|दुपट्टा|चप्पल|जूते|स्नीकर)/gu
    );
    const garmentRegex =
      /\b(?:soiled\s+|torn\s+|pink\s+|red\s+|blue\s+|green\s+|dark\s+|black\s+|grey\s+|white\s+|yellow\s+)?(?:denim\s+|cotton\s+|leather\s+)?(?:polo shirt|t-shirt|shirt|shorts|jacket|saree|hoodie|track pants|pants|top|kurta|jeans)\b/gi;
    const garments = garmentDevanagari || lower.match(garmentRegex);
    if (garments && garments.length > 0) {
      attrs.p_clothing = garments.join(', ');
      entities.push({ field: 'clothing', value: attrs.p_clothing, rawSnippet: garments.join(', ') });
    }
  }

  // 10. LOCATION EXTRACTION (English & Hindi)
  const locationDevanagari = text.match(
    /(?:के\s*पास\s*से|तट\s*के\s*पास|से\s*बचाया|के\s*पास|स्थान\s*[:\-]?)\s*([^\n.,;!|]+?(?:नदी\s*तट|बाजार|शिविर|कैंप|पुल|अस्पताल|बायपास|सड़क|घाटी|राहत\s*क्षेत्र\s*\d+|राहत\s*कैंप|कॉलोनी|अलकनंदा|हल्द्वानी|भीमताल|मुक्तेश्वर|नैनीताल|उत्तराखंड))/u
  ) || text.match(/(अलकनंदा\s*(?:नदी\s*तट(?:\s*बाजार)?)?|हल्द्वानी\s*(?:बाईपास)?|भीमताल|मुक्तेश्वर|नैनीताल|ब्रिज\s*कॉलोनी)/u);

  const locationEnglish = text.match(
    /(?:from|near|at|around|rescued from|pulled[a-zA-Z\s]*from)\s+(?:a\s+|the\s+)?([A-Za-z0-9\s,'-]+?(?:riverside market|bypass|camp|bridge|market|hospital|road|valley|relief zone \d+|colony|hall|station|riverside|river|bhimtal|haldwani|mukteshwar|nainital|uttarakhand|sector \d+|ngo field|field camp|shelter))/i
  );

  if (locationDevanagari && (locationDevanagari[1] || locationDevanagari[0])) {
    const loc = (locationDevanagari[1] || locationDevanagari[0]).trim();
    attrs.p_found_location = loc;
    entities.push({ field: 'found_location', value: loc, rawSnippet: locationDevanagari[0].trim() });
  } else if (locationEnglish && locationEnglish[1]) {
    attrs.p_found_location = locationEnglish[1].trim();
    entities.push({ field: 'found_location', value: attrs.p_found_location, rawSnippet: locationEnglish[0].trim() });
  }

  // 11. SOURCE TYPE INFERENCE (English & Hindi)
  if (/(?:ngo|एनजीओ|राहत शिविर|स्वयंसेवक|relief alliance)/iu.test(text)) {
    attrs.p_source_type = 'NGO' as SourceType;
  } else if (/(?:ndrf|एनडीआरएफ|सेना|आर्मी|battalion|rescue team|boat team|बचाव दल|राहत दल)/iu.test(text)) {
    attrs.p_source_type = 'ARMY_RESCUE' as SourceType;
  } else if (/(?:hospital|अस्पताल|चिकित्सालय|emergency|trauma center|ट्रॉमा सेंटर|ambulance|एंबुलेंस|doctor|डॉक्टर)/iu.test(text)) {
    attrs.p_source_type = 'HOSPITAL' as SourceType;
  }

  // 12. CONDITION STATUS (English & Hindi)
  const conditionDevanagari = text.match(/(?:^|[^\p{L}\p{N}])(बेहोश|अचेत|गंभीर|नाजुक|स्थिर|सदमे में|सदमे|घायल|चोटिल|पानी की कमी|निर्जलीकरण|फ्रैक्चर)(?=[^\p{L}\p{N}]|$)/iu);
  const conditionEnglish = lower.match(/\b(unconscious|critical|stable|shock|injured|dehydrated|fracture|burns|fever|lacerations|trauma)\b/i);

  if (conditionDevanagari) {
    const c = conditionDevanagari[1];
    let norm = 'STABLE';
    if (/बेहोश|अचेत/u.test(c)) norm = 'UNCONSCIOUS';
    else if (/गंभीर|नाजुक/u.test(c)) norm = 'CRITICAL';
    else if (/सदमे/u.test(c)) norm = 'SHOCK';
    else if (/घायल|चोटिल/u.test(c)) norm = 'INJURED';
    else if (/पानी की कमी|निर्जलीकरण/u.test(c)) norm = 'DEHYDRATED';
    else if (/फ्रैक्चर/u.test(c)) norm = 'FRACTURE';

    attrs.p_condition_status = norm;
    entities.push({ field: 'condition_status', value: norm, rawSnippet: c });
  } else if (conditionEnglish) {
    attrs.p_condition_status = conditionEnglish[0].toUpperCase();
    entities.push({ field: 'condition_status', value: attrs.p_condition_status, rawSnippet: conditionEnglish[0].trim() });
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
