import {useState} from 'react';

import {
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation.js';

/**
 * Formularul pentru crearea unui cont nou.
 * @param {Object} props
 * @param {function({nume: string, email: string, parola: string}):
 *     Promise<void>} props.onSubmit Aruncă o eroare cu mesajul serverului
 *     dacă eșuează (de exemplu, email deja folosit).
 */
export function RegisterForm({onSubmit}) {
  const [values, setValues] = useState({nume: '', email: '', parola: ''});
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
      nume: validateName(values.nume),
      email: validateEmail(values.email),
      parola: validatePassword(values.parola),
    };
    setErrors(newErrors);
    setServerError('');
    if (newErrors.nume || newErrors.email || newErrors.parola) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        nume: values.nume.trim(),
        email: values.email.trim().toLowerCase(),
        parola: values.parola,
      });
    } catch (submitError) {
      setServerError(submitError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label className="auth-field">
        Nume și prenume
        <input
          type="text"
          name="nume"
          autoComplete="name"
          maxLength={100}
          value={values.nume}
          onChange={handleChange}
          aria-invalid={Boolean(errors.nume)}
        />
        {errors.nume && <span className="field-error">{errors.nume}</span>}
      </label>

      <label className="auth-field">
        E-mail instituțional
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nume.prenume@student.usv.ro"
          value={values.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </label>

      <label className="auth-field">
        Parolă
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
        {isSubmitting ? 'Se creează contul…' : 'Creează contul'}
      </button>
    </form>
  );
}
