/* ============================================================
   battle.js — Combattimento a turni (F5: Pokémon selvatici)

   Stile classico GBA: il tuo Pokémon di spalle in basso a sinistra,
   il selvatico di fronte in alto a destra, barre HP, menu
   Attacca / Pokémon / Zaino / Fuga.

   Formule (semplificate ma fedeli allo spirito Gen 1-3):
   - Statistiche: stat = floor(2 * base * livello / 100) + 5
                  hp   = floor(2 * base * livello / 100) + livello + 10
   - Danno: floor((2*Lv/5 + 2) * potenza * Att / Dif / 50) + 2,
            poi STAB (x1.5), efficacia tipi e variazione casuale 85-100%.
   - EXP:   baseExp * livelloNemico / 7 (curva di crescita: Lv^3).
   - Level cap: l'EXP si blocca al cap finché non si ottiene
                la medaglia successiva (vedi CLAUDE.md).
   ============================================================ */

const Battle = (function () {

  // Scorciatoia per prendere un elemento della pagina
  function $(id) { return document.getElementById(id); }

  /* ----------------------------------------------------------
     CACHE LOCALE + RETRY per gli sprite di battaglia (sess. 29 set 2026,
     bug segnalato da Luca: "i Pokémon spariscono ogni tanto"). Gli sprite
     sono <img> puntati a URL remoti di PokéAPI: se la rete ha un intoppo,
     o quel servizio gratuito rallenta/non risponde, l'immagine resta vuota
     e sembra che il Pokémon sia sparito. Due contromisure, entrambe senza
     bisogno di far scaricare nulla al giocatore:
     (a) ogni sprite scaricato una volta finisce in IndexedDB (persistente
         nel browser, sopravvive a chiusure/ricariche): dalla seconda volta
         in poi si legge da lì, zero rete;
     (b) se lo scarico fallisce o impiega più di 4 secondi, si ritenta
         fino a 3 volte prima di ripiegare sull'assegnazione diretta del
         browser (comportamento di prima, sempre meglio di niente).
     Se IndexedDB non è disponibile (privacy mode molto restrittiva ecc.)
     si salta silenziosamente la cache e resta solo il retry. ---------- */
  const _CACHE_SPRITE_DB    = 'pkc-sprite-cache';
  const _CACHE_SPRITE_STORE = 'immagini';
  let _cacheSpriteDbPromise = null;

  function _apriCacheSprite() {
    if (_cacheSpriteDbPromise) return _cacheSpriteDbPromise;
    _cacheSpriteDbPromise = new Promise(resolve => {
      if (!('indexedDB' in window)) { resolve(null); return; }
      let richiesta;
      try { richiesta = indexedDB.open(_CACHE_SPRITE_DB, 1); }
      catch (e) { resolve(null); return; }
      richiesta.onupgradeneeded = () => { richiesta.result.createObjectStore(_CACHE_SPRITE_STORE); };
      richiesta.onsuccess = () => resolve(richiesta.result);
      richiesta.onerror = () => resolve(null);
    });
    return _cacheSpriteDbPromise;
  }

  async function _leggiSpriteDaCache(url) {
    const db = await _apriCacheSprite();
    if (!db) return null;
    return new Promise(resolve => {
      try {
        const tx = db.transaction(_CACHE_SPRITE_STORE, 'readonly');
        const richiesta = tx.objectStore(_CACHE_SPRITE_STORE).get(url);
        richiesta.onsuccess = () => resolve(richiesta.result || null);
        richiesta.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
  }

  async function _scriviSpriteInCache(url, blob) {
    const db = await _apriCacheSprite();
    if (!db) return;
    try {
      const tx = db.transaction(_CACHE_SPRITE_STORE, 'readwrite');
      tx.objectStore(_CACHE_SPRITE_STORE).put(blob, url);
    } catch (e) { /* cache piena/non disponibile: non deve mai bloccare la lotta */ }
  }

  // Promesse di "sprite pronto" per elemento (bug segnalato da Luca, 19 ott
  // 2026: "i Pokémon spariscono ad ogni cambio/cura/ricarica"). Causa reale:
  // impostaSpriteConCache è asincrona (cache/fetch), ma animaEntrataPokemon
  // riportava opacity a 1 dopo un tempo FISSO, senza aspettare che l'<img>
  // avesse davvero finito di caricare — su un cache-miss (specie mai vista,
  // sprite back diverso dal front...) lo sprite veniva rivelato ancora
  // vuoto/rotto, sembrando "sparito". Ora ogni chiamata registra qui una
  // promessa che si risolve quando el.src è stato davvero assegnato (sempre,
  // anche nel ramo di fallback finale) — vedi attendiSpriteCaricato sotto.
  const _spritePronto = {};

  // Imposta lo sprite di un <img> di battaglia con cache locale + retry.
  // url vuoto = svuota l'elemento (stesso comportamento di sempre, resta
  // sincrono: niente da scaricare o cercare in cache).
  // TENTATIVI_SPRITE/TIMEOUT_MS_SPRITE: budget massimo del retry qui sotto.
  // attendiSpriteCaricato (sotto) DEVE aspettare almeno questo tanto prima di
  // rivelare lo sprite — bug corretto 22 ott 2026 (segnalato da Luca, "i
  // Pokémon continuano a sparire"): il tetto di rivelazione era fisso a
  // 2000ms, molto più corto del budget REALE del retry (3×4000=12000ms su
  // una connessione lenta/instabile) — lo sprite veniva rivelato (opacità
  // ripristinata) PRIMA che l'immagine fosse davvero pronta, e restava vuoto
  // finché il fetch in ritardo non arrivava (se arrivava). Ora i due numeri
  // sono legati allo stesso budget, niente più disallineamento.
  const TENTATIVI_SPRITE = 3, TIMEOUT_MS_SPRITE = 4000;
  const TIMEOUT_TOTALE_SPRITE_MS = TENTATIVI_SPRITE * TIMEOUT_MS_SPRITE + 500; // +500ms di margine

  function impostaSpriteConCache(elId, url) {
    const el = $(elId);
    if (!el) return;
    if (!url) { el.src = ''; _spritePronto[elId] = Promise.resolve(); return; }
    const mioUrl = url; // richiesta più recente per QUESTO elemento (vedi sotto)
    el.dataset.spriteUrl = mioUrl;

    const TENTATIVI = TENTATIVI_SPRITE, TIMEOUT_MS = TIMEOUT_MS_SPRITE;
    const promessa = (async () => {
      // Se nel frattempo qualcun altro ha richiesto un altro sprite per lo
      // stesso <img> (cambio Pokémon rapido), questa risposta è superata:
      // non sovrascrivere con uno sprite vecchio arrivato in ritardo.
      const ancoraValido = () => el.dataset.spriteUrl === mioUrl;

      const cache = await _leggiSpriteDaCache(mioUrl).catch(() => null);
      if (cache) {
        if (ancoraValido()) el.src = URL.createObjectURL(cache);
        return;
      }

      for (let tentativo = 1; tentativo <= TENTATIVI; tentativo++) {
        if (!ancoraValido()) return;
        try {
          const risposta = await Promise.race([
            fetch(mioUrl),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout sprite')), TIMEOUT_MS)),
          ]);
          if (!risposta.ok) throw new Error('http ' + risposta.status);
          const blob = await risposta.blob();
          _scriviSpriteInCache(mioUrl, blob);   // in background, non blocca
          if (ancoraValido()) el.src = URL.createObjectURL(blob);
          return;
        } catch (e) {
          if (tentativo === TENTATIVI && ancoraValido()) {
            // Ultimo tentativo: ripiega sull'assegnazione diretta nativa del
            // browser (magari ha già una sua cache HTTP che qui non vediamo)
            // invece di lasciare lo sprite vuoto per sempre.
            el.src = mioUrl;
          }
        }
      }
    })();
    _spritePronto[elId] = promessa;
  }

  // Aspetta che l'ultimo sprite richiesto per quell'elemento sia stato
  // davvero assegnato (src impostato) PRIMA di rivelarlo — con un tetto
  // massimo per non bloccare l'animazione all'infinito se rete/cache sono
  // completamente morte (a quel punto si rivela comunque, anche se vuoto,
  // meglio che restare bloccati per sempre).
  function attendiSpriteCaricato(elId, timeoutMs) {
    const p = _spritePronto[elId] || Promise.resolve();
    return Promise.race([
      p,
      new Promise(r => setTimeout(r, timeoutMs || TIMEOUT_TOTALE_SPRITE_MS)),
    ]);
  }

  // ---- Stato interno della battaglia ----
  let mio = null;          // il Pokémon del giocatore in campo
  let nemico = null;       // il Pokémon avversario in campo
  let indiceAttivo = 0;    // posizione di "mio" dentro la squadra
  let statoGioco = null;   // riferimento allo stato globale (squadra, zaino, levelCap)
  let onFine = null;       // funzione chiamata quando la battaglia termina
  let inCorso = false;
  let uiCollegata = false; // i listener dei pulsanti vanno collegati una volta sola

  // Modalità allenatore (F7): squadra nemica multipla, niente cattura né fuga
  let modalita = 'selvatico';     // 'selvatico' oppure 'allenatore'
  let tipoBattagliaMusica = 'selvatico'; // per la musica: selvatico/allenatore/capopalestra/rivale
  let datiAllenatore = null;      // { nome, squadra, dialogoSconfitta }
  // Scorte di cura dell'allenatore (sess. 1 ott 2026, richiesta di Luca: i
  // capipalestra devono potersi curare in lotta, non solo attaccare). Copia
  // mutabile per QUESTA battaglia (si scala a ogni uso), presa da
  // datiAllenatore.oggettiCura = [{chiave, quantita}] — null se il trainer
  // non ne ha (comportamento di default invariato per tutti gli altri).
  let scorteCuraNemico = null;
  let squadraNemica = [];         // istanze dei Pokémon dell'allenatore
  let indiceNemico = 0;           // quale Pokémon nemico è in campo
  let fuggireImpossibile = false; // F11: true per i leggendari (fuga bloccata)
  let nienteTeleportSuSconfitta = false; // vedi avvia(): solo la 1a lotta col rivale nel lab
  // Switch volontario dell'IA (nato sess. 6 ott 2026 per Maso, generalizzato
  // a TUTTI gli allenatori il 20 ott 2026 — richiesta esplicita di Luca,
  // "le battaglie sono troppo facili/a caso"): cambia Pokémon se uno in
  // panchina è nettamente più efficace di quello in campo contro il
  // nostro, non più spesso di una volta ogni 3 turni.
  let numeroTurnoBattaglia = 0;
  let ultimoSwitchVolontarioTurno = -99;

  // ---- Lotta in DOPPIO (2 allenatori vedono il giocatore insieme, vedi map.js
  // _trainerSpottaDoppia): motore parallelo, separato da quello 1v1 sopra, per
  // non rischiare regressioni nel motore singolo già completo e testato.
  // Convenzione elementi DOM: slot 0 = id normali (nemico-sprite, ecc.),
  // slot 1 = stessi id con suffisso "-2" (nemico-sprite-2, ecc.).
  let modoDoppia = false;
  let doppiaAllenatori = [];         // [{nome, squadra:[{id,livello}], dialogoSconfitta, premioSoldi}, {...}]
  let doppiaBanchi = [[], []];       // istanze di riserva (create ma non ancora scese in campo) per allenatore
  let doppiaNemiciAttivi = [null, null];   // istanza nemica attiva per slot 0/1 (null = slot vuoto)
  // Un SOLO allenatore nemico ma la lotta è comunque in doppia (es. i grunt
  // singoli dell'Osservatorio, sess. 15 set): in questo caso i 2 slot nemici
  // NON appartengono a due allenatori diversi, ma allo STESSO allenatore, che
  // schiera 2 Pokémon insieme dalla sua squadra — bench condiviso tra i due
  // slot invece che uno a testa (richiesta esplicita di Luca, sess. 17 set
  // 2026: "se disponibili pokemon si schierano 2 pokemon alla volta", non
  // importa se 2v1 o 1v2). Quando true, doppiaBanchi[0] è il bench VERO e
  // doppiaBanchi[1] resta sempre vuoto.
  let doppiaBancoCondiviso = false;
  let doppiaMieiAttivi = [null, null];     // istanza del giocatore attiva per slot 0/1
  let doppiaMieiIndici = [null, null];     // indice in statoGioco.squadra per ciascuno slot
  let doppiaOnFine = null;
  let doppiaSlotCorrente = 0;        // per quale mio slot si sta scegliendo l'azione ora
  let doppiaAzioni = [null, null];   // azione scelta per slot 0/1 in questo round
  let doppiaSostituzioneInCorso = null; // resolve() della Promise in attesa di un sostituto obbligatorio
  // Modalità ALLEATO (sess. 12 set 2026): slot 1 non è un mio secondo
  // Pokémon ma la squadra di un NPC alleato (es. Baso) — IA "mossa casuale"
  // come i nemici, mai un menu per il giocatore. Vedi avviaDoppia/
  // mostraMenuPrincipaleDoppia/_doppiaGestisciEventualiKO.
  let modoAlleato = false;
  let alleatoNome = '';
  let alleatoBanco = [];             // riserve dell'alleato (istanze create ma non ancora scese in campo)
  // Registri istanza→presentazione: permettono a elementoSprite/centroSprite/
  // lampeggia/lungeAttaccante di funzionare sia in singolo (fallback su
  // mio/nemico, comportamento identico a prima) sia in doppio (mappatura
  // esplicita dei 4 battler), senza duplicare quelle funzioni.
  let elementoPerBattler = new WeakMap();  // istanza → id elemento sprite
  let latoPerBattler = new WeakMap();      // istanza → 'nemico' | 'giocatore'

  // Meteo di battaglia (allineamento Essentials): 'sun' | 'rain' | 'sandstorm' | 'hail' | null.
  // Ereditato dal meteo di mappa a inizio lotta (dura tutta la battaglia, come
  // nei giochi originali), oppure impostato da una mossa (5 turni).
  let meteoBattaglia = null;
  let meteoBattagliaTurni = 0;
  // Schermi di squadra (20 ott 2026, richiesta Luca — Riflesso/Schermoluce/
  // Salvaguardia erano scelte come mosse ma non facevano letteralmente
  // nulla: mossaUtile() le scarta dalla scelta automatica, ma un moveset
  // fisso (mosse: [...]) le forza lo stesso). Solo lotta SINGOLA (mio/
  // nemico): in doppia questi contatori restano sempre a 0, innocui.
  // Durano 5 turni come nei giochi veri (decremento in fineTurnoStati).
  let schermiMio = { reflect: 0, lightscreen: 0, safeguard: 0 };
  let schermiNemico = { reflect: 0, lightscreen: 0, safeguard: 0 };
  // Restituisce lo schermo del LATO di "ist" (chi viene protetto), o null se
  // non è né mio né nemico (es. doppia, dove questa feature resta disattivata).
  function _schermiDiLato(ist) {
    if (ist === mio) return schermiMio;
    if (ist === nemico) return schermiNemico;
    return null;
  }
  // Coda delle mosse "ritardate" (Divinazione/Doom Desire, vedi MOSSE_RITARDATE):
  // { turni, danno, nomeMossa, nomeAttaccante, latoColpito: 'giocatore'|'nemico' }.
  // Lavora per LATO (via latoBattler), non per istanza fissa: funziona
  // identica in singola e in doppia, e colpisce chiunque sia in campo sul
  // lato bersaglio al momento dello scatto, non necessariamente chi era lì
  // al momento dell'uso. Azzerata a ogni nuova lotta (vedi avvia/avviaDoppia).
  let attacchiRitardati = [];

  // Mosse che impostano il meteo (nome = slug inglese PokeAPI, uguale a mossa.nome).
  const MOSSE_METEO = {
    'sunny-day':  { tipo: 'sun',       messaggio: 'Il sole comincia a splendere!' },
    'rain-dance': { tipo: 'rain',      messaggio: 'Inizia a piovere!' },
    'sandstorm':  { tipo: 'sandstorm', messaggio: 'Si scatena una tempesta di sabbia!' },
    'hail':       { tipo: 'hail',      messaggio: 'Comincia a grandinare!' },
  };
  const METEO_ETICHETTA = { sun: '☀️ Sole', rain: '🌧️ Pioggia', sandstorm: '🏜️ Sabbia', hail: '❄️ Grandine' };
  const METEO_FINE_MSG  = {
    sun: 'Il sole torna normale.', rain: 'Smette di piovere.',
    sandstorm: 'La tempesta di sabbia si placa.', hail: 'La grandine si ferma.',
  };
  // Converte il meteo di mappa (app.js, stato.meteo.tipo) nel meteo di battaglia.
  // "sabbia" aggiunto il 5 ott 2026 per il meteo forzato nelle palestre a
  // difficoltà massima (vedi _avviaLottaTrainer, js/map.js) — prima non
  // serviva perché nessuna zona overworld generava mai tempesta di sabbia.
  const METEO_DA_MAPPA = { pioggia: 'rain', sole: 'sun', grandine: 'hail', sabbia: 'sandstorm' };

  // Aggiorna l'etichetta del meteo in battaglia (mostrata/nascosta)
  function aggiornaMeteoUI() {
    const el = $('battaglia-meteo');
    if (!el) return;
    if (meteoBattaglia && METEO_ETICHETTA[meteoBattaglia]) {
      el.textContent = METEO_ETICHETTA[meteoBattaglia];
      el.classList.remove('nascosto');
    } else {
      el.classList.add('nascosto');
    }
  }

  /* ==========================================================
     CREAZIONE ISTANZE POKÉMON
     Un'"istanza" è un Pokémon concreto: specie + livello +
     statistiche calcolate + mosse con PP + HP attuali.
     ========================================================== */

  // Natura (richiesta esplicita di Luca, 10 ott 2026 — "altrimenti il
  // Pokémon non si differenzia"): le 25 nature ufficiali, ciascuna alza
  // una statistica del 10% e ne abbassa un'altra del 10% (5 sono neutre,
  // boost===lower, nessun effetto). nomeIt verificato il 10 ott 2026 su
  // veekun.com (database multilingua) una per una — non da una singola
  // tabella trovata già pronta, quindi se qualcuna ti sembra sbagliata
  // dimmelo e la ricontrollo.
  const NATURE_DB = {
    Hardy:   { nomeIt: 'Ardita',   boost: null,               lower: null },
    Lonely:  { nomeIt: 'Schiva',   boost: 'attack',           lower: 'defense' },
    Brave:   { nomeIt: 'Audace',   boost: 'attack',           lower: 'speed' },
    Adamant: { nomeIt: 'Decisa',   boost: 'attack',           lower: 'special-attack' },
    Naughty: { nomeIt: 'Birbona',  boost: 'attack',           lower: 'special-defense' },
    Bold:    { nomeIt: 'Sicura',   boost: 'defense',          lower: 'attack' },
    Docile:  { nomeIt: 'Docile',   boost: null,               lower: null },
    Relaxed: { nomeIt: 'Placida',  boost: 'defense',          lower: 'speed' },
    Impish:  { nomeIt: 'Scaltra',  boost: 'defense',          lower: 'special-attack' },
    Lax:     { nomeIt: 'Fiacca',   boost: 'defense',          lower: 'special-defense' },
    Timid:   { nomeIt: 'Timida',   boost: 'speed',            lower: 'attack' },
    Hasty:   { nomeIt: 'Lesta',    boost: 'speed',            lower: 'defense' },
    Serious: { nomeIt: 'Seria',    boost: null,               lower: null },
    Jolly:   { nomeIt: 'Allegra',  boost: 'speed',            lower: 'special-attack' },
    Naive:   { nomeIt: 'Ingenua',  boost: 'speed',            lower: 'special-defense' },
    Modest:  { nomeIt: 'Modesta',  boost: 'special-attack',   lower: 'attack' },
    Mild:    { nomeIt: 'Mite',     boost: 'special-attack',   lower: 'defense' },
    Quiet:   { nomeIt: 'Quieta',   boost: 'special-attack',   lower: 'speed' },
    Bashful: { nomeIt: 'Ritrosa',  boost: null,               lower: null },
    Rash:    { nomeIt: 'Ardente',  boost: 'special-attack',   lower: 'special-defense' },
    Calm:    { nomeIt: 'Calma',    boost: 'special-defense',  lower: 'attack' },
    Gentle:  { nomeIt: 'Gentile',  boost: 'special-defense',  lower: 'defense' },
    Sassy:   { nomeIt: 'Vivace',   boost: 'special-defense',  lower: 'speed' },
    Careful: { nomeIt: 'Cauta',    boost: 'special-defense',  lower: 'special-attack' },
    Quirky:  { nomeIt: 'Furba',    boost: null,               lower: null },
  };
  const NOMI_NATURE = Object.keys(NATURE_DB);
  function generaNatura() {
    return NOMI_NATURE[Math.floor(Math.random() * NOMI_NATURE.length)];
  }
  // Moltiplicatore di natura per UNA statistica (1.1 se la natura la alza,
  // 0.9 se la abbassa, 1 altrimenti/nature neutre).
  function moltiplicatoreNatura(natura, chiaveStat) {
    const n = NATURE_DB[natura];
    if (!n) return 1;
    if (n.boost === chiaveStat) return 1.1;
    if (n.lower === chiaveStat) return 0.9;
    return 1;
  }

  // EV (richiesta di Luca, 10 ott 2026): bonus di +1 ogni 4 EV nella
  // statistica, come nei giochi veri (floor(EV/4), max EV 252 → max
  // bonus 63 punti pre-livello). Nessun sistema IV in questo progetto
  // (mai richiesto): formula semplificata senza quel termine, IV=0.
  function calcolaStat(base, livello, moltiplicatore, ev) {
    const bonusEv = Math.floor((ev || 0) / 4);
    return Math.floor((Math.floor((2 * base + bonusEv) * livello / 100) + 5) * (moltiplicatore || 1));
  }

  function calcolaHpMax(baseHp, livello, ev) {
    const bonusEv = Math.floor((ev || 0) / 4);
    return Math.floor((2 * baseHp + bonusEv) * livello / 100) + livello + 10;
  }

  // Un Pokémon senza EV assegnati (oggetto vuoto o mancante).
  function evAzzerati() {
    return { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
  }
  // Totale EV già distribuiti (il tetto ufficiale è 510 in tutto).
  function evTotale(ev) {
    if (!ev) return 0;
    return Object.values(ev).reduce((s, v) => s + (v || 0), 0);
  }
  const EV_MAX_TOTALE = 510;
  const EV_MAX_SINGOLA = 252;

  // Assegna gli EV in premio per aver sconfitto "yield_" (evYield della
  // specie nemica), rispettando i due tetti (252 per statistica, 510 in
  // tutto), poi ricalcola le statistiche vere — l'HP attuale sale della
  // stessa quantità di cui sale l'HP massimo, come nei giochi veri, non
  // in proporzione.
  function assegnaEv(ist, yield_) {
    if (!yield_ || !ist) return;
    if (!ist.ev) ist.ev = evAzzerati();
    let totale = evTotale(ist.ev);
    if (totale >= EV_MAX_TOTALE) return;
    for (const chiave of Object.keys(ist.ev)) {
      const guadagno = yield_[chiave] || 0;
      if (guadagno <= 0) continue;
      const spazioStat = EV_MAX_SINGOLA - ist.ev[chiave];
      const spazioTotale = EV_MAX_TOTALE - totale;
      const effettivo = Math.max(0, Math.min(guadagno, spazioStat, spazioTotale));
      if (effettivo <= 0) continue;
      ist.ev[chiave] += effettivo;
      totale += effettivo;
    }
    const hpMaxPrima = ist.hpMax;
    ricalcolaStatistiche(ist);
    const delta = ist.hpMax - hpMaxPrima;
    if (delta > 0) ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + delta);
  }

  function nomeBello(nome) {
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }

  // Mossa di riserva quando non c'è nient'altro (come "Scontro" nei giochi)
  function mossaFallback() {
    return {
      nome: 'scontro', nomeIt: 'Scontro', tipo: 'normal', classe: 'physical',
      potenza: 35, precisione: 100, ppMax: 999, pp: 999,
      priorita: 0, bersaglio: 'selected-pokemon',
      statoEffetto: null, statoProbabilita: 0, cambiStat: [], cambiStatProbabilita: 0
    };
  }

  // Una mossa di stato è "utile" solo se sappiamo applicarne l'effetto
  // (uno stato gestito oppure un cambio di statistica): così non finiscono
  // nel set mosse del tutto inutili.
  function mossaUtile(m) {
    if (m.potenza && m.potenza > 0) return true;            // fa danno
    if (m.statoEffetto && (STATI[m.statoEffetto] || m.statoEffetto === 'confusion')) return true; // infligge uno stato gestito
    if (m.cambiStat && m.cambiStat.length > 0) return true;   // modifica le statistiche
    if (MOSSE_METEO[m.nome]) return true;                     // imposta il meteo
    // Protezione/Individuazione (gestite in eseguiTurno) e Riflesso/
    // Schermoluce/Salvaguardia (20 ott 2026, gestite in eseguiMossa/
    // applicaStato): ora hanno un effetto vero, non più solo decorativo.
    if (m.nome === 'protect' || m.nome === 'detect') return true;
    if (m.nome === 'reflect' || m.nome === 'light-screen' || m.nome === 'safeguard') return true;
    return false;
  }

  // Sceglie fino a 4 mosse tra quelle che il Pokémon conosce al suo livello
  // (le più recenti prima, come nei giochi): offensive e di stato gestibili.
  async function scegliMosse(datiPokemon, livello) {
    const candidate = datiPokemon.mosse.filter(m => m.livello <= livello);
    const scelte = [];

    // Partiamo dalle mosse imparate più di recente e andiamo a ritroso
    for (let i = candidate.length - 1; i >= 0 && scelte.length < 4; i--) {
      const voce = candidate[i];
      if (scelte.some(s => s.nome === voce.nome)) continue; // niente doppioni
      try {
        const dettagli = await PokeAPI.getMossa(voce.nome, voce.url);
        if (mossaUtile(dettagli)) {
          scelte.push({ ...dettagli, pp: dettagli.ppMax });
        }
      } catch (e) {
        console.warn('[Battle] Mossa saltata:', voce.nome, e.message);
      }
    }

    if (scelte.length === 0) scelte.push(mossaFallback());
    return scelte.reverse(); // in ordine di apprendimento
  }

  // Ricalcola le statistiche dal livello (usata anche al level-up)
  function ricalcolaStatistiche(ist) {
    const ev = ist.ev || evAzzerati();
    // HP non è mai influenzata dalla natura (come nei giochi veri), ma SÌ dagli EV.
    ist.hpMax    = calcolaHpMax(ist.basi.hp, ist.livello, ev.hp);
    ist.attacco  = calcolaStat(ist.basi.attack,            ist.livello, moltiplicatoreNatura(ist.natura, 'attack'),           ev.attack);
    ist.difesa   = calcolaStat(ist.basi.defense,           ist.livello, moltiplicatoreNatura(ist.natura, 'defense'),          ev.defense);
    ist.attSp    = calcolaStat(ist.basi['special-attack'], ist.livello, moltiplicatoreNatura(ist.natura, 'special-attack'),   ev['special-attack']);
    ist.difSp    = calcolaStat(ist.basi['special-defense'],ist.livello, moltiplicatoreNatura(ist.natura, 'special-defense'),  ev['special-defense']);
    ist.velocita = calcolaStat(ist.basi.speed,             ist.livello, moltiplicatoreNatura(ist.natura, 'speed'),            ev.speed);
  }

  // F9.3 — Sesso del Pokémon: 'M' | 'F' | 'N' (senza sesso: leggendari + poche
  // specie classicamente asessuate). Serve per la Pensione Pokémon (F9.3).
  const SPECIE_SENZA_GENERE = new Set([
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251,          // uccelli/bestie/Mewtwo/Mew leggendari
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,               // Regi, Latios/Latias, Kyogre/Groudon/Rayquaza, Jirachi, Deoxys
    81, 82, 100, 101, 120, 121, 132, 137, 233,                      // Magnemite/Voltorb/Staryu/Ditto/Porygon (asessuati classici)
  ]);
  function generaGenere(id) {
    if (SPECIE_SENZA_GENERE.has(id)) return 'N';
    return Math.random() < 0.5 ? 'M' : 'F';
  }

  // F9.3 — Risale la catena evolutiva fino alla forma base (stadio 1) di una
  // specie, usando EVOLUZIONI_DB al contrario. Serve alla Pensione Pokémon
  // per capire quale "cucciolo" nasce da una coppia.
  function trovaSpecieBase(id) {
    if (typeof EVOLUZIONI_DB === 'undefined') return id;
    let corrente = id;
    let cambiato = true;
    while (cambiato) {
      cambiato = false;
      for (const chiave in EVOLUZIONI_DB) {
        const arr = Array.isArray(EVOLUZIONI_DB[chiave]) ? EVOLUZIONI_DB[chiave] : [EVOLUZIONI_DB[chiave]];
        if (arr.some(e => e.idEvo === corrente)) {
          corrente = Number(chiave);
          cambiato = true;
          break;
        }
      }
    }
    return corrente;
  }

  // F9.4 — Abilità: scelta dello "slot" (indice nella lista abilità della
  // specie, come nei giochi veri) tra le abilità NON nascoste, a caso alla
  // creazione. abilitaChiaveDaSlot() la applica sia alla creazione sia dopo
  // un'evoluzione — stesso slot, non richiede all'utente niente in più
  // (l'abilità nascosta non è mai assegnata a caso, coerente con i giochi).
  function sceglieSlotAbilita(dati) {
    const lista = dati.abilita || [];
    const slotNormali = lista.map((a, i) => i).filter(i => !lista[i].nascosta);
    if (slotNormali.length === 0) return 0;
    return slotNormali[Math.floor(Math.random() * slotNormali.length)];
  }
  function abilitaChiaveDaSlot(dati, slot) {
    const lista = dati.abilita || [];
    if (lista.length === 0) return null;
    return lista[Math.min(slot || 0, lista.length - 1)].nome;
  }

  // Crea un'istanza completa di un Pokémon (scarica i dati se servono)
  // Risolve l'id "giusto" per livello (20 ott 2026, richiesta esplicita di
  // Luca: "non si può vedere uno Zubat al 55, deve avere Golbat" — vale per
  // le squadre avversarie/selvatiche, NON per le catture/doni del
  // giocatore, che in nessun gioco vero evolvono da sole al momento della
  // creazione). Segue SOLO la catena "livello" (metodo "livello" in
  // EVOLUZIONI_DB): pietra/scambio/felicità richiedono un'azione del
  // giocatore, non si "scoprono" da sole col livello — lasciate come sono.
  // Un ramo con PIÙ evoluzioni possibili allo stesso stadio (es. Eevee) non
  // viene mai toccato automaticamente: si evolve a scelta del giocatore,
  // non ha senso indovinare quale forma dargli a un avversario.
  function _risolviIdPerLivello(id, livello) {
    if (typeof EVOLUZIONI_DB === 'undefined') return id;
    let attuale = id;
    for (let i = 0; i < 5; i++) {   // tetto di sicurezza, nessuna catena Gen1-3 supera i 3 stadi
      const voce = EVOLUZIONI_DB[attuale];
      if (!voce || Array.isArray(voce)) break;   // ramificata: non si tocca
      if (voce.metodo !== 'livello' || livello < voce.valore) break;
      attuale = voce.idEvo;
    }
    return attuale;
  }

  // Moveset FISSO scelto a mano (20 ott 2026, richiesta esplicita di Luca:
  // scegliMosse prende solo le 4 mosse apprese più di recente per livello,
  // spesso scarse/sbilanciate sui Capipalestra — "a cazzo di cane"). Array
  // di slug inglesi PokéAPI (es. ['vine-whip','razor-leaf']); una mossa non
  // valida/non trovata viene saltata, non blocca le altre.
  async function _mosseFisse(elenco) {
    const scelte = [];
    for (const nome of elenco) {
      try {
        const dettagli = await PokeAPI.getMossa(nome);
        scelte.push({ ...dettagli, pp: dettagli.ppMax });
      } catch (e) {
        console.warn('[Battle] Mossa fissa non trovata:', nome, e.message);
      }
    }
    return scelte.length ? scelte : [mossaFallback()];
  }

  async function creaIstanza(id, livello, opzioni) {
    if (opzioni && opzioni.evolviPerLivello) id = _risolviIdPerLivello(id, livello);
    const dati = await PokeAPI.getPokemon(id);
    const abilitaSlot = sceglieSlotAbilita(dati);
    const ist = {
      id: dati.id,
      nome: nomeBello(dati.nome),
      tipi: dati.tipi,
      sprite: dati.sprite,
      baseExp: dati.baseExp || 64,
      basi: dati.statistiche,
      evYield: dati.evYield,           // quanti EV regala in premio chi lo sconfigge
      catchRate: (typeof dati.catchRate === 'number') ? dati.catchRate : 45,
      livello: livello,
      exp: Math.pow(livello, 3),       // curva di crescita: Lv^3
      mosse: (opzioni && opzioni.mosseFisse && opzioni.mosseFisse.length)
        ? await _mosseFisse(opzioni.mosseFisse)
        : await scegliMosse(dati, livello),
      mosseImparabili: dati.mosse,     // lista specie: serve per i level-up futuri
      mosseImparabiliSchema: 'gen123', // già calcolato col fix Gen 1-3 (6 ott 2026)
      condizione: null,                // stato alterato: null | { tipo, turni }
      mod: modificatoriAzzerati(),     // sbalzi di statistica (-6..+6)
      felicita: 70,                    // 0-255: sale coi livelli/vittorie (evol. felicità)
      oggetto: null,                   // oggetto da tenere (chiave in OGGETTI, categoria 'held') o null
      genere: generaGenere(dati.id),   // F9.3: 'M' | 'F' | 'N'
      abilitaSlot,                     // F9.4: indice nella lista abilità della specie
      abilitaChiave: abilitaChiaveDaSlot(dati, abilitaSlot), // slug inglese (es. "static")
      natura: generaNatura(),          // richiesta di Luca, 10 ott 2026: ±10% su due stat
      ev: evAzzerati(),                // Punti Effort: iniziano sempre a 0, si guadagnano in lotta
      // 20 ott 2026 (richiesta esplicita di Luca, es. Machamp/Umbreon delle
      // palestre): comportamenti IA opzionali per singolo Pokémon di una
      // squadra avversaria — vedi scegliMossaNemico().
      primaMossa: (opzioni && opzioni.primaMossa) || null,   // slug: usata SEMPRE al primo turno in campo, poi normale
      prediligeCura: !!(opzioni && opzioni.prediligeCura),   // sotto il 40% HP preferisce una mossa di cura se ce l'ha
    };
    ricalcolaStatistiche(ist);
    ist.hpAttuale = ist.hpMax;
    // Pokédex: ogni istanza creata (nemico selvatico/allenatore, starter,
    // uovo, ecc.) conta come "vista" — segnaPokedex vive in app.js, caricato
    // dopo battle.js ma la chiamata avviene solo a runtime (a battaglia
    // avviata), quando app.js è già stato eseguito per intero.
    if (typeof segnaPokedex === 'function') {
      segnaPokedex(ist.id, ist.nome, ist.sprite && ist.sprite.fronte, false);
    }
    return ist;
  }

  // Trasforma un'istanza nel Pokémon evoluto, mantenendo livello, exp, mosse,
  // felicità e il rapporto di HP. Usata sia in battaglia (livello) sia fuori
  // (pietre, scambio) tramite Battle.evolviIstanza.
  async function evolviIstanza(ist, idEvo) {
    const dati = await PokeAPI.getPokemon(idEvo);
    const vecchioHpMax = ist.hpMax;
    ist.id = dati.id;
    ist.nome = nomeBello(dati.nome);
    ist.tipi = dati.tipi;
    ist.sprite = dati.sprite;
    ist.basi = dati.statistiche;
    ist.baseExp = dati.baseExp || ist.baseExp;
    ist.mosseImparabili = dati.mosse;
    ist.mosseImparabiliSchema = 'gen123';
    // F9.4: stesso slot abilità di prima (come nei giochi veri), applicato
    // alla lista abilità della NUOVA specie.
    ist.abilitaChiave = abilitaChiaveDaSlot(dati, ist.abilitaSlot || 0);
    ricalcolaStatistiche(ist);
    ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - vecchioHpMax));
    if (typeof segnaPokedex === 'function') {
      segnaPokedex(ist.id, ist.nome, ist.sprite && ist.sprite.fronte, true);
    }
    return ist;
  }

  // Cerca un'evoluzione per LIVELLO o FELICITÀ soddisfatta in EVOLUZIONI_DB.
  function trovaEvoluzioneAuto(ist) {
    if (typeof EVOLUZIONI_DB === 'undefined') return null;
    const e = EVOLUZIONI_DB[ist.id];
    if (!e) return null;
    const arr = Array.isArray(e) ? e : [e];
    return arr.find(x => {
      if (x.metodo === 'livello' && x.valore != null && ist.livello >= x.valore) {
        if (x.condizione === 'att>dif') return ist.attacco >  ist.difesa;
        if (x.condizione === 'dif>att') return ist.difesa  >  ist.attacco;
        if (x.condizione === 'att=dif') return ist.attacco === ist.difesa;
        if (x.condizione === 'posto_libero') return false;  // Nincada→Shedinja: non gestito
        return true;
      }
      if (x.metodo === 'felicita' && (ist.felicita || 0) >= (x.valore || 220)) {
        // condizione giorno/notte (se il sistema tempo è disponibile)
        if (x.condizione && typeof stato !== 'undefined' && stato.tempo) {
          const ora = stato.tempo.minuti != null ? Math.floor(stato.tempo.minuti / 60) : 12;
          const giorno = ora >= 6 && ora < 21;
          if (x.condizione === 'giorno' && !giorno) return false;
          if (x.condizione === 'notte'  &&  giorno) return false;
        }
        return true;
      }
      return false;
    }) || null;
  }

  /* ==========================================================
     STATI ALTERATI E MODIFICATORI DI STATISTICA
     ========================================================== */

  // Abilità "di contatto" (richiesta Luca, 18 ott 2026): 30% di infliggere
  // uno stato a chi colpisce con una mossa fisica. Approssimazione nota:
  // "contatto" = mossa fisica (PokéAPI non espone un flag di contatto vero,
  // ma è vero per la stragrande maggioranza delle mosse fisiche Gen 1-3).
  const ABILITA_CONTATTO_STATO = { static: 'paralysis', 'poison-point': 'poison', 'flame-body': 'burn' };
  // Spora (effect-spore, 20 ott 2026): come le 3 sopra ma con 3 stati possibili
  // invece di uno solo (10% ciascuno sul contatto, come nei giochi veri).
  const ABILITA_CONTATTO_STATO_MULTI = { 'effect-spore': ['sleep', 'poison', 'paralysis'] };

  // Stati alterati gestiti (chiave API → nome italiano breve)
  const STATI = {
    paralysis: { sigla: 'PAR', nome: 'paralizzato' },
    sleep:     { sigla: 'SON', nome: 'addormentato' },
    poison:    { sigla: 'VEL', nome: 'avvelenato' },
    burn:      { sigla: 'SCO', nome: 'scottato' },
    freeze:    { sigla: 'CON', nome: 'congelato' },
  };

  // Mosse a "ricarica": dopo l'uso il Pokémon salta il turno successivo (chiavi
  // PokéAPI in inglese). Iper Raggio, Idrocannone, Vampata Solare, Radicalbruco.
  const MOSSE_RICARICA = new Set([
    'hyper-beam', 'giga-impact', 'hydro-cannon', 'blast-burn', 'frenzy-plant', 'rock-wrecker',
  ]);
  // Mosse a due turni: turno 1 si caricano (testo), turno 2 colpiscono.
  const MOSSE_DUE_TURNI = {
    'fly': 'vola in alto', 'dig': 'scava sottoterra', 'dive': 'si tuffa in profondità',
    'bounce': 'salta in alto', 'solar-beam': 'assorbe la luce', 'razor-wind': 'crea un turbine',
    'skull-bash': 'abbassa la testa', 'sky-attack': "si avvolge d'energia",
  };
  // Sess. 13 ott 2026 (richiesta esplicita di Luca): SOLO queste 4 (non
  // Vampata Solare/Turbine/Testata/Attacco Celere, che si caricano "a vista"
  // e restano colpibili) rendono il Pokémon non colpibile al turno 1 — vola
  // in aria, scava sottoterra o si immerge, letteralmente irraggiungibile.
  const MOSSE_SEMINVULNERABILI = new Set(['fly', 'dig', 'dive', 'bounce']);
  // Unica eccezione reale: Terremoto/Magnitudo colpiscono comunque chi è
  // sottoterra con Fossa (non chi vola/è immerso), a potenza raddoppiata.
  const MOSSE_ANTI_FOSSA = new Set(['earthquake', 'magnitude']);

  /* MOD 6B — Mosse di FURIA: bloccano il Pokémon per 2-3 turni colpendo ogni
     turno; alla fine lo lasciano confuso. Chiavi = nome PokéAPI (inglese). */
  const MOSSE_FURIA = {
    'outrage':     "è in preda all'oltraggio",
    'petal-dance': 'è travolto dalla petalobufera',
    'thrash':      'si scatena senza controllo',
  };
  // MOD 6B — Mosse che fanno svenire chi le usa (dopo aver colpito).
  const MOSSE_AUTODISTRUZIONE = new Set(['explosion', 'self-destruct', 'selfdestruct']);
  // Memento (20 ott 2026, bug segnalato da Luca: "non fa quello che deve
  // fare"): abbassa Attacco/Att.Speciale dell'avversario di 2 stadi E chi la
  // usa sviene sempre, a prescindere dal risultato dell'abbassamento — non
  // era gestita per niente: l'abbassamento statistiche funzionava già (è
  // una mossa di stato pura, passa dal motore generico), ma lo svenimento
  // di chi la usa mancava del tutto. Set separato da MOSSE_AUTODISTRUZIONE
  // perché Umidità (damp) blocca Esplosione/Autodistruzione ma NON Memento.
  const MOSSE_AUTOSACRIFICIO = new Set(['memento']);

  // Mosse "sonore" vere (per Insonorizzato/soundproof, 19 ott 2026) — solo
  // quelle che esistono già in Gen 1-3 (ID ≤ 386, CLAUDE.md).
  const MOSSE_SONORE = new Set([
    'growl', 'roar', 'sing', 'supersonic', 'screech', 'snore', 'uproar',
    'metal-sound', 'perish-song', 'heal-bell', 'sonic-boom', 'grasswhistle', 'grass-whistle',
  ]);
  // MOD 6B — Mosse di protezione: annullano la mossa avversaria per quel turno.
  const MOSSE_PROTEZIONE = new Set(['protect', 'detect']);
  // Sess. 18 ott 2026 (richiesta esplicita di Luca) — Divinazione/Doom
  // Desire: nessun danno subito, colpiscono 2 turni dopo chiunque sia in
  // campo sul lato colpito in quel momento (vedi attacchiRitardati sotto).
  const MOSSE_RITARDATE = new Set(['future-sight', 'doom-desire']);
  // Rotolamento/Palla Rapida: potenza che raddoppia a ogni uso consecutivo
  // della STESSA mossa (×1,×2,×4,×8,×16), si azzera cambiando mossa.
  // Semplificazione nota: non resetta su un colpo mancato (richiederebbe
  // sapere se il colpo è andato a segno, informazione che eseguiMossa non
  // restituisce) — resta comunque corretta per l'uso tipico (ripetuta).
  const MOSSE_ROTOLAMENTO = new Set(['rollout', 'ice-ball']);

  // Nomi italiani delle statistiche modificabili (per i messaggi)
  const STAT_NOMI = {
    attack: 'Attacco', defense: 'Difesa',
    'special-attack': 'Att. Speciale', 'special-defense': 'Dif. Speciale',
    speed: 'Velocità', accuracy: 'Precisione', evasion: 'Elusione',
  };

  function modificatoriAzzerati() {
    return { attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0,
             speed: 0, accuracy: 0, evasion: 0 };
  }

  function azzeraModificatori(ist) {
    if (ist) ist.mod = modificatoriAzzerati();
  }

  // Moltiplicatore di uno "stage" di statistica (formula classica Gen 3)
  function moltiplicatoreStage(stage) {
    return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
  }

  // Statistica effettiva (base × sbalzo). 'kind' = chiave di mod
  function statEffettiva(ist, valoreBase, chiaveMod) {
    return valoreBase * moltiplicatoreStage(ist.mod[chiaveMod] || 0);
  }

  // Sigla dello stato per i pannelli ("PAR", "VEL"…) o stringa vuota
  function siglaCondizione(ist) {
    return (ist.condizione && STATI[ist.condizione.tipo])
      ? ` [${STATI[ist.condizione.tipo].sigla}]` : '';
  }

  // Abilità che danno immunità TOTALE a un tipo di stato (richiesta Luca, 18
  // ott 2026): Insonnia/Spirito Vitale → mai addormentato, Pellefredda →
  // mai scottato.
  const ABILITA_IMMUNE_STATO = {
    insomnia: 'sleep', 'vital-spirit': 'sleep', 'water-veil': 'burn',
    // 20 ott 2026 — 3 abilità immuni mancanti (stesso schema delle 3 sopra):
    limber: 'paralysis', immunity: 'poison', 'magma-armor': 'freeze',
  };

  // Un Pokémon è immune a quel tipo di stato per via dei suoi tipi?
  function immuneAStato(ist, tipoStato) {
    if (ABILITA_IMMUNE_STATO[ist.abilitaChiave] === tipoStato) return true;
    // Foglia Vigore (leaf-guard, 19 ott 2026): immune a QUALUNQUE stato
    // alterato (non solo sonno) mentre c'è il sole.
    if (ist.abilitaChiave === 'leaf-guard' && meteoBattaglia === 'sun') return true;
    if (tipoStato === 'poison')     return ist.tipi.includes('poison') || ist.tipi.includes('steel');
    if (tipoStato === 'burn')       return ist.tipi.includes('fire');
    if (tipoStato === 'freeze')     return ist.tipi.includes('ice');
    // Elettro immune a paralisi (richiesta esplicita di Luca, 9 ott 2026 —
    // non è una regola di Smeraldo/Gen 3, introdotta solo in Gen 6, ma qui
    // la vuole comunque).
    if (tipoStato === 'paralysis')  return ist.tipi.includes('electric');
    return false;
  }

  /* ==========================================================
     FORMULE DI COMBATTIMENTO
     ========================================================== */

  // Moltiplicatore di efficacia della mossa contro i tipi del difensore
  function efficacia(tipoMossa, tipiDifensore) {
    let molt = 1;
    const riga = TABELLA_TIPI[tipoMossa];
    if (!riga) return 1;
    for (const t of tipiDifensore) {
      if (riga[t] !== undefined) molt *= riga[t];
    }
    return molt;
  }

  // Tuttofare (scrappy, 19 ott 2026): le mosse Normale/Lotta dell'attaccante
  // colpiscono gli Spettro come se non fossero immuni (l'immunità Spettro è
  // la sola cosa che annulla: niente effetto su Buio/Acciaio ecc., quelle
  // restano come da tabella). Qui si ricalcola l'efficacia TOGLIENDO
  // "ghost" dai tipi del difensore prima di guardare la tabella.
  function efficaciaConScrappy(mossa, attaccante, difensore) {
    if (attaccante.abilitaChiave === 'scrappy' &&
        (mossa.tipo === 'normal' || mossa.tipo === 'fighting') &&
        difensore.tipi.includes('ghost')) {
      return efficacia(mossa.tipo, difensore.tipi.filter(t => t !== 'ghost'));
    }
    return efficacia(mossa.tipo, difensore.tipi);
  }

  // Abilità che scattano quando un Pokémon ENTRA in campo (inizio lotta o
  // cambio): richiesta esplicita di Luca, 9 ott 2026 — "le Abilità non
  // possono essere solo estetiche". Qui solo le due famiglie più comuni e
  // sicure da isolare (meteo automatico, Intimidate); le altre (Static,
  // Levitate per terra qui sopra in calcolaDanno, ecc.) restano un lavoro
  // futuro — vedi nota nel riepilogo.
  const METEO_DA_ABILITA = {
    drizzle: 'rain', drought: 'sun', 'sand-stream': 'sandstorm', 'snow-warning': 'hail',
  };
  async function attivaAbilitaIngresso(pkm, etichetta, avversario, etichettaAvversario) {
    if (!pkm || !pkm.abilitaChiave) return;
    _aggiornaForecast(pkm);
    const nuovoMeteo = METEO_DA_ABILITA[pkm.abilitaChiave];
    if (nuovoMeteo && meteoBattaglia !== nuovoMeteo) {
      meteoBattaglia = nuovoMeteo;
      meteoBattagliaTurni = 998; // "permanente" come l'abilità nei giochi veri
      aggiornaMeteoUI();
      const msg = MOSSE_METEO[Object.keys(MOSSE_METEO).find(k => MOSSE_METEO[k].tipo === nuovoMeteo)];
      await di(`${etichetta} ha attivato la sua Abilità!`);
      if (msg) await di(msg.messaggio);
    }
    if (pkm.abilitaChiave === 'intimidate' && avversario && avversario.hpAttuale > 0) {
      const prima = avversario.mod.attack || 0;
      avversario.mod.attack = Math.max(-6, prima - 1);
      if (avversario.mod.attack !== prima) {
        await di(`${etichetta} intimida ${etichettaAvversario}!`);
        aggiornaPannelli();
        await frecceStat(avversario, -1);
        await di(`Attacco di ${etichettaAvversario} è diminuito!`);
      }
    }
    // Eco (trace, 20 ott 2026): copia l'Abilità dell'avversario all'ingresso
    // (una volta sola — se l'avversario non ha Abilità o ce l'ha già uguale
    // non succede nulla di visibile).
    if (pkm.abilitaChiave === 'trace' && avversario && avversario.abilitaChiave &&
        avversario.abilitaChiave !== 'trace' && avversario.hpAttuale > 0) {
      pkm.abilitaChiave = avversario.abilitaChiave;
      await di(`${etichetta} copia l'Abilità di ${etichettaAvversario} con Eco!`);
    }
    // Trasduttore (download, 20 ott 2026): confronta Difesa/Dif.Speciale
    // BASE dell'avversario ed alza l'Attacco (se la Difesa è più bassa) o
    // l'Att.Speciale (altrimenti) di 1 stadio.
    if (pkm.abilitaChiave === 'download' && avversario && avversario.hpAttuale > 0) {
      const statBassa = (avversario.difesa <= avversario.difSp) ? 'attack' : 'special-attack';
      const prima = pkm.mod[statBassa] || 0;
      pkm.mod[statBassa] = Math.max(-6, Math.min(6, prima + 1));
      if (pkm.mod[statBassa] !== prima) {
        await di(`${etichetta} attiva il Trasduttore!`);
        aggiornaPannelli();
        await frecceStat(pkm, 1);
        await di(`${STAT_NOMI[statBassa] || statBassa} di ${etichetta} è aumentato!`);
      }
    }
    // Premonizione (forewarn, 20 ott 2026): rivela la mossa più potente
    // dell'avversario (solo informativo, nessun effetto meccanico).
    if (pkm.abilitaChiave === 'forewarn' && avversario && avversario.mosse && avversario.mosse.length) {
      const piuForte = avversario.mosse.reduce((a, b) => ((b.potenza || 0) > (a.potenza || 0) ? b : a));
      if (piuForte && piuForte.potenza) {
        await di(`La Premonizione di ${etichetta} rivela: ${etichettaAvversario} conosce ${piuForte.nomeIt}!`);
      }
    }
    // Investigazione (frisk, 20 ott 2026): rivela l'oggetto dell'avversario.
    if (pkm.abilitaChiave === 'frisk' && avversario && avversario.hpAttuale > 0) {
      const nomeOgg = (avversario.oggetto && typeof OGGETTI !== 'undefined' && OGGETTI[avversario.oggetto])
        ? OGGETTI[avversario.oggetto].nome : null;
      await di(nomeOgg
        ? `${etichetta} fruga con Investigazione: ${etichettaAvversario} porta ${nomeOgg}!`
        : `${etichetta} fruga con Investigazione, ma non trova nulla.`);
    }
    // Anticipazione (anticipation, 20 ott 2026): trema se l'avversario
    // conosce una mossa superefficace contro di lui.
    if (pkm.abilitaChiave === 'anticipation' && avversario && avversario.mosse) {
      const pericolosa = avversario.mosse.some(m => {
        if (!m.potenza || !m.tipo) return false;
        try { return efficaciaConScrappy(m, avversario, pkm) > 1; } catch (e) { return false; }
      });
      if (pericolosa) await di(`${etichetta} trema per l'Anticipazione!`);
    }
  }

  // Colpo critico (0172_Battle_Move.rb/0174_Move_UsageCalculations.rb):
  // qui usiamo le regole "classiche" (pre-Gen 6, quelle di Rosso Fuoco/
  // Smeraldo — il progetto è dichiaratamente Gen 1-2-3, CLAUDE.md), non
  // quelle Gen 8 di default nel pacchetto Essentials estratto: rapporti
  // [16,8,4,3,2] (1/16 base, 1/8 per le mosse "alta probabilità di
  // critico" come Taglio/Rasoiovento) e danno ×2 (non ×1.5 come da Gen 6
  // in poi). Mancava del tutto prima: c'era il campo dati "colpo_critico_
  // alto" su alcune mosse in dati/mosse.js ma nessun codice lo leggeva.
  const RAPPORTI_CRITICO = [16, 8, 4, 3, 2];
  function tiraCritico(mossa, attaccante) {
    let stadio = (mossa.effetto === 'colpo_critico_alto') ? 1 : 0;
    // Superbotta (super-luck, 20 ott 2026): +1 stadio di rapporto critico,
    // si somma con l'alta probabilità della mossa (stesso principio dei
    // giochi veri, dove gli stadi si cumulano).
    if (attaccante && attaccante.abilitaChiave === 'super-luck') stadio += 1;
    const rapporto = RAPPORTI_CRITICO[Math.min(stadio, RAPPORTI_CRITICO.length - 1)];
    return Math.random() < 1 / rapporto;
  }

  // Mosse a pugno (iron-fist, 20 ott 2026): elenco reale delle mosse "punch"
  // disponibili alle specie ≤386 (fonte: Bulbapedia, categoria Punching moves).
  const MOSSE_PUGNO = new Set([
    'comet-punch', 'mega-punch', 'fire-punch', 'ice-punch', 'thunder-punch',
    'dizzy-punch', 'dynamic-punch', 'mach-punch', 'focus-punch', 'meteor-mash',
    'hammer-arm', 'bullet-punch',
  ]);

  function calcolaDanno(attaccante, difensore, mossa) {
    // Normalizzatore (normalize, 20 ott 2026): tutte le mosse di chi la
    // possiede diventano di tipo Normale (ai fini di STAB/efficacia/oggetti
    // potenzianti) — si ripristina il tipo vero a fine funzione, "mossa" è
    // lo stesso oggetto condiviso riusato ad ogni turno.
    const tipoOriginale = mossa.tipo;
    if (attaccante.abilitaChiave === 'normalize' && mossa.potenza > 0) mossa.tipo = 'normal';
    const _ripristinaTipo = () => { mossa.tipo = tipoOriginale; };

    let eff = efficaciaConScrappy(mossa, attaccante, difensore);
    // Mente Infranta (mold-breaker, 20 ott 2026): ignora le Abilità
    // DIFENSIVE dell'avversario (immunità di tipo, Pellespessa, Filtro...)
    // — non le abilità "reattive" (es. Pellerugginosa resta attiva). Qui
    // si usa una copia locale dell'abilità del difensore, azzerata se
    // l'attaccante ha Mente Infranta, SOLO per i controlli di immunità
    // qui sotto (le abilità vere di "difensore" non vengono toccate).
    const abilDif = (attaccante.abilitaChiave === 'mold-breaker') ? null : difensore.abilitaChiave;
    // Levitate (richiesta esplicita di Luca, 9 ott 2026 — le Abilità non
    // devono essere solo estetiche): immunità totale alle mosse Terra,
    // come nei giochi veri.
    if (mossa.tipo === 'ground' && abilDif === 'levitate') eff = 0;
    // Parafulmine/Scudofuoco (richiesta Luca, 18 ott 2026): immunità totale
    // alle mosse Elettro/Fuoco, stesso principio di Levitate.
    if (mossa.tipo === 'electric' && abilDif === 'lightning-rod') eff = 0;
    if (mossa.tipo === 'fire' && abilDif === 'flash-fire') eff = 0;
    // Assorbimone (sap-sipper, 19 ott 2026): come Scudofuoco ma per le mosse
    // Erba — niente danno E +1 Attacco, una tantum per colpo subito.
    if (mossa.tipo === 'grass' && abilDif === 'sap-sipper') {
      const prima = difensore.mod.attack || 0;
      difensore.mod.attack = Math.max(-6, Math.min(6, prima + 1));
      _ripristinaTipo();
      return { danno: 0, eff: 0, critico: false };
    }
    // Idroassorbenza (water-absorb, richiesta Luca, 18 ott 2026): niente
    // danno dalle mosse Acqua, il difensore recupera il 25% degli HP massimi.
    // "assorbito" letto dal chiamante (eseguiMossa) per curare invece di colpire.
    // Mototraente (volt-absorb, 20 ott 2026): stesso identico principio ma
    // per le mosse Elettro.
    // Pellesecca (dry-skin, 20 ott 2026): le mosse Acqua curano anch'esse
    // (stesso bonus di volt-absorb/water-absorb), ma SOLO per l'Acqua —
    // il resto di Pellesecca (danno extra da Fuoco, cura/danno a fine turno
    // da meteo) è gestito più sotto / in fineTurnoStati.
    if ((mossa.tipo === 'water' && (abilDif === 'water-absorb' || abilDif === 'dry-skin')) ||
        (mossa.tipo === 'electric' && abilDif === 'volt-absorb')) {
      _ripristinaTipo();
      return { danno: 0, eff: 0, critico: false, assorbito: true };
    }
    // Punto Debole (wonder-guard, 20 ott 2026 — SOLO Shedinja, id 292): solo
    // le mosse superefficaci infliggono danno, tutte le altre non hanno
    // alcun effetto (stesso trattamento di "eff === 0" qui sotto).
    if (abilDif === 'wonder-guard' && mossa.potenza > 0 && eff <= 1) eff = 0;
    if (eff === 0) { _ripristinaTipo(); return { danno: 0, eff: 0, critico: false }; }

    // Mosse fisiche usano Attacco/Difesa, speciali Att.Sp./Dif.Sp.
    // Applichiamo gli sbalzi di statistica (Crescita, Urlo, ecc.).
    const fisica = mossa.classe !== 'special';
    let A = fisica
      ? statEffettiva(attaccante, attaccante.attacco, 'attack')
      : statEffettiva(attaccante, attaccante.attSp, 'special-attack');
    let D = fisica
      ? statEffettiva(difensore, difensore.difesa, 'defense')
      : statEffettiva(difensore, difensore.difSp, 'special-defense');
    // Forza Bruta/Potenza Pura (huge-power/pure-power, 20 ott 2026): Attacco
    // raddoppiato (SOLO la statistica fisica, mai Att.Sp.).
    if (fisica && (attaccante.abilitaChiave === 'huge-power' || attaccante.abilitaChiave === 'pure-power')) {
      A = A * 2;
    }
    // Pellimarmo (marvel-scale, 20 ott 2026): Difesa ×1.5 se il portatore ha
    // uno stato alterato (stesso principio di Attitudine, ma in difesa).
    if (fisica && difensore.abilitaChiave === 'marvel-scale' && difensore.condizione) {
      D = D * 1.5;
    }

    // Attitudine (guts, richiesta Luca): Attacco ×1.5 se chi attacca ha uno
    // stato alterato, e NON subisce il dimezzamento da scottatura (gioca
    // comunque a piena potenza). Senza Attitudine resta la scottatura normale.
    if (fisica && attaccante.abilitaChiave === 'guts' && attaccante.condizione) {
      A = A * 1.5;
    } else if (fisica && attaccante.condizione && attaccante.condizione.tipo === 'burn') {
      A = A * 0.5;
    }
    // Fretta (hustle, richiesta Luca): +50% Attacco sulle mosse fisiche,
    // sempre (non legata a uno stato alterato, a differenza di Attitudine).
    if (fisica && attaccante.abilitaChiave === 'hustle') A = A * 1.5;
    // Forza Solare (solar-power, 19 ott 2026): +50% Attacco Speciale sotto
    // il sole (il costo in HP a fine turno è in _abilitaFineTurno).
    if (!fisica && attaccante.abilitaChiave === 'solar-power' && meteoBattaglia === 'sun') A = A * 1.5;

    // Pianta/Fuoco/Torrente/Sciame (richiesta Luca): mossa dello stesso
    // tipo dell'abilità ×1.5 quando chi attacca è sotto 1/3 degli HP massimi
    // — le 4 abilità "da starter in difficoltà".
    const BOOST_TIPO_BASSI_HP = { overgrow: 'grass', blaze: 'fire', torrent: 'water', swarm: 'bug' };
    if (attaccante.hpAttuale <= attaccante.hpMax / 3 &&
        BOOST_TIPO_BASSI_HP[attaccante.abilitaChiave] === mossa.tipo) {
      A = A * 1.5;
    }

    // Guscioprotettivo (shell-armor)/Armatura Battaglia (battle-armor,
    // 19 ott 2026, stesso identico effetto): niente colpi critici subiti.
    const SENZA_CRITICI = new Set(['shell-armor', 'battle-armor']);
    const critico = SENZA_CRITICI.has(difensore.abilitaChiave) ? false : tiraCritico(mossa, attaccante);
    // Tiro Cecchino (sniper, 19 ott 2026): sui critici il moltiplicatore è
    // ×3 invece di ×2 (anziché applicarlo sotto con "molt *= 2", qui si
    // segna solo quanto vale per quel colpo).
    const moltCritico = critico ? (attaccante.abilitaChiave === 'sniper' ? 3 : 2) : 1;

    // Formula reale (0174_Move_UsageCalculations.rb#pbCalcDamage): il
    // termine di livello va arrotondato per difetto PRIMA di moltiplicarlo
    // per potenza/attacco/difesa, non alla fine insieme al resto — prima
    // qui si perdeva un pizzico di precisione ai livelli non multipli di 5.
    const bonusSeminvulnerabile = !!mossa._bonusSeminvulnerabile;
    mossa._bonusSeminvulnerabile = false;   // letto una tantum, non deve restare attivo al turno dopo
    // Moltiplicatore extra generico (Rotolamento/Palla Rapida, vedi
    // MOSSE_ROTOLAMENTO in eseguiTurno) — stesso principio "letto una
    // tantum" del bonus seminvulnerabile qui sopra.
    const moltExtra = mossa._moltiplicatorePotenza || 1;
    mossa._moltiplicatorePotenza = 1;
    const potenzaEff = (bonusSeminvulnerabile ? mossa.potenza * 2 : mossa.potenza) * moltExtra;

    const terminelivello = Math.floor(2 * attaccante.livello / 5 + 2);
    const base = Math.floor(terminelivello * potenzaEff * A / D / 50) + 2;

    // Tutti i moltiplicatori (STAB, oggetto, meteo, critico, efficacia,
    // variazione casuale) si combinano in UN SOLO fattore, arrotondato una
    // volta sola alla fine — come fa davvero il motore (pbCalcDamageMultipliers
    // + un solo .round finale). Prima ogni moltiplicatore faceva il suo
    // Math.floor() separato, perdendo un po' di danno ad ogni passaggio
    // invece che una volta sola.
    let molt = 1;
    // Adattabilità (adaptability, 20 ott 2026): STAB ×2 invece di ×1.5.
    if (attaccante.tipi.includes(mossa.tipo)) {
      molt *= (attaccante.abilitaChiave === 'adaptability') ? 2 : 1.5; // STAB
    }
    // Tecnico (technician, 19 ott 2026): +50% sulle mosse di potenza bassa
    // (≤60, soglia vera dei giochi), PRIMA di applicare moltiplicatori extra
    // (Rotolamento ecc.) — guarda la potenza base della mossa, non potenzaEff.
    if (attaccante.abilitaChiave === 'technician' && mossa.potenza > 0 && mossa.potenza <= 60) molt *= 1.5;
    // Pugno di Ferro (iron-fist, 20 ott 2026): +20% sulle mosse a pugno.
    if (attaccante.abilitaChiave === 'iron-fist' && MOSSE_PUGNO.has(mossa.nome)) molt *= 1.2;
    // Spericolato (reckless, 20 ott 2026): +20% sulle mosse col contraccolpo
    // (stesso campo "drain" negativo già usato per Testaquadra/rock-head).
    if (attaccante.abilitaChiave === 'reckless' && mossa.drain < 0) molt *= 1.2;
    const heldAtt = attaccante.oggetto && typeof OGGETTI !== 'undefined' ? OGGETTI[attaccante.oggetto] : null;
    if (heldAtt && heldAtt.boostTipo === mossa.tipo) molt *= 1.2; // Oggetto potenziante (es. Carbonella)
    if (meteoBattaglia === 'sun') {
      if (mossa.tipo === 'fire') molt *= 1.5;
      else if (mossa.tipo === 'water') molt *= 0.5;
    } else if (meteoBattaglia === 'rain') {
      if (mossa.tipo === 'water') molt *= 1.5;
      else if (mossa.tipo === 'fire') molt *= 0.5;
    }
    // Pellesecca (dry-skin, 20 ott 2026): +25% danno dalle mosse Fuoco
    // subite (oltre alla cura dalle mosse Acqua, già gestita sopra, e al
    // tick di fine turno in fineTurnoStati).
    if (abilDif === 'dry-skin' && mossa.tipo === 'fire') molt *= 1.25;
    // Rivalità (rivalry, 20 ott 2026): +25% danno contro lo stesso genere,
    // -25% contro il genere opposto (nessun effetto se uno dei due non ha
    // genere, 'N' — specie senza sesso).
    if (attaccante.abilitaChiave === 'rivalry' && attaccante.genere && difensore.genere &&
        attaccante.genere !== 'N' && difensore.genere !== 'N') {
      molt *= (attaccante.genere === difensore.genere) ? 1.25 : 0.75;
    }
    molt *= moltCritico;
    // Pellespessa (thick-fat, 19 ott 2026): dimezza il danno subito dalle
    // mosse Fuoco e Ghiaccio, come Scudofuoco/Idroassorbenza ma senza
    // immunità totale — qui va sul moltiplicatore finale, non su "eff".
    if (abilDif === 'thick-fat' && (mossa.tipo === 'fire' || mossa.tipo === 'ice')) {
      molt *= 0.5;
    }
    molt *= eff;
    // Lente Colorata (tinted-lens, 19 ott 2026): raddoppia il danno sulle
    // mosse "non molto efficaci" (eff<1) — va DOPO aver già applicato eff,
    // altrimenti si perde il confronto con 1.
    if (attaccante.abilitaChiave === 'tinted-lens' && eff > 0 && eff < 1) molt *= 2;
    // Filtro/Roccia Solida (filter/solid-rock, 20 ott 2026): -25% danno sulle
    // mosse superefficaci (eff>1) — l'opposto di Lente Colorata.
    if ((abilDif === 'filter' || abilDif === 'solid-rock') && eff > 1) {
      molt *= 0.75;
    }
    // Riflesso/Schermoluce (20 ott 2026): dimezza il danno fisico/speciale
    // sul lato protetto, come nei giochi veri (solo lotta singola).
    const schermiDif = _schermiDiLato(difensore);
    if (schermiDif) {
      if (fisica && schermiDif.reflect > 0) molt *= 0.5;
      else if (!fisica && schermiDif.lightscreen > 0) molt *= 0.5;
    }
    molt *= 0.85 + Math.random() * 0.15; // variazione casuale

    const danno = Math.round(base * molt);
    _ripristinaTipo();
    return { danno: Math.max(1, danno), eff, critico };
  }

  /* ==========================================================
     INTERFACCIA: messaggi, barre HP, sprite
     ========================================================== */

  // Mappa Opzioni→Velocità testo su un moltiplicatore della pausa (0.6=
  // lenta, 1=normale, 1.7=veloce): si combina col booster ⏩ (x1-x5), che
  // resta un acceleratore temporaneo separato dalla preferenza persistente.
  const MOLT_VELOCITA_TESTO = { lenta: 0.6, normale: 1, veloce: 1.7 };

  // Mostra un messaggio nella casella di testo e aspetta:
  // si va avanti con un click sul messaggio, o da soli dopo una pausa.
  // La pausa è divisa per il booster di velocità (⏩ x1/x2/x3/x5):
  // a x5 i messaggi corrono via in ~un terzo di secondo.
  // senzaTimeout = true: il messaggio NON avanza da solo, resta a schermo
  // finché non lo si clicca (o non si preme [A], vedi confermaCursore più
  // sotto) — richiesta esplicita di Luca per i messaggi importanti che
  // vuole avere il tempo di leggere (es. "Pokémon ha imparato X").
  function di(testo, senzaTimeout) {
    return new Promise(resolve => {
      const el = $('battaglia-messaggio');
      el.textContent = testo;
      let fatto = false;
      const avanti = () => {
        if (fatto) return;
        fatto = true;
        el.removeEventListener('click', avanti);
        if (timer) clearTimeout(timer);
        resolve();
      };
      let timer = null;
      if (!senzaTimeout) {
        const velocita = (statoGioco && statoGioco.velocita) || 1;
        const moltTesto = (statoGioco && statoGioco.opzioni &&
          MOLT_VELOCITA_TESTO[statoGioco.opzioni.velocitaTesto]) || 1;
        timer = setTimeout(avanti, 1150 / velocita / moltTesto);
      }
      el.addEventListener('click', avanti);
    });
  }

  // Aggiorna una barra HP (larghezza + colore verde/giallo/rosso)
  // Soglie colore identiche a Essentials FRLG: verde >50%, giallo <=50%,
  // rosso <=25% (Battle_Scene_Objects.rb, non 20% come nella versione precedente).
  function aggiornaBarraHp(idBarra, hpAttuale, hpMax) {
    const barra = $(idBarra);
    const pct = Math.max(0, Math.min(100, hpAttuale / hpMax * 100));
    barra.style.width = pct + '%';
    barra.classList.remove('gialla', 'rossa');
    if (pct <= 25) barra.classList.add('rossa');
    else if (pct <= 50) barra.classList.add('gialla');
  }

  // Aggiorna tutti i pannelli informativi (nomi, livelli, HP, EXP)
  function aggiornaPannelli() {
    if (modoDoppia) { aggiornaPannelliDoppia(); return; }
    // Nemico (col tag dello stato alterato, es. " [PAR]")
    // Pallina accanto al nome se il selvatico è già tuo (richiesta di Luca,
    // 9 ott 2026): solo nei selvatici, non negli allenatori (lì conta sempre
    // nemico-contatore invece, vedi sotto).
    const giaPosseduto = modalita === 'selvatico' && statoGioco &&
      statoGioco.pokedex && statoGioco.pokedex[nemico.id] && statoGioco.pokedex[nemico.id].catturato;
    $('nemico-nome').innerHTML = nemico.nome + siglaCondizione(nemico) +
      (giaPosseduto ? ' <img src="sprites/Oggetti/icon_ball.png" alt="" style="height:1em;vertical-align:middle;">' : '');
    $('nemico-lv').textContent = 'Lv.' + nemico.livello;
    aggiornaBarraHp('nemico-hp', nemico.hpAttuale, nemico.hpMax);

    // Contatore Pokémon avversario (solo battaglie allenatore)
    const elContatore = $('nemico-contatore');
    if (elContatore) {
      if (modalita === 'allenatore' && squadraNemica.length > 1) {
        // Bug corretto 22 ott 2026 (segnalato da Luca): "sconfitto = i >=
        // rimasti" presumeva che i Pokémon scendessero in campo in ordine di
        // posizione — falso dopo uno switch dell'IA (_provaSwitchNemico, può
        // schierare qualsiasi posizione). Ogni pallina riflette ORA lo stato
        // VERO del Pokémon in quella posizione (hpAttuale <= 0), non la sua
        // posizione rispetto a indiceNemico.
        let html = '';
        for (let i = 0; i < squadraNemica.length; i++) {
          const sconfitto = squadraNemica[i] && squadraNemica[i].hpAttuale <= 0;
          html += `<img src="sprites/Oggetti/icon_ball${sconfitto ? '_faint' : ''}.png" alt="">`;
        }
        elContatore.innerHTML = html;
        elContatore.style.display = '';
      } else {
        elContatore.style.display = 'none';
      }
    }

    // Giocatore
    $('giocatore-nome').textContent = mio.nome + siglaCondizione(mio);
    $('giocatore-lv').textContent = 'Lv.' + mio.livello;
    aggiornaBarraHp('giocatore-hp', mio.hpAttuale, mio.hpMax);
    $('giocatore-hp-testo').textContent = `${mio.hpAttuale} / ${mio.hpMax}`;

    // Barra esperienza verso il prossimo livello
    const expBase = Math.pow(mio.livello, 3);
    const expProssimo = Math.pow(mio.livello + 1, 3);
    const pctExp = Math.max(0, Math.min(100,
      (mio.exp - expBase) / (expProssimo - expBase) * 100));
    $('giocatore-exp').style.width = pctExp + '%';

    // Musica di lotta "urgente" sotto il 25% HP (22 ott 2026, richiesta
    // esplicita di Luca — stesso meccanismo dei giochi veri: NON è un
    // suono a parte, è la musica di lotta che cambia in una variante più
    // tesa). Stessa soglia già usata per la barra rossa (aggiornaBarraHp,
    // pct<=25). Solo il Pokémon del GIOCATORE fa scattare il cambio, come
    // nei giochi originali — quello del nemico no.
    if (typeof Musica !== 'undefined') {
      if (mio.hpAttuale > 0 && mio.hpAttuale / mio.hpMax <= 0.25) Musica.suonaCritico();
      else Musica.fermaCritico();
    }
  }

  // Imposta gli sprite (nemico di fronte, il proprio di spalle)
  // Sposta leggermente uno sprite in base all'offset per-specie di Essentials
  // (OFFSET_SPRITE_BATTAGLIA, dati/offset_sprite_battaglia.js). Gli offset
  // originali sono tarati su sprite ~128px; scaliamo in proporzione alla
  // dimensione reale a schermo (molto più grande) del nostro sprite.
  function applicaOffsetSpecie(el, id, chiave) {
    if (typeof OFFSET_SPRITE_BATTAGLIA === 'undefined') return;
    const dati = OFFSET_SPRITE_BATTAGLIA[id];
    if (!dati || !dati[chiave]) { el.style.transform = ''; return; }
    const [ox, oy] = dati[chiave];
    if (!ox && !oy) { el.style.transform = ''; return; }
    const scala = (el.offsetWidth || 128) / 128;
    el.style.transform = `translate(${ox * scala}px, ${-oy * scala}px)`;
  }

  // nascondiSubito: quando lo sprite verrà mostrato da animaEntrataPokemon
  // (Ball → Pokémon), va nascosto SUBITO qui, prima di qualunque messaggio
  // che passi nel frattempo — altrimenti si vede lo sprite già schierato e
  // solo dopo parte l'animazione della Ball (bug segnalato da Luca).
  // Non nascondere invece nei casi senza animazione d'ingresso (es. evoluzione).
  function aggiornaSprite(nascondiSubito) {
    if (modoDoppia) { aggiornaSpriteDoppia(); return; }
    impostaSpriteConCache('nemico-sprite', nemico.sprite.fronte || '');
    impostaSpriteConCache('giocatore-sprite', mio.sprite.retro || mio.sprite.fronte || '');
    applicaOffsetSpecie($('nemico-sprite'), nemico.id, 'front');
    applicaOffsetSpecie($('giocatore-sprite'), mio.id, mio.sprite.retro ? 'back' : 'front');
    if (nascondiSubito) {
      $('nemico-sprite').style.opacity = '0';
      $('giocatore-sprite').style.opacity = '0';
    }
  }

  // Fa lampeggiare lo sprite colpito
  function lampeggia(chi) {
    const el = elementoSprite(chi);
    el.classList.remove('colpito');
    void el.offsetWidth; // trucco per riavviare l'animazione CSS
    el.classList.add('colpito');
  }

  // Tremore leggero SUL POKÉMON colpito (richiesta esplicita di Luca al
  // posto dello scuotimento di TUTTO lo schermo — "troppo accentuato e
  // avviene troppo spesso, magari sul pokemon che trema poco poco"):
  // sostituisce scuotiSchermo() a fine mossa, stesso trucco di lampeggia().
  function tremaSprite(chi) {
    const el = elementoSprite(chi);
    if (!el) return;
    el.classList.remove('trema');
    void el.offsetWidth;
    el.classList.add('trema');
  }

  /* ==========================================================
     EFFETTI VISIVI DELLE MOSSE — generici per categoria+tipo.
     Non un'animazione per ognuna delle 700+ mosse: solo 3 template
     (fisica = balzo+scossa, speciale = proiettile colorato dal tipo,
     stato = scintillio colorato sul vero bersaglio), scelti da
     mossa.classe/mossa.potenza/mossa.tipo (già letti da PokéAPI).
     ========================================================== */

  // Centro di uno sprite, in coordinate LOCALI (spazio nativo 512x384 di
  // #battaglia-schermo, PRIMA del transform:scale) — le misure vengono da
  // getBoundingClientRect (schermo REALE, già scalato), quindi si divide
  // per scalaBattagliaCorrente per tornare allo spazio locale: un elemento
  // creato con questi valori come style.left/top, appeso dentro
  // #battaglia-schermo, viene ri-scalato automaticamente dal transform del
  // genitore — usare direttamente le coordinate reali lo scalerebbe due
  // volte (bug: sprite/effetti/Ball fuori posto o rimpiccioliti sui mobile).
  function centroSprite(chi) {
    const campo = $('battaglia-schermo');
    const el = elementoSprite(chi);
    const rC = campo.getBoundingClientRect();
    const rE = el.getBoundingClientRect();
    const s = scalaBattagliaCorrente || 1;
    return {
      x: (rE.left - rC.left) / s + (rE.width / s) / 2,
      y: (rE.top - rC.top) / s + (rE.height / s) / 2,
    };
  }

  // Scala una durata (ms) col booster di velocità ⏩, come fa di()
  function durataFx(ms) {
    const velocita = (statoGioco && statoGioco.velocita) || 1;
    return Math.max(80, ms / velocita);
  }

  function scuotiSchermo() {
    const campo = $('battaglia-schermo');
    campo.classList.remove('scuoti-schermo');
    void campo.offsetWidth;
    campo.classList.add('scuoti-schermo');
  }

  // Balzo dell'attaccante verso il bersaglio (mosse fisiche): il nemico è a
  // destra e balza verso sinistra, il giocatore è a sinistra e balza verso destra.
  function lungeAttaccante(att) {
    const el = elementoSprite(att);
    const classe = latoBattler(att) === 'nemico' ? 'lunge-sx' : 'lunge-dx';
    el.classList.remove('lunge-dx', 'lunge-sx');
    void el.offsetWidth;
    el.classList.add(classe);
  }

  // Proiettile colorato dal tipo della mossa, dall'attaccante al bersaglio
  function proiettileMossa(att, dif, colore) {
    return new Promise(resolve => {
      const campo = $('battaglia-schermo');
      const da = centroSprite(att);
      const a = centroSprite(dif);
      const el = document.createElement('div');
      el.className = 'mossa-fx fx-proiettile';
      el.style.background = colore;
      el.style.boxShadow = `0 0 26px 10px ${colore}`;
      el.style.left = da.x + 'px';
      el.style.top = da.y + 'px';
      el.style.transform = 'translate(-50%, -50%)';
      campo.appendChild(el);
      const anim = el.animate(
        [
          { left: da.x + 'px', top: da.y + 'px', offset: 0 },
          { left: a.x + 'px', top: a.y + 'px', offset: 1 },
        ],
        { duration: durataFx(420), easing: 'ease-in' }
      );
      anim.onfinish = () => { el.remove(); resolve(); };
    });
  }

  // Scintillio colorato dal tipo della mossa, sopra il vero bersaglio
  // (mosse di stato/che modificano statistiche: sé stesso o l'avversario)
  function scintillioMossa(bersaglio, colore) {
    return new Promise(resolve => {
      const campo = $('battaglia-schermo');
      const c = centroSprite(bersaglio);
      const el = document.createElement('div');
      el.className = 'mossa-fx fx-stato';
      el.style.left = c.x + 'px';
      el.style.top = c.y + 'px';
      el.style.color = colore;
      const durata = durataFx(650);
      el.style.animation = `fx-stato-pulsa ${durata}ms ease-out`;
      campo.appendChild(el);
      setTimeout(() => { el.remove(); resolve(); }, durata);
    });
  }

  // Testo fluttuante generico sopra un bersaglio: usato per far VEDERE cosa
  // sta succedendo quando una mossa cambia HP (drenaggio/contraccolpo/cura)
  // o statistiche (frecce ↑/↓), oltre al messaggio di testo — richiesta
  // esplicita di Luca ("crea un'animazione o una scritta tipo quella
  // dell'exp"), sess. 16 set 2026 (punto 4).
  function testoFluttuante(bersaglio, testo, colore) {
    return new Promise(resolve => {
      const campo = $('battaglia-schermo');
      const c = centroSprite(bersaglio);
      const el = document.createElement('div');
      el.className = 'mossa-fx fx-testo';
      el.style.left = c.x + 'px';
      el.style.top = c.y + 'px';
      el.style.color = colore;
      el.textContent = testo;
      const durata = durataFx(900);
      el.style.animation = `fx-testo-fluttua ${durata}ms ease-out`;
      campo.appendChild(el);
      setTimeout(() => { el.remove(); resolve(); }, durata);
    });
  }

  // Frecce su/giù per un cambio di statistica (una freccia per stage,
  // massimo 3 per non affollare lo schermo su cambi di ±6).
  function frecceStat(bersaglio, modifica) {
    const n = Math.min(3, Math.abs(modifica));
    const freccia = modifica > 0 ? '▲'.repeat(n) : '▼'.repeat(n);
    const colore = modifica > 0 ? '#5cd65c' : '#ff5c5c';
    return testoFluttuante(bersaglio, freccia, colore);
  }

  /* ==========================================================
     ANIMAZIONI POKÉ BALL (13 agosto): mandata in campo di un Pokémon
     (esce dalla Ball e "si ingrandisce") + lancio per la cattura (Ball che
     ruota volando verso il nemico, si apre, si richiude, oscilla). Sprite
     da "Essentials FRLG/Graphics/Battle animations/":
       ball_NOME.png       → 8 frame di rotazione, celle 32x64
       ball_NOME_open.png  → 2 frame verticali 32x32 (0=chiusa, 1=apertura/flash)
     NOME = OGGETTI[chiave].img senza ".png" (es. "ULTRABALL"), stesso nome
     file usato per le icone della Ball nello zaino: coincide sempre con lo
     sheet disponibile. ========================================== */

  // Puntava dentro "Essentials FRLG/" (solo locale, esclusa da git):
  // funzionava su localhost ma era invisibile sul sito pubblico. Copiata in
  // sprites/Battle animations/ (tracciata da git) — stesso bug del
  // Pokemon Center di Borgata Tuscolana, stessa causa.
  const CARTELLA_BALL_FX = 'sprites/Battle animations/';

  function nomeFileBall(chiaveBall) {
    const img = OGGETTI[chiaveBall] && OGGETTI[chiaveBall].img;
    return img ? img.replace(/\.png$/i, '') : 'POKEBALL';
  }

  // Lancio ad arco della Ball prima che si apra (sess. 29 set 2026, fonte
  // vera: src/pokeball.c, SpriteCB_PlayerMonSendOut_1/2 — nel gioco vero la
  // Ball vola dal lanciatore fino alla posizione finale con una parabola,
  // non compare già ferma sul posto come faceva prima qui. Non replica la
  // matematica in virgola fissa della console (usa TranslateAnimHorizontalArc,
  // molto specifica del GBA), ma la stessa forma: arco su e giù, rotazione
  // durante il volo, atterraggio sul punto dove poi si apre.
  async function _lancioArcoBall(ball, cx, cy, lato) {
    // Punto di partenza: dal basso a sinistra per il proprio Pokémon (come
    // se il lancio venisse da chi gioca, in basso fuori campo), dall'alto a
    // destra per un nemico/allenatore (l'avversario è sempre lì) — stessa
    // logica di "chi lancia sta da un lato" del gioco vero.
    const partenza = lato === 'nemico'
      ? { x: cx + 90, y: cy - 120 }
      : { x: cx - 90, y: cy + 110 };
    const DURATA_MS = durataFx(420);
    const ALTEZZA_ARCO = 70; // px in spazio locale 512×384
    await new Promise(resolve => {
      const inizio = performance.now();
      function passo(ora) {
        const frac = Math.min(1, (ora - inizio) / DURATA_MS);
        const x = partenza.x + (cx - partenza.x) * frac;
        const yLineare = partenza.y + (cy - partenza.y) * frac;
        const arco = ALTEZZA_ARCO * 4 * frac * (1 - frac); // parabola: 0 agli estremi, massima a metà
        ball.style.left = x + 'px';
        ball.style.top = (yLineare - arco) + 'px';
        ball.style.transform = `translate(-50%, -50%) rotate(${frac * 620}deg)`;
        if (frac >= 1) { resolve(); return; }
        requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    });
    ball.style.transform = 'translate(-50%, -50%)';
  }

  // Mandata in campo: il Pokémon esce dalla Ball (chiusa → flash d'apertura)
  // e poi "cresce" dalla Ball fino alla sua dimensione normale. `lato` è
  // 'nemico' o 'giocatore'. Per gli incontri selvatici il nemico non ha una
  // Ball propria: appare direttamente, solo il Pokémon del giocatore la usa
  // sempre (come nei giochi originali).
  async function animaEntrataPokemon(lato, elId) {
    const el = $(elId || (lato === 'nemico' ? 'nemico-sprite' : 'giocatore-sprite'));
    const campo = $('battaglia-schermo');
    const rC = campo.getBoundingClientRect();
    const rE = el.getBoundingClientRect();
    const s = scalaBattagliaCorrente || 1;   // schermo reale → spazio locale, vedi centroSprite
    const cx = (rE.left - rC.left) / s + (rE.width / s) / 2;
    const cy = (rE.top - rC.top) / s + (rE.height / s) / 2;

    el.style.opacity = '0';

    const mostraBall = lato === 'giocatore' || modalita === 'allenatore';
    if (mostraBall) {
      // Ogni frame del foglio Ball è alto il DOPPIO della sua larghezza —
      // fonte vera: Battle::Scene::Animation::BallAnimationMixin#addBallSprite
      // (Essentials, strumenti/scripts_estratti/0193_Battle_Scene_BaseAnimation.rb):
      // "2* because each frame is twice as tall as it is wide". Sess. 30 set
      // 2026: prima l'elemento aveva altezza = larghezza (riquadro quadrato),
      // che quindi ritagliava solo la metà superiore di ogni frame — si vedeva
      // ingrandita solo la calotta rossa, come segnalato da Luca.
      // -12% (sess. 30 set) poi un altro -10% (sess. 1 ott): 0.88*0.90=0.792
      const dim = Math.round((lato === 'nemico' ? 60 : 74) * 0.792);
      const dimH = dim * 2;
      const ball = document.createElement('div');
      ball.className = 'ball-fx';
      ball.style.width = dim + 'px';
      ball.style.height = dimH + 'px';
      ball.style.left = cx + 'px';
      ball.style.top = cy + 'px';
      // Foglio di rotazione (8 frame, tutte pose di Ball chiusa che gira).
      ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_POKEBALL.png')}')`;
      ball.style.backgroundSize = `${dim * 8}px ${dimH}px`;
      ball.style.backgroundPosition = '0 0'; // frame chiusa
      campo.appendChild(ball);

      // Rotazione della Ball mentre vola (stessi 8 frame usati dal lancio di
      // cattura, vedi animaLancioBall).
      let frameEntrata = 0;
      const timerRotazioneEntrata = setInterval(() => {
        frameEntrata = (frameEntrata + 1) % 8;
        ball.style.backgroundPosition = `-${frameEntrata * dim}px 0`;
      }, durataFx(55));

      // Volo ad arco fino al punto d'arrivo (fonte vera, vedi
      // _lancioArcoBall) — PRIMA di tremolare/aprirsi, che restano identici a prima.
      await _lancioArcoBall(ball, cx, cy, lato);
      clearInterval(timerRotazioneEntrata);
      ball.style.backgroundPosition = '0 0'; // ferma su una posa chiusa

      // Scossa prima di aprirsi. Il foglio "_open" contiene UNA SOLA immagine
      // (fonte vera: numFrames = 2*larghezza/altezza = 1, dato che è già alta
      // il doppio della sua larghezza) — non c'è un secondo frame da mostrare,
      // si sostituisce solo il foglio, con un piccolo schiacciamento prima
      // (come ballOpenUp in Essentials: squish poi unsquish).
      ball.classList.add('ball-scossa');
      await new Promise(r => setTimeout(r, durataFx(380)));
      ball.classList.remove('ball-scossa');
      ball.style.transition = `transform ${durataFx(90)}ms ease-out`;
      ball.style.transform = 'translate(-50%, -50%) scaleX(1.25) scaleY(0.8)';
      await new Promise(r => setTimeout(r, durataFx(90)));
      ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_POKEBALL_open.png')}')`;
      ball.style.backgroundSize = `${dim}px ${dimH}px`;
      ball.style.backgroundPosition = '0 0'; // unica immagine del foglio "aperta"
      ball.style.transform = 'translate(-50%, -50%)';
      await new Promise(r => setTimeout(r, durataFx(120)));

      // Il Pokémon inizia a "crescere" mentre la Ball sparisce in dissolvenza
      // (sovrapposti, non in sequenza: più naturale e più vicino all'originale).
      ball.style.transition = `opacity ${durataFx(250)}ms ease-out`;
      ball.style.opacity = '0';
      await attendiSpriteCaricato(el.id);
      el.style.opacity = '';
      el.classList.remove('sprite-cresce');
      void el.offsetWidth;
      el.classList.add('sprite-cresce');
      await new Promise(r => setTimeout(r, durataFx(250)));
      ball.remove();
      await new Promise(r => setTimeout(r, durataFx(200)));
      el.classList.remove('sprite-cresce');
      return;
    }

    await attendiSpriteCaricato(el.id);
    el.style.opacity = '';
    el.classList.remove('sprite-cresce');
    void el.offsetWidth;
    el.classList.add('sprite-cresce');
    await new Promise(r => setTimeout(r, durataFx(450)));
    el.classList.remove('sprite-cresce');
  }

  // Lancio della Ball per la cattura: vola dal giocatore al nemico ruotando
  // (8 frame), si apre "risucchiando" lo sprite nemico, si richiude. Ritorna
  // l'elemento DOM della Ball, ancora sul campo, pronto per animaScossaBall/
  // animaCatturaRiuscita/animaCatturaFallita.
  async function animaLancioBall(chiaveBall) {
    const campo = $('battaglia-schermo');
    const rC = campo.getBoundingClientRect();
    const daEl = $('giocatore-sprite');
    const aEl = $('nemico-sprite');
    const rD = daEl.getBoundingClientRect();
    const rA = aEl.getBoundingClientRect();
    const s = scalaBattagliaCorrente || 1;   // schermo reale → spazio locale, vedi centroSprite
    const da = { x: (rD.left - rC.left) / s + (rD.width / s) * 0.55, y: (rD.top - rC.top) / s + (rD.height / s) * 0.35 };
    const a  = { x: (rA.left - rC.left) / s + (rA.width / s) * 0.5,  y: (rA.top - rC.top) / s + (rA.height / s) * 0.55 };

    const nome = nomeFileBall(chiaveBall);
    // -12% (sess. 30 set) poi un altro -10% (sess. 1 ott): 0.88*0.90=0.792
    const dim = Math.round(42 * 0.792);
    // Ogni frame è alto il doppio della sua larghezza (fonte vera: vedi nota
    // sess. 30 set 2026 in animaEntrataPokemon) — left/top restano il CENTRO
    // della Ball (transform), non l'angolo, altrimenti raddoppiare l'altezza
    // sposta il centro visivo verso il basso.
    const dimH = dim * 2;
    const ball = document.createElement('div');
    ball.className = 'ball-fx';
    ball.dataset.nomeBall = nome; // serve dopo ad animaCatturaFallita per tornare al foglio "_open" giusto
    ball.style.width = dim + 'px';
    ball.style.height = dimH + 'px';
    ball.style.left = da.x + 'px';
    ball.style.top = da.y + 'px';
    ball.style.transform = 'translate(-50%, -50%)';
    ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_' + nome + '.png')}')`;
    ball.style.backgroundSize = `${dim * 8}px ${dimH}px`;
    campo.appendChild(ball);

    // Rotazione dei fotogrammi mentre vola (indipendente dal volo stesso)
    let frame = 0;
    const timerRotazione = setInterval(() => {
      frame = (frame + 1) % 8;
      ball.style.backgroundPosition = `-${frame * dim}px 0`;
    }, durataFx(55));

    const volo = ball.animate([
      { left: da.x + 'px', top: da.y + 'px', offset: 0 },
      { left: (da.x + a.x) / 2 + 'px', top: Math.min(da.y, a.y) - 70 + 'px', offset: 0.5 },
      { left: a.x + 'px', top: a.y + 'px', offset: 1 },
    ], { duration: durataFx(500), easing: 'ease-in' });
    await volo.finished;
    clearInterval(timerRotazione);

    // Rimisura la posizione VERA del nemico proprio ora, a volo appena
    // finito, e ci "schiocca" sopra la Ball: il calcolo fatto a inizio
    // funzione (rA/a) può essere leggermente stantio 500ms dopo se nel
    // frattempo qualcos'altro ha spostato/ridimensionato lo sprite nemico
    // (es. un leggendario molto grande) — così la Ball atterra ESATTAMENTE
    // dove si trova il Pokémon da catturare, non dove si trovava mezzo
    // secondo prima (richiesta esplicita di Luca).
    const rA2 = aEl.getBoundingClientRect();
    const aFinale = { x: (rA2.left - rC.left) / s + (rA2.width / s) * 0.5, y: (rA2.top - rC.top) / s + (rA2.height / s) * 0.55 };
    ball.style.left = aFinale.x + 'px';
    ball.style.top = aFinale.y + 'px';

    // Il nemico viene "risucchiato" dentro la Ball
    aEl.style.transition = `opacity ${durataFx(180)}ms ease-in, transform ${durataFx(180)}ms ease-in`;
    aEl.style.opacity = '0';
    aEl.style.transform = 'scale(0.15)';

    // Il foglio "_open" contiene UNA SOLA immagine (numFrames = 2*larghezza/
    // altezza = 1, fonte vera Essentials), non 2 frame: si sostituisce il
    // foglio e basta, niente backgroundPosition da spostare.
    ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_' + nome + '_open.png')}')`;
    ball.style.backgroundSize = `${dim}px ${dimH}px`;
    ball.style.backgroundPosition = '0 0'; // flash d'apertura
    await new Promise(r => setTimeout(r, durataFx(220)));
    // Richiusa: per la posa chiusa si torna al foglio normale di rotazione.
    ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_' + nome + '.png')}')`;
    ball.style.backgroundSize = `${dim * 8}px ${dimH}px`;
    ball.style.backgroundPosition = '0 0'; // richiusa
    await new Promise(r => setTimeout(r, durataFx(160)));

    return ball;
  }

  // Una "scossa" della Ball ferma a terra (dopo il lancio), a tempo con i
  // messaggi "La Ball oscilla...".
  async function animaScossaBall(ball) {
    ball.style.animation = 'none';
    void ball.offsetWidth;
    ball.style.animation = `fx-ball-scossa ${durataFx(420)}ms ease-in-out`;
    await new Promise(r => setTimeout(r, durataFx(420)));
  }

  // Cattura riuscita: la Ball scompare (dissolvenza), il nemico non ricompare.
  async function animaCatturaRiuscita(ball) {
    ball.style.transition = `opacity ${durataFx(320)}ms ease-out`;
    ball.style.opacity = '0';
    await new Promise(r => setTimeout(r, durataFx(320)));
    ball.remove();
  }

  // Cattura fallita: la Ball si riapre (flash) e il nemico "riappare" al centro.
  async function animaCatturaFallita(ball) {
    const aEl = $('nemico-sprite');
    // La Ball ora è ferma sul foglio normale (richiusa, vedi animaLancioBall):
    // per il lampo di riapertura serve tornare al foglio "_open".
    const dim = ball.clientWidth;
    const nome = ball.dataset.nomeBall || 'POKEBALL';
    ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_' + nome + '_open.png')}')`;
    ball.style.backgroundSize = `${dim}px ${dim * 2}px`;
    ball.style.backgroundPosition = '0 0'; // il foglio "_open" ha una sola immagine
    await new Promise(r => setTimeout(r, durataFx(180)));
    ball.remove();
    aEl.style.transition = `opacity ${durataFx(220)}ms ease-out, transform ${durataFx(220)}ms ease-out`;
    aEl.style.opacity = '1';
    // 'scale(1)' da solo CANCELLAVA l'offset di posizione per-specie
    // (applicaOffsetSpecie usa lo stesso style.transform con una translate):
    // dopo un tentativo di cattura fallito, lo sprite del nemico si
    // spostava leggermente dalla sua posizione corretta. Ripristiniamo
    // l'offset vero invece di un valore fisso.
    applicaOffsetSpecie(aEl, nemico.id, 'front');
    await new Promise(r => setTimeout(r, durataFx(220)));
  }

  // RIATTIVATO (sessione 7 agosto): il problema originale era leggere OGNI
  // sheet per intero in ordine raster, mescolando mini-clip diverse impacchettate
  // nella stessa immagine. Ora `risolviAnimazioneMossa` (dati/mosse-animazioni.js)
  // mostra solo gli sheet con un campo `frames` esplicito, cioè controllati a
  // occhio uno per uno — gli altri restano inerti finché non vengono vagliati.
  const ANIMAZIONI_MOSSE_ATTIVE = true;

  // Spritesheet RPG Maker XP (griglia fissa 192x192) come effetto della mossa,
  // sopra il bersaglio. Se lo sheet ha un campo `frames` (ordine/sottoinsieme
  // di celle scelto a mano), riproduce solo quelle; altrimenti tutta la griglia
  // in ordine raster. Vedi dati/mosse-animazioni.js.
  function spritesheetMossa(sheet, bersaglio) {
    return new Promise(resolve => {
      const campo = $('battaglia-schermo');
      const c = centroSprite(bersaglio);
      const CELLA = 192;
      const scala = 1.3; // dimensione a schermo di ogni fotogramma (grande, richiesto da Luca: deve essere ben visibile)
      const dim = CELLA * scala;
      const sequenza = sheet.frames || Array.from({ length: sheet.cols * sheet.rows }, (_, i) => i);
      const fps = sheet.fps || 20;

      const el = document.createElement('div');
      el.className = 'mossa-fx fx-spritesheet';
      el.style.width = dim + 'px';
      el.style.height = dim + 'px';
      el.style.left = c.x + 'px';
      el.style.top = c.y + 'px';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.backgroundImage = `url('sprites/animazioni_mosse/${encodeURIComponent(sheet.file)}')`;
      el.style.backgroundSize = `${sheet.cols * dim}px ${sheet.rows * dim}px`;
      campo.appendChild(el);

      let i = 0;
      const passo = () => {
        const indice = sequenza[i];
        const col = indice % sheet.cols;
        const riga = Math.floor(indice / sheet.cols);
        el.style.backgroundPosition = `-${col * dim}px -${riga * dim}px`;
        i++;
        if (i >= sequenza.length) {
          el.remove();
          resolve();
          return;
        }
        setTimeout(passo, durataFx(1000 / fps));
      };
      passo();
    });
  }

  // Elemento <img> reale corrispondente a un'istanza Pokémon (giocatore o nemico).
  // In doppia usa il registro esplicito (4 battler); in singola, se l'istanza
  // non è registrata, ricade sul confronto originale con mio/nemico.
  function elementoSprite(chi) {
    return $(elementoPerBattler.get(chi) || (chi === nemico ? 'nemico-sprite' : 'giocatore-sprite'));
  }

  // 'nemico' o 'giocatore': stesso principio di elementoSprite, usato per
  // sapere in che direzione far balzare l'attaccante (lungeAttaccante) e per
  // le etichette generiche in doppia (etichettaDi).
  function latoBattler(chi) {
    return latoPerBattler.get(chi) || (chi === nemico ? 'nemico' : 'giocatore');
  }

  // Dispatcher: riproduce l'animazione precisa estratta da Pokémon Essentials
  // (dati/animazioni_mosse_essentials.js + js/animazioni-essentials.js), con
  // fallback allo scintillio/scossa schermo generico se la mossa non risulta
  // in MOSSA_ANIM_INDEX (non dovrebbe succedere: ogni mossa ha una risoluzione,
  // nel peggiore dei casi quella di Lotta Corpo a Corpo).
  async function animaMossa(att, dif, mossa) {
    const colore = TIPO_COLORI[mossa.tipo] || '#ccc';
    const versoSe = (mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field');
    const bersaglioReale = versoSe ? att : dif;

    // Opzioni → Animazioni battaglia: se disattivata, solo uno scuotimento
    // rapido dello schermo invece dell'animazione vera della mossa (utile
    // per chi fa grinding, come nei giochi veri) — nessun'altra logica
    // cambia, il danno/effetto restano identici.
    if (typeof statoGioco !== 'undefined' && statoGioco && statoGioco.opzioni &&
        statoGioco.opzioni.animazioniBattaglia === false) {
      scuotiSchermo();
      return;
    }

    if (typeof AnimazioniEssentials !== 'undefined' && AnimazioniEssentials.haAnimazione(mossa)) {
      // Rete di sicurezza (10 ott 2026, PRIORITARIO — Raffica di Vento
      // bloccava il turno per davvero, danno mai calcolato): questo await
      // non aveva MAI un try/catch, quindi un errore o un blocco dentro
      // l'animazione interrompeva l'intero turno, danno compreso.
      // AnimazioniEssentials ha già la sua rete interna (timeout 4s +
      // try/catch), ma un'altra qui non costa nulla e protegge anche da
      // problemi fuori da quel modulo.
      try {
        await AnimazioniEssentials.gioca(mossa, elementoSprite(att), elementoSprite(bersaglioReale));
      } catch (e) {
        console.error('[Battle] Errore nell\'animazione di', mossa.nome, '— turno NON bloccato:', e);
      }
      tremaSprite(bersaglioReale);
      return;
    }

    // Fallback (mossa non trovata in MOSSA_ANIM_INDEX)
    if (!mossa.potenza) {
      await scintillioMossa(bersaglioReale, colore);
      return;
    }
    if (mossa.classe === 'physical') {
      lungeAttaccante(att);
      await new Promise(r => setTimeout(r, durataFx(220)));
      tremaSprite(bersaglioReale);
      await new Promise(r => setTimeout(r, durataFx(180)));
    } else {
      await proiettileMossa(att, dif, colore);
      tremaSprite(bersaglioReale);
    }
  }

  /* ==========================================================
     MENU (principale, mosse, zaino, squadra)
     ========================================================== */

  const TUTTI_I_MENU = ['menu-principale', 'menu-mosse', 'menu-zaino', 'menu-squadra'];

  function nascondiMenu() {
    TUTTI_I_MENU.forEach(id => $(id).classList.add('nascosto'));
  }

  function mostraMenuPrincipale() {
    nascondiMenu();
    // Turno forzato: ricarica (Iper Raggio), 2° turno di una mossa a 2 turni,
    // oppure mossa di FURIA (Oltraggio & co.) ancora in corso.
    if (mio.hpAttuale > 0 && (mio.deveRicaricare || mio.inCarica || mio.furia)) {
      let forzata = mio.inCarica;
      if (!forzata && mio.furia) forzata = mio.mosse.find(m => m.nome === mio.furia.nome);
      if (!forzata) forzata = mossaFallback();
      setTimeout(() => turnoCompleto(forzata), 60);
      return;
    }
    $('battaglia-messaggio').textContent = `Cosa deve fare ${mio.nome}?`;
    $('menu-principale').classList.remove('nascosto');
    resetCursore();
  }

  function mostraMenuMosse() {
    nascondiMenu();
    const menu = $('menu-mosse');
    menu.innerHTML = '';

    const tutteScariche = mio.mosse.every(m => m.pp <= 0);

    mio.mosse.forEach((mossa, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-mossa';
      btn.innerHTML =
        `<span class="mossa-nome">${mossa.nomeIt}</span>` +
        `<span class="tipo-badge" style="background:${TIPO_COLORI[mossa.tipo] || '#888'}">${TIPO_NOMI[mossa.tipo] || mossa.tipo}</span>` +
        `<span class="mossa-pp">PP ${mossa.pp}/${mossa.ppMax}</span>`;
      btn.disabled = mossa.pp <= 0;
      btn.addEventListener('click', () => { _ultimoCursoreMosse = idx; turnoCompleto(mossa); });
      menu.appendChild(btn);
    });

    // Se tutti i PP sono finiti, resta solo "Scontro" (come nei giochi)
    if (tutteScariche) {
      const btn = document.createElement('button');
      btn.className = 'btn-mossa';
      btn.innerHTML = `<span class="mossa-nome">Scontro</span><span class="mossa-pp">PP ∞</span>`;
      btn.addEventListener('click', () => turnoCompleto(mossaFallback()));
      menu.appendChild(btn);
    }

    menu.appendChild(bottoneIndietro());
    menu.classList.remove('nascosto');
    impostaCursore(_ultimoCursoreMosse);
  }

  function mostraMenuZaino() {
    nascondiMenu();
    const menu = $('menu-zaino');
    menu.innerHTML = '';

    // In battaglia si usano Ball, Pozioni/cure di stato (ora anche sui
    // Pokémon in riserva, non solo quello in campo — richiesta di Luca, 6
    // ott 2026) e X Item (statistiche temporanee).
    let almenoUno = false;
    for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
      if (!['ball', 'cura', 'xitem', 'curastato', 'curatotale', 'revive'].includes(oggetto.categoria)) continue;
      const quanti = statoGioco.zaino[chiave] || 0;
      if (quanti <= 0) continue;
      almenoUno = true;
      const btn = document.createElement('button');
      btn.innerHTML = `${oggetto.icona} ${oggetto.nome} <span class="mossa-pp">×${quanti}</span>`;
      btn.addEventListener('click', () => {
        if (oggetto.categoria === 'ball') tentaCattura(chiave);
        else if (oggetto.categoria === 'xitem') usaXItem(chiave);
        else mostraMenuSquadraOggetto(chiave); // cura/curastato/curatotale/revive: scegli il bersaglio
      });
      menu.appendChild(btn);
    }

    if (!almenoUno) {
      const vuoto = document.createElement('button');
      vuoto.className = 'btn-mossa';
      vuoto.disabled = true;
      vuoto.innerHTML = '<span class="mossa-nome">Zaino vuoto (Ball/Pozioni/X Item)</span>';
      menu.appendChild(vuoto);
    }

    menu.appendChild(bottoneIndietro());
    menu.classList.remove('nascosto');
    resetCursore();
  }

  // obbligatorio = true quando il Pokémon in campo è KO e BISOGNA cambiarlo
  function mostraMenuSquadra(obbligatorio) {
    nascondiMenu();
    const menu = $('menu-squadra');
    menu.innerHTML = '';

    statoGioco.squadra.forEach((pkm, idx) => {
      const btn = document.createElement('button');
      const stato = pkm.hpAttuale <= 0 ? ' (KO)' : (idx === indiceAttivo ? ' (in campo)' : '');
      btn.innerHTML =
        `<span class="mossa-nome">${pkm.nome}${stato}</span>` +
        `<span class="mossa-pp">Lv.${pkm.livello} · ${pkm.hpAttuale}/${pkm.hpMax} HP</span>`;
      btn.disabled = pkm.hpAttuale <= 0 || idx === indiceAttivo;
      btn.addEventListener('click', () => cambiaPokemon(idx, obbligatorio));
      menu.appendChild(btn);
    });

    if (!obbligatorio) menu.appendChild(bottoneIndietro());
    menu.classList.remove('nascosto');
    resetCursore();
  }

  function bottoneIndietro() {
    const btn = document.createElement('button');
    btn.className = 'btn-indietro';
    btn.textContent = '↩ Indietro';
    btn.addEventListener('click', mostraMenuPrincipale);
    return btn;
  }

  /* ==========================================================
     CURSORE DA TASTIERA/[A] (richiesta esplicita di Luca: niente mouse
     obbligatorio in battaglia — le frecce spostano un cursore fra i
     pulsanti del pannello visibile, [A]/Invio clicca quello selezionato,
     [B] torna indietro se il pannello ha un pulsante "Indietro"). Non serve
     toccare ogni funzione che ricostruisce i menu: bastano queste poche
     funzioni pubbliche richiamate da app.js (premiA/premiB/tasti freccia) e
     una chiamata a resetCursore() a fine di ognuna delle mostraMenu*.
     ========================================================== */
  let cursoreIdx = 0;
  // Memoria del cursore sul menu Mosse (richiesta esplicita di Luca, 10 ott
  // 2026): se scegli la 3ª mossa, al turno dopo il cursore deve ripartire
  // già sulla 3ª invece che tornare sempre alla 1ª — solo per il menu
  // Mosse, gli altri menu (Zaino/Pokémon/principale) continuano a
  // ripartire da 0 come prima.
  let _ultimoCursoreMosse = 0;

  function _pannelloVisibile() {
    return document.querySelector('#battaglia-console .menu-battaglia:not(.nascosto)');
  }
  function _bottoniCursore() {
    const pannello = _pannelloVisibile();
    if (!pannello) return [];
    return Array.from(pannello.querySelectorAll('button:not(:disabled)'));
  }
  function _ridisegnaCursore() {
    const bottoni = _bottoniCursore();
    bottoni.forEach((b, i) => b.classList.toggle('cursore', i === cursoreIdx));
  }
  function resetCursore() {
    cursoreIdx = 0;
    _ridisegnaCursore();
  }
  function impostaCursore(idx) {
    const bottoni = _bottoniCursore();
    cursoreIdx = (idx >= 0 && idx < bottoni.length) ? idx : 0;
    _ridisegnaCursore();
  }
  function spostaCursore(dx, dy) {
    const bottoni = _bottoniCursore();
    if (!bottoni.length) return;
    if (cursoreIdx >= bottoni.length) cursoreIdx = 0;
    const r0 = bottoni[cursoreIdx].getBoundingClientRect();
    const cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    let migliore = -1, distMin = Infinity;
    bottoni.forEach((b, i) => {
      if (i === cursoreIdx) return;
      const r = b.getBoundingClientRect();
      const bx = r.left + r.width / 2, by = r.top + r.height / 2;
      const ddx = bx - cx, ddy = by - cy;
      if (dx !== 0 && (ddx === 0 || Math.sign(ddx) !== Math.sign(dx))) return;
      if (dy !== 0 && (ddy === 0 || Math.sign(ddy) !== Math.sign(dy))) return;
      const principale   = dx !== 0 ? Math.abs(ddx) : Math.abs(ddy);
      const trasversale   = dx !== 0 ? Math.abs(ddy) : Math.abs(ddx);
      const dist = principale + trasversale * 2; // penalizza gli scarti laterali
      if (dist < distMin) { distMin = dist; migliore = i; }
    });
    if (migliore >= 0) { cursoreIdx = migliore; _ridisegnaCursore(); }
  }
  // Riquadro statistiche al level-up (vedi mostraSchermataLevelUp): mentre è
  // aperto, [A] non deve cliccare il cursore dei menu sotto — fa avanzare
  // QUESTO invece. _levelUpRisolvi è la funzione che sblocca la Promise in
  // attesa, impostata da mostraSchermataLevelUp e azzerata subito dopo l'uso.
  let _levelUpRisolvi = null;
  function confermaCursore() {
    if (_levelUpRisolvi) { const r = _levelUpRisolvi; _levelUpRisolvi = null; r(); return; }
    const bottoni = _bottoniCursore();
    if (bottoni[cursoreIdx]) { bottoni[cursoreIdx].click(); return; }
    // Nessun menu a schermo (solo il messaggio, es. "Pikachu usa Tuononda!"
    // o "ha imparato X"): [A] fa avanzare QUELLO — stesso click a cui
    // risponde già di(), così su mobile/tastiera non serve per forza il
    // mouse anche qui.
    const msg = $('battaglia-messaggio');
    if (msg) msg.click();
  }
  function indietroCursore() {
    const pannello = _pannelloVisibile();
    const indietro = pannello && pannello.querySelector('.btn-indietro');
    if (indietro) indietro.click();
  }

  /* ==========================================================
     SVOLGIMENTO DEI TURNI
     ========================================================== */

  // Etichetta del nemico nei messaggi ("Pidgey selvatico" / "Roselia avversario")
  function etichettaNemico() {
    return `${nemico.nome} ${modalita === 'selvatico' ? 'selvatico' : 'avversario'}`;
  }

  // Applica uno stato alterato al bersaglio (se possibile)
  async function applicaStato(bersaglio, tipoStato, etichetta, causatore, etichettaCausatore) {
    // Salvaguardia (20 ott 2026): blocca qualsiasi stato/confusione inflitto
    // da QUALCUN ALTRO sul lato protetto (non blocca mai un Pokémon che
    // si addormenta/avvelena/confonde da solo, es. Riposo — "causatore"
    // assente o diverso dal bersaglio).
    const schermiBers = _schermiDiLato(bersaglio);
    if (schermiBers && schermiBers.safeguard > 0 && causatore !== bersaglio) {
      await di(`${etichetta} è protetto dalla Salvaguardia!`);
      return;
    }
    // CONFUSIONE (sess. 13 ott 2026, bug segnalato da Luca: non si attivava
    // MAI): è uno stato VOLATILE separato (bersaglio.confusione), non uno dei
    // 5 STATI "maggiori" — prima di questo fix mosse come Confusione/
    // Supersuono/Sguardo Languido arrivavano qui con tipoStato:'confusion' e
    // uscivano subito al controllo "STATI[tipoStato]" senza fare nulla.
    // Può coesistere con un altro stato maggiore (paralisi+confusione è
    // normale), quindi bypassa il controllo "ne ha già uno".
    if (tipoStato === 'confusion') {
      if (bersaglio.abilitaChiave === 'own-tempo') {
        await di(`${etichetta} non si lascia confondere!`);
        return;
      }
      if (bersaglio.confusione > 0) {
        await di(`Ma ${etichetta} è già confuso!`);
        return;
      }
      bersaglio.confusione = 2 + Math.floor(Math.random() * 3);   // 2-4 turni
      aggiornaPannelli();
      await di(`${etichetta} è confuso!`);
      return;
    }
    if (!STATI[tipoStato]) return;            // stato non gestito: ignora
    if (bersaglio.condizione) {               // ne ha già uno
      await di(`Ma ${etichetta} ha già un problema di stato!`);
      return;
    }
    if (immuneAStato(bersaglio, tipoStato)) {
      await di(`Non ha effetto su ${etichetta}!`);
      return;
    }
    // Sonno (richiesta esplicita di Luca, 9 ott 2026): non più durata fissa
    // sorteggiata all'inizio — ai primi 2 turni il Pokémon ha il 50% di
    // probabilità di svegliarsi, al 3° turno si sveglia SEMPRE. turniDormito
    // conta i turni già dormiti (vedi puoAgire).
    bersaglio.condizione = { tipo: tipoStato, turni: 0, turniDormito: 0 };
    aggiornaPannelli();
    await di(`${etichetta} è ${STATI[tipoStato].nome}!`);

    // Sincronizzazione (synchronize, 19 ott 2026): veleno/paralisi/scottatura
    // ricevuti tornano indietro su chi li ha causati — non sonno/congelamento
    // (regola vera dei giochi). "causatore" manca sulle abilità di contatto
    // (Statica/Velenopunto/Corpofiamma, già gestite a parte più sopra).
    const STATI_SINCRONIZZABILI = new Set(['poison', 'paralysis', 'burn']);
    if (bersaglio.abilitaChiave === 'synchronize' && STATI_SINCRONIZZABILI.has(tipoStato) &&
        causatore && causatore !== bersaglio && causatore.hpAttuale > 0 &&
        !causatore.condizione && !immuneAStato(causatore, tipoStato)) {
      causatore.condizione = { tipo: tipoStato, turni: 0, turniDormito: 0 };
      aggiornaPannelli();
      await di(`${etichettaCausatore || 'Il rivale'} è stato "sincronizzato" e ${STATI[tipoStato].nome.toLowerCase()} pure lui!`);
    }
  }

  // Mosse "damage-lower" che però abbassano le PROPRIE statistiche (non quelle
  // del bersaglio) dopo aver colpito — stesso bug di Nitrocarica ma al contrario:
  // su PokéAPI hanno "categoria" = "damage-lower" ESATTAMENTE come Rockfrana/
  // Attacco d'Ira/Spaccaroccia (che invece abbassano il bersaglio, comportamento
  // di default corretto) — serve quindi un elenco esplicito, non si distingue
  // dal solo campo "categoria" (censimento richiesto da Luca, 6 ott 2026).
  const MOSSE_AUTOABBASSANO = new Set([
    'superpower', 'close-combat', 'overheat', 'draco-meteor',
    'psycho-boost', 'v-create', 'hammer-arm',
  ]);

  // Applica i cambi di statistica al bersaglio giusto (se stesso o avversario)
  async function applicaCambiStat(att, dif, mossa, etichettaAtt, etichettaDif) {
    // Le mosse con bersaglio "user" modificano CHI le usa (Crescita, Danza Spada…).
    // Le mosse "damage-raise" (Nitrocarica, Pugno Aumento, Testasasso…)
    // danneggiano l'AVVERSARIO (bersaglio="selected-pokemon" su PokéAPI) ma il
    // cambio statistica è SEMPRE sull'utente — "bersaglio" lì descrive solo
    // il danno, non il cambiStat. Senza questo controllo Nitrocarica alzava
    // la Velocità del NEMICO invece che la propria (bug segnalato da Luca).
    // Stesso discorso, ma al contrario, per Troppoforte/Vampata/Meteora di
    // Draco & co. (MOSSE_AUTOABBASSANO sopra): abbassano l'ATTACCANTE anche
    // se "bersaglio" è l'avversario.
    // ATTENZIONE: PokéAPI usa il TRATTINO ("damage-raise"), non il "+" — un
    // precedente fix (6 ott 2026) aveva scritto 'damage+raise' per errore,
    // quindi il confronto non scattava MAI e Nitrocarica alzava ancora la
    // Velocità del nemico (bug risegnalato da Luca, verificato live su
    // PokéAPI: /api/v2/move/flame-charge → meta.category.name = "damage-raise").
    const versoSe = (mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field' ||
                     mossa.categoria === 'damage-raise' ||
                     MOSSE_AUTOABBASSANO.has(mossa.nome));
    const obiettivo = versoSe ? att : dif;
    const etich = versoSe ? etichettaAtt : etichettaDif;

    for (const c of mossa.cambiStat) {
      if (obiettivo.mod[c.stat] === undefined) continue; // statistica non gestita
      // Corpochiaro/Nebbiabianca/Forbiciforti (richiesta Luca, 18 ott 2026):
      // bloccano le riduzioni di statistica causate dall'AVVERSARIO (non le
      // proprie, es. Danza Spada che abbassa la Difesa di chi la usa resta valida).
      if (!versoSe && c.modifica < 0) {
        const abil = obiettivo.abilitaChiave;
        if (abil === 'clear-body' || abil === 'white-smoke') {
          await di(`${etich} non si lascia abbassare le statistiche!`);
          continue;
        }
        if (abil === 'hyper-cutter' && c.stat === 'attack') {
          await di(`${etich} protegge il suo Attacco!`);
          continue;
        }
        // Occhioveglia (keen-eye, 19 ott 2026): la Precisione non si può
        // mai abbassare, a prescindere da chi lo fa.
        if (abil === 'keen-eye' && c.stat === 'accuracy') {
          await di(`${etich} protegge la sua Precisione!`);
          continue;
        }
      }
      // Semplice (simple, 20 ott 2026): raddoppia QUALSIASI variazione di
      // statistica sul portatore, sia in positivo che in negativo.
      const modificaEff = (obiettivo.abilitaChiave === 'simple') ? c.modifica * 2 : c.modifica;
      const prima = obiettivo.mod[c.stat];
      obiettivo.mod[c.stat] = Math.max(-6, Math.min(6, prima + modificaEff));
      const nome = STAT_NOMI[c.stat] || c.stat;
      if (obiettivo.mod[c.stat] === prima) {
        await di(`${nome} di ${etich} non può cambiare ancora!`);
      } else if (modificaEff > 0) {
        await frecceStat(obiettivo, modificaEff);
        await di(`${nome} di ${etich} ${modificaEff >= 2 ? 'è aumentato molto!' : 'è aumentato!'}`);
      } else {
        await frecceStat(obiettivo, modificaEff);
        await di(`${nome} di ${etich} ${modificaEff <= -2 ? 'è diminuito molto!' : 'è diminuito!'}`);
      }
      // Agonismo (competitive, 20 ott 2026): se l'AVVERSARIO ti abbassa una
      // statistica, l'Att.Speciale sale di 2 stadi (oltre al calo normale,
      // non invece di esso).
      if (!versoSe && modificaEff < 0 && obiettivo.abilitaChiave === 'competitive' &&
          obiettivo.mod[c.stat] !== prima) {
        const primaSpa = obiettivo.mod['special-attack'] || 0;
        obiettivo.mod['special-attack'] = Math.max(-6, Math.min(6, primaSpa + 2));
        if (obiettivo.mod['special-attack'] !== primaSpa) {
          await frecceStat(obiettivo, 2);
          await di(`L'Agonismo di ${etich} fa salire molto l'Att. Speciale!`);
        }
      }
    }
    aggiornaPannelli();
  }

  // Tiro di precisione, tenendo conto degli sbalzi di Precisione/Elusione
  function colpisce(att, dif, mossa) {
    // Seminvulnerabilità (Volo/Fossa/Sub/Rimbalzo, sess. 13 ott 2026): il
    // bersaglio non è raggiungibile da NESSUNA mossa mentre è in aria/
    // sottoterra/immerso — unica eccezione reale, Terremoto/Magnitudo
    // colpiscono comunque chi è sottoterra con Fossa, a potenza raddoppiata
    // (il raddoppio è letto una tantum da calcolaDanno e poi azzerato qui).
    if (dif.seminvulnerabile) {
      if (dif.seminvulnerabile === 'dig' && MOSSE_ANTI_FOSSA.has(mossa.nome)) {
        mossa._bonusSeminvulnerabile = true;
        return true;
      }
      return false;
    }
    // Insonorizzato (soundproof, 19 ott 2026): immune a QUALUNQUE mossa
    // sonora (danno o stato) — controllato qui così blocca anche le mosse
    // di stato pure (Ninnananna/Ipnoshock/Rombo…), non solo quelle con danno.
    if (dif.abilitaChiave === 'soundproof' && MOSSE_SONORE.has(mossa.nome)) return false;
    // No Guard (richiesta Luca, 18 ott 2026): nessuna mossa manca mai, da
    // nessuno dei due lati, se uno dei due Pokémon in campo ce l'ha.
    if (att.abilitaChiave === 'no-guard' || dif.abilitaChiave === 'no-guard') return true;
    if (mossa.precisione === null || mossa.precisione === undefined) return true; // colpisce sempre
    const acc = moltiplicatoreStage(att.mod.accuracy || 0);
    const eva = moltiplicatoreStage(dif.mod.evasion || 0);
    let soglia = mossa.precisione * (acc / eva);
    // Polvere Abbaglio: rende il portatore più difficile da colpire
    if (dif.oggetto === 'polvere_abbaglio') soglia *= 0.9;
    // Occhioveglia (sand-veil, richiesta Luca): più difficile da colpire
    // nella tempesta di sabbia.
    if (dif.abilitaChiave === 'sand-veil' && meteoBattaglia === 'sandstorm') soglia *= 0.8;
    // Manto Nevoso (snow-cloak, 20 ott 2026): stesso principio di Occhioveglia
    // ma con la grandine.
    if (dif.abilitaChiave === 'snow-cloak' && meteoBattaglia === 'hail') soglia *= 0.8;
    // Fretta (hustle): contropartita del +50% Attacco, -20% precisione sulle
    // mosse fisiche di chi la possiede.
    if (att.abilitaChiave === 'hustle' && mossa.classe !== 'special') soglia *= 0.8;
    // Insettocchio (compound-eyes, 20 ott 2026): +30% precisione sulle mosse
    // di chi la possiede (non tocca le mosse a precisione infinita, già
    // filtrate sopra con "return true").
    if (att.abilitaChiave === 'compound-eyes') soglia *= 1.3;
    // Passogoffo (tangled-feet, 20 ott 2026): +33% elusione (soglia più bassa
    // per chi attacca) quando il difensore è confuso.
    if (dif.abilitaChiave === 'tangled-feet' && dif.condizione && dif.condizione.tipo === 'confusion') {
      soglia *= 0.67;
    }
    return Math.random() * 100 <= soglia;
  }

  // Esegue una singola mossa di "att" contro "dif".
  // Gestisce PP, precisione, danno+efficacia (offensive), stati ed
  // effetti statistici (mosse di stato pure e secondari delle offensive).
  // Quante volte colpisce una mossa multi-colpo (Doppio Calcio, Attacco
  // Furia, Spilloscuro, Barrage, Graffio Furia, Schiaffeggio, Osso
  // Boomerang, Lancia Spine, Rafficaneve, Scarica Proiettili…). Fonte dati:
  // PokéAPI meta.min_hits/max_hits (riduciMossa in pokeapi.js). Mosse a
  // colpo fisso (min===max, es. Doppio Calcio sempre 2) restituiscono quel
  // numero; quelle "2-5" (Attacco Furia ecc.) usano la distribuzione VERA
  // delle gen. 3-4 (verificata su Bulbapedia): 2 e 3 colpi 37,5% ciascuno,
  // 4 e 5 colpi 12,5% ciascuno — non equiprobabile.
  function _numeroColpi(mossa, attaccante) {
    const min = mossa.minColpi, max = mossa.maxColpi;
    if (!min || !max || max <= 1) return 1;
    if (min === max) return min;
    // Mentelegata (skill-link, 20 ott 2026): le mosse multi-colpo vanno
    // SEMPRE al massimo di colpi possibile.
    if (attaccante && attaccante.abilitaChiave === 'skill-link') return max;
    if (min === 2 && max === 5) {
      const r = Math.random() * 100;
      if (r < 37.5) return 2;
      if (r < 75)   return 3;
      if (r < 87.5) return 4;
      return 5;
    }
    // Intervallo diverso da "2-5" (non previsto fra le mosse reali ≤386,
    // ma per sicurezza): distribuzione uniforme nell'intervallo dichiarato.
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  async function eseguiMossa(att, dif, mossa, etichettaAtt, etichettaDif, giaCaricata, opzioni) {
    opzioni = opzioni || {};
    // "silenzioso" = seconda (o successiva) risoluzione di una mossa ad area
    // già annunciata/scalata sui PP per il primo bersaglio (vedi eseguiMossaMultiBersaglio).
    if (!opzioni.silenzioso) {
      // I PP si consumano al turno di carica, non al turno del colpo (giaCaricata).
      // Pressione (pressure, richiesta Luca, 18 ott 2026): chi la usa contro
      // il portatore paga 2 PP invece di 1. "dif" può essere un array
      // (mossa ad area in doppia): basta che UNO dei bersagli vivi l'abbia.
      if (!giaCaricata && mossa.pp !== undefined && mossa.pp < 900) {
        const bersagliPressione = Array.isArray(dif) ? dif : [dif];
        const conPressione = bersagliPressione.some(b => b && b.hpAttuale > 0 && b.abilitaChiave === 'pressure');
        mossa.pp = Math.max(0, mossa.pp - (conPressione ? 2 : 1));
      }
      await di(`${etichettaAtt} usa ${mossa.nomeIt}!`);
    }

    // Il colpo a vuoto si controlla PRIMA dell'animazione: se manca, niente
    // effetto visivo, solo il messaggio (richiesta esplicita utente). Per le
    // mosse multi-colpo la precisione si controlla UNA sola volta per tutta
    // la sequenza (fonte: Bulbapedia — "even if the move has decreased
    // accuracy, it will not miss on any of the hits after the first"): se
    // il primo colpo va a segno, tutti i successivi vanno a segno di sicuro,
    // cambia solo quanti sono.
    if (!colpisce(att, dif, mossa)) {
      await di('...ma il colpo è andato a vuoto!');
      return;
    }

    // Mangiasogni: funziona SOLO se il bersaglio è addormentato (regola dei
    // giochi originali, bug segnalato da Luca — prima colpiva chiunque).
    if (mossa.nome === 'dream-eater' && (!dif.condizione || dif.condizione.tipo !== 'sleep')) {
      await di(`Ma ${etichettaDif} non sta dormendo!`);
      return;
    }

    const numColpi = _numeroColpi(mossa, att);
    let colpiAndati = 0;
    let ultimoEff = 1;
    let ultimoDanno = 0;

    for (let colpo = 1; colpo <= numColpi; colpo++) {
      if (dif.hpAttuale <= 0) break;

      await animaMossa(att, dif, mossa);

      // MOD 6B: se il bersaglio si è protetto (Protezione/Individuazione),
      // niente effetto — blocca anche i colpi successivi della sequenza.
      if (dif.protetto) {
        await di(`${etichettaDif} si protegge dal colpo!`);
        break;
      }

      // --- MOSSA OFFENSIVA (ha potenza) ---
      if (!(mossa.potenza && mossa.potenza > 0)) break; // mossa di stato: niente ciclo, esce subito

      let { danno, eff, critico, assorbito } = calcolaDanno(att, dif, mossa);
      // Idroassorbenza (water-absorb): niente danno, il difensore recupera
      // il 25% HP massimi — gli effetti secondari della mossa non scattano
      // (colpiAndati resta 0, stessa logica di "mossa senza effetto").
      if (assorbito) {
        const guarigione = Math.max(1, Math.round(dif.hpMax * 0.25));
        const primaHp = dif.hpAttuale;
        dif.hpAttuale = Math.min(dif.hpMax, dif.hpAttuale + guarigione);
        aggiornaPannelli();
        await testoFluttuante(dif, `+${dif.hpAttuale - primaHp}`, '#5cd65c');
        await di(`${etichettaDif} assorbe l'acqua e recupera energia!`);
        break;
      }
      if (eff === 0) {
        await di(`Non ha alcun effetto su ${etichettaDif}!`);
        break;
      }
      // Mossa ad area che colpisce più bersagli nello stesso turno: danno
      // ridotto (regola Essentials per le mosse "all-opponents"/"both-opponents").
      if (opzioni.fattoreDanno && opzioni.fattoreDanno !== 1) {
        danno = Math.max(1, Math.round(danno * opzioni.fattoreDanno));
      }
      if (critico) await di('Un colpo critico!');
      // Cinghia/Benda Focus: sopravvive con 1 HP a un colpo altrimenti letale
      const eraPieno = dif.hpAttuale >= dif.hpMax;
      let sopravvive = false;
      if (danno >= dif.hpAttuale) {
        if (dif.oggetto === 'cinghia_focus' && eraPieno) {
          sopravvive = true;
          dif.oggetto = null; // si consuma con l'uso
          await di(`${etichettaDif} si aggrappa con la Cinghia Focus!`);
        } else if (dif.oggetto === 'benda_focus' && Math.random() < 0.1) {
          sopravvive = true;
          await di(`${etichettaDif} si aggrappa con la Benda Focus!`);
        } else if (dif.abilitaChiave === 'sturdy' && eraPieno) {
          // Tenacia (sturdy, richiesta Luca, 18 ott 2026): sopravvive a 1 HP
          // a un colpo altrimenti letale, se era a HP pieni. Versione
          // semplificata (Gen 5+): qui non esistono mosse OHKO (Fissure/
          // Guillottina/Supergelo) da gestire come caso separato.
          sopravvive = true;
          await di(`${etichettaDif} resiste all'attacco grazie alla Tenacia!`);
        }
      }
      dif.hpAttuale = sopravvive ? 1 : Math.max(0, dif.hpAttuale - danno);
      colpiAndati += 1;
      ultimoEff = eff;
      ultimoDanno = danno;
      lampeggia(dif);
      aggiornaPannelli();
      // Abilità di contatto del difensore (Statica/Velenopunto/Corpofiamma):
      // 30% di stato a chi attacca con una mossa fisica, se può ancora
      // combattere e non ha già un problema di stato.
      const statoContatto = ABILITA_CONTATTO_STATO[dif.abilitaChiave];
      if (statoContatto && mossa.classe !== 'special' && att.hpAttuale > 0 &&
          !att.condizione && Math.random() < 0.3) {
        await applicaStato(att, statoContatto, etichettaAtt);
      }
      // Spora (effect-spore, 20 ott 2026): come sopra ma a scelta fra 3 stati
      // (10% ciascuno sul contatto, invece di un 30% su un solo stato).
      const statiContattoMulti = ABILITA_CONTATTO_STATO_MULTI[dif.abilitaChiave];
      if (statiContattoMulti && mossa.classe !== 'special' && att.hpAttuale > 0 &&
          !att.condizione && Math.random() < 0.3) {
        const scelto = statiContattoMulti[Math.floor(Math.random() * statiContattoMulti.length)];
        await applicaStato(att, scelto, etichettaAtt);
      }
      // Pellerugginosa (rough-skin, 20 ott 2026): 1/8 degli HP massimi di
      // contraccolpo a chi colpisce per contatto (mossa fisica).
      if (dif.abilitaChiave === 'rough-skin' && mossa.classe !== 'special' && att.hpAttuale > 0) {
        const dannoRS = Math.max(1, Math.floor(att.hpMax / 8));
        att.hpAttuale = Math.max(0, att.hpAttuale - dannoRS);
        lampeggia(att);
        aggiornaPannelli();
        await di(`${etichettaAtt} è ferito dalla Pellerugginosa di ${etichettaDif}!`);
      }
      // Cambio Colore (color-change, 20 ott 2026): il difensore diventa del
      // tipo della mossa che l'ha appena colpito (se è ancora in gioco).
      if (dif.hpAttuale > 0 && dif.abilitaChiave === 'color-change' && mossa.tipo &&
          !(dif.tipi.length === 1 && dif.tipi[0] === mossa.tipo)) {
        dif.tipi = [mossa.tipo];
        aggiornaPannelli();
        await di(`${etichettaDif} cambia tipo: ora è di tipo ${(typeof TIPO_NOMI !== 'undefined' && TIPO_NOMI[mossa.tipo]) || mossa.tipo}!`);
      }
      // Punto Collera (anger-point, 20 ott 2026): un colpo critico subito fa
      // salire l'Attacco al massimo (+6 stadi) in un colpo solo.
      if (dif.hpAttuale > 0 && dif.abilitaChiave === 'anger-point' && critico) {
        const prima = dif.mod.attack || 0;
        dif.mod.attack = 6;
        if (dif.mod.attack !== prima) {
          aggiornaPannelli();
          await di(`Il Punto Collera di ${etichettaDif} fa salire l'Attacco al massimo!`);
        }
      }
      // Timido (rattled, 19 ott 2026): +1 Velocità se colpito da una mossa
      // Coleottero/Buio/Spettro, a prescindere da chi l'ha usata.
      if (dif.hpAttuale > 0 && dif.abilitaChiave === 'rattled' &&
          ['bug', 'dark', 'ghost'].includes(mossa.tipo)) {
        const prima = dif.mod.speed || 0;
        dif.mod.speed = Math.max(-6, Math.min(6, prima + 1));
        if (dif.mod.speed !== prima) {
          aggiornaPannelli();
          await di(`${etichettaDif} si agita, la sua Velocità aumenta!`);
        }
      }
      // Armatura Debole (weak-armor, 19 ott 2026): -1 Difesa / +1 Velocità
      // quando subisce una mossa FISICA (qualunque, non solo contatto).
      if (dif.hpAttuale > 0 && dif.abilitaChiave === 'weak-armor' && mossa.classe !== 'special') {
        const primaDef = dif.mod.defense || 0, primaVel = dif.mod.speed || 0;
        dif.mod.defense = Math.max(-6, Math.min(6, primaDef - 1));
        dif.mod.speed = Math.max(-6, Math.min(6, primaVel + 1));
        aggiornaPannelli();
        await di(`L'Armatura Debole di ${etichettaDif} si spezza: Difesa giù, Velocità su!`);
      }
      // Efficacia mostrata una volta sola per sequenza multi-colpo (come il
      // gioco vero: "Colpito N volte!" + efficacia, non ripetuta a ogni colpo).
      if (numColpi === 1) {
        if (eff > 1) await di('È superefficace!');
        else if (eff < 1) await di('Non è molto efficace...');
      }

      // Drenaggio/contraccolpo per-colpo (Assorbimento/Giga Prosciugo/
      // Doppia Sfida…): nessuna mossa multi-colpo reale (≤386) ha drain,
      // ma se mai capitasse si applica a ogni colpo andato a segno, non
      // solo alla fine — coerente con come agiscono gli altri effetti qui.
      if (mossa.drain && danno > 0) {
        const variazione = Math.max(1, Math.round(danno * Math.abs(mossa.drain) / 100));
        // Liquidoozio (liquid-ooze, 20 ott 2026): il drenaggio si ritorce
        // contro chi attacca, invece di curare, se il difensore lo possiede.
        if (mossa.drain > 0 && dif.abilitaChiave === 'liquid-ooze') {
          att.hpAttuale = Math.max(0, att.hpAttuale - variazione);
          lampeggia(att);
          aggiornaPannelli();
          await testoFluttuante(att, `-${variazione}`, '#ff5c5c');
          await di(`Il Liquidoozio di ${etichettaDif} fa male a ${etichettaAtt}!`);
        } else if (mossa.drain > 0) {
          const primaHp = att.hpAttuale;
          att.hpAttuale = Math.min(att.hpMax, att.hpAttuale + variazione);
          const recuperati = att.hpAttuale - primaHp;
          if (recuperati > 0) {
            aggiornaPannelli();
            await testoFluttuante(att, `+${recuperati}`, '#5cd65c');
            await di(`${etichettaAtt} ha drenato energia da ${etichettaDif}!`);
          }
        } else if (att.abilitaChiave !== 'rock-head') {
          // Testaquadra (rock-head, richiesta Luca): niente contraccolpo, punto.
          att.hpAttuale = Math.max(0, att.hpAttuale - variazione);
          lampeggia(att);
          aggiornaPannelli();
          await testoFluttuante(att, `-${variazione}`, '#ff5c5c');
          await di(`${etichettaAtt} subisce il contraccolpo!`);
        }
      }
      if (att.hpAttuale <= 0) break; // contraccolpo/autodistruzione nel mezzo della sequenza
    }

    if (numColpi > 1 && colpiAndati > 0) {
      await di(`Colpito ${colpiAndati} volt${colpiAndati === 1 ? 'a' : 'e'}!`);
      if (ultimoEff > 1) await di('È superefficace!');
      else if (ultimoEff < 1 && ultimoEff > 0) await di('Non è molto efficace...');
    }

    // Era una mossa OFFENSIVA (ha potenza): qualunque sia stato l'esito del
    // ciclo sopra (colpita/protetta/senza effetto/KO), qui finisce — non
    // deve MAI cadere nella sezione "mossa di stato" sotto (bug reale
    // evitato: prima bastava controllare "colpiAndati>0", ma una mossa
    // offensiva protetta al primo colpo ha colpiAndati=0 e sarebbe potuta
    // scivolare lì sotto, applicando stato/statistiche anche da protetta).
    if (mossa.potenza && mossa.potenza > 0) {
      if (dif.hpAttuale <= 0 || colpiAndati === 0) return; // KO, protetta o senza effetto: niente effetti secondari

      // Effetto di stato secondario (es. 30% di paralisi): controllato una
      // volta sola dopo tutta la sequenza, non per ogni colpo (coerente col
      // gioco vero — es. Spilloscuro controlla l'avvelenamento una volta,
      // dopo entrambi i colpi, non due volte).
      // ATTENZIONE: su PokéAPI una probabilità di 0 NON significa "non
      // succede mai" — significa "non è una percentuale, succede sempre"
      // (stessa convenzione già usata sotto per le mosse di STATO pure, es.
      // riga ~1721). Prima qui mancava: Troppoforte/Vampata/Meteora di Draco
      // (cambiStatProbabilita=0 su PokéAPI = sempre) non riducevano MAI le
      // statistiche di chi le usa — bug segnalato da Luca, 6 ott 2026.
      // Polvere Scudo (shield-dust, 20 ott 2026): il portatore ignora gli
      // effetti SECONDARI delle mosse subite (non il danno, solo stato/
      // cambiStat qui sotto).
      const senzaEffettiSecondari = dif.abilitaChiave === 'shield-dust';
      // Grazianidea (serene-grace, 20 ott 2026): raddoppia la probabilità
      // di QUALSIASI effetto secondario delle mosse di chi la possiede.
      const moltProbSecondaria = att.abilitaChiave === 'serene-grace' ? 2 : 1;
      if (!senzaEffettiSecondari && mossa.statoEffetto && (STATI[mossa.statoEffetto] || mossa.statoEffetto === 'confusion') &&
          (mossa.statoEffetto === 'confusion' || !dif.condizione) &&
          (mossa.statoProbabilita === 0 || Math.random() * 100 < mossa.statoProbabilita * moltProbSecondaria)) {
        await applicaStato(dif, mossa.statoEffetto, etichettaDif, att, etichettaAtt);
      }
      // Cambio di statistiche secondario
      if (!senzaEffettiSecondari && mossa.cambiStat && mossa.cambiStat.length > 0 &&
          (mossa.cambiStatProbabilita === 0 || Math.random() * 100 < mossa.cambiStatProbabilita * moltProbSecondaria)) {
        await applicaCambiStat(att, dif, mossa, etichettaAtt, etichettaDif);
      }
      return;
    }

    // --- MOSSA DI STATO (niente potenza): applica solo l'effetto ---
    let qualcosa = false;
    if (MOSSE_METEO[mossa.nome]) {
      qualcosa = true;
      const info = MOSSE_METEO[mossa.nome];
      meteoBattaglia = info.tipo;
      meteoBattagliaTurni = 5;
      aggiornaMeteoUI();
      await di(info.messaggio);
    }
    // Riflesso/Schermoluce/Salvaguardia (20 ott 2026): proteggono il lato di
    // chi le usa (att), 5 turni, come il meteo qui sopra. Sostituiscono lo
    // schermo se già attivo (non si somma, come nei giochi veri).
    if (mossa.nome === 'reflect' || mossa.nome === 'light-screen' || mossa.nome === 'safeguard') {
      const schermiAtt = _schermiDiLato(att);
      if (schermiAtt) {
        qualcosa = true;
        const chiave = mossa.nome === 'reflect' ? 'reflect' : mossa.nome === 'light-screen' ? 'lightscreen' : 'safeguard';
        schermiAtt[chiave] = 5;
        const MSG_SCHERMO = { reflect: 'Riflesso attenua i colpi fisici!', lightscreen: 'Schermoluce attenua i colpi speciali!', safeguard: 'Il team è protetto dagli stati alterati!' };
        await di(MSG_SCHERMO[chiave]);
      }
    }
    if (mossa.statoEffetto && (STATI[mossa.statoEffetto] || mossa.statoEffetto === 'confusion')) {
      qualcosa = true;
      // Mosse come Riposo hanno bersaglio "user": lo stato va a chi la usa,
      // non all'avversario (bug corretto punto 4, sess. 16 set 2026 — prima
      // "dif" era fisso, ignorando mossa.bersaglio).
      const versoSe = (mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field');
      const obiettivoStato = versoSe ? att : dif;
      const etichObiettivo = versoSe ? etichettaAtt : etichettaDif;
      // Per le mosse di stato pure la probabilità API è 0 = effetto garantito
      const prob = mossa.statoProbabilita > 0 ? mossa.statoProbabilita : 100;
      if (Math.random() * 100 < prob) await applicaStato(obiettivoStato, mossa.statoEffetto, etichObiettivo, att, etichettaAtt);
      else await di('...ma non ha funzionato!');
    }
    if (mossa.cambiStat && mossa.cambiStat.length > 0) {
      qualcosa = true;
      await applicaCambiStat(att, dif, mossa, etichettaAtt, etichettaDif);
    }
    // Cura pura (Rilassamento, Riposo, Morso di Luna…): mossa.healing è la
    // % di HP MASSIMI da PokéAPI meta.healing, sempre verso chi la usa.
    if (mossa.healing && mossa.healing > 0) {
      qualcosa = true;
      if (att.hpAttuale >= att.hpMax) {
        await di(`${etichettaAtt} ha già HP pieni!`);
      } else {
        const variazione = Math.max(1, Math.round(att.hpMax * mossa.healing / 100));
        const primaHp = att.hpAttuale;
        att.hpAttuale = Math.min(att.hpMax, att.hpAttuale + variazione);
        aggiornaPannelli();
        await testoFluttuante(att, `+${att.hpAttuale - primaHp}`, '#5cd65c');
        await di(`${etichettaAtt} recupera energia!`);
      }
    }
    if (!qualcosa) await di('...ma non succede nulla!');
  }

  // Variante di eseguiMossa per le mosse ad area (doppia): risolve la STESSA
  // mossa contro più bersagli in sequenza. Messaggio "usa X!" e consumo PP
  // una volta sola (primo bersaglio), le risoluzioni successive sono
  // "silenziose"; con 2+ bersagli ancora vivi si applica la riduzione di
  // danno ×0.75 delle mosse ad area (regola Essentials).
  async function eseguiMossaMultiBersaglio(att, bersagli, mossa, etichettaAtt, etichetteDif, giaCaricata) {
    const vivi = bersagli.filter(b => b.hpAttuale > 0);
    if (vivi.length === 0) return;
    const fattoreDanno = vivi.length >= 2 ? 0.75 : 1;
    for (let i = 0; i < vivi.length; i++) {
      const dif = vivi[i];
      if (dif.hpAttuale <= 0) continue; // può essere già KO da un bersaglio precedente
      const idxOriginale = bersagli.indexOf(dif);
      const etichettaDif = etichetteDif[idxOriginale] || dif.nome;
      await eseguiMossa(att, dif, mossa, etichettaAtt, etichettaDif, giaCaricata, {
        silenzioso: i > 0, fattoreDanno,
      });
    }
  }

  // Può "att" agire questo turno? Gestisce sonno, congelamento e paralisi.
  // Restituisce false se salta il turno.
  async function puoAgire(att, etichetta) {
    const c = att.condizione;
    if (!c) return true;

    if (c.tipo === 'sleep') {
      // Richiesta esplicita di Luca (18 ott 2026): probabilità di sveglia
      // crescente turno per turno invece di un 50/50 fisso — 1°:25%, 2°:35%,
      // 3°:45%, 4°:70%, 5°:100% (garantita).
      const SOGLIE_RISVEGLIO = [0.25, 0.35, 0.45, 0.70, 1.0];
      const turno = (c.turniDormito || 0) + 1;   // turno di sonno che sta per tentare
      // Mattiniero (early-bird, 19 ott 2026): usa la soglia come se fossero
      // già passati il doppio dei turni di sonno veri (ma il contatore
      // salvato resta quello reale, altrimenti raddoppierebbe ad ogni turno).
      const turnoSoglia = att.abilitaChiave === 'early-bird' ? turno * 2 : turno;
      const soglia = SOGLIE_RISVEGLIO[Math.min(turnoSoglia, SOGLIE_RISVEGLIO.length) - 1];
      const sveglia = Math.random() < soglia;
      if (sveglia) {
        att.condizione = null;
        aggiornaPannelli();
        await di(`${etichetta} si è svegliato!`);
        return true;
      }
      c.turniDormito = turno;
      await di(`${etichetta} sta dormendo profondamente...`);
      return false;
    }

    if (c.tipo === 'freeze') {
      if (Math.random() < 0.20) { // 20% di scongelarsi
        att.condizione = null;
        aggiornaPannelli();
        await di(`${etichetta} si è scongelato!`);
        return true;
      }
      await di(`${etichetta} è congelato: non riesce a muoversi!`);
      return false;
    }

    if (c.tipo === 'paralysis' && Math.random() < 0.25) { // 25% bloccato
      await di(`${etichetta} è paralizzato! Non riesce a muoversi!`);
      return false;
    }
    return true;
  }

  // Un "turno" di un combattente: ricarica → può agire? → carica/colpo
  async function eseguiTurno(att, dif, mossa, etichettaAtt, etichettaDif) {
    // MOD 6B: la propria protezione vale solo per la mossa avversaria
    // successiva, quindi scade all'inizio del proprio turno.
    att.protetto = false;

    // 1) Ricarica obbligatoria (es. Iper Raggio): salta il turno
    if (att.deveRicaricare) {
      att.deveRicaricare = false;
      await di(`${etichettaAtt} deve ricaricare!`);
      return;
    }

    // Pigrizia (truant, 20 ott 2026): agisce un turno su due, a prescindere
    // da tutto il resto — stesso principio della ricarica sopra, ma
    // alternato invece che una tantum (flag che si inverte ogni turno).
    if (att.abilitaChiave === 'truant') {
      if (att._truantOzia) {
        att._truantOzia = false;
        await di(`${etichettaAtt} ozia per la Pigrizia!`);
        return;
      }
      att._truantOzia = true;
    }

    if (!(await puoAgire(att, etichettaAtt))) return;

    // MOD 6B: CONFUSIONE — può ferirsi da solo e saltare la mossa
    if (att.confusione && att.confusione > 0) {
      att.confusione -= 1;
      if (att.confusione <= 0) {
        att.confusione = 0;
        await di(`${etichettaAtt} non è più confuso!`);
      } else {
        await di(`${etichettaAtt} è confuso!`);
        if (Math.random() < 0.33) {
          const dC = Math.floor((2 * att.livello / 5 + 2) * 40 * att.attacco / Math.max(1, att.difesa) / 50) + 2;
          att.hpAttuale = Math.max(0, att.hpAttuale - dC);
          lampeggia(att);
          aggiornaPannelli();
          await di(`${etichettaAtt} si è ferito nella sua stessa confusione!`);
          return;
        }
      }
    }

    // MOD 6B: PROTEZIONE (mossa di stato speciale) — successo decrescente se ripetuta
    if (MOSSE_PROTEZIONE.has(mossa.nome)) {
      if (mossa.pp !== undefined && mossa.pp < 900) mossa.pp = Math.max(0, mossa.pp - 1);
      const cons = att.protConsecutivi || 0;
      if (Math.random() < Math.pow(0.5, cons)) {
        att.protetto = true;
        att.protConsecutivi = cons + 1;
        await di(`${etichettaAtt} si protegge!`);
      } else {
        att.protConsecutivi = 0;
        await di('Ma il colpo è andato a vuoto!');
      }
      return;
    }
    att.protConsecutivi = 0;   // ogni altra mossa azzera la catena di protezioni

    // 2) Mosse a due turni: turno 1 carica (niente danno), turno 2 colpisce
    const inCaricaQuesta = att.inCarica && att.inCarica.nome === mossa.nome;
    if (MOSSE_DUE_TURNI[mossa.nome] && !inCaricaQuesta) {
      att.inCarica = mossa;
      if (MOSSE_SEMINVULNERABILI.has(mossa.nome)) att.seminvulnerabile = mossa.nome;
      if (mossa.pp !== undefined && mossa.pp < 900) mossa.pp = Math.max(0, mossa.pp - 1);
      await di(`${etichettaAtt} ${MOSSE_DUE_TURNI[mossa.nome]}!`);
      return;
    }
    if (inCaricaQuesta) { att.inCarica = null; att.seminvulnerabile = null; }

    // Sess. 18 ott 2026 (richiesta esplicita di Luca) — Divinazione/Doom
    // Desire: niente danno subito, il colpo (calcolato ORA) arriva 2 turni
    // dopo su chi sarà in campo allora (vedi attacchiRitardati/fineTurnoStati).
    if (MOSSE_RITARDATE.has(mossa.nome)) {
      if (mossa.pp !== undefined && mossa.pp < 900) mossa.pp = Math.max(0, mossa.pp - 1);
      const bersaglioCalc = Array.isArray(dif) ? dif.find(b => b && b.hpAttuale > 0) : dif;
      await di(`${etichettaAtt} intravede il futuro!`);
      if (bersaglioCalc) {
        const { danno } = calcolaDanno(att, bersaglioCalc, mossa);
        const latoColpito = latoBattler(att) === 'giocatore' ? 'nemico' : 'giocatore';
        attacchiRitardati.push({ turni: 2, danno, nomeMossa: mossa.nome, nomeAttaccante: etichettaAtt, latoColpito });
      }
      return;
    }

    // Rotolamento/Palla Rapida: potenza ×2 a ogni uso consecutivo della
    // stessa mossa (max ×16 al 5° colpo), azzerata cambiando mossa.
    if (MOSSE_ROTOLAMENTO.has(mossa.nome)) {
      const stessaMossa = att.rotolamento && att.rotolamento.nome === mossa.nome;
      const turno = stessaMossa ? Math.min(att.rotolamento.turno + 1, 4) : 0;
      att.rotolamento = { nome: mossa.nome, turno };
      mossa._moltiplicatorePotenza = Math.pow(2, turno);
    } else if (att.rotolamento) {
      att.rotolamento = null;   // ha usato un'altra mossa: la catena si interrompe
    }

    // MOD 6B: FURIA — alla prima esecuzione blocca il Pokémon per 2-3 turni
    if (MOSSE_FURIA[mossa.nome] && !(att.furia && att.furia.nome === mossa.nome)) {
      att.furia = { nome: mossa.nome, turni: 2 + Math.floor(Math.random() * 2) };
    }

    // Umidità (damp, 19 ott 2026): niente Autodistruzione/Esplosione sul
    // campo se QUALCUNO in campo (di entrambi i lati) ce l'ha — generico
    // per singola e doppia, legge tutti gli attivi invece di "dif" (che in
    // doppia può essere solo una parte del campo).
    if (MOSSE_AUTODISTRUZIONE.has(mossa.nome)) {
      const campoAttivo = modoDoppia
        ? [...doppiaMieiAttivi, ...doppiaNemiciAttivi].filter(Boolean)
        : [mio, nemico].filter(Boolean);
      const bagnafuoco = campoAttivo.find(p => p.hpAttuale > 0 && p.abilitaChiave === 'damp');
      if (bagnafuoco) {
        await di(`Umidità di ${bagnafuoco.nome} impedisce l'esplosione!`);
        return;
      }
    }

    // In doppia, "dif" può essere un array di bersagli (mossa ad area): la
    // riga sotto smista alla variante multi-bersaglio senza toccare il resto
    // di questa funzione (usata identica da entrambi i motori).
    if (Array.isArray(dif)) {
      await eseguiMossaMultiBersaglio(att, dif, mossa, etichettaAtt, etichettaDif, inCaricaQuesta);
    } else {
      await eseguiMossa(att, dif, mossa, etichettaAtt, etichettaDif, inCaricaQuesta);
    }

    // MOD 6B: fine della FURIA → confusione per la stanchezza
    if (att.furia && att.furia.nome === mossa.nome) {
      att.furia.turni -= 1;
      const finita = att.furia.turni <= 0;
      // La furia continua anche se l'avversario sviene (vs allenatori): si scioglie
      // solo quando finiscono i turni o se chi la usa va KO.
      if (finita || att.hpAttuale <= 0) {
        att.furia = null;
        if (finita && att.hpAttuale > 0) {
          att.confusione = 2 + Math.floor(Math.random() * 3); // 2-4 turni
          await di(`${etichettaAtt} è confuso per la stanchezza!`);
        }
      }
    }

    // MOD 6B: AUTODISTRUZIONE — chi la usa sviene dopo aver colpito
    if (MOSSE_AUTODISTRUZIONE.has(mossa.nome) && att.hpAttuale > 0) {
      att.hpAttuale = 0;
      lampeggia(att);
      aggiornaPannelli();
      await di(`${etichettaAtt} si è sacrificato nell'esplosione!`);
    }
    // Memento (20 ott 2026): sviene sempre, anche se l'abbassamento delle
    // statistiche è stato bloccato da un'Abilità (Corpochiaro/Forbiciforti...).
    if (MOSSE_AUTOSACRIFICIO.has(mossa.nome) && att.hpAttuale > 0) {
      att.hpAttuale = 0;
      lampeggia(att);
      aggiornaPannelli();
      await di(`${etichettaAtt} si è sacrificato con Memento!`);
    }

    // 3) Mosse a ricarica (Iper Raggio & co.): il prossimo turno salterà.
    // Vale anche se l'avversario è andato KO (es. vs allenatori): basta che
    // chi la usa sia ancora vivo.
    if (MOSSE_RICARICA.has(mossa.nome) && att.hpAttuale > 0) {
      att.deveRicaricare = true;
    }
  }

  // Danni di fine turno da Sabbia/Grandine (1/16 HP max, tipi immuni esclusi),
  // più il conto alla rovescia del meteo (5 turni se impostato da mossa; un
  // numero grande se ereditato dalla mappa, di fatto per tutta la battaglia).
  // Cielo Sereno/Serrasaracinesca (cloud-nine/air-lock, 20 ott 2026): mentre
  // sono in campo, niente danno da tempesta di sabbia/grandine (il resto
  // dei bonus meteo — Nuotafrode, Pioggiabeneficio, ecc. — resta attivo,
  // semplificazione accettata per un'abilità che tocca 2-3 specie su 386).
  function _meteoNeutralizzata() {
    return (mio.hpAttuale > 0 && (mio.abilitaChiave === 'cloud-nine' || mio.abilitaChiave === 'air-lock')) ||
           (nemico.hpAttuale > 0 && (nemico.abilitaChiave === 'cloud-nine' || nemico.abilitaChiave === 'air-lock'));
  }
  async function fineTurnoMeteo() {
    if (!meteoBattaglia) return;
    if ((meteoBattaglia === 'sandstorm' || meteoBattaglia === 'hail') && !_meteoNeutralizzata()) {
      const nomeMeteo = meteoBattaglia === 'sandstorm' ? 'tempesta di sabbia' : 'grandine';
      const lista = [[mio, mio.nome], [nemico, etichettaNemico()]];
      for (const [ist, etich] of lista) {
        if (ist.hpAttuale <= 0) continue;
        const immune = meteoBattaglia === 'sandstorm'
          ? (ist.tipi.includes('rock') || ist.tipi.includes('ground') || ist.tipi.includes('steel'))
          : ist.tipi.includes('ice');
        // Riparo Magico (magic-guard, richiesta Luca, 18 ott 2026): immune a
        // TUTTI i danni indiretti (meteo, veleno/scottatura — vedi sotto).
        if (immune || ist.abilitaChiave === 'magic-guard') continue;
        const danno = Math.max(1, Math.floor(ist.hpMax / 16));
        ist.hpAttuale = Math.max(0, ist.hpAttuale - danno);
        lampeggia(ist);
        aggiornaPannelli();
        await di(`${etich} è colpito dalla ${nomeMeteo}!`);
      }
    }
    meteoBattagliaTurni -= 1;
    if (meteoBattagliaTurni <= 0) {
      const era = meteoBattaglia;
      meteoBattaglia = null;
      meteoBattagliaTurni = 0;
      aggiornaMeteoUI();
      if (METEO_FINE_MSG[era]) await di(METEO_FINE_MSG[era]);
    }
  }

  // Danni di fine turno da veleno e scottatura (1/8 degli HP massimi),
  // più la cura passiva dei Rimasugli (1/16 degli HP massimi)
  async function fineTurnoStati() {
    await fineTurnoMeteo();
    // Scadenza di Riflesso/Schermoluce/Salvaguardia (20 ott 2026), 5 turni
    // come il meteo: nessun messaggio di scadenza nei giochi veri, quindi
    // niente messaggio qui — solo il contatore che torna a 0.
    for (const sch of [schermiMio, schermiNemico]) {
      for (const chiave of ['reflect', 'lightscreen', 'safeguard']) {
        if (sch[chiave] > 0) sch[chiave] -= 1;
      }
    }
    const lista = [[mio, mio.nome], [nemico, etichettaNemico()]];
    for (const [ist, etich] of lista) {
      if (ist.hpAttuale <= 0 || !ist.condizione || ist.abilitaChiave === 'magic-guard') continue;
      if (ist.condizione.tipo === 'poison' || ist.condizione.tipo === 'burn') {
        const quantita = Math.max(1, Math.floor(ist.hpMax / 8));
        // Guarveleno (poison-heal, 20 ott 2026): il veleno CURA invece di
        // danneggiare (non tocca la scottatura, resta normale).
        if (ist.condizione.tipo === 'poison' && ist.abilitaChiave === 'poison-heal') {
          ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + quantita);
          aggiornaPannelli();
          await di(`${etich} recupera HP grazie al Guarveleno!`);
        } else {
          ist.hpAttuale = Math.max(0, ist.hpAttuale - quantita);
          lampeggia(ist);
          aggiornaPannelli();
          const causa = ist.condizione.tipo === 'poison' ? 'dal veleno' : 'dalla scottatura';
          await di(`${etich} è tormentato ${causa}!`);
        }
      }
    }
    for (const [ist, etich] of lista) {
      if (ist.hpAttuale <= 0 || ist.hpAttuale >= ist.hpMax) continue;
      if (ist.oggetto !== 'rimasugli') continue;
      const cura = Math.max(1, Math.floor(ist.hpMax / 16));
      ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + cura);
      aggiornaPannelli();
      await di(`${etich} recupera un po' di HP grazie ai Rimasugli! 🍂`);
    }
    await _abilitaFineTurno(lista);
    await _elaboraAttacchiRitardati(
      () => (mio.hpAttuale > 0 ? { ist: mio, etichetta: mio.nome } : null),
      () => (nemico.hpAttuale > 0 ? { ist: nemico, etichetta: etichettaNemico() } : null),
    );
  }

  // Abilità che scattano a FINE TURNO (richiesta Luca, 18 ott 2026),
  // generica per singola e doppia: `lista` = [[istanza, etichetta], ...].
  //  - Scattosuccessivo (speed-boost): +1 Velocità ogni turno in campo.
  //  - Metamorfosi (shed-skin): 30% di guarire da sé da uno stato alterato.
  //  - Idratazione (hydration): guarisce da uno stato alterato SEMPRE sotto la pioggia.
  // Previsione (forecast, 20 ott 2026 — SOLO Castform, id 351): il tipo
  // segue il meteo. Chiamata ogni fine turno (stesso principio delle
  // abilità sopra), così si adegua anche se il meteo cambia mentre è in campo.
  const TIPO_DA_METEO_FORECAST = { sun: 'fire', rain: 'water', hail: 'ice' };
  function _aggiornaForecast(ist) {
    if (ist.abilitaChiave !== 'forecast') return;
    const nuovoTipo = TIPO_DA_METEO_FORECAST[meteoBattaglia] || 'normal';
    if (!(ist.tipi.length === 1 && ist.tipi[0] === nuovoTipo)) ist.tipi = [nuovoTipo];
  }
  async function _abilitaFineTurno(lista) {
    for (const [ist, etich] of lista) {
      if (ist.hpAttuale <= 0) continue;
      _aggiornaForecast(ist);
      if (ist.abilitaChiave === 'speed-boost') {
        const prima = ist.mod.speed || 0;
        ist.mod.speed = Math.max(-6, Math.min(6, prima + 1));
        if (ist.mod.speed !== prima) {
          aggiornaPannelli();
          await di(`La Velocità di ${etich} aumenta!`);
        }
      }
      if (ist.condizione) {
        const guarisce = (ist.abilitaChiave === 'shed-skin' && Math.random() < 0.3) ||
          (ist.abilitaChiave === 'hydration' && meteoBattaglia === 'rain');
        if (guarisce) {
          ist.condizione = null;
          aggiornaPannelli();
          await di(`${etich} si è curato da solo!`);
        }
      }
      // Pioggiabeneficio (rain-dish, 19 ott 2026): 1/16 HP max sotto la pioggia.
      if (ist.abilitaChiave === 'rain-dish' && meteoBattaglia === 'rain' && ist.hpAttuale < ist.hpMax) {
        const cura = Math.max(1, Math.floor(ist.hpMax / 16));
        ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + cura);
        aggiornaPannelli();
        await di(`${etich} recupera HP grazie a Pioggiabeneficio! 🌧️`);
      }
      // Corpogelo (ice-body, 19 ott 2026): stesso principio ma sotto la grandine.
      if (ist.abilitaChiave === 'ice-body' && meteoBattaglia === 'hail' && ist.hpAttuale < ist.hpMax) {
        const cura = Math.max(1, Math.floor(ist.hpMax / 16));
        ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + cura);
        aggiornaPannelli();
        await di(`${etich} recupera HP grazie a Corpogelo! ❄️`);
      }
      // Forza Solare (solar-power, 19 ott 2026): +50% Att.Speciale sotto il
      // sole (calcolaDanno), ma perde 1/8 HP max ogni turno di sole.
      if (ist.abilitaChiave === 'solar-power' && meteoBattaglia === 'sun' && ist.hpAttuale > 0) {
        const danno = Math.max(1, Math.floor(ist.hpMax / 8));
        ist.hpAttuale = Math.max(0, ist.hpAttuale - danno);
        aggiornaPannelli();
        await di(`${etich} è prosciugato dalla Forza Solare!`);
      }
      // Pellesecca (dry-skin, 20 ott 2026): 1/8 HP max di cura sotto la
      // pioggia, 1/8 HP max di danno sotto il sole (il resto — cura dalle
      // mosse Acqua, danno extra da Fuoco — è in calcolaDanno).
      if (ist.abilitaChiave === 'dry-skin' && ist.hpAttuale > 0) {
        if (meteoBattaglia === 'rain' && ist.hpAttuale < ist.hpMax) {
          const cura = Math.max(1, Math.floor(ist.hpMax / 8));
          ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + cura);
          aggiornaPannelli();
          await di(`${etich} recupera HP grazie a Pellesecca! 🌧️`);
        } else if (meteoBattaglia === 'sun') {
          const danno = Math.max(1, Math.floor(ist.hpMax / 8));
          ist.hpAttuale = Math.max(0, ist.hpAttuale - danno);
          aggiornaPannelli();
          await di(`${etich} è prosciugato dal sole per via di Pellesecca!`);
        }
      }
    }
  }

  // Fa scattare le mosse "ritardate" (Divinazione/Doom Desire) il cui
  // contatore è arrivato a 0 — generica per singola e doppia: ciascun
  // motore passa due funzioni che restituiscono { ist, etichetta } per il
  // bersaglio attuale sul lato giocatore/nemico (null se nessuno vivo lì).
  async function _elaboraAttacchiRitardati(trovaMio, trovaNemico) {
    for (let i = attacchiRitardati.length - 1; i >= 0; i--) {
      const a = attacchiRitardati[i];
      a.turni -= 1;
      if (a.turni > 0) continue;
      attacchiRitardati.splice(i, 1);
      const bersaglio = a.latoColpito === 'giocatore' ? trovaMio() : trovaNemico();
      if (!bersaglio) {
        await di(`${a.nomeAttaccante} ha mancato col futuro: non c'è nessuno da colpire!`);
        continue;
      }
      await di(`La premonizione di ${a.nomeAttaccante} si abbatte su ${bersaglio.etichetta}!`);
      bersaglio.ist.hpAttuale = Math.max(0, bersaglio.ist.hpAttuale - a.danno);
      lampeggia(bersaglio.ist);
      aggiornaPannelli();
    }
  }

  // Sceglie una mossa a caso tra quelle con PP per una qualunque istanza
  // (usata sia dal nemico singolo sotto, sia dai 2 avversari della doppia).
  function sceglieMossaCasuale(ist) {
    if (ist.inCarica) return ist.inCarica;   // deve completare la mossa a 2 turni
    if (ist.furia) return ist.mosse.find(m => m.nome === ist.furia.nome) || mossaFallback(); // MOD 6B
    const utilizzabili = ist.mosse.filter(m => m.pp > 0);
    return utilizzabili.length
      ? utilizzabili[Math.floor(Math.random() * utilizzabili.length)]
      : mossaFallback();
  }

  // IA dell'allenatore (richiesta di Luca, 6 ott 2026: "sembra non farmi
  // danno, facciamola attaccare un po' di più"): prima scegliva una mossa
  // a caso fra tutte quelle con PP, status comprese — risultato, con 2
  // mosse offensive e 2 di stato su 4, metà delle volte non faceva danno
  // per niente. Ora pesa le mosse offensive per danno atteso (potenza ×
  // efficacia di tipo × STAB) e le fa pescare più spesso, ma non sceglie
  // SEMPRE la migliore: resta una scelta pesata random, non un calcolo
  // perfetto, altrimenti diventerebbe un avversario "risolto" e prevedibile.
  function scegliMossaNemico() {
    // IA dedicata a Mewtwo (scontro finale del Bunkerino, richiesta esplicita
    // di Luca, 12 ott 2026) — Mewtwo (id 150) non è mai la squadra di nessun
    // altro allenatore in questo gioco, quindi questo controllo per ID basta
    // a isolarla senza bisogno di flag aggiuntivi. Vedi _scegliMossaMewtwoFinale.
    if (nemico && nemico.id === 150) return _scegliMossaMewtwoFinale();
    return _scegliMossaPesata(nemico, [mio]);
  }

  // IA di Mewtwo per lo scontro finale: di base usa Psichico (STAB), ma se
  // Fulmine o Lanciafiamme sono più efficaci di Psichico sul bersaglio
  // attuale preferisce la più efficace delle due. Usa Ricarica SOLO sotto il
  // 40% HP, massimo 2 volte in tutta la lotta (nemico._ricaricheMewtwo).
  function _scegliMossaMewtwoFinale() {
    if (nemico.inCarica) return nemico.inCarica;
    if (nemico.furia) return nemico.mosse.find(m => m.nome === nemico.furia.nome) || mossaFallback();

    const percentHP = nemico.hpAttuale / nemico.hpMax;
    const ricarica = nemico.mosse.find(m => m.nome === 'recover' && m.pp > 0);
    if (ricarica && percentHP < 0.4 && (nemico._ricaricheMewtwo || 0) < 2) {
      nemico._ricaricheMewtwo = (nemico._ricaricheMewtwo || 0) + 1;
      return ricarica;
    }

    const psichico = nemico.mosse.find(m => m.nome === 'psychic' && m.pp > 0);
    const alternative = ['thunderbolt', 'flamethrower']
      .map(n => nemico.mosse.find(m => m.nome === n && m.pp > 0))
      .filter(Boolean);
    const mieiTipi = mio.tipi || [];
    let scelta = psichico;
    let migliorEff = psichico ? efficacia(psichico.tipo, mieiTipi) : -1;
    for (const alt of alternative) {
      const eff = efficacia(alt.tipo, mieiTipi);
      if (eff > migliorEff) { scelta = alt; migliorEff = eff; }
    }
    if (scelta && scelta.pp > 0) return scelta;

    const utilizzabili = nemico.mosse.filter(m => m.pp > 0);
    return utilizzabili.length ? utilizzabili[0] : mossaFallback();
  }

  // Generalizzata per 1v1 e doppia (stesso principio, bersagli possibili
  // diversi): pesa le mosse offensive per danno atteso contro il MIGLIOR
  // bersaglio disponibile (potenza × efficacia di tipo × STAB), le mosse
  // di stato restano scegliibili ma con un peso base basso.
  // Mosse di cura totale/quasi totale (per prediligeCura, vedi sotto):
  // elenco dei Gen 1-3 realmente disponibili (niente Wish: non cura subito).
  const MOSSE_CURA_TOTALE = new Set(['recover', 'soft-boiled', 'milk-drink', 'rest',
    'moonlight', 'morning-sun', 'synthesis']);

  // Mossa "inutile nel contesto attuale" (20 ott 2026, richiesta esplicita
  // di Luca dopo aver visto AI_CheckBadMove di pret/pokeemerald — l'IA vera
  // di Smeraldo scarta mosse come un'altra Danza Spada quando l'Attacco è
  // già al massimo, o Tossico su un bersaglio già avvelenato: non è un
  // problema di "tipo inefficace", è che la mossa non farebbe NULLA qui e
  // ora). Copre solo gli effetti che il nostro motore gestisce davvero
  // (stadi di statistica, i 4 stati maggiori + congelamento, confusione,
  // meteo, i 3 schermi) — gli effetti non implementati restano fuori,
  // mossaUtile() li ha già esclusi dalla scelta automatica a monte.
  function _mossaInutileNelContesto(attaccante, bersagli, m) {
    const bersaglio = bersagli[0]; // lotta singola: un solo bersaglio possibile
    if (!bersaglio) return false;
    // Meteo: inutile ripetere una mossa che imposta un meteo già attivo.
    if (MOSSE_METEO[m.nome] && meteoBattaglia === MOSSE_METEO[m.nome].tipo) return true;
    // Schermi (Riflesso/Schermoluce/Salvaguardia): inutile se già attivo sul
    // proprio lato (non si somma, si sostituirebbe solo a sé stesso).
    const schermiAtt = _schermiDiLato(attaccante);
    if (schermiAtt) {
      if (m.nome === 'reflect' && schermiAtt.reflect > 0) return true;
      if (m.nome === 'light-screen' && schermiAtt.lightscreen > 0) return true;
      if (m.nome === 'safeguard' && schermiAtt.safeguard > 0) return true;
    }
    // Stati maggiori (sonno/veleno/paralisi/scottatura/congelamento) e
    // confusione: inutile se il bersaglio ha già un problema di stato (i 5
    // maggiori sono mutuamente esclusivi), è già immune per tipo/Abilità, o
    // è protetto dalla Salvaguardia sul suo lato.
    if (m.statoEffetto === 'confusion') {
      if (bersaglio.confusione > 0 || bersaglio.abilitaChiave === 'own-tempo') return true;
    } else if (m.statoEffetto && STATI[m.statoEffetto]) {
      if (bersaglio.condizione || immuneAStato(bersaglio, m.statoEffetto)) return true;
    }
    if (m.statoEffetto && (STATI[m.statoEffetto] || m.statoEffetto === 'confusion')) {
      const schermiBers = _schermiDiLato(bersaglio);
      if (schermiBers && schermiBers.safeguard > 0) return true;
    }
    // Cambio di statistiche: inutile se TUTTI gli stadi coinvolti sono già
    // al tetto (±6) nella direzione in cui la mossa li spingerebbe.
    if (m.cambiStat && m.cambiStat.length > 0) {
      const versoSe = (m.bersaglio === 'user' || m.bersaglio === 'users-field');
      const target = versoSe ? attaccante : bersaglio;
      const tuttiAlTetto = m.cambiStat.every(c => {
        const attuale = target.mod[c.stat] || 0;
        if (c.modifica > 0) return attuale >= 6;
        if (c.modifica < 0) return attuale <= -6;
        return false;
      });
      if (tuttiAlTetto) return true;
    }
    return false;
  }

  function _scegliMossaPesata(attaccante, possibiliBersagli) {
    if (attaccante.inCarica) return attaccante.inCarica;
    if (attaccante.furia) return attaccante.mosse.find(m => m.nome === attaccante.furia.nome) || mossaFallback();
    // Prima mossa fissa (20 ott 2026, richiesta esplicita di Luca, es.
    // Machamp che apre sempre con Granfisico): solo al primo turno in campo
    // di questo Pokémon, poi torna alla scelta normale.
    if (attaccante.primaMossa && !attaccante._primaMossaFatta) {
      attaccante._primaMossaFatta = true;
      const m = attaccante.mosse.find(mm => mm.nome === attaccante.primaMossa && mm.pp > 0);
      if (m) return m;
    }
    const utilizzabili = attaccante.mosse.filter(m => m.pp > 0);
    if (!utilizzabili.length) return mossaFallback();
    // Predilige una mossa di cura sotto il 40% HP (20 ott 2026, richiesta
    // esplicita di Luca, es. Umbreon): se ne ha una disponibile, la usa
    // sempre a quella soglia — non "forse", come i giochi veri non sprecano
    // un turno di cura se possono vincere lo scambio altrimenti, ma qui è
    // semplice e prevedibile apposta (comportamento voluto, non un bug).
    if (attaccante.prediligeCura && attaccante.hpAttuale / attaccante.hpMax < 0.4) {
      const cura = utilizzabili.find(m => MOSSE_CURA_TOTALE.has(m.nome));
      if (cura) return cura;
    }
    const bersagli = possibiliBersagli.filter(b => b && b.hpAttuale > 0);
    if (!bersagli.length) return utilizzabili[Math.floor(Math.random() * utilizzabili.length)];

    // IA più "cattiva" (20 ott 2026, richiesta esplicita di Luca: "troppo
    // facile, gioca a caso"): due cambi rispetto a prima.
    // 1) Una mossa SENZA alcun effetto (immunità di tipo, es. Terremoto su un
    //    volante) non si usa MAI se c'è almeno un'alternativa valida — prima
    //    aveva un peso residuo (0.2) che la faceva scegliere comunque, raro
    //    ma capitava, ed era esattamente quello che sembrava "giocare a caso".
    // 2) L'efficacia pesa al QUADRATO, non lineare: una mossa superefficace
    //    (×2 o ×4) ora è molto più preferita di una poco efficace o neutra,
    //    invece di una leggera preferenza quasi impercettibile — l'IA sceglie
    //    quasi sempre la mossa giusta per il tipo dell'avversario, pur
    //    restando casuale quando più mosse sono comparabili (niente di
    //    "sempre la stessa", solo meno a caso quando c'è una scelta ovvia).
    const senzaEffetto = [];
    const pesi = utilizzabili.map(m => {
      if (!m.potenza || m.potenza <= 0) {
        // Mossa di stato: peso base, A MENO che non sia inutile nel
        // contesto attuale (stat già al tetto, bersaglio già nello stesso
        // stato, meteo/schermo già attivo, ecc. — vedi _mossaInutileNelContesto).
        if (_mossaInutileNelContesto(attaccante, bersagli, m)) { senzaEffetto.push(m); return 0; }
        return 1;
      }
      const effMax = Math.max(...bersagli.map(b => efficacia(m.tipo, b.tipi || [])));
      if (effMax === 0) { senzaEffetto.push(m); return 0; }
      const stab = (attaccante.tipi || []).includes(m.tipo) ? 1.5 : 1;
      return m.potenza * effMax * effMax * stab;
    });
    // Se TUTTE le mosse offensive sono senza effetto, almeno una di stato (se
    // c'è) resta comunque scelgibile col suo peso base — mai scegliere
    // un'offensiva inutile se esiste una mossa di stato sensata al suo posto.
    const totale = pesi.reduce((s, p) => s + p, 0);
    if (totale <= 0) return utilizzabili[Math.floor(Math.random() * utilizzabili.length)];
    let r = Math.random() * totale;
    for (let i = 0; i < utilizzabili.length; i++) {
      r -= pesi[i];
      if (r <= 0) return utilizzabili[i];
    }
    return utilizzabili[utilizzabili.length - 1];
  }

  // Sceglie, fra le scorte rimaste, l'oggetto più adatto a coprire "mancanti"
  // HP: il più economico che basta da solo se c'è, altrimenti il più potente
  // disponibile (meglio di niente) — non spreca una Pozione Massima per 5 HP.
  function _scegliOggettoCuraNemico(mancanti) {
    let bastaDaSolo = null, megliOpzioneParziale = null;
    for (const voce of scorteCuraNemico) {
      if (voce.quantita <= 0) continue;
      const og = OGGETTI[voce.chiave];
      if (!og) continue;
      // Cura Totale (categoria 'curatotale', es. le "ricariche" di Maso,
      // sess. 6 ott 2026): niente campo "cura" numerico, guarisce SEMPRE
      // tutti gli HP + qualsiasi stato — trattato come "basta da solo".
      if (og.categoria === 'curatotale') {
        if (!bastaDaSolo || bastaDaSolo.og.categoria !== 'curatotale') bastaDaSolo = { voce, og };
        continue;
      }
      if (!og.cura) continue;
      if (og.cura >= mancanti) {
        if (!bastaDaSolo || (bastaDaSolo.og.categoria !== 'curatotale' && og.cura < bastaDaSolo.og.cura)) bastaDaSolo = { voce, og };
      } else if (!megliOpzioneParziale || og.cura > megliOpzioneParziale.og.cura) {
        megliOpzioneParziale = { voce, og };
      }
    }
    return bastaDaSolo || megliOpzioneParziale;
  }

  // Switch volontario dell'IA — hack dedicato a Maso (sess. 6 ott 2026),
  // non un comportamento generale: attivo solo con datiAllenatore.
  // switchIntelligente === true. Cerca in panchina un Pokémon nettamente
  // più efficace (STAB ≥2×) contro il nostro Pokémon in campo rispetto a
  // quello attualmente schierato; se lo trova, switcha con il 70% di
  // probabilità, non più di una volta ogni 3 turni. Ritorna true se ha
  // switchato (consuma il turno, niente attacco quel giro).
  async function _provaSwitchNemico() {
    // Generalizzata a TUTTI gli allenatori (20 ott 2026, richiesta esplicita
    // di Luca: "se ha solo mosse normali contro uno spettro, deve cambiare
    // Pokémon se ne ha un altro migliore") — prima era un hack dedicato solo
    // a Maso (switchIntelligente). Resta disattivabile per un allenatore
    // specifico scrivendo switchIntelligente: false in dati/trainer.js, se
    // mai servisse (nessuno lo fa oggi).
    if (!datiAllenatore || datiAllenatore.switchIntelligente === false) return false;
    if (!nemico || nemico.hpAttuale <= 0 || !mio) return false;
    if (squadraNemica.length <= 1) return false;
    // Flag di TEST temporaneo (richiesto da Luca, 22 ott 2026, per verificare
    // il fix del punto 6 — console: stato.flags.debug_switch_sempre = true):
    // salta il cooldown di 3 turni e la probabilità del 70%, per forzare lo
    // switch ogni volta che esiste un Pokémon migliore in panchina. DA
    // TOGLIERE a fine test.
    const debugSempre = !!(statoGioco.flags && statoGioco.flags.debug_switch_sempre);
    if (!debugSempre && numeroTurnoBattaglia - ultimoSwitchVolontarioTurno < 3) return false;

    const efficaciaMax = (ist) => ist.tipi.reduce((max, t) => Math.max(max, efficacia(t, mio.tipi)), 0);
    const efficaciaAttuale = efficaciaMax(nemico);

    let migliore = null, migliorEfficacia = efficaciaAttuale;
    for (let i = 0; i < squadraNemica.length; i++) {
      if (i === indiceNemico) continue;
      const candidato = squadraNemica[i];
      if (!candidato || candidato.hpAttuale <= 0) continue;
      const eff = efficaciaMax(candidato);
      if (eff >= 2 && eff > migliorEfficacia) { migliore = i; migliorEfficacia = eff; }
    }
    if (migliore === null) return false;
    if (!debugSempre && Math.random() > 0.7) return false;   // "può deciderlo", non sempre

    ultimoSwitchVolontarioTurno = numeroTurnoBattaglia;
    const vecchio = nemico;
    indiceNemico = migliore;
    nemico = squadraNemica[indiceNemico];
    // Bug corretto 22 ott 2026 (segnalato da Luca, caso Ginevra→Gardevoir):
    // mancavano aggiornaSprite(true)/animaEntrataPokemon, le stesse due
    // chiamate che il percorso del KO (nemicoSconfitto) già fa dopo aver
    // cambiato "nemico" — senza, lo sprite restava quello del Pokémon
    // RITIRATO (HP/nome/pannello del nuovo Pokémon, ma sprite vecchio).
    aggiornaSprite(true);
    aggiornaPannelli();
    await di(`${etichettaNemico()} ritira ${vecchio.nome}!`);
    await animaEntrataPokemon('nemico');
    await di(`${etichettaNemico()} manda in campo ${nemico.nome}!`);
    await attivaAbilitaIngresso(nemico, etichettaNemico(), mio, mio.nome);
    return true;
  }

  // IA di cura dell'allenatore (sess. 1 ott 2026, richiesta di Luca: i
  // capipalestra devono potersi curare, non solo attaccare — prima
  // rendeva le palestre troppo facili). Si cura quando è sotto metà vita
  // (o ha uno stato alterato, esteso il 6 ott 2026 per le "ricariche" di
  // Maso) E ha ancora scorte: consuma il turno (niente attacco quello
  // stesso giro), come nel gioco vero. Ritorna true se si è curato.
  async function _provaCuraNemico() {
    if (!scorteCuraNemico || !nemico || nemico.hpAttuale <= 0) return false;
    const mancanti = nemico.hpMax - nemico.hpAttuale;
    const haStato = !!nemico.condizione;
    if (mancanti <= 0 && !haStato) return false;
    if (nemico.hpAttuale / nemico.hpMax > 0.5 && !haStato) return false;
    const scelta = _scegliOggettoCuraNemico(mancanti);
    if (!scelta) return false;
    scelta.voce.quantita -= 1;
    if (scelta.og.categoria === 'curatotale') {
      nemico.hpAttuale = nemico.hpMax;
      nemico.condizione = null;
    } else {
      nemico.hpAttuale = Math.min(nemico.hpMax, nemico.hpAttuale + scelta.og.cura);
    }
    aggiornaPannelli();
    await di(`${etichettaNemico()} usa ${scelta.og.nome} su ${nemico.nome}!`);
    return true;
  }

  // Velocità effettiva (sbalzi + riduzione da paralisi), per l'ordine dei turni.
  // Verificato su Bulbapedia (sess. 29 set 2026, richiesta esplicita di Luca):
  // nella 3ª generazione (e fino alla 6ª) la paralisi porta la Velocità al
  // 25% di quella normale, non al 50% — quel taglio a metà è la regola
  // introdotta solo dalla 7ª generazione in poi, qui era sbagliato.
  function velocitaEffettiva(ist) {
    let v = statEffettiva(ist, ist.velocita, 'speed');
    // Piedisvelti (quick-feet, richiesta Luca): +50% Velocità se ha uno
    // stato alterato, e IGNORA il malus da paralisi (a differenza del
    // normale ×0.25) — esattamente come Attitudine ignora la scottatura.
    if (ist.abilitaChiave === 'quick-feet' && ist.condizione) {
      v = v * 1.5;
    } else if (ist.condizione && ist.condizione.tipo === 'paralysis') {
      v *= 0.25;
    }
    // Nuotafrode/Clorofilla (richiesta Luca, 18 ott 2026): raddoppiano la
    // Velocità nel meteo giusto, a prescindere dagli sbalzi di statistica.
    if (ist.abilitaChiave === 'swift-swim' && meteoBattaglia === 'rain') v *= 2;
    if (ist.abilitaChiave === 'chlorophyll' && meteoBattaglia === 'sun') v *= 2;
    return v;
  }

  // Solo il nemico agisce (dopo che il giocatore usa un oggetto, cambia Pokémon
  // o fallisce la fuga): attacca, poi scattano i danni da stato. Prima prova
  // a curarsi (consuma il turno, niente attacco quel giro se lo fa).
  async function turnoNemicoEFine() {
    numeroTurnoBattaglia += 1;
    if (!(await _provaSwitchNemico()) && !(await _provaCuraNemico())) {
      await eseguiTurno(nemico, mio, scegliMossaNemico(), etichettaNemico(), mio.nome);
      // KO doppio (22 ott 2026, richiesta Luca — Autodistruzione/Esplosione):
      // il nemico va controllato PRIMA di "mio", altrimenti un suo auto-KO
      // nello stesso colpo (es. Autodistruzione) non veniva mai gestito —
      // niente "hai sconfitto X", niente avanzamento alla sua squadra.
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    }
    await fineTurnoStati();
    if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
    if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    mostraMenuPrincipale();
  }

  // Turno completo: l'ordine è deciso prima dalla PRIORITÀ della mossa,
  // poi (a parità) dalla velocità effettiva. Se il nemico decide di
  // curarsi (vedi _provaCuraNemico), quello è il suo intero turno: come nel
  // gioco vero, gli oggetti vanno "prima" di qualunque mossa — il giocatore
  // attacca comunque, il nemico no.
  async function turnoCompleto(mossaMia) {
    nascondiMenu();
    numeroTurnoBattaglia += 1;

    if ((await _provaSwitchNemico()) || (await _provaCuraNemico())) {
      await eseguiTurno(mio, nemico, mossaMia, mio.nome, etichettaNemico());
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
      await fineTurnoStati();
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
      mostraMenuPrincipale();
      return;
    }

    const mossaNemico = scegliMossaNemico();
    const prioMia = mossaMia.priorita || 0;
    const prioNem = mossaNemico.priorita || 0;

    // A parità di priorità, decide la velocità; a parità ESATTA anche di
    // velocità il vero motore (0150_Battle_ActionAttacksPriority.rb) tira
    // un ordine casuale, non fa vincere sempre lo stesso lato — prima qui
    // il giocatore vinceva sempre i pareggi (">="), un bias mai notato
    // perché raro ma comunque non fedele.
    const vMia = velocitaEffettiva(mio), vNem = velocitaEffettiva(nemico);
    let mioPrima;
    // Costanza (stall, 20 ott 2026): a parità di priorità, chi la possiede
    // agisce sempre per ultimo (se la possiedono entrambi, si pareggia e
    // decide la velocità come sempre).
    const stallMia = mio.abilitaChiave === 'stall', stallNem = nemico.abilitaChiave === 'stall';
    if (prioMia !== prioNem) mioPrima = prioMia > prioNem;
    else if (stallMia !== stallNem) mioPrima = stallNem;
    else if (vMia !== vNem) mioPrima = vMia > vNem;
    else mioPrima = Math.random() < 0.5;

    // Unghia Veloce: 20% di agire per primi a prescindere da priorità/velocità
    // (non scatta se il rivale ha priorità più alta: quella vince comunque)
    if (!mioPrima && prioMia >= prioNem && mio.oggetto === 'unghia_veloce' && Math.random() < 0.2) {
      mioPrima = true;
    }

    const etNem = etichettaNemico();

    if (mioPrima) {
      await eseguiTurno(mio, nemico, mossaMia, mio.nome, etNem);
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }   // MOD 6B: auto-KO (confusione/autodistruzione)
      await eseguiTurno(nemico, mio, mossaNemico, etNem, mio.nome);
      // KO doppio (22 ott 2026, richiesta Luca): il nemico può auto-KO con
      // Autodistruzione/Esplosione anche in questo secondo attacco — va
      // controllato PRIMA di "mio", stesso motivo del blocco sopra.
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    } else {
      await eseguiTurno(nemico, mio, mossaNemico, etNem, mio.nome);
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
      await eseguiTurno(mio, nemico, mossaMia, mio.nome, etNem);
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }   // MOD 6B: auto-KO
    }

    // Fine turno: veleno/scottatura colpiscono entrambi
    await fineTurnoStati();
    if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
    if (mio.hpAttuale <= 0) { await gestisciKO(); return; }

    mostraMenuPrincipale();
  }

  /* ==========================================================
     ESPERIENZA E LEVEL-UP (con level cap)
     ========================================================== */

  // silenzioso = true per i compagni di squadra che NON hanno sferrato il
  // colpo decisivo (richiesta esplicita di Luca: guadagnano EXP ridotta
  // "in sordina", senza il messaggio "guadagna X Punti Esperienza" e senza
  // barra/riquadro statistiche — MA se salgono comunque di livello lo si
  // dice sempre, quello non si nasconde mai).
  async function assegnaExp(ist, exp, silenzioso) {
    const cap = statoGioco.levelCap || 100;
    // Il level cap è il livello dell'ASSO del capopalestra (es. cap=30 vuol
    // dire che il capopalestra ha un Pokémon al 30) — il giocatore non deve
    // mai poterlo raggiungere, resta sempre un livello sotto (richiesta
    // esplicita di Luca, 6 ott 2026): niente più "Lv.30 contro Lv.30", il
    // capopalestra resta sempre, per un livello, più forte di qualunque
    // Pokémon tu possa avere a quel punto della partita.
    const expMassima = Math.pow(cap, 3) - 1;
    // La barra Exp a schermo è quella di "mio" soltanto: i compagni panchinati
    // non hanno alcuna barra visibile, quindi tutta l'animazione (barra che
    // si riempie, si azzera, riquadro statistiche) ha senso SOLO per lui.
    const mostraBarra = (ist === mio) && !silenzioso;

    ist.exp += exp;
    let capRaggiunto = false;
    if (ist.exp > expMassima) { ist.exp = expMassima; capRaggiunto = true; }

    if (!silenzioso) await di(`${ist.nome} guadagna ${exp} Punti Esperienza!`);
    if (mostraBarra) aggiornaPannelli();   // la barra si riempie fino al punto raggiunto ORA (CSS transition)

    // Sale di livello finché l'EXP lo consente (e il cap lo permette)
    while (ist.livello < cap && ist.exp >= Math.pow(ist.livello + 1, 3)) {
      // Prima di salire di livello: la barra arriva al 100% del livello
      // VECCHIO (stile giochi originali), poi si azzera e riparte dopo il
      // riquadro statistiche — non salta direttamente al valore del nuovo
      // livello.
      if (mostraBarra) {
        const el = $('giocatore-exp');
        if (el) el.style.width = '100%';
        await new Promise(r => setTimeout(r, durataFx(450)));
      }

      const vecchie = {
        hp: ist.hpMax, atk: ist.attacco, def: ist.difesa,
        spa: ist.attSp, spd: ist.difSp, vel: ist.velocita,
      };
      ist.livello += 1;
      const vecchioHpMax = ist.hpMax;
      ricalcolaStatistiche(ist);
      // Gli HP attuali crescono insieme agli HP massimi
      ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - vecchioHpMax));
      const nuove = {
        hp: ist.hpMax, atk: ist.attacco, def: ist.difesa,
        spa: ist.attSp, spd: ist.difSp, vel: ist.velocita,
      };

      if (!mostraBarra) aggiornaPannelli();
      await di(`✨ ${ist.nome} sale al livello ${ist.livello}!`);

      if (mostraBarra) {
        await mostraSchermataLevelUp(ist, vecchie, nuove);
        const el = $('giocatore-exp');
        if (el) el.style.width = '0%';
        aggiornaPannelli();   // riparte da 0% verso il punto vero del nuovo livello
      }

      await controllaNuoveMosse(ist);
      const evoluto = await controllaEvoluzione(ist);
      // BUG CRITICO (segnalato 10 ott 2026): se l'evoluzione scatta PROPRIO
      // a questo livello (es. Torchic -> Combusken a Lv.16, e Doppio Calcio
      // è una mossa di LIVELLO 16 di Combusken, non di Torchic), il
      // controllo sopra girava ancora con lo specie VECCHIA (Torchic non
      // impara Doppio Calcio) e poi l'evoluzione aggiornava mosseImparabili
      // troppo tardi: quel livello non veniva mai più ricontrollato, la
      // mossa andava persa per sempre. Dopo un'evoluzione bisogna
      // riprovare SUBITO con la specie nuova, allo stesso livello.
      if (evoluto) await controllaNuoveMosse(ist);
    }

    if (!mostraBarra) aggiornaPannelli();
    if (capRaggiunto && !silenzioso) {
      await di(`⛔ ${ist.nome} ha raggiunto il level cap (Lv.${cap}). Serve la prossima medaglia!`);
    }
  }

  // Riquadro statistiche al level-up (in basso a destra, sovrapposto in
  // parte al pannello HP — vedi #levelup-box in style.css/index.html).
  // Tre stadi scanditi da [A] (vedi confermaCursore, _levelUpRisolvi):
  // 1) mostra "+N" per ogni statistica, 2) mostra il nuovo totale,
  // 3) si chiude (la barra Exp riparte da 0% verso il nuovo livello).
  async function mostraSchermataLevelUp(ist, vecchie, nuove) {
    const box = $('levelup-box');
    if (!box) return;
    // Su mobile il tasto [A] a schermo è SEMPRE coperto da #schermata-battaglia
    // (z-index inferiore: gli altri avanzamenti funzionano solo perché si tocca
    // direttamente il bottone/messaggio, mai il tasto A nascosto) — ma questo
    // riquadro non aveva nessun target toccabile, quindi su mobile il gioco
    // restava bloccato qui per sempre (bug segnalato da Luca). Il riquadro
    // stesso ora fa da bottone "avanti", stesso trattamento del messaggio.
    box.onclick = () => confermaCursore();
    const titolo = $('levelup-titolo');
    if (titolo) titolo.textContent = `${ist.nome} · statistiche`;
    const RIGHE = { hp: 'lv-hp', atk: 'lv-atk', def: 'lv-def', spa: 'lv-spa', spd: 'lv-spd', vel: 'lv-vel' };

    for (const k in RIGHE) {
      const el = $(RIGHE[k]);
      if (el) el.textContent = `+${Math.round(nuove[k] - vecchie[k])}`;
    }
    box.classList.remove('nascosto');
    await new Promise(r => { _levelUpRisolvi = r; });

    for (const k in RIGHE) {
      const el = $(RIGHE[k]);
      if (el) el.textContent = String(Math.round(nuove[k]));
    }
    await new Promise(r => { _levelUpRisolvi = r; });

    box.classList.add('nascosto');
  }

  // Al level-up: se la specie impara una mossa proprio a questo livello, la aggiunge
  async function controllaNuoveMosse(ist) {
    const nuove = (ist.mosseImparabili || []).filter(m => m.livello === ist.livello);
    for (const voce of nuove) {
      if (ist.mosse.some(s => s.nome === voce.nome)) continue;
      let dettagli;
      try { dettagli = await PokeAPI.getMossa(voce.nome, voce.url); }
      catch (e) { continue; }
      // BUG CRITICO (segnalato 10 ott 2026, corretto in parallelo anche da
      // Luca via GitHub): questo controllo scartava TUTTE le mosse di stato
      // (Ruggito, Rifletti, Ragnatela, Finta Energia...), quindi qualunque
      // Pokémon la cui prossima mossa di livello fosse di stato non
      // imparava NULLA a quel livello — un Weedle/Beedrill arrivato a
      // Lv.20 senza mosse è un caso reale di questo bug. scegliMosse()
      // (creazione iniziale) usa già mossaUtile() correttamente: qui
      // dobbiamo usare lo stesso filtro, non uno più restrittivo.
      if (!mossaUtile(dettagli)) continue;

      if (ist.mosse.length < 4) {
        ist.mosse.push({ ...dettagli, pp: dettagli.ppMax });
        await di(`${ist.nome} impara ${dettagli.nomeIt}!`, true);   // richiede [A], niente auto-avanti
      } else {
        // 4 mosse già conosciute: stesso flusso dei giochi veri — prima si
        // chiede se sostituirne una, poi (se sì) si apre la lista delle 5
        // mosse (le 4 conosciute + quella nuova) con cursore e descrizione
        // a sinistra (sess. 29 set 2026, richiesta esplicita di Luca).
        await di(`${ist.nome} vuole imparare ${dettagli.nomeIt}, ma conosce già 4 mosse.`, true);
        await sostituisciMossaConScelta(ist, dettagli);
      }
    }
  }

  // Formatta la "scheda" di una mossa per il pannello descrizione a
  // sinistra della lista (stessi dati mostrati nella Sommario dei giochi
  // veri: tipo, categoria, potenza, precisione, PP — niente testo Pokédex
  // per le mosse, PokeAPI non lo fornisce come per i Pokémon/abilità).
  function _descrizioneMossa(m) {
    const tipoIt = (typeof TIPO_NOMI !== 'undefined' && TIPO_NOMI[m.tipo]) || m.tipo;
    const classeIt = { physical: 'Fisica', special: 'Speciale', status: 'Stato' }[m.classe] || m.classe;
    const potenza = m.potenza != null ? m.potenza : '—';
    const precisione = m.precisione != null ? m.precisione + '%' : '—';
    return `Tipo: ${tipoIt}\nCategoria: ${classeIt}\nPotenza: ${potenza}\nPrecisione: ${precisione}\nPP: ${m.ppMax}/${m.ppMax}`;
  }

  // Sostituzione di una mossa quando il Pokémon ne conosce già 4 (sess. 29
  // set 2026): stesso flusso dei giochi veri — prima Sì/No, poi (se sì) la
  // lista delle 5 mosse (le 4 conosciute + la nuova) con cursore e
  // descrizione a sinistra; scegliendo la nuova non cambia nulla (è già
  // "in cima" alla lista, per coerenza con la Sommario reale che la mostra
  // per prima), scegliendo "Annulla" la mossa nuova non si impara, esattamente
  // come nei giochi originali.
  async function sostituisciMossaConScelta(ist, nuova) {
    if (typeof mostraScelta !== 'function' || typeof mostraSceltaLista !== 'function') return;
    const conferma = await mostraScelta(
      `Vuoi che ${ist.nome} dimentichi una mossa per imparare ${nuova.nomeIt}?`, 'Sì', 'No'
    );
    if (conferma !== 1) {
      await di(`${ist.nome} non ha imparato ${nuova.nomeIt}.`, true);
      return;
    }

    const nuovaConPp = { ...nuova, pp: nuova.ppMax };
    const elenco = [nuovaConPp, ...ist.mosse];   // la nuova per prima, come nella Sommario reale
    const nomi = elenco.map((m, i) => i === 0 ? `${m.nomeIt} (NUOVA)` : m.nomeIt);
    const descrizioni = elenco.map(_descrizioneMossa);

    // Richiesta esplicita di Luca (sess. 29 set 2026): dopo aver scelto la
    // mossa da eliminare, chiedere una conferma esplicita prima di applicare
    // davvero la sostituzione — se risponde "No" si torna alla lista invece
    // di annullare tutto, così un tocco sbagliato non fa perdere l'occasione
    // di imparare la mossa nuova.
    let idxDaSostituire = -1;
    while (idxDaSostituire < 0) {
      const scelta = await mostraSceltaLista(
        `Quale mossa deve dimenticare ${ist.nome}?`, nomi, descrizioni
      );
      if (scelta <= 0) {
        // Annulla, oppure ha "scelto" la mossa nuova stessa (indice 0): in
        // entrambi i casi non cambia nulla, la mossa nuova non si impara.
        await di(`${ist.nome} non ha imparato ${nuova.nomeIt}.`, true);
        return;
      }
      const candidata = ist.mosse[scelta - 1];   // -1 perché "nuova" occupa la posizione 0 nell'elenco mostrato
      const confermaScelta = await mostraScelta(
        `Dimenticare ${candidata.nomeIt || candidata.nome} per imparare ${nuova.nomeIt}?`, 'Sì', 'No'
      );
      if (confermaScelta === 1) idxDaSostituire = scelta - 1;
      // altrimenti torna in cima al while e riapre la lista
    }
    const vecchia = ist.mosse[idxDaSostituire];
    ist.mosse[idxDaSostituire] = nuovaConPp;
    await di(`Uno, due e... via! ${ist.nome} ha dimenticato ${vecchia.nomeIt || vecchia.nome} e ha imparato ${nuova.nomeIt}!`, true);
  }

  // Evoluzione per livello (F6): se la specie si evolve a questo
  // livello (o prima), il Pokémon si trasforma mantenendo mosse ed EXP.
  async function controllaEvoluzione(ist) {
    try {
      if (ist.felicita != null) ist.felicita = Math.min(255, ist.felicita + 5);  // sale coi livelli
      const evo = trovaEvoluzioneAuto(ist);
      if (!evo) return false;

      await di(`Cosa?! ${ist.nome} si sta evolvendo!`);
      const vecchioNome = ist.nome;
      await evolviIstanza(ist, evo.idEvo);
      aggiornaSprite();
      aggiornaPannelli();
      await di(`🎉 ${vecchioNome} si è evoluto in ${ist.nome}!`);
      return true;
    } catch (err) {
      // Se la rete fallisce non blocchiamo la battaglia: l'evoluzione
      // verrà ritentata al prossimo level-up.
      console.warn('[Battle] Controllo evoluzione saltato:', err.message);
      return false;
    }
  }

  /* ==========================================================
     AZIONI: cattura, pozione, cambio, fuga
     ========================================================== */

  async function tentaCattura(chiaveBall) {
    nascondiMenu();

    // Non si catturano i Pokémon degli allenatori (la Ball non viene sprecata)
    if (modalita === 'allenatore') {
      await di('Non puoi catturare i Pokémon di un altro allenatore!');
      mostraMenuPrincipale();
      return;
    }

    statoGioco.zaino[chiaveBall] -= 1;
    await di(`Hai lanciato una ${OGGETTI[chiaveBall].nome}!`);

    // Formula di cattura, contro il motore vero (0226_Battle_
    // CatchAndStoreMixin.rb#pbCaptureCalc): il tasso di cattura VERO della
    // specie (nemico.catchRate, 0-255, es. Moltres=3, Rattata=190) pesa
    // quanto o più del bonus della Ball — prima la formula ignorava del
    // tutto la specie e un Moltres si catturava come un Rattata (bug
    // segnalato 13 agosto). Master Ball (bonus 255) resta sempre garantita.
    const catchRateSpecie = (typeof nemico.catchRate === 'number') ? nemico.catchRate : 45;
    const ballBonus = OGGETTI[chiaveBall].bonus;
    let a = Math.floor(
      ((3 * nemico.hpMax - 2 * nemico.hpAttuale) * catchRateSpecie * ballBonus) / (3 * nemico.hpMax)
    );
    // Bonus per stato alterato: mancava del tutto (il campo reale lo fa
    // SEMPRE, non solo con la Net/Ball apposita) — addormentato/congelato
    // ×2.5, qualunque altro stato (paralisi/veleno/scottatura) ×1.5.
    if (nemico.condizione) {
      const t = nemico.condizione.tipo;
      a = Math.floor(a * ((t === 'sleep' || t === 'freeze') ? 2.5 : 1.5));
    }
    a = Math.max(1, Math.min(255, a));

    // 4 "scosse": ognuna deve superare la soglia b per continuare. Tutte e
    // 4 riuscite = cattura. Esponente 0.1875 (3/16), non 0.25: quello vecchio
    // era il valore sbagliato per questo motore (verificato nello script
    // reale, non è legato alla generazione — vale sempre in questo engine).
    let scosseRiuscite = 4;
    if (a < 255) {
      const b = Math.min(65535, Math.floor(65536 / Math.pow(255 / a, 0.1875)));
      scosseRiuscite = 0;
      for (let i = 0; i < 4; i++) {
        if (Math.floor(Math.random() * 65536) < b) scosseRiuscite++;
        else break;
      }
    }

    const ball = await animaLancioBall(chiaveBall);

    if (scosseRiuscite === 0) {
      await di('La Ball non si è nemmeno mossa!');
    } else {
      const testiScosse = ['La Ball oscilla...', '...oscilla ancora...', '...e ancora...'];
      for (let i = 0; i < Math.min(scosseRiuscite, 3); i++) {
        await animaScossaBall(ball);
        await di(testiScosse[i]);
      }
    }

    if (scosseRiuscite >= 4) {
      await animaCatturaRiuscita(ball);
      // Richiesta di Luca (10 ott 2026): dire esplicitamente quando è la
      // PRIMA cattura di questa specie (voce.catturato era false/assente
      // prima di segnaPokedex) — prima non si vedeva mai questa conferma.
      const giaCatturatoPrima = !!(statoGioco.pokedex && statoGioco.pokedex[nemico.id] && statoGioco.pokedex[nemico.id].catturato);
      if (typeof segnaPokedex === 'function') {
        segnaPokedex(nemico.id, nemico.nome, nemico.sprite && nemico.sprite.fronte, true);
      }
      await di(`Gotcha! ${nemico.nome} è stato catturato! 🎉`);
      if (!giaCatturatoPrima) {
        await di(`${nemico.nome} è stato registrato nel Pokédex!`);
      }
      if (statoGioco.squadra.length < 6) {
        statoGioco.squadra.push(nemico);
        await di(`${nemico.nome} si unisce alla squadra!`);
      } else {
        // Richiesta esplicita di Luca (12 ott 2026): un Pokémon catturato
        // che va dritto al Box (squadra piena) arriva curato al 100%, come
        // fosse passato dal Centro Pokémon — stessa logica di
        // curaSquadraDaCentro() in app.js (HP pieni, nessuna condizione,
        // PP ripristinati), evitando che resti bloccato a pochi HP residui
        // (quelli con cui l'hai indebolito per catturarlo) fino a quando
        // non lo ripeschi dal Box e lo curi a parte.
        nemico.hpAttuale = nemico.hpMax;
        nemico.condizione = null;
        nemico.mosse.forEach(m => { m.pp = m.ppMax; });
        depositaInBox(nemico);
        await di(`La squadra è al completo: ${nemico.nome} è stato inviato al Box, già curato e in piena forma!`);
      }
      fineBattaglia('cattura');
    } else {
      await animaCatturaFallita(ball);
      await di(`Oh no! ${nemico.nome} si è liberato!`);
      await turnoNemicoEFine();
    }
  }

  // Mostra la squadra per scegliere SU CHI usare una Pozione/cura di stato/
  // Cura Totale/Revitalizzante — richiesta esplicita di Luca (6 ott 2026):
  // prima queste cure funzionavano SOLO sul Pokémon in campo, come nei
  // giochi veri si può curare anche chi è in riserva senza farlo entrare.
  function mostraMenuSquadraOggetto(chiave) {
    nascondiMenu();
    const menu = $('menu-squadra');
    menu.innerHTML = '';
    const oggetto = OGGETTI[chiave];
    const perRianimare = oggetto.categoria === 'revive';

    statoGioco.squadra.forEach((pkm, idx) => {
      const ko = pkm.hpAttuale <= 0;
      const btn = document.createElement('button');
      const etichetta = ko ? ' (KO)' : (idx === indiceAttivo ? ' (in campo)' : '');
      btn.innerHTML =
        `<span class="mossa-nome">${pkm.nome}${etichetta}</span>` +
        `<span class="mossa-pp">Lv.${pkm.livello} · ${pkm.hpAttuale}/${pkm.hpMax} HP</span>`;
      // Un Revitalizzante serve solo su chi è KO; le altre cure il contrario.
      btn.disabled = perRianimare ? !ko : ko;
      btn.addEventListener('click', () => usaOggettoSuSquadraInBattaglia(idx, chiave));
      menu.appendChild(btn);
    });

    menu.appendChild(bottoneIndietro());
    menu.classList.remove('nascosto');
    resetCursore();
  }

  async function usaOggettoSuSquadraInBattaglia(idx, chiave) {
    const oggetto = OGGETTI[chiave];
    const target = statoGioco.squadra[idx];
    const etichetta = (idx === indiceAttivo) ? target.nome : `${target.nome} (riserva)`;

    if (oggetto.categoria === 'cura') {
      if (target.hpAttuale >= target.hpMax) {
        await di(`Gli HP di ${etichetta} sono già al massimo!`);
        mostraMenuSquadraOggetto(chiave);
        return;
      }
      nascondiMenu();
      statoGioco.zaino[chiave] -= 1;
      const cura = Math.min(oggetto.cura, target.hpMax - target.hpAttuale);
      target.hpAttuale += cura;
      aggiornaPannelli();
      await di(`${etichetta} recupera ${cura} HP! 🧪`);
    } else if (oggetto.categoria === 'curastato') {
      // oggetto.stato è in italiano, target.condizione.tipo in inglese —
      // stessa traduzione usata fuori battaglia (STATO_ITA_A_ENG, js/app.js).
      const condTarget = (typeof STATO_ITA_A_ENG !== 'undefined' && STATO_ITA_A_ENG[oggetto.stato]) || null;
      if (!target.condizione) {
        await di(`${etichetta} non ha nessun problema di stato!`);
        mostraMenuSquadraOggetto(chiave);
        return;
      }
      if (condTarget && target.condizione.tipo !== condTarget) {
        await di(`Non ha effetto su ${etichetta}!`);
        mostraMenuSquadraOggetto(chiave);
        return;
      }
      nascondiMenu();
      statoGioco.zaino[chiave] -= 1;
      target.condizione = null;
      aggiornaPannelli();
      await di(`${etichetta} non ha più problemi di stato!`);
    } else if (oggetto.categoria === 'curatotale') {
      const guaritoStato = !!target.condizione;
      const curaHp = target.hpMax - target.hpAttuale;
      if (curaHp <= 0 && !guaritoStato) {
        await di(`${etichetta} è già al massimo!`);
        mostraMenuSquadraOggetto(chiave);
        return;
      }
      nascondiMenu();
      statoGioco.zaino[chiave] -= 1;
      target.hpAttuale = target.hpMax;
      target.condizione = null;
      aggiornaPannelli();
      if (curaHp > 0 && guaritoStato) await di(`${etichetta} recupera tutti gli HP e guarisce! ✨`);
      else if (curaHp > 0) await di(`${etichetta} recupera tutti gli HP! ✨`);
      else await di(`${etichetta} guarisce dallo stato alterato! ✨`);
    } else if (oggetto.categoria === 'revive') {
      nascondiMenu();
      statoGioco.zaino[chiave] -= 1;
      target.hpAttuale = oggetto.max ? target.hpMax : Math.floor(target.hpMax / 2);
      target.condizione = null;
      aggiornaPannelli();
      await di(`${etichetta} si è ripreso! (${target.hpAttuale}/${target.hpMax} HP) 💊`);
    }

    // Usare un oggetto consuma il turno: il nemico attacca (anche se il
    // bersaglio curato era in riserva, non quello attualmente in campo).
    await turnoNemicoEFine();
  }

  // X Item (X Attacco, X Difesa, ...): alza di uno stadio la statistica del
  // Pokémon in campo per questa battaglia, stesso meccanismo delle mosse di
  // stato (vedi applicaCambiStat). Si consuma e passa il turno, come le Pozioni.
  async function usaXItem(chiave) {
    nascondiMenu();
    statoGioco.zaino[chiave] -= 1;
    const stat = OGGETTI[chiave].stat;
    const nome = STAT_NOMI[stat] || stat;
    const prima = mio.mod[stat] || 0;
    mio.mod[stat] = Math.max(-6, Math.min(6, prima + 1));
    aggiornaPannelli();
    if (mio.mod[stat] === prima) await di(`${nome} di ${mio.nome} non può aumentare ancora!`);
    else await di(`${nome} di ${mio.nome} è aumentato! ${OGGETTI[chiave].icona}`);

    await turnoNemicoEFine();
  }

  async function cambiaPokemon(idx, eraObbligatorio) {
    nascondiMenu();
    // Guarigione Naturale (natural-cure, 19 ott 2026): chi ESCE dal campo
    // (non chi KO, quello non ha stati residui da curare) perde ogni stato
    // alterato — va letto PRIMA di sovrascrivere "mio" col nuovo Pokémon.
    if (mio && mio.hpAttuale > 0 && mio.abilitaChiave === 'natural-cure') {
      mio.condizione = null;
    }
    // Recupero (regenerator, 19 ott 2026): chi esce dal campo vivo recupera
    // 1/3 degli HP massimi, stesso principio di Guarigione Naturale sopra.
    if (mio && mio.hpAttuale > 0 && mio.abilitaChiave === 'regenerator') {
      mio.hpAttuale = Math.min(mio.hpMax, mio.hpAttuale + Math.floor(mio.hpMax / 3));
    }
    indiceAttivo = idx;
    mio = statoGioco.squadra[idx];
    azzeraModificatori(mio); // gli sbalzi di statistica si resettano al cambio
    mio.inCarica = null; mio.deveRicaricare = false; mio.seminvulnerabile = null; // il cambio annulla carica/ricarica
    mio.furia = null; mio.confusione = 0; mio.protetto = false; mio.protConsecutivi = 0; // MOD 6B
    aggiornaSprite(true);
    aggiornaPannelli();
    await animaEntrataPokemon('giocatore');
    await di(`Vai! ${mio.nome}!`);
    await attivaAbilitaIngresso(mio, mio.nome, nemico, etichettaNemico());

    // Il cambio volontario consuma il turno; dopo un KO invece no (come nei giochi)
    if (!eraObbligatorio) {
      await turnoNemicoEFine();
    } else {
      mostraMenuPrincipale();
    }
  }

  async function tentaFuga() {
    nascondiMenu();

    // Dalle lotte tra allenatori non si scappa (come nei giochi)
    if (modalita === 'allenatore') {
      await di('Non si può fuggire da una lotta tra allenatori!');
      mostraMenuPrincipale();
      return;
    }

    // F11: dai leggendari non si scappa
    if (fuggireImpossibile) {
      await di('Non puoi fuggire da questo Pokémon leggendario!');
      mostraMenuPrincipale();
      return;
    }

    // Fuga/Vigore (run-away, richiesta Luca, 18 ott 2026): fuga garantita
    // dai selvatici (qui siamo già certi non sia un allenatore, vedi sopra).
    const fugaGarantita = mio.abilitaChiave === 'run-away';

    // Trappola/Magnetiterrazzo/Testatagliente (shadow-tag/magnet-pull/
    // arena-trap, 20 ott 2026): il selvatico impedisce la fuga — Trappola
    // sempre, Magnetiterrazzo solo contro tipo Acciaio, Testatagliente solo
    // contro chi non vola/non ha Levitazione (qui semplificato: chiunque non
    // sia di tipo Volante e non abbia Levitate, visto che non ci sono mosse
    // di Fossa da gestire come eccezione in questo motore).
    const abilN = nemico.abilitaChiave;
    const trappolaAttiva = !fugaGarantita && (
      abilN === 'shadow-tag' ||
      (abilN === 'magnet-pull' && mio.tipi.includes('steel')) ||
      (abilN === 'arena-trap' && !mio.tipi.includes('flying') && mio.abilitaChiave !== 'levitate')
    );
    if (trappolaAttiva) {
      await di(`Non riesci a fuggire: ${etichettaNemico()} ti blocca!`);
      await turnoNemicoEFine();
      return;
    }

    // Più sei veloce del nemico, più è facile scappare
    let prob = 0.55 + (mio.velocita - nemico.velocita) / 150;
    prob = Math.min(0.95, Math.max(0.25, prob));

    if (fugaGarantita || Math.random() < prob) {
      await di('Fuga riuscita! 🏃');
      fineBattaglia('fuga');
    } else {
      await di('Non riesci a fuggire!');
      await turnoNemicoEFine();
    }
  }

  /* ==========================================================
     ESITI: vittoria, KO, sconfitta
     ========================================================== */

  async function nemicoSconfitto() {
    await di(`${etichettaNemico()} è esausto!`);

    // KO doppio (22 ott 2026, richiesta esplicita di Luca — caso tipico:
    // Autodistruzione/Esplosione): se "mio" è morto nello stesso scambio che
    // ha sconfitto il nemico, niente EXP/EV per quella sconfitta — l'ha
    // "uccisa insieme a sé" il nemico, non l'hai battuta tu. Se "mio" è
    // ancora vivo, l'EXP è piena e normale, come sempre.
    const mioVivoPerExp = mio.hpAttuale > 0;

    // EXP: formula vera dei giochi (Gen 1-4), baseExp*livello/7, +50% contro
    // allenatori. Il moltiplicatore "+50% per medaglia" qui sotto (rimosso
    // sess. 12 set 2026, segnalato da Luca con un confronto diretto: "un
    // pokemon al 75 con Lucky Egg mi dava 5.5k, qui un 42 ne dava 15k") era
    // sproporzionato: con 8 medaglie diventava un ×5 aggiuntivo, che sommato
    // al bonus allenatore portava l'EXP a quasi 10 volte il valore reale.
    // Richiesta esplicita di Luca (9 ott 2026): i selvatici devono dare la
    // METÀ dell'EXP di un allenatore (non la formula vera dei giochi, dove il
    // rapporto è 1:1.5) — teniamo il bonus allenatore ×1.5 di sempre e
    // scaliamo SOLO il selvatico a ×0.75, così selvatico/allenatore = 0.5 esatto.
    // Allenatori "senza ricompensa" (es. Bosco del Signor Tuscolo, richiesta
    // Luca 19 ott 2026): niente EXP né EV, a prescindere da tutto il resto —
    // premioSoldi è già 0 dal chiamante (vedi _avviaLottaTrainer in js/map.js).
    if (mioVivoPerExp && !(datiAllenatore && datiAllenatore.senzaExp)) {
      let exp = Math.max(10, Math.floor(nemico.baseExp * nemico.livello / 7));
      if (modalita === 'allenatore') exp = Math.floor(exp * 1.5);
      else exp = Math.floor(exp * 0.75);
      await assegnaExp(mio, exp);
      // EV (richiesta di Luca, 10 ott 2026): solo a chi è sceso in campo
      // davvero, NON a chi riceve solo l'EXP condivisa — stessa regola dei
      // giochi veri (l'Esperienza Condivisa non condivide gli EV).
      assegnaEv(mio, nemico.evYield);

      // EXP condivisa con il resto della squadra (sess. 29 set 2026: diventata
      // un'opzione, proposta la prima volta insieme alla scelta della
      // difficoltà — vedi _sceltaRivale in app.js — e sempre disattivabile
      // dal menu Opzioni). Chi ha sferrato il colpo decisivo ("mio") guadagna
      // il pieno, gli altri in squadra il 55%, in sordina —
      // assegnaExp(..., silenzioso=true) non mostra il messaggio "guadagna X
      // Punti Esperienza" né la barra/il riquadro statistiche, ma il "sale al
      // livello" resta sempre visibile.
      if (statoGioco.opzioni && statoGioco.opzioni.expCondivisa) {
        const expCondivisa = Math.max(1, Math.floor(exp * 0.55));
        for (const compagno of statoGioco.squadra) {
          if (compagno === mio || compagno.hpAttuale <= 0) continue;
          await assegnaExp(compagno, expCondivisa, true);
        }
      }
    }

    // L'allenatore manda in campo il prossimo Pokémon, se ne ha ancora vivo.
    // Bug corretto 22 ott 2026 (segnalato da Luca, caso Ginevra): "indiceNemico
    // < squadraNemica.length - 1" presumeva un ordine fisso per posizione —
    // falso dopo uno switch dell'IA a metà lotta (_provaSwitchNemico può
    // schierare QUALSIASI posizione, non solo in sequenza). Con l'ordine
    // fisso, battere un Pokémon mandato in campo da uno switch "in avanti"
    // (es. l'ultimo della squadra) chiudeva subito la lotta come vittoria,
    // anche con altri Pokémon ancora vivi — o, in altri casi, rimandava in
    // campo un Pokémon già KO. Ora si cerca semplicemente il primo Pokémon
    // ANCORA VIVO nella squadra (hpAttuale > 0), in qualsiasi posizione.
    const prossimoIndice = squadraNemica.findIndex(p => p && p.hpAttuale > 0);
    if (modalita === 'allenatore' && prossimoIndice !== -1) {
      indiceNemico = prossimoIndice;
      nemico = squadraNemica[indiceNemico];
      aggiornaSprite(true);
      aggiornaPannelli();
      await animaEntrataPokemon('nemico');
      const rimasti = squadraNemica.filter(p => p && p.hpAttuale > 0).length;
      await di(`${datiAllenatore.nome} manda in campo ${nemico.nome}! (gliene restano ${rimasti})`);
      await attivaAbilitaIngresso(nemico, etichettaNemico(), mio, mio.nome);
      // KO doppio (22 ott 2026): se "mio" è morto nello stesso scambio (es.
      // Autodistruzione), tocca comunque scegliere il sostituto PRIMA di
      // riaprire il menu principale — altrimenti restava in campo a 0 HP.
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
      mostraMenuPrincipale();
      return;
    }

    // Vittoria definitiva
    if (modalita === 'allenatore') {
      await di(`Hai sconfitto ${datiAllenatore.nome}! 🎉`);
      // Ricompensa in denaro (F9.2): l'allenatore paga il vincitore
      if (datiAllenatore.premioSoldi) {
        // Amomoneta: raddoppia il premio se il Pokémon in campo la tiene
        const premio = mio.oggetto === 'amomoneta' ? datiAllenatore.premioSoldi * 2 : datiAllenatore.premioSoldi;
        statoGioco.soldi = (statoGioco.soldi || 0) + premio;
        await di(`Hai ricevuto ₽${premio} per la vittoria!` + (mio.oggetto === 'amomoneta' ? ' (Amomoneta! 🪙)' : ''));
      }
      if (datiAllenatore.dialogoSconfitta) {
        await di(`${datiAllenatore.nome}: «${datiAllenatore.dialogoSconfitta}»`);
      }
    } else {
      // Lotta selvatica: senza dialoghi dopo (a differenza degli allenatori
      // sopra), si passava DRITTI da assegnaExp a fineBattaglia — la
      // schermata di lotta spariva subito, tagliando la barra Exp a metà
      // animazione (bug segnalato da Luca: "la barra blu non si riempie,
      // si leva subito la schermata"). Una pausa breve la lascia vedere.
      await new Promise(r => setTimeout(r, durataFx(600)));
    }
    // Raccogliscorte (pickup, 20 ott 2026): 10% di possibilità a fine lotta
    // (qualunque lotta, vinta) di trovare un oggetto comune, per ciascun
    // membro della squadra che lo possiede e non porta già nulla — vera
    // meccanica a passi nei giochi originali, qui semplificata a "per
    // lotta vinta" per restare dentro al motore esistente.
    const OGGETTI_PICKUP = ['pozione', 'superpozione', 'antidoto', 'pokeball', 'repellente'];
    if (statoGioco.squadra) {
      for (const compagno of statoGioco.squadra) {
        if (compagno.hpAttuale <= 0 || compagno.abilitaChiave !== 'pickup' || compagno.oggetto) continue;
        if (Math.random() < 0.1) {
          const trovato = OGGETTI_PICKUP[Math.floor(Math.random() * OGGETTI_PICKUP.length)];
          compagno.oggetto = trovato;
          const nomeOgg = (typeof OGGETTI !== 'undefined' && OGGETTI[trovato]) ? OGGETTI[trovato].nome : trovato;
          await di(`${compagno.nome} ha trovato ${nomeOgg} grazie a Raccogliscorte!`);
        }
      }
    }
    fineBattaglia('vittoria');
  }

  // Sconfitta totale (richiesta esplicita di Luca): come nei giochi veri,
  // non si resta fermi dove si era — si riparte davanti alla porta
  // dell'ultimo Centro Pokémon in cui ci si è curati (stato.ultimoCentroCura,
  // registrato da interagisciCentroTiled in map.js). Se non ci si è ancora
  // curati da nessuna parte (es. appena partiti, fra Borgata Tuscolana e
  // Frascati), si torna al punto di partenza vero e proprio del gioco.
  function _teletrasportaCentroPokemon() {
    if (nienteTeleportSuSconfitta) return;   // vedi avvia(): 1a lotta col rivale nel lab
    // Superquattro/Campione (20 ott 2026): la Lega ha un suo redirect dedicato
    // (torna all'ingresso, js/map.js) che chiama la STESSA caricaMappa() di
    // qui sotto — due in corsa altrimenti, con risultato imprevedibile (a
    // volte si finiva fuori dal Centro Pokémon invece che all'ingresso).
    if (datiAllenatore && datiAllenatore.legaDefeat) return;
    if (typeof GameMap === 'undefined' || !GameMap.vaiAMappa) return;
    const centro = statoGioco.ultimoCentroCura;
    if (centro && centro.mappa) {
      GameMap.vaiAMappa(centro.mappa, centro.tx, centro.ty);
    } else {
      GameMap.vaiAMappa('borgata_tuscolana');
    }
  }

  async function gestisciKO() {
    await di(`${mio.nome} è esausto!`);

    const vivi = statoGioco.squadra.filter(p => p.hpAttuale > 0);
    if (vivi.length === 0) {
      // Sconfitta totale: si torna al sicuro con la squadra curata
      await di('Non hai più Pokémon in grado di lottare!');
      await di('Torni di corsa indietro e curi la squadra...');
      statoGioco.squadra.forEach(p => {
        p.hpAttuale = p.hpMax;
        p.condizione = null; // la cura completa rimuove anche lo stato alterato
        p.mosse.forEach(m => { m.pp = m.ppMax; });
      });
      fineBattaglia('sconfitta');
      _teletrasportaCentroPokemon();
    } else {
      // C'è ancora qualcuno: scelta obbligatoria del sostituto
      mostraMenuSquadra(true);
    }
  }

  // Dissolvenza in uscita (richiesta esplicita di Luca: "non tornare subito
  // istant alla schermata di gioco, ci metterei mezzo secondo di
  // dissolvenza"): invece di nascondere di colpo #schermata-battaglia,
  // sfuma in opacità e solo DOPO la sfumatura la nasconde per davvero
  // (display:none, vedi .dissolvenza-uscita in style.css). onFine() parte
  // comunque subito, invariato: la logica di gioco (teletrasporti, dialoghi
  // ecc.) non aspetta l'animazione, è solo un effetto visivo sopra.
  function _dissolviBattaglia() {
    const el = $('schermata-battaglia');
    el.classList.add('dissolvenza-uscita');
    setTimeout(() => {
      el.classList.add('nascosto');
      el.classList.remove('dissolvenza-uscita');
    }, 500);
  }

  function fineBattaglia(esito) {
    inCorso = false;
    _dissolviBattaglia();
    if (typeof Musica !== 'undefined') {
      if (esito === 'vittoria' && tipoBattagliaMusica !== 'rivale') {
        // Niente jingle di vittoria per il rivale: lì di solito segue
        // subito una cutscene/dialogo con la sua musica propria.
        Musica.suonaVittoria(tipoBattagliaMusica);
        setTimeout(() => Musica.ripristina(), 3000);
      } else {
        Musica.ripristina();
      }
    }
    if (onFine) onFine(esito);
  }

  /* ==========================================================
     CARAMELLA RARA (modalità test): +1 livello fuori battaglia.
     Replica il level-up di battaglia (statistiche, nuove mosse,
     evoluzione) ma senza interfaccia: restituisce i messaggi
     da mostrare, ci pensa app.js a visualizzarli.
     ========================================================== */

  async function caramellaRara(ist, levelCap) {
    // Stesso principio di assegnaExp qui sopra: il giocatore resta sempre
    // un livello sotto l'asso del capopalestra, non arriva mai a pari.
    if (ist.livello >= levelCap - 1) {
      return { ok: false, messaggi: [`⛔ ${ist.nome} è già al massimo consentito (Lv.${levelCap - 1}): serve la prossima medaglia!`] };
    }

    const messaggi = [];
    ist.livello += 1;
    ist.exp = Math.max(ist.exp, Math.pow(ist.livello, 3));
    const vecchioHpMax = ist.hpMax;
    ricalcolaStatistiche(ist);
    ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - vecchioHpMax));
    messaggi.push(`✨ ${ist.nome} sale al livello ${ist.livello}!`);

    // Nuove mosse imparate a questo livello (anche qui: ricontrollata DOPO
    // un'eventuale evoluzione, stesso bug/fix di assegnaExp — vedi commento
    // lì, 10 ott 2026).
    const controllaNuoveMosseCaramella = async () => {
      const nuove = (ist.mosseImparabili || []).filter(m => m.livello === ist.livello);
      for (const voce of nuove) {
        if (ist.mosse.some(s => s.nome === voce.nome)) continue;
        let dettagli;
        try { dettagli = await PokeAPI.getMossa(voce.nome, voce.url); }
        catch (e) { continue; }
        if (!mossaUtile(dettagli)) continue; // stesso fix di controllaNuoveMosse
        if (ist.mosse.length < 4) {
          ist.mosse.push({ ...dettagli, pp: dettagli.ppMax });
          messaggi.push(`${ist.nome} impara ${dettagli.nomeIt}!`);
        } else {
          messaggi.push(`${ist.nome} vorrebbe imparare ${dettagli.nomeIt}, ma conosce già 4 mosse.`);
        }
      }
    };
    await controllaNuoveMosseCaramella();

    // Evoluzione per livello/felicità (EVOLUZIONI_DB)
    try {
      if (ist.felicita != null) ist.felicita = Math.min(255, ist.felicita + 5);
      const evo = trovaEvoluzioneAuto(ist);
      if (evo) {
        const vecchioNome = ist.nome;
        await evolviIstanza(ist, evo.idEvo);
        messaggi.push(`🎉 ${vecchioNome} si è evoluto in ${ist.nome}!`);
        await controllaNuoveMosseCaramella();   // la specie nuova potrebbe imparare una mossa propria a QUESTO stesso livello
      }
    } catch (err) {
      console.warn('[Battle] Controllo evoluzione (caramella) saltato:', err.message);
    }

    return { ok: true, messaggi };
  }

  /* ==========================================================
     AVVIO DELLA BATTAGLIA
     ========================================================== */

  // Collega i 4 pulsanti fissi del menu principale (una volta sola)
  function collegaUI() {
    if (uiCollegata) return;
    uiCollegata = true;
    // I 4 pulsanti del menu principale sono condivisi dai due motori: in
    // modalità doppia i click vanno instradati sulle funzioni doppia-specifiche
    // invece di quelle del motore 1v1 (mio/nemico non esistono in doppia).
    $('btn-attacca').addEventListener('click', () => modoDoppia ? mostraMenuMosseDoppia(doppiaSlotCorrente) : mostraMenuMosse());
    $('btn-pokemon').addEventListener('click', () => modoDoppia ? mostraMenuSquadraDoppia(doppiaSlotCorrente, false) : mostraMenuSquadra(false));
    $('btn-zaino').addEventListener('click', () => modoDoppia ? mostraMenuZainoDoppia(doppiaSlotCorrente) : mostraMenuZaino());
    $('btn-fuga').addEventListener('click', () => modoDoppia ? _doppiaSuFuga() : tentaFuga());
  }

  // Sfondi di battaglia (sprites/Battlebacks/): "<tema>_bg.png" dietro a tutto,
  // "<tema>_base0.png" sotto il Pokémon avversario, "<tema>_base1.png" sotto il
  // nostro. "grass" non ha un proprio _bg (usa "field_bg.png", il compagno di
  // "field" nella cartella); tutti gli altri temi hanno bg+base0+base1 propri.
  // #battaglia-schermo è SEMPRE 512x384px "nativi" (vedi style.css — stessa
  // risoluzione di Settings::SCREEN_WIDTH/HEIGHT in Essentials FRLG reale):
  // qui si calcola solo un transform:scale() UNIFORME (stessa scala sui due
  // assi, proporzioni originali sempre preservate) per adattarlo allo
  // spazio disponibile, "il più grande possibile dentro #battaglia-campo
  // senza deformarsi né tagliarsi" — richiesta esplicita di Luca: PC e
  // mobile devono risultare ESTETICAMENTE IDENTICI, solo più piccoli su
  // schermo piccolo. (Una versione precedente scalava solo in base alla
  // larghezza per eliminare lo spazio vuoto ai lati/sotto: eliminava lo
  // spreco ma rompeva le proporzioni fra i due dispositivi — sbagliato,
  // tornato indietro.) Lo spazio eventualmente vuoto ai lati (schermi molto
  // larghi) resta coperto dallo sfondo sfocato a tutto campo
  // (#battaglia-sfondo-esteso), non da bande grigie vuote.
  // Fattore di scala visivo corrente (memorizzato: serve a chiunque debba
  // posizionare un elemento dentro #battaglia-schermo usando coordinate
  // MISURATE a schermo reale via getBoundingClientRect — quelle vanno
  // riportate allo spazio LOCALE/nativo del box (÷ scala) prima di scriverle
  // come style.left/top, altrimenti il transform le scala una seconda volta
  // — vedi centroSprite/animaEntrataPokemon/animaLancioBall più sotto).
  let scalaBattagliaCorrente = 1;
  function _dimensionaSchermoBattaglia() {
    const campo = $('battaglia-campo');
    const schermo = $('battaglia-schermo');
    if (!campo || !schermo) return;
    const availW = campo.clientWidth, availH = campo.clientHeight;
    scalaBattagliaCorrente = Math.min(availW / 512, availH / 384) || 1;
    schermo.style.transform = `scale(${scalaBattagliaCorrente})`;
  }
  window.addEventListener('resize', _dimensionaSchermoBattaglia);

  function impostaSfondoBattaglia(tema) {
    tema = tema || 'grass';
    const cartella = 'sprites/Battlebacks/';
    const bgFile = (tema === 'grass') ? 'field_bg.png' : `${tema}_bg.png`;
    // "campo" qui è lo SCHERMO nativo 512x384 (#battaglia-schermo), non il
    // contenitore #battaglia-campo: lo sfondo nitido e la scala di
    // piattaforme/sprite vanno calcolati sulle dimensioni reali dello schermo
    // nativo, non su tutto il viewport, altrimenti torna il bug del
    // battleback stirato/enorme. Il riempimento ai lati (niente bande nere,
    // PROBLEMA 2) è un layer a parte, #battaglia-sfondo-esteso, impostato
    // sotto: stesso file, "cover" su tutto #battaglia-campo, sfocato — non
    // tocca mai lo schermo nitido.
    _dimensionaSchermoBattaglia();
    const sfondoEsteso = $('battaglia-sfondo-esteso');
    if (sfondoEsteso) sfondoEsteso.style.backgroundImage = `url('${cartella}${bgFile}')`;
    const campo = $('battaglia-schermo');
    if (campo) {
      campo.style.backgroundImage = `url('${cartella}${bgFile}')`;
      campo.style.backgroundSize = 'cover';
      campo.style.backgroundPosition = 'center bottom';
      // water_bg.png è quasi bianco/pastello di suo (verificato: è così anche
      // nell'asset originale Essentials, pensato per una tinta applicata
      // altrove nel motore vero). Senza quella tinta risulta uno sfondo
      // sbiadito invece che acqua: aggiungiamo un blu di fondo con
      // "multiply" così le venature chiare del PNG restano visibili sopra.
      if (tema === 'water') {
        campo.style.backgroundColor = '#3f7fc4';
        campo.style.backgroundBlendMode = 'multiply';
        if (sfondoEsteso) { sfondoEsteso.style.backgroundColor = '#3f7fc4'; sfondoEsteso.style.backgroundBlendMode = 'multiply'; }
      } else {
        campo.style.backgroundColor = '';
        campo.style.backgroundBlendMode = '';
        if (sfondoEsteso) { sfondoEsteso.style.backgroundColor = ''; sfondoEsteso.style.backgroundBlendMode = ''; }
      }
    }
    // Dimensioni reali Essentials: base0 (giocatore) 256x64px, base1 (nemico)
    // 256x128px — NON la stessa forma scalata uniformemente (era il bug
    // segnalato da Luca: usavamo scale(4.5) identico per entrambe, ma
    // l'originale ha proporzioni diverse tra le due piattaforme).
    // #battaglia-schermo ora è SEMPRE 512px nativi (vedi
    // _dimensionaSchermoBattaglia): sprite/piattaforme si dimensionano in
    // pixel NATIVI fissi (scala=1) e il transform:scale() dell'ancestor li
    // riporta automaticamente alla dimensione reale corretta per qualunque
    // schermo. PRIMA si leggeva campo.getBoundingClientRect().width (la
    // dimensione REALE già scalata) per ricavare "scala" e poi si scriveva
    // quel valore come pixel LOCALI — un doppio scaling che su mobile
    // rimpiccioliva gli sprite invece di ingrandirli (bug introdotto nel
    // passaggio al transform, corretto qui).
    const scala = 1;
    // Slot 0 (id normali) sempre; in doppia anche lo slot 1 (id "-2"), che il
    // CSS (.doppia) rimpicciolisce e riposiziona come un'unica unità tramite
    // transform: scale(), quindi qui usa le stesse dimensioni "native" dello
    // slot 0 — vedi style.css.
    _impostaSpriteEPiattaforma('', cartella, tema, scala);
    if (modoDoppia) _impostaSpriteEPiattaforma('-2', cartella, tema, scala);
  }

  // Applica dimensioni sprite + piattaforma per uno slot di battaglia
  // (suffix '' = slot 0, '-2' = slot 1 della doppia). Estratto da
  // impostaSfondoBattaglia per essere riusabile su entrambi gli slot.
  function _impostaSpriteEPiattaforma(suffix, cartella, tema, scala) {
    const spriteNemico = $('nemico-sprite' + suffix);
    const spriteGiocatore = $('giocatore-sprite' + suffix);
    const piattaformaNemico = document.querySelector('#zona-nemico' + suffix + ' .piattaforma');
    const piattaformaGiocatore = document.querySelector('#zona-giocatore' + suffix + ' .piattaforma');
    if (spriteNemico) { spriteNemico.style.position = 'relative'; spriteNemico.style.zIndex = '2'; }
    if (spriteGiocatore) { spriteGiocatore.style.position = 'relative'; spriteGiocatore.style.zIndex = '2'; }
    // Dimensioni sprite Pokémon proporzionate allo schermo nativo 512
    // (fronte nemico 128px, dorso giocatore 160px a scala 1). Erano state
    // ingrandite ~12% ("avversario più grande"), tornate alla dimensione
    // di prima: ora che il resto della scena segue le proporzioni ESATTE
    // di Essentials, ingrandire solo questa a occhio rompeva di nuovo
    // l'equilibrio — se serve un ritocco va fatto DOPO aver verificato il
    // risultato fedele, non prima.
    const DIM_NEMICO = 128;
    if (spriteNemico) {
      spriteNemico.style.width = (DIM_NEMICO * scala) + 'px';
      spriteNemico.style.height = (DIM_NEMICO * scala) + 'px';
    }
    if (spriteGiocatore) {
      spriteGiocatore.style.width = (160 * scala) + 'px';
      spriteGiocatore.style.height = (160 * scala) + 'px';
    }
    if (piattaformaNemico) {
      // Sess. 1 ott 2026 (bug reale segnalato da Luca: "battleback di
      // dimensioni strane"): i file *_base1.png NON sono tutti 256×128 come
      // si assumeva qui — verificato sui file veri: champion/elite1-4 sono
      // 256×64 (metà altezza), tutti gli altri temi 256×128. Forzare un
      // riquadro 256×128 fisso con background-size:contain per TUTTI
      // rimpiccioliva la piattaforma della Lega (letterboxed nel riquadro
      // troppo alto). Altezza vera per tema, invece di una costante unica.
      const ALTEZZA_BASE1_DIMEZZATA = ['champion', 'elite1', 'elite2', 'elite3', 'elite4'];
      const h128 = ALTEZZA_BASE1_DIMEZZATA.includes(tema) ? 64 : 128;
      const w = 256 * scala, h = h128 * scala;
      piattaformaNemico.style.background = 'none';
      piattaformaNemico.style.backgroundImage = `url('${cartella}${tema}_base1.png')`;
      piattaformaNemico.style.backgroundSize = 'contain';
      piattaformaNemico.style.backgroundRepeat = 'no-repeat';
      piattaformaNemico.style.backgroundPosition = 'center';
      piattaformaNemico.style.transform = '';
      piattaformaNemico.style.width = w + 'px';
      piattaformaNemico.style.height = h + 'px';
      // Sess. 1 ott 2026: il Pokémon nemico "fluttuava" di poco sopra il
      // centro della piattaforma (segnalato da Luca, PC e mobile) — nudge
      // minimo (0.85→0.89) per avvicinare la base dello sprite al centro.
      piattaformaNemico.style.marginTop = (-(DIM_NEMICO * scala) * 0.89) + 'px';
    }
    if (piattaformaGiocatore) {
      const w = 256 * scala, h = 64 * scala;
      piattaformaGiocatore.style.background = 'none';
      piattaformaGiocatore.style.backgroundImage = `url('${cartella}${tema}_base0.png')`;
      piattaformaGiocatore.style.backgroundSize = 'contain';
      piattaformaGiocatore.style.backgroundRepeat = 'no-repeat';
      piattaformaGiocatore.style.backgroundPosition = 'center';
      piattaformaGiocatore.style.transform = '';
      piattaformaGiocatore.style.width = w + 'px';
      piattaformaGiocatore.style.height = h + 'px';
      piattaformaGiocatore.style.marginTop = (-(160 * scala) * 0.56) + 'px';
    }
  }

  // Battaglia selvatica:    { idPokemon, livello, zona, stato, onFine }
  // Battaglia allenatore:   { allenatore: { nome, squadra: [{id,livello}], dialogoSconfitta }, stato, onFine }
  // Battaglia leggendario:  { idPokemon, livello, fuggireImpossibile:true, stato, onFine }
  async function avvia(opzioni) {
    if (inCorso) return;
    inCorso = true;
    statoGioco = opzioni.stato;
    onFine = opzioni.onFine || null;
    modalita = opzioni.allenatore ? 'allenatore' : 'selvatico';
    datiAllenatore = opzioni.allenatore || null;
    // Musica di lotta: chi chiama avvia() può specificare 'capopalestra'/
    // 'rivale' tramite opzioni.tipoMusica (più preciso di modalita, che
    // conosce solo selvatico/allenatore); altrimenti usa 'modalita'.
    tipoBattagliaMusica = opzioni.tipoMusica || modalita;
    if (typeof Musica !== 'undefined') Musica.suonaBattaglia(tipoBattagliaMusica);
    scorteCuraNemico = (datiAllenatore && Array.isArray(datiAllenatore.oggettiCura))
      ? datiAllenatore.oggettiCura.map(o => ({ chiave: o.chiave, quantita: o.quantita }))
      : null;
    numeroTurnoBattaglia = 0;
    ultimoSwitchVolontarioTurno = -99;
    fuggireImpossibile = opzioni.fuggireImpossibile || false;
    // Richiesta esplicita di Luca: la primissima lotta col rivale nel
    // laboratorio è l'UNICO caso in tutto il gioco in cui una sconfitta non
    // teletrasporta al Centro Pokémon — si resta lì, gestisce tutto una
    // piccola cutscene dedicata in app.js dopo la lotta.
    nienteTeleportSuSconfitta = !!opzioni.senzaTeleportSuSconfitta;
    // Difesa: se la lotta precedente era in doppia e per qualunque motivo
    // fineBattagliaDoppia() non ha ripulito lo stato, modoDoppia restava
    // "true" — con quel flag agganciato, aggiornaPannelli()/aggiornaSprite()
    // richiamano SEMPRE le varianti doppia (che leggono doppiaNemiciAttivi/
    // doppiaMieiAttivi, qui vuoti): sprite/HP/sfondo sparivano del tutto in
    // una lotta singola dopo una doppia (bug del boss dell'Osservatorio,
    // sess. 18 set 2026 — non bastava solo la classe CSS "doppia", andava
    // anche il flag). Una lotta singola parte SEMPRE pulita da questo stato.
    modoDoppia = false;
    attacchiRitardati = [];   // nessuna "premonizione" residua da una lotta precedente
    collegaUI();

    // Meteo di mappa ereditato in battaglia (come nei giochi originali): se
    // stava piovendo/splendeva il sole/grandinava fuori, la lotta comincia
    // già con quel meteo attivo, "permanente" per tutta la battaglia.
    const meteoMappa = statoGioco && statoGioco.meteo ? statoGioco.meteo.tipo : null;
    meteoBattaglia = METEO_DA_MAPPA[meteoMappa] || null;
    meteoBattagliaTurni = meteoBattaglia ? 998 : 0;
    aggiornaMeteoUI();
    schermiMio = { reflect: 0, lightscreen: 0, safeguard: 0 };
    schermiNemico = { reflect: 0, lightscreen: 0, safeguard: 0 };
    const temaSfondo = opzioni.sfondo ||
      (typeof GameMap !== 'undefined' && GameMap.temaBattaglia ? GameMap.temaBattaglia() : 'grass');

    // Il primo Pokémon non-KO della squadra scende in campo
    indiceAttivo = statoGioco.squadra.findIndex(p => p.hpAttuale > 0);
    if (indiceAttivo < 0) { // non dovrebbe accadere: difesa extra
      inCorso = false;
      if (onFine) onFine('errore');
      return;
    }
    mio = statoGioco.squadra[indiceAttivo];
    azzeraModificatori(mio); // sbalzi di statistica freschi a inizio lotta
    mio.inCarica = null; mio.deveRicaricare = false; mio.seminvulnerabile = null; // niente carica/ricarica residue
    mio.furia = null; mio.confusione = 0; mio.protetto = false; mio.protConsecutivi = 0; // MOD 6B: stati volatili freschi

    // Mostriamo subito la schermata con un messaggio di caricamento
    nascondiMenu();
    $('schermata-battaglia').classList.remove('nascosto', 'dissolvenza-uscita');
    // Difesa: se la lotta precedente era in doppia (Battle.avviaDoppia), la
    // classe "doppia" riposiziona/ridimensiona TUTTI gli elementi del campo
    // (vedi style.css) — se restasse attaccata, una lotta singola dopo una
    // doppia renderebbe sprite/HP/sfondo tutti fuori posto o invisibili
    // (bug trovato sess. 18 set 2026: boss dell'Osservatorio dopo i grunt in
    // doppia). fineBattagliaDoppia() la toglie già a fine lotta, ma qui la
    // togliamo comunque per sicurezza, non deve mai dipendere da quello.
    $('schermata-battaglia').classList.remove('doppia');
    // Sfondo/piattaforme DOPO aver tolto "nascosto": impostaSfondoBattaglia
    // legge le dimensioni reali del campo (getBoundingClientRect), che sono
    // 0x0 finché lo schermo è display:none — prima le piattaforme uscivano
    // invisibili (larghezza calcolata 0px).
    impostaSfondoBattaglia(temaSfondo);
    $('battaglia-messaggio').textContent = modalita === 'allenatore'
      ? `${datiAllenatore.nome} si prepara alla lotta...`
      : 'Un Pokémon selvatico sta arrivando...';
    $('nemico-sprite').src = '';
    $('giocatore-sprite').src = '';

    try {
      if (modalita === 'allenatore') {
        // Creiamo l'intera squadra nemica (dalla cache è quasi istantaneo)
        squadraNemica = [];
        // Modalità FACILE (richiesta esplicita di Luca, sess. 22 set 2026:
        // "leggermente più facili, niente di esagerato"): ogni allenatore del
        // gioco, non solo il rivale, scende di 2 livelli (minimo 2). Niente
        // riduzione in modalità difficile o prima che la difficoltà sia scelta.
        const facile = statoGioco && statoGioco.difficolta === 'facile';
        for (const voce of datiAllenatore.squadra) {
          const livello = facile ? Math.max(2, voce.livello - 2) : voce.livello;
          const istanza = await creaIstanza(voce.id, livello, { evolviPerLivello: true, mosseFisse: voce.mosse, primaMossa: voce.primaMossa, prediligeCura: voce.prediligeCura });
          // "Cloni" con le mosse ESATTE di un Pokémon del giocatore (hack
          // dedicato a Maso, sess. 6 ott 2026): voce.mosseOverride è un
          // array già pronto (copiato da pkm.mosse altrove), sostituisce
          // il moveset normale deciso da creaIstanza/scegliMosse.
          if (Array.isArray(voce.mosseOverride) && voce.mosseOverride.length > 0) {
            istanza.mosse = voce.mosseOverride.map(m => ({ ...m, pp: m.ppMax }));
          }
          squadraNemica.push(istanza);
        }
        indiceNemico = 0;
        nemico = squadraNemica[0];
      } else {
        nemico = await creaIstanza(opzioni.idPokemon, opzioni.livello, { evolviPerLivello: true });
      }
    } catch (err) {
      console.error('[Battle] Errore nel creare il nemico:', err);
      await di('⚠️ Errore di connessione: la lotta non può iniziare!');
      fineBattaglia('errore');
      return;
    }

    aggiornaSprite(true);
    aggiornaPannelli();

    if (modalita === 'allenatore') {
      await di(`${datiAllenatore.nome} vuole lottare! (${squadraNemica.length} Pokémon)`);
      await animaEntrataPokemon('nemico');
      await di(`${datiAllenatore.nome} manda in campo ${nemico.nome}!`);
    } else {
      await animaEntrataPokemon('nemico');
      await di(`Un ${nemico.nome} selvatico appare! (Lv.${nemico.livello})`);
    }
    await animaEntrataPokemon('giocatore');
    await di(`Vai! ${mio.nome}!`);
    // Abilità all'ingresso (Intimidate/meteo automatico): il nemico è
    // sceso in campo per primo, quindi la sua eventualmente scatta prima.
    await attivaAbilitaIngresso(nemico, etichettaNemico(), mio, mio.nome);
    await attivaAbilitaIngresso(mio, mio.nome, nemico, etichettaNemico());
    if (meteoBattaglia) {
      const inizio = {
        sun: 'La luce del sole è intensa.', rain: 'Sta piovendo.',
        sandstorm: "C'è una tempesta di sabbia.", hail: 'Sta grandinando.',
      }[meteoBattaglia];
      if (inizio) await di(inizio);
    }
    mostraMenuPrincipale();
  }

  /* ============================================================
     LOTTA IN DOPPIO (2 allenatori vs 2 Pokémon del giocatore)

     Motore parallelo a quello sopra: usato solo quando 2 allenatori
     avvistano il giocatore nello stesso istante (js/map.js,
     _trainerSpottaDoppia). Riusa tutta la logica pura/generica del motore
     1v1 (creaIstanza, calcolaDanno, eseguiTurno, applicaStato,
     applicaCambiStat, assegnaExp, ecc.) e introduce solo lo stato e
     l'orchestrazione dei turni specifici per 4 battler contemporanei.

     IA e semplificazioni consapevoli (vedi anche piano di sessione):
     - l'IA dei 2 avversari è la stessa logica "mossa casuale tra quelle con
       PP" del motore singolo (sceglieMossaCasuale), non l'IA reale di
       Essentials (un sistema a parte, fuori scala per questo progetto);
     - gli oggetti dello zaino (Pozioni/X Item) si usano solo sul Pokémon
       attivo nello slot che sta agendo, come già nel motore 1v1 (usaPozione/
       usaXItem non hanno mai avuto un selettore bersaglio);
     - niente cattura (Ball): è sempre una lotta tra allenatori.
     ============================================================ */

  // Registra quale elemento DOM e quale lato rappresentano un'istanza attiva
  // in uno slot (0 o 1) della doppia — usato da elementoSprite/latoBattler.
  function _registraSlotDoppia(ist, lato, slot) {
    const suffix = slot === 0 ? '' : '-2';
    elementoPerBattler.set(ist, (lato === 'nemico' ? 'nemico-sprite' : 'giocatore-sprite') + suffix);
    latoPerBattler.set(ist, lato);
  }

  // Etichetta generica per i messaggi ("Nome" per i miei, "Nome avversario"
  // per i nemici) — equivalente doppia di etichettaNemico() del motore 1v1.
  function etichettaDi(ist) {
    if (!ist) return '';
    return latoBattler(ist) === 'giocatore' ? ist.nome : `${ist.nome} avversario`;
  }

  function aggiornaSpriteDoppia() {
    [0, 1].forEach(i => {
      const suf = i === 0 ? '' : '-2';
      const n = doppiaNemiciAttivi[i];
      if (n) {
        impostaSpriteConCache('nemico-sprite' + suf, n.sprite.fronte || '');
        applicaOffsetSpecie($('nemico-sprite' + suf), n.id, 'front');
      } else {
        $('nemico-sprite' + suf).src = '';
      }
      const m = doppiaMieiAttivi[i];
      if (m) {
        impostaSpriteConCache('giocatore-sprite' + suf, m.sprite.retro || m.sprite.fronte || '');
        applicaOffsetSpecie($('giocatore-sprite' + suf), m.id, m.sprite.retro ? 'back' : 'front');
      } else {
        $('giocatore-sprite' + suf).src = '';
      }
    });
  }

  function aggiornaPannelliDoppia() {
    [0, 1].forEach(i => {
      const suf = i === 0 ? '' : '-2';
      const n = doppiaNemiciAttivi[i];
      const infoN = $('info-nemico' + suf), zonaN = $('zona-nemico' + suf);
      if (n) {
        $('nemico-nome' + suf).textContent = n.nome + siglaCondizione(n);
        $('nemico-lv' + suf).textContent = 'Lv.' + n.livello;
        aggiornaBarraHp('nemico-hp' + suf, n.hpAttuale, n.hpMax);
        if (infoN) infoN.classList.remove('nascosto');
        if (zonaN) zonaN.classList.remove('nascosto');
      } else {
        if (infoN) infoN.classList.add('nascosto');
        if (zonaN) zonaN.classList.add('nascosto');
      }
      const m = doppiaMieiAttivi[i];
      const infoM = $('info-giocatore' + suf), zonaM = $('zona-giocatore' + suf);
      if (m) {
        $('giocatore-nome' + suf).textContent = m.nome + siglaCondizione(m);
        $('giocatore-lv' + suf).textContent = 'Lv.' + m.livello;
        aggiornaBarraHp('giocatore-hp' + suf, m.hpAttuale, m.hpMax);
        const hpTesto = $('giocatore-hp-testo' + suf);
        if (hpTesto) hpTesto.textContent = `${m.hpAttuale} / ${m.hpMax}`;
        if (infoM) infoM.classList.remove('nascosto');
        if (zonaM) zonaM.classList.remove('nascosto');
      } else {
        if (infoM) infoM.classList.add('nascosto');
        if (zonaM) zonaM.classList.add('nascosto');
      }
    });
  }

  /* ---------- Menu (principale/mosse/zaino/squadra) per slot ---------- */

  function mostraMenuPrincipaleDoppia(slot) {
    // Slot ALLEATO: mai un menu per il giocatore, IA "mossa casuale" come i
    // nemici (sceglieMossaCasuale gestisce già da sola ricarica/furia/PP
    // esauriti — stessa funzione, zero duplicazione).
    if (modoAlleato && slot === 1) {
      const m = doppiaMieiAttivi[1];
      if (!m || m.hpAttuale <= 0) return; // slot vuoto/KO: niente da fare
      const mieiVivi = doppiaMieiAttivi.filter(x => x && x.hpAttuale > 0);
      const mossa = sceglieMossaCasuale(m);
      const nemiciVivi = doppiaNemiciAttivi.filter(n => n && n.hpAttuale > 0);
      const bersagli = _doppiaBersagliIA(m, mossa, nemiciVivi).length
        ? _doppiaBersagliIA(m, mossa, nemiciVivi) : mieiVivi; // "user"/"users-field" → sé stesso
      _doppiaSceltaAzione(1, { tipo: 'mossa', mossa, bersagli });
      return;
    }
    doppiaSlotCorrente = slot;
    nascondiMenu();
    nascondiSelettoreBersaglio();
    const m = doppiaMieiAttivi[slot];
    if (!m || m.hpAttuale <= 0) return; // slot vuoto: niente da chiedere
    // Turno forzato: ricarica/2° turno di carica/furia in corso, come nel 1v1
    if (m.deveRicaricare || m.inCarica || m.furia) {
      let forzata = m.inCarica;
      if (!forzata && m.furia) forzata = m.mosse.find(x => x.nome === m.furia.nome);
      if (!forzata) forzata = mossaFallback();
      setTimeout(() => {
        const nemiciVivi = doppiaNemiciAttivi.filter(n => n && n.hpAttuale > 0);
        const bersagli = _doppiaBersagliIA(m, forzata, nemiciVivi);
        _doppiaSceltaAzione(slot, { tipo: 'mossa', mossa: forzata, bersagli });
      }, 60);
      return;
    }
    $('battaglia-messaggio').textContent = `Cosa deve fare ${m.nome}?`;
    $('menu-principale').classList.remove('nascosto');
    resetCursore();
  }

  let _ultimoCursoreMosseDoppia = [0, 0];
  function mostraMenuMosseDoppia(slot) {
    nascondiMenu();
    const m = doppiaMieiAttivi[slot];
    const menu = $('menu-mosse');
    menu.innerHTML = '';
    const tutteScariche = m.mosse.every(x => x.pp <= 0);
    m.mosse.forEach((mossa, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-mossa';
      btn.innerHTML =
        `<span class="mossa-nome">${mossa.nomeIt}</span>` +
        `<span class="tipo-badge" style="background:${TIPO_COLORI[mossa.tipo] || '#888'}">${TIPO_NOMI[mossa.tipo] || mossa.tipo}</span>` +
        `<span class="mossa-pp">PP ${mossa.pp}/${mossa.ppMax}</span>`;
      btn.disabled = mossa.pp <= 0;
      btn.addEventListener('click', () => { _ultimoCursoreMosseDoppia[slot] = idx; _doppiaSceltaMossa(slot, mossa); });
      menu.appendChild(btn);
    });
    if (tutteScariche) {
      const btn = document.createElement('button');
      btn.className = 'btn-mossa';
      btn.innerHTML = `<span class="mossa-nome">Scontro</span><span class="mossa-pp">PP ∞</span>`;
      btn.addEventListener('click', () => _doppiaSceltaMossa(slot, mossaFallback()));
      menu.appendChild(btn);
    }
    const indietro = document.createElement('button');
    indietro.className = 'btn-indietro';
    indietro.textContent = '↩ Indietro';
    indietro.addEventListener('click', () => mostraMenuPrincipaleDoppia(slot));
    menu.appendChild(indietro);
    menu.classList.remove('nascosto');
    impostaCursore(_ultimoCursoreMosseDoppia[slot] || 0);
  }

  // Tutti i Pokémon in campo tranne "ist" (entrambi i lati, vivi): è il vero
  // bersaglio delle mosse PokéAPI target:"all-other-pokemon" (Terremoto,
  // Surf, Scarica, Autodistruzione…), che nei giochi veri colpiscono ANCHE
  // il proprio compagno in doppio — a differenza di "all-opponents"/
  // "both-opponents" (es. Valanga, Ronzio, Vento Ghiacciato), che colpiscono
  // SOLO gli avversari. Prima di questa distinzione (sess. 12 set 2026,
  // segnalato da Luca: "le mosse AOE fanno danni anche al mio compagno")
  // le due categorie erano trattate uguali, escludendo sempre l'alleato:
  // corretto per "all-opponents", sbagliato per "all-other-pokemon".
  function _bersagliTuttiTranneMe(ist) {
    return [...doppiaMieiAttivi, ...doppiaNemiciAttivi].filter(x => x && x !== ist && x.hpAttuale > 0);
  }

  // Determina i bersagli di una mossa scelta per "slot": mosse verso sé
  // stessi vanno dritte, "all-other-pokemon" colpisce tutti tranne chi
  // attacca (compagno incluso), "all-opponents"/"both-opponents" colpiscono
  // tutti i nemici vivi automaticamente, quelle a bersaglio singolo con 2
  // nemici vivi aprono il selettore bersaglio.
  function _doppiaSceltaMossa(slot, mossa) {
    const seStesso = mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field';
    const tuttiTranneMe = mossa.bersaglio === 'all-other-pokemon';
    const soloNemici = mossa.bersaglio === 'all-opponents' || mossa.bersaglio === 'both-opponents';
    const nemiciVivi = doppiaNemiciAttivi.filter(n => n && n.hpAttuale > 0);
    if (seStesso) {
      _doppiaSceltaAzione(slot, { tipo: 'mossa', mossa, bersagli: [doppiaMieiAttivi[slot]] });
      return;
    }
    if (tuttiTranneMe) {
      _doppiaSceltaAzione(slot, { tipo: 'mossa', mossa, bersagli: _bersagliTuttiTranneMe(doppiaMieiAttivi[slot]) });
      return;
    }
    if (soloNemici || nemiciVivi.length <= 1) {
      _doppiaSceltaAzione(slot, { tipo: 'mossa', mossa, bersagli: nemiciVivi });
      return;
    }
    _mostraSelettoreBersaglio(nemiciVivi, (scelto) => {
      _doppiaSceltaAzione(slot, { tipo: 'mossa', mossa, bersagli: [scelto] });
    });
  }

  function _mostraSelettoreBersaglio(opzioni, callback) {
    nascondiMenu();
    const cont = $('selettore-bersaglio');
    cont.innerHTML = '';
    const titolo = document.createElement('div');
    titolo.className = 'selettore-titolo';
    titolo.textContent = 'Chi bersagli?';
    cont.appendChild(titolo);
    for (const ist of opzioni) {
      const btn = document.createElement('button');
      btn.innerHTML = `<span class="mossa-nome">${ist.nome}</span><span class="mossa-pp">${ist.hpAttuale}/${ist.hpMax} HP</span>`;
      btn.addEventListener('click', () => callback(ist));
      cont.appendChild(btn);
    }
    cont.classList.remove('nascosto');
    resetCursore();
  }

  function nascondiSelettoreBersaglio() {
    const cont = $('selettore-bersaglio');
    if (cont) cont.classList.add('nascosto');
  }

  function mostraMenuZainoDoppia(slot) {
    nascondiMenu();
    const menu = $('menu-zaino');
    menu.innerHTML = '';
    let almenoUno = false;
    for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
      if (oggetto.categoria !== 'cura' && oggetto.categoria !== 'xitem') continue; // niente Ball: lotta tra allenatori
      const quanti = statoGioco.zaino[chiave] || 0;
      if (quanti <= 0) continue;
      almenoUno = true;
      const btn = document.createElement('button');
      btn.innerHTML = `${oggetto.icona} ${oggetto.nome} <span class="mossa-pp">×${quanti}</span>`;
      btn.addEventListener('click', () => {
        // Richiesta esplicita di Luca (12 ott 2026, poi corretta): usare lo
        // Zaino nel turno di UN Pokémon deve poter curare QUALUNQUE Pokémon
        // della squadra — anche quelli in riserva, non solo i 2 in campo —
        // esattamente come il menu Zaino 1v1 (mostraMenuSquadraOggetto,
        // richiesta di Luca del 6 ott 2026: "ora anche sui Pokémon in
        // riserva"). Gli X Item restano SOLO sui 2 in campo: modificano gli
        // sbalzi di statistica (mod), che contano solo per la lotta in
        // corso — su un Pokémon in riserva sarebbero sprecati/senza senso
        // (nei giochi veri non è mai permesso).
        if (oggetto.categoria === 'cura') {
          _mostraSelettoreSquadraDoppia(slot, chiave);
          return;
        }
        const viviInCampo = [0, 1].map(i => doppiaMieiAttivi[i]).filter(m => m && m.hpAttuale > 0);
        if (viviInCampo.length > 1) {
          _mostraSelettoreBersaglio(viviInCampo, (scelto) => {
            _doppiaUsaXItem(slot, chiave, doppiaMieiIndici[doppiaMieiAttivi.indexOf(scelto)]);
          });
          return;
        }
        _doppiaUsaXItem(slot, chiave, doppiaMieiIndici[slot]);
      });
      menu.appendChild(btn);
    }
    if (!almenoUno) {
      const vuoto = document.createElement('button');
      vuoto.className = 'btn-mossa';
      vuoto.disabled = true;
      vuoto.innerHTML = '<span class="mossa-nome">Zaino vuoto (Pozioni/X Item)</span>';
      menu.appendChild(vuoto);
    }
    const indietro = document.createElement('button');
    indietro.className = 'btn-indietro';
    indietro.textContent = '↩ Indietro';
    indietro.addEventListener('click', () => mostraMenuPrincipaleDoppia(slot));
    menu.appendChild(indietro);
    menu.classList.remove('nascosto');
    resetCursore();
  }

  // Lista dell'INTERA squadra (non solo i 2 in campo) per scegliere il
  // bersaglio di una Pozione/X Item usata in doppia — stesso principio di
  // mostraMenuSquadraDoppia (etichette "in campo"/"in campo, alleato"),
  // riusato qui invece del vecchio selettore limitato ai soli 2 attivi.
  function _mostraSelettoreSquadraDoppia(slot, chiave) {
    nascondiMenu();
    const altro = slot === 0 ? 1 : 0;
    const menu = $('menu-squadra');
    menu.innerHTML = '';
    const oggetto = OGGETTI[chiave];
    statoGioco.squadra.forEach((pkm, idx) => {
      const inQuestoSlot = idx === doppiaMieiIndici[slot];
      const inAltroSlot = idx === doppiaMieiIndici[altro];
      const ko = pkm.hpAttuale <= 0;
      const btn = document.createElement('button');
      let extra = ko ? ' (KO)' : inQuestoSlot ? ' (in campo)' : inAltroSlot ? ' (in campo, alleato)' : '';
      btn.innerHTML =
        `<span class="mossa-nome">${pkm.nome}${extra}</span>` +
        `<span class="mossa-pp">Lv.${pkm.livello} · ${pkm.hpAttuale}/${pkm.hpMax} HP</span>`;
      btn.disabled = ko;
      btn.addEventListener('click', () => {
        if (oggetto.categoria === 'cura') _doppiaUsaPozione(slot, chiave, idx);
        else _doppiaUsaXItem(slot, chiave, idx);
      });
      menu.appendChild(btn);
    });
    const indietro = document.createElement('button');
    indietro.className = 'btn-indietro';
    indietro.textContent = '↩ Indietro';
    indietro.addEventListener('click', () => mostraMenuZainoDoppia(slot));
    menu.appendChild(indietro);
    menu.classList.remove('nascosto');
    resetCursore();
  }

  // "slot" = chi sta agendo (consuma il turno); "idxSquadra" = indice nella
  // squadra COMPLETA del bersaglio (in campo o in riserva, vedi
  // _mostraSelettoreSquadraDoppia).
  async function _doppiaUsaPozione(slot, chiave, idxSquadra) {
    const m = statoGioco.squadra[idxSquadra];
    const etichetta = (idxSquadra === doppiaMieiIndici[slot] || idxSquadra === doppiaMieiIndici[slot === 0 ? 1 : 0])
      ? m.nome : `${m.nome} (riserva)`;
    if (m.hpAttuale >= m.hpMax) {
      await di(`Gli HP di ${etichetta} sono già al massimo!`);
      _mostraSelettoreSquadraDoppia(slot, chiave);
      return;
    }
    nascondiMenu();
    statoGioco.zaino[chiave] -= 1;
    const cura = Math.min(OGGETTI[chiave].cura, m.hpMax - m.hpAttuale);
    m.hpAttuale += cura;
    aggiornaPannelli();
    await di(`${etichetta} recupera ${cura} HP! 🧪`);
    _doppiaSceltaAzione(slot, { tipo: 'nessuna' });
  }

  async function _doppiaUsaXItem(slot, chiave, idxSquadra) {
    const m = statoGioco.squadra[idxSquadra];
    const etichetta = (idxSquadra === doppiaMieiIndici[slot] || idxSquadra === doppiaMieiIndici[slot === 0 ? 1 : 0])
      ? m.nome : `${m.nome} (riserva)`;
    nascondiMenu();
    statoGioco.zaino[chiave] -= 1;
    const stat = OGGETTI[chiave].stat;
    const nome = STAT_NOMI[stat] || stat;
    const prima = m.mod[stat] || 0;
    m.mod[stat] = Math.max(-6, Math.min(6, prima + 1));
    aggiornaPannelli();
    if (m.mod[stat] === prima) await di(`${nome} di ${etichetta} non può aumentare ancora!`);
    else await di(`${nome} di ${etichetta} è aumentato! ${OGGETTI[chiave].icona}`);
    _doppiaSceltaAzione(slot, { tipo: 'nessuna' });
  }

  // obbligatorio = true quando questo slot è appena andato KO e va sostituito
  function mostraMenuSquadraDoppia(slot, obbligatorio) {
    nascondiMenu();
    const menu = $('menu-squadra');
    menu.innerHTML = '';
    const altro = slot === 0 ? 1 : 0;
    statoGioco.squadra.forEach((pkm, idx) => {
      const inQuestoSlot = idx === doppiaMieiIndici[slot];
      const inAltroSlot = idx === doppiaMieiIndici[altro];
      const btn = document.createElement('button');
      let extra = pkm.hpAttuale <= 0 ? ' (KO)' : inQuestoSlot ? ' (in campo)' : inAltroSlot ? ' (in campo, alleato)' : '';
      btn.innerHTML =
        `<span class="mossa-nome">${pkm.nome}${extra}</span>` +
        `<span class="mossa-pp">Lv.${pkm.livello} · ${pkm.hpAttuale}/${pkm.hpMax} HP</span>`;
      btn.disabled = pkm.hpAttuale <= 0 || inQuestoSlot || inAltroSlot;
      btn.addEventListener('click', () => _doppiaCambiaPokemon(slot, idx, obbligatorio));
      menu.appendChild(btn);
    });
    if (!obbligatorio) {
      const indietro = document.createElement('button');
      indietro.className = 'btn-indietro';
      indietro.textContent = '↩ Indietro';
      indietro.addEventListener('click', () => mostraMenuPrincipaleDoppia(slot));
      menu.appendChild(indietro);
    }
    menu.classList.remove('nascosto');
    resetCursore();
  }

  async function _doppiaCambiaPokemon(slot, idx, eraObbligatorio) {
    nascondiMenu();
    doppiaMieiIndici[slot] = idx;
    const nuovo = statoGioco.squadra[idx];
    doppiaMieiAttivi[slot] = nuovo;
    _registraSlotDoppia(nuovo, 'giocatore', slot);
    azzeraModificatori(nuovo);
    nuovo.inCarica = null; nuovo.deveRicaricare = false; nuovo.seminvulnerabile = null;
    nuovo.furia = null; nuovo.confusione = 0; nuovo.protetto = false; nuovo.protConsecutivi = 0;
    aggiornaSprite();
    aggiornaPannelli();
    await animaEntrataPokemon('giocatore', 'giocatore-sprite' + (slot === 0 ? '' : '-2'));
    await di(`Vai! ${nuovo.nome}!`);
    if (eraObbligatorio) {
      const resolve = doppiaSostituzioneInCorso;
      doppiaSostituzioneInCorso = null;
      if (resolve) resolve();
    } else {
      _doppiaSceltaAzione(slot, { tipo: 'nessuna' });
    }
  }

  async function _doppiaSuFuga() {
    await di('Non si può fuggire da una lotta tra allenatori!');
    mostraMenuPrincipaleDoppia(doppiaSlotCorrente);
  }

  // Registra l'azione scelta per "slot" e passa all'altro slot (se deve
  // ancora agire) o esegue il round quando entrambi hanno deciso.
  function _doppiaSceltaAzione(slot, azione) {
    doppiaAzioni[slot] = azione;
    nascondiMenu();
    nascondiSelettoreBersaglio();
    const altro = slot === 0 ? 1 : 0;
    if (doppiaMieiAttivi[altro] && doppiaMieiAttivi[altro].hpAttuale > 0 && !doppiaAzioni[altro]) {
      mostraMenuPrincipaleDoppia(altro);
    } else {
      _doppiaEseguiRound();
    }
  }

  /* ---------- Orchestrazione del round (ordine per priorità/velocità) ---------- */

  function _doppiaBersagliIA(ist, mossa, mieiVivi) {
    if (mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field') return [ist];
    if (mossa.bersaglio === 'all-other-pokemon') return _bersagliTuttiTranneMe(ist);
    if (mossa.bersaglio === 'all-opponents' || mossa.bersaglio === 'both-opponents') {
      return mieiVivi.slice();
    }
    if (mieiVivi.length === 0) return [];
    return [mieiVivi[Math.floor(Math.random() * mieiVivi.length)]];
  }

  async function _doppiaEseguiRound() {
    nascondiMenu();
    const mieiVivi = doppiaMieiAttivi.filter(m => m && m.hpAttuale > 0);

    const coda = [];
    for (let s = 0; s < 2; s++) {
      const m = doppiaMieiAttivi[s];
      const az = doppiaAzioni[s];
      if (m && m.hpAttuale > 0 && az && az.tipo === 'mossa') {
        coda.push({ ist: m, mossa: az.mossa, bersagli: az.bersagli.filter(b => b && b.hpAttuale > 0) });
      }
    }
    for (let s = 0; s < 2; s++) {
      const n = doppiaNemiciAttivi[s];
      if (!n || n.hpAttuale <= 0) continue;
      const mossa = _scegliMossaPesata(n, mieiVivi);
      const bersagli = _doppiaBersagliIA(n, mossa, mieiVivi);
      coda.push({ ist: n, mossa, bersagli });
    }

    // Priorità mossa, poi velocità effettiva, pareggi casuali — stessa
    // regola di turnoCompleto() nel motore 1v1, generalizzata a N battler.
    coda.sort((a, b) => {
      const pa = a.mossa.priorita || 0, pb = b.mossa.priorita || 0;
      if (pa !== pb) return pb - pa;
      const va = velocitaEffettiva(a.ist), vb = velocitaEffettiva(b.ist);
      if (va !== vb) return vb - va;
      return Math.random() - 0.5;
    });

    for (const azione of coda) {
      if (azione.ist.hpAttuale <= 0) continue; // può essere già svenuto in questo stesso round
      const bersagliVivi = azione.bersagli.filter(b => b.hpAttuale > 0);
      if (bersagliVivi.length === 0) continue; // il/i bersaglio/i sono già sconfitti
      const etichette = bersagliVivi.map(etichettaDi);
      if (bersagliVivi.length === 1) {
        await eseguiTurno(azione.ist, bersagliVivi[0], azione.mossa, etichettaDi(azione.ist), etichette[0]);
      } else {
        await eseguiTurno(azione.ist, bersagliVivi, azione.mossa, etichettaDi(azione.ist), etichette);
      }
      // Merito EXP: se ad agire è stato un mio Pokémon e un bersaglio nemico
      // è appena andato KO, gli viene accreditato (istanza nemica: proprietà
      // "usa e getta", mai salvata — non tocca lo stato persistente).
      if (latoBattler(azione.ist) === 'giocatore') {
        for (const b of bersagliVivi) {
          if (b.hpAttuale <= 0 && latoBattler(b) === 'nemico') b._datoDaMe = azione.ist;
        }
      }
      await _doppiaGestisciEventualiKO();
      if (await _doppiaControllaFine()) return;
    }

    doppiaAzioni = [null, null];
    await fineTurnoStatiDoppia();
    if (await _doppiaControllaFine()) return;
    _doppiaProssimoRound();
  }

  function _doppiaProssimoRound() {
    const primo = doppiaMieiAttivi.findIndex(m => m && m.hpAttuale > 0);
    if (primo < 0) return; // sconfitta totale: già gestita da _doppiaControllaFine
    mostraMenuPrincipaleDoppia(primo);
  }

  async function fineTurnoMeteoDoppia() {
    if (!meteoBattaglia) return;
    const _neutralizzataDoppia = [...doppiaMieiAttivi, ...doppiaNemiciAttivi]
      .some(x => x && x.hpAttuale > 0 && (x.abilitaChiave === 'cloud-nine' || x.abilitaChiave === 'air-lock'));
    if ((meteoBattaglia === 'sandstorm' || meteoBattaglia === 'hail') && !_neutralizzataDoppia) {
      const nomeMeteo = meteoBattaglia === 'sandstorm' ? 'tempesta di sabbia' : 'grandine';
      const tutti = [...doppiaMieiAttivi, ...doppiaNemiciAttivi].filter(x => x && x.hpAttuale > 0);
      for (const ist of tutti) {
        const immune = meteoBattaglia === 'sandstorm'
          ? (ist.tipi.includes('rock') || ist.tipi.includes('ground') || ist.tipi.includes('steel'))
          : ist.tipi.includes('ice');
        if (immune || ist.abilitaChiave === 'magic-guard') continue;
        const danno = Math.max(1, Math.floor(ist.hpMax / 16));
        ist.hpAttuale = Math.max(0, ist.hpAttuale - danno);
        lampeggia(ist);
        aggiornaPannelli();
        await di(`${etichettaDi(ist)} è colpito dalla ${nomeMeteo}!`);
      }
    }
    meteoBattagliaTurni -= 1;
    if (meteoBattagliaTurni <= 0) {
      const era = meteoBattaglia;
      meteoBattaglia = null;
      meteoBattagliaTurni = 0;
      aggiornaMeteoUI();
      if (METEO_FINE_MSG[era]) await di(METEO_FINE_MSG[era]);
    }
  }

  async function fineTurnoStatiDoppia() {
    await fineTurnoMeteoDoppia();
    const tutti = [...doppiaMieiAttivi, ...doppiaNemiciAttivi].filter(x => x && x.hpAttuale > 0);
    for (const ist of tutti) {
      if (!ist.condizione || ist.abilitaChiave === 'magic-guard') continue;
      if (ist.condizione.tipo === 'poison' || ist.condizione.tipo === 'burn') {
        const quantita = Math.max(1, Math.floor(ist.hpMax / 8));
        if (ist.condizione.tipo === 'poison' && ist.abilitaChiave === 'poison-heal') {
          ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + quantita);
          aggiornaPannelli();
          await di(`${etichettaDi(ist)} recupera HP grazie al Guarveleno!`);
        } else {
          ist.hpAttuale = Math.max(0, ist.hpAttuale - quantita);
          lampeggia(ist);
          aggiornaPannelli();
          const causa = ist.condizione.tipo === 'poison' ? 'dal veleno' : 'dalla scottatura';
          await di(`${etichettaDi(ist)} è tormentato ${causa}!`);
        }
      }
    }
    for (const ist of tutti) {
      if (ist.hpAttuale <= 0 || ist.hpAttuale >= ist.hpMax) continue;
      if (ist.oggetto !== 'rimasugli') continue;
      const cura = Math.max(1, Math.floor(ist.hpMax / 16));
      ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + cura);
      aggiornaPannelli();
      await di(`${etichettaDi(ist)} recupera un po' di HP grazie ai Rimasugli! 🍂`);
    }
    await _abilitaFineTurno(tutti.map(ist => [ist, etichettaDi(ist)]));
    await _elaboraAttacchiRitardati(
      () => { const b = doppiaMieiAttivi.find(m => m && m.hpAttuale > 0); return b ? { ist: b, etichetta: etichettaDi(b) } : null; },
      () => { const b = doppiaNemiciAttivi.find(m => m && m.hpAttuale > 0); return b ? { ist: b, etichetta: etichettaDi(b) } : null; },
    );
  }

  /* ---------- KO, sostituzioni, EXP, fine lotta ---------- */

  async function _doppiaExpKO(n) {
    // Bug segnalato da Luca (18 ott 2026): se chi ha sferrato il colpo di
    // grazia è svenuto nello stesso istante (es. Autodistruzione/Esplosione
    // che manda KO anche l'avversario), il vecchio controllo "hpAttuale > 0"
    // scartava il merito e, se nessun altro Pokémon era in campo, l'EXP
    // andava persa del tutto. Chi ha dato il colpo lo riceve comunque, a
    // prescindere dai suoi HP residui (coerente coi giochi veri).
    const vincitore = n._datoDaMe || doppiaMieiAttivi.find(m => m && m.hpAttuale > 0);
    if (!vincitore) return;
    // Stessa formula corretta del 1v1 (vedi nemicoSconfitto): baseExp*livello/7,
    // ×1.5 perché in doppia è sempre lotta tra allenatori. Niente moltiplicatore
    // per medaglia (rimosso, era sproporzionato — vedi commento in nemicoSconfitto).
    let exp = Math.max(10, Math.floor(n.baseExp * n.livello / 7));
    exp = Math.floor(exp * 1.5);
    await assegnaExp(vincitore, exp);
    assegnaEv(vincitore, n.evYield);
  }

  async function _doppiaGestisciEventualiKO() {
    for (let s = 0; s < 2; s++) {
      const m = doppiaMieiAttivi[s];
      if (!m || m.hpAttuale > 0) continue;
      await di(`${m.nome} è esausto!`);
      // Slot ALLEATO: sostituzione automatica dal SUO banco (stesso schema
      // dei nemici sotto), mai una scelta del giocatore — la squadra è
      // dell'alleato, non la mia.
      if (modoAlleato && s === 1) {
        doppiaMieiAttivi[1] = null;
        aggiornaPannelli();
        if (alleatoBanco.length > 0) {
          const prossimo = alleatoBanco.shift();
          doppiaMieiAttivi[1] = prossimo;
          _registraSlotDoppia(prossimo, 'giocatore', 1);
          aggiornaSprite();
          aggiornaPannelli();
          await animaEntrataPokemon('giocatore', 'giocatore-sprite-2');
          const rimasti = alleatoBanco.length + 1;
          await di(`${alleatoNome} manda in campo ${prossimo.nome}! (gliene restano ${rimasti})`);
        }
        continue;
      }
      const altro = s === 0 ? 1 : 0;
      const cEUnSostituto = statoGioco.squadra.some((p, idx) =>
        p.hpAttuale > 0 && idx !== doppiaMieiIndici[altro]);
      doppiaMieiAttivi[s] = null;
      aggiornaPannelli();
      if (!cEUnSostituto) continue; // lo slot resta vuoto: sconfitta totale gestita da _doppiaControllaFine
      await new Promise(resolve => {
        doppiaSostituzioneInCorso = resolve;
        mostraMenuSquadraDoppia(s, true);
      });
    }
    for (let s = 0; s < 2; s++) {
      const n = doppiaNemiciAttivi[s];
      if (!n || n.hpAttuale > 0) continue;
      await di(`${etichettaDi(n)} è esausto!`);
      await _doppiaExpKO(n);
      // Bench condiviso (un solo allenatore vero, 2 Pokémon suoi in campo):
      // il sostituto arriva SEMPRE dal bench dello slot 0, qualunque slot si
      // sia svuotato — è la stessa squadra, non due bench separati.
      const all = doppiaBancoCondiviso ? doppiaAllenatori[0] : doppiaAllenatori[s];
      const banco = doppiaBancoCondiviso ? doppiaBanchi[0] : doppiaBanchi[s];
      if (banco.length > 0) {
        const prossimo = banco.shift();
        doppiaNemiciAttivi[s] = prossimo;
        _registraSlotDoppia(prossimo, 'nemico', s);
        aggiornaSprite();
        aggiornaPannelli();
        await animaEntrataPokemon('nemico', 'nemico-sprite' + (s === 0 ? '' : '-2'));
        const rimasti = banco.length + 1;
        await di(`${all.nome} manda in campo ${prossimo.nome}! (gliene restano ${rimasti})`);
      } else {
        doppiaNemiciAttivi[s] = null;
        aggiornaPannelli();
      }
    }
  }

  async function _doppiaControllaFine() {
    const mieiVivi = statoGioco.squadra.some(p => p.hpAttuale > 0);
    if (!mieiVivi) {
      await di('Non hai più Pokémon in grado di lottare!');
      await di('Torni di corsa indietro e curi la squadra...');
      statoGioco.squadra.forEach(p => {
        p.hpAttuale = p.hpMax;
        p.condizione = null;
        p.mosse.forEach(m => { m.pp = m.ppMax; });
      });
      fineBattagliaDoppia('sconfitta');
      _teletrasportaCentroPokemon();
      return true;
    }
    const nemiciTotali = doppiaBanchi[0].length + doppiaBanchi[1].length +
      (doppiaNemiciAttivi[0] ? 1 : 0) + (doppiaNemiciAttivi[1] ? 1 : 0);
    if (nemiciTotali === 0) {
      await di('Hai vinto la lotta in doppio! 🎉');
      let premio = 0;
      const dialoghi = [];
      for (const all of doppiaAllenatori) {
        if (all.premioSoldi) premio += all.premioSoldi;
        if (all.dialogoSconfitta) dialoghi.push(`${all.nome}: «${all.dialogoSconfitta}»`);
      }
      if (premio > 0) {
        statoGioco.soldi = (statoGioco.soldi || 0) + premio;
        await di(`Hai ricevuto ₽${premio} per la vittoria!`);
      }
      for (const d of dialoghi) await di(d);
      fineBattagliaDoppia('vittoria');
      return true;
    }
    return false;
  }

  function fineBattagliaDoppia(esito) {
    inCorso = false;
    modoDoppia = false;
    // Stessa dissolvenza di fineBattaglia() (vedi lì): sfuma invece di
    // sparire di colpo. La classe "doppia" (layout) si toglie insieme a
    // "nascosto" a sfumatura conclusa, non subito, altrimenti il layout
    // cambierebbe di scatto a metà dissolvenza.
    const el = $('schermata-battaglia');
    el.classList.add('dissolvenza-uscita');
    setTimeout(() => {
      el.classList.add('nascosto');
      el.classList.remove('dissolvenza-uscita', 'doppia');
      // Bug segnalato da Luca (14 ott 2026, "la doppia fa saltare la
      // grafica delle lotte successive"): gli elementi del 2° slot
      // (zona/info-nemico-2, zona/info-giocatore-2) perdono "nascosto" in
      // aggiornaPannelliDoppia() mentre la doppia è in corso, ma nessuno lo
      // rimetteva qui alla fine — restavano "svelati" per sempre. La
      // prossima lotta (anche singola) non tocca mai questi id, quindi
      // restavano visibili, sovrapposti allo schermo normale.
      ['zona-nemico-2', 'zona-giocatore-2', 'info-nemico-2', 'info-giocatore-2'].forEach(id => {
        const e2 = $(id);
        if (e2) e2.classList.add('nascosto');
      });
    }, 500);
    const cb = doppiaOnFine;
    doppiaOnFine = null;
    doppiaAllenatori = [];
    doppiaBanchi = [[], []];
    doppiaBancoCondiviso = false;
    doppiaNemiciAttivi = [null, null];
    doppiaMieiAttivi = [null, null];
    doppiaMieiIndici = [null, null];
    doppiaAzioni = [null, null];
    modoAlleato = false;
    alleatoNome = '';
    alleatoBanco = [];
    if (cb) cb(esito);
  }

  /* ---------- Avvio ---------- */

  // opzioni: { allenatori: [{nome, squadra:[{id,livello}], dialogoSconfitta, premioSoldi}, {...}], stato, onFine, sfondo }
  async function avviaDoppia(opzioni) {
    if (inCorso) return;
    inCorso = true;
    modoDoppia = true;
    attacchiRitardati = [];   // nessuna "premonizione" residua da una lotta precedente
    statoGioco = opzioni.stato;
    doppiaOnFine = opzioni.onFine || null;
    doppiaAllenatori = opzioni.allenatori;
    collegaUI();

    const meteoMappa = statoGioco && statoGioco.meteo ? statoGioco.meteo.tipo : null;
    meteoBattaglia = METEO_DA_MAPPA[meteoMappa] || null;
    meteoBattagliaTurni = meteoBattaglia ? 998 : 0;
    aggiornaMeteoUI();
    schermiMio = { reflect: 0, lightscreen: 0, safeguard: 0 };
    schermiNemico = { reflect: 0, lightscreen: 0, safeguard: 0 };
    const temaSfondo = opzioni.sfondo ||
      (typeof GameMap !== 'undefined' && GameMap.temaBattaglia ? GameMap.temaBattaglia() : 'grass');

    // ALLEATO (sess. 12 set 2026, cutscene Baso/Rifugio CoTrAL Rocca): se
    // opzioni.alleato è presente, lo slot 1 NON è un secondo Pokémon MIO ma
    // la squadra vera di un NPC alleato (es. Baso) — scelte di mossa e
    // sostituzioni sullo slot 1 diventano automatiche (IA "mossa casuale",
    // stessa di scegliMossaCasuale già usata per i nemici — vedi
    // mostraMenuPrincipaleDoppia/_doppiaGestisciEventualiKO più sotto), MAI
    // chieste al giocatore. Prima novità di questo tipo nel motore: un
    // alleato con una squadra propria, non i tuoi 2 Pokémon come nella
    // doppia normale.
    modoAlleato = !!opzioni.alleato;
    alleatoNome = modoAlleato ? opzioni.alleato.nome : '';
    alleatoBanco = [];

    if (modoAlleato) {
      const indiceMio = statoGioco.squadra.findIndex(p => p.hpAttuale > 0);
      if (indiceMio < 0) {
        inCorso = false;
        modoDoppia = false;
        if (doppiaOnFine) doppiaOnFine('errore');
        return;
      }
      doppiaMieiIndici = [indiceMio, null];
      const istanzeAlleato = [];
      for (const voce of opzioni.alleato.squadra) istanzeAlleato.push(await creaIstanza(voce.id, voce.livello));
      const alleatoAttivo = istanzeAlleato.shift() || null;
      alleatoBanco = istanzeAlleato;
      doppiaMieiAttivi = [statoGioco.squadra[indiceMio], alleatoAttivo];
    } else {
      // I miei 2 Pokémon in campo: i primi due non KO della squadra (se ne ho
      // solo uno vivo, lo slot 1 resta vuoto: si combatte comunque, 1 contro 2).
      const indiciVivi = [];
      for (let i = 0; i < statoGioco.squadra.length && indiciVivi.length < 2; i++) {
        if (statoGioco.squadra[i].hpAttuale > 0) indiciVivi.push(i);
      }
      if (indiciVivi.length === 0) {
        inCorso = false;
        modoDoppia = false;
        if (doppiaOnFine) doppiaOnFine('errore');
        return;
      }
      doppiaMieiIndici = [indiciVivi[0], indiciVivi.length > 1 ? indiciVivi[1] : null];
      doppiaMieiAttivi = doppiaMieiIndici.map(idx => idx === null ? null : statoGioco.squadra[idx]);
    }
    doppiaMieiAttivi.forEach((m, i) => {
      if (!m) return;
      azzeraModificatori(m);
      m.inCarica = null; m.deveRicaricare = false; m.seminvulnerabile = null;
      m.furia = null; m.confusione = 0; m.protetto = false; m.protConsecutivi = 0;
      _registraSlotDoppia(m, 'giocatore', i);
    });

    nascondiMenu();
    $('schermata-battaglia').classList.remove('nascosto', 'dissolvenza-uscita');
    $('schermata-battaglia').classList.add('doppia');
    impostaSfondoBattaglia(temaSfondo);
    $('battaglia-messaggio').textContent = 'Due allenatori ti sfidano insieme!';
    ['nemico-sprite', 'nemico-sprite-2', 'giocatore-sprite', 'giocatore-sprite-2'].forEach(id => {
      const el = $(id);
      if (el) el.src = '';
    });

    try {
      doppiaBanchi = [[], []];
      doppiaNemiciAttivi = [null, null];
      // 2 CONTRO 1 (sess. 15 set 2026, Osservatorio CoTrAL — grunt singoli con
      // squadra grande invece che in coppia): opzioni.allenatori può avere UN
      // solo elemento. In quel caso (sess. 17 set 2026) quell'UNICO allenatore
      // schiera comunque 2 Pokémon insieme, non 1: bench condiviso tra i 2 slot.
      doppiaBancoCondiviso = !doppiaAllenatori[1] && !!doppiaAllenatori[0];
      if (doppiaBancoCondiviso) {
        const all = doppiaAllenatori[0];
        const istanze = [];
        for (const voce of all.squadra) istanze.push(await creaIstanza(voce.id, voce.livello, { evolviPerLivello: true, mosseFisse: voce.mosse }));
        doppiaNemiciAttivi[0] = istanze.shift() || null;
        doppiaNemiciAttivi[1] = istanze.shift() || null;
        doppiaBanchi[0] = istanze;   // bench VERO, condiviso da entrambi gli slot
        if (doppiaNemiciAttivi[0]) _registraSlotDoppia(doppiaNemiciAttivi[0], 'nemico', 0);
        if (doppiaNemiciAttivi[1]) _registraSlotDoppia(doppiaNemiciAttivi[1], 'nemico', 1);
      } else {
        for (let s = 0; s < 2; s++) {
          const all = doppiaAllenatori[s];
          if (!all) continue;
          const istanze = [];
          for (const voce of all.squadra) istanze.push(await creaIstanza(voce.id, voce.livello, { evolviPerLivello: true, mosseFisse: voce.mosse }));
          doppiaNemiciAttivi[s] = istanze.shift() || null;
          doppiaBanchi[s] = istanze;
          if (doppiaNemiciAttivi[s]) _registraSlotDoppia(doppiaNemiciAttivi[s], 'nemico', s);
        }
      }
    } catch (err) {
      console.error('[Battle] Errore nel creare gli avversari della doppia:', err);
      await di('⚠️ Errore di connessione: la lotta non può iniziare!');
      fineBattagliaDoppia('errore');
      return;
    }

    aggiornaSprite();
    aggiornaPannelli();

    // Un solo boss "diviso" in 2 slot (stesso nome ripetuto, es. Marcello con
    // le sue 6 Pokémon) legge male come "Marcello e Marcello": frase diversa
    // quando i due nomi coincidono. Con bench condiviso (un solo allenatore
    // vero, 2 Pokémon suoi in campo) frase diversa ancora.
    if (doppiaBancoCondiviso) {
      await di(`${doppiaAllenatori[0].nome} scende in campo con tutta la sua squadra!`);
    } else if (!doppiaAllenatori[1]) {
      await di(`${doppiaAllenatori[0].nome} scende in campo!`);
    } else {
      await di(doppiaAllenatori[0].nome === doppiaAllenatori[1].nome
        ? `${doppiaAllenatori[0].nome} scende in campo con tutta la sua squadra!`
        : `${doppiaAllenatori[0].nome} e ${doppiaAllenatori[1].nome} vogliono lottare insieme!`);
    }
    await Promise.all([
      animaEntrataPokemon('nemico', 'nemico-sprite'),
      doppiaNemiciAttivi[1] ? animaEntrataPokemon('nemico', 'nemico-sprite-2') : Promise.resolve(),
    ]);
    // Nome dell'allenatore dello slot 1: se il bench è condiviso è lo STESSO
    // allenatore dello slot 0 (doppiaAllenatori[1] non esiste in quel caso).
    const nomeAllenatoreSlot1 = doppiaAllenatori[1] ? doppiaAllenatori[1].nome : doppiaAllenatori[0].nome;
    await di(`${doppiaAllenatori[0].nome} manda in campo ${doppiaNemiciAttivi[0].nome}!` +
      (doppiaNemiciAttivi[1] ? ` ${nomeAllenatoreSlot1} manda in campo ${doppiaNemiciAttivi[1].nome}!` : ''));
    await Promise.all([
      animaEntrataPokemon('giocatore', 'giocatore-sprite'),
      doppiaMieiAttivi[1] ? animaEntrataPokemon('giocatore', 'giocatore-sprite-2') : Promise.resolve(),
    ]);
    await di(`Vai! ${doppiaMieiAttivi[0].nome}!` + (doppiaMieiAttivi[1] ? ` Vai! ${doppiaMieiAttivi[1].nome}!` : ''));

    if (meteoBattaglia) {
      const inizio = {
        sun: 'La luce del sole è intensa.', rain: 'Sta piovendo.',
        sandstorm: "C'è una tempesta di sabbia.", hail: 'Sta grandinando.',
      }[meteoBattaglia];
      if (inizio) await di(inizio);
    }

    doppiaAzioni = [null, null];
    _doppiaProssimoRound();
  }

  // Funzioni pubbliche del modulo
  return {
    avvia, avviaDoppia, creaIstanza, caramellaRara, evolviIstanza, trovaEvoluzioneAuto, generaGenere, trovaSpecieBase,
    sceglieSlotAbilita, abilitaChiaveDaSlot,
    spostaCursore, confermaCursore, indietroCursore,
    NATURE_DB, generaNatura, ricalcolaStatistiche,
    evAzzerati, evTotale, assegnaEv, EV_MAX_TOTALE, EV_MAX_SINGOLA,
  };

})();
