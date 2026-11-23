// Resetarea parolei (KAN-112): paginile „Ai uitat parola?” și „Parolă nouă”.
// Linkul adevărat vine pe email, deci testele folosesc un token greșit;
// fluxul complet se verifică manual, cu linkul din logul serverului.
import {expect, test} from '@playwright/test';

import {ACCOUNTS} from './helpers.js';

const SENT_MESSAGE =
  'Dacă există un cont cu această adresă, vei primi pe email un link ' +
  'pentru resetarea parolei.';

/**
 * Trimite formularul „Ai uitat parola?” cu adresa dată.
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 */
async function requestLink(page, email) {
  await page.getByLabel('E-mail instituțional').fill(email);
  await page.getByRole('button', {name: 'Trimite linkul'}).click();
}

test('„Ai uitat parola?” validează adresa și arată mereu același mesaj', async ({
  page,
}) => {
  await page.goto('/autentificare');
  await page.getByRole('link', {name: 'Ai uitat parola?'}).click();
  await expect(page).toHaveURL(/\/resetare-parola$/);

  // Doar adresele instituționale; cererea nu pleacă.
  await requestLink(page, 'ana@gmail.com');
  await expect(
    page.getByText('Folosește adresa instituțională', {exact: false}),
  ).toBeVisible();
  await expect(page.getByText(SENT_MESSAGE)).toHaveCount(0);

  // O adresă fără cont primește același mesaj ca una cu cont.
  await requestLink(page, 'nimeni.inexistent@student.usv.ro');
  await expect(page.getByText(SENT_MESSAGE)).toBeVisible();

  await page.goto('/resetare-parola');
  await requestLink(page, ACCOUNTS.client);
  await expect(page.getByText(SENT_MESSAGE)).toBeVisible();

  await page.getByRole('link', {name: 'Înapoi la autentificare'}).click();
  await expect(page).toHaveURL(/\/autentificare$/);
});

test('linkul fără token trimite la cererea unui link nou', async ({page}) => {
  await page.goto('/parola-noua');

  await expect(
    page.getByText('Linkul pentru resetarea parolei nu este complet.', {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.getByLabel('Parola nouă')).toHaveCount(0);

  await page.getByRole('link', {name: 'Cere un link nou'}).click();
  await expect(page).toHaveURL(/\/resetare-parola$/);
});

test('parola nouă se validează, iar tokenul greșit primește eroarea serverului', async ({
  page,
}) => {
  await page.goto('/parola-noua?token=token-gresit');
  const password = page.getByLabel('Parola nouă');
  const confirmation = page.getByLabel('Confirmă parola');
  const submit = page.getByRole('button', {name: 'Schimbă parola'});

  await password.fill('scurta');
  await submit.click();
  await expect(
    page.getByText('Parola trebuie să aibă cel puțin 8 caractere.'),
  ).toBeVisible();
  await expect(page.getByText('Confirmă parola.')).toBeVisible();

  await password.fill('Parola-Noua-2026');
  await confirmation.fill('Parola-Alta-2026');
  await submit.click();
  await expect(page.getByText('Parolele nu coincid.')).toBeVisible();
  await expect(confirmation).toHaveAttribute('aria-invalid', 'true');

  await confirmation.fill('Parola-Noua-2026');
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText(
    'Linkul pentru resetarea parolei nu este valid sau a expirat. ' +
      'Cere un link nou.',
  );
  await expect(page).toHaveURL(/\/parola-noua/);
});
