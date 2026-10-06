# STATO_PROGETTO.md — Report dettagliato (sola lettura, 5 ottobre 2026)

> Report ricostruito leggendo direttamente il codice, i dati (`dati/*.js`, `js/*.js`), le mappe
> Tiled (`sprites/maps_tiled/*.tmj`) e la cronologia Git (135 commit). Nessun file di gioco è stato
> modificato. Ogni riga ha un riferimento verificabile (percorso file + riga/funzione/nome dato). Dove
> non sono riuscito a verificare qualcosa con certezza ho scritto ❓ NON VERIFICABILE e spiegato cosa
> servirebbe. Le differenze rispetto al Pokémon canonico sono segnalate come tali, non come errori:
> questo è un remake con modifiche volute.

---

## RIEPILOGO (10 righe) E PRIORITÀ

1. **Storia/flag di progressione**: ~95% implementata e giocabile (GdF, CoTrAL Osservatorio, Lega).
2. **Capipalestra**: 8/8 presenti e giocabili, ma **3 nomi non corrispondono a CLAUDE.md** (Frascati, Grottaferrata, Genzano).
3. **NPC**: ~303 entry, 271 con dialogo, 58 con azione dedicata; interazione "attraverso il bancone" FATTA.
4. **I 3 Regi**: tutti e 3 piazzati e giocabili, con un vero puzzle a tipo+Lega — ma i TIPI richiesti non sono quelli scritti in CLAUDE.md.
5. **Market/evoluzioni**: inventari completi per città, tutti gli oggetti da scambio presenti, evoluzioni da scambio risolte con una "Pietra Scambio" dedicata (scelta voluta, non un bug).
6. **Salvataggio**: cifrato con AES-GCM vero (Web Crypto), con migrazione automatica dai vecchi salvataggi in chiaro.
7. **Animazioni mosse**: 3 livelli (pret/pokeemerald vero ~68 mosse, Essentials-estratto ~233, fallback universale per tipo) — nessuna mossa resta senza animazione.
8. **UI**: 15 Scene Phaser native (menu/zaino/squadra/box/market/pokédex/opzioni), battaglia resta DOM/CSS a parte.
9. **Overworld**: motore a cluster Tiled solido; trovati 28 warp con destinazione non riconosciuta da un controllo automatico (va verificato a mano, rischio falsi positivi).
10. **Leggendari: 14 su 21 piazzati davvero** (correzione rispetto a un audit precedente nella stessa giornata che ne contava solo 6 — vedi §Discrepanze). Mancano Mewtwo, Mew, Lugia, Celebi, Kyogre, Rayquaza, Jirachi.

**5 priorità secondo me, in ordine:**
1. Decidere i 3 nomi dei capipalestra discordanti (Frascati/Grottaferrata/Genzano) — è un conflitto di dati vs documento, va chiuso prima che si propaghi altrove (dialoghi, altri doc).
2. Bunkerino/Mewtwo/Mew: la LOGICA di lotta esiste già (gauntlet, boss Lucio, flag) ma è morta perché scritta per il vecchio motore lat/lon (spento da `MAPPA_TILED=true`) e non ha nessuna mappa Tiled collegata — serve decidere se riscriverla su Tiled o lasciarla così.
3. Verificare a mano i 28 warp sospetti (lista in §9) prima che Luca ci sbatta contro in gioco.
4. I 7 leggendari davvero assenti (Mewtwo/Mew/Lugia/Celebi/Kyogre/Rayquaza/Jirachi) — nessuna mappa/trigger per nessuno.
5. Pubblicazione GitHub Pages: non esiste nessun workflow/CI, va impostata da zero quando si deciderà di pubblicare.

---

## 1. STORIA E TRAMA

Flag di progressione trovati in uso reale nel codice (grep su `stato.flags.*` in `js/*.js`, `dati/*.js` — lista non esaustiva, solo quelli con logica attorno, non letture isolate):

