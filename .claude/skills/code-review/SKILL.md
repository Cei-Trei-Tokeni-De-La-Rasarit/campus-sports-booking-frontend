---
name: code-review
description: Checklist pentru revizuirea codului în frontend-ul Campus Sports Booking. Folosește-l când revizuiești un pull request al unui coleg sau propriile modificări înainte de a cere review.
---

# Code review

## Ce revizuiești
- Modificările branch-ului față de `main`: `git diff main...<branch>`.
- Citește fiecare fișier modificat integral, nu doar rezultatul verificărilor.
- Citește ticketul din Jira (numărul e în numele branch-ului) și compară
  ce cere ticketul cu ce s-a făcut; compară pagina cu prototipul din Figma.

## Checklist
**Ticket și scop**
- Face ce cere ticketul și nimic în plus; fără fișiere fără legătură.
- Folosește endpoint-urile și câmpurile JSON exact ca în specificația API.
- Fără date mock în locul cererilor către backend.

**Validări și erori**
- Formularele validează câmpurile obligatorii, textul gol sau doar din
  spații, numerele și valorile permise, cu mesaj lângă câmpul greșit.
- Erorile de la server (`{"mesaj": "..."}`) sunt afișate utilizatorului.
- Pagina are stare de încărcare, de eroare și de listă goală.
- Butoanele de trimitere nu pot fi apăsate de două ori cât se așteaptă răspunsul.

**Securitate**
- Fără `dangerouslySetInnerHTML` cu text de la utilizator sau de la server.
- Adresa backend-ului vine din `VITE_API_URL`; fără adrese, parole sau
  chei scrise în cod.
- Pachetele npm noi există, sunt întreținute și chiar sunt necesare.

**Structură și stil**
- `fetch` doar în `src/api/`; componentele primesc datele prin props.
- Denumiri, exporturi cu nume, componente funcționale, JSDoc în `src/api/`,
  conform paginii „Coding style frontend”.
- Fără `console.log`, cod comentat rămas sau abstracții inutile.
- Textele afișate în română, cu diacritice; culorile din variabilele CSS.

## Rezultatul
- Listează observațiile, fiecare cu fișierul și linia, ce e problema și ce
  propui. Marchează-le: **obligatoriu** (trebuie corectat) sau **sugestie**.
- Spune la final dacă recomanzi approval sau modificări.
- Nu aproba și nu integra pull request-ul pe GitHub; decizia îi aparține
  colegului care face review-ul.
