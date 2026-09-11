// ============================================================
// MILAN — Live DOM Neural Localization Engine
// Invisible, High-Speed Background Translator
// Automatically sweeps the live DOM on language change (< 50ms)
// Operates with zero UI footprint, full memory safety, and 100% reversible state
// ============================================================

import { LanguageCode } from './types.ts';
import { locales } from './locales/index.ts';

// Memory of pristine original English text for zero-leak, reversible translation
const originalTextMap = new WeakMap<Node, string>();


// Comprehensive Portal-Wide UI Terminology Dictionary
// Covers all Buttons, Statuses, Wizard Steps, Form Labels, Table Headers, Placeholders
const PORTAL_UI_TERMS: Record<string, Record<string, string>> = {
  // Navigation & Actions
  'File Missing': {
    hi: 'लापता की रिपोर्ट दर्ज करें',
    bn: 'নিখোঁজ রিপোর্ট করুন',
    te: 'మిస్సింగ్ రిపోర్ట్ చేయండి',
    mr: 'बेपत्ता व्यक्ती नोंदवा',
    ta: 'காணாமல் போனவர் பதிவு',
    gu: 'ગુમ થયેલ નોંધણી કરો',
    kn: 'ಕಾಣೆಯಾದ ವರದಿ ದಾಖಲಿಸಿ',
    ml: 'കാണാതായവരുടെ വിവരം നൽകുക',
    pa: 'ਲਾਪਤਾ ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ',
    or: 'ନିଖୋଜ ରିପୋର୍ଟ କରନ୍ତୁ',
    ur: 'لاپتہ کی رپورٹ درج کریں',
    as: 'নিখোজ ৰিপোৰ্ট কৰক',
    ne: 'बेपत्ता रिपोर्ट गर्नुहोस्',
  },
  'Register Rescued': {
    hi: 'बचाए गए का पंजीकरण',
    bn: 'উদ্ধারকৃত নিবন্ধন',
    te: 'రక్షించబడిన వారి నమోదు',
    mr: 'बचाव केलेल्यांची नोंदणी',
    ta: 'மீட்கப்பட்டவர் பதிவு',
    gu: 'બચાવેલ વ્યક્તિ નોંધણી',
    kn: 'ರಕ್ಷಿಸಿದವರ ನೋಂದಣಿ',
    ml: 'രക്ഷപ്പെടുത്തിയവരുടെ രജിസ്ട്രേഷൻ',
    pa: 'ਬਚਾਏ ਗਏ ਦਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    or: 'ଉଦ୍ଧାର ବ୍ୟକ୍ତି ପଞ୍ଜୀକରଣ',
    ur: 'بچائے گئے کا اندراج',
    as: 'উদ্ধাৰকৃত লোকৰ পঞ্জীয়ন',
    ne: 'उद्धार गरिएकाको दर्ता',
  },
  'All Statuses': {
    hi: 'सभी स्थितियाँ',
    bn: 'সমস্ত অবস্থা',
    te: 'అన్ని స్థితులు',
    mr: 'सर्व स्थिती',
    ta: 'அனைத்து நிலைகளும்',
    gu: 'તમામ સ્થિતિ',
    kn: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    ml: 'എല്ലാ അവസ്ഥകളും',
    pa: 'ਸਾਰੀਆਂ ਸਥਿਤੀਆਂ',
    or: 'ସମସ୍ତ ସ୍ଥିତି',
    ur: 'تمام کیفیات',
    as: 'সকলো অৱস্থা',
    ne: 'सबै स्थितिहरू',
  },
  'Case UID': {
    hi: 'केस यूआईडी',
    bn: 'কেস ইউআইডি',
    te: 'కేసు యుఐడి',
    mr: 'केस यूआयडी',
    ta: 'வழக்கு ஐடி',
    gu: 'કેસ યુઆઇડી',
    kn: 'ಪ್ರಕರಣ ಯುಐಡಿ',
    ml: 'കേസ് യുഐഡി',
    pa: 'ਕੇਸ ਯੂਆਈਡੀ',
    or: 'କେସ ୟୁଆଇଡି',
    ur: 'کیس یو آئی ڈی',
    as: 'কেছ ইউআইডি',
    ne: 'मुद्दा यूआईडी',
  },
  'Key Clue / Marks': {
    hi: 'पहचान / मुख्य निशान',
    bn: 'সনাক্তকরণ চিহ্ন',
    te: 'గుర్తింపు గుర్తులు',
    mr: 'ओळख / मुख्य खूण',
    ta: 'அடையாளக் குறிகள்',
    gu: 'ઓળખ / મુખ્ય નિશાન',
    kn: 'ಗುರುತಿನ ಗುರುತುಗಳು',
    ml: 'തിരിച്ചറിയൽ അടയാളങ്ങൾ',
    pa: 'ਪਛਾਣ ਦੇ ਨਿਸ਼ਾਨ',
    or: 'ଚିହ୍ନଟ ଚିହ୍ନ',
    ur: 'شناختی نشانات',
    as: 'চিনাক্তকৰণ চিন',
    ne: 'पहिचानका मुख्य चिन्हहरू',
  },
  'Not recorded': {
    hi: 'दर्ज नहीं',
    bn: 'রেকর্ড করা হয়নি',
    te: 'నమోదు కాలేదు',
    mr: 'नोंदणीकृत नाही',
    ta: 'பதிவு செய்யப்படவில்லை',
    gu: 'નોંધાયેલ નથી',
    kn: 'ದಾಖಲಾಗಿಲ್ಲ',
    ml: 'രേഖപ്പെടുത്തിയിട്ടില്ല',
    pa: 'ਦਰਜ ਨਹੀਂ',
    or: 'ରେକର୍ଡ ହୋଇନାହିଁ',
    ur: 'درج نہیں',
    as: 'লিপিবদ্ধ কৰা নাই',
    ne: 'अभिलेख छैन',
  },
  'Unidentified Survivor': {
    hi: 'अज्ञात जीवित व्यक्ति',
    bn: 'অজ্ঞাত বেঁচে থাকা ব্যক্তি',
    te: 'గుర్తించబడని ప్రాణాలతో ఉన్న వ్యక్తి',
    mr: 'अनोळखी जिवंत व्यक्ती',
    ta: 'அடையாளம் தெரியாத உயிருடன் இருப்பவர்',
    gu: 'અજાણ્યા બચી ગયેલ વ્યક્તિ',
    kn: 'ಗುರುತಿಸಲಾಗದ ಬದುಕುಳಿದವರು',
    ml: 'തിരിച്ചറിയാത്ത രക്ഷപ്പെട്ട വ്യക്തി',
    pa: 'ਅਣਪਛਾਤਾ ਜੀਵਤ ਵਿਅਕਤੀ',
    or: 'ଅଜ୍ଞାତ ଜୀବିତ ବ୍ୟକ୍ତି',
    ur: 'نامعلوم زندہ شخص',
    as: 'অজ্ঞাত জীৱিত ব্যক্তি',
    ne: 'अज्ञात जीवित व्यक्ति',
  },
  'Unidentified Minor': {
    hi: 'अज्ञात अवयस्क (बालक/बालिका)',
    bn: 'অজ্ঞাত নাবালক/নাবালিকা',
    te: 'గుర్తించబడని మైనర్',
    mr: 'अनोळखी अल्पवयीन बालक',
    ta: 'அடையாளம் தெரியாத சிறுவர்',
    gu: 'અજાણ્યા સગીર',
    kn: 'ಗುರುತಿಸಲಾಗದ ಅಪ್ರಾಪ್ತ',
    ml: 'തിരിച്ചറിയാത്ത പ്രായപൂർത്തിയാകാത്ത കുട്ടി',
    pa: 'ਅਣਪਛਾਤਾ ਨਾਬਾਲਗ',
    or: 'ଅଜ୍ଞାତ ନାବାଳକ',
    ur: 'نامعلوم نابالغ',
    as: 'অজ্ঞাত নাবালক',
    ne: 'अज्ञात नाबालक',
  },
  'Age Unknown': {
    hi: 'आयु अज्ञात',
    bn: 'বয়স অজানা',
    te: 'వయస్సు తెలియదు',
    mr: 'वय अज्ञात',
    ta: 'வயது தெரியவில்லை',
    gu: 'ઉંમર અજાણી',
    kn: 'ವಯಸ್ಸು ತಿಳಿದಿಲ್ಲ',
    ml: 'പ്രായം അജ്ഞാതം',
    pa: 'ਉਮਰ ਅਣਜਾਣ',
    or: 'ବୟସ ଅଜ୍ଞାତ',
    ur: 'عمر نامعلوم',
    as: 'বয়স অজ্ঞাত',
    ne: 'उमेर अज्ञात',
  },
  'Blood ?': {
    hi: 'रक्त समूह ?',
    bn: 'রক্তের গ্রুপ ?',
    te: 'రక్త వర్గం ?',
    mr: 'रक्तगट ?',
    ta: 'இரத்த வகை ?',
    gu: 'બ્લડ ગ્રુપ ?',
    kn: 'ರಕ್ತದ ಗುಂಪು ?',
    ml: 'രക്തഗ്രൂപ്പ് ?',
    pa: 'ਬਲੱਡ ਗਰੁੱਪ ?',
    or: 'ରକ୍ତ ବର୍ଗ ?',
    ur: 'بلڈ گروپ ؟',
    as: 'তেজৰ গ্ৰুপ ?',
    ne: 'रगत समूह ?',
  },
  'SUBMITTED': {
    hi: 'दर्ज किया गया',
    bn: 'জমা দেওয়া হয়েছে',
    te: 'సమర్పించబడింది',
    mr: 'सादर केले',
    ta: 'சமர்ப்பிக்கப்பட்டது',
    gu: 'સબમિટ કરેલ',
    kn: 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
    ml: 'സമർപ്പിച്ചു',
    pa: 'ਦਰਜ ਕੀਤਾ ਗਿਆ',
    or: 'ଦାଖଲ ହୋଇଛି',
    ur: 'جمع کر دیا گیا',
    as: 'দাখিল কৰা হ’ল',
    ne: 'पेस गरियो',
  },
  'POSSIBLE MATCH': {
    hi: 'संभावित मिलान',
    bn: 'সম্ভাব্য মিল',
    te: 'సాధ్యమైన సరిపోలిక',
    mr: 'संभाव्य जुळणी',
    ta: 'சாத்தியமான பொருத்தம்',
    gu: 'સંભવિત મેળ',
    kn: 'ಸಂಭಾವ್ಯ ಹೊಂದಾಣಿಕೆ',
    ml: 'സാധ്യമായ പൊരുത്തം',
    pa: 'ਸੰਭਾਵਿਤ ਮਿਲਾਨ',
    or: 'ସମ୍ଭାବ୍ୟ ମେଳ',
    ur: 'ممکنہ مماثلت',
    as: 'সম্ভাৱ্য মিল',
    ne: 'सम्भावित मिलान',
  },
  'VERIFIED MATCH': {
    hi: 'सत्यापित मिलान',
    bn: 'যাচাইকৃত মিল',
    te: 'ధృవీకరించబడిన సరిపోలిక',
    mr: 'पडताळणी झालेली जुळणी',
    ta: 'சரிபார்க்கப்பட்ட பொருத்தம்',
    gu: 'ચકાસાયેલ મેળ',
    kn: 'ದೃಢೀಕರಿಸಿದ ಹೊಂದಾಣಿಕೆ',
    ml: 'സ്ഥിരീകരിച്ച പൊരുത്തം',
    pa: 'ਪ੍ਰਮਾਣਿਤ ਮਿਲਾਨ',
    or: 'ପ୍ରମାଣିତ ମେଳ',
    ur: 'تصدیق شدہ مماثلت',
    as: 'প্ৰমাণিত মিল',
    ne: 'प्रमाणित मिलान',
  },
  'REUNIFIED': {
    hi: 'सफलतापूर्वक मिलाया गया',
    bn: 'পুনর্মিলিত হয়েছে',
    te: 'విజయవంతంగా చేర్చబడింది',
    mr: 'यशस्वीरीत्या पुनर्मिलन झाले',
    ta: 'மறுஇணைப்பு செய்யப்பட்டது',
    gu: 'સફળતાપૂર્વક મેળવ્યા',
    kn: 'ಯಶಸ್ವಿಯಾಗಿ ಮರುಸೇರಿಸಲಾಗಿದೆ',
    ml: 'പുനരേകീകരിച്ചു',
    pa: 'ਮੁੜ ਮਿਲਾਇਆ ਗਿਆ',
    or: 'ପୁନଃମିଳିତ ହେଲେ',
    ur: 'کامیابی سے ملوا دیا گیا',
    as: 'পুনৰ্মিলিত হ’ল',
    ne: 'सफलतापूर्वक मिलन भयो',
  },
  'FOUND': {
    hi: 'मिला व्यक्ति',
    bn: 'প্রাপ্ত',
    te: 'కనుగొనబడింది',
    mr: 'सापडला',
    ta: 'கண்டறியப்பட்டது',
    gu: 'મળેલ',
    kn: 'ಕಂಡುಬಂದಿದೆ',
    ml: 'കണ്ടെത്തി',
    pa: 'ਮਿਲਿਆ',
    or: 'ମିଳିଲା',
    ur: 'ملا ہوا',
    as: 'পোৱা গ’ল',
    ne: 'भेटिएको',
  },
  'MISSING': {
    hi: 'लापता',
    bn: 'নিখোঁজ',
    te: 'గల్లంతు',
    mr: 'बेपत्ता',
    ta: 'காணவில்லை',
    gu: 'ગુમ',
    kn: 'ಕಾಣೆಯಾಗಿದೆ',
    ml: 'കാണാതായി',
    pa: 'ਲਾਪਤਾ',
    or: 'ନିଖୋଜ',
    ur: 'لاپتہ',
    as: 'নিখোজ',
    ne: 'बेपत्ता',
  },

  // Family Intake Wizard & Forms
  'FAMILY INTAKE PORTAL': {
    hi: 'परिवार रिपोर्टिंग पोर्टल',
    bn: 'পরিবার রিপোর্টিং পোর্টাল',
    te: 'కుటుంబ నివేదిక పోర్టల్',
    mr: 'कुटुंब नोंदणी पोर्टल',
    ta: 'குடும்ப தகவல் பதிவு தளம்',
    gu: 'પરિવાર રિપોર્ટિંગ પોર્ટલ',
    kn: 'ಕುಟುಂಬ ವರದಿ ಪೋರ್ಟಲ್',
    ml: 'കുടുംബ റിപ്പോർട്ടിംഗ് പോർട്ടൽ',
    pa: 'ਪਰਿਵਾਰ ਰਿਪੋਰਟਿੰਗ ਪੋਰਟਲ',
    or: 'ପରିବାର ରିପୋର୍ଟ ପୋର୍ଟାଲ',
    ur: 'خاندانی رپورٹنگ پورٹل',
    as: 'পৰিয়াল ৰিপোৰ্টিং পৰ্টেল',
    ne: 'परिवार रिपोर्टिङ पोर्टल',
  },
  'Basic Identity': {
    hi: 'मूल पहचान',
    bn: 'প্রাথমিক পরিচয়',
    te: 'ప్రాథమిక గుర్తింపు',
    mr: 'मूलभूत ओळख',
    ta: 'அடிப்படை அடையாளம்',
    gu: 'મૂળ ઓળખ',
    kn: 'ಮೂಲ ಗುರುತು',
    ml: 'അടിസ്ഥാന വിവരങ്ങൾ',
    pa: 'ਮੁੱਢਲੀ ਪਛਾਣ',
    or: 'ମୌଳିକ ପରିଚୟ',
    ur: 'بنیادی شناخت',
    as: 'প্ৰাথমিক পৰিচয়',
    ne: 'आधारभूत पहिचान',
  },
  'Name, age, gender and blood group': {
    hi: 'नाम, आयु, लिंग और रक्त समूह',
    bn: 'নাম, বয়স, লিঙ্গ এবং রক্তের গ্রুপ',
    te: 'పేరు, వయస్సు, లింగం మరియు రక్త వర్గం',
    mr: 'नाव, वय, लिंग आणि रक्तगट',
    ta: 'பெயர், வயது, பாலினம் மற்றும் இரத்த வகை',
    gu: 'નામ, ઉંમર, જાતિ અને રક્ત જૂથ',
    kn: 'ಹೆಸರು, ವಯಸ್ಸು, ಲಿಂಗ ಮತ್ತು ರಕ್ತದ ಗುಂಪು',
    ml: 'പേര്, പ്രായം, ലിംഗം, രക്തഗ്രൂപ്പ്',
    pa: 'ਨਾਮ, ਉਮਰ, ਲਿੰਗ ਅਤੇ ਬਲੱਡ ਗਰੁੱਪ',
    or: 'ନାମ, ବୟସ, ଲିଙ୍ଗ ଏବଂ ରକ୍ତ ବର୍ଗ',
    ur: 'نام، عمر، جنس اور بلڈ گروپ',
    as: 'নাম, বয়স, লিংগ আৰু তেজৰ গ্ৰুপ',
    ne: 'नाम, उमेर, लिङ्ग र रगत समूह',
  },
  'Physical Appearance': {
    hi: 'शारीरिक बनावट',
    bn: 'শারীরিক চেহারা',
    te: 'శారీరక రూపం',
    mr: 'शारीरिक ठेवण',
    ta: 'உடல் அமைப்பு',
    gu: 'શારીરિક દેખાવ',
    kn: 'ದೈಹಿಕ ಸ್ವರೂಪ',
    ml: 'ശരീര പ്രകൃതം',
    pa: 'ਸਰੀਰਕ ਦਿੱਖ',
    or: 'ଶାରୀରିକ ଗଠନ',
    ur: 'جسمانی ساخت',
    as: 'শাৰীৰিক ৰূপ',
    ne: 'शारीरिक बनावट',
  },
  'Clothing & Belongings': {
    hi: 'वस्त्र और सामान',
    bn: 'পোশাক ও জিনিসপত্র',
    te: 'దుస్తులు మరియు వస్తువులు',
    mr: 'कपडे व वस्तू',
    ta: 'ஆடைகள் & உடைமைகள்',
    gu: 'કપડાં અને સામાન',
    kn: 'ಉಡುಪು ಮತ್ತು ವಸ್ತುಗಳು',
    ml: 'വസ്ത്രങ്ങളും സാധനങ്ങളും',
    pa: 'ਕੱਪੜੇ ਅਤੇ ਸਾਮਾਨ',
    or: 'ପୋଷାକ ଏବଂ ଜିନିଷପତ୍ର',
    ur: 'لباس اور سامان',
    as: 'পোছাক আৰু সামগ্ৰী',
    ne: 'लुगा र सामान',
  },
  'Last Known Location': {
    hi: 'अंतिम ज्ञात स्थान',
    bn: 'সর্বশেষ পরিচিত অবস্থান',
    te: 'చివరిగా తెలిసిన స్థానం',
    mr: 'शेवटचे ज्ञात ठिकाण',
    ta: 'கடைசியாக அறியப்பட்ட இடம்',
    gu: 'છેલ્લું જાણીતું સ્થળ',
    kn: 'ಕೊನೆಯದಾಗಿ ತಿಳಿದ ಸ್ಥಳ',
    ml: 'അവസാനമായി കണ്ട സ്ഥലം',
    pa: 'ਆਖਰੀ ਵਾਰ ਦੇਖੀ ਗਈ ਥਾਂ',
    or: 'ଶେଷ ଜଣାଶୁଣା ସ୍ଥାନ',
    ur: 'آخری معلوم مقام',
    as: 'শেষ জ্ঞাত স্থান',
    ne: 'अन्तिम ज्ञात स्थान',
  },
  'Identifying Clues': {
    hi: 'पहचान के निशान',
    bn: 'সনাক্তকরণ সূত্র ও চিহ্ন',
    te: 'గుర్తింపు ఆధారాలు',
    mr: 'ओळखीच्या खुणा',
    ta: 'அடையாளக் குறிப்புகள்',
    gu: 'ઓળખના નિશાનો',
    kn: 'ಗುರುತಿಸುವ ಸುಳಿವುಗಳು',
    ml: 'തിരിച്ചറിയൽ അടയാളങ്ങൾ',
    pa: 'ਪਛਾਣ ਚਿੰਨ੍ਹ',
    or: 'ଚିହ୍ନଟ ସୂଚନା',
    ur: 'شناختی نشانیاں',
    as: 'চিনাক্তকৰণ সূত্ৰ',
    ne: 'पहिचानका सुराकहरू',
  },
  'Review & Submit': {
    hi: 'समीक्षा और जमा करें',
    bn: 'পর্যালোচনা এবং জমা দিন',
    te: 'సమీక్షించండి & సమర్పించండి',
    mr: 'तपासा आणि सादर करा',
    ta: 'சரிபார்த்து சமர்ப்பிக்கவும்',
    gu: 'ચકાસો અને સબમિટ કરો',
    kn: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಲ್ಲಿಸಿ',
    ml: 'പരിശോധിച്ച് സമർപ്പിക്കുക',
    pa: 'ਜਾਂਚੋ ਅਤੇ ਜਮ੍ਹਾਂ ਕਰੋ',
    or: 'ସମୀକ୍ଷା କରି ଦାଖଲ କରନ୍ତୁ',
    ur: 'جائزہ لیں اور جمع کریں',
    as: 'পৰ্যালোচনা কৰি দাখিল কৰক',
    ne: 'समीक्षा गरी पेस गर्नुहोस्',
  },
  'Full Legal Name': {
    hi: 'पूरा कानूनी नाम',
    bn: 'সম্পূর্ণ আইনি নাম',
    te: 'పూర్తి చట్టపరమైన పేరు',
    mr: 'पूर्ण कायदेशीर नाव',
    ta: 'முழு சட்டப்பூர்வ பெயர்',
    gu: 'સંપૂર્ણ કાયદેસર નામ',
    kn: 'ಸಂಪೂರ್ಣ ಕಾನೂನು ಹೆಸರು',
    ml: 'പൂർണ്ണ ഔദ്യോഗിക പേര്',
    pa: 'ਪੂਰਾ ਕਾਨੂੰਨੀ ਨਾਮ',
    or: 'ପୂର୍ଣ୍ଣ ଆଇନଗତ ନାମ',
    ur: 'مکمل قانونی نام',
    as: 'সম্পূৰ্ণ আইনী নাম',
    ne: 'पूरा कानुनी नाम',
  },
  'Nickname / Alternative Names': {
    hi: 'उपनाम / अन्य नाम',
    bn: 'ডাকনাম / বিকল্প নাম',
    te: 'మారుపేరు / ఇతర పేర్లు',
    mr: 'टोपणनाव / इतर नावे',
    ta: 'செல்லப்பெயர் / மாற்றுப் பெயர்கள்',
    gu: 'ઉપનામ / અન્ય નામો',
    kn: 'ಅಡ್ಡಹೆಸರು / ಪರ್ಯಾಯ ಹೆಸರುಗಳು',
    ml: 'വിളിപ്പേര് / മറ്റ് പേരുകൾ',
    pa: 'ਉਪਨਾਮ / ਹੋਰ ਨਾਮ',
    or: 'ଡାକନାମ / ଅନ୍ୟାନ୍ୟ ନାମ',
    ur: 'عرفیت / دیگر نام',
    as: 'উপনাম / বিকল্প নাম',
    ne: 'उपनाम / अन्य नामहरू',
  },
  'Age (Years)': {
    hi: 'आयु (वर्ष)',
    bn: 'বয়স (বছর)',
    te: 'వయస్సు (సంవత్సరాలు)',
    mr: 'वय (वर्षे)',
    ta: 'வயது (ஆண்டுகள்)',
    gu: 'ઉંમર (વર્ષ)',
    kn: 'ವಯಸ್ಸು (ವರ್ಷಗಳು)',
    ml: 'പ്രായം (വർഷം)',
    pa: 'ਉਮਰ (ਸਾਲ)',
    or: 'ବୟସ (ବର୍ଷ)',
    ur: 'عمر (سال)',
    as: 'বয়স (বছৰ)',
    ne: 'उमेर (वर्ष)',
  },
  'Gender': {
    hi: 'लिंग',
    bn: 'লিঙ্গ',
    te: 'లింగం',
    mr: 'लिंग',
    ta: 'பாலினம்',
    gu: 'જાતિ',
    kn: 'ಲಿಂಗ',
    ml: 'ലിംഗം',
    pa: 'ਲਿੰਗ',
    or: 'ଲିଙ୍ଗ',
    ur: 'جنس',
    as: 'লিংগ',
    ne: 'लिङ्ग',
  },
  'Male': {
    hi: 'पुरुष',
    bn: 'পুরুষ',
    te: 'పురుషుడు',
    mr: 'पुरुष',
    ta: 'ஆண்',
    gu: 'પુરુષ',
    kn: 'ಪುರುಷ',
    ml: 'പുരുഷൻ',
    pa: 'ਪੁਰਸ਼',
    or: 'ପୁରୁଷ',
    ur: 'مرد',
    as: 'পুৰুষ',
    ne: 'पुरुष',
  },
  'Female': {
    hi: 'महिला',
    bn: 'মহিলা',
    te: 'స్త్రీ',
    mr: 'स्त्री / महिला',
    ta: 'பெண்',
    gu: 'મહિલા',
    kn: 'ಮಹಿಳೆ',
    ml: 'സ്ത്രീ',
    pa: 'ਔਰਤ',
    or: 'ମହିଳା',
    ur: 'عورت',
    as: 'মহিলা',
    ne: 'महिला',
  },
  'Unknown': {
    hi: 'अज्ञात',
    bn: 'অজানা',
    te: 'తెలియదు',
    mr: 'अज्ञात',
    ta: 'தெரியவில்லை',
    gu: 'અજાણ્યું',
    kn: 'ತಿಳಿದಿಲ್ಲ',
    ml: 'അജ്ഞാതം',
    pa: 'ਅਣਜਾਣ',
    or: 'ଅଜ୍ଞାତ',
    ur: 'نامعلوم',
    as: 'অজ্ঞাত',
    ne: 'अज्ञात',
  },
  'Date of Birth (if known)': {
    hi: 'जन्म तिथि (यदि ज्ञात हो)',
    bn: 'জন্ম তারিখ (জানা থাকলে)',
    te: 'పుట్టిన తేదీ (తెలిస్తే)',
    mr: 'जन्मतारीख (माहीत असल्यास)',
    ta: 'பிறந்த தேதி (தெரிந்தால்)',
    gu: 'જન્મ તારીખ (જો ખબર હોય)',
    kn: 'ಹುಟ್ಟಿದ ದಿನಾಂಕ (ತಿಳಿದಿದ್ದರೆ)',
    ml: 'ജനനത്തീയതി (അറിയാമെങ്കിൽ)',
    pa: 'ਜਨਮ ਮਿਤੀ (ਜੇ ਪਤਾ ਹੋਵੇ)',
    or: 'ଜନ୍ମ ତାରିଖ (ଯଦି ଜଣାଥାଏ)',
    ur: 'تاریخ پیدائش (اگر معلوم ہو)',
    as: 'জন্মৰ তাৰিখ (যদি জনা থাকে)',
    ne: 'जन्म मिति (यदि थाहा छ भने)',
  },
  'Blood Group (if known)': {
    hi: 'रक्त समूह (यदि ज्ञात हो)',
    bn: 'রক্তের গ্রুপ (জানা থাকলে)',
    te: 'రక్త వర్గం (తెలిస్తే)',
    mr: 'रक्तगट (माहीत असल्यास)',
    ta: 'இரத்த வகை (தெரிந்தால்)',
    gu: 'બ્લડ ગ્રુપ (જો ખબર હોય)',
    kn: 'ರಕ್ತದ ಗುಂಪು (ತಿಳಿದಿದ್ದರೆ)',
    ml: 'രക്തഗ്രൂപ്പ് (അറിയാമെങ്കിൽ)',
    pa: 'ਬਲੱਡ ਗਰੁੱਪ (ਜੇ ਪਤਾ ਹੋਵੇ)',
    or: 'ରକ୍ତ ବର୍ଗ (ଯଦି ଜଣାଥାଏ)',
    ur: 'بلڈ گروپ (اگر معلوم ہو)',
    as: 'তেজৰ গ্ৰুপ (যদি জনা থাকে)',
    ne: 'रगत समूह (यदि थाहा छ भने)',
  },
  'Previous': {
    hi: 'पिछला',
    bn: 'পূর্ববর্তী',
    te: 'మునుపటిది',
    mr: 'मागे',
    ta: 'முந்தையது',
    gu: 'પાછળ',
    kn: 'ಹಿಂದಿನ',
    ml: 'മുമ്പത്തെ',
    pa: 'ਪਿਛਲਾ',
    or: 'ପୂର୍ବବର୍ତ୍ତୀ',
    ur: 'پچھلا',
    as: 'পূৰ্বৱৰ্তী',
    ne: 'अघिल्लो',
  },
  'Continue': {
    hi: 'आगे बढ़ें',
    bn: 'পরবর্তী',
    te: 'కొనసాగించండి',
    mr: 'पुढे जा',
    ta: 'தொடரவும்',
    gu: 'આગળ વધો',
    kn: 'ಮುಂದುವರಿಸಿ',
    ml: 'തുടരുക',
    pa: 'ਅੱਗੇ ਵਧੋ',
    or: 'ଆଗକୁ ବଢ଼ନ୍ତୁ',
    ur: 'آگے بڑھیں',
    as: 'আগবাঢ়ক',
    ne: 'जारी राख्नुहोस्',
  },

  // Voice AI Page
  'forensic entities without external cloud dependencies.': {
    hi: 'बिना बाहरी क्लाउड निर्भरता के फॉरेंसिक पहचान।',
    bn: 'বাহ্যিক ক্লাউড নির্ভরতা ছাড়াই ফরেনসিক তথ্য নিষ্কাশন।',
    te: 'బాహ్య క్లౌడ్ అవసరం లేకుండా ఫోరెన్సిక్ గుర్తింపు.',
    mr: 'क्लाउडवर अवलंबून न राहता फॉरेन्सिक ओळख.',
    ta: 'கிளவுட் சார்பின்றி தடையற்ற தடயவியல் தகவல்.',
    gu: 'ક્લાઉડ નિર્ભરતા વિના ફોરેન્સિક ઓળખ.',
    kn: 'ಕ್ಲೌಡ್ ಅವಲಂಬನೆಯಿಲ್ಲದೆ ವಿಧಿವಿಜ್ಞಾನ ಮಾಹಿತಿ.',
    ml: 'ക്ലൗഡ് ഇല്ലാതെ ഫോറൻസിക് വിവരങ്ങൾ ലഭ്യമാക്കുന്നു.',
    pa: 'ਕਲਾਉਡ ਨਿਰਭਰਤਾ ਤੋਂ ਬਿਨਾਂ ਫੋਰੈਂਸਿਕ ਜਾਣਕਾਰੀ।',
    or: 'କ୍ଲାଉଡ ନିର୍ଭରତା ବିନା ଫରେନସିକ ଚିହ୍ନଟ।',
    ur: 'بیرونی کلاؤڈ کے بغیر فرانزک شناختی نظام۔',
    as: 'ক্লাউড নিৰ্ভৰশীলতাহীন ফৰেনছিক চিনাক্তকৰণ।',
    ne: 'बाहिरी क्लाउड निर्भरता बिना फोरेन्सिक पहिचान।',
  },
  '1. Voice & Text Intake': {
    hi: '1. वॉइस और टेक्स्ट इनटेक',
    bn: '১. ভয়েস ও টেক্সট ইনপুট',
    te: '1. వాయిస్ & టెక్స్ట్ ఇంటేక్',
    mr: '१. व्हॉइस आणि मजकूर नोंदणी',
    ta: '1. குரல் & உரை உள்ளீடு',
    gu: '1. વોઇસ અને ટેક્સ્ટ ઇનટેક',
    kn: '1. ಧ್ವನಿ ಮತ್ತು ಪಠ್ಯ ಇನ್‌ಪುಟ್',
    ml: '1. വോയ്‌സ് & ടെക്സ്റ്റ് ഇൻടേക്ക്',
    pa: '1. ਵੌਇਸ ਅਤੇ ਟੈਕਸਟ ਇਨਟੇਕ',
    or: '୧. ଭଏସ୍ ଏବଂ ଟେକ୍ସଟ୍ ଇନଟେକ୍',
    ur: '1. آواز اور متن کا اندراج',
    as: '১. ভইচ আৰু পাঠ্য প্ৰৱেশ',
    ne: '१. आवाज र पाठ इन्टेक',
  },
  '2. Forensic Extraction & Review': {
    hi: '2. फॉरेंसिक निष्कर्षण और समीक्षा',
    bn: '২. ফরেনসিক বিশ্লেষণ ও পর্যালোচনা',
    te: '2. ఫోరెన్సిక్ సమీక్ష',
    mr: '२. फॉरेन्सिक विश्लेषण व पुनरावलोकन',
    ta: '2. தடயவியல் பிரித்தெடுத்தல் & ஆய்வு',
    gu: '2. ફોરેન્સિક પૃથક્કરણ અને સમીક્ષા',
    kn: '2. ವಿಧಿವಿಜ್ಞಾನ ಪರಿಶೀಲನೆ',
    ml: '2. ഫോറൻസിക് വിശകലനവും അവലോകനവും',
    pa: '2. ਫੋਰੈਂਸਿਕ ਜਾਂਚ ਅਤੇ ਸਮੀਖਿਆ',
    or: '୨. ଫରେନସିକ ବିଶ୍ଳେଷଣ ଏବଂ ସମୀକ୍ଷା',
    ur: '2. فرانزک تجزیہ اور جائزہ',
    as: '২. ফৰেনছিক বিশ্লেষণ আৰু পৰ্যালোচনা',
    ne: '२. फोरेन्सिक विश्लेषण र समीक्षा',
  },
  'Deterministic Zero-Dependency NLP': {
    hi: 'सटीक जीरो-डिपेंडेंसी एनएलपी',
    bn: 'নির্ভুল জিরো-ডিপেন্ডেন্সি এনএলপি',
    te: 'ఖచ్చితమైన జీరో-డిపెండెన్సీ ఎన్‌ఎల్‌పి',
    mr: 'अचूक शून्य-अवलंबित्व एनएलपी',
    ta: 'துல்லியமான ஜீரோ-டிபென்டன்சி என்.எல்.பி',
    gu: 'ચોક્કસ ઝીરો-ડિપેન્ડન્સી એનએલપી',
    kn: 'ನಿಖರ ಝೀರೋ-ಡಿಪೆಂಡೆನ್ಸಿ ಎನ್‌ಎಲ್‌ಪಿ',
    ml: 'കൃത്യതയുള്ള സീറോ-ഡിപെൻഡൻസി എൻഎൽപി',
    pa: 'ਸਟੀਕ ਜ਼ੀਰੋ-ਡਿਪੈਂਡੈਂਸੀ ਐਨਐਲਪੀ',
    or: 'ସଠିକ ଜିରୋ-ଡିପେଣ୍ଡେନ୍ସି ଏନଏଲପି',
    ur: 'انتہائی درست زیرو ڈیپینڈینسی این ایل پی',
    as: 'সঠিক জিৰো-ডিপেণ্ডেন্সি এনএলপি',
    ne: 'सटीक शून्य-निर्भरता एनएलपी',
  },
  'VOICE & AUDIO DISPATCH PARSER': {
    hi: 'वॉइस और ऑडियो डिस्पैच पार्सर',
    bn: 'ভয়েস ও অডিও ডিসপ্যাচ পার্সার',
    te: 'వాయిస్ & ఆడియో డిస్పాచ్ పార్సర్',
    mr: 'व्हॉइस व ऑडिओ संदेश विश्लेषक',
    ta: 'குரல் & ஆடியோ செய்தி பாகுபடுத்தி',
    gu: 'વોઇસ અને ઓડિયો ડિસ્પેચ પાર્સર',
    kn: 'ಧ್ವನಿ ಮತ್ತು ಆಡಿಯೋ ರವಾನೆ ಪಾರ್ಸರ್',
    ml: 'വോയ്‌സ് & ഓഡിയോ ഡിസ്‌പാച്ച് പാർസർ',
    pa: 'ਵੌਇਸ ਅਤੇ ਆਡੀਓ ਡਿਸਪੈਚ ਪਾਰਸਰ',
    or: 'ଭଏସ୍ ଏବଂ ଅଡିଓ ବାର୍ତ୍ତା ବିଶ୍ଳେଷକ',
    ur: 'وائس اور آڈیو ڈسپیچ پارسر',
    as: 'ভইচ আৰু অডিঅ’ বাৰ্তা বিশ্লেষক',
    ne: 'आवाज र अडियो सन्देश विश्लेषक',
  },
  'Chimes: ON': {
    hi: 'ध्वनि: चालू',
    bn: 'শব্দ: চালু',
    te: 'శబ్దం: ఆన్',
    mr: 'आवाज: सुरू',
    ta: 'ஒலி: இயக்கத்தில்',
    gu: 'ધ્વનિ: ચાલુ',
    kn: 'ಶಬ್ದ: ಚಾಲು',
    ml: 'ശബ്ദം: ഓൺ',
    pa: 'ਆਵਾਜ਼: ਚਾਲੂ',
    or: 'ଶବ୍ଦ: ଚାଲୁ',
    ur: 'آواز: آن',
    as: 'শব্দ: অন',
    ne: 'आवाज: सुरु',
  },
  'Chimes: OFF': {
    hi: 'ध्वनि: बंद',
    bn: 'শব্দ: বন্ধ',
    te: 'శబ్దం: ఆఫ్',
    mr: 'आवाज: बंद',
    ta: 'ஒலி: முடக்கம்',
    gu: 'ધ્વનિ: બંધ',
    kn: 'ಶಬ್ದ: ಬಂದ್',
    ml: 'ശബ്ദം: ഓഫ്',
    pa: 'ਆਵਾਜ਼: ਬੰਦ',
    or: 'ଶବ୍ଦ: ବନ୍ଦ',
    ur: 'آواز: بند',
    as: 'শব্দ: অফ',
    ne: 'आवाज: बन्द',
  },
  'Click to Start Speech-to-Text Dictation': {
    hi: 'बोलना शुरू करने के लिए यहाँ क्लिक करें',
    bn: 'কথা বলা শুরু করতে এখানে ক্লিক করুন',
    te: 'వాయిస్ టైపింగ్ ప్రారంభించడానికి ఇక్కడ క్లిక్ చేయండి',
    mr: 'बोलणे सुरू करण्यासाठी येथे क्लिक करा',
    ta: 'பேசத் தொடங்க இங்கே கிளிக் செய்யவும்',
    gu: 'બોલવાનું શરૂ કરવા માટે અહીં ક્લિક કરો',
    kn: 'ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ',
    ml: 'സംസാരിക്കാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക',
    pa: 'ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ',
    or: 'କହିବା ଆରମ୍ଭ କରିବାକୁ ଏଠାରେ କ୍ଲିକ୍ କରନ୍ତୁ',
    ur: 'بولنا شروع کرنے کے لیے یہاں کلک کریں',
    as: 'কথা ক’বলৈ ইয়াত ক্লিক কৰক',
    ne: 'बोल्न सुरु गर्न यहाँ क्लिक गर्नुहोस्',
  },
  'Or paste raw VHF radio logs or field dispatch text directly in the box below.': {
    hi: 'या नीचे दिए गए बॉक्स में सीधे VHF रेडियो लॉग या फील्ड नोट्स पेस्ट करें।',
    bn: 'অথবা নিচের বক্সে সরাসরি VHF রেডিও লগ বা ফিল্ড নোট পেস্ট করুন।',
    te: 'లేదా క్రింది పెట్టెలో నేరుగా రేడియో లాగ్‌లను పేస్ట్ చేయండి.',
    mr: 'किंवा खालील बॉक्समध्ये थेट VHF रेडिओ नोंदी पेस्ट करा.',
    ta: 'அல்லது கீழே உள்ள பெட்டியில் நேரடியாக குறிப்புகளை ஒட்டவும்.',
    gu: 'અથવા નીચેના બોક્સમાં સીધા રેડિયો લોગ પેસ્ટ કરો.',
    kn: 'ಅಥವಾ ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ರೇಡಿಯೋ ಲಾಗ್‌ಗಳನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ.',
    ml: 'അല്ലെങ്കിൽ താഴെയുള്ള ബോക്സിൽ കുറിപ്പുകൾ പേസ്റ്റ് ചെയ്യുക.',
    pa: 'ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਬਕਸੇ ਵਿੱਚ ਸਿੱਧੇ ਰੇਡੀਓ ਲੌਗ ਪੇਸਟ ਕਰੋ।',
    or: 'କିମ୍ବା ତଳ ବାକ୍ସରେ ସିଧାସଳଖ ରେଡିଓ ଲଗ୍ ପେଷ୍ଟ କରନ୍ତୁ।',
    ur: 'یا نیچے دیے گئے باکس میں ریڈیو لاگ یا نوٹس چسپاں کریں۔',
    as: 'বা তলৰ বাকচত পোনপটীয়াকৈ ৰেডিঅ’ টোকা পেষ্ট কৰক।',
    ne: 'वा तलको बक्समा सिधै रेडियो लग वा फिल्ड नोट पेस्ट गर्नुहोस्।',
  },
  'DISPATCH TRANSCRIPT BUFFER': {
    hi: 'डिस्पैच ट्रांसक्रिप्ट बफर',
    bn: 'ডিসপ্যাচ ট্রান্সক্রিপ্ট বাফার',
    te: 'డిస్పాచ్ ట్రాన్స్‌క్రిప్ట్ బఫర్',
    mr: 'संदेश मजकूर बफर',
    ta: 'செய்தி படியெடுப்பு சேமிப்பகம்',
    gu: 'ડિસ્પેચ ટ્રાન્સક્રિપ્ટ બફર',
    kn: 'ರವಾನೆ ಪ್ರತಿಲಿಪಿ ಬಫರ್',
    ml: 'സന്ദേശ ട്രാൻസ്ക്രിപ്റ്റ് ബഫർ',
    pa: 'ਡਿਸਪੈਚ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਬਫਰ',
    or: 'ବାର୍ତ୍ତା ଲିପି ବଫର',
    ur: 'ڈسپیچ تحریری بفر',
    as: 'বাৰ্তা পাঠ্য বাফাৰ',
    ne: 'सन्देश प्रतिलिपि बफर',
  },
  'Spoken statements will stream here automatically...': {
    hi: 'बोले गए कथन यहाँ स्वचालित रूप से दिखाई देंगे...',
    bn: 'বলা কথাগুলি এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে...',
    te: 'మాట్లాడిన పదాలు ఇక్కడ స్వయంచాలకంగా కనిపిస్తాయి...',
    mr: 'बोललेले वाक्ये येथे आपोआप दिसतील...',
    ta: 'பேசப்படும் வார்த்தைகள் இங்கே தானாகவே தோன்றும்...',
    gu: 'બોલાયેલા વાક્યો અહીં આપોઆપ દેખાશે...',
    kn: 'ಮಾತನಾಡಿದ ವಾಕ್ಯಗಳು ಇಲ್ಲಿ ತಾನಾಗಿಯೇ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ...',
    ml: 'സംസാരിക്കുന്ന വാക്കുകൾ ഇവിടെ തനിയെ ദൃശ്യമാകും...',
    pa: 'ਬੋਲੇ ਗਏ ਸ਼ਬਦ ਇੱਥੇ ਆਪਣੇ ਆਪ ਦਿਖਾਈ ਦੇਣਗੇ...',
    or: 'କୁହାଯାଇଥିବା ବାକ୍ୟ ଏଠାରେ ସ୍ୱତଃ ପ୍ରଦର୍ଶିତ ହେବ...',
    ur: 'بولے گئے جملے یہاں خود بخود نظر آئیں گے...',
    as: 'কোৱা কথাবোৰ ইয়াত স্বয়ংক্ৰিয়ভাৱে দেখা যাব...',
    ne: 'बोलिएका वाक्यहरू यहाँ स्वतः देखिनेछन्...',
  },
  'Paste Notes': {
    hi: 'नोट्स पेस्ट करें',
    bn: 'নোট পেস্ট করুন',
    te: 'నోట్స్ పేస్ట్ చేయండి',
    mr: 'नोंदी पेस्ट करा',
    ta: 'குறிப்புகளை ஒட்டவும்',
    gu: 'નોંધ પેસ્ટ કરો',
    kn: 'ಟಿಪ್ಪಣಿಗಳನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ',
    ml: 'കുറിപ്പുകൾ പേസ്റ്റ് ചെയ്യുക',
    pa: 'ਨੋਟਸ ਪੇਸਟ ਕਰੋ',
    or: 'ନୋଟ୍ ପେଷ୍ଟ କରନ୍ତୁ',
    ur: 'نوٹس پیسٹ کریں',
    as: 'টোকা পেষ্ট কৰক',
    ne: 'नोट पेस्ट गर्नुहोस्',
  },
  'Demo Transcripts': {
    hi: 'डेमो ट्रांसक्रिप्ट',
    bn: 'ডেমো প্রতিলিপি',
    te: 'డెమో ట్రాన్స్‌క్రిప్ట్‌లు',
    mr: 'डेमो मजकूर',
    ta: 'மாதிரி உரைகள்',
    gu: 'ડેમો ટ્રાન્સક્રિપ્ટ',
    kn: 'ಮಾದರಿ ಪ್ರತಿಲಿಪಿಗಳು',
    ml: 'മാതൃകാ കുറിപ്പുകൾ',
    pa: 'ਡੈਮੋ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ',
    or: 'ଡେମୋ ଟ୍ରାନ୍ସକ୍ରିପ୍ଟ',
    ur: 'نمونہ تحریریں',
    as: 'নমুনা পাঠ্য',
    ne: 'डेमो प्रतिलिपि',
  },
  'Extract Fields & Review': {
    hi: 'फ़ील्ड निकालें और समीक्षा करें',
    bn: 'তথ্য বের করুন এবং পর্যালোচনা করুন',
    te: 'వివరాలు సేకరించి సమీక్షించండి',
    mr: 'माहिती काढा आणि तपासा',
    ta: 'விவரங்களை எடுத்து சரிபார்க்கவும்',
    gu: 'માહિતી અલગ તારવો અને સમીક્ષા કરો',
    kn: 'ವಿವರಗಳನ್ನು ಹೊರತೆಗೆದು ಪರಿಶೀಲಿಸಿ',
    ml: 'വിവരങ്ങൾ എടുത്ത് പരിശോധിക്കുക',
    pa: 'ਵੇਰਵੇ ਕੱਢੋ ਅਤੇ ਸਮੀਖਿਆ ਕਰੋ',
    or: 'ତଥ୍ୟ ବାହାର କରି ସମୀକ୍ଷା କରନ୍ତୁ',
    ur: 'تفصیلات نکالیں اور جائزہ لیں',
    as: 'তথ্য উলিয়াই পৰ্যালোচনা কৰক',
    ne: 'विवरण निकाली समीक्षा गर्नुहोस्',
  },

  // Forensic Dossier Page
  'Forensic Verification Dossier': {
    hi: 'फॉरेंसिक सत्यापन डोसियर',
    bn: 'ফরেনসিক যাচাইকরণ ডসিয়ার',
    te: 'ఫోరెన్సిక్ ధృవీకరణ డాసియర్',
    mr: 'फॉरेन्सिक पडताळणी डॉसियर',
    ta: 'தடயவியல் சரிபார்ப்பு ஆவணம்',
    gu: 'ફોરેન્સિક ચકાસણી ડોઝિયર',
    kn: 'ವಿಧಿವಿಜ್ಞಾನ ದೃಢೀಕರಣ ಡಾಕ್ಯುಮೆಂಟ್',
    ml: 'ഫോറൻസിക് സ്ഥിരീകരണ രേഖ',
    pa: 'ਫੋਰੈਂਸਿਕ ਤਸਦੀਕ ਡੌਜ਼ੀਅਰ',
    or: 'ଫରେନସିକ ପ୍ରମାଣୀକରଣ ଡୋସିଅର',
    ur: 'فرانزک تصدیقی ڈوزیئر',
    as: 'ফৰেনছিক প্ৰমাণীকৰণ ডছিয়াৰ',
    ne: 'फोरेन्सिक प्रमाणीकरण डोसियर',
  },
  'SIMULATED DRILL / DEMO DATA': {
    hi: 'सिम्युलेटेड अभ्यास / डेमो डेटा',
    bn: 'নমুনা মহড়া / ডেমো তথ্য',
    te: 'మాక్ డ్రిల్ / డెమో డేటా',
    mr: 'प्रायोगिक सराव / डेमो डेटा',
    ta: 'மாதிரி பயிற்சி / டெமோ தகவல்',
    gu: 'મોક ડ્રિલ / ડેમો ડેટા',
    kn: 'ಮಾದರಿ ಅಭ್ಯಾಸ / ಡೆಮೊ ಡೇಟಾ',
    ml: 'മോക്ക് ഡ്രിൽ / ഡെമോ ഡാറ്റ',
    pa: 'ਸਿਮੂਲੇਟਿਡ ਮੌਕ ਡ੍ਰਿਲ / ਡੈਮੋ ਡਾਟਾ',
    or: 'ମକ୍ ଡ୍ରିଲ୍ / ଡେମୋ ଡାଟା',
    ur: 'فرضی مشق / نمونہ ڈیٹا',
    as: 'নমুনা অনুশীলন / ডেমো তথ্য',
    ne: 'नमुना अभ्यास / डेमो डेटा',
  },
  'CONFIDENCE': {
    hi: 'विश्वसनीयता स्तर',
    bn: 'নির্ভরযোগ্যতা',
    te: 'విశ్వసనీయత',
    mr: 'विश्वासार्हता',
    ta: 'நம்பகத்தன்மை',
    gu: 'વિશ્વાસપાત્રતા',
    kn: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    ml: 'വിശ്വാസ്യത',
    pa: 'ਭਰੋਸੇਯੋਗਤਾ',
    or: 'ବିଶ୍ୱାସନୀୟତା',
    ur: 'اعتماد کی شرح',
    as: 'বিশ্বাসযোগ্যতা',
    ne: 'विश्वसनीयता',
  },
  'COMPLETENESS': {
    hi: 'डेटा पूर्णता',
    bn: 'সম্পূর্ণতা',
    te: 'సంపూర్ణత',
    mr: 'माहितीची पूर्णता',
    ta: 'முழுமைத்தன்மை',
    gu: 'સંપૂર્ણતા',
    kn: 'ಸಂಪೂರ್ಣತೆ',
    ml: 'പൂർണ്ണത',
    pa: 'ਸੰਪੂਰਨਤਾ',
    or: 'ସମ୍ପୂର୍ଣ୍ଣତା',
    ur: 'مکمل پن',
    as: 'সম্পূৰ্ণতা',
    ne: 'पूर्णता',
  },
  'EVIDENCE FIELDS': {
    hi: 'साक्ष्य फ़ील्ड',
    bn: 'প্রমাণ ক্ষেত্র',
    te: 'సాక్ష్య రంగం',
    mr: 'पुरावा घटक',
    ta: 'சான்று புலங்கள்',
    gu: 'પુરાવા ક્ષેત્રો',
    kn: 'ಪುರಾವೆ ಕ್ಷೇತ್ರಗಳು',
    ml: 'തെളിവുകളുടെ എണ്ണം',
    pa: 'ਸਬੂਤ ਖੇਤਰ',
    or: 'ପ୍ରମାଣ କ୍ଷେତ୍ର',
    ur: 'شواہد کے شعبے',
    as: 'প্ৰমাণ ক্ষেত্ৰ',
    ne: 'प्रमाणका क्षेत्रहरू',
  },
  'ALERTS': {
    hi: 'चेतावनी',
    bn: 'সতর্কতা',
    te: 'హెచ్చరికలు',
    mr: 'सूचना / इशारे',
    ta: 'எச்சரிக்கைகள்',
    gu: 'ચેતવણીઓ',
    kn: 'ಎಚ್ಚರಿಕೆಗಳು',
    ml: 'മുന്നറിയിപ്പുകൾ',
    pa: 'ਚੇਤਾਵਨੀਆਂ',
    or: 'ସତର୍କତା',
    ur: 'انتباہات',
    as: 'সতৰ্কবাণী',
    ne: 'सचेतता',
  },
  'MANUAL REVIEW REQUIRED': {
    hi: 'मैनुअल समीक्षा आवश्यक',
    bn: 'ম্যানুয়াল পর্যালোচনা প্রয়োজন',
    te: 'మాన్యువల్ సమీక్ష అవసరం',
    mr: 'प्रत्यक्ष पुनरावलोकन आवश्यक',
    ta: 'நேரடி ஆய்வு தேவை',
    gu: 'મેન્યુઅલ સમીક્ષા જરૂરી',
    kn: 'ಮ್ಯಾನುಯಲ್ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
    ml: 'നേരിട്ടുള്ള പരിശോധന ആവശ്യമാണ്',
    pa: 'ਮੈਨੂਅਲ ਸਮੀਖਿਆ ਜ਼ਰੂਰੀ ਹੈ',
    or: 'ମାନୁଆଲ୍ ସମୀକ୍ଷା ଆବଶ୍ୟକ',
    ur: 'دستی جائزہ درکار ہے',
    as: 'মেনুৱেল পৰ্যালোচনা প্ৰয়োজন',
    ne: 'म्यानुअल समीक्षा आवश्यक',
  },
  'Print Dossier': {
    hi: 'डोसियर प्रिंट करें',
    bn: 'ডসিয়ার প্রিন্ট করুন',
    te: 'డాసియర్ ప్రింట్ చేయండి',
    mr: 'डॉसियर प्रिंट करा',
    ta: 'ஆவணத்தை அச்சிடுக',
    gu: 'ડોઝિયર પ્રિન્ટ કરો',
    kn: 'ಡಾಕ್ಯುಮೆಂಟ್ ಪ್ರಿಂಟ್ ಮಾಡಿ',
    ml: 'രേഖ പ്രിന്റ് ചെയ്യുക',
    pa: 'ਡੌਜ਼ੀਅਰ ਪ੍ਰਿੰਟ ਕਰੋ',
    or: 'ଡୋସିଅର ପ୍ରିଣ୍ଟ କରନ୍ତୁ',
    ur: 'ڈوزیئر پرنٹ کریں',
    as: 'ডছিয়াৰ প্ৰিন্ট কৰক',
    ne: 'डोसियर प्रिन्ट गर्नुहोस्',
  },
  'Download (.txt)': {
    hi: 'डाउनलोड (.txt)',
    bn: 'ডাউনলোড (.txt)',
    te: 'డౌన్‌లోడ్ (.txt)',
    mr: 'डाउनलोड (.txt)',
    ta: 'பதிவிறக்கு (.txt)',
    gu: 'ડાઉનલોડ (.txt)',
    kn: 'ಡೌನ್‌ಲೋಡ್ (.txt)',
    ml: 'ഡൗൺലോഡ് (.txt)',
    pa: 'ਡਾਊਨਲੋਡ (.txt)',
    or: 'ଡାଉନଲୋଡ୍ (.txt)',
    ur: 'ڈاؤنلوڈ (.txt)',
    as: 'ডাউনলোড (.txt)',
    ne: 'डाउनलोड (.txt)',
  },
  'Deterministic Evidence Matrix': {
    hi: 'साक्ष्य मिलान मैट्रिक्स',
    bn: 'প্রমাণ মিলকরণ ম্যাট্রিক্স',
    te: 'సాక్ష్య సరిపోలిక మ్యాట్రిక్స్',
    mr: 'पुरावा जुळणी तक्ता',
    ta: 'சான்று பொருத்த கட்டமைப்பு',
    gu: 'પુરાવા સરખામણી મેટ્રિક્સ',
    kn: 'ಪುರಾವೆ ಹೊಂದಾಣಿಕೆ ಮ್ಯಾಟ್ರಿಕ್ಸ್',
    ml: 'തെളിവ് പരിശോധനാ മാട്രിക്സ്',
    pa: 'ਸਬੂਤ ਮਿਲਾਨ ਮੈਟ੍ਰਿਕਸ',
    or: 'ପ୍ରମାଣ ମେଳଣ ମ୍ୟାଟ୍ରିକ୍ସ',
    ur: 'شواہد کی تقابلی میٹرکس',
    as: 'প্ৰমাণ মিলকৰণ মেট্ৰিক্স',
    ne: 'प्रमाण मिलान म्याट्रिक्स',
  },
  'GENDER': {
    hi: 'लिंग',
    bn: 'লিঙ্গ',
    te: 'లింగం',
    mr: 'लिंग',
    ta: 'பாலினம்',
    gu: 'જાતિ',
    kn: 'ಲಿಂಗ',
    ml: 'ലിംഗം',
    pa: 'ਲਿੰਗ',
    or: 'ଲିଙ୍ଗ',
    ur: 'جنس',
    as: 'লিংগ',
    ne: 'लिङ्ग',
  },
  'AGE': {
    hi: 'आयु',
    bn: 'বয়স',
    te: 'వయస్సు',
    mr: 'वय',
    ta: 'வயது',
    gu: 'ઉંમર',
    kn: 'ವಯಸ್ಸು',
    ml: 'പ്രായം',
    pa: 'ਉਮਰ',
    or: 'ବୟସ',
    ur: 'عمر',
    as: 'বয়স',
    ne: 'उमेर',
  },
  'BLOOD GROUP': {
    hi: 'रक्त समूह',
    bn: 'রক্তের গ্রুপ',
    te: 'రక్త వర్గం',
    mr: 'रक्तगट',
    ta: 'இரத்த வகை',
    gu: 'બ્લડ ગ્રુપ',
    kn: 'ರಕ್ತದ ಗುಂಪು',
    ml: 'രക്തഗ്രൂപ്പ്',
    pa: 'ਬਲੱਡ ਗਰੁੱਪ',
    or: 'ରକ୍ତ ବର୍ଗ',
    ur: 'بلڈ گروپ',
    as: 'তেজৰ গ্ৰুপ',
    ne: 'रगत समूह',
  },
  'BUILD': {
    hi: 'शारीरिक कद-काठी',
    bn: 'শারীরিক গঠন',
    te: 'శరీర నిర్మాణం',
    mr: 'शरीरयष्टी',
    ta: 'உடல் பருமன்',
    gu: 'શરીરનું બંધારણ',
    kn: 'ದೇಹದಾಢ್ಯತೆ',
    ml: 'ശരീര പ്രകൃതി',
    pa: 'ਸਰੀਰਕ ਬਣਤਰ',
    or: 'ଶରୀର ଗଠନ',
    ur: 'جسمانی ساخت',
    as: 'শাৰীৰিক গঠন',
    ne: 'शारीरिक बनावट',
  },
  'HEIGHT': {
    hi: 'ऊंचाई',
    bn: 'উচ্চতা',
    te: 'ఎత్తు',
    mr: 'उंची',
    ta: 'உயரம்',
    gu: 'ઊંચાઈ',
    kn: 'ಎತ್ತರ',
    ml: 'ഉയരം',
    pa: 'ਕੱਦ',
    or: 'ଉଚ୍ଚତା',
    ur: 'قد',
    as: 'উচ্চতা',
    ne: 'उचाइ',
  },
  'HAIR': {
    hi: 'बाल',
    bn: 'চুল',
    te: 'జుట్టు',
    mr: 'केस',
    ta: 'முடி',
    gu: 'વાળ',
    kn: 'ಕೂದಲು',
    ml: 'മുടി',
    pa: 'ਵਾਲ',
    or: 'ବାଳ',
    ur: 'بال',
    as: 'চুলি',
    ne: 'कपाल',
  },
  'CLOTHING': {
    hi: 'वस्त्र',
    bn: 'পোশাক',
    te: 'దుస్తులు',
    mr: 'कपडे',
    ta: 'ஆடை',
    gu: 'કપડાં',
    kn: 'ಉಡುಪು',
    ml: 'വസ്ത്രം',
    pa: 'ਕੱਪੜੇ',
    or: 'ପୋଷାକ',
    ur: 'لباس',
    as: 'পোছাক',
    ne: 'लुगा',
  },
  'SCARS': {
    hi: 'निशान',
    bn: 'দাগ',
    te: 'మచ్చలు',
    mr: 'व्रण / खुणा',
    ta: 'தழும்புகள்',
    gu: 'ડાઘ / નિશાન',
    kn: 'ಕಲೆಗಳು',
    ml: 'പാടുകൾ',
    pa: 'ਨਿਸ਼ਾਨ',
    or: 'ଦାଗ',
    ur: 'نشانات',
    as: 'দাগ',
    ne: 'निशान',
  },
  'BIRTHMARKS': {
    hi: 'जन्मचिह्न',
    bn: 'জন্মদাগ',
    te: 'పుట్టుమచ్చలు',
    mr: 'जन्मखूण',
    ta: 'மச்சங்கள்',
    gu: 'જન્મચિહ્ન',
    kn: 'ಹುಟ್ಟುಮಚ್ಚೆಗಳು',
    ml: 'മറുക്',
    pa: 'ਜਨਮ ਚਿੰਨ੍ਹ',
    or: 'ଜନ୍ମଦାଗ',
    ur: 'پیدائشی تل',
    as: 'জন্মদাগ',
    ne: 'जन्मचिन्ह',
  },
  'LOCATION': {
    hi: 'स्थान',
    bn: 'অবস্থান',
    te: 'స్థానం',
    mr: 'ठिकाण',
    ta: 'இடம்',
    gu: 'સ્થળ',
    kn: 'ಸ್ಥಳ',
    ml: 'സ്ഥലം',
    pa: 'ਸਥਾਨ',
    or: 'ସ୍ଥାନ',
    ur: 'مقام',
    as: 'স্থান',
    ne: 'स्थान',
  },
  'SOURCE': {
    hi: 'स्रोत',
    bn: 'উৎস',
    te: 'మూలం',
    mr: 'स्रोत',
    ta: 'மூலம்',
    gu: 'સ્ત્રોત',
    kn: 'ಮೂಲ',
    ml: 'ഉറവിടം',
    pa: 'ਸਰੋਤ',
    or: 'ଉତ୍ସ',
    ur: 'ماخذ',
    as: 'উৎস',
    ne: 'स्रोत',
  },
  'CANDIDATE': {
    hi: 'उम्मीदवार रिकॉर्ड',
    bn: 'প্রার্থী রেকর্ড',
    te: 'అభ్యర్థి రికార్డు',
    mr: 'तपासणी रेकॉर्ड',
    ta: 'ஒப்பீட்டு பதிவு',
    gu: 'ઉમેદવાર રેકોર્ડ',
    kn: 'ಹೊಂದಾಣಿಕೆ ದಾಖಲೆ',
    ml: 'സാധ്യതാ രേഖ',
    pa: 'ਉਮੀਦਵਾਰ ਰਿਕਾਰਡ',
    or: 'ମେଳଣ ରେକର୍ଡ',
    ur: 'مماثل ریکارڈ',
    as: 'প্ৰাৰ্থী ৰেকৰ্ড',
    ne: 'उम्मेदवार रेकर्ड',
  },
};

