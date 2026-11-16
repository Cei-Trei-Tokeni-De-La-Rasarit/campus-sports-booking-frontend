import {Route, Routes} from 'react-router';

import {Header} from './components/Header.jsx';
import {CalendarPage} from './pages/CalendarPage.jsx';
import {CatalogPage} from './pages/CatalogPage.jsx';
import {FacilitiesPage} from './pages/FacilitiesPage.jsx';
import {HomePage} from './pages/HomePage.jsx';

/** Rutele aplicației. */
export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/facilitati" element={<FacilitiesPage />} />
        <Route path="/facilitati/:id/calendar" element={<CalendarPage />} />
      </Routes>
    </>
  );
}
