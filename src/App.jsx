import {Route, Routes} from 'react-router';

import {HomePage} from './pages/HomePage.jsx';

/** Rutele aplicației. */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
