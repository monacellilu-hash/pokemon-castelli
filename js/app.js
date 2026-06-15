/* ============================================================
   app.js — Avvio del gioco, stato, salvataggi, HUD, incontri,
   menu di gioco (squadra/zaino/box), Centri Pokémon,
   esporta/importa salvataggio (F6).
   F9.1: sistema del tempo (giorno/notte, "Dormi" al Centro).
   ============================================================ */

const CHIAVE_SALVATAGGIO  = 'pkc_salvataggio';
const PASSI_PER_CHECK     = 10;   // ogni quanti passi si fa il check incontro
const MINUTI_PER_PASSO    = 1;    // minuti di gioco per ogni passo

// Stato di gioco — tutto ciò che viene salvato in localStorage
let stato = {
  posizione:         { ...POSIZIONE_INIZIALE },
  passi:             0,
  passiDaCheck:      0,    // contatore verso il prossimo check incontro
  incontroAttivo:    false, // true mentre una battaglia è in corso
  ultimaZonaLocked:  null,  // evita toast ripetuti per la stessa zona bloccata
  squadra:           [],    // i Pokémon del giocatore (max 6)
  box:               [],    // Pokémon oltre il sesto (il "PC" dei giochi)
  zaino:             { pokeball: 0, pozione: 0 },
  soldi:             SOLDI_INIZIALI, // Pokéyen (F9.2)
  repellentePassi:   0,     // passi rimasti con il repellente attivo (F9.2)
  mn:                { taglio: false, surf: false, volo: false, funivia: false, vittoria: false }, // MN possedute (F9/F11/F12)
  cittaVisitate:     [],    // comuni visitati (per la MN Volo) (F9)
  allenatoriBattuti: [],    // id degli allenatori di percorso già sconfitti (F9)
  levelCap:          LEVEL_CAP_INIZIALE,
  medaglie:          [],    // id delle palestre battute
  velocita:          1,     // booster di velocità: 1, 2, 3 o 5
  rivale:            null,
  legCatturati:      [],    // F11: ID dei leggendari catturati (permanente)
  legCooldown:       null,  // F11: { id, zonaId } — impedisce il re-trigger immediato
  legRespawn:        {},    // F11: { [id]: { tentativi, giornoRespawn } }
  legScomparsi:      [],    // F11: ID leggendari scomparsi (KO 3×)
  oggettiRaccolti:   [],    // ID degli oggetti mappa già raccolti
  inventario:        { chiave: {} }, // oggetti chiave (non consumabili, per eventi)
  flags:             {
    starterScelto:    false,
    pokedexRicevuto:  false,
    museoVisitato:    false,  // F10: il giocatore ha assistito al furto delle Sfere
    sfereRubate:      false,  // F10: le Sfere sono nelle mani del Team GdF
    gdFSconfitto:     false,  // F10: Crasso sconfitto e GdF sgominato
    legaCompletata:   false,  // F12: Campione Remo sconfitto (post-game sbloccato)
    funiviaUsata:     false,  // F11: funivia di Rocca di Papa presa (→ Sentiero Innevato)
    giornoTemporale:  0,      // F11: giorno in cui arriva il temporale (→ Zapdos)
    suicuneVisto:     false,  // F11: scena cinematica al Lago di Nemi già mostrata
    suicuneRoaming:   false,  // F11: Suicune è in roaming (compare nelle zone naturali)
    sagra:            false,  // F12b: oggi è la Sagra della Porchetta di Ariccia (→ Ho-Oh)
    lugiaScena:       false,  // F12b: scena cinematica Lugia ai Pratoni già mostrata
  },
  // F9.1 — Sistema del tempo
  tempo: {
    giorno:  1,    // conta-giorni globale
    minuti:  480,  // minuti dall'inizio della giornata (480 = 08:00)
    notteToast: false, // flag: toast notte già mostrato oggi
  },
  // Gauntlet palestre: traccia l'indice del prossimo gregario da affrontare
  gauntletPalestra: {},
};

// ── Salvataggio / caricamento ────────────────────────────────

function salvaPartita() {
  try {
    localStorage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(stato));
  } catch (e) {
    console.warn('[Salvataggio] Impossibile salvare:', e.message);
  }
}

function caricaPartita() {
  try {
    const testo = localStorage.getItem(CHIAVE_SALVATAGGIO);
    if (testo) {
      const salvato = JSON.parse(testo);
      stato = { ...stato, ...salvato };
      // Migrazione retro-compatibile: vecchi salvataggi senza "tempo"
      if (!stato.tempo) {
        stato.tempo = { giorno: 1, minuti: 480, notteToast: false };
      }
      if (stato.tempo.notteToast === undefined) stato.tempo.notteToast = false;
      // Migrazione F9.2: vecchi salvataggi senza economia
      if (stato.soldi === undefined) stato.soldi = SOLDI_INIZIALI;
      if (stato.repellentePassi === undefined) stato.repellentePassi = 0;
      // Migrazione F9: MN e città visitate
      if (!stato.mn) stato.mn = { taglio: false, surf: false, volo: false };
      if (!Array.isArray(stato.cittaVisitate)) stato.cittaVisitate = [];
      if (!Array.isArray(stato.allenatoriBattuti)) stato.allenatoriBattuti = [];
      if (!stato.gauntletPalestra) stato.gauntletPalestra = {};
      // Migrazione F10: flag GdF
      if (!stato.flags) stato.flags = {};
      if (stato.flags.museoVisitato  === undefined) stato.flags.museoVisitato  = false;
      if (stato.flags.sfereRubate    === undefined) stato.flags.sfereRubate    = false;
      if (stato.flags.gdFSconfitto   === undefined) stato.flags.gdFSconfitto   = false;
      // Migrazione F11: leggendari
      if (!Array.isArray(stato.legCatturati)) stato.legCatturati = [];
      stato.legCooldown = null; // transitorio: sempre null al caricamento
      if (!stato.mn.funivia)            stato.mn.funivia           = false;
      if (stato.flags.funiviaUsata     === undefined) stato.flags.funiviaUsata     = false;
      if (stato.flags.giornoTemporale  === undefined) stato.flags.giornoTemporale  = 0;
      if (stato.flags.suicuneVisto     === undefined) stato.flags.suicuneVisto     = false;
      if (stato.flags.suicuneRoaming   === undefined) stato.flags.suicuneRoaming   = false;
      // Migrazione F12
      if (!stato.legRespawn  || typeof stato.legRespawn !== 'object') stato.legRespawn = {};
      if (!Array.isArray(stato.legScomparsi)) stato.legScomparsi = [];
      if (!stato.mn.vittoria) stato.mn.vittoria = false;
      if (stato.flags.legaCompletata  === undefined) stato.flags.legaCompletata  = false;
      // Migrazione F12b: oggetti mappa, inventario chiave, sagra, Lugia scena
      if (!Array.isArray(stato.oggettiRaccolti)) stato.oggettiRaccolti = [];
      if (!stato.inventario || typeof stato.inventario !== 'object') stato.inventario = { chiave: {} };
      if (!stato.inventario.chiave || typeof stato.inventario.chiave !== 'object') stato.inventario.chiave = {};
      if (stato.flags.sagra      === undefined) stato.flags.sagra      = false;
      if (stato.flags.lugiaScena === undefined) stato.flags.lugiaScena = false;
      console.log('[Salvataggio] Partita caricata ✔');
    }
  } catch (e) {
    console.warn('[Salvataggio] Salvataggio corrotto, si riparte da zero.');
  }
  stato.incontroAttivo = false;
  stato.allenatoreCooldown = null; // transitorio: niente sfide-auto bloccate al caricamento
}

// ── Sistema del tempo (F9.1) ─────────────────────────────────

// Restituisce la fascia oraria corrente come stringa
function fasciaOraria(minuti) {
  if (minuti >= 360  && minuti < 720)  return 'mattina';
  if (minuti >= 720  && minuti < 1080) return 'pomeriggio';
  if (minuti >= 1080 && minuti < 1260) return 'sera';
  return 'notte';
}

// Icona emoji per la fascia
function iconaFascia(fascia) {
  return { mattina: '🌅', pomeriggio: '☀️', sera: '🌆', notte: '🌙' }[fascia] || '🕐';
}

// Formatta minuti → "HH:MM"
function formatOrario(minuti) {
  const h = Math.floor(minuti / 60) % 24;
  const m = minuti % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Avanza il tempo di un passo (chiamata da alPasso)
function avanzaTempo() {
  stato.tempo.minuti += MINUTI_PER_PASSO;
  if (stato.tempo.minuti >= 1440) {
    stato.tempo.minuti -= 1440;
    stato.tempo.giorno += 1;
    stato.tempo.notteToast = false; // reset per il nuovo giorno
    // Sagra della Porchetta di Ariccia: ogni 15 giorni di gioco
    const eraSagra = stato.flags.sagra;
    stato.flags.sagra = (stato.tempo.giorno % 15 === 0);
    if (stato.flags.sagra && !eraSagra) {
      mostraToast('🐷 Oggi è la Sagra della Porchetta di Ariccia! Sul Ponte qualcosa si muove all\'alba...', 7000);
    }
  }
}

// Aggiorna la riga orologio nell'HUD
function aggiornaHUDtempo() {
  const el = document.getElementById('hud-tempo');
  if (!el) return;
  const fascia = fasciaOraria(stato.tempo.minuti);
  el.textContent =
    `Giorno ${stato.tempo.giorno} · ${formatOrario(stato.tempo.minuti)} ${iconaFascia(fascia)}`;
}

// Punto unico per gli eventi a tempo: Zapdos, Ho-Oh, Jirachi, ecc.
function controllaEventiTempo() {
  const fascia = fasciaOraria(stato.tempo.minuti);

  // Toast di notte: una volta sola per giornata
  if (fascia === 'notte' && !stato.tempo.notteToast) {
    stato.tempo.notteToast = true;
    mostraToast('🌙 È calata la notte sui Castelli.', 4000);
  }

  // F11 — ZAPDOS: giorno del temporale annunciato da Ruggero
  if (!stato.incontroAttivo && !dialogoInCorso &&
      stato.flags.giornoTemporale > 0 &&
      stato.tempo.giorno === stato.flags.giornoTemporale &&
      !legCatturato(145)) {

    const palMontePorzio = PALESTRE.find(p => p.id === 'monte-porzio');
    if (palMontePorzio) {
      const distMtP = GameMap.distanzaMetri(stato.posizione, palMontePorzio);
      if (distMtP < 350 && !legCooldownAttivo(145, 'zapdos-osservatorio')) {
        triggeraLeggendario(
          145, 50, 'Zapdos',
          {
            nome: '⚡ Temporale sull\'Osservatorio!',
            righe: [
              'Il cielo sopra l\'Osservatorio si oscura in un lampo.',
              'Fulmini arancioni e gialli squarciano le nubi!',
              'Sul telescopio del INAF appare una sagoma impossibile…',
              'È ZAPDOS! L\'uccello del tuono ti fissa con occhi ardenti!',
              '(Zapdos scatena un grido che fa vibrare i vetri dell\'Osservatorio)',
            ]
          },
          (esito) => {
            // Il temporale è passato: serve un nuovo annuncio da Ruggero
            stato.flags.giornoTemporale = 0;
            salvaPartita();
          }
        );
      }
    }
  }
}

// ── "Dormi" al Centro Pokémon ────────────────────────────────

// Apre il pannello di scelta ora del risveglio
function apriMenuDormi(idCentro) {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const centro = CENTRI_POKEMON.find(c => c.id === idCentro);
  if (!centro) return;
  const distanza = GameMap.distanzaMetri(stato.posizione, centro);
  if (distanza > RAGGIO_CURA) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m)!`);
    return;
  }
  if (stato.squadra.length === 0) {
    mostraToast('Non hai ancora nessun Pokémon!');
    return;
  }

  // Crea l'overlay "Dormi"
  let overlay = document.getElementById('overlay-dormi');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay-dormi';
    overlay.className = 'nascosto';
    overlay.innerHTML = `
      <div id="dormi-card">
        <div id="dormi-titolo">🛏️ Dormi — scegli l'ora del risveglio</div>
        <div id="dormi-opzioni">
          <button class="btn-dormi-ora" data-minuti="480">🌅 Mattina (08:00)</button>
          <button class="btn-dormi-ora" data-minuti="840">☀️ Pomeriggio (14:00)</button>
          <button class="btn-dormi-ora" data-minuti="1140">🌆 Sera (19:00)</button>
          <button class="btn-dormi-ora" data-minuti="1380">🌙 Notte (23:00)</button>
        </div>
        <button id="btn-dormi-chiudi">✖ Annulla</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.btn-dormi-ora').forEach(btn => {
      btn.addEventListener('click', () => {
        const minutiTarget = parseInt(btn.dataset.minuti, 10);
        eseguiDormi(minutiTarget);
        overlay.classList.add('nascosto');
      });
    });
    document.getElementById('btn-dormi-chiudi').addEventListener('click', () => {
      overlay.classList.add('nascosto');
    });
  }

  overlay.classList.remove('nascosto');
}

// Esegue il "dormi": avanza il tempo, cura, salva
function eseguiDormi(minutiTarget) {
  // Se l'ora target è già passata oggi, saltiamo al giorno dopo
  if (minutiTarget <= stato.tempo.minuti) {
    stato.tempo.giorno += 1;
  }
  stato.tempo.minuti = minutiTarget;
  stato.tempo.notteToast = false;

  // Cura completa (HP + PP + stato alterato)
  stato.squadra.forEach(p => {
    p.hpAttuale = p.hpMax;
    p.condizione = null;
    p.mosse.forEach(m => { m.pp = m.ppMax; });
  });

  salvaPartita();
  aggiornaHUD();
  controllaEventiTempo();

  mostraToast(`☀️ Hai dormito fino alle ${formatOrario(minutiTarget)}. Buon giorno ${stato.tempo.giorno}!`, 4000);
  console.log(`[Tempo] Dormi → Giorno ${stato.tempo.giorno}, ${formatOrario(minutiTarget)}`);
}

