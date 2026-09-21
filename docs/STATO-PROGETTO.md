# STATO DEL PROGETTO — Pokémon Castelli Romani

> Documento riassuntivo "fotografia" dello stato attuale, aggiornato al **5 agosto 2026** (sessione
> di sola documentazione: nuova storia canonica da `STORIA.md`, verifica del codice reale). Questa
> versione **corregge diversi punti della fotografia del 3 agosto che erano già superati dal codice**
> (vedi §0) — non fidarsi di versioni precedenti di questo file per lo stato di Marino/Monte Porzio/
> Rocca di Papa/Osservatorio, erano stale.
> Non sostituisce `docs/ROADMAP.md` (diario sessione-per-sessione) né `CLAUDE.md` (stella polare/
> regole). Non sostituisce `docs/BIBBIA-NARRATIVA.md` (fonte di verità narrativa, v3).

---

## 0. Cosa è cambiato da questa verifica (correzioni rispetto alla fotografia del 3 agosto)

La versione precedente di questo documento diceva cose che **non sono più vere**, verificato leggendo
`js/map.js` e `dati/trainer.js` direttamente in questa sessione:

- ❌ *"Marino: la Medaglia Fontana non è ottenibile"* → **FALSO oggi**. Il trainer `gym_leader_palestra
  marino` (Moro, `palestraId: 'marino'`) risulta piazzato su `pokemon-castelli-palestra_marino.tmj`,
  registrata in `MAPPE` come `interno_palestra_moro`. La medaglia sembra ottenibile (il warp
  porta↔interno non è stato ripercorso a mano in questa sessione, solo verificato che i dati
  combaciano).
- ❌ *"monteporzio.tmj, Osservatorio.tmj e percorso_montano_v1.tmj disegnate ma NON registrate in
  MAPPE"* → **FALSO oggi**. Tutte e tre sono registrate (`js/map.js` righe 134, 150, 162), con anche
  Centro Pokémon/Market/palestra interna dedicati per Monte Porzio, e una città Rocca di Papa
  completa (con Centro/Market) collegata via warp `percorso_5 → monteporzio ↔ osservatorio ↔
  percorso_montano_v1 ↔ rocca_di_papa`.
- ❌ *"Il codice ha `NOME_TEAM`, da rinominare in `TEAM_GDF_NOME`"* (nota in `BIBBIA-NARRATIVA.md` v2)
  → **FALSO oggi**: `js/data.js:67-68` ha già `TEAM_GDF_NOME` e `TEAM_COTRAL_NOME` distinti.
- ⚠️ **NUOVO BUG trovato in questa sessione** (non era mai stato segnalato): il trainer **Stella**
  (capopalestra Monte Porzio) è piazzato su `pokemon-castelli-palestra_monteporzio.tmj` con id Tiled
  `"gym_leader_palestra monteporzio"` (**senza trattino**), ma la sua voce dati in `dati/trainer.js`
  usa la chiave `'gym_leader_palestra monte-porzio'` (**con trattino**) e `palestraId: 'monte-porzio'`.
  Il lookup è `DATI_TRAINER[id]`, un confronto **esatto** di stringa (`js/map.js:2079` e altre 3
  occorrenze) — quindi oggi quell'NPC molto probabilmente non trova i propri dati (nessuna squadra,
  dialogo, medaglia). **Verificato solo staticamente, non testato a runtime.**
- ✅ **GAP risolto in sessione successiva** (tipo Rocca di Papa cambiato Roccia→Lotta, capopalestra
  Rocco→Baso; Albano cambiato Lotta→Roccia, capopalestra Massimo→Giorgia; Genzano Folletto→Fuoco,
  capopalestra Flora invariata): entrambi gli interni palestra (Rocca di Papa e Albano) sono stati
  popolati in Tiled e registrati in `MAPPE` (`interno_palestra_rocco`, `palestra_albano_interno`).
  Non ancora ripercorsi a mano in game — verificare a runtime.
