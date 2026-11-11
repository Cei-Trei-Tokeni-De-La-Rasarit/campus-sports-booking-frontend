import {Route, Routes} from 'react-router';

import {Header} from './components/Header.jsx';
import {FacilitiesPage} from './pages/FacilitiesPage.jsx';
import {HomePage} from './pages/HomePage.jsx';

/** Rutele aplicației. */
export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facilitati" element={<FacilitiesPage />} />
      </Routes>
    </>
  );
}
