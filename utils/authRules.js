// Validation rules for login / register / reset password.

// Clean what the user typed before we use it.
export function cleanEmail(value) {
  return value.trim().toLowerCase();
}

export function cleanName(value) {
  return value
    .replace(/[<>]/g, '')   // strip characters used in HTML/script injection
    .replace(/\s+/g, ' ')   // collapse repeated spaces
    .trim();
}

// something@something.something (no spaces, one @, a dot in the domain)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function getEmailError(email) {
  const value = cleanEmail(email);
  if (!value) return 'Please enter your email address.';
  if (!EMAIL_REGEX.test(value)) return 'Enter a valid email, like name@example.com.';
  return null;
}

// Password rule: 8+ characters, 1 capital letter, 1 symbol.
export function getPasswordRules(password) {
  return [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One capital letter (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'One symbol (! @ # $ % ...)', passed: /[^A-Za-z0-9\s]/.test(password) },
  ];
}

export function getPasswordError(password) {
  if (!password) return 'Please enter a password.';
  const failed = getPasswordRules(password).filter((rule) => !rule.passed);
  if (failed.length > 0) {
    return 'Password needs: ' + failed.map((r) => r.label.toLowerCase()).join(', ') + '.';
  }
  return null;
}

export function getNameError(name) {
  const value = cleanName(name);
  if (value.length < 2) return 'Please enter your full name.';
  if (value.length > 50) return 'Name is too long (max 50 characters).';
  if (/[0-9{}\[\]\\\/$%^*=+|~`@#!?;:"_]/.test(value)) {
    return 'Name contains characters that are not allowed.';
  }
  return null;
}

// Turn Firebase error codes into messages a normal person understands.
export function friendlyAuthError(error) {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/weak-password':
      return 'That password is too weak. Please choose a stronger one.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}