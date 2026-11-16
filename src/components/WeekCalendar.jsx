import {formatDayMonth, toIsoDate, weekdayName} from '../utils/week.js';

/**
 * Ora fără zero în față, ca în prototip: „09:00” devine „9:00”.
 * @param {string} time
 * @return {string}
 */
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  return `${Number(hours)}:${minutes}`;
}

/**
 * Spune dacă slotul a început deja, după ceasul browserului.
 * @param {Object} slot
 * @param {Date} now
 * @return {boolean}
 */
function hasStarted(slot, now) {
  const [year, month, day] = slot.data.split('-').map(Number);
  const [hours, minutes] = slot.ora_start.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes) <= now;
}

/**
 * Celula unui slot: culoarea și textul după stare.
 * @param {Object} props
 * @param {?Object} props.slot Slotul sau null dacă nu există interval aici.
 * @param {Date} props.now
 */
function SlotCell({slot, now}) {
  if (!slot) {
    return <td />;
  }
  if (slot.stare === 'rezervat') {
    return <td className="calendar-cell-busy">Ocupat</td>;
  }
  if (slot.stare === 'blocat') {
    return (
      <td className="calendar-cell-blocked">
        Blocat
        <span className="calendar-cell-note">(mentenanță)</span>
      </td>
    );
  }
  // Un slot liber care a început deja nu se mai poate rezerva.
  if (hasStarted(slot, now)) {
    return <td className="calendar-cell-past">Încheiat</td>;
  }
  return <td className="calendar-cell-free">Liber</td>;
}

/**
 * Tabelul unei săptămâni: zilele pe coloane, intervalele orare pe rânduri.
 * @param {Object} props
 * @param {Array<Date>} props.days Zilele afișate, în ordine.
 * @param {Array<Object>} props.slots Sloturile din API pentru aceste zile.
 * @param {Date} props.now Momentul de acum, pentru sloturile începute.
 */
export function WeekCalendar({days, slots, now}) {
  // Câte un rând pentru fiecare interval orar care apare în săptămână.
  const intervals = [
    ...new Map(
      slots.map((slot) => [`${slot.ora_start}-${slot.ora_sfarsit}`, slot]),
    ).values(),
  ].sort(
    (first, second) =>
      first.ora_start.localeCompare(second.ora_start) ||
      first.ora_sfarsit.localeCompare(second.ora_sfarsit),
  );
  const slotByCell = new Map(
    slots.map((slot) => [
      `${slot.data}|${slot.ora_start}|${slot.ora_sfarsit}`,
      slot,
    ]),
  );

  return (
    <div className="calendar-table-wrapper">
      <table className="calendar-table">
        <colgroup>
          <col className="calendar-time-column" />
          {days.map((day) => (
            <col key={toIsoDate(day)} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">Interval</span>
            </th>
            {days.map((day) => (
              <th key={toIsoDate(day)} scope="col">
                {weekdayName(day)}
                <span className="calendar-day-date">{formatDayMonth(day)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intervals.map((interval) => (
            <tr key={`${interval.ora_start}-${interval.ora_sfarsit}`}>
              <th scope="row">
                {formatTime(interval.ora_start)} –{' '}
                {formatTime(interval.ora_sfarsit)}
              </th>
              {days.map((day) => (
                <SlotCell
                  key={toIsoDate(day)}
                  slot={
                    slotByCell.get(
                      `${toIsoDate(day)}|${interval.ora_start}|${interval.ora_sfarsit}`,
                    ) ?? null
                  }
                  now={now}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
