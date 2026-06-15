/* ============================================================
   data.js — Dati statici del gioco
   Palestre (8), Lega Pokémon, colori/nomi dei tipi, costanti.
   Coordinate verificate su OpenStreetMap/Nominatim (giugno 2026).
   ============================================================ */

// Posizione iniziale del giocatore (nuove partite): la città di partenza,
// un quartiere alla periferia di Roma sulla Via Tuscolana (stile Biancavilla).
const POSIZIONE_INIZIALE = { lat: 41.8421, lon: 12.6158 };

/* ----------------------------------------------------------
   ⚠️ MODALITÀ TEST — DA METTERE A false A GIOCO COMPLETO! ⚠️
   Con true: 999 Caramelle Rare nello zaino a ogni avvio
   (ogni caramella = +1 livello, fuori battaglia, dal menu Squadra).
   Serve solo per testare velocemente palestre e progressione.
   ---------------------------------------------------------- */
const MODALITA_TEST = true;

/* ----------------------------------------------------------
   CITTÀ DI PARTENZA + LABORATORIO DEL PROFESSORE (F7)
   ---------------------------------------------------------- */
const CITTA_PARTENZA = {
  id: 'citta-partenza',
  nome: 'Quartiere Tuscolano',
  lat: 41.8420, lon: 12.6150,
};

const PROFESSORE_NOME = 'Prof. Castagno'; // come i castagni di Rocca di Papa!

const LABORATORIO = {
  id: 'laboratorio',
  nome: 'Laboratorio del Prof. Castagno',
  lat: 41.8425, lon: 12.6165,
};

// Starter per generazione (il gioco usa SOLO le Gen 1-3):
// il giocatore sceglie prima la generazione, poi uno dei suoi tre starter.
const STARTER_PER_GEN = {
  1: [
    { id: 1,   nome: 'Bulbasaur',  tipo: 'grass' },
    { id: 4,   nome: 'Charmander', tipo: 'fire'  },
    { id: 7,   nome: 'Squirtle',   tipo: 'water' },
  ],
  2: [
    { id: 152, nome: 'Chikorita',  tipo: 'grass' },
    { id: 155, nome: 'Cyndaquil',  tipo: 'fire'  },
    { id: 158, nome: 'Totodile',   tipo: 'water' },
  ],
  3: [
    { id: 252, nome: 'Treecko',    tipo: 'grass' },
    { id: 255, nome: 'Torchic',    tipo: 'fire'  },
    { id: 258, nome: 'Mudkip',     tipo: 'water' },
  ],
};
const GEN_NOMI = { 1: 'Generazione I — Kanto', 2: 'Generazione II — Johto', 3: 'Generazione III — Hoenn' };
const LIVELLO_STARTER = 5;

// IL RIVALE: sceglie (da una generazione QUALSIASI tra le tre) lo starter
// del tipo FORTE contro il tuo: Erba→lui Fuoco, Fuoco→lui Acqua, Acqua→lui Erba.
const RIVALE_NOME = 'Remo'; // come Romolo e Remo: il rivale "romano"!
const CONTRO_TIPO = { grass: 'fire', fire: 'water', water: 'grass' };

// Vista iniziale della mappa
const CENTRO_MAPPA = { lat: 41.76, lon: 12.69, zoom: 13 };

// Nomi dei due Team antagonisti (costanti separate, sostituibili)
const TEAM_GDF_NOME    = 'Team GdF';    // pre-Lega, meteo & business
const TEAM_COTRAL_NOME = 'Team CoTrAL'; // post-Lega, scienza & clonazione

/* ----------------------------------------------------------
   ECONOMIA (F9.2)
   La valuta del gioco sono i Pokéyen (simbolo ₽).
   ---------------------------------------------------------- */
const SOLDI_INIZIALI = 3000;  // gruzzolo di partenza di ogni nuova partita
const RAGGIO_MARKET  = 150;   // distanza max (m) per usare un Poké Market

/* ----------------------------------------------------------
   8 PALESTRE — ordine del path (progressione geografica)
   levelCap: il livello massimo dei Pokémon del giocatore
             prima di battere questa palestra.
   ---------------------------------------------------------- */
const PALESTRE = [
  {
    id: 'frascati',
    ordine: 1,
    comune: 'Frascati',
    luogo: 'Villa Torlonia',
    lat: 41.8036, lon: 12.6796,
    tipo: 'Erba',
    levelCap: 14,
    descrizione: 'Tra i giardini e le vigne tuscolane, il Capopalestra coltiva Pokémon di tipo Erba.',
    medaglia: 'Medaglia Vigna',
    capopalestra: {
      nome: 'Vinicio',
      premioSoldi: 1400,  // ricompensa in Pokéyen alla sconfitta
      // L'asso (Roselia) è al livello del level cap pre-palestra: 14
      squadra: [
        { id: 43,  livello: 11 },  // Oddish
        { id: 285, livello: 12 },  // Shroomish
        { id: 44,  livello: 13 },  // Gloom (già evoluto: BST 395)
        { id: 315, livello: 14 },  // Roselia (l'asso, BST 400)
      ],
      dialogoIntro: [
        'Benvenuto a Villa Torlonia, giovane sfidante!',
        'Sono Vinicio, Capopalestra di Frascati. I miei Pokémon Erba sono cresciuti tra i filari delle vigne, nutriti dal sole dei Castelli!',
        'Come un buon Frascati DOC, la mia squadra ha carattere. Vediamo se reggi il confronto!'
      ],
      dialogoSconfitta: 'Che lotta! Hai la stoffa di un vino d\'annata. La Medaglia Vigna è tua, te la sei meritata!'
    },
    gregari: [
      { id: 'greg-frasc-1', classe: 'Vendemmiatore', nome: 'Aldo',
        squadra: [{ id: 43, livello: 9 }, { id: 69, livello: 10 }],
        premioSoldi: 200,
        dialogoIntro: ['Tra questi filari ho allenato i miei Pokémon Erba fin da quando erano semini. Guarda che radici!'],
        dialogoSconfitta: 'Annata storta per me.',
        dialogoDopo: ['Il Capopalestra è ancora più forte, sappilo.'] },
      { id: 'greg-frasc-2', classe: 'Botanica', nome: 'Fiamma',
        squadra: [{ id: 187, livello: 11 }, { id: 285, livello: 12 }],
        premioSoldi: 240,
        dialogoIntro: ['Studio le piante di Villa Torlonia da anni. I miei Pokémon assorbono la luce come le vigne!'],
        dialogoSconfitta: 'Ci vuole ancora un po\' di sole.',
        dialogoDopo: ['Le vigne in autunno sono bellissime. Torna a vederle.'] },
      { id: 'greg-frasc-3', classe: 'Orticoltore', nome: 'Bruno',
        squadra: [{ id: 44, livello: 12 }, { id: 69, livello: 13 }],
        premioSoldi: 280,
        dialogoIntro: ['Servo la palestra di Vinicio da tre stagioni. Vedrai, il Capopalestra ha radici più profonde delle mie!'],
        dialogoSconfitta: 'La mia vigna ha bisogno di cure.',
        dialogoDopo: ['Vinicio ti sta aspettando. In gamba!'] },
    ]
  },
  {
    id: 'grottaferrata',
    ordine: 2,
    comune: 'Grottaferrata',
    luogo: 'Abbazia di San Nilo',
    lat: 41.7858, lon: 12.6668,
    tipo: 'Psico',
    levelCap: 21,
    descrizione: "Nell'antica abbazia millenaria, la meditazione potenzia i Pokémon di tipo Psico.",
    medaglia: 'Medaglia Icona',
    capopalestra: {
      nome: 'Nilo',
      premioSoldi: 2100,
      squadra: [
        { id: 177, livello: 17 },  // Natu
        { id: 325, livello: 18 },  // Spoink
        { id: 64,  livello: 19 },  // Kadabra (BST 400)
        { id: 97,  livello: 20 },  // Hypno (BST 483)
        { id: 326, livello: 21 },  // Grumpig (l'asso, BST 470)
      ],
      dialogoIntro: [
        'Benvenuto all\'Abbazia di San Nilo, pellegrino.',
        'Sono Nilo: tra questi chiostri millenari ho imparato che la vera forza nasce dalla quiete della mente.',
        'I miei Pokémon Psico e io meditiamo insieme ogni alba. Mostrami la disciplina del tuo spirito!'
      ],
      dialogoSconfitta: 'La tua mente è limpida come l\'acqua della Marana. La Medaglia Icona è tua.'
    },
    gregari: [
      { id: 'greg-grott-1', classe: 'Monaco', nome: "Fra' Matteo",
        squadra: [{ id: 177, livello: 15 }, { id: 96, livello: 16 }],
        premioSoldi: 300,
        dialogoIntro: ['La pace della mente non è debolezza. È la forza che non si vede. Ora dimostramelo!'],
        dialogoSconfitta: 'La tua determinazione è forte. Medita su questo.',
        dialogoDopo: ['La quiete è ancora qui. Torna quando hai bisogno di silenzio.'] },
      { id: 'greg-grott-2', classe: 'Studioso', nome: 'Renato',
        squadra: [{ id: 63, livello: 17 }, { id: 177, livello: 17 }],
        premioSoldi: 340,
        dialogoIntro: ['Analizzo le strategie di battaglia come i testi antichi. La tua è già esposta!'],
        dialogoSconfitta: 'Ho sottovalutato le variabili.',
        dialogoDopo: ['Studio ancora. Tu pure non smettere.'] },
      { id: 'greg-grott-3', classe: 'Meditante', nome: 'Chiara',
        squadra: [{ id: 325, livello: 17 }, { id: 280, livello: 18 }],
        premioSoldi: 360,
        dialogoIntro: ['Nei miei Pokémon riverso ogni ora di meditazione. Sentirai il peso della mente!'],
        dialogoSconfitta: 'Devo approfondire la mia pratica.',
        dialogoDopo: ['Sei concentrato. È una qualità rara.'] },
      { id: 'greg-grott-4', classe: 'Allievo', nome: 'Dario',
        squadra: [{ id: 64, livello: 18 }, { id: 325, livello: 19 }],
        premioSoldi: 400,
        dialogoIntro: ['Sono l\'allievo avanzato di Nilo. Prima di parlare col maestro, rispondi a me!'],
        dialogoSconfitta: 'Il maestro avrà da ridire.',
        dialogoDopo: ['Nilo è dentro. Buona fortuna, ne avrai bisogno.'] },
    ]
  },
  {
    id: 'marino',
    ordine: 3,
    comune: 'Marino',
    luogo: 'Fontana dei Quattro Mori',
    lat: 41.7686, lon: 12.6624,
    tipo: 'Acqua',
    levelCap: 28,
    descrizione: "Dalla fontana che alla Sagra dell'Uva versa vino, sgorgano Pokémon di tipo Acqua.",
    medaglia: 'Medaglia Fontana',
    capopalestra: {
      nome: 'Moro',
      premioSoldi: 2800,
      squadra: [
        { id: 279, livello: 25 },  // Pelipper (BST 440)
        { id: 119, livello: 26 },  // Seaking (BST 450)
        { id: 195, livello: 26 },  // Quagsire (BST 430)
        { id: 184, livello: 27 },  // Azumarill (BST 420)
        { id: 130, livello: 28 },  // Gyarados (l'asso, BST 540!)
      ],
      dialogoIntro: [
        'Ehilà! Sono Moro, come i Quattro Mori della nostra fontana!',
        'Lo sai che alla Sagra dell\'Uva la fontana versa vino invece dell\'acqua? Ma per i miei Pokémon solo acqua di sorgente, eh!',
        'Vediamo se sai navigare in acque agitate!'
      ],
      dialogoSconfitta: 'Mi hai travolto come una piena! Quest\'anno alla Sagra la fontana verserà in tuo onore. Ecco la Medaglia Fontana!'
    },
    gregari: [
      { id: 'greg-marino-1', classe: 'Pescatore', nome: 'Lello',
        squadra: [{ id: 60, livello: 22 }, { id: 118, livello: 23 }],
        premioSoldi: 400,
        dialogoIntro: ['Pesco da trent\'anni nel lago. I miei Pokémon Acqua sanno come si combatte in acqua alta!'],
        dialogoSconfitta: 'Stavolta il pesce grosso sei tu.',
        dialogoDopo: ['Moro ama il Gyarados. Attento alle onde alte.'] },
      { id: 'greg-marino-2', classe: 'Nuotatrice', nome: 'Giada',
        squadra: [{ id: 72, livello: 23 }, { id: 183, livello: 24 }],
        premioSoldi: 420,
        dialogoIntro: ['Nuoto nel Lago Albano ogni mattina. I miei Pokémon Acqua hanno resistenza da vendere!'],
        dialogoSconfitta: 'Corrente troppo forte, stavolta.',
        dialogoDopo: ['Il lago in estate è bellissimo. Torna con il Surf!'] },
      { id: 'greg-marino-3', classe: 'Bagnino', nome: 'Marco',
        squadra: [{ id: 60, livello: 24 }, { id: 54, livello: 25 }],
        premioSoldi: 440,
        dialogoIntro: ['Salvo i bagnanti dal mare. Salverò pure me da questa sconfitta!'],
        dialogoSconfitta: 'SOS: ho bisogno di aiuto.',
        dialogoDopo: ['Occhio al Gyarados di Moro: è la prima a uscire.'] },
      { id: 'greg-marino-4', classe: 'Sommozzatore', nome: 'Enzo',
        squadra: [{ id: 86, livello: 25 }, { id: 116, livello: 26 }],
        premioSoldi: 460,
        dialogoIntro: ['Ho esplorato il fondo del lago. Laggiù ci sono cose che non si possono dire. E Pokémon fortissimi!'],
        dialogoSconfitta: 'Risalgo a fare pratica.',
        dialogoDopo: ['Sotto il lago Albano… ci dorme qualcosa. Non è un Pokémon qualunque.'] },
      { id: 'greg-marino-5', classe: 'Velista', nome: 'Corinna',
        squadra: [{ id: 279, livello: 25 }, { id: 183, livello: 26 }],
        premioSoldi: 480,
        dialogoIntro: ['Vado a vela sul lago da vent\'anni. Il vento è con me, oggi!'],
        dialogoSconfitta: 'Vento contrario.',
        dialogoDopo: ['Moro ti aspetta. È tosto, ma simpatico.'] },
    ]
  },
  {
    id: 'monte-porzio',
    ordine: 4,
    comune: 'Monte Porzio Catone',
    luogo: "Centro storico (Osservatorio)",
    lat: 41.8164, lon: 12.7153,
    tipo: 'Elettro',
    levelCap: 34,
    descrizione: "L'osservatorio astronomico sul colle alimenta Pokémon di tipo Elettro.",
    medaglia: 'Medaglia Stella',
    capopalestra: {
      nome: 'Stella',
      premioSoldi: 3400,
      squadra: [
        { id: 26,  livello: 31 },  // Raichu (BST 485)
        { id: 101, livello: 32 },  // Electrode (BST 490)
        { id: 82,  livello: 32 },  // Magneton (BST 465)
        { id: 310, livello: 33 },  // Manectric (BST 475)
        { id: 181, livello: 34 },  // Ampharos (l'asso, BST 510)
      ],
      dialogoIntro: [
        'Ciao! Sono Stella, astronoma dell\'Osservatorio di Monte Porzio.',
        'Ogni notte studio le stelle… e i miei Pokémon Elettro generano l\'energia dei telescopi!',
        'Preparati: la mia squadra colpisce alla velocità della luce!'
      ],
      dialogoSconfitta: 'Brilli più di una supernova! La Medaglia Stella è tua: portala in alto!'
    },
    gregari: [
      { id: 'greg-mporzio-1', classe: 'Tecnico', nome: 'Fausto',
        squadra: [{ id: 81, livello: 28 }, { id: 100, livello: 29 }],
        premioSoldi: 500,
        dialogoIntro: ['Mantengo i telescopi dell\'osservatorio. I miei Pokémon Elettro alimentano tutto!'],
        dialogoSconfitta: 'Cortocircuito.',
        dialogoDopo: ['Stella ha Ampharos. Quella coda brilla forte.'] },
      { id: 'greg-mporzio-2', classe: 'Astrofila', nome: 'Dora',
        squadra: [{ id: 25, livello: 29 }, { id: 170, livello: 30 }],
        premioSoldi: 520,
        dialogoIntro: ['Studio le stelle dall\'osservatorio. L\'elettricità dei miei Pokémon accende i sogni!'],
        dialogoSconfitta: 'La mia stella ha perso luminosità.',
        dialogoDopo: ['Nei giorni di temporale qui l\'elettricità nell\'aria è palpabile.'] },
      { id: 'greg-mporzio-3', classe: 'Meteorologa', nome: 'Ines',
        squadra: [{ id: 311, livello: 30 }, { id: 312, livello: 31 }],
        premioSoldi: 540,
        dialogoIntro: ['Prevedo i temporali. Oggi prevedo anche la tua sconfitta!'],
        dialogoSconfitta: 'Previsione errata.',
        dialogoDopo: ['Tra qualche giorno forse piove. E quando piove qui…'] },
      { id: 'greg-mporzio-4', classe: 'Fisico', nome: 'Aurelio',
        squadra: [{ id: 82, livello: 31 }, { id: 101, livello: 32 }],
        premioSoldi: 560,
        dialogoIntro: ['La fisica quantistica dice che hai il 30% di probabilità di vincere. Oggi.'],
        dialogoSconfitta: 'Il 30% ha vinto. Interessante.',
        dialogoDopo: ['Stella è brava con le equazioni. E con i Pokémon.'] },
      { id: 'greg-mporzio-5', classe: 'Ingegnere', nome: 'Livio',
        squadra: [{ id: 100, livello: 31 }, { id: 180, livello: 32 }],
        premioSoldi: 560,
        dialogoIntro: ['Ho progettato il sistema elettrico di questo osservatorio. E la mia squadra!'],
        dialogoSconfitta: 'Sistema in sovraccarico.',
        dialogoDopo: ['L\'Ampharos di Stella ha la coda che illumina la notte intera.'] },
      { id: 'greg-mporzio-6', classe: 'Ricercatrice', nome: 'Nadia',
        squadra: [{ id: 309, livello: 32 }, { id: 82, livello: 33 }],
        premioSoldi: 580,
        dialogoIntro: ['Sono la ricercatrice senior di questo osservatorio. Superare me non è dato a tutti!'],
        dialogoSconfitta: 'Devo riscrivere i dati.',
        dialogoDopo: ['Stella ti aspetta nella sala principale. In bocca al lupo.'] },
    ]
  },
  {
    id: 'rocca-di-papa',
    ordine: 5,
    comune: 'Rocca di Papa',
    luogo: 'Centro storico (sotto Monte Cavo)',
    lat: 41.7608, lon: 12.7096,
    tipo: 'Roccia',
    levelCap: 40,
    descrizione: 'Sul fianco del vulcano laziale, la pietra forgia Pokémon di tipo Roccia e Terra.',
    medaglia: 'Medaglia Cratere',
    capopalestra: {
      nome: 'Rocco',
      premioSoldi: 4000,
      squadra: [
        { id: 28,  livello: 36 },  // Sandslash (BST 450)
        { id: 305, livello: 37 },  // Lairon (BST 430)
        { id: 76,  livello: 38 },  // Golem (BST 495)
        { id: 112, livello: 39 },  // Rhydon (BST 485)
        { id: 306, livello: 40 },  // Aggron (l'asso, BST 530)
      ],
      dialogoIntro: [
        'Fermo lì! Sono Rocco di Rocca di Papa, e qui si lotta sulla pietra viva del Vulcano Laziale!',
        'Il Monte Cavo ci guarda: i miei Pokémon sono nati dalla sua roccia.',
        'Spero che tu non sia di quelli che si sgretolano al primo colpo!'
      ],
      dialogoSconfitta: 'Mi hai frantumato le certezze! Sei duro come il peperino. Prendi la Medaglia Cratere!'
    },
    gregari: [
      { id: 'greg-rocca-1', classe: 'Speleologo', nome: 'Dante',
        squadra: [{ id: 74, livello: 34 }, { id: 41, livello: 35 }],
        premioSoldi: 700,
        dialogoIntro: ['Ho esplorato le grotte del Vulcano Laziale. Duro come la roccia, sono!'],
        dialogoSconfitta: 'La pietra cede, stavolta.',
        dialogoDopo: ['Rocco ama i Pokémon pesanti come macigni.'] },
      { id: 'greg-rocca-2', comune: 'Rocca di Papa', classe: 'Gestore', nome: 'Ubaldo',
        squadra: [{ id: 74, livello: 35 }, { id: 95, livello: 35 }],
        premioSoldi: 720,
        dialogoIntro: ['Gestisco l\'accesso alla palestra. Nessuno passa senza una buona lotta!'],
        dialogoSconfitta: 'Accesso concesso.',
        dialogoDopo: ['Avanti, ma attento: Rocco è un\'altra storia.'] },
      { id: 'greg-rocca-3', classe: 'Rocciatore', nome: 'Emilio',
        squadra: [{ id: 111, livello: 35 }, { id: 299, livello: 36 }],
        premioSoldi: 740,
        dialogoIntro: ['Scalo le pareti del vulcano per allenamento. I miei Pokémon Roccia sono come me: inscalfibili!'],
        dialogoSconfitta: 'Scivolato.',
        dialogoDopo: ['Nosepass punta sempre a nord. Orientati e prosegui.'] },
      { id: 'greg-rocca-4', classe: 'Minatore', nome: 'Siro',
        squadra: [{ id: 304, livello: 36 }, { id: 74, livello: 37 }],
        premioSoldi: 760,
        dialogoIntro: ['Scavo nel ventre del vulcano. La mia squadra di Roccia è più dura del peperino!'],
        dialogoSconfitta: 'Il filone era più sottile del previsto.',
        dialogoDopo: ['L\'Aggron di Rocco è massiccio. Preparati.'] },
      { id: 'greg-rocca-5', classe: 'Arrampicatrice', nome: 'Mirta',
        squadra: [{ id: 28, livello: 37 }, { id: 111, livello: 38 }],
        premioSoldi: 780,
        dialogoIntro: ['Scalo senza corda ogni mattina. I miei Pokémon hanno l\'agilità della roccia!'],
        dialogoSconfitta: 'Mi sono calata troppo in basso.',
        dialogoDopo: ['Brava arrampicata! Rocco ti vede già.'] },
      { id: 'greg-rocca-6', classe: 'Guida', nome: 'Arnaldo',
        squadra: [{ id: 75, livello: 38 }, { id: 304, livello: 38 }],
        premioSoldi: 800,
        dialogoIntro: ['Porto i turisti sul Monte Cavo. Ma gli sfidanti della palestra li fermo io!'],
        dialogoSconfitta: 'Itinerario imprevisto.',
        dialogoDopo: ['La Via Sacra è bellissima. Se hai tempo, fai un giro.'] },
      { id: 'greg-rocca-7', classe: 'Vulcanologo', nome: 'Furio',
        squadra: [{ id: 75, livello: 38 }, { id: 112, livello: 39 }],
        premioSoldi: 820,
        dialogoIntro: ['Studio l\'attività vulcanica del Lazio. Eruzioni come queste non si vedono tutti i giorni!'],
        dialogoSconfitta: 'Eruzione inaspettata.',
        dialogoDopo: ['Rocco è avanti. Sei arrivato fin qui: ce la puoi fare.'] },
    ]
  },
  {
    id: 'albano',
    ordine: 6,
    comune: 'Albano Laziale',
    luogo: 'Piazza Mazzini',
    lat: 41.7310, lon: 12.6560,
    tipo: 'Lotta',
    levelCap: 46,
    descrizione: "L'eredità militare dei legionari romani di Albano vive nei Pokémon di tipo Lotta.",
    medaglia: 'Medaglia Legione',
    capopalestra: {
      nome: 'Massimo',
      premioSoldi: 4600,
      squadra: [
        { id: 107, livello: 42 },  // Hitmonchan (BST 455)
        { id: 106, livello: 43 },  // Hitmonlee (BST 455)
        { id: 286, livello: 44 },  // Breloom (BST 460)
        { id: 297, livello: 44 },  // Hariyama (BST 474)
        { id: 308, livello: 45 },  // Medicham (BST 410)
        { id: 68,  livello: 46 },  // Machamp (l'asso, BST 505)
      ],
      dialogoIntro: [
        'ALT! Chi entra nei Castra Albana deve dimostrare il proprio valore!',
        'Sono Massimo: qui ad Albano si allenava la Seconda Legione Partica, e la mia palestra ne custodisce lo spirito.',
        'Niente trucchi, niente scuse: solo forza, tecnica e disciplina. AVE!'
      ],
      dialogoSconfitta: 'Per Giove! Combatti come un vero legionario. La Medaglia Legione è tua, ad maiora!'
    },
    gregari: [
      { id: 'greg-albano-1', classe: 'Legionario', nome: 'Decio',
        squadra: [{ id: 56, livello: 40 }, { id: 66, livello: 41 }],
        premioSoldi: 900,
        dialogoIntro: ['AVE! Primo ostacolo: il legionario Decio. Nessuno passa senza combattere!'],
        dialogoSconfitta: 'Ritirata tattica.',
        dialogoDopo: ['Hai il ritmo del legionario. Avanza!'] },
      { id: 'greg-albano-2', classe: 'Gladiatrice', nome: 'Fulva',
        squadra: [{ id: 107, livello: 41 }, { id: 296, livello: 41 }],
        premioSoldi: 920,
        dialogoIntro: ['Nell\'arena non si danno sconti. Manco qui!'],
        dialogoSconfitta: 'Pollice verso. Hai vinto.',
        dialogoDopo: ['I Castra Albana non perdonano i deboli.'] },
      { id: 'greg-albano-3', classe: 'Centurione', nome: 'Marco',
        squadra: [{ id: 66, livello: 42 }, { id: 307, livello: 42 }],
        premioSoldi: 940,
        dialogoIntro: ['Comando la terza coorte di questa palestra. A me si risponde con la forza!'],
        dialogoSconfitta: 'La coorte si ritira.',
        dialogoDopo: ['Avanti verso il tribuno. Il peggio deve ancora venire.'] },
      { id: 'greg-albano-4', classe: 'Veterana', nome: 'Cesira',
        squadra: [{ id: 106, livello: 43 }, { id: 296, livello: 43 }],
        premioSoldi: 960,
        dialogoIntro: ['Vent\'anni di servizio nei Castra Albana. Sfida ogni legionario che trova!'],
        dialogoSconfitta: 'Rispetto per il vincitore.',
        dialogoDopo: ['Massimo ha sei Pokémon. Sii pronto a tutto.'] },
      { id: 'greg-albano-5', classe: 'Campione', nome: 'Tertio',
        squadra: [{ id: 67, livello: 43 }, { id: 308, livello: 43 }],
        premioSoldi: 960,
        dialogoIntro: ['Sono il campione dei giochi gladiatori di Albano. Preparati a difenderti!'],
        dialogoSconfitta: 'Sconfitta onorevole.',
        dialogoDopo: ['I tuoi Pokémon combattono con onore. Vai avanti.'] },
      { id: 'greg-albano-6', classe: 'Tribuno', nome: 'Vibio',
        squadra: [{ id: 57, livello: 44 }, { id: 107, livello: 44 }],
        premioSoldi: 980,
        dialogoIntro: ['Come tribuno mi spetta l\'ultima parola prima del Capopalestra. Dimostrami di valere!'],
        dialogoSconfitta: 'Parola data: passi.',
        dialogoDopo: ['Massimo è avanti. AVE!'] },
      { id: 'greg-albano-7', classe: 'Optio', nome: 'Lucio',
        squadra: [{ id: 106, livello: 44 }, { id: 307, livello: 45 }],
        premioSoldi: 1000,
        dialogoIntro: ['L\'optio è il braccio destro del centurione. Io sono il braccio destro di Massimo!'],
        dialogoSconfitta: 'Il braccio ha ceduto.',
        dialogoDopo: ['Il Machamp di Massimo ha quattro braccia. Quattro!'] },
      { id: 'greg-albano-8', classe: 'Pretoriano', nome: 'Pio',
        squadra: [{ id: 67, livello: 45 }, { id: 68, livello: 45 }],
        premioSoldi: 1020,
        dialogoIntro: ['Proteggo il Capopalestra. Nessuno entra senza battere me. NESSUNO!'],
        dialogoSconfitta: 'La guardia è caduta.',
        dialogoDopo: ['Sei l\'unico che mi ha battuto quest\'anno. Massimo ti aspetta. AVE!'] },
    ]
  },
  {
    id: 'ariccia',
    ordine: 7,
    comune: 'Ariccia',
    luogo: 'Piazza di Corte',
    lat: 41.7212, lon: 12.6720,
    tipo: 'Buio',
    levelCap: 52,
    descrizione: 'Tra le fraschette di notte e il viadotto misterioso, dominano i Pokémon di tipo Buio.',
    medaglia: 'Medaglia Fraschetta',
    capopalestra: {
      nome: 'Ombretta',
      premioSoldi: 5200,
      squadra: [
        { id: 262, livello: 48 },  // Mightyena (BST 420)
        { id: 319, livello: 49 },  // Sharpedo (BST 460)
        { id: 275, livello: 50 },  // Shiftry (BST 480)
        { id: 342, livello: 50 },  // Crawdaunt (BST 468)
        { id: 359, livello: 51 },  // Absol (BST 465)
        { id: 229, livello: 52 },  // Houndoom (l'asso, BST 500)
      ],
      dialogoIntro: [
        'Shhh… benvenuto ad Ariccia, dove la notte è padrona.',
        'Sono Ombretta. Quando le fraschette si svuotano e il ponte resta solo, i miei Pokémon Buio escono a giocare.',
        'Porchetta e vino li lascio agli altri: io mi nutro delle paure degli sfidanti. Fammi vedere le tue!'
      ],
      dialogoSconfitta: 'Hai acceso una luce nel mio buio… La Medaglia Fraschetta è tua. Ora brindiamo, va\'!'
    },
    gregari: [
      { id: 'greg-ariccia-1', classe: 'Oste notturno', nome: 'Tonino',
        squadra: [{ id: 261, livello: 46 }, { id: 198, livello: 47 }],
        premioSoldi: 1100,
        dialogoIntro: ['La fraschetta di notte è un altro mondo. I miei Pokémon Buio si sentono a casa!'],
        dialogoSconfitta: 'Luci accese per te, stanotte.',
        dialogoDopo: ['Ombretta ti aspetta al buio. Portati una torcia... no, anzi, non farlo.'] },
      { id: 'greg-ariccia-2', classe: 'Porchettaro', nome: 'Sergio',
        squadra: [{ id: 262, livello: 47 }, { id: 228, livello: 47 }],
        premioSoldi: 1120,
        dialogoIntro: ['Porchetta e Pokémon Buio: la mia vita. E ora te li metto in campo entrambi!'],
        dialogoSconfitta: 'Porchetta amara, stavolta.',
        dialogoDopo: ['Il Houndoom di Ombretta ama il fumo della porchetta. Occhio.'] },
      { id: 'greg-ariccia-3', classe: 'Ombra', nome: 'Nera',
        squadra: [{ id: 302, livello: 48 }, { id: 215, livello: 48 }],
        premioSoldi: 1140,
        dialogoIntro: ['Sono l\'ombra che si muove senza fare rumore. E i miei Pokémon pure!'],
        dialogoSconfitta: 'L\'ombra svanisce.',
        dialogoDopo: ['Di notte sul ponte le ombre si muovono davvero. Non fare il coraggioso.'] },
      { id: 'greg-ariccia-4', classe: 'Fantasma', nome: 'Fantasio',
        squadra: [{ id: 261, livello: 48 }, { id: 359, livello: 49 }],
        premioSoldi: 1160,
        dialogoIntro: ['Vengo dal passato di questo ponte. E il mio Absol porta notizie oscure!'],
        dialogoSconfitta: 'Sparisco nella nebbia.',
        dialogoDopo: ['L\'Absol porta sfortuna? No, porta notizie. Ascoltalo.'] },
      { id: 'greg-ariccia-5', classe: 'Vedetta del ponte', nome: 'Carla',
        squadra: [{ id: 262, livello: 49 }, { id: 228, livello: 49 }],
        premioSoldi: 1180,
        dialogoIntro: ['Guardo il ponte giorno e notte. Di notte ci sono cose che è meglio non vedere… e tu sei una di quelle!'],
        dialogoSconfitta: 'Non lo vedo più arrivare nessuno.',
        dialogoDopo: ['Il ponte di notte è spettacolare. E inquietante.'] },
      { id: 'greg-ariccia-6', classe: 'Noctambulo', nome: 'Orfeo',
        squadra: [{ id: 198, livello: 49 }, { id: 229, livello: 50 }],
        premioSoldi: 1180,
        dialogoIntro: ['Vivo di notte. I miei Pokémon Buio sbocciano sotto la luna!'],
        dialogoSconfitta: 'Il sole sorge anche per me.',
        dialogoDopo: ['Houndoom e la luna piena: bello e terribile.'] },
      { id: 'greg-ariccia-7', classe: 'Spettro', nome: 'Omberto',
        squadra: [{ id: 302, livello: 50 }, { id: 262, livello: 50 }],
        premioSoldi: 1200,
        dialogoIntro: ['Non mi vedi finché non voglio. E quando voglio, è troppo tardi!'],
        dialogoSconfitta: 'Mi hai visto davvero.',
        dialogoDopo: ['Ombretta si nasconde tra le ombre. Avanza piano.'] },
      { id: 'greg-ariccia-8', classe: 'Ombra', nome: 'Marina',
        squadra: [{ id: 319, livello: 50 }, { id: 228, livello: 51 }],
        premioSoldi: 1210,
        dialogoIntro: ['I Pokémon Buio che allevo sono affilati come lame. Provami!'],
        dialogoSconfitta: 'La lama si è spuntata.',
        dialogoDopo: ['Sei quasi arrivato. Ombretta è li.'] },
      { id: 'greg-ariccia-9', classe: 'Notturno', nome: 'Giorgione',
        squadra: [{ id: 229, livello: 51 }, { id: 359, livello: 51 }],
        premioSoldi: 1220,
        dialogoIntro: ['Ultimo ostacolo prima di Ombretta. Supera me se ne sei capace!'],
        dialogoSconfitta: 'La notte ti appartiene.',
        dialogoDopo: ['Ombretta dietro quella porta. In bocca al lupo nel buio.'] },
    ]
  },
  {
    id: 'genzano',
    ordine: 8,
    comune: 'Genzano di Roma',
    luogo: 'Centro storico (Infiorata)',
    lat: 41.7068, lon: 12.6898,
    tipo: 'Folletto',
    levelCap: 58,
    descrizione: "Sulla via dell'Infiorata, i petali nascondono Pokémon di tipo Folletto.",
    medaglia: 'Medaglia Infiorata',
    capopalestra: {
      nome: 'Flora',
      premioSoldi: 5800,
      squadra: [
        { id: 40,  livello: 54 },  // Wigglytuff (BST 435)
        { id: 122, livello: 55 },  // Mr. Mime (BST 460)
        { id: 210, livello: 55 },  // Granbull (BST 450)
        { id: 36,  livello: 56 },  // Clefable (BST 483)
        { id: 184, livello: 57 },  // Azumarill (BST 420)
        { id: 282, livello: 58 },  // Gardevoir (l'asso, BST 518)
      ],
      dialogoIntro: [
        'Benvenuto a Genzano, dove ogni giugno la via si copre di petali per l\'Infiorata!',
        'Sono Flora, l\'ultima Capopalestra dei Castelli. I miei Folletto sembrano delicati come fiori…',
        '…ma sotto i petali ci sono le spine! Sei l\'ultimo quadro della mia Infiorata: vediamo di che colori sei fatto!'
      ],
      dialogoSconfitta: 'Splendido… un capolavoro degno dell\'Infiorata! La Medaglia Infiorata è tua: ora la Via Vittoria e la Lega di Colonna ti aspettano!'
    },
    gregari: [
      { id: 'greg-genz-1', classe: 'Fioraio', nome: 'Petalino',
        squadra: [{ id: 35, livello: 52 }, { id: 39, livello: 53 }],
        premioSoldi: 1300,
        dialogoIntro: ['I fiori parlano a chi sa ascoltare. E i miei Pokémon Folletto parlano con i pugni!'],
        dialogoSconfitta: 'Un petalo caduto.',
        dialogoDopo: ['Flora ama i fiori più dei Pokémon. Quasi.'] },
      { id: 'greg-genz-2', classe: 'Artista', nome: 'Fiamma',
        squadra: [{ id: 209, livello: 53 }, { id: 175, livello: 54 }],
        premioSoldi: 1320,
        dialogoIntro: ['Dipingo per l\'Infiorata ogni anno. E i miei Pokémon sono il mio capolavoro vivente!'],
        dialogoSconfitta: 'Un quadro incompiuto.',
        dialogoDopo: ['I Pokémon Folletto sembrano fatti di petali. Occhio: mordono.'] },
      { id: 'greg-genz-3', classe: 'Giardiniera', nome: 'Rosa',
        squadra: [{ id: 35, livello: 54 }, { id: 210, livello: 54 }],
        premioSoldi: 1340,
        dialogoIntro: ['Ho piantato ogni fiore di questa palestra. E allevo i Pokémon Folletto come li coltivo: con pazienza!'],
        dialogoSconfitta: 'Il gelo ha preso il giardino.',
        dialogoDopo: ['Granbull sembra cattivo. Invece è dolcissimo. Quasi.'] },
      { id: 'greg-genz-4', classe: 'Pittrice dei fiori', nome: 'Elisa',
        squadra: [{ id: 176, livello: 54 }, { id: 35, livello: 55 }],
        premioSoldi: 1360,
        dialogoIntro: ['Ogni Infiorata è un capolavoro effimero. Come questa lotta: la perderai in un attimo!'],
        dialogoSconfitta: 'Il capolavoro è tuo.',
        dialogoDopo: ['Togetic vola sempre in cerchio qui dentro. È di buon auspicio.'] },
      { id: 'greg-genz-5', classe: 'Infioritrice', nome: 'Elena',
        squadra: [{ id: 280, livello: 55 }, { id: 209, livello: 55 }],
        premioSoldi: 1380,
        dialogoIntro: ['Conosco ogni tecnica dell\'Infiorata. E dei Pokémon Folletto pure!'],
        dialogoSconfitta: 'I petali si disperdono.',
        dialogoDopo: ['Ralts è delicata ma evolve in Gardevoir. Tienila d\'occhio.'] },
      { id: 'greg-genz-6', classe: 'Folletto domestico', nome: 'Dino',
        squadra: [{ id: 281, livello: 55 }, { id: 36, livello: 56 }],
        premioSoldi: 1380,
        dialogoIntro: ['Tengo in ordine questa palestra. E tengo in ordine anche i rivali scomodi!'],
        dialogoSconfitta: 'Disordine.',
        dialogoDopo: ['Kirlia danza. Sembrano mosse di danza ma fanno male.'] },
      { id: 'greg-genz-7', classe: 'Fatina', nome: 'Titania',
        squadra: [{ id: 183, livello: 56 }, { id: 210, livello: 56 }],
        premioSoldi: 1400,
        dialogoIntro: ['I miei Pokémon Folletto sono benedetti dalle fate dell\'Infiorata. Non hai scampo!'],
        dialogoSconfitta: 'La magia si è infranta.',
        dialogoDopo: ['Azumarill è Acqua e Folletto. Doppio pericolo.'] },
      { id: 'greg-genz-8', classe: 'Mago degli Elfi', nome: 'Mirko',
        squadra: [{ id: 176, livello: 56 }, { id: 281, livello: 57 }],
        premioSoldi: 1420,
        dialogoIntro: ['Conosco la magia antica dei Folletto. La imparo dai vecchi libri dell\'Infiorata!'],
        dialogoSconfitta: 'L\'incantesimo si è rotto.',
        dialogoDopo: ['Kirlia è quasi pronta per evolvere in Gardevoir. È terrificante.'] },
      { id: 'greg-genz-9', classe: 'Cantastorie', nome: 'Orazio',
        squadra: [{ id: 122, livello: 57 }, { id: 36, livello: 57 }],
        premioSoldi: 1440,
        dialogoIntro: ['Racconto le leggende dell\'Infiorata ai bambini. Ma stasera racconto la tua sconfitta!'],
        dialogoSconfitta: 'Questa storia non me la aspettavo.',
        dialogoDopo: ['Mr. Mime e Clefable: la coppia più strana e più forte. Poi c\'è Flora.'] },
      { id: 'greg-genz-10', classe: 'Gran Maga', nome: 'Ninfa',
        squadra: [{ id: 282, livello: 57 }, { id: 40, livello: 57 }],
        premioSoldi: 1460,
        dialogoIntro: ['Sono la custode dei segreti dell\'Infiorata. L\'ultima porta prima di Flora: aprila solo se sei pronto!'],
        dialogoSconfitta: 'Il segreto è tuo ora.',
        dialogoDopo: ['Flora ti aspetta. Ha Gardevoir come asso. Vai. Sei pronto.'] },
    ]
  },
];

