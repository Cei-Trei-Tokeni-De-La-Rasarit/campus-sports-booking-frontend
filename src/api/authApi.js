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
 * Întoarce utilizatorul căruia îi aparține token-ul salvat. Un token expirat
 * dă eroare 401, pe care o tratează cine apelează funcția.
 * @return {Promise<Object>}
 */
export async function getCurrentUser() {
  return request('/utilizatori/eu', {skipAuthHandlers: true});
}
