// ============================================================
// MILAN — Indian Phone Validation & Normalization Utility
// Handles 10-digit Indian mobile numbers (+91 prefix optional)
// Canonical storage format: +91XXXXXXXXXX
// ============================================================

export interface PhoneValidationResult {
  isValid: boolean;
  canonical: string; // Stored format: +919876543210
  display: string;   // Display format: +91 98765 43210
  error?: string;
}

/**
 * Validates and normalizes an Indian mobile phone number.
 * Supports:
 *  - 9876543210
 *  - +919876543210
 *  - +91 98765 43210
 *  - 09876543210
 *  - 91-98765-43210
 *
 * Rejects invalid prefixes, non-numeric garbage, or wrong digit counts.
 */
export function validateIndianPhoneNumber(input: string | null | undefined): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      canonical: '',
      display: '',
      error: 'Family contact number is required.',
    };
  }

  // Strip spaces, dashes, dots, parentheses
  const cleaned = input.trim().replace(/[\s\-\.\(\)]/g, '');

  let digits = '';
  if (cleaned.startsWith('+91')) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    digits = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    digits = cleaned.slice(1);
  } else {
    digits = cleaned;
  }

  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      isValid: false,
      canonical: '',
      display: '',
      error: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 98765 43210).',
    };
  }

  const canonical = `+91${digits}`;
  const display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

  return {
    isValid: true,
    canonical,
    display,
  };
}

/**
 * Format any stored phone number for clean UI display.
 */
export function formatIndianPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '—';
  const validated = validateIndianPhoneNumber(phone);
  return validated.isValid ? validated.display : phone;
}
