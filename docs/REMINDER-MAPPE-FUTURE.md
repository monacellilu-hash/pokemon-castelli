# REMINDER — Contenuti in attesa delle mappe Tiled

## ⚠️ Aperti dalla sessione Marino/Rocca di Papa (8 luglio 2026)

- **Donatore MN Surf (Nonna Assunta)**: da `DONATORI_MN` (data.js) sta ad **Albano
  Laziale (la città), NON al Lago Albano** — attenzione a non confonderli quando la
  città di Albano verrà disegnata in Tiled. Funzione già pronta: `interagisciDonatoreSurf()`
  in app.js (azione NPC), gate a ≥5 Medaglie. Va solo piazzato un NPC con
  `azione: 'interagisciDonatoreSurf'` in `albano.tmj` quando esiste (il file
  `sprites/maps_tiled/albano.tmj` esiste già ma non è nel path del gioco).
- **Donatore MN Volo (Faustino)**: ✅ già piazzato a Rocca di Papa (`faustino_funivia`
  in dati/npc.js, azione `interagisciDonatoreVolo`), gate a ≥6 Medaglie.
- **Interno palestra di Marino** (Moro): la mappa `pokemon-castelli-palestra_marino.tmj`
  esiste ma va disegnata/rifinita dall'utente (i dati gregari 1-7... anzi 1-5 +
  gym_leader sono già in `dati/trainer.js`, pronti per gli id degli oggetti trainer).
  Rimossi 24 oggetti "acqua_lago di albano_surf" copiati per errore dal Lago Albano
  nel layer collisioni (bloccavano mezza palestra e davano incontri Surf assurdi
  dentro un edificio).
- **Interno palestra di Rocca di Papa** (Rocco): mappa ancora da creare, chiave
  attesa `interno_palestra_rocco` (registrala in `js/map.js` MAPPE quando esiste).
  Dati gregari 1-7 + gym_leader già in `dati/trainer.js`.
- **`percorso_montano_v1.tmj` → `warp_summit`**: ramo laterale verso "la vetta della
  montagna", destinazione lasciata a `TODO_vetta_montagna` (non risolve, toast
  "zona non disponibile"). Da decidere se è Monte Cavo (Lugia) o il Sentiero
  Innevato (Articuno/funivia) — la mappa va comunque ancora creata.
- **Grotta del Vulcano**: da Rocca di Papa (lato est) c'è ora un varco con
  `destinazione: 'grotta_vulcano'` (mappa non ancora creata, per ora toast).
- **Segnaposto lasciato in `rocca_di_papa.tmj`**: un cartello/oggetto a (4,15)
  con testo "METTI: rifugio/chalet, belvedere sul cratere, arredo invernale" —
  contenuti non specificati né in CLAUDE.md né nel documento tile, da riempire
  a piacere in Tiled.

Questo file raccoglie tutto ciò che il prompt `PROMPT_CLAUDE_CODE_aggiornamenti.md`
chiedeva ma che **non si può ancora cablare** perché le mappe Tiled relative non
esistono. È come il "promemoria degli sprite": quando crei la mappa, apri questo
file, copi il blocco pronto (già nel formato reale del gioco) e lo incolli nel
file giusto.

> ⚠️ **Sprite GdF** — ovunque trovi `GDF_GRUNT_SPRITE` sostituisci col nome reale
> di un file in `sprites/npc e trainer per claude/` (senza estensione).
> Idem per `NPC_CUSTODE`, `GDF_ADMIN`, ecc.

---

## ✅ Già fatto in questa sessione (codice puro, nessuna mappa serviva)

- **MOD 4 — EXP più generosa**: `battle.js`, formula `/5` + minimo 10 (mantenuti i
  bonus allenatore ×1.5 e medaglie).
- **MOD 3 — Incontri**: motore aggiornato con selezione **pesata** (`rate`), e zone
  esistenti arricchite Gen 1-2-3 in `dati/incontri.js` (Percorso 1, Boschi Tuscolo,
  + "incontri frascati" pronta).
- **MOD 6B — Mosse multi-turno**: aggiunte Furia/Oltraggio+confusione,
  Esplosione/Autodistruzione, Protezione/Individuazione (sopra a carica/ricarica
  già esistenti). Vedi sotto "Mosse multi-turno ancora da fare".

