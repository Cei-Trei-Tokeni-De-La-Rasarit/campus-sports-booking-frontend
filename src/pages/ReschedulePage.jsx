import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router';

import {listMyBookings, rescheduleBooking} from '../api/bookingApi.js';
import {getFacility} from '../api/facilityApi.js';
import {WeekCalendar} from '../components/WeekCalendar.jsx';
import {WeekNavigation} from '../components/WeekNavigation.jsx';
import {useWeekSlots} from '../hooks/useWeekSlots.js';
import {
  CANCELLATION_NOTICE_HOURS,
  canBeCancelled,
  formatDayMonth,
  formatRange,
  formatTime,
  fromIsoDate,
  weekdayName,
} from '../utils/week.js';

// Id-urile sunt numere întregi pozitive.
const VALID_ID = /^[1-9]\d{0,9}$/;
const NOT_FOUND_MESSAGE = 'Rezervarea nu există.';

/**
 * Ziua și intervalul unui slot, de exemplu „marți, 26 noiembrie, 10:00 – 12:00”.
 * @param {Object} slot
 * @return {string}
 */
function describeSlot(slot) {
  const day = fromIsoDate(slot.data);
  return (
    `${weekdayName(day).toLowerCase()}, ${formatDayMonth(day)}, ` +
    `${formatTime(slot.ora_start)} – ${formatTime(slot.ora_sfarsit)}`
  );
}

/**
 * Rezervarea cu id-ul dat, dintre rezervările utilizatorului, și sala ei.
 * Dacă rezervarea nu există sau nu se mai poate muta, întoarce mesajul.
 * Serverul verifică aceleași reguli la mutare.
 * @param {string} bookingId
 * @return {Promise<{booking: Object, facility: Object}|{error: string}>}
 */
async function loadReschedule(bookingId) {
  const bookings = await listMyBookings();
  const booking = bookings.find((item) => String(item.id) === bookingId);
  if (!booking) {
    return {error: NOT_FOUND_MESSAGE};
  }
  if (booking.stare !== 'confirmata') {
    return {
      error:
        'Rezervarea este anulată sau încheiată și nu mai poate fi reprogramată.',
    };
  }
  if (!canBeCancelled(booking.slot, new Date())) {
    return {
      error:
        'Rezervarea se poate reprograma cu cel puțin ' +
        `${CANCELLATION_NOTICE_HOURS} de ore înainte de începutul intervalului.`,
    };
  }
  const facility = await getFacility(booking.slot.facilitate_id);
  return {booking, facility};
}

/**
 * Calendarul sălii în care se alege intervalul nou, cu confirmarea mutării.
 * Pornește de la săptămâna rezervării.
 * @param {Object} props
 * @param {Object} props.booking
 * @param {Object} props.facility
 */
function RescheduleCalendar({booking, facility}) {
  const navigate = useNavigate();
  const {days, slots, isLoading, error, previousWeek, nextWeek, reload} =
    useWeekSlots(String(facility.id), fromIsoDate(booking.slot.data));
  const [selected, setSelected] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function handleSelect(slot) {
    setSelected(slot);
    setSaveError('');
  }

  async function handleConfirm() {
    setIsSaving(true);
    setSaveError('');
    try {
      await rescheduleBooking(booking.id, selected.id);
      navigate('/rezervari', {
        replace: true,
        state: {
          message: `Rezervarea a fost mutată pe ${describeSlot(selected)}.`,
        },
      });
    } catch (confirmError) {
      // De exemplu, altcineva a luat intervalul între timp: calendarul se
      // reîncarcă, ca să arate situația de acum.
      setSaveError(confirmError.message);
      setSelected(null);
      setIsSaving(false);
      reload();
    }
  }

  return (
    <main className="calendar-page">
      <div className="calendar-title">
        <h1>{facility.nume} – Reprogramare</h1>
        <p className="calendar-schedule">
          Muți rezervarea de {describeSlot(booking.slot)}.
        </p>
        <div className="calendar-subtitle">
          <p>
            Săptămâna {formatRange(days[0], days[days.length - 1])} · alege un
            interval liber din aceeași sală.{' '}
            <Link to="/rezervari">Renunță</Link>
          </p>
          <WeekNavigation onPrevious={previousWeek} onNext={nextWeek} />
        </div>
      </div>

      {saveError && (
        <p className="alert alert-error" role="alert">
          {saveError}
        </p>
      )}

      {selected && (
        <div className="reschedule-confirm">
          <p>
            Muți rezervarea pe <strong>{describeSlot(selected)}</strong>?
            Intervalul de acum devine liber.
          </p>
          <div className="reschedule-actions">
            <button
              type="button"
              className="button button-primary"
              disabled={isSaving}
              onClick={handleConfirm}
            >
              {isSaving ? 'Se mută…' : 'Confirmă mutarea'}
            </button>
            <button
              type="button"
              className="button booking-back"
              disabled={isSaving}
              onClick={() => setSelected(null)}
            >
              Alege alt interval
            </button>
          </div>
        </div>
      )}

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
        <WeekCalendar
          days={days}
          slots={slots}
          now={new Date()}
          onSelect={isSaving ? null : handleSelect}
          selectedSlotId={selected?.id ?? null}
          currentSlotId={booking.slot.id}
        />
      )}
    </main>
  );
}

/** Pagina de reprogramare a unei rezervări din „Rezervările mele”. */
export function ReschedulePage() {
  const {id} = useParams();
  const isValidId = VALID_ID.test(id);
  const [result, setResult] = useState({id: null});

  useEffect(() => {
    if (!isValidId) {
      return undefined;
    }
    let isCurrent = true;
    loadReschedule(id)
      .then((data) => isCurrent && setResult({id, ...data}))
      .catch((error) => isCurrent && setResult({id, error: error.message}));
    return () => {
      isCurrent = false;
    };
  }, [id, isValidId]);

  if (!isValidId || (result.id === id && result.error)) {
    return (
      <main className="calendar-page">
        <p className="alert alert-error" role="alert">
          {isValidId ? result.error : NOT_FOUND_MESSAGE}
        </p>
        <Link to="/rezervari">Înapoi la rezervările mele</Link>
      </main>
    );
  }
  if (result.id !== id) {
    return (
      <main className="calendar-page">
        <p className="empty-state">Se încarcă rezervarea…</p>
      </main>
    );
  }
  return (
    <RescheduleCalendar
      key={id}
      booking={result.booking}
      facility={result.facility}
    />
  );
}