/* ----------------------------------------------------------
   RIVINCITE DEL RIVALE (F8) — Remo intercetta il giocatore
   davanti ad alcune palestre. 'starter1'/'starter2' = prima/
   seconda evoluzione del suo starter (id base +1 / +2).
   ---------------------------------------------------------- */
const RIVALE_TAPPE = [
  {
    flag: 'remoRivincita1',
    primaDiOrdine: 3, // davanti alla palestra di Marino (cap 28)
    premioSoldi: 2800,
    squadra: [
      { id: 17,  livello: 25 },         // Pidgeotto (BST 349)
      { id: 262, livello: 26 },         // Mightyena (BST 420)
      { id: 64,  livello: 26 },         // Kadabra (BST 400)
      { id: 'starter1', livello: 28 },  // starter evoluto (l'asso, al cap!)
    ],
    dialogoIntro: [
      'Ehi ehi, guarda chi si rivede! Ti stavo aspettando davanti alla fontana!',
      'Mentre tu giocavi col Pokédex, io ho messo insieme una VERA squadra. E il mio starter si è già evoluto!',
      'Vediamo se da quella lotta nel laboratorio sei migliorato… ne dubito!'
    ],
    dialogoSconfittaRemo: 'Ma daiii! Di nuovo?!',
    dialogoDopoVittoria: [
      'Uffa! Sei migliorato sul serio…',
      'Vabbè, la palestra di Marino te la lascio. Ma a sud ci rivedremo, promesso!'
    ],
    dialogoDopoSconfitta: [
      'Ahah! Visto? Io mi alleno mica per finta!',
      'Cura i tuoi Pokémon e riprova, va\'. Ti aspetto qui!'
    ]
  },
  {
    flag: 'remoRivincita2',
    primaDiOrdine: 6, // davanti alla palestra di Albano (cap 46)
    premioSoldi: 4600,
    squadra: [
      { id: 18,  livello: 43 },         // Pidgeot (BST 479)
      { id: 65,  livello: 43 },         // Alakazam (BST 500)
      { id: 262, livello: 44 },         // Mightyena
      { id: 330, livello: 44 },         // Flygon (BST 520)
      { id: 'starter2', livello: 46 },  // starter forma finale (l'asso, al cap!)
    ],
    dialogoIntro: [
      'Fermo lì! Pensavi di sfidare la Legione senza prima passare su di me?',
      'Cinque Pokémon, tutti allenati duramente. E il mio starter ha raggiunto la FORMA FINALE.',
      'Stavolta non hai speranze!'
    ],
    dialogoSconfittaRemo: 'Impossibile! Ero più forte!',
    dialogoDopoVittoria: [
      'Ok, ok… lo ammetto: sei più forte di me. Per ORA.',
      'Vai pure da Massimo. Ma non rilassarti: prima di Genzano mi ritroverai!'
    ],
    dialogoDopoSconfitta: [
      'Te l\'avevo detto! La forma finale non perdona!',
      'Riposati al Centro Pokémon e riprova quando sei pronto.'
    ]
  },
  {
    flag: 'remoRivincita3',
    primaDiOrdine: 8, // davanti alla palestra di Genzano (cap 58)
    premioSoldi: 5800,
    squadra: [
      { id: 18,  livello: 54 },         // Pidgeot
      { id: 65,  livello: 55 },         // Alakazam
      { id: 359, livello: 55 },         // Absol (BST 465)
      { id: 330, livello: 56 },         // Flygon
      { id: 143, livello: 56 },         // Snorlax (BST 540)
      { id: 'starter2', livello: 58 },  // starter forma finale (l'asso, al cap!)
    ],
    dialogoIntro: [
      'Eccoci all\'ultima palestra… e all\'ultima occasione per fermarti!',
      'Squadra completa, sei contro sei. Ho allenato ogni singolo Pokémon pensando a questo momento.',
      'Se vuoi l\'Infiorata di Flora, dovrai passare sul mio Snorlax!'
    ],
    dialogoSconfittaRemo: 'No… NO! La mia squadra perfetta!',
    dialogoDopoVittoria: [
      'Sei contro sei, e hai vinto lo stesso…',
      'Va bene, hai vinto TU il diritto di arrivare primo alla Lega. Ma io sarò lì ad aspettarti, a Colonna. È una promessa!'
    ],
    dialogoDopoSconfitta: [
      'SÌ! Questa è la squadra che porterò alla Lega!',
      'Curati e riprova pure… tanto il risultato non cambia!'
    ]
  },
];

/* ----------------------------------------------------------
   CENTRI POKÉMON — uno per comune, vicino al centro storico.
   Avvicinandosi (entro RAGGIO_CURA metri) si può curare
   gratuitamente la squadra cliccando il marker sulla mappa.
   ---------------------------------------------------------- */
const RAGGIO_CURA = 150; // distanza massima in metri per usare il Centro

const CENTRI_POKEMON = [
  { id: 'cp-borgata',       comune: 'Borgata Tuscolana',   lat: 41.8423, lon: 12.6158 }, // necessario per tutorial "Dormi"
  { id: 'cp-frascati',      comune: 'Frascati',            lat: 41.8066, lon: 12.6818 },
  { id: 'cp-grottaferrata', comune: 'Grottaferrata',       lat: 41.7873, lon: 12.6692 },
  { id: 'cp-marino',        comune: 'Marino',              lat: 41.7700, lon: 12.6645 },
  { id: 'cp-monte-porzio',  comune: 'Monte Porzio Catone', lat: 41.8150, lon: 12.7170 },
  { id: 'cp-rocca-di-papa', comune: 'Rocca di Papa',       lat: 41.7620, lon: 12.7110 },
  { id: 'cp-albano',        comune: 'Albano Laziale',      lat: 41.7295, lon: 12.6580 },
  { id: 'cp-ariccia',       comune: 'Ariccia',             lat: 41.7200, lon: 12.6738 },
  { id: 'cp-genzano',       comune: 'Genzano di Roma',     lat: 41.7080, lon: 12.6912 },
  { id: 'cp-castel-gandolfo', comune: 'Castel Gandolfo',   lat: 41.7476, lon: 12.6500 },
  { id: 'cp-nemi',          comune: 'Nemi',                lat: 41.7203, lon: 12.7186 },
  { id: 'cp-colonna',       comune: 'Colonna',             lat: 41.8337, lon: 12.7532 },
];

/* ----------------------------------------------------------
   ABITANTI DELLE CITTÀ (F9) — un marker 💬 per comune.
   Parlandoci esce una battuta a caso tra quelle del paese
   (colore locale + mezzi indizi). Testi da docs/DIALOGHI-NPC.md.
   ---------------------------------------------------------- */
