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

  function haAnimazione(nomeMossa) {
    return !!trovaAnimazione(nomeMossa);
  }

  return { gioca, haAnimazione };
})();