- ✅ **Confermato ancora vero**: `MODALITA_TEST = true` in `js/data.js:17`. Il pattern generico
  donatore (`condizione`/`dona_oggetto`/`una_tantum`) **non è implementato** in `js/map.js` (zero
  occorrenze di `dona_oggetto`/`una_tantum`) — i due donatori MN che funzionano oggi (Taglio a
  Frascati, Pokéflauto a Marino) usano un pattern diverso e reale: proprietà `azione` su un NPC che
  chiama una funzione JS dedicata (`donaTaglioFrascati`, `donaFlautoMarino` in `js/app.js`). Questo è
  il precedente da riusare per i prossimi donatori, non il pattern generico mai scritto.
- ℹ️ **Aggiornamento non-bug**: il ciclo giorno/notte visivo (velo colorato) e l'animazione dei tile
  acqua/cascata **sono stati implementati in questa stessa sessione applicativa** (non in questa
  sessione di documentazione) — vedi §2.1 e §9, non sono più "sistemi mancanti".

---

## 1. Il colpo d'occhio

Il gioco gira interamente sul **motore a mappe Tiled** (`js/map.js`, formato `.tmj`, rendering
Phaser 3). Il vecchio motore con mappa reale Leaflet/OpenStreetMap (coordinate lat/lon) è **spento**
(`MAPPA_TILED = true` in `js/app.js`) ma non rimosso dal codice — `js/world.js` e gli array
`ALLENATORI`/`DONATORI_MN` di `js/data.js` sono relitti di quel motore, non eseguiti.

- **3 palestre su 8 hanno un capopalestra piazzato e dati corretti** (Frascati, Grottaferrata,
  Marino). **1 palestra ha il capopalestra piazzato ma con un bug di id che probabilmente lo rompe**
  (Monte Porzio/Stella — vedi §0). **Rocca di Papa (Baso, tipo Lotta) e Albano (Giorgia, tipo Roccia)
  hanno ora un capopalestra piazzato** (sessione odierna, da testare a runtime). **Ariccia e Genzano
  non hanno ancora nessuna mappa-interno palestra**.
- **Cluster di mappe continue** (world Tiled, cammino senza dissolvenza): `Castelli_prima`,
  `Castelli_lakes` (marino, lago_albano, interno_lago, lago_nemi, via_dei_laghi, percorso_4,
  castel_gandolfo, percorso_5), `Castelli_lasthree`, `FrascatiGrotta` (percorso_2, percorso_3,
  frascati_×5, grottaferrata) — rigenerati da `strumenti/genera_clusters.py` a partire dai `.world`
  di Tiled. **Monte Porzio/Osservatorio/percorso_montano_v1/Rocca di Papa non fanno parte di nessun
  cluster**: si raggiungono solo via warp con dissolvenza.
- Combattimento, cattura, evoluzioni, salvataggio, tempo/giorno-notte (incluso il **velo visivo**),
  level cap, MN (ostacoli sul mondo), animazione acqua/cascata sono implementati e funzionanti.
- **Le MN Surf/Volo/Spaccaroccia/Forza/Cascata/Sub non hanno ancora un modo per essere ottenute in
  partita** sulle mappe Tiled attuali (vedi §6) — solo Taglio funziona davvero. Le altre si sbloccano
  solo dal pulsante di test (`MODALITA_TEST`).

---

## 2. Cosa è stato fatto (per sistema)

### 2.1 Esplorazione e mappe (motore Tiled)
- Loader `.tmj` completo: livelli tile (`ground`, `deco_sotto`, `edifici`, `sopra_testa`), livello
  collisioni (`collisioni`), livello eventi/oggetti (`eventi`).
- Player con animazioni camminata/idle nelle 4 direzioni, cono visivo dei trainer, NPC fissi/random,
  trainer in pattuglia.
