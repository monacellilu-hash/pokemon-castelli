/* ============================================================
   map.js — RISCRITTO: loader mappe Tiled (.tmj)

   Sostituisce il vecchio renderer procedurale con un sistema
   che carica mappe esportate da Tiled in formato .tmj (JSON).

   Layer tile:  ground → deco_sotto → edifici → PLAYER → sopra_testa
   Layer obj:   collisioni (rettangoli bloccanti), eventi (NPC, porte, ecc.)

   Tileset: Outside.png (32×32), Interior general.png (16×16),
            Poke Centre interior.png, Gyms interior.png (32×32)
   Player:  sprites/player-red.png (128×192, frame 32×48, 4dir×4frame)
   ============================================================ */

const GameMap = (function () {

  /* ══════════════════════════════════════════════════════════
     REGISTRO MAPPE + TILESET
     ══════════════════════════════════════════════════════════ */

  const MAPPE = {
    'borgata_tuscolana': {
      file: 'sprites/maps_tiled/pokemon-castelli-Borgata_Tuscolana.tmj',
      latC: 41.8420, lonC: 12.6150,
      // Ricalibrato sull'oggetto "spawn del player" aggiunto in Tiled dopo
      // l'allargamento della mappa (pixel 750,271 → casella 23,8).
      spawn: { tx: 23, ty: 8 },
    },
    'percorso_tuscolana': {
      file: 'sprites/maps_tiled/pokemon-castelli-Percorso 1.tmj',
      latC: 41.8580, lonC: 12.6150,
      spawn: { tx: 14, ty: 48 },
    },
    'percorso_1b': {
      file: 'sprites/maps_tiled/pokemon-castelli-Percorso 1b.tmj',
      latC: 41.8700, lonC: 12.6150,
      spawn: { tx: 14, ty: 48 },
    },
    'lab_professore': {
      file: 'sprites/maps_tiled/pokemon-castelli-laboratorio professore.tmj',
      interno: true,
      latFissa: 41.8425, lonFissa: 12.6165,
    },
    'pokecenter': {
      // Mappa dedicata (prima riusava il template generico Pokemon_center.tmj,
      // ora sostituita dall'export proprio di Borgata Tuscolana).
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_Borgata_tuscolana.tmj',
      interno: true,
      latFissa: 41.8418, lonFissa: 12.6145,
    },
    // ── Frascati (nuove mappe a warp) ──
    'frascati_sud': {
      file: 'sprites/maps_tiled/frascati_sud.tmj',
      latC: 41.8030, lonC: 12.6770,
    },
    'frascati_centro': {
      file: 'sprites/maps_tiled/frascati_centro.tmj',
      latC: 41.8090, lonC: 12.6770,
      // Rete di sicurezza (sess. 19 set 2026): coordinate LOCALI dello spawn
      // "da_palestra_frascati" — se mai lo spawn Tiled non venisse trovato
      // a runtime, questo fallback tiene comunque l'atterraggio dentro
      // Frascati Centro, mai su un'altra mappa del cluster.
      spawn: { tx: 30, ty: 11 },
    },
    'frascati_est': {
      file: 'sprites/maps_tiled/frascati_est.tmj',
      latC: 41.8090, lonC: 12.6850,
    },
    'frascati_ovest': {
      file: 'sprites/maps_tiled/frascati_ovest.tmj',
      latC: 41.8090, lonC: 12.6690,
    },
    'frascati_nord': {
      file: 'sprites/maps_tiled/frascati_nord.tmj',
      latC: 41.8150, lonC: 12.6770,
    },
    // ── Percorso 2 — castagneti collinari (Frascati Est → Grottaferrata) ──
    'percorso_2': {
      file: 'sprites/maps_tiled/percorso_2.tmj',
      latC: 41.8090, lonC: 12.6950,
    },
    // ── Percorso 3 — campagna verso il lago (Grottaferrata → Marino) ──
    'percorso_3': {
      file: 'sprites/maps_tiled/percorso_3.tmj',
      latC: 41.7800, lonC: 12.6620,
    },
    // ── Marino (3ª città — Palestra Acqua, Capopalestra Moro) ──
    'marino': {
      file: 'sprites/maps_tiled/marino.tmj',
      latC: 41.7725, lonC: 12.6560,
    },
    // ── Rifugio GdF di Marino (dungeon multi-piano, dietro la porta a password
    // nella piazza) — sessione 10 agosto. ──
    'gdf_marino_1f': {
      file: 'sprites/maps_tiled/gdf_marino_1f.tmj',
      interno: true,
      latFissa: 41.7725, lonFissa: 12.6560,
    },
    'gdf_marino_2f_a': {
      file: 'sprites/maps_tiled/gdf_marino_2f_a.tmj',
      interno: true,
      latFissa: 41.7725, lonFissa: 12.6560,
    },
    'gdf_marino_2f_b': {
      file: 'sprites/maps_tiled/gdf_marino_2f_b.tmj',
      interno: true,
      latFissa: 41.7725, lonFissa: 12.6560,
    },
    'gdf_marino_2f_c': {
      file: 'sprites/maps_tiled/gdf_marino_2f_c.tmj',
      interno: true,
      latFissa: 41.7725, lonFissa: 12.6560,
    },
    // ── Percorso 4 — salita verso Monte Porzio e Castel Gandolfo ──
    'percorso_4': {
      file: 'sprites/maps_tiled/Percorso_4.tmj',
      latC: 41.7600, lonC: 12.6580,
    },
    // ── Lago di Albano — spiaggia (accessibile da Percorso 4 e Castel Gandolfo) ──
    'lago_albano': {
      file: 'sprites/maps_tiled/Lago di Albano.tmj',
      latC: 41.7420, lonC: 12.6580,
    },
    // Specchio d'acqua sotto la superficie del Lago di Albano (Castelli_lakes.world:
    // posizionata esattamente sopra 'lago_albano', bordo condiviso a nord).
    'interno_lago': {
      file: 'sprites/maps_tiled/Lago di Albano interno.tmj',
      latC: 41.7440, lonC: 12.6580,
    },
    // Sacca d'acqua profonda sotto il Lago di Albano, raggiungibile solo con
    // MN Sub (da interno_lago o dal rifugio GdF di Marino) — non fa parte del
    // cluster di superficie, è un "interno" a sé come i piani del rifugio GdF.
    'lago_albano_profondo': {
      file: 'sprites/maps_tiled/Lago di Albano profondo.tmj',
      interno: true,
      latFissa: 41.7440, lonFissa: 12.6580,
    },
    // ── Castel Gandolfo (4ª città area lago, vista Villa Pontificia) ──
    'castel_gandolfo': {
      file: 'sprites/maps_tiled/castel_gandolfo.tmj',
      latC: 41.7476, lonC: 12.6500,
    },
    // ── Via dei Laghi — collega Castel Gandolfo a Lago di Nemi/Osservatorio/Albano ──
    'via_dei_laghi': {
      file: 'sprites/maps_tiled/via_dei_laghi.tmj',
      latC: 41.7300, lonC: 12.6900,
    },
    // ── Tunnel Roccioso (dungeon 4 piani, Via dei Laghi → Monte Porzio, tra
    // 3ª e 4ª palestra) — sessione 6 agosto. L'uscita a Monte Porzio la cabla
    // Luca quando è pronta (warp NON aggiunto qui su richiesta esplicita).
    // Le scale tra i piani non sono ancora numerate/piazzate da Luca: quando
    // lo saranno, aggiungo i warp corrispondenti (vedi ROADMAP).
    'tunnel_roccioso_1f': {
      file: 'sprites/maps_tiled/Tunnel_roccioso_1f.tmj',
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri tunnel roccioso 1f',
      latC: 41.7350, lonC: 12.7000,
    },
    'tunnel_roccioso_2f': {
      file: 'sprites/maps_tiled/Tunnel_roccioso_2f.tmj',
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri tunnel roccioso 2f',
      latC: 41.7350, lonC: 12.7000,
    },
    'tunnel_roccioso_3f': {
      file: 'sprites/maps_tiled/Tunnel_roccioso_3f.tmj',
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri tunnel roccioso 3f',
      latC: 41.7350, lonC: 12.7000,
    },
    'tunnel_roccioso_4f': {
      file: 'sprites/maps_tiled/Tunnel_roccioso_4f.tmj',
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri tunnel roccioso 4f',
      latC: 41.7350, lonC: 12.7000,
    },
    // ── Lago di Nemi ──
    'lago_nemi': {
      file: 'sprites/maps_tiled/Lago di Nemi.tmj',
      latC: 41.7160, lonC: 12.7020,
    },
    // ── Museo delle Navi di Nemi (2 piani) — sessione 12 agosto: le mappe
    // esistevano già (solo .tmx, convertite qui in .tmj) ma non erano collegate
    // al mondo. Ingresso da un varco su Lago di Nemi (vicino al cartello "Museo
    // delle Navi" e ai grunt GdF che lo presidiano), scale interne 1f↔2f. ──
    'museo_navi_1f': {
      file: 'sprites/maps_tiled/Museo_navi_1f.tmj',
      interno: true,
      latFissa: 41.7160, lonFissa: 12.7020,
    },
    'museo_navi_2f': {
      file: 'sprites/maps_tiled/Museo_navi_2f.tmj',
      interno: true,
      latFissa: 41.7160, lonFissa: 12.7020,
    },
    // ── Percorso 7 — collega Lago di Nemi (Castelli_lakes.world) ad Albano Laziale
    // (Castelli_lasthree.world): cluster diverso da Lago di Nemi, quindi il passaggio
    // resta un warp con fade (non camminata continua) finché i due .world non vengono uniti. ──
    'percorso_7': {
      file: 'sprites/maps_tiled/percorso_7.tmj',
      latC: 41.7230, lonC: 12.6800,
    },
    // ── Percorso 7b — biforcazione di Percorso 7 verso la Spiaggia di Albano (Lago di
    // Albano), gated a medaglie sufficienti (narrativa sessione 41). Warp da percorso_7,
    // non camminata continua (nessun .world in comune). ──
    'percorso_7b': {
      file: 'sprites/maps_tiled/Percorso_7b.tmj',
      latC: 41.7250, lonC: 12.6830,
    },
    // ── Percorso 5 — salita montana verso Rocca di Papa ──
    'percorso_5': {
      file: 'sprites/maps_tiled/Percorso_5.tmj',
      latC: 41.7400, lonC: 12.6350,
    },
    // ── Monte Porzio Catone (4ª città — Palestra Elettro, Capopalestra Stella) ──
    'monteporzio': {
      file: 'sprites/maps_tiled/monteporzio.tmj',
      latC: 41.8180, lonC: 12.7170,
    },
    // ── Centro Pokémon e Market dedicati di Monte Porzio Catone ──
    'pokecenter_monteporzio': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_monteporzio.tmj',
      interno: true,
      latFissa: 41.8180, lonFissa: 12.7170,
    },
    'mart_monteporzio': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_monteporzio.tmj',
      interno: true,
      latFissa: 41.8180, lonFissa: 12.7170,
    },
    // ── Osservatorio INAF (Monte Porzio) — prima comparsa Team CoTrAL, evento Zapdos ──
    'osservatorio': {
      file: 'sprites/maps_tiled/Osservatorio.tmj',
      latC: 41.8195, lonC: 12.7185,
    },
    // ── Osservatorio interno, 3 piani (sess. 15 set 2026): rifugio segreto
    // CoTrAL sotto copertura di "ricerca sul clima" — vedi
    // _checkOsservatorioTrigger/dati/cutscene.js per l'arco narrativo
    // completo (rivelazione dopo l'8ª palestra). Il warp e lo spawn di
    // ritorno su Osservatorio.tmj esistevano già (Luca li aveva piazzati:
    // destinazione 'osservatorio_interno', spawn_id 'entrata_principale').
    'osservatorio_interno': {
      file: 'sprites/maps_tiled/Osservatorio_1f.tmj',
      interno: true,
      latFissa: 41.8195, lonFissa: 12.7185,
    },
    'osservatorio_interno_2f': {
      file: 'sprites/maps_tiled/Osservatorio_2f.tmj',
      interno: true,
      latFissa: 41.8195, lonFissa: 12.7185,
    },
    'osservatorio_interno_3f': {
      file: 'sprites/maps_tiled/Osservatorio_3f.tmj',
      interno: true,
      latFissa: 41.8195, lonFissa: 12.7185,
    },
    // Interno palestra di Monte Porzio (chiave = destinazione della porta in monteporzio.tmj)
    'palestra_monteporzio_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_monteporzio.tmj',
      interno: true,
      latFissa: 41.8164, lonFissa: 12.7153,
    },
    // ── Percorso Montano (Monte Porzio → Rocca di Papa) — sale verso la montagna,
    // con un ramo laterale ("warp_summit") verso la vetta, ancora da collegare. ──
    'percorso_montano_v1': {
      file: 'sprites/maps_tiled/percorso_montano_v1.tmj',
      latC: 41.7880, lonC: 12.7150,
    },
    // ── Rocca di Papa (5ª città — Palestra Lotta, Capopalestra Baso, cap 40) ──
    'rocca_di_papa': {
      file: 'sprites/maps_tiled/rocca_di_papa.tmj',
      latC: 41.7608, lonC: 12.7096,
    },
    // ── Interno palestra Rocca di Papa (Baso) — chiave = destinazione esatta
    // scritta sulla porta in rocca_di_papa.tmj (palestra_rocco_door). ──
    'interno_palestra_rocco': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_rocca_di_papa.tmj',
      interno: true,
      latFissa: 41.7608, lonFissa: 12.7096,
    },
    // ── Monte Cavo — raggiungibile SOLO via Gianluca (funivia, dialogo dopo
    // la liberazione), mai un warp calpestabile diretto da Rocca di Papa. La
    // discesa invece è un warp normale. Articuno + miniboss, tema nevoso
    // (tileset Snow Tiles + Caves.tsj). Sessione 8 agosto (seconda parte). ──
    'monte_cavo': {
      file: 'sprites/maps_tiled/monte_cavo.tmj',
      tema: 'icecave',
      latC: 41.7545, lonC: 12.7010,
    },
    // ── Grotta del Vulcano (dungeon Team GdF, sess. 7 set 2026): sotto Rocca
    // di Papa, dietro il gate 'gdf_gate_grotta_vulcano' (flag gdf_sconfitto).
    // Il warp da rocca_di_papa.tmj punta già a questa chiave ('grotta_vulcano').
    // 2f/3f non esistono ancora come file: i warp interni restano "a vuoto"
    // (toast "zona non ancora disponibile") finché non vengono creati e
    // registrati qui, stesso schema di nascondiglio_cotral. ──
    'grotta_vulcano': {
      file: 'sprites/maps_tiled/Grotta_vulcano_1f.tmj',
      interno: true,
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri grotta vulcano',
      latFissa: 41.7608, lonFissa: 12.7096,
    },
    // 2f/3f (sess. 8 set 2026): stessa tabella incontri/tema del piano
    // terra, nessuna coordinata propria (sono piani dello stesso dungeon).
    'grotta_vulcano_2f': {
      file: 'sprites/maps_tiled/Grotta_vulcano_2f.tmj',
      interno: true,
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri grotta vulcano',
      latFissa: 41.7608, lonFissa: 12.7096,
    },
    'grotta_vulcano_3f': {
      file: 'sprites/maps_tiled/Grotta_vulcano_3f.tmj',
      interno: true,
      tema: 'cave',
      incontriCostanti: true, incontriId: 'incontri grotta vulcano',
      latFissa: 41.7608, lonFissa: 12.7096,
    },
    // ── Lega Pokémon di Colonna (F12, in costruzione — sessione 11 agosto):
    // nessun warp reale la collega ancora al mondo. Coordinate placeholder
    // (stesse di 'LEGA' in docs/COORDINATE-NUOVI-LUOGHI.md). Raggiungibile solo
    // per test da console: GameMap.vaiAMappa('lega_pokemon'). ──
    'lega_pokemon': {
      file: 'sprites/maps_tiled/Lega_pokemon.tmj',
      latC: 41.8337, lonC: 12.7532,
      interno: true,   // niente Volo dentro la Lega (richiesta esplicita, sess. 5 set)
    },
    // ── Colonna (città finale, post-Lega — sess. 14 set 2026): Luca ha
    // disegnato Colonna.tmj/Colonna_2.tmj e un Colonna.world che le mette in
    // fila verticale CONTIGUA con Lega_pokemon.tmj (hall in cima, poi
    // Colonna_2, poi Colonna) — stesso schema "cluster" di Frascati/
    // Monte Porzio: si cammina dall'uscita della Lega dentro la città senza
    // fade. 'lega_pokemon' resta 'interno:true' (niente Volo lì dentro): la
    // sua appartenenza al cluster non lo cambia, il controllo è per singola
    // sotto-mappa (mappaInfo si aggiorna quando si passa da un riquadro
    // all'altro del cluster). colonna_2 = la città vera e propria (piazza,
    // Centro Pokémon, Market, statua CoTrAL); colonna = i dintorni verso sud
    // (già con 2 gate npc e uno stub warp verso il Bunkerino, piazzati da
    // Luca in Tiled).
    'colonna_2': {
      file: 'sprites/maps_tiled/Colonna_2.tmj',
      latC: 41.8144, lonC: 12.7607,
    },
    'colonna': {
      file: 'sprites/maps_tiled/Colonna.tmj',
      latC: 41.8110, lonC: 12.7607,
    },
    // Centro Pokémon e Market dedicati di Colonna: il Market è un file a sé
    // (non il generico 'mart_interno') perché vende merce END-GAME unica,
    // diversa da quella base — vedi 'mk-colonna'/'mk-colonna-erborista' in
    // POKE_MARKET (js/data.js).
    'pokecenter_colonna': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_frascati.tmj',
      interno: true,
      latFissa: 41.8144, lonFissa: 12.7607,
    },
    'mart_colonna': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_colonna.tmj',
      interno: true,
      latFissa: 41.8144, lonFissa: 12.7607,
    },
    // 1f/2f/3f/5f registrate qui (sess. 5 set 2026): i file .tmj esistevano
    // già ma non erano ancora agganciate a MAPPE — solo 4f lo era. Ognuna
    // ospita un membro del Superquattro (1f-4f) o il Campione (5f), vedi
    // 'sq_captain'/'sq_pres'/'sq_dema'/'sq_marcuois'/'campione_remo' in
    // dati/trainer.js. Stessa lat/lon della hall (sono piani dello stesso
    // edificio, non luoghi separati sulla mappa reale).
    'lega_pokemon_1f': {
      file: 'sprites/maps_tiled/Lega_pokemon_1f.tmj',
      latC: 41.8337, lonC: 12.7532,
      interno: true,
    },
    'lega_pokemon_2f': {
      file: 'sprites/maps_tiled/Lega_pokemon_2f.tmj',
      latC: 41.8337, lonC: 12.7532,
      interno: true,
    },
    'lega_pokemon_3f': {
      file: 'sprites/maps_tiled/Lega_pokemon_3f.tmj',
      latC: 41.8337, lonC: 12.7532,
      interno: true,
    },
    'lega_pokemon_4f': {
      file: 'sprites/maps_tiled/Lega_pokemon_4f.tmj',
      latC: 41.8337, lonC: 12.7532,
      interno: true,
    },
    'lega_pokemon_5f': {
      file: 'sprites/maps_tiled/Lega_pokemon_5f.tmj',
      latC: 41.8337, lonC: 12.7532,
      interno: true,
    },
    // ── Via Vittoria (dungeon finale, 5 piani + area segreta di Moltres) —
    // disegnata da Luca (12 agosto), ricablata da Luca il 13 agosto: i warp
    // interni tra i piani puntano ora a destinazioni/spawn diversi da prima
    // (i .tmj sono stati editati direttamente in Tiled da Luca — gli spawn
    // NON vanno toccati da codice). Popolata il 13 agosto con 12 allenatori
    // + 2 dot rivale (dati/trainer.js, 'via_vittoria_1'..'12',
    // 'rivale_via_vittoria', 'rivale2_via_vittoria' — quest'ultimo con
    // identità ancora da decidere, vedi TODO.md D13) e 5 zone erba_alta
    // (una per piano 1f-5f, l'intero piano — la stanza 'secret' di Moltres
    // resta senza incontri selvatici). Tileset già tutti registrati
    // (Caves/Emerald_Outside/outside/Waterfall*/Sea). Nessun warp reale la
    // collega ancora al mondo esterno (il "mega percorso" post-Genzano è
    // stato fatto il 13 agosto ma non ancora collegato fisicamente qui) —
    // raggiungibile solo da console finché quel collegamento non esiste:
    // GameMap.vaiAMappa('via_vittoria_1f'). ──
    'via_vittoria_1f': {
      file: 'sprites/maps_tiled/via vittoria_1f.tmj',
      interno: true,
      latFissa: 41.7300, lonFissa: 12.7100,
    },
    'via_vittoria_2f': {
      file: 'sprites/maps_tiled/via vittoria_2f.tmj',
      interno: true,
      latFissa: 41.7300, lonFissa: 12.7100,
    },
    'via_vittoria_3f': {
      file: 'sprites/maps_tiled/via vittoria_3f.tmj',
      interno: true,
      latFissa: 41.7300, lonFissa: 12.7100,
    },
    'via_vittoria_4f': {
      file: 'sprites/maps_tiled/via vittoria_4f.tmj',
      interno: true,
      latFissa: 41.7300, lonFissa: 12.7100,
    },
    'via_vittoria_5f': {
      file: 'sprites/maps_tiled/via vittoria_5f.tmj',
      interno: true,
      latFissa: 41.7300, lonFissa: 12.7100,
    },
    'via_vittoria_secret': {
      file: 'sprites/maps_tiled/via vittoria_secret.tmj',
      interno: true,
      latFissa: 41.7300, lonFissa: 12.7100,
    },
    // ── Centro Pokémon e Market dedicati di Rocca di Papa ──
    'pokecenter_rocca_di_papa': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_rocca_di_papa.tmj',
      interno: true,
      latFissa: 41.7608, lonFissa: 12.7096,
    },
    'mart_rocca_di_papa': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_rocca_di_papa.tmj',
      interno: true,
      latFissa: 41.7608, lonFissa: 12.7096,
    },
    // ── Albano Laziale (6ª città — Palestra Roccia, Capopalestra Giorgia, cap 46) ──
    // Mappa generata proceduralmente: PC/Market dedicati, palestra interna popolata,
    // collegamento reale al Lago di Albano, warp verso Percorso 6/7 (mappe non ancora
    // create — restano collegamenti futuri con toast "zona non disponibile").
    'albano': {
      file: 'sprites/maps_tiled/albano.tmj',
      latC: 41.7295, lonC: 12.6588,
    },
    // ── Percorso 8 — Albano → Ariccia (world Castelli_lasthree, stesso cluster
    // di 'albano': bordo adiacente, camminata continua senza dissolvenza). ──
    'percorso_8': {
      file: 'sprites/maps_tiled/Percorso_8.tmj',
      latC: 41.7250, lonC: 12.6680,
    },
    // ── Zona Safari (world Castelli_lasthree) — ingresso a pagamento, ancora
    // priva di trainer/incontri dedicati: solo il custode/guardia. ──
    'zona_safari': {
      file: 'sprites/maps_tiled/Zona Safari.tmj',
      latC: 41.7220, lonC: 12.6700,
      interno: true,   // ingresso a pagamento: niente Volo dentro, come nei giochi veri
    },
    // ── Grotta di Ho-Oh (Ariccia) — sess. 5 set 2026: mappa disegnata da
    // Luca (grotta_ohoh.tmx, convertita qui in .tmj con strumenti/
    // tmx_a_tmj.py, non esisteva ancora), un cunicolo verticale (25×105
    // tile) verso Ho-Oh in cima. Si entra solo con la Piuma (vinta dalla
    // Sfida dei Porchettari, stato.flags.piuma_porchettari — vedi
    // TODO.md), niente più il vecchio evento "alba della Sagra sul Ponte"
    // (js/app.js riga ~4860): quello usava ancora lat/lon del motore
    // Leaflet pre-F14, ormai morto, e non è stato portato qui di proposito
    // (testo atmosferico già scritto e ancora buono, se Luca lo rivuole).
    'grotta_ohoh': {
      file: 'sprites/maps_tiled/grotta_ohoh.tmj',
      tema: 'cave',
      latC: 41.7195, lonC: 12.6660,
    },
    // ── Percorso 9 — sale verso Ariccia (world Castelli_lasthree). ──
    'percorso_9': {
      file: 'sprites/maps_tiled/Percorso_9.tmj',
      latC: 41.7180, lonC: 12.6720,
    },
    // ── Ariccia (7ª città — Palestra Buio, Capopalestra Ombretta, cap 52) ──
    'ariccia': {
      file: 'sprites/maps_tiled/Ariccia.tmj',
      latC: 41.7196, lonC: 12.6752,
    },
    // ── Interno palestra Ariccia (Ombretta) — popolato con gregari/leader
    // (sessione 11 agosto), ma la porta in Ariccia.tmj NON esiste ancora:
    // l'edificio esterno non è ancora disegnato in città. Raggiungibile solo
    // da console finché Luca non piazza l'edificio e la porta. ──
    'palestra_ariccia_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_ariccia.tmj',
      interno: true,
      latFissa: 41.7196, lonFissa: 12.6752,
    },
    // ── Percorso 10 — Ariccia → Genzano (world Castelli_lasthree, cluster continuo). ──
    'percorso_10': {
      file: 'sprites/maps_tiled/Percorso_10.tmj',
      latC: 41.7130, lonC: 12.6810,
    },
    // ── Genzano di Roma (8ª e ultima città — Palestra Fuoco, Capopalestra
    // Flora, cap 58). ──
    'genzano': {
      file: 'sprites/maps_tiled/Genzano.tmj',
      latC: 41.7057, lonC: 12.6864,
    },
    // ── Interno palestra Genzano (Flora) — chiave = destinazione esatta
    // scritta sulla porta in Genzano.tmj (palestra_door). ──
    'palestra_genzano_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_genzano.tmj',
      interno: true,
      latFissa: 41.7057, lonFissa: 12.6864,
    },
    // ── Percorso 12 — confina con Genzano nel world Castelli_lasthree (si
    // cammina in continuo, bordo ovest di Genzano), ed è collegata a Via dei
    // Laghi (world Castelli_lakes, diverso: warp con dissolvenza) tramite un
    // varco chiuso da un NPC "lavori in corso" lato Via dei Laghi. Sessione
    // 8 agosto (seconda parte). ──
    'percorso_12': {
      file: 'sprites/maps_tiled/Percorso_12.tmj',
      latC: 41.7250, lonC: 12.6780,
    },
    // ── Centro Pokémon e Market dedicati di Genzano (clonati dal template di
    // Ariccia, sessione 8 agosto). ──
    'pokecenter_genzano': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_genzano.tmj',
      interno: true,
      latFissa: 41.7057, lonFissa: 12.6864,
    },
    'mart_genzano': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_genzano.tmj',
      interno: true,
      latFissa: 41.7057, lonFissa: 12.6864,
    },
    // ── Centro Pokémon e Market dedicati di Ariccia (sessione 6 agosto) ──
    'pokecenter_ariccia': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_ariccia.tmj',
      interno: true,
      latFissa: 41.7196, lonFissa: 12.6752,
    },
    'mart_ariccia': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_ariccia.tmj',
      interno: true,
      latFissa: 41.7196, lonFissa: 12.6752,
    },
    'pokecenter_albano': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_albano.tmj',
      interno: true,
      latFissa: 41.7295, lonFissa: 12.6588,
    },
    'mart_albano': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_albano.tmj',
      interno: true,
      latFissa: 41.7295, lonFissa: 12.6588,
    },
    // ── Interno palestra Albano (Giorgia) — chiave = destinazione esatta
    // scritta sulla porta in albano.tmj (palestra_door). ──
    'palestra_albano_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_albano.tmj',
      interno: true,
      latFissa: 41.7295, lonFissa: 12.6588,
    },
    // Alias per i warp porta di Marino (destinazione "interno_pokecenter" / "interno_market")
    // NOTA: tenuti per compatibilità con mappe più vecchie; Marino e Castel Gandolfo
    // ora hanno mappe dedicate (vedi 'pokecenter_marino'/'mart_marino' ecc. sotto).
    'interno_pokecenter': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_frascati.tmj',
      interno: true,
      latFissa: 41.7725, lonFissa: 12.6560,
    },
    'interno_market': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke market.tmj',
      interno: true,
      latFissa: 41.7725, lonFissa: 12.6560,
    },
    // ── Centro Pokémon e Market dedicati di Marino (non più il file di Frascati) ──
    'pokecenter_marino': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_marino.tmj',
      interno: true,
      latFissa: 41.7700, lonFissa: 12.6653,
    },
    'mart_marino': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_marino.tmj',
      interno: true,
      latFissa: 41.7700, lonFissa: 12.6653,
    },
    // ── Centro Pokémon e Market dedicati di Castel Gandolfo ──
    'pokecenter_castel_gandolfo': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_castel_gandolfo.tmj',
      interno: true,
      latFissa: 41.7476, lonFissa: 12.6500,
    },
    'mart_castel_gandolfo': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_castel_gandolfo.tmj',
      interno: true,
      latFissa: 41.7476, lonFissa: 12.6500,
    },
    'tuscolo_ingresso': {
      file: 'sprites/maps_tiled/tuscolo_ingresso.tmj',
      latC: 41.8230, lonC: 12.7050,
    },
    // Cuore dei Boschi del Tuscolo (dentro la zona "boschi-tuscolo")
    'tuscolo_interno': {
      file: 'sprites/maps_tiled/tuscolo_interno_1.tmj',
      latC: 41.7960, lonC: 12.7330,
    },
    // Rovine di Tuscolo (antico insediamento romano)
    'tuscolo_rovine': {
      file: 'sprites/maps_tiled/tuscolo_rovine.tmj',
      latC: 41.7910, lonC: 12.7375,
    },
    // Tuscolo profondo (camere del Trio Regi, post-Lega)
    'tuscolo_profondo': {
      file: 'sprites/maps_tiled/tuscolo_profondo_1.tmj',
      latC: 41.7895, lonC: 12.7395,
      tema: 'cave',
    },
    // Boschetto segreto (post-Lega: Il Solitario + Celebi)
    'boschetto_segreto': {
      file: 'sprites/maps_tiled/boschetto_segreto.tmj',
      latC: 41.7945, lonC: 12.7300,
    },
    // Antri del Trio Regi (camere sigillate, post-Lega + ≥3 Pokémon di un tipo)
    'antro_regice': {
      file: 'sprites/maps_tiled/Anto_regice.tmj',
      latC: 41.7890, lonC: 12.7385,
      tema: 'icecave',
    },
    'antro_regirock': {
      file: 'sprites/maps_tiled/Anto_regirock.tmj',
      latC: 41.7890, lonC: 12.7400,
      tema: 'cave',
    },
    'antro_registeel': {
      file: 'sprites/maps_tiled/Anto_registeel.tmj',
      latC: 41.7890, lonC: 12.7415,
      tema: 'cave',
    },
    'palestra_frascati': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_Frascati.tmj',
      interno: true,
      latFissa: 41.8036, lonFissa: 12.6796,
    },
    'pokemon_market_frascati': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke market.tmj',
      interno: true,
      latFissa: 41.8066, lonFissa: 12.6826,
    },
    'pokecenter_frascati': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_frascati.tmj',
      interno: true,
      latFissa: 41.8090, lonFissa: 12.6772,
    },
    // ── Grottaferrata (2ª città — Abbazia di San Nilo, palestra Psico) ──
    'grottaferrata': {
      file: 'sprites/maps_tiled/grottaferrata.tmj',
      latC: 41.7858, lonC: 12.6668,
    },
    'palestra_grottaferrata_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_Grottaferrata.tmj',
      interno: true,
      latFissa: 41.7858, lonFissa: 12.6668,
    },
    // ── Interno dell'Abbazia di San Nilo (sess. 8 set 2026): 3° e ultimo
    // luogotenente GdF (Ginevra), sblocca la porta solo a Medaglia Fraschetta
    // (Ariccia, 7ª) ottenuta — vedi warp su grottaferrata.tmj e
    // docs/STORIA_COMPLETA.md, arco GdF. Mappa disegnata da Luca. ──
    'abbazia_interno': {
      file: 'sprites/maps_tiled/Interno_San_Nilo.tmj',
      interno: true,
      latFissa: 41.7858, lonFissa: 12.6668,
      bloccaVuoti: true,   // grandi margini fuori dalla navata senza tile né collisione a mano
    },
    // ── Centro Pokémon e Market dedicati di Grottaferrata (prima riusava i
    // file di Frascati) — sessione 8 agosto. ──
    'pokecenter_grottaferrata': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_grottaferrata.tmj',
      interno: true,
      latFissa: 41.7858, lonFissa: 12.6668,
    },
    'mart_grottaferrata': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke_market_grottaferrata.tmj',
      interno: true,
      latFissa: 41.7858, lonFissa: 12.6668,
    },
    // ── Percorso 11 — biforcazione Grottaferrata → Rocca di Papa (world
    // FrascatiGrotta), verso Monte Cavo/nascondiglio CoTrAL. ──
    'percorso_11': {
      file: 'sprites/maps_tiled/Percorso_11.tmj',
      latC: 41.7720, lonC: 12.6880,
    },
    // ── Collegamento CoTrAL — diramazione di Percorso 11 verso il nascondiglio
    // ai piedi di Monte Cavo. ──
    'collegamento_cotral': {
      file: 'sprites/maps_tiled/collegamento_Cotral.tmj',
      latC: 41.7695, lonC: 12.6920,
    },
    // ── Rifugio CoTrAL di Rocca di Papa (sess. 8 set 2026): la mappa che il
    // warp qui sopra aspettava da tempo, disegnata da Luca. Per ora SOLO
    // collegata (spawn/warp) — dentro ci andrà Baso + una cutscene grossa,
    // rimandata a una sessione dedicata (richiesta esplicita di Luca: "per
    // ora limitiamoci a collegarlo"). ──
    'nascondiglio_cotral': {
      file: 'sprites/maps_tiled/Rifugio_cotral_rocca.tmj',
      interno: true,
      latFissa: 41.7695, lonFissa: 12.6920,
      bloccaVuoti: true,   // buchi irregolari nel pavimento della grotta, mai coperti a mano uno per uno
    },
    // ── Marino (3ª città — Fontana dei Quattro Mori, palestra Acqua) ──
    // Chiave = destinazione esatta scritta sulla porta in marino.tmj (palestra_moro_door).
    'interno_palestra_moro': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_marino.tmj',
      interno: true,
      latFissa: 41.7686, lonFissa: 12.6624,
    },
    // Interni GENERICI riusabili da ogni città (ritorno via mappaStack).
    // Grottaferrata riusa le STESSE mappe di Frascati (Centro Pokémon e Market).
    'pokecenter_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_frascati.tmj',
      interno: true,
      latFissa: 41.7858, lonFissa: 12.6668,
    },
    'mart_interno': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke market.tmj',
      interno: true,
      latFissa: 41.7858, lonFissa: 12.6668,
    },
  };

  // Mappa-città → nome comune (per segnare la città come "visitata" → MN Volo).
  const MAPPA_COMUNE = {
    'borgata_tuscolana': 'Borgata Tuscolana',
    'frascati_centro': 'Frascati', 'frascati_sud': 'Frascati', 'frascati_est': 'Frascati',
    'frascati_ovest': 'Frascati', 'frascati_nord': 'Frascati',
    'grottaferrata': 'Grottaferrata',
    'marino': 'Marino',
    'castel_gandolfo': 'Castel Gandolfo',
    'monteporzio': 'Monte Porzio Catone',
    'albano': 'Albano Laziale',
    'rocca_di_papa': 'Rocca di Papa',
    'genzano': 'Genzano di Roma',
  };

  // I tileset "outdoor" (256px di larghezza ma altissimi) superano il limite di
  // texture WebGL (~8192px): vengono caricati a "fette" da SPLIT_ROW righe ciascuna
  // (250×32 = 8000px) e ricomposti su più layer. Il numero di fette dipende
  // dall'altezza reale dell'immagine (Outside.png → 3, Emerald_Outside.png → 3).
  const SPLIT_ROW   = 250;
  const SPLIT_TILES = SPLIT_ROW * 8;   // tile per fetta (8 colonne)

  const TILESET_META = {
    'outside':               { keyBase: 'ts-outside', src: 'sprites/Tiles per claude/Outside.png',
                               split: true, splitTiles: SPLIT_TILES, tw: 32, th: 32, cols: 8 },
    'Emerald_Outside':       { keyBase: 'ts-emerald', src: 'Emerald_Outside.png',
                               split: true, splitTiles: SPLIT_TILES, tw: 32, th: 32, cols: 8 },
    // Tileset nuovi (Marino, Percorso 4, Lago, Castel Gandolfo, Percorso 5)
    'Outside_pallet':        { keyBase: 'ts-opallet', src: 'sprites/Outside_pallet.png',
                               split: true, splitTiles: SPLIT_TILES, tw: 32, th: 32, cols: 8 },
    // Usato da via_dei_laghi.tmj (mai registrato finora: il layer che lo usava
    // spariva senza errori visibili, solo un warning "Tileset sconosciuto" in console).
    'tileset-outside':       { keyBase: 'ts-tsoutside', src: 'sprites/tileset-outside.png',
                               split: true, splitTiles: SPLIT_TILES, tw: 32, th: 32, cols: 8 },
    'Sea':                   { key: 'ts-sea',         tw: 32, th: 32, cols: 24 },
    // Tunnel Roccioso (sessione 6 agosto): 256×6368px, sotto il limite WebGL
    // (~8192px), niente split necessario a differenza di outside/Emerald_Outside.
    'Caves':                 { key: 'ts-caves',       tw: 32, th: 32, cols: 8  },
    // Monte Cavo (sessione 8 agosto, seconda parte): 256×288px, niente split.
    'snow tiles':            { key: 'ts-snow',        tw: 32, th: 32, cols: 8  },
    'pokemon_emerald_exterior_32': { key: 'ts-emerald32', tw: 32, th: 32, cols: 88 },
    'Waterfall crest':       { key: 'ts-wfall-crest', tw: 32, th: 32, cols: 4  },
    'Waterfall':             { key: 'ts-wfall',       tw: 32, th: 32, cols: 4  },
    'Waterfall bottom':      { key: 'ts-wfall-bot',   tw: 32, th: 32, cols: 4  },
    'Poke Centre interior':  { key: 'ts-pc-int',     tw: 32, th: 32, cols: 8  },
    'Interior general':      { key: 'ts-int-gen',    tw: 16, th: 16, cols: 16 },
    'Gyms interior':         { key: 'ts-gyms-int',   tw: 32, th: 32, cols: 8  },
    'Mart interior':         { key: 'ts-mart-int',   tw: 32, th: 32, cols: 8  },
    'professor Castagno':    { key: 'ts-prof-cast',  tw: 16, th: 16, cols: 8  },
    // Fontana decorativa (Marino, sessione 10 agosto).
    'fontana':                { key: 'ts-fontana',    tw: 32, th: 32, cols: 6  },
    // Tileset arredi 32×32 del laboratorio (v2, sessione 10 agosto): il file si
    // chiama "Interior general.tsj" in Tiled ma qui è stato rinominato in
    // "Interior_general_32" per non collidere col nome dell'altro tileset
    // "Interior general" (16×16, ../Tiled/Interior general.tsx) — nomeTs()
    // deriva la chiave dal nome file ignorando l'estensione, quindi due
    // tileset diversi con LO STESSO nome file (solo .tsx vs .tsj) si
    // sovrascriverebbero a vicenda nel registro.
    'Interior_general_32':   { key: 'ts-int-gen-32', tw: 32, th: 32, cols: 8  },
    // Palestra di Albano Laziale (Roccia, Capopalestra Giorgia) — sessione 10 agosto.
    'palestra_roccia':       { key: 'ts-palestra-roccia', tw: 32, th: 32, cols: 29 },
    // Nuovi tileset interni palestre (Ariccia/Genzano), aggiunti da Luca in Tiled
    // — sessione 11 agosto: 1024×1024px, niente split necessario.
    'palestre':               { key: 'ts-palestre',  tw: 32, th: 32, cols: 32 },
    'palestre2':               { key: 'ts-palestre2', tw: 32, th: 32, cols: 32 },
    'palestre3':               { key: 'ts-palestre3', tw: 32, th: 32, cols: 32 },
    // Tileset di Ariccia.tmj mai registrati (sessione 12 agosto): mancavano dal
    // registro, quindi quelle zone della mappa risultavano nere/vuote in game —
    // stesso identico problema già visto per 'palestre'/'palestre2'/'palestre3'.
    'party':                  { key: 'ts-party',     tw: 32, th: 32, cols: 8  },
    'party2':                 { key: 'ts-party2',    tw: 32, th: 32, cols: 8  },
    'party3':                 { key: 'ts-party3',    tw: 32, th: 32, cols: 6  },
    'porchetta':              { key: 'ts-porchetta', tw: 32, th: 32, cols: 37 },
    // Museo delle Navi di Nemi (sessione 12 agosto): due piani, tileset mai
    // registrati (mappe esistevano solo come .tmx, non ancora cablate nel motore).
    'Mansion interior':       { key: 'ts-mansion-int', tw: 32, th: 32, cols: 8 },
    'Museum interior':        { key: 'ts-museum-int',  tw: 32, th: 32, cols: 8 },
    // Piani della Lega di Colonna (sessione 11 agosto): mappa in costruzione,
    // ancora nessun warp reale la collega — vedi 'lega_pokemon'/'lega_pokemon_4f'
    // in MAPPE, per ora raggiungibili solo per test da console (GameMap.vaiAMappa).
    'lega':                    { key: 'ts-lega', tw: 32, th: 32, cols: 32 },
    'interni_lega_2':          { key: 'ts-lega-int2',      tw: 32, th: 32, cols: 37 },
    'interno lega acc':        { key: 'ts-lega-int-acc',   tw: 32, th: 32, cols: 32 },
    'interno lega psico':      { key: 'ts-lega-int-psico', tw: 32, th: 32, cols: 32 },
    'lega_acc_psico':          { key: 'ts-lega-acc-psico', tw: 32, th: 32, cols: 32 },
    'rifugi nemici 3':         { key: 'ts-rifugi-nemici3', tw: 32, th: 32, cols: 32 },
    'RIFUGIO':                 { key: 'ts-rifugio',        tw: 32, th: 32, cols: 32 },
    // Rifugio CoTrAL di Rocca di Papa (nascondiglio_cotral, sess. 8 set
    // 2026) — 2 tileset nuovi, mai registrati.
    'rifugi_nemici2':          { key: 'ts-rifugi-nemici2', tw: 32, th: 32, cols: 32 },
    'rifugio_rocket':          { key: 'ts-rifugio-rocket', tw: 32, th: 32, cols: 32 },
    // Rifugio GdF di Marino (gdf_marino_1f/2f_a/2f_b/2f_c) — sessione 10 agosto.
    'Dungeon wall':          { key: 'ts-dungeon-wall', tw: 32, th: 32, cols: 4  },
    'Dungeon floor':         { key: 'ts-dungeon-floor', tw: 32, th: 32, cols: 4  },
    'Factory interior':      { key: 'ts-factory-int',  tw: 32, th: 32, cols: 8  },
    'Game Boy Advance - Pokemon FireRed _ LeafGreen - Maps (Towns, Buildings, Etc.) - Rocket Hideout': {
      key: 'ts-rocket-hideout', tw: 32, th: 32, cols: 54 },
    // Chiesa (usato da grottaferrata.tmj e Percorso_11.tmj) — mai registrato:
    // stesso identico problema già visto per 'palestre'/'party'/ecc., quella
    // zona della mappa risultava nera/vuota in game (console: "Tileset
    // sconosciuto: chiesa"). Segnalato da Luca su Grottaferrata, 3 settembre 2026.
    'chiesa':                  { key: 'ts-chiesa', tw: 32, th: 32, cols: 11 },
    // Interno dell'Abbazia di San Nilo (Interno_San_Nilo.tmj, sess. 8 set
    // 2026) — mai registrato: stesso identico problema di 'chiesa'/
    // 'palestre'/ecc. sopra, la navata/altare risultava nera in game.
    'church1':                 { key: 'ts-church1', tw: 32, th: 32, cols: 24 },
    // Edificio esterno della chiesa/Abbazia su grottaferrata.tmj — tileset
    // DIVERSO da 'chiesa' (11 colonne) e da 'church1' (24 colonne, interno):
    // questo è 'church.tsj' (256×320px, 8 colonne), anche lui mai registrato,
    // causa dell'edificio esterno reso nero/vuoto segnalato da Luca.
    'church':                  { key: 'ts-church',  tw: 32, th: 32, cols: 8  },
    // Fiori animati (sostituzione id 956 di outside.tsx + colori di Genzano) —
    // mai registrati: stesso problema già visto per 'chiesa'/'palestre'/ecc.
    'fiori_rossi_animati_v2':  { key: 'ts-fiori-rossi-v2',  tw: 32, th: 32, cols: 8 },
    'fiori_bianchi_animati':   { key: 'ts-fiori-bianchi',   tw: 32, th: 32, cols: 8 },
    'fiori_blu_animati':       { key: 'ts-fiori-blu',       tw: 32, th: 32, cols: 8 },
    'fiori_gialli_animati':    { key: 'ts-fiori-gialli',    tw: 32, th: 32, cols: 8 },
    'fiori_rosa_animati':      { key: 'ts-fiori-rosa',      tw: 32, th: 32, cols: 8 },
    'fiori_viola_animati':     { key: 'ts-fiori-viola',     tw: 32, th: 32, cols: 8 },
    // Onde animate sulla spiaggia (Lago di Albano/Lago di Albano interno/Lago
    // di Nemi) — 18 colonne × 4 righe, vedi _registraSpiaggiaAnimata.
    'spiaggia_animata_onde':   { key: 'ts-spiaggia-onde',   tw: 32, th: 32, cols: 18 },
    // Grotta del Vulcano (sess. 7 set 2026): lava autotile 3×3 (16 fotogrammi,
    // stesso schema delle onde) + le 3 cascate di lava (stesso schema delle
    // cascate d'acqua, vedi CASCATA_TILESETS).
    'lava_animata_v2':         { key: 'ts-lava-v2',         tw: 32, th: 32, cols: 48 },
    'Waterfalllava':           { key: 'ts-wfall-lava',      tw: 32, th: 32, cols: 4  },
    'Waterfall bottomLava':    { key: 'ts-wfall-bot-lava',  tw: 32, th: 32, cols: 4  },
    'Waterfall crestLava':     { key: 'ts-wfall-crest-lava', tw: 32, th: 32, cols: 4  },
  };

  // Numero di fette effettivamente caricate per ogni tileset diviso (nome → N).
  const splitParts = {};

  const TILESET_IMMAGINI = {
    'ts-pc-int':      'Essentials FRLG/Graphics/Tilesets/Poke Centre interior.png',
    'ts-int-gen':     'Essentials FRLG/Graphics/Tilesets/Interior general.png',
    'ts-gyms-int':    'Essentials FRLG/Graphics/Tilesets/Gyms interior.png',
    'ts-mart-int':    'Essentials FRLG/Graphics/Tilesets/Mart interior.png',
    'ts-prof-cast':   'Essentials FRLG/Graphics/Characters/NPC_ProfOak.png',
    // Tileset nuovi
    'ts-sea':         'sprites/tiles/Sea.png',
    'ts-caves':       'sprites/maps_tiled/Caves.png',
    'ts-snow':        'sprites/maps_tiled/snow tiles.png',
    'ts-emerald32':   'sprites/pokemon_emerald_exterior_32x32.png',
    'ts-wfall-crest': 'sprites/Waterfall crest.png',
    'ts-wfall':       'sprites/Waterfall.png',
    'ts-wfall-bot':   'sprites/Waterfall bottom.png',
    'ts-fontana':     'fontana.webp',
    'ts-int-gen-32':  'sprites/tiles/Interior general.png',
    'ts-palestra-roccia': 'palestra_roccia.webp',
    'ts-palestre':   'sprites/nuovi tileset/palestre.png',
    'ts-palestre2':  'sprites/nuovi tileset/palestre2.jpeg',
    'ts-palestre3':  'sprites/nuovi tileset/palestre3.png',
    'ts-lega':       'sprites/nuovi tileset/lega.png',
    'ts-lega-int2':      'sprites/nuovi tileset/interni_lega_2.png',
    'ts-lega-int-acc':   'sprites/nuovi tileset/interno lega acc.png',
    'ts-lega-int-psico': 'sprites/nuovi tileset/interno lega psico.png',
    'ts-lega-acc-psico': 'sprites/nuovi tileset/lega_acc_psico.png',
    'ts-rifugi-nemici3': 'sprites/nuovi tileset/rifugi nemici 3.jpeg',
    'ts-rifugio':        'sprites/nuovi tileset/RIFUGIO.png',
    'ts-rifugi-nemici2': 'sprites/nuovi tileset/rifugi_nemici2.png',
    'ts-rifugio-rocket': 'sprites/nuovi tileset/rifugio_rocket.png',
    'ts-sub':        'sub.png',
    'ts-underwater': 'sprites/tiles/Underwater.png',
    'ts-dungeon-wall':  'sprites/maps_tiled/Dungeon wall.png',
    'ts-dungeon-floor': 'sprites/maps_tiled/Dungeon floor.png',
    'ts-factory-int':   'sprites/maps_tiled/Factory interior.PNG',
    'ts-rocket-hideout': 'Game Boy Advance - Pokemon FireRed _ LeafGreen - Maps (Towns, Buildings, Etc.) - Rocket Hideout.png',
    'ts-chiesa':     'chiesa.png',
    'ts-church1':    'church1.png',
    'ts-church':     'church.png',
    'ts-party':      'party.png',
    'ts-party2':     'party2.png',
    'ts-party3':     'party3.png',
    'ts-porchetta':  'sprites/nuovi tileset/porchetta.png',
    'ts-mansion-int': 'sprites/tiles/Mansion interior.png',
    'ts-museum-int':  'sprites/tiles/Museum interior.png',
    'ts-fiori-rossi-v2': 'sprites/Tile_nuovi/fiori_rossi_animati_v2.png',
    'ts-fiori-bianchi':  'sprites/Tile_nuovi/fiori_bianchi_animati.png',
    'ts-fiori-blu':      'sprites/Tile_nuovi/fiori_blu_animati.png',
    'ts-fiori-gialli':   'sprites/Tile_nuovi/fiori_gialli_animati.png',
    'ts-fiori-rosa':     'sprites/Tile_nuovi/fiori_rosa_animati.png',
    'ts-fiori-viola':    'sprites/Tile_nuovi/fiori_viola_animati.png',
    'ts-spiaggia-onde':  'sprites/Tile_nuovi/spiaggia_animata_onde.png',
    'ts-lava-v2':        'sprites/Tile_nuovi/lava_animata_v2.png',
    'ts-wfall-lava':      'sprites/Tile_nuovi/Waterfalllava.png',
    'ts-wfall-bot-lava':  'sprites/Tile_nuovi/Waterfall bottomLava.png',
    'ts-wfall-crest-lava': 'sprites/Tile_nuovi/Waterfall crestLava.png',
  };
  Object.assign(TILESET_META, {
    'sub':        { key: 'ts-sub',        tw: 32, th: 32, cols: 4  },
    'Underwater': { key: 'ts-underwater', tw: 32, th: 32, cols: 8  },
  });

  /* ══════════════════════════════════════════════════════════
     CONVERSIONE COORDINATE (compatibilità lat/lon)
     ══════════════════════════════════════════════════════════ */

  const M_PER_TILE    = 10;
  const RAGGIO_TERRA  = 111320;
  const COS_LAT       = Math.cos(41.84 * Math.PI / 180);

  function tileToLatLon(tx, ty, info) {
    if (!info || !info.latC) return { lat: 41.8420, lon: 12.6150 };
    const cx = Math.floor((info.mapW || 30) / 2);
    const cy = Math.floor((info.mapH || 20) / 2);
    return {
      lat: info.latC - (ty - cy) * M_PER_TILE / RAGGIO_TERRA,
      lon: info.lonC + (tx - cx) * M_PER_TILE / (RAGGIO_TERRA * COS_LAT),
    };
  }

  function distanzaMetri(a, b) {
    const dLat = (b.lat - a.lat) * RAGGIO_TERRA;
    const dLon = (b.lon - a.lon) * RAGGIO_TERRA * COS_LAT;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /* ══════════════════════════════════════════════════════════
     PARSING TMJ
     ══════════════════════════════════════════════════════════ */

  function nomeTs(source) {
    const name = source.replace(/\\/g, '/').split('/').pop().replace(/\.tsx$|\.tsj$/i, '');
    return name;
  }

  function parseTilesets(tmj) {
    const result = [];
    for (let i = 0; i < tmj.tilesets.length; i++) {
      const ts   = tmj.tilesets[i];
      const name = nomeTs(ts.source || '');
      const meta = TILESET_META[name];
      if (!meta) { console.warn('[TMJ] Tileset sconosciuto:', name); continue; }
      const nextGid = (i + 1 < tmj.tilesets.length) ? tmj.tilesets[i + 1].firstgid : Infinity;
      result.push({ ...meta, name, firstgid: ts.firstgid, nextGid });
    }
    return result;
  }

  // Normalizza i "tipi" degli ostacoli MN usati in Tiled (nomi "parlanti"
  // <terreno>_<mn>) verso i tipi interni del motore (trigger_<mn>). Così in
  // editor scrivi cose leggibili e il motore le gestisce tutte allo stesso modo.
  const ALIAS_TIPO = {
    'albero_taglio':        'trigger_taglio',
    'albero':               'trigger_taglio',
    'acqua_surf':           'trigger_surf',
    'acqua_sub':            'trigger_sub',
    'punto_immersione':     'trigger_sub',
    'immersione':           'trigger_sub',
    'roccia_spaccaroccia':  'trigger_spaccaroccia',
    'roccia_forza':         'trigger_forza',
    // Varianti "parlanti" usate in editor (sasso/masso) + la Cascata (MN Cascata)
    'sasso_spaccaroccia':   'trigger_spaccaroccia',
    'masso_spaccaroccia':   'trigger_spaccaroccia',
    'sasso_forza':          'trigger_forza',
    'masso_forza':          'trigger_forza',
    'cascata':              'trigger_cascata',
    'cascata_cascata':      'trigger_cascata',
    'acqua_cascata':        'trigger_cascata',
  };
  // Tollerante agli spazi/maiuscole: "acqua surf" → "acqua_surf" → trigger_surf.
  // (Non altera il valore restituito per i tipi non aliasati, es. "pokemon leggendario".)
  //
  // PROBLEMA 1 (segnalato da Luca, sessione 31 agosto): un rettangolo su "Lago
  // di Albano interno.tmj" aveva type "acqua surf e sub" — nessuna voce di
  // ALIAS_TIPO combacia con quella stringa esatta, quindi normTipo la
  // restituiva INVARIATA invece di "trigger_surf": quella casella non finiva
  // mai nell'insieme acquaSurf, quindi lì sopra (in Surf) non scattava MAI un
  // incontro, mentre nel resto del lago (rettangoli "acqua surf" puliti)
  // funzionava normalmente — da qui il "a volte non scattano". Il vero punto
  // di immersione (Sub) su quella mappa è un oggetto separato e dedicato
  // ("punto_immersione_lago_albano", con destinazione/spawn_id propri): quel
  // rettangolo "surf e sub" è acqua profonda che deve solo essere surfabile,
  // la parte "sub" del nome era vestigiale. Fallback generico (non solo
  // quella stringa esatta): qualunque tipo "parlante" che contenga la parola
  // "surf" e non abbia un alias esatto diventa comunque trigger_surf, così
  // future varianti scritte a mano in Tiled ("acqua surf e sub", "sub e
  // surf", spazi in più...) non ricreano lo stesso buco silenzioso.
  function normTipo(tipo) {
    if (typeof tipo !== 'string') return tipo;
    const key = tipo.trim().toLowerCase().replace(/\s+/g, '_');
    if (ALIAS_TIPO[key]) return ALIAS_TIPO[key];
    if (ALIAS_TIPO[tipo]) return ALIAS_TIPO[tipo];
    if (/(^|_)surf(_|$)/.test(key)) return 'trigger_surf';
    return tipo;
  }

  // Solo questi trigger_* sono OSTACOLI MN (solidi, superabili con la MN giusta).
  // Gli altri trigger_* (storia, rivale, leggendario) NON sono ostacoli MN.
  const MN_TRIGGER = ['taglio', 'surf', 'sub', 'forza', 'spaccaroccia', 'cascata'];
  function isMnTrigger(tipo) {
    return typeof tipo === 'string' && tipo.indexOf('trigger_') === 0 &&
           MN_TRIGGER.includes(tipo.slice(8));
  }

  /* ══════════════════════════════════════════════════════════
     CONDIZIONI sui warp/NPC ("richiede"/"condizione" in Tiled)
     Supporta: flag di gioco (es. "post_lega", "il_solitario_sconfitto"),
     la Lega completata, e requisiti di squadra in linguaggio naturale
     ("legaCompletata e tre pokemon lotta in squadra").
     ══════════════════════════════════════════════════════════ */

  // Parole-tipo italiane → nomi PokéAPI (inglese), come salvati in p.tipi
  const TIPO_IT_EN = {
    normale: 'normal', lotta: 'fighting', volante: 'flying', veleno: 'poison',
    terra: 'ground', roccia: 'rock', coleottero: 'bug', spettro: 'ghost',
    acciaio: 'steel', fuoco: 'fire', acqua: 'water', erba: 'grass',
    elettro: 'electric', psico: 'psychic', ghiaccio: 'ice', drago: 'dragon',
    buio: 'dark', folletto: 'fairy', normal:'normal', fighting:'fighting',
  };
  const NUM_IT = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6 };

  // Quanti Pokémon di un certo tipo (inglese) hai in squadra
  function contaTipoSquadra(tipoEn) {
    if (typeof stato === 'undefined' || !stato.squadra) return 0;
    return stato.squadra.filter(p => p.tipi && p.tipi.includes(tipoEn)).length;
  }

  // Verifica una condizione. Ritorna { ok, messaggio }.
  function verificaCondizione(cond) {
    if (!cond || cond === true) return { ok: true };
    const s = String(cond).toLowerCase();
    const flags = (typeof stato !== 'undefined' && stato.flags) ? stato.flags : {};

    // Requisito Lega (token "lega"/"post_lega"/"legacompletata")
    const vuoleLega = /lega/.test(s);
    if (vuoleLega && !flags.legaCompletata) {
      return { ok: false, messaggio: '🔒 Devi prima completare la Lega di Colonna.' };
    }

    // Requisito medaglie: "medaglie >= N" / "medaglie>=N" / "medaglie N"
    const mm = s.match(/medaglie\s*>?=?\s*(\d+)/);
    if (mm) {
      const richieste = parseInt(mm[1], 10);
      const possedute = (typeof stato !== 'undefined' && Array.isArray(stato.medaglie)) ? stato.medaglie.length : 0;
      if (possedute < richieste) {
        return { ok: false, messaggio: `🔒 Servono almeno ${richieste} Medaglie (ne hai ${possedute}).` };
      }
      return { ok: true };
    }

    // Requisito "N pokemon <tipo> in squadra"
    const m = s.match(/(\d+|un|uno|una|due|tre|quattro|cinque|sei)\s+pok[eé]?mon\s+([a-zàèéìòù]+)/);
    if (m) {
      const n = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : (NUM_IT[m[1]] || 0);
      const tipoEn = TIPO_IT_EN[m[2]];
      if (tipoEn && n > 0 && contaTipoSquadra(tipoEn) < n) {
        const have = contaTipoSquadra(tipoEn);
        const tipoIt = m[2].charAt(0).toUpperCase() + m[2].slice(1);
        return { ok: false, messaggio: `🔒 Servono ${n} Pokémon di tipo ${tipoIt} in squadra (ne hai ${have}).` };
      }
    }

    // Token-flag semplice (una sola parola senza "lega"/tipo): controlla stato.flags.
    // Nota: "s" è già minuscolo, ma i flag possono essere camelCase (es.
    // "documentoVillaOttenuto") — si prova prima la stringa originale (case esatto),
    // poi quella minuscola per compatibilità con i flag già tutti snake_case.
    if (!vuoleLega && !m && /^[a-z0-9_]+$/.test(s)) {
      const valore = (flags[cond] !== undefined) ? flags[cond] : flags[s];
      return valore ? { ok: true } : { ok: false, messaggio: '🔒 Non puoi ancora passare di qui.' };
    }

    return { ok: true };
  }

  // Restituisce la griglia di COLLISIONE VERA (1 = solido, sempre — anche uno
  // scoglio in mezzo al lago va aggirato, MAI attraversato, in Surf o a piedi).
  // trigger_surf NON è mai una collisione: è acqua, e la sua "permesso di
  // ingresso" è gestita a parte da acquaSurf/surfAttivo (vedi _sposta). Quindi
  // qui i rettangoli trigger_surf vengono sempre esclusi, non finiscono mai
  // in questa griglia — collGrid resta immutabile dopo il caricamento, il
  // movimento/Surf non lo scrive mai.
  function buildCollGrid(tmj) {
    const tw = tmj.tilewidth, th = tmj.tileheight;
    const w = tmj.width, h = tmj.height;
    const grid = Array.from({ length: h }, () => new Uint8Array(w));

    const segnaRett = (obj, val) => {
      const x0 = Math.max(0, Math.floor(obj.x / tw));
      const y0 = Math.max(0, Math.floor(obj.y / th));
      const x1 = Math.min(w - 1, Math.floor((obj.x + obj.width - 1) / tw));
      const y1 = Math.min(h - 1, Math.floor((obj.y + obj.height - 1) / th));
      for (let r = y0; r <= y1; r++)
        for (let c = x0; c <= x1; c++)
          grid[r][c] = val;
    };
    const leggiTipo = (obj) => {
      const props = {};
      if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
      return normTipo(props.type || obj.type || '');
    };

    // Sasso del tileset Caves (tile locale 1213, tunnel roccioso, sessione 6
    // agosto) + tile 983/965 (Monte Cavo, sessione 8 agosto: rocce che
    // spuntano dal ghiaccio) + tile 173/174/175/181/182/183 (Via Vittoria,
    // 1 settembre 2026: sempre collisione su ogni piano, richiesta di Luca):
    // riconosciuti dal TILE grafico, non serve disegnare un rettangolo a
    // mano — ogni mappa che usa Caves.tsj li eredita in automatico (quindi
    // anche via_vittoria_1f..5f/secret, che usano tutte Caves.tsj). Stesso
    // principio di _buildErbaAltaTiles per l'erba.
    for (const t of (tmj.tilesets || [])) {
      const src = String(t.source || '').toLowerCase().replace(/\\/g, '/');
      if (!src.endsWith('caves.tsj')) continue;
      const TILE_LOCALI_SEMPRE_SOLIDI = [1213, 983, 965, 173, 174, 175, 181, 182, 183];
      const gidSolidi = TILE_LOCALI_SEMPRE_SOLIDI.map(id => t.firstgid + id);
      for (const layer of tmj.layers) {
        if (layer.type !== 'tilelayer' || !layer.data) continue;
        for (let ty = 0; ty < h; ty++) {
          for (let tx = 0; tx < w; tx++) {
            if (gidSolidi.includes(layer.data[ty * w + tx])) grid[ty][tx] = 1;
          }
        }
      }
    }

    // Casella senza NESSUN tile sul layer "ground" (gid 0) = automaticamente
    // solida — SOLO per le mappe che lo dichiarano esplicitamente
    // (MAPPE[chiave].bloccaVuoti, letto da MAPPA_META qui sotto), non per
    // tutte: verificato che diverse mappe già in gioco (es. la palestra di
    // Monte Porzio: 449 caselle su 784) hanno grandi aree senza tile ma SENZA
    // un rettangolo di collisione a coprirle, quindi oggi sono calpestabili
    // — probabilmente intenzionale o comunque già collaudato. Renderlo
    // universale le avrebbe rotte silenziosamente. Richiesta di Luca (sess.
    // 8 set 2026, "come per le mappe della lega"): applicata per ora solo ai
    // dungeon nuovi che la usano davvero — vedi bloccaVuoti in MAPPE.
    if (tmj.__bloccaVuoti) {
      const groundLayer = tmj.layers.find(l => l.name === 'ground' && l.type === 'tilelayer');
      if (groundLayer && groundLayer.data) {
        for (let ty = 0; ty < h; ty++) {
          for (let tx = 0; tx < w; tx++) {
            if (!groundLayer.data[ty * w + tx]) grid[ty][tx] = 1;
          }
        }
      }
    }

    const collLayer = tmj.layers.find(l => l.name === 'collisioni' && l.type === 'objectgroup');
    if (collLayer) {
      for (const obj of collLayer.objects) {
        if (obj.width <= 0 || obj.height <= 0) continue;
        if (leggiTipo(obj) === 'trigger_surf') continue;   // acqua, non ostacolo
        segnaRett(obj, 1);
      }
    }
    // Le porte/uscite devono essere calpestabili anche se dentro una zona di collisione
    const evLayer = tmj.layers.find(l => l.name === 'eventi' && l.type === 'objectgroup');
    if (evLayer) {
      for (const obj of evLayer.objects) {
        const tipo = leggiTipo(obj);
        const calpestabile = (tipo === 'porta' || tipo === 'uscita' || tipo === 'entrata' || tipo === 'warp');
        // Gli ostacoli MN (trigger_taglio, trigger_forza, trigger_spaccaroccia, …)
        // bloccano il passaggio finché non possiedi la MN giusta (sbloccati a
        // runtime). trigger_surf ESCLUSO: l'acqua non è mai una collisione,
        // il permesso di ingresso è gestito da acquaSurf/surfAttivo in _sposta.
        const ostacoloMn = isMnTrigger(tipo) && tipo !== 'trigger_surf';
        // I cartelli RETTANGOLARI (mappe nuove) sono solidi: li leggi standoci
        // davanti, come nei giochi classici. I cartelli "punto" (mappe vecchie)
        // restano calpestabili per non bloccare i percorsi già funzionanti.
        const cartelloRett = (tipo === 'cartello' || tipo === 'cartel') && obj.width > 0 && obj.height > 0;
        // Decorazioni e fontane (deco / warp_speciale): solide, non ci si cammina sopra.
        const decoSolida = (tipo === 'deco' || tipo === 'warp_speciale') && obj.width > 0 && obj.height > 0;
        // Cancello a pulsante (puzzle masso/MN Forza): solido finché TUTTI i
        // pulsanti collegati ("attivato_da"/"collega", lista separata da
        // virgole — es. "p1,p2,p3" per un cancello che serve più massi
        // contemporaneamente) non sono mai stati premuti almeno una volta
        // (stato.flags.pulsante_<id>, permanente una volta attivato). Un solo
        // id senza virgole si comporta come prima (un pulsante = un cancello).
        let cancelloBloccato = false;
        if (tipo === 'cancello_pulsante') {
          const props = {};
          if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
          const idsPuls = String(props.attivato_da || props.collega || '')
            .split(',').map(s => s.trim()).filter(Boolean);
          const attivo = idsPuls.length > 0 && typeof stato !== 'undefined' && stato.flags &&
            idsPuls.every(id => stato.flags['pulsante_' + id]);
          cancelloBloccato = !attivo;
        }
        if (calpestabile || ostacoloMn || cartelloRett || decoSolida || cancelloBloccato) {
          const val = (ostacoloMn || cartelloRett || decoSolida || cancelloBloccato) ? 1 : 0;
          if (obj.width > 0 && obj.height > 0) {
            segnaRett(obj, val);
          } else {
            // Non richiediamo obj.point (vedi _controllaEventiCalpestabili):
            // un oggetto 0×0 non marcato "Point" in Tiled va comunque trattato
            // come singola casella, altrimenti una porta/warp del genere
            // potrebbe restare "murata" da un rettangolo di collisione che la
            // ricopre, senza mai essere liberata.
            const tx = Math.floor(obj.x / tw);
            const ty = Math.floor(obj.y / th);
            if (ty >= 0 && ty < h && tx >= 0 && tx < w) grid[ty][tx] = val;
          }
        }
      }
    }
    return grid;
  }

  // Layer "luci" (objectgroup): punti luce (finestre/lampioni), type:"luce" +
  // proprietà colore (es. "#ffd27f"). Si accendono solo di notte (vedi
  // _aggiornaVisibilitaLuci). Nessun rapporto col layer tile "sopra_testa".
  function parseLuci(tmj) {
    const risultato = [];
    const layer = tmj.layers.find(l => l.name === 'luci' && l.type === 'objectgroup');
    if (!layer) return risultato;
    for (const obj of layer.objects || []) {
      const props = {};
      if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
      if ((props.type || obj.type || '') !== 'luce') continue;
      risultato.push({
        x: obj.x + (obj.width || 0) / 2,
        y: obj.y + (obj.height || 0) / 2,
        colore: props.colore || '#ffd27f',
      });
    }
    return risultato;
  }

  function parseEventi(tmj) {
    const tw = tmj.tilewidth, th = tmj.tileheight;
    const eventi = [];

    const aggiungi = (obj) => {
      const props = {};
      if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
      let tipo = normTipo(props.type || obj.type || '');
      let idEv = props.id || obj.name || '';
      // Il rivale piazzato come "trigger_rivale" è in realtà un TRAINER visibile
      // con linea visiva: lo normalizziamo così usa tutto il sistema trainer
      // (sprite + vista + "!"). L'id sceglie quale rivale (default: rivale_tuscolo).
      if (tipo === 'trigger_rivale') { tipo = 'trainer'; idEv = props.id || 'rivale_tuscolo'; }
      // Un "trigger_leggendario" (con pokemon_id + condizione) è un leggendario su
      // mappa: lo normalizziamo così riusa creazione/sprite/solidità/lotta.
      if (tipo === 'trigger_leggendario') tipo = 'leggendario';
      const ev = {
        id:     idEv,
        nome:   obj.name || '',
        tipo,
        x:      obj.x,
        y:      obj.y,
        w:      obj.width  || 0,
        h:      obj.height || 0,
        point:  !!obj.point,
        props,
        tx:     Math.floor(obj.x / tw),
        ty:     Math.floor(obj.y / th),
      };
      if (ev.w > 0 && ev.h > 0) {
        ev.tx0 = Math.floor(ev.x / tw);
        ev.ty0 = Math.floor(ev.y / th);
        ev.tx1 = Math.floor((ev.x + ev.w - 1) / tw);
        ev.ty1 = Math.floor((ev.y + ev.h - 1) / th);
      }
      eventi.push(ev);
    };

    const evLayer = tmj.layers.find(l => l.name === 'eventi' && l.type === 'objectgroup');
    if (evLayer) for (const obj of evLayer.objects) aggiungi(obj);

    // Gli ostacoli MN (trigger_taglio/surf/…) a volte vengono messi nel layer
    // "collisioni" invece che in "eventi": raccogliamoli lo stesso così funzionano.
    const collLayer = tmj.layers.find(l => l.name === 'collisioni' && l.type === 'objectgroup');
    if (collLayer) for (const obj of collLayer.objects) {
      const props = {};
      if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
      const tp = normTipo(props.type || obj.type || '');
      if (isMnTrigger(tp)) aggiungi(obj);
    }

    return eventi;
  }

  // Insieme "tx,ty" di tutte le caselle coperte da ostacoli trigger_surf sulla
  // mappa: definisce l'intero "specchio d'acqua" da Surf, a prescindere da
  // quante caselle separate siano state disegnate per seguire il contorno.
  // SOLO i rettangoli trigger_surf: un ostacolo (masso/albero) nel layer
  // "collisioni" resta sempre un ostacolo, anche se è in mezzo al lago — il
  // giocatore in Surf lo aggira, non ci passa sopra. Questa funzione serve
  // solo a far continuare Surf senza dover ripremere [A] su ogni casella
  // d'acqua adiacente, non a "sciogliere" collisioni.
  function _buildSurfTiles(tmj, eventi) {
    const set = new Set();
    for (const ev of eventi) {
      if (ev.tipo !== 'trigger_surf') continue;
      if (ev.w > 0 && ev.h > 0) {
        for (let r = ev.ty0; r <= ev.ty1; r++)
          for (let c = ev.tx0; c <= ev.tx1; c++) set.add(c + ',' + r);
      } else {
        set.add(ev.tx + ',' + ev.ty);
      }
    }
    return set;
  }

  // Tile ID locale (nel tileset) della Poké Ball disegnata a terra sopra un
  // oggetto raccoglibile: sparisce quando l'oggetto viene raccolto (vedi
  // _nascondiTilePokeball). Non è mai un tile di terreno legittimo.
  const TILE_ID_POKEBALL = 948;

  // Insieme "tx,ty" di tutte le caselle il cui tile GROUND/DECO è "erba alta"
  // per GRAFICA (non per rettangolo disegnato a mano): verificato che, in
  // tutte le mappe che già hanno zone erba_alta funzionanti, il tile usato è
  // sempre l'id locale 6 dei tileset "outside.tsx"/"Outside_pallet.tsx" (7ª
  // colonna dello spritesheet, il cespuglio scuro). INCREMENTA il sistema a
  // rettangoli esistente, non lo sostituisce: _getTileType usa prima le zone
  // disegnate a mano (che possono avere probabilità/id specifici), e ricade
  // su questo solo per le caselle non coperte da nessun rettangolo.
  function _buildErbaAltaTiles(tmj) {
    const set = new Set();
    const gidErba = [];
    for (const t of (tmj.tilesets || [])) {
      const src = String(t.source || '').toLowerCase().replace(/\\/g, '/');
      if (src.endsWith('outside.tsx') || src.endsWith('outside_pallet.tsx')) {
        gidErba.push(t.firstgid + 6);
      }
    }
    if (gidErba.length === 0) return set;
    const w = tmj.width, h = tmj.height;
    for (const layer of tmj.layers) {
      if (layer.type !== 'tilelayer' || !layer.data) continue;
      for (let ty = 0; ty < h; ty++) {
        for (let tx = 0; tx < w; tx++) {
          const gid = layer.data[ty * w + tx];
          if (gid && gidErba.includes(gid)) set.add(tx + ',' + ty);
        }
      }
    }
    return set;
  }

  // Set "tx,ty" delle caselle di GHIACCIO scivoloso (Caves.tsj, tile locale
  // 944, Monte Cavo — sessione 8 agosto). Stesso principio di
  // _buildErbaAltaTiles: riconosciuto dal tile grafico, nessun rettangolo a
  // mano necessario. Usato in _sposta per far scivolare il giocatore.
  function _buildIceTiles(tmj) {
    const set = new Set();
    const gidGhiaccio = [];
    for (const t of (tmj.tilesets || [])) {
      const src = String(t.source || '').toLowerCase().replace(/\\/g, '/');
      if (src.endsWith('caves.tsj')) gidGhiaccio.push(t.firstgid + 944);
    }
    if (gidGhiaccio.length === 0) return set;
    const w = tmj.width, h = tmj.height;
    for (const layer of tmj.layers) {
      if (layer.type !== 'tilelayer' || !layer.data) continue;
      for (let ty = 0; ty < h; ty++) {
        for (let tx = 0; tx < w; tx++) {
          const gid = layer.data[ty * w + tx];
          if (gid && gidGhiaccio.includes(gid)) set.add(tx + ',' + ty);
        }
      }
    }
    return set;
  }

  // Set "tx,ty" delle caselle con un "bordo nord" (Caves.tsj, tile locale
  // 482 — Grotta del Vulcano, sess. 7 set 2026): stesso principio di
  // _buildIceTiles, riconosciuto dal tile grafico. Usato in _sposta per
  // bloccare l'attraversamento del lato nord della casella (in entrambe le
  // direzioni), pur restando calpestabile per il resto.
  function _buildMuroNordTiles(tmj) {
    const set = new Set();
    const gidMuroNord = [];
    for (const t of (tmj.tilesets || [])) {
      const src = String(t.source || '').toLowerCase().replace(/\\/g, '/');
      if (src.endsWith('caves.tsj')) gidMuroNord.push(t.firstgid + 482);
    }
    if (gidMuroNord.length === 0) return set;
    const w = tmj.width, h = tmj.height;
    for (const layer of tmj.layers) {
      if (layer.type !== 'tilelayer' || !layer.data) continue;
      for (let ty = 0; ty < h; ty++) {
        for (let tx = 0; tx < w; tx++) {
          const gid = layer.data[ty * w + tx];
          if (gid && gidMuroNord.includes(gid)) set.add(tx + ',' + ty);
        }
      }
    }
    return set;
  }

  // L'"id" di incontro condiviso da tutte le zone erba_alta disegnate a mano
  // su questa mappa (verificato: ogni mappa ne usa uno solo, es. tutti i
  // rettangoli di percorso_2 hanno id "incontri percorso 2"). Usato per dare
  // un id anche alle caselle erba-per-grafica non coperte da un rettangolo.
  // Se la mappa non ha ALCUNA zona erba_alta disegnata, resta null: niente
  // incontro automatico "indovinato" — va aggiunta almeno una zona con id.
  function _erbaAltaIdMappa(eventi) {
    for (const ev of eventi) {
      if (ev.tipo === 'erba_alta') return ev.id || (ev.props && ev.props.id) || null;
    }
    return null;
  }

  /* ══════════════════════════════════════════════════════════
     RISOLUZIONE DESTINAZIONI (nome mappa → chiave registro MAPPE)
     Le mappe usano stringhe libere e disordinate per "destinazione"
     (es. "pokemon-castelli- Percorso 1b", "Percorso 1", "Frascati").
     Normalizziamo e cerchiamo la corrispondenza migliore.
     ══════════════════════════════════════════════════════════ */

  function normTxt(s) {
    return String(s || '').toLowerCase()
      .replace(/pokemon[-\s]*castelli/g, '')   // toglie il prefisso del nome file
      .replace(/[^a-z0-9]/g, '');               // tiene solo lettere/numeri
  }

  // Nome "umano" della mappa ricavato dal nome file (per i confronti)
  function nomeMappaDaFile(file) {
    const base = String(file || '').replace(/\\/g, '/').split('/').pop()
      .replace(/\.tmj$/i, '');
    return normTxt(base);
  }

  // Trasforma una chiave/parola tipo "borgata_tuscolana" in "Borgata Tuscolana"
  // (usata per il popup nome-mappa quando non c'è un nome già pronto).
  function _prettifyChiave(s) {
    return String(s || '').replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      // "1f"/"2f a" (piani dei dungeon) → "1F"/"2F A": la lettera del piano
      // non è su un confine di parola per \b\w (segue subito una cifra).
      .replace(/(\d)([a-z])\b/g, (_, d, l) => d + l.toUpperCase());
  }

  // Nome da mostrare nel popup in alto a sinistra al cambio mappa (Fase
  // estetica, sessione 8 agosto): usa il nome "città" già noto (MAPPA_COMUNE)
  // quando c'è, altrimenti ripulisce la chiave del registro MAPPE — mai il
  // nome del file grezzo (es. "pokemon-castelli-Borgata_Tuscolana.tmj" → solo
  // "Borgata Tuscolana").
  function nomeVisualizzatoMappa(chiave) {
    if (MAPPA_COMUNE[chiave]) return MAPPA_COMUNE[chiave];
    if (chiave.startsWith('pokecenter')) {
      const resto = chiave.replace(/^pokecenter_?/, '');
      return 'Centro Pokémon' + (resto ? ' ' + _prettifyChiave(resto) : '');
    }
    if (chiave.startsWith('mart_')) {
      const resto = chiave.replace(/^mart_/, '');
      return 'Mercato ' + _prettifyChiave(resto);
    }
    if (chiave.startsWith('palestra_')) {
      const resto = chiave.replace(/^palestra_/, '').replace(/_interno$/, '');
      return 'Palestra ' + _prettifyChiave(resto);
    }
    return _prettifyChiave(chiave);
  }

  // Restituisce la chiave del registro MAPPE che corrisponde a "dest"
  function risolviMappa(dest) {
    if (!dest) return null;
    const nd = normTxt(dest);
    // 1) corrispondenza esatta con la chiave
    if (MAPPE[dest]) return dest;
    for (const chiave of Object.keys(MAPPE)) {
      if (normTxt(chiave) === nd) return chiave;
    }
    // 2) corrispondenza esatta col nome ricavato dal file
    for (const [chiave, def] of Object.entries(MAPPE)) {
      if (nomeMappaDaFile(def.file) === nd) return chiave;
    }
    // 3) corrispondenza per inclusione (più permissiva, ultima spiaggia)
    for (const [chiave, def] of Object.entries(MAPPE)) {
      const nf = nomeMappaDaFile(def.file);
      if (nf && nd && (nf.includes(nd) || nd.includes(nf))) return chiave;
    }
    return null;
  }

  // Restituisce il nome del cluster (CLUSTERS[...]) a cui appartiene una chiave
  // del registro MAPPE, o null se la mappa è "singola" (non fa parte di nessun
  // file .world convertito da strumenti/genera_clusters.py in js/clusters.js).
  function trovaCluster(chiaveMappa) {
    if (typeof CLUSTERS === 'undefined') return null;
    for (const nomeCluster of Object.keys(CLUSTERS)) {
      if (CLUSTERS[nomeCluster].mappe[chiaveMappa]) return nomeCluster;
    }
    return null;
  }

  /* ══════════════════════════════════════════════════════════
     WORLD TILED (.world) — LEGACY, transizione a fade sui bordi.
     Superato dal sistema CLUSTERS (js/clusters.js, vedi trovaCluster
     sopra): i .world elencati qui vengono ora caricati come mappe
     continue senza fade da _caricaCluster. Questo fallback resta
     attivo SOLO per eventuali .world futuri non ancora convertiti in
     cluster (WORLD_FILES vuoto = nessuno, oggi); _gestisciUscitaBordo
     lo salta comunque quando clusterAttivo è impostato.
     ══════════════════════════════════════════════════════════ */

  const worldRectsPromises = {};

  function caricaWorldRects(worldFile) {
    if (!worldRectsPromises[worldFile]) {
      worldRectsPromises[worldFile] = fetch(worldFile)
        .then(r => r.json())
        .then(data => {
          const rects = {};
          for (const m of (data.maps || [])) {
            const base = String(m.fileName || '').replace(/\\/g, '/').split('/').pop()
              .replace(/\.(tmx|tmj)$/i, '');
            rects[normTxt(base)] = { x: m.x, y: m.y, width: m.width, height: m.height, fileName: m.fileName };
          }
          return rects;
        })
        .catch(err => { console.error('[Map] Errore caricamento world', worldFile, err); return {}; });
    }
    return worldRectsPromises[worldFile];
  }

  // Elenco dei file .world gestiti col fallback LEGACY (fade ai bordi).
  // Tutti i .world esistenti sono ora cluster (js/clusters.js): resta vuoto
  // finché non se ne aggiungono di nuovi non ancora convertiti.
  const WORLD_FILES = [];

  /* ══════════════════════════════════════════════════════════
     STATO INTERNO
     ══════════════════════════════════════════════════════════ */

  let phaserGame    = null;
  let scena         = null;
  let playerSprite  = null;
  let mountSurfSprite = null;  // PROBLEMA 4b: "base_surf" sotto il personaggio mentre surfa
  let playerTrack   = null;
  let posTile       = { tx: 0, ty: 0 };
  let posLatLon     = { lat: 41.8420, lon: 12.6150 };
  let spawnGuard    = null;   // casella di spawn: i warp lì non scattano finché non ti sposti
  let onPassoCb     = null;
  let bloccato      = false;
  let velocita      = 1;   // ⏩ booster: NON tocca più il movimento (solo dialoghi/battaglie, lette altrove da stato.velocita), tenuta solo per compatibilità di impostaVelocita()
  let facciata      = 'down';

  // Durata FISSA di un passo (ms): stessa costante usata dal gate tastiera, dal
  // tween di movimento e dal ripetitore del D-pad touch, così i tre restano
  // sempre sincronizzati (prima divergevano leggermente col booster ⏩, causando
  // scatti). Il booster velocità non deve influenzare il movimento sulla mappa.
  // Valori IDENTICI a Essentials FRLG reale (Game_Character.rb#move_speed=,
  // letto da strumenti/scripts_estratti/0044_Game_Character.rb):
  //   move_speed 3 (camminata) → move_time 0.25s  → 250ms
  //   move_speed 4 (corsa)     → move_time 0.125s → 125ms (esattamente la metà)
  //   move_speed 5 (bici)      → move_time 0.1s   → 100ms
  // Una sessione precedente li aveva scalati a sensazione (125/75/50, con
  // rapporti diversi dall'originale) perché "la corsa sembrava uguale alla
  // camminata" — richiesta esplicita di Luca (sess. 5 set): fedeltà 1:1 con
  // Essentials prima di tutto, niente più tarature a orecchio.
  const DURATA_PASSO_MS       = 250;  // camminata normale
  const DURATA_PASSO_CORSA_MS = 125;  // tasto Corsa (Shift) tenuto premuto
  const DURATA_PASSO_BICI_MS  = 100;  // Bicicletta indossata

  // Genere → texture per ogni "modalità" del personaggio. player-girl-red va
  // ancora fornito (l'utente lo aggiungerà): finché manca, Phaser segnala
  // l'errore di caricamento ma il resto del gioco funziona lo stesso.
  const SPRITE_PLAYER = {
    boy:  { normale: 'player-red',      run: 'player-red-run',  bike: 'player-red-bike',  surf: 'player-red-surf',  fish: 'player-red-fish' },
    girl: { normale: 'player-girl-red', run: 'player-girl-run', bike: 'player-girl-bike', surf: 'player-girl-surf', fish: 'player-girl-fish' },
  };

  let genereGiocatore = 'boy';  // impostato da stato.genere al primo caricamento
  let corsaAttiva      = false; // tasto Corsa tenuto premuto
  let biciAttiva       = false; // Bicicletta indossata (si toglie da sola in Surf)
  let pescaFinoA       = 0;     // this.time.now: mostra la posa da pesca fino a questo istante

  // Follower — il primo Pokémon della squadra cammina dietro al giocatore,
  // fuori dal Box (sess. 8 set 2026, richiesta esplicita di Luca — un
  // tentativo precedente era stato tolto perché "non funziona", causa mai
  // isolata: questa è una riscrittura da zero, non un ripristino del
  // vecchio codice). Sempre visibile TRANNE in Bicicletta e mentre si
  // Surfa (troppo veloce/incoerente da seguire a piedi). Sprite: pacchetto
  // "Generation 8 Pack" (Luca, sess. 8 set 2026) in sprites/follower/,
  // fogli 4×4 di dimensione VARIABILE secondo la specie (256×256 per la
  // maggior parte, 512×512 per i Pokémon enormi come Wailord/Groudon) —
  // per questo _caricaTexFollower calcola la dimensione del frame dalla
  // texture reale invece di usare una costante fissa come per gli NPC.
  let followerSprite  = null;
  let followerPos      = { tx: 0, ty: 0, dir: 'sud' };
  let followerSpecieId = null;   // id squadra[0] già caricato, per non ricaricare la texture ad ogni passo
  // Override "alleato" (Osservatorio CoTrAL, sess. 15 set 2026): quando
  // valorizzato, il follower mostra QUESTO sprite trainer (es. Camilla) al
  // posto del Pokémon in testa alla squadra — "Camilla ti segue al posto
  // del pokemon", richiesta esplicita di Luca. null = comportamento normale.
  let followerAlleatoTexKey = null;

  // Girati-prima-di-camminare (Game_Player#update_command_new, Essentials
  // reale): la prima pressione di una direzione DIVERSA da quella tenuta
  // prima gira solo il personaggio sul posto, senza muoverlo; il passo vero
  // scatta solo se la direzione resta premuta per ALMENO 75ms, oppure se il
  // personaggio sta già camminando (in quel caso si può cambiare direzione
  // "al volo" mentre si cammina, senza il ritardo). Prima il nostro motore
  // muoveva subito a ogni pressione, un dettaglio che nei giochi Pokémon
  // veri si sente moltissimo (richiesta esplicita di Luca, sess. 5 set).
  let ultimaDirezionePremuta = null;
  let ultimaDirezioneDall    = 0;
  const SOGLIA_GIRA_PRIMA_MS = 75;
  // Vero per tutta la durata del tween di un passo: finché è true, update() NON
  // deve forzare l'anim "idle" anche se in quel frame nessun tasto risulta premuto
  // (rilascio del tasto a metà passo) — altrimenti l'animazione "cammina" viene
  // interrotta e riavviata da zero ad ogni casella, con l'effetto a scatti
  // segnalato dall'utente (sess. 10 agosto: "sembra che rimetta le braccia a
  // posto ogni casella"). Così il ciclo del passo prosegue naturale finché il
  // passo fisico non è davvero concluso.
  let giocatoreInMovimento = false;

  // Dopo un warp/cambio mappa il giocatore deve FERMARSI e ripremere una
  // direzione per ripartire, anche se tiene premuto lo stesso tasto con cui
  // è entrato nel warp — altrimenti "eredita" il movimento e continua a
  // camminare da solo sulla mappa nuova (richiesta esplicita di Luca,
  // sess. 17 set 2026). Impostato a true da caricaMappa() a ogni cambio
  // mappa reale; l'update() blocca il movimento finché non vede TUTTI i
  // tasti direzionali rilasciati almeno una volta.
  let attesaRilascioDirezione = false;

  let mappaCorrente    = null;
  let mappaInfo        = null;
  let mappaStack       = [];

  // ── Cluster (mappe continue, .world) ──
  // Quando la mappa corrente appartiene a un CLUSTERS[...], si carica l'intero
  // cluster come una "mappa virtuale" unica: mapW/mapH diventano il bounding box
  // del cluster, collGrid/eventiMappa sono la fusione di tutte le mappe membro
  // (shiftate sull'origine del cluster). Così tutto il codice di movimento,
  // collisioni, camera e spawn funziona invariato, sia in modalità cluster che
  // in modalità mappa singola (clusterAttivo = null).
  let clusterAttivo    = null;   // nome cluster attivo, o null
  let clusterOriginX   = 0;      // origine (tile, coord. .world) sottratta a tutte le mappe membro
  let clusterOriginY   = 0;
  let clusterBoxes     = {};     // chiave mappa → { offsetX, offsetY, w, h } GIÀ shiftate sull'origine

  let collGrid         = null;   // collisione VERA, immutabile dopo il caricamento (mai scritta da Surf)
  let eventiMappa      = [];
  let luciMappa        = [];    // oggetti type:luce del layer "luci" (finestre/lampioni), coord. pixel
  let acquaSurf        = null;   // Set "tx,ty": SOLO le celle dei rettangoli trigger_surf (l'acqua)
  let surfAttivo       = false;  // stato del player: sta surfando sì/no (non è una proprietà delle celle)
  // PROBLEMA 4a (salvataggio Surf): flag "una tantum", letto e consumato solo
  // dal PRIMO caricamento mappa dopo l'avvio (ripresa da salvataggio) — mai
  // dai warp/porte normali, che devono sempre far ripartire "a terra" come
  // prima. Impostato in create() da stato.mappaSalvata.surfando.
  let stavaSurfando    = false;
  let erbaAltaAuto     = null;   // Set "tx,ty": caselle erba alta riconosciute dal TILE (non da rettangolo)
  let erbaAltaIdPerMappa = {};   // chiave mappa membro → id incontri da usare per le sue caselle erbaAltaAuto
  let ghiaccioTiles    = null;   // Set "tx,ty": caselle di ghiaccio scivoloso (Caves.tsj, tile locale 944)
  let scivolandoGhiaccio = false; // true mentre è in corso uno scivolamento automatico: blocca l'input manuale
  // Set "tx,ty": caselle con un "bordo nord" (Caves.tsj, tile locale 482 —
  // Grotta del Vulcano, sess. 7 set 2026): calpestabili normalmente, ma non
  // si può attraversare il LATO NORD della casella in nessuna delle due
  // direzioni (né salendo da sud, né scendendo da nord). Vedi
  // _buildMuroNordTiles/_sposta.
  let muroNordTiles    = null;
  let mapW = 0, mapH = 0, tileSize = 32;
  let layerObjects     = [];
  // Animazione acqua (tileset "Sea", autotile a 8 fotogrammi): ogni cella
  // registrata viene fatta scorrere tra i fotogrammi disegnati nel PNG,
  // bordi/angoli inclusi (vedi _animaAcqua). Formula fotogramma → id locale:
  // dato un tile piazzato con riga R e posizione-nel-blocco P (0/1/2),
  // il gid del fotogramma F è: R*24 + F*3 + P (24 colonne, blocchi da 3).
  let acquaAnimTiles   = [];
  let acquaFrame       = 0;
  // Tileset delle cascate (Percorso 5): 4 fotogrammi in fila, nessuna variante
  // di forma (vedi _registraCascataAnimata).
  const CASCATA_TILESETS = ['Waterfall', 'Waterfall crest', 'Waterfall bottom', 'Waterfalllava', 'Waterfall bottomLava', 'Waterfall crestLava'];
  // Tileset dei fiori animati: come le cascate, 8 fotogrammi in fila senza
  // varianti di forma (vedi _registraFioriAnimati). fiori_rossi_animati_v2
  // sostituisce il vecchio fiore statico (id 956 di outside.tsx); gli altri
  // colori sono usati a Genzano.
  const FIORI_TILESETS = ['fiori_rossi_animati_v2', 'fiori_bianchi_animati', 'fiori_blu_animati', 'fiori_gialli_animati', 'fiori_rosa_animati', 'fiori_viola_animati'];

  // Cutscene che partono da sole al primo caricamento di una mappa (vedi
  // _controllaCutsceneSpawn), SENZA passare da un oggetto Tiled — utile per
  // test rapidi o per mappe che Luca sta ancora modificando in Tiled, dove un
  // oggetto aggiunto fuori da Tiled verrebbe cancellato al prossimo export.
  // Quando una scena è definitiva, meglio comunque un vero trigger_cutscene
  // piazzato in Tiled (vedi docs/GUIDA-CUTSCENE.md) — questa tabella resta
  // per i casi rapidi/di prova. Chiave = chiave mappa in MAPPE.
  const CUTSCENE_SPAWN = {
    'borgata_tuscolana': 'demo_vicino_curioso',
  };
  let npcSprites       = [];
  let npcStato         = [];   // stato dinamico di NPC e trainer (movimento, direzione)
  let massiSprites     = [];
  let massiStato        = [];   // stato dinamico dei massi spingibili (MN Forza): {id, tx, ty, sprite}
  let frameCount       = 0;    // contatore frame per i timer di movimento NPC
  let trainerBattuti   = new Set();
  let trainerSpotting  = false;   // un trainer ti ha visto e ti sta raggiungendo
  let transizioneAttiva = false;
  let eventoVicino     = null;

  // Incontri selvatici: 15% per casella d'erba alta, con una "tregua" di alcuni
  // passi dopo ogni incontro per evitare scontri uno-dietro-l'altro.
  const PROB_INCONTRO = 15;     // probabilità % per passo su erba alta/acqua
  const PASSI_TREGUA  = 4;      // passi senza incontri dopo uno scontro
  let cooldownIncontro = 0;

  let spaceWasDown     = false;
  let btnInteragisci   = null;

  const NPC_SPRITE_DIR = 'sprites/npc e trainer per claude/';

  // Alias per nomi sprite usati nelle mappe ma senza file dedicato: li mappiamo
  // su sprite già esistenti (sostituibili quando ci sarà l'arte definitiva).
  const ALIAS_SPRITE = {
    'ARQUEOLOGA': 'trainer_RUINMANIAC',   // archeologo delle rovine
    'NPC_31': 'NPC 23', 'NPC_32': 'NPC 24', 'NPC_33': 'NPC 25',
    'NPC_34': 'NPC 26', 'NPC_35': 'NPC 27', 'NPC_36': 'NPC 28', 'NPC_37': 'NPC 29',
    'CAMPIONE_SOLITARIO': 'trainer_CHAMPION',  // Il Solitario (boschetto segreto)
    'NPC_GUARDIA': 'NPC 16',                    // guardiano del boschetto
    // ⭐ TUTTO il Team GdF (grunt, admin, capi) usa questo sprite (riservato: il
    // pool casuale di fallback NON lo usa mai). Era "NPC 20", cambiato in "NPC 01"
    // (sess. 8 set 2026, richiesta di Luca): NPC 20 non ha un vero ciclo di
    // cammino nel foglio sprite, dava l'effetto "fluttua" su ogni mappa del
    // gioco dove compare un GdF, non solo alla Grotta del Vulcano.
    'GDF_GRUNT_SPRITE': 'NPC 01',
    // ⭐ TUTTO il Team CoTrAL (grunt, luogotenente, capi) usa "NPC 24" (riservato,
    // stesso trattamento del GdF: tolto dal pool casuale, vedi POOL_NPC_RANDOM).
    // NON "NPC 22": è già la faccia di Adriano il Porchettaro (Ariccia), sarebbe
    // strano che un grunt CoTrAL avesse la stessa faccia del porchettaro amico.
    'COTRAL_GRUNT_SPRITE': 'NPC 24',
    'NPC_MONACO': 'NPC 16',                       // monaco dell'Abbazia
    'NPC_50': 'NPC 19', 'NPC_51': 'NPC 24', 'NPC_52': 'NPC 25',
    'NPC_53': 'NPC 26', 'NPC_54': 'NPC 27',
  };

  // Sprite riservati a GdF e CoTrAL (mai usati dal fallback casuale).
  const SPRITE_GDF = 'NPC 20';
  const SPRITE_COTRAL = 'NPC 24';
  // Pool di sprite "filler" ESISTENTI per il fallback casuale (escluso NPC 20/24).
  const POOL_NPC_RANDOM = [
    'NPC 01','NPC 02','NPC 03','NPC 04','NPC 05','NPC 06','NPC 07','NPC 08','NPC 09',
    'NPC 10','NPC 11','NPC 12','NPC 13','NPC 14','NPC 15','NPC 16','NPC 17','NPC 18',
    'NPC 19','NPC 21','NPC 22','NPC 25','NPC 26','NPC 27','NPC 28',
  ];
  // Uno sprite è "da personaggio della storia" (NON va randomizzato se manca il file):
  // leader, rivale, professore, campioni, boss, leggendari, GdF, CoTrAL.
  function isSpriteStoria(nome) {
    return /leader|champion|campione|rival|brendan|professore|castagno|boss|solitario|gdf|cotral|prof_/i.test(String(nome || ''));
  }
  // Scelta DETERMINISTICA di uno sprite filler in base all'id (stabile tra ricariche).
  function spriteRandomPerId(id) {
    let h = 0; const s = String(id || 'npc');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return POOL_NPC_RANDOM[h % POOL_NPC_RANDOM.length];
  }

  // Leggendari piazzati sulle mappe (type "pokemon leggendario"): nome specie → ID
  // e ID → nome. Lo sprite mostrato è quello PokéAPI (front), così non servono
  // sprite overworld dedicati.
  const LEG_NOME_ID = {
    snorlax: 143,
    articuno: 144, zapdos: 145, moltres: 146, mewtwo: 150, mew: 151,
    raikou: 243, entei: 244, suicune: 245, lugia: 249, 'ho-oh': 250, hooh: 250, celebi: 251,
    regirock: 377, regice: 378, registeel: 379, latias: 380, latios: 381,
    kyogre: 382, groudon: 383, rayquaza: 384, jirachi: 385, deoxys: 386,
  };
  const LEG_ID_NOME = {
    143: 'Snorlax',
    144: 'Articuno', 145: 'Zapdos', 146: 'Moltres', 150: 'Mewtwo', 151: 'Mew',
    243: 'Raikou', 244: 'Entei', 245: 'Suicune', 249: 'Lugia', 250: 'Ho-Oh', 251: 'Celebi',
    377: 'Regirock', 378: 'Regice', 379: 'Registeel', 380: 'Latias', 381: 'Latios',
    382: 'Kyogre', 383: 'Groudon', 384: 'Rayquaza', 385: 'Jirachi', 386: 'Deoxys',
  };
  function legIdDaEv(ev) {
    if (ev.props.pokemon_id) return parseInt(ev.props.pokemon_id, 10) || null;
    const nome = String(ev.props.sprite || ev.props.pokemon || ev.props.specie || '')
      .toLowerCase().trim();
    return LEG_NOME_ID[nome] || null;
  }

  /* ══════════════════════════════════════════════════════════
     SCENA PHASER
     ══════════════════════════════════════════════════════════ */

  class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
      for (const [key, path] of Object.entries(TILESET_IMMAGINI)) {
        this.load.image(key, path);
      }
      // Sprite del giocatore: base (player-red/player-girl-red) + varianti per
      // Corsa (tasto dedicato), Bicicletta e Surf (32×48, stessa griglia) e
      // Pesca (96×80, frame più grandi per contenere la canna). Vedi
      // SPRITE_PLAYER più sotto per la mappa genere → texture.
      const FRAME_NORMALE = { frameWidth: 32, frameHeight: 48 };
      const FRAME_BICI     = { frameWidth: 48, frameHeight: 48 };
      const FRAME_PESCA    = { frameWidth: 96, frameHeight: 80 };
      for (const genere of Object.keys(SPRITE_PLAYER)) {
        const s = SPRITE_PLAYER[genere];
        this.load.spritesheet(s.normale, `sprites/${s.normale}.png`, FRAME_NORMALE);
        this.load.spritesheet(s.run,     `sprites/${s.run}.png`,     FRAME_NORMALE);
        this.load.spritesheet(s.bike,    `sprites/${s.bike}.png`,    FRAME_BICI);
        this.load.spritesheet(s.surf,    `sprites/${s.surf}.png`,    FRAME_NORMALE);
        this.load.spritesheet(s.fish,    `sprites/${s.fish}.png`,    FRAME_PESCA);
      }
      // Masso spingibile (puzzle MN Forza): un solo frame statico, si sposta
      // di casella in casella quando il giocatore ci cammina contro con la MN.
      this.load.spritesheet('obj-masso', 'sprites/NO/Characters/Object boulder.png',
        { frameWidth: 32, frameHeight: 32 });
      // PROBLEMA 4b: "cavalcatura" sotto il personaggio durante il Surf
      // (Graphics/Characters/base_surf di Essentials — stessa griglia 4x4 del
      // personaggio: colonna = fotogramma, riga = direzione down/left/right/up
      // nello stesso ordine di SPRITE_PLAYER). Vedi _aggiornaMountSurf().
      this.load.spritesheet('base-surf', 'sprites/base_surf.png', { frameWidth: 64, frameHeight: 64 });
    }

    // Carica un tileset "diviso" (Outside.png, Emerald_Outside.png) a fette da
    // SPLIT_ROW righe e crea una texture canvas per ciascuna fetta
    // (keyBase-0, keyBase-1, …). Registra il numero di fette in splitParts.
    async _caricaTilesetSplit(name) {
      const meta = TILESET_META[name];
      if (!meta || !meta.split) return;
      if (splitParts[name]) return;   // già caricato

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((ok, ko) => {
        img.onload = ok;
        img.onerror = ko;
        img.src = meta.src;
      });

      const w = img.width;
      const sliceH = SPLIT_ROW * meta.th;                 // altezza fetta in px
      const parts  = Math.ceil(img.height / sliceH);      // n. fette necessarie

      for (let i = 0; i < parts; i++) {
        const key = meta.keyBase + '-' + i;
        if (!this.textures.exists(key)) {
          const y = i * sliceH;
          const h = Math.min(sliceH, img.height - y);
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, y, w, h, 0, 0, w, h);
          const tex = this.textures.addCanvas(key, cv);
          // Le texture create con addCanvas NON ereditano sempre il filtro
          // NEAREST globale (antialias:false nel config del gioco) — a
          // differenza delle immagini caricate con this.load.image(). Senza
          // questo, alcuni tile di questi tileset "a fette" (Outside.png,
          // Emerald_Outside.png) uscivano sfocati/"sgranati" (segnalato da
          // Luca su un albero a Grottaferrata) mentre i tileset non divisi
          // (Caves, Sea, ecc., caricati normalmente) restavano nitidi.
          if (tex && tex.setFilter) tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }
      }
      splitParts[name] = parts;
    }

    create() {
      scena = this;

      // Il ciclo di camminata (4 frame) deve completarsi nel tempo di DUE
      // passi, non uno: come nell'originale Essentials (Game_Character.rb,
      // pattern_update_speed — "two frames are shown per movement across one
      // tile"), i piedi cambiano posa a metà del ritmo del movimento, non a
      // ogni casella. Un frame-rate per modalità, ognuno sincronizzato alla
      // propria durata di passo (normale/corsa/bici), altrimenti quando si
      // corre o si va in bici i piedi restavano al ritmo della camminata.
      const FRAME_RATE_CAMMINATA = 4 * 1000 / (DURATA_PASSO_MS * 2);
      const FRAME_RATE_CORSA     = 4 * 1000 / (DURATA_PASSO_CORSA_MS * 2);
      const FRAME_RATE_BICI      = 4 * 1000 / (DURATA_PASSO_BICI_MS * 2);

      const mkAnim = (key, frameArr, frameRate = 8) => {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers('player-red', { frames: frameArr }),
          frameRate, repeat: -1,
        });
      };
      mkAnim('idle-down',  [1]);
      mkAnim('walk-down',  [0, 1, 2, 3], FRAME_RATE_CAMMINATA);
      mkAnim('idle-left',  [5]);
      mkAnim('walk-left',  [4, 5, 6, 7], FRAME_RATE_CAMMINATA);
      mkAnim('idle-right', [9]);
      mkAnim('walk-right', [8, 9, 10, 11], FRAME_RATE_CAMMINATA);
      mkAnim('idle-up',    [13]);
      mkAnim('walk-up',    [12, 13, 14, 15], FRAME_RATE_CAMMINATA);

      // Animazioni del giocatore per GENERE e MODALITÀ (normale/corsa/bici/surf):
      // stessa griglia 4×4 di 'player-red' (down,left,right,up), solo texture
      // diversa. La Pesca ha solo una posa ferma per direzione (niente ciclo
      // di cammino) e — verificato guardando lo sprite — l'ordine delle righe
      // è up,left,right,down anziché down,left,right,up.
      const GRUPPI_DIREZIONE = [
        ['down',  [0, 1, 2, 3]],
        ['left',  [4, 5, 6, 7]],
        ['right', [8, 9, 10, 11]],
        ['up',    [12, 13, 14, 15]],
      ];
      const GRUPPI_DIREZIONE_PESCA = [
        ['up',    [0, 1, 2, 3]],
        ['left',  [4, 5, 6, 7]],
        ['right', [8, 9, 10, 11]],
        ['down',  [12, 13, 14, 15]],
      ];
      // Frame-rate per modalità (il Surf non ha una durata di passo dedicata:
      // si muove alla stessa velocità della camminata normale, come in Essentials).
      const FRAME_RATE_PER_VARIANTE = {
        normale: FRAME_RATE_CAMMINATA, run: FRAME_RATE_CORSA,
        bike: FRAME_RATE_BICI, surf: FRAME_RATE_CAMMINATA,
      };
      for (const genere of Object.keys(SPRITE_PLAYER)) {
        const s = SPRITE_PLAYER[genere];
        for (const variante of ['normale', 'run', 'bike', 'surf']) {
          const tex = s[variante];
          for (const [dir, frames] of GRUPPI_DIREZIONE) {
            this.anims.create({
              key: `${genere}-${variante}-idle-${dir}`,
              frames: this.anims.generateFrameNumbers(tex, { frames: [frames[1]] }),
              frameRate: 8, repeat: -1,
            });
            this.anims.create({
              key: `${genere}-${variante}-walk-${dir}`,
              frames: this.anims.generateFrameNumbers(tex, { frames }),
              frameRate: FRAME_RATE_PER_VARIANTE[variante], repeat: -1,
            });
          }
        }
        // Pesca: solo posa ferma per direzione, nessun ciclo di cammino
        for (const [dir, frames] of GRUPPI_DIREZIONE_PESCA) {
          this.anims.create({
            key: `${genere}-fish-idle-${dir}`,
            frames: this.anims.generateFrameNumbers(s.fish, { frames: [frames[1]] }),
            frameRate: 1, repeat: -1,
          });
        }
      }

      this.cursors  = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      // Corsa: SHIFT tenuto premuto (equivalente del tasto B del Game Boy).
      // Bicicletta: tasto B, si indossa/toglie solo se posseduta (zaino oggetti chiave).
      // Canna da pesca: tasto P, mostra solo la posa (nessun incontro, per ora).
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.biciKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
      this.pescaKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ]);
      this.moveCD = 0;

      // Genere scelto dal giocatore a inizio partita (schermata iniziale in
      // app.js): determina quale set di sprite usare. Default 'boy' se manca
      // (salvataggi vecchi, o se la schermata non è ancora stata mostrata).
      genereGiocatore = (typeof stato !== 'undefined' && stato.genere === 'girl') ? 'girl' : 'boy';

      this.input.on('wheel', (_p, _g, _dx, dy) => {
        const z = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(z - dy * 0.003, 1, 6));
      });

      this._collegaDpad();

      btnInteragisci = document.getElementById('btn-interagisci');
      if (btnInteragisci) {
        btnInteragisci.addEventListener('click', () => {
          if (eventoVicino && !bloccato) this._interagisci(eventoVicino);
        });
      }

      // Animazione acqua (tileset "Sea"): avanza il fotogramma ogni 450ms,
      // stesso ritmo delle rive Pokémon Essentials. Il timer resta vivo per
      // tutta la scena; le celle da animare cambiano a ogni cambio mappa
      // (vedi _registraAcquaAnimata/_pulisciLayers).
      this.time.addEvent({ delay: 450, loop: true, callback: () => this._animaAcqua() });

      // I tileset divisi (Outside/Emerald) vengono caricati al volo da caricaMappa
      // quando una mappa li usa: qui avviamo la prima mappa, OPPURE riprendiamo
      // dall'ultima casella salvata (stato.mappaSalvata, scritto da
      // salvaPartitaOra() via posizioneAttualeSalvabile). Partita nuova =
      // niente salvataggio = si parte comunque da Borgata Tuscolana.
      //
      // Se l'ultima posizione era dentro un interno, ripristiniamo PRIMA lo
      // stack di ritorno (stato.mappaStackSalvata): senza, l'uscita da quella
      // mappa non saprebbe più dove riportarti (bug corretto su segnalazione
      // di Luca — prima si restava bloccati dentro per sempre).
      if (typeof stato !== 'undefined' && Array.isArray(stato.mappaStackSalvata)) {
        ripristinaStack(stato.mappaStackSalvata);
      }
      const ripresa = (typeof stato !== 'undefined') ? stato.mappaSalvata : null;
      if (ripresa && ripresa.chiave && MAPPE[ripresa.chiave]) {
        // Riprendi lo stato Surf salvato (PROBLEMA 4a): prima si riapriva
        // sempre "a terra" anche se il salvataggio era stato fatto in acqua.
        stavaSurfando = !!ripresa.surfando;
        this.caricaMappa(ripresa.chiave, ripresa.tx, ripresa.ty);
      } else {
        this.caricaMappa('borgata_tuscolana');
      }
    }

    /* ────────── CARICAMENTO MAPPA ────────── */

    // Punto d'ingresso unico: smista tra mappa singola e cluster (mappe .world
    // continue, vedi js/clusters.js). Tutto il resto del motore (movimento,
    // collisioni, camera, spawn, NPC…) lavora su mapW/mapH/collGrid/eventiMappa
    // senza sapere se sono di una mappa sola o di un cluster fuso insieme.
    async caricaMappa(chiave, arrivoX, arrivoY, spawnId, sourceKey) {
      const def = MAPPE[chiave];
      if (!def) { console.error('[Map] Mappa sconosciuta:', chiave); return; }

      this._pulisciLayers();
      bloccato = true;

      try {
        const nomeCluster = trovaCluster(chiave);
        if (nomeCluster) {
          clusterAttivo = null;   // azzerato finché il caricamento non è completo
          await this._caricaCluster(nomeCluster, chiave, arrivoX, arrivoY, spawnId, sourceKey);
        } else {
          clusterAttivo = null; clusterOriginX = 0; clusterOriginY = 0; clusterBoxes = {};
          await this._caricaMappaSingola(chiave, def, arrivoX, arrivoY, spawnId, sourceKey);
        }
        if (typeof mostraNomeMappa === 'function') mostraNomeMappa(nomeVisualizzatoMappa(chiave));
      } catch (err) {
        console.error('[Map] Errore caricamento mappa:', chiave, err);
      }

      // Da qui in poi il movimento resta sospeso finché il giocatore non
      // rilascia TUTTI i tasti direzionali almeno una volta (vedi update()):
      // tenere premuta la direzione con cui si è entrati nel warp non deve
      // far ripartire subito il cammino sulla mappa nuova.
      attesaRilascioDirezione = true;
      ultimaDirezionePremuta = null;

      bloccato = false;
    }

    // Carica UNA mappa (comportamento originale, invariato): mapW/mapH/collGrid/
    // eventiMappa descrivono solo quella mappa, in coordinate locali.
    async _caricaMappaSingola(chiave, def, arrivoX, arrivoY, spawnId, sourceKey) {
      const resp = await fetch(def.file);
      const tmj  = await resp.json();

      mapW      = tmj.width;
      mapH      = tmj.height;
      tileSize  = tmj.tilewidth;
      mappaCorrente = chiave;
      mappaInfo = { ...def, mapW, mapH };
      if (mappaInfo.interno) biciAttiva = false;   // niente bici in edifici/interni (punto 9)

      // Segna la città come "visitata" (sblocca la destinazione per la MN Volo)
      const comune = MAPPA_COMUNE[chiave];
      if (comune && typeof stato !== 'undefined' && Array.isArray(stato.cittaVisitate) &&
          !stato.cittaVisitate.includes(comune)) {
        stato.cittaVisitate.push(comune);
      }

      const tilesets = parseTilesets(tmj);
      tmj.__bloccaVuoti = !!def.bloccaVuoti;
      collGrid      = buildCollGrid(tmj);
      eventiMappa   = parseEventi(tmj);
      luciMappa     = parseLuci(tmj);
      acquaSurf     = _buildSurfTiles(tmj, eventiMappa);
      erbaAltaAuto  = _buildErbaAltaTiles(tmj);
      erbaAltaIdPerMappa = { [chiave]: _erbaAltaIdMappa(eventiMappa) };
      ghiaccioTiles = _buildIceTiles(tmj);
      muroNordTiles = _buildMuroNordTiles(tmj);
      // Di norma si riparte sempre "a terra" — l'eccezione è la ripresa da
      // salvataggio fatto in Surf (PROBLEMA 4a): stavaSurfando è un flag
      // "una tantum", consumato subito così i prossimi warp/porte tornano al
      // comportamento normale.
      surfAttivo    = stavaSurfando;
      stavaSurfando = false;

      // Carica a fette i tileset "alti" usati da questa mappa (Outside/Emerald)
      for (const ts of tilesets) {
        if (ts.split) await this._caricaTilesetSplit(ts.name);
      }

      const LAYER_NAMES  = ['ground', 'deco_sotto', 'deco_sott', 'edifici', 'sopra_testa'];
      const LAYER_DEPTHS = { ground: 0, deco_sotto: 1, deco_sott: 1, edifici: 2, sopra_testa: 50 };

      for (const tileLayer of tmj.layers.filter(l => l.type === 'tilelayer')) {
        const lName = tileLayer.name.toLowerCase().replace(/\s+/g, '_');
        let matchName = LAYER_NAMES.find(n => lName.includes(n));
        if (!matchName && lName.includes('livello')) matchName = 'ground';
        const depth = matchName ? (LAYER_DEPTHS[matchName] ?? 1) : 1;

        for (const ts of tilesets) {
          this._renderTileLayer(tileLayer.data, ts, depth, mapW, mapH, 0, 0);
        }
      }

      this._ripristinaOggettiRaccolti();
      this._applicaPorteScomparse();

      // ── Scelta del punto di spawn (Fix 3) ──
      // Priorità: spawn che combacia (per spawn_id o per mappa di provenienza)
      //         > arrivo_x/arrivo_y espliciti > primo spawn presente
      //         > spawn di default del registro > centro mappa.
      let sx, sy;
      const spawnMatch = this._trovaSpawn(spawnId, sourceKey, false);
      if (spawnMatch) {
        sx = spawnMatch.tx; sy = spawnMatch.ty;
      } else if (arrivoX !== undefined && arrivoY !== undefined) {
        sx = arrivoX; sy = arrivoY;
      } else if (def.spawn) {
        // Caricamento iniziale (senza warp): punto di partenza della mappa
        sx = def.spawn.tx; sy = def.spawn.ty;
      } else {
        const spawnQualsiasi = this._trovaSpawn(null, null, true);
        if (spawnQualsiasi) { sx = spawnQualsiasi.tx; sy = spawnQualsiasi.ty; }
        else { sx = Math.floor(mapW / 2); sy = Math.floor(mapH / 2); }
      }

      // Sicurezza: se per qualunque motivo lo spawn finisse fuori mappa, riportalo
      // dentro (così il giocatore non resta invisibile/bloccato fuori dai bordi).
      if (sx < 0 || sx >= mapW || sy < 0 || sy >= mapH) {
        sx = Math.floor(mapW / 2); sy = Math.floor(mapH / 2);
      }
      // I warp sulla casella di spawn non scattano finché non ti sposti
      // (evita il loop "entro e vengo subito rispedito indietro").
      spawnGuard = { tx: sx, ty: sy };

      const zoom = (tileSize < 32) ? 4 : 2;
      this.cameras.main.setZoom(zoom);

      // Per mappe piccole: centra la mappa senza clamp ai bordi
      const camW = this.cameras.main.width / zoom;
      const camH = this.cameras.main.height / zoom;
      const mapPxW = mapW * tileSize;
      const mapPxH = mapH * tileSize;
      if (mapPxW < camW || mapPxH < camH) {
        this.cameras.main.setBounds(undefined, undefined, undefined, undefined);
      } else {
        this.cameras.main.setBounds(0, 0, mapPxW, mapPxH);
      }

      this._posizionaPlayer(sx, sy);
      this._creaNpcStato();
      await this._creaSpritesNPC();
      this._creaLeggendari();
      this._creaCompagniPokemon();
      this._creaMassi();
      this._creaSpritesMassi();
      this._creaLuci();
      this._riapriCancelliPulsante();

      this._aggiornaLatLon();
      this._aggiornaEventoVicino();
      this._aggiornaVeloTempo();
      this._aggiornaVeloMeteo();
      this._controllaCutsceneSpawn();
    }

    // Carica un intero CLUSTER (js/clusters.js) come una "mappa virtuale" unica:
    // fonde tutte le mappe membro in mapW/mapH/collGrid/eventiMappa (shiftate
    // sull'origine del cluster), poi le renderizza ciascuna al proprio offset.
    // "chiaveEntrata" è la mappa membro su cui il giocatore sta effettivamente
    // comparendo (quella passata al warp/porta che ha portato qui).
    async _caricaCluster(nomeCluster, chiaveEntrata, arrivoX, arrivoY, spawnId, sourceKey) {
      const cluster = CLUSTERS[nomeCluster];
      const chiavi  = Object.keys(cluster.mappe);

      // Bounding box del cluster in tile (coordinate reali del .world), per
      // calcolare l'origine da sottrarre a tutti gli offset (li porta vicino
      // allo zero, come per una mappa singola che parte da 0,0).
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const k of chiavi) {
        const b = cluster.mappe[k];
        minX = Math.min(minX, b.offsetX); minY = Math.min(minY, b.offsetY);
        maxX = Math.max(maxX, b.offsetX + b.w); maxY = Math.max(maxY, b.offsetY + b.h);
      }

      if (chiavi.length > 8 || (maxX - minX) * (maxY - minY) > 60000) {
        console.warn(`[Cluster] '${nomeCluster}' è grande (${chiavi.length} mappe, ` +
          `${maxX - minX}×${maxY - minY} tile): lo carico comunque, ma valutare in ` +
          `futuro una gestione dinamica (non tutte le mappe caricate insieme).`);
      }

      // Fetch di tutti i .tmj del cluster in parallelo.
      const tmjPerChiave = {};
      await Promise.all(chiavi.map(async k => {
        const resp = await fetch(MAPPE[k].file);
        tmjPerChiave[k] = await resp.json();
      }));

      clusterOriginX = minX;
      clusterOriginY = minY;
      clusterBoxes   = {};
      mappaCorrente  = chiaveEntrata;

      mapW     = maxX - minX;
      mapH     = maxY - minY;
      tileSize = 32;   // tutti i cluster attuali usano tileset outdoor 32×32

      // REGOLA DEL VUOTO: tutto bloccato di default, poi "ritagliamo" le celle
      // davvero coperte da una mappa membro con la SUA collisione locale.
      collGrid = Array.from({ length: mapH }, () => new Uint8Array(mapW).fill(1));
      eventiMappa = [];
      luciMappa = [];
      const surfSetGlobale = new Set();
      const erbaSetGlobale = new Set();
      const ghiaccioSetGlobale = new Set();
      erbaAltaIdPerMappa = {};
      const tuttiTilesets  = new Set();
      const infoPerChiave  = {};

      for (const k of chiavi) {
        const tmj = tmjPerChiave[k];
        const box = cluster.mappe[k];
        const offX = box.offsetX - minX;
        const offY = box.offsetY - minY;

        const tilesets = parseTilesets(tmj);
        for (const ts of tilesets) tuttiTilesets.add(ts.name);

        tmj.__bloccaVuoti = !!(MAPPE[k] && MAPPE[k].bloccaVuoti);
        const collLocale   = buildCollGrid(tmj);
        const eventiLocali = parseEventi(tmj);
        const luciLocali   = parseLuci(tmj);
        for (const luce of luciLocali) {
          luciMappa.push({
            x: luce.x + offX * tmj.tilewidth,
            y: luce.y + offY * tmj.tileheight,
            colore: luce.colore,
          });
        }
        const surfLocali   = _buildSurfTiles(tmj, eventiLocali);
        const erbaLocale   = _buildErbaAltaTiles(tmj);
        const ghiaccioLocale = _buildIceTiles(tmj);
        erbaAltaIdPerMappa[k] = _erbaAltaIdMappa(eventiLocali);

        for (let r = 0; r < tmj.height; r++) {
          const rigaGlob = collGrid[offY + r];
          if (!rigaGlob) continue;
          for (let c = 0; c < tmj.width; c++) {
            if (offX + c >= 0 && offX + c < mapW) rigaGlob[offX + c] = collLocale[r][c];
          }
        }

        for (const ev of eventiLocali) {
          const evG = { ...ev, _mappaChiave: k };
          evG.tx += offX; evG.ty += offY;
          evG.x  += offX * tmj.tilewidth; evG.y += offY * tmj.tileheight;
          if (ev.tx0 !== undefined) {
            evG.tx0 += offX; evG.tx1 += offX;
            evG.ty0 += offY; evG.ty1 += offY;
          }
          eventiMappa.push(evG);
        }

        for (const s of surfLocali) {
          const [lx, ly] = s.split(',').map(Number);
          surfSetGlobale.add((lx + offX) + ',' + (ly + offY));
        }
        for (const s of erbaLocale) {
          const [lx, ly] = s.split(',').map(Number);
          erbaSetGlobale.add((lx + offX) + ',' + (ly + offY));
        }
        for (const s of ghiaccioLocale) {
          const [lx, ly] = s.split(',').map(Number);
          ghiaccioSetGlobale.add((lx + offX) + ',' + (ly + offY));
        }

        clusterBoxes[k]  = { offsetX: offX, offsetY: offY, w: tmj.width, h: tmj.height };
        infoPerChiave[k] = { tmj, tilesets, offX, offY };
        // NOTA: "città visitata" (MN Volo) si marca SOLO per la mappa in cui il
        // giocatore compare davvero (sotto, dopo lo spawn) o quando ci cammina
        // fisicamente sopra (vedi _sposta): caricare il cluster non deve marcare
        // come visitate città che il giocatore non ha ancora raggiunto, solo
        // perché condividono il file .world con quella di ingresso.
      }

      acquaSurf    = surfSetGlobale;
      erbaAltaAuto = erbaSetGlobale;
      ghiaccioTiles = ghiaccioSetGlobale;
      muroNordTiles = new Set();   // feature solo interni (Grotta del Vulcano), mai nei cluster outdoor
      // Vedi _caricaMappaSingola: stessa logica, stavaSurfando "una tantum"
      // per la ripresa da salvataggio in Surf (PROBLEMA 4a).
      surfAttivo   = stavaSurfando;
      stavaSurfando = false;

      for (const name of tuttiTilesets) {
        const meta = TILESET_META[name];
        if (meta && meta.split) await this._caricaTilesetSplit(name);
      }

      const LAYER_NAMES  = ['ground', 'deco_sotto', 'deco_sott', 'edifici', 'sopra_testa'];
      const LAYER_DEPTHS = { ground: 0, deco_sotto: 1, deco_sott: 1, edifici: 2, sopra_testa: 50 };

      // Depth PER TIPO di layer (non per mappa): così gli alberi/edifici di una
      // mappa non finiscono mai sopra il player quando è nella mappa accanto.
      for (const k of chiavi) {
        const { tmj, tilesets, offX, offY } = infoPerChiave[k];
        const offPxX = offX * tileSize;
        const offPxY = offY * tileSize;

        for (const tileLayer of tmj.layers.filter(l => l.type === 'tilelayer')) {
          const lName = tileLayer.name.toLowerCase().replace(/\s+/g, '_');
          let matchName = LAYER_NAMES.find(n => lName.includes(n));
          if (!matchName && lName.includes('livello')) matchName = 'ground';
          const depth = matchName ? (LAYER_DEPTHS[matchName] ?? 1) : 1;

          for (const ts of tilesets) {
            this._renderTileLayer(tileLayer.data, ts, depth, tmj.width, tmj.height, offPxX, offPxY);
          }
        }
      }

      this._ripristinaOggettiRaccolti();
      this._applicaPorteScomparse();

      clusterAttivo = nomeCluster;   // da qui in poi il cluster è "attivo" a tutti gli effetti

      // Segna come "visitata" SOLO la città della mappa di ingresso (il player ci
      // compare davvero); le altre mappe del cluster si marcano quando ci si
      // cammina sopra fisicamente (vedi _sposta → _mappaSottoGiocatore).
      const comuneEntrata = MAPPA_COMUNE[chiaveEntrata];
      if (comuneEntrata && typeof stato !== 'undefined' && Array.isArray(stato.cittaVisitate) &&
          !stato.cittaVisitate.includes(comuneEntrata)) {
        stato.cittaVisitate.push(comuneEntrata);
      }

      // ── Punto di spawn (stessa priorità della mappa singola, ma ristretta
      // prima alla mappa membro di ingresso, per non pescare lo spawn "default"
      // di un'altra mappa dello stesso cluster). ──
      const boxEntrata = clusterBoxes[chiaveEntrata];
      let sx, sy;
      const spawnMatch = this._trovaSpawn(spawnId, sourceKey, false, chiaveEntrata);
      if (spawnMatch) {
        sx = spawnMatch.tx; sy = spawnMatch.ty;
      } else if (arrivoX !== undefined && arrivoY !== undefined) {
        sx = boxEntrata.offsetX + arrivoX; sy = boxEntrata.offsetY + arrivoY;
      } else if (MAPPE[chiaveEntrata].spawn) {
        sx = boxEntrata.offsetX + MAPPE[chiaveEntrata].spawn.tx;
        sy = boxEntrata.offsetY + MAPPE[chiaveEntrata].spawn.ty;
      } else {
        const spawnQualsiasi = this._trovaSpawn(null, null, true, chiaveEntrata);
        if (spawnQualsiasi) { sx = spawnQualsiasi.tx; sy = spawnQualsiasi.ty; }
        else { sx = boxEntrata.offsetX + Math.floor(boxEntrata.w / 2); sy = boxEntrata.offsetY + Math.floor(boxEntrata.h / 2); }
      }
      if (sx < 0 || sx >= mapW || sy < 0 || sy >= mapH) {
        sx = boxEntrata.offsetX + Math.floor(boxEntrata.w / 2);
        sy = boxEntrata.offsetY + Math.floor(boxEntrata.h / 2);
      }
      spawnGuard = { tx: sx, ty: sy };

      mappaInfo = { ...MAPPE[chiaveEntrata], mapW: boxEntrata.w, mapH: boxEntrata.h };
      if (mappaInfo.interno) biciAttiva = false;   // niente bici in edifici/interni (punto 9)

      // Camera sul bounding box dell'INTERO cluster (Parte 4): nessun ricalcolo
      // quando il player attraversa una cucitura interna.
      this.cameras.main.setZoom(2);
      this.cameras.main.setBounds(0, 0, mapW * tileSize, mapH * tileSize);

      this._posizionaPlayer(sx, sy);
      this._creaNpcStato();
      await this._creaSpritesNPC();
      this._creaLeggendari();
      this._creaCompagniPokemon();
      this._creaMassi();
      this._creaSpritesMassi();
      this._creaLuci();
      this._riapriCancelliPulsante();

      this._aggiornaLatLon();
      this._aggiornaEventoVicino();
      this._aggiornaVeloTempo();
      this._aggiornaVeloMeteo();
      this._controllaCutsceneSpawn();

      this._diagnosticaWarpInerti(nomeCluster);
    }

    // Renderizza UN layer-tile di UNA mappa (gestisce sia tileset normali che
    // "divisi" in fette) alla posizione (offPxX, offPxY) nello spazio di gioco.
    // Con offPxX=offPxY=0 e wLocal/hLocal = mapW/mapH è il comportamento di
    // sempre per una mappa singola.
    _renderTileLayer(data1d, ts, depth, wLocal, hLocal, offPxX, offPxY) {
      if (ts.split) {
        this._renderSplitLayer(data1d, ts, depth, wLocal, hLocal, offPxX, offPxY);
        return;
      }
      const data2d = [];
      let hasTiles = false;
      for (let r = 0; r < hLocal; r++) {
        const row = [];
        for (let c = 0; c < wLocal; c++) {
          const gid = data1d[r * wLocal + c];
          if (gid >= ts.firstgid && gid < ts.nextGid) {
            row.push(gid - ts.firstgid);
            hasTiles = true;
          } else {
            row.push(-1);
          }
        }
        data2d.push(row);
      }
      if (!hasTiles) return;

      const map = this.make.tilemap({ data: data2d, tileWidth: ts.tw, tileHeight: ts.th });
      const tileset = map.addTilesetImage('ts', ts.key, ts.tw, ts.th, 0, 0);
      const layer = map.createLayer(0, tileset);
      if (layer) {
        if (ts.tw !== tileSize) layer.setScale(tileSize / ts.tw);
        if (offPxX || offPxY) layer.setPosition(offPxX, offPxY);
        layer.setDepth(depth);
        layerObjects.push({ layer, lo: 0, depth });
        if (ts.name === 'Sea') this._registraAcquaAnimata(layer, data2d);
        else if (CASCATA_TILESETS.includes(ts.name)) this._registraCascataAnimata(layer, data2d);
        else if (FIORI_TILESETS.includes(ts.name)) this._registraFioriAnimati(layer, data2d);
        else if (ts.name === 'spiaggia_animata_onde') this._registraSpiaggiaAnimata(layer, data2d);
        else if (ts.name === 'lava_animata_v2') this._registraLavaAnimata(layer, data2d);
      }
    }

    // Registra le celle di un layer "Sea" per l'animazione (vedi acquaAnimTiles
    // in cima al file): per ogni tile piazzato calcola riga/posizione-nel-blocco
    // nel PNG del tileset, così _animaAcqua può far scorrere i fotogrammi. La
    // posizione mondo (wx,wy) è salvata una volta sola: serve a _animaAcqua per
    // capire quali celle sono a schermo, senza doverla ricalcolare ad ogni tick.
    _registraAcquaAnimata(layer, data2d) {
      for (let ty = 0; ty < data2d.length; ty++) {
        const row = data2d[ty];
        for (let tx = 0; tx < row.length; tx++) {
          const local = row[tx];
          if (local < 0) continue;
          const r   = Math.floor(local / 24);
          const pos = local % 24 % 3;
          if (r === 0 && pos === 1) continue;   // pezzo identico in tutti i fotogrammi: non serve riscriverlo
          const wx = layer.tileToWorldX(tx);
          const wy = layer.tileToWorldY(ty);
          acquaAnimTiles.push({ layer, tx, ty, r, pos, wx, wy, tipo: 'sea' });
        }
      }
    }

    // Registra le celle di un layer "Waterfall"/"Waterfall crest"/"Waterfall
    // bottom" (Percorso 5): tileset molto più semplice di Sea, solo 4 fotogrammi
    // in fila (nessuna variante di forma/bordo, sempre la stessa colonna
    // d'acqua) — basta far scorrere l'indice locale 0→1→2→3→0.
    _registraCascataAnimata(layer, data2d) {
      for (let ty = 0; ty < data2d.length; ty++) {
        const row = data2d[ty];
        for (let tx = 0; tx < row.length; tx++) {
          const local = row[tx];
          if (local < 0) continue;
          const wx = layer.tileToWorldX(tx);
          const wy = layer.tileToWorldY(ty);
          acquaAnimTiles.push({ layer, tx, ty, wx, wy, tipo: 'wf' });
        }
      }
    }

    // Registra le celle di un layer "spiaggia_animata_onde" (Lago di Albano/
    // Lago di Albano interno/Lago di Nemi): stesso principio autotile di
    // "Sea" (riga = forma del bordo, blocco di 3 colonne = un fotogramma),
    // ma qui ogni forma occupa un BLOCCO 3×3 (9 tile) invece di una singola
    // riga, e i fotogrammi sono 6 invece di 8 (18 colonne ÷ 3, non 24 ÷ 3).
    // La riga 0 del tileset è la legenda/anteprima di Tiled: non viene mai
    // piazzata su una mappa, quindi non serve escluderla esplicitamente.
    _registraSpiaggiaAnimata(layer, data2d) {
      for (let ty = 0; ty < data2d.length; ty++) {
        const row = data2d[ty];
        for (let tx = 0; tx < row.length; tx++) {
          const local = row[tx];
          if (local < 0) continue;
          const r   = Math.floor(local / 18);
          const pos = local % 18 % 3;
          const wx = layer.tileToWorldX(tx);
          const wy = layer.tileToWorldY(ty);
          acquaAnimTiles.push({ layer, tx, ty, r, pos, wx, wy, tipo: 'spiaggia' });
        }
      }
    }

    // Registra le celle di un layer "lava_animata_v2" (Grotta del Vulcano):
    // stesso principio di spiaggia_animata_onde, ma 48 colonne ÷ 3 = 16
    // fotogrammi invece di 6 (tileset più grande, bolle di lava più varie).
    _registraLavaAnimata(layer, data2d) {
      for (let ty = 0; ty < data2d.length; ty++) {
        const row = data2d[ty];
        for (let tx = 0; tx < row.length; tx++) {
          const local = row[tx];
          if (local < 0) continue;
          const r   = Math.floor(local / 48);
          const pos = local % 48 % 3;
          const wx = layer.tileToWorldX(tx);
          const wy = layer.tileToWorldY(ty);
          acquaAnimTiles.push({ layer, tx, ty, r, pos, wx, wy, tipo: 'lava' });
        }
      }
    }

    // Registra le celle di un layer "fiori_*_animati" (vedi FIORI_TILESETS):
    // stesso schema delle cascate, 8 fotogrammi in fila, indice locale
    // 0→1→…→7→0 in sync con acquaFrame (che già cicla su 8 valori).
    _registraFioriAnimati(layer, data2d) {
      for (let ty = 0; ty < data2d.length; ty++) {
        const row = data2d[ty];
        for (let tx = 0; tx < row.length; tx++) {
          const local = row[tx];
          if (local < 0) continue;
          const wx = layer.tileToWorldX(tx);
          const wy = layer.tileToWorldY(ty);
          acquaAnimTiles.push({ layer, tx, ty, wx, wy, tipo: 'fiori' });
        }
      }
    }

    // Timer chiamato periodicamente (vedi create()): fa avanzare il fotogramma
    // globale dell'acqua e riscrive le celle registrate VISIBILI in camera (più
    // un margine). Su cluster grandi (es. Castelli_lakes, più laghi uniti) le
    // celle acqua totali possono essere migliaia: riscriverle TUTTE ad ogni tick,
    // comprese quelle fuori schermo, blocca il thread principale abbastanza da
    // sembrare che il gioco si sia impallato — da qui il filtro sulla vista.
    _animaAcqua() {
      if (!acquaAnimTiles.length) return;
      // Contatore comune a 48 (mcm di 4/6/8/16, i vari cicli usati sotto): ogni
      // tipo applica il proprio modulo, così più tileset con un numero diverso
      // di fotogrammi restano tutti sincronizzati sullo stesso timer.
      acquaFrame = (acquaFrame + 1) % 48;
      const cam = this.cameras.main;
      const margine = 64;   // px, un paio di tile oltre il bordo schermo
      const vx0 = cam.worldView.x - margine, vx1 = cam.worldView.right + margine;
      const vy0 = cam.worldView.y - margine, vy1 = cam.worldView.bottom + margine;
      // Alcune celle (bordi/incroci acqua-cascata, es. Percorso 5) puntano a un
      // indice che Phaser non riesce a risolvere e lancia un'eccezione: presa
      // dentro update() dello scene loop, un errore non gestito qui blocca
      // l'INTERO gioco (rendering, movimento, tutto), non solo l'animazione —
      // da qui il try/catch: la cella "rotta" si salta invece di impallare
      // tutta la partita (segnalato dall'utente su Percorso 5, sessione 10 agosto).
      let scartate = null;
      for (const c of acquaAnimTiles) {
        if (c.wx < vx0 || c.wx > vx1 || c.wy < vy0 || c.wy > vy1) continue;
        const nuovoLocal = (c.tipo === 'wf') ? (acquaFrame % 4)
          : (c.tipo === 'fiori') ? (acquaFrame % 8)
          : (c.tipo === 'spiaggia') ? (c.r * 18 + (acquaFrame % 6) * 3 + c.pos)
          : (c.tipo === 'lava') ? (c.r * 48 + (acquaFrame % 16) * 3 + c.pos)
          : (c.r * 24 + (acquaFrame % 8) * 3 + c.pos);
        try {
          c.layer.putTileAt(nuovoLocal, c.tx, c.ty);
        } catch (e) {
          console.warn('[Acqua] Cella non animabile, la escludo:', c.tx, c.ty, e.message);
          (scartate || (scartate = [])).push(c);
        }
      }
      if (scartate) acquaAnimTiles = acquaAnimTiles.filter(c => !scartate.includes(c));
    }

    // Diagnostica (solo console, F12): elenca i warp/uscita resi inerti da un
    // cluster (Parte 6) che risultano ancora bloccanti — da sistemare in Tiled.
    _diagnosticaWarpInerti(nomeCluster) {
      const problemi = [];
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'uscita' && ev.tipo !== 'warp') continue;
        const destChiave = risolviMappa(ev.props && ev.props.destinazione);
        if (!destChiave || trovaCluster(destChiave) !== nomeCluster) continue;   // non è una cucitura

        const box = clusterBoxes[ev._mappaChiave];
        const celle = (ev.tx0 !== undefined)
          ? (() => { const arr = []; for (let ty = ev.ty0; ty <= ev.ty1; ty++) for (let tx = ev.tx0; tx <= ev.tx1; tx++) arr.push({ tx, ty }); return arr; })()
          : [{ tx: ev.tx, ty: ev.ty }];

        for (const c of celle) {
          if (collGrid[c.ty] && collGrid[c.ty][c.tx] === 1) {
            const localTx = box ? c.tx - box.offsetX : c.tx;
            const localTy = box ? c.ty - box.offsetY : c.ty;
            problemi.push(`${ev._mappaChiave} (${localTx}, ${localTy})`);
          }
        }
      }
      if (problemi.length) {
        console.warn(`[Cluster] '${nomeCluster}': warp resi inerti ma ancora bloccanti ` +
          `(da sistemare in Tiled — terreno non calpestabile sulla vecchia casella warp):`, problemi);
      }
    }

    /* ────────── SPAWN / DIREZIONI ────────── */

    // Normalizza una direzione (italiano/inglese) in nord|sud|est|ovest
    _normDir(d) {
      const m = {
        sud: 'sud', down: 'sud', s: 'sud',
        nord: 'nord', up: 'nord', n: 'nord',
        est: 'est', right: 'est', e: 'est',
        ovest: 'ovest', left: 'ovest', o: 'ovest', w: 'ovest',
      };
      return m[String(d || '').toLowerCase()] || 'sud';
    }

    // Direzione → animazione del player-sheet (up/down/left/right)
    _faceAnim(dir) {
      return { nord: 'up', sud: 'down', est: 'right', ovest: 'left' }[dir] || 'down';
    }

    // Frame base nello spritesheet NPC (32×48, righe: sud/ovest/est/nord)
    _npcFrameBase(dir) {
      return { sud: 0, ovest: 4, est: 8, nord: 12 }[dir] ?? 0;
    }

    // Crea (una sola volta per texture, cache su this._npcAnimCache) le 4
    // animazioni di cammino sud/ovest/est/nord per una texture NPC, con la
    // STESSA griglia 32×48 a 4 colonne × 4 righe del player-sheet. Le anim
    // sono chiavate col texKey così non si mischiano mai fra sprite diversi
    // (a differenza delle anim del player, che sono legate a 'player-red').
    _assicuraAnimNpc(texKey) {
      if (!this._npcAnimCache) this._npcAnimCache = {};
      if (this._npcAnimCache[texKey]) return;
      this._npcAnimCache[texKey] = true;
      // Ciclo di cammino completo (4 frame) nel tempo di DUE passi NPC (170ms
      // ciascuno), come per il player: stesso "peso" visivo del passo.
      const FRAME_RATE_CAMMINATA_NPC = 4 * 1000 / (170 * 2);
      const GRUPPI = [
        ['sud', [0, 1, 2, 3]], ['ovest', [4, 5, 6, 7]],
        ['est', [8, 9, 10, 11]], ['nord', [12, 13, 14, 15]],
      ];
      for (const [dir, frames] of GRUPPI) {
        const key = `npc-${texKey}-walk-${dir}`;
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(texKey, { frames }),
            frameRate: FRAME_RATE_CAMMINATA_NPC, repeat: -1,
          });
        }
      }
    }

    // Imposta il frame/animazione giusta SULLA TEXTURE DELL'NPC. In cammino
    // fa girare il vero ciclo a 4 frame (come il player), non un singolo
    // frame statico alternato (che dava l'effetto "vola" invece di camminare).
    _setNpcFrame(spr, dir, camminando) {
      if (!spr) return;
      const base = this._npcFrameBase(dir);
      if (camminando) {
        const texKey = spr.texture && spr.texture.key;
        if (texKey) {
          this._assicuraAnimNpc(texKey);
          const key = `npc-${texKey}-walk-${dir}`;
          if (!spr.anims || !spr.anims.isPlaying || !spr.anims.currentAnim || spr.anims.currentAnim.key !== key) {
            try { spr.play(key); } catch (_) { try { spr.setFrame(base); } catch (_) {} }
          }
          return;
        }
      }
      if (spr.anims && spr.anims.isPlaying) spr.anims.stop();
      try { spr.setFrame(base + 1); } catch (_) {}
    }

    // Direzione → delta tile
    _dirDelta(dir) {
      return ({
        nord: { dx: 0, dy: -1 }, sud: { dx: 0, dy: 1 },
        est: { dx: 1, dy: 0 }, ovest: { dx: -1, dy: 0 },
      })[dir] || { dx: 0, dy: 0 };
    }

    // Da una stringa di pattuglia ("NS", "EO", ecc.) a un ciclo di direzioni
    _dirCiclo(raw) {
      const s = String(raw || '').toLowerCase();
      if (s === 'ns' || s === 'sn') return ['nord', 'sud'];
      if (s === 'eo' || s === 'oe' || s === 'ew' || s === 'we') return ['est', 'ovest'];
      return null;
    }

    // Cerca lo spawn giusto fra gli oggetti spawn della mappa corrente.
    // Gestisce sia "spawn" che il refuso "spwan". In modalità cluster,
    // "soloMappa" restringe la ricerca alla mappa membro di ingresso (per non
    // pescare uno spawn "default" di un'ALTRA mappa dello stesso cluster);
    // se non trova nulla lì, ripiega sulla ricerca nell'intero cluster.
    _trovaSpawn(spawnId, sourceKey, permettiPrimo, soloMappa) {
      const centro = (ev) => ({
        tx: (ev.tx0 !== undefined) ? Math.floor((ev.tx0 + ev.tx1) / 2) : ev.tx,
        ty: (ev.ty0 !== undefined) ? Math.floor((ev.ty0 + ev.ty1) / 2) : ev.ty,
      });

      // Ignora gli spawn FUORI dai limiti della mappa: capita di lasciare in Tiled
      // oggetti orfani (es. dopo aver ridimensionato la mappa) e atterrarci sopra
      // significherebbe spawnare il giocatore fuori schermo, invisibile e bloccato.
      let spawns = eventiMappa
        .filter(e => e.tipo === 'spawn' || e.tipo === 'spwan')
        .filter(e => {
          const c = centro(e);
          return c.tx >= 0 && c.tx < mapW && c.ty >= 0 && c.ty < mapH;
        });
      // Se è richiesta una mappa precisa (soloMappa), la restrizione vale
      // SEMPRE, anche a lista vuota — MAI ripiegare silenziosamente su uno
      // spawn di un'ALTRA mappa del cluster (bug reale trovato sess. 19 set
      // 2026: un singolo spawn "invisibile" a runtime su frascati_centro
      // faceva atterrare il giocatore sul primo spawn di TUTTO il cluster,
      // cioè quello di Percorso 3 — che non c'entrava niente). Con la lista
      // vuota si passa null al chiamante, che ha il suo fallback più
      // localizzato (centro della mappa giusta), mai una mappa a caso.
      if (soloMappa) {
        spawns = spawns.filter(s => s._mappaChiave === soloMappa);
      }
      if (spawns.length === 0) return null;

      // 1) spawn_id esplicito (match esatto)
      if (spawnId) {
        const ns = normTxt(spawnId);
        const m = spawns.find(s => normTxt(s.id) === ns);
        if (m) return centro(m);
        // 1b) match tollerante: uno contiene l'altro (gestisce nomi non allineati
        //     tipo spawn_id "da_frascati_sud" ↔ spawn "Da Frascati")
        if (ns.length > 3) {
          const f = spawns.find(s => {
            const si = normTxt(s.id);
            return si.length > 3 && (si.includes(ns) || ns.includes(si));
          });
          if (f) return centro(f);
        }
      }
      // 2) spawn il cui id cita la mappa di provenienza
      if (sourceKey) {
        const tokens = [normTxt(sourceKey)];
        if (MAPPE[sourceKey]) tokens.push(nomeMappaDaFile(MAPPE[sourceKey].file));
        const m = spawns.find(s => {
          const ns = normTxt(s.id);
          return tokens.some(t => t && t.length > 3 && (ns.includes(t) || t.includes(ns)));
        });
        if (m) return centro(m);
      }
      // 3) spawn di default
      const def = spawns.find(s => normTxt(s.id) === 'default');
      if (def) return centro(def);
      // 4) primo spawn (solo se richiesto)
      if (permettiPrimo) return centro(spawns[0]);
      return null;
    }

    /* ────────── STATO NPC / TRAINER (Fix 4) ────────── */

    _creaNpcStato() {
      // Auto-sincronizza osservatorio_confronto_attivo da camilla_invito_vista
      // PRIMA di decidere chi è visibile: serve per i salvataggi già esistenti
      // prima che questo flag esistesse (avevano solo camilla_invito_vista=true,
      // mai passato di qui) — va fatto qui, non solo nel trigger, altrimenti
      // Camilla/i grunt restano invisibili fino al prossimo _rigeneraNpc()
      // anche dopo che il flag si è auto-sincronizzato altrove (bug, sess. 17
      // set 2026, scoperto correggendo la visibilità gate→premio).
      if (typeof stato !== 'undefined' && stato.flags &&
          stato.flags.camilla_invito_vista && !stato.flags.osservatorio_confronto_vista) {
        stato.flags.osservatorio_confronto_attivo = true;
      }
      // Stesso self-heal per il boss finale del 2F (sess. 18 set 2026): il
      // boss + le sue comparse (ricercatori/grunt) sono visibili da quando
      // il CoTrAL è scoperto fino a quando non lo batti — niente gate,
      // condizione unica gestita a mano per evitare lo stesso bug di prima.
      if (typeof stato !== 'undefined' && stato.flags &&
          stato.flags.osservatorio_cotral_scoperto && !stato.flags.osservatorio_boss_finale_sconfitto &&
          stato.flags.osservatorio_boss_area_attiva === undefined) {
        stato.flags.osservatorio_boss_area_attiva = true;
      }
      npcStato = [];
      for (const ev of eventiMappa) {
        const isLeg = (ev.tipo === 'pokemon leggendario' || ev.tipo === 'leggendario');
        const isLegAmbientale = (ev.tipo === 'leggendario_ambientale');
        if (ev.tipo !== 'npc' && ev.tipo !== 'trainer' && !isLeg && !isLegAmbientale) continue;

        // Leggendario "ambientale" (es. Latios/Latias nel Tunnel Roccioso 4F,
        // sessione 6 agosto): solido come un NPC normale, ma NON interagibile
        // via [A] (non passa da _eventoInCasella) — serve solo come scenografia
        // finché una scena dedicata (es. avviaLatiosLatiasScena) non lo rimuove
        // per sempre. Una volta "scappati" (flag), non ricompare più qui: da
        // quel momento diventano roaming (vedi _checkRoamingLatiosLatias).
        if (isLegAmbientale) {
          const legId = legIdDaEv(ev);
          if (!legId) continue;
          if ((legId === 380 || legId === 381) && typeof stato !== 'undefined' && stato.flags && stato.flags.latiosLatiasRoaming) continue;
          if ((legId === 243 || legId === 244 || legId === 245) && typeof stato !== 'undefined' && stato.flags && stato.flags.caniLeggendariRoaming) continue;
          npcStato.push({
            ev, tipo: 'leggendario_ambientale', id: ev.id || '',
            legId, tx: ev.tx, ty: ev.ty, homeTx: ev.tx, homeTy: ev.ty,
            dir: 'sud', movimento: 'fisso', sprite: null,
          });
          continue;
        }

        // Leggendario sulla mappa (es. i Regi negli antri): solido + interagibile.
        // Sparisce se già catturato o scomparso. Lo sprite è quello PokéAPI.
        if (isLeg) {
          const cond = ev.props.condizione || ev.props.richiede;
          if (cond && !verificaCondizione(cond).ok) continue;
          const legId = legIdDaEv(ev);
          if (!legId) continue;
          if ((typeof legCatturato === 'function' && legCatturato(legId)) ||
              (typeof legScomparso === 'function' && legScomparso(legId))) continue;
          // "addormentato" (es. Snorlax): blocca il passaggio ma NON si può
          // sfidare finché non lo svegli con l'oggetto giusto (default: flauto).
          const addormentato = ev.props.addormentato === true || ev.props.addormentato === 'true';
          npcStato.push({
            ev, tipo: 'leggendario', id: ev.id || '',
            legId, livello: parseInt(ev.props.livello || '50', 10) || 50,
            tx: ev.tx, ty: ev.ty, homeTx: ev.tx, homeTy: ev.ty,
            dir: this._normDir(ev.props.direzione), movimento: 'fisso',
            patuglia: false, dirCiclo: ['sud'], cicloIdx: 0, raggio: 0,
            timer: 0, sprite: null, inMovimento: false,
            addormentato, svegliaCon: ev.props.sveglia_con || 'flauto',
          });
          continue;
        }

        // NPC/trainer condizionati:
        //  - "gate": è un BLOCCO → compare SOLO finché la condizione NON è soddisfatta
        //    (es. guardiano che sparisce quando hai finito la Lega).
        //  - altrimenti è un personaggio "premio" → compare SOLO quando la condizione È vera
        //    (es. Il Solitario post-Lega, l'NPC che appare dopo la sua sconfitta).
        const cond = ev.props.condizione || ev.props.richiede;
        if (cond) {
          const isGate = (ev.props.gate === true || ev.props.gate === 'true');
          // MODALITA_TEST: i gate (blocchi) non fermano mai il giocatore, per
          // poter testare le mappe senza dover soddisfare le condizioni reali
          // (es. medaglie). I "premio" (compaiono solo se la condizione è
          // vera) restano invariati: non è quello che serve testare qui.
          // ECCEZIONE (noTestBypass:true): gate che fanno parte di una scena/
          // cerchio narrativo (es. Rocca di Papa "Baso è via") — se sparissero
          // sempre in test non si potrebbe testare la scena stessa che li usa.
          const niega = (ev.props.noTestBypass === true || ev.props.noTestBypass === 'true');
          const bypassTest = isGate && !niega && typeof MODALITA_TEST !== 'undefined' && MODALITA_TEST;
          const ok = bypassTest ? true : verificaCondizione(cond).ok;
          if (isGate ? ok : !ok) continue;   // gate sparisce se ok; premio appare solo se ok
        }
        // Il campione SPECIALE, una volta sconfitto, sparisce (resta l'NPC post-battaglia)
        if (ev.tipo === 'trainer' && (ev.props.speciale === true || ev.props.speciale === 'true')) {
          const battuto = trainerBattuti.has(ev.id) ||
            (stato.allenatoriBattuti && stato.allenatoriBattuti.includes(ev.id));
          if (battuto) continue;
        }

        const dirCiclo = this._dirCiclo(ev.props.direzione);
        const patuglia = ev.props.pattuglia === true || ev.props.pattuglia === 'true' ||
                         ev.props.patuglia === true || ev.props.patuglia === 'true';
        let dir = this._normDir(ev.props.direzione);
        if (patuglia && dirCiclo) dir = dirCiclo[0];

        npcStato.push({
          ev,
          tipo: ev.tipo,
          id: ev.id || '',
          tx: ev.tx, ty: ev.ty,
          homeTx: ev.tx, homeTy: ev.ty,
          dir,
          movimento: String(ev.props.movimento || 'fisso').toLowerCase(),
          patuglia: !!(patuglia && dirCiclo),
          dirCiclo: dirCiclo || ['nord', 'sud'],
          cicloIdx: 0,
          raggio: parseInt(ev.props.raggio || '3', 10),
          timer: Math.floor(Math.random() * 75),   // sfasa i timer per non muoverli all'unisono
          sprite: null,
          inMovimento: false,
        });
      }
    }

    /* ══════════════════════════════════════════════════════════
       MASSI SPINGIBILI (puzzle MN Forza — sess. 37)
       Oggetto Tiled type:"masso" (id univoco). Solido finché non lo spingi
       camminandoci contro CON la MN Forza: si sposta di una casella nella
       direzione in cui lo spingi, se la casella oltre è libera. La posizione
       spostata NON è persistita: lasciando la stanza (warp) e rientrando, il
       puzzle si resetta e i massi tornano alla posizione originale di Tiled
       (sess. 6 agosto, richiesta esplicita — i pulsanti/cancelli collegati
       restano invece permanenti, vedi _controllaPulsante).
       ══════════════════════════════════════════════════════════ */

    _creaMassi() {
      massiStato = [];
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'masso') continue;
        // Chiave con prefisso mappa (solo per i log/debug ora: la posizione
        // NON è più persistita, vedi sotto). L'id Tiled grezzo non basterebbe
        // comunque, perché non è univoco fra mappe diverse.
        const id = `masso_${ev._mappaChiave || mappaCorrente}_${ev.id != null ? ev.id : ev.tx + '_' + ev.ty}`;
        // Il puzzle si resetta ogni volta che si lascia la stanza (uscendo con
        // un warp e rientrando, o cambiando piano): i massi tornano SEMPRE
        // alla posizione originale di Tiled, non c'è persistenza in stato.
        massiStato.push({ id, chiave: id, tx: ev.tx, ty: ev.ty, sprite: null });

        // Il level designer ha dipinto a mano il masso anche come tile nel
        // layer "edifici" (GID fisso) alla stessa cella dell'oggetto Tiled,
        // in aggiunta allo sprite dinamico 'obj-masso' creato sopra da
        // _creaSpritesMassi(). Va rimosso SEMPRE, anche se il masso non è mai
        // stato spinto in questa sessione: altrimenti resta un "fantasma"
        // dipinto sulla cella originale ogni volta che la mappa si ricarica
        // (entrando/uscendo dalla stanza), indipendentemente da dove si trova
        // davvero il masso adesso.
        this._pulisciTileFantasmaMasso(ev.tx, ev.ty, ev._mappaChiave);
      }
      if (massiStato.length > 0) {
        console.log('[Masso] ricreati (posizione originale):', massiStato.map(m => `${m.id}@${m.tx},${m.ty}`));
      }
    }

    // Rimuove il GID dipinto a mano nel layer "edifici" (depth 2) alla cella
    // (tx,ty) DICHIARATA in Tiled per l'oggetto masso — coordinate globali,
    // convertite in locali-al-layer se la mappa fa parte di un cluster.
    _pulisciTileFantasmaMasso(tx, ty, mappaChiave) {
      let lx = tx, ly = ty;
      if (clusterAttivo && mappaChiave && clusterBoxes[mappaChiave]) {
        const box = clusterBoxes[mappaChiave];
        lx = tx - box.offsetX; ly = ty - box.offsetY;
      }
      for (const o of layerObjects) {
        if (o.depth !== 2) continue; // 2 = depth del layer "edifici" (vedi LAYER_DEPTHS)
        if (o.layer && typeof o.layer.removeTileAt === 'function') o.layer.removeTileAt(lx, ly);
      }
    }

    _creaSpritesMassi() {
      for (const m of massiStato) {
        const px = m.tx * tileSize + tileSize / 2;
        const py = (m.ty + 1) * tileSize;
        const spr = this.add.sprite(px, py, 'obj-masso', 0).setOrigin(0.5, 1).setDepth(15);
        if (tileSize < 32) spr.setScale(tileSize / 32);
        m.sprite = spr;
        massiSprites.push(spr);
      }
    }

    // Punti luce del layer "luci" (finestre/lampioni): due cerchi per punto
    // (bagliore largo e tenue + nucleo piccolo e pieno), colorati dalla
    // proprietà "colore" dell'oggetto Tiled. Nascosti finché non è notte
    // (vedi _aggiornaVisibilitaLuci, richiamata da _aggiornaVeloTempo).
    _creaLuci() {
      if (this._luciSprites) {
        for (const s of this._luciSprites) s.destroy();
      }
      this._luciSprites = [];
      for (const luce of luciMappa) {
        let colore = 0xffd27f;
        try { colore = Phaser.Display.Color.HexStringToColor(luce.colore).color; } catch (e) {}
        const bagliore = this.add.circle(luce.x, luce.y, 22, colore, 0.5).setDepth(60);
        const nucleo   = this.add.circle(luce.x, luce.y, 7, colore, 0.9).setDepth(61);
        this._luciSprites.push(bagliore, nucleo);
      }
      this._aggiornaVisibilitaLuci();
    }

    // Le luci sono visibili SOLO di notte (fascia 'notte'), e mai negli interni
    // (dentro le case/palestre/Centri la luce è già "accesa" di suo, non serve
    // il layer luci — che oggi comunque esiste solo su mappe esterne).
    _aggiornaVisibilitaLuci() {
      if (!this._luciSprites || this._luciSprites.length === 0) return;
      const def = MAPPE[mappaCorrente];
      if (!def || def.interno) {
        for (const s of this._luciSprites) s.setVisible(false);
        return;
      }
      const minuti = (typeof stato !== 'undefined' && stato.tempo) ? stato.tempo.minuti : 480;
      const visibili = this._fasciaVisiva(minuti) === 'notte';
      for (const s of this._luciSprites) s.setVisible(visibili);
    }

    // Una casella è libera per un masso? (bordi, collisione vera, altri massi,
    // NPC/trainer, giocatore) — NON considera l'acqua surfabile: i massi non
    // galleggiano, un masso non può mai finire in acqua.
    _liberoPerMasso(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return false;
      if (collGrid && collGrid[ty] && collGrid[ty][tx] === 1) return false;
      if (acquaSurf && acquaSurf.has(tx + ',' + ty)) return false;
      if (tx === posTile.tx && ty === posTile.ty) return false;
      for (const o of npcStato) if (o.tx === tx && o.ty === ty) return false;
      for (const m of massiStato) if (m.tx === tx && m.ty === ty) return false;
      return true;
    }

    // Il giocatore prova a camminare CONTRO un masso in (tx,ty), spostandosi in
    // direzione (dx,dy). Ritorna true se il masso si è spostato (quindi il
    // giocatore può avanzare in questo stesso passo), false se è rimasto fermo
    // (masso bloccato, o niente MN Forza: il giocatore NON avanza).
    _provaSpingiMasso(masso, dx, dy) {
      const haOggetto = (typeof stato !== 'undefined' && stato.mn && stato.mn.forza);
      // OGGETTO e PERMESSO separati (CLAUDE.md, tabella MN): l'oggetto lo dai
      // già a Rocca di Papa (cutscene "Baso è via"), ma il PERMESSO d'uso
      // resta legato alla Medaglia Stella di Monte Porzio — prima questo
      // controllo mancava, quindi Forza si poteva usare subito, senza aver
      // battuto quella palestra (segnalato da Luca).
      const haPermesso = (typeof stato !== 'undefined' && stato.medaglie &&
        stato.medaglie.includes('monte-porzio'));
      if (!haOggetto || !haPermesso) {
        if (typeof mostraToast === 'function') {
          mostraToast(haOggetto
            ? '🔒 Devi prima battere la Palestra di Monte Porzio per usare Forza.'
            : '🔒 Serve la MN Forza per spingere questo masso.', 2200);
        }
        return false;
      }
      const ntx = masso.tx + dx, nty = masso.ty + dy;
      if (!this._liberoPerMasso(ntx, nty)) return false;

      if (typeof mostraToast === 'function') {
        mostraToast(`${this._nomeGiocatore()} usa Forza!`, 1800);
      }
      masso.tx = ntx; masso.ty = nty;
      if (masso.sprite) {
        const px = ntx * tileSize + tileSize / 2;
        const py = (nty + 1) * tileSize;
        this.tweens.add({ targets: masso.sprite, x: px, y: py, duration: DURATA_PASSO_MS, ease: 'Linear' });
      }
      // Nessuna persistenza in stato: la posizione vive solo in massiStato
      // (in memoria), quindi lasciando la stanza (warp) e rientrando il
      // masso torna alla posizione originale di Tiled (vedi _creaMassi).
      console.log('[Masso]', masso.chiave, '->', ntx, nty);
      this._controllaPulsante(ntx, nty);
      return true;
    }

    // Un masso è appena arrivato su (tx,ty): se lì c'è un pulsante a pressione,
    // attivalo (permanente) e — se TUTTI i pulsanti collegati a un cancello
    // (property "collega"/"attivato_da" del cancello, lista separata da
    // virgole per i cancelli a più pulsanti) sono ormai attivi — libera la
    // collisione E fa sparire il tile disegnato a mano sopra quel cancello
    // (stessa tecnica di Taglio/Spaccaroccia, ma qui è permanente: il
    // ricontrollo avviene ad ogni caricamento mappa in _riapriCancelliPulsante,
    // non solo "in sessione" come per gli alberi).
    _controllaPulsante(tx, ty) {
      const pulsante = eventiMappa.find(ev => ev.tipo === 'pulsante' && ev.tx === tx && ev.ty === ty);
      if (!pulsante) return;
      const idPuls = pulsante.id || pulsante.props.id;
      if (!idPuls || typeof stato === 'undefined') return;
      if (!stato.flags) stato.flags = {};
      const flagKey = 'pulsante_' + idPuls;
      const giaAttivo = !!stato.flags[flagKey];
      stato.flags[flagKey] = true;

      for (const ev of eventiMappa) {
        if (ev.tipo !== 'cancello_pulsante') continue;
        const idsRichiesti = String(ev.props.attivato_da || ev.props.collega || '')
          .split(',').map(s => s.trim()).filter(Boolean);
        if (!idsRichiesti.includes(idPuls)) continue;
        const tuttiAttivi = idsRichiesti.every(id => stato.flags['pulsante_' + id]);
        if (!tuttiAttivi) continue;   // mancano ancora altri pulsanti dello stesso cancello

        const libera = (cx, cy) => { if (collGrid[cy]) collGrid[cy][cx] = 0; };
        const celle = [];
        if (ev.w > 0 && ev.h > 0) {
          for (let r = ev.ty0; r <= ev.ty1; r++)
            for (let c = ev.tx0; c <= ev.tx1; c++) { libera(c, r); celle.push([c, r]); }
        } else {
          libera(ev.tx, ev.ty); celle.push([ev.tx, ev.ty]);
        }
        for (const [cx, cy] of celle) this._nascondiTileOstacolo(cx, cy);
        if (!giaAttivo && typeof mostraToast === 'function')
          mostraToast('🔘 Clang! Un varco si è aperto in lontananza...', 2500);
      }
      if (typeof salvaPartita === 'function') salvaPartita();
    }

    // Richiamata a ogni caricamento mappa (dopo il rendering dei layer tile):
    // se un cancello_pulsante è già del tutto attivo da una sessione
    // precedente (stato.flags persistente), il tile va tenuto nascosto anche
    // al rientro nella stanza — buildCollGrid già libera la collisione da
    // solo, qui serve solo far sparire di nuovo la grafica.
    _riapriCancelliPulsante() {
      if (typeof stato === 'undefined' || !stato.flags) return;
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'cancello_pulsante') continue;
        const idsRichiesti = String(ev.props.attivato_da || ev.props.collega || '')
          .split(',').map(s => s.trim()).filter(Boolean);
        if (idsRichiesti.length === 0) continue;
        const tuttiAttivi = idsRichiesti.every(id => stato.flags['pulsante_' + id]);
        if (!tuttiAttivi) continue;
        if (ev.w > 0 && ev.h > 0) {
          for (let r = ev.ty0; r <= ev.ty1; r++)
            for (let c = ev.tx0; c <= ev.tx1; c++) this._nascondiTileOstacolo(c, r);
        } else {
          this._nascondiTileOstacolo(ev.tx, ev.ty);
        }
      }
    }

    // Ricrea NPC, leggendari e relativi sprite (dopo un cambio di flag che ne
    // altera la visibilità: es. dopo aver sconfitto Il Solitario o catturato un Regi).
    // async e AWAITATA nei chiamanti che concatenano un'azione dopo (es. una
    // cutscene): _creaSpritesNPC/_creaLeggendari caricano texture in modo
    // asincrono, quindi due _rigeneraNpc() ravvicinate senza await si
    // accavallavano — la prima, ancora "in volo", finiva di creare uno
    // sprite orfano DOPO che la seconda aveva già svuotato npcSprites,
    // quindi quello sprite non veniva mai distrutto (il bug della "copia
    // dello scienziato che rimane nella stanza" segnalato da Luca).
    async _rigeneraNpc() {
      for (const s of npcSprites) { try { s.destroy(); } catch (_) {} }
      npcSprites = [];
      this._creaNpcStato();
      await this._creaSpritesNPC();
      await this._creaLeggendari();
      await this._creaCompagniPokemon();
    }

    // Mostra i leggendari (type "pokemon leggendario"/"leggendario_ambientale",
    // es. Latios/Latias) con lo sprite OVERWORLD del pacchetto follower (sess.
    // 8 set 2026, richiesta esplicita di Luca — prima usavano il fronte di
    // battaglia da PokéAPI stirato, che sembrava fuori posto su una mappa),
    // SEMPRE rivolti a sud, frame fermo (nessuno di questi si muove/cammina
    // sul posto). _caricaTexFollower riconosce la specie dal nome inglese
    // (PokeAPI.getPokemon(legId).nome) — se quella specie non è coperta dal
    // pacchetto, ripiega sul vecchio fronte di battaglia PokéAPI così non
    // resta mai invisibile.
    async _creaLeggendari() {
      if (typeof PokeAPI === 'undefined') return;
      for (const st of npcStato) {
        if ((st.tipo !== 'leggendario' && st.tipo !== 'leggendario_ambientale') || st.sprite) continue;

        let nomeSpecie = null;
        try { const pkm = await PokeAPI.getPokemon(st.legId); nomeSpecie = pkm && pkm.nome; }
        catch (e) { /* offline o non in cache */ }

        const texKey = nomeSpecie ? await this._caricaTexFollower(nomeSpecie) : null;
        if (texKey) {
          const px = st.tx * tileSize + tileSize / 2;
          const py = (st.ty + 1) * tileSize;
          const spr = this.add.sprite(px, py, texKey, 1).setOrigin(0.5, 1).setDepth(20);   // frame 1 = sud, fermo
          const frameW = this.textures.get(texKey).get(0).width || 64;
          spr.setScale((tileSize * 1.4) / frameW);
          st.sprite = spr;
          npcSprites.push(spr);
          continue;
        }

        // Ripiego: specie non coperta dal pacchetto follower → vecchio
        // fronte di battaglia PokéAPI, come prima di questa sessione.
        let url = null;
        try { const pkm = await PokeAPI.getPokemon(st.legId); url = pkm && pkm.sprite && pkm.sprite.fronte; }
        catch (e) { /* offline o non in cache: niente sprite */ }
        if (!url) continue;
        const key = 'leg-' + st.legId;
        if (!this.textures.exists(key)) {
          await new Promise((ok) => {
            this.load.image(key, url);
            this.load.once('complete', ok);
            this.load.once('loaderror', ok);
            this.load.start();
          });
        }
        if (!this.textures.exists(key)) continue;
        const px = st.tx * tileSize + tileSize / 2;
        const py = (st.ty + 1) * tileSize;
        const spr = this.add.image(px, py, key).setOrigin(0.5, 1).setDepth(20);
        const img = this.textures.get(key).getSourceImage();
        const dim = Math.max(img.width || 96, img.height || 96);
        spr.setScale((tileSize * 1.7) / dim);
        st.sprite = spr;
        npcSprites.push(spr);
      }
    }

    // Personaggi importanti (capipalestra ecc.) con il loro Pokémon più forte
    // FISSO al fianco, fuori dalla Ball — sess. 19 set 2026, richiesta
    // esplicita di Luca. Opt-in per allenatore: DATI_TRAINER[id].pokemonFianco
    // = true (di norma sui capipalestra). Il "più forte" è per convenzione
    // di progetto l'ULTIMO della squadra (l'asso, es. "Rhydon (asso)" nei
    // commenti di dati/trainer.js) — stessa idea del core Superquattro.
    // Stesso sprite del follower del giocatore (_caricaTexFollower), fermo,
    // rivolto a sud, un passo a destra dell'allenatore. Chiamata sempre
    // insieme a _creaLeggendari() (stessa vita: creata a ogni caricamento
    // mappa/_rigeneraNpc, distrutta con gli altri npcSprites).
    async _creaCompagniPokemon() {
      if (typeof PokeAPI === 'undefined' || typeof DATI_TRAINER === 'undefined') return;
      for (const st of npcStato) {
        if (st.tipo !== 'trainer' || !st.id) continue;
        const dati = DATI_TRAINER[st.id];
        if (!dati || !dati.pokemonFianco || !dati.squadra || !dati.squadra.length) continue;
        const asso = dati.squadra[dati.squadra.length - 1];

        let nomeSpecie = null;
        try { const pkm = await PokeAPI.getPokemon(asso.id); nomeSpecie = pkm && pkm.nome; }
        catch (e) { /* offline o non in cache: niente compagno stavolta */ }
        if (!nomeSpecie) continue;

        const texKey = await this._caricaTexFollower(nomeSpecie);
        if (!texKey) continue;

        const offsetTx = (dati.pokemonFiancoOffset && dati.pokemonFiancoOffset.dx) ?? 1;
        const offsetTy = (dati.pokemonFiancoOffset && dati.pokemonFiancoOffset.dy) ?? 0;
        const px = (st.tx + offsetTx) * tileSize + tileSize / 2;
        const py = (st.ty + offsetTy + 1) * tileSize;
        const spr = this.add.sprite(px, py, texKey, 1).setOrigin(0.5, 1).setDepth(20);   // frame 1 = sud, fermo
        const frameW = this.textures.get(texKey).get(0).width || 64;
        spr.setScale((tileSize * 1.4) / frameW);
        npcSprites.push(spr);
      }
    }

    // Prova a caricare la texture di uno sprite NPC; ritorna il texKey o null.
    // Gestisce alias, varianti spazio/underscore e il prefisso "trainer_".
    async _caricaTexNpc(spriteFile) {
      if (!spriteFile) return null;
      const alias = ALIAS_SPRITE[spriteFile] || ALIAS_SPRITE[spriteFile.replace(/\s+/g, '_')];
      if (alias) spriteFile = alias;

      const candidati = [spriteFile];
      if (spriteFile.indexOf('_') >= 0) candidati.push(spriteFile.replace(/_/g, ' '));
      if (spriteFile.indexOf(' ') >= 0) candidati.push(spriteFile.replace(/\s+/g, '_'));
      if (!/^trainer_|^npc/i.test(spriteFile)) candidati.push('trainer_' + spriteFile);

      const texKey = 'npc-' + spriteFile.replace(/\s+/g, '_');
      if (this.textures.exists(texKey)) return texKey;
      for (const nomeFile of candidati) {
        try {
          await new Promise((ok, ko) => {
            this.load.spritesheet(texKey, NPC_SPRITE_DIR + nomeFile + '.png',
              { frameWidth: 32, frameHeight: 48 });
            this.load.once('complete', ok);
            this.load.once('loaderror', ko);
            this.load.start();
          });
          return texKey;
        } catch (e) { /* prova il prossimo candidato */ }
      }
      return null;
    }

    /* ══════════════════════════════════════════════════════════
       FOLLOWER — il primo Pokémon della squadra ti segue sulla mappa.
       ══════════════════════════════════════════════════════════ */

    // Carica (o riusa dalla cache texture) lo sprite follower di una specie.
    // A differenza di _caricaTexNpc (griglia fissa 32×48), qui il foglio ha
    // dimensione VARIABILE secondo il Pokémon (256×256 per la maggior parte,
    // 512×512 per gli esemplari enormi come Wailord/Groudon nel pacchetto
    // usato) — sempre 4 colonne × 4 righe però, quindi si carica prima come
    // immagine intera, si legge la sua vera dimensione, e SOLO ALLORA si
    // ritagliano i 16 frame (texture.add, stessa numerazione 0-15 che userebbe
    // load.spritesheet: così _assicuraAnimNpc/_setNpcFrame — già scritti per
    // gli NPC — funzionano identici anche qui, nessun codice duplicato).
    // Ritorna il texKey, o null se il file per questa specie non esiste nel
    // pacchetto (specie non coperta): in quel caso il follower resta nascosto.
    async _caricaTexFollower(nomeSpecie) {
      if (!nomeSpecie) return null;
      const fileKey = nomeSpecie.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const texKey = 'follower-' + fileKey;
      if (this.textures.exists(texKey)) return texKey;

      try {
        await new Promise((ok, ko) => {
          this.load.image(texKey, `sprites/follower/${fileKey}.png`);
          this.load.once('complete', ok);
          this.load.once('loaderror', ko);
          this.load.start();
        });
      } catch (e) {
        return null;   // specie non coperta dal pacchetto follower
      }

      // Ritaglia i 16 frame (4×4) DENTRO la stessa texture appena caricata
      // (Texture.add, numerati 0-15 come farebbe load.spritesheet) — evita
      // di doverla ricaricare due volte con dimensione nota in anticipo,
      // visto che qui la scopriamo solo DOPO il caricamento.
      const tex = this.textures.get(texKey);
      const img = tex.getSourceImage();
      const fw = Math.floor((img.width || 256) / 4);
      const fh = Math.floor((img.height || 256) / 4);
      let i = 0;
      for (let riga = 0; riga < 4; riga++) {
        for (let col = 0; col < 4; col++) {
          tex.add(i, 0, col * fw, riga * fh, fw, fh);
          i++;
        }
      }
      return texKey;
    }

    // Controlla se lo squadra[0] è cambiato (cattura, scambio in Squadra,
    // evoluzione) e in tal caso ricarica lo sprite giusto. Chiamata dopo ogni
    // spawn/warp e ogni volta che la squadra potrebbe essere cambiata
    // (rigeneraFollower esposta in app.js per quei casi, es. dopo il Box).
    async _aggiornaFollowerSpecie() {
      // Override alleato attivo (Camilla all'Osservatorio): ignora squadra/
      // Pokémon, mostra sempre e solo questo sprite finché non viene tolto.
      if (followerAlleatoTexKey) {
        if (!followerSprite) return;
        if (followerSpecieId === followerAlleatoTexKey) return;
        const texKey = await this._caricaTexNpc(followerAlleatoTexKey);
        followerSpecieId = followerAlleatoTexKey;
        if (!texKey) { followerSprite.setVisible(false); return; }
        followerSprite.setTexture(texKey, this._npcFrameBase(followerPos.dir) + 1);
        this._aggiornaVisibilitaFollower();
        return;
      }
      if (typeof stato === 'undefined' || !stato.squadra || !stato.squadra.length || !followerSprite) {
        followerSpecieId = null;
        if (followerSprite) followerSprite.setVisible(false);
        return;
      }
      const capofila = stato.squadra[0];
      if (!capofila || capofila.uovo) {   // niente follower per un Uovo in squadra
        followerSpecieId = null;
        followerSprite.setVisible(false);
        return;
      }
      if (capofila.id === followerSpecieId) return;   // già la specie giusta

      // ist.nome (js/battle.js) è già tradotto in italiano (nomeBello) — per
      // il nome file del follower serve lo SLUG inglese originale di PokéAPI
      // (dati.nome in js/pokeapi.js), che NON viene salvato sull'istanza.
      // Rifetchando per id si legge dalla cache locale (già scaricata alla
      // creazione di questo stesso Pokémon), zero costo di rete reale.
      let nomeSpecie = null;
      try {
        const dati = (typeof PokeAPI !== 'undefined') ? await PokeAPI.getPokemon(capofila.id) : null;
        nomeSpecie = dati && dati.nome;
      } catch (e) { /* offline: niente follower per questa specie stavolta */ }
      const texKey = await this._caricaTexFollower(nomeSpecie);
      followerSpecieId = capofila.id;
      if (!texKey) { followerSprite.setVisible(false); return; }
      followerSprite.setTexture(texKey, this._npcFrameBase(followerPos.dir) + 1);
      this._aggiornaVisibilitaFollower();
    }

    // Attiva/disattiva l'override "alleato" del follower (Camilla
    // all'Osservatorio CoTrAL). Attivare: passa lo sprite file (stesso nome
    // usato in DATI_TRAINER, es. 'trainer_LEADER_Blaine'). Disattivare:
    // chiamare senza argomenti — torna a mostrare il Pokémon in squadra.
    async _impostaFollowerAlleato(spriteFile) {
      followerAlleatoTexKey = spriteFile || null;
      followerSpecieId = null;   // forza il ricaricamento della texture giusta
      await this._aggiornaFollowerSpecie();
    }

    // Mostra/nasconde il follower secondo la modalità attuale: MAI in
    // Bicicletta o mentre si Surfa (richiesta esplicita di Luca — troppo
    // veloce/incoerente da seguire a piedi), sempre visibile altrimenti
    // (corsa/interni compresi, come nei giochi veri).
    _aggiornaVisibilitaFollower() {
      if (!followerSprite) return;
      const nascondi = biciAttiva || surfAttivo || !followerSpecieId;
      followerSprite.setVisible(!nascondi);
    }

    // Crea/riposiziona il follower a ogni spawn/warp (chiamata da
    // _posizionaPlayer, l'unico punto dove si piazza davvero il giocatore).
    // Compare già dietro al giocatore, una casella nella direzione opposta a
    // quella verso cui è rivolto (se libera, altrimenti sulla stessa
    // casella — si sistema da solo al primo passo).
    async _posizionaFollower(tx, ty) {
      const dirGiocatore = this._normDir(facciata);
      const { dx, dy } = this._dirDelta(dirGiocatore);
      let ftx = tx - dx, fty = ty - dy;
      if (ftx < 0 || fty < 0 || ftx >= mapW || fty >= mapH ||
          (collGrid && collGrid[fty] && collGrid[fty][ftx] === 1)) {
        ftx = tx; fty = ty;
      }
      followerPos = { tx: ftx, ty: fty, dir: dirGiocatore };
      const px = ftx * tileSize + tileSize / 2;
      const py = (fty + 1) * tileSize;

      if (!followerSprite) {
        followerSprite = this.add.sprite(px, py, '__DEFAULT')
          .setOrigin(0.5, 1).setDepth(19).setVisible(false);   // depth 19: appena sotto gli NPC (20)
      } else {
        scena.tweens.killTweensOf(followerSprite);
        followerSprite.setPosition(px, py);
      }
      await this._aggiornaFollowerSpecie();
      this._aggiornaVisibilitaFollower();
    }

    // Fa fare al follower lo stesso passo appena completato dal giocatore,
    // portandolo sulla casella che il giocatore ha appena lasciato (tx,ty
    // PRECEDENTI all'aggiornamento di posTile) — lo stesso principio dei
    // giochi veri: il follower non ha un offset fisso, ricalca esattamente
    // il percorso del giocatore con un passo di ritardo, quindi segue
    // correttamente anche gli angoli. Se il follower è nascosto (bici/surf)
    // la posizione si aggiorna comunque, senza tween: risincronizzato e
    // pronto a ricomparire esattamente al passo giusto quando si smonta.
    _passoFollower(tx, ty) {
      if (!followerSprite || followerPos.tx === tx && followerPos.ty === ty) return;
      const dx = tx - followerPos.tx, dy = ty - followerPos.ty;
      const dir = (Math.abs(dx) >= Math.abs(dy))
        ? (dx > 0 ? 'est' : 'ovest') : (dy > 0 ? 'sud' : 'nord');
      followerPos = { tx, ty, dir };
      const px = tx * tileSize + tileSize / 2;
      const py = (ty + 1) * tileSize;

      if (!followerSprite.visible) {
        followerSprite.setPosition(px, py);
        return;
      }
      this._setNpcFrame(followerSprite, dir, true);
      scena.tweens.killTweensOf(followerSprite);
      const dur = corsaAttiva ? DURATA_PASSO_CORSA_MS : DURATA_PASSO_MS;
      scena.tweens.add({
        targets: followerSprite, x: px, y: py, duration: dur, ease: 'Linear',
        onComplete: () => { this._setNpcFrame(followerSprite, dir, false); },
      });
    }

    // Profondità dinamica giocatore/follower (ogni frame, sess. 8 set 2026 —
    // segnalato da Luca: "sembra che io sia sovrapposto a lui"). Prima
    // avevano depth FISSA (player 30, follower 19: il giocatore disegnato
    // sempre sopra, a prescindere da chi fosse davvero più vicino allo
    // schermo) — sbagliato quando un Pokémon alto sta un passo più a SUD del
    // giocatore: in quel caso deve coprirlO lui, non il contrario. Chi ha la
    // Y (verticale) maggiore è più vicino alla "telecamera" e va disegnato
    // sopra, esattamente come nei giochi veri. Gli NPC restano a depth fissa
    // 20 (non toccati, nessuna lamentela su di loro).
    _aggiornaProfonditaFollower() {
      if (!playerSprite || !followerSprite || !followerSprite.visible) return;
      if (followerSprite.y > playerSprite.y) {
        followerSprite.setDepth(30);
        playerSprite.setDepth(19);
      } else {
        followerSprite.setDepth(19);
        playerSprite.setDepth(30);
      }
    }

    async _creaSpritesNPC() {
      const DIR_FRAME = { nord: 13, sud: 1, est: 9, ovest: 5 };

      for (const st of npcStato) {
        if (st.tipo === 'leggendario' || st.tipo === 'leggendario_ambientale') continue;   // sprite gestito da _creaLeggendari
        const ev = st.ev;
        const id = st.id;
        let spriteFile = null;

        if (st.tipo === 'npc') {
          const dati = (typeof DATI_NPC !== 'undefined') ? DATI_NPC[id] : null;
          if (dati && dati.sprite) spriteFile = dati.sprite;
        } else if (st.tipo === 'trainer') {
          const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[id] : null;
          if (dati && dati.sprite) spriteFile = dati.sprite;
        }
        // Fallback: se non c'è in DATI_*, usa la proprietà "sprite" messa in Tiled.
        if (!spriteFile && ev.props && ev.props.sprite) spriteFile = ev.props.sprite;

        const assegnato = spriteFile;   // nome assegnato (il file potrebbe mancare)

        // Nessuno sprite assegnato → è un filler: gli diamo uno sprite CASUALE
        // (stabile per id), così non resta invisibile.
        if (!spriteFile) spriteFile = spriteRandomPerId(id);

        let texKey = await this._caricaTexNpc(spriteFile);

        // Sprite assegnato ma file MANCANTE (es. NPC eliminato): se NON è un
        // personaggio della storia, ripieghiamo su uno sprite filler casuale.
        if (!texKey && assegnato && !isSpriteStoria(assegnato)) {
          texKey = await this._caricaTexNpc(spriteRandomPerId(id));
        }
        if (!texKey) {
          if (assegnato) console.warn('[NPC] Sprite di un personaggio non trovato:', assegnato);
          continue;   // personaggio della storia senza file → resta invisibile (va ripristinato)
        }

        const px = st.tx * tileSize + tileSize / 2;
        const py = (st.ty + 1) * tileSize;
        const frame = DIR_FRAME[st.dir] || 1;

        const spr = this.add.sprite(px, py, texKey, frame)
          .setOrigin(0.5, 1).setDepth(20);
        if (tileSize < 32) spr.setScale(tileSize / 32);

        st.sprite = spr;
        npcSprites.push(spr);
      }
    }

    // Una casella è libera per un NPC? (bordi, collisioni, player, altri NPC)
    _liberoPerNPC(tx, ty, self) {
      if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return false;
      if (collGrid && collGrid[ty] && collGrid[ty][tx] === 1) return false;
      if (tx === posTile.tx && ty === posTile.ty) return false;
      for (const o of npcStato) {
        if (o !== self && o.tx === tx && o.ty === ty) return false;
      }
      return true;
    }

    // Aggiorna movimento NPC (random) e pattuglia trainer — chiamato ogni frame
    _aggiornaNPC() {
      for (const st of npcStato) {
        st.timer++;

        // Trainer in pattuglia: cambia direzione (e quindi cono visivo) periodicamente
        if (st.tipo === 'trainer' && st.patuglia) {
          if (st.timer >= 120) {
            st.timer = 0;
            st.cicloIdx = (st.cicloIdx + 1) % st.dirCiclo.length;
            st.dir = st.dirCiclo[st.cicloIdx];
            this._setNpcFrame(st.sprite, st.dir, false);
          }
          continue;
        }

        // NPC con movimento casuale
        if (st.movimento === 'random' && !st.inMovimento) {
          if (st.timer >= 75) {
            st.timer = 0;
            const dirs = ['nord', 'sud', 'est', 'ovest'];
            const nd = dirs[Math.floor(Math.random() * 4)];
            st.dir = nd;
            const { dx, dy } = this._dirDelta(nd);
            const ntx = st.tx + dx, nty = st.ty + dy;

            const fuoriRaggio = Math.abs(ntx - st.homeTx) > st.raggio ||
                                Math.abs(nty - st.homeTy) > st.raggio;

            if (!fuoriRaggio && this._liberoPerNPC(ntx, nty, st)) {
              st.tx = ntx; st.ty = nty;
              if (st.sprite) {
                const px = ntx * tileSize + tileSize / 2;
                const py = (nty + 1) * tileSize;
                st.inMovimento = true;
                this._setNpcFrame(st.sprite, nd, true);
                scena.tweens.killTweensOf(st.sprite);
                scena.tweens.add({
                  targets: st.sprite, x: px, y: py, duration: 220, ease: 'Linear',
                  onComplete: () => {
                    st.inMovimento = false;
                    this._setNpcFrame(st.sprite, st.dir, false);
                  },
                });
              }
            } else {
              this._setNpcFrame(st.sprite, nd, false);
            }
          }
        }
      }
    }

    // wLocal/hLocal = dimensioni (in tile) della mappa sorgente di data1d;
    // offPxX/offPxY = posizione (in pixel, spazio di gioco) a cui posizionare
    // i layer risultanti. Con offset 0 e wLocal/hLocal = mapW/mapH è il
    // comportamento di sempre per una mappa singola.
    _renderSplitLayer(data1d, ts, depth, wLocal, hLocal, offPxX, offPxY) {
      const splitAt = ts.splitTiles;
      const parts   = splitParts[ts.name] || 0;
      // Una fetta (layer) per ogni porzione del tileset: la fetta i copre gli
      // indici locali [i*splitAt, (i+1)*splitAt).
      for (let i = 0; i < parts; i++) {
        const key = ts.keyBase + '-' + i;
        const lo  = i * splitAt;
        const hi  = lo + splitAt;
        const data2d = [];
        let hasTiles = false;
        for (let r = 0; r < hLocal; r++) {
          const row = [];
          for (let c = 0; c < wLocal; c++) {
            const gid = data1d[r * wLocal + c];
            if (gid >= ts.firstgid && gid < ts.nextGid) {
              const local = gid - ts.firstgid;
              if (local >= lo && local < hi) {
                row.push(local - lo); hasTiles = true;
              } else {
                row.push(-1);
              }
            } else {
              row.push(-1);
            }
          }
          data2d.push(row);
        }
        if (!hasTiles) continue;
        if (!this.textures.exists(key)) continue;
        const map = this.make.tilemap({ data: data2d, tileWidth: ts.tw, tileHeight: ts.th });
        const tileset = map.addTilesetImage('ts' + i, key, ts.tw, ts.th, 0, 0);
        const layer = map.createLayer(0, tileset);
        if (layer) {
          if (ts.tw !== tileSize) layer.setScale(tileSize / ts.tw);
          if (offPxX || offPxY) layer.setPosition(offPxX, offPxY);
          layer.setDepth(depth);
          layerObjects.push({ layer, lo, depth });
        }
      }
    }

    _pulisciLayers() {
      for (const obj of layerObjects) {
        try { obj.layer.tilemap.destroy(); } catch (_) {}
      }
      layerObjects = [];
      acquaAnimTiles = [];
      for (const s of npcSprites) {
        try { s.destroy(); } catch (_) {}
      }
      npcSprites = [];
      npcStato = [];
      for (const s of massiSprites) {
        try { s.destroy(); } catch (_) {}
      }
      massiSprites = [];
      massiStato = [];
    }

    // "Modalità" attuale del personaggio, in ordine di priorità: Bicicletta
    // (esclude Corsa/Surf), poi Surf, poi Corsa, poi normale. Determina quale
    // set di sprite (SPRITE_PLAYER[genere][variante]) va mostrato.
    _variantePlayerAttiva() {
      if (biciAttiva) return 'bike';
      if (surfAttivo) return 'surf';
      if (corsaAttiva) return 'run';
      return 'normale';
    }

    // Chiave dell'animazione del giocatore per lo stato attuale (genere +
    // modalità). "tipo" è 'idle' o 'walk'.
    _animKeyPlayer(tipo, dir) {
      return `${genereGiocatore}-${this._variantePlayerAttiva()}-${tipo}-${dir}`;
    }

    _posizionaPlayer(tx, ty) {
      posTile = { tx, ty };
      // Sicurezza anti-"volo sull'acqua" (richiesta di Luca, 3 settembre 2026):
      // se la casella di arrivo è acqua surfabile, il Surf si attiva SEMPRE
      // qui, anche se stavaSurfando/surfAttivo non lo prevedevano — copre ogni
      // spawn/warp/ripresa da salvataggio che finisca su acqua (prima si
      // vedeva il personaggio "camminare" sopra il lago finché non si muoveva
      // e triggerava il controllo in _sposta). Punto unico: _posizionaPlayer
      // è l'unica funzione che piazza davvero lo sprite del giocatore.
      if (acquaSurf && acquaSurf.has(tx + ',' + ty)) {
        surfAttivo = true;
      }
      const px = tx * tileSize + tileSize / 2;
      const py = (ty + 1) * tileSize;

      if (!playerSprite) {
        playerSprite = this.add.sprite(px, py, SPRITE_PLAYER[genereGiocatore].normale)
          .setOrigin(0.5, 1).setDepth(30);
        playerSprite.anims.play(this._animKeyPlayer('idle', 'down'));
      } else {
        // IMPORTANTE: ferma eventuali tween di movimento ancora in corso dalla
        // mappa precedente, altrimenti continuano a trascinare lo sprite lontano
        // dallo spawn (il giocatore "appariva" a nord/sud finché non si muoveva).
        this.tweens.killTweensOf(playerSprite);
        playerSprite.setPosition(px, py);
        playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      }

      // Camera centrata di colpo sullo spawn (snap), poi segue il giocatore.
      this.cameras.main.stopFollow();
      this.cameras.main.centerOn(px, py - tileSize / 2);
      this.cameras.main.startFollow(playerSprite, true, 0.15, 0.15, 0, tileSize / 2);
      this.cameras.main.centerOn(px, py - tileSize / 2);

      this._posizionaFollower(tx, ty);
    }

    /* ────────── GAME LOOP ────────── */

    update(_time, delta) {
      // Difesa in più oltre a "bloccato": se per qualunque motivo una
      // cutscene/lotta ha dimenticato di chiamare bloccaMovimento() in un
      // punto preciso (o l'ha richiamato in ritardo dopo un await), il
      // giocatore non deve MAI poter camminare mentre stato.incontroAttivo
      // è vero o un dialogo è a schermo — segnalato da Luca, sess. 18 set
      // 2026 ("durante la cutscene ad ora posso muovermi, questa cosa non
      // va bene").
      if (bloccato) return;
      if (typeof stato !== 'undefined' && stato.incontroAttivo) return;
      if (typeof dialogoInCorso !== 'undefined' && dialogoInCorso) return;

      // NPC e trainer si muovono/guardano ogni frame (Fix 4)
      frameCount++;
      this._aggiornaNPC();
      this._controllaTrainerVista();
      this._aggiornaProfonditaFollower();

      this.moveCD -= delta;

      // Corsa: SHIFT tenuto premuto (equivalente del tasto B del Game Boy).
      corsaAttiva = this.shiftKey.isDown;

      // Bicicletta: tasto B, si indossa/toglie solo se posseduta. Non si può
      // pedalare mentre si sta surfando né dentro edifici/interni (palestre,
      // stazioni, case, Lega...) — richiesta esplicita punto 9, sess. 16 set 2026.
      if (Phaser.Input.Keyboard.JustDown(this.biciKey)) {
        const haBici = typeof stato !== 'undefined' && stato.inventario &&
                       stato.inventario.chiave && stato.inventario.chiave.bicicletta;
        if (!haBici) {
          if (typeof mostraToast === 'function') mostraToast('🚲 Non hai la Bicicletta.', 1800);
        } else if (surfAttivo) {
          if (typeof mostraToast === 'function') mostraToast('🚲 Non puoi usare la bici in acqua.', 1800);
        } else if (mappaInfo && mappaInfo.interno) {
          if (typeof mostraToast === 'function') mostraToast('🚲 Non puoi usare la bici qui dentro.', 1800);
        } else {
          biciAttiva = !biciAttiva;
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
          this._aggiornaVisibilitaFollower();   // niente follower in bici
        }
      }

      // Canna da pesca: tasto P. Solo la posa per ora, nessun incontro (da
      // progettare a parte: dove si può pescare, cosa si pesca).
      if (Phaser.Input.Keyboard.JustDown(this.pescaKey)) {
        const haCanna = typeof stato !== 'undefined' && stato.inventario &&
                        stato.inventario.chiave && stato.inventario.chiave.cannaPesca;
        if (!haCanna) {
          if (typeof mostraToast === 'function') mostraToast('🎣 Non hai la Canna da pesca.', 1800);
        } else {
          pescaFinoA = _time + 1500;
          if (playerSprite) playerSprite.anims.play(`${genereGiocatore}-fish-idle-${facciata}`, true);
        }
      }
      if (pescaFinoA && _time >= pescaFinoA) {
        pescaFinoA = 0;
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      }
      // Mentre si mostra la posa da pesca, il movimento resta sospeso.
      if (pescaFinoA) return;

      // Interazione con Spazio (alias di [A], gestito anche via DOM in app.js).
      if (this.spaceKey.isDown && !spaceWasDown) {
        spaceWasDown = true;
        if (eventoVicino) { this._interagisci(eventoVicino); return; }
      }
      if (!this.spaceKey.isDown) spaceWasDown = false;

      // Movimento con le frecce direzionali O col D-pad touch (mobile):
      // stessa identica logica per entrambi, il D-pad si limita a impostare
      // this.dpadDx/dpadDy (vedi _collegaDpad) invece di muovere per conto
      // suo con un setInterval separato — prima i due controlli divergevano.
      const c = this.cursors;

      // Dopo un warp: niente movimento finché non si vedono TUTTI i tasti
      // direzionali rilasciati almeno una volta (vedi attesaRilascioDirezione,
      // impostato in caricaMappa()) — tenere premuta la direzione con cui si
      // è entrati nel warp non deve far ripartire subito il cammino.
      if (attesaRilascioDirezione) {
        const tastoTenuto = c.left.isDown || c.right.isDown || c.up.isDown || c.down.isDown ||
                             !!this.dpadDx || !!this.dpadDy;
        if (tastoTenuto) {
          if (!giocatoreInMovimento && playerSprite) {
            playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
          }
          this._aggiornaMountSurf();
          return;
        }
        attesaRilascioDirezione = false;
      }

      let dx = 0, dy = 0;
      if (c.left.isDown)  dx = -1;
      if (c.right.isDown) dx =  1;
      if (c.up.isDown)    dy = -1;
      if (c.down.isDown)  dy =  1;
      if (dx === 0 && dy === 0 && (this.dpadDx || this.dpadDy)) {
        dx = this.dpadDx || 0;
        dy = this.dpadDy || 0;
      }

      // Fix 1 — niente diagonali: l'asse verticale ha la precedenza.
      if (dy !== 0) dx = 0;

      const dirPremuta = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : dy > 0 ? 'down' : null;

      if (dirPremuta) {
        const direzioneCambiata = dirPremuta !== ultimaDirezionePremuta;
        if (direzioneCambiata) {
          ultimaDirezionePremuta = dirPremuta;
          ultimaDirezioneDall = _time;
        }
        // Si può muovere subito se si sta già camminando (cambio direzione al
        // volo, come in Essentials), oppure se questa direzione è tenuta
        // premuta da almeno SOGLIA_GIRA_PRIMA_MS senza essere cambiata.
        const puoMuoversi = giocatoreInMovimento ||
          (!direzioneCambiata && (_time - ultimaDirezioneDall) >= SOGLIA_GIRA_PRIMA_MS);
        if (puoMuoversi) {
          if (this.moveCD <= 0) {
            this.moveCD = biciAttiva ? DURATA_PASSO_BICI_MS : (corsaAttiva ? DURATA_PASSO_CORSA_MS : DURATA_PASSO_MS);
            this._sposta(dx, dy);
          }
        } else if (!giocatoreInMovimento) {
          // Primo tocco della direzione, personaggio fermo: si gira soltanto
          // sul posto, non si muove ancora (esattamente come nei giochi Pokémon).
          facciata = dirPremuta;
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
        }
      } else {
        ultimaDirezionePremuta = null;
        if (!giocatoreInMovimento) {
          // Non forzare "idle" mentre il tween del passo corrente è ancora in
          // corso (tasto rilasciato a metà casella): altrimenti l'animazione
          // "cammina" viene tagliata e riparte da zero ad ogni casella.
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
        }
      }

      this._aggiornaMountSurf();
    }

    // PROBLEMA 4b: sprite composito durante il Surf — "base_surf" (la
    // cavalcatura, Graphics/Characters/base_surf di Essentials) sotto al
    // personaggio, sempre nella stessa posizione/direzione/fotogramma del
    // giocatore. Creazione/distruzione "just in time" come in Essentials
    // (Sprite_SurfBase#update): esiste solo mentre surfAttivo è vero.
    _aggiornaMountSurf() {
      if (!surfAttivo) {
        if (mountSurfSprite) { mountSurfSprite.destroy(); mountSurfSprite = null; }
        return;
      }
      if (!playerSprite) return;
      // La cavalcatura va un filo più in basso del personaggio (segnalato da
      // Luca: col punto d'ancoraggio identico il personaggio "usciva" dal
      // disegno della cavalcatura, sembrava fluttuare sopra invece che
      // seduto sopra) — piccolo scarto verticale verso il basso.
      const OFFSET_Y_MOUNT = 10;
      if (!mountSurfSprite) {
        try {
          mountSurfSprite = this.add.sprite(playerSprite.x, playerSprite.y + OFFSET_Y_MOUNT, 'base-surf')
            .setOrigin(0.5, 1);
        } catch (err) {
          console.error('[Surf] Creazione mountSurfSprite fallita:', err);
          return;
        }
      }
      // Stessa griglia 4x4 del personaggio (colonna = fotogramma 0-3, riga =
      // direzione down/left/right/up nello stesso ordine): riusa esattamente
      // il fotogramma corrente del giocatore, così la cavalcatura "respira"
      // in sincrono con la posa/camminata del personaggio sopra di lei.
      // NOTA: playerSprite.frame.name è il numero di frame nella texture
      // (0-15, quello che serve) — anims.currentFrame.index è tutt'altra
      // cosa (posizione 1-based DENTRO la sequenza dell'animazione corrente,
      // es. 1-4 per "walk-right" invece di 8-11: darebbe la cavalcatura
      // sbagliata quasi sempre).
      const frameGiocatore = parseInt(playerSprite.frame.name, 10) || 0;
      mountSurfSprite.setFrame(frameGiocatore);
      mountSurfSprite.setPosition(playerSprite.x, playerSprite.y + OFFSET_Y_MOUNT);
      // Sotto al personaggio (che sta "seduto" sopra), sopra al resto del fondale.
      mountSurfSprite.setDepth(playerSprite.depth - 1);
    }

    /* ────────── MOVIMENTO ──────────
       Modello a tre concetti separati (mai mescolati tra loro):
       1) collGrid  = collisione VERA, immutabile, blocca sempre (a piedi o in Surf).
       2) acquaSurf = insieme di celle "acqua surfabile" (rettangoli trigger_surf).
       3) surfAttivo = stato del player (sto surfando sì/no), non una proprietà delle celle.
       Ordine di valutazione: prima la collisione (vince sempre), poi l'acqua. */
    _sposta(dx, dy, daGhiaccio) {
      if (bloccato) return;
      // Mentre si scivola sul ghiaccio l'input manuale (tasti/bottoni) viene
      // ignorato: solo la catena automatica di scivolamento (daGhiaccio=true,
      // vedi in fondo) può muovere il giocatore, finché non sbatte da qualche
      // parte o il ghiaccio finisce. Di default assumiamo che questo passo
      // fermi lo scivolamento: si riattiva sotto solo se il ghiaccio continua.
      if (scivolandoGhiaccio && !daGhiaccio) return;
      scivolandoGhiaccio = false;
      const newTx = posTile.tx + dx;
      const newTy = posTile.ty + dy;

      if (newTx < 0 || newTx >= mapW || newTy < 0 || newTy >= mapH) {
        this._gestisciUscitaBordo(dx, dy);
        return;
      }

      if (dx < 0) facciata = 'left';
      else if (dx > 0) facciata = 'right';
      else if (dy < 0) facciata = 'up';
      else facciata = 'down';

      // 1) Collisione vera: blocca SEMPRE, in Surf o a piedi. Nessuna eccezione,
      // nessuna mutazione di collGrid da parte del Surf.
      if (collGrid && collGrid[newTy] && collGrid[newTy][newTx] === 1) {
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
        return;
      }

      // 1b) Bordo nord (Caves.tsj tile 482, vedi muroNordTiles): la casella è
      // calpestabile, ma non si attraversa il suo lato nord in nessuna delle
      // due direzioni — salendo (dy<0) dalla casella su cui si è già, o
      // scendendo (dy>0) su quella di arrivo.
      if (muroNordTiles && muroNordTiles.size) {
        if (dy < 0 && muroNordTiles.has(posTile.tx + ',' + posTile.ty)) {
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
          return;
        }
        if (dy > 0 && muroNordTiles.has(newTx + ',' + newTy)) {
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
          return;
        }
      }

      // 2) Acqua: si entra SOLO se si sta già surfando (acqua → acqua, silenzioso,
      // anche tra rettangoli trigger_surf diversi e affiancati). Se non si sta
      // ancora surfando, l'acqua è invalicabile camminando — l'ingresso iniziale
      // (terra → acqua) passa dal prompt [A] sul rettangolo trigger_surf
      // (_gestisciTrigger), non dal movimento con le frecce.
      const inAcqua = acquaSurf && acquaSurf.has(newTx + ',' + newTy);
      if (inAcqua && !surfAttivo) {
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
        return;
      }
      // 3) Terra: se si stava surfando, si scende dall'acqua automaticamente,
      // una volta sola, silenziosamente.
      if (!inAcqua && surfAttivo) {
        surfAttivo = false;
        this._aggiornaVisibilitaFollower();   // il follower ricompare uscendo dall'acqua
      }

      // NPC e trainer sono solidi: non ci si passa attraverso
      for (const o of npcStato) {
        if (o.tx === newTx && o.ty === newTy) {
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
          return;
        }
      }

      // Porta a scomparsa (Osservatorio CoTrAL, sess. 15 set 2026): solida
      // finché non è stata aperta (con la chiave, o tramite l'interruttore
      // della statua per quella controllata_da_interruttore). Una volta
      // aperta, il tile è già stato rimosso da _applicaPorteScomparse al
      // caricamento mappa: qui basta non bloccare più il passaggio.
      if (this._portaScomparsaBlocca(newTx, newTy)) {
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
        return;
      }

      // Masso spingibile (MN Forza): camminandoci contro, prova a spingerlo
      // di una casella. Se non si sposta (bloccato, o niente MN Forza) il
      // giocatore resta fermo, esattamente come contro un ostacolo qualsiasi.
      const massoQui = massiStato.find(m => m.tx === newTx && m.ty === newTy);
      if (massoQui) {
        const spostato = this._provaSpingiMasso(massoQui, dx, dy);
        if (!spostato) {
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
          return;
        }
      }

      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('walk', facciata), true);

      // Il follower prende il posto che il giocatore sta per lasciare (tx,ty
      // VECCHI, prima di aggiornare posTile qui sotto) — vedi _passoFollower.
      this._passoFollower(posTile.tx, posTile.ty);

      posTile = { tx: newTx, ty: newTy };
      const px = newTx * tileSize + tileSize / 2;
      const py = (newTy + 1) * tileSize;
      const dur = biciAttiva ? DURATA_PASSO_BICI_MS : (corsaAttiva ? DURATA_PASSO_CORSA_MS : DURATA_PASSO_MS);

      if (playerSprite) {
        scena.tweens.killTweensOf(playerSprite);
        giocatoreInMovimento = true;
        scena.tweens.add({
          targets: playerSprite, x: px, y: py, duration: dur, ease: 'Linear',
          onComplete: () => { giocatoreInMovimento = false; },
        });
      }

      // In cluster: la mappa "sotto i piedi" è DERIVATA dalla posizione (Parte 5),
      // non è un cambio mappa vero — nessun fade/reset. Aggiorna solo la mappa
      // corrente (serve a mappaInfo/lat-lon, a città-visitata, e al punto di
      // ritorno corretto se il giocatore entra in un interno da qui).
      if (clusterAttivo) {
        const nuovaSub = this._mappaSottoGiocatore();
        if (nuovaSub && nuovaSub !== mappaCorrente) {
          mappaCorrente = nuovaSub;
          const box = clusterBoxes[mappaCorrente];
          mappaInfo = { ...MAPPE[mappaCorrente], mapW: box.w, mapH: box.h };
          if (mappaInfo.interno) biciAttiva = false;   // niente bici in edifici/interni (punto 9)
          const comune = MAPPA_COMUNE[mappaCorrente];
          if (comune && typeof stato !== 'undefined' && Array.isArray(stato.cittaVisitate) &&
              !stato.cittaVisitate.includes(comune)) {
            stato.cittaVisitate.push(comune);
          }
        }
      }

      this._aggiornaLatLon();
      if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
      if (onPassoCb) onPassoCb({ ...posLatLon });

      this._aggiornaEventoVicino();
      this._controllaEventiCalpestabili();

      // Ghiaccio scivoloso (Caves.tsj, tile locale 944 — Monte Cavo, sessione
      // 8 agosto): il giocatore continua a scivolare da solo nella STESSA
      // direzione dell'ultimo passo, finché non trova un ostacolo (torna
      // bloccato dentro _sposta stesso, vedi collisione/NPC/masso sopra) o un
      // tile non ghiacciato — a quel punto si ferma e riprende il comando
      // normale. Si interrompe anche se nel frattempo è scattato un incontro
      // o un dialogo (encounter/erba_alta calpestata durante lo scivolamento).
      if (ghiaccioTiles && ghiaccioTiles.has(newTx + ',' + newTy)) {
        scivolandoGhiaccio = true;
        scena.time.delayedCall(dur, () => {
          if (bloccato || (typeof stato !== 'undefined' && stato.incontroAttivo) ||
              (typeof dialogoInCorso !== 'undefined' && dialogoInCorso)) {
            scivolandoGhiaccio = false;
            return;
          }
          this._sposta(dx, dy, true);
        });
      }
    }

    // (Parte 5) Restituisce la chiave della mappa membro del cluster attivo
    // che contiene la posizione corrente del giocatore, o null se — per un
    // istante — si trova in un vuoto (non dovrebbe succedere: il vuoto è già
    // bloccante in collGrid). Fuori da un cluster non serve: torna null.
    _mappaSottoGiocatore() {
      if (!clusterAttivo) return null;
      for (const k of Object.keys(clusterBoxes)) {
        const b = clusterBoxes[k];
        if (posTile.tx >= b.offsetX && posTile.tx < b.offsetX + b.w &&
            posTile.ty >= b.offsetY && posTile.ty < b.offsetY + b.h) return k;
      }
      return null;
    }

    // ── Velo giorno/notte (sessione 3 agosto) ──────────────────────────
    // Fasce/colori/opacità decisi dall'utente. TEST INIZIALE: attivo solo
    // sulle mappe in MAPPE_CON_VELO_TEMPO qui sotto — toglierlo (o aggiungere
    // chiavi) per estendere ad altre mappe esterne una volta confermato che
    // il risultato in gioco piace. Gli interni (interno:true in MAPPE) restano
    // sempre illuminati; le grotte (grotta:true, da flaggare quando servirà)
    // restano sempre buie a prescindere dall'ora.
    _fasciaVisiva(minuti) {
      if (minuti >= 300 && minuti < 420)  return 'alba';      // 05:00–07:00
      if (minuti >= 420 && minuti < 1080) return 'giorno';    // 07:00–18:00
      if (minuti >= 1080 && minuti < 1200) return 'tramonto'; // 18:00–20:00
      return 'notte';                                        // 20:00–05:00
    }

    _aggiornaVeloTempo() {
      const MAPPE_CON_VELO_TEMPO = [
        'frascati_centro',
        // World Castelli_lakes (sessione 5 agosto): confermato dopo il test su
        // Frascati, esteso a tutte le mappe del lago.
        'marino', 'lago_albano', 'interno_lago', 'lago_nemi',
        'via_dei_laghi', 'percorso_4', 'castel_gandolfo', 'percorso_5',
        // Esteso a TUTTE le mappe esterne (sessione 6 agosto, richiesta utente):
        // ogni mappa non 'interno:true' in MAPPE prende il velo giorno/notte.
        'borgata_tuscolana', 'percorso_tuscolana', 'percorso_1b',
        'frascati_sud', 'frascati_est', 'frascati_ovest', 'frascati_nord',
        'percorso_2', 'percorso_3', 'percorso_7', 'percorso_7b',
        'monteporzio', 'osservatorio', 'percorso_montano_v1', 'rocca_di_papa',
        'albano', 'percorso_8', 'zona_safari', 'percorso_9', 'ariccia',
        'tuscolo_ingresso', 'tuscolo_interno', 'tuscolo_rovine', 'boschetto_segreto',
        'grottaferrata',
        // NOTA: tuscolo_profondo, antro_regice/regirock/registeel e
        // tunnel_roccioso_1f..4f NON vanno qui — sono grotte (tema 'cave'/
        // 'icecave'), escluse in automatico più sotto (sempre giorno).
      ];
      const VELO_FASCE = {
        alba:     { colore: 0xffb066, opacita: 0.10 }, // molto più leggera/vacua
        giorno:   { colore: 0x000000, opacita: 0 },
        tramonto: { colore: 0xff7a2e, opacita: 0.12 }, // molto più leggera/vacua
        // 0.52 era quasi invisibile sulle tinte verde/teal delle mappe esterne
        // (verificato con claude-in-chrome, sessione 6 agosto: a 0.52 la
        // differenza giorno/notte era impercettibile in game, non un bug di
        // rendering — il colore/opacità andavano ricalibrati). Alzato a 0.75.
        notte:    { colore: 0x08132a, opacita: 0.75 },
      };

      if (!this._veloRect) {
        this._veloRect = this.add.rectangle(
          0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0
        );
        this._veloRect.setOrigin(0, 0);
        this._veloRect.setScrollFactor(0);
        this._veloRect.setDepth(10000); // sopra tile/sprite (sopra_testa=50), sotto la UI (DOM)
      }
      this._veloRect.setSize(this.cameras.main.width, this.cameras.main.height);

      const def = MAPPE[mappaCorrente];
      let scelta;
      // Dungeon/grotte (MAPPE[...].tema === 'cave'/'icecave'): sempre giorno,
      // MAI notte/alba/tramonto (richiesta esplicita utente, sessione 6
      // agosto — il contrario di quanto assunto prima con 'grotta', che
      // infatti non è mai stato impostato da nessuna mappa).
      const eGrottaSempreGiorno = def && (def.tema === 'cave' || def.tema === 'icecave');
      if (!def || def.interno || eGrottaSempreGiorno || !MAPPE_CON_VELO_TEMPO.includes(mappaCorrente)) {
        scelta = VELO_FASCE.giorno; // niente velo: interno, grotta, o mappa non nella lista test
      } else if (def.grotta) {
        scelta = VELO_FASCE.notte; // riservato a un futuro uso diverso da 'tema cave' (oggi inutilizzato)
      } else {
        const minuti = (typeof stato !== 'undefined' && stato.tempo) ? stato.tempo.minuti : 480;
        scelta = VELO_FASCE[this._fasciaVisiva(minuti)];
      }
      this._veloRect.setFillStyle(scelta.colore, scelta.opacita);
      this._aggiornaVisibilitaLuci();
    }

    // ── Meteo overworld (Sole/Pioggia/Grandine — sessione 31 agosto) ────
    // Legge `stato.meteo.tipo` (deciso/ruotato in app.js, aggiornaMeteo()) e
    // disegna un velo colorato + particelle sopra la mappa attuale. La
    // GRANDINE è visibile solo su Monte Cavo (unica zona innevata); Sole e
    // Pioggia ovunque all'aperto (non in interni/grotte). Sabbia non ha
    // ancora una zona (nessuna zona desertica in gioco), quindi non viene
    // mai disegnata qui anche se in futuro stato.meteo.tipo la prevedesse.
    _aggiornaVeloMeteo() {
      const tipo = (typeof stato !== 'undefined' && stato.meteo) ? stato.meteo.tipo : 'sereno';
      const def = MAPPE[mappaCorrente];
      const eInterno = !def || def.interno;
      const eGrottaBuia = def && (def.tema === 'cave' || def.tema === 'icecave') && mappaCorrente !== 'monte_cavo';

      let tipoVisibile = (eInterno || eGrottaBuia) ? 'sereno' : tipo;
      if (tipoVisibile === 'grandine' && mappaCorrente !== 'monte_cavo') tipoVisibile = 'sereno';
      // Tempesta di sabbia FISSA e permanente fuori dall'Osservatorio (punto
      // 7, sess. 16 set 2026: "gli eventi metereologici strani... si vedono
      // fuori dall'osservatorio... c'è sempre questa tempesta lì") — non è
      // pilotata da stato.meteo.tipo, sovrascrive qualunque meteo globale.
      // NON basta controllare mappaCorrente === 'osservatorio': dentro il
      // cluster 'montepo' il bounding box di monteporzio si sovrappone a
      // quello di osservatorio, e _mappaSottoGiocatore() (primo box che
      // contiene la casella) risolve quella zona come 'monteporzio', non
      // 'osservatorio' — stesso bug scovato sul trigger del confronto, sess.
      // 17 set 2026. Qui controlliamo la posizione VERA contro il bounding
      // box reale di osservatorio, indipendentemente da cosa dice mappaCorrente.
      const boxOss = clusterAttivo === 'montepo' ? clusterBoxes.osservatorio : null;
      const suOsservatorio = mappaCorrente === 'osservatorio' || (boxOss &&
        posTile.tx >= boxOss.offsetX && posTile.tx < boxOss.offsetX + boxOss.w &&
        posTile.ty >= boxOss.offsetY && posTile.ty < boxOss.offsetY + boxOss.h);
      if (!eInterno && suOsservatorio) tipoVisibile = 'sabbia';

      if (!this._veloMeteoRect) {
        this._veloMeteoRect = this.add.rectangle(
          0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0
        );
        this._veloMeteoRect.setOrigin(0, 0);
        this._veloMeteoRect.setScrollFactor(0);
        this._veloMeteoRect.setDepth(10001); // sopra il velo giorno/notte (10000)
      }
      this._veloMeteoRect.setSize(this.cameras.main.width, this.cameras.main.height);

      const TINTE_METEO = {
        sereno:   { colore: 0x000000, opacita: 0 },
        pioggia:  { colore: 0x1a2a4a, opacita: 0.22 },
        sole:     { colore: 0xffdd66, opacita: 0.12 },
        grandine: { colore: 0xcfe6f5, opacita: 0.20 },
        sabbia:   { colore: 0xc9a15c, opacita: 0.30 },
      };
      const t = TINTE_METEO[tipoVisibile] || TINTE_METEO.sereno;
      this._veloMeteoRect.setFillStyle(t.colore, t.opacita);

      this._gestisciParticelleMeteo(tipoVisibile);
    }

    // Crea/ferma l'emettitore di particelle giusto per il meteo attuale
    // (pioggia = strisce diagonali, grandine = fiocchi). Rigenera solo se il
    // tipo è cambiato rispetto all'ultima chiamata (evita emettitori doppi).
    _gestisciParticelleMeteo(tipo) {
      if (tipo === this._particelleMeteoTipo) return;
      this._particelleMeteoTipo = tipo;

      if (this._emitterMeteo) {
        this._emitterMeteo.stop();
        this._emitterMeteo.destroy();
        this._emitterMeteo = null;
      }
      if (tipo !== 'pioggia' && tipo !== 'grandine' && tipo !== 'sabbia') return;

      if (!this.textures.exists('meteo-goccia')) {
        const g1 = this.make.graphics({ x: 0, y: 0, add: false });
        g1.fillStyle(0xffffff, 1);
        g1.fillRect(0, 0, 3, 14);
        g1.generateTexture('meteo-goccia', 3, 14);
        g1.destroy();
        const g2 = this.make.graphics({ x: 0, y: 0, add: false });
        g2.fillStyle(0xffffff, 1);
        g2.fillCircle(3, 3, 3);
        g2.generateTexture('meteo-fiocco', 6, 6);
        g2.destroy();
      }
      if (!this.textures.exists('meteo-sabbia')) {
        const g3 = this.make.graphics({ x: 0, y: 0, add: false });
        g3.fillStyle(0xffffff, 1);
        g3.fillRect(0, 0, 10, 3);
        g3.generateTexture('meteo-sabbia', 10, 3);
        g3.destroy();
      }

      const w = this.cameras.main.width;
      const h = this.cameras.main.height;
      if (tipo === 'pioggia') {
        this._emitterMeteo = this.add.particles(0, 0, 'meteo-goccia', {
          x: { min: 0, max: w }, y: -20,
          lifespan: 700,
          speedY: { min: 700, max: 900 }, speedX: { min: -60, max: -30 },
          scaleY: { min: 0.8, max: 1.3 },
          alpha: { start: 0.55, end: 0.2 },
          quantity: 3, frequency: 20,
          tint: 0xbcd6f0,
        });
      } else if (tipo === 'sabbia') {
        // Vento orizzontale carico di sabbia: entra da sinistra, attraversa
        // tutto lo schermo (niente caduta verticale come pioggia/grandine).
        this._emitterMeteo = this.add.particles(0, 0, 'meteo-sabbia', {
          x: -20, y: { min: 0, max: h },
          lifespan: 1100,
          speedX: { min: 500, max: 760 }, speedY: { min: -30, max: 30 },
          scaleX: { min: 0.6, max: 1.4 },
          alpha: { start: 0.6, end: 0.15 },
          quantity: 3, frequency: 18,
          tint: 0xd8b26e,
        });
      } else {
        this._emitterMeteo = this.add.particles(0, 0, 'meteo-fiocco', {
          x: { min: 0, max: w }, y: -10,
          lifespan: 1400,
          speedY: { min: 220, max: 320 }, speedX: { min: -20, max: 20 },
          alpha: { start: 0.8, end: 0.3 },
          quantity: 2, frequency: 60,
          tint: 0xffffff,
        });
      }
      this._emitterMeteo.setScrollFactor(0);
      this._emitterMeteo.setDepth(10002);
    }

    // Contesto per la ruota casuale del meteo (app.js, aggiornaMeteo()):
    // outdoor = mappa aperta dove può piovere/splendere il sole; monteCavo =
    // unica zona dove la grandine è ammessa.
    _contestoMeteo() {
      const def = MAPPE[mappaCorrente];
      const eInterno = !def || def.interno;
      const eGrottaBuia = def && (def.tema === 'cave' || def.tema === 'icecave') && mappaCorrente !== 'monte_cavo';
      return {
        outdoor: !eInterno && !eGrottaBuia,
        monteCavo: mappaCorrente === 'monte_cavo',
      };
    }

    // Fix 2 — tipo di terreno sotto una casella, letto dalle zone del layer eventi.
    // Restituisce l'oggetto zona ('erba_alta' | 'acqua' | 'incontri') o null.
    _getTileType(tx, ty) {
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'erba_alta' && ev.tipo !== 'acqua' && ev.tipo !== 'incontri') continue;
        if (ev.w > 0 && ev.h > 0 &&
            tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
          return ev;
        }
      }
      // Ogni casella d'acqua surfabile è ANCHE zona incontri, come l'erba alta:
      // non serve disegnare un rettangolo "acqua" separato che ricalchi ogni
      // trigger_surf. Se ci si trova su una casella acquaSurf (e quindi si sta
      // per forza surfando, altrimenti non ci si potrebbe stare: vedi _sposta),
      // riusa il rettangolo trigger_surf che copre la casella — ha già un "id"
      // proprio, da usare come chiave in DATI_INCONTRI.
      if (acquaSurf && acquaSurf.has(tx + ',' + ty)) {
        for (const ev of eventiMappa) {
          if (ev.tipo !== 'trigger_surf') continue;
          if (ev.w > 0 && ev.h > 0 &&
              tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
            return ev;
          }
        }
      }
      // Erba alta riconosciuta dal TILE (non da un rettangolo disegnato a
      // mano): incrementa il sistema a zone, non lo sostituisce. Usa l'id
      // incontri già usato dagli altri rettangoli erba_alta di QUESTA mappa
      // membro (ogni mappa ne usa uno solo). Se la mappa non ne ha nessuno,
      // niente incontro automatico "indovinato".
      if (erbaAltaAuto && erbaAltaAuto.has(tx + ',' + ty)) {
        let chiaveMappa = mappaCorrente;
        if (clusterAttivo) {
          for (const kk of Object.keys(clusterBoxes)) {
            const b = clusterBoxes[kk];
            if (tx >= b.offsetX && tx < b.offsetX + b.w && ty >= b.offsetY && ty < b.offsetY + b.h) {
              chiaveMappa = kk; break;
            }
          }
        }
        const id = erbaAltaIdPerMappa[chiaveMappa];
        if (id) return { tipo: 'erba_alta', id, props: { id }, w: 0, h: 0, tx, ty };
      }
      // Grotte a "incontri costanti" (Tunnel Roccioso e simili, sessione 6
      // agosto, MAPPE[...].incontriCostanti): come in ogni dungeon Pokémon,
      // TUTTO il pavimento è zona incontri — non serve disegnare rettangoli
      // erba_alta. Unica eccezione: un riquadro 7x7 (raggio 3) attorno a un
      // eventuale leggendario fermo sulla mappa (fisso o "ambientale"), per
      // lasciargli respiro visivo. Ultimo fallback, dopo rettangoli/tile/acqua.
      const defMappa = MAPPE[mappaCorrente];
      if (defMappa && defMappa.incontriCostanti && defMappa.incontriId &&
          !this._vicinoALeggendarioFermo(tx, ty)) {
        return { tipo: 'incontri', id: defMappa.incontriId, props: { id: defMappa.incontriId }, w: 0, h: 0, tx, ty };
      }
      return null;
    }

    // true se (tx,ty) è entro 3 caselle (riquadro 7x7) da un leggendario
    // 'leggendario'/'leggendario_ambientale' ancora presente sulla mappa
    // (non catturato/scomparso/scappato in roaming). Vedi _getTileType sopra.
    _vicinoALeggendarioFermo(tx, ty) {
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'leggendario' && ev.tipo !== 'leggendario_ambientale') continue;
        const legId = legIdDaEv(ev);
        if (legId && typeof legCatturato === 'function' && legCatturato(legId)) continue;
        if (legId && typeof legScomparso === 'function' && legScomparso(legId)) continue;
        if (ev.tipo === 'leggendario_ambientale' && typeof stato !== 'undefined' &&
            stato.flags && stato.flags.latiosLatiasRoaming) continue; // scappati: nessuna esclusione
        if (ev.tipo === 'leggendario_ambientale' && typeof stato !== 'undefined' &&
            stato.flags && stato.flags.caniLeggendariRoaming) continue; // Suicune scappato: nessuna esclusione
        if (Math.abs(tx - ev.tx) <= 3 && Math.abs(ty - ev.ty) <= 3) return true;
      }
      return false;
    }

    _aggiornaLatLon() {
      if (mappaInfo && mappaInfo.interno && mappaInfo.latFissa) {
        posLatLon = { lat: mappaInfo.latFissa, lon: mappaInfo.lonFissa };
      } else if (mappaInfo && !mappaInfo.interno) {
        // In cluster posTile è in coordinate GLOBALI (del cluster): tileToLatLon
        // si aspetta coordinate locali alla mappa (centrate su mappaInfo.mapW/H),
        // quindi le riportiamo locali alla mappa membro corrente prima di convertire.
        if (clusterAttivo && mappaCorrente && clusterBoxes[mappaCorrente]) {
          const box = clusterBoxes[mappaCorrente];
          posLatLon = tileToLatLon(posTile.tx - box.offsetX, posTile.ty - box.offsetY, mappaInfo);
        } else {
          posLatLon = tileToLatLon(posTile.tx, posTile.ty, mappaInfo);
        }
      }
    }

    _gestisciUscitaBordo(dx, dy) {
      const uscite = eventiMappa.filter(e =>
        e.tipo === 'uscita' || e.tipo === 'entrata' || e.tipo === 'warp');
      for (const u of uscite) {
        if (u.w > 0 && u.h > 0) {
          if (posTile.tx >= u.tx0 && posTile.tx <= u.tx1 &&
              posTile.ty >= u.ty0 && posTile.ty <= u.ty1) {
            this._transizioneMappa(u);
            return;
          }
          if (dy < 0 && posTile.ty === u.ty1 + 1) { this._transizioneMappa(u); return; }
          if (dy > 0 && posTile.ty === u.ty0 - 1) { this._transizioneMappa(u); return; }
          if (dx < 0 && posTile.tx === u.tx1 + 1) { this._transizioneMappa(u); return; }
          if (dx > 0 && posTile.tx === u.tx0 - 1) { this._transizioneMappa(u); return; }
        }
      }
      // In modalità cluster, uscire dal bounding box (o cadere in un vuoto tra
      // mappe, già bloccato da collGrid) senza un warp esplicito è semplicemente
      // un muro (REGOLA DEL VUOTO): niente fallback legacy.
      if (clusterAttivo) return;

      // Nessun warp disegnato a mano su questo bordo: prova la transizione
      // automatica via world Tiled (mappe adiacenti per coordinate reali).
      this._provaTransizioneMondo(dx, dy);
    }

    // Cerca, in ognuno dei file .world attivi, una mappa adiacente a quella
    // corrente nel punto esatto in cui il giocatore sta uscendo dal bordo.
    // Se la trova, calcola la casella di arrivo nella mappa vicina e ci
    // passa senza bisogno di un oggetto warp disegnato a mano.
    async _provaTransizioneMondo(dx, dy) {
      if (transizioneAttiva) return;
      const def = MAPPE[mappaCorrente];
      if (!def) return;
      const baseAttuale = nomeMappaDaFile(def.file);

      const newTx = posTile.tx + dx;
      const newTy = posTile.ty + dy;

      for (const worldFile of WORLD_FILES) {
        const rects = await caricaWorldRects(worldFile);
        const rectAttuale = rects[baseAttuale];
        if (!rectAttuale) continue; // la mappa corrente non fa parte di questo world

        // Punto (in pixel, spazio del world) al centro della casella verso
        // cui il giocatore sta camminando, fuori dai bordi della mappa attuale.
        const px = rectAttuale.x + (newTx + 0.5) * tileSize;
        const py = rectAttuale.y + (newTy + 0.5) * tileSize;

        for (const [baseNome, rect] of Object.entries(rects)) {
          if (baseNome === baseAttuale) continue;
          if (px >= rect.x && px < rect.x + rect.width &&
              py >= rect.y && py < rect.y + rect.height) {
            const chiaveDest = risolviMappa(baseNome) || risolviMappa(rect.fileName);
            if (!chiaveDest || chiaveDest === mappaCorrente) continue;

            const ltx = Math.floor((px - rect.x) / tileSize);
            const lty = Math.floor((py - rect.y) / tileSize);
            const evSint = {
              tipo: 'warp',
              props: { destinazione: chiaveDest, arrivo_x: String(ltx), arrivo_y: String(lty) },
            };
            this._transizioneMappa(evSint);
            return;
          }
        }
      }
    }

    /* ────────── EVENTI ────────── */

    // Restituisce l'evento interagibile presente in una casella (NPC/trainer alla
    // loro posizione corrente; cartelli/oggetti/pc/trigger come rettangoli o punti).
    _eventoInCasella(tx, ty) {
      for (const st of npcStato) {
        if ((st.tipo === 'npc' || st.tipo === 'trainer' || st.tipo === 'leggendario') &&
            st.tx === tx && st.ty === ty)
          return st.ev;
      }
      for (const ev of eventiMappa) {
        // trigger_surf mentre si sta già surfando: niente prompt, è la stessa
        // acqua (vedi modello acqua/surfAttivo/collisioni in _sposta) — non è
        // più "interagibile" finché non si torna a piedi.
        if (ev.tipo === 'trigger_surf' && surfAttivo) continue;
        // Porta a scomparsa già aperta: è ormai solo pavimento, niente più
        // da interagire lì (non deve restare "premibile" per sempre).
        if (ev.tipo === 'porta_scomparsa' && this._portaScomparsaApertaEv(ev)) continue;
        const interagibile =
          ev.tipo === 'cartello' || ev.tipo === 'cartel' || ev.tipo === 'pc' ||
          ev.tipo === 'oggetto'  || ev.tipo === 'object' ||
          ev.tipo === 'porta_scomparsa' || ev.tipo === 'statua_interruttore' ||
          isMnTrigger(ev.tipo) || ev.tipo === 'trigger_storia';
        if (!interagibile) continue;
        const occ = (ev.w > 0 && ev.h > 0)
          ? (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1)
          : (ev.tx === tx && ev.ty === ty);
        if (occ) return ev;
      }
      return null;
    }

    _aggiornaEventoVicino() {
      const ftx = posTile.tx + (facciata === 'right' ? 1 : facciata === 'left' ? -1 : 0);
      const fty = posTile.ty + (facciata === 'down'  ? 1 : facciata === 'up'   ? -1 : 0);

      // Si può interagire da QUALSIASI direzione: si controlla la casella che
      // guardi, poi quella sotto i piedi, poi le 4 adiacenti.
      const caselle = [
        { tx: ftx, ty: fty },                       // davanti (priorità)
        { tx: posTile.tx, ty: posTile.ty },         // sotto i piedi
        { tx: posTile.tx, ty: posTile.ty - 1 },     // su
        { tx: posTile.tx, ty: posTile.ty + 1 },     // giù
        { tx: posTile.tx - 1, ty: posTile.ty },     // sinistra
        { tx: posTile.tx + 1, ty: posTile.ty },     // destra
      ];

      let trovato = null;
      for (const c of caselle) {
        trovato = this._eventoInCasella(c.tx, c.ty);
        if (trovato) break;
      }

      // Il pulsante [A] ora è sempre visibile e senza etichetta (sess. 5 set
      // 2026, richiesta esplicita: niente più popup col nome di chi hai
      // vicino) — qui basta aggiornare eventoVicino, il click lo controlla
      // da sé (vedi btnInteragisci più sopra).
      eventoVicino = trovato;
    }

    _interagisci(ev) {
      if (bloccato) return;
      const tipo = ev.tipo;

      // Ostacoli MN (trigger_surf, trigger_taglio, trigger_forza, …)
      if (isMnTrigger(tipo)) { this._gestisciTrigger(ev); return; }

      // Leggendario sulla mappa (es. i Regi): premendo [A] parte la lotta.
      if (tipo === 'pokemon leggendario' || tipo === 'leggendario') {
        const legId = legIdDaEv(ev);
        const liv = parseInt(ev.props.livello || '50', 10) || 50;
        if (!legId) return;
        const nome = LEG_ID_NOME[legId] || 'Leggendario';

        // "addormentato" (es. Snorlax, unico esemplare del gioco): blocca il
        // passaggio finché non lo svegli con l'oggetto giusto nello zaino
        // (default: Flauto). Finché dorme, [A] mostra solo un flavor-text.
        const addormentato = ev.props.addormentato === true || ev.props.addormentato === 'true';
        if (addormentato) {
          const chiaveOgg = ev.props.sveglia_con || 'flauto';
          const haOggetto = (typeof stato !== 'undefined' && stato.inventario && stato.inventario.chiave &&
                              stato.inventario.chiave[chiaveOgg]);
          const datiOgg = (typeof OGGETTI_CHIAVE !== 'undefined' && OGGETTI_CHIAVE[chiaveOgg]) || null;
          if (!haOggetto) {
            const oggNome = datiOgg ? datiOgg.nome : 'oggetto giusto';
            if (typeof mostraToast === 'function')
              mostraToast(`💤 ${nome} dorme profondamente e russa forte... Serve ${oggNome} per svegliarlo.`, 3200);
            return;
          }
          if (typeof mostraDialogo === 'function') {
            const nomeOgg = datiOgg ? datiOgg.nome : 'oggetto';
            mostraDialogo('', [`Usi il ${nomeOgg}...`, `🎵 ...`, `${nome} si sveglia di soprassalto!`])
              .then(() => {
                if (typeof triggeraLeggendario === 'function')
                  triggeraLeggendario(legId, liv, nome, null, () => { this._rigeneraNpc(); });
              });
          } else if (typeof triggeraLeggendario === 'function') {
            triggeraLeggendario(legId, liv, nome, null, () => { this._rigeneraNpc(); });
          }
          return;
        }

        if (typeof triggeraLeggendario === 'function') {
          triggeraLeggendario(legId, liv, nome, null, () => { this._rigeneraNpc(); });
        }
        return;
      }

      // Evento storia (es. iscrizione dei Regi): mostra un testo/cutscene.
      // Se ha una "condizione" non soddisfatta, resta criptico (messaggio di blocco).
      if (tipo === 'trigger_storia') {
        // Le iscrizioni sono leggibili solo se "comprendi le lingue antiche"
        // (sbloccato a fine Lega). Una "condizione" esplicita ha la precedenza.
        const cond = ev.props.condizione || ev.props.richiede;
        const leggibile = cond ? verificaCondizione(cond).ok
                               : !!(stato && stato.flags && stato.flags.lingue_antiche);
        if (!leggibile) {
          const msg = ev.props.messaggio_gate || '📜 Iscrizione ancora indecifrabile… Torna più in là.';
          if (typeof mostraDialogo === 'function') mostraDialogo('???', [msg]);
          return;
        }
        const testo = ev.props.testo || ev.props.dialogo || '...';
        if (typeof mostraDialogo === 'function') mostraDialogo(ev.nome || '📜 Iscrizione', [testo]);
        return;
      }

      // Cutscene innescata da un oggetto Tiled (type: trigger_cutscene, proprietà
      // cutscene_id). Stesso pattern gate di trigger_storia: condizione opzionale,
      // una_tantum per non poterla rigiocare a piacere.
      if (tipo === 'trigger_cutscene') {
        const cond = ev.props.condizione || ev.props.richiede;
        if (cond) {
          const esito = verificaCondizione(cond);
          if (!esito.ok) {
            const msg = ev.props.messaggio_gate || esito.messaggio || '🔒 Non è ancora il momento.';
            if (typeof mostraToast === 'function') mostraToast(msg, 2500);
            return;
          }
        }
        const idUnivoco = `cutscene:${ev.id || (ev.tx + ',' + ev.ty)}`;
        const unaTantum = ev.props.una_tantum === true || ev.props.una_tantum === 'true';
        if (unaTantum && typeof stato !== 'undefined' && stato.cutsceneViste &&
            stato.cutsceneViste.includes(idUnivoco)) return;
        const cutsceneId = ev.props.cutscene_id || ev.props.cutscene;
        if (!cutsceneId) return;
        this._giocaCutscene(cutsceneId).then(() => {
          if (unaTantum && typeof stato !== 'undefined') {
            if (!stato.cutsceneViste) stato.cutsceneViste = [];
            stato.cutsceneViste.push(idUnivoco);
            if (typeof salvaPartita === 'function') salvaPartita();
          }
        });
        return;
      }

      // Allenatori (gregari + capopalestra): sfida premendo [A] se non già battuti.
      if (tipo === 'trainer') {
        const id = ev.id;
        const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[id] : null;
        const giaBattuto = trainerBattuti.has(id) ||
          (typeof stato !== 'undefined' && stato.allenatoriBattuti && stato.allenatoriBattuti.includes(id));
        if (giaBattuto) {
          // Risfida (sessione 12 agosto): solo allenatori "normali" — niente
          // capipalestra (palestraId), boss di storia (flagVittoria) o rivale
          // (rivale, ha già la sua logica di scaling dedicata). Serve che siano
          // passati 7 giorni di gioco dall'ultima sconfitta.
          const risfidabile = dati && !dati.palestraId && !dati.flagVittoria && !dati.rivale;
          if (risfidabile && typeof stato !== 'undefined') {
            const giornoSconfitta = (stato.allenatoriBattutiGiorno && stato.allenatoriBattutiGiorno[id]) || 0;
            const giornoAttuale = (stato.tempo && stato.tempo.giorno) || 0;
            if (giornoAttuale - giornoSconfitta >= 7) {
              this._offriRisfida(id, dati, ev);
              return;
            }
          }
          if (dati && dati.dialogo_dopo && typeof mostraDialogo === 'function')
            mostraDialogo(dati.nome || id, [dati.dialogo_dopo]);
          return;
        }
        if (dati) this._avviaLottaTrainer(id, dati, ev);
        return;
      }

      if (tipo === 'npc') {
        const dati = (typeof DATI_NPC !== 'undefined') ? DATI_NPC[ev.id] : null;
        const nomeNpc = (dati && dati.nome) || ev.nome || ev.id;
        const haCutscene = dati && dati.cutscene && typeof CUTSCENE !== 'undefined' && CUTSCENE[dati.cutscene];
        if (haCutscene) {
          const unaTantum = dati.cutsceneUnaTantum !== false;   // default: una sola volta
          const idUnivoco = `cutscene_npc:${ev.id}`;
          const giaVista = unaTantum && typeof stato !== 'undefined' && stato.cutsceneViste &&
            stato.cutsceneViste.includes(idUnivoco);
          if (giaVista) {
            if (dati.dialogo_dopo && typeof mostraDialogo === 'function') mostraDialogo(nomeNpc, [dati.dialogo_dopo]);
            return;
          }
          this._giocaCutscene(dati.cutscene).then(() => {
            if (unaTantum && typeof stato !== 'undefined') {
              if (!stato.cutsceneViste) stato.cutsceneViste = [];
              stato.cutsceneViste.push(idUnivoco);
              if (typeof salvaPartita === 'function') salvaPartita();
            }
          });
          return;
        }
        const haAzione = dati && dati.azione && typeof window[dati.azione] === 'function';
        const haDialogo = dati && dati.dialogo && dati.dialogo.length > 0;
        if (haAzione && haDialogo && typeof mostraDialogo === 'function') {
          // Prima il saluto, poi l'azione (es. apertura del negozio).
          mostraDialogo(nomeNpc, dati.dialogo).then(() => window[dati.azione]());
        } else if (haAzione) {
          window[dati.azione]();
        } else if (haDialogo) {
          if (typeof mostraDialogo === 'function') {
            mostraDialogo(nomeNpc, dati.dialogo);
          }
        } else if (ev.props.dialogo) {
          if (typeof mostraDialogo === 'function') {
            mostraDialogo(nomeNpc, [ev.props.dialogo]);
          }
        }
        return;
      }

      if (tipo === 'cartello' || tipo === 'cartel') {
        const testo = ev.props.testo || ev.props.dialogo || '';
        const dati = (typeof DATI_CARTELLI !== 'undefined') ? DATI_CARTELLI[ev.id] : null;
        const testoFinale = (dati && dati.testo) ? dati.testo : testo;
        if (testoFinale && typeof mostraDialogo === 'function') {
          mostraDialogo('Cartello', [testoFinale]);
        }
        return;
      }

      // Porta a scomparsa (Osservatorio CoTrAL, sess. 15 set 2026): con la
      // chiave giusta nello zaino-chiave, [A] la apre per sempre (dialogo +
      // tile rimossi con _nascondiTileOstacolo, niente re-render necessario).
      // ev.props.controllata_da_interruttore:true = questa NON si apre con
      // nessuna chiave, solo l'interruttore della statua al 2F la comanda —
      // qui ci si limita a spiegarlo.
      if (tipo === 'porta_scomparsa') {
        const controllataDaInterruttore = ev.props.controllata_da_interruttore === true ||
          ev.props.controllata_da_interruttore === 'true';
        if (controllataDaInterruttore) {
          if (typeof mostraDialogo === 'function') {
            mostraDialogo('', ['Questa porta non ha una serratura: sembra comandata da qualcos\'altro, da qualche altra parte.']);
          }
          return;
        }
        const chiaveId = ev.props.chiave;
        const haChiave = !!(chiaveId && stato.inventario && stato.inventario.chiave && stato.inventario.chiave[chiaveId]);
        if (!haChiave) {
          if (typeof mostraDialogo === 'function') {
            mostraDialogo('', ['La porta è chiusa a chiave. Ci vorrebbe la chiave giusta.']);
          }
          return;
        }
        (async () => {
          const nomeChiave = (typeof OGGETTI_CHIAVE !== 'undefined' && OGGETTI_CHIAVE[chiaveId]) ? OGGETTI_CHIAVE[chiaveId].nome : 'la chiave segreta';
          if (typeof mostraDialogo === 'function') {
            await mostraDialogo('', [`${this._nomeGiocatore()} usa ${nomeChiave}!`]);
          }
          if (!stato.flags) stato.flags = {};
          stato.flags['porta_aperta_' + ev.id] = true;
          const tx0 = ev.w > 0 ? ev.tx0 : ev.tx, tx1 = ev.w > 0 ? ev.tx1 : ev.tx;
          const ty0 = ev.h > 0 ? ev.ty0 : ev.ty, ty1 = ev.h > 0 ? ev.ty1 : ev.ty;
          for (let ty = ty0; ty <= ty1; ty++)
            for (let tx = tx0; tx <= tx1; tx++) this._nascondiTileOstacolo(tx, ty);
          if (typeof salvaPartita === 'function') salvaPartita();
        })();
        return;
      }

      // Statua-interruttore di Mewtwo (2F Osservatorio, sess. 15 set 2026):
      // prima che il CoTrAL sia scoperto è solo scenografia sospetta; dopo,
      // premendo A si può far scattare l'interruttore nascosto, che decide
      // se la porta_scomparsa "controllata_da_interruttore" al 1F c'è o no.
      if (tipo === 'statua_interruttore') {
        (async () => {
          if (!stato.flags) stato.flags = {};
          const scoperto = !!stato.flags.osservatorio_cotral_scoperto;
          if (!scoperto) {
            if (typeof mostraDialogo === 'function') {
              await mostraDialogo('', ['Questa statua ha qualcosa di strano, chissà...']);
            }
            return;
          }
          if (typeof mostraScelta !== 'function') return;
          const scelta = await mostraScelta('C\'è un pulsante nascosto, vuoi premerlo?', 'Sì', 'No');
          if (scelta !== 1) return;
          stato.flags.cotral_interruttore_premuto = !stato.flags.cotral_interruttore_premuto;
          // Aspetto della statua: normale (1315/1323) o "premuta" (1316/1324),
          // stessi id locali già confermati sul tileset Interior_general_32.
          // ev.tx/ev.ty = casella INFERIORE della statua (dove ci si mette
          // davanti per interagire); quella superiore è una casella sopra.
          const premuto = stato.flags.cotral_interruttore_premuto;
          this._impostaTileOstacolo(ev.tx, ev.ty - 1, premuto ? 1316 : 1315);
          this._impostaTileOstacolo(ev.tx, ev.ty, premuto ? 1324 : 1323);
          if (typeof salvaPartita === 'function') salvaPartita();
        })();
        return;
      }

      if (tipo === 'pc') {
        if (typeof apriBoxPC === 'function') apriBoxPC();
        return;
      }

      if (tipo === 'oggetto' || tipo === 'object') {
        // Chiave univoca basata su mappa + posizione: così oggetti diversi che
        // condividono lo stesso "id" in Tiled (es. "univoco") restano indipendenti.
        const idUnivoco = `${mappaCorrente}:${ev.tx},${ev.ty}`;
        if (typeof stato !== 'undefined' && stato.oggettiRaccolti && stato.oggettiRaccolti.includes(idUnivoco)) return;
        // Normalizza il nome (es. "caramella rara" → "caramellarara") per farlo
        // combaciare con le chiavi reali in OGGETTI/zaino.
        let contenuto = ev.props.contenuto || 'pozione';
        const norm = String(contenuto).toLowerCase().replace(/\s+/g, '');
        if (typeof OGGETTI !== 'undefined' && OGGETTI[norm]) contenuto = norm;
        const qta = parseInt(ev.props['quantità'] || ev.props.quantita || '1', 10);
        if (typeof stato !== 'undefined') {
          if (!stato.zaino[contenuto]) stato.zaino[contenuto] = 0;
          stato.zaino[contenuto] += qta;
          if (!stato.oggettiRaccolti) stato.oggettiRaccolti = [];
          stato.oggettiRaccolti.push(idUnivoco);
          this._nascondiTileOggetto(ev);
          const nomeVis = (typeof OGGETTI !== 'undefined' && OGGETTI[contenuto]) ? OGGETTI[contenuto].nome : contenuto;
          if (typeof mostraToast === 'function')
            mostraToast(`Hai trovato ${qta}× ${nomeVis}!`, 3000);
          if (typeof salvaPartita === 'function') salvaPartita();
        }
        return;
      }
    }

    /* ────────── CUTSCENE (sequenze scriptate, vedi dati/cutscene.js) ────────── */

    // Esegue tutti i passi di una cutscene in ordine, bloccando il movimento
    // per tutta la durata. Vedi dati/cutscene.js per i tipi di passo supportati.
    async _giocaCutscene(cutsceneId) {
      const passi = (typeof CUTSCENE !== 'undefined') ? CUTSCENE[cutsceneId] : null;
      if (!passi) { console.warn('[Cutscene] id sconosciuto:', cutsceneId); return; }
      bloccaMovimento();
      try {
        for (const passo of passi) {
          await this._eseguiPassoCutscena(passo);
        }
      } catch (err) {
        console.error('[Cutscene] errore durante', cutsceneId, err);
      }
      sbloccaMovimento();
    }

    // Cutscene "allo spawn": un oggetto trigger_cutscene con proprietà
    // quando: 'spawn' parte da sola appena la mappa è pronta (niente [A]),
    // una volta sola per default (una_tantum: false per farla ripetere ad
    // ogni ingresso nella mappa). Chiamata a fine caricamento mappa/cluster,
    // quando NPC e player sono già piazzati.
    _controllaCutsceneSpawn() {
      // 1) Tabella CUTSCENE_SPAWN (in codice, vedi cima file): niente oggetto
      // Tiled da mantenere, comoda per test rapidi.
      const cutsceneCodice = CUTSCENE_SPAWN[mappaCorrente];
      if (cutsceneCodice) {
        const idUnivoco = `cutscene_spawn_codice:${mappaCorrente}`;
        const giaVista = typeof stato !== 'undefined' && stato.cutsceneViste &&
          stato.cutsceneViste.includes(idUnivoco);
        if (!giaVista) {
          this._giocaCutscene(cutsceneCodice).then(() => {
            if (typeof stato !== 'undefined') {
              if (!stato.cutsceneViste) stato.cutsceneViste = [];
              stato.cutsceneViste.push(idUnivoco);
              if (typeof salvaPartita === 'function') salvaPartita();
            }
          });
          return;
        }
      }

      // 2) Oggetto Tiled trigger_cutscene con quando:'spawn' (la via "definitiva",
      // piazzata da Luca in Tiled — vedi docs/GUIDA-CUTSCENE.md).
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'trigger_cutscene' || ev.props.quando !== 'spawn') continue;

        const cond = ev.props.condizione || ev.props.richiede;
        if (cond && !verificaCondizione(cond).ok) continue;

        const idUnivoco = `cutscene_spawn:${mappaCorrente}:${ev.id || (ev.tx + ',' + ev.ty)}`;
        const unaTantum = ev.props.una_tantum !== false;   // default: una sola volta
        const giaVista = typeof stato !== 'undefined' && stato.cutsceneViste &&
          stato.cutsceneViste.includes(idUnivoco);
        if (unaTantum && giaVista) continue;

        const cutsceneId = ev.props.cutscene_id || ev.props.cutscene;
        if (!cutsceneId) continue;

        this._giocaCutscene(cutsceneId).then(() => {
          if (unaTantum && typeof stato !== 'undefined') {
            if (!stato.cutsceneViste) stato.cutsceneViste = [];
            stato.cutsceneViste.push(idUnivoco);
            if (typeof salvaPartita === 'function') salvaPartita();
          }
        });
        return;   // una sola cutscene di spawn per volta, anche se ce ne fossero più d'una piazzate
      }
    }

    _eseguiPassoCutscena(passo) {
      switch (passo.tipo) {
        case 'dialogo': {
          const righe = Array.isArray(passo.testo) ? passo.testo : [passo.testo];
          if (typeof mostraDialogo !== 'function') return Promise.resolve();
          return mostraDialogo(passo.nome || '', righe);
        }
        case 'aspetta':
          return new Promise(r => setTimeout(r, passo.ms || 500));
        case 'flag':
          if (typeof stato !== 'undefined') {
            if (!stato.flags) stato.flags = {};
            stato.flags[passo.nome] = passo.valore;
          }
          return Promise.resolve();
        // Regala un oggetto dentro una cutscene (es. la Pietra Rubino dello
        // scienziato liberato, Grotta del Vulcano). Con `chiave: true` va in
        // stato.inventario.chiave[contenuto] = true (oggetti-chiave non
        // consumabili, es. Flauto — vedi OGGETTI_CHIAVE in js/data.js),
        // altrimenti nello zaino come gli oggetti raccolti a terra (tipo
        // 'oggetto' nel layer eventi), riusato qui per un dono scriptato.
        case 'oggetto': {
          if (typeof stato === 'undefined') return Promise.resolve();
          if (passo.chiave) {
            if (typeof OGGETTI_CHIAVE !== 'undefined' && OGGETTI_CHIAVE[passo.contenuto]) {
              if (!stato.inventario) stato.inventario = { chiave: {} };
              if (!stato.inventario.chiave) stato.inventario.chiave = {};
              stato.inventario.chiave[passo.contenuto] = true;
              const def = OGGETTI_CHIAVE[passo.contenuto];
              if (typeof mostraToast === 'function')
                mostraToast(`${def.icona || '🔑'} Hai ricevuto: ${def.nome}!`, 3500);
            }
          } else if (typeof OGGETTI !== 'undefined' && OGGETTI[passo.contenuto]) {
            const qta = passo.quantita || 1;
            if (!stato.zaino[passo.contenuto]) stato.zaino[passo.contenuto] = 0;
            stato.zaino[passo.contenuto] += qta;
            if (typeof mostraToast === 'function')
              mostraToast(`Hai ricevuto ${qta}× ${OGGETTI[passo.contenuto].nome}!`, 3000);
          }
          if (typeof aggiornaHUD === 'function') aggiornaHUD();
          return Promise.resolve();
        }
        case 'muovi_npc':
          return this._cutscenaMuoviNpc(passo.npc, passo.direzione, passo.passi || 1);
        case 'muovi_npc_verso_giocatore': {
          const st = npcStato.find(s => s.id === passo.npc);
          if (!st) { console.warn('[Cutscene] NPC non trovato sulla mappa:', passo.npc); return Promise.resolve(); }
          return this._camminaVersoGiocatore(st, passo.maxPassi);
        }
        case 'muovi_player':
          return this._cutscenaMuoviPlayer(passo.direzione, passo.passi || 1);
        case 'guarda':
          return this._cutscenaGuarda(passo.npc, passo.direzione);
        case 'nascondi_npc':
        case 'mostra_npc': {
          const st = npcStato.find(s => s.id === passo.npc);
          if (st && st.sprite) st.sprite.setVisible(passo.tipo === 'mostra_npc');
          return Promise.resolve();
        }
        case 'esclamativo':
          return this._cutscenaEsclamativo(passo.npc, passo.durata || 700);
        case 'guarda_reciproco':
          return this._cutscenaGuardaReciproco(passo.npc);
        case 'camera':
          return this._cutscenaCamera(passo);
        case 'camera_reset':
          if (playerSprite) this.cameras.main.startFollow(playerSprite, true, 0.15, 0.15, 0, tileSize / 2);
          return Promise.resolve();
        // Schermo nero (dissolvenza camera nativa Phaser): usato per coprire
        // un _rigeneraNpc() a metà cutscene (es. i GdF che spariscono da
        // TUTTI i piani della Grotta del Vulcano dopo "filiamo") così non si
        // vede lo scatto secco della sparizione.
        case 'fade_out':
          return new Promise(resolve => {
            if (!scena) { resolve(); return; }
            scena.cameras.main.once('camerafadeoutcomplete', resolve);
            scena.cameras.main.fadeOut(passo.ms || 500, 0, 0, 0);
          });
        case 'fade_in':
          return new Promise(resolve => {
            if (!scena) { resolve(); return; }
            scena.cameras.main.once('camerafadeincomplete', resolve);
            scena.cameras.main.fadeIn(passo.ms || 500, 0, 0, 0);
          });
        // Ricrea NPC/trainer/leggendari da capo (rilegge gate/condizione) SENZA
        // uscire dalla cutscene: pensato per andare fra un fade_out e un
        // fade_in, così un flag appena settato (es. "il boss è sconfitto")
        // fa sparire i trainer sugli altri piani mentre lo schermo è nero.
        case 'rigenera_npc':
          return this._rigeneraNpc();
        default:
          console.warn('[Cutscene] tipo di passo sconosciuto:', passo.tipo);
          return Promise.resolve();
      }
    }

    // Fa camminare un NPC già piazzato sulla mappa di N caselle in una direzione,
    // fermandosi da sola se trova un ostacolo (non è un teletrasporto: se la strada
    // è più corta del previsto, la cutscene continua comunque dal passo successivo).
    async _cutscenaMuoviNpc(npcId, direzione, passi) {
      const st = npcStato.find(s => s.id === npcId);
      if (!st) { console.warn('[Cutscene] NPC non trovato sulla mappa:', npcId); return; }
      st.dir = direzione;
      const { dx, dy } = this._dirDelta(direzione);
      for (let i = 0; i < passi; i++) {
        const nx = st.tx + dx, ny = st.ty + dy;
        if (!this._liberoPerNPC(nx, ny, st)) break;
        await this._passoTrainer(st, nx, ny);
      }
      if (st.sprite) this._setNpcFrame(st.sprite, st.dir, false);
    }

    // Cammino forzato del giocatore (niente input, nessuna interazione con
    // acqua/Surf/massi — per quei casi va scritta una cutscene ad hoc più avanti).
    async _cutscenaMuoviPlayer(direzione, passi) {
      const { dx, dy } = this._dirDelta(direzione);
      facciata = direzione;
      for (let i = 0; i < passi; i++) {
        const nx = posTile.tx + dx, ny = posTile.ty + dy;
        if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) break;
        if (collGrid && collGrid[ny] && collGrid[ny][nx] === 1) break;
        await new Promise(resolve => {
          this._passoFollower(posTile.tx, posTile.ty);
          posTile = { tx: nx, ty: ny };
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('walk', facciata), true);
          const px = nx * tileSize + tileSize / 2;
          const py = (ny + 1) * tileSize;
          if (!playerSprite) { resolve(); return; }
          scena.tweens.add({
            targets: playerSprite, x: px, y: py, duration: DURATA_PASSO_MS, ease: 'Linear',
            onComplete: () => {
              playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
              resolve();
            },
          });
        });
      }
    }

    _cutscenaGuarda(chi, direzione) {
      if (chi === 'player') {
        facciata = direzione;
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
        return Promise.resolve();
      }
      const st = npcStato.find(s => s.id === chi);
      if (st) { st.dir = direzione; this._setNpcFrame(st.sprite, direzione, false); }
      return Promise.resolve();
    }

    // Direzione cardinale (nord/sud/est/ovest) dalla casella (tx0,ty0) verso
    // (tx1,ty1) — asse con distanza maggiore vince, come le altre euristiche
    // "a vista" già usate nel motore (_camminaVersoGiocatore).
    _direzioneTraCaselle(tx0, ty0, tx1, ty1) {
      const dx = tx1 - tx0, dy = ty1 - ty0;
      if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'est' : 'ovest';
      return dy >= 0 ? 'sud' : 'nord';
    }

    // Passo cutscene "guarda_reciproco": l'NPC si gira verso il giocatore E il
    // giocatore si gira verso l'NPC, come un vero dialogo faccia a faccia
    // (richiesto per la scena di Rocca di Papa, npc1 che raggiunge il player).
    _cutscenaGuardaReciproco(chi) {
      const st = npcStato.find(s => s.id === chi);
      if (!st) return Promise.resolve();
      const dirNpcVersoPlayer = this._direzioneTraCaselle(st.tx, st.ty, posTile.tx, posTile.ty);
      const dirPlayerVersoNpc = this._direzioneTraCaselle(posTile.tx, posTile.ty, st.tx, st.ty);
      st.dir = dirNpcVersoPlayer;
      this._setNpcFrame(st.sprite, dirNpcVersoPlayer, false);
      facciata = dirPlayerVersoNpc;
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      return Promise.resolve();
    }

    // Passo cutscene "esclamativo": vignetta bianca stile fumetto con "!" che
    // esce sopra la testa dell'NPC per `durata` ms (es. quando nota il
    // giocatore, come un allenatore che ti vede). Puramente visivo, nessuno
    // stato persistito.
    _cutscenaEsclamativo(chi, durata) {
      const st = npcStato.find(s => s.id === chi);
      if (!st || !st.sprite) return Promise.resolve();
      return new Promise(resolve => {
        const px = st.sprite.x;
        const py = st.sprite.y - 46;
        const bolla = this.add.ellipse(px, py, 26, 22, 0xffffff, 1)
          .setStrokeStyle(2, 0x333333).setDepth(200);
        const punta = this.add.triangle(px - 6, py + 9, 0, 0, 8, 0, 0, 10, 0xffffff, 1)
          .setStrokeStyle(2, 0x333333).setDepth(200);
        const testo = this.add.text(px, py, '!', {
          fontFamily: 'Arial', fontSize: '16px', fontStyle: 'bold', color: '#333333',
        }).setOrigin(0.5).setDepth(201);
        this.time.delayedCall(durata, () => {
          bolla.destroy(); punta.destroy(); testo.destroy();
          resolve();
        });
      });
    }

    // Sposta la camera su un NPC o su una casella tx/ty per `durata` ms.
    // camera_reset la riporta a seguire il giocatore.
    _cutscenaCamera(passo) {
      let tx = passo.tx, ty = passo.ty;
      if (passo.npc) {
        const st = npcStato.find(s => s.id === passo.npc);
        if (st) { tx = st.tx; ty = st.ty; }
      }
      if (tx === undefined || ty === undefined) return Promise.resolve();
      const px = tx * tileSize + tileSize / 2;
      const py = ty * tileSize + tileSize / 2;
      this.cameras.main.stopFollow();
      return new Promise(resolve => {
        this.cameras.main.pan(px, py, passo.durata || 800, 'Sine.easeInOut', false, (_cam, progress) => {
          if (progress >= 1) resolve();
        });
      });
    }

    // Crea un NPC "finto" (non viene da Tiled, non resta dopo l'uso) in una
    // casella vicino al giocatore, per le cutscene dove serve "qualcuno che
    // arriva" senza doverlo piazzare a mano su ogni mappa. Restituisce lo
    // stato npcStato-like: usalo con _camminaVersoGiocatore, poi _distruggiNpcTemp.
    async _spawnNpcTemp(spriteFile, offsetTile) {
      const dx = offsetTile && offsetTile.dx || 0;
      const dy = offsetTile && offsetTile.dy || 0;
      let tx = Math.max(0, Math.min(mapW - 1, posTile.tx + dx));
      let ty = Math.max(0, Math.min(mapH - 1, posTile.ty + dy));
      // Se la casella scelta è bloccata (muro/acqua), prova le celle adiacenti
      // prima di rassegnarsi a spawnare comunque lì (non è fatale, solo estetico).
      if (collGrid && collGrid[ty] && collGrid[ty][tx] === 1) {
        const alternative = [[dx, 0], [0, dy], [-dx, 0], [0, -dy]];
        for (const [adx, ady] of alternative) {
          const ax = Math.max(0, Math.min(mapW - 1, posTile.tx + adx));
          const ay = Math.max(0, Math.min(mapH - 1, posTile.ty + ady));
          if (!collGrid[ay] || collGrid[ay][ax] !== 1) { tx = ax; ty = ay; break; }
        }
      }
      const dir = (Math.abs(dx) > Math.abs(dy)) ? (dx > 0 ? 'ovest' : 'est') : (dy > 0 ? 'nord' : 'sud');
      const texKey = await this._caricaTexNpc(spriteFile);
      const DIR_FRAME = { nord: 13, sud: 1, est: 9, ovest: 5 };
      const px = tx * tileSize + tileSize / 2;
      const py = (ty + 1) * tileSize;
      const spr = texKey
        ? this.add.sprite(px, py, texKey, DIR_FRAME[dir] || 1).setOrigin(0.5, 1).setDepth(20)
        : null;
      const st = {
        id: `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        tipo: 'trainer', tx, ty, homeTx: tx, homeTy: ty, dir,
        sprite: spr, ev: { props: {} }, movimento: 'fisso',
      };
      npcStato.push(st);
      if (spr) npcSprites.push(spr);
      return st;
    }

    // Rimuove un NPC temporaneo creato con _spawnNpcTemp (sprite + stato).
    _distruggiNpcTemp(st) {
      if (st.sprite) {
        const i = npcSprites.indexOf(st.sprite);
        if (i >= 0) npcSprites.splice(i, 1);
        st.sprite.destroy();
      }
      const j = npcStato.indexOf(st);
      if (j >= 0) npcStato.splice(j, 1);
    }

    // Cammina "a vista" verso il giocatore, un passo alla volta (asse con più
    // distanza per primo), finché non è adiacente o esaurisce i tentativi.
    // Usato sia da _spawnNpcTemp/sfide sia dal passo cutscene generico
    // 'muovi_npc_verso_giocatore' (vedi _eseguiPassoCutscena).
    async _camminaVersoGiocatore(st, maxPassi) {
      let tentativi = maxPassi || 20;
      while (tentativi-- > 0) {
        const dtx = posTile.tx - st.tx, dty = posTile.ty - st.ty;
        if (Math.abs(dtx) + Math.abs(dty) <= 1) break;   // già adiacente
        const provaOrdine = Math.abs(dtx) >= Math.abs(dty)
          ? [[Math.sign(dtx), 0], [0, Math.sign(dty)]]
          : [[0, Math.sign(dty)], [Math.sign(dtx), 0]];
        let mosso = false;
        for (const [pdx, pdy] of provaOrdine) {
          if (pdx === 0 && pdy === 0) continue;
          const nx = st.tx + pdx, ny = st.ty + pdy;
          if (!this._liberoPerNPC(nx, ny, st)) continue;
          st.dir = pdx > 0 ? 'est' : pdx < 0 ? 'ovest' : (pdy > 0 ? 'sud' : 'nord');
          await this._passoTrainer(st, nx, ny);
          mosso = true;
          break;
        }
        if (!mosso) break;   // bloccato da qualcosa, non insistere all'infinito
      }
      if (st.sprite) this._setNpcFrame(st.sprite, st.dir, false);
    }

    /* ────────── SFIDA DEI PORCHETTARI (Ariccia) ────────── */

    // Innescata da 'ariccia_sfida_porchettari' (dati/npc.js) tramite
    // sfidaPorchettari() in app.js, DOPO il controllo orario e il dialogo di
    // benvenuto. 5 lotte in sequenza (dati/trainer.js: porchettaro_sfida_1..5);
    // tra una lotta e l'altra un NPC temporaneo cammina verso il giocatore e si
    // annuncia. Vittoria a tutte e 5: Piuma (una tantum, stato.flags.piuma_porchettari).
    async avviaSfidaPorchettari() {
      if (stato.incontroAttivo) return;
      bloccaMovimento();
      for (let n = 1; n <= 5; n++) {
        if (n > 1) {
          const st = await this._spawnNpcTemp('NPC 26', { dx: 0, dy: 3 });
          await this._camminaVersoGiocatore(st);
          if (typeof mostraDialogo === 'function') {
            await mostraDialogo('???', [`Sono il numero ${n}, fatti sotto!`]);
          }
          this._distruggiNpcTemp(st);
        }
        const vinto = await this._lottaPorchettaro(n);
        if (!vinto) { sbloccaMovimento(); return; }
        bloccaMovimento();   // _lottaPorchettaro sblocca a fine lotta: richiudiamo, la sequenza continua
      }
      if (!stato.flags) stato.flags = {};
      stato.flags.piuma_porchettari = true;
      if (!stato.zaino) stato.zaino = {};
      stato.zaino.piuma = (stato.zaino.piuma || 0) + 1;
      if (typeof salvaPartita === 'function') salvaPartita();
      if (typeof aggiornaHUD === 'function') aggiornaHUD();
      sbloccaMovimento();
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Learco', [
          'Cinque su cinque! Sei un vero campione della sagra!',
          'Tieni, questa è la Piuma Iridescente: te la sei guadagnata.',
        ]);
      }
    }

    // Scena Latios/Latias (Tunnel Roccioso 4F) — DUE eventi separati, sessione
    // 6 agosto (riscritta su richiesta esplicita, non è più un'unica sequenza):
    //
    // 1) L'NPC 'npc_latios_latias_tunnel' è fermo, rivolto a nord ("ti vede
    //    come fa un allenatore, non si avvicina"). Scatta DA SOLO (controllato
    //    ogni passo da _checkLatiosLatiasTrigger, chiamata da
    //    _controllaEventiCalpestabili) quando il giocatore finisce ESATTAMENTE
    //    sulla casella un tile a nord dell'NPC (la sua "linea di vista": la
    //    mappa fa incrociare quella colonna più volte, per questo il trigger è
    //    sulla singola casella adiacente, non su tutta la colonna) — oppure
    //    parlandogli direttamente con [A] (azione: 'avviaLatiosLatiasScena').
    //    Solo dialogo, poi i comandi tornano subito al giocatore.
    // 2) Quando il giocatore si avvicina di sua iniziativa a 2 caselle da
    //    Latios O Latias (controllato sempre da _checkLatiosLatiasTrigger):
    //    tremore camera + dissolvenza sprite (scappano, via _leggendario_
    //    ambientale, mai battibili direttamente), poi l'NPC cammina verso il
    //    giocatore (riusa _camminaVersoGiocatore) e dice la battuta finale.
    //    Da qui in poi Latios/Latias sono in roaming su tutta la mappa di
    //    gioco (stato.flags.latiosLatiasRoaming, vedi _checkRoamingLatiosLatias
    //    e triggeraLeggendarioRoaming in app.js).
    async _latiosLatiasCutscene1() {
      if (!stato.flags) stato.flags = {};
      stato.flags.latiosLatiasCutscene1Vista = true;
      bloccaMovimento();
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('???', [
          'Ehi, guarda! Latios e Latias!',
          'Sono mesi che li seguo, non avvicinarti o scapperanno!',
        ]);
      }
      if (typeof salvaPartita === 'function') salvaPartita();
      sbloccaMovimento();
    }

    async _latiosLatiasCutscene2() {
      if (!stato.flags) stato.flags = {};
      stato.flags.latiosLatiasRoaming = true;   // subito: non deve poter ritriggerare
      bloccaMovimento();
      this.cameras.main.shake(350, 0.012);
      const coppia = npcStato.filter(s =>
        s.tipo === 'leggendario_ambientale' && (s.legId === 380 || s.legId === 381));
      for (const st of coppia) {
        if (st.sprite) {
          const spr = st.sprite;
          this.tweens.add({
            targets: spr, alpha: 0, scale: (spr.scale || 1) * 1.4,
            duration: 400, ease: 'Quad.easeIn',
            onComplete: () => spr.destroy(),
          });
          const i = npcSprites.indexOf(spr);
          if (i >= 0) npcSprites.splice(i, 1);
        }
        const j = npcStato.indexOf(st);
        if (j >= 0) npcStato.splice(j, 1);
      }
      await new Promise(r => setTimeout(r, 450));

      const npc = npcStato.find(s => s.id === 'npc_latios_latias_tunnel');
      if (npc) await this._camminaVersoGiocatore(npc, 25);

      if (typeof salvaPartita === 'function') salvaPartita();
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('???', [
          'Bravo complimenti, ora valli a cercare nella mappa, buona fortuna per Diana!',
        ]);
      }
      sbloccaMovimento();
    }

    // Controllata ogni passo (_controllaEventiCalpestabili) SOLO sul 4F del
    // Tunnel Roccioso: fa scattare cutscene1/cutscene2 in automatico in base
    // alla posizione del giocatore, vedi commento sopra.
    _checkLatiosLatiasTrigger() {
      if (mappaCorrente !== 'tunnel_roccioso_4f') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso) return;
      if (!stato.flags) stato.flags = {};

      if (!stato.flags.latiosLatiasCutscene1Vista) {
        const npc = npcStato.find(s => s.id === 'npc_latios_latias_tunnel');
        // Casella "davanti" all'NPC = una casella nella direzione in cui è
        // rivolto DAVVERO in Tiled (property direzione), non un nord fisso:
        // se Luca lo sposta/rigira in Tiled il trigger si adatta da solo.
        if (npc) {
          const { dx, dy } = this._dirDelta(npc.dir);
          if (posTile.tx === npc.tx + dx && posTile.ty === npc.ty + dy) {
            this._latiosLatiasCutscene1();
          }
        }
        return;
      }

      if (!stato.flags.latiosLatiasRoaming) {
        const coppia = npcStato.filter(s =>
          s.tipo === 'leggendario_ambientale' && (s.legId === 380 || s.legId === 381));
        for (const leg of coppia) {
          if (Math.max(Math.abs(posTile.tx - leg.tx), Math.abs(posTile.ty - leg.ty)) <= 2) {
            this._latiosLatiasCutscene2();
            break;
          }
        }
      }
    }

    // Rocca di Papa — cerchio di abitanti preoccupati per Baso (sessione 8
    // agosto): scatta SOLO quando il giocatore si avvicina davvero alla
    // piazza (centro del cerchio ≈ tile 25,43), non appena entra in città.
    // Una tantum (stato.flags.rocca_cutscene1_vista).
    _checkRoccaBasoTrigger() {
      if (mappaCorrente !== 'rocca_di_papa') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso) return;
      if (!stato.flags) stato.flags = {};
      if (stato.flags.rocca_cutscene1_vista || stato.flags.baso_tornato) return;
      const CENTRO_CERCHIO = { tx: 25, ty: 43 };
      if (Math.max(Math.abs(posTile.tx - CENTRO_CERCHIO.tx), Math.abs(posTile.ty - CENTRO_CERCHIO.ty)) <= 5) {
        this._giocaCutscene('rocca_papa_baso_via');
      }
    }

    // Trigger generico "battaglia per prossimità" (oggetto Tiled type
    // trigger_lotta_prossimita, proprietà trainer_id, sess. 8 set 2026 —
    // Grotta del Vulcano): a differenza di "vista" (linea retta larga 1
    // casella, solo nella direzione in cui il trainer guarda) qui basta
    // ENTRARE nella zona da qualunque lato — serve per stanze larghe dove
    // non c'è un corridoio obbligato che garantisca l'allineamento con la
    // vista (es. la sala del boss, dove "vista" da solo non bastava).
    // Due forme supportate, come per i warp: un RETTANGOLO disegnato a mano
    // (attraversalo = trigger, es. una striscia davanti all'ingresso di una
    // stanza) oppure un punto + proprietà "raggio" (cerchio attorno a un
    // singolo tile). Le proprietà speciale/gate/condizione/curaDopoLotta
    // lette da QUESTO oggetto (non dal trainer vero e proprio) passano a
    // _avviaLottaTrainer come se fosse lui il "davanti a cui sei".
    _checkTriggerProssimita() {
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato || trainerSpotting) return;
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'trigger_lotta_prossimita') continue;
        const cond = ev.props.condizione || ev.props.richiede;
        if (cond && verificaCondizione(cond).ok) continue;   // già risolto, non ritriggerare
        let dentro;
        if (ev.w > 0 && ev.h > 0) {
          dentro = posTile.tx >= ev.tx0 && posTile.tx <= ev.tx1 && posTile.ty >= ev.ty0 && posTile.ty <= ev.ty1;
        } else {
          const raggio = parseInt(ev.props.raggio || '5', 10);
          dentro = Math.max(Math.abs(posTile.tx - ev.tx), Math.abs(posTile.ty - ev.ty)) <= raggio;
        }
        if (!dentro) continue;
        const trainerId = ev.props.trainer_id;
        const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[trainerId] : null;
        if (!dati) continue;
        // Stesso trattamento cinematografico di un trainer "a vista" normale
        // ("!" sopra la testa, poi si avvicina), richiesto esplicitamente da
        // Luca — solo che qui l'NPC cammina VERSO il giocatore da qualunque
        // lato (_camminaVersoGiocatore), non in una sola direzione fissa
        // (quella richiederebbe l'allineamento che "vista" non garantiva).
        const st = npcStato.find(s => s.id === trainerId);
        if (st) this._prossimitaSpotta(st, trainerId, dati, ev);
        else this._avviaLottaTrainer(trainerId, dati, ev);   // ripiego: NPC non trovato sulla mappa
        return;
      }
    }

    // Coppie di grunt CoTrAL all'Osservatorio (sess. 15 set 2026): ogni
    // rettangolo Tiled type:'trigger_cotral_coppia' (props trainer_id +
    // trainer_id_2) fa scattare, quando ci si entra, una lotta in doppia
    // con Camilla alleata (stessa tecnica di _battagliaDoppiaAlleato già
    // usata per Baso al Rifugio CoTrAL Rocca) — SOLO se Camilla è già stata
    // reclutata (stato.flags.osservatorio_camilla_alleata) e la coppia non
    // è già stata battuta in precedenza.
    // Boss CoTrAL (2F): solo una battuta minacciosa la prima volta che ci si
    // avvicina (nessuna lotta ancora, per scelta esplicita di Luca — "la
    // vediamo dopo"). Da lì in poi resta un NPC normale (dialogo ripetibile).
    _checkOsservatorioBossTrigger() {
      if (mappaCorrente !== 'osservatorio_interno_2f') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato) return;
      if (!stato.flags) stato.flags = {};
      if (!stato.flags.osservatorio_cotral_scoperto || stato.flags.osservatorio_boss_cutscene_vista) return;
      const boss = npcStato.find(s => s.id === 'cotral_boss_osservatorio');
      if (!boss) return;
      if (Math.max(Math.abs(posTile.tx - boss.tx), Math.abs(posTile.ty - boss.ty)) <= 3) {
        this._cutsceneOsservatorioBoss(boss);
      }
    }

    async _cutsceneOsservatorioBoss(boss) {
      if (!stato.flags) stato.flags = {};
      stato.flags.osservatorio_boss_cutscene_vista = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      await this._mostraEsclamazione(boss);
      const dir = this._direzioneTraCaselle(boss.tx, boss.ty, posTile.tx, posTile.ty);
      boss.dir = dir;
      if (boss.sprite) this._setNpcFrame(boss.sprite, dir, false);
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('???', [
          'Ah, il famoso allenatore che gira con Camilla. Notizie viaggiano in fretta, qui dentro.',
          'Non hai idea di cosa stiamo per scatenare. Ma questo... è un discorso per un\'altra volta.',
        ]);
      }
      if (typeof salvaPartita === 'function') salvaPartita();
      sbloccaMovimento();
    }

    /* ══════════════════════════════════════════════════════════
       CUTSCENE FINALE DEL BOSS (2F) — sess. 18 set 2026.
       Rettangolo Tiled 'inizio cutscene con boss' (Osservatorio_2f.tmj,
       object 18): il Comandante sta spiegando a 3 ricercatori + 2 grunt
       (comparse, dati/npc.js) quanto sono vicini a controllare il meteo.
       Ordina il test finale, la "pallina nel tubo" si anima, poi si accorge
       di te, ride, e Camilla si tira indietro ("uno alla volta") prima
       della VERA lotta 1v1 contro di lui.
       ══════════════════════════════════════════════════════════ */

    // Lotta singola (non doppia) impacchettata in una Promise, sullo stesso
    // modello di _battagliaDoppiaAlleato: serve per poterla awaitare dentro
    // una cutscene invece di passare da _avviaLottaTrainer (che gestisce da
    // solo dialogo/ricompensa, qui invece li scriviamo a mano nella scena).
    _battagliaSingola(datiAllenatore) {
      return new Promise(resolve => {
        stato.incontroAttivo = true;
        Battle.avvia({
          allenatore: datiAllenatore,
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            resolve(esito);
          },
        });
      });
    }

    // Fa camminare il FOLLOWER (Camilla, non un npcStato qualsiasi: vedi
    // followerSprite/followerPos) verso una casella arbitraria, passo per
    // passo con la stessa animazione di _passoTrainer — a differenza di
    // _camminaVersoGiocatore che punta sempre al giocatore, qui la meta è
    // libera (serve per farla avvicinare al BOSS, non a chi la controlla).
    // Aggiorna followerPos alla fine così il normale aggancio "segue il
    // giocatore" (_passoFollower) riparte pulito al primo passo vero dopo
    // la cutscene.
    async _camminaFollowerVerso(targetTx, targetTy, maxPassi) {
      if (!followerSprite) return;
      const virt = { tx: followerPos.tx, ty: followerPos.ty, dir: followerPos.dir, sprite: followerSprite };
      let tentativi = maxPassi || 15;
      while (tentativi-- > 0) {
        const dtx = targetTx - virt.tx, dty = targetTy - virt.ty;
        if (Math.abs(dtx) + Math.abs(dty) <= 1) break;
        const provaOrdine = Math.abs(dtx) >= Math.abs(dty)
          ? [[Math.sign(dtx), 0], [0, Math.sign(dty)]]
          : [[0, Math.sign(dty)], [Math.sign(dtx), 0]];
        let mosso = false;
        for (const [pdx, pdy] of provaOrdine) {
          if (pdx === 0 && pdy === 0) continue;
          const nx = virt.tx + pdx, ny = virt.ty + pdy;
          if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) continue;
          if (collGrid && collGrid[ny] && collGrid[ny][nx] === 1) continue;
          virt.dir = pdx > 0 ? 'est' : pdx < 0 ? 'ovest' : (pdy > 0 ? 'sud' : 'nord');
          await this._passoTrainer(virt, nx, ny);
          mosso = true;
          break;
        }
        if (!mosso) break;
      }
      followerPos = { tx: virt.tx, ty: virt.ty, dir: virt.dir };
      if (followerSprite) this._setNpcFrame(followerSprite, virt.dir, false);
    }

    // Animazione "attivazione del test" (Osservatorio_2f.tmj, tileset
    // Interior_general_32): due blocchi ai capi del tubo (tile LOCALE 1428,
    // trovati a tx4/tx19 ty2) lampeggiano ciclando 1428→1450→1451, mentre
    // una "pallina" attraversa il tubo (1430 sopra/1438 sotto, tx6..17)
    // diventando 1431/1439 una colonna alla volta da sinistra a destra, in
    // ~2.5 secondi — descrizione esatta di Luca ("una pallina che scorre in
    // un tubo"). Alla fine i blocchi restano "accesi" (1450): il sistema è
    // ora attivo. NOTA: è un'animazione SOLO visiva sul tilemap in memoria
    // (_impostaTileOstacolo), non persiste tra un caricamento mappa e
    // l'altro — accettabile per una cutscene unica e irripetibile.
    // Come _impostaTileOstacolo ma ristretto al SOLO layer "edifici" (depth
    // 2, stessa convenzione di _nascondiTileOggetto altrove nel file) — la
    // versione precedente (senza filtro di profondità) scriveva su OGNI
    // layer con un tile in quella cella, incluso "sopra_testa" (depth 50):
    // a tx9/ty3, proprio sopra il tubo, sopra_testa ha un suo tile decorativo
    // (1458) che veniva sovrascritto per sbaglio con 1430/1439 a ogni
    // passaggio della "pallina" — bug segnalato da Luca ("hai sostituito
    // troppi tile"), sess. 18 set 2026. Il layer "edifici" qui ha comunque
    // UN solo tileset coprendo queste celle (Interior_general_32), quindi
    // basta il primo match a questa profondità.
    _impostaTileTubo(tx, ty, localId) {
      const worldX = tx * tileSize + tileSize / 2;
      const worldY = ty * tileSize + tileSize / 2;
      for (const o of layerObjects) {
        if (o.depth !== 2) continue;   // 2 = depth del layer "edifici"
        const tile = o.layer.getTileAtWorldXY(worldX, worldY, true);
        if (tile) { o.layer.putTileAt(localId, tx, ty); return; }
      }
      console.warn('[Osservatorio] Nessun tile "edifici" trovato per animazione tubo a', tx, ty);
    }

    async _animazioneAttivazioneTuboOsservatorio() {
      const CAPS = [{ tx: 4, ty: 2 }, { tx: 19, ty: 2 }];
      const PIPE_TX_START = 6, PIPE_TX_END = 17;
      const PIPE_TY_TOP = 2, PIPE_TY_BOTTOM = 3;
      const DURATA_TOTALE_MS = 2500;
      const passi = PIPE_TX_END - PIPE_TX_START + 1;
      const perPasso = DURATA_TOTALE_MS / passi;

      let lampeggioAttivo = true;
      let frameLamp = 0;
      const FRAMES_LAMP = [1428, 1450, 1451];
      const timerLamp = setInterval(() => {
        if (!lampeggioAttivo) return;
        frameLamp = (frameLamp + 1) % FRAMES_LAMP.length;
        for (const c of CAPS) this._impostaTileTubo(c.tx, c.ty, FRAMES_LAMP[frameLamp]);
      }, 300);

      for (let i = 0; i < passi; i++) {
        const tx = PIPE_TX_START + i;
        this._impostaTileTubo(tx, PIPE_TY_TOP, 1431);
        this._impostaTileTubo(tx, PIPE_TY_BOTTOM, 1439);
        if (i > 0) {
          const prevTx = tx - 1;
          this._impostaTileTubo(prevTx, PIPE_TY_TOP, 1430);
          this._impostaTileTubo(prevTx, PIPE_TY_BOTTOM, 1438);
        }
        await new Promise(r => setTimeout(r, perPasso));
      }
      this._impostaTileTubo(PIPE_TX_END, PIPE_TY_TOP, 1430);
      this._impostaTileTubo(PIPE_TX_END, PIPE_TY_BOTTOM, 1438);

      lampeggioAttivo = false;
      clearInterval(timerLamp);
      for (const c of CAPS) this._impostaTileTubo(c.tx, c.ty, 1450);
    }

    _checkOsservatorioBossFinaleTrigger() {
      if (mappaCorrente !== 'osservatorio_interno_2f') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato || trainerSpotting) return;
      if (!stato.flags) stato.flags = {};
      if (!stato.flags.osservatorio_cotral_scoperto || stato.flags.osservatorio_boss_finale_vista) return;
      const trigger = eventiMappa.find(ev => ev.tipo === 'trigger_boss_finale_osservatorio');
      if (!trigger) return;
      const dentro = (trigger.w > 0 && trigger.h > 0)
        ? (posTile.tx >= trigger.tx0 && posTile.tx <= trigger.tx1 && posTile.ty >= trigger.ty0 && posTile.ty <= trigger.ty1)
        : (posTile.tx === trigger.tx && posTile.ty === trigger.ty);
      if (!dentro) return;
      this._cutsceneBossFinaleOsservatorio();
    }

    async _cutsceneBossFinaleOsservatorio() {
      if (!stato.flags) stato.flags = {};
      // Subito: non deve poter ripartire, e supera anche la vecchia battuta
      // a distanza (_checkOsservatorioBossTrigger) se non fosse già scattata.
      stato.flags.osservatorio_boss_finale_vista = true;
      stato.flags.osservatorio_boss_cutscene_vista = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      // Ri-asserisce l'override "Camilla come follower" per sicurezza — se
      // per qualunque motivo si fosse perso prima di arrivare qui, non deve
      // ripiombare sul tuo primo Pokémon proprio nella scena più importante
      // (segnalato da Luca, sess. 18 set 2026).
      await this._impostaFollowerAlleato('trainer_LEADER_Camilla');

      const boss = npcStato.find(s => s.id === 'cotral_boss_osservatorio');
      if (!boss) { sbloccaMovimento(); return; }

      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Comandante', [
          'Siamo così vicini. Un altro test, uno solo, e avremo il pieno controllo del meteo.',
          'E chi controlla il meteo... controlla tutto il resto.',
          'Abbiamo già catturato gli esemplari che ci servivano. Restano solo i test giusti da fare, e questo è l\'ultimo.',
        ]);
        await mostraDialogo('Comandante', ['Avvia il test.']);
        await mostraDialogo('Ricercatore', ['Sì, capo. Procedo subito.']);
      }

      await new Promise(r => setTimeout(r, 1000));
      // La macchina/tubo è disegnata molti tile più a nord del punto dove sei
      // fermo (trigger a valle, per lasciare spazio alla scena) — senza
      // spostare la camera lì, l'animazione avviene fuori schermo e non si
      // vede MAI (bug segnalato da Luca, sess. 18 set 2026: "la fase grafica
      // del test non l'hai implementata" — era implementata, solo invisibile).
      await this._cutscenaCamera({ tx: 11, ty: 3, durata: 700 });
      await this._animazioneAttivazioneTuboOsservatorio();
      await this._eseguiPassoCutscena({ tipo: 'camera_reset' });
      await new Promise(r => setTimeout(r, 400));   // tempo alla camera di tornare sul giocatore

      // Il Comandante si accorge di te, si gira e ride.
      boss.dir = 'sud';
      if (boss.sprite) this._setNpcFrame(boss.sprite, 'sud', false);
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Comandante', [
          'Tu chi... aspetta. Ti riconosco. Sei quello che è venuto a rompere le uova nel paniere anche a Rocca di Papa, vero?',
          'Il nostro rifugio là sotto, il luogotenente, tutto quanto. Notizie di questo tipo viaggiano in fretta, anche tra un\'organizzazione e l\'altra.',
          'Ma questa volta è diverso. Lì eravamo solo agli inizi. Qui abbiamo finito.',
          'Vieni pure, fatti sotto! Ho appena acquisito il controllo dei Pokémon necessari: non potrai battermi.',
        ]);
      }

      // Il giocatore si gira verso Camilla (dietro di sé: il follower sta
      // sempre nella casella opposta alla direzione in cui si guarda).
      const dirVersoCamilla = (facciata === 'up') ? 'down' : (facciata === 'down') ? 'up'
        : (facciata === 'left') ? 'right' : 'left';
      facciata = dirVersoCamilla;
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      const dirCamillaVersoPlayer = this._direzioneTraCaselle(followerPos.tx, followerPos.ty, posTile.tx, posTile.ty);
      if (followerSprite) this._setNpcFrame(followerSprite, dirCamillaVersoPlayer, false);

      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Camilla', [
          `${this._nomeGiocatore()}, non è saggio affrontarlo insieme. Andiamo uno alla volta: non sappiamo di cosa è capace.`,
        ]);
      }

      // Camilla si avvicina al boss, breve schermata nera (tenuta un po' più
      // lunga apposta, richiesta esplicita di Luca), poi si fa da parte (un
      // passo a sinistra rispetto a lui) e si volta verso di te. Da qui in
      // poi combatti DA SOLO: si stacca da te come follower (torna a
      // mostrarsi il tuo Pokémon in squadra, come prima che lei si unisse) —
      // non ti segue più dentro la lotta (richiesta esplicita di Luca,
      // sess. 18 set 2026: "Camilla si deve staccare da me dopo che ha
      // provato a sfidare il boss").
      await this._camminaFollowerVerso(boss.tx, boss.ty + 1, 12);
      await this._eseguiPassoCutscena({ tipo: 'fade_out', ms: 500 });
      const latoTx = boss.tx - 1, latoTy = boss.ty + 1;
      if (followerSprite) {
        followerSprite.setPosition(latoTx * tileSize + tileSize / 2, (latoTy + 1) * tileSize);
      }
      followerPos = { tx: latoTx, ty: latoTy, dir: 'est' };
      const dirCamilla2 = this._direzioneTraCaselle(latoTx, latoTy, posTile.tx, posTile.ty);
      if (followerSprite) this._setNpcFrame(followerSprite, dirCamilla2, false);
      await this._impostaFollowerAlleato();   // si stacca: niente più Camilla come follower
      await new Promise(r => setTimeout(r, 1000));   // schermata nera 1s più lunga
      await this._eseguiPassoCutscena({ tipo: 'fade_in', ms: 500 });

      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Camilla', [
          `Non ce l'ho fatta. È il tuo turno. In bocca al lupo, ${this._nomeGiocatore()}.`,
        ]);
      }

      // Il boss ti si avvicina.
      await this._camminaVersoGiocatore(boss, 10);
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Comandante', [
          'È inutile. Anche tu non riuscirai in questa impresa folle.',
        ]);
      }

      const esito = await this._battagliaSingola(DATI_TRAINER['cotral_boss_osservatorio']);
      // NIENTE reset dell'override qui: da quando si è fatta da parte,
      // Camilla resta staccata come follower per il resto della scena
      // (richiesta esplicita di Luca) — combatti da solo, vinci o perdi.

      if (esito === 'vittoria') {
        const premio = DATI_TRAINER['cotral_boss_osservatorio'].premio || 0;
        if (premio > 0) {
          stato.soldi = (stato.soldi || 0) + premio;
        }
        if (typeof mostraDialogo === 'function') {
          await mostraDialogo('Comandante', [
            'Non... non è possibile. Avevo programmato tutto, ogni singola variabile, ogni singolo dettaglio.',
            'Come diavolo è possibile che un allenatore qualunque mandi all\'aria anni di lavoro in un pomeriggio?',
          ]);
          await mostraDialogo('Comandante', [
            'Filiamo, ragazzi. Ora chi lo sente, il Capo... sarà furioso.',
          ]);
        }
        if (premio > 0 && typeof mostraToast === 'function') {
          mostraToast(`Hai ricevuto ₽${premio} per la vittoria!`, 3200);
        }
        stato.flags.osservatorio_boss_finale_sconfitto = true;
        stato.flags.osservatorio_boss_area_attiva = false;   // boss e comparse spariscono per sempre
        await this._eseguiPassoCutscena({ tipo: 'fade_out', ms: 500 });
        await this._rigeneraNpc();
        await this._eseguiPassoCutscena({ tipo: 'fade_in', ms: 500 });
        if (typeof salvaPartita === 'function') salvaPartita();
        sbloccaMovimento();
        return;
      }

      // Sconfitta/fuga: si può ritentare (non tocchiamo i flag "vista").
      stato.flags.osservatorio_boss_finale_vista = false;
      sbloccaMovimento();
      if (typeof salvaPartita === 'function') salvaPartita();
    }

    // Grunt CoTrAL dell'Osservatorio (sess. 15 set 2026, RIDISEGNATO dopo il
    // primo giro — "coppie in scatola" bocciate da Luca): ognuno è SOLO,
    // libero di girare per il piano (movimento:'random' sull'oggetto Tiled),
    // con una squadra da 4-6 Pokémon per reggere da solo un 2 CONTRO 1 (tu +
    // Camilla alleata). Il trigger è semplicemente la prossimità/adiacenza
    // al singolo NPC (come il vecchio "trigger_lotta_prossimita" a raggio,
    // ma per QUALSIASI grunt attivo trovato su npcStato — si muovono, non ha
    // senso più un rettangolo fisso in Tiled).
    // Luogotenente e Boss restano fermi ("ci devo parlare io", richiesta
    // esplicita di Luca): niente trigger automatico per loro, solo [A] —
    // vedi azione:'interagisciLuogotenenteOsservatorio' in dati/npc.js.
    _idCotralFermi() {
      return ['cotral_osservatorio_luogotenente', 'cotral_boss_osservatorio'];
    }

    _checkOsservatorioGruntTrigger() {
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato || trainerSpotting) return;
      if (!stato.flags || !stato.flags.osservatorio_camilla_alleata) return;
      for (const st of npcStato) {
        if (st.tipo !== 'npc') continue;
        if (this._idCotralFermi().includes(st.id)) continue;   // solo [A], non un'imboscata automatica
        if (!stato.flags['grunt_attivo_' + st.id]) continue;
        // Già sconfitto: resta sulla mappa (richiesta esplicita di Luca, sess.
        // 17 set 2026 — "non voglio che spariscano dopo che li ho sconfitti,
        // ti dirò io quando farli sparire"), ma non riattacca più.
        if (stato.flags['grunt_sconfitto_' + st.id]) continue;
        if (Math.max(Math.abs(posTile.tx - st.tx), Math.abs(posTile.ty - st.ty)) > 1) continue;
        const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[st.id] : null;
        if (!dati) continue;
        this._avviaCotralSoloConCamilla(st, st.id, dati);
        return;
      }
    }

    // 2 CONTRO 1: tu + Camilla alleata VS un solo grunt (Battle.avviaDoppia
    // ora tollera opzioni.allenatori con un solo elemento, sess. 15 set 2026).
    // Chiamabile sia dal trigger automatico (grunt liberi) sia da [A] diretto
    // (Luogotenente/Boss, fermi — vedi interagisciLuogotenenteOsservatorio).
    async _avviaCotralSoloConCamilla(st, id, dati, viaInterazione) {
      if (trainerSpotting) return;
      trainerSpotting = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      if (!viaInterazione) await this._mostraEsclamazione(st);
      const dirVersoPlayer = this._direzioneTraCaselle(st.tx, st.ty, posTile.tx, posTile.ty);
      st.dir = dirVersoPlayer;
      if (st.sprite) this._setNpcFrame(st.sprite, dirVersoPlayer, false);
      // Battuta prima della lotta (richiesta esplicita: "voglio dialogo"),
      // come un allenatore normale — dati.dialogo_prima esiste già per
      // tutti questi allenatori.
      if (dati.dialogo_prima && typeof mostraDialogo === 'function') {
        await mostraDialogo(dati.nome || 'Addetto CoTrAL', [dati.dialogo_prima]);
      }
      trainerSpotting = false;

      // NIENTE dialogoSconfitta qui: la battuta finale e la consegna della
      // chiave (Luogotenente) vanno mostrate DOPO, a schermo di battaglia
      // già chiuso — non sovrapposte alla schermata di lotta (richiesta
      // esplicita di Luca, punto 5).
      const alleatoCamilla = { nome: 'Camilla', squadra: [ { id: 59, livello: 55 }, { id: 38, livello: 54 } ] };
      const esito = await this._battagliaDoppiaAlleato(alleatoCamilla, [
        { nome: dati.nome, squadra: dati.squadra, premioSoldi: dati.premio || 0 },
      ]);
      if (esito === 'vittoria') {
        if (!stato.flags) stato.flags = {};
        // NON tocchiamo più grunt_attivo_<id> qui: da richiesta esplicita di
        // Luca (sess. 17 set 2026) il grunt/Luogotenente sconfitto NON deve
        // sparire dall'edificio subito — resta visibile, semplicemente non
        // riattacca più (vedi il check su grunt_sconfitto_<id> nel trigger
        // automatico e in interagisciLuogotenenteOsservatorio). Sarà Luca a
        // dire quando (e con quale meccanica) farli sparire per davvero.
        stato.flags['grunt_sconfitto_' + id] = true;
        if (typeof salvaPartita === 'function') salvaPartita();
        sbloccaMovimento();
        // Battuta di commiato + Chiave Segreta: DOPO sbloccaMovimento, a
        // schermo di mappa (non di battaglia) — punto 5.
        if (dati.dialogo_dopo && typeof mostraDialogo === 'function') {
          await mostraDialogo(dati.nome || 'Addetto CoTrAL', [dati.dialogo_dopo]);
        }
        if (id === 'cotral_osservatorio_luogotenente') {
          if (!stato.inventario) stato.inventario = { chiave: {} };
          if (!stato.inventario.chiave) stato.inventario.chiave = {};
          stato.inventario.chiave['chiave_segreta_cotral'] = true;
          if (typeof mostraToast === 'function') {
            mostraToast('🗝️ Hai ottenuto la Chiave Segreta!', 3200);
          }
          if (typeof salvaPartita === 'function') salvaPartita();
        }
        return;
      }
      sbloccaMovimento();
    }

    // Luogotenente/boss dell'Osservatorio: fermi immobili, si combatte solo
    // interagendo (azione NPC interagisciLuogotenenteOsservatorio in app.js),
    // niente trigger di vicinanza (punto 8, sess. 16 set 2026).
    _avviaLottaOsservatorioSingolaDaId(id) {
      const st = npcStato.find(s => s.id === id);
      if (!st) return;
      const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[id] : null;
      if (!dati) return;
      return this._avviaCotralSoloConCamilla(st, id, dati, true);
    }

    // Elenco dei grunt CoTrAL dell'Osservatorio: id = chiave del flag
    // sintetico 'grunt_attivo_<id>' (vedi _checkOsservatorioGruntTrigger).
    // Usato per accenderli TUTTI insieme nel momento della rivelazione
    // (_cutsceneOsservatorioConfronto).
    _coppieGruntOsservatorio() {
      return [
        'cotral_osservatorio_1f_a', 'cotral_osservatorio_1f_b', 'cotral_osservatorio_1f_c',
        'cotral_osservatorio_2f_a', 'cotral_osservatorio_2f_b',
        'cotral_osservatorio_3f_a', 'cotral_osservatorio_luogotenente',
      ];
    }

    // Genzano, subito fuori dalla palestra (sess. 15 set 2026): appena
    // ottenuta l'8ª medaglia, Camilla ti raggiunge fuori e ti invita
    // all'Osservatorio di Monte Porzio ("nota cambiamenti climatici strani").
    // Controllata ogni passo su Genzano, una tantum
    // (stato.flags.camilla_invito_vista). L'NPC 'camilla_uscita_genzano' è
    // piazzato vicino alla porta della palestra, gated su questo stesso flag
    // (sparisce per sempre dopo, non se ne parla più a Genzano).
    _checkCamillaInvitoTrigger() {
      if (mappaCorrente !== 'genzano') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato) return;
      if (!stato.flags) stato.flags = {};
      if (stato.flags.camilla_invito_vista) return;
      if (!stato.medaglie || !stato.medaglie.includes('genzano')) return;
      // Rettangolo piazzato da Luca in Tiled (subito fuori dalla porta della
      // palestra): attraversarlo fa scattare la cutscene, non serve essere
      // vicini a un NPC specifico.
      const trigger = eventiMappa.find(ev => ev.tipo === 'trigger_camilla_invito');
      if (!trigger) return;
      const dentro = (trigger.w > 0 && trigger.h > 0)
        ? (posTile.tx >= trigger.tx0 && posTile.tx <= trigger.tx1 && posTile.ty >= trigger.ty0 && posTile.ty <= trigger.ty1)
        : (posTile.tx === trigger.tx && posTile.ty === trigger.ty);
      if (!dentro) return;
      const camilla = npcStato.find(s => s.id === 'camilla_uscita_genzano');
      if (camilla) this._cutsceneCamillaInvito(camilla);
    }

    async _cutsceneCamillaInvito(camilla) {
      if (!stato.flags) stato.flags = {};
      stato.flags.camilla_invito_vista = true;   // subito: non deve ritriggerare
      // Da qui in poi Camilla + i 2 grunt esterni possono comparire fuori
      // dall'Osservatorio (vedi condizione sugli oggetti Tiled 35/37/39):
      // prima di questa scena non devono essere visibili anche se qualcuno
      // arriva lì per altre strade — bug segnalato da Luca, sess. 17 set 2026.
      stato.flags.osservatorio_confronto_attivo = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      // Camilla NON è già ferma lì ad aspettarti (richiesta esplicita di
      // Luca): compare alla porta della palestra ed esce camminando verso
      // di te, esattamente come lo scienziato alla Grotta del Vulcano.
      await this._camminaVersoGiocatore(camilla, 20);
      const dirVersoPlayer = this._direzioneTraCaselle(camilla.tx, camilla.ty, posTile.tx, posTile.ty);
      camilla.dir = dirVersoPlayer;
      if (camilla.sprite) this._setNpcFrame(camilla.sprite, dirVersoPlayer, false);
      // Il giocatore si volta verso nord (l'entrata della palestra, da dove
      // arriva Camilla) — altrimenti sembra che lei parli alle sue spalle,
      // qualunque fosse la direzione in cui stava camminando prima del
      // trigger (segnalato da Luca).
      facciata = 'up';
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Camilla', [
          'Aspetta! Volevo parlarti, ora che la sfida tra noi è finita.',
          'Da un po\' di tempo noto dei cambiamenti climatici strani, troppo repentini per essere naturali.',
          'So che all\'Osservatorio di Monte Porzio studiano proprio il clima. Volevo andarci a chiedere spiegazioni.',
          'Potrebbe essere interessante anche per te. Ci vediamo lì, se vuoi.',
        ]);
      }
      await this._eseguiPassoCutscena({ tipo: 'fade_out', ms: 500 });
      stato.flags.camilla_pronta_uscita = false;   // altrimenti resterebbe visibile per sempre
      await this._rigeneraNpc();   // Camilla sparisce da qui per sempre (condizione ora falsa)
      await this._eseguiPassoCutscena({ tipo: 'fade_in', ms: 500 });
      if (typeof salvaPartita === 'function') salvaPartita();
      sbloccaMovimento();
    }

    // Osservatorio, fuori dall'ingresso (sess. 15 set 2026): trovi Camilla
    // che discute con 2 grunt CoTrAL che non la vogliono far entrare. Ti
    // chiede di combattere con lei — battaglia in doppia con Camilla
    // alleata (prima volta che la usiamo per LEI, stessa tecnica di Baso al
    // Rifugio CoTrAL Rocca). Vinta: si rivela tutto il CoTrAL dell'Osservatorio
    // (ogni ricercatore sui 3 piani "diventa" un grunt, la receptionist del
    // 1F sparisce e basta), Camilla resta al tuo fianco come alleata per
    // tutto il dungeon (segue come un Pokémon — vedi _impostaFollowerAlleato).
    _checkOsservatorioConfrontoTrigger() {
      // BUG VERO (trovato sess. 17 set 2026): questo controllo era
      // `mappaCorrente !== 'osservatorio'`, ma dentro il cluster 'montepo' i
      // bounding box di monteporzio (tx 0-54) e osservatorio (tx 22-112) si
      // SOVRAPPONGONO, e _mappaSottoGiocatore() (primo box che contiene la
      // casella, in ordine di dichiarazione) restituisce SEMPRE 'monteporzio'
      // in quella zona di sovrapposizione — che è esattamente dove sta il
      // trigger del confronto. Risultato: mappaCorrente non diventava MAI
      // 'osservatorio' lì, e il trigger restava sordo per sempre, anche con
      // Camilla e i grunt visibili (il loro rendering non passa da
      // mappaCorrente, solo questo controllo lo faceva). Il resto della
      // funzione è già scoping-sufficiente (rettangolo preciso), quindi basta
      // il cluster giusto, non serve più l'uguaglianza esatta su mappaCorrente.
      if (mappaCorrente !== 'osservatorio' && clusterAttivo !== 'montepo') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato || trainerSpotting) return;
      if (!stato.flags) stato.flags = {};
      // Auto-sincronizza osservatorio_confronto_attivo da camilla_invito_vista:
      // serve per i salvataggi già esistenti PRIMA che questo flag esistesse
      // (avevano solo camilla_invito_vista=true, mai passato da qui) — senza
      // questo self-heal il trigger restava sordo per sempre su quei
      // salvataggi anche se Camilla/i grunt erano già visibili sulla mappa
      // (bug segnalato da Luca, sess. 17 set 2026).
      if (stato.flags.camilla_invito_vista && !stato.flags.osservatorio_confronto_vista) {
        stato.flags.osservatorio_confronto_attivo = true;
      }
      if (!stato.flags.osservatorio_confronto_attivo || stato.flags.osservatorio_confronto_vista) return;
      // Rettangolo piazzato da Luca in Tiled (object 41): attraversarlo fa
      // scattare la cutscene, stesso schema del trigger di Genzano.
      const trigger = eventiMappa.find(ev => ev.tipo === 'trigger_confronto_osservatorio');
      if (!trigger) return;
      const dentro = (trigger.w > 0 && trigger.h > 0)
        ? (posTile.tx >= trigger.tx0 && posTile.tx <= trigger.tx1 && posTile.ty >= trigger.ty0 && posTile.ty <= trigger.ty1)
        : (posTile.tx === trigger.tx && posTile.ty === trigger.ty);
      if (!dentro) return;
      const camilla = npcStato.find(s => s.id === 'camilla_confronto_osservatorio');
      if (camilla) this._cutsceneOsservatorioConfronto(camilla);
    }

    async _cutsceneOsservatorioConfronto(camilla) {
      if (!stato.flags) stato.flags = {};
      stato.flags.osservatorio_confronto_vista = true;
      stato.flags.osservatorio_confronto_attivo = false;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);

      const grunt1 = npcStato.find(s => s.id === 'cotral_osservatorio_grunt_ext_1');
      const grunt2 = npcStato.find(s => s.id === 'cotral_osservatorio_grunt_ext_2');
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Camilla', ['Fatemi passare! Devo solo parlare con i ricercatori, non capisco perché mi blocchiate la strada.']);
        await mostraDialogo('Addetto CoTrAL', ['Nessuno entra senza autorizzazione. Ordini dall\'alto, Capopalestra o no.']);
        await mostraDialogo('Camilla', ['Questa storia puzza sempre di più. Non mi piace per niente.']);
      }
      const dirVersoPlayer = this._direzioneTraCaselle(camilla.tx, camilla.ty, posTile.tx, posTile.ty);
      camilla.dir = dirVersoPlayer;
      if (camilla.sprite) this._setNpcFrame(camilla.sprite, dirVersoPlayer, false);
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Camilla', ['Mi dai una mano? Non mi va di affrontarli da sola, e la situazione non mi convince affatto.']);
      }

      const alleatoCamilla = { nome: 'Camilla', squadra: [ { id: 59, livello: 55 }, { id: 38, livello: 54 } ] };
      let esito = 'vittoria';
      if (grunt1 && grunt2) {
        // Niente dialogoSconfitta qui (punto 5, stesso motivo del
        // Luogotenente): il seguito narrativo lo mostra già il codice qui
        // sotto, a schermo di battaglia chiuso.
        esito = await this._battagliaDoppiaAlleato(alleatoCamilla, [
          { nome: grunt1.ev.nome || 'Addetto CoTrAL', squadra: DATI_TRAINER['cotral_osservatorio_grunt_ext_1'].squadra,
            premioSoldi: DATI_TRAINER['cotral_osservatorio_grunt_ext_1'].premio || 0 },
          { nome: grunt2.ev.nome || 'Addetta CoTrAL', squadra: DATI_TRAINER['cotral_osservatorio_grunt_ext_2'].squadra,
            premioSoldi: DATI_TRAINER['cotral_osservatorio_grunt_ext_2'].premio || 0 },
        ]);
      }
      if (esito !== 'vittoria') {
        stato.flags.osservatorio_confronto_vista = false;   // si può ritentare
        stato.flags.osservatorio_confronto_attivo = true;   // Camilla/grunt ricompaiono
        sbloccaMovimento();
        if (typeof salvaPartita === 'function') salvaPartita();
        return;
      }

      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Camilla', [
          'Ecco, questo la dice lunga. Gente di ricerca non si comporta così.',
          'Vengo con te qui dentro: non mi fido a lasciarti andare da solo.',
        ]);
      }

      // Rivelazione: TUTTI i grunt sui 3 piani si "attivano" insieme, la
      // receptionist del 1F sparisce, Camilla diventa alleata permanente
      // (segue come un Pokémon) per tutto il resto del dungeon.
      stato.flags.osservatorio_cotral_scoperto = true;
      stato.flags.osservatorio_camilla_alleata = true;
      for (const id1 of this._coppieGruntOsservatorio()) stato.flags['grunt_attivo_' + id1] = true;

      await this._eseguiPassoCutscena({ tipo: 'fade_out', ms: 500 });
      await this._rigeneraNpc();   // grunt esterni spariti, Camilla del confronto sparita (gate ora vero)
      await this._impostaFollowerAlleato('trainer_LEADER_Camilla');
      await this._eseguiPassoCutscena({ tipo: 'fade_in', ms: 500 });
      if (typeof salvaPartita === 'function') salvaPartita();
      sbloccaMovimento();
    }

    async _prossimitaSpotta(st, id, dati, evTrigger) {
      if (trainerSpotting) return;
      trainerSpotting = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      await this._mostraEsclamazione(st);
      await this._camminaVersoGiocatore(st, 20);
      trainerSpotting = false;
      // Discorso da cattivo multi-pagina PRIMA della lotta vera (richiesta
      // esplicita di Luca: "allunga un po' i dialoghi") — proprietà
      // cutscene_id su evTrigger, riusa la stessa CUTSCENE[...] dichiarativa
      // di dati/cutscene.js (solo passi 'dialogo', niente lotta dentro: la
      // lotta parte SUBITO dopo, qui sotto).
      const cutsceneIntro = evTrigger.props && evTrigger.props.cutscene_id;
      if (cutsceneIntro) await this._giocaCutscene(cutsceneIntro);
      this._avviaLottaTrainer(id, dati, evTrigger);
    }

    // Lotta in doppia con ALLEATO (novità sess. 12 set 2026, Battle.avviaDoppia
    // opzioni.alleato — un NPC scende in campo con la SUA squadra vera, non i
    // tuoi 2 Pokémon come nella doppia normale): wrappa la chiamata in una
    // Promise che risolve con l'esito ('vittoria'/'sconfitta'/'fuga'/'errore'),
    // così si può usare con await dentro una cutscene come una lotta qualsiasi.
    _battagliaDoppiaAlleato(alleato, allenatoriNemici) {
      return new Promise(resolve => {
        stato.incontroAttivo = true;
        Battle.avviaDoppia({
          allenatori: allenatoriNemici,
          alleato,
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            resolve(esito);
          },
        });
      });
    }

    // Rifugio CoTrAL di Rocca di Papa — cutscene Baso vs Marcello (specifica
    // dettagliata di Luca, sess. 12 set 2026): scatta camminando sul rettangolo
    // "inizio cutscene" (oggetto Tiled type trigger_baso_cotral). Baso e
    // Marcello si scambiano battute (giocatore fermo, non coinvolto), poi Baso
    // nota il giocatore ("!", si gira verso di lui) e chiede aiuto contro 2
    // grunt "forti" in doppia — Baso scende in campo con la SUA squadra vera
    // (opzioni.alleato di Battle.avviaDoppia, non i tuoi 2 Pokémon). Vinta
    // quella, Marcello lancia la sua sfida finale: doppia contro di lui diviso
    // in due "metà" da 3 Pokémon (stesso allenatore ripetuto due volte, stessa
    // tecnica già usata per Levantino/Giovanni alla Grotta del Vulcano).
    // Sconfitta in una qualsiasi delle due lotte: si torna al giocatore libero,
    // NIENTE flag settato, si può ritentare ricalpestando la linea. Vittoria
    // finale: stato.flags.cotral_rocca_boss_sconfitto = true, che fa sparire
    // Marcello/i grunt/Gianluca dalla stanza (gate condizione, vedi
    // dati/npc.js) — Baso resta, non ha nessun gate.
    _checkBasoCotralTrigger() {
      if (mappaCorrente !== 'nascondiglio_cotral') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso || bloccato || trainerSpotting) return;
      if (!stato.flags) stato.flags = {};
      if (stato.flags.cotral_rocca_boss_sconfitto || stato.flags.cotral_rocca_cutscene_vista) return;
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'trigger_baso_cotral') continue;
        const dentro = (ev.w > 0 && ev.h > 0)
          ? (posTile.tx >= ev.tx0 && posTile.tx <= ev.tx1 && posTile.ty >= ev.ty0 && posTile.ty <= ev.ty1)
          : (posTile.tx === ev.tx && posTile.ty === ev.ty);
        if (dentro) { this._cutsceneBasoCotralRocca(); return; }
      }
    }

    async _cutsceneBasoCotralRocca() {
      if (!stato.flags) stato.flags = {};
      // Settato SUBITO (non solo a vittoria): impedisce di ritriggerare mentre
      // la cutscene/lotta è in corso; se si perde, viene rimesso a false così
      // si può ritentare ricalpestando la linea (vedi sotto).
      stato.flags.cotral_rocca_cutscene_vista = true;
      bloccaMovimento();
      // Il giocatore resta FERMO per tutta la cutscene (segnalato da Luca:
      // "il mio giocatore cammina sul posto"): se il trigger scatta A METÀ di
      // un passo, l'ultima animazione "walk" in loop resta appesa per sempre
      // perché bloccaMovimento() blocca l'INPUT ma non tocca l'anim in corso
      // — va rimessa a "idle" esplicitamente, come fa ogni altra cutscene con
      // trainer (vedi _trainerSpotta/_prossimitaSpotta).
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);

      const baso = npcStato.find(s => s.id === 'baso_rocca_cutscene');
      const marcello = npcStato.find(s => s.id === 'cotral_marcello_rocca_npc');

      // 0) Baso e Marcello si guardano negli occhi PRIMA di iniziare a
      //    scambiarsi battute (prima restavano entrambi rivolti a sud, la
      //    direzione di piazzamento in Tiled — segnalato da Luca).
      if (baso && marcello) {
        const dirBasoVersoMarcello = this._direzioneTraCaselle(baso.tx, baso.ty, marcello.tx, marcello.ty);
        const dirMarcelloVersoBaso = this._direzioneTraCaselle(marcello.tx, marcello.ty, baso.tx, baso.ty);
        baso.dir = dirBasoVersoMarcello;
        if (baso.sprite) this._setNpcFrame(baso.sprite, dirBasoVersoMarcello, false);
        marcello.dir = dirMarcelloVersoBaso;
        if (marcello.sprite) this._setNpcFrame(marcello.sprite, dirMarcelloVersoBaso, false);
      }

      // 1) Baso e Marcello si scambiano battute: il giocatore è ancora fermo
      //    sulla linea, non è coinvolto in questa parte.
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Baso', [
          'Fermo dove sei, Marcello! Ti sei permesso di rapire Gianluca sotto i miei occhi, nella mia città!',
          'Io veglio su Rocca di Papa da quando sono diventato Capopalestra: non lascerò che gente come voi la usi come vi pare!',
        ]);
        await mostraDialogo('Marcello', [
          'Baso, Baso... sempre il solito eroe di paese. Non hai la minima idea di cosa stiamo costruendo qui dentro la montagna.',
          'Gianluca ci serve vivo e collaborativo: è l\'unico che sa portare la funivia fin sopra la cima, dove nidifica Articuno.',
          'Ci serve controllare il meteo, capisci? È l\'ultimo tassello del nostro piano, e un leggendario in gabbia fa comodo.',
        ]);
        await mostraDialogo('Baso', [
          'Il meteo non si controlla con un uccello leggendario rinchiuso in una gabbia, Marcello. Si controlla con la testa sulle spalle, che a voi manca del tutto.',
          'Rilascialo subito, o te lo faccio sputare fuori a suon di pugni!',
        ]);
        await mostraDialogo('Marcello', [
          'Sempre le maniere forbite, tu. Fai pure, tanto qui dentro comandiamo noi, non tu.',
        ]);
      }

      // 2) Baso nota il giocatore: "!" sopra la testa, si gira verso di lui
      //    (non si muove dalla sua posizione), parte un dialogo separato.
      if (baso) {
        await this._mostraEsclamazione(baso);
        const dirVersoPlayer = this._direzioneTraCaselle(baso.tx, baso.ty, posTile.tx, posTile.ty);
        baso.dir = dirVersoPlayer;
        if (baso.sprite) this._setNpcFrame(baso.sprite, dirVersoPlayer, false);
        const dirPlayerVersoBaso = this._direzioneTraCaselle(posTile.tx, posTile.ty, baso.tx, baso.ty);
        facciata = dirPlayerVersoBaso;
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      }
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Baso', [
          'Tu... non mi sembri uno del Team CoTrAL. Sei qui per aiutarmi?',
          'Occupati di questa gente insieme a me! Aiutami a sconfiggere questi nemici!',
        ]);
      }
      // Detto questo, Baso si rivolta di nuovo verso Marcello (torna a
      // guardare il vero nemico, non resta rivolto verso di me).
      if (baso && marcello) {
        const dirBasoVersoMarcello = this._direzioneTraCaselle(baso.tx, baso.ty, marcello.tx, marcello.ty);
        baso.dir = dirBasoVersoMarcello;
        if (baso.sprite) this._setNpcFrame(baso.sprite, dirBasoVersoMarcello, false);
      }

      // 3) Prima battaglia in doppia: Baso (alleato, la sua squadra vera) +
      //    giocatore VS i 2 grunt "forti" (più tosti dei 6 gregari già in
      //    giro per la stanza).
      const alleatoBaso = { nome: 'Baso', squadra: [ { id: 68, livello: 40 }, { id: 308, livello: 39 } ] };
      const grunt1 = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER['cotral_grunt_forte_1'] : null;
      const grunt2 = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER['cotral_grunt_forte_2'] : null;
      if (grunt1 && grunt2) {
        if (typeof mostraDialogo === 'function') {
          await mostraDialogo('Addetto Scelto', ['Due contro due, allora! Non farti illusioni, non basterà.']);
        }
        const esito1 = await this._battagliaDoppiaAlleato(alleatoBaso, [
          { nome: grunt1.nome, squadra: grunt1.squadra, premioSoldi: grunt1.premio || 0 },
          { nome: grunt2.nome, squadra: grunt2.squadra, premioSoldi: grunt2.premio || 0 },
        ]);
        if (esito1 !== 'vittoria') {
          stato.flags.cotral_rocca_cutscene_vista = false;
          sbloccaMovimento();
          if (typeof salvaPartita === 'function') salvaPartita();
          return;
        }
      }

      // 4) Narrativa: Baso ha sconfitto i suoi, si torna alla schermata di
      //    blocco. Restano lui, il giocatore, Marcello e tutta la gente.
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Baso', [
          'Fatto! Erano tosti, ma niente che due allenatori con la testa sulle spalle non possano gestire.',
        ]);
        await mostraDialogo('Marcello', [
          'Pensate di avermi sconfitto? Non sarà così facile!!',
        ]);
      }

      // 5) Scontro finale in doppia: Marcello diviso in due "metà" da 3
      //    Pokémon (stesso allenatore ripetuto, come già fatto per Levantino/
      //    Giovanni alla Grotta del Vulcano) VS Baso (alleato) + giocatore.
      const datiMarcello = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER['cotral_marcello_rocca'] : null;
      const squadraCompleta = (datiMarcello && datiMarcello.squadra) || [];
      const metaA = squadraCompleta.slice(0, 3);
      const metaB = squadraCompleta.slice(3, 6);
      const nomeMarcello = (datiMarcello && datiMarcello.nome) || 'Marcello';
      const premioMarcello = (datiMarcello && datiMarcello.premio) || 0;
      const esito2 = await this._battagliaDoppiaAlleato(alleatoBaso, [
        { nome: nomeMarcello, squadra: metaA, premioSoldi: Math.floor(premioMarcello / 2) },
        { nome: nomeMarcello, squadra: metaB, premioSoldi: Math.ceil(premioMarcello / 2) },
      ]);
      if (esito2 !== 'vittoria') {
        stato.flags.cotral_rocca_cutscene_vista = false;
        sbloccaMovimento();
        if (typeof salvaPartita === 'function') salvaPartita();
        return;
      }

      // 6) Marcello si arrende: si avvicina al giocatore (non a Baso) e
      //    consegna la password del Rifugio GdF di Marino come "premio" per
      //    essere stato lasciato andare — prima di sparire per sempre insieme
      //    a grunt/Gianluca (schermo nero, vedi sotto). Baso NON sparisce qui:
      //    resta interagibile insieme a Gianluca (vedi dati/npc.js e
      //    _epilogoBasoCotralRocca più sotto).
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Marcello', [
          (datiMarcello && datiMarcello.dialogo_dopo) || 'Impossibile... non è finita qui.',
        ]);
      }
      if (marcello) {
        await this._camminaVersoGiocatore(marcello, 20);
        marcello.dir = this._direzioneTraCaselle(marcello.tx, marcello.ty, posTile.tx, posTile.ty);
        if (marcello.sprite) this._setNpcFrame(marcello.sprite, marcello.dir, false);
      }
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Marcello', [
          'Okok, non voglio creare ulteriori problemi, ce ne andiamo! Tenete, se mi lasciate andare, vi cedo questa come premio per la vostra insolenza e sfacciata sfortuna.',
          'Noi non ce ne facciamo niente: vogliamo dar fastidio a voi quanto al Team GdF, quegli infami. Li seguiamo da mesi e ci intralciano.',
          'Volevo capire come entrare in quel loro rifugio e suonargliele. A quanto pare servono 3 password per aprire il gate di Marino.',
          'Sappiate che non finisce qui!',
        ]);
      }
      // NOTA (segnalato esplicitamente da Luca, sess. 12 set 2026): il flag
      // baso_tornato/password NON scatta già qui — Marcello la promette a
      // parole, ma "Baso tornato"/"Gianluca liberato" contano SOLO quando i
      // due spariscono davvero da questa stanza, cioè a fine epilogo (vedi
      // _epilogoBasoCotralRocca più sotto). Prima si limitava a un ";finto"
      // via toast immediato, disallineato dal vero stato del gioco.

      // 7) Vittoria finale: schermo nero, poi Marcello/i grunt spariscono per
      //    sempre dalla stanza (gate su cotral_rocca_boss_sconfitto, vedi
      //    dati/npc.js). Baso e Gianluca restano, sempre interagibili — vedi
      //    _epilogoBasoCotralRocca (azione:'interagisciGianlucaCotralRocca'
      //    su Gianluca, dati/npc.js).
      stato.flags.cotral_rocca_boss_sconfitto = true;
      await this._eseguiPassoCutscena({ tipo: 'fade_out', ms: 500 });
      await this._rigeneraNpc();
      await this._eseguiPassoCutscena({ tipo: 'fade_in', ms: 500 });
      if (typeof salvaPartita === 'function') salvaPartita();
      sbloccaMovimento();
    }

    // Epilogo (post-cutscene): con Marcello/i grunt ormai spariti, restano
    // solo Baso e Gianluca nella stanza. Parlare con Baso [A] dà solo un
    // promemoria ("libera Gianluca"). Parlare con GIANLUCA è ciò che fa
    // scattare la scena vera: Baso cammina verso il giocatore (rispettando i
    // layer di collisione via _camminaVersoGiocatore/_liberoPerNPC, non un
    // teletrasporto), ringrazia, invita a sfidarlo in palestra — poi lui e
    // Gianluca spariscono insieme (gate su cotral_rocca_finale, vedi
    // dati/npc.js): narrativamente Baso riaccompagna Gianluca a casa e torna
    // ad aspettare in palestra. Chiamata da interagisciGianlucaCotralRocca()
    // in app.js (azione dell'NPC 'gianluca_cotral_rocca').
    //
    // QUESTO è il momento (e SOLO questo, richiesta esplicita di Luca) in cui
    // Baso è davvero "tornato" e Gianluca è davvero "liberato": prima, la
    // sconfitta dei 2 grunt di collegamento_Cotral alzava già baso_tornato da
    // sola (narrativamente prematuro, segnalato come TODO nella ROADMAP), e
    // in un mio primo tentativo lo alzava anche il solo discorso di Marcello
    // prima di sparire — entrambi rimossi. Ora baso_tornato/password del
    // Rifugio GdF di Marino scattano SOLO qui.
    async _epilogoBasoCotralRocca() {
      if (!stato.flags) stato.flags = {};
      if (stato.flags.cotral_rocca_finale) return;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);

      const baso = npcStato.find(s => s.id === 'baso_rocca_cutscene');
      if (baso) {
        // Stesso trattamento dello scienziato alla Grotta del Vulcano: cammina
        // fino ad essere adiacente al giocatore (rispetta i layer di
        // collisione via _liberoPerNPC, non un teletrasporto).
        await this._camminaVersoGiocatore(baso, 15);
        const dirPlayerVersoBaso = this._direzioneTraCaselle(posTile.tx, posTile.ty, baso.tx, baso.ty);
        facciata = dirPlayerVersoBaso;
        if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
      }
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Baso', [
          'Grazie di cuore per l\'aiuto: non ce l\'avrei fatta da solo contro tutti quanti.',
          'Vieni a sfidarmi in palestra quando vuoi! Riaccompagno Gianluca a casa, poi mi troverai lì.',
        ]);
        await mostraDialogo('Gianluca', ['Grazie, davvero. Non dimenticherò questo giorno.']);
      }

      stato.flags.cotral_rocca_finale = true;
      stato.flags.baso_tornato = true;
      this._controllaPasswordRifugio();

      // Schermo nero prima di far sparire Baso e Gianluca (stesso
      // trattamento del team CoTrAL a fine cutscene principale, richiesto
      // esplicitamente da Luca — prima sparivano di scatto senza dissolvenza).
      await this._eseguiPassoCutscena({ tipo: 'fade_out', ms: 500 });
      await this._rigeneraNpc();   // Baso e Gianluca spariscono da questa stanza (gate ora vero)
      await this._eseguiPassoCutscena({ tipo: 'fade_in', ms: 500 });
      if (typeof mostraToast === 'function') {
        mostraToast('🔑 Hai anche la password che Marcello ti aveva promesso per il Rifugio GdF!', 3200);
      }
      if (typeof salvaPartita === 'function') salvaPartita();
      sbloccaMovimento();
    }

    // Grotta del Vulcano — Giovanni in persona (sess. 8 set 2026, richiesta
    // esplicita di Luca, corretta dopo un primo tentativo sbagliato: "non è
    // che deve comparire, deve stare già lì"). Giovanni NON viene creato dal
    // nulla: è un NPC vero, piazzato su Tiled (marcatore "giovanni", id
    // gdf_grotta_vulcano_giovanni — vedi dati/npc.js), fermo e visibile fin
    // dall'inizio nella stanza, esattamente come lo scienziato. Qui lo
    // peschiamo da npcStato per id (stesso identico oggetto sprite già a
    // schermo, non uno nuovo) e lo facciamo camminare verso il giocatore
    // SOLO dopo che Levantino è stato sconfitto. Alla fine forza la
    // direzione a SUD (deve guardare il giocatore, non fermarsi girato a
    // caso) prima di aprire la lotta vera. Il discorso da cattivo di
    // Giovanni (CUTSCENE 'grotta_vulcano_boss_intro') parte QUI, non prima
    // della lotta con Levantino: altrimenti sembrava che fosse Giovanni
    // stesso ad arrivare per primo.
    async _arrivoGiovanniGrottaVulcano(ev) {
      bloccaMovimento();
      const giovanni = npcStato.find(s => s.id === 'gdf_grotta_vulcano_giovanni');
      if (!giovanni) {
        console.warn('[Grotta Vulcano] NPC Giovanni non trovato sulla mappa (marcatore Tiled mancante?)');
        this._avviaLottaTrainer('gdf_boss_grotta_vulcano', DATI_TRAINER['gdf_boss_grotta_vulcano'], ev);
        return;
      }
      await this._mostraEsclamazione(giovanni);
      await this._camminaVersoGiocatore(giovanni, 20);
      giovanni.dir = 'sud';
      if (giovanni.sprite) this._setNpcFrame(giovanni.sprite, 'sud', false);
      await this._giocaCutscene('grotta_vulcano_boss_intro');
      this._avviaLottaTrainer('gdf_boss_grotta_vulcano', DATI_TRAINER['gdf_boss_grotta_vulcano'], ev);
    }

    // Azione dell'NPC (premendo [A]): alternativa al trigger automatico per
    // la sola cutscene1 (es. ci si avvicina da un lato diverso dalla sua
    // "linea di vista"). Non fa mai scattare la cutscene2 (quella è SOLO
    // avvicinamento a Latios/Latias, per design).
    async avviaLatiosLatiasScena() {
      if (stato.incontroAttivo || dialogoInCorso) return;
      if (!stato.flags) stato.flags = {};
      if (stato.flags.latiosLatiasRoaming) {
        if (typeof mostraDialogo === 'function') {
          await mostraDialogo('???', [
            'Sono scappati ormai, vagano liberi per tutta la regione.',
            'Buona fortuna a ritrovarli!',
          ]);
        }
        return;
      }
      if (!stato.flags.latiosLatiasCutscene1Vista) {
        await this._latiosLatiasCutscene1();
        return;
      }
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('???', ['Non avvicinarti troppo o scapperanno!']);
      }
    }

    // Una lotta della sequenza: dialogo dell'avversario, poi Battle.avvia.
    // Risolve a true/false in base all'esito (vittoria o no).
    _lottaPorchettaro(numero) {
      const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[`porchettaro_sfida_${numero}`] : null;
      if (!dati) return Promise.resolve(false);
      return new Promise(resolve => {
        stato.incontroAttivo = true;
        const dopoDialogo = () => {
          Battle.avvia({
            allenatore: {
              nome: dati.nome, squadra: dati.squadra,
              dialogoSconfitta: dati.dialogo_dopo || '', premioSoldi: dati.premio || 0,
            },
            stato,
            onFine: (esito) => {
              stato.incontroAttivo = false;
              resolve(esito === 'vittoria');
            },
          });
        };
        if (typeof mostraDialogo === 'function') {
          mostraDialogo(dati.nome, [dati.dialogo_prima]).then(dopoDialogo);
        } else {
          dopoDialogo();
        }
      });
    }

    /* ────────── SFIDA DEI PARENTI DI ROCCO (Via dei Laghi) ────────── */

    // Innescata da 'via_laghi_sfida_rocco' (dati/npc.js) tramite
    // sfidaParentiRocco() in app.js. 5 lotte in sequenza (dati/trainer.js:
    // rocco_parente_sfida_1..5), stesso schema dei Porchettari ma senza
    // finestra oraria e senza cameo tra una lotta e l'altra (qui l'NPC
    // resta fermo, sono "in coda" non in giro per la mappa). Vittoria a
    // tutte e 5: stato.flags.famiglia_rocco_battuta (permanente, sblocca
    // l'infermiera 'via_laghi_infermiera').
    async avviaSfidaParentiRocco() {
      if (stato.incontroAttivo) return;
      bloccaMovimento();
      for (let n = 1; n <= 5; n++) {
        const vinto = await this._lottaParenteRocco(n);
        if (!vinto) { sbloccaMovimento(); return; }
        bloccaMovimento();   // _lottaParenteRocco sblocca a fine lotta: richiudiamo, la sequenza continua
      }
      if (!stato.flags) stato.flags = {};
      stato.flags.famiglia_rocco_battuta = true;
      if (typeof salvaPartita === 'function') salvaPartita();
      this._rigeneraNpc();   // fa comparire subito l'infermiera (condizione soddisfatta)
      sbloccaMovimento();
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('Nonno Ezechiele', [
          'Cinque su cinque contro tutta la famija... nemmeno Baso c\'era riuscito da giovane.',
          'Da oggi mia nipote Cesira sta qui: se te serve na cura, chiedje pure.',
        ]);
      }
    }

    _lottaParenteRocco(numero) {
      const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[`rocco_parente_sfida_${numero}`] : null;
      if (!dati) return Promise.resolve(false);
      return new Promise(resolve => {
        stato.incontroAttivo = true;
        const dopoDialogo = () => {
          Battle.avvia({
            allenatore: {
              nome: dati.nome, squadra: dati.squadra,
              dialogoSconfitta: dati.dialogo_dopo || '', premioSoldi: dati.premio || 0,
            },
            stato,
            onFine: (esito) => {
              stato.incontroAttivo = false;
              resolve(esito === 'vittoria');
            },
          });
        };
        if (typeof mostraDialogo === 'function') {
          mostraDialogo(dati.nome, [dati.dialogo_prima]).then(dopoDialogo);
        } else {
          dopoDialogo();
        }
      });
    }

    // Ostacoli da MN: davanti a un masso/acqua si preme [A]. Se possiedi la MN
    // giusta lo superi (la casella diventa calpestabile), altrimenti un avviso.
    // Nome mostrato nel messaggio "___ usa MN!" (sessione 6 agosto): il
    // progetto non ha ancora un campo nome-personaggio vero e proprio, solo
    // il genere scelto a inizio partita — uso Rosso/Rossa (stile FireRed,
    // coerente con lo sprite 'player-red') come placeholder ragionevole.
    // Se in futuro arriva un vero campo nome, va sostituito qui.
    _nomeGiocatore() {
      return (typeof stato !== 'undefined' && stato.genere === 'F') ? 'Rossa' : 'Rosso';
    }

    _gestisciTrigger(ev) {
      const chiave = ev.tipo.replace('trigger_', '');   // es. "surf", "spaccaroccia"
      const NOMI = { surf: 'Surf', taglio: 'Taglio', spaccaroccia: 'Spaccaroccia',
                     forza: 'Forza', volo: 'Volo', sub: 'Sub', cascata: 'Cascata' };
      const nome = NOMI[chiave] || chiave;
      const ha = (typeof stato !== 'undefined' && stato.mn && stato.mn[chiave]);

      // Forza NON passa mai da qui (richiesta esplicita utente, sessione 6
      // agosto: "ogni macigno con trigger forza corrisponde graficamente a
      // un masso da spostare, non esiste mai un forza e basta"): ogni
      // ostacolo Forza è un macigno vero, oggetto type:"masso", spinto
      // camminandoci contro (vedi _provaSpingiMasso) — niente [A], niente
      // sparizione istantanea. Se un trigger_forza esiste ancora da qualche
      // parte è una mappa da convertire, non un caso valido: avviso e stop.
      if (chiave === 'forza') {
        console.warn('[MN] trigger_forza trovato ma ignorato: va convertito in un oggetto masso.', ev);
        return;
      }

      if (!ha) {
        if (typeof mostraToast === 'function')
          mostraToast(`🔒 Serve la MN ${nome} per superare questo ostacolo.`, 2500);
        return;
      }

      if (typeof mostraToast === 'function') {
        mostraToast(`${this._nomeGiocatore()} usa ${nome}!`, 1800);
      }

      if (chiave === 'surf') {
        // L'acqua non è mai una collisione (vedi buildCollGrid/acquaSurf): non
        // c'è nulla da "liberare" in collGrid. Basta attivare lo stato di Surf,
        // da qui in poi il movimento entra in acqua da solo (vedi _sposta).
        surfAttivo = true;
        biciAttiva = false;   // non si pedala in acqua
        this._aggiornaVisibilitaFollower();   // niente follower mentre si surfa
        return;
      }

      if (chiave === 'cascata') {
        // Attraversamento lento e automatico (sessione 6 agosto, richiesta
        // esplicita: "non ti fa camminare sulle cascate") — vedi
        // _attraversaCascata sotto, NON libera collGrid: non si deve poter
        // camminare sui tile cascata a piedi, solo attraversarli con questa
        // animazione forzata. Bidirezionale (sess. 5 set, richiesta di
        // Luca): il riquadro trigger_cascata si usa anche per attraversare
        // in ENTRAMBE le direzioni (es. tunnel roccioso), non solo per
        // risalire verso nord — prima era sempre e solo verso nord.
        this._attraversaCascata(ev);
        return;
      }

      if (chiave === 'sub') {
        // Punto d'immersione (sessione 10 agosto, richiesta esplicita): un
        // oggetto "trigger_sub" piazzato dentro una zona Surf, con le stesse
        // proprietà di un warp normale (destinazione/spawn_id/arrivo_x/y) —
        // avendo la MN Sub, ti immerge teletrasportandoti alla mappa "sott'acqua"
        // indicata, riusando la stessa logica di transizione dei warp/porte.
        // NON libera collGrid: non è un ostacolo da rimuovere, è un ingresso.
        this._transizioneMappa(ev);
        return;
      }

      // Altri ostacoli MN (taglio/spaccaroccia/forza "semplice"/sub): oggetti
      // singoli, si liberano in collGrid. NOTA: questo NON persiste da solo
      // (collGrid si ricostruisce da zero dal .tmj ad ogni caricamento mappa)
      // — per taglio/spaccaroccia è il comportamento voluto (albero/roccia
      // ricompaiono uscendo e rientrando). Forza "vera" (macigno che si
      // spinge) NON dovrebbe passare da qui: va piazzata come oggetto
      // type:"masso" (vedi _creaMassi), che gestisce già la spinta (anche
      // questa si resetta uscendo e rientrando) — questo branch resta solo
      // come fallback per eventuali trigger_forza "semplici" già in giro.
      const libera = (cx, cy) => { if (collGrid[cy]) collGrid[cy][cx] = 0; };
      const celle = [];
      if (ev.w > 0 && ev.h > 0) {
        for (let r = ev.ty0; r <= ev.ty1; r++)
          for (let cc = ev.tx0; cc <= ev.tx1; cc++) { libera(cc, r); celle.push([cc, r]); }
      } else {
        libera(ev.tx, ev.ty); celle.push([ev.tx, ev.ty]);
      }
      // Libera anche la casella DAVANTI al giocatore: così l'ostacolo si supera
      // anche se l'oggetto-trigger e l'eventuale tile-collisione dipinto a mano
      // non sono perfettamente allineati alla stessa cella.
      const fx = posTile.tx + (facciata === 'right' ? 1 : facciata === 'left' ? -1 : 0);
      const fy = posTile.ty + (facciata === 'down'  ? 1 : facciata === 'up'   ? -1 : 0);
      libera(fx, fy); celle.push([fx, fy]);

      // Taglio/Spaccaroccia: l'albero/roccia sparisce anche VISIVAMENTE (solo
      // per questa sessione, stesso motivo — nessuna persistenza voluta).
      if (chiave === 'taglio' || chiave === 'spaccaroccia') {
        for (const [cx, cy] of celle) this._nascondiTileOstacolo(cx, cy);
      }
    }

    // Rimuove (solo a schermo, per questa sessione) il tile disegnato in
    // (tx,ty) su qualunque layer che NON sia il terreno (depth 0 = ground
    // resta sempre) — usato da Taglio/Spaccaroccia per far sparire
    // l'albero/la roccia. Ricaricando la mappa ricompare (voluto).
    _nascondiTileOstacolo(tx, ty) {
      const worldX = tx * tileSize + tileSize / 2;
      const worldY = ty * tileSize + tileSize / 2;
      for (const o of layerObjects) {
        if (!o.depth) continue;   // 0/undefined = ground, non toccare
        const tile = o.layer.getTileAtWorldXY(worldX, worldY, true);
        if (tile) o.layer.removeTileAtWorldXY(worldX, worldY, true);
      }
    }

    // Come _nascondiTileOstacolo ma SOSTITUISCE il tile con un altro invece
    // di cancellarlo (Osservatorio CoTrAL, sess. 15 set 2026: statua-
    // interruttore che cambia aspetto). localId è l'indice LOCALE nel
    // tileset (0-based, quello mostrato in Tiled), non il gid globale.
    _impostaTileOstacolo(tx, ty, localId) {
      const worldX = tx * tileSize + tileSize / 2;
      const worldY = ty * tileSize + tileSize / 2;
      for (const o of layerObjects) {
        if (!o.depth) continue;
        const tile = o.layer.getTileAtWorldXY(worldX, worldY, true);
        if (tile) { o.layer.putTileAt(localId, tx, ty); return; }
      }
    }

    // Porta a scomparsa (Osservatorio CoTrAL): true se ev è già stata
    // "aperta" — con la chiave segreta (stato.flags['porta_aperta_'+id]),
    // oppure per le porte controllata_da_interruttore, dallo stato
    // dell'interruttore della statua (stato.flags.cotral_interruttore_premuto).
    _portaScomparsaApertaEv(ev) {
      if (typeof stato === 'undefined' || !stato.flags) return false;
      const controllataDaInterruttore = ev.props.controllata_da_interruttore === true ||
        ev.props.controllata_da_interruttore === 'true';
      if (controllataDaInterruttore) return !!stato.flags.cotral_interruttore_premuto;
      return !!stato.flags['porta_aperta_' + ev.id];
    }

    // true se (tx,ty) ricade dentro una porta_scomparsa NON ancora aperta
    // (quindi ancora solida, vedi _sposta).
    _portaScomparsaBlocca(tx, ty) {
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'porta_scomparsa') continue;
        const dentro = (ev.w > 0 && ev.h > 0)
          ? (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1)
          : (ev.tx === tx && ev.ty === ty);
        if (dentro && !this._portaScomparsaApertaEv(ev)) return true;
      }
      return false;
    }

    // Applica lo stato persistito di tutte le porte a scomparsa DOPO il
    // rendering dei layer tile (chiamata subito dopo _ripristinaOggettiRaccolti,
    // stesso momento/stesso schema): quelle già "aperte" spariscono di nuovo
    // visivamente ad ogni caricamento mappa, senza rigiocare il dialogo.
    _applicaPorteScomparse() {
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'porta_scomparsa') continue;
        if (!this._portaScomparsaApertaEv(ev)) continue;
        const tx0 = ev.w > 0 ? ev.tx0 : ev.tx, tx1 = ev.w > 0 ? ev.tx1 : ev.tx;
        const ty0 = ev.h > 0 ? ev.ty0 : ev.ty, ty1 = ev.h > 0 ? ev.ty1 : ev.ty;
        for (let ty = ty0; ty <= ty1; ty++)
          for (let tx = tx0; tx <= tx1; tx++) this._nascondiTileOstacolo(tx, ty);
      }
    }

    // Attraversamento automatico e lento di una cascata (MN Cascata,
    // sessione 6 agosto, reso bidirezionale il 5 settembre 2026): il
    // giocatore NON cammina di sua iniziativa sui tile cascata, viene
    // "portato" per N caselle nella direzione in cui è rivolto quando la usa
    // (facciata al momento dell'interazione — [A] rivolto verso l'alto per
    // risalire, verso il basso per scendere, e così per sinistra/destra:
    // lo stesso riquadro trigger_cascata serve anche per attraversamenti
    // orizzontali come nel tunnel roccioso, non solo le cascate vere).
    // N = altezza dell'oggetto in tile se il movimento è verticale, o la sua
    // larghezza se orizzontale (minimo 1), ignorando le collisioni normali.
    async _attraversaCascata(ev) {
      bloccaMovimento();
      const dy = facciata === 'up' ? -1 : facciata === 'down' ? 1 : 0;
      const dx = facciata === 'left' ? -1 : facciata === 'right' ? 1 : 0;
      if (dx === 0 && dy === 0) { sbloccaMovimento(); return; }   // direzione ignota: non fare nulla
      const nTile = dy !== 0
        ? (ev.h > 0 ? Math.max(1, Math.round(ev.h / tileSize)) : 1)
        : (ev.w > 0 ? Math.max(1, Math.round(ev.w / tileSize)) : 1);
      for (let i = 0; i < nTile; i++) {
        const nx = posTile.tx + dx, ny = posTile.ty + dy;
        if (nx < 0 || ny < 0 || nx >= mapW || ny >= mapH) break;
        await new Promise(resolve => {
          posTile = { tx: nx, ty: ny };
          if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('walk', facciata), true);
          const px = nx * tileSize + tileSize / 2;
          const py = (ny + 1) * tileSize;
          if (!playerSprite || !scena) { resolve(); return; }
          scena.tweens.add({
            targets: playerSprite, x: px, y: py, duration: DURATA_PASSO_MS * 2.2, ease: 'Linear',
            onComplete: () => {
              if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);
              resolve();
            },
          });
        });
      }
      this._aggiornaLatLon();
      sbloccaMovimento();
    }

    // Fa sparire il tile "Poké Ball a terra" (TILE_ID_POKEBALL) in una cella,
    // lasciando intatto il tile di terreno sottostante (che vive su un altro
    // layer/oggetto Phaser). Cerca fra TUTTI i layer attualmente disegnati
    // (ce n'è uno per ogni combinazione layer-tile/tileset-fetta) e rimuove
    // solo quello il cui indice locale corrisponde davvero alla Poké Ball
    // (nelle fette split l'indice memorizzato è "948 - inizio_fetta").
    _nascondiTilePokeball(tx, ty) {
      const worldX = tx * tileSize + tileSize / 2;
      const worldY = ty * tileSize + tileSize / 2;
      for (const o of layerObjects) {
        const atteso = TILE_ID_POKEBALL - (o.lo || 0);
        const tile = o.layer.getTileAtWorldXY(worldX, worldY, true);
        if (tile && tile.index === atteso) {
          o.layer.removeTileAtWorldXY(worldX, worldY, true);
        }
      }
    }

    // Applica _nascondiTilePokeball a tutte le celle occupate da un evento
    // 'oggetto' (rettangolo o singola casella).
    _nascondiTileOggetto(ev) {
      if (ev.w > 0 && ev.h > 0) {
        for (let ty = ev.ty0; ty <= ev.ty1; ty++)
          for (let tx = ev.tx0; tx <= ev.tx1; tx++)
            this._nascondiTilePokeball(tx, ty);
      } else {
        this._nascondiTilePokeball(ev.tx, ev.ty);
      }
    }

    // Richiamata a ogni caricamento mappa: nasconde i tile Poké Ball degli
    // oggetti già raccolti in partite precedenti (senza questo, ricaricando
    // la mappa il tile tornerebbe visibile pur avendo già l'oggetto in zaino).
    _ripristinaOggettiRaccolti() {
      if (typeof stato === 'undefined' || !stato.oggettiRaccolti) return;
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'oggetto' && ev.tipo !== 'object') continue;
        const mappaEv = ev._mappaChiave || mappaCorrente;
        const idUnivoco = `${mappaEv}:${ev.tx},${ev.ty}`;
        if (stato.oggettiRaccolti.includes(idUnivoco)) this._nascondiTileOggetto(ev);
      }
    }

    _controllaEventiCalpestabili() {
      const tx = posTile.tx, ty = posTile.ty;

      // Se ti sei mosso via dalla casella di spawn, riarma i warp lì.
      if (spawnGuard && (tx !== spawnGuard.tx || ty !== spawnGuard.ty)) spawnGuard = null;
      // Finché sei FERMO sulla casella di spawn, i warp/porte non scattano
      // (così entrando in una mappa non vieni subito rispedito indietro).
      const suSpawn = !!(spawnGuard && tx === spawnGuard.tx && ty === spawnGuard.ty);

      for (const ev of eventiMappa) {
        if ((ev.tipo === 'porta' || ev.tipo === 'uscita' || ev.tipo === 'warp') && suSpawn) continue;
        if (ev.tipo === 'porta') {
          if (ev.w > 0 && ev.h > 0) {
            if (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
              this._gestisciPorta(ev); return;
            }
          } else if (ev.tx === tx && ev.ty === ty) {
            this._gestisciPorta(ev); return;
          }
        }

        // 'uscita' (vecchie mappe) e 'warp' (mappe nuove) si comportano uguale:
        // scattano quando il giocatore calpesta la casella. NON richiediamo
        // ev.point qui (a differenza di prima, sess. 7 set 2026): un oggetto
        // Tiled disegnato come rettangolo 0×0 invece che come vero "Point"
        // (es. pc_door/market_door di Ariccia.tmj) ha ev.w===0 && ev.h===0
        // ma ev.point resta false, quindi il warp non scattava MAI — bug
        // scoperto perché il ramo 'porta' qui sotto non ha mai avuto questo
        // controllo aggiuntivo (asimmetria non voluta).
        if (ev.tipo === 'uscita' || ev.tipo === 'warp') {
          if (ev.w > 0 && ev.h > 0) {
            if (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
              this._transizioneMappa(ev); return;
            }
          } else if (ev.tx === tx && ev.ty === ty) {
            this._transizioneMappa(ev); return;
          }
        }

      }

      // Incontri selvatici SOLO se la casella è erba alta o acqua (Fix 2)
      const terreno = this._getTileType(tx, ty);
      if (terreno) {
        if (cooldownIncontro > 0) cooldownIncontro--;   // tregua post-incontro
        else this._tentaIncontro(terreno);
      }

      this._checkLatiosLatiasTrigger();
      this._checkSuicuneTrigger();
      this._checkRoccaBasoTrigger();
      this._checkBasoCotralTrigger();
      this._checkOsservatorioGruntTrigger();
      this._checkOsservatorioBossTrigger();
      this._checkOsservatorioBossFinaleTrigger();
      this._checkCamillaInvitoTrigger();
      this._checkOsservatorioConfrontoTrigger();
      this._checkTriggerProssimita();
    }

    // I 3 cani leggendari al Lago di Nemi (Raikou/Entei/Suicune, piazzati
    // fianco a fianco — richiesta esplicita di Luca, sess. 12 set 2026):
    // versione "solo andata" del trattamento Latios/Latias (niente NPC che
    // avverte prima). Avvicinandosi a 2 caselle a QUALSIASI dei tre, TUTTI E
    // TRE scappano insieme per sempre e da quel momento sono in roaming su
    // tutta la mappa di gioco (stato.flags.caniLeggendariRoaming, vedi
    // _checkRoamingCaniLeggendari) — prima solo Suicune era davvero piazzato
    // sulla mappa, Raikou/Entei esistevano solo "narrativamente" nel roaming.
    async _suicuneScappaCutscene() {
      if (!stato.flags) stato.flags = {};
      stato.flags.caniLeggendariRoaming = true;   // subito: non deve poter ritriggerare
      bloccaMovimento();
      this.cameras.main.shake(350, 0.012);
      const trio = npcStato.filter(s =>
        s.tipo === 'leggendario_ambientale' && (s.legId === 243 || s.legId === 244 || s.legId === 245));
      for (const cane of trio) {
        if (!cane.sprite) continue;
        const spr = cane.sprite;
        this.tweens.add({
          targets: spr, alpha: 0, scale: (spr.scale || 1) * 1.4,
          duration: 400, ease: 'Quad.easeIn',
          onComplete: () => spr.destroy(),
        });
        const i = npcSprites.indexOf(spr);
        if (i >= 0) npcSprites.splice(i, 1);
      }
      for (const cane of trio) {
        const j = npcStato.indexOf(cane);
        if (j >= 0) npcStato.splice(j, 1);
      }
      await new Promise(r => setTimeout(r, 450));

      if (typeof salvaPartita === 'function') salvaPartita();
      if (typeof mostraDialogo === 'function') {
        await mostraDialogo('???', [
          'Un lampo, un ruggito e un balzo felino sono scomparsi tra gli alberi...',
          'I 3 fratelli leggendari sono scappati insieme, come sempre.',
        ]);
      }
      sbloccaMovimento();
    }

    _checkSuicuneTrigger() {
      if (mappaCorrente !== 'lago_nemi') return;
      if (typeof stato === 'undefined' || stato.incontroAttivo || dialogoInCorso) return;
      if (!stato.flags) stato.flags = {};
      if (stato.flags.caniLeggendariRoaming) return;
      const trio = npcStato.filter(s =>
        s.tipo === 'leggendario_ambientale' && (s.legId === 243 || s.legId === 244 || s.legId === 245));
      for (const cane of trio) {
        if (Math.max(Math.abs(posTile.tx - cane.tx), Math.abs(posTile.ty - cane.ty)) <= 2) {
          this._suicuneScappaCutscene();
          break;
        }
      }
    }

    // Roaming dei 3 cani leggendari (Raikou/Entei/Suicune), stesso schema di
    // _checkRoamingLatiosLatias, stessa proporzione (più raro, sono in tre
    // invece che in due). Abbassato insieme a Latios/Latias il 13 agosto.
    _checkRoamingCaniLeggendari() {
      if (typeof stato === 'undefined') return false;
      if (!stato.flags || !stato.flags.caniLeggendariRoaming) return false;
      const disponibili = [243, 244, 245].filter(id =>
        !(typeof legCatturato === 'function' && legCatturato(id)));
      if (disponibili.length === 0) return false;
      if (Math.random() >= 0.0004) return false;   // 0.04% per casella

      const scelto = disponibili[Math.floor(Math.random() * disponibili.length)];
      const nomi = { 243: 'Raikou', 244: 'Entei', 245: 'Suicune' };
      cooldownIncontro = PASSI_TREGUA;
      if (typeof triggeraLeggendarioRoaming === 'function') {
        triggeraLeggendarioRoaming(scelto, 45, nomi[scelto]);
      }
      return true;
    }

    // Porta lo sprite ESATTAMENTE sulla sua casella (annullando il tween di
    // movimento in corso): così al teletrasporto il personaggio non "anticipa".
    _snapPlayer() {
      if (!playerSprite || !scena) return;
      scena.tweens.killTweensOf(playerSprite);
      playerSprite.x = posTile.tx * tileSize + tileSize / 2;
      playerSprite.y = (posTile.ty + 1) * tileSize;
    }

    // Dentro un cluster, posTile è in coordinate GLOBALI (del cluster intero),
    // ma _caricaCluster si aspetta arrivoX/arrivoY LOCALI alla mappa membro
    // (li somma all'offset del box per ricavare la casella globale, vedi
    // "boxEntrata.offsetX + arrivoX"). Se si salva in mappaStack la coordinata
    // GLOBALE così com'è, al ritorno l'offset viene sommato una seconda volta:
    // il giocatore finisce fuori mappa (di solito il "centro" di fallback), non
    // sulla porta da cui era entrato. Va convertita in locale PRIMA di salvarla.
    _coordRitornoMappaStack(tx, ty) {
      if (clusterAttivo && clusterBoxes[mappaCorrente]) {
        const box = clusterBoxes[mappaCorrente];
        return { tx: tx - box.offsetX, ty: ty - box.offsetY };
      }
      return { tx, ty };
    }

    _gestisciPorta(ev) {
      if (transizioneAttiva) return;
      this._snapPlayer();
      const dest = ev.props.destinazione;
      if (!dest) return;
      const datiPorta = (typeof DATI_PORTE !== 'undefined') ? DATI_PORTE[dest] : null;

      // Salva posizione UN tile indietro dalla porta (così al ritorno non ri-entra)
      const backDx = facciata === 'right' ? -1 : facciata === 'left' ? 1 : 0;
      const backDy = facciata === 'down'  ? -1 : facciata === 'up'   ? 1 : 0;
      const returnTx = Math.max(0, Math.min(mapW - 1, posTile.tx + backDx));
      const returnTy = Math.max(0, Math.min(mapH - 1, posTile.ty + backDy));
      const ritorno = this._coordRitornoMappaStack(returnTx, returnTy);

      mappaStack.push({
        mappa: mappaCorrente,
        tx: ritorno.tx,
        ty: ritorno.ty,
        facciata,
      });

      if (datiPorta && datiPorta.mappa && MAPPE[datiPorta.mappa]) {
        const ax = datiPorta.arrivo_x ?? parseInt(ev.props.arrivo_x || '5', 10);
        const ay = datiPorta.arrivo_y ?? parseInt(ev.props.arrivo_y || '8', 10);
        const spawnId = ev.props.spawn_id || ev.props.spawnId || null;
        this.caricaMappa(datiPorta.mappa, ax, ay, spawnId, mappaCorrente);
      } else {
        const nome = (datiPorta && datiPorta.nome) ? datiPorta.nome : (dest || 'Interno');
        this._apriInternoFallback(nome);
      }
    }

    async _transizioneMappa(ev) {
      if (transizioneAttiva) return;

      // ── Cucitura interna a un cluster: la mappa di destinazione è già
      // renderizzata di fianco a quella corrente (stesso cluster), quindi il
      // warp è "spento" — il giocatore ci cammina sopra come terreno normale,
      // senza fade. Non tocca i warp verso interni ('porta') né quelli verso
      // mappe fuori dal cluster o in un altro cluster.
      if (clusterAttivo) {
        const destChiaveCucitura = risolviMappa(ev.props.destinazione);
        if (destChiaveCucitura && trovaCluster(destChiaveCucitura) === clusterAttivo) return;
      }

      // ── GATE: warp che si apre solo se una CONDIZIONE è soddisfatta ──
      // Proprietà Tiled "richiede"/"condizione": può essere un flag (es. "post_lega"),
      // la Lega, o un requisito di squadra in linguaggio naturale
      // (es. "legaCompletata e tre pokemon lotta in squadra"). Messaggio
      // personalizzabile con "messaggio_gate".
      const condW = ev.props.richiede || ev.props.condizione ||
                    (typeof ev.props.gate === 'string' ? ev.props.gate : null);
      if (condW) {
        const esito = verificaCondizione(condW);
        if (!esito.ok) {
          const msg = ev.props.messaggio_gate || esito.messaggio || '🔒 Non puoi ancora entrare qui.';
          if (typeof mostraToast === 'function') mostraToast(msg, 2800);
          return;
        }
      }

      // Fa "arrivare" il personaggio sulla casella prima di cambiare mappa
      // (evita il teletrasporto anticipato a metà animazione).
      this._snapPlayer();

      // Dentro un interno (Centro/Palestra/Market…): qualsiasi uscita SENZA
      // destinazione propria riporta al punto da cui sei entrato (usa lo
      // stack). Se il warp ha invece una "destinazione" esplicita (es. le
      // scale tra i piani di un dungeon multi-mappa come il rifugio GdF di
      // Marino, dove OGNI piano è "interno" ma i piani si collegano tra loro
      // e non solo verso l'esterno), va rispettata: si scende sotto, nel
      // ramo normale poco più in basso, invece di tornare sempre indietro.
      if (mappaInfo && mappaInfo.interno && !ev.props.destinazione) {
        transizioneAttiva = true;
        bloccato = true;
        if (mappaStack.length > 0) {
          const prev = mappaStack.pop();
          await this.caricaMappa(prev.mappa, prev.tx, prev.ty);
        } else {
          // RETE DI SICUREZZA: stack vuoto (es. una vecchia partita salvata
          // già "dentro" un interno, prima della correzione in
          // posizioneAttualeSalvabile) — invece di non fare nulla (il
          // giocatore restava bloccato dentro per sempre), torna allo spawn
          // di default di Borgata Tuscolana: mai più un vicolo cieco.
          console.warn('[Map] Uscita da interno senza mappaStack: torno allo spawn di default.');
          await this.caricaMappa('borgata_tuscolana');
        }
        transizioneAttiva = false;
        bloccato = false;
        return;
      }

      transizioneAttiva = true;
      bloccato = true;

      const dest = ev.props.destinazione;

      // Nessuna destinazione: torna alla mappa precedente (se c'è uno stack)
      if (!dest) {
        if (mappaStack.length > 0) {
          const prev = mappaStack.pop();
          await this.caricaMappa(prev.mappa, prev.tx, prev.ty);
        }
        transizioneAttiva = false;
        bloccato = false;
        return;
      }

      const chiaveDest = risolviMappa(dest);
      if (!chiaveDest) {
        console.warn('[Map] Destinazione non ancora disponibile:', dest);
        if (typeof mostraToast === 'function') mostraToast('🚧 Zona non ancora disponibile', 2000);
        transizioneAttiva = false;
        bloccato = false;
        return;
      }

      // spawn_id esplicito sul warp (se presente), altrimenti si usa la mappa
      // di provenienza per scegliere lo spawn giusto.
      const spawnId = ev.props.spawn_id || ev.props.spawnId || null;
      let ax = (ev.props.arrivo_x !== undefined) ? parseInt(ev.props.arrivo_x, 10) : undefined;
      let ay = (ev.props.arrivo_y !== undefined) ? parseInt(ev.props.arrivo_y, 10) : undefined;
      if (isNaN(ax)) ax = undefined;
      if (isNaN(ay)) ay = undefined;
      const sourceKey = mappaCorrente;

      // Se entriamo in un interno (Centro, palestra, villa…) ricordiamo da dove
      // veniamo, UN TILE indietro dalla porta, così uscendo non ci si rientra subito.
      if (MAPPE[chiaveDest] && MAPPE[chiaveDest].interno) {
        const bdx = facciata === 'right' ? -1 : facciata === 'left' ? 1 : 0;
        const bdy = facciata === 'down'  ? -1 : facciata === 'up'   ? 1 : 0;
        const rtx = Math.max(0, Math.min(mapW - 1, posTile.tx + bdx));
        const rty = Math.max(0, Math.min(mapH - 1, posTile.ty + bdy));
        const ritorno = this._coordRitornoMappaStack(rtx, rty);
        mappaStack.push({ mappa: mappaCorrente, tx: ritorno.tx, ty: ritorno.ty, facciata });
      }

      await this.caricaMappa(chiaveDest, ax, ay, spawnId, sourceKey);
      transizioneAttiva = false;
    }

    // Mappe dei Boschi del Tuscolo dove Celebi può apparire
    _inBoschiTuscolo() {
      return ['tuscolo_ingresso', 'tuscolo_interno', 'tuscolo_rovine',
              'tuscolo_profondo', 'boschetto_segreto'].includes(mappaCorrente);
    }

    // Celebi (251): nei Boschi del Tuscolo, dopo aver sconfitto Il Solitario,
    // 3% per ogni passo nell'erba alta. Restituisce true se è apparso.
    _checkCelebi() {
      if (typeof stato === 'undefined') return false;
      if (!this._inBoschiTuscolo()) return false;
      if (!stato.flags || !stato.flags.il_solitario_sconfitto) return false;
      if (typeof legCatturato === 'function' && legCatturato(251)) return false;
      if (typeof legScomparso === 'function' && legScomparso(251)) return false;
      if (Math.random() >= 0.03) return false;   // 3%

      cooldownIncontro = PASSI_TREGUA;
      if (typeof triggeraLeggendario === 'function') {
        triggeraLeggendario(251, 40, 'Celebi', {
          nome: '🌿 Boschi del Tuscolo',
          righe: [
            'Tra le foglie una luce verde danza nell\'aria…',
            'Un suono antico, come un richiamo dal passato.',
            'È Celebi! Si è mostrato a te!',
          ],
        });
      }
      return true;
    }

    // Roaming Latios/Latias (sessione 6 agosto, sbloccato dalla scena nel
    // Tunnel Roccioso 4F — vedi avviaLatiosLatiasScena): stesso schema di
    // _checkCelebi ma su QUALSIASI zona incontri di tutto il gioco, non una
    // mappa fissa. Pronto per Raikou/Entei in futuro (stesso pattern).
    // Tasso abbassato da 2% a 0.15% per casella (13 agosto, segnalato da
    // Luca: comparivano troppo spesso — 2% su ogni passo in erba li rendeva
    // quasi garantiti entro pochi passi, altro che roaming raro).
    _checkRoamingLatiosLatias() {
      if (typeof stato === 'undefined') return false;
      if (!stato.flags || !stato.flags.latiosLatiasRoaming) return false;
      const disponibili = [380, 381].filter(id =>
        !(typeof legCatturato === 'function' && legCatturato(id)));
      if (disponibili.length === 0) return false;
      if (Math.random() >= 0.0015) return false;   // 0.15% per casella

      const scelto = disponibili[Math.floor(Math.random() * disponibili.length)];
      cooldownIncontro = PASSI_TREGUA;
      if (typeof triggeraLeggendarioRoaming === 'function') {
        triggeraLeggendarioRoaming(scelto, 45, scelto === 381 ? 'Latios' : 'Latias');
      }
      return true;
    }

    _tentaIncontro(ev) {
      if (typeof stato === 'undefined' || stato.incontroAttivo) return;
      if (stato.repellentePassi && stato.repellentePassi > 0) return;

      // Celebi e il roaming hanno la priorità sull'incontro normale (eventi
      // rari, niente repellente).
      if (this._checkCelebi()) return;
      if (this._checkRoamingLatiosLatias()) return;
      if (this._checkRoamingCaniLeggendari()) return;

      const id = ev.id || ev.props.id || '';
      const dati = (typeof DATI_INCONTRI !== 'undefined') ? DATI_INCONTRI[id] : null;
      if (!dati) return;

      // Probabilità per casella (default 15% se la zona non la specifica)
      const prob = (dati.probabilita != null) ? dati.probabilita : PROB_INCONTRO;
      if (Math.random() * 100 > prob) return;

      const pool = dati.pokemon;
      if (!pool || pool.length === 0) return;
      // MOD 3: scelta PESATA. Ogni specie può avere "rate" (peso relativo:
      // comune ~25-30, raro ~8-15, rarissimo ~3-5). Se manca, peso di default 10.
      const totalePesi = pool.reduce((s, p) => s + (p.rate != null ? p.rate : 10), 0);
      let tiro = Math.random() * totalePesi;
      let scelto = pool[0];
      for (const p of pool) {
        tiro -= (p.rate != null ? p.rate : 10);
        if (tiro <= 0) { scelto = p; break; }
      }
      const livello = scelto.min + Math.floor(Math.random() * (scelto.max - scelto.min + 1));

      cooldownIncontro = PASSI_TREGUA;   // tregua prima del prossimo incontro
      stato.incontroAttivo = true;
      bloccaMovimento();
      if (typeof Battle !== 'undefined') {
        Battle.avvia({
          idPokemon: scelto.id,
          livello,
          sfondo: temaBattaglia({ acqua: ev.tipo === 'acqua' || ev.tipo === 'trigger_surf' }),
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            sbloccaMovimento();
            if (typeof salvaPartita === 'function') salvaPartita();
          },
        });
      }
    }

    // Cono visivo dei trainer, controllato ogni frame nella direzione corrente (Fix 4).
    // F9.5 (2 settembre 2026, Fase 1 "trigger" della lotta in doppio): ora si
    // raccolgono TUTTI i trainer che vedono il giocatore nello stesso istante,
    // non solo il primo. Se sono 2+, è la lotta in doppio (vedi _trainerSpottaDoppia);
    // se è 1 solo, comportamento identico a prima (nessuna regressione).
    _controllaTrainerVista() {
      if (typeof stato === 'undefined' || stato.incontroAttivo) return;
      if (transizioneAttiva || bloccato || trainerSpotting) return;
      if (typeof DATI_TRAINER === 'undefined') return;
      // Opzione TEST (menu ☰, sessione 6 agosto): disattiva solo la sfida
      // automatica "a vista" — parlandoci direttamente ([A]) si può comunque
      // testare la lotta di un singolo allenatore quando serve.
      if (stato.flags && stato.flags.testNoTrainerChallenge) return;

      const visti = [];

      for (const st of npcStato) {
        if (st.tipo !== 'trainer') continue;
        const id = st.id;
        if (!id) continue;
        if (trainerBattuti.has(id)) continue;
        if (typeof stato.allenatoriBattuti !== 'undefined' &&
            stato.allenatoriBattuti.includes(id)) {
          trainerBattuti.add(id);
          continue;
        }

        const dati = DATI_TRAINER[id];
        if (!dati) continue;

        // vista 0 (o assente sul capopalestra) = NESSUNA linea visiva: si sfida
        // solo parlandoci con [A], non passandoci davanti.
        let vRaw = st.ev.props.vista;
        if (vRaw === undefined || vRaw === '') vRaw = dati.vista;
        const vista = parseInt(vRaw, 10);
        if (!vista || vista <= 0) continue;

        const { dx, dy } = this._dirDelta(st.dir);
        if (dx === 0 && dy === 0) continue;

        // Scansiona in linea retta finché non incontra un muro o il giocatore
        let visto = false;
        for (let d = 1; d <= vista; d++) {
          const cx = st.tx + dx * d, cy = st.ty + dy * d;
          if (cx < 0 || cy < 0 || cx >= mapW || cy >= mapH) break;
          if (collGrid && collGrid[cy] && collGrid[cy][cx] === 1) break;
          if (cx === posTile.tx && cy === posTile.ty) { visto = true; break; }
        }

        if (visto) visti.push({ st, id, dati });
      }

      if (visti.length === 0) return;
      if (visti.length === 1) {
        this._trainerSpotta(visti[0].st, visti[0].id, visti[0].dati);
        return;
      }
      // 2+ trainer vedono il giocatore nello stesso istante → lotta in doppio.
      // Per ora si prendono solo i primi due (il caso "3+ in doppio" non esiste
      // nel design attuale, vedi CLAUDE.md: solo 2 avversari alla volta).
      this._trainerSpottaDoppia(visti[0], visti[1]);
    }

    // Il trainer ti ha avvistato: "!" sopra la testa, poi cammina verso di te
    // fino a esserti accanto, infine parte la lotta (tu resti bloccato).
    async _trainerSpotta(st, id, dati) {
      if (trainerSpotting) return;
      trainerSpotting = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);

      await this._mostraEsclamazione(st);

      // Cammina in linea retta nella direzione in cui guarda, fino ad essere
      // adiacente al giocatore (la casella davanti diventa quella del player).
      const { dx, dy } = this._dirDelta(st.dir);
      let guard = 0;
      while (guard++ < 30) {
        const nx = st.tx + dx, ny = st.ty + dy;
        if (nx === posTile.tx && ny === posTile.ty) break;   // sei davanti a lui
        if (!this._liberoPerNPC(nx, ny, st)) break;          // ostacolo imprevisto
        await this._passoTrainer(st, nx, ny);
      }
      if (st.sprite) this._setNpcFrame(st.sprite, st.dir, false);

      trainerSpotting = false;
      this._avviaLottaTrainer(id, dati, st.ev);
    }

    // F9.5 Fase 1 (2 settembre 2026): due trainer avvistano il giocatore nello
    // stesso istante → si avvicinano ENTRAMBI in parallelo (non in sequenza).
    // Fase 2 (motore Battle 2v2 vero, js/battle.js Battle.avviaDoppia): vedi
    // _avviaLottaTrainerDoppia più sotto, chiamata a fine avvicinamento.
    async _trainerSpottaDoppia(a, b) {
      if (trainerSpotting) return;
      trainerSpotting = true;
      bloccaMovimento();
      if (playerSprite) playerSprite.anims.play(this._animKeyPlayer('idle', facciata), true);

      await Promise.all([this._mostraEsclamazione(a.st), this._mostraEsclamazione(b.st)]);

      // Avvicinamento in parallelo: entrambi camminano verso il giocatore finché
      // non gli sono adiacenti (stessa logica di _trainerSpotta, ma per due).
      const avvicina = async (st) => {
        const { dx, dy } = this._dirDelta(st.dir);
        let guard = 0;
        while (guard++ < 30) {
          const nx = st.tx + dx, ny = st.ty + dy;
          if (nx === posTile.tx && ny === posTile.ty) break;
          if (!this._liberoPerNPC(nx, ny, st)) break;
          await this._passoTrainer(st, nx, ny);
        }
        if (st.sprite) this._setNpcFrame(st.sprite, st.dir, false);
      };
      await Promise.all([avvicina(a.st), avvicina(b.st)]);

      trainerSpotting = false;
      this._avviaLottaTrainerDoppia(a, b);
    }

    // Lotta in doppio vera (Fase 2, Battle.avviaDoppia): "a" e "b" sono le
    // voci { st, id, dati } raccolte da _controllaAvvistamentoTrainer per i
    // 2 allenatori che hanno visto il giocatore nello stesso istante.
    _avviaLottaTrainerDoppia(a, b) {
      stato.incontroAttivo = true;
      bloccaMovimento();

      const risolviAllenatore = (v) => {
        const nomeLotta = v.dati.nome || (v.st.ev && v.st.ev.nome) || v.id;
        let squadra = v.dati.squadra;
        if (v.dati.rivale && v.st.ev && typeof costruisciSquadraRivale === 'function') {
          squadra = costruisciSquadraRivale(
            v.st.ev.props.tappa || 1, parseInt(v.st.ev.props.asso_livello, 10) || null);
        }
        return {
          nome: nomeLotta, squadra,
          dialogoSconfitta: v.dati.dialogo_dopo || '',
          premioSoldi: v.dati.premio || 100,
        };
      };
      const allenatoreA = risolviAllenatore(a);
      const allenatoreB = risolviAllenatore(b);

      const dopoDialoghi = () => {
        Battle.avviaDoppia({
          allenatori: [allenatoreA, allenatoreB],
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            let gestitoAltrove = false;
            if (esito === 'vittoria') {
              // Bookkeeping per ENTRAMBI gli allenatori (stessa logica della
              // lotta singola, vedi _applicaEsitoTrainer): medaglia/flag/
              // trainerBattuti valgono per ciascuno indipendentemente.
              const g1 = this._applicaEsitoTrainer(a.id, a.dati, a.st.ev);
              const g2 = this._applicaEsitoTrainer(b.id, b.dati, b.st.ev);
              gestitoAltrove = g1 || g2;
            }
            if (!gestitoAltrove) {
              sbloccaMovimento();
              if (typeof salvaPartita === 'function') salvaPartita();
            }
          },
        });
      };

      if (typeof mostraDialogo === 'function') {
        const dialogoA = a.dati.dialogo_prima || 'Preparati a lottare!';
        const dialogoB = b.dati.dialogo_prima || 'Preparati a lottare!';
        mostraDialogo(allenatoreA.nome, [dialogoA])
          .then(() => mostraDialogo(allenatoreB.nome, [dialogoB]))
          .then(dopoDialoghi);
      } else {
        dopoDialoghi();
      }
    }

    // Mostra un "!" giallo sopra il trainer per un attimo.
    _mostraEsclamazione(st) {
      return new Promise(resolve => {
        let txt = null;
        if (scena && st.sprite) {
          txt = scena.add.text(st.sprite.x, st.sprite.y - tileSize * 1.4, '!', {
            fontSize: '28px', fontStyle: 'bold', color: '#ffe14d',
            stroke: '#000', strokeThickness: 5,
          }).setOrigin(0.5, 1).setDepth(100);
        }
        setTimeout(() => { if (txt) txt.destroy(); resolve(); }, 650);
      });
    }

    // Un passo del trainer verso (nx,ny) con animazione; risolve a fine tween.
    // NON rimette il frame in posa ferma a ogni singolo passo: chi chiama
    // questa funzione in un ciclo (più passi di fila) deve farlo UNA volta
    // sola, alla fine di TUTTA la camminata (vedi _camminaVersoGiocatore,
    // _cutscenaMuoviNpc, _trainerSpotta, _trainerSpottaDoppia). Farlo a ogni
    // passo faceva ripartire l'animazione da capo ogni 170ms: il ciclo a 4
    // frame non arrivava mai oltre la prima posa, dando l'effetto "cammina
    // sempre con lo stesso braccio avanti" segnalato da Luca.
    _passoTrainer(st, nx, ny) {
      return new Promise(resolve => {
        st.tx = nx; st.ty = ny;
        this._setNpcFrame(st.sprite, st.dir, true);          // frame "in cammino"
        if (!st.sprite || !scena) { resolve(); return; }
        const px = nx * tileSize + tileSize / 2;
        const py = (ny + 1) * tileSize;
        scena.tweens.add({
          targets: st.sprite, x: px, y: py, duration: 170, ease: 'Linear',
          onComplete: () => { resolve(); },
        });
      });
    }

    // Bookkeeping post-vittoria per UN allenatore (medaglia/flag/palestraId/
    // trainerBattuti/cura/eventi speciali): estratto da _avviaLottaTrainer
    // così sia la lotta singola sia quella in doppio (2 allenatori insieme,
    // _trainerSpottaDoppia più sotto) chiamano la STESSA logica, una volta
    // per allenatore, senza duplicarla. Ritorna true se il chiamante NON deve
    // fare lui stesso sbloccaMovimento()/salvaPartita() (caso palestraId: il
    // dialogo della medaglia gestisce da sé blocco/sblocco e salva già lui).
    _applicaEsitoTrainer(id, dati, ev) {
      trainerBattuti.add(id);
      if (!stato.allenatoriBattuti) stato.allenatoriBattuti = [];
      if (!stato.allenatoriBattuti.includes(id)) stato.allenatoriBattuti.push(id);
      if (!stato.allenatoriBattutiGiorno) stato.allenatoriBattutiGiorno = {};
      stato.allenatoriBattutiGiorno[id] = (stato.tempo && stato.tempo.giorno) || 0;
      // Capopalestra: assegna medaglia + alza il level cap (logica in app.js).
      // Il dialogo della medaglia gestisce da sé il blocco/sblocco movimento.
      if (dati.palestraId && typeof vinciPalestraTiled === 'function') {
        vinciPalestraTiled(dati.palestraId);
        // Camilla (Genzano, 8ª palestra): appena vinta, diventa "pronta a
        // uscire" — l'NPC compare da questo momento (non prima, non si
        // vedeva già lì per tutto il gioco) e la cutscene la fa camminare
        // fuori quando attraversi il trigger davanti alla palestra.
        if (dati.palestraId === 'genzano') {
          if (!stato.flags) stato.flags = {};
          stato.flags.camilla_pronta_uscita = true;
        }
        if (typeof salvaPartita === 'function') salvaPartita();
        return true;
      }
      // Flag di vittoria opzionale (es. il rivale setta "rivale_tuscolo_battuto")
      if (dati.flagVittoria) {
        if (!stato.flags) stato.flags = {};
        stato.flags[dati.flagVittoria] = true;
        // Le 2 delle 3 parti password del Rifugio GdF di Marino passano da
        // qui (Michela → museo_nemi_password, Ginevra → abbazia_password,
        // sess. 8 set 2026): dopo ognuna, controlla se ora ci sono tutte e 3.
        this._controllaPasswordRifugio();
      }
      // Campione della Lega sconfitto: fine del gioco principale, sblocca il
      // post-game (Bunkerino/CoTrAL, leggendari post-Lega, ecc. — vedi CLAUDE.md).
      if (dati.campioneLega) {
        if (!stato.flags) stato.flags = {};
        stato.flags.legaCompletata = true;
      }
      // Boss GdF della Grotta del Vulcano (sess. 8 set 2026): battuto (ultimo
      // della catena sottocomandante→boss) → seconda parte di cutscene
      // (grunt+boss scappano, scienziato ringrazia e regala la Pietra
      // Rubino). ATTENZIONE: questo blocco deve girare PRIMA di quello
      // generico "trainer SPECIALE" qui sotto (di cui il boss ha anch'esso
      // la property) e NON deve settare subito il flag "..._sconfitto" né
      // richiamare _rigeneraNpc(): quel flag è la stessa gate condition che
      // nasconde i grunt su TUTTI i piani, quindi se scattasse già qui i
      // grunt della stanza del boss sparirebbero di scatto PRIMA che la
      // cutscene riesca a farli camminare via in scena (bug segnalato da
      // Luca: "i gdf spariscono appena finita la lotta"). Il flag scatta
      // DENTRO alla cutscene stessa, dopo "filiamo", coperto da uno
      // schermo nero — vedi dati/cutscene.js 'grotta_vulcano_boss_dopo'.
      // Gestisce da sé blocco/sblocco movimento e salvataggio, quindi
      // ritorna true come gli altri casi "gestiti altrove" qui sotto.
      if (id === 'gdf_boss_grotta_vulcano') {
        this._giocaCutscene('grotta_vulcano_boss_dopo').then(() => {
          this._rigeneraNpc().then(() => {   // fa sparire lo scienziato per sempre (flag ora vero)
            if (typeof salvaPartita === 'function') salvaPartita();
          });
        });
        return true;
      }
      // Giovanni al Rifugio di Marino (sess. 8 set 2026, arco GdF riscritto —
      // vedi docs/STORIA_COMPLETA.md): è il PRIMO incontro con lui, prima
      // della Grotta del Vulcano. Sconfitto, regala la Pietra Zaffiro
      // (Kyogre) e se ne va con la stessa promessa di rivalsa che poi
      // mantiene alla Grotta.
      if (id === 'gdf_capo_marino') {
        this._giocaCutscene('rifugio_marino_boss_dopo').then(() => {
          if (typeof salvaPartita === 'function') salvaPartita();
        });
        return true;
      }
      // Trainer SPECIALE (es. Il Solitario): alza un flag "<id>_sconfitto"
      // e rinfresca gli NPC (così appare l'NPC post-battaglia e il campione
      // sparisce). Il flag sblocca anche l'incontro con Celebi.
      if (ev && ev.props && (ev.props.speciale === true || ev.props.speciale === 'true')) {
        if (!stato.flags) stato.flags = {};
        stato.flags[id + '_sconfitto'] = true;
        this._rigeneraNpc();
      }
      // Cura automatica dopo la lotta (SOLO per trainer con questa property
      // esplicita, es. il miniboss di Monte Cavo — non va generalizzata).
      if (ev && ev.props && (ev.props.curaDopoLotta === true || ev.props.curaDopoLotta === 'true') &&
          typeof curaCompletaSquadra === 'function') {
        curaCompletaSquadra();
        if (typeof aggiornaHUD === 'function') aggiornaHUD();
      }
      // NOTA (sess. 12 set 2026, richiesta esplicita di Luca): battere questi
      // 2 grunt di collegamento_Cotral NON alza più baso_tornato da sola —
      // era prematuro (Baso li insegue dentro il Rifugio CoTrAL di Rocca di
      // Papa, non è ancora "tornato" finché non ne esce davvero). Il flag
      // scatta ora SOLO a fine epilogo dentro quel rifugio, vedi
      // _epilogoBasoCotralRocca più sotto.
      return false;
    }

    // Le 3 parti della password del Rifugio GdF di Marino (sess. 8 set 2026,
    // arco GdF riscritto): baso_tornato (1ª, lettera CoTrAL Monte Cavo),
    // museo_nemi_password (2ª, Michela), abbazia_password (3ª, Ginevra).
    // Ottenibili in QUALSIASI ordine — appena tutte e 3 sono vere, sblocca
    // il flag combinato che il warp della porta del rifugio controlla
    // davvero (verificaCondizione capisce solo UN flag alla volta, non un
    // "e" tra più flag — stesso schema già usato per baso_tornato stesso).
    _controllaPasswordRifugio() {
      if (!stato.flags || stato.flags.password_rifugio_completa) return;
      if (stato.flags.baso_tornato && stato.flags.museo_nemi_password && stato.flags.abbazia_password) {
        stato.flags.password_rifugio_completa = true;
        if (typeof mostraToast === 'function') {
          mostraToast('🔑 Hai tutte e 3 le parti della password del Rifugio GdF di Marino!', 3500);
        }
      }
    }

    _avviaLottaTrainer(id, dati, ev) {
      stato.incontroAttivo = true;
      bloccaMovimento();

      const nomeLotta = dati.nome || ev.nome || id;
      const dialogo = dati.dialogo_prima || 'Preparati a lottare!';
      // Rivale: squadra scalata in base alla "tappa" (n. incontro) con l'asso = starter
      let squadra = dati.squadra;
      if (dati.rivale && typeof costruisciSquadraRivale === 'function') {
        squadra = costruisciSquadraRivale(ev.props.tappa || 1, parseInt(ev.props.asso_livello, 10) || null);
      }
      // Lega di Colonna: Superquattro/Campione pescano dal pool vero (5
      // casuali + core più forte per ultimo), non usano "squadra" statico —
      // vedi SUPERQUATTRO/REMO_LEGA in js/data.js, estraiTeamSuperquattro/
      // estraiTeamRemo in js/app.js (sistema già scritto, mai collegato alle
      // mappe Tiled prima d'ora).
      if (dati.superquattro && typeof SUPERQUATTRO !== 'undefined' && typeof estraiTeamSuperquattro === 'function') {
        const membro = SUPERQUATTRO.find(m => m.id === dati.superquattro);
        if (membro) squadra = estraiTeamSuperquattro(membro);
      } else if (dati.campioneLega && typeof estraiTeamRemo === 'function') {
        squadra = estraiTeamRemo();
      }
      const dopoDialogo = () => {
        Battle.avvia({
          allenatore: {
            nome: nomeLotta,
            squadra: squadra,
            dialogoSconfitta: dati.dialogo_dopo || '',
            premioSoldi: dati.premio || 100,
          },
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            // Battaglia a catena (es. sottocomandante → boss, Grotta del
            // Vulcano, sess. 8 set 2026): se questo trainer ha "prossimaLotta"
            // e hai vinto, si passa SUBITO al prossimo avversario, senza
            // applicare ricompense/flag intermedi (quelli scattano solo
            // sull'ULTIMO della catena, quando dati.prossimaLotta è assente).
            if (esito === 'vittoria' && dati.prossimaLotta &&
                typeof DATI_TRAINER !== 'undefined' && DATI_TRAINER[dati.prossimaLotta]) {
              // Grotta del Vulcano (richiesta esplicita di Luca): dopo
              // Levantino, Giovanni non prende semplicemente il suo posto —
              // entra FISICAMENTE in scena camminando verso il giocatore,
              // vedi _arrivoGiovanniGrottaVulcano.
              if (dati.prossimaLotta === 'gdf_boss_grotta_vulcano') {
                this._arrivoGiovanniGrottaVulcano(ev);
                return;
              }
              this._avviaLottaTrainer(dati.prossimaLotta, DATI_TRAINER[dati.prossimaLotta], ev);
              return;
            }
            const gestitoAltrove = esito === 'vittoria' && this._applicaEsitoTrainer(id, dati, ev);
            // Lega di Colonna: si va SOLO avanti (nessuna scala per tornare
            // indietro da un piano all'altro, richiesta esplicita di Luca).
            // Se perdi contro un membro del Superquattro/il Campione, non
            // resti fermo dov'eri (comportamento normale altrove, vedi
            // gestisciKO in battle.js): torni davanti all'ingresso della
            // Lega, come ricominciare la sfida da capo.
            if (esito === 'sconfitta' && (dati.superquattro || dati.campioneLega)) {
              sbloccaMovimento();
              this.caricaMappa('lega_pokemon', 35, 45, 'spawn_lega_ingresso');
              if (typeof salvaPartita === 'function') salvaPartita();
              return;
            }
            if (!gestitoAltrove) {
              sbloccaMovimento();
              if (typeof salvaPartita === 'function') salvaPartita();
            }
          },
        });
      };

      if (typeof mostraDialogo === 'function') {
        mostraDialogo(nomeLotta, [dialogo]).then(dopoDialogo);
      } else {
        dopoDialogo();
      }
    }

    // Risfida (sessione 12 agosto): un allenatore "normale" già battuto, dopo
    // almeno 7 giorni di gioco, si può risfidare. Squadra rilivellata (ogni
    // Pokémon al massimo 1.5× il livello originale), soldi dimezzati rispetto
    // alla prima vittoria (l'EXP resta la ricompensa principale, dato che sale
    // naturalmente coi livelli più alti). Non assegna medaglie/flag di storia:
    // è escluso a monte (vedi il chiamante) per capipalestra/boss/rivale.
    async _offriRisfida(id, dati, ev) {
      if (typeof stato === 'undefined' || stato.incontroAttivo) return;
      if (typeof dialogoInCorso !== 'undefined' && dialogoInCorso) return;
      const nomeLotta = dati.nome || ev.nome || id;
      if (typeof mostraScelta !== 'function') return;
      const scelta = await mostraScelta(
        `${nomeLotta} sembra pronto per una rivincita. Vuoi risfidarlo?`, 'Sì', 'No'
      );
      if (scelta !== 1) return;

      const squadraScalata = dati.squadra.map(p => ({
        ...p, livello: Math.min(Math.round(p.livello * 1.5), 100),
      }));

      stato.incontroAttivo = true;
      bloccaMovimento();
      Battle.avvia({
        allenatore: {
          nome: nomeLotta,
          squadra: squadraScalata,
          dialogoSconfitta: dati.dialogo_dopo || '',
          premioSoldi: Math.round((dati.premio || 100) / 2),
        },
        stato,
        onFine: (esito) => {
          stato.incontroAttivo = false;
          sbloccaMovimento();
          if (esito === 'vittoria') {
            if (!stato.allenatoriBattutiGiorno) stato.allenatoriBattutiGiorno = {};
            stato.allenatoriBattutiGiorno[id] = (stato.tempo && stato.tempo.giorno) || 0;
          }
          if (typeof salvaPartita === 'function') salvaPartita();
        },
      });
    }

    /* ────────── INTERNO FALLBACK ────────── */

    _apriInternoFallback(nomeLuogo) {
      ['hud', 'btn-menu', 'btn-velocita', 'dpad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      bloccaMovimento();
      this.scene.pause();
      // Vedi apriMenuNativo(): phaserGame.scene.launch dava "is not a
      // function" a runtime, this.scene (il ScenePlugin di questa stessa
      // scena) è la via garantita.
      this.scene.launch('InteriorScene', { nome: nomeLuogo || 'Casa' });
    }

    /* ────────── D-PAD ────────── */

    _collegaDpad() {
      // Il bottone si limita a dichiarare "questa direzione è tenuta premuta";
      // a muovere per davvero (con lo stesso ritardo gira-prima-poi-cammina e
      // la stessa durata passo/corsa/bici) ci pensa update(), esattamente
      // come per le frecce da tastiera — un solo punto che decide il movimento.
      this.dpadDx = 0;
      this.dpadDy = 0;
      const btn = (id, dx, dy) => {
        const el = document.getElementById(id);
        if (!el) return;
        const start = () => { this.dpadDx = dx; this.dpadDy = dy; };
        const stop = () => {
          if (this.dpadDx === dx && this.dpadDy === dy) { this.dpadDx = 0; this.dpadDy = 0; }
        };
        el.addEventListener('pointerdown', start);
        el.addEventListener('pointerup',   stop);
        el.addEventListener('pointerleave', stop);
      };
      btn('btn-su',        0, -1);
      btn('btn-giu',       0,  1);
      btn('btn-sinistra', -1,  0);
      btn('btn-destra',    1,  0);
    }
  }

  /* ══════════════════════════════════════════════════════════
     INTERIOR SCENE — fallback per interni senza TMJ
     ══════════════════════════════════════════════════════════ */

  class InteriorScene extends Phaser.Scene {
    constructor() { super({ key: 'InteriorScene' }); }

    init(data) { this._nome = data.nome || 'Casa'; }

    create() {
      const TI = 32, COLS = 10, ROWS = 8;
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const RW = COLS * TI, RH = ROWS * TI;
      const OX = Math.floor((CW - RW) / 2), OY = Math.floor((CH - RH) / 2) - 20;

      this._grid = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,9,9,9,1,1,1,1,1],
      ];
      this._COLS = COLS; this._ROWS = ROWS;
      this._TI = TI; this._OX = OX; this._OY = OY;

      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0a0a14).setDepth(0);
      const gfx = this.add.graphics().setDepth(1);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const px = OX + c * TI, py = OY + r * TI;
          const v = this._grid[r][c];
          if (v === 1) {
            gfx.fillStyle(0x3a2515).fillRect(px, py, TI, TI);
            gfx.fillStyle(0x2a180e).fillRect(px, py, TI, 4);
            gfx.lineStyle(1, 0x1a0a05, 0.7); gfx.strokeRect(px, py, TI, TI);
          } else if (v === 9) {
            gfx.fillStyle(0x6a3a1a).fillRect(px, py, TI, TI);
          } else {
            const col = ((r + c) % 2 === 0) ? 0xB09070 : 0xA08060;
            gfx.fillStyle(col).fillRect(px, py, TI, TI);
            gfx.lineStyle(1, 0x7a5a3a, 0.3); gfx.strokeRect(px, py, TI, TI);
          }
        }
      }
      this.add.text(OX + 3 * TI + TI * 1.5, OY + 7 * TI + TI / 2, '▼',
        { fontSize: '12px', color: '#ffcb05' }).setOrigin(0.5).setDepth(3);
      this.add.text(CW / 2, OY - 18, this._nome, {
        fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(5);
      this.add.text(CW / 2, OY + RH + 6, '↓ sulla porta per uscire',
        { fontFamily: 'Arial', fontSize: '10px', color: '#888' }
      ).setOrigin(0.5, 0).setDepth(5);

      this._px = 4; this._py = 6;
      const spx = OX + this._px * TI + TI / 2;
      const spy = OY + (this._py + 1) * TI;
      this._sprite = this.add.sprite(spx, spy, 'player-red')
        .setOrigin(0.5, 1).setDepth(10).setScale(1.2);
      this._sprite.anims.play('idle-up', true);
      this._facciata = 'up';

      this._cursors = this.input.keyboard.createCursorKeys();
      this._wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.input.keyboard.addCapture([38, 40, 37, 39]);
      this._cd = 0;
    }

    update(_t, delta) {
      this._cd -= delta;
      if (this._cd > 0) return;
      const c = this._cursors, k = this._wasd;
      let dx = 0, dy = 0;
      if (c.left.isDown || k.A.isDown) dx = -1;
      else if (c.right.isDown || k.D.isDown) dx = 1;
      else if (c.up.isDown || k.W.isDown) dy = -1;
      else if (c.down.isDown || k.S.isDown) dy = 1;
      if (dx === 0 && dy === 0) {
        this._sprite.anims.play(`idle-${this._facciata}`, true); return;
      }
      this._cd = 140;
      const nx = this._px + dx, ny = this._py + dy;
      if (ny >= this._ROWS - 1 && nx >= 2 && nx <= 4) { this._esci(); return; }
      if (nx < 0 || nx >= this._COLS || ny < 0 || ny >= this._ROWS) return;
      if (this._grid[ny][nx] !== 0) return;
      this._px = nx; this._py = ny;
      if (dx < 0) this._facciata = 'left';
      else if (dx > 0) this._facciata = 'right';
      else if (dy < 0) this._facciata = 'up';
      else this._facciata = 'down';
      this._sprite.anims.play(`walk-${this._facciata}`, true);
      const tx = this._OX + this._px * this._TI + this._TI / 2;
      const ty = this._OY + (this._py + 1) * this._TI;
      this.tweens.killTweensOf(this._sprite);
      this.tweens.add({ targets: this._sprite, x: tx, y: ty, duration: 120, ease: 'Linear' });
    }

    _esci() {
      this.scene.stop('InteriorScene');
      this.scene.resume('GameScene');
      ['hud', 'btn-menu', 'btn-velocita', 'dpad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.removeProperty('display');
      });
      if (mappaStack.length > 0) {
        const prev = mappaStack.pop();
        if (scena) scena.caricaMappa(prev.mappa, prev.tx, prev.ty);
      } else {
        sbloccaMovimento();
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     MENU START — Scene Phaser dedicate (PROBLEMA 3, richiesta
     esplicita di Luca: non più un pannello DOM sopra la mappa, ma
     vere Scene a schermo intero come nell'originale Essentials
     — stesso pattern già collaudato di InteriorScene qui sopra
     (this.scene.pause/launch/stop/resume). Migrazione GRADUALE,
     una voce alla volta (concordato con Luca): oggi solo "Squadra"
     è una vera Scene nativa (PartyScene sotto); Zaino/Salva
     restano temporaneamente sul vecchio pannello DOM esistente
     (aperto/chiuso da apriSezioneMenuDaSceneNativa/tornaAMenuNativo
     in app.js) finché non vengono migrate anche loro allo stesso
     modo — non è un placeholder rotto, è la stessa UI già
     funzionante di prima, solo non ancora riscritta in Canvas.

     Rifatto (sess. 5 set) leggendo lo script vero
     0293_UI_PauseMenu.rb: in Essentials questo NON è una schermata a
     sé, è una piccola finestra-elenco ancorata in alto a destra con
     la mappa ancora visibile e viva dietro — niente titolo "MENU",
     niente emoji, voce "Scheda Allenatore" mostrata col nome vero
     del giocatore (Rosso/Rossa). "Recap" (passi/medaglie/MN — non
     esiste nell'originale) non è più una voce qui: è diventata la
     seconda pagina della Scheda Allenatore (vedi TrainerCardScene).
     Pokédex/Pokégear/Opzioni mancano ancora come SISTEMI (non solo
     come voce): restano fuori da questa lista finché non li
     costruiamo, non li abbiamo aggiunti vuoti per non lasciare
     funzioni a metà. "Esci dal gioco" dell'originale non ha senso in
     un gioco da browser (si chiude la scheda), omesso di proposito.
     ══════════════════════════════════════════════════════════ */

  const VOCI_MENU_START = [
    { chiave: 'pokedex', etichetta: 'Pokédex', nativa: true },
    { chiave: 'squadra', etichetta: 'Pokémon', nativa: true },
    { chiave: 'zaino',   etichetta: 'Borsa',   nativa: true },
    { chiave: 'carta',   etichetta: null,      nativa: true },   // nome vero, calcolato in create()
    { chiave: 'salva',   etichetta: 'Salva',   nativa: true },
    { chiave: 'opzioni', etichetta: 'Opzioni', nativa: true },
  ];

  class PauseMenuScene extends Phaser.Scene {
    constructor() { super({ key: 'PauseMenuScene' }); }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const femmina = typeof stato !== 'undefined' && stato.genere === 'F';
      // "Scheda Allenatore" in Essentials reale non è un'etichetta generica:
      // è il nome vero del giocatore (proc { next $player.name }).
      const voci = VOCI_MENU_START.map(v => v.chiave === 'carta'
        ? { ...v, etichetta: femmina ? 'Rossa' : 'Rosso' } : v);
      this._voci = voci;

      // Finestra-elenco ancorata in alto a destra, mappa viva e visibile
      // dietro (GameScene è solo IN PAUSA, non fermata — vedi apriMenuNativo):
      // niente più overlay opaco a schermo intero né titolo "MENU" centrale,
      // che nell'originale (0293_UI_PauseMenu.rb) non esistono affatto.
      const PADDING = 10, RIGA_H = 26, MARGINE = 8;
      const font = { fontFamily: "'Press Start 2P', monospace", fontSize: '11px' };
      // Larghezza minima sulla voce più lunga, misurata con un testo di prova.
      const misura = this.add.text(0, 0, '', font).setVisible(false);
      let largMax = 60;
      voci.forEach(v => { misura.setText(v.etichetta); largMax = Math.max(largMax, misura.width); });
      misura.destroy();
      const largBox = largMax + PADDING * 2 + 14;   // +14 per il cursore ▶
      const altBox = voci.length * RIGA_H + PADDING * 2;
      const boxX = CW - MARGINE - largBox, boxY = MARGINE;

      // Sfondo con lieve sfumatura verticale (approssimazione della
      // windowskin reale di Essentials, blu chiaro→scuro) + bordo chiaro:
      // non è il 9-slice esatto dell'originale (richiederebbe affettare
      // Graphics/Windowskins/Window.png pixel per pixel), ma restituisce
      // lo stesso "sapore" di finestra di sistema invece di un rettangolo
      // piatto o — peggio — dello schermo intero oscurato di prima.
      const bg = this.add.graphics().setDepth(1);
      bg.fillGradientStyle(0x3858a8, 0x3858a8, 0x0c1840, 0x0c1840, 1);
      bg.fillRect(boxX, boxY, largBox, altBox);
      bg.lineStyle(2, 0xf0f4ff, 1);
      bg.strokeRect(boxX, boxY, largBox, altBox);

      this._cursore = 0;
      this._testi = voci.map((voce, i) => {
        const y = boxY + PADDING + i * RIGA_H + RIGA_H / 2;
        const cursoreTxt = this.add.text(boxX + PADDING, y, '▶', {
          fontFamily: "'Press Start 2P', monospace", fontSize: '11px', color: '#ffcb05',
        }).setOrigin(0, 0.5).setDepth(2).setVisible(i === 0);
        const testo = this.add.text(boxX + PADDING + 14, y, voce.etichetta, {
          ...font, color: i === 0 ? '#ffcb05' : '#f0f4ff',
        }).setOrigin(0, 0.5).setDepth(2);
        return { cursoreTxt, testo };
      });

      // Ascoltatori diretti sugli eventi keydown-* invece del polling con
      // JustDown() dentro update(): GameScene resta viva (solo in pausa)
      // sotto questa Scene e tiene i suoi stessi tasti frecce/B "occupati"
      // (this.cursors/this.biciKey) — con gli eventi non serve affidarsi al
      // ciclo update() di QUESTA scena per intercettarli, più robusto.
      this.input.keyboard.on('keydown-UP',   () => this._spostaCursore(-1));
      this.input.keyboard.on('keydown-DOWN', () => this._spostaCursore(1));
      this.input.keyboard.on('keydown-ENTER', () => this._conferma());
      this.input.keyboard.on('keydown-SPACE', () => this._conferma());
      this.input.keyboard.on('keydown-ESC', () => this._esci());
      this.input.keyboard.on('keydown-B', () => this._esci());
    }

    _esci() {
      this.scene.stop();
      if (typeof window.chiudiMenuNativoDaScene === 'function') window.chiudiMenuNativoDaScene();
    }

    _spostaCursore(delta) {
      this._testi[this._cursore].cursoreTxt.setVisible(false);
      this._testi[this._cursore].testo.setColor('#f0f4ff');
      this._cursore = (this._cursore + delta + this._voci.length) % this._voci.length;
      this._testi[this._cursore].cursoreTxt.setVisible(true);
      this._testi[this._cursore].testo.setColor('#ffcb05');
    }

    // Chiave voce → Scene nativa che la mostra (aggiungere qui man mano che
    // si migrano le altre sezioni, insieme a VOCI_MENU_START più sopra).
    static SCENA_PER_VOCE = { pokedex: 'PokedexScene', squadra: 'PartyScene', zaino: 'ZainoScene', carta: 'TrainerCardScene', salva: 'SalvaScene', opzioni: 'OpzioniScene' };

    _conferma() {
      const voce = VOCI_MENU_START[this._cursore];
      if (voce.nativa) {
        this.scene.stop();
        this.scene.launch(PauseMenuScene.SCENA_PER_VOCE[voce.chiave] || 'PartyScene');
      } else {
        this.scene.stop();
        if (typeof window.apriSezioneMenuDaSceneNativa === 'function') {
          window.apriSezioneMenuDaSceneNativa(voce.chiave);
        }
      }
    }

  }

  /* ══════════════════════════════════════════════════════════
     SCHEDA ALLENATORE (Trainer Card) — nuova, richiesta esplicita
     di Luca ("voglio un menu stile Pokémon identico"): asset reali
     di Essentials (card.png/card_f.png, icon_badges.png), coordinate
     di testo lette da UI_TrainerCard.rb (Scripts.rxdata). Il progetto
     non traccia ID allenatore/Pokédex/tempo di gioco: quelle righe
     dell'originale sono omesse invece di mostrare dati inventati.
     ══════════════════════════════════════════════════════════ */

  const UI_CARD_W = 512, UI_CARD_H = 384;

  class TrainerCardScene extends Phaser.Scene {
    constructor() { super({ key: 'TrainerCardScene' }); }

    preload() {
      if (!this.textures.exists('ui-card-m')) this.load.image('ui-card-m', 'sprites/ui/trainercard/card.png');
      if (!this.textures.exists('ui-card-f')) this.load.image('ui-card-f', 'sprites/ui/trainercard/card_f.png');
      if (!this.textures.exists('ui-card-badges')) this.load.image('ui-card-badges', 'sprites/ui/trainercard/icon_badges.png');
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const scala = Math.min(CW / UI_CARD_W, CH / UI_CARD_H);
      const offX = (CW - UI_CARD_W * scala) / 2, offY = (CH - UI_CARD_H * scala) / 2;

      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x2a2018, 1).setDepth(0);
      const layer = this.add.container(offX, offY).setScale(scala).setDepth(1);

      const femmina = typeof stato !== 'undefined' && stato.genere === 'F';
      layer.add(this.add.image(0, 0, femmina ? 'ui-card-f' : 'ui-card-m').setOrigin(0, 0));

      const nome = femmina ? 'Rossa' : 'Rosso';
      const testoStile = { fontFamily: 'Arial', fontSize: '14px', color: '#484848', fontStyle: 'bold' };

      const riga = (etichetta, valore, y) => {
        const et = this.add.text(34, y, etichetta, testoStile).setOrigin(0, 0.5);
        const val = this.add.text(302, y, valore, testoStile).setOrigin(1, 0.5);
        layer.add(et); layer.add(val);
      };
      riga('Nome', nome, 70);
      riga('Denaro', `₽ ${(stato.soldi || 0).toLocaleString('it-IT')}`, 118);
      riga('Passi', String(stato.passi || 0), 166);
      riga('Giorno', String((stato.tempo && stato.tempo.giorno) || 1), 214);

      // Medaglie: 8 caselle (72 + i*48, y=310), icona reale solo per quelle
      // ottenute — stessa griglia di icon_badges.png (32×32 per medaglia).
      const medaglie = stato.medaglie || [];
      PALESTRE.forEach((pal, i) => {
        if (!medaglie.includes(pal.id)) return;
        const x = 72 + i * 48;
        const icona = this.add.image(x, 310, 'ui-card-badges').setOrigin(0, 0)
          .setCrop(i * 32, 0, 32, 32);
        layer.add(icona);
      });
      const contMedaglie = this.add.text(302, 262, `${medaglie.length}/8 medaglie`, testoStile).setOrigin(1, 0.5);
      layer.add(contMedaglie);

      this.add.text(CW / 2, CH * 0.95, 'B torna al menu  ·  → Riepilogo', {
        fontFamily: 'Arial', fontSize: '13px', color: '#ccc',
      }).setOrigin(0.5).setDepth(2);

      const tornaAlMenu = () => { this.scene.stop(); this.scene.launch('PauseMenuScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAlMenu);
      this.input.keyboard.on('keydown-B', tornaAlMenu);
      // Seconda pagina (sess. 5 set): il Riepilogo (passi/medaglie/MN/stato
      // dei team — non esiste nell'originale) non è più una voce a sé del
      // menu Start, è diventato "l'altra pagina" della Scheda Allenatore,
      // come lo sono davvero le pagine di dettaglio nei giochi veri.
      const vaiAlRiepilogo = () => { this.scene.stop(); this.scene.launch('RecapScene'); };
      this.input.keyboard.on('keydown-RIGHT', vaiAlRiepilogo);
    }
  }

  /* ══════════════════════════════════════════════════════════
     POKÉDEX — nuova (sess. 5 set 2026, richiesta esplicita di Luca):
     mancava del tutto come SISTEMA, non solo come voce di menu (in
     Essentials reale vedi 0294_UI_Pokedex_Menu.rb). Limite ID 1-386 già
     deciso in CLAUDE.md. Lista con paginazione (386 voci non ci stanno
     tutte a schermo): specie mai viste mostrano "??????" e restano non
     apribili, esattamente come nei giochi veri. "Vista"/"catturata" si
     segnano da sole (segnaPokedex in app.js, chiamata da creaIstanza/
     cattura/evoluzione in battle.js) — nessuna chiamata PokéAPI in più
     solo per compilare questa lista.
     ══════════════════════════════════════════════════════════ */

  const POKEDEX_ID_MAX = 386;
  const POKEDEX_RIGHE_PAGINA = 14;

  class PokedexScene extends Phaser.Scene {
    constructor() { super({ key: 'PokedexScene' }); }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0c1840, 1).setDepth(0);
      this.add.text(CW / 2, 26, 'POKÉDEX', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '18px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);

      const visti = Object.values(stato.pokedex || {}).filter(v => v.visto).length;
      const catturati = Object.values(stato.pokedex || {}).filter(v => v.catturato).length;
      this.add.text(CW / 2, 56, `Visti: ${visti}/${POKEDEX_ID_MAX}   ·   Catturati: ${catturati}/${POKEDEX_ID_MAX}`, {
        fontFamily: 'Arial', fontSize: '14px', color: '#f0f4ff',
      }).setOrigin(0.5).setDepth(2);

      this.add.text(CW / 2, CH - 16, '↑↓ scegli · ←→ pagina · A apre · B torna al menu', {
        fontFamily: 'Arial', fontSize: '12px', color: '#888',
      }).setOrigin(0.5).setDepth(2);

      this._pagina = 0;
      this._cursore = 0;
      this._numPagine = Math.ceil(POKEDEX_ID_MAX / POKEDEX_RIGHE_PAGINA);
      this._righeTxt = [];
      const yIniziale = 84;
      for (let i = 0; i < POKEDEX_RIGHE_PAGINA; i++) {
        const txt = this.add.text(CW / 2 - 220, yIniziale + i * 28, '', {
          fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#f0f4ff',
        }).setOrigin(0, 0.5).setDepth(2);
        this._righeTxt.push(txt);
      }
      this._paginaTxt = this.add.text(CW / 2, CH - 44, '', {
        fontFamily: 'Arial', fontSize: '13px', color: '#ccc',
      }).setOrigin(0.5).setDepth(2);

      this._disegnaPagina();

      this.input.keyboard.on('keydown-UP', () => this._muoviCursore(-1));
      this.input.keyboard.on('keydown-DOWN', () => this._muoviCursore(1));
      this.input.keyboard.on('keydown-LEFT', () => this._cambiaPagina(-1));
      this.input.keyboard.on('keydown-RIGHT', () => this._cambiaPagina(1));
      this.input.keyboard.on('keydown-ENTER', () => this._apri());
      this.input.keyboard.on('keydown-SPACE', () => this._apri());
      const tornaAlMenu = () => { this.scene.stop(); this.scene.launch('PauseMenuScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAlMenu);
      this.input.keyboard.on('keydown-B', tornaAlMenu);
    }

    _idPerRiga(i) { return this._pagina * POKEDEX_RIGHE_PAGINA + i + 1; }

    _disegnaPagina() {
      for (let i = 0; i < POKEDEX_RIGHE_PAGINA; i++) {
        const id = this._idPerRiga(i);
        const txt = this._righeTxt[i];
        if (id > POKEDEX_ID_MAX) { txt.setText(''); continue; }
        const voce = stato.pokedex && stato.pokedex[id];
        const marcatore = voce && voce.catturato ? '●' : (voce && voce.visto ? '○' : ' ');
        const nome = voce && voce.visto ? voce.nome : '??????';
        const numero = String(id).padStart(3, '0');
        txt.setText(`${marcatore} Nº${numero} ${nome}`);
        txt.setColor(i === this._cursore ? '#ffcb05' : '#f0f4ff');
      }
      this._paginaTxt.setText(`Pagina ${this._pagina + 1}/${this._numPagine}`);
    }

    _muoviCursore(delta) {
      const nuovo = this._cursore + delta;
      const idNuovo = this._idPerRiga(nuovo);
      if (nuovo < 0) { this._cambiaPagina(-1, POKEDEX_RIGHE_PAGINA - 1); return; }
      if (nuovo >= POKEDEX_RIGHE_PAGINA || idNuovo > POKEDEX_ID_MAX) { this._cambiaPagina(1, 0); return; }
      this._cursore = nuovo;
      this._disegnaPagina();
    }

    _cambiaPagina(delta, cursoreFisso) {
      const nuovaPagina = this._pagina + delta;
      if (nuovaPagina < 0 || nuovaPagina >= this._numPagine) return;
      this._pagina = nuovaPagina;
      this._cursore = cursoreFisso !== undefined ? cursoreFisso : 0;
      this._disegnaPagina();
    }

    _apri() {
      const id = this._idPerRiga(this._cursore);
      const voce = stato.pokedex && stato.pokedex[id];
      if (!voce || !voce.visto) return; // "??????": non c'è niente da aprire
      this.scene.stop();
      this.scene.launch('PokedexDetailScene', { id, tornaA: { pagina: this._pagina, cursore: this._cursore } });
    }
  }

  class PokedexDetailScene extends Phaser.Scene {
    constructor() { super({ key: 'PokedexDetailScene' }); }

    init(dati) { this._id = dati.id; this._tornaA = dati.tornaA; }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0c1840, 1).setDepth(0);
      const voce = stato.pokedex[this._id] || {};

      this.add.text(CW / 2, 26, `Nº${String(this._id).padStart(3, '0')}  ${voce.nome || '??????'}`, {
        fontFamily: "'Press Start 2P', monospace", fontSize: '16px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);

      this._corpoTxt = this.add.text(CW / 2, CH / 2 + 40, 'Caricamento...', {
        fontFamily: 'Arial', fontSize: '14px', color: '#f0f4ff', align: 'center',
        wordWrap: { width: Math.min(CW - 80, 480) },
      }).setOrigin(0.5, 0).setDepth(2);

      this.add.text(CW / 2, CH - 16, 'B torna alla lista', {
        fontFamily: 'Arial', fontSize: '12px', color: '#888',
      }).setOrigin(0.5).setDepth(2);

      // Sprite: URL già noto (salvato da segnaPokedex), caricato al volo con
      // una chiave dedicata — non fa parte del preload perché non sappiamo
      // in anticipo quale specie si aprirà.
      if (voce.spriteFronte) {
        const chiave = 'pokedex-sprite-' + this._id;
        if (this.textures.exists(chiave)) {
          this._mostraSprite(chiave, CW, CH);
        } else {
          this.load.image(chiave, voce.spriteFronte);
          this.load.once('complete', () => this._mostraSprite(chiave, CW, CH));
          this.load.start();
        }
      }

      PokeAPI.getPokedexEntry(this._id).then(entry => {
        const righe = [];
        if (entry.categoria) righe.push(entry.categoria);
        if (entry.altezza) righe.push(`Altezza: ${entry.altezza.toFixed(1)} m`);
        if (entry.peso) righe.push(`Peso: ${entry.peso.toFixed(1)} kg`);
        if (entry.descrizione) righe.push('', entry.descrizione);
        this._corpoTxt.setText(righe.join('\n'));
      }).catch(err => {
        this._corpoTxt.setText('Dati non disponibili (connessione assente).');
        console.warn('[Pokédex] Errore scheda:', err.message);
      });

      const tornaAllaLista = () => {
        this.scene.stop();
        this.scene.launch('PokedexScene');
      };
      this.input.keyboard.on('keydown-ESC', tornaAllaLista);
      this.input.keyboard.on('keydown-B', tornaAllaLista);
    }

    _mostraSprite(chiave, CW, CH) {
      this.add.image(CW / 2, CH / 2 - 40, chiave).setScale(2).setDepth(2)
        .setOrigin(0.5).setTexture(chiave);
    }
  }

  /* ══════════════════════════════════════════════════════════
     OPZIONI — nuova (sess. 5 set 2026): controlla solo cose che hanno
     un effetto vero nel gioco (niente volume: il progetto non ha ancora
     un sistema audio, aggiungerne uno finto sarebbe un controllo senza
     effetto — segnalato a Luca, resta un lavoro futuro a sé).
     ══════════════════════════════════════════════════════════ */

  const OPZIONI_VELOCITA_TESTO = ['lenta', 'normale', 'veloce'];
  const OPZIONI_VELOCITA_LABEL = { lenta: 'Lenta', normale: 'Normale', veloce: 'Veloce' };

  class OpzioniScene extends Phaser.Scene {
    constructor() { super({ key: 'OpzioniScene' }); }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0c1840, 1).setDepth(0);
      this.add.text(CW / 2, 26, 'OPZIONI', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '18px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);

      this._voci = [
        { chiave: 'velocitaTesto', etichetta: 'Velocità testo' },
        { chiave: 'animazioniBattaglia', etichetta: 'Animazioni battaglia' },
      ];
      this._cursore = 0;
      const y0 = CH * 0.35;
      this._righe = this._voci.map((v, i) => {
        const y = y0 + i * 44;
        const cursoreTxt = this.add.text(CW / 2 - 200, y, '▶', {
          fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#ffcb05',
        }).setOrigin(0, 0.5).setDepth(2).setVisible(i === 0);
        const etichettaTxt = this.add.text(CW / 2 - 170, y, v.etichetta, {
          fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#f0f4ff',
        }).setOrigin(0, 0.5).setDepth(2);
        const valoreTxt = this.add.text(CW / 2 + 170, y, '', {
          fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#ffcb05',
        }).setOrigin(1, 0.5).setDepth(2);
        return { cursoreTxt, etichettaTxt, valoreTxt };
      });
      this._aggiornaValori();

      this.add.text(CW / 2, CH - 16, '↑↓ scegli · ←→ cambia · B torna al menu', {
        fontFamily: 'Arial', fontSize: '12px', color: '#888',
      }).setOrigin(0.5).setDepth(2);

      this.input.keyboard.on('keydown-UP', () => this._muoviCursore(-1));
      this.input.keyboard.on('keydown-DOWN', () => this._muoviCursore(1));
      this.input.keyboard.on('keydown-LEFT', () => this._cambiaValore(-1));
      this.input.keyboard.on('keydown-RIGHT', () => this._cambiaValore(1));
      const tornaAlMenu = () => { this.scene.stop(); this.scene.launch('PauseMenuScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAlMenu);
      this.input.keyboard.on('keydown-B', tornaAlMenu);
    }

    _aggiornaValori() {
      this._righe.forEach((r, i) => {
        const chiave = this._voci[i].chiave;
        let testo;
        if (chiave === 'velocitaTesto') testo = OPZIONI_VELOCITA_LABEL[stato.opzioni.velocitaTesto];
        else testo = stato.opzioni[chiave] ? 'Sì' : 'No';
        r.valoreTxt.setText(testo);
      });
    }

    _muoviCursore(delta) {
      this._righe[this._cursore].cursoreTxt.setVisible(false);
      this._cursore = (this._cursore + delta + this._voci.length) % this._voci.length;
      this._righe[this._cursore].cursoreTxt.setVisible(true);
    }

    _cambiaValore(delta) {
      const chiave = this._voci[this._cursore].chiave;
      if (chiave === 'velocitaTesto') {
        const idx = OPZIONI_VELOCITA_TESTO.indexOf(stato.opzioni.velocitaTesto);
        const nuovo = (idx + delta + OPZIONI_VELOCITA_TESTO.length) % OPZIONI_VELOCITA_TESTO.length;
        stato.opzioni.velocitaTesto = OPZIONI_VELOCITA_TESTO[nuovo];
      } else {
        stato.opzioni[chiave] = !stato.opzioni[chiave];
      }
      if (typeof salvaPartita === 'function') salvaPartita();
      this._aggiornaValori();
    }
  }

  /* ══════════════════════════════════════════════════════════
     SQUADRA — prima sotto-schermata nativa (le altre seguono una
     alla volta). Griglia dei 6 Pokémon: sprite, nome, livello,
     barra HP — stessi dati di app.js:renderSquadra, ridisegnati in
     Canvas invece che in HTML/CSS. Il dettaglio di un singolo
     Pokémon (mosse/oggetti/evoluzione) NON è ancora migrato: resta
     il prossimo passo concordato con Luca, non è una funzione rotta,
     semplicemente questa prima versione mostra solo la rosa.
     ══════════════════════════════════════════════════════════ */

  // Risoluzione virtuale = quella degli asset UI originali di Essentials
  // (Graphics/UI/Party/bg.png è 512×384): si disegna tutto in queste
  // coordinate fisse dentro un Container, poi il Container viene scalato per
  // riempire lo schermo reale (letterbox, mai stirato) — così le coordinate
  // lette dagli script Ruby di Essentials (UI_Party.rb) si applicano 1:1.
  const UI_PARTY_W = 512, UI_PARTY_H = 384;

  // Chiave texture Phaser per lo sprite/icona di un Pokémon: basata
  // sull'URL (identità della specie), MAI sulla posizione in squadra —
  // altrimenti dopo uno scambio (Ordina/trascinamento) l'icona resta quella
  // vecchia dello slot mentre nome/HP si aggiornano (bug segnalato da Luca:
  // "quando faccio ordina non si invertono gli sprite, si scambiano nome e
  // tutto ma gli sprite no").
  function chiaveIconaSprite(url) { return url ? `party-icon-src:${url}` : null; }

  class PartyScene extends Phaser.Scene {
    constructor() { super({ key: 'PartyScene' }); }

    _squadraAttuale() {
      return (typeof stato !== 'undefined' && Array.isArray(stato.squadra)) ? stato.squadra : [];
    }

    preload() {
      const base = 'sprites/ui/party/';
      const carica = (key, file) => { if (!this.textures.exists(key)) this.load.image(key, base + file); };
      carica('ui-party-bg', 'bg.png');
      ['round', 'rect'].forEach(forma => {
        carica(`ui-party-panel-${forma}`, `panel_${forma}.png`);
        carica(`ui-party-panel-${forma}_sel`, `panel_${forma}_sel.png`);
        carica(`ui-party-panel-${forma}_faint`, `panel_${forma}_faint.png`);
        carica(`ui-party-panel-${forma}_faint_sel`, `panel_${forma}_faint_sel.png`);
        carica(`ui-party-panel-${forma}_swap`, `panel_${forma}_swap.png`);
        carica(`ui-party-panel-${forma}_swap_sel`, `panel_${forma}_swap_sel.png`);
        carica(`ui-party-panel-${forma}_swap_sel2`, `panel_${forma}_swap_sel2.png`);
      });
      carica('ui-party-panel-blank', 'panel_blank.png');
      carica('ui-party-ball', 'icon_ball.png');
      carica('ui-party-ball-sel', 'icon_ball_sel.png');
      carica('ui-party-hpback', 'overlay_hp_back.png');
      carica('ui-party-hpback-faint', 'overlay_hp_back_faint.png');
      carica('ui-party-hpback-swap', 'overlay_hp_back_swap.png');
      carica('ui-party-hpbar', 'overlay_hp.png');
      carica('ui-party-lv', 'overlay_lv.png');
      carica('ui-party-cancel', 'icon_cancel.png');
      carica('ui-party-cancel-sel', 'icon_cancel_sel.png');
      carica('ui-party-item', 'icon_item.png');
      carica('ui-statuses', 'sprites/ui/statuses.png');
      if (!this.textures.exists('ui-statuses')) this.load.image('ui-statuses', 'sprites/ui/statuses.png');
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const scala = Math.min(CW / UI_PARTY_W, CH / UI_PARTY_H);
      const offX = (CW - UI_PARTY_W * scala) / 2, offY = (CH - UI_PARTY_H * scala) / 2;
      this._scala = scala; this._offX = offX; this._offY = offY;
      // Converte coordinate schermo (pointer) in coordinate virtuali locali
      // al Container (usato per l'hit-test del trascinamento).
      this._puntoVirtuale = (px, py) => ({ x: (px - offX) / scala, y: (py - offY) / scala });
      // Converte coordinate virtuali in coordinate schermo (usato per
      // posizionare il menu a tendina, che resta fuori dal Container per
      // restare leggibile a qualunque fattore di scala).
      this._puntoSchermo = (vx, vy) => ({ x: offX + vx * scala, y: offY + vy * scala });

      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x000000, 1).setDepth(0);
      this._layer = this.add.container(offX, offY).setScale(scala).setDepth(1);
      this._layer.add(this.add.image(0, 0, 'ui-party-bg').setOrigin(0, 0));

      // Sfondo cliccabile a schermo intero (fuori dal Container, per
      // intercettare i click ovunque): chiude il menu a tendina se aperto.
      const fondoClic = this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x000000, 0).setDepth(0.5).setInteractive();
      fondoClic.on('pointerdown', () => { if (this._menuBox) this._chiudiMenuCarta(); });

      // Niente titolo "SQUADRA" sovrapposto: lo sfondo reale di Essentials
      // (bg.png) copre già tutto lo schermo fin dall'alto, un titolo qui
      // finirebbe sopra il pannello del primo Pokémon (slot 0 parte da y=0).
      this.add.text(CW / 2, CH * 0.97, '↑↓←→ scegli · A apre il menu · B torna al menu', {
        fontFamily: 'Arial', fontSize: '12px', color: '#888',
      }).setOrigin(0.5).setDepth(30);

      // Stato di riordino (richiesta di Luca, sessione successiva): _cursore
      // per la navigazione a tastiera, _modoOrdina = idx del Pokémon "preso in
      // mano" in attesa di scambio (stesso schema "prendi/posa" già usato per
      // il Box), _menuBox/_menuIdx per il menu a tendina Info/Ordina aperto su
      // una card, _celle per l'hit-test del trascinamento col mouse.
      const squadraIniziale = this._squadraAttuale();
      this._cursore = squadraIniziale.findIndex(p => p);
      if (this._cursore < 0) this._cursore = 0;
      this._modoOrdina = null;
      this._menuBox = null;
      this._menuIdx = null;
      this._celle = [];
      this._cardObjs = [];
      this._dragOrigine = null;
      this._dragHover = null;
      this._justDragged = false;

      if (squadraIniziale.length === 0) {
        this.add.text(CW / 2, CH / 2, 'Non hai ancora nessun Pokémon.', {
          fontFamily: 'Arial', fontSize: '16px', color: '#ccc',
        }).setOrigin(0.5).setDepth(30);
      } else {
        // Icone piccole dedicate (sprites/pokemon_icons/, stessa cartella e
        // stessa chiave `pkm-icon-<NOME>` già usate dal Box — non lo sprite
        // grande di battaglia: prima veniva usato `pkm.sprite.fronte`
        // rimpicciolito a forza a 56×56, richiesta di Luca di usare invece
        // una vera icona come nel Box, 3 settembre 2026).
        let daCaricare = 0;
        squadraIniziale.forEach((pkm) => {
          if (!pkm) return;
          const chiave = chiaveIconaPokemon(pkm.nome);
          const key = `pkm-icon-${chiave}`;
          if (!this.textures.exists(key)) {
            this.load.image(key, `sprites/pokemon_icons/${chiave}.png`);
            daCaricare++;
          }
        });
        if (daCaricare > 0) {
          this.load.once('complete', () => this._disegnaGriglia(this._squadraAttuale()));
          this.load.start();
        } else {
          this._disegnaGriglia(squadraIniziale);
        }
      }

      // Navigazione a croce direzionale (griglia 2 colonne). Se il menu a
      // tendina Info/Ordina è aperto, ↑/↓ muovono invece il suo cursore
      // interno (2 voci) — un cursore vero anche lì, non solo il mouse.
      const COLS = 2;
      const muoviCursore = (dRow, dCol) => {
        if (this._menuBox) {
          if (dRow !== 0 && this._menuVoci) {
            this._menuCursore = (this._menuCursore + dRow + this._menuVoci.length) % this._menuVoci.length;
            this._aggiornaMenuCarta();
          }
          return;
        }
        const squadraOra = this._squadraAttuale();
        const validi = [];
        squadraOra.forEach((p, i) => { if (p) validi.push(i); });
        if (validi.length === 0) return;
        const col = Phaser.Math.Clamp((this._cursore % COLS) + dCol, 0, COLS - 1);
        const rigaBersaglio = Math.floor(this._cursore / COLS) + dRow;
        const target = rigaBersaglio * COLS + col;
        // Se la casella di destinazione è vuota (squadra dispari), scegli la
        // carta valida più vicina invece di restare bloccati.
        let nuovo = validi.includes(target) ? target : validi.reduce(
          (migliore, i) => Math.abs(i - target) < Math.abs(migliore - target) ? i : migliore, validi[0]
        );
        this._cursore = nuovo;
        this._disegnaGriglia(squadraOra);
      };
      this.input.keyboard.on('keydown-UP',    () => muoviCursore(-1, 0));
      this.input.keyboard.on('keydown-DOWN',  () => muoviCursore(1, 0));
      this.input.keyboard.on('keydown-LEFT',  () => muoviCursore(0, -1));
      this.input.keyboard.on('keydown-RIGHT', () => muoviCursore(0, 1));

      const confermaA = () => {
        if (this._menuBox) {
          const v = this._menuVoci && this._menuVoci[this._menuCursore];
          if (v) v.onClick();
          return;
        }
        this._alSelezionaCarta(this._cursore);
      };
      this.input.keyboard.on('keydown-ENTER', confermaA);
      this.input.keyboard.on('keydown-SPACE', confermaA);

      // Eventi diretti (non polling in update, vedi PauseMenuScene): B/Esc
      // chiude il menu a tendina, poi annulla l'ordinamento in corso, poi
      // (solo se nessuno dei due era attivo) torna alla lista del menu.
      const tornaAlMenu = () => {
        if (this._menuBox) { this._chiudiMenuCarta(); return; }
        if (this._modoOrdina !== null) {
          this._modoOrdina = null;
          this._disegnaGriglia(this._squadraAttuale());
          if (typeof mostraToast === 'function') mostraToast('Ordinamento annullato.', 2000);
          return;
        }
        this.scene.stop();
        this.scene.launch('PauseMenuScene');
      };
      this.input.keyboard.on('keydown-ESC', tornaAlMenu);
      this.input.keyboard.on('keydown-B', tornaAlMenu);

      // Bottone "CANCEL" reale di Essentials (icon_cancel), stessa posizione
      // dello script originale (398,328) — via alternativa al tasto B.
      const cancelBtn = this.add.image(398, 328, 'ui-party-cancel').setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      cancelBtn.on('pointerover', () => cancelBtn.setTexture('ui-party-cancel-sel'));
      cancelBtn.on('pointerout',  () => cancelBtn.setTexture('ui-party-cancel'));
      cancelBtn.on('pointerdown', () => tornaAlMenu());
      this._layer.add(cancelBtn);
    }

    // Un Pokémon è stato "selezionato" (click sulla card, o A da tastiera):
    // se si è in modalità Ordina, questa selezione è il bersaglio dello
    // scambio (o l'annullamento, se si riseleziona lo stesso); altrimenti
    // apre il menu a tendina Info/Ordina.
    _alSelezionaCarta(idx) {
      if (this._modoOrdina !== null) {
        if (idx === this._modoOrdina) {
          this._modoOrdina = null;
          this._disegnaGriglia(this._squadraAttuale());
          if (typeof mostraToast === 'function') mostraToast('Ordinamento annullato.', 2000);
        } else {
          this._scambia(this._modoOrdina, idx);
        }
        return;
      }
      this._mostraMenuCarta(idx);
    }

    // Scambia due posizioni in squadra (usato sia dal flusso Ordina/A, sia
    // dal trascinamento col mouse) — stessa idea "prendi/posa" già usata nel
    // Box, applicata alla sola squadra.
    _scambia(i, j) {
      const squadraOra = this._squadraAttuale();
      const a = squadraOra[i], b = squadraOra[j];
      if (!a || !b) return;
      squadraOra[i] = b;
      squadraOra[j] = a;
      if (typeof salvaPartita === 'function') salvaPartita();
      this._modoOrdina = null;
      this._cursore = j;
      this._disegnaGriglia(squadraOra);
      if (typeof mostraToast === 'function') {
        mostraToast(`🔄 Scambiati ${a.nome} e ${b.nome}.`, 2200);
      }
    }

    // Menu a tendina Info/Ordina, ancorato accanto alla card scelta (clamp
    // dentro lo schermo). Chiuso da _chiudiMenuCarta() (click fuori, B, o
    // selezione di una voce).
    _mostraMenuCarta(idx) {
      this._chiudiMenuCarta();
      const cella = this._celle.find(c => c.idx === idx);
      if (!cella) return;
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      // Il menu resta fuori dal Container scalato (testo sempre leggibile):
      // la posizione della card (coordinate virtuali, angolo in alto a
      // sinistra + dimensioni) va convertita in coordinate schermo.
      const bordoDestro = this._puntoSchermo(cella.x + cella.cellW, cella.y + cella.cellH / 2);
      const bordoSinistro = this._puntoSchermo(cella.x, cella.y + cella.cellH / 2);
      const w = 150, h = 90;
      let x = bordoDestro.x + 6 + w / 2;
      if (x + w / 2 > CW - 8) x = bordoSinistro.x - 6 - w / 2;
      const y = Phaser.Math.Clamp(bordoDestro.y, h / 2 + 8, CH - h / 2 - 8);

      const box = [];
      const bg = this.add.rectangle(x, y, w, h, 0x0d1220, 0.98)
        .setStrokeStyle(2, 0xffcb05).setDepth(20).setInteractive();
      box.push(bg);

      const attivaInfo = () => {
        this._chiudiMenuCarta();
        this.scene.stop();
        this.scene.launch('PartyDetailScene', { idx });
      };
      const infoBtn = this.add.text(x, y - h / 4, 'ℹ️ Info', {
        fontFamily: 'Arial', fontSize: '15px', color: '#fff',
      }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
      infoBtn.on('pointerover', () => { this._menuCursore = 0; this._aggiornaMenuCarta(); });
      infoBtn.on('pointerdown', attivaInfo);
      box.push(infoBtn);

      const separatore = this.add.rectangle(x, y, w - 20, 1, 0x3a3a4a).setDepth(21);
      box.push(separatore);

      const attivaOrdina = () => {
        this._chiudiMenuCarta();
        this._modoOrdina = idx;
        this._cursore = idx;
        this._disegnaGriglia(this._squadraAttuale());
        if (typeof mostraToast === 'function') {
          mostraToast('🔀 Scegli un altro Pokémon (freccette + A, o clicca) per scambiarlo di posto. B per annullare.', 5000);
        }
      };
      const ordinaBtn = this.add.text(x, y + h / 4, '🔀 Ordina', {
        fontFamily: 'Arial', fontSize: '15px', color: '#fff',
      }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
      ordinaBtn.on('pointerover', () => { this._menuCursore = 1; this._aggiornaMenuCarta(); });
      ordinaBtn.on('pointerdown', attivaOrdina);
      box.push(ordinaBtn);

      this._menuBox = box;
      this._menuIdx = idx;
      // Voci navigabili con ↑↓ + A/Invio (vedi keydown-UP/DOWN/ENTER/SPACE in
      // create()) — un cursore vero anche sul menu a tendina, non solo il
      // click del mouse, richiesta esplicita di Luca.
      this._menuVoci = [
        { btn: infoBtn, onClick: attivaInfo },
        { btn: ordinaBtn, onClick: attivaOrdina },
      ];
      this._menuCursore = 0;
      this._aggiornaMenuCarta();
    }

    _aggiornaMenuCarta() {
      if (!this._menuVoci) return;
      this._menuVoci.forEach((v, i) => {
        v.btn.setColor(i === this._menuCursore ? '#ffcb05' : '#fff');
      });
    }

    _chiudiMenuCarta() {
      if (this._menuBox) { this._menuBox.forEach(o => o.destroy()); this._menuBox = null; this._menuIdx = null; this._menuVoci = null; }
    }

    // Card sotto un punto dato (in coordinate di schermo/pointer) — usato per
    // il trascinamento col mouse: converte in coordinate virtuali (il
    // Container è scalato) prima di confrontare coi rettangoli dei pannelli.
    _cartaSotto(px, py) {
      const { x, y } = this._puntoVirtuale(px, py);
      for (const c of this._celle) {
        if (x >= c.x && x <= c.x + c.cellW && y >= c.y && y <= c.y + c.cellH) return c.idx;
      }
      return null;
    }

    // Stato visivo del pannello (quale variante PNG usare), stessa logica
    // esatta di refresh_panel_graphic in UI_Party.rb (Essentials): selected/
    // preselected/switching/fainted → able/ablesel/fainted(sel)/swap(sel/sel2).
    // "Ordina" = preselected+switching di Essentials; il trascinamento usa lo
    // stesso schema (origine=preselected, card sotto il mouse=selected).
    _statoPannello(idx) {
      const pkm = this._squadraAttuale()[idx];
      const svenuto = !!(pkm && !pkm.uovo && pkm.hpAttuale <= 0);
      const inTrascinamento = this._dragOrigine !== null;
      const preselezionato = idx === this._modoOrdina || idx === this._dragOrigine;
      const inScambio = this._modoOrdina !== null || inTrascinamento;
      const selezionato = inTrascinamento ? (idx === this._dragHover) : (idx === this._cursore);
      if (selezionato) {
        if (preselezionato) return '_swap_sel2';
        if (inScambio) return '_swap_sel';
        if (svenuto) return '_faint_sel';
        return '_sel';
      }
      if (preselezionato) return '_swap';
      if (svenuto) return '_faint';
      return '';
    }

    // Ricolora (ricambia texture) i pannelli senza ridisegnare tutto —
    // chiamata ad ogni frame di trascinamento, una redraw completa sarebbe
    // troppo pesante.
    _aggiornaBordiDrag() {
      for (const c of this._celle) {
        const forma = c.idx === 0 ? 'round' : 'rect';
        c.sfondo.setTexture(`ui-party-panel-${forma}${this._statoPannello(c.idx)}`);
      }
    }

    _disegnaGriglia(squadra) {
      // Ripulisce la griglia precedente (ogni redraw ridisegna tutto da zero:
      // pochi oggetti, costo trascurabile, evita di tenere sincronizzati testi/
      // barre sparsi in caso contrario).
      this._cardObjs.forEach(o => o.destroy());
      this._cardObjs = [];
      this._celle = [];

      // Layout identico allo script Ruby originale (UI_Party.rb):
      // x = (idx%2)*larghezzaSchermo/2, y = 16*(idx%2) + 96*(idx/2).
      // Pannello 256×98; solo lo slot 0 (Pokémon in testa) usa la variante
      // "round" (più grande visivamente), gli altri 5 usano "rect".
      const cellW = 256, cellH = 98;
      for (let idx = 0; idx < 6; idx++) {
        const pkm = squadra[idx];
        const x = (idx % 2) * (UI_PARTY_W / 2);
        const y = 16 * (idx % 2) + 96 * Math.floor(idx / 2);
        this._celle.push({ idx, x, y, cellW, cellH });

        if (!pkm) {
          const vuoto = this.add.image(x, y, 'ui-party-panel-blank').setOrigin(0, 0);
          this._layer.add(vuoto);
          this._cardObjs.push(vuoto);
          continue;
        }

        const forma = idx === 0 ? 'round' : 'rect';
        const sfondo = this.add.image(x, y, `ui-party-panel-${forma}${this._statoPannello(idx)}`)
          .setOrigin(0, 0).setInteractive({ useHandCursor: true, draggable: true });
        this._layer.add(sfondo);
        this._cardObjs.push(sfondo);
        this._celle[this._celle.length - 1].sfondo = sfondo;

        let downX = 0, downY = 0;
        sfondo.on('pointerdown', (pointer) => {
          downX = pointer.x; downY = pointer.y;
          if (this._menuBox && this._menuIdx !== idx) this._chiudiMenuCarta();
        });
        sfondo.on('pointerup', (pointer) => {
          if (this._justDragged) { this._justDragged = false; return; }
          const dist = Phaser.Math.Distance.Between(downX, downY, pointer.x, pointer.y);
          if (dist > 6) return; // era un trascinamento non riconosciuto come tale: ignora
          this._cursore = idx;
          this._alSelezionaCarta(idx);
        });
        sfondo.on('dragstart', () => {
          this._chiudiMenuCarta();
          this._dragOrigine = idx;
          this._dragHover = null;
          this._aggiornaBordiDrag();
        });
        sfondo.on('drag', (pointer) => {
          const sotto = this._cartaSotto(pointer.x, pointer.y);
          const bersaglio = (sotto !== null && sotto !== this._dragOrigine) ? sotto : null;
          if (bersaglio !== this._dragHover) {
            this._dragHover = bersaglio;
            this._aggiornaBordiDrag();
          }
        });
        sfondo.on('dragend', () => {
          const origine = this._dragOrigine, bersaglio = this._dragHover;
          this._dragOrigine = null;
          this._dragHover = null;
          this._justDragged = true;
          if (bersaglio !== null && bersaglio !== origine) {
            this._scambia(origine, bersaglio);
          } else {
            this._disegnaGriglia(this._squadraAttuale());
          }
        });

        // Icona Pallina (icon_ball), evidenziata quando la card è selezionata.
        const ball = this.add.image(x + 10, y, `ui-party-ball${idx === this._cursore ? '-sel' : ''}`).setOrigin(0, 0);
        this._layer.add(ball); this._cardObjs.push(ball);

        // Icona del Pokémon (chiave per NOME specie, stessa di BoxScene — non
        // per slot: uno scambio tra due carte mostra subito le icone giuste).
        const key = `pkm-icon-${chiaveIconaPokemon(pkm.nome)}`;
        if (this.textures.exists(key)) {
          const icona = this.add.image(x + 60, y + 40, key).setDisplaySize(56, 56).setOrigin(0.5);
          this._layer.add(icona); this._cardObjs.push(icona);
        }

        // Oggetto tenuto (badge piccolo, come icon_item originale).
        if (pkm.oggetto) {
          const badge = this.add.image(x + 62, y + 48, 'ui-party-item').setOrigin(0, 0);
          this._layer.add(badge); this._cardObjs.push(badge);
        }

        if (idx === this._modoOrdina) {
          const badgeA = this.add.text(x + cellW - 18, y + 6, 'A', {
            fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#ffcb05',
            stroke: '#000', strokeThickness: 3,
          }).setOrigin(0.5);
          this._layer.add(badgeA); this._cardObjs.push(badgeA);
        }

        if (pkm.uovo) {
          const nomeTxt = this.add.text(x + 96, y + 22, 'Uovo misterioso', {
            fontFamily: 'Arial', fontSize: '14px', color: '#f8f8f8', fontStyle: 'bold',
          }).setOrigin(0, 0.5);
          const passiTxt = this.add.text(x + 96, y + 62, `🥚 ${pkm.passiRimanenti} passi alla schiusa`, {
            fontFamily: 'Arial', fontSize: '11px', color: '#ccc',
          }).setOrigin(0, 0.5);
          this._layer.add(nomeTxt); this._layer.add(passiTxt);
          this._cardObjs.push(nomeTxt, passiTxt);
          continue;
        }

        // Nome + genere (posizioni identiche a UI_Party.rb: draw_name/draw_gender).
        const nomeTxt = this.add.text(x + 96, y + 22, pkm.nome, {
          fontFamily: 'Arial', fontSize: '14px', color: '#f8f8f8', fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        this._layer.add(nomeTxt); this._cardObjs.push(nomeTxt);
        if (pkm.genere === 'M' || pkm.genere === 'F') {
          const genTxt = this.add.text(x + 224, y + 22, pkm.genere === 'M' ? '♂' : '♀', {
            fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
            color: pkm.genere === 'M' ? '#0070f8' : '#e82010',
          }).setOrigin(0, 0.5);
          this._layer.add(genTxt); this._cardObjs.push(genTxt);
        }

        // Livello (icona "Lv" + numero).
        const lvIcona = this.add.image(x + 20, y + 70, 'ui-party-lv').setOrigin(0, 0);
        const lvTxt = this.add.text(x + 42, y + 68, String(pkm.livello), {
          fontFamily: 'Arial', fontSize: '11px', color: '#f8f8f8', fontStyle: 'bold',
        }).setOrigin(0, 0.5);
        this._layer.add(lvIcona); this._layer.add(lvTxt);
        this._cardObjs.push(lvIcona, lvTxt);

        // Sfondo barra HP + barra HP vera e propria (croppata in base alla
        // percentuale, come il blt(128,52,...) dello script originale).
        const statoHp = pkm.hpAttuale <= 0 ? '-faint' : (idx === this._modoOrdina || idx === this._dragOrigine ? '-swap' : '');
        const hpBack = this.add.image(x + 96, y + 50, `ui-party-hpback${statoHp}`).setOrigin(0, 0);
        this._layer.add(hpBack); this._cardObjs.push(hpBack);
        const hpPct = pkm.hpMax > 0 ? Phaser.Math.Clamp(pkm.hpAttuale / pkm.hpMax, 0, 1) : 0;
        let wBarra = Math.max(1, Math.round((hpPct * 96) / 2) * 2);
        const zonaHp = hpPct <= 0.25 ? 2 : (hpPct <= 0.5 ? 1 : 0);
        if (pkm.hpAttuale > 0) {
          const hpBar = this.add.image(x + 128, y + 52, 'ui-party-hpbar').setOrigin(0, 0)
            .setCrop(0, zonaHp * 8, wBarra, 8);
          this._layer.add(hpBar); this._cardObjs.push(hpBar);
        }

        // Testo HP numerico, allineato a destra come nell'originale.
        const hpTxt = this.add.text(x + 224, y + 66, `${pkm.hpAttuale}/${pkm.hpMax}`, {
          fontFamily: 'Arial', fontSize: '12px', color: '#f8f8f8', fontStyle: 'bold',
        }).setOrigin(1, 0.5);
        this._layer.add(hpTxt); this._cardObjs.push(hpTxt);

        if (pkm.hpAttuale <= 0) {
          const koTxt = this.add.text(x + 78, y + 68, 'KO', {
            fontFamily: 'Arial', fontSize: '11px', color: '#e53935', fontStyle: 'bold',
          }).setOrigin(0, 0.5);
          this._layer.add(koTxt); this._cardObjs.push(koTxt);
        } else if (pkm.condizione && pkm.condizione.tipo) {
          const SIGLE_STATO = { paralysis: 'PAR', sleep: 'SON', poison: 'VEL', burn: 'SCO', freeze: 'CON' };
          const sigla = SIGLE_STATO[pkm.condizione.tipo] || '';
          if (sigla) {
            const statoTxt = this.add.text(x + 78, y + 68, sigla, {
              fontFamily: 'Arial', fontSize: '10px', color: '#ffb300', fontStyle: 'bold',
            }).setOrigin(0, 0.5);
            this._layer.add(statoTxt); this._cardObjs.push(statoTxt);
          }
        }
      }
    }

  }

  /* ══════════════════════════════════════════════════════════
     SCHEDA DI UN SINGOLO POKÉMON (Sommario) — riscritta il 1 settembre
     2026 con le coordinate ESATTE di UI_Summary.rb (Scripts.rxdata):
     3 pagine reali (Info/Skills/Mosse, sfondi bg_1/bg_3/bg_4), cambio
     pagina con ←/→. Segnalato da Luca come "grafica sbagliata" quando
     era solo un elenco di testo sopra lo sfondo vero — ora il testo è
     posizionato esattamente dove lo sfondo se lo aspetta.
     NOTA: la "natura" non è tracciata nel modello dati di questo progetto —
     non mostrata, non un'omissione di questa riscrittura. L'abilità INVECE
     è stata aggiunta il 1 settembre 2026 (F9.4, vedi _abilitaInfo sotto e
     Battle.creaIstanza/evolviIstanza in battle.js). Idem l'OT/ID allenatore
     (mai tracciati): OT mostra lo
     stesso nome placeholder Rosso/Rossa già usato in TrainerCardScene,
     l'ID resta "?????" come fa l'originale quando l'informazione manca.
     ══════════════════════════════════════════════════════════ */

  const TIPO_ICON_POS = {
    normal: 0, fighting: 1, flying: 2, poison: 3, ground: 4, rock: 5,
    bug: 6, ghost: 7, steel: 8, fire: 10, water: 11, grass: 12,
    electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18,
  };
  const SIGLE_STATO_SOMMARIO = { paralysis: 'PAR', sleep: 'SON', poison: 'VEL', burn: 'SCO', freeze: 'CON' };

  class PartyDetailScene extends Phaser.Scene {
    constructor() { super({ key: 'PartyDetailScene' }); }

    // "fonte": {tipo:'squadra', idx} o {tipo:'box', box, slot} — stesso
    // formato di pkmDaFonte()/renderDettagli() in app.js (riusate qui sotto,
    // non riscritte). Retro-compatibile con le chiamate esistenti da
    // PartyScene che passano solo {idx}.
    init(data) {
      this._fonte = data.fonte || { tipo: 'squadra', idx: data.idx };
      this._pagina = data.pagina || 1;   // 1=Info, 3=Skills, 4=Mosse (numeri = quelli di bg_N.png)
    }

    preload() {
      const carica = (key, file) => { if (!this.textures.exists(key)) this.load.image(key, `sprites/ui/summary/${file}`); };
      carica('ui-summary-bg-1', 'bg_1.png');
      carica('ui-summary-bg-3', 'bg_3.png');
      carica('ui-summary-bg-4', 'bg_4.png');
      carica('ui-summary-hp', 'hp.png');
      carica('ui-summary-exp', 'exp.png');
      carica('ui-summary-ball', 'ball.png');
      carica('ui-summary-types', 'types.png');
      carica('ui-summary-bg-movedetail', 'bg_movedetail.png');
      carica('ui-summary-category', 'category.png');
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      this._barraAzioniH = 60;
      const scala = Math.min(CW / UI_PARTY_W, (CH - this._barraAzioniH) / UI_PARTY_H);
      const offX = (CW - UI_PARTY_W * scala) / 2, offY = 4;
      this._scala = scala; this._offX = offX; this._offY = offY;

      // Un frame nominato per tipo (invece di setCrop ad ogni disegno): più
      // robusto — setCrop dava badge sbagliati/tagliati per le righe con
      // offset verticale diverso da 0, segnalato da Luca ("la grafica non è
      // quella corretta"). Registrato una sola volta per texture.
      const foglioTipi = this.textures.get('ui-summary-types');
      if (!foglioTipi.has('fire')) {
        Object.entries(TIPO_ICON_POS).forEach(([nome, pos]) => {
          foglioTipi.add(nome, 0, 0, pos * 28, 64, 28);
        });
      }
      // Frame nominati per l'icona di categoria mossa (fisico/speciale/stato),
      // stesso principio dei tipi — category.png è 64×84 = 3 righe da 28px.
      const foglioCategoria = this.textures.get('ui-summary-category');
      if (!foglioCategoria.has('physical')) {
        ['physical', 'special', 'status'].forEach((nome, pos) => {
          foglioCategoria.add(nome, 0, 0, pos * 28, 64, 28);
        });
      }

      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x101018, 1).setDepth(0);
      this._layer = this.add.container(offX, offY).setScale(scala).setDepth(1);

      this._pkm = pkmDaFonte(this._fonte);
      this._azioni = [];       // { x, y, testo, colore, onClick, oggettoText, oggettoBtn } popolato da _disegnaAzioni
      this._cursoreAzione = 0;
      this._focoAzioni = false; // false = si naviga tra le pagine con ←/→, true = tra i bottoni azione
      // Modalità "dettaglio mossa" (pagina Mosse, A su una mossa): cursore fra
      // le mosse conosciute con potenza/precisione/categoria/effetto in tempo
      // reale (drawSelectedMove/pbMoveSelection di UI_Summary.rb) + riordino
      // mosse con lo stesso schema prendi/scambia di Ordina in Squadra.
      this._modoDettaglioMossa = false;
      this._cursoreMossa = 0;
      this._scambioMossa = null;

      if (!this._pkm) {
        this.add.text(CW / 2, CH / 2, 'Pokémon non trovato.', {
          fontFamily: 'Arial', fontSize: '16px', color: '#ccc',
        }).setOrigin(0.5).setDepth(2);
        this._collegaIndietro();
        return;
      }

      const url = this._pkm.sprite && this._pkm.sprite.fronte;
      const key = chiaveIconaSprite(url);
      this._iconKey = key;
      if (key && url && !this.textures.exists(key)) {
        this.load.image(key, url);
        this.load.once('complete', () => this._disegnaPagina());
        this.load.start();
      } else {
        this._disegnaPagina();
      }
      this._collegaIndietro();
      this._collegaTastiPagina();
    }

    _collegaIndietro() {
      const daSquadra = this._fonte.tipo !== 'box';
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.985,
        daSquadra ? '←→ pagina · ↓ azioni · B torna alla Squadra' : '←→ pagina · ↓ azioni · B torna al Box', {
        fontFamily: 'Arial', fontSize: '12px', color: '#888',
      }).setOrigin(0.5, 1).setDepth(2);
      const tornaIndietro = () => {
        if (this._modoDettaglioMossa) {
          if (this._scambioMossa !== null) { this._scambioMossa = null; this._disegnaPagina(); return; }
          this._modoDettaglioMossa = false; this._disegnaPagina(); return;
        }
        if (this._focoAzioni) { this._focoAzioni = false; this._disegnaPagina(); return; }
        this.scene.stop();
        this.scene.launch(daSquadra ? 'PartyScene' : 'BoxScene');
      };
      this.input.keyboard.on('keydown-ESC', tornaIndietro);
      this.input.keyboard.on('keydown-B', tornaIndietro);
    }

    // Navigazione a tastiera: ←/→ cambiano pagina (se il focus non è sui
    // bottoni azione); ↓ dalla pagina sposta il focus sul primo bottone
    // azione; dentro i bottoni, ←/→ scorrono, ↑ torna alla pagina, A/Invio
    // attiva il bottone col focus — stesso principio richiesto da Luca per
    // ogni menu: un cursore vero, non solo il click del mouse.
    _collegaTastiPagina() {
      const PAGINE = [1, 3, 4];
      this.input.keyboard.on('keydown-LEFT', () => {
        if (this._modoDettaglioMossa) return; // in questa modalità ←→ non cambiano pagina
        if (this._focoAzioni) { this._muoviCursoreAzioni(-1); return; }
        const i = PAGINE.indexOf(this._pagina);
        this._pagina = PAGINE[(i - 1 + PAGINE.length) % PAGINE.length];
        this._disegnaPagina();
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        if (this._modoDettaglioMossa) return;
        if (this._focoAzioni) { this._muoviCursoreAzioni(1); return; }
        const i = PAGINE.indexOf(this._pagina);
        this._pagina = PAGINE[(i + 1) % PAGINE.length];
        this._disegnaPagina();
      });
      this.input.keyboard.on('keydown-DOWN', () => {
        if (this._modoDettaglioMossa) { this._muoviCursoreMossa(1); return; }
        if (this._focoAzioni || this._azioni.length === 0) return;
        this._focoAzioni = true; this._cursoreAzione = 0;
        this._disegnaPagina();
      });
      this.input.keyboard.on('keydown-UP', () => {
        if (this._modoDettaglioMossa) { this._muoviCursoreMossa(-1); return; }
        if (!this._focoAzioni) return;
        this._focoAzioni = false;
        this._disegnaPagina();
      });
      const conferma = () => {
        if (this._modoDettaglioMossa) { this._alConfermaDettaglioMossa(); return; }
        if (this._focoAzioni) {
          if (this._azioni.length === 0) return;
          const az = this._azioni[this._cursoreAzione];
          if (az) az.onClick();
          return;
        }
        // A sulla pagina Mosse (fuori dalla barra azioni): entra nel dettaglio
        // mossa con cursore, come pbMoveSelection dell'originale.
        if (this._pagina === 4 && this._pkm && (this._pkm.mosse || []).length > 0) {
          this._modoDettaglioMossa = true;
          this._cursoreMossa = 0;
          this._scambioMossa = null;
          this._disegnaPagina();
        }
      };
      this.input.keyboard.on('keydown-ENTER', conferma);
      this.input.keyboard.on('keydown-SPACE', conferma);
    }

    _muoviCursoreMossa(delta) {
      const n = (this._pkm.mosse || []).length;
      if (n === 0) return;
      this._cursoreMossa = (this._cursoreMossa + delta + n) % n;
      this._disegnaPagina();
    }

    // Come in pbMoveSelection: la prima A su una mossa la "prende" (stesso
    // schema prendi/scambia di Ordina in Squadra); la seconda A su un'altra
    // mossa scambia l'ordine; A sulla stessa mossa presa annulla.
    _alConfermaDettaglioMossa() {
      if (this._scambioMossa === null) {
        this._scambioMossa = this._cursoreMossa;
        this._disegnaPagina();
        return;
      }
      if (this._scambioMossa === this._cursoreMossa) {
        this._scambioMossa = null;
        this._disegnaPagina();
        return;
      }
      const mosse = this._pkm.mosse;
      const tmp = mosse[this._scambioMossa];
      mosse[this._scambioMossa] = mosse[this._cursoreMossa];
      mosse[this._cursoreMossa] = tmp;
      this._scambioMossa = null;
      if (typeof salvaPartita === 'function') salvaPartita();
      this._disegnaPagina();
    }

    _muoviCursoreAzioni(delta) {
      if (this._azioni.length === 0) return;
      this._cursoreAzione = (this._cursoreAzione + delta + this._azioni.length) % this._azioni.length;
      this._disegnaPagina();
    }

    _ridisegna() {
      this.scene.restart({ fonte: this._fonte, pagina: this._pagina });
    }

    // Ridisegna tutto (sfondo + overlay pagina + barra azioni) da zero: la
    // scena ha pochi elementi, una redraw completa ad ogni cambio pagina o
    // spostamento del cursore resta economica ed evita di tenere sincronizzati
    // decine di oggetti sparsi.
    _disegnaPagina() {
      if (this._oggetti) this._oggetti.forEach(o => o.destroy());
      this._oggetti = [];
      this._layer.removeAll(true);
      const pkm = this._pkm;

      const chiaveSfondo = this._modoDettaglioMossa ? 'ui-summary-bg-movedetail' : `ui-summary-bg-${this._pagina}`;
      this._layer.add(this.add.image(0, 0, chiaveSfondo).setOrigin(0, 0));

      if (pkm.uovo) {
        const t1 = this.add.text(256, 100, 'Uovo misterioso', {
          fontFamily: 'Arial', fontSize: '20px', color: '#484848', fontStyle: 'bold',
        }).setOrigin(0.5);
        const t2 = this.add.text(256, 140, `🥚 Ancora ${pkm.passiRimanenti} passi prima della schiusa.`, {
          fontFamily: 'Arial', fontSize: '13px', color: '#484848',
        }).setOrigin(0.5);
        this._layer.add(t1); this._layer.add(t2);
        this._disegnaAzioni(pkm);
        return;
      }

      const testo = (x, y, str, opz = {}) => {
        const o = this.add.text(x, y, str, {
          fontFamily: 'Arial', fontSize: '13px', color: '#f8f8f8', ...opz,
        }).setOrigin(opz.origin || 0, 0);
        this._layer.add(o);
        return o;
      };

      // ── Intestazione comune a tutte le pagine (coordinate esatte di
      // drawPage() in UI_Summary.rb) ──
      const nomePagina = { 1: 'INFO', 3: 'SKILLS', 4: 'MOSSE' }[this._pagina];
      testo(26, 22, nomePagina, { fontSize: '15px', color: '#ffcb05', fontStyle: 'bold' });
      // Lo sprite grande si nasconde in modalità dettaglio mossa: altrimenti
      // copre la descrizione dell'effetto (stesso motivo per cui l'originale
      // lo nasconde in drawSelectedMove — @sprites["pokemon"].visible=false).
      if (!this._modoDettaglioMossa && this._iconKey && this.textures.exists(this._iconKey)) {
        const spr = this.add.image(104, 206, this._iconKey).setDisplaySize(120, 120).setOrigin(0.5);
        this._layer.add(spr);
      }
      const ball = this.add.image(14, 60, 'ui-summary-ball').setDisplaySize(32, 32).setOrigin(0, 0);
      this._layer.add(ball);
      testo(46, 68, pkm.nome, { fontSize: '15px', color: '#484848', fontStyle: 'bold' });
      testo(46, 98, `${pkm.livello}`, { fontSize: '13px', color: '#484848' });
      if (pkm.genere === 'M' || pkm.genere === 'F') {
        testo(178, 68, pkm.genere === 'M' ? '♂' : '♀', {
          fontSize: '15px', fontStyle: 'bold',
          color: pkm.genere === 'M' ? '#1870d8' : '#f83820',
        });
      }
      if (pkm.hpAttuale <= 0) {
        testo(124, 100, 'KO', { fontSize: '11px', color: '#f83820', fontStyle: 'bold' });
      } else if (pkm.condizione && SIGLE_STATO_SOMMARIO[pkm.condizione.tipo]) {
        testo(124, 100, SIGLE_STATO_SOMMARIO[pkm.condizione.tipo], { fontSize: '11px', color: '#f88800', fontStyle: 'bold' });
      }
      testo(66, 324, 'Oggetto', { fontSize: '12px', color: '#606060' });
      if (pkm.oggetto && OGGETTI[pkm.oggetto]) {
        testo(16, 358, `${OGGETTI[pkm.oggetto].icona || ''} ${OGGETTI[pkm.oggetto].nome}`, { fontSize: '12px', color: '#484848' });
      } else {
        testo(16, 358, 'Nessuno', { fontSize: '12px', color: '#a8a8a8' });
      }

      if (this._pagina === 1) this._disegnaPaginaInfo(pkm, testo);
      else if (this._pagina === 3) this._disegnaPaginaSkills(pkm, testo);
      else if (this._pagina === 4 && this._modoDettaglioMossa) this._disegnaDettaglioMossa(pkm, testo);
      else if (this._pagina === 4) this._disegnaPaginaMosse(pkm, testo);

      if (!this._modoDettaglioMossa) this._disegnaAzioni(pkm);
    }

    // Coordinate esatte di drawPageOne() in UI_Summary.rb.
    _disegnaPaginaInfo(pkm, testo) {
      const base = { fontSize: '13px', color: '#f8f8f8' };
      const val  = { fontSize: '13px', color: '#484848', fontStyle: 'bold' };
      testo(238, 86, 'N. Dex', base);
      testo(435, 86, `${String(pkm.id).padStart(3, '0')}`, { ...val, origin: 0.5 });
      testo(238, 118, 'Specie', base);
      testo(435, 118, pkm.nome, { ...val, origin: 0.5 });
      testo(238, 150, 'Tipo', base);
      testo(238, 182, 'OT', base);
      const femmina = typeof stato !== 'undefined' && stato.genere === 'F';
      testo(435, 182, femmina ? 'Rossa' : 'Rosso', { ...val, origin: 0.5, color: femmina ? '#f83820' : '#1870d8' });
      testo(238, 214, 'N. ID', base);
      testo(435, 214, '?????', { ...val, origin: 0.5 });

      // Icone tipo (frame reale da types.png, 64×28 ciascuna).
      (pkm.tipi || []).forEach((t, i) => {
        const pos = TIPO_ICON_POS[t];
        if (pos === undefined) return;
        const x = (pkm.tipi.length === 1) ? 402 : 370 + 66 * i;
        const icona = this.add.image(x, 146, 'ui-summary-types', t).setOrigin(0, 0);
        this._layer.add(icona);
      });

      const alCap = (typeof stato !== 'undefined') && pkm.livello >= stato.levelCap;
      if (alCap) {
        testo(238, 246, 'Exp. Punti', base);
        testo(238, 280, `⛔ Al level cap (Lv.${stato.levelCap})`, { fontSize: '12px', color: '#f83820' });
      } else {
        const expBase = Math.pow(pkm.livello, 3), expProssimo = Math.pow(pkm.livello + 1, 3);
        testo(238, 246, 'Exp. Punti', base);
        testo(488, 278, `${pkm.exp}`, { ...val, origin: 1 });
        testo(238, 310, 'Al prossimo Lv.', base);
        testo(488, 342, `${expProssimo - pkm.exp}`, { ...val, origin: 1 });
        const frazione = Phaser.Math.Clamp((pkm.exp - expBase) / (expProssimo - expBase), 0, 1);
        const w = Math.max(0, Math.round((frazione * 128) / 2) * 2);
        if (w > 0) {
          const barra = this.add.image(362, 372, 'ui-summary-exp').setOrigin(0, 0).setCrop(0, 0, w, 6);
          this._layer.add(barra);
        }
      }
    }

    // Coordinate esatte di drawPageThree() in UI_Summary.rb.
    _disegnaPaginaSkills(pkm, testo) {
      const base = { fontSize: '13px', color: '#f8f8f8' };
      const val  = { fontSize: '13px', color: '#484848', fontStyle: 'bold' };
      testo(292, 82, 'HP', { ...base, origin: 0.5 });
      testo(462, 82, `${pkm.hpAttuale}/${pkm.hpMax}`, { ...val, origin: 1 });
      const righe = [
        ['Attacco', pkm.attacco, 126], ['Difesa', pkm.difesa, 158], ['Att. Speciale', pkm.attSp, 190],
        ['Dif. Speciale', pkm.difSp, 222], ['Velocità', pkm.velocita, 254],
      ];
      righe.forEach(([nome, valore, y]) => {
        testo(248, y, nome, base);
        testo(456, y, `${valore}`, { ...val, origin: 1 });
      });
      // Barra HP reale (crop su hp.png, 3 fasce colore come in Squadra).
      if (pkm.hpAttuale > 0 && pkm.hpMax > 0) {
        const hpPct = Phaser.Math.Clamp(pkm.hpAttuale / pkm.hpMax, 0, 1);
        const w = Math.max(2, Math.round((hpPct * 96) / 2) * 2);
        const zona = hpPct <= 0.25 ? 2 : (hpPct <= 0.5 ? 1 : 0);
        const barra = this.add.image(360, 110, 'ui-summary-hp').setOrigin(0, 0).setCrop(0, zona * 6, w, 6);
        this._layer.add(barra);
      }

      // Abilità (F9.4) — coordinate esatte di drawPageThree() in UI_Summary.rb.
      testo(224, 282, 'Abilità', base);
      const info = this._abilitaInfo(pkm);
      if (info) {
        testo(362, 282, info.nomeIt, val);
        const descTxt = this.add.text(224, 310, info.descrizione, {
          fontFamily: 'Arial', fontSize: '11px', color: '#606060', wordWrap: { width: 282 },
        }).setOrigin(0, 0);
        this._layer.add(descTxt);
      } else {
        testo(362, 282, '…', val);
      }
    }

    // Nome italiano + descrizione dell'abilità del Pokémon, con cache di
    // scena e caricamento lazy (async — PokeAPI). Se il Pokémon è stato
    // creato PRIMA di questa funzionalità (nessun pkm.abilitaChiave salvato),
    // la assegna ora leggendo la lista abilità della specie da PokeAPI
    // (stessa logica di Battle.creaIstanza, riusata via Battle.sceglieSlotAbilita/
    // abilitaChiaveDaSlot) e la salva — così va fatto una volta sola.
    // Ritorna null finché il caricamento non è finito: la pagina si
    // riridisegna da sola quando è pronto.
    _abilitaInfo(pkm) {
      if (!this._cacheAbilita) this._cacheAbilita = {};
      if (pkm.abilitaChiave && this._cacheAbilita[pkm.abilitaChiave]) {
        return this._cacheAbilita[pkm.abilitaChiave];
      }
      if (this._abilitaInCorso === pkm) return null; // già in corso per questo Pokémon
      this._abilitaInCorso = pkm;
      (async () => {
        try {
          if (!pkm.abilitaChiave) {
            const dati = await PokeAPI.getPokemon(pkm.id);
            const slot = (typeof Battle !== 'undefined' && Battle.sceglieSlotAbilita) ? Battle.sceglieSlotAbilita(dati) : 0;
            pkm.abilitaSlot = slot;
            pkm.abilitaChiave = (typeof Battle !== 'undefined' && Battle.abilitaChiaveDaSlot) ? Battle.abilitaChiaveDaSlot(dati, slot) : null;
            if (typeof salvaPartita === 'function') salvaPartita();
          }
          if (pkm.abilitaChiave) {
            this._cacheAbilita[pkm.abilitaChiave] = await PokeAPI.getAbilita(pkm.abilitaChiave);
          }
        } catch (e) {
          console.warn('[Sommario] Abilità non caricata:', e.message);
        } finally {
          this._abilitaInCorso = null;
          if (this._pagina === 3 && this._pkm === pkm && !this._modoDettaglioMossa) this._disegnaPagina();
        }
      })();
      return null;
    }

    // Coordinate esatte di drawPageFour() in UI_Summary.rb.
    _disegnaPaginaMosse(pkm, testo) {
      const righe = pkm.mosse || [];
      for (let i = 0; i < 4; i++) {
        const m = righe[i];
        const yRiga = 104 + i * 64;
        if (!m) {
          testo(316, yRiga, '—', { fontSize: '13px', color: '#484848' });
          continue;
        }
        if (TIPO_ICON_POS[m.tipo] !== undefined) {
          const icona = this.add.image(248, yRiga - 4, 'ui-summary-types', m.tipo).setOrigin(0, 0);
          this._layer.add(icona);
        }
        testo(316, yRiga, m.nomeIt, { fontSize: '13px', color: '#484848', fontStyle: 'bold' });
        testo(342, yRiga + 30, 'PP', { fontSize: '11px', color: '#f8f8f8' });
        const ppPct = m.ppMax > 0 ? m.pp / m.ppMax : 1;
        const colorePP = m.pp <= 0 ? '#f84848' : ppPct <= 0.25 ? '#f88820' : ppPct <= 0.5 ? '#f8c000' : '#484848';
        testo(460, yRiga + 30, `${m.pp}/${m.ppMax}`, { fontSize: '11px', color: colorePP, fontStyle: 'bold', origin: 1 });
      }
    }

    // Dettaglio mossa con cursore (A sulla pagina Mosse) — coordinate esatte
    // di drawPageFourSelecting()/drawSelectedMove() in UI_Summary.rb: stessa
    // lista delle 4 mosse, più potenza/precisione/categoria/effetto della
    // mossa col cursore. ↑↓ spostano il cursore, A la "prende" per scambiarla
    // di posto con un'altra (stesso schema di Ordina in Squadra), B esce.
    _disegnaDettaglioMossa(pkm, testo) {
      const righe = pkm.mosse || [];
      const base = { fontSize: '13px', color: '#f8f8f8' };
      testo(20, 128, 'Categoria', base);
      testo(20, 160, 'Potenza', base);
      testo(20, 192, 'Precisione', base);

      righe.forEach((m, i) => {
        const yRiga = 104 + i * 64;
        const conCursore = i === this._cursoreMossa;
        const presaPerScambio = i === this._scambioMossa;
        if (conCursore || presaPerScambio) {
          const rigaBg = this.add.rectangle(316, yRiga + 10, 190, 56,
            presaPerScambio ? 0xffcb05 : 0x6fd6ff, 0.22).setOrigin(0, 0.5);
          this._layer.add(rigaBg);
        }
        if (TIPO_ICON_POS[m.tipo] !== undefined) {
          const icona = this.add.image(248, yRiga - 4, 'ui-summary-types', m.tipo).setOrigin(0, 0);
          this._layer.add(icona);
        }
        testo(316, yRiga, m.nomeIt, { fontSize: '13px', color: '#484848', fontStyle: 'bold' });
        if (presaPerScambio) {
          testo(460, yRiga, 'A', { fontSize: '12px', color: '#a06000', fontStyle: 'bold', origin: 1 });
        }
        testo(342, yRiga + 30, 'PP', { fontSize: '11px', color: '#f8f8f8' });
        const ppPct = m.ppMax > 0 ? m.pp / m.ppMax : 1;
        const colorePP = m.pp <= 0 ? '#f84848' : ppPct <= 0.25 ? '#f88820' : ppPct <= 0.5 ? '#f8c000' : '#484848';
        testo(460, yRiga + 30, `${m.pp}/${m.ppMax}`, { fontSize: '11px', color: colorePP, fontStyle: 'bold', origin: 1 });
      });

      const mossa = righe[this._cursoreMossa];
      if (!mossa) return;
      const val = { fontSize: '13px', color: '#484848', fontStyle: 'bold' };
      testo(216, 160, mossa.potenza != null ? `${mossa.potenza}` : '—', { ...val, origin: 1 });
      testo(216, 192, mossa.precisione != null ? `${mossa.precisione}%` : '—', { ...val, origin: 1 });
      const catFrame = ['physical', 'special', 'status'].includes(mossa.classe) ? mossa.classe : 'status';
      const catIcon = this.add.image(166, 124, 'ui-summary-category', catFrame).setOrigin(0, 0);
      this._layer.add(catIcon);
      const effetto = (typeof descriviEffettoMossa === 'function') ? descriviEffettoMossa(mossa) : '';
      const descTxt = this.add.text(8, 224, effetto, {
        fontFamily: 'Arial', fontSize: '11px', color: '#484848', wordWrap: { width: 490 },
      }).setOrigin(0, 0);
      this._layer.add(descTxt);

      const hint = this._scambioMossa !== null
        ? '↑↓ scegli · A scambia · B annulla'
        : '↑↓ scorri le mosse · A per riordinare · B esce';
      const hintTxt = this.add.text(256, 360, hint, {
        fontFamily: 'Arial', fontSize: '10px', color: '#606060',
      }).setOrigin(0.5);
      this._layer.add(hintTxt);
    }

    // ── Barra azioni (fuori dal Container, in coordinate schermo reali —
    // stesso principio del menu a tendina di PartyScene: testo sempre
    // leggibile a qualunque scala). Stesse regole di prima: Sposta su solo
    // da Squadra, Sposta in squadra/Rilascia solo da Box.
    _disegnaAzioni(pkm) {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const daSquadra = this._fonte.tipo !== 'box';
      const yBarra = CH - this._barraAzioniH / 2 - 14;
      const definizioni = [];

      if (daSquadra && this._fonte.idx > 0) {
        definizioni.push({ testo: '⬆ Sposta su', colore: '#ffcb05', onClick: () => {
          const arr = stato.squadra, idx = this._fonte.idx;
          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
          if (typeof salvaPartita === 'function') salvaPartita();
          this._fonte = { tipo: 'squadra', idx: idx - 1 };
          this._ridisegna();
        } });
      }
      if (!daSquadra) {
        definizioni.push({ testo: '⬆ In squadra', colore: '#ffcb05', onClick: () => {
          if (stato.squadra.length >= 6) return;
          stato.squadra.push(pkm);
          stato.boxes[this._fonte.box][this._fonte.slot] = null;
          if (typeof salvaPartita === 'function') salvaPartita();
          if (typeof mostraToast === 'function') mostraToast(`⚡ ${pkm.nome} è entrato in squadra!`);
          this.scene.stop();
          this.scene.launch('BoxScene');
        } });
        definizioni.push({ testo: '🗑 Rilascia', colore: '#ff8080', onClick: () => {
          const sicuro = confirm(`Vuoi davvero rilasciare ${pkm.nome}? Non potrai più recuperarlo.`);
          if (!sicuro) return;
          stato.boxes[this._fonte.box][this._fonte.slot] = null;
          if (typeof salvaPartita === 'function') salvaPartita();
          if (typeof mostraToast === 'function') mostraToast(`👋 ${pkm.nome} è stato liberato.`);
          this.scene.stop();
          this.scene.launch('BoxScene');
        } });
      }
      if (pkm.oggetto) {
        definizioni.push({ testo: '🎒 Togli oggetto', colore: '#ffcb05', onClick: () => {
          const nome = OGGETTI[pkm.oggetto].nome;
          stato.zaino[pkm.oggetto] = (stato.zaino[pkm.oggetto] || 0) + 1;
          pkm.oggetto = null;
          if (typeof salvaPartita === 'function') salvaPartita();
          if (typeof mostraToast === 'function') mostraToast(`🎒 ${nome} torna nello zaino.`);
          this._ridisegna();
        } });
      }
      if (daSquadra && typeof MODALITA_TEST !== 'undefined' && MODALITA_TEST) {
        definizioni.push({ testo: `🍬 Caramella Rara (×${(stato.zaino && stato.zaino.caramellarara) || 0})`, colore: '#c9a0ff', onClick: async () => {
          if (!stato.zaino || (stato.zaino.caramellarara || 0) <= 0) return;
          const risultato = await Battle.caramellaRara(pkm, stato.levelCap);
          if (risultato.ok) stato.zaino.caramellarara -= 1;
          if (typeof salvaPartita === 'function') salvaPartita();
          if (typeof aggiornaHUD === 'function') aggiornaHUD();
          if (typeof mostraToast === 'function') mostraToast(risultato.messaggi.join(' '), 4000);
          this._ridisegna();
        } });
      }

      this._azioni = definizioni;
      if (this._cursoreAzione >= definizioni.length) this._cursoreAzione = 0;
      if (definizioni.length === 0) { this._focoAzioni = false; return; }

      // Calcola le larghezze per centrare l'intera barra.
      const misure = definizioni.map(d => Math.max(90, d.testo.length * 8 + 24));
      const gap = 10;
      const largTot = misure.reduce((a, b) => a + b, 0) + gap * (misure.length - 1);
      let x = CW / 2 - largTot / 2;
      definizioni.forEach((d, i) => {
        const w = misure[i];
        const cx = x + w / 2;
        const attivo = this._focoAzioni && i === this._cursoreAzione;
        const bg = this.add.rectangle(cx, yBarra, w, 34, attivo ? 0x2a3f66 : 0x1a2940, 0.95)
          .setStrokeStyle(2, attivo ? 0xffcb05 : 0x3a3a4a).setDepth(2)
          .setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => { this._focoAzioni = true; this._cursoreAzione = i; d.onClick(); });
        const txt = this.add.text(cx, yBarra, d.testo, {
          fontFamily: 'Arial', fontSize: '12px', color: d.colore,
        }).setOrigin(0.5).setDepth(3);
        this._oggetti.push(bg, txt);
        x += w + gap;
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     BOX — PC del Centro Pokémon (modalità 'strumenti', non fa parte
     della lista del menu Start). 24 box × 30 slot, stessa interazione
     "prendi/posa/scambia" del vecchio pannello DOM (boxMano/
     leggiSlotBox, riusati direttamente da app.js — niente logica di
     stato duplicata, solo il disegno è nuovo). Striscia Squadra in
     basso per scambiare senza passare dalla scheda Squadra.
     ══════════════════════════════════════════════════════════ */

  class BoxScene extends Phaser.Scene {
    constructor() { super({ key: 'BoxScene' }); }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x141420, 1).setDepth(0);

      // Intestazione con frecce pagina
      this.add.text(CW / 2 - 90, 26, '◀', {
        fontSize: '18px', color: '#ffcb05', backgroundColor: '#1a2940', padding: { x: 10, y: 6 },
      }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { boxIndiceAttivo = (boxIndiceAttivo + 23) % 24; this.scene.restart(); });
      this.add.text(CW / 2, 26, `📦 Box ${boxIndiceAttivo + 1}/24`, {
        fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2 + 90, 26, '▶', {
        fontSize: '18px', color: '#ffcb05', backgroundColor: '#1a2940', padding: { x: 10, y: 6 },
      }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { boxIndiceAttivo = (boxIndiceAttivo + 1) % 24; this.scene.restart(); });

      const nota = boxMano
        ? `✋ Stai tenendo ${boxMano.pkm.nome}. Clicca uno slot (anche in squadra, qui sotto) per posarlo o scambiarlo.`
        : 'Clicca un Pokémon per prenderlo (ℹ️ per la scheda), uno slot vuoto per depositare.';
      this.add.text(CW / 2, CH - 90, nota, {
        fontFamily: 'Arial', fontSize: '12px', color: '#ccc', align: 'center', wordWrap: { width: CW - 80 },
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2, CH - 16, 'B esce dal PC', {
        fontFamily: 'Arial', fontSize: '13px', color: '#888',
      }).setOrigin(0.5).setDepth(2);

      // Icone da caricare: le 30 del box attuale + le 6 della squadra.
      const daCaricare = new Set();
      stato.boxes[boxIndiceAttivo].forEach(pkm => { if (pkm) daCaricare.add(chiaveIconaPokemon(pkm.nome)); });
      stato.squadra.forEach(pkm => { if (pkm) daCaricare.add(chiaveIconaPokemon(pkm.nome)); });
      let contaCaricamenti = 0;
      daCaricare.forEach(chiave => {
        const key = `pkm-icon-${chiave}`;
        if (!this.textures.exists(key)) {
          this.load.image(key, `sprites/pokemon_icons/${chiave}.png`);
          contaCaricamenti++;
        }
      });
      if (contaCaricamenti > 0) { this.load.once('complete', () => this._disegnaGriglia()); this.load.start(); }
      else this._disegnaGriglia();

      const uscire = () => {
        // Rete di sicurezza (come chiudiMenu() in app.js): se stavo tenendo
        // un Pokémon in mano, torna da solo al suo slot originale.
        if (boxMano) {
          const o = boxMano.origine;
          if (o.tipo === 'box') stato.boxes[o.box][o.slot] = boxMano.pkm;
          else stato.squadra.splice(o.idx, 0, boxMano.pkm);
          boxMano = null;
        }
        this.scene.stop();
        if (typeof window.chiudiMenuNativoDaScene === 'function') window.chiudiMenuNativoDaScene();
      };
      this.input.keyboard.on('keydown-ESC', uscire);
      this.input.keyboard.on('keydown-B', uscire);
    }

    _disegnaGriglia() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const COLS = 6, ROWS = 5;
      const cell = Math.min(70, (CW - 80) / COLS);
      const startX = CW / 2 - (cell * COLS) / 2 + cell / 2;
      const startY = 70;

      for (let slot = 0; slot < 30; slot++) {
        const col = slot % COLS, row = Math.floor(slot / COLS);
        const cx = startX + col * cell, cy = startY + row * cell;
        const pkm = stato.boxes[boxIndiceAttivo][slot];
        this._disegnaCella(cx, cy, cell - 4, pkm, { tipo: 'box', box: boxIndiceAttivo, slot });
      }

      // Striscia Squadra
      const dockY = startY + ROWS * cell + 30;
      this.add.text(40, dockY - 22, '⚡ Squadra', {
        fontFamily: 'Arial', fontSize: '12px', color: '#ffcb05', fontStyle: 'bold',
      }).setOrigin(0, 0.5).setDepth(2);
      const dockCell = Math.min(64, (CW - 80) / 6);
      const dockStartX = CW / 2 - (dockCell * 6) / 2 + dockCell / 2;
      for (let i = 0; i < 6; i++) {
        this._disegnaCella(dockStartX + i * dockCell, dockY + dockCell / 2, dockCell - 6, stato.squadra[i] || null, { tipo: 'squadra', idx: i });
      }
    }

    _disegnaCella(cx, cy, size, pkm, ref) {
      const sfondo = this.add.rectangle(cx, cy, size, size, pkm ? 0x1a2940 : 0x0d1220, 0.9)
        .setStrokeStyle(1, 0x3a3a4a).setDepth(1).setInteractive({ useHandCursor: true });
      sfondo.on('pointerdown', () => this._clicCella(ref));

      if (pkm) {
        const key = `pkm-icon-${chiaveIconaPokemon(pkm.nome)}`;
        if (this.textures.exists(key)) {
          this.add.image(cx, cy - 6, key).setDisplaySize(size * 0.7, size * 0.7).setOrigin(0.5).setDepth(2);
        }
        this.add.text(cx, cy + size / 2 - 8, `${pkm.livello}`, {
          fontFamily: 'Arial', fontSize: '10px', color: '#fff', backgroundColor: '#000',
        }).setOrigin(0.5).setDepth(2);
        const info = this.add.text(cx + size / 2 - 6, cy - size / 2 + 6, 'ℹ️', { fontSize: '11px' })
          .setOrigin(0.5).setDepth(3).setInteractive({ useHandCursor: true });
        info.on('pointerdown', (pointer, x, y, event) => {
          if (event && event.stopPropagation) event.stopPropagation();
          this.scene.stop();
          this.scene.launch('PartyDetailScene', { fonte: ref });
        });
      }
    }

    // Stessa logica di onClickCellaBox() in app.js (leggiSlotBox/boxMano
    // sono le stesse variabili/funzioni, condivise — non duplicata, solo
    // non richiamabile direttamente perché quella aggiorna il pannello DOM).
    _clicCella(ref) {
      const pkmQui = leggiSlotBox(ref);

      if (!boxMano) {
        if (!pkmQui) return;
        if (ref.tipo === 'squadra' && stato.squadra.length <= 1) {
          if (typeof mostraToast === 'function') mostraToast('Non puoi lasciare la squadra senza nemmeno un Pokémon!');
          return;
        }
        if (ref.tipo === 'box') stato.boxes[ref.box][ref.slot] = null;
        else stato.squadra.splice(ref.idx, 1);
        boxMano = { origine: ref, pkm: pkmQui };
        this.scene.restart();
        return;
      }

      if (ref.tipo === 'box') {
        stato.boxes[ref.box][ref.slot] = boxMano.pkm;
      } else if (pkmQui) {
        stato.squadra[ref.idx] = boxMano.pkm;
      } else if (stato.squadra.length < 6) {
        stato.squadra.push(boxMano.pkm);
      } else {
        if (typeof mostraToast === 'function') mostraToast('La squadra è già al completo.');
        return;
      }
      const preso = boxMano.pkm;
      boxMano = pkmQui ? { origine: ref, pkm: pkmQui } : null;
      if (typeof salvaPartita === 'function') salvaPartita();
      if (typeof mostraToast === 'function') {
        mostraToast(boxMano ? `🔄 Scambiati ${preso.nome} e ${pkmQui.nome}.` : `📦 ${preso.nome} sistemato.`);
      }
      this.scene.restart();
    }
  }

  /* ══════════════════════════════════════════════════════════
     MARKET — Poké Market (modalità 'strumenti', aperto parlando col
     venditore di un negozio Tiled o da un marker mappa). Lista merce
     del market più vicino/forzato (marketVicino(), invariata), "Compra"
     richiama la vera compraOggetto() di app.js — nessuna logica di
     prezzo/zaino duplicata, solo la UI è nuova.
     ══════════════════════════════════════════════════════════ */

  class MarketScene extends Phaser.Scene {
    constructor() { super({ key: 'MarketScene' }); }

    preload() {
      if (!this.textures.exists('ui-mart-bg')) this.load.image('ui-mart-bg', 'sprites/ui/mart/bg.png');
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      // Sfondo reale del Poké Market di Essentials (stesso trattamento di
      // ZainoScene: immagine a piena schermata + velo scuro per leggibilità).
      this.add.image(CW / 2, CH / 2, 'ui-mart-bg').setDisplaySize(CW, CH).setDepth(0);
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0a0e18, 0.55).setDepth(0.5);
      this.add.text(CW / 2, 24, '🛒 MARKET', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '16px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2, CH - 16, 'B esce dal Market', {
        fontFamily: 'Arial', fontSize: '13px', color: '#888',
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2, 52, `💰 Il tuo portafoglio: ₽ ${(stato.soldi || 0).toLocaleString('it-IT')}`, {
        fontFamily: 'Arial', fontSize: '13px', color: '#fff',
      }).setOrigin(0.5).setDepth(2);

      const market = (typeof marketVicino === 'function') ? marketVicino() : null;
      if (!market) {
        this.add.text(CW / 2, CH / 2, 'Per comprare, avvicinati al 🛒 Poké Market di un comune\n(di fianco al Centro Pokémon).', {
          fontFamily: 'Arial', fontSize: '14px', color: '#ccc', align: 'center', wordWrap: { width: CW - 100 },
        }).setOrigin(0.5).setDepth(2);
        this._collegaUscita();
        return;
      }

      this.add.text(CW / 2, 82, `Poké Market di ${market.comune}`, {
        fontFamily: 'Arial', fontSize: '14px', color: '#ffcb05', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(2);

      this._merce = market.merce.map(chiave => OGGETTI[chiave] ? { chiave, oggetto: OGGETTI[chiave] } : null).filter(Boolean);
      this._cursore = 0;
      let daCaricare = 0;
      this._merce.forEach(({ oggetto }) => {
        if (!oggetto.img) return;
        const key = `oggetto-icona-${oggetto.img}`;
        if (!this.textures.exists(key)) { this.load.image(key, CARTELLA_ICONE_OGGETTI + oggetto.img); daCaricare++; }
      });
      if (daCaricare > 0) { this.load.once('complete', () => this._disegnaLista()); this.load.start(); }
      else this._disegnaLista();

      // Cursore a tastiera: ↑/↓ scelgono l'oggetto, A/Invio compra —
      // richiesta di Luca: un cursore vero anche qui, non solo il mouse.
      this.input.keyboard.on('keydown-UP', () => this._muoviCursore(-1));
      this.input.keyboard.on('keydown-DOWN', () => this._muoviCursore(1));
      const conferma = () => {
        const v = this._merce[this._cursore];
        if (!v) return;
        if ((stato.soldi || 0) < v.oggetto.prezzo) return;
        compraOggetto(v.chiave);
        this.scene.restart();
      };
      this.input.keyboard.on('keydown-ENTER', conferma);
      this.input.keyboard.on('keydown-SPACE', conferma);

      this._collegaUscita();
    }

    _muoviCursore(delta) {
      if (!this._merce || this._merce.length === 0) return;
      this._cursore = Phaser.Math.Clamp(this._cursore + delta, 0, this._merce.length - 1);
      this._disegnaLista();
    }

    _collegaUscita() {
      const uscire = () => {
        this.scene.stop();
        marketTiledForzato = null;
        if (typeof window.chiudiMenuNativoDaScene === 'function') window.chiudiMenuNativoDaScene();
      };
      this.input.keyboard.on('keydown-ESC', uscire);
      this.input.keyboard.on('keydown-B', uscire);
    }

    _disegnaLista() {
      if (this._elementiLista) this._elementiLista.forEach(e => e.destroy());
      this._elementiLista = [];
      const CW = this.cameras.main.width;
      const top = 110, righeAltezza = 64;
      (this._merce || []).forEach(({ chiave, oggetto }, i) => {
        const y = top + i * righeAltezza;
        const conCursore = i === this._cursore;
        const riga = this.add.rectangle(CW / 2, y, CW - 60, righeAltezza - 8, conCursore ? 0x2a3f66 : 0x1a2940, 0.9)
          .setStrokeStyle(conCursore ? 2 : 0, 0xffcb05).setDepth(2)
          .setInteractive({ useHandCursor: true });
        riga.on('pointerdown', () => { this._cursore = i; this._disegnaLista(); });
        this._elementiLista.push(riga);

        const iconKey = oggetto.img ? `oggetto-icona-${oggetto.img}` : null;
        if (iconKey && this.textures.exists(iconKey)) {
          this._elementiLista.push(this.add.image(60, y, iconKey).setDisplaySize(32, 32).setDepth(3));
        } else {
          this._elementiLista.push(this.add.text(60, y, oggetto.icona || '❔', { fontSize: '20px' }).setOrigin(0.5).setDepth(3));
        }

        const posseduti = stato.zaino[chiave] || 0;
        this._elementiLista.push(this.add.text(95, y - 16, `${oggetto.nome}   ₽ ${oggetto.prezzo.toLocaleString('it-IT')}`, {
          fontFamily: 'Arial', fontSize: '13px', color: '#fff', fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(3));
        this._elementiLista.push(this.add.text(95, y + 4, oggetto.descrizione || '', {
          fontFamily: 'Arial', fontSize: '10px', color: '#aaa', wordWrap: { width: CW - 280 },
        }).setOrigin(0, 0.5).setDepth(3));
        this._elementiLista.push(this.add.text(95, y + 20, `Ne hai: ${posseduti}`, {
          fontFamily: 'Arial', fontSize: '10px', color: '#888',
        }).setOrigin(0, 0.5).setDepth(3));

        const troppoCaro = (stato.soldi || 0) < oggetto.prezzo;
        const btn = this.add.text(CW - 90, y, 'Compra', {
          fontFamily: 'Arial', fontSize: '13px',
          color: troppoCaro ? '#666' : '#ffcb05',
          backgroundColor: '#28304a', padding: { x: 12, y: 6 },
        }).setOrigin(0.5).setDepth(3);
        if (!troppoCaro) {
          btn.setInteractive({ useHandCursor: true });
          btn.on('pointerdown', () => {
            compraOggetto(chiave);
            this.scene.restart();
          });
        }
        this._elementiLista.push(btn);
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     ZAINO — seconda sotto-schermata nativa (richiesta di Luca).
     3 tasche (Oggetti/Chiave/Ball) come il vecchio pannello DOM.
     "Usa" su un oggetto utilizzabile apre ZainoBersaglioScene per
     scegliere il Pokémon — la LOGICA dell'oggetto (cosa fa, quanto
     cura, se evolve...) resta quella vera già in app.js
     (usaOggettoSu/usaRepellente): questa Scene disegna solo la UI,
     non duplica le regole di gioco. NON ancora migrato: l'espansione
     "ℹ️" con la spiegazione della mossa dentro il contenitore MT
     (funzione secondaria, il bottone "Insegna" per usare la MT
     funziona comunque).
     ══════════════════════════════════════════════════════════ */

  // Sfondi reali di Essentials per tasca (stessi numeri delle tasche
  // originali: 1=Oggetti, 3=Poké Ball, 8=Oggetti Chiave — le nostre 3 tasche
  // semplificate mappano su quelle più vicine per tema/colore).
  const ZAINO_SFONDO_TASCA = { 1: '1', 2: '8', 3: '3' };

  class ZainoScene extends Phaser.Scene {
    constructor() { super({ key: 'ZainoScene' }); }

    preload() {
      Object.values(ZAINO_SFONDO_TASCA).forEach(n => {
        if (!this.textures.exists(`ui-bag-bg-${n}`)) this.load.image(`ui-bag-bg-${n}`, `sprites/ui/bag/bg_${n}.png`);
        if (!this.textures.exists(`ui-bag-pic-${n}`)) this.load.image(`ui-bag-pic-${n}`, `sprites/ui/bag/bag_${n}.png`);
      });
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      // Stessa tecnica di PartyScene/PartyDetailScene: risoluzione virtuale
      // = risoluzione reale dell'asset (512×384), scalata e centrata (mai
      // deformata) — necessario per far combaciare i pannelli/riquadri
      // DISEGNATI DENTRO bg_N.png (non generati dal codice!) con quello che
      // disegniamo sopra. Prima venivano stirati a piena finestra (CW×CH),
      // per questo lista/pulsanti sforavano il pannello reale dell'arte.
      const scala = Math.min(CW / UI_PARTY_W, CH / UI_PARTY_H);
      const offX = (CW - UI_PARTY_W * scala) / 2, offY = (CH - UI_PARTY_H * scala) / 2;
      this._scala = scala; this._offX = offX; this._offY = offY;

      const tascaOra = typeof zainoTascaAttiva !== 'undefined' ? zainoTascaAttiva : 1;
      const nSfondo = ZAINO_SFONDO_TASCA[tascaOra] || '1';

      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x101018, 1).setDepth(0);
      this._layer = this.add.container(offX, offY).setScale(scala).setDepth(1);
      this._layer.add(this.add.image(0, 0, `ui-bag-bg-${nSfondo}`).setOrigin(0, 0));

      // Bordi REALI del pannello lista, misurati pixel-per-pixel sull'asset
      // (uguali per ogni tasca): la lista/le scritte non devono mai sforare
      // questi bordi (segnalato da Luca con le due barre verticali). Il
      // riquadro bianco piccolo (icona oggetto) e la zona grigia sotto
      // (descrizione) sono anch'essi disegnati DENTRO bg_N.png, non da noi:
      // qui li "riempiamo" con l'icona/testo veri invece di lasciarli vuoti.
      // x1 leggermente più stretto del bordo misurato (489): il pannello ha
      // un piccolo bordo/ombra decorativo vicino allo spigolo che altrimenti
      // tagliava l'ultima lettera di "Usa".
      this._pannello = { x0: 192, x1: 479, y0: 26, y1: 268 };
      this._rigaH = 34;
      this._iconaFooter = { x: 47, y: 333 };
      this._descFooter = { x: 94, y: 300, w: 400 };

      this._idTasche = [1, 2, 3];
      const tascheDef = [
        { id: 1, etichetta: '🎒 Oggetti' },
        { id: 2, etichetta: '🗝️ Chiave' },
        { id: 3, etichetta: '🔴 Ball' },
      ];
      // Nella colonna rosa a sinistra del pannello lista (spazio libero
      // nell'arte reale), impilate in verticale.
      tascheDef.forEach((t, i) => {
        const attiva = tascaOra === t.id;
        const testo = this.add.text(95, 50 + i * 40, t.etichetta, {
          fontFamily: 'Arial', fontSize: '13px', color: attiva ? '#fff8d8' : '#5a2e42', fontStyle: 'bold',
          backgroundColor: attiva ? '#a8375a' : 'rgba(255,255,255,0.4)', padding: { x: 8, y: 5 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        testo.on('pointerdown', () => { zainoTascaAttiva = t.id; this.scene.restart(); });
        this._layer.add(testo);
      });

      this.add.text(CW / 2, Math.max(4, offY - 6), '🎒 ZAINO', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '14px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5, 1).setDepth(2);
      this.add.text(CW / 2, CH - 6, 'B torna al menu', {
        fontFamily: 'Arial', fontSize: '12px', color: '#888',
      }).setOrigin(0.5, 1).setDepth(2);

      this._scroll = 0;
      this._cursoreLista = 0;
      this._voci = this._raccogliVoci();

      // Carica le icone reali (stessa cartella/nomi già usati altrove) prima
      // di disegnare — batch, come per gli sprite Squadra.
      let daCaricare = 0;
      this._voci.forEach(v => {
        if (!v.img) return;
        const key = `oggetto-icona-${v.img}`;
        if (!this.textures.exists(key)) { this.load.image(key, CARTELLA_ICONE_OGGETTI + v.img); daCaricare++; }
      });
      if (daCaricare > 0) {
        this.load.once('complete', () => this._disegnaLista());
        this.load.start();
      } else {
        this._disegnaLista();
      }

      this.input.on('wheel', (_p, _go, _dx, dy) => {
        this._scroll = Phaser.Math.Clamp(this._scroll + dy * 0.5, 0, this._scrollMax || 0);
        this._disegnaLista();
      });

      // Cursore a tastiera: ←/→ cambiano tasca, ↑/↓ scorrono la lista (con
      // auto-scroll), A/Invio attiva "Usa" sulla voce col cursore — stesso
      // principio richiesto da Luca per ogni menu: un cursore vero, non solo
      // il click del mouse.
      this.input.keyboard.on('keydown-LEFT', () => {
        const i = this._idTasche.indexOf(tascaOra);
        zainoTascaAttiva = this._idTasche[(i - 1 + this._idTasche.length) % this._idTasche.length];
        this.scene.restart();
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        const i = this._idTasche.indexOf(tascaOra);
        zainoTascaAttiva = this._idTasche[(i + 1) % this._idTasche.length];
        this.scene.restart();
      });
      this.input.keyboard.on('keydown-UP',   () => this._muoviCursoreLista(-1));
      this.input.keyboard.on('keydown-DOWN', () => this._muoviCursoreLista(1));
      const conferma = () => {
        const v = this._voci[this._cursoreLista];
        if (!v || !v.usabile) return;
        const disabilitato = (!v.diretto && stato.squadra.length === 0);
        if (disabilitato) return;
        if (v.diretto) {
          usaRepellente(v.chiave);
          this.scene.restart();
        } else {
          this.scene.stop();
          this.scene.launch('ZainoBersaglioScene', { chiave: v.chiave });
        }
      };
      this.input.keyboard.on('keydown-ENTER', conferma);
      this.input.keyboard.on('keydown-SPACE', conferma);

      const tornaAlMenu = () => { this.scene.stop(); this.scene.launch('PauseMenuScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAlMenu);
      this.input.keyboard.on('keydown-B', tornaAlMenu);
    }

    _muoviCursoreLista(delta) {
      if (this._voci.length === 0) return;
      this._cursoreLista = Phaser.Math.Clamp(this._cursoreLista + delta, 0, this._voci.length - 1);
      // Auto-scroll: tiene la riga col cursore dentro l'area visibile
      // (coordinate virtuali, vedi this._pannello).
      const rigaH = this._rigaH, areaAlto = this._pannello.y0, areaBasso = this._pannello.y1;
      const yRiga = areaAlto + rigaH / 2 + this._cursoreLista * rigaH - this._scroll;
      if (yRiga - rigaH / 2 < areaAlto) {
        this._scroll -= (areaAlto - (yRiga - rigaH / 2));
      } else if (yRiga + rigaH / 2 > areaBasso) {
        this._scroll += (yRiga + rigaH / 2 - areaBasso);
      }
      this._scroll = Phaser.Math.Clamp(this._scroll, 0, this._scrollMax || 0);
      this._disegnaLista();
    }

    // Voci della tasca attiva: { chiave, oggetto, quanti, img, usabile, diretto }
    // — stessa logica di renderZaino/renderZainoTascaOggetti/Ball/Chiave in
    // app.js, senza duplicare le regole (solo lettura di OGGETTI/stato.zaino).
    _raccogliVoci() {
      const tasca = typeof zainoTascaAttiva !== 'undefined' ? zainoTascaAttiva : 1;
      const voci = [];
      if (tasca === 1) {
        for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
          if (oggetto.categoria === 'test' && !MODALITA_TEST) continue;
          if (categoriaInTasca2(oggetto.categoria) || categoriaInTasca3(oggetto.categoria)) continue;
          const quanti = stato.zaino[chiave] || 0;
          if (quanti <= 0) continue;
          voci.push(this._voceDa(chiave, oggetto, quanti));
        }
      } else if (tasca === 3) {
        for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
          if (!categoriaInTasca3(oggetto.categoria)) continue;
          const quanti = stato.zaino[chiave] || 0;
          if (quanti <= 0) continue;
          voci.push({ chiave, oggetto, quanti, img: oggetto.img, usabile: false, diretto: false });
        }
      } else {
        for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
          if (!categoriaInTasca2(oggetto.categoria)) continue;
          const quanti = stato.zaino[chiave] || 0;
          if (quanti <= 0) continue;
          voci.push(this._voceDa(chiave, oggetto, quanti));
        }
        if (typeof OGGETTI_CHIAVE !== 'undefined' && stato.inventario && stato.inventario.chiave) {
          for (const [id, posseduto] of Object.entries(stato.inventario.chiave)) {
            if (!posseduto) continue;
            const def = OGGETTI_CHIAVE[id] || {};
            voci.push({ chiave: id, oggetto: { nome: def.nome || id, descrizione: def.descrizione || '', icona: def.icona || '🔑' }, quanti: null, img: null, usabile: false, diretto: false });
          }
        }
      }
      return voci;
    }

    _voceDa(chiave, oggetto, quanti) {
      const suBersaglio = ['cura', 'revive', 'test', 'curastato', 'pietra', 'mt', 'held', 'curatotale', 'pp', 'raracandy'].includes(oggetto.categoria);
      const diretto = oggetto.categoria === 'repellente';
      return { chiave, oggetto, quanti, img: oggetto.img, usabile: suBersaglio || diretto, diretto };
    }

    _disegnaLista() {
      if (this._elementiLista) this._elementiLista.forEach(e => e.destroy());
      this._elementiLista = [];
      if (this._maskGraphics) this._maskGraphics.destroy();
      const P = this._pannello, rigaH = this._rigaH;

      if (this._voci.length === 0) {
        const tasca = typeof zainoTascaAttiva !== 'undefined' ? zainoTascaAttiva : 1;
        const msg = tasca === 3 ? 'Non hai nessuna Ball.\nComprale al Poké Market.'
          : tasca === 2 ? 'Non hai oggetti chiave\no MT/MN.'
          : 'Nessun oggetto.\nCompra al Poké Market\ndi un comune.';
        const t = this.add.text((P.x0 + P.x1) / 2, (P.y0 + P.y1) / 2, msg, {
          fontFamily: 'Arial', fontSize: '11px', color: '#555', align: 'center', wordWrap: { width: P.x1 - P.x0 - 16 },
        }).setOrigin(0.5);
        this._layer.add(t);
        this._elementiLista.push(t);
        this._disegnaFooterOggetto(null);
        return;
      }

      this._scrollMax = Math.max(0, this._voci.length * rigaH - (P.y1 - P.y0));

      // Maschera in coordinate SCHERMO (il Container è scalato): le righe
      // fuori dal pannello reale non devono disegnarsi sopra tasche/titolo
      // quando si scorre. Ricreata ad ogni redraw, la precedente va distrutta
      // per non accumulare Graphics orfani.
      this._maskGraphics = this.make.graphics();
      const a = { x: this._offX + P.x0 * this._scala, y: this._offY + P.y0 * this._scala };
      const b = { x: this._offX + P.x1 * this._scala, y: this._offY + P.y1 * this._scala };
      this._maskGraphics.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
      const mask = this._maskGraphics.createGeometryMask();

      // Righe compatte (solo nome × quantità, come nel gioco vero — icona e
      // descrizione ora vivono SOLO nei due riquadri fissi in basso, per
      // l'oggetto col cursore, non più ripetute riga per riga).
      this._voci.forEach((v, i) => {
        const y = P.y0 + rigaH / 2 + i * rigaH - this._scroll;
        if (y < P.y0 - rigaH || y > P.y1 + rigaH) return; // fuori vista, non crearla

        const conCursore = i === this._cursoreLista;
        const riga = this.add.rectangle((P.x0 + P.x1) / 2, y, P.x1 - P.x0 - 6, rigaH - 4,
          conCursore ? 0xf3c4d6 : 0xffffff, conCursore ? 1 : 0)
          .setStrokeStyle(conCursore ? 2 : 0, 0xa8375a).setDepth(2).setMask(mask)
          .setInteractive({ useHandCursor: true });
        riga.on('pointerdown', () => { this._cursoreLista = i; this._disegnaLista(); });
        this._layer.add(riga); this._elementiLista.push(riga);

        const nomeQta = v.quanti != null ? `${v.oggetto.nome} ×${v.quanti}` : v.oggetto.nome;
        const nome = this.add.text(P.x0 + 8, y, nomeQta, {
          fontFamily: 'Arial', fontSize: '12px', fontStyle: 'bold',
          color: conCursore ? '#3a1020' : '#3a3a3a',
        }).setOrigin(0, 0.5).setDepth(3).setMask(mask);
        this._layer.add(nome); this._elementiLista.push(nome);

        let xUsa = P.x1 - 8;
        if (v.oggetto.categoria === 'mt') {
          // Espansione "ℹ️" (integrata su richiesta di Luca): stesso identico
          // contenuto del popup dettagli mossa del vecchio pannello DOM
          // (creaCardMt in app.js) — resta un overlay a schermo intero,
          // fuori dal Container, per non dover ricalcolare le altezze.
          xUsa = P.x1 - 26;
          const infoBtn = this.add.text(P.x1 - 6, y, 'ℹ️', { fontSize: '11px' })
            .setOrigin(1, 0.5).setDepth(3).setMask(mask).setInteractive({ useHandCursor: true });
          infoBtn.on('pointerdown', () => this._mostraInfoMossa(v.chiave, v.oggetto));
          this._layer.add(infoBtn); this._elementiLista.push(infoBtn);
        }

        if (v.usabile) {
          const disabilitato = (!v.diretto && stato.squadra.length === 0);
          const btn = this.add.text(xUsa, y, 'Usa', {
            fontFamily: 'Arial', fontSize: '11px', fontStyle: 'bold',
            color: disabilitato ? '#bbb' : '#a8375a',
          }).setOrigin(1, 0.5).setDepth(3).setMask(mask);
          if (!disabilitato) {
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerdown', () => {
              if (v.diretto) {
                usaRepellente(v.chiave);
                this.scene.restart();
              } else {
                this.scene.stop();
                this.scene.launch('ZainoBersaglioScene', { chiave: v.chiave });
              }
            });
          }
          this._layer.add(btn); this._elementiLista.push(btn);
        }
      });

      this._disegnaFooterOggetto(this._voci[this._cursoreLista] || null);
    }

    // I due riquadri in basso (icona grande + descrizione) sono disegnati
    // DENTRO bg_N.png (coordinate misurate sull'asset, this._iconaFooter/
    // this._descFooter): qui li riempiamo con l'oggetto col cursore, come
    // fa l'originale (@sprites["itemicon"]/@sprites["itemtext"] aggiornati
    // ad ogni spostamento del cursore in UI_Bag.rb).
    _disegnaFooterOggetto(v) {
      if (this._footerObjs) this._footerObjs.forEach(o => o.destroy());
      this._footerObjs = [];
      const { x: ix, y: iy } = this._iconaFooter;
      if (v) {
        const key = v.img ? `oggetto-icona-${v.img}` : null;
        if (key && this.textures.exists(key)) {
          const icona = this.add.image(ix, iy, key).setDisplaySize(48, 48).setOrigin(0.5);
          this._layer.add(icona); this._footerObjs.push(icona);
        } else {
          const emoji = this.add.text(ix, iy, v.oggetto.icona || '❔', { fontSize: '28px' }).setOrigin(0.5);
          this._layer.add(emoji); this._footerObjs.push(emoji);
        }
      }
      const { x: dx, y: dy, w: dw } = this._descFooter;
      const desc = this.add.text(dx, dy, v ? (v.oggetto.descrizione || '') : 'Chiudi lo zaino.', {
        fontFamily: 'Arial', fontSize: '12px', color: '#e8e8ec', wordWrap: { width: dw },
      }).setOrigin(0, 0);
      this._layer.add(desc); this._footerObjs.push(desc);
    }

    // Overlay coi dettagli di una mossa (MT/MN): nome, tipo, categoria,
    // potenza/precisione/PP, effetto in italiano — stessi dati/stesse frasi
    // di descriviEffettoMossa() in app.js (riusata, non riscritta).
    async _mostraInfoMossa(chiave, oggetto) {
      this._chiudiInfoMossa();
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const box = [];
      const bg = this.add.rectangle(CW / 2, CH / 2, CW - 100, 200, 0x0d1220, 0.97)
        .setStrokeStyle(2, 0xffcb05).setDepth(10).setInteractive();
      box.push(bg);
      const chiudi = this.add.text(CW / 2 + (CW - 100) / 2 - 20, CH / 2 - 90, '✕', {
        fontSize: '18px', color: '#fff',
      }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
      chiudi.on('pointerdown', () => this._chiudiInfoMossa());
      box.push(chiudi);
      const caricamento = this.add.text(CW / 2, CH / 2, 'Caricamento…', {
        fontFamily: 'Arial', fontSize: '13px', color: '#ccc',
      }).setOrigin(0.5).setDepth(11);
      box.push(caricamento);
      this._infoMossaBox = box;

      let d;
      try {
        d = await PokeAPI.getMossa(oggetto.mossa);
      } catch (e) {
        caricamento.setText('Errore di connessione: riprova più tardi.');
        return;
      }
      if (!this._infoMossaBox || !this._infoMossaBox.includes(caricamento)) return; // chiuso nel frattempo
      caricamento.destroy();
      box.splice(box.indexOf(caricamento), 1);

      const top = CH / 2 - 80;
      const nomeTxt = this.add.text(CW / 2, top, `${d.nomeIt}  (${d.nomeEn})`, {
        fontFamily: 'Arial', fontSize: '15px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(11);
      box.push(nomeTxt);

      const hexStr = TIPO_COLORI[d.tipo] || '#888888';
      const coloreTipo = parseInt(hexStr.replace('#', ''), 16);
      this.add.rectangle(CW / 2 - 90, top + 28, 70, 18, coloreTipo).setDepth(11).setOrigin(0.5);
      const badgeTipo = this.add.text(CW / 2 - 90, top + 28, TIPO_NOMI[d.tipo] || d.tipo, {
        fontSize: '10px', color: '#fff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(12);
      box.push(badgeTipo);
      const classeTxt = this.add.text(CW / 2 - 30, top + 28, classeMossaIt(d.classe), {
        fontFamily: 'Arial', fontSize: '12px', color: '#ccc',
      }).setOrigin(0, 0.5).setDepth(11);
      box.push(classeTxt);

      const statTxt = this.add.text(CW / 2, top + 54,
        `Potenza: ${d.potenza ?? '—'}   ·   Precisione: ${d.precisione != null ? d.precisione : '—'}   ·   PP: ${d.ppMax}`, {
        fontFamily: 'Arial', fontSize: '12px', color: '#e8e8e8',
      }).setOrigin(0.5).setDepth(11);
      box.push(statTxt);

      const effettoTxt = this.add.text(CW / 2, top + 82, descriviEffettoMossa(d), {
        fontFamily: 'Arial', fontSize: '11px', color: '#9ec8ff', align: 'center',
        wordWrap: { width: CW - 160 },
      }).setOrigin(0.5, 0).setDepth(11);
      box.push(effettoTxt);
    }

    _chiudiInfoMossa() {
      if (this._infoMossaBox) { this._infoMossaBox.forEach(e => e.destroy()); this._infoMossaBox = null; }
    }
  }

  /* ══════════════════════════════════════════════════════════
     ZAINO — scelta del Pokémon bersaglio per un oggetto utilizzabile.
     Riusa usaOggettoSu() (app.js): stessa logica di sempre, solo la UI
     è nuova. Caso speciale "pietra evolutiva": usaOggettoSu chiama al
     suo interno chiudiMenu() (DOM) per lasciare spazio alla scena di
     evoluzione — qui usciamo prima noi dal menu nativo (GameMap.
     chiudiMenuNativo) così la mappa/HUD tornano visibili PRIMA che
     parta l'animazione, esattamente come nel flusso DOM originale.
     ══════════════════════════════════════════════════════════ */

  class ZainoBersaglioScene extends Phaser.Scene {
    constructor() { super({ key: 'ZainoBersaglioScene' }); }

    init(data) { this._chiave = data.chiave; }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x141420, 1).setDepth(0);
      const oggetto = OGGETTI[this._chiave];
      const quanti = stato.zaino[this._chiave] || 0;
      this.add.text(CW / 2, 30, `${oggetto.icona || ''} ${oggetto.nome} (×${quanti}) — su quale Pokémon?`, {
        fontFamily: 'Arial', fontSize: '14px', color: '#fff', align: 'center', wordWrap: { width: CW - 60 },
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2, CH - 16, 'B annulla e torna allo Zaino', {
        fontFamily: 'Arial', fontSize: '13px', color: '#888',
      }).setOrigin(0.5).setDepth(2);

      const squadra = stato.squadra || [];
      let daCaricare = 0;
      squadra.forEach((pkm, idx) => {
        if (pkm.uovo) return;
        const url = pkm.sprite && pkm.sprite.fronte;
        const key = `bersaglio-icon-${idx}`;
        if (url && !this.textures.exists(key)) { this.load.image(key, url); daCaricare++; }
      });
      if (daCaricare > 0) { this.load.once('complete', () => this._disegna(squadra)); this.load.start(); }
      else this._disegna(squadra);

      // Cursore a tastiera sulla griglia 2 colonne (stesso schema di
      // PartyScene) — richiesta di Luca: un cursore vero anche qui.
      this._validi = squadra.map((p, i) => (p && !p.uovo) ? i : null).filter(i => i !== null);
      this._cursore = this._validi[0] ?? -1;
      const COLS = 2;
      const posValida = (idx) => this._validi.indexOf(idx);
      const muoviCursore = (dRow, dCol) => {
        if (this._cursore < 0) return;
        const pos = posValida(this._cursore);
        const col = Phaser.Math.Clamp((pos % COLS) + dCol, 0, COLS - 1);
        const target = Math.floor(pos / COLS + dRow) * COLS + col;
        const nuovo = this._validi.includes(target) ? target : this._validi.reduce(
          (migliore, i) => Math.abs(posValida(i) - target) < Math.abs(posValida(migliore) - target) ? i : migliore, this._validi[0]
        );
        this._cursore = nuovo;
        this._disegna(squadra);
      };
      this.input.keyboard.on('keydown-UP',    () => muoviCursore(-1, 0));
      this.input.keyboard.on('keydown-DOWN',  () => muoviCursore(1, 0));
      this.input.keyboard.on('keydown-LEFT',  () => muoviCursore(0, -1));
      this.input.keyboard.on('keydown-RIGHT', () => muoviCursore(0, 1));
      const conferma = () => { if (this._cursore >= 0) this._scegli(this._cursore); };
      this.input.keyboard.on('keydown-ENTER', conferma);
      this.input.keyboard.on('keydown-SPACE', conferma);

      const tornaAllZaino = () => { this.scene.stop(); this.scene.launch('ZainoScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAllZaino);
      this.input.keyboard.on('keydown-B', tornaAllZaino);
    }

    _disegna(squadra) {
      if (this._cella) this._cella.forEach(e => e.destroy());
      this._cella = [];
      const CW = this.cameras.main.width;
      const COLS = 2, cellW = Math.min(320, (CW - 60) / COLS), cellH = 78;
      const startX = CW / 2 - (cellW * COLS) / 2 + cellW / 2, startY = 110;
      let riga = 0;

      squadra.forEach((pkm, idx) => {
        if (pkm.uovo) return;
        const col = riga % COLS, rowN = Math.floor(riga / COLS);
        riga++;
        const cx = startX + col * cellW, cy = startY + rowN * (cellH + 10);

        const conCursore = idx === this._cursore;
        const sfondo = this.add.rectangle(cx, cy, cellW - 10, cellH, conCursore ? 0x2a3f66 : 0x1a2940, 0.9)
          .setStrokeStyle(conCursore ? 3 : 2, conCursore ? 0xffcb05 : 0x3a3a4a).setDepth(1).setInteractive({ useHandCursor: true });
        sfondo.on('pointerover', () => { if (!conCursore) sfondo.setFillStyle(0x2a3f66, 0.9); });
        sfondo.on('pointerout',  () => { if (!conCursore) sfondo.setFillStyle(0x1a2940, 0.9); });
        sfondo.on('pointerdown', () => { this._cursore = idx; this._scegli(idx); });
        this._cella.push(sfondo);

        const key = `bersaglio-icon-${idx}`;
        if (this.textures.exists(key)) {
          this._cella.push(this.add.image(cx - cellW / 2 + 40, cy, key).setDisplaySize(52, 52).setOrigin(0.5).setDepth(2));
        }
        this._cella.push(this.add.text(cx - cellW / 2 + 74, cy - 18, `${pkm.nome}  Lv.${pkm.livello}`, {
          fontFamily: 'Arial', fontSize: '12px', color: '#fff', fontStyle: 'bold',
        }).setOrigin(0, 0.5).setDepth(2));
        const hpPct = pkm.hpMax > 0 ? Math.max(0, pkm.hpAttuale / pkm.hpMax) : 0;
        const colHp = hpPct > 0.5 ? 0x4caf50 : (hpPct > 0.2 ? 0xffb300 : 0xe53935);
        const barraW = cellW - 100;
        this._cella.push(this.add.rectangle(cx - cellW / 2 + 74, cy + 2, barraW, 7, 0x333333).setOrigin(0, 0.5).setDepth(2));
        this._cella.push(this.add.rectangle(cx - cellW / 2 + 74, cy + 2, Math.max(1, barraW * hpPct), 7, colHp).setOrigin(0, 0.5).setDepth(2));
        this._cella.push(this.add.text(cx - cellW / 2 + 74, cy + 18, `${pkm.hpAttuale}/${pkm.hpMax} HP${pkm.hpAttuale <= 0 ? ' · KO' : ''}`, {
          fontFamily: 'Arial', fontSize: '11px', color: '#ccc',
        }).setOrigin(0, 0.5).setDepth(2));
      });
    }

    async _scegli(idx) {
      const oggetto = OGGETTI[this._chiave];
      if (oggetto.categoria === 'pietra') {
        // Vedi commento in testa alla classe: usciamo dal menu nativo PRIMA,
        // poi lasciamo che usaOggettoSu segua il suo flusso originale
        // (chiudiMenu DOM, che a quel punto non ha più nulla da chiudere, +
        // avviaEvoluzione).
        this.scene.stop();
        if (typeof GameMap !== 'undefined' && GameMap.chiudiMenuNativo) GameMap.chiudiMenuNativo();
        await usaOggettoSu(this._chiave, idx);
        return;
      }
      await usaOggettoSu(this._chiave, idx);
      // usaOggettoSu richiama al suo interno renderScegliBersaglio (DOM,
      // innocuo/non visibile qui): ridisegniamo la versione nativa con i
      // dati aggiornati (quantità, HP...).
      if ((stato.zaino[this._chiave] || 0) > 0) {
        this.scene.restart();
      } else {
        this.scene.stop();
        this.scene.launch('ZainoScene');
      }
    }
  }

  // Spezza un blocco di "<div>...</div>" concatenati (come restituiscono
  // gdFStatoTesto/leggendariStatoTesto/legaStatoTesto in app.js) in righe di
  // solo testo, per disegnarle in Canvas — riusa le stesse funzioni/frasi di
  // sempre invece di ricalcolare da zero la logica di stato.
  function _divsATesto(html) {
    return html.split(/<\/div>/).map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  }

  /* ══════════════════════════════════════════════════════════
     RECAP — terza sotto-schermata nativa. Solo lettura: riepilogo
     di stato.passi/tempo/soldi/squadra/box/medaglie/MN/allenatori
     + i tre "stati narrativi" (Team GdF/Leggendari/Lega), stessi dati
     e stesse frasi del vecchio renderRecap() in app.js.
     ══════════════════════════════════════════════════════════ */

  class RecapScene extends Phaser.Scene {
    constructor() { super({ key: 'RecapScene' }); }

    preload() {
      if (!this.textures.exists('ui-load-bg')) this.load.image('ui-load-bg', 'sprites/ui/load/bg.png');
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      // Il Recap è una schermata custom di questo progetto (non esiste
      // nell'originale): riusa lo sfondo reale "Load" di Essentials, lo
      // stesso usato dalla schermata analoga di riepilogo/scelta a lista.
      this.add.image(CW / 2, CH / 2, 'ui-load-bg').setDisplaySize(CW, CH).setDepth(0);
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0a0e18, 0.55).setDepth(0.5);
      this.add.text(CW / 2, 24, 'RIEPILOGO', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '16px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);
      // Seconda pagina della Scheda Allenatore (sess. 5 set): B torna alla
      // prima pagina, non esce dal menu Start — coerente con "una schermata,
      // due pagine" invece di essere una voce a sé del menu (vedi
      // VOCI_MENU_START in PauseMenuScene).
      this.add.text(CW / 2, CH - 16, 'B torna alla Scheda Allenatore', {
        fontFamily: 'Arial', fontSize: '13px', color: '#888',
      }).setOrigin(0.5).setDepth(2);

      const righe = [
        `👣 Passi: ${stato.passi}`,
        `📅 Giorno: ${stato.tempo.giorno}  ·  🕐 Ora: ${formatOrario(stato.tempo.minuti)}`,
        `💰 Pokéyen: ₽ ${(stato.soldi || 0).toLocaleString('it-IT')}`,
        `⚡ Squadra: ${stato.squadra.length}  ·  📦 Box: ${contaBox()}`,
        `🏅 Medaglie: ${stato.medaglie.length}/8  ·  Level cap: ${stato.levelCap}`,
        `📀 MN: ${mnPosseduteTesto()}`,
        `⚔️ Allenatori battuti: ${(stato.allenatoriBattuti || []).length}/${ALLENATORI.length}`,
        ..._divsATesto(gdFStatoTesto()),
        ..._divsATesto(leggendariStatoTesto()),
        ..._divsATesto(legaStatoTesto()),
      ];

      righe.forEach((riga, i) => {
        this.add.text(60, 70 + i * 26, riga, {
          fontFamily: 'Arial', fontSize: '13px', color: '#fff', wordWrap: { width: CW - 120 },
        }).setOrigin(0, 0).setDepth(2);
      });

      const tornaAllaScheda = () => { this.scene.stop(); this.scene.launch('TrainerCardScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAllaScheda);
      this.input.keyboard.on('keydown-B', tornaAllaScheda);
    }
  }

  /* ══════════════════════════════════════════════════════════
     SALVA — quarta sotto-schermata nativa. Solo azioni, nessuna
     logica nuova: richiama le stesse funzioni di sempre
     (salvaPartitaOra/esportaSalvataggio/importaSalvataggio/
     inizializzaSquadraTest) già usate dal vecchio renderSalva().
     ══════════════════════════════════════════════════════════ */

  class SalvaScene extends Phaser.Scene {
    constructor() { super({ key: 'SalvaScene' }); }

    preload() {
      if (!this.textures.exists('ui-load-bg')) this.load.image('ui-load-bg', 'sprites/ui/load/bg.png');
      if (!this.textures.exists('ui-load-panels')) this.load.image('ui-load-panels', 'sprites/ui/load/panels.png');
    }

    create() {
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      // Stesso sfondo reale di RecapScene (schermata custom di questo
      // progetto, non esiste nell'originale): sfondo "Load" + velo scuro, e
      // ogni riga usa il pannello piccolo reale di Load/panels.png (crop
      // 408×46 a y=444, la variante "non selezionata" — Essentials la usa
      // per le voci Nuova Partita/Opzioni della stessa schermata) invece del
      // chip di colore piatto.
      this.add.image(CW / 2, CH / 2, 'ui-load-bg').setDisplaySize(CW, CH).setDepth(0);
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0a0e18, 0.55).setDepth(0.5);
      this.add.text(CW / 2, 24, '💾 SALVA', {
        fontFamily: "'Press Start 2P', monospace", fontSize: '16px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2, CH - 16, 'B torna al menu', {
        fontFamily: 'Arial', fontSize: '13px', color: '#888',
      }).setOrigin(0.5).setDepth(2);
      this.add.text(CW / 2, 60,
        'Il salvataggio è manuale: premi "Salva partita" per registrare i progressi.\nSe non salvi e ricarichi la pagina, riparti dall\'ultimo salvataggio.', {
        fontFamily: 'Arial', fontSize: '12px', color: '#f0f0f0', align: 'center', wordWrap: { width: CW - 100 },
      }).setOrigin(0.5, 0).setDepth(2);

      // Ogni voce (bottone o checkbox) va in this._voci, così le frecce
      // ↑↓ + A/Invio possono muovere un cursore vero sopra la stessa lista
      // che il mouse già usa — richiesta esplicita di Luca: un cursore a
      // tastiera ovunque serva un click, non solo il mouse.
      this._voci = [];
      const largPannello = Math.min(408, CW - 80);
      let y = 122;
      const bottone = (testo, colore, onClick) => {
        const pannello = this.add.image(CW / 2, y, 'ui-load-panels').setOrigin(0.5)
          .setCrop(0, 444, 408, 46).setDisplaySize(largPannello, 46).setDepth(2)
          .setInteractive({ useHandCursor: true });
        const t = this.add.text(CW / 2, y, testo, {
          fontFamily: 'Arial', fontSize: '14px', color: colore, align: 'center',
        }).setOrigin(0.5).setDepth(3).setInteractive({ useHandCursor: true });
        const idx = this._voci.length;
        const azione = () => { this._cursore = idx; this._aggiornaCursoreVoci(); onClick(); };
        t.on('pointerdown', azione);
        pannello.on('pointerdown', azione);
        this._voci.push({ pannello, testo: t, onClick });
        y += 46;
        return t;
      };

      bottone('💾 Salva partita', '#5be18a', () => {
        const ok = salvaPartitaOra();
        if (typeof mostraToast === 'function') mostraToast(ok ? '💾 Partita salvata!' : '⚠️ Errore nel salvataggio.');
      });

      if (typeof MODALITA_TEST !== 'undefined' && MODALITA_TEST) {
        bottone('🧪 Setup squadra TEST (Lv.100 + Regi-kit)', '#c9a0ff', async () => {
          await inizializzaSquadraTest();
        });

        const testoCheck = () => (stato.flags && stato.flags.testNoTrainerChallenge ? '☑' : '☐') + ' Allenatori non mi sfidano a vista (test)';
        bottone(testoCheck(), '#f0f0f0', () => {
          if (!stato.flags) stato.flags = {};
          stato.flags.testNoTrainerChallenge = !stato.flags.testNoTrainerChallenge;
          if (typeof salvaPartita === 'function') salvaPartita();
          this._voci[this._cursore].testo.setText(testoCheck());
        });

        bottone('🔄 Reset cutscene (test)', '#7db8ff', () => {
          const sicuro = confirm('Resettare tutte le cutscene già viste? (solo test: potrai ritriggerarle tutte)');
          if (!sicuro) return;
          stato.cutsceneViste = [];
          if (stato.flags) {
            delete stato.flags.latiosLatiasCutscene1Vista;
            delete stato.flags.latiosLatiasRoaming;
          }
          if (typeof salvaPartita === 'function') salvaPartita();
          alert('Cutscene resettate.');
        });
      }

      bottone('📤 Esporta salvataggio (file JSON)', '#f0f0f0', () => esportaSalvataggio());

      bottone('📥 Importa salvataggio da file', '#f0f0f0', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.addEventListener('change', () => {
          if (input.files && input.files[0]) importaSalvataggio(input.files[0]);
        });
        input.click();
      });

      bottone('🗑 Nuova partita (cancella tutto)', '#ff6b6b', () => {
        const sicuro = confirm('Vuoi davvero cancellare la partita e ricominciare da zero?\n(Il consiglio è di esportare prima un salvataggio!)');
        if (sicuro) {
          localStorage.removeItem(CHIAVE_SALVATAGGIO);
          location.reload();
        }
      });

      this._cursore = 0;
      this._aggiornaCursoreVoci();
      this.input.keyboard.on('keydown-UP',   () => this._muoviCursoreVoci(-1));
      this.input.keyboard.on('keydown-DOWN', () => this._muoviCursoreVoci(1));
      const conferma = () => { const v = this._voci[this._cursore]; if (v) v.onClick(); };
      this.input.keyboard.on('keydown-ENTER', conferma);
      this.input.keyboard.on('keydown-SPACE', conferma);

      const tornaAlMenu = () => { this.scene.stop(); this.scene.launch('PauseMenuScene'); };
      this.input.keyboard.on('keydown-ESC', tornaAlMenu);
      this.input.keyboard.on('keydown-B', tornaAlMenu);
    }

    _muoviCursoreVoci(delta) {
      if (this._voci.length === 0) return;
      this._cursore = (this._cursore + delta + this._voci.length) % this._voci.length;
      this._aggiornaCursoreVoci();
    }

    _aggiornaCursoreVoci() {
      this._voci.forEach((v, i) => {
        const attivo = i === this._cursore;
        v.pannello.setTint(attivo ? 0xffe9a8 : 0xffffff);
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     FUNZIONE CURA per il Centro Pokémon Tiled
     ══════════════════════════════════════════════════════════ */

  function interagisciCentroTiled() {
    if (typeof stato === 'undefined') return;
    bloccaMovimento();
    if (typeof mostraDialogo === 'function') {
      mostraDialogo('Infermiera Joy', [
        'Benvenuta al Centro Pokémon!',
        'Affidami i tuoi Pokémon, li curerò subito.',
        '...',
        'Ecco, i tuoi Pokémon sono in perfetta forma!',
      ]).then(() => {
        if (stato.squadra) {
          stato.squadra.forEach(p => {
            p.hpAttuale = p.hpMax;
            p.condizione = null;
            if (p.mosse) p.mosse.forEach(m => { m.pp = m.ppMax; });
          });
        }
        if (typeof mostraToast === 'function')
          mostraToast('🏥 Squadra curata!', 3000);
        if (typeof salvaPartita === 'function') salvaPartita();
        sbloccaMovimento();
      });
    }
  }
  window.interagisciCentroTiled = interagisciCentroTiled;

  /* ══════════════════════════════════════════════════════════
     MENU START NATIVO — apertura/chiusura (PROBLEMA 3)
     ══════════════════════════════════════════════════════════ */

  // true per tutta la durata dell'esperienza "menu Start" (lista nativa,
  // Squadra nativa, O il pannello DOM di una sezione non ancora migrata
  // aperto da lì) — usato da app.js per non far reagire ANCHE la tastiera
  // "del mondo" (isA → interagisciVicino, isStart → riapre il menu) mentre
  // il menu nativo sta gestendo lui stesso input/tasti Phaser.
  let menuNativoAperto = false;

  // Tasto Start sulla mappa: mette in pausa GameScene (niente più
  // aggiornamenti/input sulla mappa sotto) e lancia PauseMenuScene a
  // schermo intero. Nasconde anche l'HUD/i pulsanti fluttuanti, che
  // altrimenti resterebbero disegnati sopra la Scene (sono DOM, non
  // Phaser — stesso trattamento già riservato a InteriorScene).
  function apriMenuNativo(sceneKey) {
    if (!phaserGame || !scena) return;
    menuNativoAperto = true;
    ['hud', 'btn-menu', 'btn-velocita', 'dpad', 'btn-volo', 'btn-repellente'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    bloccaMovimento();
    scena.scene.pause();
    // NOTA: qui serve il ScenePlugin di una scena viva (scena.scene), non
    // phaserGame.scene — quest'ultimo dava "launch is not a function"
    // (probabile problema di timing/contesto sull'oggetto SceneManager
    // globale; scena.scene è garantito valido perché scena è la GameScene
    // attiva in questo momento).
    scena.scene.launch(sceneKey || 'PauseMenuScene');
  }

  // Box del PC (modalità 'strumenti', aperto da un PC di un Centro Pokémon —
  // non fa parte della lista del menu Start): stesso ingresso nativo, ma
  // punta a BoxScene invece che a PauseMenuScene.
  function apriBoxNativo() { apriMenuNativo('BoxScene'); }

  // Poké Market (modalità 'strumenti', aperto da un venditore/marker Tiled).
  function apriMarketNativo() { apriMenuNativo('MarketScene'); }

  // Richiamata da app.js quando si esce del tutto dal menu (native B
  // dalla lista principale, o chiusura del pannello DOM di una sezione
  // non ancora migrata): riprende la mappa e ripristina l'HUD.
  function chiudiMenuNativo() {
    menuNativoAperto = false;
    if (scena && scena.scene) scena.scene.resume();
    ['hud', 'btn-menu', 'btn-velocita', 'dpad', 'btn-volo', 'btn-repellente'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.removeProperty('display');
    });
    sbloccaMovimento();
    // Il Follower (sess. 8 set 2026) potrebbe dover cambiare specie se in
    // uno di questi menu (Squadra, Box) il primo Pokémon della squadra è
    // cambiato — unico punto centrale da cui rientrano TUTTI i menu nativi.
    if (scena && scena._aggiornaFollowerSpecie) scena._aggiornaFollowerSpecie();
    if (typeof aggiornaHUD === 'function') aggiornaHUD();
  }
  window.chiudiMenuNativoDaScene = chiudiMenuNativo;

  // Richiamata da app.js quando si chiude una sezione non ancora
  // migrata (Zaino/Recap/Salva): invece di uscire del tutto, torna
  // alla lista nativa del menu Start.
  function tornaAMenuNativo() {
    if (!scena) return;
    scena.scene.launch('PauseMenuScene');
  }

  function menuNativoAttivo() { return menuNativoAperto; }

  /* ══════════════════════════════════════════════════════════
     API PUBBLICA
     ══════════════════════════════════════════════════════════ */

  function inizializza(opzioni) {
    if (opzioni.posizione) posLatLon = { ...opzioni.posizione };
    onPassoCb = opzioni.onPasso || null;
    phaserGame = new Phaser.Game({
      type:            Phaser.AUTO,
      parent:          'mappa',
      backgroundColor: '#000000',
      scene:           [GameScene, InteriorScene, PauseMenuScene, TrainerCardScene, PokedexScene, PokedexDetailScene, OpzioniScene, PartyScene, PartyDetailScene, ZainoScene, ZainoBersaglioScene, RecapScene, SalvaScene, BoxScene, MarketScene],
      scale: {
        mode:       Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true,
      },
      banner: false,
      // Non mette in pausa il game loop quando la tab passa in background/è
      // nascosta — di norma è comodo per il giocatore vero (che ha sempre la
      // tab attiva) e indispensabile per i test automatizzati via tab headless
      // (senza, update()/i tween non avanzano mai e il gioco resta bloccato).
      disableVisibilityChange: true,
    });
  }

  // Attiva l'interazione con l'evento che il giocatore sta guardando (tasto [A]).
  function interagisciVicino() {
    if (!scena || bloccato) return false;
    if (eventoVicino) { scena._interagisci(eventoVicino); return true; }
    return false;
  }

  function bloccaMovimento() {
    bloccato = true;
    // [A] fisso sullo schermo ma non durante dialoghi/battaglie/cutscene:
    // lì non deve fare nulla, meglio nasconderlo invece di lasciarlo lì
    // inerte (era "overlay-interagisci" prima di diventare un pulsante
    // sempre visibile, sess. 5 set 2026).
    const btnEl = document.getElementById('btn-interagisci');
    if (btnEl) btnEl.style.display = 'none';
    if (scena && scena.cursors) {
      try { scena.input.keyboard.resetKeys(); } catch (_) {}
    }
  }

  function sbloccaMovimento() {
    bloccato = false;
    const btnEl = document.getElementById('btn-interagisci');
    if (btnEl) btnEl.style.removeProperty('display');
    if (scena) scena._aggiornaEventoVicino();
  }

  function posizioneGiocatore() { return { ...posLatLon }; }

  function impostaVelocita(v) { velocita = v; }

  function teleporta(pos) {
    posLatLon = { lat: pos.lat, lon: pos.lon };
    if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
  }

  function rimuoviMarkerOggetto(_id) {}

  // Posizione attuale del giocatore in una forma "salvabile" (mappa + casella
  // LOCALE alla mappa membro, non le coordinate globali del cluster — stessa
  // conversione di _coordRitornoMappaStack, necessaria perché caricaMappa/
  // _caricaCluster si aspettano arrivoX/arrivoY locali e sommano da soli
  // l'offset del cluster). Usata da salvaPartitaOra() per riprendere la
  // partita dall'ultima casella invece che sempre da Borgata Tuscolana.
  //
  // Se sei dentro un interno, questa funzione salva la posizione DENTRO
  // così com'è (non "ti sposta fuori"): quello che va salvato A PARTE è lo
  // stack di ritorno (vedi stackAttualeSalvabile), così l'uscita continua a
  // funzionare anche dopo un ricaricamento della pagina.
  function posizioneAttualeSalvabile() {
    if (!mappaCorrente || !posTile) return null;
    let tx = posTile.tx, ty = posTile.ty;
    if (clusterAttivo && clusterBoxes[mappaCorrente]) {
      const box = clusterBoxes[mappaCorrente];
      tx -= box.offsetX; ty -= box.offsetY;
    }
    // PROBLEMA 4a: salva anche se si stava surfando, altrimenti al
    // caricamento il giocatore riappare "a terra" pur essendo su una casella
    // d'acqua — vedi stavaSurfando/create() e _caricaMappaSingola/
    // _caricaCluster più sopra.
    return { chiave: mappaCorrente, tx, ty, surfando: surfAttivo };
  }

  // Copia salvabile dello stack "da dove sono entrato negli interni" (array
  // di { mappa, tx, ty, facciata }, già in coordinate locali). Va ripristinato
  // all'avvio (vedi create() in GameScene) PRIMA di ricaricare l'ultima
  // mappa/casella salvata, altrimenti uscendo da un interno l'uscita non
  // saprebbe più dove riportarti.
  function stackAttualeSalvabile() {
    return mappaStack.map(e => ({ ...e }));
  }

  // Ripristina lo stack di ritorno salvato (chiamata da create() prima del
  // caricaMappa iniziale). Se non c'è nulla di salvato, non tocca lo stack.
  function ripristinaStack(stackSalvato) {
    if (Array.isArray(stackSalvato)) mappaStack = stackSalvato.map(e => ({ ...e }));
  }

  // Debug: stato posizione/telecamera (usato dai test)
  function debugStato() {
    const cam = scena ? scena.cameras.main : null;
    return {
      mappa: mappaCorrente,
      tx: posTile.tx, ty: posTile.ty,
      sprite: playerSprite ? { x: playerSprite.x, y: playerSprite.y, depth: playerSprite.depth, frame: playerSprite.frame && playerSprite.frame.name } : null,
      cam: cam ? { scrollX: cam.scrollX, scrollY: cam.scrollY, zoom: cam.zoom } : null,
      surfAttivo,
      bloccato,
      mountSurf: mountSurfSprite ? { x: mountSurfSprite.x, y: mountSurfSprite.y, depth: mountSurfSprite.depth, frame: mountSurfSprite.frame && mountSurfSprite.frame.name, visible: mountSurfSprite.visible } : null,
      texBaseSurfExists: (scena && scena.textures) ? scena.textures.exists('base-surf') : null,
      veloMeteo: (scena && scena._veloMeteoRect) ? {
        visible: scena._veloMeteoRect.visible, depth: scena._veloMeteoRect.depth,
        fillColor: scena._veloMeteoRect.fillColor, fillAlpha: scena._veloMeteoRect.fillAlpha,
        w: scena._veloMeteoRect.width, h: scena._veloMeteoRect.height,
        tipoParticelle: scena._particelleMeteoTipo,
      } : null,
      emitterMeteo: (scena && scena._emitterMeteo) ? {
        active: scena._emitterMeteo.active, visible: scena._emitterMeteo.visible,
        emitting: scena._emitterMeteo.emitting, depth: scena._emitterMeteo.depth,
        count: scena._emitterMeteo.getParticleCount ? scena._emitterMeteo.getParticleCount() : null,
        x: scena._emitterMeteo.x, y: scena._emitterMeteo.y,
      } : null,
    };
  }

  // Viaggio rapido (MN Volo, eventi): carica una mappa del registro mettendo il
  // giocatore alla casella tx,ty (o a uno spawn_id se passato). Svuota lo stack
  // degli interni così non resti "dentro" un edificio precedente.
  function vaiAMappa(chiave, tx, ty, spawnId) {
    if (!scena) return;
    mappaStack = [];
    return scena.caricaMappa(chiave, tx, ty, spawnId);
  }

  // Debug/test: carica una mappa del registro per chiave (es. 'tuscolo_rovine').
  // spawnId/sourceKey opzionali per simulare l'arrivo da un warp specifico.
  function debugCaricaMappa(chiave, spawnId, sourceKey) {
    if (scena) return scena.caricaMappa(chiave, undefined, undefined, spawnId, sourceKey);
  }


  // Richiamata da app.js ad ogni passo (dopo avanzaTempo()) per aggiornare
  // il velo giorno/notte con l'orario più fresco possibile.
  function aggiornaVeloTempo() {
    if (scena) scena._aggiornaVeloTempo();
  }

  // Richiamata da app.js quando la squadra può essere cambiata da un
  // punto che NON passa da chiudiMenuNativo (es. fine di una cattura in
  // battaglia — se era il primo Pokémon della squadra ad essere vuoto,
  // ora non lo è più): aggiorna lo sprite del Follower senza aspettare il
  // prossimo cambio mappa.
  function aggiornaFollowerSpecie() {
    if (scena) scena._aggiornaFollowerSpecie();
  }

  // Richiamata da app.js dopo ogni ruota del meteo (aggiornaMeteo()), per
  // ridisegnare subito il velo/le particelle sulla mappa corrente.
  function aggiornaVeloMeteo() {
    if (scena) scena._aggiornaVeloMeteo();
  }

  // Contesto meteo della mappa corrente (outdoor/monteCavo), per la ruota
  // casuale in app.js. Vedi _contestoMeteo() sopra.
  function contestoMeteo() {
    return scena ? scena._contestoMeteo() : { outdoor: false, monteCavo: false };
  }

  // Sfondo di battaglia (Battlebacks) in base a dove ci si trova. `opts.acqua`
  // forza il tema "water" (incontro su una casella Surf, a prescindere dalla
  // mappa). Altrimenti: `tema` esplicito sulla mappa (MAPPE[chiave].tema, es.
  // 'cave'/'icecave'), poi 'interior' se `interno:true`, altrimenti 'grass'.
  function temaBattaglia(opts) {
    opts = opts || {};
    if (opts.acqua) return 'water';
    if (mappaInfo && mappaInfo.tema) return mappaInfo.tema;
    if (mappaInfo && mappaInfo.interno) return 'interior';
    return 'grass';
  }

  // Il Volo funziona SOLO "in giro" all'aperto (richiesta esplicita, sess. 5
  // set 2026): mai dentro edifici/interni (centri, market, palestre, case,
  // Abbazia, Via Vittoria, Lega — tutti già `interno:true` in MAPPE) né
  // dentro grotte/dungeon (`tema: 'cave'`/`'icecave'` — tunnel roccioso,
  // Monte Cavo, antri Regi, tuscolo profondo). Prima non c'era NESSUN
  // controllo: si poteva volare da ovunque.
  function mappaConsenteVolo() {
    if (!mappaInfo) return false;
    if (mappaInfo.interno) return false;
    if (mappaInfo.tema === 'cave' || mappaInfo.tema === 'icecave') return false;
    return true;
  }

  // Debug/test: id di NPC e trainer attualmente attivi sulla mappa
  function debugNpcAttivi() {
    return npcStato.map(s => ({ id: s.id, tipo: s.tipo, tx: s.tx, ty: s.ty, dir: s.dir }));
  }
  // Debug/test: esito di una condizione "richiede"/"condizione"
  function debugCondizione(cond) { return verificaCondizione(cond); }
  // Debug/test: chiama un metodo della scena per nome, senza passare dal
  // game loop (utile in tab headless dove requestAnimationFrame non gira,
  // quindi update()/_sposta non scattano mai da soli). Es.:
  // Map.debugChiamaMetodo('_checkOsservatorioConfrontoTrigger')
  function debugChiamaMetodo(nome, ...args) {
    if (!scena || typeof scena[nome] !== 'function') return undefined;
    return scena[nome](...args);
  }
  // Debug/test: elenco grezzo di tutti gli oggetti "spawn" attualmente in
  // eventiMappa (con normalizzazione dell'id, come la vede _trovaSpawn),
  // per capire perché un warp atterra nel punto sbagliato senza dover
  // rientrare/uscire più volte.
  function debugSpawnList() {
    return eventiMappa
      .filter(e => e.tipo === 'spawn' || e.tipo === 'spwan')
      .map(e => ({
        id: e.id, mappaChiave: e._mappaChiave,
        tx: e.tx, ty: e.ty,
        idNorm: String(e.id || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
      }));
  }
  // Debug/test: imposta direttamente posTile (bypassa _sposta/collisioni),
  // utile per posizionare il giocatore su una casella precisa in headless.
  function debugImpostaPosTile(tx, ty) {
    posTile = { tx, ty };
    if (playerSprite) playerSprite.setPosition(tx * tileSize + tileSize / 2, (ty + 1) * tileSize);
  }
  // Debug/test: valore grezzo di collGrid su una casella (1 = solido/bloccato).
  function debugCollisione(tx, ty) {
    if (!collGrid || !collGrid[ty]) return undefined;
    return collGrid[ty][tx];
  }
  // Debug/test: valore LOCALE del tile su ogni layer (depth>0) a una
  // casella — utile per verificare da console cosa c'è davvero scritto
  // senza dover VEDERE lo schermo (headless-friendly).
  function debugValoreTile(tx, ty) {
    const worldX = tx * tileSize + tileSize / 2, worldY = ty * tileSize + tileSize / 2;
    const risultati = [];
    for (const o of layerObjects) {
      const tile = o.layer.getTileAtWorldXY(worldX, worldY, true);
      risultati.push({ depth: o.depth, index: tile ? tile.index : null });
    }
    return risultati;
  }

  // Debug/test: lancia una cutscene di dati/cutscene.js dalla console, senza
  // doverla piazzare su un NPC/oggetto Tiled. Es.: Map.debugCutscene('test_saluto')
  function debugCutscene(cutsceneId) {
    if (scena) return scena._giocaCutscene(cutsceneId);
  }

  // Sfida dei Porchettari (Ariccia): 5 lotte di fila con cameo tra una e
  // l'altra, chiamata da sfidaPorchettari() in app.js dopo il dialogo/orario.
  function avviaSfidaPorchettari() {
    if (scena) return scena.avviaSfidaPorchettari();
  }

  // Sfida dei Parenti di Rocco (Via dei Laghi): 5 lotte di fila, chiamata da
  // sfidaParentiRocco() in app.js dopo il dialogo di apertura.
  function avviaSfidaParentiRocco() {
    if (scena) return scena.avviaSfidaParentiRocco();
  }

  function avviaLatiosLatiasScena() {
    if (scena) return scena.avviaLatiosLatiasScena();
  }

  // Epilogo Rifugio CoTrAL di Rocca di Papa (sess. 12 set 2026): chiamata
  // dall'azione dell'NPC 'gianluca_cotral_rocca' (vedi dati/npc.js e
  // interagisciGianlucaCotralRocca in app.js).
  function avviaEpilogoBasoCotralRocca() {
    if (scena) return scena._epilogoBasoCotralRocca();
  }

  // Lotta del luogotenente/boss dell'Osservatorio, fermi immobili: si parla
  // con loro (azione NPC in app.js), non c'è trigger automatico di vicinanza.
  function avviaLottaOsservatorioSingola(id) {
    if (scena) return scena._avviaLottaOsservatorioSingolaDaId(id);
  }

  return {
    inizializza, bloccaMovimento, sbloccaMovimento, interagisciVicino,
    posizioneGiocatore, distanzaMetri, impostaVelocita,
    teleporta, vaiAMappa, rimuoviMarkerOggetto, debugStato, debugCaricaMappa,
    debugNpcAttivi, debugCondizione, debugChiamaMetodo, debugImpostaPosTile, debugCollisione, debugValoreTile, debugSpawnList,
    temaBattaglia, mappaConsenteVolo, aggiornaVeloTempo,
    aggiornaVeloMeteo, contestoMeteo, aggiornaFollowerSpecie,
    debugCutscene, avviaSfidaPorchettari, avviaSfidaParentiRocco, avviaLatiosLatiasScena,
    avviaEpilogoBasoCotralRocca, avviaLottaOsservatorioSingola,
    posizioneAttualeSalvabile, stackAttualeSalvabile, ripristinaStack,
    apriMenuNativo, apriBoxNativo, apriMarketNativo, chiudiMenuNativo, tornaAMenuNativo, menuNativoAttivo,
  };

})();
