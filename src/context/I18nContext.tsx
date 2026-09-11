import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'ur'
  | 'as';

export interface LanguageInfo {
  code: LanguageCode;
  label: string; // Native script
  englishName: string;
  isRTL?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', englishName: 'English' },
  { code: 'hi', label: 'हिन्दी', englishName: 'Hindi' },
  { code: 'bn', label: 'বাংলা', englishName: 'Bengali' },
  { code: 'ta', label: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', label: 'తెలుగు', englishName: 'Telugu' },
  { code: 'mr', label: 'मराठी', englishName: 'Marathi' },
  { code: 'gu', label: 'ગુજરાતી', englishName: 'Gujarati' },
  { code: 'kn', label: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { code: 'or', label: 'ଓଡ଼ିଆ', englishName: 'Odia' },
  { code: 'ur', label: 'اردو', englishName: 'Urdu', isRTL: true },
  { code: 'as', label: 'অসমীয়া', englishName: 'Assamese' },
];

export interface TranslationDictionary {
  // Navigation & Brand
  nav_brand_title: string;
  nav_brand_sub: string;
  nav_cases: string;
  nav_review: string;
  nav_report: string;
  nav_dashboard: string;
  nav_emergency_call: string;

  // Crisis Gateway / Hero
  hero_tag: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_missing: string;
  hero_cta_found: string;
  hero_cta_hospital: string;
  emergency_notice_title: string;
  emergency_notice_desc: string;

  // Reconciliation Pipeline
  pipeline_title: string;
  pipeline_sub: string;
  pipeline_step1_title: string;
  pipeline_step1_desc: string;
  pipeline_step2_title: string;
  pipeline_step2_desc: string;
  pipeline_step3_title: string;
  pipeline_step3_desc: string;
  pipeline_step4_title: string;
  pipeline_step4_desc: string;

  // Live System UI
  status_live: string;
  status_syncing: string;
  status_offline: string;
  status_demo_tag: string;
  shelters_connected: string;
  hospitals_linked: string;
  cases_reconciled: string;

  // Common Actions & Form
  btn_continue: string;
  btn_previous: string;
  btn_submit: string;
  btn_cancel: string;
  voice_input_trigger: string;
  voice_input_title: string;
  voice_input_hint: string;
  voice_input_parse: string;

  // Verification & Review
  ai_candidate_tag: string;
  human_verify_tag: string;
  review_queue_title: string;
  review_audit_desc: string;
  confidence_score: string;

  // Family Status
  family_status_title: string;
  family_status_reassurance: string;
  family_what_we_know: string;
  family_what_next: string;
}

const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    nav_brand_title: 'MILAN',
    nav_brand_sub: 'Disaster Coordination',
    nav_cases: 'Case Directory',
    nav_review: 'Verification Audit',
    nav_report: 'File Report',
    nav_dashboard: 'Operations Hub',
    nav_emergency_call: 'Emergency Desk (1078 / 112)',

    hero_tag: 'National Disaster Reconciliation Network',
    hero_headline: 'Reconciling Families in the Midst of Crisis',
    hero_subheadline: 'Multi-source disaster coordination linking family missing-person reports, field rescue admissions, and hospital triage records through explainable attribute matching and mandatory human verification.',
    hero_cta_missing: 'Report Missing Relative',
    hero_cta_found: 'Register Rescued Survivor',
    hero_cta_hospital: 'Hospital Patient Intake',
    emergency_notice_title: 'Immediate Danger & First Responders Notice',
    emergency_notice_desc: 'MILAN complements disaster management but does not dispatch rescue boats. For life-threatening emergencies, call NDRF (1078), Emergency Services (112), or Ambulance (108).',

    pipeline_title: 'How MILAN Reconciles Separated Families',
    pipeline_sub: 'Fragmented data from flooded sectors, relief camps, and hospitals is unified with mathematical explainability.',
    pipeline_step1_title: '1. Multi-Source Intake',
    pipeline_step1_desc: 'Reports arrive from distraught families, field NDRF rescue teams, and district emergency wards.',
    pipeline_step2_title: '2. Normalization & Safety',
    pipeline_step2_desc: 'Physical marks, scars, non-verbal statuses, and clothing clues are indexed without biometric invasion.',
    pipeline_step3_title: '3. Deterministic Matching',
    pipeline_step3_desc: 'Weighted fuzzy algorithm identifies candidate connections with complete evidence explanations.',
    pipeline_step4_title: '4. Human Verification',
    pipeline_step4_desc: 'Relief officers audit candidate evidence side-by-side. No match is confirmed automatically without human sign-off.',

    status_live: 'OPERATIONAL LIVE',
    status_syncing: 'SYNCING QUEUE',
    status_offline: 'OFFLINE BLACKOUT ACTIVE',
    status_demo_tag: 'DEMO / EVALUATION SANDBOX',
    shelters_connected: 'Active Relief Camps',
    hospitals_linked: 'Triage Hospitals Linked',
    cases_reconciled: 'Verified Reunions',

    btn_continue: 'Continue',
    btn_previous: 'Previous',
    btn_submit: 'Submit Official Report',
    btn_cancel: 'Cancel',
    voice_input_trigger: 'Radio / Voice Intake',
    voice_input_title: 'Voice & Radio Transcript Parser',
    voice_input_hint: 'Speak or paste field rescue audio/radio transcripts. The AI parses gender, age, physical marks, clothing, and camp location.',
    voice_input_parse: 'Extract Attributes to Form',

    ai_candidate_tag: 'AI-Assisted Candidate Match',
    human_verify_tag: 'Mandatory Human Verification Required',
    review_queue_title: 'Match Verification Queue',
    review_audit_desc: 'Side-by-side forensic evidence evaluation before notifying families.',
    confidence_score: 'Candidate Confidence',

    family_status_title: 'Honest Case Status',
    family_status_reassurance: 'Waiting during a disaster is painful. Here is the verifiable truth of what relief officers are checking right now.',
    family_what_we_know: 'Recorded Information Under Verification',
    family_what_next: 'What Happens Next in the Relief Grid',
  },

  hi: {
    nav_brand_title: 'मिलन (MILAN)',
    nav_brand_sub: 'आपदा समन्वय प्रणाली',
    nav_cases: 'केस डायरेक्टरी',
    nav_review: 'सत्यापन समीक्षा',
    nav_report: 'रिपोर्ट दर्ज करें',
    nav_dashboard: 'अभियान केंद्र',
    nav_emergency_call: 'आपातकालीन हेल्पलाइन (1078 / 112)',

    hero_tag: 'राष्ट्रीय आपदा परिवार पुनर्मिलन नेटवर्क',
    hero_headline: 'संकट की घड़ी में अपनों को अपनों से मिलाना',
    hero_subheadline: 'लापता परिजनों की रिपोर्ट, बचाव शिविरों की प्रविष्टियों और अस्पताल के रिकॉर्ड्स को पारदर्शी मिलान और मानवीय सत्यापन द्वारा जोड़ने वाली समन्वय प्रणाली।',
    hero_cta_missing: 'लापता परिजन की रिपोर्ट दर्ज करें',
    hero_cta_found: 'मिले हुए व्यक्ति का पंजीकरण करें',
    hero_cta_hospital: 'अस्पताल मरीज प्रविष्टि',
    emergency_notice_title: 'आपातकालीन सुरक्षा एवं सहायता सूचना',
    emergency_notice_desc: 'मिलन आपदा समन्वय का कार्य करता है। तत्काल जीवन संकट की स्थिति में सीधे एनडीआरएफ (1078) या आपातकालीन सेवा (112) से संपर्क करें।',

    pipeline_title: 'मिलन प्रणाली किस प्रकार कार्य करती है?',
    pipeline_sub: 'राहत शिविरों, अस्पतालों और परिवारों की सूचनाओं का पारदर्शी एवं विश्वसनीय मिलान।',
    pipeline_step1_title: '1. बहु-स्रोतीय प्रविष्टि',
    pipeline_step1_desc: 'परिजनों, एनडीआरएफ बचाव दलों और अस्पतालों से सूचनाएं दर्ज होती हैं।',
    pipeline_step2_title: '2. शारीरिक पहचान वर्गीकरण',
    pipeline_step2_desc: 'पहचान के निशान, कपड़े, आयु और स्थिति का सुरक्षित डाटाबेस तैयार किया जाता है।',
    pipeline_step3_title: '3. पारदर्शी मिलान प्रणाली',
    pipeline_step3_desc: 'एल्गोरिदम संभावित समानताएं ढूंढता है और प्रमाण सहित प्रस्तुत करता है।',
    pipeline_step4_title: '4. मानवीय सत्यापन अनिवार्य',
    pipeline_step4_desc: 'राहत अधिकारी प्रमाणों की सीधी जांच करते हैं। किसी भी मिलान की पुष्टि बिना मानवीय जांच के नहीं होती।',

    status_live: 'प्रणाली सक्रिय (LIVE)',
    status_syncing: 'डाटा सिंक हो रहा है',
    status_offline: 'ऑफलाइन मोड सक्रिय',
    status_demo_tag: 'डेमो / मूल्यांकन वातावरण',
    shelters_connected: 'सक्रिय राहत शिविर',
    hospitals_linked: 'संबद्ध अस्पताल',
    cases_reconciled: 'पुष्ट पुनर्मिलन',

    btn_continue: 'आगे बढ़ें',
    btn_previous: 'पीछे जाएं',
    btn_submit: 'आधिकारिक रिपोर्ट दर्ज करें',
    btn_cancel: 'रद्द करें',
    voice_input_trigger: 'रेडियो / आवाज से दर्ज करें',
    voice_input_title: 'वॉयस व रेडियो ट्रांसक्रिप्ट विश्लेषक',
    voice_input_hint: 'फील्ड रेस्क्यू का संदेश बोलें या पेस्ट करें। प्रणाली आयु, वस्त्र, निशान और स्थान स्वतः पहचान लेगी।',
    voice_input_parse: 'पहचाने गए विवरण फॉर्म में भरें',

    ai_candidate_tag: 'संभावित मिलान सुझाव (AI)',
    human_verify_tag: 'मानवीय सत्यापन आवश्यक',
    review_queue_title: 'मिलान सत्यापन कतार',
    review_audit_desc: 'परिवार को सूचित करने से पूर्व दोनों रिकॉर्ड्स का आमने-सामने प्रमाण परीक्षण।',
    confidence_score: 'समानता प्रतिशत',

    family_status_title: 'पारदर्शी केस स्थिति',
    family_status_reassurance: 'आपदा में प्रतीक्षा कठिन होती है। आपकी रिपोर्ट पर राहत दल वर्तमान में क्या कर रहे हैं, उसकी सटीक स्थिति:',
    family_what_we_know: 'सिस्टम में दर्ज विवरण',
    family_what_next: 'आगे की राहत प्रक्रिया',
  },