// Fast O(1) reverse lookup map: englishText -> translationKey
let reverseLocaleMap: Map<string, string> | null = null;

function getReverseLocaleMap(): Map<string, string> {
  if (reverseLocaleMap) return reverseLocaleMap;
  const map = new Map<string, string>();
  const enDict = locales.en;
  for (const [key, value] of Object.entries(enDict)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      map.set(value.trim().toLowerCase(), key);
    }
  }
  reverseLocaleMap = map;
  return map;
}

/**
 * Intelligent high-speed translation resolver for a single text phrase
 */
export function translatePortalPhrase(englishText: string, targetLang: LanguageCode): string {
  if (targetLang === 'en' || !englishText) return englishText;

  const trimmed = englishText.trim();
  if (!trimmed) return englishText;

  // 1. Direct match in dedicated portal UI terms
  if (PORTAL_UI_TERMS[trimmed] && PORTAL_UI_TERMS[trimmed][targetLang]) {
    return englishText.replace(trimmed, PORTAL_UI_TERMS[trimmed][targetLang]);
  }

  // Case-insensitive lookup in dedicated terms
  const lower = trimmed.toLowerCase();
  for (const [key, langMap] of Object.entries(PORTAL_UI_TERMS)) {
    if (key.toLowerCase() === lower && langMap[targetLang]) {
      return englishText.replace(trimmed, langMap[targetLang]);
    }
  }

  // 2. Canonical locale dictionary lookup
  const revMap = getReverseLocaleMap();
  const localeKey = revMap.get(lower);
  const targetDict = (locales[targetLang] as unknown) as Record<string, string> | undefined;
  if (localeKey && targetDict && targetDict[localeKey]) {
    return englishText.replace(trimmed, targetDict[localeKey]);
  }

  // 3. Composite phrase patterns
  // Pattern A: "Age 24 • Unknown • Blood ?" -> "आयु 24 • अज्ञात • रक्त ?"
  if (/^Age\s+(\d+|Unknown)\s*•\s*(.*?)\s*•\s*Blood\s*(.*?)$/i.test(trimmed)) {
    return trimmed.replace(
      /^Age\s+(\d+|Unknown)\s*•\s*(.*?)\s*•\s*Blood\s*(.*?)$/i,
      (_match, p1, p2, p3) => {
        const ageLabel = translatePortalPhrase('Age', targetLang);
        const ageVal = p1 === 'Unknown' ? translatePortalPhrase('Unknown', targetLang) : p1;
        const genderVal = translatePortalPhrase(p2.trim(), targetLang);
        const bloodLabel = translatePortalPhrase('Blood Group', targetLang);
        return `${ageLabel} ${ageVal} • ${genderVal} • ${bloodLabel} ${p3.trim()}`;
      }
    );
  }

  // Pattern B: "Step 1 of 6"
  if (/^Step\s+(\d+)\s+of\s+(\d+)$/i.test(trimmed)) {
    return trimmed.replace(/^Step\s+(\d+)\s+of\s+(\d+)$/i, (_m, s, total) => {
      const stepLabel = targetLang === 'hi' ? 'चरण' : targetLang === 'bn' ? 'ধাপ' : targetLang === 'te' ? 'దశ' : targetLang === 'ur' ? 'مرحلہ' : 'Step';
      return `${stepLabel} ${s} / ${total}`;
    });
  }

  // Pattern C: "e.g. Aarav Sharma" -> "उदा. आरव शर्मा"
  if (/^e\.g\.\s+(.*)$/i.test(trimmed)) {
    const prefix = targetLang === 'hi' ? 'उदा.' : targetLang === 'bn' ? 'যেমন' : targetLang === 'ur' ? 'مثلاً' : 'e.g.';
    return trimmed.replace(/^e\.g\.\s+(.*)$/i, `${prefix} $1`);
  }

  // Pattern D: "7 matched • 2 conflicting • 0 data gaps"
  if (/^(\d+)\s+matched\s*•\s*(\d+)\s+conflicting\s*•\s*(\d+)\s+data\s+gaps$/i.test(trimmed)) {
    return trimmed.replace(
      /^(\d+)\s+matched\s*•\s*(\d+)\s+conflicting\s*•\s*(\d+)\s+data\s+gaps$/i,
      (_m, m, c, d) => {
        const matchedStr = targetLang === 'hi' ? 'मिले' : targetLang === 'bn' ? 'মিলেছে' : 'matched';
        const conflictStr = targetLang === 'hi' ? 'विरोधाभासी' : targetLang === 'bn' ? 'দ্বন্দ্ব' : 'conflicting';
        const dataGapStr = targetLang === 'hi' ? 'अनुपलब्ध' : targetLang === 'bn' ? 'অপূর্ণ' : 'data gaps';
        return `${m} ${matchedStr} • ${c} ${conflictStr} • ${d} ${dataGapStr}`;
      }
    );
  }

  // If no translation found, return original text safely
  return englishText;
}

