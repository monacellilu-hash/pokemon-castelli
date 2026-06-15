/* ============================================================
   world.js — Zone geografiche e tabelle incontri selvatici
   Le zone sono elencate in ordine di priorità: la funzione
   trovaZona restituisce la PRIMA zona che contiene il giocatore,
   quindi le zone piccole e specifiche vanno prima di quelle grandi.
   ============================================================ */

const World = (function () {

  // Copia locale di distanzaMetri per non dipendere da map.js
  function distanzaMetri(a, b) {
    const R = 111320;
    const dLat = (b.lat - a.lat) * R;
    const dLon = (b.lon - a.lon) * R * Math.cos(a.lat * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  // Tabella incontri condivisa da tutti i centri urbani (pochi incontri)
  const INCONTRI_URBANI = [
    { id: 19,  prob: 45 },   // Rattata
    { id: 52,  prob: 25 },   // Meowth
    { id: 198, prob: 15 },   // Murkrow (corvo cittadino)
    { id: 16,  prob: 15 },   // Pidgey (piccione)
  ];

  /* ----------------------------------------------------------
     ZONE: ordine priorità (più specifica = prima nell'array)
     Ogni zona: id, nome, terreno, livMin, livMax,
       tipo ('cerchio' o 'rettangolo'), geometria,
       locked (bool), mnRichiesta (str, opzionale),
       tassoIncontro (float, default 0.15),
       incontri: [{ id, prob }]  (prob sommano a 100)
     ---------------------------------------------------------- */
  const ZONE = [

    // ── ZONE SPECIALI ─────────────────────────────────────

    // Grotta del Vulcano: fianco del Monte Cavo, crateri vulcanici
    {
      id: 'grotta-vulcano',
      nome: 'Grotta del Vulcano',
      terreno: 'grotta',
      livMin: 15, livMax: 25,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7490, lon: 12.7140 },
      raggio: 600,
      tassoIncontro: 0.20,  // più pericolosa del solito
      incontri: [
        { id: 41,  prob: 35 },  // Zubat
        { id: 42,  prob: 10 },  // Golbat
        { id: 74,  prob: 25 },  // Geodude
        { id: 75,  prob: 8  },  // Graveler
        { id: 50,  prob: 12 },  // Diglett
        { id: 95,  prob: 5  },  // Onix
        { id: 322, prob: 5  },  // Numel (Gen 3, tema vulcano)
      ]
    },

    // Lago di Nemi: "specchio di Diana", cratere vulcanico avanzato
    // Centro corretto sul LAGO (non sul paese di Nemi che è sul bordo nord del cratere)
    {
      id: 'lago-nemi',
      nome: 'Lago di Nemi',
      terreno: 'acqua',
      livMin: 25, livMax: 40,
      locked: true,
      mnRichiesta: 'Surf',
      tipo: 'cerchio',
      centro: { lat: 41.7140, lon: 12.7130 },
      raggio: 750,
      incontri: [
        { id: 130, prob: 10 },  // Gyarados
        { id: 60,  prob: 8  },  // Poliwag
        { id: 61,  prob: 12 },  // Poliwhirl
        { id: 62,  prob: 5  },  // Poliwrath
        { id: 183, prob: 8  },  // Marill
        { id: 184, prob: 7  },  // Azumarill
        { id: 118, prob: 10 },  // Goldeen
        { id: 119, prob: 8  },  // Seaking
        { id: 194, prob: 10 },  // Wooper
        { id: 195, prob: 7  },  // Quagsire
        { id: 270, prob: 10 },  // Lotad
        { id: 271, prob: 5  },  // Lombre
      ]
    },

    // Lago Albano: grande lago di cratere, centro sul pelo d'acqua
    {
      id: 'lago-albano',
      nome: 'Lago Albano',
      terreno: 'acqua',
      livMin: 15, livMax: 25,
      locked: true,
      mnRichiesta: 'Surf',
      tipo: 'cerchio',
      centro: { lat: 41.7480, lon: 12.6540 },
      raggio: 1450,
      incontri: [
        { id: 129, prob: 40 },  // Magikarp
        { id: 60,  prob: 15 },  // Poliwag
        { id: 61,  prob: 8  },  // Poliwhirl
        { id: 183, prob: 15 },  // Marill
        { id: 118, prob: 10 },  // Goldeen
        { id: 194, prob: 8  },  // Wooper
        { id: 270, prob: 4  },  // Lotad
      ]
    },

    // ── CENTRI URBANI (prima di monte-cavo e boschi per priorità) ─

    // Città di partenza (F7): quartiere sicuro alla periferia di Roma,
    // sede del laboratorio del Professore. Incontri quasi assenti.
    {
      id: 'citta-partenza',
      nome: 'Quartiere Tuscolano',
      terreno: 'urbano',
      livMin: 2, livMax: 4,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.8420, lon: 12.6150 },
      raggio: 400,
      tassoIncontro: 0.03,
      incontri: [
        { id: 19, prob: 55 },   // Rattata
        { id: 16, prob: 45 },   // Pidgey (piccione di periferia)
      ]
    },

    {
      id: 'centro-genzano',
      nome: 'Genzano di Roma',
      terreno: 'urbano',
      livMin: 14, livMax: 22,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7068, lon: 12.6898 },
      raggio: 450,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    {
      id: 'centro-ariccia',
      nome: 'Ariccia',
      terreno: 'urbano',
      livMin: 12, livMax: 20,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7212, lon: 12.6720 },
      raggio: 450,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    {
      id: 'centro-albano',
      nome: 'Albano Laziale',
      terreno: 'urbano',
      livMin: 12, livMax: 20,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7310, lon: 12.6560 },
      raggio: 450,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    // Rocca di Papa PRIMA di monte-cavo (il borgo è dentro il cerchio del monte)
    {
      id: 'centro-rocca-di-papa',
      nome: 'Rocca di Papa',
      terreno: 'urbano',
      livMin: 10, livMax: 18,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7608, lon: 12.7096 },
      raggio: 400,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    {
      id: 'centro-marino',
      nome: 'Marino',
      terreno: 'urbano',
      livMin: 5, livMax: 10,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7686, lon: 12.6624 },
      raggio: 400,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    {
      id: 'centro-monte-porzio',
      nome: 'Monte Porzio Catone',
      terreno: 'urbano',
      livMin: 8, livMax: 15,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.8164, lon: 12.7153 },
      raggio: 350,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    {
      id: 'centro-grottaferrata',
      nome: 'Grottaferrata',
      terreno: 'urbano',
      livMin: 5, livMax: 10,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7858, lon: 12.6668 },
      raggio: 400,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    {
      id: 'centro-frascati',
      nome: 'Frascati',
      terreno: 'urbano',
      livMin: 3, livMax: 8,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.8036, lon: 12.6796 },
      raggio: 450,
      tassoIncontro: 0.05,
      incontri: INCONTRI_URBANI
    },

    // ── ZONE NATURALI ──────────────────────────────────────

    // Monte Cavo / Maschio delle Faete: alta difficoltà, zona pre-Lega
    {
      id: 'monte-cavo',
      nome: 'Monte Cavo',
      terreno: 'montagna',
      livMin: 35, livMax: 50,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7485, lon: 12.7105 },
      raggio: 1800,
      incontri: [
        { id: 74,  prob: 15 },  // Geodude
        { id: 75,  prob: 12 },  // Graveler
        { id: 76,  prob: 5  },  // Golem
        { id: 66,  prob: 10 },  // Machop
        { id: 67,  prob: 8  },  // Machoke
        { id: 227, prob: 10 },  // Skarmory
        { id: 22,  prob: 10 },  // Fearow
        { id: 95,  prob: 8  },  // Onix
        { id: 208, prob: 5  },  // Steelix
        { id: 111, prob: 7  },  // Rhyhorn
        { id: 112, prob: 5  },  // Rhydon
        { id: 84,  prob: 5  },  // Doduo
      ]
    },

    // Boschi del Tuscolo: parco regionale intorno al sito archeologico
    // Raggio ridotto a 1100 m per seguire il perimetro del parco reale
    {
      id: 'boschi-tuscolo',
      nome: 'Boschi del Tuscolo',
      terreno: 'bosco',
      livMin: 5, livMax: 11,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7920, lon: 12.7370 },
      raggio: 1100,
      incontri: [
        { id: 10,  prob: 12 },  // Caterpie
        { id: 11,  prob: 8  },  // Metapod
        { id: 13,  prob: 12 },  // Weedle
        { id: 14,  prob: 8  },  // Kakuna
        { id: 43,  prob: 15 },  // Oddish
        { id: 69,  prob: 12 },  // Bellsprout
        { id: 187, prob: 10 },  // Hoppip
        { id: 285, prob: 10 },  // Shroomish
        { id: 74,  prob: 8  },  // Geodude (tra le rovine)
        { id: 265, prob: 5  },  // Wurmple
      ]
    },

    // Vigne di Marino: zone viticole a sud/sud-est di Marino
    {
      id: 'vigne-marino',
      nome: 'Vigne di Marino',
      terreno: 'vigne',
      livMin: 4, livMax: 9,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7570, lon: 12.6730 },
      raggio: 850,
      incontri: [
        { id: 43,  prob: 20 },  // Oddish
        { id: 44,  prob: 8  },  // Gloom
        { id: 69,  prob: 18 },  // Bellsprout
        { id: 70,  prob: 6  },  // Weepinbell
        { id: 187, prob: 15 },  // Hoppip
        { id: 188, prob: 5  },  // Skiploom
        { id: 16,  prob: 10 },  // Pidgey
        { id: 19,  prob: 8  },  // Rattata
        { id: 165, prob: 10 },  // Ledyba (coccinella nel vigneto)
      ]
    },

    // Vigne di Frascati: DOC Frascati, colline a est/sud-est del paese
    {
      id: 'vigne-frascati',
      nome: 'Vigne di Frascati',
      terreno: 'vigne',
      livMin: 3, livMax: 8,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.8020, lon: 12.6960 },
      raggio: 950,
      incontri: [
        { id: 43,  prob: 25 },  // Oddish
        { id: 69,  prob: 20 },  // Bellsprout
        { id: 187, prob: 15 },  // Hoppip
        { id: 16,  prob: 15 },  // Pidgey
        { id: 19,  prob: 10 },  // Rattata
        { id: 10,  prob: 8  },  // Caterpie
        { id: 165, prob: 7  },  // Ledyba
      ]
    },

    // Percorso Tuscolana: Via Tuscolana Roma→Frascati, zona tutorial
    {
      id: 'percorso-tuscolana',
      nome: 'Percorso Tuscolana',
      terreno: 'prato',
      livMin: 2, livMax: 6,
      locked: false,
      tipo: 'rettangolo',
      latMin: 41.795, latMax: 41.875,
      lonMin: 12.620, lonMax: 12.688,
      incontri: [
        { id: 16,  prob: 30 },  // Pidgey
        { id: 19,  prob: 25 },  // Rattata
        { id: 10,  prob: 12 },  // Caterpie
        { id: 13,  prob: 12 },  // Weedle
        { id: 161, prob: 8  },  // Sentret
        { id: 263, prob: 7  },  // Zigzagoon
        { id: 261, prob: 4  },  // Poochyena
        { id: 163, prob: 2  },  // Hoothoot
      ]
    },

    // Boschetto Segreto: radura nascosta dietro l'Abbazia di Grottaferrata,
    // chiusa da un alberello finché non si ottiene la MN Taglio.
    {
      id: 'boschetto-taglio',
      nome: 'Boschetto Segreto',
      terreno: 'bosco',
      livMin: 9, livMax: 15,
      locked: true,
      mnRichiesta: 'Taglio',
      tipo: 'cerchio',
      centro: { lat: 41.7830, lon: 12.6760 },
      raggio: 380,
      incontri: [
        { id: 44,  prob: 18 },  // Gloom
        { id: 70,  prob: 16 },  // Weepinbell
        { id: 188, prob: 15 },  // Skiploom
        { id: 17,  prob: 12 },  // Pidgeotto
        { id: 162, prob: 10 },  // Furret
        { id: 46,  prob: 10 },  // Paras
        { id: 102, prob: 8  },  // Exeggcute
        { id: 234, prob: 6  },  // Stantler
        { id: 48,  prob: 5  },  // Venonat
      ]
    },

    // ── Lab CoTrAL #1 (periferia Marino) — dungeon-indizi post-P3 ──
    {
      id: 'lab-cotral-1',
      nome: 'Lab CoTrAL #1',
      terreno: 'interno',
      livMin: 22, livMax: 30,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7725, lon: 12.6560 },
      raggio: 250,
      tassoIncontro: 0.05,  // laboratorio: pochi selvatici
      incontri: [
        { id: 81,  prob: 40 },  // Magnemite
        { id: 100, prob: 40 },  // Voltorb
        { id: 41,  prob: 20 },  // Zubat (nei condotti)
      ]
    },

    // ── Lab CoTrAL #2 (periferia Albano) — dungeon-indizi post-P6 ──
    {
      id: 'lab-cotral-2',
      nome: 'Lab CoTrAL #2',
      terreno: 'interno',
      livMin: 40, livMax: 50,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7350, lon: 12.6500 },
      raggio: 250,
      tassoIncontro: 0.05,
      incontri: [
        { id: 82,  prob: 30 },  // Magneton
        { id: 101, prob: 30 },  // Electrode
        { id: 42,  prob: 20 },  // Golbat
        { id: 201, prob: 20 },  // Unown (nei laboratori segreti)
      ]
    },

    // ── Sentiero Innevato (Maschio delle Faete) — locked funivia → Articuno ──
    {
      id: 'sentiero-innevato',
      nome: 'Sentiero Innevato',
      terreno: 'neve',
      livMin: 36, livMax: 44,
      locked: true,
      mnRichiesta: 'Funivia',  // gate narrativo (funivia di Rocca di Papa)
      tipo: 'cerchio',
      centro: { lat: 41.7455, lon: 12.7160 },
      raggio: 400,
      incontri: [
        { id: 86,  prob: 20 },  // Seel
        { id: 87,  prob: 10 },  // Dewgong
        { id: 124, prob: 12 },  // Jynx
        { id: 215, prob: 18 },  // Sneasel
        { id: 220, prob: 20 },  // Swinub
        { id: 221, prob: 8  },  // Piloswine
        { id: 225, prob: 12 },  // Delibird
      ]
    },

    // ── F12: VIA VITTORIA — dungeon finale, locked da 8 medaglie ──
    {
      id: 'via-vittoria',
      nome: 'Via Vittoria',
      terreno: 'grotta',
      livMin: 55, livMax: 60,
      locked: true,
      mnRichiesta: 'Vittoria',   // gate: tutte e 8 le medaglie (stato.mn.vittoria)
      tipo: 'cerchio',
      centro: { lat: 41.8000, lon: 12.7600 },
      raggio: 700,
      tassoIncontro: 0.20,
      incontri: [
        { id: 42,  prob: 20 },  // Golbat
        { id: 75,  prob: 18 },  // Graveler
        { id: 93,  prob: 15 },  // Haunter
        { id: 67,  prob: 15 },  // Machoke
        { id: 208, prob: 15 },  // Steelix
        { id: 94,  prob: 10 },  // Gengar
        { id: 305, prob: 7  },  // Lairon
      ]
    },

    // ── Pratoni del Vivaro: altopiano vulcanico, post-Lega/Lugia ──
    // Centro a sud-est del Monte Cavo, fuori dal raggio della zona monte-cavo.
    // Fauna vulcanica forte (Lv 35-50). Trigger Lugia con Braciere di Nemi.
    {
      id: 'pratoni-vivaro',
      nome: 'Pratoni del Vivaro',
      terreno: 'prato',
      livMin: 35, livMax: 50,
      locked: false,
      tipo: 'cerchio',
      centro: { lat: 41.7280, lon: 12.7220 },
      raggio: 600,
      tassoIncontro: 0.15,
      incontri: [
        { id: 112, prob: 20 },  // Rhydon
        { id: 128, prob: 15 },  // Tauros
        { id: 241, prob: 15 },  // Miltank
        { id: 323, prob: 15 },  // Camerupt (vulcanico)
        { id: 59,  prob: 10 },  // Arcanine
        { id: 84,  prob: 10 },  // Doduo
        { id: 85,  prob: 8  },  // Dodrio
        { id: 357, prob: 7  },  // Tropius
      ]
    },

    // ── CAMPAGNA APERTA (fallback per tutta l'area dei Castelli) ──
    {
      id: 'campagna-aperta',
      nome: 'Campagna dei Castelli',
      terreno: 'campagna',
      livMin: 4, livMax: 12,
      locked: false,
      tipo: 'rettangolo',
      latMin: 41.68, latMax: 41.89,
      lonMin: 12.57, lonMax: 12.82,
      incontri: [
        { id: 16,  prob: 25 },  // Pidgey
        { id: 19,  prob: 20 },  // Rattata
        { id: 161, prob: 15 },  // Sentret
        { id: 263, prob: 12 },  // Zigzagoon
        { id: 43,  prob: 10 },  // Oddish
        { id: 10,  prob: 8  },  // Caterpie
        { id: 163, prob: 5  },  // Hoothoot
        { id: 261, prob: 5  },  // Poochyena
      ]
    },
  ];

  // ── Funzioni interne ──────────────────────────────────────

  // Verifica se le coordinate sono all'interno della geometria della zona
  function nellaZona(lat, lon, zona) {
    if (zona.tipo === 'cerchio') {
      return distanzaMetri({ lat, lon }, zona.centro) <= zona.raggio;
    }
    if (zona.tipo === 'rettangolo') {
      return lat >= zona.latMin && lat <= zona.latMax &&
             lon >= zona.lonMin && lon <= zona.lonMax;
    }
    return false;
  }

  // ── API pubblica ──────────────────────────────────────────

  // Restituisce la zona corrente del giocatore (null = fuori dal territorio)
  function trovaZona(lat, lon) {
    for (const zona of ZONE) {
      if (nellaZona(lat, lon, zona)) return zona;
    }
    return null;
  }

  // Estrae un incontro casuale dalla zona (selezione pesata sulle probabilità)
  // Restituisce { idPokemon, livello } oppure null se la zona è vuota.
  // NB: il "lucchetto" delle MN (Surf/Taglio) è gestito da app.js, che
  // controlla le MN possedute prima di chiamare questa funzione.
  function estraiIncontro(zona) {
    if (!zona || zona.incontri.length === 0) return null;

    const rand = Math.random() * 100;
    let cumul = 0;
    let idPokemon = zona.incontri[zona.incontri.length - 1].id;
    for (const voce of zona.incontri) {
      cumul += voce.prob;
      if (rand < cumul) { idPokemon = voce.id; break; }
    }

    const livello = zona.livMin + Math.floor(Math.random() * (zona.livMax - zona.livMin + 1));
    return { idPokemon, livello };
  }

  // Tasso di incontro della zona (default 15%; urbano 5%; grotta 20%)
  function tassoIncontroZona(zona) {
    return (zona && zona.tassoIncontro !== undefined) ? zona.tassoIncontro : 0.15;
  }

  return { trovaZona, estraiIncontro, tassoIncontroZona };

})();
