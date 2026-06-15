# ROADMAP — Pokémon Castelli Romani

> Aggiornato alla fine di ogni sessione. Leggi sempre dall'alto prima di riprendere.

---

## 📌 PUNTO DELLA SITUAZIONE (aggiornato al 15 giugno 2026 — sera)

**Fasi completate: F1-F8 + F9 + F10 + F11 + F12 + F12b-parziale + F13.**

### F13 — Pubblicazione GitHub Pages: COMPLETATA ✔
- **`git init`** nella cartella di progetto (`C:/Users/Luca/Desktop/pokemon-castelli`).
- **`.gitignore`** creato (esclude `.claude/`, `Old Versioning Instruction/`, `LAST UPDATE.txt`, file di sistema).
- Git identity configurata (`lucamonacelli95@gmail.com` / `Luca Monacelli`).
- Primo commit: tutti i 14 file di gioco (`index.html`, `style.css`, `js/`, `docs/`, `.gitignore`, `CLAUDE.md`).
- Remote: `https://github.com/monacellilu-hash/pokemon-castelli.git`
- Push su `master` completato con successo.
- **GitHub Pages attivato** (Branch: master / root) → **sito live:**
  **https://monacellilu-hash.github.io/pokemon-castelli/**

### Aggiunto nella sessione precedente (F12b parziale):
- **15 allenatori Via Vittoria** (Lv 55-60, Manlio→Tullio).
- **Sistema oggetti mappa** (~74 oggetti): raccolta automatica entro 40 m. `OGGETTI_MAPPA`, `OGGETTI_CHIAVE`, `stato.oggettiRaccolti`, `stato.inventario.chiave`.
- **Braciere di Nemi** (oggetto chiave, Lago di Nemi via Surf) → trigger Lugia.
- **Piuma Sacra** (oggetto chiave, da catena Porchettari+CoTrAL) → trigger Ho-Oh.
- **Lugia (249)** — Pratoni del Vivaro (nuova zona, Lv 35-50). Trigger post-Lega + Braciere.
- **Ho-Oh (250)** — Ponte di Ariccia. Trigger post-Lega + Piuma Sacra + alba + Sagra ogni 15 gg.
- **Villa Aldobrandini** (Frascati): marker `🏛️🌸`. Placeholder per Mew (F12b rimasto).

### F12b — Post-game completo: COMPLETATA ✔ (sessione 16 — 15 giugno 2026)
- **Porchettaro di Ariccia** (`PORCHETTARO`, marker 🐷): NPC Adriano. Dopo aver sconfitto i 4 agenti CoTrAL ad Ariccia dà la **Piuma Sacra** → sblocca Ho-Oh.
- **4 CoTrAL Ariccia** (id: cotral-ariccia-1..4, Lv 50-54): auto-trigger normale, 4° con `flagVittoria: 'cotralAricciaDebellata'`. Posizionati in zona Campagna Ariccia-Genzano.
- **Bunkerino di Colonna** (`BUNKERINO`, marker 🏭): gauntlet 4 grunti (Lv 58-62) + Direttore Lucio (Lv 63-65). Gauntlet custom (`avviaGauntletBunkerino`) con cura opzionale tra un round e l'altro. Dopo Lucio → `triggeraMewtwo()`.
- **Mewtwo (150) Lv 70** — in coda al Bunkerino, `fuggireImpossibile: true`, `legCatturati`/`legScomparsi`. Dopo l'incontro: `flags.mewtwoSconfitto = true`.
- **Mew (151) Lv 50** — Villa Aldobrandini (Frascati): compare solo se `mewtwoSconfitto=true`. Trigger classico `triggeraLeggendario`.
- **Deoxys (386) Lv 60** — Parcheggione di Grottaferrata (`PARCHEGGIONE`, marker 🚀): prima visita post-Lega → Divisa da Astronauta; seconda visita con divisa → dialogo Luna → `triggeraLeggendario(386)`.
- **NOMI_LEGGENDARI** aggiornato: ora include 150 (Mewtwo), 151 (Mew), 386 (Deoxys). Totale: 13 leggendari tracciati.
- **Migrazione** in `caricaPartita`: 6 nuovi flag (cotralAricciaDebellata, bunkerinoDebellato, mewtwoSconfitto + gauntletBunkerino).
- **Modalità test** aggiornata: dà divisa astronauta + imposta mewtwoSconfitto/bunkerinoDebellato (Mew e Deoxys testabili subito).

**Prossima sessione:** F14 (grafica cartoon — tileset pixel, avatar animato, edifici iconici). Oppure bug fix / rifinitura gameplay su richiesta utente.
- **~153 allenatori di percorso/dungeon** (erano 24, ora ~153):
  Percorso Tuscolana +4 (tot 8), Via F→G +6 nuovi, Vigne Frascati +3 (tot 6),
  **Boschi Tuscolo DUNGEON GROSSO +14** (tot 18!), Via G→M +5, Vigne Marino +3 (tot 6),
  Boschetto Segreto +3 (tot 4), Via M→MtP +5, **Famiglia Vinci** ×6,
  Via MtP→Rocca +5 (altri 2), **Grotta Vulcano DUNGEON GROSSO +13** (tot 16!),
  Monte Cavo +5 (tot 7), Via Rocca→Albano +5, **Lab CoTrAL #1** ×15 (GdF Fulvia),
  Via Albano→Ariccia +5, **Lab CoTrAL #2** ×17 (GdF Crasso incluso!),
  Campagna A→G +4 (tot 8), Sentiero Innevato +6.
- **52 gregari di palestra** (gauntlet system): P1 ×3 … P8 ×10. Tra un gregario
  e l'altro si può scegliere di curarsi. Dopo tutti i gregari, cura opzionale prima del boss.
- **3 nuove zone** in world.js: Lab CoTrAL #1 (r=250m, Lv 22-30), Lab CoTrAL #2
  (r=250m, Lv 40-50), Sentiero Innevato (r=400m, Lv 36-44, locked funivia → Articuno).
- **Logica gauntlet** in app.js: `stato.gauntletPalestra`, `mostraScelta()`, `curaCompletaSquadra()`,
  `interagisciPalestra` riscritta con flusso gregari → cura opzionale → capopalestra.
- **Oggetti cura-stato** in data.js (Antidoto, Antiparalisi, Antiscottatura, Antigelo,
  Antidoto totale) con supporto in `usaOggettoSu` e in `renderZaino`.
- **Budget**: ~153 percorso + 52 gauntlet = **205 già presenti**; + ~20 Team GdF (F10) +
  ~20 Via Vittoria + Lega (F12) = **~245 totale** (target soddisfatto).
Mancano: **Via Vittoria + Lega (F12)**, pubblicazione (F13), grafica cartoon (F14).

### Cosa esiste già nel gioco (canon per la storia)
- **Regole del mondo**: solo Pokémon **Gen 1-2-3** (ID 1-386). Level cap progressivo
  legato alle medaglie: 14 → 21 → 28 → 34 → 40 → 46 → 52 → 58 → 60 (Via Vittoria).
- **Inizio**: il giocatore parte dal **Quartiere Tuscolano** (periferia di Roma sulla
  Via Tuscolana). Il **Prof. Castagno** (laboratorio in città) gli fa scegliere la
  generazione e poi lo starter; regala Pokédex, 10 Poké Ball e 5 Pozioni.
- **Il rivale: Remo** (nipote del Professore, nome da Romolo e Remo). Sceglie sempre
  lo starter del tipo forte contro quello del giocatore, da una gen qualsiasi.
  Sfida il giocatore: nel laboratorio (subito), davanti alla palestra di Marino,
  davanti a quella di Albano e davanti a quella di Genzano (6 vs 6). Ha promesso di
  ritrovare il giocatore **alla Lega di Colonna** (gancio narrativo aperto per F12).
