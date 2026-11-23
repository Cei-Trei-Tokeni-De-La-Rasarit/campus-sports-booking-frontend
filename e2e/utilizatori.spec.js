// Utilizatori și roluri (KAN-70): lista administratorului, filtrele,
// schimbarea rolului și alocarea sălilor pentru manageri.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, logIn} from './helpers.js';

/**
 * Deschide pagina „Utilizatori” din meniu, ca administrator.
 * @param {import('@playwright/test').Page} page
 */
async function openUsers(page) {
  await logIn(page, ACCOUNTS.administrator);
  await page.getByRole('link', {name: 'Utilizatori'}).click();
  await expect(
    page.getByRole('heading', {name: 'Utilizatori și roluri'}),
  ).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
}

/**
 * Rândul unui utilizator din tabel.
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @return {import('@playwright/test').Locator}
 */
function userRow(page, email) {
  return page.getByRole('row').filter({hasText: email});
}

/**
 * Schimbă rolul unui utilizator din formular.
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} role Valoarea din listă: client, manager, administrator.
 * @param {Array<string>} facilities Sălile bifate pentru manager.
 */
async function changeRole(page, email, role, facilities = []) {
  await userRow(page, email)
    .getByRole('button', {name: 'Schimbă rolul'})
    .click();
  await page.getByLabel('Rol', {exact: true}).selectOption(role);
  for (const facility of facilities) {
    await page.getByRole('checkbox', {name: facility}).check();
  }
  await page.getByRole('button', {name: 'Salvează rolul'}).click();
}

test('administratorul vede utilizatorii și îi filtrează', async ({page}) => {
  await openUsers(page);

  // Antetul și cei 4 utilizatori din datele de demo.
  await expect(page.getByRole('row')).toHaveCount(5);
  await expect(userRow(page, ACCOUNTS.manager)).toContainText(
    'Sala de tenis Nr. 3, Teren sintetic 1',
  );
  // Propriul rol nu se poate schimba.
  const ownRow = userRow(page, ACCOUNTS.administrator);
  await expect(ownRow).toContainText('Contul tău');
  await expect(ownRow.getByRole('button')).toHaveCount(0);

  await page.getByLabel('Rol:').selectOption('manager');
  await expect(page.getByRole('row')).toHaveCount(2);
  await expect(userRow(page, ACCOUNTS.manager)).toBeVisible();

  await page.getByLabel('Rol:').selectOption('');
  await page.getByLabel('Caută:').fill('ionescu');
  await expect(page.getByRole('row')).toHaveCount(2);
  await expect(userRow(page, ACCOUNTS.otherClient)).toBeVisible();

  await page.getByLabel('Caută:').fill('nimeni');
  await expect(
    page.getByText('Niciun utilizator nu corespunde filtrelor.'),
  ).toBeVisible();
});

test('un client devine manager pe o sală, apoi din nou client', async ({
  page,
}) => {
  await openUsers(page);

  // „Renunță” închide formularul fără schimbări.
  await userRow(page, ACCOUNTS.otherClient)
    .getByRole('button', {name: 'Schimbă rolul'})
    .click();
  await expect(
    page.getByRole('heading', {name: 'Schimbă rolul: Mihai Ionescu'}),
  ).toBeVisible();
  await page.getByRole('button', {name: 'Renunță'}).click();
  await expect(page.getByRole('heading', {name: /Schimbă rolul/})).toHaveCount(
    0,
  );

  await changeRole(page, ACCOUNTS.otherClient, 'manager', ['Sală fitness']);
  await expect(page.getByRole('status')).toHaveText(
    'Mihai Ionescu are acum rolul manager.',
  );
  const row = userRow(page, ACCOUNTS.otherClient);
  await expect(row).toContainText('Manager');
  await expect(row).toContainText('Sală fitness');

  // Cu rolul nou, Mihai vede pagina „Facilități”.
  await page.getByRole('button', {name: 'Ieșire'}).click();
  await logIn(page, ACCOUNTS.otherClient);
  await expect(page.getByRole('link', {name: 'Facilități'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Utilizatori'})).toHaveCount(0);

  // Înapoi la client: sălile alocate dispar.
  await page.getByRole('button', {name: 'Ieșire'}).click();
  await openUsers(page);
  await changeRole(page, ACCOUNTS.otherClient, 'client');
  await expect(page.getByRole('status')).toHaveText(
    'Mihai Ionescu are acum rolul client.',
  );
  await expect(userRow(page, ACCOUNTS.otherClient)).toContainText('Client');
  await expect(userRow(page, ACCOUNTS.otherClient)).not.toContainText(
    'Sală fitness',
  );
});

test('clientul și managerul nu au acces la pagina „Utilizatori”', async ({
  page,
}) => {
  for (const account of [ACCOUNTS.client, ACCOUNTS.manager]) {
    await logIn(page, account);
    await expect(page.getByRole('link', {name: 'Utilizatori'})).toHaveCount(0);
    await page.goto('/utilizatori');
    await expect(
      page.getByText('Nu ai acces la această pagină.'),
    ).toBeVisible();
    await page.getByRole('button', {name: 'Ieșire'}).click();
  }
});
