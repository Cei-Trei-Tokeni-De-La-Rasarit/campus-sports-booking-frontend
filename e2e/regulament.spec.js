// Regulamentul sălii (KAN-68): managerul îl editează pentru sălile lui, iar
// administratorul pentru orice sală.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, logIn} from './helpers.js';

/**
 * Deschide pagina regulamentului din cardul sălii din „Facilități”.
 * @param {import('@playwright/test').Page} page
 * @param {string} facility Numele sălii.
 */
async function openRegulation(page, facility) {
  await page.getByRole('link', {name: 'Facilități'}).click();
  await page
    .getByRole('article')
    .filter({hasText: facility})
    .getByRole('link', {name: 'Regulament'})
    .click();
  await expect(
    page.getByRole('heading', {name: 'Regulamentul sălii'}),
  ).toBeVisible();
  await expect(page.getByText(facility)).toBeVisible();
}

test('managerul modifică regulamentul unei săli alocate', async ({page}) => {
  // Sala de tenis îi este alocată managerului în datele de demo.
  await logIn(page, ACCOUNTS.manager);
  await openRegulation(page, 'Sala de tenis Nr. 3');

  const text = page.getByLabel('Textul regulamentului');
  await expect(text).toHaveValue(/încălțăminte curată de sală/);

  const rules =
    '1. Accesul se face doar cu încălțăminte de sală.\n' +
    '2. Rachetele se returnează la recepție.';
  // Spațiile de la capete nu se salvează.
  await text.fill(`  ${rules}\n`);
  await page.getByRole('button', {name: 'Salvează regulamentul'}).click();
  await expect(page.getByText('Regulamentul a fost salvat.')).toBeVisible();

  // După reîncărcare, textul vine de la server.
  await page.reload();
  await expect(page.getByLabel('Textul regulamentului')).toHaveValue(rules);
});

test('regulamentul gol nu se trimite și eroarea apare lângă câmp', async ({
  page,
}) => {
  await logIn(page, ACCOUNTS.manager);
  await openRegulation(page, 'Teren sintetic 1');

  const text = page.getByLabel('Textul regulamentului');
  await text.fill('   \n  ');
  await page.getByRole('button', {name: 'Salvează regulamentul'}).click();

  await expect(page.getByText('Scrie textul regulamentului.')).toBeVisible();
  await expect(text).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Regulamentul a fost salvat.')).toHaveCount(0);
});

test('managerul primește eroarea serverului pe o sală nealocată', async ({
  page,
}) => {
  // Sala de fitness nu îi este alocată managerului.
  await logIn(page, ACCOUNTS.manager);
  await openRegulation(page, 'Sală fitness');

  await page.getByLabel('Textul regulamentului').fill('1. Regulă nouă.');
  await page.getByRole('button', {name: 'Salvează regulamentul'}).click();

  await expect(
    page.getByText('Poți modifica doar facilitățile alocate ție.'),
  ).toBeVisible();
  await expect(page.getByText('Regulamentul a fost salvat.')).toHaveCount(0);
});

test('administratorul scrie regulamentul unei săli fără regulament', async ({
  page,
}) => {
  // Bazinul nu are regulament în datele de demo.
  await logIn(page, ACCOUNTS.administrator);
  await openRegulation(page, 'Bazin didactic');

  await expect(
    page.getByText('Sala nu are încă un regulament.', {exact: false}),
  ).toBeVisible();
  const text = page.getByLabel('Textul regulamentului');
  await expect(text).toHaveValue('');

  await text.fill('1. Accesul în bazin se face doar cu cască.');
  await page.getByRole('button', {name: 'Salvează regulamentul'}).click();

  await expect(page.getByText('Regulamentul a fost salvat.')).toBeVisible();
  await expect(page.getByText('Sala nu are încă un regulament.')).toHaveCount(
    0,
  );
});