// ── HUD ─────────────────────────────────────────────────────

function aggiornaHUD() {
  document.getElementById('hud-passi').textContent = stato.passi;

  // Soldi (F9.2)
  const elSoldi = document.getElementById('hud-soldi');
  if (elSoldi) elSoldi.textContent = `₽ ${(stato.soldi || 0).toLocaleString('it-IT')}`;

  // Pulsante Volo (F9): visibile solo con la MN Volo
  aggiornaBottoneVolo();

  // Orologio (F9.1)
  aggiornaHUDtempo();

  // Zona geografica corrente
  const zona = World.trovaZona(stato.posizione.lat, stato.posizione.lon);
  if (zona) {
    const icona = TERRENO_ICONE[zona.terreno] || '📍';
    const livStr = zonaBloccata(zona) ? ' 🔒' : ` (Lv ${zona.livMin}–${zona.livMax})`;
    document.getElementById('hud-zona').textContent = `${icona} ${zona.nome}${livStr}`;
  } else {
    document.getElementById('hud-zona').textContent = '📍 Castelli Romani';
  }

  // Squadra: mostra il primo Pokémon
  const elSquadra = document.getElementById('hud-squadra');
  if (stato.squadra.length > 0) {
    const primo = stato.squadra[0];
    const altri = stato.squadra.length > 1 ? ` +${stato.squadra.length - 1}` : '';
    elSquadra.textContent =
      `⚡ ${primo.nome} Lv.${primo.livello} · ❤️ ${primo.hpAttuale}/${primo.hpMax}${altri}`;
    elSquadra.style.display = 'block';
  } else {
    elSquadra.style.display = 'none';
  }

  // Palestra vicina (< 120 m)
  let vicinissima = null;
  for (const pal of PALESTRE) {
    const dist = GameMap.distanzaMetri(stato.posizione, pal);
    if (dist < 120 && (!vicinissima || dist < vicinissima.dist)) {
      vicinissima = { pal, dist };
    }
  }
  const elPal = document.getElementById('hud-palestra');
  if (vicinissima) {
    elPal.textContent = `🏛️ ${vicinissima.pal.comune} · Palestra ${vicinissima.pal.ordine}`;
    elPal.style.display = 'block';
  } else {
    elPal.style.display = 'none';
  }
}

// ── Toast (notifiche rapide) ─────────────────────────────────

let timerToast = null;

function mostraToast(messaggio, durata = 3500) {
  const el = document.getElementById('toast');
  el.textContent = messaggio;
  el.classList.remove('nascosto');
  if (timerToast) clearTimeout(timerToast);
  timerToast = setTimeout(() => el.classList.add('nascosto'), durata);
}

/* ============================================================
   DIALOGHI (stile Pokémon: riquadro in basso, click per avanzare)
   ============================================================ */

let dialogoInCorso = false;

function mostraDialogo(nome, righe) {
  return new Promise(resolve => {
    if (dialogoInCorso) { resolve(); return; }
    dialogoInCorso = true;
    GameMap.bloccaMovimento();

    const overlay = document.getElementById('overlay-dialogo');
    const elNome  = document.getElementById('dialogo-nome');
    const elTesto = document.getElementById('dialogo-testo');
    const btn     = document.getElementById('dialogo-avanti');

    let indice = 0;
    elNome.textContent  = nome;
    elTesto.textContent = righe[0];
    overlay.classList.remove('nascosto');

    function avanti() {
      indice += 1;
      if (indice < righe.length) {
        elTesto.textContent = righe[indice];
      } else {
        btn.removeEventListener('click', avanti);
        overlay.classList.add('nascosto');
        dialogoInCorso = false;
        if (!stato.incontroAttivo) GameMap.sbloccaMovimento();
        resolve();
      }
    }
    btn.addEventListener('click', avanti);
  });
}

/* ============================================================
   mostraScelta — riquadro a due pulsanti (usato dal gauntlet palestre)
   Ritorna Promise<1|2>
   ============================================================ */

function mostraScelta(messaggio, testo1, testo2) {
  return new Promise(resolve => {
    let overlay = document.getElementById('overlay-scelta');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'overlay-scelta';
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:2000;' +
        'display:flex;align-items:center;justify-content:center;';
      overlay.innerHTML = `
        <div style="background:#1e2a2a;border:2px solid #4ecdc4;border-radius:12px;
                    padding:24px;max-width:360px;text-align:center;color:#e0f7f7;">
          <p id="scelta-msg" style="margin:0 0 20px;font-size:1.05em;line-height:1.5;"></p>
          <div style="display:flex;gap:12px;justify-content:center;">
            <button id="scelta-btn1" style="flex:1;padding:10px;border-radius:8px;
              background:#4ecdc4;color:#111;font-weight:bold;cursor:pointer;border:none;"></button>
            <button id="scelta-btn2" style="flex:1;padding:10px;border-radius:8px;
              background:#e06c75;color:#fff;font-weight:bold;cursor:pointer;border:none;"></button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }

    document.getElementById('scelta-msg').textContent = messaggio;
    document.getElementById('scelta-btn1').textContent = testo1;
    document.getElementById('scelta-btn2').textContent = testo2;
    overlay.style.display = 'flex';

    function scegli(n) {
      overlay.style.display = 'none';
      resolve(n);
    }
    document.getElementById('scelta-btn1').onclick = () => scegli(1);
    document.getElementById('scelta-btn2').onclick = () => scegli(2);
  });
}

// Cura completa della squadra (HP + stati alterati + PP) — usata dal gauntlet
function curaCompletaSquadra() {
  stato.squadra.forEach(p => {
    p.hpAttuale = p.hpMax;
    p.condizione = null;
    if (p.mosse) p.mosse.forEach(m => { m.pp = m.ppMax; });
  });
}

/* ============================================================
   LABORATORIO DEL PROFESSORE — scelta dello starter (F7)
   ============================================================ */

function scegliGenerazione() {
  return new Promise(resolve => {
    const overlay = document.getElementById('overlay-starter');
    const titolo = document.getElementById('starter-titolo');
    const cont = document.getElementById('starter-scelte');

    titolo.textContent = 'Da quale generazione viene il tuo starter?';
    cont.innerHTML = '';
    overlay.classList.remove('nascosto');

    for (const gen of [1, 2, 3]) {
      const nomi = STARTER_PER_GEN[gen].map(s => s.nome).join(' · ');
      const card = document.createElement('button');
      card.className = 'card-starter';
      card.innerHTML = `<b>${GEN_NOMI[gen]}</b><div class="gen-trio">${nomi}</div>`;
      card.addEventListener('click', () => resolve(gen));
      cont.appendChild(card);
    }
  });
}

function scegliStarter(gen) {
  return new Promise(resolve => {
    const overlay = document.getElementById('overlay-starter');
    const titolo = document.getElementById('starter-titolo');
    const cont = document.getElementById('starter-scelte');

    titolo.textContent = 'Scegli il tuo primo Pokémon!';
    cont.innerHTML = '<p class="menu-vuoto">Il Professore prepara le Poké Ball…</p>';

    (async () => {
      try {
        const opzioni = STARTER_PER_GEN[gen];
        const dati = [];
        for (const s of opzioni) {
          dati.push(await PokeAPI.getPokemon(s.id));
        }
        cont.innerHTML = '';
        opzioni.forEach((opzione, i) => {
          const d = dati[i];
          const nome = d.nome.charAt(0).toUpperCase() + d.nome.slice(1);
          const tipi = d.tipi.map(t =>
            `<span class="tipo-badge" style="background:${TIPO_COLORI[t] || '#888'}">${TIPO_NOMI[t] || t}</span>`
          ).join(' ');
          const card = document.createElement('button');
          card.className = 'card-starter';
          card.innerHTML = `<img src="${d.sprite.fronte}" alt="${nome}"><b>${nome}</b><div>${tipi}</div>`;
          card.addEventListener('click', () => {
            overlay.classList.add('nascosto');
            resolve(opzione);
          });
          cont.appendChild(card);
        });
      } catch (err) {
        console.error('[Lab] Errore nel caricare gli starter:', err);
        overlay.classList.add('nascosto');
        resolve(null);
      }
    })();
  });
}

async function interagisciLaboratorio() {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, LABORATORIO);
  if (distanza > 120) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati al laboratorio!`);
    return;
  }

  if (stato.flags && stato.flags.starterScelto) {
    await mostraDialogo(PROFESSORE_NOME, [
      'Oh, bentornato! Come procede l\'avventura?',
      'Ricorda: la prima palestra è a FRASCATI, in fondo alla Via Tuscolana. Il Capopalestra Vinicio usa Pokémon di tipo Erba.',
      'E passa dai Centri Pokémon 🏥 per curare la squadra: sono gratuiti!'
    ]);
    return;
  }

  await mostraDialogo(PROFESSORE_NOME, [
    'Benvenuto nel mio laboratorio! Io sono il Prof. Castagno, studio i Pokémon dei Castelli Romani.',
    'Questo mondo è pieno di Pokémon selvatici: vivono nei prati, nei boschi, nei laghi vulcanici… ovunque!',
    'Per il tuo viaggio verso le 8 palestre dei Castelli ti serve un compagno fidato.',
    'Ho con me gli starter di TRE generazioni: Kanto, Johto e Hoenn. Scegli prima la generazione, poi il Pokémon. Scegli con il cuore!'
  ]);

  if (!stato.flags) stato.flags = {};
  const gen = await scegliGenerazione();
  const scelto = await scegliStarter(gen);
  if (!scelto) {
    mostraToast('⚠️ Errore di connessione: riprova a entrare nel laboratorio.');
    return;
  }

  let starter;
  try {
    starter = await Battle.creaIstanza(scelto.id, LIVELLO_STARTER);
  } catch (err) {
    console.error('[Lab] Errore nel creare lo starter:', err);
    mostraToast('⚠️ Errore di connessione: riprova a entrare nel laboratorio.');
    return;
  }

  stato.squadra.push(starter);
  stato.zaino.pokeball = (stato.zaino.pokeball || 0) + 10;
  stato.zaino.pozione  = (stato.zaino.pozione  || 0) + 5;
  stato.flags.starterScelto   = true;
  stato.flags.pokedexRicevuto = true;

  const tipoRivale = CONTRO_TIPO[scelto.tipo];
  const genRivale = 1 + Math.floor(Math.random() * 3);
  const starterRivale = STARTER_PER_GEN[genRivale].find(s => s.tipo === tipoRivale);
  stato.rivale = {
    nome: RIVALE_NOME,
    idStarter: starterRivale.id,
    nomeStarter: starterRivale.nome,
    gen: genRivale,
  };
  salvaPartita();
  aggiornaHUD();

  await mostraDialogo(PROFESSORE_NOME, [
    `Ottima scelta! ${starter.nome} e tu farete grandi cose insieme!`,
    'Prendi anche questo POKÉDEX: registra ogni Pokémon che incontri.',
    'E queste ti serviranno: 10 POKÉ BALL e 5 POZIONI. Le trovi nello Zaino (menu ☰).'
  ]);

  await mostraDialogo(RIVALE_NOME, [
    'Ehi, aspetta! Io sono Remo, il nipote del Professore!',
    `Ho appena scelto anch'io il mio primo Pokémon: ${starterRivale.nomeStarter || starterRivale.nome}, da ${GEN_NOMI[genRivale]}!`,
    `E guarda caso è di tipo ${TIPO_NOMI[tipoRivale]}… proprio il tipo forte contro il tuo ${starter.nome}! Che sfortuna, eh? 😏`,
    'Forza, lotta di benvenuto! Qui e ora!'
  ]);

  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  Battle.avvia({
    allenatore: {
      nome: RIVALE_NOME,
      squadra: [{ id: starterRivale.id, livello: LIVELLO_STARTER + 1 }],
      premioSoldi: 500,
      dialogoSconfitta: 'Cosa?! Non è possibile! Avevo pure il vantaggio di tipo!',
    },
    stato: stato,
    onFine: async (esito) => {
      terminaIncontro(esito);
      if (esito === 'vittoria') {
        await mostraDialogo(RIVALE_NOME, [
          'Uffa! Era solo il riscaldamento, chiaro?',
          'Ci rincontreremo lungo il path, e la prossima volta non andrà così!'
        ]);
      } else if (esito === 'sconfitta') {
        await mostraDialogo(RIVALE_NOME, [
          'Ahah! Te l\'avevo detto: il vantaggio di tipo non perdona!',
          'Allenati sul Percorso Tuscolana, poi riparliamone!'
        ]);
      }
      await mostraDialogo(PROFESSORE_NOME, [
        'Eheh, voi due diventerete grandi rivali, lo sento!',
        'Ora vai: segui la Via Tuscolana verso sud-est fino a FRASCATI e sfida la prima palestra. In bocca al lupo!'
      ]);
    }
  });
}

/* ============================================================
   PALESTRE — sfida al Capopalestra
   ============================================================ */

