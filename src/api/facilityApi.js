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
 * Înlocuiește regulamentul unei facilități (îl creează dacă nu are) și îl
 * întoarce: {facilitate_id, text}. Serverul răspunde 403 dacă managerul nu
 * are sala alocată.
 * @param {(number|string)} id
 * @param {string} text
 * @return {Promise<Object>}
 */
export async function updateRegulation(id, text) {
  return request(`${FACILITIES_PATH}/${encodeURIComponent(id)}/regulament`, {
    method: 'PUT',
    body: JSON.stringify({text}),
  });
}

/**
 * Întoarce programul pe zile al unei facilități:
 * {durata_slot, zile: [{zi, deschidere, inchidere}]}, cu zilele de la luni
 * (1) la duminică (7). O zi care lipsește înseamnă că sala e închisă atunci.
 * @param {(number|string)} id
 * @return {Promise<Object>}
 */
export async function getSchedule(id) {
  return request(`${FACILITIES_PATH}/${encodeURIComponent(id)}/program`);
}

/**
 * Întoarce programele mai multor facilități, ca obiect {id: program}. O
 * facilitate al cărei program nu a putut fi citit lipsește din rezultat, ca
 * o singură eroare să nu ascundă programul celorlalte.
 * @param {Array<number>} ids
 * @return {Promise<Object<number, Object>>}
 */
export async function getSchedules(ids) {
  const results = await Promise.allSettled(ids.map((id) => getSchedule(id)));
  const schedules = {};
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      schedules[ids[index]] = result.value;
    }
  });
  return schedules;
}

/**
 * Înlocuiește programul unei facilități (manager sau administrator) și îl
 * întoarce, împreună cu `rezervari_in_afara_programului`: câte rezervări
 * viitoare au rămas în afara noului program.
 * @param {number} id
 * @param {{durata_slot: number,
 *     zile: Array<{zi: number, deschidere: string, inchidere: string}>}}
 *     schedule
 * @return {Promise<Object>}
 */
export async function updateSchedule(id, schedule) {
  return request(`${FACILITIES_PATH}/${id}/program`, {
    method: 'PUT',
    body: JSON.stringify(schedule),
  });
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
