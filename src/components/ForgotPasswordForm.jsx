import {useState} from 'react';

import {validateEmail} from '../utils/validation.js';

/**
 * Formularul „Ai uitat parola?”: adresa de email la care vine linkul.
 * @param {Object} props
 * @param {function(string): Promise<void>} props.onSubmit Primește adresa;
 *     aruncă o eroare cu mesajul serverului dacă cererea eșuează.
 */
export function ForgotPasswordForm({onSubmit}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const newError = validateEmail(email);
    setError(newError);
    setServerError('');
    if (newError) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(email.trim().toLowerCase());
    } catch (submitError) {
      setServerError(submitError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="auth-field">
        E-mail instituțional
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nume.prenume@student.usv.ro"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error && <span className="field-error">{error}</span>}
      </label>

      {serverError && (
        <p className="alert alert-error" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        className="button button-primary auth-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Se trimite…' : 'Trimite linkul'}
      </button>
    </form>
  );
}