async function interagisciPalestra(idPalestra) {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const palestra = PALESTRE.find(p => p.id === idPalestra);
  if (!palestra) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, palestra);
  if (distanza > 120) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati alla palestra!`);
    return;
  }

  if (stato.medaglie.includes(palestra.id)) {
    mostraToast(`🏅 Hai già la ${palestra.medaglia || 'medaglia'} di ${palestra.comune}!`);
    return;
  }

  if (!palestra.capopalestra) {
    mostraToast('🚧 Questa palestra aprirà in una prossima fase di sviluppo!');
    return;
  }

  if (stato.medaglie.length < palestra.ordine - 1) {
    mostraToast(`🔒 Prima devi vincere la Palestra ${stato.medaglie.length + 1} del path!`);
    return;
  }

  if (!stato.squadra.some(p => p.hpAttuale > 0)) {
    mostraToast('I tuoi Pokémon sono esausti! Cura la squadra a un Centro Pokémon 🏥.');
    return;
  }

  // ── Scontro con il Rivale (se previsto prima di questa palestra) ──
  const tappa = RIVALE_TAPPE.find(t =>
    t.primaDiOrdine === palestra.ordine && !(stato.flags && stato.flags[t.flag]));
  if (tappa) {
    const idBase = (stato.rivale && stato.rivale.idStarter) || 255;
    const squadraRemo = tappa.squadra.map(m => ({
      id: m.id === 'starter1' ? idBase + 1 : (m.id === 'starter2' ? idBase + 2 : m.id),
      livello: m.livello
    }));

    await mostraDialogo(RIVALE_NOME, tappa.dialogoIntro);

    stato.incontroAttivo = true;
    GameMap.bloccaMovimento();

    Battle.avvia({
      allenatore: {
        nome: RIVALE_NOME,
        squadra: squadraRemo,
        premioSoldi: tappa.premioSoldi,
        dialogoSconfitta: tappa.dialogoSconfittaRemo,
      },
      stato: stato,
      onFine: async (esito) => {
        terminaIncontro(esito);
        if (esito === 'vittoria') {
          if (!stato.flags) stato.flags = {};
          stato.flags[tappa.flag] = true;
          salvaPartita();
          await mostraDialogo(RIVALE_NOME, tappa.dialogoDopoVittoria);
        } else if (esito === 'sconfitta') {
          await mostraDialogo(RIVALE_NOME, tappa.dialogoDopoSconfitta);
        }
      }
    });
    return;
  }

  // ── GAUNTLET: gregari sequenziali prima del capopalestra ──
  const gregari = palestra.gregari || [];
  if (!stato.gauntletPalestra[palestra.id]) {
    stato.gauntletPalestra[palestra.id] = { indice: 0 };
  }
  const gauntlet = stato.gauntletPalestra[palestra.id];

  if (gauntlet.indice < gregari.length) {
    const gregario = gregari[gauntlet.indice];

    // Recupero opzionale prima del combattimento (non al primo gregario)
    if (gauntlet.indice > 0) {
      const scelta = await mostraScelta(
        `Vuoi curarti prima di affrontare ${gregario.nome} (${gauntlet.indice + 1}/${gregari.length})?`,
        '💊 Sì, curati!',
        '⚔️ No, avanti!'
      );
      if (scelta === 1) curaCompletaSquadra();
    }

    await mostraDialogo(
      `${gregario.classe} ${gregario.nome}`,
      gregario.dialogoIntro
    );

    stato.incontroAttivo = true;
    GameMap.bloccaMovimento();

    Battle.avvia({
      allenatore: {
        nome: `${gregario.classe} ${gregario.nome}`,
        squadra: gregario.squadra,
        premioSoldi: gregario.premioSoldi,
        dialogoSconfitta: gregario.dialogoSconfitta,
      },
      stato: stato,
      onFine: async (esito) => {
        terminaIncontro(esito);
        if (esito === 'vittoria') {
          stato.gauntletPalestra[palestra.id].indice += 1;
          salvaPartita();
          if (gregario.dialogoDopo) {
            await mostraDialogo(`${gregario.classe} ${gregario.nome}`, gregario.dialogoDopo);
          }
          // Richiama la funzione per il prossimo gregario (o il boss)
          await interagisciPalestra(idPalestra);
        }
        // In caso di sconfitta: il giocatore riparte dal Centro Pokémon e riprende
        // dall'indice salvato (non si riazzera il gauntlet)
      }
    });
    return;
  }

  // ── Tutti i gregari sconfitti: offri cura finale prima del capopalestra ──
  if (gregari.length > 0) {
    const sceltaFinale = await mostraScelta(
      `Hai superato tutti i gregari! Vuoi curarti prima di sfidare ${palestra.capopalestra.nome}?`,
      '💊 Sì, curati!',
      '⚔️ No, sfida il boss!'
    );
    if (sceltaFinale === 1) curaCompletaSquadra();
  }

  // ── Scontro col capopalestra ──
  await mostraDialogo(`${palestra.capopalestra.nome} — Palestra di ${palestra.comune}`,
    palestra.capopalestra.dialogoIntro);

  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  Battle.avvia({
    allenatore: {
      nome: palestra.capopalestra.nome,
      squadra: palestra.capopalestra.squadra,
      premioSoldi: palestra.capopalestra.premioSoldi,
      dialogoSconfitta: palestra.capopalestra.dialogoSconfitta,
    },
    stato: stato,
    onFine: (esito) => {
      terminaIncontro(esito);
      if (esito === 'vittoria') {
        // Reset gauntlet per questa palestra (così si può rifare in debug)
        delete stato.gauntletPalestra[palestra.id];
        vinciPalestra(palestra);
      }
    }
  });
}

async function vinciPalestra(palestra) {
  if (!stato.medaglie.includes(palestra.id)) stato.medaglie.push(palestra.id);

  const prossima = PALESTRE.find(p => p.ordine === palestra.ordine + 1);
  stato.levelCap = prossima ? prossima.levelCap : 60;

  // F12: 8ª medaglia → sblocca Via Vittoria
  if (stato.medaglie.length >= 8 && !stato.mn.vittoria) {
    stato.mn.vittoria = true;
  }

  salvaPartita();
  aggiornaHUD();

  await mostraDialogo('🏅 ' + (palestra.medaglia || 'Medaglia'), [
    `Hai ottenuto la ${palestra.medaglia || 'medaglia di ' + palestra.comune}! (${stato.medaglie.length}/8)`,
    `Il level cap sale: ora i tuoi Pokémon possono crescere fino al livello ${stato.levelCap}.`,
    prossima
      ? `Prossima tappa: la palestra di ${prossima.comune} (tipo ${prossima.tipo})!`
      : 'Hai tutte le medaglie! La Via Vittoria è aperta — cercala tra Genzano e Colonna.'
  ]);
}

// ── Centro Pokémon: cura + "Dormi" (F9.1) ───────────────────

function curaSquadraDaCentro(idCentro) {
  const centro = CENTRI_POKEMON.find(c => c.id === idCentro);
  if (!centro) return;
  if (stato.incontroAttivo) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, centro);
  if (distanza > RAGGIO_CURA) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati al Centro Pokémon!`);
    return;
  }

  if (stato.squadra.length === 0) {
    mostraToast('Non hai ancora nessun Pokémon!');
    return;
  }

  stato.squadra.forEach(p => {
    p.hpAttuale = p.hpMax;
    p.condizione = null;
    p.mosse.forEach(m => { m.pp = m.ppMax; });
  });
  salvaPartita();
  aggiornaHUD();
  mostraToast('❤️ I tuoi Pokémon sono di nuovo in piena forma! A presto!');
  console.log(`[Centro] Squadra curata a ${centro.comune}.`);
}

/* ============================================================
   POKÉ MARKET (F9.2) — acquisto oggetti con i Pokéyen
   ============================================================ */

// Restituisce il market entro RAGGIO_MARKET dal giocatore (o null)
function marketVicino() {
  for (const market of POKE_MARKET) {
    if (GameMap.distanzaMetri(stato.posizione, market) <= RAGGIO_MARKET) return market;
  }
  return null;
}

// Apre il menu sulla tab Market (chiamata dal marker 🛒 sulla mappa)
function apriMarket(idMarket) {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const market = POKE_MARKET.find(m => m.id === idMarket);
  if (!market) return;
  const distanza = GameMap.distanzaMetri(stato.posizione, market);
  if (distanza > RAGGIO_MARKET) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati al Poké Market!`);
    return;
  }

  GameMap.bloccaMovimento();
  document.getElementById('pannello-menu').classList.remove('nascosto');
  mostraSezioneMenu('market');
}

// Disegna la tab Market: saldo + merce del market più vicino
function renderMarket(contenuto) {
  const market = marketVicino();

  // Intestazione col saldo (sempre visibile)
  const testata = document.createElement('div');
  testata.className = 'market-saldo';
  testata.innerHTML = `💰 Il tuo portafoglio: <b>₽ ${(stato.soldi || 0).toLocaleString('it-IT')}</b>`;
  contenuto.appendChild(testata);

  if (!market) {
    const vuoto = document.createElement('p');
    vuoto.className = 'menu-vuoto';
    vuoto.textContent = 'Per comprare, avvicinati al 🛒 Poké Market di un comune (di fianco al Centro Pokémon).';
    contenuto.appendChild(vuoto);
    return;
  }

  const titolo = document.createElement('p');
  titolo.className = 'menu-nota';
  titolo.innerHTML = `🛒 <b>Poké Market di ${market.comune}</b>`;
  contenuto.appendChild(titolo);

  market.merce.forEach(chiave => {
    const oggetto = OGGETTI[chiave];
    if (!oggetto) return;
    const posseduti = stato.zaino[chiave] || 0;
    const troppoCaro = (stato.soldi || 0) < oggetto.prezzo;

    const riga = document.createElement('div');
    riga.className = 'card-oggetto';
    riga.innerHTML =
      `<span class="oggetto-icona">${oggetto.icona}</span>` +
      `<div class="card-info">` +
        `<div class="card-riga1"><b>${oggetto.nome}</b> <span>₽ ${oggetto.prezzo.toLocaleString('it-IT')}</span></div>` +
        `<small>${oggetto.descrizione}</small>` +
        `<small class="market-posseduti">Ne hai: ${posseduti}</small>` +
      `</div>` +
      `<button class="btn-preleva" ${troppoCaro ? 'disabled' : ''}>Compra</button>`;
    riga.querySelector('.btn-preleva').addEventListener('click', () => compraOggetto(chiave));
    contenuto.appendChild(riga);
  });

  const nota = document.createElement('p');
  nota.className = 'menu-nota';
  nota.textContent = 'Ogni clic su "Compra" acquista un pezzo. I soldi si guadagnano battendo allenatori e Capipalestra.';
  contenuto.appendChild(nota);
}

// Acquista un'unità dell'oggetto e aggiorna il portafoglio
function compraOggetto(chiave) {
  const oggetto = OGGETTI[chiave];
  if (!oggetto || oggetto.prezzo === undefined) return;

  if ((stato.soldi || 0) < oggetto.prezzo) {
    mostraToast('💸 Non hai abbastanza Pokéyen!');
    return;
  }

  stato.soldi -= oggetto.prezzo;
  stato.zaino[chiave] = (stato.zaino[chiave] || 0) + 1;
  salvaPartita();
  aggiornaHUD();
  mostraToast(`🛒 Hai comprato ${oggetto.nome}! (–₽${oggetto.prezzo})`);
  mostraSezioneMenu('market'); // ridisegna per aggiornare saldo e "ne hai"
}

/* ============================================================
   NPC DELLE CITTÀ (F9) — abitanti (colore locale) e donatori MN
   ============================================================ */

// Parla con la "gente del posto": una battuta a caso del comune
async function interagisciAbitanti(idGruppo) {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const gruppo = ABITANTI.find(a => a.id === idGruppo);
  if (!gruppo) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, gruppo);
  if (distanza > 150) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati al paese!`);
    return;
  }

  const battuta = gruppo.battute[Math.floor(Math.random() * gruppo.battute.length)];
  await mostraDialogo(battuta.nome, [battuta.testo]);
}