## ℹ️ Già coperto da sistemi esistenti (niente da duplicare)

- **MOD 5 — Velocità battaglia**: esiste già il **booster ⏩ x1/x2/x3/x5**
  (`stato.velocita`), che accelera sia i messaggi di battaglia (`di()` in battle.js)
  sia il movimento. Se in futuro vuoi un toggle dedicato "solo battaglia", si può
  aggiungere, ma oggi sarebbe un doppione.
- **MOD 7 / "trigger avvicinamento"**: gli allenatori hanno già il **cono visivo**
  (`vista`) che li fa sfidare il giocatore appena lo vedono
  (`_controllaTrainerVista` in map.js). Per i grunt GdF basterà creare oggetti
  `type: trainer` con `vista` alta. Il pezzo davvero nuovo (dialogo `post_battaglia`
  + gate porta) dipende dalla mappa Abbazia → vedi sotto.
- **Evoluzioni per scambio** (la "Pietra Scambio" del prompt): **già risolte** dal
  **Mercante degli Scambi** (`interagisciMercanteScambi` in app.js), che evolve
  Kadabra→Alakazam, Machoke→Machamp, ecc. senza bisogno di scambi reali. Non serve
  aggiungere la Pietra Scambio.

---

## 🔴 MOD 1 — Catena GdF: Abbazia → Castel Gandolfo → Museo Nemi

**Dipende da:** mappe `abbazia_san_nilo` (esterno + interno), `castel_gandolfo`
(Villa Pontificia), `museo_nemi` — **nessuna esiste**. Fa parte della fase **F10
(Team GdF)**, non ancora iniziata.

### Grunt GdF all'Abbazia → in `dati/trainer.js` (sono allenatori, formato reale)

```js
'gdf_grunt_abbazia_1': {
  sprite: 'GDF_GRUNT_SPRITE', ritratto: 'GDF_GRUNT_SPRITE', vista: 4,
  classe: 'Recluta GdF', nome: 'Grunt',
  squadra: [{ id: 19, livello: 18 }, { id: 109, livello: 19 }],
  dialogo_prima: 'Ehi! Non dovresti essere qui. Muoviti, non c\'è niente da vedere.',
  dialogo_dopo: 'Il Comandante ha già tutto sotto controllo... le coordinate sono trasmesse.',
  premio: 600,
},
'gdf_grunt_abbazia_2': {
  sprite: 'GDF_GRUNT_SPRITE', ritratto: 'GDF_GRUNT_SPRITE', vista: 4,
  classe: 'Recluta GdF', nome: 'Grunt',
  squadra: [{ id: 23, livello: 19 }, { id: 88, livello: 20 }],
  dialogo_prima: 'Questo posto ha segreti di secoli fa, e il Comandante li conosce tutti. Battiti!',
  dialogo_dopo: 'Non importa... il piano è già in moto.',
  premio: 640,
},
'gdf_grunt_abbazia_3': {
  sprite: 'GDF_GRUNT_SPRITE', ritratto: 'GDF_GRUNT_SPRITE', vista: 4,
  classe: 'Recluta GdF', nome: 'Grunt',
  squadra: [{ id: 42, livello: 20 }, { id: 89, livello: 21 }],
  dialogo_prima: 'La porta? È sbarrata. Solo chi ha l\'autorizzazione del Comandante entra.',
  dialogo_dopo: 'Il Comandante dice che risvegliare i Pokémon dell\'abisso e della terra è solo questione di tempo...',
  premio: 680,
},
```

### Documento alla Villa + Custode → in `dati/npc.js` (formato reale)

```js
// Trigger storia dentro la Villa Pontificia (azione custom che setta un flag).
'gdf_documento_villa': {
  sprite: 'GDF_GRUNT_SPRITE', direzione: 'sud', movimento: 'fisso',
  dialogo: [
    'Eccolo. Il documento che cercavamo.',
    'Le navi. Le navi romane di Nemi.',
    'Il Comandante aveva ragione. È lì che dobbiamo andare.',
  ],
  azione: 'triggerDocumentoVilla',   // da scrivere in app.js: setta stato.flags.documento_villa_trovato
},
'villa_custode': {
  sprite: 'NPC_CUSTODE', direzione: 'sud', movimento: 'random',
  dialogo: [
    'Quei soldati... hanno portato via qualcosa dagli archivi.',
    'Ho visto un documento con disegni antichi: mostri dell\'acqua e della terra.',
    'Dicevano di andare verso Nemi, al museo delle navi romane.',
  ],
},
```

