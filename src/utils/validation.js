// Validările formularelor de cont, aceleași reguli ca în backend.

// Doar adresele instituționale USV pot avea cont.
const ALLOWED_EMAIL_DOMAINS = ['student.usv.ro', 'usv.ro'];
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt folosește cel mult 72 de bytes; o literă cu diacritice are 2 bytes.
const MAX_PASSWORD_BYTES = 72;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

/**
 * Mesajul de eroare pentru email sau '' dacă e valid.
 * @param {string} email
 * @return {string}
 */
export function validateEmail(email) {
  const value = email.trim().toLowerCase();
  if (!value) {
    return 'Completează adresa de email.';
  }
  if (!EMAIL_FORMAT.test(value)) {
    return 'Adresa de email nu este validă.';
  }
  if (!ALLOWED_EMAIL_DOMAINS.includes(value.split('@')[1])) {
    return 'Folosește adresa instituțională (@student.usv.ro sau @usv.ro).';
  }
  return '';
}

/**
 * Mesajul de eroare pentru parolă sau '' dacă e validă.
 * @param {string} password
 * @return {string}
 */
export function validatePassword(password) {
  if (!password) {
    return 'Completează parola.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Parola trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return 'Parola este prea lungă.';
  }
  return '';
}

/**
 * Mesajul de eroare pentru nume sau '' dacă e valid.
 * @param {string} name
 * @return {string}
 */
export function validateName(name) {
  const value = name.trim();
  if (!value) {
    return 'Completează numele.';
  }
  if (value.length < MIN_NAME_LENGTH) {
    return `Numele trebuie să aibă cel puțin ${MIN_NAME_LENGTH} caractere.`;
  }
  if (value.length > MAX_NAME_LENGTH) {
    return `Numele poate avea cel mult ${MAX_NAME_LENGTH} de caractere.`;
  }
  return '';
}
