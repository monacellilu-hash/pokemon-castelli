/* dati/mappatura_incontri_nuove.js — MAPPATURA COMPLETA 1-386 (sess. 28 set 2026)
   Generato a tavolino da Claude leggendo i dati REALI di Essentials FRLG (PBS/pokemon.txt:
   tipo, catena evolutiva, livello naturale di evoluzione) incrociati con le 40 zone GIA'
   vive in dati/incontri.js (stesse chiavi, stessi range di livello: nessuna zona nuova
   inventata). NON e' collegato al motore: e' un file di PROGETTAZIONE, da copiare a mano
   dentro dati/incontri.js quando si decide di attivare ogni voce (Luca revisiona prima).

   METODO:
   - Escluse dalla piazzatura in natura (elenchi in fondo al file):
       * 22 leggendari + Snorlax -> EVENTO (mai incontro casuale, gia' cosi' nel gioco)
       * 9 specie delle 5 linee di fossili (Omanyte/Omastar, Kabuto/Kabutops, Aerodactyl,
         Lileep/Cradily, Anorith/Armaldo) -> si ottengono SOLO rianimando un fossile
         (Cenciarels, Museo delle Navi), mai in erba alta: non avrebbe senso incontrarle
         anche in natura.
       * 27 specie delle linee starter (base+evoluzioni delle 9 scelte nel laboratorio)
         -> ESCLUSE su richiesta esplicita di Luca, le posiziona lui a mano.
       * Scyther (e Chansey, gia' cosi' nel gioco) -> SOLO Zona Safari.
   - evoluzione = rarita': rate 24 per gli stadi base (comune), 12 per gli stadi
     intermedi, 5 per gli stadi finali (rarissimo) — stesso schema gia' usato nelle 40
     zone esistenti. Unown fa eccezione (non evolve ma resta iconicamente rarissimo: 4).
   - zona: scelta incrociando il TIPO della specie con l'impronta di tipo GIA' presente in
     quella zona (calcolata dalle specie che ci sono gia'), col vincolo che il livello
     naturale di evoluzione della specie NON superi (con un po' di margine) il livello
     massimo della zona — cosi' una forma evoluta non compare mai troppo presto. Tra le
     zone piu' adatte si sceglie quella con meno specie nuove assegnate finora, per non
     accumulare tutto in 2-3 zone. Gli stadi base (Zubat-style) possono ricadere ANCHE in
     zone avanzate, non solo in quelle iniziali — coerente con lo schema gia' in uso.
   - fascia (giorno/notte/sempre): 'notte' per i tipi Buio/Spettro e per alcune specie
     dal nome esplicitamente notturno (gufi, pipistrelli, Umbreon, Sneasel, Murkrow,
     Houndour/Houndoom...); 'giorno' per poche specie solari/diurne (Sunkern/Sunflora,
     Natu/Xatu, Espeon, Ledyba/Ledian...); 'sempre' per tutte le altre (default, la
     maggioranza) — il motore (js/map.js _tentaIncontro) NON legge ancora questo campo:
     va aggiunto quando si vorra' davvero filtrare gli incontri per ora del giorno.

   COPERTURA: 386 specie totali = 208 gia' vive in dati/incontri.js (non toccate qui) +
   129 nuove qui sotto + 22 evento (leggendari/Snorlax) + 9 fossili (evento) + 27 starter
   (esclusi, li posiziona Luca). Indice di controllo specie-per-specie in fondo al file.
*/

