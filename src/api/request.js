// Cererile către backend: adresa din VITE_API_URL, token-ul de autentificare
// și transformarea erorilor primite de la API.
const API_URL = import.meta.env.VITE_API_URL;

// Cheia sub care păstrăm token-ul în browser (localStorage).
const TOKEN_KEY = 'campus-sports-token';

// Funcțiile chemate când serverul spune că token-ul nu mai e valid (401)
// sau că rolul utilizatorului nu permite acțiunea (403).
let handleUnauthorized = null;
let handleForbidden = null;

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
 * Setează ce se întâmplă când serverul răspunde 403 la o cerere cu token
 * (de exemplu, rolul utilizatorului a fost schimbat între timp).
 * @param {?function(): void} handler
 */
export function setForbiddenHandler(handler) {
  handleForbidden = handler;
}

/**
 * Trimite o cerere către backend și întoarce răspunsul JSON. Dacă există un
 * token, îl trimite în header-ul Authorization. Erorile primite de la API
 * (formatul {"mesaj": "..."}) sunt aruncate ca ApiError, cu mesajul lor.
 * @param {string} path Adresa din API, de exemplu „/facilitati”.
 * @param {RequestInit & {skipAuthHandlers: (boolean|undefined)}} options
 *     Cu skipAuthHandlers, un 401 sau 403 nu mai cheamă funcțiile de mai sus
 *     (de exemplu, la verificarea token-ului salvat, la pornire).
 * @return {Promise<?Object>}
 */
export async function request(path, options = {}) {
  const {skipAuthHandlers = false, ...fetchOptions} = options;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {...fetchOptions, headers});
  } catch {
    throw new ApiError(
      'Serverul nu răspunde. Verifică dacă backend-ul este pornit.',
      0,
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (token && !skipAuthHandlers) {
      // 401: token-ul a expirat sau e greșit. 403: rolul nu mai permite.
      if (response.status === 401 && handleUnauthorized) {
        handleUnauthorized();
      } else if (response.status === 403 && handleForbidden) {
        handleForbidden();
      }
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