- Sistema di **warp/porte** fra mappe con `spawn_id` per atterrare sulla casella giusta.
- **Ostacoli MN** (`trigger_taglio`, `trigger_surf`, `trigger_sub`, `trigger_forza`,
  `trigger_spaccaroccia`, `trigger_cascata`): un oggetto rettangolare blocca il passaggio finché non
  possiedi la MN giusta (`stato.mn.<nome>`, **un solo flag**, non ancora sdoppiato in possesso/
  permesso — vedi §6); usandola si libera la casella (permanente per la sessione).
- **Surf "continuo"** su più caselle d'acqua adiacenti, si interrompe da solo a terraferma.
- **MN Volo**: tabella `VOLO_TILED` in `app.js`, un punto di atterraggio per città visitata. Coperta
  per Borgata Tuscolana, Frascati, Grottaferrata, Marino, Castel Gandolfo (Monte Porzio/Rocca di
  Papa/Albano da verificare/aggiungere quando le città sono complete).
- Zone di incontro selvatico (`erba_alta`, `acqua`) con tabelle pesate, Gen 1-2-3 (ID ≤ 386).
- **Ciclo giorno/notte visivo** (`_aggiornaVeloTempo`, `js/map.js`): velo colorato per fascia
  (alba/giorno/tramonto/notte) + lettura layer `luci` per finestre/lampioni. Attivo oggi su
  `frascati_centro` e su tutte le mappe del cluster `Castelli_lakes` (marino, lago di Albano/interno,
  lago di Nemi, via dei laghi, percorso 4, castel gandolfo, percorso 5) — whitelist
  `MAPPE_CON_VELO_TEMPO`, da estendere mappa per mappa dopo conferma visiva.
- **Animazione dei tile acqua/cascata** (`js/map.js`, `_animaAcqua`): tileset `Sea` (autotile a 8
  fotogrammi, bordi inclusi) e `Waterfall`/`Waterfall crest`/`Waterfall bottom` (4 fotogrammi
  lineari). Culling sulla vista camera per non appesantire cluster grandi. I tile GBA statici
  (Outside/Emerald_Outside) **non animano**: non hanno fotogrammi alternativi nel PNG (l'originale
  animava via palette-cycling hardware, perso nel rip) — dove serve l'animazione va ridipinto con
  `Sea`/`Waterfall`.
- Oggetti a terra raccoglibili, cartelli, eventi di storia (`trigger_storia`, gated a condizione),
  leggendari su mappa (sprite PokéAPI, solidi, interagibili — solo il Trio Regi oggi).

### 2.2 NPC, allenatori e il sistema dei "gate" (condizioni)
Vedi `docs/DIZIONARIO-TILED.md` per la tabella di riferimento completa.
- **NPC** (`type: npc`): dialogo da `dati/npc.js`. Possono avere `azione` (funzione globale, es.
  `donaTaglioFrascati`) invece di un dialogo fisso — **questo è il pattern reale per i donatori
  oggi**, non il pattern generico `dona_oggetto`/`condizione`/`una_tantum` (mai implementato).
- **Trainer** (`type: trainer`): dati in `dati/trainer.js`. `vista > 0` = sfida in automatico nel cono
  visivo. `pattuglia: true` + `direzione_ciclo` = va avanti e indietro.
- **Gate (condizioni)** — `condizione`/`richiede` su warp/NPC/trainer: flag di stato, medaglie
  (`"medaglie >= N"`), requisito di squadra in italiano, combinabili con `"e"`.
- **Vittoria su un trainer**: `flagVittoria` setta un flag; `palestraId` assegna la Medaglia e alza
  il level cap.
- **Sprite mancanti**: fallback casuale stabile, tranne personaggi di storia (restano invisibili
  finché non hanno lo sprite giusto). Team GdF sempre `NPC 20`.

### 2.3 Palestre e level cap
- Un trainer con `palestraId: '<comune>'`, se battuto, assegna Medaglia e alza il level cap
  (`vinciPalestraTiled` in `app.js`). **Non esiste** un oggetto Tiled dedicato "capopalestra": è solo
  un trainer normale. **Non esiste** un `gate_palestra` che blocchi l'ingresso al level cap sbagliato.
