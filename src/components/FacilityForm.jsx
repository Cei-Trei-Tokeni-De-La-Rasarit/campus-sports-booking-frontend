import {useState} from 'react';

import {
  toApiSchedule,
  toFormSchedule,
  validateScheduleDay,
} from '../utils/schedule.js';
import {ScheduleEditor} from './ScheduleEditor.jsx';

const STATUS_OPTIONS = [
  {value: 'activa', label: 'Activă'},
  {value: 'mentenanta', label: 'În mentenanță'},
  {value: 'inactiva', label: 'Inactivă'},
];

const EMPTY_FACILITY = {
  nume: '',
  sport: '',
  locatie: '',
  capacitate: '',
  status: 'activa',
};

/**
 * Formularul de adăugare și de editare a unei facilități, cu programul ei
 * pe zile.
 * @param {Object} props
 * @param {?Object} props.facility Facilitatea editată sau null pentru una nouă.
 * @param {?Object} props.schedule Programul din API al facilității editate
 *     sau null pentru una nouă.
 * @param {boolean} props.isSaving Dacă cererea de salvare este în curs.
 * @param {function(Object, Object): void} props.onSubmit Primește datele
 *     facilității și programul, în formatul cerut de API.
 * @param {function(): void} props.onCancel
 */
export function FacilityForm({
  facility,
  schedule,
  isSaving,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() =>
    facility ? {...facility} : EMPTY_FACILITY,
  );
  const [scheduleValues, setScheduleValues] = useState(() =>
    toFormSchedule(schedule),
  );
  const [scheduleErrors, setScheduleErrors] = useState({});

  function handleChange(event) {
    const {name, value} = event.target;
    setValues((current) => ({...current, [name]: value}));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newScheduleErrors = {};
    for (const day of scheduleValues.days) {
      const error = validateScheduleDay(day, scheduleValues.slotMinutes);
      if (error) {
        newScheduleErrors[day.weekday] = error;
      }
    }
    setScheduleErrors(newScheduleErrors);
    if (Object.keys(newScheduleErrors).length > 0) {
      return;
    }
    onSubmit(
      {
        nume: values.nume.trim(),
        sport: values.sport.trim(),
        locatie: values.locatie.trim(),
        capacitate: Number(values.capacitate),
        status: values.status,
      },
      toApiSchedule(scheduleValues),
    );
  }

  return (
    <form className="card facility-form" onSubmit={handleSubmit}>
      <h2>{facility ? 'Editează facilitatea' : 'Adaugă o facilitate'}</h2>

      <div className="form-grid">
        <label className="field">
          Nume
          <input
            name="nume"
            value={values.nume}
            onChange={handleChange}
            maxLength={100}
            placeholder="Sala de sport A"
            required
          />
        </label>
        <label className="field">
          Sport
          <input
            name="sport"
            value={values.sport}
            onChange={handleChange}
            maxLength={50}
            placeholder="Baschet"
            required
          />
        </label>
        <label className="field">
          Locație
          <input
            name="locatie"
            value={values.locatie}
            onChange={handleChange}
            maxLength={150}
            placeholder="Corp B, parter"
            required
          />
        </label>
        <label className="field">
          Capacitate
          <input
            name="capacitate"
            type="number"
            min={1}
            value={values.capacitate}
            onChange={handleChange}
            placeholder="20"
            required
          />
        </label>
        <label className="field">
          Status
          <select name="status" value={values.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ScheduleEditor
        value={scheduleValues}
        errors={scheduleErrors}
        onChange={setScheduleValues}
      />

      <div className="form-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Renunță
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={isSaving}
        >
          {isSaving ? 'Se salvează...' : 'Salvează'}
        </button>
      </div>
    </form>
  );
}