### Logica da aggiungere in `app.js`

```js
// Azione NPC: trovato il documento alla Villa → sblocca la cutscene di Nemi.
async function triggerDocumentoVilla() {
  if (stato.flags?.documento_villa_trovato) return;
  stato.flags = stato.flags || {};
  stato.flags.documento_villa_trovato = true;
  salvaPartita();
  await mostraDialogo('GdF', DATI_NPC['gdf_documento_villa'].dialogo);
}
```

### Gate porta Abbazia (serve la mappa interna)

Sulla soglia, oggetto Tiled `type: gate_palestra` (o un nuovo `gate_npc`) con:
`condizione: medaglie >= 7`. Se non soddisfatta → dialogo "porta sbarrata GdF";
se soddisfatta → warp all'interno. Battuta porta:
`['La porta è sbarrata con un lucchetto GdF.', 'Ci vorrebbe qualcosa di più... di sette medaglie.']`

### Collegamento Museo Nemi

Quando creerai il trigger del Museo di Nemi, **controlla il flag**:
```js
if (!stato.flags?.documento_villa_trovato) return; // museo normale, i grunt non sono ancora arrivati
// altrimenti → cutscene GdF
```

---

## 🔴 MOD 2 — Allenatori Percorso 3 e Percorso 4

**Dipende da:** mappe `percorso_3` (Grottaferrata→Marino) e `percorso_4`
(Marino→Monte Porzio) — non esistono. Ogni `id` qui sotto va creato come oggetto
`type: trainer` nel TMJ. Formato già convertito al reale (`{id, livello}`).
Ricorda di aggiungere a ognuno `sprite`/`ritratto`/`vista` (o lasciarli nelle
props Tiled) e `dialogo_prima`/`dialogo_dopo`.

### Percorso 3 → `dati/trainer.js` (Lv 9-14, 8 + 2 zona MN Forza)

```js
'all-gm-1': { classe:'Pivello', nome:'—', squadra:[{id:19,livello:9},{id:16,livello:10}], premio:200 },
'all-gm-2': { classe:'Bambina', nome:'—', squadra:[{id:35,livello:10},{id:39,livello:11}], premio:220 },
'all-gm-3': { classe:'Coleotterista', nome:'—', squadra:[{id:13,livello:10},{id:11,livello:11}], premio:200 },
'all-gm-4': { classe:'Pivello', nome:'—', squadra:[{id:23,livello:11},{id:27,livello:12}], premio:240 },
'all-gm-5': { classe:'Ornitologo', nome:'—', squadra:[{id:16,livello:12},{id:41,livello:13}], premio:260 },
'all-gm-6': { classe:'Bambina', nome:'—', squadra:[{id:52,livello:12},{id:54,livello:13}], premio:260 },
'all-gm-7': { classe:'Pivello', nome:'—', squadra:[{id:60,livello:13},{id:118,livello:14}], premio:280 },
'all-gm-8': { classe:'Ornitologo', nome:'—', squadra:[{id:41,livello:13},{id:42,livello:14}], premio:280 },
// Zona laterale dietro un masso (MN Forza):
'all-gm-extra-1': { classe:'Pivello', nome:'—', squadra:[{id:74,livello:12},{id:75,livello:14}], premio:280 },
'all-gm-extra-2': { classe:'Bambina', nome:'—', squadra:[{id:183,livello:13},{id:184,livello:14}], premio:280 },
```
Oggetti nella zona Forza: superpozione ×2, repellente, pokeball ×2.

### Percorso 4 → `dati/trainer.js` (Lv 12-17, 8 + 2 zona MN Taglio)