- **Stato reale per palestra** (verificato in questa sessione, vedi §0 e §3):
  | Palestra | Capopalestra nei dati | Piazzato su una mappa | Medaglia ottenibile oggi |
  |---|---|---|---|
  | Frascati (Vinicio) | ✅ | ✅ | ✅ |
  | Grottaferrata (Nilo) | ✅ | ✅ | ✅ |
  | Marino (Moro) | ✅ | ✅ | ✅ probabile (non ripercorso a mano) |
  | Monte Porzio (Stella) | ✅ | ✅ ma **id disallineato** (bug, vedi §0) | ⚠️ probabile NO |
  | Rocca di Papa (Baso, ex "Rocco" — tipo cambiato da Roccia a Lotta, sessione odierna) | ✅ dati | ✅ interno palestra popolato e registrato (sessione odierna, da testare a runtime) | ⚠️ probabile, non ripercorso a mano |
  | Albano (Giorgia, ex "Massimo" — tipo cambiato da Lotta a Roccia, sessione odierna) | ✅ dati (nuovi, sessione odierna) | ✅ interno palestra popolato e registrato (sessione odierna, da testare a runtime) | ⚠️ probabile, non ripercorso a mano |
  | Ariccia (Ombretta) | ❌ solo nome in dialoghi | ❌ | ❌ NO |
  | Genzano (Camilla, ex "Flora" nella v2) | ❌ | ❌ | ❌ NO |

### 2.4 Combattimento, cattura, squadra
- Turni classici, danni con STAB/efficacia tipi/livello, cattura su HP residui + Ball, EXP scalata,
  level-up bloccato al cap, evoluzioni per livello/pietra/felicità/scambio.
- Mosse a più turni: carica/ricarica, Furia+confusione, Esplosione/Autodistruzione, Protezione.
- Rivale Remo scalato per tappa. **Il secondo rivale (storia nuova, Atto VIII) non esiste ancora nei
  dati** — nessun trainer, nessuna squadra, nessun incontro cablato.
- Booster velocità battaglia/movimento ⏩ x1/x2/x3/x5.

### 2.5 Tempo, economia, salvataggio
- Ciclo giorno/notte (fasce orarie + velo visivo, vedi §2.1), "Dormi" al PC del Centro Pokémon.
- Soldi, zaino, repellente, salvataggio automatico su `localStorage` + esporta/importa JSON.

### 2.6 Narrativa e leggendari
- Team **GdF** e **CoTrAL** ridefiniti in `docs/BIBBIA-NARRATIVA.md` v3 (due capi GdF, password a 3
  parti, CoTrAL attivo durante il gioco, due rivali, Camilla, treno per Lugia — vedi quel documento).
  **Nessuno di questi elementi nuovi ha ancora codice/mappe**: sono solo testo di design.
  Il GdF ha contenuti giocabili solo per la parte v2 già esistente (Abbazia di Grottaferrata — porta
  sbarrata, Villa di Castel Gandolfo — 7 grunt + documento).
- Sistema leggendari: **solo il Trio Regi è davvero giocabile** (mappe `antro_regice/regirock/
  registeel` + `tuscolo_profondo`, gate a lingua antica/tipo). Tutti gli altri leggendari (compresi
  quelli con posizionamento aggiornato dalla storia nuova: Suicune/Nemi, Raikou/Entei roaming
  anticipato, Lugia/treno, Kyogre/rifugio Marino, Groudon/Grotta Vulcano, Jirachi/Osservatorio,
  Deoxys/tuta da Mewtwo) sono **solo testo**, nessuna mappa o trigger.

---

## 3. Le mappe esistenti — stato reale (verificato in questa sessione)

### 3.1 Registrate e (in teoria) giocabili — cluster continui

