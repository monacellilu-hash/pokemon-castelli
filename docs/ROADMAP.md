# ROADMAP — Pokémon Castelli Romani

> Aggiornato alla fine di ogni sessione. Leggi sempre dall'alto prima di riprendere.

---

## Sessione 12 settembre 2026 — Rifugio CoTrAL di Rocca di Papa completo

**Cutscene Baso vs Marcello** (specifica dettagliata di Luca): trigger su rettangolo Tiled
(`trigger_baso_cotral`), dialogo esteso Baso↔Marcello (si guardano negli occhi, non più entrambi
rivolti a sud come piazzati in Tiled), "!" e riconoscimento del giocatore da parte di Baso (che poi
torna a guardare Marcello), 1ª battaglia in doppia (Baso alleato + giocatore VS 2 grunt "forte"),
narrativa di transizione, 2ª battaglia in doppia finale contro Marcello diviso in due "metà" da 3
Pokémon (stesso allenatore ripetuto due volte, come Levantino/Giovanni alla Grotta del Vulcano).
Marcello si arrende, si avvicina al giocatore, monologo esteso e consegna la 1ª parte della password
del Rifugio GdF di Marino (`stato.flags.baso_tornato`, riusa `_controllaPasswordRifugio`) — poi
schermo nero e sparizione definitiva di Marcello/8 grunt (i 2 "forte" + 3 decorativi + i 6 originali
già presenti nella stanza, tutti gated sullo stesso flag `cotral_rocca_boss_sconfitto`). Epilogo
separato: con la stanza vuota, parlare con Baso dà solo un promemoria ("libera Gianluca"); parlare con
**Gianluca** fa avvicinare Baso al giocatore (stesso trattamento dello scienziato alla Grotta del
Vulcano, rispetta le collisioni), dialogo di ringraziamento + invito in palestra, Gianluca ringrazia a
sua volta, poi schermo nero e sparizione di entrambi (`stato.flags.cotral_rocca_finale`, che è anche
il momento in cui `baso_tornato` scatta davvero — **non** più alla sola sconfitta dei 2 grunt di
`collegamento_Cotral`, era prematuro, tolto).

**Nuova funzionalità nel motore di battaglia**: `Battle.avviaDoppia()` esteso con `opzioni.alleato =
{nome, squadra}` — prima volta che un NPC scende in campo con una squadra propria (non i tuoi 2
Pokémon come nella doppia normale). L'IA dello slot alleato riusa `sceglieMossaCasuale` già esistente,
sostituzioni automatiche dal banco dell'alleato via `_doppiaGestisciEventualiKO`.

**Bug veri trovati e corretti**:
- **Gate/condizione scritti nel posto sbagliato**: messi in `dati/npc.js` invece che sulle proprietà
  dell'oggetto Tiled — `_creaNpcStato()` legge SOLO `ev.props`, mai i data-file. Risultato: "schermo
  nero ma non sparisce nessuno" (segnalato da Luca). Spostati su `Rifugio_cotral_rocca.tmj`/`.tmx` (12
  oggetti: Marcello, gli 8 grunt, Baso, Gianluca) e rimossi da `dati/npc.js`.
- **EXP spropositata**: un Pokémon di livello 42 dava ~15.000 EXP contro un riferimento reale di ~5.500
  per un livello 75 con Lucky Egg (segnalato da Luca con confronto diretto). Causa: un moltiplicatore
  "+50% per medaglia" (`js/battle.js`, `nemicoSconfitto`/`_doppiaExpKO`) che con 8 medaglie diventava
  ×5, sommato a un divisore già gonfiato (/5 invece di /7). Rimosso il moltiplicatore, riportato il
  divisore a /7 (formula Gen 1-4 reale).
- **Mosse ad area `all-other-pokemon`** (Terremoti, Surf, Scarica, Autodistruzione…) trattate come
  `all-opponents` (mai il proprio compagno) — nei giochi veri colpiscono chiunque altro in campo,
  compagno incluso. Distinte le due categorie in `_doppiaSceltaMossa`/`_doppiaBersagliIA`
  (`js/battle.js`), nuovo helper `_bersagliTuttiTranneMe(ist)`.
- **Player "cammina sul posto" durante le cutscene**: se il trigger scattava a metà di un passo,
  l'ultima animazione "walk" restava in loop perché `bloccaMovimento()` blocca l'input ma non
  l'animazione già in corso — aggiunto un reset esplicito a `idle` a inizio cutscene (come fanno già
  `_trainerSpotta`/`_prossimitaSpotta`).

**Rifinizioni minori**: Raikou/Entei piazzati fisicamente accanto a Suicune al Lago di Nemi (`Lago di
Nemi.tmj`/`.tmx`, oggetti `leggendario_ambientale` con `pokemon_id` 243/244) — prima esistevano SOLO
nel sistema di roaming dopo la fuga di Suicune, mai come NPC veri sulla mappa; `_checkSuicuneTrigger`/
`_suicuneScappaCutscene` generalizzati per far scappare tutti e tre insieme avvicinandosi a QUALSIASI
dei tre (prima solo Suicune faceva scattare la fuga). Vitamine (Proteina/Ferro/Calcio/Zinco/
Carburante/Proteine PS) e Fossili (Elice/Cupola/Radice/Artiglio/Ambra Antica) aggiunti a `OGGETTI`
(`js/data.js`) — oggetti veri con icona/prezzo/descrizione, ma senza ancora un effetto meccanico
(niente sistema EV, niente laboratorio di rianimazione: entrambi già "ok così, nessuna urgenza" per
Luca). Warp-stub `warp_lab_fossili` aggiunto a `Genzano.tmj`/`.tmx` verso una mappa
`laboratorio_fossili_genzano` non ancora disegnata (mostra "zona non ancora disponibile" finché non
esiste, stesso schema già rodato con `nascondiglio_cotral` prima che Luca disegnasse quella mappa).

**Reso ufficiale**: il dungeon-con-boss che mancava al nascondiglio CoTrAL ai piedi di Monte Cavo (voce
storica del TODO, "Abate" provvisorio) **è** questo Rifugio CoTrAL di Rocca di Papa/Marcello — vedi
`docs/TODO.md` aggiornato. Confermato anche che l'interno dell'Abbazia di San Nilo esiste già come
mappa (disegnata da Luca, non ancora segnata nei documenti): resta da cablare Ginevra/cutscene/gate
password, nessuna specifica ancora data.

---

## Sessione 8 settembre 2026 — Grotta del Vulcano, fix vari, arco GdF riscritto

**Grotta del Vulcano** (nuovo dungeon, 3 piani): costruita per intero — 22 grunt, Groudon sempre
visibile ma sfidabile solo con la Pietra Rubino (schema "addormentato"/"sveglia_con", come Snorlax),
incontro col boss a due stadi (Levantino→Giovanni) con trigger di prossimità dedicato (nuovo tipo
Tiled `trigger_lotta_prossimita`, generico e riusabile), cammino verso il giocatore da qualunque lato,
cutscene di fuga con schermo nero. Diversi giri di correzione durante la sessione (sprite corretti,
timing della sparizione dei GdF spostato dopo "filiamo", Giovanni ora entra fisicamente in scena come
NPC vero piazzato su Tiled invece che spawnato al volo).

**Bug veri trovati e corretti**:
- Animazione di camminata degli NPC: `_passoTrainer` rimetteva il frame fermo a ogni singolo passo,
  impedendo al ciclo a 4 frame di completarsi ("cammina sempre con lo stesso braccio avanti"). Ora il
  reset avviene solo a fine dell'intera camminata.
- `_rigeneraNpc()` non era awaitata: due chiamate ravvicinate lasciavano sprite orfani mai distrutti
  (bug della "copia dello scienziato che rimane nella stanza").
- Sprite GdF: l'alias `GDF_GRUNT_SPRITE` puntava a "NPC 20", che non ha un vero ciclo di camminata —
  cambiato in "NPC 01" per TUTTI i GdF del gioco, in ogni mappa (un solo punto di modifica).
- Animazioni mosse (`animazioni-essentials.js`): l'opacità del proprio sprite veniva impostata da un
  cel e mai resettata se i frame successivi non lo toccavano più — il Pokémon spariva a metà mossa e
  ricompariva solo alla fine. Tolto il controllo opacità sullo sprite reale (resta solo il transform).
- Cattura: la Ball atterrava nella posizione misurata a INIZIO lancio (stantia 500ms dopo); un
  tentativo fallito cancellava l'offset di posizionamento per-specie del nemico invece di ripristinarlo.
- MN Forza: il permesso d'uso (spingere i massi) non controllava di aver battuto Monte Porzio come
  richiesto dalla tabella delle MN — bastava aver parlato con l'NPC di Rocca di Papa.
- Zone incontri: verificate con uno script tutte le 40 tabelle `DATI_INCONTRI` contro gli oggetti
  Tiled reali — 31 presenti, 4 ancora prive del rettangolo su Tiled (ariccia, lago albano superficie,
  percorso 2 surf, via dei laghi — tabelle già pronte, manca solo il disegno).