```js
'all-mmp-1': { classe:'Pivello', nome:'—', squadra:[{id:19,livello:12},{id:20,livello:13}], premio:260 },
'all-mmp-2': { classe:'Bambina', nome:'—', squadra:[{id:35,livello:13},{id:36,livello:14}], premio:280 },
'all-mmp-3': { classe:'Coleotterista', nome:'—', squadra:[{id:13,livello:13},{id:14,livello:14}], premio:260 },
'all-mmp-4': { classe:'Pivello', nome:'—', squadra:[{id:100,livello:14},{id:81,livello:15}], premio:300 },
'all-mmp-5': { classe:'Ornitologo', nome:'—', squadra:[{id:84,livello:14},{id:85,livello:15}], premio:300 },
'all-mmp-6': { classe:'Bambina', nome:'—', squadra:[{id:172,livello:15},{id:25,livello:16}], premio:320 },
'all-mmp-7': { classe:'Pivello', nome:'—', squadra:[{id:179,livello:15},{id:180,livello:16}], premio:320 },
'all-mmp-8': { classe:'Ornitologo', nome:'—', squadra:[{id:84,livello:16},{id:22,livello:17}], premio:340 },
// Zona dietro un albero tagliabile (MN Taglio):
'all-mmp-extra-1': { classe:'Bambina', nome:'—', squadra:[{id:137,livello:15},{id:233,livello:17}], premio:340 },
'all-mmp-extra-2': { classe:'Pivello', nome:'—', squadra:[{id:81,livello:16},{id:82,livello:17}], premio:340 },
```
Oggetti nella zona Taglio: etere, superpozione, MT nascosta.

---

## 🟢 MOD 8 — Percorsi del Lago Albano — **FATTO (sessione 2026-07-06)**

Il lago è diventato UNA mappa sola (`Lago di Albano.tmj`). Le tabelle sono state
unite e incollate in `dati/incontri.js` con chiavi nuove:
- `"incontri lago albano"` (spiaggia, erba alta, Lv 15-22)
- `"incontri lago albano surf"` (in acqua col Surf, Lv 18-28)
- `"incontri castel gandolfo"` (borgo, Lv 16-23 — al posto di "lago castgand")

Mancano solo gli **oggetti zona nel .tmj** (rettangoli sul layer eventi con
`type: erba_alta`/`acqua` e `id` = chiave). I blocchi qui sotto restano come
riferimento storico:

```js
// Riva del Lago lato Marino (Lv 15-22) — erba alta
'incontri lago marino': {
  probabilita: 15,
  pokemon: [
    {id:54, min:15,max:19, rate:25}, {id:60, min:15,max:19, rate:25},
    {id:183,min:16,max:20, rate:20}, {id:270,min:16,max:20, rate:20},
    {id:278,min:17,max:22, rate:15}, {id:98, min:17,max:22, rate:15},
  ],
},
// Riva del Lago lato Castel Gandolfo (Lv 18-24) — erba alta
'incontri lago castgand': {
  probabilita: 15,
  pokemon: [
    {id:54, min:18,max:22, rate:25}, {id:90, min:18,max:22, rate:20},
    {id:170,min:19,max:23, rate:20}, {id:194,min:18,max:22, rate:20},
    {id:318,min:20,max:24, rate:15}, {id:258,min:19,max:23, rate:10},
  ],
},
// In acqua col Surf (Lv 18-28)
'incontri lago acqua': {
  probabilita: 18,
  pokemon: [
    {id:54, min:18,max:22, rate:28}, {id:60, min:18,max:23, rate:25},
    {id:90, min:20,max:24, rate:22}, {id:116,min:19,max:24, rate:20},
    {id:170,min:18,max:23, rate:20}, {id:194,min:20,max:25, rate:18},
    {id:258,min:20,max:25, rate:12}, {id:318,min:24,max:28, rate:10},
    {id:130,min:25,max:28, rate:5},  // Gyarados raro
    {id:7,  min:21,max:25, rate:3},  // Squirtle starter rarissimo
    // Kyogre: trigger speciale GdF, a parte.
  ],
},
```

---

## 🟡 MOD 3 (resto) — Zone incontri delle mappe future

**Aggiornamento 2026-07-06:** percorso 2, 3 e 4 sono GIÀ in `dati/incontri.js`
(più le nuove zone marino / lago albano / castel gandolfo / percorso 5).
Resta da incollare solo **"incontri villa torlonia"** (manca la mappa dei
giardini). I blocchi restano come riferimento.

