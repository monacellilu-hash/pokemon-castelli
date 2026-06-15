/* ============================================================
   map.js — F14: Phaser 3 (sostituisce Leaflet)

   API pubblica di GameMap IDENTICA alla versione Leaflet:
   inizializza · bloccaMovimento · sbloccaMovimento ·
   posizioneGiocatore · distanzaMetri · impostaVelocita ·
   teleporta · rimuoviMarkerOggetto

   app.js, data.js, world.js, battle.js → NON MODIFICATI.
   ============================================================ */

const GameMap = (function () {

  /* ----------------------------------------------------------
     SISTEMA DI COORDINATE
     Tutto il motore di gioco lavora in lat/lon reali.
     Qui convertiamo in tile per il rendering Phaser.
     ---------------------------------------------------------- */
  const BOUNDS = {
    latMin: 41.680, latMax: 41.895,
    lonMin: 12.565, lonMax: 12.790,
  };
  const MAP_W = 512;    // tile orizzontali
  const MAP_H = 660;    // tile verticali (leggermente più alto per coprire l'area)
  const TILE  = 16;     // pixel per tile

  // Scala: quanti metri copre un tile
  const LAT_M = (BOUNDS.latMax - BOUNDS.latMin) * 111320;          // ~23.9 km
  const LON_M = (BOUNDS.lonMax - BOUNDS.lonMin) * 111320
                * Math.cos(41.785 * Math.PI / 180);                 // ~18.5 km
  const M_TX  = LON_M / MAP_W;   // ~36 m/tile
  const M_TY  = LAT_M / MAP_H;   // ~36 m/tile

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

  // Distanza in metri (puro calcolo geometrico, no Leaflet)
  function distanzaMetri(a, b) {
    const dLat = (b.lat - a.lat) * RAGGIO_TERRA;
    const dLon = (b.lon - a.lon) * RAGGIO_TERRA * Math.cos(a.lat * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /* ----------------------------------------------------------
     TILESET PROCEDURALE
     Strip orizzontale: 1 riga, N tile da 16x16 px ciascuno.
     L'indice nel dato della tilemap = posizione nel strip.
     ---------------------------------------------------------- */
  const TERRENI = [
    { fill: '#8fb870', border: '#6d9850' }, // 0 — sfondo (campagna/default)
    { fill: '#3498d8', border: '#1a72b0' }, // 1 — acqua
    { fill: '#7dc840', border: '#55a028' }, // 2 — prato
    { fill: '#2a6e2a', border: '#184e18' }, // 3 — bosco
    { fill: '#d8d098', border: '#c0b870' }, // 4 — urbano
    { fill: '#9e8060', border: '#7e6040' }, // 5 — montagna
    { fill: '#404858', border: '#282838' }, // 6 — grotta
    { fill: '#c8e8f8', border: '#98c8e8' }, // 7 — neve
    { fill: '#c8a428', border: '#a88010' }, // 8 — vigne
    { fill: '#d8c870', border: '#b8a850' }, // 9 — percorso
    { fill: '#584040', border: '#381818' }, // 10 — interno/dungeon
    { fill: '#a8c858', border: '#88a838' }, // 11 — campagna
  ];

  const T_IDX = {
    default: 0, acqua: 1, prato: 2, bosco: 3, urbano: 4,
    montagna: 5, grotta: 6, neve: 7, vigne: 8, percorso: 9,
    interno: 10, dungeon: 10, campagna: 11,
  };

  function terrenoIdx(t) { return T_IDX[t] ?? 0; }

  /* ----------------------------------------------------------
     GENERAZIONE TILEMAP DAI DATI world.js
     Ordine: zone grandi prima (sfondo), poi zone specifiche
     in sovrascrittura. Questo mima la priorità di world.js
     (index 0 = più specifica) ma invertita per il painting.
     ---------------------------------------------------------- */
  function generaTilemap() {
    // Inizializza tutto a 0 (sfondo)
    const data = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(0));

    if (typeof World === 'undefined' || typeof World.getZone !== 'function') return data;

    // Invertiamo: prima le meno specifiche (in fondo all'array), poi le più specifiche
    const zones = [...World.getZone()].reverse();

    for (const z of zones) {
      const idx = terrenoIdx(z.terreno);
      if (z.tipo === 'cerchio') {
        const c   = latLonToTile(z.centro.lat, z.centro.lon);
        const rtx = Math.ceil(z.raggio / M_TX) + 1;
        const rty = Math.ceil(z.raggio / M_TY) + 1;
        for (let dy = -rty; dy <= rty; dy++) {
          for (let dx = -rtx; dx <= rtx; dx++) {
            // Ellisse per correggere la proporzione lat/lon → pixel
            if ((dx / rtx) ** 2 + (dy / rty) ** 2 <= 1) {
              const tx = c.tx + dx, ty = c.ty + dy;
              if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
                data[ty][tx] = idx;
              }
            }
          }
        }
      } else if (z.tipo === 'rettangolo') {
        const tl = latLonToTile(z.latMax, z.lonMin);
        const br = latLonToTile(z.latMin, z.lonMax);
        for (let ty = Math.max(0, tl.ty); ty <= Math.min(MAP_H - 1, br.ty); ty++) {
          for (let tx = Math.max(0, tl.tx); tx <= Math.min(MAP_W - 1, br.tx); tx++) {
            data[ty][tx] = idx;
          }
        }
      }
    }
    return data;
  }

  /* ----------------------------------------------------------
     STATO INTERNO
     ---------------------------------------------------------- */
  let phaserGame  = null;
  let scena       = null;   // riferimento alla GameScene attiva
  let playerRect  = null;   // il rettangolo sprite del giocatore
  let posTile     = { tx: 0, ty: 0 };
  let posLatLon   = { lat: 41.8420, lon: 12.6150 };
  let onPassoCb   = null;
  let bloccato    = false;
  let velocita    = 1;
  const oggettiMappa = {}; // id → Phaser GameObject (per rimuoverli)

  // Etichette dei POI (palestre, centri, NPC) — aggiunte nella scena
  let poiGroup = null;

  /* ----------------------------------------------------------
     SCENA PHASER
     ---------------------------------------------------------- */
  class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    // ----- preload: niente file esterni -----
    preload() {}

    // ----- create: tileset inline + tilemap + giocatore -----
    create() {
      scena = this;

      // ── 1. Tileset come canvas inline ──
      const numT = TERRENI.length;
      const cnv = document.createElement('canvas');
      cnv.width = TILE * numT;
      cnv.height = TILE;
      const ctx = cnv.getContext('2d');
      TERRENI.forEach((t, i) => {
        const x = i * TILE;
        // Colore base
        ctx.fillStyle = t.fill;
        ctx.fillRect(x, 0, TILE, TILE);
        // Bordo sottile per la griglia
        ctx.strokeStyle = t.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, 0.5, TILE - 1, TILE - 1);
      });
      this.textures.addCanvas('tileset', cnv);

      // ── 2. Tilemap procedurale ──
      const tilemapData = generaTilemap();
      const map = this.make.tilemap({
        data: tilemapData,
        tileWidth: TILE,
        tileHeight: TILE,
      });
      const ts = map.addTilesetImage('tileset', 'tileset', TILE, TILE, 0, 0);
      map.createLayer(0, ts, 0, 0);

      // ── 3. Etichette città (layer sopra la tilemap) ──
      poiGroup = this.add.group();
      this._aggiuntaEtichetteComuni();

      // ── 4. Sprite placeholder giocatore ──
      const st = latLonToTile(posLatLon.lat, posLatLon.lon);
      posTile = st;
      playerRect = this.add.rectangle(
        st.tx * TILE + TILE / 2,
        st.ty * TILE + TILE / 2,
        TILE - 2, TILE - 2,
        0xCC2200
      ).setDepth(30);

      // ── 5. Camera ──
      this.cameras.main
        .startFollow(playerRect, true, 0.1, 0.1)
        .setZoom(3)
        .setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

      // ── 6. Input tastiera ──
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd    = this.input.keyboard.addKeys('W,A,S,D');
      this.moveCD  = 0;

      // ── 7. Zoom con rotella del mouse ──
      this.input.on('wheel', (_p, _g, _dx, dy) => {
        const z = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(z - dy * 0.003, 1, 6));
      });

      // ── 8. D-Pad HTML ──
      this._collegaDpad();
    }

    // ----- update: movimento tastiera -----
    update(_time, delta) {
      if (bloccato) return;
      this.moveCD -= delta;
      if (this.moveCD > 0) return;

      const delay = 150 / velocita;
      const c = this.cursors, k = this.wasd;
      let dx = 0, dy = 0;
      if (c.left.isDown  || k.A.isDown) dx = -1;
      if (c.right.isDown || k.D.isDown) dx =  1;
      if (c.up.isDown    || k.W.isDown) dy = -1;
      if (c.down.isDown  || k.S.isDown) dy =  1;

      if (dx !== 0 || dy !== 0) {
        this.moveCD = delay;
        this._sposta(dx, dy);
      }
    }

    // ----- sposta: aggiorna tile, sprite, lat/lon, callback -----
    _sposta(dx, dy) {
      if (bloccato) return;
      const newTx = Phaser.Math.Clamp(posTile.tx + dx, 0, MAP_W - 1);
      const newTy = Phaser.Math.Clamp(posTile.ty + dy, 0, MAP_H - 1);
      if (newTx === posTile.tx && newTy === posTile.ty) return;

      posTile   = { tx: newTx, ty: newTy };
      posLatLon = tileToLatLon(newTx, newTy);
      playerRect.setPosition(newTx * TILE + TILE / 2, newTy * TILE + TILE / 2);

      // Mantiene stato.posizione sincronizzato per tutta la logica di app.js
      if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };

      // Callback app.js: conta passi, incontri, allenatori, leggendari, ecc.
      if (onPassoCb) onPassoCb({ ...posLatLon });
    }

    // ----- D-Pad HTML: touch/click sui pulsanti direzionali -----
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

    // ----- Etichette dei comuni sulla mappa -----
    _aggiuntaEtichetteComuni() {
      if (typeof PALESTRE === 'undefined') return;
      for (const p of PALESTRE) {
        const t = latLonToTile(p.lat, p.lon);
        // Sfondo etichetta
        const bg = this.add.rectangle(t.tx * TILE + TILE / 2, t.ty * TILE - TILE, 0, 12, 0x1a2940, 0.85);
        const txt = this.add.text(t.tx * TILE + TILE / 2, t.ty * TILE - TILE, p.comune, {
          fontSize: '7px',
          fontFamily: 'Arial',
          color: '#ffcb05',
          padding: { x: 3, y: 2 },
        }).setOrigin(0.5, 0.5).setDepth(25);
        bg.width = txt.width + 6;
        bg.setDepth(24);
        poiGroup.add(bg);
        poiGroup.add(txt);
      }
      // Etichetta città di partenza
      const cp = latLonToTile(41.8420, 12.6150);
      const t0 = this.add.text(cp.tx * TILE, cp.ty * TILE - TILE, 'Roma - Tuscolano', {
        fontSize: '7px', fontFamily: 'Arial', color: '#aef0ae', padding: { x: 3, y: 2 },
      }).setOrigin(0.5, 0.5).setDepth(25);
      poiGroup.add(t0);
    }
  }

  /* ----------------------------------------------------------
     API PUBBLICA  (identica alla versione Leaflet)
     ---------------------------------------------------------- */

  function inizializza(opzioni) {
    posLatLon = { ...opzioni.posizione };
    onPassoCb = opzioni.onPasso || null;

    phaserGame = new Phaser.Game({
      type:            Phaser.AUTO,
      parent:          'mappa',       // si allega al div #mappa
      backgroundColor: '#8fb870',
      scene:           GameScene,
      scale: {
        mode:       Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      // Disabilita il banner nella console
      banner: false,
    });
  }

  function bloccaMovimento() {
    bloccato = true;
    // Svuota i tasti premuti per evitare movimenti "fantma"
    if (scena && scena.cursors) {
      try { scena.input.keyboard.resetKeys(); } catch (_) {}
    }
  }

  function sbloccaMovimento() { bloccato = false; }

  function posizioneGiocatore() { return { ...posLatLon }; }

  function impostaVelocita(v) { velocita = v; }

  function teleporta(pos) {
    posLatLon = { lat: pos.lat, lon: pos.lon };
    const t   = latLonToTile(pos.lat, pos.lon);
    posTile   = t;
    if (playerRect) {
      playerRect.setPosition(t.tx * TILE + TILE / 2, t.ty * TILE + TILE / 2);
    }
    if (scena) scena.cameras.main.centerOn(playerRect.x, playerRect.y);
    if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
  }

  function rimuoviMarkerOggetto(id) {
    if (oggettiMappa[id]) {
      oggettiMappa[id].destroy();
      delete oggettiMappa[id];
    }
  }

  return {
    inizializza,
    bloccaMovimento,
    sbloccaMovimento,
    posizioneGiocatore,
    distanzaMetri,
    impostaVelocita,
    teleporta,
    rimuoviMarkerOggetto,
  };

})();
