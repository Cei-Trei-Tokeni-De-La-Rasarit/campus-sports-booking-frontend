// Cererile către backend pentru facilități (/facilitati).
import {request} from './request.js';

const FACILITIES_PATH = '/facilitati';

/**
 * Întoarce toate facilitățile, inclusiv cele în mentenanță sau inactive.
 * Doar pentru manager și administrator (pagina de administrare).
 * @return {Promise<Array<Object>>}
 */
export async function listAllFacilities() {
  return request(`${FACILITIES_PATH}/toate`);
}

/**
 * Întoarce catalogul: facilitățile active care respectă filtrele date.
 * Filtrele goale (text gol, `false`, lipsă) nu se trimit la server.
 * @param {{cautare: (string|undefined), sport: (string|undefined),
 *     capacitate_min: (number|undefined),
 *     disponibile_azi: (boolean|undefined)}} filters
 * @return {Promise<Array<Object>>}
 */
export async function listCatalog(filters = {}) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '' && value !== false) {
      params.set(name, String(value));
    }
  }
  const query = params.toString();
  return request(query ? `${FACILITIES_PATH}?${query}` : FACILITIES_PATH);
}

/**
 * Întoarce o facilitate după id. Serverul răspunde 404 dacă nu există.
 * @param {(number|string)} id
 * @return {Promise<Object>}
 */
export async function getFacility(id) {
  return request(`${FACILITIES_PATH}/${encodeURIComponent(id)}`);
}

/**
 * Întoarce sloturile unei facilități dintre două date (inclusiv capetele),
 * fiecare cu starea `liber`, `rezervat` sau `blocat`.
 * @param {(number|string)} id
 * @param {string} from Prima zi, „AAAA-LL-ZZ”.
 * @param {string} to Ultima zi, „AAAA-LL-ZZ”.
 * @return {Promise<Array<Object>>}
 */
export async function listSlots(id, from, to) {
  const params = new URLSearchParams({de_la: from, pana_la: to});
  return request(
    `${FACILITIES_PATH}/${encodeURIComponent(id)}/sloturi?${params}`,
  );
}

/**
 * Întoarce regulamentul unei facilități: {facilitate_id, text}. Serverul
 * răspunde 404 dacă facilitatea nu există sau nu are regulament.
 * @param {(number|string)} id
 * @return {Promise<Object>}
 */
export async function getRegulation(id) {
  return request(`${FACILITIES_PATH}/${encodeURIComponent(id)}/regulament`);
}

/**
 * Adaugă o facilitate nouă și o întoarce, cu id-ul primit de la server.
 * @param {Object} facility
 * @return {Promise<Object>}
 */
export async function createFacility(facility) {
  return request(FACILITIES_PATH, {
    method: 'POST',
    body: JSON.stringify(facility),
  });
}

/**
 * Salvează modificările unei facilități existente.
 * @param {number} id
 * @param {Object} facility
 * @return {Promise<Object>}
 */
export async function updateFacility(id, facility) {
  return request(`${FACILITIES_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(facility),
  });
}

/**
 * Șterge o facilitate. Serverul refuză (409) dacă are intervale în calendar.
 * @param {number} id
 * @return {Promise<null>}
 */
export async function deleteFacility(id) {
  return request(`${FACILITIES_PATH}/${id}`, {method: 'DELETE'});
}