- Pensione Pokémon: verificata, funziona ed è collegata al loop di gioco reale (non serve una
  settimana di calendario: è a passi, 150 per l'uovo + 80 per la schiusa).

**Arco narrativo Team GdF riscritto** (richiesta di Luca, sequenza dettagliata da lui — vedi
`docs/STORIA_COMPLETA.md` per la versione completa): il Comandante GdF ora ha un nome, **Giovanni**
(risolve l'ambiguità "Crasso"), incontrato **due volte**: primo al Rifugio di Marino (password 3 parti:
Lab CoTrAL/Monte Cavo, **Michela** al Museo di Nemi, **Ginevra** all'Abbazia) → Pietra Zaffiro/Kyogre;
poi rivincita alla Grotta del Vulcano → Pietra Rubino/Groudon. **Fernando** (Castel Gandolfo) rivela
solo il documento, non una parte della password. Implementato: rename Giovanni/Fernando/Michela in
`dati/trainer.js`, Pietra Zaffiro in `js/data.js`, cutscene dedicata e monologo Grotta del Vulcano
allungato in `dati/cutscene.js`, gate dei piani interni della Grotta dietro `pietra_zaffiro_ottenuta`
(prima visita: solo grunt esterni battibili).

### Bloccato in attesa di Luca
Interno dell'Abbazia di San Nilo (Ginevra + gate finale a 3 parti sul Rifugio di Marino), cutscene
"GdF bloccano la strada Ariccia→Genzano post-Sagra" (serve la posizione del trigger), marcatore Kyogre
sul Lago di Albano. **Team CoTrAL segnalato da Luca come "da rifare"**, nessun dettaglio raccolto —
sessione dedicata quando è pronto a parlarne.

### Prossimo passo
Playtest generale di quanto fatto oggi (mai testato dal vivo in questa sessione, solo `node --check`
e validazione JSON/XML — browser di automazione volutamente non usato su richiesta di Luca). Poi
proseguire l'arco GdF quando l'Abbazia esiste.

---

## Sessione 5 settembre 2026 (continua) — Cablaggio Lega Pokémon di Colonna (piani 1-5)

Richiesta di Luca: cablare le mappe della Lega dal 1° al 5° piano, con dentro il Superquattro, i warp
per passare da un piano all'altro, e collegare il 1° piano alla hall d'ingresso (a sua volta collegata
all'uscita finale del 5° piano di Via Vittoria).

- Trovato che `SUPERQUATTRO`/`REMO_LEGA` (`js/data.js`) e `estraiTeamSuperquattro`/`estraiTeamRemo`
  (`js/app.js`) erano **già scritti per intero e fedeli a CLAUDE.md** (pool da 10 specie a testa, 5
  estratte a caso + il core con BST più alto sempre per ultimo) — semplicemente mai collegati a una
  mappa Tiled reale (il vecchio punto d'ingresso `interagisciLega()` usa ancora lat/lon del motore
  Leaflet pre-F14, morto da quando gira tutto su Tiled).
- `Lega_pokemon_1f/_2f/_3f/_4f/_5f.tmj` + la hall (`Lega_pokemon.tmj`) non avevano NESSUN oggetto
  (zero spawn, zero warp, zero allenatori) nonostante i file esistessero. Aggiunto un layer "eventi" a
  tutti e sei: spawn di arrivo/ritorno per ogni scala, scale su/giù fra un piano e il successivo,
  un membro del Superquattro per piano 1f-4f + il Campione Remo al 5f (nuove voci `sq_captain`/
  `sq_pres`/`sq_dema`/`sq_marcuois`/`campione_remo` in `dati/trainer.js`, collegate al pool vero
  tramite un piccolo aggancio nuovo in `_avviaLottaTrainer`, `js/map.js`).
- Completato anche l'oggetto "uscita finale" già presente ma vuoto su `via vittoria_5f.tmj`: ora è un
  warp reale verso la hall della Lega.
- Rigenerati i `.tmx` corrispondenti (`strumenti/tmj_a_tmx.py`) così i nuovi oggetti sono visibili e
  spostabili in Tiled — tranne la hall, che non ha mai avuto un `.tmx` proprio (solo `.tmj`), gap
  preesistente non introdotto ora.
- **Tutte le coordinate sono placeholder stimati a occhio** (stesso trattamento già dato ai 12
  allenatori di Via Vittoria in una sessione precedente): Luca li riposiziona in Tiled.
- ⚠️ **MAI TESTATO DAL VIVO**: solo validazione incrociata dei dati (ogni warp punta a uno spawn_id
  che esiste davvero sulla mappa di destinazione) e `node --check`/parsing JSON dei `.tmj` — la
  sessione è finita con l'estensione Chrome disconnessa. Verificare alla prossima occasione utile:
  percorrenza 1f→5f, le 5 lotte (pool casuale ogni volta), `stato.flags.legaCompletata` alla vittoria
  sul Campione.

**Correzione della stessa sessione, subito dopo**: Luca ha chiarito un punto fondamentale che il primo
giro non rispettava — **dentro la Lega si va SOLO avanti**, nessuna scala per tornare indietro da un
piano all'altro. Tolte le scale "giù" (e gli spawn "_dopo_su" ormai orfani) da tutti i piani 1f-5f:
ora ognuno ha solo lo spawn d'arrivo, la scala verso il piano successivo, e il suo membro del
Superquattro/Campione. **Se perdi contro un membro del Superquattro o il Campione**, non resti fermo
dov'eri (comportamento normale per qualunque altro allenatore nel gioco): un aggancio nuovo in
`_avviaLottaTrainer` ti teletrasporta davanti all'ingresso della Lega (`spawn_lega_ingresso` nella
hall) quando `esito === 'sconfitta'` e l'allenatore è `superquattro`/`campioneLega`. Aggiunto anche
il collegamento di ritorno **hall → Via Vittoria 5° piano** (richiesto esplicitamente): nuovo warp
nella hall verso `via_vittoria_5f`, con un nuovo spawn `spawn_uscita_finale` piazzato accanto
all'oggetto "uscita finale" già esistente lì.

### Prossimo passo
Verificare dal vivo il cablaggio Lega (percorso solo-andata, teletrasporto alla sconfitta, i due
collegamenti con Via Vittoria), poi Luca riposiziona warp/spawn/allenatori in Tiled. Poi: le
cutscene della Lega (annunciato da Luca come prossimo lavoro, non ancora iniziato).

---

## Sessione 5 settembre 2026 (continua) — 3 correzioni segnalate da Luca

**1. MN Cascata resa bidirezionale.** Era hardcoded per muovere SEMPRE verso nord (pensata solo per
risalire una cascata vera), ma Luca la usa anche per attraversamenti generici dentro un riquadro
(es. nel tunnel roccioso) — lì il movimento a senso unico verso nord era palesemente sbagliato.
`_risaliCascata` rinominata `_attraversaCascata` (`js/map.js`): ora la direzione è quella verso cui
il giocatore è rivolto quando la usa (facciata al momento dell'interazione), non più fissa — sale,
scende, o va a sinistra/destra a seconda di come ci si è messi davanti al riquadro.

**2. Osservatorio (Monte Porzio) irraggiungibile — confermato bug, non un problema di visuale.**
`Osservatorio.tmj` aveva già un warp DI RITORNO verso Monte Porzio (`destinazione: monteporzio,
spawn_id: da_osservatorio`) ma **Monte Porzio non aveva nessun warp verso l'Osservatorio**, e nemmeno
lo spawn `da_osservatorio` che quel warp di ritorno si aspettava — un collegamento a metà, mai
completabile a piedi in nessuna delle due direzioni per davvero. Aggiunti in `monteporzio.tmj`: un
warp verso `osservatorio` (spawn `da_monteporzio`, che lì esiste già) e lo spawn `da_osservatorio`
mancante, piazzati oltre il gate dello scienziato (`medaglie>=4`) già presente — posizione stimata a
occhio, da aggiustare in Tiled.

**3. Volo bloccato dentro edifici/grotte/dungeon.** Prima **non esisteva nessun controllo**: si
poteva volare da qualunque posto, incluso dentro un Centro Pokémon o un tunnel. Nuova
`GameMap.mappaConsenteVolo()` (`js/map.js`): torna falso se la mappa corrente è `interno:true`
(centri, market, palestre, case, Via Vittoria, Lega — già tutti flaggati così) oppure una grotta/
dungeon (`tema: 'cave'`/`'icecave'` — tunnel roccioso, Monte Cavo, antri Regi, tuscolo profondo,
già flaggati anche questi). Aggiunto `interno:true` anche a Zona Safari e a tutta la Lega (hall +
1f-5f), che non avevano ancora nessuno dei due flag pur dovendo bloccare Volo per esplicita richiesta
di Luca — verificato che questo flag non ha altri effetti collaterali (non tocca il velo giorno/
notte, che è un elenco a parte; tocca solo il comportamento di un warp senza destinazione esplicita,
e tutti i warp coinvolti qui ne hanno già una). Il bottone ✈️ ora si nasconde da solo nei posti
giusti (già richiamato ad ogni `aggiornaHUD()`, che gira ad ogni passo/cambio mappa).

⚠️ **Nessuna delle tre correzioni è stata verificata dal vivo** (estensione Chrome ancora
disconnessa) — solo lettura di codice e validazione dati. Priorità per la prossima sessione.

---

## Sessione 5 settembre 2026 (continua) — Fiori Genzano (analisi) + pulsante Interagisci

**Fiori di Genzano**: identificato il tile più ripetuto nel layer decorativo (GID 957, tileset
`outside.tsx`, 131 volte) — è un cespuglio di fiori rossi/rosa, verosimile candidato per le "cornici"
rettangolari segnalate da Luca. Controllato che NON abbia fotogrammi alternativi adiacenti nel
tileset (a differenza di Sea/Waterfall, che li hanno già): **serve un tile animato fornito da Luca**
per poterlo agganciare allo stesso meccanismo già usato per l'acqua (`_registraAcquaAnimata`/
`_registraCascataAnimata`). Nessuna modifica di codice qui, solo l'analisi.

**Pulsante [A] Interagisci**: era un overlay che compariva/spariva come un popup, con etichetta col
nome di chi hai vicino e un bagliore pulsante — richiesta esplicita di Luca di toglierlo ("non
serve"). Segnalato che è anche l'UNICO modo per interagire da telefono/touch (niente tasto [A]
fisico lì): tolto del tutto avrebbe rotto l'interazione su mobile. Deciso con Luca: resta un pulsante
fisso sullo schermo, discreto, senza animazione né etichetta — clicca a vuoto se non c'è nulla vicino
(`js/map.js` — rimossi `#overlay-interagisci`/`#interagisci-etichetta`, `#btn-interagisci` ora è
autonomo in `index.html`/`style.css`, niente più `pulseInteract`).

---

## Sessione 5 settembre 2026 — Porting fedele da Essentials (movimento, animazioni mosse, menu Start)

Luca ha segnalato che il gioco "non sembra un gioco Pokémon" nonostante il lavoro fatto: troppe
piccole differenze rispetto a Essentials reale, sommate insieme. Approccio deciso insieme: invece
di ricreare a intuito, **leggere il codice Ruby vero** (già estratto in `strumenti/scripts_estratti/`,
403 script, più i `.rxdata` originali in `Essentials FRLG/`) sistema per sistema, e portarlo 1:1 nel
nostro motore JS/Phaser — mappe, storia ed encounter restano nostri, cambia solo la fedeltà dei
sistemi. Un sistema alla volta, con conferma di Luca prima di ogni fase.

**1. Movimento overworld** (`js/map.js`) — confrontato con `0044_Game_Character.rb`/`0046_Game_Player.rb`:
- Velocità sbagliate sia nei valori che nei rapporti (camminata 125ms invece di 250, corsa 75 invece
  di 125, bici 50 invece di 100 — una sessione precedente le aveva tarate a sensazione). Corrette ai
  valori reali.
- Mancava del tutto il "giro prima di camminare": il primo tap su una direzione ora gira solo il
  personaggio, cammina solo tenendo premuto ≥75ms o se già in movimento (cambio direzione al volo).
  Unificato anche il D-pad touch (mobile), che prima ignorava questa logica.
- Verificato dal vivo nel browser: confermato da Luca ("finalmente il movimento va bene").

**2. Animazioni mosse in battaglia** (`js/animazioni-essentials.js`) — confrontato con
`0228_BattleAnimationPlayer.rb`: le particelle con `FOCUS=1/2` (bersaglio/attaccante) non seguivano
la posizione reale degli sprite a schermo, usavano una proiezione piatta dal canvas 512×384 originale.
Corretto: ora si calcola lo scarto reale fra dove Essentials si aspetterebbe il Pokémon (ancore
`FOCUSUSER_X/Y`=128,224 e `FOCUSTARGET_X/Y`=384,96) e dove si trova davvero nel nostro layout —
misurato dal vivo uno scarto di oltre 160px prima della correzione. Gap noto e non risolto: `FOCUS=3`
(particella su una linea utente-bersaglio, mosse a raggio tipo Iperraggio) richiederebbe una
trasformazione a linea non ancora implementata.

**3. Menu Start** (`PauseMenuScene` in `js/map.js`) — confrontato con `0293_UI_PauseMenu.rb`: era
uno schermo intero opaco con titolo "MENU" ed emoji, la mappa spariva del tutto. In Essentials reale
è una piccola finestra-elenco ancorata in alto a destra con la mappa viva visibile dietro. Rifatto:
finestra docked con sfondo a gradiente e bordo, niente emoji, voce "Scheda Allenatore" mostra il nome
vero del giocatore (Rosso/Rossa) come nell'originale. "Recap" (passi/medaglie/MN/stato dei team — non
esiste in Essentials) non è più una voce del menu Start: è diventata la seconda pagina della Scheda
Allenatore (freccia destra per andarci, B per tornare indietro). Party/Zaino/Box/Market/Scheda
restano fedeli come prima (usano già gli asset reali di Essentials, verificato leggendo il loro
codice) — solo il menu Start stesso era rimasto un pannello generico mai portato allo stesso livello.
Verificato dal vivo: navigazione, apertura Scheda, cambio pagina Riepilogo↔Scheda tutto testato.

**Deciso con Luca, non ancora fatto**: Pokédex e Opzioni mancano come SISTEMI reali (non solo come
voce di menu) — aggiunti alla lista di lavoro futura, da trattare come fasi a sé quando si arriva lì
(non solo restyling: vanno costruiti). Pokégear/Mappa Regione resta fuori scope (sostituito dalla
mappa Tiled di F14, non un porting 1:1 sensato). "Esci dal gioco" dell'originale omesso di proposito
(non ha senso in un gioco da browser).

**4. Posizione dei Pokémon in battaglia** (`style.css`) — confrontato con `Battle::Scene.
pbBattlerPosition`/le costanti `PLAYER_BASE_Y`/`FOE_BASE_Y` in `0187_Battle_Scene.rb`: l'orizzontale
(nemico 75%, giocatore 25% della larghezza) era già corretto da prima; la verticale del nemico era
sbagliata di brutto — `top: 4%` (quasi incollato al bordo superiore) invece del ~46% reale (il
Pokémon avversario sta grosso modo a metà schermo). Portato letteralmente al 46% lo sprite finiva
addosso al pannello dati di Lapras sotto (il nostro databox occupa più spazio verticale
dell'originale): tarato dal vivo al valore più alto possibile senza sovrapposizione, **22%** — un
miglioramento netto (era 4%) anche se non il numero esatto, per un vincolo del nostro layout attuale
segnalato nel commento CSS, non una rinuncia alla fedeltà.

**5. Battleback (sfondi di battaglia)** — verificato che sono GIÀ fedeli: asset reali per terreno
(`sprites/Battlebacks/<tema>_bg.png` + piattaforme `_base0`/`_base1` alle dimensioni vere 256×64/
256×128), tinta acqua corretta via `multiply`. Nessuna modifica necessaria qui.

**6. Formula del danno** (`js/battle.js`, contro `0174_Move_UsageCalculations.rb`):
- **Colpi critici: mancavano del tutto.** C'era già un campo dati inutilizzato
  (`effetto:"colpo_critico_alto"` su mosse come Taglio/Rasoiovento in `dati/mosse.js`) ma nessun
  codice lo leggeva. Aggiunti con le regole classiche pre-Gen 6 (quelle di Rosso Fuoco/Smeraldo — il
  progetto è dichiaratamente Gen 1-2-3, non le regole Gen 8 di default nel pacchetto Essentials
  estratto): 1/16 di base, 1/8 per le mosse ad alta probabilità, danno ×2. Messaggio "Un colpo
  critico!" in battaglia.
- **Arrotondamento**: il termine di livello ora si arrotonda per difetto PRIMA di moltiplicarlo
  (perdeva un pizzico di precisione ai livelli non multipli di 5); tutti i moltiplicatori (STAB,
  oggetto, meteo, critico, efficacia, variazione casuale) ora si combinano in un solo fattore
  arrotondato una volta sola alla fine, come fa davvero il motore — prima ogni moltiplicatore faceva
  il suo `Math.floor()` separato, perdendo danno ad ogni passaggio invece che una volta sola.

**7. Ordine dei turni** (contro `0150_Battle_ActionAttacksPriority.rb`): a parità di priorità E di
velocità esatta, il motore vero tira un ordine casuale — il nostro faceva vincere SEMPRE il
giocatore (`>=` invece di un vero 50/50). Il motore della lotta doppia aveva già la regola giusta
("pareggi casuali"), solo quello 1v1 aveva il bias. Corretto per coerenza fra i due.

**8. Cattura** (contro `0226_Battle_CatchAndStoreMixin.rb#pbCaptureCalc`): esponente della formula
delle scosse sbagliato (0.25 invece di 0.1875 — non è legato alla generazione, è proprio il valore
giusto per questo motore) e mancava del tutto il bonus per stato alterato (addormentato/congelato
×2.5, qualunque altro stato ×1.5 sulla probabilità), un meccanismo molto noto ai giocatori esperti.
Entrambi aggiunti.

**9. EXP e animazione Poké Ball** — controllati contro `0149_Battle_ExpAndMoveLearning.rb` e la
sequenza di lancio/cattura reale: **nessuna modifica necessaria**. L'EXP usa già di proposito la
formula "vecchia" (senza il fattore di scala per differenza di livello introdotto in Gen 7+, che
sarebbe fuori tema per un progetto dichiaratamente Gen 1-2-3) con un moltiplicatore progressivo per
medaglie deciso a parte (MOD 4, sessione precedente) — non un bug, una scelta di design già
documentata. L'animazione di lancio/assorbimento/scosse/esito era già completa e fedele nello
spirito, verificata dal vivo (lancio, fallimento con "il Pokémon si è liberato!", nessun errore).

**10. Finestre Sì/No e liste di scelta** (`mostraScelta`/`mostraSceltaLista` in `js/app.js`, usate
anche dal Riapprendi Mosse e dalle risfide allenatori) — stesso problema del vecchio menu Start:
modali "popup web" teal/rosa, niente a che vedere con Essentials. Riscritte come finestre di sistema
(gradiente blu, font pixel, cursore ▶, navigabili a frecce) contro `pbShowCommands` in
`0187_Battle_Scene.rb`. 17 punti di chiamata coinvolti. Bug scoperto testando dal vivo: senza
`stopPropagation()` sui tasti, Invio/frecce arrivavano anche al controllo della mappa sotto,
aprendo il menu Start nello stesso istante — corretto.

**11. Pokédex e Opzioni — costruiti come sistemi nuovi** (`PokedexScene`/`PokedexDetailScene`/
`OpzioniScene` in `js/map.js`, contro `0293_UI_PauseMenu.rb`/`0294_UI_Pokedex_Menu.rb`):
- Pokédex: lista paginata delle 386 specie, "??????" per quelle mai viste. Il "visto"/"catturato" si
  registra da solo (`segnaPokedex` in app.js) ogni volta che `creaIstanza`/cattura/evoluzione/
  starter/uovo creano un Pokémon — zero chiamate PokéAPI in più solo per la lista. Scheda dettaglio
  con sprite/altezza/peso/categoria/descrizione (nuova `PokeAPI.getPokedexEntry`).
- Opzioni: Velocità testo (lenta/normale/veloce, applicata al ritmo dei messaggi di battaglia) e
  Animazioni battaglia on/off (se disattivate, solo uno scuotimento schermo invece dell'animazione
  vera — utile per il grinding, come nei giochi originali).
- **Volume musica/effetti NON incluso**: il gioco non ha alcun sistema audio (verificato, zero
  riproduzione suoni in tutto il codice) — un cursore volume senza niente da controllare sarebbe un
  finto controllo. Segnalato invece di costruirlo: se si vuole, è un progetto a sé (aggiungere audio
  da zero), non una voce di Opzioni.
- ⚠️ **MAI TESTATO DAL VIVO**: l'estensione Chrome si è disconnessa a fine sessione. Solo verifica
  sintattica (`node --check`). Da provare alla prossima occasione utile prima di considerarlo fatto
  per davvero: apertura Pokédex/scheda/Opzioni dal menu Start, aggiornamento della lista dopo una
  battaglia/cattura, effetto reale delle due opzioni.

### Prossimo passo
**Verificare dal vivo il punto 11** (Pokédex/Opzioni) alla prossima sessione — priorità perché non è
mai stato provato a schermo. Poi, se Luca lo vorrà, un sistema audio come fase a sé per dare un senso
a un controllo volume nelle Opzioni.

---

## Sessione 3 settembre 2026 — Lotta in doppio (Fase 2: motore 2v2 vero)

Completa la Fase 2 rimasta aperta dal 2 settembre: quando 2 allenatori avvistano il giocatore nello
stesso istante (Boschi del Tuscolo, 18 trainer), ora scatta una **vera lotta 2v2** invece del toast
placeholder. Richiesta esplicita di Luca ("fedele a Essentials"): controllate le regole reali in
`strumenti/scripts_estratti/0147_Battle.rb` (sideSizes, indice battler interlacciato, ordine turni
per priorità+velocità su tutti i battler, riduzione danno delle mosse ad area) prima di progettare.

- **Motore parallelo, non un riscrittura del motore 1v1** (`js/battle.js`, ~2000 righe già scritte
  intorno a una singola coppia `mio`/`nemico`): nuovo `Battle.avviaDoppia()` con proprio stato (2
  Pokémon del giocatore + 2 avversari, uno per allenatore, con relative panchine), che riusa senza
  toccarla tutta la logica pura già generica (`creaIstanza`, `calcolaDanno`, `eseguiTurno`,
  `applicaStato`, `applicaCambiStat`, `assegnaExp`, ecc.).
- Piccola parametrizzazione additiva (zero impatto sul 1v1, stessa firma/comportamento se non usata):
  `elementoSprite`/`centroSprite`/`lampeggia`/`lungeAttaccante` ora passano da un registro
  istanza→elemento (WeakMap) con fallback identico a prima; `aggiornaSprite()`/`aggiornaPannelli()`
  smistano alla versione doppia se `modoDoppia` è attivo; `eseguiMossa()` accetta un `opzioni`
  facoltativo (`silenzioso`, `fattoreDanno`) per le mosse ad area; `eseguiTurno()` smista a
  `eseguiMossaMultiBersaglio()` quando il bersaglio è un array.
- **Ordine turni**: coda di tutti i battler vivi (fino a 4), ordinata per priorità mossa poi
  velocità effettiva, pareggi casuali — stessa regola del 1v1, generalizzata.
- **Targeting**: mosse verso sé stessi vanno dritte; mosse ad area (`mossa.bersaglio` letto da
  PokéAPI, `all-opponents`/`both-opponents`/`all-other-pokemon`, già in cache da `js/pokeapi.js`)
  colpiscono entrambi i nemici con **danno ridotto ×0.75** (regola Essentials); mosse a bersaglio
  singolo con 2 nemici vivi aprono un selettore bersaglio (nuovo `#selettore-bersaglio`).
- **IA dei 2 avversari**: stessa logica "mossa casuale tra quelle con PP" del motore singolo
  (`sceglieMossaCasuale`, estratta da `scegliMossaNemico`) — **non** l'IA reale di Essentials
  (`0198_Battle_AI.rb`, un sistema a parte fuori scala), scelta comunicata esplicitamente a Luca.
- KO di uno slot giocatore → sostituto obbligatorio (escluso il Pokémon già nell'altro slot); KO di
  uno slot avversario → l'allenatore manda il prossimo della sua panchina, o lo slot resta vuoto.
  Vittoria/sconfitta valutate sull'intera squadra, non sui singoli slot. EXP accreditata a chi ha
  inferto il colpo di grazia; premio in soldi = somma di entrambi gli allenatori.
- **UI**: 4 nuovi nodi in `index.html` (slot "-2" per nemico/giocatore, id/coordinate interne
  identiche allo slot 1 — il pannello viene rimpicciolito con `transform: scale()` invece di
  ricalcolare le coordinate pixel-per-pixel del databox), mostrati solo sotto
  `#schermata-battaglia.doppia` e nascosti via classe `.nascosto` quando lo slot è vuoto.
- **`js/map.js`**: `_trainerSpottaDoppia` ora chiama `Battle.avviaDoppia` invece del placeholder;
  bookkeeping post-vittoria (medaglia/flag/palestraId/trainerBattuti) estratto in
  `_applicaEsitoTrainer(id, dati, ev)`, chiamato una volta per allenatore sia dalla lotta singola
  (`_avviaLottaTrainer`) sia dalla nuova `_avviaLottaTrainerDoppia` — nessuna duplicazione.
- Verificati: `node --check` su `js/battle.js`/`js/map.js` (sintassi ok), bilanciamento parentesi
  CSS ok. **Non ancora testato dal vivo nel browser** (serve raggiungere Boschi del Tuscolo e
  incrociare le linee di vista di 2 trainer) — prossimo passo prima di tutto il resto.

### Prossimo passo
Playtest reale in Boschi del Tuscolo: 2 trainer che avvistano insieme, verificare selettore
bersaglio, mossa ad area con danno ridotto, sostituzione dopo KO, vittoria/sconfitta con doppio
premio, e che le lotte singole esistenti (es. capopalestra Frascati) continuino a funzionare
identiche a prima. **Test lasciato in sospeso su richiesta di Luca** (salvato anche in memoria).

---

## Sessione 3 settembre 2026 (continuazione) — Fix spawn su Surf + foto mappe aggiornata

Luca ha segnalato un bug: al caricamento di un salvataggio (o dopo un warp) che finisce su una
casella d'acqua surfabile, a volte il personaggio compariva "a piedi" sopra il lago invece che in
Surf ("sembra che ci sto volando sopra").

- **Fix** in `js/map.js`, `_posizionaPlayer(tx, ty)` — l'unico punto del motore che piazza davvero lo
  sprite del giocatore (usato da spawn iniziale, ripresa da salvataggio, ogni warp/porta): ora, se la
  casella di arrivo è dentro `acquaSurf` (il set delle celle `trigger_surf`), `surfAttivo` viene
  forzato a `true` lì, **prima** di scegliere l'animazione/sprite — non dipende più solo dal flag
  `stavaSurfando` letto dal salvataggio. Prima esisteva già un ripristino dello stato Surf da
  salvataggio (`stato.mappaSalvata.surfando`), ma solo per quel caso preciso: qualunque altro modo di
  finire su una casella d'acqua (spawn di una mappa, warp) non veniva coperto.
- Non testato dal vivo (stesso limite di sessione: browser disconnesso) — verificare ricaricando un
  salvataggio con la posizione su una casella di Surf.

Richiesta collegata: aggiornata la foto delle mappe ancora da fare, incrociando `docs/TODO.md` con i
file reali in `sprites/maps_tiled/` (molte voci di `docs/STATO-PROGETTO.md` §3.2 erano superate dal
lavoro di Luca su Tiled e sono state corrette). Confermato da Luca: la Lega di Colonna è completata
su Tiled (`Lega_pokemon_1f/2f/3f/4f` esistono tutti ora), ma **solo `lega_pokemon`/`lega_pokemon_4f`
sono registrate in `MAPPE`** — 1f/2f/3f restano da cablare; **Sala del Campione: nessun file esiste
ancora**. Elenco completo mappe mancanti in `docs/TODO.md` (Gruppo A) e `docs/STATO-PROGETTO.md` §3.2.

### Prossimo passo
Cablare `Lega_pokemon_1f`/`_2f`/`_3f` in `MAPPE` (warp tra i piani) quando Luca lo chiede; poi Sala
del Campione da disegnare. Resta comunque prioritario il playtest della lotta in doppio (sopra).

---

## Sessione 3 settembre 2026 (terza parte) — Icone Squadra allineate al Box + icone Gen 3 scaricate

Luca voleva provare le icone menu "stile Gen 3" (FireRed/LeafGreen/Emerald) di Bulbagarden Archives
per Box e Squadra. Scritto `strumenti/scarica_menu_sprites_gen3.js` (usa l'API MediaWiki della
categoria, non lo scraping delle pagine): scaricate tutte le **386 icone** (`001.png`..`386.png`,
32×32 originali) in `sprites/pokemon_icons_gen3/` — nessuna forma alternativa (Deoxys/Unown), solo
una per specie, coerente col limite Gen 1-2-3.

Controllando il codice per collegarle, però, è saltato fuori un problema più concreto di quale set di
icone usare: **la schermata Squadra (`PartyScene`, `js/map.js`) non usava affatto un'icona dedicata**
— mostrava lo sprite GRANDE di battaglia del Pokémon (`pkm.sprite.fronte`, la stessa immagine di
`PartyDetailScene`/Sommario) rimpicciolito a forza a 56×56 con `setDisplaySize`. Il Box (`BoxScene`)
invece usava già correttamente `sprites/pokemon_icons/` (715 file, per nome specie, stile Essentials
già nel progetto). Luca ha confermato di non avere preferenze tra i due set, purché Box e Squadra
mostrino **icone vere, non lo sprite di lotta**.

- **Fix**: `PartyScene` ora usa la stessa `chiaveIconaPokemon(pkm.nome)` + `sprites/pokemon_icons/` di
  `BoxScene` (stessa chiave texture Phaser `pkm-icon-<NOME>`, quindi le due schermate condividono la
  cache: se il Box ha già caricato un'icona, la Squadra non la ricarica e viceversa). `PartyDetailScene`
  (la Sommario) NON è stata toccata: lì lo sprite grande è corretto, è la schermata di dettaglio.
- `sprites/pokemon_icons_gen3/` resta scaricata nel progetto, non ancora collegata al codice — pronta
  se in futuro Luca preferisce quello stile al posto delle 715 icone Essentials attuali (richiederebbe
  solo cambiare la cartella/chiave in `chiaveIconaPokemon`, dato che oggi è indicizzata per numero
  invece che per nome).
- Non testato dal vivo (browser ancora disconnesso in questa sessione) — verificare aprendo Squadra:
  deve mostrare icone piccole come nel Box, non più lo sprite di lotta squisciato.

**Aggiornamento stessa sessione**: Luca ha segnalato che le icone (una volta viste) risultavano
"doppie" — causa trovata: i 715 file di `sprites/pokemon_icons/` erano in realtà fogli Essentials a
**2 fotogrammi affiancati** (128×64, l'animazione "bounce" del PC originale), non icone singole.
`PartyScene`/`BoxScene` li caricavano interi e li scalavano con `setDisplaySize` in un riquadro
quadrato, schiacciando i 2 fotogrammi insieme — bug presente **anche nel Box** (non solo nella
Squadra appena cambiata), semplicemente mascherato lì da un `background-size` CSS che per caso
tagliava via il secondo fotogramma nel vecchio pannello DOM del Box (mai nella versione Phaser).
- **Fix**: nuovo `strumenti/ritaglia_icone_doppie.py` (Python + Pillow) ritaglia tutti i 715 file al
  primo fotogramma (metà sinistra, 128×64 → 64×64) e sovrascrive in `sprites/pokemon_icons/` — 715/715
  ritagliate, verificate dimensioni (tutte 64×64) e un campione visivo (Pikachu, Charizard).
  `.box-icona` in `style.css` (vecchio pannello DOM del Box) aggiornata da `background-size: 96px
  48px` (compensava il doppio fotogramma) a `48px 48px` (piena, un solo fotogramma) — sarebbe rimasta
  rotta (schiacciata orizzontalmente) altrimenti.
- Non testato dal vivo per lo stesso motivo di sopra — verificare sia Box che Squadra.

**Aggiornamento stessa sessione**: Luca ha segnalato un tileset mancante a Grottaferrata. Trovato:
`chiesa.tsj` (usato da `grottaferrata.tmj` **e** `Percorso_11.tmj`, 32×32, 11 colonne, immagine
`chiesa.png` in radice) non era mai stato registrato in `js/map.js` (`TILESET_META`/
`TILESET_IMMAGINI`) — stesso identico problema già visto più volte per altri tileset dimenticati
(`palestre`, `party`, ecc.): quella zona della mappa risultava nera/vuota, solo un warning silenzioso
"Tileset sconosciuto: chiesa" in console. Registrato (`'chiesa': { key: 'ts-chiesa', tw:32, th:32,
cols:11 }`). Non testato dal vivo per lo stesso motivo di sopra.

---

## Sessione 1 settembre 2026 — Grafica reale di Essentials nei menu nativi

Richiesta esplicita di Luca ("VOGLIO UN MENU STILE POKEMON IDENTICO... ci sta il file e il doc per
farlo dentro Essentials?"): i menu nativi (Scene Phaser introdotte il 31 agosto) usavano solo
rettangoli colorati come sfondo/pannelli, non gli asset grafici reali di Essentials. Confermato che
`Essentials FRLG/Graphics/UI/` contiene gli sfondi/pannelli VERI (non ricostruiti) per ogni schermata,
e che `Essentials FRLG/Data/Scripts.rxdata` contiene le coordinate esatte via script Ruby
(`UI_Party.rb`, `UI_Bag.rb`, `UI_Summary.rb`, `UI_TrainerCard.rb`) — pipeline di estrazione già pronta
in `strumenti/estrai_scripts.rb` (output in `strumenti/scripts_estratti/`, non committato: rigenerabile
in pochi secondi con Ruby già installato).

- **`PartyScene` riscritta con gli asset reali** (`sprites/ui/party/`): sfondo `bg.png`, pannelli
  `panel_round`/`panel_rect` (il primo Pokémon usa sempre il pannello arrotondato, per SLOT non per
  specie — segue esattamente `UI_Party.rb`), 7 varianti per stato (normale/selezionato/svenuto/in
  scambio, con le stesse regole di `refresh_panel_graphic` dell'originale), barra HP vera (crop
  dinamico su `overlay_hp.png`, 3 fasce colore), icona Pallina, livello, genere, sigla di stato
  (PAR/VEL/SCO/SON/CON). Tutto disegnato in un Container a risoluzione virtuale 512×384 (= risoluzione
  reale degli asset) scalato per riempire lo schermo, mai deformato. Il sistema di riordino di ieri
  (menu Info/Ordina + trascinamento) resta identico, solo "riverniciato" con le texture giuste.
  **Verificato dal vivo**: schermata, apertura menu a tendina, scambio via trascinamento (mostrato
  correttamente lo scambio dei pannelli round/rect in base allo slot, non alla specie).
- **`ZainoScene` riskin leggero** (`sprites/ui/bag/`): sfondo reale per tasca (`bg_1`/`bg_3`/`bg_8`,
  gli stessi numeri di tasca Oggetti/Ball/Chiave dell'originale) più l'icona reale dello zainetto
  (`bag_N.png`) in alto — la logica della lista scrollabile (già completa: Usa, ℹ️ mosse MT, ecc.) NON
  è stata riscritta, solo lo sfondo. **Verificato dal vivo** sulle 3 tasche.
- **`PartyDetailScene` (Sommario di un Pokémon)**: sfondo reale `Summary/bg_1.png` al posto del
  rettangolo scuro. Contenuto (mosse/statistiche) non toccato. **Verificato dal vivo** (solo lo
  sfondo, senza un Pokémon valido passato nel test rapido).
- **`TrainerCardScene` — nuova**, non esisteva prima. Asset reali `card.png`/`card_f.png` (variante
  femmina già gestita da `stato.genere`) e `icon_badges.png` per le medaglie ottenute, coordinate testo
  lette da `UI_TrainerCard.rb` (Nome/Denaro a y=70/118, medaglie a y=310 con crop 32×32 per icona).
  Il progetto non traccia ID allenatore/Pokédex/tempo di gioco: quelle righe dell'originale sono state
  omesse invece di inventare dati — al loro posto: Passi e Giorno (dati reali già in `stato`). Aggiunta
  voce "🎫 Scheda Allenatore" al menu Start (`VOCI_MENU_START`/`SCENA_PER_VOCE` in `js/map.js`), e la
  scena registrata nell'array `scene:` del `Phaser.Game`. **Verificato dal vivo**.
- Copiati in `sprites/ui/` solo gli asset effettivamente usati (non l'intera cartella `Essentials
  FRLG/Graphics/UI/`, che resta comunque nel progetto come riferimento per le prossime schermate).

### Prossimo passo
Non tutte le schermate sono ancora "vestite" con asset reali: `RecapScene`, `SalvaScene`, `BoxScene`,
`MarketScene` restano con lo sfondo a rettangolo colorato di ieri. Continuare a blocchi quando Luca lo
richiede, stessa tecnica (Container a risoluzione virtuale = risoluzione dell'asset, scalato). Il
Riepilogo Pokémon (`PartyDetailScene`) ha per ora solo lo sfondo reale: il contenuto testuale
potrebbe essere riposizionato sulle coordinate esatte di `UI_Summary.rb` in una prossima sessione, se
richiesto.

---

## Sessione 1 settembre 2026 (continuazione) — Grafica reale anche su Market/Recap/Salva

Richiesta di Luca: "VAI PROCEDI A RIFARE TUTTO CIÒ CHE MANCA TRANNE IL BOX". Completate le 3 schermate
rimaste col rettangolo colorato (il Box è stato escluso esplicitamente, resta invariato).

- **`MarketScene`**: sfondo reale `Graphics/UI/Mart/bg.png` (`sprites/ui/mart/bg.png`) + velo scuro,
  stessa tecnica di `ZainoScene`. La lista/logica d'acquisto non è stata toccata.
- **`RecapScene`**: il Recap è una schermata custom di questo progetto (non esiste nell'originale
  Essentials) — riusa lo sfondo reale "Load" (`Graphics/UI/Load/bg.png`, la schermata analoga di
  riepilogo/scelta a lista dei giochi originali). Emoji del titolo cambiata da 🎫 a 📋 (il 🎫 è passato
  alla nuova Scheda Allenatore di ieri, più adatto).
- **`SalvaScene`**: stesso sfondo "Load" di Recap, e ogni riga-bottone (Salva partita, Setup TEST,
  Reset cutscene, Esporta/Importa, Nuova partita) ora ha come sfondo il pannello piccolo reale di
  `Graphics/UI/Load/panels.png` (crop 408×46, variante "non selezionata" — nell'originale è la stessa
  usata per le voci Nuova Partita/Opzioni della schermata Load) invece del chip di colore piatto
  precedente. I colori distintivi per tipo di azione (verde=salva, viola=test, rosso=cancella, ecc.)
  restano ma ora sul TESTO invece che sullo sfondo, per restare leggibili sul pannello chiaro.
- Tutte e 3 verificate dal vivo (schermata reale visibile con sfondo/pannelli corretti; il Market
  mostra il messaggio "avvicinati al Poké Market" perché il test non era vicino a un market reale —
  normale, conferma solo che lo sfondo carica).
- **Ora TUTTE le schermate del menu Start + Market usano asset reali di Essentials, tranne il Box**
  (escluso esplicitamente da Luca in questa richiesta — resta con la sua UI attuale, mai stata in
  discussione).

### Prossimo passo
Nessun'altra schermata nativa in sospeso per questo filone (il Box è escluso di proposito). Se in
futuro Luca chiede anche il Box: `Graphics/UI/Storage/` ha gli asset reali, stessa tecnica.

---

## Sessione 1 settembre 2026 (terza parte) — Cursore a tastiera ovunque + fix Sommario/scambio sprite

Luca ha segnalato tre problemi dopo il giro precedente: 1) serve un cursore a tastiera in OGNI menu che
richiede un click col mouse, non solo il click; 2) la Scheda Info Pokémon aveva la grafica sbagliata;
3) "Ordina" scambia nome/HP ma non lo sprite dei Pokémon.

- **Bug scambio sprite — CAUSA TROVATA E CORRETTA**: le icone dei Pokémon in `PartyScene` erano
  in cache Phaser con chiave `party-icon-${idx}` (basata sulla POSIZIONE in squadra), non sull'identità
  dello sprite. Dopo uno scambio, la posizione idx manteneva la vecchia texture in cache anche se il
  Pokémon lì dentro era cambiato — nome/HP (letti da `stato.squadra` ad ogni ridisegno) si aggiornavano
  giustamente, l'icona (texture cache) no. Fix: nuova `chiaveIconaSprite(url)` che usa l'URL dello
  sprite (identità della specie) come chiave invece dell'indice, applicata in `PartyScene` (create() +
  `_disegnaGriglia`) e in `PartyDetailScene`. **Verificato dal vivo**: trascinato Lapras da slot 0 a
  slot 1 (scambio con Arcanine) — sprite corretti su entrambi i lati dopo lo scambio, forma del
  pannello (round/rect) corretta per lo slot.
- **`PartyDetailScene` (Scheda/Sommario) riscritta di nuovo, stavolta con VERE pagine**: non un
  riallineamento estetico ma 3 pagine reali (Info/Skills/Mosse, sfondi `bg_1`/`bg_3`/`bg_4`), cambio
  pagina con ←/→, coordinate lette pixel-per-pixel da `drawPageOne`/`drawPageThree`/`drawPageFour` in
  `UI_Summary.rb`. Bug trovato e corretto DURANTE il test: i badge di tipo (Water/Ice/Fire/ecc.) uscivano
  come piccoli riquadri sbagliati/tagliati usando `setCrop(0, pos*28, 64, 28)` su `types.png` per
  qualunque riga con offset verticale ≠ 0 (solo `pos=0`, Normale, funzionava). Risolto registrando un
  **frame nominato per tipo** sulla texture (`texture.add(nome, 0,0,pos*28,64,28)`, una volta sola) e
  usando `this.add.image(x,y,'ui-summary-types', nomeTipo)` invece di `setCrop` — molto più robusto.
  **Verificato dal vivo** su tutte e 3 le pagine: Info (badge WATER+ICE per Lapras, Dex/Specie/OT/EXP
  posizionati esattamente sull'arte reale), Skills (barra HP vera, tutte le statistiche), Mosse (badge
  di tipo per le 4 mosse, PP). Nota: OT/N.ID/Pokédex non sono dati tracciati da questo progetto — OT
  mostra Rosso/Rossa (stesso placeholder di TrainerCardScene, non inventato), N.ID resta "?????" (stesso
  fallback dell'originale quando l'informazione manca).
- **Cursore a tastiera aggiunto ovunque mancava** (richiesta esplicita: "oltre al click ci deve essere
  un cursore che si muove con i tasti direzionali... in ogni menu e interfaccia"):
  - `PartyScene`: il menu a tendina Info/Ordina ora si comanda anche con ↑↓+A/Invio (prima SOLO mouse
    una volta aperto — bug di usabilità reale, non solo una richiesta preventiva).
  - `ZainoScene`: ←→ cambiano tasca, ↑↓ scorrono la lista con auto-scroll, A/Invio attiva "Usa".
  - `MarketScene`: ↑↓ scelgono l'oggetto, A/Invio compra.
  - `SalvaScene`: ↑↓ scelgono la voce (bottoni ridisegnati come lista navigabile), A/Invio conferma.
  - `ZainoBersaglioScene` (scegli Pokémon bersaglio per un oggetto): griglia 2 colonne con cursore
    ↑↓←→, A/Invio conferma (stesso schema di `PartyScene`).
  - `PartyDetailScene`: ↓ dalla pagina sposta il focus sulla barra azioni in basso (Sposta su/Rilascia/
    Togli oggetto/Caramella Rara), ←→ scorrono i bottoni, A/Invio attiva, ↑ torna alla pagina.
  - **Non incluso**: `BoxScene` (Box PC) — resta con la sola interazione a click, non toccato in questo
    giro (era già escluso esplicitamente dal giro precedente); se richiesto in futuro serve un cursore
    su una griglia 30+6 caselle, lavoro a sé.
- Verifica dal vivo di questo giro complicata da una vera e propria corsa (race condition) tra i
  comandi automatici di test e il rendering di Phaser (stesso meccanismo di fondo del bug "mappa nera"
  chiuso il 31 agosto): premere un tasto o cliccare subito dopo l'apertura di una Scene, prima che il
  primo fotogramma sia stato disegnato, non produceva alcun effetto. Non è un problema del gioco (nel
  gioco vero il rendering è continuo), solo dell'automazione — bastava uno screenshot in più per far
  "assestare" la scena prima di interagire.

### Prossimo passo
Nessun problema aperto noto da questa lista. Se Luca vuole il cursore a tastiera anche sul Box, è il
prossimo candidato naturale.

---

## Sessione 31 agosto 2026 — Allineamento Essentials FRLG: battleback, menu Start nativo, Surf

Sessione a partire da un'analisi diretta degli Scripts.rxdata di Pokémon Essentials v21 FRLG
(estratti con Ruby/Zlib/Marshal in `Essentials FRLG/Data/Scripts.rxdata`, 403 script), confrontati
col codice reale per capire cosa manca rispetto all'originale. Vedi `docs/TODO.md` (nuovo Gruppo D)
per la lista di sistemi Essentials ancora mancanti (meteo di battaglia, Riapprendi mosse, Follower —
con caveat: solo 33/386 sprite overworld disponibili). **Escluse definitivamente Pokémon Shadow e
Purificazione**, richiesta esplicita di Luca, non riproporre.

- **Battleback 4:3 senza bande nere**: `#battaglia-schermo` resta un rettangolo 4:3 nitido e mai
  deformato (letterbox introdotto in una sessione precedente), ma ora dietro c'è
  `#battaglia-sfondo-esteso` — stesso file, `background-size:cover` (ritagliato, mai stirato) e
  sfocato/scurito, che riempie tutto lo schermo ai lati. Verificato dal vivo.
- **Encounter Surf**: bug trovato — un tile su "Lago di Albano interno.tmj" aveva
  `type:"acqua surf e sub"`, stringa non riconosciuta da `ALIAS_TIPO` in `js/map.js`, quindi mai
  diventava `trigger_surf`: zero incontri lì. Fix: `normTipo()` ora riconosce qualunque tipo
  contenente "surf" come fallback generico, più un alias nella tabella incontri
  (`dati/incontri.js`) per quel tile specifico.
- **Salvataggio Surf (Problema 4a)**: `stato.mappaSalvata` ora include `surfando: surfAttivo`;
  al caricamento (`create()`/`_caricaMappaSingola`/`_caricaCluster` in `js/map.js`) lo stato Surf
  viene ripristinato PRIMA di posizionare lo sprite. Verificato dal vivo.
- **Sprite composito Surf (Problema 4b)**: nuovo sprite Phaser `mountSurfSprite` ("base_surf",
  copiato in `sprites/base_surf.png`) creato/distrutto "just in time" sotto al personaggio,
  sincronizzato a posizione/direzione/fotogramma del giocatore ogni frame
  (`_aggiornaMountSurf()`), con uno scarto verticale (`OFFSET_Y_MOUNT = 10`) perché il personaggio
  non "uscisse" dal disegno della cavalcatura (segnalato da Luca dopo il primo giro). **Verificato
  dal vivo** dopo il fix.
- **Menu Start nativo (Problema 3)**: prima riscrittura verso vere Scene Phaser (decisione esplicita
  di Luca: niente pannello DOM sopra la mappa, come nell'originale RGSS). Nuove `PauseMenuScene`
  (lista Squadra/Zaino/Recap/Salva, navigabile a frecce, schermo pieno opaco, stesso pattern già
  collaudato di `InteriorScene`) e `PartyScene` (griglia squadra nativa: sprite/nome/livello/HP,
  SOLO consultazione, il dettaglio di un Pokémon non è ancora migrato). Zaino/Recap/Salva restano
  temporaneamente sul vecchio pannello DOM (aperto da `apriSezioneMenuDaSceneNativa`, richiuso verso
  `tornaAMenuNativo` — non un placeholder, la stessa UI di prima, solo non ancora riscritta).
  **Bug segnalato da Luca dopo il primo giro**: `phaserGame.scene.launch is not a function` alla
  pressione di Start — corretto usando `scena.scene.launch(...)` (il ScenePlugin di una scena viva)
  invece di `phaserGame.scene.launch(...)` (stesso fix applicato anche a `_apriInternoFallback`,
  stesso bug latente mai emerso prima perché quel percorso non era mai stato esercitato). Anche gli
  ascoltatori tastiera di `PauseMenuScene`/`PartyScene` riscritti da polling (`update()` +
  `JustDown`) a eventi diretti (`keydown-*`), più robusti. **Verificato dal vivo per intero** dopo
  i fix: apertura, navigazione ↑↓, Squadra nativa (griglia con sprite/HP), fallback DOM per
  Zaino/Recap/Salva (mappa resta nascosta anche lì), chiusura con X torna alla lista nativa, B dalla
  lista nativa chiude tutto e torna alla mappa.
- **Bug preesistente "mappa nera"/reset di sessione**: incontrato ripetutamente durante i test di
  questa sessione — al caricamento (o dopo un po' di inattività) la mappa/le Scene Phaser smettono
  di aggiornarsi (schermo nero o congelato) finché non si fa un click sul canvas per "risvegliarle".
  Probabilmente throttling di `requestAnimationFrame` quando la tab non ha il focus reale (comune
  con l'automazione browser: il click sintetico non conta sempre come vero focus per Chrome) — non
  è detto sia un bug per un giocatore reale con la tab davvero in primo piano, ma vale la pena
  verificarlo. Non indagato a fondo — priorità se Luca lo nota anche giocando normalmente.

### Aggiornamento stesso giorno — Squadra interattiva + Zaino migrato

Richiesta di Luca dopo il primo giro: la scheda Squadra deve essere cliccabile (mosse, statistiche,
oggetto tenuto) e lo Zaino va migrato allo stesso modo di Squadra.

- **`PartyScene` ora interattiva**: click su una card → `PartyDetailScene` (nuova), che mostra
  sprite, tipi, barra HP, statistiche (Attacco/Difesa/Att.Sp/Dif.Sp/Velocità), EXP/level cap,
  oggetto tenuto, elenco mosse con badge tipo/potenza/PP — stesso contenuto del vecchio
  `renderDettagli()` in app.js, ridisegnato in Canvas. Azioni incluse: Sposta su, Togli oggetto,
  Caramella Rara (MODALITÀ_TEST). **Nota**: la "natura" non è mostrata perché non è MAI stata
  tracciata nel modello dati di questo progetto (nessun `pkm.natura` da nessuna parte, nemmeno
  nella vecchia UI DOM) — non è un'omissione di questa riscrittura, è un gap dati preesistente.
- **`ZainoScene` (nuova, nativa)**: 3 tasche (Oggetti/Chiave/Ball) come il vecchio pannello,
  icone reali degli oggetti, "Usa" su tutto ciò che è utilizzabile (cura, revive, stati, PP,
  pietre, MT/MN, oggetti tenuti, caramella rara) → apre `ZainoBersaglioScene` per scegliere il
  Pokémon, poi richiama la vera `usaOggettoSu()`/`usaRepellente()` di app.js (nessuna logica di
  gioco duplicata, solo la UI è nuova). Caso speciale pietra evolutiva: si esce dal menu nativo
  PRIMA di far partire l'animazione di evoluzione (altrimenti restava dietro). `VOCI_MENU_START`
  aggiornato: 'zaino' ora `nativa:true`.
  **Non ancora migrato**: l'espansione "ℹ️" con la spiegazione dettagliata di una mossa dentro il
  contenitore MT (il bottone "Insegna" per usarla funziona comunque).
- Verificato dal vivo per intero: click su un Pokémon in Squadra → scheda dettagliata → B torna
  alla griglia; Zaino → tasche cliccabili → Usa Pozione su Lapras → HP e quantità si aggiornano
  correttamente, toast di conferma sopra la scena nativa.

### Aggiornamento stesso giorno — Recap, Salva, ed espansione MT

Richiesta di Luca subito dopo Squadra/Zaino: migrare anche Recap e Salva, e integrare l'espansione
"ℹ️" delle MT rimasta indietro.

- **`RecapScene` (nuova, nativa)**: riepilogo di stato — passi, giorno/ora, Pokéyen, squadra/box,
  medaglie/level cap, MN possedute, allenatori battuti, più i tre stati narrativi (Team GdF,
  Leggendari, Lega). Riusa le stesse funzioni di app.js (`mnPosseduteTesto`, `gdFStatoTesto`,
  `leggendariStatoTesto`, `legaStatoTesto`, che restituiscono frammenti HTML) tramite un piccolo
  helper `_divsATesto()` che li spezza in righe di solo testo per il Canvas — nessuna logica di
  stato duplicata.
- **`SalvaScene` (nuova, nativa)**: Salva partita, Setup squadra TEST, checkbox "Allenatori non mi
  sfidano a vista", Reset cutscene, Esporta/Importa salvataggio (file JSON, via `<input type=file>`
  creato al volo — stesso meccanismo di sempre), Nuova partita (cancella tutto, con conferma).
  Tutte le azioni richiamano le funzioni vere già esistenti in app.js, non riscritte.
- **Espansione mosse MT integrata** in `ZainoScene`: bottone "ℹ️" accanto a "Usa" per gli oggetti
  categoria 'mt', apre un overlay con nome/tipo/categoria/potenza/precisione/PP/effetto (stesso
  identico testo di `descriviEffettoMossa()`/`classeMossaIt()` in app.js, fetch da `PokeAPI.getMossa`
  come sempre) — non più inline come nel vecchio pannello DOM (avrebbe richiesto ricalcolare le
  altezze variabili delle righe della lista scrollabile), ma il contenuto è identico.
- `VOCI_MENU_START` e `PauseMenuScene.SCENA_PER_VOCE` aggiornati: tutte e 4 le voci del menu Start
  (Squadra/Zaino/Recap/Salva) sono ora native. Il fallback DOM (`apriSezioneMenuDaSceneNativa`)
  resta nel codice ma non più raggiungibile da qui — solo Box/Market (modalità 'strumenti', invariati)
  lo usano ancora.
- Verificato dal vivo per intero: Salva → bottone Salva partita → "Partita salvata!"; Recap → tutte
  le righe corrette (incluso lo stato Lega "Completata ✔ — Sei il Campione!"); Zaino → tasca Chiave
  con una MT di test → ℹ️ → overlay con Lanciafiamme, Fuoco/Speciale, Pot.90/Prec.100/PP15, "Può
  scottare il bersaglio (10%)." — dati reali da PokéAPI, tutto corretto.

### Aggiornamento stesso giorno — Box e Market nativi (menu Start completamente migrato)

Richiesta di Luca ("procedi con le cose che puoi fare"): completati gli ultimi due pezzi del menu
'strumenti' (aperti da PC/venditore, non dalla lista Start).

- **`BoxScene` (nuova, nativa)**: 24 box × 30 slot, stessa interazione "prendi/posa/scambia" del
  vecchio pannello (`boxMano`/`leggiSlotBox`, variabili/funzioni condivise con app.js, non
  duplicate), striscia Squadra in basso, frecce pagina, ℹ️ apre `PartyDetailScene`.
- **`PartyDetailScene` generalizzata**: ora accetta una "fonte" `{tipo:'squadra'|'box', ...}` invece
  di un indice squadra fisso — stessa scheda per Pokémon di Squadra E di Box, con i bottoni giusti
  per ciascun caso (Sposta su per Squadra; Sposta in squadra/Rilascia per Box).
  Retro-compatibile con le chiamate esistenti da `PartyScene`.
- **`MarketScene` (nuova, nativa)**: lista merce del market più vicino/forzato, "Compra" richiama la
  vera `compraOggetto()` di app.js.
- Nuovo `apriMenuNativo(sceneKey)` generico (prima era solo per `PauseMenuScene`) con due wrapper
  `apriBoxNativo()`/`apriMarketNativo()` — stesso ingresso "pausa GameScene + nasconde HUD + lancia
  Scene", riusato invece di duplicato.
- Verificato dal vivo per intero: Box → preso Geodude → posato in slot vuoto → "Geodude sistemato" →
  ℹ️ → scheda con bottoni Box-specifici corretti; Market → "Compra" Pozione → "Hai comprato
  Pozione! (–₽300)", portafoglio e quantità aggiornati.

**Tutte le sezioni del menu (Start + PC + Market) sono ora Scene Phaser native.** La migrazione
avviata come Problema 3 è completa.

### Aggiornamento stesso giorno — Follower

Richiesta di Luca ("procedi con le cose che puoi fare, in ordine"): Follower implementato.

- Il primo Pokémon non esausto/non uovo della squadra segue il giocatore con un passo di ritardo
  (stesso meccanismo di Pokémon HGSS/SwSh: si muove verso la casella appena lasciata dal giocatore,
  stessa direzione/durata del passo) — non una coda di posizioni, solo "tile precedente + direzione".
- Copertura sprite: le 33 specie con sprite overworld pronto nell'export Essentials FRLG, copiati in
  `sprites/follower/POKEMON_<nome>.png`, mappate per ID in `FOLLOWER_SPRITE` (`js/map.js`). Per le
  altre ~353 specie il follower resta nascosto — decisione esplicita di Luca (niente fallback
  improvvisato), non un limite tecnico.
- Nascosto durante Surf/Bici (nessuno sprite dedicato per quei casi), aggiornato ogni frame per quel
  caso specifico (stesso trattamento della cavalcatura Surf) così sparisce subito, non al passo dopo.
- Verificato dal vivo: Lapras (capofila squadra di test) segue correttamente il giocatore su
  Borgata Tuscolana, direzione e ritardo di un passo corretti.

### Aggiornamento stesso giorno — Riapprendi mosse

Nuovo NPC "Maestro delle Mosse" ad Albano Laziale (riusa il dot Tiled `albano_npc1`, già presente
su `albano.tmj` ma mai assegnato a nessuno — `albano_npc2` resta libero). Servizio a pagamento,
₽1.000 a mossa (`PREZZO_RIAPPRENDI_MOSSE` in `js/app.js`, facilmente cambiabile).

- Riusa `pkm.mosseImparabili` (già calcolato per ogni Pokémon per i level-up, vedi `battle.js`):
  candidate = mosse con livello ≤ livello attuale del Pokémon, non già in `pkm.mosse`.
- Flusso: dialogo → scelta Pokémon (solo squadra reale, no uova) → scelta mossa da riapprendere
  (lista in italiano con livello) → se ha già 4 mosse, scelta di quale dimenticare → addebito e
  salvataggio automatico.
- Verificato dal vivo con Lapras: 19 mosse candidate correttamente elencate in italiano ("Ruggito
  Lv.1" … "Purogelo Lv.50"), picker "quale dimenticare" mostra le 4 mosse reali (Surf, Idropompa,
  Dragopulsar, Bora), percorso di annullamento testato (nessun addebito, portafoglio invariato).

### Aggiornamento stesso giorno — Meteo (battaglia + mappa)

Richiesta esplicita di Luca: il meteo doveva diventare un vero stato di gioco, non solo la trama del
Team GdF, e comparire anche in giro per la mappa (non solo in battaglia).

- **Battaglia** (`js/battle.js`): nuovo stato `meteoBattaglia` ('sun'/'rain'/'sandstorm'/'hail').
  Sole potenzia Fuoco ×1.5 e indebolisce Acqua ×0.5 (Pioggia il contrario), applicato in
  `calcolaDanno()` prima della variazione casuale. Sabbia/Grandine infliggono 1/16 HP massimi a fine
  turno ai tipi non immuni (Roccia/Terra/Acciaio salvi dalla Sabbia, Ghiaccio dalla Grandine),
  gestito in una nuova `fineTurnoMeteo()` richiamata da `fineTurnoStati()`. Le 4 mosse che impostano
  il meteo (Dissolvisole/Danza Pioggia/Tempesta di Sabbia/Grandinata — già presenti in `dati/mosse.js`
  ma **mai scelte come mossa** perché `mossaUtile()` non le riconosceva, essendo senza `statoEffetto`
  né `cambiStat`) ora impostano 5 turni di meteo con messaggio dedicato. Etichetta meteo (☀️/🌧️/🏜️/❄️)
  in alto nello schermo (`#battaglia-meteo`, nuovo in `index.html`/`style.css`).
- **Mappa** (`js/map.js` + `js/app.js`): nuovo `stato.meteo = { tipo, scadeAlPasso }`, ruotato in
  `aggiornaMeteo()` (app.js), chiamata ad ogni passo da `alPasso()`. ~1 possibilità su 300 passi che
  scatti un nuovo evento (30-79 passi di durata): Sole/Pioggia possibili ovunque all'aperto,
  **Grandine SOLO su Monte Cavo** (richiesta esplicita di Luca — unica zona innevata). Sabbia
  **mai ruotata**: nessuna zona desertica esiste ancora in gioco (rimandata, come richiesto). Resa
  visiva in `_aggiornaVeloMeteo()`/`_gestisciParticelleMeteo()`: velo colorato (stesso meccanismo del
  velo giorno/notte, un depth sopra) + particelle Phaser generate a runtime (pioggia = strisce
  diagonali, grandine = fiocchi), niente asset esterni da procurare.
- **Meteo di mappa → battaglia**: se sta piovendo/splende il sole/grandina quando scatta una lotta,
  la battaglia comincia già con quel meteo attivo (come nei giochi originali), per tutta la durata
  della lotta (non 5 turni: quelli sono solo per le mosse usate IN battaglia).
- Verificato dal vivo (via console, bypassando il bug "mappa nera" sotto): forzato `stato.meteo` a
  pioggia, avviata una lotta con `Battle.avvia()` — badge "🌧️ Pioggia" visibile, Surf (Acqua) di
  Lapras superefficace e potenziato contro un Charmander (Fuoco) selvatico, nessun errore console.
  Le particelle di pioggia sulla mappa sono comparse correttamente dopo qualche secondo di gioco
  reale — il ritardo iniziale nello screenshot era il bug "mappa nera" sotto, non un problema del
  codice meteo (confermato: `debugStato().veloMeteo`/`emitterMeteo` mostravano colore/alpha/emissione
  già corretti prima ancora che comparissero a schermo).

### Aggiornamento stesso giorno — Indagine bug "mappa nera": CHIUSA, non è un bug del gioco

Causa trovata: `document.visibilityState` risultava `"hidden"` nella scheda di automazione anche con
`document.hasFocus() === true` — Chrome tratta quella scheda come "in background" a prescindere dal
focus applicativo, e per policy del browser (risparmio batteria/CPU) **non esegue affatto**
`requestAnimationFrame` (e rallenta gli eventi input) per le schede considerate non visibili. Un
click "risveglia" la scheda perché Chrome la porta in primo piano come effetto collaterale
dell'interazione — non è il gioco a ripartire da un blocco interno.

- Primo tentativo: `disableVisibilityChange: true` nella config di `new Phaser.Game()` (disattiva la
  pausa automatica che Phaser stesso applica sul proprio loop quando rileva `visibilitychange`).
  **Non ha risolto**: confermato che il vero blocco è del browser (rAF non parte per una scheda
  hidden), non di Phaser — Phaser non può forzare l'esecuzione di un rAF che Chrome non chiama.
  **Ripristinato** (rimosso di nuovo): tenerlo attivo avrebbe fatto continuare il gioco (passi,
  meteo, tempo) anche quando un giocatore reale cambia scheda — un peggioramento per l'uso normale,
  a fronte di un problema che non lo riguarda.
- **Conclusione**: non è un bug del codice del gioco. Con la scheda davvero in primo piano (uso
  normale, non automazione), `visibilityState` è sempre `"visible"` e il loop non si blocca mai. Il
  problema esiste SOLO nell'ambiente di test automatizzato (Claude-in-Chrome), dove le schede restano
  in background finché non vengono cliccate — non è quindi qualcosa che Luca dovrebbe notare
  giocando normalmente. Item chiuso, nessuna azione ulteriore necessaria.

### Aggiornamento stesso giorno — Verifica versione mobile

Ultimo item della lista di Luca: "il gioco deve essere sviluppato per mobile anche, funziona uguale?
i tasti?". Verificato ridimensionando la finestra del browser a dimensioni realistiche di telefono
(390×844 verticale tipo iPhone, 360×640 verticale più piccolo, orizzontale ~740×560).

- **Base già solida**: viewport meta con `user-scalable=no`, `html,body{overflow:hidden}` (niente
  scroll/pull-to-refresh a disturbare), canvas Phaser a `Scale.RESIZE` che riempie sempre il 100% dello
  schermo, croce direzionale con **Pointer Events** (`pointerdown`/`pointerup`/`pointerleave`, non
  mouse-only: funzionano nativamente anche col dito) e `touch-action:manipulation` (niente ritardo da
  doppio-tap), bottoni da 56×56px (comodi da premere col dito). Schermata di battaglia ha già una
  regola `@media (max-width:620px)` per adattare pannelli/testo. In verticale, anche su schermi
  piccoli (360×640), tutto il layout overworld sta comodamente senza sovrapposizioni.
- **Bug trovato e corretto**: i pulsanti rapidi Velocità/Volo/Repellente avevano ciascuno un `bottom`
  fisso indipendente (145px/205px/265px) sommato a quello della croce direzionale — su uno schermo
  molto basso (es. telefono in orizzontale con la barra del browser che riduce l'altezza reale
  disponibile, misurata `window.innerHeight` in questa sessione: appena 176px in un caso, 376px in un
  altro più realistico), Volo e Repellente finivano spinti FUORI dallo schermo in alto (`top`
  negativo nel DOM), quindi invisibili e non toccabili. Corretto raggruppando i 3 pulsanti in un unico
  contenitore flex (`#controlli-rapidi`, `index.html`/`style.css`) ancorato appena sopra il D-pad: si
  impilano da soli, e quando Volo/Repellente sono ancora bloccati (`display:none`) non occupano
  spazio, quindi la colonna si accorcia da sola invece di lasciare buchi. Verificato dal vivo: a
  376px di altezza reale (orizzontale realistico) tutti e 3 i pulsanti + croce direzionale restano
  interamente dentro lo schermo, nessuna sovrapposizione.
- **Limite noto, non risolvibile lato CSS**: sotto ~280px di altezza reale (praticamente mai su un
  telefono vero, nemmeno in orizzontale con barra del browser) lo spazio non basta comunque per 4
  elementi impilati — resta un'ipotesi estrema, non un caso reale da coprire ora.
- **Non verificabile in questa sessione**: input via tocco reale (solo simulato via click/coordinate
  del tool di automazione, che in questo ambiente non sempre fa progredire il movimento — stesso
  limite di `document.visibilityState` descritto sopra per il bug "mappa nera", non specifico del
  mobile). Consigliato un test rapido di Luca da telefono vero quando possibile, ma la base tecnica
  (Pointer Events + touch-action) è quella corretta per funzionare col dito.

### Aggiornamento stesso giorno — Rimosso il Follower, riordino squadra riscritto

Richiesta di Luca: il Follower (compagno che segue sulla mappa, sessione precedente) "non funziona",
rimosso per ora; e la gestione della posizione dei Pokémon in squadra era "pessima" — servono due modi
per riordinare: trascinare col mouse per invertire due Pokémon, oppure selezionarne uno per aprire un
menu a tendina con "Info"/"Ordina", scegliere "Ordina" e poi navigare con le frecce + tasto A su un
altro Pokémon per scambiarli (B per annullare).

- **Follower RIMOSSO** (`js/map.js`): tolte tutte le variabili (`followerSprite`,
  `followerIdCaricato`, `followerPosTile`), la tabella `FOLLOWER_SPRITE` (33 specie), il preload degli
  spritesheet, la creazione delle animazioni idle/walk, e i metodi `_specieFollowerAttuale()` /
  `_followerVisibile()` / `_posizionaFollower()` / `_aggiornaFollower()` con tutti i punti di chiamata
  (spawn mappa, ogni passo, ogni frame per Surf/Bici). Gli asset in `sprites/follower/` restano sul
  disco (non cancellati) mai più caricati — riprendibile in futuro se si vuole capire perché non
  convinceva e riprovare, ma per ora il sistema è completamente spento, non solo disattivato a metà.
- **`PartyScene` riscritta** (`js/map.js`, stessa Scene nativa della Squadra): niente più "un click
  apre subito la scheda Info". Ora:
  - **Selezione** (click/tocco su una card, o cursore a frecce + tasto A/Invio/Spazio): apre un
    **menu a tendina** accanto alla card con due voci, **ℹ️ Info** (apre `PartyDetailScene` come
    prima) e **🔀 Ordina**.
  - **Ordina**: il Pokémon scelto viene "preso in mano" (bordo dorato + etichetta "A" sulla card,
    stesso schema già usato per il Box in `BoxScene`/`boxMano`); ci si sposta con le frecce (bordo
    azzurro = cursore) su un altro Pokémon e si preme A (o si clicca) per scambiarli — oppure si
    riseleziona la STESSA card, o si preme B, per annullare senza scambiare.
  - **Trascinamento col mouse** (metodo 1 richiesto da Luca): le card sono trascinabili
    (`setInteractive({draggable:true})`, verificato nel sorgente Phaser 3.60 che il flag `draggable`
    nel config di `setInteractive` chiama da solo `input.setDraggable()`, non serve altro). Trascinare
    una card su un'altra le scambia di posto al rilascio (bordo dorato = origine, azzurro = bersaglio
    sotto il puntatore durante il trascinamento). Un semplice click (spostamento sotto i 6px) NON
    scatena il trascinamento: apre il menu a tendina come da tastiera.
  - Lo scambio è un semplice `stato.squadra[i] ↔ stato.squadra[j]` (`_scambia()`), con
    `salvaPartita()` e un toast di conferma — riordina anche l'ordine di combattimento (il primo non
    esausto scende in campo per primo), è l'effetto voluto.
- **Non verificato dal vivo in questa sessione**: l'estensione del browser per l'automazione
  (Claude-in-Chrome) non risultava connessa — il codice è stato riletto con attenzione riga per riga
  invece del solito test in-game, e la questione `setInteractive({draggable:true})` è stata verificata
  leggendo direttamente il sorgente di Phaser 3.60 scaricato apposta. **Da testare dal vivo alla
  prossima occasione**: menu a tendina (mouse e tastiera), scambio via Ordina, scambio via
  trascinamento, annullamento (B / riselezione), Pokémon nelle uova (`pkm.uovo`) riordinabili anch'essi
  senza errori.

### Prossimo passo
Testare dal vivo il nuovo riordino squadra (menu Info/Ordina, trascinamento) appena possibile. Lista
del 31 agosto per il resto completata (Riapprendi mosse, Meteo, indagine "mappa nera", verifica
mobile) — prossima fase da concordare con Luca.

---

## Sessione 12 agosto 2026 — Tileset Ariccia, laboratorio svincolato, Museo di Nemi collegato, riconciliazione TODO

Sessione di verifica+fix su segnalazioni dirette di Luca, poi riconciliazione completa di
`docs/TODO.md` (Gruppo A e C riscritti punto per punto con stato "FATTO"/"MANCA" reale, verificato
sul codice e non sulle vecchie note). **Nessun test a schermo in questa sessione** (solo
`node -e JSON.parse` sui `.tmj` toccati) — priorità per la prossima volta.

- **Palestra di Ariccia collegata**: il "dot" che Luca aveva già piazzato su `Ariccia.tmj` (oggetto
  `palestra`, id 104, nessuna proprietà) era il segnaposto della porta mai cablata — trasformato in
  una vera porta (`destinazione: palestra_ariccia_interno`, `spawn_id: entrata_principale`), aggiunto
  lo spawn di ritorno `da_palestra_ariccia`. Fatto su `.tmj` e `.tmx`.
- **4 tileset di Ariccia mai registrati** (`party`, `party2`, `party3`, `porchetta` — usati da
  `Ariccia.tmj` ma assenti da `TILESET_META`/`TILESET_IMMAGINI` in `js/map.js`, stesso identico
  problema già risolto per `palestre`/`palestre2`/`palestre3` in sessione precedente): registrati,
  immagini verificate a disco (`party.png`/`party2.png`/`party3.png` in root, `sprites/nuovi
  tileset/porchetta.png`).
- **`laboratorio_interno.png` svincolato dalla mappa**: verificato che il tileset
  `laboratorio_interno.tsj` nel laboratorio del Prof. Castagno era già completamente inutilizzato —
  nessun gid delle 4 mappe di tile lo referenzia (Luca l'aveva già sostituito con
  `Interior_general_32` in Tiled, la dichiarazione vecchia era solo un relitto morto, non causava
  bug). Rimossa da `.tmj`/`.tmx` e da `js/map.js`: zero dipendenza residua dal png mancante.
- **2 NPC assistenti nel laboratorio** (`scienziato_lab_1`/`_2`, sprite `scienziato`, dati in
  `dati/npc.js`): il primo (`interagisciScienziatoLab1`, `js/app.js`) regala 1 Pozione una tantum, il
  secondo è solo dialogo. Posizioni segnaposto (x230/x550, y560).
- **Museo delle Navi di Nemi collegato al mondo** (2 piani): esisteva solo come `.tmx` mai esportato,
  con il layer eventi completamente vuoto su entrambi i piani (zero warp/spawn). Scritto uno script
  di conversione riutilizzabile (`strumenti/tmx_a_tmj.py`, tmx→tmj, complementare a quello già
  esistente `tmj_a_tmx.py`), usato per generare `Museo_navi_1f.tmj`/`Museo_navi_2f.tmj`. Aggiunto un
  varco su `Lago di Nemi.tmj` (oggetto `porta_museo_navi`, piazzato subito dopo il gate GdF esistente
  `gdf_gate_nemi` — quindi resta comunque bloccato dalla stessa condizione `documentoVillaOttenuto`
  già presente, nessun nuovo gate scritto) e scale interne 1f↔2f con spawn di ritorno. Registrati i 2
  tileset mai usati nel motore (`Mansion interior`, `Museum interior`). **Il museo resta vuoto
  dentro** (nessun boss/trainer aggiunto: fuori scope di questa richiesta, la 2ª parte password del
  Rifugio GdF di Marino resta da assegnare).
- **Riconciliazione `docs/TODO.md`**: Gruppo A riscritto voce per voce dopo verifica sul codice reale
  (non sulle vecchie note) — diverse voci erano già superate dal lavoro di Luca su Tiled: Tunnel
  Roccioso Castel Gandolfo→Monte Porzio (già fatto, tolto dagli aperti), Sfida dei Porchettari ad
  Ariccia (già implementata, non è un "dungeon" da disegnare), Spiaggia di Albano = Lago di Albano
  (mappa già esistente), Percorso Grottaferrata→Rocca di Papa (già collegato via
  `percorso_montano_v1`), Monte Cavo/Articuno/miniboss (già fatto). Segnalata la discrepanza
  narrativa nota Flora/Camilla per la palestra di Genzano (non risolta, su richiesta di Luca).
  Gruppo C riscritto con lo stato reale di ogni MN (tabella CLAUDE.md verificata riga per riga: Taglio/
  Spaccaroccia/Forza fatte, Surf ha solo il permesso pronto, Volo ha una discrepanza col donatore
  reale, Cascata resta l'unica del tutto aperta — D4). Confermato via ricerca nel codice che la
  Risfida allenatori ha **zero righe scritte** (il design era già deciso, il codice no).

### Seconda ondata, stessa giornata — Camilla, MN, Museo popolato, Risfida allenatori

Luca ha risposto a tutte le domande aperte della prima ondata e ha chiesto altre cose subito.
**Ancora nessun test a schermo.**

- **Genzano: Flora → Camilla, sovrascrittura definitiva** ("capo palestra genzano si chiama camilla
  stop, sovrascrivi"): rinominata con `sed` in `js/data.js` e `dati/trainer.js` (16 occorrenze
  totali, verificato nessun uso ambiguo della parola "flora" generica prima di lanciare la
  sostituzione). Risolve la discrepanza narrativa segnalata nella prima ondata.
- **MN Volo**: condizione cambiata da "6 medaglie" a "palestra di Albano battuta"
  (`palestraRichiesta: 'albano'` in `DONATORI_MN`, stesso donatore Faustino, stesso luogo — matcha lo
  stesso pattern già usato da Nonna Assunta/Surf). Testo del dialogo aggiornato di conseguenza.
- **MN Cascata e MN Sub (nuova)**: aggiunto un campo generico `mnDonata` a `PALESTRE` (`js/data.js`),
  letto da `vinciPalestra()` (`js/app.js`) per assegnare il permesso automaticamente alla vittoria —
  stesso pattern già esistente per `mtDonata`. Ariccia dona il permesso Cascata, Genzano il permesso
  Sub. Gli oggetti sul campo per entrambe restano da assegnare (Luca: "ora vediamo", non deciso).
- **Museo di Nemi popolato**: 3 grunt GdF + 1 capo (titolo generico "Capo GdF", stesso trattamento di
  `gdf_capo_marino` — identità vera non decisa) che alla sconfitta setta
  `stato.flags.museo_nemi_password` (2ª parte della password del Rifugio GdF di Marino, ancora non
  agganciata a nessun gate reale — il gate stesso non esiste). 2 NPC ostaggio con dialogo che cambia
  dopo la liberazione (`interagisciOstaggioMuseo1/2`, `js/app.js`). 1 Pepita (tesoro mai piazzato
  altrove) e la MT Idro Pompa (`mt_hydro_pump`, generata automaticamente in sessione precedente con
  nome inglese — tradotta ora che viene davvero usata, prima MT di quel lotto a uscire dal
  "provvisorio").
- **Risfida allenatori implementata** (richiesta esplicita — "ci deve essere"): regola diversa da
  quella documentata finora (tetto 1.5× il livello originale di ENTRAMBI/tutti i Pokémon, non più
  "asso del capopalestra successivo"), cooldown **7 giorni di gioco** (`stato.tempo.giorno`), soldi
  dimezzati, EXP ricompensa principale (nessun codice dedicato, sale da sé coi livelli più alti).
  Esclusi automaticamente capipalestra/boss di storia/rivale (controllo su `palestraId`/
  `flagVittoria`/`rivale`). Nuovo stato `stato.allenatoriBattutiGiorno` (per allenatore, giorno
  dell'ultima sconfitta). Logica in `js/map.js` (`_offriRisfida`), agganciata al punto dove il
  motore già gestiva "allenatore già battuto".
- **Lotta in doppio — richiesta di nuovo, non implementata**: verificato che `js/battle.js` (1536
  righe) è scritto interamente per 1 Pokémon avversario alla volta; un vero 2v2 richiede riscrivere
  ordine turni/IA/UI per 4 combattenti. Deciso di non improvvisarlo in coda a una sessione già enorme
  — proposto a Luca come sessione dedicata a parte.
- **Verificato e corretto in `docs/TODO.md`**: la MN Surf risultava assegnata a Rocca di Papa (P5)
  nella tabella di CLAUDE.md, ma il codice reale (`DONATORI_MN`) la lega a Monte Porzio — corretto
  nella riconciliazione, CLAUDE.md non toccato (fuori scope, solo segnalato).

### Terza ondata, stessa giornata — Via Vittoria cablata (6 piani)

Luca ha disegnato le 6 mappe di Via Vittoria (`1f`/`2f`/`3f`/`4f`/`5f`/`secret`) e ha piazzato dei
"dot" con nomi descrittivi per ogni collegamento/oggetto, chiedendo se riuscivo a interpretarli.
**Nessun test a schermo.**

- **6 mappe registrate** in `MAPPE` (`via_vittoria_1f/2f/3f/4f/5f/secret`, tutte `interno:true`) —
  tutti i tileset usati (Caves, Emerald_Outside, outside, Waterfall*, Sea) erano già registrati,
  nessuna aggiunta necessaria lì. **Nessun warp reale la collega ancora al mondo esterno**: il "mega
  percorso" post-Genzano che dovrebbe portarci non esiste — raggiungibile solo da console
  (`GameMap.vaiAMappa('via_vittoria_1f')`).
- **9 collegamenti bidirezionali cablati** leggendo i nomi dei dot di Luca: scritto un piccolo script
  Python dedicato (`strumenti/cabla_via_vittoria.py`) che, per ogni coppia, trasforma i due dot in
  warp reciproci e aggiunge un oggetto spawn nascosto nelle stesse coordinate di ciascuno (stesso
  schema già usato per porta+spawn di Ariccia e per le scale del Museo di Nemi — qui serviva farlo
  ×9). 1f↔2f (3 coppie, nomi che si corrispondevano uno a uno) e 1f↔secret (stanza di **Moltres**,
  lv60, oggetto `pokemon leggendario` impostato) erano inequivocabili. 1f↔3f, 3f↔4f, 4f↔5f invece
  avevano nomi ambigui (tutti dicevano genericamente "primo piano" invece di indicare il piano
  vero) — abbinati per esclusione/posizione e segnalati a Luca come "da verificare in game, se
  sono scambiati si invertono in un minuto".
- **Trigger MN sul 4° piano**: i due dot "masso forza"/"masso spaccaroccia" trasformati in oggetti
  reali (`masso` e `trigger_spaccaroccia`). Segnalato a Luca che i dot per Surf e Cascata non
  c'erano da nessuna parte nei 6 file (nonostante lui pensasse di averceli messi) — ha risposto
  "aggiungili poi ci penso io": aggiunti 2 rettangoli segnaposto sul **2° piano** (dove ci sono già i
  tileset Sea/Waterfall): `acqua_via_vittoria_surf` (tipo `acqua_surf`, 300×300 a 600,700) e
  `cascata_via_vittoria` (tipo `trigger_cascata`, 96×300 a 1000,700) — dimensioni/posizione a caso,
  Luca li ridimensiona/sposta sull'acqua vera.
- **2 punti lasciati intenzionalmente scollegati**: il dot "port per stanza uscita" su 1f (presumo
  l'ingresso/uscita verso il mondo esterno, percorso non ancora esistente) e "uscita finale" su 5f
  (presumo verso la Lega di Colonna — verificato che `Lega_pokemon.tmj` non ha ancora nessun oggetto
  eventi/spawn dentro, quindi non c'era nulla a cui collegarlo).
- **Segnalato, non toccato**: un oggetto orfano in `via vittoria_secret.tmj` (id 2, nessun nome,
  x=-469 — fuori dai limiti della mappa) sembra un residuo/duplicato lasciato per errore in Tiled.
- **Nota tecnica**: modificati solo i `.tmj` (quelli letti dal motore), i `.tmx` corrispondenti NON
  sono stati risincronizzati — se Luca li riapre in Tiled da adesso in poi, vanno ri-esportati con
  attenzione per non perdere questi collegamenti (stesso problema ricorrente già visto altre volte
  nel progetto con mappe .tmj/.tmx disallineate).

### Prossimo passo
1. **Test a schermo mai fatto** (accumulato su tutta la giornata): porta Ariccia, laboratorio, Museo
   di Nemi, Volo/Cascata/Sub dalle palestre, risfida allenatori, e ora tutta Via Vittoria (6 piani,
   9 collegamenti — verificare in particolare le 3 coppie ambigue 1f↔3f/3f↔4f/4f↔5f).
2. **Oggetti MN Cascata/Sub sul campo** (non solo il permesso): Luca deve ancora decidere dove.
3. **Surf/Cascata su Via Vittoria**: Luca deve ridimensionare/riposizionare i 2 rettangoli segnaposto
   sul 2° piano sull'acqua/cascata vera.
4. **Collegamento mondo esterno ↔ Via Vittoria** (1f) e **Via Vittoria ↔ Lega di Colonna** (5f):
   restano da fare quando le mappe di destinazione (mega percorso, entrata della Lega) esisteranno.
5. **Lotta in doppio**: da programmare come sessione a parte quando Luca vuole procedere.
6. Gate sulla porta del Rifugio GdF di Marino (3 parti password): resta da scrivere quando anche la
   3ª parte (Abbazia di San Nilo, non ancora costruita) esisterà.

---

## Sessione 11 agosto 2026 — Scambio tipi Rocca di Papa ↔ Albano + Genzano Fuoco

**Decisione di Luca**: tre cambi alla struttura delle 8 palestre.
- **Rocca di Papa**: tipo Roccia → **Lotta**, capopalestra **Rocco → Baso** (nome già presente nella
  narrativa CoTrAL come capopalestra assente, ora formalizzato come capopalestra vero), medaglia
  rinominata **Medaglia Lava → Medaglia Pigna**.
- **Albano Laziale**: tipo Lotta → **Roccia**, capopalestra **Massimo → Giorgia**, medaglia invariata
  (**Medaglia Scudo**).
- **Genzano**: tipo Folletto → **Fuoco**, capopalestra **Flora** (invariata), medaglia rinominata
  **Medaglia Infiorata → Medaglia Lava** (libera perché Rocca di Papa non è più Roccia). Narrativa:
  "la lava fa germogliare i fiori migliori".

**Scoperta chiave**: gli interni palestra di Rocca di Papa e Albano erano mappe Tiled vuote (0 oggetti
nel layer eventi) — mai popolate. Ne ho approfittato per costruirle da zero in questa sessione:
- Squadre scambiate e rilivellate: Baso eredita la vecchia squadra Lotta di Massimo (cap 40), Giorgia
  eredita la vecchia squadra Roccia di Rocco (cap 46). MT scambiate insieme (Baso dona mt06 Rissa
  Campale, Giorgia dona mt05 Slavina).
- 7 gregari + Baso piazzati in `pokemon-castelli-palestra_rocca_di_papa.tmj`, 8 gregari + Giorgia in
  `pokemon-castelli-palestra_albano.tmj` (nuove entry in `dati/trainer.js`), con warp di ritorno e
  spawn coerenti; mappe registrate in `js/map.js` (`interno_palestra_rocco`, `palestra_albano_interno`).
- "Sfida dei Parenti di Rocco" (Via dei Laghi, 5 lottatori Roccia/Terra) lasciata invariata nelle
  squadre (hobby di famiglia legato al Monte Cavo, non al tipo della palestra di Baso): solo i dialoghi
  che nominano "Rocco" sono diventati "Baso". Chiavi tecniche/flag interni **non rinominati** (invisibili
  al giocatore, per non rompere riferimenti incrociati map.js/app.js/trainer.js).
- Genzano: squadra di Flora e dei 10 gregari passata da Folletto a Fuoco, dialoghi riscritti mantenendo
  il tema Infiorata. Interno palestra di Genzano **non esiste ancora su Tiled** (fuori scope, resta un
  gap noto per una sessione futura).
- Aggiornati CLAUDE.md, STORIA_COMPLETA.md, STATO-PROGETTO.md con i nuovi tipi/nomi/medaglie. **Non
  toccata** la questione narrativa Camilla/Flora per Genzano in BIBBIA-NARRATIVA.md/STATO-PROGETTO.md
  (discrepanza preesistente, fuori scope di questa sessione — vedi `docs/TODO.md` se va risolta).

**Da testare a runtime** (non ancora ripercorso a mano in game):
- Rocca di Papa: sconfiggere i 7 gregari + Baso, verificare Medaglia Pigna + MT06 + cap 40.
- Albano: sconfiggere gli 8 gregari + Giorgia, verificare Medaglia Scudo + MT05 + cap 46.
- Posizioni dei trainer nelle due mappe interne sono state stimate leggendo la griglia tile via script
  (nessuna collisione esplicita nel layer `collisioni`, vuoto in entrambe le mappe) — verificare in
  Tiled/gioco che nessun trainer sia finito sopra un muro decorativo e spostarli se serve.

**Aggiornamento stessa sessione**: Luca ha nel frattempo disegnato anche gli interni di Ariccia e
Genzano su Tiled (vuoti, come Rocca di Papa/Albano prima). Popolati anche questi:
- **Genzano**: interno completo (10 gregari + Flora), porta città→palestra aggiunta (l'edificio
  esterno era già disegnato sulla mappa città, riconosciuto via tile grafico), spawn di ritorno
  aggiunto, mappa registrata come `palestra_genzano_interno`. Nuove entry in `dati/trainer.js`.
- **Ariccia**: interno completo (9 gregari + Ombretta), nuove entry in `dati/trainer.js`, mappa
  registrata come `palestra_ariccia_interno`. **La porta in città NON è stata aggiunta**: l'edificio
  esterno della palestra non è ancora disegnato su `Ariccia.tmj` (verificato: nessun tile della
  palestra presente) — raggiungibile solo da console finché Luca non disegna l'edificio e mi dice
  dove piazzarlo.
- **Bug trovato e risolto**: l'interno di Ariccia usa 3 tileset nuovi (`palestre.tsj/2/3`, aggiunti da
  Luca) mai registrati in `js/map.js` → la stanza risultava completamente nera in game. Registrati
  (`ts-palestre`, `ts-palestre2`, `ts-palestre3`) puntando a `sprites/nuovi tileset/palestre*.png|jpeg`.
  Verificato in browser: ora la stanza si vede correttamente (pietra scura, torce viola).
- Nota a parte (non toccata, fuori scope): esiste un warning pre-esistente e scollegato "Tileset
  sconosciuto: automap-tiles" per Lago di Nemi/Marino — non è stato causato da questa sessione.

**Aggiornamento stessa sessione — due fix indipendenti**:
- **Ghiaccio scivoloso (Monte Cavo)**: bug corretto. Durante lo scivolamento l'input manuale poteva
  interrompere/reindirizzare il movimento (nessun blocco dedicato). Aggiunto flag `scivolandoGhiaccio`
  in `js/map.js`: mentre è attivo il giocatore prosegue da solo nella direzione presa finché non sbatte
  contro un ostacolo, esattamente come nei giochi originali. Da testare a mano in game.
- **Compatibilità Pokémon↔MT**: prima qualunque Pokémon poteva imparare qualunque MT. Creato
  `dati/mt_compatibilita.js` (generato da `Essentials FRLG/PBS/pokemon.txt`, campo `TutorMoves` —
  740 mosse × 386 specie, ID↔nome specie risolto via PokéAPI dato che l'ordine del file PBS NON segue
  il Pokédex nazionale), collegato in `index.html` e controllato in `js/app.js` (`usaOggettoSu`,
  categoria `'mt'`): se la specie non può imparare la mossa, l'MT non si consuma e appare un toast.
  Verificato via script (Magikarp/Ditto quasi a zero, Charizard impara Flamethrower, Bulbasaur no, ecc.)
  — logica coerente coi giochi originali.

**Mappe della Lega di Colonna (F12, in costruzione da Luca)**: registrate `lega_pokemon` e
`lega_pokemon_4f` in `MAPPE` (`js/map.js`), più i tileset nuovi che usano (`lega`, `interni_lega_2`,
`interno lega acc/psico`, `lega_acc_psico`, `rifugi nemici 3`, `RIFUGIO`) — nessuno era registrato,
altrimenti sarebbero apparse nere come Ariccia. **Nessun warp reale collega ancora queste mappe al
mondo** (previsto: sono piani in costruzione, non ancora vicino a dove il giocatore arriva in storia).
Si testano da console: `GameMap.vaiAMappa('lega_pokemon')` / `GameMap.vaiAMappa('lega_pokemon_4f')`.
Se Luca aggiunge altri piani, vanno registrati allo stesso modo (un minuto a mappa).

**Preparazione GitHub Pages (F13, non ancora pubblicato su richiesta di Luca — "aspettiamo")**:
verificato che il gioco è interamente statico (`server.js` è solo un file server, nessuna logica
server-side) e quindi compatibile con GitHub Pages. Controllo di compatibilità Windows→Linux (case
sensitivity) fatto: nessun mismatch di maiuscole/minuscole negli sprite NPC/allenatori (94 controllati)
né nei tileset (25 controllati), **tranne un gap preesistente e non causato da questa sessione**:
`laboratorio_interno.png` (interno del laboratorio del Prof. Castagno) è referenziato dal tileset ma
il file non esiste da nessuna parte nel progetto, nemmeno nella cronologia git — quella stanza risulterà
senza texture finché Luca non lo ritrova/ricrea. `.gitignore` già pronto per il deploy; esiste già un
remote GitHub (`github.com/monacellilu-hash/pokemon-castelli.git`) collegato al progetto. **Export/
import salvataggio e supporto mobile (viewport) erano già implementati prima di questa sessione** —
nessuna azione necessaria lì.

### Prossimo passo
1. Test in browser delle quattro palestre, dello scivolamento sul ghiaccio, dell'insegnamento MT
   (prova a insegnare una mossa "sbagliata" a un Pokémon e verifica il rifiuto), e delle mappe Lega
   (solo da console per ora).
2. Ariccia: Luca deve disegnare l'edificio esterno della palestra su `Ariccia.tmj` e dirmi dove
   piazzare la porta (io la registro).
3. `laboratorio_interno.png` mancante (vedi sopra) — da ritrovare/ricreare quando Luca vuole.
4. Pubblicazione GitHub Pages: pronta quando Luca dà il via libera (ha già account+repo, manca solo
   il push + attivazione Pages nelle impostazioni del repo).

---

## Sessione 10 agosto 2026 (seconda parte) — Fix Lago di Nemi "sballato" + censimento reale del progetto

**Bug trovato e corretto**: Lago di Nemi appariva rotto/disallineato in gioco. Causa: `js/clusters.js`
(file generato, letto a runtime) aveva ancora `lago_nemi: { w: 45, h: 70 }`, mentre la mappa reale
(`Lago di Nemi.tmj`) è **66×109** tile. Il file `.world` (`Castelli_lakes.world`) in realtà aveva già
le dimensioni corrette (2112×3488px = 66×109 tile) — probabilmente ri-salvato in Tiled in una sessione
precedente — ma `js/clusters.js` non era mai stato rigenerato dopo quel salvataggio, quindi il motore
continuava a posizionare Nemi nel cluster `Castelli_lakes` con un offset calcolato sulla misura
sbagliata: da qui lo sballamento visivo rispetto a Marino/Lago di Albano/Via dei Laghi/Castel
Gandolfo/Percorso 4-5, tutte mappe agganciate allo stesso cluster.
**Fix**: rigenerato `js/clusters.js` con `python strumenti/genera_clusters.py` (nessun altro warning di
allineamento nei rimanenti cluster). Controllato anche gli altri `.world` del progetto: un'unica altra
stalezza trovata, in `FrascatiGrotta.world` per `Filler Frascati1.tmx` — **non toccata**, perché quella
mappa non è registrata in `MAPPE` (non raggiungibile in gioco, verosimilmente uno scarto).
Da verificare a schermo: Nemi ora allineata alle mappe vicine nel cluster.

### Censimento reale: cosa esiste DAVVERO sul motore Tiled (F14) oggi

Il progetto ha uno strato di narrativa/documentazione molto più avanti del motore Tiled attuale: molte
funzioni "Via Vittoria/Lega/leggendari" **esistono nel codice** ma sono state scritte per il vecchio
motore a coordinate lat/lon (pre-F14) e oggi sono **codice morto**, perché `alPasso()` in `js/app.js`
esce subito con `if (MAPPA_TILED) return;` prima di raggiungerle. Vanno riscritte da zero sul motore a
tile (stesso pattern di Suicune/Latios-Latias/Articuno, che invece SONO stati portati). Elenco preciso
in fondo a questa sessione, sotto "Prossimo passo".

### Prossimo passo
1. Testare in browser il flusso completo della Pensione (deposito, uovo, ritiro, schiusa) — vedi
   sessione precedente.
2. Verificare a schermo che Lago di Nemi sia ora allineata correttamente nel cluster.
3. Vedi il censimento completo mappe/eventi/cutscene mancanti condiviso con Luca in chat in questa
   sessione (Via Vittoria, Colonna/Lega, Bunkerino, Grotta del Vulcano, Villa Aldobrandini, Museo delle
   Navi, dungeon di Ho-Oh, stazione per Lugia — nessuno di questi esiste ancora su Tiled; Zapdos/Ho-Oh/
   Lugia/Museo Navi/Villa Aldobrandini hanno già la logica scritta ma solo nel vecchio motore lat/lon,
   da riportare su tile).

---

## Sessione 10 agosto 2026 — Pensione Pokémon a Nemi (F9.3)

Implementata la logica completa della Pensione Pokémon richiesta da Luca, agganciata all'NPC
`pensione_nemi` piazzato accanto al cartello "Pensione Pokémon" già presente su `Lago di Nemi.tmj/.tmx`.

- **Sesso dei Pokémon** (campo nuovo, non esisteva prima): `Battle.creaIstanza` ora assegna
  `genere: 'M'|'F'|'N'` ad ogni Pokémon creato (50/50, tranne una lista di specie asessuate —
  leggendari + Magnemite/Voltorb/Staryu/Ditto/Porygon). I salvataggi vecchi vengono migrati al
  caricamento (`caricaPartita`, tramite `Battle.generaGenere`).
- **Risoluzione specie base**: `Battle.trovaSpecieBase(id)` risale `EVOLUZIONI_DB` al contrario fino
  allo stadio 1, usata per decidere quale "cucciolo" nasce da una coppia.
- **Stato**: `stato.pensione = { slot1, slot2, passiInsieme, uovoPronto }` (nuovo campo di `stato`,
  con migrazione per i salvataggi vecchi).
- **Compatibilità** (`pensioneCompatibili`, `js/app.js`): maschio+femmina della stessa specie base,
  oppure Ditto + qualunque altra specie non asessuata. Due Ditto o due asessuati: niente.
- **Passi**: agganciato ad `alPasso()` (chiamato ad ogni passo sia dal motore Tiled sia dal vecchio
  motore, quindi vale ovunque). `aggiornaPensione()` fa avanzare `passiInsieme` quando 2 Pokémon
  compatibili sono depositati (150 passi → uovo pronto, da ritirare parlando all'NPC).
  `aggiornaUova()` fa avanzare la schiusa di un uovo eventualmente in squadra (80 passi), poi lo
  sostituisce con `Battle.creaIstanza(speciePadre, 5)`.
- **Uovo in squadra**: oggetto con `uovo:true`, HP fissi a 0/0 **di proposito** — lo esclude sempre
  dalla logica di battaglia (mai selezionato come attivo, mai contato come "vivo") anche dopo una
  cura completa al Centro Pokémon. UI dedicata in `renderSquadra`/`renderDettagli` (mostra passi alla
  schiusa invece di stats/mosse) ed escluso da `renderScegliBersaglio` (non può ricevere oggetti).
  Può comunque essere depositato/ritirato dal Box (la schiusa si ferma nel Box, come nei giochi veri).
- **NPC** `interagisciPensione()` + `depositaPensione()`/`ritiraPensione()`: menu a scelta multipla
  (`mostraSceltaLista`), richiede sempre almeno 1 Pokémon libero in squadra per depositarne un altro.

**Non testato a schermo in questa sessione** (niente browser disponibile) — solo `node --check` sui
file JS e validazione JSON/XML su `.tmj`/`.tmx`. Da verificare al prossimo avvio: comparsa dell'NPC a
Nemi, deposito/ritiro, generazione e ritiro dell'uovo, schiusa dopo i passi, che l'uovo non causi
problemi in una battaglia (es. il gioco non lo scelga mai come Pokémon attivo).

### Prossimo passo
1. Testare in browser il flusso completo della Pensione (deposito, uovo, ritiro, schiusa).
2. Riprendere gli altri punti aperti di sessione (cutscene boss 2F_B GdF, aggiornamento Genzano,
   4 riferimenti oggetto ambigui, `.world` di Lago di Nemi da risalvare in Tiled) — vedi `docs/TODO.md`.

---

## Sessione 8 agosto 2026 (settima parte) — Bugfix MODALITA_TEST/gate, 5 trainer Monte Cavo, 5 villici liberati, nota Abate per il futuro

Continuazione a caldo. Luca ha chiesto conferma che tutte le cutscene di Rocca di Papa/Monte Cavo
fossero davvero attive: **trovato e corretto un bug reale** prima di qualunque test a schermo.
**Ancora nessun test end-to-end nel browser** — Luca lo farà appena torna.

- **Bug critico corretto**: il bypass "i gate non bloccano in MODALITA_TEST" (richiesto in una
  sessione precedente) si applicava anche al cerchio NPC di Rocca di Papa e ai suoi 2 gate nuovi,
  perché usano lo stesso meccanismo `gate:true`. Con `MODALITA_TEST=true` (attivo di default) l'intero
  cerchio — npc1 incluso — sarebbe sparito FIN DALL'INIZIO, rendendo la cutscene "Baso è via"
  impossibile da testare (npc1 non ci sarebbe mai stato). Aggiunta una nuova proprietà opt-out
  `noTestBypass:true` (`js/map.js`, funzione che crea gli NPC): i gate con questa proprietà restano
  soggetti alla condizione VERA anche in test. Applicata ai 15 oggetti della scena (cerchio + npc1 +
  i 2 gate) in `rocca_di_papa.tmj`/`.tmx`. Gli altri gate del gioco (Via dei Laghi "lavori in corso",
  Abbazia, Grotta del Vulcano) restano bypassati in test come richiesto in origine.
- **5 allenatori aggiunti a Monte Cavo** (`monte_cavo_1..5`, Lv 58-62, dati in `dati/trainer.js`,
  posizioni segnaposto lungo la salita verso Articuno) — mancavano dalla sessione precedente (solo il
  miniboss era stato piazzato). **Trovato che Luca aveva già ripiazzato a mano miniboss/oggetti/warp**
  su Monte Cavo dalla sessione precedente (coordinate diverse da quelle segnaposto originali): non
  toccati, i 5 nuovi trainer piazzati altrove per non sovrapporsi.
- **Da 2 a 5 villici liberati** a Rocca di Papa (dopo `baso_tornato`): usano gli stessi sprite del
  cerchio (NPC 60/61) così si riconoscono come "la stessa gente" di prima, come richiesto.
- **Nota importante per la prossima sessione (da Luca)**: il trigger di `baso_tornato` oggi è
  provvisorio — è agganciato alla sconfitta dei 2 grunt CoTrAL su `collegamento_Cotral`. In realtà
  Luca costruirà lì un vero dungeon con un boss chiamato **Abate**: sarà LUI a far scattare
  `baso_tornato` quando verrà sconfitto, non i 2 grunt attuali. **Segnato anche in
  `docs/TODO.md`** (sezione "Nascondiglio CoTrAL ai piedi di Monte Cavo") — quando il dungeon esiste,
  spostare il trigger dall'`onFine` dei grunt a quello di Abate (stesso pattern `speciale:true`).

### Prossimo passo
1. **Testare tutto** appena possibile: in particolare che il cerchio/npc1 siano visibili in
   MODALITA_TEST dopo il fix, tutta la cutscene, i 5 trainer nuovi di Monte Cavo, i 5 villici liberati.
2. Quando Luca disegna il dungeon di collegamento_Cotral con Abate: spostare il trigger
   `baso_tornato` (oggi sui 2 grunt, `js/map.js` intorno alla riga 4440) sulla sconfitta di Abate.
3. Resta valido tutto il resto della sessione precedente (ghiaccio scivoloso mai testato, MT generate
   in inglese da tradurre quando servirà, ecc. — vedi sezione sotto).

---

## Sessione 8 agosto 2026 (sesta parte) — Cutscene "Baso è via" a Rocca di Papa, Monte Cavo/Articuno/miniboss, ghiaccio scivoloso, MT per tutte le mosse

Sessione grande, su specifica dettagliata dell'utente. Prima scritto un documento di design
(`docs/CUTSCENE-ROCCA-PAPA-MONTECAVO.md`) per farlo rivedere/correggere PRIMA di implementare (come
richiesto esplicitamente), poi eseguita l'implementazione completa dopo le correzioni ricevute.
**Nessun test end-to-end nel browser** (solo `node --check`, parser JSON/XML, cluster senza warning,
smoke test HTTP 200) — priorità assoluta per la prossima sessione, in particolare la cutscene intera
e lo scivolamento sul ghiaccio, mai visti a schermo.

- **MN Forza spostata**: non più da Remo a Monte Porzio (rimosso il blocco in `js/map.js`), ora la dà
  `rocca_npc1` a Rocca di Papa, seconda parte della cutscene "Baso è via" (vedi sotto).
- **Bug corretto durante l'esplorazione**: 11 cloni dell'NPC "rocca_npc2" (il cerchio di abitanti)
  avevano tutti lo stesso id Tiled — rinominati `rocca_npc2_1..12`, e orientati (calcolato dalle
  coordinate) verso il centro del cerchio come richiesto.
- **Cutscene "Baso è via" (Rocca di Papa)**: nuovo trigger di prossimità (`_checkRoccaBasoTrigger`,
  come il pattern già esistente di Latios/Latias) — scatta solo avvicinandosi davvero alla piazza,
  non appena entri in città. Prima parte (`dati/cutscene.js`, 'rocca_papa_baso_via'): 3 battute del
  cerchio, `rocca_npc1` nota il giocatore (nuovo passo cutscene `esclamativo` — vignetta bianca "!"
  sopra la testa, Phaser puro, nessun asset nuovo), lo raggiunge (`muovi_npc_verso_giocatore`, già
  esistente ma mai documentato — sistemato l'header di `dati/cutscene.js`), poi entrambi si girano
  l'uno verso l'altro (nuovo passo `guarda_reciproco`, calcola la direzione dalle coordinate reali,
  non fissa). Seconda parte: riparlando con npc1 (`interagisciRoccaNpc1`, `js/app.js`), racconta il
  rapimento di Gianluca e dona la MN Forza.
- **Trigger di sblocco reale**: quando ENTRAMBI i grunt CoTrAL di `collegamento_Cotral` sono sconfitti,
  si alza `stato.flags.baso_tornato` (agganciato nell'`onFine` esistente della lotta, `js/map.js`) — la
  scena "si trova davvero Baso lì" resta da costruire (detto esplicitamente dall'utente, non in scope
  oggi). Quel flag pilota TUTTO il resto: il cerchio (`gate:true`) sparisce, 2 nuovi villici liberi
  compaiono ("Hai salvato Gianluca, sei un grande!"), i due gate (palestra "Baso non c'è, non vedi che
  sta succedendo?" e casa di Gianluca "Qui non c'è più nessuno per far funzionare questo aggeggio")
  spariscono, Gianluca compare sul suo dot.
- **Gianluca liberato**: primo dialogo di ringraziamento una tantum, poi scelta Sì/No ("Vuoi salire in
  cima?") che teletrasporta direttamente a Monte Cavo — **nessun warp calpestabile per la salita**,
  come confermato. La discesa invece è un warp normale piazzato su Monte Cavo.
- **Rocca di Papa collegata**: warp+spawn verso Percorso 11 (mancava), verso una futura "Grotta del
  Vulcano" (placeholder, la mappa non esiste ancora — stesso trattamento già usato per
  `nascondiglio_cotral`). Tutto piazzato al centro mappa, posizioni segnaposto come richiesto.
- **Monte Cavo registrata** (`js/map.js` MAPPE, `tema: 'icecave'` → sempre giorno, gratis dal sistema
  esistente): **Articuno** (lv55, oggetto `pokemon leggendario` sul dot già presente) e un **miniboss**
  (squadra Ghiaccio/Fuoco/Roccia, lv 36-39 — media tra il cap di Monte Porzio e quello di Rocca di
  Papa, come richiesto — dialoghi pre/post lotta scritti, `curaDopoLotta: true` **nuovo**, applicato
  SOLO a questo trainer specifico, non generalizzato ad altri). Aggiunto anche un layer collisioni
  vuoto (non esisteva) — Luca disegna i muri veri.
  **Corretto un refuso di Luca**: il layer tile "edfici" → rinominato "edifici" (altrimenti il motore
  non lo riconosceva per la profondità di disegno corretta).
- **Ghiaccio scivoloso** (Caves.tsj, tile locale 944): nuova meccanica in `_sposta` (`js/map.js`) — il
  giocatore continua a scivolare da solo nella stessa direzione finché non trova un ostacolo o un tile
  non ghiacciato, poi si ferma. Tile 983/965 (sempre Caves.tsj) aggiunti come collisione fissa, stesso
  principio già usato per il sasso (tile 1213). **Limite noto non risolto**: durante lo scivolamento
  automatico l'input da tastiera non è bloccato — un tasto premuto a metà scivolata potrebbe interferire;
  da verificare/sistemare al primo test vero.
- **Tileset Snow Tiles registrato** (`TILESET_META`/`TILESET_IMMAGINI`, `js/map.js`) — 256×288px,
  niente split necessario.
- **Oggetti Monte Cavo**: nuova MT Gelo Raggio/Ice Beam (`mt_gelo_raggio`, trovabile sul campo, non
  donata da palestra). Per l'oggetto da tenere "Gelomai": **trovato che esisteva già** un item
  identico funzionalmente (`ghiaccio_perenne`, +danno mosse Ghiaccio) — rinominato il suo `nome`
  visualizzato in "Gelomai" (nome italiano ufficiale di NeverMeltIce) invece di crearne uno duplicato.
  Entrambi piazzati su Monte Cavo (posizioni segnaposto).
- **MT per TUTTE le mosse del sistema** (richiesta esplicita): nuovo script
  `strumenti/genera_mt_tutte_mosse.py` legge `Essentials FRLG/PBS/moves.txt` (740 mosse) e genera
  `dati/mt_tutte_mosse.js` (nuovo file, caricato in `index.html` prima di `js/data.js`) — una MT
  "trovabile sul campo" per ognuna, merged in `OGGETTI` solo dove la chiave non esiste già (le MT
  scritte a mano restano quelle con nome/descrizione in italiano). **Nota**: le 740 mosse generate
  hanno `nome` ancora in INGLESE (nessuna traduzione automatica affidabile) — da tradurre una per una
  quando/se verranno davvero piazzate o donate, come già specificato "non le daremo tutte".
- **File nuovi**: `docs/CUTSCENE-ROCCA-PAPA-MONTECAVO.md` (documento di design), `dati/mt_tutte_mosse.js`
  (generato), `strumenti/genera_mt_tutte_mosse.py`, `strumenti/tmj_a_tmx.py` (convertitore riusabile,
  serviva per rigenerare i `.tmx` di Rocca di Papa/Monte Cavo dopo le modifiche massicce).

### Prossimo passo
1. **Test end-to-end mai fatto**: l'intera cutscene di Rocca di Papa (trigger di prossimità, npc1 che
   raggiunge il giocatore, orientamento reciproco, dono MN Forza, i due gate, sblocco battendo i 2
   grunt CoTrAL), Monte Cavo (Articuno, miniboss, cura automatica solo lì), lo scivolamento sul
   ghiaccio (priorità alta, mai visto a schermo, rischio di bug di collisione con l'input da tastiera
   durante la scivolata).
2. Costruire la scena "si trova davvero Baso sul posto" a `collegamento_Cotral` quando si sconfiggono
   i 2 grunt CoTrAL (oggi scatta solo il flag `baso_tornato`, nessuna scena vera) — detto esplicitamente
   dall'utente come lavoro futuro, non di questa sessione.
3. Luca disegna: i muri veri (collisioni) di Monte Cavo, posiziona meglio tutti gli oggetti/NPC/warp
   segnaposto di questa sessione (tutti piazzati "al centro", da spostare).
4. Tradurre in italiano le MT generate in `dati/mt_tutte_mosse.js` quando una di esse verrà davvero
   piazzata o donata da una palestra futura (oggi hanno nome inglese, provvisorio).

---

## Sessione 8 agosto 2026 (quinta parte) — Ricostruzione da zero di tutti i Pokécenter, 12 allenatori Percorso 12, 2 massi Forza

Luca ha eliminato dalla cartella tutti i file `Pokemon_center_*` **tranne** quello di Borgata
Tuscolana (l'unico rifinito per bene in sessione precedente: sfondi, spawn ricalibrato, oggetto
box_pc), segnalando che gli altri non erano aggiornati. Richiesta: ricostruirli tutti da zero usando
quel file come unico template. Inoltre: conteggio allenatori/oggetti del gioco, verifica se l'EXP
disponibile basta a raggiungere i level cap, 12 allenatori su Percorso 12, 2 nuovi massi Forza
(Via dei Laghi, Lago di Nemi). **Nessun test end-to-end nel browser** (solo `node --check`, parser
JSON/XML, cluster senza warning, smoke test HTTP 200).

- **9 Pokécenter ricreati da zero** (Frascati, Grottaferrata, Marino, Castel Gandolfo, Monte Porzio,
  Rocca di Papa, Albano, Ariccia, Genzano): clonati dal template di
  `pokemon-castelli-Pokemon_center_Borgata_tuscolana.tmj` (tileset `Poke Centre interior.tsx`, 12×10,
  `npc_joy`+`pc_box`+uscita generica+spawn — diverso e più semplice del vecchio template
  `Pokemon Centre general` usato finora, che a quanto pare l'utente considerava superato). Spawn id
  impostato per ciascuna città in base a cosa si aspetta la porta sulla mappa cittadina (letto da ogni
  `.tmj`, non indovinato): `da_frascati_centro`, `grottaferrata`, `da_marino`, `da_castel_gandolfo`,
  `da_monteporzio`, `da_rocca_di_papa_pc`, `da_albano`, `da_ariccia_pc`, `da_genzano_pc`.
  **`mercante_scambi` riaggiunto solo da Marino in poi** (Marino/Castel Gandolfo/Monte
  Porzio/Rocca di Papa/Albano/Ariccia/Genzano), coerente con la regola già documentata in sessione
  precedente (non presente a Frascati/Grottaferrata). Riaggiunti anche i 4 avventori di contorno
  (Grottaferrata/Marino/Rocca di Papa/Genzano) già scritti in `dati/npc.js` nella parte precedente
  della sessione, che altrimenti sarebbero rimasti orfani (dati esistenti, nessun oggetto Tiled a
  puntarli).
  **Bug trovato e corretto**: la porta del Pokécenter di Marino puntava ancora all'alias vecchio
  `interno_pokecenter` (quello condiviso con Frascati) invece che a `pokecenter_marino` — non
  sarebbe mai arrivata al file nuovo. Corretto in `marino.tmj`/`.tmx`.
- **Conteggio allenatori**: 202 voci in `dati/trainer.js`, ~196 già piazzate su una mappa prima di
  oggi (+12 di Percorso 12 = ~208 ora). Trovati e segnalati (non corretti, fuori scope):
  19 allenatori mai piazzati (7 di Rocca di Papa/Rocco in attesa dell'interno palestra, 6 `all-p2-*`),
  13 piazzati ma senza dati (`all-fg-1..6`, `trainer_1..6`, `trainer albano 1` — romperebbero la lotta
  se il giocatore ci parla), 9 id duplicati su più mappe (es. `all-gm-3/4/5` su Castel Gandolfo E
  Percorso 3).
- **Conteggio oggetti**: 87 oggetti a terra piazzati (~98 unità contando le quantità).
- **Stima EXP vs level cap**: calcolo approssimativo (baseExp medio stimato 120, dato reale da
  PokéAPI non disponibile offline) con la formula reale del gioco (`baseExp*livello/5`, ×1.5
  allenatori, +50%/medaglia). Risultato: l'EXP ottenibile affrontando una sola volta tutti gli
  allenatori di ogni tratto copre dal 390% al 1500% di quella necessaria per un Pokémon dal cap
  precedente al successivo — margine ampio anche spalmato su più Pokémon in squadra, incontri
  selvatici esclusi (illimitati). **Non servono altri allenatori per l'EXP.**
- **12 allenatori su Percorso 12** (`all-p12-1..12`, Lv 58-62, gated a 8 Medaglie insieme al resto
  della mappa — coerente con l'avvicinamento a Via Vittoria/Lega 60-66): dati in `dati/trainer.js`,
  posizioni segnaposto sparse sulla mappa (evitando il gruppo di massi/spaccaroccia che Luca ha
  duplicato nel frattempo). **Scoperto e gestito**: il `.tmx` di Percorso 12 era stato ri-esportato da
  Luca (massi Forza e Spaccaroccia duplicati ×5 in un vero puzzle, oggetti rinumerati) da quando
  l'avevo cablata la prima volta — rigenerato `.tmj` dal `.tmx` più recente prima di aggiungere i 12
  trainer, per non perdere il lavoro di Luca (stesso problema già capitato in questa sessione, vedi
  parte precedente).
- **2 nuovi massi Forza convertiti**: Luca ne aveva aggiunti uno a Via dei Laghi e uno a Lago di Nemi
  (`masso_p5_1` su entrambe, stesso nome — non è un conflitto, la persistenza è per mappa) ma nel
  formato vecchio `trigger_forza` (ignorato dal motore dalla sessione 6 agosto). Convertiti in oggetti
  `masso` veri su `.tmj` e `.tmx` di entrambe le mappe.

### Prossimo passo
1. **Test end-to-end mai fatto**: tutti e 9 i Pokécenter ricostruiti (cura squadra, Box PC, uscita,
   mercante_scambi dove presente), i 12 allenatori di Percorso 12, i due nuovi massi Forza.
2. Se vuoi, sistemare i bug allenatori trovati (13 senza dati, 9 duplicati, 19 mai piazzati) — solo
   segnalati questa sessione, non toccati.
3. Verificare a vista se il calcolo EXP approssimativo (baseExp stimato, non reale) regge anche
   giocando per davvero — è una stima, non una certezza.

---

## Sessione 8 agosto 2026 (quarta parte) — Percorso 12, gate "lavori in corso", cartelli segnaletici, popup nome mappa

Continuazione a caldo della terza parte: Luca ha disegnato una nuova mappa (Percorso 12, confina con
Genzano) e ha chiesto di collegarla a Via dei Laghi con un varco temporaneo, di aggiungere cartelli
segnaletici lungo i percorsi, e un popup UI col nome della mappa al cambio schermata. **Nessun test
end-to-end nel browser** (solo `node --check`, parser JSON/XML, cluster senza warning, smoke test
HTTP 200).

- **Percorso_12 creata da zero nel motore**: esisteva solo il `.tmx` di Luca (mai esportato in
  `.tmj`), generato con lo stesso script Python di conversione usato nella parte precedente della
  sessione. Registrata in `MAPPE` (`js/map.js`): confina con Genzano nel world `Castelli_lasthree`
  (si cammina in continuo, bordo ovest di Genzano — verificato dal cluster rigenerato) ed è collegata
  a Via dei Laghi (world `Castelli_lakes`, diverso: warp con dissolvenza, non camminata continua).
  Warp e spawn piazzati **al centro di entrambe le mappe** (come richiesto — posizioni segnaposto,
  Luca le sposta lui in Tiled).
- **Gate "lavori in corso" lato Via dei Laghi**: nuovo NPC solido (`npc_gate_percorso_12`,
  `dati/npc.js`) davanti al warp verso Percorso 12, dialogo "🚧 Lavori in corso, non si passa!" e
  basta — blocca il passaggio semplicemente stando lì (gli NPC sono già solidi di default), nessuna
  condizione/flag. **Nota per Luca**: la posizione esatta rispetto al terreno vero non è verificata
  (non so se il corridoio è abbastanza stretto lì) — se il giocatore riesce ad aggirarlo, spostalo tu
  in Tiled più a ridosso del varco.
- **Percorso_12: trigger Taglio + Spaccaroccia + masso Forza segnaposto**, come richiesto — un solo
  esemplare di ciascuno, Luca li duplica/posiziona lui.
- **Cartelli segnaletici** (tipo Tiled `cartello`, già esistente nel motore — nessun codice toccato,
  solo proprietà `testo` sull'oggetto): aggiunto un cartello per percorso che accenna alla città a cui
  porta — Percorso 3 → Marino ("la città del vino"), Percorso 4 → Monte Porzio, Percorso 5 → Rocca di
  Papa, Percorso 7 → Albano, Percorso 9 → Ariccia, Percorso 10 → Genzano ("patria dell'Infiorata"),
  Percorso 11 → Rocca di Papa (via Monte Cavo), Percorso 12 → Via dei Laghi. Solo un primo giro
  (richiesta "iniziamo"): altri percorsi restano senza cartelli per ora.
- **Popup nome mappa** (nuovo, angolo alto-sinistra, al cambio mappa): `#popup-nome-mappa` in
  `index.html`/`style.css`, funzione `mostraNomeMappa()` in `js/app.js` (stesso pattern del toast, 2.5s
  poi sparisce), chiamata da `GameMap.caricaMappa()` a fine caricamento (sia mappa singola che
  cluster). Il nome mostrato **non è mai il file grezzo**: nuova `nomeVisualizzatoMappa()` in
  `js/map.js` usa `MAPPA_COMUNE` quando esiste (es. `borgata_tuscolana` → "Borgata Tuscolana"),
  altrimenti ripulisce la chiave del registro (`percorso_10` → "Percorso 10"), con casi speciali per
  Centro Pokémon/Mercato/Palestra (`pokecenter_ariccia` → "Centro Pokémon Ariccia" invece di
  "Pokecenter Ariccia"). **Nota**: il popup condivide l'angolo con l'HUD esistente (soldi/squadra),
  ci si sovrappone per i 2.5 secondi in cui è visibile (z-index più alto, poi sparisce e l'HUD torna
  visibile) — se a schermo risulta brutto, si può spostare.
- Spaccaroccia triplicato su Percorso_11 (segnalato nella parte precedente): confermato da Luca,
  spostato/riusato apposta — nessuna azione necessaria.

### Prossimo passo
1. **Test end-to-end mai fatto**: Percorso 12 (warp verso/da Via dei Laghi, gate NPC, taglio/
   spaccaroccia/masso), tutti i cartelli nuovi, il popup nome mappa (aspetto, sovrapposizione con
   HUD, tutti i casi speciali pokecenter/mart/palestra).
2. Verificare che il gate NPC blocchi davvero il passaggio (non solo il warp) una volta che Luca ha
   sistemato il terreno vero di Via dei Laghi in quel punto.
3. Continuare i cartelli segnaletici sui percorsi ancora senza (richiesta esplicita "iniziamo", non
   un giro completo).

---

## Sessione 8 agosto 2026 (terza parte) — Percorso 10/11, collegamento_Cotral, Genzano cablati; Pokécenter di Grottaferrata e Genzano; oggetti a terra

Continuazione a caldo della stessa giornata. L'utente ha confermato che l'uscita dagli interni dopo
salvataggio funziona (bug critico sessione precedente verificato buono). Richiesta: registrare le 4
mappe ancora fuori dal motore, aggiungere zone incontri sui percorsi nuovi, iniziare a piazzare
oggetti raccoglibili nel mondo, dare a Genzano market/pokecenter/warp (palestra rimandata: Luca la
disegna, poi si decide Camilla), rigenerare tutti i Pokécenter variandoli con qualche NPC in più.
**Nessun test end-to-end nel browser in questa sessione** (solo `node --check`, parser JSON/XML,
`genera_clusters.py` senza warning, smoke test HTTP 200 su tutti i file toccati) — verificare a
schermo alla prossima occasione, in particolare Genzano (mai esistita nel motore prima d'ora).

- **Bug "id palestra Monte Porzio disallineato" (TODO.md/STATO-PROGETTO.md) — già risolto**: verificato
  che `dati/trainer.js` usa già `'gym_leader_palestra monteporzio'` (senza trattino), identico all'id
  Tiled. Probabilmente sistemato in una sessione precedente senza aggiornare la nota. Corretto
  `docs/TODO.md` per toglierlo dalla lista bug aperti.
- **Percorso_10, Percorso_11, collegamento_Cotral, Genzano registrate in `MAPPE`** (`js/map.js`):
  esistevano come file ma non erano mai state cablate nel motore. Cluster rigenerati
  (`strumenti/genera_clusters.py`): Percorso_10/Genzano ora si camminano in continuo da Ariccia
  (world `Castelli_lasthree`), Percorso_11/collegamento_Cotral da Grottaferrata (world
  `FrascatiGrotta`) — nessun warning di allineamento.
- **Scoperti e corretti `.tmj` "stale" rispetto ai `.tmx` sorgente** (stesso problema già noto da
  sessioni precedenti, qui su 3 mappe nuove): Percorso_11.tmj era fermo a una versione con 4 soli
  oggetti mentre il `.tmx` di Luca ne aveva 14 (masso Forza triplicato in arco, 4 copie duplicate
  dello stesso trainer `all-p11-2`, un nuovo spawn); collegamento_Cotral.tmj aveva ancora il trigger
  Spaccaroccia che Luca aveva nel frattempo spostato su Percorso_11 (tmx aggiornato, tmj no); Genzano
  aveva perfino le **dimensioni sbagliate** (tmj fermo a 60×50, il vero disegno di Luca in Tiled è
  60×86 — 36 righe di mappa mancavano del tutto lato motore). Tutti e tre rigenerati da `.tmx` con
  uno script Python dedicato (converte layer/oggetti preservando le proprietà), poi corretti a mano:
  - Percorso_10: rinominato il trainer duplicato `all-ariccia-2` (stesso id del vero trainer di
    Ariccia, copiato per errore) in `all-p10-1`, aggiunto anche `all-p10-2` per dare un minimo di
    percorso prima di Genzano — dati in `dati/trainer.js`.
  - Percorso_11: i 3 `trigger_forza` (tipo ormai morto/ignorato dal motore dalla sessione 6 agosto,
    va usato l'oggetto `masso`) convertiti in 3 oggetti `masso` veri; i 4 trainer duplicati
    `all-p11-2` rinominati `all-p11-3..6` con dati propri.
  - **Nota per Luca**: su Percorso_11.tmx ci sono anche 3 copie di un trigger Spaccaroccia con lo
    stesso `blocco_id` di quello che prima stava su collegamento_Cotral — sembra tu l'abbia spostato
    lì apposta (non l'ho toccato, solo segnalato: se non era voluto dimmelo e lo tolgo).
- **Tabelle incontri nuove** (`dati/incontri.js`, specie mai usate altrove come da convenzione del
  progetto): `incontri percorso 10` (Lv 53-57, tema fiori/Infiorata: Sunflora/Ledian/Vileplume/
  Bellossom/Masquerain), `incontri percorso 11` (Lv 28-35, tema montano: Nosepass/Aron/Numel/Lairon/
  Camerupt), `incontri collegamento cotral` (Lv 30-36, tema industriale/scarti: Grimer/Baltoy/Muk/
  Claydol/Beldum), `incontri genzano` (Lv 55-58, tema Folletto/fiori: Hoppip/Clefairy/Skiploom/
  Clefable/Jumpluff — tabella pronta ma non ancora agganciata a un rettangolo `erba_alta` reale,
  Genzano non aveva nessun layer oggetti). Rettangoli `erba_alta` segnaposto aggiunti su Percorso_11 e
  collegamento_Cotral (Percorso_10 ce l'aveva già, solo la tabella mancava).
- **Genzano: pokecenter + market dedicati + warp città (SOLO questi, niente palestra su richiesta
  esplicita di Luca)**: cloni di `pokemon-castelli-Pokemon_center_ariccia.tmj`/
  `poke_market_ariccia.tmj` con id rinominati (`pokecenter_genzano`/`mart_genzano` in `MAPPE`).
  **Genzano.tmj non aveva NESSUN layer oggetti** (zero NPC/warp/eventi, nemmeno segnaposto): aggiunto
  da zero un layer `eventi` con porta Pokécenter, porta Market, i due spawn di ritorno e il
  rettangolo erba_alta — posizioni tutte segnaposto vicine al centro mappa, Luca le sposta. NPC
  venditori nuovi in `dati/npc.js` (+ `apriMarketGenzano`/`apriVenditoreSpecialeGenzano` in `app.js`,
  `mk-genzano`/`mk-genzano-speciale` in `js/data.js`).
- **Grottaferrata: Pokécenter e Market dedicati** (prima riusava letteralmente i file di Frascati,
  unica città rimasta sul "template generico" — nota aperta da tempo in `STATO-PROGETTO.md`): cloni
  registrati come `pokecenter_grottaferrata`/`mart_grottaferrata`, porte di Grottaferrata aggiornate
  (prima puntavano a `pokecenter_interno`/`mart_interno`, alias ora rimasti solo come relitto
  compatibile). Nuovo NPC venditore dedicato (prima apriva il market di Frascati).
  **Scoperto durante la sessione: `grottaferrata.tmx` in realtà contiene JSON, non XML** (probabile
  refuso di export in una sessione passata) — corretto lo stesso comunque, ma segnalato: se lo riapri
  in Tiled potrebbe dare errore, va ri-esportato per bene quando ci lavori.
- **Pokécenter variati con qualche avventore in più** (richiesta esplicita "variali un po'"): NPC di
  solo dialogo (nessuna azione) aggiunti a Grottaferrata, Marino, Rocca di Papa, Genzano — battute
  ambientate nella città (Abbazia di San Nilo, surf sul lago, montagna, Infiorata). Gli altri
  Pokécenter restano come da template comune (npc_joy + mercante_scambi).
- **Oggetti raccoglibili piazzati nel mondo** (tipo Tiled `oggetto`, pattern esistente riusato):
  i 5 tesori mai piazzati da quando erano stati aggiunti (sessione 7 agosto) ora sono in giro —
  Perla (Marino), Perla Grande (Castel Gandolfo), Polvere di Stelle (Monte Porzio), Frammento di
  Stella (Rocca di Papa), Squama Cuore (Lago di Nemi) — più una pozione/superpozione/revitalizzante
  segnaposto sulle 3 mappe nuove (Percorso 10/11, collegamento_Cotral). Tutti posizionati a vista,
  Luca li sposta in Tiled se non sono su erba/pavimento libero.
  **Nota per Luca**: `monteporzio.tmx` e `Lago di Nemi.tmx` hanno dimensioni diverse dai rispettivi
  `.tmj` (probabilmente vecchi/stale) — l'oggetto è stato aggiunto solo al `.tmj` (quello che legge
  il motore), NON ai `.tmx` corrispondenti per non rischiare di sovrascrivere lavoro con un file
  disallineato: se riapri quelle mappe in Tiled, ri-esporta con attenzione. `rocca_di_papa.tmx` non
  esiste proprio (solo `.tmj`).
- **File nuovi**: `pokemon-castelli-Pokemon_center_genzano.tmj`, `pokemon-castelli-poke_market_genzano.tmj`,
  `pokemon-castelli-Pokemon_center_grottaferrata.tmj`, `pokemon-castelli-poke_market_grottaferrata.tmj`.

### Prossimo passo
1. **Test end-to-end mai fatto in questa sessione**: Genzano (cammino da Ariccia, porte pokecenter/
   market, box PC, incontri erba — quando Luca aggiunge un rettangolo vero), Percorso_10/11,
   collegamento_Cotral (masso Forza a 3 pezzi, incontri, oggetti a terra), Grottaferrata col suo
   nuovo Pokécenter/Market.
2. Confermare con Luca se il trigger Spaccaroccia triplicato su Percorso_11 è voluto (vedi nota
   sopra) o uno scambio accidentale con collegamento_Cotral.
3. Quando Luca disegna l'interno della palestra di Genzano: decidere i dati di Camilla (D11 in
   `docs/TODO.md`, capopalestra Folletto, cap 58) e collegarla con lo stesso pattern usato per le
   altre palestre.
4. Rocca di Papa: stessa cosa per Rocco, appena Luca ha l'interno pronto (gap noto, Gruppo B di
   `docs/TODO.md`).
5. Le note aperte delle sessioni precedenti restano valide (icone oggetti zaino da PBS, animazioni
   mosse da rivedere — su richiesta esplicita di Luca questo fronte resta in pausa per ora — 5 mappe
   di Luca ancora senza chiave: `Percorso_12`, `Filler Frascati1` — quest'ultima sembra un doppione
   di Percorso_11, stesse coordinate esatte nel world, da verificare).

---

## Sessione 8 agosto 2026 — Bugfix round su menu/Box/salvataggio/mappe (seguito diretto della sessione precedente)

Continuazione a caldo della sessione "Censimento mosse... Box PC multipli" (sotto): l'utente ha
testato dal vivo e segnalato diversi problemi reali, tutti corretti in questa sessione. **Ancora
nessun test end-to-end mio** (browser claude-in-chrome mai connesso in queste due sessioni) — tutte
le correzioni sono verificate dall'utente stesso durante la sessione, non da me.

- **Market e Box separati per davvero**: chiarito che Market si apre SOLO parlando con l'NPC del
  negozio (invariato) e Box SOLO interagendo col PC di un Centro Pokémon — **rimosso il bottone
  ☰ MENU** (`index.html`/`js/app.js`): ora Invio/Start è l'unico ingresso al pannello di gioco
  (Squadra/Zaino/Recap/Salva). Il tipo Tiled `'pc'` esisteva già nel motore (era un placeholder-toast)
  ed era **già piazzato dall'utente in tutti gli 8 Centri Pokémon**: collegato alla vera schermata
  Box (`apriBoxPC()`, nuova, `js/app.js`) — zero mappe da modificare.
  Bug trovato subito dopo: aprendo Box compariva anche la tab "🛒 Market" cliccabile (i due erano
  raggruppati sotto la stessa "modalità strumenti"). Corretto: in modalità `strumenti` **nessuna tab
  è più visibile**, sono due schermate del tutto indipendenti (`impostaModalitaMenu`, `js/app.js`).
- **Pokécenter di Borgata Tuscolana**: la mappa è stata riesportata più volte dall'utente (allargata
  30→79 tile di larghezza) e sostituita da un file dedicato
  (`pokemon-castelli-Pokemon_center_Borgata_tuscolana.tmj`, prima riusava il template generico) —
  registrata al posto del vecchio file in `MAPPE['pokecenter']` (`js/map.js`). Spawn di ingresso
  ricalibrato più volte sull'oggetto "spawn del player" che l'utente ha aggiunto in Tiled (tile finale
  23,8).
- **World `tuscolo` aggiunto**: 4 mappe inizialmente (`tuscolo_rovine`, `tuscolo_interno_1`,
  `boschetto_segreto`, `tuscolo_ingresso`), ma solo 2 si toccano davvero geometricamente
  (`tuscolo_interno`↔`tuscolo_ingresso`); l'utente ha poi ripulito il `.world` lasciando solo quelle
  2. Rigenerato `js/clusters.js` (`strumenti/genera_clusters.py`) entrambe le volte, nessun warning
  di allineamento.
- **Salvataggio reso MANUALE** (richiesta esplicita, la partita si salvava da sola a ogni singolo
  passo): `salvaPartita()` è ora una funzione vuota (i ~40 punti del codice che la chiamavano
  restano, ma sono innocui); la scrittura vera è in una nuova `salvaPartitaOra()`, agganciata al
  bottone verde **"💾 Salva partita"** nella scheda Salva. Il trigger automatico rimosso era in
  `alPasso()` (`js/app.js`).
- **Bug critico: giocatore bloccato per sempre in un interno se salva lì** — l'uscita di un interno
  (Centro/palestra/casa/…) funziona SOLO tramite `mappaStack` (lo stack "da dove sei entrato",
  volatile, mai salvato). Riprendere una partita già dentro con lo stack vuoto rendeva l'uscita un
  no-op silenzioso. **Risolto per bene** (non con un cerotto): `salvaPartitaOra()` ora salva anche
  `stato.mappaStackSalvata` (`GameMap.stackAttualeSalvabile()`), ripristinato in `create()` PRIMA di
  ricaricare l'ultima mappa (`GameMap.ripristinaStack()`) — l'uscita funziona esattamente come se non
  ci fosse mai stato un ricaricamento pagina, **per qualsiasi interno**, non solo i Centri Pokémon.
  Tenuta comunque una rete di sicurezza in `_transizioneMappa` (`js/map.js`): se lo stack è vuoto
  nonostante tutto (salvataggi vecchi pre-fix), l'uscita riporta a Borgata Tuscolana invece di
  lasciare il giocatore bloccato — mai più un vicolo cieco, nel caso peggiore si viene solo
  teletrasportati lontano.
- **Volo su Borgata Tuscolana ricalibrato**: `VOLO_TILED['Borgata Tuscolana']` (`js/app.js`) era
  tarato `tx:5,ty:14` sul vecchio layout a 30 tile, atterrava lontanissimo dalla porta reale (oggi
  tile 23,13) dopo l'allargamento della mappa. Corretto a `tx:23,ty:14` (un tile a sud della porta,
  verificato libero da collisioni).
- **Box PC — rifiniture estetiche** (l'utente aveva definito la prima passata "una schifezza", a
  ragione):
  - Sfondi `box_N.png` applicati per davvero (prima mancavano del tutto). Ritagliati da 324×296 a
    345×245 con **script dedicato** (`strumenti/ridimensiona_box.py`, richiede Pillow — installato al
    volo, non c'era) — l'altezza si ottiene **tagliando la parte alta** (non schiacciando l'immagine),
    la larghezza con un resize normale. Usato `box_3.png` al posto di `box_16.png` (richiesta
    estetica dell'utente) nella prima pagina; `box_17..box_39.png` per le altre 23.
  - Icone Pokémon corrette: gli sprite in `Essentials FRLG/Graphics/Pokemon/Icons/` sono 128×64 = **2
    fotogrammi da 64×64 affiancati**, non una griglia 32×32 come avevo assunto sbagliando la prima
    volta (mostrava un quarto di fotogramma, "tagliate"). Ritaglio corretto = metà sinistra
    dell'immagine (`.box-icona` in style.css: `background-size:96px 48px` per una cella 48×48, prima
    era 32×32 troppo piccola).
- **File nuovi**: `strumenti/verifica_mosse.py` (censimento mosse, sessione precedente),
  `strumenti/ridimensiona_box.py` (crop sfondi box, questa sessione).

### Prossimo passo
1. **Test end-to-end dal vivo, mai fatto da me in queste due sessioni**: in particolare salva
  dentro un interno qualsiasi → ricarica pagina (F5) → verifica che l'uscita funzioni; Volo su
  Borgata Tuscolana; aspetto finale del Box (sfondi + icone).
2. Le altre note aperte della sessione precedente restano valide (icone oggetti zaino da PBS non
   ancora fatte, altri sheet di animazione da vagliare a occhio, 5 mappe di altri lavori dell'utente
   ancora senza chiave in `MAPPE`: `Percorso_10`, `Genzano`, `Filler Frascati1`, `Percorso_11`,
   `collegamento_Cotral`).
3. **Rigenerare tutti i Pokécenter, incluso Genzano che ora esiste**: lo stesso giro di correzioni
   fatto per Borgata Tuscolana (mappa dedicata registrata in `MAPPE`, oggetto `pc` per il Box, spawn
   ricalibrato) va probabilmente ripetuto/verificato su tutti gli altri Centri Pokémon — e Genzano va
   aggiunto da zero visto che prima non esisteva ancora come mappa. Da fare nella prossima sessione.

---

## Sessione 7 agosto 2026 (seconda parte) — Censimento mosse, animazioni morso/fuoco/acqua, nuovo menu Start, Zaino a 3 tasche, Box PC multipli, reskin Market

Sessione di implementazione su richiesta esplicita dell'utente (piano approvato in plan mode).
**Non testato dal vivo**: l'estensione claude-in-chrome non era connessa in questa sessione — solo
`node --check` su tutti i file toccati. Priorità alta per la prossima sessione: verificare tutto a
schermo, in particolare il Box PC (riscrittura più grossa e più rischiosa).

- **Censimento mosse**: nuovo `strumenti/verifica_mosse.py` confronta le MT/MN di `js/data.js` con
  `Essentials FRLG/PBS/moves.txt` — **0 discrepanze** trovate sulle 11 MT/MN esistenti, nessuna
  correzione necessaria. Aggiunto il campo `nomeEn` (nome inglese "vero", es. "Razor Leaf") a
  `PokeAPI.riduciMossa`/`getMossa` (`js/pokeapi.js`), usato dal nuovo popup dettagli mossa nello zaino
  e pensato anche per il futuro matching con gli sheet di animazione.
- **Animazioni mosse — riattivate selettivamente** (`js/battle.js`, `dati/mosse-animazioni.js`):
  l'`ANIMAZIONI_MOSSE_ATTIVE` disattivato in sessione 1 è tornato `true`, ma `risolviAnimazioneMossa`
  ora mostra **solo** gli sheet con un campo `frames` scelto a mano (sottoinsieme/ordine di celle
  verificato guardando l'immagine, non l'intera griglia raster) — gli altri sheet nel registro restano
  inerti finché non vengono vagliati allo stesso modo. Vagliati finora: **Rognodenti/Crunch.png** (8
  fotogrammi, fauci che si aprono e chiudono di scatto — usato ora per **qualsiasi mossa "morso"**,
  matching su "bite"/"fang" nel nome inglese, non solo Rognodenti), **Fuoco generico/fire4.png** (10
  fotogrammi, palla di fuoco che cresce ed esplode in braci), **Acqua generico (incluso Surf, che non
  ha uno sheet dedicato)/water3.png** (11 fotogrammi, colonna d'acqua che sale e si scioglie in
  vortici). Su richiesta utente, effetti ingranditi (scala 0.7×→**1.3×** la cella in `spritesheetMossa`).
- **Nuovo menu Start** (tasto Invio/Start): ora apre un pannello con **Squadra/Zaino/Recap/Salva**,
  distinto dal menu ☰ esistente che perde Squadra e Zaino e resta con **Market/Box**. Stesso
  `#pannello-menu`/`#menu-card` riusato per entrambi (`js/app.js`: `apriMenu(modalita)`,
  `impostaModalitaMenu`, `SCHEDE_PER_MODALITA`, tab HTML taggate `data-modalita` in `index.html`).
  "Recap" (nuova, Trainer Card) = le statistiche che prima erano nella scheda Salva
  (`renderRecap`, ex parte di `renderSalvataggio`); "Salva" ora contiene solo le azioni
  (esporta/importa/nuova partita/test) via `renderSalva`.
- **Zaino riorganizzato in 3 tasche** (`renderZaino` + `renderZainoTascaOggetti/Ball/Chiave`,
  `js/app.js`): Tasca 1 = cura/boost/vendibili/pietre/oggetti da tenere (tutto tranne MT e Ball);
  Tasca 2 = oggetti chiave/storia + **contenitore MT/MN** cliccabile (mostra tutte le MT/MN possedute);
  Tasca 3 = Poké Ball (solo in battaglia, nessun bottone "Usa"). Dentro il contenitore, ogni MT ha un
  bottone **ℹ️** che mostra un popup con nome IT+EN, tipo, categoria (Fisico/Speciale/Stato), potenza,
  precisione, PP ed effetto tradotto in una frase italiana (`descriviEffettoMossa`, deriva da
  `statoEffetto`/`cambiStat`/`priorita` di `PokeAPI.getMossa` — non serviva un nuovo database mosse).
  **Rimandate le icone PNG per gli oggetti** (da `Essentials FRLG/Graphics/Items/`): mappare a mano
  ~70 chiavi italiane ai nomi file PBS inglesi rischiava mapping sbagliati senza controllo umico;
  gli oggetti restano con le emoji esistenti (già funzionanti, l'utente aveva comunque detto che le
  tasche colorate gli interessavano poco).
- **Box PC multipli** (24 box da 30 slot, griglia 6×6→6×5): riscrittura completa di `renderBox` +
  generalizzazione di `renderDettagli(fonte)` (prima `renderDettagli(idx)` solo squadra, ora accetta
  `{tipo:'squadra',idx}` o `{tipo:'box',box,slot}`). Stato: `stato.box` (array piatto) → `stato.boxes`
  (24×30, `Array.from`), con **migrazione automatica** in `caricaPartita()` per i salvataggi vecchi
  (controllando `salvato.boxes` sul JSON grezzo, non `stato.boxes` già mergiato coi default — bug
  trovato e corretto durante l'implementazione). Nuovi helper `tuttiIBoxFlat`/`contaBox`/`depositaInBox`
  (primo slot libero su tutti i 24 box) usati anche da `battle.js` (cattura a squadra piena) e dal setup
  squadra TEST. Icone Pokémon copiate da `Essentials FRLG/Graphics/Pokemon/Icons/` in
  `sprites/pokemon_icons/` (`chiaveIconaPokemon`: nome inglese normalizzato maiuscolo, con eccezioni
  manuali per Nidoran♀/♂). Interazione stile Essentials: tocca uno slot pieno per **prenderlo** (stato
  temporaneo `boxMano`, **non salvato finché non viene posato** — se il Pokémon resta "in mano" e il
  menu si chiude, `chiudiMenu()` lo rimette da solo al suo slot originale, per non perderlo mai); tocca
  un altro slot per **posarlo/scambiarlo**; striscia "⚡ Squadra" in basso per scambiare direttamente
  col Box senza passare dalla scheda Squadra. Da `renderDettagli` aperto su un Pokémon nel Box:
  **Summary completo** (stesse statistiche/mosse della squadra) + **Sposta in squadra** + **Rilascia**
  (con conferma). Sfondi `box_16..39.png` non ancora applicati come sfondo visivo dei singoli box
  (solo la struttura dati/interazione a 24 box è pronta) — nota per una prossima passata estetica.
- **Reskin Market**: `renderMarket` invariata nella logica, aggiunta solo la classe CSS `.market-skin`
  (`js/app.js` in `mostraSezioneMenu`) con lo sfondo `UI/Mart/bg.png` (512×384, `background-size:cover`,
  non è un tile ripetibile). **`cursor.png` non usato come CSS cursor**: è una striscia 312×34 (più
  fotogrammi di un cursore animato, non un singolo puntatore) — non applicabile direttamente, da
  rivalutare se in futuro si vuole un vero cursore animato via sprite invece del puntatore di sistema.
- Copiate in `sprites/`: `pokemon_icons/` (715 file, da `Pokemon/Icons` + uovo da `Pokemon/Eggs`),
  `ui_storage/` (54 file, da `UI/Storage`, non ancora tutti usati), `ui_mart/` (bg+cursor).

### Correzione post-sessione: Box dal PC dei Centri, non dal ☰
L'utente ha chiarito subito dopo: Market e Box **non** dovevano stare in un menu ☰ generico — Market
si apre parlando con l'NPC del negozio (invariato, già così), **Box si apre interagendo col PC dentro
ogni Centro Pokémon** (come nei giochi veri). Corretto:
- **Rimosso il bottone ☰ MENU** (`index.html`/`js/app.js`): ora Invio/Start è l'unico modo per aprire
  il pannello di gioco, e mostra solo Squadra/Zaino/Recap/Salva.
- **`js/map.js` aveva già un handler per `tipo === 'pc'`** (oggetto Tiled), ma era un placeholder che
  mostrava solo un toast ("Apri il menu ☰ → Box"). Ora chiama la nuova `apriBoxPC()` (`js/app.js`,
  gemella di `apriMarketVenditore` ma senza bisogno di un id: i box sono globali, non per Centro).
- **Nessun oggetto Tiled nuovo da creare per il codice**: il tipo `'pc'` esisteva già nel dizionario
  Tiled del progetto. L'utente deve solo **piazzare un oggetto tipo `pc` dentro ogni Centro Pokémon**
  (uno per Centro, id libero — il dispatch non guarda l'id per questo tipo).
- Il "Market" resta aperto da NPC con `azione:'apriMarket...'` in `dati/npc.js`, invariato.

### Prossimo passo
1. **Testare dal vivo tutto quanto sopra** (priorità alta, mai verificato a schermo in questa sessione):
   animazioni morso/fuoco/acqua in battaglia, menu Start vs ☰, le 3 tasche zaino e il contenitore MT/MN,
   e soprattutto il Box PC (prendi/posa/scambia tra box e squadra, cambio box, Summary, Rilascia,
   migrazione di un salvataggio vecchio se disponibile).
2. Decidere se/quando applicare gli sfondi `box_16..39.png` ai singoli box (oggi la griglia è a tema
   scuro generico, non ancora con lo sfondo Essentials per box).
3. Se si vuole completare le icone oggetti PNG (rimandate questa sessione): mappare a mano le chiavi
   italiane di `OGGETTI`/`OGGETTI_CHIAVE` ai file di `sprites/oggetti/` (da copiare da
   `Essentials FRLG/Graphics/Items/`), uno alla volta per evitare mapping sbagliati.
4. Continuare a vagliare a occhio altri sheet di animazione (`dati/mosse-animazioni.js` ne ha molti
   già catalogati ma non ancora verificati) per estendere le animazioni "vere" oltre morso/fuoco/acqua.

---

## Sessione 7 agosto 2026 — Bugfix Tunnel Roccioso (masso/cutscene), rarità terze evoluzioni, X Item + oggetti da tenere, animazioni mosse (fallita, disattivata)

- **Reset cutscene in test**: mancava un secondo bottone/flag. Aggiunto **🔄 Reset cutscene (test)** nel
  pannello ☰→💾 Salva (solo `MODALITA_TEST`): svuota `stato.cutsceneViste` e il flag
  `stato.flags.latiosLatiasRoaming` (js/app.js). Dopo il reset serve uscire/rientrare nella mappa perché
  gli sprite "leggendario_ambientale" si ricreano solo al caricamento mappa.
- **Masso Forza — doppio bug risolto**: (1) chiave di persistenza `stato.massiSpostati` basata sul
  solo id Tiled (non univoco fra mappe di un cluster) → un masso spinto su un piano ne "duplicava" uno
  su un altro piano con lo stesso id; (2) il masso era anche dipinto a mano come TILE statico (GID
  fisso) nel layer `edifici` sotto l'oggetto Tiled, quindi restava un "fantasma" visibile anche dopo lo
  spostamento e anche ricaricando la mappa. **Soluzione adottata (richiesta esplicita di Luca): il
  puzzle si resetta sempre lasciando la stanza** — rimossa la persistenza (`stato.massiSpostati`
  eliminato da app.js/map.js), `_creaMassi()` ricostruisce sempre la posizione originale Tiled e ripulisce
  il tile fantasma ad ogni caricamento mappa (`_pulisciTileFantasmaMasso`, js/map.js).
- **Rate incontri Tunnel Roccioso**: dimezzato/ridotto (12%→7% sui 4 piani, 15%→8% nella zona Surf
  sotterranea) — troppo denso in test.
- **Terze evoluzioni rarissime negli incontri selvatici**: verificate le catene reali via
  `EVOLUZIONI_DB` (non i commenti a mano, alcuni imprecisi) su tutte le 29 tabelle di
  `dati/incontri.js`. 9 voci corrette (Azumarill, Beautifly, Dustox, Flygon, Aggron, Golem, Crobat,
  Slaking, Tyranitar) a rate 3-8. Nota aperta: `'incontri tunnel roccioso 4f'` ha SOLO terze evoluzioni
  (nessuna forma base/intermedia in pool) — la rarità lì è solo relativa fra loro, non "vera" rarità;
  serve aggiungere Pokémon di stadio inferiore se si vuole risolvere del tutto.
- **Oggetti Gen 1-3 dal pacchetto Essentials FRLG**: filtrati 198 oggetti coerenti con Gen1-2-3 da
  `Essentials FRLG/PBS/items.txt` (esclusi tutti quelli Gen4+), catalogati in
  `docs/OGGETTI-GEN1-3-REFERENCE.md`. Aggiunti al gioco:
  - **5 nuovi tesori vendibili** (Perla, Perla Grande, Polvere di Stelle, Frammento di Stella, Squama
    Cuore) in `OGGETTI` — categoria `tesoro`, stesso pattern della Pepita. **Da fare (LUCA): piazzarli
    su una mappa in Tiled** (oggetto `tipo:'oggetto'`, prop `oggetto:<chiave>`) perché siano davvero
    trovabili — oggi esistono solo come definizioni, non ancora nel mondo.
  - **X Item** (categoria `xitem`): X Attacco/Difesa/Att.Sp/Dif.Sp/Velocità/Precisione, usabili dal
    menu Zaino SOLO in battaglia, alzano di uno stadio una statistica per la battaglia in corso (stesso
    motore di Danza Spada). In vendita a Rocca di Papa. Mordigheria/Alzo Guardia esclusi: servirebbe un
    sistema di colpi critici/protezione cali-stat che oggi non esiste.
  - **Oggetti da tenere** (categoria `held`, nuovo campo `ist.oggetto` su ogni Pokémon): UI per
    assegnare/togliere (Zaino→scegli bersaglio; Squadra→dettagli→"Togli oggetto"). Effetti implementati
    in `js/battle.js`: 13 potenziatori di tipo (+20% danno mosse di quel tipo), Rimasugli (cura 1/16 HP
    a fine turno), Unghia Veloce (20% di agire per primi), Cinghia/Benda Focus (sopravvivi a un KO),
    Polvere Abbaglio (-10% precisione nemica contro il portatore), Amomoneta (soldi ×2 a fine battaglia
    allenatore). In vendita a Genzano ("Bazar oggetti").
- **Animazioni mosse — IMPLEMENTATE MA DISATTIVATE, sequenza sbagliata**: avevo copiato spritesheet da
  `Essentials FRLG/Graphics/Animations/*.png` (formato RPG Maker XP, griglia fissa 192×192) e costruito
  un player che affetta l'immagine a griglia (`cols = larghezza/192`, `rows = altezza/192`) e ne mostra
  le celle **in ordine di lettura semplice** (sinistra→destra, alto→basso) a fps fisso. **Diagnosi del
  problema (segnalato da Luca in test)**: quell'assunzione è sbagliata. Gli spritesheet RPG Maker XP
  NON sono flipbook in ordine raster: sono librerie di celle, spesso con più mini-animazioni impacchettate
  nella stessa immagine (es. impatto + polvere + flash come gruppi separati di celle), e l'ordine/timing
  reale di riproduzione (quale cella mostrare a ogni fotogramma, posizione/zoom/rotazione/opacità) è
  definito altrove, in `Essentials FRLG/Data/Animations.rxdata` — un binario Ruby "Marshal" del progetto
  RPG Maker XP, che **non ho mai parsato** (valutato troppo costoso rispetto al beneficio, vedi
  conversazione). Risultato: riprodurre le celle in ordine raster mescola pezzi di mini-animazioni
  diverse → sembra casuale/a scatti, non la mossa vera. **Disattivato** con un interruttore
  `ANIMAZIONI_MOSSE_ATTIVE = false` in cima a `animaMossa` (js/battle.js): il gioco è tornato ai 3
  template generici (balzo/proiettile/scintillio) usati da sempre, l'infrastruttura nuova (registro
  `dati/mosse-animazioni.js`, funzione `spritesheetMossa`, sprite copiati in
  `sprites/animazioni_mosse/`) resta nel codice ma inerte. **Da fare**: o (a) scrivere un parser del
  Marshal Ruby di `Animations.rxdata` per estrarre la vera sequenza/timing per mossa (impegnativo), o
  (b) costruire a mano, mossa per mossa, la sequenza corretta di celle guardando gli sheet a occhio
  (lento ma senza dipendenze), o (c) abbandonare questi spritesheet e usare un altro approccio per le
  animazioni mosse. Nessuna decisione presa.
- **Segnate come "da fare" in `docs/TODO.md` (Gruppo C)**, su richiesta esplicita di Luca (non
  implementare senza conferma): **sistema EV** (vitamine Gen1-3 censite ma non in `OGGETTI`), **fossili**
  (censiti, manca il flusso trova→consegna→rianima), **fedeltà moveset/Abilità** da
  `Essentials FRLG/PBS/moves.txt`/`pokemon.txt`/`abilities.txt` (moveset del pacchetto sono "moderni"
  anche su specie vecchie; le Abilità non esistono come sistema di battaglia oggi — introdurle è una
  feature nuova, non solo dati).

**Prossimo passo**: decidere l'approccio per le animazioni mosse (a/b/c sopra) quando si riprende quel
fronte; nel frattempo il gioco funziona con le animazioni generiche di sempre. Per il resto, testare in
game i fix di questa sessione (masso, cutscene, X Item, oggetti da tenere).

---

## Sessione 6 agosto 2026 (quarta parte) — Bugfix scale/trainer dopo i re-export di Luca, montepo.world, riscrittura scena Latios/Latias, sistema MN

Continuazione diretta della sessione precedente: Luca ha continuato a lavorare le mappe del Tunnel
Roccioso in Tiled in parallelo, causando diversi giri di "riesporta → correggi → Luca riapre una
versione vecchia in Tiled → l'export successivo riporta indietro la correzione". Documentato qui lo
stato FINALE, non tutti i giri intermedi.

- **Trainer duplicati (di nuovo)**: Luca aveva aggiunto più allenatori copia-incollando in Tiled — 8
  copie di `tunnel-1f-2` tutte con lo stesso id. Rinominati `tunnel-1f-3..10`, dati aggiunti in
  `dati/trainer.js`. Totale allenatori nel dungeon: **1F=10, 2F=9, 3F=10, 4F=2 → 31**.
- **Scale — bug ricorrente e causa reale**: ogni volta che Luca riapriva in Tiled una mappa che avevo
  già corretto (con una versione vecchia ancora in memoria nell'editor), il suo export successivo
  cancellava la mia correzione (destinazioni con suffisso `_a/_b/_c` invece della chiave mappa vera,
  spawn_id senza uno spawn corrispondente da nessuna parte). Risolto more volte con lo stesso script
  (`fix_dest_only.py` + verifica con `verify_stairs.py`, mai creando oggetti nuovi su richiesta esplicita
  di Luca — solo rinominando `spawn_id` per puntare a spawn che esistevano già). **Stato finale: tutte
  le scale funzionanti**, nessuna orfana (3F↔4F rimossa di proposito da Luca: al 4F ci si arriva solo
  dall'1F).
- **`montepo.world` (Monte Porzio ↔ Osservatorio)**: nuovo `.world` di Luca, registrato — cluster
  generato senza warning di allineamento (`strumenti/genera_clusters.py`), testato.
- **Uscita Monte Porzio**: registrata (warp+spawn su `monteporzio.tmj`/`.tmx`, prima non c'era).
- **Tileset Caves mai registrato — causa del "tutto verde"**: `TILESET_META`/`TILESET_IMMAGINI`
  (`js/map.js`) non conoscevano `Caves.tsj` (mai usato prima in questo progetto): veniva scartato in
  silenzio (solo un warning console), terreno/rocce/acqua non si disegnavano affatto. Aggiunta la voce
  mancante — nessuno split necessario (256×6368px, sotto il limite WebGL, a differenza di
  outside/Emerald_Outside). Verificato dal vivo, mappa visibile correttamente.
- **Tile 1213 di Caves.tsj → collisione automatica**: aggiunto in `buildCollGrid` un riconoscimento a
  TILE (stesso principio di `_buildErbaAltaTiles` per l'erba), vale per ogni mappa che usa Caves.tsj,
  non solo il tunnel. Layer `collisioni` (vuoto) aggiunto a 3F/4F che non ce l'avevano.
- **Grotte sempre giorno**: capovolta la regola precedente. Il flag `grotta` (mai impostato da nessuna
  mappa, presupponeva "sempre notte") sostituito da un controllo su `MAPPE[...].tema === 'cave'/
  'icecave'` che forza **sempre giorno**, mai notte/alba/tramonto — richiesta esplicita, vale per tutte
  le grotte del gioco (Tunnel Roccioso, Antri Regi, Tuscolo profondo), non solo il dungeon nuovo.
- **Modalità TEST — MN sempre disponibili**: `inizializzaSquadraTest()` (`js/app.js`) ora sblocca anche
  Forza/Spaccaroccia/Cascata/Sub (mancavano, solo Surf/Taglio/Volo/Funivia erano già presenti).

### Scena Latios/Latias — riscritta due volte nella stessa sessione
1ª riscrittura: da singola sequenza (interagisci con [A] → tutto in un colpo) a **due cutscene
separate** (richiesta esplicita, con logica a coordinate spiegata da Luca): la prima scatta da sola
quando il giocatore è nella casella davanti all'NPC (o parlandogli), solo dialogo, poi i comandi
tornano subito; la seconda scatta da sola quando il giocatore si avvicina di sua iniziativa a 2 caselle
da Latios/Latias (tremore + dissolvenza + l'NPC ti raggiunge + battuta finale + roaming sbloccato).

**Bug trovato e corretto**: il trigger della prima cutscene assumeva l'NPC sempre rivolto a nord, ma
l'oggetto Tiled aveva `direzione:"est"` (cambiata quando Luca lo spostava) — il trigger non scattava
mai. Corretto per leggere la direzione VERA dell'NPC (riuso di `_dirDelta`, già usato per i trainer):
ora si adatta da solo se Luca lo gira/sposta in Tiled, non serve più toccare il codice. Verificato dal
vivo, funzionante. `debugNpcAttivi()` esteso con tx/ty/dir per debug futuro.

### Sistema MN riscritto (Taglio/Spaccaroccia/Forza/Cascata)
Su richiesta di Luca, chiarito e corretto come si comportano le 4 MN "ostacolo" nel motore:
- **Messaggio all'uso**: ogni MN mostra ora `"Rosso/Rossa usa <MN>!"` (`_gestisciTrigger`,
  `_provaSpingiMasso`). Nota: il progetto non ha un campo nome-personaggio vero, solo il genere — usato
  Rosso/Rossa come placeholder stile FireRed; da sostituire se in futuro arriva un nome vero.
- **Taglio/Spaccaroccia**: ora l'albero/roccia sparisce anche VISIVAMENTE (`_nascondiTileOstacolo`,
  nuova, riusa il pattern di `_nascondiTilePokeball` su `layerObjects` filtrando via il layer ground),
  non solo la collisione. Nessuna persistenza voluta: uscendo e rientrando dalla mappa ricompare
  (comportamento naturale, `collGrid`/tile si ricostruiscono da zero ogni caricamento).
- **Forza — non esiste più un "Forza semplice"**: `_gestisciTrigger` ora RIFIUTA esplicitamente
  qualunque oggetto `trigger_forza` residuo (warning console, nessun effetto) — ogni ostacolo Forza deve
  essere un oggetto `type:"masso"` vero (già esisteva come sistema, usato a Marino/Percorso 11: si
  spinge camminandoci contro, si sposta di una casella, posizione persistita in
  `stato.massiSpostati`). Convertiti gli 8 `trigger_forza` che formavano il muro di rocce sul 4F in 8
  `masso` veri (`masso_tunnel_roccioso_4f_1..8`).
- **Cascata**: non più "cammini normalmente sui tile cascata" — ora `_risaliCascata` (nuova) porta il
  giocatore automaticamente e lentamente verso nord per N caselle (N = altezza dell'oggetto
  `trigger_cascata` in tile), ignorando l'input normale; i tile cascata restano sempre non-calpestabili
  a piedi, solo risalibili con questa animazione forzata.
- **Non testato dal vivo in questa parte** (browser claude-in-chrome disconnesso più volte durante la
  sessione): tutto validato con `node --check`/JSON/XML, verificare a schermo alla prossima occasione,
  in particolare la spaziatura tra gli 8 massi convertiti (sono in fila stretta, potrebbero bloccarsi a
  vicenda spingendoli).

### Prossimo passo
1. Verificare a schermo il sistema MN riscritto (messaggi, sparizione taglio/spaccaroccia, spinta dei
   nuovi 8 massi sul 4F, risalita cascata) — priorità alta, mai testato dal vivo.
2. Chiesto a Luca se vuole aggiungere un vero campo nome-personaggio (oggi solo Rosso/Rossa fisso).
3. Continuare a popolare Tunnel Roccioso (collisioni sui piani ancora incompleti, oggetti, rifiniture).

---

## Sessione 6 agosto 2026 (terza parte) — Tunnel Roccioso (dungeon 4 piani), scena Latios/Latias, roaming

Luca ha disegnato 4 nuove mappe (`Tunnel_roccioso_1f..4f`, Via dei Laghi → Monte Porzio, tra 3ª e 4ª
palestra). Richiesta: layer eventi, entrata da Via dei Laghi (l'uscita a Monte Porzio la cabla lui),
scena Latios/Latias al 4F con fuga verso roaming globale, trigger Forza, allenatori, "incontri costanti"
(tutta la grotta è zona incontri, come ogni dungeon Pokémon, tranne un riquadro 7x7 attorno ai due
leggendari).

- **Layer eventi**: aggiunto alle 4 mappe (`.tmj`+`.tmx`; il 4F non aveva ancora `.tmj`, generato da
  `.tmx` con uno script one-off Python, come già fatto per Zona Safari in sessione 39).
- **Entrata Via dei Laghi → Tunnel 1F**: Luca aveva già piazzato il warp/spawn segnaposto
  (`warp_tunnel roccioso`) ma con `destinazione: "Tunnel roccioso"` (testo generico, avrebbe potuto
  risolversi in modo ambiguo tra le 4 mappe): corretto in `tunnel_roccioso_1f` (chiave esatta), aggiunto
  il warp/spawn di ritorno sul lato 1F. **Uscita a Monte Porzio NON toccata** (`monteporzio.tmj/.tmx`),
  come richiesto — la aggiunge Luca.
- **Scale tra i piani**: NON ancora aggiunte. Luca le piazzerà/duplicherà lui in Tiled e le numererà;
  quando mi dà le posizioni/numeri aggiungo i warp corrispondenti.
- **Nuova feature motore — "incontri costanti"** (`MAPPE[...].incontriCostanti`+`incontriId`,
  `js/map.js _getTileType`): per i dungeon-grotta, ogni casella calpestabile è zona incontri di default
  (niente rettangoli `erba_alta` da disegnare), con esclusione di un riquadro 7x7 (raggio 3) attorno a
  un eventuale leggendario fermo sulla mappa. Riusabile per i prossimi dungeon.
- **Nuovo tipo oggetto Tiled `leggendario_ambientale`**: leggendario "scenografico" (sprite PokéAPI vero,
  solido come un NPC) ma **non interagibile via [A]** — niente rischio di battaglia prematura. Sparisce
  solo tramite una scena dedicata. Aggiunto anche ai Custom Types colorati del progetto Tiled.
  Riusa quasi tutto il codice di `_creaLeggendari()`/`_creaSpritesNPC()` già esistente.
- **Scena Latios/Latias** (`GameMap.avviaLatiosLatiasScena`, NPC `npc_latios_latias_tunnel` sul 4F,
  `azione: 'avviaLatiosLatiasScena'`): dialogo → tremore camera → dissolvenza+distruzione dei due sprite
  `leggendario_ambientale` → flag `stato.flags.latiosLatiasRoaming` → dialogo finale. **Testato dal vivo
  con claude-in-chrome**: dialoghi corretti, sprite renderizzati con lo sprite PokéAPI vero, fuga con
  tremore+dissolvenza confermata (il "ritardo" visto nei primi screenshot era solo throttling del tab
  in background durante il test, non un bug — a tab attiva il tween da 400ms è normale), flag settato,
  nessun errore console.
- **Roaming Latios/Latias** (`_checkRoamingLatiosLatias` in map.js + `triggeraLeggendarioRoaming` in
  app.js, nuovo): a differenza dei leggendari fissi, qui si può perdere/scappare senza conseguenze
  (nessun respawn/scomparsa dopo 3 KO, resta "in giro" finché non lo catturi) — 2% per casella su
  QUALSIASI zona incontri del gioco, non solo il tunnel. **Stesso schema pronto per Raikou/Entei**
  quando arriverà quel momento (sbloccato dopo Suicune, non collegato al Tunnel Roccioso).
- **Trigger Forza**: piazzato come diramazione LATERALE su Tunnel_roccioso_2f (`trigger_forza`,
  `blocco_id: masso_forza_tunnel_roccioso_2f`) — **non sul percorso principale**: la MN Forza non è
  ancora ottenibile a questo punto del gioco (arriva con/dopo Monte Porzio, che è l'uscita di questo
  stesso tunnel), quindi bloccare la via principale avrebbe reso il gioco insuperabile.
- **8 allenatori nuovi** (`tunnel-1f-1/2` … `tunnel-4f-1/2`, Lv 28-33, tema speleologo/minatore),
  **4 tabelle incontri nuove** (`incontri tunnel roccioso 1f..4f`, Lv 26-34, specie inedite:
  Diglett/Cubone/Slugma line, Houndour/Vibrava/Marowak/Sandslash line, Banette/Pupitar/Flygon/Aggron/
  Steelix, Golem/Crobat/Slaking/Tyranitar). Tutti in posizioni segnaposto, Luca le sposta in Tiled.
- Validato con `node --check`/`JSON.parse`/parser XML tutti i file toccati; server locale 200 su tutti;
  testato dal vivo (claude-in-chrome): 4F si carica senza errori, NPC/leggendari/trainer tutti presenti,
  scena Latios/Latias completa end-to-end, `DATI_INCONTRI`/`DATI_TRAINER` risolvono correttamente.

### Aggiornamento stesso giorno — Luca ha piazzato scale/trainer/uscita lui in Tiled, integrati
- **Scale 1F↔2F↔3F↔4F**: Luca ne ha piazzate parecchie (multi-connessione, non solo lineari) in Tiled,
  ma con `destinazione`/`spawn_id` incoerenti (suffissi `_a.._f` usati come se fossero chiavi mappa
  reali, e alcuni oggetti spawn rimasti sulla mappa sbagliata). Corretto con uno script Python
  (normalizza `destinazione` alle chiavi vere `tunnel_roccioso_1f..4f`, verifica ogni `spawn_id` contro
  gli spawn realmente presenti sulla mappa di destinazione, crea i 4 spawn segnaposto mancanti). **13/13
  warp interni al tunnel verificati funzionanti** con uno script di verifica dedicato.
- **Uscita a Monte Porzio**: registrata (`monteporzio.tmj/.tmx`, warp+spawn aggiunti, prima non c'era).
- **Altri 8 allenatori duplicati su 1F** (stesso problema di 2F/3F, tutti con id `tunnel-1f-2`):
  rinominati `tunnel-1f-3..10`, dati aggiunti. **Totale allenatori nel dungeon ora: 31** (1F=10, 2F=9,
  3F=10, 4F=2), tutti verificati a runtime senza dati mancanti.
- **Masso Forza**: Luca l'ha spostato/espanso lui sul 4F (muro di 8 rocce in arco, stesso `blocco_id`
  condiviso — si supera un pezzo alla volta, ognuna richiede la MN separatamente). Non toccato.
- **Nuova opzione TEST** (menu ☰ → 💾 Salva, visibile solo con `MODALITA_TEST`): checkbox "🚫 Allenatori
  non mi sfidano a vista" — disattiva solo la sfida automatica a vista (`_controllaTrainerVista`,
  `js/map.js`), parlandoci direttamente con [A] si può comunque testare una lotta specifica. Flag
  persistito in `stato.flags.testNoTrainerChallenge`, verificato a runtime.
- Validato tutto (`node --check`/JSON/XML), testato dal vivo: 31 trainer caricano su tutte le mappe
  senza dati mancanti, nessun errore console, checkbox funzionante e persistita.

---

## Sessione 6 agosto 2026 — Integrazione collisioni Castelli_lasthree, rifiniture Ariccia/percorso_7, trigger Tiled, velo giorno/notte

Richiesta dell'utente: integrare le collisioni ridisegnate sul world `Castelli_lasthree`, rendere
visibili i trigger in Tiled, estendere il velo giorno/notte a tutte le mappe esterne, verificare/
completare market-pokecenter/warp/incontri/livelli su quella fetta di mondo (percorso_7, albano,
Percorso_8, Zona Safari, Percorso_9, Ariccia). Fatto tutto tranne un bug scoperto durante il test.

- **Collisioni**: nessun codice da toccare (`buildCollGrid` legge già il layer `collisioni` di ogni
  `.tmj`), bastava riallineare `js/clusters.js` ai `.world` con `strumenti/genera_clusters.py`.
  Trovato e corretto: `ariccia` era disallineata (offsetY/h vecchi), `percorso_10` mancava dal cluster
  generato. Rigenerato senza warning di allineamento.
- **Trigger visibili in Tiled**: aggiunta la sezione `propertyTypes` (Custom Types) in
  `Senza Titolo.tiled-project`, un colore per ciascun `type` oggetto in uso (npc, trainer,
  trigger_cutscene, warp, oggetto, leggendario, cartello, masso, pulsante, cancello_pulsante,
  erba_alta, trigger_surf, gate) — Tiled ora li disegna colorati/etichettati in automatico, nessun
  file mappa toccato. Luca deve solo riaprire il progetto in Tiled.
- **Velo giorno/notte**: esteso `MAPPE_CON_VELO_TEMPO` (`js/map.js`) a tutte le mappe esterne
  registrate in `MAPPE` (prima solo Frascati centro + cluster Castelli_lakes). **Trovato e risolto
  un problema di taratura** (claude-in-chrome, con debug temporaneo poi rimosso): non era un bug di
  rendering come pensato in un primo momento — il rettangolo `_veloRect` si comportava benissimo
  (verificato forzandolo a rosso pieno e a rosso semi-trasparente: si vedeva perfettamente). Il vero
  problema era che il colore/opacità notte (`0x08132a` a `opacità 0.52`, invariati dalla sessione 3
  agosto) danno un contrasto quasi impercettibile sulle tinte verdi/teal delle mappe esterne — a
  schermo la differenza giorno/notte era praticamente invisibile. Alzata l'opacità notte a **0.75**
  (`VELO_FASCE.notte`, `js/map.js`): confermato dal vivo, ora la notte si vede chiaramente su
  `borgata_tuscolana` senza forzature, con lo stesso identico calcolo che prima sembrava "non
  funzionare". Alba/tramonto (`0.10`/`0.12`) non toccati: erano stati resi deliberatamente leggeri
  su richiesta esplicita dell'utente in sessione 3 agosto, non presentano lo stesso problema di
  contrasto (colori chiari, non richiedono lo stesso contrasto della notte) — se anche quelli
  risultassero troppo deboli in game, vanno ritarati allo stesso modo (non è detto, da verificare
  a vista da Luca).
- **Pokecenter/Market Ariccia**: creati `pokemon-castelli-Pokemon_center_ariccia.tmj` e
  `pokemon-castelli-poke_market_ariccia.tmj` (cloni del template già usato per Monte Porzio/Rocca di
  Papa), registrati in `MAPPE` (`pokecenter_ariccia`/`mart_ariccia`), porte + spawn aggiunti su
  `Ariccia.tmj`/`.tmx`. Venditore speciale: `apriVenditoreSpecialeAriccia()` (`js/app.js`), NPC
  dedicati in `dati/npc.js` (Adalgiso al market, Serafina la speciale — evitati nomi duplicati con
  Ombretta/Learco già usati altrove ad Ariccia), merce splittata da un `mk-ariccia` orfano già
  presente in `js/data.js` (base vs `mk-ariccia-speciale`: Pietra Sole + Dente Oscuro). **Albano e
  Rocca di Papa avevano GIÀ pokecenter/market dedicati** (sessione 36): non rifatti, solo verificati.
  **Genzano non ha ancora nessuna mappa**: fuori scope, nessuna azione possibile.
- **Bug corretto — collisione ID trainer percorso_7**: gli allenatori piazzati su `percorso_7.tmj`/
  `.tmx` usavano gli id `all-gm-1..8`/`all-gm-extra-1/2`, già occupati da Percorso 3 (Lv9-14) in
  `dati/trainer.js` — puntavano ai dati/allo stato sbagliati. Rinominati in `all-p7-1..8`/
  `all-p7-extra-1/2` (sia `.tmj` che `.tmx`) con dati propri nuovi, Lv 38-44 (tra l'asso di Rocca di
  Papa e il cap di Albano). Verificato a runtime (claude-in-chrome): `DATI_TRAINER['all-p7-1']` ha i
  dati giusti, nessun `all-gm-*` residuo su percorso_7.
- **5 nuovi trainer ad Ariccia** (`all-ariccia-1..5`, Lv49-52, tema Buio in avvicinamento alla
  palestra di Ombretta): prima la città aveva solo NPC/dialogo. Posizioni segnaposto in
  `Ariccia.tmj`/`.tmx`, Luca le sposta.
- **Tabelle incontri mancanti**: `dati/incontri.js` non aveva NESSUNA voce per monteporzio,
  rocca_di_papa, percorso_7, albano, percorso_8, zona_safari, percorso_9, ariccia — quindi anche
  dove l'erba/acqua fosse disegnata giusta, non usciva nessun incontro. Aggiunte le 8 tabelle
  (specie inedite rispetto a quelle già usate altrove, livelli progressivi 24-30 → 46-52) + un
  rettangolo `erba_alta` segnaposto su ciascuna delle 8 mappe (nessuna ne aveva uno). Verificato a
  runtime che tutte e 8 le chiavi sono in `DATI_INCONTRI`.
- **Warp**: percorso_7/8/9, zona_safari, ariccia sono nello stesso cluster di albano — la camminata
  continua tra loro non richiede warp (bordo cluster), quindi "mancavano i warp" lì era normale, non
  un bug. Aggiunti solo quelli nuovi verso pokecenter/mart Ariccia (vedi sopra).
- Validato con `node --check`/`JSON.parse`/parser XML tutti i file toccati; server locale verificato
  200 su tutti; testato dal vivo con claude-in-chrome (cluster Ariccia/percorso_7/albano si caricano
  senza errori console, NPC/trainer corretti, pokecenter/mart Ariccia caricano con gli NPC giusti).

### Prossimo passo
1. Luca riposiziona in Tiled: 5 trainer Ariccia, 10 trainer percorso_7 (nuovi id), doors pokecenter/
   market Ariccia, gli 8 rettangoli `erba_alta` segnaposto (oggi coprono solo tile 4-10 in alto a
   sinistra di ciascuna mappa, quasi certamente non su erba vera — ricorda: il rettangolo NON deve
   coprire l'erba, serve solo a dare l'id, l'erba-tile vera genera incontri da sola ovunque sia).
2. Riaprire il progetto in Tiled per vedere i Custom Types colorati sui trigger.
3. Confermare a vista che l'opacità notte 0.75 vada bene (o vada ritarata) e controllare se anche
   alba/tramonto (0.10/0.12) risultano troppo deboli con lo stesso problema di contrasto.

---

## Sessione 5 agosto 2026 (seconda parte) — Animazione acqua, cutscene, Ariccia/Sfida dei Porchettari

### Animazione acqua e cascate
- Animato il tileset `Sea` (autotile a 8 fotogrammi, bordi/angoli inclusi) e i tileset `Waterfall`/
  `Waterfall crest`/`Waterfall bottom` (4 fotogrammi lineari, oggi usati da Percorso 5). Nuove funzioni
  in `js/map.js`: `_registraAcquaAnimata`/`_registraCascataAnimata` + `_animaAcqua`, con **culling sulla
  vista camera** (necessario: su cluster grandi tipo Castelli_lakes, animare ANCHE le celle fuori
  schermo bloccava il thread principale e sembrava un freeze del gioco).
- I tile GBA statici (Outside/Emerald_Outside) restano fermi: non hanno fotogrammi alternativi nel PNG
  (l'originale animava via palette-cycling hardware, perso nel rip). Percorso 2 è stato ridipinto da
  Luca con `Sea.tsj` per animare davvero; la sua cascata resta statica finché non si ridipinge anche
  quella con `Waterfall`/`crest`/`bottom` (vedi guida data a voce, non in un doc).

### `clusters.js` — disallineamenti trovati e corretti più volte
- Il file va rigenerato (`python strumenti/genera_clusters.py`) **ogni volta** che un `.world` cambia in
  Tiled — non basta farlo una volta a inizio sessione. In questa sessione si è disallineato più volte
  (Frascati/Grottaferrata, poi Castelli_prima con un resize sostanziale di Percorso 1/1b) e ha causato
  sintomi fuorvianti ("le mappe sembrano spostate", NPC irraggiungibili). Diagnosticato anche un
  problema distinto: **alcuni `.tmj` sono export vecchi rispetto al `.tmx`** che Luca modifica in Tiled
  (marino, Zona Safari, Ariccia erano stale di 50+ ore) — vanno riesportati da Tiled quando succede,
  non è un bug del motore.
- **Lezione operativa importante**: mai modificare un `.tmj` a mano quando esiste il `.tmx`
  corrispondente — il prossimo export da Tiled lo sovrascrive silenziosamente (successo con
  Borgata Tuscolana, la modifica è sparita). Da qui in poi: `.tmx` sempre come sorgente per le mappe
  già esistenti, oppure meccanismi solo-codice (vedi `CUTSCENE_SPAWN`) per i test rapidi.

### Sistema cutscene (nuovo)
- `dati/cutscene.js` + esecutore in `js/map.js` (`_giocaCutscene`): passi supportati — `dialogo`,
  `aspetta`, `flag`, `muovi_npc`, `muovi_player`, `muovi_npc_verso_giocatore` (nuovo: cammina verso il
  giocatore da qualsiasi posizione, path a 2 assi), `guarda`, `nascondi_npc`/`mostra_npc`, `camera`/
  `camera_reset`. Tre modi per farle partire: NPC con `cutscene:` in `dati/npc.js`, oggetto Tiled
  `trigger_cutscene` (con [A] o `quando: 'spawn'` per farle partire da sole), o tabella `CUTSCENE_SPAWN`
  in `js/map.js` per test rapidi senza toccare nessuna mappa.
- Guida completa per l'utente in `docs/GUIDA-CUTSCENE.md` (vocabolario, come descrivere una scena,
  come impostarla su Tiled).
- Aggiunto anche un motore generico per NPC temporanei (`_spawnNpcTemp`/`_distruggiNpcTemp`): sprite
  creati al volo, non legati a un oggetto Tiled, per scene dove "qualcuno ti viene incontro" senza
  doverlo piazzare a mano su ogni mappa.

### Percorso_11 e collegamento_Cotral — primi eventi (posizioni provvisorie, Luca le sistema)
- Aggiunto layer `eventi` a entrambe (prima non esisteva): masso Forza + warp verso `rocca_di_papa` +
  2 allenatori generici su Percorso_11; Spaccaroccia + warp verso `nascondiglio_cotral` (mappa non
  ancora esistente, toast placeholder) + 2 grunt CoTrAL su collegamento_Cotral.
- **Riservato uno sprite dedicato al Team CoTrAL**: `NPC 24` (`COTRAL_GRUNT_SPRITE`, stesso trattamento
  di `NPC 20` per il GdF — tolto dal pool di fallback casuale). Occhio: **non NPC 22**, già usato da
  Adriano il Porchettaro ad Ariccia — c'è stato un tentativo sbagliato poi corretto in sessione.
- Nessuna delle due mappe è ancora registrata in `MAPPE`/nei cluster (aspetto che Luca sistemi le
  posizioni prima di cablarle).

### Ariccia — Sfida dei Porchettari (nuova, completa e testata)
- Rigenerato `Ariccia.tmj` dal `.tmx` corrente (era stale di 4 giorni). Aggiunti 3 NPC: **Learco**
  (`ariccia_sfida_porchettari`, innesca la sfida) + 2 NPC di riempimento sagra.
- Meccanica completa in `js/map.js` (`avviaSfidaPorchettari`) + `js/app.js` (`sfidaPorchettari`):
  gate orario **23:00–02:00** (altrimenti "Non vedi che stiamo ancora allestendo?!?"), poi 5 lotte in
  sequenza contro `porchettaro_sfida_1..5` (dati/trainer.js, Lv 46-50), con un NPC "fantasma" che tra
  una lotta e l'altra cammina verso il giocatore annunciandosi ("Sono il numero N, fatti sotto!").
  Vinte tutte e 5: **Piuma Iridescente**, una tantum (`stato.flags.piuma_porchettari`).
- **Testato dal vivo nel browser** (claude-in-chrome): gate orario, dialogo, lotta 1, vittoria, cameo
  del numero 2, lotta 2 — tutto verificato funzionante, nessun errore in console.
- Risolve narrativamente **D7** di `docs/TODO.md` (dungeon dei porchettari → in realtà è questa sfida
  a raffica, non un dungeon fisico) — da riportare in `docs/BIBBIA-NARRATIVA.md`/`TODO.md` alla
  prossima sessione di documentazione.

### Prossimo passo
- Riportare la risoluzione di D7 (Piuma via Sfida dei Porchettari, non dungeon) nei documenti di design.
- Quando Luca sistema le posizioni di Percorso_11/collegamento_Cotral: registrarle in `MAPPE`.
- CLAUDE.md ha ancora la preview di modifiche mostrata a fine sessione di documentazione, non
  applicata — resta in sospeso finché Luca non conferma.

---

## Sessione 5 agosto 2026 — Documentazione: storia canonica STORIA.md (sola documentazione, nessun codice)

### Cosa è stato deciso
- Luca ha fornito **`STORIA.md`**, testo narrativo autorevole che **sostituisce integralmente** ogni
  versione precedente della trama presente nel progetto — inclusa **`docs/STORIA_COMPLETA.md`**, che
  la nota qui sotto (§ TRACCIAMENTO STORIA) indicava come fonte di verità: **non lo è più**. Da questa
  sessione la fonte di verità narrativa è `docs/BIBBIA-NARRATIVA.md` v3.
- Riportato in `docs/BIBBIA-NARRATIVA.md` (v3): due capi GdF (Pietra Rossa/Grotta del Vulcano, Pietra
  Blu/rifugio di Marino), password del rifugio di Marino ora in **3 parti**, Museo di Nemi senza le
  pietre (pista fredda), Team CoTrAL attivo **durante** il gioco (non solo post-Lega) in tre tempi,
  **Camilla** capopalestra di Genzano (sostituisce "Flora"), scontro Osservatorio in **doppio** con
  Camilla (Jirachi, Master Ball), **due rivali** (Remo=Campione, secondo rivale nuovo dà il Braciere
  all'uscita di Via Vittoria), **treno** per Lugia, tuta spaziale per Deoxys dalla sconfitta di Mewtwo.
- Aggiornato `docs/STATO-PROGETTO.md`: verificate nel codice reale diverse voci che risultavano stale
  dalla fotografia del 3 agosto (Marino/Monte Porzio/Rocca di Papa/Osservatorio erano molto più avanti
  di quanto documentato). Trovato un **bug nuovo** (id Tiled del capopalestra di Monte Porzio
  disallineato dalla chiave dati) e un **gap nuovo** (nessuna palestra interna per Rocca di Papa).
- Riscritto `docs/TODO.md` con la struttura a gruppi (A-F) richiesta e le domande D1-D21 (D19-D21
  nuove, emerse verificando la storia nuova contro i documenti esistenti).
- Proposte modifiche a `CLAUDE.md` (sezioni Stack tecnico/Architettura file da riallineare al motore
  Tiled reale, tabella MN, Team GdF) — **mostrate a Luca per approvazione, non ancora scritte sul
  file** in attesa di conferma.
- **Nessun file di codice toccato in questa sessione** (regola d'ingaggio del prompt).

### Contraddizioni trovate, non risolte (elencate, non decise da Claude Code)
Vedi il messaggio di fine sessione per l'elenco completo. In sintesi: STORIA.md cambia in modo
sostanziale rispetto sia a `BIBBIA-NARRATIVA.md` v2 sia a `docs/STORIA_COMPLETA.md` (che tra loro
erano già disallineati da tempo, vedi conflitto storico su Crasso qui sotto). Le domande aperte sono
tutte in `docs/TODO.md` (Gruppo F, D1-D21).

### Prossimo passo
Nessuna implementazione fino a nuove istruzioni — questa sessione era di sola documentazione. Quando
Luca deciderà le domande aperte (in particolare l'identità dei due capi GdF e il destino di
Fulvia/Tarcisio/Crasso, oggi presenti nel vecchio sistema dati ma non nella storia nuova), si potrà
riprendere con l'implementazione a partire dal Gruppo A di `docs/TODO.md`.

---

## 🗺️ TRACCIAMENTO STORIA (storico — vedi nota 5 agosto 2026 in cima al file)

> ⚠️ **SUPERATO dalla sessione del 5 agosto 2026**: `docs/STORIA_COMPLETA.md` NON è più la fonte di
> verità narrativa. `STORIA.md` (fornito da Luca) l'ha sostituita integralmente, riportata in
> `docs/BIBBIA-NARRATIVA.md` v3. La sezione sotto resta come **registro storico** di cosa era stato
> costruito sotto la vecchia storia (non cancellata per regola di roadmap) ma **non va più usata come
> riferimento per decidere cosa implementare**: molti dettagli sotto (boss unico GdF all'Abbazia,
> Fulvia/Crasso nei lab CoTrAL, MN Surf/Forza/Volo dati da Moro/Osservatorio/Faustino, Lugia via
> radura su Monte Cavo, Genzano="Flora") sono in conflitto diretto con la storia nuova — vedi
> `docs/TODO.md` domande D19-D21 e il riepilogo contraddizioni della sessione 5 agosto.

> Da tenere aggiornato ogni sessione che tocca narrativa/dungeon. `docs/STORIA_COMPLETA.md`
> è la versione più recente e **sovrascrive** dettagli più vecchi di CLAUDE.md/BIBBIA-NARRATIVA
> quando sono in conflitto (es. nomi medaglie, chi dà quale MN, chi è il boss finale).

**⚠️ Conflitto da chiarire con l'utente, non ancora risolto:** nel vecchio sistema
(sessione 12, F10) **Crasso** è il Comandante GdF, sconfitto nel Lab2 vicino Albano.
In `STORIA_COMPLETA.md` invece **Crasso gestisce il Lab CoTrAL #2 ad Ariccia**, e il
boss GdF finale è un **Comandante senza nome all'Abbazia (Atto 7, post-Lega)**. Non ho
toccato nulla del vecchio Crasso/Lab2: va deciso se rinominare/riassegnare prima di
ricostruire quella parte.

### Team GdF (obiettivo: risvegliare Kyogre e Groudon)
- [x] Atto 1 — Abbazia (Grottaferrata): 3 grunt, porta sbarrata.
- [ ] Atto 2 — Lab GdF #1 vicino Marino (mappa non ancora creata).
- [x] Atto 3 — Documento a Castel Gandolfo: 7 grunt, flag `documentoVillaOttenuto`.
- [~] Atto 4 — Furto al Museo delle Navi di Nemi: esiste una cutscene vecchia
      (sessione 12) ma ruba le "Sfere", non l'Orb Rossa/Blu di STORIA_COMPLETA — da
      riallineare (nomi oggetti, flag `orb_rubate`).
- [~] Atto 5 — Lab GdF #2 vicino Albano: esiste nel vecchio sistema con Crasso come
      boss finale (vedi conflitto sopra) — in STORIA_COMPLETA è solo un "tentativo
      fallito", non l'ultima tappa.
- [x] Atto 6 — Presidio Grotta del Vulcano: **fatto oggi**, trainer
      `gdf_grunt_grotta_vulcano_1` + NPC-gate `gdf_gate_grotta_vulcano` (sparisce a
      flag `gdf_sconfitto`) piazzati al centro della piazza di Rocca di Papa, in
      attesa che l'utente li sposti dentro il dungeon quando lo costruisce.
- [ ] Atto 7 — Climax Abbazia post-Lega (Comandante, Pietra Rossa + Pietra Blu, flag
      `gdf_sconfitto`) → sblocca Kyogre (Lago Albano) e Groudon (Grotta Vulcano).

### Team CoTrAL (obiettivo: clonare Mewtwo)
- [~] Prima comparsa Osservatorio (Monte Porzio): esiste un NPC `scienziato
      osservatorio` (gate a ≥4 medaglie) su Tiled — da verificare se il dialogo
      corrisponde alla scena descritta in STORIA_COMPLETA.
- [~] Lab CoTrAL #1 Albano (Fulvia, 15 trainer): esiste nel vecchio sistema
      lat/lon, non ancora su Tiled (Albano non è collegata al mondo).
- [~] 4 grunt Ariccia → Piuma Iridescente (Adriano il Porchettaro): esiste nel
      vecchio sistema (F12b), non ancora su Tiled.
- [~] Lab CoTrAL #2 Ariccia (Crasso, 17 trainer): vedi conflitto Crasso sopra.
- [~] Climax Bunkerino (Mewtwo): esiste nel vecchio sistema (F12b), non ancora su Tiled.

### Leggendari (21 totali, vedi STORIA_COMPLETA per condizioni esatte)
- [x] Trio Regi (Tuscolo): unico gruppo davvero giocabile su Tiled oggi.
- [ ] Tutti gli altri 18: definiti solo a livello di documento/vecchio sistema
      lat/lon, da portare sul motore Tiled mappa per mappa.

### MN — stato reale (attenzione, diverso da quanto assunto in sessione 26!)
- **Taglio**: ✅ ottenibile oggi (Frascati, dopo Medaglia Vigna, `donaTaglioFrascati`).
- **Surf**: STORIA_COMPLETA dice **Moro la dà a Marino dopo la vittoria di palestra**
  — diverso dal vecchio `DONATORI_MN` (Nonna Assunta ad Albano, ≥5 medaglie) usato
  nella sessione scorsa. **Non ancora corretto nel codice**: da sistemare quando si
  torna sulla palestra di Marino.
- **Volo**: ✅ Faustino a Rocca di Papa, ≥6 medaglie — coerente con STORIA_COMPLETA.
- **Forza**: ✅ **cambiata scelta di design (sessione 30, richiesta utente)**: la dà
  **Remo battendolo alla tappa 4** (davanti/dentro Monte Porzio, `trigger_rivale
  tappa:4`), non più l'NPC dell'Osservatorio di STORIA_COMPLETA. Implementato in
  `_avviaLottaTrainer` (map.js): a vittoria, se `dati.rivale && tappa===4`, setta
  `stato.mn.forza = true`. **Divergenza da STORIA_COMPLETA non ancora riportata nel
  documento narrativo** — se resta questa la scelta finale, andrebbe aggiornato lì.

### Sessione 42 — Percorso 7b cablato, animazioni mosse, velo giorno/notte + luci (Frascati centro), tuning velocità/dimensioni battaglia (3 agosto 2026)

Sessione di implementazione (a differenza della 41, solo documentazione). Tutto testato con
`node --check`/`JSON.parse` e verifica 200 sul server locale sui file toccati; **nessuna
verifica a schermo** (nessun Playwright disponibile), il riscontro finale è dell'utente.

- **Percorso 7 / Percorso 7b / Spiaggia di Albano cablati**: `percorso_7b` registrato in
  `MAPPE` (`js/map.js`), aggiunto warp/spawn bidirezionale segnaposto tra `percorso_7` e
  `Percorso_7b` (`.tmj`+`.tmx`, per restare visibili anche in Tiled). L'utente ha poi
  posizionato **lui stesso** `Percorso_7b` dentro `Castelli_lasthree.world` (a ovest di
  `percorso_7`, non a sud come ipotizzato); rigenerato `js/clusters.js` con
  `strumenti/genera_clusters.py` sulla sua posizione — nessun warning di allineamento.
  Risultato: **Percorso 7 ↔ Percorso 7b è camminata continua** (stesso cluster, i warp
  segnaposto diventano automaticamente inerti); **Percorso 7b ↔ Lago di Albano (Spiaggia)**
  resta un warp con dissolvenza (world diversi) — e si è scoperto che l'utente aveva **già**
  cablato quel lato (warp/spawn su `Percorso_7b.tmj` e `Lago di Albano.tmj` combaciano
  perfettamente via `normTxt`), nessun intervento necessario lì.
- **Gate NPC su Via dei Laghi**: nuovo NPC `guardia_via_dei_laghi_p7` (`dati/npc.js`),
  piazzato come oggetto `gate:true` davanti al warp verso Percorso 7 su `via_dei_laghi.tmj`/
  `.tmx`, condizione `medaglie >= 5` (soglia scelta di default, coerente con "Rocca di Papa
  sblocca Percorso 7/Spiaggia" — MAI confermata esplicitamente dall'utente, da rivedere se
  serve un'altra soglia).
- **Animazioni delle mosse** (`js/battle.js`+`style.css`): dispatcher `animaMossa()` con 3
  template generici scelti da `mossa.classe`/`mossa.potenza`/`mossa.tipo` (già letti da
  PokéAPI, nessun dato nuovo): fisica = balzo dell'attaccante + tremore schermo; speciale =
  proiettile colorato dal tipo che vola verso il bersaglio + tremore; stato = scintillio
  colorato sul vero bersaglio (sé o avversario). Copre automaticamente tutte le mosse
  esistenti, zero animazioni scritte a mano. Su richiesta utente, effetti ingranditi
  (proiettile 26→46px, scintillio 100→170px, bagliore/tremore/balzo quasi raddoppiati).
- **Velo giorno/notte** (`js/map.js`, `_fasciaVisiva`/`_aggiornaVeloTempo`): 4 fasce con gli
  orari esatti dati dall'utente (alba 05-07, giorno 07-18, tramonto 18-20, notte 20-05), un
  rettangolo Phaser fisso sopra la mappa (depth 10000, sotto la UI DOM). Interni
  (`interno:true` in `MAPPE`) sempre senza velo; supporto pronto per `grotta:true` (velo
  notte fisso, nessuna mappa lo usa ancora). **Attivo per ora SOLO su `frascati_centro`**
  (lista `MAPPE_CON_VELO_TEMPO`, da ampliare quando l'utente conferma) — richiesto
  esplicitamente come test prima di estendere a tutte le mappe esterne. Calibrato a più
  riprese su richiesta utente: notte opacità 0.45→**0.52** (più scura), alba/tramonto tolto
  il rosa e ridotti a **0.10/0.12** (molto leggere, dopo un primo tentativo troppo intenso
  a 0.28/0.35).
- **Layer `luci`**: scoperto che l'utente aveva già piazzato 37 oggetti `type:"luce"`
  (proprietà `colore`, es. `#ffd27f`) su un `objectgroup` chiamato `luci` in
  `frascati_centro.tmj` — **il motore non lo leggeva affatto** (solo il layer `eventi` era
  parsato come oggetti), per questo "non appariva" (non era un problema di colore). Aggiunto
  `parseLuci()` + `_creaLuci()`/`_aggiornaVisibilitaLuci()`: due cerchi per punto luce
  (bagliore + nucleo, colore da Tiled), visibili **solo in fascia notte**, mai negli interni;
  cablato sia nel caricamento mappa singola sia nei cluster (con offset corretto) e dentro
  `_aggiornaVeloTempo()` così si accendono/spengono insieme al velo.
- **Tuning velocità/dimensioni** (richiesta utente): sprite Pokémon in battaglia ingranditi
  (nemico 250→320px, proprio 310→380px, proporzioni mobile aggiornate); testi di battaglia
  più rapidi a x1 (1700→1150ms per messaggio, scala ancora con ⏩ x2/x3/x5); camminata più
  veloce (`DURATA_PASSO_MS` 150→110, corsa 95→75, bici 65→50 — il booster ⏩ resta escluso
  dal movimento, come deciso in sessione 32). **Non toccato**: la sensazione "a scatti" del
  movimento segnalata dall'utente — nessun bug evidente trovato leggendo il codice (il tween
  è già sincronizzato), ma non verificato a schermo; se persiste dopo l'aumento di velocità,
  va indagato dal vivo (serve sapere esattamente quando si nota di più).
- **Promemoria per prossime sessioni**: (1) estendere il velo giorno/notte e il layer luci
  alle altre mappe esterne quando l'utente conferma che il test su Frascati centro va bene;
  (2) verificare a schermo il confine walkable Percorso 7↔Percorso 7b (posizioni segnaposto
  dei warp ora inerti, ma il terreno dei due bordi deve combaciare visivamente — responsabilità
  di disegno dell'utente); (3) soglia medaglie del gate `guardia_via_dei_laghi_p7` da
  confermare.

### Sessione 41 — Riscrittura narrativa Rocca di Papa/CoTrAL, MN Spaccaroccia, doppio flag oggetto/permesso, docs/TODO.md (3 agosto 2026)

**Sessione di sola documentazione** (nessun `js/`/`dati/` toccato), su richiesta esplicita
dell'utente, a partire da un nuovo prompt narrativo con arco Rocca di Papa/Monte Cavo/CoTrAL.

- **Deciso**: il percorso Grottaferrata→Rocca di Papa (bivio Monte Cavo) rompe di proposito
  l'ordine lineare delle palestre, ma resta gate-ato dietro le medaglie di Marino e Monte Porzio.
  MN **Spaccaroccia** introdotta come nuova MN "core" (oggetto a Castel Gandolfo, permesso da
  Marino P3) — prima non era mai stata assegnata narrativamente nonostante il motore la supporti
  già (`trigger_spaccaroccia`). **MN Forza e Volo cambiano fonte** rispetto a quanto già in codice:
  Forza non sarà più legata a Remo/tappa 4 (`js/map.js:3181`, scelta sessione 30) ma a un NPC di
  Rocca di Papa; Volo non sarà più Faustino post-6ª medaglia ma il miniboss del dungeon innevato
  (Articuno). **Non ancora implementato nel codice** — solo deciso a livello narrativo, vedi
  `docs/TODO.md` D16/D17.
- **Nuovo arco CoTrAL**: nascondiglio ai piedi di Monte Cavo (mappa nuova), funivista rapito,
  luogotenente CoTrAL (indipendente, non il miniboss di Articuno), lettera = prima parte della
  password (2 parti) del Laboratorio GdF di Marino. Museo delle Navi di Nemi (presidio GdF) resta
  inaccessibile finché non si sconfigge il Team CoTrAL a Rocca di Papa — incrocio voluto tra i due
  archi, confermato dall'utente, senza mescolare i due team.
- **Ho-Oh**: nuova meccanica, dungeon dei porchettari ad Ariccia sblocca la Piuma, poi una vera
  **grotta di Ho-Oh** (non più solo il Ponte) apribile dopo la palestra di Ariccia mostrando la
  Piuma. Condizione di cattura (dopo Lega o dopo 8ª palestra) lasciata **aperta**.
- **Risfida allenatori** (nuova, non implementata): dopo N giorni, EXP come ricompensa principale,
  soldi dimezzati rispetto alla prima vittoria, livello mai oltre l'asso del capopalestra successivo
  alla zona dell'allenatore.
- **Conflitto Crasso** (GdF vs CoTrAL, già aperto da sessioni precedenti) **deliberatamente non
  risolto**: l'utente ha scelto di piazzare prima luoghi/eventi e decidere i nomi dei boss dopo.
- **Documenti aggiornati**: `CLAUDE.md` (PATH, MN, team antagonisti, leggendari Articuno/Ho-Oh,
  risfida allenatori), `docs/BIBBIA-NARRATIVA.md` (città Marino→Genzano riscritte, sezione DA
  DEFINIRE ampliata), `docs/STATO-PROGETTO.md` (§3 nuove mappe con split LUCA/CLAUDE CODE, §4 GdF
  esteso + nuova §4-bis CoTrAL, §6 tabella MN a due colonne corretta — Taglio **era già** ottenibile
  in partita, la vecchia tabella del 7 luglio era disallineata dal codice —, nuova §9 sistemi
  mancanti).
- **Nuovo `docs/TODO.md`**: to-do unica Gruppo A (narrativa/mappe, ogni voce spezzata LUCA/CLAUDE
  CODE dove serve disegno) / B (sistemi di gioco) / C (sensazione al tatto e grafica) / D (stato di
  tutte le domande D1-D20, con quelle ancora completamente aperte elencate in fondo: D8 modifica
  Ariccia, D14 stile sprite "cartoon" non PokéAPI standard, D15 migliorie Box, D20 identità Crasso,
  seconda parte password Marino, nome boss GdF Marino, soglia medaglie Spiaggia Albano, dettagli
  nascondiglio CoTrAL e Zona Safari).
- **Non toccato**: nessun file `.tmj`/`.tmx`, nessun `js/`, nessun `dati/*.js` — puro lavoro sui
  documenti. Il prossimo passo è di Luca (disegno mappe) o, quando pronto, cablaggio da parte di
  Claude Code seguendo `docs/TODO.md` Gruppo A riga per riga.

### ⚠️ APERTO all'inizio della prossima sessione (fine sessione 37, notte 31 luglio 2026)
1. **Bug segnalato dall'utente**: il masso spingibile (`masso_marino_1`) **torna alla
   posizione originale dopo essere uscito ed essere rientrato nella stanza**
   (Centro/Market/Palestra di Marino → torna fuori). Rilettura statica di tutta la
   catena (`_creaMassi`/`_provaSpingiMasso`/`stato.massiSpostati`/cluster
   `Castelli_lakes`) non ha trovato una causa certa — sembrava già dover
   funzionare. **Intervento fatto senza conferma che risolva**: la chiave di
   salvataggio non usa più `mappaCorrente`/`ev._mappaChiave` (poteva teoricamente
   disallinearsi tra scrittura e rilettura in un cluster) ma solo l'`id`
   dell'oggetto, globale come per NPC/trainer. Aggiunti **due `console.log`**
   (`[Masso] ...`) in `_provaSpingiMasso` (quando spingi) e `_creaMassi` (quando la
   mappa si ricarica): **se il bug persiste, chiedere all'utente cosa stampa la
   console (F12) nei due momenti** — dice subito se il valore non viene scritto,
   o se viene scritto ma non riletto (e con quale mismatch di chiave). Non
   rimuovere i log finché il bug non è confermato risolto.
2. **Parola d'ordine di Marino — redesign in sospeso**: l'utente non vuole più che
   `npc_password_marino` la riveli subito con un dialogo/scelta Sì-No (quello che
   ho implementato in sessione 37). Vuole che la parola venga rivelata da
   **"qualcosa che accade" mentre si gioca** (quest, evento, sconfiggere qualcuno,
   origliare una scena, trovare un oggetto, orario/giorno preciso — non ancora
   specificato). **Chiedere all'utente cosa ha in mente prima di implementare**:
   la funzione attuale `rivelaParolaMarino()` (app.js) e il flag
   `stato.flags.marino_password` restano validi come "meccanismo di sblocco"
   (`guardia_marino` già legge quel flag via `gate`/`condizione`, non cambia);
   cambia solo COME/QUANDO il flag diventa vero — oggi è un dialogo diretto, va
   sostituito con l'evento che deciderà l'utente.

### Sessione 40 — Snorlax invisibile in Tiled (mai scritto nel .tmx) + Percorso_8 ricollegato ad Albano (camminata continua) (1 agosto 2026)

- **Bug: Snorlax "non si trova" in Tiled**: tutti gli oggetti della sessione 37
  (`snorlax_marino`, `npc_flauto_marino`, `npc_password_marino`,
  `guardia_marino`, `masso_marino_1`, `pulsante_marino_1`, `cancello_marino_1`)
  erano stati scritti **solo in `marino.tmj`** (il file letto dal motore), mai
  in **`marino.tmx`** (il file che l'utente apre in Tiled per editare) — per
  questo erano visibili in gioco ma introvabili nell'editor. Aggiunti anche a
  `marino.tmx`, stesse posizioni/proprietà del `.tmj` (layer `eventi`,
  oggetti id 405-411).
  **⚠️ Scoperto un problema preesistente e più ampio**: `marino.tmx` ha ID
  oggetto duplicati diffusi in tutto il file (contatore `nextobjectid`
  disallineato da tempo, non causato da questa sessione). Non toccato — i 7
  nuovi oggetti hanno ID sicuramente unici (405-411), ma la pulizia generale
  del file resta da fare in futuro se dà problemi in Tiled.
- **Bug: "Castelli_lasthree non è continuo, Albano non collegato a Percorso 8"**:
  causa= **`Percorso_8` (e `Percorso_9`/`Ariccia`/`Zona Safari`/`Percorso_10`)
  non erano MAI stati registrati nel registro `MAPPE`** (`js/map.js`) — senza
  una voce lì, `strumenti/genera_clusters.py` non può includerli nel cluster
  (ogni mappa del `.world` deve avere una chiave corrispondente), quindi
  `js/clusters.js` conteneva solo `percorso_7`+`albano`, e Percorso_8 restava
  fuori: da Albano non c'era alcun collegamento, nemmeno a warp.
  - **Registrate in `MAPPE`**: `percorso_8`, `percorso_9`, `ariccia`,
    `zona_safari` (coordinate lat/lon segnaposto, non usate dal motore Tiled
    ma tenute per coerenza col resto del registro).
  - **`Zona Safari.tmj` creato** (mancava, esisteva solo il `.tmx`): convertito
    dal `.tmx` con uno script Python one-off (stessi layer/tileset/oggetti,
    validato con `JSON.parse` e confronto lunghezza dati contro `width*height`).
  - **`Percorso_10` volutamente NON registrato**: la mappa non ha ancora
    terreno disegnato (tutti i layer a zero, nessun tileset) — registrarla
    avrebbe creato una mappa vuota camminabile finta. Resta un warp/fade
    "zona non disponibile" finché l'utente non la disegna.
  - **`strumenti/genera_clusters.py` reso tollerante**: prima usciva con
    errore fatale (`sys.exit(1)`, nessun file generato) se anche una sola
    mappa del `.world` non aveva una voce in `MAPPE` — bloccava la
    rigenerazione dell'INTERO `clusters.js` per colpa di una singola mappa
    non pronta (come Percorso_10 ora). Cambiato in un avviso che esclude solo
    la mappa non pronta e genera comunque il resto.
  - **`js/clusters.js` rigenerato**: cluster `Castelli_lasthree` ora ha 6
    mappe (`percorso_7, albano, percorso_8, zona_safari, percorso_9, ariccia`)
    con offset coerenti col `.world` — Albano↔Percorso_8 è bordo adiacente
    (offsetX Percorso_8 = 100 = offsetX Albano 60 + larghezza 40), quindi
    camminata continua senza dissolvenza, come Percorso_7↔Albano.
- Validati `node --check`/`JSON.parse` su tutti i file toccati; server locale
  verificato 200 su tutti i `.tmj` nuovi/modificati. **Non verificato a
  schermo** (nessun Playwright): l'utente deve controllare che il bordo
  Albano↔Percorso_8 sia effettivamente camminabile senza salto/buco visivo
  (dipende da come sono disegnati i bordi delle due mappe in Tiled — il
  motore ora le tratta come contigue, ma un disallineamento grafico dei
  bordi non verrebbe rilevato dai controlli automatici).
- **Ancora aperto**: Zona Safari e Percorso_9/Ariccia sono ora raggiungibili
  camminando da Albano ma non hanno ancora warp/porte verso le mappe
  successive (es. Percorso_9→Ariccia, Ariccia→Percorso_10) — i warp interni
  a un cluster vengono "spenti" automaticamente se puntano a una mappa dello
  stesso cluster (già contigua), ma i collegamenti VERSO l'esterno del
  cluster (es. verso Percorso_10 quando sarà pronta) andranno aggiunti a mano.

### Sessione 39 — Bug trovato in sessione 38 (contenuto mai piazzato su alcune mappe), fix + oggetti/gate a pagamento Zona Safari (1 agosto 2026)

- **Causa del "non funziona, solo alcune mappe integrate"**: la sessione 38 aveva
  scritto correttamente le voci dati (`dati/npc.js`/`dati/trainer.js`) per TUTTO
  il contenuto nuovo, ma **non aveva effettivamente piazzato gli oggetti Tiled**
  corrispondenti in due mappe:
  - **`Percorso_8.tmx`/`.tmj`**: non aveva **nessun** `objectgroup eventi`
    (mancava proprio il layer) — i 5 trainer `all-p8-1..5` e i 2 NPC
    `porchettaro_p8_1/2` esistevano solo come dati, invisibili in gioco.
  - **`albano.tmj`**: il layer `eventi` c'era ma conteneva solo `albano_npc1/2`
    (i vecchi); `albano_npc3..6` non erano mai stati aggiunti come oggetti.
  - Verificate invece a posto (dati + piazzamento coerenti in `.tmx` e `.tmj`):
    `Percorso_9`, `Ariccia`, `Zona Safari` (layer `eventi` vuoto come da roadmap).
- **Fix applicati** (solo sui file `.tmj`/`.tmx` di gioco, nessuna registrazione
  in `MAPPE`/warp — resta compito dell'utente come da sessione 38):
  - `Percorso_8.tmx` **e** `Percorso_8.tmj`: creato `objectgroup eventi`,
    piazzati i 5 trainer + 2 NPC Porchettaro (posizioni segnaposto).
  - `albano.tmj`: aggiunti `albano_npc3..6` come oggetti (posizioni segnaposto).
  - `Percorso_10.tmx`: aggiunto `objectgroup eventi` vuoto (la mappa resta senza
    terreno disegnato, come segnalato in sessione 38 — nessun contenuto
    inventato lì, solo il contenitore).
- **Oggetti a terra aggiunti** (tipo `oggetto`, posizioni segnaposto, l'utente li
  sposta in Tiled): MT + Iperpozione/Revitalizzante/Pietra Luna sparsi in
  `albano.tmj`, `Percorso_8`, `Percorso_9`, `Ariccia`, `Zona Safari`.
- **Nuova meccanica: ingresso a pagamento (Zona Safari)** — riuso del pattern
  guardia/parola d'ordine di Marino, stavolta con Pokéyen invece di una parola:
  `pagaIngressoSafari()` (`js/app.js`, `PREZZO_INGRESSO_SAFARI = 500`) scala
  `stato.soldi` e setta `stato.flags.safari_pagato` (permanente, si paga una
  volta sola). NPC `npc_ingresso_safari` (azione: `pagaIngressoSafari`) e
  `guardia_safari` (`gate:true`, `condizione:"safari_pagato"`, blocca finché non
  pagato) aggiunti in `dati/npc.js` e piazzati in `Zona Safari.tmx` (nessun
  `.tmj` per questa mappa, come già in sessione 38 — non ancora cablata).
- Validati con `node --check`/`JSON.parse`/parser XML tutti i file toccati;
  server locale avviato e verificato 200 su tutti i file modificati.
  **Non verificato a schermo** (nessun Playwright disponibile): posizioni
  segnaposto NON garantite calpestabili, l'utente le sposta in Tiled.
- **Promemoria**: queste mappe (Percorso_8, Percorso_9, Ariccia, Zona Safari,
  Percorso_10) restano **non raggiungibili in gioco** finché l'utente non le
  registra in `MAPPE` (js/map.js) con warp e collisioni — il contenuto è pronto
  ma non collegato, invariato rispetto a sessione 38.

### Sessione 38 — Snorlax di Marino ricentrato, popolamento world Castelli_lasthree (1 agosto 2026)

- **Snorlax di Marino era invisibile**: gli oggetti sessione 37 (Snorlax, NPC
  Flauto, guardia, masso/pulsante) erano a righe di tile 55-63 mentre la parte
  disegnata di `marino.tmj` arriva solo a riga 49 — erano fuori mappa. Spostati
  al centro della città (tile 29-38, riga 29), stesse distanze relative tra loro.
- **World `Castelli_lasthree.world` popolato** (percorso_7.tmx era già completo,
  non toccato): aggiunto layer `eventi` (mancava) + contenuti a:
  - `albano.tmj` (6ª città): +4 NPC generici (`albano_npc3..6`), oltre ai 2 già presenti.
  - `Percorso_8.tmx` (Albano → Ariccia, cap 46-49): 5 trainer (`all-p8-1..5`) +
    2 NPC "Porchettaro" che alludono alla Sagra/CoTrAL/Adriano.
  - `Percorso_9.tmx` (sale verso Ariccia, cap 48-52): 9 trainer (`all-p9-1..9`).
  - `Ariccia.tmx` (7ª città, Palestra Buio Ombretta): 5 NPC generici + **Adriano
    il Porchettaro** (chiave per Ho-Oh, STORIA_COMPLETA) + 3 Porchettari, tutti
    solo a livello di dialogo/allusione — nessuna meccanica di quest/grunt
    implementata (arriverà con F10/F11).
  - `Zona Safari.tmx`: solo layer `eventi` vuoto (è una vera Safari Zone, niente
    trainer — la logica cattura/incontri va disegnata a parte).
  - `Percorso_10.tmx` **non toccata**: ha solo un layer grezzo "Livello tile 1",
    non ancora nella struttura standard ground/deco/edifici/sopra_testa.
  Dati corrispondenti in `dati/npc.js` (15 nuove voci) e `dati/trainer.js`
  (14 nuovi trainer, id `all-p8-*`/`all-p9-*`).
- **Da fare dopo**: queste mappe non sono ancora collegate al motore — mancano
  le voci in `MAPPE` (js/map.js), i warp tra mappa e mappa, e le collisioni
  (l'utente le farà lui). Finché non sono cablate, questo contenuto non è
  raggiungibile in gioco.

### Sessione 37 — Snorlax addormentato, guardia con parola d'ordine, puzzle masso/pulsante MN Forza (31 luglio 2026)
Tre meccaniche NUOVE nel motore (non esistevano prima), tutte piazzate a **Marino** in
posizione SEGNAPOSTO (l'utente le sposterà dove preferisce disegnando la mappa):

- **Snorlax addormentato, unico esemplare del gioco**: nuovo attributo generico
  `addormentato` sull'oggetto `pokemon leggendario`/`leggendario` (riusa quasi
  tutto il sistema leggendari già esistente — solidità, sprite PokéAPI, cattura
  permanente, fuga impossibile). Finché è addormentato, `[A]` mostra solo un
  toast ("dorme profondamente...") e blocca il passaggio; serve l'oggetto CHIAVE
  **Flauto Pokémon** (nuovo, `OGGETTI_CHIAVE.flauto` in `data.js`) per svegliarlo
  e far partire la lotta vera. Property Tiled: `addormentato:"true"`,
  `sveglia_con:"flauto"` (personalizzabile, riusabile per altri blocchi simili
  in futuro). Il Flauto lo dà un NPC dedicato (`npc_flauto_marino` →
  `donaFlautoMarino()` in `app.js`), piazzato accanto a Snorlax nel `.tmj`.
- **Guardia con parola d'ordine a Marino**: NON servono modifiche al motore — è
  puro riuso del sistema `gate`/`condizione` già esistente (flag generico). NPC
  `guardia_marino` (`gate:true`, `condizione:"marino_password"`) blocca un
  varco finché il flag non è vero; sparisce da solo una volta ottenuto. Il
  flag lo dà un secondo NPC, `npc_password_marino` → `rivelaParolaMarino()`
  (usa `mostraScelta`: "vuoi sapere la parola d'ordine?", poi la rivela e
  setta `stato.flags.marino_password`).
- **Puzzle masso/pulsante (MN Forza)**: meccanica NUOVA generica e riusabile.
  Tre `type` Tiled: `masso` (spingibile camminandoci contro CON la MN Forza, si
  sposta di una casella per volta, posizione salvata per sempre in
  `stato.massiSpostati`), `pulsante` (si attiva per sempre quando un masso ci
  arriva sopra), `cancello_pulsante` (ostacolo solido finché il pulsante
  collegato — property `attivato_da`/`collega` — non è stato premuto). Nuove
  funzioni in `js/map.js`: `_creaMassi`/`_creaSpritesMassi`/`_provaSpingiMasso`/
  `_controllaPulsante`, più un branch in `buildCollGrid` per i cancelli.
  Sprite del masso: `sprites/NO/Characters/Object boulder.png` (primo frame
  32×32, statico). Esempio piazzato a Marino: masso a (36,60), spingendolo 3
  volte verso sud arriva sul pulsante (36,63) che apre un cancello a (33,60).
- **Documentato** tutto in `docs/SCHEDA-TILED-DAL-CODICE.md` (nuove sezioni 12a/12b
  + righe nella tabella riepilogativa finale), così l'utente ha il riferimento
  completo per ridisegnare/spostare questi oggetti in Tiled.
- Validati con `node --check`/`JSON.parse` tutti i file toccati; server locale
  verificato (200 su `marino.tmj` e sullo sprite del masso). **Non verificato a
  schermo** (nessun Playwright disponibile in questa sessione) — in particolare
  le posizioni segnaposto in `marino.tmj` (tx,ty intorno a 33-44, 55-63) NON
  sono garantite calpestabili/libere: potrebbero cadere dentro un edificio o
  una collisione esistente, l'utente deve verificare e spostare in Tiled.
- **Come testare**: vai a Marino, avvicinati alle coordinate indicate sopra.
  Senza Flauto: Snorlax mostra solo il toast "dorme". Prendi il Flauto
  dall'NPC accanto, torna da Snorlax, `[A]` → dialogo → lotta (fuga
  impossibile). Parla con l'NPC della parola d'ordine, poi con la guardia:
  prima del flag ti blocca, dopo sparisce. Con la MN Forza già ottenuta,
  cammina contro il masso in direzione sud 3 volte: dovrebbe atterrare sul
  pulsante e sparire il cancello (verificabile provando ad attraversarlo).

### Sessione 36 — Centro/Market dedicati Monte Porzio e Rocca di Papa, venditori speciali pietre, Mercante degli Scambi nei Centri (30 luglio 2026)
- **Monte Porzio Catone e Rocca di Papa avevano ancora Centro/Market "finti"**: le loro
  porte puntavano a `pokecenter_interno`/`mart_interno`, cioè il file GENERICO di
  Frascati — il venditore lì dentro è sempre stato quello di Frascati
  (`apriMarketFrascati`), quindi visitando il Market di Monte Porzio o Rocca di Papa
  si vedeva sempre la merce economica di Frascati, MAI la propria (`mk-monte-porzio`/
  `mk-rocca-di-papa`, già presenti in `data.js` ma orfane, mai aperte da nessuno).
- **Creati 4 nuovi file dedicati** (stesso layout/tileset generico già usato per
  Marino/Castel Gandolfo/Albano, solo copiato e ricablato):
  `pokemon-castelli-Pokemon_center_monteporzio.tmj`, `pokemon-castelli-poke_market_monteporzio.tmj`,
  `pokemon-castelli-Pokemon_center_rocca_di_papa.tmj`, `pokemon-castelli-poke_market_rocca_di_papa.tmj`.
  Registrati in `MAPPE` (js/map.js): `pokecenter_monteporzio`/`mart_monteporzio`,
  `pokecenter_rocca_di_papa`/`mart_rocca_di_papa`.
- **Porte ricablate**: `monteporzio.tmj` (destinazioni + spawn_id delle 2 porte
  corrette, e sistemato un refuso preesistente: lo spawn di ritorno dal market si
  chiamava per errore "da pokemarket **grottaferrata**" — copia-incolla mai
  corretto — ora "da pokemarket monteporzio"). `rocca_di_papa.tmj` non aveva
  NESSUNO spawn di ritorno dedicato per le sue 2 porte (pc_door/market_door):
  aggiunti "da pokecenter rocca di papa" e "da pokemarket rocca di papa".
- **Venditore "speciale" (pietre evolutive/oggetti da scambio, prezzi alti fissi
  già in `OGGETTI`) esteso a Monte Porzio, Rocca di Papa e Albano**, stesso pattern
  già usato per Marino/Castel Gandolfo: split della merce "rara" fuori dal market
  generico in un secondo NPC dedicato (`mk-<città>-speciale` in `data.js`,
  `apriVenditoreSpeciale<Città>()` in `app.js`, NPC con sprite/nome/dialogo in
  `dati/npc.js`, oggetto piazzato nella mappa del market). Prima Albano vendeva
  pietra_acqua/patroclo mischiati nel market normale; Monte Porzio pietra_luna/
  pietra_tuono; Rocca di Papa pietra_fuoco — ora sono nel negozio "speciale".
- **Mercante degli Scambi** (`interagisciMercanteScambi`, già pronto in `app.js` da
  tempo ma MAI collegato a nessuna mappa): aggiunto NPC generico riusabile
  `mercante_scambi` in `dati/npc.js` e piazzato in TUTTI i Centri Pokémon da Marino
  in poi (Marino, Castel Gandolfo, Albano, Monte Porzio, Rocca di Papa), come da
  promemoria lasciato in sospeso. Posizione segnaposto (60,250) in ogni Centro,
  angolo libero della stanza — l'utente può spostarlo in Tiled se vuole.
- **Box (PC) NON richiedeva nuovo codice**: il tipo oggetto `pc` (toast + tab Box
  del menu ☰, con deposita/preleva già funzionanti) esisteva già in `js/map.js` e
  in tutti i Centri Pokémon di questa sessione era già presente come oggetto
  `box_pc` (copiato dal template) — nessuna modifica necessaria, solo verificato.
- Validati con `node --check`/`JSON.parse` tutti i file `.tmj`/`.js` toccati
  (nessun errore di sintassi); server locale avviato e verificato che tutti i
  nuovi `.tmj` rispondano 200 via HTTP. **Non verificato a schermo** (nessun
  Playwright disponibile in questa sessione): l'utente deve testare a mano.
- **Come testare**: avvia il gioco (`start.bat`), vai a Monte Porzio → entra nel
  Centro Pokémon (cura + Box + parla col Mercante degli Scambi) e nel Market
  (venditore normale con oggetti base + venditore speciale con Pietra Luna/Pietra
  Tuono a ₽2100); stessa cosa a Rocca di Papa (venditore speciale: Pietra Fuoco) e
  ad Albano (venditore speciale: Pietra Acqua + Patroclo). Verifica che uscendo da
  Centro/Market si torni sempre nel punto giusto della città (non altrove).
- **Prossimo passo**: se l'utente conferma che le posizioni degli NPC (Mercante
  degli Scambi a (60,250), venditore speciale nei market a (220,200)) sono
  scomode/sovrapposte a mobili, si possono risistemare in Tiled senza toccare la
  logica.

### Sessione 35 — Percorso 7 registrato e collegato, Atto 4 GdF a Lago di Nemi, fix verificaCondizione (28 luglio 2026)

- **Percorso 7 registrato in `MAPPE`** (js/map.js) e **`js/clusters.js` rigenerato**
  da `strumenti/genera_clusters.py`: ora fa parte del cluster `Castelli_lasthree`
  insieme ad **Albano**, quindi **Percorso 7 ↔ Albano è camminata continua senza
  stacco** (stesso `.world`, bordo adiacente). **Percorso 7 ↔ Lago di Nemi resta un
  warp con dissolvenza** (cluster/`.world` diversi, `Castelli_lasthree` vs
  `Castelli_lakes`): l'utente aveva chiesto di "collegare i due world", ma unirli
  in uno solo per avere camminata continua anche lì è un intervento più ampio non
  ancora fatto — da confermare se è quello che si vuole o se il warp va bene così.
- **Bug corretto**: lo spawn in `percorso_7.tmj` per l'arrivo da Lago di Nemi si
  chiamava per errore `da_percorso 7` (invece di `da_lago di nemi`) — il warp di
  Nemi non avrebbe mai trovato il punto di atterraggio corrispondente. Rinominato.
  **⚠️ Attenzione**: l'utente ha comunicato **dopo** questo fix che intende
  **spostare l'ingresso di Percorso 7** (posizione del warp/spawn verso Lago di
  Nemi) — le coordinate attuali (`warp_Percorso 7` a tile ~0,44 / `spawn_da_lago
  di nemi` a tile ~1,44 dentro percorso_7.tmj) **andranno riallineate** a quelle
  nuove non appena l'utente le ha decise in Tiled. Finché non arriva l'aggiornamento
  da parte sua, il collegamento funziona ma nel punto vecchio.
- **Fix bug in `verificaCondizione`** (js/map.js): confrontava sempre la stringa
  della condizione in minuscolo prima di leggere `stato.flags`, quindi un flag
  camelCase (es. `documentoVillaOttenuto`) non avrebbe **mai** potuto essere usato
  come `condizione`/`richiede` su un oggetto Tiled (npc/trainer/warp/leggendario).
  Ora prova prima il nome esatto, poi quello minuscolo (retrocompatibile con tutti
  i flag già snake_case). Bug latente, non ancora esploso perché nessuna mappa
  aveva mai usato un flag camelCase come condizione prima d'ora.
- **Atto 4 GdF a Lago di Nemi (Museo delle Navi, furto delle Orb)**: aggiunti in
  `Lago di Nemi.tmj` (posizioni **segnaposto**, da spostare quando l'utente
  definisce il layout vero del museo/pensione):
  - NPC-gate `gdf_gate_nemi` (`dati/npc.js`): **compare solo quando
    `stato.flags.documentoVillaOttenuto` è vero** (ottenuto a Castel Gandolfo,
    Atto 3) — prima di allora il Team GdF non è ancora arrivato a Nemi, l'area è
    normale/non presidiata; dopo, blocca l'accesso al museo (scena del furto
    ancora da costruire, vedi Atto 4 nel tracciamento storia sopra).
  - **5 grunt** `gdf_grunt_nemi_1..5` (Lv 44-48, `dati/trainer.js`), stessa
    condizione, dialoghi sul furto dell'Orb Rossa/Blu.
  - **2 cartelli**: "Pensione Pokémon" e "Museo delle Navi".
- Verificato con Playwright (`GameMap.debugCaricaMappa`/`debugNpcAttivi`): nessun
  errore JS su percorso_7/lago_nemi/albano; senza il flag il gate GdF è invisibile,
  con `documentoVillaOttenuto=true` compaiono correttamente gate + 5 grunt.
- **Non toccato per esplicita richiesta**: MN Surf resta su Nonna Assunta (l'utente
  la sposterà come NPC al "Ristorante dei Laghi" per conto proprio).
- Prossimo passo (lato utente): **Albano → Ariccia → Genzano**, poi dungeon/interni
  (palestra Marino, palestra Rocca di Papa, Grotta del Vulcano, Museo Nemi,
  Abbazia, Lab GdF#1 Marino). Vedi anche i punti aperti nel tracciamento storia
  in cima al documento (conflitto Crasso, MN Surf/Forza da riallineare a
  STORIA_COMPLETA) — tenuti in sospeso su richiesta esplicita dell'utente, da
  riproporre solo quando richiesto.

### Sessione 34 — Scheda Tiled dal codice, Percorso 7 (Castelli_lasthree.world), oggetti a terra solo con [A] (27 luglio 2026)

- **Intervento B fatto**: nuovo `docs/SCHEDA-TILED-DAL-CODICE.md`, generato leggendo
  SOLO `js/map.js` (nessuna riga di codice nuova) — per ogni `type` di oggetto
  riconosciuto nel layer `eventi` (spawn, warp/uscita, porta, npc, trainer, oggetto,
  cartello, pc, i 6 trigger MN, trigger_storia, leggendario, erba_alta/acqua sia a
  rettangolo che auto-dal-tile, deco/warp_speciale/entrata) elenca il `type` esatto,
  le property lette con default, come si risolve `destinazione`→mappa e la scelta
  dello spawn di arrivo, e la sintassi completa di `verificaCondizione`
  (flag/medaglie/legaCompletata/requisiti squadra in linguaggio naturale). Riferimento
  da usare da qui in avanti mentre si disegnano le mappe in Tiled, invece di chiedere
  ogni volta come nominare gli oggetti.
- **Confermato con l'utente**: erba alta e acqua "significano incontri" ma con
  tabella diversa per zona — già come funziona oggi (l'`id` del rettangolo
  `erba_alta`/`acqua_surf` seleziona la tabella in `dati/incontri.js`; le celle
  auto-riconosciute dal tile ereditano l'unico `id` presente sulla mappa). Nessuna
  modifica al codice, solo chiarito.
- **Intervento C chiarito** (non ancora implementato, resta il prossimo passo dopo
  che l'utente avrà disegnato le mappe mancanti): estendere alle celle **acqua** e
  **ghiaccio scivoloso** lo stesso riconoscimento "dal tile" già fatto per l'erba
  alta in sessione 33, così da non dover più disegnare il rettangolo `acqua_surf` a
  mano sopra ogni specchio d'acqua; insieme, valutare la canna da pesca (3 canne,
  tabelle dedicate) come seconda azione sull'acqua oltre al Surf.
- **Nuovo cluster `Castelli_lasthree.world`**: l'utente lo sta costruendo per la
  tratta oltre Rocca di Papa (si torna verso Albano passando per Via dei Laghi). Per
  ora contiene solo `percorso_7.tmx`/`.tmj` (60×50 tile), non ancora registrato in
  `MAPPE`. **`Lago di Nemi.tmj`** ha già un warp pronto verso "Percorso 7" (e
  Percorso 7 ha già il warp di ritorno + spawn) — non funziona ancora perché
  `percorso_7` non è nel registro. **Attenzione**: essendo `Lago di Nemi` nel
  cluster `Castelli_lakes.world` e `Percorso 7` in un `.world` separato, il
  passaggio sarà un warp con fade, NON una camminata continua senza stacco — da
  confermare con l'utente se è l'effetto voluto o se preferisce unire i due
  `.world`. Prossimo passo (utente): finire di disegnare Percorso 7, poi Albano
  Laziale (P6 Lotta), poi Percorso 7↔Albano.
- **Oggetti a terra (pozioni, eteri, ecc.) — fix comportamento** (richiesta
  utente): prima si raccoglievano automaticamente camminandoci sopra, ora **solo
  con `[A]`** (tolto il richiamo automatico in `_controllaEventiCalpestabili`,
  restava comunque già gestito da `_eventoInCasella`/`_interagisci` per il tasto
  `[A]`, nessuna aggiunta lì). Inoltre il **tile "Poké Ball a terra" (id locale
  948 nel tileset) ora sparisce non appena l'oggetto viene raccolto**, lasciando
  visibile il terreno sottostante (che vive su un layer/tileset diverso): nuovo
  `_nascondiTilePokeball`/`_nascondiTileOggetto` in `js/map.js`, che rimuove SOLO
  il tile con quell'indice locale esatto (calcolato correttamente anche nei
  tileset "a fette" come Outside/Emerald, dove Phaser memorizza un indice interno
  diverso da 948). Persistente: `_ripristinaOggettiRaccolti()` richiamata a ogni
  caricamento mappa (sia singola sia cluster) nasconde i tile degli oggetti già
  raccolti in partite precedenti. Verificato con Playwright
  (`GameMap.vaiAMappa`/`interagisciVicino` su Percorso 4): camminarci sopra non
  raccoglie nulla, `[A]` raccoglie una volta sola, ricaricare la mappa e ripremere
  `[A]` non raccoglie una seconda volta, nessun errore JS. ⚠️ Non verificato
  visivamente a schermo che il tile sparisca davvero (lo screenshot automatico non
  inquadrava bene la cella) — da controllare la prima volta che si prova in gioco.

### Sessione 33 — Modello acqua/collisioni/Surf riscritto, fix warp cluster, erba alta dal tile, Via dei Laghi, personaggio e sprite azione (26 luglio 2026)

- **Riscritto da zero il modello Surf/acqua/collisioni** (`js/map.js`), dopo che il vecchio
  sistema a tolleranza (sessione 32) si è rivelato la causa di un bug serio: sciogliere
  collisioni vere quando si surfava vicino. Ora sono **tre concetti separati che non si toccano
  mai a vicenda**:
  1. `collGrid` — collisione VERA (ostacoli, layer `collisioni` esclusi i `trigger_surf`),
     **immutabile dopo il caricamento**, blocca sempre, in Surf o a piedi. Il Surf non scrive
     mai `collGrid`.
  2. `acquaSurf` — Set di celle "acqua surfabile", costruito **solo** dai rettangoli
     `trigger_surf` (niente più assorbimento di oggetti-collisione overlappanti: era quello a
     sciogliere gli ostacoli veri).
  3. `surfAttivo` — stato del giocatore (sta surfando sì/no), non una proprietà delle celle.
     Il prompt "Vuoi surfare?" scatta SOLO in transizione terra→acqua; acqua→acqua (anche tra
     rettangoli diversi affiancati) è silenziosa; acqua→terra disattiva Surf in automatico.
  - Rimossi debounce e tolleranza a raggio 2 (`_vicinoAcquaSurf`, `passiFuoriAcqua`): non
    servono più con l'ordine di valutazione corretto (collisione → acqua → terra).
  - **Zone acqua = zone incontri automatiche**, come l'erba alta: non serve più disegnare un
    rettangolo `acqua` duplicato sopra ogni `trigger_surf` (vedi sotto, stesso principio esteso
    all'erba).

- **Fix bug warp cluster (entrare/uscire da Centri Pokémon dentro un cluster)**: dentro un
  cluster `posTile` è in coordinate GLOBALI, ma `_caricaCluster` si aspetta `arrivoX/arrivoY`
  LOCALI alla mappa membro (li somma lui all'offset). Il punto di ritorno salvato in
  `mappaStack` (per tornare dalla porta di un interno) veniva salvato GLOBALE, causando somma
  doppia dell'offset al ritorno → il giocatore finiva catapultato altrove (di solito il centro
  dell'intero cluster). Aggiunta `_coordRitornoMappaStack()` che converte in locale prima di
  salvare, usata sia in `_gestisciPorta` che in `_transizioneMappa`. Verificato: Centro Pokémon
  di Marino e di Castel Gandolfo ora riportano esattamente davanti alla porta.

- **Fix buco Surf tra Castel Gandolfo e Lago di Albano interno**: vero buco nei DATI, non nel
  motore — l'unico rettangolo `acqua_surf` di `castel_gandolfo.tmj` si fermava una riga di tile
  prima del bordo mappa, mentre `interno_lago` (sotto, stesso cluster) inizia esattamente lì.
  Esteso il rettangolo fino al bordo (altezza 128.6px → 171px). ⚠️ Per scrivere la modifica il
  file è stato **riformattato** in JSON multi-riga leggibile (non più identico byte-per-byte
  all'export originale di Tiled, ma valido — Tiled lo riformatta comunque a modo suo al prossimo
  salvataggio).

- **Erba alta riconosciuta anche dal TILE, non solo da rettangoli disegnati a mano**
  (`_buildErbaAltaTiles`, incrementa il sistema esistente, non lo sostituisce): verificato
  visivamente (ritagliato lo spritesheet) che il tile "erba alta" è sempre l'id locale 6 (7ª
  colonna) di `outside.tsx`/`Outside_pallet.tsx`, su 9 mappe diverse. Basta **un solo oggetto
  punto `erba_alta` con `id`** da qualche parte sulla mappa (non serve più ridisegnare tutta
  l'area) perché il motore riconosca da solo ogni casella con quel tile come zona-incontri.
  Scansionate tutte le 50 mappe registrate: **5 avevano tile erba ma zero zone con id**
  (`frascati_est`, `frascati_nord`, `via_dei_laghi`, `osservatorio`, `percorso_montano_v1`) —
  aggiunto il marcatore mancante a ciascuna + le tabelle `dati/incontri.js` mancanti
  (`incontri via dei laghi` Lv18-30, `incontri osservatorio` Lv26-32, `incontri percorso
  montano` Lv30-38; frascati_est/nord riusano `incontri frascati`, già pronta ma mai agganciata).
  Non tocca le collisioni: un rettangolo `collisioni` sopra un tile erba resta comunque solido
  (deciso esplicitamente per non ripetere l'errore del Surf).

- **23 allenatori su Via dei Laghi** (`dati/trainer.js` + `via_dei_laghi.tmj`): 8 erano già
  piazzati sulla mappa ma **senza dati** (non funzionavano). Aggiunti dati completi (dialoghi in
  romanesco, squadre Lv20-34) per quegli 8 + **15 nuovi** (`via_laghi_trainer_9..23`), posizionati
  in punti di massima lungo il tracciato — **da ridistribuire in Tiled** (l'utente lo farà).

- **Scelta del personaggio + sprite per azione** (Corsa/Bicicletta/Surf/Pesca):
  - Nuova schermata iniziale "Chi sei tu?" (Ragazzo/Ragazza), overlay `#overlay-genere` in
    `index.html`, funzione `scegliGenere()` in `app.js`. Scelta salvata in `stato.genere`,
    mostrata solo se manca (salvataggi vecchi migrati a `null`).
  - Sprite copiati in `sprites/` da `Essentials FRLG/Graphics/Characters/npc e trainer per
    claude/`: `player-red-run/-bike/-surf/-fish.png` + equivalenti `-girl-`. **Il default resta
    sempre `player-red.png`/`player-girl-red.png`** (quest'ultimo ancora da fornire dall'utente,
    il codice è già pronto per riceverlo): gli altri sprite si attivano SOLO nella modalità
    corrispondente.
  - Comandi nuovi: **Shift** (tenuto) = Corsa (95ms/passo invece di 150), **B** = Bicicletta
    (toggle, solo se posseduta, 65ms/passo, si toglie da sola in Surf), **P** = Canna da pesca
    (solo posa per ~1.5s, NESSUN incontro — la meccanica di pesca vera resta da progettare,
    vedi Intervento C sessione 32). Bicicletta e Canna già sbloccate in
    `stato.inventario.chiave` per i test — da gate-are con un evento/NPC quando si decide dove.
  - Surf ora mostra lo sprite `_surf` (prima restava quello normale).
  - ⚠️ Non verificato in gioco: l'ordine delle righe direzione nello sprite Pesca (dedotto
    visivamente come up/left/right/down, diverso dalla convenzione down/left/right/up di
    camminata/corsa/bici) e la velocità di animazione durante Corsa/Bici (i passi sono più
    veloci ma il ciclo dei 4 frame gira sempre alla cadenza normale).

### Sessione 32 — Mappe continue da .world (cluster), fix scatti movimento, cache dev server (25 luglio 2026)
Lavoro tutto lato motore (`js/map.js` + `js/clusters.js` nuovo + `server.js`), nessuna mappa nuova.

**✅ Bug collisioni cluster RISOLTO in sessione 33** (vedi sotto): non era un problema di
offset/bounding box, ma un'architettura sbagliata in cui Surf poteva sciogliere collisioni vere.
Riscritto da zero il modello acqua/collisioni/Surf.

Riprendere da qui: **Intervento B** (scheda Tiled dal codice, solo lettura) è il prossimo passo
già concordato con l'utente, poi **Intervento C** (azioni acqua: surf/pesca/incontri nuotando) —
**Intervento C parzialmente fatto in sessione 33** (erba alta auto dal tile, sprite Pesca), manca
ancora la meccanica di pesca vera (tabelle dedicate per canna, dove si può pescare).

- **Sistema CLUSTERS (mappe continue senza fade, stile Smeraldo)**: l'utente ha creato in Tiled
  3 file `.world` che raggruppano mappe che devono essere percorse in continuità:
  `Castelli_prima.world` (borgata_tuscolana + percorso_tuscolana + percorso_1b),
  `FrascatiGrotta.world` (le 5 mappe di Frascati + percorso_2 + percorso_3 + grottaferrata),
  `Castelli_lakes.world` (marino + lago_albano + interno_lago + lago_nemi + via_dei_laghi +
  percorso_4 + castel_gandolfo + percorso_5).
  - **`strumenti/genera_clusters.py`** (nuovo): legge i `.world`, ricava offset/dimensioni in
    tile (32px), risolve ogni `fileName` alla chiave del registro `MAPPE` (ignorando estensione
    `.tmx`/`.tmj`, spesso diversa tra `.world` e `MAPPE`), genera **`js/clusters.js`**
    (`CLUSTERS[nomeWorld].mappe[chiaveMappa] = {offsetX,offsetY,w,h}`). Segnala in console mappe
    non risolte o offset non multipli di 32px. **Da rilanciare ogni volta che l'utente modifica
    un `.world` in Tiled** (già successo una volta con `Castelli_lakes.world`, rigenerato senza problemi).
  - **`js/map.js` — `_caricaCluster`**: quando la mappa richiesta appartiene a un cluster, carica
    TUTTI i `.tmj` membro insieme e li fonde in un'unica "mappa virtuale": `mapW`/`mapH` diventano
    il bounding box del cluster (shiftato per partire da 0,0), `collGrid`/`eventiMappa`/`surfTiles`
    sono l'unione di tutte le mappe membro in coordinate shiftate. Così **tutto il resto del motore
    (movimento, collisioni, camera, spawn, NPC, incontri) funziona INVARIATO**, sia in modalità
    cluster che mappa singola (non serve sapere quale delle due modalità è attiva).
  - **Regola del vuoto**: celle non coperte da nessuna mappa membro = bloccanti di default.
  - **Depth per TIPO di layer** (non per mappa): ground/deco/edifici/sopra_testa sempre agli stessi
    livelli a prescindere da quale mappa del cluster li disegna.
  - **Camera** sui bound dell'intero cluster (nessun ricalcolo alle cuciture interne).
  - **Warp "uscita"/"warp" tra due mappe dello STESSO cluster resi inerti** (in `_transizioneMappa`):
    si cammina sopra come terreno normale, niente fade. Le porte verso interni e i warp verso
    l'esterno del cluster restano invariati. Diagnostica in console (`_diagnosticaWarpInerti`) se
    un warp reso inerte lascia comunque una casella bloccante da sistemare in Tiled.
  - **`mappaCorrente` derivata** (`_mappaSottoGiocatore`, richiamata a ogni passo dentro un cluster):
    tiene aggiornati `mappaInfo`, "città visitata" (MN Volo) e il punto di ritorno corretto quando
    si entra in un interno da dentro il cluster. **Non ancora fatto**: banner a schermo col nome
    della zona quando cambia (previsto ma non implementato, il cambio è già tracciato "silenziosamente").
  - **Spawn**: `_trovaSpawn` ora accetta un `soloMappa` per preferire gli spawn della mappa membro
    di ingresso prima di cercare nell'intero cluster (evita di pescare lo spawn "default" sbagliato).
  - **Non fatto** (Parte 7 del prompt originale, rimandata): salvataggio in coordinate LOCALI alla
    mappa membro invece che globali-cluster, e riuso del cluster già caricato al ritorno da un
    interno (oggi ogni volta si ricarica tutto da capo — accettabile, "nessuna gestione dinamica"
    come richiesto, ma non ottimizzato).
  - **Bug scoperto e fatto notare in `via_dei_laghi.tmj`**: usa un tileset mai registrato nel
    motore (`tileset-outside.tsx` / `sprites/tileset-outside.png`, diverso da `outside`/
    `Emerald_Outside`) — un intero layer spariva senza errori. Aggiunta voce in `TILESET_META`
    (`js/map.js`). Bug preesistente, non causato dal sistema cluster.

- **Fix scatti nel movimento** (richiesta utente, testata e confermata OK):
  - **Causa reale**: il booster ⏩ (`velocita`) influenzava tre timer di movimento diversi con
    formule leggermente diverse (`moveCD` tastiera, `dur` del tween, intervallo D-pad touch) che
    combaciavano solo a booster ×1 e divergevano altrimenti. **Il booster ora NON tocca più il
    movimento sulla mappa** (solo dialoghi/battaglie, che leggono `stato.velocita` direttamente):
    nuova costante unica `DURATA_PASSO_MS = 150` usata ovunque. `impostaVelocita()`/`velocita`
    restano nel codice ma non hanno più effetto sul movimento (compatibilità).
    ⚠️ **Da confermare con l'utente**: dopo il fix ha chiesto "lo speed up in battaglia lo terrei
    come opzione" — il codice di battaglia non è stato toccato e dovrebbe leggere ancora
    `stato.velocita` normalmente, ma non ho ricevuto conferma esplicita che in battaglia funzioni.
  - **Animazione di camminata risincronizzata**: il ciclo a 4 frame ora ha `frameRate` calcolato
    per completarsi esattamente in `DURATA_PASSO_MS`, invece di un `frameRate:8` fisso che ne
    mostrava solo il 30% per passo.
  - **`roundPixels: true`** aggiunto esplicito alla config Phaser (accanto a `pixelArt`/`antialias`
    già presenti).

- ~~Fix Surf che si disattivava in continuazione (debounce + tolleranza raggio 2)~~ — **RIMOSSO
  in sessione 33**: quel meccanismo (tolleranza + sblocco automatico di `collGrid`) era la causa
  di un bug più grave (Surf scioglieva collisioni vere). Vedi sessione 33 per il modello corretto.

- **`server.js` — cache disattivata**: l'utente aggiornava mappe/collisioni in Tiled ma il gioco
  ricaricato non cambiava nulla — il server locale non mandava header di cache, il browser teneva
  in cache `.tmj`/script vecchi. Aggiunto `Cache-Control: no-store, no-cache, must-revalidate` su
  ogni risposta. Serviva comunque uno svuota-cache manuale UNA VOLTA (Ctrl+Shift+R) per ripulire
  quanto già cachato prima del fix; da lì in poi basta chiudere/riaprire il gioco.

- **Prossimo passo concordato con l'utente** (non ancora iniziato):
  - **Intervento B**: generare `docs/SCHEDA-TILED-DAL-CODICE.md` leggendo SOLO il codice (nessuna
    riga nuova) — per ogni `type`/proprietà che il motore riconosce davvero nel layer `eventi`
    (warp, spawn, npc, trainer, oggetto, cartello, i `trigger_*` MN, `trigger_storia`, `erba_alta`,
    `acqua`, leggendari su mappa…), il valore esatto letto dal codice, le proprietà lette
    (obbligatorie/opzionali, default se mancanti), se l'identificativo è `id` o `name`. Niente
    invenzioni: se qualcosa non è gestito dal codice, scriverlo esplicitamente.
  - **Intervento C** (dopo B): acqua come TERRENO che abilita azioni (non ostacolo) — priorità
    canna>surf sul tile d'acqua, 3 canne (Vecchia/Buona/Super) con tabelle di pesca dedicate in
    `dati/encounters.js` (da proporre all'utente PRIMA di generarle, per zona/canna), verifica che
    l'acqua sopra/sotto una cascata aperta con MN Cascata sia surfabile senza incastri residui.
    **Da chiarire prima con l'utente** (chiesto esplicitamente nel prompt): oggi l'acqua è
    riconosciuta SOLO da rettangoli-oggetto `type` (`acqua surf`/alias `trigger_surf`, gestiti da
    `_buildSurfTiles`/`buildCollGrid`/`parseEventi`) — nessuna proprietà tile (`encounter_type`,
    `surf`) è letta oggi dal motore per riconoscere l'acqua dal tileset.

### Sessione 31 — Gregari Marino/Monteporzio, NPC Surf al Lago, trainer P4/Lago, venditori market (11 luglio 2026)
- **Palestra di Marino**: l'utente ha ridisegnato la mappa da zero (`pokemon-castelli-palestra_marino.tmj`,
  layer eventi svuotato). Riaggiunti i 6 oggetti trainer (5 gregari + Moro, dati già pronti in
  `dati/trainer.js` dalla sessione 27) nel `.tmj`. **Palestra di Monte Porzio**: già completa (6 gregari +
  Stella presenti nel `.tmj` ridisegnato dall'utente), nessuna modifica necessaria.
- **MN Surf riallineata a STORIA_COMPLETA** (risolve il punto aperto della sessione 30): spostata da
  "Nonna Assunta ad Albano Laziale, ≥5 medaglie" a **Nonna Assunta al Lago di Albano**, gate ora
  `stato.medaglie.includes('monte-porzio')` (sconfiggi la palestra di Monte Porzio) invece di un conteggio
  medaglie. Nuovo campo `palestraRichiesta` su `DONATORI_MN` (data.js), letto da `_interagisciDonatoreTiled`
  (app.js). NPC `mn-surf` piazzato al centro di `Lago di Albano.tmj` (l'utente lo sposterà sulla spiaggia).
- **2 allenatori su Percorso 4** (`all-p4-1/2`, Escursionista/Ciclista, Lv19-21) piazzati al centro di
  `Percorso_4.tmj`.
- **6 allenatori spiaggia + 2 NPC al Lago di Albano** (`all-lago-1..6`, sprite Pescatore/Nuotatori/
  Sommozzatore/Velista, Lv20-24; `lago_albano_npc1` bagnante, `lago_albano_npc2` **abitante di una casa
  sul lago** — l'interno della casa non esiste ancora, va creato quando l'utente arriva a quella zona),
  tutti piazzati al centro di `Lago di Albano.tmj`.
- **Venditori Market**: Marino e Castel Gandolfo erano già completi (NPC nel `.tmj` + `dati/npc.js` +
  `apriMarketMarino`/`apriMarketCastelGandolfo` in app.js, sessioni precedenti). Mancava solo **Albano**:
  l'NPC era già nel `.tmj` (`pokemon market venditore albano`) ma senza wiring — aggiunta la voce in
  `dati/npc.js` e la funzione `apriMarketAlbano()` in app.js (usa `mk-albano`, già presente in
  `POKE_MARKET`).
- **Percorsi mancanti individuati** (analisi di tutti i warp `destinazione` nei `.tmj`): **Percorso 6**
  (Rocca di Papa ↔ Albano Laziale, riferimenti orfani già in `monteporzio.tmj`/`albano.tmj` ma mappa
  inesistente), **Percorso 7** (Albano ↔ Ariccia, riferimento in `albano.tmj`, Ariccia non esiste ancora),
  **Ariccia ↔ Genzano** e **Genzano → Colonna/Via Vittoria** (nessun riferimento ancora, tutto da fare).
  Notato anche `Lago di Nemi.tmj` (creata dall'utente l'8 luglio) **non ancora registrata in `MAPPE`**
  né collegata a nessun percorso attivo.
- Verificato con Playwright (`GameMap.debugCaricaMappa`): marino, monteporzio, interni palestra,
  percorso_4, lago_albano, albano, mart_albano, mart_marino caricano senza errori JS (i 404 su
  `scienziato`/`controllore` in monteporzio sono sprite mancanti pre-esistenti, gestiti dal fallback).
- Prossimo passo (lato utente): costruire Percorso 6 → Percorso 7 (+ città Ariccia) → percorso
  Ariccia-Genzano → tratta finale verso Colonna, agganciando Lago di Nemi quando si arriva in zona.

### Sessione 30 — Palestra Monte Porzio + MN Forza da Remo (8 luglio 2026)
- **Confermato**: gli sfondi di battaglia (sessione 29) erano già automatici per
  posizione (grotta/acqua/interno/esterno) — nessuna modifica necessaria, il sistema
  `GameMap.temaBattaglia()` copre già questo caso.
- **Palestra di Monte Porzio (Elettro, Stella) completata**: registrata
  `palestra_monteporzio_interno` in `js/map.js` (file
  `pokemon-castelli-palestra_monteporzio.tmj`, disegnato dall'utente ma con layer
  eventi vuoto). Aggiunti: spawn `entrata_principale` + uscita (varco sul bordo
  NORD della stanza, non sud come le altre palestre — orientamento diverso di
  questa mappa), **6 gregari + Capopalestra Stella** come oggetti trainer +
  relative voci in `dati/trainer.js` (dati presi da `PALESTRE['monte-porzio']`).
- **MN Forza ora la dà Remo**: dopo averlo battuto alla tappa 4 (Monte Porzio),
  `stato.mn.forza = true` (vedi nota sopra in "MN — stato reale"). Sblocca
  l'ostacolo `trigger_forza` già presente su Percorso 3.
- Verificato con Playwright: `monteporzio` e `palestra_monteporzio_interno`
  caricano senza errori JS.
- Prossimo passo: l'utente prosegue con altri interni/dungeon (Marino, Rocca di
  Papa restano da rifinire lato utente); quando si torna sulla narrativa, allineare
  MN Surf (Marino/Moro) e la divergenza Forza con STORIA_COMPLETA.

### Sessione 29 — Battleback dinamici (8 luglio 2026)
- **Sfondi di battaglia da `sprites/Battlebacks/`** (l'utente li ha aggiunti: coppie
  `<tema>_bg.png` / `<tema>_base0.png` (sotto l'avversario) / `<tema>_base1.png`
  (sotto il nostro), temi: field+grass, cave, icecave, interior, water, champion,
  elite1-4). `js/battle.js` → `impostaSfondoBattaglia(tema)` applica le 3 immagini
  a `#battaglia-campo` e alle due `.piattaforma` (sostituendo il gradiente CSS).
- `Battle.avvia(opzioni)` accetta un `opzioni.sfondo` esplicito; se assente chiede a
  `GameMap.temaBattaglia()` (nuovo, in map.js): usa `MAPPE[mappaCorrente].tema` se
  presente, altrimenti `'interior'` se `interno:true`, altrimenti `'grass'`.
  Aggiunto `tema` a `tuscolo_profondo`/`antro_regirock`/`antro_registeel` (cave) e
  `antro_regice` (icecave, essendo il Regi di ghiaccio).
- **Incontri in acqua** (`_tentaIncontro` in map.js): se la zona è `acqua` forza
  `sfondo:'water'` a prescindere dalla mappa (per le zone Surf).
- **Superquattro/Campione** (`avviaPassoLega` in app.js): passano esplicitamente
  `sfondo:'elite1'..'elite4'` e `sfondo:'champion'`.
- Verificato con Playwright: sfondi 'water' e 'grass' renderizzati correttamente
  (screenshot). Gli altri temi condividono lo stesso codice, non ancora
  visti a schermo uno per uno.
- Ci sono anche `<tema>_message.png` nella cartella (sfondo per il box del
  messaggio) non ancora usati: da valutare se l'utente li vuole applicati al
  box di testo della battaglia.

### Sessione 28 — Letta STORIA_COMPLETA.md, medaglie rinominate, Atto 6 GdF (8 luglio 2026)
- L'utente ha integrato/rifinito `rocca_di_papa.tmj` per conto suo.
- **Letto per intero `docs/STORIA_COMPLETA.md`** (fonte di verità narrativa aggiornata) e
  creato il tracciamento qui sopra.
- **Rinominate le medaglie** per allinearle al documento: Medaglia Cratere→**Lava**
  (Rocca di Papa) e Medaglia Legione→**Scudo** (Albano), in `js/data.js`,
  `dati/trainer.js`, `CLAUDE.md`, `docs/BIBBIA-NARRATIVA.md`, `docs/ROADMAP.md`.
- **Atto 6 (presidio Grotta del Vulcano)**: aggiunto trainer GdF
  `gdf_grunt_grotta_vulcano_1` + NPC-gate `gdf_gate_grotta_vulcano` (sparisce a
  `stato.flags.gdf_sconfitto`, flag nuovo — non ancora settato da nessuna parte,
  sarà l'Atto 7) al centro della piazza di `rocca_di_papa.tmj`, senza toccare il
  resto della mappa. L'utente li sposterà quando costruirà il dungeon vero.
- **Non toccato** (per esplicita richiesta): `percorso_montano_v1.tmj` e i
  collegamenti verso Rocca di Papa — decide l'utente quando/come usarlo. L'utente
  farà **Percorso 6** (Monte Porzio ↔ Rocca di Papa) per conto suo.
- Verificato con Playwright: `rocca_di_papa` carica ancora senza errori JS dopo le modifiche.
- **Prossimo passo**: l'utente fa Percorso 6, poi gli interni e i dungeon. Quando
  arriva a quelli, riallineare Atto 4/5 (Museo Nemi, Lab GdF#2) e risolvere il
  conflitto Crasso GdF/CoTrAL prima di costruirci sopra.

### Sessione 27 — Gregari Marino + Rocca di Papa costruita da zero (8 luglio 2026)
> Nota: la sessione precedente si era chiusa senza salvare la cronologia; questa
> ripartita rileggendo `docs/STATO-PROGETTO.md` + `git status`.
- **Palestra di Marino**: 5 gregari + gym_leader Moro aggiunti in `dati/trainer.js`
  e come oggetti trainer nel layer eventi di `pokemon-castelli-palestra_marino.tmj`
  (prima vuoto). Rimossi 24 oggetti "acqua_lago di albano_surf" nel layer collisioni
  (copiati per errore dal Lago Albano: bloccavano mezza palestra). Registrata
  `interno_palestra_moro` in `js/map.js`.
- **Donatori MN sul motore Tiled**: prima non esistevano per niente (solo vecchio
  sistema lat/lon). Aggiunte `interagisciDonatoreSurf()`/`interagisciDonatoreVolo()`
  in `app.js` (riusano testi/gate di `DONATORI_MN`). **Taglio non va duplicato**: è
  già ottenibile a Frascati (`donaTaglioFrascati`). **Il donatore Surf (Nonna
  Assunta) sta ad Albano Laziale città, NON al Lago Albano** — segnato anche in
  `docs/REMINDER-MAPPE-FUTURE.md` per quando quella mappa esisterà. Volo (Faustino)
  piazzato subito a Rocca di Papa.
- **Rocca di Papa (P5 Roccia, Rocco) costruita da zero**: nuova mappa
  `sprites/maps_tiled/rocca_di_papa.tmj` generata da script usando i tile numerati
  di `docs/DOCUMENTO_MAESTRO_TILE_E_WORLD.md` (strada in pietra, piazza, alberi
  gialli di bordo, Centro Pokémon e Market fisici — riusano gli interni generici
  di Frascati come già per Grottaferrata —, edificio Palestra con porta verso
  `interno_palestra_rocco`, **da creare dall'utente**, dati dei 7 gregari + Rocco
  già pronti in `dati/trainer.js`). Un cartello-segnaposto a (4,15) segna dove
  aggiungere rifugio/chalet/belvedere (non specificati nei documenti di design).
- **Collegamento nel mondo**: scoperto che `Percorso_5.tmj` collega in realtà
  Castel Gandolfo↔Monte Porzio (nome fuorviante). La vera via Monte Porzio→Rocca
  di Papa è `percorso_montano_v1.tmj` (già disegnata ma con 3 warp segnaposto senza
  destinazione): completati `warp_prev_city`→monteporzio e `warp_next_city`→
  rocca_di_papa, più il collegamento reciproco aggiunto in `monteporzio.tmj`. Il
  terzo (`warp_summit`, verso "la vetta della montagna") lasciato apposta come
  `TODO_vetta_montagna` (Monte Cavo o Sentiero Innevato? mappa da creare comunque).
- Verificato con Playwright (`GameMap.debugCaricaMappa`) che le mappe toccate
  caricano senza eccezioni JS; i soli 404 sono sprite NPC mancanti (fallback
  automatico già esistente).
- Prossimo passo: l'utente costruisce gli interni delle palestre di Marino e
  Rocca di Papa; poi decidere `warp_summit` e Albano Laziale (per il donatore Surf).

## 📌 PUNTO DELLA SITUAZIONE (aggiornato al 28 luglio 2026 — sessione 35)

**Dove siamo:** 5 palestre su 8 sono completamente giocabili su Tiled (Frascati,
Grottaferrata, Marino*, Monte Porzio, e Rocca di Papa* solo per l'esterno).
`*` = l'interno esiste ma l'utente lo sta ancora rifinendo (Marino) o non esiste
ancora (Rocca di Papa, chiave attesa `interno_palestra_rocco`). Il mondo collega
Borgata→Frascati→Grottaferrata→Marino→Monte Porzio→Rocca di Papa (via
`percorso_montano_v1`) →Via dei Laghi→Lago di Nemi→**Percorso 7** (ora registrato
in `MAPPE`) →**Albano** (già esistente e agganciata, cluster `Castelli_lasthree`
insieme a Percorso 7 → camminata continua senza stacco; Nemi↔Percorso 7 resta
invece un warp con dissolvenza, cluster/`.world` diversi). Sistema battleback
dinamico attivo. `docs/SCHEDA-TILED-DAL-CODICE.md` (sessione 34) resta il
riferimento per disegnare gli oggetti Tiled invece di chiedere ogni volta.

**⚠️ Da fare appena possibile**: l'utente ha comunicato che **sposterà l'ingresso
di Percorso 7** (posizione del warp/spawn verso Lago di Nemi) — le coordinate
attuali in `percorso_7.tmj` (`warp_Percorso 7` / `spawn_da_lago di nemi`, vedi
sessione 35) vanno **riallineate** alla nuova posizione non appena l'utente la
comunica o la si vede cambiata nel file.

**Cosa fare appena si riprende:**
1. Leggere la sezione **🗺️ TRACCIAMENTO STORIA** qui sopra per lo stato narrativo
   (Team GdF/CoTrAL/leggendari/MN) — non presumere, verificare su `STORIA_COMPLETA.md`.
2. **Riallineare l'ingresso di Percorso 7** appena l'utente ha spostato il
   warp/spawn nella nuova posizione (vedi avviso sopra).
3. **Intervento C** (prossimo, non iniziato): estendere alle celle **acqua** e al
   **ghiaccio scivoloso** lo stesso riconoscimento "dal tile" già fatto per l'erba
   alta (sessione 33) — vedi dettagli in sessione 34; valutare insieme la canna da
   pesca.
4. Punti aperti lasciati in sospeso **su richiesta esplicita dell'utente — non
   riproporli finché non li chiede lui**: MN Surf da riallineare a Moro/Marino
   (oggi è ancora sul vecchio `DONATORI_MN`, ma resterà su Nonna Assunta finché
   l'utente non la sposta di persona al "Ristorante dei Laghi"); divergenza MN
   Forza (ora da Remo, non dall'Osservatorio) da eventualmente riportare in
   STORIA_COMPLETA.md se resta la scelta definitiva; conflitto Crasso GdF/CoTrAL
   da chiarire prima di costruire Atto 5/7 o il Lab CoTrAL#2 di Ariccia.
5. **Atto 4 GdF (furto Museo Navi di Nemi)** ora ha gate+grunt piazzati (sessione
   35, posizioni segnaposto) ma la **scena vera del furto non è ancora costruita**
   (oggi i grunt semplicemente compaiono/si possono battere, nessuna cutscene né
   flag di completamento Atto 4) — da fare quando si torna sulla narrativa GdF.
6. Prossimo passo lato utente: **Albano → Ariccia → Genzano**, poi
   dungeon/interni ancora da costruire: palestra Marino, palestra Rocca di Papa,
   Grotta del Vulcano, Museo delle Navi di Nemi, Abbazia (interno), Lab GdF#1
   (Marino).

> ⏰ **PROMEMORIA DA NON DIMENTICARE** — Quando si integreranno i **Centri Pokémon dei comuni
> da Marino in poi**, aggiungere in ogni Centro l'**NPC mercante scambi** (`type:npc`,
> `azione: 'interagisciMercanteScambi'`) per le evoluzioni da scambio. La funzione è già pronta
> in app.js. Idem: gli **oggetti-pietra a terra** previsti in `docs/PIETRE_MARKET.md` (Lago Nemi,
> Grotta Vulcano, Boschi Tuscolo, Monte Cavo, ecc.) vanno messi come `oggetto` nei rispettivi TMJ.

---

### Diario sessioni precedenti (dalla 26 in giù)

### Sessione 26 — Zone incontri nuove mappe (6 luglio 2026)
Nuove mappe disegnate dall'utente in Tiled: `marino_v3.tmj`, `Percorso_4.tmj`, `Lago di Albano.tmj`,
`castel_gandolfo_v2.tmj`, `Percorso_5.tmj` (+ `percorso_montano_v1.tmj` vuota, posizione da decidere).
**Nessuna è ancora registrata in `MAPPE` (js/map.js) né collegata coi warp** — prossimo passo.
- **`dati/incontri.js`** — aggiunte 6 tabelle nuove (mix Gen 1-2-3, specie sempre DIVERSE dalle zone
  precedenti: obiettivo dichiarato utente = tutte le 386 specie incontrabili nel gioco):
  - `'incontri percorso 4'` (Lv 12-19, tema Elettro, da reminder MOD 3)
  - `'incontri marino'` (Lv 12-17, vigne — **ATTIVA**: marino_v3.tmj ha già le zone erba_alta)
  - `'incontri lago albano'` (spiaggia Lv 15-22) + `'incontri lago albano surf'` (acqua Lv 18-28)
  - `'incontri castel gandolfo'` (Lv 16-23) e `'incontri percorso 5'` (Lv 16-24, montano, Larvitar raro)
- **Percorso 3 ora ATTIVO**: l'utente ha aggiunto in Tiled le 5 zone `erba_alta` con
  id `incontri percorso 3` (il ⚠️ della sessione 25 è risolto).
- **Zone da creare in Tiled dall'utente** (rettangolo su layer `eventi`, `type: erba_alta` o `acqua`,
  property `id` = chiave tabella): Percorso_4, Lago di Albano (erba+acqua), castel_gandolfo_v2,
  Percorso_5, frascati_est (vigne, tabella `'incontri frascati'` in attesa da tempo).
- Nota: le property `zone_id` a livello mappa nei TMJ sono **ignorate dal motore** (si usa l'`id`
  dell'oggetto zona). Mappe mancanti: interno lago (Surf), giardini Villa Torlonia.
- **`MAPPE` in map.js aggiornato**: registrate `marino`, `percorso_4`, `lago_albano`,
  `castel_gandolfo`, `percorso_5` + alias `interno_pokecenter`/`interno_market` per le porte
  di Marino. `MAPPA_COMUNE` aggiornata (Marino e Castel Gandolfo sboccano il Volo).
  `VOLO_TILED` aggiornato con Marino (spawn tx=30,ty=48) e Castel Gandolfo (tx=16,ty=29).
- Warp: tutti i percorsi si riconnettono (percorso_3 ↔ marino, marino ↔ percorso_4,
  percorso_4 ↔ castel_gandolfo e lago_albano, castel_gandolfo ↔ percorso_5).
- Prossimo: città di Marino completa (palestra Acqua / Moro / Medaglia Fontana, NPC, Solitario).

### Sessione 25 — Percorso 3 (Grottaferrata → Marino) cablato (30 giugno 2026)
La **mappa `percorso_3.tmj` l'ha disegnata l'utente in Tiled** (60×28, campagna verso il lago);
io ho cablato la logica. Tileset: solo `outside.tsx` (già supportato → renderizza così com'è).
- **Registrata** `percorso_3` in `js/map.js` (`MAPPE`, latC/lonC 41.7800/12.6620).
- **Warp già pronti nei TMJ** (li aveva messi l'utente): Grottaferrata ⇄ Percorso 3 risolvono per
  inclusione in `_trovaSpawn` (`da_grottaferrata_sud`↔`da_grottaferrata`, `da_percorso_3_sud`↔
  `da_percorso_3`). Il warp EST → **`marino`** (mappa non ancora creata) dà toast "zona non disponibile".
- **10 allenatori** in `dati/trainer.js`: `all-gm-1..8` (Lv 9-14) sul tracciato + `all-gm-extra-1/2`
  (Lv 12-14) nella **zona laterale oltre il masso `trigger_forza`** (sbloccabile con MN Forza, non
  ancora data). Squadre/livelli da `PROMPT_CLAUDE_CODE_aggiornamenti.md` (Mod 2A).
- **3 NPC** `p3_npc1..3` in `dati/npc.js` (sprite `NPC_65/66/67`: i file non esistono ancora → il
  motore assegna un filler stabile per id, come da sessione 24b).
- **Pool incontri** `'incontri percorso 3'` aggiunto in `dati/incontri.js` (Lv 10-16, mix Gen 1-2-3,
  primi Pokémon d'acqua + Totodile rarissimo). ⚠️ **PRONTO ma INATTIVO**: il TMJ non ha ancora una zona
  `erba_alta` con id `incontri percorso 3`, quindi al momento **niente incontri selvatici sul Percorso 3**.
  Per attivarli: in Tiled, layer `eventi`, disegna un oggetto `type:erba_alta` (o `erba_alta` come nome)
  con property `id = "incontri percorso 3"` sulle aree d'erba.
- Prossima città: **Marino** (P3 Acqua, Capopalestra Moro, Medaglia Fontana) — mappa da creare.

### Sessione 24b — Regole sprite NPC (29 giugno 2026)
- **Team GdF → sprite `NPC 20`** (riservato; alias `GDF_GRUNT_SPRITE`).
- **Fallback sprite mancanti**: NPC/trainer senza sprite o con file mancante (es. NPC eliminato) ricevono
  uno sprite filler **casuale ma stabile per id** (`spriteRandomPerId`/`POOL_NPC_RANDOM`, escluso NPC 20).
  I **personaggi della storia** (rivale/leader/professore/GdF…, `isSpriteStoria`) NON vengono randomizzati.
  Refactor `_creaSpritesNPC` + nuovo helper `_caricaTexNpc` in map.js.
- **Rivale (Remo) → `trainer_POKEMONTRAINER_Brendan`**; **SWAP: Professore Castagno → `npc Rivale`**.
- Sistemati alias rotti (`NPC_50`→NPC 19, `NPC_MONACO`→NPC 16; NPC 23/29 non esistono).

### Sessione 24 — Grottaferrata + Palestra Psico (Medaglia Icona) (29 giugno 2026)
La **città di Grottaferrata l'ha disegnata l'utente in Tiled** (`grottaferrata.tmj`, 36×34); io ho cablato
tutta la logica e gli interni.
- **Palestra** (`pokemon-castelli-palestra_Grottaferrata.tmj`): registrata come
  `palestra_grottaferrata_interno` (chiave usata dal warp del paese, spawn `entrata_principale`).
  4 gregari + Capopalestra **Nilo** (Psico) in `dati/trainer.js` (id del TMJ
  `gym_leader_palestra grottaferrata`, `gregario 1..4 palestra grottaferrata`), squadre/dialoghi da
  `PALESTRE['grottaferrata']`. `palestraId:'grottaferrata'` → **Medaglia Icona** + level cap **21**.
  Aggiunti al TMJ (via script) lo spawn `entrata_principale` (13,25) e l'uscita (13,26, ritorno via stack).
- **Centro Pokémon e Market = identici a Frascati** (richiesta utente): le chiavi `pokecenter_interno` e
  `mart_interno` puntano ai **file di Frascati** (`...Pokemon_center_frascati.tmj` e `...poke market.tmj`).
  Entrando si atterra sull'ingresso interno e si esce in città via mappaStack. (Niente edifici/funzioni
  dedicate: rimosse le `gf_nurse/gf_market/curaGrottaferrata/apriMarketGrottaferrata` placeholder.)
- **MN Volo → Grottaferrata**: aggiunta a `VOLO_TILED` (atterra a 3,32, fuori dal Centro). La città viene
  segnata come "visitata" entrandoci, via nuova tabella `MAPPA_COMUNE` in `caricaMappa` (map.js).
- **Eventi/NPC che compaiono-spariscono** (sistema `gate`/`condizione`, già esistente, ora completato):
  - **`verificaCondizione` ora supporta `medaglie >= N`** → il grunt **`gdf_porta_abbazia`** (gate)
    sbarra l'ingresso all'Abbazia finché non hai **7 Medaglie**, poi sparisce.
  - **`trigger_leggendario`** ora gestito (normalizzato a `leggendario`): il **Deoxys** (`pokemon_id:386`,
    `condizione: post_lega_luna`) compare/lotta solo a Lega completata; prima è invisibile.
  - 3 grunt GdF dell'Abbazia (`gdf_grunt_abbazia_1..3`, Lv 18-21) in `dati/trainer.js`; NPC del paese
    (`grotta_npc2..4`, `parcheggio_npc5`, `monaco_abbazia`, `gdf_porta_abbazia`) in `dati/npc.js`.
  - Alias sprite (`GDF_GRUNT_SPRITE`→TEAMROCKET_M, `NPC_MONACO`, `NPC_50..54`).
- ⚠️ **Mappe ancora da creare** (per ora danno toast): `percorso_3` (→Marino), `abbazia_interno`,
  `casa_grotta_2_interno`, `grotta_meteora` (il dungeon della meteora di Deoxys). Il flusso completo di
  Deoxys (Divisa da Astronauta) resta quello post-game; qui per ora è gated solo dalla Lega.
  Prossima città: **Marino** (P3 Acqua) via Percorso 3.

### Sessione 23 — Percorso 2 (Frascati→Grottaferrata) + zone Surf come incontri (29 giugno 2026)
- **Nuova mappa `percorso_2`** creata e registrata in `js/map.js` (`sprites/maps_tiled/percorso_2.tmj`,
  40×30, castagneti collinari). Generata via script (layer `ground`/`collisioni`/`eventi`).
  - Warp OVEST → `frascati_est` (spawn `da_percorso_2`, già esistente lì) e warp EST → `grottaferrata`
    (mappa non ancora creata → toast "zona non disponibile"). Spawn `da_frascati_est` e `da_grottaferrata`.
  - **2 zone erba alta** (`incontri percorso 2`, Lv 7-11) + **laghetto Surf** (`incontri percorso 2 surf`).
  - 6 allenatori `all-p2-1..6` (Lv 7-11) in `dati/trainer.js`; 2 NPC `p2_npc1/2` (sprite NPC 21/22) in `dati/npc.js`;
    oggetti a terra (pokeball ×3, repellente, superpozione), 2 cartelli.
- **⭐ REGOLA NUOVA — Zone Surf = zone di incontri** (richiesta utente): ogni specchio d'acqua
  attraversabile col Surf è ANCHE una zona di incontri selvatici. Siccome la MN Surf si ottiene molto
  più avanti (~dopo P5-6), i Pokémon in acqua sono **molto più forti**. Su Percorso 2:
  `incontri percorso 2 surf` Lv **25-35** (Gyarados raro) vs Lv 7-11 a piedi. In Tiled: oggetto `acqua`
  (zona incontri, walkable) + gate `acqua_surf` sulla sponda nord + collisioni sulle altre sponde.
  **Da applicare a tutte le future mappe con acqua.**

### Sessione 22 — Aggiornamenti da PROMPT_CLAUDE_CODE_aggiornamenti (26 giugno 2026)
Implementato il sottoinsieme del prompt che NON richiede mappe nuove:
- **MOD 4 — EXP**: `battle.js`, formula `/5` + minimo 10 (mantenuti bonus allenatore ×1.5 e medaglie).
- **MOD 3 — Incontri**: `map.js` ora fa scelta **pesata** (`rate` per specie); `dati/incontri.js`
  arricchito Gen 1-2-3 (Percorso 1, Boschi Tuscolo) + zona "incontri frascati" pronta, starter rarissimi.
- **MOD 6B — Mosse multi-turno**: aggiunte Furia (Oltraggio/Petalobufera/Tempestafuoco) con
  **confusione** di fine furia, Esplosione/Autodistruzione, Protezione/Individuazione. Stati volatili
  azzerati al cambio Pokémon e a inizio lotta.
- **MOD 5** (velocità battaglia) e **MOD 7** (sfida all'avvicinamento) → **già coperti** dal booster ⏩
  e dal cono visivo `vista` degli allenatori: non duplicati.
- **MOD 1 / 2 / 8** (Abbazia-Castel Gandolfo-Nemi, Percorso 3/4, Lago Albano) e le altre zone incontri
  → **bloccate finché non esistono le mappe**: tutto pronto da incollare in `docs/REMINDER-MAPPE-FUTURE.md`.

### Sessione 21e — Rivale per tappa + Antri Regi + lingue antiche (23 giugno 2026)
- **Rivale scalato per `tappa`:** l'oggetto rivale (prop `tappa: N` = n. incontro) usa
  `costruisciSquadraRivale(N)` in app.js: livelli che salgono (asso Lv 14/26/38/50/62/74) e
  **asso = lo starter scelto dal rivale** (`stato.rivale.idStarter`, evoluto con le tappe).
  Hook in `_avviaLottaTrainer` quando `dati.rivale`.
- **Antri del Trio Regi** registrati (`antro_regice/regirock/registeel` → file `Anto_*.tmj`). Il
  leggendario è l'oggetto `type:"pokemon leggendario"` con `sprite: regice` (nome specie) + `livello`:
  il motore lo mostra con lo **sprite PokéAPI** (front, niente overworld dedicato), è solido e
  interagibile → `triggeraLeggendario`. Mappe `LEG_NOME_ID`/`LEG_ID_NOME`, `_creaLeggendari()`.
  I warp dai 3 portali in tuscolo_profondo sono gated da `richiede` (Lega + 3 di un tipo:
  Regice/lotta, Regirock/acqua, Registeel/terra).
- **Lingue antiche:** a fine Lega un avviso ("ora comprendi le lingue antiche dei Castelli") setta
  `flags.lingue_antiche`. Le iscrizioni (`trigger_storia`) prima dicono "ancora indecifrabile,
  torna più in là", poi sono leggibili. `trigger_storia` resta per cutscene/eventi.

### Sessione 21d — Rivale visibile/on-sight + tassonomia trigger (23 giugno 2026)
- **Tassonomia `trigger_*`:** solo taglio/surf/sub/forza/spaccaroccia sono ostacoli MN (`isMnTrigger`).
  `trigger_storia` ora mostra il `testo` con [A] (gated da `condizione`); `trigger_rivale` viene
  normalizzato a un **trainer** (id `rivale_tuscolo` di default) → visibile + linea visiva.
- **Rivale Remo** (`dati/trainer.js` `rivale_tuscolo`, sprite `npc Rivale`, vista 5): scatta appena
  incroci il suo sguardo (usa tutto il sistema trainer). Supporto generico `flagVittoria` sui trainer.
- ⚠️ Il rivale va PIAZZATO ed ESPORTATO in `tuscolo_ingresso.tmj` da Tiled (al momento non c'è
  nell'export): oggetto `trainer` id `rivale_tuscolo` (o `trigger_rivale`), con `vista` e `direzione`.

### Sessione 21c — Tuscolo profondo (Regi) + Boschetto segreto (Il Solitario + Celebi) (23 giugno 2026)
- **Mappe registrate:** `tuscolo_profondo` (`tuscolo_profondo_1.tmj`) e `boschetto_segreto`. I warp
  interno→boschetto e rovine→profondo ora funzionano (le camere `antro_*` dei Regi non esistono ancora → toast).
- **Condizioni sui warp/NPC (`verificaCondizione` in map.js):** supporta flag (`post_lega`,
  `<id>_sconfitto`), Lega completata, e **requisiti di squadra in linguaggio naturale**
  (es. `richiede: "legaCompletata e tre pokemon lotta in squadra"` → serve la Lega + ≥3 Pokémon di tipo
  Lotta). Tabella `TIPO_IT_EN` (italiano→PokéAPI), `contaTipoSquadra` su `stato.squadra[].tipi`.
  Usata dai 3 warp dei Regi in `tuscolo_profondo` (Regice/lotta, Regirock/acqua, Registeel/terra).
- **NPC/trainer condizionati:** in `_creaNpcStato`, `condizione` filtra la visibilità: i `gate` (es.
  `bosch_guardiano`) compaiono finché la condizione è FALSA (blocco che sparisce); gli altri (Il Solitario
  post-Lega, `il_solitario_post` post-vittoria) compaiono solo quando è VERA. Il campione `speciale`
  battuto sparisce (`_rigeneraNpc`).
- **Il Solitario (`il_solitario`)** in `dati/trainer.js`: campione Lv65-70 con Celebi asso; alla vittoria
  setta `flags.il_solitario_sconfitto`. + 4 allenatori forti del boschetto (Lv58-62) e NPC
  `il_solitario_post`/`bosch_guardiano` in `dati/npc.js`. Sprite alias `CAMPIONE_SOLITARIO→trainer_CHAMPION`,
  `NPC_GUARDIA→NPC 16`.
- **Celebi (251) su Tiled:** in `_tentaIncontro`/`_checkCelebi`, nelle mappe dei Boschi del Tuscolo, dopo
  aver battuto Il Solitario, **3% per passo nell'erba alta** (niente repellente) → `triggeraLeggendario(251,40,…)`.
  Cattura tracciata da `legCatturati` (come gli altri leggendari).
- ⚠️ Da fare in Tiled/futuro: le camere `antro_regice/regirock/registeel` (mappe separate) col rispettivo Regi.

### Sessione 21b — Ostacoli MN + Volo Tiled + QoL repellente + fix interno (23 giugno 2026)
- **Nomi-tipo ostacoli MN (convenzione `<terreno>_<mn>`):** `albero_taglio`, `acqua_surf`, `acqua_sub`,
  `roccia_spaccaroccia`, `roccia_forza` → alias di `trigger_*` (`ALIAS_TIPO`/`normTipo` in map.js).
  **REGOLA: un solo oggetto-trigger, niente tile collisione separato** (è già solido da sé). Documentata
  in `docs/DIZIONARIO-TILED.md`. `_gestisciTrigger` ora libera anche la casella davanti al giocatore
  (recupera le vecchie mappe a "doppio tile"). Aggiunte chiavi `forza`/`sub` in `stato.mn` (no donatore ancora).
- **BUG tuscolo_interno risolto:** lo spawn d'arrivo era a tile (48,74), **fuori** dalla mappa 44×44 (oggetti
  orfani in Tiled) → pg invisibile e loop di warp. Ora `_trovaSpawn` **ignora gli spawn fuori mappa** (atterri
  sullo spawn corretto in-bounds, 18,42) + clamp di sicurezza + `spawnGuard` (i warp sulla casella di spawn non
  scattano finché non ti muovi). ⚠️ In Tiled conviene comunque cancellare gli oggetti orfani fuori mappa.
- **Volo su motore Tiled:** `voloVerso` riscritto — usa `VOLO_TILED` (comune → mappa+tile) e il nuovo
  `GameMap.vaiAMappa(mappa,tx,ty)`. **Atterri FUORI dal Centro Pokémon** del comune. Popolati: Borgata
  (`borgata_tuscolana` 5,14), Frascati (`frascati_centro` 5,27). +1 riga per ogni città futura.
- **QoL — bottone repellente rapido** (`#btn-repellente`, sopra il Volo): appare se hai repellenti, mostra
  quantità + passi rimasti, li usa senza aprire lo zaino.
- **Design MN futuro:** le MN (Forza/Spaccaroccia/Sub/…) saranno date da **NPC nelle città future**, con le palestre.

### Sessione 21 — Mappe Tuscolo (interno + rovine) + tileset Emerald (23 giugno 2026)
- **Due nuove mappe registrate** in `js/map.js` (`MAPPE`): `tuscolo_interno`
  (`tuscolo_interno_1.tmj`) e `tuscolo_rovine` (`tuscolo_rovine.tmj`), dentro la zona
  `boschi-tuscolo` (latC/lonC ~41.79/12.73). I warp da `tuscolo_ingresso` → interno →
  rovine ora funzionano. `tuscolo_rovine` rimanda a `tuscolo_profondo` (mappa non ancora
  creata → toast "zona non disponibile").
- **Nuovo tileset `Emerald_Outside.png`** (256×21000, firstgid 4017): superando il limite
  WebGL come Outside.png, il sistema di "split" è stato **generalizzato a N fette** da 250
  righe (`SPLIT_ROW`, `splitParts`, `_caricaTilesetSplit`, `_renderSplitLayer` riscritti).
  Outside→3 fette, Emerald→3 fette. Caricamento lazy per mappa.
- **Alberi-Taglio**: il tipo Tiled `albero_taglio` è ora alias di `trigger_taglio` (funzione
  `normTipo` in map.js, usata in `buildCollGrid` e `parseEventi`): l'albero blocca e si
  abbatte con la MN Taglio. (1 albero in `tuscolo_interno_1`.)
- **Incontri**: aggiunto `'incontri tuscolo'` in `dati/incontri.js` (pool Boschi del Tuscolo,
  Lv 8-12) — l'erba alta delle mappe nuove usa quell'id.
- **Sprite NPC/trainer**: il motore ora prova anche il prefisso `trainer_` (per `sprite`
  nudi come "YOUNGSTER"), e una tabella `ALIAS_SPRITE` mappa nomi senza file su sprite
  esistenti: `ARQUEOLOGA→trainer_RUINMANIAC`, `NPC_31..37→NPC 23..29` (sostituibili poi).
- **Debug**: aggiunto `GameMap.debugCaricaMappa(chiave)` per caricare una mappa da console/test.
- ⚠️ Asset davvero mancanti se in futuro vorrai grafica dedicata: sprite `ARQUEOLOGA` e
  `NPC 30..37` (ora coperti da alias).

### Sessione 20c — Trainer del bosco + trainer che ti raggiungono (22 giugno 2026)
- **18 allenatori dei Boschi del Tuscolo** in `dati/trainer.js` (`all-bosco-1..18`), squadre e
  dialoghi presi da `ALLENATORI` in data.js. Sprite e `vista` vengono dagli oggetti Tiled.
  ⚠️ In `tuscolo_ingresso.tmj` per ora ci sono pochi oggetti trainer e l'id `all-bosco-2` è
  duplicato: vanno messi 18 oggetti con id UNICI `all-bosco-1..18`.
- **4 NPC del Tuscolo** (`tusc_ing_npc1..4`) in `dati/npc.js`. Nota: `NPC 30.png` non esiste,
  il 4° usa `NPC 26`.
- **Trainer che ti raggiungono**: quando un trainer ti avvista (linea visiva) ora compare un
  "!" sopra di lui, **cammina fino ad esserti accanto** e poi parte la lotta (tu resti bloccato).
  Nuovi `_trainerSpotta`/`_passoTrainer`/`_mostraEsclamazione` + flag `trainerSpotting` in map.js.

### Sessione 20b — Mosse a 2 turni + mappa Tuscolo (22 giugno 2026)
- **Mosse a due turni / ricarica** in `battle.js`: Iper Raggio & co. (`MOSSE_RICARICA`) lasciano il
  Pokémon a ricaricare il turno dopo; Volo/Scavata/Solarraggio & co. (`MOSSE_DUE_TURNI`) si caricano
  al turno 1 e colpiscono al turno 2. Il turno viene forzato (niente menu) e i flag `inCarica`/
  `deveRicaricare` si azzerano a inizio lotta e al cambio Pokémon. Rilevate per nome-chiave PokéAPI
  (non serve MOSSE_DB).
- **`tuscolo_ingresso` registrata**: il warp nord di `frascati_nord` ora punta a `tuscolo_ingresso`
  (prima "boschi_tuscolo", nome vecchio); rinominato lo spawn di ritorno. Da `tuscolo_ingresso` il
  warp verso `tuscolo_interno` è pronto (mappa da creare → toast "non disponibile").


**Fasi completate: F1-F8 + F9 + F10 + F11 + F12 + F12b + F13 + F14-Phase1.**

### Sessione 19 — Mappe Frascati (warp) + gate condizionali (22 giugno 2026)
- **Nuove mappe registrate** in `js/map.js` (`MAPPE`): `frascati_sud`, `frascati_centro`,
  `pokecenter_frascati`. I tileset `../outside.tsx` si risolvono al tileset `outside`
  già esistente: le mappe renderizzano senza modifiche.
- **Supporto al nuovo tipo `warp`** (l'utente è passato da `uscita` a `warp`): aggiunto in
  4 punti — `buildCollGrid` (tile calpestabile), `_gestisciUscitaBordo` (trigger ai bordi),
  `_controllaEventiCalpestabili` (trigger calpestando), gestiti come le vecchie `uscita`.
- **Stack di ritorno per gli interni**: entrando in una mappa `interno:true` via warp si
  fa `mappaStack.push(...)`, così l'`uscita` senza destinazione (es. Centro Pokémon) riporta
  esattamente alla casella di partenza.
- **`_trovaSpawn` più tollerante**: match dello `spawn_id` anche per inclusione (gestisce
  nomi non allineati tipo `da_frascati_sud` ↔ spawn `Da Frascati`).
- **GATE condizionali**: un warp con proprietà `richiede` = nome di un flag di `stato.flags`
  (es. `legaCompletata`) si apre solo a flag attivo; altrimenti mostra `messaggio_gate`.
  **Applicato alla Villa Aldobrandini** (warp in `frascati_centro`): bloccata finché non si
  vince la Lega. La mappa interna della villa è ancora da creare.
- **Collegamento `percorso_1b` → `frascati_sud`**: aggiunti `destinazione`/`spawn_id`
  all'uscita "Ingresso Frascati" (in `.tmj` **e** `.tmx`).
- Mappe ancora da creare (per ora danno toast "zona non disponibile"): `frascati_nord/ovest/est`,
  `palestra_frascati`, `pokemon market frascati`, `villa aldobrandini`.

**Aggiunte stessa sessione (richieste utente):**
- **Trigger MN ora interagibili**: oggetti `trigger_surf` / `trigger_spaccaroccia` / `trigger_taglio`…
  (in Percorso 1b e ovunque) sono **solidi** finché non possiedi la MN: ti avvicini, premi [A] e,
  se hai la MN giusta (`stato.mn[chiave]`), la casella si sblocca; altrimenti avviso "Serve la MN…".
  Aggiunta `stato.mn.spaccaroccia` (default false) + migrazione. (`_gestisciTrigger` in map.js)
- **NPC di Frascati visibili e parlanti**: lo sprite ora ha **fallback** alla proprietà `sprite`
  del Tiled e il loader prova sia `NPC_05` sia `NPC 05` (spazio↔underscore). Aggiunte 8 voci in
  `dati/npc.js` (fra_sud_npc1-4, fra_centro_npc1-4) con sprite e battute a tema.
- **QoL tastiera stile Game Boy** (`initTastiera` in app.js): movimento **solo frecce**;
  **[A]** = conferma/interagisci/avanza dialoghi; **[B]** = indietro/annulla (chiude menu, avanza
  testo); **[Invio]** = Start (apre/chiude il menu); **← →** scorrono le schede del menu.
  Esposto `GameMap.interagisciVicino()`. WASD rimosso dal movimento.
- **Incontri ribilanciati**: probabilità **15%** per casella (costante `PROB_INCONTRO`) +
  **tregua di 4 passi** dopo ogni incontro (`PASSI_TREGUA`/`cooldownIncontro`) → niente più
  scontri uno-dietro-l'altro. Aggiornata `dati/incontri.js` a 15.
- **Repellenti in `MODALITA_TEST`**: 999 repellenti nello zaino per evitare incontri nei test.
- **`frascati_est` registrata** (warp verso `percorso_2` e `villa_torlonia` ancora da creare).
- **Interazione oggetti rettangolari**: nelle mappe nuove NPC/cartelli/oggetti sono rettangoli
  (`point=false`), prima non rilevati. Ora `_aggiornaEventoVicino` li riconosce; gli **NPC** sono
  rilevati dalla posizione corrente (`npcStato`, si muovono). I **cartelli rettangolari** sono
  resi **solidi** (si leggono di fronte); i cartelli "punto" delle mappe vecchie restano com'erano.
  Gli **oggetti a terra** si raccolgono **calpestandoli** (auto-pickup) oltre che con [A]. Nome
  contenuto normalizzato ("caramella rara" → `caramellarara`).
- **`frascati_ovest` registrata** (warp ↔ frascati_centro).

**Sessione 19c — Palestra, Market, NPC, interazione omnidirezionale:**
- **Mappe nuove registrate**: `frascati_nord`, `palestra_frascati` (interno), `pokemon_market_frascati`
  (interno). Aggiunti i tileset `Mart interior` e `professor Castagno` a `TILESET_META/IMMAGINI`.
- **Palestra di Frascati funzionante**: 3 gregari + Capopalestra **Vinicio** (tipo Erba) in
  `dati/trainer.js`, squadre prese da `PALESTRE['frascati']`. Il leader ha `palestraId:'frascati'`:
  alla sconfitta chiama `vinciPalestraTiled` → **Medaglia Vigna** + level cap a 14 (riusa `vinciPalestra`).
- **Trainer interagibili con [A]** (oltre alla linea visiva): nuovo branch `trainer` in `_interagisci`
  (sfida se non battuto, altrimenti dialogo). Il leader (vista 0) si sfida avvicinandosi.
- **Venditore del Market**: NPC `pokemon market venditore` → `apriMarketFrascati`. Aggiunto
  `marketTiledForzato` + override in `marketVicino` (apre `mk-frascati`, merce base: pokeball/pozione/
  superpozione). Azzerato alla chiusura del menu.
- **Interazione da QUALSIASI direzione**: `_aggiornaEventoVicino` riscritto con helper
  `_eventoInCasella`; controlla la casella davanti + le 4 adiacenti + quella sotto i piedi.
  NPC e cartelli ora parlabili/leggibili da ogni lato (richiesta utente). Risolti anche gli
  NPC di frascati_est/nord/ovest (12 voci nuove in `dati/npc.js`).
- **Uscita dagli interni**: qualsiasi warp dentro un interno torna al punto d'ingresso (stack),
  un tile fuori dalla porta.
- ⚠️ Nota dati: l'oggetto in `frascati_ovest` ha `contenuto:"raro_caramella"` (non corrisponde a
  nessun oggetto); andrebbe messo `caramellarara` in Tiled.

### Sessione 20 — Mosse DB, Evoluzioni, Pietre, Mercante scambi (22 giugno 2026)
- **`dati/mosse.js`** (generato da `docs/MOSSE_GEN1_3.md`): 354 mosse Gen 1-3 con
  tipo/categoria (fisico/speciale/stato)/potenza/accuratezza/PP + codice `effetto` snake_case.
- **`dati/evoluzioni.js`** (da `docs/EVOLUZIONI_GEN1_3.md`): 171 Pokémon, metodi livello/
  pietra/felicità/scambio (Gen 4 escluse, ramificate come Eevee/Gloom in array).
- Inclusi in `index.html` prima di battle.js/app.js.
- **Evoluzioni integrate**: `battle.js` ora usa `EVOLUZIONI_DB` (al posto di PokéAPI) per le
  evoluzioni a livello/felicità (`trovaEvoluzioneAuto`, `evolviIstanza` esposta). Aggiunto
  campo `felicita` (default 70, +5/livello) + migrazione salvataggi.
- **Pietre evolutive**: 6 pietre + 6 oggetti-scambio in `OGGETTI`, in vendita nei market giusti
  (PIETRE_MARKET.md). Uso pietra dal menu Zaino → evolve (`avviaEvoluzione` con flash bianco).
- **Mercante scambi**: `interagisciMercanteScambi()` (da agganciare agli NPC dei Centri da Marino):
  evolve i Pokémon da scambio consumando l'oggetto richiesto dallo zaino.
- ⚠️ **Task "effetti mosse" (Task 2)**: `battle.js` implementa GIÀ stati/sbalzi/priorità/multi-colpo
  dai metadati mossa di PokéAPI (Sessione 10). MOSSE_DB usa ID 1-354 propri, non quelli PokéAPI:
  collegarlo come fonte primaria richiede un refactor (mappare ~350 mosse) — da confermare.

**Sessione 19d — Fix richiesti dall'utente:**
- **Capopalestra non si attiva più passandoci davanti**: `vista 0` ora disattiva davvero la
  linea visiva (`0 || '4'` rendeva la vista 4). Il leader si sfida SOLO parlandoci con [A].
- **Warp non "anticipa" più**: lo sprite veniva teletrasportato a metà tween. Nuovo `_snapPlayer()`
  (chiamato in `_transizioneMappa` e `_gestisciPorta`) porta il personaggio sulla casella prima
  di cambiare mappa.
- **Trigger di Taglio ora funzionano**: erano nel layer `collisioni` invece che in `eventi`;
  `parseEventi` ora raccoglie i `trigger_*` anche dal layer collisioni (es. `trigger_taglio` a
  frascati_sud). Restano solidi finché non possiedi la MN Taglio.
- **Decorazioni solide**: oggetti `deco` e `warp_speciale` rettangolari (es. fontana San Rocco)
  non sono più calpestabili. Gli `oggetto` restano raccolti calpestandoli (auto-pickup + toast).

### Sessione 18b — Due motori in conflitto: spento il vecchio (21 giugno 2026)
**Causa radice dei bug ripetuti:** giravano in parallelo DUE motori. Quello vecchio
(`app.js` → `alPasso()`, basato su coordinate lat/lon della mappa OSM) sovrascriveva
quello nuovo Tiled (`map.js`): incontri ovunque, allenatori a distanza, raccolta
automatica oggetti, leggendari su coordinate finte.
- **`app.js`:** nuovo flag `MAPPA_TILED = true`; in `alPasso()` dopo tempo/HUD/salvataggio
  c'è un `return` che **spegne** tutto il vecchio sistema lat/lon. L'infrastruttura dati
  (palestre, squadre, MN, tabelle incontri, oggetti, allenatori) resta intatta e riusabile;
  è solo la MAPPA a essere guidata da `map.js`. Leggendari/eventi: da riportare su tile.
- **`map.js` 3 bugfix:** (1) spawn iniziale usa il punto di partenza della mappa, non "il
  primo spawn a caso"; (2) NPC animati con la PROPRIA texture (`setFrame`), basta scambio
  con lo sprite di Red; (3) NPC/trainer ora SOLIDI, il giocatore non ci passa più attraverso.
- **Verificato con Playwright:** 0 errori console, spawn al centro Borgata, sprite NPC
  corretti, movimento senza diagonali, nessun incontro su erba normale.
- **Aggiunti:** `docs/DIZIONARIO-TILED.md` (convenzioni tile/oggetti), `server.js` + `start.bat`
  (il gioco va aperto via http://localhost:8000, NON col doppio click su index.html).

### Sessione 18 — Fix motore mappe Tiled (21 giugno 2026)
Quattro correzioni al loader mappe `js/map.js`, adattate alla struttura reale dei TMJ
(spawn, warp, zone erba alta) creata dall'utente in Tiled:
- **Fix 1 — niente diagonali**: nel game loop l'asse verticale ha la precedenza, mai
  aggiornare X e Y nello stesso passo.
- **Fix 2 — incontri solo su erba alta/acqua**: nuova `_getTileType(tx,ty)` che legge le
  zone `erba_alta`/`acqua` del layer eventi; gli incontri scattano solo dentro quelle zone.
- **Fix 3 — spawn corretti alle transizioni**: nuovo resolver `risolviMappa()` (tollerante a
  nomi disordinati IT/EN) + `_trovaSpawn()` che sceglie lo spawn per `spawn_id`, per mappa di
  provenienza, `default` o primo disponibile. Aggiunta `percorso_1b` al registro MAPPE.
  Gestisce il refuso `spwan`.
- **Fix 4 — NPC e trainer si muovono**: `npcStato[]` popolato a ogni caricamento; NPC
  `random` vagano nel raggio, trainer `pattuglia` alternano direzione; cono visivo dei
  trainer controllato ogni frame. Gestisce il refuso `patuglia`.

**Completato nella stessa sessione:**
- Aggiunti in `dati/trainer.js` i 5 allenatori mancanti (Path 1 = 8 totali: `1_4`, `1b_5`,
  `1b_6`, `1b_7`, `1b_8` → all-tusc-4..8), presi da `ALLENATORI` in data.js.
- Aggiunti via script gli spawn di ritorno nei TMJ: `Da percorso 1` in Borgata e
  `Da percorso 1b` in Percorso 1 (vicino alle uscite nord). ⚠️ Vivono solo nel `.tmj`:
  se riesporti da Tiled vanno riaggiunti nel `.tmx`.
- Oggetti con id duplicato `"univoco"`: risolto nel codice usando una chiave per posizione
  (`mappa:tx,ty`), così non spariscono più gli altri.
- Mappa "Frascati" inesistente: la transizione ora mostra un toast "Zona non disponibile"
  invece di rompersi (la mappa va creata in F-successiva).

### Sessione 17 — F14 Phase 1 + Anti-spoiler (15 giugno 2026)
- **Anti-spoiler** su tutto il gioco: rimossi/oscurati tutti i riferimenti espliciti ai leggendari nei dialoghi pre-incontro:
  - "Piuma Sacra" → **"Piuma Iridescente"** (nome e descrizione in OGGETTI_CHIAVE)
  - "Braciere di Nemi" description: rimossa riga "→ Lugia"
  - "Divisa da Astronauta" description: rimossa riga "Richiesta per raggiungere Deoxys"
  - Dialogo Bunkerino post-boss: "Mewtwo" → "il soggetto"; "Villa Aldobrandini" → "giardini di Frascati"
  - Dialogo menu scelta Bunkerino: "Affronta Mewtwo?" → "Prosegui nel laboratorio?"
  - Titolo incontro Mewtwo: "Mewtwo — Il Progetto 150" → **"Progetto 150 — Il Nucleo"**
  - Toast esito Mewtwo: oscurato riferimento a Villa Aldobrandini
  - Dialogo Deoxys: "Deoxys" → "il soggetto" nelle righe pre-incontro
  - Titolo incontro Deoxys: "Luna — Deoxys" → **"Luna"**
  - Lugia dialog: rimossa riga meta-esplicativa "(Braciere... Lugia risponde)"
  - Ho-Oh dialog: "Piuma Sacra" → "piuma iridescente" nel testo
  - Villa Aldobrandini post-Mew: messaggi genericizzati (no "Mew" nelle risposte)
  - Nome dialogo trigger Mew: "Villa Aldobrandini — Mew" → **"Villa Aldobrandini"**
- **F14 Phase 1 — grafica cartoon:**
  - Tile layer: **OSM → CartoDB Voyager** (più pulito, neutro, game-like)
  - **Zone overlay colorate**: ogni zona di world.js disegnata come cerchio/rettangolo
    colorato sulla mappa (bosco=verde scuro, acqua=blu, grotta=grigio, neve=azzurro,
    vigne=ambra, montagna=marrone, urbano=crema, ecc.) — grande impatto visivo
  - **Avatar giocatore**: da Pokéball-emoji → **sprite pixel-art SVG** dell'allenatore
    (cappellino rosso, viso, camicia bianca, pantalone blu, scarpe, zaino arancione)
    stile FireRed/LeafGreen; `image-rendering: pixelated`, 32×40 px con drop-shadow
  - **Font "Press Start 2P"** (Google Fonts) aggiunto via CDN: usato per titolo HUD e
    nomi nel dialogo, dà il feel GBA autentico
  - **Dialog box restyled**: bordo 5px blu scuro + inset crema (stile doppio bordo GBA),
    nome dialogo con font pixel + sfondo giallo, sfondo avorio #f0ead8
  - `World.getZone()` esposto come API pubblica per i layer visivi
- **Commit**: `ed7a1e3` — live su https://monacellilu-hash.github.io/pokemon-castelli/

### Sessione 18 — FASE 3 + FASE 4 Phaser (15 giugno 2026)
- **FASE 3 — Collisioni acqua**: tile tipo `acqua (idx=1)` bloccano il movimento senza MN Surf.
  Toast: "🌊 Qui c'è l'acqua! Serve MN Surf." Con `stato.mn.surf = true` il passaggio è libero.
  Implementato in `_sposta()` con lookup su `tilemapData[newTy][newTx]`.
- **FASE 4 — Pulsante Interagisci**:
  - `_costruisciListaPOI()`: costruisce array di tutti i POI dai dati globali (laboratorio,
    palestre, centri, market, donatori, NPC, museo, funivia, meteorologo, anfratti, villa,
    porchettaro, bunkerino, parcheggione, lega). ~40 POI totali.
  - `#overlay-interagisci` + `#btn-interagisci`: elemento HTML fisso in basso al centro,
    compare quando il giocatore entra nel raggio del POI più vicino. Animazione "glow" giallo.
  - `#interagisci-etichetta`: mostra icona + nome del POI vicino.
  - Tasto Spazio → attiva l'azione del POI corrente (come tasto A nei giochi Pokémon classici).
  - Indicatore "!" giallo sopra il giocatore nel canvas Phaser quando vicino a un POI.
  - Marker visivi per ogni POI nella scena: puntino colorato per categoria + icona emoji.
  - `interagisciCentro(id)` + `_mostraMenuCentro(id)` aggiunti ad app.js:
    menu in-game con "Cura Pokémon" e "Dormi qui" — sostituisce il vecchio popup Leaflet.
  - `bloccaMovimento()` nasconde l'overlay; `sbloccaMovimento()` ricalcola il POI vicino.
  - `teleporta()` aggiorna indicatore "!" e ricalcola POI dopo il teletrasporto.

**Prossimo passo:** F14 Phase 2 — aggiungere sprite building reali di FireRed/LeafGreen
per palestre, centri Pokémon, laboratorio (PNG in cartella `sprites/`). Poi: sprite
overworld animati per NPC/allenatori, sfondo-mappa cartoon.

---

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
  5. **Rocca di Papa** — Baso (Lotta) — *Medaglia Pigna* — pugni duri come il peperino del Vulcano Laziale
  6. **Albano** — Giorgia (Roccia) — *Medaglia Scudo* — Castra Albana, mura di pietra
  7. **Ariccia** — Ombretta (Buio) — *Medaglia Fraschetta* — fraschette di notte, il ponte
  8. **Genzano** — Flora (Fuoco) — *Medaglia Lava* — l'Infiorata, la lava fa fiorire i fiori migliori
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
    - P5 Rocca di Papa: **Rocco** (Roccia) — Medaglia Lava
    - P6 Albano: **Massimo** (Lotta) — Medaglia Scudo
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
