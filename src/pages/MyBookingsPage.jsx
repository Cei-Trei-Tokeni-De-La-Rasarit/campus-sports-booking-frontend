import {useEffect, useState} from 'react';
import {Link} from 'react-router';

import {listMyBookings} from '../api/bookingApi.js';
import {getFacility} from '../api/facilityApi.js';
import {
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
 * O rezervare din listă: sala, ziua, intervalul și starea.
 * @param {Object} props
 * @param {Object} props.booking
 * @param {?Object} props.facility
 */
function BookingItem({booking, facility}) {
  const {slot} = booking;
  const day = fromIsoDate(slot.data);
  const badge = STATUS_BADGES[booking.stare];
  return (
    <li className="my-booking">
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
 */
function BookingSection({title, bookings, facilities, empty}) {
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

  useEffect(() => {
    let isCurrent = true;
    loadBookings()
      .then((data) => isCurrent && setResult(data))
      .catch((error) => isCurrent && setResult({error: error.message}));
    return () => {
      isCurrent = false;
    };
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
      <BookingSection
        title="Rezervări viitoare"
        bookings={upcoming}
        facilities={result.facilities}
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
