import {SLOT_DURATIONS, WEEKDAY_NAMES} from '../utils/schedule.js';

/**
 * Programul pe zile din formularul facilității: durata unui interval și,
 * pentru fiecare zi, dacă sala e deschisă și între ce ore.
 * @param {Object} props
 * @param {{slotMinutes: number, days: Array<{weekday: number,
 *     isOpen: boolean, opensAt: string, closesAt: string}>}} props.value
 * @param {Object<number, string>} props.errors Mesajul de eroare pentru
 *     fiecare zi greșită, după numărul zilei (1 = luni).
 * @param {function(Object): void} props.onChange Primește programul nou.
 */
export function ScheduleEditor({value, errors, onChange}) {
  function changeDay(weekday, changes) {
    onChange({
      ...value,
      days: value.days.map((day) =>
        day.weekday === weekday ? {...day, ...changes} : day,
      ),
    });
  }

  const hasOpenDay = value.days.some((day) => day.isOpen);

  return (
    <fieldset className="schedule-editor">
      <legend>Program</legend>

      <label className="field schedule-slot">
        Durata unui interval
        <select
          value={value.slotMinutes}
          onChange={(event) =>
            onChange({...value, slotMinutes: Number(event.target.value)})
          }
        >
          {SLOT_DURATIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} de minute
            </option>
          ))}
        </select>
      </label>

      <div className="schedule-days">
        {value.days.map((day) => {
          const name = WEEKDAY_NAMES[day.weekday - 1];
          const error = errors[day.weekday];
          return (
            <div key={day.weekday} className="schedule-day">
              <label className="schedule-day-name">
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(event) =>
                    changeDay(day.weekday, {isOpen: event.target.checked})
                  }
                />
                {name}
              </label>
              {day.isOpen ? (
                <div className="schedule-day-hours">
                  <input
                    type="time"
                    value={day.opensAt}
                    onChange={(event) =>
                      changeDay(day.weekday, {opensAt: event.target.value})
                    }
                    aria-label={`Ora de deschidere, ${name}`}
                    aria-invalid={Boolean(error)}
                    required
                  />
                  <span aria-hidden="true">–</span>
                  <input
                    type="time"
                    value={day.closesAt}
                    onChange={(event) =>
                      changeDay(day.weekday, {closesAt: event.target.value})
                    }
                    aria-label={`Ora de închidere, ${name}`}
                    aria-invalid={Boolean(error)}
                    required
                  />
                </div>
              ) : (
                <span className="schedule-day-closed">Închis</span>
              )}
              {error && <span className="field-error">{error}</span>}
            </div>
          );
        })}
      </div>

      {!hasOpenDay && (
        <p className="field-hint">
          Fără nicio zi deschisă, sala nu va avea intervale în calendar.
        </p>
      )}
    </fieldset>
  );
}