| Cluster/zona | Mappe | Note |
|---|---|---|
| `Castelli_prima` | `borgata_tuscolana`, `percorso_tuscolana`, `percorso_1b` | Partenza, tutorial |
| Boschi del Tuscolo | `tuscolo_ingresso/interno/rovine/profondo`, `boschetto_segreto` | 18 allenatori, Trio Regi |
| `FrascatiGrotta` | `frascati_sud/centro/est/ovest/nord`, `percorso_2`, `percorso_3`, `grottaferrata` | ✅ P1 Frascati completa. P2 Grottaferrata completa |
| — (warp, non cluster) | `marino` | ✅ P3 completa (Moro piazzato correttamente) |
| `Castelli_lakes` | `marino`*, `lago_albano`, `interno_lago`, `lago_nemi`, `via_dei_laghi`, `percorso_4`, `castel_gandolfo`, `percorso_5` | Castel Gandolfo = sotto-trama GdF (Villa, 7 grunt). *`marino` è anche testa del cluster lakes E del blocco warp sopra — vedi `js/clusters.js` |
| — (warp, non cluster) | `monteporzio`, `osservatorio`, `percorso_montano_v1`, `rocca_di_papa` | ⚠️ P4 Monte Porzio con bug id (§0). Rocca di Papa: città + PC/Market sì, palestra interna NO |
| `Castelli_lasthree` | `percorso_7`, `percorso_7b`, `albano`, `percorso_8`, `zona_safari`, `percorso_9`, `ariccia` | Città Albano/Ariccia disegnate, palestre NON ancora dentro |
| Antri Trio Regi | `antro_regice/regirock/registeel` | Gated Lega + 3 Pokémon di un tipo |

### 3.2 Interni ancora mancanti
> ⚠️ **Aggiornato 3 settembre 2026** (foto presa incrociando `docs/TODO.md` con i file reali in
> `sprites/maps_tiled/` — molte righe di questa lista erano superate dal lavoro di Luca su Tiled
> tra agosto e settembre e sono state corrette qui; vedi anche §0):
- ~~Interno palestra Rocca di Papa~~ / ~~Albano~~ / ~~Ariccia~~ / ~~Genzano~~ — **FATTO**: tutte e 4
  esistono e sono popolate (vedi `docs/TODO.md` Gruppo A).
- ~~Museo delle Navi di Nemi~~ — **FATTO** (12 agosto): 2 piani, popolato con grunt/boss/ostaggi.
- ~~Rifugio GdF di Marino~~ — **FATTO**: multi-piano cablato (`gdf_marino_1f`/`2f_a`/`2f_b`/`2f_c`);
  manca ancora il gate a password-in-3-parti vero (oggi si entra senza controlli).
- ~~Covo CoTrAL ai piedi di Monte Cavo~~ — **FATTO** (`collegamento_Cotral`), luogotenente presente.
- ~~Funivia + dungeon innevato~~ — **FATTO** (Monte Cavo: Articuno lv55 + miniboss, ghiaccio scivoloso).
- ~~Via Vittoria~~ — **FATTO** (5 piani + area segreta Moltres, 12 allenatori). ~~Colonna (Lega)~~ —
  **in gran parte FATTO**: Luca ha completato la Lega su Tiled (4 piani, `Lega_pokemon_1f/2f/3f/4f`),
  ma **solo `lega_pokemon`/`lega_pokemon_4f` sono registrate in `MAPPE`** oggi — 1f/2f/3f vanno
  ancora cablate. **Sala del Campione: nessun file esiste ancora**, resta da disegnare.
- **Abbazia di San Nilo — interno** (`abbazia_interno`): ancora nessun file, il warp sulla porta a 7
  medaglie non porta da nessuna parte.
- **Grotta del Vulcano** (Groudon, primo capo GdF/Pietra Rossa): ancora nessun file.
- **Bunkerino**: ancora nessun file.
- **Villa Aldobrandini interna** (Mew): ancora nessun file (esiste solo il giardino esterno a Frascati).
- **Grotta di Ho-Oh** (sotto il ponte di Ariccia): ancora nessun file — la Piuma si ottiene già
  (Sfida dei Porchettari), la grotta vera dietro no.
