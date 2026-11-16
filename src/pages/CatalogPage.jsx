import {useEffect, useMemo, useState} from 'react';

import {listCatalog} from '../api/facilityApi.js';
import {CatalogCard} from '../components/CatalogCard.jsx';
import {CatalogFilters} from '../components/CatalogFilters.jsx';

// Cât așteptăm după ultima literă scrisă înainte să trimitem căutarea.
const SEARCH_DELAY_MS = 300;

const INITIAL_FILTERS = {
  search: '',
  sport: '',
  minCapacity: '',
  order: 'newest',
  availableToday: false,
};

// Ordinea cardurilor; API-ul nu sortează, așa că ordonăm în pagină.
const COMPARE_BY_ORDER = {
  newest: (first, second) => second.id - first.id,
  name: (first, second) => first.nume.localeCompare(second.nume, 'ro'),
  capacity: (first, second) => second.capacitate - first.capacitate,
};

/** Pagina Catalog: sălile active, cu filtre și disponibilitatea de azi. */
export function CatalogPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState('');
  const [sports, setSports] = useState([]);
  // Rezultatul ultimei cereri, împreună cu filtrele pentru care a venit.
  const [result, setResult] = useState({query: null});

  // Căutarea pleacă abia după ce utilizatorul se oprește din scris.
  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(filters.search.trim()),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Lista „Sport” conține sporturile tuturor sălilor active.
  useEffect(() => {
    listCatalog()
      .then((facilities) =>
        setSports(
          [...new Set(facilities.map((facility) => facility.sport))].sort(
            (first, second) => first.localeCompare(second, 'ro'),
          ),
        ),
      )
      .catch(() => setSports([]));
  }, []);

  // Filtrele trimise la server, ca text, ca să știm cărui set îi aparține
  // un răspuns.
  const query = JSON.stringify({
    cautare: search,
    sport: filters.sport,
    capacitate_min: filters.minCapacity,
    disponibile_azi: filters.availableToday,
  });

  useEffect(() => {
    // Un răspuns venit după ce filtrele s-au schimbat este ignorat.
    let isCurrent = true;
    const apiFilters = JSON.parse(query);
    // A doua cerere aduce sălile care mai au azi un interval liber, pentru
    // eticheta „Liber azi” / „Ocupat azi” a fiecărui card.
    Promise.all([
      listCatalog(apiFilters),
      apiFilters.disponibile_azi
        ? null
        : listCatalog({...apiFilters, disponibile_azi: true}),
    ])
      .then(([facilities, availableToday]) => {
        if (isCurrent) {
          setResult({
            query,
            facilities,
            availableIds: new Set(
              (availableToday ?? facilities).map((facility) => facility.id),
            ),
          });
        }
      })
      .catch((loadError) => {
        if (isCurrent) {
          setResult({query, error: loadError.message});
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [query]);

  const sortedFacilities = useMemo(
    () => [...(result.facilities ?? [])].sort(COMPARE_BY_ORDER[filters.order]),
    [result.facilities, filters.order],
  );

  function handleFilterChange(name, value) {
    setFilters((current) => ({...current, [name]: value}));
  }

  const isLoading = result.query !== query;

  return (
    <main className="catalog-page">
      <div className="catalog-title">
        <h1>Catalog facilități</h1>
        <p>Alege o sală și vezi intervalele libere din calendar.</p>
      </div>

      <CatalogFilters
        filters={filters}
        sports={sports}
        onChange={handleFilterChange}
      />

      {isLoading && <p className="empty-state">Se încarcă sălile…</p>}

      {!isLoading && result.error && (
        <p className="alert alert-error" role="alert">
          {result.error}
        </p>
      )}

      {!isLoading && !result.error && sortedFacilities.length === 0 && (
        <p className="empty-state">
          Nu există săli care să corespundă filtrelor alese.
        </p>
      )}

      {!isLoading && sortedFacilities.length > 0 && (
        <div className="catalog-grid">
          {sortedFacilities.map((facility) => (
            <CatalogCard
              key={facility.id}
              facility={facility}
              isAvailableToday={result.availableIds.has(facility.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
