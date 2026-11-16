import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router';

import {getFacility, listSlots} from '../api/facilityApi.js';
import {WeekCalendar} from '../components/WeekCalendar.jsx';
import {addDays, formatRange, startOfWeek, toIsoDate} from '../utils/week.js';

// Zilele lucrătoare se văd mereu; sâmbăta și duminica doar dacă au sloturi.
const WORK_DAYS = 5;
const WEEK_DAYS = 7;

// Un id de facilitate e un număr întreg pozitiv; altfel nu trimitem cererea.
const VALID_ID = /^[1-9]\d{0,9}$/;
const NOT_FOUND_MESSAGE = 'Facilitatea nu există.';

/** Pagina Calendar: sloturile unei facilități, pe săptămâni. */
export function CalendarPage() {
  const {id} = useParams();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [facility, setFacility] = useState({id: null});
  // Sloturile ultimei cereri, împreună cu săptămâna pentru care au venit.
  const [result, setResult] = useState({query: null});
  const isValidId = VALID_ID.test(id);

  useEffect(() => {
    if (!isValidId) {
      return undefined;
    }
    let isCurrent = true;
    getFacility(id)
      .then((data) => isCurrent && setFacility({id, data}))
      .catch((loadError) => isCurrent && setFacility({id, error: loadError}));
    return () => {
      isCurrent = false;
    };
  }, [id, isValidId]);

  const from = toIsoDate(weekStart);
  const to = toIsoDate(addDays(weekStart, WEEK_DAYS - 1));
  const query = `${id}|${from}|${to}`;

  useEffect(() => {
    if (!isValidId) {
      return undefined;
    }
    let isCurrent = true;
    const [facilityId, firstDay, lastDay] = query.split('|');
    listSlots(facilityId, firstDay, lastDay)
      .then((slots) => isCurrent && setResult({query, slots}))
      .catch(
        (loadError) =>
          isCurrent && setResult({query, error: loadError.message}),
      );
    return () => {
      isCurrent = false;
    };
  }, [query, isValidId]);

  const isFacilityLoading = facility.id !== id;
  if (!isValidId || (!isFacilityLoading && facility.error)) {
    return (
      <main className="calendar-page">
        <p className="alert alert-error" role="alert">
          {isValidId ? facility.error.message : NOT_FOUND_MESSAGE}
        </p>
        <Link to="/catalog">Înapoi la catalog</Link>
      </main>
    );
  }

  const isLoading = result.query !== query;
  const slots = result.slots ?? [];
  const hasWeekend = slots.some(
    (slot) => slot.data > toIsoDate(addDays(weekStart, WORK_DAYS - 1)),
  );
  const days = Array.from(
    {length: hasWeekend ? WEEK_DAYS : WORK_DAYS},
    (_, i) => addDays(weekStart, i),
  );

  return (
    <main className="calendar-page">
      <div className="calendar-title">
        <h1>
          {isFacilityLoading ? '' : `${facility.data.nume} – `}Calendar
          disponibilitate
        </h1>
        <div className="calendar-subtitle">
          <p>
            Săptămâna {formatRange(days[0], days[days.length - 1])} · apasă pe
            un interval liber ca să îl rezervi.
          </p>
          <div className="calendar-week-nav">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setWeekStart(addDays(weekStart, -WEEK_DAYS))}
            >
              ← Săptămâna anterioară
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setWeekStart(addDays(weekStart, WEEK_DAYS))}
            >
              Săptămâna următoare →
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-legend">
        Legendă:
        <span className="availability availability-free">Liber</span>
        <span className="availability availability-busy">Ocupat</span>
        <span className="availability availability-blocked">
          Blocat (mentenanță)
        </span>
      </div>

      {isLoading && <p className="empty-state">Se încarcă intervalele…</p>}

      {!isLoading && result.error && (
        <p className="alert alert-error" role="alert">
          {result.error}
        </p>
      )}

      {!isLoading && !result.error && slots.length === 0 && (
        <p className="empty-state">Nu există intervale în această săptămână.</p>
      )}

      {!isLoading && slots.length > 0 && (
        <WeekCalendar days={days} slots={slots} now={new Date()} />
      )}

      <p className="calendar-note">
        Intervalele ocupate sau blocate pentru mentenanță nu pot fi rezervate.
      </p>
    </main>
  );
}