- **Lab CoTrAL #1 (Marino) e #2 (Albano)**, dungeon-indizi: ancora nessun file.
- **Dungeon della Fontana di San Rocco** (Rayquaza, gated Kyogre+Groudon): la piazza (`frascati_ovest`)
  esiste, il dungeon dietro no.
- **Stazione/treno per Lugia** (Genzano o Velletri, da decidere): nessuna meccanica di trasporto a
  lungo raggio esiste nel motore oggi — è un concetto narrativo nuovo, va progettato da zero, non
  solo disegnato.
- **Base di lancio/Luna** (Deoxys, Grottaferrata): ancora nessun file — post-game, bassa priorità.

### 3.3 Cosa serve costruire per la storia nuova (in aggiunta a quanto sopra)
- **Percorso di Marino allungato** con la biforcazione Spaccaroccia + Snorlax (oggi lo Snorlax/NPC
  Flauto esistono già in posizione segnaposto, da spostare quando Luca allunga la mappa).
- **Tunnel roccioso Castel Gandolfo → Monte Porzio**: oggi Monte Porzio si raggiunge solo dal warp
  di Percorso 5, NON da un tunnel diretto da Castel Gandolfo (i due non condividono cluster).
- **Percorso Grottaferrata → Rocca di Papa con bivio Monte Cavo**: non esiste.
- Vedi `docs/TODO.md` Gruppo A per il dettaglio riga per riga con CHI fa cosa.

---

## 4. La sotto-trama GdF — a che punto è (storia v3)

1. **Abbazia di San Nilo (Grottaferrata)** — ✅ 3 grunt fuori, porta sbarrata (gate 7 medaglie).
   Interno non esiste: nella storia nuova dentro c'è un **boss GdF** che dà la **3ª e ultima parte**
   della password di Marino + le indicazioni per la Grotta del Vulcano.
2. **Villa Pontificia (Castel Gandolfo)** — ✅ 7 grunt, il settimo lascia l'indizio "le pietre sono al
   Museo di Nemi" (flag `documentoVillaOttenuto`, non ancora letto da nessun trigger). **Nella storia
   nuova è una pista fredda**: al Museo non ci sono le pietre, solo un boss GdF (2ª parte password).
3. **Museo delle Navi di Nemi** — ❌ non esiste. Contiene la 2ª parte password (non le pietre).
4. **Rifugio GdF di Marino** — ❌ non esiste. Password in **3 parti**: 1) luogotenente CoTrAL a Monte
   Cavo, 2) boss Museo di Nemi, 3) boss Abbazia di San Nilo. Dentro: il **secondo dei due capi GdF**,
   lascia la **Pietra Blu**; più un passaggio sommerso verso Kyogre (serve MN Sub).
5. **Grotta del Vulcano** — ❌ non esiste. Il **primo dei due capi GdF**, lascia la **Pietra Rossa**;
   Groudon dorme in una camera sigillata fino a dopo la Lega.
6. ⚠️ **Identità dei due capi GdF non decisa** (vedi `docs/TODO.md` domande): il vecchio sistema dati
   aveva "Comandante Crasso" + admin Fulvia/Tarcisio, la storia nuova ne vuole due distinti — **non
   risolto in questa sessione**, si piazzano prima i luoghi, i nomi arrivano dopo.

## 4-bis. La sotto-trama CoTrAL — in tre tempi (storia v3, cambiata rispetto alla v2)

> **Cambio importante**: nella v2 CoTrAL era "POST-Lega". Nella storia nuova è **presente e attivo
> durante il gioco**, in tre momenti distinti e distanti fra loro.

