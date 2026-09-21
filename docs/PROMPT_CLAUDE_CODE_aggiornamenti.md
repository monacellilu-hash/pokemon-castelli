# PROMPT PER CLAUDE CODE — Aggiornamenti multipli narrativa, percorsi, battaglia

Questo prompt copre 8 aree di modifica. Implementale nell'ordine indicato.
Leggi CLAUDE.md e tutti i file in dati/ prima di iniziare.

---

## MODIFICA 1 — Narrativa GdF: catena eventi Abbazia → Castel Gandolfo → Museo Nemi

### 1A. Dialoghi GdF all'Abbazia di San Nilo — `dati/npc.js`

Aggiungi questi NPC all'oggetto DIALOGHI_NPC (o equivalente):

```js
// Grunt GdF fuori dall'Abbazia (si triggera avvicinandosi)
// NOTA UTENTE: sostituisci "GDF_GRUNT_SPRITE" con il nome file sprite reale nella cartella sprites/
gdf_grunt_abbazia_1: {
  sprite: "GDF_GRUNT_SPRITE",
  trigger: "avvicinamento",
  dialoghi: [[
    "...",
    "Ehi! Non dovresti essere qui.",
    "Muoviti. Non c'è niente da vedere."
  ]],
  post_battaglia: [[
    "Il Comandante ha tutto sotto controllo...",
    "Le coordinate sono già state trasmesse.",
    "I Pokémon fondamentali saranno nostri."
  ]]
},

gdf_grunt_abbazia_2: {
  sprite: "GDF_GRUNT_SPRITE",
  trigger: "avvicinamento",
  dialoghi: [[
    "Questo posto ha segreti che risalgono a secoli fa.",
    "E il Comandante li conosce tutti.",
    "Tu non sei dei nostri. Battiti!"
  ]],
  post_battaglia: [[
    "Non importa... Il piano è già in moto.",
    "Presto tracceremo finalmente ciò che cerchiamo.",
    "E nessuno potrà fermarci."
  ]]
},

gdf_grunt_abbazia_3: {
  sprite: "GDF_GRUNT_SPRITE",
  trigger: "avvicinamento",
  dialoghi: [[
    "La porta? È sbarrata.",
    "Solo chi ha l'autorizzazione del Comandante può entrare.",
    "E tu non ce l'hai."
  ]],
  post_battaglia: [[
    "...",
    "Il Comandante ha detto che i Pokémon dell'abisso e della terra...",
    "...risvegliarli è solo questione di tempo.",
    "Tornerete qui. Ma sarà troppo tardi."
  ]]
},

// Porta sbarrata — interazione diretta
gdf_porta_abbazia: {
  sprite: null,
  tipo: "cartello_interattivo",
  dialoghi: [[
    "La porta è sbarrata con un lucchetto GdF.",
    "Ci vorrebbe qualcosa di più... di sette medaglie."
  ]]
},
```

### 1B. Gate porta Abbazia — `map.js` o sistema eventi TMJ

La porta dell'Abbazia deve essere un oggetto `type: gate_palestra` con:
- `condizione: medaglie >= 7`
- Se condizione non soddisfatta → mostra dialogo `gdf_porta_abbazia`
- Se condizione soddisfatta → warp verso interno Abbazia (dungeon)

### 1C. Evento Castel Gandolfo — Villa Pontificia — `dati/npc.js`

```js
// Trigger storia dentro la Villa (post-sconfitta grunt)
gdf_documento_villa: {
  sprite: "GDF_GRUNT_SPRITE",
  tipo: "trigger_storia",
  condizione: "grottaferrata_completata", // dopo 2a palestra
  dialoghi: [[
    "...",
    "Eccolo. Il documento che cercavamo.",
    "Le navi. Le navi romane di Nemi.",
    "Il Comandante aveva ragione. È lì che dobbiamo andare."
  ]],
  flag_set: "documento_villa_trovato"
},

// NPC che commenta dopo l'evento
villa_custode: {
  sprite: "NPC_CUSTODE",  // NOTA UTENTE: sostituisci con sprite reale
  dialoghi: [
    ["Quei soldati... hanno portato via qualcosa dagli archivi."],
    ["Ho visto un documento con disegni antichi. Mostri dell'acqua e della terra."],
    ["Dicevano di andare verso Nemi. Al museo delle navi romane."]
  ]
},
```

### 1D. Collegamento con evento Museo Nemi già esistente — `app.js` o `world.js`

Verifica che l'evento Museo Nemi (già in F10) controlli il flag `documento_villa_trovato`.
Se il flag non è settato, il museo non triggera la cutscene GdF — i grunt non sono ancora arrivati.
Aggiungi questa condizione al trigger museo:

```js
// Nel trigger museo navi di Nemi:
if (!stato.flags.documento_villa_trovato) {
  // Museo normale, niente GdF
  return;
}
// Altrimenti procedi con cutscene GdF già implementata
```

---

## MODIFICA 2 — Percorsi: più allenatori + zone sbloccabili

### 2A. Percorso 3 (Grottaferrata → Marino) — `dati/trainer.js`

Porta gli allenatori da 5 a **8** (all-gm-1..8), Lv 9-14.
Aggiungi zona sbloccabile con **MN Forza**:
- Zona laterale bloccata da masso (trigger_forza)
- Dentro: 2 allenatori extra (all-gm-extra-1..2) Lv 12-14
- Oggetti: superpozione x2, repellente, pokeball x2