// Donatori delle MN: regalano la MN se hai abbastanza Medaglie
async function interagisciDonatore(idDonatore) {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const d = DONATORI_MN.find(x => x.id === idDonatore);
  if (!d) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, d);
  if (distanza > 120) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati!`);
    return;
  }

  // Già ottenuta
  if (stato.mn && stato.mn[d.mn]) {
    await mostraDialogo(d.nome, d.dialogoDopo);
    return;
  }

  // Non hai ancora abbastanza Medaglie
  if (stato.medaglie.length < d.medaglieMin) {
    await mostraDialogo(d.nome, d.dialogoPrima);
    return;
  }

  // Consegna la MN!
  await mostraDialogo(d.nome, d.dialogoDono);
  if (!stato.mn) stato.mn = { taglio: false, surf: false, volo: false };
  stato.mn[d.mn] = true;
  stato.ultimaZonaLocked = null; // così le zone appena sbloccate vengono ricontrollate
  salvaPartita();
  aggiornaHUD();

  mostraToast(`🎉 Hai ottenuto la ${d.nomeMN}!`, 5000);

  // Messaggio di aiuto specifico per la MN
  if (d.mn === 'surf') {
    await mostraDialogo('🌊 MN Surf', ['Ora puoi attraversare l\'acqua: prova ad avvicinarti al Lago Albano o al Lago di Nemi!']);
  } else if (d.mn === 'taglio') {
    await mostraDialogo('🌳 MN Taglio', ['Il Boschetto Segreto dietro l\'Abbazia di Grottaferrata è ora accessibile.']);
  } else if (d.mn === 'volo') {
    await mostraDialogo('✈️ MN Volo', ['È comparso il pulsante ✈️ in basso a destra: premilo per volare verso un comune già visitato!']);
  }
}

/* ============================================================
   MUSEO DELLE NAVI ROMANE DI NEMI — evento F10 (Team GdF)
   ============================================================ */

async function interagisciMuseoNavi() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof MUSEO_NAVI === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, MUSEO_NAVI);
  if (distanza > MUSEO_NAVI.raggioInterazione) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati al Museo!`);
    return;
  }

  if (!stato.flags) stato.flags = {};

  // Già visto tutto e GdF sconfitto → tranquillità al museo
  if (stato.flags.gdFSconfitto) {
    await mostraDialogo('Museo delle Navi Romane', [
      'Le navi di Caligola riposano sul fondo del lago in tutto il loro splendore.',
      'Le Sfere sono tornate alle loro teche. La pace regna sul Lago di Nemi.',
      'In fondo, forse, i leggendari non vogliono essere controllati da nessuno.',
    ]);
    return;
  }

  // Già avvenuto il furto, ma GdF non ancora sconfitto → riferimento alla situazione
  if (stato.flags.sfereRubate) {
    await mostraDialogo('Custode del Museo', [
      'Non entrare! Il Team GdF ha assaltato il museo e ha rubato le Sfere!',
      'Le autorità stanno investigando… ma i grunti si sono già dileguati.',
      'Bisogna fermarli prima che raggiungano il cratere.',
    ]);
    return;
  }

  // PRIMA VISITA: cutscene del furto
  if (!stato.flags.museoVisitato) {
    // Prima un po' di atmosfera
    await mostraDialogo('Custode del Museo', [
      'Benvenuto! Queste sono le navi dell\'imperatore Caligola, affondate nel Lago di Nemi per duemila anni.',
      'Nell\'ultima sala esponiamo due reperti rarissimi: le Sfere d\'Acqua e di Terra, trovate nella stiva.',
      'Si dice che abbiano un\'energia… particolare. I ricercatori le studiano ancora.',
    ]);

    // La scena del furto
    await mostraDialogo('🔷 Agente GdF', [
      'TEAM GdF IN AZIONE! Tutti fermi!',
      'L\'Admin Fulvia vuole quelle sfere. Voi state qui buoni.',
    ]);

    await mostraDialogo('🔷 Agente GdF', [
      '…ecco qua. Sfera dell\'Acqua e Sfera della Terra.',
      'Con queste sveglieremo Kyogre e Groudon. Il Comandante Crasso sarà contento.',
    ]);

    await mostraDialogo('🔷 Agente GdF', [
      '(rivolgendosi a te) Tu… un allenatore. Curioso.',
      'Stai alla larga, ragazzo. Il Team GdF non fa prigionieri.',
      '(i grunti fuggono col bottino)',
    ]);

    await mostraDialogo('Custode del Museo', [
      'Hanno preso le Sfere! Qualcuno chiami la polizia!',
      'Quegli oggetti hanno un potere immenso… se cadono nelle mani sbagliate…',
      'Ti prego, fermali! Il Lago di Nemi non deve soffrire di nuovo.',
    ]);

    stato.flags.museoVisitato = true;
    stato.flags.sfereRubate   = true;
    salvaPartita();

    mostraToast('🔷 Il Team GdF ha rubato le Sfere! Trova i loro laboratori!', 5000);
    return;
  }
}

/* ============================================================
   SISTEMA LEGGENDARI (F11)
   ============================================================ */

// Controlla se un leggendario è già stato catturato permanentemente
function legCatturato(id) {
  return Array.isArray(stato.legCatturati) && stato.legCatturati.includes(id);
}

// Controlla se un leggendario è scomparso per sempre (KO × 3)
function legScomparso(id) {
  return Array.isArray(stato.legScomparsi) && stato.legScomparsi.includes(id);
}

// Controlla se il cooldown di zona è attivo per quel leggendario
function legCooldownAttivo(id, zonaId) {
  return stato.legCooldown && stato.legCooldown.id === id && stato.legCooldown.zonaId === zonaId;
}

// Avvia la battaglia con un leggendario (fuga impossibile).
// dialogo = { nome, righe } (opzionale, mostrato prima della battaglia)
// onFineExtra = funzione chiamata dopo la battaglia (per effetti specifici del leggendario)
async function triggeraLeggendario(id, livello, nomeSpec, dialogo, onFineExtra) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (legCatturato(id) || legScomparso(id)) return;

  // Controlla il timer di respawn (dopo un KO accidentale)
  const respawnInfo = stato.legRespawn ? stato.legRespawn[id] : null;
  if (respawnInfo && stato.tempo.giorno < respawnInfo.giornoRespawn) return;
  if (respawnInfo && stato.tempo.giorno >= respawnInfo.giornoRespawn) {
    delete stato.legRespawn[id]; // respawn timer scaduto: è di nuovo disponibile
  }

  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  const zonaAttuale = World.trovaZona(stato.posizione.lat, stato.posizione.lon);
  stato.legCooldown = { id, zonaId: zonaAttuale ? zonaAttuale.id : 'legfisso' };

  if (dialogo) await mostraDialogo(dialogo.nome, dialogo.righe);

  Battle.avvia({
    idPokemon: id,
    livello:   livello,
    fuggireImpossibile: true,
    stato:     stato,
    onFine: (esito) => {
      if (esito === 'cattura') {
        if (!Array.isArray(stato.legCatturati)) stato.legCatturati = [];
        if (!stato.legCatturati.includes(id)) stato.legCatturati.push(id);
        terminaIncontro(esito);
        if (onFineExtra) onFineExtra(esito);
        mostraToast(`🌟 ${nomeSpec} catturato! È nella tua squadra o nel Box.`, 5000);
      } else if (esito === 'vittoria') {
        // Leggendario sconfitto accidentalmente: sistema respawn
        if (!stato.legRespawn) stato.legRespawn = {};
        if (!stato.legScomparsi) stato.legScomparsi = [];
        const info = stato.legRespawn[id] || { tentativi: 0 };
        info.tentativi = (info.tentativi || 0) + 1;
        if (info.tentativi >= 3) {
          stato.legScomparsi.push(id);
          delete stato.legRespawn[id];
          terminaIncontro(esito);
          if (onFineExtra) onFineExtra(esito);
          mostraToast(`☠️ ${nomeSpec} è scomparso per sempre dai Castelli...`, 7000);
        } else {
          info.giornoRespawn = stato.tempo.giorno + 7;
          stato.legRespawn[id] = info;
          const rimasti = 3 - info.tentativi;
          terminaIncontro(esito);
          if (onFineExtra) onFineExtra(esito);
          mostraToast(`⚠️ ${nomeSpec} sconfitto! Riapparirà tra 7 giorni. (${rimasti} chance rimast${rimasti === 1 ? 'a' : 'e'})`, 7000);
        }
        salvaPartita();
      } else {
        // sconfitta del giocatore: nessuna penalità per il leggendario
        terminaIncontro(esito);
        if (onFineExtra) onFineExtra(esito);
      }
    }
  });
}

/* ----------------------------------------------------------
   SUICUNE — scena cinematica al Lago di Nemi (F11)
   Suicune NON si batte qui: appare e fugge, poi è in roaming.
   ---------------------------------------------------------- */
async function triggeraSuicuneScena() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  await mostraDialogo('💙 Lago di Nemi — Specchio di Diana', [
    'Le acque del lago sono immobili come uno specchio di cristallo.',
    'Un vento improvviso increspa la superficie... qualcosa si muove!',
    'Una sagoma azzurra corre sull\'acqua a velocità impossibile!',
    'È SUICUNE! Il leggendario guardiano delle acque pure ti fissa un istante...',
    '...poi scompare oltre l\'orizzonte del lago in un lampo!',
    '(Suicune è fuggito. D\'ora in poi vaga libero per i Castelli Romani.)',
  ]);

  stato.incontroAttivo = false;
  GameMap.sbloccaMovimento();
  mostraToast('💙 Suicune è in roaming! Cercalo nelle zone naturali dei Castelli.', 6000);
}

/* ----------------------------------------------------------
   FUNIVIA DI ROCCA DI PAPA (F11) — gate verso il Sentiero Innevato
   ---------------------------------------------------------- */
async function interagisciFunivia() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof FUNIVIA_ROCCA === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, FUNIVIA_ROCCA);
  if (distanza > FUNIVIA_ROCCA.raggioInterazione) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati alla funivia!`);
    return;
  }

  if (stato.mn.funivia) {
    await mostraDialogo('Faustino il funicolarista', [
      'Bentornato! La funivia è pronta.',
      'Il Sentiero Innevato è lassù in cima. Fai attenzione al freddo… e non solo al freddo.',
    ]);
    return;
  }

  if (stato.medaglie.length < FUNIVIA_ROCCA.medaglieMin) {
    await mostraDialogo('Faustino il funicolarista', [
      'Oh oh, una funivia dall\'aperto? Non è per i principianti!',
      `Torna quando hai almeno ${FUNIVIA_ROCCA.medaglieMin} Medaglie. Lassù c'è roba seria.`,
    ]);
    return;
  }

  await mostraDialogo('Faustino il funicolarista', [
    `${stato.medaglie.length} Medaglie, eh? Allora sei pronto.`,
    'Questa funivia risale dar \'32. Vi porto io in cima, ma lassù… arrangiatevi.',
    'Il Sentiero Innevato è sempre coperto di neve, anche d\'estate. Dicono che ci vive qualcosa.',
    '(La funivia ronza e parte verso la cima del Monte Cavo…)',
  ]);

  stato.mn.funivia = true;
  stato.flags.funiviaUsata = true;
  stato.ultimaZonaLocked = null;
  salvaPartita();
  aggiornaHUD();
  mostraToast('🚡 Hai accesso al Sentiero Innevato! Esplorane le vette.', 5000);
}

/* ----------------------------------------------------------
   METEOROLOGO DI MONTE PORZIO (F11) — previsioni → Zapdos
   ---------------------------------------------------------- */
async function interagisciMeteorologo() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof METEOROLOGO === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, METEOROLOGO);
  if (distanza > METEOROLOGO.raggioInterazione) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati!`);
    return;
  }

  if (legCatturato(145)) {
    await mostraDialogo(METEOROLOGO.nome, [
      'Le letture del telescopio sono tornate nella norma.',
      'Quel temporale del giorno scorso… non l\'avevo mai visto così intenso. Speranza che ritorni? Difficile.',
    ]);
    return;
  }

  if (stato.flags.giornoTemporale > 0 && stato.tempo.giorno < stato.flags.giornoTemporale) {
    const rimanenti = stato.flags.giornoTemporale - stato.tempo.giorno;
    await mostraDialogo(METEOROLOGO.nome, [
      `Le nuvole si stanno addensando…`,
      `Tra ${rimanenti} giorn${rimanenti === 1 ? 'o' : 'i'} arriva il temporale. Sii qui all'Osservatorio quando scoppierà.`,
    ]);
    return;
  }

  const giornoTmp = stato.tempo.giorno + 3;
  stato.flags.giornoTemporale = giornoTmp;
  salvaPartita();

  await mostraDialogo(METEOROLOGO.nome, [
    'Finalmente qualcuno che mi chiede le previsioni! Tutti ignorano il meteorologo…',
    'Il barometro cala, le nuvole arrivano da nord. Segnatelo sul Pokédex:',
    `TRA 3 GIORNI (Giorno ${giornoTmp}) ci sarà un temporale violento proprio sull'Osservatorio.`,
    'Quando scoppierà, vieni qui: sull\'antenna del telescopio ho visto delle scariche strane. MOLTO strane.',
    '(ti mostra le misurazioni) Queste punte di energia… non sono normali. Non sono umane.',
  ]);
}

/* ----------------------------------------------------------
   ANFRATTI DEI REGI (F11) — enigmi in latino → Trio Regi
   ---------------------------------------------------------- */
async function interagisciAnfratto(idAnfratto) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof ANFRATTI_REGI === 'undefined') return;

  const anfratto = ANFRATTI_REGI.find(a => a.id === idAnfratto);
  if (!anfratto) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, anfratto);
  if (distanza > anfratto.raggioInterazione) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati all'anfratto!`);
    return;
  }

  const nomePokemon = { 377: 'Regirock', 378: 'Regice', 379: 'Registeel' };
  const nomeRegi = nomePokemon[anfratto.legId] || 'Regi';

  if (legCatturato(anfratto.legId)) {
    await mostraDialogo(`📜 ${anfratto.nomeAnfratto}`, [
      'Le pareti dell\'anfratto sono silenziose.',
      `${nomeRegi} è già con te. Il guardiano ha lasciato la sua dimora.`,
    ]);
    return;
  }

  await mostraDialogo(`📜 ${anfratto.nomeAnfratto}`, [
    `Sulla pietra è inciso in latino antico:`,
    `"${anfratto.iscrizione}"`,
  ]);

  // Conta i Pokémon del tipo richiesto nella squadra
  const contTipo = stato.squadra.filter(p => p.tipi && p.tipi.includes(anfratto.tipoRichiesto)).length;

  if (contTipo < 3) {
    await mostraDialogo(`📜 ${anfratto.nomeAnfratto}`, [
      `Il portale non risponde.`,
      `Ti servono almeno 3 Pokémon di tipo ${anfratto.tipoNome} nella squadra.`,
      `(Hai ${contTipo} Pokémon di tipo ${anfratto.tipoNome})`,
    ]);
    return;
  }

  // Condizioni soddisfatte: appare il Regi
  await mostraDialogo(`✨ ${anfratto.nomeAnfratto}`, [
    `Le pietre vibrano. Il portale si apre!`,
    `Tre guerrieri ${anfratto.tipoNome} riconosciuti: la soglia accetta la sfida.`,
    `Dal buio emerge una presenza colossale…`,
    `È ${nomeRegi}!`,
  ]);

  triggeraLeggendario(
    anfratto.legId,
    anfratto.livello,
    nomeRegi,
    null // dialogo già mostrato sopra
  );
}

/* ----------------------------------------------------------
   F12 — LEGA POKÉMON DI COLONNA
   ---------------------------------------------------------- */

