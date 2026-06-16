/* ============================================================
   map.js — RISCRITTO DA ZERO
   Architettura: mappa tile-by-tile stile Pokémon Smeraldo

   STEP 1: base = tutto tile 8 (erba uniforme)
   STEP 2: collisionData[][] separato dal tilemap visivo
   STEP 3+4: città hand-crafted con template edifici reali

   Tileset: sprites/tileset-outside.png (256×16064, tile 32×32)
   Player:  sprites/player-red.png (128×192, frame 32×48, 4dir×4frame)
   ============================================================ */

const GameMap = (function () {

  /* ----------------------------------------------------------
     COORDINATE
     ---------------------------------------------------------- */
  const BOUNDS = {
    latMin: 41.680, latMax: 41.895,
    lonMin: 12.565, lonMax: 12.790,
  };
  const MAP_W = 512;
  const MAP_H = 660;
  const TILE  = 32;

  const LAT_M = (BOUNDS.latMax - BOUNDS.latMin) * 111320;
  const LON_M = (BOUNDS.lonMax - BOUNDS.lonMin) * 111320
                * Math.cos(41.785 * Math.PI / 180);
  const M_TX  = LON_M / MAP_W;
  const M_TY  = LAT_M / MAP_H;
  const RAGGIO_TERRA = 111320;

  function latLonToTile(lat, lon) {
    const tx = (lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin) * MAP_W;
    const ty = (BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin) * MAP_H;
    return {
      tx: Math.max(0, Math.min(MAP_W - 1, Math.floor(tx))),
      ty: Math.max(0, Math.min(MAP_H - 1, Math.floor(ty))),
    };
  }

  function tileToLatLon(tx, ty) {
    return {
      lat: BOUNDS.latMax - (ty + 0.5) / MAP_H * (BOUNDS.latMax - BOUNDS.latMin),
      lon: BOUNDS.lonMin + (tx + 0.5) / MAP_W * (BOUNDS.lonMax - BOUNDS.lonMin),
    };
  }

  function distanzaMetri(a, b) {
    const dLat = (b.lat - a.lat) * RAGGIO_TERRA;
    const dLon = (b.lon - a.lon) * RAGGIO_TERRA * Math.cos(a.lat * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /* ============================================================
     TEMPLATE EDIFICI
     t[][] = indici tile dal tileset-outside.png
     c[][] = tipo collisione (0=libero/porta, 1=bloccante)
     ============================================================ */
  const TEMPL = {

    TREE: {  // albero verde 2×3 — bloccante (nessun tile centrale)
      w: 2, h: 3,
      t: [
        [416, 418],
        [424, 426],
        [432, 434],
      ],
      c: [[1,1],[1,1],[1,1]],
    },

    CASA: {  // casa verde 5×4
      w: 5, h: 4,
      interno: 'Interior general.png', nomeInterno: 'Casa',
      t: [
        [1336,1337,1338,1339,1340],
        [1344,1345,1346,1347,1348],
        [1352,1353,1354,1355,1356],
        [1360,1361,1362,1363,1364],
      ],
      c: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,8,1,1],  // 8 = porta trigger
      ],
    },

    CASA_BLU: {  // casa blu 5×4
      w: 5, h: 4,
      interno: 'Interior general.png', nomeInterno: 'Casa',
      t: [
        [1368,1369,1370,1371,1372],
        [1376,1377,1378,1379,1380],
        [1384,1385,1386,1387,1388],
        [1392,1393,1394,1395,1396],
      ],
      c: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,8,1,1],
      ],
    },

    CASA_GRIGIA: {  // casa grigia 5×4
      w: 5, h: 4,
      interno: 'Interior general.png', nomeInterno: 'Casa',
      t: [
        [1432,1433,1434,1435,1436],
        [1440,1441,1442,1443,1444],
        [1448,1449,1450,1451,1452],
        [1456,1457,1458,1459,1460],
      ],
      c: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,8,1,1,1],  // porta: tile 1457
      ],
    },

    PC: {  // PokéCenter 6×5
      w: 6, h: 5,
      interno: 'Poke Centre interior.png', nomeInterno: 'Centro Pokémon',
      t: [
        [2608,2609,2610,2611,2612,2613],
        [2616,2617,2618,2619,2620,2621],
        [2624,2625,2626,2627,2628,2629],
        [2632,2633,2634,2635,2636,2637],
        [2640,2641,2642,2643,2644,2645],
      ],
      c: [
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,1,1,1,1],
        [1,1,8,1,1,1],  // porta: tile 2642
      ],
    },

    MART: {  // PokéMart 4×4
      w: 4, h: 4,
      interno: 'Mart interior.png', nomeInterno: 'Poké Mart',
      t: [
        [2648,2649,2650,2651],
        [2656,2657,2658,2659],
        [2664,2665,2666,2667],
        [2672,2673,2674,2675],
      ],
      c: [
        [1,1,1,1],
        [1,1,1,1],
        [1,1,1,1],
        [1,1,8,1],  // porta: tile 2674
      ],
    },

    GYM: {  // Palestra 7×7
      w: 7, h: 7,
      interno: 'Gyms interior.png', nomeInterno: 'Palestra',
      t: [
        [2744,2745,2746,2747,2748,2749,2750],
        [2752,2753,2754,2755,2756,2757,2758],
        [2760,2761,2762,2763,2764,2765,2766],
        [2768,2769,2770,2771,2772,2773,2774],
        [2776,2777,2778,2779,2780,2781,2782],
        [2784,2785,2786,2787,2788,2789,2790],
        [731, 731, 2794, 731, 2796, 731, 731],
      ],
      c: [
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,8,1,1,1],  // porta: tile 2787
        [0,0,0,0,0,0,0],  // gradini/ingresso
      ],
    },

    LEGA: {  // Lega Pokémon 8×8
      w: 8, h: 8,
      interno: 'Trainer Tower interior.png', nomeInterno: 'Lega Pokémon',
      t: [
        [3128,3129,3130,3131,3132,3133,3134,3135],
        [3136,3137,3138,3139,3140,3141,3142,3143],
        [3144,3145,3146,3147,3148,3149,3150,3151],
        [3152,3153,3154,3155,3156,3157,3158,3159],
        [3160,3161,3162,3163,3164,3165,3166,3167],
        [3168,3169,3170,3171,3172,3173,3174,3175],
        [3176,3177,3178,3179,3180,3181,3182,3183],
        [731, 731, 731, 3187,3188,3189, 731, 731],
      ],
      c: [
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,8,1,1,1],  // porta: tile 3172
        [1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0],  // gradini/ingresso
      ],
    },

    VILLA: {  // Villa / edificio elegante 7×8
      w: 7, h: 8,
      interno: 'Mansion interior.png', nomeInterno: 'Villa Aldobrandini',
      t: [
        [2448,2449,2450,2451,2452,2453,2454],
        [2456,2457,2458,2459,2460,2461,2462],
        [2464,2465,2466,2467,2468,2469,2470],
        [2472,2473,2474,2475,2476,2477,2478],
        [2480,2481,2482,2483,2484,2485,2486],
        [2488,2489,2490,2491,2492,2493,2494],
        [2496,2497,2498,2499,2500,2501,2502],
        [2504,2505,2506,2507,2508,2509,2510],
      ],
      c: [
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,8,8,8,1,1],  // porta
        [1,1,0,0,0,1,1],  // ingresso passabile
      ],
    },

    LAB: {  // Laboratorio Prof. Castagno 8×5
      w: 8, h: 5,
      interno: 'Mansion interior.png', nomeInterno: 'Laboratorio — Prof. Castagno',
      t: [
        [3088,3089,3090,3091,3092,3093,3094,3095],
        [3096,3097,3098,3099,3100,3101,3102,3103],
        [3104,3105,3106,3107,3108,3109,3110,3111],
        [3112,3113,3114,3115,3116,3117,3118,3119],
        [3120,3121,3122,3123,3124,3125,3126,3127],
      ],
      c: [
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,1,1,8,1,1,1,1],  // porta: tile 3123
      ],
    },

    PALAZZO_GIALLO: {  // Palazzo giallo 5×5 (nessuna porta)
      w: 5, h: 5,
      t: [
        [1713,1714,1715,1716,1717],
        [1721,1722,1723,1724,1725],
        [1729,1730,1731,1732,1733],
        [1737,1738,1739,1740,1741],
        [1745,1746,1747,1748,1749],
      ],
      c: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
      ],
    },

    PALAZZO_CHIGI: {  // Palazzo Chigi — Ariccia 5×5
      w: 5, h: 5,
      interno: 'Mansion interior.png', nomeInterno: 'Palazzo Chigi',
      t: [
        [1713,1714,1715,1716,1717],
        [1721,1722,1723,1724,1725],
        [1729,1730,1731,1732,1733],
        [1737,1738,1739,1740,1741],
        [1745,1746,1779,1748,1749],  // 1779 = variante porta
      ],
      c: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,8,1,1],
      ],
    },

    PALAZZO_MATTONI: {  // Palazzo mattoni rossi / Abbazia 7×5
      w: 7, h: 5,
      interno: 'Ruins interior.png', nomeInterno: 'Abbazia di San Nilo',
      t: [
        [2400,2401,2402,2403,2404,2405,2406],
        [2408,2409,2410,2411,2412,2413,2414],
        [2416,2417,2418,2419,2420,2421,2422],
        [2424,2425,2426,2427,2428,2429,2430],
        [2432,2433,2434,2435,2436,2437,2438],
      ],
      c: [
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,8,8,8,1,1],  // porta (3 tile)
        [1,1,0,0,0,1,1],  // ingresso passabile
      ],
    },

    PALAZZO_VERDE: {  // Palazzo verde 5×5
      w: 5, h: 5,
      interno: 'Interior general.png', nomeInterno: 'Edificio',
      t: [
        [2328,2329,2330,2331,2332],
        [2336,2337,2338,2339,2340],
        [2344,2345,2346,2347,2348],
        [2352,2353,2354,2355,2356],
        [2392,2394,2397,2398,2399],
      ],
      c: [
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [1,1,1,8,1],  // porta: tile 2398
      ],
    },

    OSSERVATORIO: {  // Osservatorio Monte Porzio 7×4
      w: 7, h: 4,
      interno: 'Museum interior.png', nomeInterno: 'Osservatorio',
      t: [
        [2544,2545,2546,2547,2548,2549,2550],
        [2552,2553,2554,2555,2556,2557,2558],
        [2560,2561,2562,2563,2564,2565,2566],
        [2568,2569,2570,2571,2572,2573,2574],
      ],
      c: [
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1],
        [1,1,1,8,1,1,1],  // porta: tile 2571
      ],
    },
  };

  // Posizioni porta: 'tx,ty' → { file, nome } — popolato da _piazzaEdificio
  const porteTrigger = {};

  /* ============================================================
     DEFINIZIONI CITTÀ
     latC/lonC = centro geografico della città
     W/H       = larghezza/altezza grid in tile
     roads[]   = righe strade (y relativo, t=tile, coll=0 passabile)
     buildings[]= edifici (type, x,y relativi al top-left grid)
     grassPatches[] = erba alta (encounter zone)
     ============================================================ */
  const CITTA_DEFS = [

    { // Anagnina — Pallet Town style (PARTENZA)
      // Path nord: 5 tile wide, esce dal gap x=10-14 sul bordo superiore
      latC: 41.8420, lonC: 12.6150,
      W: 24, H: 18,
      roads: [],
      buildings: [
        // === BORDO NORD — gap aperto a x=10-15 per il path verso nord ===
        { type: 'TREE', x: 0,  y: 0 },
        { type: 'TREE', x: 2,  y: 0 },
        { type: 'TREE', x: 4,  y: 0 },
        { type: 'TREE', x: 6,  y: 0 },
        { type: 'TREE', x: 8,  y: 0 },
        // (gap x=10-15, nessun albero — uscita verso nord)
        { type: 'TREE', x: 16, y: 0 },
        { type: 'TREE', x: 18, y: 0 },
        { type: 'TREE', x: 20, y: 0 },
        { type: 'TREE', x: 22, y: 0 },
        // === BORDO OVEST ===
        { type: 'TREE', x: 0, y: 3 },
        { type: 'TREE', x: 0, y: 6 },
        { type: 'TREE', x: 0, y: 9 },
        { type: 'TREE', x: 0, y: 12 },
        // === BORDO EST ===
        { type: 'TREE', x: 22, y: 3 },
        { type: 'TREE', x: 22, y: 6 },
        { type: 'TREE', x: 22, y: 9 },
        { type: 'TREE', x: 22, y: 12 },
        // === BORDO SUD — chiuso totalmente ===
        { type: 'TREE', x: 0,  y: 15 },
        { type: 'TREE', x: 2,  y: 15 },
        { type: 'TREE', x: 4,  y: 15 },
        { type: 'TREE', x: 6,  y: 15 },
        { type: 'TREE', x: 8,  y: 15 },
        { type: 'TREE', x: 10, y: 15 },
        { type: 'TREE', x: 12, y: 15 },
        { type: 'TREE', x: 14, y: 15 },
        { type: 'TREE', x: 16, y: 15 },
        { type: 'TREE', x: 18, y: 15 },
        { type: 'TREE', x: 20, y: 15 },
        { type: 'TREE', x: 22, y: 15 },
        // === EDIFICI ===
        { type: 'PC',       x: 1,  y: 1  },  // PokéCenter (6×5)
        { type: 'LAB',      x: 14, y: 1  },  // Laboratorio Prof. Castagno (8×5)
        { type: 'CASA',     x: 2,  y: 11 },  // Casa giocatore
        { type: 'CASA_BLU', x: 17, y: 11 },  // Casa Remo
      ],
      grassPatches: [],
    },

    { // Frascati — P1 Erba (Vinicio)
      latC: 41.8051, lonC: 12.6807,
      W: 36, H: 24,
      roads: [
        { y: 10, t: 408 },
        { y: 11, t: 392 },
        { y: 12, t: 392 },
        { y: 13, t: 408 },
      ],
      buildings: [
        { type: 'TREE',  x: 0,  y: 0 },
        { type: 'TREE',  x: 4,  y: 0 },
        { type: 'TREE',  x: 31, y: 0 },
        { type: 'GYM',   x: 14, y: 1 },   // Palestra Frascati (7×7)
        { type: 'PC',    x: 1,  y: 1 },   // PokéCenter (6×5)
        { type: 'MART',  x: 7,  y: 3 },   // PokéMart (4×4)
        { type: 'VILLA', x: 28, y: 3 },   // Villa Aldobrandini (7×8)
        { type: 'CASA',  x: 1,  y: 15 },
        { type: 'CASA',  x: 8,  y: 15 },
        { type: 'CASA',  x: 22, y: 15 },
      ],
      grassPatches: [
        { x: 2,  y: 20, w: 4 },
        { x: 10, y: 20, w: 4 },
        { x: 24, y: 20, w: 4 },
      ],
    },

    { // Grottaferrata — P2 Psico (Nilo)
      latC: 41.7866, lonC: 12.6680,
      W: 32, H: 22,
      roads: [
        { y: 9,  t: 408 },
        { y: 10, t: 392 },
        { y: 11, t: 392 },
        { y: 12, t: 408 },
      ],
      buildings: [
        { type: 'TREE',           x: 0,  y: 0 },
        { type: 'TREE',           x: 4,  y: 0 },
        { type: 'TREE',           x: 29, y: 0 },
        { type: 'GYM',            x: 12, y: 1 },
        { type: 'PC',             x: 1,  y: 1 },
        { type: 'MART',           x: 7,  y: 3 },
        { type: 'PALAZZO_MATTONI',x: 22, y: 1 },  // Abbazia di San Nilo (7×5)
        { type: 'CASA',           x: 1,  y: 14 },
        { type: 'CASA',           x: 8,  y: 14 },
        { type: 'CASA',           x: 24, y: 14 },
      ],
      grassPatches: [
        { x: 2,  y: 19, w: 4 },
        { x: 12, y: 19, w: 4 },
      ],
    },

    { // Marino — P3 Acqua (Moro)
      latC: 41.7693, lonC: 12.6635,
      W: 30, H: 20,
      roads: [
        { y: 8,  t: 408 },
        { y: 9,  t: 392 },
        { y: 10, t: 408 },
      ],
      buildings: [
        { type: 'TREE', x: 0,  y: 0 },
        { type: 'TREE', x: 27, y: 0 },
        { type: 'GYM',  x: 11, y: 1 },
        { type: 'PC',   x: 1,  y: 1 },
        { type: 'MART', x: 7,  y: 3 },
        { type: 'CASA', x: 1,  y: 12 },
        { type: 'CASA', x: 8,  y: 12 },
        { type: 'CASA', x: 22, y: 12 },
      ],
      grassPatches: [
        { x: 1, y: 17, w: 4 },
        { x: 9, y: 17, w: 4 },
      ],
    },

    { // Monte Porzio Catone — P4 Elettro (Stella)
      latC: 41.8157, lonC: 12.7162,
      W: 30, H: 20,
      roads: [
        { y: 8,  t: 408 },
        { y: 9,  t: 392 },
        { y: 10, t: 408 },
      ],
      buildings: [
        { type: 'TREE',        x: 0,  y: 0 },
        { type: 'TREE',        x: 27, y: 0 },
        { type: 'GYM',         x: 11, y: 1 },
        { type: 'PC',          x: 1,  y: 1 },
        { type: 'MART',        x: 7,  y: 3 },
        { type: 'OSSERVATORIO',x: 20, y: 1 },  // Osservatorio (7×4)
        { type: 'CASA',        x: 1,  y: 12 },
        { type: 'CASA',        x: 22, y: 12 },
      ],
      grassPatches: [
        { x: 1, y: 17, w: 4 },
        { x: 9, y: 17, w: 4 },
      ],
    },

    { // Rocca di Papa — P5 Roccia (Rocco)
      latC: 41.7614, lonC: 12.7103,
      W: 30, H: 20,
      roads: [
        { y: 8,  t: 408 },
        { y: 9,  t: 392 },
        { y: 10, t: 408 },
      ],
      buildings: [
        { type: 'TREE', x: 0,  y: 0 },
        { type: 'TREE', x: 27, y: 0 },
        { type: 'GYM',  x: 11, y: 1 },
        { type: 'PC',   x: 1,  y: 1 },
        { type: 'MART', x: 7,  y: 3 },
        { type: 'CASA', x: 1,  y: 12 },
        { type: 'CASA', x: 8,  y: 12 },
      ],
      grassPatches: [
        { x: 1, y: 17, w: 4 },
        { x: 9, y: 17, w: 4 },
      ],
    },

    { // Albano Laziale — P6 Lotta (Massimo)
      latC: 41.7303, lonC: 12.6570,
      W: 32, H: 22,
      roads: [
        { y: 9,  t: 408 },
        { y: 10, t: 392 },
        { y: 11, t: 392 },
        { y: 12, t: 408 },
      ],
      buildings: [
        { type: 'TREE', x: 0,  y: 0 },
        { type: 'TREE', x: 4,  y: 0 },
        { type: 'TREE', x: 27, y: 0 },
        { type: 'GYM',  x: 12, y: 1 },
        { type: 'PC',   x: 1,  y: 1 },
        { type: 'MART', x: 7,  y: 3 },
        { type: 'CASA', x: 1,  y: 14 },
        { type: 'CASA', x: 8,  y: 14 },
        { type: 'CASA', x: 25, y: 14 },
      ],
      grassPatches: [
        { x: 2,  y: 19, w: 4 },
        { x: 12, y: 19, w: 4 },
      ],
    },

    { // Ariccia — P7 Buio (Ombretta)
      latC: 41.7206, lonC: 12.6729,
      W: 30, H: 20,
      roads: [
        { y: 8,  t: 408 },
        { y: 9,  t: 392 },
        { y: 10, t: 408 },
      ],
      buildings: [
        { type: 'TREE',          x: 0,  y: 0 },
        { type: 'TREE',          x: 27, y: 0 },
        { type: 'GYM',           x: 11, y: 1 },
        { type: 'PC',            x: 1,  y: 1 },
        { type: 'MART',          x: 7,  y: 3 },
        { type: 'PALAZZO_CHIGI', x: 21, y: 1 },  // Palazzo Chigi (5×5)
        { type: 'CASA',          x: 1,  y: 12 },
        { type: 'CASA',          x: 8,  y: 12 },
      ],
      grassPatches: [
        { x: 1, y: 17, w: 4 },
        { x: 8, y: 17, w: 4 },
      ],
    },

    { // Genzano di Roma — P8 Folletto (Flora)
      latC: 41.7074, lonC: 12.6905,
      W: 30, H: 20,
      roads: [
        { y: 8,  t: 408 },
        { y: 9,  t: 392 },
        { y: 10, t: 408 },
      ],
      buildings: [
        { type: 'TREE', x: 0,  y: 0 },
        { type: 'TREE', x: 27, y: 0 },
        { type: 'GYM',  x: 11, y: 1 },
        { type: 'PC',   x: 1,  y: 1 },
        { type: 'MART', x: 7,  y: 3 },
        { type: 'CASA', x: 1,  y: 12 },
        { type: 'CASA', x: 22, y: 12 },
      ],
      grassPatches: [
        { x: 1, y: 17, w: 4 },
      ],
    },

    { // Colonna — Lega Pokémon
      latC: 41.8337, lonC: 12.7532,
      W: 36, H: 26,
      roads: [
        { y: 11, t: 408 },
        { y: 12, t: 392 },
        { y: 13, t: 392 },
        { y: 14, t: 408 },
      ],
      buildings: [
        { type: 'TREE', x: 0,  y: 0 },
        { type: 'TREE', x: 4,  y: 0 },
        { type: 'TREE', x: 31, y: 0 },
        { type: 'LEGA', x: 14, y: 1 },   // Lega Pokémon (8×8)
        { type: 'PC',   x: 1,  y: 1 },
        { type: 'MART', x: 7,  y: 3 },
        { type: 'CASA', x: 1,  y: 16 },
        { type: 'CASA', x: 8,  y: 16 },
        { type: 'CASA', x: 27, y: 16 },
      ],
      grassPatches: [
        { x: 2,  y: 22, w: 4 },
        { x: 12, y: 22, w: 4 },
      ],
    },
  ];

  /* ----------------------------------------------------------
     FUNZIONI DI COSTRUZIONE
     ---------------------------------------------------------- */

  // Piazza un edificio template nella mappa e registra eventuali porte
  function _piazzaEdificio(tiles, coll, ox, oy, templ) {
    for (let r = 0; r < templ.h; r++) {
      for (let c = 0; c < templ.w; c++) {
        const tx = ox + c, ty = oy + r;
        if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) continue;
        tiles[ty][tx] = templ.t[r][c];
        const cv = templ.c[r][c];
        if (cv === 8) {
          coll[ty][tx] = 0;  // porta = passabile
          if (templ.interno) {
            porteTrigger[`${tx},${ty}`] = { file: templ.interno, nome: templ.nomeInterno || 'Interno' };
          }
        } else {
          coll[ty][tx] = cv;
        }
      }
    }
  }

  // Riempie una riga orizzontale di tile identici
  function _riempiRiga(tiles, coll, x0, ty, w, tileV, collV) {
    for (let c = 0; c < w; c++) {
      const tx = x0 + c;
      if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
        tiles[ty][tx] = tileV;
        coll[ty][tx]  = collV;
      }
    }
  }

  // Tile erba variegata random (per il pavimento città)
  const ERBA_FILL = [1, 1, 2, 2, 3, 4, 5, 31];
  function _tilErba() { return ERBA_FILL[Math.floor(Math.random() * ERBA_FILL.length)]; }

  // Costruisce una città sulla mappa
  function _costruisciCitta(tiles, coll, cd) {
    const { tx: cx, ty: cy } = latLonToTile(cd.latC, cd.lonC);
    const ox = cx - Math.floor(cd.W / 2);
    const oy = cy - Math.floor(cd.H / 2);

    // Prima: riempi il suolo della città con erba variegata
    for (let r = 0; r < cd.H; r++) {
      for (let c = 0; c < cd.W; c++) {
        const tx = ox + c, ty = oy + r;
        if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
          tiles[ty][tx] = _tilErba();
        }
      }
    }

    // Strade e marciapiedi
    for (const road of cd.roads) {
      _riempiRiga(tiles, coll, ox, oy + road.y, cd.W, road.t, 0);
    }

    // Edifici tile-by-tile
    for (const bld of cd.buildings) {
      const templ = TEMPL[bld.type];
      if (!templ) continue;
      _piazzaEdificio(tiles, coll, ox + bld.x, oy + bld.y, templ);
    }

    // Patch erba alta (encounter)
    for (const gp of (cd.grassPatches || [])) {
      for (let c = 0; c < gp.w; c++) {
        const tx = ox + gp.x + c, ty = oy + gp.y;
        if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
          tiles[ty][tx] = 6;   // erba alta
          coll[ty][tx]  = 2;   // tipo encounter
        }
      }
    }
  }

  /* ----------------------------------------------------------
     STEP 1+2+3+4 — genera mappa completa
     ---------------------------------------------------------- */
  // Disegna un percorso di terra battuta (tile 162) tra due punti tile, largo `spessore`
  // Disegna un rettangolo di path (usato per path orizzontali/verticali)
  function _riempiPath(tiles, coll, x, y, w, h) {
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        const tx = x + c, ty = y + r;
        if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
          tiles[ty][tx] = 162;  // terra battuta
          coll[ty][tx]  = 0;
        }
      }
  }

  function generaMappa() {
    for (const k in porteTrigger) delete porteTrigger[k];

    const tiles = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(2));
    const coll  = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(0));

    // === PATH NORD DA ANAGNINA (Via Tuscolana) ===
    // Va dritto verso SU (freccia ↑), 5 tile di larghezza, 90 tile di lunghezza
    const an = CITTA_DEFS[0];
    const ac = latLonToTile(an.latC, an.lonC);
    const aOY = ac.ty - Math.floor(an.H / 2);   // bordo nord della città
    // Il gap nel bordo nord è a relX=10-14, cioè acx + (10-12) = acx-2 … acx+2
    const pathX = ac.tx - 2;                     // inizio x (5 tile: pathX … pathX+4)
    _riempiPath(tiles, coll, pathX, Math.max(0, aOY - 90), 5, 90);

    // Erba alta ai lati del path (incontri Pokémon)
    for (let r = 5; r < 80; r += 1) {
      const ty = aOY - 1 - r;
      if (ty < 0) break;
      // Patch di erba alta a destra e sinistra del sentiero
      for (let side = -1; side <= 1; side += 2) {
        for (let k = 1; k <= 3; k++) {
          const tx = ac.tx + side * (3 + k);
          if (tx >= 0 && tx < MAP_W) {
            tiles[ty][tx] = 6;   // erba alta
            coll[ty][tx]  = 2;  // encounter
          }
        }
      }
    }

    // Costruisci le città (sovrascrivono il path dove si intersecano)
    for (const cd of CITTA_DEFS) {
      _costruisciCitta(tiles, coll, cd);
    }

    return { tiles, coll };
  }

  /* ----------------------------------------------------------
     LISTA POI — costruita dai dati globali di data.js
     ---------------------------------------------------------- */
  function _costruisciListaPOI() {
    const lista = [];

    if (typeof LABORATORIO !== 'undefined' && LABORATORIO.lat)
      lista.push({ lat: LABORATORIO.lat, lon: LABORATORIO.lon, raggio: 120,
        icona: '🔬', etichetta: 'Laboratorio — Prof. Castagno',
        azione: () => { if (typeof interagisciLaboratorio === 'function') interagisciLaboratorio(); } });

    if (typeof PALESTRE !== 'undefined')
      for (const p of PALESTRE) { const pid = p.id;
        lista.push({ lat: p.lat, lon: p.lon, raggio: 120,
          icona: '🏅', etichetta: `Palestra — ${p.comune}`,
          azione: () => { if (typeof interagisciPalestra === 'function') interagisciPalestra(pid); } }); }

    if (typeof CENTRI_POKEMON !== 'undefined')
      for (const c of CENTRI_POKEMON) { const cid = c.id;
        lista.push({ lat: c.lat, lon: c.lon, raggio: 150,
          icona: '🏥', etichetta: `Centro Pokémon — ${c.comune}`,
          azione: () => { if (typeof interagisciCentro === 'function') interagisciCentro(cid); } }); }

    if (typeof POKE_MARKET !== 'undefined')
      for (const m of POKE_MARKET) { const mid = m.id;
        lista.push({ lat: m.lat, lon: m.lon, raggio: 150,
          icona: '🛒', etichetta: `Poké Market — ${m.comune}`,
          azione: () => { if (typeof apriMarket === 'function') apriMarket(mid); } }); }

    if (typeof DONATORI_MN !== 'undefined')
      for (const d of DONATORI_MN) { const did = d.id;
        lista.push({ lat: d.lat, lon: d.lon, raggio: 120,
          icona: '🎁', etichetta: d.nome || 'NPC',
          azione: () => { if (typeof interagisciDonatore === 'function') interagisciDonatore(did); } }); }

    if (typeof ABITANTI !== 'undefined')
      for (const a of ABITANTI) { const aid = a.id;
        lista.push({ lat: a.lat, lon: a.lon, raggio: 100,
          icona: '💬', etichetta: `Gente del posto — ${a.comune}`,
          azione: () => { if (typeof interagisciAbitanti === 'function') interagisciAbitanti(aid); } }); }

    if (typeof MUSEO_NAVI !== 'undefined' && MUSEO_NAVI.lat)
      lista.push({ lat: MUSEO_NAVI.lat, lon: MUSEO_NAVI.lon,
        raggio: MUSEO_NAVI.raggioInterazione || 150,
        icona: '⛵', etichetta: 'Museo delle Navi Romane — Nemi',
        azione: () => { if (typeof interagisciMuseoNavi === 'function') interagisciMuseoNavi(); } });

    if (typeof FUNIVIA_ROCCA !== 'undefined' && FUNIVIA_ROCCA.lat)
      lista.push({ lat: FUNIVIA_ROCCA.lat, lon: FUNIVIA_ROCCA.lon,
        raggio: FUNIVIA_ROCCA.raggioInterazione || 120,
        icona: '🚡', etichetta: 'Funivia — Rocca di Papa',
        azione: () => { if (typeof interagisciFunivia === 'function') interagisciFunivia(); } });

    if (typeof METEOROLOGO !== 'undefined' && METEOROLOGO.lat)
      lista.push({ lat: METEOROLOGO.lat, lon: METEOROLOGO.lon,
        raggio: METEOROLOGO.raggioInterazione || 120,
        icona: '🌦️', etichetta: `${METEOROLOGO.nome || 'Meteorologo'} — Monte Porzio`,
        azione: () => { if (typeof interagisciMeteorologo === 'function') interagisciMeteorologo(); } });

    if (typeof ANFRATTI_REGI !== 'undefined')
      for (const a of ANFRATTI_REGI) { const aid = a.id;
        lista.push({ lat: a.lat, lon: a.lon,
          raggio: a.raggioInterazione || 80,
          icona: '🏛️', etichetta: a.nomeAnfratto || 'Anfratto del Tuscolo',
          azione: () => { if (typeof interagisciAnfratto === 'function') interagisciAnfratto(aid); } }); }

    if (typeof VILLA_ALDOBRANDINI !== 'undefined' && VILLA_ALDOBRANDINI.lat)
      lista.push({ lat: VILLA_ALDOBRANDINI.lat, lon: VILLA_ALDOBRANDINI.lon,
        raggio: VILLA_ALDOBRANDINI.raggioInterazione || 100,
        icona: '🌸', etichetta: 'Villa Aldobrandini — Frascati',
        azione: () => { if (typeof interagisciVillaAldobrandini === 'function') interagisciVillaAldobrandini(); } });

    if (typeof PORCHETTARO !== 'undefined' && PORCHETTARO.lat)
      lista.push({ lat: PORCHETTARO.lat, lon: PORCHETTARO.lon,
        raggio: PORCHETTARO.raggioInterazione || 120,
        icona: '🍖', etichetta: 'Adriano il Porchettaro — Ariccia',
        azione: () => { if (typeof interagisciPorchettaro === 'function') interagisciPorchettaro(); } });

    if (typeof BUNKERINO !== 'undefined' && BUNKERINO.lat)
      lista.push({ lat: BUNKERINO.lat, lon: BUNKERINO.lon,
        raggio: BUNKERINO.raggioInterazione || 120,
        icona: '🔬', etichetta: 'Bunkerino — Colonna',
        azione: () => { if (typeof interagisciBunkerino === 'function') interagisciBunkerino(); } });

    if (typeof PARCHEGGIONE !== 'undefined' && PARCHEGGIONE.lat)
      lista.push({ lat: PARCHEGGIONE.lat, lon: PARCHEGGIONE.lon,
        raggio: PARCHEGGIONE.raggioInterazione || 120,
        icona: '🚀', etichetta: 'Parcheggione — Grottaferrata',
        azione: () => { if (typeof interagisciParcheggione === 'function') interagisciParcheggione(); } });

    if (typeof VIA_VITTORIA_PORTA !== 'undefined' && VIA_VITTORIA_PORTA.lat)
      lista.push({ lat: VIA_VITTORIA_PORTA.lat, lon: VIA_VITTORIA_PORTA.lon,
        raggio: VIA_VITTORIA_PORTA.raggioInterazione || 150,
        icona: '🏆', etichetta: 'Lega Pokémon — Colonna',
        azione: () => { if (typeof interagisciLega === 'function') interagisciLega(); } });

    return lista;
  }

  /* ----------------------------------------------------------
     STATO INTERNO
     ---------------------------------------------------------- */
  let phaserGame   = null;
  let scena        = null;
  let playerSprite = null;
  let playerTrack  = null;
  let poiIndicator = null;
  let posTile      = { tx: 0, ty: 0 };
  let posLatLon    = { lat: 41.8420, lon: 12.6150 };
  let onPassoCb    = null;
  let bloccato     = false;
  let velocita     = 1;
  let facciata     = 'down';
  let tilemapData  = null;
  let collisionData = null;    // STEP 2 — array collisioni separato
  let listaPOI     = [];
  let poiVicino    = null;
  let spaceWasDown = false;
  let btnInteragisci = null;
  let lblInteragisci = null;
  const oggettiMappa = {};

  /* ----------------------------------------------------------
     SCENA PHASER
     ---------------------------------------------------------- */
  class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
      this.load.image('tileset-outside', 'sprites/tileset-outside.png');
      this.load.spritesheet('player-red', 'sprites/player-red.png', {
        frameWidth: 32, frameHeight: 48,
      });
    }

    create() {
      scena = this;

      // ── 1. Genera tilemap tile-by-tile + collisioni ──
      const mappaGenerata = generaMappa();
      tilemapData   = mappaGenerata.tiles;
      collisionData = mappaGenerata.coll;

      const map = this.make.tilemap({
        data: tilemapData, tileWidth: TILE, tileHeight: TILE,
      });
      const ts = map.addTilesetImage('outside', 'tileset-outside', TILE, TILE, 0, 0);
      map.createLayer(0, ts, 0, 0);

      // ── 2. Etichette città ──
      this._aggiuntaEtichetteComuni();

      // ── 3. Lista POI + marker visivi ──
      listaPOI = _costruisciListaPOI();
      this._aggiuntaMarcatoriPOI();

      // ── 4. Animazioni sprite Red ──
      // Layout: riga 0=giù(0-3), riga 1=sinistra(4-7), riga 2=destra(8-11), riga 3=su(12-15)
      const mkAnim = (key, frameArr) => {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers('player-red', { frames: frameArr }),
          frameRate: 8, repeat: -1,
        });
      };
      mkAnim('idle-down',  [1]);
      mkAnim('walk-down',  [0, 1, 2, 3]);
      mkAnim('idle-left',  [5]);
      mkAnim('walk-left',  [4, 5, 6, 7]);
      mkAnim('idle-right', [9]);
      mkAnim('walk-right', [8, 9, 10, 11]);
      mkAnim('idle-up',    [13]);
      mkAnim('walk-up',    [12, 13, 14, 15]);

      // ── 5. Sprite giocatore ──
      const st = latLonToTile(posLatLon.lat, posLatLon.lon);
      posTile = st;
      const sx = st.tx * TILE + TILE / 2;
      const sy = (st.ty + 1) * TILE;

      playerTrack = this.add.rectangle(sx, sy - TILE / 2, 1, 1, 0, 0).setDepth(29);

      playerSprite = this.add.sprite(sx, sy, 'player-red')
        .setOrigin(0.5, 1)
        .setDepth(30);
      playerSprite.anims.play('idle-down');

      // ── 6. Indicatore "!" POI ──
      poiIndicator = this.add.text(sx, sy - TILE * 2, '!', {
        fontSize: '16px', fontFamily: 'Arial', color: '#ffcb05',
        stroke: '#1a2940', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(40).setVisible(false);

      // ── 7. Camera ──
      this.cameras.main
        .startFollow(playerTrack, true, 0.1, 0.1)
        .setZoom(2)
        .setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

      // ── 8. Input tastiera ──
      this.cursors  = this.input.keyboard.createCursorKeys();
      this.wasd     = this.input.keyboard.addKeys('W,A,S,D');
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ]);
      this.moveCD = 0;

      // ── 9. Zoom rotella ──
      this.input.on('wheel', (_p, _g, _dx, dy) => {
        const z = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(z - dy * 0.003, 1, 6));
      });

      // ── 10. D-Pad HTML ──
      this._collegaDpad();

      // ── 11. Pulsante Interagisci ──
      btnInteragisci = document.getElementById('btn-interagisci');
      lblInteragisci = document.getElementById('interagisci-etichetta');
      if (btnInteragisci) {
        btnInteragisci.addEventListener('click', () => {
          if (poiVicino && !bloccato) poiVicino.azione();
        });
      }
    }

    update(_time, delta) {
      if (bloccato) return;
      this.moveCD -= delta;

      // Spazio → interagisci con POI
      if (this.spaceKey.isDown && !spaceWasDown && poiVicino) {
        spaceWasDown = true;
        poiVicino.azione();
        return;
      }
      if (!this.spaceKey.isDown) spaceWasDown = false;

      const c = this.cursors, k = this.wasd;
      let dx = 0, dy = 0;
      if (c.left.isDown  || k.A.isDown) dx = -1;
      if (c.right.isDown || k.D.isDown) dx =  1;
      if (c.up.isDown    || k.W.isDown) dy = -1;
      if (c.down.isDown  || k.S.isDown) dy =  1;

      if (dx !== 0 || dy !== 0) {
        if (this.moveCD <= 0) {
          this.moveCD = 150 / velocita;
          this._sposta(dx, dy);
        }
      } else {
        if (playerSprite) playerSprite.anims.play(`idle-${facciata}`, true);
      }
    }

    _sposta(dx, dy) {
      if (bloccato) return;
      const newTx = Phaser.Math.Clamp(posTile.tx + dx, 0, MAP_W - 1);
      const newTy = Phaser.Math.Clamp(posTile.ty + dy, 0, MAP_H - 1);
      if (newTx === posTile.tx && newTy === posTile.ty) return;

      const coll = collisionData ? (collisionData[newTy]?.[newTx] ?? 0) : 0;
      const mn   = (typeof stato !== 'undefined' && stato.mn) ? stato.mn : {};

      // Porta edificio? Apri interno senza muovere
      const chiavePorta = `${newTx},${newTy}`;
      if (porteTrigger[chiavePorta]) {
        if (dx < 0) facciata = 'left';
        else if (dx > 0) facciata = 'right';
        else if (dy < 0) facciata = 'up';
        else facciata = 'down';
        if (playerSprite) playerSprite.anims.play(`idle-${facciata}`, true);
        const p = porteTrigger[chiavePorta];
        apriInterno(p.file, p.nome);
        return;
      }

      if (coll === 1) return;  // bloccante: muro, albero, edificio

      if (coll === 3) {
        if (!mn.surf) {
          if (typeof mostraToast === 'function') mostraToast('🌊 Serve MN Surf!', 2000);
          return;
        }
      }
      if (coll === 4) {
        if (!mn.taglio) {
          if (typeof mostraToast === 'function') mostraToast('🌿 Serve MN Taglio!', 2000);
          return;
        }
      }
      if (coll === 5) {
        if (!mn.forza) {
          if (typeof mostraToast === 'function') mostraToast('🪨 Serve MN Forza!', 2000);
          return;
        }
      }
      if (coll === 6) {
        if (!mn.taglio) {
          if (typeof mostraToast === 'function') mostraToast('🪨 Serve MN Spaccaroccia!', 2000);
          return;
        }
      }

      // Aggiorna direzione e animazione
      if      (dx < 0) facciata = 'left';
      else if (dx > 0) facciata = 'right';
      else if (dy < 0) facciata = 'up';
      else             facciata = 'down';

      if (playerSprite) playerSprite.anims.play(`walk-${facciata}`, true);

      // Nuova posizione
      posTile   = { tx: newTx, ty: newTy };
      posLatLon = tileToLatLon(newTx, newTy);

      const px = newTx * TILE + TILE / 2;
      const py = (newTy + 1) * TILE;

      // Movimento fluido: tween per sprite + indicatore, camera segue subito
      const dur = Math.max(50, 130 / velocita);
      if (playerSprite) {
        scena.tweens.killTweensOf(playerSprite);
        scena.tweens.add({ targets: playerSprite, x: px, y: py, duration: dur, ease: 'Linear' });
      }
      if (playerTrack)  playerTrack.setPosition(px, py - TILE / 2);  // camera immediata
      if (poiIndicator) {
        scena.tweens.killTweensOf(poiIndicator);
        scena.tweens.add({ targets: poiIndicator, x: px, y: py - TILE * 2, duration: dur, ease: 'Linear' });
      }

      if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
      if (onPassoCb) onPassoCb({ ...posLatLon });

      this._aggiornaPOIVicino();
    }

    _aggiornaPOIVicino() {
      let trovato = null, distMin = Infinity;
      for (const poi of listaPOI) {
        const d = distanzaMetri(posLatLon, poi);
        if (d <= poi.raggio && d < distMin) { distMin = d; trovato = poi; }
      }
      poiVicino = trovato;

      const ovEl = document.getElementById('overlay-interagisci');
      if (ovEl) {
        if (trovato && lblInteragisci) {
          lblInteragisci.textContent = `${trovato.icona} ${trovato.etichetta}`;
          ovEl.classList.remove('nascosto');
        } else {
          ovEl.classList.add('nascosto');
        }
      }
      if (poiIndicator) poiIndicator.setVisible(!!trovato);
    }

    _collegaDpad() {
      const muovi = (dx, dy) => this._sposta(dx, dy);
      const btn = (id, dx, dy) => {
        const el = document.getElementById(id);
        if (!el) return;
        let timer = null;
        const start = () => {
          muovi(dx, dy);
          timer = setInterval(() => muovi(dx, dy), Math.max(60, 150 / velocita));
        };
        const stop = () => clearInterval(timer);
        el.addEventListener('pointerdown', start);
        el.addEventListener('pointerup',   stop);
        el.addEventListener('pointerleave', stop);
      };
      btn('btn-su',       0, -1);
      btn('btn-giu',      0,  1);
      btn('btn-sinistra', -1, 0);
      btn('btn-destra',    1, 0);
    }

    // Etichette nomi comuni
    _aggiuntaEtichetteComuni() {
      if (typeof PALESTRE === 'undefined') return;
      for (const p of PALESTRE) {
        const t = latLonToTile(p.lat, p.lon);
        const bg = this.add.rectangle(
          t.tx * TILE + TILE / 2, t.ty * TILE - TILE * 4, 0, 14, 0x1a2940, 0.85
        );
        const txt = this.add.text(
          t.tx * TILE + TILE / 2, t.ty * TILE - TILE * 4, p.comune,
          { fontSize: '8px', fontFamily: 'Arial', color: '#ffcb05', padding: { x: 4, y: 2 } }
        ).setOrigin(0.5, 0.5).setDepth(25);
        bg.width = txt.width + 8;
        bg.setDepth(24);
      }
      const cp = latLonToTile(41.8420, 12.6150);
      this.add.text(
        cp.tx * TILE + TILE / 2, cp.ty * TILE - TILE * 4, 'Anagnina',
        { fontSize: '8px', fontFamily: 'Arial', color: '#aef0ae', padding: { x: 4, y: 2 } }
      ).setOrigin(0.5, 0.5).setDepth(25);
    }

    // Marker POI: solo icona + etichetta (gli edifici sono già nel tileset)
    _aggiuntaMarcatoriPOI() {
      // POI non-edificio (NPC, donatori, abitanti): cerchio colorato
      const CERCHI = new Set(['🎁', '💬', '🍖', '🌸']);
      const PAL_CERCHIO = {
        '🎁': 0xE8C820,
        '💬': 0x88CCEE,
        '🍖': 0xD2691E,
        '🌸': 0xFF80CC,
      };

      for (const poi of listaPOI) {
        const t   = latLonToTile(poi.lat, poi.lon);
        const px  = t.tx * TILE + TILE / 2;
        const py  = t.ty * TILE + TILE / 2;

        // Cerchio solo per NPC non-edificio
        if (CERCHI.has(poi.icona)) {
          const gfx = this.add.graphics().setDepth(17);
          const col = PAL_CERCHIO[poi.icona] || 0xAAAAAA;
          gfx.fillStyle(col, 1);
          gfx.fillCircle(px, py, 10);
          gfx.lineStyle(2, 0x000000, 0.55);
          gfx.strokeCircle(px, py, 10);
        }

        // Icona sopra il punto
        this.add.text(px, py - 14, poi.icona, { fontSize: '12px' })
          .setOrigin(0.5, 1).setDepth(22);

        // Etichetta breve
        const rawNome = poi.etichetta.includes('—')
          ? poi.etichetta.split('—')[0].trim() : poi.etichetta;
        const corto = rawNome.length > 16 ? rawNome.substring(0, 14) + '…' : rawNome;
        this.add.text(px, py - 28, corto, {
          fontSize: '6px', fontFamily: 'Arial', color: '#ffffff',
          backgroundColor: '#1a2940', padding: { x: 3, y: 2 },
        }).setOrigin(0.5, 1).setDepth(23);
      }

      // Indicatore "INIZIO" lampeggiante sul laboratorio
      if (typeof LABORATORIO !== 'undefined' && LABORATORIO.lat) {
        const lt  = latLonToTile(LABORATORIO.lat, LABORATORIO.lon);
        const lpx = lt.tx * TILE + TILE / 2;
        const lpy = lt.ty * TILE - TILE * 3;
        const freccia = this.add.text(
          lpx, lpy,
          '▼ INIZIO',
          { fontSize: '8px', fontFamily: 'Arial', color: '#00ff44',
            backgroundColor: '#003300', padding: { x: 4, y: 2 },
            stroke: '#000000', strokeThickness: 2 }
        ).setOrigin(0.5, 1).setDepth(31);
        this.tweens.add({
          targets: freccia, alpha: { from: 1, to: 0.1 },
          duration: 700, yoyo: true, repeat: -1,
        });
      }
    }
  }

  /* ----------------------------------------------------------
     INTERIOR SCENE — stanza camminabile dentro gli edifici
     ---------------------------------------------------------- */
  class InteriorScene extends Phaser.Scene {
    constructor() { super({ key: 'InteriorScene' }); }

    init(data) {
      this._nome = data.nome || 'Casa';
    }

    create() {
      const TI   = 32;  // tile size interno
      const COLS = 10, ROWS = 8;
      const CW   = this.cameras.main.width;
      const CH   = this.cameras.main.height;
      const RW   = COLS * TI;
      const RH   = ROWS * TI;
      const OX   = Math.floor((CW - RW) / 2);
      const OY   = Math.floor((CH - RH) / 2) - 20;

      // Griglia collisioni stanza (1=muro, 0=calpestabile, 9=uscita)
      this._grid = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,9,9,9,1,1,1,1,1],  // 9 = uscita (col 2-4)
      ];
      this._COLS = COLS; this._ROWS = ROWS;
      this._TI = TI; this._OX = OX; this._OY = OY;

      // Sfondo scuro fuori dalla stanza
      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0a0a14).setDepth(0);

      // Rendering stanza
      const gfx = this.add.graphics().setDepth(1);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const px = OX + c * TI, py = OY + r * TI;
          const v  = this._grid[r][c];
          if (v === 1) {
            // Muro
            gfx.fillStyle(0x3a2515).fillRect(px, py, TI, TI);
            gfx.fillStyle(0x2a180e).fillRect(px, py, TI, 4);          // fascia top scura
            gfx.lineStyle(1, 0x1a0a05, 0.7); gfx.strokeRect(px, py, TI, TI);
          } else if (v === 9) {
            // Uscita: mattonella più scura con freccia
            gfx.fillStyle(0x6a3a1a).fillRect(px, py, TI, TI);
          } else {
            // Pavimento a scacchi
            const col = ((r + c) % 2 === 0) ? 0xB09070 : 0xA08060;
            gfx.fillStyle(col).fillRect(px, py, TI, TI);
            gfx.lineStyle(1, 0x7a5a3a, 0.3); gfx.strokeRect(px, py, TI, TI);
          }
        }
      }

      // Freccia uscita
      this.add.text(OX + 3 * TI + TI * 1.5, OY + 7 * TI + TI / 2, '▼',
        { fontSize: '12px', color: '#ffcb05' }).setOrigin(0.5).setDepth(3);

      // Titolo edificio
      this.add.text(CW / 2, OY - 18, this._nome, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(5);

      // Istruzione
      this.add.text(CW / 2, OY + RH + 6, '↓ sulla porta per uscire',
        { fontFamily: 'Arial', fontSize: '10px', color: '#888' }
      ).setOrigin(0.5, 0).setDepth(5);

      // Player — appare vicino all'ingresso (riga 6, colonna 4 = al centro)
      this._px = 4; this._py = 6;
      const spx = OX + this._px * TI + TI / 2;
      const spy = OY + (this._py + 1) * TI;
      this._sprite = this.add.sprite(spx, spy, 'player-red')
        .setOrigin(0.5, 1).setDepth(10).setScale(1.2);
      this._sprite.anims.play('idle-up', true);
      this._facciata = 'up';

      // Input (cattura frecce per non passare a GameScene in pausa)
      this._cursors = this.input.keyboard.createCursorKeys();
      this._wasd    = this.input.keyboard.addKeys('W,A,S,D');
      this.input.keyboard.addCapture([38, 40, 37, 39]);
      this._cd = 0;
    }

    update(_t, delta) {
      this._cd -= delta;
      if (this._cd > 0) {
        // Controlla se il player ha raggiunto la destinazione
        return;
      }
      const c = this._cursors, k = this._wasd;
      let dx = 0, dy = 0;
      if (c.left.isDown  || k.A.isDown) dx = -1;
      else if (c.right.isDown || k.D.isDown) dx =  1;
      else if (c.up.isDown    || k.W.isDown) dy = -1;
      else if (c.down.isDown  || k.S.isDown) dy =  1;

      if (dx === 0 && dy === 0) {
        this._sprite.anims.play(`idle-${this._facciata}`, true);
        return;
      }

      this._cd = 140;
      const nx = this._px + dx;
      const ny = this._py + dy;

      // Uscita dalla stanza
      if (ny >= this._ROWS - 1 && nx >= 2 && nx <= 4) {
        this._esci(); return;
      }

      // Bounds e collisioni
      if (nx < 0 || nx >= this._COLS || ny < 0 || ny >= this._ROWS) return;
      if (this._grid[ny][nx] !== 0) return;

      this._px = nx; this._py = ny;
      if (dx < 0) this._facciata = 'left';
      else if (dx > 0) this._facciata = 'right';
      else if (dy < 0) this._facciata = 'up';
      else this._facciata = 'down';
      this._sprite.anims.play(`walk-${this._facciata}`, true);

      const tx = this._OX + this._px * this._TI + this._TI / 2;
      const ty = this._OY + (this._py + 1) * this._TI;
      this.tweens.killTweensOf(this._sprite);
      this.tweens.add({ targets: this._sprite, x: tx, y: ty, duration: 120, ease: 'Linear' });
    }

    _esci() {
      this.scene.stop('InteriorScene');
      this.scene.resume('GameScene');
      // Ripristina HUD
      ['hud', 'btn-menu', 'btn-velocita', 'dpad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.removeProperty('display');
      });
      GameMap.sbloccaMovimento();
    }
  }

  /* ----------------------------------------------------------
     INTERNO EDIFICI — lancia InteriorScene (stanza camminabile)
     ---------------------------------------------------------- */
  function apriInterno(_nomeFile, nomeLuogo) {
    // Nasconde HUD per la durata dell'interno
    ['hud', 'btn-menu', 'btn-velocita', 'dpad'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Nasconde l'overlay HTML se ancora visibile
    document.getElementById('overlay-interno')?.classList.add('nascosto');

    bloccaMovimento();
    scena.scene.pause();
    phaserGame.scene.launch('InteriorScene', { nome: nomeLuogo || 'Casa' });
  }

  /* ----------------------------------------------------------
     API PUBBLICA (invariata rispetto alla versione precedente)
     ---------------------------------------------------------- */

  function inizializza(opzioni) {
    posLatLon = { ...opzioni.posizione };
    onPassoCb = opzioni.onPasso || null;
    phaserGame = new Phaser.Game({
      type:            Phaser.AUTO,
      parent:          'mappa',
      backgroundColor: '#70a040',
      scene:           [GameScene, InteriorScene],
      scale: {
        mode:       Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      banner: false,
    });
  }

  function bloccaMovimento() {
    bloccato = true;
    const ovEl = document.getElementById('overlay-interagisci');
    if (ovEl) ovEl.classList.add('nascosto');
    if (poiIndicator) poiIndicator.setVisible(false);
    if (scena && scena.cursors) {
      try { scena.input.keyboard.resetKeys(); } catch (_) {}
    }
  }

  function sbloccaMovimento() {
    bloccato = false;
    if (scena) scena._aggiornaPOIVicino();
  }

  function posizioneGiocatore() { return { ...posLatLon }; }

  function impostaVelocita(v) { velocita = v; }

  function teleporta(pos) {
    posLatLon = { lat: pos.lat, lon: pos.lon };
    const t   = latLonToTile(pos.lat, pos.lon);
    posTile   = t;
    const px  = t.tx * TILE + TILE / 2;
    const py  = (t.ty + 1) * TILE;
    if (playerSprite) playerSprite.setPosition(px, py);
    if (playerTrack)  playerTrack.setPosition(px, py - TILE / 2);
    if (poiIndicator) poiIndicator.setPosition(px, py - TILE * 2);
    if (scena) scena.cameras.main.centerOn(px, py - TILE / 2);
    if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
    if (scena) scena._aggiornaPOIVicino();
  }

  function rimuoviMarkerOggetto(id) {
    if (oggettiMappa[id]) {
      oggettiMappa[id].destroy();
      delete oggettiMappa[id];
    }
  }

  return {
    inizializza, bloccaMovimento, sbloccaMovimento,
    posizioneGiocatore, distanzaMetri, impostaVelocita,
    teleporta, rimuoviMarkerOggetto,
  };

})();
