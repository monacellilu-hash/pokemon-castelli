/* dati/trainer.js — Dati allenatori dalle mappe Tiled
   Ogni chiave = id dell'oggetto nel layer "eventi" del .tmj
   I dati sono presi dal codice reale (ALLENATORI in data.js).
   TMJ id → codice reale (gli 8 allenatori del Path 1, divisi su Percorso 1 e Percorso 1b):
     trainer path 1_0  → all-tusc-1 (Gino)     [Percorso 1]
     trainer path 1_1  → all-tusc-2 (Lia)      [Percorso 1]
     trainer path 1_2  → all-tusc-3 (Memmo)    [Percorso 1]
     trainer path 1_4  → all-tusc-4 (Dario)    [Percorso 1b]
     trainer path 1b_5 → all-tusc-5 (Adelmo)   [Percorso 1b]
     trainer path 1b_6 → all-tusc-6 (Mimosa)   [Percorso 1b, pattuglia NS]
     trainer path 1b_7 → all-tusc-7 (Furio)    [Percorso 1b]
     trainer path 1b_8 → all-tusc-8 (Calogero) [Percorso 1b]
*/

const DATI_TRAINER = {

  /* ── Monte Porzio Catone (avvicinamento all'Osservatorio) ── */
  'trainer monteporzio 1': {
    sprite: 'trainer_HIKER',
    ritratto: 'HIKER',
    vista: 3,
    classe: 'Escursionista',
    nome: 'Learco',
    squadra: [
      { id: 74, livello: 25 },
      { id: 95, livello: 26 },
    ],
    dialogo_prima: 'Sali fin qui per la vista o per una lotta? Bene, offro entrambe!',
    dialogo_dopo: 'La roccia regge, la mia squadra un po\' meno...',
    premio: 780,
  },
  // Osservatorio esterno (mappa ampliata da Luca, sess. 17 set 2026): 2 nuovi
  // escursionisti, livello coerente con l'area (poco sopra il cap P4, 34).
  'trainer_osservatorio_1': {
    sprite: 'trainer_HIKER',
    ritratto: 'HIKER',
    vista: 4,
    classe: 'Escursionista',
    nome: 'Bruno',
    squadra: [
      { id: 111, livello: 30 },
      { id: 74, livello: 29 },
      { id: 27, livello: 31 },
    ],
    dialogo_prima: 'Quassù il vento è tagliente, ma i miei Pokémon di roccia non se ne accorgono nemmeno!',
    dialogo_dopo: 'Nemmeno la roccia più dura regge sempre...',
    premio: 930,
  },
  'trainer_osservatorio_2': {
    sprite: 'trainer_HIKER',
    ritratto: 'HIKER',
    vista: 4,
    classe: 'Escursionista',
    nome: 'Italo',
    squadra: [
      { id: 95, livello: 30 },
      { id: 328, livello: 32 },
    ],
    dialogo_prima: 'Ti sei spinto fin quassù? Rispetto. Vediamo se hai anche la squadra giusta.',
    dialogo_dopo: 'Ok, ok, hai vinto. La vista da qui resta comunque la mia rivincita.',
    premio: 960,
  },

  'trainer monteporzio 2': {
    sprite: 'trainer_POKEMONRANGER_F',
    ritratto: 'POKEMONRANGER_F',
    vista: 7,
    classe: 'Astrofila',
    nome: 'Selene',
    squadra: [
      { id: 100, livello: 25 },
      { id: 25, livello: 27 },
    ],
    dialogo_prima: 'Studio i fulmini per l\'Osservatorio. Vediamo se i tuoi Pokémon reggono la scossa!',
    dialogo_dopo: 'Dati aggiornati: la tua squadra è più carica della mia.',
    premio: 810,
  },

  'trainer path 1_0': {
    sprite: 'trainer_YOUNGSTER',
    ritratto: 'YOUNGSTER',
    vista: 4,
    classe: 'Pivello',
    nome: 'Gino',
    squadra: [
      { id: 19, livello: 5 },
      { id: 16, livello: 5 },
    ],
    dialogo_prima: 'Ao! Primo giorno da allenatore pure per te? Vediamo chi ha studiato meglio!',
    dialogo_dopo: 'E vabbè, tanto stavo a giocà.',
    premio: 300,
  },

  'trainer path 1_1': {
    sprite: 'trainer_POKEMONRANGER_F',
    ritratto: 'POKEMONRANGER_F',
    vista: 7,
    classe: 'Esploratrice',
    nome: 'Lia',
    squadra: [
      { id: 161, livello: 6 },
      { id: 16, livello: 6 },
      { id: 19, livello: 7 },
    ],
    dialogo_prima: 'Sto mappando la Via Tuscolana coi miei Pokémon. Tu mi sembri un buon ostacolo da studiare!',
    dialogo_dopo: 'Dati raccolti: sei più forte di me.',
    premio: 360,
  },

  'trainer path 1_2': {
    sprite: 'trainer_YOUNGSTER',
    ritratto: 'YOUNGSTER',
    vista: 7,
    classe: 'Scolaretto',
    nome: 'Memmo',
    squadra: [
      { id: 261, livello: 5 },
      { id: 263, livello: 6 },
    ],
    dialogo_prima: 'Oggi la maestra non c\'è! Lotto con te invece de fa\' i compiti!',
    dialogo_dopo: 'Uffa, e mo\' che je dico a casa?',
    premio: 360,
  },

  /* ── Percorso 1b — gli altri 5 allenatori del Path 1 ── */

  'trainer path 1_4': {
    sprite: 'trainer_BIKER',
    ritratto: 'BIKER',
    vista: 7,
    classe: 'Ciclista',
    nome: 'Dario',
    squadra: [
      { id: 16, livello: 6 },
      { id: 161, livello: 7 },
      { id: 19, livello: 7 },
    ],
    dialogo_prima: 'Scendo dalla Tuscolana a tutta velocità! Tieni il passo, se ci riesci!',
    dialogo_dopo: 'Frenata d\'emergenza. Hai vinto tu.',
    premio: 420,
  },

  'trainer path 1b_5': {
    sprite: 'trainer_SAILOR',
    ritratto: 'SAILOR',
    vista: 7,
    classe: 'Corriere',
    nome: 'Adelmo',
    squadra: [
      { id: 19, livello: 4 },
      { id: 161, livello: 5 },
    ],
    dialogo_prima: 'Faccio consegne sulla Tuscolana da anni. E ogni tanto sfido chi trovo!',
    dialogo_dopo: 'Consegna persa.',
    premio: 340,
  },

  'trainer path 1b_6': {
    sprite: 'trainer_LASS',
    ritratto: 'LASS',
    vista: 7,
    classe: 'Bambina',
    nome: 'Mimosa',
    squadra: [
      { id: 163, livello: 4 },
      { id: 16, livello: 5 },
    ],
    dialogo_prima: 'Mio fratello dice che non vinco mai. Oggi gli dimostro che sbaglia!',
    dialogo_dopo: 'Mannaggia. Lui aveva ragione.',
    premio: 280,
  },

  'trainer path 1b_7': {
    sprite: 'trainer_CAMPER',
    ritratto: 'CAMPER',
    vista: 7,
    classe: 'Jogger',
    nome: 'Furio',
    squadra: [
      { id: 263, livello: 5 },
      { id: 16, livello: 6 },
    ],
    dialogo_prima: 'Faccio jogging sulla Tuscolana ogni mattina. Anche lottare fa parte della routine!',
    dialogo_dopo: 'Crampi.',
    premio: 360,
  },

  'trainer path 1b_8': {
    sprite: 'trainer_TAMER',
    ritratto: 'TAMER',
    vista: 7,
    classe: 'Zingaro',
    nome: 'Calogero',
    squadra: [
      { id: 261, livello: 6 },
      { id: 19, livello: 7 },
      { id: 163, livello: 7 },
    ],
    dialogo_prima: 'Giro il mondo con i miei Pokémon. La Tuscolana è solo tappa!',
    dialogo_dopo: 'Il mondo gira anche per me.',
    premio: 400,
  },

  /* ── PALESTRA DI FRASCATI (tipo Erba, 1ª città — squadre da PALESTRE['frascati']) ──
     3 gregari + Capopalestra Vinicio. Il leader assegna la Medaglia Vigna
     (campo palestraId, gestito in map.js → vinciPalestraTiled). */

  'gregario 1 palestra frascati': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 12,
    classe: 'Vendemmiatore', nome: 'Aldo',
    squadra: [{ id: 43, livello: 9 }, { id: 69, livello: 10 }],
    dialogo_prima: 'Tra questi filari ho allenato i miei Pokémon Erba fin da quando erano semini!',
    dialogo_dopo: 'Annata storta per me.',
    premio: 200,
  },

  'gregario 2 palestra frascati': {
    sprite: 'trainer_AROMALADY', ritratto: 'AROMALADY', vista: 15,
    classe: 'Botanica', nome: 'Fiamma',
    squadra: [{ id: 187, livello: 11 }, { id: 285, livello: 12 }],
    dialogo_prima: 'Studio le piante di Villa Torlonia da anni: i miei Pokémon assorbono la luce come le vigne!',
    dialogo_dopo: 'Ci vuole ancora un po\' di sole.',
    premio: 240,
  },

  'gregario 3 palestra frascati': {
    sprite: 'trainer_POKEMONBREEDER', ritratto: 'POKEMONBREEDER', vista: 15,
    classe: 'Orticoltore', nome: 'Bruno',
    squadra: [{ id: 44, livello: 12 }, { id: 69, livello: 13 }],
    dialogo_prima: 'Servo la palestra di Vinicio da tre stagioni. Il Capopalestra ha radici profonde!',
    dialogo_dopo: 'La mia vigna ha bisogno di cure.',
    premio: 280,
  },

  'gym_leader_palestra frascati': {
    sprite: 'Primapalestra_capopalestra', ritratto: 'LEADER_Erika', vista: 0,
    classe: 'Capopalestra', nome: 'Vinicio',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 43,  livello: 11 },  // Oddish
      { id: 285, livello: 12 },  // Shroomish
      { id: 44,  livello: 13 },  // Gloom
      { id: 315, livello: 14 },  // Roselia (l'asso)
    ],
    dialogo_prima: 'Sono Vinicio, Capopalestra di Frascati. I miei Pokémon Erba sono cresciuti tra i filari delle vigne. Come un buon Frascati DOC, hanno carattere: vediamo se reggi il confronto!',
    dialogo_dopo: 'Che lotta! Hai la stoffa di un vino d\'annata. La Medaglia Vigna è tua, te la sei meritata!',
    premio: 1400,
    palestraId: 'frascati',   // → assegna la Medaglia Vigna e alza il level cap
  },

  /* ── PALESTRA DI GROTTAFERRATA (tipo Psico, 2ª città — Abbazia di San Nilo) ──
     4 gregari + Capopalestra Nilo. Squadre/dialoghi da PALESTRE['grottaferrata'].
     Il leader assegna la Medaglia Icona e alza il level cap a 21. */

  'gregario 1 palestra grottaferrata': {
    sprite: 'trainer_CHANNELER', ritratto: 'CHANNELER', vista: 8,
    classe: 'Monaco', nome: "Fra' Matteo",
    squadra: [{ id: 177, livello: 15 }, { id: 96, livello: 16 }],
    dialogo_prima: 'La pace della mente non è debolezza. È la forza che non si vede. Ora dimostramelo!',
    dialogo_dopo: 'La tua determinazione è forte. Medita su questo.',
    premio: 300,
  },

  'gregario 2 palestra grottaferrata': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 8,
    classe: 'Studioso', nome: 'Renato',
    squadra: [{ id: 63, livello: 17 }, { id: 177, livello: 17 }],
    dialogo_prima: 'Analizzo le strategie di battaglia come i testi antichi. La tua è già esposta!',
    dialogo_dopo: 'Ho sottovalutato le variabili.',
    premio: 340,
  },

  'gregario 3 palestra grottaferrata': {
    sprite: 'trainer_PSYCHIC_F', ritratto: 'PSYCHIC_F', vista: 8,
    classe: 'Meditante', nome: 'Chiara',
    squadra: [{ id: 325, livello: 17 }, { id: 280, livello: 18 }],
    dialogo_prima: 'Nei miei Pokémon riverso ogni ora di meditazione. Sentirai il peso della mente!',
    dialogo_dopo: 'Devo approfondire la mia pratica.',
    premio: 360,
  },

  'gregario 4 palestra grottaferrata': {
    sprite: 'trainer_PSYCHIC_M', ritratto: 'PSYCHIC_M', vista: 8,
    classe: 'Allievo', nome: 'Dario',
    squadra: [{ id: 64, livello: 18 }, { id: 325, livello: 19 }],
    dialogo_prima: 'Sono l\'allievo avanzato di Nilo. Prima di parlare col maestro, rispondi a me!',
    dialogo_dopo: 'Il maestro avrà da ridire.',
    premio: 400,
  },

  'gym_leader_palestra grottaferrata': {
    sprite: 'Nilo_Grottaferrata', ritratto: 'LEADER_Sabrina', vista: 0,
    classe: 'Capopalestra', nome: 'Nilo',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 177, livello: 17 },  // Natu
      { id: 325, livello: 18 },  // Spoink
      { id: 64,  livello: 19 },  // Kadabra
      { id: 97,  livello: 20 },  // Hypno
      { id: 326, livello: 21 },  // Grumpig (l'asso)
    ],
    dialogo_prima: 'Benvenuto all\'Abbazia di San Nilo, pellegrino. Sono Nilo: tra questi chiostri millenari ho imparato che la vera forza nasce dalla quiete della mente. I miei Pokémon Psico e io meditiamo insieme ogni alba. Mostrami la disciplina del tuo spirito!',
    dialogo_dopo: 'La tua mente è limpida come l\'acqua della Marana. La Medaglia Icona è tua.',
    premio: 2100,
    palestraId: 'grottaferrata',   // → assegna la Medaglia Icona e alza il level cap a 21
  },

  /* ── PALESTRA DI MARINO (tipo Acqua, 3ª città — Fontana dei Quattro Mori) ──
     5 gregari + Capopalestra Moro. Squadre/dialoghi da PALESTRE['marino'] (data.js).
     Il leader assegna la Medaglia Fontana e alza il level cap a 28. */

  'gregario 1 palestra marino': {
    sprite: 'trainer_FISHERMAN', ritratto: 'FISHERMAN', vista: 7,
    classe: 'Pescatore', nome: 'Lello',
    squadra: [{ id: 60, livello: 22 }, { id: 118, livello: 23 }],
    dialogo_prima: 'Pesco da trent\'anni nel lago. I miei Pokémon Acqua sanno come si combatte in acqua alta!',
    dialogo_dopo: 'Stavolta il pesce grosso sei tu.',
    premio: 400,
  },

  'gregario 2 palestra marino': {
    sprite: 'trainer_SWIMMER_F', ritratto: 'SWIMMER_F', vista: 7,
    classe: 'Nuotatrice', nome: 'Giada',
    squadra: [{ id: 72, livello: 23 }, { id: 183, livello: 24 }],
    dialogo_prima: 'Nuoto nel Lago Albano ogni mattina. I miei Pokémon Acqua hanno resistenza da vendere!',
    dialogo_dopo: 'Corrente troppo forte, stavolta.',
    premio: 420,
  },

  'gregario 3 palestra marino': {
    sprite: 'trainer_SWIMMER_M', ritratto: 'SWIMMER_M', vista: 7,
    classe: 'Bagnino', nome: 'Marco',
    squadra: [{ id: 60, livello: 24 }, { id: 54, livello: 25 }],
    dialogo_prima: 'Salvo i bagnanti dal mare. Salverò pure me da questa sconfitta!',
    dialogo_dopo: 'SOS: ho bisogno di aiuto.',
    premio: 440,
  },

  'gregario 4 palestra marino': {
    sprite: 'trainer_SWIMMER2_M', ritratto: 'SWIMMER2_M', vista: 7,
    classe: 'Sommozzatore', nome: 'Enzo',
    squadra: [{ id: 86, livello: 25 }, { id: 116, livello: 26 }],
    dialogo_prima: 'Ho esplorato il fondo del lago. Laggiù ci sono cose che non si possono dire. E Pokémon fortissimi!',
    dialogo_dopo: 'Risalgo a fare pratica.',
    premio: 460,
  },

  'gregario 5 palestra marino': {
    sprite: 'trainer_SAILOR', ritratto: 'SAILOR', vista: 7,
    classe: 'Velista', nome: 'Corinna',
    squadra: [{ id: 279, livello: 25 }, { id: 183, livello: 26 }],
    dialogo_prima: 'Vado a vela sul lago da vent\'anni. Il vento è con me, oggi!',
    dialogo_dopo: 'Vento contrario.',
    premio: 480,
  },

  /* ── PALESTRA DI MONTE PORZIO CATONE (tipo Elettro, 4ª città — cap 34) ──
     6 gregari + Capopalestra Stella. Squadre/dialoghi da PALESTRE['monte-porzio']
     (js/data.js). Il leader assegna la Medaglia Stella e alza il level cap a 34. */

  'gregario 1 palestra monteporzio': {
    sprite: 'trainer_ENGINEER', ritratto: 'ENGINEER', vista: 7,
    classe: 'Tecnico', nome: 'Fausto',
    squadra: [{ id: 81, livello: 28 }, { id: 100, livello: 29 }],
    dialogo_prima: 'Mantengo i telescopi dell\'osservatorio. I miei Pokémon Elettro alimentano tutto!',
    dialogo_dopo: 'Cortocircuito.',
    premio: 500,
  },
  'gregario 2 palestra monteporzio': {
    sprite: 'trainer_LADY', ritratto: 'LADY', vista: 7,
    classe: 'Astrofila', nome: 'Dora',
    squadra: [{ id: 25, livello: 29 }, { id: 170, livello: 30 }],
    dialogo_prima: 'Studio le stelle dall\'osservatorio. L\'elettricità dei miei Pokémon accende i sogni!',
    dialogo_dopo: 'La mia stella ha perso luminosità.',
    premio: 520,
  },
  'gregario 3 palestra monteporzio': {
    sprite: 'trainer_PROFESSOR', ritratto: 'PROFESSOR', vista: 7,
    classe: 'Meteorologa', nome: 'Ines',
    squadra: [{ id: 311, livello: 30 }, { id: 312, livello: 31 }],
    dialogo_prima: 'Prevedo i temporali. Oggi prevedo anche la tua sconfitta!',
    dialogo_dopo: 'Previsione errata.',
    premio: 540,
  },
  'gregario 4 palestra monteporzio': {
    sprite: 'trainer_SCIENTIST', ritratto: 'SCIENTIST', vista: 7,
    classe: 'Fisico', nome: 'Aurelio',
    squadra: [{ id: 82, livello: 31 }, { id: 101, livello: 32 }],
    dialogo_prima: 'La fisica quantistica dice che hai il 30% di probabilità di vincere. Oggi.',
    dialogo_dopo: 'Il 30% ha vinto. Interessante.',
    premio: 560,
  },
  'gregario 5 palestra monteporzio': {
    sprite: 'trainer_ENGINEER', ritratto: 'ENGINEER', vista: 7,
    classe: 'Ingegnere', nome: 'Livio',
    squadra: [{ id: 100, livello: 31 }, { id: 180, livello: 32 }],
    dialogo_prima: 'Ho progettato il sistema elettrico di questo osservatorio. E la mia squadra!',
    dialogo_dopo: 'Sistema in sovraccarico.',
    premio: 560,
  },
  'gregario 6 palestra monteporzio': {
    sprite: 'trainer_SCIENTIST', ritratto: 'SCIENTIST', vista: 7,
    classe: 'Ricercatrice', nome: 'Nadia',
    squadra: [{ id: 309, livello: 32 }, { id: 82, livello: 33 }],
    dialogo_prima: 'Sono la ricercatrice senior di questo osservatorio. Superare me non è dato a tutti!',
    dialogo_dopo: 'Devo riscrivere i dati.',
    premio: 580,
  },
  'gym_leader_palestra monteporzio': {
    sprite: 'Er_biretta_Capopalestra', ritratto: 'LEADER_Surge', vista: 0,
    classe: 'Capopalestra', nome: 'Stella',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 26,  livello: 31 },  // Raichu
      { id: 101, livello: 32 },  // Electrode
      { id: 82,  livello: 32 },  // Magneton
      { id: 310, livello: 33 },  // Manectric
      { id: 181, livello: 34 },  // Ampharos (l'asso)
    ],
    dialogo_prima: 'Ciao! Sono Stella, astronoma dell\'Osservatorio di Monte Porzio. Ogni notte studio le stelle… e i miei Pokémon Elettro generano l\'energia dei telescopi! Preparati: la mia squadra colpisce alla velocità della luce!',
    dialogo_dopo: 'Brilli più di una supernova! La Medaglia Stella è tua: portala in alto!',
    premio: 3400,
    palestraId: 'monte-porzio',   // → assegna la Medaglia Stella e alza il level cap a 34
  },

  /* ── PERCORSO 4 (Marino → Monte Porzio/Castel Gandolfo) ──
     2 allenatori sulla salita, piazzati al centro della mappa: l'utente li sposterà
     una volta rifinito il tracciato. */
  'all-p4-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 6,
    classe: 'Escursionista', nome: 'Dario',
    squadra: [{ id: 74, livello: 20 }, { id: 66, livello: 21 }],
    dialogo_prima: 'Questa salita verso Monte Porzio taglia le gambe! I miei Pokémon Roccia e Lotta invece la adorano.',
    dialogo_dopo: 'Uff… mi tocca sedermi un attimo.',
    premio: 320,
  },
  'all-p4-2': {
    sprite: 'trainer_BIKER', ritratto: 'BIKER', vista: 6,
    classe: 'Ciclista', nome: 'Nella',
    squadra: [{ id: 19, livello: 19 }, { id: 84, livello: 21 }],
    dialogo_prima: 'Faccio questa strada in bici tutti i giorni. Occhio, che i miei Pokémon sono più veloci di te!',
    dialogo_dopo: 'Mi hai staccato in salita, complimenti.',
    premio: 300,
  },

  /* ── LAGO DI ALBANO — spiaggia (6 allenatori, sprite da spiaggia) ──
     Piazzati al centro della mappa: l'utente li sposterà lungo la riva. */
  'all-lago-1': {
    sprite: 'trainer_FISHERMAN', ritratto: 'FISHERMAN', vista: 6,
    classe: 'Pescatore', nome: 'Nino',
    squadra: [{ id: 60, livello: 20 }, { id: 129, livello: 21 }],
    dialogo_prima: 'Il Lago Albano è pieno di sorprese. Anche i miei Pokémon lo sono!',
    dialogo_dopo: 'Oggi non abbocca niente per me.',
    premio: 340,
  },
  'all-lago-2': {
    sprite: 'trainer_SWIMMER_F', ritratto: 'SWIMMER_F', vista: 6,
    classe: 'Nuotatrice', nome: 'Wanda',
    squadra: [{ id: 118, livello: 21 }, { id: 194, livello: 22 }],
    dialogo_prima: 'Nuoto in questo lago da quando ero piccola. Vediamo se resisti alla mia squadra!',
    dialogo_dopo: 'Che tuffo, mi hai steso.',
    premio: 350,
  },
  'all-lago-3': {
    sprite: 'trainer_SWIMMER_M', ritratto: 'SWIMMER_M', vista: 6,
    classe: 'Nuotatore', nome: 'Renzo',
    squadra: [{ id: 72, livello: 21 }, { id: 183, livello: 22 }],
    dialogo_prima: 'Acqua fresca e Pokémon Acqua: la combinazione perfetta!',
    dialogo_dopo: 'Mi hai trascinato a fondo.',
    premio: 350,
  },
  'all-lago-4': {
    sprite: 'trainer_SWIMMER2_F', ritratto: 'SWIMMER2_F', vista: 6,
    classe: 'Nuotatrice', nome: 'Ilaria',
    squadra: [{ id: 79, livello: 22 }, { id: 222, livello: 23 }],
    dialogo_prima: 'Il fondale del lago nasconde più cose di quanto pensi.',
    dialogo_dopo: 'Affondo, in tutti i sensi.',
    premio: 370,
  },
  'all-lago-5': {
    sprite: 'trainer_SWIMMER2_M', ritratto: 'SWIMMER2_M', vista: 6,
    classe: 'Sommozzatore', nome: 'Beppe',
    squadra: [{ id: 170, livello: 22 }, { id: 223, livello: 23 }],
    dialogo_prima: 'Mi immergo ogni giorno. Ho visto cose che non hai visto tu... e anche Pokémon forti!',
    dialogo_dopo: 'Risalgo per riprendere fiato.',
    premio: 370,
  },
  'all-lago-6': {
    sprite: 'trainer_SAILOR', ritratto: 'SAILOR', vista: 6,
    classe: 'Velista', nome: 'Ottavia',
    squadra: [{ id: 278, livello: 23 }, { id: 73, livello: 24 }],
    dialogo_prima: 'Il vento sul lago è perfetto oggi. Peccato per te!',
    dialogo_dopo: 'Vento a favore tuo, stavolta.',
    premio: 390,
  },

  /* ── TEAM GdF — presidio della Grotta del Vulcano (Atto 6, STORIA_COMPLETA) ──
     Piazzato per ora al centro della piazza di Rocca di Papa (l'utente lo sposterà
     quando costruirà il dungeon vero). Groudon dorme nel nucleo ma non è ancora
     catturabile: sconfiggere questo grunt non lo sblocca, serve il flag
     `gdf_sconfitto` (Atto 7, Pietra Rossa/Blu dall'Abbazia post-Lega) — vedi
     l'NPC-gate `gdf_gate_grotta_vulcano` in dati/npc.js. */
  'gdf_grunt_grotta_vulcano_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 42, livello: 40 }, { id: 110, livello: 41 }],
    dialogo_prima: 'Nessuno entra nella Grotta del Vulcano. Il Comandante ha i suoi piani per quello che dorme là dentro.',
    dialogo_dopo: 'Bah... di\' pure in giro quello che hai visto, tanto non cambia niente.',
    premio: 1700,
  },

  /* ── GROTTA DEL VULCANO — interno (grotta_vulcano_1f.tmj), sess. 7 set 2026.
     12 grunt/soldati GdF di presidio nei 4 bracci del dungeon (3 per braccio),
     livelli 50-54 — un po' sotto Via Vittoria (56-58), coerente col fatto che
     si sblocca da Rocca di Papa (cap 40) e non a fine gioco vero. L'ultimo
     (D3) è un "ufficiale" con 3 Pokémon, il più tosto del gruppo. */
  'gdf_grotta_vulcano_1f_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Recluta GdF', nome: 'Nazzareno',
    squadra: [{ id: 28, livello: 50 }, { id: 76, livello: 51 }],
    dialogo_prima: 'Manco morto te lascio passà.',
    dialogo_dopo: 'Ahó, mo\' vado a riferì al Comandante.',
    premio: 1500,
  },
  'gdf_grotta_vulcano_1f_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Recluta GdF', nome: 'Ottaviano',
    squadra: [{ id: 126, livello: 51 }, { id: 323, livello: 52 }],
    dialogo_prima: 'Sta grotta è nostra, statte accorto.',
    dialogo_dopo: 'Mannaggia... nun ce posso crede.',
    premio: 1530,
  },
  'gdf_grotta_vulcano_1f_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Soldato GdF', nome: 'Fiorenzo',
    squadra: [{ id: 34, livello: 51 }, { id: 51, livello: 52 }],
    dialogo_prima: 'Er Comandante sa già che sei entrato. Preparate.',
    dialogo_dopo: 'Bella lotta, però nun cambia gnente.',
    premio: 1530,
  },
  'gdf_grotta_vulcano_1f_4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Soldato GdF', nome: 'Publio',
    squadra: [{ id: 105, livello: 51 }, { id: 112, livello: 52 }],
    dialogo_prima: 'Questo braccio della grotta è mio. Nun se passa.',
    dialogo_dopo: 'Vabbè... passa, ma nun te ce abituà.',
    premio: 1530,
  },
  'gdf_grotta_vulcano_1f_5': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Soldato GdF', nome: 'Ermenegildo',
    squadra: [{ id: 262, livello: 52 }, { id: 302, livello: 51 }],
    dialogo_prima: 'Te sei perso, o sei venuto a cercà guai?',
    dialogo_dopo: 'Nell\'ombra se vede tutto, e io c\'ho visto poco bene stavolta.',
    premio: 1560,
  },
  'gdf_grotta_vulcano_1f_6': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Anacleto',
    squadra: [{ id: 208, livello: 52 }, { id: 219, livello: 51 }],
    dialogo_prima: 'Guardie de ferro, giovino. Nun passi de sicuro.',
    dialogo_dopo: 'Er ferro s\'è piegato... complimenti.',
    premio: 1560,
  },
  'gdf_grotta_vulcano_1f_7': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Learco',
    squadra: [{ id: 38, livello: 52 }, { id: 59, livello: 53 }],
    dialogo_prima: 'Sti Pokémon de fòco ce piaceno più della lava vera.',
    dialogo_dopo: 'Mo\' me sa che devo raffreddamme un attimo.',
    premio: 1600,
  },
  'gdf_grotta_vulcano_1f_8': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Domiziano',
    squadra: [{ id: 344, livello: 52 }, { id: 338, livello: 52 }],
    dialogo_prima: 'Terra e roccia, propio come sta grotta. Provace.',
    dialogo_dopo: 'Nun ce posso fà gnente, sei più forte.',
    premio: 1600,
  },
  'gdf_grotta_vulcano_1f_9': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Erasmo',
    squadra: [{ id: 229, livello: 53 }, { id: 359, livello: 52 }],
    dialogo_prima: 'Qua dentro er buio te magna, statte attento.',
    dialogo_dopo: 'Va bè, oggi hai vinto tu.',
    premio: 1630,
  },
  'gdf_grotta_vulcano_1f_10': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Ufficiale GdF', nome: 'Vitaliano',
    squadra: [{ id: 306, livello: 53 }, { id: 136, livello: 52 }],
    dialogo_prima: 'Sei arrivato fin qua? Mo\' se fa sul serio.',
    dialogo_dopo: 'Nun era mai successo. Er Comandante nun sarà contento.',
    premio: 1700,
  },
  'gdf_grotta_vulcano_1f_11': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Ufficiale GdF', nome: 'Corradino',
    squadra: [{ id: 324, livello: 53 }, { id: 323, livello: 53 }],
    dialogo_prima: 'Semo vicini ar nucleo. Da qui nun se passa senza combatte.',
    dialogo_dopo: 'Mo\' capisco perché er Comandante te vò fermà a tutti i costi.',
    premio: 1700,
  },
  'gdf_grotta_vulcano_1f_12': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 6,
    classe: 'Ufficiale GdF', nome: 'Massimiliano',
    squadra: [{ id: 248, livello: 54 }, { id: 229, livello: 53 }, { id: 219, livello: 52 }],
    dialogo_prima: 'So\' l\'ufficiale più anziano de sta grotta. Chi vò passà, prima deve passà da me.',
    dialogo_dopo: 'Nemmanco io so\' bastato... Vai, ma stacce accorto.',
    premio: 2100,
  },

  /* ── GROTTA DEL VULCANO — 2° piano (grotta_vulcano_2f.tmj, sess. 8 set
     2026): 6 trainer "tostini" (livello un gradino sopra il 1f, 54-58), già
     piazzati sul layer eventi in posizioni provvisorie — Luca li sposta a
     piacere in Tiled, qui restano solo i dati (squadra/dialoghi/premio). */
  'gdf_grotta_vulcano_2f_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Soldato GdF', nome: 'Aureliano',
    squadra: [{ id: 28, livello: 54 }, { id: 219, livello: 55 }],
    dialogo_prima: 'Mo\' te fermo io, statte bono.',
    dialogo_dopo: 'Vabbè, oggi te va bene così.',
    premio: 1750,
  },
  'gdf_grotta_vulcano_2f_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Soldato GdF', nome: 'Ciriaco',
    squadra: [{ id: 51, livello: 55 }, { id: 105, livello: 56 }],
    dialogo_prima: 'Ancora avanti? Sei più tosto de quello che pensavo.',
    dialogo_dopo: 'Mannaggia a mme e a chi m\'ha mannato qua.',
    premio: 1780,
  },
  'gdf_grotta_vulcano_2f_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Bonaventura',
    squadra: [{ id: 302, livello: 56 }, { id: 208, livello: 55 }],
    dialogo_prima: 'Più vai giù, più fa caldo — e più semo tosti noi.',
    dialogo_dopo: 'Bella lotta davero, ma nun te ce abituà.',
    premio: 1800,
  },
  'gdf_grotta_vulcano_2f_4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Filiberto',
    squadra: [{ id: 38, livello: 56 }, { id: 323, livello: 57 }],
    dialogo_prima: 'Er Comandante nun deve esse disturbato. Fine der discorso.',
    dialogo_dopo: 'Nun ce posso crede... continua pure, ma stacce accorto.',
    premio: 1830,
  },
  'gdf_grotta_vulcano_2f_5': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Ottone',
    squadra: [{ id: 227, livello: 56 }, { id: 344, livello: 57 }],
    dialogo_prima: 'Da qui in poi è tutta salita, giovino. E nun parlo solo della strada.',
    dialogo_dopo: 'Vabbè, mo\' famme passà er dolore in pace.',
    premio: 1850,
  },
  'gdf_grotta_vulcano_2f_6': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Ufficiale GdF', nome: 'Costantino',
    squadra: [{ id: 359, livello: 57 }, { id: 306, livello: 58 }],
    dialogo_prima: 'Er Comandante sa sempre chi je passa davanti. E mo\' sa pure de te.',
    dialogo_dopo: 'Continua pure... tanto lo sa già che stai arivanno.',
    premio: 1900,
  },

  /* ── GROTTA DEL VULCANO — 3° piano (grotta_vulcano_3f.tmj, sess. 8 set
     2026): 4 grunt "tostini" (Lv54-56, individualmente sfidabili con [A],
     riferimenti "grunt" nel layer eventi) + la catena finale del boss (2
     lotte di fila, vedi dati.prossimaLotta e _avviaLottaTrainer in js/map.js).
     Il quinto "grunt" più vicino al boss (il "luogotenente" visivo) resta un
     NPC decorativo — NON ha una voce trainer propria, la sua identità è
     "presa in prestito" dal primo stadio della catena qui sotto. ── */
  'gdf_grotta_vulcano_3f_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Marcantonio',
    squadra: [{ id: 105, livello: 54 }, { id: 76, livello: 55 }],
    dialogo_prima: 'Quaggiù nemmeno la luce ce prova più a entrà. E manco tu passi.',
    dialogo_dopo: 'Va bene, va bene... nun me guardà così.',
    premio: 1850,
  },
  'gdf_grotta_vulcano_3f_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Veterano GdF', nome: 'Sigismondo',
    squadra: [{ id: 38, livello: 55 }, { id: 323, livello: 54 }],
    dialogo_prima: 'Er nucleo è vicino. Da qui, o me batti o te ne torni indietro.',
    dialogo_dopo: 'Complimenti... nun capita spesso de perde quaggiù.',
    premio: 1850,
  },
  'gdf_grotta_vulcano_3f_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Ufficiale GdF', nome: 'Zenobio',
    squadra: [{ id: 208, livello: 55 }, { id: 219, livello: 54 }],
    dialogo_prima: 'Er Comandante sta a du\' passi da qui. Prima passi da me.',
    dialogo_dopo: 'Mo\' me tocca annà a dijelo io stesso... che sfiga.',
    premio: 1880,
  },
  'gdf_grotta_vulcano_3f_4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 5,
    classe: 'Ufficiale GdF', nome: 'Venanzio',
    squadra: [{ id: 359, livello: 55 }, { id: 262, livello: 56 }],
    dialogo_prima: 'Tra un po\' senti puzza de zolfo vero, eh? Significa che sei arrivato troppo avanti.',
    dialogo_dopo: 'Vabbè... vedi tu de cavattela con quelli dopo de me.',
    premio: 1880,
  },
  // Stadio 1 della catena finale: il "sottocomandante" (luogotenente), più
  // forte di un grunt normale ma sotto al boss. La battuta d'apertura è
  // quella "tipica da cattivo" del Comandante in persona (parla lui appena
  // ti avvicini, anche se a scendere in campo per primo è il suo
  // luogotenente) — vedi prossimaLotta per il collegamento allo stadio 2.
  'gdf_grotta_vulcano_luogotenente': {
    // Questo è il trainer FISICAMENTE sulla mappa (marcatore "boss" in
    // Tiled): il primo che il giocatore incontra e affronta, sprite da
    // grunt (voluto — è solo il luogotenente, non il vero comandante).
    // Giovanni in persona entra in scena SOLO dopo, camminando verso il
    // giocatore, vedi _arrivoGiovanniGrottaVulcano in js/map.js.
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 6,
    classe: 'Luogotenente GdF', nome: 'Levantino',
    squadra: [{ id: 112, livello: 57 }, { id: 229, livello: 58 }],
    // Il vero discorso da cattivo lo fa Giovanni PRIMA di questa lotta (vedi
    // _prossimitaSpotta in js/map.js, che mostra un dialogo multi-pagina
    // apposito prima di chiamare _avviaLottaTrainer) — qui resta solo la
    // battuta di passaggio di consegne a Levantino, breve apposta.
    dialogo_prima: 'Come ordinato, Comandante. Vediamo di cosa sei capace...',
    dialogo_dopo: 'Il Comandante non sarà contento... ma sei più forte di quanto pensassi.',
    premio: 2200,
    prossimaLotta: 'gdf_boss_grotta_vulcano',
  },
  // Stadio 2 (finale) della catena: il vero Comandante GdF, Giovanni (sprite
  // trainer_LEADER_Giovanni, richiesta esplicita di Luca). Sconfiggerlo
  // (vedi _applicaEsitoTrainer in js/map.js, blocco "id === 'gdf_boss_grotta_vulcano'")
  // fa scattare in automatico la seconda parte della cutscene (ritirata +
  // scienziato liberato + Pietra Rubino), CUTSCENE['grotta_vulcano_boss_dopo']
  // in dati/cutscene.js.
  'gdf_boss_grotta_vulcano': {
    sprite: 'NPC', ritratto: 'trainer_LEADER_Giovanni', vista: 0,
    classe: 'Comandante GdF', nome: 'Giovanni',
    squadra: [{ id: 306, livello: 60 }, { id: 373, livello: 61 }, { id: 376, livello: 62 }],
    dialogo_prima: 'Basta così. Adesso vengo io di persona — e questa volta non ti sbaglierai due volte.',
    dialogo_dopo: 'Impossibile... IMPOSSIBILE!',
    premio: 3200,
  },

  /* ── PALESTRA DI ROCCA DI PAPA (tipo Lotta, 5ª città — cap 40) ──
     7 gregari + Capopalestra Baso. Squadre/dialoghi da PALESTRE['rocca-di-papa']
     (js/data.js). Il leader assegna la Medaglia Pigna e alza il level cap a 40.
     NB: l'interno (interno_palestra_rocco) non esiste ancora — quando lo crei in
     Tiled, dai agli oggetti trainer questi stessi id. */

  'gregario 1 palestra rocca di papa': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 7,
    classe: 'Speleologo', nome: 'Dante',
    squadra: [{ id: 66, livello: 34 }, { id: 67, livello: 35 }],
    dialogo_prima: 'Ho esplorato le grotte del Vulcano Laziale. Duro come la roccia che scalo, sono!',
    dialogo_dopo: 'La presa cede, stavolta.',
    premio: 700,
  },
  'gregario 2 palestra rocca di papa': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 7,
    classe: 'Gestore', nome: 'Ubaldo',
    squadra: [{ id: 56, livello: 35 }, { id: 57, livello: 35 }],
    dialogo_prima: 'Gestisco l\'accesso alla palestra. Nessuno passa senza una buona lotta!',
    dialogo_dopo: 'Accesso concesso.',
    premio: 720,
  },
  'gregario 3 palestra rocca di papa': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 7,
    classe: 'Rocciatore', nome: 'Emilio',
    squadra: [{ id: 236, livello: 35 }, { id: 66, livello: 36 }],
    dialogo_prima: 'Scalo le pareti del vulcano per allenamento. I miei Pokémon Lotta sono come me: inscalfibili!',
    dialogo_dopo: 'Scivolato.',
    premio: 740,
  },
  'gregario 4 palestra rocca di papa': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 7,
    classe: 'Minatore', nome: 'Siro',
    squadra: [{ id: 296, livello: 36 }, { id: 67, livello: 37 }],
    dialogo_prima: 'Scavo nel ventre del vulcano. La mia squadra colpisce più duro del peperino!',
    dialogo_dopo: 'Il filone era più sottile del previsto.',
    premio: 760,
  },
  'gregario 5 palestra rocca di papa': {
    sprite: 'trainer_POKEMONRANGER_F', ritratto: 'POKEMONRANGER_F', vista: 7,
    classe: 'Arrampicatrice', nome: 'Mirta',
    squadra: [{ id: 307, livello: 37 }, { id: 237, livello: 38 }],
    dialogo_prima: 'Scalo senza corda ogni mattina. I miei Pokémon hanno l\'agilità della roccia!',
    dialogo_dopo: 'Mi sono calata troppo in basso.',
    premio: 780,
  },
  'gregario 6 palestra rocca di papa': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 7,
    classe: 'Guida', nome: 'Arnaldo',
    squadra: [{ id: 297, livello: 38 }, { id: 57, livello: 38 }],
    dialogo_prima: 'Porto i turisti sul Monte Cavo. Ma gli sfidanti della palestra li fermo io!',
    dialogo_dopo: 'Itinerario imprevisto.',
    premio: 800,
  },
  'gregario 7 palestra rocca di papa': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 7,
    classe: 'Vulcanologo', nome: 'Furio',
    squadra: [{ id: 67, livello: 38 }, { id: 296, livello: 39 }],
    dialogo_prima: 'Studio l\'attività vulcanica del Lazio. Eruzioni come queste non si vedono tutti i giorni!',
    dialogo_dopo: 'Eruzione inaspettata.',
    premio: 820,
  },
  'gym_leader_palestra rocca di papa': {
    sprite: 'trainer_ELITEFOUR_Bruno', ritratto: 'ELITEFOUR_Bruno', vista: 0,
    classe: 'Capopalestra', nome: 'Baso',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 107, livello: 36 },  // Hitmonchan
      { id: 106, livello: 37 },  // Hitmonlee
      { id: 286, livello: 38 },  // Breloom
      { id: 308, livello: 39 },  // Medicham
      { id: 68,  livello: 40 },  // Machamp (l'asso)
    ],
    dialogo_prima: 'Fermo lì! Sono Baso di Rocca di Papa, e qui ci si allena scalando la pietra viva del Vulcano Laziale! Il Monte Cavo ci guarda: i miei Pokémon hanno i pugni duri come il peperino su cui mi alleno. Spero che tu non sia di quelli che si sgretolano al primo colpo!',
    dialogo_dopo: 'Mi hai frantumato le certezze! Sei duro come il peperino. Prendi la Medaglia Pigna!',
    premio: 4000,
    palestraId: 'rocca-di-papa',   // → assegna la Medaglia Pigna e alza il level cap a 40
  },

  /* ── PALESTRA DI ALBANO LAZIALE (tipo Roccia, 6ª città — cap 46) ──
     8 gregari + Capopalestra Giorgia. Squadre/dialoghi da PALESTRE['albano']
     (js/data.js). Il leader assegna la Medaglia Scudo e alza il level cap a 46.
     NB: l'interno (palestra_albano_interno) non esiste ancora — quando lo crei
     in Tiled, dai agli oggetti trainer questi stessi id. */

  'gregario 1 palestra albano': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 7,
    classe: 'Legionario', nome: 'Decio',
    squadra: [{ id: 74, livello: 40 }, { id: 95, livello: 41 }],
    dialogo_prima: 'AVE! Primo ostacolo: il legionario Decio. Nessuno passa senza combattere!',
    dialogo_dopo: 'Ritirata tattica.',
    premio: 900,
  },
  'gregario 2 palestra albano': {
    sprite: 'trainer_CRUSHGIRL', ritratto: 'CRUSHGIRL', vista: 7,
    classe: 'Gladiatrice', nome: 'Fulva',
    squadra: [{ id: 75, livello: 41 }, { id: 185, livello: 41 }],
    dialogo_prima: 'Nell\'arena non si danno sconti. Manco qui!',
    dialogo_dopo: 'Pollice verso. Hai vinto.',
    premio: 920,
  },
  'gregario 3 palestra albano': {
    sprite: 'trainer_COOLTRAINER_M', ritratto: 'COOLTRAINER_M', vista: 7,
    classe: 'Centurione', nome: 'Marco',
    squadra: [{ id: 95, livello: 42 }, { id: 299, livello: 42 }],
    dialogo_prima: 'Comando la terza coorte di questa palestra. A me si risponde con la forza della pietra!',
    dialogo_dopo: 'La coorte si ritira.',
    premio: 940,
  },
  'gregario 4 palestra albano': {
    sprite: 'trainer_LADY', ritratto: 'LADY', vista: 7,
    classe: 'Veterana', nome: 'Cesira',
    squadra: [{ id: 74, livello: 43 }, { id: 213, livello: 43 }],
    dialogo_prima: 'Vent\'anni di servizio nei Castra Albana. Sfida ogni legionario che trova!',
    dialogo_dopo: 'Rispetto per il vincitore.',
    premio: 960,
  },
  'gregario 5 palestra albano': {
    sprite: 'trainer_CHAMPION', ritratto: 'CHAMPION', vista: 7,
    classe: 'Campione', nome: 'Tertio',
    squadra: [{ id: 222, livello: 43 }, { id: 347, livello: 43 }],
    dialogo_prima: 'Sono il campione dei giochi gladiatori di Albano. Preparati a difenderti!',
    dialogo_dopo: 'Sconfitta onorevole.',
    premio: 960,
  },
  'gregario 6 palestra albano': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 7,
    classe: 'Tribuno', nome: 'Vibio',
    squadra: [{ id: 185, livello: 44 }, { id: 348, livello: 44 }],
    dialogo_prima: 'Come tribuno mi spetta l\'ultima parola prima del Capopalestra. Dimostrami di valere!',
    dialogo_dopo: 'Parola data: passi.',
    premio: 980,
  },
  'gregario 7 palestra albano': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 7,
    classe: 'Optio', nome: 'Lucio',
    squadra: [{ id: 299, livello: 44 }, { id: 75, livello: 45 }],
    dialogo_prima: 'L\'optio è il braccio destro del centurione. Io sono il braccio destro di Giorgia!',
    dialogo_dopo: 'Il braccio ha ceduto.',
    premio: 1000,
  },
  'gregario 8 palestra albano': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 7,
    classe: 'Pretoriano', nome: 'Pio',
    squadra: [{ id: 348, livello: 45 }, { id: 213, livello: 45 }],
    dialogo_prima: 'Proteggo il Capopalestra. Nessuno entra senza battere me. NESSUNO!',
    dialogo_dopo: 'La guardia è caduta.',
    premio: 1020,
  },
  'gym_leader_palestra albano': {
    sprite: 'Giorgia_capopalestra', ritratto: 'LEADER_Brock', vista: 0,
    classe: 'Capopalestra', nome: 'Giorgia',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 28,  livello: 42 },  // Sandslash
      { id: 305, livello: 43 },  // Lairon
      { id: 76,  livello: 44 },  // Golem
      { id: 112, livello: 45 },  // Rhydon
      { id: 306, livello: 46 },  // Aggron (l'asso)
    ],
    dialogo_prima: 'ALT! Chi entra nei Castra Albana deve dimostrare il proprio valore! Sono Giorgia: queste mura sono di pietra viva da duemila anni, e la mia palestra ne custodisce la durezza. Niente trucchi, niente scuse: solo pietra contro pietra. AVE!',
    dialogo_dopo: 'Per Giove! Sei duro come queste mura. La Medaglia Scudo è tua, ad maiora!',
    premio: 4600,
    palestraId: 'albano',   // → assegna la Medaglia Scudo e alza il level cap a 46
  },

  'gym_leader_palestra marino': {
    sprite: 'marino_capopalestra', ritratto: 'LEADER_Misty', vista: 0,
    classe: 'Capopalestra', nome: 'Moro',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 279, livello: 25 },  // Pelipper
      { id: 119, livello: 26 },  // Seaking
      { id: 195, livello: 26 },  // Quagsire
      { id: 184, livello: 27 },  // Azumarill
      { id: 130, livello: 28 },  // Gyarados (l'asso)
    ],
    dialogo_prima: 'Ehilà! Sono Moro, come i Quattro Mori della nostra fontana! Lo sai che alla Sagra dell\'Uva la fontana versa vino invece dell\'acqua? Ma per i miei Pokémon solo acqua di sorgente, eh! Vediamo se sai navigare in acque agitate!',
    dialogo_dopo: 'Mi hai travolto come una piena! Quest\'anno alla Sagra la fontana verserà in tuo onore. Ecco la Medaglia Fontana!',
    premio: 2800,
    palestraId: 'marino',   // → assegna la Medaglia Fontana e alza il level cap a 28
  },

  /* ── PALESTRA DI ARICCIA (tipo Buio, 7ª città — cap 52) ──
     9 gregari + Capopalestra Ombretta. Squadre/dialoghi da PALESTRE['ariccia']
     (js/data.js). Il leader assegna la Medaglia Fraschetta e alza il level cap
     a 52. NB: interno popolato (sessione 11 agosto) ma la porta in Ariccia.tmj
     non esiste ancora — l'edificio esterno va disegnato da Luca prima di poter
     collegare la porta (vedi commento in js/map.js). */

  'gregario 1 palestra ariccia': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 7,
    classe: 'Oste notturno', nome: 'Tonino',
    squadra: [{ id: 261, livello: 46 }, { id: 198, livello: 47 }],
    dialogo_prima: 'La fraschetta di notte è un altro mondo. I miei Pokémon Buio si sentono a casa!',
    dialogo_dopo: 'Luci accese per te, stanotte.',
    premio: 1100,
  },
  'gregario 2 palestra ariccia': {
    sprite: 'trainer_BURGLAR', ritratto: 'BURGLAR', vista: 7,
    classe: 'Porchettaro', nome: 'Sergio',
    squadra: [{ id: 262, livello: 47 }, { id: 228, livello: 47 }],
    dialogo_prima: 'Porchetta e Pokémon Buio: la mia vita. E ora te li metto in campo entrambi!',
    dialogo_dopo: 'Porchetta amara, stavolta.',
    premio: 1120,
  },
  'gregario 3 palestra ariccia': {
    sprite: 'trainer_BEAUTY', ritratto: 'BEAUTY', vista: 7,
    classe: 'Ombra', nome: 'Nera',
    squadra: [{ id: 302, livello: 48 }, { id: 215, livello: 48 }],
    dialogo_prima: 'Sono l\'ombra che si muove senza fare rumore. E i miei Pokémon pure!',
    dialogo_dopo: 'L\'ombra svanisce.',
    premio: 1140,
  },
  'gregario 4 palestra ariccia': {
    sprite: 'trainer_CUEBALL', ritratto: 'CUEBALL', vista: 7,
    classe: 'Fantasma', nome: 'Fantasio',
    squadra: [{ id: 261, livello: 48 }, { id: 359, livello: 49 }],
    dialogo_prima: 'Vengo dal passato di questo ponte. E il mio Absol porta notizie oscure!',
    dialogo_dopo: 'Sparisco nella nebbia.',
    premio: 1160,
  },
  'gregario 5 palestra ariccia': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 7,
    classe: 'Vedetta del ponte', nome: 'Carla',
    squadra: [{ id: 262, livello: 49 }, { id: 228, livello: 49 }],
    dialogo_prima: 'Guardo il ponte giorno e notte. Di notte ci sono cose che è meglio non vedere… e tu sei una di quelle!',
    dialogo_dopo: 'Non lo vedo più arrivare nessuno.',
    premio: 1180,
  },
  'gregario 6 palestra ariccia': {
    sprite: 'trainer_ROCKER', ritratto: 'ROCKER', vista: 7,
    classe: 'Noctambulo', nome: 'Orfeo',
    squadra: [{ id: 198, livello: 49 }, { id: 229, livello: 50 }],
    dialogo_prima: 'Vivo di notte. I miei Pokémon Buio sbocciano sotto la luna!',
    dialogo_dopo: 'Il sole sorge anche per me.',
    premio: 1180,
  },
  'gregario 7 palestra ariccia': {
    sprite: 'trainer_RUINMANIAC', ritratto: 'RUINMANIAC', vista: 7,
    classe: 'Spettro', nome: 'Omberto',
    squadra: [{ id: 302, livello: 50 }, { id: 262, livello: 50 }],
    dialogo_prima: 'Non mi vedi finché non voglio. E quando voglio, è troppo tardi!',
    dialogo_dopo: 'Mi hai visto davvero.',
    premio: 1200,
  },
  'gregario 8 palestra ariccia': {
    sprite: 'trainer_COOLTRAINER_F', ritratto: 'COOLTRAINER_F', vista: 7,
    classe: 'Ombra', nome: 'Marina',
    squadra: [{ id: 319, livello: 50 }, { id: 228, livello: 51 }],
    dialogo_prima: 'I Pokémon Buio che allevo sono affilati come lame. Provami!',
    dialogo_dopo: 'La lama si è spuntata.',
    premio: 1210,
  },
  'gregario 9 palestra ariccia': {
    sprite: 'trainer_SUPERNERD', ritratto: 'SUPERNERD', vista: 7,
    classe: 'Notturno', nome: 'Giorgione',
    squadra: [{ id: 229, livello: 51 }, { id: 359, livello: 51 }],
    dialogo_prima: 'Ultimo ostacolo prima di Ombretta. Supera me se ne sei capace!',
    dialogo_dopo: 'La notte ti appartiene.',
    premio: 1220,
  },
  'gym_leader_palestra ariccia': {
    sprite: 'Capopalestra_Ariccia', ritratto: 'LEADER_Koga', vista: 0,
    classe: 'Capopalestra', nome: 'Ombretta',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 262, livello: 48 },  // Mightyena
      { id: 319, livello: 49 },  // Sharpedo
      { id: 275, livello: 50 },  // Shiftry
      { id: 342, livello: 50 },  // Crawdaunt
      { id: 359, livello: 51 },  // Absol
      { id: 229, livello: 52 },  // Houndoom (l'asso)
    ],
    dialogo_prima: 'Shhh… benvenuto ad Ariccia, dove la notte è padrona. Sono Ombretta. Quando le fraschette si svuotano e il ponte resta solo, i miei Pokémon Buio escono a giocare. Porchetta e vino li lascio agli altri: io mi nutro delle paure degli sfidanti. Fammi vedere le tue!',
    dialogo_dopo: 'Hai acceso una luce nel mio buio… La Medaglia Fraschetta è tua. Ora brindiamo, va\'!',
    premio: 5200,
    palestraId: 'ariccia',   // → assegna la Medaglia Fraschetta e alza il level cap a 52
  },

  /* ── PALESTRA DI GENZANO (tipo Fuoco, 8ª e ultima città — cap 58) ──
     10 gregari + Capopalestra Camilla. Squadre/dialoghi da PALESTRE['genzano']
     (js/data.js). Il leader assegna la Medaglia Lava e alza il level cap a 58. */

  'gregario 1 palestra genzano': {
    sprite: 'trainer_PICNICKER', ritratto: 'PICNICKER', vista: 7,
    classe: 'Fioraio', nome: 'Petalino',
    squadra: [{ id: 4, livello: 52 }, { id: 5, livello: 53 }],
    dialogo_prima: 'I fiori parlano a chi sa ascoltare. E i miei Pokémon di Fuoco li scaldano dalle radici!',
    dialogo_dopo: 'Un petalo caduto.',
    premio: 1300,
  },
  'gregario 2 palestra genzano': {
    sprite: 'trainer_PAINTER', ritratto: 'PAINTER', vista: 7,
    classe: 'Artista', nome: 'Fiamma',
    squadra: [{ id: 37, livello: 53 }, { id: 58, livello: 54 }],
    dialogo_prima: 'Dipingo per l\'Infiorata ogni anno. E i miei Pokémon sono il mio capolavoro vivente!',
    dialogo_dopo: 'Un quadro incompiuto.',
    premio: 1320,
  },
  'gregario 3 palestra genzano': {
    sprite: 'trainer_LADY', ritratto: 'LADY', vista: 7,
    classe: 'Giardiniera', nome: 'Rosa',
    squadra: [{ id: 77, livello: 54 }, { id: 218, livello: 54 }],
    dialogo_prima: 'Ho piantato ogni fiore di questa palestra. E allevo i Pokémon di Fuoco come li coltivo: con pazienza!',
    dialogo_dopo: 'Il gelo ha preso il giardino.',
    premio: 1340,
  },
  'gregario 4 palestra genzano': {
    sprite: 'trainer_BEAUTY', ritratto: 'BEAUTY', vista: 7,
    classe: 'Pittrice dei fiori', nome: 'Elisa',
    squadra: [{ id: 155, livello: 54 }, { id: 255, livello: 55 }],
    dialogo_prima: 'Ogni Infiorata è un capolavoro effimero. Come questa lotta: la perderai in un attimo!',
    dialogo_dopo: 'Il capolavoro è tuo.',
    premio: 1360,
  },
  'gregario 5 palestra genzano': {
    sprite: 'trainer_AROMALADY', ritratto: 'AROMALADY', vista: 7,
    classe: 'Infioritrice', nome: 'Elena',
    squadra: [{ id: 156, livello: 55 }, { id: 219, livello: 55 }],
    dialogo_prima: 'Conosco ogni tecnica dell\'Infiorata. E dei Pokémon di Fuoco pure!',
    dialogo_dopo: 'I petali si disperdono.',
    premio: 1380,
  },
  'gregario 6 palestra genzano': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 7,
    classe: 'Custode del braciere', nome: 'Dino',
    squadra: [{ id: 78, livello: 55 }, { id: 256, livello: 56 }],
    dialogo_prima: 'Tengo in ordine questa palestra. E tengo in ordine anche i rivali scomodi!',
    dialogo_dopo: 'Disordine.',
    premio: 1380,
  },
  'gregario 7 palestra genzano': {
    sprite: 'trainer_COOLTRAINER_F', ritratto: 'COOLTRAINER_F', vista: 7,
    classe: 'Fatina della brace', nome: 'Titania',
    squadra: [{ id: 219, livello: 56 }, { id: 322, livello: 56 }],
    dialogo_prima: 'I miei Pokémon di Fuoco sono benedetti dal calore dell\'Infiorata. Non hai scampo!',
    dialogo_dopo: 'La magia si è infranta.',
    premio: 1400,
  },
  'gregario 8 palestra genzano': {
    sprite: 'trainer_JUGGLER', ritratto: 'JUGGLER', vista: 7,
    classe: 'Custode delle Fiamme', nome: 'Mirko',
    squadra: [{ id: 218, livello: 56 }, { id: 156, livello: 57 }],
    dialogo_prima: 'Conosco l\'arte antica del fuoco che nutre. La imparo dai vecchi libri dell\'Infiorata!',
    dialogo_dopo: 'L\'incantesimo si è rotto.',
    premio: 1420,
  },
  'gregario 9 palestra genzano': {
    sprite: 'trainer_POKEMANIAC', ritratto: 'POKEMANIAC', vista: 7,
    classe: 'Cantastorie', nome: 'Orazio',
    squadra: [{ id: 126, livello: 57 }, { id: 324, livello: 57 }],
    dialogo_prima: 'Racconto le leggende dell\'Infiorata ai bambini. Ma stasera racconto la tua sconfitta!',
    dialogo_dopo: 'Questa storia non me la aspettavo.',
    premio: 1440,
  },
  'gregario 10 palestra genzano': {
    sprite: 'trainer_CHANNELER', ritratto: 'CHANNELER', vista: 7,
    classe: 'Gran Maga della Brace', nome: 'Ninfa',
    squadra: [{ id: 59, livello: 57 }, { id: 38, livello: 57 }],
    dialogo_prima: 'Sono la custode dei segreti dell\'Infiorata. L\'ultima porta prima di Camilla: aprila solo se sei pronto!',
    dialogo_dopo: 'Il segreto è tuo ora.',
    premio: 1460,
  },
  'gym_leader_palestra genzano': {
    // sprite overworld vero (fornito da Luca, sess. 19 set 2026); ritratto da
    // battaglia resta il placeholder Essentials finché non arriva quello dedicato.
    sprite: 'trainer_LEADER_Camilla', ritratto: 'LEADER_Blaine', vista: 0,
    classe: 'Capopalestra', nome: 'Camilla',
    pokemonFianco: true,   // il Pokémon più forte (l'asso, ultimo della squadra) fisso al fianco
    squadra: [
      { id: 38,  livello: 54 },  // Ninetales
      { id: 126, livello: 55 },  // Magmar
      { id: 323, livello: 55 },  // Camerupt
      { id: 324, livello: 56 },  // Torkoal
      { id: 136, livello: 57 },  // Flareon
      { id: 59,  livello: 58 },  // Arcanine (l'asso)
    ],
    dialogo_prima: 'Benvenuto a Genzano, dove ogni giugno la via si copre di petali per l\'Infiorata! Sono Camilla, l\'ultima Capopalestra dei Castelli. Sotto questi fiori scorre il calore del vulcano laziale: senza quel fuoco, l\'Infiorata non fiorirebbe così bella. I miei Pokémon di tipo Fuoco sono la stessa fiamma che nutre i miei fiori. Sei l\'ultimo quadro della mia Infiorata: vediamo di che colori sei fatto!',
    dialogo_dopo: 'Splendido… un capolavoro degno dell\'Infiorata! La Medaglia Lava è tua: ora la Via Vittoria e la Lega di Colonna ti aspettano!',
    premio: 5800,
    palestraId: 'genzano',   // → assegna la Medaglia Lava e alza il level cap a 58
  },

  /* ── TEAM GdF all'Abbazia di San Nilo (Grottaferrata) — 3 grunt (Lv 18-21) ──
     Presidiano l'ingresso dell'Abbazia. Vedi docs/REMINDER-MAPPE-FUTURE.md (MOD 1). */
  'gdf_grunt_abbazia_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 3,
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 19, livello: 18 }, { id: 109, livello: 19 }],
    dialogo_prima: 'Ehi! Non dovresti essere qui. Muoviti, non c\'è niente da vedere.',
    dialogo_dopo: 'Il Comandante ha già tutto sotto controllo... le coordinate sono trasmesse.',
    premio: 600,
  },
  'gdf_grunt_abbazia_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 3,
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 23, livello: 19 }, { id: 88, livello: 20 }],
    dialogo_prima: 'Questo posto ha segreti di secoli fa, e il Comandante li conosce tutti. Battiti!',
    dialogo_dopo: 'Non importa... il piano è già in moto.',
    premio: 640,
  },
  'gdf_grunt_abbazia_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo', vista: 7,
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 42, livello: 20 }, { id: 89, livello: 21 }],
    dialogo_prima: 'La porta? È sbarrata. Solo chi ha l\'autorizzazione del Comandante entra.',
    dialogo_dopo: 'Risvegliare i Pokémon dell\'abisso e della terra è solo questione di tempo...',
    premio: 680,
  },

  /* ── TEAM GdF a Castel Gandolfo (Villa Pontificia) — 7 grunt (Lv 40-45) ──
     Presidiano l'angolo nord-est della mappa, davanti alla Villa. Il #7 (gdf-villa-7)
     custodisce il documento: a vittoria setta il flag "documentoVillaOttenuto" (letto
     dal futuro trigger del Museo delle Navi di Nemi). Dialoghi in tmj castel_gandolfo. */
  'gdf-villa-1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 24, livello: 39 }, { id: 42, livello: 40 }],
    dialogo_prima: 'Ehi tu! Questa è zona riservata. La Villa è sotto il nostro controllo!',
    dialogo_dopo: 'Ao, e mo\' come lo dico al Comandante...',
    premio: 1600,
  },
  'gdf-villa-2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 89, livello: 40 }, { id: 20, livello: 41 }],
    dialogo_prima: 'Un ragazzino? Il Comandante Crasso ci ha detto di non far passare NESSUNO.',
    dialogo_dopo: 'Nun ce posso crede... manco tu dovevi passà.',
    premio: 1640,
  },
  'gdf-villa-3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 110, livello: 41 }, { id: 24, livello: 42 }],
    dialogo_prima: 'Cerchiamo un documento negli archivi pontifici. Ma tu non hai visto niente, chiaro?',
    dialogo_dopo: '...Va bene, hai visto tutto. Ma dillo in giro e sei finito.',
    premio: 1680,
  },
  'gdf-villa-4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 42, livello: 41 }, { id: 89, livello: 42 }],
    dialogo_prima: 'Il meteo dei Castelli sarà nostro! Immagina: pioggia a comando sulle vigne dei concorrenti...',
    dialogo_dopo: 'Bah, mo\' me tocca aspettà Kyogre pure per asciugamme.',
    premio: 1680,
  },
  'gdf-villa-5': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 24, livello: 42 }, { id: 110, livello: 43 }],
    dialogo_prima: 'Fulvia dice che sei tu quello che ci dà fastidio da Frascati. Ora ci penso io!',
    dialogo_dopo: 'Fulvia me l\'aveva detto che eri forte... e mo\' me tocca ammette che aveva ragione.',
    premio: 1720,
  },
  'gdf-villa-6': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 89, livello: 43 }, { id: 42, livello: 44 }],
    dialogo_prima: 'Sei arrivato fin qui? Non importa. Quello che cercavamo l\'abbiamo già trovato.',
    dialogo_dopo: 'Vai pure avanti, tanto è già troppo tardi.',
    premio: 1760,
  },
  // Fernando: primo dei 3 luogotenenti GdF (sess. 8 set 2026, arco riscritto —
  // vedi docs/STORIA_COMPLETA.md). Non dà una parte della password (quella è
  // solo Lab CoTrAL/Michela/Ginevra): la sua sconfitta rivela il documento che
  // punta al Museo delle Navi di Nemi.
  'gdf-villa-7': {
    sprite: 'Luogotenente_GdF_1', ritratto: 'Luogotenente_GdF_1',
    classe: 'Luogotenente GdF', nome: 'Fernando',
    squadra: [{ id: 110, livello: 44 }, { id: 24, livello: 45 }],
    dialogo_prima: 'Il documento? Non passa da un dilettante come te. Sono Fernando, e questi archivi li difendo io di persona.',
    dialogo_dopo: 'Il documento dice: \'Le pietre riposano al Museo delle Barche di Nemi\'. ...Aspetta, se ve ne siete già andati lì... devo correre a Nemi ad avvisare Michela!',
    premio: 1800,
    flagVittoria: 'documentoVillaOttenuto',
  },

  /* ── TEAM GdF al Lago di Nemi (Atto 4, Museo delle Navi) — 5 grunt (Lv 44-48) ──
     Compaiono solo dopo "documentoVillaOttenuto" (vedi gate 'gdf_gate_nemi' in
     dati/npc.js, property Tiled condizione sullo stesso flag): presidiano il museo
     mentre il Team ruba l'Orb Rossa e l'Orb Blu (STORIA_COMPLETA, Atto 4). */
  'gdf_grunt_nemi_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 24, livello: 44 }, { id: 89, livello: 45 }],
    dialogo_prima: 'Le navi romane nascondono le Orb da secoli. Mo\' so\' nostre.',
    dialogo_dopo: 'Vabbè, hai vinto tu... ma le Orb ce le siamo già prese.',
    premio: 1840,
  },
  'gdf_grunt_nemi_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 110, livello: 45 }, { id: 42, livello: 46 }],
    dialogo_prima: 'Il museo è nostro finché non finiamo il lavoro. Fatti da parte!',
    dialogo_dopo: 'Che ce frega, tanto er Comandante ha già quello che voleva.',
    premio: 1880,
  },
  'gdf_grunt_nemi_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 20, livello: 46 }, { id: 24, livello: 47 }],
    dialogo_prima: 'Rossa e Blu, le abbiamo trovate esattamente dove diceva il documento.',
    dialogo_dopo: 'Sei forte, ma sei arrivato troppo tardi.',
    premio: 1920,
  },
  'gdf_grunt_nemi_4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 89, livello: 47 }, { id: 110, livello: 47 }],
    dialogo_prima: 'Kyogre e Groudon si risveglieranno grazie a queste due pietre. Non puoi fermarci.',
    dialogo_dopo: 'Ao, sei tosto... ma è già troppo tardi per fermare il piano.',
    premio: 1960,
  },
  'gdf_grunt_nemi_5': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 42, livello: 47 }, { id: 24, livello: 48 }],
    dialogo_prima: 'L\'ultimo ostacolo prima che ce ne annamo con le Orb. Fatte sotto.',
    dialogo_dopo: 'Va bene, va bene... ma il Comandante è già lontano da qui.',
    premio: 2000,
  },

  /* ── TEAM GdF — Museo delle Navi di Nemi (2 piani, sessione 12 agosto) ──
     3 grunt + Michela, secondo dei 3 luogotenenti GdF (sess. 8 set 2026 —
     vedi docs/STORIA_COMPLETA.md): sconfiggerla dà la 2ª parte della
     password del Rifugio GdF di Marino (flagVittoria 'museo_nemi_password'). */
  'gdf_grunt_museo_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 24, livello: 46 }, { id: 89, livello: 47 }],
    dialogo_prima: 'Il museo è chiuso al pubblico. Motivi de sicurezza, capisci?',
    dialogo_dopo: 'Vabbè... ma il Capo è ancora di sopra.',
    premio: 1840,
  },
  'gdf_grunt_museo_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 110, livello: 47 }, { id: 42, livello: 48 }],
    dialogo_prima: 'Nun te distraeva, e nun te distraere pure tu!',
    dialogo_dopo: 'Fatte sotto pure col Capo, allora, se sei così tosto.',
    premio: 1880,
  },
  'gdf_grunt_museo_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 20, livello: 48 }, { id: 24, livello: 49 }],
    dialogo_prima: 'Er Capo nun vuole ospiti. Levate!',
    dialogo_dopo: 'Mo\' te tocca er Capo. Buona fortuna, ne avrai bisogno.',
    premio: 1920,
  },
  'gdf_capo_museo': {
    sprite: 'Luogotenente_GdF_2', ritratto: 'Luogotenente_GdF_2',
    classe: 'Luogotenente GdF', nome: 'Michela',
    squadra: [
      { id: 130, livello: 48 },  // Gyarados
      { id: 24,  livello: 49 },
      { id: 195, livello: 50 },  // Quagsire
    ],
    dialogo_prima: 'Fernando mi ha avvisato in tempo. Sono Michela, e questo museo resta sotto il nostro controllo.',
    dialogo_dopo: 'Tié... la seconda parte della password del rifugio. Tanto er piano è già avanti.',
    premio: 3400,
    flagVittoria: 'museo_nemi_password',
  },

  /* ── TEAM GdF — Interno dell'Abbazia di San Nilo (Grottaferrata, sess. 8
     set 2026): accessibile solo con ≥7 medaglie (gate sul warp in
     grottaferrata.tmj). 5 grunt + Ginevra, terza e ultima luogotenente —
     sconfitta dà la 3ª parte della password del Rifugio GdF di Marino (vedi
     _controllaPasswordRifugio in js/map.js e docs/STORIA_COMPLETA.md). ── */
  'gdf_sannilo_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 302, livello: 49 }, { id: 51, livello: 50 }],
    dialogo_prima: 'Ginevra ci ha detto di non far passare nessuno oltre le panche. Fatti sotto!',
    dialogo_dopo: 'Vabbè... ma tanto oltre di me c\'è chi è molto più tosto.',
    premio: 2000,
  },
  'gdf_sannilo_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 268, livello: 49 }, { id: 267, livello: 50 }],
    dialogo_prima: 'Quest\'Abbazia nasconde più segreti di quanto pensi. Ma tu non li scoprirai.',
    dialogo_dopo: 'Ao, sei forte... ma Ginevra è un\'altra storia.',
    premio: 2040,
  },
  'gdf_sannilo_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 227, livello: 50 }, { id: 31, livello: 51 }],
    dialogo_prima: 'Il Comandante conta su di noi per proteggere l\'ultima parte della password.',
    dialogo_dopo: 'Mo\' te tocca passà da Ginevra. Buona fortuna, ne avrai bisogno.',
    premio: 2080,
  },
  'gdf_sannilo_4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 302, livello: 50 }, { id: 354, livello: 51 }],
    dialogo_prima: 'Fernando e Michela sono già stati sconfitti. Ginevra non farà lo stesso errore.',
    dialogo_dopo: 'Nun ce posso crede... sei arrivato fin qui davvero.',
    premio: 2120,
  },
  'gdf_sannilo_5': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 267, livello: 51 }, { id: 268, livello: 51 }],
    dialogo_prima: 'Ultimo ostacolo prima dell\'altare. Ginevra ti sta aspettando lì davanti.',
    dialogo_dopo: 'Vai pure avanti... tanto per te è comunque finita.',
    premio: 2160,
  },
  'gdf_sannilo_ginevra': {
    sprite: 'Luogotenente_Cotral_Rifugio_rocca_di_papa', ritratto: 'Luogotenente_Cotral_Rifugio_rocca_di_papa',
    classe: 'Luogotenente GdF', nome: 'Ginevra',
    squadra: [
      { id: 302, livello: 50 },
      { id: 354, livello: 51 },  // Banette
      { id: 227, livello: 52 },  // Skarmory
    ],
    dialogo_prima: 'Fernando ha trovato il documento, Michela ha protetto il museo. A me tocca l\'ultima parte — e non la cedo facilmente.',
    dialogo_dopo: 'Tié... la terza e ultima parte della password. Ora il Rifugio è tutto vostro, se ci arrivate.',
    premio: 3600,
    flagVittoria: 'abbazia_password',
  },

  /* ── TEAM GdF — Rifugio di Marino (dungeon 4 piani: 1F + 2F_A/B/C) ──
     sessione 10 agosto. Livelli 28-37 (contenuto raggiungibile solo a password
     completa, quindi più avanti nel gioco di quanto suggerisca la sola città di
     Marino). Capo GdF su 2F_B (isola) = **Giovanni** (sess. 8 set 2026, arco GdF
     riscritto — vedi docs/STORIA_COMPLETA.md): è lo STESSO comandante che poi
     ritrovi alla Grotta del Vulcano, qui lo incontri PRIMA. Sconfiggerlo qui dà
     la Pietra Zaffiro (Kyogre) — vedi blocco "id === 'gdf_capo_marino'" in
     _applicaEsitoTrainer, js/map.js. */
  'gdf_grunt_marino_1f_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 42, livello: 28 }, { id: 88, livello: 29 }],
    dialogo_prima: 'Fermo là! Questo rifugio non è mica un parco giochi.',
    dialogo_dopo: 'Vabbè... ma tanto qui dentro è tutto blindato lo stesso.',
    premio: 1160,
  },
  'gdf_grunt_marino_1f_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 24, livello: 29 }, { id: 20, livello: 30 }],
    dialogo_prima: 'Come hai fatto ad entrà? La password mica se trova per strada!',
    dialogo_dopo: 'Ao, sei pure forte... ma qui il piano va avanti uguale.',
    premio: 1220,
  },
  'gdf_grunt_marino_1f_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 72, livello: 30 }, { id: 89, livello: 31 }],
    dialogo_prima: 'Il Capo non vuole visite. Levate dai piedi!',
    dialogo_dopo: 'Mo\' te lascio passà, ma non dì che t\'ho aiutato io.',
    premio: 1280,
  },
  'gdf_grunt_marino_1f_4': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 42, livello: 31 }, { id: 24, livello: 32 }],
    dialogo_prima: 'Quest\'acqua nasconde più cose de quello che pensi.',
    dialogo_dopo: 'Va be\', hai vinto. Ma il Capo se sta a preparà da tempo.',
    premio: 1340,
  },
  'gdf_grunt_marino_2fa_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 89, livello: 33 }, { id: 110, livello: 32 }],
    dialogo_prima: 'Er caveau è roba nostra. Nun se tocca!',
    dialogo_dopo: 'E vabbè, so\' cose che càpitano...',
    premio: 1380,
  },
  'gdf_grunt_marino_2fa_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 31, livello: 34 }, { id: 42, livello: 33 }],
    dialogo_prima: 'Qui dentro c\'è più refurtiva che a un mercato de Porta Portese.',
    dialogo_dopo: 'Mo\' me sa che devo cambià lavoro...',
    premio: 1420,
  },
  'gdf_grunt_marino_2fc_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 24, livello: 34 }, { id: 73, livello: 35 }],
    dialogo_prima: 'Perso in questo labirinto de rocce? Te ce faccio perde pe\' davero!',
    dialogo_dopo: 'Non è ancora finita, ma vabbè, avanti così.',
    premio: 1460,
  },
  'gdf_grunt_marino_2fc_2': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 89, livello: 35 }, { id: 20, livello: 34 }],
    dialogo_prima: 'Questi massi nun se spostano da soli, sai?',
    dialogo_dopo: 'Uffa, mo\' devo pure rifà er turno de guardia.',
    premio: 1480,
  },
  'gdf_grunt_marino_2fc_3': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 110, livello: 36 }, { id: 34, livello: 35 }],
    dialogo_prima: 'Ancora un po\' e sei davanti al Capo. Peccato che nun ce arriverai.',
    dialogo_dopo: 'Boh, mo\' famme capì come te lo dico ar Capo...',
    premio: 1520,
  },
  'gdf_grunt_marino_2fb_1': {
    sprite: 'GdF_grunt_uomo', ritratto: 'GdF_grunt_uomo',
    classe: 'Recluta GdF', nome: 'Grunt',
    squadra: [{ id: 73, livello: 37 }, { id: 89, livello: 36 }],
    dialogo_prima: 'Da qui in poi c\'è solo l\'isola del Capo. Nun se passa!',
    dialogo_dopo: 'Vai pure, tanto l\'acqua profonda te ferma uguale...',
    premio: 1560,
  },
  'gdf_capo_marino': {
    sprite: 'NPC', ritratto: 'trainer_LEADER_Giovanni',
    classe: 'Comandante GdF', nome: 'Giovanni',
    squadra: [
      { id: 195, livello: 36 },
      { id: 73, livello: 38 },
      { id: 230, livello: 40 },
    ],
    dialogo_prima: 'Quest\'isola è mia, e presto lo sarà pure quello che dorme sott\'acqua.',
    dialogo_dopo: 'Nun è finita qui... quello che ho svegliato nun se riaddormenta tanto facile.',
    premio: 3200,
  },

  /* ── BOSCHI DEL TUSCOLO — 18 allenatori (da ALLENATORI in data.js) ──
     sprite e "vista" vengono dall'oggetto Tiled (props). Qui: squadra + dialoghi. */

  'all-bosco-1': {
    classe: 'Coleotterista', nome: 'Bruco',
    squadra: [{ id: 10, livello: 8 }, { id: 11, livello: 9 }, { id: 14, livello: 9 }],
    dialogo_prima: 'Shhh! Stavo osservando un Metapod. Ma una bella lotta non si rifiuta mai!',
    dialogo_dopo: 'I miei insetti hanno ancora da crescere.',
    premio: 540,
  },
  'all-bosco-2': {
    classe: 'Scout', nome: 'Tito',
    squadra: [{ id: 13, livello: 9 }, { id: 14, livello: 10 }, { id: 69, livello: 10 }],
    dialogo_prima: 'Conosco ogni sentiero di questo bosco. E ogni allenatore che ci passa lo sfido!',
    dialogo_dopo: 'Mi sono perso... nella tua strategia.',
    premio: 600,
  },
  'all-bosco-3': {
    classe: 'Archeologa', nome: 'Livia',
    squadra: [{ id: 74, livello: 10 }, { id: 46, livello: 11 }],
    dialogo_prima: 'Scavo tra i ruderi del Tuscolo. Sotto la terra dei Castelli c\'è di tutto… anche guai!',
    dialogo_dopo: 'Reperti intatti, orgoglio in frantumi.',
    premio: 660,
  },
  'all-bosco-4': {
    classe: 'Eremita', nome: 'Silvio',
    squadra: [{ id: 43, livello: 10 }, { id: 69, livello: 11 }, { id: 44, livello: 12 }],
    dialogo_prima: 'Vivo nel bosco da anni. I miei Pokémon Erba sono la mia famiglia. Mostrami rispetto… in battaglia!',
    dialogo_dopo: 'La natura sceglie il più forte. Oggi sei tu.',
    premio: 720,
  },
  'all-bosco-5': {
    classe: 'Botanico', nome: 'Fabio',
    squadra: [{ id: 10, livello: 9 }, { id: 46, livello: 10 }],
    dialogo_prima: 'Catalogo le piante di questi boschi. E i Pokémon che ci vivono!',
    dialogo_dopo: 'Nuova voce nel catalogo: ho perso.',
    premio: 580,
  },
  'all-bosco-6': {
    classe: 'Ranger del parco', nome: 'Saveria',
    squadra: [{ id: 13, livello: 10 }, { id: 285, livello: 10 }],
    dialogo_prima: 'Proteggo questo bosco come parte del Parco Regionale. Ogni visitatore viene "testato"!',
    dialogo_dopo: 'Il test l\'hai superato.',
    premio: 600,
  },
  'all-bosco-7': {
    classe: 'Lumacaio', nome: 'Gelsomino',
    squadra: [{ id: 43, livello: 10 }, { id: 13, livello: 11 }],
    dialogo_prima: 'Colleziono lumache e Pokémon lenti ma potenti!',
    dialogo_dopo: 'Sono rimasto indietro.',
    premio: 600,
  },
  'all-bosco-8': {
    classe: 'Studente di storia', nome: 'Agostino',
    squadra: [{ id: 74, livello: 10 }, { id: 10, livello: 11 }],
    dialogo_prima: 'Studio le rovine di Tuscolo per la mia tesi. Ogni pietra ha una storia… come questa lotta!',
    dialogo_dopo: 'Capitolo difficile.',
    premio: 620,
  },
  'all-bosco-9': {
    classe: 'Apicoltore', nome: 'Ciro',
    squadra: [{ id: 13, livello: 10 }, { id: 14, livello: 11 }, { id: 10, livello: 11 }],
    dialogo_prima: 'Le mie api raccolgono il polline in questi boschi. I miei Pokémon Coleottero sono altrettanto laboriosi!',
    dialogo_dopo: 'Le api sono tornate senza miele.',
    premio: 640,
  },
  'all-bosco-10': {
    classe: 'Naturalista', nome: 'Palma',
    squadra: [{ id: 285, livello: 11 }, { id: 46, livello: 11 }],
    dialogo_prima: 'Studio l\'ecosistema dei boschi tuscolani da cinque anni. I Pokémon funghi sono i miei preferiti!',
    dialogo_dopo: 'L\'equilibrio si è rotto.',
    premio: 640,
  },
  'all-bosco-11': {
    classe: 'Gitante domenicale', nome: 'Ermete',
    squadra: [{ id: 43, livello: 11 }, { id: 161, livello: 11 }],
    dialogo_prima: 'Ogni domenica vengo qui a passeggiare. E ogni domenica sfido chi trovo!',
    dialogo_dopo: 'Domenica storta.',
    premio: 660,
  },
  'all-bosco-12': {
    classe: 'Cercatore di funghi', nome: 'Oreste',
    squadra: [{ id: 46, livello: 11 }, { id: 285, livello: 12 }],
    dialogo_prima: 'I funghi più rari crescono vicino ai Pokémon. E io li trovo tutti!',
    dialogo_dopo: 'Fungo avvelenato.',
    premio: 680,
  },
  'all-bosco-13': {
    classe: 'Arrampicatore di rovine', nome: 'Ezio',
    squadra: [{ id: 74, livello: 11 }, { id: 13, livello: 12 }],
    dialogo_prima: 'Salgo sulle mura del teatro romano ogni giorno. Sono il re di queste rovine!',
    dialogo_dopo: 'Sono caduto.',
    premio: 680,
  },
  'all-bosco-14': {
    classe: 'Fotografa naturalistica', nome: 'Serafina',
    squadra: [{ id: 10, livello: 12 }, { id: 11, livello: 12 }],
    dialogo_prima: 'Fotografo i Pokémon selvatici di questo bosco. E quando non trovo soggetti, sfido gli allenatori!',
    dialogo_dopo: 'Foto mossa.',
    premio: 700,
  },
  'all-bosco-15': {
    classe: 'Studente universitario', nome: 'Viterbese',
    squadra: [{ id: 43, livello: 12 }, { id: 187, livello: 12 }],
    dialogo_prima: 'Faccio tesi sulle rovine del Tuscolo. Ho scoperto che alcuni Pokémon vivono nelle rovine stesse!',
    dialogo_dopo: 'La tesi si complica.',
    premio: 700,
  },
  'all-bosco-16': {
    classe: 'Guardia del parco', nome: 'Timoteo',
    squadra: [{ id: 74, livello: 11 }, { id: 46, livello: 12 }, { id: 13, livello: 12 }],
    dialogo_prima: 'Sorvegliate! Questo bosco è protetto. E i Pokémon che vivono qui pure!',
    dialogo_dopo: 'Il parco è tuo ora.',
    premio: 720,
  },
  'all-bosco-17': {
    classe: 'Avventuriero', nome: 'Brenno',
    squadra: [{ id: 44, livello: 12 }, { id: 11, livello: 12 }],
    dialogo_prima: 'Esploro questi boschi in cerca di segreti. E ogni tanto trovo un allenatore valido!',
    dialogo_dopo: 'Il segreto oggi eri tu.',
    premio: 720,
  },
  'all-bosco-18': {
    classe: 'Druida', nome: 'Quirino',
    squadra: [{ id: 46, livello: 12 }, { id: 44, livello: 12 }, { id: 285, livello: 12 }],
    dialogo_prima: 'Questi boschi sono sacri. Sono il guardiano delle rovine del Tuscolo. Dovrai superare me!',
    dialogo_dopo: 'Le rovine ti riconoscono.',
    premio: 740,
  },

  /* ── BOSCHETTO SEGRETO (post-Lega) — allenatori FORTI (Lv 58-62) ── */
  'all-boschetto-1': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 4,
    classe: 'Veterano', nome: 'Egidio',
    squadra: [
      { id: 214, livello: 58 }, { id: 123, livello: 58 }, { id: 212, livello: 59 },
    ],
    dialogo_prima: 'Pochi arrivano fin qui. Hai battuto la Lega? Allora meriti una vera sfida.',
    dialogo_dopo: 'Forte. Davvero forte.',
    premio: 3000,
  },
  'all-bosch-2': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 5,
    classe: 'Ranger Anziana', nome: 'Ortensia',
    squadra: [
      { id: 169, livello: 59 }, { id: 226, livello: 59 }, { id: 277, livello: 60 },
    ],
    dialogo_prima: 'Il bosco protegge i suoi segreti. Io proteggo il bosco.',
    dialogo_dopo: 'Le radici ti hanno accettato.',
    premio: 3100,
  },
  'all-bosch-3': {
    sprite: 'trainer_BIRDKEEPER', ritratto: 'BIRDKEEPER', vista: 4,
    classe: 'Falconiere', nome: 'Tullio',
    squadra: [
      { id: 22, livello: 59 }, { id: 227, livello: 60 }, { id: 198, livello: 60 }, { id: 178, livello: 60 },
    ],
    dialogo_prima: 'I miei rapaci sorvolano il Tuscolo da generazioni. Niente li sorprende.',
    dialogo_dopo: 'Hai occhi più acuti dei miei falchi.',
    premio: 3200,
  },
  'all-bosch-4': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 5,
    classe: 'Entomologo', nome: 'Casimiro',
    squadra: [
      { id: 127, livello: 60 }, { id: 214, livello: 60 }, { id: 212, livello: 61 }, { id: 248, livello: 62 },
    ],
    dialogo_prima: 'In questi boschi vivono insetti che non troverai da nessun\'altra parte. E sono temibili!',
    dialogo_dopo: 'La tua squadra ha un\'armonia rara.',
    premio: 3400,
  },

  /* ── IL SOLITARIO — campione leggendario del boschetto (post-Lega) ── */
  'il_solitario': {
    sprite: 'CAMPIONE_SOLITARIO', ritratto: 'CHAMPION', vista: 1,
    classe: 'Campione', nome: 'Il Solitario',
    squadra: [
      { id: 149, livello: 65 },  // Dragonite
      { id: 376, livello: 65 },  // Metagross
      { id: 350, livello: 66 },  // Milotic
      { id: 359, livello: 66 },  // Absol
      { id: 373, livello: 67 },  // Salamence
      { id: 251, livello: 70 },  // Celebi (l'asso)
    ],
    dialogo_prima: 'Hai attraversato tutto il Tuscolo per arrivare fin qui. Bene. Allora sei pronto.',
    dialogo_dopo: 'Anni di allenamento in silenzio. E tu li hai superati tutti. Questo bosco ha qualcosa di speciale. Ora puoi sentirlo anche tu.',
    premio: 0,
  },

  /* ── RIVALE REMO (Tuscolo) — trainer visibile con linea visiva ──
     In Tiled: oggetto type "trainer" id "rivale_tuscolo" (oppure "trigger_rivale",
     che il motore converte). Con "vista" scatta appena incroci il suo sguardo. */
  'rivale_tuscolo': {
    sprite: 'RIVALE_1', ritratto: 'POKEMONTRAINER_Brendan', vista: 5,
    classe: 'Rivale', nome: 'Remo',
    rivale: true,               // squadra dinamica per "tappa" (l'asso è lo starter)
    flagVittoria: 'rivale_tuscolo_battuto',
    squadra: [                  // fallback se manca la prop "tappa"
      { id: 16,  livello: 12 },   // Pidgey
      { id: 261, livello: 12 },   // Poochyena
      { id: 19,  livello: 14 },   // Rattata
    ],
    dialogo_prima: 'Eh, ti ho beccato! Pensavi di attraversare il MIO Tuscolo senza salutarmi? Forza, fammi vedere quanto vali!',
    dialogo_dopo: 'Ma daiii! Possibile?! …Vabbè, ci rivediamo più avanti. E sarò più forte!',
    premio: 1000,
  },

  /* ── PERCORSO 2 — castagneti collinari (Frascati Est → Grottaferrata), Lv 7-11 ── */

  'all-p2-1': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 4,
    classe: 'Coleotterista', nome: 'Tonino',
    squadra: [ { id: 13, livello: 7 }, { id: 10, livello: 8 } ],
    dialogo_prima: 'Tra \'sti castagni ce stanno certi insetti! Guarda che ho acchiappato!',
    dialogo_dopo: 'Eh, i miei so\' ancora piccoletti.',
    premio: 280,
  },
  'all-p2-2': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 5,
    classe: 'Bambina', nome: 'Rosa',
    squadra: [ { id: 16, livello: 8 }, { id: 183, livello: 9 } ],
    dialogo_prima: 'Vengo qui a raccogliere le castagne con i miei Pokémon! Giochi con noi?',
    dialogo_dopo: 'Uffa, hai vinto. Però le castagne le tengo io!',
    premio: 320,
  },
  'all-p2-3': {
    sprite: 'trainer_YOUNGSTER', ritratto: 'YOUNGSTER', vista: 4,
    classe: 'Pivello', nome: 'Saverio',
    squadra: [ { id: 19, livello: 9 }, { id: 32, livello: 9 } ],
    dialogo_prima: 'Sto sentiero porta a Grottaferrata, ma prima passi da me!',
    dialogo_dopo: 'E mo\' che faccio, ci ripenso a tutto.',
    premio: 360,
  },
  'all-p2-4': {
    sprite: 'trainer_PICNICKER', ritratto: 'PICNICKER', vista: 5,
    classe: 'Pic-nic', nome: 'Carla',
    squadra: [ { id: 29, livello: 9 }, { id: 43, livello: 10 }, { id: 187, livello: 10 } ],
    dialogo_prima: 'Che bel posto per un pranzo all\'aperto! Ma prima... una sfida!',
    dialogo_dopo: 'Vabbè, almeno il panino me lo godo.',
    premio: 400,
  },
  'all-p2-5': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Montanaro', nome: 'Peppe',
    squadra: [ { id: 74, livello: 10 }, { id: 179, livello: 11 } ],
    dialogo_prima: 'Queste colline le conosco a memoria. E i miei Pokémon pure!',
    dialogo_dopo: 'Forte \'sto ragazzino. Buona salita!',
    premio: 440,
  },
  'all-p2-6': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 5,
    classe: 'Esploratore', nome: 'Furio',
    squadra: [ { id: 261, livello: 10 }, { id: 273, livello: 11 }, { id: 16, livello: 11 } ],
    dialogo_prima: 'Ultimo prima di Grottaferrata! Se mi batti, sei pronto per la palestra Psico.',
    dialogo_dopo: 'Battuto in piena regola. Vai pure, il capopalestra ti aspetta!',
    premio: 480,
  },

  /* ── PERCORSO 3 — campagna verso il lago (Grottaferrata → Marino), Lv 9-14 ──
     8 allenatori sul tracciato + 2 nella zona laterale sbloccabile con MN Forza
     (all-gm-extra-1/2). Squadre e livelli da PROMPT_CLAUDE_CODE_aggiornamenti (Mod 2A). */
  'all-gm-1': {
    sprite: 'trainer_YOUNGSTER', ritratto: 'YOUNGSTER', vista: 4,
    classe: 'Pivello', nome: 'Bruno',
    squadra: [ { id: 19, livello: 9 }, { id: 16, livello: 10 } ],
    dialogo_prima: 'Ao, mica te ne vai a Marino senza passà da me! Levati dalla strada... dopo che t\'ho battuto!',
    dialogo_dopo: 'E mo\' la bici me la tengo. Tu però sei forte, ammazza.',
    premio: 200,
  },
  'all-gm-2': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 5,
    classe: 'Bambina', nome: 'Nives',
    squadra: [ { id: 35, livello: 10 }, { id: 39, livello: 11 } ],
    dialogo_prima: 'I miei Pokémon so\' tutti morbidosi! Ma non per questo perdono!',
    dialogo_dopo: 'Uffa, coccoloni ma sconfitti.',
    premio: 220,
  },
  'all-gm-3': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 4,
    classe: 'Coleotterista', nome: 'Pino',
    squadra: [ { id: 13, livello: 10 }, { id: 11, livello: 11 } ],
    dialogo_prima: 'Faccio avanti e indietro tutto il giorno a cercà bachi! Tu fermati a lottà!',
    dialogo_dopo: 'Torno a cercà i miei insetti...',
    premio: 200,
  },
  'all-gm-4': {
    sprite: 'trainer_YOUNGSTER', ritratto: 'YOUNGSTER', vista: 5,
    classe: 'Pivello', nome: 'Tonino',
    squadra: [ { id: 23, livello: 11 }, { id: 27, livello: 12 } ],
    dialogo_prima: 'Verso il lago ci stanno i Pokémon d\'acqua! Ma prima rispondi a me!',
    dialogo_dopo: 'Eh, c\'avevo i miei serpentelli pronti...',
    premio: 240,
  },
  'all-gm-5': {
    sprite: 'trainer_BIRDKEEPER', ritratto: 'BIRDKEEPER', vista: 5,
    classe: 'Ornitologo', nome: 'Aldo',
    squadra: [ { id: 16, livello: 12 }, { id: 41, livello: 13 } ],
    dialogo_prima: 'I miei uccelli volteggiano su tutta la valle! Vediamo se li acchiappi!',
    dialogo_dopo: 'Hanno volato basso oggi, eh.',
    premio: 260,
  },
  'all-gm-6': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 4,
    classe: 'Bambina', nome: 'Gilda',
    squadra: [ { id: 52, livello: 12 }, { id: 54, livello: 13 } ],
    dialogo_prima: 'Il mio gattino e il mio papero ti faranno vedere i sorci verdi!',
    dialogo_dopo: 'Vabbè, hai vinto. Ma sono carini lo stesso!',
    premio: 260,
  },
  'all-gm-7': {
    sprite: 'trainer_YOUNGSTER', ritratto: 'YOUNGSTER', vista: 5,
    classe: 'Pivello', nome: 'Saro',
    squadra: [ { id: 60, livello: 13 }, { id: 118, livello: 14 } ],
    dialogo_prima: 'Già che siamo vicino all\'acqua, t\'ammollo con i miei!',
    dialogo_dopo: 'M\'hai asciugato l\'entusiasmo.',
    premio: 280,
  },
  'all-gm-8': {
    sprite: 'trainer_BIRDKEEPER', ritratto: 'BIRDKEEPER', vista: 5,
    classe: 'Ornitologo', nome: 'Remo',
    squadra: [ { id: 41, livello: 13 }, { id: 42, livello: 14 } ],
    dialogo_prima: 'L\'ultimo prima di Marino! Se passi me, sei pronto per la Fontana!',
    dialogo_dopo: 'Battuto. Vai, a Marino t\'aspetta il capopalestra Moro.',
    premio: 280,
  },
  // Zona laterale — sbloccabile con MN Forza (oltre il masso 'masso_p3_1')
  'all-gm-extra-1': {
    sprite: 'trainer_YOUNGSTER', ritratto: 'YOUNGSTER', vista: 4,
    classe: 'Pivello', nome: 'Cesare',
    squadra: [ { id: 74, livello: 12 }, { id: 75, livello: 14 } ],
    dialogo_prima: 'Hai spostato il masso?! Bravo! Allora sei abbastanza tosto per me!',
    dialogo_dopo: 'Forte come \'na roccia, sei.',
    premio: 280,
  },
  'all-gm-extra-2': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 8,
    classe: 'Bambina', nome: 'Loredana',
    squadra: [ { id: 183, livello: 13 }, { id: 184, livello: 14 } ],
    dialogo_prima: 'Pochi arrivano fin qua! Ti meriti una sfida vera!',
    dialogo_dopo: 'Complimenti, te lo sei guadagnato l\'angolino segreto.',
    premio: 280,
  },

  /* ── VIA DEI LAGHI — la strada che collega Castel Gandolfo, Lago Albano,
     Lago di Nemi, Percorso 4/5 e l'Osservatorio. 23 allenatori in tutto:
     gli 8 già piazzati sulla mappa (via_laghi_trainer_1..8, senza dati fino
     ad ora) + 15 nuovi (via_laghi_trainer_9..23, oggetti aggiunti nel .tmj
     in posizioni di massima — l'utente li ridistribuirà su Tiled). ── */
  'via_laghi_trainer_1': {
    sprite: 'trainer_SAILOR', ritratto: 'SAILOR', vista: 6,
    classe: 'Marinaio', nome: 'Nazzareno',
    squadra: [ { id: 54, livello: 24 }, { id: 118, livello: 26 }, { id: 61, livello: 28 } ],
    dialogo_prima: 'Ao! Sti laghi li conosco a menadito. Famo \'sta lotta, và!',
    dialogo_dopo: 'Vabbè, mo\' me ritiro a riva a leccamme le ferite.',
    premio: 780,
  },
  'via_laghi_trainer_2': {
    sprite: 'trainer_FISHERMAN', ritratto: 'FISHERMAN', vista: 5,
    classe: 'Pescatore', nome: 'Osvaldo',
    squadra: [ { id: 129, livello: 22 }, { id: 98, livello: 24 }, { id: 341, livello: 26 } ],
    dialogo_prima: 'Stavo a pescà tranquillo e mo\' me trovo pure a combatte...',
    dialogo_dopo: 'Nfatti, oggi nun era giornata bona manco pe\' le lotte.',
    premio: 720,
  },
  'via_laghi_trainer_3': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Escursionista', nome: 'Ferruccio',
    squadra: [ { id: 74, livello: 24 }, { id: 66, livello: 26 }, { id: 95, livello: 28 } ],
    dialogo_prima: 'Sto tratto de strada l\'ho fatto mille vorte, ma sfide poche. Daje!',
    dialogo_dopo: 'La roccia regge sempre, io un po\' meno.',
    premio: 780,
  },
  'via_laghi_trainer_4': {
    sprite: 'trainer_BIKER', ritratto: 'BIKER', vista: 6,
    classe: 'Motociclista', nome: 'Italo',
    squadra: [ { id: 109, livello: 24 }, { id: 88, livello: 26 }, { id: 100, livello: 28 } ],
    dialogo_prima: 'Se me sorpassi in salita, te tocca prima batteme!',
    dialogo_dopo: 'Vabbè, mo\' me tocca spinge la moto a piedi...',
    premio: 780,
  },
  'via_laghi_trainer_5': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Campeggiatore', nome: 'Renzo',
    squadra: [ { id: 19, livello: 20 }, { id: 27, livello: 22 }, { id: 263, livello: 24 } ],
    dialogo_prima: 'Ao, so\' accampato qua da \'na settimana. Facciamo \'na lotta pe\' ammazzà er tempo?',
    dialogo_dopo: 'Vabbè, mo\' me rimetto a guardà er fuoco.',
    premio: 660,
  },
  'via_laghi_trainer_6': {
    sprite: 'trainer_PICNICKER', ritratto: 'PICNICKER', vista: 4,
    classe: 'Escursionista', nome: 'Ines',
    squadra: [ { id: 43, livello: 20 }, { id: 69, livello: 22 }, { id: 273, livello: 24 } ],
    dialogo_prima: 'Ho preparato le fraschette pe\' tutti! Prima però, \'na sfida!',
    dialogo_dopo: 'Embè, mo\' me consolo co\' \'na fetta de porchetta.',
    premio: 660,
  },
  'via_laghi_trainer_7': {
    sprite: 'trainer_BIRDKEEPER', ritratto: 'BIRDKEEPER', vista: 8,
    classe: 'Ornitologo', nome: 'Amleto',
    squadra: [ { id: 16, livello: 24 }, { id: 84, livello: 26 }, { id: 276, livello: 28 } ],
    dialogo_prima: 'Sti laghi so\' pieni de uccelli. Pure li mii sanno vola, eh!',
    dialogo_dopo: 'Volato via pure \'sto vantaggio, nfatti.',
    premio: 780,
  },
  'via_laghi_trainer_8': {
    sprite: 'trainer_LADY', ritratto: 'LADY', vista: 5,
    classe: 'Signora', nome: 'Pierina',
    squadra: [ { id: 35, livello: 22 }, { id: 39, livello: 24 }, { id: 300, livello: 26 } ],
    dialogo_prima: 'Che bella passeggiata attorno ar lago! Ti va de sfidamme?',
    dialogo_dopo: 'Embè, la prossima volta faccio \'na passeggiata e basta.',
    premio: 720,
  },
  'via_laghi_trainer_9': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 5,
    classe: 'Gentiluomo', nome: 'Egisto',
    squadra: [ { id: 53, livello: 26 }, { id: 58, livello: 28 }, { id: 52, livello: 30 } ],
    dialogo_prima: 'Buondì. Approfitto de \'sta vista pe\' \'na sfida raffinata.',
    dialogo_dopo: 'Complimenti, un incontro davvero elegante.',
    premio: 840,
  },
  'via_laghi_trainer_10': {
    sprite: 'trainer_AROMALADY', ritratto: 'AROMALADY', vista: 5,
    classe: 'Aromatica', nome: 'Rosalba',
    squadra: [ { id: 45, livello: 26 }, { id: 315, livello: 28 }, { id: 182, livello: 30 } ],
    dialogo_prima: 'Sento er profumo de la vittoria... o forse so\' solo li fiori.',
    dialogo_dopo: 'Vabbè, mo\' me rifaccio er naso co\' \'st\'aria bona.',
    premio: 840,
  },
  'via_laghi_trainer_11': {
    sprite: 'trainer_SWIMMER_M', ritratto: 'SWIMMER_M', vista: 6,
    classe: 'Nuotatore', nome: 'Ubaldo',
    squadra: [ { id: 116, livello: 26 }, { id: 86, livello: 28 }, { id: 8, livello: 30 } ],
    dialogo_prima: 'Sto lago l\'ho attraversato tutto a nuoto! Mo\' famo \'sta lotta!',
    dialogo_dopo: 'Nfatti, mejo in acqua che in battaglia, io.',
    premio: 840,
  },
  'via_laghi_trainer_12': {
    sprite: 'trainer_SWIMMER_F', ritratto: 'SWIMMER_F', vista: 6,
    classe: 'Nuotatrice', nome: 'Wanda',
    squadra: [ { id: 90, livello: 26 }, { id: 120, livello: 28 }, { id: 183, livello: 30 } ],
    dialogo_prima: 'L\'acqua è fresca e io so\' carica! Famo \'sta sfida, daje!',
    dialogo_dopo: 'Embè, mo\' torno a nuotà, che me consola de più.',
    premio: 840,
  },
  'via_laghi_trainer_13': {
    sprite: 'trainer_SWIMMER2_M', ritratto: 'SWIMMER2_M', vista: 6,
    classe: 'Nuotatore Esperto', nome: 'Aldo',
    squadra: [ { id: 117, livello: 28 }, { id: 61, livello: 30 }, { id: 79, livello: 32 } ],
    dialogo_prima: 'So\' er più forte de tutto \'sto lago. Dimostramelo che sbajo!',
    dialogo_dopo: 'Nfatti sbajavo, mo\' me sta bene.',
    premio: 900,
  },
  'via_laghi_trainer_14': {
    sprite: 'trainer_SWIMMER2_F', ritratto: 'SWIMMER2_F', vista: 6,
    classe: 'Nuotatrice Esperta', nome: 'Elvira',
    squadra: [ { id: 55, livello: 28 }, { id: 87, livello: 30 }, { id: 184, livello: 32 } ],
    dialogo_prima: 'Ho girato tutti i laghi de Roma. Vediamo si regge \'sta sfida.',
    dialogo_dopo: 'Vabbè, sei più tosto de le correnti, complimenti.',
    premio: 900,
  },
  'via_laghi_trainer_15': {
    sprite: 'trainer_PSYCHIC_M', ritratto: 'PSYCHIC_M', vista: 7,
    classe: 'Sensitivo', nome: 'Fioravante',
    squadra: [ { id: 63, livello: 26 }, { id: 96, livello: 28 }, { id: 177, livello: 30 } ],
    dialogo_prima: 'Percepisco che perderai... o forse spero solo tanto.',
    dialogo_dopo: 'Nfatti, la mia sensitività lasciava un po\' a desiderà.',
    premio: 840,
  },
  'via_laghi_trainer_16': {
    sprite: 'trainer_PSYCHIC_F', ritratto: 'PSYCHIC_F', vista: 7,
    classe: 'Sensitiva', nome: 'Ottavia',
    squadra: [ { id: 280, livello: 28 }, { id: 64, livello: 30 }, { id: 196, livello: 32 } ],
    dialogo_prima: 'Vedo nel tuo futuro... una bella lotta co\' me.',
    dialogo_dopo: 'Embè, sto futuro nun l\'avevo previsto proprio.',
    premio: 900,
  },
  'via_laghi_trainer_17': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 5,
    classe: 'Cinturanera', nome: 'Anselmo',
    squadra: [ { id: 67, livello: 28 }, { id: 106, livello: 30 }, { id: 296, livello: 32 } ],
    dialogo_prima: 'Corpo e mente devono esse tosti come \'sta montagna. Famo!',
    dialogo_dopo: 'Nfatti, tosto lo sei davero.',
    premio: 900,
  },
  'via_laghi_trainer_18': {
    sprite: 'trainer_ENGINEER', ritratto: 'ENGINEER', vista: 5,
    classe: 'Tecnico', nome: 'Bruna',
    squadra: [ { id: 81, livello: 26 }, { id: 100, livello: 28 }, { id: 309, livello: 30 } ],
    dialogo_prima: 'Manutenzione all\'Osservatorio finita. Ho tempo pe\' \'na sfida.',
    dialogo_dopo: 'Vabbè, sti calcoli nun tornavano proprio.',
    premio: 840,
  },
  'via_laghi_trainer_19': {
    sprite: 'trainer_SCIENTIST', ritratto: 'SCIENTIST', vista: 5,
    classe: 'Scienziato', nome: 'Sante',
    squadra: [ { id: 88, livello: 28 }, { id: 101, livello: 30 }, { id: 82, livello: 32 } ],
    dialogo_prima: 'Sto a studià li fenomeni de sto lago. Tu sei la variabile de oggi.',
    dialogo_dopo: 'Nfatti, la variabile ha vinto lei.',
    premio: 900,
  },
  'via_laghi_trainer_20': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 4,
    classe: 'Insettista', nome: 'Palmira',
    squadra: [ { id: 10, livello: 20 }, { id: 13, livello: 22 }, { id: 265, livello: 24 } ],
    dialogo_prima: 'Qua ce so\' certi insetti che manco te immagini! Famo \'na lotta?',
    dialogo_dopo: 'Embè, so\' tornata a cercà bruchi, va.',
    premio: 660,
  },
  'via_laghi_trainer_21': {
    sprite: 'trainer_TAMER', ritratto: 'TAMER', vista: 5,
    classe: 'Domatore', nome: 'Gelsomina',
    squadra: [ { id: 58, livello: 26 }, { id: 56, livello: 28 }, { id: 261, livello: 30 } ],
    dialogo_prima: 'Li mii Pokémon so\' addestrati bene. Vediamo li tui!',
    dialogo_dopo: 'Nfatti, l\'addestramento tuo era mejo.',
    premio: 840,
  },
  'via_laghi_trainer_22': {
    sprite: 'trainer_POKEMONBREEDER', ritratto: 'POKEMONBREEDER', vista: 5,
    classe: 'Allevatrice', nome: 'Iole',
    squadra: [ { id: 133, livello: 24 }, { id: 300, livello: 26 }, { id: 174, livello: 28 } ],
    dialogo_prima: 'Allevo li mii Pokémon co\' tanto amore. E co\' tanta grinta pure!',
    dialogo_dopo: 'Vabbè, li fo allenà de più da mo\' in poi.',
    premio: 780,
  },
  'via_laghi_trainer_23': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Escursionista', nome: 'Ottone',
    squadra: [ { id: 75, livello: 30 }, { id: 111, livello: 32 }, { id: 185, livello: 34 } ],
    dialogo_prima: 'Sta strada porta su, verso Rocca de Papa. Prima però, passi da me!',
    dialogo_dopo: 'Nfatti, chi sale in montagna se deve fa\' rispettà.',
    premio: 960,
  },

  /* ── TUNNEL ROCCIOSO — dungeon 4 piani, Via dei Laghi → Monte Porzio, tra
     3ª (Marino, cap28) e 4ª palestra (Monte Porzio, cap34), Lv 29-33.
     2 allenatori per piano, id 'tunnel-Nf-1/2', posizioni segnaposto in
     Tunnel_roccioso_Nf.tmj/.tmx — l'utente li sposta in Tiled. ── */
  'tunnel-1f-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Speleologo', nome: 'Ilario',
    squadra: [ { id: 74, livello: 28 }, { id: 41, livello: 29 } ],
    dialogo_prima: 'Chi entra nel Tunnel Roccioso senza torcia so\' guai! Ma prima, lottamo.',
    dialogo_dopo: 'Va bene, va bene, passa pure.',
    premio: 580,
  },
  'tunnel-1f-2': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Campeggiatore', nome: 'Domizio',
    squadra: [ { id: 66, livello: 29 } ],
    dialogo_prima: 'Ce campo qua dentro da tre giorni. Provaci, si ce la fai.',
    dialogo_dopo: 'Ammazza, m\'hai steso.',
    premio: 400,
  },

  /* ── Tunnel Roccioso 1F — altri allenatori aggiunti dall'utente in Tiled
     (sessione 6 agosto, terza parte): stesso problema di 2F/3F, tutti
     duplicati con id 'tunnel-1f-2' — rinominati 'tunnel-1f-3..10'. ── */
  'tunnel-1f-3': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Campeggiatore', nome: 'Nazareno',
    squadra: [ { id: 41, livello: 28 } ],
    dialogo_prima: 'Al primo piano ce stanno un sacco de pipistrelli. E pure li allenatori.',
    dialogo_dopo: 'Ao, m\'hai fatto vedè le stelle.',
    premio: 380,
  },
  'tunnel-1f-4': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Escursionista', nome: 'Ademaro',
    squadra: [ { id: 74, livello: 28 } ],
    dialogo_prima: 'Prima tappa der tunnel, ma nun me sottovalutà.',
    dialogo_dopo: 'Sottovalutato e sconfitto. Complimenti.',
    premio: 380,
  },
  'tunnel-1f-5': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Speleologo', nome: 'Fioravante',
    squadra: [ { id: 50, livello: 27 }, { id: 104, livello: 28 } ],
    dialogo_prima: 'Diglett e Cubone so\' piccoli, ma tosti. Provaci.',
    dialogo_dopo: 'Piccoli ma nun t\'hanno fatto vincè.',
    premio: 420,
  },
  'tunnel-1f-6': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Minatore', nome: 'Terenzio',
    squadra: [ { id: 66, livello: 28 } ],
    dialogo_prima: 'Piccone in spalla e Pokémon pronto. Fatte sotto.',
    dialogo_dopo: 'Manco er piccone t\'ha fermato.',
    premio: 380,
  },
  'tunnel-1f-7': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Campeggiatore', nome: 'Ansaldo',
    squadra: [ { id: 218, livello: 27 }, { id: 41, livello: 28 } ],
    dialogo_prima: 'Slugma e Zubat, la coppia perfetta pe\' un tunnel. Lottamo!',
    dialogo_dopo: 'La coppia perfetta ha perso stavolta.',
    premio: 420,
  },
  'tunnel-1f-8': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Escursionista', nome: 'Zenone',
    squadra: [ { id: 104, livello: 29 } ],
    dialogo_prima: 'Er mio Cubone porta l\'osso pure quando dorme. Provaci.',
    dialogo_dopo: 'L\'osso nun je serve a difenne più de tanto, eh.',
    premio: 400,
  },
  'tunnel-1f-9': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 5,
    classe: 'Guida', nome: 'Rufo',
    squadra: [ { id: 74, livello: 29 }, { id: 50, livello: 28 } ],
    dialogo_prima: 'Faccio da guida al primo piano. Ma prima, na lotta veloce.',
    dialogo_dopo: 'Va bene, sei tu che guidi mo\'.',
    premio: 440,
  },
  'tunnel-1f-10': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Duro', nome: 'Girolamo',
    squadra: [ { id: 51, livello: 29 } ],
    dialogo_prima: 'L\'ultimo del primo piano so\' io. Vediamo se sei pronto pe\' scennere sotto.',
    dialogo_dopo: 'Bravo, continua pure verso il secondo piano.',
    premio: 460,
  },

  'tunnel-2f-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Minatore', nome: 'Ranieri',
    squadra: [ { id: 95, livello: 29 }, { id: 74, livello: 30 } ],
    dialogo_prima: 'Al secondo piano l\'aria se fa più densa. E pure la lotta.',
    dialogo_dopo: 'Bella roccia, ma tu sei più duro.',
    premio: 600,
  },
  'tunnel-2f-2': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 4,
    classe: 'Speleologo', nome: 'Fabrizio',
    squadra: [ { id: 67, livello: 30 } ],
    dialogo_prima: 'Mi alleno qua dentro, al buio, così divento più forte.',
    dialogo_dopo: 'Nemmeno il buio m\'ha aiutato stavolta.',
    premio: 420,
  },
  'tunnel-3f-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Esploratore', nome: 'Amerigo',
    squadra: [ { id: 105, livello: 30 }, { id: 95, livello: 31 } ],
    dialogo_prima: 'Al terzo piano ce se perde facile. Ma io la strada la conosco. Lottamo!',
    dialogo_dopo: 'Uffa, e mo\' come esco?',
    premio: 620,
  },
  'tunnel-3f-2': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Guida', nome: 'Cesarino',
    squadra: [ { id: 74, livello: 31 } ],
    dialogo_prima: 'Faccio da guida a chi se perde qua sotto. Ma prima na lotta.',
    dialogo_dopo: 'Vabbè, sei tu che guidi mo\'.',
    premio: 440,
  },
  'tunnel-4f-1': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 5,
    classe: 'Duro', nome: 'Sabatino',
    squadra: [ { id: 111, livello: 32 }, { id: 67, livello: 32 } ],
    dialogo_prima: 'Il quarto piano è il più duro. Come me. Fatte sotto!',
    dialogo_dopo: 'Mecojoni, m\'hai stracciato pure tu.',
    premio: 660,
  },
  'tunnel-4f-2': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Veterano', nome: 'Anselmo',
    squadra: [ { id: 95, livello: 33 }, { id: 74, livello: 32 } ],
    dialogo_prima: 'L\'ultimo prima dell\'uscita a Monte Porzio. Vediamo si sei pronto.',
    dialogo_dopo: 'Complimenti, sei pronto per la 4ª palestra.',
    premio: 700,
  },

  /* ── Tunnel Roccioso 2F — allenatori aggiunti dall'utente in Tiled
     (sessione 6 agosto, seconda parte): erano tutti duplicati con lo stesso
     id 'tunnel-2f-1' (copia-incolla in Tiled non incrementa l'id custom),
     rinominati 'tunnel-2f-3..9' sia in Tunnel_roccioso_2f.tmx che qui. ── */
  'tunnel-2f-3': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Minatore', nome: 'Baldassarre',
    squadra: [ { id: 28, livello: 29 } ],
    dialogo_prima: 'Coi guanti da minatore nun me fa male gnente. Manco le tue mosse!',
    dialogo_dopo: 'Ahia, quello sì che m\'ha fatto male.',
    premio: 440,
  },
  'tunnel-2f-4': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Campeggiatore', nome: 'Learco',
    squadra: [ { id: 228, livello: 29 }, { id: 105, livello: 30 } ],
    dialogo_prima: 'Campeggio qua dentro co\' la torcia frontale. Lottamo?',
    dialogo_dopo: 'Manco la torcia m\'ha illuminato la strategia giusta.',
    premio: 600,
  },
  'tunnel-2f-5': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Speleologo', nome: 'Silvano',
    squadra: [ { id: 74, livello: 30 } ],
    dialogo_prima: 'Sto tunnel lo conosco a memoria, casella per casella.',
    dialogo_dopo: 'E mo\' me tocca ristudià la mappa.',
    premio: 460,
  },
  'tunnel-2f-6': {
    sprite: 'trainer_BIRDKEEPER', ritratto: 'BIRDKEEPER', vista: 4,
    classe: 'Escursionista', nome: 'Ottorino',
    squadra: [ { id: 41, livello: 29 }, { id: 66, livello: 30 } ],
    dialogo_prima: 'Tra pipistrelli e macigni, ce sto benissimo qua sotto!',
    dialogo_dopo: 'Ao, m\'hai steso pure i macigni.',
    premio: 620,
  },
  'tunnel-2f-7': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 4,
    classe: 'Duro', nome: 'Bonifacio',
    squadra: [ { id: 105, livello: 31 } ],
    dialogo_prima: 'L\'osso in mano nun è pe\' fa\' scena. Fatte sotto.',
    dialogo_dopo: 'Vabbè, l\'osso lo rimetto a posto.',
    premio: 480,
  },
  'tunnel-2f-8': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Minatore', nome: 'Erminio',
    squadra: [ { id: 95, livello: 30 }, { id: 28, livello: 31 } ],
    dialogo_prima: 'Piccone e pala nun bastano, quaggiù serveno pure li Pokémon tosti.',
    dialogo_dopo: 'Ammazza che botta, mi hai frantumato.',
    premio: 640,
  },
  'tunnel-2f-9': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Guida', nome: 'Vito',
    squadra: [ { id: 329, livello: 31 } ],
    dialogo_prima: 'Sono la guida ufficiale del secondo piano. Ma prima, lotta.',
    dialogo_dopo: 'Va bene, sei tu che guidi da qui in poi.',
    premio: 500,
  },

  /* ── Tunnel Roccioso 3F — allenatori aggiunti dall'utente in Tiled
     (sessione 6 agosto, seconda parte): stesso problema del 2F (id duplicati
     'tunnel-3f-2'), più due oggetti finiti qui per sbaglio con gli id di 4F
     ('tunnel-4f-1'/'tunnel-4f-2') — rinominati 'tunnel-3f-9'/'tunnel-3f-10'
     con dati propri tarati sul livello del 3F, non del 4F. ── */
  'tunnel-3f-3': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Esploratore', nome: 'Rolando',
    squadra: [ { id: 354, livello: 30 } ],
    dialogo_prima: 'Al terzo piano se sente robba strana nell\'ombra. Provaci pure.',
    dialogo_dopo: 'Ammazza, sei più tosto der buio stesso.',
    premio: 500,
  },
  'tunnel-3f-4': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Speleologo', nome: 'Ubaldo',
    squadra: [ { id: 247, livello: 31 } ],
    dialogo_prima: 'Il mio Pupitar sta a metà evoluzione, ma è già tosto forte.',
    dialogo_dopo: 'Cresce ancora, ma intanto ha perso.',
    premio: 520,
  },
  'tunnel-3f-5': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 4,
    classe: 'Duro', nome: 'Adalberto',
    squadra: [ { id: 105, livello: 30 }, { id: 67, livello: 31 } ],
    dialogo_prima: 'Osso e pugno, questa è la mia filosofia. Fatte sotto!',
    dialogo_dopo: 'Filosofia sconfitta, complimenti.',
    premio: 640,
  },
  'tunnel-3f-6': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Minatore', nome: 'Firmino',
    squadra: [ { id: 95, livello: 31 } ],
    dialogo_prima: 'Al terzo piano la roccia è più dura. Come la mia difesa.',
    dialogo_dopo: 'Manco la roccia più dura t\'ha fermato.',
    premio: 500,
  },
  'tunnel-3f-7': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 4,
    classe: 'Guida', nome: 'Egisto',
    squadra: [ { id: 74, livello: 31 }, { id: 41, livello: 30 } ],
    dialogo_prima: 'Faccio da guida a chi se perde al terzo piano. Ma prima, lotta.',
    dialogo_dopo: 'Va bene, sei tu che guidi mo\'.',
    premio: 660,
  },
  'tunnel-3f-8': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 5,
    classe: 'Veterano', nome: 'Prospero',
    squadra: [ { id: 306, livello: 32 } ],
    dialogo_prima: 'Il mio Aggron è una corazza vivente. Vediamo se la sfondi.',
    dialogo_dopo: 'Corazza sfondata. Rispetto.',
    premio: 560,
  },
  'tunnel-3f-9': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Veterano', nome: 'Anacleto',
    squadra: [ { id: 95, livello: 32 }, { id: 74, livello: 31 } ],
    dialogo_prima: 'Manco a metà del tunnel e già t\'ho trovato. Lottamo!',
    dialogo_dopo: 'Complimenti, continua pure verso il quarto piano.',
    premio: 680,
  },
  'tunnel-3f-10': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 5,
    classe: 'Duro', nome: 'Bartolomeo',
    squadra: [ { id: 111, livello: 31 }, { id: 67, livello: 32 } ],
    dialogo_prima: 'Duro fuori, duro dentro. Fatte sotto, se hai coraggio!',
    dialogo_dopo: 'Mecojoni, m\'hai steso pure tu.',
    premio: 680,
  },

  /* ── PERCORSO 7 — Rocca di Papa → Albano Laziale, Lv 38-44 (world Castelli_lasthree) ──
     8 allenatori sul tracciato + 2 nella zona laterale (all-p7-extra-1/2).
     PRIMA erano piazzati su Tiled con gli id 'all-gm-*', duplicati con quelli
     di Percorso 3 (bug trovato sessione 6 agosto): rinominati 'all-p7-*' sia
     qui sia in percorso_7.tmj/.tmx, con dati e livelli propri. */
  'all-p7-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Escursionista', nome: 'Learco',
    squadra: [ { id: 75, livello: 38 }, { id: 67, livello: 39 } ],
    dialogo_prima: 'Scenno giù da Rocca de Papa, ma prima me tolgo la voja: lottamo!',
    dialogo_dopo: 'Bella botta. Continua verso Albano, tiè.',
    premio: 900,
  },
  'all-p7-2': {
    sprite: 'trainer_PSYCHIC_M', ritratto: 'PSYCHIC_M', vista: 5,
    classe: 'Medium', nome: 'Osvaldo',
    squadra: [ { id: 64, livello: 38 }, { id: 61, livello: 40 } ],
    dialogo_prima: 'Sento le vibrazioni... tu vinci sta lotta! Ah no aspè, famo prima a giocà.',
    dialogo_dopo: 'Le vibrazioni je avevano azzeccato al contrario.',
    premio: 920,
  },
  'all-p7-3': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 4,
    classe: 'Bambina', nome: 'Adele',
    squadra: [ { id: 93,  livello: 39 }, { id: 70, livello: 40 } ],
    dialogo_prima: 'Tra le rocce ce se nasconneno i tipi più strani. Guarda i mii!',
    dialogo_dopo: 'So\' spariti nell\'ombra... della sconfitta.',
    premio: 920,
  },
  'all-p7-4': {
    sprite: 'trainer_BUGCATCHER', ritratto: 'BUGCATCHER', vista: 4,
    classe: 'Coleotterista', nome: 'Nazzareno',
    squadra: [ { id: 42, livello: 40 }, { id: 47, livello: 41 } ],
    dialogo_prima: 'A metà strada tra Rocca e Albano ce sto sempre io! Fermate!',
    dialogo_dopo: 'Mecojoni, m\'hai stracciato.',
    premio: 940,
  },
  'all-p7-5': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Rocciatore', nome: 'Publio',
    squadra: [ { id: 111, livello: 41 }, { id: 95, livello: 42 } ],
    dialogo_prima: 'Rhyhorn e Onix so\' tosti come sto\' sentiero. Vediamo te!',
    dialogo_dopo: 'So\' rotolati giù come sassi.',
    premio: 960,
  },
  'all-p7-6': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 5,
    classe: 'Bambina', nome: 'Fosca',
    squadra: [ { id: 38, livello: 42 } ],
    dialogo_prima: 'Il mio Ninetales porta bene, ma pure male a chi me sfida!',
    dialogo_dopo: 'Ammazza, se n\'è annato de brutto.',
    premio: 700,
  },
  'all-p7-7': {
    sprite: 'trainer_BIRDKEEPER', ritratto: 'BIRDKEEPER', vista: 5,
    classe: 'Elettricista', nome: 'Genesio',
    squadra: [ { id: 101, livello: 42 }, { id: 82, livello: 43 } ],
    dialogo_prima: 'Elettricità pura, fatte sotto se ce la fai!',
    dialogo_dopo: 'Corto circuito. Ma bella lotta.',
    premio: 980,
  },
  'all-p7-8': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Guida', nome: 'Sante',
    squadra: [ { id: 67, livello: 43 }, { id: 64, livello: 44 } ],
    dialogo_prima: 'L\'ultimo prima de arrivà ad Albano. Nun te faccio passà facile!',
    dialogo_dopo: 'Ok, sei pronto pe\' Albano. Va\' pure.',
    premio: 1000,
  },
  // Zona laterale — segnaposto, l'utente decide se/come gatearla
  'all-p7-extra-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Speleologo', nome: 'Learco',
    squadra: [ { id: 75, livello: 44 }, { id: 105, livello: 43 } ],
    dialogo_prima: 'Pochi passano de qua! Vediamo si sei tosto pe\' davvero.',
    dialogo_dopo: 'Rispetto, sei forte come \'na roccia vera.',
    premio: 1020,
  },
  'all-p7-extra-2': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 8,
    classe: 'Erborista', nome: 'Ginevra',
    squadra: [ { id: 45, livello: 44 }, { id: 62, livello: 45 } ],
    dialogo_prima: 'La zona secreta! Ma se sei arrivato fin qua, te meriti \'na sfida.',
    dialogo_dopo: 'Bravo davvero. Vai, ad Albano t\'aspettano.',
    premio: 1040,
  },

  /* ── PERCORSO 8 — Albano Laziale → Ariccia, Lv 46-49 (world Castelli_lasthree) ── */
  'all-p8-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Escursionista', nome: 'Learco',
    squadra: [ { id: 76, livello: 46 }, { id: 112, livello: 47 } ],
    dialogo_prima: 'Da queste parti le salite so\' toste. Speriamo tu regga quanto le mie rocce!',
    dialogo_dopo: 'Ahó, m\'hai fatto rotolà giù pure io.',
    premio: 940,
  },
  'all-p8-2': {
    sprite: 'trainer_FISHERMAN', ritratto: 'FISHERMAN', vista: 6,
    classe: 'Pescatore', nome: 'Sandro',
    squadra: [ { id: 130, livello: 47 }, { id: 230, livello: 47 } ],
    dialogo_prima: 'Il fiume qui sotto nasconde brutte sorprese. Tipo la mia squadra!',
    dialogo_dopo: 'Ahó, m\'hai steso pure li pesci grossi.',
    premio: 960,
  },
  'all-p8-3': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 5,
    classe: 'Campeggiatrice', nome: 'Mirella',
    squadra: [ { id: 217, livello: 47 }, { id: 59, livello: 48 } ],
    dialogo_prima: 'Accampata qui da giorni. I miei Pokémon so\' abituati alla vita selvaggia!',
    dialogo_dopo: 'Vabbè, stavolta ha vinto la civiltà.',
    premio: 970,
  },
  'all-p8-4': {
    sprite: 'trainer_LADY', ritratto: 'LADY', vista: 5,
    classe: 'Dama', nome: 'Ippolita',
    squadra: [ { id: 350, livello: 48 }, { id: 282, livello: 48 } ],
    dialogo_prima: 'Sto andando alla Sagra de la porchetta. Ma prima, \'na bella lotta!',
    dialogo_dopo: 'Elegante fino alla fine... la sconfitta, intendo.',
    premio: 980,
  },
  'all-p8-5': {
    sprite: 'trainer_BIKER', ritratto: 'BIKER', vista: 6,
    classe: 'Motociclista', nome: 'Danilo',
    squadra: [ { id: 229, livello: 48 }, { id: 319, livello: 49 } ],
    dialogo_prima: 'Sfreccio su e giù per \'sta strada tutto il giorno! Vediamo se tieni il passo!',
    dialogo_dopo: 'Mo\' vado a fa \'n altro giro, tanto pe\' scordamme de sta sconfitta.',
    premio: 1000,
  },

  /* ── PERCORSO 9 — sale verso Ariccia, Lv 48-52 (world Castelli_lasthree) ── */
  'all-p9-1': {
    sprite: 'trainer_YOUNGSTER', ritratto: 'YOUNGSTER', vista: 5,
    classe: 'Pivello', nome: 'Emidio',
    squadra: [ { id: 134, livello: 48 }, { id: 135, livello: 48 } ],
    dialogo_prima: 'Il percorso è lungo, ma i miei Eon so\' più veloci!',
    dialogo_dopo: 'Nun ce posso crede, m\'hai asciugato le pile.',
    premio: 980,
  },
  'all-p9-2': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 5,
    classe: 'Bambina', nome: 'Sonia',
    squadra: [ { id: 197, livello: 48 }, { id: 196, livello: 49 } ],
    dialogo_prima: 'Giorno o notte, i miei Pokémon so\' sempre pronti!',
    dialogo_dopo: 'Vabbè, oggi era giorno storto.',
    premio: 990,
  },
  'all-p9-3': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 4,
    classe: 'Cintura Nera', nome: 'Learco',
    squadra: [ { id: 68, livello: 49 }, { id: 107, livello: 49 } ],
    dialogo_prima: 'Pugno secco e via! Provaci!',
    dialogo_dopo: 'Bella botta, complimenti.',
    premio: 1000,
  },
  'all-p9-4': {
    sprite: 'trainer_SCIENTIST', ritratto: 'SCIENTIST', vista: 6,
    classe: 'Scienziata', nome: 'Delia',
    squadra: [ { id: 375, livello: 49 }, { id: 344, livello: 50 } ],
    dialogo_prima: 'I miei esperimenti psichici te sorprenderanno!',
    dialogo_dopo: 'Dati... inconcludenti. Hai vinto tu.',
    premio: 1020,
  },
  'all-p9-5': {
    sprite: 'trainer_BIKER', ritratto: 'BIKER', vista: 6,
    classe: 'Motociclista', nome: 'Furio',
    squadra: [ { id: 342, livello: 50 }, { id: 323, livello: 50 } ],
    dialogo_prima: 'Motore acceso, squadra pronta!',
    dialogo_dopo: 'Ao, m\'hai bucato le gomme.',
    premio: 1040,
  },
  'all-p9-6': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Escursionista', nome: 'Vittorio',
    squadra: [ { id: 208, livello: 50 }, { id: 227, livello: 51 } ],
    dialogo_prima: 'Sto percorso lo conosco a memoria. E pure le mosse dei miei!',
    dialogo_dopo: 'Duri come la roccia, ma stavolta ho perso.',
    premio: 1060,
  },
  'all-p9-7': {
    sprite: 'trainer_BEAUTY', ritratto: 'BEAUTY', vista: 5,
    classe: 'Dama', nome: 'Aurelia',
    squadra: [ { id: 282, livello: 51 }, { id: 350, livello: 51 } ],
    dialogo_prima: 'Anche la bellezza sa lottare, sai?',
    dialogo_dopo: 'Uffa, mi hai spettinata.',
    premio: 1080,
  },
  'all-p9-8': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 6,
    classe: 'Gentiluomo', nome: 'Amedeo',
    squadra: [ { id: 289, livello: 51 }, { id: 295, livello: 52 } ],
    dialogo_prima: 'Che gran fatica... ma per un buon combattimento vale sempre la pena!',
    dialogo_dopo: 'Bella lotta, davvero. Complimenti.',
    premio: 1100,
  },
  'all-p9-9': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 6,
    classe: 'Duro', nome: 'Osvaldo',
    squadra: [ { id: 354, livello: 52 }, { id: 302, livello: 52 } ],
    dialogo_prima: 'L\'ultimo prima di Ariccia! Se passi me, sei pronto pe\' Ombretta!',
    dialogo_dopo: 'Battuto. Ombretta t\'aspetta, e coi Buio nun scherza.',
    premio: 1150,
  },

  /* ── ARICCIA — città, Lv 49-52 (7ª città, Palestra Buio, Capopalestra Ombretta) ──
     NUOVA (sessione 6 agosto): la città aveva solo NPC/dialogo (+ la Sfida dei
     Porchettari), nessun allenatore vero. 5 allenatori generici, tema Buio in
     avvicinamento alla palestra, posizioni segnaposto in Ariccia.tmj/.tmx
     (id 'all-ariccia-1..5'), l'utente li sposta in Tiled. */
  'all-ariccia-1': {
    sprite: 'trainer_BIKER', ritratto: 'BIKER', vista: 6,
    classe: 'Motociclista', nome: 'Nazzareno',
    squadra: [ { id: 42, livello: 49 }, { id: 215, livello: 50 } ],
    dialogo_prima: 'Prima de entrà in paese, te fermi da me! Così se fa ad Ariccia!',
    dialogo_dopo: 'Vabbè, oggi hai vinto tu. Va\', la porchetta t\'aspetta.',
    premio: 1100,
  },
  'all-ariccia-2': {
    sprite: 'trainer_PSYCHIC_F', ritratto: 'PSYCHIC_F', vista: 5,
    classe: 'Sensitiva', nome: 'Palmira',
    squadra: [ { id: 64, livello: 49 }, { id: 200, livello: 50 } ],
    dialogo_prima: 'A Ariccia, tra l\'ombre der ponte, se sente robba strana. Provaci pure tu.',
    dialogo_dopo: 'Le vibrazioni dicevano che avrei vinto io. Boh.',
    premio: 1110,
  },
  'all-ariccia-3': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 6,
    classe: 'Cacciatore Notturno', nome: 'Rutilio',
    squadra: [ { id: 228, livello: 50 }, { id: 198, livello: 51 } ],
    dialogo_prima: 'Solo de notte se vedeno i mii Pokémon veri. Ma mo\' te lotto lo stesso!',
    dialogo_dopo: 'Ammazza, m\'hai spento tutti.',
    premio: 1130,
  },
  'all-ariccia-4': {
    sprite: 'trainer_LASS', ritratto: 'LASS', vista: 5,
    classe: 'Cercatrice', nome: 'Selvaggia',
    squadra: [ { id: 164, livello: 50 }, { id: 359, livello: 51 } ],
    dialogo_prima: 'Vado in giro pe\' boschi e ponti a cercà Pokémon rari. Uno l\'ho trovato: tocca affrontamme!',
    dialogo_dopo: 'Bravo, davvero. Ombretta t\'aspetta, ma preparate bene.',
    premio: 1140,
  },
  'all-ariccia-5': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 6,
    classe: 'Veterano dell\'Ombra', nome: 'Ottavio',
    squadra: [ { id: 355, livello: 51 }, { id: 353, livello: 52 } ],
    dialogo_prima: 'L\'ultimo prima de Ombretta so\' io. Se me passi, sei davero pronto pe\' la Medaglia Fraschetta.',
    dialogo_dopo: 'Battuto in piena regola. Vai pure, la palestra è quella davanti.',
    premio: 1200,
  },

  /* ── Percorso 10 (Ariccia → Genzano, world Castelli_lasthree) — sessione
     8 agosto: la mappa aveva un trainer segnaposto con id 'all-ariccia-2'
     duplicato (copiato per errore dal trainer reale di Ariccia, stesso id
     usato su due mappe). Rinominato in Tiled a 'all-p10-1', dati propri
     nuovi qui. Aggiunto anche 'all-p10-2' per dare un minimo di percorso
     prima di Genzano (cap 58). Posizioni segnaposto, Luca le sposta. ── */
  'all-p10-1': {
    sprite: 'trainer_PSYCHIC_F', ritratto: 'PSYCHIC_F', vista: 5,
    classe: 'Sensitiva', nome: 'Fiorenza',
    squadra: [ { id: 65, livello: 53 }, { id: 196, livello: 54 } ],
    dialogo_prima: 'Genzano è vicina... lo sento nell\'aria, letteralmente. Provaci con me!',
    dialogo_dopo: 'Le mie visioni non avevano previsto questo.',
    premio: 1250,
  },
  'all-p10-2': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 6,
    classe: 'Gentiluomo', nome: 'Ermenegildo',
    squadra: [ { id: 358, livello: 54 }, { id: 306, livello: 55 } ],
    dialogo_prima: 'Ah, un viandante! L\'Infiorata è ancora lontana, ma la sfida no.',
    dialogo_dopo: 'Complimenti vivissimi. Genzano l\'attende, proceda pure.',
    premio: 1300,
  },

  /* ── Percorso_11 (Grottaferrata → Rocca di Papa, bivio Monte Cavo) — sessione
     documentazione 5 agosto: 2 allenatori generici "di passaggio", livelli
     provvisori intorno al cap di Monte Porzio (34). Posizione sulla mappa
     ancora da sistemare (Luca sposta gli oggetti Tiled). ── */
  'all-p11-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Escursionista', nome: 'Aldo',
    squadra: [ { id: 74, livello: 30 }, { id: 66, livello: 31 } ],
    dialogo_prima: 'Sto sentiero porta su, verso Rocca di Papa. Occhio ar fiato!',
    dialogo_dopo: 'Eh, mo\' me sò stancato pure de perde\'.',
    premio: 620,
  },
  'all-p11-2': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Scalatore', nome: 'Nazzareno',
    squadra: [ { id: 95, livello: 33 }, { id: 75, livello: 34 } ],
    dialogo_prima: 'Sti Pokémon de roccia so\' cresciuti tra sti sassi, mica pe\' gioco!',
    dialogo_dopo: 'Duri come er Monte Cavo, ma stavolta hai vinto tu.',
    premio: 680,
  },
  // all-p11-3..6: erano 4 copie duplicate dello stesso trainer 'all-p11-2'
  // piazzate da Luca in Tiled (stesso id, mai risolto nel motore) — rinominate
  // e con dati propri, sessione 8 agosto.
  'all-p11-3': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 5,
    classe: 'Campeggiatore', nome: 'Ottaviano',
    squadra: [ { id: 231, livello: 31 }, { id: 111, livello: 32 } ],
    dialogo_prima: 'Sto campeggiando qui da giorni. Vediamo se i miei Pokémon sono arrugginiti.',
    dialogo_dopo: 'Bella lotta, torno alla tenda.',
    premio: 630,
  },
  'all-p11-4': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Escursionista', nome: 'Girolamo',
    squadra: [ { id: 74, livello: 32 }, { id: 111, livello: 33 } ],
    dialogo_prima: 'Il sentiero verso Monte Cavo è ripido. Sei sicuro di essere pronto?',
    dialogo_dopo: 'Ok, ok. Sei forte quanto la montagna.',
    premio: 650,
  },
  'all-p11-5': {
    sprite: 'trainer_PICNICKER', ritratto: 'PICNICKER', vista: 5,
    classe: 'Escursionista', nome: 'Genoveffa',
    squadra: [ { id: 187, livello: 32 }, { id: 209, livello: 33 } ],
    dialogo_prima: 'Facevo un picnic tranquillo... ma una sfida non si rifiuta mai!',
    dialogo_dopo: 'Che peccato, si era freddato pure il panino.',
    premio: 640,
  },
  'all-p11-6': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Scalatore', nome: 'Learco',
    squadra: [ { id: 95, livello: 34 }, { id: 111, livello: 35 } ],
    dialogo_prima: 'Ultima prova prima di Rocca di Papa: io.',
    dialogo_dopo: 'Vai pure, la palestra di Baso ti aspetta.',
    premio: 690,
  },

  /* ── Team CoTrAL — grunt fuori dal covo (collegamento_Cotral.tmx), sessione
     documentazione 5 agosto. Sprite riservato COTRAL_GRUNT_SPRITE (NPC 24,
     vedi js/map.js) — stesso trattamento del Team GdF. Livelli provvisori,
     posizione da sistemare. ── */
  'cotral_grunt_collegamento_1': {
    sprite: 'COTRAL_GRUNT_SPRITE', ritratto: 'COTRAL_GRUNT_SPRITE', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetto',
    squadra: [ { id: 100, livello: 33 }, { id: 109, livello: 34 } ],
    dialogo_prima: 'Zona di servizio CoTrAL. Non è posto per turisti.',
    dialogo_dopo: 'Bah... di\' pure in giro quello che hai visto, tanto non cambia niente.',
    premio: 1360,
  },
  'cotral_grunt_collegamento_2': {
    sprite: 'COTRAL_GRUNT_SPRITE', ritratto: 'COTRAL_GRUNT_SPRITE', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetta',
    squadra: [ { id: 81, livello: 34 }, { id: 88, livello: 35 } ],
    dialogo_prima: 'Il capo non vuole occhi indiscreti da queste parti.',
    dialogo_dopo: 'Va bene, va bene. Non ho visto niente neanche io, chiaro?',
    premio: 1400,
  },

  /* ── Team CoTrAL — Rifugio di Rocca di Papa (Rifugio_cotral_rocca.tmj,
     sess. 8-12 set 2026): il covo vero, oltre il presidio di
     collegamento_Cotral. 6 grunt "normali" (già combattibili in giro per la
     grotta, sotto) + Marcello, ammiraglio/luogotenente CoTrAL di tipo Terra
     (nome scelto da Luca, sostituisce il precedente "Tarcisio" — "non si può
     sentire") — primo vero boss del Team CoTrAL. Cutscene con Baso (sess. 12
     set 2026): 2 grunt "forti" dedicati (sotto, cotral_grunt_forte_1/2) +
     Marcello stesso vengono affrontati in doppia con Baso come alleato — vedi
     _cutsceneBasoCotralRocca in js/map.js.
     Identità/nomi ancora provvisori vista la nota "Team CoTrAL da rifare". ── */
  'cotral_grunt_rocca_1': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetto',
    squadra: [ { id: 74, livello: 36 }, { id: 27, livello: 37 } ],
    dialogo_prima: 'Sei entrato più a fondo di quanto dovresti. Fatti sotto, allora.',
    dialogo_dopo: 'Bah... Marcello non sarà contento di questa falla nella sicurezza.',
    premio: 1440,
  },
  'cotral_grunt_rocca_2': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetta',
    squadra: [ { id: 41, livello: 36 }, { id: 218, livello: 37 } ],
    dialogo_prima: 'Il rifugio è sorvegliato a vista. Non farai un altro passo.',
    dialogo_dopo: 'Va bene... ma il grosso della squadra è ancora davanti a te.',
    premio: 1440,
  },
  'cotral_grunt_rocca_3': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetto',
    squadra: [ { id: 76, livello: 37 }, { id: 111, livello: 38 } ],
    dialogo_prima: 'Qua sotto la montagna nessuno ci trova. O almeno, così credevamo.',
    dialogo_dopo: 'Uffa... vabbè, tienitelo per te quello che hai visto.',
    premio: 1480,
  },
  'cotral_grunt_rocca_4': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetta',
    squadra: [ { id: 218, livello: 37 }, { id: 74, livello: 38 } ],
    dialogo_prima: 'Marcello ci ha ordinato di non far passare nessuno. Nessuno.',
    dialogo_dopo: 'Mo\' come glielo dico che sei passato lo stesso...',
    premio: 1480,
  },
  'cotral_grunt_rocca_5': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetto',
    squadra: [ { id: 111, livello: 38 }, { id: 76, livello: 39 } ],
    dialogo_prima: 'Un altro? Ma quanti siete lassù a Rocca di Papa?',
    dialogo_dopo: 'Vai pure avanti... Marcello ti aspetta comunque.',
    premio: 1520,
  },
  'cotral_grunt_rocca_6': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 5,
    classe: 'Recluta CoTrAL', nome: 'Addetta',
    squadra: [ { id: 27, livello: 38 }, { id: 41, livello: 39 } ],
    dialogo_prima: 'Ultima linea di difesa prima della sala di comando. Fatte sotto.',
    dialogo_dopo: 'Ao, sei tosto... ma con Marcello è un\'altra storia.',
    premio: 1520,
  },
  // I 2 grunt "forti" della cutscene con Baso (sess. 12 set 2026): più tosti
  // dei 6 normali sopra, affrontati in doppia (Baso alleato + tu) subito
  // dopo che Baso ti chiede aiuto. Mai raggiungibili come lotta singola
  // normale — solo tramite _cutsceneBasoCotralRocca (js/map.js).
  'cotral_grunt_forte_1': {
    nome: 'Addetto Scelto',
    squadra: [ { id: 51, livello: 40 } ],  // Dugtrio
    premio: 1800,
  },
  'cotral_grunt_forte_2': {
    nome: 'Addetta Scelta',
    squadra: [ { id: 31, livello: 40 } ],  // Nidoqueen
    premio: 1800,
  },
  // Squadra a 6 (sess. 12 set 2026, cutscene Baso/Rifugio Rocca): nello
  // scontro finale in doppia Marcello ne schiera 2 alla volta (uno dei due
  // "lati" del motore lotta-doppio, vedi js/map.js _cutsceneBasoCotralRocca),
  // gli altri 4 restano di riserva e scendono in campo mano a mano — asso
  // (Flygon) per ultimo. Squadra divisa in due metà da 3 per quello scontro;
  // se in futuro serve anche un 1v1 "normale" contro di lui, questa stessa
  // squadra intera resta comunque utilizzabile.
  'cotral_marcello_rocca': {
    sprite: 'Luogotenente_Cotral_Osservatorio', ritratto: 'trainer_SCIENTIST', vista: 5,
    classe: 'Ammiraglio CoTrAL', nome: 'Marcello',
    squadra: [
      { id: 75,  livello: 40 },  // Graveler
      { id: 112, livello: 41 },  // Rhydon
      { id: 34,  livello: 41 },  // Nidoking
      { id: 105, livello: 40 },  // Marowak
      { id: 208, livello: 41 },  // Steelix
      { id: 330, livello: 42 },  // Flygon (asso, per ultimo)
    ],
    dialogo_prima: 'Sei arrivato fin qui dentro la montagna? Impressionante, per un ragazzino. Ma qui comando io, e la terra risponde solo a me.',
    dialogo_dopo: 'Impossibile... nemmeno la roccia più dura regge per sempre, a quanto pare. Vai pure avanti, ragazzino. Ma non è finita qui.',
    premio: 3000,
  },

  /* ── Sfida dei Porchettari (Ariccia, 23:00-02:00) — 5 lotte di fila,
     orchestrate da GameMap.avviaSfidaPorchettari (js/map.js), innescate da
     'ariccia_sfida_porchettari' (dati/npc.js → sfidaPorchettari in app.js).
     Non sono trainer piazzati su Tiled: la squadra/livello/dialoghi si
     leggono da qui, ma appaiono solo durante la sequenza. ── */
  'porchettaro_sfida_1': {
    sprite: 'NPC 26', nome: 'Learco',
    squadra: [ { id: 128, livello: 46 }, { id: 59, livello: 46 } ],
    dialogo_prima: 'Sono il numero 1! Vediamo se hai fame di lotta quanto noi de porchetta!',
    dialogo_dopo: 'Bella lotta! Ma nun è mica finita qui...',
    premio: 900,
  },
  'porchettaro_sfida_2': {
    sprite: 'NPC 26', nome: 'Ruggero',
    squadra: [ { id: 241, livello: 47 }, { id: 217, livello: 47 } ],
    dialogo_prima: 'So\' io mo\'! Speriamo che hai riscaldato bene i muscoli.',
    dialogo_dopo: 'Uffa. Vai pure avanti, tocca ar prossimo mo\'.',
    premio: 940,
  },
  'porchettaro_sfida_3': {
    sprite: 'NPC 26', nome: 'Amleto',
    squadra: [ { id: 297, livello: 48 }, { id: 317, livello: 48 } ],
    dialogo_prima: 'Terzo giro, e nun me pare che stai a rallentà!',
    dialogo_dopo: 'Bòna lotta davvero. Mo\' viè er bello però.',
    premio: 980,
  },
  'porchettaro_sfida_4': {
    sprite: 'NPC 26', nome: 'Dionigi',
    squadra: [ { id: 264, livello: 49 }, { id: 289, livello: 49 } ],
    dialogo_prima: 'Quarto! Sei ancora in piedi? Bravo, ma io nun so\' mica facile.',
    dialogo_dopo: 'Nun ce posso crede\'... Vabbè, l\'ùrtimo t\'aspetta.',
    premio: 1020,
  },
  'porchettaro_sfida_5': {
    sprite: 'NPC 26', nome: 'Anselmo',
    squadra: [ { id: 143, livello: 50 }, { id: 210, livello: 50 } ],
    dialogo_prima: 'So\' l\'urtimo, e so\' er più tosto! Fatte sotto, si ce la fai!',
    dialogo_dopo: 'Cinque su cinque contro te... nessuno c\'era mai riuscito. Rispetto.',
    premio: 1100,
  },

  /* ── Sfida dei Parenti di Baso (Via dei Laghi) — 5 lotte di fila, stesso
     schema dei Porchettari (GameMap.avviaSfidaParentiRocco). Squadre Roccia/
     Terra: un hobby di famiglia legato al Monte Cavo, indipendente dal fatto
     che Baso stesso alleni Lotta in palestra. Livelli sotto il suo (30-38)
     per restare credibili come "parenti", non come lui in persona. Chiavi
     tecniche (rocco_parente_sfida_N) lasciate invariate per non rompere i
     riferimenti incrociati in js/map.js/app.js. ── */
  'rocco_parente_sfida_1': {
    sprite: 'NPC 20', nome: 'Ilario',
    squadra: [ { id: 74, livello: 30 }, { id: 111, livello: 31 } ],
    dialogo_prima: 'Songo er cuggino de Baso. Puro io so\' duro come \'na roccia!',
    dialogo_dopo: 'Azz... m\'hai fatto a pezzi come \'no sasso sotto er martello.',
    premio: 780,
  },
  'rocco_parente_sfida_2': {
    sprite: 'NPC 20', nome: 'Demostene',
    squadra: [ { id: 75, livello: 31 }, { id: 299, livello: 32 } ],
    dialogo_prima: 'So\' er fratello più grosso. Baso m\'ha insegnato tutto quello che so.',
    dialogo_dopo: 'Vabbè... mica potevo esse\' tosto quanto lui.',
    premio: 820,
  },
  'rocco_parente_sfida_3': {
    sprite: 'NPC 20', nome: 'Zio Learco',
    squadra: [ { id: 95, livello: 33 }, { id: 185, livello: 33 } ],
    dialogo_prima: 'So\' lo zio de Baso: co\' le rocce ce so\' cresciuto, mica come lui che l\'ha imparato dòppo.',
    dialogo_dopo: 'Eh, l\'esperienza nun basta sempre. Bravo davero.',
    premio: 860,
  },
  'rocco_parente_sfida_4': {
    sprite: 'NPC 20', nome: 'Cesira',
    squadra: [ { id: 112, livello: 34 }, { id: 337, livello: 35 } ],
    dialogo_prima: 'So\' la sorella de Baso. Nun me sottovalutà solo perché so\' \'na donna, eh!',
    dialogo_dopo: 'Bella lotta! Mo\' però c\'è l\'ùrtimo, e è tosto pure più de Baso.',
    premio: 900,
  },
  'rocco_parente_sfida_5': {
    sprite: 'NPC 20', nome: 'Nonno Ezechiele',
    squadra: [ { id: 306, livello: 36 }, { id: 76, livello: 37 }, { id: 305, livello: 38 } ],
    dialogo_prima: 'So\' er nonno. Prima de Baso, la palestra la teneva \'n mano io.',
    dialogo_dopo: 'Cinque su cinque contro tutta la famija... Baso sarà fiero de te, ragazzo\'.',
    premio: 1200,
  },

  /* ── Percorso 12 (Via dei Laghi ↔ Genzano, gated a 8 Medaglie) — 12
     allenatori richiesti da Luca, sessione 8 agosto (seconda parte). Livelli
     58-63: si accede solo dopo l'8ª medaglia, coerente col cap finale (58) e
     l'avvicinamento a Via Vittoria/Lega (60-66). Posizioni segnaposto lungo
     la mappa, Luca le sposta. ── */
  'all-p12-1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 6,
    classe: 'Veterano', nome: 'Serafino',
    squadra: [ { id: 306, livello: 58 }, { id: 330, livello: 59 } ],
    dialogo_prima: 'Con otto medaglie al petto nun se passa lisci, manco pe\' idea.',
    dialogo_dopo: 'Bella lotta. Sei quasi pronto pe\' la Lega.',
    premio: 1450,
  },
  'all-p12-2': {
    sprite: 'trainer_PSYCHIC_F', ritratto: 'PSYCHIC_F', vista: 6,
    classe: 'Sensitiva', nome: 'Perpetua',
    squadra: [ { id: 65, livello: 58 }, { id: 282, livello: 59 } ],
    dialogo_prima: 'Sento che sei forte. Vediamo se le sensazioni nun m\'ingannano.',
    dialogo_dopo: 'Avevo ragione: sei tosto davvero.',
    premio: 1450,
  },
  'all-p12-3': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 6,
    classe: 'Duro', nome: 'Fortunato',
    squadra: [ { id: 107, livello: 59 }, { id: 68, livello: 60 } ],
    dialogo_prima: 'Sto sentiero tempra i muscoli e la mente. Provace pure.',
    dialogo_dopo: 'Hai un pugno forte quanto la mia difesa. Rispetto.',
    premio: 1500,
  },
  'all-p12-4': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 6,
    classe: 'Veterana', nome: 'Isolina',
    squadra: [ { id: 362, livello: 58 }, { id: 124, livello: 59 } ],
    dialogo_prima: 'Campeggio qui da settimane, ad allenà i mia Pokémon. Guarda un po\' cosa so\' diventati.',
    dialogo_dopo: 'Onestamente, nun me l\'aspettavo. Complimenti veri.',
    premio: 1450,
  },
  'all-p12-5': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 6,
    classe: 'Gentiluomo', nome: 'Aristide',
    squadra: [ { id: 306, livello: 59 }, { id: 289, livello: 60 } ],
    dialogo_prima: 'Un duello tra signori, prima che arrivi a Via Vittoria. Che ne dice?',
    dialogo_dopo: 'Sconfitta con eleganza si accetta con eleganza. Prosegua pure.',
    premio: 1500,
  },
  'all-p12-6': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 6,
    classe: 'Scalatore', nome: 'Rodolfo',
    squadra: [ { id: 95, livello: 59 }, { id: 76, livello: 60 } ],
    dialogo_prima: 'Roccia dura e Pokémon duri, così m\'allena io qui.',
    dialogo_dopo: 'Duro come la montagna, ma hai vinto tu.',
    premio: 1500,
  },
  'all-p12-7': {
    sprite: 'trainer_BIKER', ritratto: 'BIKER', vista: 6,
    classe: 'Motociclista', nome: 'Fabrizio',
    squadra: [ { id: 42, livello: 59 }, { id: 169, livello: 60 } ],
    dialogo_prima: 'Sta strada la conosco a memoria, avanti e indietro. Fatte sotto.',
    dialogo_dopo: 'Vabbè, oggi ha vinto la strada tua.',
    premio: 1500,
  },
  'all-p12-8': {
    sprite: 'trainer_PICNICKER', ritratto: 'PICNICKER', vista: 6,
    classe: 'Escursionista', nome: 'Genoveffa',
    squadra: [ { id: 322, livello: 58 }, { id: 323, livello: 59 } ],
    dialogo_prima: 'Nun capita spesso de trova\' un avversario da queste parti. Approfitto.',
    dialogo_dopo: 'Il picnic può aspettare. Bella lotta.',
    premio: 1450,
  },
  'all-p12-9': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 6,
    classe: 'Gentiluomo', nome: 'Celestino',
    squadra: [ { id: 233, livello: 60 }, { id: 260, livello: 61 } ],
    dialogo_prima: 'Otto medaglie, dico bene? Allora meriti la mia squadra migliore.',
    dialogo_dopo: 'Non capita spesso di perdere. Se lo ricordi con orgoglio.',
    premio: 1550,
  },
  'all-p12-10': {
    sprite: 'trainer_CAMPER', ritratto: 'CAMPER', vista: 6,
    classe: 'Campeggiatore', nome: 'Torquato',
    squadra: [ { id: 359, livello: 60 } ],
    dialogo_prima: 'Uno solo, ma quello vero. Vediamo se basta a fermatte.',
    dialogo_dopo: 'Nun bastava, evidentemente. Complimenti.',
    premio: 1400,
  },
  'all-p12-11': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 6,
    classe: 'Duro', nome: 'Anacleto',
    squadra: [ { id: 237, livello: 61 }, { id: 106, livello: 61 } ],
    dialogo_prima: 'Prima de Via Vittoria, io. Poi ce so\' quelli veri.',
    dialogo_dopo: 'Preparate\' bene, davanti a te c\'è ancora la Via Vittoria.',
    premio: 1600,
  },
  /* ── Monte Cavo — miniboss davanti ad Articuno (sessione 8 agosto, seconda
     parte). Squadra Ghiaccio/Fuoco/Roccia, livello medio tra il cap di Monte
     Porzio (34) e quello di Rocca di Papa (40) ≈ 37, come richiesto.
     speciale:true + curaDopoLotta:true sull'oggetto Tiled (js/map.js). ── */
  /* ── Monte Cavo — 5 allenatori "di guardia" (sessione 8 agosto, seconda
     parte, richiesti dopo il miniboss). Zona gated a 8 Medaglie, livelli
     58-63 come Percorso 12. Posizioni segnaposto lungo la salita verso
     Articuno, Luca le sposta. ── */
  'monte_cavo_1': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Alpinista', nome: 'Bonifacio',
    squadra: [ { id: 306, livello: 58 }, { id: 344, livello: 59 } ],
    dialogo_prima: 'Quassù solo i più tosti arrivano. Vediamo se sei uno di quelli.',
    dialogo_dopo: 'Il freddo mi ha rallentato, ecco cos\'è stato.',
    premio: 1450,
  },
  'monte_cavo_2': {
    sprite: 'trainer_PICNICKER', ritratto: 'PICNICKER', vista: 5,
    classe: 'Escursionista', nome: 'Wanda',
    squadra: [ { id: 361, livello: 58 }, { id: 362, livello: 59 } ],
    dialogo_prima: 'La neve qui non si scioglie mai. Come i miei Pokémon Ghiaccio, che non mollano mai.',
    dialogo_dopo: 'Complimenti, non capita spesso di perdere quassù.',
    premio: 1450,
  },
  'monte_cavo_3': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 5,
    classe: 'Duro', nome: 'Erminio',
    squadra: [ { id: 95, livello: 59 }, { id: 76, livello: 60 } ],
    dialogo_prima: 'Mi alleno qui apposta: aria sottile, terreno duro. Fatte sotto.',
    dialogo_dopo: 'Va bene, va bene. Hai vinto tu stavolta.',
    premio: 1500,
  },
  'monte_cavo_4': {
    sprite: 'trainer_GENTLEMAN', ritratto: 'GENTLEMAN', vista: 5,
    classe: 'Gentiluomo', nome: 'Casimiro',
    squadra: [ { id: 124, livello: 59 }, { id: 221, livello: 60 } ],
    dialogo_prima: 'Un duello con vista sul cratere. Non capita tutti i giorni, non trova?',
    dialogo_dopo: 'Sconfitta elegante quanto il panorama. Complimenti.',
    premio: 1550,
  },
  'monte_cavo_5': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 5,
    classe: 'Veterano', nome: 'Ruggiero',
    squadra: [ { id: 78, livello: 60 }, { id: 219, livello: 61 }, { id: 137, livello: 62 } ],
    dialogo_prima: 'L\'ultimo prima della cima sono io. Articuno può aspettare ancora un minuto.',
    dialogo_dopo: 'Vai pure. Lassù ti aspetta la vera sfida.',
    premio: 1650,
  },

  'monte_cavo_miniboss': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 4,
    classe: 'Cercatore di Destino', nome: 'Ottaviano',
    squadra: [
      { id: 78,  livello: 36 },  // Rapidash (Fuoco)
      { id: 75,  livello: 37 },  // Graveler (Roccia/Terra)
      { id: 219, livello: 38 },  // Magcargo (Fuoco/Roccia)
      { id: 221, livello: 37 },  // Piloswine (Ghiaccio/Terra)
      { id: 124, livello: 39 },  // Jynx (Ghiaccio/Psico, l'asso)
    ],
    dialogo_prima: 'Fermo lì, cosa credi di fare? Sto aspettando da anni questo momento, questo Pokémon è mio, è il mio destino.',
    dialogo_dopo: 'Evidentemente \'sto destino è una cagata.',
    premio: 2500,
  },

  'all-p12-12': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 6,
    classe: 'Veterano', nome: 'Ambrogio',
    squadra: [ { id: 306, livello: 61 }, { id: 330, livello: 62 }, { id: 344, livello: 62 } ],
    dialogo_prima: 'L\'ultimo di sto sentiero so\' io, e nun te la regalo.',
    dialogo_dopo: 'Sei pronto. Via dei Laghi t\'aspetta da un lato, Genzano dall\'altro.',
    premio: 1700,
  },

  /* ── VIA VITTORIA — dungeon finale pre-Lega, 12 allenatori + 2 rivali
     (13 agosto). Livelli 55-63, coerenti col cap 60 e coi livelli 60-66
     della Lega. Piazzati in Tiled come oggetti type "trainer" sui piani
     1f-5f (vedi sprites/maps_tiled/via vittoria_Nf.tmj, layer "eventi"). ── */

  'via_vittoria_1': {
    sprite: 'trainer_BLACKBELT', ritratto: 'BLACKBELT', vista: 5,
    classe: 'Cinturanera', nome: 'Learco',
    squadra: [ { id: 67, livello: 56 }, { id: 296, livello: 57 } ],
    dialogo_prima: 'Prima della Lega, un ultimo allenamento. Tu vai bene.',
    dialogo_dopo: 'Il corpo regge, ma la tecnica va affinata. Complimenti.',
    premio: 1680,
  },
  'via_vittoria_2': {
    sprite: 'trainer_COOLTRAINER_F', ritratto: 'COOLTRAINER_F', vista: 6,
    classe: 'Fuoriclasse', nome: 'Iris',
    squadra: [ { id: 302, livello: 56 }, { id: 353, livello: 57 }, { id: 200, livello: 58 } ],
    dialogo_prima: 'Chi arriva fin qui merita una sfida vera. Cominciamo.',
    dialogo_dopo: 'Notevole. Alla Lega ti staranno aspettando.',
    premio: 1740,
  },
  'via_vittoria_3': {
    sprite: 'trainer_POKEMANIAC', ritratto: 'POKEMANIAC', vista: 5,
    classe: 'Maniaco', nome: 'Sisto',
    squadra: [ { id: 95, livello: 57 }, { id: 246, livello: 58 } ],
    dialogo_prima: 'Ho scavato qui dentro per settimane. Guarda cosa ho trovato!',
    dialogo_dopo: 'Vabbè, torno a scavare.',
    premio: 1710,
  },
  'via_vittoria_4': {
    sprite: 'trainer_SWIMMER_M', ritratto: 'SWIMMER_M', vista: 5,
    classe: 'Nuotatore', nome: 'Dante',
    squadra: [ { id: 117, livello: 56 }, { id: 130, livello: 58 } ],
    dialogo_prima: 'Pure qui sott\'acqua, e mo\' che famo?',
    dialogo_dopo: 'Bella lotta, davero.',
    premio: 1660,
  },
  'via_vittoria_5': {
    sprite: 'trainer_SWIMMER2_F', ritratto: 'SWIMMER2_F', vista: 5,
    classe: 'Nuotatrice', nome: 'Ottavia',
    squadra: [ { id: 363, livello: 57 }, { id: 184, livello: 58 } ],
    dialogo_prima: 'L\'acqua qua dentro è gelida, ma io so\' allenata.',
    dialogo_dopo: 'Freddo o no, hai vinto tu.',
    premio: 1690,
  },
  'via_vittoria_6': {
    sprite: 'trainer_GAMBLER', ritratto: 'GAMBLER', vista: 5,
    classe: 'Scommettitore', nome: 'Furio',
    squadra: [ { id: 119, livello: 57 }, { id: 116, livello: 56 }, { id: 129, livello: 58 } ],
    dialogo_prima: 'Scommetto tutto su questa lotta. Che vinca il migliore.',
    dialogo_dopo: 'Ho perso la scommessa, ma è stato divertente.',
    premio: 1720,
  },
  'via_vittoria_7': {
    sprite: 'trainer_JUGGLER', ritratto: 'JUGGLER', vista: 5,
    classe: 'Giocoliere', nome: 'Ezio',
    squadra: [ { id: 356, livello: 58 }, { id: 42, livello: 59 } ],
    dialogo_prima: 'Un po\' di magia oscura per accompagnarti, che dici?',
    dialogo_dopo: 'Il trucco non ha funzionato, sei stato più bravo tu.',
    premio: 1750,
  },
  'via_vittoria_8': {
    sprite: 'trainer_SUPERNERD', ritratto: 'SUPERNERD', vista: 5,
    classe: 'Secchione', nome: 'Anselmo',
    squadra: [ { id: 359, livello: 60 } ],
    dialogo_prima: 'Ho calcolato le tue mosse. Statisticamente perdi tu.',
    dialogo_dopo: 'I calcoli erano sbagliati. Interessante.',
    premio: 1800,
  },
  'via_vittoria_9': {
    sprite: 'trainer_HIKER', ritratto: 'HIKER', vista: 6,
    classe: 'Alpinista', nome: 'Curzio',
    squadra: [ { id: 304, livello: 58 }, { id: 305, livello: 59 } ],
    dialogo_prima: 'Sto sentiero l\'ho scalato mille volte. Nun me fai paura.',
    dialogo_dopo: 'Rispetto, forestiero.',
    premio: 1730,
  },
  'via_vittoria_10': {
    sprite: 'trainer_BEAUTY', ritratto: 'BEAUTY', vista: 5,
    classe: 'Modella', nome: 'Fiorenza',
    squadra: [ { id: 231, livello: 58 }, { id: 232, livello: 59 } ],
    dialogo_prima: 'Che posto orribile per il trucco, ma la lotta è lotta.',
    dialogo_dopo: 'Hai rovinato la messa in piega. Ben fatto comunque.',
    premio: 1740,
  },
  'via_vittoria_11': {
    sprite: 'trainer_RUINMANIAC', ritratto: 'RUINMANIAC', vista: 5,
    classe: 'Archeologo', nome: 'Osvaldo',
    squadra: [ { id: 337, livello: 59 }, { id: 338, livello: 59 } ],
    dialogo_prima: 'Queste rovine nascondono segreti antichi. E pure una bella lotta.',
    dialogo_dopo: 'I segreti restano tuoi stavolta.',
    premio: 1770,
  },
  'via_vittoria_12': {
    sprite: 'trainer_CUEBALL', ritratto: 'CUEBALL', vista: 6,
    classe: 'Duro', nome: 'Genesio',
    squadra: [ { id: 328, livello: 58 }, { id: 329, livello: 60 }, { id: 227, livello: 61 } ],
    dialogo_prima: 'Ultima fatica prima della Lega. Dacce dentro.',
    dialogo_dopo: 'Va bene così, tocca a te ora.',
    premio: 1790,
  },

  /* ── Rivale REMO — ricompare a Via Vittoria, ultima tappa prima della
     Lega (stesso pattern "tappa" di rivale_tuscolo: in Tiled si passa
     tappa/asso_livello sull'oggetto e la squadra si scala in automatico,
     vedi costruisciSquadraRivale in js/map.js). Flag di vittoria dedicato
     e diverso da rivale_tuscolo_battuto: è un incontro distinto. ── */
  'rivale_via_vittoria': {
    sprite: 'RIVALE_1', ritratto: 'POKEMONTRAINER_Brendan', vista: 6,
    classe: 'Rivale', nome: 'Remo',
    rivale: true,
    flagVittoria: 'rivale_via_vittoria_battuto',
    squadra: [                  // fallback se manca la prop "tappa"
      { id: 262, livello: 58 },
      { id: 289, livello: 58 },
      { id: 18,  livello: 59 },
    ],
    dialogo_prima: 'Eccoci, l\'ultima volta prima della Lega. Dopo questa, ci si rivede sul trono.',
    dialogo_dopo: 'Ancora tu... Vabbè, ci si rivede a Colonna. Preparati sul serio.',
    premio: 3000,
  },

  /* ── Secondo rivale — dot piazzato, IDENTITÀ ANCORA DA DECIDERE (Luca,
     domanda D13 in docs/TODO.md: nome/aspetto/carattere). Squadra e
     dialoghi PLACEHOLDER, sprite temporaneo trainer_rivale_2.png già
     presente negli asset. Da riscrivere quando Luca decide chi è. ── */
  'rivale2_via_vittoria': {
    sprite: 'trainer_rivale_2', ritratto: 'trainer_rivale_2', vista: 6,
    classe: '[DA DECIDERE]', nome: '[DA DECIDERE]',
    squadra: [ { id: 302, livello: 58 }, { id: 359, livello: 59 }, { id: 248, livello: 60 } ],
    dialogo_prima: '[Dialogo placeholder — identità del secondo rivale da decidere, vedi TODO.md D13]',
    dialogo_dopo: '[Dialogo placeholder — identità del secondo rivale da decidere, vedi TODO.md D13]',
    premio: 2200,
  },

  /* ── Lega Pokémon di Colonna (sess. 5 set 2026): un membro del
     Superquattro/Campione per piano (1f-4f Superquattro, 5f Campione).
     Il campo "squadra" qui NON viene mai letto per loro: _avviaLottaTrainer
     in js/map.js vede "superquattro"/"campione" e pesca la squadra vera dal
     pool con estraiTeamSuperquattro()/estraiTeamRemo() (js/app.js, sistema
     già scritto — SUPERQUATTRO/REMO_LEGA in js/data.js, 5 random + core più
     forte sempre per ultimo, come da CLAUDE.md). "squadra" resta solo come
     fallback di sicurezza se quelle funzioni non fossero disponibili. ── */
  'sq_captain': {
    sprite: 'Capitano', ritratto: 'ELITEFOUR_Bruno', vista: 5,
    classe: 'Superquattro', nome: 'Captain',
    superquattro: 'sq-captain',
    flagVittoria: 'sq_captain_battuto',
    squadra: [ { id: 248, livello: 61 } ],   // fallback: solo il core (Tyranitar)
    dialogo_dopo: 'Impressionante. Ma le prossime sale sono ancora più dure.',
    premio: 12000,
  },
  'sq_pres': {
    sprite: 'Er_pres_superquattro', ritratto: 'ELITEFOUR_Lance', vista: 5,
    classe: 'Superquattro', nome: 'Pres',
    superquattro: 'sq-pres',
    flagVittoria: 'sq_pres_battuto',
    squadra: [ { id: 149, livello: 62 } ],   // fallback: solo il core (Dragonite)
    dialogo_dopo: 'Il tuono si è placato. Vai avanti, hai guadagnato il diritto.',
    premio: 13000,
  },
  'sq_dema': {
    sprite: 'Dema_superquattro', ritratto: 'ELITEFOUR_Lorelei', vista: 5,
    classe: 'Superquattro', nome: 'Dema',
    superquattro: 'sq-dema',
    flagVittoria: 'sq_dema_battuto',
    squadra: [ { id: 282, livello: 62 } ],   // fallback: solo il core (Gardevoir)
    dialogo_dopo: 'La tua mente è più forte della mia magia. Avanti.',
    premio: 13000,
  },
  'sq_marcuois': {
    sprite: 'Marcus_superquattro', ritratto: 'ELITEFOUR_Agatha', vista: 5,
    classe: 'Superquattro', nome: 'Marcuois',
    superquattro: 'sq-marcuois',
    flagVittoria: 'sq_marcuois_battuto',
    squadra: [ { id: 376, livello: 63 } ],   // fallback: solo il core (Metagross)
    dialogo_dopo: 'Acciaio spezzato. Non credevo fosse possibile. Vai dal Campione.',
    premio: 14000,
  },
  'campione_remo': {
    // Stesso sprite del Remo "rivale" (rivale_via_vittoria sopra): è lo
    // stesso personaggio, non un allenatore generico — deve sembrare lui.
    sprite: 'RIVALE_1', ritratto: 'POKEMONTRAINER_Brendan', vista: 5,
    classe: 'Campione', nome: 'Remo',
    campioneLega: true,
    flagVittoria: 'campione_remo_battuto',
    squadra: [ { id: 6, livello: 65 } ],     // fallback: solo un core plausibile
    dialogo_dopo: 'Hai vinto. Sei tu il nuovo Campione dei Castelli Romani.',
    premio: 20000,
  },

  /* ── Osservatorio CoTrAL (sess. 15 set 2026, ridisegnato dopo il primo
     giro — coppie "in scatola" bocciate da Luca): ogni grunt è SOLO, libera
     di girare per il piano (movimento:'random' sull'oggetto Tiled), con una
     squadra da 4-6 Pokémon per reggere da solo un 2 CONTRO 1 (tu + Camilla
     alleata contro di lui — Battle.avviaDoppia opzioni.alleato, vedi
     js/map.js _checkOsservatorioGruntTrigger). Il Boss del 2F resta
     deferito a una sessione dedicata (solo trigger/cutscene, nessuna
     squadra qui). ── */
  // Progressione di livello/squadra RIVISTA (sess. 17 set 2026, richiesta
  // esplicita di Luca: "i grunt non possono avere lo stesso team del
  // luogotenente, devono essere un pochino più scarsi"). Prima tutti i
  // grunt (esterni + 3 piani) e il Luogotenente pescavano dalla STESSA
  // manciata di specie Roccia/Terra/Acciaio a livelli quasi identici
  // (54-58 i grunt, 57-60 il Luogotenente): nessuna vera scalata di
  // difficoltà. Ora: Flygon e Steelix sono ESCLUSIVI del Luogotenente
  // (nessun grunt li usa), e i livelli salgono per davvero via via che si
  // sale nell'edificio (45 esterni → 48-50 1F → 51-53 2F → 53-55 3F → 57-60
  // Luogotenente), così il salto di forza all'ultimo piano si sente.
  'cotral_osservatorio_grunt_ext_1': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 0,
    classe: 'Addetto CoTrAL', nome: 'Addetto CoTrAL',
    squadra: [ { id: 74, livello: 45 } ],   // Geodude
    dialogo_prima: 'Qui non si passa, ficcanaso. Ordini dall\'alto.',
    dialogo_dopo: 'Impossibile... richiamo rinforzi.',
    premio: 1800,
  },
  'cotral_osservatorio_grunt_ext_2': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 0,
    classe: 'Addetta CoTrAL', nome: 'Addetta CoTrAL',
    squadra: [ { id: 27, livello: 45 } ],   // Sandshrew
    dialogo_prima: 'La Capopalestra ha già dato fastidio abbastanza. Tu non ti aggiungere.',
    dialogo_dopo: 'Non... non doveva andare così.',
    premio: 1800,
  },
  'cotral_osservatorio_1f_a': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 0,
    classe: 'Addetto CoTrAL', nome: 'Addetto CoTrAL',
    squadra: [
      { id: 75,  livello: 48 },   // Graveler
      { id: 105, livello: 48 },   // Marowak
      { id: 28,  livello: 49 },   // Sandslash
    ],
    dialogo_prima: 'Il rifugio è scoperto, tanto vale sporcarsi le mani.',
    premio: 2600,
  },
  'cotral_osservatorio_1f_b': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 0,
    classe: 'Addetta CoTrAL', nome: 'Addetta CoTrAL',
    squadra: [
      { id: 34,  livello: 48 },   // Nidoking
      { id: 31,  livello: 48 },   // Nidoqueen
      { id: 51,  livello: 49 },   // Dugtrio
    ],
    dialogo_prima: 'Non dovevi vedere niente di tutto questo.',
    premio: 2600,
  },
  'cotral_osservatorio_1f_c': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 0,
    classe: 'Addetto CoTrAL', nome: 'Addetto CoTrAL',
    squadra: [
      { id: 112, livello: 49 },   // Rhydon
      { id: 75,  livello: 49 },   // Graveler
      { id: 31,  livello: 50 },   // Nidoqueen
    ],
    dialogo_prima: 'Qui dentro comandiamo noi, ricordatelo.',
    premio: 2800,
  },
  'cotral_osservatorio_2f_a': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 0,
    classe: 'Addetta CoTrAL', nome: 'Addetta CoTrAL',
    squadra: [
      { id: 51,  livello: 51 },   // Dugtrio
      { id: 105, livello: 51 },   // Marowak
      { id: 34,  livello: 52 },   // Nidoking
      { id: 75,  livello: 52 },   // Graveler
    ],
    dialogo_prima: 'Sei arrivato più a fondo di chiunque altro. Fin qui, però.',
    premio: 3200,
  },
  'cotral_osservatorio_2f_b': {
    sprite: 'Grunt_Cotral_uomo', ritratto: 'trainer_CoTral_M', vista: 0,
    classe: 'Addetto CoTrAL', nome: 'Addetto CoTrAL',
    squadra: [
      { id: 112, livello: 51 },   // Rhydon
      { id: 28,  livello: 52 },   // Sandslash
      { id: 31,  livello: 52 },   // Nidoqueen
      { id: 105, livello: 53 },   // Marowak
    ],
    dialogo_prima: 'La statua non è un semplice ornamento, sai? Ma questo non ti riguarda.',
    premio: 3200,
  },
  'cotral_osservatorio_3f_a': {
    sprite: 'Grunt_Cotral_donna', ritratto: 'trainer_CoTral_F', vista: 0,
    classe: 'Addetta CoTrAL', nome: 'Addetta CoTrAL',
    squadra: [
      { id: 34,  livello: 53 },   // Nidoking
      { id: 51,  livello: 53 },   // Dugtrio
      { id: 112, livello: 54 },   // Rhydon
      { id: 75,  livello: 54 },   // Graveler
      { id: 105, livello: 55 },   // Marowak
    ],
    dialogo_prima: 'Ultimo piano, ultima possibilità di andartene.',
    premio: 3600,
  },
  // Luogotenente CoTrAL (3F, SOLO — nessuna guardia): sconfitto, lascia la
  // Chiave Segreta. Squadra da 6, tenore boss di piano: Flygon e Steelix
  // sono SOLO suoi (nessun grunt li schiera), livelli 57-60 chiaramente
  // sopra tutto il resto del roster CoTrAL dell'Osservatorio.
  'cotral_osservatorio_luogotenente': {
    sprite: 'Capo_Cotral', ritratto: 'trainer_CoTral_F', vista: 0,
    classe: 'Luogotenente CoTrAL', nome: 'Luogotenente',
    squadra: [
      { id: 75,  livello: 57 },   // Graveler
      { id: 105, livello: 57 },   // Marowak
      { id: 31,  livello: 58 },   // Nidoqueen
      { id: 330, livello: 58 },   // Flygon (esclusivo)
      { id: 208, livello: 59 },   // Steelix (esclusivo)
      { id: 112, livello: 60 },   // Rhydon (asso)
    ],
    dialogo_prima: 'Tu... non dovresti essere qui. Nessuno arriva così lontano senza essere fermato prima.',
    dialogo_dopo: 'Va bene, va bene! Tieni questa maledetta chiave, e sparisci da qui prima che arrivi il Comandante.',
    premio: 4500,
  },
  // Comandante CoTrAL — boss finale della cutscene del 2F (sess. 18 set
  // 2026). Lotta 1 CONTRO 1 (Camilla si tira indietro apposta, "andiamo uno
  // alla volta"), gestita per intero da _cutsceneBossFinaleOsservatorio in
  // map.js (dialoghi/animazioni prima e dopo, non passa da _avviaLottaTrainer).
  // Squadra scelta con Luca: Zapdos e Jirachi sono ESPLICITAMENTE suoi (il
  // "controllo dei pokémon necessari" di cui parla nel dialogo), + 4 forti
  // non leggendari di taglia pseudo-leggendaria per reggere il ruolo di
  // vero boss dell'intero dungeon — nessuno nel resto dell'Osservatorio
  // arriva a questo livello.
  'cotral_boss_osservatorio': {
    sprite: 'NPC', ritratto: 'trainer_ROCKETBOSS', vista: 0,
    classe: 'Comandante CoTrAL', nome: 'Comandante',
    squadra: [
      { id: 145, livello: 58 },   // Zapdos
      { id: 385, livello: 58 },   // Jirachi
      { id: 306, livello: 59 },   // Aggron
      { id: 350, livello: 59 },   // Milotic
      { id: 373, livello: 60 },   // Salamence
      { id: 376, livello: 62 },   // Metagross (asso)
    ],
    premio: 6000,
  },
};
