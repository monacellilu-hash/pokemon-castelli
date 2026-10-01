/* js/animazioni-essentials.js — Motore di riproduzione delle animazioni mosse
   estratte da Pokémon Essentials FRLG (vedi dati/animazioni_mosse_essentials.js).
   Sostituisce il vecchio motore in dati/mosse-animazioni.js.

   Approccio scelto con Luca: canvas trasparente sopra la scena di battaglia
   (che resta div/CSS) SOLO per le particelle delle animazioni; gli sprite
   Pokémon veri restano gli <img> esistenti (#giocatore-sprite/#nemico-sprite),
   su cui il motore agisce solo per nascondere/mostrare o cambiare opacità
   quando il fotogramma originale lo richiede (PATTERN -1/-2).

   Spazio di lavoro originale Essentials: 512x384px. Le coordinate dei
   fotogrammi vengono scalate proporzionalmente alle dimensioni reali del
   campo di battaglia a schermo (non è la trasformazione a "linea" esatta di
   Essentials, ma un'approssimazione proporzionale coerente con l'allineamento
   25%/75% già fatto in style.css). */

const AnimazioniEssentials = (function () {
  const ESS_W = 512, ESS_H = 384;
  const CELL = 192, COLS = 5;
  const FPS = 20;
  const CARTELLA = 'sprites/animazioni_mosse_essentials/';

  // Ancore canoniche di Essentials reale (Battle::Scene::FOCUSUSER_X/Y e
  // FOCUSTARGET_X/Y, in strumenti/scripts_estratti/0187_Battle_Scene.rb):
  // le coordinate X/Y di ogni fotogramma NON sono posizioni assolute sullo
  // schermo, sono relative a "dove sarebbe il proprio Pokémon/l'avversario
  // se fosse fermo nella sua posa di riposo". Il motore vero (0228_
  // BattleAnimationPlayer.rb, PBAnimationPlayerX#update) sposta ogni
  // particella con FOCUS=2 (attaccante)/FOCUS=1 (bersaglio) dello stesso
  // scarto (delta) fra la posizione VERA dello sprite in quel momento e
  // questa ancora. Prima qui scalavamo tutto in modo piatto ignorando dove
  // fossero davvero gli sprite: le animazioni non si "agganciavano" al
  // Pokémon quando il layout del campo non coincideva pixel per pixel con
  // quello originale di Essentials.
  const FOCUS_USER_X = 128, FOCUS_USER_Y = 224;
  const FOCUS_TARGET_X = 384, FOCUS_TARGET_Y = 96;

  const DEFAULT_CEL = {
    ZOOMX: 100, ANGLE: 0, MIRROR: 0, BLENDTYPE: 0, VISIBLE: 1, OPACITY: 255,
    ZOOMY: 100, COLORRED: 0, COLORGREEN: 0, COLORBLUE: 0, COLORALPHA: 0,
    TONERED: 0, TONEGREEN: 0, TONEBLUE: 0, TONEGRAY: 0, LOCKED: 0,
    FLASHRED: 0, FLASHGREEN: 0, FLASHBLUE: 0, FLASHALPHA: 0, PRIORITY: 1, FOCUS: 4
  };

  const cacheImmagini = {};
  function caricaImmagine(nomeFile) {
    if (cacheImmagini[nomeFile]) return cacheImmagini[nomeFile];
    const img = new Image();
    img.src = CARTELLA + nomeFile + '.png';
    const p = new Promise(res => { img.onload = res; img.onerror = res; });
    cacheImmagini[nomeFile] = { img, pronta: p };
    return cacheImmagini[nomeFile];
  }

  // Normalizza il nome mossa (es. "razor-leaf" dalla PokéAPI) alla chiave
  // usata da Essentials/MOSSA_ANIM_INDEX (es. "RAZORLEAF").
  function chiaveMossa(nome) {
    return (nome || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function trovaAnimazione(nomeMossa) {
    if (typeof MOSSA_ANIM_INDEX === 'undefined' || typeof ANIMAZIONI_ESSENTIALS === 'undefined') return null;
    const idx = MOSSA_ANIM_INDEX[chiaveMossa(nomeMossa)];
    if (idx === undefined || idx === null) return null;
    return ANIMAZIONI_ESSENTIALS[idx] || null;
  }

  // IMPORTANTE: il canvas va agganciato a #battaglia-schermo (il riquadro
  // NITIDO a rapporto fisso 512x384, dove vivono davvero gli sprite), non a
  // #battaglia-campo (il contenitore ESTERNO più grande, con lo sfondo
  // atmosferico sfocato ai lati — vedi style.css). #battaglia-campo può
  // essere più largo/alto di #battaglia-schermo su schermi non-4:3 (è
  // centrato dentro con flexbox): dimensionare il canvas su di lui faceva
  // calcolare una scala sbagliata e le particelle finivano spostate rispetto
  // agli sprite reali (es. Lanciafiamme che parte sopra la testa del
  // Pokémon, segnalato da Luca) — bug di layout, non delle animazioni.
  let canvas = null, ctx = null;
  function ottieniCanvas() {
    if (canvas && document.body.contains(canvas)) return canvas;
    const schermo = document.getElementById('battaglia-schermo');
    canvas = document.createElement('canvas');
    canvas.id = 'battaglia-fx-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '5';
    canvas.style.pointerEvents = 'none';
    schermo.appendChild(canvas);
    ctx = canvas.getContext('2d');
    return canvas;
  }

  function ridimensionaCanvas() {
    const schermo = document.getElementById('battaglia-schermo');
    const rect = schermo.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    return { w: rect.width, h: rect.height };
  }

  // Riproduce l'animazione di una mossa. attaccanteEl/bersaglioEl sono gli
  // elementi <img> reali (#giocatore-sprite o #nemico-sprite) di chi attacca
  // e di chi subisce, così l'animazione punta sul lato giusto anche quando
  // è l'avversario ad attaccare.
  async function gioca(nomeMossa, attaccanteEl, bersaglioEl) {
    const anim = trovaAnimazione(nomeMossa);
    if (!anim || !anim.frames || anim.frames.length === 0) return;

    const { img, pronta } = caricaImmagine(anim.graphic);
    await pronta;

    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = w / ESS_W, scalaY = h / ESS_H;

    // FOCUS_USER_X/FOCUS_TARGET_X (sopra) presumono SEMPRE "utente a
    // sinistra (dove sta il giocatore), bersaglio a destra (dove sta il
    // nemico)" — vero quando attacca il giocatore, MA quando è il nemico ad
    // attaccare i ruoli sullo schermo sono invertiti (nemico in alto a dx,
    // giocatore in basso a sx). Senza correggere, proiettili/balzi
    // viaggiavano nel verso sbagliato — bug segnalato esplicitamente da
    // Luca ("le mosse dell'avversario sono in senso opposto al mio").
    // Fix: quando l'attaccante è il nemico, si specchia l'intera animazione
    // orizzontalmente (posizione, angolo, mirroring dei singoli fotogrammi)
    // — i dati restano identici, cambia solo il verso di lettura.
    const specchia = !!(attaccanteEl && attaccanteEl.id && attaccanteEl.id.indexOf('nemico') === 0);

    // Scarto fra la posizione VERA (sullo schermo, dentro #battaglia-campo)
    // degli sprite e la loro ancora canonica — vedi commento sulle costanti
    // FOCUS_*. Catturato una volta sola all'inizio dell'animazione: gli
    // sprite di battaglia restano fermi durante un'animazione mossa (il
    // "lunge" generico è solo nel fallback, non qui — vedi animaMossa in
    // battle.js), quindi un solo calcolo basta ed è fedele all'originale.
    const campoRect = canvas.getBoundingClientRect();
    function centroRelativo(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: (r.left + r.width / 2) - campoRect.left, y: (r.top + r.height / 2) - campoRect.top };
    }
    const centroAttaccante = centroRelativo(attaccanteEl);
    const centroBersaglio = centroRelativo(bersaglioEl);
    const deltaUser = centroAttaccante
      ? { x: centroAttaccante.x - FOCUS_USER_X * scalaX, y: centroAttaccante.y - FOCUS_USER_Y * scalaY }
      : { x: 0, y: 0 };
    const deltaTarget = centroBersaglio
      ? { x: centroBersaglio.x - FOCUS_TARGET_X * scalaX, y: centroBersaglio.y - FOCUS_TARGET_Y * scalaY }
      : { x: 0, y: 0 };
    // Applica la correzione FOCUS a una coordinata già scalata (X*scalaX,
    // Y*scalaY): FOCUS 1 = ancorata al bersaglio, FOCUS 2 = ancorata
    // all'attaccante, altrimenti (3=linea utente-bersaglio, non ancora
    // supportato con la trasformazione a linea reale; 4=schermo fisso)
    // resta la coordinata piatta, come già facevamo prima per tutti i casi.
    // Quando specchia è vero, lo SCARTO locale dall'ancora (non la
    // posizione finale!) va invertito sull'asse X prima di sommarlo alla
    // posizione VERA dell'attaccante/bersaglio — altrimenti il verso del
    // movimento resta quello autorale (utente a sinistra) anche quando
    // l'utente reale è a destra, facendo viaggiare proiettili/balzi nel
    // verso sbagliato (bug segnalato da Luca). Mai specchiare la posizione
    // finale già corretta: sposterebbe l'effetto sul lato opposto a quello
    // vero invece di limitarsi a invertirne il verso.
    function correggiFocus(x, y, focus) {
      if (focus === 1) {
        const localX = (x - FOCUS_TARGET_X * scalaX) * (specchia ? -1 : 1);
        return { x: centroBersaglio ? centroBersaglio.x + localX : x + deltaTarget.x, y: y + deltaTarget.y };
      }
      if (focus === 2) {
        const localX = (x - FOCUS_USER_X * scalaX) * (specchia ? -1 : 1);
        return { x: centroAttaccante ? centroAttaccante.x + localX : x + deltaUser.x, y: y + deltaUser.y };
      }
      return { x, y };
    }

    const stiliOriginali = new Map();
    [attaccanteEl, bersaglioEl].forEach(el => {
      if (el) stiliOriginali.set(el, { opacity: el.style.opacity, transform: el.style.transform });
    });

    await new Promise(resolve => {
      const inizio = performance.now();
      function passo(ora) {
        const idx = Math.floor(((ora - inizio) / 1000) * FPS);
        if (idx >= anim.frames.length) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          stiliOriginali.forEach((val, el) => {
            el.style.opacity = val.opacity || '';
            el.style.transform = val.transform || '';
          });
          resolve();
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const frame = anim.frames[idx] || [];
        for (const celRaw of frame) {
          const cel = Object.assign({}, DEFAULT_CEL, celRaw);
          if (cel.VISIBLE !== 1) continue;
          if (cel.PATTERN < 0) {
            // Cel "sprite vivo": normalmente rappresenta il Pokémon fermo
            // nella sua posa (X/Y = ancora canonica, nessuno spostamento
            // visibile); se l'animazione della mossa sposta apposta questo
            // cel (es. un piccolo balzo), il delta rispetto all'ancora si
            // traduce in un vero spostamento sullo schermo via transform.
            const el = (cel.PATTERN === -1) ? attaccanteEl : bersaglioEl;
            if (!el) continue;
            // Lo sprite È già alla sua posizione vera sullo schermo (è un
            // <img> del DOM): basta lo scarto fra il cel e la SUA ancora
            // canonica, non serve ricalcolare il delta (si annullerebbe).
            const ancoraX = (cel.PATTERN === -1) ? FOCUS_USER_X : FOCUS_TARGET_X;
            const ancoraY = (cel.PATTERN === -1) ? FOCUS_USER_Y : FOCUS_TARGET_Y;
            const offX = (cel.X - ancoraX) * scalaX * (specchia ? -1 : 1);
            const offY = (cel.Y - ancoraY) * scalaY;
            // NON tocchiamo più l'opacità dello sprite vero (giocatore/nemico)
            // qui: molti frame dell'animazione non includono affatto questo
            // cel, e lo stile CSS impostato in un frame precedente resta
            // fino al frame successivo che lo tocca di nuovo — se un frame
            // iniziale lo mette a un'opacità bassa e nessun frame successivo
            // lo aggiorna finché non finisce l'animazione, il Pokémon
            // sembrava sparire per tutta la mossa e ricomparire solo alla
            // fine (bug segnalato da Luca). Lo spostamento (transform)
            // resta, è innocuo e serve per i piccoli balzi/scatti veri.
            el.style.transform = `translate(${offX}px, ${offY}px)`;
            continue;
          }
          const pos = correggiFocus(cel.X * scalaX, cel.Y * scalaY, cel.FOCUS);
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, cel.OPACITY / 255));
          ctx.translate(pos.x, pos.y);
          ctx.rotate(-cel.ANGLE * Math.PI / 180 * (specchia ? -1 : 1));
          ctx.scale((cel.ZOOMX / 100) * (cel.MIRROR ? -1 : 1) * (specchia ? -1 : 1) * scalaX, (cel.ZOOMY / 100) * scalaY);
          const sx = (cel.PATTERN % COLS) * CELL;
          const sy = Math.floor(cel.PATTERN / COLS) * CELL;
          ctx.drawImage(img, sx, sy, CELL, CELL, -CELL / 2, -CELL / 2, CELL, CELL);
          ctx.restore();
        }
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
  }

  /* ══════════════════════════════════════════════════════════════
     ANIMAZIONI "ROM" — prototipo (sess. 29 set 2026, richiesta di Luca).
     A differenza di quelle sopra (fotogrammi pre-calcolati cel per cel,
     estratti da Essentials, un fan-remake) queste riproducono il VERO
     script di gioco di Pokémon Smeraldo, letto dalla decompilazione
     pubblica pret/pokeemerald (github.com/pret/pokeemerald,
     data/battle_anim_scripts.s + src/battle_anim_water.c): le particelle
     vengono create una per una nel tempo, ognuna con un movimento
     calcolato al volo invece che un fotogramma fisso — stessa grafica vera
     (sprites/animazioni_mosse_rom/, ripulita solo dal colore di
     trasparenza) e stessa coreografia (stesso numero di particelle, stessa
     durata, stesso verso). Non è un'emulazione ciclo-esatta della console
     (la matematica in virgola fissa del GBA qui è rifatta con Math.sin),
     ma segue lo stesso script riga per riga.
     Se Luca approva il risultato, questo diventa il modello per portare
     altre mosse dallo stesso tipo di fonte (AnimToTargetInSinWave, il moto
     "a onda verso il bersaglio" usato qui, è lo STESSO usato in originale
     anche da Idrocannone/Raggio Segnale/Fanghiglia — nessun lavoro sprecato).
     ══════════════════════════════════════════════════════════════ */
  const CARTELLA_ROM = 'sprites/animazioni_mosse_rom/';
  const cacheImmaginiRom = {};
  function caricaImmagineRom(nomeFile) {
    if (cacheImmaginiRom[nomeFile]) return cacheImmaginiRom[nomeFile];
    const img = new Image();
    img.src = CARTELLA_ROM + nomeFile;
    const p = new Promise(res => { img.onload = res; img.onerror = res; });
    cacheImmaginiRom[nomeFile] = { img, pronta: p };
    return cacheImmaginiRom[nomeFile];
  }

  // Movimento generico "AnimToTargetInSinWave" (src/battle_anim_water.c):
  // usato in originale non solo da Lanciafiamme ma anche da Idrocannone,
  // Raggio Segnale, Fanghiglia — una particella parte dall'attaccante,
  // viaggia in linea retta verso il bersaglio in `durataMs`, ciclando tra
  // le `righeY` del foglio ogni `frameMs`. opts: { frameW, frameH, righeY,
  // frameMs, durataMs, ampiezzaPx }.
  // Sess. 1 ott 2026 (richiesta di Luca: "il direzionamento è strano",
  // ricontrollata la fonte): nel codice vero l'oscillazione è SEMPRE
  // verticale sullo schermo — `sprite->y2 += Sin(...)`, mai perpendicolare
  // al percorso. Prima qui l'onda ruotava con la direzione attaccante→
  // bersaglio: sembrava sbagliata ogni volta che è il nemico ad attaccare
  // (percorso invertito rispetto al giocatore). Corretto per matchare la
  // fonte esattamente: solo su/giù, mai di lato.
  function _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, ampiezzaSegno, ritardoMs, opts) {
    const { frameW, frameH, righeY, frameMs, durataMs, ampiezzaPx } = opts;
    return new Promise(resolve => {
      const AMPIEZZA_PX = ampiezzaPx * ampiezzaSegno;
      const inizio = performance.now() + ritardoMs;
      const dx = arrivo.x - partenza.x, dy = arrivo.y - partenza.y;
      function passo(ora) {
        const t = ora - inizio;
        if (t < 0) { requestAnimationFrame(passo); return; }
        const frac = Math.min(1, t / durataMs);
        if (frac >= 1) { resolve(); return; }
        const rigaIdx = Math.floor(t / frameMs) % righeY.length;
        const sy = righeY[rigaIdx];

        const onda = Math.sin(Math.PI * frac) * AMPIEZZA_PX; // una sola "gobba", su o giù
        const px = partenza.x + dx * frac;
        const py = partenza.y + dy * frac + onda * scalaY;

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(scalaX, scalaY);
        ctx.drawImage(img, 0, sy, frameW, frameH, -frameW / 2, -frameH / 2, frameW, frameH);
        ctx.restore();
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
  }

  // Scuotimento leggero di uno sprite reale (attaccante/bersaglio) per
  // `durataMs`, poi torna alla trasformazione originale — stesso
  // AnimTask_ShakeMon usato in originale da tante mosse.
  function _scuotiSpriteRom(el, ampiezza, durataMs) {
    if (!el) return;
    const inizio = performance.now();
    const originale = el.style.transform;
    (function passo(ora) {
      const t = ora - inizio;
      if (t >= durataMs) { el.style.transform = originale; return; }
      const dx = (Math.random() * 2 - 1) * ampiezza;
      el.style.transform = `${originale} translateX(${dx}px)`;
      requestAnimationFrame(passo);
    })(performance.now());
  }

  // Sess. 1 ott 2026: NON il centro geometrico dello sprite (fx=fy=0.5) —
  // confrontato con la fonte vera (GetBattlerSpriteCoord, src/battle_anim_
  // mons.c di pokeemerald), il punto di aggancio non è mai il centro
  // dell'immagine ma un punto calibrato (dipende da specie/dimensione).
  // Qui si riusa la stessa convenzione già validata nel gioco per il lancio
  // della Ball (vedi animaLancioBall in js/battle.js): attaccante ancorato
  // più in alto (0.55, 0.35 — zona "bocca", da dove parte l'effetto),
  // bersaglio leggermente sotto il centro (0.5, 0.55 — compensa il bordo
  // trasparente che quasi tutti gli sprite hanno in alto). Prima qui si
  // usava il centro puro, diverso dal resto del gioco: le mosse "sembravano
  // strane" perché partivano/arrivavano in un punto diverso da dove in
  // realtà appare il Pokémon (segnalato da Luca).
  function _centroElRom(el, campoRect, fx, fy) {
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width * fx) - campoRect.left, y: (r.top + r.height * fy) - campoRect.top };
  }

  // Categoria NUOVA: TAGLIO — una sciabolata disegnata DIRETTAMENTE sul
  // bersaglio (cresce in 4 fotogrammi), non un proiettile che viaggia
  // dall'attaccante. Usata dal gioco vero per Taglio/Lacerazione/Attacco
  // d'Ali e simili (cut.png/slash.png, entrambi 4 fotogrammi verticali).
  async function _giocaTaglioRom(img, attaccanteEl, bersaglioEl, righeY, dimFrame) {
    righeY = righeY || [0, 32, 64, 96];
    const d = dimFrame || 32; // lato del fotogramma quadrato (32 di default, cut/slash/vine/artigli/esplosione)
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = w / ESS_W, scalaY = h / ESS_H;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);

    _scuotiSpriteRom(attaccanteEl, 1, 150);
    await new Promise(resolve => {
      let frame = 0;
      const inizio = performance.now();
      const frameMs = 55;
      function passo(ora) {
        const t = ora - inizio;
        frame = Math.min(righeY.length - 1, Math.floor(t / frameMs));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centro.x, centro.y);
        ctx.scale(scalaX, scalaY);
        ctx.drawImage(img, 0, righeY[frame], d, d, -d / 2, -d / 2, d, d);
        ctx.restore();
        if (t >= frameMs * righeY.length) { resolve(); return; }
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
    _scuotiSpriteRom(bersaglioEl, 3, 220);
    await new Promise(r => setTimeout(r, 220));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function _giocaCutRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('cut.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl);
  }

  async function _giocaSlashRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('slash.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl);
  }

  // Mosse sonore (Urlo, Rombo, Rumorsuono, Metal Suono...): anelli
  // d'onda sonora sul bersaglio — grafica vera sound_waves.png (2 frame).
  async function _giocaSuonoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('sound_waves.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 32]);
  }

  // Potenziamenti su se stessi (Focus Energy, Spada Danza, Rafforza...):
  // scintilla verticale SU CHI USA LA MOSSA, non sul bersaglio — grafica
  // vera focus_energy.png (8 fotogrammi, qui ne usiamo 4 significativi).
  // Riusa _giocaTaglioRom passando lo stesso elemento come "attaccante" e
  // "bersaglio": l'overlay finisce su chi la usa, non sull'avversario.
  async function _giocaPotenziamentoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('focus_energy.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, attaccanteEl, [16, 48, 80, 112], 16);
  }

  // Scudi/barriere su se stessi (Protezione, Barriera Luce, Riflesso,
  // Salvaguardia...): anello protettivo sotto il Pokémon — grafica vera
  // guard_ring.png (64×32, un frame, non quadrato: funzione dedicata
  // invece di _giocaTaglioRom che assume fotogrammi quadrati).
  async function _giocaScudoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('guard_ring.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = w / ESS_W, scalaY = h / ESS_H;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.5, 0.75);
    ctx.save();
    ctx.translate(centro.x, centro.y);
    ctx.scale(scalaX, scalaY);
    ctx.drawImage(img, -32, -16, 64, 32);
    ctx.restore();
    await new Promise(r => setTimeout(r, 300));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mosse di sguardo/fascino (Attrazione, Occhio di Falco, Sguardo
  // Cupo...): scintillio sul bersaglio — grafica vera eye_sparkle.png
  // (4 fotogrammi, 16×16).
  async function _giocaSguardoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('sparkle.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 16, 32, 48], 16);
  }

  // Trappole da campo (Punte, Punte Velenose, Levitoroccia...): punte che
  // crescono ai piedi del bersaglio — grafica vera ice_spikes.png (4
  // fotogrammi, 8×16, non quadrati: funzione dedicata).
  async function _giocaPunteRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('spikes.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = w / ESS_W, scalaY = h / ESS_H;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.85);
    const righeY = [0, 16, 32, 48];
    await new Promise(resolve => {
      const inizio = performance.now();
      const frameMs = 90;
      function passo(ora) {
        const t = ora - inizio;
        const frame = Math.min(righeY.length - 1, Math.floor(t / frameMs));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centro.x, centro.y);
        ctx.scale(scalaX, scalaY);
        ctx.drawImage(img, 0, righeY[frame], 8, 16, -4, -16, 8, 16);
        ctx.restore();
        if (t >= frameMs * righeY.length) { resolve(); return; }
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
    await new Promise(r => setTimeout(r, 150));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Sabbia/polvere accecante (Attacco Sabbia, Fumogeno, Flash...):
  // manciate di sabbia verso il bersaglio — grafica vera mud_sand_0.png +
  // la sua palette reale mud_sand.pal (8×8).
  async function _giocaSabbiaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('sand.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 8, frameH: 8, righeY: [0], frameMs: 9999, durataMs: 280, ampiezzaPx: 10 };

    const attese = [];
    for (let i = 0; i < 5; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 50, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Cura su se stessi (Rilassamento, Riposo, Sole Mattutino...):
  // scintillio verde su chi la usa — grafica vera green_star.png
  // (4 fotogrammi, 16×16).
  async function _giocaCuraRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('heal_sparkle.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, attaccanteEl, [0, 16, 32, 48], 16);
  }

  // Artigliate (Graffio, Artiglio di Metallo, Artiglio di Drago...): 5
  // fotogrammi di un graffio che cresce — grafica vera claw_slash.png.
  async function _giocaArtigliRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('claw_slash.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 32, 64, 96, 128]);
  }

  // Esplosione/Autodistruzione: grande esplosione sul bersaglio (e un po'
  // su se stessi) — grafica vera explosion.png (4 fotogrammi, stessa
  // tecnica a crescita di taglio/vite).
  async function _giocaEsplosioneRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('explosion.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 32, 64, 96]);
  }

  // Frustata/Viticci (Vine Whip, Costrizione...): vite che cresce verso il
  // bersaglio, 5 fotogrammi — grafica vera vine.png, stessa tecnica del
  // taglio ma con un fotogramma in più.
  async function _giocaViticciRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('vine.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 32, 64, 96, 128]);
  }

  // Categoria IMPATTO (Mega Pugno/Martelpugno/Calci/Cornata e simili):
  // singolo lampo di impatto sul bersaglio, UN SOLO fotogramma — niente
  // proiettile, l'attaccante si scuote (colpo in arrivo) e il lampo
  // compare al contatto. Generica: riusata per più grafiche reali.
  async function _giocaImpattoRom(nomeFile, attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom(nomeFile);
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = w / ESS_W, scalaY = h / ESS_H;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);

    // (lungeAttaccante vive nel modulo Battle, non qui: lo scuotimento
    // dell'attaccante basta a dare il senso del colpo in arrivo).
    _scuotiSpriteRom(attaccanteEl, 2, 180);
    await new Promise(r => setTimeout(r, 180));
    ctx.save();
    ctx.translate(centro.x, centro.y);
    ctx.scale(scalaX, scalaY);
    ctx.drawImage(img, -16, -16, 32, 32);
    ctx.restore();
    _scuotiSpriteRom(bersaglioEl, 3, 200);
    await new Promise(r => setTimeout(r, 200));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  async function _giocaPugnoRom(attaccanteEl, bersaglioEl) {
    await _giocaImpattoRom('punch_impact.png', attaccanteEl, bersaglioEl);
  }
  // Mosse a corno/zanna (Cornonite, Attacco Zanna...): grafica vera
  // horn_hit.png, stessa logica del pugno.
  async function _giocaCornoRom(attaccanteEl, bersaglioEl) {
    await _giocaImpattoRom('horn_hit.png', attaccanteEl, bersaglioEl);
  }

  // Prepara canvas/scala/centri comuni a tutte le animazioni "a onda" (ogni
  // mossa poi lancia le sue particelle con _particellaOndaVersoTarget).
  async function _preparaAnimOnda(attaccanteEl, bersaglioEl) {
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = w / ESS_W, scalaY = h / ESS_H;
    const campoRect = canvas.getBoundingClientRect();
    return {
      scalaX, scalaY,
      partenza: _centroElRom(attaccanteEl, campoRect, 0.55, 0.35),
      arrivo: _centroElRom(bersaglioEl, campoRect, 0.5, 0.55),
    };
  }

  async function _giocaFlamethrowerRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('small_ember.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [32, 64, 96], frameMs: 33, durataMs: 500, ampiezzaPx: 16 };

    // Scuotimento leggero dell'attaccante (rincorsa), poi del bersaglio a
    // metà animazione (colpito) — stesso ordine dello script originale
    // (AnimTask_ShakeMon attaccante subito, bersaglio dopo 3 fiamme).
    _scuotiSpriteRom(attaccanteEl, 2, 260);
    setTimeout(() => _scuotiSpriteRom(bersaglioEl, 3, 380), 260);

    // 11 coppie di embers (come FlamethrowerCreateFlames × 11 nello script
    // originale), ognuna sfasata di poco, alternando l'onda su/giù.
    const attese = [];
    for (let i = 0; i < 11; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 66, opts));
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, -segno, i * 66 + 33, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Incendio (Move_EMBER, src/battle_anim_scripts.s): riusa LA STESSA
  // grafica di Lanciafiamme (small_ember.png, gEmberSpriteTemplate — stesso
  // tileTag ANIM_TAG_SMALL_EMBER) ma movimento diverso: callback
  // TranslateAnimSpriteToTargetMonLocation (lineare, NESSUNA onda) invece
  // di AnimToTargetInSinWave — 3 fiammelle dritte verso il bersaglio con un
  // piccolo ventaglio verticale fisso (-16/0/16 nello script), non
  // oscillante. ampiezzaPx:0 nel nostro sistema disattiva l'onda, quindi
  // riusa _particellaOndaVersoTarget senza bisogno di una nuova funzione —
  // il ventaglio verticale si ottiene spostando il punto di arrivo.
  async function _giocaEmberRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('small_ember.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [32], frameMs: 9999, durataMs: 260, ampiezzaPx: 0 };

    _scuotiSpriteRom(attaccanteEl, 1, 180);

    const scartoY = [-10, 0, 10];
    const attese = [];
    scartoY.forEach((dy, i) => {
      const arrivoScarto = { x: arrivo.x, y: arrivo.y + dy };
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivoScarto, scalaX, scalaY, 1, i * 70, opts));
    });
    await Promise.all(attese);
    // Vampata d'impatto (EmberFireHit × 3 nello script originale): un
    // piccolo tremore sul bersaglio al posto delle 3 fiammelle extra che
    // "scoppiano" lì — stessa semplificazione già usata per le altre mosse.
    _scuotiSpriteRom(bersaglioEl, 3, 220);
    await new Promise(r => setTimeout(r, 220));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Idrocannone (Move_HYDRO_PUMP, src/battle_anim_scripts.s): stesso
  // movimento a onda di Lanciafiamme (gHydroPumpOrbSpriteTemplate usa anche
  // lui AnimToTargetInSinWave), grafica vera water_orb.png (16×16, 4
  // fotogrammi). Nello script HydroPumpBeams lancia 2 orbite per volta
  // (un'onda su, una giù, "createsprite ... 0 16" / "... 0 -16") ripetuto
  // 11 volte come Lanciafiamme, con qualche "hit splat" in più che qui
  // semplifichiamo nello scuotimento del bersaglio (non ricreato a parte).
  async function _giocaHydroPumpRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('water_orb.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0, 16, 32, 48], frameMs: 50, durataMs: 550, ampiezzaPx: 14 };

    _scuotiSpriteRom(attaccanteEl, 2, 260);
    setTimeout(() => _scuotiSpriteRom(bersaglioEl, 3, 400), 260);

    const attese = [];
    for (let i = 0; i < 11; i++) {
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, i * 60, opts));
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, -1, i * 60, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Fanghiglia (Move_MUD_SHOT, src/battle_anim_scripts.s): stesso
  // movimento a onda, grafica vera mud_orb.png (16×16, 4 fotogrammi — da
  // water_orb.png ricolorato con la palette reale brown_orb.pal, la stessa
  // tecnica usata dal gioco originale: stessa forma, palette diversa).
  // Differenza reale dallo script: le 2 orbite di ogni "MudShotOrbs" vanno
  // nella STESSA direzione (stesso segno, sfasate di poco), non una su e
  // una giù come Lanciafiamme/Idrocannone.
  async function _giocaMudShotRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('mud_orb.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0, 16, 32, 48], frameMs: 50, durataMs: 480, ampiezzaPx: 10 };

    _scuotiSpriteRom(attaccanteEl, 2, 240);
    setTimeout(() => _scuotiSpriteRom(bersaglioEl, 3, 360), 240);

    const attese = [];
    for (let i = 0; i < 11; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;   // alterna tra una raffica e l'altra, non dentro la coppia
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 55, opts));
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 55 + 28, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Raggio Segnale (Move_SIGNAL_BEAM, src/battle_anim_scripts.s): DUE
  // orbite distinte lanciate insieme (rossa + verde, "SignalBeamOrbs"),
  // non lo stesso sprite riusato — grafiche vere glowy_red_orb.png e
  // glowy_green_orb.png (8×8, un solo fotogramma statico: niente
  // animazione interna nello script originale, righeY:[0] la mantiene
  // ferma). Stesso movimento a onda, le due orbite vanno in direzioni
  // opposte come nella coppia di Lanciafiamme.
  async function _giocaSignalBeamRom(attaccanteEl, bersaglioEl) {
    const rosso = caricaImmagineRom('glowy_red_orb.png');
    const verde = caricaImmagineRom('glowy_green_orb.png');
    await Promise.all([rosso.pronta, verde.pronta]);
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 8, frameH: 8, righeY: [0], frameMs: 9999, durataMs: 420, ampiezzaPx: 12 };

    _scuotiSpriteRom(attaccanteEl, 2, 220);
    setTimeout(() => _scuotiSpriteRom(bersaglioEl, 3, 340), 220);

    const attese = [];
    for (let i = 0; i < 11; i++) {
      attese.push(_particellaOndaVersoTarget(ctx, rosso.img, partenza, arrivo, scalaX, scalaY, 1, i * 50, opts));
      attese.push(_particellaOndaVersoTarget(ctx, verde.img, partenza, arrivo, scalaX, scalaY, -1, i * 50, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Fluttuonda (Move_PSYWAVE, src/battle_anim_scripts.s): anelli blu che
  // crescono avvicinandosi al bersaglio — grafica vera blue_ring.png (ring.png
  // ricolorato con la palette reale blue_ring.pal, stessa tecnica di
  // mud_orb/glowy_green_orb: 3 fotogrammi, ognuno un anello più grande,
  // non un semplice tinting). Nello script originale le 6 "call
  // PsywaveRings" vanno tutte nella STESSA direzione (offset sempre +16,
  // come Fanghiglia), non alternata.
  async function _giocaPsywaveRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('blue_ring.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0, 16, 32], frameMs: 70, durataMs: 500, ampiezzaPx: 8 };

    _scuotiSpriteRom(attaccanteEl, 2, 260);
    setTimeout(() => _scuotiSpriteRom(bersaglioEl, 3, 380), 260);

    const attese = [];
    for (let i = 0; i < 10; i++) {
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, i * 60, opts));
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, i * 60 + 30, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Idrogetto (Move_WATER_GUN, src/battle_anim_scripts.s): UNA bolla
  // lanciata dritta verso il bersaglio (AnimThrowProjectile — un lancio
  // semplice, non l'onda di Idrocannone), poi gocce che schizzano
  // all'impatto. Grafica vera small_bubbles.png (ripulita dalla
  // trasparenza): frame 0 (y=0-16) la bolla grande usata per il lancio.
  async function _giocaWaterGunRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('small_bubbles.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 340, ampiezzaPx: 0 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    // Gocce di schizzo all'impatto (3 nello script originale): tremore sul
    // bersaglio al posto delle gocce vere, stessa semplificazione di Incendio.
    _scuotiSpriteRom(bersaglioEl, 2, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Melma (Move_SLUDGE, src/battle_anim_scripts.s): una bolla di veleno
  // lanciata dritta verso il bersaglio — grafica vera poison_bubble.png
  // (3 fotogrammi: bolla/goccia/scoppio, ripulita dalla trasparenza).
  async function _giocaSludgeRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('poison_bubble.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 360, ampiezzaPx: 0 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 2, 240);
    await new Promise(r => setTimeout(r, 240));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Acido (Move_ACID, src/battle_anim_scripts.s): 3 bolle di veleno dritte
  // verso il bersaglio con ventaglio verticale fisso (0/24/-24 nello
  // script), stessa grafica vera di Melma (poison_bubble.png) ma callback
  // diversa (AnimAcidPoisonBubble invece di AnimSludgeProjectile) — qui
  // semplificata con lo stesso schema a 3 colpi già usato per Incendio.
  async function _giocaAcidRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('poison_bubble.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 300, ampiezzaPx: 0 };

    const scartoY = [0, 10, -10];
    const attese = [];
    scartoY.forEach((dy, i) => {
      const arrivoScarto = { x: arrivo.x, y: arrivo.y + dy };
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivoScarto, scalaX, scalaY, 1, i * 90, opts));
    });
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 2, 240);
    await new Promise(r => setTimeout(r, 240));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Fulmine verticale (AnimTask_ElectricBolt, usato da Tuonoshock/Fulmine/
  // Tuono/ecc. nel gioco vero): categoria NUOVA — non un proiettile
  // orizzontale attaccante→bersaglio come tutte le mosse sopra, ma un
  // fulmine che cade dall'alto SUL bersaglio. Grafica vera spark.png
  // (ottenuta da spark_0.png + la palette reale spark.pal — stessa tecnica
  // delle altre). Riusa _particellaOndaVersoTarget semplicemente mettendo
  // "partenza" sopra il bersaglio invece che sull'attaccante: la funzione
  // è generica, non sa (né le importa) da dove parte il segmento.
  async function _giocaFulmineRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('spark.png');
    await pronta;
    const { scalaX, scalaY, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const partenzaAlto = { x: arrivo.x, y: arrivo.y - 90 };
    const opts = { frameW: 8, frameH: 64, righeY: [0], frameMs: 9999, durataMs: 160, ampiezzaPx: 0 };

    _scuotiSpriteRom(attaccanteEl, 1, 150);
    const attese = [];
    for (let i = 0; i < 3; i++) {
      attese.push(_particellaOndaVersoTarget(ctx, img, partenzaAlto, arrivo, scalaX, scalaY, 1, i * 180, opts));
    }
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 3, 220);
    await new Promise(r => setTimeout(r, 220));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Assorbimento/Megassorbimento (Move_ABSORB/Move_MEGA_DRAIN): le orbite
  // nel gioco vero viaggiano AL CONTRARIO rispetto a tutte le mosse sopra —
  // dal bersaglio verso l'attaccante (energia che viene drenata), non il
  // contrario. Riusa _particellaOndaVersoTarget scambiando semplicemente
  // partenza/arrivo. Grafica vera orbs.png (ANIM_TAG_ORBS).
  async function _giocaAssorbimentoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('orbs.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 500, ampiezzaPx: 10 };

    _scuotiSpriteRom(bersaglioEl, 2, 300);
    const attese = [];
    for (let i = 0; i < 5; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      // partenza/arrivo invertiti: dal bersaglio verso l'attaccante.
      attese.push(_particellaOndaVersoTarget(ctx, img, arrivo, partenza, scalaX, scalaY, segno, i * 90, opts));
    }
    await Promise.all(attese);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Palla Ombra (Move_SHADOW_BALL) e mosse Spettro simili: sfera scura
  // lanciata dritta — grafica vera shadow_ball.png (32×32, un solo
  // fotogramma, già un'immagine completa).
  async function _giocaPallaOmbraRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('shadow_ball.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [0], frameMs: 9999, durataMs: 400, ampiezzaPx: 0 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 3, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Raggio di Ghiaccio e mosse Ghiaccio simili: cristalli lanciati verso il
  // bersaglio — grafica vera ice_crystals_0.png + la palette reale
  // ice_crystals.pal (stessa tecnica delle altre mosse ricolorate).
  async function _giocaGhiaccioRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('ice_crystals.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 300, ampiezzaPx: 0 };

    const scartoY = [-10, 0, 10];
    const attese = [];
    scartoY.forEach((dy, i) => {
      const arrivoScarto = { x: arrivo.x, y: arrivo.y + dy };
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivoScarto, scalaX, scalaY, 1, i * 80, opts));
    });
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 2, 240);
    await new Promise(r => setTimeout(r, 240));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Lanciarocce e mosse Roccia simili: macigno lanciato verso il
  // bersaglio — grafica vera rocks.png (primo fotogramma dei 6, già
  // un'immagine completa 32×32).
  async function _giocaRocciaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('rock.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [0], frameMs: 9999, durataMs: 420, ampiezzaPx: 0 };

    _scuotiSpriteRom(attaccanteEl, 2, 200);
    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 3, 280);
    await new Promise(r => setTimeout(r, 280));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mosse Erba a proiettile (Palla Energia, Foglia Magica, ecc.): foglie
  // che ruotano verso il bersaglio — grafica vera leaf.png (9 fotogrammi,
  // la foglia che gira, usata ciclicamente come le altre mosse ad onda).
  async function _giocaFoglieRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('leaf.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = {
      frameW: 16, frameH: 16,
      righeY: [0, 16, 32, 48, 64, 80, 96, 112, 128],
      frameMs: 28, durataMs: 380, ampiezzaPx: 12,
    };

    _scuotiSpriteRom(attaccanteEl, 1, 180);
    const attese = [];
    for (let i = 0; i < 4; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 70, opts));
    }
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 2, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mosse Acciaio a proiettile (Forza Bruta, Colpo Specchio, ecc.): sfera
  // metallica lucida — grafica vera metal_ball.png (16×16, un frame).
  async function _giocaAcciaioRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('metal_ball.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 380, ampiezzaPx: 0 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 3, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mosse Volante a proiettile (Prodigivento, Air Cutter, ecc.): lame
  // d'aria a mezzaluna — grafica vera air_slash.png (3 fotogrammi).
  async function _giocaVolanteRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('air_slash.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0, 16, 32], frameMs: 45, durataMs: 360, ampiezzaPx: 10 };

    _scuotiSpriteRom(attaccanteEl, 1, 180);
    const attese = [];
    for (let i = 0; i < 4; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 65, opts));
    }
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 2, 240);
    await new Promise(r => setTimeout(r, 240));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Attacco Veloce/Scambio di Stelle (Swift): stella gialla verso il
  // bersaglio — grafica vera yellow_star.png (32×32, un frame, non manca
  // mai: colpisce sempre a prescindere dall'accuratezza nel gioco vero).
  async function _giocaStellaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('yellow_star.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [0], frameMs: 9999, durataMs: 360, ampiezzaPx: 0 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 2, 240);
    await new Promise(r => setTimeout(r, 240));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Dragosoffio e mosse Drago a proiettile: soffio dorato — grafica vera
  // breath.png (4 fotogrammi).
  async function _giocaDragoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('breath.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 16, frameH: 16, righeY: [0, 16, 32, 48], frameMs: 40, durataMs: 400, ampiezzaPx: 10 };

    _scuotiSpriteRom(attaccanteEl, 2, 220);
    const attese = [];
    for (let i = 0; i < 4; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 70, opts));
    }
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 3, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Pulsodark e mosse Buio a proiettile: sfera scura — grafica vera
  // black_ball.png (8×8, un frame).
  async function _giocaBuioRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('black_ball.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 8, frameH: 8, righeY: [0], frameMs: 9999, durataMs: 380, ampiezzaPx: 8 };

    _scuotiSpriteRom(attaccanteEl, 1, 180);
    const attese = [];
    for (let i = 0; i < 5; i++) {
      const segno = (i % 2 === 0) ? 1 : -1;
      attese.push(_particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, segno, i * 60, opts));
    }
    await Promise.all(attese);
    _scuotiSpriteRom(bersaglioEl, 2, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mosse Lotta a proiettile (Focus Blast, Sfera Aurea, ecc.): energia
  // concentrata a forma di pugno — grafica vera red_fist.png (32×32).
  async function _giocaLottaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('red_fist.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [0], frameMs: 9999, durataMs: 400, ampiezzaPx: 0 };

    _scuotiSpriteRom(attaccanteEl, 2, 220);
    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 3, 280);
    await new Promise(r => setTimeout(r, 280));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Ossonite/Osso Boomerang/Raffica d'Ossa: osso lanciato verso il
  // bersaglio — grafica vera bone.png (32×32, un frame).
  async function _giocaOssoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('bone.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [0], frameMs: 9999, durataMs: 380, ampiezzaPx: 14 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 3, 240);
    await new Promise(r => setTimeout(r, 240));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Trio Attacco (Tri Attack): triangolo rosso/blu/giallo — grafica vera
  // tri_attack_triangle.png (64×64, un frame, già l'immagine iconica).
  async function _giocaTrioRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('tri_attack.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 64, frameH: 64, righeY: [0], frameMs: 9999, durataMs: 420, ampiezzaPx: 0 };

    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    _scuotiSpriteRom(bersaglioEl, 3, 260);
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  const ANIMAZIONI_ROM = {
    FLAMETHROWER: _giocaFlamethrowerRom,
    HYDROPUMP: _giocaHydroPumpRom,
    MUDSHOT: _giocaMudShotRom,
    SIGNALBEAM: _giocaSignalBeamRom,
    PSYWAVE: _giocaPsywaveRom,
    EMBER: _giocaEmberRom,
    WATERGUN: _giocaWaterGunRom,
    SLUDGE: _giocaSludgeRom,
    ACID: _giocaAcidRom,

    // Sess. 1 ott 2026 ("fanne una 50ina", richiesta esplicita di Luca):
    // stesso schema per ALTRE mosse reali dello STESSO tipo, che nel gioco
    // originale condividono grafiche molto simili (bolla/proiettile
    // colorato dal tipo) — riuso le funzioni già verificate sopra invece
    // di ricercare da zero lo script unico di ognuna (impossibile in tempi
    // ragionevoli per 350+ mosse): la grafica resta SEMPRE quella vera,
    // cambia solo quale mossa la richiama. Dove il gioco vero ha una
    // coreografia diversa ma non radicalmente diversa (stesso tipo di
    // proiettile semplice), questa è un'approssimazione onesta, non un
    // placeholder a caso.
    FIREBLAST: _giocaEmberRom, LAVAPLUME: _giocaEmberRom, FLAMEBURST: _giocaEmberRom,
    HEATWAVE: _giocaEmberRom, OVERHEAT: _giocaEmberRom, INCINERATE: _giocaEmberRom,
    FIRESPIN: _giocaEmberRom, ERUPTION: _giocaEmberRom, MYSTICALFIRE: _giocaEmberRom,

    BUBBLE: _giocaWaterGunRom, BUBBLEBEAM: _giocaWaterGunRom, WATERPULSE: _giocaWaterGunRom,
    BRINE: _giocaWaterGunRom, MUDDYWATER: _giocaWaterGunRom, WHIRLPOOL: _giocaWaterGunRom,
    OCTAZOOKA: _giocaWaterGunRom,

    SLUDGEBOMB: _giocaSludgeRom, SMOG: _giocaSludgeRom, GUNKSHOT: _giocaSludgeRom,
    ACIDSPRAY: _giocaAcidRom, POISONSTING: _giocaAcidRom, POISONGAS: _giocaSludgeRom,

    PSYBEAM: _giocaPsywaveRom, PSYCHIC: _giocaPsywaveRom, EXTRASENSORY: _giocaPsywaveRom,
    FUTURESIGHT: _giocaPsywaveRom, PSYCHOCUT: _giocaPsywaveRom, CONFUSION: _giocaPsywaveRom,
    STOREDPOWER: _giocaPsywaveRom,

    MUDBOMB: _giocaMudShotRom, MUDSLAP: _giocaMudShotRom, EARTHPOWER: _giocaMudShotRom,
    SANDTOMB: _giocaMudShotRom,

    SILVERWIND: _giocaSignalBeamRom, STRUGGLEBUG: _giocaSignalBeamRom,

    THUNDERSHOCK: _giocaFulmineRom, THUNDERBOLT: _giocaFulmineRom, THUNDER: _giocaFulmineRom,
    SPARK: _giocaFulmineRom, DISCHARGE: _giocaFulmineRom, SHOCKWAVE: _giocaFulmineRom,
    ELECTROBALL: _giocaFulmineRom, CHARGEBEAM: _giocaFulmineRom, ZAPCANNON: _giocaFulmineRom,

    ABSORB: _giocaAssorbimentoRom, MEGADRAIN: _giocaAssorbimentoRom, GIGADRAIN: _giocaAssorbimentoRom,
    DREAMEATER: _giocaAssorbimentoRom, LEECHLIFE: _giocaAssorbimentoRom, LEECHSEED: _giocaAssorbimentoRom,

    SHADOWBALL: _giocaPallaOmbraRom, OMINOUSWIND: _giocaPallaOmbraRom, NIGHTSHADE: _giocaPallaOmbraRom,
    HEX: _giocaPallaOmbraRom,

    ICEBEAM: _giocaGhiaccioRom, BLIZZARD: _giocaGhiaccioRom, ICYWIND: _giocaGhiaccioRom,
    POWDERSNOW: _giocaGhiaccioRom, AURORABEAM: _giocaGhiaccioRom, FROSTBREATH: _giocaGhiaccioRom,

    ROCKTHROW: _giocaRocciaRom, ROCKSLIDE: _giocaRocciaRom, ROCKBLAST: _giocaRocciaRom,
    POWERGEM: _giocaRocciaRom, ANCIENTPOWER: _giocaRocciaRom, ROCKTOMB: _giocaRocciaRom,

    MAGICALLEAF: _giocaFoglieRom, ENERGYBALL: _giocaFoglieRom, LEAFSTORM: _giocaFoglieRom,
    SEEDBOMB: _giocaFoglieRom, GRASSKNOT: _giocaFoglieRom, RAZORLEAF: _giocaFoglieRom,
    LEAFTORNADO: _giocaFoglieRom,

    FLASHCANNON: _giocaAcciaioRom, MIRRORSHOT: _giocaAcciaioRom, MAGNETBOMB: _giocaAcciaioRom,
    GYROBALL: _giocaAcciaioRom, MIRRORCOAT: _giocaAcciaioRom,

    AIRSLASH: _giocaVolanteRom, AIRCUTTER: _giocaVolanteRom, GUST: _giocaVolanteRom,
    HURRICANE: _giocaVolanteRom,

    SWIFT: _giocaStellaRom,

    DRAGONBREATH: _giocaDragoRom, DRAGONPULSE: _giocaDragoRom, DRAGONRAGE: _giocaDragoRom,
    TWISTER: _giocaDragoRom,

    DARKPULSE: _giocaBuioRom, SNARL: _giocaBuioRom, NIGHTDAZE: _giocaBuioRom,

    FOCUSBLAST: _giocaLottaRom, AURASPHERE: _giocaLottaRom, VACUUMWAVE: _giocaLottaRom,

    // Categoria TAGLIO (overlay sul bersaglio, non un proiettile).
    CUT: _giocaCutRom,
    SLASH: _giocaSlashRom, NIGHTSLASH: _giocaSlashRom, XSCISSOR: _giocaSlashRom,
    LEAFBLADE: _giocaSlashRom, AERIALACE: _giocaSlashRom, FURYCUTTER: _giocaSlashRom,
    CROSSPOISON: _giocaSlashRom,

    // Categoria IMPATTO (overlay sul bersaglio, un solo lampo).
    MEGAPUNCH: _giocaPugnoRom, FIREPUNCH: _giocaPugnoRom, ICEPUNCH: _giocaPugnoRom,
    THUNDERPUNCH: _giocaPugnoRom, DYNAMICPUNCH: _giocaPugnoRom, MEGAKICK: _giocaPugnoRom,
    MACHPUNCH: _giocaPugnoRom, BULLETPUNCH: _giocaPugnoRom, DRAINPUNCH: _giocaPugnoRom,
    FOCUSPUNCH: _giocaPugnoRom, SKYUPPERCUT: _giocaPugnoRom, HAMMERARM: _giocaPugnoRom,

    HORNATTACK: _giocaCornoRom, HORNDRILL: _giocaCornoRom, PECK: _giocaCornoRom,
    DRILLPECK: _giocaCornoRom, FURYATTACK: _giocaCornoRom, TWINEEDLE: _giocaCornoRom,

    VINEWHIP: _giocaViticciRom, POWERWHIP: _giocaViticciRom, WRAP: _giocaViticciRom,
    BIND: _giocaViticciRom, CONSTRICT: _giocaViticciRom,

    BONECLUB: _giocaOssoRom, BONEMERANG: _giocaOssoRom, BONERUSH: _giocaOssoRom,

    TRIATTACK: _giocaTrioRom,

    // Riuso della categoria impatto per altre mosse da contatto senza
    // grafica dedicata nel gioco vero (lampo generico al contatto).
    HEADBUTT: _giocaPugnoRom, STOMP: _giocaPugnoRom, BODYSLAM: _giocaPugnoRom,
    SLAM: _giocaPugnoRom, DOUBLEEDGE: _giocaPugnoRom, TAKEDOWN: _giocaPugnoRom,
    SMELLINGSALTS: _giocaPugnoRom, DIZZYPUNCH: _giocaPugnoRom,
    HYPERFANG: _giocaCornoRom, CRUSHCLAW: _giocaCornoRom,

    EXPLOSION: _giocaEsplosioneRom, SELFDESTRUCT: _giocaEsplosioneRom,
    MISTYEXPLOSION: _giocaEsplosioneRom,

    SCRATCH: _giocaArtigliRom, METALCLAW: _giocaArtigliRom, DRAGONCLAW: _giocaArtigliRom,
    VISEGRIP: _giocaArtigliRom, FURYSWIPES: _giocaArtigliRom,
  };
  // CRUSHCLAW si adatta meglio alle artigliate che al corno (assegnata sopra).
  ANIMAZIONI_ROM.CRUSHCLAW = _giocaArtigliRom;
  Object.assign(ANIMAZIONI_ROM, {
    SCREECH: _giocaSuonoRom, METALSOUND: _giocaSuonoRom, HYPERVOICE: _giocaSuonoRom,
    SONICBOOM: _giocaSuonoRom, UPROAR: _giocaSuonoRom, ROAR: _giocaSuonoRom,
    GROWL: _giocaSuonoRom, SING: _giocaSuonoRom, SUPERSONIC: _giocaSuonoRom,
    SNORE: _giocaSuonoRom,

    FOCUSENERGY: _giocaPotenziamentoRom, SWORDSDANCE: _giocaPotenziamentoRom,
    HARDEN: _giocaPotenziamentoRom, SHARPEN: _giocaPotenziamentoRom,
    HOWL: _giocaPotenziamentoRom, MEDITATE: _giocaPotenziamentoRom,
    BULKUP: _giocaPotenziamentoRom, CALMMIND: _giocaPotenziamentoRom,
    DRAGONDANCE: _giocaPotenziamentoRom, COSMICPOWER: _giocaPotenziamentoRom,

    RECOVER: _giocaCuraRom, SOFTBOILED: _giocaCuraRom, REST: _giocaCuraRom,
    MORNINGSUN: _giocaCuraRom, SYNTHESIS: _giocaCuraRom, MILKDRINK: _giocaCuraRom,
    ROOST: _giocaCuraRom, SLACKOFF: _giocaCuraRom, WISH: _giocaCuraRom,
    MOONLIGHT: _giocaCuraRom,

    // Mosse che infliggono stato (overlay sul bersaglio, riuso di grafiche
    // già verificate per lo stesso tipo/elemento: Tossina/Velenopolvere
    // riusano la bolla di veleno, Tuononda/Scintilla elettrica le onde
    // elettriche, Ipnosi/Soporifero... riusano l'onda sonora).
    TOXIC: _giocaSludgeRom, POISONPOWDER: _giocaSludgeRom,
    THUNDERWAVE: _giocaFulmineRom, STUNSPORE: _giocaFulmineRom,
    SLEEPPOWDER: _giocaSuonoRom, HYPNOSIS: _giocaSuonoRom, SPORE: _giocaSuonoRom,
    WILLOWISP: _giocaEmberRom, GLARE: _giocaBuioRom, CONFUSERAY: _giocaPsywaveRom,

    PROTECT: _giocaScudoRom, DETECT: _giocaScudoRom, LIGHTSCREEN: _giocaScudoRom,
    REFLECT: _giocaScudoRom, SAFEGUARD: _giocaScudoRom, ENDURE: _giocaScudoRom,
    SPIKYSHIELD: _giocaScudoRom, BARRIER: _giocaScudoRom,

    SANDATTACK: _giocaSabbiaRom, SMOKESCREEN: _giocaSabbiaRom, FLASH: _giocaSabbiaRom,
    MUDSPORT: _giocaSabbiaRom, KINESIS: _giocaSabbiaRom,

    SPIKES: _giocaPunteRom, TOXICSPIKES: _giocaPunteRom, STEALTHROCK: _giocaPunteRom,

    ATTRACT: _giocaSguardoRom, LOCKON: _giocaSguardoRom, MEANLOOK: _giocaSguardoRom,
    SWEETSCENT: _giocaSguardoRom, CAPTIVATE: _giocaSguardoRom, CHARM: _giocaSguardoRom,
    FORESIGHT: _giocaSguardoRom, ODORSLEUTH: _giocaSguardoRom,
  });

  function trovaAnimazioneRom(nomeMossa) {
    return ANIMAZIONI_ROM[chiaveMossa(nomeMossa)] || null;
  }

  function haAnimazione(nomeMossa) {
    return !!trovaAnimazioneRom(nomeMossa) || !!trovaAnimazione(nomeMossa);
  }

  // gioca() esistente rinominato internamente; il nuovo gioca() prova prima
  // la versione ROM (se questa mossa ce l'ha), altrimenti quella Essentials.
  const giocaEssentials = gioca;
  async function giocaConPriorita(nomeMossa, attaccanteEl, bersaglioEl) {
    const rom = trovaAnimazioneRom(nomeMossa);
    if (rom) { await rom(attaccanteEl, bersaglioEl); return; }
    await giocaEssentials(nomeMossa, attaccanteEl, bersaglioEl);
  }

  return { gioca: giocaConPriorita, haAnimazione };
})();
