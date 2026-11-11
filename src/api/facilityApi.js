// Cererile către backend pentru facilități (/facilitati).
const API_URL = import.meta.env.VITE_API_URL;
const FACILITIES_URL = `${API_URL}/facilitati`;

/**
 * Trimite o cerere către backend și întoarce răspunsul JSON. Erorile primite
 * de la API (formatul {"mesaj": "..."}) sunt aruncate ca Error, cu mesajul lor.
 * @param {string} url
 * @param {RequestInit} options
 * @return {Promise<?Object>}
 */
async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: {'Content-Type': 'application/json'},
      ...options,
    });
  } catch {
    throw new Error(
      'Serverul nu răspunde. Verifică dacă backend-ul este pornit.',
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.mesaj ?? `Eroare ${response.status} de la server.`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

/**
 * Întoarce lista tuturor facilităților.
 * @return {Promise<Array<Object>>}
 */
export async function listFacilities() {
  return request(FACILITIES_URL);
}

/**
 * Adaugă o facilitate nouă și o întoarce, cu id-ul primit de la server.
 * @param {Object} facility
 * @return {Promise<Object>}
 */
export async function createFacility(facility) {
  return request(FACILITIES_URL, {
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
  return request(`${FACILITIES_URL}/${id}`, {
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
  return request(`${FACILITIES_URL}/${id}`, {method: 'DELETE'});
}