// Estrae 6 Pokémon dal pool del Superquattro (5 random + coreId per ultimo)
function estraiTeamSuperquattro(membro) {
  const pool = membro.pool.filter(id => id !== membro.coreId);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const cinque = pool.slice(0, 5);
  const spread = membro.livMax - membro.livMin;
  return [
    ...cinque.map((id, i) => ({ id, livello: membro.livMin + Math.round(spread * i / 5) })),
    { id: membro.coreId, livello: membro.livMax },
  ];
}

// Costruisce il team del Campione Remo con il suo starter finale come core
function estraiTeamRemo() {
  const idBase   = stato.rivale ? stato.rivale.idStarter : 252;
  const coreId   = (typeof STARTER_FINALE !== 'undefined' && STARTER_FINALE[idBase]) || idBase;
  return estraiTeamSuperquattro({ ...REMO_LEGA, coreId });
}

/* ----------------------------------------------------------
   RACCOLTA OGGETTI MAPPA (F12b)
   Controlla se il giocatore è vicino (≤40 m) a un oggetto non ancora
   raccolto e lo aggiunge automaticamente allo zaino/inventario.
   ---------------------------------------------------------- */
function raccogliOggettiVicini() {
  if (typeof OGGETTI_MAPPA === 'undefined') return;
  if (stato.incontroAttivo || dialogoInCorso) return;
  const pos = stato.posizione;
  for (const obj of OGGETTI_MAPPA) {
    if (stato.oggettiRaccolti.includes(obj.id)) continue;
    const dist = GameMap.distanzaMetri(pos, obj);
    if (dist > 40) continue;

    stato.oggettiRaccolti.push(obj.id);

    if (obj.tipo === 'chiave') {
      // Oggetto chiave: va in stato.inventario.chiave
      if (!stato.inventario) stato.inventario = { chiave: {} };
      stato.inventario.chiave[obj.nomeChiave] = true;
      const def = (typeof OGGETTI_CHIAVE !== 'undefined' && OGGETTI_CHIAVE[obj.nomeChiave]) || {};
      const icona = def.icona || '🔑';
      const nome  = def.nome  || obj.nomeChiave;
      mostraToast(`${icona} Hai trovato: <b>${nome}</b>!`, 6000);
    } else {
      // Oggetto normale: aggiunge la quantità allo zaino
      const q = obj.quantita || 1;
      stato.zaino[obj.tipo] = (stato.zaino[obj.tipo] || 0) + q;
      const def  = (typeof OGGETTI !== 'undefined' && OGGETTI[obj.tipo]) || {};
      const nome = def.nome || obj.tipo;
      const icona = def.icona || '📦';
      mostraToast(`${icona} Trovato: ${nome} ×${q}!`, 3000);
    }

    // Rimuove il marker dalla mappa
    if (typeof GameMap.rimuoviMarkerOggetto === 'function') {
      GameMap.rimuoviMarkerOggetto(obj.id);
    }
  }
}

/* ----------------------------------------------------------
   VILLA ALDOBRANDINI (F12b) — Mew post-Lega + Mewtwo
   ---------------------------------------------------------- */
async function interagisciVillaAldobrandini() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof VILLA_ALDOBRANDINI === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, VILLA_ALDOBRANDINI);
  if (distanza > VILLA_ALDOBRANDINI.raggioInterazione) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati alla Villa!`);
    return;
  }

  if (!stato.flags.legaCompletata) {
    await mostraDialogo('🏛️ Villa Aldobrandini', [
      'I cancelli della Villa sono chiusi.',
      'Il guardiano dice: "Torna quando sei il Campione. Solo allora potrai entrare."',
    ]);
    return;
  }

  // Placeholder per Mew (F12b — post sconfitta Mewtwo)
  await mostraDialogo('🏛️ Villa Aldobrandini', [
    'I giardini in terrazza della Villa si aprono su Frascati e Roma.',
    'Tra le fontane barocche e le siepi, qualcosa di piccolo e rosa brilla nella nebbia...',
    '(Mew apparirà qui dopo la sconfitta di Mewtwo nel Bunkerino — prossimo aggiornamento!)',
  ]);
}

// Punto d'ingresso: cliccando la porta della Lega
async function interagisciLega() {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, VIA_VITTORIA_PORTA);
  if (distanza > VIA_VITTORIA_PORTA.raggioInterazione) {
    mostraToast(`🚶 Avvicinati alla porta della Lega (sei a ${Math.round(distanza)} m).`);
    return;
  }
  if (!stato.mn.vittoria) {
    mostraToast('🔒 Servono tutte e 8 le Medaglie per entrare nella Lega!');
    return;
  }

  if (stato.flags.legaCompletata) {
    await mostraDialogo('🏆 Lega di Colonna', [
      'Sei il Campione in carica dei Castelli Romani.',
      'La Hall of Fame conserva il tuo nome. Remo è ancora qui, se vuoi rivedertela.',
    ]);
    return;
  }

  if (!stato.gauntletLega) stato.gauntletLega = { passo: 0 };

  if (stato.gauntletLega.passo > 0) {
    await mostraDialogo('🏆 Lega di Colonna', [
      `Hai già battuto ${stato.gauntletLega.passo} Superquattro in questa run.`,
      'Puoi continuare da dove ti sei fermato.',
    ]);
  } else {
    await mostraDialogo('🏆 Lega di Colonna — Ingresso', [
      'Sei entrato nella Lega Pokémon di Colonna.',
      'Quattro Superquattro ti aspettano. Poi il Campione.',
      'Non ci sono cure esterne: hai solo la tua squadra.',
      '(Se perdi, riparti dal primo Superquattro con la squadra curata.)',
    ]);
  }

  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();
  await avviaPassoLega();
}

// Gestisce il singolo passo della sequenza Lega (ricorsiva)
async function avviaPassoLega() {
  const passo = stato.gauntletLega ? stato.gauntletLega.passo : 0;

  if (passo < 4) {
    // Superquattro passo 0-3
    const membro  = SUPERQUATTRO[passo];
    const squadra = estraiTeamSuperquattro(membro);

    await mostraDialogo(`${membro.classe} ${membro.nome}`, membro.dialogoIntro);

    Battle.avvia({
      allenatore: {
        nome:             `${membro.classe} ${membro.nome}`,
        squadra,
        premioSoldi:      membro.premioSoldi,
        dialogoSconfitta: membro.dialogoSconfitta,
      },
      stato,
      onFine: async (esito) => {
        if (esito === 'sconfitta') {
          stato.gauntletLega = null;
          terminaIncontro(esito);
          salvaPartita();
          await mostraDialogo('💀 Sconfitta alla Lega', [
            'La tua squadra è caduta. Sei fuori dalla Lega.',
            'La squadra è stata curata. Quando sei pronto, ricomincia dall\'inizio.',
          ]);
          return;
        }
        stato.gauntletLega.passo = passo + 1;
        salvaPartita();
        if (passo < 3) {
          const scelta = await mostraScelta(
            `${membro.nome} sconfitto! Vuoi curarti prima del prossimo?`,
            '❤️ Sì, curami', '⚔️ Avanti così'
          );
          if (scelta === 1) curaCompletaSquadra();
        } else {
          // Dopo il 4° SQ, pausa prima del Campione
          const scelta = await mostraScelta(
            'Hai battuto tutti e quattro i Superquattro! Sei pronto per il Campione?',
            '❤️ Curami prima', '🏆 Vai dal Campione'
          );
          if (scelta === 1) curaCompletaSquadra();
        }
        await avviaPassoLega();
      }
    });

  } else {
    // passo === 4: Campione Remo
    const teamRemo = estraiTeamRemo();
    await mostraDialogo(`🏆 Campione ${REMO_LEGA.nome}`, REMO_LEGA.dialogoIntro);

    Battle.avvia({
      allenatore: {
        nome:             `Campione ${REMO_LEGA.nome}`,
        squadra:          teamRemo,
        premioSoldi:      REMO_LEGA.premioSoldi,
        dialogoSconfitta: Array.isArray(REMO_LEGA.dialogoSconfitta)
          ? REMO_LEGA.dialogoSconfitta.join(' ')
          : REMO_LEGA.dialogoSconfitta,
      },
      stato,
      onFine: async (esito) => {
        if (esito === 'sconfitta') {
          stato.gauntletLega = null;
          terminaIncontro(esito);
          salvaPartita();
          await mostraDialogo('💀 Sconfitto dal Campione', [
            'Remo ha difeso il titolo. La tua squadra è stata curata.',
            'Riparti dal primo Superquattro quando sei pronto.',
          ]);
          return;
        }
        // VITTORIA!
        stato.flags.legaCompletata = true;
        stato.gauntletLega = null;
        terminaIncontro(esito);
        salvaPartita();
        await mostraDialogo('🏆 CAMPIONE DEI CASTELLI ROMANI!', [
          ...REMO_LEGA.dialogoSconfitta,
          '— — —',
          'Il tuo nome è stato inciso nella Hall of Fame dei Castelli Romani.',
          'Ma la storia non finisce qui: qualcosa si muove nel Bunkerino di Colonna.',
          'Il Team CoTrAL emerge dall\'ombra. Il post-game ha inizio.',
        ]);
        mostraToast('🎉 Fine del gioco principale — Post-game sbloccato!', 10000);
        aggiornaHUD();
      }
    });
  }
}

// Avvia la lotta contro un allenatore (logica condivisa da click e auto-trigger).
// IMPORTANTE: blocca subito il movimento (incontroAttivo) PRIMA del dialogo, così
// l'auto-trigger non fa partire anche un incontro selvatico nello stesso passo.
async function lottaAllenatore(a) {
  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  await mostraDialogo(`${a.classe} ${a.nome}`, a.dialogoIntro);

  Battle.avvia({
    allenatore: {
      nome: `${a.classe} ${a.nome}`,
      squadra: a.squadra,
      premioSoldi: a.premioSoldi,
      dialogoSconfitta: a.dialogoSconfitta,
    },
    stato: stato,
    onFine: async (esito) => {
      terminaIncontro(esito);
      if (esito === 'vittoria') {
        if (!stato.allenatoriBattuti.includes(a.id)) stato.allenatoriBattuti.push(a.id);
        // F10: se l'allenatore ha un flagVittoria, impostalo e mostra la sequenza speciale
        if (a.flagVittoria) {
          if (!stato.flags) stato.flags = {};
          stato.flags[a.flagVittoria] = true;
          salvaPartita();
          if (a.dialogoVittoriaPost) {
            await mostraDialogo('📢 Notizie dai Castelli', a.dialogoVittoriaPost);
          }
        } else {
          salvaPartita();
        }
      }
    }
  });
}

// Sfida un allenatore cliccando il suo marker (richiede di essere vicino).
async function interagisciAllenatore(idAllenatore) {
  if (stato.incontroAttivo || dialogoInCorso) return;

  const a = ALLENATORI.find(x => x.id === idAllenatore);
  if (!a) return;

  const distanza = GameMap.distanzaMetri(stato.posizione, a);
  if (distanza > 120) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(distanza)} m): avvicinati!`);
    return;
  }

  if (!Array.isArray(stato.allenatoriBattuti)) stato.allenatoriBattuti = [];

  // Già sconfitto: solo una battuta, niente rivincita
  if (stato.allenatoriBattuti.includes(a.id)) {
    await mostraDialogo(`${a.classe} ${a.nome}`, a.dialogoDopo);
    return;
  }

  if (!stato.squadra.some(p => p.hpAttuale > 0)) {
    mostraToast('I tuoi Pokémon sono esausti! Cura la squadra a un Centro Pokémon 🏥.');
    return;
  }

  lottaAllenatore(a);
}

// Auto-trigger stile Pokémon classico: se passi entro 80 m da un allenatore
// non ancora battuto, parte la sfida da sola (senza cliccare nulla).
function controllaAllenatoriVicini() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (!Array.isArray(stato.allenatoriBattuti)) stato.allenatoriBattuti = [];
  if (!stato.squadra.some(p => p.hpAttuale > 0)) return; // squadra KO: niente sfida

  // Se ho appena lottato (es. perso) e sono ancora vicino a QUELL'allenatore,
  // non ri-triggero: aspetto che esca dal suo raggio.
  if (stato.allenatoreCooldown) {
    const ac = ALLENATORI.find(x => x.id === stato.allenatoreCooldown);
    if (ac && GameMap.distanzaMetri(stato.posizione, ac) <= 80) return;
    stato.allenatoreCooldown = null;
  }

  for (const a of ALLENATORI) {
    if (stato.allenatoriBattuti.includes(a.id)) continue;
    if (GameMap.distanzaMetri(stato.posizione, a) <= 80) {
      stato.allenatoreCooldown = a.id; // così non si ri-triggera in loop dopo una sconfitta
      lottaAllenatore(a);
      return;
    }
  }
}

/* ============================================================
   MN VOLO (F9) — viaggio rapido verso i comuni già visitati
   ============================================================ */

// Elenco completo delle destinazioni di volo (con coordinate sicure)
function destinazioniVolo() {
  const lista = [{ comune: 'Borgata Tuscolana', lat: CITTA_PARTENZA.lat, lon: CITTA_PARTENZA.lon }];
  for (const c of CENTRI_POKEMON) {
    lista.push({ comune: c.comune, lat: c.lat, lon: c.lon });
  }
  return lista;
}

// Mostra/nasconde il pulsante ✈️ a seconda che tu abbia la MN Volo
function aggiornaBottoneVolo() {
  const btn = document.getElementById('btn-volo');
  if (!btn) return;
  btn.style.display = (stato.mn && stato.mn.volo) ? 'block' : 'none';
}

