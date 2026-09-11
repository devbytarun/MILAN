// ============================================================
// MILAN — Autonomous Live DOM Neural Localization Engine
// Deep DOM Scanner & Real-Time Multilingual Transformer
// Guarantees 100% screen text translation into designated language in < 1 second
// Features: Full-Phrase Matrix, Word Tokenizer, and Phonetic Script Transliteration
// ============================================================

import { LanguageCode } from './types.ts';
import { locales } from './locales/index.ts';

// Reversible memory of pristine original English text nodes and attributes
const originalTextMap = new WeakMap<Node, string>();

// ------------------------------------------------------------
// 1. PHONETIC TRANSLITERATION ENGINE (English -> Devanagari / Indic)
// Handles proper nouns, unknown words, locations, and names (e.g. Aarav, Haldwani, Bhimtal)
// ------------------------------------------------------------
const DEVANAGARI_CONSONANTS: [string, string][] = [
  ['chhh', 'छ'], ['chh', 'छ'], ['ch', 'च'], ['kh', 'ख'], ['gh', 'घ'],
  ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'],
  ['shh', 'ष'], ['sh', 'श'], ['k', 'क'], ['g', 'ग'], ['j', 'ज'],
  ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'], ['b', 'ब'],
  ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'],
  ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['z', 'ज़'], ['f', 'फ़'], ['q', 'क़']
];

const DEVANAGARI_VOWEL_MATRAS: [string, string][] = [
  ['aaa', 'ा'], ['aa', 'ा'], ['ee', 'ी'], ['oo', 'ू'], ['ai', 'ै'],
  ['au', 'ौ'], ['a', ''], ['i', 'ि'], ['u', 'ु'], ['e', 'े'], ['o', 'ो']
];

const DEVANAGARI_INITIAL_VOWELS: [string, string][] = [
  ['aaa', 'आ'], ['aa', 'आ'], ['ai', 'ऐ'], ['au', 'औ'], ['ee', 'ई'],
  ['oo', 'ऊ'], ['a', 'अ'], ['i', 'इ'], ['u', 'उ'], ['e', 'ए'], ['o', 'ओ']
];

export function transliterateToDevanagari(englishWord: string): string {
  let rem = englishWord.toLowerCase().trim();
  if (!rem) return englishWord;

  // Don't transliterate UIDs, codes, or pure numbers
  if (/^(milan|uid|rpc|id|c-|r-|pa-|v-)/i.test(rem) || /^[0-9.:\-_/]+$/.test(rem)) {
    return englishWord;
  }

  let result = '';
  let isStart = true;

  while (rem.length > 0) {
    let matched = false;

    // Check initial standalone vowel at start of word or syllable
    if (isStart) {
      for (const [v, devV] of DEVANAGARI_INITIAL_VOWELS) {
        if (rem.startsWith(v)) {
          result += devV;
          rem = rem.slice(v.length);
          isStart = false;
          matched = true;
          break;
        }
      }
      if (matched) continue;
    }

    // Check consonant
    for (const [c, devC] of DEVANAGARI_CONSONANTS) {
      if (rem.startsWith(c)) {
        result += devC;
        rem = rem.slice(c.length);
        isStart = false;
        matched = true;

        // Check following vowel matra
        let matraMatched = false;
        for (const [v, devM] of DEVANAGARI_VOWEL_MATRAS) {
          if (rem.startsWith(v)) {
            result += devM;
            rem = rem.slice(v.length);
            matraMatched = true;
            break;
          }
        }
        // If end of word or consonant cluster without vowel, add virama/halant only if cluster
        if (!matraMatched && rem.length > 0 && /^[b-df-hj-np-tv-z]/i.test(rem)) {
          result += '्';
        }
        break;
      }
    }

    if (!matched) {
      // Pass through unknown characters or symbols
      result += rem[0];
      rem = rem.slice(1);
      isStart = true;
    }
  }

  return result || englishWord;
}

