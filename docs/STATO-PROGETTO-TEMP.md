# STATO DEL PROGETTO — Pokémon Castelli Romani

> Documento riassuntivo "fotografia" dello stato attuale, aggiornato al **8 luglio 2026**.
> Non sostituisce `docs/ROADMAP.md` (che resta il diario sessione-per-sessione, da leggere a
> inizio sessione) né `CLAUDE.md` (che resta la stella polare/regole). Questo documento serve
> per avere il quadro d'insieme senza scorrere 1400+ righe di roadmap: cosa esiste, cosa manca,
> cosa è stato **sostituito o abbandonato** lungo il percorso.
>
> **Aggiornamento sessione 8 luglio 2026:** integrazione narrativa completa GdF/CoTrAL,
> posizionamento definitivo leggendari, nuove mappe generate, correzioni struttura mondo.

---

## 1. Il colpo d'occhio

Il gioco gira interamente sul **motore a mappe Tiled** (`js/map.js`, formato `.tmj`). Il vecchio
motore con mappa reale Leaflet/OpenStreetMap (coordinate lat/lon) è **spento** ma non rimosso dal
codice: resta come "impalcatura" storica (vedi §5). Ad oggi:

- **2 palestre su 8 sono completamente giocabili** (Frascati, Grottaferrata).
- **4 città sono disegnate e cablate** con warp/NPC/allenatori funzionanti (Frascati, Grottaferrata,
  Marino, Castel Gandolfo), più i percorsi che le collegano.
- **Nuove mappe generate in sessione** (eventi pronti, grafica da verificare in Tiled):
  Frascati x5 zone, Grottaferrata, Percorso 2 (28x120 monoschermata), Tuscolo x4 zone,
  3 antri Regi, Boschetto Segreto.
- **3 mappe disegnate in Tiled ma NON collegate al gioco** (Monte Porzio Catone, Osservatorio,
  percorso montano senza nome definitivo) — vedi §3.
- Il sistema di combattimento, cattura, evoluzioni, salvataggio, tempo/giorno-notte, level cap,
  MN (ostacoli sul mondo) sono implementati e funzionanti.
- **Le MN Surf/Taglio/Volo non hanno ancora un modo per essere ottenute in partita** sulle mappe
  Tiled attuali (vedi §6) — oggi si sbloccano solo da un pulsante di test.
- **La narrativa GdF e CoTrAL è ora definita completamente** a livello di design (vedi §4 aggiornato)
  ma non ancora implementata in codice oltre a quello già esistente.

---

## 2. Cosa è stato fatto (per sistema)

### 2.1 Esplorazione e mappe (motore Tiled)
- Loader `.tmj` completo: livelli tile (`ground`, `deco_sotto`, `edifici`, `sopra_testa`), livello
  collisioni (`collisioni`), livello eventi/oggetti (`eventi`).
- Player con animazioni camminata/idle nelle 4 direzioni, cono visivo dei trainer, NPC fissi/random,
  trainer in pattuglia.
- Sistema di **warp/porte** fra mappe con `spawn_id` per atterrare sulla casella giusta nella mappa
  di destinazione (vedi §7 per come funziona di preciso — e per il bug appena risolto).
- **Ostacoli MN** (`trigger_taglio`, `trigger_surf`, `trigger_sub`, `trigger_forza`,
  `trigger_spaccaroccia`, `trigger_cascata`): un oggetto rettangolare blocca il passaggio finché non
  possiedi la MN giusta; usandola si libera la casella (permanente per la sessione di gioco).
- **Surf "continuo"**: mentre stai surfando, le caselle d'acqua adiacenti si attraversano senza
  dover ripremere [A] a ogni casella; smette in automatico appena torni a terraferma.
- **MN Volo**: tabella `VOLO_TILED` in `app.js` con un punto di atterraggio per ogni città visitata.
  Oggi coperta per Borgata Tuscolana, Frascati, Grottaferrata, Marino, Castel Gandolfo.
- Zone di incontro selvatico (`erba_alta`, `acqua`) con tabelle pesate (`rate`) per specie,
  sempre Gen 1-2-3 (ID ≤ 386).
