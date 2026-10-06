/* dati/incontri.js — Zone incontri selvatici dalle mappe Tiled
   Chiave = valore della property "id" dell'oggetto zona nel .tmj.
   Formato specie: { id, min, max, rate }
     - min/max : intervallo di livello
     - rate    : peso relativo della specie (opzionale, default 10).
                 Comune ~25-30 · Raro ~8-15 · Rarissimo ~3-5.
   probabilita : % di incontro per casella nell'erba (default 15).

   MOD 3 — Mix Gen 1-2-3 in ogni zona, livelli scalati, starter rarissimi.
   ⭐ OBIETTIVO: tutte le specie 1-386 incontrabili nel gioco → ogni zona nuova
   introduce specie DIVERSE da quelle già usate, con livelli sempre più alti.
   ⭐ Le zone SURF (acqua) sono ANCHE zone di incontri: Pokémon più forti perché
   la MN Surf si sblocca tardi. Il motore (js/map.js, _getTileType) tratta
   OGNI casella acquaSurf come zona incontri in automatico, esattamente come
   l'erba alta: NON serve disegnare un rettangolo "acqua" separato che ricalchi
   ogni trigger_surf. La chiave qui sotto per una zona acqua è semplicemente
   l'"id" già presente sui rettangoli trigger_surf del .tmj (es. "acqua_marino_surf").

   Zone ATTIVE nei .tmj: "incontri percorso 1", "incontri tuscolo",
   "incontri percorso 2" (+ surf), "incontri percorso 3", "incontri marino",
   "acqua_lago di albano_surf" (Lago di Albano), "acqua_marino_surf" (Marino),
   "incontri frascati" (frascati_est), "incontri percorso 4" (Percorso_4),
   "incontri castel gandolfo" (castel_gandolfo), "incontri percorso 5"
   (verificato attivo il 5 ott 2026 — i rettangoli esistono già nei .tmj).
   "incontri lago albano" è aliasata a "incontri lago di albano spiaggia",
   l'id reale già disegnato in "Lago di Albano.tmj" (nome diverso, stessa zona).

   ⭐ DISTRIBUZIONE SPECIE 1-386 (sess. 5 ott 2026): tutte le 281 specie
   "trovabile in natura" secondo docs/CLASSIFICAZIONE-INCONTRI-386.md sono
   ora assegnate ad almeno una zona reale (vedi docs/MAPPA-SPECIE-INCONTRI.md
   per l'elenco completo zona per zona). Famiglie evolutive tenute nella
   stessa zona/pozza quando possibile; i draghi ultra rari (Dratini/
   Dragonair, Bagon/Shelgon, Altaria) sono SOLO nei dungeon (Tunnel
   Roccioso, Via Vittoria), mai nelle zone di superficie.

   ⭐ GIORNO/NOTTE: una zona può avere "pokemonNotte" in aggiunta a
   "pokemon" — se è notte (fasciaOraria()==='notte') e la zona ha un pool
   notturno, si usa quello al posto di quello diurno (vedi js/map.js,
   _tentaIncontro). Oggi implementato su "incontri tuscolo" (Haunter/Unown
   più comuni di notte tra le rovine) e "incontri ariccia" (Umbreon/Absol/
   Sableye più comuni di notte, coerente col tema Buio della città).
*/

