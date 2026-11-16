// Lungimea maximă a textului căutat, aceeași ca în backend.
const MAX_SEARCH_LENGTH = 100;

const CAPACITY_OPTIONS = [2, 4, 10, 20];

export const SORT_OPTIONS = [
  {value: 'newest', label: 'Cele mai noi'},
  {value: 'name', label: 'Nume A–Z'},
  {value: 'capacity', label: 'Capacitate'},
];

/**
 * Bara de filtre a catalogului. Valorile sunt păstrate de pagină; la fiecare
 * schimbare se apelează `onChange` cu numele filtrului și noua valoare.
 * @param {Object} props
 * @param {{search: string, sport: string, minCapacity: string,
 *     order: string, availableToday: boolean}} props.filters
 * @param {Array<string>} props.sports Sporturile din lista „Sport”.
 * @param {function(string, (string|boolean)): void} props.onChange
 */
export function CatalogFilters({filters, sports, onChange}) {
  function handleChange(event) {
    const {name, type, value, checked} = event.target;
    onChange(name, type === 'checkbox' ? checked : value);
  }

  return (
    <form
      className="catalog-filters"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="catalog-filter catalog-filter-search">
        Caută sala:
        <input
          type="search"
          name="search"
          placeholder="Nume sală"
          maxLength={MAX_SEARCH_LENGTH}
          value={filters.search}
          onChange={handleChange}
        />
      </label>

      <label className="catalog-filter catalog-filter-sport">
        Sport:
        <select name="sport" value={filters.sport} onChange={handleChange}>
          <option value="">Toate</option>
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </label>

      <label className="catalog-filter catalog-filter-order">
        Filtrare:
        <select name="order" value={filters.order} onChange={handleChange}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="catalog-filter catalog-filter-capacity">
        Capacitate:
        <select
          name="minCapacity"
          value={filters.minCapacity}
          onChange={handleChange}
        >
          <option value="">Oricare</option>
          {CAPACITY_OPTIONS.map((capacity) => (
            <option key={capacity} value={capacity}>
              {capacity}+ locuri
            </option>
          ))}
        </select>
      </label>

      <label className="catalog-filter catalog-filter-today">
        <input
          type="checkbox"
          name="availableToday"
          checked={filters.availableToday}
          onChange={handleChange}
        />
        Doar săli disponibile azi
      </label>
    </form>
  );
}