  bn: {
    nav_brand_title: 'মিলন (MILAN)',
    nav_brand_sub: 'দুর্যোগ সমন্বয় ব্যবস্থা',
    nav_cases: 'কেস তালিকা',
    nav_review: 'যাচাইকরণ অডিট',
    nav_report: 'রিপোর্ট দায়ের করুন',
    nav_dashboard: 'অপারেশন কেন্দ্র',
    nav_emergency_call: 'জরুরি হেল্পলাইন (1078 / 112)',

    hero_tag: 'জাতীয় দুর্যোগ পরিবার পুনর্মিলন নেটওয়ার্ক',
    hero_headline: 'সংকটের মুহূর্তে পরিবারগুলিকে একত্রিত করা',
    hero_subheadline: 'নিখোঁজ ব্যক্তিদের রিপোর্ট, উদ্ধার শিবিরের তথ্য এবং হাসপাতালের রেকর্ড সমন্বয় করে পরিবারগুলিকে সুরক্ষিতভাবে সংযুক্ত করার মানবিক প্ল্যাটফর্ম।',
    hero_cta_missing: 'নিখোঁজ স্বজনের রিপোর্ট দিন',
    hero_cta_found: 'উদ্ধারকৃত ব্যক্তির নিবন্ধন করুন',
    hero_cta_hospital: 'হাসপাতাল রোগী ভর্তি',
    emergency_notice_title: 'জরুরি জীবন রক্ষা নির্দেশিকা',
    emergency_notice_desc: 'মিলন তথ্য সমন্বয় করে। তাৎক্ষণিক জীবন বাঁচাতে সরাসরি NDRF (1078) বা পুলিশ/অ্যাম্বুলেন্স (112) নম্বরে কল করুন।',

    pipeline_title: 'মিলন কীভাবে নিখোঁজ ব্যক্তিদের খুঁজে বের করে?',
    pipeline_sub: 'উদ্ধার শিবির ও হাসপাতালের রেকর্ড থেকে তথ্য যাচাইয়ের স্বচ্ছ ধাপ।',
    pipeline_step1_title: '১. বিভিন্ন উৎস থেকে তথ্য সংগ্রহ',
    pipeline_step1_desc: 'পরিবার, উদ্ধারকারী দল ও হাসপাতাল থেকে তথ্য নথিভুক্ত হয়।',
    pipeline_step2_title: '২. শারীরিক বৈশিষ্ট্যের শ্রেণীকরণ',
    pipeline_step2_desc: 'পোশাক, দাগ ও চিহ্নের ভিত্তিতে তথ্য সুবিন্যস্ত করা হয়।',
    pipeline_step3_title: '৩. প্রমাণসহ মিল অনুসন্ধান',
    pipeline_step3_desc: 'গাণিতিক অ্যালগরিদম সম্ভাব্য মিলের তালিকা তৈরি করে।',
    pipeline_step4_title: '৪. আধিকারিক দ্বারা চূড়ান্ত যাচাই',
    pipeline_step4_desc: 'ত্রুটিহীন সত্যতা নিশ্চিত করতে অফিসাররা উভয় রেকর্ড সরাসরি মিলিয়ে দেখেন।',

    status_live: 'সক্রিয় নেটওয়ার্ক (LIVE)',
    status_syncing: 'তথ্য সিঙ্ক হচ্ছে',
    status_offline: 'অফলাইন মোড সক্রিয়',
    status_demo_tag: 'ডেমো / পরীক্ষামূলক তথ্য',
    shelters_connected: 'সক্রিয় ত্রাণ শিবির',
    hospitals_linked: 'সংযুক্ত হাসপাতাল',
    cases_reconciled: 'নিশ্চিত পুনর্মিলন',

    btn_continue: 'এগিয়ে যান',
    btn_previous: 'পূর্ববর্তী',
    btn_submit: 'অফিসিয়াল রিপোর্ট জমা দিন',
    btn_cancel: 'বাতিল',
    voice_input_trigger: 'রেডিও / ভয়েস ইনপুট',
    voice_input_title: 'ভয়েস এবং রেডিও বার্তা বিশ্লেষক',
    voice_input_hint: 'উদ্ধারকারী দলের অডিও বার্তা বলুন বা লিখুন। সিস্টেম স্বয়ংক্রিয়ভাবে বয়স, পোশাক ও অবস্থান বের করে নেবে।',
    voice_input_parse: 'ফর্ম পূরণ করুন',

    ai_candidate_tag: 'সম্ভাব্য মিলের পরামর্শ (AI)',
    human_verify_tag: 'বাধ্যতামূলক মানবিক যাচাই প্রয়োজন',
    review_queue_title: 'যাচাইকরণ কিউ',
    review_audit_desc: 'পরিবারকে আশ্বস্ত করার পূর্বে উভয় তথ্যের বিশদ প্রমাণ অডিট।',
    confidence_score: 'সম্ভাবনার হার',

    family_status_title: 'স্বচ্ছ কেস স্ট্যাটাস',
    family_status_reassurance: 'দুর্যোগের সময়ে পরিবারের জন্য প্রতিটি মুহূর্ত মূল্যবান। আপনার মামলার বর্তমান সঠিক অবস্থা:',
    family_what_we_know: 'নথিবদ্ধ শনাক্তকরণ বিবরণ',
    family_what_next: 'পরবর্তী উদ্ধার প্রক্রিয়া',
  },

  ta: {
    nav_brand_title: 'மிலன் (MILAN)',
    nav_brand_sub: 'பேரிடர் ஒருங்கிணைப்பு',
    nav_cases: 'வழக்குகள்',
    nav_review: 'சரிபார்ப்பு தணிக்கை',
    nav_report: 'புகார் பதிவு',
    nav_dashboard: 'செயல்பாட்டு மையம்',
    nav_emergency_call: 'அவசர உதவி (1078 / 112)',

    hero_tag: 'தேசிய பேரிடர் குடும்ப மறுஇணைவு கட்டமைப்பு',
    hero_headline: 'பேரிடர் காலத்தில் பிரிந்த குடும்பங்களை இணைத்தல்',
    hero_subheadline: 'காணாமல் போனோர் புகார்கள், மீட்பு முகாம் தரவுகள் மற்றும் மருத்துவமனை பதிவுகளை வெளிப்படையாக ஒப்பிட்டு சரிபார்க்கும் தொழில்நுட்பம்.',
    hero_cta_missing: 'காணாமல் போன உறவினரை பதிவு செய்க',
    hero_cta_found: 'மீட்கப்பட்டவரை பதிவு செய்க',
    hero_cta_hospital: 'மருத்துவமனை சேர்க்கை',
    emergency_notice_title: 'முக்கிய அவசர அறிவிப்பு',
    emergency_notice_desc: 'மிலன் பேரிடர் தகவல் ஒருங்கிணைப்பு தளம். உடனடி உயிர்காக்கும் உதவிக்கு 112 அல்லது NDRF 1078 எண்ணை அழைக்கவும்.',

    pipeline_title: 'மிலன் செயல்படும் விதம்',
    pipeline_sub: 'முகாம்கள் மற்றும் மருத்துவமனைகளின் பதிவுகளை வெளிப்படையாக ஒப்பிட்டு மனித சரிபார்ப்பை உறுதி செய்தல்.',
    pipeline_step1_title: '1. பல ஆதார உள்ளீடு',
    pipeline_step1_desc: 'குடும்பங்கள், மீட்புக் குழுக்கள் மற்றும் மருத்துவமனைகளிடமிருந்து புகார்கள் பெறப்படுகின்றன.',
    pipeline_step2_title: '2. அடையாள தரவு கட்டமைப்பு',
    pipeline_step2_desc: 'அடையாளக் குறிகள், உடைகள் மற்றும் வயது விவரங்கள் வகைப்படுத்தப்படுகின்றன.',
    pipeline_step3_title: '3. துல்லியமான ஒப்பீடு',
    pipeline_step3_desc: 'ஆதாரங்களுடன் கூடிய சாத்தியமான பொருத்தங்களை அல்காரிதம் கண்டறிகிறது.',
    pipeline_step4_title: '4. மனித சரிபார்ப்பு கட்டாயம்',
    pipeline_step4_desc: 'நிவாரண அதிகாரிகள் சான்றுகளை ஒப்பிட்ட பிறகே உறுதி செய்யப்படுகிறது.',

    status_live: 'செயல்பாட்டில் உள்ளது (LIVE)',
    status_syncing: 'தரவு ஒத்திசைக்கப்படுகிறது',
    status_offline: 'ஆஃப்லைன் முறை செயலில்',
    status_demo_tag: 'மாதிரி / மதிப்பீட்டு தரவு',
    shelters_connected: 'செயலில் உள்ள முகாம்கள்',
    hospitals_linked: 'இணைக்கப்பட்ட மருத்துவமனைகள்',
    cases_reconciled: 'உறுதிசெய்யப்பட்ட மறுஇணைவுகள்',

    btn_continue: 'தொடர்க',
    btn_previous: 'முந்தையது',
    btn_submit: 'புகாரை சமர்ப்பிக்கவும்',
    btn_cancel: 'ரத்து செய்',
    voice_input_trigger: 'குரல் / வானொலி உள்ளீடு',
    voice_input_title: 'குரல் மற்றும் ரேடியோ செய்தி பிரித்தெடுப்பு',
    voice_input_hint: 'மீட்புக் குழுவின் உரையாடலைப் பேசவும் அல்லது தட்டச்சு செய்யவும். அடையாளங்கள் தானாக நிரப்பப்படும்.',
    voice_input_parse: 'விவரங்களை படிவத்தில் சேர்க்க',

    ai_candidate_tag: 'சாத்தியமான பொருத்தம் (AI)',
    human_verify_tag: 'மனித சரிபார்ப்பு அவசியம்',
    review_queue_title: 'சரிபார்ப்பு வரிசை',
    review_audit_desc: 'குடும்பத்தினருக்கு அறிவிக்கும் முன் சான்றுகளின் முழுமையான தணிக்கை.',
    confidence_score: 'பொருத்த சதவிகிதம்',

    family_status_title: 'நேர்மையான வழக்கு நிலை',
    family_status_reassurance: 'காத்திருப்பது கடினம் என்பதை அறிவோம். உங்கள் வழக்கு குறித்து நிவாரணக் குழுக்கள் தற்போது செய்துவரும் பணிகள்:',
    family_what_we_know: 'பதிவுசெய்யப்பட்ட விவரங்கள்',
    family_what_next: 'அடுத்த கட்ட நடவடிக்கைகள்',
  },