const ABITANTI = [
  { id: 'ab-borgata', comune: 'Borgata Tuscolana', lat: 41.8415, lon: 12.6140, battute: [
    { nome: 'Sora Pina', testo: "A regà, ma 'ndo vai co' quel bestione? Ai miei tempi se usciva co' 'na fionda e bastava!" },
    { nome: 'Ragazzino', testo: "Mio cugino dice che il suo Rattata è il più forte de tutto er quartiere. Secondo me dice fregnacce." },
    { nome: 'Pensionato', testo: "Una volta qui era tutta campagna. Mo' è tutto un Pidgey che te ruba la merenda." },
    { nome: 'Tizio del GRA', testo: "Esci dar raccordo? Prima volta? In bocca ar lupo… ai Castelli mangiano li romani. (ride da solo)" },
    { nome: 'Signora con la borsa', testo: "Se vai dal Professore digli che me deve ancora ridà la teglia. Trent'anni che aspetto." },
  ]},
  { id: 'ab-frascati', comune: 'Frascati', lat: 41.8030, lon: 12.6785, battute: [
    { nome: 'Settimio il cantiniere', testo: "Sai qual è il segreto del Frascati DOC? L'uva. E un Oddish che tiene lontane le lumache. Genio mio." },
    { nome: 'Turista perso', testo: "Scusa, la Villa Aldobrandini? Cammino da un'ora e trovo solo Pidgey che ridono." },
    { nome: 'Oste', testo: "Qui se beve bene e se lotta meglio. Vinicio? Quello te frega co' le piante, attento." },
    { nome: "Ragazza con l'ombrellino", testo: "Dicono che di notte, alle fontane di Villa Aldobrandini, si vede 'na cosa rosa che svolazza. Sarà er vino, mah." },
    { nome: 'Vecchietto', testo: "Ai miei tempi se lottava co' le bocce, mica coi Pokémon. E se vinceva pure." },
  ]},
  { id: 'ab-grottaferrata', comune: 'Grottaferrata', lat: 41.7852, lon: 12.6658, battute: [
    { nome: 'Cesare il fornaio', testo: "Pizza bianca appena sfornata! Manco il tuo Pokémon resiste all'odore. Anvedi come drizza le orecchie." },
    { nome: "Fra' Bartolo", testo: "Pace a te, viandante. E pure al tuo… come si chiama? Ah, un Pokémon. Bene, anche lui è creatura." },
    { nome: 'Anselmo il rigattiere', testo: "Roba usata, roba bona! C'ho pure 'na Poké Ball mezza ammaccata, te la do a metà prezzo." },
    { nome: 'Studentessa', testo: "Studio l'abbazia da tre mesi. I monaci coi Pokémon Psico so' più tranquilli de me prima de 'n esame." },
    { nome: 'Tizio col cane', testo: "No, 'sto qua è un cane normale eh. Non tutto quello che cammina è un Pokémon, oh." },
  ]},
  { id: 'ab-marino', comune: 'Marino', lat: 41.7692, lon: 12.6635, battute: [
    { nome: 'Nello il vignarolo', testo: "Alla Sagra dell'Uva dalla fontana esce VINO. Giuro! L'anno scorso un Magikarp c'è cascato dentro e è uscito allegro." },
    { nome: 'Pina della Sagra', testo: "Te la prepari la cesta pe' la Sagra? Porta un Pokémon Acqua, che se la fontana s'intasa serve." },
    { nome: 'Bambino bagnato', testo: "So' caduto nella fontana. Moro ha riso. Pure il suo Gyarados ha riso." },
    { nome: 'Pescatore annoiato', testo: "Pesco da stamattina. Solo Magikarp. Sempre Magikarp. UN Magikarp lo vòi?" },
    { nome: 'Signora', testo: "Marino è la città del vino. E del traffico. Soprattutto del traffico." },
  ]},
  { id: 'ab-monte-porzio', comune: 'Monte Porzio Catone', lat: 41.8158, lon: 12.7143, battute: [
    { nome: 'Ruggero il meteorologo', testo: "Tra qualche giorno piove. E quando piove qui, sull'osservatorio, i fulmini fanno cose strane. Tiè, segnatelo." },
    { nome: "Aldo l'astrofilo", testo: "La notte, nei giorni dispari, col telescopio si vedono cose… Una volta ho visto 'na stella che s'è mossa. O era 'n moscerino." },
    { nome: 'Studente di astronomia', testo: "Stella è la Capopalestra più sveglia dei Castelli. Letteralmente: non dorme mai, guarda le stelle." },
    { nome: 'Vecchietto col cappello', testo: "Lassù all'osservatorio fanno la scienza. Io guardo le stelle dalla finestra e mi basta." },
    { nome: 'Ragazza', testo: "C'ho un Magnemite che si attacca alla calamita del frigo. Comodo, ma poi non se stacca più." },
  ]},
  { id: 'ab-rocca-di-papa', comune: 'Rocca di Papa', lat: 41.7614, lon: 12.7086, battute: [
    { nome: 'Bruno la guida', testo: "La Via Sacra la fecero i romani, basolo su basolo. Quassù i Pokémon Roccia so' duri come 'sti sassi." },
    { nome: 'Anziano del Carpino', testo: "Maschio delle Faete, Monte Cavo… i due giganti. Da ragazzo ci salivo a piedi. Mo' ce mando il Pokémon." },
    { nome: 'Signora col cane', testo: "Il mio Growlithe non vole più camminà in salita. Pure lui s'è romanizzato." },
    { nome: 'Ragazzino', testo: "Ho sentito un BOOM sotto terra ieri notte. Papà dice è il vulcano. Mamma dice è papà dopo i fagioli." },
  ]},
  { id: 'ab-albano', comune: 'Albano Laziale', lat: 41.7318, lon: 12.6570, battute: [
    { nome: 'Settimio il legionario', testo: "AVE! Qui stanziava la Seconda Legione Partica. Massimo tiene viva la disciplina. E mena pure forte." },
    { nome: 'Storico', testo: "I Castra Albana, l'accampamento, le terme di Cellomaio… Albano è Roma in piccolo. Coi Pokémon in più." },
    { nome: 'Bambino con la spada di legno', testo: "Da grande faccio il Capopalestra de Lotta come Massimo! Intanto meno mi' sorella. Per allenarmi." },
    { nome: 'Tizio sospettoso', testo: "Hai visto pure tu quelli vestiti di grigioverde gironzolà vicino al lago? Non me piaceno per niente." },
  ]},
  { id: 'ab-ariccia', comune: 'Ariccia', lat: 41.7218, lon: 12.6710, battute: [
    { nome: 'Sora Nunzia della fraschetta', testo: "Porchetta e vino, fijo! Mangia, che pure il tuo Pokémon c'ha 'na faccia smunta. Tiè, 'na fetta pure a lui." },
    { nome: 'Peppe er porchettaro', testo: "Porchetta de Ariccia IGP, mica pizza e fichi! L'aroma fa svenì pure gli Houndoom de Ombretta." },
    { nome: 'Il vecchio del ponte', testo: "Di giorno è solo un ponte. Di notte… guarda mejo le ombre. A volte te guardano indietro." },
    { nome: 'Musicista', testo: "Suono nelle fraschette. Di notte qui i Pokémon Buio escono a sentì la musica. Pubblico strano, ma applaude." },
    { nome: 'Turista', testo: "Sono venuto pe' la porchetta. So' rimasto pe' la porchetta. Domani? Ancora porchetta." },
  ]},
  { id: 'ab-genzano', comune: 'Genzano di Roma', lat: 41.7074, lon: 12.6888, battute: [
    { nome: 'Romolo il panettiere', testo: "Pane de Genzano IGP, fijo! Crosta che canta. Ce reggi sopra pure un Snorlax e non se rompe." },
    { nome: "Iolanda dell'Infiorata", testo: "Ogni giugno copriamo la via di petali. Un anno feci un Gyarados tutto de fiori. Venne 'na meraviglia." },
    { nome: 'Bambina', testo: "Flora è bravissima coi fiori. Ma se la fai arrabbià, i suoi Folletto te le sòneno. Delicati de fuori, cattivelli de dentro." },
    { nome: 'Fioraio', testo: "Petali a tonnellate per l'Infiorata. E un Bellsprout che me li sceglie pe' colore. Dipendente modello." },
    { nome: 'Vecchietto', testo: "Dopo Genzano c'è la Via Vittoria. Robba seria. Curate bene, e non te fa' fregà dal panorama." },
  ]},
  { id: 'ab-castel-gandolfo', comune: 'Castel Gandolfo', lat: 41.7476, lon: 12.6500, battute: [
    { nome: 'Guardia', testo: "La residenza è zona riservata. No, non puoi entrà. No, nemmeno col Pokédex." },
    { nome: 'Tonino il barcaiolo', testo: "Giro sul lago? Co' 'sto Surf che ce vòi a remà. Dicono che giù in fondo dorme qualcosa de grosso… io non scendo." },
    { nome: 'Signora buffa', testo: "Il Papa c'ha un Pokémon? Dicono de sì. Dicono che è un… Slowpoke. Ce sta tutto, no?" },
  ]},
  { id: 'ab-nemi', comune: 'Nemi', lat: 41.7200, lon: 12.7180, battute: [
    { nome: 'Rosa la fragolara', testo: "Fragoline de Nemi, le più piccole e le più bone! Una pe' te, una pe' me, una… ndo' è finita? L'ha presa er Pokémon." },
    { nome: 'Custode del Museo delle Navi', testo: "Qui c'erano le navi di Caligola. E dicono… altre cose, custodite. Roba antica. Roba che è mejo non svejà." },
    { nome: 'Pescatore', testo: "Lo specchio de Diana, lo chiamano. La notte è tutta un'altra storia. C'è chi giura d'aver visto correre 'na cosa sull'acqua." },
  ]},
  { id: 'ab-colonna', comune: 'Colonna', lat: 41.8340, lon: 12.7540, battute: [
    { nome: 'Anziano', testo: "Qui c'è la Lega. Solo i mejo ce arrivano. Tu… mah, vedremo." },
    { nome: 'Tizio davanti al Bunkerino', testo: "Quella cantina laggiù? Strana. Entra gente in camice, esce gente che non parla. Io me faccio li fatti mia." },
    { nome: 'Ragazzo', testo: "Hai battuto tutte e otto le palestre? E mo' viene il difficile. In bocca ar lupo, campione." },
  ]},
];

/* ----------------------------------------------------------
   DONATORI DELLE MN (F9) — NPC che regalano le MN.
   Si sbloccano con un numero minimo di Medaglie.
   mn: chiave in stato.mn ('taglio' | 'surf' | 'volo').
   ---------------------------------------------------------- */
const DONATORI_MN = [
  {
    id: 'mn-taglio', mn: 'taglio', nomeMN: 'MN Taglio',
    nome: "Fra' Potatore", comune: 'Grottaferrata',
    lat: 41.7866, lon: 12.6678,
    medaglieMin: 2,
    dialogoPrima: [
      'Pace a te. Curo il giardino dell\'Abbazia da quarant\'anni.',
      'Ma la MN Taglio la affido solo a chi ha già dato prova: torna quando avrai almeno 2 Medaglie.'
    ],
    dialogoDono: [
      'Pace a te. So dove tagliare e dove no, dopo quarant\'anni tra questi ulivi.',
      'Vedo che le Medaglie non ti mancano: sei pronto. Tieni la MN TAGLIO!',
      'Con questa i tuoi Pokémon abbattono gli alberelli che sbarrano certi sentieri. Dietro l\'Abbazia se n\'è appena liberato uno…'
    ],
    dialogoDopo: ['Il boschetto dietro l\'Abbazia ora è libero. Che la potatura sia con te.']
  },
  {
    id: 'mn-surf', mn: 'surf', nomeMN: 'MN Surf',
    nome: 'Nonna Assunta', comune: 'Albano Laziale',
    lat: 41.7405, lon: 12.6505,
    medaglieMin: 5,
    dialogoPrima: [
      'Fijo, quella canna vale più de te. Ma prima fatti le ossa.',
      'Torna quando sei un allenatore vero, co\' almeno 5 Medaglie, e t\'imparo a nuotà.'
    ],
    dialogoDono: [
      'Bravo regazzino, m\'hai dato \'na mano! Come promesso, t\'imparo a nuotà coi Pokémon.',
      'Tieni la MN SURF!',
      'Mo\' puoi solcà il Lago Albano e il Lago di Nemi. Ma occhio a quello che dorme là sotto…'
    ],
    dialogoDopo: ['Vai a nuotà, fijo, che l\'acqua è bona! E saluta li pesci da parte mia.']
  },
  {
    id: 'mn-volo', mn: 'volo', nomeMN: 'MN Volo',
    nome: 'Faustino il funicolarista', comune: 'Rocca di Papa',
    lat: 41.7625, lon: 12.7100,
    medaglieMin: 6,
    dialogoPrima: [
      'La funicolare risale dar \'32! Ma in cima ce porto solo i campioni veri.',
      'Torna co\' almeno 6 Medaglie e te faccio vedè er mondo dall\'alto.'
    ],
    dialogoDono: [
      'Sei salito fin quassù? Bravo. Da Monte Cavo se vede tutto er Lazio.',
      'Da quassù i Pokémon imparano a guardà er mondo dall\'alto. Tieni la MN VOLO!',
      'Mo\' co\' un Pokémon che la sa usà voli in un lampo verso le città che hai già visitato. Usa il pulsante ✈️!'
    ],
    dialogoDopo: ['Vòi un altro giro in cima? Quando vòi. L\'aria fina fa bene ar Pokédex.']
  },
];

/* ----------------------------------------------------------
   ALLENATORI DI PERCORSO E DUNGEON (F9)
   Marker ⚔️ sulla mappa; si sfidano UNA VOLTA (poi danno solo una
   battuta). Squadre coerenti col livello della zona, premio in
   Pokéyen alla vittoria. Tutti gli ID ≤ 386.
   ---------------------------------------------------------- */
