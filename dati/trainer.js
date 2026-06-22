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
    sprite: 'trainer_LEADER_Erika', ritratto: 'LEADER_Erika', vista: 0,
    classe: 'Capopalestra', nome: 'Vinicio',
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
};
