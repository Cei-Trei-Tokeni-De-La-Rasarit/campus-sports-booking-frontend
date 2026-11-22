import {useEffect, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router';

import {
  NOTIFICATIONS_CHANGED,
  listNotifications,
} from '../api/notificationApi.js';
import bellIcon from '../assets/icons/bell.svg';
import {useAuth} from '../auth/AuthContext.jsx';

// Rolurile care văd pagina de administrare a facilităților.
const FACILITY_ADMIN_ROLES = ['manager', 'administrator'];

/**
 * Clopoțelul din bara de sus, cu numărul notificărilor necitite. Numărul se
 * recitește la fiecare schimbare de pagină și după marcarea unei notificări.
 * @param {Object} props
 * @param {number} props.userId Utilizatorul autentificat.
 */
function NotificationBell({userId}) {
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let isCurrent = true;
    function refresh() {
      listNotifications({unreadOnly: true, quiet: true})
        .then((items) => isCurrent && setUnread(items.length))
        // Clopoțelul nu e esențial: dacă cererea nu merge, nu arată numărul.
        .catch(() => isCurrent && setUnread(0));
    }
    refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => {
      isCurrent = false;
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
    };
  }, [userId, location.pathname]);

  const label = unread > 0 ? `Notificări (${unread} necitite)` : 'Notificări';
  return (
    <NavLink to="/notificari" className="header-bell" aria-label={label}>
      <img src={bellIcon} alt="" />
      {unread > 0 && (
        <span className="header-bell-count" aria-hidden="true">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </NavLink>
  );
}

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
            <NotificationBell userId={user.id} />
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
