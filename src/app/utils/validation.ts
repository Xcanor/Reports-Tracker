/**
 * Validation Utilities for Authentication and User Management
 * Provides validation for email, phone numbers, and other user data
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email is valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validates phone number format
 * Accepts formats:
 * - +63-9XX-XXX-XXXX (Philippines with country code)
 * - 09XX-XXX-XXXX (Philippines without country code)
 * - +63XXXXXXXXXX (Philippines with country code, no hyphens)
 * - 09XXXXXXXXXX (Philippines without country code, no hyphens)
 * @param phone - Phone number to validate
 * @returns true if phone is valid format
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces and hyphens for validation
  const cleaned = phone.replace(/[\s-]/g, '');

  // Philippines phone regex
  // Accepts +639XX-XXXXXXX or 09XX-XXXXXXX format (with or without hyphens)
  const phoneRegex = /^(\+639|09)\d{9}$/;
  return phoneRegex.test(cleaned) && cleaned.length >= 12;
}

/**
 * Normalizes phone number to standard format
 * Converts to +63 country code format
 * @param phone - Raw phone number
 * @returns Normalized phone number (e.g., "+639171234567")
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If already has +63, return as is
  if (cleaned.startsWith('+63')) {
    return cleaned;
  }

  // If starts with 09, replace with +639
  if (cleaned.startsWith('09')) {
    return '+63' + cleaned.substring(1);
  }

  // If just digits and matches Philippines number, add +63
  if (cleaned.match(/^9\d{9}$/)) {
    return '+63' + cleaned;
  }

  // Return as is if doesn't match any pattern
  return cleaned;
}

/**
 * Validates password strength
 * Requirements:
 * - At least 6 characters
 * - Mix of numbers and letters recommended (optional for legacy support)
 * @param password - Password to validate
 * @returns true if password meets minimum requirements
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validates required fields for user signup
 * @param data - Object with required fields
 * @returns Object with validation errors, or empty if valid
 */
export function validateSignupData(data: {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.mobile?.trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!isValidPhone(data.mobile)) {
    errors.mobile = 'Invalid phone format (e.g., 09171234567 or +639171234567)';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

/**
 * Detects if input is email or phone number
 * @param input - User input string
 * @returns 'email' | 'phone' | 'unknown'
 */
export function detectInputType(input: string): 'email' | 'phone' | 'unknown' {
  const trimmed = input.trim();

  if (isValidEmail(trimmed)) {
    return 'email';
  }

  if (isValidPhone(trimmed)) {
    return 'phone';
  }

  return 'unknown';
}
