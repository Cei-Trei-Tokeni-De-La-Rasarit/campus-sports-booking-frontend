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

## Structura proiectului

```
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
