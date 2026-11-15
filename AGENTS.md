# Reguli pentru asistenții AI: campus-sports-booking-frontend

Interfața web a aplicației Campus Sports Booking: JavaScript, React, Vite și
React Router. Datele vin de la backend prin API-ul REST descris în pagina
„Specificația API” din Confluence; adresele și câmpurile JSON se respectă exact.
Designul urmează prototipul din Figma.

## Înainte de orice modificare
- Lucrezi doar pentru ticketul Jira din numele branch-ului (KAN-<număr>-<titlu>).
  Nu modifica fișiere care nu țin de acel ticket; dacă e nevoie de altceva, spune.
- Nu citi, nu afișa și nu modifica fișierul `.env`. Folosește `.env.example`.
- Nu adăuga pachete npm noi fără să spui ce pachet, de ce și ce versiune.
  Verifică întâi că pachetul există și este întreținut.
- Nu folosi date inventate (mock) în locul cererilor către backend.

## Structura
- `src/api/`: funcțiile care trimit cereri către backend; singurul loc cu `fetch`
- `src/components/`: componente reutilizabile (butoane, formulare, carduri)
- `src/pages/`: paginile aplicației, câte una pentru fiecare rută
- `src/styles/`: CSS; culorile din Figma sunt variabile în `variables.css`
- `src/App.jsx`: rutele (React Router)

## Reguli de cod (detalii: pagina „Coding style frontend”)
- Google JavaScript Style Guide, verificat cu ESLint și Prettier:
  2 spații, max. 80 de caractere, ghilimele simple, punct și virgulă.
- `camelCase` pentru funcții și variabile, `PascalCase` pentru componente
  și fișierele lor (`FacilityForm.jsx`), `UPPER_CASE` pentru constante.
- Componente funcționale cu hook-uri; exporturi cu nume.
- `const` și `let`, niciodată `var`; comparații cu `===`.
- Codul în engleză; textele afișate utilizatorului în română.
- Fără `console.log` în codul final.

## Validări, erori și securitate
- Formularele validează datele înainte de trimitere: câmpuri obligatorii,
  text gol sau doar spații, numere în intervalul permis; mesajul de eroare
  apare lângă câmpul greșit.
- Validarea din frontend nu o înlocuiește pe cea din backend; erorile
  primite de la server (`{"mesaj": "..."}`) se afișează utilizatorului.
- Fiecare pagină care încarcă date arată o stare de încărcare și o stare de eroare.
- Nu afișa cu `dangerouslySetInnerHTML` text venit de la utilizator sau de la server.
- Adresa backend-ului vine din `import.meta.env.VITE_API_URL`; nu o scrie în cod.

## După fiecare modificare
Rulează și repară până trec:

    npm run format
    npm run lint

Pornește aplicația (`npm run dev`) și verifică în browser pagina modificată,
inclusiv cu date greșite în formulare.

## Skill-uri
Pentru sarcinile de mai jos, folosește skill-urile din `.claude/skills/`:
`adauga-pagina`, `pregateste-pr`, `code-review`.
