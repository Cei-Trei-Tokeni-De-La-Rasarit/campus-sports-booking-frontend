// Programul pe zile al unei săli (KAN-108): editarea lui în pagina
// „Facilități” și afișarea grupată în pagina de administrare și în catalog.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, logIn} from './helpers.js';

/**
 * Deschide formularul de editare al sălii din pagina „Facilități”.
 * @param {import('@playwright/test').Page} page
 * @param {string} facility Numele sălii.
 */
async function openEditForm(page, facility) {
  await page.getByRole('link', {name: 'Facilități'}).click();
  await page
    .getByRole('article')
    .filter({hasText: facility})
    .getByRole('button', {name: 'Editează'})
    .click();
  await expect(
    page.getByRole('heading', {name: 'Editează facilitatea'}),
  ).toBeVisible();
}

test('programul greșit nu se trimite și eroarea apare lângă zi', async ({
  page,
}) => {
  await logIn(page, ACCOUNTS.manager);
  await openEditForm(page, 'Sala de tenis Nr. 3');

  // 08:00 – 13:00 nu se împarte în intervale de 120 de minute.
  await page.getByLabel('Ora de închidere, Luni').fill('13:00');
  await page.getByRole('button', {name: 'Salvează'}).click();

  await expect(
    page.getByText(
      'Intervalul 08:00 – 13:00 nu se împarte exact în intervale de 120 de minute.',
    ),
  ).toBeVisible();
  await expect(page.getByLabel('Ora de închidere, Luni')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  // Formularul rămâne deschis, fără mesaj de succes.
  await expect(page.getByText('a fost modificată')).toHaveCount(0);
});

test('programul salvat apare grupat pe card și în catalog', async ({page}) => {
  // Sala de fitness nu are rezervări în datele de demo.
  const facility = 'Sală fitness';
  const weekdays = 'Luni – Vineri 08:00 – 20:00';
  await logIn(page, ACCOUNTS.administrator);
  await openEditForm(page, facility);

  await page.getByRole('checkbox', {name: 'Sâmbătă'}).uncheck();
  await page.getByRole('checkbox', {name: 'Duminică'}).uncheck();
  await page.getByRole('button', {name: 'Salvează'}).click();

  await expect(
    page.getByText(`Facilitatea „${facility}” a fost modificată.`),
  ).toBeVisible();
  await expect(
    page.getByRole('article').filter({hasText: facility}),
  ).toContainText(weekdays);

  await page.goto('/catalog');
  await expect(
    page.getByRole('article').filter({hasText: facility}),
  ).toContainText(`Program: ${weekdays}`);
});