- **Regola "acqua = anche zona d'incontro"**: ogni specchio d'acqua Surf-abile ha la sua tabella.
- Oggetti a terra raccoglibili (`oggetto`), cartelli (`cartello`), eventi di storia (`trigger_storia`,
  gated da condizione), leggendari su mappa (sprite PokéAPI, solidi, interagibili).

### 2.2 NPC, allenatori e il sistema dei "gate" (condizioni)
Vedi `docs/DIZIONARIO-TILED.md` per la tabella di riferimento completa; qui il riassunto pratico.

- **NPC** (`type: npc`): dialogo statico da `dati/npc.js`. Possono avere `azione` invece di dialogo.
- **Trainer** (`type: trainer`): dati in `dati/trainer.js`. Con `vista > 0` sfida automatica;
  con `pattuglia: true` + `direzione_ciclo` gira avanti e indietro.
- **Gate (condizioni)** — proprietà `condizione` su warp/NPC/trainer:
  - flag di stato (es. `post_lega`, `gdf_sconfitto`, `il_solitario_sconfitto`…)
  - medaglie: `"medaglie >= N"`
  - requisito squadra: `"tre pokemon acqua in squadra"`
  - combinabili con `"e"`: `"legaCompletata e tre pokemon acqua in squadra"`
  - Su warp: condizione falsa = passaggio bloccato con messaggio
  - Su NPC con `gate: true`: compare SOLO finché condizione è falsa (blocco che sparisce)
  - Senza `gate`: compare SOLO quando condizione è vera (personaggio "premio")
- **Trainer speciale** (`speciale: true`): alla sconfitta setta flag `<id>_sconfitto`.
- **Trigger avvicinamento** (`trigger: avvicinamento`): il motore NON lo implementa ancora.
  Serve in `map.js` la funzione `checkTriggerAvvicinamento()` — vedi §9.
- **NPC donatore** (`dona_oggetto`, `una_tantum`): documentato nel dizionario ma NON implementato
  in `map.js`. Va scritto prima di usarlo nelle mappe.

### 2.3 Palestre e level cap
- Capopalestra = trainer normale con `palestraId`. Medaglia assegnata da `vinciPalestraTiled()`.
- **Non esiste** `gate_palestra` che blocchi ingresso: si può entrare sempre.
- Level cap bloccato all'EXP, non fisicamente all'ingresso.

### 2.4 Combattimento, cattura, squadra
- Turni classici, 4 mosse con PP, danni STAB/efficacia/livello, cattura formula HP+Ball,
  EXP scalata (formula `/5`, minimo 10, bonus allenatore ×1.5), level-up bloccato al cap.
- Evoluzioni per livello/pietra/felicità/scambio (scambio via "Mercante degli Scambi").
- **Mosse a più turni parzialmente implementate**: Solarraggio, Oltraggio, Petalobufera,
  Tempestafuoco, Esplosione, Autodistruzione, Protezione, Individuazione.
- **Mosse multi-turno mancanti** (da implementare): Volo, Tuffo, Ossa Ninja (invulnerabilità),
  Iper Raggio/Giga Impact (ricarica), Rotolamento/Sfida (cumulo), Sbadiglio (effetto ritardato),
  Futuravendetta, Desiderio, Ultimo Canto. Vedi `PROMPT_CLAUDE_CODE_aggiornamenti.md`.
- Rivale Remo scalato per tappa: squadra e livello crescono a ogni incontro.
- Booster velocità ⏩ x1/x2/x3/x5 (movimento e messaggi).
- **Toggle velocità battaglia nel menu** non ancora implementato — solo movimento.
- **Pietra Scambio** non ancora implementata: oggetto che sostituisce le trade evolution
  (Kadabra→Alakazam, Haunter→Gengar, Machoke→Machamp, Graveler→Golem, ecc.).

### 2.5 Tempo, economia, salvataggio
- Ciclo giorno/notte (mattina/pomeriggio/sera/notte), influenza incontri/eventi.
- "Dormi" al PC del Centro Pokémon: cura squadra, avanza orario, eventi programmati.
- Soldi (Pokéyen), zaino, repellente, salvataggio automatico localStorage + esporta/importa JSON.

### 2.6 Narrativa e leggendari
- **Team GdF e Team CoTrAL sono due villain separati** con obiettivi distinti.
  Questa separazione è ora canonizzata — vedi §4.
