import {useEffect, useState} from 'react';

import {
  createFacility,
  deleteFacility,
  getSchedule,
  getSchedules,
  listAllFacilities,
  updateFacility,
  updateSchedule,
} from '../api/facilityApi.js';
import {useAuth} from '../auth/AuthContext.jsx';
import {FacilityCard} from '../components/FacilityCard.jsx';
import {FacilityForm} from '../components/FacilityForm.jsx';

/**
 * Toate facilitățile, împreună cu programele lor ({id: program}).
 * @return {Promise<{facilities: Array<Object>, schedules: Object}>}
 */
async function loadFacilities() {
  const facilities = await listAllFacilities();
  const schedules = await getSchedules(
    facilities.map((facility) => facility.id),
  );
  return {facilities, schedules};
}

/**
 * Mesajul despre rezervările viitoare rămase în afara noului program sau ''
 * dacă nu există. Backend-ul nu le anulează, așa că managerul trebuie să
 * afle de ele.
 * @param {number} count
 * @return {string}
 */
function bookingsOutsideMessage(count) {
  if (count === 0) {
    return '';
  }
  if (count === 1) {
    return (
      'O rezervare viitoare a rămas în afara noului program. ' +
      'Ea nu se anulează automat.'
    );
  }
  // În română, de la 20 în sus se spune „20 de rezervări”.
  const lastTwoDigits = count % 100;
  const bookings =
    lastTwoDigits === 0 || lastTwoDigits >= 20
      ? `${count} de rezervări viitoare`
      : `${count} rezervări viitoare`;
  return (
    `${bookings} au rămas în afara noului program. ` +
    'Ele nu se anulează automat.'
  );
}

/** Pagina cu lista facilităților și operațiile de adăugare, editare, ștergere. */
export function FacilitiesPage() {
  const {user} = useAuth();
  // Doar administratorul adaugă și șterge săli; managerul doar le editează.
  const isAdmin = user?.rol === 'administrator';
  const [facilities, setFacilities] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [warning, setWarning] = useState('');
  // null = formularul e închis; altfel {key, facility, schedule}, cu
  // facility null la adăugare.
  const [form, setForm] = useState(null);

  useEffect(() => {
    loadFacilities()
      .then((data) => {
        setFacilities(data.facilities);
        setSchedules(data.schedules);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function reloadFacilities() {
    const data = await loadFacilities();
    setFacilities(data.facilities);
    setSchedules(data.schedules);
  }

  function clearMessages() {
    setError('');
    setMessage('');
    setWarning('');
  }

  async function runOperation(operation, successMessage) {
    setIsSaving(true);
    clearMessages();
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

  // Se salvează întâi sala, apoi programul ei (o sală nouă are nevoie de id).
  async function handleSubmit(data, schedule) {
    const facility = form.facility;
    setIsSaving(true);
    clearMessages();
    let savedFacility = null;
    try {
      savedFacility = facility
        ? await updateFacility(facility.id, data)
        : await createFacility(data);
      const result = await updateSchedule(savedFacility.id, schedule);
      setForm(null);
      setMessage(
        facility
          ? `Facilitatea „${data.nume}” a fost modificată.`
          : `Facilitatea „${data.nume}” a fost adăugată.`,
      );
      setWarning(bookingsOutsideMessage(result.rezervari_in_afara_programului));
    } catch (saveError) {
      if (savedFacility) {
        // Sala s-a salvat, dar programul nu. Formularul rămâne deschis, pe
        // sala salvată, ca o nouă încercare să nu mai adauge încă o sală.
        setForm((current) => ({...current, facility: savedFacility}));
        setError(
          `Datele sălii au fost salvate, dar programul nu: ${saveError.message}`,
        );
      } else {
        setError(saveError.message);
      }
    }
    if (savedFacility) {
      try {
        await reloadFacilities();
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    setIsSaving(false);
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

  // La editare, programul se citește din nou de la server, ca formularul să
  // pornească de la ultima variantă salvată.
  async function openForm(facility) {
    clearMessages();
    if (!facility) {
      setForm({key: 'nou', facility: null, schedule: null});
      return;
    }
    setIsSaving(true);
    try {
      const schedule = await getSchedule(facility.id);
      setForm({key: facility.id, facility, schedule});
    } catch (loadError) {
      setError(`Programul sălii nu a putut fi încărcat: ${loadError.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>Facilități sportive</h1>
        {!form && isAdmin && (
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
      {warning && (
        <p className="alert alert-warning" role="status">
          {warning}
        </p>
      )}

      {form && (
        <FacilityForm
          key={form.key}
          facility={form.facility}
          schedule={form.schedule}
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
            schedule={schedules[facility.id]}
            disabled={isSaving}
            onEdit={openForm}
            onDelete={isAdmin ? handleDelete : null}
          />
        ))}
      </div>
    </main>
  );
}
