// Cererile către backend pentru rezervări (/rezervari).
import {request} from './request.js';

/**
 * Întoarce rezervările utilizatorului autentificat, ordonate după data și
 * ora slotului. Fiecare are starea `confirmata`, `anulata` sau `finalizata`.
 * @return {Promise<Array<Object>>}
 */
export async function listMyBookings() {
  return request('/rezervari');
}

/**
 * Rezervă un slot pentru utilizatorul autentificat și întoarce rezervarea.
 * Serverul răspunde 409 dacă slotul nu mai e liber sau rezervarea încalcă o
 * regulă (suprapunere, maximum 3 rezervări active).
 * @param {number} slotId
 * @param {boolean} rulesAccepted Dacă regulamentul sălii a fost acceptat.
 * @return {Promise<Object>}
 */
export async function createBooking(slotId, rulesAccepted) {
  return request('/rezervari', {
    method: 'POST',
    body: JSON.stringify({
      slot_id: slotId,
      regulament_acceptat: rulesAccepted,
    }),
  });
}

/**
 * Anulează o rezervare a utilizatorului autentificat. Serverul răspunde 400
 * dacă au rămas mai puțin de 24 de ore până la începutul intervalului și 409
 * dacă rezervarea e deja anulată.
 * @param {number} bookingId
 * @return {Promise<null>}
 */
export async function cancelBooking(bookingId) {
  return request(`/rezervari/${bookingId}`, {method: 'DELETE'});
}

/**
 * Mută o rezervare a utilizatorului autentificat pe alt slot din aceeași sală
 * și întoarce rezervarea mutată. Serverul răspunde 400 dacă au rămas mai
 * puțin de 24 de ore sau slotul e din altă sală și 409 dacă slotul nu mai e
 * liber sau rezervarea s-ar suprapune cu alta.
 * @param {number} bookingId
 * @param {number} slotId Slotul nou.
 * @return {Promise<Object>}
 */
export async function rescheduleBooking(bookingId, slotId) {
  return request(`/rezervari/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({slot_id: slotId}),
  });
}
