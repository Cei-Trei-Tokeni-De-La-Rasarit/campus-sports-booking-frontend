import {useState} from 'react';

import {validatePassword} from '../utils/validation.js';

/**
 * Mesajul de eroare pentru confirmarea parolei sau '' dacă e corectă.
 * @param {string} password
 * @param {string} confirmation
 * @return {string}
 */
function validateConfirmation(password, confirmation) {
  if (!confirmation) {
    return 'Confirmă parola.';
  }
  if (confirmation !== password) {
    return 'Parolele nu coincid.';
  }
  return '';
}

/**
 * Formularul „Parolă nouă”: parola și confirmarea ei.
 * @param {Object} props
 * @param {function(string): Promise<void>} props.onSubmit Primește parola
 *     nouă; aruncă o eroare cu mesajul serverului dacă schimbarea eșuează.
 */
export function NewPasswordForm({onSubmit}) {
  const [values, setValues] = useState({parola: '', confirmare: ''});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const {name, value} = event.target;
    setValues((current) => ({...current, [name]: value}));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const newErrors = {
      parola: validatePassword(values.parola),
      confirmare: validateConfirmation(values.parola, values.confirmare),
    };
    setErrors(newErrors);
    setServerError('');
    if (newErrors.parola || newErrors.confirmare) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(values.parola);
    } catch (submitError) {
      setServerError(submitError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="auth-field">
        Parola nouă
        <input
          type="password"
          name="parola"
          autoComplete="new-password"
          value={values.parola}
          onChange={handleChange}
          aria-invalid={Boolean(errors.parola)}
        />
        {errors.parola ? (
          <span className="field-error">{errors.parola}</span>
        ) : (
          <span className="field-hint">Cel puțin 8 caractere.</span>
        )}
      </label>

      <label className="auth-field">
        Confirmă parola
        <input
          type="password"
          name="confirmare"
          autoComplete="new-password"
          value={values.confirmare}
          onChange={handleChange}
          aria-invalid={Boolean(errors.confirmare)}
        />
        {errors.confirmare && (
          <span className="field-error">{errors.confirmare}</span>
        )}
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
        {isSubmitting ? 'Se salvează…' : 'Schimbă parola'}
      </button>
    </form>
  );
}