const DATI_INCONTRI = {

  // ── LAGO DI ALBANO PROFONDO — sacca sott'acqua raggiungibile solo con MN
  // Sub (Lv 55-68). Zona fitta apposta (probabilita alta): tutto acquatico,
  // niente terrestri/volanti — coerente col fatto che ci si arriva già
  // sommersi, non in superficie. ──
  'incontri lago albano profondo': {
    probabilita: 35,
    pokemon: [
      { id: 130, min: 58, max: 64, rate: 20 },  // Gyarados
      { id: 91,  min: 55, max: 60, rate: 22 },  // Cloyster
      { id: 121, min: 55, max: 61, rate: 22 },  // Starmie
      { id: 171, min: 55, max: 60, rate: 16 },  // Lanturn
      { id: 224, min: 56, max: 61, rate: 14 },  // Octillery
      { id: 211, min: 55, max: 60, rate: 14 },  // Qwilfish
      { id: 340, min: 55, max: 60, rate: 16 },  // Whiscash
      { id: 342, min: 56, max: 62, rate: 14 },  // Crawdaunt
      { id: 319, min: 57, max: 63, rate: 12 },  // Sharpedo
      { id: 367, min: 56, max: 61, rate: 10 },  // Huntail
      { id: 368, min: 56, max: 61, rate: 10 },  // Gorebyss
      { id: 321, min: 60, max: 65, rate: 4 },   // Wailord
      { id: 369, min: 62, max: 68, rate: 3 },   // Relicanth (rarissimo, relitto del passato)
      { id: 131, min: 58, max: 63, rate: 6 },   // Lapras (rara)
      { id: 223, min: 55, max: 60, rate: 20 },  // Remoraid
      { id: 226, min: 56, max: 61, rate: 20 },  // Mantine
      { id: 320, min: 56, max: 62, rate: 16 },  // Wailmer
],
  },

  // ── PERCORSO 1 / 1b — campagna aperta della Via Tuscolana (Lv 2-6) ──
  'incontri percorso 1': {
    probabilita: 15,
    pokemon: [
      { id: 10, min: 2, max: 5, rate: 28 },  // Caterpie
      { id: 13, min: 2, max: 5, rate: 28 },  // Weedle
      { id: 16, min: 2, max: 5, rate: 28 },  // Pidgey
      { id: 19, min: 2, max: 5, rate: 28 },  // Rattata
      { id: 20, min: 5, max: 7, rate: 10 },  // Raticate (evoluto, raro)
      { id: 60, min: 3, max: 5, rate: 22 },  // Poliwag
      { id: 69, min: 3, max: 5, rate: 22 },  // Bellsprout
      { id: 161, min: 2, max: 5, rate: 28 },  // Sentret (Gen2)
      { id: 162, min: 4, max: 6, rate: 10 },  // Furret (evoluto, raro)
      { id: 165, min: 3, max: 5, rate: 28 },  // Ledyba (Gen2)
      { id: 263, min: 3, max: 5, rate: 28 },  // Zigzagoon (Gen3)
      { id: 265, min: 2, max: 5, rate: 28 },  // Wurmple (Gen3)
      { id: 266, min: 3, max: 5, rate: 28 },  // Silcoon (Wurmple evoluto A)
      { id: 268, min: 3, max: 5, rate: 28 },  // Cascoon (Wurmple evoluto B)
      { id: 276, min: 3, max: 6, rate: 28 },  // Taillow (Gen3)
      { id: 277, min: 4, max: 6, rate: 10 },  // Swellow (evoluto, raro)
],
    pokemonNotte: [
      { id: 23, min: 2, max: 5, rate: 22 },  // Ekans
      { id: 29, min: 2, max: 4, rate: 28 },  // Nidoran♀
      { id: 32, min: 2, max: 4, rate: 28 },  // Nidoran♂
      { id: 43, min: 3, max: 5, rate: 22 },  // Oddish
      { id: 163, min: 3, max: 5, rate: 28 },  // Hoothoot (Gen2)
],
  },

  // ── BOSCHI DEL TUSCOLO — bosco fitto + rovine (Lv 8-12) ──
  'incontri tuscolo': {
    probabilita: 15,
    pokemon: [
      { id: 10,  min: 8,  max: 11, rate: 25 },  // Caterpie
      { id: 11,  min: 9,  max: 12, rate: 12 },  // Metapod
      { id: 13,  min: 8,  max: 11, rate: 25 },  // Weedle
      { id: 14,  min: 9,  max: 12, rate: 12 },  // Kakuna
      { id: 43,  min: 8,  max: 12, rate: 20 },  // Oddish
      { id: 69,  min: 8,  max: 12, rate: 20 },  // Bellsprout
      { id: 46,  min: 9,  max: 12, rate: 18 },  // Paras
      { id: 92,  min: 10, max: 12, rate: 12 },  // Gastly (tra le rovine)
      { id: 102, min: 9,  max: 12, rate: 12 },  // Exeggcute
      { id: 74,  min: 9,  max: 12, rate: 18 },  // Geodude (rovine)
      { id: 187, min: 8,  max: 11, rate: 18 },  // Hoppip (Gen2)
      { id: 191, min: 8,  max: 11, rate: 14 },  // Sunkern (Gen2)
      { id: 204, min: 9,  max: 11, rate: 14 },  // Pineco (Gen2)
      { id: 285, min: 8,  max: 11, rate: 18 },  // Shroomish (Gen3)
      { id: 265, min: 8,  max: 10, rate: 16 },  // Wurmple (Gen3)
      { id: 290, min: 8,  max: 10, rate: 14 },  // Nincada (Gen3)
      { id: 283, min: 9,  max: 11, rate: 12 },  // Surskit (Gen3)
      // Celebi: gestito a parte (logica speciale 3% post-Solitario).
      { id: 12,  min: 11, max: 13, rate: 4 },   // Butterfree (evoluto, raro)
      { id: 15,  min: 11, max: 13, rate: 4 },   // Beedrill (evoluto, raro)
      { id: 47,  min: 11, max: 13, rate: 6 },   // Parasect (evoluto)
      { id: 201, min: 10, max: 12, rate: 3 },   // Unown (rovine, raro)
      { id: 206, min: 10, max: 12, rate: 4 },   // Dunsparce (raro)
    ],
    // Incontri notturni (sess. 5 ott 2026): di notte le rovine si popolano
    // di fantasmi — stesso bosco ma con Gastly più comune e Haunter
    // (evoluto) che compare solo col buio, mai di giorno.
    pokemonNotte: [
      { id: 10,  min: 8,  max: 11, rate: 20 },  // Caterpie
      { id: 13,  min: 8,  max: 11, rate: 20 },  // Weedle
      { id: 92,  min: 10, max: 12, rate: 28 },  // Gastly (più comune di notte)
      { id: 93,  min: 11, max: 13, rate: 8 },   // Haunter (evoluto, solo di notte)
      { id: 74,  min: 9,  max: 12, rate: 18 },  // Geodude
      { id: 201, min: 10, max: 12, rate: 6 },   // Unown (più facile di notte tra le rovine)
    ],
  },

  // ── VIGNE DI FRASCATI — erba alta tra i filari (Lv 4-8) ──
  // Pronta per quando frascati_est.tmj esporterà la zona "incontri frascati".
  'incontri frascati': {
    probabilita: 15,
    pokemon: [
      { id: 43, min: 4, max: 6, rate: 22 },  // Oddish
      { id: 46, min: 5, max: 7, rate: 22 },  // Paras
      { id: 83, min: 6, max: 8, rate: 16 },  // Farfetchd (rarissimo, campi coltivati)
      { id: 187, min: 4, max: 7, rate: 28 },  // Hoppip (Gen2)
      { id: 191, min: 5, max: 7, rate: 28 },  // Sunkern (Gen2)
      { id: 285, min: 5, max: 8, rate: 22 },  // Shroomish (Gen3)
      { id: 315, min: 6, max: 8, rate: 10 },  // Roselia (Gen3, rara)
],
    pokemonNotte: [
      { id: 29, min: 4, max: 7, rate: 28 },  // Nidoran♀
      { id: 30, min: 6, max: 8, rate: 16 },  // Nidorina (evoluta, rara)
      { id: 32, min: 4, max: 7, rate: 28 },  // Nidoran♂
      { id: 33, min: 6, max: 8, rate: 16 },  // Nidorino (evoluto, raro)
      { id: 69, min: 5, max: 8, rate: 22 },  // Bellsprout
],
  },

  // ── PERCORSO 2 — castagneti collinari (Frascati→Grottaferrata) Lv 9-13 ──
  'incontri percorso 2': {
    probabilita: 15,
    pokemon: [
      { id: 16, min: 9, max: 11, rate: 28 },  // Pidgey
      { id: 17, min: 11, max: 13, rate: 16 },  // Pidgeotto (evoluto)
      { id: 19, min: 9, max: 11, rate: 28 },  // Rattata
      { id: 203, min: 10, max: 13, rate: 10 },  // Girafarig
      { id: 263, min: 9, max: 11, rate: 28 },  // Zigzagoon (Gen3)
      { id: 264, min: 11, max: 13, rate: 10 },  // Linoone (evoluto)
      { id: 273, min: 11, max: 13, rate: 28 },  // Seedot (Gen3)
      { id: 183, min: 9, max: 12, rate: 28 },  // Marill (Gen2)
],
    pokemonNotte: [
      { id: 29, min: 9, max: 12, rate: 28 },  // Nidoran♀
      { id: 32, min: 9, max: 12, rate: 28 },  // Nidoran♂
      { id: 43, min: 10, max: 12, rate: 22 },  // Oddish
      { id: 179, min: 10, max: 13, rate: 22 },  // Mareep (Gen2)
      { id: 261, min: 10, max: 12, rate: 28 },  // Poochyena (Gen3)
],
  },

  // ── FRASCATI/PERCORSO 2 — laghetto tra i castagni, accessibile SOLO con MN
  // Surf (frascati_est.tmj e percorso_2.tmj usano lo stesso id, è un'unica
  // zona) ── Chiave corretta il 6 ott 2026 (era 'incontri percorso 2 surf',
  // non coincideva con l'id reale dei rettangoli sulle mappe, quindi la
  // zona era "morta": zero incontri). Contenuto scelto da Luca: solo
  // Magikarp, basso livello, nessun'altra specie.
  'acqua_frascati_surf': {
    probabilita: 15,
    pokemon: [
      { id: 129, min: 2, max: 5, rate: 100 },  // Magikarp (unica specie qui)
],
  },

  // ── PERCORSO 3 — campagna verso il lago (Grottaferrata → Marino), Lv 10-16 ──
  // Mix Gen 1-2-3, comparsa dei primi Pokémon d'acqua (il lago è vicino).
  // ATTIVA: percorso_3.tmj ha le zone erba_alta con id = "incontri percorso 3".
  'incontri percorso 3': {
    probabilita: 15,
    pokemon: [
      { id: 54, min: 12, max: 16, rate: 22 },  // Psyduck
      { id: 60, min: 11, max: 14, rate: 22 },  // Poliwag
      { id: 70, min: 13, max: 16, rate: 16 },  // Weepinbell (evoluto)
      { id: 98, min: 11, max: 14, rate: 22 },  // Krabby
      { id: 99, min: 14, max: 16, rate: 6 },  // Kingler (evoluto, raro)
      { id: 193, min: 11, max: 14, rate: 16 },  // Yanma (Gen2)
      { id: 270, min: 11, max: 15, rate: 28 },  // Lotad (Gen3)
      { id: 278, min: 11, max: 15, rate: 28 },  // Wingull (Gen3)
      { id: 283, min: 12, max: 16, rate: 28 },  // Surskit (Gen3)
      { id: 183, min: 10, max: 13, rate: 28 },  // Marill (Gen2)
],
    pokemonNotte: [
      { id: 41, min: 10, max: 13, rate: 28 },  // Zubat
      { id: 43, min: 10, max: 13, rate: 22 },  // Oddish
],
  },

  // ── PERCORSO 4 — salita verso Monte Porzio/Osservatorio (Lv 12-19, tema Elettro) ──
  // Tabella dal reminder MOD 3. PRONTA: si attiva quando Percorso_4.tmj avrà
  // oggetti zona erba_alta (layer eventi) con id = "incontri percorso 4".
  'incontri percorso 4': {
    probabilita: 15,
    pokemon: [
      { id: 21, min: 13, max: 17, rate: 28 },  // Spearow
      { id: 22, min: 14, max: 17, rate: 10 },  // Fearow (evoluto)
      { id: 84, min: 12, max: 16, rate: 22 },  // Doduo
      { id: 170, min: 13, max: 17, rate: 22 },  // Chinchou (Gen2)
      { id: 180, min: 13, max: 17, rate: 16 },  // Flaaffy (Gen2)
      { id: 239, min: 12, max: 16, rate: 16 },  // Elekid (Gen2)
      { id: 309, min: 13, max: 17, rate: 22 },  // Electrike (Gen3)
      { id: 311, min: 14, max: 18, rate: 10 },  // Plusle (Gen3)
      { id: 312, min: 14, max: 18, rate: 10 },  // Minun (Gen3)
],
    pokemonNotte: [
      { id: 81, min: 12, max: 15, rate: 22 },  // Magnemite
      { id: 100, min: 13, max: 16, rate: 22 },  // Voltorb
],
  },

  // ── MARINO — erba alta tra le vigne (Lv 12-17) ──
  // ATTIVA: marino_v3.tmj ha già le zone erba_alta con id = "incontri marino".
  // Specie nuove rispetto ai percorsi precedenti (obiettivo: tutte le specie
  // incontrabili nel gioco, ogni zona ne introduce di diverse).
  'incontri marino': {
    probabilita: 15,
    pokemon: [
      { id: 48, min: 12, max: 15, rate: 22 },  // Venonat
      { id: 49, min: 14, max: 17, rate: 10 },  // Venomoth (evoluto)
      { id: 188, min: 14, max: 17, rate: 16 },  // Skiploom (Gen2, evoluto)
      { id: 214, min: 14, max: 17, rate: 6 },  // Heracross (raro, tra i filari)
      { id: 293, min: 12, max: 16, rate: 28 },  // Whismur (Gen3)
      { id: 294, min: 14, max: 17, rate: 16 },  // Loudred (evoluto)
      { id: 300, min: 12, max: 16, rate: 28 },  // Skitty (Gen3)
      { id: 301, min: 14, max: 17, rate: 10 },  // Delcatty (evoluto)
],
    pokemonNotte: [
      { id: 44, min: 14, max: 17, rate: 16 },  // Gloom (evoluto)
      { id: 167, min: 12, max: 15, rate: 28 },  // Spinarak (Gen2)
      { id: 316, min: 13, max: 17, rate: 22 },  // Gulpin (Gen3)
      { id: 317, min: 14, max: 17, rate: 6 },  // Swalot (evoluto)
],
  },

  // ── MARINO — in acqua col Surf (Lv 12-18) ──
  // ⭐ Prima zona Surf del gioco (Matilde dà la MN qui dopo la palestra): livelli
  // bassi ma già specie diverse da quelle dell'erba di Marino.
  // ATTIVA: ogni casella acquaSurf è automaticamente zona incontri (motore),
  // la chiave è l'"id" già presente sui rettangoli trigger_surf nel .tmj.
  'acqua_marino_surf': {
    probabilita: 15,
    pokemon: [
      { id: 54, min: 12, max: 16, rate: 22 },  // Psyduck
      { id: 60, min: 12, max: 16, rate: 22 },  // Poliwag
      { id: 61, min: 14, max: 17, rate: 16 },  // Poliwhirl (evoluto)
      { id: 90, min: 14, max: 18, rate: 22 },  // Shellder
      { id: 118, min: 13, max: 17, rate: 22 },  // Goldeen
      { id: 270, min: 12, max: 16, rate: 28 },  // Lotad (Gen3)
      { id: 183, min: 12, max: 16, rate: 28 },  // Marill (Gen2)
],
    pokemonNotte: [
      { id: 298, min: 12, max: 14, rate: 28 },  // Azurill (cucciolo di Marill)
],
  },

  // ── LAGO ALBANO — spiaggia, erba alta sulla riva (Lv 15-22) ──
  // PRONTA: in "Lago di Albano.tmj" creare zone erba_alta (layer eventi) con
  // id = "incontri lago albano".
  'incontri lago albano': {
    probabilita: 15,
    pokemon: [
      { id: 54, min: 15, max: 19, rate: 22 },  // Psyduck
      { id: 55, min: 20, max: 22, rate: 6 },  // Golduck (raro, evoluto)
      { id: 79, min: 17, max: 22, rate: 22 },  // Slowpoke
      { id: 80, min: 18, max: 21, rate: 6 },  // Slowbro (evoluto, raro)
      { id: 194, min: 15, max: 19, rate: 28 },  // Wooper (Gen2)
      { id: 270, min: 15, max: 19, rate: 28 },  // Lotad (Gen3)
      { id: 278, min: 16, max: 21, rate: 28 },  // Wingull (Gen3)
      { id: 279, min: 17, max: 20, rate: 10 },  // Pelipper (evoluto)
      { id: 183, min: 16, max: 20, rate: 28 },  // Marill (Gen2)
],
    pokemonNotte: [
      { id: 118, min: 16, max: 21, rate: 22 },  // Goldeen
],
  },

  // ── LAGO ALBANO — in acqua col Surf (Lv 18-28) ──
  // ⭐ Zona Surf = zona incontri, Pokémon più forti (la MN arriva tardi).
  // ATTIVA: ogni casella acquaSurf è automaticamente zona incontri (motore),
  // la chiave è l'"id" già presente sui rettangoli trigger_surf nel .tmj.
  // Kyogre: trigger speciale GdF, gestito a parte.
  'acqua_lago di albano_surf': {
    probabilita: 18,
    pokemon: [
      { id: 60, min: 18, max: 23, rate: 22 },  // Poliwag
      { id: 116, min: 19, max: 24, rate: 22 },  // Horsea
      { id: 120, min: 18, max: 22, rate: 16 },  // Staryu
      { id: 130, min: 25, max: 28, rate: 3 },  // Gyarados (raro, forte)
      { id: 170, min: 18, max: 23, rate: 22 },  // Chinchou (Gen2)
      { id: 370, min: 19, max: 23, rate: 22 },  // Luvdisc
],
    pokemonNotte: [
      { id: 54, min: 18, max: 22, rate: 22 },  // Psyduck
      { id: 72, min: 18, max: 22, rate: 22 },  // Tentacool
      { id: 73, min: 22, max: 26, rate: 6 },  // Tentacruel (evoluto, raro)
      { id: 86, min: 18, max: 22, rate: 22 },  // Seel
      { id: 87, min: 21, max: 25, rate: 6 },  // Dewgong (evoluto)
      { id: 90, min: 20, max: 24, rate: 22 },  // Shellder
      { id: 194, min: 20, max: 25, rate: 28 },  // Wooper (Gen2)
      { id: 318, min: 24, max: 28, rate: 22 },  // Carvanha (Gen3)
],
  },

  // ── CASTEL GANDOLFO — giardini e riva del borgo (Lv 16-23) ──
  // PRONTA: in castel_gandolfo_v2.tmj creare zone erba_alta con
  // id = "incontri castel gandolfo".
  'incontri castel gandolfo': {
    probabilita: 15,
    pokemon: [
      { id: 54, min: 16, max: 20, rate: 22 },  // Psyduck
      { id: 90, min: 17, max: 21, rate: 22 },  // Shellder
      { id: 170, min: 18, max: 22, rate: 22 },  // Chinchou (Gen2)
      { id: 175, min: 16, max: 19, rate: 28 },  // Togepi (rara, giardini)
      { id: 176, min: 20, max: 23, rate: 10 },  // Togetic (evoluto, rarissimo)
      { id: 177, min: 16, max: 20, rate: 22 },  // Natu (Gen2, nei giardini)
      { id: 178, min: 17, max: 20, rate: 6 },  // Xatu (evoluto)
      { id: 194, min: 16, max: 20, rate: 28 },  // Wooper (Gen2)
      { id: 195, min: 17, max: 20, rate: 10 },  // Quagsire (evoluto)
      { id: 222, min: 17, max: 21, rate: 10 },  // Corsola (Gen2)
],
    pokemonNotte: [
      { id: 318, min: 19, max: 23, rate: 22 },  // Carvanha (Gen3, raro)
],
  },

  // ── PERCORSO 5 — salita montana verso Rocca di Papa (Lv 16-24) ──
  // Tema roccia/vulcano (il cratere è vicino). PRONTA: in Percorso_5.tmj
  // creare zone erba_alta con id = "incontri percorso 5".
  'incontri percorso 5': {
    probabilita: 15,
    pokemon: [
      { id: 66, min: 16, max: 20, rate: 22 },  // Machop
      { id: 74, min: 16, max: 20, rate: 22 },  // Geodude
      { id: 216, min: 17, max: 21, rate: 22 },  // Teddiursa (Gen2)
      { id: 231, min: 16, max: 20, rate: 22 },  // Phanpy (Gen2)
      { id: 246, min: 20, max: 24, rate: 22 },  // Larvitar (rarissimo di montagna)
      { id: 304, min: 18, max: 22, rate: 22 },  // Aron (Gen3)
      { id: 325, min: 17, max: 21, rate: 22 },  // Spoink (Gen3)
      { id: 331, min: 16, max: 20, rate: 22 },  // Cacnea
      { id: 332, min: 19, max: 23, rate: 6 },  // Cacturne (evoluto)
      { id: 333, min: 17, max: 22, rate: 22 },  // Swablu (Gen3)
],
    pokemonNotte: [
      { id: 56, min: 16, max: 20, rate: 22 },  // Mankey
      { id: 57, min: 20, max: 24, rate: 10 },  // Primeape (evoluto, raro)
      { id: 322, min: 17, max: 22, rate: 22 },  // Numel (Gen3, vulcanico)
],
  },

  // ── VIA DEI LAGHI — erba alta lungo la strada tra i laghi (Lv 18-30) ──
  // ATTIVA: marcatore erba_alta aggiunto in via_dei_laghi.tmj con questo id
  // (il tile erba viene riconosciuto automaticamente dal motore, vedi
  // js/map.js _buildErbaAltaTiles — non serve ridisegnare la zona a mano).
  'incontri via dei laghi': {
    probabilita: 15,
    pokemon: [
      { id: 114, min: 19, max: 23, rate: 10 },  // Tangela (rara)
      { id: 123, min: 20, max: 24, rate: 6 },  // Scyther (rarissimo)
      { id: 172, min: 22, max: 28, rate: 28 },  // Pichu (Gen2, rarissimo)
      { id: 187, min: 18, max: 22, rate: 28 },  // Hoppip (Gen2)
      { id: 205, min: 20, max: 24, rate: 6 },  // Forretress (Gen2)
      { id: 213, min: 20, max: 25, rate: 6 },  // Shuckle (Gen2, rarissimo)
      { id: 227, min: 21, max: 26, rate: 6 },  // Skarmory (Gen2, raro)
      { id: 235, min: 18, max: 22, rate: 28 },  // Smeargle
      { id: 285, min: 18, max: 22, rate: 22 },  // Shroomish (Gen3)
      { id: 287, min: 18, max: 22, rate: 22 },  // Slakoth
      { id: 288, min: 20, max: 24, rate: 10 },  // Vigoroth (evoluto)
      { id: 313, min: 19, max: 23, rate: 10 },  // Volbeat (Gen3)
      { id: 314, min: 19, max: 23, rate: 10 },  // Illumise (Gen3)
],
    pokemonNotte: [
      { id: 357, min: 19, max: 23, rate: 6 },  // Tropius
],
  },

  // ── OSSERVATORIO — prati intorno alla cupola (Lv 26-32) ──
  // ATTIVA: marcatore erba_alta aggiunto in Osservatorio.tmj con questo id.
  // Tema cielo/scienza: uccelli, psico, elettro (coerente con Zapdos e il
  // meteorologo del posto).
  // Esterno dell'Osservatorio — giorno/notte aggiunto 6 ott 2026 (richiesta
  // di Luca): Lunatone (luna) di notte, Solrock (sole) di giorno è la
  // coppia più ovvia; Clefairy/Cleffa danzano al chiaro di luna (sempre
  // notte nel lore), Drowzee/Murkrow/Chimecho notturni per tema, il resto
  // di giorno. Rate per BST reale (più forte = più raro).
  'incontri osservatorio': {
    probabilita: 15,
    pokemon: [
      { id: 63,  min: 26, max: 30, rate: 22 },  // Abra
      { id: 64,  min: 29, max: 32, rate: 10 },  // Kadabra (evoluto, raro)
      { id: 100, min: 26, max: 30, rate: 22 },  // Voltorb
      { id: 333, min: 27, max: 31, rate: 22 },  // Swablu (Gen3)
      { id: 338, min: 28, max: 32, rate: 6 },   // Solrock (Gen3, tema sole)
      { id: 122, min: 29, max: 32, rate: 6 },   // Mr. Mime (raro)
      { id: 351, min: 28, max: 32, rate: 10 },  // Castform (raro, meteo)
],
    pokemonNotte: [
      { id: 96,  min: 26, max: 30, rate: 22 },  // Drowzee
      { id: 198, min: 27, max: 31, rate: 10 },  // Murkrow (Gen2)
      { id: 337, min: 28, max: 32, rate: 6 },   // Lunatone (Gen3, tema luna)
      { id: 35,  min: 26, max: 29, rate: 22 },  // Clefairy (danza al chiaro di luna)
      { id: 173, min: 24, max: 26, rate: 28 },  // Cleffa (cucciolo)
      { id: 358, min: 27, max: 31, rate: 10 },  // Chimecho
],
  },

  // ── AREA "SABBIA" DELL'OSSERVATORIO (nuova, 6 ott 2026): tempesta di
  // sabbia PERENNE, innaturale — indizio della trama meteo del Team GdF.
  // Niente giorno/notte: l'anomalia è costante, non segue il ciclo normale.
  'incontri sabbia osservatorio': {
    probabilita: 15,
    pokemon: [
      { id: 27,  min: 28, max: 32, rate: 22 },  // Sandshrew
      { id: 28,  min: 31, max: 34, rate: 10 },  // Sandslash (evoluto)
      { id: 328, min: 29, max: 33, rate: 22 },  // Trapinch (Gen3)
      { id: 343, min: 28, max: 32, rate: 22 },  // Baltoy (Gen3)
      { id: 231, min: 29, max: 33, rate: 16 },  // Phanpy (Gen2, raro)
],
  },

  // ── PERCORSO MONTANO 1 — DISATTIVATA (6 ott 2026, richiesta di Luca:
  // "per ora non ci serve"). Il contenuto è stato spostato di sotto su
  // 'incontri montecavo' — non cancellato, solo rinominato/rilocato.
  'incontri percorso montano': {
    probabilita: 15,
    pokemon: [
],
  },

  // ── MONTE CAVO (monte_cavo.tmj, si collega a Rocca di Papa) — GRANDINE
  // PERENNE (richiesta di Luca, 6 ott 2026, come la sabbia dell'Osservatorio:
  // anomalia meteo, indizio della trama del Team GdF). Contenuto ex
  // "percorso montano": quota alta, clima freddo, roccia/ghiaccio/orso.
  'incontri montecavo': {
    probabilita: 15,
    pokemon: [
      { id: 216, min: 31, max: 35, rate: 22 },  // Teddiursa (Gen2)
      { id: 220, min: 30, max: 34, rate: 28 },  // Swinub (Gen2)
      { id: 221, min: 32, max: 36, rate: 10 },  // Piloswine (evoluto)
      { id: 225, min: 32, max: 37, rate: 22 },  // Delibird (Gen2, raro)
      { id: 246, min: 32, max: 36, rate: 22 },  // Larvitar (raro di montagna)
      { id: 361, min: 31, max: 35, rate: 22 },  // Snorunt (Gen3)
      { id: 362, min: 34, max: 37, rate: 6 },  // Glalie (evoluto)
],
    pokemonNotte: [
      { id: 74, min: 30, max: 34, rate: 22 },  // Geodude
      { id: 124, min: 32, max: 36, rate: 10 },  // Jynx (rarissima)
      { id: 238, min: 29, max: 32, rate: 22 },  // Smoochum (cucciolo)
],
  },

  // ── MONTE PORZIO CATONE — città (Lv 24-30) ──
  // NUOVA (sessione 6 agosto): mancava del tutto, nonostante la città esista
  // da tempo. Serve un rettangolo erba_alta con questo id in monteporzio.tmj.
  'incontri monteporzio': {
    probabilita: 15,
    pokemon: [
      { id: 27, min: 24, max: 27, rate: 22 },  // Sandshrew
      { id: 52, min: 24, max: 27, rate: 22 },  // Meowth
      { id: 53, min: 27, max: 30, rate: 10 },  // Persian (evoluto)
      { id: 58, min: 25, max: 29, rate: 16 },  // Growlithe
      { id: 133, min: 27, max: 30, rate: 22 },  // Eevee (rarissimo)
      { id: 39, min: 24, max: 27, rate: 28 },  // Jigglypuff
      { id: 174, min: 23, max: 25, rate: 28 },  // Igglybuff (cucciolo)
      { id: 190, min: 25, max: 29, rate: 16 },  // Aipom (Gen2)
      { id: 209, min: 26, max: 30, rate: 22 },  // Snubbull (Gen2)
      { id: 210, min: 28, max: 31, rate: 10 },  // Granbull (evoluto)
      { id: 234, min: 28, max: 30, rate: 6 },  // Stantler (Gen2, raro)
],
    pokemonNotte: [
      { id: 25, min: 24, max: 28, rate: 22 },  // Pikachu (raro)
],
  },

  // ── ROCCA DI PAPA — città, tema roccia/cratere (Lv 32-38) ──
  // NUOVA (sessione 6 agosto): mancava del tutto nonostante la 5ª palestra
  // esista già. Serve un rettangolo erba_alta con questo id in rocca_di_papa.tmj.
  'incontri rocca di papa': {
    probabilita: 15,
    pokemon: [
      { id: 75, min: 34, max: 38, rate: 16 },  // Graveler (evoluto, raro)
      { id: 95, min: 32, max: 35, rate: 16 },  // Onix
      { id: 111, min: 32, max: 36, rate: 16 },  // Rhyhorn
      { id: 112, min: 36, max: 38, rate: 6 },  // Rhydon (evoluto, rarissimo)
      { id: 207, min: 33, max: 36, rate: 10 },  // Gligar (raro)
      { id: 328, min: 32, max: 35, rate: 22 },  // Trapinch (Gen3)
      { id: 345, min: 32, max: 35, rate: 16 },  // Lileep
      { id: 346, min: 35, max: 38, rate: 6 },  // Cradily (evoluto, raro)
],
    pokemonNotte: [
      { id: 185, min: 33, max: 36, rate: 10 },  // Sudowoodo (Gen2)
      { id: 299, min: 33, max: 37, rate: 16 },  // Nosepass (Gen3)
],
  },

  // ── PERCORSO 7 — tra Rocca di Papa e Albano (Lv 34-40) ──
  // NUOVA: percorso_7 aveva sia gli ID trainer duplicati da Percorso 3 sia
  // nessuna tabella incontri propria. Serve un rettangolo erba_alta con
  // questo id in percorso_7.tmj.
  'incontri percorso 7': {
    probabilita: 15,
    pokemon: [
      { id: 241, min: 36, max: 39, rate: 6 },  // Miltank (Gen2)
      { id: 352, min: 35, max: 39, rate: 10 },  // Kecleon (Gen3)
],
    pokemonNotte: [
      { id: 215, min: 34, max: 38, rate: 10 },  // Sneasel (Gen2)
      { id: 355, min: 37, max: 40, rate: 22 },  // Duskull (Gen3, raro)
],
  },

  // ── ALBANO LAZIALE — città, tema Lotta (Lv 40-46) ──
  // NUOVA: 6ª città, mai avuta una tabella incontri.
  'incontri albano': {
    probabilita: 15,
    pokemon: [
      { id: 67, min: 41, max: 45, rate: 10 },  // Machoke (evoluto)
      { id: 128, min: 42, max: 46, rate: 6 },  // Tauros
      { id: 307, min: 40, max: 44, rate: 22 },  // Meditite (Gen3)
      { id: 308, min: 41, max: 44, rate: 10 },  // Medicham (evoluto)
],
    pokemonNotte: [
      { id: 236, min: 40, max: 42, rate: 28 },  // Tyrogue (Gen2, raro)
      { id: 237, min: 44, max: 46, rate: 10 },  // Hitmontop (Gen2, raro)
      { id: 106, min: 42, max: 45, rate: 10 },  // Hitmonlee (rarissimo)
      { id: 107, min: 42, max: 45, rate: 10 },  // Hitmonchan (rarissimo)
      { id: 296, min: 40, max: 43, rate: 28 },  // Makuhita (Gen3)
],
  },

  // ── PERCORSO 8 — tra Albano e Zona Safari/Percorso 9 (Lv 40-46) ──
  // NUOVA: la mappa aveva già trainer (all-p8-*) ma nessuna tabella incontri.
  'incontri percorso 8': {
    probabilita: 15,
    pokemon: [
      { id: 274, min: 41, max: 45, rate: 16 },  // Nuzleaf (Gen3, evoluto)
      { id: 291, min: 43, max: 46, rate: 10 },  // Ninjask (Gen3, raro)
],
    pokemonNotte: [
      { id: 42, min: 40, max: 43, rate: 10 },  // Golbat (evoluto)
      { id: 168, min: 40, max: 44, rate: 10 },  // Ariados (Gen2, evoluto)
      { id: 262, min: 42, max: 46, rate: 10 },  // Mightyena (Gen3, evoluto)
],
  },

  // ── ZONA SAFARI — specie esclusive, ingresso a pagamento (Lv 30-45) ──
  // NUOVA: gate/pagamento già pronti da tempo (sessione 39), ma nessuna
  // specie era mai stata assegnata. Range ampio: è una zona bonus opzionale.
  'incontri zona safari': {
    probabilita: 20,
    pokemon: [
      { id: 108, min: 30, max: 40, rate: 16 },  // Lickitung (rara)
      { id: 113, min: 30, max: 40, rate: 10 },  // Chansey (rarissima)
      { id: 115, min: 36, max: 42, rate: 6 },  // Kangaskhan (rara)
      { id: 127, min: 30, max: 36, rate: 6 },  // Pinsir
      { id: 217, min: 35, max: 40, rate: 6 },  // Ursaring (Gen2, evoluto)
      { id: 335, min: 33, max: 40, rate: 10 },  // Zangoose (Gen3)
],
    pokemonNotte: [
      { id: 336, min: 33, max: 40, rate: 10 },  // Seviper (Gen3)
],
  },

  // ── PERCORSO 9 — sale verso Ariccia (Lv 44-50) ──
  // NUOVA: aveva già trainer (all-p9-*) ma nessuna tabella incontri.
  // Anticipa il tema Buio/notte della palestra di Ariccia (Isa).
  'incontri percorso 9': {
    probabilita: 15,
    pokemon: [
      { id: 286, min: 45, max: 49, rate: 6 },  // Breloom (Gen3, evoluto)
],
    pokemonNotte: [
      { id: 302, min: 44, max: 48, rate: 16 },  // Sableye (Gen3)
      { id: 353, min: 44, max: 47, rate: 22 },  // Shuppet (Gen3)
      { id: 354, min: 46, max: 50, rate: 10 },  // Banette (Gen3, evoluto)
      { id: 356, min: 48, max: 50, rate: 10 },  // Dusclops (Gen3, rarissimo)
],
  },

  // ── TUNNEL ROCCIOSO — dungeon 4 piani, Via dei Laghi → Monte Porzio, tra
  // 3ª e 4ª palestra (Lv 26-34). "Incontri costanti" (MAPPE[...].incontriCostanti,
  // js/map.js _getTileType): NON serve un rettangolo erba_alta, ogni casella
  // calpestabile della mappa è già zona incontri, tranne il riquadro 7x7
  // attorno a Latios/Latias sul 4F. ──
  'incontri tunnel roccioso 1f': {
    probabilita: 7,
    pokemon: [
      { id: 50,  min: 26, max: 27, rate: 25 },  // Diglett
      { id: 104, min: 26, max: 28, rate: 22 },  // Cubone
      { id: 218, min: 27, max: 28, rate: 18 },  // Slugma (Gen2)
      { id: 219, min: 27, max: 29, rate: 10 },  // Magcargo (Gen2, evoluto raro)
      { id: 51,  min: 28, max: 29, rate: 6 },   // Dugtrio (evoluto raro)
    ],
  },
  // ── TUNNEL ROCCIOSO 1F — fiume sotterraneo, MN Surf (Lv 30-36) ──
  // Zona Surf: automaticamente ANCHE zona incontri (stessa regola di
  // marino/lago albano), Pokémon più forti della zona a piedi perché la MN
  // Surf si sblocca molto più avanti. Specie inedite (Whiscash/Feebas/
  // Relicanth line, mai usate altrove).
  'acqua_tunnel_roccioso_1f_surf': {
    probabilita: 8,
    pokemon: [
      { id: 341, min: 30, max: 33, rate: 25 },  // Corphish (Gen3)
      { id: 340, min: 32, max: 35, rate: 18 },  // Whiscash (Gen3, evoluto)
      { id: 366, min: 31, max: 34, rate: 16 },  // Clamperl (Gen3)
      { id: 349, min: 32, max: 35, rate: 8 },   // Feebas (Gen3, raro)
      { id: 369, min: 34, max: 36, rate: 4 },   // Relicanth (Gen3, rarissimo, "pesce fossile")
      { id: 147, min: 32, max: 35, rate: 1 },   // Dratini (rarissimo, draghi solo nei dungeon)
      { id: 148, min: 35, max: 36, rate: 1 },   // Dragonair (rarissimo, evoluto)
],
  },

  'incontri tunnel roccioso 2f': {
    probabilita: 7,
    pokemon: [
      { id: 228, min: 27, max: 29, rate: 22 },  // Houndour (Gen2)
      { id: 329, min: 28, max: 30, rate: 18 },  // Vibrava (Gen3)
      { id: 105, min: 28, max: 30, rate: 16 },  // Marowak
      { id: 28,  min: 29, max: 30, rate: 14 },  // Sandslash
      { id: 229, min: 29, max: 30, rate: 7 },   // Houndoom (Gen2, evoluto raro)
    ],
  },
  'incontri tunnel roccioso 3f': {
    probabilita: 7,
    pokemon: [
      { id: 354, min: 29, max: 31, rate: 20 },  // Banette (Gen3)
      { id: 247, min: 30, max: 32, rate: 18 },  // Pupitar (Gen2)
      { id: 208, min: 32, max: 32, rate: 6 },   // Steelix (evoluto rarissimo)
      { id: 371, min: 29, max: 31, rate: 1 },   // Bagon (rarissimo, draghi solo nei dungeon)
      { id: 372, min: 31, max: 32, rate: 1 },   // Shelgon (rarissimo, evoluto)
],
  },
  'incontri tunnel roccioso 4f': {
    probabilita: 7,
    pokemon: [
      { id: 42,  min: 30, max: 33, rate: 22 },  // Golbat
      { id: 75,  min: 31, max: 34, rate: 18 },  // Graveler
      { id: 95,  min: 31, max: 34, rate: 16 },  // Onix
      { id: 302, min: 32, max: 35, rate: 10 },  // Sableye (Gen3, tema buio/grotta)
      { id: 299, min: 32, max: 35, rate: 10 },  // Nosepass (Gen3)
      { id: 41,  min: 29, max: 32, rate: 14 },  // Zubat
],
  },

  // ── GROTTA DEL VULCANO — dungeon Team GdF sotto Rocca di Papa, tema
  // Fuoco/Roccia/Terra (Lv 46-58). Tutto il pavimento è zona incontri
  // (MAPPE['grotta_vulcano'].incontriCostanti, vedi js/map.js), niente
  // rettangolo erba_alta da disegnare. ──
  'incontri grotta vulcano': {
    probabilita: 8,
    pokemon: [
      { id: 41,  min: 46, max: 50, rate: 22 },  // Zubat
      { id: 42,  min: 48, max: 52, rate: 18 },  // Golbat
      { id: 74,  min: 46, max: 50, rate: 20 },  // Geodude
      { id: 75,  min: 48, max: 53, rate: 18 },  // Graveler
      { id: 218, min: 47, max: 51, rate: 16 },  // Slugma
      { id: 322, min: 47, max: 52, rate: 16 },  // Numel
      { id: 88,  min: 46, max: 50, rate: 14 },  // Grimer
      { id: 89,  min: 49, max: 54, rate: 10 },  // Muk (evoluto)
      { id: 111, min: 47, max: 51, rate: 14 },  // Rhyhorn
      { id: 246, min: 48, max: 53, rate: 8 },   // Larvitar (raro)
      { id: 227, min: 50, max: 55, rate: 6 },   // Skarmory (raro)
      { id: 126, min: 48, max: 53, rate: 1 },   // Magmar (rarissimo)
      { id: 240, min: 46, max: 49, rate: 10 },  // Magby (cucciolo)
      { id: 324, min: 47, max: 51, rate: 16 },  // Torkoal
],
  },

  // ── CENTRALE ELETTRICA (Power Plant, estratta da pret/pokefirered,
  // collegata a Percorso 9, sess. 5 ott 2026) — dungeon tema Elettro,
  // Lv 30-40. Tutto il pavimento è zona incontri (MAPPE['powerplant'].
  // incontriCostanti, vedi js/map.js), niente rettangolo erba_alta. ──
  'incontri power plant': {
    probabilita: 8,
    pokemon: [
      { id: 100, min: 30, max: 35, rate: 22 },  // Voltorb
      { id: 101, min: 33, max: 38, rate: 14 },  // Electrode
      { id: 81,  min: 30, max: 35, rate: 20 },  // Magnemite
      { id: 82,  min: 34, max: 40, rate: 14 },  // Magneton
      { id: 25,  min: 31, max: 36, rate: 14 },  // Pikachu
      { id: 239, min: 30, max: 34, rate: 10 },  // Elekid (raro)
      { id: 309, min: 30, max: 35, rate: 16 },  // Electrike
      { id: 310, min: 35, max: 40, rate: 8 },   // Manectric (raro)
      { id: 125, min: 32, max: 37, rate: 1 },   // Electabuzz (rarissimo)
      { id: 137, min: 30, max: 35, rate: 14 },  // Porygon (rimesso su richiesta di Luca, 6 ott 2026)
      { id: 233, min: 37, max: 40, rate: 1 },   // Porygon2 (evoluto, impossibile)
],
  },

  // ── ARICCIA — città, tema Buio (Lv 46-52, Capopalestra Isa) ──
  // NUOVA: 7ª città, mai avuta una tabella incontri (né rettangolo erba_alta).
  'incontri ariccia': {
    probabilita: 15,
    pokemon: [
      { id: 164, min: 46, max: 49, rate: 25 },  // Noctowl (Gen2, evoluto)
      { id: 200, min: 46, max: 50, rate: 22 },  // Misdreavus (Gen2)
      { id: 292, min: 47, max: 50, rate: 12 },  // Shedinja (Gen3, raro/unico)
      { id: 359, min: 48, max: 51, rate: 6 },   // Absol (raro, più comune di notte)
    ],
    // Incontri notturni (sess. 5 ott 2026): città a tema Buio — col buio vero
    // Umbreon e Absol diventano molto più comuni, coerente col tema.
    pokemonNotte: [
      { id: 164, min: 46, max: 49, rate: 16 },  // Noctowl
      { id: 200, min: 46, max: 50, rate: 16 },  // Misdreavus
      { id: 359, min: 48, max: 51, rate: 20 },  // Absol (comune di notte)
      { id: 302, min: 47, max: 50, rate: 14 },  // Sableye (occhi nel buio)
    ],
  },

  // ── PERCORSO 10 — Ariccia → Genzano (world Castelli_lasthree), Lv 53-57,
  // tema fiori/giardino (avvicinamento all'Infiorata di Genzano). L'erba_alta
  // segnaposto ("incontri percorso 10") era già piazzata su Percorso_10.tmj,
  // solo la tabella mancava — sessione 8 agosto. ──
  'incontri percorso 10': {
    probabilita: 15,
    pokemon: [
      { id: 166, min: 53, max: 56, rate: 16 },  // Ledian (Gen2)
      { id: 192, min: 53, max: 55, rate: 10 },  // Sunflora (Gen2)
      { id: 284, min: 55, max: 57, rate: 10 },  // Masquerain (Gen3, raro)
],
    pokemonNotte: [
      { id: 327, min: 53, max: 56, rate: 16 },  // Spinda
],
  },

  // ── PERCORSO 11 — biforcazione Grottaferrata → Rocca di Papa, verso Monte
  // Cavo (world FrascatiGrotta), Lv 28-35, tema montano/roccioso (coerente
  // coi trainer Escursionisti/Scalatori già piazzati). Nuova, sessione 8
  // agosto (rettangolo erba_alta segnaposto aggiunto insieme alla tabella). ──
  'incontri percorso 11': {
    probabilita: 15,
    pokemon: [
      { id: 202, min: 29, max: 32, rate: 10 },  // Wobbuffet
      { id: 280, min: 29, max: 32, rate: 28 },  // Ralts (rarissimo)
      { id: 299, min: 28, max: 31, rate: 16 },  // Nosepass (Gen3)
      { id: 304, min: 29, max: 32, rate: 22 },  // Aron (Gen3)
      { id: 305, min: 32, max: 34, rate: 10 },  // Lairon (Gen3, evoluto)
      { id: 322, min: 30, max: 33, rate: 22 },  // Numel (Gen3)
      { id: 323, min: 33, max: 35, rate: 6 },  // Camerupt (Gen3, evoluto, raro)
],
    pokemonNotte: [
      { id: 360, min: 28, max: 30, rate: 28 },  // Wynaut (cucciolo)
],
  },

  // ── COLLEGAMENTO COTRAL — diramazione verso il nascondiglio CoTrAL ai piedi
  // di Monte Cavo (world FrascatiGrotta), Lv 30-36, tema industriale/scarti
  // (coerente con la presenza dei grunt CoTrAL). Nuova, sessione 8 agosto. ──
  'incontri collegamento cotral': {
    probabilita: 15,
    pokemon: [
      { id: 303, min: 32, max: 35, rate: 16 },  // Mawile (rara)
      { id: 343, min: 30, max: 33, rate: 22 },  // Baltoy (Gen3)
      { id: 344, min: 32, max: 35, rate: 6 },  // Claydol (Gen3, evoluto)
      { id: 374, min: 34, max: 36, rate: 22 },  // Beldum (Gen3, rarissimo)
],
    pokemonNotte: [
      { id: 88, min: 30, max: 33, rate: 22 },  // Grimer
      { id: 89, min: 32, max: 34, rate: 6 },  // Muk (evoluto)
      { id: 109, min: 30, max: 33, rate: 16 },  // Koffing
],
  },

  // ── GENZANO — città (8ª e ultima, Palestra Fuoco, Capopalestra Camilla,
  // cap 58), tema Fuoco/lava che fa fiorire l'Infiorata. Tabella pronta ma
  // NON ancora agganciata a nessun rettangolo erba_alta: la mappa Genzano.tmj
  // non ha ancora nessun layer oggetti (vedi ROADMAP sessione 8 agosto) —
  // quando Luca disegna l'erba vera in Tiled basta un rettangolo con
  // id:'incontri genzano' per attivarla, come per le altre città. ──
  'incontri genzano': {
    probabilita: 15,
    pokemon: [
      { id: 37, min: 55, max: 57, rate: 22 },  // Vulpix
      { id: 77, min: 56, max: 58, rate: 10 },  // Ponyta
      { id: 219, min: 57, max: 58, rate: 10 },  // Magcargo (evoluto, raro)
],
    pokemonNotte: [
      { id: 58, min: 55, max: 58, rate: 16 },  // Growlithe
],
  },

  // ── VIA VITTORIA — dungeon finale pre-Lega, cap 60 (13 agosto). Un
  // rettangolo erba_alta a copertura dell'intero piano per ciascun livello
  // (le pareti/void restano comunque impassabili via collisione, quindi
  // coprire tutto il piano è sicuro): "ogni singolo punto" è zona incontri,
  // come richiesto. Stanza segreta di Moltres ESCLUSA (incontro leggendario
  // unico, niente tabella selvatica lì). Specie tutte nuove rispetto alle
  // zone precedenti, livelli 55-63. ──
  'incontri via vittoria 1f': {
    probabilita: 18,
    pokemon: [
      { id: 95,  min: 55, max: 58, rate: 22 },  // Onix
      { id: 208, min: 58, max: 61, rate: 12 },  // Steelix (evoluto)
      { id: 246, min: 55, max: 58, rate: 20 },  // Larvitar
      { id: 247, min: 57, max: 60, rate: 12 },  // Pupitar
      { id: 74,  min: 55, max: 57, rate: 20 },  // Geodude
      { id: 75,  min: 57, max: 59, rate: 14 },  // Graveler
      { id: 334, min: 60, max: 63, rate: 1 },   // Altaria (rarissimo, drago/volante dungeon-only)
],
  },
  'incontri via vittoria 2f': {
    probabilita: 20,
    pokemon: [
      { id: 116, min: 55, max: 58, rate: 22 },  // Horsea
      { id: 117, min: 57, max: 60, rate: 14 },  // Seadra
      { id: 129, min: 54, max: 57, rate: 20 },  // Magikarp
      { id: 130, min: 58, max: 61, rate: 8 },   // Gyarados (evoluto, raro)
      { id: 118, min: 55, max: 58, rate: 18 },  // Goldeen
      { id: 119, min: 58, max: 60, rate: 10 },  // Seaking
      { id: 183, min: 55, max: 57, rate: 16 },  // Marill
      { id: 363, min: 57, max: 60, rate: 12 },  // Spheal
      { id: 364, min: 60, max: 62, rate: 5 },   // Sealeo (evoluto, raro)
    ],
  },
  'incontri via vittoria 3f': {
    probabilita: 18,
    pokemon: [
      { id: 302, min: 56, max: 59, rate: 18 },  // Sableye
      { id: 356, min: 56, max: 59, rate: 18 },  // Dusclops
      { id: 353, min: 55, max: 58, rate: 20 },  // Shuppet
      { id: 200, min: 55, max: 58, rate: 16 },  // Misdreavus
      { id: 41,  min: 54, max: 57, rate: 20 },  // Zubat
      { id: 42,  min: 57, max: 60, rate: 14 },  // Golbat
      { id: 359, min: 61, max: 63, rate: 4 },   // Absol (rarissimo)
    ],
  },
  'incontri via vittoria 4f': {
    probabilita: 16,
    pokemon: [
      { id: 304, min: 56, max: 59, rate: 20 },  // Aron
      { id: 305, min: 58, max: 61, rate: 12 },  // Lairon
      { id: 231, min: 55, max: 58, rate: 20 },  // Phanpy
      { id: 232, min: 59, max: 62, rate: 10 },  // Donphan (evoluto, raro)
      { id: 66,  min: 54, max: 57, rate: 18 },  // Machop
      { id: 67,  min: 57, max: 60, rate: 12 },  // Machoke
    ],
  },
  'incontri via vittoria 5f': {
    probabilita: 16,
    pokemon: [
      { id: 227, min: 57, max: 60, rate: 20 },  // Skarmory
      { id: 337, min: 56, max: 59, rate: 18 },  // Lunatone
      { id: 338, min: 56, max: 59, rate: 18 },  // Solrock
      { id: 328, min: 55, max: 58, rate: 18 },  // Trapinch
      { id: 329, min: 58, max: 61, rate: 10 },  // Vibrava
      { id: 344, min: 56, max: 59, rate: 13 },  // Claydol
    ],
  },

  // ── PERCORSO MONTE PO 1 — post-Lega (sess. 5 ott 2026), livelli alti.
  // Rettangolo erba_alta da disegnare in percorso_montepo_1.tmj con
  // id="incontri percorso montepo 1" (il tile-locale-6 di outside.tsx non
  // funziona qui: la mappa usa un tileset suo estratto da pret, non
  // outside.tsx — vedi commento in _buildErbaAltaTiles, js/map.js). ──
  'incontri percorso montepo 1': {
    probabilita: 10,
    pokemon: [
      { id: 130, min: 58, max: 63, rate: 3 },  // Gyarados (rarissimo)
      { id: 310, min: 57, max: 62, rate: 6 },  // Manectric
],
    pokemonNotte: [
      { id: 24, min: 55, max: 60, rate: 10 },  // Arbok
      { id: 97, min: 55, max: 60, rate: 6 },  // Hypno
      { id: 101, min: 56, max: 61, rate: 6 },  // Electrode
      { id: 110, min: 56, max: 61, rate: 6 },  // Weezing
],
  },

  // ── PERCORSO MONTE PO 3 — post-Lega (sess. 5 ott 2026), livelli alti.
  // Rettangolo erba_alta da disegnare in percorso_montepo_3.tmj con
  // id="incontri percorso montepo 3". L'acqua (trigger_surf id
  // "acqua_percorso_montepo3", già disegnata) riusa la STESSA tabella. ──
  'incontri percorso montepo 3': {
    probabilita: 10,
    pokemon: [
      { id: 212, min: 60, max: 65, rate: 6 },  // Scizor (rarissimo)
      { id: 286, min: 57, max: 62, rate: 6 },  // Breloom
      { id: 326, min: 56, max: 61, rate: 6 },  // Grumpig
],
    pokemonNotte: [
      { id: 297, min: 58, max: 63, rate: 6 },  // Hariyama
],
  },

  // ── PERCORSO 7B — biforcazione di Percorso 7 verso la Spiaggia di Albano
  // (Lago di Albano), Lv 34-40 (coerente col Percorso 7 che la precede).
  // Rettangolo erba_alta già disegnato da Luca (id "incontri percorso 7b"),
  // mancava solo la tabella (6 ott 2026). Specie non riusate altrove. ──
  'incontri percorso 7b': {
    probabilita: 15,
    pokemon: [
      { id: 62, min: 36, max: 40, rate: 10 },  // Poliwrath (evoluto, raro)
      { id: 85, min: 35, max: 39, rate: 16 },  // Dodrio
      { id: 193, min: 34, max: 38, rate: 28 },  // Yanma (Gen2)
],
    pokemonNotte: [
      { id: 169, min: 35, max: 39, rate: 16 },  // Crobat (evoluto)
],
  },

  // ── PERCORSO 12 — zona finale post-Lega, Lv 60-66 (stesse specie del
  // Percorso 10 ma molto più forti, richiesta di Luca 6 ott 2026: "simile
  // al percorso 10"). ──
  'incontri percorso 12': {
    probabilita: 15,
    pokemon: [
      { id: 166, min: 60, max: 64, rate: 16 },  // Ledian (Gen2)
      { id: 192, min: 60, max: 63, rate: 10 },  // Sunflora (Gen2)
      { id: 284, min: 62, max: 66, rate: 10 },  // Masquerain (Gen3, raro)
],
    pokemonNotte: [
      { id: 327, min: 60, max: 64, rate: 16 },  // Spinda
],
  },

};
DATI_INCONTRI['acqua_percorso_montepo3'] = DATI_INCONTRI['incontri percorso montepo 3'];