  te: {
    nav_brand_title: 'మిలన్ (MILAN)',
    nav_brand_sub: 'విపత్తు సమన్వయ వ్యవస్థ',
    nav_cases: 'కేసుల జాబితా',
    nav_review: 'ధృవీకరణ ఆడిట్',
    nav_report: 'రిపోర్ట్ చేయండి',
    nav_dashboard: 'ఆపరేషన్స్ హబ్',
    nav_emergency_call: 'అత్యవసర హెల్ప్‌లైన్ (1078 / 112)',

    hero_tag: 'జాతీయ విపత్తు కుటుంబ పునఃకలయిక నెట్‌వర్క్',
    hero_headline: 'సంక్షోభంలో ఉన్న కుటుంబాలను సురక్షితంగా కలపడం',
    hero_subheadline: 'గల్లంతైన వారి వివరాలు, సహాయ శిబిరాల రికార్డులు మరియు ఆసుపత్రి రోగుల సమాచారాన్ని సమన్వయం చేసి సరిపోల్చే మానవతా వేదిక.',
    hero_cta_missing: 'గల్లంతైన వారి వివరాలు నమోదు',
    hero_cta_found: 'రక్షించబడిన వారి నమోదు',
    hero_cta_hospital: 'ఆసుపత్రి రోగి నమోదు',
    emergency_notice_title: 'అత్యవసర రక్షణ సూచన',
    emergency_notice_desc: 'మిలన్ విపత్తు సమాచారాన్ని సమన్వయం చేస్తుంది. తక్షణ ప్రాణ రక్షణ కోసం NDRF (1078) లేదా 112 నంబర్‌ను సంప్రదించండి.',

    pipeline_title: 'మిలన్ సమాచారాన్ని ఎలా సరిపోలుస్తుంది?',
    pipeline_sub: 'వివిధ శిబిరాలు మరియు ఆసుపత్రుల రికార్డులను పారదర్శకంగా పరిశీలించే విధానం.',
    pipeline_step1_title: '1. బహుళ ఆధారాల నమోదు',
    pipeline_step1_desc: 'కుటుంబాలు, రక్షణ బృందాలు మరియు ఆసుపత్రుల నుండి సమాచారం చేరుతుంది.',
    pipeline_step2_title: '2. భౌతిక లక్షణాల వర్గీకరణ',
    pipeline_step2_desc: 'పుట్టుమచ్చలు, గాయాలు, దుస్తులు మరియు వయస్సు ఆధారంగా గుర్తింపు.',
    pipeline_step3_title: '3. అల్గోరిథమిక్ సరిపోలిక',
    pipeline_step3_desc: 'సాక్ష్యాధారాలతో కూడిన సమానత్వ వివరాలను సిస్టమ్ గుర్తిస్తుంది.',
    pipeline_step4_title: '4. మానవ ధృవీకరణ తప్పనిసరి',
    pipeline_step4_desc: 'అధికారులు స్వయంగా రికార్డులను పరిశీలించిన తర్వాతే ధృవీకరిస్తారు.',

    status_live: 'ప్రత్యక్షంగా ఉంది (LIVE)',
    status_syncing: 'సింక్ అవుతోంది',
    status_offline: 'ఆఫ్‌లైన్ మోడ్ సక్రియం',
    status_demo_tag: 'డెమో / నమూనా డేటా',
    shelters_connected: 'సహాయ శిబిరాలు',
    hospitals_linked: 'అనుసంధానించబడిన ఆసుపత్రులు',
    cases_reconciled: 'ధృవీకరించబడిన కలయికలు',

    btn_continue: 'కొనసాగించండి',
    btn_previous: 'వెనుకకు',
    btn_submit: 'అధికారిక నివేదిక సమర్పించండి',
    btn_cancel: 'రద్దు',
    voice_input_trigger: 'వాయిస్ / రేడియో ఇన్‌పుట్',
    voice_input_title: 'వాయిస్ మరియు రేడియో సందేశ పార్సర్',
    voice_input_hint: 'ఫీల్డ్ రెస్క్యూ ఆడియో మాట్లాడండి లేదా టైప్ చేయండి. సిస్టమ్ వివరాలను గుర్తిస్తుంది.',
    voice_input_parse: 'ఫారమ్‌లో వివరాలు నింపండి',

    ai_candidate_tag: 'సరిపోలే అవకాశం (AI)',
    human_verify_tag: 'మానవ ధృవీకరణ అవసరం',
    review_queue_title: 'సమీక్ష జాబితా',
    review_audit_desc: 'కుటుంబ సభ్యులకు సమాచారం అందించే ముందు సాక్ష్యాల పూర్తి పరిశీలన.',
    confidence_score: 'సరిపోలిక శాతం',

    family_status_title: 'కేసు వాస్తవ స్థితి',
    family_status_reassurance: 'విపత్తు సమయంలో నిరీక్షణ కష్టమైనదని మాకు తెలుసు. ప్రస్తుతం రక్షణ అధికారులు చేస్తున్న కార్యాచరణ:',
    family_what_we_know: 'నమోదైన గుర్తింపు వివరాలు',
    family_what_next: 'తదుపరి సహాయక చర్యలు',
  },

