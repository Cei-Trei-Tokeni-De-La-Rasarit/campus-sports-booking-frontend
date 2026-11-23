// Accesul după rol la pagina de administrare a facilităților.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, logIn} from './helpers.js';

test('clientul nu are acces la pagina „Facilități”', async ({page}) => {
  await logIn(page, ACCOUNTS.client);

  await expect(page.getByRole('link', {name: 'Facilități'})).toHaveCount(0);
  await page.goto('/facilitati');
  await expect(page.getByText('Nu ai acces la această pagină.')).toBeVisible();
});

test('managerul editează, dar nu adaugă și nu șterge', async ({page}) => {
  await logIn(page, ACCOUNTS.manager);

  await page.getByRole('link', {name: 'Facilități'}).click();
  await expect(
    page.getByRole('button', {name: 'Editează'}).first(),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {name: 'Adaugă facilitate'}),
  ).toHaveCount(0);
  await expect(page.getByRole('button', {name: 'Șterge'})).toHaveCount(0);
});

test('administratorul vede toate sălile și poate adăuga și șterge', async ({
  page,
}) => {
  await logIn(page, ACCOUNTS.administrator);

  await page.getByRole('link', {name: 'Facilități'}).click();
  // Și sala în mentenanță, care nu apare în catalogul public.
  await expect(page.getByText('Bazin didactic')).toBeVisible();
  await expect(
    page.getByRole('button', {name: 'Adaugă facilitate'}),
  ).toBeVisible();
  await expect(page.getByRole('button', {name: 'Șterge'})).toHaveCount(5);
});
