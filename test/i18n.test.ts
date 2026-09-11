import { locales } from '../src/i18n/locales/index.ts';
import { SUPPORTED_LANGUAGES } from '../src/i18n/languages.ts';
import type { TranslationDictionary } from '../src/i18n/types.ts';

function runTests() {
  console.log('🧪 Running MILAN i18n & Multilingual Verification Tests...\n');

  const enKeys = Object.keys(locales.en) as (keyof TranslationDictionary)[];
  console.log(`[Base Locale] en.ts contains ${enKeys.length} translation keys.`);

  let totalErrors = 0;

  // 1. Verify all supported languages have a locale entry
  console.log('\n--- 1. Testing Supported Languages Count & Registered Locales ---');
  if (SUPPORTED_LANGUAGES.length !== 23) {
    console.error(`❌ Expected 23 supported languages (22 Eighth Schedule + English), but found ${SUPPORTED_LANGUAGES.length}`);
    totalErrors++;
  } else {
    console.log(`✅ Correctly registered all 23 supported languages.`);
  }

  for (const lang of SUPPORTED_LANGUAGES) {
    if (!locales[lang.code]) {
      console.error(`❌ Missing locale dictionary in locales/index.ts for language code: "${lang.code}"`);
      totalErrors++;
    }
  }

  // 2. Verify Key Parity & Non-empty Values for all 23 languages
  console.log('\n--- 2. Testing 100% Key Parity Across All 23 Locales ---');
  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = locales[lang.code];
    if (!dict) continue;

    const dictKeys = Object.keys(dict);
    const missingKeys = enKeys.filter((k) => !(k in dict));
    const extraKeys = dictKeys.filter((k) => !enKeys.includes(k as keyof TranslationDictionary));

    if (missingKeys.length > 0) {
      console.error(`❌ Language "${lang.code}" (${lang.englishName}) is missing ${missingKeys.length} keys: ${missingKeys.slice(0, 5).join(', ')}...`);
      totalErrors++;
    }

    if (extraKeys.length > 0) {
      console.error(`❌ Language "${lang.code}" (${lang.englishName}) has ${extraKeys.length} unexpected extra keys: ${extraKeys.slice(0, 5).join(', ')}...`);
      totalErrors++;
    }

    // Check for empty or undefined values
    for (const key of enKeys) {
      const val = dict[key];
      if (typeof val !== 'string' || val.trim().length === 0) {
        console.error(`❌ Language "${lang.code}" has invalid/empty string for key "${key}"`);
        totalErrors++;
      }
    }
  }

  if (totalErrors === 0) {
    console.log(`✅ All 23 languages have 100% key parity (${enKeys.length}/${enKeys.length} keys each) with zero missing, zero extra, and non-empty strings.`);
  }

  // 3. Verify RTL settings
  console.log('\n--- 3. Testing RTL Configurations ---');
  const expectedRTLLangs = ['ur', 'ks', 'sd'];
  for (const lang of SUPPORTED_LANGUAGES) {
    if (expectedRTLLangs.includes(lang.code)) {
      if (!lang.isRTL) {
        console.error(`❌ Language "${lang.code}" (${lang.englishName}) expected isRTL === true, but was ${lang.isRTL}`);
        totalErrors++;
      } else {
        console.log(`✅ ${lang.englishName} (${lang.code}) correctly flagged as RTL.`);
      }
    } else {
      if (lang.isRTL) {
        console.error(`❌ Language "${lang.code}" (${lang.englishName}) expected isRTL === false/undefined, but was true`);
        totalErrors++;
      }
    }
  }

  // Final Summary
  console.log('\n========================================');
  if (totalErrors > 0) {
    console.error(`❌ i18n Test Suite FAILED with ${totalErrors} errors.`);
    process.exit(1);
  } else {
    console.log(`🎉 All i18n & Multilingual Tests PASSED successfully!`);
    process.exit(0);
  }
}

runTests();
