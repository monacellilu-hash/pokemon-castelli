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

};