// Apre l'overlay con le città dove puoi volare (quelle visitate)
function apriVolo() {
  if (!stato.mn || !stato.mn.volo) return;
  if (stato.incontroAttivo || dialogoInCorso) return;

  // Solo le destinazioni che hai già visitato
  const mete = destinazioniVolo().filter(d => stato.cittaVisitate.includes(d.comune));

  let overlay = document.getElementById('overlay-volo');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay-volo';
    overlay.className = 'nascosto';
    document.body.appendChild(overlay);
  }

  let html = '<div id="volo-card"><div id="volo-titolo">✈️ Vola verso…</div><div id="volo-opzioni">';
  if (mete.length === 0) {
    html += '<p class="menu-vuoto">Non hai ancora visitato nessun comune. Cammina nei paesi per sbloccarli!</p>';
  } else {
    for (const m of mete) {
      html += `<button class="btn-volo-meta" data-lat="${m.lat}" data-lon="${m.lon}" data-comune="${m.comune}">🏙️ ${m.comune}</button>`;
    }
  }
  html += '</div><button id="btn-volo-chiudi">✖ Annulla</button></div>';
  overlay.innerHTML = html;

  overlay.querySelectorAll('.btn-volo-meta').forEach(btn => {
    btn.addEventListener('click', () => {
      voloVerso(parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lon), btn.dataset.comune);
      overlay.classList.add('nascosto');
    });
  });
  document.getElementById('btn-volo-chiudi').addEventListener('click', () => {
    overlay.classList.add('nascosto');
  });

  overlay.classList.remove('nascosto');
}

// Teletrasporta il giocatore al comune scelto
function voloVerso(lat, lon, comune) {
  GameMap.teleporta({ lat, lon });
  stato.posizione = { lat, lon };
  stato.passiDaCheck = 0;       // niente incontro subito dopo l'atterraggio
  stato.ultimaZonaLocked = null;
  salvaPartita();
  aggiornaHUD();
  mostraToast(`✈️ Sei volato a ${comune}!`, 4000);
}

// Testo riassuntivo delle MN possedute (per la tab Salva)
function mnPosseduteTesto() {
  const avute = [];
  if (stato.mn && stato.mn.taglio) avute.push('Taglio');
  if (stato.mn && stato.mn.surf)   avute.push('Surf');
  if (stato.mn && stato.mn.volo)   avute.push('Volo');
  return avute.length ? avute.join(', ') : 'nessuna';
}

/* ============================================================
   MENU DI GIOCO (☰): squadra, zaino, box, salvataggio
   ============================================================ */

let sezioneMenuAttiva = 'squadra';

function apriMenu() {
  if (stato.incontroAttivo) return;
  GameMap.bloccaMovimento();
  document.getElementById('pannello-menu').classList.remove('nascosto');
  mostraSezioneMenu(sezioneMenuAttiva);
}

function chiudiMenu() {
  document.getElementById('pannello-menu').classList.add('nascosto');
  if (!stato.incontroAttivo) GameMap.sbloccaMovimento();
  salvaPartita();
  aggiornaHUD();
}

function mostraSezioneMenu(sezione) {
  sezioneMenuAttiva = sezione;
  document.querySelectorAll('#menu-tabs .tab').forEach(t =>
    t.classList.toggle('attiva', t.dataset.sezione === sezione));
  const contenuto = document.getElementById('menu-contenuto');
  contenuto.innerHTML = '';
  if (sezione === 'squadra')      renderSquadra(contenuto);
  else if (sezione === 'zaino')   renderZaino(contenuto);
  else if (sezione === 'market')  renderMarket(contenuto);
  else if (sezione === 'box')     renderBox(contenuto);
  else                            renderSalvataggio(contenuto);
}

function miniBarraHp(pkm) {
  const pct = Math.max(0, Math.min(100, pkm.hpAttuale / pkm.hpMax * 100));
  const colore = pct <= 20 ? '#e3350d' : (pct <= 50 ? '#f5c518' : '#4caf50');
  return `<div class="mini-hp"><div class="mini-hp-barra" style="width:${pct}%;background:${colore}"></div></div>`;
}

function badgeTipi(pkm) {
  return pkm.tipi.map(t =>
    `<span class="tipo-badge" style="background:${TIPO_COLORI[t] || '#888'}">${TIPO_NOMI[t] || t}</span>`
  ).join(' ');
}

// ── Sezione SQUADRA ──────────────────────────────────────────

function renderSquadra(contenuto) {
  if (stato.squadra.length === 0) {
    contenuto.innerHTML = '<p class="menu-vuoto">Non hai ancora nessun Pokémon.</p>';
    return;
  }
  stato.squadra.forEach((pkm, idx) => {
    const card = document.createElement('div');
    card.className = 'card-pokemon';
    card.innerHTML =
      `<img src="${pkm.sprite.fronte || ''}" alt="${pkm.nome}">` +
      `<div class="card-info">` +
        `<div class="card-riga1"><b>${pkm.nome}</b> <span>Lv.${pkm.livello}</span></div>` +
        `<div class="card-tipi">${badgeTipi(pkm)}</div>` +
        `${miniBarraHp(pkm)}` +
        `<div class="card-hp-testo">${pkm.hpAttuale}/${pkm.hpMax} HP${pkm.hpAttuale <= 0 ? ' · KO' : ''}</div>` +
      `</div>`;
    card.addEventListener('click', () => renderDettagli(idx));
    contenuto.appendChild(card);
  });
  const nota = document.createElement('p');
  nota.className = 'menu-nota';
  nota.textContent = 'Tocca un Pokémon per i dettagli. Il primo della lista scende in campo per primo.';
  contenuto.appendChild(nota);
}

// ── Dettagli di un singolo Pokémon ───────────────────────────

function renderDettagli(idx) {
  const contenuto = document.getElementById('menu-contenuto');
  const pkm = stato.squadra[idx];
  if (!pkm) { mostraSezioneMenu('squadra'); return; }

  const expProssimo = Math.pow(pkm.livello + 1, 3);
  const alCap = pkm.livello >= stato.levelCap;
  const expTesto = alCap
    ? `⛔ Al level cap (Lv.${stato.levelCap}): serve la prossima medaglia`
    : `EXP: ${pkm.exp} · al prossimo livello mancano ${expProssimo - pkm.exp}`;

  const mosseHtml = pkm.mosse.map(m =>
    `<li><span class="tipo-badge" style="background:${TIPO_COLORI[m.tipo] || '#888'}">${TIPO_NOMI[m.tipo] || m.tipo}</span> ` +
    `${m.nomeIt} <small>· Pot. ${m.potenza ?? '—'} · PP ${m.pp}/${m.ppMax}</small></li>`
  ).join('');

  contenuto.innerHTML =
    `<div class="dettagli-testata">` +
      `<img src="${pkm.sprite.fronte || ''}" alt="${pkm.nome}">` +
      `<div>` +
        `<h3>${pkm.nome} <small>Lv.${pkm.livello}</small></h3>` +
        `<div>${badgeTipi(pkm)}</div>` +
        `${miniBarraHp(pkm)}` +
        `<div class="card-hp-testo">${pkm.hpAttuale}/${pkm.hpMax} HP</div>` +
      `</div>` +
    `</div>` +
    `<div class="dettagli-statistiche">` +
      `<div>⚔️ Attacco: <b>${pkm.attacco}</b></div>` +
      `<div>🛡️ Difesa: <b>${pkm.difesa}</b></div>` +
      `<div>✨ Att. Sp.: <b>${pkm.attSp}</b></div>` +
      `<div>🔮 Dif. Sp.: <b>${pkm.difSp}</b></div>` +
      `<div>💨 Velocità: <b>${pkm.velocita}</b></div>` +
      `<div>📈 ${expTesto}</div>` +
    `</div>` +
    `<h4>Mosse</h4><ul class="dettagli-mosse">${mosseHtml}</ul>` +
    `<div class="dettagli-bottoni">` +
      `<button id="btn-sposta-su" ${idx === 0 ? 'disabled' : ''}>⬆ Sposta su</button>` +
      `<button id="btn-deposita" ${stato.squadra.length <= 1 ? 'disabled' : ''}>📦 Deposita nel Box</button>` +
      (MODALITA_TEST ? `<button id="btn-caramella">🍬 Caramella Rara (×${stato.zaino.caramellarara || 0})</button>` : '') +
      `<button id="btn-torna-squadra">↩ Indietro</button>` +
    `</div>`;

  if (MODALITA_TEST) {
    document.getElementById('btn-caramella').addEventListener('click', async () => {
      if ((stato.zaino.caramellarara || 0) <= 0) return;
      const risultato = await Battle.caramellaRara(pkm, stato.levelCap);
      if (risultato.ok) stato.zaino.caramellarara -= 1;
      salvaPartita();
      aggiornaHUD();
      mostraToast(risultato.messaggi.join(' '), 4000);
      renderDettagli(idx);
    });
  }

  document.getElementById('btn-sposta-su').addEventListener('click', () => {
    [stato.squadra[idx - 1], stato.squadra[idx]] = [stato.squadra[idx], stato.squadra[idx - 1]];
    salvaPartita();
    renderDettagli(idx - 1);
  });

  document.getElementById('btn-deposita').addEventListener('click', () => {
    stato.box.push(stato.squadra.splice(idx, 1)[0]);
    salvaPartita();
    mostraToast(`📦 ${pkm.nome} è stato depositato nel Box.`);
    mostraSezioneMenu('squadra');
  });

  document.getElementById('btn-torna-squadra').addEventListener('click', () =>
    mostraSezioneMenu('squadra'));
}

// ── Sezione ZAINO ────────────────────────────────────────────

function renderZaino(contenuto) {
  let almenoUno = false;
  for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
    if (oggetto.categoria === 'test' && !MODALITA_TEST) continue;
    const quanti = stato.zaino[chiave] || 0;
    if (quanti <= 0) continue; // mostra solo ciò che possiedi
    almenoUno = true;

    // Quali oggetti si possono usare dal menu (fuori battaglia)
    const suBersaglio = oggetto.categoria === 'cura' || oggetto.categoria === 'revive' || oggetto.categoria === 'test' || oggetto.categoria === 'curastato';
    const direttamente = oggetto.categoria === 'repellente';
    const usabile = suBersaglio || direttamente;

    const riga = document.createElement('div');
    riga.className = 'card-oggetto';
    riga.innerHTML =
      `<span class="oggetto-icona">${oggetto.icona}</span>` +
      `<div class="card-info">` +
        `<div class="card-riga1"><b>${oggetto.nome}</b> <span>×${quanti}</span></div>` +
        `<small>${oggetto.descrizione}</small>` +
      `</div>` +
      (usabile ? `<button class="btn-preleva" ${(suBersaglio && stato.squadra.length === 0) ? 'disabled' : ''}>Usa</button>` : '');

    if (usabile) {
      riga.querySelector('.btn-preleva').addEventListener('click', () => {
        if (direttamente) usaRepellente(chiave);
        else renderScegliBersaglio(chiave);
      });
    }
    contenuto.appendChild(riga);
  }

  if (!almenoUno) {
    contenuto.innerHTML = '<p class="menu-vuoto">Lo zaino è vuoto. Compra oggetti al 🛒 Poké Market di un comune.</p>';
  } else {
    const nota = document.createElement('p');
    nota.className = 'menu-nota';
    nota.textContent = 'Ball: solo in battaglia. Pozioni/Revitalizzanti/Antidoti: premi "Usa" e scegli il Pokémon. Il Repellente si attiva subito.';
    contenuto.appendChild(nota);
  }

  // Sezione oggetti chiave (non consumabili, per eventi)
  if (typeof OGGETTI_CHIAVE !== 'undefined' && stato.inventario && stato.inventario.chiave) {
    const chiavi = Object.entries(stato.inventario.chiave).filter(([, v]) => v);
    if (chiavi.length > 0) {
      const titolo = document.createElement('p');
      titolo.className = 'menu-nota';
      titolo.style.marginTop = '12px';
      titolo.style.fontWeight = 'bold';
      titolo.textContent = '🔑 Oggetti chiave';
      contenuto.appendChild(titolo);
      for (const [id] of chiavi) {
        const def = OGGETTI_CHIAVE[id] || {};
        const riga = document.createElement('div');
        riga.className = 'card-oggetto';
        riga.innerHTML =
          `<span class="oggetto-icona">${def.icona || '🔑'}</span>` +
          `<div class="card-info">` +
            `<div class="card-riga1"><b>${def.nome || id}</b></div>` +
            `<small>${def.descrizione || ''}</small>` +
          `</div>`;
        contenuto.appendChild(riga);
      }
    }
  }
}

// Attiva il repellente: niente incontri per N passi
function usaRepellente(chiave) {
  const oggetto = OGGETTI[chiave];
  if ((stato.zaino[chiave] || 0) <= 0) return;
  stato.zaino[chiave] -= 1;
  stato.repellentePassi = oggetto.passi || 100;
  salvaPartita();
  mostraToast(`🚷 Repellente attivato: niente incontri per ${stato.repellentePassi} passi.`);
  mostraSezioneMenu('zaino');
}

