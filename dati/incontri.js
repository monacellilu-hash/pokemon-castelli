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
   "acqua_lago di albano_surf" (Lago di Albano), "acqua_marino_surf" (Marino).
   Zone PRONTE (tabella qui, manca l'oggetto zona erba_alta nel .tmj — crearlo
   in Tiled sul layer eventi, rettangolo con type=erba_alta e id=chiave):
   "incontri frascati" (frascati_est), "incontri percorso 4" (Percorso_4),
   "incontri lago albano" (riva, Lago di Albano),
   "incontri castel gandolfo" (castel_gandolfo_v2), "incontri percorso 5".
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
      { id: 134, min: 55, max: 60, rate: 20 },  // Vaporeon
      { id: 199, min: 56, max: 62, rate: 16 },  // Slowking
      { id: 171, min: 55, max: 60, rate: 16 },  // Lanturn
      { id: 224, min: 56, max: 61, rate: 14 },  // Octillery
      { id: 211, min: 55, max: 60, rate: 14 },  // Qwilfish
      { id: 340, min: 55, max: 60, rate: 16 },  // Whiscash
      { id: 342, min: 56, max: 62, rate: 14 },  // Crawdaunt
      { id: 319, min: 57, max: 63, rate: 12 },  // Sharpedo
      { id: 367, min: 56, max: 61, rate: 10 },  // Huntail
      { id: 368, min: 56, max: 61, rate: 10 },  // Gorebyss
      { id: 230, min: 58, max: 64, rate: 1 },   // Kingdra
      { id: 350, min: 60, max: 66, rate: 5 },   // Milotic
      { id: 365, min: 60, max: 66, rate: 1 },   // Walrein
      { id: 321, min: 60, max: 65, rate: 4 },   // Wailord
      { id: 369, min: 62, max: 68, rate: 3 },   // Relicanth (rarissimo, relitto del passato)
    ],
  },

  // ── PERCORSO 1 / 1b — campagna aperta della Via Tuscolana (Lv 2-6) ──
  'incontri percorso 1': {
    probabilita: 15,
    pokemon: [
      { id: 10,  min: 2, max: 5, rate: 30 },   // Caterpie
      { id: 13,  min: 2, max: 5, rate: 30 },   // Weedle
      { id: 16,  min: 2, max: 5, rate: 28 },   // Pidgey
      { id: 19,  min: 2, max: 5, rate: 28 },   // Rattata
      { id: 29,  min: 2, max: 4, rate: 18 },   // Nidoran♀
      { id: 32,  min: 2, max: 4, rate: 18 },   // Nidoran♂
      { id: 43,  min: 3, max: 5, rate: 16 },   // Oddish
      { id: 60,  min: 3, max: 5, rate: 14 },   // Poliwag
      { id: 69,  min: 3, max: 5, rate: 14 },   // Bellsprout
      { id: 161, min: 2, max: 5, rate: 18 },   // Sentret (Gen2)
      { id: 163, min: 3, max: 5, rate: 16 },   // Hoothoot (Gen2)
      { id: 165, min: 3, max: 5, rate: 12 },   // Ledyba (Gen2)
      { id: 265, min: 2, max: 5, rate: 16 },   // Wurmple (Gen3)
      { id: 276, min: 3, max: 6, rate: 14 },   // Taillow (Gen3)
      { id: 263, min: 3, max: 5, rate: 14 },   // Zigzagoon (Gen3)
      { id: 4,   min: 5, max: 6, rate: 3 },    // Charmander (starter rarissimo)
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
      { id: 252, min: 9,  max: 11, rate: 3 },   // Treecko (starter rarissimo)
      // Celebi: gestito a parte (logica speciale 3% post-Solitario).
    ],
  },

  // ── VIGNE DI FRASCATI — erba alta tra i filari (Lv 4-8) ──
  // Pronta per quando frascati_est.tmj esporterà la zona "incontri frascati".
  'incontri frascati': {
    probabilita: 15,
    pokemon: [
      { id: 43,  min: 4, max: 6, rate: 30 },   // Oddish
      { id: 46,  min: 5, max: 7, rate: 25 },   // Paras
      { id: 69,  min: 5, max: 8, rate: 20 },   // Bellsprout
      { id: 29,  min: 4, max: 7, rate: 18 },   // Nidoran♀
      { id: 32,  min: 4, max: 7, rate: 18 },   // Nidoran♂
      { id: 187, min: 4, max: 7, rate: 18 },   // Hoppip (Gen2)
      { id: 191, min: 5, max: 7, rate: 16 },   // Sunkern (Gen2)
      { id: 285, min: 5, max: 8, rate: 16 },   // Shroomish (Gen3)
      { id: 315, min: 6, max: 8, rate: 10 },   // Roselia (Gen3, rara)
      { id: 1,   min: 6, max: 8, rate: 3 },    // Bulbasaur (starter rarissimo)
    ],
  },

  // ── PERCORSO 2 — castagneti collinari (Frascati→Grottaferrata) Lv 9-13 ──
  'incontri percorso 2': {
    probabilita: 15,
    pokemon: [
      { id: 16,  min: 9,  max: 11, rate: 25 },  // Pidgey
      { id: 19,  min: 9,  max: 11, rate: 25 },  // Rattata
      { id: 43,  min: 10, max: 12, rate: 20 },  // Oddish
      { id: 29,  min: 9,  max: 12, rate: 18 },  // Nidoran♀
      { id: 32,  min: 9,  max: 12, rate: 18 },  // Nidoran♂
      { id: 179, min: 10, max: 13, rate: 18 },  // Mareep (Gen2)
      { id: 183, min: 9,  max: 12, rate: 18 },  // Marill (Gen2)
      { id: 261, min: 10, max: 12, rate: 15 },  // Poochyena (Gen3)
      { id: 263, min: 9,  max: 11, rate: 15 },  // Zigzagoon (Gen3)
      { id: 273, min: 11, max: 13, rate: 10 },  // Seedot (Gen3)
      { id: 1,   min: 11, max: 13, rate: 3 },   // Bulbasaur (starter rarissimo)
    ],
  },

  // ── PERCORSO 2 — laghetto tra i castagni, accessibile SOLO con MN Surf ──
  // ⭐ REGOLA: le zone Surf sono ANCHE zone di incontri selvatici. Siccome la
  // MN Surf si ottiene molto più avanti (~dopo P5-6), qui i Pokémon sono molto
  // PIÙ FORTI del resto del percorso: chi torna a nuotare è già di alto livello.
  'incontri percorso 2 surf': {
    probabilita: 18,
    pokemon: [
      { id: 54,  min: 25, max: 30, rate: 28 },  // Psyduck
      { id: 60,  min: 25, max: 30, rate: 25 },  // Poliwag
      { id: 183, min: 26, max: 31, rate: 20 },  // Marill
      { id: 184, min: 28, max: 33, rate: 1 },   // Azumarill (3° stadio, rarissimo)
      { id: 90,  min: 26, max: 31, rate: 18 },  // Shellder
      { id: 98,  min: 26, max: 31, rate: 18 },  // Krabby
      { id: 270, min: 25, max: 30, rate: 18 },  // Lotad
      { id: 271, min: 28, max: 32, rate: 12 },  // Lombre
      { id: 339, min: 27, max: 32, rate: 14 },  // Barboach
      { id: 118, min: 27, max: 32, rate: 12 },  // Goldeen
      { id: 130, min: 30, max: 35, rate: 6 },   // Gyarados (raro, forte)
      { id: 7,   min: 28, max: 32, rate: 3 },   // Squirtle (starter rarissimo)
    ],
  },

  // ── PERCORSO 3 — campagna verso il lago (Grottaferrata → Marino), Lv 10-16 ──
  // Mix Gen 1-2-3, comparsa dei primi Pokémon d'acqua (il lago è vicino).
  // ATTIVA: percorso_3.tmj ha le zone erba_alta con id = "incontri percorso 3".
  'incontri percorso 3': {
    probabilita: 15,
    pokemon: [
      { id: 41,  min: 10, max: 13, rate: 25 },  // Zubat
      { id: 43,  min: 10, max: 13, rate: 20 },  // Oddish
      { id: 60,  min: 11, max: 14, rate: 20 },  // Poliwag
      { id: 98,  min: 11, max: 14, rate: 18 },  // Krabby
      { id: 183, min: 10, max: 13, rate: 20 },  // Marill (Gen2)
      { id: 193, min: 11, max: 14, rate: 15 },  // Yanma (Gen2)
      { id: 270, min: 11, max: 15, rate: 15 },  // Lotad (Gen3)
      { id: 278, min: 11, max: 15, rate: 15 },  // Wingull (Gen3)
      { id: 283, min: 12, max: 16, rate: 10 },  // Surskit (Gen3)
      { id: 54,  min: 12, max: 16, rate: 12 },  // Psyduck
      { id: 158, min: 12, max: 15, rate: 3 },   // Totodile (starter rarissimo)
    ],
  },

  // ── PERCORSO 4 — salita verso Monte Porzio/Osservatorio (Lv 12-19, tema Elettro) ──
  // Tabella dal reminder MOD 3. PRONTA: si attiva quando Percorso_4.tmj avrà
  // oggetti zona erba_alta (layer eventi) con id = "incontri percorso 4".
  'incontri percorso 4': {
    probabilita: 15,
    pokemon: [
      { id: 81,  min: 12, max: 15, rate: 25 },  // Magnemite
      { id: 100, min: 13, max: 16, rate: 20 },  // Voltorb
      { id: 84,  min: 12, max: 16, rate: 20 },  // Doduo
      { id: 21,  min: 13, max: 17, rate: 20 },  // Spearow
      { id: 180, min: 13, max: 17, rate: 18 },  // Flaaffy (Gen2)
      { id: 239, min: 12, max: 16, rate: 15 },  // Elekid (Gen2)
      { id: 170, min: 13, max: 17, rate: 15 },  // Chinchou (Gen2)
      { id: 309, min: 13, max: 17, rate: 15 },  // Electrike (Gen3)
      { id: 311, min: 14, max: 18, rate: 10 },  // Plusle (Gen3)
      { id: 312, min: 14, max: 18, rate: 10 },  // Minun (Gen3)
      { id: 155, min: 14, max: 17, rate: 3 },   // Cyndaquil (starter rarissimo)
    ],
  },

  // ── MARINO — erba alta tra le vigne (Lv 12-17) ──
  // ATTIVA: marino_v3.tmj ha già le zone erba_alta con id = "incontri marino".
  // Specie nuove rispetto ai percorsi precedenti (obiettivo: tutte le specie
  // incontrabili nel gioco, ogni zona ne introduce di diverse).
  'incontri marino': {
    probabilita: 15,
    pokemon: [
      { id: 48,  min: 12, max: 15, rate: 25 },  // Venonat
      { id: 167, min: 12, max: 15, rate: 20 },  // Spinarak (Gen2)
      { id: 293, min: 12, max: 16, rate: 20 },  // Whismur (Gen3)
      { id: 300, min: 12, max: 16, rate: 16 },  // Skitty (Gen3)
      { id: 316, min: 13, max: 17, rate: 15 },  // Gulpin (Gen3)
      { id: 188, min: 14, max: 17, rate: 12 },  // Skiploom (Gen2, evoluto)
      { id: 44,  min: 14, max: 17, rate: 10 },  // Gloom (evoluto)
      { id: 214, min: 14, max: 17, rate: 5 },   // Heracross (raro, tra i filari)
      { id: 152, min: 13, max: 16, rate: 3 },   // Chikorita (starter rarissimo)
    ],
  },

  // ── MARINO — in acqua col Surf (Lv 12-18) ──
  // ⭐ Prima zona Surf del gioco (Moro dà la MN qui dopo la palestra): livelli
  // bassi ma già specie diverse da quelle dell'erba di Marino.
  // ATTIVA: ogni casella acquaSurf è automaticamente zona incontri (motore),
  // la chiave è l'"id" già presente sui rettangoli trigger_surf nel .tmj.
  'acqua_marino_surf': {
    probabilita: 15,
    pokemon: [
      { id: 54,  min: 12, max: 16, rate: 28 },  // Psyduck
      { id: 60,  min: 12, max: 16, rate: 25 },  // Poliwag
      { id: 118, min: 13, max: 17, rate: 20 },  // Goldeen
      { id: 183, min: 12, max: 16, rate: 18 },  // Marill (Gen2)
      { id: 270, min: 12, max: 16, rate: 18 },  // Lotad (Gen3)
      { id: 90,  min: 14, max: 18, rate: 12 },  // Shellder
      { id: 7,   min: 15, max: 18, rate: 3 },   // Squirtle (starter rarissimo)
    ],
  },

  // ── LAGO ALBANO — spiaggia, erba alta sulla riva (Lv 15-22) ──
  // PRONTA: in "Lago di Albano.tmj" creare zone erba_alta (layer eventi) con
  // id = "incontri lago albano".
  'incontri lago albano': {
    probabilita: 15,
    pokemon: [
      { id: 54,  min: 15, max: 19, rate: 25 },  // Psyduck
      { id: 194, min: 15, max: 19, rate: 22 },  // Wooper (Gen2)
      { id: 183, min: 16, max: 20, rate: 18 },  // Marill (Gen2)
      { id: 270, min: 15, max: 19, rate: 18 },  // Lotad (Gen3)
      { id: 278, min: 16, max: 21, rate: 18 },  // Wingull (Gen3)
      { id: 118, min: 16, max: 21, rate: 14 },  // Goldeen
      { id: 79,  min: 17, max: 22, rate: 12 },  // Slowpoke
      { id: 55,  min: 20, max: 22, rate: 6 },   // Golduck (raro, evoluto)
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
      { id: 54,  min: 18, max: 22, rate: 28 },  // Psyduck
      { id: 60,  min: 18, max: 23, rate: 25 },  // Poliwag
      { id: 90,  min: 20, max: 24, rate: 22 },  // Shellder
      { id: 116, min: 19, max: 24, rate: 20 },  // Horsea
      { id: 170, min: 18, max: 23, rate: 20 },  // Chinchou (Gen2)
      { id: 194, min: 20, max: 25, rate: 18 },  // Wooper (Gen2)
      { id: 258, min: 20, max: 25, rate: 12 },  // Mudkip (Gen3, raro)
      { id: 318, min: 24, max: 28, rate: 10 },  // Carvanha (Gen3)
      { id: 130, min: 25, max: 28, rate: 5 },   // Gyarados (raro, forte)
      { id: 7,   min: 21, max: 25, rate: 3 },   // Squirtle (starter rarissimo)
    ],
  },

  // ── CASTEL GANDOLFO — giardini e riva del borgo (Lv 16-23) ──
  // PRONTA: in castel_gandolfo_v2.tmj creare zone erba_alta con
  // id = "incontri castel gandolfo".
  'incontri castel gandolfo': {
    probabilita: 15,
    pokemon: [
      { id: 54,  min: 16, max: 20, rate: 22 },  // Psyduck
      { id: 194, min: 16, max: 20, rate: 20 },  // Wooper (Gen2)
      { id: 177, min: 16, max: 20, rate: 18 },  // Natu (Gen2, nei giardini)
      { id: 90,  min: 17, max: 21, rate: 16 },  // Shellder
      { id: 222, min: 17, max: 21, rate: 12 },  // Corsola (Gen2)
      { id: 170, min: 18, max: 22, rate: 12 },  // Chinchou (Gen2)
      { id: 318, min: 19, max: 23, rate: 8 },   // Carvanha (Gen3, raro)
      { id: 258, min: 18, max: 22, rate: 3 },   // Mudkip (starter rarissimo)
    ],
  },

  // ── PERCORSO 5 — salita montana verso Rocca di Papa (Lv 16-24) ──
  // Tema roccia/vulcano (il cratere è vicino). PRONTA: in Percorso_5.tmj
  // creare zone erba_alta con id = "incontri percorso 5".
  'incontri percorso 5': {
    probabilita: 15,
    pokemon: [
      { id: 66,  min: 16, max: 20, rate: 22 },  // Machop
      { id: 74,  min: 16, max: 20, rate: 20 },  // Geodude
      { id: 231, min: 16, max: 20, rate: 18 },  // Phanpy (Gen2)
      { id: 322, min: 17, max: 22, rate: 18 },  // Numel (Gen3, vulcanico)
      { id: 216, min: 17, max: 21, rate: 16 },  // Teddiursa (Gen2)
      { id: 333, min: 17, max: 22, rate: 14 },  // Swablu (Gen3)
      { id: 325, min: 17, max: 21, rate: 14 },  // Spoink (Gen3)
      { id: 304, min: 18, max: 22, rate: 12 },  // Aron (Gen3)
      { id: 246, min: 20, max: 24, rate: 4 },   // Larvitar (rarissimo di montagna)
    ],
  },

  // ── VIA DEI LAGHI — erba alta lungo la strada tra i laghi (Lv 18-30) ──
  // ATTIVA: marcatore erba_alta aggiunto in via_dei_laghi.tmj con questo id
  // (il tile erba viene riconosciuto automaticamente dal motore, vedi
  // js/map.js _buildErbaAltaTiles — non serve ridisegnare la zona a mano).
  'incontri via dei laghi': {
    probabilita: 15,
    pokemon: [
      { id: 187, min: 18, max: 22, rate: 25 },  // Hoppip (Gen2)
      { id: 285, min: 18, max: 22, rate: 22 },  // Shroomish (Gen3)
      { id: 313, min: 19, max: 23, rate: 18 },  // Volbeat (Gen3)
      { id: 314, min: 19, max: 23, rate: 18 },  // Illumise (Gen3)
      { id: 205, min: 20, max: 24, rate: 16 },  // Forretress (Gen2)
      { id: 227, min: 21, max: 26, rate: 14 },  // Skarmory (Gen2, raro)
      { id: 213, min: 20, max: 25, rate: 10 },  // Shuckle (Gen2, rarissimo)
      { id: 172, min: 22, max: 28, rate: 4 },   // Pichu (Gen2, rarissimo)
    ],
  },

  // ── OSSERVATORIO — prati intorno alla cupola (Lv 26-32) ──
  // ATTIVA: marcatore erba_alta aggiunto in Osservatorio.tmj con questo id.
  // Tema cielo/scienza: uccelli, psico, elettro (coerente con Zapdos e il
  // meteorologo del posto).
  'incontri osservatorio': {
    probabilita: 15,
    pokemon: [
      { id: 63,  min: 26, max: 30, rate: 22 },  // Abra
      { id: 96,  min: 26, max: 30, rate: 20 },  // Drowzee
      { id: 100, min: 26, max: 30, rate: 18 },  // Voltorb
      { id: 333, min: 27, max: 31, rate: 16 },  // Swablu (Gen3)
      { id: 198, min: 27, max: 31, rate: 14 },  // Murkrow (Gen2)
      { id: 337, min: 28, max: 32, rate: 8 },   // Lunatone (Gen3, tema cielo)
      { id: 338, min: 28, max: 32, rate: 8 },   // Solrock (Gen3, tema cielo)
    ],
  },

  // ── PERCORSO MONTANO 1 — salita innevata verso Rocca di Papa (Lv 30-38) ──
  // ATTIVA: marcatore erba_alta aggiunto in percorso_montano_v1.tmj con
  // questo id. Quota alta, clima freddo: roccia, ghiaccio, orso.
  'incontri percorso montano': {
    probabilita: 15,
    pokemon: [
      { id: 74,  min: 30, max: 34, rate: 22 },  // Geodude
      { id: 220, min: 30, max: 34, rate: 20 },  // Swinub (Gen2)
      { id: 216, min: 31, max: 35, rate: 18 },  // Teddiursa (Gen2)
      { id: 361, min: 31, max: 35, rate: 16 },  // Snorunt (Gen3)
      { id: 246, min: 32, max: 36, rate: 14 },  // Larvitar (raro di montagna)
      { id: 225, min: 32, max: 37, rate: 8 },   // Delibird (Gen2, raro)
    ],
  },

  // ── MONTE PORZIO CATONE — città (Lv 24-30) ──
  // NUOVA (sessione 6 agosto): mancava del tutto, nonostante la città esista
  // da tempo. Serve un rettangolo erba_alta con questo id in monteporzio.tmj.
  'incontri monteporzio': {
    probabilita: 15,
    pokemon: [
      { id: 27,  min: 24, max: 27, rate: 22 },  // Sandshrew
      { id: 39,  min: 24, max: 27, rate: 18 },  // Jigglypuff
      { id: 58,  min: 25, max: 29, rate: 18 },  // Growlithe
      { id: 190, min: 25, max: 29, rate: 16 },  // Aipom (Gen2)
      { id: 209, min: 26, max: 30, rate: 16 },  // Snubbull (Gen2)
      { id: 25,  min: 24, max: 28, rate: 5 },   // Pikachu (raro)
      { id: 234, min: 28, max: 30, rate: 6 },   // Stantler (Gen2, raro)
    ],
  },

  // ── ROCCA DI PAPA — città, tema roccia/cratere (Lv 32-38) ──
  // NUOVA (sessione 6 agosto): mancava del tutto nonostante la 5ª palestra
  // esista già. Serve un rettangolo erba_alta con questo id in rocca_di_papa.tmj.
  'incontri rocca di papa': {
    probabilita: 15,
    pokemon: [
      { id: 95,  min: 32, max: 35, rate: 22 },  // Onix
      { id: 111, min: 32, max: 36, rate: 20 },  // Rhyhorn
      { id: 185, min: 33, max: 36, rate: 18 },  // Sudowoodo (Gen2)
      { id: 299, min: 33, max: 37, rate: 18 },  // Nosepass (Gen3)
      { id: 328, min: 32, max: 35, rate: 14 },  // Trapinch (Gen3)
      { id: 75,  min: 34, max: 38, rate: 10 },  // Graveler (evoluto, raro)
      { id: 112, min: 36, max: 38, rate: 4 },   // Rhydon (evoluto, rarissimo)
    ],
  },

  // ── PERCORSO 7 — tra Rocca di Papa e Albano (Lv 34-40) ──
  // NUOVA: percorso_7 aveva sia gli ID trainer duplicati da Percorso 3 sia
  // nessuna tabella incontri propria. Serve un rettangolo erba_alta con
  // questo id in percorso_7.tmj.
  'incontri percorso 7': {
    probabilita: 15,
    pokemon: [
      { id: 215, min: 34, max: 38, rate: 20 },  // Sneasel (Gen2)
      { id: 267, min: 34, max: 37, rate: 1 },   // Beautifly (Gen3, 3° stadio, rarissimo)
      { id: 269, min: 34, max: 37, rate: 1 },   // Dustox (Gen3, 3° stadio, rarissimo)
      { id: 352, min: 35, max: 39, rate: 16 },  // Kecleon (Gen3)
      { id: 241, min: 36, max: 39, rate: 10 },  // Miltank (Gen2)
      { id: 355, min: 37, max: 40, rate: 6 },   // Duskull (Gen3, raro)
    ],
  },

  // ── ALBANO LAZIALE — città, tema Lotta (Lv 40-46) ──
  // NUOVA: 6ª città, mai avuta una tabella incontri.
  'incontri albano': {
    probabilita: 15,
    pokemon: [
      { id: 296, min: 40, max: 43, rate: 22 },  // Makuhita (Gen3)
      { id: 307, min: 40, max: 44, rate: 20 },  // Meditite (Gen3)
      { id: 67,  min: 41, max: 45, rate: 18 },  // Machoke (evoluto)
      { id: 128, min: 42, max: 46, rate: 14 },  // Tauros
      { id: 236, min: 40, max: 42, rate: 10 },  // Tyrogue (Gen2, raro)
      { id: 237, min: 44, max: 46, rate: 6 },   // Hitmontop (Gen2, raro)
    ],
  },

  // ── PERCORSO 8 — tra Albano e Zona Safari/Percorso 9 (Lv 40-46) ──
  // NUOVA: la mappa aveva già trainer (all-p8-*) ma nessuna tabella incontri.
  'incontri percorso 8': {
    probabilita: 15,
    pokemon: [
      { id: 42,  min: 40, max: 43, rate: 20 },  // Golbat (evoluto)
      { id: 168, min: 40, max: 44, rate: 18 },  // Ariados (Gen2, evoluto)
      { id: 274, min: 41, max: 45, rate: 18 },  // Nuzleaf (Gen3, evoluto)
      { id: 262, min: 42, max: 46, rate: 16 },  // Mightyena (Gen3, evoluto)
      { id: 291, min: 43, max: 46, rate: 8 },   // Ninjask (Gen3, raro)
    ],
  },

  // ── ZONA SAFARI — specie esclusive, ingresso a pagamento (Lv 30-45) ──
  // NUOVA: gate/pagamento già pronti da tempo (sessione 39), ma nessuna
  // specie era mai stata assegnata. Range ampio: è una zona bonus opzionale.
  'incontri zona safari': {
    probabilita: 20,
    pokemon: [
      { id: 127, min: 30, max: 36, rate: 20 },  // Pinsir
      { id: 85,  min: 32, max: 38, rate: 18 },  // Dodrio
      { id: 217, min: 35, max: 40, rate: 16 },  // Ursaring (Gen2, evoluto)
      { id: 335, min: 33, max: 40, rate: 14 },  // Zangoose (Gen3)
      { id: 336, min: 33, max: 40, rate: 14 },  // Seviper (Gen3)
      { id: 115, min: 36, max: 42, rate: 8 },   // Kangaskhan (rara)
      { id: 113, min: 30, max: 40, rate: 4 },   // Chansey (rarissima)
    ],
  },

  // ── PERCORSO 9 — sale verso Ariccia (Lv 44-50) ──
  // NUOVA: aveva già trainer (all-p9-*) ma nessuna tabella incontri.
  // Anticipa il tema Buio/notte della palestra di Ariccia (Ombretta).
  'incontri percorso 9': {
    probabilita: 15,
    pokemon: [
      { id: 353, min: 44, max: 47, rate: 20 },  // Shuppet (Gen3)
      { id: 302, min: 44, max: 48, rate: 18 },  // Sableye (Gen3)
      { id: 286, min: 45, max: 49, rate: 16 },  // Breloom (Gen3, evoluto)
      { id: 354, min: 46, max: 50, rate: 12 },  // Banette (Gen3, evoluto)
      { id: 356, min: 48, max: 50, rate: 5 },   // Dusclops (Gen3, rarissimo)
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
      { id: 330, min: 30, max: 32, rate: 1 },   // Flygon (Gen3, 3° stadio, rarissimo)
      { id: 306, min: 31, max: 32, rate: 1 },   // Aggron (Gen3, 3° stadio, rarissimo)
      { id: 208, min: 32, max: 32, rate: 6 },   // Steelix (evoluto rarissimo)
    ],
  },
  'incontri tunnel roccioso 4f': {
    probabilita: 7,
    pokemon: [
      { id: 76,  min: 32, max: 33, rate: 8 },   // Golem (3° stadio, rarissimo)
      { id: 169, min: 32, max: 34, rate: 6 },   // Crobat (Gen2, 3° stadio, rarissimo)
      { id: 289, min: 33, max: 34, rate: 5 },   // Slaking (Gen3, 3° stadio, rarissimo)
      { id: 248, min: 34, max: 34, rate: 3 },   // Tyranitar (Gen2, 3° stadio, rarissimo)
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
      { id: 157, min: 54, max: 58, rate: 1 },   // Typhlosion (3° stadio, rarissimo)
    ],
  },

  // ── ARICCIA — città, tema Buio (Lv 46-52, Capopalestra Ombretta) ──
  // NUOVA: 7ª città, mai avuta una tabella incontri (né rettangolo erba_alta).
  'incontri ariccia': {
    probabilita: 15,
    pokemon: [
      { id: 164, min: 46, max: 49, rate: 20 },  // Noctowl (Gen2, evoluto)
      { id: 200, min: 46, max: 50, rate: 18 },  // Misdreavus (Gen2)
      { id: 292, min: 47, max: 50, rate: 10 },  // Shedinja (Gen3, raro/unico)
      { id: 359, min: 48, max: 51, rate: 12 },  // Absol (Gen3, raro)
      { id: 197, min: 50, max: 52, rate: 5 },   // Umbreon (Gen2, rarissimo)
    ],
  },

  // ── PERCORSO 10 — Ariccia → Genzano (world Castelli_lasthree), Lv 53-57,
  // tema fiori/giardino (avvicinamento all'Infiorata di Genzano). L'erba_alta
  // segnaposto ("incontri percorso 10") era già piazzata su Percorso_10.tmj,
  // solo la tabella mancava — sessione 8 agosto. ──
  'incontri percorso 10': {
    probabilita: 15,
    pokemon: [
      { id: 192, min: 53, max: 55, rate: 25 },  // Sunflora (Gen2)
      { id: 166, min: 53, max: 56, rate: 20 },  // Ledian (Gen2)
      { id: 45,  min: 54, max: 56, rate: 1 },  // Vileplume (evoluto)
      { id: 182, min: 54, max: 57, rate: 1 },  // Bellossom (Gen2, evoluto)
      { id: 284, min: 55, max: 57, rate: 5 },   // Masquerain (Gen3, raro)
    ],
  },

  // ── PERCORSO 11 — biforcazione Grottaferrata → Rocca di Papa, verso Monte
  // Cavo (world FrascatiGrotta), Lv 28-35, tema montano/roccioso (coerente
  // coi trainer Escursionisti/Scalatori già piazzati). Nuova, sessione 8
  // agosto (rettangolo erba_alta segnaposto aggiunto insieme alla tabella). ──
  'incontri percorso 11': {
    probabilita: 15,
    pokemon: [
      { id: 299, min: 28, max: 31, rate: 25 },  // Nosepass (Gen3)
      { id: 304, min: 29, max: 32, rate: 22 },  // Aron (Gen3)
      { id: 322, min: 30, max: 33, rate: 18 },  // Numel (Gen3)
      { id: 305, min: 32, max: 34, rate: 10 },  // Lairon (Gen3, evoluto)
      { id: 323, min: 33, max: 35, rate: 5 },   // Camerupt (Gen3, evoluto, raro)
    ],
  },

  // ── COLLEGAMENTO COTRAL — diramazione verso il nascondiglio CoTrAL ai piedi
  // di Monte Cavo (world FrascatiGrotta), Lv 30-36, tema industriale/scarti
  // (coerente con la presenza dei grunt CoTrAL). Nuova, sessione 8 agosto. ──
  'incontri collegamento cotral': {
    probabilita: 15,
    pokemon: [
      { id: 88,  min: 30, max: 33, rate: 25 },  // Grimer
      { id: 343, min: 30, max: 33, rate: 22 },  // Baltoy (Gen3)
      { id: 89,  min: 32, max: 34, rate: 15 },  // Muk (evoluto)
      { id: 344, min: 32, max: 35, rate: 12 },  // Claydol (Gen3, evoluto)
      { id: 374, min: 34, max: 36, rate: 4 },   // Beldum (Gen3, rarissimo)
    ],
  },

  // ── GENZANO — città (8ª e ultima, Palestra Fuoco, Capopalestra Flora,
  // cap 58), tema Fuoco/lava che fa fiorire l'Infiorata. Tabella pronta ma
  // NON ancora agganciata a nessun rettangolo erba_alta: la mappa Genzano.tmj
  // non ha ancora nessun layer oggetti (vedi ROADMAP sessione 8 agosto) —
  // quando Luca disegna l'erba vera in Tiled basta un rettangolo con
  // id:'incontri genzano' per attivarla, come per le altre città. ──
  'incontri genzano': {
    probabilita: 15,
    pokemon: [
      { id: 37,  min: 55, max: 57, rate: 25 },  // Vulpix
      { id: 58,  min: 55, max: 58, rate: 20 },  // Growlithe
      { id: 77,  min: 56, max: 58, rate: 18 },  // Ponyta
      { id: 78,  min: 57, max: 58, rate: 10 },  // Rapidash (evoluto)
      { id: 219, min: 57, max: 58, rate: 5 },   // Magcargo (evoluto, raro)
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
      { id: 76,  min: 60, max: 62, rate: 1 },   // Golem (evoluto, raro)
      { id: 248, min: 62, max: 63, rate: 1 },   // Tyranitar (rarissimo)
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
      { id: 184, min: 59, max: 61, rate: 1 },   // Azumarill (evoluto, raro)
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
      { id: 169, min: 60, max: 62, rate: 1 },   // Crobat (evoluto, raro)
      { id: 359, min: 61, max: 63, rate: 4 },   // Absol (rarissimo)
    ],
  },
  'incontri via vittoria 4f': {
    probabilita: 16,
    pokemon: [
      { id: 304, min: 56, max: 59, rate: 20 },  // Aron
      { id: 305, min: 58, max: 61, rate: 12 },  // Lairon
      { id: 306, min: 61, max: 63, rate: 1 },   // Aggron (evoluto, rarissimo)
      { id: 231, min: 55, max: 58, rate: 20 },  // Phanpy
      { id: 232, min: 59, max: 62, rate: 10 },  // Donphan (evoluto, raro)
      { id: 66,  min: 54, max: 57, rate: 18 },  // Machop
      { id: 67,  min: 57, max: 60, rate: 12 },  // Machoke
      { id: 68,  min: 61, max: 63, rate: 1 },   // Machamp (evoluto, rarissimo)
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
      { id: 330, min: 62, max: 63, rate: 1 },   // Flygon (evoluto, rarissimo)
      { id: 344, min: 56, max: 59, rate: 13 },  // Claydol
    ],
  },

};

// Alias: il singolo tile "acqua profonda lago di nemi" (Lago di Albano
// interno.tmj) ha un id Tiled proprio invece di "acqua_lago di albano_surf"
// — è la stessa acqua dello stesso lago, non una zona a parte, quindi riusa
// la stessa tabella invece di restare senza incontri (PROBLEMA 1, sessione
// 31 agosto: prima normTipo non riconosceva nemmeno quel tile come
// surfabile — vedi js/map.js — ora lo è, ma senza questo alias non
// troverebbe comunque una tabella incontri).
DATI_INCONTRI['acqua profonda lago di nemi'] = DATI_INCONTRI['acqua_lago di albano_surf'];

if (typeof module !== 'undefined' && module.exports) module.exports = DATI_INCONTRI;
