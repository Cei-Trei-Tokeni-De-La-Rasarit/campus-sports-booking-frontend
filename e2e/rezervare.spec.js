// Fluxul principal: catalog → calendar → rezervare → Rezervările mele →
// anulare, parcurs ca un student.
import {expect, test} from '@playwright/test';

import {ACCOUNTS, isoDateIn, logIn} from './helpers.js';

// Peste 3 zile, ca rezervarea să poată fi și anulată (minimum 24 de ore).
const DAY = isoDateIn(3);
const FACILITY = 'Teren baschet';
const SLOT = `Rezervă intervalul 8:00 – 10:00 din ${DAY}`;

/**
 * Deschide calendarul sălii din catalog și merge la săptămâna cu ziua DAY.
 * @param {import('@playwright/test').Page} page
 */
async function openCalendarOnDay(page) {
  await page.goto('/catalog');
  await page
    .getByRole('article')
    .filter({hasText: FACILITY})
    .getByRole('link', {name: 'Vezi calendar'})
    .click();
  await expect(
    page.getByRole('heading', {name: new RegExp(FACILITY)}),
  ).toBeVisible();
  // Ziua poate cădea în săptămâna următoare (de exemplu, vinerea).
  const slot = page.getByRole('link', {name: SLOT});
  await waitForWeek(page);
  if (!(await page.getByText(dayLabel(DAY), {exact: true}).isVisible())) {
    await page.getByRole('button', {name: /Săptămâna următoare/}).click();
    await waitForWeek(page);
  }
  return slot;
}

/**
 * Textul cu ziua din capul coloanei din calendar, de exemplu „25 noiembrie”.
 * @param {string} isoDate
 * @return {string}
 */
function dayLabel(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Așteaptă ca săptămâna afișată să se fi încărcat: intervalele sau mesajul
 * că nu există intervale. Fără asta, testul ar decide înainte de răspunsul
 * serverului.
 * @param {import('@playwright/test').Page} page
 */
async function waitForWeek(page) {
  await expect(page.getByText('Se încarcă intervalele…')).toHaveCount(0);
  await page
    .getByRole('table')
    .or(page.getByText('Nu există intervale în această săptămână.'))
    .first()
    .waitFor();
}

test('studentul rezervă un interval și apoi îl anulează', async ({page}) => {
  await logIn(page, ACCOUNTS.client);

  // Calendarul: intervalul e liber și duce la pagina de confirmare.
  const slot = await openCalendarOnDay(page);
  await slot.click();
  await expect(
    page.getByRole('heading', {name: 'Confirmă rezervarea'}),
  ).toBeVisible();

  // Regulamentul trebuie acceptat înainte de confirmare.
  const confirm = page.getByRole('button', {name: 'Confirmă rezervarea'});
  await expect(confirm).toBeDisabled();
  await page
    .getByLabel('Am citit și sunt de acord cu regulamentul sălii')
    .check();
  await confirm.click();
  await expect(
    page.getByRole('heading', {name: 'Rezervare confirmată'}),
  ).toBeVisible();

  // Rezervarea apare în „Rezervările mele”, ca viitoare și confirmată.
  await page.getByRole('link', {name: 'Vezi rezervările mele'}).click();
  const upcoming = page.getByRole('region', {name: 'Rezervări viitoare'});
  const booking = upcoming.getByRole('listitem').filter({hasText: FACILITY});
  await expect(booking).toContainText('8:00 – 10:00');
  await expect(booking).toContainText('Confirmată');

  // Anularea, cu confirmare: rezervarea trece în istoric ca „Anulată”.
  await booking.getByRole('button', {name: /Anulează/}).click();
  await booking.getByRole('button', {name: 'Da, anulează'}).click();
  await expect(page.getByRole('status')).toContainText(
    'Rezervarea a fost anulată.',
  );
  const history = page.getByRole('region', {name: 'Istoric rezervări'});
  await expect(
    history.getByRole('listitem').filter({hasText: FACILITY}),
  ).toContainText('Anulată');

  // Intervalul e din nou liber în calendar.
  await expect(await openCalendarOnDay(page)).toBeVisible();
});

test('un interval ocupat nu mai poate fi rezervat de altcineva', async ({
  page,
}) => {
  // Ana rezervă intervalul, apoi Mihai îl găsește ocupat.
  await logIn(page, ACCOUNTS.client);
  await (await openCalendarOnDay(page)).click();
  await page
    .getByLabel('Am citit și sunt de acord cu regulamentul sălii')
    .check();
  await page.getByRole('button', {name: 'Confirmă rezervarea'}).click();
  await expect(
    page.getByRole('heading', {name: 'Rezervare confirmată'}),
  ).toBeVisible();
  await page.getByRole('button', {name: 'Ieșire'}).click();

  await logIn(page, ACCOUNTS.otherClient);
  const slot = await openCalendarOnDay(page);

  await expect(slot).toHaveCount(0);
});
