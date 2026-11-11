import {useEffect, useState} from 'react';

import {
  createFacility,
  deleteFacility,
  listFacilities,
  updateFacility,
} from '../api/facilityApi.js';
import {FacilityCard} from '../components/FacilityCard.jsx';
import {FacilityForm} from '../components/FacilityForm.jsx';

/** Pagina cu lista facilităților și operațiile de adăugare, editare, ștergere. */
export function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  // null = formularul e închis; {facility: null} = adăugare; altfel editare.
  const [form, setForm] = useState(null);

  useEffect(() => {
    listFacilities()
      .then(setFacilities)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function reloadFacilities() {
    setFacilities(await listFacilities());
  }

  async function runOperation(operation, successMessage) {
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      await operation();
      await reloadFacilities();
      setMessage(successMessage);
      return true;
    } catch (operationError) {
      setError(operationError.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(data) {
    const facility = form.facility;
    const isSaved = await runOperation(
      () =>
        facility ? updateFacility(facility.id, data) : createFacility(data),
      facility
        ? `Facilitatea „${data.nume}” a fost modificată.`
        : `Facilitatea „${data.nume}” a fost adăugată.`,
    );
    if (isSaved) {
      setForm(null);
    }
  }

  async function handleDelete(facility) {
    const isConfirmed = window.confirm(
      `Sigur vrei să ștergi facilitatea „${facility.nume}”?`,
    );
    if (!isConfirmed) {
      return;
    }
    await runOperation(
      () => deleteFacility(facility.id),
      `Facilitatea „${facility.nume}” a fost ștearsă.`,
    );
  }

  function openForm(facility) {
    setError('');
    setMessage('');
    setForm({facility});
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Facilități sportive</h1>
        {!form && (
          <button
            type="button"
            className="button button-primary"
            onClick={() => openForm(null)}
            disabled={isLoading}
          >
            Adaugă facilitate
          </button>
        )}
      </div>

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

      {form && (
        <FacilityForm
          key={form.facility?.id ?? 'nou'}
          facility={form.facility}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => setForm(null)}
        />
      )}

      {isLoading && <p className="empty-state">Se încarcă facilitățile...</p>}
      {!isLoading && facilities.length === 0 && !error && (
        <p className="empty-state">Nu există încă nicio facilitate.</p>
      )}

      <div className="facility-grid">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            disabled={isSaving}
            onEdit={openForm}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
}