function renderScegliBersaglio(chiaveOggetto) {
  const contenuto = document.getElementById('menu-contenuto');
  const oggetto = OGGETTI[chiaveOggetto];
  const quanti = stato.zaino[chiaveOggetto] || 0;

  contenuto.innerHTML =
    `<p class="menu-nota">${oggetto.icona} <b>${oggetto.nome}</b> (×${quanti} rimaste) — su quale Pokémon?</p>`;

  stato.squadra.forEach((pkm, idx) => {
    const card = document.createElement('div');
    card.className = 'card-pokemon';
    card.innerHTML =
      `<img src="${pkm.sprite.fronte || ''}" alt="${pkm.nome}">` +
      `<div class="card-info">` +
        `<div class="card-riga1"><b>${pkm.nome}</b> <span>Lv.${pkm.livello}</span></div>` +
        `${miniBarraHp(pkm)}` +
        `<div class="card-hp-testo">${pkm.hpAttuale}/${pkm.hpMax} HP${pkm.hpAttuale <= 0 ? ' · KO' : ''}</div>` +
      `</div>`;
    card.addEventListener('click', () => usaOggettoSu(chiaveOggetto, idx));
    contenuto.appendChild(card);
  });

  const indietro = document.createElement('button');
  indietro.className = 'btn-preleva';
  indietro.style.width = '100%';
  indietro.textContent = '↩ Torna allo Zaino';
  indietro.addEventListener('click', () => mostraSezioneMenu('zaino'));
  contenuto.appendChild(indietro);
}

async function usaOggettoSu(chiave, idx) {
  const pkm = stato.squadra[idx];
  const oggetto = OGGETTI[chiave];
  if (!pkm || (stato.zaino[chiave] || 0) <= 0) return;

  if (oggetto.categoria === 'cura') {
    if (pkm.hpAttuale <= 0) {
      mostraToast(`${pkm.nome} è KO: serve il Centro Pokémon 🏥, la Pozione non basta.`);
      return;
    }
    if (pkm.hpAttuale >= pkm.hpMax) {
      mostraToast(`Gli HP di ${pkm.nome} sono già al massimo!`);
      return;
    }
    const cura = Math.min(oggetto.cura, pkm.hpMax - pkm.hpAttuale);
    pkm.hpAttuale += cura;
    stato.zaino[chiave] -= 1;
    mostraToast(`🧪 ${pkm.nome} recupera ${cura} HP!`);
  } else if (oggetto.categoria === 'revive') {
    if (pkm.hpAttuale > 0) {
      mostraToast(`${pkm.nome} non è esausto: il Revitalizzante serve sui KO.`);
      return;
    }
    pkm.hpAttuale = Math.floor(pkm.hpMax / 2);
    stato.zaino[chiave] -= 1;
    mostraToast(`💊 ${pkm.nome} si è ripreso! (${pkm.hpAttuale}/${pkm.hpMax} HP)`);
  } else if (oggetto.categoria === 'curastato') {
    const condTarget = oggetto.stato; // null = antidototot (cura tutto)
    if (!pkm.condizione && pkm.hpAttuale > 0) {
      mostraToast(`${pkm.nome} non ha stati alterati!`);
      return;
    }
    if (pkm.hpAttuale <= 0) {
      mostraToast(`${pkm.nome} è KO: usalo dopo averlo rianimato.`);
      return;
    }
    if (condTarget && pkm.condizione !== condTarget) {
      mostraToast(`${pkm.nome} non soffre di ${condTarget}.`);
      return;
    }
    pkm.condizione = null;
    stato.zaino[chiave] -= 1;
    mostraToast(`${oggetto.icona} ${pkm.nome} è guarito!`);
  } else if (oggetto.categoria === 'test') {
    const risultato = await Battle.caramellaRara(pkm, stato.levelCap);
    if (risultato.ok) stato.zaino[chiave] -= 1;
    mostraToast(risultato.messaggi.join(' '), 4000);
  }

  salvaPartita();
  aggiornaHUD();
  renderScegliBersaglio(chiave);
}

// ── Sezione BOX ──────────────────────────────────────────────

function renderBox(contenuto) {
  if (stato.box.length === 0) {
    contenuto.innerHTML = '<p class="menu-vuoto">Il Box è vuoto. Ci finiscono i Pokémon catturati a squadra piena, o quelli che depositi.</p>';
    return;
  }
  stato.box.forEach((pkm, idx) => {
    const card = document.createElement('div');
    card.className = 'card-pokemon';
    card.innerHTML =
      `<img src="${pkm.sprite.fronte || ''}" alt="${pkm.nome}">` +
      `<div class="card-info">` +
        `<div class="card-riga1"><b>${pkm.nome}</b> <span>Lv.${pkm.livello}</span></div>` +
        `<div class="card-tipi">${badgeTipi(pkm)}</div>` +
      `</div>` +
      `<button class="btn-preleva" ${stato.squadra.length >= 6 ? 'disabled' : ''}>⬆ Preleva</button>`;
    card.querySelector('.btn-preleva').addEventListener('click', (e) => {
      e.stopPropagation();
      stato.squadra.push(stato.box.splice(idx, 1)[0]);
      salvaPartita();
      mostraToast(`⚡ ${pkm.nome} è entrato in squadra!`);
      mostraSezioneMenu('box');
    });
    contenuto.appendChild(card);
  });
}

// ── Sezione SALVA ────────────────────────────────────────────

// Testo di stato del Team GdF per la schermata Salva
function legaStatoTesto() {
  if (stato.flags.legaCompletata) return `<div>🏆 Lega: <b>Completata ✔</b> — Sei il Campione!</div>`;
  const g = stato.gauntletLega;
  if (g && g.passo > 0) return `<div>🏆 Lega: <b>In corso</b> — ${g.passo}/4 Superquattro battuti</div>`;
  if (stato.mn.vittoria) return `<div>🏆 Lega: <b>Via Vittoria aperta</b> — pronti per la sfida finale</div>`;
  return `<div>🏆 Lega: <b>Bloccata</b> — servono 8 Medaglie</div>`;
}

function gdFStatoTesto() {
  const f = stato.flags || {};
  if (f.gdFSconfitto)  return `<div>🔷 Team GdF: <b>Sconfitto ✔</b> — Sfere recuperate</div>`;
  if (f.sfereRubate)   return `<div>🔷 Team GdF: <b>Indagine in corso</b> — Sfere rubate a Nemi!</div>`;
  if (f.museoVisitato) return `<div>🔷 Team GdF: <b>Pista attiva</b></div>`;
  return `<div>🔷 Team GdF: <b>Non ancora incontrato</b></div>`;
}

// (NOMI_LEGGENDARI è definito sopra, in leggendariStatoTesto)

const NOMI_LEGGENDARI = {
  144: 'Articuno', 145: 'Zapdos', 146: 'Moltres',
  245: 'Suicune',  249: 'Lugia',  250: 'Ho-Oh',
  251: 'Celebi',
  377: 'Regirock', 378: 'Regice', 379: 'Registeel',
};

function leggendariStatoTesto() {
  const catturati = Array.isArray(stato.legCatturati) ? stato.legCatturati : [];
  const scomparsi = Array.isArray(stato.legScomparsi)  ? stato.legScomparsi  : [];
  const respawn   = (stato.legRespawn && typeof stato.legRespawn === 'object') ? stato.legRespawn : {};
  const totale = Object.keys(NOMI_LEGGENDARI).length;
  const trovati = catturati.filter(id => NOMI_LEGGENDARI[id]).length;

  let html = `<div>✨ Leggendari: <b>${trovati}/${totale}</b>`;
  if (trovati > 0) {
    html += ` — ${catturati.filter(id => NOMI_LEGGENDARI[id]).map(id => NOMI_LEGGENDARI[id]).join(', ')}`;
  }
  html += '</div>';

  for (const [idStr, info] of Object.entries(respawn)) {
    const nome = NOMI_LEGGENDARI[idStr] || `#${idStr}`;
    const gg = info.giornoRespawn - stato.tempo.giorno;
    if (gg > 0) html += `<div>⏳ ${nome}: respawn tra <b>${gg}</b> giorn${gg === 1 ? 'o' : 'i'} (tentativo ${info.tentativi}/3)</div>`;
  }
  for (const id of scomparsi) {
    if (NOMI_LEGGENDARI[id]) html += `<div>☠️ ${NOMI_LEGGENDARI[id]}: <b>scomparso</b></div>`;
  }
  return html;
}

function renderSalvataggio(contenuto) {
  contenuto.innerHTML =
    `<div class="salva-info">` +
      `<div>👣 Passi: <b>${stato.passi}</b></div>` +
      `<div>📅 Giorno: <b>${stato.tempo.giorno}</b> · 🕐 Ora: <b>${formatOrario(stato.tempo.minuti)}</b></div>` +
      `<div>💰 Pokéyen: <b>₽ ${(stato.soldi || 0).toLocaleString('it-IT')}</b></div>` +
      `<div>⚡ Squadra: <b>${stato.squadra.length}</b> · 📦 Box: <b>${stato.box.length}</b></div>` +
      `<div>🏅 Medaglie: <b>${stato.medaglie.length}/8</b> · Level cap: <b>${stato.levelCap}</b></div>` +
      `<div>📀 MN: <b>${mnPosseduteTesto()}</b></div>` +
      `<div>⚔️ Allenatori battuti: <b>${(stato.allenatoriBattuti || []).length}/${ALLENATORI.length}</b></div>` +
      gdFStatoTesto() +
      leggendariStatoTesto() +
      legaStatoTesto() +
      `<small>La partita si salva da sola a ogni passo. Qui puoi farne una copia di sicurezza.</small>` +
    `</div>` +
    `<div class="dettagli-bottoni colonna">` +
      (MODALITA_TEST
        ? `<button id="btn-test-squadra" style="background:#7b2fff;color:#fff;">🧪 Setup squadra TEST (Lv.100 + Regi-kit)</button>`
        : '') +
      `<button id="btn-esporta">📤 Esporta salvataggio (file JSON)</button>` +
      `<button id="btn-importa">📥 Importa salvataggio da file</button>` +
      `<button id="btn-nuova-partita" class="pericolo">🗑 Nuova partita (cancella tutto)</button>` +
    `</div>`;

  if (MODALITA_TEST) {
    document.getElementById('btn-test-squadra').addEventListener('click', inizializzaSquadraTest);
  }
  document.getElementById('btn-esporta').addEventListener('click', esportaSalvataggio);
  document.getElementById('btn-importa').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) importaSalvataggio(input.files[0]);
    });
    input.click();
  });
  document.getElementById('btn-nuova-partita').addEventListener('click', () => {
    const sicuro = confirm('Vuoi davvero cancellare la partita e ricominciare da zero?\n(Il consiglio è di esportare prima un salvataggio!)');
    if (sicuro) {
      localStorage.removeItem(CHIAVE_SALVATAGGIO);
      location.reload();
    }
  });
}

// F11/TEST — Setup squadra potenziata per testare i leggendari
// 6 Pokémon ~BST 540 al Lv.100 in squadra; Regi-utility nel Box
async function inizializzaSquadraTest() {
  mostraToast('🧪 Preparazione squadra test… attendi.', 3000);
  GameMap.bloccaMovimento();

  // 6 Pokémon forti (~BST 535-560, tutti ID ≤ 386)
  const idSquadra = [130, 59, 131, 143, 242, 149];
  // Gyarados(BST540), Arcanine(555), Lapras(535), Snorlax(540), Blissey(540), Dragonite(600)

  // Pokémon "chiave Regi" nel Box: 3×Terra + 3×Volante + 3×Buio
  const idBox = [50, 74, 27, 16, 21, 41, 198, 228, 215];
  // Terra: Diglett, Geodude, Sandshrew
  // Volante: Pidgey, Spearow, Zubat
  // Buio: Murkrow, Houndour, Sneasel

  stato.squadra = [];
  for (const id of idSquadra) {
    const pkm = await Battle.creaIstanza(id, 100);
    if (pkm) {
      pkm.hpAttuale = pkm.hpMax; // HP pieni
      stato.squadra.push(pkm);
    }
  }

  // Non svuotare il box: aggiungi solo se non ci sono già
  const idGiaInBox = stato.box.map(p => p.id);
  for (const id of idBox) {
    if (!idGiaInBox.includes(id)) {
      const pkm = await Battle.creaIstanza(id, 10);
      if (pkm) stato.box.push(pkm);
    }
  }

  // Attiva il roaming di Suicune (già "visto" al lago)
  stato.flags.suicuneVisto   = true;
  stato.flags.suicuneRoaming = true;

  // Dà tutti gli oggetti chiave in test per poter provare Lugia e Ho-Oh
  if (!stato.inventario) stato.inventario = { chiave: {} };
  stato.inventario.chiave['braciere-nemi'] = true;
  stato.inventario.chiave['piuma-sacra']   = true;
  // La Lega dev'essere completata per i trigger post-Lega
  stato.flags.legaCompletata = true;
  // Sblocca tutto: Surf, Taglio, Volo, Funivia, Via Vittoria
  stato.mn.surf     = true;
  stato.mn.taglio   = true;
  stato.mn.volo     = true;
  stato.mn.funivia  = true;
  stato.mn.vittoria = true;
  // Level cap max
  stato.levelCap = 66;

  salvaPartita();
  GameMap.sbloccaMovimento();
  aggiornaHUD();
  mostraToast(
    '🧪 Squadra TEST pronta! Lv.100, tutte le MN, Braciere+Piuma. ' +
    'Pratoni del Vivaro → Lugia · Ponte Ariccia alba+sagra → Ho-Oh!',
    9000
  );
  mostraSezioneMenu('squadra');
}

