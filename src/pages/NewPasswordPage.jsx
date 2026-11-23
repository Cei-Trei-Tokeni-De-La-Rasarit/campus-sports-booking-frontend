import {Link, useNavigate, useSearchParams} from 'react-router';

import {confirmPasswordReset} from '../api/authApi.js';
import {NewPasswordForm} from '../components/NewPasswordForm.jsx';

/**
 * Pagina „Parolă nouă”, deschisă din linkul primit pe email
 * (`/parola-noua?token=...`). După schimbare, utilizatorul ajunge la
 * autentificare, cu mesajul serverului.
 */
export function NewPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  async function handleSubmit(password) {
    const result = await confirmPasswordReset(token, password);
    navigate('/autentificare', {replace: true, state: {message: result.mesaj}});
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">Parolă nouă</h1>

        {token ? (
          <>
            <p className="auth-intro">Alege o parolă nouă pentru contul tău.</p>
            <NewPasswordForm onSubmit={handleSubmit} />
          </>
        ) : (
          // Linkul din email a fost copiat incomplet.
          <p className="alert alert-error" role="alert">
            Linkul pentru resetarea parolei nu este complet. Cere un link nou.
          </p>
        )}

        <Link to="/resetare-parola" className="auth-link">
          Cere un link nou
        </Link>
      </section>
    </main>
  );
}