  mr: {
    nav_brand_title: 'मिलन (MILAN)',
    nav_brand_sub: 'आपत्ती समन्वय प्रणाली',
    nav_cases: 'केस सूची',
    nav_review: 'पडताळणी पुनरावलोकन',
    nav_report: 'माहिती नोंदवा',
    nav_dashboard: 'ऑपरेशन्स केंद्र',
    nav_emergency_call: 'आपत्कालीन हेल्पलाईन (1078 / 112)',

    hero_tag: 'राष्ट्रीय आपत्ती कुटुंब पुनर्मिलन नेटवर्क',
    hero_headline: 'संकट काळात कुटुंबांना पुन्हा एकत्र आणणे',
    hero_subheadline: 'बेपत्ता व्यक्तींच्या नोंदी, बचाव शिबिरांचा डेटा आणि रुग्णालयांची माहिती जुळवून सुरक्षित पुनर्मिलन घडवून आणणारी प्रणाली.',
    hero_cta_missing: 'बेपत्ता व्यक्तीची नोंद करा',
    hero_cta_found: 'सापडलेल्या व्यक्तीची नोंद करा',
    hero_cta_hospital: 'रुग्णालय प्रवेश नोंद',
    emergency_notice_title: 'तातडीची मदत सूचना',
    emergency_notice_desc: 'मिलन आपत्ती माहिती समन्वय करते. तत्काळ जीवनरक्षणासाठी एनडीआरएफ (1078) किंवा आपत्कालीन सेवा (112) वर संपर्क करा.',

    pipeline_title: 'मिलन कार्य कसे करते?',
    pipeline_sub: 'राहत शिबिरे आणि रुग्णालयातील नोंदींची पारदर्शक पडताळणी प्रक्रिया.',
    pipeline_step1_title: '१. बहु-स्रोत नोंदणी',
    pipeline_step1_desc: 'कुटुंबे, बचाव पथके आणि रुग्णालयांकडून माहिती संकलित केली जाते.',
    pipeline_step2_title: '२. वैशिष्ट्यांचे वर्गीकरण',
    pipeline_step2_desc: 'शरीरावरील खुणा, कपडे, वय आणि प्रकृतीनुसार माहितीचे सुरक्षित संकलन.',
    pipeline_step3_title: '३. स्पष्ट जुळणी शोध',
    pipeline_step3_desc: 'अल्गोरिदम पुरावे आणि समानतेच्या आधारे संभाव्य जुळणी सादर करतो.',
    pipeline_step4_title: '४. मानवी पडताळणी अनिवार्य',
    pipeline_step4_desc: 'अधिकारी स्वतः दोन्ही नोंदी तपासतात; कोणत्याही जुळणीची आपोआप खात्री केली जात नाही.',

    status_live: 'थेट सक्रिय (LIVE)',
    status_syncing: 'डेटा समक्रमित होत आहे',
    status_offline: 'ऑफलाइन मोड सक्रिय',
    status_demo_tag: 'डेमो / मूल्यमापन डेटा',
    shelters_connected: 'सक्रिय बचाव शिबिरे',
    hospitals_linked: 'जोडलेली रुग्णालये',
    cases_reconciled: 'पुष्टी झालेले पुनर्मिलन',

    btn_continue: 'पुढे जा',
    btn_previous: 'मागे जा',
    btn_submit: 'अधिकृत नोंदणी सादर करा',
    btn_cancel: 'रद्द करा',
    voice_input_trigger: 'व्हॉइस / रेडिओ इनपुट',
    voice_input_title: 'व्हॉइस आणि रेडिओ मेसेज पार्सर',
    voice_input_hint: 'रेस्क्यू ऑडिओ संदेश बोला किंवा टाईप करा. प्रणाली तपशील आपोआप भरून देईल.',
    voice_input_parse: 'तपशील फॉर्ममध्ये भरा',

    ai_candidate_tag: 'संभाव्य जुळणी (AI)',
    human_verify_tag: 'मानवी पडताळणी आवश्यक',
    review_queue_title: 'पडताळणी रांग',
    review_audit_desc: 'कुटुंबाला कळवण्यापूर्वी पुराव्यांची समोरासमोर तपासणी.',
    confidence_score: 'जुळणी टक्केवारी',

    family_status_title: 'केसची खरी स्थिती',
    family_status_reassurance: 'आपत्तीच्या वेळी वाट पाहणे कठीण असते. तुमच्या केसवर सध्या बचाव पथके काय काम करत आहेत याची स्थिती:',
    family_what_we_know: 'नोंदवलेली ओळख वैशिष्ट्ये',
    family_what_next: 'पुढील बचाव प्रक्रिया',
  },

  gu: {
    nav_brand_title: 'મિલન (MILAN)',
    nav_brand_sub: 'આપત્તિ સંકલન વ્યવસ્થા',
    nav_cases: 'કેસ સૂચિ',
    nav_review: 'ચકાસણી ઓડિટ',
    nav_report: 'રિપોર્ટ નોંધાવો',
    nav_dashboard: 'ઓપરેશન્સ હબ',
    nav_emergency_call: 'ઇમરજન્સી હેલ્પલાઇન (1078 / 112)',

    hero_tag: 'રાષ્ટ્રીય આપત્તિ પુનર્મિલન નેટવર્ક',
    hero_headline: 'આપત્તિ સમયે પરિવારોનું સુરક્ષિત પુનર્મિલન',
    hero_subheadline: 'ગુમ થયેલ વ્યક્તિઓની માહિતી, રાહત કેમ્પો અને હોસ્પિટલોના રેકોર્ડ્સને પારદર્શક રીતે મેળવીને પુનર્મિલન કરાવતું પ્લેટફોર્મ.',
    hero_cta_missing: 'ગુમ થયેલ સ્વજનની નોંધણી',
    hero_cta_found: 'મળી આવેલ વ્યક્તિની નોંધણી',
    hero_cta_hospital: 'હોસ્પિટલ દર્દી એન્ટ્રી',
    emergency_notice_title: 'જીવન સુરક્ષા મહત્વપૂર્ણ સૂચના',
    emergency_notice_desc: 'મિલન માહિતી સંકલન કરે છે. તાત્કાલિક જીવન રક્ષણ માટે સીધા જ NDRF (1078) અથવા 112 પર કોલ કરો.',

    pipeline_title: 'મિલન કેવી રીતે કાર્ય કરે છે?',
    pipeline_sub: 'રાહત કેમ્પો અને હોસ્પિટલોના ડેટાની પારદર્શક ચકાસણી પદ્ધતિ.',
    pipeline_step1_title: '૧. વિવિધ સ્રોતમાંથી માહિતી',
    pipeline_step1_desc: 'પરિવારો, રેસ્ક્યુ ટીમો અને હોસ્પિટલો દ્વારા વિગતો દાખલ થાય છે.',
    pipeline_step2_title: '૨. ઓળખ ચિહ્નોનું વર્ગીકરણ',
    pipeline_step2_desc: 'શરીરના નિશાન, કપડાં, ઉંમર અને સ્થિતિની સુરક્ષિત નોંધણી.',
    pipeline_step3_title: '૩. પુરાવા આધારિત સરખામણી',
    pipeline_step3_desc: 'સિસ્ટમ સંભવિત સમાનતા દર્શાવતા કેસોની યાદી બનાવે છે.',
    pipeline_step4_title: '૪. માનવીય ચકાસણી અનિવાર્ય',
    pipeline_step4_desc: 'અધિકારીઓ પુરાવા તપાસીને જ અંતિમ પુષ્ટિ કરે છે.',

    status_live: 'સિસ્ટમ સક્રિય (LIVE)',
    status_syncing: 'ડેટા સિંક થઈ રહ્યો છે',
    status_offline: 'ઓફલાઇન મોડ સક્રિય',
    status_demo_tag: 'ડેમો / મૂલ્યાંકન ડેટા',
    shelters_connected: 'સક્રિય રાહત કેમ્પ',
    hospitals_linked: 'જોડાયેલ હોસ્પિટલો',
    cases_reconciled: 'પુષ્ટ થયેલ પુનર્મિલન',

    btn_continue: 'આગળ વધો',
    btn_previous: 'પાછળ જાઓ',
    btn_submit: 'સત્તાવાર રિપોર્ટ સબમિટ કરો',
    btn_cancel: 'રદ કરો',
    voice_input_trigger: 'વોઇસ / રેડિયો ઇનપુટ',
    voice_input_title: 'વોઇસ અને રેડિયો મેસેજ પ્રોસેસર',
    voice_input_hint: 'રેસ્ક્યુ ઓડિયો સંદેશ બોલો અથવા લખો. સિસ્ટમ વિગતો ઓળખીને ફોર્મ ભરશે.',
    voice_input_parse: 'વિગતો ફોર્મમાં ઉમેરો',

    ai_candidate_tag: 'સંભવિત સમાનતા (AI)',
    human_verify_tag: 'માનવીય ચકાસણી જરૂરી',
    review_queue_title: 'ચકાસણી કતાર',
    review_audit_desc: 'પરિવારને જાણ કરતાં પહેલાં પુરાવાઓની પ્રત્યક્ષ ચકાસણી.',
    confidence_score: 'સમાનતા ટકાવારી',

    family_status_title: 'કેસની સચોટ સ્થિતિ',
    family_status_reassurance: 'આપત્તિમાં રાહ જોવી મુશ્કેલ છે. તમારી નોંધણી પર અધિકારીઓ હાલ શું કાર્યવાહી કરી રહ્યા છે તેની સ્થિતિ:',
    family_what_we_know: 'નોંધાયેલ ઓળખ વિગતો',
    family_what_next: 'આગળની રાહત પ્રક્રિયા',
  },

