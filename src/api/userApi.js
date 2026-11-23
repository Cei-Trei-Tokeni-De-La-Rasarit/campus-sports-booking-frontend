// Cererile către backend pentru administrarea utilizatorilor (/utilizatori).
import {request} from './request.js';

const USERS_PATH = '/utilizatori';

/**
 * Întoarce utilizatorii, ordonați după nume (doar pentru administrator).
 * Managerii au și `facilitati_alocate`, id-urile sălilor lor. Filtrele goale
 * nu se trimit la server.
 * @param {{rol: (string|undefined), cautare: (string|undefined)}} filters
 * @return {Promise<Array<Object>>}
 */
export async function listUsers(filters = {}) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(filters)) {
    if (value) {
      params.set(name, value);
    }
  }
  const query = params.toString();
  return request(query ? `${USERS_PATH}?${query}` : USERS_PATH);
}

/**
 * Schimbă rolul unui utilizator și îl întoarce. Pentru un manager,
 * `facilitati_alocate` înlocuiește sălile lui de acum; celelalte roluri rămân
 * fără săli. Serverul răspunde 409 dacă administratorul își schimbă propriul
 * rol și 400 dacă o sală nu există.
 * @param {number} id
 * @param {string} role `client`, `manager` sau `administrator`.
 * @param {Array<number>} facilityIds Sălile managerului.
 * @return {Promise<Object>}
 */
export async function changeUserRole(id, role, facilityIds) {
  const data =
    role === 'manager'
      ? {rol: role, facilitati_alocate: facilityIds}
      : {rol: role};
  return request(`${USERS_PATH}/${encodeURIComponent(id)}/rol`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