- **GdF sprite:** `NPC 20` (alias `GDF_GRUNT_SPRITE`) — chiedere a Luca il nome file reale.
- **CoTrAL sprite:** da definire — chiedere a Luca il nome file reale.
- Sistema leggendari Gen 1-3 con posizionamento definitivo per tutti i 21 (vedi §4).
- **Il Solitario** (Boschetto Segreto): trainer speciale post-lega, ha Celebi in squadra.
  Dopo la sconfitta, NPC rivela Celebi nell'erba alta del Tuscolo (3%).
- Remo (rivale): tappa 2 prima di Grottaferrata, tappa 3 nel Tuscolo Interno, altre tappe da definire.

---

## 3. Le mappe esistenti — stato reale

### 3.1 Registrate e giocabili (nel registro `MAPPE` di `js/map.js`)

| Zona | Mappa/e | Note |
|---|---|---|
| Borgata Tuscolana | `borgata_tuscolana`, `lab_professore`, `pokecenter` | Scelta starter, Prof. Castagno, rivale Remo |
| Percorso Tuscolana / 1b | `percorso_tuscolana`, `percorso_1b` | Tutorial, 8 allenatori |
| Boschi del Tuscolo | `tuscolo_ingresso`, `tuscolo_interno`, `tuscolo_rovine`, `tuscolo_profondo`, `boschetto_segreto` | 18 allenatori, Trio Regi, Il Solitario + Celebi |
| **Frascati** (P1, Vinicio) | `frascati_sud/centro/est/ovest/nord`, `palestra_frascati`, interni | ✅ Palestra completa, Medaglia Vigna, cap 14 |
| Percorso 2 | `percorso_2` | 28x120 monoschermata, 6 trainer, ruscello+cascata |
| **Grottaferrata** (P2, Nilo) | `grottaferrata`, `palestra_grottaferrata_interno` | ✅ Palestra completa, Medaglia Icona, cap 21 |
| Percorso 3 | `percorso_3` | 8+2 allenatori, zona MN Forza |
| **Marino** (P3, Moro) | `marino` | ⚠️ Città esiste, palestra interna e Moro mancanti |
| Percorso 4 | `percorso_4` | Collega Marino ↔ Castel Gandolfo/Lago Albano |
| Lago Albano | `lago_albano` | Spiaggia + acqua Surf. Mancano zone distinte spiaggia/acqua |
| **Castel Gandolfo** | `castel_gandolfo` | No palestra. 7 grunt GdF, flag `documentoVillaOttenuto` |
| Percorso 5 | `percorso_5` | Salita Rocca di Papa (mappa arrivo non creata) |
| Antri Trio Regi | `antro_regice`, `antro_regirock`, `antro_registeel` | Gated post-lega + 3 Pkm tipo |

### 3.2 Generate in sessione — eventi pronti, NON ancora registrate in `MAPPE`

| File | Dimensioni | Contenuto | Cosa manca |
|---|---|---|---|
| `frascati_sud/centro/nord/ovest/est.tmj` | 36-40×28-35 | 5 zone Frascati complete | Verifica grafica in Tiled, registrazione in MAPPE |
| `grottaferrata.tmj` | 36×34 | 39 eventi: grunt GdF, palestra, Deoxys trigger | Registrazione in MAPPE, verifica grafica |
| `percorso_2.tmj` | 28×120 | 6 trainer, 4 oggetti, ruscello, biforcazione | Registrazione MAPPE, sostituisce percorso_2a/2b |
| `tuscolo_ingresso/interno/rovine/profondo.tmj` | 38-44×28-44 | 18 trainer, 3 antri, spawn Celebi | Registrazione MAPPE, verifica grafica |
| `antro_regirock/regice/registeel.tmj` | 20×18 | trigger leggendario, iscrizione latina | Registrazione MAPPE |
| `boschetto_segreto.tmj` | 32×26 | Il Solitario, gate post-lega, 4 trainer | Registrazione MAPPE |

### 3.3 Disegnate in Tiled ma NON collegate al gioco

| File | Contenuto | Cosa manca |
|---|---|---|
| `monteporzio.tmj` | 28 eventi | Registrazione MAPPE, warp Percorso 4→Monte Porzio, dati trainer/palestra |
| `Osservatorio.tmj` | 4 eventi | Registrazione MAPPE, trigger CoTrAL (primo incontro), trigger Zapdos/Jirachi |
| `percorso_montano_v1.tmj` | 6 eventi | Ruolo da decidere: probabile Percorso 5 verso Rocca di Papa |