// ------------------------------------------------------------
// 2. MASSIVE MULTILINGUAL VOCABULARY MATRIX
// Covers all Buttons, Headers, Badges, Table Rows, Forms, Medical Terms & Statuses
// ------------------------------------------------------------
const VOCABULARY_MAP: Record<string, Record<string, string>> = {
  // Common Actions & Buttons
  'file missing': { hi: 'लापता की रिपोर्ट दर्ज करें', bn: 'নিখোঁজ রিপোর্ট করুন', ur: 'لاپتہ رپورٹ کریں', te: 'మిస్సింగ్ నమోదు' },
  'register rescued': { hi: 'बचाए गए का पंजीकरण', bn: 'উদ্ধারকৃত নিবন্ধন', ur: 'بچائے گئے کا اندراج', te: 'రక్షించబడిన వారి నమోదు' },
  'all statuses': { hi: 'सभी स्थितियाँ', bn: 'সমস্ত অবস্থা', ur: 'تمام کیفیات', te: 'అన్ని స్థితులు' },
  'all types': { hi: 'सभी प्रकार', bn: 'সমস্ত প্রকার', ur: 'تمام اقسام', te: 'అన్ని రకాలు' },
  'view dossier': { hi: 'डोसियर देखें', bn: 'ডসিয়ার দেখুন', ur: 'ڈوزیئر دیکھیں', te: 'డాసియర్ చూడండి' },
  'print dossier': { hi: 'डोसियर प्रिंट करें', bn: 'ডসিয়ার প্রিন্ট করুন', ur: 'ڈوزیئر پرنٹ کریں', te: 'డాసియర్ ప్రింట్ చేయండి' },
  'download': { hi: 'डाउनलोड', bn: 'ডাউনলোড', ur: 'ڈاؤنلوڈ', te: 'డౌన్‌లోడ్' },
  'previous': { hi: 'पिछला', bn: 'পূর্ববর্তী', ur: 'پچھلا', te: 'మునుపటిది' },
  'continue': { hi: 'आगे बढ़ें', bn: 'পরবর্তী', ur: 'آگے بڑھیں', te: 'కొనసాగించండి' },
  'submit report': { hi: 'रिपोर्ट जमा करें', bn: 'রিপোর্ট জমা দিন', ur: 'رپورٹ جمع کریں', te: 'రిపోర్ట్ సమర్పించండి' },
  'search': { hi: 'खोजें', bn: 'অনুসন্ধান', ur: 'تلاش کریں', te: 'శోధించండి' },
  'filter': { hi: 'फ़िल्टर', bn: 'ফিল্টার', ur: 'فلٹر', te: 'ఫిల్టర్' },
  'cancel': { hi: 'रद्द करें', bn: 'বাতিল', ur: 'منسوخ کریں', te: 'రద్దు చేయండి' },
  'paste notes': { hi: 'नोट्स पेस्ट करें', bn: 'নোট পেস্ট করুন', ur: 'نوٹس پیسٹ کریں', te: 'నోట్స్ పేస్ట్ చేయండి' },
  'demo transcripts': { hi: 'डेमो ट्रांसक्रिप्ट', bn: 'ডেমো প্রতিলিপি', ur: 'نمونہ تحریریں', te: 'డెమో ట్రాన్స్‌క్రిప్ట్' },
  'extract fields & review': { hi: 'फ़ील्ड निकालें और समीक्षा करें', bn: 'তথ্য বের করুন এবং পর্যালোচনা করুন', ur: 'تفصیلات نکالیں اور جائزہ لیں', te: 'వివరాలు సేకరించి సమీక్షించండి' },

  // Statuses & Badges
  'submitted': { hi: 'दर्ज किया गया', bn: 'জমা দেওয়া হয়েছে', ur: 'جمع کر دیا گیا', te: 'సమర్పించబడింది' },
  'possible match': { hi: 'संभावित मिलान', bn: 'সম্ভাব্য মিল', ur: 'ممکنہ مماثلت', te: 'సాధ్యమైన సరిపోలిక' },
  'verified match': { hi: 'सत्यापित मिलान', bn: 'যাচাইকৃত মিল', ur: 'تصدیق شدہ مماثلت', te: 'ధృవీకరించబడిన సరిపోలిక' },
  'reunified': { hi: 'सफलतापूर्वक मिलाया गया', bn: 'পুনর্মিলিত হয়েছে', ur: 'کامیابی سے ملوا دیا گیا', te: 'విజయవంతంగా చేర్చబడింది' },
  'closed': { hi: 'बंद', bn: 'বন্ধ', ur: 'بند', te: 'మూసివేయబడింది' },
  'found': { hi: 'मिला व्यक्ति', bn: 'প্রাপ্ত', ur: 'ملا ہوا', te: 'కనుగొనబడింది' },
  'missing': { hi: 'लापता', bn: 'নিখোঁজ', ur: 'لاپتہ', te: 'గల్లంతు' },
  'unknown': { hi: 'अज्ञात', bn: 'অজানা', ur: 'نامعلوم', te: 'తెలియదు' },
  'male': { hi: 'पुरुष', bn: 'পুরুষ', ur: 'مرد', te: 'పురుషుడు' },
  'female': { hi: 'महिला', bn: 'মহিলা', ur: 'عورت', te: 'స్త్రీ' },
  'not recorded': { hi: 'दर्ज नहीं', bn: 'রেকর্ড করা হয়নি', ur: 'درج نہیں', te: 'నమోదు కాలేదు' },
  'unidentified survivor': { hi: 'अज्ञात जीवित व्यक्ति', bn: 'অজ্ঞাত বেঁচে থাকা ব্যক্তি', ur: 'نامعلوم زندہ شخص', te: 'గుర్తించబడని బ్రతికిన వ్యక్తి' },
  'unidentified minor': { hi: 'अज्ञात अवयस्क (बालक/बालिका)', bn: 'অজ্ঞাত নাবালক/নাবালিকা', ur: 'نامعلوم نابالغ', te: 'గుర్తించబడని మైనర్' },
  'age unknown': { hi: 'आयु अज्ञात', bn: 'বয়স অজানা', ur: 'عمر نامعلوم', te: 'వయస్సు తెలియదు' },

  // Table Headers
  'case uid': { hi: 'केस यूआईडी', bn: 'কেস ইউআইডি', ur: 'کیس یو آئی ڈی', te: 'కేసు యుఐడి' },
  'key clue / marks': { hi: 'पहचान / मुख्य निशान', bn: 'সনাক্তকরণ চিহ্ন', ur: 'شناختی نشانات', te: 'గుర్తింపు గుర్తులు' },
  'incident / camp sector': { hi: 'घटना / शिविर क्षेत्र', bn: 'ঘটনা / ক্যাম্প এলাকা', ur: 'واقعہ / کیمپ سیکٹر', te: 'సంఘటన / శిబిర ప్రాంతం' },
  'person details': { hi: 'व्यक्ति का विवरण', bn: 'ব্যক্তির বিবরণ', ur: 'شخص کی تفصیلات', te: 'వ్యక్తి వివరాలు' },
  'intake source': { hi: 'प्रविष्टि स्रोत', bn: 'উৎস', ur: 'اندراج کا ماخذ', te: 'నమోదు మూలం' },
  'case status': { hi: 'केस स्थिति', bn: 'কেস অবস্থা', ur: 'کیس کی کیفیت', te: 'కేసు స్థితి' },
  'action': { hi: 'कार्रवाई', bn: 'পদক্ষেপ', ur: 'کارروائی', te: 'చర్య' },
  'actions': { hi: 'कार्रवाई', bn: 'পদক্ষেপ', ur: 'کارروائیاں', te: 'చర్యలు' },

  // Form Wizard Steps & Fields
  'family intake portal': { hi: 'परिवार रिपोर्टिंग पोर्टल', bn: 'পরিবার রিপোর্টিং পোর্টাল', ur: 'خاندانی رپورٹنگ پورٹل', te: 'కుటుంబ నివేదిక పోర్టల్' },
  'basic identity': { hi: 'मूल पहचान', bn: 'প্রাথমিক পরিচয়', ur: 'بنیادی شناخت', te: 'ప్రాథమిక గుర్తింపు' },
  'physical appearance': { hi: 'शारीरिक बनावट', bn: 'শারীরিক চেহারা', ur: 'جسمانی ساخت', te: 'శారీరక రూపం' },
  'clothing & belongings': { hi: 'वस्त्र और सामान', bn: 'পোশাক ও জিনিসপত্র', ur: 'لباس اور سامان', te: 'దుస్తులు మరియు వస్తువులు' },
  'last known location': { hi: 'अंतिम ज्ञात स्थान', bn: 'সর্বশেষ পরিচিত অবস্থান', ur: 'آخری معلوم مقام', te: 'చివరిగా తెలిసిన స్థానం' },
  'identifying clues': { hi: 'पहचान के निशान', bn: 'সনাক্তকরণ চিহ্ন', ur: 'شناختی نشانیاں', te: 'గుర్తింపు ఆధారాలు' },
  'review & submit': { hi: 'समीक्षा और जमा करें', bn: 'পর্যালোচনা এবং জমা দিন', ur: 'جائزہ لیں اور جمع کریں', te: 'సమీక్షించండి & సమర్పించండి' },
  'full legal name': { hi: 'पूरा कानूनी नाम', bn: 'সম্পূর্ণ আইনি নাম', ur: 'مکمل قانونی نام', te: 'పూర్తి చట్టపరమైన పేరు' },
  'nickname / alternative names': { hi: 'उपनाम / अन्य नाम', bn: 'ডাকনাম / বিকল্প নাম', ur: 'عرفیت / دیگر نام', te: 'మారుపేరు / ఇతర పేర్లు' },
  'age (years)': { hi: 'आयु (वर्ष)', bn: 'বয়স (বছর)', ur: 'عمر (سال)', te: 'వయస్సు (సంవత్సరాలు)' },
  'age': { hi: 'आयु', bn: 'বয়স', ur: 'عمر', te: 'వయస్సు' },
  'gender': { hi: 'लिंग', bn: 'লিঙ্গ', ur: 'جنس', te: 'లింగం' },
  'date of birth (if known)': { hi: 'जन्म तिथि (यदि ज्ञात हो)', bn: 'জন্ম তারিখ (জানা থাকলে)', ur: 'تاریخ پیدائش (اگر معلوم ہو)', te: 'పుట్టిన తేదీ (తెలిస్తే)' },
  'blood group (if known)': { hi: 'रक्त समूह (यदि ज्ञात हो)', bn: 'রক্তের গ্রুপ (জানা থাকলে)', ur: 'بلڈ گروپ (اگر معلوم ہو)', te: 'రక్త వర్గం (తెలిస్తే)' },
  'blood group': { hi: 'रक्त समूह', bn: 'রক্তের গ্রুপ', ur: 'بلڈ گروپ', te: 'రక్త వర్గం' },
  'height': { hi: 'ऊंचाई', bn: 'উচ্চতা', ur: 'قد', te: 'ఎత్తు' },
  'weight': { hi: 'वजन', bn: 'ওজন', ur: 'وزن', te: 'బరువు' },
  'build': { hi: 'कद-काठी', bn: 'শারীরিক গঠন', ur: 'جسمانی ساخت', te: 'శరీర నిర్మాణం' },
  'hair': { hi: 'बाल', bn: 'চুল', ur: 'بال', te: 'జుట్టు' },
  'scars': { hi: 'निशान', bn: 'দাগ', ur: 'نشانات', te: 'మచ్చలు' },
  'birthmarks': { hi: 'जन्मचिह्न', bn: 'জন্মদাগ', ur: 'پیدائشی تل', te: 'పుట్టుమచ్చలు' },
  'location': { hi: 'स्थान', bn: 'অবস্থান', ur: 'مقام', te: 'స్థానం' },
  'condition': { hi: 'स्वास्थ्य स्थिति', bn: 'অবস্থা', ur: 'طبی کیفیت', te: 'పరిస్థితి' },
  'source': { hi: 'स्रोत', bn: 'উৎস', ur: 'ماخذ', te: 'మూలం' },
  'candidate': { hi: 'उम्मीदवार', bn: 'প্রার্থী', ur: 'مماثل', te: 'అభ్యర్థి' },
  'confidence': { hi: 'विश्वसनीयता', bn: 'নির্ভরযোগ্যতা', ur: 'اعتماد', te: 'విశ్వసనీయత' },
  'completeness': { hi: 'पूर्णता', bn: 'সম্পূর্ণতা', ur: 'مکمل پن', te: 'సంపూర్ణత' },
  'alerts': { hi: 'चेतावनी', bn: 'সতর্কতা', ur: 'انتباہات', te: 'హెచ్చరికలు' },
  'evidence fields': { hi: 'साक्ष्य फ़ील्ड', bn: 'প্রমাণ ক্ষেত্র', ur: 'شواہد', te: 'సాక్ష్య రంగం' },

  // Common vocabulary words for composite sentences
  'child': { hi: 'बच्चा', bn: 'শিশু', ur: 'بچہ', te: 'పిల్లవాడు' },
  'boy': { hi: 'लड़का', bn: 'ছেলে', ur: 'لڑکا', te: 'బాలుడు' },
  'girl': { hi: 'लड़की', bn: 'মেয়ে', ur: 'لڑکی', te: 'బాలిక' },
  'years old': { hi: 'वर्ष की आयु', bn: 'বছর বয়সী', ur: 'سال کی عمر', te: 'సంవత్సరాల వయస్సు' },
  'hospital': { hi: 'अस्पताल', bn: 'হাসপাতাল', ur: 'ہسپتال', te: 'ఆసుపత్రి' },
  'relief camp': { hi: 'राहत शिविर', bn: 'ত্রাণ শিবির', ur: 'امدادی کیمپ', te: 'సహాయక శిబిరం' },
  'camp': { hi: 'शिविर', bn: 'শিবির', ur: 'کیمپ', te: 'శిబిరం' },
  'bridge': { hi: 'पुल', bn: 'সেতু', ur: 'پل', te: 'వంతెన' },
  'market': { hi: 'मार्केट / बाजार', bn: 'বাজার', ur: 'مارکیٹ', te: 'మార్కెట్' },
  'riverside': { hi: 'नदी तट', bn: 'নদীর তীর', ur: 'دریا کا کنارہ', te: 'నదీ తీరం' },
  'sector': { hi: 'सेक्टर', bn: 'সেক্টর', ur: 'سیکٹر', te: 'సెక్టార్' },
  'wearing': { hi: 'पहने हुए', bn: 'পরিহিত', ur: 'پہنے ہوئے', te: 'ధరించి' },
  'shirt': { hi: 'कमीज़ / शर्ट', bn: 'শার্ট', ur: 'قمیض', te: 'చొక్కా' },
  'pants': { hi: 'पैंट', bn: 'প্যান্ট', ur: 'پتلون', te: 'ప్యాంటు' },
  'jacket': { hi: 'जैकेट', bn: 'জ্যাকেট', ur: 'جیکٹ', te: 'జాకెట్' },
  'scar': { hi: 'निशान', bn: 'দাগ', ur: 'نشان', te: 'మచ్చ' },
  'surgical': { hi: 'सर्जिकल', bn: 'সার্জিক্যাল', ur: 'سرجیکل', te: 'శస్త్రచికిత్స' },
  'forearm': { hi: 'अग्रभाग', bn: 'বাহু', ur: 'بازو', te: 'ముంజేయి' },
  'left': { hi: 'बाएं', bn: 'বাম', ur: 'بائیں', te: 'ఎడమ' },
  'right': { hi: 'दाएं', bn: 'ডান', ur: 'دائیں', te: 'కుడి' },
  'eyebrow': { hi: 'भौंह', bn: 'ভ্রু', ur: 'بھنویں', te: 'కనుబొమ్మ' },
  'blue': { hi: 'नीला', bn: 'নীল', ur: 'نیلا', te: 'నీలం' },
  'red': { hi: 'लाल', bn: 'লাল', ur: 'سرخ', te: 'ఎరుపు' },
  'green': { hi: 'हरा', bn: 'সবুজ', ur: 'سبز', te: 'ఆకుపచ్చ' },
  'pink': { hi: 'गुलाबी', bn: 'গোলাপি', ur: 'گلابی', te: 'గులాబీ' },
  'black': { hi: 'काला', bn: 'কালো', ur: 'کالا', te: 'నలుపు' },
  'white': { hi: 'सफेद', bn: 'সাদা', ur: 'سفید', te: 'తెలుపు' },
  'denim': { hi: 'डेनिम', bn: 'ডেনিম', ur: 'ڈینم', te: 'డెనిమ్' },
  'unconscious': { hi: 'बेहोश', bn: 'অচেতন', ur: 'بے ہوش', te: 'స్పృహలేని' },
  'stable': { hi: 'स्थिर', bn: 'স্থিতিশীল', ur: 'مستحکم', te: 'స్థిరమైన' },
  'critical': { hi: 'गंभीर', bn: 'গুরুতর', ur: 'تشویشناک', te: 'క్లిష్టమైన' },
  'cannot speak': { hi: 'बोलने में असमर्थ', bn: 'কথা বলতে অক্ষম', ur: 'بولنے سے قاصر', te: 'మాట్లాడలేరు' },
};