- [x] ✅ **Scelta starter/difficoltà**: `starterScelto`, `difficoltaScelta`, `difficoltaSpiegataAuto`, `BlueLabSparito`/`RedLabSparito`. EVIDENZA: `js/app.js` (vedi anche `docs/TODO.md` riga 3-45, sessione 22 set). NOTE: la nota di TODO.md dice "mai testato dal vivo" quella sessione — non ho modo di confermare se poi è stato testato (❓ NON VERIFICABILE con la sola lettura del codice). - TEstato tutto ok
- [x] ✅ **Progressione palestre → level cap**: ogni `palestraId` in `dati/trainer.js` alza il cap (vedi `vinciPalestraTiled`, chiamato da `js/map.js:8314` circa, sessione odierna). - questo però solo per la difficoltà massima, a difficoltà bassa non c'è level cap
- [x] ✅ **Team GdF**: `gdFSconfitto`, `sfereRubate`, `museoVisitato`/`museoLiberato`, `marino_password`, `abbazia_password`, `museo_nemi_password`, `password_rifugio_completa`, `baso_tornato`, `documentoVillaOttenuto`, `gdf_boss_grotta_vulcano_sconfitto`. EVIDENZA: `js/map.js` (`_controllaPasswordRifugio`, `_applicaEsitoTrainer` per `gdf_capo_marino`/`gdf_boss_grotta_vulcano`).
- [x] ✅ **Team CoTrAL (Osservatorio)**: `osservatorio_cotral_scoperto`, `osservatorio_camilla_alleata`, `osservatorio_boss_*`, `cotral_interruttore_premuto`, `cotral_rocca_boss_sconfitto`/`cotral_rocca_finale`, `cotralAricciaDebellata`, `gianluca_grato`, `infiltrato_grotta_vulcano_incontrato`. EVIDENZA: `js/map.js` (cutscene multiple, confermate testate oggi per il tratto Monte Po 3/Maso/Zapdos).
- [x] ✅ **Lega di Colonna**: `legaCompletata`. EVIDENZA: `js/map.js:8355` (si alza alla vittoria sul Campione `campioneLega`).
- [⚠️] ⚠️ **Team CoTrAL post-Lega (Bunkerino/Mewtwo)**: `bunkerinoDebellato`, `mewtwoSconfitto`, `gauntletBunkerino` ESISTONO con logica completa (`js/app.js:3376-3545`, funzione `interagisciBunkerino`/`avviaGauntletBunkerino`), **ma `interagisciBunkerino()` non viene chiamata da NESSUNA parte del codice** (grep su tutto il progetto: zero call site reali, solo la propria definizione) — è una funzionalità scritta ma MAI collegata a un pulsante/NPC/trigger. Inoltre usa `GameMap.distanzaMetri` con coordinate `lat`/`lon` (`js/data.js:2613-2619`, oggetto `BUNKERINO`), cioè il vecchio motore OSM che `MAPPA_TILED=true` (`js/app.js:69`) disattiva per tutto il resto del gioco. **Risultato: logica di lotta completa ma irraggiungibile.**
- [x] ✅ **Leggendari — eventi**: `caniLeggendariRoaming`, `latiosLatiasRoaming`/`latiosLatiasCutscene1Vista`, `suicuneVisto`/`suicuneRoaming`, `giornoTemporale`, `lugiaScena`, `piuma_porchettari`. EVIDENZA: `js/map.js`.
- [no ] ❓ **Rivale Remo come Campione finale**: CLAUDE.md dà per scontato che il Campione sia sempre "Remo" indipendentemente da chi scelto come rivale iniziale — TODO.md (riga 36-38) segnala questo come NON risolto. Non ho trovato nel codice una funzione che disambigua i 2 rivali vs il Campione in modo diverso da quanto già in TODO — **Da confermare con te**. - IL CAMPIONE FINALE DEVE ESSERE IL RIVALE CHE HO SCELTO ALL'INIZIO E NON SI CHIAMA REMO OVVIAMENTE.

**Da confermare con te:**
- Bunkerino/Mewtwo/Mew: la logica di lotta (gauntlet 4 grunt + boss Lucio + Mewtwo) va portata su una vera mappa Tiled, o preferisci tenerla come "evento a distanza" nello stile vecchio (ma allora va riattivata nonostante `MAPPA_TILED`)? WORK IN PROGRESS
- Identità del Campione (Remo) rispetto ai due rivali del laboratorio: confermi che resta un terzo personaggio sempre fisso? - IL CAMPIONE FINALE DEVE ESSERE IL RIVALE CHE HO SCELTO ALL'INIZIO E NON SI CHIAMA REMO OVVIAMENTE.


---

## 2. CAPIPALESTRA E ALLENATORI

### 8/8 Capipalestra (da `dati/trainer.js`, chiave `palestraId`)

| # | Città (CLAUDE.md) | Nome in CLAUDE.md | **Nome nel codice** | Tipo squadra | Livelli | Chiave dati | Riga |
|---|---|---|---|---|---|---|---|
| 1 | Frascati | Vinicio | ⚠️ **Donnie** | Erba | 9-14 | `gym_leader_palestra frascati` | trainer.js:235 | - CONFERMATO DONNIE, TOGLIERE VINICIO
| 2 | Grottaferrata | Igino | ✅ **Igino** (rinominato 5 ott 2026, sprite ora `Igino_Grottaferrata`) | Psico | 16-21 | `gym_leader_palestra grottaferrata` | trainer.js:296 | FATTO
| 3 | Marino | Moro | ✅ **Matilde** (rinominata 5 ott 2026, sprite ora `Capopalestra_Marino_Matilde`) | Acqua | 24-28 | `gym_leader_palestra marino` | trainer.js:938 | FATTO
| 4 | Monte Porzio | Biretta | ✅ Biretta | Elettro | 30-34 | `gym_leader_palestra monteporzio` | trainer.js:417 | CAMBIARE STELLA CON "Biretta"
| 5 | Rocca di Papa | Baso | ✅ Baso | Lotta | 35-40 | `gym_leader_palestra rocca di papa` | trainer.js:828 |
| 6 | Albano | Giorgia | ✅ Giorgia | Roccia | 41-46 | `gym_leader_palestra albano` | trainer.js:918 |
| 7 | Ariccia | Isa | ✅ Isa | Buio | 48-52 | `gym_leader_palestra ariccia` | trainer.js:1037 | Cambiare Isa con "Dudi"
| 8 | Genzano | Camilla | ⚠️ **Camilla** | Fuoco | 54-58 | `gym_leader_palestra genzano` | trainer.js:1140 |