### 3.4 Interni e mappe mancanti (nessun file, solo nel design)

**Città e percorsi:**
- Palestra interna Marino + Moro come trainer
- Percorso 3 (28x80, 8+2 trainer, zona Forza) — aggiornato a Lv 10-16
- Percorso 4 (28x95, 8+2 trainer, zona Taglio) — Lv 12-19
- Monte Porzio Catone (mappa esterna — parzialmente disegnata)
- Rocca di Papa + percorso 5
- Grotta del Vulcano (13 trainer, grunt GdF, Groudon)
- Funivia Rocca di Papa → Monte Cavo (Articuno)
- Albano Laziale + percorso 6
- Ariccia + percorso campagna + Ponte di Ariccia
- Sentiero Innevato (Lv 36-44)
- Genzano + percorso 8
- Via Vittoria (da Monte Porzio, gate NPC, Moltres)
- Colonna / Lega Pokémon

**Dungeon e zone speciali:**
- Abbazia San Nilo — interno (dungeon post-lega, climax GdF)
- Lago di Nemi + Museo delle Navi (cutscene GdF ruba Orb)
- Lab GdF #1 (Marino) + Lab GdF #2 (Albano)
- Lab CoTrAL #1 (Albano, Fulvia, 15 trainer) + Lab CoTrAL #2 (Ariccia, Crasso, 17 trainer)
- Bunkerino (Colonna, Mewtwo, base finale CoTrAL)
- Osservatorio INAF interno (CoTrAL, Zapdos, Jirachi) — parzialmente disegnato
- Rayquaza arena (destinazione warp_speciale da fontana San Rocco)
- Grotta Meteora (Deoxys) — citata come mancante

**Interni riutilizzati (da differenziare se necessario):**
- Centro Pokémon Grottaferrata/Marino/Castel Gandolfo riusano file Frascati (scelta deliberata)

---

## 4. La narrativa — stato e design definitivo

### 4.1 Team GdF — arco completo (aggiornato)

**Obiettivo:** risvegliare Kyogre e Groudon come arma di potere.
**Sprite:** `NPC 20` alias `GDF_GRUNT_SPRITE` — chiedere a Luca nome file reale.

| Tappa | Dove | Stato | Flag |
|-------|------|-------|------|
| 1. Primo incontro | Abbazia San Nilo (fuori) | ✅ 3 grunt in `dati/trainer.js` | — |
| 2. Porta sbarrata | Abbazia — porta interna | ✅ gate `medaglie >= 7`, warp fallisce (toast) | — |
| 3. Lab #1 | vicino Marino | ❌ mappa non esiste | — |
| 4. Documento Villa | Castel Gandolfo | ✅ 7 grunt, dialogo indizio | `documentoVillaOttenuto` |
| 5. Furto Orb | Museo Navi di Nemi | ❌ mappa non esiste | `orb_rubate` |
| 6. Tentativo risveglio | Lab GdF #2, Albano | ❌ mappa non esiste | — |
| 7. Presidio Groudon | Grotta del Vulcano | ❌ mappa non esiste | — |
| 8. **CLIMAX** | Abbazia interna (post-lega) | ❌ interno non esiste | `gdf_sconfitto` |

**Post-climax:** trovate Pietra Rossa + Pietra Blu → Kyogre (Lago Albano) e Groudon
(Grotta Vulcano) diventano catturabili. Con entrambi in squadra → Rayquaza
(fontana San Rocco, Frascati Ovest).

⚠️ **Nota narrativa:** il flag in gioco si chiama `documentoVillaOttenuto` ma
nel nuovo design il dialogo dice "le navi romane di Nemi", non "le pietre". Aggiornare
il dialogo in `dati/trainer.js` per allinearlo alla narrativa definitiva.

### 4.2 Team CoTrAL — arco completo (nuovo)

**Obiettivo:** creare e controllare Mewtwo clonato.
**Sprite:** da definire — chiedere a Luca.
**Prima comparsa: Osservatorio INAF (Monte Porzio)** — NON prima.