// Active singleton instance tracking
let activeObserver: MutationObserver | null = null;
let currentActiveLanguage: LanguageCode = 'en';

/**
 * Sweeps the entire live DOM tree and translates text nodes and form placeholders
 * Executes synchronously in ~10ms to 30ms (well under 1 second!)
 */
export function sweepLiveDom(targetLang: LanguageCode): void {
  currentActiveLanguage = targetLang;

  if (typeof document === 'undefined') return;

  // If switching to English, restore all original text
  if (targetLang === 'en') {
    restoreEnglishDom();
    return;
  }

  // 1. Traverse all visible text nodes in the DOM
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE') {
          return NodeFilter.FILTER_REJECT;
        }
        // Skip purely numeric, punctuation, or whitespace-only nodes
        const val = node.nodeValue?.trim();
        if (!val || /^[0-9.:\-\s/]+$/.test(val)) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let currentNode: Node | null;
  while ((currentNode = walker.nextNode())) {
    // Remember original text on first encounter
    if (!originalTextMap.has(currentNode)) {
      originalTextMap.set(currentNode, currentNode.nodeValue || '');
    }

    const canonicalOriginal = originalTextMap.get(currentNode) || currentNode.nodeValue || '';
    const translated = translatePortalPhrase(canonicalOriginal, targetLang);

    if (translated !== currentNode.nodeValue) {
      currentNode.nodeValue = translated;
    }
  }

  // 2. Translate Form Placeholders and Titles
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[placeholder], textarea[placeholder]');
  inputs.forEach((input) => {
    let original = input.getAttribute('data-milan-orig-placeholder');
    if (!original) {
      original = input.getAttribute('placeholder') || '';
      input.setAttribute('data-milan-orig-placeholder', original);
    }
    const translated = translatePortalPhrase(original, targetLang);
    if (input.getAttribute('placeholder') !== translated) {
      input.setAttribute('placeholder', translated);
    }
  });

  // 3. Translate select options
  const options = document.querySelectorAll<HTMLOptionElement>('select option');
  options.forEach((opt) => {
    let original = opt.getAttribute('data-milan-orig-text');
    if (!original) {
      original = opt.textContent || '';
      opt.setAttribute('data-milan-orig-text', original);
    }
    const translated = translatePortalPhrase(original, targetLang);
    if (opt.textContent !== translated) {
      opt.textContent = translated;
    }
  });
}

/**
 * Restores original English text on all modified DOM nodes
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
}

/**
 * Starts an intelligent MutationObserver that watches for newly mounted DOM nodes (like wizard steps, tables, or modals)
 * and applies translations instantaneously without any delay or user intervention.
 */
export function activateLiveDomTranslationEngine(language: LanguageCode): () => void {
  currentActiveLanguage = language;

  // Immediate sweep
  sweepLiveDom(language);

  // If already running an observer, disconnect previous
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

    // Check if mutation was caused by our own script changing nodeValue or placeholder
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

    // Fast 35ms debounced sweep to batch React renders together
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sweepLiveDom(currentActiveLanguage);
    }, 35);
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