```js
// In DATI_TRAINER aggiungi:
"all-gm-1": { sprite: "YOUNGSTER", livello_min: 9, livello_max: 10,
  squadra: [{id:19,lv:9},{id:16,lv:10}], premio: 200 },
"all-gm-2": { sprite: "LASS", livello_min: 10, livello_max: 11,
  squadra: [{id:35,lv:10},{id:39,lv:11}], premio: 220 },
"all-gm-3": { sprite: "BUGCATCHER", livello_min: 10, livello_max: 11,
  squadra: [{id:13,lv:10},{id:11,lv:11}], premio: 200 },
"all-gm-4": { sprite: "YOUNGSTER", livello_min: 11, livello_max: 12,
  squadra: [{id:23,lv:11},{id:27,lv:12}], premio: 240 },
"all-gm-5": { sprite: "BIRDKEEPER", livello_min: 12, livello_max: 13,
  squadra: [{id:16,lv:12},{id:41,lv:13}], premio: 260 },
"all-gm-6": { sprite: "LASS", livello_min: 12, livello_max: 13,
  squadra: [{id:52,lv:12},{id:54,lv:13}], premio: 260 },
"all-gm-7": { sprite: "YOUNGSTER", livello_min: 13, livello_max: 14,
  squadra: [{id:60,lv:13},{id:118,lv:14}], premio: 280 },
"all-gm-8": { sprite: "BIRDKEEPER", livello_min: 13, livello_max: 14,
  squadra: [{id:41,lv:13},{id:42,lv:14}], premio: 280 },
// Zona Forza:
"all-gm-extra-1": { sprite: "YOUNGSTER", livello_min: 12, livello_max: 14,
  squadra: [{id:74,lv:12},{id:75,lv:14}], premio: 280 },
"all-gm-extra-2": { sprite: "LASS", livello_min: 13, livello_max: 14,
  squadra: [{id:183,lv:13},{id:184,lv:14}], premio: 280 },
```

### 2B. Percorso 4 (Marino → Monte Porzio) — `dati/trainer.js`

Porta gli allenatori da 5 a **8** (all-mmp-1..8), Lv 12-17.
Zona sbloccabile con **MN Taglio**:
- Albero tagliabile laterale
- Dentro: 2 allenatori extra (all-mmp-extra-1..2) Lv 15-17
- Oggetti: etere, superpozione, TM nascosta

```js
"all-mmp-1": { sprite: "YOUNGSTER", livello_min: 12, livello_max: 13,
  squadra: [{id:19,lv:12},{id:20,lv:13}], premio: 260 },
"all-mmp-2": { sprite: "LASS", livello_min: 13, livello_max: 14,
  squadra: [{id:35,lv:13},{id:36,lv:14}], premio: 280 },
"all-mmp-3": { sprite: "BUGCATCHER", livello_min: 13, livello_max: 14,
  squadra: [{id:13,lv:13},{id:14,lv:14}], premio: 260 },
"all-mmp-4": { sprite: "YOUNGSTER", livello_min: 14, livello_max: 15,
  squadra: [{id:100,lv:14},{id:81,lv:15}], premio: 300 },
"all-mmp-5": { sprite: "BIRDKEEPER", livello_min: 14, livello_max: 15,
  squadra: [{id:84,lv:14},{id:85,lv:15}], premio: 300 },
"all-mmp-6": { sprite: "LASS", livello_min: 15, livello_max: 16,
  squadra: [{id:172,lv:15},{id:25,lv:16}], premio: 320 },
"all-mmp-7": { sprite: "YOUNGSTER", livello_min: 15, livello_max: 16,
  squadra: [{id:179,lv:15},{id:180,lv:16}], premio: 320 },
"all-mmp-8": { sprite: "BIRDKEEPER", livello_min: 16, livello_max: 17,
  squadra: [{id:84,lv:16},{id:22,lv:17}], premio: 340 },
// Zona Taglio:
"all-mmp-extra-1": { sprite: "LASS", livello_min: 15, livello_max: 17,
  squadra: [{id:137,lv:15},{id:233,lv:17}], premio: 340 },
"all-mmp-extra-2": { sprite: "YOUNGSTER", livello_min: 16, livello_max: 17,
  squadra: [{id:81,lv:16},{id:82,lv:17}], premio: 340 },
```

---

## MODIFICA 3 — Incontri Pokémon: scala livelli + Gen 1-2-3 in tutte le zone

### ISTRUZIONI GENERALI PER CLAUDE CODE

**Non attenerti strettamente a questa lista — è un punto di partenza.**
Puoi e devi arricchire ogni zona con altri Pokémon coerenti per tipo/habitat.
L'obiettivo è che lungo tutti i percorsi del gioco si possano trovare
almeno una volta le forme base di tutti i Pokémon Gen 1-2-3 non leggendari.
Distribuisci in modo che i percorsi iniziali abbiano i Pokémon comuni delle prime gen,
e quelli avanzati abbiano specie più rare e di gen successive.

**Nidoran♂ (ID 32) e Nidoran♀ (ID 29)** sono già presenti nel gioco — mantienili
e assicurati che appaiano nei percorsi erba dove già sono.

**Starter con alta rarità:** aggiungi Bulbasaur (1), Charmander (4), Squirtle (7),
Chikorita (152), Cyndaquil (155), Totodile (158), Treecko (252), Torchic (255),
Mudkip (258) con rate:3 (rarissimi) nei percorsi appropriati per tipo.

**Evoluzioni per scambio → implementa Pietra Scambio:**
I seguenti Pokémon evolvono normalmente per scambio — non implementeremo gli scambi.
Invece, crea un oggetto "Pietra Scambio" che funziona come una pietra evolutiva
(stessa logica di Pietra Lunare/Pietra Fuoco) e lo sostituisce per questi Pokémon:
- Kadabra → Alakazam
- Machoke → Machamp
- Graveler → Golem
- Haunter → Gengar
- Onix → Steelix
- Scyther → Scizor
- Porygon → Porygon2
- Slowpoke → Slowking (alternativa a Slowbro)
- Poliwhirl → Politoed (alternativa a Poliwrath)
- Seadra → Kingdra
- Clamperl → Huntail / Gorebyss
La Pietra Scambio si trova nei negozi avanzati (Albano in poi) e come oggetto
nascosto nei dungeon. Aggiungi l'oggetto in `data.js` e la logica evolutiva in `app.js`.