1. **Rapimento a Rocca di Papa (Atto III, pre-Lega)** — capopalestra Baso non disponibile (sta
   liberando il funivista), covo ai piedi di Monte Cavo (mappa nuova), luogotenente CoTrAL sconfitto
   dà la **1ª parte** della password di Marino, funivista liberato dà il Pokéflauto. Nessuna parte
   implementata su Tiled.
2. **Osservatorio di Monte Porzio (4ª→8ª medaglia)** — **non ostili** dalla 4ª medaglia (tecnici
   cortesi, studiano il meteo), diventano ostili all'8ª: boss **in doppio** con Camilla (capopalestra
   Genzano), da cui nasce **Jirachi**. Vincendo: **Master Ball** da Camilla. Meccanica di lotta in
   doppio non esiste ancora nel motore di combattimento (oggi solo 1v1).
3. **Bunkerino (post-Lega)** — il capo di CoTrAL è **Mewtwo stesso**, squadra copia di quella del
   giocatore più veloce. Lore interna ancora da definire.

---

## 5. Cose non più in essere / sostituite lungo il percorso

- **Motore Leaflet/OSM**: spento (`MAPPA_TILED = true`), codice presente ma non eseguito.
- **`ALLENATORI`/`DONATORI_MN` in `js/data.js`**: relitti del vecchio motore, sostituiti da
  `dati/trainer.js`/donatori ad-hoc via `azione`.
- **Pattern generico donatore** (`dona_oggetto`/`una_tantum`, documentato in `DIZIONARIO-TILED.md`):
  mai implementato. Usare il pattern `azione` reale.
- **Oggetto Tiled `capopalestra`** e **`gate_palestra`**: non implementati, i capipalestra sono
  trainer normali con `palestraId`.
- **`erba_alta`/`acqua` come proprietà del tile**: il motore legge solo il rettangolo-oggetto nel
  layer `eventi`, non le proprietà sui singoli tile.
- **Centro Pokémon/Market dedicati**: Grottaferrata riusa i file di Frascati. Marino, Castel
  Gandolfo, Monte Porzio, Rocca di Papa, Albano hanno **ormai file propri** (correzione rispetto
  alla nota v2 che parlava di riuso anche per queste ultime).
- **Sprite NPC 23 e NPC 29**: rimossi, fallback casuale.

---

## 6. Le MN — stato reale (aggiornato alla storia v3)

> Distinzione **oggetto (zaino) vs permesso d'uso (fuori dalla lotta)**: narrativamente due cose
> separate, ma nel codice **un solo flag** `stato.mn.<nome>` (verificato in `_gestisciTrigger`,
> `js/map.js`) — non ancora sdoppiato.

| MN | Ostacolo sul mondo (motore) | Come si ottiene oggi in partita | Narrativa v3 (oggetto → permesso) |
|---|---|---|---|
| Taglio | ✅ `trigger_taglio` | ✅ Frascati, dopo Medaglia Vigna (`donaTaglioFrascati`) | Frascati, stesso momento — **invariato, coerente** |
| Spaccaroccia | ✅ `trigger_spaccaroccia`, mai piazzato su una mappa reale | ❌ nessuna | Oggetto: Castel Gandolfo (Villa). Permesso: Palestra Marino |
| Forza | ✅ `trigger_forza`, usato su Percorso 3; oggi assegnato **automaticamente battendo Remo a tappa 4** (`js/map.js:3181` circa, scelta sessione 30 — **da rimuovere quando si implementa la versione narrativa**) | ✅ solo via Remo/tappa 4 | Oggetto: NPC a Rocca di Papa (libera il funivista). Permesso: Palestra Monte Porzio |
| Surf | ✅ implementato, "continuo" | ❌ nessuna: donatore Tiled esiste in `dati/npc.js` ma non piazzato | Oggetto: Spiaggia di Albano. Permesso: Palestra Rocca di Papa |
| Volo | ✅ implementato (bottone ✈️) | ❌ nessuna: donatore Tiled esiste ma non piazzato | Oggetto: miniboss dungeon innevato. Permesso: Palestra Albano |
| Sub | ✅ ostacolo implementato | ❌ nessun donatore | **Cambiato dalla v2** ("non previsto"): oggetto da Prof. Castagno, dopo la Lega. Permesso: Palestra Ariccia |
| Cascata | ✅ ostacolo implementato | ❌ nessun donatore | Oggetto: **[DA DECIDERE — Luca]**. Permesso: Palestra Genzano |

