import {useState} from 'react';

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
  program: '',
  status: 'activa',
};

/**
 * Formularul de adăugare și de editare a unei facilități.
 * @param {Object} props
 * @param {?Object} props.facility Facilitatea editată sau null pentru una nouă.
 * @param {boolean} props.isSaving Dacă cererea de salvare este în curs.
 * @param {function(Object): void} props.onSubmit
 * @param {function(): void} props.onCancel
 */
export function FacilityForm({facility, isSaving, onSubmit, onCancel}) {
  const [values, setValues] = useState(() =>
    facility ? {...facility, program: facility.program ?? ''} : EMPTY_FACILITY,
  );

  function handleChange(event) {
    const {name, value} = event.target;
    setValues((current) => ({...current, [name]: value}));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      nume: values.nume.trim(),
      sport: values.sport.trim(),
      locatie: values.locatie.trim(),
      capacitate: Number(values.capacitate),
      program: values.program.trim() || null,
      status: values.status,
    });
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
          Program (opțional)
          <input
            name="program"
            value={values.program}
            onChange={handleChange}
            maxLength={200}
            placeholder="Luni-Vineri 08:00-22:00"
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
