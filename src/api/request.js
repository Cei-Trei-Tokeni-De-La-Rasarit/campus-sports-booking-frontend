// Cererile către backend: adresa din VITE_API_URL, token-ul de autentificare
// și transformarea erorilor primite de la API.
const API_URL = import.meta.env.VITE_API_URL;

// Cheia sub care păstrăm token-ul în browser (localStorage).
const TOKEN_KEY = 'campus-sports-token';

// Funcția chemată când serverul spune că token-ul nu mai e valid (401).
let handleUnauthorized = null;

/** O eroare primită de la server, împreună cu codul HTTP (0 = fără răspuns). */
export class ApiError extends Error {
  /**
   * Creează eroarea cu mesajul și codul primite de la server.
   * @param {string} message Mesajul afișat utilizatorului.
   * @param {number} status Codul HTTP al răspunsului.
   */
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Token-ul salvat sau null. Dacă browserul blochează localStorage, ne
 * comportăm ca și cum utilizatorul nu ar fi autentificat.
 * @return {?string}
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Salvează token-ul primit la autentificare.
 * @param {string} token
 */
export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Fără localStorage, utilizatorul rămâne autentificat doar până la
    // reîncărcarea paginii.
  }
}

/** Șterge token-ul (ieșire din cont sau token expirat). */
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nu e nimic de șters.
  }
}

/**
 * Setează ce se întâmplă când serverul răspunde 401 la o cerere cu token.
 * @param {?function(): void} handler
 */
export function setUnauthorizedHandler(handler) {
  handleUnauthorized = handler;
}

/**
 * Trimite o cerere către backend și întoarce răspunsul JSON. Dacă există un
 * token, îl trimite în header-ul Authorization. Erorile primite de la API
 * (formatul {"mesaj": "..."}) sunt aruncate ca ApiError, cu mesajul lor.
 * @param {string} path Adresa din API, de exemplu „/facilitati”.
 * @param {RequestInit} options
 * @return {Promise<?Object>}
 */
export async function request(path, options = {}) {
  const token = getToken();
  const headers = {'Content-Type': 'application/json', ...options.headers};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {...options, headers});
  } catch {
    throw new ApiError(
      'Serverul nu răspunde. Verifică dacă backend-ul este pornit.',
      0,
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    // Un 401 la o cerere cu token înseamnă că token-ul a expirat sau e greșit.
    if (response.status === 401 && token && handleUnauthorized) {
      handleUnauthorized();
    }
    throw new ApiError(
      data?.mesaj ?? `Eroare ${response.status} de la server.`,
      response.status,
    );
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}