- **Le 8 palestre** (tutte attive e battibili, in quest'ordine obbligato):
  1. **Frascati** — Vinicio (Erba) — *Medaglia Vigna* — Villa Torlonia, tema vigne/vino DOC
  2. **Grottaferrata** — Nilo (Psico) — *Medaglia Icona* — Abbazia di San Nilo, meditazione
  3. **Marino** — Moro (Acqua) — *Medaglia Fontana* — Fontana Quattro Mori, Sagra dell'Uva
  4. **Monte Porzio** — Stella (Elettro) — *Medaglia Stella* — astronoma dell'Osservatorio
  5. **Rocca di Papa** — Rocco (Roccia) — *Medaglia Cratere* — pietra del Vulcano Laziale
  6. **Albano** — Massimo (Lotta) — *Medaglia Legione* — Castra Albana, legionari
  7. **Ariccia** — Ombretta (Buio) — *Medaglia Fraschetta* — fraschette di notte, il ponte
  8. **Genzano** — Flora (Folletto) — *Medaglia Infiorata* — l'Infiorata
- **Servizi**: Centri Pokémon 🏥 in tutti gli 8 comuni (cura gratuita + "Dormi" entro
  150 m). **Poké Market 🛒** in 9 punti (Borgata + 8 comuni) con merce a progressione e
  valuta **Pokéyen ₽** (F9.2). Menu ☰ con squadra/zaino/Market/Box/salvataggi
  (esporta/importa JSON). Booster ⏩ x1-x5. **Sistema del tempo** (orologio + "Dormi", F9.1).
- **Zone selvatiche attive**: Percorso Tuscolana (tutorial), Vigne di Frascati e
  Marino, Boschi del Tuscolo, Grotta del Vulcano, Monte Cavo, campagna. **Lago Albano
  e Lago di Nemi** si sbloccano con la **MN Surf** (Nonna Assunta); il **Boschetto
  Segreto** (Grottaferrata) con la **MN Taglio** (Fra' Potatore). **MN Volo** = viaggio
  rapido tra i comuni visitati (Faustino, Rocca di Papa).
- **NPC**: marker 💬 "gente del posto" in 12 località (battute casuali a colore locale).
- **Leggendari (F11) — posizionamento DEFINITIVO in `docs/BIBBIA-NARRATIVA.md`**:
  Kyogre (Lago Albano), Groudon (Grotta del Vulcano), Rayquaza (Frascati/Piazza San Rocco),
  Lugia (Monte Cavo), Suicune e gli altri roaming sfalsati, Mew (Villa Aldobrandini),
  Mewtwo (Bunkerino), trio Regi (Tuscolo, enigmi in latino), Deoxys (Luna). Solo ID 1-386.
- **🍬 Modalità test attiva** (999 Caramelle Rare): da spegnere a gioco completo
  (`MODALITA_TEST = false` in data.js).

### Storia — ora DEFINITA (vedi `docs/BIBBIA-NARRATIVA.md` e `docs/DIALOGHI-NPC.md`)
- Due team: **GdF** (pre-Lega, Sfere al Museo di Nemi → Kyogre/Groudon) e **CoTrAL**
  (post-Lega, scissione, Mewtwo nel Bunkerino).
- **Sistema del tempo** (conta-giorni + "Dormi" al PC) che pilota gli eventi.
- Leggendari e trigger: tutti assegnati. Città: luoghi, market, NPC e filler pronti.
- **Campione = Remo**. Donatori MN: Taglio ~dopo P2, Surf (Nonna Assunta) ~dopo P5-6, Volo ~dopo P6.
- Residui minori: nomi dei creatori del Bunkerino; battute di trama da calare in F9.

---

## Sessione 13 — F11: Leggendari ed eventi (pre-Lega)

### Cosa è stato fatto

#### `data.js`
- **`FUNIVIA_ROCCA`** — costante con id/lat/lon/raggio/medaglieMin (≥5) per la stazione di Rocca di Papa.
- **`METEOROLOGO`** — NPC Ruggero, Monte Porzio Catone, lat 41.8162/12.7148, raggio 120 m.
- **`ANFRATTI_REGI`** — array di 3 anfratti al Tuscolo: Regirock (ground), Registeel (flying), Regice (dark), ognuno con iscrizione in latino e raggio 80 m.
- **`TERRENO_ICONE`** — aggiunto `neve: '❄️'` e `interno: '🏭'`.

#### `battle.js`
- Aggiunto flag `fuggireImpossibile` (default `false`).
- `avvia(opzioni)` ora legge `opzioni.fuggireImpossibile`.
- `tentaFuga()` blocca la fuga con dialogo "Non puoi fuggire da questo Pokémon leggendario!" quando il flag è attivo.

#### `map.js`
- **`aggiungiFunivia()`** — marker 🚡 con popup "Usa la funivia" → `interagisciFunivia()`.
- **`aggiungiMeteorologo()`** — marker 🔭 con popup "Chiedi le previsioni" → `interagisciMeteorologo()`.
- **`aggiungiAnfrattiRegi()`** — 3 marker 🏛️✨ con popup → `interagisciAnfratto(id)`.
- Tutti e tre chiamati in `inizializza()`.

#### `app.js`
- **Stato**: `stato.mn.funivia = false`, `stato.legCatturati = []`, `stato.legCooldown = null`, `stato.flags.funiviaUsata/giornoTemporale/suicuneVisto`.
- **`MN_PER_NOME`** aggiornata: `'Funivia': 'funivia'` (sblocca sentiero-innevato).
- **`legCatturato(id)`** e **`legCooldownAttivo(id, zonaId)`** — helper di controllo.
- **`triggeraLeggendario(id, livello, nomeSpec, dialogo, onFineExtra)`** — funzione centrale: blocca il movimento, mostra il dialogo, avvia la lotta con `fuggireImpossibile:true`, imposta `stato.legCatturati` alla cattura, cancella cooldown all'uscita dalla zona.
- **`interagisciFunivia()`** — gate ≥5 medaglie → sblocca `stato.mn.funivia = true` e il Sentiero Innevato.
- **`interagisciMeteorologo()`** — imposta `stato.flags.giornoTemporale = giorno+3`; dialogo aggiornato con conto alla rovescia.
- **`interagisciAnfratto(id)`** — mostra l'iscrizione in latino, conta i Pokémon del tipo richiesto in squadra (≥3), poi triggeraLeggendario.
- **`controllaEventiTempo()`** aggiornata — blocco Zapdos: se siamo nel giorno del temporale e entro 350 m da Monte Porzio, scatta la lotta; dopo (qualunque esito) `giornoTemporale` si azzera.
- **`alPasso()`** aggiornata:
  - Ogni passo: cancella `stato.legCooldown` se il giocatore è uscito dalla zona.
  - Ogni passo: **Suicune** — prima volta in `lago-nemi` (e Surf attivo) → `stato.flags.suicuneVisto = true` + `triggeraLeggendario(245)`.
  - Ogni `PASSI_PER_CHECK`: **Articuno** — in `sentiero-innevato` (funivia attiva), se non catturato e no cooldown.
  - Ogni `PASSI_PER_CHECK`: **Celebi** — in `boschi-tuscolo`, 1,5% di probabilità, se non catturato e no cooldown.
- **`leggendariStatoTesto()`** — riga leggendari in schermata Salva: `✨ Leggendari (pre-Lega): N/7 — Articuno, ...`.
- **`NOMI_LEGGENDARI_F11`** — mappa id→nome per i 7 leggendari pre-Lega.
- Migrazione F11 in `caricaPartita`.

#### `style.css`
- `.icona-funivia` — glow azzurro.
- `.icona-meteo` — glow giallo.
- `.icona-anfratto` — glow viola + animazione `pulsaAnfratto` (lampeggio).

### Leggendari implementati
| # | Pokémon | Dove | Trigger |
|---|---------|------|---------|
| 144 | Articuno | Sentiero Innevato | Ogni check (sblocco funivia, ≥5 medaglie) |
| 145 | Zapdos | Osservatorio Monte Porzio | Giorno del temporale (Meteorologo +3 giorni) |
| 245 | Suicune | Lago di Nemi | Prima volta che entri (Surf richiesto) |
| 251 | Celebi | Boschi del Tuscolo | 1,5% per check, evento raro |
| 377 | Regirock | Antro del Foro (Tuscolo) | ≥3 Pokémon Terra in squadra |
| 378 | Regice | Antro dell'Anfiteatro | ≥3 Pokémon Buio in squadra |
| 379 | Registeel | Antro del Teatro | ≥3 Pokémon Volante in squadra |

### Come testare
1. **Ricarica** il gioco.
2. **Funivia e Articuno**: con ≥5 Medaglie, vai alla stazione funivia di Rocca di Papa (marker 🚡, lat 41.7617/12.7125). Cliccalo → "Usa la funivia" → dialogo Faustino → Sentiero Innevato sbloccato. Vai nella zona (lat ~41.7455/12.7160): al prossimo check passaggi Articuno compare (fuga impossibile!).
3. **Zapdos**: clicca il marker 🔭 del Meteorologo a Monte Porzio (lat 41.8162/12.7148). Ottieni la previsione "tra 3 giorni il temporale". Usa "Dormi" al Centro per avanzare 3 giorni. Torna al marker del Meteorologo (zona Osservatorio, entro 350 m da Monte Porzio): partirà lo scontro con Zapdos!
4. **Suicune**: con MN Surf, cammina verso il Lago di Nemi (lat ~41.714/12.713): al primo passo dentro la zona appare Suicune senza preavviso.
5. **Celebi**: cammina nei Boschi del Tuscolo (lat ~41.792/12.737): è un evento raro (1,5% per check), continua a camminare fino a che non appare.
6. **Trio Regi**: vicino alle rovine del Tuscolo ci sono 3 marker 🏛️✨. Clicca uno di essi → vedi l'iscrizione in latino. Se hai ≥3 Pokémon del tipo richiesto in squadra, si apre lo scontro. Altrimenti dice quanti ne mancano.
7. **Menu ☰ → Salva**: compare la riga "✨ Leggendari (pre-Lega): N/7" con i nomi di quelli catturati.

### Prossimo passo → F12 (Via Vittoria + Lega di Colonna)
- **Via Vittoria** (dungeon finale, cap 60, Moltres alla fine).
- **Lega di Colonna**: 4 Superquattro con sistema a pool (10 specie ciascuno, 6 estratte a ogni sfida, core sempre incluso).
- **Campione Remo** (pool più ampio, livelli 64-66).
- Leggendari rimandati a F12/post-game: Kyogre, Groudon, Rayquaza, Lugia, Ho-Oh, Moltres, Mewtwo, Mew, Jirachi, Deoxys, Raikou/Entei/Latias/Latios (roaming).

---

## Sessione 12 — F10: Team GdF narrativo

### Cosa è stato fatto
- **MUSEO_NAVI** in data.js: costante con id/lat/lon/raggio (41.7196, 12.7018, r=150m).
- **Marker 🏛️📜** sulla mappa (aggiungiMuseoNavi in map.js) a Nemi.
- **Cutscene del furto** in app.js (`interagisciMuseoNavi`):
  - Prima visita → sequenza dialoghi a 3 scene (NPC Custode → grunti rubano → fuga) → `flags.museoVisitato + sfereRubate = true` → toast.
  - Visita successiva con `sfereRubate && !gdFSconfitto` → "il museo è sconvolto".
  - Dopo aver sconfitto Crasso → "navi in pace".
- **5 GdF Grunts** aggiunti ad ALLENATORI (auto-trigger entro 80 m come tutti gli altri):
  - `gdf-grunt-1/2`: zona Nemi (Lv 22-25, Gyarados/Golduck/Lombre)
  - `gdf-grunt-3`: campagna verso Marino (Lv 26-27, Golduck/Poliwhirl)
  - `gdf-grunt-4`: strada Albano→Lab (Lv 34-35, Gyarados/Onix)
  - `gdf-grunt-5`: avamposto Genzano (Lv 38, Houndoom/Umbreon)
  - Dialoghi che rivelano il piano (Sfere, Kyogre, Groudon, Crasso, Admin).
- **Flag `gdFSconfitto`** su Crasso (`all-lab2-15`): aggiunti `flagVittoria: 'gdFSconfitto'` e `dialogoVittoriaPost` (5 righe: GdF sconfitto, sfere recuperate, leggendari dormienti, hint CoTrAL).
- **`lottaAllenatore`** aggiornata: se `a.flagVittoria` → imposta il flag in `stato.flags` e mostra `dialogoVittoriaPost` dopo la vittoria.
- **Schermata Salva** aggiornata: riga `gdFStatoTesto()` mostra lo stato della trama GdF (non incontrato / sfere rubate / sconfitto).
- **Migrazione** in `caricaPartita`: tre flag GdF inizializzati a false se mancanti.

### Come testare
1. Ricarica il gioco. Vai a **Nemi** (lat 41.7196, lon 12.7018): trovalo con il marker 🏛️📜 e cliccalo → "Entra nel Museo".
2. **Prima visita** → vedi la cutscene in 3 atti (custode → grunti rubano → dialogo con te). Poi toast rosso "Team GdF ha rubato le Sfere!"
3. **Ritorna al Museo**: vedi solo il messaggio di crisi.
4. **Menu ☰ → Salva**: riga "🔷 Team GdF: Indagine in corso — Sfere rubate a Nemi!".
5. **GdF Grunts**: cammina verso Nemi (intorno al lago) e tra Marino, Albano, Genzano: 5 grunt in uniforme GdF ti bloccano e hanno dialoghi che parlano del piano.
6. **Segui il path dei Lab**: Lab CoTrAL #1 (Marino, lat 41.7725/12.6560) → alla fine c'è Fulvia. Lab CoTrAL #2 (Albano, 41.7350/12.6500) → Tarcisio → Crasso (boss finale).
7. **Dopo Crasso** → dialogo speciale "Team GdF sconfitto, Sfere recuperate, hint CoTrAL". Menu → Salva: riga cambia in "Sconfitto ✔".
8. Torna al Museo: "Le navi riposano in pace."

### Prossimo passo → F11 (Leggendari ed eventi) — COMPLETATA ✔

---

## Sessione 11 — Densità allenatori (target ~250, stile Rosso Fuoco)

### Cosa è stato fatto

#### A — 52 Gregari di palestra (Gauntlet system) — `data.js`
Ogni palestra ora ha un array `gregari` con allenatori sequenziali da battere prima del
capopalestra. Dopo ogni gregario (dal secondo in poi) il giocatore può scegliere di curarsi
gratis. Dopo tutti i gregari, cura opzionale prima del boss.
- P1 Frascati ×3 (Lv 9-13, Erba)
- P2 Grottaferrata ×4 (Lv 15-20, Psico)
- P3 Marino ×5 (Lv 22-27, Acqua)
- P4 Monte Porzio ×6 (Lv 28-33, Elettro)
- P5 Rocca di Papa ×7 (Lv 34-39, Roccia)
- P6 Albano ×8 (Lv 40-45, Lotta)
- P7 Ariccia ×9 (Lv 46-51, Buio)
- P8 Genzano ×10 (Lv 52-57, Folletto)

#### B — ~129 Allenatori di percorso e dungeon — `data.js`
Distribuiti su tutti i percorsi e dungeon. **Due dungeon grossi** (18 e 16 allenatori).
- Percorso Tuscolana +4 (Lv 4-8): tot 8
- Via Frascati→Grottaferrata ×6 (Lv 7-11)
- Vigne di Frascati +3 (Lv 7-10): tot 6
- **Boschi del Tuscolo DUNGEON GROSSO +14** (Lv 9-12): tot 18
- Via Grottaferrata→Marino ×5 (Lv 9-14)
- Vigne di Marino +3 (Lv 7-10): tot 6
- Boschetto Segreto +3 (Lv 12-15, post-Taglio): tot 4
- Via Marino→Monte Porzio ×5 (Lv 12-17)
- Via Monte Porzio→Rocca ×5 (Lv 17-23, include Famiglia Vinci ×6 Lv 22-27)
- **Grotta del Vulcano DUNGEON GROSSO +13** (Lv 19-25): tot 16
- Monte Cavo +5 (Lv 38-46): tot 7
- Via Rocca→Albano ×5 (Lv 27-35)
- **Lab CoTrAL #1 ×15** (Lv 22-30, culmina con Admin Fulvia)
- Via Albano→Ariccia ×5 (Lv 36-42)
- **Lab CoTrAL #2 ×17** (Lv 40-50, culmina con Comandante Crasso)
- Campagna Ariccia→Genzano +4 (Lv 38-44): tot 8
- Sentiero Innevato ×6 (Lv 36-44, zona ghiaccio)

#### C — 3 Nuove zone — `world.js`
- `lab-cotral-1`: cerchio r=250m, centro 41.7725/12.6560, Lv 22-30, Magnemite/Voltorb/Zubat
- `lab-cotral-2`: cerchio r=250m, centro 41.7350/12.6500, Lv 40-50, Magneton/Electrode/Unown
- `sentiero-innevato`: cerchio r=400m, centro 41.7455/12.7160, Lv 36-44, locked `Funivia`

#### D — Sistema Gauntlet — `app.js`
- `stato.gauntletPalestra: {}` aggiunto allo stato e alla migrazione
- `mostraScelta(messaggio, testo1, testo2)` → Promise<1|2>: overlay bicolore
- `curaCompletaSquadra()`: cura completa HP+PP+condizione usata tra un gregario e l'altro
- `interagisciPalestra()` riscritta: flusso rivale → gregari con cura opzionale → boss

#### E — Supporto oggetti cura-stato — `app.js` + `data.js`
- Cinque oggetti nuovi in `OGGETTI`: Antidoto (veleno), Antiparalisi, Antiscottatura,
  Antigelo, Antidoto totale (null = cura tutto). Aggiunti ai Poké Market intermedi.
- `usaOggettoSu()`: ramo `curastato` — controlla stato corrispondente, azzera `pkm.condizione`
- `renderZaino()`: `curastato` incluso in `suBersaglio` (mostra pulsante Usa)

### Budget finale allenatori
| Categoria | Numero |
|---|---|
| Percorsi e dungeon (questa sessione) | ~153 |
| Gauntlet palestre (gregari) | 52 |
| **Totale attuale** | **~205** |
| Team GdF pianificati (F10) | ~20 |
| Via Vittoria + Lega (F12) | ~20 |
| **Totale previsto a fine sviluppo** | **~245** |

### Come testare
1. **Ricarica** il gioco. Prova a cliccare una palestra avvicinandoti:
   - Il primo gregario parte subito.
   - Dopo averlo battuto, dialogo e poi appare la domanda "Vuoi curarti prima di affrontare…?"
   - Prosegui per tutta la sequenza. Alla fine, offerta di cura prima del boss.
2. Sui percorsi tra le città, ogni 80 m circa trovi marker ⚔️ che scattano automaticamente.
3. La **Famiglia Vinci** si trova tra Monte Porzio e Rocca di Papa: 6 allenatori in fila (nonno, nonna, papà, mamma, figlio, figlia).
4. I **Lab CoTrAL** appaiono come nuove zone sulla mappa: avvicinandosi partono incontri selvatici + sfide automatiche. Lab#1 ha Fulvia come boss, Lab#2 ha Crasso.
5. **Oggetti cura-stato**: compra un Antidoto al Market di Grottaferrata, subisci un "veleno" in battaglia, poi usa l'Antidoto dal menu Zaino.

### Prossimo passo → F10 (Team GdF narrativo)
Aggiungere le cutscene della trama GdF: furto Sfere al Museo di Nemi, Admin Fulvia e Tarcisio
come ostacoli narrativi (i loro dati sono già in Lab#1 e Lab#2), scontro finale al Cratere
del Vulcano con il Comandante Crasso. Vedi `docs/BIBBIA-NARRATIVA.md`.

---

## Sessione 10 — Motore mosse (effetti reali) + Allenatori auto-trigger

### Parte 1 — Battaglia: mosse con effetti reali (`battle.js`, `pokeapi.js`)
- **`pokeapi.js`**: `riduciMossa` ora estrae anche **priorità**, **bersaglio** (`user`/avversario),
  **effetto di stato** (`meta.ailment` + `ailment_chance`), **cambi di statistica**
  (`stat_changes` + `stat_chance`). Auto-migrazione cache vecchia (sentinella `priorita`).
- **Priorità**: l'ordine del turno guarda prima la **priorità** della mossa (Attacco Rapido,
  Contrattacco…), poi a parità la **velocità effettiva**. (`turnoCompleto` + `velocitaEffettiva`)
- **STAB ×1.5** ed **efficacia tipi** (×2/×0.5/×0) tramite `TABELLA_TIPI`: già attivi, mantenuti
  e ora combinati con gli sbalzi di statistica.
- **Stati alterati** (gestiti ogni turno): **paralisi** (25% salta il turno, velocità ½),
  **sonno** (1-3 turni), **veleno** e **scottatura** (1/8 HP a fine turno; la scottatura dimezza
  anche l'Attacco fisico), **congelamento** (20% di scongelarsi). Tag sul pannello (es. `[PAR]`).
  Immunità per tipo (Veleno/Acciaio↛veleno, Fuoco↛scottatura, Ghiaccio↛congelamento).
  La cura completa (Centro, Dormi, blackout) azzera lo stato.
- **Mosse di stato pure** (senza potenza): non fanno danno ma applicano l'effetto (es. Tuono­nda
  → paralisi) o i **cambi statistica** (Crescita +Att/+AttSp su di sé, Urlo −Dif all'avversario).
  Sbalzi −6…+6, formula Gen 3; si resettano al cambio Pokémon e a inizio lotta.
- **Effetti secondari** delle offensive (es. 30% paralisi di Corposcontro) via `ailment_chance`.
- **Accuratezza**: tiro di precisione con `accuracy` + sbalzi di Precisione/Elusione (`colpisce`).
- Il set mosse ora include anche le mosse di stato **gestibili** (prima erano escluse).
  *Nota:* i Pokémon già in squadra da salvataggi vecchi mantengono le mosse "vecchie" (solo danno)
  finché non si ricreano/evolvono; i nemici usano sempre i nuovi effetti.

### Parte 2 — Allenatori sui percorsi con auto-trigger
- **24 allenatori** totali (`ALLENATORI` in data.js), **3-4 per percorso tra le città**:
  Percorso Tuscolana 4 · Vigne Frascati 3 · Boschi Tuscolo 4 · Vigne Marino 3 · Boschetto 1 ·
  Grotta del Vulcano 3 · Monte Cavo 2 · **nuova tratta Campagna Ariccia→Genzano 4** (Lv 30-40,
  colma il salto verso la Lega).
- **Auto-trigger stile classico**: passando **entro 80 m** da un allenatore non ancora battuto,
  la sfida parte **da sola** (`controllaAllenatoriVicini` in `alPasso`). Niente clic.
  Anti-loop: dopo una sconfitta non si ri-triggera finché non esci dal raggio
  (`stato.allenatoreCooldown`); battuto una volta resta battuto (`stato.allenatoriBattuti`).
- Resta possibile anche cliccare il marker ⚔️ (richiede di essere vicino).

### Verifiche effettuate
- `node --check` su tutti i JS: OK. Test logico (Node): 24 allenatori, id unici, ID ≤ 386,
  squadre 1-4, premi > 0, dialoghi completi; distribuzione per zona corretta (3-4 per percorso).

### Come testare (per l'utente)
1. **Svuota la cache mosse** per scaricare i nuovi campi: F12 → Console → `PokeAPI.svuotaCache()`
   → poi ricarica. (Così le nuove mosse hanno priorità/effetti.)
2. **Stati alterati**: lotta con selvatici/allenatori. Vedrai messaggi tipo "X è paralizzato!",
   "X è avvelenato!", il tag `[PAR]`/`[VEL]` accanto al nome, e i danni a fine turno. Un Pokémon
   paralizzato a volte "non riesce a muoversi"; addormentato salta i turni.
3. **Priorità**: se il nemico usa Attacco Rapido (priorità) colpisce prima anche se più lento.
4. **Cambi statistica**: alcune mosse mostrano "Attacco è aumentato!" / "Difesa è diminuita!".
5. **Allenatori auto**: cammina lungo la Via Tuscolana o nei boschi: avvicinandoti a un ⚔️
   parte la sfida da sola. Se perdi e resti lì non si ripete; allontanati e torni a poterlo sfidare.
   Dopo averlo battuto, non ti ferma più.

### Prossimo passo → F10 (Team GdF)
Grunt/Admin del Team GdF, cutscene del furto delle Sfere al Museo di Nemi, covo e scontro al
cratere. (Vedi `docs/BIBBIA-NARRATIVA.md` e `docs/COORDINATE-NUOVI-LUOGHI.md`.)

---

## Sessione 9 — F9.2 Economia/Market + NPC e Donatori MN (codice)

### Parte 1 — Economia e Poké Market

### Cosa è stato fatto
- **💰 Economia (Pokéyen, simbolo ₽)**:
  - `stato.soldi` parte da **3000** (costante `SOLDI_INIZIALI` in data.js).
    Migrazione retro-compatibile dei vecchi salvataggi (chi non ha `soldi` riceve 3000).
  - Si **guadagnano battendo allenatori e Capipalestra** (importi in data.js):
    palestre = level cap × 100 (**1400 → 2100 → 2800 → 3400 → 4000 → 4600 → 5200 →
    5800**); rivincite di Remo (2800/4600/5800); prima sfida di Remo al lab (500).
    Accredito in `battle.js → nemicoSconfitto` (messaggio "Hai ricevuto ₽…").
  - Saldo mostrato nell'HUD (riga ₽), nella tab Salva e nella tab Market.
- **🛒 Poké Market** (`POKE_MARKET` in data.js): **9 negozi** (Borgata di partenza +
  8 comuni), ognuno accanto al proprio Centro Pokémon. Merce **a progressione**
  (base → metà → tardo) come da BIBBIA: Borgata (Poké Ball, Pozione) → Frascati/
  Grottaferrata (+ Superpozione) → Marino (+ Super Ball) → Monte Porzio (+ Iperpozione)
  → Rocca (+ Ultra Ball, Revitalizzante) → Albano (+ Repellente) → Ariccia/Genzano (tardo).
  - Nuovo marker **🛒** sulla mappa (`map.js`), popup "Entra nel Market" (raggio 150 m).
  - Nuova **tab "🛒 Market"** nel menu ☰: saldo + merce con prezzo e pulsante **Compra**
    (1 pezzo a clic, disabilitato se mancano i soldi). Lontano da un market → messaggio.
- **Nuovi oggetti** (`OGGETTI` con campo `prezzo`): Poké/Super/Ultra Ball (bonus
  1.0/1.5/2.0, usabili in battaglia), Pozione/Superpozione/Iperpozione (20/50/200 HP),
  **Revitalizzante** (risveglia un KO a metà HP, dal menu Zaino), **Repellente**
  (niente incontri per **100 passi**, `stato.repellentePassi`, gestito in `alPasso`).
  Zaino ripulito: mostra solo gli oggetti che possiedi (anche in battaglia: solo Ball/Pozioni).

### Nota di scope (consapevole)
- Gli oggetti **cura-stato** della BIBBIA (Antidoto, Antiparalisi, Antiscottatura,
  Antidoto totale) **non sono ancora in vendita**: il motore non ha le alterazioni di
  stato (veleno/paralisi…), quindi sarebbero inutili. Si aggiungono con le alterazioni.

### Verifiche effettuate
- `node --check` su tutti i JS: OK. Test logico (Node): ogni merce dei 9 market esiste
  in OGGETTI e ha un prezzo; tutte le 8 palestre e le 3 rivincite hanno il premio. ✅

### Come testare (per l'utente)
1. **Ricarica.** Nell'HUD (in alto a sx) c'è la riga **₽** col portafoglio (3.000 a nuova
   partita; i salvataggi vecchi ricevono 3.000 d'ufficio).
2. Menu **☰ → 🛒 Market**: lontano da un negozio vedi solo il saldo + un avviso.
3. Sulla mappa, vicino a ogni **🏥**, c'è un **🛒**: cammina fin lì (entro 150 m),
   cliccalo → **"Entra nel Market"** → **Compra**: il saldo scende, "Ne hai" sale.
4. **Repellente** (da Albano in poi): ☰ → 🎒 Zaino → **Usa** → cammini 100 passi senza
   incontri (poi un toast ti avvisa).
5. **Revitalizzante**: con un Pokémon KO, ☰ → 🎒 Zaino → **Usa** → scegli il KO → torna a metà HP.
6. **Guadagni**: batti una palestra o una rivincita di Remo → "Hai ricevuto ₽…" e il saldo sale.

### Parte 2 — NPC delle città + Donatori MN (codice)
- **💬 NPC "gente del posto"**: un marker 💬 per comune (`ABITANTI` in data.js, 12 punti:
  Borgata + 8 comuni + Castel Gandolfo + Nemi + Colonna). Parlandoci esce una **battuta
  casuale** tra quelle del paese (testi presi da `docs/DIALOGHI-NPC.md`, con mezzi indizi:
  grigioverde=GdF, cantina strana=Bunkerino, cosa grossa nel lago=Kyogre). Entro 150 m.
- **🎁 Donatori delle MN** (`DONATORI_MN` in data.js) — marker 🎁 dedicati:
  - **MN Taglio** — *Fra' Potatore*, Grottaferrata (Abbazia), da **2 Medaglie**.
  - **MN Surf** — *Nonna Assunta*, verso il Lago Albano, da **5 Medaglie**.
  - **MN Volo** — *Faustino il funicolarista*, Rocca di Papa (funivia), da **6 Medaglie**.
  - Logica: se non hai medaglie a sufficienza → dialogo "torna più tardi"; se ce le hai →
    consegna la MN (`stato.mn = {taglio, surf, volo}`); se già presa → dialogo di saluto.
- **Effetti reali delle MN**:
  - **Surf** → sblocca **Lago Albano** e **Lago di Nemi** (zone `locked` in world.js): ora
    ci si entra e partono gli incontri d'acqua. Il lucchetto è gestito in app.js
    (`zonaBloccata`) in base alle MN possedute; `World.estraiIncontro` non blocca più da solo.
  - **Taglio** → sblocca una **nuova zona**: *Boschetto Segreto* dietro l'Abbazia
    (`boschetto-taglio` in world.js, Lv 9-15, forme intermedie). Stessa meccanica del Surf.
  - **Volo** → pulsante **✈️** in basso a destra (appare solo con la MN): apre la lista dei
    **comuni già visitati** (`stato.cittaVisitate`, popolato avvicinandosi ai Centri) e ti
    **teletrasporta** lì (`GameMap.teleporta`). Niente incontri all'atterraggio.
- MN possedute mostrate nella tab **Salva**. Migrazione salvataggi (mn + cittaVisitate).

### Verifiche effettuate (Parte 2)
- `node --check` su tutti i JS: OK. Test logico (Node): 12 gruppi ABITANTI con id unici e
  battute complete; 3 donatori con mn/medaglie/dialoghi validi; `trovaZona` riconosce il
  Boschetto e i laghi; `estraiIncontro` ora produce incontri sulle zone ex-locked; tutti
  gli ID ≤ 386 e livelli nel range. ✅

### Come testare (Parte 2, per l'utente)
1. **Ricarica.** Vicino a ogni paese c'è un **💬**: cliccalo → "Parla" → ogni volta una
   battuta diversa della gente del posto (anche a Castel Gandolfo, Nemi e Colonna).
2. **MN Taglio**: con ≥2 Medaglie vai a Grottaferrata (Abbazia), trova il **🎁** *Fra' Potatore*
   → ricevi la MN. Cammina verso il **Boschetto Segreto** (a SO di Grottaferrata): prima dava
   "🔒 richiede MN Taglio", ora ci entri e trovi Pokémon.
3. **MN Surf**: con ≥5 Medaglie cerca il **🎁** *Nonna Assunta* verso il Lago Albano → ricevi
   Surf → avvicinati al Lago Albano o di Nemi: niente più lucchetto, partono gli incontri.
4. **MN Volo**: con ≥6 Medaglie trova *Faustino* alla funivia di Rocca di Papa → ricevi Volo
   → compare il pulsante **✈️**: premilo, scegli un comune visitato, ci voli all'istante.
   (Le città si "sbloccano" per il Volo passando vicino ai loro Centri Pokémon 🏥.)

### Parte 3 — Allenatori di percorso e dungeon (codice)
- **⚔️ 16 allenatori** (`ALLENATORI` in data.js), marker ⚔️ sulla mappa, sfidabili **una
  volta sola** (poi danno solo una battuta). Squadre coerenti col livello della zona,
  premio in Pokéyen alla vittoria (riusa `Battle.avvia({allenatore})` + reward F9.2).
  Sconfitti tracciati in `stato.allenatoriBattuti`; conteggio nella tab Salva.
  Distribuzione lungo il path (verificata con `trovaZona`):
  - Percorso Tuscolana ×2 (Lv 5-7) · Vigne di Frascati ×2 (Lv 7-9)
  - **Boschi del Tuscolo (dungeon) ×4** (Lv 8-12) · Vigne di Marino ×2 (Lv 8-10)
  - Boschetto Segreto ×1 (Lv 13-14, post-Taglio) · **Grotta del Vulcano (dungeon) ×3** (Lv 17-20)
  - **Monte Cavo (pre-Lega) ×2** (Lv 40-44)
  - Classi a tema: Vendemmiatore, Coleotterista, Archeologa, Speleologo, Minatore,
    Piromane, Alpinista, Veterano… con mezzi indizi di trama (cosa nel lago, bagliore
    rosso in grotta, Pokémon verde tra le rovine = Celebi).

### Verifiche effettuate (Parte 3)
- `node --check` su tutti i JS: OK. Test logico (Node): 16 allenatori con id unici,
  squadre non vuote, **tutti gli ID ≤ 386**, premi > 0, dialoghi completi; ognuno cade
  nella zona prevista e i livelli crescono lungo il path. ✅

### Come testare (Parte 3, per l'utente)
1. **Ricarica.** Lungo i percorsi e dentro i boschi/grotte vedi marker **⚔️**: cliccali →
   "Sfida!" → lotta da allenatore (niente fuga/cattura) → alla vittoria guadagni Pokéyen.
2. Un allenatore battuto, se ricliccato, dice solo una battuta (niente rivincita).
3. In menu ☰ → Salva vedi "⚔️ Allenatori battuti: N/16".
4. Prova i dungeon: **Boschi del Tuscolo** (4 allenatori) e **Grotta del Vulcano** (3):
   sono più "densi", come nei giochi.

### Stato F9
**F9 sostanzialmente completa**: tempo, economia+market, NPC+donatori MN, dungeon
popolati e allenatori di percorso. (Restano rifiniture estetiche e i luoghi-evento, che
però appartengono alla trama dei team/leggendari.)

### Prossimo passo → F10 (Team GdF)
Grunt e Admin del **Team GdF** lungo il path e nei dungeon, la **cutscene del furto delle
Sfere al Museo delle Navi di Nemi**, il covo e lo **scontro al cratere** (Grotta del
Vulcano). Coordinate dei luoghi in `docs/COORDINATE-NUOVI-LUOGHI.md`, trama in
`docs/BIBBIA-NARRATIVA.md`. Costanti `TEAM_GDF_NOME`/`TEAM_COTRAL_NOME` da introdurre.

---

## Sessione 8 — 13 giugno 2026 (DESIGN NARRATIVO, niente codice)

### Cosa è stato deciso (canon per F9-F12) — dettaglio in `docs/BIBBIA-NARRATIVA.md`
- **DUE team antagonisti**:
  - **Team GdF** (pre-Lega) — meteo & business: vuole svegliare **Kyogre + Groudon** per
    controllare il meteo e l'economia. Ruba le **Sfere/pietre** al **Museo delle Navi Romane
    di Nemi** (luogo vero, coi relitti) e scappa davanti al giocatore in una **cutscene**.
    Capo **Crasso**, Admin **Fulvia** (acqua) e **Tarcisio** (terra). Climax: scontro al cratere.
  - **Team CoTrAL** (post-Lega) — scienza & clonazione: **scissione del GdF**. **Progetto 150
    → Mewtwo** (da DNA di Mew). Due **lab-dungeon** con indizi (~dopo P3 Marino e ~dopo P6
    Albano). Base nel **Bunkerino** (Colonna): **cantina-laboratorio** (botti, conserve, roba
    d'orto) → sfidi i resti CoTrAL → **Mewtwo davanti al grande camino**. Colpo di scena:
    Mewtwo ha già sconfitto i creatori. Boss = **doppia Mewtwo + Mew** (Mew IA).
  - Nomi team in costanti sostituibili: `TEAM_GDF_NOME`, `TEAM_COTRAL_NOME`.
- **Sistema del TEMPO**: `stato.tempo = {giorno, minuti}`, scorre coi passi; **"Dormi" al PC
  del Centro Pokémon** con scelta dell'ora del risveglio → cura + avanza il conta-giorni +
  scatena gli eventi a tempo (pioggia/Zapdos, alba/Ho-Oh, notte/Ariccia, giorni dispari/Jirachi).
- **LEGGENDARI (Gen 1-3) definitivi** — un solo "di casa" per luogo:
  Articuno (funivia Rocca di Papa), Zapdos (Osservatorio, temporale), Moltres (Via Vittoria),
  Mewtwo (Bunkerino), **Mew (Villa Aldobrandini, Frascati)**, Raikou/Entei/Latias/Latios/
  Suicune (**roaming sfalsati**; Suicune 1ª volta al lago), Lugia (**Monte Cavo**), Ho-Oh
  (alba, **Piuma** da catena di buone azioni + **Porchettari** + cellula CoTrAL), Celebi
  (Tuscolo), **trio Regi** (Tuscolo, 3 anfratti, enigmi in **latino**: servono ≥3 Pokémon di
  tipo **Terra/Volante/Buio**), Kyogre (Lago Albano), Groudon (Grotta del Vulcano), **Rayquaza
  (Frascati, Piazza San Rocco: premi la fontana con Kyogre+Groudon in squadra → dungeon)**,
  Jirachi (Osservatorio, di **notte nei giorni dispari**, dopo 5 osservazioni al telescopio),
  Deoxys (**Luna**, da volontario astronauta alla base di lancio del "parcheggione" di Grottaferrata).
- **CITTÀ sviluppate** (scheletro): luoghi, Poké Market a progressione, NPC con nomi locali e
  **filler NPC** (gente random) in `docs/DIALOGHI-NPC.md`.
- **COORDINATE dei luoghi nuovi** (Museo Navi, Villa Aldobrandini, fontana San Rocco, funivia,
  Osservatorio-evento, parcheggione, Bunkerino, 2 Lab CoTrAL, Ponte di Ariccia + 3 Centri
  Pokémon mancanti) pronte in `docs/COORDINATE-NUOVI-LUOGHI.md`.
- **Campione della Lega = Remo** (chiude il gancio aperto).

### Nuovi documenti nella repo
- `docs/BIBBIA-NARRATIVA.md` — fonte di verità sulla storia.
- `docs/DIALOGHI-NPC.md` — battute filler degli NPC, città per città.
- `docs/COORDINATE-NUOVI-LUOGHI.md` — coordinate dei luoghi nuovi da creare in F9-F11.
- `CLAUDE.md` aggiornato (due team, tempo, leggendari, città, Campione = Remo; rimanda ai doc qui sopra).

### Riconciliazione col codice (gap analysis, non bloccante)
- `NOME_TEAM` (data.js) → rinominare in `TEAM_GDF_NOME` e aggiungere `TEAM_COTRAL_NOME` (F10).
- Centri Pokémon mancanti: **Borgata Tuscolana** (serve per "Dormi"!), Castel Gandolfo, Nemi (F9).
- Mancano economia, tempo, MN, donatori, market: tutto F9. Mancano i marker/zone dei luoghi nuovi: F9-F11.
- `LEGA`: aggiungere Campione = Remo + pool Superquattro (F12). Sovrapposizione grotta-vulcano/monte-cavo: ok via priorità zone.

### Prossimo passo
**F9 (codice)** in 4 blocchi testabili: **F9.1 sistema del tempo** → F9.2 economia/market →
F9.3 NPC + donatori MN → F9.4 dungeon e laghi. Si parte dal tempo.

---

## Sessione 7 — 13 giugno 2026

### Cosa è stato fatto
- **🍬 MODALITÀ TEST (richiesta utente)** — interruttore `MODALITA_TEST` in cima a
  `data.js`, **da mettere a `false` a gioco completo**:
  - Con `true`: 999 **Caramelle Rare** nello zaino a ogni avvio. Si usano dal
    menu ☰ → Squadra → dettagli Pokémon → pulsante "🍬 Caramella Rara": +1 livello
    immediato con statistiche, nuove mosse ed **evoluzioni** (stessa logica della
    battaglia, via `Battle.caramellaRara`). Rispetta il level cap.
  - Con `false`: le caramelle spariscono da zaino e menu (rimosse anche dai
    salvataggi al caricamento). Niente caramelle nel menu Zaino in battaglia.
- **F8 — Le altre 7 palestre: COMPLETATA ✔**
  - Capipalestra 2-8 in `data.js` con dialoghi a tema locale e **asso sempre al
    level cap** (verificato via test):
    - P2 Grottaferrata: **Nilo** (Psico) — Medaglia Icona
    - P3 Marino: **Moro** (Acqua) — Medaglia Fontana
    - P4 Monte Porzio: **Stella** (Elettro) — Medaglia Stella
    - P5 Rocca di Papa: **Rocco** (Roccia) — Medaglia Cratere
    - P6 Albano: **Massimo** (Lotta) — Medaglia Legione
    - P7 Ariccia: **Ombretta** (Buio) — Medaglia Fraschetta
    - P8 Genzano: **Flora** (Folletto) — Medaglia Infiorata
  - **Squadre potenziate su richiesta utente**: 4 → 6 Pokémon (crescenti lungo il
    path) e specie con BST più alto (Gyarados, Ampharos, Aggron, Machamp, Houndoom,
    Gardevoir come assi…). Tutte ≤ ID 386, senza doppioni interni.
  - **EXP scalato**: +50% di esperienza per ogni medaglia ottenuta (i livelli alti
    non richiedono grinding infinito).
  - **Rivincite del rivale** (potenziate dopo feedback utente "troppo facile"):
    Remo intercetta il giocatore davanti a TRE palestre, asso sempre al level cap:
    - **Marino** (cap 28): Pidgeotto 25, Mightyena 26, Kadabra 26, starter evoluto 28
    - **Albano** (cap 46): Pidgeot 43, Alakazam 43, Mightyena 44, Flygon 44, starter finale 46
    - **Genzano** (cap 58): 6 vs 6! Pidgeot 54, Alakazam 55, Absol 55, Flygon 56,
      Snorlax 56, starter finale 58
    Va battuto per accedere alla palestra (flag `remoRivincita1/2/3`); se perdi puoi
    riprovare. Inoltre nel laboratorio il suo starter parte a **Lv.6** (uno in più del
    tuo: vantaggio classico del rivale). Dati in `RIVALE_TAPPE` (data.js).

### Verifiche effettuate
- Sintassi OK. Test Node: 8/8 palestre con capopalestra, asso = levelCap per tutte,
  ID ≤ 386, squadre senza doppioni, dimensioni crescenti (4,5,5,5,5,6,6,6),
  starter1/starter2 del rivale validi per tutti i 9 starter possibili.

### Come testare (per l'utente)
1. Ricarica. Menu ☰ → Zaino: vedi **999 Caramelle Rare** 🍬.
2. Menu ☰ → Squadra → clicca un Pokémon → **"🍬 Caramella Rara"**: +1 livello a click
   (toast con livello/mosse/evoluzioni). Al cap si blocca con l'avviso medaglia.
3. Con le caramelle porta la squadra al cap e fai il giro del path:
   Grottaferrata → **davanti a Marino ti ferma Remo!** → battilo → palestra di Moro
   (occhio al Gyarados!) → Monte Porzio → Rocca di Papa → **Remo di nuovo davanti
   ad Albano** → Massimo → Ariccia (di notte… si fa per dire) → Genzano.
4. Dopo l'8ª medaglia il level cap arriva a 60 e Flora ti annuncia la Via Vittoria.
5. Ricorda: cura al 🏥 tra una palestra e l'altra (i PP non si rigenerano da soli).

### Correzione dopo feedback utente (13/6)
- Lo **Zaino fuori battaglia era solo in visualizzazione** (niente pulsante Usa):
  ora Pozioni e Caramelle Rare hanno il pulsante **"Usa"** nella tab Zaino →
  si sceglie il Pokémon bersaglio → effetto applicato → si resta sulla schermata
  per usi multipli (comodo per le caramelle a raffica). Le Pozioni non funzionano
  sui KO (serve il Centro 🏥, come nei giochi). Le Ball restano solo da battaglia.
- Il pulsante 🍬 nei dettagli del singolo Pokémon (Squadra → click) resta attivo.

### Note tecniche per le prossime sessioni
- Per spegnere la modalità test: `MODALITA_TEST = false` in cima a data.js. Fatto ciò
  le caramelle scompaiono ovunque automaticamente.
- L'EXP scalato è in `battle.js → nemicoSconfitto` (moltiplicatore 1 + 0.5×medaglie).
- Le rivincite di Remo sono dati puri (RIVALE_TAPPE): aggiungerne altre è banale.

### Prossimo passo
**F9 — Path, percorsi, dungeon, MN + città vive** (scope concordato con l'utente il 13/6):
1. **Economia e soldi**: gli allenatori di percorso (densità stile RossoFuoco ×1.5)
   e i capipalestra pagano in denaro quando battuti.
2. **Poké Market** in ogni comune: Poké/Mega/Ultra Ball, Pozioni/Superpozioni,
   **Repellenti** (niente incontri per N passi), Revitalizzanti.
3. **NPC nelle città**: personaggi con dialoghi (sistema già pronto), regali,
   e i **donatori delle MN** (Taglio ~post palestra 2, Surf via evento ~post 5-6,
   Volo ~post 6) con i gate che aprono laghi e scorciatoie.
4. Dungeon: Boschi del Tuscolo, Grotta del Vulcano; laghi sbloccati da Surf.
> Nota: le CASE con interni non si possono fare sulla mappa OSM — arrivano in F14
> con la grafica cartoon. In F9 gli NPC stanno "davanti agli edifici".
> L'utente sta scrivendo la STORIA: se pronta prima della F9, i dialoghi degli NPC
> e del Team GdF seguono la sua trama (altrimenti placeholder rinominabili).

---

## Sessione 6 — 12 giugno 2026 (modifiche su richiesta utente)

### Cosa è stato fatto
- **Booster ⏩ esteso alla battaglia**: la pausa dei messaggi (1,7 s) ora è divisa per
  la velocità scelta (x1/x2/x3/x5) — a x5 la lotta scorre velocissima. Il click sul
  messaggio continua a farlo avanzare subito.
- **LIMITE GENERAZIONI: solo Gen 1-2-3 (ID 1-386)** — decisione di design dell'utente:
  - `pokeapi.js`: ID_MAX 649 → **386** (vale per Pokémon, evoluzioni, tutto).
  - Verificato che TUTTE le 86 voci delle tabelle incontri di world.js fossero già
    ≤ 386 (max: 322 Numel) — nessuna zona da correggere.
  - **CLAUDE.md aggiornato**: limite nello stack, leggendari riprogettati in chiave
    Gen 1-3/Smeraldo (Kyogre nel Lago Albano, Suicune a Nemi, **Groudon nella Grotta
    del Vulcano** al posto di Heatran — è lui che il Team GdF vuole risvegliare —,
    Rayquaza su Monte Cavo, trio Regi nelle rovine, uccelli leggendari), pool
    Superquattro 1-386, stato attuale F1-F7.
- **Scelta starter in 2 passi** (laboratorio): prima la **generazione**
  (Kanto/Johto/Hoenn, carte con i nomi del trio), poi uno dei **3 starter di quella
  gen** (carte con sprite e tipi). Dati in `STARTER_PER_GEN` (data.js).
- **IL RIVALE — Remo** (come Romolo e Remo): appena scegli lo starter, irrompe nel
  laboratorio. Sceglie — da una **generazione casuale** tra le tre — lo starter del
  **tipo forte contro il tuo** (`CONTRO_TIPO`: Erba→Fuoco, Fuoco→Acqua, Acqua→Erba),
  te lo annuncia con sfottò e ti **sfida subito** (lotta allenatore Lv.5, vincibile o
  perdibile senza penalità). Salvato in `stato.rivale` {nome, idStarter, gen} per le
  **rivincite future lungo il path** (F8+). Dialoghi diversi se vinci o perdi.

### Verifiche effettuate
- Sintassi OK. Test Node: incontri tutti ≤ 386 ✔, squadra Vinicio ✔, 3 gen × 3 starter
  con tipi in ordine erba/fuoco/acqua ✔, counter-starter del rivale trovabile per ogni
  combinazione scelta/gen ✔ (es. io Treecko → Remo: Charmander o Cyndaquil o Torchic).

### Come testare (per l'utente)
1. Ricarica. Prova il **⏩ in battaglia**: con x3/x5 i messaggi sfrecciano.
2. **Nuova partita** (menu ☰ → Salva → esporta backup → Nuova partita):
   laboratorio → dialogo → **scegli la generazione** → **scegli lo starter** →
   regali → **Remo ti sfida**: controlla che il suo starter sia del tipo forte
   contro il tuo e nota da che gen viene (casuale: riprova per vedere gen diverse).
3. Vinci o perdi: dialoghi diversi, poi il Professore ti manda verso Frascati.

### Prossimo passo
**F8 — Le altre 7 palestre** + prime **rivincite del rivale** lungo il path
(squadra di Remo che cresce col suo starter evoluto).

---

## Sessione 5 — 12 giugno 2026

### Cosa è stato fatto
- **Booster di velocità** (richiesta utente, quality-of-life): pulsante ⏩ sopra il d-pad
  che cicla **x1 → x2 → x3 → x5** sulla camminata (riduce l'intervallo tra i passi).
  Scelta salvata in `stato.velocita`, applicata anche a cammino già in corso.
- **F7 — Città di partenza + Prima palestra (Frascati): COMPLETATA ✔**
  - **Città di partenza "Quartiere Tuscolano"** (periferia di Roma sulla Via Tuscolana,
    41.842, 12.615): nuova zona urbana sicura in world.js (tasso incontri 3%, Lv 2-4,
    solo Rattata/Pidgey). **Le nuove partite iniziano qui** (a 73 m dal laboratorio);
    camminando a est si entra nel Percorso Tuscolana (tutorial). Verificato con test.
  - **Laboratorio del Prof. Castagno** (marker 🏫): alla prima visita dialogo di
    benvenuto → **scelta dello starter tra Treecko/Torchic/Mudkip Lv.5** (trio di
    Smeraldo, carte con sprite e tipi) → Pokédex + **10 Poké Ball + 5 Pozioni** in
    regalo. Visite successive: consigli. Lo zaino iniziale ora parte VUOTO (gli
    oggetti li dà il Professore). Rimosso lo starter di prova automatico di F5.
  - **Sistema dialoghi** stile GBA: riquadro crema in basso, nome del personaggio,
    pulsante "Avanti ▶", blocca il movimento. Riusabile per tutti gli NPC futuri.
  - **Battaglie allenatore in battle.js** (`Battle.avvia({allenatore: …})`):
    squadra nemica multipla creata in anticipo, "X manda in campo Y!" a ogni KO,
    **niente cattura** (Ball non sprecata) e **niente fuga**, EXP ×1.5 (come nei giochi).
  - **Palestra di Frascati attiva** (pulsante "⚔️ Sfida il Capopalestra" nel popup,
    entro 120 m): **Vinicio**, tipo Erba, squadra Shroomish Lv.11 / Oddish Lv.12 /
    **Roselia Lv.14** (asso = level cap, verificato). Dialoghi a tema vino/vigne.
  - **Vittoria → Medaglia Vigna**: `stato.medaglie`, **level cap sale a 21**
    (= asso di Grottaferrata), dialogo di premiazione con indicazione della prossima
    tappa. Le palestre 2-8 mostrano "🚧 aprirà in una prossima fase"; gate d'ordine
    già attivo (non puoi sfidare la palestra N senza N-1 medaglie).

### Verifiche effettuate
- Sintassi tutti i JS: OK. Test Node su geografia e dati:
  spawn→lab 73 m ✔, zona spawn = citta-partenza ✔, lab in zona sicura ✔,
  41.83/12.65 = percorso-tuscolana ✔, asso di Vinicio Lv.14 = levelCap ✔, ID ≤ 649 ✔.

### Come testare (per l'utente)
1. Ricarica la pagina. **Salvataggio esistente**: resti dove sei, con la tua squadra;
   il toast ti invita comunque dal Professore (puoi andarci: ti darà lo starter
   ufficiale + Ball + Pozioni in aggiunta a quello che hai).
   **Per provare l'esperienza completa da zero**: menu ☰ → Salva → esporta prima un
   backup → "Nuova partita".
2. Da zero: appari nel Quartiere Tuscolano, clicca il marker **🏫** → "Entra nel
   laboratorio" → dialoghi → **scegli lo starter** (carte con sprite!) → ricevi tutto.
3. Prova il **⏩**: clicca per passare a x2/x3/x5 e muoviti sulla mappa: si vola.
4. Cammina verso sud-est lungo la Tuscolana: incontri tutorial Lv 2-6. Allena lo
   starter (cap 14), cura al 🏥 di Frascati quando serve.
5. A Frascati clicca il marker 🏛️ → "⚔️ Sfida il Capopalestra" → dialoghi di Vinicio
   → lotta 3 contro la tua squadra. Niente fuga, niente catture!
6. Vinci → Medaglia Vigna, level cap a 21 (controlla menu ☰ → Salva). Ora Treecko
   può evolversi al Lv.16!
7. Riprova a cliccare la palestra: "Hai già la Medaglia Vigna". Prova Grottaferrata:
   "🚧 aprirà in una prossima fase".

### Note tecniche per le prossime sessioni
- Le palestre 2-8 si attivano aggiungendo il campo `capopalestra` in data.js:
  tutta la logica (gate ordine, medaglia, level cap) è già generica in
  `interagisciPalestra`/`vinciPalestra`. Asso SEMPRE al livello del levelCap.
- Il sistema dialoghi (`mostraDialogo(nome, righe)`) è pronto per NPC, eventi MN e Team GdF.
- `dialogoInCorso` evita dialoghi sovrapposti; le interazioni controllano anche `incontroAttivo`.
- Il Pokédex per ora è solo narrativo (flag `pokedexRicevuto`): la schermata con
  l'elenco specie viste/catturate può arrivare in F8+.
- Niente valuta/negozi ancora: ricompense in denaro previste con gli allenatori di percorso (F8/F9).

### Prossimo passo
**F8 — Le altre 7 palestre**: capipalestra 2-8 in data.js (squadre coerenti coi tipi
e i level cap del path), EXP scalato, e probabilmente i primi allenatori semplici
lungo i percorsi per non arrivare alle palestre sottoallenati.

---

## Sessione 4 — 12 giugno 2026

### Cosa è stato fatto
- **F6 — Squadra, zaino, salvataggio completo: COMPLETATA ✔**
  - **Menu di gioco** (pulsante ☰ MENU in alto a destra, blocca il movimento):
    - **⚡ Squadra**: card per ogni Pokémon (sprite, livello, tipi, barra HP).
      Cliccando: dettagli completi (statistiche, mosse con PP, EXP al prossimo livello,
      avviso level cap), **⬆ Sposta su** (cambia l'ordine: il primo scende in campo),
      **📦 Deposita nel Box** (disabilitato se è l'ultimo rimasto).
    - **🎒 Zaino**: oggetti con quantità e descrizione.
    - **📦 Box**: i Pokémon depositati o catturati a squadra piena, con **⬆ Preleva**
      (disabilitato a squadra piena).
    - **💾 Salva**: riepilogo (passi, squadra, medaglie, level cap), **Esporta**
      (scarica `pokemon-castelli-AAAA-MM-GG.json`), **Importa** (selettore file con
      validazione), **Nuova partita** (con doppia conferma).
  - **Centri Pokémon** (`CENTRI_POKEMON` in data.js): 8 marker 🏥 sulla mappa, uno per
    comune. Popup con pulsante "❤️ Cura la squadra": funziona solo entro 150 m
    (`RAGGIO_CURA`), ripristina HP e PP di tutta la squadra. Gratis, riusabile.
  - **Evoluzioni per livello** (`PokeAPI.getEvoluzione(id)`): legge specie + catena
    evolutiva da PokéAPI (2 fetch, poi cache), trova l'evoluzione con trigger
    "level-up" entro ID 649. In battaglia, dopo ogni level-up: sequenza classica
    "Cosa?! X si sta evolvendo! … si è evoluto in Y!" — cambia specie, tipi, sprite,
    statistiche base (HP attuali aumentati della differenza), mantiene mosse ed EXP.
    Le evoluzioni con pietre/scambio/amicizia (es. Eevee) sono rimandate.

### Verifiche effettuate
- Sintassi di tutti i JS: OK (node --check).
- `getEvoluzione` testata contro la VERA PokéAPI via Node: Treecko→Grovyle Lv.16 ✔,
  Pidgey→Pidgeotto Lv.18 ✔, Dragonite→nessuna ✔, Eevee→nessuna (solo pietre) ✔.

### Come testare (per l'utente)
1. Ricarica la pagina (F5). In alto a destra c'è **☰ MENU**: aprilo.
2. Tab **Squadra** → clicca Treecko → vedi statistiche, mosse e quanto manca al
   prossimo livello. Prova **Sposta su** quando avrai 2+ Pokémon (cambia chi
   combatte per primo).
3. Tab **Salva** → **Esporta**: scarica un file JSON nei Download. Poi prova
   **Importa** ricaricando quel file: la partita riparte identica.
4. Sulla mappa cerca i marker **🏥** (vicino ai centri dei paesi). Vai a Frascati,
   avvicinati al 🏥, cliccalo → "❤️ Cura la squadra". Se sei lontano ti dice di
   avvicinarti.
5. **Evoluzione**: porta Treecko al Lv.16 vincendo battaglie (o cattura un Caterpie
   nel Percorso Tuscolana e portalo al Lv.7: diventa Metapod!). Durante il level-up
   appare "Cosa?! ... si sta evolvendo!".
6. Cattura a squadra piena (6): il nuovo finisce nel **Box**, controlla la tab.

### Note tecniche per le prossime sessioni
- Il menu è inaccessibile durante le battaglie (corretto); la cura idem.
- `curaSquadraDaCentro` è globale perché chiamata dall'HTML del popup Leaflet.
- I negozi (comprare Ball/Pozioni) arrivano con le città in F7; la valuta non esiste ancora.
- Le Pozioni in battaglia curano solo il Pokémon in campo: la cura mirata a un
  membro della squadra può arrivare con F7 se serve.

### Prossimo passo
**F7 — Città di partenza + Prima palestra (Frascati)**: quartiere di partenza a Roma
sulla Tuscolana (Professore, scelta starter vera, Pokédex, prime Ball), poi la palestra
di Frascati: Capopalestra Erba, dialoghi, medaglia, sblocco level cap a 21.

---

## Sessione 3 — 12 giugno 2026

### Cosa è stato fatto
- **CLAUDE.md aggiornato dall'utente**: aggiunta la "⭐ Stella Polare" in cima — l'obiettivo è
  un RPG completo stile Pokémon Smeraldo; la mappa OSM è solo impalcatura temporanea (via in F14).
- **F5 — Battaglia selvatici: COMPLETATA ✔**
  - Nuovo file `js/battle.js` (modulo `Battle`): combattimento a turni completo.
    - **Istanze Pokémon**: statistiche calcolate dal livello (formule Gen-1-like:
      `stat = 2·base·lv/100 + 5`, `hp = 2·base·lv/100 + lv + 10`), fino a 4 mosse
      offensive scelte tra le più recenti del moveset level-up, PP reali.
    - **Danni**: formula classica `(2·Lv/5+2)·potenza·Att/Dif/50 + 2`, con STAB ×1.5,
      efficacia tipi (tabella completa 18 tipi in `data.js`), split fisico/speciale,
      variazione casuale 85-100%, tiro di precisione.
    - **Turni**: il più veloce attacca prima; il selvatico usa una mossa a caso.
    - **Menu**: ⚔️ Attacca (4 mosse con PP e badge tipo; "Scontro" se PP finiti),
      🔄 Pokémon (cambio, consuma il turno; gratis dopo un KO), 🎒 Zaino
      (Poké Ball ×10 e Pozioni ×5 iniziali), 🏃 Fuga (probabilità basata sulla velocità).
    - **Cattura**: formula su HP residui × bonus Ball (più è ferito, più è facile, 5-90%);
      il catturato entra in squadra (max 6) o nel Box.
    - **EXP e level-up**: `baseExp·livello/7`, curva di crescita Lv³, barra EXP,
      statistiche ricalcolate, nuove mosse apprese al livello giusto.
    - **LEVEL CAP attivo**: cap iniziale 14 (pre-Frascati); l'EXP si blocca al cap
      con messaggio "serve la prossima medaglia" (meccanica chiave di CLAUDE.md).
    - **Sconfitta**: squadra curata e si riprende il viaggio (blackout semplificato).
  - **Schermata battaglia stile GBA** in `index.html` + `style.css`: campo cielo/prato,
    sprite front del nemico (alto-dx) e back del proprio (basso-sx) su piattaforme,
    pannelli HP crema con barre verde/giallo/rosso, barra EXP blu, console messaggi
    (click per avanzare, o avanza da sola dopo 1,7 s), lampeggio dello sprite colpito.
    Rimossa la vecchia card "incontro" con solo Fuggi. Layout responsive per telefono.
  - **`js/pokeapi.js`**: aggiunti `baseExp` (con auto-migrazione della cache vecchia)
    e `PokeAPI.getMossa(nome, url)` — potenza, tipo, classe, precisione, PP e
    **nome italiano** della mossa, tutto in cache localStorage.
  - **`js/data.js`**: `TABELLA_TIPI` (efficacia completa 18 tipi), `OGGETTI`
    (Poké Ball, Pozione), `ID_STARTER_TEMPORANEO` (252 = **Treecko**, lo starter di
    Smeraldo!), `LEVEL_CAP_INIZIALE` (14).
  - **`js/app.js`**: stato esteso (squadra, box, zaino, levelCap, medaglie),
    starter di prova consegnato al primo avvio (in F7 arriverà il Professore),
    `triggeraIncontro` → `Battle.avvia(...)`, HUD con riga squadra
    (nome, livello, HP del primo Pokémon), reset di sicurezza di `incontroAttivo` al caricamento.

### Ritocco grafico (dopo test utente — tutto funzionante ✔)
- Battaglia ingrandita: sprite nemico 150→250 px, proprio 190→310 px, pannelli info
  più grandi (font 19 px), barre HP 9→16 px, barra EXP 7→11 px, messaggi 16→22 px,
  pulsanti menu 15→20 px, console 205→260 px. Versione telefono riproporzionata.

### Verifiche effettuate
- Sintassi di tutti i 6 file JS: OK (node --check).
- Tabella tipi validata via Node: 18 tipi, tutti i moltiplicatori ∈ {0, 0.5, 2},
  10 controlli incrociati con i giochi originali (es. Elettro→Terra = 0, Drago→Folletto = 0): OK.
- Formule controllate sui numeri reali: Treecko Lv5 = 19 HP / 9 Atk; un Pidgey Lv3 (15 HP)
  va KO in 2-3 colpi; ~21 EXP a vittoria, ~4-5 vittorie per salire di livello. Bilanciamento sano.

### Come testare (per l'utente)
1. Apri `index.html` (doppio click). Al primo avvio dopo l'aggiornamento appare il toast
   **"🎁 Hai ricevuto Treecko (Lv.5)..."** e nella HUD compare `⚡ Treecko Lv.5 · ❤️ 19/19`.
2. Cammina (click sulla mappa o frecce): al posto della vecchia card ora si apre la
   **schermata di battaglia** a tutto schermo.
3. Prova tutte le azioni: **Attacca** (guarda PP che scendono, barre HP animate,
   messaggi "È superefficace!"), **Zaino → Pozione**, **Zaino → Poké Ball** (indebolisci
   prima il nemico!), **Fuga**.
4. Cattura un Pokémon: comparirà nella HUD come `+1` e nel menu **Pokémon** in battaglia.
5. Vinci 4-5 battaglie: Treecko sale di livello (barra EXP blu sotto gli HP).
6. Console (F12): `stato.squadra` mostra la squadra completa; `stato.zaino` lo zaino.
7. Per ripartire da zero: F12 → Console → `localStorage.removeItem('pkc_salvataggio')` → ricarica.

### Note tecniche per le prossime sessioni
- `Battle.creaIstanza(id, livello)` è riusabile per allenatori/palestre (F7-F8) e per lo
  starter vero del Professore (F7): basta sostituire `assegnaStarterDiProva()` in app.js.
- Il level cap legge `stato.levelCap`: quando in F7/F8 una medaglia viene vinta, basta
  aggiornare `stato.levelCap = palestra.levelCap` della palestra successiva.
- I PP non si rigenerano dopo le battaglie (canonico): la cura completa arriva col
  Centro Pokémon in F6/F7. In emergenza c'è la mossa di riserva "Scontro".
- Le mosse di stato (senza potenza) per ora sono escluse dai moveset: da valutare in futuro.
- Le evoluzioni per livello sono pianificate in **F6** (insieme a gestione squadra completa,
  cura, esporta/importa salvataggio).

### Prossimo passo
**F6 — Squadra, zaino, salvataggio completo**: schermata di gestione squadra fuori battaglia
(ordina, guarda statistiche), cura/Centro Pokémon, evoluzioni per livello via PokéAPI,
esporta/importa salvataggio come file JSON.

---

## Sessione 2 — 11 giugno 2026

### Cosa è stato fatto
- **CLAUDE.md aggiornato dall'utente**: struttura ridefinita (8 palestre + Lega a Colonna, non 9),
  path progressivo Roma→Frascati→…→Genzano→Via Vittoria→Colonna, level cap, MN gate,
  Team GdF, Superquattro con sistema a pool, città di partenza su Roma. Tutti questi elementi
  sono **visione finale**, non obiettivi di questa sessione.
- **F4 — Zone e incontri: COMPLETATA ✔**
  - Nuovo file `js/world.js`: modulo `World` con 17 zone geografiche (ordinate per priorità).
  - Zone definite come cerchi (raggio in metri) o rettangoli, con geometria verificata:
    - Grotta del Vulcano (cerchio, 600 m, Lv 15-25, tasso 20%)
    - Lago di Nemi (cerchio, 800 m, Lv 25-40, **locked Surf**)
    - Lago Albano (cerchio, 1600 m, Lv 15-25, **locked Surf**)
    - 8 centri urbani (cerchi 350-450 m, tasso ridotto 5%) — listing corretto
    - Monte Cavo (cerchio, 1800 m, Lv 35-50)
    - Boschi del Tuscolo (cerchio, 1800 m, Lv 5-11)
    - Vigne di Marino/Frascati (cerchi, Lv 3-9)
    - Percorso Tuscolana (rettangolo Roma→Frascati, Lv 2-6, tutorial)
    - Campagna aperta (rettangolo fallback, Lv 4-12)
  - Ogni zona ha tabella incontri pesata (prob sommano a 100) con Pokémon ID 1-649 coerenti
    col terreno e con la posizione nel path (zone iniziali = non evoluti, zone avanzate = forme evolute).
  - Priorità zone: le zone specifiche (grotta, laghi, centri urbani) vengono controllate prima
    delle zone generali, evitando conflitti di sovrapposizione.
  - `World.trovaZona(lat, lon)`, `World.estraiIncontro(zona)`, `World.tassoIncontroZona(zona)`.
  - **Trigger incontri** in `app.js → alPasso()`: ogni 10 passi, check con probabilità zona
    (15% default, 5% urbano, 20% grotta). Zone locked → toast "🔒 richiede MN X" (una volta sola).
  - **Overlay incontro**: appare sullo schermo con zona, sprite fronte del Pokémon (da PokéAPI),
    nome, livello, tipo con badge colorati. Pulsante "🏃 Fuggi!" riprende il movimento.
    L'overlay blocca la mappa durante l'incontro (GameMap.bloccaMovimento/sbloccaMovimento).
  - **Toast** per notifiche rapide (zone bloccate, errori).
  - **HUD aggiornato**: mostra zona corrente con emoji terreno e range livelli; palestra vicina
    appare solo se a meno di 120 m (barra separata in giallo).
- **`js/data.js` aggiornato**:
  - 8 palestre (rimossa Colonna come palestra), ordine path corretto, levelCap aggiunto.
  - Colonna → costante `LEGA` con Superquattro (pool verrà in F12).
  - `TIPO_COLORI`, `TIPO_NOMI` (italiano), `TERRENO_ICONE` aggiunti.
- **`js/map.js`** aggiunto `bloccaMovimento()` / `sbloccaMovimento()` + flag `bloccato`.
- **`index.html`** + **`style.css`** aggiornati (overlay incontro, toast, HUD palestra, world.js).

### Verifiche effettuate
- Sintassi tutti i JS: OK.
- Zone lookup testato su 9 coordinate note: tutte corrette (inclusa priorità grotta > monte-cavo,
  urbano > zone naturali sovrapposte). Il punto 41.748,12.710 ricade nella grotta (350 m dal centro,
  raggio 600 m) — comportamento corretto.
- `World.estraiIncontro()` testato 200 volte per 5 zone: nessun null inatteso, livelli sempre
  nel range corretto.

### Correzioni zone (dopo test utente)
I bordi di 5 zone erano imprecisi. Corretti il 12 giugno 2026:
- **Boschi del Tuscolo**: raggio 1800 m → **1100 m** (scattava troppo presto)
- **Vigne di Frascati**: centro spostato sulle colline E/SE del paese, raggio 1100 → **950 m**
- **Vigne di Marino**: centro spostato a S di Marino (dove ci sono davvero le vigne), raggio 1000 → **850 m**
- **Lago Albano**: centro raffinato (41.748, 12.654), raggio 1600 → **1450 m**
- **Lago di Nemi**: centro era sul paese di Nemi (bordo cratere) → spostato sul **lago** (41.714, 12.713), raggio → **750 m**
Tutti i 9 punti di test confermati OK dopo la correzione.

### Come testare (per l'utente)
1. Apri `index.html` nel browser (doppio click).
2. La HUD mostra `🌿 Percorso Tuscolana (Lv 2-6)` se sei nell'area giusta, oppure
   `🏘️ Frascati (Lv 3-8)` se sei nel centro — **ogni zona ha la sua etichetta**.
3. Cammina facendo click sulla mappa o con le frecce. Dopo circa 10 passi c'è il 15% di
   possibilità di incontro. Continua a camminare, prima o poi appare l'overlay.
4. L'overlay mostra lo sprite del Pokémon, nome, livello, tipo con badge colorato.
   Premi **"🏃 Fuggi!"** per chiuderlo e riprendere.
5. Spostati verso il Lago Albano (a sudovest di Albano, circa lat 41.747 lon 12.656) — dovresti
   vedere un **toast giallo**: "🔒 Questa zona richiede MN Surf!".
6. Console (F12): `World.trovaZona(41.792, 12.737)` → `{id: 'boschi-tuscolo', ...}`.
7. Console: `World.estraiIncontro(World.trovaZona(41.792, 12.737))` → oggetto con `idPokemon` e `livello`.

### Note tecniche per le prossime sessioni
- **Callback battaglia**: `app.js` ha un punto predefinito in `triggeraIncontro(zona)` dove
  in F5 andrà la chiamata a `Battle.avvia(pokemon, livello, zona)`.
- `GameMap.bloccaMovimento()` / `sbloccaMovimento()` già implementati e usati.
- L'overlay incontro ha già i badge di tipo colorati pronti per F5 (barre HP, menu turni).
- Level cap e progressione palestre sono pronti in `data.js` (campo `levelCap`) ma non ancora
  applicati; verranno usati in F7.
- La città di partenza (Roma, Professore, primo Pokémon) è pianificata per F7.

### Prossimo passo
**F5 — Battaglia selvatici**: schermata di battaglia a turni (sprite back giocatore + front
avversario, barre HP, livelli), menu Attacca/Pokémon/Zaino/Fuga, formula danni Gen-1-like,
EXP e salita di livello, cattura con Poké Ball.

---

## Sessione 1 — 11 giugno 2026

### Cosa è stato fatto
- **F1 — Mappa: COMPLETATA ✔** — Leaflet, 8 marker palestra (ora aggiornati), attribuzione OSM.
- **F2 — Avatar e movimento: COMPLETATA ✔** — click-to-move, pulsanti, frecce, salvataggio posizione.
- **F3 — PokéAPI + cache: COMPLETATA ✔** — modulo `PokeAPI.getPokemon(id)`, cache localStorage.

---

## Stato fasi
- [x] F1 — Mappa
- [x] F2 — Avatar e movimento
- [x] F3 — PokéAPI + cache
- [x] F4 — Zone e incontri
- [x] F5 — Battaglia selvatici
- [x] F6 — Squadra, zaino, salvataggio completo
- [x] F7 — Città di partenza + Prima palestra (Frascati)
- [x] F8 — Altre 7 palestre + level cap progressivo
- [x] F9 — Path, dungeon e MN + città vive (tempo, soldi, Poké Market, repellenti, NPC, donatori MN, 16 allenatori)
- [x] F10 — Team GdF (Museo Navi, 5 Grunt, Labs, Fulvia, Crasso)
- [x] F11 — Leggendari ed eventi pre-Lega (Articuno, Zapdos, Celebi, Regi, Suicune)
- [x] F12 — Via Vittoria + Lega a Colonna (Superquattro pool) + F12b parziale (Lugia/Ho-Oh/oggetti mappa)
- [x] F13 — Pubblicazione GitHub Pages → https://monacellilu-hash.github.io/pokemon-castelli/
- [ ] F12b rimasto — Team CoTrAL / Bunkerino / Mew / Deoxys / Ho-Oh catena
- [ ] F14 — Grafica cartoon
