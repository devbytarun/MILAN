import { locales } from '../src/i18n/locales/index.ts';
import { SUPPORTED_LANGUAGES } from '../src/i18n/languages.ts';
import type { TranslationDictionary } from '../src/i18n/types.ts';
import { translateToHindi, transliterateToHindi } from '../src/i18n/dom-translation-engine.ts';

function runTests() {
  console.log('🧪 Running MILAN Hindi & English Localization Verification Tests...\n');

  const enKeys = Object.keys(locales.en) as (keyof TranslationDictionary)[];
  console.log(`[Base Locale] en.ts contains ${enKeys.length} translation keys.`);

  let totalErrors = 0;

  // 1. Verify English and Hindi are registered
  console.log('\n--- 1. Testing Supported Languages (English & Hindi) ---');
  if (SUPPORTED_LANGUAGES.length !== 2) {
    console.error(`❌ Expected 2 supported languages (English + Hindi), but found ${SUPPORTED_LANGUAGES.length}`);
    totalErrors++;
  } else {
    console.log(`✅ Correctly registered English and Hindi languages.`);
  }

  for (const lang of SUPPORTED_LANGUAGES) {
    if (!locales[lang.code]) {
      console.error(`❌ Missing locale dictionary in locales/index.ts for language code: "${lang.code}"`);
      totalErrors++;
    }
  }

  // 2. Verify 100% Key Parity between English and Hindi
  console.log('\n--- 2. Testing 100% Key Parity for English & Hindi ---');
  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = locales[lang.code];
    if (!dict) continue;

    const dictKeys = Object.keys(dict);
    const missingKeys = enKeys.filter((k) => !(k in dict));
    const extraKeys = dictKeys.filter((k) => !enKeys.includes(k as keyof TranslationDictionary));

    if (missingKeys.length > 0) {
      console.error(`❌ Language "${lang.code}" (${lang.englishName}) is missing ${missingKeys.length} keys`);
      totalErrors++;
    }

    if (extraKeys.length > 0) {
      console.error(`❌ Language "${lang.code}" (${lang.englishName}) has ${extraKeys.length} extra keys`);
      totalErrors++;
    }

    for (const key of enKeys) {
      const val = dict[key];
      if (typeof val !== 'string' || val.trim().length === 0) {
        console.error(`❌ Language "${lang.code}" has invalid string for key "${key}"`);
        totalErrors++;
      }
    }
  }

  if (totalErrors === 0) {
    console.log(`✅ English and Hindi have 100% key parity (${enKeys.length}/${enKeys.length} keys each).`);
  }

  // 3. Test Deep Hindi Neural Translator & Phonetic Transliteration
  console.log('\n--- 3. Testing Deep Hindi Neural Translator & Zero English Left Out ---');
  const testPhrases = [
    { en: 'File Missing', expected: 'लापता की रिपोर्ट दर्ज करें' },
    { en: 'Register Rescued', expected: 'बचाए गए का पंजीकरण' },
    { en: 'All Statuses', expected: 'सभी स्थितियाँ' },
    { en: 'Case UID', expected: 'केस यूआईडी' },
    { en: 'Unidentified Survivor', expected: 'अज्ञात जीवित व्यक्ति' },
    { en: 'Age 24 • Unknown • Blood ?', expected: 'आयु 24 • अज्ञात • रक्त समूह अज्ञात' },
    { en: 'Step 1 of 6', expected: 'चरण 1 / 6' },
    { en: 'Aarav Sharma', expected: 'आरव शर्मा' },
    { en: 'Alaknanda Riverside Market', expected: 'अलकनंदा रिवरसाइड मार्केट' },
  ];

  for (const item of testPhrases) {
    const translated = translateToHindi(item.en);
    if (!translated || translated === item.en) {
      console.error(`❌ Translation failed for "${item.en}", got untranslated "${translated}"`);
      totalErrors++;
    } else {
      console.log(`✅ PASSED: "${item.en}" ➔ "${translated}"`);
    }
  }

  // Test Transliteration
  const nameDev = transliterateToHindi('Aarav');
  if (nameDev !== 'आरव') {
    console.error(`❌ Transliteration failed for Aarav, expected "आरव" but got "${nameDev}"`);
    totalErrors++;
  } else {
    console.log(`✅ PASSED: Phonetic transliteration "Aarav" ➔ "${nameDev}"`);
  }

  // Final Summary
  console.log('\n========================================');
  if (totalErrors > 0) {
    console.error(`❌ i18n Test Suite FAILED with ${totalErrors} errors.`);
    process.exit(1);
  } else {
    console.log(`🎉 All Hindi & English Localization Tests PASSED successfully!`);
    process.exit(0);
  }
}

runTests();