// Alias: il singolo tile "acqua profonda lago di nemi" (Lago di Albano
// interno.tmj) ha un id Tiled proprio invece di "acqua_lago di albano_surf"
// — è la stessa acqua dello stesso lago, non una zona a parte, quindi riusa
// la stessa tabella invece di restare senza incontri (PROBLEMA 1, sessione
// 31 agosto: prima normTipo non riconosceva nemmeno quel tile come
// surfabile — vedi js/map.js — ora lo è, ma senza questo alias non
// troverebbe comunque una tabella incontri).
DATI_INCONTRI['acqua profonda lago di nemi'] = DATI_INCONTRI['acqua_lago di albano_surf'];

// Alias (sess. 5 ott 2026, distribuzione specie 386): il rettangolo erba_alta
// già disegnato in "Lago di Albano.tmj" usa l'id "incontri lago di albano
// spiaggia" (diverso dalla chiave storica "incontri lago albano" usata qui
// sotto) — stessa zona, stessa tabella, solo nome diverso sul tile.
DATI_INCONTRI['incontri lago di albano spiaggia'] = DATI_INCONTRI['incontri lago albano'];

// Alias (6 ott 2026, richiesta di Luca): il rettangolo acqua_sub/surf
// "acqua profonda lago di albano" di "Lago di Albano interno.tmj" aveva
// un id proprio senza tabella — Luca vuole che l'interno del lago sia
// identico a quello esterno ("Lago di Albano interno uguale a Lago di
// Albano"). Il tuffo vero e proprio (destinazione "lago_albano_profondo")
// ha già la sua tabella a parte ('incontri lago albano profondo').
DATI_INCONTRI['acqua profonda lago di albano'] = DATI_INCONTRI['incontri lago albano'];