### Zone incontri — tabella base (arricchisci liberamente)

```js
// Formato: { id: POKEMON_ID, lv_min: X, lv_max: Y, rate: Z }
// rate = peso relativo. Comune: 25-30. Raro: 8-15. Rarissimo: 3-5.
// IMPORTANTE: aggiungi specie extra coerenti con habitat e tipo zona.

"percorso-1": [ // Lv 3-6 — campagna aperta
  {id:10,lv_min:3,lv_max:5,rate:30},   // Caterpie
  {id:13,lv_min:3,lv_max:5,rate:30},   // Weedle
  {id:16,lv_min:4,lv_max:6,rate:25},   // Pidgey
  {id:19,lv_min:3,lv_max:5,rate:25},   // Rattata
  {id:29,lv_min:3,lv_max:5,rate:20},   // Nidoran♀
  {id:32,lv_min:3,lv_max:5,rate:20},   // Nidoran♂
  {id:161,lv_min:3,lv_max:5,rate:18},  // Sentret (Gen2)
  {id:163,lv_min:4,lv_max:6,rate:18},  // Hoothoot (Gen2)
  {id:265,lv_min:3,lv_max:5,rate:15},  // Wurmple (Gen3)
  {id:276,lv_min:4,lv_max:6,rate:15},  // Taillow (Gen3)
  {id:4,lv_min:5,lv_max:6,rate:3},     // Charmander (starter raro)
],

"vigne-frascati": [ // Lv 4-8 — vigne, erba alta
  {id:43,lv_min:4,lv_max:6,rate:30},   // Oddish
  {id:46,lv_min:5,lv_max:7,rate:25},   // Paras
  {id:69,lv_min:5,lv_max:8,rate:20},   // Bellsprout
  {id:29,lv_min:4,lv_max:7,rate:20},   // Nidoran♀
  {id:32,lv_min:4,lv_max:7,rate:20},   // Nidoran♂
  {id:187,lv_min:4,lv_max:7,rate:20},  // Hoppip (Gen2)
  {id:191,lv_min:5,lv_max:7,rate:18},  // Sunkern (Gen2)
  {id:285,lv_min:5,lv_max:8,rate:18},  // Shroomish (Gen3)
  {id:315,lv_min:6,lv_max:8,rate:12},  // Roselia (Gen3)
  {id:37,lv_min:6,lv_max:8,rate:10},   // Vulpix — POKEMON FUOCO Villa Torlonia zona
  {id:4,lv_min:6,lv_max:8,rate:3},     // Charmander (rarissimo)
],

"villa-torlonia-frascati": [ // Lv 6-10 — giardini villa, zona speciale FUOCO
  // Zona accessibile dal giardino di Villa Torlonia/Aldobrandini a Frascati
  // Prevalenza Pokémon Fuoco coerente con zona soleggiata/vulcanica dei Castelli
  {id:37,lv_min:6,lv_max:9,rate:35},   // Vulpix
  {id:58,lv_min:7,lv_max:10,rate:30},  // Growlithe
  {id:4,lv_min:6,lv_max:9,rate:20},    // Charmander
  {id:126,lv_min:8,lv_max:10,rate:15}, // Magmar
  {id:228,lv_min:7,lv_max:10,rate:18}, // Houndour (Gen2)
  {id:255,lv_min:7,lv_max:10,rate:5},  // Torchic (starter raro)
],

"percorso-2": [ // Lv 7-11 — castagneti collinari
  {id:16,lv_min:7,lv_max:9,rate:25},   // Pidgey
  {id:19,lv_min:7,lv_max:9,rate:25},   // Rattata
  {id:43,lv_min:8,lv_max:10,rate:20},  // Oddish
  {id:29,lv_min:7,lv_max:10,rate:18},  // Nidoran♀
  {id:32,lv_min:7,lv_max:10,rate:18},  // Nidoran♂
  {id:179,lv_min:8,lv_max:11,rate:18}, // Mareep (Gen2)
  {id:183,lv_min:7,lv_max:10,rate:18}, // Marill (Gen2)
  {id:261,lv_min:8,lv_max:10,rate:15}, // Poochyena (Gen3)
  {id:263,lv_min:7,lv_max:9,rate:15},  // Zigzagoon (Gen3)
  {id:273,lv_min:9,lv_max:11,rate:10}, // Seedot (Gen3)
  {id:43,lv_min:8,lv_max:11,rate:12},  // Oddish
  {id:1,lv_min:9,lv_max:11,rate:3},    // Bulbasaur (starter raro)
],

"boschi-tuscolo": [ // Lv 8-12 — bosco fitto, rovine
  {id:10,lv_min:8,lv_max:10,rate:25},  // Caterpie
  {id:46,lv_min:9,lv_max:11,rate:25},  // Paras
  {id:92,lv_min:10,lv_max:12,rate:15}, // Gastly
  {id:29,lv_min:8,lv_max:11,rate:20},  // Nidoran♀
  {id:32,lv_min:8,lv_max:11,rate:20},  // Nidoran♂
  {id:43,lv_min:8,lv_max:11,rate:18},  // Oddish
  {id:102,lv_min:9,lv_max:12,rate:15}, // Exeggcute
  {id:204,lv_min:9,lv_max:11,rate:18}, // Pineco (Gen2)
  {id:213,lv_min:10,lv_max:12,rate:12},// Shuckle (Gen2)
  {id:290,lv_min:8,lv_max:10,rate:18}, // Nincada (Gen3)
  {id:291,lv_min:10,lv_max:12,rate:8}, // Ninjask (Gen3)
  {id:283,lv_min:9,lv_max:11,rate:12}, // Surskit (Gen3)
  {id:252,lv_min:9,lv_max:11,rate:3},  // Treecko (starter raro)
  // Celebi: gestito separatamente con logica speciale 3% post-Solitario
],

"percorso-3": [ // Lv 10-16 — campagna verso Marino
  {id:41,lv_min:10,lv_max:13,rate:25}, // Zubat
  {id:43,lv_min:10,lv_max:13,rate:20}, // Oddish
  {id:60,lv_min:11,lv_max:14,rate:20}, // Poliwag
  {id:98,lv_min:11,lv_max:14,rate:18}, // Krabby
  {id:183,lv_min:10,lv_max:13,rate:20},// Marill (Gen2)
  {id:193,lv_min:11,lv_max:14,rate:15},// Yanma (Gen2)
  {id:270,lv_min:11,lv_max:15,rate:15},// Lotad (Gen3)
  {id:283,lv_min:12,lv_max:16,rate:10},// Surskit (Gen3)
  {id:278,lv_min:11,lv_max:15,rate:15},// Wingull (Gen3)
  {id:54,lv_min:12,lv_max:16,rate:12}, // Psyduck
  {id:158,lv_min:12,lv_max:15,rate:3}, // Totodile (starter raro)
],

"percorso-4": [ // Lv 12-19 — salita collinare verso osservatorio
  {id:81,lv_min:12,lv_max:15,rate:25}, // Magnemite
  {id:100,lv_min:13,lv_max:16,rate:20},// Voltorb
  {id:84,lv_min:12,lv_max:16,rate:20}, // Doduo
  {id:21,lv_min:13,lv_max:17,rate:20}, // Spearow
  {id:180,lv_min:13,lv_max:17,rate:18},// Flaaffy (Gen2)
  {id:239,lv_min:12,lv_max:16,rate:15},// Elekid (Gen2)
  {id:170,lv_min:13,lv_max:17,rate:15},// Chinchou (Gen2)
  {id:309,lv_min:13,lv_max:17,rate:15},// Electrike (Gen3)
  {id:312,lv_min:14,lv_max:18,rate:10},// Minun (Gen3)
  {id:311,lv_min:14,lv_max:18,rate:10},// Plusle (Gen3)
  {id:179,lv_min:15,lv_max:19,rate:10},// Mareep
  {id:155,lv_min:14,lv_max:17,rate:3}, // Cyndaquil (starter raro)
],

// ── LAGO ALBANO — due zone separate ──────────────────────────────────────────
// IMPORTANTE: distingui erba alta in spiaggia da incontri in acqua (Surf)

"lago-albano-spiaggia": [ // Lv 15-22 — erba alta sulla riva
  {id:54,lv_min:15,lv_max:19,rate:30}, // Psyduck
  {id:60,lv_min:15,lv_max:19,rate:28}, // Poliwag
  {id:98,lv_min:16,lv_max:20,rate:25}, // Krabby
  {id:183,lv_min:15,lv_max:19,rate:22},// Marill (Gen2)
  {id:194,lv_min:16,lv_max:20,rate:20},// Wooper (Gen2)
  {id:270,lv_min:16,lv_max:21,rate:18},// Lotad (Gen3)
  {id:283,lv_min:16,lv_max:20,rate:15},// Surskit (Gen3)
  {id:278,lv_min:17,lv_max:22,rate:15},// Wingull (Gen3)
  {id:7,lv_min:17,lv_max:21,rate:3},   // Squirtle (starter raro)
],

"lago-albano-acqua": [ // Lv 18-28 — in acqua con Surf
  {id:54,lv_min:18,lv_max:22,rate:28}, // Psyduck
  {id:60,lv_min:18,lv_max:23,rate:25}, // Poliwag
  {id:90,lv_min:20,lv_max:24,rate:22}, // Shellder
  {id:116,lv_min:19,lv_max:24,rate:20},// Horsea
  {id:170,lv_min:18,lv_max:23,rate:20},// Chinchou (Gen2)
  {id:194,lv_min:20,lv_max:25,rate:18},// Wooper (Gen2)
  {id:258,lv_min:20,lv_max:25,rate:12},// Mudkip (Gen3)
  {id:270,lv_min:22,lv_max:27,rate:10},// Lotad (Gen3)
  {id:318,lv_min:24,lv_max:28,rate:10},// Carvanha (Gen3)
  {id:130,lv_min:25,lv_max:28,rate:5}, // Gyarados (raro)
  // Kyogre: gestito separatamente con trigger speciale GdF
],
```

