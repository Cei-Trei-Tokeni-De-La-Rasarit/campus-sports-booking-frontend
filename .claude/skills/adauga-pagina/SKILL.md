---
name: adauga-pagina
description: Pașii pentru adăugarea sau modificarea unei pagini în frontend-ul Campus Sports Booking (funcții API, pagină, componente, rută, validări). Folosește-l ori de câte ori un ticket cere o pagină sau un formular nou.
---

# Adaugă o pagină

Lucrează în pași mici. După fiecare pas, verifică în browser înainte să continui.

## 1. Verifică cerința
- Ecranul din prototipul Figma: ce se afișează, ce butoane și formulare are.
- În pagina „Specificația API” din Confluence: endpoint-urile folosite,
  câmpurile JSON (în română) și codurile de răspuns, inclusiv erorile.
- Dacă ceva lipsește din Figma sau din specificație, oprește-te și întreabă.

## 2. Funcțiile API (`src/api/<entitate>Api.js`)
- Câte o funcție exportată pentru fiecare cerere (`listX`, `createX`, ...),
  cu un comentariu JSDoc scurt.
- Folosesc funcția `request` existentă: adresa din `VITE_API_URL`,
  erorile serverului transformate în `Error` cu mesajul din `{"mesaj": "..."}`.
- Fără date mock; dacă endpoint-ul nu există încă în backend, funcția se
  scrie după specificație și eroarea de conectare se afișează în pagină.

## 3. Componentele (`src/components/`)
- Componente mici, reutilizabile, primite prin props; fără `fetch` în ele.
- Formularele:
  - câmpurile obligatorii marcate;
  - validare înainte de trimitere: text gol sau doar spații, numere în
    intervalul permis, valori din lista permisă;
  - mesajul de eroare lângă câmpul greșit;
  - butonul de trimitere dezactivat cât se așteaptă răspunsul.

## 4. Pagina (`src/pages/<Nume>Page.jsx`)
- Starea cu `useState`, încărcarea datelor cu `useEffect` prin funcțiile din `src/api/`.
- Trei stări vizibile: **se încarcă**, **eroare** (mesajul de la server) și
  **listă goală** („Nu există ... încă”).
- După o operație reușită: date reîncărcate și un mesaj de confirmare;
  ștergerea cere confirmare.
- Textele în română, cu diacritice; culorile din variabilele CSS.

## 5. Ruta și meniul
- Ruta nouă în `src/App.jsx`; link în meniu (`Header.jsx`), dacă pagina
  trebuie să fie accesibilă direct.

## 6. Verificarea finală

    npm run format
    npm run lint

- Pornește aplicația (`npm run dev`) și încearcă pagina în browser:
  cazul reușit, câmpuri goale, valori greșite și backend-ul oprit.
- Rezumă ce fișiere ai modificat și de ce.
