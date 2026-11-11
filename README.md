# campus-sports-booking-frontend

Interfața aplicației Campus Sports Booking (JavaScript, React, Vite, React Router).

## Pornire locală

1. Instalează bibliotecile:
   ```powershell
   npm install
   ```
2. Copiază `.env.example` ca `.env` (adresa backend-ului, implicit `http://localhost:8000`).
3. Pornește aplicația:
   ```powershell
   npm run dev
   ```
4. Deschide http://localhost:5173.

## Structura proiectului

```
src/
  api/          cererile către backend
  components/   componente reutilizabile
  pages/        paginile aplicației
  styles/       fișierele CSS; culorile din Figma sunt în variables.css
  App.jsx       rutele aplicației (React Router)
  main.jsx      pornirea aplicației
```