### Nota finale sugli incontri per Claude Code

Questa tabella copre le zone principali ma **non è esaustiva**.
Per ogni zona non elencata (Vigne di Marino, Campagna Ariccia, Sentiero Innevato,
Grotta del Vulcano, Monte Cavo ecc.) applica lo stesso criterio:
- Livelli coerenti con la palestra più vicina
- Mix Gen 1+2+3 sempre
- Almeno una specie rara (rate 3-8) per zona
- Controlla nel codice esistente (`world.js`) le zone già definite
  e arricchisci senza cancellare specie già presenti

---

## MODIFICA 4 — EXP bilanciata

In `battle.js` o nel calcolo EXP, modifica il moltiplicatore base:

```js
// Formula attuale (o equivalente):
// exp = pokemon_base_exp * livello_nemico / 7

// Nuova formula — più generosa senza essere triviale:
function calcolaExp(pokemonSconfitto, livelloNemico, eTrainer) {
  const baseExp = pokemonSconfitto.base_experience || 50;
  const moltiplicatore = eTrainer ? 1.5 : 1.0; // trainer danno 50% in più
  const exp = Math.floor((baseExp * livelloNemico * moltiplicatore) / 5);
  return Math.max(exp, 10); // minimo 10 exp
}
```

---

## MODIFICA 5 — Velocità battaglia: toggle nel menu