function esportaSalvataggio() {
  const blob = new Blob([JSON.stringify(stato, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const oggi = new Date().toISOString().slice(0, 10);
  a.download = `pokemon-castelli-${oggi}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostraToast('📤 Salvataggio esportato! Controlla la cartella Download.');
}

function importaSalvataggio(file) {
  const lettore = new FileReader();
  lettore.onload = () => {
    try {
      const dati = JSON.parse(lettore.result);
      if (!dati || typeof dati !== 'object' || !dati.posizione || !Array.isArray(dati.squadra)) {
        mostraToast('⚠️ File non valido: non sembra un salvataggio di questo gioco.');
        return;
      }
      localStorage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(dati));
      location.reload();
    } catch (e) {
      mostraToast('⚠️ File non leggibile: deve essere un JSON esportato dal gioco.');
    }
  };
  lettore.readAsText(file);
}

// ── MN: una zona è ancora bloccata? (F9/F11) ─────────────────
// Una zona "locked" si apre quando il giocatore possiede la MN/chiave giusta.
const MN_PER_NOME = { 'Taglio': 'taglio', 'Surf': 'surf', 'Volo': 'volo', 'Funivia': 'funivia', 'Vittoria': 'vittoria' };

function zonaBloccata(zona) {
  if (!zona || !zona.locked) return false;
  const chiave = MN_PER_NOME[zona.mnRichiesta];
  return !(chiave && stato.mn && stato.mn[chiave]);
}

// Segna come "visitato" il comune se sei vicino al suo Centro Pokémon
// (serve alla MN Volo per sapere dove puoi volare). (F9)
function segnaCittaVisitata() {
  const aggiungi = (nome) => {
    if (nome && !stato.cittaVisitate.includes(nome)) stato.cittaVisitate.push(nome);
  };
  if (GameMap.distanzaMetri(stato.posizione, CITTA_PARTENZA) <= 300) {
    aggiungi('Borgata Tuscolana');
  }
  for (const c of CENTRI_POKEMON) {
    if (GameMap.distanzaMetri(stato.posizione, c) <= 300) aggiungi(c.comune);
  }
}

// ── Trigger incontro → battaglia ─────────────────────────────

function triggeraIncontro(zona) {
  if (stato.incontroAttivo) return;
  if (!stato.squadra.some(p => p.hpAttuale > 0)) return;

  const estratto = World.estraiIncontro(zona);
  if (!estratto) return;

  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  console.log(`[Incontro] Pokémon #${estratto.idPokemon} Lv.${estratto.livello} in "${zona.nome}"`);

  Battle.avvia({
    idPokemon: estratto.idPokemon,
    livello:   estratto.livello,
    zona:      zona,
    stato:     stato,
    onFine:    terminaIncontro
  });
}

function terminaIncontro(esito) {
  stato.incontroAttivo = false;
  GameMap.sbloccaMovimento();
  aggiornaHUD();
  salvaPartita();
  console.log(`[Incontro] Battaglia terminata: ${esito}`);
}

// ── Callback per ogni passo ──────────────────────────────────

function alPasso(nuovaPosizione) {
  stato.posizione = nuovaPosizione;
  stato.passi += 1;
  stato.passiDaCheck += 1;

  // F9.1: avanza il tempo di gioco (indipendente dal booster)
  avanzaTempo();
  controllaEventiTempo();

  // F9.2: consuma i passi del repellente, se attivo
  if (stato.repellentePassi > 0) {
    stato.repellentePassi -= 1;
    if (stato.repellentePassi === 0) {
      mostraToast('🚷 Il repellente ha esaurito il suo effetto.');
    }
  }

  // F9: aggiorna i comuni visitati (per la MN Volo)
  segnaCittaVisitata();

  // F11: cancella il cooldown leggendario se il giocatore ha cambiato zona
  if (stato.legCooldown) {
    const zonaOra = World.trovaZona(nuovaPosizione.lat, nuovaPosizione.lon);
    const zonaId = zonaOra ? zonaOra.id : null;
    if (zonaId !== stato.legCooldown.zonaId) stato.legCooldown = null;
  }

  aggiornaHUD();
  salvaPartita();

  // F9: gli allenatori vicini (≤80 m) ti sfidano da soli, come nei giochi classici
  controllaAllenatoriVicini();

  // F12b: raccoglie automaticamente gli oggetti mappa entro 40 m
  raccogliOggettiVicini();

  if (stato.incontroAttivo) return;

  // F11 — SUICUNE: prima volta al Lago di Nemi → solo scena cinematica, poi roaming
  if (!dialogoInCorso && !stato.flags.suicuneVisto && !legCatturato(245)) {
    const zonaSuicune = World.trovaZona(nuovaPosizione.lat, nuovaPosizione.lon);
    if (zonaSuicune && zonaSuicune.id === 'lago-nemi' && !zonaBloccata(zonaSuicune)) {
      stato.flags.suicuneVisto  = true;
      stato.flags.suicuneRoaming = true;
      salvaPartita();
      triggeraSuicuneScena();
      return;
    }
  }

  if (stato.passiDaCheck >= PASSI_PER_CHECK) {
    stato.passiDaCheck = 0;

    const zona = World.trovaZona(nuovaPosizione.lat, nuovaPosizione.lon);

    if (zonaBloccata(zona)) {
      if (stato.ultimaZonaLocked !== zona.id) {
        stato.ultimaZonaLocked = zona.id;
        mostraToast(`🔒 Questa zona richiede MN ${zona.mnRichiesta}!`);
      }
      return;
    }

    stato.ultimaZonaLocked = null;

    // F12 — MOLTRES: in Via Vittoria, trigger al primo check (come Articuno)
    if (!dialogoInCorso && zona && zona.id === 'via-vittoria' && !legCatturato(146) && !legScomparso(146)) {
      if (!legCooldownAttivo(146, 'via-vittoria')) {
        triggeraLeggendario(
          146, 55, 'Moltres',
          {
            nome: '🔥 Via Vittoria',
            righe: [
              'La Via Vittoria brucia di una luce arancione soprannaturale.',
              'Tra le fiamme che sembrano non bruciare nulla, scende una sagoma imponente.',
              'MOLTRES! L\'uccello del fuoco eterno ti blocca il cammino!',
              '(Il calore è intenso — ma Moltres non attacca. Ti sta sfidando.)',
            ]
          }
        );
        return;
      }
    }

    // F11 — ARTICUNO: nel Sentiero Innevato, trigger al primo check ogni ingresso
    if (!dialogoInCorso && zona && zona.id === 'sentiero-innevato' && !legCatturato(144) && !legScomparso(144)) {
      if (!legCooldownAttivo(144, 'sentiero-innevato')) {
        triggeraLeggendario(
          144, 50, 'Articuno',
          {
            nome: '❄️ Sentiero Innevato',
            righe: [
              'I tuoi passi scricchiolano sulla neve compatta.',
              'Un vento gelido ti investe da ogni lato — temperatura impossibile.',
              'Tra le raffiche di ghiaccio si materializza una sagoma di un blu abissale…',
              'ARTICUNO! L\'uccello del gelo scende verso di te!',
            ]
          }
        );
        return;
      }
    }

    // F11 — CELEBI: nei Boschi del Tuscolo, evento raro (1.5% per check)
    if (!dialogoInCorso && zona && zona.id === 'boschi-tuscolo' && !legCatturato(251) && !legScomparso(251)) {
      if (!legCooldownAttivo(251, 'boschi-tuscolo') && Math.random() < 0.015) {
        triggeraLeggendario(
          251, 40, 'Celebi',
          {
            nome: '🌿 Boschi del Tuscolo',
            righe: [
              'Tra le rovine del Tuscolo senti un fruscio strano.',
              'Una luce verde-dorata danza tra le colonne antiche...',
              'CELEBI! Il Pokémon del tempo e della foresta appare davanti a te!',
              '(Celebi ti fissa con occhi curiosi — un contatto raro, forse irripetibile)',
            ]
          }
        );
        return;
      }
    }

    // F11 — SUICUNE roaming: compare raramente nelle zone naturali (0.8% per check)
    const ZONE_ROAMING_SUICUNE = [
      'percorso-tuscolana', 'vigne-frascati', 'boschi-tuscolo',
      'vigne-marino', 'campagna-aperta', 'monte-cavo', 'lago-albano',
    ];
    if (!dialogoInCorso && stato.flags.suicuneRoaming && !legCatturato(245)) {
      if (zona && ZONE_ROAMING_SUICUNE.includes(zona.id) &&
          !legCooldownAttivo(245, zona.id) && Math.random() < 0.008) {
        triggeraLeggendario(
          245, 45, 'Suicune',
          {
            nome: '💙 Suicune — Incontro Roaming',
            righe: [
              'Una sagoma azzurra attraversa il percorso in un lampo!',
              'È SUICUNE! Il guardiano delle acque si ferma un istante davanti a te.',
              '(Questa è la tua chance: non perdere tempo!)',
            ]
          }
        );
        return;
      }
    }

    // F12b — LUGIA: ai Pratoni del Vivaro, se hai il Braciere di Nemi + post-Lega
    if (!dialogoInCorso && zona && zona.id === 'pratoni-vivaro' &&
        stato.flags.legaCompletata &&
        stato.inventario && stato.inventario.chiave && stato.inventario.chiave['braciere-nemi'] &&
        !legCatturato(249) && !legScomparso(249) &&
        !legCooldownAttivo(249, 'pratoni-vivaro')) {
      const ri249 = stato.legRespawn ? stato.legRespawn[249] : null;
      if (!ri249 || stato.tempo.giorno >= ri249.giornoRespawn) {
        if (ri249) delete stato.legRespawn[249];
        stato.legCooldown = { id: 249, zonaId: 'pratoni-vivaro' };
        triggeraLeggendario(249, 50, 'Lugia', {
          nome: '☁️ Pratoni del Vivaro',
          righe: [
            'Accendi il Braciere di Nemi: le fiamme color rame si alzano verso il cielo...',
            'L\'altopiano si illumina di una luce stranissima. Il vento si blocca di colpo.',
            'Un\'ombra gigantesca copre il sole. Le nuvole si aprono a ventaglio.',
            '...LUGIA! Il guardiano dei mari e dei cieli scende in spirale, attratto dalla fiamma sacra!',
            '(Il Braciere di Nemi è un\'offerta delle navi di Caligola — Lugia risponde.)',
          ],
        });
        return;
      }
    }

    // F12b — HO-OH: sul Ponte di Ariccia, all'alba, durante la Sagra della Porchetta
    if (!dialogoInCorso && stato.flags.legaCompletata && stato.flags.sagra &&
        stato.inventario && stato.inventario.chiave && stato.inventario.chiave['piuma-sacra'] &&
        !legCatturato(250) && !legScomparso(250) &&
        !legCooldownAttivo(250, 'ponte-ariccia')) {
      if (typeof PONTE_ARICCIA !== 'undefined') {
        const distPonte = GameMap.distanzaMetri(stato.posizione, PONTE_ARICCIA);
        if (distPonte <= PONTE_ARICCIA.raggioInterazione &&
            stato.tempo.minuti >= 360 && stato.tempo.minuti < 540) {
          const ri250 = stato.legRespawn ? stato.legRespawn[250] : null;
          if (!ri250 || stato.tempo.giorno >= ri250.giornoRespawn) {
            if (ri250) delete stato.legRespawn[250];
            stato.legCooldown = { id: 250, zonaId: 'ponte-ariccia' };
            triggeraLeggendario(250, 50, 'Ho-Oh', {
              nome: '🔥 Ponte di Ariccia — Alba della Sagra',
              righe: [
                'La Sagra della Porchetta riempie Ariccia di profumi e luci.',
                'All\'alba, la Piuma Sacra che tieni in mano comincia a splendere di arancio...',
                'Dal cielo striato di rosa scende una scia di fuoco dorato.',
                'HO-OH! L\'uccello dell\'arcobaleno plana sul Ponte come un augurio!',
                '(La Piuma Sacra vibra — questa è la tua unica chance!)',
              ],
            });
            return;
          }
        }
      }
    }

    // Repellente attivo: niente incontri selvatici (F9.2)
    if (stato.repellentePassi > 0) return;

    if (zona && zona.incontri.length > 0) {
      const tasso = World.tassoIncontroZona(zona);
      if (Math.random() < tasso) {
        triggeraIncontro(zona);
      }
    }
  }
}

// ── Avvio ────────────────────────────────────────────────────

function avvia() {
  caricaPartita();

  if (MODALITA_TEST) {
    stato.zaino.caramellarara = 999;
  } else {
    delete stato.zaino.caramellarara;
  }

  GameMap.inizializza({
    posizione: stato.posizione,
    onPasso:   alPasso
  });

  aggiornaHUD();

  document.getElementById('btn-menu').addEventListener('click', apriMenu);
  document.getElementById('btn-chiudi-menu').addEventListener('click', chiudiMenu);
  document.getElementById('btn-volo').addEventListener('click', apriVolo); // MN Volo (F9)
  document.querySelectorAll('#menu-tabs .tab').forEach(tab =>
    tab.addEventListener('click', () => mostraSezioneMenu(tab.dataset.sezione)));

  const VELOCITA_CICLO = [1, 2, 3, 5];
  const btnVelocita = document.getElementById('btn-velocita');
  function aggiornaEtichettaVelocita() {
    btnVelocita.textContent = `⏩ x${stato.velocita}`;
  }
  GameMap.impostaVelocita(stato.velocita);
  aggiornaEtichettaVelocita();
  btnVelocita.addEventListener('click', () => {
    const indice = VELOCITA_CICLO.indexOf(stato.velocita);
    stato.velocita = VELOCITA_CICLO[(indice + 1) % VELOCITA_CICLO.length];
    GameMap.impostaVelocita(stato.velocita);
    aggiornaEtichettaVelocita();
    salvaPartita();
  });

  if (!stato.flags || !stato.flags.starterScelto) {
    mostraToast('🏫 Vai al laboratorio del Prof. Castagno e clicca il marker per iniziare!', 6000);
  }

  console.log('[Gioco] Pokémon Castelli Romani avviato. Buon viaggio!');
  console.log('[Info] Zone attive:', 'World.trovaZona(lat, lon)');
  console.log('[Info] Cache PokéAPI:', 'PokeAPI.svuotaCache()');
  console.log('[Info] Stato di gioco:', 'stato (squadra, zaino, levelCap, tempo)');
}

document.addEventListener('DOMContentLoaded', avvia);
