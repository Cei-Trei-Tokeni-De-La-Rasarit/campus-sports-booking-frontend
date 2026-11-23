# campus-sports-booking-frontend

Interfața aplicației Campus Sports Booking (JavaScript, React, Vite, React Router).

Frontend-ul folosește API-ul din
[campus-sports-booking-backend](https://github.com/Cei-Trei-Tokeni-De-La-Rasarit/campus-sports-booking-backend).
Pentru aplicația completă, instalează și pornește întâi backend-ul (pașii sunt în
README-ul lui), apoi frontend-ul.

## Ce trebuie instalat

| Program | Versiune | De ce |
|---|---|---|
| [Git](https://git-scm.com/downloads) | oricare recentă | clonarea repository-ului |
| [Node.js](https://nodejs.org/) | **24** (LTS) | rularea și construirea aplicației; include `npm` |

Verifică în PowerShell:
```powershell
git --version
node --version
npm --version
```

## Instalare

### 1. Clonează repository-ul
```powershell
git clone https://github.com/Cei-Trei-Tokeni-De-La-Rasarit/campus-sports-booking-frontend.git
cd campus-sports-booking-frontend
```

### 2. Bibliotecile
```powershell
npm ci
```
`npm ci` instalează exact versiunile din `package-lock.json`, aceleași pentru toată
echipa. Folosește `npm install` doar când adaugi o bibliotecă nouă.

### 3. Fișierul `.env`
```powershell
Copy-Item .env.example .env
```
`VITE_API_URL` este adresa backend-ului (implicit `http://localhost:8000`).

## Rulare în modul de dezvoltare

```powershell
npm run dev
```
Deschide `http://localhost:5173`. Pagina se actualizează singură la fiecare
modificare de cod. Oprirea: `Ctrl+C`.

## Construire (build)

```powershell
npm run build
npm run preview
```
- `npm run build` construiește versiunea finală a aplicației în folderul `dist/`
  (fișiere HTML, JavaScript și CSS optimizate);
- `npm run preview` pornește un server local cu acea versiune, la `http://localhost:4173`.

Backend-ul acceptă implicit cereri doar de la `http://localhost:5173`. Pentru
`npm run preview`, adaugă și portul 4173 în `.env`-ul backend-ului, apoi repornește-l:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

Adresa din `VITE_API_URL` este pusă în fișierele din `dist/` la build. Dacă o schimbi,
rulează din nou `npm run build`.

## Verificarea stilului

```powershell
npm run format
npm run lint
```
La fiecare pull request, ESLint și Prettier rulează automat pe GitHub.
Fluxul complet (ticket, branch, pull request) este în [CONTRIBUTING.md](CONTRIBUTING.md).

## Teste end-to-end

Testele din `e2e/` folosesc [Playwright](https://playwright.dev/): pornesc
backend-ul și frontend-ul împreună și parcurg aplicația într-un browser, ca un
utilizator (autentificare, rezervare din calendar, anulare, accesul după rol).
Așa prind și problemele dintre cele două componente, pe care testele din
backend nu le văd.

**Pregătire (o singură dată):**
1. Backend-ul instalat după README-ul lui, în folderul vecin cu frontend-ul
   (`../backend` sau `../campus-sports-booking-backend`), cu mediul virtual
   `.venv` și `TEST_DATABASE_URL` în `.env`. Dacă e în alt folder, setează
   `$env:E2E_BACKEND_DIR = "D:/proiecte/campus-sports-booking-backend"`.
2. Browserul folosit de teste (aproximativ 120 MB):
   ```powershell
   npx playwright install chromium
   ```

**Rulare:**
```powershell
npm run test:e2e
```
- Playwright pornește singur backend-ul pe portul 8001 (cu baza de test
  reîncărcată din `seed.sql`) și frontend-ul pe portul 5174, deci merg în
  paralel cu `npm run dev`. Serverele se opresc la final.
- Baza de test e golită la fiecare rulare; nu folosi pentru ea baza echipei.
- La un test picat, în `test-results/` rămâne o înregistrare a pașilor:
  `npx playwright show-trace test-results/<numele-testului>/trace.zip`.

## Structura proiectului

```
e2e/            testele end-to-end (Playwright)
src/
  api/          cererile către backend (request.js trimite token-ul)
  auth/         autentificarea: AuthContext și RequireAuth
  components/   componente reutilizabile
  pages/        paginile aplicației
  styles/       fișierele CSS; culorile din Figma sunt în variables.css
  utils/        funcții ajutătoare (date calendaristice, validări)
  App.jsx       rutele aplicației (React Router)
  main.jsx      pornirea aplicației
```

## Probleme frecvente

| Ce vezi | Cauza și soluția |
|---|---|
| „Serverul nu răspunde...” | Backend-ul nu este pornit sau `VITE_API_URL` are altă adresă. |
| În consola browserului: „blocked by CORS policy” | Adresa frontend-ului lipsește din `CORS_ORIGINS` în `.env`-ul backend-ului. |
| Catalogul este gol | Baza de date nu are date: rulează `seed.sql` (vezi README-ul backend-ului). |
| `npm ci` cere `package-lock.json` | Ești în alt folder; comenzile se rulează în folderul repository-ului. |
| După schimbarea `.env`, nimic nu se schimbă | Repornește `npm run dev` (variabilele se citesc la pornire). |
