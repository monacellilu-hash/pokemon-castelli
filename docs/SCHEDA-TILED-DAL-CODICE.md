# Scheda Tiled — cosa riconosce davvero il motore (`js/map.js`)

> Generato leggendo SOLO il codice sorgente (nessuna riga di codice nuova). Se una proprietà
> non è qui, il motore non la legge. Riferimento per disegnare gli oggetti nel layer `eventi`
> (e in parte `collisioni`) delle mappe Tiled (`.tmj`).

## 0. Concetti generali validi per TUTTI gli oggetti

- Gli oggetti vanno disegnati nel layer oggetti **`eventi`** (esatto, case-sensitive: `l.name === 'eventi'`). Fa eccezione la famiglia `trigger_taglio/surf/sub/forza/spaccaroccia/cascata` (e alias), che il codice raccoglie **anche** se disegnata nel layer `collisioni`.
- Il `type` Tiled viene letto così: `props.type` (property custom chiamata `type`) **oppure**, se assente, il campo nativo Tiled "Class/Type" dell'oggetto (`obj.type`). Va normalizzato da `normTipo()`:
  - lowercase, trim, spazi → underscore, poi lookup in `ALIAS_TIPO`.
  - Alias riconosciuti (tabella esatta):

    | Alias in Tiled | Diventa |
    |---|---|
    | `albero_taglio`, `albero`, `albero taglio` | `trigger_taglio` |
    | `acqua_surf`, `acqua surf` | `trigger_surf` |
    | `acqua_sub`, `acqua sub` | `trigger_sub` |
    | `roccia_spaccaroccia`, `sasso_spaccaroccia`, `masso_spaccaroccia` (anche con spazio) | `trigger_spaccaroccia` |
    | `roccia_forza`, `sasso_forza`, `masso_forza` | `trigger_forza` |
    | `cascata`, `cascata_cascata`, `acqua_cascata` | `trigger_cascata` |

