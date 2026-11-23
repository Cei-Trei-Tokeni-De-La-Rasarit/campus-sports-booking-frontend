import {useEffect, useState} from 'react';

import {listAllFacilities} from '../api/facilityApi.js';
import {changeUserRole, listUsers} from '../api/userApi.js';
import {useAuth} from '../auth/AuthContext.jsx';
import {RoleForm} from '../components/RoleForm.jsx';
import {UserFilters} from '../components/UserFilters.jsx';
import {ROLE_LABELS} from '../utils/roles.js';

const SEARCH_DELAY_MS = 300;

/**
 * Numele sălilor alocate unui manager, din lista tuturor sălilor.
 * @param {Array<number>} ids
 * @param {Map<number, Object>} facilities
 * @return {string}
 */
function facilityNames(ids, facilities) {
  if (ids.length === 0) {
    return 'Niciuna';
  }
  return ids
    .map((id) => facilities.get(id)?.nume ?? `Sala nr. ${id}`)
    .join(', ');
}

/**
 * Pagina administratorului: utilizatorii, rolurile lor și sălile alocate
 * managerilor.
 */
export function UsersPage() {
  const {user: currentUser} = useAuth();
  const [filters, setFilters] = useState({rol: '', search: ''});
  const [search, setSearch] = useState('');
  // Crește după fiecare salvare, ca lista să se citească din nou.
  const [version, setVersion] = useState(0);
  // Utilizatorii ultimei cereri, împreună cu filtrele pentru care au venit.
  const [result, setResult] = useState({query: null});
  const [facilities, setFacilities] = useState([]);
  const [facilitiesError, setFacilitiesError] = useState('');
  // Utilizatorul al cărui rol se schimbă sau null.
  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Căutarea pleacă abia după ce administratorul se oprește din scris.
  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(filters.search.trim()),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Toate sălile, pentru numele celor alocate și pentru formular.
  useEffect(() => {
    listAllFacilities()
      .then(setFacilities)
      .catch((loadError) =>
        setFacilitiesError(
          `Sălile nu au putut fi încărcate: ${loadError.message}`,
        ),
      );
  }, []);

  const query = JSON.stringify({rol: filters.rol, cautare: search, version});

  useEffect(() => {
    let isCurrent = true;
    const {rol, cautare} = JSON.parse(query);
    listUsers({rol, cautare})
      .then((users) => isCurrent && setResult({query, users}))
      .catch(
        (loadError) =>
          isCurrent && setResult({query, error: loadError.message}),
      );
    return () => {
      isCurrent = false;
    };
  }, [query]);

  function handleFilterChange(name, value) {
    setFilters((current) => ({...current, [name]: value}));
  }

  function openForm(user) {
    setError('');
    setMessage('');
    setEditing(user);
  }

  async function handleSubmit(role, facilityIds) {
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      await changeUserRole(editing.id, role, facilityIds);
      setMessage(
        `${editing.nume} are acum rolul ${ROLE_LABELS[role].toLowerCase()}.`,
      );
      setEditing(null);
      setVersion((current) => current + 1);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  const isLoading = result.query !== query;
  const users = result.users ?? [];
  const facilitiesById = new Map(
    facilities.map((facility) => [facility.id, facility]),
  );

  return (
    <main className="page users-page">
      <div className="page-header">
        <h1>Utilizatori și roluri</h1>
      </div>

      <UserFilters filters={filters} onChange={handleFilterChange} />

      {facilitiesError && (
        <p className="alert alert-error" role="alert">
          {facilitiesError}
        </p>
      )}
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="alert alert-success" role="status">
          {message}
        </p>
      )}

      {editing && (
        <RoleForm
          key={editing.id}
          user={editing}
          facilities={facilities}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      )}

      {isLoading && <p className="empty-state">Se încarcă utilizatorii…</p>}
      {!isLoading && result.error && (
        <p className="alert alert-error" role="alert">
          {result.error}
        </p>
      )}
      {!isLoading && !result.error && users.length === 0 && (
        <p className="empty-state">
          Niciun utilizator nu corespunde filtrelor.
        </p>
      )}

      {!isLoading && users.length > 0 && (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">Nume</th>
                <th scope="col">Email</th>
                <th scope="col">Rol</th>
                <th scope="col">Săli alocate</th>
                <th scope="col">
                  <span className="visually-hidden">Acțiuni</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nume}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-badge-${user.rol}`}>
                      {ROLE_LABELS[user.rol]}
                    </span>
                  </td>
                  <td>
                    {user.rol === 'manager'
                      ? facilityNames(user.facilitati_alocate, facilitiesById)
                      : '—'}
                  </td>
                  <td>
                    {/* Serverul nu lasă administratorul să-și schimbe
                        propriul rol, ca aplicația să nu rămână fără admin. */}
                    {user.id === currentUser.id ? (
                      <span className="users-own">Contul tău</span>
                    ) : (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => openForm(user)}
                        disabled={isSaving}
                      >
                        Schimbă rolul
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
