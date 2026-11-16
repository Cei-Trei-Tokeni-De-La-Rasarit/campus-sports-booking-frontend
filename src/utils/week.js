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