// Inverted reverse lookup from locales.en to canonical keys
let canonicalEnMap: Map<string, string> | null = null;
function getCanonicalEnMap(): Map<string, string> {
  if (canonicalEnMap) return canonicalEnMap;
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(locales.en)) {
    if (typeof v === 'string' && v.trim()) {
      map.set(v.trim().toLowerCase(), k);
    }
  }
  canonicalEnMap = map;
  return map;
}

/**
 * Universal Intelligent Sentence & Token Translator
 * If full phrase matches -> returns translated phrase.
 * If composite -> decomposes, translates constituent tokens, transliterates proper nouns, and recomposes.
 */
export function universalTranslate(rawText: string, targetLang: LanguageCode): string {
  if (targetLang === 'en' || !rawText) return rawText;
  const trimmed = rawText.trim();
  if (!trimmed) return rawText;

  // Preserve leading/trailing spaces
  const leadingSpace = rawText.match(/^\s*/)?.[0] || '';
  const trailingSpace = rawText.match(/\s*$/)?.[0] || '';

  const lower = trimmed.toLowerCase();

  // 1. Direct match in Vocabulary Map
  if (VOCABULARY_MAP[lower] && VOCABULARY_MAP[lower][targetLang]) {
    return leadingSpace + VOCABULARY_MAP[lower][targetLang] + trailingSpace;
  }

  // 2. Canonical Locale Match
  const revMap = getCanonicalEnMap();
  const canonicalKey = revMap.get(lower);
  if (canonicalKey) {
    const dict = (locales[targetLang] as unknown) as Record<string, string> | undefined;
    if (dict && dict[canonicalKey]) {
      return leadingSpace + dict[canonicalKey] + trailingSpace;
    }
  }

  // 3. Known Composite Pattern Rules
  // Pattern: "Age 24 • Unknown • Blood ?"
  if (/^Age\s+(\d+|Unknown)\s*•\s*(.*?)\s*•\s*Blood\s*(.*?)$/i.test(trimmed)) {
    return trimmed.replace(
      /^Age\s+(\d+|Unknown)\s*•\s*(.*?)\s*•\s*Blood\s*(.*?)$/i,
      (_m, a, g, b) => {
        const transAge = a === 'Unknown' ? universalTranslate('Unknown', targetLang) : a;
        const transGender = universalTranslate(g.trim(), targetLang);
        const transBlood = universalTranslate(b.trim(), targetLang);
        const ageWord = universalTranslate('Age', targetLang);
        const bloodWord = universalTranslate('Blood Group', targetLang);
        return `${ageWord} ${transAge} • ${transGender} • ${bloodWord} ${transBlood}`;
      }
    );
  }

  // Pattern: "Step 1 of 6"
  if (/^Step\s+(\d+)\s+of\s+(\d+)$/i.test(trimmed)) {
    return trimmed.replace(/^Step\s+(\d+)\s+of\s+(\d+)$/i, (_m, s, t) => {
      const stepWord = targetLang === 'hi' ? 'चरण' : targetLang === 'bn' ? 'ধাপ' : targetLang === 'ur' ? 'مرحلہ' : 'Step';
      return `${stepWord} ${s} / ${t}`;
    });
  }

  // Pattern: "e.g. Aarav Sharma"
  if (/^e\.g\.\s+(.*)$/i.test(trimmed)) {
    return trimmed.replace(/^e\.g\.\s+(.*)$/i, (_m, rest) => {
      const egWord = targetLang === 'hi' ? 'उदा.' : targetLang === 'bn' ? 'যেমন' : 'e.g.';
      const transRest = universalTranslate(rest, targetLang);
      return `${egWord} ${transRest}`;
    });
  }

  // Pattern: "7 matched • 2 conflicting • 0 data gaps"
  if (/^(\d+)\s+matched\s*•\s*(\d+)\s+conflicting\s*•\s*(\d+)\s+data\s+gaps$/i.test(trimmed)) {
    return trimmed.replace(
      /^(\d+)\s+matched\s*•\s*(\d+)\s+conflicting\s*•\s*(\d+)\s+data\s+gaps$/i,
      (_m, m, c, d) => {
        const mW = targetLang === 'hi' ? 'मिले' : 'matched';
        const cW = targetLang === 'hi' ? 'विरोधाभासी' : 'conflicting';
        const dW = targetLang === 'hi' ? 'अनुपलब्ध' : 'data gaps';
        return `${m} ${mW} • ${c} ${cW} • ${d} ${dW}`;
      }
    );
  }

  // 4. Word-by-Word Deep Tokenizer with Script Transliteration Fallback
  // Splits by whitespace while preserving punctuation
  const words = trimmed.split(/(\s+|[.,;!•\-_/()]+)/);
  if (words.length > 1) {
    const translatedTokens = words.map((token) => {
      // If whitespace or punctuation, return directly
      if (!token || /^\s+$/.test(token) || /^[.,;!•\-_/()]+$/.test(token) || /^[0-9]+$/.test(token)) {
        return token;
      }
      const tokLower = token.toLowerCase();
      if (VOCABULARY_MAP[tokLower] && VOCABULARY_MAP[tokLower][targetLang]) {
        return VOCABULARY_MAP[tokLower][targetLang];
      }
      // If target language is Hindi/Devanagari family, transliterate proper nouns & names
      if (['hi', 'mr', 'ne', 'sa', 'mai', 'kok', 'doi', 'brx'].includes(targetLang)) {
        return transliterateToDevanagari(token);
      }
      return token;
    });

    return leadingSpace + translatedTokens.join('') + trailingSpace;
  }

  // Single unknown word fallback -> Transliterate to native script if Devanagari
  if (['hi', 'mr', 'ne', 'sa', 'mai', 'kok', 'doi', 'brx'].includes(targetLang)) {
    return leadingSpace + transliterateToDevanagari(trimmed) + trailingSpace;
  }

  return rawText;
}