const ALLENATORI = [
  // ── Percorso Tuscolana (tutorial, Lv 4-7) ──
  {
    id: 'all-tusc-1', classe: 'Pivello', nome: 'Gino', zona: 'Percorso Tuscolana',
    lat: 41.8300, lon: 12.6420, premioSoldi: 300,
    squadra: [{ id: 19, livello: 5 }, { id: 16, livello: 5 }], // Rattata, Pidgey
    dialogoIntro: ['Ao! Primo giorno da allenatore pure per te? Vediamo chi ha studiato meglio!'],
    dialogoSconfitta: 'E vabbè, tanto stavo a giocà.',
    dialogoDopo: ['La prossima volta me alleno de più, giuro.']
  },
  {
    id: 'all-tusc-2', classe: 'Esploratrice', nome: 'Lia', zona: 'Percorso Tuscolana',
    lat: 41.8150, lon: 12.6600, premioSoldi: 360,
    squadra: [{ id: 161, livello: 6 }, { id: 16, livello: 6 }, { id: 19, livello: 7 }], // Sentret, Pidgey, Rattata
    dialogoIntro: ['Sto mappando la Via Tuscolana coi miei Pokémon. Tu mi sembri un buon ostacolo da studiare!'],
    dialogoSconfitta: 'Dati raccolti: sei più forte di me.',
    dialogoDopo: ['Verso Frascati la strada è in salita. In bocca al lupo!']
  },

  // ── Vigne di Frascati (Lv 6-9, Erba) ──
  {
    id: 'all-frasc-1', classe: 'Vendemmiatore', nome: 'Bacco', zona: 'Vigne di Frascati',
    lat: 41.8000, lon: 12.6940, premioSoldi: 480,
    squadra: [{ id: 43, livello: 7 }, { id: 69, livello: 8 }], // Oddish, Bellsprout
    dialogoIntro: ['Tra un filare e l\'altro alleno Pokémon Erba. Come il Frascati, prima t\'inganno e poi te frego!'],
    dialogoSconfitta: 'Annata storta, questa.',
    dialogoDopo: ['Assaggia un acino, va\', che te lo meriti.']
  },
  {
    id: 'all-frasc-2', classe: 'Contadina', nome: 'Rosa', zona: 'Vigne di Frascati',
    lat: 41.8045, lon: 12.6985, premioSoldi: 540,
    squadra: [{ id: 187, livello: 8 }, { id: 43, livello: 9 }], // Hoppip, Oddish
    dialogoIntro: ['I miei Pokémon crescono col sole dei Castelli. Forti e testardi, come me!'],
    dialogoSconfitta: 'Mannaggia ar trattore.',
    dialogoDopo: ['Le vigne le curo io, mica i turisti!']
  },

  // ── Boschi del Tuscolo (DUNGEON, Lv 8-12, coleottero/erba/rovine) ──
  {
    id: 'all-bosco-1', classe: 'Coleotterista', nome: 'Bruco', zona: 'Boschi del Tuscolo',
    lat: 41.7920, lon: 12.7350, premioSoldi: 540,
    squadra: [{ id: 10, livello: 8 }, { id: 11, livello: 9 }, { id: 14, livello: 9 }], // Caterpie, Metapod, Kakuna
    dialogoIntro: ['Shhh! Stavo osservando un Metapod. Ma una bella lotta non si rifiuta mai!'],
    dialogoSconfitta: 'I miei insetti hanno ancora da crescere.',
    dialogoDopo: ['Nel bosco i coleotteri si nascondono tra le foglie. Cercali!']
  },
  {
    id: 'all-bosco-2', classe: 'Scout', nome: 'Tito', zona: 'Boschi del Tuscolo',
    lat: 41.7900, lon: 12.7395, premioSoldi: 600,
    squadra: [{ id: 13, livello: 9 }, { id: 14, livello: 10 }, { id: 69, livello: 10 }], // Weedle, Kakuna, Bellsprout
    dialogoIntro: ['Conosco ogni sentiero di questo bosco. E ogni allenatore che ci passa lo sfido!'],
    dialogoSconfitta: 'Mi sono perso... nella tua strategia.',
    dialogoDopo: ['Le rovine del Tuscolo sono da quella parte. Roba antica.']
  },
  {
    id: 'all-bosco-3', classe: 'Archeologa', nome: 'Livia', zona: 'Boschi del Tuscolo',
    lat: 41.7945, lon: 12.7360, premioSoldi: 660,
    squadra: [{ id: 74, livello: 10 }, { id: 46, livello: 11 }], // Geodude, Paras
    dialogoIntro: ['Scavo tra i ruderi del Tuscolo. Sotto la terra dei Castelli c\'è di tutto… anche guai!'],
    dialogoSconfitta: 'Reperti intatti, orgoglio in frantumi.',
    dialogoDopo: ['Dicono che tra queste rovine appaia un Pokémon verde, ogni tanto…']
  },
  {
    id: 'all-bosco-4', classe: 'Eremita', nome: 'Silvio', zona: 'Boschi del Tuscolo',
    lat: 41.7905, lon: 12.7330, premioSoldi: 720,
    squadra: [{ id: 43, livello: 10 }, { id: 69, livello: 11 }, { id: 44, livello: 12 }], // Oddish, Bellsprout, Gloom
    dialogoIntro: ['Vivo nel bosco da anni. I miei Pokémon Erba sono la mia famiglia. Mostrami rispetto… in battaglia!'],
    dialogoSconfitta: 'La natura sceglie il più forte. Oggi sei tu.',
    dialogoDopo: ['Il silenzio del bosco insegna più di mille palestre.']
  },

  // ── Vigne di Marino (Lv 7-10) ──
  {
    id: 'all-marino-1', classe: 'Sommelier', nome: 'Otello', zona: 'Vigne di Marino',
    lat: 41.7560, lon: 12.6710, premioSoldi: 600,
    squadra: [{ id: 43, livello: 9 }, { id: 44, livello: 10 }], // Oddish, Gloom
    dialogoIntro: ['Riconosco un\'annata da un sorso e un allenatore da uno sguardo. Tu sei… ancora acerbo!'],
    dialogoSconfitta: 'Retrogusto amaro, questa sconfitta.',
    dialogoDopo: ['Alla Sagra dell\'Uva la fontana versa vino. Giuro!']
  },
  {
    id: 'all-marino-2', classe: 'Monello', nome: 'Ciccio', zona: 'Vigne di Marino',
    lat: 41.7588, lon: 12.6748, premioSoldi: 480,
    squadra: [{ id: 165, livello: 8 }, { id: 10, livello: 9 }], // Ledyba, Caterpie
    dialogoIntro: ['Ho trovato una coccinella gigante tra le viti! Te la faccio assaggià!'],
    dialogoSconfitta: 'Uffa, ho perso pure oggi.',
    dialogoDopo: ['Mamma dice che devo studià invece de lottà. Bah.']
  },

  // ── Boschetto Segreto (post-Taglio, Lv 12-15) ──
  {
    id: 'all-boschetto-1', classe: 'Boscaiolo', nome: 'Silvano', zona: 'Boschetto Segreto',
    lat: 41.7832, lon: 12.6758, premioSoldi: 840,
    squadra: [{ id: 44, livello: 13 }, { id: 70, livello: 13 }, { id: 114, livello: 14 }], // Gloom, Weepinbell, Tangela
    dialogoIntro: ['Sei riuscito a tagliare l\'alberello, eh? Allora sei degno di sfidarmi qui dentro!'],
    dialogoSconfitta: 'Hai la stoffa del taglialegna.',
    dialogoDopo: ['Pochi conoscono questo boschetto. Tienilo per te.']
  },

  // ── Grotta del Vulcano (DUNGEON, Lv 16-22, roccia/terra/fuoco) ──
  {
    id: 'all-grotta-1', classe: 'Speleologo', nome: 'Igor', zona: 'Grotta del Vulcano',
    lat: 41.7490, lon: 12.7150, premioSoldi: 1020,
    squadra: [{ id: 41, livello: 17 }, { id: 74, livello: 18 }, { id: 66, livello: 18 }], // Zubat, Geodude, Machop
    dialogoIntro: ['Esploro le viscere del Vulcano Laziale. Qui sotto fa caldo… e si lotta forte!'],
    dialogoSconfitta: 'Mi hai mandato al tappeto, nel buio.',
    dialogoDopo: ['Più giù dicono che dorma qualcosa di enorme. Non scendo da solo.']
  },
  {
    id: 'all-grotta-2', classe: 'Minatore', nome: 'Pino', zona: 'Grotta del Vulcano',
    lat: 41.7478, lon: 12.7128, premioSoldi: 1200,
    squadra: [{ id: 74, livello: 19 }, { id: 75, livello: 20 }, { id: 95, livello: 20 }], // Geodude, Graveler, Onix
    dialogoIntro: ['Picconata dopo picconata, i miei Pokémon Roccia sono diventati duri come il peperino!'],
    dialogoSconfitta: 'Hai sfondato la mia parete.',
    dialogoDopo: ['Occhio ai massi: certi si muovono da soli, quaggiù.']
  },
  {
    id: 'all-grotta-3', classe: 'Piromane', nome: 'Cenere', zona: 'Grotta del Vulcano',
    lat: 41.7502, lon: 12.7126, premioSoldi: 1200,
    squadra: [{ id: 218, livello: 19 }, { id: 322, livello: 20 }], // Slugma, Numel
    dialogoIntro: ['Il calore del vulcano è il mio elemento. I miei Pokémon di Fuoco ti inceneriranno!'],
    dialogoSconfitta: 'La mia fiamma… si è spenta.',
    dialogoDopo: ['Quel bagliore rosso in fondo alla grotta… meglio non avvicinarsi.']
  },

  // ── Monte Cavo (pre-Lega, Lv 40-44, roccia/volante/lotta) ──
  {
    id: 'all-cavo-1', classe: 'Alpinista', nome: 'Vetta', zona: 'Monte Cavo',
    lat: 41.7400, lon: 12.7050, premioSoldi: 2520,
    squadra: [{ id: 67, livello: 40 }, { id: 75, livello: 41 }, { id: 227, livello: 42 }], // Machoke, Graveler, Skarmory
    dialogoIntro: ['Sono salito fin quassù a piedi. Chi non regge l\'altura, non regge la mia squadra!'],
    dialogoSconfitta: 'In cima ci arrivi davvero. Complimenti.',
    dialogoDopo: ['Da quassù la Lega di Colonna sembra vicina. Ma è dura.']
  },
  {
    id: 'all-cavo-2', classe: 'Veterano', nome: 'Aquilio', zona: 'Monte Cavo',
    lat: 41.7555, lon: 12.7000, premioSoldi: 2640,
    squadra: [{ id: 22, livello: 42 }, { id: 76, livello: 43 }, { id: 112, livello: 44 }], // Fearow, Golem, Rhydon
    dialogoIntro: ['Ne ho viste di battaglie su queste cime. Tu sei solo l\'ultima. Fammi divertire!'],
    dialogoSconfitta: 'Una nuova generazione avanza. Bene così.',
    dialogoDopo: ['Allenati ancora: alla Via Vittoria non si fanno sconti.']
  },

  // ── Percorso Tuscolana — altri allenatori (auto-trigger entro 80 m) ──
  {
    id: 'all-tusc-3', classe: 'Scolaretto', nome: 'Memmo', zona: 'Percorso Tuscolana',
    lat: 41.8380, lon: 12.6330, premioSoldi: 360,
    squadra: [{ id: 261, livello: 5 }, { id: 263, livello: 6 }], // Poochyena, Zigzagoon
    dialogoIntro: ['Oggi la maestra non c\'è! Lotto con te invece de fa\' i compiti!'],
    dialogoSconfitta: 'Uffa, e mo\' che je dico a casa?',
    dialogoDopo: ['Dopo \'sta lotta i compiti me sembrano facili!']
  },
  {
    id: 'all-tusc-4', classe: 'Ciclista', nome: 'Dario', zona: 'Percorso Tuscolana',
    lat: 41.8120, lon: 12.6580, premioSoldi: 420,
    squadra: [{ id: 16, livello: 6 }, { id: 161, livello: 7 }, { id: 19, livello: 7 }], // Pidgey, Sentret, Rattata
    dialogoIntro: ['Scendo dalla Tuscolana a tutta velocità! Tieni il passo, se ci riesci!'],
    dialogoSconfitta: 'Frenata d\'emergenza. Hai vinto tu.',
    dialogoDopo: ['Sali a Frascati: la salita è dura ma il panorama vale.']
  },

  // ── Vigne di Frascati — altro allenatore ──
  {
    id: 'all-frasc-3', classe: 'Giardiniera', nome: 'Iride', zona: 'Vigne di Frascati',
    lat: 41.8035, lon: 12.6975, premioSoldi: 540,
    squadra: [{ id: 69, livello: 8 }, { id: 187, livello: 8 }, { id: 43, livello: 9 }], // Bellsprout, Hoppip, Oddish
    dialogoIntro: ['Curo i giardini di Villa Aldobrandini. I miei Pokémon Erba sono fioriti apposta per te!'],
    dialogoSconfitta: 'Hai colto la vittoria come un fiore.',
    dialogoDopo: ['Di notte, tra le fontane, dicono si veda qualcosa di rosa…']
  },

  // ── Vigne di Marino — altro allenatore ──
  {
    id: 'all-marino-3', classe: 'Allevatrice', nome: 'Lina', zona: 'Vigne di Marino',
    lat: 41.7565, lon: 12.6745, premioSoldi: 600,
    squadra: [{ id: 183, livello: 9 }, { id: 270, livello: 10 }], // Marill, Lotad
    dialogoIntro: ['Cresco i miei Pokémon con l\'acqua di sorgente di Marino. Sani e forti!'],
    dialogoSconfitta: 'Bravo, li hai cresciuti meglio tu.',
    dialogoDopo: ['Alla Sagra dell\'Uva torna: si fa festa per tutti!']
  },

  // ── Campagna tra Ariccia e Genzano (tratta tardo-gioco, Lv 30-40) ──
  {
    id: 'all-camp-1', classe: 'Ranger', nome: 'Albio', zona: 'Campagna dei Castelli',
    lat: 41.7270, lon: 12.6640, premioSoldi: 1860,
    squadra: [{ id: 262, livello: 30 }, { id: 264, livello: 31 }, { id: 277, livello: 31 }], // Mightyena, Linoone, Swellow
    dialogoIntro: ['Pattuglio la campagna dei Castelli. Da qui in poi i Pokémon selvatici non scherzano: e nemmeno io!'],
    dialogoSconfitta: 'Territorio tuo, ormai. Passa pure.',
    dialogoDopo: ['Verso Genzano la strada sale di livello. Occhio.']
  },
  {
    id: 'all-camp-2', classe: 'Domatrice', nome: 'Clelia', zona: 'Campagna dei Castelli',
    lat: 41.7180, lon: 12.6800, premioSoldi: 2040,
    squadra: [{ id: 59, livello: 33 }, { id: 128, livello: 34 }], // Arcanine, Tauros
    dialogoIntro: ['I miei Pokémon sono bestioni veri, non peluche. Pronto a domarli?'],
    dialogoSconfitta: 'Hai polso. Mi sa che sei tu il domatore.',
    dialogoDopo: ['Un Tauros imbizzarrito vale più di mille parole.']
  },
  {
    id: 'all-camp-3', classe: 'Lottatore', nome: 'Brenno', zona: 'Campagna dei Castelli',
    lat: 41.7120, lon: 12.6850, premioSoldi: 2280,
    squadra: [{ id: 57, livello: 37 }, { id: 67, livello: 37 }, { id: 128, livello: 38 }], // Primeape, Machoke, Tauros
    dialogoIntro: ['Mi alleno per la Lega da anni. Considerami il tuo riscaldamento prima di Colonna!'],
    dialogoSconfitta: 'Sei pronto per la Via Vittoria, lo vedo.',
    dialogoDopo: ['Alla Lega ci vediamo… se ci arrivi!']
  },
  {
    id: 'all-camp-4', classe: 'Asso', nome: 'Furio', zona: 'Campagna dei Castelli',
    lat: 41.7030, lon: 12.6980, premioSoldi: 2400,
    squadra: [{ id: 18, livello: 39 }, { id: 59, livello: 40 }, { id: 330, livello: 40 }], // Pidgeot, Arcanine, Flygon
    dialogoIntro: ['Ultimo ostacolo prima di Genzano e della Via Vittoria. Dimostra di valere il viaggio!'],
    dialogoSconfitta: 'Niente male! La Lega ti aspetta.',
    dialogoDopo: ['Cura la squadra a Genzano prima della Via Vittoria.']
  },

  // ── Campagna Ariccia→Genzano — espansione (Lv 38-44) ──
  {
    id: 'all-camp-5', classe: 'Veterana', nome: 'Selene', zona: 'Campagna dei Castelli',
    lat: 41.7240, lon: 12.6720, premioSoldi: 2160,
    squadra: [{ id: 197, livello: 38 }, { id: 228, livello: 38 }], // Umbreon, Houndour
    dialogoIntro: ['Questa campagna la percorro al tramonto ogni giorno. Il buio mi appartiene!'],
    dialogoSconfitta: 'Tramonto amaro.',
    dialogoDopo: ['Verso Genzano i sentieri si fanno fiocosi. Attento ai petali.']
  },
  {
    id: 'all-camp-6', classe: 'Pastore', nome: 'Ottavio', zona: 'Campagna dei Castelli',
    lat: 41.7180, lon: 12.6760, premioSoldi: 2220,
    squadra: [{ id: 128, livello: 39 }, { id: 111, livello: 40 }], // Tauros, Rhyhorn
    dialogoIntro: ['Porto le greggi ai pascoli ogni mattina. I miei Pokémon sono bestioni veri!'],
    dialogoSconfitta: 'Le greggi si sono disperse.',
    dialogoDopo: ['La campagna dei Castelli è selvaggia. Rispettala.']
  },
  {
    id: 'all-camp-7', classe: 'Cacciatore', nome: 'Nestore', zona: 'Campagna dei Castelli',
    lat: 41.7140, lon: 12.6810, premioSoldi: 2340,
    squadra: [{ id: 22, livello: 41 }, { id: 262, livello: 42 }], // Fearow, Mightyena
    dialogoIntro: ['Caccio in questa campagna da vent\'anni. Oggi la preda sei tu!'],
    dialogoSconfitta: 'Mi sono perso il colpo.',
    dialogoDopo: ['Genzano è vicina. Attento ai Folletto di Flora: sembrano buffi, mordono forte.']
  },
  {
    id: 'all-camp-8', classe: 'Contadino', nome: 'Ercolino', zona: 'Campagna dei Castelli',
    lat: 41.7090, lon: 12.6870, premioSoldi: 2400,
    squadra: [{ id: 59, livello: 42 }, { id: 76, livello: 42 }], // Arcanine, Golem
    dialogoIntro: ['Lavoro questa terra da quarant\'anni. E nessun allenatore mi batte sul campo!'],
    dialogoSconfitta: 'Il campo mi è stato arato da te.',
    dialogoDopo: ['Genzano in vista. Poi la Via Vittoria. Sei sicuro di essere pronto?']
  },

  // ── Percorso Tuscolana — espansione (Lv 4-8) ──
  {
    id: 'all-tusc-5', classe: 'Corriere', nome: 'Adelmo', zona: 'Percorso Tuscolana',
    lat: 41.8360, lon: 12.6280, premioSoldi: 340,
    squadra: [{ id: 19, livello: 4 }, { id: 161, livello: 5 }], // Rattata, Sentret
    dialogoIntro: ['Faccio consegne sulla Tuscolana da anni. E ogni tanto sfido chi trovo!'],
    dialogoSconfitta: 'Consegna persa.',
    dialogoDopo: ['La strada per Frascati sale. Mettiti il cuore in pace.']
  },
  {
    id: 'all-tusc-6', classe: 'Bambina', nome: 'Mimosa', zona: 'Percorso Tuscolana',
    lat: 41.8320, lon: 12.6320, premioSoldi: 280,
    squadra: [{ id: 163, livello: 4 }, { id: 16, livello: 5 }], // Hoothoot, Pidgey
    dialogoIntro: ['Mio fratello dice che non vinco mai. Oggi gli dimostro che sbaglia!'],
    dialogoSconfitta: 'Mannaggia. Lui aveva ragione.',
    dialogoDopo: ['Ma riprovo! Un giorno vinco, giuro.']
  },
  {
    id: 'all-tusc-7', classe: 'Jogger', nome: 'Furio', zona: 'Percorso Tuscolana',
    lat: 41.8250, lon: 12.6400, premioSoldi: 360,
    squadra: [{ id: 263, livello: 5 }, { id: 16, livello: 6 }], // Zigzagoon, Pidgey
    dialogoIntro: ['Faccio jogging sulla Tuscolana ogni mattina. Anche lottare fa parte della routine!'],
    dialogoSconfitta: 'Crampi.',
    dialogoDopo: ['Frascati è su, a destra dopo la salita. Ce la fai.']
  },
  {
    id: 'all-tusc-8', classe: 'Zingaro', nome: 'Calogero', zona: 'Percorso Tuscolana',
    lat: 41.8195, lon: 12.6460, premioSoldi: 400,
    squadra: [{ id: 261, livello: 6 }, { id: 19, livello: 7 }, { id: 163, livello: 7 }], // Poochyena, Rattata, Hoothoot
    dialogoIntro: ['Giro il mondo con i miei Pokémon. La Tuscolana è solo tappa!'],
    dialogoSconfitta: 'Il mondo gira anche per me.',
    dialogoDopo: ['Vai. La strada è tua.']
  },

  // ── Via Frascati → Grottaferrata (Lv 7-11, prato/colline) ──
  {
    id: 'all-fg-1', classe: 'Escursionista', nome: 'Graziella', zona: 'Via Frascati-Grottaferrata',
    lat: 41.8000, lon: 12.6785, premioSoldi: 380,
    squadra: [{ id: 16, livello: 7 }, { id: 19, livello: 8 }], // Pidgey, Rattata
    dialogoIntro: ['Scendo da Frascati a Grottaferrata a piedi ogni giorno. Tu fai lo stesso? Allora sfida!'],
    dialogoSconfitta: 'Sentiero libero.',
    dialogoDopo: ['Grottaferrata è vicina. L\'abbazia è bellissima.']
  },
  {
    id: 'all-fg-2', classe: 'Raccoglitrice', nome: 'Iva', zona: 'Via Frascati-Grottaferrata',
    lat: 41.7975, lon: 12.6768, premioSoldi: 400,
    squadra: [{ id: 43, livello: 8 }, { id: 187, livello: 8 }], // Oddish, Hoppip
    dialogoIntro: ['Raccolgo olive e castagne su questa collina. E alleno Pokémon Erba tra un raccolto e l\'altro!'],
    dialogoSconfitta: 'Raccolta magra.',
    dialogoDopo: ['I Boschi del Tuscolo sono lì a est. Ci si perde facilmente.']
  },
  {
    id: 'all-fg-3', classe: 'Paesaggista', nome: 'Erminio', zona: 'Via Frascati-Grottaferrata',
    lat: 41.7950, lon: 12.6740, premioSoldi: 420,
    squadra: [{ id: 163, livello: 9 }, { id: 69, livello: 9 }], // Hoothoot, Bellsprout
    dialogoIntro: ['Dipingo i paesaggi dei Castelli. Questo tratto è bellissimo. Tu invece sei un ostacolo!'],
    dialogoSconfitta: 'Aggiunto alla tela come vincitore.',
    dialogoDopo: ['Il panorama da qui è stupendo. Alzati gli occhi ogni tanto.']
  },
  {
    id: 'all-fg-4', classe: 'Ciclista', nome: 'Pia', zona: 'Via Frascati-Grottaferrata',
    lat: 41.7920, lon: 12.6715, premioSoldi: 440,
    squadra: [{ id: 163, livello: 10 }, { id: 16, livello: 10 }], // Hoothoot, Pidgey
    dialogoIntro: ['Scendo in bici! Non frenare, sfida!'],
    dialogoSconfitta: 'Frenata d\'emergenza.',
    dialogoDopo: ['In discesa si va forte. Attento alle curve.']
  },
  {
    id: 'all-fg-5', classe: 'Contadina', nome: 'Assuntina', zona: 'Via Frascati-Grottaferrata',
    lat: 41.7895, lon: 12.6695, premioSoldi: 460,
    squadra: [{ id: 43, livello: 10 }, { id: 44, livello: 11 }], // Oddish, Gloom
    dialogoIntro: ['Coltivo questo terreno da una vita. E alleno Pokémon Erba come coltivo: con amore e forza!'],
    dialogoSconfitta: 'Il campo cede.',
    dialogoDopo: ['Grottaferrata è quassù a sinistra. L\'abbazia si vede da lontano.']
  },
  {
    id: 'all-fg-6', classe: 'Turista con mappa', nome: 'Rudolf', zona: 'Via Frascati-Grottaferrata',
    lat: 41.7875, lon: 12.6677, premioSoldi: 480,
    squadra: [{ id: 161, livello: 11 }, { id: 263, livello: 11 }], // Sentret, Zigzagoon
    dialogoIntro: ['Sto cercando l\'Abbazia di San Nilo sulla mappa. Mentre aspetto ti sfido!'],
    dialogoSconfitta: 'Almeno ho trovato un\'altra cosa.',
    dialogoDopo: ['L\'abbazia è quella là. Finalmente.']
  },

  // ── Vigne di Frascati — espansione (Lv 7-10) ──
  {
    id: 'all-frasc-4', classe: 'Potatore', nome: 'Quintilio', zona: 'Vigne di Frascati',
    lat: 41.8050, lon: 12.7000, premioSoldi: 520,
    squadra: [{ id: 285, livello: 8 }, { id: 43, livello: 9 }], // Shroomish, Oddish
    dialogoIntro: ['Potato le viti ogni primavera. I miei Pokémon crescono come i tralci: lenti ma inesorabili!'],
    dialogoSconfitta: 'Taglio mal riuscito.',
    dialogoDopo: ['Il Frascati DOC viene da qui. Annata ottima.']
  },
  {
    id: 'all-frasc-5', classe: 'Enologa', nome: 'Chiara', zona: 'Vigne di Frascati',
    lat: 41.8060, lon: 12.6980, premioSoldi: 540,
    squadra: [{ id: 187, livello: 9 }, { id: 44, livello: 9 }], // Hoppip, Gloom
    dialogoIntro: ['Analizzare i vini e gli avversari: la stessa cosa. Già vedo i tuoi punti deboli!'],
    dialogoSconfitta: 'Analisi sbagliata.',
    dialogoDopo: ['Il Frascati Cannellino è il più pregiato. Come Vinicio.']
  },
  {
    id: 'all-frasc-6', classe: 'Fattore', nome: 'Aurelio', zona: 'Vigne di Frascati',
    lat: 41.8030, lon: 12.6970, premioSoldi: 540,
    squadra: [{ id: 69, livello: 9 }, { id: 187, livello: 10 }], // Bellsprout, Hoppip
    dialogoIntro: ['Gestisco questa tenuta per la famiglia Torlonia. E difendo il territorio!'],
    dialogoSconfitta: 'Il territorio è tuo.',
    dialogoDopo: ['Vinicio ti aspetta alla Villa. Sei pronto per i suoi Pokémon Erba?']
  },

  // ── Boschi del Tuscolo — espansione DUNGEON GROSSO (Lv 9-12) ──
  {
    id: 'all-bosco-5', classe: 'Botanico', nome: 'Fabio', zona: 'Boschi del Tuscolo',
    lat: 41.7930, lon: 12.7380, premioSoldi: 580,
    squadra: [{ id: 10, livello: 9 }, { id: 46, livello: 10 }], // Caterpie, Paras
    dialogoIntro: ['Catalogo le piante di questi boschi. E i Pokémon che ci vivono!'],
    dialogoSconfitta: 'Nuova voce nel catalogo: ho perso.',
    dialogoDopo: ['Le rovine di Tuscolo sono al centro del bosco. Roba antica.']
  },
  {
    id: 'all-bosco-6', classe: 'Ranger del parco', nome: 'Saveria', zona: 'Boschi del Tuscolo',
    lat: 41.7940, lon: 12.7390, premioSoldi: 600,
    squadra: [{ id: 13, livello: 10 }, { id: 285, livello: 10 }], // Weedle, Shroomish
    dialogoIntro: ['Proteggo questo bosco come parte del Parco Regionale. Ogni visitatore viene "testato"!'],
    dialogoSconfitta: 'Il test l\'hai superato.',
    dialogoDopo: ['Rispetta il bosco e il bosco ti rispetta. Vale anche coi Pokémon.']
  },
  {
    id: 'all-bosco-7', classe: 'Lumacaio', nome: 'Gelsomino', zona: 'Boschi del Tuscolo',
    lat: 41.7950, lon: 12.7370, premioSoldi: 600,
    squadra: [{ id: 43, livello: 10 }, { id: 13, livello: 11 }], // Oddish, Weedle
    dialogoIntro: ['Colleziono lumache e Pokémon lenti ma potenti!'],
    dialogoSconfitta: 'Sono rimasto indietro.',
    dialogoDopo: ['Lento ma determinato, come una lumaca che sale.']
  },
  {
    id: 'all-bosco-8', classe: 'Studente di storia', nome: 'Agostino', zona: 'Boschi del Tuscolo',
    lat: 41.7960, lon: 12.7360, premioSoldi: 620,
    squadra: [{ id: 74, livello: 10 }, { id: 10, livello: 11 }], // Geodude, Caterpie
    dialogoIntro: ['Studio le rovine di Tuscolo per la mia tesi. Ogni pietra ha una storia… come questa lotta!'],
    dialogoSconfitta: 'Capitolo difficile.',
    dialogoDopo: ['Il teatro romano è ancora visibile. Tremila anni di storia.']
  },
  {
    id: 'all-bosco-9', classe: 'Apicoltore', nome: 'Ciro', zona: 'Boschi del Tuscolo',
    lat: 41.7930, lon: 12.7360, premioSoldi: 640,
    squadra: [{ id: 13, livello: 10 }, { id: 14, livello: 11 }, { id: 10, livello: 11 }], // Weedle, Kakuna, Caterpie
    dialogoIntro: ['Le mie api raccolgono il polline in questi boschi. I miei Pokémon Coleottero sono altrettanto laboriosi!'],
    dialogoSconfitta: 'Le api sono tornate senza miele.',
    dialogoDopo: ['Il miele del Tuscolo è speciale. Le erbe antiche lo profumano.']
  },
  {
    id: 'all-bosco-10', classe: 'Naturalista', nome: 'Palma', zona: 'Boschi del Tuscolo',
    lat: 41.7915, lon: 12.7380, premioSoldi: 640,
    squadra: [{ id: 285, livello: 11 }, { id: 46, livello: 11 }], // Shroomish, Paras
    dialogoIntro: ['Studio l\'ecosistema dei boschi tuscolani da cinque anni. I Pokémon funghi sono i miei preferiti!'],
    dialogoSconfitta: 'L\'equilibrio si è rotto.',
    dialogoDopo: ['I funghi qui crescono enorimi. Merito dei Paras selvatici.']
  },
  {
    id: 'all-bosco-11', classe: 'Gitante domenicale', nome: 'Ermete', zona: 'Boschi del Tuscolo',
    lat: 41.7910, lon: 12.7345, premioSoldi: 660,
    squadra: [{ id: 43, livello: 11 }, { id: 161, livello: 11 }], // Oddish, Sentret
    dialogoIntro: ['Ogni domenica vengo qui a passeggiare. E ogni domenica sfido chi trovo!'],
    dialogoSconfitta: 'Domenica storta.',
    dialogoDopo: ['Le rovine sono a 10 minuti di cammino. Vai.']
  },
  {
    id: 'all-bosco-12', classe: 'Cercatore di funghi', nome: 'Oreste', zona: 'Boschi del Tuscolo',
    lat: 41.7925, lon: 12.7340, premioSoldi: 680,
    squadra: [{ id: 46, livello: 11 }, { id: 285, livello: 12 }], // Paras, Shroomish
    dialogoIntro: ['I funghi più rari crescono vicino ai Pokémon. E io li trovo tutti!'],
    dialogoSconfitta: 'Fungo avvelenato.',
    dialogoDopo: ['Sotto le radici di quella quercia c\'è un Paras enorme. Non disturbarla.']
  },
  {
    id: 'all-bosco-13', classe: 'Arrampicatore di rovine', nome: 'Ezio', zona: 'Boschi del Tuscolo',
    lat: 41.7935, lon: 12.7395, premioSoldi: 680,
    squadra: [{ id: 74, livello: 11 }, { id: 13, livello: 12 }], // Geodude, Weedle
    dialogoIntro: ['Salgo sulle mura del teatro romano ogni giorno. Sono il re di queste rovine!'],
    dialogoSconfitta: 'Sono caduto.',
    dialogoDopo: ['Il teatro romano ha ancora la scena in piedi. Incredibile.']
  },
  {
    id: 'all-bosco-14', classe: 'Fotografa naturalistica', nome: 'Serafina', zona: 'Boschi del Tuscolo',
    lat: 41.7945, lon: 12.7385, premioSoldi: 700,
    squadra: [{ id: 10, livello: 12 }, { id: 11, livello: 12 }], // Caterpie, Metapod
    dialogoIntro: ['Fotografo i Pokémon selvatici di questo bosco. E quando non trovo soggetti, sfido gli allenatori!'],
    dialogoSconfitta: 'Foto mossa.',
    dialogoDopo: ['Ho visto un Pokémon verde tra le rovine. Non era un selvatico normale.']
  },
  {
    id: 'all-bosco-15', classe: 'Studente universitario', nome: 'Viterbese',
    zona: 'Boschi del Tuscolo',
    lat: 41.7960, lon: 12.7375, premioSoldi: 700,
    squadra: [{ id: 43, livello: 12 }, { id: 187, livello: 12 }], // Oddish, Hoppip
    dialogoIntro: ['Faccio tesi sulle rovine del Tuscolo. Ho scoperto che alcuni Pokémon vivono nelle rovine stesse!'],
    dialogoSconfitta: 'La tesi si complica.',
    dialogoDopo: ['Le mura del foro romano ospitano famiglie di Geodude. Tremila anni di pace.']
  },
  {
    id: 'all-bosco-16', classe: 'Guardia del parco', nome: 'Timoteo', zona: 'Boschi del Tuscolo',
    lat: 41.7920, lon: 12.7395, premioSoldi: 720,
    squadra: [{ id: 74, livello: 11 }, { id: 46, livello: 12 }, { id: 13, livello: 12 }], // Geodude, Paras, Weedle
    dialogoIntro: ['Sorvegliate! Questo bosco è protetto. E i Pokémon che vivono qui pure!'],
    dialogoSconfitta: 'Il parco è tuo ora.',
    dialogoDopo: ['Tratta bene i Pokémon selvatici. Sono parte dell\'ecosistema.']
  },
  {
    id: 'all-bosco-17', classe: 'Avventuriero', nome: 'Brenno', zona: 'Boschi del Tuscolo',
    lat: 41.7905, lon: 12.7355, premioSoldi: 720,
    squadra: [{ id: 44, livello: 12 }, { id: 11, livello: 12 }], // Gloom, Metapod
    dialogoIntro: ['Esploro questi boschi in cerca di segreti. E ogni tanto trovo un allenatore valido!'],
    dialogoSconfitta: 'Il segreto oggi eri tu.',
    dialogoDopo: ['C\'è una radura nascosta tra le rovine. Se la trovi, capisci perché.']
  },
  {
    id: 'all-bosco-18', classe: 'Druida', nome: 'Quirino', zona: 'Boschi del Tuscolo',
    lat: 41.7895, lon: 12.7340, premioSoldi: 740,
    squadra: [{ id: 46, livello: 12 }, { id: 44, livello: 12 }, { id: 285, livello: 12 }], // Paras, Gloom, Shroomish
    dialogoIntro: ['Questi boschi sono sacri. Sono il guardiano delle rovine del Tuscolo. Dovrai superare me!'],
    dialogoSconfitta: 'Le rovine ti riconoscono.',
    dialogoDopo: ['Va\'. Il Tuscolo ha visto i suoi eroi. Forse sei uno di loro.']
  },

  // ── Via Grottaferrata → Marino (Lv 9-14, vigne e campagna) ──
  {
    id: 'all-gm-1', classe: 'Ciclista', nome: 'Pasquale', zona: 'Via Grottaferrata-Marino',
    lat: 41.7830, lon: 12.6650, premioSoldi: 480,
    squadra: [{ id: 43, livello: 9 }, { id: 16, livello: 10 }], // Oddish, Pidgey
    dialogoIntro: ['Scendo da Grottaferrata a Marino ogni sera. Velocità e forza!'],
    dialogoSconfitta: 'In discesa si va più veloci.',
    dialogoDopo: ['Marino è in fondo alla discesa. Moro ti aspetta alla fontana.']
  },
  {
    id: 'all-gm-2', classe: 'Agricoltore', nome: 'Egidio', zona: 'Via Grottaferrata-Marino',
    lat: 41.7800, lon: 12.6635, premioSoldi: 500,
    squadra: [{ id: 69, livello: 10 }, { id: 43, livello: 11 }], // Bellsprout, Oddish
    dialogoIntro: ['Coltivo i campi tra i due paesi. E alleno i miei Pokémon tra un solco e l\'altro!'],
    dialogoSconfitta: 'Il raccolto va male.',
    dialogoDopo: ['A Marino la fontana versa VINO alla Sagra. Giuro.']
  },
  {
    id: 'all-gm-3', classe: 'Camminatore', nome: 'Renata', zona: 'Via Grottaferrata-Marino',
    lat: 41.7770, lon: 12.6618, premioSoldi: 520,
    squadra: [{ id: 161, livello: 11 }, { id: 187, livello: 11 }], // Sentret, Hoppip
    dialogoIntro: ['Cammino su e giù per questi sentieri tutta la giornata. Le gambe son forti e i Pokémon pure!'],
    dialogoSconfitta: 'Un passo falso.',
    dialogoDopo: ['Il panorama tra i due paesi è bellissimo. Goditi la camminata.']
  },
  {
    id: 'all-gm-4', classe: 'Venditore ambulante', nome: 'Carmine', zona: 'Via Grottaferrata-Marino',
    lat: 41.7742, lon: 12.6603, premioSoldi: 540,
    squadra: [{ id: 70, livello: 12 }, { id: 44, livello: 12 }], // Weepinbell, Gloom
    dialogoIntro: ['Vendo verdure tra Grottaferrata e Marino. E regalo qualche lotta!'],
    dialogoSconfitta: 'Merce persa.',
    dialogoDopo: ['A Marino si trova di tutto al mercato. E alla fontana si beve gratis.']
  },
  {
    id: 'all-gm-5', classe: 'Veterana', nome: 'Amelia', zona: 'Via Grottaferrata-Marino',
    lat: 41.7715, lon: 12.6588, premioSoldi: 560,
    squadra: [{ id: 44, livello: 13 }, { id: 187, livello: 13 }], // Gloom, Hoppip
    dialogoIntro: ['Alleno da vent\'anni su questa strada. Ogni allenatore che passa è un test!'],
    dialogoSconfitta: 'Il test l\'hai passato.',
    dialogoDopo: ['Marino è a un chilometro. Stai attento all\'Acqua di Moro.']
  },

  // ── Vigne di Marino — espansione (Lv 7-10) ──
  {
    id: 'all-marino-4', classe: 'Vendemmiatore', nome: 'Ovidio', zona: 'Vigne di Marino',
    lat: 41.7540, lon: 12.6730, premioSoldi: 560,
    squadra: [{ id: 69, livello: 8 }, { id: 43, livello: 9 }], // Bellsprout, Oddish
    dialogoIntro: ['Le vigne di Marino sono le più ricche dei Castelli. E i miei Pokémon pure!'],
    dialogoSconfitta: 'Vendemmia anticipata.',
    dialogoDopo: ['Questa uva finirà alla Sagra. Fontana di vino, capisci?']
  },
  {
    id: 'all-marino-5', classe: 'Giardiniera', nome: 'Simonetta', zona: 'Vigne di Marino',
    lat: 41.7520, lon: 12.6750, premioSoldi: 580,
    squadra: [{ id: 270, livello: 9 }, { id: 43, livello: 9 }], // Lotad, Oddish
    dialogoIntro: ['Curo le siepi tra i filari. Tutto deve essere perfetto come il vino!'],
    dialogoSconfitta: 'Una siepe tagliata male.',
    dialogoDopo: ['Il Lotad cresce vicino all\'acqua. Qualcosa di umido sta sotto queste vigne.']
  },
  {
    id: 'all-marino-6', classe: 'Trattorista', nome: 'Memmo', zona: 'Vigne di Marino',
    lat: 41.7550, lon: 12.6770, premioSoldi: 580,
    squadra: [{ id: 188, livello: 10 }, { id: 165, livello: 10 }], // Skiploom, Ledyba
    dialogoIntro: ['Passo con il trattore e spazzo via gli avversari. Vieni!'],
    dialogoSconfitta: 'Il trattore è andato a vuoto.',
    dialogoDopo: ['Le vigne di Marino producono il vino della Sagra. Assaggialo se ci vai.']
  },

  // ── Boschetto Segreto — espansione (post-Taglio, Lv 12-15) ──
  {
    id: 'all-bosch-2', classe: 'Botanica', nome: 'Artemide', zona: 'Boschetto Segreto',
    lat: 41.7840, lon: 12.6760, premioSoldi: 880,
    squadra: [{ id: 70, livello: 13 }, { id: 188, livello: 13 }], // Weepinbell, Skiploom
    dialogoIntro: ['Finalmente qualcuno con la MN Taglio! Ero sola qui da settimane.'],
    dialogoSconfitta: 'Bene! Ci sarà compagnia qui!',
    dialogoDopo: ['Il boschetto cresce indisturbato. I Pokémon qui sono rari.']
  },
  {
    id: 'all-bosch-3', classe: 'Avventrice', nome: 'Lavinia', zona: 'Boschetto Segreto',
    lat: 41.7850, lon: 12.6775, premioSoldi: 900,
    squadra: [{ id: 102, livello: 14 }, { id: 234, livello: 14 }], // Exeggcute, Stantler
    dialogoIntro: ['Ho sentito che qui ci sono specie rare. E nel frattempo sfido chi trova!'],
    dialogoSconfitta: 'Specie rara: il vincitore.',
    dialogoDopo: ['Ho visto uno Stantler tra le felci. Bellissimo.']
  },
  {
    id: 'all-bosch-4', classe: 'Esperto di piante', nome: 'Lamberto', zona: 'Boschetto Segreto',
    lat: 41.7835, lon: 12.6770, premioSoldi: 920,
    squadra: [{ id: 114, livello: 14 }, { id: 48, livello: 15 }], // Tangela, Venonat
    dialogoIntro: ['La vegetazione qui è diversa da tutto il resto. Come i miei Pokémon!'],
    dialogoSconfitta: 'La vegetazione mi ha sorpreso.',
    dialogoDopo: ['Più in fondo c\'è una radura strana. Luci che cambiano colore.']
  },

  // ── Via Marino → Monte Porzio (Lv 12-17, zona agricola in salita) ──
  {
    id: 'all-mmp-1', classe: 'Ciclista', nome: 'Oronzo', zona: 'Via Marino-Monte Porzio',
    lat: 41.7760, lon: 12.6720, premioSoldi: 620,
    squadra: [{ id: 17, livello: 12 }, { id: 161, livello: 13 }], // Pidgeotto, Sentret
    dialogoIntro: ['Salgo verso Monte Porzio in bici ogni mattina. In salita alleno la forza!'],
    dialogoSconfitta: 'In salita si fa più fatica.',
    dialogoDopo: ['Monte Porzio è lassù. Stella studia le stelle di notte e vince di giorno.']
  },
  {
    id: 'all-mmp-2', classe: 'Tecnico del gas', nome: 'Ferrucci', zona: 'Via Marino-Monte Porzio',
    lat: 41.7830, lon: 12.6830, premioSoldi: 660,
    squadra: [{ id: 81, livello: 14 }, { id: 100, livello: 14 }], // Magnemite, Voltorb
    dialogoIntro: ['Controllo i contatori lungo questo percorso. E ogni tanto trovo l\'energia giusta per una lotta!'],
    dialogoSconfitta: 'Corrente interrotta.',
    dialogoDopo: ['L\'osservatorio usa molta corrente. Tutta dagli Elettro.']
  },
  {
    id: 'all-mmp-3', classe: 'Giovane allenatore', nome: 'Amerigo', zona: 'Via Marino-Monte Porzio',
    lat: 41.7900, lon: 12.6930, premioSoldi: 700,
    squadra: [{ id: 100, livello: 15 }, { id: 170, livello: 15 }], // Voltorb, Chinchou
    dialogoIntro: ['Mi alleno verso l\'osservatorio ogni giorno. Stella mi ha detto: "Prima vinci i percorsi, poi sfida me!"'],
    dialogoSconfitta: 'Esercizio utile.',
    dialogoDopo: ['L\'osservatorio è in vista. Ma Stella è tosta, preparati bene.']
  },
  {
    id: 'all-mmp-4', classe: 'Insegnante', nome: 'Agnese', zona: 'Via Marino-Monte Porzio',
    lat: 41.7990, lon: 12.7000, premioSoldi: 740,
    squadra: [{ id: 25, livello: 16 }, { id: 81, livello: 16 }], // Pikachu, Magnemite
    dialogoIntro: ['Insegno scienze al liceo di Monte Porzio. E uso Pokémon Elettro come esempio in classe!'],
    dialogoSconfitta: 'Lezione di umiltà.',
    dialogoDopo: ['A scuola spiego i tipi Elettro. Stella è la mia ispirazione.']
  },
  {
    id: 'all-mmp-5', classe: 'Astrofilo', nome: 'Reginaldo', zona: 'Via Marino-Monte Porzio',
    lat: 41.8070, lon: 12.7095, premioSoldi: 780,
    squadra: [{ id: 82, livello: 17 }, { id: 311, livello: 17 }], // Magneton, Plusle
    dialogoIntro: ['Studio le stelle dal mio terrazzo vicino all\'osservatorio. E studia anche i miei avversari!'],
    dialogoSconfitta: 'Galassia scoperta: la mia sconfitta.',
    dialogoDopo: ['L\'osservatorio INAF è lassù. Stella lavora là ogni notte.']
  },

  // ── Via Monte Porzio → Rocca di Papa (Lv 17-23, versante vulcanico) ──
  {
    id: 'all-mpr-1', classe: 'Geologo', nome: 'Teodosio', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.8110, lon: 12.7160, premioSoldi: 860,
    squadra: [{ id: 74, livello: 17 }, { id: 95, livello: 18 }], // Geodude, Onix
    dialogoIntro: ['Studio la geologia del Vulcano Laziale. E ogni campione di roccia mi ha insegnato a combattere!'],
    dialogoSconfitta: 'Faglia imprevista.',
    dialogoDopo: ['Il peperino di questi monti dura millenni. Come i Pokémon Roccia di Rocco.']
  },
  {
    id: 'all-mpr-2', classe: 'Escursionista', nome: 'Matilde', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.8030, lon: 12.7140, premioSoldi: 900,
    squadra: [{ id: 111, livello: 19 }, { id: 74, livello: 19 }], // Rhyhorn, Geodude
    dialogoIntro: ['Percorro questo sentiero ogni sabato. È impervio come i miei Pokémon Roccia!'],
    dialogoSconfitta: 'Sentiero troppo ripido.',
    dialogoDopo: ['Rocca di Papa è in vista. Il paese è arroccato sulla roccia, come dice il nome.']
  },
  {
    id: 'all-mpr-3', classe: 'Alpinista junior', nome: 'Bartolo', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7950, lon: 12.7130, premioSoldi: 940,
    squadra: [{ id: 246, livello: 20 }, { id: 75, livello: 20 }], // Larvitar, Graveler
    dialogoIntro: ['Mi alleno per scalare il Monte Cavo. Per ora mi basta scalare questa classifica!'],
    dialogoSconfitta: 'Quota raggiunta: la mia sconfitta.',
    dialogoDopo: ['Il Larvitar un giorno diventerà Tyranitar. Poi rido io.']
  },

  // ── FAMIGLIA VINCI (Monte Porzio→Rocca, Lv 22-27) ──
  {
    id: 'all-vinci-nonno', classe: 'Nonno Vinci', nome: 'Aniceto', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7920, lon: 12.7143, premioSoldi: 960,
    squadra: [{ id: 55, livello: 24 }, { id: 28, livello: 25 }], // Golduck, Sandslash
    dialogoIntro: ['Sono il capofamiglia Vinci! Nessuno batte la nostra famiglia in battaglia!'],
    dialogoSconfitta: 'La famiglia Vinci si inchina.',
    dialogoDopo: ['Beh. La famiglia ha parlato. Sei degno di sfidare gli altri Vinci!']
  },
  {
    id: 'all-vinci-nonna', classe: 'Nonna Vinci', nome: 'Pia', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7910, lon: 12.7135, premioSoldi: 880,
    squadra: [{ id: 36, livello: 23 }], // Clefable
    dialogoIntro: ['Faccio i cannelloni meglio di tutti e vinco le lotte meglio di tutti!'],
    dialogoSconfitta: 'Mio nipote aveva ragione. Sei forte.',
    dialogoDopo: ['Sei forte come i cannelloni della nonna. Questo è il massimo dei complimenti.']
  },
  {
    id: 'all-vinci-papa', classe: 'Papà Vinci', nome: 'Reginaldo', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7902, lon: 12.7128, premioSoldi: 1020,
    squadra: [{ id: 59, livello: 26 }, { id: 76, livello: 26 }], // Arcanine, Golem
    dialogoIntro: ['Papà Vinci protegge la famiglia! Devi battere me prima degli altri!'],
    dialogoSconfitta: 'Figlio mio, guarda questo ragazzo!',
    dialogoDopo: ['La famiglia Vinci si batteva per il Re di Roma. Oggi ci battiamo per il divertimento.']
  },
  {
    id: 'all-vinci-mamma', classe: 'Mamma Vinci', nome: 'Rossana', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7895, lon: 12.7122, premioSoldi: 980,
    squadra: [{ id: 197, livello: 24 }, { id: 184, livello: 25 }], // Umbreon, Azumarill
    dialogoIntro: ['Allevo i miei Pokémon come allevo i figli: con amore e disciplina!'],
    dialogoSconfitta: 'Bravo! Vieni a cena. Ho fatto l\'amatriciana.',
    dialogoDopo: ['I figli Vinci sono li. Preparati.']
  },
  {
    id: 'all-vinci-figlio', classe: 'Figlio Vinci', nome: 'Romoletto', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7888, lon: 12.7115, premioSoldi: 900,
    squadra: [{ id: 26, livello: 22 }, { id: 57, livello: 23 }], // Raichu, Primeape
    dialogoIntro: ['Sono Romoletto Vinci! Papà dice che sono il più forte della famiglia. Proviamolo!'],
    dialogoSconfitta: 'Papà aveva torto.',
    dialogoDopo: ['Mia sorella è peggio. Attento.']
  },
  {
    id: 'all-vinci-figlia', classe: 'Figlia Vinci', nome: 'Romolina', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7882, lon: 12.7108, premioSoldi: 940,
    squadra: [{ id: 282, livello: 22 }, { id: 59, livello: 24 }], // Gardevoir, Arcanine
    dialogoIntro: ['Romolina Vinci, la migliore della famiglia! Non mio fratello: IO!'],
    dialogoSconfitta: 'Ok ok, forse non la migliore.',
    dialogoDopo: ['La famiglia ti ha valutato. Sei approvato. Ora vai a Rocca.']
  },

  // ── Via Monte Porzio → Rocca di Papa — altri (Lv 20-23) ──
  {
    id: 'all-mpr-4', classe: 'Camionista', nome: 'Ubaldo', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7850, lon: 12.7117, premioSoldi: 980,
    squadra: [{ id: 95, livello: 21 }, { id: 111, livello: 22 }], // Onix, Rhyhorn
    dialogoIntro: ['Porto materiali da costruzione su questa strada ogni giorno. E non mi fermo mai!'],
    dialogoSconfitta: 'Stop forzato.',
    dialogoDopo: ['Rocca di Papa è quasi sopra. È un borgo arroccato sulla roccia, letteralmente.']
  },
  {
    id: 'all-mpr-5', classe: 'Guardia forestale', nome: 'Settimia', zona: 'Via Monte Porzio-Rocca di Papa',
    lat: 41.7808, lon: 12.7112, premioSoldi: 1020,
    squadra: [{ id: 22, livello: 22 }, { id: 246, livello: 23 }], // Fearow, Larvitar
    dialogoIntro: ['Sorvegliente questo bosco sul versante del vulcano. Nessuno passa senza il mio controllo!'],
    dialogoSconfitta: 'Il bosco ti appartiene.',
    dialogoDopo: ['Rocca di Papa è a 200 metri. L\'ingresso alla palestra è al centro del borgo.']
  },

  // ── Grotta del Vulcano — DUNGEON GROSSO espansione (Lv 19-25) ──
  {
    id: 'all-grotta-4', classe: 'Volcanista', nome: 'Flaminia', zona: 'Grotta del Vulcano',
    lat: 41.7480, lon: 12.7140, premioSoldi: 1100,
    squadra: [{ id: 218, livello: 19 }, { id: 41, livello: 20 }], // Slugma, Zubat
    dialogoIntro: ['Studio le lave solidificate di questi cunicoli. I miei Pokémon di Fuoco li illuminano!'],
    dialogoSconfitta: 'La lava si è raffreddata.',
    dialogoDopo: ['Più in profondità fa caldissimo. Porta acqua.']
  },
  {
    id: 'all-grotta-5', classe: 'Speleologo jr', nome: 'Fabrizio', zona: 'Grotta del Vulcano',
    lat: 41.7490, lon: 12.7155, premioSoldi: 1140,
    squadra: [{ id: 74, livello: 20 }, { id: 50, livello: 20 }], // Geodude, Diglett
    dialogoIntro: ['Prima grotta da solo! Sono emozionato. E anche un po\' aggressivo.'],
    dialogoSconfitta: 'Esperienza guadagnata.',
    dialogoDopo: ['Non andare oltre il terzo cunicolo da solo. Dico sul serio.']
  },
  {
    id: 'all-grotta-6', classe: 'Cercatore di cristalli', nome: 'Osvalda', zona: 'Grotta del Vulcano',
    lat: 41.7500, lon: 12.7160, premioSoldi: 1160,
    squadra: [{ id: 95, livello: 20 }, { id: 75, livello: 21 }], // Onix, Graveler
    dialogoIntro: ['Cerco cristalli vulcanici in questa grotta. E ogni tanto trovo avversari preziosi!'],
    dialogoSconfitta: 'Trovata la gemma più preziosa: la sconfitta.',
    dialogoDopo: ['I cristalli qui brillano come Electrode. Ma sono più stabili.']
  },
  {
    id: 'all-grotta-7', classe: 'Tecnico minerario', nome: 'Alvaro', zona: 'Grotta del Vulcano',
    lat: 41.7510, lon: 12.7158, premioSoldi: 1180,
    squadra: [{ id: 322, livello: 21 }, { id: 218, livello: 22 }], // Numel, Slugma
    dialogoIntro: ['Cartografo delle gallerie vulcaniche. Ogni curva la conosco a memoria. E ogni avversario pure!'],
    dialogoSconfitta: 'Curva imprevista.',
    dialogoDopo: ['C\'è una camera più in basso dove il calore diventa insopportabile. Vai se hai coraggio.']
  },
  {
    id: 'all-grotta-8', classe: 'Ingegnere minerario', nome: 'Desiderio', zona: 'Grotta del Vulcano',
    lat: 41.7482, lon: 12.7135, premioSoldi: 1200,
    squadra: [{ id: 41, livello: 21 }, { id: 74, livello: 22 }, { id: 50, livello: 22 }], // Zubat, Geodude, Diglett
    dialogoIntro: ['Ho costruito le gallerie di accesso. Nessuno conosce questo posto come me!'],
    dialogoSconfitta: 'Struttura portante: te.',
    dialogoDopo: ['Le gallerie più profonde portano a una stanza rossa. Non è il tramonto.']
  },
  {
    id: 'all-grotta-9', classe: 'Speleologa', nome: 'Eleonora', zona: 'Grotta del Vulcano',
    lat: 41.7475, lon: 12.7128, premioSoldi: 1220,
    squadra: [{ id: 75, livello: 22 }, { id: 42, livello: 22 }], // Graveler, Golbat
    dialogoIntro: ['Ho mappato metà di questa grotta. L\'altra metà mi spaventa ancora. Ma tu no!'],
    dialogoSconfitta: 'Aggiunto alla mappa.',
    dialogoDopo: ['I Golbat qui sono enormi. Qualcosa li ha fatti crescere.']
  },
  {
    id: 'all-grotta-10', classe: 'Vulcanologo senior', nome: 'Tiberio', zona: 'Grotta del Vulcano',
    lat: 41.7468, lon: 12.7140, premioSoldi: 1260,
    squadra: [{ id: 323, livello: 23 }, { id: 95, livello: 23 }], // Camerupt, Onix
    dialogoIntro: ['Vent\'anni di vulcanologia. Il Vulcano Laziale mi ha riservato ancora sorprese. Come te!'],
    dialogoSconfitta: 'Eruzione imprevedibile.',
    dialogoDopo: ['Il Camerupt è caldo. Letteralmente. Non toccarlo.']
  },
  {
    id: 'all-grotta-11', classe: 'Minatore esperto', nome: 'Gesualdo', zona: 'Grotta del Vulcano',
    lat: 41.7472, lon: 12.7152, premioSoldi: 1280,
    squadra: [{ id: 76, livello: 23 }, { id: 75, livello: 24 }], // Golem, Graveler
    dialogoIntro: ['Cinquant\'anni di piccone. I miei Pokémon Roccia sono vecchi come me e forti il doppio!'],
    dialogoSconfitta: 'Il più vecchio ha imparato qualcosa di nuovo.',
    dialogoDopo: ['La roccia qua in fondo è diversa. Quasi… si muove.']
  },
  {
    id: 'all-grotta-12', classe: 'Guardiano del nucleo', nome: 'Incendio', zona: 'Grotta del Vulcano',
    lat: 41.7485, lon: 12.7165, premioSoldi: 1300,
    squadra: [{ id: 323, livello: 24 }, { id: 218, livello: 24 }], // Camerupt, Slugma
    dialogoIntro: ['Il nucleo del vulcano è protetto. Da me. E dai miei Pokémon di Fuoco!'],
    dialogoSconfitta: 'Il nucleo si raffredda.',
    dialogoDopo: ['Laggiù in fondo… sento la terra che respira. Qualcosa dorme là.']
  },
  {
    id: 'all-grotta-13', classe: 'Ricercatore del calore', nome: 'Fiamma', zona: 'Grotta del Vulcano',
    lat: 41.7498, lon: 12.7168, premioSoldi: 1320,
    squadra: [{ id: 126, livello: 24 }, { id: 322, livello: 25 }], // Magmar, Numel
    dialogoIntro: ['Il calore di questa grotta è energia pura. I miei Pokémon lo assorbono!'],
    dialogoSconfitta: 'Energia dispersa.',
    dialogoDopo: ['Il Groudon dorme in fondo. Lo sentono solo i sensitivi.']
  },
  {
    id: 'all-grotta-14', classe: 'Speleologa veterana', nome: 'Margherita', zona: 'Grotta del Vulcano',
    lat: 41.7505, lon: 12.7162, premioSoldi: 1340,
    squadra: [{ id: 42, livello: 25 }, { id: 76, livello: 25 }], // Golbat, Golem
    dialogoIntro: ['Ho esplorato le grotte di tutta Italia. Questa è la più strana e la più bella!'],
    dialogoSconfitta: 'La grotta più bella, anche nella sconfitta.',
    dialogoDopo: ['C\'è un corridoio segnato in rosso sulla mia mappa. Non so cosa c\'è oltre.']
  },
  {
    id: 'all-grotta-15', classe: 'Piromane evoluto', nome: 'Ardea', zona: 'Grotta del Vulcano',
    lat: 41.7512, lon: 12.7148, premioSoldi: 1360,
    squadra: [{ id: 219, livello: 25 }, { id: 323, livello: 25 }], // Magcargo, Camerupt
    dialogoIntro: ['Ah, finalmente qualcuno che arriva fin qui! Ora vediamo se meriti di restare!'],
    dialogoSconfitta: 'Meriti di stare qui. Va\' oltre.',
    dialogoDopo: ['Il bagliore rosso in fondo non è lava. È qualcosa di antico.']
  },
  {
    id: 'all-grotta-16', classe: 'Custode delle profondità', nome: 'Vulcano', zona: 'Grotta del Vulcano',
    lat: 41.7495, lon: 12.7142, premioSoldi: 1380,
    squadra: [{ id: 126, livello: 24 }, { id: 76, livello: 25 }, { id: 219, livello: 25 }], // Magmar, Golem, Magcargo
    dialogoIntro: ['Sei arrivato al centro della grotta. Meraviglia. E terrore. Puoi andare oltre solo se batti me!'],
    dialogoSconfitta: 'Il centro è tuo.',
    dialogoDopo: ['Là in fondo, oltre la lava… la terra trema ogni tanto. Non svegliarlo.']
  },

  // ── Monte Cavo — espansione (Lv 38-46) ──
  {
    id: 'all-cavo-3', classe: 'Corridore in quota', nome: 'Telesforo', zona: 'Monte Cavo',
    lat: 41.7450, lon: 12.7060, premioSoldi: 2280,
    squadra: [{ id: 227, livello: 40 }, { id: 22, livello: 41 }], // Skarmory, Fearow
    dialogoIntro: ['Corro in quota ogni mattina. A 949 metri sul mare si respira diverso e si lotta diverso!'],
    dialogoSconfitta: 'Respiro corto.',
    dialogoDopo: ['Lugia vola su queste cime. Se sei fortunato, lo vedi da qui.']
  },
  {
    id: 'all-cavo-4', classe: 'Pellegrino della Via Sacra', nome: 'Arsenio', zona: 'Monte Cavo',
    lat: 41.7480, lon: 12.7070, premioSoldi: 2340,
    squadra: [{ id: 76, livello: 41 }, { id: 208, livello: 42 }], // Golem, Steelix
    dialogoIntro: ['Cammino sulla Via Sacra come i romani. E loro non si fermavano davanti a nessuno!'],
    dialogoSconfitta: 'La Via Sacra ha molte strade.',
    dialogoDopo: ['La Via Sacra portava al tempio di Giove in cima. Ora porta alla Lega.']
  },
  {
    id: 'all-cavo-5', classe: 'Cacciatore di nuvole', nome: 'Celeste', zona: 'Monte Cavo',
    lat: 41.7510, lon: 12.7080, premioSoldi: 2400,
    squadra: [{ id: 22, livello: 43 }, { id: 227, livello: 43 }], // Fearow, Skarmory
    dialogoIntro: ['In quota le nuvole le tocchi con mano. E i Pokémon Volante sono nel loro elemento!'],
    dialogoSconfitta: 'Nuvola persa.',
    dialogoDopo: ['Ho visto qualcosa di enorme volare di notte. Non era un Fearow.']
  },
  {
    id: 'all-cavo-6', classe: 'Escursionista esperto', nome: 'Cosimo', zona: 'Monte Cavo',
    lat: 41.7540, lon: 12.7090, premioSoldi: 2460,
    squadra: [{ id: 112, livello: 44 }, { id: 22, livello: 44 }], // Rhydon, Fearow
    dialogoIntro: ['Ho percorso ogni sentiero del Monte Cavo. Questo è il più bello e il più difficile!'],
    dialogoSconfitta: 'Un sentiero nuovo.',
    dialogoDopo: ['Dalla cima si vede Roma. E la Lega di Colonna, lontana ma vicina.']
  },
  {
    id: 'all-cavo-7', classe: 'Guardiano della cima', nome: 'Dionisio', zona: 'Monte Cavo',
    lat: 41.7560, lon: 12.7010, premioSoldi: 2520,
    squadra: [{ id: 208, livello: 44 }, { id: 112, livello: 45 }, { id: 227, livello: 45 }], // Steelix, Rhydon, Skarmory
    dialogoIntro: ['Presidio la cima del Monte Cavo da anni. Chi vuole passare, lotta!'],
    dialogoSconfitta: 'La cima è tua.',
    dialogoDopo: ['Sei il primo ad arrivare quassù questo mese. Il vento porta notizie strane. Vai a Colonna.']
  },

  // ── Via Rocca di Papa → Albano (Lv 27-35) ──
  {
    id: 'all-rpa-1', classe: 'Camminatore di montagna', nome: 'Anacleto', zona: 'Via Rocca-Albano',
    lat: 41.7580, lon: 12.7060, premioSoldi: 1080,
    squadra: [{ id: 56, livello: 27 }, { id: 74, livello: 28 }], // Mankey, Geodude
    dialogoIntro: ['Scendo dalla Rocca verso Albano ogni mattina. E sfido ogni allenatore sulla via!'],
    dialogoSconfitta: 'In discesa sono più veloce.',
    dialogoDopo: ['Albano è in vista. Massimo e i suoi legionari aspettano.']
  },
  {
    id: 'all-rpa-2', classe: 'Mugnaio', nome: 'Terenzio', zona: 'Via Rocca-Albano',
    lat: 41.7530, lon: 12.7000, premioSoldi: 1140,
    squadra: [{ id: 57, livello: 29 }, { id: 111, livello: 30 }], // Primeape, Rhyhorn
    dialogoIntro: ['Macino il grano qui vicino. La forza che ci vuole è la stessa che uso in lotta!'],
    dialogoSconfitta: 'Macinato.',
    dialogoDopo: ['La strada per Albano passa per i Castelli Romani. Bellissima ma impegnativa.']
  },
  {
    id: 'all-rpa-3', classe: 'Soldato in congedo', nome: 'Asterio', zona: 'Via Rocca-Albano',
    lat: 41.7480, lon: 12.6940, premioSoldi: 1200,
    squadra: [{ id: 67, livello: 31 }, { id: 57, livello: 32 }], // Machoke, Primeape
    dialogoIntro: ['Ho servito nella Seconda Legione come Massimo. Ora sono in congedo ma combatto ancora!'],
    dialogoSconfitta: 'Il veterano è battuto.',
    dialogoDopo: ['Massimo è il degno erede della tradizione legionaria. Rispettalo.']
  },
  {
    id: 'all-rpa-4', classe: 'Guida storica', nome: 'Leopoldina', zona: 'Via Rocca-Albano',
    lat: 41.7430, lon: 12.6870, premioSoldi: 1260,
    squadra: [{ id: 297, livello: 33 }, { id: 307, livello: 33 }], // Hariyama, Meditite
    dialogoIntro: ['Porto i turisti ai Castra Albana. E li preparo anche per la palestra!'],
    dialogoSconfitta: 'Tour inaspettato.',
    dialogoDopo: ['I Castra Albana ospitavano diecimila legionari. Massimo ne ha sei Pokémon. Abbastanza.']
  },
  {
    id: 'all-rpa-5', classe: 'Lottatore', nome: 'Brutus', zona: 'Via Rocca-Albano',
    lat: 41.7380, lon: 12.6800, premioSoldi: 1320,
    squadra: [{ id: 68, livello: 34 }, { id: 308, livello: 35 }], // Machamp, Medicham
    dialogoIntro: ['Bruto è il mio nome. E bruto è il mio stile di lotta. Attento!'],
    dialogoSconfitta: 'Il bruto battuto.',
    dialogoDopo: ['Albano è avanti. Massimo aspetta. "AVE!", come diciamo noi.']
  },

  // ── Lab CoTrAL #1 (periferia Marino, Lv 22-30, scienziati/ricercatori) ──
  {
    id: 'all-lab1-1', classe: 'Ricercatore', nome: 'Edoardo', zona: 'Lab CoTrAL #1',
    lat: 41.7720, lon: 12.6550, premioSoldi: 960,
    squadra: [{ id: 81, livello: 22 }, { id: 100, livello: 22 }], // Magnemite, Voltorb
    dialogoIntro: ['Lavoro in questo laboratorio per il progetto di ricerca. Non sono abituato agli intrusi!'],
    dialogoSconfitta: 'Dati anomali rilevati.',
    dialogoDopo: ['Questo è solo un laboratorio di ricerca. Non c\'è niente da vedere qui.']
  },
  {
    id: 'all-lab1-2', classe: 'Tecnica', nome: 'Floriana', zona: 'Lab CoTrAL #1',
    lat: 41.7730, lon: 12.6558, premioSoldi: 980,
    squadra: [{ id: 100, livello: 23 }, { id: 82, livello: 23 }], // Voltorb, Magneton
    dialogoIntro: ['Mantengo in funzione i macchinari del lab. E mantengo lontani gli intrusi!'],
    dialogoSconfitta: 'Macchinario in errore.',
    dialogoDopo: ['Non so cosa faccio qui. Solo che mi pagano bene.']
  },
  {
    id: 'all-lab1-3', classe: 'Assistente di ricerca', nome: 'Massimiliano', zona: 'Lab CoTrAL #1',
    lat: 41.7740, lon: 12.6558, premioSoldi: 1000,
    squadra: [{ id: 64, livello: 24 }, { id: 81, livello: 24 }], // Kadabra, Magnemite
    dialogoIntro: ['Sono l\'assistente del responsabile. Non posso far passare nessuno!'],
    dialogoSconfitta: 'Il responsabile non sarà contento.',
    dialogoDopo: ['Il progetto vero è al piano di sotto. Non ci sono mai sceso.']
  },
  {
    id: 'all-lab1-4', classe: 'Ingegnere di sistema', nome: 'Cornelio', zona: 'Lab CoTrAL #1',
    lat: 41.7730, lon: 12.6563, premioSoldi: 1020,
    squadra: [{ id: 101, livello: 24 }, { id: 64, livello: 25 }], // Electrode, Kadabra
    dialogoIntro: ['I sistemi di sicurezza li ho progettati io. Ma non ho previsto te.'],
    dialogoSconfitta: 'Sistema in crash.',
    dialogoDopo: ['C\'è una stanza sigillata qui. La chiave ce l\'ha solo il direttore.']
  },
  {
    id: 'all-lab1-5', classe: 'Biologa', nome: 'Cristiana', zona: 'Lab CoTrAL #1',
    lat: 41.7720, lon: 12.6568, premioSoldi: 1040,
    squadra: [{ id: 97, livello: 25 }, { id: 100, livello: 25 }], // Hypno, Voltorb
    dialogoIntro: ['Studio il DNA dei Pokémon. Un lavoro nobile. E intimo. Vattene!'],
    dialogoSconfitta: 'Campione inutilizzabile.',
    dialogoDopo: ['Ho visto dati strani. Sequenze che non tornano. Come se stessero cercando qualcosa di specifico.']
  },
  {
    id: 'all-lab1-6', classe: 'Guardia notturna', nome: 'Ortensio', zona: 'Lab CoTrAL #1',
    lat: 41.7710, lon: 12.6565, premioSoldi: 1060,
    squadra: [{ id: 198, livello: 25 }, { id: 197, livello: 25 }], // Murkrow, Umbreon
    dialogoIntro: ['Faccio la guardia di notte. E di giorno pure. Non dormo mai.'],
    dialogoSconfitta: 'Sonnambulo.',
    dialogoDopo: ['Di notte arrivano dei furgoni. Non hanno logo. Non hanno targa.']
  },
  {
    id: 'all-lab1-7', classe: 'Chimico', nome: 'Vespasiano', zona: 'Lab CoTrAL #1',
    lat: 41.7735, lon: 12.6555, premioSoldi: 1080,
    squadra: [{ id: 101, livello: 26 }, { id: 82, livello: 26 }], // Electrode, Magneton
    dialogoIntro: ['Analizzo le sostanze estratte dai Pokémon. Lavoro delicatissimo e pericolosissimo!'],
    dialogoSconfitta: 'Reazione inattesa.',
    dialogoDopo: ['Ho sentito che stanno cercando un Pokémon leggendario. Non so quale. Spero sia solo una voce.']
  },
  {
    id: 'all-lab1-8', classe: 'Ricercatrice senior', nome: 'Brunella', zona: 'Lab CoTrAL #1',
    lat: 41.7725, lon: 12.6555, premioSoldi: 1100,
    squadra: [{ id: 65, livello: 27 }, { id: 101, livello: 27 }], // Alakazam, Electrode
    dialogoIntro: ['Dieci anni di ricerca qui. Non ho mai perso contro un intruso. Fino a oggi, forse.'],
    dialogoSconfitta: 'Una prima volta per tutto.',
    dialogoDopo: ['Il direttore parla spesso di "acqua" e "terra". Non mi ha mai spiegato cosa intende.']
  },
  {
    id: 'all-lab1-9', classe: 'Tecnico di laboratorio', nome: 'Patrizio', zona: 'Lab CoTrAL #1',
    lat: 41.7715, lon: 12.6560, premioSoldi: 1120,
    squadra: [{ id: 64, livello: 27 }, { id: 196, livello: 28 }], // Kadabra, Espeon
    dialogoIntro: ['Lavoro qui da sei mesi. Ancora non capisco cosa produciamo, ma si paga bene!'],
    dialogoSconfitta: 'Cambio di carriera in arrivo.',
    dialogoDopo: ['Ho visto dei dati su "Kyogre" e "Groudon". Sono Pokémon leggendari, vero?']
  },
  {
    id: 'all-lab1-10', classe: 'Direttore aggiunto', nome: 'Crasso jr', zona: 'Lab CoTrAL #1',
    lat: 41.7705, lon: 12.6555, premioSoldi: 1200,
    squadra: [{ id: 55, livello: 28 }, { id: 65, livello: 29 }], // Golduck, Alakazam
    dialogoIntro: ['Sono il direttore aggiunto di questo laboratorio. Non sei autorizzato ad essere qui!'],
    dialogoSconfitta: 'Autorizzo il tuo passaggio.',
    dialogoDopo: ['Il progetto vero è altrove. Questo è solo un avamposto. Vai.']
  },
  {
    id: 'all-lab1-11', classe: 'Guardia armata', nome: 'Sesto', zona: 'Lab CoTrAL #1',
    lat: 41.7722, lon: 12.6545, premioSoldi: 1140,
    squadra: [{ id: 262, livello: 28 }, { id: 101, livello: 28 }], // Mightyena, Electrode
    dialogoIntro: ['Sono la sicurezza di questo laboratorio. E non sono qui per scherzare!'],
    dialogoSconfitta: 'Sicurezza compromessa.',
    dialogoDopo: ['Non so chi sei o cosa vuoi. Ma gli ordini vengono dall\'alto. E dall\'alto arrivano cose strane.']
  },
  {
    id: 'all-lab1-12', classe: 'Ricercatore di campo', nome: 'Galeazzo', zona: 'Lab CoTrAL #1',
    lat: 41.7732, lon: 12.6545, premioSoldi: 1160,
    squadra: [{ id: 55, livello: 29 }, { id: 82, livello: 29 }], // Golduck, Magneton
    dialogoIntro: ['Raccolgo campioni sul territorio. E difendo il laboratorio dagli intrusi!'],
    dialogoSconfitta: 'Campione difettoso.',
    dialogoDopo: ['Ho trovato tracce strane vicino al lago. Come se qualcosa si fosse mosso in profondità.']
  },
  {
    id: 'all-lab1-13', classe: 'Scienziata psicotica', nome: 'Lucrezia', zona: 'Lab CoTrAL #1',
    lat: 41.7742, lon: 12.6550, premioSoldi: 1180,
    squadra: [{ id: 97, livello: 29 }, { id: 65, livello: 29 }], // Hypno, Alakazam
    dialogoIntro: ['La scienza richiede sacrifici. E io sono disposta a tutto! ANCHE A BUTTARTI FUORI!'],
    dialogoSconfitta: 'Esperimento fallito.',
    dialogoDopo: ['Il progetto è avanzato. Sento vibrazioni sotto i piedi. Non è il trattore.']
  },
  {
    id: 'all-lab1-14', classe: 'Capo della sicurezza', nome: 'Settimio', zona: 'Lab CoTrAL #1',
    lat: 41.7712, lon: 12.6548, premioSoldi: 1220,
    squadra: [{ id: 229, livello: 30 }, { id: 262, livello: 30 }], // Houndoom, Mightyena
    dialogoIntro: ['Ho gestito la sicurezza di tre laboratori. Non ho mai avuto violazioni. FINO A ORA.'],
    dialogoSconfitta: 'Prima violazione in carriera.',
    dialogoDopo: ['Non so cosa cercate qui. Ma se avete trovato qualcosa, scappate prima che arrivi il Comandante.']
  },
  {
    id: 'all-lab1-15', classe: 'Responsabile progetto', nome: 'Admin Fulvia', zona: 'Lab CoTrAL #1',
    lat: 41.7700, lon: 12.6550, premioSoldi: 1400,
    squadra: [{ id: 130, livello: 30 }, { id: 55, livello: 29 }, { id: 65, livello: 30 }], // Gyarados, Golduck, Alakazam
    dialogoIntro: ['Io sono Fulvia. L\'acqua è il mio elemento. E questo laboratorio è il mio territorio!'],
    dialogoSconfitta: 'L\'acqua ritratta.',
    dialogoDopo: ['Il Comandante Crasso non sarà contento. Ma noi siamo già un passo avanti. Kyogre ci aspetta.']
  },

  // ── Via Albano → Ariccia (Lv 36-42, pre-Buio) ──
  {
    id: 'all-aa-1', classe: 'Runner notturno', nome: 'Callisto', zona: 'Via Albano-Ariccia',
    lat: 41.7290, lon: 12.6620, premioSoldi: 1560,
    squadra: [{ id: 228, livello: 36 }, { id: 261, livello: 37 }], // Houndour, Poochyena
    dialogoIntro: ['Corro di notte su questa strada. Il buio è il mio habitat!'],
    dialogoSconfitta: 'Notte fonda.',
    dialogoDopo: ['Ariccia di sera è magia. Il ponte è inquietante. Ma bellissimo.']
  },
  {
    id: 'all-aa-2', classe: 'Custode del Ponte', nome: 'Orfeo', zona: 'Via Albano-Ariccia',
    lat: 41.7260, lon: 12.6640, premioSoldi: 1620,
    squadra: [{ id: 262, livello: 38 }, { id: 302, livello: 38 }], // Mightyena, Sableye
    dialogoIntro: ['Guardo il Ponte di Ariccia da anni. Di notte non si passa senza lottare!'],
    dialogoSconfitta: 'Il ponte ti appartiene.',
    dialogoDopo: ['Di notte le ombre del ponte sembrano muoversi. Non sono solo effetti visivi.']
  },
  {
    id: 'all-aa-3', classe: 'Contrabbandiere', nome: 'Oreste', zona: 'Via Albano-Ariccia',
    lat: 41.7240, lon: 12.6660, premioSoldi: 1680,
    squadra: [{ id: 215, livello: 39 }, { id: 229, livello: 39 }], // Sneasel, Houndoom
    dialogoIntro: ['Passo di qui di notte con i miei carichi. E non ti faccio domande se non me le fai!'],
    dialogoSconfitta: 'Carico perso.',
    dialogoDopo: ['Tieni gli occhi aperti sul ponte. Non tutto quello che si vede è reale. E non tutto quello che è reale si vede.']
  },
  {
    id: 'all-aa-4', classe: 'Turista avventuroso', nome: 'Franz', zona: 'Via Albano-Ariccia',
    lat: 41.7225, lon: 12.6690, premioSoldi: 1720,
    squadra: [{ id: 197, livello: 40 }, { id: 261, livello: 40 }], // Umbreon, Poochyena
    dialogoIntro: ['Ho attraversato i boschi di notte in Germania, in Scozia… ora Ariccia. Magnifico!'],
    dialogoSconfitta: 'La migliore avventura fin qui.',
    dialogoDopo: ['Il ponte monumentale di Ariccia è del 1847. I Pokémon Buio ci abitano da più tempo.']
  },
  {
    id: 'all-aa-5', classe: 'Fotografo notturno', nome: 'Corrado', zona: 'Via Albano-Ariccia',
    lat: 41.7215, lon: 12.6710, premioSoldi: 1780,
    squadra: [{ id: 262, livello: 41 }, { id: 359, livello: 42 }], // Mightyena, Absol
    dialogoIntro: ['Fotografo i Pokémon di notte. Sul ponte di Ariccia si vedono cose bellissime e inquietanti!'],
    dialogoSconfitta: 'Scatto perfetto: la mia sconfitta.',
    dialogoDopo: ['Ho fotografato un Absol sul ponte. Poi mi è venuta la rogna per tre giorni. Coincidenza, forse.']
  },

  // ── Lab CoTrAL #2 (periferia Albano, Lv 40-50, scienziati avanzati) ──
  {
    id: 'all-lab2-1', classe: 'Tecnico senior', nome: 'Teodoro', zona: 'Lab CoTrAL #2',
    lat: 41.7350, lon: 12.6490, premioSoldi: 1800,
    squadra: [{ id: 82, livello: 40 }, { id: 101, livello: 41 }], // Magneton, Electrode
    dialogoIntro: ['Laboratorio di secondo livello. Sicurezza massima. Devi andartene subito!'],
    dialogoSconfitta: 'Sicurezza perforata.',
    dialogoDopo: ['Non avrei dovuto farti passare. Ma ti sei guadagnato il diritto.']
  },
  {
    id: 'all-lab2-2', classe: 'Scienziata', nome: 'Lavinia', zona: 'Lab CoTrAL #2',
    lat: 41.7360, lon: 12.6500, premioSoldi: 1840,
    squadra: [{ id: 65, livello: 41 }, { id: 103, livello: 42 }], // Alakazam, Exeggutor
    dialogoIntro: ['Studio i Pokémon psichici per estrarne le capacità genetiche. Vattene prima che ti studii!'],
    dialogoSconfitta: 'Soggetto inatteso.',
    dialogoDopo: ['Il "Progetto 150" non è quello che sembra. È più grande. E più pericoloso.']
  },
  {
    id: 'all-lab2-3', classe: 'Guardia d\'élite', nome: 'Caio', zona: 'Lab CoTrAL #2',
    lat: 41.7345, lon: 12.6505, premioSoldi: 1880,
    squadra: [{ id: 229, livello: 42 }, { id: 330, livello: 42 }], // Houndoom, Flygon
    dialogoIntro: ['Guardia d\'élite: i migliori Pokémon, i migliori riflessi, nessuna pietà!'],
    dialogoSconfitta: 'Élite sconfitta.',
    dialogoDopo: ['Non entri nei laboratori profondi. Ma hai già visto troppo.']
  },
  {
    id: 'all-lab2-4', classe: 'Ricercatore di genetica', nome: 'Publio', zona: 'Lab CoTrAL #2',
    lat: 41.7335, lon: 12.6498, premioSoldi: 1920,
    squadra: [{ id: 201, livello: 43 }, { id: 65, livello: 43 }], // Unown, Alakazam
    dialogoIntro: ['Leggo la sequenza genetica dei Pokémon come un libro. Il tuo parla di potere!'],
    dialogoSconfitta: 'Capitolo inatteso.',
    dialogoDopo: ['Gli Unown custodiscono segreti antichi. Li usiamo per decodificare i geni dei leggendari.']
  },
  {
    id: 'all-lab2-5', classe: 'Chimico organico', nome: 'Arnoldo', zona: 'Lab CoTrAL #2',
    lat: 41.7340, lon: 12.6510, premioSoldi: 1960,
    squadra: [{ id: 101, livello: 43 }, { id: 82, livello: 44 }], // Electrode, Magneton
    dialogoIntro: ['Sintetizzo sostanze che amplificano i poteri dei Pokémon. Attento: esplodono.'],
    dialogoSconfitta: 'Reazione esplosiva imprevista.',
    dialogoDopo: ['Hai resistito all\'esplosione. Sei più resistente di quanto pensassi.']
  },
  {
    id: 'all-lab2-6', classe: 'Progettista di laboratorio', nome: 'Tito', zona: 'Lab CoTrAL #2',
    lat: 41.7355, lon: 12.6508, premioSoldi: 2000,
    squadra: [{ id: 55, livello: 44 }, { id: 120, livello: 45 }], // Golduck, Staryu
    dialogoIntro: ['Ho progettato questo laboratorio per essere impenetrabile. E quasi ci sono riuscito!'],
    dialogoSconfitta: 'Un difetto nel progetto.',
    dialogoDopo: ['Sotto questo laboratorio c\'è un\'altra struttura. Non l\'ho progettata io.']
  },
  {
    id: 'all-lab2-7', classe: 'Neuroscienziata', nome: 'Filomena', zona: 'Lab CoTrAL #2',
    lat: 41.7365, lon: 12.6512, premioSoldi: 2040,
    squadra: [{ id: 97, livello: 44 }, { id: 199, livello: 45 }], // Hypno, Slowking
    dialogoIntro: ['Studio i pattern cerebrali dei Pokémon Psico per replicarli. La mente è il confine!'],
    dialogoSconfitta: 'Pattern anomalo rilevato: te.',
    dialogoDopo: ['Il "soggetto 150" ha un pattern che non riusciamo a replicare. Come se fosse… impossibile.']
  },
  {
    id: 'all-lab2-8', classe: 'Soldato CoTrAL', nome: 'Aculeo', zona: 'Lab CoTrAL #2',
    lat: 41.7328, lon: 12.6502, premioSoldi: 2080,
    squadra: [{ id: 262, livello: 45 }, { id: 359, livello: 45 }], // Mightyena, Absol
    dialogoIntro: ['Il Team CoTrAL protegge il futuro. E il futuro non include te!'],
    dialogoSconfitta: 'Il futuro è incerto.',
    dialogoDopo: ['Siamo una cooperativa di trasporti. Fermamente. Non fare domande.']
  },
  {
    id: 'all-lab2-9', classe: 'Ingegnere genetica', nome: 'Servilia', zona: 'Lab CoTrAL #2',
    lat: 41.7372, lon: 12.6495, premioSoldi: 2120,
    squadra: [{ id: 103, livello: 46 }, { id: 65, livello: 46 }], // Exeggutor, Alakazam
    dialogoIntro: ['Modifico la sequenza genetica dei Pokémon per potenziarli. E potenzio anche la mia lotta!'],
    dialogoSconfitta: 'Sequenza modificata dalla sconfitta.',
    dialogoDopo: ['Il "Progetto 150" usa DNA di un Pokémon… non so quale. Ma so che è leggendario.']
  },
  {
    id: 'all-lab2-10', classe: 'Supervisore di reparto', nome: 'Marcello', zona: 'Lab CoTrAL #2',
    lat: 41.7338, lon: 12.6512, premioSoldi: 2160,
    squadra: [{ id: 310, livello: 46 }, { id: 101, livello: 47 }], // Manectric, Electrode
    dialogoIntro: ['Supervisionò tre reparti simultaneamente. E combatto su tre fronti!'],
    dialogoSconfitta: 'Un fronte ceduto.',
    dialogoDopo: ['I reparti profondi sono blindati. Solo i vertici entrano. Il direttore non vedo da settimane.']
  },
  {
    id: 'all-lab2-11', classe: 'Veterana del progetto', nome: 'Violante', zona: 'Lab CoTrAL #2',
    lat: 41.7362, lon: 12.6500, premioSoldi: 2200,
    squadra: [{ id: 229, livello: 47 }, { id: 55, livello: 47 }], // Houndoom, Golduck
    dialogoIntro: ['Lavoro al Progetto 150 dall\'inizio. Ho visto cose che non posso raccontare. Ma posso lottare!'],
    dialogoSconfitta: 'Una cosa in più che non posso raccontare.',
    dialogoDopo: ['Il soggetto al piano più basso è… cambiato. Non risponde più agli ordini. Scappate.']
  },
  {
    id: 'all-lab2-12', classe: 'Tecnico di sicurezza', nome: 'Brennio', zona: 'Lab CoTrAL #2',
    lat: 41.7330, lon: 12.6506, premioSoldi: 2240,
    squadra: [{ id: 302, livello: 47 }, { id: 262, livello: 48 }], // Sableye, Mightyena
    dialogoIntro: ['Sistemi di sicurezza al massimo. Non si passa!'],
    dialogoSconfitta: 'Override del sistema.',
    dialogoDopo: ['Sei il primo a sfondare la sicurezza. Forse sei abbastanza forte per capire cosa c\'è là in fondo.']
  },
  {
    id: 'all-lab2-13', classe: 'Dottoressa', nome: 'Sempronia', zona: 'Lab CoTrAL #2',
    lat: 41.7370, lon: 12.6504, premioSoldi: 2280,
    squadra: [{ id: 65, livello: 48 }, { id: 103, livello: 48 }], // Alakazam, Exeggutor
    dialogoIntro: ['Dottorata in biologia dei Pokémon Psico. Il mio curriculum vale più della tua avventura!'],
    dialogoSconfitta: 'Il curriculum si aggiorna.',
    dialogoDopo: ['Ho estratto DNA da un Pokémon che non esiste in natura. Il Progetto 150 è avanzato troppo.']
  },
  {
    id: 'all-lab2-14', classe: 'Admin Tarcisio', nome: 'Tarcisio', zona: 'Lab CoTrAL #2',
    lat: 41.7320, lon: 12.6498, premioSoldi: 2400,
    squadra: [{ id: 383, livello: 49 }, { id: 323, livello: 48 }, { id: 76, livello: 48 }], // Groudon, Camerupt, Golem
    dialogoIntro: ['Io sono Tarcisio, Admin del Team GdF! La terra è il mio potere! NON PUOI VINCERE!'],
    dialogoSconfitta: 'La terra cede.',
    dialogoDopo: ['Crasso… Crasso non si aspettava di essere fermato. Troverai le Sfere. Vai.']
  },
  {
    id: 'all-lab2-15', classe: 'Comandante GdF', nome: 'Crasso', zona: 'Lab CoTrAL #2',
    lat: 41.7315, lon: 12.6494, premioSoldi: 2800,
    squadra: [{ id: 130, livello: 50 }, { id: 383, livello: 50 }, { id: 65, livello: 49 }], // Gyarados, Groudon, Alakazam
    dialogoIntro: [
      'Comandante Crasso del Team GdF. Kyogre e Groudon risponderanno a ME.',
      'Ho le Sfere di Nemi. Ho i laboratori. Ho gli Admin. Tu cosa hai?',
      'Niente potrà fermare il nostro piano!',
    ],
    dialogoSconfitta: 'Il Comandante… arrestato.',
    dialogoDopo: ['L\'ambizione era grande. Ma la terra e l\'acqua non si controllano con la forza. Hai vinto, ragazzo.'],
    // Segnala la fine del GdF: app.js legge questo campo dopo la vittoria
    flagVittoria: 'gdFSconfitto',
    dialogoVittoriaPost: [
      '🔷 Il Team GdF è sconfitto!',
      'Le forze dell\'ordine hanno arrestato il Comandante Crasso.',
      'Le Sfere del Museo di Nemi sono state recuperate.',
      'Kyogre e Groudon dormono nei loro anfratti… per ora.',
      'Ma qualcuno ha parlato di un\'altra organizzazione nell\'ombra. Si chiama CoTrAL.',
    ],
  },
  {
    id: 'all-lab2-16', classe: 'Guardia residua', nome: 'Terzo', zona: 'Lab CoTrAL #2',
    lat: 41.7342, lon: 12.6518, premioSoldi: 2000,
    squadra: [{ id: 229, livello: 48 }, { id: 262, livello: 48 }], // Houndoom, Mightyena
    dialogoIntro: ['Anche se il Comandante è caduto, io resto al mio posto!'],
    dialogoSconfitta: 'La fedeltà ha un limite.',
    dialogoDopo: ['Il Lab è sgomberato. Ma il vero pericolo era altrove. E forse è ancora là.']
  },
  {
    id: 'all-lab2-17', classe: 'Agente GdF', nome: 'Quarto', zona: 'Lab CoTrAL #2',
    lat: 41.7335, lon: 12.6520, premioSoldi: 2100,
    squadra: [{ id: 310, livello: 47 }, { id: 229, livello: 48 }], // Manectric, Houndoom
    dialogoIntro: ['I resti del Team GdF non si arrendono facilmente!'],
    dialogoSconfitta: 'Resa.',
    dialogoDopo: ['Il GdF è finito. Ma c\'è un\'altra organizzazione nell\'ombra. Si chiama CoTrAL.']
  },

  // ── Sentiero Innevato verso Articuno (locked-funivia, Lv 36-44) ──
  {
    id: 'all-neve-1', classe: 'Alpinista invernale', nome: 'Gelindo', zona: 'Sentiero Innevato',
    lat: 41.7470, lon: 12.7120, premioSoldi: 1800,
    squadra: [{ id: 86, livello: 36 }, { id: 220, livello: 37 }], // Seel, Swinub
    dialogoIntro: ['Scala quassù in inverno fa un freddo da morire. I miei Pokémon di Ghiaccio si sentono a casa!'],
    dialogoSconfitta: 'Freddo pungente.',
    dialogoDopo: ['Più su fa ancora più freddo. Porta un cappotto.']
  },
  {
    id: 'all-neve-2', classe: 'Sciatore', nome: 'Olimpia', zona: 'Sentiero Innevato',
    lat: 41.7480, lon: 12.7135, premioSoldi: 1860,
    squadra: [{ id: 87, livello: 38 }, { id: 124, livello: 38 }], // Dewgong, Jynx
    dialogoIntro: ['Scio su questi pendii d\'estate! Con i Pokémon Ghiaccio, naturalmente.'],
    dialogoSconfitta: 'Fuoripista.',
    dialogoDopo: ['Jynx porta il gelo. E il gelo porta Articuno, dice la leggenda.']
  },
  {
    id: 'all-neve-3', classe: 'Ricercatore glaciale', nome: 'Oreste', zona: 'Sentiero Innevato',
    lat: 41.7490, lon: 12.7148, premioSoldi: 1940,
    squadra: [{ id: 215, livello: 39 }, { id: 87, livello: 40 }], // Sneasel, Dewgong
    dialogoIntro: ['Studio i ghiacciai del Maschio delle Faete. Incredibile trovarne uno in Lazio!'],
    dialogoSconfitta: 'Campione scivolato.',
    dialogoDopo: ['Il gelo qui è artificiale. Come se qualcosa di potente lo generasse.']
  },
  {
    id: 'all-neve-4', classe: 'Guida montana', nome: 'Annibale', zona: 'Sentiero Innevato',
    lat: 41.7505, lon: 12.7155, premioSoldi: 2020,
    squadra: [{ id: 220, livello: 40 }, { id: 215, livello: 41 }], // Swinub, Sneasel
    dialogoIntro: ['Porto le escursioni in quota. E chiunque supera il passo, lotta con me!'],
    dialogoSconfitta: 'Il passo è aperto.',
    dialogoDopo: ['In cima il cielo è cristallino. E di notte si sente un vento che non sembra naturale.']
  },
  {
    id: 'all-neve-5', classe: 'Esploratore polare', nome: 'Sigfrido', zona: 'Sentiero Innevato',
    lat: 41.7520, lon: 12.7158, premioSoldi: 2120,
    squadra: [{ id: 225, livello: 41 }, { id: 87, livello: 42 }], // Delibird, Dewgong
    dialogoIntro: ['Ho esplorato l\'Antartide. Questo è troppo piccolo per me. Ma i Pokémon sono forti!'],
    dialogoSconfitta: 'Piccolo ma potente.',
    dialogoDopo: ['Lassù in cima vive qualcosa di antico. Porta una Poké Ball di Alta qualità.']
  },
  {
    id: 'all-neve-6', classe: 'Custode del gelo', nome: 'Isolde', zona: 'Sentiero Innevato',
    lat: 41.7535, lon: 12.7165, premioSoldi: 2260,
    squadra: [{ id: 124, livello: 42 }, { id: 225, livello: 43 }, { id: 86, livello: 43 }], // Jynx, Delibird, Seel
    dialogoIntro: ['Custodisco questo sentiero innevato. Chi vuole raggiungere la cima, supera me!'],
    dialogoSconfitta: 'Il gelo ti appartiene.',
    dialogoDopo: ['Articuno vive in cima. Non disturbarla se non sei pronto. E non portare Pokémon di Fuoco: è scortese.']
  },

  // ── GdF Grunts — pattuglie sul territorio dopo il furto al Museo (F10) ──
  {
    id: 'gdf-grunt-1', classe: 'Agente GdF', nome: 'Verdi', zona: 'Sentiero verso Nemi',
    lat: 41.7238, lon: 12.7074, premioSoldi: 1200,
    squadra: [{ id: 130, livello: 24 }, { id: 60, livello: 23 }], // Gyarados, Poliwag
    dialogoIntro: [
      'Alto là! Zona di sicurezza del Team GdF!',
      'Le Sfere sono in mani sicure. Muoviti.',
    ],
    dialogoSconfitta: 'Il perimetro è violato.',
    dialogoDopo: ['Il Comandante Crasso non la prenderà bene. Ma tu hai già vinto: vai avanti se osi.'],
  },
  {
    id: 'gdf-grunt-2', classe: 'Agente GdF', nome: 'Rossi', zona: 'Nei pressi del Lago di Nemi',
    lat: 41.7180, lon: 12.7150, premioSoldi: 1240,
    squadra: [{ id: 55, livello: 25 }, { id: 271, livello: 24 }], // Golduck, Lombre
    dialogoIntro: [
      'Il Lago di Nemi è proprietà del Team GdF!',
      'Le Sfere che stavano nel Museo sono al sicuro con noi.',
    ],
    dialogoSconfitta: 'Rientro al base.',
    dialogoDopo: ['Il piano di Crasso è semplice: le Sfere svegliano i leggendari, i leggendari controllano il meteo, il meteo controlla l\'economia. Un bel piano, se non fossi qui a rovinarlo.'],
  },
  {
    id: 'gdf-grunt-3', classe: 'Operativa GdF', nome: 'Bianchi', zona: 'Campagna verso Marino',
    lat: 41.7456, lon: 12.6784, premioSoldi: 1280,
    squadra: [{ id: 55, livello: 26 }, { id: 61, livello: 27 }], // Golduck, Poliwhirl
    dialogoIntro: [
      'L\'Admin Fulvia mi ha ordinato di presidiare questo percorso.',
      'Nessuno entra al laboratorio senza passare per me!',
    ],
    dialogoSconfitta: 'L\'Admin non sarà contenta.',
    dialogoDopo: ['Il Lab #1 è laggiù. Fulvia comanda lì. Ma tu ormai hai già capito tutto.'],
  },
  {
    id: 'gdf-grunt-4', classe: 'Agente GdF', nome: 'Neri', zona: 'Strada Albano-Lab',
    lat: 41.7400, lon: 12.6620, premioSoldi: 1560,
    squadra: [{ id: 130, livello: 34 }, { id: 95, livello: 35 }], // Gyarados, Onix
    dialogoIntro: [
      'L\'Admin Tarcisio ha detto di non far passare nessuno!',
      'Le Sfere vengono attivate tra poco. Kyogre e Groudon si sveglieranno.',
    ],
    dialogoSconfitta: 'La terra ha tremato in modo sbagliato.',
    dialogoDopo: ['Tarcisio è al Lab #2. È più duro di me. Molto più duro.'],
  },
  {
    id: 'gdf-grunt-5', classe: 'Cecchino GdF', nome: 'Marino', zona: 'Avamposto GdF — Genzano',
    lat: 41.7068, lon: 12.6930, premioSoldi: 1800,
    squadra: [{ id: 229, livello: 38 }, { id: 197, livello: 38 }], // Houndoom, Umbreon
    dialogoIntro: [
      'Il Comandante Crasso ha stabilito un avamposto qui a Genzano.',
      'Il piano meteo è quasi completo. Tu non puoi fermarlo!',
    ],
    dialogoSconfitta: 'Avamposto perso.',
    dialogoDopo: ['Crasso è al Lab #2. Vicino ad Albano. Ma stai attento — là dentro ci sono cose che non dimentichi.'],
  },

  // ── VIA VITTORIA — 15 allenatori forti (Lv 55-60) ──────────
  {
    id: 'all-vv-1', classe: 'Guardia d\'élite', nome: 'Manlio', zona: 'Via Vittoria',
    lat: 41.7962, lon: 12.7558, premioSoldi: 5500,
    squadra: [{ id: 93, livello: 55 }, { id: 94, livello: 55 }], // Haunter, Gengar
    dialogoIntro: ['Chi entra nella Via Vittoria sfida il limite. Io sono quel limite.'],
    dialogoSconfitta: 'Il limite è stato superato.',
    dialogoDopo: ['Vai avanti. Gli altri ti aspettano.'],
  },
  {
    id: 'all-vv-2', classe: 'Speleologo esperto', nome: 'Calepodio', zona: 'Via Vittoria',
    lat: 41.7977, lon: 12.7572, premioSoldi: 5600,
    squadra: [{ id: 208, livello: 56 }, { id: 42, livello: 55 }, { id: 75, livello: 55 }], // Steelix, Golbat, Graveler
    dialogoIntro: ['Ho mappato ogni galleria di questa Via. E ogni avversario che ci è entrato.'],
    dialogoSconfitta: 'Punto cieco sulla mappa.',
    dialogoDopo: ['La Via si restringe più avanti. Occhio alla testa.'],
  },
  {
    id: 'all-vv-3', classe: 'Guerriera', nome: 'Claudia', zona: 'Via Vittoria',
    lat: 41.7990, lon: 12.7585, premioSoldi: 5700,
    squadra: [{ id: 68, livello: 56 }, { id: 76, livello: 56 }], // Machamp, Golem
    dialogoIntro: ['Ho sconfitto chiunque abbia provato a passare. Tu sei il prossimo.'],
    dialogoSconfitta: 'Forza riconosciuta.',
    dialogoDopo: ['La forza bruta non basta qui. Ma la tua è qualcosa di più.'],
  },
  {
    id: 'all-vv-4', classe: 'Ranger della Via', nome: 'Vipsania', zona: 'Via Vittoria',
    lat: 41.8000, lon: 12.7600, premioSoldi: 5800,
    squadra: [{ id: 59, livello: 57 }, { id: 78, livello: 56 }], // Arcanine, Rapidash
    dialogoIntro: ['Pattuglio questa Via da anni. Conosco ogni curva e ogni pericolo.'],
    dialogoSconfitta: 'Pattuglia fallita.',
    dialogoDopo: ['Troverai Golbat enormi più avanti. Portati gli Antidoti.'],
  },
  {
    id: 'all-vv-5', classe: 'Tecnico del vuoto', nome: 'Orazio', zona: 'Via Vittoria',
    lat: 41.8010, lon: 12.7612, premioSoldi: 5900,
    squadra: [{ id: 121, livello: 57 }, { id: 101, livello: 56 }, { id: 82, livello: 56 }], // Starmie, Electrode, Magneton
    dialogoIntro: ['Energia elettrica e acqua: i miei elementi. In questa pietraia li amplifico.'],
    dialogoSconfitta: 'Cortocircuito.',
    dialogoDopo: ['Le pareti della Via sono conduttive. Forse è per questo che la pioggia qui dà i brividi.'],
  },
  {
    id: 'all-vv-6', classe: 'Maga dei cristalli', nome: 'Elfrida', zona: 'Via Vittoria',
    lat: 41.8022, lon: 12.7622, premioSoldi: 6000,
    squadra: [{ id: 65, livello: 57 }, { id: 282, livello: 57 }], // Alakazam, Gardevoir
    dialogoIntro: ['In questi cunicoli la mente vaga. La mia è invece ferma come l\'acciaio.'],
    dialogoSconfitta: 'Cristallo infranto.',
    dialogoDopo: ['Una mente limpida è l\'arma migliore contro la Lega.'],
  },
  {
    id: 'all-vv-7', classe: 'Lottatore veterano', nome: 'Trasimeno', zona: 'Via Vittoria',
    lat: 41.8032, lon: 12.7636, premioSoldi: 6100,
    squadra: [{ id: 68, livello: 58 }, { id: 76, livello: 57 }, { id: 130, livello: 57 }], // Machamp, Golem, Gyarados
    dialogoIntro: ['Trent\'anni di lotta. Non ho ancora incontrato nessuno in grado di battermi.'],
    dialogoSconfitta: 'Prima volta. Me lo ricorderò.',
    dialogoDopo: ['Sei il primo. Meriti di arrivare in fondo.'],
  },
  {
    id: 'all-vv-8', classe: 'Dominatore', nome: 'Cesare', zona: 'Via Vittoria',
    lat: 41.8015, lon: 12.7648, premioSoldi: 6200,
    squadra: [{ id: 248, livello: 58 }, { id: 59, livello: 58 }], // Tyranitar, Arcanine
    dialogoIntro: ['Veni, vidi, vici — ma non con te. Questa volta devo davvero combattere.'],
    dialogoSconfitta: 'Vici — tu.',
    dialogoDopo: ['I Superquattro ti faranno a pezzi se non sei concentrato. Io li ho visti.'],
  },
  {
    id: 'all-vv-9', classe: 'Campionessa regionale', nome: 'Galla', zona: 'Via Vittoria',
    lat: 41.8002, lon: 12.7642, premioSoldi: 6300,
    squadra: [{ id: 149, livello: 58 }, { id: 121, livello: 59 }, { id: 101, livello: 58 }], // Dragonite, Starmie, Electrode
    dialogoIntro: ['Sono la campionessa in carica dei Castelli del Nord. Qui nella Via decido chi merita di andare oltre.'],
    dialogoSconfitta: 'Decido: tu meriti.',
    dialogoDopo: ['Tieni squadra curata. La Lega non dà respiri.'],
  },
  {
    id: 'all-vv-10', classe: 'Veterano dei Castelli', nome: 'Romolo', zona: 'Via Vittoria',
    lat: 41.7988, lon: 12.7630, premioSoldi: 6400,
    squadra: [{ id: 112, livello: 59 }, { id: 59, livello: 59 }, { id: 130, livello: 59 }], // Rhydon, Arcanine, Gyarados
    dialogoIntro: ['Mio nonno ha costruito parte di questa Via. Io la difendo. Tu devi guadagnartela.'],
    dialogoSconfitta: 'Il lascito si trasferisce.',
    dialogoDopo: ['La Lega di Colonna è stata fondata sessant\'anni fa. Non è mai stata battuta da qualcuno solo.'],
  },
  {
    id: 'all-vv-11', classe: 'Mago del tempo', nome: 'Ortensia', zona: 'Via Vittoria',
    lat: 41.7970, lon: 12.7618, premioSoldi: 6500,
    squadra: [{ id: 94, livello: 59 }, { id: 65, livello: 59 }, { id: 121, livello: 59 }], // Gengar, Alakazam, Starmie
    dialogoIntro: ['In questa Via il tempo scorre diverso. Ho aspettato un avversario come te per anni.'],
    dialogoSconfitta: 'Il tempo era dalla tua parte oggi.',
    dialogoDopo: ['L\'uscita è in fondo. E poi... Colonna.'],
  },
  {
    id: 'all-vv-12', classe: 'Campionessa dell\'arena', nome: 'Valeria', zona: 'Via Vittoria',
    lat: 41.7955, lon: 12.7608, premioSoldi: 6600,
    squadra: [{ id: 149, livello: 60 }, { id: 68, livello: 59 }, { id: 128, livello: 59 }], // Dragonite, Machamp, Tauros
    dialogoIntro: ['Ho vinto trecento incontri consecutivi nell\'arena. Qui è il trecentounesiomo.'],
    dialogoSconfitta: 'Trecentouno sconfitte. Perfetto.',
    dialogoDopo: ['Dragonite è il più forte che abbia mai allenato. Remo ne ha uno pure lui.'],
  },
  {
    id: 'all-vv-13', classe: 'Duellante', nome: 'Lucrezio', zona: 'Via Vittoria',
    lat: 41.7972, lon: 12.7636, premioSoldi: 6700,
    squadra: [{ id: 76, livello: 59 }, { id: 130, livello: 60 }, { id: 59, livello: 59 }], // Golem, Gyarados, Arcanine
    dialogoIntro: ['Il duello è la forma più alta di rispetto. Iniziamo.'],
    dialogoSconfitta: 'Rispetto massimo.',
    dialogoDopo: ['Non c\'è più niente che ti fermi, ormai.'],
  },
  {
    id: 'all-vv-14', classe: 'Guardiano segreto', nome: 'Gaio', zona: 'Via Vittoria',
    lat: 41.7998, lon: 12.7657, premioSoldi: 6800,
    squadra: [{ id: 94, livello: 60 }, { id: 65, livello: 60 }, { id: 121, livello: 60 }], // Gengar, Alakazam, Starmie
    dialogoIntro: ['Il penultimo ostacolo. Sono qui dal primo giorno della Lega. Pochi arrivano fin qui.'],
    dialogoSconfitta: 'Tu sì che sei arrivato.',
    dialogoDopo: ['L\'uscita è lì. Poi la Lega. Poi Remo.'],
  },
  {
    id: 'all-vv-15', classe: 'Custode della Via', nome: 'Tullio', zona: 'Via Vittoria',
    lat: 41.8028, lon: 12.7656, premioSoldi: 7000,
    squadra: [{ id: 248, livello: 60 }, { id: 76, livello: 60 }, { id: 94, livello: 60 }, { id: 121, livello: 60 }], // Tyranitar, Golem, Gengar, Starmie
    dialogoIntro: [
      'Io sono l\'ultimo guardiano della Via Vittoria.',
      'Ho visto allenatori venire qui per vent\'anni. I più forti della regione.',
      'Nessuno ha mai passato questa porta senza prima passare attraverso me.',
      'Dimostrami che sei diverso da tutti gli altri.'
    ],
    dialogoSconfitta: 'Sei diverso. Vai. La Lega ti aspetta.',
    dialogoDopo: ['Buona fortuna, Campione. Farai la storia dei Castelli Romani.'],
  },
];

