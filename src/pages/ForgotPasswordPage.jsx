import {useState} from 'react';
import {Link} from 'react-router';

import {requestPasswordReset} from '../api/authApi.js';
import {ForgotPasswordForm} from '../components/ForgotPasswordForm.jsx';

/** Pagina „Ai uitat parola?”: cere pe email un link pentru o parolă nouă. */
export function ForgotPasswordPage() {
  // Mesajul serverului după trimitere; e același pentru orice adresă.
  const [sentMessage, setSentMessage] = useState('');

  async function handleSubmit(email) {
    const result = await requestPasswordReset(email);
    setSentMessage(result.mesaj);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">Ai uitat parola?</h1>

        {sentMessage ? (
          <p className="alert alert-success" role="status">
            {sentMessage}
          </p>
        ) : (
          <>
            <p className="auth-intro">
              Scrie adresa contului tău și îți trimitem pe email un link pentru
              o parolă nouă.
            </p>
            <ForgotPasswordForm onSubmit={handleSubmit} />
          </>
        )}

        <Link to="/autentificare" className="auth-link">
          Înapoi la autentificare
        </Link>
      </section>
    </main>
  );
}