// Alias (6 ott 2026, richiesta di Luca): Percorso 5 Surf riusa la STESSA
// tabella del Surf di Castel Gandolfo ("prendi da lì" — stesso specchio
// d'acqua, Castel Gandolfo sblocca il bivio verso Percorso 5).
DATI_INCONTRI['acqua_percorso_5'] = DATI_INCONTRI['acqua_marino_surf'];

// Alias (6 ott 2026, richiesta di Luca: "Lago di Nemi fallo uguale a Lago
// di Albano"): sia la zona Surf che quella a terra riusano le tabelle di
// Lago di Albano.
DATI_INCONTRI['acqua_lago di nemi'] = DATI_INCONTRI['acqua_lago di albano_surf'];
DATI_INCONTRI['incontri lago di nemi'] = DATI_INCONTRI['incontri lago albano'];

// Alias (6 ott 2026): Luca ha disegnato in via_vittoria_2f.tmj sia l'erba
// ("incontri via vittoria 2f", già con una tabella propria) sia il Surf
// ("acqua_via_vittoria_surf", senza tabella). Quel piano è già tutto
// "acquatico" di tema (Horsea/Seadra/Magikarp/Gyarados/Goldeen/Seaking/
// Marill/Spheal/Sealeo), quindi il Surf riusa la stessa tabella dell'erba
// invece di inventarne una nuova — stesso schema già usato per Percorso
// Monte Po 3 (acqua_percorso_montepo3).
DATI_INCONTRI['acqua_via_vittoria_surf'] = DATI_INCONTRI['incontri via vittoria 2f'];

if (typeof module !== 'undefined' && module.exports) module.exports = DATI_INCONTRI;