/* Nota: qui sotto vengono aggiunti i gregari di palestra (dal gauntlet),
   non elencati in ALLENATORI perché non compaiono come marker sulla mappa. */

/* ----------------------------------------------------------
   MUSEO DELLE NAVI ROMANE DI NEMI (evento F10 — Team GdF)
   Marker evento: il GdF ruba le Sfere davanti al giocatore.
   ---------------------------------------------------------- */
const MUSEO_NAVI = {
  id: 'museo-navi-nemi',
  nome: 'Museo delle Navi Romane',
  luogo: 'Via Diana 13-15, Nemi',
  lat: 41.7196, lon: 12.7018,
  raggioInterazione: 150,
};

/* ----------------------------------------------------------
   LUOGHI LEGGENDARI (F11)
   ---------------------------------------------------------- */

// Funivia di Rocca di Papa — gate narrativo verso il Sentiero Innevato (Articuno)
const FUNIVIA_ROCCA = {
  id: 'funivia-rocca',
  nome: 'Funivia di Rocca di Papa',
  luogo: 'Stazione a valle, Via dei Laghi',
  lat: 41.7617, lon: 12.7125,
  raggioInterazione: 120,
  medaglieMin: 5,
};

// Meteorologo NPC a Monte Porzio Catone — annuncia il giorno del temporale (→ Zapdos)
const METEOROLOGO = {
  id: 'meteorologo-ruggero',
  nome: 'Ruggero il meteorologo',
  comune: 'Monte Porzio Catone',
  lat: 41.8162, lon: 12.7148,
  raggioInterazione: 120,
};

