export function sanitizeText(text) {
  return String(text).replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function parseDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // Rejects impossible dates like 2026-02-31
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function validateDateRange(checkIn, checkOut) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  if (!start) return { valid: false, message: 'Check-in must be a real date as YYYY-MM-DD.' };
  if (!end) return { valid: false, message: 'Check-out must be a real date as YYYY-MM-DD.' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) return { valid: false, message: 'Check-in cannot be in the past.' };
  if (end <= start) return { valid: false, message: 'Check-out must be after check-in.' };
  const nights = Math.round((end - start) / 86400000);
  if (nights > 30) return { valid: false, message: 'Maximum stay is 30 nights.' };
  return { valid: true, nights };
}

export function validateGuests(value, max) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return { valid: false, message: 'Guests must be a whole number, at least 1.' };
  if (n > max) return { valid: false, message: `This room fits up to ${max} guests.` };
  return { valid: true, value: n };
}

export function validateCardName(name) {
  const n = sanitizeText(name);
  if (n.length < 2) return { valid: false, message: 'Enter the name on the card.' };
  return { valid: true, value: n };
}

// Luhn algorithm: the checksum every real card number satisfies.
export function validateCardNumber(input) {
  const digits = input.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return { valid: false, message: 'Card number must be 13 to 19 digits.' };
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  if (sum % 10 !== 0) return { valid: false, message: 'That card number is not valid.' };
  return { valid: true, last4: digits.slice(-4) };
}

export function validateExpiry(input) {
  const m = /^(\d{2})\/(\d{2})$/.exec(input);
  if (!m) return { valid: false, message: 'Expiry must be MM/YY.' };
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return { valid: false, message: 'Expiry month must be 01 to 12.' };
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  if (endOfMonth < new Date()) return { valid: false, message: 'This card has expired.' };
  return { valid: true };
}

export function validateCvv(input) {
  if (!/^\d{3,4}$/.test(input)) return { valid: false, message: 'Security code must be 3 or 4 digits.' };
  return { valid: true };
}