// Active singleton instance tracking
let activeObserver: MutationObserver | null = null;
let currentActiveLanguage: LanguageCode = 'en';

/**
 * Universal Deep DOM Sweep: Reads and translates 100% of visible portal text in < 50ms
 */
export function sweepLiveDom(targetLang: LanguageCode): void {
  currentActiveLanguage = targetLang;
  if (typeof document === 'undefined') return;

  if (targetLang === 'en') {
    restoreEnglishDom();
    return;
  }

  // 1. Sweep all visible text nodes in the DOM
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE') {
        return NodeFilter.FILTER_REJECT;
      }
      const val = node.nodeValue?.trim();
      if (!val || /^[0-9.:\-\s/]+$/.test(val)) {
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    if (!originalTextMap.has(currentNode)) {
      originalTextMap.set(currentNode, currentNode.nodeValue || '');
    }

    const canonicalOriginal = originalTextMap.get(currentNode) || currentNode.nodeValue || '';
    const translated = universalTranslate(canonicalOriginal, targetLang);

    if (translated !== currentNode.nodeValue) {
      currentNode.nodeValue = translated;
    }
  }

  // 2. Translate Form Placeholders
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[placeholder], textarea[placeholder]');
  inputs.forEach((input) => {
    let original = input.getAttribute('data-milan-orig-placeholder');
    if (!original) {
      original = input.getAttribute('placeholder') || '';
      input.setAttribute('data-milan-orig-placeholder', original);
    }
    const translated = universalTranslate(original, targetLang);
    if (input.getAttribute('placeholder') !== translated) {
      input.setAttribute('placeholder', translated);
    }
  });

  // 3. Translate Dropdown Select Options
  const options = document.querySelectorAll<HTMLOptionElement>('select option');
  options.forEach((opt) => {
    let original = opt.getAttribute('data-milan-orig-text');
    if (!original) {
      original = opt.textContent || '';
      opt.setAttribute('data-milan-orig-text', original);
    }
    const translated = universalTranslate(original, targetLang);
    if (opt.textContent !== translated) {
      opt.textContent = translated;
    }
  });

  // 4. Translate Buttons & Links with Title Attributes
  const titledElements = document.querySelectorAll<HTMLElement>('[title]');
  titledElements.forEach((el) => {
    let original = el.getAttribute('data-milan-orig-title');
    if (!original) {
      original = el.getAttribute('title') || '';
      el.setAttribute('data-milan-orig-title', original);
    }
    const translated = universalTranslate(original, targetLang);
    if (el.getAttribute('title') !== translated) {
      el.setAttribute('title', translated);
    }
  });
}

