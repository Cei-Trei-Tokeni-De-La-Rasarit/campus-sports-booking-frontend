// Cererile către backend pentru notificări (/notificari).
import {request} from './request.js';

// Evenimentul trimis când se schimbă notificările citite, ca bara de sus
// să-și actualizeze numărul de notificări necitite.
export const NOTIFICATIONS_CHANGED = 'notificari-schimbate';

/**
 * Întoarce notificările utilizatorului autentificat, cele mai noi primele.
 * @param {{unreadOnly?: boolean, quiet?: boolean}} [options] `unreadOnly`:
 *     doar cele necitite. `quiet`: un 401 sau 403 nu duce la autentificare
 *     (pentru clopoțel, care cere numărul în fundal).
 * @return {Promise<Array<Object>>}
 */
export async function listNotifications({
  unreadOnly = false,
  quiet = false,
} = {}) {
  return request(unreadOnly ? '/notificari?necitite=true' : '/notificari', {
    skipAuthHandlers: quiet,
  });
}

/**
 * Marchează o notificare ca citită și întoarce notificarea actualizată.
 * @param {number} notificationId
 * @return {Promise<Object>}
 */
export async function markNotificationRead(notificationId) {
  const notification = await request(`/notificari/${notificationId}`, {
    method: 'PATCH',
    body: JSON.stringify({citita: true}),
  });
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
  return notification;
}
