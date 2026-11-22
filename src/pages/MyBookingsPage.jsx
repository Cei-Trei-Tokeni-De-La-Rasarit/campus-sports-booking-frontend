import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router';

import {cancelBooking, listMyBookings} from '../api/bookingApi.js';
import {getFacility} from '../api/facilityApi.js';
import {
  CANCELLATION_NOTICE_HOURS,
  canBeCancelled,
  formatDayMonth,
  formatTime,
  fromIsoDate,
  weekdayName,
} from '../utils/week.js';

// Eticheta și culoarea fiecărei stări primite de la API.
const STATUS_BADGES = {
  confirmata: {label: 'Confirmată', className: 'availability-free'},
  finalizata: {label: 'Finalizată', className: 'availability-done'},
  anulata: {label: 'Anulată', className: 'availability-busy'},
};

/**
 * Încarcă rezervările și numele sălilor lor. O rezervare are doar id-ul
 * sălii, așa că cerem o singură dată fiecare sală.
 * @return {Promise<{bookings: Array<Object>, facilities: Map}>}
 */
async function loadBookings() {
  const bookings = await listMyBookings();
  const ids = [
    ...new Set(bookings.map((booking) => booking.slot.facilitate_id)),
  ];
  const facilities = await Promise.all(ids.map((id) => getFacility(id)));
  return {
    bookings,
    facilities: new Map(facilities.map((facility) => [facility.id, facility])),
  };
}

/**
 * Butoanele de anulare ale unei rezervări viitoare: întâi „Anulează”, apoi
 * confirmarea. Dacă au rămas mai puțin de 24 de ore, doar un text explicativ.
 * @param {Object} props
 * @param {Object} props.booking
 * @param {function(number): Promise<void>} props.onCancel
 */
function CancelActions({booking, onCancel}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState(null);

  if (!canBeCancelled(booking.slot, new Date())) {
    return (
      <p className="my-booking-hint">
        Se poate anula până cu {CANCELLATION_NOTICE_HOURS} de ore înainte.
      </p>
    );
  }

  /** Trimite anularea; la eroare, mesajul serverului rămâne lângă butoane. */
  async function handleConfirm() {
    setIsCancelling(true);
    setError(null);
    try {
      await onCancel(booking.id);
    } catch (cancelError) {
      setError(cancelError.message);
      setIsCancelling(false);
      setIsConfirming(false);
    }
  }

  return (
    <>
      {isConfirming ? (
        <div className="my-booking-actions">
          <span className="my-booking-question">Sigur anulezi rezervarea?</span>
          <button
            type="button"
            className="button button-danger"
            disabled={isCancelling}
            onClick={handleConfirm}
          >
            {isCancelling ? 'Se anulează…' : 'Da, anulează'}
          </button>
          <button
            type="button"
            className="button booking-back"
            disabled={isCancelling}
            onClick={() => setIsConfirming(false)}
          >
            Renunță
          </button>
        </div>
      ) : (
        <div className="my-booking-actions">
          <button
            type="button"
            className="button booking-back"
            onClick={() => setIsConfirming(true)}
          >
            Anulează (min. {CANCELLATION_NOTICE_HOURS} h înainte)
          </button>
        </div>
      )}
      {error && (
        <p className="my-booking-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

/**
 * O rezervare din listă: sala, ziua, intervalul și starea; rezervările
 * viitoare au și butonul de anulare.
 * @param {Object} props
 * @param {Object} props.booking
 * @param {?Object} props.facility
 * @param {?function(number): Promise<void>} props.onCancel
 */
function BookingItem({booking, facility, onCancel}) {
  const {slot} = booking;
  const day = fromIsoDate(slot.data);
  const badge = STATUS_BADGES[booking.stare];
  return (
    <li className="my-booking">
      <div className="my-booking-row">
        <span className="my-booking-text">
          <Link to={`/facilitati/${slot.facilitate_id}/calendar`}>
            {facility?.nume ?? 'Sală'}
          </Link>
          {'  |  '}
          {weekdayName(day)}, {formatDayMonth(day)}
          {'  |  '}
          {formatTime(slot.ora_start)} – {formatTime(slot.ora_sfarsit)}
        </span>
        <span className={`availability ${badge.className}`}>{badge.label}</span>
      </div>
      {onCancel && <CancelActions booking={booking} onCancel={onCancel} />}
    </li>
  );
}

/**
 * O secțiune a paginii, cu lista ei de rezervări sau un mesaj când e goală.
 * @param {Object} props
 * @param {string} props.title
 * @param {Array<Object>} props.bookings
 * @param {Map} props.facilities
 * @param {React.ReactNode} props.empty
 * @param {?function(number): Promise<void>} props.onCancel Doar pentru
 *     rezervările care se pot anula.
 */
function BookingSection({title, bookings, facilities, empty, onCancel}) {
  return (
    <section className="my-bookings-section" aria-label={title}>
      <h2>{title}</h2>
      {bookings.length === 0 ? (
        <p className="empty-state">{empty}</p>
      ) : (
        <ul className="my-booking-list">
          {bookings.map((booking) => (
            <BookingItem
              key={booking.id}
              booking={booking}
              facility={facilities.get(booking.slot.facilitate_id)}
              onCancel={onCancel}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Pagina „Rezervările mele”: rezervările viitoare și istoricul. */
export function MyBookingsPage() {
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    loadBookings()
      .then((data) => isCurrent && setResult(data))
      .catch((error) => isCurrent && setResult({error: error.message}));
    return () => {
      isCurrent = false;
    };
  }, []);

  // După anulare, lista se reîncarcă de la server: rezervarea trece în
  // istoric cu starea „Anulată”.
  const handleCancel = useCallback(async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      setNotice('Rezervarea a fost anulată. Intervalul este din nou liber.');
    } catch (error) {
      // 409: rezervarea fusese deja anulată (de exemplu, din alt tab), deci
      // doar reîncărcăm lista. Celelalte erori rămân lângă butoane.
      if (error.status !== 409) {
        throw error;
      }
      setNotice('Rezervarea fusese deja anulată.');
    }
    try {
      setResult(await loadBookings());
    } catch (error) {
      setResult({error: error.message});
    }
  }, []);

  if (!result) {
    return (
      <main className="my-bookings-page">
        <h1>Rezervările mele</h1>
        <p className="empty-state">Se încarcă rezervările…</p>
      </main>
    );
  }
  if (result.error) {
    return (
      <main className="my-bookings-page">
        <h1>Rezervările mele</h1>
        <p className="alert alert-error" role="alert">
          {result.error}
        </p>
      </main>
    );
  }

  const upcoming = result.bookings.filter(
    (booking) => booking.stare === 'confirmata',
  );
  // Istoricul începe cu cele mai recente rezervări.
  const history = result.bookings
    .filter((booking) => booking.stare !== 'confirmata')
    .reverse();

  return (
    <main className="my-bookings-page">
      <h1>Rezervările mele</h1>
      {notice && (
        <p className="alert alert-success" role="status">
          {notice}
        </p>
      )}
      <BookingSection
        title="Rezervări viitoare"
        bookings={upcoming}
        facilities={result.facilities}
        onCancel={handleCancel}
        empty={
          <>
            Nu ai rezervări viitoare.{' '}
            <Link to="/catalog">Alege o sală din catalog</Link>.
          </>
        }
      />
      <BookingSection
        title="Istoric rezervări"
        bookings={history}
        facilities={result.facilities}
        empty="Nu ai încă rezervări încheiate sau anulate."
      />
    </main>
  );
}
