/* ============================================================
   map.js — F14: Phaser 3 con asset FireRed/LeafGreen reali

   Tileset: sprites/tileset-outside.png (256×16064, tile 32×32)
   Player:  sprites/player-red.png (128×192, frame 32×48, 4dir×4frame)

   FASE 3: collisione acqua (senza MN Surf)
   FASE 4: lista POI + pulsante [A] + marker edifici

   API pubblica identica alla versione Leaflet — app.js invariato.
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
  const TILE  = 32;   // tile 32×32 — formato nativo FR/LG

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

  /* ----------------------------------------------------------
     TERRENO → INDICE TILE  (Outside.png, 8 tile/riga)
     Valori ricavati campionando i pixel dell'immagine.
     ---------------------------------------------------------- */
  const TT = {
    default:  1,    // erba base  RGB(112,200,160)
    acqua:    392,  // acqua      RGB(168,184,200)
    prato:    40,   // erba chiara RGB(160,224,192)
    bosco:    6,    // foresta    RGB(56,88,16)
    urbano:   240,  // grigio     RGB(168,160,152)
    montagna: 360,  // marrone    RGB(192,168,104)
    grotta:   560,  // teal scuro RGB(56,88,88)
    neve:     280,  // ghiaccio   RGB(216,224,224)
    vigne:    160,  // giallo     RGB(232,224,136)
    percorso: 120,  // beige      RGB(208,192,128)
    interno:  240,
    dungeon:  560,
    campagna: 480,  // verde medio RGB(128,208,96)
  };
  function terrenoIdx(t) { return TT[t] ?? TT.default; }

  /* ----------------------------------------------------------
     GENERAZIONE TILEMAP DAI DATI world.js
     ---------------------------------------------------------- */
  function generaTilemap() {
    const data = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(TT.default));
    if (typeof World === 'undefined' || typeof World.getZone !== 'function') return data;
    const zones = [...World.getZone()].reverse();
    for (const z of zones) {
      const idx = terrenoIdx(z.terreno);
      if (z.tipo === 'cerchio') {
        const c   = latLonToTile(z.centro.lat, z.centro.lon);
        const rtx = Math.ceil(z.raggio / M_TX) + 1;
        const rty = Math.ceil(z.raggio / M_TY) + 1;
        for (let dy = -rty; dy <= rty; dy++) {
          for (let dx = -rtx; dx <= rtx; dx++) {
            if ((dx / rtx) ** 2 + (dy / rty) ** 2 <= 1) {
              const tx = c.tx + dx, ty = c.ty + dy;
              if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) data[ty][tx] = idx;
            }
          }
        }
      } else if (z.tipo === 'rettangolo') {
        const tl = latLonToTile(z.latMax, z.lonMin);
        const br = latLonToTile(z.latMin, z.lonMax);
        for (let ty = Math.max(0, tl.ty); ty <= Math.min(MAP_H - 1, br.ty); ty++)
          for (let tx = Math.max(0, tl.tx); tx <= Math.min(MAP_W - 1, br.tx); tx++)
            data[ty][tx] = idx;
      }
    }
    return data;
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
  let playerSprite = null;   // sprite visivo (Phaser.GameObjects.Sprite)
  let playerTrack  = null;   // tracker invisibile per la camera
  let poiIndicator = null;
  let posTile      = { tx: 0, ty: 0 };
  let posLatLon    = { lat: 41.8420, lon: 12.6150 };
  let onPassoCb    = null;
  let bloccato     = false;
  let velocita     = 1;
  let facciata     = 'down';   // direzione corrente del giocatore
  let tilemapData  = null;
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

    // ── Caricamento asset reali ──
    preload() {
      this.load.image('tileset-outside', 'sprites/tileset-outside.png');
      this.load.spritesheet('player-red', 'sprites/player-red.png', {
        frameWidth: 32, frameHeight: 48,
      });
    }

    create() {
      scena = this;

      // ── 1. Tilemap con tileset FR/LG ──
      tilemapData = generaTilemap();
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
      // Layout: 4 colonne × 4 righe = frame 0-15
      // Riga 0: giù (0-3), Riga 1: sinistra (4-7), Riga 2: destra (8-11), Riga 3: su (12-15)
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
      const sy = (st.ty + 1) * TILE;   // fondo del tile → origin bottom-center

      // Tracker invisibile al centro del tile (la camera lo segue)
      playerTrack = this.add.rectangle(sx, sy - TILE / 2, 1, 1, 0, 0).setDepth(29);

      // Sprite visivo con origin in basso al centro
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
        .setZoom(2)   // TILE=32 → zoom 2 (era 3 con TILE=16)
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
        // Fermo → animazione idle
        if (playerSprite) playerSprite.anims.play(`idle-${facciata}`, true);
      }
    }

    _sposta(dx, dy) {
      if (bloccato) return;
      const newTx = Phaser.Math.Clamp(posTile.tx + dx, 0, MAP_W - 1);
      const newTy = Phaser.Math.Clamp(posTile.ty + dy, 0, MAP_H - 1);
      if (newTx === posTile.tx && newTy === posTile.ty) return;

      // Collisione acqua (FASE 3)
      if (tilemapData && tilemapData[newTy]) {
        if (tilemapData[newTy][newTx] === TT.acqua) {
          const hasSurf = typeof stato !== 'undefined' && stato.mn && stato.mn.surf;
          if (!hasSurf) {
            if (typeof mostraToast === 'function')
              mostraToast('🌊 Qui c\'è l\'acqua! Serve MN Surf.', 2000);
            return;
          }
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

      if (playerSprite) playerSprite.setPosition(px, py);
      if (playerTrack)  playerTrack.setPosition(px, py - TILE / 2);
      if (poiIndicator) poiIndicator.setPosition(px, py - TILE * 2);

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

    // Etichette gialle dei comuni sulle palestre
    _aggiuntaEtichetteComuni() {
      if (typeof PALESTRE === 'undefined') return;
      for (const p of PALESTRE) {
        const t = latLonToTile(p.lat, p.lon);
        const bg = this.add.rectangle(
          t.tx * TILE + TILE / 2, t.ty * TILE - TILE, 0, 14, 0x1a2940, 0.85
        );
        const txt = this.add.text(
          t.tx * TILE + TILE / 2, t.ty * TILE - TILE, p.comune,
          { fontSize: '8px', fontFamily: 'Arial', color: '#ffcb05', padding: { x: 4, y: 2 } }
        ).setOrigin(0.5, 0.5).setDepth(25);
        bg.width = txt.width + 8;
        bg.setDepth(24);
      }
      const cp = latLonToTile(41.8420, 12.6150);
      this.add.text(
        cp.tx * TILE + TILE / 2, cp.ty * TILE - TILE, 'Roma - Tuscolano',
        { fontSize: '8px', fontFamily: 'Arial', color: '#aef0ae', padding: { x: 4, y: 2 } }
      ).setOrigin(0.5, 0.5).setDepth(25);
    }

    // Marker edifici per ogni POI
    _aggiuntaMarcatoriPOI() {
      const PAL = {
        '🔬': { c: 0x3D6ACC, t: 0x1A3A80, p: 0x0A1A40 },
        '🏅': { c: 0xFF7800, t: 0xCC4400, p: 0x441100 },
        '🏥': { c: 0xFFEEEE, t: 0xCC0000, p: 0x660000 },
        '🛒': { c: 0x3AB030, t: 0x1A6018, p: 0x082808 },
        '🎁': { c: 0xE8C820, t: 0xA89010, p: null     },
        '💬': { c: 0x88CCEE, t: 0x4488AA, p: null     },
        '⛵': { c: 0x20B2AA, t: 0x107878, p: 0x043333 },
        '🚡': { c: 0xA0522D, t: 0x5C2D0B, p: 0x2A1006 },
        '🌦️':{ c: 0x6699CC, t: 0x224477, p: 0x0A1A33 },
        '🏛️':{ c: 0xB090E0, t: 0x6040A0, p: 0x200040 },
        '🌸': { c: 0xFF80CC, t: 0xCC1166, p: null     },
        '🍖': { c: 0xD2691E, t: 0x8A3510, p: null     },
        '🚀': { c: 0x90A0B0, t: 0x405060, p: 0x101820 },
        '🏆': { c: 0xFFD700, t: 0xAA8800, p: 0x443300 },
      };
      const DEF = { c: 0xAAAAAA, t: 0x666666, p: 0x222222 };
      const EDIFICI = new Set(['🔬','🏅','🏥','🛒','⛵','🚡','🌦️','🏛️','🚀','🏆']);

      // Dimensioni edifici (pixel mondo, scalati per TILE=32)
      const BW = 26, BH = 20, TH = 10;

      for (const poi of listaPOI) {
        const t = latLonToTile(poi.lat, poi.lon);
        const px = t.tx * TILE + TILE / 2;
        const py = t.ty * TILE + TILE / 2;
        const pal = PAL[poi.icona] || DEF;
        const edif = EDIFICI.has(poi.icona);
        const gfx = this.add.graphics().setDepth(17);

        if (edif) {
          gfx.fillStyle(pal.c, 1);
          gfx.fillRect(px - BW / 2, py - BH / 2, BW, BH);
          gfx.fillStyle(pal.t, 1);
          gfx.fillRect(px - BW / 2 - 2, py - BH / 2 - TH, BW + 4, TH);
          if (poi.icona === '🏥') {
            gfx.fillStyle(0xCC0000, 1);
            gfx.fillRect(px - 2, py - BH / 2 + 3, 4, BH - 6);
            gfx.fillRect(px - 6,  py - 3,          12, 4);
          }
          if (pal.p !== null) {
            gfx.fillStyle(pal.p, 1);
            gfx.fillRect(px - 4, py + BH / 2 - 8, 8, 8);
          }
          if (!['🏛️','🚀'].includes(poi.icona)) {
            gfx.fillStyle(0xCCEEFF, 0.85);
            gfx.fillRect(px - BW / 2 + 4, py - BH / 2 + 4, 6, 6);
            gfx.fillRect(px + BW / 2 - 10, py - BH / 2 + 4, 6, 6);
          }
          gfx.lineStyle(1.5, 0x000000, 0.55);
          gfx.strokeRect(px - BW / 2 - 2, py - BH / 2 - TH, BW + 4, BH + TH);
        } else {
          gfx.fillStyle(pal.c, 1);
          gfx.fillCircle(px, py, 10);
          gfx.fillStyle(pal.t, 1);
          gfx.fillCircle(px, py, 6);
          gfx.lineStyle(2, 0x000000, 0.55);
          gfx.strokeCircle(px, py, 10);
        }

        // Icona sopra
        const iconY = edif ? py - BH / 2 - TH - 2 : py - 12;
        this.add.text(px, iconY, poi.icona, { fontSize: '12px' })
          .setOrigin(0.5, 1).setDepth(22);

        // Etichetta nome
        const rawNome = poi.etichetta.includes('—')
          ? poi.etichetta.split('—')[0].trim() : poi.etichetta;
        const corto = rawNome.length > 16 ? rawNome.substring(0, 14) + '…' : rawNome;
        const labelY = edif ? py - BH / 2 - TH - 16 : py - 26;
        this.add.text(px, labelY, corto, {
          fontSize: '6px', fontFamily: 'Arial', color: '#ffffff',
          backgroundColor: '#1a2940', padding: { x: 3, y: 2 },
        }).setOrigin(0.5, 1).setDepth(23);
      }

      // Indicatore "INIZIO" lampeggiante sul laboratorio
      if (typeof LABORATORIO !== 'undefined' && LABORATORIO.lat) {
        const lt  = latLonToTile(LABORATORIO.lat, LABORATORIO.lon);
        const lpx = lt.tx * TILE + TILE / 2;
        const lpy = lt.ty * TILE + TILE / 2;
        const freccia = this.add.text(
          lpx, lpy - BH / 2 - TH - 28,
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
     API PUBBLICA (identica alla versione Leaflet)
     ---------------------------------------------------------- */

  function inizializza(opzioni) {
    posLatLon = { ...opzioni.posizione };
    onPassoCb = opzioni.onPasso || null;
    phaserGame = new Phaser.Game({
      type:            Phaser.AUTO,
      parent:          'mappa',
      backgroundColor: '#70a040',  // verde erba di sfondo durante il caricamento
      scene:           GameScene,
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