// Tre anfratti del Tuscolo — Trio Regi (enigmi in latino)
const ANFRATTI_REGI = [
  {
    id: 'anfratto-regirock',
    nomeAnfratto: 'Antro del Foro',
    legId: 377,
    livello: 45,
    tipoRichiesto: 'ground',
    tipoNome: 'Terra',
    iscrizione: 'TERRA FUNDAMENTUM OMNIUM.',
    lat: 41.7930, lon: 12.7340,
    raggioInterazione: 80,
  },
  {
    id: 'anfratto-registeel',
    nomeAnfratto: 'Antro del Teatro',
    legId: 379,
    livello: 45,
    tipoRichiesto: 'flying',
    tipoNome: 'Volante',
    iscrizione: 'QUI CAELUM TANGIT INTRAT.',
    lat: 41.7950, lon: 12.7395,
    raggioInterazione: 80,
  },
  {
    id: 'anfratto-regice',
    nomeAnfratto: "Antro dell'Anfiteatro",
    legId: 378,
    livello: 45,
    tipoRichiesto: 'dark',
    tipoNome: 'Buio',
    iscrizione: 'UMBRA OMNIA TEGIT.',
    lat: 41.7910, lon: 12.7415,
    raggioInterazione: 80,
  },
];

/* ----------------------------------------------------------
   VILLA ALDOBRANDINI (post-Lega) — Mew (151) dopo sconfitta Mewtwo
   ---------------------------------------------------------- */
