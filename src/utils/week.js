// Calculele pentru o săptămână din calendar. Datele sunt în ora locală a
// browserului, iar spre API se trimit ca text „AAAA-LL-ZZ”.

const DAY_MONTH = new Intl.DateTimeFormat('ro-RO', {
  day: 'numeric',
  month: 'long',
});
const MONTH = new Intl.DateTimeFormat('ro-RO', {month: 'long'});
const WEEKDAY = new Intl.DateTimeFormat('ro-RO', {weekday: 'long'});

/**
 * Data în formatul cerut de API, de exemplu „2026-11-16”.
 * @param {Date} date
 * @return {string}
 */
export function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Data de peste `days` zile (sau de acum `days` zile, dacă e negativ).
 * @param {Date} date
 * @param {number} days
 * @return {Date}
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Lunea săptămânii în care se află data, la ora 00:00.
 * @param {Date} date
 * @return {Date}
 */
export function startOfWeek(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay(): duminică = 0, luni = 1, ...; săptămâna începe lunea.
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  return addDays(monday, -daysSinceMonday);
}

/**
 * Numele zilei, cu literă mare: „Luni”, „Marți”, ...
 * @param {Date} date
 * @return {string}
 */
export function weekdayName(date) {
  const name = WEEKDAY.format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Ziua și luna: „26 octombrie”.
 * @param {Date} date
 * @return {string}
 */
export function formatDayMonth(date) {
  return DAY_MONTH.format(date);
}

/**
 * Ora fără zero în față, ca în prototip: „09:00” devine „9:00”.
 * @param {string} time
 * @return {string}
 */
export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  return `${Number(hours)}:${minutes}`;
}

/**
 * Data unui slot („AAAA-LL-ZZ”) ca obiect Date, la ora 00:00 locală.
 * @param {string} isoDate
 * @return {Date}
 */
export function fromIsoDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Data și ora la care începe slotul, după ceasul browserului.
 * @param {{data: string, ora_start: string}} slot
 * @return {Date}
 */
function slotStart(slot) {
  const [hours, minutes] = slot.ora_start.split(':').map(Number);
  const start = fromIsoDate(slot.data);
  start.setHours(hours, minutes);
  return start;
}

/**
 * Spune dacă slotul a început deja, după ceasul browserului.
 * @param {Object} slot
 * @param {Date} now
 * @return {boolean}
 */
export function hasStarted(slot, now) {
  return slotStart(slot) <= now;
}

// Cu câte ore înainte de începutul intervalului se mai poate anula o
// rezervare. Serverul verifică aceeași regulă.
export const CANCELLATION_NOTICE_HOURS = 24;

/**
 * Spune dacă rezervarea slotului se mai poate anula: au rămas cel puțin
 * 24 de ore până la începutul lui.
 * @param {{data: string, ora_start: string}} slot
 * @param {Date} now
 * @return {boolean}
 */
export function canBeCancelled(slot, now) {
  return slotStart(slot) - now >= CANCELLATION_NOTICE_HOURS * 60 * 60 * 1000;
}

/**
 * Perioada dintre două zile: „26 – 30 octombrie” sau, dacă lunile diferă,
 * „30 noiembrie – 4 decembrie”.
 * @param {Date} first
 * @param {Date} last
 * @return {string}
 */
export function formatRange(first, last) {
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} ${MONTH.format(last)}`;
  }
  return `${formatDayMonth(first)} – ${formatDayMonth(last)}`;
}
