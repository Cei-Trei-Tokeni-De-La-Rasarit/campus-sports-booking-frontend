import {ROLE_LABELS, ROLES} from '../utils/roles.js';

// Lungimea maximă a textului căutat, aceeași ca în backend.
const MAX_SEARCH_LENGTH = 100;

/**
 * Filtrele listei de utilizatori: rolul și căutarea după nume sau email.
 * Valorile sunt păstrate de pagină.
 * @param {Object} props
 * @param {{rol: string, search: string}} props.filters
 * @param {function(string, string): void} props.onChange Primește numele
 *     filtrului și noua valoare.
 */
export function UserFilters({filters, onChange}) {
  function handleChange(event) {
    onChange(event.target.name, event.target.value);
  }

  return (
    <form
      className="catalog-filters"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="catalog-filter catalog-filter-search">
        Caută:
        <input
          type="search"
          name="search"
          placeholder="Nume sau email"
          maxLength={MAX_SEARCH_LENGTH}
          value={filters.search}
          onChange={handleChange}
        />
      </label>

      <label className="catalog-filter catalog-filter-sport">
        Rol:
        <select name="rol" value={filters.rol} onChange={handleChange}>
          <option value="">Toate</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