const VILLA_ALDOBRANDINI = {
  id: 'villa-aldobrandini',
  nome: 'Villa Aldobrandini',
  luogo: 'Via Cardinale Massaia, Frascati',
  lat: 41.8043, lon: 12.6820,
  raggioInterazione: 100,
};

/* ----------------------------------------------------------
   PRATONI DEL VIVARO — evento Lugia (post-Lega + Braciere di Nemi)
   ---------------------------------------------------------- */
const PRATONI_VIVARO = {
  id: 'pratoni-vivaro-marker',
  nome: 'Pratoni del Vivaro',
  luogo: 'Altopiano del Vivaro, Rocca di Papa',
  lat: 41.7280, lon: 12.7220,
  raggioInterazione: 150,
};

/* ----------------------------------------------------------
   PONTE DI ARICCIA — evento Ho-Oh (Sagra della Porchetta + alba + Piuma)
   ---------------------------------------------------------- */
const PONTE_ARICCIA = {
  id: 'ponte-ariccia',
  nome: 'Ponte di Ariccia',
  luogo: 'Viadotto Monumentale di Ariccia',
  lat: 41.7195, lon: 12.6660,
  raggioInterazione: 150,
};

/* ----------------------------------------------------------
   PARCHEGGIONE DI GROTTAFERRATA — base di lancio Deoxys (F12b)
   ---------------------------------------------------------- */
const PARCHEGGIONE = {
  id: 'parcheggione-grottaferrata',
  nome: 'Parcheggione di Grottaferrata',
  luogo: 'Parcheggio Via Anagnina — "Stazione Spaziale dei Castelli"',
  lat: 41.7900, lon: 12.6620,
  raggioInterazione: 120,
};

/* ----------------------------------------------------------
   F12 — VIA VITTORIA (gate d'accesso alla Lega)
   ---------------------------------------------------------- */
const VIA_VITTORIA_PORTA = {
  id: 'via-vittoria-porta',
  nome: 'Via Vittoria',
  lat: 41.7970, lon: 12.7470,
  raggioInterazione: 200,
};

/* ----------------------------------------------------------
   F12 — LEGA POKÉMON DI COLONNA
   Quattro Superquattro + Campione Remo.
   Sistema a pool: ogni membro ha 10 specie; a ogni sfida si
   estraggono 6 (5 casuali + coreId sempre per ultimo).
   coreId = specie con BST più alta nel pool.
   ---------------------------------------------------------- */