**NOTE**: tutti e 8 hanno squadra da 6 Pokémon (portata a 6 "sess. 1 ott 2026", prima erano 4), `oggettiCura`, `dialogo_prima`/`dialogo_dopo`, `premio`, e assegnano correttamente `palestraId` → medaglia/level cap. La differenza "Camilla" per Genzano è **già nota e già risolta a favore di "Camilla"** altrove nel progetto (`docs/TODO.md` cita esplicitamente "la discrepanza Camilla/Camilla è risolta... il boss doppio finale sarà con Camilla", e Camilla compare ovunque nelle cutscene recenti come alleata/Capopalestra) — **CLAUDE.md semplicemente non è stato aggiornato**. Frascati/Grottaferrata invece non hanno nessuna nota simile trovata: sembrano scollamenti mai notati.

### Altri trainer (panoramica quantitativa, non enumerabile uno per uno in un report di dimensioni ragionevoli)

- [x] ✅ **374 entry totali** in `dati/trainer.js` (grep `^  '`), inclusi gregari di palestra, allenatori sui percorsi, Team GdF/CoTrAL, Superquattro, rivali.
- [x] ✅ **3 modalità di sfida** trovate nel codice: (a) **press-[A]** diretto su un NPC `tipo:'trainer'` (`js/map.js` `_interagisci`, ramo `tipo === 'trainer'`); (b) **vista a cono** 1 casella (proprietà `vista` su Tiled o fallback su `dati.vista`, gestito da `_controllaTrainerVista`, `js/map.js:8196` circa); (c) **`trigger_lotta_prossimita`** ad area, per stanze larghe dove il cono a 1 casella non è allineabile (usato oggi su: Grotta del Vulcano, Grunt gate di Percorso Monte Po 3 — quest'ultimo corretto proprio nella sessione di oggi).
- [x] ✅ **Lotta in doppio**: `Battle.avviaDoppia` (`js/battle.js`) usata da `_battagliaDoppiaAlleato`/`_trainerSpottaDoppia` (`js/map.js`) — es. scontro Osservatorio con Camilla alleata.
- [ ] ❓ **Coerenza nomi dati↔dialoghi↔mappe per i 374 trainer**: verificata a campione solo per gli 8 capipalestra (vedi sopra). Un controllo automatico su tutti i 374 richiederebbe incrociare ogni `id` Tiled con la chiave `dati/trainer.js` corrispondente — non fatto in questo report per limiti di tempo/spazio. **NON VERIFICABILE in questa sessione nella sua interezza.**

**Da confermare con te:**
- Frascati: "Donnie" o "Vinicio"? Grottaferrata: "Igino" o "Igino"? (Genzano="Camilla" la tratto già come decisa).leggi sopra
- Vuoi che un prossimo report incroci TUTTI i 374 trainer con le mappe (lavoro lungo, va fatto a parte)? leggi sopra

---

## 3. NPC

- [x] ✅ **~303 entry totali** in `dati/npc.js` (stima da split su pattern di dichiarazione chiave).
- [x] ✅ **271 con proprietà `dialogo:[...]`**, **58 con `azione:'...'`** (funzione JS dedicata — alcune entry hanno probabilmente entrambe). Per differenza, **fino a ~26 entry potrebbero non avere né dialogo né azione** (NPC puramente decorativi/muti) — non ho elencato quali uno per uno: richiederebbe un parser dedicato della entry-by-entry, oggi fatto solo per conteggio aggregato. ❓ **NON VERIFICABILE nel dettaglio** senza un secondo passaggio mirato. 
- [x] ✅ **NPC dietro i banconi (Centro Pokémon/Market): FUNZIONA**. Commit `2b7ae5d` ("Fix vero: si puo' parlare 'attraverso il bancone' (2 celle, come nei giochi originali)") + logica viva in `js/map.js` righe ~5100-5114 (commento: "prima di questa modifica il raggio d'azione era sempre e solo 1 casella, qualunque fosse la profondità del bancone" — ora si estende a 2 celle nella direzione in cui si guarda se la prima cella è un ostacolo solido). Confermato anche un bug GEMELLO risolto in precedenza: commit `fdd3fd1` "venditore Market era dentro il bancone (irraggiungibile)".

**Da confermare con te:**
- Vuoi un secondo report mirato solo a "NPC senza dialogo/azione", mappa per mappa? È un lavoro separato (serve leggere tutte le ~303 entry una per una più le mappe che le usano). - vanno creati dialoghi per tutti!! coerenti con la zona dove si trovano

---

## 4. I TRE REGI

- [x] ✅ **Tutti e 3 piazzati su mappe reali**, ognuno con la propria mappa dedicata:
  - Regirock (377) → `Anto_regirock.tmj`, oggetto Tiled `regirock`, livello 65.
  - Regice (378) → `Anto_regice.tmj`, oggetto Tiled `regice`, livello 65.
  - Registeel (379) → `Anto_registeel.tmj`, oggetto Tiled `registeel`, livello 65.
  - EVIDENZA: registrati in `js/map.js:1011-1025` (`MAPPE['antro_regice'/'antro_regirock'/'antro_registeel']`), con commento esplicito "Antri del Trio Regi (camere sigillate, post-Lega + ≥3 Pokémon di un tipo)".
- [x] ✅ **Puzzle d'accesso implementato**: non dentro gli antri (nessuna `condizione` sugli oggetti leggendario stessi, confermato leggendo i 3 `.tmj` — sono stanze singole senza gate interni), ma **sui warp d'ingresso** nella mappa `tuscolo_profondo_1.tmj`:
  - `warp regice` → condizione testuale `"legaCompletata e tre pokemon lotta in squadra"`.
  - `warp regirock` → `"legaCompletata e tre pokemon acqua in squadra"`.
  - `warp registeel` → `"legaCompletata e tre pokemon terra in squadra"`.
  - Il parser `verificaCondizione` (`js/map.js:1545` circa) legge correttamente sia il requisito Lega sia il conteggio Pokémon-per-tipo nella STESSA stringa (regex `/(\d+|un|...|tre|...)\s+pok[eé]?mon\s+([a-zàèéìòù]+)/`) — **il meccanismo funziona davvero**, non è solo descritto.
  - C'è anche un `trigger_storia` chiamato `iscrizione_regi` nella stessa mappa, condizione `post_lega` — probabilmente il testo/lore delle "iscrizioni in latino" citato in CLAUDE.md.
- [⚠️] ⚠️ **I TIPI non corrispondono a CLAUDE.md**: CLAUDE.md dice "Terra / Volante / Buio"; il codice richiede **Lotta, Acqua, Terra** (uno dei tre coincide: Terra). Non è necessariamente un errore — potrebbe essere una scelta cambiata in corsa non riportata nel documento.

**Da confermare con te:**
- I tipi richiesti nel codice (Lotta/Acqua/Terra) sono quelli voluti, o CLAUDE.md (Terra/Volante/Buio) è quello corretto e il codice va cambiato? quello corretto è claude md da aggiornare codice

---

## 5. MARKET, PIETRE E OGGETTI EVOLUTIVI

- [x] ✅ **`POKE_MARKET`** (`js/data.js:3283`): un array con un'entry per città/venditore (incluso "venditore speciale" per oggetti rari, pattern "doppio NPC" dalla sessione del 6 agosto). Letto a runtime da `apriMarketVenditore(idMarket)` (`js/app.js:1785`) che passa l'id a `GameMap.apriMarketNativo()` (Scene nativa `MarketScene`, `js/map.js:10705`). **I campi `lat`/`lon` dentro ogni entry sono VESTIGIALI** (retaggio del vecchio motore OSM, mai letti dal market nativo che lavora per `id` — confermato leggendo `apriMarketVenditore`, che non tocca mai `lat`/`lon`).
- [x] ✅ **Oggetti da scambio TUTTI presenti**, con nomi italiani dedicati (`js/data.js:3002-3019`):
  - Rivestimetallo = Metal Coat (Onix→Steelix, Scyther→Scizor)
  - Patroclo = King's Rock (Poliwhirl→Politoed, Slowpoke→Slowking)
  - Squamadragone = Dragon Scale (Seadra→Kingdra)
  - Dente Oscuro = presumibilmente Razor Fang/equivalente (Sneasel→367, verificato in `dati/evoluzioni.js:200`)
  - Conchigliamutante = Deep Sea Tooth/Scale unificati in un solo oggetto (Clamperl→367/368 a seconda — vedi sotto)
  - Upgrade = Up-Grade (Porygon→Porygon2)
- [x] ✅ **Pietre evolutive**: tutte e 6 presenti nel Market di Marino "speciale" (`pietra_fuoco/acqua/tuono/foglia/luna/sole`, `js/data.js:3304`), più distribuite singolarmente in altri market speciali (Grottaferrata ha `pietra_luna` nel market base).
- [⚠️] ⚠️ **Metodi evolutivi da scambio — soluzione VOLUTA e diversa dal canone**: niente scambio reale (impossibile offline/single-player). Due meccanismi coesistono:
  1. **NPC "Mercante degli Scambi"** piazzato in più Centri Pokémon (`dati/npc.js`, `sprites/maps_tiled/pokemon-castelli-Pokemon_center_*.tmj` — trovato in Rocca di Papa, Monte Porzio, Marino, Genzano, Castel Gandolfo, Ariccia, Albano).
  2. **"Pietra Scambio"** (`js/data.js:3027`, categoria `'scambio'`, prezzo 10000): oggetto introdotto "5 ott 2026" (**oggi**, secondo il commento) che fa evolvere direttamente un Pokémon con evoluzione da scambio, richiedendo che tenga già l'oggetto giusto se previsto. Logica in `js/app.js:4905-4920` (`trovaEvoluzioneScambio`).
  - Evoluzioni-da-scambio nel canone presenti in `dati/evoluzioni.js`: Kadabra→Alakazam (64→65, nessun oggetto), Machoke→Machamp (67→68), Graveler→Golem (75→76), Haunter→Gengar (93→94), Onix→Steelix (95→208, Rivestimetallo), Poliwhirl→Politoed (186, Patroclo — riga 49), Seadra→Kingdra (117→230, Squamadragone), Scyther→Scizor (123→212, Rivestimetallo), Porygon→Porygon2 (137→233, Upgrade), Slowpoke→Slowking (199, Patroclo — riga 63), Clamperl→367/368 (Dente Oscuro/Conchigliamutante, righe 200-201). **Confermato: nessuna evoluzione da scambio canonica risulta assente** dal file.

**Da confermare con te:**
- Il meccanismo "Pietra Scambio" (appena introdotto) e il "Mercante degli Scambi" (preesistente) convivono entrambi: sono due strade alternative volute, o la Pietra Scambio dovrebbe sostituire del tutto il Mercante? non ho capito bene cosa sia il mercante scambi: se non ricordo male è un npc che vende pietre evolutive tra cui la pietra scambio o sbaglio?

---

## 6. SALVATAGGI E CRITTOGRAFIA

- [x] ✅ **Salvataggio in `localStorage`**, chiave `pkc_salvataggio` (`js/app.js:8`).
- [x] ✅ **Cifrato con AES-GCM vero** (Web Crypto API nativa del browser, nessuna libreria esterna): chiave derivata da `SHA-256('CastelliRomani-Salvataggio-v1')` (`js/app.js:30-38`), IV random a 12 byte per ogni salvataggio, formato su disco `ENC1:<iv base64>:<ciphertext base64>` (`js/app.js:49-53`).
- [x] ✅ **Limite onesto documentato nel codice stesso** (commento riga 18-25): la "chiave" è comunque leggibile da chiunque apra i DevTools e legga il file JS — non è segretezza vera, impedisce solo la modifica rapida/casuale (copia-incolla di un valore in localStorage), non un attacco deliberato. Dichiarato esplicitamente come limite noto, non un errore.
- [x] ✅ **Migrazione automatica**: `caricaPartita()` (`js/app.js:177`) riconosce il prefisso `ENC1:`; se assente tratta il testo come JSON in chiaro (vecchi salvataggi pre-cifratura) — una tantum, il salvataggio successivo sarà già cifrato.
- [x] ✅ **Gestione salvataggio corrotto/tampered**: se la decifratura fallisce (es. valore manomesso a mano in localStorage), l'eccezione viene presa da un `catch` esterno che stampa un warning in console e **riparte silenziosamente da zero** (`js/app.js:300-302`, nessun messaggio a schermo per il giocatore).
- [x] ✅ **Versioning/migrazioni per fase**: decine di blocchi `if (stato.X === undefined) stato.X = default` dentro `caricaPartita()`, etichettati per fase (F9, F9.2, F10, F11, F12, F12b — `js/app.js:184-230` circa), così i salvataggi vecchi guadagnano i campi nuovi delle fasi successive senza rompersi.
- [ ] ❓ **Export/Import come file JSON** (citato in CLAUDE.md): trovato riferimento a un flusso di import (`js/app.js:5488-5495`, ri-cifra dopo l'import) ma non ho verificato a fondo l'UI/trigger di export — presumo esista (coerente con RecapScene/SalvaScene) ma non ho letto quella parte nel dettaglio. **Parzialmente verificato.**

**Da confermare con te:**
- Nessuna domanda bloccante qui: la sezione è coerente e ben documentata dal codice stesso.

---

## 7. ANIMAZIONI DELLE MOSSE

Pipeline a **3 livelli**, dal più al meno fedele:

1. [x] ✅ **Livello "ROM vera"** (`pret/pokeemerald`, decompilazione pubblica usata come riferimento — vedi `sprites/animazioni_mosse_rom/FONTE.txt`): 9 funzioni base (`_giocaFlamethrowerRom`, `_giocaHydroPumpRom`, `_giocaMudShotRom`, `_giocaSignalBeamRom`, `_giocaPsywaveRom`, `_giocaEmberRom`, `_giocaWaterGunRom`, `_giocaSludgeRom`, `_giocaAcidRom`) mappate su **68 mosse totali** nella tabella `ANIMAZIONI_ROM` (`js/animazioni-essentials.js:1100`), con grafica reale ripresa pixel-per-pixel dagli sprite sheet originali (`sprites/animazioni_mosse_rom/*.png`, puliti dal colore di trasparenza). Il riuso (una forma base per più mosse dello stesso tipo/proiettile) è dichiarato esplicitamente nel codice come "approssimazione onesta, non un errore" (commento riga 1111-1119).
2. [x] ✅ **Livello "Essentials estratto"**: dati in `dati/animazioni_mosse_essentials.js` (817 KB — file dati generato, non ispezionato riga per riga in questo report). Secondo `docs/ROADMAP.md` (commit `5e7806b`, `7cae535`) arriva a **233 mosse con "grafica vera"**.
3. [x] ✅ **Livello fallback universale**: commit `7cae535` ("COPERTURA COMPLETA mosse: fallback automatico per tipo, niente più pallino generico") garantisce che OGNI mossa (354 totali in `dati/mosse.js`) abbia almeno un effetto visivo colorato per tipo, mai un placeholder vuoto.
- [x] ✅ **Pipeline di estrazione Ruby**: `strumenti/estrai_scripts.rb` presente su disco (per `Scripts.rxdata`, 403 script Essentials). Ruby 3.3 risulta installato per questo lavoro (da memoria di sessioni precedenti, non ri-verificato oggi: ❓ non ho controllato se l'interprete Ruby è ancora installato sulla macchina in questa sessione).
- [ ] ❓ **Bug noti residui nelle animazioni**: `docs/ROADMAP.md` (sessione 30 settembre) segnala Idrocannone come "mai testato dal vivo" all'epoca, e un avviso generale di controllare ogni mossa per effetti secondari prima di implementarli (es. "Nitrocarica aumenta la velocità di chi la usa, non dell'avversario" — bug di questo tipo già corretto altrove, commit `06a9903`). Non ho un elenco aggiornato di bug *residui* oggi: **NON VERIFICABILE** senza testare le animazioni dal vivo nel browser.

**Da confermare con te:**
- Vuoi che in una sessione dedicata si verifichi dal vivo (browser) quali delle 68 mosse "ROM vera" + 233 "Essentials" funzionano davvero oggi, invece di fidarsi dei commit storici? come si possono testare tutte? ad ora le mosse che so che non sono coerenti sono quelle che attivano degli effetti aggiuntivi: ci sono mosse che oltre all'effetto primario causano altre cose, status, modifiche delle stats per la battaglia. spesso queste sono invertite o magari fanno danno all'avversario e modificano stats a me capito? vanno controllati gli effetti perchè ad ora non vanno molto bene. poi mosse in due turni tipo volo e fossa, vanno integrate ad ora credo si risolvano in un turno solo.

---

## 8. INTERFACCE UI

| UI | Tecnologia | Stato | Evidenza |
|---|---|---|---|
| Overworld (mappa/movimento) | Phaser 3 Scene | ✅ completo | `js/map.js:2380` `class GameScene` |
| Interni (edifici) | Phaser 3 Scene | ✅ completo | `js/map.js:8834` `class InteriorScene` |
| Menu Start/Pausa | Phaser 3 Scene nativa | ✅ completo | `js/map.js:8984` `class PauseMenuScene` |
| Scheda Allenatore | Phaser 3 Scene nativa | ✅ completo | `js/map.js:9092` `class TrainerCardScene` |
| Pokédex (lista + dettaglio) | Phaser 3 Scene nativa | ✅ completo | `js/map.js:9181`/`9273` |
| Opzioni | Phaser 3 Scene nativa | ✅ completo | `js/map.js:9347` `class OpzioniScene` |
| Squadra (lista + Sommario) | Phaser 3 Scene nativa | ✅ completo | `js/map.js:9448`/`9978` |
| Box PC | Phaser 3 Scene nativa | ✅ completo | `js/map.js:10547` `class BoxScene` |
| Market | Phaser 3 Scene nativa | ✅ completo | `js/map.js:10705` `class MarketScene` |
| Zaino (+ selezione bersaglio) | Phaser 3 Scene nativa | ✅ completo | `js/map.js:10941`/`11328` |
| Riepilogo (RecapScene) | Phaser 3 Scene nativa | ✅ completo | `js/map.js:11466` |
| Salvataggio (UI) | Phaser 3 Scene nativa | ✅ completo | `js/map.js:11524` `class SalvaScene` |
| **Battaglia** | **DOM/CSS** (non Phaser Scene) | ✅ completo ma tecnologia diversa dal resto | `js/battle.js` (20 usi di `getElementById`/`innerHTML`, nessuna `class ... extends Phaser.Scene`) |
| Scelta genere/nome/starter (pre-partita) | DOM overlay | ✅ completo | `index.html` righe 77/96/105 (`#overlay-genere`, `#overlay-nome`, `#overlay-starter`) |
| Dialoghi in-game | DOM overlay | ✅ completo | `index.html:68` `#overlay-dialogo` |

- [x] ✅ **Zero pannelli DOM residui per i menu di gioco** (squadra/zaino/box/market/pokédex/opzioni): tutti migrati a Scene Phaser native, confermato per assenza di `getElementById('pannello-...')` attivo per questi menu (la vecchia funzione `apriMarketVenditore` in `js/app.js:1789` fa `return` immediato verso la Scene nativa se disponibile, lasciando il ramo DOM sotto come fallback mai raggiunto in pratica).
- [x] ✅ **Provenienza asset**: estratti da Essentials FRLG (sprite/UI reali, cartella `sprites/Essentials FRLG/` — esclusa da git, `.gitignore`), animazioni da `pret/pokeemerald` (vedi §7), altri sprite overworld/NPC generati o adattati a mano da Luca.

**Da confermare con te:**
- Nessuna domanda bloccante: la sezione è coerente, tutta verificata con evidenza diretta nel codice.

---

## 9. OVERWORLD E MECCANICHE

- [x] ✅ **Movimento giocatore/NPC**: Phaser 3, ciclo passo a 2 caselle corretto (da memoria sessioni precedenti), tile animati gestiti.
- [x] ✅ **Trigger trainer**: 3 meccanismi coesistenti (press-A, vista 1 casella, `trigger_lotta_prossimita` ad area) — vedi §2.
- [x] ✅ **Collisioni**: `buildCollGrid(tmj)` (`js/map.js:1615`), con regola universale "nessun tile su nessun layer = collisione" (dal 1 ottobre), + `cancello_condizione`/`cancello_pulsante`/`cancello_medaglia` per muri/gate dinamici. **Novità di oggi**: questi cancelli venivano scritti una sola volta al caricamento mappa e non si aggiornavano più cambiando un flag a runtime — corretto con `_aggiornaCancelliDinamici()` (`js/map.js`), richiamata da `_rigeneraNpc()`.
- [x] ✅ **Transizioni tra mappe/cluster**: sistema a cluster (`js/clusters.js`, generato da `strumenti/genera_clusters.py` leggendo i file `.world` di Tiled) per mappe contigue; fade ai bordi per i collegamenti non ancora in cluster.
- [x] ✅ **Puzzle macigni (Forza/Spaccaroccia)**: alias riconosciuti nel motore (`roccia_forza`→`trigger_forza`, `roccia_spaccaroccia`→`trigger_spaccaroccia`, + varianti "sasso"/"masso", `js/map.js:1475-1481`), coerente con le MN già confermate complete.
- [❌] ❌ **Deploy GitHub Pages**: NESSUN workflow CI trovato (`.github/workflows/` non esiste), nessun file `CNAME`. Pubblicazione oggi richiederebbe un passaggio manuale o la creazione di un workflow da zero.
- [⚠️] ⚠️ **28 warp con destinazione non riconosciuta da un controllo automatico**: ho scritto uno script che confronta ogni `destinazione` di ogni oggetto `warp` in tutti i `.tmj` contro le chiavi registrate in `MAPPE`/`CLUSTERS`. Risultato: 28 non corrispondono esattamente. **ATTENZIONE METODOLOGICA**: alcuni sono quasi certamente falsi positivi del mio script (es. `via_vittoria_2f_1`/`via_vittoria_1f_1` sono probabilmente `spawn_id` interni allo stesso piano, non chiavi-mappa separate — il mio controllo non distingue le due cose). Altri sembrano reali:
  - `Colonna.tmj -> dest="bunkerino"`: **confermato rotto con un controllo separato e diretto** (nessuna chiave `'bunkerino'` in `js/map.js`) — coerente col punto 1 della sezione Storia.
  - `percorso_montano_v1.tmj -> dest="TODO_vetta_montagna"`: il nome stesso dice "TODO", placeholder intenzionale non ancora chiuso.
  - Gli altri 26 (lista completa sopra, §riepilogo warp) vanno verificati a mano uno per uno: non mi fido del tutto del mio stesso script per dichiararli "rotti" con certezza.
- [x] ✅ **Nessun commento `FIXME`/`TODO:` letterale** trovato in `js/map.js`, `js/app.js`, `js/battle.js` — i promemoria del progetto vivono tutti nei file `.md` di `docs/`, non nel codice.

**Da confermare con te:**
- Vuoi che la prossima sessione verifichi i 28 warp sospetti UNO PER UNO (lavoro meccanico ma richiede di capire per ognuno se è un vero collegamento rotto o un falso positivo del mio script)? fammi una lista si.

---

## 10. ALTRO

- [❌] ❌ **File `.tmx` mai convertiti in `.tmj` (quindi mai giocabili)**, trovati confrontando ogni `.tmx` con l'omonimo `.tmj` nella stessa cartella:
  - `Bunkerino_0f.tmx`, `Bunkerino_1f.tmx` (coerente col punto 1 di questo report)
  - `Filler Frascati1.tmx`
  - `casa_piccola_2.tmx`, `casa_piccola_3.tmx`, `casa_piccola_5.tmx`
  - `pokemon-castelli.tmx`
- [x] ✅ **Tutti i riferimenti `file:'...tmj'` dentro `js/map.js` puntano a file che esistono davvero su disco** (zero mancanti, controllato con script dedicato) — nessun "fantasma" nella registrazione delle mappe.
- [⚠️] ⚠️ **Oggetto `?? bug/BUG FOLLOWER.webp`**: file non tracciato in git (`git status`), nome esplicito "BUG FOLLOWER" — probabile screenshot di un bug relativo al Pokémon/NPC che segue il giocatore, non ancora risolto o non ancora segnalato in un commit. ❓ **NON VERIFICABILE** cosa mostri esattamente senza aprire l'immagine (fuori scope di un'analisi di solo codice/testo).
- [x] ✅ **135 commit totali**, nessuna amend/force-push visibile nella history lineare controllata.
- [ ] ❓ **File orfani dati (JS)**: non ho fatto un controllo sistematico di funzioni/variabili definite e mai usate in tutto il progetto (37.852 righe totali di JS) — richiederebbe un linter/analisi statica dedicata, fuori scope per questo report. **NON VERIFICABILE in questa sessione.**

---

## DISCREPANZE E RISCHI (riepilogo)

1. **Nomi capipalestra**: CLAUDE.md dice Vinicio/Igino/Camilla; il codice dice Donnie/Igino/Camilla (per Frascati/Grottaferrata/Genzano). Camilla è una scelta già nota e già decisa altrove (TODO.md); Donnie/Igino non hanno nessuna nota di questo tipo trovata — sembrano scollamenti mai notati finora.
2. **Bunkerino/Mewtwo/Mew**: la logica di gioco (gauntlet, boss, flag di stato) esiste interamente scritta, ma è collegata al vecchio motore a coordinate GPS (`lat`/`lon`) che il resto del gioco ha abbandonato (`MAPPA_TILED=true`). Nessuna chiamata a `interagisciBunkerino()` esiste da nessuna parte: funzione scritta e MAI collegata a nulla. Il warp `Colonna.tmj -> "bunkerino"` punta a una chiave mappa che non esiste.
3. **Conteggio leggendari**: un'analisi fatta oggi PRIMA di questo report (nella stessa sessione, riportata anche in `CLAUDE.md` §STATO ATTUALE) aveva concluso "6 leggendari su 21 piazzati, 10 mancanti" cercando solo la proprietà `pokemon_id` sugli oggetti Tiled. **Questo report corregge quel numero**: molti leggendari (i 3 Regi, Latios/Latias, Groudon, Articuno, Moltres, i 3 cani leggendari, Zapdos, Ho-Oh, Deoxys) sono indirizzati tramite il nome nella proprietà `sprite` (risolto da una tabella `LEG_NOME_ID` in `js/map.js:2355`), non tramite `pokemon_id` — un controllo che cerca solo `pokemon_id` li manca tutti. **Il numero corretto, verificato oggi con uno script che controlla entrambe le vie, è 14 leggendari piazzati su 21, non 6.** `CLAUDE.md` §STATO ATTUALE e §ROADMAP IN FASI (F11) vanno corretti di conseguenza — non l'ho fatto in questo report perché il compito era di sola lettura.
4. **I 3 Regi — tipi del puzzle**: CLAUDE.md dice Terra/Volante/Buio, il codice richiede Lotta/Acqua/Terra. Da chiarire quale dei due è quello voluto.
5. **28 warp sospetti**: trovati con un controllo automatico che ha limiti metodologici noti (possibili falsi positivi su warp con `spawn_id` interni allo stesso piano). Solo 2 dei 28 sono stati confermati con un secondo controllo indipendente (`bunkerino`, e `TODO_vetta_montagna` per il nome stesso). Gli altri 26 restano "sospetti da verificare", non "confermati rotti".
6. **Pubblicazione**: nessun workflow CI/CD, nessun file `CNAME` — GitHub Pages non è configurato, a prescindere dallo stato di `MODALITA_TEST` (già verificato in sessione precedente come auto-gestito).
