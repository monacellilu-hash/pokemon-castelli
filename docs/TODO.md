# TO-DO — Pokémon Castelli Romani

> **12 settembre 2026 — Rifugio CoTrAL di Rocca di Papa completo + rifiniture varie**: cutscene
> completa Baso/Marcello (dialogo esteso, "!" e riconoscimento del giocatore, 2 battaglie in doppia con
> Baso come alleato — prima volta che il motore ha un vero "alleato con squadra propria", vedi
> `Battle.avviaDoppia` opzioni.alleato in `js/battle.js`), monologo finale di Marcello con consegna
> della 1ª parte password Rifugio GdF di Marino, epilogo con Baso che si avvicina e Gianluca che
> ringrazia prima di sparire entrambi. Questo **è** il dungeon con boss che mancava al nascondiglio
> CoTrAL di Monte Cavo (vedi voce aggiornata sotto). **Bug corretti nella stessa sessione**: EXP
> spropositata (moltiplicatore "+50% per medaglia" tolto, era ×5 con 8 medaglie; divisore riportato a
> /7 come nei giochi veri); gate/condizione dei personaggi di questa cutscene erano scritti nel posto
> sbagliato (`dati/npc.js` invece delle proprietà dell'oggetto Tiled — non avevano alcun effetto,
> "schermo nero ma non sparisce nessuno"); mosse ad area `all-other-pokemon` (Terremoto, Surf, Scarica…)
> ora colpiscono davvero anche il proprio compagno in doppia, non solo gli avversari (prima trattate
> come `all-opponents`). **Novità minori**: Raikou/Entei piazzati fisicamente accanto a Suicune al Lago
> di Nemi (prima esistevano solo nel roaming, mai come NPC veri) — avvicinarsi a uno qualsiasi dei tre
> li fa scappare tutti insieme, come da meccanica roaming già esistente. Vitamine (6) e Fossili (5)
> aggiunti a `OGGETTI` (js/data.js) — oggetti veri, acquistabili/raccoglibili, ma senza ancora un
> effetto meccanico (nessun sistema EV, nessun laboratorio di rianimazione: entrambi confermati "ok
> così, nessuna urgenza"). Warp-stub `warp_lab_fossili` aggiunto a Genzano.tmj/.tmx verso
> `laboratorio_fossili_genzano` (mappa non ancora disegnata — mostra "zona non ancora disponibile"
> finché non esiste, stesso schema già usato per `nascondiglio_cotral` prima che esistesse).
>
> **8 settembre 2026 — Arco GdF riscritto** (richiesta esplicita di Luca, sequenza dettagliata da lui):
> Giovanni ora è il nome definitivo del Comandante GdF (risolve l'ambiguità "Crasso"), incontrato DUE
> volte (Rifugio di Marino → Pietra Zaffiro/Kyogre, poi Grotta del Vulcano → Pietra Rubino/Groudon).
> Password del Rifugio in 3 parti con nomi veri: Lab CoTrAL/Monte Cavo (1ª), **Michela** al Museo di
> Nemi (2ª, ex "Capo GdF" generico), **Ginevra** all'Abbazia (3ª, nuova). **Fernando** (ex "gdf-villa-7"
> generico) a Castel Gandolfo rivela solo il documento, non una parte della password. Dettagli completi
> in `docs/STORIA_COMPLETA.md`, arco GdF. Implementato lato codice: rename Giovanni/Fernando/Michela in
> `dati/trainer.js`, Pietra Zaffiro in `js/data.js` (OGGETTI_CHIAVE), cutscene `rifugio_marino_boss_dopo`
> e monologo Grotta del Vulcano allungato in `dati/cutscene.js`, gate dei warp interni della Grotta del
> Vulcano dietro `pietra_zaffiro_ottenuta` (prima visita: solo grunt esterni battibili, i piani interni
> restano chiusi finché non hai la pietra) in `Grotta_vulcano_1f.tmj`/`.tmx`.
> ✅ **Mappa disegnata da Luca** (confermato 12 settembre 2026): l'interno dell'Abbazia di San Nilo ora
> esiste come mappa Tiled — non era ancora stato segnato qui. ⏳ **Resta da fare**: Ginevra + la sua
> cutscene (3ª parte della password) e il gate finale a 3 parti sulla porta del Rifugio di Marino non
> sono ancora cablati su quella mappa (nessuna specifica dettagliata ancora data da Luca, a differenza
> della cutscene Baso/CoTrAL di Rocca di Papa). Cutscene "GdF bloccano la strada Ariccia→Genzano per ubriachi molesti post-Sagra"
> ancora da scrivere — serve la posizione esatta del trigger su Tiled. Marcatore Kyogre sul Lago di
> Albano ancora da piazzare (l'oggetto-item Pietra Zaffiro e la meccanica sono già pronti, stesso schema
> "addormentato"/"sveglia_con" già usato per Groudon).
> ⚠️ **Segnalato da Luca, non affrontato questa sessione**: il Team CoTrAL "è un po' da rifare" — nessun
> dettaglio raccolto ancora, va approfondito in una sessione dedicata quando Luca è pronto a parlarne.
>
> Riscritto il 5 agosto 2026, sessione di sola documentazione (storia canonica `STORIA.md` →
> `docs/BIBBIA-NARRATIVA.md` v3). Sostituisce integralmente la versione del 3 agosto: molte voci
> erano già superate dal codice reale (vedi `docs/STATO-PROGETTO.md` §0), altre restano valide e sono
> state riportate. Ogni voce dice **CHI** la fa:
> - **LUCA** — disegno in Tiled, scelte creative, procurare sprite/asset.
> - **CLAUDE CODE** — codice, `dati/*.js`, registrazione mappe, warp, flag, documenti.
> - **LUCA → CLAUDE CODE** — due tempi: prima disegna Luca, poi cabla Claude Code (due righe distinte).
>
> Le stime di priorità sono informali, non impegni. Le voci LUCA non hanno stima di tempo.
>
> **Riconciliato il 12 agosto 2026**: Gruppo A e Gruppo C riscritti punto per punto con formato
> "✅ FATTO" / "⏳ MANCA" dopo un giro di verifica sul codice reale (non sulle vecchie note) — molte
> voci erano già superate dal lavoro di Luca su Tiled o da sessioni precedenti mai riportate qui.
> Stessa sessione: tileset mancanti di Ariccia registrati, `laboratorio_interno.png` disaccoppiato
> dalla mappa del laboratorio (era già inutilizzato, solo una dichiarazione morta), Museo delle Navi
> di Nemi collegato al mondo (2 piani, warp+spawn), porta della palestra di Ariccia cablata sul "dot"
> già piazzato da Luca.
>
> **Seconda ondata, stessa giornata (12 agosto)**: capopalestra di Genzano sovrascritta in **Camilla**
> (via definitiva, non più Flora); MN Volo spostata da "6 medaglie" a "dopo la palestra di Albano";
> MN Cascata (permesso da Ariccia) e MN Sub (permesso da Genzano, MN nuova) assegnate — resta aperto
> solo dove trovare i due oggetti sul campo; Museo di Nemi popolato con 3 grunt + 1 capo GdF (2ª parte
> password Marino) + 2 ostaggi + 1 Pepita + MT Idro Pompa; **Risfida allenatori implementata**
> (allenatori normali, non capipalestra/boss/rivale — squadra fino a 1.5× il livello originale,
> soldi dimezzati, non prima di 7 giorni di gioco dall'ultima sconfitta). Lotta in doppio **non**
> implementata questa sessione — vedi nota dedicata sotto, motore attuale è un rewrite troppo grosso
> per essere fatto in coda a tutto il resto senza rischiare di rompere le lotte 1v1 esistenti.

---

## Gruppo A — Mappe e contenuti narrativi

### Percorso di Marino allungato + biforcazione Spaccaroccia + Snorlax
- ✅ **FATTO**: ramo, biforcazione e ostacolo Spaccaroccia esistono su `marino.tmj`; Snorlax/NPC
  Pokéflauto piazzati.
- ⏳ **MANCA**: nulla di bloccante segnalato. Da ripercorrere a mano se non già fatto.

### Palestra di Marino (Moro) — Medaglia Fontana
- ✅ **FATTO**: Moro piazzato su `pokemon-castelli-palestra_marino.tmj`, registrata come
  `interno_palestra_moro`, dati allineati.
- ⏳ **MANCA**: solo la ripercorsa a mano (mai confermato a schermo che si ottiene davvero la
  Medaglia Fontana). Nessuna azione di codice nota.

### Palestra di Monte Porzio (Stella) — Medaglia Stella
- ✅ **FATTO**: id palestra allineati (`gym_leader_palestra monteporzio`), nessun bug residuo.
- ⏳ **MANCA**: solo la ripercorsa a mano.

### Palestra di Rocca di Papa (Baso) — Medaglia Pigna
- ✅ **FATTO**: Baso (tipo Lotta, scambio con Albano) + 7 gregari piazzati in
  `pokemon-castelli-palestra_rocca_di_papa.tmj`, registrata come `interno_palestra_rocco`.
- ⏳ **MANCA**: ripercorsa a mano (posizioni trainer stimate dalla griglia, mai verificate a schermo).

### Palestra di Albano Laziale (Giorgia) — Medaglia Scudo
- ✅ **FATTO**: Giorgia (tipo Roccia, scambio con Rocca di Papa) + 8 gregari piazzati in
  `pokemon-castelli-palestra_albano.tmj`, registrata come `palestra_albano_interno`.
- ⏳ **MANCA**: permesso Volo da questa palestra (oggi Volo lo dà Faustino il funicolarista a 6
  medaglie, non la palestra — discrepanza rispetto alla tabella MN di CLAUDE.md, da riconciliare se
  Luca lo ritiene un problema); gate Zona Safari (pagamento già pronto, manca la cattura vera —
  vedi Gruppo C); ripercorsa a mano.

### Palestra di Ariccia (Ombretta) — Medaglia Fraschetta
- ✅ **FATTO** (sessione 12 agosto): la porta esterna era il "dot" senza proprietà che Luca aveva
  già piazzato su `Ariccia.tmj` (oggetto `palestra`, id 104) — trasformato in una vera porta
  (`destinazione: palestra_ariccia_interno`, `spawn_id: entrata_principale`) e aggiunto lo spawn di
  ritorno `da_palestra_ariccia`. L'interno (Ombretta + 9 gregari) era già popolato da sessioni
  precedenti.
- ✅ **FATTO** (stessa sessione): 4 tileset di `Ariccia.tmj` non erano mai stati registrati nel motore
  (`party`, `party2`, `party3`, `porchetta`) — stesso identico problema già risolto per `palestre`/
  `palestre2`/`palestre3` in sessione precedente. Registrati in `js/map.js`.
- ✅ **FATTO** (12 agosto, seconda ondata): MN Cascata — permesso concesso direttamente da questa
  palestra (`mnDonata: 'cascata'` in `PALESTRE`, `js/data.js`, stesso meccanismo di Sub a Genzano).
  Oggetto sul campo ancora da assegnare.
- ⏳ **MANCA**: ripercorsa a mano (porta nuova, mai testata a schermo).

### Laboratorio del Prof. Castagno (Borgata Tuscolana)
- ✅ **FATTO** (sessione 12 agosto): `laboratorio_interno.png` non esiste da nessuna parte nel
  progetto, ma non serviva più — verificato che il tileset `laboratorio_interno.tsj` era già
  completamente inutilizzato nella mappa reale (nessun gid delle 4 mappe di tile lo referenzia più,
  Luca l'aveva già sostituito con `Interior_general_32` in Tiled). Rimossa la dichiarazione morta da
  `.tmj`/`.tmx` e da `js/map.js`: **zero dipendenza dal png mancante**, nessun rischio per la mappa.
  Aggiunti 2 NPC assistenti (`scienziato_lab_1`/`_2`, sprite `scienziato`): il primo regala 1 Pozione
  una tantum, il secondo è solo dialogo.
- ⏳ **MANCA**: ripercorsa a mano (posizioni segnaposto x230/x550,y560 — Luca le sposta se stonano
  con l'arredamento).

### Laboratorio/Rifugio GdF di Marino
- ✅ **FATTO**: rifugio multi-piano già cablato (`gdf_marino_1f`/`2f_a`/`2f_b`/`2f_c` in `MAPPE`).
- ✅ **FATTO** (8 settembre 2026): il boss in fondo (2F_B) è **Giovanni** (ex "Capo GdF" generico), dà
  la Pietra Zaffiro (Kyogre) al primo incontro — cutscene `rifugio_marino_boss_dopo`.
- ⏳ **MANCA**: il gate vero sulla porta d'ingresso (`warp_gdf_marino` in `marino.tmj`) che richieda
  tutte e 3 le parti della password insieme — oggi si entra senza controlli. Bloccato in attesa della
  3ª parte (Ginevra, interno dell'Abbazia ancora da disegnare — vedi voce Grotta del Vulcano/arco GdF
  sopra). Il passaggio sommerso verso Kyogre (serve MN Sub, mai introdotta) e il marcatore Kyogre vero
  e proprio sul Lago di Albano restano da piazzare.

### Tunnel roccioso Castel Gandolfo → Monte Porzio
- ✅ **FATTO**: è il "Tunnel Roccioso" (dungeon 4 piani, sessione 6 agosto), già collegato Via dei
  Laghi → Monte Porzio. Nessuna azione residua — la voce era superata, tolta dal registro degli
  aperti.

### Museo delle Navi di Nemi — 2 piani
- ✅ **FATTO** (sessione 12 agosto): le due mappe (`Museo_navi_1f`/`2f`) esistevano solo come `.tmx`
  mai esportati, senza nessun warp/spawn (layer eventi completamente vuoto su entrambe). Convertite
  in `.tmj`, registrate in `MAPPE` (`museo_navi_1f`/`museo_navi_2f`), collegate con un varco su
  `Lago di Nemi.tmj` (oggetto `porta_museo_navi`, posizionato subito dopo il gate GdF esistente
  `gdf_gate_nemi` — quindi resta comunque bloccato dalla stessa condizione `documentoVillaOttenuto`
  già presente) e scale interne 1f↔2f. Registrati anche i 2 tileset mai usati nel motore (`Mansion
  interior`, `Museum interior`).
- ✅ **FATTO** (stessa sessione, seconda ondata): popolato con 3 grunt GdF (`gdf_grunt_museo_1/2/3`)
  + 1 capo (`gdf_capo_museo`, titolo generico "Capo GdF" come `gdf_capo_marino` — identità vera
  ancora da decidere) che alla sconfitta setta `stato.flags.museo_nemi_password` (2ª parte della
  password del Rifugio GdF di Marino). 2 ostaggi NPC (`ostaggio_museo_1`/`_2`, custode + visitatore)
  con dialogo che cambia dopo la liberazione. Piazzati anche 1 Pepita (`oggetto_pepita`, tesoro mai
  usato altrove) e 1 MT — vedi voce dedicata sotto.
- ⏳ **MANCA**: il gate sulla porta del Rifugio GdF di Marino che dovrebbe richiedere le 3 parti
  password non esiste ancora (oggi si entra senza controlli, vedi voce "Laboratorio/Rifugio GdF di
  Marino"): quando anche la 3ª parte (Abbazia) esisterà, va scritto il controllo vero; posizioni di
  porta/scale/trainer sono segnaposto; ripercorsa a mano mai fatta.

### MT nuova: Idro Pompa (bottino del capo GdF al Museo)
- ✅ **FATTO**: `mt_hydro_pump` (generata automaticamente in `dati/mt_tutte_mosse.js`, nome ancora in
  inglese) tradotta in **"MT — Idro Pompa"** e piazzata come bottino del capo GdF al Museo di Nemi —
  prima MT "generata automaticamente" a essere davvero usata in game (le altre 739 restano in inglese
  finché non verranno piazzate, come da convenzione).

### Grotta del Vulcano (Giovanni, seconda ed ultima rivincita)
- ✅ **FATTO** (8 settembre 2026): 3 piani, 22 grunt totali, Giovanni (stesso personaggio del Rifugio
  di Marino) come boss finale via catena Levantino→Giovanni, Groudon sempre visibile nel nucleo ma
  sfidabile solo con la Pietra Rubino (schema "addormentato"/"sveglia_con", come Snorlax). Piani interni
  (2f/3f) gated dietro `pietra_zaffiro_ottenuta` (prima ottenuta al Rifugio di Marino, vedi arco GdF
  riscritto in `docs/STORIA_COMPLETA.md`) — la prima visita permette solo di battere i 12 grunt esterni
  del 1° piano.
- ⏳ **MANCA**: ripercorsa a mano completa (mai vista a schermo).

### Percorso Grottaferrata → Rocca di Papa + biforcazione Monte Cavo
- ✅ **FATTO**: `percorso_montano_v1` collega Monte Porzio → Rocca di Papa (gate a medaglie
  Marino+Monte Porzio, come da narrativa).
- ⏳ **MANCA**: da confermare se serve ANCHE un percorso diretto separato da Grottaferrata (oggi il
  collegamento passa da Monte Porzio) — se Luca lo considera già equivalente, nessuna azione.

### Nascondiglio CoTrAL ai piedi di Monte Cavo (collegamento_Cotral)
- ✅ **FATTO**: mappa esistente e cablata, luogotenente CoTrAL presente, lettera = 1ª parte password
  Marino, funivista Gianluca liberato → accesso a Monte Cavo via dialogo.
- ✅ **FATTO** (12 settembre 2026): il "vero dungeon con boss" che mancava qui **è** il Rifugio CoTrAL
  di Rocca di Papa (`nascondiglio_cotral`, raggiunto da un warp su questa stessa mappa) — costruito per
  intero questa sessione: boss **Marcello**, cutscene completa (Baso vs Marcello, 2 grunt "forte" +
  scontro finale in doppia con Baso alleato, Battle.avviaDoppia esteso con la prima "squadra alleato"
  del motore), epilogo (Baso si avvicina, Gianluca ringrazia, entrambi spariscono con dissolvenza).
  Il trigger `stato.flags.baso_tornato` ora scatta SOLO a fine di quell'epilogo (non più sulla
  sconfitta dei 2 grunt segnaposto qui) — vedi `js/map.js` `_epilogoBasoCotralRocca`.

### Monte Cavo — Articuno, miniboss, ghiaccio scivoloso
- ✅ **FATTO**: mappa costruita, Articuno (lv55) + miniboss piazzati, meccanica ghiaccio scivoloso
  implementata (incluso il fix del blocco input durante la scivolata, sessione 11 agosto).
- ⏳ **MANCA**: ripercorsa a mano completa (mai vista a schermo secondo le note delle ultime sessioni).

### Percorso 7 + biforcazione verso Spiaggia di Albano
- ✅ **FATTO**: `percorso_7b` esiste come biforcazione verso il Lago di Albano (gated a medaglie).
- ⏳ **MANCA**: confermare che il numero di medaglie richiesto sul gate sia quello voluto (mai
  specificato un numero esatto in una decisione precedente).

### Spiaggia di Albano = Lago di Albano (MN Surf, Suicune/Raikou/Entei)
- ✅ **FATTO**: la mappa esiste già (`Lago di Albano.tmj`, + varianti `interno`/`profondo`) — non è
  una mappa da disegnare da zero, è quella già presente. Suicune fisso al Lago di Nemi con roaming
  già implementato (`suicune_nemi`, sessione precedente).
- ⏳ **MANCA**: verificare/piazzare l'oggetto MN Surf sul Lago di Albano (permesso già assegnato alla
  palestra di Rocca di Papa, P5, ora completata — quindi il lato "permesso" della MN è pronto, resta
  solo il lato "oggetto sul campo"); trigger Raikou/Entei roaming da agganciare all'arrivo sulla
  spiaggia.

### Ponte di Ariccia + zona sotto il ponte (Ho-Oh)
- ✅ **FATTO** (13 agosto, confermato da Luca): fatto.

### Dungeon dei porchettari + Piuma (Ariccia)
- ✅ **FATTO**: la "Sfida dei Porchettari" esiste già ed è implementata per bene (`js/map.js`, ~riga
  3815 in poi) — 5 lotte in sequenza (`porchettaro_sfida_1..5` in `dati/trainer.js`), vittoria a
  tutte e 5 → Piuma una tantum (`stato.flags.piuma_porchettari`). Non è un "dungeon" separato da
  disegnare: è la sfida già esistente nella città.
- ✅ **BUG VERO TROVATO E CORRETTO** (5 settembre 2026, sessione successiva) — Luca ha segnalato che
  Tiled non salvava più i file `.world` e sospettava fossero obsoleti: **confermato per il cluster
  `montepo`**. `Osservatorio.tmj` era stato ridimensionato (25×30 tile) DOPO che `montepo.world` era
  stato scritto con le dimensioni vecchie (50×40 tile, cioè 1600×1280px anziché 800×960px) — il
  generatore `strumenti/genera_clusters.py` usa alla cieca le dimensioni scritte nel `.world` (non le
  ricontrolla mai contro il file reale), quindi `js/clusters.js` ereditava lo stesso errore: Osservatorio
  finiva piazzato con un vuoto di 10 tile rispetto a Monte Porzio invece di toccarlo — impossibile
  arrivarci a piedi, esattamente il sintomo segnalato. Corretto `montepo.world` (dimensioni E
  posizione, ricalcolata perché il bordo tornasse a combaciare) e rigenerato `js/clusters.js` col
  generatore vero (mai a mano, come dice l'intestazione del file). Rimossi anche il warp/spawn
  aggiunti per errore nella sessione precedente per collegare Monte Porzio↔Osservatorio: non
  servivano, sono due mappe dello stesso **cluster** (si cammina da una all'altra senza fade), non
  collegate da un warp.
- ⏳ **Percorso 7b — controllato, nessun bug trovato uguale a Osservatorio**: dimensioni nel `.world`
  già corrette, e il bordo con `percorso_7` combacia già nel cluster (nessun vuoto). Se resta
  irraggiungibile a piedi, la causa è altrove — o un muro di collisione lasciato sul bordo in Tiled
  (invisibile da fuori, va controllato lì), o il gate "a medaglie" già noto (vedi sopra, "confermare
  che il numero di medaglie richiesto sul gate sia quello voluto") che sta funzionando come previsto.
  Da chiarire con Luca quale dei due.
- ✅ **FATTO** (5 settembre 2026) — Grotta di Ho-Oh vera: mappa disegnata da Luca (`grotta_ohoh.tmx`,
  convertita in `.tmj` con `strumenti/tmx_a_tmj.py`, non esisteva ancora nel gioco), registrata in
  `MAPPE` (`tema:'cave'`). Ingresso aggiunto in `Ariccia.tmj`, gated su `stato.flags.
  piuma_porchettari` (niente più "mostra alla NPC": la Piuma stessa apre il passaggio, stesso
  meccanismo `condizione` già usato altrove). Ho-Oh (lv50) piazzato in cima al cunicolo come
  "pokemon leggendario" premio — appare SOLO con la Piuma. **Scartato di proposito** il vecchio
  evento "alba della Sagra sul Ponte" (`js/app.js` riga ~4860, testo atmosferico già scritto e
  bello) perché usa ancora lat/lon del motore Leaflet pre-F14, morto — non portato qui, resta
  disponibile se Luca lo rivuole riscritto per Tiled. Posizioni ingresso/Ho-Oh stimate a occhio,
  **MAI verificato dal vivo**.

### Genzano città + palestra (Camilla, tipo Fuoco)
- ✅ **FATTO** (12 agosto, sovrascritto su richiesta esplicita di Luca — "capo palestra genzano si
  chiama camilla stop"): rinominata ovunque da **Flora** a **Camilla** (`js/data.js`, `dati/trainer.js`
  — 16 occorrenze), tipo resta **Fuoco**, Medaglia Lava invariata. Risolve la discrepanza narrativa
  segnalata nella sessione precedente (BIBBIA-NARRATIVA/STATO-PROGETTO parlavano già di "Camilla":
  ora i dati reali coincidono). Interno completo con 10 gregari, porta città↔palestra cablata.
- ✅ **FATTO** (12 agosto): MN Sub — permesso concesso direttamente da questa palestra (`mnDonata:
  'sub'` in `PALESTRE`, `js/data.js`). Oggetto sul campo ancora da assegnare.

### Osservatorio — dungeon-laboratorio con boss in doppio
- ⏳ **MANCA tutto**: `Osservatorio.tmj` esiste come luogo-evento (Zapdos) ma non è ancora un
  dungeon con un vero scontro finale. La discrepanza Flora/Camilla è risolta (vedi voce Genzano
  sopra): il boss doppio finale sarà con Camilla.
- ℹ️ **Aggiornamento 3 settembre 2026**: il motore di lotta in doppio (`Battle.avviaDoppia`, vedi
  Gruppo C) ora **esiste** — scritto per il caso "2 allenatori mi vedono insieme" (Boschi del
  Tuscolo), non ancora testato dal vivo nel browser. Può essere riusato anche per il boss doppio
  dell'Osservatorio quando quel dungeon verrà costruito, ma prima va verificato con un playtest
  reale sul caso per cui è stato scritto.

### Mega percorso verso Via dei Laghi (post-Genzano)
- ✅ **FATTO** (13 agosto, confermato da Luca): fatto.

### Villa Aldobrandini interna (Mew)
- ⏳ **MANCA tutto** (confermato da Luca in questa sessione: "da fare"). Oggi Villa Aldobrandini
  esiste solo come giardino esplorabile a Frascati, nessun interno.

### Treno per Lugia
- ⏳ **MANCA tutto** (confermato da Luca in questa sessione: "da fare"). Nessuna meccanica di
  "viaggio a lungo raggio" esiste nel motore — va progettata da zero.

### Piazza San Rocco, Frascati (Rayquaza)
- ✅ **FATTO** (13 agosto, confermato da Luca): la piazza è `frascati_ovest.tmj` (già registrata in
  `MAPPE`, `js/map.js`).
- ⏳ **MANCA**: fontana interattiva + dungeon gated da Kyogre+Groudon in squadra (meccanica di gioco,
  non la mappa).

### Via Vittoria + Lega di Colonna + Bunkerino
- ✅ **FATTO** (12-13 agosto): Via Vittoria costruita e ricablata da Luca (5 piani + area segreta
  Moltres, `via_vittoria_1f` .. `_5f` / `_secret` registrate in `MAPPE`, `js/map.js` righe ~276-317).
  La Lega di Colonna è in lavorazione da Luca su Tiled (`lega_pokemon`, `lega_pokemon_4f` già
  registrate in `MAPPE`).
- ✅ **FATTO** (13 agosto): popolata con 12 allenatori (`via_vittoria_1`..`12`, `dati/trainer.js`,
  Lv 55-63) + 2 dot rivale (`rivale_via_vittoria` = Remo, squadra dinamica per tappa come
  `rivale_tuscolo`; `rivale2_via_vittoria` = PLACEHOLDER, identità da decidere, vedi D13) + 5 zone
  erba_alta (una per piano, incontri Lv 55-63 in `dati/incontri.js`, chiavi `incontri via vittoria
  1f`..`5f`). Testabile subito da console anche senza collegamento al mondo: vedi istruzioni sotto.
- ✅ **FATTO** (confermato da Luca, 3 settembre 2026): la Lega di Colonna è **completata** su Tiled —
  i file `Lega_pokemon_1f.tmj`/`_2f.tmj`/`_3f.tmj` ora esistono (verificato: prima non c'erano).
- ✅ **FATTO** (5 settembre 2026) — `Lega_pokemon_1f`/`_2f`/`_3f`/`_5f` registrate in `MAPPE`
  (`js/map.js`; `_4f` lo era già). Aggiunto un layer oggetti "eventi" (prima assente, zero oggetti in
  TUTTI i piani + hall) a hall/1f/2f/3f/4f/5f: spawn di arrivo, scale su/giù fra un piano e l'altro
  (validate incrociate: ogni warp punta a uno spawn_id che esiste davvero sulla mappa di
  destinazione), e un membro del Superquattro/Campione per piano (`sq_captain`→1f, `sq_pres`→2f,
  `sq_dema`→3f, `sq_marcuois`→4f, `campione_remo`→5f — nuove voci in `dati/trainer.js`). Scoperto e
  ricollegato: `SUPERQUATTRO`/`REMO_LEGA`/`estraiTeamSuperquattro`/`estraiTeamRemo` in
  `js/data.js`/`js/app.js` erano **già scritti per intero** (pool da 10, 5 casuali + core più forte
  sempre per ultimo, come da CLAUDE.md) ma mai collegati a una mappa Tiled — `_avviaLottaTrainer` in
  `js/map.js` ora li usa quando l'allenatore ha `superquattro`/`campioneLega` invece di leggere
  "squadra" statico. Vittoria sul Campione alza `stato.flags.legaCompletata`. Anche l'oggetto "uscita
  finale" già presente (ma vuoto) su `via vittoria_5f.tmj` è stato completato: ora è un warp verso
  `lega_pokemon` (hall). **Posizioni TUTTE stimate a occhio sulla griglia** (coordinate placeholder,
  non ancora viste a schermo) — da ripercorrere e riposizionare in Tiled come già fatto per i 12
  allenatori di Via Vittoria. Rigenerati anche i `.tmx` corrispondenti (script
  `strumenti/tmj_a_tmx.py`) così Luca li vede in Tiled — **eccetto `Lega_pokemon.tmx` (hall), che non
  esisteva già prima come file**: solo il `.tmj` esiste, quindi la hall non è apribile in Tiled finché
  non se ne crea uno (gap preesistente, non introdotto ora).
- ⏳ **MANCA ancora**: **Sala del Campione** era descritta come "nessun file esiste" in una nota
  precedente ma **`Lega_pokemon_5f.tmj` esiste già** ed è stata usata per quel ruolo in questa
  sessione — verificare che sia davvero pensata per quello (Luca potrebbe averla fatta per altro).
  MAI verificato a schermo che i warp funzionino davvero (solo validazione incrociata dei dati, zero
  test nel browser — estensione Chrome disconnessa a fine sessione). Bunkerino (confermato "da
  fare"); secondo rivale (dà il Braciere — stessa identità del dot D13); Mewtwo doppia con Mew.

---

## Gruppo B — Cose già rotte o incomplete nel progetto (verificate in questa sessione)

- ~~**Monte Porzio**: id Tiled del capopalestra Stella disallineato~~ — RISOLTO (vedi Gruppo A sopra,
  verificato sessione 8 agosto: i dati sono già allineati).
- ~~**Rocca di Papa**: nessuna mappa-interno palestra, Rocco non piazzato~~ — RISOLTO sessione 11
  agosto (insieme allo scambio tipi con Albano, vedi ROADMAP). Da ripercorrere a mano in game.
- **Il pattern donatore generico** (`condizione`, `dona_oggetto`, `una_tantum`) è documentato nel
  dizionario ma **non implementato** in `js/map.js`. I due donatori funzionanti oggi (Taglio,
  Pokéflauto) usano un pattern diverso e reale (`azione` → funzione JS dedicata) — usare quello come
  riferimento per i prossimi, non il pattern generico mai scritto.
- ~~**L'interno dell'Abbazia** non esiste~~ — la mappa ORA esiste (Luca l'ha disegnata, confermato 12
  settembre 2026); resta da cablare Ginevra/cutscene/gate password (vedi nota in cima al documento).
- **`MODALITA_TEST`** è acceso in `js/data.js:17` e va spento prima di qualunque pubblicazione.
- **Il combattimento in doppio** non esiste nel motore (serve per lo scontro Osservatorio/Flora, ex
  Camilla — vedi discrepanza narrativa in Gruppo A).
- **`NOME_TEAM`**: la nota nella vecchia `BIBBIA-NARRATIVA.md` che chiedeva di rinominarlo era
  superata — `TEAM_GDF_NOME`/`TEAM_COTRAL_NOME` esistono già in `js/data.js:67-68`. Nessuna azione.

---

## Gruppo C — Meccaniche di gioco

> Riconciliato il 12 agosto 2026: per ogni MN, "chi dà cosa" secondo la tabella di CLAUDE.md.

- **MN — stato reale, palestra per palestra** (aggiornato 12 agosto, seconda ondata):
  - ✅ **Taglio**: oggetto+permesso insieme a Frascati (Fra' Potatore), FATTO da sessioni precedenti.
  - ✅ **Spaccaroccia**: oggetto a Castel Gandolfo (sotto-trama Villa), permesso da Marino (P3), FATTO.
  - ✅ **Forza**: oggetto+permesso a Rocca di Papa (rocca_npc1, cutscene "Baso è via"), FATTO.
  - ⏳ **Surf**: permesso da Nonna Assunta al Lago di Albano dopo la palestra di **Monte Porzio**
    (`DONATORI_MN`, `js/data.js` — non da Rocca di Papa come diceva la tabella di CLAUDE.md: verificato
    il codice reale in questa sessione). Oggetto: la donatrice stessa consegna la MN parlandole,
    nessun "oggetto sul campo" separato per questa MN.
  - ✅ **Volo**: cambiato il 12 agosto — prima Faustino il funicolarista lo dava a 6 medaglie, ora
    richiede la palestra di **Albano** battuta (`palestraRichiesta: 'albano'` in `DONATORI_MN`,
    stesso NPC/luogo, solo la condizione di sblocco è cambiata).
  - ✅ **Cascata**: permesso concesso direttamente dalla palestra di **Ariccia** alla vittoria
    (`mnDonata: 'cascata'`, `PALESTRE`). Oggetto sul campo: ancora da decidere dove ("ora vediamo",
    non chiuso in questa sessione).
  - ✅ **Sub** (MN nuova, introdotta il 12 agosto — prima "non previsto"): permesso dalla palestra di
    **Genzano** alla vittoria (`mnDonata: 'sub'`, `PALESTRE`). Oggetto sul campo: stessa situazione di
    Cascata, ancora da decidere.
- **Doppio flag MN** (possesso oggetto separato da permesso d'uso, oggi un solo booleano
  `stato.mn.<nome>`): resta un miglioramento di codice puro, indipendente dalle assegnazioni sopra —
  non necessario finché nessuna MN richiede i due momenti davvero separati nel gameplay reale.
- **Risfida allenatori**: ✅ **IMPLEMENTATA** (12 agosto, seconda ondata, su richiesta esplicita —
  "ci deve essere"). Regole: solo allenatori "normali" (niente capipalestra/boss di storia/rivale,
  esclusi automaticamente controllando `palestraId`/`flagVittoria`/`rivale`); servono **almeno 7
  giorni di gioco** (`stato.tempo.giorno`) dall'ultima sconfitta, tracciati per allenatore in
  `stato.allenatoriBattutiGiorno`; squadra rilivellata fino a **1.5× il livello originale** di ogni
  Pokémon (non solo l'asso); soldi dimezzati rispetto al primo premio; EXP resta la ricompensa
  principale (sale naturalmente coi livelli più alti, nessun codice dedicato necessario). Logica in
  `js/map.js` (`_offriRisfida`, agganciata al punto dove il gioco già gestiva "allenatore già
  battuto"). **Non testata a schermo.**
- **Lotta in doppio** (nuovo requisito dalla storia v3, scontro Osservatorio — richiesta di nuovo il
  12 agosto: "se due allenatori mi vedono insieme o con Camilla alla fine"): **non implementata**.
  Verificato che `js/battle.js` (1536 righe) è scritto per un solo Pokémon avversario alla volta
  (`mio` vs `nemico` filo diretto in tutta la logica di turno/IA/UI) — un vero 2v2 richiede riscrivere
  l'ordine dei turni tra 4 combattenti, la selezione del bersaglio, l'IA per 2 avversari e la UI
  (2 sprite/barre HP nemiche). Farlo in coda a tutto il resto di questa sessione rischiava di rompere
  le lotte 1v1 esistenti senza un test vero. **Proposta**: sessione dedicata a parte.
- **Meccanica di "viaggio a lungo raggio"** per il treno di Lugia: da progettare da zero (confermato
  "da fare").
- **Ricalibrazione livelli allenatori** verso l'alto e in crescita lungo il path.
- **Incontri selvatici di livello più alto** man mano che si avanza.
- **Zona Safari con specie esclusive**: confermato ok così com'è — ingresso a pagamento già pronto,
  manca solo la meccanica di cattura vera, nessuna urgenza.
- **Box Pokémon**: migliorie da decidere (D15 sotto).
- **Sistema EV** (Effort Values): confermato ok così com'è, nessuna urgenza — oggi non esiste alcun
  tracciamento EV (`ricalcolaStatistiche`, js/battle.js calcola solo da specie+livello). Vitamine
  Gen1-3 già censite in `docs/OGGETTI-GEN1-3-REFERENCE.md` § Vitamine ma non aggiunte a `OGGETTI`.
- **Fossili**: confermato ok così com'è, nessuna urgenza — censiti in
  `docs/OGGETTI-GEN1-3-REFERENCE.md` § Fossili (Helix/Dome/Old Amber/Root/Claw) ma non aggiunti a
  `OGGETTI` (serve decidere dove si trovano e chi li rianima).
- **Movimento fedeltà Gen1-3 di mosse/abilità**: `Essentials FRLG/PBS/moves.txt`/`pokemon.txt`
  contengono moveset "moderni" anche per specie vecchie; le Abilità Pokémon non esistono come sistema
  di gioco. Nessuna decisione presa (fedeltà FireRed/Emerald vs moderno, se/come introdurre le
  Abilità in battaglia).

---

## Gruppo D — Sistema cutscene

Rimandato alla sessione dedicata (spec separata). Nessuna voce qui.

---

## Gruppo E — Grafica e sensazione al tatto

Rimandato al prompt dedicato (terza sessione). Nessuna voce qui. *(Nota: interpolazione movimento,
corsa, sprite Pokémon "cartoon", ondeggiamento in battaglia, meteo, animazioni mosse, contatore Ball
restano elencati come mancanti in `docs/STATO-PROGETTO.md` §9 per riferimento, ma il lavoro si fa
nella sessione dedicata, non qui.)*

---

## Gruppo F — Decisioni pendenti di Luca

Vedi le domande D1-D18 in fondo a questo documento.

---

## DOMANDE PER LUCA

- **D1** — Il percorso Grottaferrata → Rocca di Papa permetterebbe di arrivare alla quinta palestra
  con due medaglie, saltando Marino e Monte Porzio. *(Nota: già risolto in sessione precedente — gate
  a medaglie Marino+Monte Porzio, backtracking voluto. Riconfermare che vale ancora con la storia
  nuova.)*
- **D2** — Snorlax sta a Marino ma il Pokéflauto arriva a Rocca di Papa: ritorno indietro confermato
  *(già confermato in sessione precedente)*.
- **D3** — MN Taglio: chi dà l'oggetto e quale palestra dà il permesso? *(Già risolto: Frascati, Fra'
  Potatore, dopo la Medaglia Vigna, oggetto e permesso insieme — e già implementato nel codice. La
  tabella del prompt di questa sessione lo segnava di nuovo come aperto: confermare che resta questa
  decisione, non è stata rimessa in discussione.)*
- **D4** — MN Cascata (e ora anche MN Sub): il **permesso** è deciso (Ariccia per Cascata, Genzano
  per Sub — 12 agosto). Resta aperto **solo dove trovare i due oggetti sul campo** ("ora vediamo",
  non chiuso in questa sessione).
- **D5** — Cosa c'è dentro il rifugio di Marino? *(Confermato 12 agosto: è il Rifugio GdF, già
  cablato con 4 mappe — vedi Gruppo A. Resta da assegnare solo il nome del secondo capo GdF.)*
- **D6** — Il mega percorso dopo Genzano: quante schermate, cosa contiene, dove porta (verso Via dei
  Laghi/Monte Porzio)?
- **D7** — Il dungeon dei porchettari: come si ottiene la Piuma? *(Risolto 12 agosto: non è un
  dungeon separato, è la "Sfida dei Porchettari" già implementata ad Ariccia — 5 lotte in sequenza,
  vittoria a tutte e 5 dà la Piuma. Resta da fare solo la grotta di Ho-Oh vera, dopo il ponte.)*
- **D8** — "Ariccia va modificata": in che senso? *(Parziale 12 agosto: la porta della palestra e i
  tileset mancanti sono stati sistemati in questa sessione; resta aperta la parte del ponte/Ho-Oh.)*
- **D9** — Il covo CoTrAL ai piedi di Monte Cavo: mappa a sé o stanza, quanti grunt?
- **D10** — Il miniboss del dungeon innevato è il luogotenente già battuto o un altro? *(Già risolto
  in sessione precedente: è un altro, nessun team, semplicemente un altro sfidante di Articuno.)*
- **D11** — Nome, aspetto, squadra e dialoghi dei capipalestra di Marino, Monte Porzio, Ariccia.
  *(Marino/Monte Porzio/Rocca di Papa/Albano hanno già nome+squadra in `dati/trainer.js` — Moro,
  Stella, Baso, Giorgia. Restano da decidere aspetto/dialoghi di rifinitura e tutto Ariccia/Genzano.)*
- **D12** — I due Capi del GdF e i due boss di sede (Museo di Nemi, Abbazia di San Nilo): nomi,
  aspetto, squadre. Come si riconciliano con "Comandante Crasso"/Fulvia/Tarcisio del vecchio sistema
  dati — restano come admin intermedi o si tolgono del tutto?
- **D13** — Il secondo rivale: nome, aspetto, carattere.
- **D14** — La zona safari: dove sta, quando si sblocca, come funziona, quali specie sono esclusive.
  *(Parziale: sblocco da Albano e ingresso a pagamento già decisi/cablati in sessione precedente.)*
- **D15** — La lore del Bunkerino. *(Confermato 12 agosto da Luca: ancora "da fare", nessuna
  decisione presa.)*
- **D16** — Da dove parte il treno per Lugia (Genzano o Velletri), e dove arriva esattamente.
- **D17** — Le due Pietre servono meccanicamente ad attivare Groudon e Kyogre, o sono solo memoria
  narrativa?
- **D18** — Risfida allenatori. **RISOLTA E IMPLEMENTATA il 12 agosto** (regola cambiata rispetto
  alla versione precedente di questa domanda, su indicazione diretta di Luca): squadra fino a
  **1.5× il livello originale** (non più "tetto = asso capopalestra successivo"), soldi dimezzati
  rispetto alla prima volta, non risfidabile prima di **7 giorni di gioco**. Vedi Gruppo C per i
  dettagli tecnici.

### Domande aggiuntive emerse verificando la storia nuova contro i documenti esistenti
- **D19** — Suicune ora è fisso al Lago di Nemi, ma il trigger scatta arrivando sulla Spiaggia di
  Albano (Lago di Albano, luogo diverso): come si collegano spazialmente le due mappe? Si vede il
  Lago di Nemi da lì, o è un evento "a distanza" puramente narrativo?
- **D20** — Zapdos: la v2 aveva un meccanismo preciso (meteorologo NPC + conta-giorni + temporale). La
  storia nuova dice solo "c'è anche un percorso per Zapdos" all'Osservatorio: resta quel meccanismo o
  cambia?
- **D21** — Jirachi: la v2 aveva "5 osservazioni al telescopio, di notte, giorni dispari". Con
  l'Osservatorio che ora è un dungeon-laboratorio CoTrAL, il telescopio resta rilevante o Jirachi nasce
  solo dallo scontro con Camilla?

## Gruppo D — Sistemi Essentials mancanti, emersi dal confronto Scripts.rxdata (sessione 31 agosto 2026)

Emersi dallo Step 0 (analisi diretta di `Essentials FRLG/Data/Scripts.rxdata`, 403 script, contro il
codice reale). Voci confermate da Luca in sessione, da fare DOPO i 4 problemi di allineamento
Surf/battaglia/menu già in corso.

- ✅ **FATTO** (31 agosto, sessione successiva) — Meteo, sia di battaglia che di mappa. **Battaglia**
  (`js/battle.js`): Sole/Pioggia/Sabbia/Grandine come stato vero (non solo narrativo Team GdF) —
  Sole/Pioggia potenziano/indeboliscono Fuoco/Acqua (×1.5/×0.5), Sabbia/Grandine infliggono 1/16 HP
  max a fine turno ai tipi non immuni (Roccia/Terra/Acciaio immuni a Sabbia, Ghiaccio a Grandine).
  Le 4 mosse meteo (Dissolvisole/Danza Pioggia/Tempesta di Sabbia/Grandinata, già in `dati/mosse.js`
  ma escluse da `mossaUtile()` perché senza `statoEffetto`/`cambiStat`) ora impostano il meteo per 5
  turni. Etichetta "☀️/🌧️/🏜️/❄️" in alto nello schermo di battaglia. **Mappa** (`js/map.js` +
  `js/app.js`): `stato.meteo` ruota casualmente Sole/Pioggia ovunque all'aperto e Grandine SOLO a
  Monte Cavo (unica zona innevata), durata 30-79 passi, velo colorato + particelle (pioggia/fiocchi)
  sopra la mappa. **Il meteo di mappa attivo entra in battaglia** all'inizio della lotta (come nei
  giochi originali) e dura per tutta la battaglia. **Sabbia non è mai ruotata sulla mappa**: nessuna
  zona desertica esiste ancora in gioco — resta comunque implementata lato battaglia, pronta per
  quando ci sarà. Verificato dal vivo: badge "🌧️ Pioggia" in battaglia, Surf (Acqua) superefficace e
  potenziato contro un Charmander (Fuoco) selvatico, particelle di pioggia visibili sulla mappa dopo
  un po' di tempo di gioco reale (la schermata nera "congelata" nota in ambiente di test automatico
  ritardava la comparsa delle particelle, non un bug del codice — vedi indagine "mappa nera" sotto,
  poi chiusa: non è un bug del gioco, solo un limite dell'ambiente di test automatizzato).
- ✅ **CHIUSA** (31 agosto, sessione successiva) — Indagine bug "mappa nera": causa trovata e non è un
  bug del codice. `document.visibilityState` risultava `"hidden"` nella scheda di automazione anche
  con focus applicativo attivo: Chrome non esegue affatto `requestAnimationFrame` per una scheda che
  considera "in background", a prescindere da cosa fa il codice della pagina. Un click "risveglia" la
  scheda perché Chrome la porta in primo piano come effetto collaterale, non perché il gioco si
  sblocca da solo. Tentativo `disableVisibilityChange: true` su `new Phaser.Game()` non ha risolto
  (il blocco è del browser, non di Phaser) ed è stato tolto di nuovo (avrebbe fatto continuare il
  gioco anche a scheda reale non in primo piano, un peggioramento per l'uso normale). Con la scheda
  davvero in primo piano (gioco normale, non automazione) il problema non esiste.
- ✅ **FATTO** (31 agosto, sessione successiva) — Verifica versione mobile. Base già solida (viewport
  meta, `overflow:hidden`, canvas responsive, croce direzionale a Pointer Events + `touch-action`,
  bottoni 56px). **Bug trovato e corretto**: Velocità/Volo/Repellente avevano ciascuno un `bottom`
  fisso indipendente sommato — su schermi molto bassi (telefono in orizzontale) Volo/Repellente
  finivano spinti fuori dallo schermo, invisibili. Corretto raggruppandoli in un contenitore flex
  (`#controlli-rapidi`, `index.html`/`style.css`) ancorato sopra il D-pad. Verificato dal vivo a più
  dimensioni (390×844, 360×640, 740×560). Test da telefono vero reale consigliato quando possibile.
- ✅ **FATTO** (31 agosto, sessione successiva) — Riapprendi mosse: NPC "Maestro delle Mosse" ad
  Albano Laziale (riusa il dot `albano_npc1` già presente su `albano.tmj`, mai assegnato prima —
  `albano_npc2` resta libero per un futuro NPC). ₽1.000 a mossa (importo scelto qui, cambiabile).
  Riusa `pkm.mosseImparabili` (già presente su ogni Pokémon per i level-up futuri, `battle.js`) per
  sapere quali mosse può riapprendere: livello ≤ livello attuale, non già conosciuta. Stesso flusso
  di scelta Pokémon → mossa → (se 4 mosse già piene) quale dimenticare, del Riapprendi MT esistente.
  Verificato dal vivo con Lapras (19 mosse candidate, lista italiana corretta, flusso annulla senza
  addebito testato).
- ❌ **RIMOSSO** (31 agosto, sessione ancora successiva) — Follower: implementato e verificato dal
  vivo, ma Luca ha poi segnalato "non funziona" e chiesto di toglierlo per ora. Tolto per intero da
  `js/map.js` (non disattivato a metà). Asset in `sprites/follower/` rimasti sul disco, inutilizzati.
  Non riproporre finché non lo richiede di nuovo Luca.
- ✅ **FATTO E VERIFICATO DAL VIVO** (31 agosto → confermato 1 settembre 2026) — Riordino squadra
  riscritto in `PartyScene`: selezionare una card apre un menu a tendina Info/Ordina; "Ordina" +
  frecce + A scambia due Pokémon (stesso schema prendi/posa del Box); le card sono anche trascinabili
  col mouse per lo scambio diretto. Verificato dal vivo il 1 settembre (menu a tendina, scambio via
  trascinamento) insieme al reskin con gli asset reali sotto.
- ✅ **FATTO** (1 settembre 2026) — Grafica reale di Essentials nei menu nativi, richiesta esplicita
  di Luca ("voglio un menu stile Pokémon identico"). `PartyScene` riscritta con gli asset veri
  (`sprites/ui/party/`: sfondo, pannelli round/rect per stato, barra HP, icone), `ZainoScene` riskin
  leggero (sfondo reale per tasca), `PartyDetailScene` (Sommario) con sfondo reale, e nuova
  `TrainerCardScene` (non esisteva prima) con carta vera e medaglie. Vedi `docs/ROADMAP.md` (sessione
  1 settembre) per i dettagli tecnici — tutte e 4 verificate dal vivo.
- ✅ **FATTO** (1 settembre 2026, stessa sessione, su richiesta "rifai tutto tranne il Box") —
  `MarketScene` (sfondo reale Mart), `RecapScene` e `SalvaScene` (sfondo reale Load, righe-bottone di
  Salva con i pannelli reali di Load/panels.png) completate con asset veri di Essentials. **Tutte le
  schermate del menu Start + Market ora usano asset reali, tranne il Box** (escluso esplicitamente da
  Luca). Verificate dal vivo.
- ✅ **FATTO** (1 settembre 2026, terzo giro, dopo feedback di Luca) — Tre correzioni: 1) bug scambio
  sprite in Squadra (icona restava sullo slot vecchio, causa: cache texture per indice invece che per
  URL/specie — corretto con `chiaveIconaSprite()`); 2) `PartyDetailScene` riscritta con 3 pagine reali
  (Info/Skills/Mosse, coordinate esatte da `UI_Summary.rb`), incluso un fix ai badge di tipo (frame
  nominati invece di `setCrop`, che dava icone sbagliate per offset≠0); 3) cursore a tastiera aggiunto
  ovunque mancava (menu Info/Ordina di Squadra, Zaino, Market, Salva, scelta bersaglio Zaino, barra
  azioni della Scheda Pokémon) — non solo il click del mouse. Il Box resta escluso (non toccato). Tutto
  verificato dal vivo. Vedi `docs/ROADMAP.md` per i dettagli tecnici.
- ✅ **FATTO E VERIFICATO DAL VIVO** — Zaino corretto su indicazione precisa di Luca (screenshot con
  annotazioni): 1) icona reale dell'oggetto ora nel riquadro bianco in basso a sinistra (era vuoto);
  2) le righe della lista sono tornate al bordo REALE del pannello (misurato pixel-per-pixel
  sull'asset: x 192-479, non più CW-60 che sforava fuori); 3) la descrizione dell'oggetto ora nel
  riquadro grigio scuro accanto all'icona. Scoperta chiave: quei due riquadri sono disegnati DENTRO
  `bg_1.png` (non generati dal codice) — mai riempiti prima. Riscritta `ZainoScene` con la stessa
  tecnica a risoluzione virtuale 512×384 di PartyScene/Summary (prima veniva stirata a piena finestra,
  causa dello sforamento). Righe ora compatte (solo nome×quantità, icona/descrizione SOLO nei riquadri
  fissi per l'oggetto col cursore — confermato da Luca, non più ripetuti riga per riga). Verificato dal
  vivo: cursore su Pozione→Superpozione aggiorna correttamente icona e descrizione in basso.
- ✅ **FATTO, non ancora verificato dal vivo** (1 settembre 2026, F9.4) — Abilità dei Pokémon: prima
  non tracciate affatto nel modello dati. Aggiunte: `PokeAPI.getPokemon()` ora include la lista abilità
  della specie (slug + se nascosta); `Battle.creaIstanza()` ne assegna una a caso tra quelle NON
  nascoste (mai l'abilità nascosta a caso, come nei giochi veri) e salva lo **slot** scelto (indice
  0/1), non solo il nome — `Battle.evolviIstanza()` riusa lo stesso slot sulla nuova specie dopo
  un'evoluzione, invece di riassegnare a caso. Nome italiano + descrizione si scaricano a parte e in
  cache con la nuova `PokeAPI.getAbilita(slug)` (stesso schema di `getMossa`, testo flavor breve non
  `effect_entries` perché quest'ultimo è quasi sempre solo in inglese). **Pokémon salvati PRIMA di
  questa modifica**: non hanno lo slot già assegnato — `PartyDetailScene._abilitaInfo()` lo assegna la
  prima volta che apri la pagina Skills di quel Pokémon (un fetch, poi resta fisso e si salva). Mostrata
  nella pagina Skills della Scheda Pokémon, coordinate esatte di `drawPageThree()` in `UI_Summary.rb`.
  Browser di automazione disconnesso in questa sessione: **non verificato dal vivo**, solo controllo
  sintassi — da testare alla prossima occasione (aprire Skills di un Pokémon esistente e di uno appena
  catturato/creato).
- **Esclusi definitivamente: Pokémon Shadow e Purificazione** — decisione di Luca (31 agosto 2026),
  non riproporre. Nel Pokémon Essentials/Colosseum & XD originali la Purificazione serve a "ripulire"
  i Pokémon Shadow (Pokémon rubati/alterati, immuni a certe mosse finché non purificati); il progetto
  non li vuole in nessuna forma.
- 🔶 **Lotta in doppio (F9.5, 2-3 settembre 2026) — Fase 1 e Fase 2 SCRITTE, mai testate dal vivo.**
  Richiesta
  di Luca: "se due trainer mi vedono insieme parte la lotta in doppio". Il motore di battaglia
  (`battle.js`, quasi 2000 righe) usa `mio`/`nemico` come **variabili globali singole** (non
  parametri) in una quindicina di funzioni di turno/KO/menu, e `index.html` ha ID DOM fissi e unici
  per schermata di lotta (`#nemico-sprite`, `#giocatore-sprite`, ecc.): non è un'aggiunta, è una
  riscrittura del cuore del sistema usato da OGNI lotta del gioco. Deciso con Luca di procedere a
  tappe per non rischiare regressioni sulle lotte singole (usate ovunque) senza poter testare dal
  vivo in questa sessione (browser disconnesso).
  - ✅ **Fase 1 — rilevamento (FATTA, solo controllo sintassi, non verificata dal vivo)**:
    `_controllaTrainerVista()` in `js/map.js` ora raccoglie TUTTI i trainer che vedono il giocatore
    nello stesso frame (prima si fermava al primo). 1 solo trainer → comportamento identico a prima
    (`_trainerSpotta`, invariato, zero rischio). 2+ trainer → nuova `_trainerSpottaDoppia(a, b)`:
    entrambi mostrano "!" ed si avvicinano **in parallelo** (non in sequenza) fino ad essere adiacenti
    al giocatore, poi — dato che il motore 2v2 non esiste ancora — si limita a loggare in console e
    mostrare un toast "⚔️ ... lotta in doppio: motore in arrivo", sblocca il movimento e non forza
    alcuna lotta (per non lasciare il giocatore bloccato senza un vero combattimento da giocare).
    Solo i primi due trainer vengono presi se per assurdo ne vedessero 3+ (il design prevede sempre
    e solo 2 avversari, mai di più, vedi CLAUDE.md).
  - ✅ **Fase 2 — motore 2v2 (SCRITTA, 3 settembre 2026)**: nuovo `Battle.avviaDoppia()` isolato,
    non tocca `Battle.avvia()` (1v1 invariato). Riusa `creaIstanza`/`calcolaDanno`/`eseguiTurno`/
    `applicaStato`/`applicaCambiStat`/`assegnaExp` senza modificarli nella sostanza; piccola
    parametrizzazione additiva di `elementoSprite`/`centroSprite`/`lampeggia`/`lungeAttaccante`/
    `aggiornaSprite`/`aggiornaPannelli`/`eseguiMossa`/`impostaSfondoBattaglia` (fallback identico a
    prima quando non in doppia). UI: 4 nuovi slot in `index.html` (id "-2"), nascosti di default,
    pannello ridotto via `transform: scale()` invece di ricalcolare le coordinate pixel. Targeting
    con selettore bersaglio, mosse ad area con danno ×0.75 (regola Essentials), IA = stessa logica
    "mossa casuale" del motore singolo (non l'IA reale di Essentials, fuori scala). Dettagli completi
    in `docs/ROADMAP.md`, sessione 3 settembre 2026.
  - ⬜ **MAI TESTATO DAL VIVO** (browser disconnesso in quella sessione): sia la Fase 1
    (avvicinamento simultaneo di 2 trainer) sia la Fase 2 (schermo 2v2 vero) restano da verificare a
    schermo alla prossima occasione utile — avvicinarsi a due trainer con coni visivi incrociati sul
    giocatore, e controllare anche che le lotte singole esistenti (es. capopalestra Frascati)
    funzionino ancora identiche a prima.

- ✅ **FATTO E VERIFICATO DAL VIVO** (5 settembre 2026) — Porting fedele movimento overworld,
  animazioni mosse e menu Start da Essentials reale (Luca: "non è un gioco Pokémon, troppe piccole
  differenze"). Dettagli completi in `docs/ROADMAP.md`, sessione 5 settembre 2026: velocità
  camminata/corsa/bici corrette ai valori reali (250/125/100ms), aggiunto il "giro prima di
  camminare" (mancava del tutto), animazioni mosse ora agganciate alla posizione reale degli sprite
  (FOCUS 1/2, prima scarto misurato di 160px+), menu Start riscritto come finestra ancorata in alto a
  destra con mappa viva dietro (prima schermo intero opaco con emoji), Recap spostato da voce del
  menu Start a seconda pagina della Scheda Allenatore.
- ✅ **FATTO E VERIFICATO DAL VIVO** (5 settembre 2026, stessa sessione) — Resto del porting fedele
  di battaglia: **colpi critici** (mancavano del tutto, dati già pronti in `dati/mosse.js` mai letti
  da nessun codice — aggiunte le regole classiche pre-Gen 6 per coerenza con lo scope Gen 1-2-3 del
  progetto: 1/16 base, 1/8 mosse alta probabilità, danno ×2), **arrotondamento della formula danno**
  (un solo `.round` finale invece di un `.floor()` per ogni moltiplicatore, che perdeva danno ad ogni
  passaggio), **ordine turni** (pareggio esatto priorità+velocità: il giocatore vinceva sempre, ora
  vero 50/50 come il motore della lotta doppia aveva già), **cattura** (esponente sbagliato 0.25→
  0.1875, mancava il bonus per stato alterato sonno/gelo ×2.5 e altri stati ×1.5). EXP e animazione
  Poké Ball controllate: già fedeli, nessuna modifica necessaria. Dettagli in `docs/ROADMAP.md`.
- ✅ **FATTO MA NON VERIFICATO DAL VIVO** (5 settembre 2026, stessa sessione — estensione Chrome
  disconnessa a fine sessione, solo `node --check`) — **Finestre Sì/No e liste di scelta**
  (`mostraScelta`/`mostraSceltaLista`, usate anche da Riapprendi Mosse) riscritte da modali "popup
  web" a finestre di sistema vere, contro `pbShowCommands`; bug di propagazione tasti trovato e
  corretto (Invio/frecce arrivavano anche al menu Start sottostante). **Pokédex e Opzioni COSTRUITI**
  da zero come sistemi veri (`PokedexScene`/`PokedexDetailScene`/`OpzioniScene`): lista paginata
  1-386 con tracciamento visti/catturati automatico, scheda dettaglio (sprite/altezza/peso/
  descrizione via nuova `PokeAPI.getPokedexEntry`), Opzioni con Velocità testo e Animazioni
  battaglia on/off (entrambe con effetto reale verificabile nel codice). Volume musica/effetti
  esplicitamente NON incluso: il gioco non ha alcun sistema audio, aggiungerlo sarebbe una fase a sé
  (vedi `docs/ROADMAP.md`). **DA VERIFICARE DAL VIVO ALLA PROSSIMA SESSIONE**, priorità alta.
  Pokégear/Mappa Regione resta volutamente FUORI scope: equivarrebbe alla mappa OSM/Leaflet già
  sostituita in F14, non ha senso un porting 1:1.

## Gruppo G — Audit mappe (1 settembre 2026, richiesta di Luca "controlli le mappe?")

- ✅ **FATTO** — Via Vittoria: tile locali `173,174,175,181,182,183` di `Caves.tsj` ora sempre
  collisione su ogni piano (stesso meccanismo del macigno 1213/983/965, riconosciuto dal tile grafico).
- ✅ **FATTO (da verificare dal vivo, browser disconnesso)** — Grottaferrata "sgranata": causa
  probabile trovata. Le texture create con `this.textures.addCanvas()` per i tileset "a fette"
  (Outside.png/Emerald_Outside.png/Outside_pallet/tileset-outside — > limite WebGL, divisi in canvas
  da `_caricaTilesetSplit`) non ereditavano sempre il filtro NEAREST globale (`antialias:false` nel
  config del gioco), a differenza delle immagini caricate con `this.load.image()` — risultato: alcuni
  tile di quei tileset uscivano sfocati/grainy mentre i tileset non divisi (Caves, Sea, ecc.) restavano
  nitidi. Aggiunto `tex.setFilter(Phaser.Textures.FilterMode.NEAREST)` esplicito dopo ogni
  `addCanvas()`. **Luca ha confermato che in Tiled la mappa è corretta** (non è un problema di dati/
  layout, coerente con questa diagnosi che punta al rendering). **Verificato dal vivo**: alberi e
  Centro Pokémon di Grottaferrata nitidi allo zoom, nessun artefatto visibile — nessun "prima" da
  confrontare nella stessa sessione, ma il fix è coerente con la causa trovata. Luca conferma se il
  problema persiste ancora.
- ✅ **RISOLTO da Luca in Tiled (1 settembre 2026)** — Tunnel Roccioso ↔ Monte Porzio: la coppia
  warp+spawn duplicata su `monteporzio.tmj` è stata ridotta a una sola (`warp_tunnel_roccioso` →
  `tunnel_roccioso_1f`, spawn `da_tunnel_roccioso`, coordinate 1005,1893/966,1891) — nessuna più
  ambiguità di normalizzazione. Verificato sul file.
- ⚠️ **APERTO** — Monte Porzio → Percorso Montano (verso Rocca di Papa): Luca ha detto di averlo
  aggiunto in Tiled, ma al momento del controllo (1 settembre, 11:24) **non risulta né nel `.tmx` né
  nel `.tmj`** — probabile salvataggio/esportazione non ancora fatta. Da ricontrollare.
- **Lasciati in sospeso su richiesta di Luca**: Percorso 6 (file vuoto, nessun collegamento — deciderà
  lui contenuto/destinazione) e il collegamento diretto verso Percorso Montano/Rocca di Papa in generale
  per ora restano così.
- ✅ **FATTO E VERIFICATO DAL VIVO** — Dettaglio mossa con cursore sulla pagina Mosse della Scheda
  Pokémon: premendo A si entra in una modalità dedicata (sfondo reale `bg_movedetail.png`, sprite
  grande nascosto per non coprire la descrizione) con potenza/precisione/categoria (icona reale fisico/
  speciale/stato)/effetto in italiano (riusa `descriviEffettoMossa()`, già usata nel popup MT dello
  Zaino) per la mossa col cursore; ↑↓ scorrono le 4 mosse, A la "prende" e A su un'altra le scambia di
  posto (stesso schema di Ordina in Squadra), B annulla/esce — stessa logica di `pbMoveSelection` in
  `UI_Summary.rb`. Testato con Lapras: Surf (Acqua, Pot.90, Prec.100%) e Idropompa (Acqua, Pot.110,
  Prec.80%) corretti, icona categoria "Speciale" (vortice viola) corretta per entrambe.
- ✅ **FATTO (da verificare dal vivo, browser disconnesso)** — Grottaferrata, tileset `chiesa`
  mancante (segnalato da Luca, 3 settembre 2026): `chiesa.tsj` (usato anche da `Percorso_11.tmj`,
  32×32, 11 colonne, immagine `chiesa.png` in radice) non era mai stato registrato in `js/map.js`
  (`TILESET_META`/`TILESET_IMMAGINI`) — stesso problema già visto per `palestre`/`party`/ecc., quella
  zona risultava nera/vuota, solo un warning silenzioso "Tileset sconosciuto: chiesa" in console.
  Registrato (`'chiesa': { key: 'ts-chiesa', tw:32, th:32, cols:11 }`).
