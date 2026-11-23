// Sloturile unei săli pe săptămâni, comune calendarului și reprogramării.
import {useEffect, useState} from 'react';

import {listSlots} from '../api/facilityApi.js';
import {addDays, startOfWeek, toIsoDate} from '../utils/week.js';

// Zilele lucrătoare se văd mereu; sâmbăta și duminica doar dacă au sloturi.
const WORK_DAYS = 5;
const WEEK_DAYS = 7;

/**
 * Încarcă sloturile unei săli pentru săptămâna afișată și permite trecerea
 * la săptămâna anterioară sau următoare.
 * @param {?string} facilityId Id-ul sălii; null = nu se trimite nicio cerere.
 * @param {Date=} firstDay O zi din prima săptămână afișată (implicit azi).
 * @return {{days: Array<Date>, slots: Array<Object>, isLoading: boolean,
 *     error: ?string, previousWeek: function(): void,
 *     nextWeek: function(): void, reload: function(): void}}
 */
export function useWeekSlots(facilityId, firstDay = new Date()) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(firstDay));
  // Crește la fiecare reîncărcare cerută, ca să se trimită din nou cererea.
  const [version, setVersion] = useState(0);
  // Sloturile ultimei cereri, împreună cu cererea pentru care au venit.
  const [result, setResult] = useState({query: null});

  const from = toIsoDate(weekStart);
  const to = toIsoDate(addDays(weekStart, WEEK_DAYS - 1));
  const query = `${facilityId}|${from}|${to}|${version}`;

  useEffect(() => {
    if (!facilityId) {
      return undefined;
    }
    let isCurrent = true;
    const [id, firstDate, lastDate] = query.split('|');
    listSlots(id, firstDate, lastDate)
      .then((slots) => isCurrent && setResult({query, slots}))
      .catch(
        (loadError) =>
          isCurrent && setResult({query, error: loadError.message}),
      );
    return () => {
      isCurrent = false;
    };
  }, [query, facilityId]);

  const isLoading = result.query !== query;
  const slots = result.slots ?? [];
  const hasWeekend = slots.some(
    (slot) => slot.data > toIsoDate(addDays(weekStart, WORK_DAYS - 1)),
  );
  const days = Array.from(
    {length: hasWeekend ? WEEK_DAYS : WORK_DAYS},
    (_, i) => addDays(weekStart, i),
  );

  return {
    days,
    slots,
    isLoading,
    error: isLoading ? null : (result.error ?? null),
    previousWeek: () => setWeekStart(addDays(weekStart, -WEEK_DAYS)),
    nextWeek: () => setWeekStart(addDays(weekStart, WEEK_DAYS)),
    reload: () => setVersion((current) => current + 1),
  };
}