  kn: {
    nav_brand_title: 'ಮಿಲನ್ (MILAN)',
    nav_brand_sub: 'ವಿಪತ್ತು ಸಮನ್ವಯ ವ್ಯವಸ್ಥೆ',
    nav_cases: 'ಪ್ರಕರಣಗಳ ಪಟ್ಟಿ',
    nav_review: 'ಪರಿಶೀಲನಾ ಆಡಿಟ್',
    nav_report: 'ವರದಿ ದಾಖಲಿಸಿ',
    nav_dashboard: 'ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ',
    nav_emergency_call: 'ತುರ್ತು ಸಹಾಯವಾಣಿ (1078 / 112)',

    hero_tag: 'ರಾಷ್ಟ್ರೀಯ ವಿಪತ್ತು ಕುಟುಂಬ ಪುನರ್ಮಿಲನ ಜಾಲ',
    hero_headline: 'ಸಂಕಷ್ಟದಲ್ಲಿರುವ ಕುಟುಂಬಗಳ ಸುರಕ್ಷಿತ ಪುನರ್ಮಿಲನ',
    hero_subheadline: 'ನಾಪತ್ತೆಯಾದವರ ವರದಿಗಳು, ಪರಿಹಾರ ಶಿಬಿರಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ ದಾಖಲೆಗಳನ್ನು ಸಮನ್ವಯಗೊಳಿಸಿ ಮಾನವ ಪರಿಶೀಲನೆಯೊಂದಿಗೆ ಕುಟುಂಬಗಳನ್ನು ಜೋಡಿಸುವ ವ್ಯವಸ್ಥೆ.',
    hero_cta_missing: 'ನಾಪತ್ತೆಯಾದವರ ವರದಿ ದಾಖಲಿಸಿ',
    hero_cta_found: 'ಪತ್ತೆಯಾದ ವ್ಯಕ್ತಿಯನ್ನು ನೋಂದಾಯಿಸಿ',
    hero_cta_hospital: 'ಆಸ್ಪತ್ರೆ ರೋಗಿ ದಾಖಲಾತಿ',
    emergency_notice_title: 'ತುರ್ತು ಜೀವ ರಕ್ಷಣೆ ಸೂಚನೆ',
    emergency_notice_desc: 'ಮಿಲನ್ ಮಾಹಿತಿ ಸಮನ್ವಯ ಮಾಡುತ್ತದೆ. ತಕ್ಷಣದ ಜೀವ ರಕ್ಷಣೆಗೆ NDRF (1078) ಅಥವಾ 112 ಗೆ ಕರೆ ಮಾಡಿ.',

    pipeline_title: 'ಮಿಲನ್ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?',
    pipeline_sub: 'ಶಿಬಿರಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳಿಂದ ಲಭ್ಯವಿರುವ ದಾಖಲೆಗಳನ್ನು ಪಾರದರ್ಶಕವಾಗಿ ಹೋಲಿಸುವ ವಿಧಾನ.',
    pipeline_step1_title: '೧. ಬಹು-ಮೂಲಗಳ ಮಾಹಿತಿ ಸಂಗ್ರಹ',
    pipeline_step1_desc: 'ಕುಟುಂಬಗಳು, ರಕ್ಷಣಾ ಪಡೆಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳಿಂದ ವರದಿಗಳು ಬರುತ್ತವೆ.',
    pipeline_step2_title: '೨. ಭೌತಿಕ ಲಕ್ಷಣಗಳ ವರ್ಗೀಕರಣ',
    pipeline_step2_desc: 'ಗುರುತುಗಳು, ಬಟ್ಟೆ, ವಯಸ್ಸು ಮತ್ತು ಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ ದಾಖಲಾತಿ.',
    pipeline_step3_title: '೩. ಪುರಾವೆ ಆಧಾರಿತ ಹೋಲಿಕೆ',
    pipeline_step3_desc: 'ಅಲ್ಗಾರಿದಮ್ ಸಂಭವನೀಯ ಹೋಲಿಕೆಗಳನ್ನು ಪುರಾವೆಗಳೊಂದಿಗೆ ಪತ್ತೆಮಾಡುತ್ತದೆ.',
    pipeline_step4_title: '೪. ಮಾನವ ಪರಿಶೀಲನೆ ಕಡ್ಡಾಯ',
    pipeline_step4_desc: 'ಅಧಿಕಾರಿಗಳು ಖುದ್ದಾಗಿ ಪರಿಶೀಲಿಸಿದ ನಂತರವೇ ದೃಢೀಕರಣ ನೀಡಲಾಗುತ್ತದೆ.',

    status_live: 'ಲೈವ್ ಕಾರ್ಯನಿರ್ವಹಣೆ (LIVE)',
    status_syncing: 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ',
    status_offline: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    status_demo_tag: 'ಡೆಮೊ / ಮಾದರಿ ಡೇಟಾ',
    shelters_connected: 'ಪರಿಹಾರ ಶಿಬಿರಗಳು',
    hospitals_linked: 'ಸಂಪರ್ಕಿತ ಆಸ್ಪತ್ರೆಗಳು',
    cases_reconciled: 'ದೃಢೀಕೃತ ಪುನರ್ಮಿಲನಗಳು',

    btn_continue: 'ಮುಂದುವರಿಸಿ',
    btn_previous: 'ಹಿಂದೆ',
    btn_submit: 'ಅಧಿಕೃತ ವರದಿ ಸಲ್ಲಿಸಿ',
    btn_cancel: 'ರದ್ದುಮಾಡಿ',
    voice_input_trigger: 'ಧ್ವನಿ / ರೇಡಿಯೋ ಇನ್‌ಪುಟ್',
    voice_input_title: 'ಧ್ವನಿ ಮತ್ತು ರೇಡಿಯೋ ಸಂದೇಶ ಪಾರ್ಸರ್',
    voice_input_hint: 'ರಕ್ಷಣಾ ಸಂದೇಶವನ್ನು ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ. ಸಿಸ್ಟಮ್ ವಿವರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡುತ್ತದೆ.',
    voice_input_parse: 'ಫಾರ್ಮ್‌ಗೆ ವಿವರ ಸೇರಿಸಿ',

    ai_candidate_tag: 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ (AI)',
    human_verify_tag: 'ಮಾನವ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    review_queue_title: 'ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',
    review_audit_desc: 'ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸುವ ಮೊದಲು ಸಾಕ್ಷ್ಯಗಳ ಸಂಪೂರ್ಣ ಪರಿಶೀಲನೆ.',
    confidence_score: 'ಹೊಂದಾಣಿಕೆ ಶೇಕಡಾವಾರು',

    family_status_title: 'ನಿಖರ ಪ್ರಕರಣದ ಸ್ಥಿತಿ',
    family_status_reassurance: 'ಕಾಯುವಿಕೆ ಕಷ್ಟಕರವೆಂದು ನಮಗೆ ತಿಳಿದಿದೆ. ನಿಮ್ಮ ಪ್ರಕರಣದ ಬಗ್ಗೆ ರಕ್ಷಣಾ ಪಡೆಗಳು ಪ್ರಸ್ತುತ ಕೈಗೊಂಡಿರುವ ಕ್ರಮಗಳು:',
    family_what_we_know: 'ದಾಖಲಾಗಿರುವ ಗುರುತುಗಳು',
    family_what_next: 'ಮುಂದಿನ ರಕ್ಷಣಾ ಪ್ರಕ್ರಿಯೆ',
  },

  ml: {
    nav_brand_title: 'മിലാൻ (MILAN)',
    nav_brand_sub: 'ദുരന്ത നിവാരണ ഏകോപനം',
    nav_cases: 'കേസ് വിവരങ്ങൾ',
    nav_review: 'പരിശോധന ഓഡിറ്റ്',
    nav_report: 'വിവരം നൽകുക',
    nav_dashboard: 'ഓപ്പറേഷൻസ് ഹബ്',
    nav_emergency_call: 'അടിയന്തര ഹെൽപ്പ്‌ലൈൻ (1078 / 112)',

    hero_tag: 'ദേശീയ ദുരന്ത കുടുംബ പുനഃസമാഗമ ശൃംഖല',
    hero_headline: 'ദുരന്തമുഖത്ത് കുടുംബങ്ങളെ തിരികെ ഒന്നിപ്പിക്കുന്നു',
    hero_subheadline: 'കാണാതായവരുടെ വിവരങ്ങൾ, രക്ഷാപ്രവർത്തന ക്യാമ്പുകൾ, ആശുപത്രി രേഖകൾ എന്നിവ സമന്വയിപ്പിച്ച് പരിശോധിച്ചുറപ്പിക്കുന്ന സാങ്കേതിക സംവിധാനം.',
    hero_cta_missing: 'കാണാതായവരുടെ വിവരം നൽകുക',
    hero_cta_found: 'കണ്ടെത്തിയ വ്യക്തിയെ രജിസ്റ്റർ ചെയ്യുക',
    hero_cta_hospital: 'ആശുപത്രി പ്രവേശന വിവരം',
    emergency_notice_title: 'അടിയന്തര സഹായ അറിയിപ്പ്',
    emergency_notice_desc: 'മിലാൻ വിവരങ്ങൾ ഏകോപിപ്പിക്കുന്നു. അടിയന്തര ജീവൻരക്ഷാ സഹായങ്ങൾക്ക് NDRF (1078) അല്ലെങ്കിൽ 112 നമ്പറിൽ വിളിക്കുക.',

    pipeline_title: 'മിലാൻ എങ്ങനെ പ്രവർത്തിക്കുന്നു?',
    pipeline_sub: 'ക്യാമ്പുകളിലെയും ആശുപത്രികളിലെയും വിവരങ്ങൾ സുതാര്യമായി താരതമ്യം ചെയ്യുന്ന രീതി.',
    pipeline_step1_title: '1. വിവിധ സ്രോതസ്സുകളിൽ നിന്നുള്ള വിവരങ്ങൾ',
    pipeline_step1_desc: 'കുടുംബങ്ങൾ, രക്ഷാസേന, ആശുപത്രികൾ എന്നിവരിൽ നിന്ന് വിവരങ്ങൾ സ്വീകരിക്കുന്നു.',
    pipeline_step2_title: '2. തിരിച്ചറിയൽ അടയാളങ്ങളുടെ വർഗ്ഗീകരണം',
    pipeline_step2_desc: 'ശരീര അടയാളങ്ങൾ, വസ്ത്രങ്ങൾ, പ്രായം എന്നിവ സുരക്ഷിതമായി രേഖപ്പെടുത്തുന്നു.',
    pipeline_step3_title: '3. സമാനതകൾ കണ്ടെത്തൽ',
    pipeline_step3_desc: 'അൽഗോരിതം തെളിവുകൾ സഹിതം പൊരുത്തപ്പെടുന്ന വിവരങ്ങൾ കണ്ടെത്തുന്നു.',
    pipeline_step4_title: '4. നേരിട്ടുള്ള ഉദ്യോഗസ്ഥ പരിശോധന',
    pipeline_step4_desc: 'ഉദ്യോഗസ്ഥർ തെളിവുകൾ പരിശോധിച്ച് പൂർണ്ണമായി ബോധ്യപ്പെട്ട ശേഷം മാത്രമേ സ്ഥിരീകരിക്കൂ.',

    status_live: 'തത്സമയം സജീവം (LIVE)',
    status_syncing: 'വിവരങ്ങൾ സമന്വയിപ്പിക്കുന്നു',
    status_offline: 'ഓഫ്‌ലൈൻ മോഡ് സജീവം',
    status_demo_tag: 'ഡെമോ / മാതൃകാ ഡാറ്റ',
    shelters_connected: 'ദുരിതാശ്വാസ ക്യാമ്പുകൾ',
    hospitals_linked: 'ബന്ധിപ്പിച്ച ആശുപത്രികൾ',
    cases_reconciled: 'സ്ഥിരീകരിച്ച പുനഃസമാഗമങ്ങൾ',

    btn_continue: 'തുടരുക',
    btn_previous: 'പുറകിലേക്ക്',
    btn_submit: 'ഔദ്യോഗികമായി സമർപ്പിക്കുക',
    btn_cancel: 'റദ്ദാക്കുക',
    voice_input_trigger: 'വോയ്‌സ് / റേഡിയോ ഇൻപുട്ട്',
    voice_input_title: 'വോയ്‌സ് & റേഡിയോ സന്ദേശ അപഗ്രഥനം',
    voice_input_hint: 'രക്ഷാപ്രവർത്തന സന്ദേശം പറയുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക. വിവരങ്ങൾ ഫോമിലേക്ക് മാറ്റും.',
    voice_input_parse: 'വിവരങ്ങൾ ഫോമിൽ ചേർക്കുക',

    ai_candidate_tag: 'സാധ്യമായ പൊരുത്തം (AI)',
    human_verify_tag: 'നേരിട്ടുള്ള പരിശോധന ആവശ്യമാണ്',
    review_queue_title: 'പരിശോധനാ പട്ടിക',
    review_audit_desc: 'കുടുംബത്തെ അറിയിക്കുന്നതിന് മുൻപുള്ള തെളിവ് പരിശോധന.',
    confidence_score: 'പൊരുത്ത ശതമാനം',

    family_status_title: 'കേസിന്റെ കൃത്യമായ അവസ്ഥ',
    family_status_reassurance: 'കാത്തിരിപ്പ് വേദനാജനകമാണെന്നറിയാം. നിങ്ങളുടെ കേസിൽ നിലവിൽ രക്ഷാപ്രവർത്തകർ ചെയ്യുന്ന പ്രവർത്തനങ്ങൾ:',
    family_what_we_know: 'രേഖപ്പെടുത്തിയ അടയാളങ്ങൾ',
    family_what_next: 'അടുത്ത രക്ഷാ നടപടികൾ',
  },

