/* ============================================================
   map.js — RISCRITTO: loader mappe Tiled (.tmj)

   Sostituisce il vecchio renderer procedurale con un sistema
   che carica mappe esportate da Tiled in formato .tmj (JSON).

   Layer tile:  ground → deco_sotto → edifici → PLAYER → sopra_testa
   Layer obj:   collisioni (rettangoli bloccanti), eventi (NPC, porte, ecc.)

   Tileset: Outside.png (32×32), Interior general.png (16×16),
            Poke Centre interior.png, Gyms interior.png (32×32)
   Player:  sprites/player-red.png (128×192, frame 32×48, 4dir×4frame)
   ============================================================ */

const GameMap = (function () {

  /* ══════════════════════════════════════════════════════════
     REGISTRO MAPPE + TILESET
     ══════════════════════════════════════════════════════════ */

  const MAPPE = {
    'borgata_tuscolana': {
      file: 'sprites/maps_tiled/pokemon-castelli-Borgata_Tuscolana.tmj',
      latC: 41.8420, lonC: 12.6150,
      spawn: { tx: 14, ty: 9 },
    },
    'percorso_tuscolana': {
      file: 'sprites/maps_tiled/pokemon-castelli-Percorso 1.tmj',
      latC: 41.8580, lonC: 12.6150,
      spawn: { tx: 14, ty: 48 },
    },
    'percorso_1b': {
      file: 'sprites/maps_tiled/pokemon-castelli-Percorso 1b.tmj',
      latC: 41.8700, lonC: 12.6150,
      spawn: { tx: 14, ty: 48 },
    },
    'lab_professore': {
      file: 'sprites/maps_tiled/pokemon-castelli-laboratorio professore.tmj',
      interno: true,
      latFissa: 41.8425, lonFissa: 12.6165,
    },
    'pokecenter': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center.tmj',
      interno: true,
      latFissa: 41.8418, lonFissa: 12.6145,
    },
    // ── Frascati (nuove mappe a warp) ──
    'frascati_sud': {
      file: 'sprites/maps_tiled/frascati_sud.tmj',
      latC: 41.8030, lonC: 12.6770,
    },
    'frascati_centro': {
      file: 'sprites/maps_tiled/frascati_centro.tmj',
      latC: 41.8090, lonC: 12.6770,
    },
    'frascati_est': {
      file: 'sprites/maps_tiled/frascati_est.tmj',
      latC: 41.8090, lonC: 12.6850,
    },
    'frascati_ovest': {
      file: 'sprites/maps_tiled/frascati_ovest.tmj',
      latC: 41.8090, lonC: 12.6690,
    },
    'frascati_nord': {
      file: 'sprites/maps_tiled/frascati_nord.tmj',
      latC: 41.8150, lonC: 12.6770,
    },
    'tuscolo_ingresso': {
      file: 'sprites/maps_tiled/tuscolo_ingresso.tmj',
      latC: 41.8230, lonC: 12.7050,
    },
    'palestra_frascati': {
      file: 'sprites/maps_tiled/pokemon-castelli-palestra_Frascati.tmj',
      interno: true,
      latFissa: 41.8036, lonFissa: 12.6796,
    },
    'pokemon_market_frascati': {
      file: 'sprites/maps_tiled/pokemon-castelli-poke market.tmj',
      interno: true,
      latFissa: 41.8066, lonFissa: 12.6826,
    },
    'pokecenter_frascati': {
      file: 'sprites/maps_tiled/pokemon-castelli-Pokemon_center_frascati.tmj',
      interno: true,
      latFissa: 41.8090, lonFissa: 12.6772,
    },
  };

  // Outside.png è 256×16064 px — troppo grande per WebGL (max ~8192).
  // Viene diviso in due metà (A: righe 0-249, B: righe 250-501) a runtime.
  const OUTSIDE_SPLIT_ROW = 250;
  const OUTSIDE_SPLIT_TILES = OUTSIDE_SPLIT_ROW * 8;

  const TILESET_META = {
    'outside':               { key: 'ts-outside-a', key2: 'ts-outside-b', split: true,
                               splitTiles: OUTSIDE_SPLIT_TILES,
                               tw: 32, th: 32, cols: 8 },
    'Poke Centre interior':  { key: 'ts-pc-int',     tw: 32, th: 32, cols: 8  },
    'Interior general':      { key: 'ts-int-gen',    tw: 16, th: 16, cols: 16 },
    'Gyms interior':         { key: 'ts-gyms-int',   tw: 32, th: 32, cols: 8  },
    'Mart interior':         { key: 'ts-mart-int',   tw: 32, th: 32, cols: 8  },
    'professor Castagno':    { key: 'ts-prof-cast',  tw: 16, th: 16, cols: 8  },
  };

  const TILESET_IMMAGINI = {
    'ts-pc-int':    'Essentials FRLG/Graphics/Tilesets/Poke Centre interior.png',
    'ts-int-gen':   'Essentials FRLG/Graphics/Tilesets/Interior general.png',
    'ts-gyms-int':  'Essentials FRLG/Graphics/Tilesets/Gyms interior.png',
    'ts-mart-int':  'Essentials FRLG/Graphics/Tilesets/Mart interior.png',
    'ts-prof-cast': 'Essentials FRLG/Graphics/Characters/NPC_ProfOak.png',
  };

  const OUTSIDE_SRC = 'sprites/Tiles per claude/Outside.png';

  /* ══════════════════════════════════════════════════════════
     CONVERSIONE COORDINATE (compatibilità lat/lon)
     ══════════════════════════════════════════════════════════ */

  const M_PER_TILE    = 10;
  const RAGGIO_TERRA  = 111320;
  const COS_LAT       = Math.cos(41.84 * Math.PI / 180);

  function tileToLatLon(tx, ty, info) {
    if (!info || !info.latC) return { lat: 41.8420, lon: 12.6150 };
    const cx = Math.floor((info.mapW || 30) / 2);
    const cy = Math.floor((info.mapH || 20) / 2);
    return {
      lat: info.latC - (ty - cy) * M_PER_TILE / RAGGIO_TERRA,
      lon: info.lonC + (tx - cx) * M_PER_TILE / (RAGGIO_TERRA * COS_LAT),
    };
  }

  function distanzaMetri(a, b) {
    const dLat = (b.lat - a.lat) * RAGGIO_TERRA;
    const dLon = (b.lon - a.lon) * RAGGIO_TERRA * COS_LAT;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /* ══════════════════════════════════════════════════════════
     PARSING TMJ
     ══════════════════════════════════════════════════════════ */

  function nomeTs(source) {
    const name = source.replace(/\\/g, '/').split('/').pop().replace(/\.tsx$/, '');
    return name;
  }

  function parseTilesets(tmj) {
    const result = [];
    for (let i = 0; i < tmj.tilesets.length; i++) {
      const ts   = tmj.tilesets[i];
      const name = nomeTs(ts.source || '');
      const meta = TILESET_META[name];
      if (!meta) { console.warn('[TMJ] Tileset sconosciuto:', name); continue; }
      const nextGid = (i + 1 < tmj.tilesets.length) ? tmj.tilesets[i + 1].firstgid : Infinity;
      result.push({ ...meta, name, firstgid: ts.firstgid, nextGid });
    }
    return result;
  }

  function buildCollGrid(tmj) {
    const tw = tmj.tilewidth, th = tmj.tileheight;
    const w = tmj.width, h = tmj.height;
    const grid = Array.from({ length: h }, () => new Uint8Array(w));
    const collLayer = tmj.layers.find(l => l.name === 'collisioni' && l.type === 'objectgroup');
    if (!collLayer) return grid;
    for (const obj of collLayer.objects) {
      if (obj.width <= 0 || obj.height <= 0) continue;
      const x0 = Math.max(0, Math.floor(obj.x / tw));
      const y0 = Math.max(0, Math.floor(obj.y / th));
      const x1 = Math.min(w - 1, Math.floor((obj.x + obj.width - 1) / tw));
      const y1 = Math.min(h - 1, Math.floor((obj.y + obj.height - 1) / th));
      for (let r = y0; r <= y1; r++)
        for (let c = x0; c <= x1; c++)
          grid[r][c] = 1;
    }
    // Le porte/uscite devono essere calpestabili anche se dentro una zona di collisione
    const evLayer = tmj.layers.find(l => l.name === 'eventi' && l.type === 'objectgroup');
    if (evLayer) {
      for (const obj of evLayer.objects) {
        const props = {};
        if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
        const tipo = props.type || '';
        const calpestabile = (tipo === 'porta' || tipo === 'uscita' || tipo === 'entrata' || tipo === 'warp');
        // Gli ostacoli MN (trigger_surf, trigger_spaccaroccia, …) bloccano il
        // passaggio finché non possiedi la MN giusta (sbloccati a runtime).
        const ostacoloMn = (typeof tipo === 'string' && tipo.indexOf('trigger_') === 0);
        // I cartelli RETTANGOLARI (mappe nuove) sono solidi: li leggi standoci
        // davanti, come nei giochi classici. I cartelli "punto" (mappe vecchie)
        // restano calpestabili per non bloccare i percorsi già funzionanti.
        const cartelloRett = (tipo === 'cartello' || tipo === 'cartel') && obj.width > 0 && obj.height > 0;
        // Decorazioni e fontane (deco / warp_speciale): solide, non ci si cammina sopra.
        const decoSolida = (tipo === 'deco' || tipo === 'warp_speciale') && obj.width > 0 && obj.height > 0;
        if (calpestabile || ostacoloMn || cartelloRett || decoSolida) {
          const val = (ostacoloMn || cartelloRett || decoSolida) ? 1 : 0;
          if (obj.width > 0 && obj.height > 0) {
            const x0 = Math.max(0, Math.floor(obj.x / tw));
            const y0 = Math.max(0, Math.floor(obj.y / th));
            const x1 = Math.min(w - 1, Math.floor((obj.x + obj.width - 1) / tw));
            const y1 = Math.min(h - 1, Math.floor((obj.y + obj.height - 1) / th));
            for (let r = y0; r <= y1; r++)
              for (let c = x0; c <= x1; c++)
                grid[r][c] = val;
          } else if (obj.point) {
            const tx = Math.floor(obj.x / tw);
            const ty = Math.floor(obj.y / th);
            if (ty >= 0 && ty < h && tx >= 0 && tx < w) grid[ty][tx] = val;
          }
        }
      }
    }
    return grid;
  }

  function parseEventi(tmj) {
    const tw = tmj.tilewidth, th = tmj.tileheight;
    const eventi = [];

    const aggiungi = (obj) => {
      const props = {};
      if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
      const tipo = props.type || obj.type || '';
      const ev = {
        id:     props.id || obj.name || '',
        nome:   obj.name || '',
        tipo,
        x:      obj.x,
        y:      obj.y,
        w:      obj.width  || 0,
        h:      obj.height || 0,
        point:  !!obj.point,
        props,
        tx:     Math.floor(obj.x / tw),
        ty:     Math.floor(obj.y / th),
      };
      if (ev.w > 0 && ev.h > 0) {
        ev.tx0 = Math.floor(ev.x / tw);
        ev.ty0 = Math.floor(ev.y / th);
        ev.tx1 = Math.floor((ev.x + ev.w - 1) / tw);
        ev.ty1 = Math.floor((ev.y + ev.h - 1) / th);
      }
      eventi.push(ev);
    };

    const evLayer = tmj.layers.find(l => l.name === 'eventi' && l.type === 'objectgroup');
    if (evLayer) for (const obj of evLayer.objects) aggiungi(obj);

    // Gli ostacoli MN (trigger_taglio/surf/…) a volte vengono messi nel layer
    // "collisioni" invece che in "eventi": raccogliamoli lo stesso così funzionano.
    const collLayer = tmj.layers.find(l => l.name === 'collisioni' && l.type === 'objectgroup');
    if (collLayer) for (const obj of collLayer.objects) {
      const props = {};
      if (obj.properties) obj.properties.forEach(p => { props[p.name] = p.value; });
      const tp = props.type || obj.type || '';
      if (typeof tp === 'string' && tp.indexOf('trigger_') === 0) aggiungi(obj);
    }

    return eventi;
  }

  /* ══════════════════════════════════════════════════════════
     RISOLUZIONE DESTINAZIONI (nome mappa → chiave registro MAPPE)
     Le mappe usano stringhe libere e disordinate per "destinazione"
     (es. "pokemon-castelli- Percorso 1b", "Percorso 1", "Frascati").
     Normalizziamo e cerchiamo la corrispondenza migliore.
     ══════════════════════════════════════════════════════════ */

  function normTxt(s) {
    return String(s || '').toLowerCase()
      .replace(/pokemon[-\s]*castelli/g, '')   // toglie il prefisso del nome file
      .replace(/[^a-z0-9]/g, '');               // tiene solo lettere/numeri
  }

  // Nome "umano" della mappa ricavato dal nome file (per i confronti)
  function nomeMappaDaFile(file) {
    const base = String(file || '').replace(/\\/g, '/').split('/').pop()
      .replace(/\.tmj$/i, '');
    return normTxt(base);
  }

  // Restituisce la chiave del registro MAPPE che corrisponde a "dest"
  function risolviMappa(dest) {
    if (!dest) return null;
    const nd = normTxt(dest);
    // 1) corrispondenza esatta con la chiave
    if (MAPPE[dest]) return dest;
    for (const chiave of Object.keys(MAPPE)) {
      if (normTxt(chiave) === nd) return chiave;
    }
    // 2) corrispondenza esatta col nome ricavato dal file
    for (const [chiave, def] of Object.entries(MAPPE)) {
      if (nomeMappaDaFile(def.file) === nd) return chiave;
    }
    // 3) corrispondenza per inclusione (più permissiva, ultima spiaggia)
    for (const [chiave, def] of Object.entries(MAPPE)) {
      const nf = nomeMappaDaFile(def.file);
      if (nf && nd && (nf.includes(nd) || nd.includes(nf))) return chiave;
    }
    return null;
  }

  /* ══════════════════════════════════════════════════════════
     STATO INTERNO
     ══════════════════════════════════════════════════════════ */

  let phaserGame    = null;
  let scena         = null;
  let playerSprite  = null;
  let playerTrack   = null;
  let posTile       = { tx: 0, ty: 0 };
  let posLatLon     = { lat: 41.8420, lon: 12.6150 };
  let onPassoCb     = null;
  let bloccato      = false;
  let velocita      = 1;
  let facciata      = 'down';

  let mappaCorrente    = null;
  let mappaInfo        = null;
  let mappaStack       = [];
  let collGrid         = null;
  let eventiMappa      = [];
  let mapW = 0, mapH = 0, tileSize = 32;
  let layerObjects     = [];
  let npcSprites       = [];
  let npcStato         = [];   // stato dinamico di NPC e trainer (movimento, direzione)
  let frameCount       = 0;    // contatore frame per i timer di movimento NPC
  let trainerBattuti   = new Set();
  let transizioneAttiva = false;
  let eventoVicino     = null;

  // Incontri selvatici: 15% per casella d'erba alta, con una "tregua" di alcuni
  // passi dopo ogni incontro per evitare scontri uno-dietro-l'altro.
  const PROB_INCONTRO = 15;     // probabilità % per passo su erba alta/acqua
  const PASSI_TREGUA  = 4;      // passi senza incontri dopo uno scontro
  let cooldownIncontro = 0;

  let spaceWasDown     = false;
  let btnInteragisci   = null;
  let lblInteragisci   = null;

  const NPC_SPRITE_DIR = 'sprites/npc e trainer per claude/';

  /* ══════════════════════════════════════════════════════════
     SCENA PHASER
     ══════════════════════════════════════════════════════════ */

  class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {
      for (const [key, path] of Object.entries(TILESET_IMMAGINI)) {
        this.load.image(key, path);
      }
      this.load.spritesheet('player-red', 'sprites/player-red.png', {
        frameWidth: 32, frameHeight: 48,
      });
    }

    async _caricaOutsideSplit() {
      if (this.textures.exists('ts-outside-a')) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((ok, ko) => {
        img.onload = ok;
        img.onerror = ko;
        img.src = OUTSIDE_SRC;
      });
      const w = img.width;
      const splitY = OUTSIDE_SPLIT_ROW * 32;
      const hA = Math.min(splitY, img.height);
      const hB = Math.max(0, img.height - splitY);

      const cvA = document.createElement('canvas');
      cvA.width = w; cvA.height = hA;
      cvA.getContext('2d').drawImage(img, 0, 0, w, hA, 0, 0, w, hA);
      this.textures.addCanvas('ts-outside-a', cvA);

      if (hB > 0) {
        const cvB = document.createElement('canvas');
        cvB.width = w; cvB.height = hB;
        cvB.getContext('2d').drawImage(img, 0, splitY, w, hB, 0, 0, w, hB);
        this.textures.addCanvas('ts-outside-b', cvB);
      }
    }

    create() {
      scena = this;

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

      this.cursors  = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ]);
      this.moveCD = 0;

      this.input.on('wheel', (_p, _g, _dx, dy) => {
        const z = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(z - dy * 0.003, 1, 6));
      });

      this._collegaDpad();

      btnInteragisci = document.getElementById('btn-interagisci');
      lblInteragisci = document.getElementById('interagisci-etichetta');
      if (btnInteragisci) {
        btnInteragisci.addEventListener('click', () => {
          if (eventoVicino && !bloccato) this._interagisci(eventoVicino);
        });
      }

      this._caricaOutsideSplit().then(() => {
        this.caricaMappa('borgata_tuscolana');
      }).catch(err => console.error('[Map] Errore split tileset:', err));
    }

    /* ────────── CARICAMENTO MAPPA ────────── */

    async caricaMappa(chiave, arrivoX, arrivoY, spawnId, sourceKey) {
      const def = MAPPE[chiave];
      if (!def) { console.error('[Map] Mappa sconosciuta:', chiave); return; }

      this._pulisciLayers();
      bloccato = true;

      try {
        const resp = await fetch(def.file);
        const tmj  = await resp.json();

        mapW      = tmj.width;
        mapH      = tmj.height;
        tileSize  = tmj.tilewidth;
        mappaCorrente = chiave;
        mappaInfo = { ...def, mapW, mapH };

        const tilesets = parseTilesets(tmj);
        collGrid      = buildCollGrid(tmj);
        eventiMappa   = parseEventi(tmj);

        const LAYER_NAMES  = ['ground', 'deco_sotto', 'deco_sott', 'edifici', 'sopra_testa'];
        const LAYER_DEPTHS = { ground: 0, deco_sotto: 1, deco_sott: 1, edifici: 2, sopra_testa: 50 };

        for (const tileLayer of tmj.layers.filter(l => l.type === 'tilelayer')) {
          const lName = tileLayer.name.toLowerCase().replace(/\s+/g, '_');
          let matchName = LAYER_NAMES.find(n => lName.includes(n));
          if (!matchName && lName.includes('livello')) matchName = 'ground';
          const depth = matchName ? (LAYER_DEPTHS[matchName] ?? 1) : 1;

          for (const ts of tilesets) {
            if (ts.split) {
              // Tileset diviso in due: crea layer separati per parte A e B
              this._renderSplitLayer(tileLayer.data, ts, depth);
            } else {
              const data2d = [];
              let hasTiles = false;
              for (let r = 0; r < mapH; r++) {
                const row = [];
                for (let c = 0; c < mapW; c++) {
                  const gid = tileLayer.data[r * mapW + c];
                  if (gid >= ts.firstgid && gid < ts.nextGid) {
                    row.push(gid - ts.firstgid);
                    hasTiles = true;
                  } else {
                    row.push(-1);
                  }
                }
                data2d.push(row);
              }
              if (!hasTiles) continue;

              const map = this.make.tilemap({ data: data2d, tileWidth: ts.tw, tileHeight: ts.th });
              const tileset = map.addTilesetImage('ts', ts.key, ts.tw, ts.th, 0, 0);
              const layer = map.createLayer(0, tileset);
              if (layer) {
                if (ts.tw !== tileSize) layer.setScale(tileSize / ts.tw);
                layer.setDepth(depth);
                layerObjects.push(layer);
              }
            }
          }
        }

        // ── Scelta del punto di spawn (Fix 3) ──
        // Priorità: spawn che combacia (per spawn_id o per mappa di provenienza)
        //         > arrivo_x/arrivo_y espliciti > primo spawn presente
        //         > spawn di default del registro > centro mappa.
        let sx, sy;
        const spawnMatch = this._trovaSpawn(spawnId, sourceKey, false);
        if (spawnMatch) {
          sx = spawnMatch.tx; sy = spawnMatch.ty;
        } else if (arrivoX !== undefined && arrivoY !== undefined) {
          sx = arrivoX; sy = arrivoY;
        } else if (def.spawn) {
          // Caricamento iniziale (senza warp): punto di partenza della mappa
          sx = def.spawn.tx; sy = def.spawn.ty;
        } else {
          const spawnQualsiasi = this._trovaSpawn(null, null, true);
          if (spawnQualsiasi) { sx = spawnQualsiasi.tx; sy = spawnQualsiasi.ty; }
          else { sx = Math.floor(mapW / 2); sy = Math.floor(mapH / 2); }
        }

        const zoom = (tileSize < 32) ? 4 : 2;
        this.cameras.main.setZoom(zoom);

        // Per mappe piccole: centra la mappa senza clamp ai bordi
        const camW = this.cameras.main.width / zoom;
        const camH = this.cameras.main.height / zoom;
        const mapPxW = mapW * tileSize;
        const mapPxH = mapH * tileSize;
        if (mapPxW < camW || mapPxH < camH) {
          this.cameras.main.setBounds(undefined, undefined, undefined, undefined);
        } else {
          this.cameras.main.setBounds(0, 0, mapPxW, mapPxH);
        }

        this._posizionaPlayer(sx, sy);
        this._creaNpcStato();
        await this._creaSpritesNPC();

        this._aggiornaLatLon();
        this._aggiornaEventoVicino();

      } catch (err) {
        console.error('[Map] Errore caricamento mappa:', chiave, err);
      }

      bloccato = false;
    }

    /* ────────── SPAWN / DIREZIONI ────────── */

    // Normalizza una direzione (italiano/inglese) in nord|sud|est|ovest
    _normDir(d) {
      const m = {
        sud: 'sud', down: 'sud', s: 'sud',
        nord: 'nord', up: 'nord', n: 'nord',
        est: 'est', right: 'est', e: 'est',
        ovest: 'ovest', left: 'ovest', o: 'ovest', w: 'ovest',
      };
      return m[String(d || '').toLowerCase()] || 'sud';
    }

    // Direzione → animazione del player-sheet (up/down/left/right)
    _faceAnim(dir) {
      return { nord: 'up', sud: 'down', est: 'right', ovest: 'left' }[dir] || 'down';
    }

    // Frame base nello spritesheet NPC (32×48, righe: sud/ovest/est/nord)
    _npcFrameBase(dir) {
      return { sud: 0, ovest: 4, est: 8, nord: 12 }[dir] ?? 0;
    }

    // Imposta il frame giusto SULLA TEXTURE DELL'NPC (non usa le anims del
    // player, che altrimenti scambierebbero la texture dell'NPC con quella di Red).
    _setNpcFrame(spr, dir, camminando) {
      if (!spr) return;
      if (spr.anims && spr.anims.isPlaying) spr.anims.stop();
      const base = this._npcFrameBase(dir);
      try { spr.setFrame(base + (camminando ? 0 : 1)); } catch (_) {}
    }

    // Direzione → delta tile
    _dirDelta(dir) {
      return ({
        nord: { dx: 0, dy: -1 }, sud: { dx: 0, dy: 1 },
        est: { dx: 1, dy: 0 }, ovest: { dx: -1, dy: 0 },
      })[dir] || { dx: 0, dy: 0 };
    }

    // Da una stringa di pattuglia ("NS", "EO", ecc.) a un ciclo di direzioni
    _dirCiclo(raw) {
      const s = String(raw || '').toLowerCase();
      if (s === 'ns' || s === 'sn') return ['nord', 'sud'];
      if (s === 'eo' || s === 'oe' || s === 'ew' || s === 'we') return ['est', 'ovest'];
      return null;
    }

    // Cerca lo spawn giusto fra gli oggetti spawn della mappa corrente.
    // Gestisce sia "spawn" che il refuso "spwan".
    _trovaSpawn(spawnId, sourceKey, permettiPrimo) {
      const spawns = eventiMappa.filter(e => e.tipo === 'spawn' || e.tipo === 'spwan');
      if (spawns.length === 0) return null;

      const centro = (ev) => ({
        tx: (ev.tx0 !== undefined) ? Math.floor((ev.tx0 + ev.tx1) / 2) : ev.tx,
        ty: (ev.ty0 !== undefined) ? Math.floor((ev.ty0 + ev.ty1) / 2) : ev.ty,
      });

      // 1) spawn_id esplicito (match esatto)
      if (spawnId) {
        const ns = normTxt(spawnId);
        const m = spawns.find(s => normTxt(s.id) === ns);
        if (m) return centro(m);
        // 1b) match tollerante: uno contiene l'altro (gestisce nomi non allineati
        //     tipo spawn_id "da_frascati_sud" ↔ spawn "Da Frascati")
        if (ns.length > 3) {
          const f = spawns.find(s => {
            const si = normTxt(s.id);
            return si.length > 3 && (si.includes(ns) || ns.includes(si));
          });
          if (f) return centro(f);
        }
      }
      // 2) spawn il cui id cita la mappa di provenienza
      if (sourceKey) {
        const tokens = [normTxt(sourceKey)];
        if (MAPPE[sourceKey]) tokens.push(nomeMappaDaFile(MAPPE[sourceKey].file));
        const m = spawns.find(s => {
          const ns = normTxt(s.id);
          return tokens.some(t => t && t.length > 3 && (ns.includes(t) || t.includes(ns)));
        });
        if (m) return centro(m);
      }
      // 3) spawn di default
      const def = spawns.find(s => normTxt(s.id) === 'default');
      if (def) return centro(def);
      // 4) primo spawn (solo se richiesto)
      if (permettiPrimo) return centro(spawns[0]);
      return null;
    }

    /* ────────── STATO NPC / TRAINER (Fix 4) ────────── */

    _creaNpcStato() {
      npcStato = [];
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'npc' && ev.tipo !== 'trainer') continue;

        const dirCiclo = this._dirCiclo(ev.props.direzione);
        const patuglia = ev.props.pattuglia === true || ev.props.pattuglia === 'true' ||
                         ev.props.patuglia === true || ev.props.patuglia === 'true';
        let dir = this._normDir(ev.props.direzione);
        if (patuglia && dirCiclo) dir = dirCiclo[0];

        npcStato.push({
          ev,
          tipo: ev.tipo,
          id: ev.id || '',
          tx: ev.tx, ty: ev.ty,
          homeTx: ev.tx, homeTy: ev.ty,
          dir,
          movimento: String(ev.props.movimento || 'fisso').toLowerCase(),
          patuglia: !!(patuglia && dirCiclo),
          dirCiclo: dirCiclo || ['nord', 'sud'],
          cicloIdx: 0,
          raggio: parseInt(ev.props.raggio || '3', 10),
          timer: Math.floor(Math.random() * 75),   // sfasa i timer per non muoverli all'unisono
          sprite: null,
          inMovimento: false,
        });
      }
    }

    async _creaSpritesNPC() {
      const DIR_FRAME = { nord: 13, sud: 1, est: 9, ovest: 5 };

      for (const st of npcStato) {
        const ev = st.ev;
        const id = st.id;
        let spriteFile = null;

        if (st.tipo === 'npc') {
          const dati = (typeof DATI_NPC !== 'undefined') ? DATI_NPC[id] : null;
          if (dati && dati.sprite) spriteFile = dati.sprite;
        } else if (st.tipo === 'trainer') {
          const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[id] : null;
          if (dati && dati.sprite) spriteFile = dati.sprite;
        }
        // Fallback: se non c'è in DATI_*, usa la proprietà "sprite" messa in Tiled.
        if (!spriteFile && ev.props && ev.props.sprite) spriteFile = ev.props.sprite;

        if (!spriteFile) continue;   // senza sprite: l'evento resta valido (vista/interazione) ma invisibile

        // I file possono avere lo spazio ("NPC 05.png") o l'underscore
        // ("trainer_AROMALADY.png"): proviamo entrambe le forme.
        const candidati = [spriteFile];
        if (spriteFile.indexOf('_') >= 0) candidati.push(spriteFile.replace(/_/g, ' '));
        if (spriteFile.indexOf(' ') >= 0) candidati.push(spriteFile.replace(/\s+/g, '_'));

        const texKey = 'npc-' + spriteFile.replace(/\s+/g, '_');
        if (!this.textures.exists(texKey)) {
          let caricato = false;
          for (const nomeFile of candidati) {
            try {
              await new Promise((ok, ko) => {
                this.load.spritesheet(texKey, NPC_SPRITE_DIR + nomeFile + '.png',
                  { frameWidth: 32, frameHeight: 48 });
                this.load.once('complete', ok);
                this.load.once('loaderror', ko);
                this.load.start();
              });
              caricato = true; break;
            } catch (e) { /* prova il prossimo candidato */ }
          }
          if (!caricato) {
            console.warn('[NPC] Sprite non trovato:', spriteFile);
            continue;
          }
        }

        const px = st.tx * tileSize + tileSize / 2;
        const py = (st.ty + 1) * tileSize;
        const frame = DIR_FRAME[st.dir] || 1;

        const spr = this.add.sprite(px, py, texKey, frame)
          .setOrigin(0.5, 1).setDepth(20);
        if (tileSize < 32) spr.setScale(tileSize / 32);

        st.sprite = spr;
        npcSprites.push(spr);
      }
    }

    // Una casella è libera per un NPC? (bordi, collisioni, player, altri NPC)
    _liberoPerNPC(tx, ty, self) {
      if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return false;
      if (collGrid && collGrid[ty] && collGrid[ty][tx] === 1) return false;
      if (tx === posTile.tx && ty === posTile.ty) return false;
      for (const o of npcStato) {
        if (o !== self && o.tx === tx && o.ty === ty) return false;
      }
      return true;
    }

    // Aggiorna movimento NPC (random) e pattuglia trainer — chiamato ogni frame
    _aggiornaNPC() {
      for (const st of npcStato) {
        st.timer++;

        // Trainer in pattuglia: cambia direzione (e quindi cono visivo) periodicamente
        if (st.tipo === 'trainer' && st.patuglia) {
          if (st.timer >= 120) {
            st.timer = 0;
            st.cicloIdx = (st.cicloIdx + 1) % st.dirCiclo.length;
            st.dir = st.dirCiclo[st.cicloIdx];
            this._setNpcFrame(st.sprite, st.dir, false);
          }
          continue;
        }

        // NPC con movimento casuale
        if (st.movimento === 'random' && !st.inMovimento) {
          if (st.timer >= 75) {
            st.timer = 0;
            const dirs = ['nord', 'sud', 'est', 'ovest'];
            const nd = dirs[Math.floor(Math.random() * 4)];
            st.dir = nd;
            const { dx, dy } = this._dirDelta(nd);
            const ntx = st.tx + dx, nty = st.ty + dy;

            const fuoriRaggio = Math.abs(ntx - st.homeTx) > st.raggio ||
                                Math.abs(nty - st.homeTy) > st.raggio;

            if (!fuoriRaggio && this._liberoPerNPC(ntx, nty, st)) {
              st.tx = ntx; st.ty = nty;
              if (st.sprite) {
                const px = ntx * tileSize + tileSize / 2;
                const py = (nty + 1) * tileSize;
                st.inMovimento = true;
                this._setNpcFrame(st.sprite, nd, true);
                scena.tweens.killTweensOf(st.sprite);
                scena.tweens.add({
                  targets: st.sprite, x: px, y: py, duration: 220, ease: 'Linear',
                  onComplete: () => {
                    st.inMovimento = false;
                    this._setNpcFrame(st.sprite, st.dir, false);
                  },
                });
              }
            } else {
              this._setNpcFrame(st.sprite, nd, false);
            }
          }
        }
      }
    }

    _renderSplitLayer(data1d, ts, depth) {
      const splitAt = ts.splitTiles;
      const partsInfo = [
        { key: ts.key,  offset: 0,       label: 'A' },
        { key: ts.key2, offset: splitAt, label: 'B' },
      ];
      for (const part of partsInfo) {
        const data2d = [];
        let hasTiles = false;
        for (let r = 0; r < mapH; r++) {
          const row = [];
          for (let c = 0; c < mapW; c++) {
            const gid = data1d[r * mapW + c];
            if (gid >= ts.firstgid && gid < ts.nextGid) {
              const local = gid - ts.firstgid;
              if (part.offset === 0 && local < splitAt) {
                row.push(local); hasTiles = true;
              } else if (part.offset > 0 && local >= splitAt) {
                row.push(local - splitAt); hasTiles = true;
              } else {
                row.push(-1);
              }
            } else {
              row.push(-1);
            }
          }
          data2d.push(row);
        }
        if (!hasTiles) continue;
        if (!this.textures.exists(part.key)) continue;
        const map = this.make.tilemap({ data: data2d, tileWidth: ts.tw, tileHeight: ts.th });
        const tileset = map.addTilesetImage('ts' + part.label, part.key, ts.tw, ts.th, 0, 0);
        const layer = map.createLayer(0, tileset);
        if (layer) {
          if (ts.tw !== tileSize) layer.setScale(tileSize / ts.tw);
          layer.setDepth(depth);
          layerObjects.push(layer);
        }
      }
    }

    _pulisciLayers() {
      for (const obj of layerObjects) {
        try { obj.tilemap.destroy(); } catch (_) {}
      }
      layerObjects = [];
      for (const s of npcSprites) {
        try { s.destroy(); } catch (_) {}
      }
      npcSprites = [];
      npcStato = [];
    }

    _posizionaPlayer(tx, ty) {
      posTile = { tx, ty };
      const px = tx * tileSize + tileSize / 2;
      const py = (ty + 1) * tileSize;

      if (!playerSprite) {
        playerSprite = this.add.sprite(px, py, 'player-red')
          .setOrigin(0.5, 1).setDepth(30);
        playerSprite.anims.play('idle-down');
      } else {
        // IMPORTANTE: ferma eventuali tween di movimento ancora in corso dalla
        // mappa precedente, altrimenti continuano a trascinare lo sprite lontano
        // dallo spawn (il giocatore "appariva" a nord/sud finché non si muoveva).
        this.tweens.killTweensOf(playerSprite);
        playerSprite.setPosition(px, py);
        playerSprite.anims.play(`idle-${facciata}`, true);
      }

      // Camera centrata di colpo sullo spawn (snap), poi segue il giocatore.
      this.cameras.main.stopFollow();
      this.cameras.main.centerOn(px, py - tileSize / 2);
      this.cameras.main.startFollow(playerSprite, true, 0.15, 0.15, 0, tileSize / 2);
      this.cameras.main.centerOn(px, py - tileSize / 2);
    }

    /* ────────── GAME LOOP ────────── */

    update(_time, delta) {
      if (bloccato) return;

      // NPC e trainer si muovono/guardano ogni frame (Fix 4)
      frameCount++;
      this._aggiornaNPC();
      this._controllaTrainerVista();

      this.moveCD -= delta;

      // Interazione con Spazio (alias di [A], gestito anche via DOM in app.js).
      if (this.spaceKey.isDown && !spaceWasDown) {
        spaceWasDown = true;
        if (eventoVicino) { this._interagisci(eventoVicino); return; }
      }
      if (!this.spaceKey.isDown) spaceWasDown = false;

      // Movimento SOLO con le frecce direzionali (i tasti A/B/Start sono per le azioni).
      const c = this.cursors;
      let dx = 0, dy = 0;
      if (c.left.isDown)  dx = -1;
      if (c.right.isDown) dx =  1;
      if (c.up.isDown)    dy = -1;
      if (c.down.isDown)  dy =  1;

      // Fix 1 — niente diagonali: l'asse verticale ha la precedenza.
      if (dy !== 0) dx = 0;

      if (dx !== 0 || dy !== 0) {
        if (this.moveCD <= 0) {
          this.moveCD = 150 / velocita;
          this._sposta(dx, dy);
        }
      } else {
        if (playerSprite) playerSprite.anims.play(`idle-${facciata}`, true);
      }
    }

    /* ────────── MOVIMENTO ────────── */

    _sposta(dx, dy) {
      if (bloccato) return;
      const newTx = posTile.tx + dx;
      const newTy = posTile.ty + dy;

      if (newTx < 0 || newTx >= mapW || newTy < 0 || newTy >= mapH) {
        this._gestisciUscitaBordo(dx, dy);
        return;
      }

      if (dx < 0) facciata = 'left';
      else if (dx > 0) facciata = 'right';
      else if (dy < 0) facciata = 'up';
      else facciata = 'down';

      if (collGrid && collGrid[newTy] && collGrid[newTy][newTx] === 1) {
        if (playerSprite) playerSprite.anims.play(`idle-${facciata}`, true);
        return;
      }

      // NPC e trainer sono solidi: non ci si passa attraverso
      for (const o of npcStato) {
        if (o.tx === newTx && o.ty === newTy) {
          if (playerSprite) playerSprite.anims.play(`idle-${facciata}`, true);
          return;
        }
      }

      if (playerSprite) playerSprite.anims.play(`walk-${facciata}`, true);

      posTile = { tx: newTx, ty: newTy };
      const px = newTx * tileSize + tileSize / 2;
      const py = (newTy + 1) * tileSize;
      const dur = Math.max(80, 150 / velocita);

      if (playerSprite) {
        scena.tweens.killTweensOf(playerSprite);
        scena.tweens.add({ targets: playerSprite, x: px, y: py, duration: dur, ease: 'Linear' });
      }

      this._aggiornaLatLon();
      if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
      if (onPassoCb) onPassoCb({ ...posLatLon });

      this._aggiornaEventoVicino();
      this._controllaEventiCalpestabili();
    }

    // Fix 2 — tipo di terreno sotto una casella, letto dalle zone del layer eventi.
    // Restituisce l'oggetto zona ('erba_alta' | 'acqua' | 'incontri') o null.
    _getTileType(tx, ty) {
      for (const ev of eventiMappa) {
        if (ev.tipo !== 'erba_alta' && ev.tipo !== 'acqua' && ev.tipo !== 'incontri') continue;
        if (ev.w > 0 && ev.h > 0 &&
            tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
          return ev;
        }
      }
      return null;
    }

    _aggiornaLatLon() {
      if (mappaInfo && mappaInfo.interno && mappaInfo.latFissa) {
        posLatLon = { lat: mappaInfo.latFissa, lon: mappaInfo.lonFissa };
      } else if (mappaInfo && !mappaInfo.interno) {
        posLatLon = tileToLatLon(posTile.tx, posTile.ty, mappaInfo);
      }
    }

    _gestisciUscitaBordo(dx, dy) {
      const uscite = eventiMappa.filter(e =>
        e.tipo === 'uscita' || e.tipo === 'entrata' || e.tipo === 'warp');
      for (const u of uscite) {
        if (u.w > 0 && u.h > 0) {
          if (posTile.tx >= u.tx0 && posTile.tx <= u.tx1 &&
              posTile.ty >= u.ty0 && posTile.ty <= u.ty1) {
            this._transizioneMappa(u);
            return;
          }
          if (dy < 0 && posTile.ty === u.ty1 + 1) { this._transizioneMappa(u); return; }
          if (dy > 0 && posTile.ty === u.ty0 - 1) { this._transizioneMappa(u); return; }
          if (dx < 0 && posTile.tx === u.tx1 + 1) { this._transizioneMappa(u); return; }
          if (dx > 0 && posTile.tx === u.tx0 - 1) { this._transizioneMappa(u); return; }
        }
      }
    }

    /* ────────── EVENTI ────────── */

    // Restituisce l'evento interagibile presente in una casella (NPC/trainer alla
    // loro posizione corrente; cartelli/oggetti/pc/trigger come rettangoli o punti).
    _eventoInCasella(tx, ty) {
      for (const st of npcStato) {
        if ((st.tipo === 'npc' || st.tipo === 'trainer') && st.tx === tx && st.ty === ty)
          return st.ev;
      }
      for (const ev of eventiMappa) {
        const interagibile =
          ev.tipo === 'cartello' || ev.tipo === 'cartel' || ev.tipo === 'pc' ||
          ev.tipo === 'oggetto'  || ev.tipo === 'object' ||
          (typeof ev.tipo === 'string' && ev.tipo.indexOf('trigger_') === 0);
        if (!interagibile) continue;
        const occ = (ev.w > 0 && ev.h > 0)
          ? (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1)
          : (ev.tx === tx && ev.ty === ty);
        if (occ) return ev;
      }
      return null;
    }

    _aggiornaEventoVicino() {
      const ftx = posTile.tx + (facciata === 'right' ? 1 : facciata === 'left' ? -1 : 0);
      const fty = posTile.ty + (facciata === 'down'  ? 1 : facciata === 'up'   ? -1 : 0);

      // Si può interagire da QUALSIASI direzione: si controlla la casella che
      // guardi, poi quella sotto i piedi, poi le 4 adiacenti.
      const caselle = [
        { tx: ftx, ty: fty },                       // davanti (priorità)
        { tx: posTile.tx, ty: posTile.ty },         // sotto i piedi
        { tx: posTile.tx, ty: posTile.ty - 1 },     // su
        { tx: posTile.tx, ty: posTile.ty + 1 },     // giù
        { tx: posTile.tx - 1, ty: posTile.ty },     // sinistra
        { tx: posTile.tx + 1, ty: posTile.ty },     // destra
      ];

      let trovato = null;
      for (const c of caselle) {
        trovato = this._eventoInCasella(c.tx, c.ty);
        if (trovato) break;
      }

      eventoVicino = trovato;
      const ovEl = document.getElementById('overlay-interagisci');
      if (ovEl) {
        if (trovato && lblInteragisci) {
          let label = trovato.nome || trovato.id || 'Interagisci';
          let icona = '💬';
          if (typeof trovato.tipo === 'string' && trovato.tipo.indexOf('trigger_') === 0) {
            const NOMI = { surf: 'Surf', taglio: 'Taglio', spaccaroccia: 'Spaccaroccia', forza: 'Forza' };
            const k = trovato.tipo.replace('trigger_', '');
            label = NOMI[k] || k; icona = '🌊';
          } else if (trovato.tipo === 'trainer') {
            const dt = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[trovato.id] : null;
            label = (dt && dt.nome) ? dt.nome : 'Allenatore'; icona = '⚔️';
          } else if (trovato.tipo === 'cartello' || trovato.tipo === 'cartel') {
            label = 'Leggi'; icona = '📖';
          }
          lblInteragisci.textContent = `${icona} ${label}`;
          ovEl.classList.remove('nascosto');
        } else {
          ovEl.classList.add('nascosto');
        }
      }
    }

    _interagisci(ev) {
      if (bloccato) return;
      const tipo = ev.tipo;

      // Ostacoli MN (trigger_surf, trigger_spaccaroccia, trigger_taglio, …)
      if (tipo.indexOf('trigger_') === 0) { this._gestisciTrigger(ev); return; }

      // Allenatori (gregari + capopalestra): sfida premendo [A] se non già battuti.
      if (tipo === 'trainer') {
        const id = ev.id;
        const dati = (typeof DATI_TRAINER !== 'undefined') ? DATI_TRAINER[id] : null;
        const giaBattuto = trainerBattuti.has(id) ||
          (typeof stato !== 'undefined' && stato.allenatoriBattuti && stato.allenatoriBattuti.includes(id));
        if (giaBattuto) {
          if (dati && dati.dialogo_dopo && typeof mostraDialogo === 'function')
            mostraDialogo(dati.nome || id, [dati.dialogo_dopo]);
          return;
        }
        if (dati) this._avviaLottaTrainer(id, dati, ev);
        return;
      }

      if (tipo === 'npc') {
        const dati = (typeof DATI_NPC !== 'undefined') ? DATI_NPC[ev.id] : null;
        if (dati && dati.azione && typeof window[dati.azione] === 'function') {
          window[dati.azione]();
        } else if (dati && dati.dialogo && dati.dialogo.length > 0) {
          if (typeof mostraDialogo === 'function') {
            mostraDialogo(ev.nome || ev.id, dati.dialogo);
          }
        } else if (ev.props.dialogo) {
          if (typeof mostraDialogo === 'function') {
            mostraDialogo(ev.nome || ev.id, [ev.props.dialogo]);
          }
        }
        return;
      }

      if (tipo === 'cartello' || tipo === 'cartel') {
        const testo = ev.props.testo || ev.props.dialogo || '';
        const dati = (typeof DATI_CARTELLI !== 'undefined') ? DATI_CARTELLI[ev.id] : null;
        const testoFinale = (dati && dati.testo) ? dati.testo : testo;
        if (testoFinale && typeof mostraDialogo === 'function') {
          mostraDialogo('Cartello', [testoFinale]);
        }
        return;
      }

      if (tipo === 'pc') {
        if (typeof mostraToast === 'function')
          mostraToast('📦 Apri il menu ☰ → Box per gestire i Pokémon', 3000);
        return;
      }

      if (tipo === 'oggetto' || tipo === 'object') {
        // Chiave univoca basata su mappa + posizione: così oggetti diversi che
        // condividono lo stesso "id" in Tiled (es. "univoco") restano indipendenti.
        const idUnivoco = `${mappaCorrente}:${ev.tx},${ev.ty}`;
        if (typeof stato !== 'undefined' && stato.oggettiRaccolti && stato.oggettiRaccolti.includes(idUnivoco)) return;
        // Normalizza il nome (es. "caramella rara" → "caramellarara") per farlo
        // combaciare con le chiavi reali in OGGETTI/zaino.
        let contenuto = ev.props.contenuto || 'pozione';
        const norm = String(contenuto).toLowerCase().replace(/\s+/g, '');
        if (typeof OGGETTI !== 'undefined' && OGGETTI[norm]) contenuto = norm;
        const qta = parseInt(ev.props['quantità'] || ev.props.quantita || '1', 10);
        if (typeof stato !== 'undefined') {
          if (!stato.zaino[contenuto]) stato.zaino[contenuto] = 0;
          stato.zaino[contenuto] += qta;
          if (!stato.oggettiRaccolti) stato.oggettiRaccolti = [];
          stato.oggettiRaccolti.push(idUnivoco);
          const nomeVis = (typeof OGGETTI !== 'undefined' && OGGETTI[contenuto]) ? OGGETTI[contenuto].nome : contenuto;
          if (typeof mostraToast === 'function')
            mostraToast(`Hai trovato ${qta}× ${nomeVis}!`, 3000);
          if (typeof salvaPartita === 'function') salvaPartita();
        }
        return;
      }
    }

    // Ostacoli da MN: davanti a un masso/acqua si preme [A]. Se possiedi la MN
    // giusta lo superi (la casella diventa calpestabile), altrimenti un avviso.
    _gestisciTrigger(ev) {
      const chiave = ev.tipo.replace('trigger_', '');   // es. "surf", "spaccaroccia"
      const NOMI = { surf: 'Surf', taglio: 'Taglio', spaccaroccia: 'Spaccaroccia',
                     forza: 'Forza', volo: 'Volo' };
      const nome = NOMI[chiave] || chiave;
      const ha = (typeof stato !== 'undefined' && stato.mn && stato.mn[chiave]);

      if (!ha) {
        if (typeof mostraToast === 'function')
          mostraToast(`🔒 Serve la MN ${nome} per superare questo ostacolo.`, 2500);
        return;
      }

      // Possiedi la MN: libera la/e casella/e dell'ostacolo così puoi passare.
      if (ev.w > 0 && ev.h > 0) {
        for (let r = ev.ty0; r <= ev.ty1; r++)
          for (let cc = ev.tx0; cc <= ev.tx1; cc++)
            if (collGrid[r]) collGrid[r][cc] = 0;
      } else if (collGrid[ev.ty]) {
        collGrid[ev.ty][ev.tx] = 0;
      }
      if (typeof mostraToast === 'function') mostraToast(`Hai usato ${nome}! ✨`, 1800);
    }

    _controllaEventiCalpestabili() {
      const tx = posTile.tx, ty = posTile.ty;

      for (const ev of eventiMappa) {
        if (ev.tipo === 'porta') {
          if (ev.w > 0 && ev.h > 0) {
            if (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
              this._gestisciPorta(ev); return;
            }
          } else if (ev.tx === tx && ev.ty === ty) {
            this._gestisciPorta(ev); return;
          }
        }

        // 'uscita' (vecchie mappe) e 'warp' (mappe nuove) si comportano uguale:
        // scattano quando il giocatore calpesta la casella.
        if (ev.tipo === 'uscita' || ev.tipo === 'warp') {
          if (ev.w > 0 && ev.h > 0) {
            if (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1) {
              this._transizioneMappa(ev); return;
            }
          } else if (ev.point && ev.tx === tx && ev.ty === ty) {
            this._transizioneMappa(ev); return;
          }
        }

        // Oggetti a terra: raccolti calpestandoli (come le Poké Ball nei giochi).
        if (ev.tipo === 'oggetto' || ev.tipo === 'object') {
          const occ = (ev.w > 0 && ev.h > 0)
            ? (tx >= ev.tx0 && tx <= ev.tx1 && ty >= ev.ty0 && ty <= ev.ty1)
            : (ev.tx === tx && ev.ty === ty);
          if (occ) this._interagisci(ev);
        }

      }

      // Incontri selvatici SOLO se la casella è erba alta o acqua (Fix 2)
      const terreno = this._getTileType(tx, ty);
      if (terreno) {
        if (cooldownIncontro > 0) cooldownIncontro--;   // tregua post-incontro
        else this._tentaIncontro(terreno);
      }
    }

    // Porta lo sprite ESATTAMENTE sulla sua casella (annullando il tween di
    // movimento in corso): così al teletrasporto il personaggio non "anticipa".
    _snapPlayer() {
      if (!playerSprite || !scena) return;
      scena.tweens.killTweensOf(playerSprite);
      playerSprite.x = posTile.tx * tileSize + tileSize / 2;
      playerSprite.y = (posTile.ty + 1) * tileSize;
    }

    _gestisciPorta(ev) {
      if (transizioneAttiva) return;
      this._snapPlayer();
      const dest = ev.props.destinazione;
      if (!dest) return;
      const datiPorta = (typeof DATI_PORTE !== 'undefined') ? DATI_PORTE[dest] : null;

      // Salva posizione UN tile indietro dalla porta (così al ritorno non ri-entra)
      const backDx = facciata === 'right' ? -1 : facciata === 'left' ? 1 : 0;
      const backDy = facciata === 'down'  ? -1 : facciata === 'up'   ? 1 : 0;
      const returnTx = Math.max(0, Math.min(mapW - 1, posTile.tx + backDx));
      const returnTy = Math.max(0, Math.min(mapH - 1, posTile.ty + backDy));

      mappaStack.push({
        mappa: mappaCorrente,
        tx: returnTx,
        ty: returnTy,
        facciata,
      });

      if (datiPorta && datiPorta.mappa && MAPPE[datiPorta.mappa]) {
        const ax = datiPorta.arrivo_x ?? parseInt(ev.props.arrivo_x || '5', 10);
        const ay = datiPorta.arrivo_y ?? parseInt(ev.props.arrivo_y || '8', 10);
        const spawnId = ev.props.spawn_id || ev.props.spawnId || null;
        this.caricaMappa(datiPorta.mappa, ax, ay, spawnId, mappaCorrente);
      } else {
        const nome = (datiPorta && datiPorta.nome) ? datiPorta.nome : (dest || 'Interno');
        this._apriInternoFallback(nome);
      }
    }

    async _transizioneMappa(ev) {
      if (transizioneAttiva) return;

      // ── GATE: warp che si apre solo se un flag di gioco è attivo ──
      // In Tiled si aggiunge al warp una proprietà "richiede" col nome del flag
      // (es. richiede = "legaCompletata"). Finché il flag è falso, il passaggio
      // è bloccato e mostra un messaggio (proprietà "messaggio_gate", opzionale).
      const gate = ev.props.richiede || ev.props.gate;
      if (gate && typeof stato !== 'undefined' && stato.flags && !stato.flags[gate]) {
        const msg = ev.props.messaggio_gate || '🔒 Non puoi ancora entrare qui.';
        if (typeof mostraToast === 'function') mostraToast(msg, 2500);
        return;
      }

      // Fa "arrivare" il personaggio sulla casella prima di cambiare mappa
      // (evita il teletrasporto anticipato a metà animazione).
      this._snapPlayer();

      // Dentro un interno (Centro/Palestra/Market…): qualsiasi uscita riporta
      // al punto da cui sei entrato (usa lo stack), ignorando la destinazione.
      if (mappaInfo && mappaInfo.interno && mappaStack.length > 0) {
        transizioneAttiva = true;
        bloccato = true;
        const prev = mappaStack.pop();
        await this.caricaMappa(prev.mappa, prev.tx, prev.ty);
        transizioneAttiva = false;
        bloccato = false;
        return;
      }

      transizioneAttiva = true;
      bloccato = true;

      const dest = ev.props.destinazione;

      // Nessuna destinazione: torna alla mappa precedente (se c'è uno stack)
      if (!dest) {
        if (mappaStack.length > 0) {
          const prev = mappaStack.pop();
          await this.caricaMappa(prev.mappa, prev.tx, prev.ty);
        }
        transizioneAttiva = false;
        bloccato = false;
        return;
      }

      const chiaveDest = risolviMappa(dest);
      if (!chiaveDest) {
        console.warn('[Map] Destinazione non ancora disponibile:', dest);
        if (typeof mostraToast === 'function') mostraToast('🚧 Zona non ancora disponibile', 2000);
        transizioneAttiva = false;
        bloccato = false;
        return;
      }

      // spawn_id esplicito sul warp (se presente), altrimenti si usa la mappa
      // di provenienza per scegliere lo spawn giusto.
      const spawnId = ev.props.spawn_id || ev.props.spawnId || null;
      let ax = (ev.props.arrivo_x !== undefined) ? parseInt(ev.props.arrivo_x, 10) : undefined;
      let ay = (ev.props.arrivo_y !== undefined) ? parseInt(ev.props.arrivo_y, 10) : undefined;
      if (isNaN(ax)) ax = undefined;
      if (isNaN(ay)) ay = undefined;
      const sourceKey = mappaCorrente;

      // Se entriamo in un interno (Centro, palestra, villa…) ricordiamo da dove
      // veniamo, UN TILE indietro dalla porta, così uscendo non ci si rientra subito.
      if (MAPPE[chiaveDest] && MAPPE[chiaveDest].interno) {
        const bdx = facciata === 'right' ? -1 : facciata === 'left' ? 1 : 0;
        const bdy = facciata === 'down'  ? -1 : facciata === 'up'   ? 1 : 0;
        const rtx = Math.max(0, Math.min(mapW - 1, posTile.tx + bdx));
        const rty = Math.max(0, Math.min(mapH - 1, posTile.ty + bdy));
        mappaStack.push({ mappa: mappaCorrente, tx: rtx, ty: rty, facciata });
      }

      await this.caricaMappa(chiaveDest, ax, ay, spawnId, sourceKey);
      transizioneAttiva = false;
    }

    _tentaIncontro(ev) {
      if (typeof stato === 'undefined' || stato.incontroAttivo) return;
      if (stato.repellentePassi && stato.repellentePassi > 0) return;

      const id = ev.id || ev.props.id || '';
      const dati = (typeof DATI_INCONTRI !== 'undefined') ? DATI_INCONTRI[id] : null;
      if (!dati) return;

      // Probabilità per casella (default 15% se la zona non la specifica)
      const prob = (dati.probabilita != null) ? dati.probabilita : PROB_INCONTRO;
      if (Math.random() * 100 > prob) return;

      const pool = dati.pokemon;
      if (!pool || pool.length === 0) return;
      const scelto = pool[Math.floor(Math.random() * pool.length)];
      const livello = scelto.min + Math.floor(Math.random() * (scelto.max - scelto.min + 1));

      cooldownIncontro = PASSI_TREGUA;   // tregua prima del prossimo incontro
      stato.incontroAttivo = true;
      bloccaMovimento();
      if (typeof Battle !== 'undefined') {
        Battle.avvia({
          idPokemon: scelto.id,
          livello,
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            sbloccaMovimento();
            if (typeof salvaPartita === 'function') salvaPartita();
          },
        });
      }
    }

    // Cono visivo dei trainer, controllato ogni frame nella direzione corrente (Fix 4).
    _controllaTrainerVista() {
      if (typeof stato === 'undefined' || stato.incontroAttivo) return;
      if (transizioneAttiva || bloccato) return;
      if (typeof DATI_TRAINER === 'undefined') return;

      for (const st of npcStato) {
        if (st.tipo !== 'trainer') continue;
        const id = st.id;
        if (!id) continue;
        if (trainerBattuti.has(id)) continue;
        if (typeof stato.allenatoriBattuti !== 'undefined' &&
            stato.allenatoriBattuti.includes(id)) {
          trainerBattuti.add(id);
          continue;
        }

        const dati = DATI_TRAINER[id];
        if (!dati) continue;

        // vista 0 (o assente sul capopalestra) = NESSUNA linea visiva: si sfida
        // solo parlandoci con [A], non passandoci davanti.
        let vRaw = st.ev.props.vista;
        if (vRaw === undefined || vRaw === '') vRaw = dati.vista;
        const vista = parseInt(vRaw, 10);
        if (!vista || vista <= 0) continue;

        const { dx, dy } = this._dirDelta(st.dir);
        if (dx === 0 && dy === 0) continue;

        // Scansiona in linea retta finché non incontra un muro o il giocatore
        let visto = false;
        for (let d = 1; d <= vista; d++) {
          const cx = st.tx + dx * d, cy = st.ty + dy * d;
          if (cx < 0 || cy < 0 || cx >= mapW || cy >= mapH) break;
          if (collGrid && collGrid[cy] && collGrid[cy][cx] === 1) break;
          if (cx === posTile.tx && cy === posTile.ty) { visto = true; break; }
        }

        if (visto) {
          this._avviaLottaTrainer(id, dati, st.ev);
          return;
        }
      }
    }

    _avviaLottaTrainer(id, dati, ev) {
      stato.incontroAttivo = true;
      bloccaMovimento();

      const nomeLotta = dati.nome || ev.nome || id;
      const dialogo = dati.dialogo_prima || 'Preparati a lottare!';
      const dopoDialogo = () => {
        Battle.avvia({
          allenatore: {
            nome: nomeLotta,
            squadra: dati.squadra,
            dialogoSconfitta: dati.dialogo_dopo || '',
            premioSoldi: dati.premio || 100,
          },
          stato,
          onFine: (esito) => {
            stato.incontroAttivo = false;
            if (esito === 'vittoria') {
              trainerBattuti.add(id);
              if (!stato.allenatoriBattuti) stato.allenatoriBattuti = [];
              if (!stato.allenatoriBattuti.includes(id)) stato.allenatoriBattuti.push(id);
              // Capopalestra: assegna medaglia + alza il level cap (logica in app.js).
              // Il dialogo della medaglia gestisce da sé il blocco/sblocco movimento.
              if (dati.palestraId && typeof vinciPalestraTiled === 'function') {
                vinciPalestraTiled(dati.palestraId);
                if (typeof salvaPartita === 'function') salvaPartita();
                return;
              }
            }
            sbloccaMovimento();
            if (typeof salvaPartita === 'function') salvaPartita();
          },
        });
      };

      if (typeof mostraDialogo === 'function') {
        mostraDialogo(nomeLotta, [dialogo]).then(dopoDialogo);
      } else {
        dopoDialogo();
      }
    }

    /* ────────── INTERNO FALLBACK ────────── */

    _apriInternoFallback(nomeLuogo) {
      ['hud', 'btn-menu', 'btn-velocita', 'dpad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      bloccaMovimento();
      this.scene.pause();
      phaserGame.scene.launch('InteriorScene', { nome: nomeLuogo || 'Casa' });
    }

    /* ────────── D-PAD ────────── */

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
      btn('btn-su',        0, -1);
      btn('btn-giu',       0,  1);
      btn('btn-sinistra', -1,  0);
      btn('btn-destra',    1,  0);
    }
  }

  /* ══════════════════════════════════════════════════════════
     INTERIOR SCENE — fallback per interni senza TMJ
     ══════════════════════════════════════════════════════════ */

  class InteriorScene extends Phaser.Scene {
    constructor() { super({ key: 'InteriorScene' }); }

    init(data) { this._nome = data.nome || 'Casa'; }

    create() {
      const TI = 32, COLS = 10, ROWS = 8;
      const CW = this.cameras.main.width, CH = this.cameras.main.height;
      const RW = COLS * TI, RH = ROWS * TI;
      const OX = Math.floor((CW - RW) / 2), OY = Math.floor((CH - RH) / 2) - 20;

      this._grid = [
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,9,9,9,1,1,1,1,1],
      ];
      this._COLS = COLS; this._ROWS = ROWS;
      this._TI = TI; this._OX = OX; this._OY = OY;

      this.add.rectangle(CW / 2, CH / 2, CW, CH, 0x0a0a14).setDepth(0);
      const gfx = this.add.graphics().setDepth(1);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const px = OX + c * TI, py = OY + r * TI;
          const v = this._grid[r][c];
          if (v === 1) {
            gfx.fillStyle(0x3a2515).fillRect(px, py, TI, TI);
            gfx.fillStyle(0x2a180e).fillRect(px, py, TI, 4);
            gfx.lineStyle(1, 0x1a0a05, 0.7); gfx.strokeRect(px, py, TI, TI);
          } else if (v === 9) {
            gfx.fillStyle(0x6a3a1a).fillRect(px, py, TI, TI);
          } else {
            const col = ((r + c) % 2 === 0) ? 0xB09070 : 0xA08060;
            gfx.fillStyle(col).fillRect(px, py, TI, TI);
            gfx.lineStyle(1, 0x7a5a3a, 0.3); gfx.strokeRect(px, py, TI, TI);
          }
        }
      }
      this.add.text(OX + 3 * TI + TI * 1.5, OY + 7 * TI + TI / 2, '▼',
        { fontSize: '12px', color: '#ffcb05' }).setOrigin(0.5).setDepth(3);
      this.add.text(CW / 2, OY - 18, this._nome, {
        fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#ffcb05',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5, 1).setDepth(5);
      this.add.text(CW / 2, OY + RH + 6, '↓ sulla porta per uscire',
        { fontFamily: 'Arial', fontSize: '10px', color: '#888' }
      ).setOrigin(0.5, 0).setDepth(5);

      this._px = 4; this._py = 6;
      const spx = OX + this._px * TI + TI / 2;
      const spy = OY + (this._py + 1) * TI;
      this._sprite = this.add.sprite(spx, spy, 'player-red')
        .setOrigin(0.5, 1).setDepth(10).setScale(1.2);
      this._sprite.anims.play('idle-up', true);
      this._facciata = 'up';

      this._cursors = this.input.keyboard.createCursorKeys();
      this._wasd = this.input.keyboard.addKeys('W,A,S,D');
      this.input.keyboard.addCapture([38, 40, 37, 39]);
      this._cd = 0;
    }

    update(_t, delta) {
      this._cd -= delta;
      if (this._cd > 0) return;
      const c = this._cursors, k = this._wasd;
      let dx = 0, dy = 0;
      if (c.left.isDown || k.A.isDown) dx = -1;
      else if (c.right.isDown || k.D.isDown) dx = 1;
      else if (c.up.isDown || k.W.isDown) dy = -1;
      else if (c.down.isDown || k.S.isDown) dy = 1;
      if (dx === 0 && dy === 0) {
        this._sprite.anims.play(`idle-${this._facciata}`, true); return;
      }
      this._cd = 140;
      const nx = this._px + dx, ny = this._py + dy;
      if (ny >= this._ROWS - 1 && nx >= 2 && nx <= 4) { this._esci(); return; }
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
      ['hud', 'btn-menu', 'btn-velocita', 'dpad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.removeProperty('display');
      });
      if (mappaStack.length > 0) {
        const prev = mappaStack.pop();
        if (scena) scena.caricaMappa(prev.mappa, prev.tx, prev.ty);
      } else {
        sbloccaMovimento();
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     FUNZIONE CURA per il Centro Pokémon Tiled
     ══════════════════════════════════════════════════════════ */

  function interagisciCentroTiled() {
    if (typeof stato === 'undefined') return;
    bloccaMovimento();
    if (typeof mostraDialogo === 'function') {
      mostraDialogo('Infermiera Joy', [
        'Benvenuta al Centro Pokémon!',
        'Affidami i tuoi Pokémon, li curerò subito.',
        '...',
        'Ecco, i tuoi Pokémon sono in perfetta forma!',
      ]).then(() => {
        if (stato.squadra) {
          stato.squadra.forEach(p => {
            p.hpAttuale = p.hpMax;
            p.condizione = null;
            if (p.mosse) p.mosse.forEach(m => { m.pp = m.ppMax; });
          });
        }
        if (typeof mostraToast === 'function')
          mostraToast('🏥 Squadra curata!', 3000);
        if (typeof salvaPartita === 'function') salvaPartita();
        sbloccaMovimento();
      });
    }
  }
  window.interagisciCentroTiled = interagisciCentroTiled;

  /* ══════════════════════════════════════════════════════════
     API PUBBLICA
     ══════════════════════════════════════════════════════════ */

  function inizializza(opzioni) {
    if (opzioni.posizione) posLatLon = { ...opzioni.posizione };
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
      render: {
        pixelArt: true,
        antialias: false,
      },
      banner: false,
    });
  }

  // Attiva l'interazione con l'evento che il giocatore sta guardando (tasto [A]).
  function interagisciVicino() {
    if (!scena || bloccato) return false;
    if (eventoVicino) { scena._interagisci(eventoVicino); return true; }
    return false;
  }

  function bloccaMovimento() {
    bloccato = true;
    const ovEl = document.getElementById('overlay-interagisci');
    if (ovEl) ovEl.classList.add('nascosto');
    if (scena && scena.cursors) {
      try { scena.input.keyboard.resetKeys(); } catch (_) {}
    }
  }

  function sbloccaMovimento() {
    bloccato = false;
    if (scena) scena._aggiornaEventoVicino();
  }

  function posizioneGiocatore() { return { ...posLatLon }; }

  function impostaVelocita(v) { velocita = v; }

  function teleporta(pos) {
    posLatLon = { lat: pos.lat, lon: pos.lon };
    if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
  }

  function rimuoviMarkerOggetto(_id) {}

  // Debug: stato posizione/telecamera (usato dai test)
  function debugStato() {
    const cam = scena ? scena.cameras.main : null;
    return {
      mappa: mappaCorrente,
      tx: posTile.tx, ty: posTile.ty,
      sprite: playerSprite ? { x: playerSprite.x, y: playerSprite.y } : null,
      cam: cam ? { scrollX: cam.scrollX, scrollY: cam.scrollY, zoom: cam.zoom } : null,
    };
  }

  return {
    inizializza, bloccaMovimento, sbloccaMovimento, interagisciVicino,
    posizioneGiocatore, distanzaMetri, impostaVelocita,
    teleporta, rimuoviMarkerOggetto, debugStato,
  };

})();
