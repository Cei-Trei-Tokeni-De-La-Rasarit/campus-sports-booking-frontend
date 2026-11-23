import {useState} from 'react';
import {Link} from 'react-router';

// Lungimea maximă a regulamentului, aceeași ca în backend (KAN-110).
const MAX_REGULATION_LENGTH = 5000;

/**
 * Mesajul de eroare pentru textul regulamentului sau '' dacă e valid.
 * Spațiile de la capete nu se numără, ca în backend.
 * @param {string} text
 * @return {string}
 */
function validateRegulation(text) {
  const length = text.trim().length;
  if (length === 0) {
    return 'Scrie textul regulamentului.';
  }
  if (length > MAX_REGULATION_LENGTH) {
    return (
      `Regulamentul poate avea cel mult ${MAX_REGULATION_LENGTH} de ` +
      `caractere (acum are ${length}).`
    );
  }
  return '';
}

/**
 * Formularul de editare a regulamentului unei săli.
 * @param {Object} props
 * @param {string} props.initialText Regulamentul actual sau '' dacă sala
 *     nu are încă unul.
 * @param {boolean} props.isSaving Dacă cererea de salvare este în curs.
 * @param {function(string): void} props.onSubmit Primește textul, fără
 *     spațiile de la capete.
 */
export function RegulationForm({initialText, isSaving, onSubmit}) {
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');

  function handleChange(event) {
    setText(event.target.value);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newError = validateRegulation(text);
    setError(newError);
    if (!newError) {
      onSubmit(text.trim());
    }
  }

  return (
    <form className="card regulation-form" onSubmit={handleSubmit} noValidate>
      {/* Indicația și eroarea stau în afara etichetei, ca numărul de
          caractere să nu facă parte din numele câmpului. */}
      <div className="field">
        <label htmlFor="regulation-text">Textul regulamentului</label>
        <textarea
          id="regulation-text"
          name="text"
          rows={12}
          value={text}
          onChange={handleChange}
          placeholder="1. Accesul este permis doar cu încălțăminte de sală."
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? 'regulation-error regulation-hint' : 'regulation-hint'
          }
        />
        {error && (
          <span id="regulation-error" className="field-error">
            {error}
          </span>
        )}
        <span id="regulation-hint" className="field-hint">
          Fiecare regulă pe un rând nou. {text.trim().length} /{' '}
          {MAX_REGULATION_LENGTH} caractere.
        </span>
      </div>

      <div className="form-actions">
        <Link to="/facilitati" className="button button-secondary">
          Înapoi la facilități
        </Link>
        <button
          type="submit"
          className="button button-primary"
          disabled={isSaving}
        >
          {isSaving ? 'Se salvează…' : 'Salvează regulamentul'}
        </button>
      </div>
    </form>
  );
}
