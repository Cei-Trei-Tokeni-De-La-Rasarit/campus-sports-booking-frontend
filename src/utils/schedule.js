// Programul pe zile al unei facilități: trecerea între formatul din API și
// cel din formular, validările (aceleași reguli ca în backend) și textul
// afișat în catalog, în calendar și pe cardurile de administrare.

/** Numele zilelor, în ordinea din API: indexul 0 este ziua 1 (luni). */
export const WEEKDAY_NAMES = [
  'Luni',
  'Marți',
  'Miercuri',
  'Joi',
  'Vineri',
  'Sâmbătă',
  'Duminică',
];

/** Duratele permise pentru un interval din calendar, în minute. */
export const SLOT_DURATIONS = [60, 90, 120];

// Durata implicită din backend, folosită pentru o sală fără program.
const DEFAULT_SLOT_MINUTES = 120;

// Orele propuse pentru o zi închisă, ca la bifarea ei să fie deja completate.
const DEFAULT_OPENS_AT = '08:00';
const DEFAULT_CLOSES_AT = '20:00';

/**
 * Minutele trecute de la miezul nopții: „08:30” înseamnă 510.
 * @param {string} time Ora, „HH:MM”.
 * @return {number}
 */
function minutesOfDay(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Programul din API, în forma folosită de formular: câte un rând pentru
 * fiecare zi, de luni până duminică, inclusiv pentru zilele închise.
 * @param {?Object} schedule Programul din API sau null pentru o sală nouă.
 * @return {{slotMinutes: number, days: Array<{weekday: number,
 *     isOpen: boolean, opensAt: string, closesAt: string}>}}
 */
export function toFormSchedule(schedule) {
  return {
    slotMinutes: schedule?.durata_slot ?? DEFAULT_SLOT_MINUTES,
    days: WEEKDAY_NAMES.map((_, index) => {
      const weekday = index + 1;
      const day = schedule?.zile.find((item) => item.zi === weekday);
      return {
        weekday,
        isOpen: Boolean(day),
        opensAt: day?.deschidere ?? DEFAULT_OPENS_AT,
        closesAt: day?.inchidere ?? DEFAULT_CLOSES_AT,
      };
    }),
  };
}

/**
 * Programul din formular, în forma cerută de `PUT /facilitati/{id}/program`.
 * Zilele închise nu se trimit.
 * @param {{slotMinutes: number, days: Array<Object>}} formSchedule
 * @return {{durata_slot: number,
 *     zile: Array<{zi: number, deschidere: string, inchidere: string}>}}
 */
export function toApiSchedule(formSchedule) {
  return {
    durata_slot: formSchedule.slotMinutes,
    zile: formSchedule.days
      .filter((day) => day.isOpen)
      .map((day) => ({
        zi: day.weekday,
        deschidere: day.opensAt,
        inchidere: day.closesAt,
      })),
  };
}

/**
 * Mesajul de eroare pentru o zi din program sau '' dacă e validă. O zi
 * închisă e mereu validă.
 * @param {{isOpen: boolean, opensAt: string, closesAt: string}} day
 * @param {number} slotMinutes Durata unui interval.
 * @return {string}
 */
export function validateScheduleDay(day, slotMinutes) {
  if (!day.isOpen) {
    return '';
  }
  if (!day.opensAt || !day.closesAt) {
    return 'Completează ora de deschidere și ora de închidere.';
  }
  const length = minutesOfDay(day.closesAt) - minutesOfDay(day.opensAt);
  if (length <= 0) {
    return 'Ora de închidere trebuie să fie după ora de deschidere.';
  }
  if (length % slotMinutes !== 0) {
    return (
      `Intervalul ${day.opensAt} – ${day.closesAt} nu se împarte exact ` +
      `în intervale de ${slotMinutes} de minute.`
    );
  }
  return '';
}

/**
 * Programul din API, ca rânduri de text în care zilele consecutive cu
 * aceleași ore sunt grupate: [„Luni – Vineri 08:00 – 20:00”,
 * „Sâmbătă 10:00 – 14:00”]. Zilele închise nu apar.
 * @param {Object} schedule
 * @return {Array<string>}
 */
export function formatSchedule(schedule) {
  const groups = [];
  const days = [...schedule.zile].sort((first, second) => first.zi - second.zi);
  for (const day of days) {
    const last = groups[groups.length - 1];
    if (
      last &&
      last.lastWeekday === day.zi - 1 &&
      last.opensAt === day.deschidere &&
      last.closesAt === day.inchidere
    ) {
      last.lastWeekday = day.zi;
    } else {
      groups.push({
        firstWeekday: day.zi,
        lastWeekday: day.zi,
        opensAt: day.deschidere,
        closesAt: day.inchidere,
      });
    }
  }
  return groups.map((group) => {
    const first = WEEKDAY_NAMES[group.firstWeekday - 1];
    const dayRange =
      group.firstWeekday === group.lastWeekday
        ? first
        : `${first} – ${WEEKDAY_NAMES[group.lastWeekday - 1]}`;
    return `${dayRange} ${group.opensAt} – ${group.closesAt}`;
  });
}

/**
 * Programul din API pe un singur rând, pentru catalog și calendar.
 * @param {Object} schedule
 * @return {string}
 */
export function describeSchedule(schedule) {
  return formatSchedule(schedule).join(', ') || 'nestabilit';
}
