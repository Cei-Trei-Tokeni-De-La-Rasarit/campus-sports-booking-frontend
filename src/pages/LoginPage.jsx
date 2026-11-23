import {useState} from 'react';
import {Navigate, useLocation, useNavigate} from 'react-router';

import {useAuth} from '../auth/AuthContext.jsx';
import {LoginForm} from '../components/LoginForm.jsx';
import {RegisterForm} from '../components/RegisterForm.jsx';

const TABS = [
  {id: 'login', label: 'Autentificare'},
  {id: 'register', label: 'Cont nou'},
];

/** Pagina de autentificare, cu tab-urile „Autentificare” și „Cont nou”. */
export function LoginPage() {
  const {user, sessionExpired, signIn, signUp} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState('login');
  // Pagina de unde a fost trimis utilizatorul, ca să se întoarcă acolo.
  const destination = location.state?.from ?? '/catalog';
  // Mesajul de la pagina care a trimis aici (de exemplu, parola schimbată).
  const message = location.state?.message ?? '';

  if (user) {
    return <Navigate to={destination} replace />;
  }

  async function handleLogin(email, password) {
    await signIn(email, password);
    navigate(destination, {replace: true});
  }

  async function handleRegister(account) {
    await signUp(account);
    navigate(destination, {replace: true});
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <h1 id="auth-title">Autentificare în Campus</h1>

        {sessionExpired && (
          <p className="alert alert-info" role="status">
            Sesiunea a expirat. Autentifică-te din nou.
          </p>
        )}
        {message && (
          <p className="alert alert-success" role="status">
            {message}
          </p>
        )}

        <div className="auth-tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              className="auth-tab"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'login' ? (
            <LoginForm onSubmit={handleLogin} />
          ) : (
            <RegisterForm onSubmit={handleRegister} />
          )}
        </div>
      </section>
    </main>
  );
}
