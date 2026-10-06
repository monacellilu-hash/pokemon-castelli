# STATO REALE DELLE 7 MN (verificato sul codice il 6 ottobre 2026)

Audit fatto leggendo il codice riga per riga (non fidandosi di CLAUDE.md/ROADMAP), dopo
l'interruzione forzata degli agenti in background. Oggi il motore usa **un solo flag**
`stato.mn.<nome>` sia per il possesso dell'oggetto sia per il permesso d'uso (lo sdoppiamento
in due flag separati è esplicitamente rimandato da CLAUDE.md, non è un bug da correggere ora).

## Tabella reale

| MN | Oggetto + Permesso (dove, nel codice) | Stato |
|---|---|---|
| **Taglio** | `DONATORI_MN['mn-taglio']` (js/data.js:892) — Fra' Potatore, comune **Grottaferrata**, richiede **2 medaglie** | ✅ Funziona, ma **non combacia con CLAUDE.md** (dice "Frascati", "subito dopo Medaglia Vigna" = 1 medaglia). Divergenza doc/codice, non del codice stesso. |
| **Forza** | `interagisciRoccaNpc1()` (js/app.js:1897-1911) — Abitante preoccupato, Rocca di Papa, dopo cutscene rapimento Gianluca | ✅ Funziona, combacia con CLAUDE.md. |
| **Surf** | `DONATORI_MN['mn-surf']` (js/data.js:908) — Nonna Assunta, Lago di Albano, gate `palestraRichiesta: 'monte-porzio'` + trainer nipote da battere | ✅ Funziona, combacia con CLAUDE.md (gym di sblocco leggermente diversa: Monte Porzio non Albano, ma coerente con la progressione). |
| **Volo** | `DONATORI_MN['mn-volo']` (js/data.js:935) — Faustino il funicolarista, Rocca di Papa, gate `palestraRichiesta: 'albano'` | ⚠️ **Divergenza**: CLAUDE.md dice che l'oggetto Volo viene dal **miniboss del dungeon innevato** (dopo Articuno), qui invece lo dà direttamente un NPC a Rocca di Papa gated sulla palestra di Albano. Nessun collegamento col miniboss/Articuno nel codice. |
| **Spaccaroccia** | **NESSUNO** — `stato.mn.spaccaroccia` non viene mai messo a `true` da nessun NPC/cutscene/palestra, solo dal comando di debug (js/app.js:5517) | ❌ **MAI OTTENIBILE IN PARTITA NORMALE.** La sottotrama "Castel Gandolfo / libera la Villa" descritta in CLAUDE.md non esiste nel codice. |
| **Cascata** | Permesso: `mnDonata: 'cascata'` sulla palestra di **Ariccia** (js/data.js:520, concesso automaticamente a fine lotta capopalestra). Oggetto fisico: **non esiste**, nessun pickup su nessuna mappa (commento nel codice stesso: "l'oggetto sul campo resta da assegnare, ancora da decidere dove") | ⚠️ **Parziale**: il permesso esiste ma è legato ad Ariccia (P7), non a Genzano (P8) come dice CLAUDE.md. L'oggetto MN Cascata non è piazzato da nessuna parte → anche con il permesso, non la si può mettere nello zaino. |
| **Sub** | Permesso: `mnDonata: 'sub'` sulla palestra di **Genzano** (js/data.js:609). Oggetto fisico: **non esiste** nemmeno come voce in `OGGETTI` (nessun `mn_sub:` in js/data.js) | ⚠️ CLAUDE.md dice "Sub: non previsto al momento" — coerente che l'oggetto non esista. Ma il codice concede comunque un "permesso" per una MN che non esisterà mai come item: codice morto, innocuo ma da pulire o completare in futuro. |

## Riepilogo per Luca

- **Funzionano davvero, giocabili**: Taglio, Forza, Surf (con piccole divergenze di luogo/testo rispetto a CLAUDE.md, ma complete).
- **Volo**: funziona ma con una strada diversa da quella scritta in CLAUDE.md (niente miniboss/dungeon innevato collegato).
- **Spaccaroccia: NON esiste in partita.** Se un giocatore normale raggiunge Marino/Castel Gandolfo, non potrà mai sbloccare gli ostacoli Spaccaroccia — serve costruire la sottotrama "libera la Villa a Castel Gandolfo" descritta in CLAUDE.md, oggi assente.
- **Cascata**: il permesso c'è (dato da Isa ad Ariccia) ma l'oggetto fisico non è piazzato in nessuna mappa — serve decidere dove metterlo (CLAUDE.md dice "Genzano, dettagli da definire").
- **Sub**: non implementato per scelta (coerente con CLAUDE.md), ma il `mnDonata: 'sub'` sulla palestra di Genzano è codice morto da rimuovere o da completare se si decide di implementare Sub in futuro.

## Bonus: bug reale trovato e corretto in questa sessione (non MN, ma correlato)

Le **8 palestre interne** (`pokemon-castelli-palestra_*.tmx`) erano rimaste completamente
scollegate dal `.tmj` corrispondente per 5 palestre su 8 (Grottaferrata, Ariccia, Marino,
Monte Porzio, Rocca di Papa — quest'ultima aveva **zero oggetti** nel file `.tmx`, cioè Tiled
la mostrava completamente vuota). Risincronizzati tutti gli oggetti (trainer, warp, spawn,
collisioni) dal `.tmj` (autoritativo) al `.tmx`, così ora quello che vedi aprendo le mappe in
Tiled corrisponde esattamente a quello che gira in gioco.

## Bonus 2: bug reale trovato, NON ancora corretto (fuori scope di questo audit)

Il **Museo delle Navi di Nemi, 2° piano** (`museo_navi_2f.tmj`) ha solo oggetti-segnaposto
vuoti (senza `type` né proprietà) per "Luogotenente", "grunt" x2, "scenziato rapito" x2, "boss"
e "parola segreta" — il motore li ignora completamente. Significa che la seconda password del
Rifugio GdF di Marino (quella di Michela) **non è davvero ottenibile in partita**, nonostante
`dati/cutscene.js` e i commenti nel codice descrivano la scena come già pronta. Serve costruire
davvero questi oggetti (NPC ostaggio, grunt, Michela/Luogotenente come trainer, Poké Ball con
`password_2`) — è un lavoro di World-building vero e proprio, non una semplice correzione.
