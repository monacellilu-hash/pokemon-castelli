/* ============================================================
   map.js — F14: Phaser 3 (sostituisce Leaflet)

   API pubblica di GameMap IDENTICA alla versione Leaflet:
   inizializza · bloccaMovimento · sbloccaMovimento ·
   posizioneGiocatore · distanzaMetri · impostaVelocita ·
   teleporta · rimuoviMarkerOggetto

   FASE 3: collisione tile acqua (blocca senza MN Surf)
   FASE 4: lista POI + pulsante [A] Interagisci + marker scene

   app.js, data.js, world.js, battle.js → NON MODIFICATI.
   ============================================================ */

const GameMap = (function () {

  /* ----------------------------------------------------------
     SISTEMA DI COORDINATE
     ---------------------------------------------------------- */
  const BOUNDS = {
    latMin: 41.680, latMax: 41.895,
    lonMin: 12.565, lonMax: 12.790,
  };
  const MAP_W = 512;
  const MAP_H = 660;
  const TILE  = 16;

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
     TILESET
     ---------------------------------------------------------- */
  const TERRENI = [
    { fill: '#8fb870', border: '#6d9850' }, // 0 — sfondo/default
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
     ---------------------------------------------------------- */
  function generaTilemap() {
    const data = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(0));
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
     LISTA POI — costruita dai dati globali di data.js
     Ogni POI: { lat, lon, raggio, icona, etichetta, azione }
     ---------------------------------------------------------- */
  function _costruisciListaPOI() {
    const lista = [];
    const _fn = (nome) => typeof window[nome] === 'function' ? window[nome] : null;

    // Laboratorio
    if (typeof LABORATORIO !== 'undefined' && LABORATORIO.lat) {
      lista.push({
        lat: LABORATORIO.lat, lon: LABORATORIO.lon, raggio: 120,
        icona: '🔬', etichetta: 'Laboratorio — Prof. Castagno',
        azione: () => { if (typeof interagisciLaboratorio === 'function') interagisciLaboratorio(); },
      });
    }

    // Palestre
    if (typeof PALESTRE !== 'undefined') {
      for (const p of PALESTRE) {
        const pid = p.id;
        lista.push({
          lat: p.lat, lon: p.lon, raggio: 120,
          icona: '🏅', etichetta: `Palestra — ${p.comune}`,
          azione: () => { if (typeof interagisciPalestra === 'function') interagisciPalestra(pid); },
        });
      }
    }

    // Centri Pokémon
    if (typeof CENTRI_POKEMON !== 'undefined') {
      for (const c of CENTRI_POKEMON) {
        const cid = c.id;
        lista.push({
          lat: c.lat, lon: c.lon, raggio: 150,
          icona: '🏥', etichetta: `Centro Pokémon — ${c.comune}`,
          azione: () => { if (typeof interagisciCentro === 'function') interagisciCentro(cid); },
        });
      }
    }

    // Poké Market
    if (typeof POKE_MARKET !== 'undefined') {
      for (const m of POKE_MARKET) {
        const mid = m.id;
        lista.push({
          lat: m.lat, lon: m.lon, raggio: 150,
          icona: '🛒', etichetta: `Poké Market — ${m.comune}`,
          azione: () => { if (typeof apriMarket === 'function') apriMarket(mid); },
        });
      }
    }

    // Donatori MN
    if (typeof DONATORI_MN !== 'undefined') {
      for (const d of DONATORI_MN) {
        const did = d.id;
        lista.push({
          lat: d.lat, lon: d.lon, raggio: 120,
          icona: '🎁', etichetta: d.nome || 'NPC',
          azione: () => { if (typeof interagisciDonatore === 'function') interagisciDonatore(did); },
        });
      }
    }

    // Abitanti/NPC
    if (typeof ABITANTI !== 'undefined') {
      for (const a of ABITANTI) {
        const aid = a.id;
        lista.push({
          lat: a.lat, lon: a.lon, raggio: 100,
          icona: '💬', etichetta: `Gente del posto — ${a.comune}`,
          azione: () => { if (typeof interagisciAbitanti === 'function') interagisciAbitanti(aid); },
        });
      }
    }

    // Museo delle Navi di Nemi
    if (typeof MUSEO_NAVI !== 'undefined' && MUSEO_NAVI.lat) {
      lista.push({
        lat: MUSEO_NAVI.lat, lon: MUSEO_NAVI.lon,
        raggio: MUSEO_NAVI.raggioInterazione || 150,
        icona: '⛵', etichetta: 'Museo delle Navi Romane — Nemi',
        azione: () => { if (typeof interagisciMuseoNavi === 'function') interagisciMuseoNavi(); },
      });
    }

    // Funivia Rocca di Papa
    if (typeof FUNIVIA_ROCCA !== 'undefined' && FUNIVIA_ROCCA.lat) {
      lista.push({
        lat: FUNIVIA_ROCCA.lat, lon: FUNIVIA_ROCCA.lon,
        raggio: FUNIVIA_ROCCA.raggioInterazione || 120,
        icona: '🚡', etichetta: 'Funivia — Rocca di Papa',
        azione: () => { if (typeof interagisciFunivia === 'function') interagisciFunivia(); },
      });
    }

    // Meteorologo
    if (typeof METEOROLOGO !== 'undefined' && METEOROLOGO.lat) {
      lista.push({
        lat: METEOROLOGO.lat, lon: METEOROLOGO.lon,
        raggio: METEOROLOGO.raggioInterazione || 120,
        icona: '🌦️', etichetta: `${METEOROLOGO.nome || 'Meteorologo'} — Monte Porzio`,
        azione: () => { if (typeof interagisciMeteorologo === 'function') interagisciMeteorologo(); },
      });
    }

    // Anfratti dei Regi
    if (typeof ANFRATTI_REGI !== 'undefined') {
      for (const a of ANFRATTI_REGI) {
        const aid = a.id;
        lista.push({
          lat: a.lat, lon: a.lon,
          raggio: a.raggioInterazione || 80,
          icona: '🏛️', etichetta: a.nomeAnfratto || 'Anfratto del Tuscolo',
          azione: () => { if (typeof interagisciAnfratto === 'function') interagisciAnfratto(aid); },
        });
      }
    }

    // Villa Aldobrandini
    if (typeof VILLA_ALDOBRANDINI !== 'undefined' && VILLA_ALDOBRANDINI.lat) {
      lista.push({
        lat: VILLA_ALDOBRANDINI.lat, lon: VILLA_ALDOBRANDINI.lon,
        raggio: VILLA_ALDOBRANDINI.raggioInterazione || 100,
        icona: '🌸', etichetta: 'Villa Aldobrandini — Frascati',
        azione: () => { if (typeof interagisciVillaAldobrandini === 'function') interagisciVillaAldobrandini(); },
      });
    }

    // Porchettaro di Ariccia
    if (typeof PORCHETTARO !== 'undefined' && PORCHETTARO.lat) {
      lista.push({
        lat: PORCHETTARO.lat, lon: PORCHETTARO.lon,
        raggio: PORCHETTARO.raggioInterazione || 120,
        icona: '🍖', etichetta: 'Adriano il Porchettaro — Ariccia',
        azione: () => { if (typeof interagisciPorchettaro === 'function') interagisciPorchettaro(); },
      });
    }

    // Bunkerino (Colonna)
    if (typeof BUNKERINO !== 'undefined' && BUNKERINO.lat) {
      lista.push({
        lat: BUNKERINO.lat, lon: BUNKERINO.lon,
        raggio: BUNKERINO.raggioInterazione || 120,
        icona: '🔬', etichetta: 'Bunkerino — Colonna',
        azione: () => { if (typeof interagisciBunkerino === 'function') interagisciBunkerino(); },
      });
    }

    // Parcheggione (Grottaferrata)
    if (typeof PARCHEGGIONE !== 'undefined' && PARCHEGGIONE.lat) {
      lista.push({
        lat: PARCHEGGIONE.lat, lon: PARCHEGGIONE.lon,
        raggio: PARCHEGGIONE.raggioInterazione || 120,
        icona: '🚀', etichetta: 'Parcheggione — Grottaferrata',
        azione: () => { if (typeof interagisciParcheggione === 'function') interagisciParcheggione(); },
      });
    }

    // Porta della Lega (Via Vittoria)
    if (typeof VIA_VITTORIA_PORTA !== 'undefined' && VIA_VITTORIA_PORTA.lat) {
      lista.push({
        lat: VIA_VITTORIA_PORTA.lat, lon: VIA_VITTORIA_PORTA.lon,
        raggio: VIA_VITTORIA_PORTA.raggioInterazione || 150,
        icona: '🏆', etichetta: 'Lega Pokémon — Colonna',
        azione: () => { if (typeof interagisciLega === 'function') interagisciLega(); },
      });
    }

    return lista;
  }

  /* ----------------------------------------------------------
     STATO INTERNO
     ---------------------------------------------------------- */
  let phaserGame   = null;
  let scena        = null;
  let playerRect   = null;
  let poiIndicator = null;   // testo "!" sopra il giocatore
  let posTile      = { tx: 0, ty: 0 };
  let posLatLon    = { lat: 41.8420, lon: 12.6150 };
  let onPassoCb    = null;
  let bloccato     = false;
  let velocita     = 1;
  const oggettiMappa = {};

  let tilemapData  = null;   // [ty][tx] → indice terreno (per collisioni)
  let listaPOI     = [];     // costruita in create()
  let poiVicino    = null;   // POI più vicino entro raggio (o null)
  let spaceWasDown = false;  // anti-repeat tasto spazio

  // Riferimento al pulsante Interagisci HTML
  let btnInteragisci  = null;
  let lblInteragisci  = null;

  /* ----------------------------------------------------------
     SCENA PHASER
     ---------------------------------------------------------- */
  class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    preload() {}

    create() {
      scena = this;

      // ── 1. Tileset inline ──
      const numT = TERRENI.length;
      const cnv = document.createElement('canvas');
      cnv.width = TILE * numT; cnv.height = TILE;
      const ctx = cnv.getContext('2d');
      TERRENI.forEach((t, i) => {
        const x = i * TILE;
        ctx.fillStyle = t.fill;
        ctx.fillRect(x, 0, TILE, TILE);
        ctx.strokeStyle = t.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, 0.5, TILE - 1, TILE - 1);
      });
      this.textures.addCanvas('tileset', cnv);

      // ── 2. Tilemap procedurale ──
      tilemapData = generaTilemap();
      const map = this.make.tilemap({ data: tilemapData, tileWidth: TILE, tileHeight: TILE });
      const ts  = map.addTilesetImage('tileset', 'tileset', TILE, TILE, 0, 0);
      map.createLayer(0, ts, 0, 0);

      // ── 3. Etichette città + marker POI visivi ──
      this._aggiuntaEtichetteComuni();

      // ── 4. Lista POI dai dati globali ──
      listaPOI = _costruisciListaPOI();
      this._aggiuntaMarcatoriPOI();

      // ── 5. Sprite placeholder giocatore ──
      const st = latLonToTile(posLatLon.lat, posLatLon.lon);
      posTile = st;
      playerRect = this.add.rectangle(
        st.tx * TILE + TILE / 2,
        st.ty * TILE + TILE / 2,
        TILE - 2, TILE - 2,
        0xCC2200
      ).setDepth(30);

      // ── 6. Indicatore "!" sopra il giocatore (nascosto di default) ──
      poiIndicator = this.add.text(
        playerRect.x, playerRect.y - TILE,
        '!',
        { fontSize: '12px', fontFamily: 'Arial', color: '#ffcb05',
          stroke: '#1a2940', strokeThickness: 3 }
      ).setOrigin(0.5, 1).setDepth(40).setVisible(false);

      // ── 7. Camera ──
      this.cameras.main
        .startFollow(playerRect, true, 0.1, 0.1)
        .setZoom(3)
        .setBounds(0, 0, MAP_W * TILE, MAP_H * TILE);

      // ── 8. Input tastiera ──
      this.cursors  = this.input.keyboard.createCursorKeys();
      this.wasd     = this.input.keyboard.addKeys('W,A,S,D');
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      // Previene lo scroll della pagina con Spazio
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
      ]);
      this.moveCD = 0;

      // ── 9. Zoom con rotella ──
      this.input.on('wheel', (_p, _g, _dx, dy) => {
        const z = this.cameras.main.zoom;
        this.cameras.main.setZoom(Phaser.Math.Clamp(z - dy * 0.003, 1, 6));
      });

      // ── 10. D-Pad HTML ──
      this._collegaDpad();

      // ── 11. Pulsante Interagisci HTML ──
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
      if (this.moveCD > 0) return;

      // Tasto Spazio → interagisci con POI vicino
      if (this.spaceKey.isDown && !spaceWasDown && poiVicino) {
        spaceWasDown = true;
        poiVicino.azione();
        return;
      }
      if (!this.spaceKey.isDown) spaceWasDown = false;

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

    _sposta(dx, dy) {
      if (bloccato) return;
      const newTx = Phaser.Math.Clamp(posTile.tx + dx, 0, MAP_W - 1);
      const newTy = Phaser.Math.Clamp(posTile.ty + dy, 0, MAP_H - 1);
      if (newTx === posTile.tx && newTy === posTile.ty) return;

      // ── FASE 3: collisione acqua ──
      if (tilemapData && tilemapData[newTy]) {
        const idxNuovo = tilemapData[newTy][newTx];
        if (idxNuovo === 1) { // acqua
          const hasSurf = typeof stato !== 'undefined' && stato.mn && stato.mn.surf;
          if (!hasSurf) {
            if (typeof mostraToast === 'function')
              mostraToast('🌊 Qui c\'è l\'acqua! Serve MN Surf.', 2000);
            return;
          }
        }
      }

      posTile   = { tx: newTx, ty: newTy };
      posLatLon = tileToLatLon(newTx, newTy);
      playerRect.setPosition(newTx * TILE + TILE / 2, newTy * TILE + TILE / 2);

      // Aggiorna indicatore "!" con il giocatore
      if (poiIndicator) {
        poiIndicator.setPosition(playerRect.x, playerRect.y - TILE);
      }

      if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
      if (onPassoCb) onPassoCb({ ...posLatLon });

      // ── FASE 4: aggiorna POI più vicino ──
      this._aggiornaPOIVicino();
    }

    // Trova il POI più vicino entro il suo raggio
    _aggiornaPOIVicino() {
      let trovato = null;
      let distMin = Infinity;
      for (const poi of listaPOI) {
        const d = distanzaMetri(posLatLon, poi);
        if (d <= poi.raggio && d < distMin) {
          distMin = d;
          trovato = poi;
        }
      }
      poiVicino = trovato;

      // Aggiorna HUD HTML
      if (btnInteragisci && lblInteragisci) {
        const ovEl = document.getElementById('overlay-interagisci');
        if (ovEl) {
          if (trovato) {
            lblInteragisci.textContent = `${trovato.icona} ${trovato.etichetta}`;
            ovEl.classList.remove('nascosto');
          } else {
            ovEl.classList.add('nascosto');
          }
        }
      }

      // Aggiorna indicatore "!" in scena
      if (poiIndicator) {
        poiIndicator.setVisible(!!trovato);
      }
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

    // Etichette comuni palestre (gialle)
    _aggiuntaEtichetteComuni() {
      if (typeof PALESTRE === 'undefined') return;
      for (const p of PALESTRE) {
        const t = latLonToTile(p.lat, p.lon);
        const bg = this.add.rectangle(
          t.tx * TILE + TILE / 2, t.ty * TILE - TILE, 0, 12, 0x1a2940, 0.85
        );
        const txt = this.add.text(
          t.tx * TILE + TILE / 2, t.ty * TILE - TILE, p.comune,
          { fontSize: '7px', fontFamily: 'Arial', color: '#ffcb05', padding: { x: 3, y: 2 } }
        ).setOrigin(0.5, 0.5).setDepth(25);
        bg.width = txt.width + 6;
        bg.setDepth(24);
      }
      // Roma - Tuscolano
      const cp = latLonToTile(41.8420, 12.6150);
      this.add.text(
        cp.tx * TILE, cp.ty * TILE - TILE, 'Roma - Tuscolano',
        { fontSize: '7px', fontFamily: 'Arial', color: '#aef0ae', padding: { x: 3, y: 2 } }
      ).setOrigin(0.5, 0.5).setDepth(25);
    }

    // Marker visivi per tutti i POI — edifici pixel-art semplici
    _aggiuntaMarcatoriPOI() {
      /* Palette colori: corpo (muro), tetto, porta (null = no porta = non è un edificio) */
      const PAL = {
        '🔬': { c: 0x3D6ACC, t: 0x1A3A80, p: 0x0A1A40 },  // lab — blu
        '🏅': { c: 0xFF7800, t: 0xCC4400, p: 0x441100 },  // palestra — arancio
        '🏥': { c: 0xFFEEEE, t: 0xCC0000, p: 0x660000 },  // centro — bianco/rosso
        '🛒': { c: 0x3AB030, t: 0x1A6018, p: 0x082808 },  // market — verde
        '🎁': { c: 0xE8C820, t: 0xA89010, p: null      },  // donatore — oro (cerchio)
        '💬': { c: 0x88CCEE, t: 0x4488AA, p: null      },  // abitante — azzurro (cerchio)
        '⛵': { c: 0x20B2AA, t: 0x107878, p: 0x043333 },  // museo — teal
        '🚡': { c: 0xA0522D, t: 0x5C2D0B, p: 0x2A1006 },  // funivia — marrone
        '🌦️':{ c: 0x6699CC, t: 0x224477, p: 0x0A1A33 },  // meteorologo — blu chiaro
        '🏛️':{ c: 0xB090E0, t: 0x6040A0, p: 0x200040 },  // anfratto — viola
        '🌸': { c: 0xFF80CC, t: 0xCC1166, p: null      },  // villa — rosa (cerchio)
        '🍖': { c: 0xD2691E, t: 0x8A3510, p: null      },  // porchettaro (cerchio)
        '🚀': { c: 0x90A0B0, t: 0x405060, p: 0x101820 },  // parcheggione — grigio
        '🏆': { c: 0xFFD700, t: 0xAA8800, p: 0x443300 },  // lega — oro
      };
      const DEF = { c: 0xAAAAAA, t: 0x666666, p: 0x222222 };

      // Dimensioni edificio (pixel nel mondo, non su schermo)
      const BW = 22;  // larghezza corpo
      const BH = 16;  // altezza corpo
      const TH = 8;   // altezza tetto

      // Questi tipi vengono disegnati come edifici (non cerchi)
      const EDIFICI = new Set([
        '🔬','🏅','🏥','🛒','⛵','🚡','🌦️','🏛️','🚀','🏆',
      ]);

      for (const poi of listaPOI) {
        const t = latLonToTile(poi.lat, poi.lon);
        const px = t.tx * TILE + TILE / 2;
        const py = t.ty * TILE + TILE / 2;
        const pal = PAL[poi.icona] || DEF;
        const edif = EDIFICI.has(poi.icona);

        const gfx = this.add.graphics().setDepth(17);

        if (edif) {
          // ── Corpo (muro) ──
          gfx.fillStyle(pal.c, 1);
          gfx.fillRect(px - BW / 2, py - BH / 2, BW, BH);

          // ── Tetto (striscia più scura, leggermente più larga) ──
          gfx.fillStyle(pal.t, 1);
          gfx.fillRect(px - BW / 2 - 2, py - BH / 2 - TH, BW + 4, TH);

          // ── Croce rossa speciale per Centro Pokémon ──
          if (poi.icona === '🏥') {
            gfx.fillStyle(0xCC0000, 1);
            gfx.fillRect(px - 2, py - BH / 2 + 3, 4, BH - 6);
            gfx.fillRect(px - 6,  py - 3,          12, 4);
          }

          // ── Porta ──
          if (pal.p !== null) {
            gfx.fillStyle(pal.p, 1);
            gfx.fillRect(px - 3, py + BH / 2 - 7, 6, 7);
          }

          // ── Finestre (solo edifici "normali") ──
          if (!['🏛️','🚀'].includes(poi.icona)) {
            gfx.fillStyle(0xCCEEFF, 0.88);
            gfx.fillRect(px - BW / 2 + 3, py - BH / 2 + 3, 5, 5);
            gfx.fillRect(px + BW / 2 - 8, py - BH / 2 + 3, 5, 5);
          }

          // ── Bordo edificio ──
          gfx.lineStyle(1.5, 0x000000, 0.55);
          gfx.strokeRect(px - BW / 2 - 2, py - BH / 2 - TH, BW + 4, BH + TH);

        } else {
          // ── NPC / landmark all'aperto: cerchio doppio ──
          gfx.fillStyle(pal.c, 1);
          gfx.fillCircle(px, py, 9);
          gfx.fillStyle(pal.t, 1);
          gfx.fillCircle(px, py, 5);
          gfx.lineStyle(2, 0x000000, 0.55);
          gfx.strokeCircle(px, py, 9);
        }

        // ── Icona (emoji) sopra l'edificio/cerchio ──
        const iconY = edif ? py - BH / 2 - TH - 2 : py - 11;
        this.add.text(px, iconY, poi.icona, { fontSize: '10px' })
          .setOrigin(0.5, 1).setDepth(22);

        // ── Etichetta nome (testo breve) ──
        const rawNome = poi.etichetta.includes('—')
          ? poi.etichetta.split('—')[0].trim()
          : poi.etichetta;
        const corto = rawNome.length > 16 ? rawNome.substring(0, 14) + '…' : rawNome;
        const labelY = edif ? py - BH / 2 - TH - 14 : py - 23;
        this.add.text(px, labelY, corto, {
          fontSize: '5px', fontFamily: 'Arial', color: '#ffffff',
          backgroundColor: '#1a2940', padding: { x: 3, y: 2 },
        }).setOrigin(0.5, 1).setDepth(23);
      }

      // ── Indicatore "INIZIO" lampeggiante sul laboratorio ──
      if (typeof LABORATORIO !== 'undefined' && LABORATORIO.lat) {
        const lt  = latLonToTile(LABORATORIO.lat, LABORATORIO.lon);
        const lpx = lt.tx * TILE + TILE / 2;
        const lpy = lt.ty * TILE + TILE / 2;
        const freccia = this.add.text(
          lpx, lpy - BH / 2 - TH - 26,
          '▼ INIZIO',
          {
            fontSize: '7px', fontFamily: 'Arial', color: '#00ff44',
            backgroundColor: '#003300', padding: { x: 4, y: 2 },
            stroke: '#000000', strokeThickness: 2,
          }
        ).setOrigin(0.5, 1).setDepth(31);
        this.tweens.add({
          targets: freccia,
          alpha: { from: 1, to: 0.1 },
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  }

  /* ----------------------------------------------------------
     API PUBBLICA
     ---------------------------------------------------------- */

  function inizializza(opzioni) {
    posLatLon = { ...opzioni.posizione };
    onPassoCb = opzioni.onPasso || null;

    phaserGame = new Phaser.Game({
      type:            Phaser.AUTO,
      parent:          'mappa',
      backgroundColor: '#8fb870',
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
    // Nasconde il pulsante interagisci durante battaglie/dialoghi
    const ovEl = document.getElementById('overlay-interagisci');
    if (ovEl) ovEl.classList.add('nascosto');
    if (poiIndicator) poiIndicator.setVisible(false);
    if (scena && scena.cursors) {
      try { scena.input.keyboard.resetKeys(); } catch (_) {}
    }
  }

  function sbloccaMovimento() {
    bloccato = false;
    // Ricalcola subito il POI vicino quando si riprende il controllo
    if (scena) scena._aggiornaPOIVicino();
  }

  function posizioneGiocatore() { return { ...posLatLon }; }

  function impostaVelocita(v) { velocita = v; }

  function teleporta(pos) {
    posLatLon = { lat: pos.lat, lon: pos.lon };
    const t   = latLonToTile(pos.lat, pos.lon);
    posTile   = t;
    if (playerRect) {
      playerRect.setPosition(t.tx * TILE + TILE / 2, t.ty * TILE + TILE / 2);
      if (poiIndicator) poiIndicator.setPosition(playerRect.x, playerRect.y - TILE);
    }
    if (scena) scena.cameras.main.centerOn(
      t.tx * TILE + TILE / 2, t.ty * TILE + TILE / 2
    );
    if (typeof stato !== 'undefined') stato.posizione = { ...posLatLon };
    // Ricalcola POI dopo teleport
    if (scena) scena._aggiornaPOIVicino();
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
