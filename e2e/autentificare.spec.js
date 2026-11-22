// Autentificarea, cu frontend-ul și backend-ul pornite împreună.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, DEMO_PASSWORD, logIn} from './helpers.js';

test('parola greșită afișează mesajul serverului', async ({page}) => {
  await page.goto('/autentificare');
  await page.getByLabel('E-mail instituțional').fill(ACCOUNTS.client);
  await page.getByLabel('Parolă').fill('parola-gresita');
  await page.getByRole('button', {name: 'Autentificare', exact: true}).click();

  await expect(page.getByRole('alert')).toHaveText(
    'Email sau parolă incorectă.',
  );
  await expect(page.getByRole('button', {name: 'Ieșire'})).toHaveCount(0);
});

test('autentificarea corectă arată numele utilizatorului', async ({page}) => {
  await logIn(page, ACCOUNTS.client);

  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByText('Ana Popescu')).toBeVisible();
});

test('o pagină cu cont trimite la autentificare și înapoi', async ({page}) => {
  await page.goto('/rezervari');

  await expect(page).toHaveURL(/\/autentificare$/);
  await page.getByLabel('E-mail instituțional').fill(ACCOUNTS.client);
  await page.getByLabel('Parolă').fill(DEMO_PASSWORD);
  await page.getByRole('button', {name: 'Autentificare', exact: true}).click();

  await expect(page).toHaveURL(/\/rezervari$/);
  await expect(
    page.getByRole('heading', {name: 'Rezervările mele'}),
  ).toBeVisible();
});

test('„Ieșire” scoate utilizatorul din cont', async ({page}) => {
  await logIn(page, ACCOUNTS.client);

  await page.getByRole('button', {name: 'Ieșire'}).click();

  await expect(page).toHaveURL(/\/catalog$/);
  await expect(
    page.getByRole('link', {name: 'Autentificare', exact: true}),
  ).toBeVisible();
});
