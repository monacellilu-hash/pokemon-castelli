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

const DATI_NPC = {

  /* ── Rocca di Papa (5ª città — Palestra Lotta, Baso) ──
     rocca_npc1: riferimento della cutscene "Baso è via" (sessione 8 agosto).
     Prima parte (npc1 nota il giocatore e lo raggiunge) è in
     dati/cutscene.js ('rocca_papa_baso_via'), innescata da
     _checkRoccaBasoTrigger. Qui gestiamo SOLO l'interazione [A]: prima del
     trigger niente di speciale, subito dopo racconta il rapimento e dona la
     MN Forza (una tantum), dopo ancora resta un dialogo di attesa. ── */
  'rocca_npc1': {
    sprite: 'NPC 60', direzione: 'nord', movimento: 'fisso',
    azione: 'interagisciRoccaNpc1',
  },

  // Museo delle Navi di Nemi — 2 ostaggi del Team GdF (sessione 12 agosto).
  // Dialogo diverso prima/dopo la sconfitta del capo (stato.flags.museo_nemi_password).
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
    sprite: 'NPC 61', direzione: 'ovest', movimento: 'fisso',
    dialogo: ["Maschio delle Faete, Monte Cavo… i due giganti. Da ragazzo ci salivo a piedi. Mo' ce mando il Pokémon."],
  },
  // Gate GdF davanti alla Grotta del Vulcano (Atto 6, STORIA_COMPLETA): sparisce
  // quando stato.flags.gdf_sconfitto è true (Atto 7, Pietra Rossa/Blu dall'Abbazia).
  // Finché è visibile, il varco resta bloccato dal trainer 'gdf_grunt_grotta_vulcano_1'.
  'gdf_gate_grotta_vulcano': {
    sprite: 'GDF_GRUNT_SPRITE', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Fermo lì. Nessuno entra nella Grotta finché il Comandante non ha finito.'],
  },
  // Infiltrato dentro la Grotta del Vulcano (grotta_vulcano_1f.tmj, sess. 7
  // set 2026): travestito da grunt GdF per non farsi scoprire (stesso sprite
  // dei nemici). Primo dialogo: solo la battuta di presentazione. Da lì in
  // poi, ogni volta che gli riparli, cura la squadra come un Centro Pokémon
  // improvvisato — vedi curaSquadraGrottaVulcano() in js/app.js.
  'gdf_infiltrato_grotta_vulcano': {
    sprite: 'GDF_GRUNT_SPRITE', direzione: 'sud', movimento: 'fisso',
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
    sprite: 'NPC 09', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Baso non c\'è, non vedi che sta succedendo?'],
  },
  // Gate davanti a casa di Gianluca (operatore funivia, rapito dal CoTrAL):
  // stessa condizione, stesso momento in cui sparisce il gate della palestra.
  'gate_gianluca_casa': {
    sprite: 'NPC 09', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Qui non c\'è più nessuno per far funzionare questo aggeggio.'],
  },
  // Gianluca, liberato: appare SOLO quando stato.flags.baso_tornato è vero
  // (stessa condizione del gate). Primo dialogo una tantum, poi ripetibile
  // con scelta Sì/No per salire a Monte Cavo (interagisciGianluca, app.js).
  'gianluca_liberato': {
    sprite: 'NPC 26', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciGianluca',
  },

  // Faustino il funicolarista: dona la MN Volo (richiede 6 Medaglie, vedi DONATORI_MN).
  'faustino_funivia': {
    sprite: 'trainer_HIKER', direzione: 'sud', movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciDonatoreVolo',
  },

  // Nonna Assunta: dona la MN Surf dopo la vittoria sulla palestra di Monte Porzio
  // (vedi DONATORI_MN in data.js, id 'mn-surf'). Piazzata al Lago di Albano.
  'mn-surf': {
    sprite: 'NPC 09', direzione: 'sud', movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciDonatoreSurf',
  },

  /* ── Lago di Albano — spiaggia ── */
  'lago_albano_npc1': {
    sprite: 'NPC 17', direzione: 'sud', movimento: 'random',
    dialogo: ["D'estate qui è pieno de gente. La domenica non trovi manco un asciugamano libero!"],
  },
  // Vive in una casa sul lago (l'utente costruirà l'interno più avanti).
  'lago_albano_npc2': {
    sprite: 'NPC 18', direzione: 'ovest', movimento: 'fisso',
    dialogo: ["Abito qui sul lago da sempre, in quella casetta. La sera, quando è tutto calmo, senti dei rumori strani venì dall'acqua…"],
  },

  // DEMO cutscene-allo-spawn (sessione di test, vedi js/map.js CUTSCENE_SPAWN
  // e dati/cutscene.js 'demo_vicino_curioso'): resta esattamente dov'è già su
  // Tiled (movimento/direzione invariati, NON toccare il .tmx/.tmj per questo
  // test), la cutscene lo raggiunge camminando dalla sua posizione reale.
  'pallet_oldman': {
    sprite: 'NPC 01',
    direzione: 'sud',
    movimento: 'random',
    dialogo: ['AO NAMOOOO. IL VINO DELI CASTELLIIIII'],
  },

  'pallet_girl': {
    sprite: 'npc girl',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: ['Preso il pokemon si? guarda che qua ti rubano tutto'],
  },

  'pallet_man': {
    sprite: 'NPC 02',
    direzione: 'ovest',
    movimento: 'fisso',
    dialogo: ['Casa del nipote del professore. Dicono sia abusiva, non entrerei fossi in te'],
  },

  'prof_castagno': {
    sprite: 'Professor Castagno',   // sprite dedicato (prima era uno swap sul vecchio "npc Rivale")
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciLaboratorio',
  },

  'Rivale': {
    sprite: 'trainer_POKEMONTRAINER_Brendan',   // il rivale ora è Brendan
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: ['Ehi! Non pensare di essere più forte di me!'],
  },

  'npc_joy': {
    sprite: 'npc joy',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: ['Benvenuto al Centro Pokémon!', 'Vuoi che curi i tuoi Pokémon?'],
    azione: 'interagisciCentroTiled',
  },

  /* ── Mercante degli Scambi (Centri Pokémon da Marino in poi): id generico,
     riusabile identico in ogni Centro, gestisce da solo il proprio dialogo. ── */
  'mercante_scambi': {
    sprite: 'NPC 07', nome: 'Mercante degli Scambi', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciMercanteScambi',
  },

  /* ── Frascati Sud ── */
  'fra_sud_npc1': {
    sprite: 'NPC 01', direzione: 'sud', movimento: 'random',
    dialogo: ['Benvenuto a Frascati! Qui se cerchi le vigne sei nel posto giusto.'],
  },
  'fra_sud_npc2': {
    sprite: 'NPC 02', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['L\'ospedale è laggiù. Ma per i Pokémon meglio il Centro!'],
  },
  'fra_sud_npc3': {
    sprite: 'NPC 03', direzione: 'est', movimento: 'random',
    dialogo: ['Dicono che in cima alla collina, alla Villa, ci sia qualcosa di speciale...',
              'Ma i cancelli sono sempre chiusi.'],
  },
  'fra_sud_npc4': {
    sprite: 'NPC 04', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La palestra di Frascati è del tipo Erba. Vinicio non perdona!'],
  },

  /* ── Frascati Centro ── */
  'fra_centro_npc1': {
    sprite: 'NPC 05', direzione: 'sud', movimento: 'fisso',
    dialogo: ['La fontana di Piazza San Rocco è bellissima, vero?'],
  },
  'fra_centro_npc2': {
    sprite: 'NPC 06', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Un buon allenatore passa sempre dal Market prima di un viaggio.'],
  },
  'fra_centro_npc3': {
    sprite: 'NPC 07', direzione: 'est', movimento: 'random',
    dialogo: ['Il vino dei Castelli è famoso in tutto il mondo!'],
    azione: 'donaTaglioFrascati',   // dà la MN Taglio dopo la palestra
  },
  'fra_centro_npc4': {
    sprite: 'NPC 08', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Hai già visitato la Villa Aldobrandini? Si dice apra solo ai Campioni...'],
  },

  /* ── Frascati Est (verso Villa Torlonia e il Percorso 2) ── */
  'fra_est_npc1': {
    sprite: 'NPC 17', direzione: 'sud', movimento: 'random',
    dialogo: ['Villa Torlonia è qui vicino: è lì che si trova la Palestra di Frascati!'],
  },
  'fra_est_npc2': {
    sprite: 'NPC 18', direzione: 'nord', movimento: 'fisso',
    dialogo: ['A est si va verso Grottaferrata. Ma prima conviene battere Vinicio.'],
  },
  'fra_est_npc3': {
    sprite: 'NPC 19', direzione: 'est', movimento: 'fisso',
    dialogo: ['I Pokémon Erba sono forti contro Acqua e Terra, ma occhio al Fuoco!'],
  },
  'fra_est_npc4': {
    sprite: 'NPC 20', direzione: 'ovest', movimento: 'random',
    dialogo: ['Riposati al Centro Pokémon prima di sfidare la Palestra.'],
  },

  /* ── Frascati Nord (verso i Boschi del Tuscolo) ── */
  'fra_nord_npc1': {
    sprite: 'NPC 09', direzione: 'sud', movimento: 'fisso',
    dialogo: ['I Boschi del Tuscolo, a nord, sono pieni di Pokémon. Vacci preparato!'],
  },
  'fra_nord_npc2': {
    sprite: 'NPC 10', direzione: 'ovest', movimento: 'random',
    dialogo: ['Dicono che tra le rovine antiche si nasconda un Pokémon misterioso...'],
  },
  'fra_nord_npc3': {
    sprite: 'NPC 11', direzione: 'nord', movimento: 'fisso',
    dialogo: ['Questa è la parte alta di Frascati. Che aria fresca!'],
  },
  'fra_nord_npc4': {
    sprite: 'NPC 12', direzione: 'est', movimento: 'fisso',
    dialogo: ['Un Antidoto fa sempre comodo nei boschi: i Pokémon velenosi non mancano.'],
  },

  /* ── Frascati Ovest (Piazza San Rocco) ── */
  'fra_ovest_npc1': {
    sprite: 'NPC 13', direzione: 'est', movimento: 'fisso',
    dialogo: ['Benvenuto in Piazza San Rocco, il cuore storico di Frascati.'],
  },
  'fra_ovest_npc2': {
    sprite: 'NPC 14', direzione: 'nord', movimento: 'random',
    dialogo: ['Quella fontana è bellissima... ma a volte sembra quasi viva.'],
  },
  'fra_ovest_npc3': {
    sprite: 'NPC 15', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Mio nonno racconta storie strane su questa piazza. Leggende, dice lui.'],
  },
  'fra_ovest_npc4': {
    sprite: 'NPC 16', direzione: 'sud', movimento: 'random',
    dialogo: ['Un buon allenatore conosce i tipi dei Pokémon a memoria!'],
  },

  /* ── Tuscolo Ingresso (verso i Boschi del Tuscolo) ── */
  'tusc_ing_npc1': {
    sprite: 'NPC 27', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Oltre questi alberi iniziano i Boschi del Tuscolo. Tieni gli occhi aperti!'],
  },
  'tusc_ing_npc2': {
    sprite: 'NPC 28', direzione: 'nord', movimento: 'random',
    dialogo: ['Gli allenatori qui ti sfidano appena ti vedono: non passano oltre!'],
  },
  'tusc_ing_npc3': {
    sprite: 'NPC 29', direzione: 'est', movimento: 'fisso',
    dialogo: ['Dicono che tra le antiche rovine del Tuscolo si nasconda qualcosa di raro...'],
  },
  'tusc_ing_npc4': {
    sprite: 'NPC 26', direzione: 'ovest', movimento: 'fisso',  // NPC 30 non esiste: uso NPC 26
    dialogo: ['Con la MN Taglio puoi farti strada tra gli alberi. L\'hai presa a Frascati?'],
  },

  /* ── Venditore del Poké Market di Frascati ── */
  'pokemon market venditore': {
    sprite: 'NPC 21', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Benvenuto al Poké Market! Cosa ti serve?'],
    azione: 'apriMarketFrascati',
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
    sprite: 'NPC 17', direzione: 'sud', movimento: 'random',
    dialogo: ["L'Abbazia di San Nilo è proprio lì fuori. Ci ho lasciato il mio Abra in custodia, per dire."],
  },
  'npc_pokecenter_marino_1': {
    sprite: 'NPC 12', direzione: 'sud', movimento: 'random',
    dialogo: ['Ho fatto surf tutto il giorno sul lago. I miei Pokémon acqua sono distrutti quanto me.'],
  },
  'npc_pokecenter_rocca_di_papa_1': {
    sprite: 'NPC 09', direzione: 'sud', movimento: 'random',
    dialogo: ["Qui l'aria di montagna fa bene, ma i miei Pokémon Roccia non hanno mai freddo comunque."],
  },
  'npc_pokecenter_genzano_1': {
    sprite: 'NPC 14', direzione: 'sud', movimento: 'random',
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
    sprite: 'NPC 09', direzione: 'est', movimento: 'fisso',
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
    sprite: 'NPC 09', direzione: 'sud', movimento: 'fisso',
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
    sprite: 'NPC_GUARDIA', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Ehi, aspetta.',
      'Questo sentiero porta a qualcuno che non incontra chiunque.',
      'Prima dimostra il tuo valore: sconfiggi la Lega di Colonna.',
      'Poi torna qui.',
    ],
  },

  // NPC che appare DOPO aver sconfitto Il Solitario (condizione: il_solitario_sconfitto).
  'il_solitario_post': {
    sprite: 'CAMPIONE_SOLITARIO', direzione: 'sud', movimento: 'fisso',
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
    sprite: 'NPC 21',
    direzione: 'sud',
    movimento: 'random',
    dialogo: [
      'I castagni dei Castelli so\' famosi! D\'autunno qui è tutto un profumo.',
      'Dicono che nel laghetto laggiù ci stiano Pokémon grossi... ma senza saper nuotare non ci arrivi.',
    ],
  },
  'p2_npc2': {
    sprite: 'NPC 22',
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
    sprite: 'NPC_65',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Continui a scendere e arrivi a Marino. Famosa per la Sagra dell\'Uva, sai?',
      'La palestra di Marino è di tipo Acqua. Porta qualcosa di tipo Erba o Elettro.',
    ],
  },
  'p3_npc2': {
    sprite: 'NPC_66',
    direzione: 'nord',
    movimento: 'random',
    dialogo: [
      'Da quassù, nelle giornate limpide, si vede luccicare il lago Albano.',
      'Ma per arrivarci sull\'acqua serve la MN Surf... e quella la trovi più avanti.',
    ],
  },
  'p3_npc3': {
    sprite: 'NPC_67',
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
    sprite: 'NPC_51',
    direzione: 'est',
    movimento: 'random',
    dialogo: [
      'Nilo, il Capopalestra, medita all\'alba. Non sottovalutarlo: la sua mente è affilata.',
      'Contro gli Psico, porta Pokémon Buio o Coleottero, se sei furbo.',
    ],
  },
  'grotta_npc3': {
    sprite: 'NPC_52',
    direzione: 'est',
    movimento: 'fisso',
    dialogo: [
      'L\'Abbazia di San Nilo è qui dal 1004. Mille anni di silenzio... e di Pokémon Psico.',
    ],
  },
  'grotta_npc4': {
    sprite: 'NPC_53',
    direzione: 'sud',
    movimento: 'random',
    dialogo: [
      'Quei tizi in divisa vicino all\'abbazia non mi piacciono per niente. Dicono di essere della "GdF"...',
    ],
  },
  'parcheggio_npc5': {
    sprite: 'NPC_54',
    direzione: 'ovest',
    movimento: 'fisso',
    dialogo: [
      'Di notte, al parcheggione, si vedono luci strane in cielo.',
      'Mio cugino giura di aver visto una stella... cadere proprio lì dietro.',
    ],
  },
  'monaco_abbazia': {
    sprite: 'NPC_MONACO',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Pace a te, pellegrino. Questa è l\'Abbazia di San Nilo.',
      'La quiete della mente è la vera forza. Nilo te lo mostrerà.',
    ],
  },
  // Porta dell'Abbazia presidiata dal Team GdF: BLOCCO che sparisce con 7 Medaglie
  // (gate + condizione "medaglie>=7"). Finché è lì, sbarra l'ingresso all'Abbazia.
  'gdf_porta_abbazia': {
    sprite: 'GDF_GRUNT_SPRITE',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [
      'Ehi, tu! Qui non si entra. Ordini del Comandante.',
      'L\'Abbazia è... chiusa per "manutenzione". Torna quando sarai qualcuno — diciamo, con sette Medaglie.',
    ],
  },

  /* ── Lago di Nemi — Atto 4 (Museo delle Navi): gate GdF ──
     Compare SOLO quando stato.flags.documentoVillaOttenuto è vero (Atto 3,
     Castel Gandolfo): prima di allora il museo è normale/non presidiato.
     Property Tiled: condizione: documentoVillaOttenuto (senza gate:true,
     quindi appare solo a condizione vera). Blocca l'accesso finché non si
     costruisce/risolve la scena del furto delle Orb (Atto 4). */
  'gdf_gate_nemi': {
    sprite: 'GDF_GRUNT_SPRITE',
    direzione: 'nord',
    movimento: 'fisso',
    dialogo: [
      'Fermo lì! Il Museo è "chiuso per inventario". Ordini della Fulvia.',
      'Le navi de Nemi nasconnono quarcosa che ce serve. Nun te fa i cazzi tua e vattene.',
    ],
  },

  /* ── Castel Gandolfo (angolo nord-est, davanti alla Villa Pontificia occupata dal GdF) ── */
  'cg_villa_custode': {
    sprite: 'NPC 07',
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
    sprite: 'NPC 07', direzione: 'sud', movimento: 'random',
    dialogo: ['Albano Laziale, Palestra Roccia! Giorgia non fa sconti a nessuno.'],
  },
  'albano_npc4': {
    sprite: 'NPC 21', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Il Lago Albano è proprio qui vicino. Con la MN Surf ce fai il giro completo.'],
  },
  'albano_npc5': {
    sprite: 'NPC 09', direzione: 'est', movimento: 'random',
    dialogo: ["Medaglia Scudo, la chiamano. Giorgia l'ha vinta a suon di pietra contro pietra."],
  },
  'albano_npc6': {
    sprite: 'NPC 17', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Da qui se parte verso Ariccia. Dicono che pure lì c\'è \'na palestra tosta.'],
  },

  /* ── Percorso 8 (Albano → Ariccia): Porchettari, allusione alla Sagra e alla
     Piuma Iridescente di Ho-Oh (STORIA_COMPLETA, catena post-lega). Solo
     dialogo per ora, nessuna meccanica attiva. ── */
  'porchettaro_p8_1': {
    sprite: 'NPC 09', direzione: 'sud', movimento: 'fisso',
    dialogo: [
      'Ariccia? Ah, la Sagra della Porchetta! Quest\'anno se dice che sarà \'na cosa grossa...',
      'Pare che pure quelli der CoTrAL se so\' fatti vedè da quelle parti. Boh, io penso solo a la porchetta.',
    ],
  },
  'porchettaro_p8_2': {
    sprite: 'NPC 11', direzione: 'ovest', movimento: 'fisso',
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
    sprite: 'NPC 07', direzione: 'sud', movimento: 'random',
    dialogo: ["Ariccia è famosa pe' le fraschette e la porchetta! Ma occhio a Ombretta, la capopalestra: i su' Pokémon Buio non se vedono arrivà."],
  },
  'ariccia_npc2': {
    sprite: 'NPC 21', direzione: 'est', movimento: 'fisso',
    dialogo: ['Er Ponte de Ariccia è \'na meraviglia, lo vedi da ogni angolo della città. Dicono pure che de notte è meglio non passacce...'],
  },
  'ariccia_npc3': {
    sprite: 'NPC 17', direzione: 'ovest', movimento: 'random',
    dialogo: ["Medaglia Fraschetta, se chiama. Buffo, no? Ma i lottatori de tipo Buio nun so' mica da ride."],
  },
  'ariccia_npc4': {
    sprite: 'NPC 09', direzione: 'sud', movimento: 'fisso',
    dialogo: ["Ho visto certi tipi strani girà co' furgoni CoTrAL dalle parti der locale d'Adriano. A me nun me piace pe' niente."],
  },
  'ariccia_npc5': {
    sprite: 'NPC 18', direzione: 'nord', movimento: 'random',
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
    sprite: 'NPC 26', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Preparativi pe\' la Sagra! Quest\'anno ce sarà \'na sorpresa, dice Adriano.'],
  },
  'porchettaro_ar_2': {
    sprite: 'NPC 27', direzione: 'ovest', movimento: 'fisso',
    dialogo: ['Se sconfiggi quei tipacci der CoTrAL che infastidiscono Adriano, quello se ricorda de te, fidete.'],
  },
  'porchettaro_ar_3': {
    sprite: 'NPC 28', direzione: 'est', movimento: 'fisso',
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
    sprite: 'NPC 07', nome: 'Cesira', direzione: 'sud', movimento: 'fisso',
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
    sprite: 'NPC 08', direzione: 'ovest', movimento: 'fisso',
    dialogo: ["Stasera se beve e se magna fino a spaccà! Vieni pe' la Sagra, nun te ne pentirai!"],
  },
  'ariccia_sagra_2': {
    sprite: 'NPC 13', direzione: 'est', movimento: 'fisso',
    dialogo: ["Hai sentito? Dicono che stanotte i Porchettari cercano uno sfidante vero. Io nun me ce butterei, eh."],
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
    sprite: 'trainer_SCIENTIST', nome: 'Marcello', direzione: 'sud', movimento: 'fisso',
    dialogo: ['(Marcello è troppo preso dalla discussione con Baso per notarti.)'],
  },
  'cotral_grunt_forte_1_npc': {
    sprite: 'trainer_CoTral_M', nome: 'Addetto Scelto', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non è ancora il momento. Aspetta il tuo turno.'],
  },
  'cotral_grunt_forte_2_npc': {
    sprite: 'trainer_CoTral_F', nome: 'Addetta Scelta', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non è ancora il momento. Aspetta il tuo turno.'],
  },
  // Grunt decorativi (solo scenografia, "tutta la gente è lì" — richiesta di
  // Luca): spariscono insieme al resto quando la cutscene finisce.
  'cotral_grunt_deco_1': {
    sprite: 'COTRAL_GRUNT_SPRITE', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai visto niente.'],
  },
  'cotral_grunt_deco_2': {
    sprite: 'COTRAL_GRUNT_SPRITE', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai visto niente.'],
  },
  'cotral_grunt_deco_3': {
    sprite: 'COTRAL_GRUNT_SPRITE', direzione: 'sud', movimento: 'fisso',
    dialogo: ['Non hai visto niente.'],
  },
  // Visibile fin dall'inizio (ostaggio, parte della scenografia della
  // cutscene — "c'è anche Gianluca" nella specifica di Luca), RESTA visibile
  // anche dopo la vittoria (a differenza di Marcello/grunt, che spariscono
  // subito): parlargli è ciò che fa scattare l'epilogo vero (Baso si avvicina
  // e ringrazia, vedi _epilogoBasoCotralRocca in js/map.js). Sparisce insieme
  // a Baso solo a epilogo concluso (cotral_rocca_finale).
  'gianluca_cotral_rocca': {
    sprite: 'NPC 26', nome: 'Gianluca', direzione: 'sud', movimento: 'fisso',
    azione: 'interagisciGianlucaCotralRocca',
  },

};