```js
// Percorso 2 — castagneti collinari (Frascati→Grottaferrata) Lv 7-11
'incontri percorso 2': {
  probabilita: 15,
  pokemon: [
    {id:16, min:7,max:9, rate:25}, {id:19, min:7,max:9, rate:25},
    {id:43, min:8,max:10,rate:20}, {id:29, min:7,max:10,rate:18},
    {id:32, min:7,max:10,rate:18}, {id:179,min:8,max:11,rate:18},
    {id:183,min:7,max:10,rate:18}, {id:261,min:8,max:10,rate:15},
    {id:263,min:7,max:9, rate:15}, {id:273,min:9,max:11,rate:10},
    {id:1,  min:9,max:11,rate:3}, // Bulbasaur starter rarissimo
  ],
},
// Percorso 3 — campagna verso Marino Lv 10-16
'incontri percorso 3': {
  probabilita: 15,
  pokemon: [
    {id:41, min:10,max:13,rate:25}, {id:43, min:10,max:13,rate:20},
    {id:60, min:11,max:14,rate:20}, {id:98, min:11,max:14,rate:18},
    {id:183,min:10,max:13,rate:20}, {id:193,min:11,max:14,rate:15},
    {id:270,min:11,max:15,rate:15}, {id:278,min:11,max:15,rate:15},
    {id:54, min:12,max:16,rate:12}, {id:158,min:12,max:15,rate:3}, // Totodile raro
  ],
},
// Percorso 4 — salita verso l'Osservatorio Lv 12-19 (tema Elettro)
'incontri percorso 4': {
  probabilita: 15,
  pokemon: [
    {id:81, min:12,max:15,rate:25}, {id:100,min:13,max:16,rate:20},
    {id:84, min:12,max:16,rate:20}, {id:21, min:13,max:17,rate:20},
    {id:180,min:13,max:17,rate:18}, {id:239,min:12,max:16,rate:15},
    {id:170,min:13,max:17,rate:15}, {id:309,min:13,max:17,rate:15},
    {id:311,min:14,max:18,rate:10}, {id:312,min:14,max:18,rate:10},
    {id:155,min:14,max:17,rate:3}, // Cyndaquil raro
  ],
},
// Giardini di Villa Torlonia/Aldobrandini (Frascati) — zona FUOCO Lv 6-10
'incontri villa torlonia': {
  probabilita: 15,
  pokemon: [
    {id:37, min:6,max:9, rate:35}, {id:58, min:7,max:10,rate:30},
    {id:4,  min:6,max:9, rate:20}, {id:126,min:8,max:10,rate:15},
    {id:228,min:7,max:10,rate:18}, {id:255,min:7,max:10,rate:5}, // Torchic raro
  ],
},
```

**Regola d'oro** per ogni altra zona non elencata (Vigne di Marino, Campagna
Ariccia, Sentiero Innevato, Grotta del Vulcano, Monte Cavo...): livelli coerenti
con la palestra più vicina, mix Gen 1+2+3, almeno una specie rara (rate 3-8),
solo ID ≤ 386.

---

## 🟡 Mosse multi-turno ancora da fare (richiedono estensioni del motore)

Implementate in MOD 6B: Oltraggio/Petalobufera/Tempestafuoco (furia+confusione),
Esplosione/Autodistruzione, Protezione/Individuazione, oltre a carica/ricarica già
esistenti. **Restano da fare** (servono nuovi sotto-sistemi, da valutare):

- **Rotolamento/Sfida** (danno crescente x2 per 5 turni): serve passare un
  moltiplicatore a `calcolaDanno`.
- **Sbadiglio** (sonno ritardato di 1 turno), **Futuravendetta** (danno dopo 2
  turni), **Desiderio** (cura dopo 1 turno): serve una coda `effettiRitardati`
  controllata a fine turno.
- **Mosse di legatura** (Avvolgimento, Legatura, Rastrello, Eruzione, Sparaborre):
  danno a fine turno per 4-5 turni + blocco fuga.
- **Mosse meteo** (Danza Pioggia, Giornata, Grandine, Sabbionata) e
  **Schermo di Luce/Riflesso**: durata 5 turni — richiedono uno stato di campo.

Quando le farai, verifica gli ID/nomi su PokéAPI (`PokeAPI.getMossa()`): il motore
attuale identifica le mosse multi-turno per **nome inglese** (es. `outrage`,
`explosion`, `protect`), non per ID.
