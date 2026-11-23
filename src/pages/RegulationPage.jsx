import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router';

import {
  getFacility,
  getRegulation,
  updateRegulation,
} from '../api/facilityApi.js';
import {RegulationForm} from '../components/RegulationForm.jsx';

// Id-urile sunt numere întregi pozitive.
const VALID_ID = /^[1-9]\d{0,9}$/;

/**
 * Încarcă sala și regulamentul ei. Regulamentul lipsă (404) nu e o eroare:
 * managerul îl scrie acum pentru prima dată.
 * @param {string} id
 * @return {Promise<{facility: Object, rules: ?string}>}
 */
async function loadRegulation(id) {
  const [facility, rules] = await Promise.all([
    getFacility(id),
    getRegulation(id)
      .then((regulation) => regulation.text)
      .catch((error) => {
        if (error.status === 404) {
          return null;
        }
        throw error;
      }),
  ]);
  return {facility, rules};
}

/** Pagina în care managerul sau administratorul editează regulamentul sălii. */
export function RegulationPage() {
  const {id} = useParams();
  const isValidId = VALID_ID.test(id);
  const [result, setResult] = useState({id: null});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isValidId) {
      return undefined;
    }
    let isCurrent = true;
    loadRegulation(id)
      .then((data) => isCurrent && setResult({id, ...data}))
      .catch((error) => isCurrent && setResult({id, error: error.message}));
    return () => {
      isCurrent = false;
    };
  }, [id, isValidId]);

  async function handleSubmit(text) {
    setIsSaving(true);
    setSaveError('');
    setMessage('');
    try {
      const regulation = await updateRegulation(id, text);
      setResult((current) => ({...current, rules: regulation.text}));
      setMessage('Regulamentul a fost salvat.');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isValidId) {
    return (
      <main className="page">
        <p className="alert alert-error" role="alert">
          Facilitatea nu există.
        </p>
        <Link to="/facilitati">Înapoi la facilități</Link>
      </main>
    );
  }
  if (result.id !== id) {
    return (
      <main className="page">
        <p className="empty-state">Se încarcă regulamentul…</p>
      </main>
    );
  }
  if (result.error) {
    return (
      <main className="page">
        <p className="alert alert-error" role="alert">
          {result.error}
        </p>
        <Link to="/facilitati">Înapoi la facilități</Link>
      </main>
    );
  }

  const {facility, rules} = result;

  return (
    <main className="page regulation-page">
      <div className="page-header regulation-header">
        <h1>Regulamentul sălii</h1>
        <p>{facility.nume}</p>
      </div>

      {rules === null && (
        <p className="alert alert-info" role="status">
          Sala nu are încă un regulament. Scrie-l mai jos; clienții îl vor
          accepta la fiecare rezervare.
        </p>
      )}
      {saveError && (
        <p className="alert alert-error" role="alert">
          {saveError}
        </p>
      )}
      {message && (
        <p className="alert alert-success" role="status">
          {message}
        </p>
      )}

      <RegulationForm
        key={id}
        initialText={rules ?? ''}
        isSaving={isSaving}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