  pa: {
    nav_brand_title: 'ਮਿਲਨ (MILAN)',
    nav_brand_sub: 'ਆਫ਼ਤ ਤਾਲਮੇਲ ਪ੍ਰਣਾਲੀ',
    nav_cases: 'ਕੇਸ ਡਾਇਰੈਕਟਰੀ',
    nav_review: 'ਪੜਤਾਲ ਸਮੀਖਿਆ',
    nav_report: 'ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ',
    nav_dashboard: 'ਓਪਰੇਸ਼ਨ ਹੱਬ',
    nav_emergency_call: 'ਐਮਰਜੈਂਸੀ ਹੈਲਪਲਾਈਨ (1078 / 112)',

    hero_tag: 'ਕੌਮੀ ਆਫ਼ਤ ਪਰਿਵਾਰ ਮੁੜ-ਮਿਲਾਪ ਨੈੱਟਵਰਕ',
    hero_headline: 'ਸੰਕਟ ਵੇਲੇ ਪਰਿਵਾਰਾਂ ਨੂੰ ਮੁੜ ਮਿਲਾਉਣਾ',
    hero_subheadline: 'ਗੁੰਮਸ਼ੁਦਾ ਰਿਪੋਰਟਾਂ, ਰਾਹਤ ਕੈਂਪਾਂ ਅਤੇ ਹਸਪਤਾਲ ਰਿਕਾਰਡਾਂ ਦਾ ਪਾਰਦਰਸ਼ੀ ਮਿਲਾਨ ਕਰਕੇ ਪਰਿਵਾਰਾਂ ਨੂੰ ਜੋੜਨ ਵਾਲਾ ਮਾਨਵੀ ਪਲੇਟਫਾਰਮ।',
    hero_cta_missing: 'ਗੁੰਮਸ਼ੁਦਾ ਪਰਿਵਾਰਕ ਮੈਂਬਰ ਦੀ ਰਿਪੋਰਟ',
    hero_cta_found: 'ਮਿਲੇ ਵਿਅਕਤੀ ਦੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    hero_cta_hospital: 'ਹਸਪਤਾਲ ਦਾਖਲਾ ਰਿਕਾਰਡ',
    emergency_notice_title: 'ਜ਼ਰੂਰੀ ਐਮਰਜੈਂਸੀ ਸੂਚਨਾ',
    emergency_notice_desc: 'ਮਿਲਨ ਜਾਣਕਾਰੀ ਦਾ ਤਾਲਮੇਲ ਕਰਦਾ ਹੈ। ਜਾਨ ਬਚਾਉਣ ਲਈ ਤੁਰੰਤ NDRF (1078) ਜਾਂ 112 ਉੱਤੇ ਕਾਲ ਕਰੋ।',

    pipeline_title: 'ਮਿਲਨ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ?',
    pipeline_sub: 'ਕੈਂਪਾਂ ਅਤੇ ਹਸਪਤਾਲਾਂ ਦੇ ਰਿਕਾਰਡ ਦੀ ਭਰੋਸੇਯੋਗ ਪੜਤਾਲ ਪ੍ਰਕਿਰਿਆ।',
    pipeline_step1_title: '1. ਬਹੁ-ਸਰੋਤੀ ਜਾਣਕਾਰੀ',
    pipeline_step1_desc: 'ਪਰਿਵਾਰਾਂ, ਬਚਾਅ ਟੀਮਾਂ ਅਤੇ ਹਸਪਤਾਲਾਂ ਤੋਂ ਵੇਰਵੇ ਦਰਜ ਹੁੰਦੇ ਹਨ।',
    pipeline_step2_title: '2. ਪਛਾਣ ਚਿੰਨ੍ਹਾਂ ਦਾ ਵਰਗੀਕਰਨ',
    pipeline_step2_desc: 'ਨਿਸ਼ਾਨ, ਕੱਪੜੇ ਅਤੇ ਉਮਰ ਦਾ ਸੁਰੱਖਿਅਤ ਰਿਕਾਰਡ ਤਿਆਰ ਹੁੰਦਾ ਹੈ।',
    pipeline_step3_title: '3. ਸਬੂਤ ਆਧਾਰਿਤ ਮਿਲਾਨ',
    pipeline_step3_desc: 'ਸਿਸਟਮ ਸੰਭਾਵੀ ਮਿਲਾਨ ਦੀ ਸੂਚੀ ਸਬੂਤਾਂ ਸਮੇਤ ਪੇਸ਼ ਕਰਦਾ ਹੈ।',
    pipeline_step4_title: '4. ਮਨੁੱਖੀ ਪੜਤਾਲ ਲਾਜ਼ਮੀ',
    pipeline_step4_desc: 'ਅਧਿਕਾਰੀ ਖੁਦ ਜਾਂਚ ਕਰਕੇ ਹੀ ਪੁਸ਼ਟੀ ਕਰਦੇ ਹਨ। ਕੋਈ ਆਟੋਮੈਟਿਕ ਫੈਸਲਾ ਨਹੀਂ ਹੁੰਦਾ।',

    status_live: 'ਸਿਸਟਮ ਸਰਗਰਮ (LIVE)',
    status_syncing: 'ਡਾਟਾ ਸਿੰਕ ਹੋ ਰਿਹਾ ਹੈ',
    status_offline: 'ਆਫ਼ਲਾਈਨ ਮੋਡ ਸਰਗਰਮ',
    status_demo_tag: 'ਡੈਮੋ / ਮੁਲਾਂਕਣ ਡਾਟਾ',
    shelters_connected: 'ਸਰਗਰਮ ਰਾਹਤ ਕੈਂਪ',
    hospitals_linked: 'ਜੁੜੇ ਹੋਏ ਹਸਪਤਾਲ',
    cases_reconciled: 'ਪੁਸ਼ਟ ਕੀਤੇ ਮੁੜ-ਮਿਲਾਪ',

    btn_continue: 'ਅੱਗੇ ਵਧੋ',
    btn_previous: 'ਪਿੱਛੇ',
    btn_submit: 'ਅਧਿਕਾਰਤ ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ',
    btn_cancel: 'ਰੱਦ ਕਰੋ',
    voice_input_trigger: 'ਆਵਾਜ਼ / ਰੇਡੀਓ ਇਨਪੁਟ',
    voice_input_title: 'ਆਵਾਜ਼ ਅਤੇ ਰੇਡੀਓ ਸੁਨੇਹਾ ਪਾਰਸਰ',
    voice_input_hint: 'ਬਚਾਅ ਸੁਨੇਹਾ ਬੋਲੋ ਜਾਂ ਲਿਖੋ। ਸਿਸਟਮ ਵੇਰਵਿਆਂ ਨੂੰ ਪਛਾਣ ਕੇ ਫਾਰਮ ਭਰੇਗਾ।',
    voice_input_parse: 'ਵੇਰਵੇ ਫਾਰਮ ਵਿੱਚ ਭਰੋ',

    ai_candidate_tag: 'ਸੰਭਾਵੀ ਮਿਲਾਨ (AI)',
    human_verify_tag: 'ਮਨੁੱਖੀ ਪੜਤਾਲ ਲਾਜ਼ਮੀ',
    review_queue_title: 'ਪੜਤਾਲ ਕਤਾਰ',
    review_audit_desc: 'ਪਰਿਵਾਰ ਨੂੰ ਦੱਸਣ ਤੋਂ ਪਹਿਲਾਂ ਸਬੂਤਾਂ ਦੀ ਆਹਮੋ-ਸਾਹਮਣੇ ਜਾਂਚ।',
    confidence_score: 'ਮਿਲਾਨ ਫ਼ੀਸਦੀ',

    family_status_title: 'ਕੇਸ ਦੀ ਸਹੀ ਸਥਿਤੀ',
    family_status_reassurance: 'ਆਫ਼ਤ ਵੇਲੇ ਉਡੀਕ ਔਖੀ ਹੁੰਦੀ ਹੈ। ਤੁਹਾਡੇ ਕੇਸ ਉੱਤੇ ਬਚਾਅ ਟੀਮਾਂ ਵੱਲੋਂ ਕੀਤੀ ਜਾ ਰਹੀ ਕਾਰਵਾਈ:',
    family_what_we_know: 'ਦਰਜ ਪਛਾਣ ਵੇਰਵੇ',
    family_what_next: 'ਅਗਲੀ ਰਾਹਤ ਕਾਰਵਾਈ',
  },