const INCONTRI_DA_AGGIUNGERE = {
  // 'acqua_lago di albano_surf' — range attuale della zona: Lv18-28
  'acqua_lago di albano_surf': [
    { id: 59, min: 18, max: 26, rate: 12, fascia: 'sempre' },  // Arcanine
    { id: 99, min: 28, max: 28, rate: 12, fascia: 'sempre' },  // Kingler
    { id: 223, min: 18, max: 26, rate: 24, fascia: 'sempre' },  // Remoraid
    { id: 294, min: 20, max: 28, rate: 12, fascia: 'sempre' },  // Loudred
  ],
  // 'acqua_marino_surf' — range attuale della zona: Lv12-18
  'acqua_marino_surf': [
    { id: 86, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Seel
    { id: 120, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Staryu
    { id: 173, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Cleffa
    { id: 238, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Smoochum
    { id: 358, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Chimecho
  ],
  // 'acqua_tunnel_roccioso_1f_surf' — range attuale della zona: Lv30-36
  'acqua_tunnel_roccioso_1f_surf': [
    { id: 65, min: 32, max: 36, rate: 5, fascia: 'sempre' },  // Alakazam
    { id: 101, min: 30, max: 36, rate: 12, fascia: 'sempre' },  // Electrode
    { id: 279, min: 30, max: 36, rate: 12, fascia: 'sempre' },  // Pelipper
  ],
  // 'incontri albano' — range attuale della zona: Lv40-46
  'incontri albano': [
    { id: 57, min: 40, max: 46, rate: 12, fascia: 'sempre' },  // Primeape
    { id: 297, min: 40, max: 46, rate: 12, fascia: 'sempre' },  // Hariyama
  ],
  // 'incontri ariccia' — range attuale della zona: Lv46-52
  'incontri ariccia': [
    { id: 181, min: 46, max: 52, rate: 5, fascia: 'sempre' },  // Ampharos
    { id: 362, min: 46, max: 52, rate: 12, fascia: 'sempre' },  // Glalie
  ],
  // 'incontri castel gandolfo' — range attuale della zona: Lv16-23
  'incontri castel gandolfo': [
    { id: 33, min: 16, max: 23, rate: 12, fascia: 'sempre' },  // Nidorino
    { id: 64, min: 16, max: 23, rate: 12, fascia: 'sempre' },  // Kadabra
    { id: 196, min: 16, max: 23, rate: 12, fascia: 'giorno' },  // Espeon
    { id: 268, min: 16, max: 23, rate: 12, fascia: 'sempre' },  // Cascoon
  ],
  // 'incontri collegamento cotral' — range attuale della zona: Lv30-36
  'incontri collegamento cotral': [
    { id: 24, min: 30, max: 36, rate: 12, fascia: 'sempre' },  // Arbok
    { id: 124, min: 30, max: 36, rate: 12, fascia: 'sempre' },  // Jynx
    { id: 317, min: 30, max: 36, rate: 12, fascia: 'sempre' },  // Swalot
    { id: 375, min: 30, max: 36, rate: 12, fascia: 'sempre' },  // Metang
  ],
  // 'incontri frascati' — range attuale della zona: Lv4-8
  'incontri frascati': [
    { id: 23, min: 4, max: 8, rate: 24, fascia: 'sempre' },  // Ekans
    { id: 109, min: 4, max: 8, rate: 24, fascia: 'sempre' },  // Koffing
    { id: 114, min: 4, max: 8, rate: 24, fascia: 'sempre' },  // Tangela
    { id: 201, min: 4, max: 8, rate: 4, fascia: 'sempre' },  // Unown
    { id: 280, min: 4, max: 8, rate: 24, fascia: 'sempre' },  // Ralts
    { id: 331, min: 4, max: 8, rate: 24, fascia: 'sempre' },  // Cacnea
  ],
  // 'incontri genzano' — range attuale della zona: Lv55-58
  'incontri genzano': [
    { id: 295, min: 58, max: 58, rate: 5, fascia: 'sempre' },  // Exploud
  ],
  // 'incontri grotta vulcano' — range attuale della zona: Lv46-58
  'incontri grotta vulcano': [
    { id: 31, min: 46, max: 54, rate: 5, fascia: 'sempre' },  // Nidoqueen
    { id: 334, min: 46, max: 54, rate: 12, fascia: 'sempre' },  // Altaria
  ],
  // 'incontri lago albano' — range attuale della zona: Lv15-22
  'incontri lago albano': [
    { id: 35, min: 16, max: 22, rate: 12, fascia: 'sempre' },  // Clefairy
    { id: 107, min: 16, max: 22, rate: 12, fascia: 'sempre' },  // Hitmonchan
    { id: 176, min: 16, max: 22, rate: 12, fascia: 'sempre' },  // Togetic
    { id: 370, min: 15, max: 22, rate: 24, fascia: 'sempre' },  // Luvdisc
  ],
  // 'incontri lago albano profondo' — range attuale della zona: Lv55-68
  'incontri lago albano profondo': [
    { id: 62, min: 55, max: 63, rate: 5, fascia: 'sempre' },  // Poliwrath
    { id: 80, min: 55, max: 63, rate: 12, fascia: 'sempre' },  // Slowbro
    { id: 272, min: 55, max: 63, rate: 5, fascia: 'sempre' },  // Ludicolo
  ],
  // 'incontri marino' — range attuale della zona: Lv12-17
  'incontri marino': [
    { id: 15, min: 17, max: 17, rate: 5, fascia: 'sempre' },  // Beedrill
    { id: 70, min: 17, max: 17, rate: 12, fascia: 'sempre' },  // Weepinbell
    { id: 137, min: 12, max: 17, rate: 24, fascia: 'sempre' },  // Porygon
    { id: 206, min: 12, max: 17, rate: 24, fascia: 'sempre' },  // Dunsparce
    { id: 298, min: 12, max: 17, rate: 24, fascia: 'sempre' },  // Azurill
  ],
  // 'incontri monteporzio' — range attuale della zona: Lv24-30
  'incontri monteporzio': [
    { id: 20, min: 24, max: 30, rate: 12, fascia: 'sempre' },  // Raticate
    { id: 162, min: 24, max: 30, rate: 12, fascia: 'sempre' },  // Furret
    { id: 233, min: 24, max: 30, rate: 12, fascia: 'sempre' },  // Porygon2
    { id: 264, min: 24, max: 30, rate: 12, fascia: 'sempre' },  // Linoone
  ],
  // 'incontri osservatorio' — range attuale della zona: Lv26-32
  'incontri osservatorio': [
    { id: 53, min: 28, max: 32, rate: 12, fascia: 'sempre' },  // Persian
    { id: 178, min: 26, max: 32, rate: 12, fascia: 'giorno' },  // Xatu
    { id: 202, min: 26, max: 32, rate: 12, fascia: 'sempre' },  // Wobbuffet
    { id: 281, min: 26, max: 32, rate: 12, fascia: 'sempre' },  // Kirlia
  ],
  // 'incontri percorso 1' — range attuale della zona: Lv2-6
  'incontri percorso 1': [
    { id: 52, min: 2, max: 6, rate: 24, fascia: 'sempre' },  // Meowth
    { id: 83, min: 2, max: 6, rate: 24, fascia: 'sempre' },  // Farfetch'd
    { id: 122, min: 2, max: 6, rate: 24, fascia: 'sempre' },  // Mr. Mime
    { id: 175, min: 2, max: 6, rate: 24, fascia: 'sempre' },  // Togepi
    { id: 240, min: 2, max: 6, rate: 24, fascia: 'sempre' },  // Magby
    { id: 351, min: 2, max: 6, rate: 24, fascia: 'sempre' },  // Castform
  ],
  // 'incontri percorso 10' — range attuale della zona: Lv53-57
  'incontri percorso 10': [
    { id: 189, min: 53, max: 57, rate: 5, fascia: 'sempre' },  // Jumpluff
  ],
  // 'incontri percorso 11' — range attuale della zona: Lv28-35
  'incontri percorso 11': [
    { id: 126, min: 30, max: 35, rate: 12, fascia: 'sempre' },  // Magmar
    { id: 310, min: 28, max: 35, rate: 12, fascia: 'sempre' },  // Manectric
  ],
  // 'incontri percorso 2' — range attuale della zona: Lv9-13
  'incontri percorso 2': [
    { id: 30, min: 13, max: 13, rate: 12, fascia: 'sempre' },  // Nidorina
    { id: 108, min: 9, max: 13, rate: 24, fascia: 'sempre' },  // Lickitung
    { id: 133, min: 9, max: 13, rate: 24, fascia: 'sempre' },  // Eevee
    { id: 203, min: 9, max: 13, rate: 24, fascia: 'sempre' },  // Girafarig
    { id: 287, min: 9, max: 13, rate: 24, fascia: 'sempre' },  // Slakoth
    { id: 360, min: 9, max: 13, rate: 24, fascia: 'sempre' },  // Wynaut
  ],
  // 'incontri percorso 2 surf' — range attuale della zona: Lv25-35
  'incontri percorso 2 surf': [
    { id: 61, min: 25, max: 33, rate: 12, fascia: 'sempre' },  // Poliwhirl
    { id: 87, min: 34, max: 35, rate: 12, fascia: 'sempre' },  // Dewgong
    { id: 195, min: 25, max: 33, rate: 12, fascia: 'sempre' },  // Quagsire
    { id: 320, min: 25, max: 33, rate: 24, fascia: 'sempre' },  // Wailmer
  ],
  // 'incontri percorso 3' — range attuale della zona: Lv10-16
  'incontri percorso 3': [
    { id: 56, min: 10, max: 16, rate: 24, fascia: 'sempre' },  // Mankey
    { id: 72, min: 10, max: 16, rate: 24, fascia: 'sempre' },  // Tentacool
    { id: 131, min: 10, max: 16, rate: 24, fascia: 'sempre' },  // Lapras
    { id: 226, min: 10, max: 16, rate: 24, fascia: 'sempre' },  // Mantine
    { id: 303, min: 10, max: 16, rate: 24, fascia: 'sempre' },  // Mawile
    { id: 371, min: 10, max: 16, rate: 24, fascia: 'sempre' },  // Bagon
  ],
  // 'incontri percorso 4' — range attuale della zona: Lv12-18
  'incontri percorso 4': [
    { id: 38, min: 16, max: 18, rate: 12, fascia: 'sempre' },  // Ninetales
    { id: 132, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Ditto
    { id: 174, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Igglybuff
    { id: 235, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Smeargle
    { id: 327, min: 12, max: 18, rate: 24, fascia: 'sempre' },  // Spinda
  ],
  // 'incontri percorso 5' — range attuale della zona: Lv16-24
  'incontri percorso 5': [
    { id: 17, min: 18, max: 24, rate: 12, fascia: 'sempre' },  // Pidgeotto
    { id: 106, min: 16, max: 24, rate: 12, fascia: 'sempre' },  // Hitmonlee
    { id: 136, min: 16, max: 24, rate: 12, fascia: 'sempre' },  // Flareon
    { id: 288, min: 18, max: 24, rate: 12, fascia: 'sempre' },  // Vigoroth
    { id: 301, min: 16, max: 24, rate: 12, fascia: 'sempre' },  // Delcatty
  ],
  // 'incontri percorso 7' — range attuale della zona: Lv34-40
  'incontri percorso 7': [
    { id: 40, min: 34, max: 40, rate: 5, fascia: 'sempre' },  // Wigglytuff
    { id: 110, min: 35, max: 40, rate: 12, fascia: 'sempre' },  // Weezing
  ],
  // 'incontri percorso 8' — range attuale della zona: Lv40-46
  'incontri percorso 8': [
    { id: 49, min: 40, max: 46, rate: 12, fascia: 'sempre' },  // Venomoth
    { id: 71, min: 40, max: 46, rate: 5, fascia: 'sempre' },  // Victreebel
  ],
  // 'incontri percorso 9' — range attuale della zona: Lv44-50
  'incontri percorso 9': [
    { id: 94, min: 44, max: 50, rate: 5, fascia: 'notte' },  // Gengar
    { id: 308, min: 44, max: 50, rate: 12, fascia: 'sempre' },  // Medicham
  ],
  // 'incontri percorso montano' — range attuale della zona: Lv30-37
  'incontri percorso montano': [
    { id: 34, min: 32, max: 37, rate: 5, fascia: 'sempre' },  // Nidoking
    { id: 125, min: 30, max: 37, rate: 12, fascia: 'sempre' },  // Electabuzz
  ],
  // 'incontri rocca di papa' — range attuale della zona: Lv32-38
  'incontri rocca di papa': [
    { id: 26, min: 32, max: 38, rate: 5, fascia: 'sempre' },  // Raichu
    { id: 221, min: 33, max: 38, rate: 12, fascia: 'sempre' },  // Piloswine
  ],
  // 'incontri tunnel roccioso 1f' — range attuale della zona: Lv26-29
  'incontri tunnel roccioso 1f': [
    { id: 93, min: 26, max: 29, rate: 12, fascia: 'notte' },  // Haunter
    { id: 210, min: 26, max: 29, rate: 12, fascia: 'sempre' },  // Granbull
  ],
  // 'incontri tunnel roccioso 2f' — range attuale della zona: Lv27-30
  'incontri tunnel roccioso 2f': [
    { id: 97, min: 27, max: 30, rate: 12, fascia: 'notte' },  // Hypno
    { id: 275, min: 30, max: 30, rate: 5, fascia: 'notte' },  // Shiftry
  ],
  // 'incontri tunnel roccioso 3f' — range attuale della zona: Lv29-32
  'incontri tunnel roccioso 3f': [
    { id: 82, min: 30, max: 32, rate: 12, fascia: 'sempre' },  // Magneton
    { id: 148, min: 30, max: 32, rate: 12, fascia: 'sempre' },  // Dragonair
    { id: 372, min: 30, max: 32, rate: 12, fascia: 'sempre' },  // Shelgon
  ],
  // 'incontri tunnel roccioso 4f' — range attuale della zona: Lv32-34
  'incontri tunnel roccioso 4f': [
    { id: 36, min: 32, max: 34, rate: 5, fascia: 'sempre' },  // Clefable
    { id: 326, min: 32, max: 34, rate: 12, fascia: 'sempre' },  // Grumpig
    { id: 332, min: 32, max: 34, rate: 12, fascia: 'notte' },  // Cacturne
  ],
  // 'incontri tuscolo' — range attuale della zona: Lv8-12
  'incontri tuscolo': [
    { id: 12, min: 12, max: 12, rate: 5, fascia: 'sempre' },  // Butterfree
    { id: 103, min: 12, max: 12, rate: 12, fascia: 'sempre' },  // Exeggutor
    { id: 147, min: 8, max: 12, rate: 24, fascia: 'sempre' },  // Dratini
    { id: 207, min: 8, max: 12, rate: 24, fascia: 'sempre' },  // Gligar
    { id: 324, min: 8, max: 12, rate: 24, fascia: 'sempre' },  // Torkoal
    { id: 357, min: 8, max: 12, rate: 24, fascia: 'sempre' },  // Tropius
  ],
  // 'incontri via dei laghi' — range attuale della zona: Lv18-28
  'incontri via dei laghi': [
    { id: 47, min: 24, max: 28, rate: 12, fascia: 'sempre' },  // Parasect
    { id: 135, min: 18, max: 26, rate: 12, fascia: 'sempre' },  // Jolteon
    { id: 212, min: 18, max: 26, rate: 12, fascia: 'sempre' },  // Scizor
    { id: 266, min: 18, max: 26, rate: 12, fascia: 'sempre' },  // Silcoon
  ],
  // 'incontri via vittoria 2f' — range attuale della zona: Lv54-62
  'incontri via vittoria 2f': [
    { id: 73, min: 54, max: 62, rate: 12, fascia: 'sempre' },  // Tentacruel
    { id: 186, min: 54, max: 62, rate: 5, fascia: 'sempre' },  // Politoed
  ],
  // 'incontri via vittoria 3f' — range attuale della zona: Lv54-63
  'incontri via vittoria 3f': [
    { id: 18, min: 54, max: 62, rate: 5, fascia: 'sempre' },  // Pidgeot
    { id: 373, min: 60, max: 63, rate: 5, fascia: 'sempre' },  // Salamence
  ],
  // 'incontri via vittoria 4f' — range attuale della zona: Lv54-63
  'incontri via vittoria 4f': [
    { id: 376, min: 60, max: 63, rate: 5, fascia: 'sempre' },  // Metagross
  ],
  // 'incontri via vittoria 5f' — range attuale della zona: Lv55-63
  'incontri via vittoria 5f': [
    { id: 149, min: 60, max: 63, rate: 5, fascia: 'sempre' },  // Dragonite
    { id: 282, min: 55, max: 63, rate: 5, fascia: 'sempre' },  // Gardevoir
  ],
  // 'incontri zona safari' — range attuale della zona: Lv30-42
  'incontri zona safari': [
    { id: 22, min: 30, max: 38, rate: 12, fascia: 'sempre' },  // Fearow
    { id: 123, min: 30, max: 38, rate: 24, fascia: 'sempre' },  // Scyther
    { id: 242, min: 30, max: 38, rate: 12, fascia: 'sempre' },  // Blissey
    { id: 277, min: 30, max: 38, rate: 12, fascia: 'sempre' },  // Swellow
  ],
};

// Leggendari + Snorlax: mai incontro casuale, sempre evento scriptato (gia' cosi').
const SPECIE_EVENTO = [
  143,  // Snorlax
  144,  // Articuno
  145,  // Zapdos
  146,  // Moltres
  150,  // Mewtwo
  151,  // Mew
  243,  // Raikou
  244,  // Entei
  245,  // Suicune
  249,  // Lugia
  250,  // Ho-Oh
  251,  // Celebi
  377,  // Regirock
  378,  // Regice
  379,  // Registeel
  380,  // Latias
  381,  // Latios
  382,  // Kyogre
  383,  // Groudon
  384,  // Rayquaza
  385,  // Jirachi
  386,  // Deoxys
];

// Fossili: si ottengono SOLO rianimando (Cenciarels/Museo Navi), mai in erba alta.
const SPECIE_FOSSILI = [
  138,  // Omanyte
  139,  // Omastar
  140,  // Kabuto
  141,  // Kabutops
  142,  // Aerodactyl
  345,  // Lileep
  346,  // Cradily
  347,  // Anorith
  348,  // Armaldo
];

// Linee starter: escluse su richiesta di Luca, le posiziona lui.
const SPECIE_STARTER_ESCLUSE = [
  1,  // Bulbasaur
  2,  // Ivysaur
  3,  // Venusaur
  4,  // Charmander
  5,  // Charmeleon
  6,  // Charizard
  7,  // Squirtle
  8,  // Wartortle
  9,  // Blastoise
  152,  // Chikorita
  153,  // Bayleef
  154,  // Meganium
  155,  // Cyndaquil
  156,  // Quilava
  157,  // Typhlosion
  158,  // Totodile
  159,  // Croconaw
  160,  // Feraligatr
  252,  // Treecko
  253,  // Grovyle
  254,  // Sceptile
  255,  // Torchic
  256,  // Combusken
  257,  // Blaziken
  258,  // Mudkip
  259,  // Marshtomp
  260,  // Swampert
];

/* ── INDICE DI CONTROLLO 1-386 (verifica copertura, non serve al motore) ──
     1 Bulbasaur       STARTER (escluso)
     2 Ivysaur         STARTER (escluso)
     3 Venusaur        STARTER (escluso)
     4 Charmander      STARTER (escluso)
     5 Charmeleon      STARTER (escluso)
     6 Charizard       STARTER (escluso)
     7 Squirtle        STARTER (escluso)
     8 Wartortle       STARTER (escluso)
     9 Blastoise       STARTER (escluso)
    10 Caterpie        gia' in dati/incontri.js
    11 Metapod         gia' in dati/incontri.js
    12 Butterfree      NUOVO qui sotto
    13 Weedle          gia' in dati/incontri.js
    14 Kakuna          gia' in dati/incontri.js
    15 Beedrill        NUOVO qui sotto
    16 Pidgey          gia' in dati/incontri.js
    17 Pidgeotto       NUOVO qui sotto
    18 Pidgeot         NUOVO qui sotto
    19 Rattata         gia' in dati/incontri.js
    20 Raticate        NUOVO qui sotto
    21 Spearow         gia' in dati/incontri.js
    22 Fearow          NUOVO qui sotto
    23 Ekans           NUOVO qui sotto
    24 Arbok           NUOVO qui sotto
    25 Pikachu         gia' in dati/incontri.js
    26 Raichu          NUOVO qui sotto
    27 Sandshrew       gia' in dati/incontri.js
    28 Sandslash       gia' in dati/incontri.js
    29 Nidoran♀        gia' in dati/incontri.js
    30 Nidorina        NUOVO qui sotto
    31 Nidoqueen       NUOVO qui sotto
    32 Nidoran♂        gia' in dati/incontri.js
    33 Nidorino        NUOVO qui sotto
    34 Nidoking        NUOVO qui sotto
    35 Clefairy        NUOVO qui sotto
    36 Clefable        NUOVO qui sotto
    37 Vulpix          gia' in dati/incontri.js
    38 Ninetales       NUOVO qui sotto
    39 Jigglypuff      gia' in dati/incontri.js
    40 Wigglytuff      NUOVO qui sotto
    41 Zubat           gia' in dati/incontri.js
    42 Golbat          gia' in dati/incontri.js
    43 Oddish          gia' in dati/incontri.js
    44 Gloom           gia' in dati/incontri.js
    45 Vileplume       gia' in dati/incontri.js
    46 Paras           gia' in dati/incontri.js
    47 Parasect        NUOVO qui sotto
    48 Venonat         gia' in dati/incontri.js
    49 Venomoth        NUOVO qui sotto
    50 Diglett         gia' in dati/incontri.js
    51 Dugtrio         gia' in dati/incontri.js
    52 Meowth          NUOVO qui sotto
    53 Persian         NUOVO qui sotto
    54 Psyduck         gia' in dati/incontri.js
    55 Golduck         gia' in dati/incontri.js
    56 Mankey          NUOVO qui sotto
    57 Primeape        NUOVO qui sotto
    58 Growlithe       gia' in dati/incontri.js
    59 Arcanine        NUOVO qui sotto
    60 Poliwag         gia' in dati/incontri.js
    61 Poliwhirl       NUOVO qui sotto
    62 Poliwrath       NUOVO qui sotto
    63 Abra            gia' in dati/incontri.js
    64 Kadabra         NUOVO qui sotto
    65 Alakazam        NUOVO qui sotto
    66 Machop          gia' in dati/incontri.js
    67 Machoke         gia' in dati/incontri.js
    68 Machamp         gia' in dati/incontri.js
    69 Bellsprout      gia' in dati/incontri.js
    70 Weepinbell      NUOVO qui sotto
    71 Victreebel      NUOVO qui sotto
    72 Tentacool       NUOVO qui sotto
    73 Tentacruel      NUOVO qui sotto
    74 Geodude         gia' in dati/incontri.js
    75 Graveler        gia' in dati/incontri.js
    76 Golem           gia' in dati/incontri.js
    77 Ponyta          gia' in dati/incontri.js
    78 Rapidash        gia' in dati/incontri.js
    79 Slowpoke        gia' in dati/incontri.js
    80 Slowbro         NUOVO qui sotto
    81 Magnemite       gia' in dati/incontri.js
    82 Magneton        NUOVO qui sotto
    83 Farfetch'd      NUOVO qui sotto
    84 Doduo           gia' in dati/incontri.js
    85 Dodrio          gia' in dati/incontri.js
    86 Seel            NUOVO qui sotto
    87 Dewgong         NUOVO qui sotto
    88 Grimer          gia' in dati/incontri.js
    89 Muk             gia' in dati/incontri.js
    90 Shellder        gia' in dati/incontri.js
    91 Cloyster        gia' in dati/incontri.js
    92 Gastly          gia' in dati/incontri.js
    93 Haunter         NUOVO qui sotto
    94 Gengar          NUOVO qui sotto
    95 Onix            gia' in dati/incontri.js
    96 Drowzee         gia' in dati/incontri.js
    97 Hypno           NUOVO qui sotto
    98 Krabby          gia' in dati/incontri.js
    99 Kingler         NUOVO qui sotto
   100 Voltorb         gia' in dati/incontri.js
   101 Electrode       NUOVO qui sotto
   102 Exeggcute       gia' in dati/incontri.js
   103 Exeggutor       NUOVO qui sotto
   104 Cubone          gia' in dati/incontri.js
   105 Marowak         gia' in dati/incontri.js
   106 Hitmonlee       NUOVO qui sotto
   107 Hitmonchan      NUOVO qui sotto
   108 Lickitung       NUOVO qui sotto
   109 Koffing         NUOVO qui sotto
   110 Weezing         NUOVO qui sotto
   111 Rhyhorn         gia' in dati/incontri.js
   112 Rhydon          gia' in dati/incontri.js
   113 Chansey         gia' in dati/incontri.js
   114 Tangela         NUOVO qui sotto
   115 Kangaskhan      gia' in dati/incontri.js
   116 Horsea          gia' in dati/incontri.js
   117 Seadra          gia' in dati/incontri.js
   118 Goldeen         gia' in dati/incontri.js
   119 Seaking         gia' in dati/incontri.js
   120 Staryu          NUOVO qui sotto
   121 Starmie         gia' in dati/incontri.js
   122 Mr. Mime        NUOVO qui sotto
   123 Scyther         NUOVO qui sotto
   124 Jynx            NUOVO qui sotto
   125 Electabuzz      NUOVO qui sotto
   126 Magmar          NUOVO qui sotto
   127 Pinsir          gia' in dati/incontri.js
   128 Tauros          gia' in dati/incontri.js
   129 Magikarp        gia' in dati/incontri.js
   130 Gyarados        gia' in dati/incontri.js
   131 Lapras          NUOVO qui sotto
   132 Ditto           NUOVO qui sotto
   133 Eevee           NUOVO qui sotto
   134 Vaporeon        gia' in dati/incontri.js
   135 Jolteon         NUOVO qui sotto
   136 Flareon         NUOVO qui sotto
   137 Porygon         NUOVO qui sotto
   138 Omanyte         FOSSILE
   139 Omastar         FOSSILE
   140 Kabuto          FOSSILE
   141 Kabutops        FOSSILE
   142 Aerodactyl      FOSSILE
   143 Snorlax         EVENTO
   144 Articuno        EVENTO
   145 Zapdos          EVENTO
   146 Moltres         EVENTO
   147 Dratini         NUOVO qui sotto
   148 Dragonair       NUOVO qui sotto
   149 Dragonite       NUOVO qui sotto
   150 Mewtwo          EVENTO
   151 Mew             EVENTO
   152 Chikorita       STARTER (escluso)
   153 Bayleef         STARTER (escluso)
   154 Meganium        STARTER (escluso)
   155 Cyndaquil       STARTER (escluso)
   156 Quilava         STARTER (escluso)
   157 Typhlosion      STARTER (escluso)
   158 Totodile        STARTER (escluso)
   159 Croconaw        STARTER (escluso)
   160 Feraligatr      STARTER (escluso)
   161 Sentret         gia' in dati/incontri.js
   162 Furret          NUOVO qui sotto
   163 Hoothoot        gia' in dati/incontri.js
   164 Noctowl         gia' in dati/incontri.js
   165 Ledyba          gia' in dati/incontri.js
   166 Ledian          gia' in dati/incontri.js
   167 Spinarak        gia' in dati/incontri.js
   168 Ariados         gia' in dati/incontri.js
   169 Crobat          gia' in dati/incontri.js
   170 Chinchou        gia' in dati/incontri.js
   171 Lanturn         gia' in dati/incontri.js
   172 Pichu           gia' in dati/incontri.js
   173 Cleffa          NUOVO qui sotto
   174 Igglybuff       NUOVO qui sotto
   175 Togepi          NUOVO qui sotto
   176 Togetic         NUOVO qui sotto
   177 Natu            gia' in dati/incontri.js
   178 Xatu            NUOVO qui sotto
   179 Mareep          gia' in dati/incontri.js
   180 Flaaffy         gia' in dati/incontri.js
   181 Ampharos        NUOVO qui sotto
   182 Bellossom       gia' in dati/incontri.js
   183 Marill          gia' in dati/incontri.js
   184 Azumarill       gia' in dati/incontri.js
   185 Sudowoodo       gia' in dati/incontri.js
   186 Politoed        NUOVO qui sotto
   187 Hoppip          gia' in dati/incontri.js
   188 Skiploom        gia' in dati/incontri.js
   189 Jumpluff        NUOVO qui sotto
   190 Aipom           gia' in dati/incontri.js
   191 Sunkern         gia' in dati/incontri.js
   192 Sunflora        gia' in dati/incontri.js
   193 Yanma           gia' in dati/incontri.js
   194 Wooper          gia' in dati/incontri.js
   195 Quagsire        NUOVO qui sotto
   196 Espeon          NUOVO qui sotto
   197 Umbreon         gia' in dati/incontri.js
   198 Murkrow         gia' in dati/incontri.js
   199 Slowking        gia' in dati/incontri.js
   200 Misdreavus      gia' in dati/incontri.js
   201 Unown           NUOVO qui sotto
   202 Wobbuffet       NUOVO qui sotto
   203 Girafarig       NUOVO qui sotto
   204 Pineco          gia' in dati/incontri.js
   205 Forretress      gia' in dati/incontri.js
   206 Dunsparce       NUOVO qui sotto
   207 Gligar          NUOVO qui sotto
   208 Steelix         gia' in dati/incontri.js
   209 Snubbull        gia' in dati/incontri.js
   210 Granbull        NUOVO qui sotto
   211 Qwilfish        gia' in dati/incontri.js
   212 Scizor          NUOVO qui sotto
   213 Shuckle         gia' in dati/incontri.js
   214 Heracross       gia' in dati/incontri.js
   215 Sneasel         gia' in dati/incontri.js
   216 Teddiursa       gia' in dati/incontri.js
   217 Ursaring        gia' in dati/incontri.js
   218 Slugma          gia' in dati/incontri.js
   219 Magcargo        gia' in dati/incontri.js
   220 Swinub          gia' in dati/incontri.js
   221 Piloswine       NUOVO qui sotto
   222 Corsola         gia' in dati/incontri.js
   223 Remoraid        NUOVO qui sotto
   224 Octillery       gia' in dati/incontri.js
   225 Delibird        gia' in dati/incontri.js
   226 Mantine         NUOVO qui sotto
   227 Skarmory        gia' in dati/incontri.js
   228 Houndour        gia' in dati/incontri.js
   229 Houndoom        gia' in dati/incontri.js
   230 Kingdra         gia' in dati/incontri.js
   231 Phanpy          gia' in dati/incontri.js
   232 Donphan         gia' in dati/incontri.js
   233 Porygon2        NUOVO qui sotto
   234 Stantler        gia' in dati/incontri.js
   235 Smeargle        NUOVO qui sotto
   236 Tyrogue         gia' in dati/incontri.js
   237 Hitmontop       gia' in dati/incontri.js
   238 Smoochum        NUOVO qui sotto
   239 Elekid          gia' in dati/incontri.js
   240 Magby           NUOVO qui sotto
   241 Miltank         gia' in dati/incontri.js
   242 Blissey         NUOVO qui sotto
   243 Raikou          EVENTO
   244 Entei           EVENTO
   245 Suicune         EVENTO
   246 Larvitar        gia' in dati/incontri.js
   247 Pupitar         gia' in dati/incontri.js
   248 Tyranitar       gia' in dati/incontri.js
   249 Lugia           EVENTO
   250 Ho-Oh           EVENTO
   251 Celebi          EVENTO
   252 Treecko         STARTER (escluso)
   253 Grovyle         STARTER (escluso)
   254 Sceptile        STARTER (escluso)
   255 Torchic         STARTER (escluso)
   256 Combusken       STARTER (escluso)
   257 Blaziken        STARTER (escluso)
   258 Mudkip          STARTER (escluso)
   259 Marshtomp       STARTER (escluso)
   260 Swampert        STARTER (escluso)
   261 Poochyena       gia' in dati/incontri.js
   262 Mightyena       gia' in dati/incontri.js
   263 Zigzagoon       gia' in dati/incontri.js
   264 Linoone         NUOVO qui sotto
   265 Wurmple         gia' in dati/incontri.js
   266 Silcoon         NUOVO qui sotto
   267 Beautifly       gia' in dati/incontri.js
   268 Cascoon         NUOVO qui sotto
   269 Dustox          gia' in dati/incontri.js
   270 Lotad           gia' in dati/incontri.js
   271 Lombre          gia' in dati/incontri.js
   272 Ludicolo        NUOVO qui sotto
   273 Seedot          gia' in dati/incontri.js
   274 Nuzleaf         gia' in dati/incontri.js
   275 Shiftry         NUOVO qui sotto
   276 Taillow         gia' in dati/incontri.js
   277 Swellow         NUOVO qui sotto
   278 Wingull         gia' in dati/incontri.js
   279 Pelipper        NUOVO qui sotto
   280 Ralts           NUOVO qui sotto
   281 Kirlia          NUOVO qui sotto
   282 Gardevoir       NUOVO qui sotto
   283 Surskit         gia' in dati/incontri.js
   284 Masquerain      gia' in dati/incontri.js
   285 Shroomish       gia' in dati/incontri.js
   286 Breloom         gia' in dati/incontri.js
   287 Slakoth         NUOVO qui sotto
   288 Vigoroth        NUOVO qui sotto
   289 Slaking         gia' in dati/incontri.js
   290 Nincada         gia' in dati/incontri.js
   291 Ninjask         gia' in dati/incontri.js
   292 Shedinja        gia' in dati/incontri.js
   293 Whismur         gia' in dati/incontri.js
   294 Loudred         NUOVO qui sotto
   295 Exploud         NUOVO qui sotto
   296 Makuhita        gia' in dati/incontri.js
   297 Hariyama        NUOVO qui sotto
   298 Azurill         NUOVO qui sotto
   299 Nosepass        gia' in dati/incontri.js
   300 Skitty          gia' in dati/incontri.js
   301 Delcatty        NUOVO qui sotto
   302 Sableye         gia' in dati/incontri.js
   303 Mawile          NUOVO qui sotto
   304 Aron            gia' in dati/incontri.js
   305 Lairon          gia' in dati/incontri.js
   306 Aggron          gia' in dati/incontri.js
   307 Meditite        gia' in dati/incontri.js
   308 Medicham        NUOVO qui sotto
   309 Electrike       gia' in dati/incontri.js
   310 Manectric       NUOVO qui sotto
   311 Plusle          gia' in dati/incontri.js
   312 Minun           gia' in dati/incontri.js
   313 Volbeat         gia' in dati/incontri.js
   314 Illumise        gia' in dati/incontri.js
   315 Roselia         gia' in dati/incontri.js
   316 Gulpin          gia' in dati/incontri.js
   317 Swalot          NUOVO qui sotto
   318 Carvanha        gia' in dati/incontri.js
   319 Sharpedo        gia' in dati/incontri.js
   320 Wailmer         NUOVO qui sotto
   321 Wailord         gia' in dati/incontri.js
   322 Numel           gia' in dati/incontri.js
   323 Camerupt        gia' in dati/incontri.js
   324 Torkoal         NUOVO qui sotto
   325 Spoink          gia' in dati/incontri.js
   326 Grumpig         NUOVO qui sotto
   327 Spinda          NUOVO qui sotto
   328 Trapinch        gia' in dati/incontri.js
   329 Vibrava         gia' in dati/incontri.js
   330 Flygon          gia' in dati/incontri.js
   331 Cacnea          NUOVO qui sotto
   332 Cacturne        NUOVO qui sotto
   333 Swablu          gia' in dati/incontri.js
   334 Altaria         NUOVO qui sotto
   335 Zangoose        gia' in dati/incontri.js
   336 Seviper         gia' in dati/incontri.js
   337 Lunatone        gia' in dati/incontri.js
   338 Solrock         gia' in dati/incontri.js
   339 Barboach        gia' in dati/incontri.js
   340 Whiscash        gia' in dati/incontri.js
   341 Corphish        gia' in dati/incontri.js
   342 Crawdaunt       gia' in dati/incontri.js
   343 Baltoy          gia' in dati/incontri.js
   344 Claydol         gia' in dati/incontri.js
   345 Lileep          FOSSILE
   346 Cradily         FOSSILE
   347 Anorith         FOSSILE
   348 Armaldo         FOSSILE
   349 Feebas          gia' in dati/incontri.js
   350 Milotic         gia' in dati/incontri.js
   351 Castform        NUOVO qui sotto
   352 Kecleon         gia' in dati/incontri.js
   353 Shuppet         gia' in dati/incontri.js
   354 Banette         gia' in dati/incontri.js
   355 Duskull         gia' in dati/incontri.js
   356 Dusclops        gia' in dati/incontri.js
   357 Tropius         NUOVO qui sotto
   358 Chimecho        NUOVO qui sotto
   359 Absol           gia' in dati/incontri.js
   360 Wynaut          NUOVO qui sotto
   361 Snorunt         gia' in dati/incontri.js
   362 Glalie          NUOVO qui sotto
   363 Spheal          gia' in dati/incontri.js
   364 Sealeo          gia' in dati/incontri.js
   365 Walrein         gia' in dati/incontri.js
   366 Clamperl        gia' in dati/incontri.js
   367 Huntail         gia' in dati/incontri.js
   368 Gorebyss        gia' in dati/incontri.js
   369 Relicanth       gia' in dati/incontri.js
   370 Luvdisc         NUOVO qui sotto
   371 Bagon           NUOVO qui sotto
   372 Shelgon         NUOVO qui sotto
   373 Salamence       NUOVO qui sotto
   374 Beldum          gia' in dati/incontri.js
   375 Metang          NUOVO qui sotto
   376 Metagross       NUOVO qui sotto
   377 Regirock        EVENTO
   378 Regice          EVENTO
   379 Registeel       EVENTO
   380 Latias          EVENTO
   381 Latios          EVENTO
   382 Kyogre          EVENTO
   383 Groudon         EVENTO
   384 Rayquaza        EVENTO
   385 Jirachi         EVENTO
   386 Deoxys          EVENTO
*/
