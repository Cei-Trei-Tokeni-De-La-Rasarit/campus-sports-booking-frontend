// Cererile către backend pentru conturi și autentificare.
import {request} from './request.js';

/**
 * Autentifică utilizatorul și întoarce {token, utilizator}.
 * @param {string} email
 * @param {string} password
 * @return {Promise<{token: string, utilizator: Object}>}
 */
export async function logIn(email, password) {
  return request('/auth/autentificare', {
    method: 'POST',
    body: JSON.stringify({email, parola: password}),
  });
}

/**
 * Creează un cont nou (rolul client) și întoarce utilizatorul creat.
 * @param {{nume: string, email: string, parola: string}} account
 * @return {Promise<Object>}
 */
export async function register(account) {
  return request('/auth/inregistrare', {
    method: 'POST',
    body: JSON.stringify(account),
  });
}

/**
 * Cere un link pentru resetarea parolei, trimis pe email. Serverul întoarce
 * același {mesaj} și pentru adresele fără cont, ca să nu se afle ce conturi
 * există.
 * @param {string} email
 * @return {Promise<{mesaj: string}>}
 */
export async function requestPasswordReset(email) {
  return request('/auth/resetare-parola', {
    method: 'POST',
    body: JSON.stringify({email}),
  });
}

/**
 * Schimbă parola cu token-ul din linkul primit pe email. Serverul răspunde
 * 400 dacă token-ul nu există, a expirat sau a fost deja folosit.
 * @param {string} token
 * @param {string} newPassword
 * @return {Promise<{mesaj: string}>}
 */
export async function confirmPasswordReset(token, newPassword) {
  return request('/auth/resetare-parola/confirmare', {
    method: 'POST',
    body: JSON.stringify({token, parola_noua: newPassword}),
  });
}

/**
 * Întoarce utilizatorul căruia îi aparține token-ul salvat. Un token expirat
 * dă eroare 401, pe care o tratează cine apelează funcția.
 * @return {Promise<Object>}
 */
export async function getCurrentUser() {
  return request('/utilizatori/eu', {skipAuthHandlers: true});
}