  or: {
    nav_brand_title: 'ମିଲନ (MILAN)',
    nav_brand_sub: 'ବିପର୍ଯ୍ୟୟ ସମନ୍ୱୟ ପ୍ରଣାଳୀ',
    nav_cases: 'କେସ୍ ତାଲିକା',
    nav_review: 'ଯାଞ୍ଚ ସମୀକ୍ଷା',
    nav_report: 'ରିପୋର୍ଟ ଦାଖଲ',
    nav_dashboard: 'ଅପରେସନ୍ସ କେନ୍ଦ୍ର',
    nav_emergency_call: 'ଜରୁରୀକାଳୀନ ହେଲ୍ପଲାଇନ (1078 / 112)',

    hero_tag: 'ଜାତୀୟ ବିପର୍ଯ୍ୟୟ ପରିବାର ପୁନର୍ମିଳନ ନେଟୱାର୍କ',
    hero_headline: 'ବିପର୍ଯ୍ୟୟ ସମୟରେ ପରିବାରକୁ ଏକତ୍ର କରିବା',
    hero_subheadline: 'ନିଖୋଜ ବ୍ୟକ୍ତିଙ୍କ ତଥ୍ୟ, ରିଲିଫ୍ କ୍ୟାମ୍ପ୍ ଏବଂ ଡାକ୍ତରଖାନା ରେକର୍ଡଗୁଡ଼ିକର ଯାଞ୍ଚ ସହ ସୁରକ୍ଷିତ ପୁନର୍ମିଳନ ପାଇଁ ପ୍ରଯୁକ୍ତିବିଦ୍ୟା।',
    hero_cta_missing: 'ନିଖୋଜ ବ୍ୟକ୍ତିଙ୍କ ରିପୋର୍ଟ ଦିଅନ୍ତୁ',
    hero_cta_found: 'ମିଳିଥିବା ବ୍ୟକ୍ତିଙ୍କ ପଞ୍ଜୀକରଣ',
    hero_cta_hospital: 'ଡାକ୍ତରଖାନା ରୋଗୀ ପ୍ରବେଶ',
    emergency_notice_title: 'ଜରୁରୀ ସୂଚନା',
    emergency_notice_desc: 'ମିଲନ ତଥ୍ୟ ସମନ୍ୱୟ କରେ। ତୁରନ୍ତ ଜୀବନ ରକ୍ଷା ପାଇଁ NDRF (1078) କିମ୍ବା 112 ରେ କଲ୍ କରନ୍ତୁ।',

    pipeline_title: 'ମିଲନ କିପରି କାର୍ଯ୍ୟ କରେ?',
    pipeline_sub: 'କ୍ୟାମ୍ପ୍ ଏବଂ ଡାକ୍ତରଖାନା ରେକର୍ଡର ସ୍ୱଚ୍ଛ ଯାଞ୍ଚ ପ୍ରଣାଳୀ।',
    pipeline_step1_title: '୧. ବହୁ-ଉତ୍ସରୁ ତଥ୍ୟ',
    pipeline_step1_desc: 'ପରିବାର, ଉଦ୍ଧାରକାରୀ ଦଳ ଓ ଡାକ୍ତରଖାନାରୁ ରିପୋର୍ଟ ଆସେ।',
    pipeline_step2_title: '୨. ଶାରୀରିକ ଚିହ୍ନ ବର୍ଗୀକରଣ',
    pipeline_step2_desc: 'ଚିହ୍ନ, ପୋଷାକ, ବୟସ ଅନୁଯାୟୀ ସୁରକ୍ଷିତ ଡାଟା ପ୍ରସ୍ତୁତ ହୁଏ।',
    pipeline_step3_title: '୩. ପ୍ରମାଣ ଭିତ୍ତିକ ସମାନତା',
    pipeline_step3_desc: 'ସିଷ୍ଟମ୍ ପ୍ରମାଣ ସହିତ ସମ୍ଭାବ୍ୟ ମିଳନ ଖୋଜି ବାହାର କରେ।',
    pipeline_step4_title: '୪. ଅଧିକାରୀଙ୍କ ଦ୍ୱାରା ଯାଞ୍ଚ ବାଧ୍ୟତାମୂଳକ',
    pipeline_step4_desc: 'ଅଧିକାରୀମାନେ ନିଜେ ଯାଞ୍ଚ କରିବା ପରେ ହିଁ ନିଶ୍ଚିତ କରାଯାଏ।',

    status_live: 'ସକ୍ରିୟ (LIVE)',
    status_syncing: 'ସିଙ୍କ୍ ହେଉଛି',
    status_offline: 'ଅଫଲାଇନ୍ ମୋଡ୍ ସକ୍ରିୟ',
    status_demo_tag: 'ଡେମୋ / ମୂଲ୍ୟାଙ୍କନ ତଥ୍ୟ',
    shelters_connected: 'ସକ୍ରିୟ ରିଲିଫ୍ କ୍ୟାମ୍ପ୍',
    hospitals_linked: 'ସଂଯୁକ୍ତ ଡାକ୍ତରଖାନା',
    cases_reconciled: 'ନିଶ୍ଚିତ ପୁନର୍ମିଳନ',

    btn_continue: 'ଆଗକୁ ବଢ଼ନ୍ତୁ',
    btn_previous: 'ପଛକୁ',
    btn_submit: 'ଅଫିସିଆଲ୍ ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ',
    btn_cancel: 'ବାତିଲ୍',
    voice_input_trigger: 'ଭଏସ୍ / ରେଡିଓ ଇନପୁଟ୍',
    voice_input_title: 'ଭଏସ୍ ଏବଂ ରେଡିଓ ବାର୍ତ୍ତା ବିଶ୍ଳେଷକ',
    voice_input_hint: 'ରେସ୍କ୍ୟୁ ବାର୍ତ୍ତା କୁହନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ। ସିଷ୍ଟମ୍ ଆପେ ଫର୍ମ ପୂରଣ କରିବ।',
    voice_input_parse: 'ତଥ୍ୟ ଫର୍ମରେ ଭରନ୍ତୁ',

    ai_candidate_tag: 'ସମ୍ଭାବ୍ୟ ସମାନତା (AI)',
    human_verify_tag: 'ମାନବ ଯାଞ୍ଚ ଆବଶ୍ୟକ',
    review_queue_title: 'ଯାଞ୍ଚ ତାଲିକା',
    review_audit_desc: 'ପରିବାରକୁ ଜଣାଇବା ପୂର୍ବରୁ ଉଭୟ ରେକର୍ଡର ଯାଞ୍ଚ।',
    confidence_score: 'ସମାନତା ପ୍ରତିଶତ',

    family_status_title: 'କେସର ପ୍ରକୃତ ସ୍ଥିତି',
    family_status_reassurance: 'ବିପର୍ଯ୍ୟୟ ବେଳେ ଅପେକ୍ଷା କଷ୍ଟକର। ଆପଣଙ୍କ କେସ୍ ଉପରେ ଅଧିକାରୀମାନେ ବର୍ତ୍ତମାନ କଣ କରୁଛନ୍ତି:',
    family_what_we_know: 'ପଞ୍ଜୀକୃତ ଚିହ୍ନଟ ବିବରଣୀ',
    family_what_next: 'ପରବର୍ତ୍ତୀ ସହାୟତା ପଦକ୍ଷେପ',
  },

