import {NavLink, useNavigate} from 'react-router';

import {useAuth} from '../auth/AuthContext.jsx';

// Rolurile care văd pagina de administrare a facilităților.
const FACILITY_ADMIN_ROLES = ['manager', 'administrator'];

/** Bara de navigare din partea de sus a aplicației. */
export function Header() {
  const {user, signOut} = useAuth();
  const navigate = useNavigate();

  // După ieșire, utilizatorul ajunge în catalog, care nu cere cont.
  function handleSignOut() {
    signOut();
    navigate('/catalog');
  }

  return (
    <header className="header">
      <span className="header-logo">CAMPUS SPORT</span>
      <nav className="header-nav">
        <NavLink to="/catalog" className="header-link">
          Catalog
        </NavLink>
        {user && (
          <NavLink to="/rezervari" className="header-link">
            Rezervările mele
          </NavLink>
        )}
        {user && FACILITY_ADMIN_ROLES.includes(user.rol) && (
          // end: nu marca „Facilități” activ și pe paginile de calendar.
          <NavLink to="/facilitati" end className="header-link">
            Facilități
          </NavLink>
        )}
      </nav>

      <div className="header-account">
        {user ? (
          <>
            <span className="header-user">{user.nume}</span>
            <button
              type="button"
              className="header-button"
              onClick={handleSignOut}
            >
              Ieșire
            </button>
          </>
        ) : (
          <NavLink to="/autentificare" className="header-link">
            Autentificare
          </NavLink>
        )}
      </div>
    </header>
  );
}