### 5A. Stato — `app.js`

Nel blocco `stato` aggiungi:
```js
impostazioni: {
  battagliaVeloce: false,
  // altre impostazioni future
}
```

### 5B. Menu impostazioni — `index.html` o nel render del menu

Aggiungi toggle nel pannello impostazioni/menu:
```html
<div class="impostazione-riga">
  <span>Battaglia Veloce</span>
  <button id="btn-battaglia-veloce" onclick="toggleBattagliaVeloce()">OFF</button>
</div>
```

### 5C. Funzione toggle — `app.js`

```js
function toggleBattagliaVeloce() {
  stato.impostazioni.battagliaVeloce = !stato.impostazioni.battagliaVeloce;
  document.getElementById('btn-battaglia-veloce').textContent =
    stato.impostazioni.battagliaVeloce ? 'ON' : 'OFF';
  salvaPartita();
}
```

### 5D. Animazioni battaglia — `battle.js`

Ovunque ci sia un `await delay(ms)` o equivalente, sostituisci con:
```js
await delay(stato.impostazioni.battagliaVeloce ? Math.min(ms, 80) : ms);
```
Questo dimezza i tempi di attesa quando la modalità veloce è attiva.

---

## MODIFICA 6 — Mosse multi-turno

In `battle.js`, aggiungi il sistema di lock del turno per mosse che occupano 2+ turni.

### 6A. Struttura stato battaglia

Nel blocco che gestisce lo stato del combattimento, aggiungi:
```js
// Dentro lo stato battaglia (battStato o equivalente):
lockMossa: null,
// formato: { mossaId: string, turniRimanenti: number, fase: string }
```

### 6B. Tabella mosse con effetti multi-turno — `dati/mosse.js` o in `battle.js`

```js
const MOSSE_MULTITURN = {
  // Mosse a 2 turni (carica + scarica)
  363: { tipo: "carica_scarica", turni: 2,
         msg_carica: "{attaccante} sta caricando!" },  // Iper Raggio
  160: { tipo: "carica_scarica", turni: 2,
         msg_carica: "{attaccante} si sta avvolgendo su se stesso..." }, // Rotolamento — cresce ogni turno
  // Mosse che lockano per N turni
  200: { tipo: "lock_turni", turni: 3,
         msg: "{attaccante} è in preda all'oltraggio!" },  // Oltraggio
  // Mosse con effetto al turno successivo
  281: { tipo: "effetto_ritardato", turni: 1,
         effetto: "sonno",
         msg: "{bersaglio} sta iniziando a sbadigliare..." }, // Sbadiglio
  // Fine combattimento mosse
  138: { tipo: "fine_dopo_uso", turni: 1,
         msg: "{attaccante} ha usato tutte le sue energie!" }, // Ultimo Canto
};
```

### 6C. Logica turno lockato — `battle.js`

All'inizio della funzione che gestisce la scelta mossa del giocatore:

```js
function gestisciTurnoGiocatore() {
  // Se c'è un lock attivo, salta la scelta e usa la mossa lockata
  if (battStato.lockMossa) {
    const lock = battStato.lockMossa;
    lock.turniRimanenti--;

    if (lock.turniRimanenti <= 0) {
      // Effetto finale del lock (es. confusione dopo Oltraggio)
      if (lock.tipo === 'lock_turni') {
        applicaConfusione(battStato.pokemonGiocatore);
      }
      battStato.lockMossa = null;
    }
    // Esegui automaticamente la mossa
    return eseguiMossa(lock.mossaId, battStato.pokemonGiocatore, battStato.pokemonNemico);
  }
  // Altrimenti mostra normale menu mosse
  mostraMenuMosse();
}
```

### 6D. Attivazione lock — `battle.js`

Dopo `usaMossa(mossaId)`, controlla se la mossa è nella tabella:

```js
function dopoUsaMossa(mossaId) {
  const multiturn = MOSSE_MULTITURN[mossaId];
  if (!multiturn) return;

  switch(multiturn.tipo) {
    case 'carica_scarica':
      if (!battStato.lockMossa) {
        // Primo turno: carica, non fa danno
        battStato.lockMossa = { mossaId, turniRimanenti: 1, tipo: 'carica_scarica' };
        mostraMessaggio(multiturn.msg_carica.replace('{attaccante}',
          battStato.pokemonGiocatore.name));
        return true; // salta il danno questo turno
      }
      break;
    case 'lock_turni':
      battStato.lockMossa = { mossaId, turniRimanenti: multiturn.turni - 1,
        tipo: 'lock_turni' };
      break;
    case 'effetto_ritardato':
      battStato.effettoRitardato = { effetto: multiturn.effetto,
        turniRimanenti: multiturn.turni, bersaglio: 'nemico' };
      mostraMessaggio(multiturn.msg.replace('{bersaglio}',
        battStato.pokemonNemico.name));
      break;
    case 'fine_dopo_uso':
      battStato.lockMossa = { mossaId, turniRimanenti: 0, tipo: 'fine_dopo_uso' };
      break;
  }
}
```

---

## File da modificare — riepilogo

| File | Modifiche |
|---|---|
| `dati/npc.js` | Grunt GdF Abbazia, evento documento Villa, custode Villa |
| `dati/trainer.js` | Allenatori Percorso 3 (8+2), Percorso 4 (8+2) |
| `world.js` | Zone incontri aggiornate Gen1+2+3, livelli scalati |
| `battle.js` | EXP bilanciata, velocità battaglia, mosse multi-turno |
| `app.js` | Toggle battaglia veloce, stato impostazioni |
| `index.html` | Bottone toggle nel menu |
| `map.js` | Gate porta Abbazia (medaglie >= 7) |

## Note importanti