  ur: {
    nav_brand_title: 'ملن (MILAN)',
    nav_brand_sub: 'ڈیزاسٹر کوآرڈینیشن سسٹم',
    nav_cases: 'کیسز ڈائرکٹری',
    nav_review: 'تصدیقی آڈٹ',
    nav_report: 'رپورٹ درج کریں',
    nav_dashboard: 'آپریشنز مرکز',
    nav_emergency_call: 'ایمرجنسی ہیلپ لائن (1078 / 112)',

    hero_tag: 'قومی ڈیزاسٹر فیملی ری یونین نیٹ ورک',
    hero_headline: 'بحران کی گھڑی میں بچھڑے اپنوں کو ملانا',
    hero_subheadline: 'گمشدہ افراد کی رپورٹس، ریلیف کیمپوں کے اندراجات اور ہسپتال کے ریکارڈز کو باہم جوڑنے والا شفاف اور بااعتماد انسانی پلیٹ فارم۔',
    hero_cta_missing: 'گمشدہ رشتہ دار کی رپورٹ درج کریں',
    hero_cta_found: 'ملنے والے شخص کا اندراج کریں',
    hero_cta_hospital: 'ہسپتال مریض کا اندراج',
    emergency_notice_title: 'فوری حفاظتی انتباہ',
    emergency_notice_desc: 'ملن معلومات کی ہم آہنگی کرتا ہے۔ فوری خطرے کی صورت میں NDRF (1078) یا ایمرجنسی سروسز (112) پر فوری رابطہ کریں۔',

    pipeline_title: 'ملن کس طرح کام کرتا ہے؟',
    pipeline_sub: 'مختلف ذرائع سے موصول شدہ معلومات کو ثبوت کے ساتھ جانچنے کا شفاف عمل۔',
    pipeline_step1_title: '۱. کثیر ذرائع سے اندراج',
    pipeline_step1_desc: 'اہل خانہ، ریسکیو ٹیموں اور ہسپتالوں سے تفصیلات جمع ہوتی ہیں۔',
    pipeline_step2_title: '۲. جسمانی علامات کی درجہ بندی',
    pipeline_step2_desc: 'نشانات، کپڑے، عمر اور حالت کے محفوظ کوائف درج کیے جاتے ہیں۔',
    pipeline_step3_title: '۳. ثبوت پر مبنی مماثلت',
    pipeline_step3_desc: 'الگورتھم مکمل ثبوتوں کے ساتھ ممکنہ مماثلت تلاش کرتا ہے۔',
    pipeline_step4_title: '۴. انسانی تصدیق لازمی',
    pipeline_step4_desc: 'ریلیف آفیسرز دونوں ریکارڈز کا خود معائنہ کر کے ہی حتمی تصدیق کرتے ہیں۔',

    status_live: 'فعال سسٹم (LIVE)',
    status_syncing: 'ڈیٹا ہم آہنگ ہو رہا ہے',
    status_offline: 'آف لائن موڈ فعال',
    status_demo_tag: 'ڈیمو / آزمائشی ڈیٹا',
    shelters_connected: 'فعال ریلیف کیمپ',
    hospitals_linked: 'منسلک ہسپتال',
    cases_reconciled: 'تصدیق شدہ ملاپ',

    btn_continue: 'آگے بڑھیں',
    btn_previous: 'پیچھے',
    btn_submit: 'سرکاری رپورٹ جمع کروائیں',
    btn_cancel: 'منسوخ کریں',
    voice_input_trigger: 'وائس / وائرلیس ان پٹ',
    voice_input_title: 'وائس اور ریڈیو میسج پارسر',
    voice_input_hint: 'ریسکیو کا آڈیو پیغام بولیں یا لکھیں۔ سسٹم خود بخود معلومات فارم میں بھر دے گا۔',
    voice_input_parse: 'تفصیلات فارم میں شامل کریں',

    ai_candidate_tag: 'ممکنہ مماثلت (AI)',
    human_verify_tag: 'انسانی تصدیق لازمی ہے',
    review_queue_title: 'تصدیقی فہرست',
    review_audit_desc: 'خاندان کو مطلع کرنے سے قبل دونوں ریکارڈز کا آمنے سامنے ثبوتی معائنہ۔',
    confidence_score: 'مماثلت کا تناسب',

    family_status_title: 'کیس کی اصل اور شفاف صورتحال',
    family_status_reassurance: 'مشکل گھڑی میں انتظار اذیت ناک ہوتا ہے۔ آپ کے کیس پر ریلیف ٹیمیں اس وقت کیا اقدامات کر رہی ہیں:',
    family_what_we_know: 'درج شدہ شناختی کوائف',
    family_what_next: 'اگلا ریلیف مرحلہ',
  },

  as: {
    nav_brand_title: 'মিলন (MILAN)',
    nav_brand_sub: 'দুর্যোগ সমন্বয় ব্যৱস্থা',
    nav_cases: 'কেছ তালিকা',
    nav_review: 'সত্যতা নিৰূপণ',
    nav_report: 'ৰিপৰ্ট দাখিল কৰক',
    nav_dashboard: 'অপাৰেচন কেন্দ্ৰ',
    nav_emergency_call: 'জৰুৰীকালীন হেল্পলাইন (1078 / 112)',

    hero_tag: 'ৰাষ্ট্ৰীয় দুর্যোগ পৰিয়াল পুনৰ্মিলন নেটৱৰ্ক',
    hero_headline: 'সংকটৰ সময়ত পৰিয়ালক পুনৰ একত্ৰিত কৰা',
    hero_subheadline: 'নিৰুদ্দেশ হোৱা ব্যক্তিৰ তথ্য, উদ্ধাৰ শিবিৰ আৰু চিকিৎসালয়ৰ তথ্য সুশৃংখলিতভাৱে মিলাই পুনৰ্মিলন কৰোৱা এক বিশ্বস্ত মাধ্যম।',
    hero_cta_missing: 'নিৰুদ্দেশ আত্মীয়ৰ ৰিপৰ্ট দিয়ক',
    hero_cta_found: 'উদ্ধাৰ হোৱা ব্যক্তিৰ নামভৰ্তি',
    hero_cta_hospital: 'চিকিৎসালয়ত ৰোগী পঞ্জীয়ন',
    emergency_notice_title: 'জৰুৰীকালীন জীৱন ৰক্ষা জাননী',
    emergency_notice_desc: 'মিলনে তথ্য সমন্বয় কৰে। তাৎক্ষণিক জীৱন ৰক্ষাৰ বাবে পোনপটীয়াকৈ NDRF (1078) বা 112 নম্বৰত যোগাযোগ কৰক।',

    pipeline_title: 'মিলন ব্যৱস্থাই কেনেদৰে কাম কৰে?',
    pipeline_sub: 'শিবিৰ আৰু চিকিৎসালয়ৰ তথ্য স্বচ্ছভাৱে পৰীক্ষা কৰাৰ নিৰ্ভৰযোগ্য পদ্ধতি।',
    pipeline_step1_title: '১. বিভিন্ন উৎসৰ পৰা তথ্য সংগ্ৰহ',
    pipeline_step1_desc: 'পৰিয়াল, উদ্ধাৰকাৰী দল আৰু চিকিৎসালয়ৰ পৰা তথ্য নথিভুক্ত হয়।',
    pipeline_step2_title: '২. চিনাক্তকৰণ বৈশিষ্ট্য শ্ৰেণীকৰণ',
    pipeline_step2_desc: 'পোচাক, দাগ আৰু অৱস্থাৰ ভিত্তিত তথ্য সুৰক্ষিত কৰা হয়।',
    pipeline_step3_title: '৩. প্ৰমাণভিত্তিক অনুসন্ধান',
    pipeline_step3_desc: 'অ্যালগরিদমে সম্ভাব্য মিলৰ তালিকা প্ৰমাণৰ সৈতে প্ৰস্তুত কৰে।',
    pipeline_step4_title: '৪. বিষয়াৰ দ্বাৰা পৰীক্ষণ বাধ্যতামূলক',
    pipeline_step4_desc: 'বিষয়া সকলে প্ৰমাণসমূহ পোনপটীয়াকৈ পৰীক্ষা কৰাৰ পিছতহে নিশ্চিত কৰা হয়।',

    status_live: 'সক্ৰিয় নেটৱৰ্ক (LIVE)',
    status_syncing: 'তথ্য সংমিশ্ৰণ চলি আছে',
    status_offline: 'অফলাইন মোড সক্ৰিয়',
    status_demo_tag: 'ডেমো / নমুনা তথ্য',
    shelters_connected: 'সক্ৰিয় সাহায্য শিবিৰ',
    hospitals_linked: 'সংযুক্ত চিকিৎসালয়',
    cases_reconciled: 'নিশ্চিত পুনৰ্মিলন',

    btn_continue: 'আগবাঢ়ক',
    btn_previous: 'পিছলৈ',
    btn_submit: 'অফিচিয়েল ৰিপৰ্ট জমা দিয়ক',
    btn_cancel: 'বাতিল কৰক',
    voice_input_trigger: 'ভইচ / ৰেডিঅ’ ইনপুট',
    voice_input_title: 'ভইচ আৰু ৰেডিঅ’ বাৰ্তা বিশ্লেষক',
    voice_input_hint: 'উদ্ধাৰৰ অডিঅ’ বাৰ্তা কওক বা লিখক। ব্যৱস্থাই তথ্যসমূহ ফৰ্মত ভৰাই তুলিব।',
    voice_input_parse: 'তথ্য ফৰ্মত যোগ কৰক',

    ai_candidate_tag: 'সম্ভাব্য মিলৰ পৰামৰ্শ (AI)',
    human_verify_tag: 'মানৱীয় সত্যতা নিৰূপণ প্ৰয়োজন',
    review_queue_title: 'সত্যতা নিৰূপণ তালিকা',
    review_audit_desc: 'পৰিয়ালক জনোৱাৰ পূৰ্বে প্ৰমাণসমূহৰ পোনপটীয়া পৰীক্ষা।',
    confidence_score: 'সম্ভাবনাৰ হাৰ',

    family_status_title: 'কেছৰ বাস্তৱিক স্থিতি',
    family_status_reassurance: 'আপোনাৰ কেছত উদ্ধাৰকাৰী দলে বৰ্তমান কি কাম কৰি আছে তাৰ সঠিক তথ্য:',
    family_what_we_know: 'নথিভুক্ত চিনাক্তকৰଣ তথ্য',
    family_what_next: 'পৰৱৰ্তী সাহায্য প্ৰক্ৰিয়া',
  },
};

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguageInfo: LanguageInfo;
  isRTL: boolean;
  t: (key: keyof TranslationDictionary) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('milan_language') as LanguageCode;
    if (saved && translations[saved]) {
      return saved;
    }
    return 'en';
  });

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const isRTL = Boolean(currentLanguageInfo.isRTL);

  const setLanguage = (lang: LanguageCode) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('milan_language', lang);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const t = (key: keyof TranslationDictionary): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return translations.en[key] || String(key);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageInfo,
        isRTL,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
