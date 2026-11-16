import {Link, Navigate, useLocation} from 'react-router';

import {useAuth} from './AuthContext.jsx';

/**
 * Afișează pagina doar utilizatorilor autentificați și, dacă se cere, doar
 * celor cu unul dintre rolurile date. Ceilalți ajung la autentificare.
 * @param {Object} props
 * @param {Array<string>=} props.roles Rolurile permise (client, manager,
 *     administrator); lipsă = orice utilizator autentificat.
 * @param {React.ReactNode} props.children
 */
export function RequireAuth({roles, children}) {
  const {user, isChecking} = useAuth();
  const location = useLocation();

  if (isChecking) {
    return (
      <main className="page">
        <p className="empty-state">Se verifică autentificarea…</p>
      </main>
    );
  }
  if (!user) {
    return (
      <Navigate to="/autentificare" state={{from: location.pathname}} replace />
    );
  }
  if (roles && !roles.includes(user.rol)) {
    return (
      <main className="page">
        <p className="alert alert-error" role="alert">
          Nu ai acces la această pagină.
        </p>
        <Link to="/catalog">Înapoi la catalog</Link>
      </main>
    );
  }
  return children;
}
