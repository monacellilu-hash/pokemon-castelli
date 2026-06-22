/* dati/npc.js — Dati NPC dalle mappe Tiled
   Ogni chiave = id dell'oggetto nel layer "eventi" del .tmj
   sprite: nome file in sprites/npc e trainer per claude/ (senza estensione)
   direzione: nord | sud | est | ovest
   movimento: fisso | random
   dialogo: array di righe
   azione: stringa opzionale — se presente, chiama la funzione globale corrispondente
           invece di mostrare il dialogo generico
*/

const DATI_NPC = {

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
    sprite: 'npc professore castagno',
    direzione: 'sud',
    movimento: 'fisso',
    dialogo: [],
    azione: 'interagisciLaboratorio',
  },

  'Rivale': {
    sprite: 'npc Rivale',
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

};
