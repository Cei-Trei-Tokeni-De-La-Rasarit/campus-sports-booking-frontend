// Reprogramarea din „Rezervările mele” (KAN-114): calendarul sălii, alegerea
// unui interval liber și confirmarea mutării.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, isoDateIn, logIn} from './helpers.js';

// În seed.sql, Mihai are o rezervare peste 2 zile, 16:00 – 18:00, la
// Teren sintetic 1 (sala cu id-ul 2).
const FACILITY = 'Teren sintetic 1';
const FACILITY_ID = 2;
const DAY = isoDateIn(2);

/**
 * Deschide reprogramarea rezervării de la FACILITY din „Rezervările mele”.
 * @param {import('@playwright/test').Page} page
 */
async function openReschedule(page) {
  await page.goto('/rezervari');
  await page
    .getByRole('region', {name: 'Rezervări viitoare'})
    .getByRole('listitem')
    .filter({hasText: FACILITY})
    .getByRole('link', {name: 'Reprogramează'})
    .click();
  await expect(
    page.getByRole('heading', {name: `${FACILITY} – Reprogramare`}),
  ).toBeVisible();
}

/**
 * Rezervarea lui Mihai din lista „Rezervări viitoare”.
 * @param {import('@playwright/test').Page} page
 * @return {import('@playwright/test').Locator}
 */
function upcomingBooking(page) {
  return page
    .getByRole('region', {name: 'Rezervări viitoare'})
    .getByRole('listitem')
    .filter({hasText: FACILITY});
}

test('studentul mută rezervarea pe alt interval din aceeași sală', async ({
  page,
}) => {
  await logIn(page, ACCOUNTS.otherClient);

  // „Renunță” se întoarce fără nicio schimbare.
  await openReschedule(page);
  await page.getByRole('link', {name: 'Renunță'}).click();
  await expect(page).toHaveURL(/\/rezervari$/);
  await expect(upcomingBooking(page)).toContainText('16:00 – 18:00');

  await openReschedule(page);
  await expect(page.getByText('Rezervarea ta')).toBeVisible();

  // Alegerea se poate schimba înainte de confirmare.
  const slot = page.getByRole('button', {
    name: `Alege intervalul 18:00 – 20:00 din ${DAY}`,
  });
  await slot.click();
  await expect(slot).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Muți rezervarea pe')).toBeVisible();
  await page.getByRole('button', {name: 'Alege alt interval'}).click();
  await expect(page.getByText('Muți rezervarea pe')).toHaveCount(0);

  await slot.click();
  await page.getByRole('button', {name: 'Confirmă mutarea'}).click();

  await expect(page).toHaveURL(/\/rezervari$/);
  await expect(page.getByRole('status')).toContainText(
    'Rezervarea a fost mutată pe',
  );
  await expect(upcomingBooking(page)).toContainText('18:00 – 20:00');
  await expect(upcomingBooking(page)).not.toContainText('16:00 – 18:00');
});

test('dacă intervalul ales e luat între timp, apare eroarea serverului', async ({
  page,
  browser,
}) => {
  await logIn(page, ACCOUNTS.otherClient);
  await openReschedule(page);
  const label = `12:00 – 14:00 din ${DAY}`;
  await page.getByRole('button', {name: `Alege intervalul ${label}`}).click();

  // Între timp, Ana rezervă același interval, din alt browser.
  const {baseURL, locale, timezoneId} = test.info().project.use;
  const otherContext = await browser.newContext({baseURL, locale, timezoneId});
  const ana = await otherContext.newPage();
  await logIn(ana, ACCOUNTS.client);
  await ana.goto(`/facilitati/${FACILITY_ID}/calendar`);
  const anaSlot = ana.getByRole('link', {name: `Rezervă intervalul ${label}`});
  await expect(ana.getByRole('table')).toBeVisible();
  // Ziua poate cădea în săptămâna următoare.
  if ((await anaSlot.count()) === 0) {
    await ana.getByRole('button', {name: /Săptămâna următoare/}).click();
  }
  await anaSlot.click();
  await ana
    .getByLabel('Am citit și sunt de acord cu regulamentul sălii')
    .check();
  await ana.getByRole('button', {name: 'Confirmă rezervarea'}).click();
  await expect(
    ana.getByRole('heading', {name: 'Rezervare confirmată'}),
  ).toBeVisible();

  // Mihai confirmă mutarea: serverul refuză, iar calendarul se reîncarcă.
  await page.getByRole('button', {name: 'Confirmă mutarea'}).click();
  await expect(page.getByRole('alert')).toHaveText('Slotul nu mai este liber.');
  await expect(page.getByText('Rezervarea ta')).toBeVisible();
  await expect(
    page.getByRole('button', {name: `Alege intervalul ${label}`}),
  ).toHaveCount(0);

  // Ana își anulează rezervarea, ca datele să rămână ca înainte.
  await ana.goto('/rezervari');
  const anaBooking = ana
    .getByRole('region', {name: 'Rezervări viitoare'})
    .getByRole('listitem')
    .filter({hasText: FACILITY});
  await anaBooking.getByRole('button', {name: /Anulează/}).click();
  await anaBooking.getByRole('button', {name: 'Da, anulează'}).click();
  await expect(ana.getByRole('status')).toContainText(
    'Rezervarea a fost anulată.',
  );
  await otherContext.close();
});

test('o rezervare care nu e a ta sau nu există nu se poate reprograma', async ({
  page,
}) => {
  await logIn(page, ACCOUNTS.otherClient);

  for (const id of ['999999', 'abc']) {
    await page.goto(`/rezervari/${id}/reprogramare`);
    await expect(page.getByRole('alert')).toHaveText('Rezervarea nu există.');
  }
  await page.getByRole('link', {name: 'Înapoi la rezervările mele'}).click();
  await expect(page).toHaveURL(/\/rezervari$/);
});
