export interface PhoneValidationResult {
  isValid: boolean;
  rawDigits: string;
  cleanedNumber: string;
  formattedE164: string;
  whatsAppNumber: string;
  error?: string;
}

/**
 * Validates and sanitizes a phone number based on country dialing code.
 *
 * For North Macedonia (+389):
 * - Valid mobile prefixes: 70, 71, 72, 73, 75, 76, 77, 78, 79 (or with leading 0: 070...)
 * - Automatically removes leading zero if entered.
 * - Rejects landline prefixes (02, 03x, 04x, etc.).
 * - Requires exact 8 digits after prefix sanitization.
 *
 * For other countries:
 * - Strips whitespace, special chars, and leading zeroes.
 * - Validates length between 6 and 14 digits.
 */
export function sanitizeAndValidatePhone(
  dialCode: string,
  rawInput: string
): PhoneValidationResult {
  // Normalize dial code (e.g. "+389" -> "389")
  const numericDialCode = dialCode.replace(/\D/g, "");

  // Remove non-digit characters from the input
  let cleaned = rawInput.replace(/\D/g, "");

  // If the user pasted the dial code at the start, remove it
  if (numericDialCode && cleaned.startsWith(numericDialCode)) {
    cleaned = cleaned.slice(numericDialCode.length);
  }

  // Remove any leading zeros (e.g., "070..." -> "70...")
  while (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  // Special validation for North Macedonia (+389)
  if (dialCode === "+389" || numericDialCode === "389") {
    if (!cleaned) {
      return {
        isValid: false,
        rawDigits: cleaned,
        cleanedNumber: "",
        formattedE164: "",
        whatsAppNumber: "",
        error: "Phone number is required.",
      };
    }

    // Check if it's a mobile carrier prefix (70, 71, 72, 73, 75, 76, 77, 78, 79)
    const validMobilePrefixRegex = /^7[012356789]/;
    if (!validMobilePrefixRegex.test(cleaned)) {
      return {
        isValid: false,
        rawDigits: cleaned,
        cleanedNumber: cleaned,
        formattedE164: `+389${cleaned}`,
        whatsAppNumber: `389${cleaned}`,
        error:
          "Please enter a valid mobile number (e.g. 70 123 456). Landlines (02, 03, 04) are not supported for WhatsApp alerts.",
      };
    }

    // Must be exactly 8 digits for MK mobile
    if (cleaned.length !== 8) {
      return {
        isValid: false,
        rawDigits: cleaned,
        cleanedNumber: cleaned,
        formattedE164: `+389${cleaned}`,
        whatsAppNumber: `389${cleaned}`,
        error: `Macedonian mobile numbers must be 8 digits (entered ${cleaned.length} digits).`,
      };
    }

    const formattedE164 = `+389${cleaned}`;
    const whatsAppNumber = `389${cleaned}`;

    return {
      isValid: true,
      rawDigits: cleaned,
      cleanedNumber: cleaned,
      formattedE164,
      whatsAppNumber,
    };
  }

  // Generic validation for other supported countries
  if (!cleaned) {
    return {
      isValid: false,
      rawDigits: cleaned,
      cleanedNumber: "",
      formattedE164: "",
      whatsAppNumber: "",
      error: "Phone number is required.",
    };
  }

  if (cleaned.length < 6 || cleaned.length > 14) {
    return {
      isValid: false,
      rawDigits: cleaned,
      cleanedNumber: cleaned,
      formattedE164: `+${numericDialCode}${cleaned}`,
      whatsAppNumber: `${numericDialCode}${cleaned}`,
      error: "Please enter a valid phone number (6-14 digits).",
    };
  }

  const formattedE164 = `+${numericDialCode}${cleaned}`;
  const whatsAppNumber = `${numericDialCode}${cleaned}`;

  return {
    isValid: true,
    rawDigits: cleaned,
    cleanedNumber: cleaned,
    formattedE164,
    whatsAppNumber,
  };
}

/**
 * Builds a direct wa.me link for WhatsApp messaging.
 */
export function buildWhatsAppUrl(whatsAppNumber: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  // Remove any non-digits (like '+' or spaces) from the recipient number
  const cleanNumber = whatsAppNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
