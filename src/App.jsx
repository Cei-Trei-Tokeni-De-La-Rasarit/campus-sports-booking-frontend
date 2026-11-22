import {Navigate, Route, Routes} from 'react-router';

import {RequireAuth} from './auth/RequireAuth.jsx';
import {Header} from './components/Header.jsx';
import {BookingPage} from './pages/BookingPage.jsx';
import {CalendarPage} from './pages/CalendarPage.jsx';
import {CatalogPage} from './pages/CatalogPage.jsx';
import {FacilitiesPage} from './pages/FacilitiesPage.jsx';
import {LoginPage} from './pages/LoginPage.jsx';
import {MyBookingsPage} from './pages/MyBookingsPage.jsx';
import {NotificationsPage} from './pages/NotificationsPage.jsx';

// Rolurile care pot administra facilitățile.
const FACILITY_ADMIN_ROLES = ['manager', 'administrator'];

/** Rutele aplicației. */
export function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Pagina de start este catalogul. */}
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/autentificare" element={<LoginPage />} />
        <Route
          path="/rezervari"
          element={
            <RequireAuth>
              <MyBookingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/notificari"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/facilitati"
          element={
            <RequireAuth roles={FACILITY_ADMIN_ROLES}>
              <FacilitiesPage />
            </RequireAuth>
          }
        />
        <Route path="/facilitati/:id/calendar" element={<CalendarPage />} />
        <Route
          path="/facilitati/:id/rezervare/:slotId"
          element={
            <RequireAuth>
              <BookingPage />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}