- Gli sprite GdF grunt: **NOTA UTENTE — sostituisci "GDF_GRUNT_SPRITE" con il nome
  file sprite reale nella cartella sprites/**
- I Pokémon ID usati nelle squadre trainer sono tutti Gen 1-3 (1-386)
- Non toccare i dati delle palestre già implementate
- Non toccare il sistema gauntlet già funzionante
- Testa la catena narrativa: Abbazia → flag → Castel Gandolfo → flag → Museo Nemi

---

## MODIFICA 6B — Mosse multi-turno COMPLETE (integrazione tabella)

La tabella MOSSE_MULTITURN nella MODIFICA 6 va sostituita con questa versione completa
che copre tutte le mosse Gen 1-3 con comportamento multi-turno.

### ISTRUZIONI PER CLAUDE CODE PRIMA DI IMPLEMENTARE

**Questa lista è una base — non è garantita completa.**
Prima di implementare, interroga PokéAPI per verificare e arricchire:

```js
// Esegui questo controllo per ogni mossa sospetta:
// GET https://pokeapi.co/api/v2/move/{id}/
// Controlla i campi:
// - effect_entries[].effect  → descrizione testuale dell'effetto
// - meta.min_turns / meta.max_turns  → se presenti, è una mossa multi-turno
// - meta.ailment.name  → stato che applica
// - meta.category.name  → "damage+ailment", "damage+lower", "unique" ecc.
// - effect_chance  → probabilità effetto secondario

// Casistiche da cercare che potrebbero mancare in questa lista:
// 1. Mosse "unique" con logica speciale (es. Trasformazione, Spettro, Riciclo)
// 2. Mosse che applicano Fasciatura/Avvolgimento (danno ogni turno per 4-5 turni)
//    → Avvolgimento (35), Legatura (20), Rastrello (10), Eruzione (225), Sparaborre (284)
// 3. Mosse che ricaricano HP a fine turno (Riposo già gestito come stato sonno)
// 4. Mosse meteo (Danza Pioggia, Giornata, Grandine, Sabbionata) — durata 5 turni
// 5. Schermo di luce / Riflesso — durata 5 turni, riducono danno
// 6. Maledizione (tipo Ghost: dimezza HP attaccante, mette maledizione; tipo non-Ghost: +Att+Dif-Vel)
// 7. Paura (Intimidazione come abilità vs mossa)

// Se trovi mosse con meta.min_turns > 0 non presenti qui, aggiungile alla tabella.
```

**Usa gli ID mossa di PokéAPI** (verificali con `PokeAPI.getMossa()` se in dubbio).

```js
const MOSSE_MULTITURN = {

  // ── CARICA + SCARICA (turno 1: carica senza danno, turno 2: danno) ──────────
  // Volo: turno 1 vola in alto (invulnerabile), turno 2 attacca
  19:  { tipo: "carica_scarica", turni: 2, invulnerabile: true,
         msg_carica: "{attaccante} è volato in alto!" },
  // Tuffo: turno 1 si immerge (invulnerabile), turno 2 attacca
  291: { tipo: "carica_scarica", turni: 2, invulnerabile: true,
         msg_carica: "{attaccante} si è immerso sott'acqua!" },
  // Ossa Ninja: turno 1 scompare (invulnerabile), turno 2 attacca
  10:  { tipo: "carica_scarica", turni: 2, invulnerabile: true,
         msg_carica: "{attaccante} è scomparso!" },
  // Solarraggio: turno 1 carica energia, turno 2 spara (no carica sotto pioggia)
  76:  { tipo: "carica_scarica", turni: 2, invulnerabile: false,
         msg_carica: "{attaccante} sta assorbendo la luce solare!",
         bypass_meteo: "sole" }, // se c'è sole, spara subito
  // Iper Raggio: spara, poi deve ricaricare (turno dopo non fa niente)
  63:  { tipo: "ricarica", turni: 1,
         msg_ricarica: "{attaccante} deve ricaricarsi!" },
  // Taglio Astrale (Giga Impact): stesso di Iper Raggio
  338: { tipo: "ricarica", turni: 1,
         msg_ricarica: "{attaccante} deve ricaricarsi!" },

  // ── LOCK N TURNI (poi effetto negativo) ─────────────────────────────────────
  // Oltraggio: 2-3 turni, poi confusione
  200: { tipo: "lock_turni", turni_min: 2, turni_max: 3,
         effetto_fine: "confusione",
         msg: "{attaccante} è in preda all'oltraggio!",
         msg_fine: "{attaccante} è confuso per la stanchezza!" },
  // Petalobufera: 2-3 turni, poi confusione
  80:  { tipo: "lock_turni", turni_min: 2, turni_max: 3,
         effetto_fine: "confusione",
         msg: "{attaccante} è travolto dalla petalobufera!",
         msg_fine: "{attaccante} è confuso per la stanchezza!" },
  // Tempestafuoco: 2-3 turni, poi confusione
  257: { tipo: "lock_turni", turni_min: 2, turni_max: 3,
         effetto_fine: "confusione",
         msg: "{attaccante} è in preda alla tempestafuoco!",
         msg_fine: "{attaccante} è confuso per la stanchezza!" },

  // ── CUMULO (danno cresce ogni turno) ────────────────────────────────────────
  // Rotolamento: 5 turni, danno raddoppia ogni turno (x2, x4, x8, x16, x32)
  205: { tipo: "cumulo", turni: 5, moltiplicatore: 2,
         msg: "{attaccante} continua a rotolare!" },
  // Sfida: stesso meccanismo di Rotolamento
  350: { tipo: "cumulo", turni: 5, moltiplicatore: 2,
         msg: "{attaccante} continua la sfida!" },

  // ── EFFETTO RITARDATO ────────────────────────────────────────────────────────
  // Sbadiglio: questo turno avvisa, turno prossimo addormenta
  281: { tipo: "effetto_ritardato", turni: 1,
         effetto: "sonno", bersaglio: "nemico",
         msg: "{bersaglio} ha iniziato a sbadigliare..." },
  // Futuravendetta: questo turno carica, 2 turni dopo danno fisso
  149: { tipo: "effetto_ritardato", turni: 2,
         effetto: "danno_fisso", potenza: 80, bersaglio: "nemico",
         msg: "{attaccante} ha concentrato la sua energia!" },
  // Desiderio: questo turno carica, turno prossimo cura 50% HP del Pokémon attivo
  273: { tipo: "effetto_ritardato", turni: 1,
         effetto: "cura_percentuale", percentuale: 0.5, bersaglio: "proprio",
         msg: "{attaccante} ha espresso un desiderio!" },

  // ── FINE DOPO USO (il Pokémon sviene o non può più agire) ───────────────────
  // Ultimo Canto: riduce Att avversario, poi il proprio Pokémon sviene
  // (in questo gioco: sviene, non "si addormenta" — semplificazione accettabile)
  298: { tipo: "fine_dopo_uso",
         effetto_prima: { stat: "attacco", variazione: -2, bersaglio: "nemico" },
         msg: "{attaccante} ha cantato il suo ultimo canto!",
         msg_fine: "{attaccante} è esausto!" },
  // Esplosione: KO istantaneo del proprio Pokémon, danno enorme
  153: { tipo: "autodistruzione",
         msg: "{attaccante} è esploso!" },
  // Autodistruzione: stesso
  120: { tipo: "autodistruzione",
         msg: "{attaccante} si è autodistrutto!" },

  // ── PROTEZIONE (blocca il turno avversario) ──────────────────────────────────
  // Protezione: blocca tutti i danni per 1 turno, successo decresce se usata di fila
  182: { tipo: "protezione", turni: 1,
         msg: "{attaccante} si è protetto!",
         msg_fallimento: "Ma ha fallito!" },
  // Individuazione: simile a protezione ma solo mosse fisiche
  // (semplifica come protezione parziale)
  132: { tipo: "protezione_parziale", turni: 1,
         msg: "{attaccante} si è preparato!" },

};
```

### Implementazione turni_min / turni_max per lock_turni

Per le mosse con durata variabile (Oltraggio, Petalobufera, Tempestafuoco),
al momento dell'attivazione del lock calcola la durata:

```js
case 'lock_turni':
  const durata = multiturn.turni_min +
    Math.floor(Math.random() * (multiturn.turni_max - multiturn.turni_min + 1));
  battStato.lockMossa = {
    mossaId,
    turniRimanenti: durata - 1,
    tipo: 'lock_turni',
    effetto_fine: multiturn.effetto_fine,
    msg_fine: multiturn.msg_fine
  };
  break;
```

### Implementazione cumulo (Rotolamento)

```js
case 'cumulo':
  if (!battStato.lockMossa) {
    battStato.lockMossa = {
      mossaId,
      turniRimanenti: multiturn.turni - 1,
      tipo: 'cumulo',
      moltiplicatoreCorrente: 1,
      moltiplicatoreBase: multiturn.moltiplicatore
    };
  } else {
    // Ogni turno successivo moltiplica il danno
    battStato.lockMossa.moltiplicatoreCorrente *= multiturn.moltiplicatore;
  }
  // Passa moltiplicatoreCorrente alla formula danno
  break;
```

### Implementazione effetti ritardati (Sbadiglio, Futuravendetta, Desiderio)

Aggiungi array `battStato.effettiRitardati = []` e controlla a ogni fine turno:

```js
function controllEffettiRitardati() {
  battStato.effettiRitardati = battStato.effettiRitardati
    .map(e => ({ ...e, turniRimanenti: e.turniRimanenti - 1 }))
    .filter(e => {
      if (e.turniRimanenti <= 0) {
        applicaEffettoRitardato(e); // applica l'effetto
        return false; // rimuovi dalla lista
      }
      return true;
    });
}

function applicaEffettoRitardato(effetto) {
  switch(effetto.tipo) {
    case 'sonno':
      applicaStato(effetto.bersaglio === 'nemico'
        ? battStato.pokemonNemico
        : battStato.pokemonGiocatore, 'sonno');
      break;
    case 'danno_fisso':
      const target = effetto.bersaglio === 'nemico'
        ? battStato.pokemonNemico : battStato.pokemonGiocatore;
      target.hpAttuali = Math.max(0, target.hpAttuali - effetto.potenza);
      mostraMessaggio(`Il colpo ritardato ha colpito ${target.nome}!`);
      break;
    case 'cura_percentuale':
      const pkm = battStato.pokemonGiocatore;
      const cura = Math.floor(pkm.hpMax * effetto.percentuale);
      pkm.hpAttuali = Math.min(pkm.hpMax, pkm.hpAttuali + cura);
      mostraMessaggio(`${pkm.nome} ha recuperato energia dal desiderio!`);
      break;
  }
}
```

---

## MODIFICA 7 — Trigger dialogo GdF per avvicinamento (mappa)

### 7A. Sistema trigger avvicinamento — `map.js`

I grunt GdF all'Abbazia hanno `trigger: "avvicinamento"` nel loro NPC data.
Il motore mappa deve controllare questo trigger diversamente dal normale NPC:
- Il normale NPC si attiva solo con tasto Interagisci (faccia a faccia)
- Il trigger avvicinamento si attiva appena il giocatore entra nel raggio di 2 tile

```js
// In checkEventiVicini() o equivalente, aggiungi:
function checkTriggerAvvicinamento(oggettiNearby) {
  for (const obj of oggettiNearby) {
    if (obj.type !== 'npc') continue;
    const npcData = DIALOGHI_NPC[getProp(obj, 'id')];
    if (!npcData || npcData.trigger !== 'avvicinamento') continue;

    const dx = Math.abs(posizioneGiocatore.x - obj.x / TW);
    const dy = Math.abs(posizioneGiocatore.y - obj.y / TH);
    if (dx <= 2 && dy <= 2) {
      // Controlla se già battuto
      const npcId = getProp(obj, 'id');
      if (stato.flags[`${npcId}_battuto`]) continue;

      // Avvia battaglia trainer (questi NPC sono trainer GdF)
      avviaBattagliaTrainer(npcId);
      return;
    }
  }
}
```

### 7B. Post-battaglia NPC GdF — `map.js`

Dopo la vittoria contro un grunt GdF con `trigger: avvicinamento`:
1. Setta flag `${npcId}_battuto = true`
2. Mostra il dialogo `post_battaglia` dell'NPC
3. Il grunt rimane sulla mappa ma non attacca più (dialogo normale)

```js
function dopoVittoriaGrunt(npcId) {
  stato.flags[`${npcId}_battuto`] = true;
  salvaPartita();
  // Mostra dialogo post_battaglia
  const npcData = DIALOGHI_NPC[npcId];
  if (npcData?.post_battaglia) {
    mostraDialogo(npcData.post_battaglia[0]);
  }
}
```

### 7C. Gate porta Abbazia nel TMJ — da aggiungere a mano in Tiled

Apri `maps_tiled/grottaferrata.tmj` (o la mappa interna dell'Abbazia quando la crei)
e aggiungi sulla soglia della porta un oggetto con queste proprietà:

```
type: gate_npc
id: gdf_porta_abbazia
condizione: medaglie >= 7
sprite: GDF_GRUNT_SPRITE   ← NOTA UTENTE: sostituisci con sprite reale
direzione: sud
gate: true
```

Il sistema `gestisciGateNpc()` già implementato nella MODIFICA 1B gestirà
automaticamente il blocco e il dialogo.

---

## MODIFICA 8 — Percorsi Lago Albano (2 accessi)

### 8A. Percorso Marino → Lago Albano — `world.js` o `dati/zone.js`

Aggiungi zona:
```js
"percorso-marino-lago": {
  nome: "Riva del Lago — da Marino",
  lv_min: 15, lv_max: 22,
  tipo: "misto", // erba + acqua
  incontri: [
    {id:54,lv_min:15,lv_max:19,rate:25},  // Psyduck
    {id:60,lv_min:15,lv_max:19,rate:25},  // Poliwag
    {id:183,lv_min:16,lv_max:20,rate:20}, // Marill (Gen2)
    {id:270,lv_min:16,lv_max:20,rate:20}, // Lotad (Gen3)
    {id:278,lv_min:17,lv_max:22,rate:15}, // Wingull (Gen3)
    {id:98,lv_min:17,lv_max:22,rate:15},  // Krabby
  ],
  richiede_mn: null, // accessibile subito
  connette: ["marino", "lago-albano"]
},
```

### 8B. Percorso Castel Gandolfo → Lago Albano — `world.js`

```js
"percorso-castgand-lago": {
  nome: "Riva del Lago — da Castel Gandolfo",
  lv_min: 18, lv_max: 24,
  tipo: "misto",
  incontri: [
    {id:54,lv_min:18,lv_max:22,rate:25},  // Psyduck
    {id:90,lv_min:18,lv_max:22,rate:20},  // Shellder
    {id:170,lv_min:19,lv_max:23,rate:20}, // Chinchou (Gen2)
    {id:194,lv_min:18,lv_max:22,rate:20}, // Wooper (Gen2)
    {id:318,lv_min:20,lv_max:24,rate:15}, // Carvanha (Gen3)
    {id:258,lv_min:19,lv_max:23,rate:10}, // Mudkip (Gen3)
  ],
  // Entra più vicino all'uscita sul lago (lato est del lago)
  spawn_lato: "est",
  richiede_mn: null,
  connette: ["castel-gandolfo", "lago-albano"]
},
```

### 8C. Accesso Lago Albano con Surf — `world.js`

Il Lago Albano è accessibile via Surf da entrambi i percorsi.
Aggiungi trigger_surf sui bordi acqua di entrambi i percorsi:
- `percorso-marino-lago`: trigger_surf a x=fine percorso, bordo acqua
- `percorso-castgand-lago`: trigger_surf a x=fine percorso, bordo acqua

Nel motore: quando il giocatore usa Surf su un tile acqua in queste zone,
carica la zona `lago-albano` con spawn appropriato.

---

## Riepilogo finale file da modificare (aggiornato)

| File | Modifiche |
|---|---|
| `dati/npc.js` | Grunt GdF Abbazia, evento documento Villa, custode Villa |
| `dati/trainer.js` | Allenatori Percorso 3 (8+2), Percorso 4 (8+2) |
| `world.js` | Zone incontri Gen1+2+3, percorsi lago, livelli scalati |
| `battle.js` | EXP, velocità, mosse multi-turno COMPLETE |
| `app.js` | Toggle battaglia veloce, stato impostazioni |
| `index.html` | Bottone toggle nel menu |
| `map.js` | Trigger avvicinamento GdF, post-battaglia grunt, gate porta |
| `Tiled (manuale)` | Gate NPC porta Abbazia su grottaferrata.tmj quando creata |

## Note finali

- **Sprite GdF**: NOTA UTENTE — cerca tutte le occorrenze di `GDF_GRUNT_SPRITE`
  nel prompt e sostituisci con il nome file reale in `sprites/`
- Le mosse multi-turno usano ID PokéAPI — verifica con `PokeAPI.getMossa()`
  se qualche ID non corrisponde (possibile sfasamento Gen 1-3)
- I percorsi lago non hanno ancora TMJ — genera le mappe Tiled separatamente
- Non toccare gauntlet palestre, leggendari già implementati, sistema GdF F10
