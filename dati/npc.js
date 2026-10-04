/* dati/npc.js — Dati NPC dalle mappe Tiled
   Ogni chiave = id dell'oggetto nel layer "eventi" del .tmj
   sprite: nome file in sprites/npc e trainer per claude/ (senza estensione)
   direzione: nord | sud | est | ovest
   movimento: fisso | random
   dialogo: array di righe
   azione: stringa opzionale — se presente, chiama la funzione globale corrispondente
           invece di mostrare il dialogo generico
   cutscene: stringa opzionale — id di dati/cutscene.js: se presente ha la precedenza
             su azione/dialogo, si gioca una volta sola (poi mostra dialogo_dopo se
             c'è). Per farla ripetere ogni volta: cutsceneUnaTantum: false
*/

// Sprite (provvisorio) di Cenciarels, curatrice del Museo delle Navi: cambia SOLO qui.
const SPRITE_CENCIARELS = 'Scenziato_donna';

const DATI_NPC = {

  /* ── Casa del giocatore e casa del/della rivale, Borgata Tuscolana
     (sess. 2 ott 2026, richiesta di Luca) ── */
  // npc_casamia_1f_1 era "Mamma" (sess. 2 ott): Luca ha chiesto di
  // trasformarla in "Sorella" e aggiungere una vera Mamma a parte (sprite
  // Leader Misty) — vedi npc_casamia_1f_mamma sotto.
  'npc_casamia_1f_1': {
    sprite: 'NPC 02', nome: 'Sorella', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ci siamo trasferiti qui a Via Gasperina da poco, lo sai no?', 'È comoda vicino alla metro.'],
  },
  'npc_casamia_1f_mamma': {
    sprite: 'trainer_LEADER_Misty', nome: 'Mamma', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Allora, ti piace il quartiere nuovo?'],
  },
  'npc_casamia_1f_5': {
    sprite: 'trainer_LEADER_Koga', nome: 'Papà', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Io dico che va bene qui: tranquillo, ma non troppo. Giusto compromesso!'],
  },
  // I due fratelli (i rivali veri) NON abitano più qui: stanno dal
  // professore (richiesta di Luca, 2 ott 2026) — tolti da questa casa.
  'npc_casarivale_1f_mamma': {
    sprite: 'trainer_PSYCHIC_F', nome: 'Mamma', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui non si impara a scuola.', 'Un bambino deve uscire e provvedere da solo, prima o poi.'],
  },
  'npc_casarivale_1f_papa': {
    sprite: 'trainer_SAILOR', nome: 'Papà', direzione: 'sud', movimento: 'fisso',
    dialogo: ['I nostri due sono dal professore, a imparare sul serio.', 'Meglio il mondo vero di un libro.'],
  },

  /* ── Rocca di Papa (5ª città — Palestra Lotta, Baso) ──
     rocca_npc1: riferimento della cutscene "Baso è via" (sessione 8 agosto).
     Prima parte (npc1 nota il giocatore e lo raggiunge) è in
     dati/cutscene.js ('rocca_papa_baso_via'), innescata da
     _checkRoccaBasoTrigger. Qui gestiamo SOLO l'interazione [A]: prima del
     trigger niente di speciale, subito dopo racconta il rapimento e dona la
     MN Forza (una tantum), dopo ancora resta un dialogo di attesa. ── */
  'rocca_npc1': {
    sprite: 'NPC 60', nome: 'Escursionista', direzione: 'nord', movimento: 'fisso',
    azione: 'interagisciRoccaNpc1',
  },

  // Museo delle Navi di Nemi — 2 ostaggi del Team GdF (sessione 12 agosto).
  // Dialogo diverso prima/dopo la sconfitta del capo (stato.flags.museoLiberato).
  'ostaggio_museo_1': {
    sprite: 'scienziato', nome: 'Custode del Museo',
    direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciOstaggioMuseo1',
  },
  'ostaggio_museo_2': {
    sprite: 'scienziato', nome: 'Visitatore spaventato',
    direzione: 'nord', movimento: 'fisso',
    azione: 'interagisciOstaggioMuseo2',
  },

  /* ── Museo delle Navi di Nemi, 2F — scena del Capo GdF (22 set 2026, vedi
     dati/cutscene.js 'museo_navi_intro'). I personaggi della scena sono NPC
     Tiled (layer eventi di Museo_navi_2f) con gate sui flag della scena.
     Ostaggi: due versioni per personaggio, "prigioniero" (sparisce a
     museoLiberato) e "liberato" (compare a museoLiberato). Sprite provvisori
     (filler): li cambia Luca — Cenciarels in UN solo punto, qui sotto. ── */
  'museo_boss': {
    sprite: 'trainer_ROCKETBOSS', nome: 'Capo GdF',   // filler: sprite definitivo da decidere
    direzione: 'est', movimento: 'fisso', dialogo: [],
  },
  'museo_luogotenente': {
    sprite: 'Luogotenente_GdF_2', nome: 'Michela',
    direzione: 'nord', movimento: 'fisso', dialogo: [],
  },
  'museo_grunt_a': { sprite: 'GDF_GRUNT_SPRITE', nome: 'Recluta GdF', direzione: 'sud', movimento: 'fisso', dialogo: [] },
  'museo_grunt_b': { sprite: 'GDF_GRUNT_SPRITE', nome: 'Recluta GdF', direzione: 'sud', movimento: 'fisso', dialogo: [] },

  'museo_cenciarels_prigioniera': {
    sprite: SPRITE_CENCIARELS, nome: 'Cenciarels',
    direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Sono la curatrice del museo... mi costringono a collaborare.', 'Vi prego, fermateli prima che portino via le pietre!'],
  },
  'museo_cenciarels': {
    sprite: SPRITE_CENCIARELS, nome: 'Cenciarels',
    direzione: 'sud', movimento: 'fisso', dialogo: [],
    azione: 'interagisciCenciarels',
  },
  'museo_scienziato_1_prig': {
    sprite: 'trainer_LEADER_Sabrina', nome: 'Scienziata rapita',
    direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Ci hanno rapiti per avere le due pietre!', 'Se non vi sbrigate, le rubano davvero!'],
  },
  'museo_scienziato_1_lib': {
    sprite: 'trainer_LEADER_Sabrina', nome: 'Scienziata',
    direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ancora non ci credo, siamo liberi.', 'Le pietre però sono in pericolo. Sto cercando di capire cosa possiamo fare.'],
  },
  'museo_scienziato_2_prig': {
    sprite: 'NPC 12', nome: 'Scienziato rapito',
    direzione: 'est', movimento: 'fisso',
    dialogo: ['Il GdF ci tiene qui per le pietre... hanno detto che le porteranno via.', 'Ti prego, non farli scappare!'],
  },
  'museo_scienziato_2_lib': {
    sprite: 'NPC 12', nome: 'Scienziato',
    direzione: 'sud', movimento: 'fisso',
    dialogo: ['Grazie a te siamo salvi.', 'Se Cenciarels ti ha dato un fossile, trattalo bene: sono reperti rarissimi.'],
  },

  // Laboratorio del Prof. Castagno (Borgata Tuscolana) — 2 assistenti,
  // sessione 12 agosto. Il primo regala una Pozione una tantum.
  'scienziato_lab_1': {
    sprite: 'scienziato', nome: 'Assistente del professore',
    direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciScienziatoLab1',
  },
  'scienziato_lab_2': {
    sprite: 'scienziato', nome: 'Assistente del professore',
    direzione: 'nord', movimento: 'fisso',
    dialogo: [
      'Il professor Castagno sta preparando qualcosa di grosso nel retro del laboratorio.',
      'Non toccare le provette, per favore!',
    ],
  },
  'rocca_npc2': {
    sprite: 'NPC 61', nome: 'Romolo', direzione: 'ovest', movimento: 'fisso',
    dialogo: ["Maschio delle Faete, Monte Cavo… i due giganti. Da ragazzo ci salivo a piedi. Mo' ce mando il Pokémon."],
  },
  // Gate GdF davanti alla Grotta del Vulcano (Atto 6, STORIA_COMPLETA): sparisce
  // Sess. 1 ott 2026: la condizione sull'oggetto Tiled puntava a 'gdf_sconfitto',
  // un flag MAI impostato da nessuna parte (residuo della vecchia narrativa
  // pre-riscrittura dell'8 settembre) — il gate restava bloccato per sempre.
  // Corretto in 'pietra_zaffiro_ottenuta' (Atto 7 di STORIA_COMPLETA.md: si
  // sblocca quando ottieni la Pietra Zaffiro da Giovanni al Rifugio di
  // Marino — NON quando sconfiggi il grunt qui, che resta liberamente
  // battibile ma non apre nulla da solo, vedi "Prima visita" in quel file).
  'gdf_gate_grotta_vulcano': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Settimia', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Fermo lì. I piani interni restano sigillati finché il Comandante non viene fermato per davvero.'],
  },
  // Infiltrato dentro la Grotta del Vulcano (grotta_vulcano_1f.tmj, sess. 7
  // set 2026): travestito da grunt GdF per non farsi scoprire (stesso sprite
  // dei nemici). Primo dialogo: solo la battuta di presentazione. Da lì in
  // poi, ogni volta che gli riparli, cura la squadra come un Centro Pokémon
  // improvvisato — vedi curaSquadraGrottaVulcano() in js/app.js.
  'gdf_infiltrato_grotta_vulcano': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Recluta GdF', direzione: 'sud', movimento: 'fisso',
    azione: 'curaSquadraGrottaVulcano',
  },
  // Scienziato tenuto prigioniero dal GdF (3° piano, sess. 8 set 2026):
  // SEMPRE visibile fin dall'inizio (è lì, prigioniero, si vede — richiesta
  // esplicita di Luca), ma prima della sconfitta del boss non gli si può
  // parlare per davvero (azione condizionale, vedi parlaScienziatoGrottaVulcano
  // in js/app.js). Il vero "grazie, ecco la Pietra Rubino" parte da solo
  // appena il boss cade (CUTSCENE['grotta_vulcano_boss_dopo']) — l'azione
  // qui è solo per chi prova a parlargli PRIMA di allora, o dopo che se n'è
  // già andato (caso limite, comunque gestito).
  'gdf_scienziato_grotta_vulcano': {
    sprite: 'trainer_SUPERNERD', nome: 'Professor Anselmi', direzione: 'sud', movimento: 'fisso',
    azione: 'parlaScienziatoGrottaVulcano',
  },
  // Giovanni è FISICAMENTE già nella stanza fin dall'inizio (come lo
  // scienziato) — non compare dal nulla dopo la lotta con Levantino, ci
  // sta già, fermo, in disparte (richiesta esplicita di Luca: "non è che
  // deve comparire, deve stare già lì"). Cammina verso il giocatore solo
  // dopo che Levantino è stato sconfitto — vedi _arrivoGiovanniGrottaVulcano
  // in js/map.js, che lo pesca da npcStato per id, esattamente come
  // qualunque altro NPC già piazzato su Tiled.
  'gdf_grotta_vulcano_giovanni': {
    sprite: 'trainer_LEADER_Giovanni', nome: 'Giovanni', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Giovanni non sembra ancora essersi accorto di te.'],
  },
  // Gate palestra Rocca di Papa: sparisce quando stato.flags.baso_tornato è
  // vero (sessione 8 agosto, cutscene "Baso è via").
  'gate_palestra_baso': {
    sprite: 'NPC 09', nome: 'Celso', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Baso non c\'è, non vedi che sta succedendo?'],
  },
  // Gate davanti a casa di Gianluca (operatore funivia, rapito dal CoTrAL):
  // stessa condizione, stesso momento in cui sparisce il gate della palestra.
  'gate_gianluca_casa': {
    sprite: 'NPC 09', nome: 'Fiorella', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui non c\'è più nessuno per far funzionare questo aggeggio.'],
  },
  // Gianluca, liberato: appare SOLO quando stato.flags.baso_tornato è vero
  // (stessa condizione del gate). Primo dialogo una tantum, poi ripetibile
  // con scelta Sì/No per salire a Monte Cavo (interagisciGianluca, app.js).
  'gianluca_liberato': {
    sprite: 'NPC 26', nome: 'Gianluca', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciGianluca',
  },

  // Faustino il funicolarista: dona la MN Volo (richiede 6 Medaglie, vedi DONATORI_MN).
  'faustino_funivia': {
    sprite: 'trainer_HIKER', nome: 'Faustino', direzione: 'sud', movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciDonatoreVolo',
  },

  // Nonna Assunta: dona la MN Surf dopo la vittoria sulla palestra di Monte
  // Porzio E dopo aver battuto suo nipote (trainerRichiesto, vedi
  // DONATORI_MN in data.js, id 'mn-surf'). Sess. 2 ott 2026: spostata
  // dentro casa_sul_lago (prima era all'aperto al Lago di Albano).
  'mn-surf': {
    sprite: 'NPC 09', nome: 'Nonna Assunta', direzione: 'sud', movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciDonatoreSurf',
  },

  /* ── Lago di Albano — spiaggia ── */
  'lago_albano_npc1': {
    sprite: 'Nuotatore_spiaggia_fuori_acqua', nome: 'Dante', direzione: 'sud', movimento: 'random',
    dialogo: ["D'estate qui è pieno de gente. La domenica non trovi manco un asciugamano libero!"],
  },
  // Vive in una casa sul lago (l'utente costruirà l'interno più avanti).
  'lago_albano_npc2': {
    sprite: 'NPC 18', nome: 'Pierina', direzione: 'ovest', movimento: 'fisso',
    dialogo: ["Abito qui sul lago da sempre, in quella casetta. La sera, quando è tutto calmo, senti dei rumori strani venì dall'acqua…"],
  },

  // DEMO cutscene-allo-spawn (sessione di test, vedi js/map.js CUTSCENE_SPAWN
  // e dati/cutscene.js 'demo_vicino_curioso'): resta esattamente dov'è già su
  // Tiled (movimento/direzione invariati, NON toccare il .tmx/.tmj per questo
  // test), la cutscene lo raggiunge camminando dalla sua posizione reale.
  'pallet_oldman': {
    sprite: 'NPC 01', nome: 'Osvaldo',
    direzione: 'sud',
    movimento: 'random',
    dialogo: ['AO NAMOOOO. IL VINO DELI CASTELLIIIII'],
  },

  'pallet_girl': {
    sprite: 'npc girl', nome: 'Italia',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: ['Preso il pokemon si? guarda che qua ti rubano tutto'],
  },

  'pallet_man': {
    sprite: 'NPC 02', nome: 'Alcide',
    direzione: 'ovest',
    movimento: 'fisso',
    dialogo: ['Casa del nipote del professore. Dicono sia abusiva, non entrerei fossi in te'],
  },

  // Gate a nord di Borgata Tuscolana (sess. 29 set 2026, richiesta esplicita
  // di Luca): 5 NPC in fila nel varco tra i due edifici, sotto il cartello
  // "Percorso 1 - Frascati" — impediscono di lasciare la città prima di aver
  // scelto lo starter dal Professore. Spariscono da soli (gate:true,
  // condizione:starterScelto) appena lo scegli.
  'gate_borgata_nord_1': { sprite: 'NPC 03', nome: 'Palmira', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Aspetta! Non puoi andartene senza un Pokémon al tuo fianco.', 'Vai prima dal Professor Castagno, nel laboratorio qui in paese.'] },
  'gate_borgata_nord_2': { sprite: 'NPC 03', nome: 'Ezio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['I Castelli sono pericolosi per chi viaggia da solo, senza un Pokémon!'] },
  'gate_borgata_nord_3': { sprite: 'NPC 03', nome: 'Iole', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il laboratorio è qui in paese: il Professore ti aspetta.'] },
  'gate_borgata_nord_4': { sprite: 'NPC 03', nome: 'Oreste', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Torna indietro: prima lo starter, poi il viaggio!'] },
  'gate_borgata_nord_5': { sprite: 'NPC 03', nome: 'Zaira', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Nessuno passa di qui senza un Pokémon al fianco.'] },

  'prof_castagno': {
    sprite: 'Nuovo_professor_oak', nome: 'Prof. Castagno',   // sprite dedicato (prima era uno swap sul vecchio "npc Rivale")
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciLaboratorio',
  },

  // DUE rivali nel laboratorio (sess. 22 set 2026): destra = uomo/Blue,
  // starter DEBOLE contro il tuo → sfidarlo imposta la modalità FACILE.
  // Sinistra = donna/Red, starter FORTE contro il tuo → modalità DIFFICILE.
  // dialogo:[] perché tutto il testo lo gestisce l'azione (spiegazione +
  // doppia conferma Sì/No + lotta), non un semplice saluto fisso.
  'rivale_debole': {
    sprite: 'RIVALE_1', nome: 'Remo',   // il rivale debole (Blue) è Brendan
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciRivaleDebole',
  },

  'rivale_forte': {
    sprite: 'Rivale_2', nome: 'Remo',   // il rivale forte (Red) è May
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciRivaleForte',
  },

  // Niente "dialogo" qui: interagisciCentroTiled() mostra già il suo saluto
  // completo (benvenuto + cura). Con dialogo+azione insieme, _interagisci
  // li metteva in sequenza mostrando il benvenuto DUE VOLTE (segnalato da
  // Luca, 1 ott 2026).
  'npc_joy': {
    sprite: 'npc joy', nome: 'Infermiera Joy',
    direzione: 'sud',
    movimento: 'fisso',
    azione: 'interagisciCentroTiled',
  },

  /* ── Mercante degli Scambi (Centri Pokémon da Marino in poi): id generico,
     riusabile identico in ogni Centro, gestisce da solo il proprio dialogo. ── */
  'mercante_scambi': {
    sprite: 'NPC 07', nome: 'Mercante degli Scambi', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciMercanteScambi',
  },

  /* ── Stampino Centro Pokémon (tutte le città, sess. 1 ott 2026): id
     condivisi per gli elementi sempre identici dello stampino. ── */
  'npc_cantiere_scale_pokecenter': {
    sprite: 'NPC 15', nome: 'Operaio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il piano di sopra è ancora in ristrutturazione, torna più avanti!'],
  },
  'pokecenter cliente 1': {
    sprite: 'NPC 02', nome: 'Visitatrice', direzione: 'sud', movimento: 'random',
    dialogo: ['Sto aspettando che curino il mio Pokémon.'],
  },
  'pokecenter cliente 2': {
    sprite: 'NPC 03', nome: 'Visitatore', direzione: 'sud', movimento: 'random',
    dialogo: ['Qui al Centro Pokémon ci si riposa sempre bene.'],
  },
  'pokecenter cliente 3': {
    sprite: 'NPC 04', nome: 'Visitatrice', direzione: 'sud', movimento: 'random',
    dialogo: ['Di passaggio anche tu? Buon viaggio per i Castelli!'],
  },

  /* ── Frascati Sud ── */
  'fra_sud_npc1': {
    sprite: 'NPC 01', nome: 'Anselmo', direzione: 'sud', movimento: 'random',
    dialogo: ['Benvenuto a Frascati! Qui se cerchi le vigne sei nel posto giusto.'],
  },
  'fra_sud_npc2': {
    sprite: 'NPC 02', nome: 'Nerina', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['L\'ospedale è laggiù. Ma per i Pokémon meglio il Centro!'],
  },
  'fra_sud_npc3': {
    sprite: 'NPC 03', nome: 'Ampelio', direzione: 'est', movimento: 'random',
    dialogo: ['Dicono che in cima alla collina, alla Villa, ci sia qualcosa di speciale...',
              'Ma i cancelli sono sempre chiusi.'],
  },
  'fra_sud_npc4': {
    sprite: 'NPC 04', nome: 'Teodolinda', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La palestra di Frascati è del tipo Erba. Donnie non perdona!'],
  },

  /* ── Frascati Centro ── */
  'fra_centro_npc1': {
    sprite: 'NPC 05', nome: 'Libero', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La fontana di Piazza San Rocco è bellissima, vero?'],
  },
  'fra_centro_npc2': {
    sprite: 'NPC 06', nome: 'Argia', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Un buon allenatore passa sempre dal Market prima di un viaggio.'],
  },
  'fra_centro_npc3': {
    sprite: 'NPC 07', nome: 'Fra\' Potatore', direzione: 'est', movimento: 'random',
    dialogo: ['Il vino dei Castelli è famoso in tutto il mondo!'],
    azione: 'donaTaglioFrascati',   // dà la MN Taglio dopo la palestra
  },
  'fra_centro_npc4': {
    sprite: 'NPC 08', nome: 'Attilio', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Hai già visitato la Villa Aldobrandini? Si dice apra solo ai Campioni...'],
  },

  /* ── Frascati Est (verso Villa Torlonia e il Percorso 2) ── */
  'fra_est_npc1': {
    sprite: 'NPC 17', nome: 'Diomira', direzione: 'sud', movimento: 'random',
    dialogo: ['Villa Torlonia è qui vicino: è lì che si trova la Palestra di Frascati!'],
  },
  'fra_est_npc2': {
    sprite: 'NPC 18', nome: 'Ilario', direzione: 'nord', movimento: 'fisso',
    dialogo: ['A est si va verso Grottaferrata. Ma prima conviene battere Donnie.'],
  },
  'fra_est_npc3': {
    sprite: 'NPC 19', nome: 'Bruna', direzione: 'est', movimento: 'fisso',
    dialogo: ['I Pokémon Erba sono forti contro Acqua e Terra, ma occhio al Fuoco!'],
  },
  'fra_est_npc4': {
    sprite: 'NPC 20', nome: 'Primo', direzione: 'ovest', movimento: 'random',
    dialogo: ['Riposati al Centro Pokémon prima di sfidare la Palestra.'],
  },

  /* ── Frascati Nord (verso i Boschi del Tuscolo) ── */
  'fra_nord_npc1': {
    sprite: 'NPC 09', nome: 'Adalgisa', direzione: 'sud', movimento: 'fisso',
    dialogo: ['I Boschi del Tuscolo, a nord, sono pieni di Pokémon. Vacci preparato!'],
  },
  'fra_nord_npc2': {
    sprite: 'NPC 10', nome: 'Ottone', direzione: 'ovest', movimento: 'random',
    dialogo: ['Dicono che tra le rovine antiche si nasconda un Pokémon misterioso...'],
  },
  'fra_nord_npc3': {
    sprite: 'NPC 11', nome: 'Everardo', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Questa è la parte alta di Frascati. Che aria fresca!'],
  },
  'fra_nord_npc4': {
    sprite: 'NPC 12', nome: 'Serafino', direzione: 'est', movimento: 'fisso',
    dialogo: ['Un Antidoto fa sempre comodo nei boschi: i Pokémon velenosi non mancano.'],
  },

  /* ── Frascati Ovest (Piazza San Rocco) ── */
  'fra_ovest_npc1': {
    sprite: 'NPC 13', nome: 'Elvira', direzione: 'est', movimento: 'fisso',
    dialogo: ['Benvenuto in Piazza San Rocco, il cuore storico di Frascati.'],
  },
  'fra_ovest_npc2': {
    sprite: 'NPC 14', nome: 'Amleto', direzione: 'nord', movimento: 'random',
    dialogo: ['Quella fontana è bellissima... ma a volte sembra quasi viva.'],
  },
  'fra_ovest_npc3': {
    sprite: 'NPC 15', nome: 'Corinna', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Mio nonno racconta storie strane su questa piazza. Leggende, dice lui.'],
  },
  'fra_ovest_npc4': {
    sprite: 'NPC 16', nome: 'Baldovino', direzione: 'sud', movimento: 'random',
    dialogo: ['Un buon allenatore conosce i tipi dei Pokémon a memoria!'],
  },

  /* ── Tuscolo Ingresso (verso i Boschi del Tuscolo) ── */
  'tusc_ing_npc1': {
    sprite: 'NPC 27', nome: 'Fosca', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Oltre questi alberi iniziano i Boschi del Tuscolo. Tieni gli occhi aperti!'],
  },
  'tusc_ing_npc2': {
    sprite: 'NPC 28', nome: 'Egidio', direzione: 'nord', movimento: 'random',
    dialogo: ['Gli allenatori qui ti sfidano appena ti vedono: non passano oltre!'],
  },
  'tusc_ing_npc3': {
    sprite: 'NPC 29', nome: 'Clorinda', direzione: 'est', movimento: 'fisso',
    dialogo: ['Dicono che tra le antiche rovine del Tuscolo si nasconda qualcosa di raro...'],
  },
  'tusc_ing_npc4': {
    sprite: 'NPC 26', nome: 'Fabrizio', direzione: 'ovest', movimento: 'fisso',  // NPC 30 non esiste: uso NPC 26
    dialogo: ['Con la MN Taglio puoi farti strada tra gli alberi. L\'hai presa a Frascati?'],
  },

  /* ── Venditore del Poké Market di Frascati ── */
  'pokemon market venditore': {
    sprite: 'NPC 21', nome: 'Commesso', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market! Cosa ti serve?'],
    azione: 'apriMarketFrascati',
  },

  /* ── Venditore del Poké Market dentro l'Entrata della Lega Pokémon
     (ex IndigoPlateau_PokemonCenter_1F, estratta da FireRed il 5 ott 2026). ── */
  'pokemon market venditore lega': {
    sprite: 'NPC 21', nome: 'Commesso', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto! Qui trovi solo l\'occorrente per l\'ultima sfida: la Lega Pokémon.'],
    azione: 'apriMarketLega',
  },

  /* ── NPC random dell'Entrata della Lega: parlano dei Superquattro e delle
     loro squadre estratte a sorte (sistema a pool, vedi data.js/battle.js) —
     nessuno sa mai in anticipo chi affronterà davvero. ── */
  'npc_lega_entrata_superquattro_3': {
    sprite: 'NPC 11', nome: 'Allenatore', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Il Superquattro non ha una squadra fissa: ogni sfida pescano 6 Pokémon da un pool più ampio. Non puoi prepararti del tutto!'],
  },
  'npc_lega_entrata_superquattro_4': {
    sprite: 'NPC 12', nome: 'Allenatrice', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ho sentito che ognuno dei Superquattro ha un "Core": il Pokémon più forte del suo pool, esce sempre per ultimo.'],
  },
  'npc_lega_entrata_superquattro_5': {
    sprite: 'NPC 13', nome: 'Lottatore', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Io punto tutto sui tipi: Lotta, Roccia, Buio e Terra per il primo. Ma la squadra cambia ogni volta, quindi occhio.'],
  },
  'npc_lega_entrata_superquattro_6': {
    sprite: 'NPC 14', nome: 'Visitatore', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il Campione è l\'unico che non cambia mai: qui è Remo. Buona fortuna, ne avrai bisogno.'],
  },
  'npc_lega_entrata_superquattro_7': {
    sprite: 'NPC 10', nome: 'Allenatore', direzione: 'est', movimento: 'fisso',
    dialogo: ['Niente leggendari nei pool del Superquattro, almeno quello è garantito.'],
  },
  'npc_lega_entrata_superquattro_8': {
    sprite: 'NPC 09', nome: 'Allenatrice', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Cura bene la squadra prima di entrare: una volta dentro la Lega non si torna indietro facilmente.'],
  },

  /* ── Venditori del Grande Magazzino (ex CeladonCity_DepartmentStore,
     estratto da FireRed il 5 ott 2026) — un negozio per piano (2F-5F,
     il 5F ne ha due). ── */
  'pokemon market venditore dept 2f': {
    sprite: 'NPC 21', nome: 'Commesso', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al 2° piano! Qui trovi Poké Ball di ogni tipo.'],
    azione: 'apriMarketDept2f',
  },
  'pokemon market venditore dept 3f': {
    sprite: 'NPC 21', nome: 'Commessa', direzione: 'sud', movimento: 'fisso',
    dialogo: ['3° piano: oggetti curativi e accessori per l\'allenamento.'],
    azione: 'apriMarketDept3f',
  },
  'pokemon market venditore dept 4f': {
    sprite: 'NPC 21', nome: 'Commesso', direzione: 'sud', movimento: 'fisso',
    dialogo: ['4° piano: MT ed evolutivi, se li trovi li porti a casa.'],
    azione: 'apriMarketDept4f',
  },
  'pokemon market venditore dept 5f': {
    sprite: 'NPC 21', nome: 'Commessa', direzione: 'sud', movimento: 'fisso',
    dialogo: ['5° piano, reparto oggetti rari!'],
    azione: 'apriMarketDept5f',
  },
  'pokemon market venditore dept 5f b': {
    sprite: 'NPC 06', nome: 'Commesso', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Io vendo le chicche più particolari del magazzino.'],
    azione: 'apriMarketDept5fB',
  },

  /* ── NPC random del Grande Magazzino: chiacchiere da centro commerciale,
     ogni piano il suo. ── */
  'npc_dept_random_1': {
    sprite: 'NPC 18', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Questo negozio ha di tutto, potrei passarci la giornata!'],
  },
  'npc_dept_random_2': {
    sprite: 'NPC 15', nome: 'Inserviente', direzione: 'sud', movimento: 'random',
    dialogo: ['Benvenuto al Grande Magazzino! Sei al piano terra.'],
  },
  'npc_dept_random_3': {
    sprite: 'NPC 06', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Le Poké Ball qui costano un po\' care, ma valgono il prezzo.'],
  },
  'npc_dept_random_4': {
    sprite: 'NPC 10', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Dopo lo shopping vado dritto alla Zona Safari, qui vicino.'],
  },
  'npc_dept_random_5': {
    sprite: 'NPC 13', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Sto cercando un regalo per il mio Pokémon preferito.'],
  },
  'npc_dept_random_6': {
    sprite: 'NPC 09', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Le MT qui sopra sono utilissime per completare la squadra.'],
  },
  'npc_dept_random_7': {
    sprite: 'NPC 11', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Certe pietre evolutive si trovano solo qui, lo sapevi?'],
  },
  'npc_dept_random_8': {
    sprite: 'NPC 12', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho comprato le Safari Ball proprio qui, per andare nella Zona Safari.'],
  },
  'npc_dept_random_9': {
    sprite: 'NPC 14', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Che vista dall\'ultimo piano, si vede tutta la città!'],
  },

  /* ── NPC random del Condominio (ex CeladonCity_Condominiums, estratto da
     FireRed il 5 ott 2026): chiacchiere da palazzo residenziale, uno per
     piano come richiesto, nessun venditore/trainer qui. ── */
  'npc_condominio_random_1': {
    sprite: 'NPC 18', nome: 'Inquilino', direzione: 'sud', movimento: 'random',
    dialogo: ['Questo condominio è tranquillo, mi piace abitarci.'],
  },
  'npc_condominio_random_2': {
    sprite: 'NPC 06', nome: 'Inquilina', direzione: 'sud', movimento: 'random',
    dialogo: ['Il mio Pokémon adora passeggiare per i corridoi.'],
  },
  'npc_condominio_random_3': {
    sprite: 'NPC 10', nome: 'Vicino', direzione: 'sud', movimento: 'random',
    dialogo: ['Al piano sopra abita un allenatore piuttosto famoso, dicono.'],
  },
  'npc_condominio_random_4': {
    sprite: 'NPC 13', nome: 'Vicina', direzione: 'sud', movimento: 'random',
    dialogo: ['Le scale sono tante, ma la vista dal tetto vale la salita.'],
  },
  'npc_condominio_random_5': {
    sprite: 'NPC 09', nome: 'Inquilino', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho appena traslocato qui, ancora mi perdo tra i piani.'],
  },
  'npc_condominio_random_6': {
    sprite: 'NPC 11', nome: 'Inquilina', direzione: 'sud', movimento: 'random',
    dialogo: ['Qui si sta benissimo, peccato per le scale senza ascensore.'],
  },
  'npc_condominio_random_7': {
    sprite: 'NPC 12', nome: 'Vicino', direzione: 'sud', movimento: 'random',
    dialogo: ['Mio nonno abita a questo piano da una vita.'],
  },
  'npc_condominio_random_8': {
    sprite: 'NPC 14', nome: 'Vicina', direzione: 'sud', movimento: 'random',
    dialogo: ['Certe sere si sentono rumori strani dal tetto...'],
  },
  'npc_condominio_random_9': {
    sprite: 'NPC 15', nome: 'Inquilino', direzione: 'sud', movimento: 'random',
    dialogo: ['Sto innaffiando le piante sul balcone, torna più tardi se vuoi parlare.'],
  },
  'npc_condominio_random_10': {
    sprite: 'NPC 07', nome: 'Inquilina', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho sentito dire che in cima al palazzo c\'è una stanza segreta.'],
  },
  'npc_condominio_random_11': {
    sprite: 'NPC 08', nome: 'Vicino', direzione: 'sud', movimento: 'random',
    dialogo: ['Siamo arrivati in cima! Che vista magnifica da qui.'],
  },
  'npc_condominio_random_12': {
    sprite: 'NPC 17', nome: 'Vicina', direzione: 'sud', movimento: 'random',
    dialogo: ['Questa stanzetta sul tetto è il mio posto preferito di tutto il palazzo.'],
  },

  /* ── Nonna del Centro Allevamento di Nemi (ex Route117_PokemonDayCare di
     Smeraldo, 5 ott 2026): solo mappa+dialogo placeholder, la meccanica di
     allevamento/uova non esiste ancora nel motore. ── */
  'npc_nemi_daycare_nonna': {
    sprite: 'npc joy', nome: 'Nonna dell\'Asilo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui un giorno potrai lasciarmi due Pokémon affinché facciano amicizia... ma per ora sto solo sistemando il recinto!'],
  },

  /* -- NPC delle case Genzano/Albano estratte da FireRed (sess. 5 ott
     2026, batch_case2.py): un abitante per casa, chiacchiere locali. -- */
  'npc_genzano_casa7_1_1': {
    sprite: 'NPC 09', nome: 'Amedeo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ai miei tempi i Pokemon si allevavano con pazienza, mica con le app.'],
  },
  'npc_genzano_casa7_1_2': {
    sprite: 'NPC 03', nome: 'Dino', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Da grande voglio fare il Capopalestra!'],
  },
  'npc_genzano_casa8_1_1': {
    sprite: 'NPC 04', nome: 'Rosina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il mio gatto non va d accordo coi Pokemon di casa, che muso!'],
  },
  'npc_albano_casadoppia_luxury_1_1': {
    sprite: 'NPC 05', nome: 'Samanta', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Mi sono iscritta al Fan Club, ci vediamo li di sicuro!'],
  },
  'npc_albano_casadoppia_luxury_1_2': {
    sprite: 'NPC 04', nome: 'Marietto', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il mio gatto non va d accordo coi Pokemon di casa, che muso!'],
  },
  'npc_albano_casadoppia_luxury_1_3': {
    sprite: 'NPC 06', nome: 'Il Barone', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Mi sono allenato tutta l estate, provami se vuoi!'],
  },
  'npc_albano_casadoppia_luxury_1_4': {
    sprite: 'NPC 07', nome: 'Signora Pina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Questa casa l ho fatta costruire io, bella eh?'],
  },
  'npc_albano_casadoppia_luxury_1_5': {
    sprite: 'NPC 08', nome: 'Er Metallaro', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui ad Albano si mangia bene, provate le fraschette!'],
  },
  'npc_albano_casadoppia_luxury_1_6': {
    sprite: 'NPC 10', nome: 'Donatella', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La musica e i Pokemon di Roccia, una combinazione vincente.'],
  },
  'npc_albano_casadoppia_luxury_1_7': {
    sprite: 'NPC 11', nome: 'Maestro Nazzareno', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Appena posso mi faccio un giro alla Zona Safari.'],
  },
  'npc_albano_casadoppia_luxury_1_8': {
    sprite: 'NPC 12', nome: 'Passante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['L allenamento non finisce mai, manco in casa.'],
  },
  'npc_albano_casadoppia_luxury_1_9': {
    sprite: 'NPC 14', nome: 'Vicino di casa', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Se cerchi la Zona Safari, sta poco piu in la.'],
  },
  'npc_albano_casadoppia_luxury_1_10': {
    sprite: 'NPC 14', nome: 'Jessica', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Se cerchi la Zona Safari, sta poco piu in la.'],
  },
  'npc_albano_casadoppia_luxury_2_1': {
    sprite: 'NPC 05', nome: 'Carmelina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Hai gia visto la Zona Safari? Dicono sia pazzesca.'],
  },
  'npc_albano_casadoppia_luxury_2_2': {
    sprite: 'NPC 04', nome: 'Sandrino', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Giochiamo a nascondino dietro quella siepe, vieni pure tu!'],
  },
  'npc_albano_casadoppia_luxury_2_3': {
    sprite: 'NPC 06', nome: 'Don Learco', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Mi sono allenato tutta l estate, provami se vuoi!'],
  },
  'npc_albano_casadoppia_luxury_2_4': {
    sprite: 'NPC 07', nome: 'Signora Elsa', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il comfort prima di tutto, caro il mio allenatore.'],
  },
  'npc_albano_casadoppia_luxury_2_5': {
    sprite: 'NPC 08', nome: 'Robbo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui ad Albano si mangia bene, provate le fraschette!'],
  },
  'npc_albano_casadoppia_luxury_2_6': {
    sprite: 'NPC 10', nome: 'Fiorella', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La musica e i Pokemon di Roccia, una combinazione vincente.'],
  },
  'npc_albano_casadoppia_luxury_2_7': {
    sprite: 'NPC 11', nome: 'Sensei Learco', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Appena posso mi faccio un giro alla Zona Safari.'],
  },
  'npc_albano_casadoppia_luxury_2_8': {
    sprite: 'NPC 12', nome: 'Curiosone', direzione: 'sud', movimento: 'fisso',
    dialogo: ['L allenamento non finisce mai, manco in casa.'],
  },
  'npc_albano_casadoppia_luxury_2_9': {
    sprite: 'NPC 14', nome: 'Fortunato', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Se cerchi la Zona Safari, sta poco piu in la.'],
  },
  'npc_albano_casadoppia_luxury_2_10': {
    sprite: 'NPC 14', nome: 'Toto', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Se cerchi la Zona Safari, sta poco piu in la.'],
  },
  'npc_albano_casa7_1_1': {
    sprite: 'NPC 09', nome: 'Remigio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ai miei tempi i Pokemon si allevavano con pazienza, mica con le app.'],
  },
  'npc_albano_casa7_1_2': {
    sprite: 'NPC 03', nome: 'Peppino', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Da grande voglio fare il Capopalestra!'],
  },
  'npc_albano_casa7_2_1': {
    sprite: 'NPC 09', nome: 'Sid', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui si vive bene, tranquillo e con una bella vista.'],
  },
  'npc_albano_casa7_2_2': {
    sprite: 'NPC 03', nome: 'Sor Augusto', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Hai visto quanti turisti per la sagra?'],
  },
  'npc_albano_casa7_3_1': {
    sprite: 'NPC 09', nome: 'Sor Italo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ai miei tempi i Pokemon si allevavano con pazienza, mica con le app.'],
  },
  'npc_albano_casa7_3_2': {
    sprite: 'NPC 03', nome: 'Sor Learco', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Hai visto quanti turisti per la sagra?'],
  },
  'npc_albano_casa5_1_1': {
    sprite: 'NPC 10', nome: 'Graziella', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ho visto gente partire per la Zona Safari stamattina presto.'],
  },
  'npc_albano_casa5_1_2': {
    sprite: 'NPC 13', nome: 'Lucilla', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La Zona Safari attira gente da tutto il Lazio.'],
  },
  'npc_albano_casa5_2_1': {
    sprite: 'NPC 10', nome: 'Morena', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La musica e i Pokemon di Roccia, una combinazione vincente.'],
  },
  'npc_albano_casa5_2_2': {
    sprite: 'NPC 13', nome: 'Lallo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La Zona Safari attira gente da tutto il Lazio.'],
  },
  'npc_albano_casa5_3_1': {
    sprite: 'NPC 10', nome: 'Cavalier Osvaldo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ho visto gente partire per la Zona Safari stamattina presto.'],
  },
  'npc_albano_casa5_3_2': {
    sprite: 'NPC 13', nome: 'Signora Iole', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Albano e cresciuta tanto dall anno scorso.'],
  },
  'npc_albano_casa6_1_1': {
    sprite: 'NPC 11', nome: 'Maestro Attilio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Appena posso mi faccio un giro alla Zona Safari.'],
  },
  'npc_albano_casa6_2_1': {
    sprite: 'NPC 11', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Questa casa luxury e proprio bella, vero?'],
  },
  'npc_albano_casa6_3_1': {
    sprite: 'NPC 11', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Questa casa luxury e proprio bella, vero?'],
  },

  /* -- NPC del Condominio x2 di Albano (clone di celadon_condominio,
     sess. 5 ott 2026): parlano della Zona Safari come richiesto. -- */
  'npc_albano_condominio_a_random_1': {
    sprite: 'NPC 03', nome: 'Ferdinando', direzione: 'sud', movimento: 'random',
    dialogo: ['Da quassu si vede benissimo il cancello della Zona Safari.'],
  },
  'npc_albano_condominio_a_random_2': {
    sprite: 'NPC 04', nome: 'Wanda', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho sentito dire che nella Zona Safari ci sono Pokemon introvabili altrove.'],
  },
  'npc_albano_condominio_a_random_3': {
    sprite: 'NPC 05', nome: 'Learco', direzione: 'sud', movimento: 'random',
    dialogo: ['Il mio vicino lavora come guida alla Zona Safari, un lavoro fantastico.'],
  },
  'npc_albano_condominio_a_random_4': {
    sprite: 'NPC 06', nome: 'Palmira', direzione: 'sud', movimento: 'random',
    dialogo: ['La sera si vedono le luci della Zona Safari da questa finestra.'],
  },
  'npc_albano_condominio_a_random_5': {
    sprite: 'NPC 07', nome: 'Osvaldo', direzione: 'sud', movimento: 'random',
    dialogo: ['Dicono che per entrare nella Zona Safari servano palline speciali.'],
  },
  'npc_albano_condominio_a_random_6': {
    sprite: 'NPC 08', nome: 'Ines', direzione: 'sud', movimento: 'random',
    dialogo: ['Albano e tranquilla, a parte il viavai per la Zona Safari.'],
  },
  'npc_albano_condominio_a_random_7': {
    sprite: 'NPC 09', nome: 'Dario', direzione: 'sud', movimento: 'random',
    dialogo: ['Da quassu si vede benissimo il cancello della Zona Safari.'],
  },
  'npc_albano_condominio_a_random_8': {
    sprite: 'NPC 10', nome: 'Concetta', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho sentito dire che nella Zona Safari ci sono Pokemon introvabili altrove.'],
  },
  'npc_albano_condominio_a_random_9': {
    sprite: 'NPC 11', nome: 'Aldo', direzione: 'sud', movimento: 'random',
    dialogo: ['Il mio vicino lavora come guida alla Zona Safari, un lavoro fantastico.'],
  },
  'npc_albano_condominio_a_random_10': {
    sprite: 'NPC 12', nome: 'Pierina', direzione: 'sud', movimento: 'random',
    dialogo: ['La sera si vedono le luci della Zona Safari da questa finestra.'],
  },
  'npc_albano_condominio_a_random_11': {
    sprite: 'NPC 13', nome: 'Bruno', direzione: 'sud', movimento: 'random',
    dialogo: ['Dicono che per entrare nella Zona Safari servano palline speciali.'],
  },
  'npc_albano_condominio_a_random_12': {
    sprite: 'NPC 14', nome: 'Adele', direzione: 'sud', movimento: 'random',
    dialogo: ['Albano e tranquilla, a parte il viavai per la Zona Safari.'],
  },
  'npc_albano_condominio_b_random_13': {
    sprite: 'NPC 03', nome: 'Enzo', direzione: 'sud', movimento: 'random',
    dialogo: ['Anche da questo palazzo si arriva a piedi alla Zona Safari.'],
  },
  'npc_albano_condominio_b_random_14': {
    sprite: 'NPC 04', nome: 'Lina', direzione: 'sud', movimento: 'random',
    dialogo: ['I turisti passano sempre di qui per andare alla Zona Safari.'],
  },
  'npc_albano_condominio_b_random_15': {
    sprite: 'NPC 05', nome: 'Attilio', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho provato la Zona Safari la settimana scorsa, fantastica esperienza.'],
  },
  'npc_albano_condominio_b_random_16': {
    sprite: 'NPC 06', nome: 'Rina', direzione: 'sud', movimento: 'random',
    dialogo: ['Qui in condominio parliamo spesso di chi ha preso i Pokemon piu rari alla Zona Safari.'],
  },
  'npc_albano_condominio_b_random_17': {
    sprite: 'NPC 07', nome: 'Mario', direzione: 'sud', movimento: 'random',
    dialogo: ['Il custode dice che presto apriranno una nuova area della Zona Safari.'],
  },
  'npc_albano_condominio_b_random_18': {
    sprite: 'NPC 08', nome: 'Ada', direzione: 'sud', movimento: 'random',
    dialogo: ['Vivere qui vicino alla Zona Safari ha i suoi vantaggi.'],
  },
  'npc_albano_condominio_b_random_19': {
    sprite: 'NPC 09', nome: 'Sergio', direzione: 'sud', movimento: 'random',
    dialogo: ['Anche da questo palazzo si arriva a piedi alla Zona Safari.'],
  },
  'npc_albano_condominio_b_random_20': {
    sprite: 'NPC 10', nome: 'Ida', direzione: 'sud', movimento: 'random',
    dialogo: ['I turisti passano sempre di qui per andare alla Zona Safari.'],
  },
  'npc_albano_condominio_b_random_21': {
    sprite: 'NPC 11', nome: 'Franco', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho provato la Zona Safari la settimana scorsa, fantastica esperienza.'],
  },
  'npc_albano_condominio_b_random_22': {
    sprite: 'NPC 12', nome: 'Elvira', direzione: 'sud', movimento: 'random',
    dialogo: ['Qui in condominio parliamo spesso di chi ha preso i Pokemon piu rari alla Zona Safari.'],
  },
  'npc_albano_condominio_b_random_23': {
    sprite: 'NPC 13', nome: 'Guido', direzione: 'sud', movimento: 'random',
    dialogo: ['Il custode dice che presto apriranno una nuova area della Zona Safari.'],
  },
  'npc_albano_condominio_b_random_24': {
    sprite: 'NPC 14', nome: 'Maria', direzione: 'sud', movimento: 'random',
    dialogo: ['Vivere qui vicino alla Zona Safari ha i suoi vantaggi.'],
  },

  /* -- Scienziato del Laboratorio Rianimazione Fossili di Genzano (sess. 5
     ott 2026): consegna un fossile + 5000, aspetta un giorno, il Pokemon
     arriva direttamente nel Box. Vedi interagisciRianimaFossiliGenzano. -- */
  'npc_rianima_fossili_genzano': {
    sprite: 'scienziato', nome: 'Scienziato', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciRianimaFossiliGenzano',
  },

  /* -- Scuola di Albano (ex ViridianCity_School, 5 ott 2026): i due anziani
     Ricorda Mosse ed Elimina Mosse. Vedi interagisciRicordaMosse/
     interagisciEliminaMosse in app.js. -- */
  'npc_albano_ricorda_mosse': {
    sprite: 'NPC 09', nome: 'Anziano', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciRicordaMosse',
  },
  'npc_albano_elimina_mosse': {
    sprite: 'NPC 08', nome: 'Vecchietta', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciEliminaMosse',
  },

  /* -- Maso (CoTrAL), 1a apparizione: Osservatorio_2f.tmj, sess. 6 ott
     2026. Appare solo DENTRO la cutscene (condizione: maso_osservatorio_
     attivo, impostata/tolta da _cutsceneBossFinaleOsservatorio in map.js),
     niente azione: lo script lo pilota direttamente via npcStato. -- */
  'maso_cotral_osservatorio_2f': {
    sprite: 'Grunt_Cotral_uomo', nome: 'Maso', direzione: 'est', movimento: 'fisso',
  },

  /* ── Cliente generico dentro i Poké Market: id condiviso identico in
     ogni città (stesso oggetto Tiled ripetuto 3 volte nello stampino) —
     una sola voce basta per tutte le istanze. ── */
  'dentro il market cliente 1': {
    sprite: 'NPC 18', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Le nuove Poké Ball sono formidabili, dovresti provarle!'],
  },
  'dentro il market cliente 2': {
    sprite: 'NPC 06', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Quelle pozioni ti salvano contro i trainer più forti.'],
  },
  'dentro il market cliente 3': {
    sprite: 'NPC 13', nome: 'Cliente', direzione: 'sud', movimento: 'random',
    dialogo: ['Gli status vanno sempre curati, procurati l\'oggetto giusto!'],
  },

  /* ── Market di Grottaferrata (mappa dedicata, sessione 8 agosto — prima
     riusava il file/venditore di Frascati) ── */
  'pokemon market venditore grottaferrata': {
    sprite: 'NPC 21', nome: 'Sidonia', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Grottaferrata! Cosa ti serve?'],
    azione: 'apriMarketGrottaferrata',
  },

  /* ── Avventori di contorno nei Centri Pokémon (solo due chiacchiere,
     nessuna azione) — sessione 8 agosto, "variare" i Pokécenter. ── */
  'npc_pokecenter_grottaferrata_1': {
    sprite: 'NPC 17', nome: 'Dorotea', direzione: 'sud', movimento: 'random',
    dialogo: ["L'Abbazia di San Nilo è proprio lì fuori. Ci ho lasciato il mio Abra in custodia, per dire."],
  },
  'npc_pokecenter_marino_1': {
    sprite: 'NPC 12', nome: 'Clodoveo', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho fatto surf tutto il giorno sul lago. I miei Pokémon acqua sono distrutti quanto me.'],
  },
  'npc_pokecenter_rocca_di_papa_1': {
    sprite: 'NPC 09', nome: 'Isolina', direzione: 'sud', movimento: 'random',
    dialogo: ["Qui l'aria di montagna fa bene, ma i miei Pokémon Roccia non hanno mai freddo comunque."],
  },
  'npc_pokecenter_genzano_1': {
    sprite: 'NPC 14', nome: 'Baldassarre', direzione: 'sud', movimento: 'random',
    dialogo: ["Sei arrivato apposta per l'Infiorata? È lo spettacolo dell'anno, qui a Genzano."],
  },

  /* ── Market di Marino (mappa dedicata) ── */
  'pokemon market venditore marino': {
    sprite: 'NPC 21', nome: 'Fioravante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Marino! Cosa ti serve?'],
    azione: 'apriMarketMarino',
  },
  'venditore speciale marino': {
    sprite: 'NPC 07', nome: 'Serafina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Io vendo solo roba rara: pietre evolutive e oggetti da scambio. Dacci un\'occhiata.'],
    azione: 'apriVenditoreSpecialeMarino',
  },

  /* ── Marino: Snorlax addormentato + guardia con parola d'ordine (sess. 37).
     Posizioni segnaposto nel .tmj, l'utente le sposta dove preferisce. ── */
  'npc_flauto_marino': {
    sprite: 'NPC 09', nome: 'Il Suonatore', direzione: 'est', movimento: 'fisso',
    azione: 'donaFlautoMarino',
  },
  'npc_password_marino': {
    sprite: 'NPC 10', nome: 'Comare Ersilia', direzione: 'est', movimento: 'fisso',
    azione: 'rivelaParolaMarino',
  },
  'guardia_marino': {
    sprite: 'NPC 11', nome: 'Guardia', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Alt! Non ti fo passà se non conosci la parola d\'ordine.'],
  },

  /* ── Via dei Laghi — gate verso Percorso 7 (narrativa sessione 41: la Spiaggia di
     Albano/MN Surf si sblocca solo dopo Rocca di Papa). Property Tiled: gate:true,
     condizione:"medaglie >= 5" (soglia scelta di default: 5ª medaglia = Rocca di
     Papa, coerente con "vincendo Rocca di Papa si sblocca l'accesso al Percorso 7 e
     la Spiaggia di Albano" — da confermare/aggiustare con Luca). */
  'guardia_via_dei_laghi_p7': {
    sprite: 'NPC 12', nome: 'Guardia forestale', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Da qui in poi il sentiero è franoso, nun se passa senza esperienza.',
      'Torna quando avrai qualche Medaglia in più.',
    ],
  },

  /* ── Market di Castel Gandolfo (mappa dedicata) ── */
  'pokemon market venditore castel gandolfo': {
    sprite: 'NPC 21', nome: 'Amilcare', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Castel Gandolfo! Cosa ti serve?'],
    azione: 'apriMarketCastelGandolfo',
  },
  'venditore speciale castel gandolfo': {
    sprite: 'NPC 07', nome: 'Bibiana', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Roba di importazione, dritta dalla Villa Pontificia. Oggetti evolutivi introvabili altrove.'],
    azione: 'apriVenditoreSpecialeCastelGandolfo',
  },

  /* ── Market di Albano Laziale (mappa dedicata) ── */
  'pokemon market venditore albano': {
    sprite: 'NPC 21', nome: 'Cesarina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Albano! Cosa ti serve?'],
    azione: 'apriMarketAlbano',
  },
  'venditore speciale albano': {
    sprite: 'NPC 07', nome: 'Gervasio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Pietre evolutive e oggetti da scambio, roba per chi fa sul serio. Costano care, però.'],
    azione: 'apriVenditoreSpecialeAlbano',
  },

  /* ── Market di Genzano (mappa dedicata, solo warp+market questa sessione,
     nessuna palestra) ── */
  'pokemon market venditore genzano': {
    sprite: 'NPC 21', nome: 'Fioralba', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Genzano! Cosa ti serve?'],
    azione: 'apriMarketGenzano',
  },
  /* ── Gate lato Via dei Laghi verso Percorso 12 (sessione 8 agosto, seconda
     parte) — blocca il passaggio, nessuna condizione: rimuoverlo/aggiungere
     una condizione quando Percorso 12 sarà davvero pronto. ── */
  'npc_gate_percorso_12': {
    sprite: 'NPC 09', nome: 'Venanzia', direzione: 'sud', movimento: 'fisso',
    dialogo: ['🚧 Lavori in corso, non si passa! Prova a tornare più avanti.'],
  },

  'venditore speciale genzano': {
    sprite: 'NPC 07', nome: 'Anselmo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Pietre evolutive, qui a due passi dall\'Infiorata. Prezzi da vera fiera, eh.'],
    azione: 'apriVenditoreSpecialeGenzano',
  },

  /* ── Market di Monte Porzio Catone (mappa dedicata) ── */
  'pokemon market venditore monteporzio': {
    sprite: 'NPC 21', nome: 'Learco', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Monte Porzio! Cosa ti serve?'],
    azione: 'apriMarketMonteporzio',
  },
  'venditore speciale monteporzio': {
    sprite: 'NPC 07', nome: 'Palmira', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui all\'Osservatorio ci arrivano cose rare da tutta Italia. Pietre evolutive, a prezzo giusto per la qualità.'],
    azione: 'apriVenditoreSpecialeMonteporzio',
  },

  /* ── Market di Rocca di Papa (mappa dedicata) ── */
  'pokemon market venditore rocca di papa': {
    sprite: 'NPC 21', nome: 'Sabino', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Rocca di Papa! Cosa ti serve?'],
    azione: 'apriMarketRoccaDiPapa',
  },
  'venditore speciale rocca di papa': {
    sprite: 'NPC 07', nome: 'Ermelinda', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Vieni dal cratere, eh? Allora ti servirà qualche pietra evolutiva. Ce l\'ho, ma non regalo niente.'],
    azione: 'apriVenditoreSpecialeRoccaDiPapa',
  },

  /* ── Market di Ariccia (mappa dedicata, sessione 6 agosto) ── */
  'pokemon market venditore ariccia': {
    sprite: 'NPC 21', nome: 'Adalgiso', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Ariccia! Cosa ti serve?'],
    azione: 'apriMarketAriccia',
  },
  'venditore speciale ariccia': {
    sprite: 'NPC 07', nome: 'Serafina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui ad Ariccia le pietre le teniamo all\'ombra, così durano di più. Cosa ti serve?'],
    azione: 'apriVenditoreSpecialeAriccia',
  },

  /* ── BOSCHETTO SEGRETO (post-Lega) ── */
  // Guardiano: blocca il sentiero finché non hai completato la Lega (gate nel TMJ).
  // Compare SOLO finché la condizione "post_lega" è falsa (lo gestisce map.js).
  'bosch_guardiano': {
    sprite: 'NPC_GUARDIA', nome: 'Filiberto', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Ehi, aspetta.',
      'Questo sentiero porta a qualcuno che non incontra chiunque.',
      'Prima dimostra il tuo valore: sconfiggi la Lega di Colonna.',
      'Poi torna qui.',
    ],
  },

  // NPC che appare DOPO aver sconfitto Il Solitario (condizione: il_solitario_sconfitto).
  'il_solitario_post': {
    // "Il Solitario" ha un nome vero: Simone (richiesta esplicita di Luca,
    // sess. 19 set 2026, sprite dedicato).
    sprite: 'Simone', nome: 'Simone', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Celebi vive in questo bosco da prima che esistesse Tuscolo.',
      'Non si mostra a chiunque. Ma ora che mi hai battuto...',
      '...forse ti considera degno.',
      'Cammina nell\'erba alta del Tuscolo. Ha una piccola probabilità di apparire ad ogni passo.',
      'Non usare repellenti. E abbi pazienza.',
    ],
  },

  /* ── Percorso 2 (castagneti collinari) ── */
  'p2_npc1': {
    sprite: 'NPC 21', nome: 'Ortensia',
    direzione: 'sud',
    movimento: 'random',
    dialogo: [
      'I castagni dei Castelli so\' famosi! D\'autunno qui è tutto un profumo.',
      'Dicono che nel laghetto laggiù ci stiano Pokémon grossi... ma senza saper nuotare non ci arrivi.',
    ],
  },
  'p2_npc2': {
    sprite: 'NPC 22', nome: 'Gaudenzio',
    direzione: 'ovest',
    movimento: 'fisso',
    dialogo: [
      'Stai andando a Grottaferrata? La palestra lì è di tipo Psico.',
      'Tieni a mente: contro gli Psico, i tipi Buio e Coleottero danno filo da torcere.',
    ],
  },

  /* ── Percorso 3 (campagna verso il lago, Grottaferrata → Marino) ──
     Sprite NPC_65/66/67 non ancora in sprites/: il motore assegna un filler
     stabile per id finché non aggiungi i file. */
  'p3_npc1': {
    sprite: 'NPC_65', nome: 'Armida',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Continui a scendere e arrivi a Marino. Famosa per la Sagra dell\'Uva, sai?',
      'La palestra di Marino è di tipo Acqua. Porta qualcosa di tipo Erba o Elettro.',
    ],
  },
  'p3_npc2': {
    sprite: 'NPC_66', nome: 'Teofilo',
    direzione: 'nord',
    movimento: 'random',
    dialogo: [
      'Da quassù, nelle giornate limpide, si vede luccicare il lago Albano.',
      'Ma per arrivarci sull\'acqua serve la MN Surf... e quella la trovi più avanti.',
    ],
  },
  'p3_npc3': {
    sprite: 'NPC_67', nome: 'Rosalba',
    direzione: 'ovest',
    movimento: 'fisso',
    dialogo: [
      'Quel masso laggiù non lo sposta nessuno a mani nude.',
      'Dicono che serva un Pokémon con la MN Forza per toglierlo di mezzo.',
    ],
  },

  /* ── Grottaferrata (Abbazia di San Nilo) ──
     grotta_npc1 ha già il dialogo inline nel .tmj. Qui gli altri. */
  'grotta_npc2': {
    sprite: 'NPC_51', nome: 'Giacinto',
    direzione: 'est',
    movimento: 'random',
    dialogo: [
      'Igino, il Capopalestra, medita all\'alba. Non sottovalutarlo: la sua mente è affilata.',
      'Contro gli Psico, porta Pokémon Buio o Coleottero, se sei furbo.',
    ],
  },
  'grotta_npc3': {
    sprite: 'NPC_52', nome: 'Eufemia',
    direzione: 'est',
    movimento: 'fisso',
    dialogo: [
      'L\'Abbazia di San Nilo è qui dal 1004. Mille anni di silenzio... e di Pokémon Psico.',
    ],
  },
  'grotta_npc4': {
    sprite: 'NPC_53', nome: 'Celestino',
    direzione: 'sud',
    movimento: 'random',
    dialogo: [
      'Quei tizi in divisa vicino all\'abbazia non mi piacciono per niente. Dicono di essere della "GdF"...',
    ],
  },
  'parcheggio_npc5': {
    sprite: 'NPC_54', nome: 'Marianna',
    direzione: 'ovest',
    movimento: 'fisso',
    dialogo: [
      'Di notte, al parcheggione, si vedono luci strane in cielo.',
      'Mio cugino giura di aver visto una stella... cadere proprio lì dietro.',
    ],
  },
  'monaco_abbazia': {
    sprite: 'NPC_MONACO', nome: 'Terzilio',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Pace a te, pellegrino. Questa è l\'Abbazia di San Nilo.',
      'La quiete della mente è la vera forza. Igino te lo mostrerà.',
    ],
  },
  // Porta dell'Abbazia presidiata dal Team GdF: BLOCCO che sparisce con 7 Medaglie
  // (gate + condizione "medaglie>=7"). Finché è lì, sbarra l'ingresso all'Abbazia.
  'gdf_porta_abbazia': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Gelsomina',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Ehi, tu! Qui non si entra. Ordini del Comandante.',
      'L\'Abbazia è... chiusa per "manutenzione". Torna quando sarai qualcuno — diciamo, con sette Medaglie.',
    ],
  },
  // Sess. 1 ott 2026: prima aveva lo stesso id/dialogo di gdf_porta_abbazia
  // (copia-incolla in Tiled) — era lo stesso identico sbarramento su due
  // mappe diverse. Separato con id e battute proprie: questo è il cancello
  // del "parcheggione" di Grottaferrata (base di lancio, arruolamento
  // astronauti post-Lega, vedi CLAUDE.md — Deoxys).
  'guardia_parcheggione': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Benvenuto',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Area riservata. Accesso solo al personale della base di lancio.',
      'Le selezioni per il programma spaziale sono chiuse a chi non ha ancora vinto la Lega Pokémon. Mi spiace.',
    ],
  },

  /* ── Lago di Nemi — Atto 4 (Museo delle Navi): gate GdF ──
     Compare SOLO quando stato.flags.documentoVillaOttenuto è vero (Atto 3,
     Castel Gandolfo): prima di allora il museo è normale/non presidiato.
     Property Tiled: condizione: documentoVillaOttenuto (senza gate:true,
     quindi appare solo a condizione vera). Blocca l'accesso finché non si
     costruisce/risolve la scena del furto delle Orb (Atto 4). */
  'gdf_gate_nemi': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Assuntina',
    direzione: 'nord',
    movimento: 'fisso',
    dialogo: [
      'Fermo lì! Il Museo è "chiuso per inventario". Ordini della Fulvia.',
      'Le navi de Nemi nasconnono quarcosa che ce serve. Nun te fa i cazzi tua e vattene.',
    ],
  },

  /* ── Castel Gandolfo (angolo nord-est, davanti alla Villa Pontificia occupata dal GdF) ── */
  'cg_villa_custode': {
    sprite: 'NPC 07', nome: 'Romualdo',
    direzione: 'nord',
    movimento: 'fisso',
    dialogo: [
      'Quei soldati... hanno preso il controllo della Villa da un giorno all\'altro.',
      'Ho visto un documento con disegni antichi: mostri dell\'acqua e della terra.',
      'Se vuoi passare, io ci penserei due volte. Sono armati fino ai denti coi Pokémon.',
    ],
  },

  /* ── Monte Porzio Catone (4ª città, Osservatorio INAF) ── */
  'monteporzio_npc2': {
    sprite: 'NPC_51',
    nome: 'Adelaide',
    direzione: 'est',
    movimento: 'random',
    dialogo: [
      'Qui a Monte Porzio si vede tutto il Tuscolo, se non c\'è foschia.',
      'Stella, la Capopalestra, si allena all\'Osservatorio: dice che i lampi le danno la carica.',
    ],
  },
  'monteporzio_npc3': {
    sprite: 'NPC_52',
    nome: 'Ottavio',
    direzione: 'est',
    movimento: 'fisso',
    dialogo: [
      'L\'Osservatorio studia il cielo sopra i Castelli da generazioni.',
      'Con gli Elettro serve prontezza: colpiscono per primi, quasi sempre.',
    ],
  },
  'monteporzio_npc4': {
    sprite: 'NPC_53',
    nome: 'Palmira',
    direzione: 'sud',
    movimento: 'random',
    dialogo: [
      'Da qualche settimana girano tizi con la divisa di una cooperativa di trasporti, la "CoTrAL".',
      'Dicono che facciano ricerca... ma non li ho mai visti caricare un solo pacco.',
    ],
  },
  'monteporzio_ruggero': {
    sprite: 'NPC 07',
    nome: 'Ruggero',
    direzione: 'est',
    movimento: 'fisso',
    dialogo: [
      'Ruggero, meteorologo: studio i temporali sul colle da vent\'anni.',
      'L\'ultima tempesta è stata... strana. Lampi che non finivano mai, tutti nello stesso punto.',
    ],
  },
  // Gate all'Osservatorio: sparisce a 4 medaglie
  'scienziato osservatorio': {
    sprite: 'scienziato',
    nome: 'Dott. Anselmi',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Alt! L\'Osservatorio è chiuso al pubblico per la manutenzione degli strumenti.',
      'Torna con qualche Medaglia in più, magari capiremo se sei affidabile.',
    ],
  },
  // Gate verso Via Vittoria: sparisce a 8 medaglie
  'controllore': {
    sprite: 'controllore',
    nome: 'Genoveffo',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Via Vittoria è riservata agli Allenatori con tutte le Medaglie dei Castelli.',
      'Otto medaglie, non una di meno. Regole della Lega.',
    ],
  },

  /* ── Albano Laziale (6ª città — Palestra Roccia, Giorgia, cap 46) ──
     albano_npc1/2 già esistenti nel .tmj (mai cablati finora — albano_npc2
     resta libero). albano_npc3..6 sono nuovi (world Castelli_lasthree). ── */
  // Riapprendi mosse (Move Relearner, sessione 31 agosto): riusa il dot
  // "albano_npc1" già presente su albano.tmj, mai assegnato a nessuno prima.
  'albano_npc1': {
    sprite: 'NPC 09', nome: 'Maestro delle Mosse', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciRiapprendiMosse',
  },
  'albano_npc3': {
    sprite: 'NPC 07', nome: 'Perpetua', direzione: 'sud', movimento: 'random',
    dialogo: ['Albano Laziale, Palestra Roccia! Giorgia non fa sconti a nessuno.'],
  },
  'albano_npc4': {
    sprite: 'NPC 21', nome: 'Clemente', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Il Lago Albano è proprio qui vicino. Con la MN Surf ce fai il giro completo.'],
  },
  'albano_npc5': {
    sprite: 'NPC 09', nome: 'Addolorata', direzione: 'est', movimento: 'random',
    dialogo: ["Medaglia Scudo, la chiamano. Giorgia l'ha vinta a suon di pietra contro pietra."],
  },
  'albano_npc6': {
    sprite: 'NPC 17', nome: 'Policarpo', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Da qui se parte verso Ariccia. Dicono che pure lì c\'è \'na palestra tosta.'],
  },

  /* ── Percorso 8 (Albano → Ariccia): Porchettari, allusione alla Sagra e alla
     Piuma Iridescente di Ho-Oh (STORIA_COMPLETA, catena post-lega). Solo
     dialogo per ora, nessuna meccanica attiva. ── */
  'porchettaro_p8_1': {
    sprite: 'NPC 09', nome: 'Concetta', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Ariccia? Ah, la Sagra della Porchetta! Quest\'anno se dice che sarà \'na cosa grossa...',
      'Pare che pure quelli der CoTrAL se so\' fatti vedè da quelle parti. Boh, io penso solo a la porchetta.',
    ],
  },
  'porchettaro_p8_2': {
    sprite: 'NPC 11', nome: 'Romeo', direzione: 'ovest', movimento: 'fisso',
    dialogo: [
      'Se vai ad Ariccia, cerca Adriano: fa la porchetta più bona de tutto er Lazio.',
      'Dicono che sa cose strane... roba vista sur Ponte, all\'alba. Ma io nun me impiccio.',
    ],
  },

  /* ── Ariccia (7ª città — Palestra Buio, Ombretta, cap 52) ──
     Adriano il Porchettaro e i suoi colleghi alludono alla catena Ho-Oh
     (4 grunt CoTrAL → Piuma Iridescente, STORIA_COMPLETA): per ora solo
     dialogo, la meccanica dei grunt/quest arriverà con F10/F11. ── */
  'ariccia_npc1': {
    sprite: 'NPC 07', nome: 'Letizia', direzione: 'sud', movimento: 'random',
    dialogo: ["Ariccia è famosa pe' le fraschette e la porchetta! Ma occhio a Ombretta, la capopalestra: i su' Pokémon Buio non se vedono arrivà."],
  },
  'ariccia_npc2': {
    sprite: 'NPC 21', nome: 'Raniero', direzione: 'est', movimento: 'fisso',
    dialogo: ['Er Ponte de Ariccia è \'na meraviglia, lo vedi da ogni angolo della città. Dicono pure che de notte è meglio non passacce...'],
  },
  'ariccia_npc3': {
    sprite: 'NPC 17', nome: 'Pasqualina', direzione: 'ovest', movimento: 'random',
    dialogo: ["Medaglia Fraschetta, se chiama. Buffo, no? Ma i lottatori de tipo Buio nun so' mica da ride."],
  },
  'ariccia_npc4': {
    sprite: 'NPC 09', nome: 'Severino', direzione: 'sud', movimento: 'fisso',
    dialogo: ["Ho visto certi tipi strani girà co' furgoni CoTrAL dalle parti der locale d'Adriano. A me nun me piace pe' niente."],
  },
  'ariccia_npc5': {
    sprite: 'NPC 18', nome: 'Imelda', direzione: 'nord', movimento: 'random',
    dialogo: ['Da piccolo mi dicevano che sur Ponte, all\'alba, se po\' vedè \'na cosa che brilla. Leggende, dice mi padre.'],
  },
  'adriano_porchettaro': {
    sprite: 'NPC 22', nome: 'Adriano', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Ehi, viaggiatore! Io so\' Adriano, faccio la porchetta più bona de li Castelli.',
      'Da \'ste parti girano de quei tipacci co\' la divisa CoTrAL. Nun me piaceno pe\' gnente.',
      'Quarcuno l\'ha vista pure sur Ponte, all\'alba... \'na piuma che brillava. Ma chi ce crede.',
    ],
  },
  'porchettaro_ar_1': {
    sprite: 'NPC 26', nome: 'Costantino', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Preparativi pe\' la Sagra! Quest\'anno ce sarà \'na sorpresa, dice Adriano.'],
  },
  'porchettaro_ar_2': {
    sprite: 'NPC 27', nome: 'Rosaria', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Se sconfiggi quei tipacci der CoTrAL che infastidiscono Adriano, quello se ricorda de te, fidete.'],
  },
  'porchettaro_ar_3': {
    sprite: 'NPC 28', nome: 'Calisto', direzione: 'est', movimento: 'fisso',
    dialogo: ['All\'Infiorata de Genzano c\'hanno i fiori, qui ad Ariccia c\'avemo la porchetta! Ognuno cor su\' vanto.'],
  },

  // Sfida dei Porchettari (sessione 5 agosto): solo tra le 23:00 e le 02:00,
  // 5 lotte di fila con cameo tra una e l'altra, premio la Piuma. Vedi
  // sfidaPorchettari() in js/app.js e GameMap.avviaSfidaPorchettari in js/map.js.
  'ariccia_sfida_porchettari': {
    sprite: 'NPC 15', nome: 'Learco', direzione: 'sud', movimento: 'fisso',
    azione: 'sfidaPorchettari',
  },

  // Sfida dei Parenti di Baso (Via dei Laghi): 5 lotte di fila, stesso
  // schema dei Porchettari ma senza finestra oraria. Vittoria a tutte e 5 →
  // stato.flags.famiglia_rocco_battuta e compare 'via_laghi_infermiera'
  // (condizione, vedi sotto) che cura la squadra ogni volta che le parli.
  // (nomi tecnici flag/azione/chiave lasciati invariati, invisibili al giocatore)
  'via_laghi_sfida_rocco': {
    sprite: 'NPC 20', nome: 'Ilario', direzione: 'sud', movimento: 'fisso',
    azione: 'sfidaParentiRocco',
  },
  'via_laghi_infermiera': {
    // Cesira è la mamma di Baso (richiesta esplicita di Luca, sess. 19 set
    // 2026, sprite dedicato "Mamma_Baso" — la rivelazione narrativa, non
    // solo un cambio di grafica).
    sprite: 'Mamma_Baso', nome: 'Cesira', direzione: 'sud', movimento: 'fisso',
    condizione: 'famiglia_rocco_battuta',
    azione: 'curaSquadraViaLaghi',
  },

  // Pensione Pokémon di Nemi (F9.3): deposita 1-2 Pokémon, se compatibili
  // (M+F stessa specie, o Ditto + chiunque) dopo un po' di passi insieme
  // nasce un uovo che il giocatore ritira e porta in squadra fino alla schiusa.
  'pensione_nemi': {
    sprite: 'NPC 27', nome: 'Reginella', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciPensione',
  },

  /* ── Tunnel Roccioso 4F — scena Latios/Latias (sessione 6 agosto) ── */
  'npc_latios_latias_tunnel': {
    sprite: 'NPC 09', nome: 'Celestino', direzione: 'sud', movimento: 'fisso',
    azione: 'avviaLatiosLatiasScena',
  },
  'ariccia_sagra_1': {
    sprite: 'NPC 08', nome: 'Agnese', direzione: 'ovest', movimento: 'fisso',
    dialogo: ["Stasera se beve e se magna fino a spaccà! Vieni pe' la Sagra, nun te ne pentirai!"],
  },
  'ariccia_sagra_2': {
    sprite: 'NPC 13', nome: 'Evaristo', direzione: 'est', movimento: 'fisso',
    dialogo: ["Hai sentito? Dicono che stanotte i Porchettari cercano uno sfidante vero. Io nun me ce butterei, eh."],
  },

  // NPC "chiacchiera" a Castel Gandolfo e Via dei Laghi (sess. 28 set 2026,
  // richiesta esplicita di Luca): spiegano perché Monte Porzio si raggiunge
  // solo passando dal Tunnel Roccioso — un enorme Pokémon addormentato
  // blocca la strada diretta (il nuovo Snorlax che Luca ha spostato sul
  // Percorso 5). Posizionati vicino a punti di passaggio reali (lo spawn che
  // arriva dal Percorso 5 a Castel Gandolfo, l'ingresso del Tunnel Roccioso
  // a Via dei Laghi) — posizione da verificare/aggiustare in Tiled se non
  // torna esattamente sul sentiero.
  'npc_gigante_dormiente_gandolfo': {
    sprite: 'NPC 05', nome: 'Viandante', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Se stai andando a Monte Porzio, scordati la strada diretta.',
      'C\'è un Pokémon enorme addormentato in mezzo al Percorso 5: nessuno riesce a smuoverlo, russa che sembra un tuono.',
      'Devi passare dal Tunnel Roccioso, oltre Via dei Laghi. Più lungo, ma almeno ci si passa.',
    ],
  },
  'npc_gigante_dormiente_laghi': {
    sprite: 'NPC 11', nome: 'Escursionista', direzione: 'nord', movimento: 'fisso',
    dialogo: [
      'Il Tunnel Roccioso, proprio qui davanti, è l\'unica strada rimasta per Monte Porzio.',
      'Quella sul Percorso 5 è bloccata da un colosso che dorme della grossa: nessuno ha il coraggio di svegliarlo.',
      'Dicono che serva qualcosa di speciale per farlo alzare. Io intanto vado di qua.',
    ],
  },

  // Blocco stradale del Team GdF verso Genzano (sess. 28 set 2026, richiesta
  // esplicita di Luca): tre grunt in fila bloccano il passaggio "per la Sagra
  // della Porchetta" — la scusa vera è guadagnare tempo. Spariscono da soli
  // (gate:true, condizione:sagra_ariccia_finita) appena vinci l'8ª... anzi la
  // 7ª palestra (Ariccia stessa): il gioco non lo dice mai esplicitamente,
  // il giocatore lo scopre solo continuando ad avanzare.
  'grunt_sagra_1': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Marcellina', direzione: 'est', movimento: 'fisso',
    dialogo: ['Alt! Nessuno passa: prima la Sagra della Porchetta, poi tutto il resto.'],
  },
  'grunt_sagra_2': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Aristide', direzione: 'est', movimento: 'fisso',
    dialogo: ['Hai sentito il collega? La porchetta viene prima di tutto. Levate!'],
  },
  'grunt_sagra_3': {
    sprite: 'GDF_GRUNT_SPRITE', nome: 'Veronica', direzione: 'est', movimento: 'fisso',
    dialogo: ['Genzano può aspettare. Qui si mangia.'],
  },

  /* ── Zona Safari — ingresso a pagamento (world Castelli_lasthree) ──
     npc_ingresso_safari fa pagare il biglietto (pagaIngressoSafari, app.js) e
     setta stato.flags.safari_pagato; guardia_safari (gate:true su Tiled,
     condizione:"safari_pagato") blocca il varco finché non è pagato. ── */
  'npc_ingresso_safari': {
    sprite: 'NPC 15', nome: 'Custode della Riserva', direzione: 'sud', movimento: 'fisso',
    azione: 'pagaIngressoSafari',
  },
  'guardia_safari': {
    sprite: 'NPC 11', nome: 'Guardia', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Alt! Prima devi pagare il biglietto d\'ingresso al custode.'],
  },

  /* ── Rifugio CoTrAL di Rocca di Papa — cutscene con Baso (sess. 12 set
     2026): tutti questi marcatori sono type:'npc' (non 'trainer'), anche
     Marcello e i 2 grunt "forti", apposta — un oggetto 'trainer' normale
     sarebbe sfidabile a sé stante premendo [A] (bypassando la doppia con
     Baso), quindi qui restano solo decorativi/dialogo: la VERA lotta parte
     solo da _cutsceneBasoCotralRocca (js/map.js), che legge le squadre da
     DATI_TRAINER direttamente, senza passare da _avviaLottaTrainer. ── */
  // Prima della cutscene è irraggiungibile (movimento bloccato); dopo la
  // vittoria (cotral_rocca_boss_sconfitto) resta qui, interagibile con un
  // semplice promemoria — la scena vera parte parlando con GIANLUCA, non con
  // lui (vedi gianluca_cotral_rocca sotto + interagisciGianlucaCotralRocca in
  // app.js). Sparisce insieme a Gianluca solo a epilogo concluso
  // (cotral_rocca_finale — narrativamente riaccompagna Gianluca a casa).
  // ATTENZIONE: gate/condizione/noTestBypass per QUESTI NPC vivono sulle
  // proprietà dell'oggetto Tiled (Rifugio_cotral_rocca.tmj/.tmx), non qui —
  // _creaNpcStato() legge ev.props, mai i campi di dati/npc.js. Metterli qui
  // (errore commesso e corretto sess. 12 set 2026: "schermo nero ma non
  // sparisce nessuno") non ha ALCUN effetto sulla visibilità.
  'baso_rocca_cutscene': {
    sprite: 'trainer_ELITEFOUR_Bruno', nome: 'Baso', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciBasoCotralRocca',
  },
  'cotral_marcello_rocca_npc': {
    sprite: 'Luogotenente_Cotral_Osservatorio', nome: 'Marcello', direzione: 'sud', movimento: 'fisso',
    dialogo: ['(Marcello è troppo preso dalla discussione con Baso per notarti.)'],
  },
  'cotral_grunt_forte_1_npc': {
    sprite: 'Grunt_Cotral_uomo', nome: 'Addetto Scelto', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non è ancora il momento. Aspetta il tuo turno.'],
  },
  'cotral_grunt_forte_2_npc': {
    sprite: 'Grunt_Cotral_donna', nome: 'Addetta Scelta', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non è ancora il momento. Aspetta il tuo turno.'],
  },
  // Grunt decorativi (solo scenografia, "tutta la gente è lì" — richiesta di
  // Luca): spariscono insieme al resto quando la cutscene finisce.
  'cotral_grunt_deco_1': {
    sprite: 'COTRAL_GRUNT_SPRITE', nome: 'Olimpio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai visto niente.'],
  },
  'cotral_grunt_deco_2': {
    sprite: 'COTRAL_GRUNT_SPRITE', nome: 'Desolina', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai visto niente.'],
  },
  'cotral_grunt_deco_3': {
    sprite: 'COTRAL_GRUNT_SPRITE', nome: 'Erminio', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai visto niente.'],
  },
  // Visibile fin dall'inizio (ostaggio, parte della scenografia della
  // cutscene — "c'è anche Gianluca" nella specifica di Luca), RESTA visibile
  // anche dopo la vittoria (a differenza di Marcello/grunt, che spariscono
  // subito): parlargli è ciò che fa scattare l'epilogo vero (Baso si avvicina
  // e ringrazia, vedi _epilogoBasoCotralRocca in js/map.js). Sparisce insieme
  // a Baso solo a epilogo concluso (cotral_rocca_finale).
  'gianluca_cotral_rocca': {
    sprite: 'Gianluca Funivia', nome: 'Gianluca', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciGianlucaCotralRocca',
  },

  /* ── Colonna (città finale, post-Lega — sess. 14 set 2026) ── */

  // Gate: bloccano il passaggio finché non si è finita la Lega ("Colle
  // Sant'Andrea bloccato per la partita di calcio", richiesta di Luca —
  // condizione condivisa con tutto il resto del post-game). Nessun
  // noTestBypass: sono gate "mondani", non fanno parte di una scena da
  // testare — MODALITA_TEST li salta come tutti gli altri gate semplici.
  'gate_colonna_calcio_1': {
    sprite: 'NPC 15', nome: 'Candida', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Non si passa: il Colle Sant\'Andrea è bloccato per la partita di calcio!', 'Torna dopo aver finito la Lega, magari le cose si saranno calmate.'],
    gate: true, condizione: 'legaCompletata',
  },
  'gate_colonna_calcio_2': {
    sprite: 'NPC 16', nome: 'Venceslao', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Anche da qui è bloccato, eh! Il Colle Sant\'Andrea è tutto occupato per la partita.', 'Prova a tornare quando avrai finito con la Lega.'],
    gate: true, condizione: 'legaCompletata',
  },

  // Market e Erborista (dentro pokemon-castelli-poke_market_colonna.tmj).
  'pokemon market venditore colonna': {
    sprite: 'NPC 21', nome: 'Palmira', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market di Colonna! Qui trovi solo roba seria, da fine avventura.'],
    azione: 'apriMarketColonna',
  },
  'erborista colonna': {
    sprite: 'Erborista_colonna', nome: 'Erborista', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Niente batte i vecchi rimedi di una volta: amari, ma funzionano sempre.'],
    azione: 'apriErboristaColonna',
  },

  // NPC che parlano della Lega (semplice colore, sess. 14 set 2026).
  'colonna_npc_lega_1': {
    sprite: 'NPC 12', nome: 'Tifoso della Lega', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Siamo arrivati fin qui! Si sente l\'energia nell\'aria, la Lega è proprio dietro l\'angolo.'],
  },
  'colonna_npc_lega_2': {
    sprite: 'NPC 08', nome: 'Anziano di Colonna', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Il Campione è imbattuto da anni, dicono. Ci vuole una squadra fortissima per sfidarlo.'],
  },

  // NPC che, uno alla volta, rivelano il mistero della statua CoTrAL in
  // piazza (richiesta esplicita di Luca: "a pezzi da più npc" — il
  // giocatore deve parlarci con 4/5 per farsi un'idea completa).
  'colonna_npc_cotral_lore_1': {
    sprite: 'NPC 02', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Hai visto quella statua enorme in piazza? Il Team CoTrAL l\'ha tirata su dal nulla, in una notte.'],
  },
  'colonna_npc_cotral_lore_2': {
    sprite: 'NPC 04', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Dicono che la salutano ogni mattina all\'alba, tutti in fila. Strano, per gente che dovrebbe occuparsi di autobus.'],
  },
  'colonna_npc_cotral_lore_3': {
    sprite: 'NPC 05', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Ho sentito dire che vogliono controllare il meteo... ma che c\'entra una statua con la pioggia?'],
  },
  'colonna_npc_cotral_lore_4': {
    sprite: 'NPC 09', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Prima erano solo tizi con la tuta arancione, ora si comportano come una setta. Io la piazza la evito, di sera.'],
  },
  'colonna_npc_cotral_lore_5': {
    sprite: 'NPC 14', nome: 'Abitante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qualcuno dice che la statua raffigura un Pokémon leggendario. Io non ci ho mai creduto ai leggendari... ma dopo quella cosa lì, chissà.'],
  },

  // NPC col look del Team CoTrAL: NON sono allenatori (type 'npc', non
  // 'trainer' — niente sfida), solo scontrosi, e camminano in giro per la
  // piazza (movimento:'random', già supportato dal motore). Richiesta
  // esplicita di Luca.
  'colonna_cotral_npc_1': {
    sprite: 'Grunt_Cotral_uomo', nome: 'Addetto CoTrAL', direzione: 'sud', movimento: 'random',
    dialogo: ['Non hai niente di meglio da fare che disturbarmi?'],
  },
  'colonna_cotral_npc_2': {
    sprite: 'Grunt_Cotral_donna', nome: 'Addetta CoTrAL', direzione: 'sud', movimento: 'random',
    dialogo: ['Togliti dai piedi. Non abbiamo tempo per i turisti.'],
  },

  /* ── Osservatorio CoTrAL (sess. 15 set 2026) — gate/condizione vivono
     SEMPRE sulle proprietà dell'oggetto Tiled (Osservatorio_*f.tmj), MAI
     qui (lezione della sessione scorsa: "schermo nero ma non sparisce
     nessuno" — qui sotto solo sprite/dialogo/azione). ── */

  'camilla_uscita_genzano': {
    sprite: 'trainer_LEADER_Camilla', nome: 'Camilla', direzione: 'sud', movimento: 'fisso',
    dialogo: ['(Camilla sembra volerti dire qualcosa.)'],
  },
  'camilla_confronto_osservatorio': {
    sprite: 'trainer_LEADER_Camilla', nome: 'Camilla', direzione: 'sud', movimento: 'fisso',
    dialogo: ['(Camilla sta discutendo animatamente con due addetti CoTrAL.)'],
  },
  'cotral_osservatorio_grunt_ext_1': {
    sprite: 'Grunt_Cotral_uomo', nome: 'Addetto CoTrAL', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Fermo lì. Zona non autorizzata.'],
  },
  'cotral_osservatorio_grunt_ext_2': {
    sprite: 'Grunt_Cotral_donna', nome: 'Addetta CoTrAL', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non è un buon momento per fare domande.'],
  },

  // Receptionist 1F: visibile SOLO prima della rivelazione, poi sparisce e
  // basta (non "diventa" un grunt come gli altri — richiesta esplicita).
  'osservatorio_receptionist': {
    sprite: 'NPC 04', nome: 'Receptionist', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto all\'Osservatorio! Studiamo il clima dei Castelli Romani, prego, faccia pure un giro.'],
  },

  // Ricercatori "di copertura" (visibili SOLO prima della rivelazione) — 7
  // in tutto sui 3 piani, uno per ogni grunt in cui "si trasformano". Ora
  // liberi di girare (movimento:'random', bocciate le coppie ferme in
  // scatola) — stesso raggio dell'oggetto Tiled gemello.
  // I due ricercatori sotto NON sono CoTrAL (a differenza di quasi tutti gli
  // altri qui dentro): civili veri, mai coinvolti nel complotto — servono a
  // seminare il dubbio sui leggendari-uccello e il meteo (richiesta esplicita
  // di Luca, sess. 28 set 2026: "iniziamo a mettere il dubbio").
  'osservatorio_ricercatore_1f_a': { sprite: 'NPC 02', nome: 'Ricercatore', direzione: 'sud', movimento: 'random', dialogo: [
    'Stiamo analizzando le anomalie di temperatura di quest\'anno. Dati interessanti, devo dire.',
    'Sa una cosa strana? Studiando i leggendari abbiamo capito che alcuni uccelli influenzano il meteo. Zapdos, per dirne uno, si aggira spesso qui intorno a Monte Porzio.',
    'Se qualcuno riuscisse a "convincerlo" a restare... potrebbe pilotare il tempo a piacimento. Per fortuna è solo teoria, eh.',
  ] },
  'osservatorio_ricercatore_1f_b': { sprite: 'NPC 08', nome: 'Ricercatrice', direzione: 'sud', movimento: 'random', dialogo: ['Abbiamo installato nuovi sensori pluviometrici. Presto sapremo di più.'] },
  'osservatorio_ricercatore_1f_c': { sprite: 'NPC 12', nome: 'Ricercatore', direzione: 'sud', movimento: 'random', dialogo: ['Il direttore è molto impegnato ultimamente. Riunioni su riunioni.'] },
  'osservatorio_ricercatore_2f_a': { sprite: 'NPC 15', nome: 'Ricercatrice', direzione: 'sud', movimento: 'random', dialogo: [
    'Il secondo piano è dedicato all\'analisi dei dati satellitari.',
    'Tra noi ricercatori è quasi una leggenda: certi uccelli leggendari — mica solo Zapdos — sembrano legati a pioggia, sole e temporali.',
    'Chissà chi, prima o poi, ci proverà davvero a sfruttarlo. Sarebbe una follia. Ma anche un\'occasione enorme.',
  ] },
  'osservatorio_ricercatore_2f_b': { sprite: 'NPC 19', nome: 'Ricercatore', direzione: 'sud', movimento: 'random', dialogo: ['Quelle statue? Un regalo del direttore. Un po\' stravagante, lo ammetto.'] },
  'osservatorio_ricercatore_3f_a': { sprite: 'NPC 25', nome: 'Ricercatrice', direzione: 'sud', movimento: 'random', dialogo: ['Quassù teniamo gli strumenti più sensibili. Non tocchi nulla, per favore.'] },
  'osservatorio_ricercatore_luogotenente': { sprite: 'NPC 28', nome: 'Direttrice', direzione: 'sud', movimento: 'random', dialogo: ['Sono la responsabile di questo piano. Se ha domande sul clima, chieda pure pubblicazioni ufficiali.'] },

  // Grunt CoTrAL "veri" (visibili SOLO dopo la rivelazione, finché non
  // vengono battuti — vedi _checkOsservatorioGruntTrigger, ora 2 CONTRO 1
  // con Camilla alleata, ognuno solo e libero di girare).
  'cotral_osservatorio_1f_a': { sprite: 'Grunt_Cotral_uomo', nome: 'Addetto CoTrAL', direzione: 'sud', movimento: 'random', dialogo: ['Il rifugio è scoperto. Fatti sotto, se hai il coraggio.'] },
  'cotral_osservatorio_1f_b': { sprite: 'Grunt_Cotral_donna', nome: 'Addetta CoTrAL', direzione: 'sud', movimento: 'random', dialogo: ['Non dovevi vedere niente di tutto questo.'] },
  'cotral_osservatorio_1f_c': { sprite: 'Grunt_Cotral_uomo', nome: 'Addetto CoTrAL', direzione: 'sud', movimento: 'random', dialogo: ['Qui dentro comandiamo noi, ricordatelo.'] },
  'cotral_osservatorio_2f_a': { sprite: 'Grunt_Cotral_donna', nome: 'Addetta CoTrAL', direzione: 'sud', movimento: 'random', dialogo: ['Sei arrivato più a fondo di chiunque altro. Fin qui, però.'] },
  'cotral_osservatorio_2f_b': { sprite: 'Grunt_Cotral_uomo', nome: 'Addetto CoTrAL', direzione: 'sud', movimento: 'random', dialogo: ['La statua non è un semplice ornamento, sai? Ma questo non ti riguarda.'] },
  'cotral_osservatorio_3f_a': { sprite: 'Grunt_Cotral_donna', nome: 'Addetta CoTrAL', direzione: 'sud', movimento: 'random', dialogo: ['Ultimo piano, ultima possibilità di andartene.'] },
  // Fermo immobile: si parla con lui per iniziare la lotta (azione), NON ha
  // un dialogo di saluto separato — dati.dialogo_prima (DATI_TRAINER) è già
  // la battuta pre-lotta, mostrarne un'altra qui la duplicherebbe.
  'cotral_osservatorio_luogotenente': { sprite: 'Capo_Cotral', nome: 'Luogotenente', direzione: 'sud', movimento: 'fisso', azione: 'interagisciLuogotenenteOsservatorio' },

  // Ricercatori "ignari" (sess. 15 set 2026): NON diventano mai grunt,
  // sempre presenti (nessun gate), solo la battuta cambia dopo la
  // rivelazione — vedi interagisciRicercatoreIgnaro1f/2f/3f in app.js.
  'osservatorio_ricercatore_ignaro_1f': { sprite: 'NPC 17', nome: 'Ricercatore', direzione: 'sud', movimento: 'random', azione: 'interagisciRicercatoreIgnaro1f' },
  'osservatorio_ricercatore_ignaro_2f': { sprite: 'NPC 18', nome: 'Ricercatrice', direzione: 'sud', movimento: 'random', azione: 'interagisciRicercatoreIgnaro2f' },
  'osservatorio_ricercatore_ignaro_3f': { sprite: 'NPC 24', nome: 'Ricercatore', direzione: 'sud', movimento: 'random', azione: 'interagisciRicercatoreIgnaro3f' },

  // Boss CoTrAL (2F): la battuta minacciosa a distanza (_checkOsservatorioBossTrigger)
  // resta come primo assaggio; la lotta finale vera è una cutscene a parte
  // (_cutsceneBossFinaleOsservatorio in map.js, sess. 18 set 2026), niente
  // azione qui — il boss non si interagisce col tasto [A], parte tutto dal
  // rettangolo trigger piazzato da Luca su Osservatorio_2f.tmj.
  'cotral_boss_osservatorio': {
    sprite: 'NPC', nome: 'Comandante', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai idea di cosa stiamo per scatenare. Ma questo... è un discorso per un\'altra volta.'],
  },
  // Comparse della cutscene finale del boss (sess. 18 set 2026): 3 ricercatori
  // + 2 grunt che ascoltano il Comandante mentre spiega il piano meteo, tutti
  // fissi, nessuna azione/dialogo proprio — sono scenografia della cutscene,
  // non NPC interagibili. Compaiono/spariscono insieme al boss stesso (stesso
  // flag sintetico 'osservatorio_boss_area_attiva', vedi map.js).
  'osservatorio_boss_ricercatore_1': { sprite: 'NPC 19', nome: 'Ricercatore', direzione: 'sud' },
  'osservatorio_boss_ricercatore_2': { sprite: 'NPC 20', nome: 'Ricercatrice', direzione: 'sud' },
  'osservatorio_boss_ricercatore_3': { sprite: 'NPC 21', nome: 'Ricercatore', direzione: 'sud' },
  'osservatorio_boss_grunt_1': { sprite: 'Grunt_Cotral_uomo', nome: 'Addetto CoTrAL', direzione: 'sud' },
  'osservatorio_boss_grunt_2': { sprite: 'Grunt_Cotral_donna', nome: 'Addetta CoTrAL', direzione: 'sud' },

};
