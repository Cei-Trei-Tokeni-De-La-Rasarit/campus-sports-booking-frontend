import {useEffect, useRef, useState} from 'react';

import {ROLE_LABELS, ROLES} from '../utils/roles.js';

/**
 * Formularul de schimbare a rolului unui utilizator; pentru manager, și
 * sălile pe care le poate edita.
 * @param {Object} props
 * @param {Object} props.user Utilizatorul din listă, cu `facilitati_alocate`.
 * @param {Array<Object>} props.facilities Toate sălile, pentru alocare.
 * @param {boolean} props.isSaving Dacă cererea de salvare este în curs.
 * @param {function(string, Array<number>): void} props.onSubmit Primește
 *     rolul și id-urile sălilor (goală pentru alt rol decât manager).
 * @param {function(): void} props.onCancel
 */
export function RoleForm({user, facilities, isSaving, onSubmit, onCancel}) {
  const [role, setRole] = useState(user.rol);
  const [facilityIds, setFacilityIds] = useState(
    () => new Set(user.facilitati_alocate),
  );
  const [error, setError] = useState('');
  const roleRef = useRef(null);

  // Formularul apare deasupra listei: mutăm focusul pe el, ca să fie văzut.
  useEffect(() => {
    roleRef.current.focus();
  }, []);

  function toggleFacility(id) {
    setFacilityIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!ROLES.includes(role)) {
      setError('Alege un rol din listă.');
      return;
    }
    setError('');
    onSubmit(
      role,
      role === 'manager' ? [...facilityIds].sort((a, b) => a - b) : [],
    );
  }

  return (
    <form className="card role-form" onSubmit={handleSubmit} noValidate>
      <h2>Schimbă rolul: {user.nume}</h2>
      <p className="role-form-email">{user.email}</p>

      {/* Eticheta e separată de listă, ca numele câmpului să fie doar „Rol”,
          fără valoarea aleasă. */}
      <div className="field role-form-role">
        <label htmlFor="role-form-role">Rol</label>
        <select
          id="role-form-role"
          ref={roleRef}
          name="rol"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'role-form-error' : undefined}
        >
          {ROLES.map((item) => (
            <option key={item} value={item}>
              {ROLE_LABELS[item]}
            </option>
          ))}
        </select>
        {error && (
          <span id="role-form-error" className="field-error">
            {error}
          </span>
        )}
      </div>

      {role === 'manager' && (
        <fieldset className="role-form-facilities">
          <legend>Sălile pe care le poate edita</legend>
          {facilities.length === 0 ? (
            <p className="field-hint">Nu există săli de alocat.</p>
          ) : (
            facilities.map((facility) => (
              <label key={facility.id} className="role-form-facility">
                <input
                  type="checkbox"
                  checked={facilityIds.has(facility.id)}
                  onChange={() => toggleFacility(facility.id)}
                />
                {facility.nume}
              </label>
            ))
          )}
          {facilityIds.size === 0 && facilities.length > 0 && (
            <p className="field-hint">
              Fără săli alocate, managerul nu poate edita nicio sală.
            </p>
          )}
        </fieldset>
      )}

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
          {isSaving ? 'Se salvează…' : 'Salvează rolul'}
        </button>
      </div>
    </form>
  );
}
