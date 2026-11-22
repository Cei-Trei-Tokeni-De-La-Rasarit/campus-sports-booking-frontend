// Afișarea datei unei notificări față de momentul de acum, ca în Figma:
// „Acum 6 min”, „Acum 1 oră”, „Ieri”, „Acum 3 zile”.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Textul relativ pentru o dată din trecut.
 * @param {Date} date
 * @param {Date} now
 * @return {string}
 */
export function relativeTime(date, now) {
  const elapsed = now - date;
  if (elapsed < MINUTE) {
    return 'Acum';
  }
  if (elapsed < HOUR) {
    return `Acum ${Math.floor(elapsed / MINUTE)} min`;
  }
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return hours === 1 ? 'Acum 1 oră' : `Acum ${hours} ore`;
  }
  const days = Math.floor(elapsed / DAY);
  if (days === 1) {
    return 'Ieri';
  }
  if (days < 30) {
    return `Acum ${days} zile`;
  }
  return date.toLocaleDateString('ro-RO', {day: 'numeric', month: 'long'});
}