| Tappa | Dove | Stato |
|-------|------|-------|
| 1. Prima comparsa | Osservatorio INAF | ❌ mappa parziale, trigger CoTrAL mancante |
| 2. Lab #1 | Albano (Fulvia, 15 trainer) | ❌ mappa non esiste |
| 3. Grunt Ariccia | Ariccia (4 grunt) → Piuma Iridescente | ❌ mappa non esiste |
| 4. Lab #2 | Ariccia (Crasso, 17 trainer) | ❌ mappa non esiste |
| 5. **CLIMAX** | Bunkerino (Colonna, post-lega) | ❌ mappa non esiste |

**Post-climax:** `cotral_sconfitto` → Mew (Villa Aldobrandini) sbloccato.

### 4.3 Catena Ho-Oh (aggiornata)

1. Sconfiggi 4 grunt CoTrAL vicino Ariccia → Adriano il Porchettaro dà Piuma Iridescente
2. Post-lega: entri "alla sagra" ad Ariccia → sconfiggi 5 Porchettari
3. Ti dicono: "vai al Ponte di Ariccia all'alba con la Piuma"
4. → incontro Ho-Oh (250) sul Ponte all'alba

### 4.4 Catena Lugia (nuova)

1. Post-Via Vittoria: trovi braciere abbandonato
2. Torna a Genzano: NPC propone "scampagnata"
3. Warp speciale → Monte Cavo → Lugia (249)
⚠️ **Lugia NON è a Monte Cavo tramite funivia** (quella è Articuno). È una zona
separata raggiungibile solo post-lega dal warp di Genzano.

---

## 5. Cose non più in essere / sostituite

- **Motore Leaflet/OpenStreetMap:** spento (`MAPPA_TILED = true` in `app.js` riga 16).
  Codice presente ma non eseguito.
- **`ALLENATORI` e `DONATORI_MN` in `data.js`:** vecchio sistema lat/lon, non usato.
  `DONATORI_MN` mai riportato su Tiled.
- **`interagisciDonatore`:** documentato nel dizionario, non implementato in `map.js`.
- **`capopalestra` come tipo Tiled e `gate_palestra`:** non implementati.
  I capopalestra sono trainer con `palestraId`.
- **Tile `ghiaccio` scivoloso:** non implementato nel motore.
- **`erba_alta`/`acqua` come proprietà tile:** il motore legge solo rettangolo-oggetto
  nel layer `eventi`, non le proprietà sui singoli tile.
- **PC/Market dedicati per Grottaferrata/Marino/Castel Gandolfo:** riusano file Frascati.
- **`docs/PROMPT_CLAUDE_CODE_aggiornamenti.md` originale:** sostituito da
  `docs/REMINDER-MAPPE-FUTURE.md` per il formato reale. Il nuovo
  `PROMPT_CLAUDE_CODE_aggiornamenti.md` generato in sessione usa il formato corretto.
- **Sprite NPC 23 e NPC 29:** rimossi, qualunque NPC che li usava riceve sprite filler.
- **Percorso 2A e 2B:** sostituiti da `percorso_2.tmj` monoschermata 28x120.
- **Lugia a Monte Cavo via funivia:** sbagliato. La funivia porta ad Articuno.
  Lugia si raggiunge da Genzano post-Via Vittoria con warp speciale.
- **Lab CoTrAL #1 a Marino:** sbagliato. Marino ha Lab GdF #1.
  CoTrAL compare per la prima volta all'Osservatorio (Monte Porzio).

---

## 6. Le MN — stato reale di ognuna

| MN | Ostacolo sul mondo | Come si ottiene oggi | Come si ottiene nel design |
|---|---|---|---|
| Taglio | ✅ `trigger_taglio` | ❌ solo pulsante test | Fra' Potatore (NPC, zona Grottaferrata) |
| Surf | ✅ continuo su più caselle | ❌ solo pulsante test | Nonna Assunta (NPC, Albano) |
| Forza | ✅ `trigger_forza` | ❌ solo pulsante test | NPC Osservatorio (dopo evento CoTrAL) |
| Volo | ✅ bottone ✈️ + `VOLO_TILED` | ❌ solo pulsante test | Faustino (NPC, Rocca di Papa) |
| Spaccaroccia, Sub, Cascata | ✅ ostacoli implementati | ❌ nessun donatore | da definire |

