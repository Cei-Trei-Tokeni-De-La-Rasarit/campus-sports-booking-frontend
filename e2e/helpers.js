// Funcții comune pentru testele end-to-end.
import {expect} from '@playwright/test';

// Conturile din app/database/seed.sql (backend). Parola de demo e aceeași
// pentru toate și e scrisă în comentariul de la începutul seed.sql.
export const ACCOUNTS = {
  client: 'ana.popescu@student.usv.ro',
  otherClient: 'mihai.ionescu@student.usv.ro',
  manager: 'manager.demo@usv.ro',
  administrator: 'admin.demo@usv.ro',
};
export const DEMO_PASSWORD = 'Demo-Campus-2026';

/**
 * Se autentifică din pagina „Autentificare”, ca un utilizator.
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 */
export async function logIn(page, email) {
  await page.goto('/autentificare');
  await page.getByLabel('E-mail instituțional').fill(email);
  await page.getByLabel('Parolă').fill(DEMO_PASSWORD);
  await page.getByRole('button', {name: 'Autentificare', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Ieșire'})).toBeVisible();
}

/**
 * Data de peste `days` zile, în formatul din API (AAAA-LL-ZZ), după ora
 * României (aceeași zi ca CURRENT_DATE din seed.sql).
 * @param {number} days
 * @return {string}
 */
export function isoDateIn(days) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString('sv-SE', {timeZone: 'Europe/Bucharest'});
}
