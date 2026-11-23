import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router';

import {getFacility, getSchedule} from '../api/facilityApi.js';
import {WeekCalendar} from '../components/WeekCalendar.jsx';
import {WeekNavigation} from '../components/WeekNavigation.jsx';
import {useWeekSlots} from '../hooks/useWeekSlots.js';
import {describeSchedule} from '../utils/schedule.js';
import {formatRange} from '../utils/week.js';

// Un id de facilitate e un număr întreg pozitiv; altfel nu trimitem cererea.
const VALID_ID = /^[1-9]\d{0,9}$/;
const NOT_FOUND_MESSAGE = 'Facilitatea nu există.';

/** Pagina Calendar: sloturile unei facilități, pe săptămâni. */
export function CalendarPage() {
  const {id} = useParams();
  const [facility, setFacility] = useState({id: null});
  // Programul sălii, împreună cu id-ul pentru care a venit.
  const [schedule, setSchedule] = useState({id: null});
  const isValidId = VALID_ID.test(id);
  const {days, slots, isLoading, error, previousWeek, nextWeek} = useWeekSlots(
    isValidId ? id : null,
  );

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

  // Programul e doar informativ: dacă nu se încarcă, calendarul merge mai
  // departe, fără el.
  useEffect(() => {
    if (!isValidId) {
      return undefined;
    }
    let isCurrent = true;
    getSchedule(id)
      .then((data) => isCurrent && setSchedule({id, data}))
      .catch(() => isCurrent && setSchedule({id, data: null}));
    return () => {
      isCurrent = false;
    };
  }, [id, isValidId]);

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

  return (
    <main className="calendar-page">
      <div className="calendar-title">
        <h1>
          {isFacilityLoading ? '' : `${facility.data.nume} – `}Calendar
          disponibilitate
        </h1>
        {schedule.id === id && schedule.data && (
          <p className="calendar-schedule">
            Program: {describeSchedule(schedule.data)}
          </p>
        )}
        <div className="calendar-subtitle">
          <p>
            Săptămâna {formatRange(days[0], days[days.length - 1])} · apasă pe
            un interval liber ca să îl rezervi.
          </p>
          <WeekNavigation onPrevious={previousWeek} onNext={nextWeek} />
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

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && slots.length === 0 && (
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