const SUPERQUATTRO = [
  {
    id: 'sq-captain',
    nome: 'Captain',
    classe: 'Superquattro',
    livMin: 60, livMax: 62,
    premioSoldi: 12000,
    // Tipi: Lotta / Roccia / Buio / Terra
    pool:   [68, 214, 76, 112, 306, 229, 359, 330, 34, 248],
    coreId: 248, // Tyranitar BST 600
    dialogoIntro: [
      'Benvenuto nella prima sala della Lega di Colonna.',
      'Mi chiamano Captain. Ho combattuto in cento arene, sui Castelli e fuori.',
      'I miei Pokémon sono roccia, ombra e terra — come queste colline.',
      'Non passerai senza guadagnartelo.'
    ],
    dialogoSconfitta: 'Impressionante. Ma le prossime sale sono ancora più dure.',
  },
  {
    id: 'sq-pres',
    nome: 'Pres',
    classe: 'Superquattro',
    livMin: 61, livMax: 63,
    premioSoldi: 13000,
    // Tipi: Drago / Elettro / Acqua
    pool:   [149, 373, 334, 181, 135, 26, 130, 350, 121, 131],
    coreId: 149, // Dragonite BST 600
    dialogoIntro: [
      'Seconda sala. Io sono Pres.',
      'Tempeste, maree e draghi — ecco la mia filosofia.',
      'I Castelli sono circondati dall\'acqua e dai fulmini dei temporali estivi.',
      'Vediamo se riesci a resistere alla mia corrente.'
    ],
    dialogoSconfitta: 'Il tuono si è placato. Vai avanti, hai guadagnato il diritto.',
  },
  {
    id: 'sq-dema',
    nome: 'Dema',
    classe: 'Superquattro',
    livMin: 61, livMax: 63,
    premioSoldi: 13000,
    // Tipi: Folletto / Volante / Psico
    pool:   [282, 65, 196, 36, 176, 227, 178, 97, 210, 124],
    coreId: 282, // Gardevoir BST 518
    dialogoIntro: [
      'Terza sala. Sono Dema.',
      'La mente, il vento, l\'incanto — queste sono le mie armi.',
      'Nelle ville dei Castelli ci sono giardini dove la logica non vale.',
      'Lasciati trascinare… o perdi.'
    ],
    dialogoSconfitta: 'La tua mente è più forte della mia magia. Avanti.',
  },
  {
    id: 'sq-marcuois',
    nome: 'Marcuois',
    classe: 'Superquattro',
    livMin: 62, livMax: 64,
    premioSoldi: 14000,
    // Tipi: Acqua / Acciaio / Psico
    pool:   [376, 208, 212, 205, 80, 199, 134, 91, 230, 121],
    coreId: 376, // Metagross BST 600
    dialogoIntro: [
      'Quarta sala. Marcuois.',
      'Acciaio forgiato nell\'acqua, mente fredda come un\'incudine.',
      'Ho aspettato ogni allenatore che è arrivato qui. Pochi hanno passato questa porta.',
      'Sei il prossimo a provarci. Non il prossimo a riuscirci — almeno non ancora.'
    ],
    dialogoSconfitta: 'Acciaio spezzato. Non credevo fosse possibile. Vai dal Campione.',
  },
];

// Starter base → forma finale (per costruire il team di Remo)
const STARTER_FINALE = {
  1: 3,    // Bulbasaur → Venusaur
  4: 6,    // Charmander → Charizard
  7: 9,    // Squirtle → Blastoise
  152: 154, // Chikorita → Meganium
  155: 157, // Cyndaquil → Typhlosion
  158: 160, // Totodile → Feraligatr
  252: 254, // Treecko → Sceptile
  255: 257, // Torchic → Blaziken
  258: 260, // Mudkip → Swampert
};

const REMO_LEGA = {
  id: 'campione-remo',
  nome: 'Remo',
  classe: 'Campione',
  livMin: 64, livMax: 66,
  premioSoldi: 20000,
  // Pool fisso (11 specie); il coreId è lo starter finale di Remo (calcolato in app.js)
  pool: [18, 65, 359, 330, 143, 214, 181, 94, 373, 149, 121],
  // Pidgeot, Alakazam, Absol, Flygon, Snorlax, Heracross, Ampharos, Gengar, Salamence, Dragonite, Starmie
  dialogoIntro: [
    'Eccoti finalmente.',
    'Ho aspettato qui, al trono dei Campioni, dal giorno che ti ho sfidato nel laboratorio.',
    'Ho allenato ogni singolo Pokémon pensando a te. E il mio starter… vedi anche tu com\'è diventato.',
    'Questa è la nostra sfida finale. Non ci sono scuse, non ci sono rivincite.',
    'Mostrami tutto quello che hai imparato da Borgata Tuscolana a qui.'
  ],
  dialogoSconfitta: [
    '…Ho perso.',
    'Non sul serio. Non era possibile.',
    '…',
    'Ok. Hai vinto TU. Sei il nuovo Campione dei Castelli Romani.',
    'Porterò questa sconfitta con me per un bel po\'.',
    '(Remo distoglie lo sguardo per un momento, poi ti stringe la mano)',
    'Complimenti, campione. Sul serio.'
  ],
};

/* ----------------------------------------------------------
   COLORI E NOMI ITALIANI DEI TIPI POKÉMON
   Usati nella schermata di incontro e in battaglia (F5).
   ---------------------------------------------------------- */
const TIPO_COLORI = {
  normal:   '#A8A878',
  fire:     '#F08030',
  water:    '#6890F0',
  electric: '#F8D030',
  grass:    '#78C850',
  ice:      '#98D8D8',
  fighting: '#C03028',
  poison:   '#A040A0',
  ground:   '#E0C068',
  flying:   '#A890F0',
  psychic:  '#F85888',
  bug:      '#A8B820',
  rock:     '#B8A038',
  ghost:    '#705898',
  dragon:   '#7038F8',
  dark:     '#705848',
  steel:    '#B8B8D0',
  fairy:    '#EE99AC',
};

const TIPO_NOMI = {
  normal:   'Normale',
  fire:     'Fuoco',
  water:    'Acqua',
  electric: 'Elettro',
  grass:    'Erba',
  ice:      'Ghiaccio',
  fighting: 'Lotta',
  poison:   'Veleno',
  ground:   'Terra',
  flying:   'Volante',
  psychic:  'Psico',
  bug:      'Coleottero',
  rock:     'Roccia',
  ghost:    'Spettro',
  dragon:   'Drago',
  dark:     'Buio',
  steel:    'Acciaio',
  fairy:    'Folletto',
};

// Icone emoji per ogni tipo di terreno (usate nella HUD)
const TERRENO_ICONE = {
  grotta:   '🌋',
  acqua:    '🌊',
  montagna: '⛰️',
  bosco:    '🌲',
  vigne:    '🍇',
  prato:    '🌿',
  urbano:   '🏘️',
  campagna: '🌾',
  neve:     '❄️',
  interno:  '🏭',
};

/* ----------------------------------------------------------
   TABELLA EFFICACIA TIPI (usata in battaglia, F5)
   Lettura: TABELLA_TIPI[tipoMossa][tipoDifensore] = moltiplicatore.
   Se la coppia non è elencata, il moltiplicatore è 1 (danno normale).
   0 = nessun effetto · 0.5 = poco efficace · 2 = superefficace
   ---------------------------------------------------------- */
const TABELLA_TIPI = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/* ----------------------------------------------------------
   OGGETTI DELLO ZAINO
   categoria:  'ball'  → cattura (bonus = moltiplicatore)
               'cura'  → recupera HP (cura = HP curati)
               'revive'→ risveglia un Pokémon KO (fuori battaglia)
               'repellente' → niente incontri per N passi (campo "passi")
               'test'  → solo modalità test (Caramella Rara)
   prezzo:     costo in Pokéyen al Poké Market (assente = non vendibile).
   NOTA F9.2: lo stato/avvelenamento non esiste ancora nel motore di
   battaglia, quindi gli oggetti "cura stato" (Antidoto, Antiparalisi…)
   citati nella BIBBIA verranno aggiunti quando ci saranno le alterazioni.
   ---------------------------------------------------------- */
const OGGETTI = {
  pokeball:  { nome: 'Poké Ball',  categoria: 'ball', bonus: 1.0, prezzo: 200,  icona: '🔴',
               descrizione: 'Cattura i Pokémon selvatici. Funziona meglio se il bersaglio è indebolito.' },
  superball: { nome: 'Super Ball', categoria: 'ball', bonus: 1.5, prezzo: 600,  icona: '🔵',
               descrizione: 'Ball di qualità superiore: cattura più facilmente della Poké Ball.' },
  ultraball: { nome: 'Ultra Ball', categoria: 'ball', bonus: 2.0, prezzo: 1200, icona: '🟡',
               descrizione: 'La Ball migliore in commercio: alta probabilità di cattura.' },
  pozione:      { nome: 'Pozione',      categoria: 'cura', cura: 20,  prezzo: 300,  icona: '🧪',
               descrizione: 'Fa recuperare 20 HP a un Pokémon della squadra.' },
  superpozione: { nome: 'Superpozione', categoria: 'cura', cura: 50,  prezzo: 700,  icona: '🥤',
               descrizione: 'Fa recuperare 50 HP a un Pokémon della squadra.' },
  iperpozione:  { nome: 'Iperpozione',  categoria: 'cura', cura: 200, prezzo: 1500, icona: '🧴',
               descrizione: 'Fa recuperare 200 HP a un Pokémon della squadra.' },
  revitalizzante: { nome: 'Revitalizzante', categoria: 'revive', prezzo: 1500, icona: '💊',
               descrizione: 'Risveglia un Pokémon esausto (KO) con metà degli HP. Si usa dal menu Zaino.' },
  repellente:  { nome: 'Repellente', categoria: 'repellente', passi: 100, prezzo: 400, icona: '🚷',
               descrizione: 'Tiene lontani i Pokémon selvatici deboli per 100 passi.' },
  // Oggetti cura-stato (ora che il motore di battaglia gestisce le alterazioni)
  antidoto:      { nome: 'Antidoto',        categoria: 'curastato', stato: 'veleno',     prezzo: 100,  icona: '🟢',
               descrizione: 'Guarisce un Pokémon avvelenato.' },
  antiparalisi:  { nome: 'Antiparalisi',    categoria: 'curastato', stato: 'paralisi',   prezzo: 200,  icona: '🟡',
               descrizione: 'Guarisce un Pokémon paralizzato.' },
  antiscottatura:{ nome: 'Antiscottatura',  categoria: 'curastato', stato: 'scottatura', prezzo: 250,  icona: '🔴',
               descrizione: 'Guarisce un Pokémon scottato.' },
  antigelo:      { nome: 'Antigelo',        categoria: 'curastato', stato: 'congelamento', prezzo: 250, icona: '🔵',
               descrizione: 'Scongela un Pokémon congelato.' },
  antidototot:   { nome: 'Antidoto totale', categoria: 'curastato', stato: null,         prezzo: 600,  icona: '⭐',
               descrizione: 'Cura qualsiasi stato alterato (veleno, paralisi, sonno, scottatura, congelamento).' },
  caramellarara: { nome: 'Caramella Rara', categoria: 'test', icona: '🍬',
               descrizione: 'MODALITÀ TEST: +1 livello a un Pokémon (dal menu Squadra, fuori battaglia).' },
};

/* ----------------------------------------------------------
   POKÉ MARKET — un negozio per comune, vicino al Centro Pokémon.
   La merce cresce lungo il path (base → metà → tardo) come da
   BIBBIA-NARRATIVA.md. Il marker 🛒 sulla mappa apre il market;
   si compra anche dal menu ☰ → 🛒 Market (entro RAGGIO_MARKET m).
   "merce" = elenco di chiavi di OGGETTI in vendita.
   ---------------------------------------------------------- */
const POKE_MARKET = [
  // Borgata Tuscolana (partenza): merce base, per equipaggiarsi subito
  { id: 'mk-borgata', comune: 'Borgata Tuscolana', lat: 41.8418, lon: 12.6150,
    merce: ['pokeball', 'pozione'] },

  { id: 'mk-frascati', comune: 'Frascati', lat: 41.8066, lon: 12.6826,
    merce: ['pokeball', 'pozione', 'superpozione'] },

  { id: 'mk-grottaferrata', comune: 'Grottaferrata', lat: 41.7873, lon: 12.6700,
    merce: ['pokeball', 'pozione', 'superpozione', 'antidoto', 'antiparalisi'] },

  { id: 'mk-marino', comune: 'Marino', lat: 41.7700, lon: 12.6653,
    merce: ['pokeball', 'superball', 'pozione', 'superpozione', 'antidoto', 'antiparalisi', 'antiscottatura'] },

  { id: 'mk-monte-porzio', comune: 'Monte Porzio Catone', lat: 41.8150, lon: 12.7178,
    merce: ['pokeball', 'superball', 'superpozione', 'iperpozione', 'antidoto', 'antiparalisi', 'antigelo'] },

  { id: 'mk-rocca-di-papa', comune: 'Rocca di Papa', lat: 41.7620, lon: 12.7118,
    merce: ['superball', 'ultraball', 'superpozione', 'iperpozione', 'revitalizzante', 'antidototot'] },

  { id: 'mk-albano', comune: 'Albano Laziale', lat: 41.7295, lon: 12.6588,
    merce: ['superball', 'ultraball', 'superpozione', 'iperpozione', 'revitalizzante', 'repellente', 'antidototot'] },

  { id: 'mk-ariccia', comune: 'Ariccia', lat: 41.7200, lon: 12.6746,
    merce: ['ultraball', 'iperpozione', 'revitalizzante', 'repellente', 'antidototot'] },

  { id: 'mk-genzano', comune: 'Genzano di Roma', lat: 41.7080, lon: 12.6920,
    merce: ['ultraball', 'iperpozione', 'revitalizzante', 'repellente', 'antidototot'] },
];

// Level cap iniziale: prima di battere la Palestra 1 (Frascati)
// i Pokémon del giocatore non superano il livello 14.
const LEVEL_CAP_INIZIALE = 14;

/* ----------------------------------------------------------
   OGGETTI CHIAVE — non consumabili, non acquistabili, cambiano la trama.
   Salvati in stato.inventario.chiave[id] = true.
   ---------------------------------------------------------- */
const OGGETTI_CHIAVE = {
  'braciere-nemi': {
    nome: 'Braciere di Nemi',
    icona: '🏺',
    descrizione: 'Antico braciere recuperato dai fondali del Lago di Nemi (relitto delle navi di Caligola). Emana un calore arcano che attira esseri leggendari. Serve per la Scampagnata ai Pratoni del Vivaro → Lugia.',
  },
  'piuma-sacra': {
    nome: 'Piuma Sacra',
    icona: '🪶',
    descrizione: 'Una piuma iridescente lasciata da un essere celestiale. Illumina di arancio all\'alba. Richiesta per incontrare Ho-Oh sul Ponte di Ariccia durante la Sagra della Porchetta.',
  },
  'divisa-astronauta': {
    nome: 'Divisa da Astronauta',
    icona: '👨‍🚀',
    descrizione: 'Uniforme della missione spaziale "Castelli nello Spazio". Ti permette di imbarcarti al Parcheggione di Grottaferrata verso la Luna. Richiesta per raggiungere Deoxys.',
  },
};

/* ----------------------------------------------------------
   OGGETTI MAPPA — Pokéball sparse sulla mappa con dentro oggetti,
   come in ogni gioco Pokémon classico.
   Il giocatore le raccoglie automaticamente avvicinandosi (≤40 m).
   tipo: chiave di OGGETTI · quantita: quante se ne ottengono.
   Se chiave: true, va in stato.inventario.chiave[nomeChiave].
   ---------------------------------------------------------- */
const OGGETTI_MAPPA = [
  // ── Percorso Tuscolana (early, Lv 4-8) ──────────────────
  { id: 'obj-001', lat: 41.8360, lon: 12.6298, tipo: 'pokeball',  quantita: 3 },
  { id: 'obj-002', lat: 41.8305, lon: 12.6340, tipo: 'pozione',   quantita: 2 },
  { id: 'obj-003', lat: 41.8258, lon: 12.6398, tipo: 'antidoto',  quantita: 1 },
  { id: 'obj-004', lat: 41.8210, lon: 12.6455, tipo: 'pokeball',  quantita: 2 },

  // ── Vigne di Frascati ───────────────────────────────────
  { id: 'obj-005', lat: 41.8050, lon: 12.6980, tipo: 'superball', quantita: 1 },
  { id: 'obj-006', lat: 41.8020, lon: 12.6920, tipo: 'pozione',   quantita: 3 },
  { id: 'obj-007', lat: 41.8082, lon: 12.7005, tipo: 'pokeball',  quantita: 3 },

  // ── Via Frascati→Grottaferrata ──────────────────────────
  { id: 'obj-008', lat: 41.7970, lon: 12.6762, tipo: 'pokeball',    quantita: 2 },
  { id: 'obj-009', lat: 41.7940, lon: 12.6752, tipo: 'superpozione', quantita: 1 },
  { id: 'obj-010', lat: 41.7960, lon: 12.6780, tipo: 'antidoto',   quantita: 2 },

  // ── Boschi del Tuscolo (dungeon) ────────────────────────
  { id: 'obj-011', lat: 41.7892, lon: 12.7358, tipo: 'superball',    quantita: 2 },
  { id: 'obj-012', lat: 41.7920, lon: 12.7402, tipo: 'superpozione', quantita: 1 },
  { id: 'obj-013', lat: 41.7958, lon: 12.7452, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-014', lat: 41.7942, lon: 12.7482, tipo: 'superball',    quantita: 1 },
  { id: 'obj-015', lat: 41.7900, lon: 12.7432, tipo: 'antidoto',    quantita: 2 },
  { id: 'obj-016', lat: 41.7872, lon: 12.7392, tipo: 'pokeball',    quantita: 3 },

  // ── Boschetto Segreto (post-Taglio) ─────────────────────
  { id: 'obj-017', lat: 41.7842, lon: 12.6792, tipo: 'superball',    quantita: 2 },
  { id: 'obj-018', lat: 41.7812, lon: 12.6758, tipo: 'superpozione', quantita: 1 },
  { id: 'obj-019', lat: 41.7822, lon: 12.6742, tipo: 'repellente',  quantita: 1 },

  // ── Vigne di Marino ─────────────────────────────────────
  { id: 'obj-020', lat: 41.7552, lon: 12.6682, tipo: 'superball', quantita: 1 },
  { id: 'obj-021', lat: 41.7622, lon: 12.6722, tipo: 'pozione',   quantita: 3 },
  { id: 'obj-022', lat: 41.7582, lon: 12.6752, tipo: 'antidoto',  quantita: 2 },

  // ── Via Marino→Monte Porzio ─────────────────────────────
  { id: 'obj-023', lat: 41.7770, lon: 12.6742, tipo: 'superball',    quantita: 1 },
  { id: 'obj-024', lat: 41.7830, lon: 12.6822, tipo: 'superpozione', quantita: 1 },
  { id: 'obj-025', lat: 41.7912, lon: 12.6922, tipo: 'antiparalisi', quantita: 2 },
  { id: 'obj-026', lat: 41.8002, lon: 12.7012, tipo: 'pokeball',    quantita: 2 },

  // ── Via Monte Porzio→Rocca di Papa ──────────────────────
  { id: 'obj-027', lat: 41.8122, lon: 12.7172, tipo: 'ultraball',  quantita: 1 },
  { id: 'obj-028', lat: 41.8102, lon: 12.7152, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-029', lat: 41.8072, lon: 12.7122, tipo: 'antidototot', quantita: 1 },
  { id: 'obj-030', lat: 41.8088, lon: 12.7142, tipo: 'repellente',  quantita: 1 },

  // ── Grotta del Vulcano (dungeon profondo) ───────────────
  { id: 'obj-031', lat: 41.7492, lon: 12.7142, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-032', lat: 41.7502, lon: 12.7158, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-033', lat: 41.7482, lon: 12.7128, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-034', lat: 41.7512, lon: 12.7162, tipo: 'superball',   quantita: 2 },
  { id: 'obj-035', lat: 41.7472, lon: 12.7135, tipo: 'antidototot', quantita: 1 },
  { id: 'obj-036', lat: 41.7488, lon: 12.7148, tipo: 'antigelo',    quantita: 2 },
  { id: 'obj-037', lat: 41.7508, lon: 12.7148, tipo: 'ultraball',   quantita: 1 },

  // ── Lago Albano (richiede Surf) ─────────────────────────
  { id: 'obj-038', lat: 41.7462, lon: 12.6522, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-039', lat: 41.7492, lon: 12.6562, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-040', lat: 41.7512, lon: 12.6532, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-041', lat: 41.7472, lon: 12.6552, tipo: 'superball',   quantita: 2 },

  // ── Lago di Nemi (richiede Surf) — include oggetto chiave ──
  { id: 'obj-042', lat: 41.7152, lon: 12.7122, tipo: 'superball',   quantita: 2 },
  { id: 'obj-043', lat: 41.7182, lon: 12.7142, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-044', lat: 41.7112, lon: 12.7162, tipo: 'ultraball',   quantita: 1 },
  // Braciere di Nemi: oggetto chiave sul fondale del lago (accessibile via Surf)
  { id: 'braciere-nemi', lat: 41.7082, lon: 12.7182, tipo: 'chiave', nomeChiave: 'braciere-nemi' },

  // ── Via Rocca→Albano ────────────────────────────────────
  { id: 'obj-046', lat: 41.7542, lon: 12.7012, tipo: 'superpozione', quantita: 2 },
  { id: 'obj-047', lat: 41.7492, lon: 12.6962, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-048', lat: 41.7442, lon: 12.6892, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-049', lat: 41.7392, lon: 12.6822, tipo: 'antidototot', quantita: 1 },

  // ── Lab CoTrAL #1 ───────────────────────────────────────
  { id: 'obj-050', lat: 41.7722, lon: 12.6548, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-051', lat: 41.7732, lon: 12.6558, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-052', lat: 41.7712, lon: 12.6540, tipo: 'antidototot', quantita: 1 },

  // ── Campagna Ariccia→Genzano ────────────────────────────
  { id: 'obj-053', lat: 41.7272, lon: 12.6652, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-054', lat: 41.7242, lon: 12.6682, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-055', lat: 41.7192, lon: 12.6782, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-056', lat: 41.7158, lon: 12.6842, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-057', lat: 41.7122, lon: 12.6882, tipo: 'repellente',  quantita: 1 },

  // ── Lab CoTrAL #2 ───────────────────────────────────────
  { id: 'obj-058', lat: 41.7362, lon: 12.6512, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-059', lat: 41.7342, lon: 12.6505, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-060', lat: 41.7352, lon: 12.6518, tipo: 'ultraball',   quantita: 1 },

  // ── Monte Cavo ──────────────────────────────────────────
  { id: 'obj-061', lat: 41.7462, lon: 12.7082, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-062', lat: 41.7512, lon: 12.7098, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-063', lat: 41.7548, lon: 12.7088, tipo: 'revitalizzante', quantita: 1 },

  // ── Sentiero Innevato ────────────────────────────────────
  { id: 'obj-064', lat: 41.7452, lon: 12.7168, tipo: 'ultraball',   quantita: 1 },
  { id: 'obj-065', lat: 41.7468, lon: 12.7178, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-066', lat: 41.7448, lon: 12.7158, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-067', lat: 41.7460, lon: 12.7170, tipo: 'antigelo',    quantita: 2 },

  // ── Via Vittoria ─────────────────────────────────────────
  { id: 'obj-068', lat: 41.7998, lon: 12.7592, tipo: 'ultraball',   quantita: 2 },
  { id: 'obj-069', lat: 41.8012, lon: 12.7612, tipo: 'iperpozione', quantita: 1 },
  { id: 'obj-070', lat: 41.7982, lon: 12.7572, tipo: 'revitalizzante', quantita: 1 },
  { id: 'obj-071', lat: 41.8022, lon: 12.7628, tipo: 'antidototot', quantita: 1 },
  { id: 'obj-072', lat: 41.8008, lon: 12.7602, tipo: 'ultraball',   quantita: 1 },

  // ── Pratoni del Vivaro ───────────────────────────────────
  { id: 'obj-073', lat: 41.7292, lon: 12.7232, tipo: 'ultraball',  quantita: 1 },
  { id: 'obj-074', lat: 41.7272, lon: 12.7212, tipo: 'repellente', quantita: 1 },

  // ── Sparsi nei Castelli (collezionabili bonus) ───────────
  { id: 'obj-075', lat: 41.7082, lon: 12.6902, tipo: 'pokeball',    quantita: 2 },
  { id: 'obj-076', lat: 41.7312, lon: 12.6562, tipo: 'superball',   quantita: 1 },
  { id: 'obj-077', lat: 41.7872, lon: 12.6680, tipo: 'antigelo',    quantita: 2 },
  { id: 'obj-078', lat: 41.7692, lon: 12.6632, tipo: 'antiscottatura', quantita: 2 },
  { id: 'obj-079', lat: 41.8162, lon: 12.7152, tipo: 'repellente',  quantita: 1 },
  { id: 'obj-080', lat: 41.8562, lon: 12.7552, tipo: 'iperpozione', quantita: 1 }, // vicino porta Lega
];
