import {useEffect, useState} from 'react';
import {Link, useParams, useSearchParams} from 'react-router';

import {createBooking} from '../api/bookingApi.js';
import {getFacility, getRegulation, listSlots} from '../api/facilityApi.js';
import {
  CANCELLATION_NOTICE_HOURS,
  formatDayMonth,
  formatTime,
  fromIsoDate,
  hasStarted,
  weekdayName,
} from '../utils/week.js';

// Id-urile sunt numere întregi pozitive, iar data are forma AAAA-LL-ZZ.
const VALID_ID = /^[1-9]\d{0,9}$/;
const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Încarcă sala, slotul și regulamentul. Regulamentul lipsă (404) nu e o
 * eroare: unele săli nu au regulament publicat.
 * @param {string} facilityId
 * @param {string} slotId
 * @param {string} date
 * @return {Promise<{facility: Object, slot: ?Object, rules: ?string}>}
 */
async function loadBooking(facilityId, slotId, date) {
  const [facility, slots, rules] = await Promise.all([
    getFacility(facilityId),
    listSlots(facilityId, date, date),
    getRegulation(facilityId)
      .then((regulation) => regulation.text)
      .catch((error) => {
        if (error.status === 404) {
          return null;
        }
        throw error;
      }),
  ]);
  const slot = slots.find((item) => String(item.id) === slotId) ?? null;
  return {facility, slot, rules};
}

/** Pagina „Confirmă rezervarea” pentru un interval liber din calendar. */
export function BookingPage() {
  const {id, slotId} = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('data') ?? '';
  const isValid =
    VALID_ID.test(id) && VALID_ID.test(slotId) && VALID_DATE.test(date);
  const query = `${id}|${slotId}|${date}`;

  const [result, setResult] = useState({query: null});
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!isValid) {
      return undefined;
    }
    let isCurrent = true;
    const [facilityId, slot, day] = query.split('|');
    loadBooking(facilityId, slot, day)
      .then((data) => isCurrent && setResult({query, ...data}))
      .catch((error) => isCurrent && setResult({query, error: error.message}));
    return () => {
      isCurrent = false;
    };
  }, [query, isValid]);

  async function handleConfirm() {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      setBooking(await createBooking(Number(slotId), accepted));
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const calendarLink = `/facilitati/${id}/calendar`;

  if (!isValid || (result.query === query && !result.error && !result.slot)) {
    return (
      <main className="booking-page">
        <p className="alert alert-error" role="alert">
          Intervalul nu există.
        </p>
        <Link to="/catalog">Înapoi la catalog</Link>
      </main>
    );
  }
  if (result.query !== query) {
    return (
      <main className="booking-page">
        <p className="empty-state">Se încarcă intervalul…</p>
      </main>
    );
  }
  if (result.error) {
    return (
      <main className="booking-page">
        <p className="alert alert-error" role="alert">
          {result.error}
        </p>
        <Link to={calendarLink}>Înapoi la calendar</Link>
      </main>
    );
  }

  const {facility, slot, rules} = result;
  const day = fromIsoDate(slot.data);
  const isBookable = slot.stare === 'liber' && !hasStarted(slot, new Date());

  if (booking) {
    return (
      <main className="booking-page">
        <div className="booking-title">
          <h1>Rezervare confirmată</h1>
          <p>
            Ai rezervat {facility.nume}, {weekdayName(day).toLowerCase()}{' '}
            {formatDayMonth(day)}, între {formatTime(slot.ora_start)} și{' '}
            {formatTime(slot.ora_sfarsit)}.
          </p>
        </div>
        <div className="booking-actions">
          <Link to="/rezervari" className="button button-primary">
            Vezi rezervările mele
          </Link>
          <Link to={calendarLink} className="button booking-back">
            Înapoi la calendar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <div className="booking-title">
        <h1>Confirmă rezervarea</h1>
        <p>
          Verifică detaliile și acceptă regulamentul sălii înainte de
          confirmare.
        </p>
      </div>

      <div className="booking-grid">
        <div className="booking-left">
          <section className="booking-card" aria-labelledby="summary-title">
            <h2 id="summary-title">Rezumatul rezervării</h2>
            <dl className="booking-summary">
              <dt>Sala</dt>
              <dd>{facility.nume}</dd>
              <dt>Locație</dt>
              <dd>{facility.locatie}</dd>
              <dt>Data</dt>
              <dd>
                {weekdayName(day)}, {formatDayMonth(day)}
              </dd>
              <dt>Interval</dt>
              <dd>
                {formatTime(slot.ora_start)} – {formatTime(slot.ora_sfarsit)}
              </dd>
              <dt>Status interval</dt>
              <dd className={isBookable ? 'booking-free' : 'booking-busy'}>
                {isBookable ? 'Liber' : 'Indisponibil'}
              </dd>
            </dl>
          </section>

          {submitError && (
            <p className="alert alert-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="booking-actions">
            <Link to={calendarLink} className="button booking-back">
              Înapoi
            </Link>
            <button
              type="button"
              className="button button-primary"
              disabled={!isBookable || !accepted || isSubmitting}
              onClick={handleConfirm}
            >
              {isSubmitting ? 'Se confirmă…' : 'Confirmă rezervarea'}
            </button>
          </div>
          <p className="booking-hint">
            {isBookable
              ? 'Butonul „Confirmă rezervarea” devine activ doar după bifarea regulamentului.'
              : 'Acest interval nu mai poate fi rezervat.'}
          </p>
          {isBookable && (
            <p className="booking-hint">
              Poți anula rezervarea până cu {CANCELLATION_NOTICE_HOURS} de ore
              înainte de începutul intervalului, din „Rezervările mele”.
            </p>
          )}
        </div>

        <section className="booking-card" aria-labelledby="rules-title">
          <h2 id="rules-title">Regulamentul sălii</h2>
          {rules ? (
            <div className="booking-rules">
              {rules
                .split('\n')
                .filter((line) => line.trim())
                .map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
            </div>
          ) : (
            <p className="empty-state">Sala nu are un regulament publicat.</p>
          )}
          <label className="booking-accept">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              disabled={!isBookable}
            />
            Am citit și sunt de acord cu regulamentul sălii
          </label>
        </section>
      </div>
    </main>
  );
}
