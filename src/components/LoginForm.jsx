import {useState} from 'react';
import {Link} from 'react-router';

import {validateEmail} from '../utils/validation.js';

/**
 * Formularul de autentificare cu email și parolă.
 * @param {Object} props
 * @param {function(string, string): Promise<void>} props.onSubmit Primește
 *     emailul și parola; aruncă o eroare cu mesajul serverului dacă eșuează.
 */
export function LoginForm({onSubmit}) {
  const [values, setValues] = useState({email: '', parola: ''});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const {name, value} = event.target;
    setValues((current) => ({...current, [name]: value}));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // La autentificare verificăm doar că parola e completată; regulile de
    // lungime le aplică serverul, ca să nu dăm indicii despre parolă.
    const newErrors = {
      email: validateEmail(values.email),
      parola: values.parola ? '' : 'Completează parola.',
    };
    setErrors(newErrors);
    setServerError('');
    if (newErrors.email || newErrors.parola) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(values.email.trim().toLowerCase(), values.parola);
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
          autoComplete="current-password"
          value={values.parola}
          onChange={handleChange}
          aria-invalid={Boolean(errors.parola)}
        />
        {errors.parola && <span className="field-error">{errors.parola}</span>}
      </label>
      <Link to="/resetare-parola" className="auth-forgot">
        Ai uitat parola?
      </Link>

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
        {isSubmitting ? 'Se verifică…' : 'Autentificare'}
      </button>
    </form>
  );
}
