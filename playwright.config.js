// Configurația testelor end-to-end (KAN-104): Playwright pornește backend-ul
// și frontend-ul pe porturi separate de cele de dezvoltare, apoi parcurge
// aplicația într-un browser real, ca un utilizator.
import {existsSync} from 'node:fs';
import path from 'node:path';

import {defineConfig, devices} from '@playwright/test';

const BACKEND_PORT = 8001;
const FRONTEND_PORT = 5174;

/**
 * Folderul backend-ului: variabila E2E_BACKEND_DIR sau, implicit, folderul
 * vecin cu frontend-ul (`../backend` sau `../campus-sports-booking-backend`).
 * @return {string}
 */
function backendDir() {
  if (process.env.E2E_BACKEND_DIR) {
    return path.resolve(process.env.E2E_BACKEND_DIR);
  }
  const candidates = ['../backend', '../campus-sports-booking-backend'].map(
    (folder) => path.resolve(folder),
  );
  const found = candidates.find((folder) => existsSync(folder));
  if (!found) {
    throw new Error(
      'Nu găsesc backend-ul. Setează E2E_BACKEND_DIR cu folderul lui.',
    );
  }
  return found;
}

const BACKEND_DIR = backendDir();
// Python-ul din mediul virtual al backend-ului (vezi README-ul backend-ului).
const PYTHON = path.join(
  BACKEND_DIR,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);

export default defineConfig({
  testDir: './e2e',
  // Testele folosesc aceeași bază de date, deci rulează pe rând.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    locale: 'ro-RO',
    timezoneId: 'Europe/Bucharest',
    trace: 'retain-on-failure',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: [
    {
      // Reîncarcă baza de test din seed.sql și pornește API-ul pe 8001.
      command: `"${PYTHON}" scripts/e2e_server.py`,
      cwd: BACKEND_DIR,
      url: `http://localhost:${BACKEND_PORT}/`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx vite --port ${FRONTEND_PORT} --strictPort`,
      url: `http://localhost:${FRONTEND_PORT}`,
      env: {VITE_API_URL: `http://localhost:${BACKEND_PORT}`},
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
});
