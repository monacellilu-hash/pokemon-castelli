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
  // Richiesta esplicita di Luca (19 ott 2026): gli effetti delle mosse
  // erano troppo piccoli — +12% su TUTTI (vecchio motore Essentials e
  // nuovo Metodo 1), un solo numero invece di tarare ogni mossa a mano.
  // Va SOLO sulla dimensione/distanza delle particelle, non sugli sprite
  // veri dei Pokémon (quelli restano <img> HTML, fuori da questo canvas).
  const BUMP_EFFETTI = 1.12;
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
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;

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
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
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
        // Se l'immagine è "broken" (404/non caricata: caricaImmagineRom
        // risolve comunque, vedi commento lì) drawImage lancia un'eccezione
        // QUI DENTRO, in un callback requestAnimationFrame — un throw non
        // catturato salta il resolve() sotto, e la Promise non si risolve
        // mai: la mossa blocca il gioco per sempre (bug reale trovato con
        // Rafforzatore/_giocaPotenziamentoRom, 2 ott 2026). Con prova/cattura
        // qui, un'immagine mancante al massimo salta l'animazione invece di
        // bloccare tutto.
        try {
          ctx.drawImage(img, 0, righeY[frame], d, d, -d / 2, -d / 2, d, d);
        } catch (e) { /* immagine non disponibile: niente disegno, si continua */ }
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

  // Mosse sonore rimaste sul riuso generico (Rumorsuono/Scarica Rumorosa/
  // Botto Sonico/Rombo/Russare): anelli d'onda sonora sul bersaglio —
  // grafica vera sound_waves.png (2 frame). Growl/Roar/Screech/Supersonic/
  // Sing hanno coreografie reali TROPPO diverse (letto lo script vero,
  // Metodo 1, 19 ott 2026) per restare qui — vedi le 3 funzioni dedicate
  // sotto, uscite dal gruppo.
  async function _giocaSuonoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('sound_waves.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 32]);
  }

  // Polvere Sonnifera/Velenosa, Fungo Spora (Move_SLEEP_POWDER/POISON_
  // POWDER/STUN_SPORE, src/data/battle_anim.h — Metodo 1, 19 ott 2026):
  // le 3 mosse condividono LO STESSO sprite reale (poison_powder.png),
  // solo palette diversa, e NON erano insieme: Veleno era sul riuso
  // "Fanghiglia" (sludge, liquido viscoso) e Immobilizzante su "Fulmine"
  // (lampi elettrici) — due abbinamenti sbagliati trovati per caso
  // leggendo lo script vero. Particelle che cadono dall'alto ondeggiando,
  // posizioni/velocità copiate di netto dallo script reale (8 delle 16
  // dell'originale, a scaglioni di 15-30 frame).
  async function _giocaPolvereRom(tintaCss, attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('poison_powder.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const arrivo = _centroElRom(bersaglioEl, campoRect, 0.5, 0.55);

    // [x, y, ritardoMs, ampiezzaOnda, velocitaY] — valori reali dallo
    // script (create_sleep_powder_particle_sprite), x/y in pixel Essentials.
    const PARTICELLE = [
      [-30, -22, 0,   5, 0.8], [10, -22, 0,  -5, 0.8], [-25, -22, 0,   5, 1.1],
      [-5, -22, 250, -5, 0.8], [5, -22, 250,  5, 0.9], [0, -22, 250, -5, 0.7],
      [-15, -22, 500, 5, 1.1], [15, -22, 500, -5, 0.8],
    ];
    const durataMs = 900;
    const t0 = performance.now();
    await new Promise(resolve => {
      const frame = () => {
        const adesso = performance.now() - t0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (tintaCss) { ctx.filter = tintaCss; }
        for (const [px, py, ritardo, amp, vel] of PARTICELLE) {
          const t = adesso - ritardo;
          if (t < 0 || t > durataMs) continue;
          const prog = t / durataMs;
          const x = arrivo.x + px * scalaX + Math.sin(prog * Math.PI * 3) * amp * scalaX;
          const y = arrivo.y + py * scalaY + prog * 40 * vel * scalaY;
          ctx.globalAlpha = 1 - prog * 0.6;
          ctx.drawImage(img, 0, 0, 8, 8, x - 4 * scalaX, y - 4 * scalaY, 8 * scalaX, 8 * scalaY);
        }
        ctx.restore();
        if (adesso < durataMs + 500) requestAnimationFrame(frame);
        else resolve();
      };
      frame();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  async function _giocaPolvereSonnoRom(a, b) { await _giocaPolvereRom(null, a, b); }
  async function _giocaPolvereVelenoRom(a, b) { await _giocaPolvereRom('hue-rotate(260deg)', a, b); }
  async function _giocaSporeStordenteRom(a, b) { await _giocaPolvereRom('hue-rotate(60deg)', a, b); }

  // Ululato/Ringhio (Move_GROWL/Move_ROAR, data/battle_anim_scripts.s ->
  // RoarEffect, src/battle_anim_effects_3.c -> AnimRoarNoiseLine — Metodo 1,
  // 19 ott 2026): NON è un'onda che viaggia verso il bersaglio come pensava
  // il gruppo generico — sono 3 righe sonore che scoppiano vicino alla
  // bocca di chi attacca (sopra/dritto/sotto), due raffiche da 3, POI il
  // bersaglio trema. Tutta l'animazione resta sull'ATTACCANTE.
  async function _giocaRuggitoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('noise_line.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const bocca = _centroElRom(attaccanteEl, campoRect, 0.6, 0.35);

    const raffica = async () => {
      const offsetsY = [-10, 0, 10];
      offsetsY.forEach((dy, i) => {
        let t0 = performance.now();
        const durata = 260;
        const frame = () => {
          const t = performance.now() - t0;
          if (t > durata) return;
          const prog = t / durata;
          ctx.save();
          ctx.globalAlpha = 1 - prog;
          const dx = 24 * scalaX * (0.3 + prog);
          const dyy = (dy * scalaY) * (0.3 + prog * 1.4);
          const dim = 24 * scalaX;
          ctx.drawImage(img, 0, i % 2 === 0 ? 0 : 32, 32, 32,
            bocca.x + dx - dim / 2, bocca.y + dyy - dim / 2, dim, dim);
          ctx.restore();
          requestAnimationFrame(frame);
        };
        frame();
      });
    };
    await raffica();
    await new Promise(r => setTimeout(r, 250));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await raffica();
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _scuotiSpriteRom(bersaglioEl, 2, 300);
    await new Promise(r => setTimeout(r, 300));
  }

  // Urlo/Ipnoshock (Move_SCREECH/Move_SUPERSONIC, ScreechRing/Supersonic-
  // Ring, src/battle_anim_effects_2.c -> gGrowingRingAffineAnimTable —
  // Metodo 1, 19 ott 2026): anello che cresce sul bersaglio (zoom via
  // affine-anim vera, qui approssimato scalando il disegno), ripetuto più
  // volte — 2 per Urlo, 6 per Ipnoshock (molto più intenso nello script
  // originale, non erano affatto identiche come nel riuso generico).
  async function _giocaAnelloRom(nomeImg, ripetizioni, attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom(nomeImg);
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const arrivo = _centroElRom(bersaglioEl, campoRect, 0.5, 0.55);

    for (let i = 0; i < ripetizioni; i++) {
      const t0 = performance.now();
      const durata = 220;
      await new Promise(resolve => {
        const frame = () => {
          const t = performance.now() - t0;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (t > durata) { resolve(); return; }
          const prog = t / durata;
          const dim = (16 + prog * 26) * scalaX;
          ctx.save();
          ctx.globalAlpha = 1 - prog * 0.7;
          ctx.drawImage(img, 0, 0, 16, 16, arrivo.x - dim / 2, arrivo.y - dim / 2, dim, dim * 1.3);
          ctx.restore();
          requestAnimationFrame(frame);
        };
        frame();
      });
    }
    _scuotiSpriteRom(bersaglioEl, 1, 150);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  async function _giocaUrloRom(attaccanteEl, bersaglioEl) {
    await _giocaAnelloRom('ring.png', 2, attaccanteEl, bersaglioEl);
  }
  async function _giocaIpnoshockRom(attaccanteEl, bersaglioEl) {
    await _giocaAnelloRom('gold_ring.png', 6, attaccanteEl, bersaglioEl);
  }

  // Ninnananna (Move_SING, src/battle_anim_scripts.s — Metodo 1, 19 ott
  // 2026): niente onda né anello — 12 note musicali (gWavyMusicNotesSprite-
  // Template) che escono una dopo l'altra vicino al bersaglio e si
  // allontanano ondeggiando, mentre lo sfondo si tinge arcobaleno
  // (AnimTask_MusicNotesRainbowBlend, qui approssimato con un filtro hue
  // sul canvas invece che sullo sfondo vero di battaglia).
  async function _giocaNoteMusicaliRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('music_notes.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const arrivo = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);

    const note = [];
    for (let i = 0; i < 8; i++) {
      note.push({
        ang: (i / 8) * Math.PI * 2,
        t0: performance.now() + i * 90,
        frame: i % 6,   // music_notes.png: 6 fotogrammi (note diverse), 16x16 ciascuno
      });
    }
    const dim = 16 * scalaX;
    const durataTotale = 8 * 90 + 700;
    await new Promise(resolve => {
      const inizio = performance.now();
      const loop = () => {
        const adesso = performance.now();
        const passato = adesso - inizio;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const n of note) {
          const t = adesso - n.t0;
          if (t < 0 || t > 700) continue;
          const prog = t / 700;
          const salita = prog * 40 * scalaY;
          const ondeggio = Math.sin(prog * Math.PI * 2 + n.ang) * 14 * scalaX;
          ctx.save();
          ctx.globalAlpha = 1 - prog;
          ctx.drawImage(img, 0, n.frame * 16, 16, 16,
            arrivo.x + ondeggio - dim / 2, arrivo.y - salita - dim / 2, dim, dim);
          ctx.restore();
        }
        if (passato < durataTotale) requestAnimationFrame(loop);
        else resolve();
      };
      loop();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Potenziamenti su se stessi (Focus Energy, Spada Danza, Rafforza...):
  // scintilla verticale SU CHI USA LA MOSSA, non sul bersaglio — grafica
  // vera focus_energy.png (8 fotogrammi, qui ne usiamo 4 significativi).
  // Riusa _giocaTaglioRom passando lo stesso elemento come "attaccante" e
  // "bersaglio": l'overlay finisce su chi la usa, non sull'avversario.
  async function _giocaPotenziamentoRom(attaccanteEl, bersaglioEl) {
    // Era 'focus_energy.png' (file mai esistito - il nome vero su disco è
    // heal_sparkle.png): l'immagine 404-ava, caricaImmagineRom risolve lo
    // stesso (onerror -> resolve), MA poi ctx.drawImage() su un'immagine
    // "broken" lancia un'eccezione dentro il callback requestAnimationFrame
    // di _giocaTaglioRom — un throw lì non viene mai catturato e salta il
    // resolve(), quindi la Promise non si risolve MAI: la mossa si blocca
    // per sempre a schermo. Bug reale, segnalato da Luca ("Rafforzatore di
    // Metapod blocca il gioco") - colpiva tutte le mosse di questa categoria
    // (Rafforzatore/Focus Energy/Danza Spada/Ringhio/Meditazione/Potenziamento/
    // Forza Bruta/Danza Drago/Forza Cosmica), non solo Rafforzatore.
    const { img, pronta } = caricaImmagineRom('heal_sparkle.png');
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
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
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

  // Mosse a piume (Giravento, Scaccianebbia, Rifugio...): piuma bianca
  // che fluttua su chi la usa — grafica vera white_feather.png (2 frame).
  async function _giocaPiumaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('feather.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, attaccanteEl, [0, 32]);
  }

  // Ragnatele (Sparo Ragna, Ragnatela, Rete Vischiosa...): filo sul
  // bersaglio — grafica vera string.png (64×32, un frame non quadrato).
  async function _giocaRagnatelaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('string.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    _scuotiSpriteRom(bersaglioEl, 2, 220);
    ctx.save();
    ctx.translate(centro.x, centro.y);
    ctx.scale(scalaX, scalaY);
    ctx.drawImage(img, -32, -16, 64, 32);
    ctx.restore();
    await new Promise(r => setTimeout(r, 260));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mosse "di sguardo" rimaste sul riuso generico (Mira/Odora Pista/
  // Previsione/Bis/Spavento): scintillio sul bersaglio — grafica vera
  // eye_sparkle.png (4 fotogrammi, 16×16). Attrazione/Fascino/Blandisci/
  // Sfottò/Tormento/Fragranza hanno coreografie reali troppo diverse
  // (letto lo script vero, Metodo 1, 19 ott 2026) — uscite dal gruppo,
  // vedi le funzioni dedicate sotto.
  async function _giocaSguardoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('sparkle.png');
    await pronta;
    await _giocaTaglioRom(img, attaccanteEl, bersaglioEl, [0, 16, 32, 48], 16);
  }

  // Due segni di rabbia sul bersaglio (Move_TAUNT/TORMENT, src/battle_anim_
  // scripts.s — Metodo 1, 19 ott 2026): comune a entrambe, letta dallo
  // script vero. anger.png, un fotogramma 16x16, appare due volte (sinistra
  // poi destra) sopra la testa del bersaglio.
  async function _mostraRabbiaDoppiaRom(bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('anger.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.25);
    const dim = 16 * scalaX;
    for (const dx of [-20, 20]) {
      ctx.save();
      ctx.drawImage(img, 0, 0, 16, 16, centro.x + dx * scalaX - dim / 2, centro.y - dim / 2, dim, dim);
      ctx.restore();
      _scuotiSpriteRom(bersaglioEl, 1, 180);
      await new Promise(r => setTimeout(r, 220));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Sfottò (Move_TAUNT): nuvoletta di pensiero + ditino che tentenna sopra
  // chi attacca, POI i due segni di rabbia sul bersaglio.
  async function _giocaSfottoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('thought_bubble.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.5, 0.15);
    const dim = 24 * scalaX;
    ctx.save();
    ctx.drawImage(img, 0, 0, 32, 32, centro.x - dim / 2, centro.y - dim / 2, dim, dim);
    ctx.restore();
    await new Promise(r => setTimeout(r, 400));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await _mostraRabbiaDoppiaRom(bersaglioEl);
  }

  // Tormento (Move_TORMENT): chi attacca trema per la rabbia, poi i due
  // segni di rabbia sul bersaglio (niente nuvoletta, a differenza di Sfottò).
  async function _giocaTormentoRom(attaccanteEl, bersaglioEl) {
    _scuotiSpriteRom(attaccanteEl, 2, 300);
    await new Promise(r => setTimeout(r, 300));
    await _mostraRabbiaDoppiaRom(bersaglioEl);
  }

  // Fascino/Blandisci (Move_CHARM — Captivate non esiste in Gen 3, nessuno
  // script reale da leggere, riusa la stessa coreografia): chi attacca
  // dondola, 3 cuori magenta gli compaiono vicino — TUTTO sull'attaccante,
  // niente proiettile verso il bersaglio (a differenza di Attrazione sotto).
  async function _giocaFascinoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('magenta_heart.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.5, 0.3);
    const dim = 16 * scalaX;
    _scuotiSpriteRom(attaccanteEl, 1, 600);
    for (const dx of [0, -20, 20]) {
      ctx.save();
      ctx.drawImage(img, 0, 0, 16, 16, centro.x + dx * scalaX - dim / 2, centro.y - dim / 2 - 10 * scalaY, dim, dim);
      ctx.restore();
      await new Promise(r => setTimeout(r, 250));
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Attrazione (Move_ATTRACT): cuore lanciato verso il bersaglio, scoppia
  // in 6 cuoricini sparsi intorno a lui, poi cuori che salgono intorno a
  // chi attacca — la più elaborata del gruppo, letta per intero dallo
  // script vero (pink_heart_2.png, 5 fotogrammi 32x32).
  async function _giocaAttrazioneRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('pink_heart_2.png');
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    const opts = { frameW: 32, frameH: 32, righeY: [0], frameMs: 9999, durataMs: 350, ampiezzaPx: 0 };

    _scuotiSpriteRom(attaccanteEl, 1, 500);
    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, opts);
    // 6 cuoricini-scoppio sparsi intorno al bersaglio.
    const dim = 14 * scalaX;
    const offsets = [[-24, -18], [20, -24], [-14, 10], [22, 14], [0, -30], [-30, -4]];
    for (const [dx, dy] of offsets) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, 0, 32, 32, 32, arrivo.x + dx * scalaX - dim / 2, arrivo.y + dy * scalaY - dim / 2, dim, dim);
      ctx.restore();
    }
    await new Promise(r => setTimeout(r, 300));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Cuori che salgono intorno a chi ha subito la mossa (il bersaglio è
    // ormai "infatuato" — resta sul bersaglio, coerente col significato).
    const salita = [];
    for (let i = 0; i < 5; i++) {
      salita.push((async (ritardo, dx) => {
        await new Promise(r => setTimeout(r, ritardo));
        const t0 = performance.now();
        const durata = 500;
        return new Promise(resolve => {
          const frame = () => {
            const t = performance.now() - t0;
            if (t > durata) { resolve(); return; }
            const prog = t / durata;
            ctx.save();
            ctx.globalAlpha = 1 - prog;
            ctx.drawImage(img, 0, 0, 32, 32,
              arrivo.x + dx * scalaX - dim / 2, arrivo.y - prog * 40 * scalaY - dim / 2, dim, dim);
            ctx.restore();
            requestAnimationFrame(frame);
          };
          frame();
        });
      })(i * 100, (i - 2) * 12));
    }
    await Promise.all(salita);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Fragranza (Move_SWEET_SCENT): petali rosa che ondeggiano intorno a chi
  // attacca — pink_petal.png, 4 fotogrammi 8x8.
  async function _giocaFragranzaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('pink_petal.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.5, 0.4);
    const dim = 10 * scalaX;
    const petali = [];
    for (let i = 0; i < 10; i++) petali.push({ ang: (i / 10) * Math.PI * 2, t0: i * 60 });
    const durataTotale = 10 * 60 + 500;
    const inizio = performance.now();
    await new Promise(resolve => {
      const loop = () => {
        const adesso = performance.now() - inizio;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of petali) {
          const t = adesso - p.t0;
          if (t < 0 || t > 500) continue;
          const prog = t / 500;
          const raggio = (20 + prog * 30) * scalaX;
          ctx.save();
          ctx.globalAlpha = 1 - prog;
          ctx.drawImage(img, 0, 0, 8, 8,
            centro.x + Math.cos(p.ang + prog * 3) * raggio - dim / 2,
            centro.y + Math.sin(p.ang + prog * 3) * raggio * 0.5 - dim / 2 - prog * 10 * scalaY, dim, dim);
          ctx.restore();
        }
        if (adesso < durataTotale) requestAnimationFrame(loop);
        else resolve();
      };
      loop();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Mira (Move_LOCK_ON): un reticolo si blocca sul bersaglio — lock_on.png
  // (32x40, mirino + scatto finale).
  async function _giocaMiraRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('lock_on.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    const dim = 32 * scalaX;
    const t0 = performance.now();
    const durata = 500;
    await new Promise(resolve => {
      const frame = () => {
        const t = performance.now() - t0;
        if (t > durata) { resolve(); return; }
        const prog = t / durata;
        const scala = 2.2 - prog * 1.2;   // si restringe fino a "bloccarsi"
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.globalAlpha = Math.min(1, prog * 3);
        ctx.drawImage(img, 0, 0, 32, 32,
          centro.x - dim * scala / 2, centro.y - dim * scala / 2, dim * scala, dim * scala);
        ctx.restore();
        requestAnimationFrame(frame);
      };
      frame();
    });
    _scuotiSpriteRom(bersaglioEl, 1, 150);
    await new Promise(r => setTimeout(r, 200));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Danza Spada (Move_SWORDS_DANCE, src/battle_anim_scripts.s — Metodo 1,
  // 19 ott 2026): una spada vera (sword.png, 2 fotogrammi) ruota accanto a
  // chi la usa mentre si muove a ellisse (qui approssimato con un dondolio
  // laterale) — niente a che fare con una scintilla astratta.
  async function _giocaDanzaSpadaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('sword.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.65, 0.4);
    const dim = 28 * scalaX;
    _scuotiSpriteRom(attaccanteEl, 1, 550);
    const t0 = performance.now();
    const durata = 550;
    await new Promise(resolve => {
      const frame = () => {
        const t = performance.now() - t0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (t > durata) { resolve(); return; }
        const prog = t / durata;
        const ang = prog * Math.PI * 4;
        ctx.save();
        ctx.translate(centro.x + Math.sin(ang) * 10 * scalaX, centro.y);
        ctx.rotate(Math.sin(ang) * 0.5);
        ctx.drawImage(img, 0, 0, 32, 32, -dim / 2, -dim / 2, dim, dim);
        ctx.restore();
        requestAnimationFrame(frame);
      };
      frame();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Danza Drago (Move_DRAGON_DANCE, src/battle_anim_scripts.s — Metodo 1,
  // 19 ott 2026): 4 sfere (hollow_orb.png) che orbitano intorno a chi
  // attacca ad angoli di 90° — niente scintilla, un vero anello di sfere.
  async function _giocaDanzaDragoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('hollow_orb.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.5, 0.5);
    const dim = 14 * scalaX, raggio = 30 * scalaX;
    _scuotiSpriteRom(attaccanteEl, 1, 650);
    const t0 = performance.now();
    const durata = 650;
    await new Promise(resolve => {
      const frame = () => {
        const t = performance.now() - t0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (t > durata) { resolve(); return; }
        const prog = t / durata;
        ctx.save();
        for (let k = 0; k < 4; k++) {
          const ang = (k / 4) * Math.PI * 2 + prog * Math.PI * 3;
          ctx.drawImage(img, 0, 0, 16, 16,
            centro.x + Math.cos(ang) * raggio - dim / 2,
            centro.y + Math.sin(ang) * raggio * 0.5 - dim / 2, dim, dim);
        }
        ctx.restore();
        requestAnimationFrame(frame);
      };
      frame();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Calma Mente (Move_CALM_MIND, src/battle_anim_scripts.s — Metodo 1, 19
  // ott 2026): un anello si restringe su chi attacca, due volte (gThinRing-
  // ShrinkingSpriteTemplate ×2) — riusa ring.png, nessun anello dedicato
  // nel pacchetto estratto finora.
  async function _giocaMenteCalmaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('ring.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(attaccanteEl, campoRect, 0.5, 0.5);
    for (let giro = 0; giro < 2; giro++) {
      const t0 = performance.now();
      const durata = 300;
      await new Promise(resolve => {
        const frame = () => {
          const t = performance.now() - t0;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (t > durata) { resolve(); return; }
          const prog = t / durata;
          const dim = (50 - prog * 36) * scalaX;
          ctx.save();
          ctx.globalAlpha = 1 - prog * 0.3;
          ctx.drawImage(img, 0, 0, 16, 16, centro.x - dim / 2, centro.y - dim / 2, dim, dim * 1.3);
          ctx.restore();
          requestAnimationFrame(frame);
        };
        frame();
      });
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Trappole da campo (Punte, Punte Velenose, Levitoroccia...): punte che
  // crescono ai piedi del bersaglio — grafica vera ice_spikes.png (4
  // fotogrammi, 8×16, non quadrati: funzione dedicata).
  async function _giocaPunteRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('spikes.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
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
  // Pugno/impatto (Metodo 1, 19 ott 2026 — letti Mega Punch/Comet Punch/
  // Dynamic Punch): mancavano DUE strati reali, comuni a tutto il gruppo.
  // 1) Lo sfondo si scurisce brevemente durante il colpo (monbg+setalpha
  //    nello script vero) — qui un solo riquadro semitrasparente, disegnato
  //    UNA VOLTA (non in un ciclo che si ripete: è così che si evita il bug
  //    di accumulo già trovato e corretto su Fulmine).
  // 2) Il vero impatto mostra anche la FORMA del pugno/piede vero
  //    (hands_and_feet.png, frame "Fist") sovrapposta al lampo, non solo
  //    un lampo generico astratto.
  async function _giocaImpattoRom(nomeFile, attaccanteEl, bersaglioEl, pugnoVero) {
    const { img, pronta } = caricaImmagineRom(nomeFile);
    const attese = [pronta];
    let imgPugno, prontaPugno;
    if (pugnoVero) {
      ({ img: imgPugno, pronta: prontaPugno } = caricaImmagineRom('hands_and_feet.png'));
      attese.push(prontaPugno);
    }
    await Promise.all(attese);
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    // Sfondo scurito per tutta la durata del colpo (disegnato una volta
    // sola) — SOLO i pugni veri: letti anche Horn Attack e Headbutt/Body
    // Slam per confronto (Metodo 1, 19 ott 2026), quelli non scuriscono
    // affatto (nessun monbg/setalpha nei loro script reali) — "punch_
    // impact.png" era condiviso anche da loro, ma non sono affatto pugni.
    if (pugnoVero) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Balzo dell'attaccante verso il bersaglio (richiesta di Luca, 10 ott
    // 2026, "procedi col gruppo grosso"): ricontrollati gli script veri di
    // Testata/Pestone/Schianto/Megapugno/Megacalcio e simili — quasi TUTTI
    // hanno l'attaccante che si piega/balza in avanti (gBowMonSpriteTemplate/
    // gMegaPunchKickSpriteTemplate) prima dell'impatto, cosa che qui mancava
    // del tutto (solo il lampo sul bersaglio). Aggiunto qui una volta sola:
    // migliora insieme TUTTE le mosse della categoria IMPATTO (pugno e
    // corno), non serve una funzione a parte per ciascuna.
    if (attaccanteEl) {
      const versoDestra = attaccanteEl.id === 'giocatore-sprite'; // giocatore balza a dx, nemico a sx (stessa convenzione di lungeAttaccante in battle.js)
      const originale = attaccanteEl.style.transform;
      const dx = versoDestra ? 14 : -14;
      attaccanteEl.style.transition = 'transform 90ms ease-out';
      attaccanteEl.style.transform = `${originale} translateX(${dx}px)`;
      await new Promise(r => setTimeout(r, 90));
      attaccanteEl.style.transform = originale;
      attaccanteEl.style.transition = '';
    }

    _scuotiSpriteRom(attaccanteEl, 2, 180);
    await new Promise(r => setTimeout(r, 180));
    ctx.save();
    ctx.translate(centro.x, centro.y);
    ctx.scale(scalaX, scalaY);
    ctx.drawImage(img, -16, -16, 32, 32);
    // Forma vera del pugno (hands_and_feet.png, frame "Fist" = primi 32px)
    // sovrapposta al lampo, SOLO per le mosse a pugno vere.
    if (pugnoVero) {
      ctx.drawImage(imgPugno, 0, 0, 32, 32, -16, -16, 32, 32);
    }
    ctx.restore();
    _scuotiSpriteRom(bersaglioEl, 3, 200);
    await new Promise(r => setTimeout(r, 200));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  async function _giocaPugnoRom(attaccanteEl, bersaglioEl) {
    await _giocaImpattoRom('punch_impact.png', attaccanteEl, bersaglioEl, true);
  }
  // Testata/Schianto/Pressing e simili (Metodo 1, 19 ott 2026): condividono
  // "punch_impact.png" come lampo generico ma NON sono pugni (sono balzi/
  // corpo a corpo, script reale confermato senza hands_and_feet.png né
  // sfondo scurito) — stessa funzione, senza il pugno sovrapposto.
  async function _giocaCorpoARom(attaccanteEl, bersaglioEl) {
    await _giocaImpattoRom('punch_impact.png', attaccanteEl, bersaglioEl, false);
  }

  // Pugni elementali (richiesta di Luca, 10 ott 2026 — "procedi con le più
  // frequenti", qui il gruppo più numeroso: 20 mosse sullo stesso impatto
  // generico _giocaPugnoRom). Fuoco/Gelo/Tuono sono i più riconoscibili:
  // ora lanciano anche la particella vera del loro elemento (stesso
  // helper collaudato _particellaOndaVersoTarget già usato da Lanciafiamme/
  // Idrocannone/Raggio di Ghiaccio/Fulmine, non codice nuovo da zero) prima
  // del lampo d'impatto del pugno — li distingue dai pugni "neutri"
  // (Megapugno, Attacco Rapido Pugno...) che restano sul lampo semplice.
  async function _giocaPugnoElementaleRom(nomeFileElemento, optsElemento, attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom(nomeFileElemento);
    await pronta;
    const { scalaX, scalaY, partenza, arrivo } = await _preparaAnimOnda(attaccanteEl, bersaglioEl);
    await _particellaOndaVersoTarget(ctx, img, partenza, arrivo, scalaX, scalaY, 1, 0, optsElemento);
    await _giocaImpattoRom('punch_impact.png', attaccanteEl, bersaglioEl);
  }
  async function _giocaFirePunchRom(attaccanteEl, bersaglioEl) {
    await _giocaPugnoElementaleRom('small_ember.png',
      { frameW: 32, frameH: 32, righeY: [32, 64, 96], frameMs: 60, durataMs: 350, ampiezzaPx: 10 },
      attaccanteEl, bersaglioEl);
  }
  async function _giocaIcePunchRom(attaccanteEl, bersaglioEl) {
    await _giocaPugnoElementaleRom('ice_crystals.png',
      { frameW: 16, frameH: 16, righeY: [0], frameMs: 9999, durataMs: 320, ampiezzaPx: 0 },
      attaccanteEl, bersaglioEl);
  }
  async function _giocaThunderPunchRom(attaccanteEl, bersaglioEl) {
    await _giocaPugnoElementaleRom('spark.png',
      { frameW: 8, frameH: 64, righeY: [0], frameMs: 9999, durataMs: 160, ampiezzaPx: 0 },
      attaccanteEl, bersaglioEl);
  }

  // Centripugno (richiesta di Luca, 10 ott 2026 — gruppo Pugno): nello
  // script vero (Move_FOCUS_PUNCH) non è un lampo solo ma una vera raffica
  // di TRE colpi in rapida successione, ciascuno in una posizione diversa
  // vicino al bersaglio — molto diverso dal resto del gruppo, merita una
  // coreografia a parte invece del lampo singolo condiviso.
  async function _giocaFocusPunchRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('punch_impact.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    const offsets = [{ x: -10, y: -8 }, { x: 10, y: 2 }, { x: 10, y: -6 }];
    for (const off of offsets) {
      _scuotiSpriteRom(bersaglioEl, 5, 130);
      ctx.save();
      ctx.translate(centro.x + off.x * scalaX, centro.y + off.y * scalaY);
      ctx.scale(scalaX, scalaY);
      ctx.drawImage(img, -16, -16, 32, 32);
      ctx.restore();
      await new Promise(r => setTimeout(r, 130));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  // Mosse a corno/zanna (Cornonite, Attacco Zanna...): grafica vera
  // horn_hit.png, stessa logica del pugno.
  async function _giocaCornoRom(attaccanteEl, bersaglioEl) {
    await _giocaImpattoRom('horn_hit.png', attaccanteEl, bersaglioEl, false);
  }

  // Attacco Furia (bonus del 10 ott 2026, non era quella che Luca
  // intendeva con "Raffica" — vedi _giocaGustRom più sotto per quella
  // vera, Raffica di Vento/Gust): nello script vero (Move_FURY_ATTACK,
  // data/battle_anim_scripts.s) sono DUE colpi alternati, uno da destra e
  // uno da sinistra del bersaglio (FuryAttackRight/FuryAttackLeft), non un
  // singolo lampo centrato. Stessa grafica horn_hit.png, ma due impatti
  // sfalsati a sinistra/destra con uno scuotimento per ciascuno.
  async function _giocaFuryAttackRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('horn_hit.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    const primoDestra = Math.random() < 0.5; // choosetwoturnanim: lato casuale, poi alterna
    for (let i = 0; i < 2; i++) {
      const destra = (i === 0) ? primoDestra : !primoDestra;
      const offX = (destra ? 10 : -10) * scalaX;
      _scuotiSpriteRom(bersaglioEl, 4, 160);
      await new Promise(r => setTimeout(r, 120));
      ctx.save();
      ctx.translate(centro.x + offX, centro.y);
      ctx.scale(scalaX, scalaY);
      ctx.drawImage(img, -16, -16, 32, 32);
      ctx.restore();
      await new Promise(r => setTimeout(r, 140));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // DOPPIO CALCIO (richiesta esplicita di Luca, 10 ott 2026 — prima usava
  // il pugno generico, nessuna voce dedicata): nello script vero
  // (Move_DOUBLE_KICK) un piede/pugno appare a posizione CASUALE vicino al
  // bersaglio (gFistFootRandomPosSpriteTemplate) — qui due impatti in
  // posizione/fotogramma casuali, con lo scuotimento del bersaglio.
  // hands_and_feet.png ha 4 fotogrammi (pugno/zampa/piede/mano).
  async function _giocaDoubleKickRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('hands_and_feet.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    for (let i = 0; i < 2; i++) {
      const frame = Math.floor(Math.random() * 4) * 32;
      const offX = (Math.random() * 2 - 1) * 14 * scalaX;
      const offY = (Math.random() * 2 - 1) * 10 * scalaY;
      _scuotiSpriteRom(bersaglioEl, 4, 150);
      ctx.save();
      ctx.translate(centro.x + offX, centro.y + offY);
      ctx.scale(scalaX, scalaY);
      ctx.drawImage(img, 0, frame, 32, 32, -16, -16, 32, 32);
      ctx.restore();
      await new Promise(r => setTimeout(r, 180));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // BECCATA (richiesta esplicita di Luca, 10 ott 2026 — "Beccata era
  // meglio [prima]", il riuso generico di _giocaCornoRom non bastava):
  // nello script vero (Move_PECK) è un SOLO colpo, offset fisso a sinistra
  // del bersaglio (x=-12) e il bersaglio si inclina leggermente e torna
  // (AnimTask_RotateMonToSideAndRestore) — più semplice e diverso da
  // Raffica, non un doppio colpo.
  async function _giocaPeckRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('horn_hit.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    const originale = bersaglioEl ? bersaglioEl.style.transform : '';
    if (bersaglioEl) bersaglioEl.style.transform = `${originale} rotate(-6deg)`;
    await new Promise(r => setTimeout(r, 90));
    ctx.save();
    ctx.translate(centro.x - 12 * scalaX, centro.y);
    ctx.scale(scalaX, scalaY);
    ctx.drawImage(img, -16, -16, 32, 32);
    ctx.restore();
    if (bersaglioEl) bersaglioEl.style.transform = originale;
    await new Promise(r => setTimeout(r, 220));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // RAFFICA DI VENTO / GUST (richiesta esplicita di Luca, 10 ott 2026 —
  // QUESTA è la "Raffica" che intendeva: l'attacco Volante base di
  // Pidgey, non Attacco Furia). Nello script vero (Move_GUST,
  // AnimEllipticalGust/_Step in src/battle_anim_flying.c) un mulinello
  // orbita in ELLISSE sopra il bersaglio per ~71 fotogrammi GBA (~1,2s) —
  // raggio orizzontale 32px, verticale 8px, come un tornado visto di
  // lato — poi un lampo d'impatto con scuotimento. Prima riusava il
  // proiettile generico Volante (_giocaVolanteRom); ora ha la sua vera
  // animazione con la grafica vera gust.png.
  async function _giocaGustRom(attaccanteEl, bersaglioEl) {
    const { img: imgGust, pronta: prontaGust } = caricaImmagineRom('gust.png');
    const { img: imgImpact, pronta: prontaImpact } = caricaImmagineRom('impact.png');
    await Promise.all([prontaGust, prontaImpact]);
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const centro = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);

    await new Promise(resolve => {
      const durataMs = 1190; // ~71 fotogrammi GBA a ~59,7fps
      const inizio = performance.now();
      function passo(ora) {
        const t = ora - inizio;
        if (t >= durataMs) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          resolve();
          return;
        }
        // Angolo che avanza di 5/256 di giro per fotogramma GBA, come
        // l'originale (sprite->data[1] += 5; &= 0xFF) — circa 1,4 giri
        // completi nella durata totale.
        const angolo = (t / durataMs) * Math.PI * 2 * 1.4;
        const offX = Math.sin(angolo) * 32 * scalaX;
        const offY = Math.cos(angolo) * 8 * scalaY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centro.x + offX, centro.y + 20 * scalaY + offY);
        ctx.scale(scalaX, scalaY);
        ctx.drawImage(imgGust, -16, -32, 32, 64);
        ctx.restore();
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });

    _scuotiSpriteRom(bersaglioEl, 3, 180);
    ctx.save();
    ctx.translate(centro.x, centro.y);
    ctx.scale(scalaX, scalaY);
    ctx.drawImage(imgImpact, -16, -16, 32, 32);
    ctx.restore();
    await new Promise(r => setTimeout(r, 200));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Prepara canvas/scala/centri comuni a tutte le animazioni "a onda" (ogni
  // mossa poi lancia le sue particelle con _particellaOndaVersoTarget).
  async function _preparaAnimOnda(attaccanteEl, bersaglioEl) {
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
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

  // Fuocobomba (Move_FIRE_BLAST, src/battle_anim_fire.c — Metodo 1, 19 ott
  // 2026): la "stella" iconica — 5 fiammelle (small_ember.png) disposte in
  // anello intorno al bersaglio (angoli multipli di 360/5, UpdateFireRing-
  // CircleOffset nell'originale), poi una croce di altre fiammelle sopra,
  // ripetuta 3 volte. Niente proiettile che viaggia: tutto compare già
  // intorno al bersaglio, a differenza di Lanciafiamme.
  async function _giocaFuocobombaRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('small_ember.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const arrivo = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    const dim = 20 * scalaX;
    const raggio = 26 * scalaX;

    for (let giro = 0; giro < 3; giro++) {
      // Anello di 5 fiammelle.
      ctx.save();
      for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.drawImage(img, 0, 32, 32, 32,
          arrivo.x + Math.cos(ang) * raggio - dim / 2,
          arrivo.y + Math.sin(ang) * raggio * 0.6 - dim / 2, dim, dim);
      }
      ctx.restore();
      await new Promise(r => setTimeout(r, 130));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Croce di fiammelle sopra il bersaglio.
      ctx.save();
      const bracci = [[0, -1], [0, 1], [-1, 0], [1, 0], [0, 0]];
      for (const [bx, by] of bracci) {
        ctx.drawImage(img, 0, 32, 32, 32,
          arrivo.x + bx * raggio * 0.6 - dim / 2,
          arrivo.y + by * raggio * 0.5 - dim / 2, dim, dim);
      }
      ctx.restore();
      _scuotiSpriteRom(bersaglioEl, 1, 120);
      await new Promise(r => setTimeout(r, 160));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Giro Fuoco (Move_FIRE_SPIN, src/battle_anim_scripts.s — Metodo 1, 19
  // ott 2026): 3 fiammelle che girano a spirale STRETTA intorno al
  // bersaglio (FireSpinEffect × 3, ogni fiammella con raggio/velocità
  // leggermente diversi) — è una trappola che avvolge, non un proiettile.
  async function _giocaGiroDiFuocoRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('small_ember.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const arrivo = _centroElRom(bersaglioEl, campoRect, 0.5, 0.5);
    const dim = 16 * scalaX;
    const spire = [
      { raggio: 30, vel: 0.5, fase: 0 },
      { raggio: 22, vel: 0.65, fase: 2 },
      { raggio: 14, vel: 0.8, fase: 4 },
    ];
    _scuotiSpriteRom(bersaglioEl, 1, 700);
    const t0 = performance.now();
    const durata = 700;
    await new Promise(resolve => {
      const frame = () => {
        const t = performance.now() - t0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (t > durata) { resolve(); return; }
        ctx.save();
        for (const s of spire) {
          const ang = s.fase + (t / durata) * Math.PI * 2 * 3 * s.vel;
          const r = s.raggio * scalaX;
          ctx.drawImage(img, 0, 32, 32, 32,
            arrivo.x + Math.cos(ang) * r - dim / 2,
            arrivo.y + Math.sin(ang) * r * 0.5 - dim / 2, dim, dim);
        }
        ctx.restore();
        requestAnimationFrame(frame);
      };
      frame();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Eruzione (Move_ERUPTION, src/battle_anim_fire.c — Metodo 1, 19 ott
  // 2026): sassi caldi lanciati in aria da chi attacca, che poi ricadono
  // sul campo con tremore — warm_rock.png, letto per intero dallo script.
  async function _giocaEruzioneRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('warm_rock.png');
    await pronta;
    ottieniCanvas();
    const { w, h } = ridimensionaCanvas();
    const scalaX = (w / ESS_W) * BUMP_EFFETTI, scalaY = (h / ESS_H) * BUMP_EFFETTI;
    const campoRect = canvas.getBoundingClientRect();
    const partenza = _centroElRom(attaccanteEl, campoRect, 0.5, 0.6);
    const dim = 18 * scalaX;
    const sassi = [
      { dx: -40, dy: 0 }, { dx: -15, dy: 20 }, { dx: 10, dy: -10 },
      { dx: 35, dy: 10 }, { dx: -30, dy: -25 }, { dx: 20, dy: 25 },
    ];
    _scuotiSpriteRom(attaccanteEl, 2, 300);
    const t0 = performance.now();
    const durata = 650;
    await new Promise(resolve => {
      const frame = () => {
        const t = performance.now() - t0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (t > durata) { resolve(); return; }
        const prog = t / durata;
        ctx.save();
        for (const s of sassi) {
          // Arco: sale e poi ricade (parabola semplice).
          const salita = Math.sin(prog * Math.PI) * 50 * scalaY;
          const x = partenza.x + s.dx * scalaX * prog * 2;
          const y = partenza.y - salita + s.dy * scalaY * prog;
          ctx.drawImage(img, 0, 0, 32, 32, x - dim / 2, y - dim / 2, dim, dim);
        }
        ctx.restore();
        requestAnimationFrame(frame);
      };
      frame();
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _scuotiSpriteRom(bersaglioEl, 4, 300);
    await new Promise(r => setTimeout(r, 300));
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
  // Fulmine/Tuono (Move_THUNDERBOLT/THUNDER, src/battle_anim_electric.c +
  // data/battle_anim_scripts.s — Metodo 1, 19 ott 2026): script reale letto
  // riga per riga (strumenti/estrai_script_animazioni.py THUNDERBOLT).
  // Prima versione (19 ott, sess. stessa giornata) aggiungeva un lampo nero
  // a più fotogrammi con fillRect semitrasparente SENZA mai pulire il
  // canvas tra un fotogramma e l'altro: l'alpha si accumulava invece di
  // oscillare, lo schermo restava scuro — bug segnalato da Luca, rimosso.
  // Elemento vero mancante invece era un altro: il "pallino" centrale
  // (gThunderboltOrbSpriteTemplate, shock_3.png, 32×32, 3 fotogrammi,
  // intermittente) che compare ESATTAMENTE insieme alle 8 scintille
  // orbitanti — Luca lo ricordava bene, io l'avevo saltato del tutto.
  async function _giocaFulmineRom(attaccanteEl, bersaglioEl) {
    const { img, pronta } = caricaImmagineRom('spark.png');
    const { img: imgOrb, pronta: prontaOrb } = caricaImmagineRom('shock_3.png');
    await Promise.all([pronta, prontaOrb]);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pallino centrale (shock_3.png, 32x32xN fotogrammi in colonna — qui
    // prendiamo il primo, l'affine-pulse originale è approssimato con una
    // leggera oscillazione di scala) + anello di 8 scintille che orbitano,
    // raggio doppio (32px/16px scalati) — nati nello stesso istante,
    // intermittenti, esattamente come nello script originale.
    const dimOrb = 32 * scalaX;
    // Raggi allargati e pallini più grandi/luminosi (19 ott 2026, richiesta
    // Luca: "le scintille non si vedono bene") — stesso schema, solo più
    // visibile: raggio ×1.4, pallini più grandi con bagliore (shadowBlur),
    // alpha minima alzata da 0.4 a 0.65 così non spariscono mai del tutto.
    const raggioEsterno = 32 * scalaX * 1.4, raggioInterno = 16 * scalaX * 1.4;
    let giri = 0;
    const animaAnello = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      // Pallino: lampeggia (visibile/invisibile) come l'originale, con un
      // piccolo "respiro" di scala al posto dell'affine-anim vera.
      if (giri % 3 < 2) {
        const scalaPulse = 1 + 0.12 * Math.sin(giri * 0.6);
        const d = dimOrb * scalaPulse;
        ctx.drawImage(imgOrb, 0, 0, 32, 32, arrivo.x - d / 2, arrivo.y - d / 2, d, d);
      }
      // Scintille orbitanti, due raggi, sfasate di 45°, con bagliore per
      // staccare bene dal pallino e dallo sfondo.
      ctx.shadowColor = '#fff86a';
      ctx.shadowBlur = 8;
      for (let k = 0; k < 4; k++) {
        const ang = (k / 4) * Math.PI * 2 + giri * 0.25;
        ctx.globalAlpha = (giri % 2 === 0) ? 1 : 0.65;
        ctx.fillStyle = '#fffde0';
        ctx.beginPath();
        ctx.arc(arrivo.x + Math.cos(ang) * raggioEsterno, arrivo.y + Math.sin(ang) * raggioEsterno * 0.5, 5, 0, Math.PI * 2);
        ctx.fill();
        const ang2 = ang + Math.PI / 4;
        ctx.beginPath();
        ctx.arc(arrivo.x + Math.cos(ang2) * raggioInterno, arrivo.y + Math.sin(ang2) * raggioInterno * 0.5, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      giri++;
    }, 45);
    await new Promise(r => setTimeout(r, 620));
    clearInterval(animaAnello);
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
    // Metodo 1 (19 ott 2026): Fuocobomba/Giro Fuoco/Eruzione uscite dal
    // riuso generico (script reali troppo diversi - niente proiettile).
    // Magma Vulcano/Scoppio di Fuoco/Vampata/Giorno di Sole/Brace/Fuoco
    // Magico restano qui per ora, non ancora letti.
    FIREBLAST: _giocaFuocobombaRom, LAVAPLUME: _giocaEmberRom, FLAMEBURST: _giocaEmberRom,
    HEATWAVE: _giocaEmberRom, OVERHEAT: _giocaEmberRom, INCINERATE: _giocaEmberRom,
    FIRESPIN: _giocaGiroDiFuocoRom, ERUPTION: _giocaEruzioneRom, MYSTICALFIRE: _giocaEmberRom,

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

    AIRSLASH: _giocaVolanteRom, AIRCUTTER: _giocaVolanteRom,
    HURRICANE: _giocaVolanteRom,
    // Tolta dal riuso generico sopra: ha la sua coreografia vera (richiesta
    // esplicita di Luca, 10 ott 2026 — questa è la "Raffica" di Pidgey).
    GUST: _giocaGustRom,

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
    // Fuoco/Gelo/Tuono tolti da qui (10 ott 2026): ora hanno la particella
    // vera del loro elemento, vedi _giocaPugnoElementaleRom sopra.
    MEGAPUNCH: _giocaPugnoRom, FIREPUNCH: _giocaFirePunchRom, ICEPUNCH: _giocaIcePunchRom,
    THUNDERPUNCH: _giocaThunderPunchRom, DYNAMICPUNCH: _giocaPugnoRom, MEGAKICK: _giocaPugnoRom,
    MACHPUNCH: _giocaPugnoRom, BULLETPUNCH: _giocaPugnoRom, DRAINPUNCH: _giocaPugnoRom,
    FOCUSPUNCH: _giocaFocusPunchRom, SKYUPPERCUT: _giocaPugnoRom, HAMMERARM: _giocaPugnoRom,

    // PECK/FURYATTACK ora hanno una coreografia dedicata (richiesta
    // esplicita di Luca, 10 ott 2026): non più il lampo generico riusato
    // da _giocaCornoRom, vedi _giocaPeckRom/_giocaFuryAttackRom sopra.
    HORNATTACK: _giocaCornoRom, HORNDRILL: _giocaCornoRom, PECK: _giocaPeckRom,
    DRILLPECK: _giocaCornoRom, FURYATTACK: _giocaFuryAttackRom, TWINEEDLE: _giocaCornoRom,
    DOUBLEKICK: _giocaDoubleKickRom,

    VINEWHIP: _giocaViticciRom, POWERWHIP: _giocaViticciRom, WRAP: _giocaViticciRom,
    BIND: _giocaViticciRom, CONSTRICT: _giocaViticciRom,

    BONECLUB: _giocaOssoRom, BONEMERANG: _giocaOssoRom, BONERUSH: _giocaOssoRom,

    TRIATTACK: _giocaTrioRom,

    // Riuso della categoria impatto per altre mosse da contatto senza
    // grafica dedicata nel gioco vero (lampo generico al contatto).
    // Metodo 1 (19 ott 2026): questi 6 non sono pugni (letti gli script
    // reali di Headbutt/Body Slam) — niente fist/sfondo scurito per loro.
    HEADBUTT: _giocaCorpoARom, STOMP: _giocaCorpoARom, BODYSLAM: _giocaCorpoARom,
    SLAM: _giocaCorpoARom, DOUBLEEDGE: _giocaCorpoARom, TAKEDOWN: _giocaCorpoARom,
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
    // Metodo 1 (19 ott 2026): Growl/Roar, Screech/Supersonic e Sing avevano
    // coreografie reali troppo diverse per restare sul riuso generico —
    // usciti dal gruppo, vedi le funzioni dedicate sopra. Metal Sound/
    // Hyper Voice/Sonic Boom/Uproar/Snore restano qui per ora (non ancora
    // letti i loro script veri).
    METALSOUND: _giocaSuonoRom, HYPERVOICE: _giocaSuonoRom,
    SONICBOOM: _giocaSuonoRom, UPROAR: _giocaSuonoRom,
    ROAR: _giocaRuggitoRom, GROWL: _giocaRuggitoRom,
    SCREECH: _giocaUrloRom, SUPERSONIC: _giocaIpnoshockRom, SING: _giocaNoteMusicaliRom,
    SNORE: _giocaSuonoRom,

    // Metodo 1 (19 ott 2026): Danza Spada/Danza Drago/Calma Mente uscite
    // dal riuso generico (sprite veri letti dagli script). Ululato
    // condivide ESATTAMENTE RoarEffect con Ululato/Ringhio del gruppo
    // Suono — stessa funzione, _giocaRuggitoRom, nessun duplicato.
    // Focus Energy/Rafforza/Affila/Medita/Bulk Up/Forza Cosmica restano
    // generiche per ora, non ancora lette.
    FOCUSENERGY: _giocaPotenziamentoRom, SWORDSDANCE: _giocaDanzaSpadaRom,
    HARDEN: _giocaPotenziamentoRom, SHARPEN: _giocaPotenziamentoRom,
    HOWL: _giocaRuggitoRom, MEDITATE: _giocaPotenziamentoRom,
    BULKUP: _giocaPotenziamentoRom, CALMMIND: _giocaMenteCalmaRom,
    DRAGONDANCE: _giocaDanzaDragoRom, COSMICPOWER: _giocaPotenziamentoRom,

    RECOVER: _giocaCuraRom, SOFTBOILED: _giocaCuraRom, REST: _giocaCuraRom,
    MORNINGSUN: _giocaCuraRom, SYNTHESIS: _giocaCuraRom, MILKDRINK: _giocaCuraRom,
    ROOST: _giocaCuraRom, SLACKOFF: _giocaCuraRom, WISH: _giocaCuraRom,
    MOONLIGHT: _giocaCuraRom,

    // Mosse che infliggono stato (overlay sul bersaglio, riuso di grafiche
    // già verificate per lo stesso tipo/elemento: Tossina/Velenopolvere
    // riusano la bolla di veleno, Tuononda/Scintilla elettrica le onde
    // elettriche, Ipnosi/Soporifero... riusano l'onda sonora).
    TOXIC: _giocaSludgeRom,
    THUNDERWAVE: _giocaFulmineRom,
    // Metodo 1 (19 ott 2026): Veleno/Immobilizzante erano finiti per
    // sbaglio sul riuso di Fanghiglia/Fulmine — tutte e 3 le polveri
    // condividono invece lo stesso sprite vero, vedi _giocaPolvereRom sopra.
    POISONPOWDER: _giocaPolvereVelenoRom, STUNSPORE: _giocaSporeStordenteRom,
    SLEEPPOWDER: _giocaPolvereSonnoRom, HYPNOSIS: _giocaSuonoRom, SPORE: _giocaSuonoRom,
    WILLOWISP: _giocaEmberRom, GLARE: _giocaBuioRom, CONFUSERAY: _giocaPsywaveRom,

    PROTECT: _giocaScudoRom, DETECT: _giocaScudoRom, LIGHTSCREEN: _giocaScudoRom,
    REFLECT: _giocaScudoRom, SAFEGUARD: _giocaScudoRom, ENDURE: _giocaScudoRom,
    SPIKYSHIELD: _giocaScudoRom, BARRIER: _giocaScudoRom,

    SANDATTACK: _giocaSabbiaRom, SMOKESCREEN: _giocaSabbiaRom, FLASH: _giocaSabbiaRom,
    MUDSPORT: _giocaSabbiaRom, KINESIS: _giocaSabbiaRom,

    SPIKES: _giocaPunteRom, TOXICSPIKES: _giocaPunteRom, STEALTHROCK: _giocaPunteRom,

    // Metodo 1 (19 ott 2026): Attrazione/Fascino/Blandisci/Fragranza/Mira
    // uscite dal riuso generico (script reali troppo diversi, vedi sopra).
    // Mean Look/Foresight/Odor Sleuth restano qui per ora, non ancora letti.
    ATTRACT: _giocaAttrazioneRom, LOCKON: _giocaMiraRom, MEANLOOK: _giocaSguardoRom,
    SWEETSCENT: _giocaFragranzaRom, CAPTIVATE: _giocaFascinoRom, CHARM: _giocaFascinoRom,
    FORESIGHT: _giocaSguardoRom, ODORSLEUTH: _giocaSguardoRom,

    STRINGSHOT: _giocaRagnatelaRom, SPIDERWEB: _giocaRagnatelaRom, STICKYWEB: _giocaRagnatelaRom,

    FEATHERDANCE: _giocaPiumaRom, DEFOG: _giocaPiumaRom, TAILWIND: _giocaPiumaRom,
    AGILITY: _giocaPiumaRom,

    // Ultimo riuso (nessuna grafica nuova): mosse evasive/di schermaglia
    // che si adattano bene alle categorie già costruite.
    SUBSTITUTE: _giocaScudoRom, MINIMIZE: _giocaPiumaRom, DOUBLETEAM: _giocaPiumaRom,
    // Sfottò/Tormento: script reali letti, condividono i 2 segni di rabbia
    // sul bersaglio (Metodo 1, 19 ott 2026) — vedi _mostraRabbiaDoppiaRom.
    // Bis/Spavento restano sul riuso generico per ora.
    TAUNT: _giocaSfottoRom, ENCORE: _giocaSguardoRom, DISABLE: _giocaSguardoRom,
    TORMENT: _giocaTormentoRom,
  });

  // Sess. 1 ott 2026 ("ultimo sforzo per coprirle tutte", richiesta di
  // Luca): invece di continuare a elencare mosse una per una all'infinito
  // (ce ne sono 350+), ogni mossa che ha potenza ma NON è nell'elenco
  // esplicito sopra ora riusa comunque la grafica vera del SUO tipo —
  // nessuna mossa offensiva resta più sul vecchio proiettile colorato
  // generico. Le mosse di stato pure senza voce esplicita restano invece
  // sul sistema Essentials (già le gestisce con messaggi/effetti propri).
  const TIPO_FALLBACK = {
    fire: _giocaEmberRom, water: _giocaWaterGunRom, poison: _giocaSludgeRom,
    psychic: _giocaPsywaveRom, ground: _giocaMudShotRom, bug: _giocaSignalBeamRom,
    electric: _giocaFulmineRom, ghost: _giocaPallaOmbraRom, ice: _giocaGhiaccioRom,
    rock: _giocaRocciaRom, grass: _giocaFoglieRom, steel: _giocaAcciaioRom,
    flying: _giocaVolanteRom, dragon: _giocaDragoRom, dark: _giocaBuioRom,
    fighting: _giocaLottaRom, normal: _giocaStellaRom, fairy: _giocaSguardoRom,
  };

  // Accetta sia una stringa (solo nome, retro-compatibile) sia l'oggetto
  // mossa completo (nome/tipo/classe/potenza) per poter usare il fallback.
  // Distinzione importante: una mossa FISICA senza voce esplicita non deve
  // "lanciare" un proiettile colorato dal tipo (nel gioco vero il contatto
  // fisico non funziona così) — va sull'impatto generico. Solo le mosse
  // SPECIALI senza voce esplicita usano il proiettile vero del loro tipo.
  function trovaAnimazioneRom(mossa) {
    const nomeMossa = (typeof mossa === 'string') ? mossa : (mossa && mossa.nome);
    const specifica = ANIMAZIONI_ROM[chiaveMossa(nomeMossa)];
    if (specifica) return specifica;
    if (mossa && typeof mossa === 'object' && mossa.potenza > 0) {
      if (mossa.classe === 'physical') return _giocaPugnoRom;
      if (mossa.tipo) return TIPO_FALLBACK[mossa.tipo] || null;
    }
    return null;
  }

  function haAnimazione(mossa) {
    const nomeMossa = (typeof mossa === 'string') ? mossa : (mossa && mossa.nome);
    return !!trovaAnimazioneRom(mossa) || !!trovaAnimazione(nomeMossa);
  }

  // gioca() esistente rinominato internamente; il nuovo gioca() prova prima
  // la versione ROM (specifica o per tipo), altrimenti quella Essentials.
  const giocaEssentials = gioca;

  // RETE DI SICUREZZA (10 ott 2026 — PRIORITARIO, segnalato da Luca: Raffica
  // di Vento blocca il turno per davvero, danno mai calcolato). Prima un
  // errore o un blocco DENTRO una qualunque animazione (ROM o Essentials)
  // interrompeva la Promise che js/battle.js aspetta con un semplice
  // "await animaMossa(...)" SENZA try/catch — qualunque eccezione o rAF
  // mai arrivato a termine piantava l'intero turno per sempre, danno
  // compreso. Ora ogni animazione gira dentro un try/catch (un errore
  // interrotto diventa un log in console, non un turno bloccato) E in gara
  // con un timeout di sicurezza di 4 secondi: se un'animazione non finisce
  // da sola entro quel tempo, il turno riparte comunque. Non risolve la
  // causa esatta di un singolo bug (continua la ricerca), ma garantisce
  // che NESSUNA animazione, oggi o in futuro, possa bloccare il gioco.
  async function _conReteDiSicurezza(promessa, nomeMossa) {
    let timeoutId;
    try {
      await Promise.race([
        promessa,
        new Promise(resolve => { timeoutId = setTimeout(resolve, 4000); }),
      ]);
    } catch (e) {
      console.error(`[AnimazioniEssentials] Errore nell'animazione di "${nomeMossa}" — turno NON bloccato, ignorato:`, e);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function giocaConPriorita(mossa, attaccanteEl, bersaglioEl) {
    const nomeMossa = (typeof mossa === 'string') ? mossa : (mossa && mossa.nome);
    const rom = trovaAnimazioneRom(mossa);
    if (rom) { await _conReteDiSicurezza(rom(attaccanteEl, bersaglioEl), nomeMossa); return; }
    await _conReteDiSicurezza(giocaEssentials(nomeMossa, attaccanteEl, bersaglioEl), nomeMossa);
  }

  return { gioca: giocaConPriorita, haAnimazione };
})();
