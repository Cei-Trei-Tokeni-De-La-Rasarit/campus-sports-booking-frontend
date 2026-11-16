// Cererile către backend pentru rezervări (/rezervari).
import {request} from './request.js';

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