- **`id`**: il motore usa `props.id` (property custom `id`) se presente, altrimenti `obj.name` (il campo "Name" dell'oggetto in Tiled). L'`id` Tiled interno (numerico, autogenerato) **non viene mai usato**. Quindi in Tiled va sempre valorizzato o il campo **Name** dell'oggetto, o una property custom `id` — è la chiave usata per `DATI_NPC`, `DATI_TRAINER`, `DATI_CARTELLI`, `DATI_INCONTRI`, `stato.allenatoriBattuti`, ecc.
- Ogni oggetto può essere un **rettangolo** (w/h > 0) o un **punto/singola cella** (Point object in Tiled, oppure un rettangolo di dimensione nulla trattato come singola tile).
- Coordinate: convertite in tile con `Math.floor(x/tilewidth)`; per i rettangoli si calcolano `tx0/ty0/tx1/ty1` (bounding box in tile, inclusivo).

---

## 1. `spawn` (punto di arrivo interno alla mappa)

**`type` esatto**: `spawn` (o refuso tollerato `spwan`).

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `id` (o Name) | consigliata | `''` | usata da `_trovaSpawn` per abbinare `spawn_id` del warp |

Note:
- Deve stare dentro i limiti della mappa: gli spawn fuori mappa vengono **scartati**.
- Se rettangolo, si usa il centro del rettangolo (arrotondato per difetto).

Esempio minimo:
```
type: spawn
id: default
```

---

## 2. Warp: `uscita` / `warp` (e `porta` per gli interni)

Due famiglie distinte, gestite diversamente:

### 2a. `uscita` / `warp` — warp "aperto sul mondo" (bordo mappa o casella calpestabile)

**`type` esatto**: `uscita` (vecchie mappe) o `warp` (mappe nuove) — **si comportano in modo identico**.

Due meccanismi di attivazione:
1. **Calpestando la casella/rettangolo**: sempre, entrando dentro `tx0..tx1 / ty0..ty1` (o sulla singola casella se è un point).
2. **Uscendo dal bordo della mappa**: se il player è adiacente al rettangolo del warp e si muove verso di esso (anche se appena fuori dai limiti mappa), scatta comunque.

| Property | Obbligatoria | Default | Note |
|---|---|---|---|
| `destinazione` | sì (altrimenti torna indietro nello stack, se presente) | — | stringa libera, risolta con `risolviMappa()` (§3) |
| `arrivo_x`, `arrivo_y` | no | usa spawn/centro mappa | tile di arrivo nella mappa destinazione (interi) |
| `spawn_id` (o `spawnId`) | no | — | forza lo spawn per id sulla mappa destinazione |
| `richiede` / `condizione` / `gate` (stringa) | no | nessun blocco | vedi §14 verificaCondizione |
| `messaggio_gate` | no | `🔒 Non puoi ancora entrare qui.` | testo toast se la condizione fallisce |

Note importanti:
- Se `spawnGuard` è attivo (player ancora sulla casella di spawn appena caricata) i warp **non scattano** finché non ti sposti — evita loop di rimpallo.
- Se la mappa corrente è un interno (`MAPPE[...].interno===true`) e c'è uno stack di ritorno, **qualsiasi** uscita/warp riporta al punto di ingresso salvato, ignorando `destinazione`.
- In modalità cluster (mappe `.world` fuse), un warp la cui `destinazione` risolve a una mappa nello **stesso cluster** viene "spento" (la cucitura è già disegnata affiancata, non fa nulla).
- Se il rettangolo warp è nel layer `collisioni` con `type` warp/uscita/entrata/porta, viene comunque reso calpestabile (non solido).

Esempio minimo (rettangolo sul bordo mappa):
```
type: warp
destinazione: frascati_centro
arrivo_x: 14
arrivo_y: 2
spawn_id: da_frascati_sud   (opzionale)
```

### 2b. `porta` — ingresso in un edificio/interno

**`type` esatto**: `porta`.

Attivazione **solo calpestando** la casella/rettangolo (nessun fallback "bordo mappa").

| Property | Obbligatoria | Default | Note |
|---|---|---|---|
| `destinazione` | sì | — | chiave cercata in `DATI_PORTE[dest]` (file `dati/porte.js`), NON nel registro `MAPPE` direttamente |
| `arrivo_x`, `arrivo_y` | no | `DATI_PORTE[dest].arrivo_x/y` se presenti, altrimenti 5/8 | usati solo se `DATI_PORTE[dest]` non specifica arrivo |
| `spawn_id`/`spawnId` | no | — | passato a `caricaMappa` |

Note:
- Se `DATI_PORTE[dest]` esiste e ha `mappa` valida nel registro `MAPPE`, carica quella mappa.
- Se `DATI_PORTE[dest]` non esiste o `mappa` è `null` (es. `casa_personaggio_giocatore`, `casa_rivale`), apre un **interno generico fallback** (`InteriorScene`, stanzetta procedurale) col nome `DATI_PORTE[dest].nome` o `dest`.
- Il punto di ritorno (un tile indietro dalla porta, direzione opposta a quella in cui si guardava) viene salvato in `mappaStack`.
- **`porta` non supporta `condizione`/`richiede`/`gate`** (solo `warp`/`uscita` lo fanno).
- Nel layer `collisioni`, un rettangolo `type: porta` è reso calpestabile.

Esempio minimo:
```
type: porta
destinazione: pokecenter
```
(mappa reale e coordinate arrivo sono in `dati/porte.js`; su Tiled serve solo se si vuole sovrascriverle).

---

## 3. Come si risolve `destinazione` → mappa (`risolviMappa`, per `warp`/`uscita`)

Ordine di priorità (`normTxt()` minuscolizza, toglie prefisso `pokemon-castelli`/`pokemon castelli`, tiene solo lettere/numeri):
1. **Match esatto** con una chiave del registro `MAPPE` (es. `frascati_centro`).
2. **Match esatto normalizzato** contro le chiavi del registro.
3. **Match esatto normalizzato** contro il nome file `.tmj` di ciascuna voce (es. `Percorso 1b` combacia col file `pokemon-castelli-Percorso 1b.tmj`).
4. **Match per inclusione** (ultima spiaggia, permissivo): la stringa normalizzata della destinazione contiene o è contenuta nel nome file normalizzato.

Se nulla combacia → toast `🚧 Zona non ancora disponibile`, nessuna transizione.

**Consiglio pratico**: scrivere direttamente la **chiave esatta del registro MAPPE** (es. `frascati_centro`, `percorso_2`, `lago_albano`) evita ogni ambiguità.

---

## 4. `_trovaSpawn` — come si sceglie la casella di arrivo

Ordine di priorità:
1. **`spawn_id` esplicito** sul warp/porta → cerca uno `spawn` con `id` che combacia esattamente (normalizzato), poi tollerante per inclusione reciproca.
2. Se non trovato, **match tramite mappa di provenienza**: cerca uno spawn il cui `id` contiene/è contenuto nel nome normalizzato della mappa sorgente o del suo file `.tmj`.
3. Se non trovato, cerca uno spawn con `id` uguale a **`default`** (case-insensitive).
4. Solo al primo caricamento mappa (senza warp), prende il **primo spawn** in elenco.
5. Altrimenti `null` → si ricade su `arrivo_x/arrivo_y` espliciti, poi `def.spawn` del registro `MAPPE`, poi un qualunque spawn della mappa, infine il **centro geometrico**.

**`soloMappa`** (cluster): restringe la ricerca alla mappa membro di ingresso, per non pescare per errore lo spawn "default" di un'altra mappa fusa nello stesso cluster.

**Clamp fuori mappa**: se lo spawn risultante cade fuori dai limiti, viene forzato al **centro esatto della mappa** (o del box della mappa membro, in cluster).

---

## 5. `npc`

**`type` esatto**: `npc`.

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `id` (o Name) | sì (per pescare da `DATI_NPC`) | `''` | chiave in `dati/npc.js` |
| `direzione` | no | `sud` | direzione iniziale (`nord/sud/est/ovest`, anche `up/down/left/right/n/s/e/w`) |
| `movimento` | no | `'fisso'` | `random` = si muove a caso ogni ~75 frame entro `raggio` dalla posizione iniziale; altro = fermo |
| `raggio` | no | `3` | distanza max (tile) dalla posizione iniziale per il movimento random |
| `condizione` / `richiede` | no | sempre visibile | vedi §14. Senza `gate`: appare **solo se vera**. Con `gate: true`: appare **finché** è falsa |
| `gate` | no | `false` | booleano — inverte il significato della condizione |
| `dialogo` | no | — | mostrato solo se l'id non è in `DATI_NPC` con un proprio `dialogo` (fallback) |
| `sprite` | no | sprite casuale stabile (o `DATI_NPC[id].sprite`) | usato solo se `DATI_NPC[id]` non ha `sprite` |

**Precedenza dati**: se `DATI_NPC[id]` esiste (`dati/npc.js`), i suoi `sprite`/`dialogo`/`azione` hanno **priorità** sulle property Tiled; `direzione`/`movimento`/`raggio`/`condizione`/`gate` si leggono **sempre e solo** da Tiled.

Interazione (`[A]`):
- Se `DATI_NPC[id].azione` è una funzione globale esistente **e** c'è anche `dialogo`: mostra prima il dialogo, poi chiama l'azione.
- Se ha solo `azione`: la chiama subito.
- Se ha solo `dialogo` (in `DATI_NPC` o `ev.props.dialogo` come fallback): lo mostra.
- Se nessuno dei due: nessun effetto.

Sprite: se non assegnato, ne prende uno casuale ma **deterministico** (stabile tra ricariche) da un pool filler, escluso `NPC 20` (riservato Team GdF). Se lo sprite assegnato manca come file e non sembra un personaggio di storia (regex leader/champion/rival/professore/boss/solitario/gdf/prof_), ripiega su un filler casuale; se sembra storia, resta invisibile con warning in console.

Esempio minimo:
```
type: npc
id: rocca_npc1
```

---

## 6. `trainer`

**`type` esatto**: `trainer`. Anche `trigger_rivale` viene normalizzato automaticamente a `trainer` (id default `rivale_tuscolo` se non specificato).

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `id` (o Name) | sì | `''` | chiave in `dati/trainer.js` (`DATI_TRAINER`) |
| `direzione` | no | `sud` | direzione iniziale (fissa lo sguardo/cono visivo) |
| `vista` | no | `DATI_TRAINER[id].vista`, poi nessuna vista | portata (caselle) del cono visivo in linea retta; 0/assente = niente linea visiva, si sfida solo con `[A]` |
| `pattuglia` (refuso `patuglia`) | no | `false` | booleano; se `true` **e** `direzione` è `"NS"`/`"SN"` (nord↔sud) o `"EO"`/`"OE"`/`"EW"`/`"WE"` (est↔ovest), il trainer alterna direzione ogni 120 frame |
| `raggio` | no | `3` | non usato per pattuglia/vista, solo per NPC `random` |
| `condizione` / `richiede` + `gate` | no | sempre presente | stessa semantica del §5 |
| `speciale` | no | `false` | booleano; il trainer **sparisce per sempre** dopo essere battuto; alla vittoria setta anche il flag `<id>_sconfitto` e rigenera gli NPC |
| `tappa` | no | `1` | solo se `DATI_TRAINER[id].rivale===true`: passata a `costruisciSquadraRivale(tappa)` per scalare la squadra del rivale |

Dati letti da `DATI_TRAINER[id]` (`dati/trainer.js`, NON da Tiled): `sprite`, `nome`, `squadra`, `dialogo_prima`, `dialogo_dopo`, `premio`, `palestraId` (assegna medaglia e alza level cap), `flagVittoria` (flag booleano settato in `stato.flags` alla vittoria), `rivale` (booleano). Lo sprite di fallback, se assente in `DATI_TRAINER`, può venire da `ev.props.sprite`.

Interazione: se già battuto, mostra `dialogo_dopo` (se esiste) e basta; altrimenti avvia la lotta con `dialogo_prima`. I trainer visti dal cono visivo camminano verso il player prima di iniziare la lotta (con "!" e animazione).

Esempio minimo:
```
type: trainer
id: trainer path 1_0
direzione: sud
vista: 4
```

---

## 7. `oggetto` / `object` — oggetto a terra

**`type` esatto**: `oggetto` (alias: `object`).

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `contenuto` | no | `'pozione'` | nome oggetto, normalizzato per combaciare con `OGGETTI` |
| `quantità` (o refuso ASCII `quantita`) | no | `1` | quantità aggiunta allo zaino |

Note:
- Raccolto **calpestando** la casella **oppure** con `[A]`.
- Chiave "già raccolto" = `mappaCorrente:tx,ty` (in `stato.oggettiRaccolti`): due oggetti con lo stesso `contenuto` ma posizioni diverse sono indipendenti.
- Se non riconosciuto in `OGGETTI`, il contenuto normalizzato viene comunque salvato come stringa grezza.

Esempio minimo:
```
type: oggetto
contenuto: pozione
quantità: 1
```

---

## 8. `cartello` / `cartel` — testo leggibile

**`type` esatto**: `cartello` (alias: `cartel`).

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `id` (o Name) | no | `''` | se presente, cerca `DATI_CARTELLI[id].testo` (priorità) |
| `testo` (o `dialogo`) | consigliata | `''` | testo mostrato con titolo fisso "Cartello" |

Collisione: i cartelli **rettangolari** (w>0,h>0) sono **solidi**; i cartelli **punto** restano calpestabili (compatibilità mappe vecchie).

Esempio minimo:
```
type: cartello
testo: Benvenuti a Frascati!
```

---

## 9. `pc` (Personal Computer nel Centro Pokémon)

**`type` esatto**: `pc`. Nessuna property letta. Interagendo mostra solo un toast: `📦 Apri il menu ☰ → Box per gestire i Pokémon`.

---

## 10. Trigger MN: `trigger_taglio` / `trigger_surf` / `trigger_sub` / `trigger_forza` / `trigger_spaccaroccia` / `trigger_cascata`

**`type` esatti**: `trigger_taglio`, `trigger_surf`, `trigger_sub`, `trigger_forza`, `trigger_spaccaroccia`, `trigger_cascata`. Alias parlanti in tabella §0.

`isMnTrigger` = vero solo per queste 6 (esclude `trigger_storia`, `trigger_leggendario`, `trigger_rivale`).

Nessuna property obbligatoria; interazione con `[A]`:
- Legge `stato.mn[<mn>]` (chiavi: `taglio`/`surf`/`sub`/`forza`/`spaccaroccia`/`cascata`).
- Senza la MN: toast `🔒 Serve la MN <Nome> per superare questo ostacolo.`
- Con la MN:
  - **`trigger_surf`**: non libera nulla in `collGrid` (l'acqua non è mai collisione), attiva `surfAttivo=true` e disattiva la bicicletta.
  - **Tutti gli altri**: ostacoli fisici, resi calpestabili **per sempre** sulla loro cella (e anche sulla cella davanti al player, per tollerare disallineamenti oggetto/tile).
- Toast `Hai usato <Nome>! ✨`.
- Nel layer `collisioni`, questi `type` sono **sempre solidi** finché non sbloccati a runtime (tranne `trigger_surf`, mai solido).

Esempio minimo (albero da tagliare):
```
type: albero_taglio
```

Esempio minimo (specchio d'acqua Surf):
```
type: acqua_surf
id: incontri percorso 2   (facoltativo, serve per gli incontri, vedi §13c)
```

---

## 11. `trigger_storia` — iscrizioni/testi con gate narrativo

**`type` esatto**: `trigger_storia`.

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `condizione` / `richiede` | no | usa `stato.flags.lingue_antiche` come default | se presente ha priorità, usa `verificaCondizione` |
| `messaggio_gate` | no | `📜 Iscrizione ancora indecifrabile… Torna più in là.` | mostrato se non leggibile |
| `testo` (o `dialogo`) | consigliata | `'...'` | testo mostrato quando leggibile |
| Name | no | `📜 Iscrizione` | titolo del dialogo |

Nota: senza `condizione`/`richiede` esplicita, la leggibilità dipende di default dal flag globale `stato.flags.lingue_antiche` (sbloccato a fine Lega) — NON sempre leggibile come `cartello`.

Esempio minimo:
```
type: trigger_storia
testo: "Qui giacciono i tre custodi..."
```

---

## 12. `pokemon leggendario` / `trigger_leggendario` → normalizzato a `leggendario`

**`type` di input riconosciuti**: `"pokemon leggendario"` (con spazio, minuscolo) oppure `trigger_leggendario` (rinominato internamente in `leggendario`). Entrambe le stringhe funzionano.

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `pokemon_id` | sì (o alternativa sotto) | — | id numerico PokéAPI, priorità massima |
| `sprite` / `pokemon` / `specie` | alternativa a `pokemon_id` | — | nome specie minuscolo, in `LEG_NOME_ID` (`articuno`, `zapdos`, `moltres`, `mewtwo`, `mew`, `raikou`, `entei`, `suicune`, `lugia`, `ho-oh`/`hooh`, `celebi`, `regirock`, `regice`, `registeel`, `latias`, `latios`, `kyogre`, `groudon`, `rayquaza`, `jirachi`, `deoxys`) |
| `livello` | no | `50` | livello di lotta |
| `condizione` / `richiede` | no | sempre presente | §14; se falsa, il leggendario non compare |
| `direzione` | no | `sud` | orientamento sprite fermo |

Note:
- Senza `pokemon_id`/nome valido, l'evento è **scartato del tutto**.
- Se già catturato o "scomparso", non compare.
- Sprite mostrato: quello PokéAPI (front), ~1.7 tile — nessuno sprite overworld dedicato da fornire.
- Solido e interagibile con `[A]`: avvia subito la lotta.

Esempio minimo:
```
type: pokemon leggendario
pokemon_id: 377
livello: 40
condizione: post_lega
```

### 12a. `addormentato` — variante "blocca la strada finché non lo svegli" (sess. 37)

Property aggiuntive sullo stesso oggetto `pokemon leggendario`/`leggendario`:

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `addormentato` | no | `false` | se `"true"`, l'incontro NON parte subito con `[A]` |
| `sveglia_con` | no | `flauto` | chiave in `OGGETTI_CHIAVE` richiesta (`stato.inventario.chiave[chiave]`) |

Finché `addormentato` è vero e il giocatore non ha l'oggetto in `sveglia_con`, `[A]` mostra solo un toast ("dorme profondamente...") — il Pokémon resta comunque **solido** (blocca il passaggio) come ogni leggendario. Con l'oggetto in inventario, `[A]` mostra un breve dialogo ("Usi il Flauto...") e poi parte la lotta normale (fuga impossibile, cattura permanente via `legCatturati` — usato per Snorlax, l'unico esemplare del gioco, ma riusabile per qualsiasi altro "blocco addormentato").

---

## 12b. `masso` / `pulsante` / `cancello_pulsante` — puzzle MN Forza a pulsante (sess. 37)

Tre `type` che lavorano insieme per un puzzle "spingi il masso sul pulsante per aprire un cancello altrove", stile classico Pokémon:

**`masso`** — masso spingibile, oggetto punto.

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `id` | consigliata | posizione | chiave di salvataggio (`stato.massiSpostati["<mappa>:<id>"]`); senza `id` esplicito ne genera uno dalla posizione, ma **non è stabile** se la mappa cambia |

Solido sempre. Se il giocatore **ha la MN Forza** e cammina contro il masso, questo si sposta di UNA casella nella stessa direzione (se la casella oltre è libera: niente collisione vera, niente altro masso, niente acqua). Senza MN Forza: si comporta come un ostacolo qualsiasi (toast "Serve la MN Forza"). Lo spostamento è **permanente** (salvato subito).

**`pulsante`** — pressione a terra, oggetto punto, nessuna property necessaria oltre `id`. Quando un masso arriva sulla sua stessa casella, si attiva per sempre (`stato.flags.pulsante_<id> = true`) e libera tutti i `cancello_pulsante` collegati.

**`cancello_pulsante`** — ostacolo solido (rettangolo o punto) che sparisce quando il pulsante collegato è stato premuto.

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `attivato_da` (o `collega`) | sì | — | `id` del `pulsante` che lo apre |

Esempio minimo (masso 3 caselle a nord del pulsante, cancello altrove):
```
type: masso
id: masso_1

type: pulsante
id: pulsante_1

type: cancello_pulsante
attivato_da: pulsante_1
```

---

## 13. `erba_alta` e `acqua` — due modalità coesistenti

### 13a. Modalità "rettangolo disegnato a mano" (sempre valida, ha priorità)

**`type` esatti**: `erba_alta` oppure `acqua` (esiste anche `incontri`, riconosciuto identicamente, ma senza trattamento speciale altrove).

| Property | Obbligatoria | Default | Uso |
|---|---|---|---|
| `id` (o Name) | sì per avere incontri | `''` | chiave in `DATI_INCONTRI[id]` (`dati/incontri.js`) |

Ogni passo dentro il rettangolo, se `DATI_INCONTRI[id]` esiste, tenta un incontro con probabilità `DATI_INCONTRI[id].probabilita` (default 15%), con 4 passi di tregua dopo ogni incontro. Pool specie/livelli/pesi (`rate`) da `DATI_INCONTRI[id].pokemon`.

Serve **ancora** disegnare il rettangolo quando:
- Si delimita una zona d'erba/incontri che NON coincide col tile grafico "cespuglio" riconosciuto automaticamente.
- Servono più zone con `id`/probabilità diverse sulla stessa mappa (il riconoscimento automatico usa **un solo `id`** per l'intera mappa, vedi 13b).
- `acqua` "manuale" indipendente da uno specchio Surf.

### 13b. Modalità "riconosciuto dal tile stesso" (`_buildErbaAltaTiles`)

Il motore scansiona tutti i layer tile e considera "erba alta" ogni cella il cui gid corrisponde al **tile locale indice 6** (7ª colonna, il cespuglio scuro) dei tileset il cui file sorgente termina in `outside.tsx` o `outside_pallet.tsx`. Nessuna property Tiled da impostare: basta dipingere quel tile specifico.

Regole di combinazione:
- Le celle già coperte da un rettangolo `erba_alta`/`acqua` disegnato a mano usano quel rettangolo (priorità alla modalità manuale).
- Per le celle non coperte da rettangoli ma col tile "cespuglio", il motore assegna l'**unico `id`** di zona `erba_alta` già presente sulla mappa (`_erbaAltaIdMappa`: prende il primo evento `erba_alta` della mappa e ne riusa l'id per tutte le celle auto-riconosciute).
- **Se la mappa non ha nessun rettangolo `erba_alta`**, l'id resta `null` e le celle auto-riconosciute non generano incontri.
- In pratica: basta **un solo rettangolo `erba_alta` con `id` valido** da qualche parte sulla mappa; tutte le altre celle con lo stesso tile erediteranno lo stesso `id`, senza dover disegnare un rettangolo su ognuna.

### 13c. Acqua Surf come zona incontri "gratuita"

Ogni cella coperta da un `trigger_surf` (§10) è automaticamente anche zona incontri: riusa il rettangolo `trigger_surf` stesso (col suo `id`) per `DATI_INCONTRI`, senza disegnare un `acqua` separato che ricalchi il perimetro dello specchio d'acqua.

Esempio minimo (zona erba manuale):
```
type: erba_alta
id: incontri percorso 2
```

---

## 14. `verificaCondizione` — sintassi di `condizione` / `richiede` / `gate`

Usato da: warp/uscita, npc/trainer (+ `gate` booleano), leggendario, `trigger_storia`.

`verificaCondizione(cond)` → `{ ok, messaggio }`. Confronto case-insensitive sulla stringa intera:

1. **Vuoto o `true`** → sempre ok.
2. **Contiene la sottostringa `"lega"`** (es. `lega`, `post_lega`, `legaCompletata`) → richiede `stato.flags.legaCompletata === true`; messaggio `🔒 Devi prima completare la Lega di Colonna.`
3. **Pattern medaglie**: regex `medaglie\s*>?=?\s*(\d+)` — riconosce `medaglie>=3`, `medaglie 3`, `medaglie3`. Confronta con `stato.medaglie.length`. Messaggio: `🔒 Servono almeno N Medaglie (ne hai M).`
4. **Pattern squadra in linguaggio naturale**: regex `(\d+|un|uno|una|due|tre|quattro|cinque|sei)\s+pok[eé]?mon\s+([a-zàèéìòù]+)` — es. `"tre pokemon lotta in squadra"`. Numero in cifre o parola italiana (`NUM_IT`); tipo tra le parole in `TIPO_IT_EN` (`normale, lotta, volante, veleno, terra, roccia, coleottero, spettro, acciaio, fuoco, acqua, erba, elettro, psico, ghiaccio, drago, buio, folletto`, più `normal`/`fighting`). Conta i Pokémon in `stato.squadra` il cui array `tipi` include il tipo PokéAPI corrispondente. Messaggio: `🔒 Servono N Pokémon di tipo <Tipo> in squadra (ne hai M).`
5. **Token-flag semplice**: stringa (senza "lega"/match squadra) composta solo da `[a-z0-9_]` (es. `post_lega_2`, `il_solitario_sconfitto`, `gdf_sconfitto`) → controlla `stato.flags[quellastringa]`. Se falso: `🔒 Non puoi ancora passare di qui.`
6. Se nessuna regola sopra scatta → **ok di default** (fail-open, nessun blocco).

Si possono **combinare** frasi tipo `"legaCompletata e tre pokemon lotta in squadra"`: il controllo lega blocca subito se la Lega non è completata; se è ok, il flusso continua e valuta anche il pattern squadra — quindi entrambe le condizioni vengono verificate in sequenza.

---

## 15. Altri `type` gestiti (riepilogo veloce)

| type | Dove gestito | Note |
|---|---|---|
| `entrata` | bordo mappa / collisioni | sinonimo di uscita/warp per bordo mappa e calpestabilità; NON scatta camminandoci sopra dentro la mappa, solo sul bordo |
| `deco` | collisioni | se rettangolo, reso **solido** (decorazione non attraversabile) |
| `warp_speciale` | collisioni | come `deco`: rettangolo solido (es. fontane), nessuna transizione mappa |
| `incontri` | zone incontri | equivalente a `erba_alta`/`acqua`, nessuna gestione differenziata altrove |

---

## 16. Tabella riepilogativa di tutti i `type` finali

| type finale | Alias in Tiled | Layer supportato | Interazione |
|---|---|---|---|
| `spawn` (`spwan`) | — | eventi | punto arrivo, non interagibile |
| `warp` / `uscita` | — | eventi | calpestabile + bordo mappa |
| `porta` | — | eventi | solo calpestabile |
| `npc` | — | eventi | `[A]` |
| `trainer` | `trigger_rivale` | eventi | `[A]` + vista |
| `oggetto` | `object` | eventi | `[A]` + calpestabile |
| `cartello` | `cartel` | eventi | `[A]` |
| `pc` | — | eventi | `[A]` |
| `trigger_taglio` | `albero_taglio`, `albero` | eventi o collisioni | `[A]` (MN) |
| `trigger_surf` | `acqua_surf` | eventi o collisioni | `[A]` (MN) |
| `trigger_sub` | `acqua_sub` | eventi o collisioni | `[A]` (MN) |
| `trigger_forza` | `roccia_forza`, `sasso_forza`, `masso_forza` | eventi o collisioni | `[A]` (MN) |
| `trigger_spaccaroccia` | `roccia_spaccaroccia`, `sasso_spaccaroccia`, `masso_spaccaroccia` | eventi o collisioni | `[A]` (MN) |
| `trigger_cascata` | `cascata`, `cascata_cascata`, `acqua_cascata` | eventi o collisioni | `[A]` (MN) |
| `trigger_storia` | — | eventi | `[A]` |
| `leggendario` | `pokemon leggendario`, `trigger_leggendario` | eventi | `[A]` |
| `erba_alta` | — | eventi | passiva (calpestando) |
| `acqua` | — | eventi | passiva (calpestando) |
| `incontri` | — | eventi | passiva (calpestando) |
| `masso` | — | eventi | solido, spingibile camminandoci contro con MN Forza |
| `pulsante` | — | eventi | passiva (attivato da un masso che ci arriva sopra) |
| `cancello_pulsante` | — | eventi o collisioni | solido finché il pulsante collegato non è attivato |
| `entrata` | — | eventi | bordo mappa/calpestabile (no clic dentro mappa) |
| `deco` | — | eventi | solo solidità |
| `warp_speciale` | — | eventi | solo solidità |