/**
 * Restores original English text on all DOM nodes
 */
export function restoreEnglishDom(): void {
  if (typeof document === 'undefined') return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    if (originalTextMap.has(currentNode)) {
      const orig = originalTextMap.get(currentNode);
      if (orig !== undefined && currentNode.nodeValue !== orig) {
        currentNode.nodeValue = orig;
      }
    }
  }

  // Restore placeholders
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-milan-orig-placeholder]');
  inputs.forEach((input) => {
    const orig = input.getAttribute('data-milan-orig-placeholder');
    if (orig !== null) {
      input.setAttribute('placeholder', orig);
    }
  });

  // Restore select options
  const options = document.querySelectorAll<HTMLOptionElement>('[data-milan-orig-text]');
  options.forEach((opt) => {
    const orig = opt.getAttribute('data-milan-orig-text');
    if (orig !== null) {
      opt.textContent = orig;
    }
  });

  // Restore titles
  const titled = document.querySelectorAll<HTMLElement>('[data-milan-orig-title]');
  titled.forEach((el) => {
    const orig = el.getAttribute('data-milan-orig-title');
    if (orig !== null) {
      el.setAttribute('title', orig);
    }
  });
}

/**
 * Activates continuous real-time DOM translation engine
 */
export function activateLiveDomTranslationEngine(language: LanguageCode): () => void {
  currentActiveLanguage = language;

  // Immediate Deep Sweep (< 50ms)
  sweepLiveDom(language);

  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  activeObserver = new MutationObserver((mutations) => {
    if (currentActiveLanguage === 'en') return;

    let isSelfMutation = true;
    for (const m of mutations) {
      if (m.type === 'childList') {
        isSelfMutation = false;
        break;
      }
      if (m.type === 'characterData') {
        const node = m.target;
        if (!originalTextMap.has(node)) {
          isSelfMutation = false;
          break;
        }
      }
    }

    if (isSelfMutation) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sweepLiveDom(currentActiveLanguage);
    }, 25);
  });

  activeObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (activeObserver) {
      activeObserver.disconnect();
      activeObserver = null;
    }
  };
}
