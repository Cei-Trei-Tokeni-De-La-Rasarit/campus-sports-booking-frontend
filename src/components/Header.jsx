import {NavLink} from 'react-router';

/** Bara de navigare din partea de sus a aplicației. */
export function Header() {
  return (
    <header className="header">
      <span className="header-logo">CAMPUS SPORT</span>
      <nav className="header-nav">
        <NavLink to="/facilitati" className="header-link">
          Facilități
        </NavLink>
      </nav>
    </header>
  );
}