In pratica oggi, fuori da `MODALITA_TEST`, **solo Taglio è ottenibile giocando**; tutte le altre MN
restano dietro al pulsante dev "🧪 Setup squadra TEST".

---

## 7. Come funzionano warp e spawn (invariato, riferimento rapido)

1. Ogni **warp** ha `destinazione` (la **chiave** del registro `MAPPE`) e opzionalmente `spawn_id`.
2. `risolviMappa()` prova chiave esatta → confronto "ripulito" → confronto per inclusione. Usare
   sempre la chiave esatta, senza suffissi inventati.
3. Lo **spawn** di destinazione si cerca per la proprietà Tiled `id` (non `spawn_id` sullo spawn
   stesso, che non viene mai letto). Su ogni spawn raggiunto da `spawn_id` esplicito, mettere `id`
   con lo stesso valore.
4. Dentro un interno, qualunque uscita torna al punto della mappa esterna da cui si è entrati
   (`mappaStack`).

---

## 8. Prossimi passi suggeriti (fotografia, non decisi)

- Sistemare il bug id di Stella (Monte Porzio) — `dati/trainer.js` vs id Tiled disallineati (§0).
- ~~Costruire la palestra interna di Rocca di Papa e piazzare Baso~~ fatto in sessione odierna
  (insieme all'interno di Albano/Giorgia) — da testare a runtime.
- Portare i donatori di MN (Spaccaroccia/Surf/Volo/Sub/Cascata) sul motore Tiled col pattern `azione`
  già collaudato per Taglio/Flauto.
- Decidere identità dei due capi GdF e dei due boss di sede (Museo Nemi, Abbazia) per poter piazzare
  i trainer.
- Vedi `docs/TODO.md` per l'elenco completo ordinato per dipendenze.

---

## 9. Sistemi mancanti — aggiornato al 5 agosto

- **Doppio flag MN**: possesso separato dal permesso (oggi un solo booleano).
- **Risfida allenatori** dopo N giorni, squadra rilivellata (tetto = asso capopalestra successivo),
  EXP come ricompensa principale, soldi dimezzati.
- **Interpolazione del movimento** (scatti residui).
- **Corsa**: solo Shift/95ms-passo oggi, nessuna sensazione di accelerazione reale.
- **Sprite Pokémon in stile GBA "cartoon"** (non PokéAPI standard) — indicazioni da Luca in arrivo.
- **Ondeggiamento sprite in battaglia.**
- ~~Ciclo notte visivo~~ — ✅ **fatto** (velo colorato + luci, vedi §2.1), esteso in questa sessione
  applicativa a `frascati_centro` + tutto il cluster `Castelli_lakes`.
- **Meteo**: particelle + proprietà mappa `meteo` — ancora da fare.
- ~~Animazione dei tile~~ — ✅ **fatto** per `Sea`/`Waterfall` (vedi §2.1); i tile GBA statici restano
  fermi salvo ridipingerli.
- **Animazioni delle mosse.**
- **Contatore Poké Ball rimanenti in battaglia.**
- **Migliorie Box Pokémon**: quali esattamente, ancora da decidere.
- **Zona Safari**: solo ingresso a pagamento cablato, manca la meccanica di cattura vera.
- **Lotta in doppio** (serve per lo scontro Osservatorio con Camilla, storia v3): il motore di
  combattimento oggi gestisce solo 1v1.
- **Meccanica di "viaggio a lungo raggio"** (il treno per Lugia, storia v3): non esiste nessun
  equivalente tecnico oggi, nemmeno concettuale.