⚠️ `MODALITA_TEST = true` in `data.js` riga 17 — **spegnere prima della pubblicazione**.
⚠️ **MT Taglio NON va messa come oggetto raccoglibile nei percorsi.** È una MN che si ottiene
solo da NPC dedicato.

---

## 7. Come funzionano i warp e gli spawn

1. Ogni **warp** ha `destinazione` (chiave del registro `MAPPE`) e opzionalmente `spawn_id`.
2. `risolviMappa()` prova: chiave esatta → confronto ripulito → confronto per inclusione.
   **Se non combacia → toast "zona non disponibile".** Usare sempre la chiave esatta.
3. Lo spawn nella mappa destinazione deve avere la proprietà **`id`** (non `spawn_id`)
   con lo stesso valore del `spawn_id` del warp. Se manca `id`, il motore non trova lo
   spawn e il giocatore appare in posizione sbagliata.
4. Dentro un interno, l'uscita torna alla mappa esterna via `mappaStack`.

---

## 8. Prossimi passi — priorità

### Priorità 1 — sblocca il gioco in modalità normale (senza pulsante test)
1. Portare Fra' Potatore (MN Taglio) su Tiled in Grottaferrata
2. Registrare le mappe generate in sessione nel registro `MAPPE` di `map.js`
3. Completare Marino: palestra interna + Moro come trainer

### Priorità 2 — avanzamento path principale
4. Collegare Monte Porzio Catone (mappa già disegnata)
5. Implementare trigger CoTrAL all'Osservatorio (prima comparsa)
6. Creare Percorso 3 (28x80, Lv 10-16, 8+2 trainer, zona Forza)
7. Creare Percorso 4 (28x95, Lv 12-19, 8+2 trainer, zona Taglio)

### Priorità 3 — sistema narrativo
8. Implementare `checkTriggerAvvicinamento()` in `map.js` per grunt GdF
9. Creare interno Abbazia San Nilo (dungeon post-lega, climax GdF)
10. Collegare flag `documentoVillaOttenuto` → trigger Museo Navi di Nemi
11. Aggiornare dialogo Castel Gandolfo: "le pietre" → "le navi romane di Nemi"

### Priorità 4 — sistema battaglia e oggetti
12. Toggle velocità battaglia nel menu (ON/OFF)
13. Completare mosse multi-turno mancanti (Volo, Iper Raggio, Rotolamento, Sbadiglio…)
14. Pietra Scambio (trade evolutions senza scambio reale)
15. Bilanciare EXP (formula aggiornata in `PROMPT_CLAUDE_CODE_aggiornamenti.md`)

### Priorità 5 — contenuti post-path
16. Lago di Nemi + Museo delle Navi
17. Grotta del Vulcano
18. Sentiero Innevato (Articuno)
19. Ariccia + Ponte + catena Ho-Oh
20. Genzano + catena Lugia

---

## 9. Cose da implementare in `map.js` che il motore non gestisce ancora

Questi comportamenti sono documentati nel dizionario e nelle mappe generate ma
**non hanno codice corrispondente** in `map.js`:

| Comportamento | Proprietà TMJ | Stato |
|---|---|---|
| Trigger avvicinamento GdF | `trigger: "avvicinamento"` su NPC | ❌ mancante |
| NPC donatore oggetto | `dona_oggetto`, `una_tantum` | ❌ mancante |
| Gate NPC che blocca fisicamente | `gate: true` + `condizione` | ⚠️ parziale |
| Warp speciale con condizione | `type: warp_speciale`, `condizione` | ❌ mancante |
| Trigger leggendario | `type: trigger_leggendario`, `pokemon_id` | ⚠️ parziale |
| Trigger storia condizionale | `type: trigger_storia`, `condizione` | ⚠️ parziale |
| Post-battaglia NPC (trainer speciale) | `post_battaglia_npc`, `speciale: true` | ❌ mancante |
| Incontro Celebi 3% | logica in `world.js` post-flag | ❌ mancante |
| Pietra Scambio evoluzione | oggetto in `data.js` + logica in `app.js` | ❌ mancante |
| Toggle velocità battaglia | impostazione in `stato.impostazioni` | ❌ mancante |

