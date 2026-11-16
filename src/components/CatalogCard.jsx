import {Link} from 'react-router';

/**
 * Cardul unei săli din catalog: fotografia, numele, disponibilitatea de azi,
 * detaliile și butonul spre calendar.
 * @param {Object} props
 * @param {Object} props.facility
 * @param {boolean} props.isAvailableToday Dacă sala mai are azi un interval
 *     liber care nu a început.
 */
export function CatalogCard({facility, isAvailableToday}) {
  return (
    <article className="catalog-card">
      {/* API-ul nu are încă fotografii, așa că păstrăm locul din prototip. */}
      <div className="catalog-card-photo">Fotografie – {facility.sport}</div>

      <div className="catalog-card-title">
        <h2>{facility.nume}</h2>
        <span
          className={`availability ${
            isAvailableToday ? 'availability-free' : 'availability-busy'
          }`}
        >
          {isAvailableToday ? 'Liber azi' : 'Ocupat azi'}
        </span>
      </div>

      <p className="catalog-card-details">
        {facility.sport} · {facility.locatie} · {facility.capacitate} locuri
      </p>

      <Link
        to={`/facilitati/${facility.id}/calendar`}
        className="button button-primary catalog-card-button"
      >
        Vezi calendar
      </Link>
    </article>
  );
}
