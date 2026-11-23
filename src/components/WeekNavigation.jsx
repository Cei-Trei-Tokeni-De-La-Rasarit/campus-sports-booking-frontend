/**
 * Butoanele pentru săptămâna anterioară și cea următoare din calendar.
 * @param {Object} props
 * @param {function(): void} props.onPrevious
 * @param {function(): void} props.onNext
 */
export function WeekNavigation({onPrevious, onNext}) {
  return (
    <div className="calendar-week-nav">
      <button
        type="button"
        className="button button-secondary"
        onClick={onPrevious}
      >
        ← Săptămâna anterioară
      </button>
      <button
        type="button"
        className="button button-secondary"
        onClick={onNext}
      >
        Săptămâna următoare →
      </button>
    </div>
  );
}
