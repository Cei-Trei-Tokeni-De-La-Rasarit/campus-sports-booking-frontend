const STATUS_LABELS = {
  activa: 'Activă',
  mentenanta: 'În mentenanță',
  inactiva: 'Inactivă',
};

/**
 * Cardul unei facilități din listă, cu butoanele de editare și ștergere.
 * @param {Object} props
 * @param {Object} props.facility
 * @param {boolean} props.disabled Dacă butoanele sunt blocate (cerere în curs).
 * @param {function(Object): void} props.onEdit
 * @param {function(Object): void} props.onDelete
 */
export function FacilityCard({facility, disabled, onEdit, onDelete}) {
  return (
    <article className="card facility-card">
      <div className="facility-card-header">
        <h3>{facility.nume}</h3>
        <span className={`status status-${facility.status}`}>
          {STATUS_LABELS[facility.status]}
        </span>
      </div>

      <dl className="facility-details">
        <dt>Sport</dt>
        <dd>{facility.sport}</dd>
        <dt>Locație</dt>
        <dd>{facility.locatie}</dd>
        <dt>Capacitate</dt>
        <dd>{facility.capacitate} persoane</dd>
        <dt>Program</dt>
        <dd>{facility.program ?? '—'}</dd>
      </dl>

      <div className="facility-card-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => onEdit(facility)}
          disabled={disabled}
        >
          Editează
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={() => onDelete(facility)}
          disabled={disabled}
        >
          Șterge
        </button>
      </div>
    </article>
  );
}
