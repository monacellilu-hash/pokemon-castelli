/* ============================================================
   app.js — Avvio del gioco, stato, salvataggi, HUD, incontri,
   menu di gioco (squadra/zaino/box), Centri Pokémon,
   esporta/importa salvataggio (F6).
   F9.1: sistema del tempo (giorno/notte, "Dormi" al Centro).
   ============================================================ */

const CHIAVE_SALVATAGGIO  = 'pkc_salvataggio';
const PASSI_PER_CHECK     = 10;   // ogni quanti passi si fa il check incontro
const MINUTI_PER_PASSO    = 1;    // minuti di gioco per ogni passo

// F14: il gioco gira sulle mappe Tiled. Tutto ciò che è legato alla MAPPA
// (incontri, allenatori, oggetti, eventi) è gestito da map.js a tile.
// Con questo flag il vecchio motore a coordinate lat/lon (OSM) resta spento.
// (Leggendari ed eventi verranno riportati sul sistema a tile più avanti.)
const MAPPA_TILED = true;

// Stato di gioco — tutto ciò che viene salvato in localStorage
let stato = {
  genere:            null,   // 'boy' | 'girl' — scelto alla primissima schermata, determina lo sprite
  posizione:         { ...POSIZIONE_INIZIALE },
  // Ultima mappa/casella su cui si trovava il giocatore (motore Tiled), per
  // riprendere da lì al prossimo avvio invece di ripartire sempre da Borgata
  // Tuscolana. null = partita nuova (usa lo spawn di default). Aggiornati in
  // salvaPartitaOra() da GameMap.posizioneAttualeSalvabile()/stackAttualeSalvabile().
  mappaSalvata:      null,
  // Stack "da dove sono entrato negli interni" (Centro/palestra/casa/…): se
  // l'ultima posizione salvata era dentro un interno, serve per far
  // funzionare l'uscita anche dopo un ricaricamento della pagina — senza,
  // l'uscita non saprebbe più dove riportare il giocatore.
  mappaStackSalvata: null,
  passi:             0,
  passiDaCheck:      0,    // contatore verso il prossimo check incontro
  incontroAttivo:    false, // true mentre una battaglia è in corso
  ultimaZonaLocked:  null,  // evita toast ripetuti per la stessa zona bloccata
  squadra:           [],    // i Pokémon del giocatore (max 6)
  boxes:             Array.from({ length: 24 }, () => Array(30).fill(null)), // 24 box da 30 slot (il "PC" dei giochi)
  zaino:             { pokeball: 0, pozione: 0 },
  soldi:             SOLDI_INIZIALI, // Pokéyen (F9.2)
  repellentePassi:   0,     // passi rimasti con il repellente attivo (F9.2)
  mn:                { taglio: false, surf: false, volo: false, funivia: false, vittoria: false, spaccaroccia: false, forza: false, sub: false, cascata: false }, // MN possedute (F9/F11/F12)
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
  // oggetti chiave (non consumabili, per eventi). bicicletta/cannaPesca già
  // sbloccati per test — quando si decide come farli ottenere in game, basta
  // partire da "false" e assegnarli dall'evento/NPC giusto.
  inventario:        { chiave: { bicicletta: true, cannaPesca: true } },
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
    sagra:                 false,  // F12b: oggi è la Sagra della Porchetta di Ariccia (→ Ho-Oh)
    lugiaScena:            false,  // F12b: scena cinematica Lugia ai Pratoni già mostrata
    cotralAricciaDebellata: false, // F12b: 4 agenti CoTrAL ad Ariccia sconfitti
    bunkerinoDebellato:    false,  // F12b: Direttore Lucio sconfitto nel Bunkerino
    mewtwoSconfitto:       false,  // F12b: Mewtwo incontrato (catturato o fuggito)
  },
  gauntletBunkerino: null,  // F12b: progresso nel dungeon Bunkerino { indice: 0..4 }
  // F9.1 — Sistema del tempo
  tempo: {
    giorno:  1,    // conta-giorni globale
    minuti:  480,  // minuti dall'inizio della giornata (480 = 08:00)
    notteToast: false, // flag: toast notte già mostrato oggi
  },
  // Meteo overworld (allineamento Essentials, sessione 31 agosto): tipo
  // corrente + passo (stato.passi) a cui torna sereno. 'sole'/'pioggia'
  // random ovunque all'aperto, 'grandine' solo a Monte Cavo. 'sabbia' non
  // ancora disponibile: nessuna zona desertica in gioco (vedi aggiornaMeteo()).
  meteo: { tipo: 'sereno', scadeAlPasso: 0 },
  // Gauntlet palestre: traccia l'indice del prossimo gregario da affrontare
  gauntletPalestra: {},
  // F9.3 — Pensione Pokémon (Nemi): 2 slot depositati + passi insieme + uovo pronto da ritirare
  pensione: { slot1: null, slot2: null, passiInsieme: 0, uovoPronto: false },
};

// ── Salvataggio / caricamento ────────────────────────────────
// RICHIESTA ESPLICITA: il salvataggio NON è più automatico. `salvaPartita()`
// resta chiamata da decine di punti del codice (comprare, catturare,
// depositare…) solo per compatibilità storica, ma ora NON scrive più nulla
// da sola — lo stato in memoria (`stato`) resta comunque corretto per la
// sessione in corso, viene solo persistito su azione esplicita del giocatore.
// L'unico punto che scrive davvero su localStorage è salvaPartitaOra(),
// agganciata al bottone "💾 Salva partita" nella scheda Salva.
function salvaPartita() {
  // Intenzionalmente vuota — vedi salvaPartitaOra().
}

function salvaPartitaOra() {
  try {
    if (typeof GameMap !== 'undefined' && GameMap.posizioneAttualeSalvabile) {
      const p = GameMap.posizioneAttualeSalvabile();
      if (p) stato.mappaSalvata = p;
      if (GameMap.stackAttualeSalvabile) stato.mappaStackSalvata = GameMap.stackAttualeSalvabile();
    }
    localStorage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(stato));
    return true;
  } catch (e) {
    console.warn('[Salvataggio] Impossibile salvare:', e.message);
    return false;
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
      if (!stato.meteo) stato.meteo = { tipo: 'sereno', scadeAlPasso: 0 };
      // Migrazione: vecchi salvataggi senza genere/oggetti chiave nuovi
      if (stato.genere === undefined) stato.genere = null;
      if (!stato.inventario) stato.inventario = { chiave: {} };
      if (!stato.inventario.chiave) stato.inventario.chiave = {};
      if (stato.inventario.chiave.bicicletta === undefined) stato.inventario.chiave.bicicletta = true;
      if (stato.inventario.chiave.cannaPesca === undefined) stato.inventario.chiave.cannaPesca = true;
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
      if (stato.mn.spaccaroccia === undefined) stato.mn.spaccaroccia = false;
      if (stato.mn.forza === undefined) stato.mn.forza = false;
      if (stato.mn.sub === undefined)   stato.mn.sub   = false;
      if (stato.mn.cascata === undefined) stato.mn.cascata = false;
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
      // Vecchi salvataggi con massi spinti persistiti (sess. 37): il puzzle ora
      // si resetta sempre lasciando la stanza, il campo non serve più.
      if (stato.massiSpostati !== undefined) delete stato.massiSpostati;
      if (!stato.inventario || typeof stato.inventario !== 'object') stato.inventario = { chiave: {} };
      if (!stato.inventario.chiave || typeof stato.inventario.chiave !== 'object') stato.inventario.chiave = {};
      // Migrazione: Pokédex (visti/catturati) e Opzioni (sess. 5 set 2026)
      if (!stato.pokedex || typeof stato.pokedex !== 'object') stato.pokedex = {};
      if (!stato.opzioni || typeof stato.opzioni !== 'object') stato.opzioni = {};
      if (stato.opzioni.velocitaTesto === undefined) stato.opzioni.velocitaTesto = 'normale';
      if (stato.opzioni.animazioniBattaglia === undefined) stato.opzioni.animazioniBattaglia = true;
      if (stato.flags.sagra                  === undefined) stato.flags.sagra                  = false;
      if (stato.flags.lugiaScena             === undefined) stato.flags.lugiaScena             = false;
      if (stato.flags.cotralAricciaDebellata === undefined) stato.flags.cotralAricciaDebellata = false;
      if (stato.flags.bunkerinoDebellato     === undefined) stato.flags.bunkerinoDebellato     = false;
      if (stato.flags.mewtwoSconfitto        === undefined) stato.flags.mewtwoSconfitto        = false;
      if (stato.gauntletBunkerino            === undefined) stato.gauntletBunkerino            = null;
      // Migrazione F9.3: Pensione Pokémon
      if (!stato.pensione || typeof stato.pensione !== 'object') {
        stato.pensione = { slot1: null, slot2: null, passiInsieme: 0, uovoPronto: false };
      }
      // Migrazione: assegna il sesso ai Pokémon salvati prima dell'introduzione del genere
      [...(stato.squadra || []), ...tuttiIBoxFlat()].forEach(p => {
        if (p && p.genere === undefined && typeof Battle !== 'undefined' && Battle.generaGenere) {
          p.genere = Battle.generaGenere(p.id);
        }
      });
      // Migrazione Box PC: vecchio Box unico e piatto → 24 box da 30 slot.
      // Riempie i box in ordine, 30 Pokémon per box, mantenendo l'ordine originale.
      // NB: controlliamo il salvataggio grezzo (`salvato.boxes`), non
      // `stato.boxes` — dopo il merge con lo stato di default quest'ultimo è
      // sempre un array valido (i 24 box vuoti di default), quindi non
      // basterebbe a distinguere un salvataggio vecchio da uno nuovo.
      if (!Array.isArray(salvato.boxes)) {
        const vecchioBox = Array.isArray(salvato.box) ? salvato.box : [];
        stato.boxes = Array.from({ length: 24 }, () => Array(30).fill(null));
        vecchioBox.forEach((pkm, i) => {
          const b = Math.floor(i / 30), s = i % 30;
          if (b < 24) stato.boxes[b][s] = pkm;
        });
        delete stato.box;
      }
      // Migrazione evoluzioni: campo felicità sui Pokémon che non ce l'hanno
      [...(stato.squadra || []), ...tuttiIBoxFlat()].forEach(p => {
        if (p && p.felicita == null) p.felicita = 70;
      });
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

// Meteo overworld (allineamento Essentials, sessione 31 agosto): ruota
// casualmente Sole/Pioggia (ovunque all'aperto) e Grandine (solo Monte Cavo),
// con una durata di 30-79 passi. La Sabbia non è ancora ruotata: non esiste
// ancora una zona desertica in gioco — quando ci sarà, basterà aggiungerla
// alla lista "possibili" quando GameMap.contestoMeteo() segnala quella zona,
// sullo stesso modello già usato qui per Monte Cavo/grandine.
// Meteo PER MAPPA (richiesta esplicita di Luca): prima era un'unica
// variabile globale che poteva cambiare ogni ~300 passi in media — con un
// ritmo di cammino normale, sembrava cambiare ogni pochi minuti. Ora ogni
// mappa ha il proprio stato (stato.meteoPerMappa[chiave]) e si tira un
// nuovo meteo AL MASSIMO una volta al giorno per quella mappa (quando
// cambia stato.tempo.giorno rispetto all'ultima volta), con "sole" più
// probabile di "pioggia" (pesi, non più scelta a pari probabilità).
const PESI_METEO        = [['sereno', 50], ['sole', 30], ['pioggia', 20]];
const PESI_METEO_MONTECAVO = [['sereno', 40], ['sole', 25], ['pioggia', 20], ['grandine', 15]];

function _estraiMeteoPesato(pesi) {
  const totale = pesi.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * totale;
  for (const [tipo, peso] of pesi) {
    if (r < peso) return tipo;
    r -= peso;
  }
  return pesi[0][0];
}

function aggiornaMeteo() {
  const ctx = (typeof GameMap !== 'undefined' && GameMap.contestoMeteo)
    ? GameMap.contestoMeteo() : { outdoor: false, monteCavo: false };
  if (!ctx.outdoor) { stato.meteo = { tipo: 'sereno', scadeAlPasso: 0 }; return; }   // interni: sempre sereno

  const chiaveMappa = ctx.mappa || null;
  if (!chiaveMappa) return;

  if (!stato.meteoPerMappa) stato.meteoPerMappa = {};
  const giornoOggi = (stato.tempo && stato.tempo.giorno) || 1;
  let voce = stato.meteoPerMappa[chiaveMappa];

  if (!voce || voce.giorno !== giornoOggi) {
    const nuovoTipo = _estraiMeteoPesato(ctx.monteCavo ? PESI_METEO_MONTECAVO : PESI_METEO);
    const cambiato = voce && voce.tipo !== nuovoTipo;
    voce = { tipo: nuovoTipo, giorno: giornoOggi };
    stato.meteoPerMappa[chiaveMappa] = voce;
    if (cambiato) {
      const msg = nuovoTipo === 'pioggia' ? '🌧️ Oggi piove.'
                : nuovoTipo === 'sole' ? '☀️ Oggi splende il sole.'
                : nuovoTipo === 'grandine' ? '❄️ Oggi grandina.'
                : '🌤️ Il tempo torna sereno.';
      mostraToast(msg, 4000);
    }
  }

  stato.meteo = { tipo: voce.tipo, scadeAlPasso: Infinity };
  if (typeof GameMap !== 'undefined' && GameMap.aggiornaVeloMeteo) GameMap.aggiornaVeloMeteo();
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

// ── Centro Pokémon: menu scelta cura / dormi (FASE 4) ───────

function interagisciCentro(idCentro) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const centro = CENTRI_POKEMON.find(c => c.id === idCentro);
  if (!centro) return;
  const dist = GameMap.distanzaMetri(stato.posizione, centro);
  if (dist > RAGGIO_CURA) {
    mostraToast(`🚶 Sei troppo lontano (${Math.round(dist)} m)!`);
    return;
  }
  _mostraMenuCentro(idCentro);
}

function _mostraMenuCentro(idCentro) {
  let ov = document.getElementById('overlay-menu-centro');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'overlay-menu-centro';
    ov.className = 'nascosto';
    ov.style.cssText = [
      'position:fixed', 'top:50%', 'left:50%',
      'transform:translate(-50%,-50%)', 'z-index:3000',
    ].join(';');
    ov.innerHTML = `
      <div style="background:#f0ead8;border:5px solid #1a2940;border-radius:18px;
                  box-shadow:inset 0 0 0 3px #e0d8c0,0 8px 28px rgba(0,0,0,.55);
                  padding:22px 28px;text-align:center;min-width:220px;">
        <div style="font-family:var(--font-gba);font-size:9px;color:#1a2940;
                    margin-bottom:14px;letter-spacing:1px;">🏥 Centro Pokémon</div>
        <p style="font-size:13px;margin:0 0 18px;color:#333;">
          Benvenuto! I tuoi Pokémon possono riposare qui.</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button id="btn-centro-cura"
            style="padding:9px 16px;font-size:13px;border-radius:10px;
                   border:3px solid #1a2940;background:#48b048;color:#fff;cursor:pointer;">
            ❤️ Cura Pokémon</button>
          <button id="btn-centro-dormi"
            style="padding:9px 16px;font-size:13px;border-radius:10px;
                   border:3px solid #1a2940;background:#4868b0;color:#fff;cursor:pointer;">
            🛏️ Dormi qui</button>
          <button id="btn-centro-chiudi"
            style="padding:9px 16px;font-size:13px;border-radius:10px;
                   border:3px solid #888;background:#ccc;color:#444;cursor:pointer;">
            ✖ Annulla</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
  }
  ov.querySelector('#btn-centro-cura').onclick    = () => { ov.classList.add('nascosto'); curaSquadraDaCentro(idCentro); };
  ov.querySelector('#btn-centro-dormi').onclick   = () => { ov.classList.add('nascosto'); apriMenuDormi(idCentro); };
  ov.querySelector('#btn-centro-chiudi').onclick  = () =>   ov.classList.add('nascosto');
  ov.classList.remove('nascosto');
}

// ── HUD ─────────────────────────────────────────────────────

function aggiornaHUD() {
  document.getElementById('hud-passi').textContent = stato.passi;

  // Soldi (F9.2)
  const elSoldi = document.getElementById('hud-soldi');
  if (elSoldi) elSoldi.textContent = `₽ ${(stato.soldi || 0).toLocaleString('it-IT')}`;

  // Pulsante Volo (F9): visibile solo con la MN Volo
  aggiornaBottoneVolo();

  // Pulsante repellente rapido (QoL): visibile solo se ne hai nello zaino
  aggiornaBottoneRepellente();

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

// ── Pokédex: registro visti/catturati ────────────────────────
// Chiamata da battle.js quando un Pokémon appare in lotta (visto) o viene
// catturato/evolve in squadra (catturato) — non richiede chiamate PokéAPI
// aggiuntive: il nome/sprite li ha già chi chiama (creaIstanza li ha appena
// scaricati), li salviamo qui per poterli rileggere subito nella lista del
// Pokédex senza rifare fetch per gli oltre 380 dati mostrati come "visti".
function segnaPokedex(id, nome, spriteFronte, catturato) {
  if (typeof stato === 'undefined' || !stato.pokedex) return;
  const voce = stato.pokedex[id] || { visto: false, catturato: false };
  voce.visto = true;
  if (catturato) voce.catturato = true;
  voce.nome = nome;
  if (spriteFronte) voce.spriteFronte = spriteFronte;
  stato.pokedex[id] = voce;
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

// ── Popup nome mappa (angolo alto-sinistra, al cambio mappa) ────

let timerNomeMappa = null;

function mostraNomeMappa(nome, durata = 2500) {
  const el = document.getElementById('popup-nome-mappa');
  if (!el || !nome) return;
  el.textContent = nome;
  el.classList.remove('nascosto');
  // Riavvia l'animazione di dissolvenza anche se il popup era già visibile
  // (cambio mappa rapido, es. dentro un cluster).
  el.classList.remove('popup-nome-mappa-anim');
  void el.offsetWidth;
  el.classList.add('popup-nome-mappa-anim');
  if (timerNomeMappa) clearTimeout(timerNomeMappa);
  timerNomeMappa = setTimeout(() => el.classList.add('nascosto'), durata);
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
   mostraScelta — finestra Sì/No (usata dal gauntlet palestre, dalle
   risfide allenatori, ecc.). Ritorna Promise<1|2>

   Riscritta (sess. 5 set 2026) leggendo pbShowCommands in
   0187_Battle_Scene.rb: in Essentials reale un prompt Sì/No non è un
   modale grande al centro dello schermo — è una piccola finestra-elenco
   ancorata in basso a destra, appoggiata al riquadro del messaggio,
   navigabile con le frecce/[A], nello stesso stile della finestra di
   sistema (vedi PauseMenuScene in js/map.js, stesso trattamento).
   Il vecchio pannello era un modale teal/rosa centrato, tipico "popup
   web", per niente in stile Pokémon — lo stesso tipo di problema già
   risolto per il menu Start.
   ============================================================ */

function mostraScelta(messaggio, testo1, testo2) {
  return new Promise(resolve => {
    let overlay = document.getElementById('overlay-scelta');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'overlay-scelta';
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:2000;' +
        'display:flex;align-items:flex-end;justify-content:center;padding-bottom:6vh;' +
        "font-family:'Press Start 2P',monospace;";
      overlay.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;align-items:center;max-width:90vw;">
          <p id="scelta-msg" style="margin:0;padding:12px 20px;background:#141420;
                      border:2px solid #f0f4ff;border-radius:4px;color:#f0f4ff;
                      font-family:Arial,sans-serif;font-size:15px;line-height:1.5;
                      max-width:520px;text-align:center;"></p>
          <div id="scelta-box" style="background:linear-gradient(180deg,#3858a8,#0c1840);
                      border:2px solid #f0f4ff;border-radius:2px;min-width:140px;
                      padding:8px 0;">
            <div class="scelta-riga" data-n="1" style="padding:6px 16px;font-size:11px;
                        color:#ffcb05;cursor:pointer;">▶ <span id="scelta-t1"></span></div>
            <div class="scelta-riga" data-n="2" style="padding:6px 16px;font-size:11px;
                        color:#f0f4ff;cursor:pointer;">&nbsp;&nbsp;<span id="scelta-t2"></span></div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    }

    document.getElementById('scelta-msg').textContent = messaggio;
    document.getElementById('scelta-t1').textContent = testo1;
    document.getElementById('scelta-t2').textContent = testo2;
    overlay.style.display = 'flex';

    const righe = overlay.querySelectorAll('.scelta-riga');
    let cursore = 0;
    function aggiornaCursore() {
      righe.forEach((r, i) => {
        const sel = i === cursore;
        r.style.color = sel ? '#ffcb05' : '#f0f4ff';
        r.firstChild.textContent = sel ? '▶ ' : '  ';
      });
    }

    function scegli(n) {
      overlay.style.display = 'none';
      document.removeEventListener('keydown', suTastiera);
      resolve(n);
    }
    function suTastiera(e) {
      // stopPropagation: senza, lo stesso Invio/frecce arrivano ANCHE al
      // listener globale su window (isA/isB/isStart in initTastiera più
      // sotto), che riapriva il menu Start o muoveva il cursore del mondo
      // nello stesso istante in cui si sceglieva Sì/No — bug scoperto
      // testando dal vivo questa stessa riscrittura.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.stopPropagation();
        cursore = cursore === 0 ? 1 : 0;
        aggiornaCursore();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'a' || e.key === 'A') {
        e.stopPropagation();
        scegli(cursore + 1);
      } else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
        e.stopPropagation();
        scegli(2); // B = equivale a "No"/annulla, come nei giochi
      }
    }
    document.addEventListener('keydown', suTastiera);
    righe[0].onclick = () => scegli(1);
    righe[1].onclick = () => scegli(2);
    cursore = 0;
    aggiornaCursore();
  });
}

/* ============================================================
   mostraSceltaLista — riquadro con N righe verticali + Annulla
   Ritorna Promise<indice 0-based | -1 se annullato>

   Ristilizzata (sess. 5 set 2026) insieme a mostraScelta: stesso motivo
   (era un modale "popup web" teal/rosa, niente a che vedere con
   Essentials) — qui la lista resta centrata invece che ancorata
   nell'angolo perché può avere molte voci (es. Riapprendi Mosse, fino
   a 19+ mosse candidate) e serve scorrere, cosa che la finestrella
   piccola di mostraScelta non permette. Stessa palette e font pixel
   della finestra di sistema, navigabile anche da tastiera.
   ============================================================ */

function mostraSceltaLista(messaggio, opzioni) {
  return new Promise(resolve => {
    let overlay = document.getElementById('overlay-scelta-lista');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'overlay-scelta-lista';
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;' +
        'display:flex;align-items:center;justify-content:center;';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div style="background:linear-gradient(180deg,#3858a8,#0c1840);
                  border:2px solid #f0f4ff;border-radius:2px;
                  padding:16px;max-width:420px;width:90%;text-align:center;color:#f0f4ff;">
        <p style="margin:0 0 14px;font-size:14px;line-height:1.5;
                  font-family:Arial,sans-serif;">${messaggio}</p>
        <div id="scelta-lista-righe" style="display:flex;flex-direction:column;
                  max-height:50vh;overflow-y:auto;"></div>
      </div>`;
    const cont = overlay.querySelector('#scelta-lista-righe');
    const tutte = [...opzioni, 'Annulla'];
    const righe = tutte.map((testo, i) => {
      const riga = document.createElement('div');
      riga.style.cssText = "padding:8px 10px;font-size:12px;cursor:pointer;text-align:left;" +
        "font-family:'Press Start 2P',monospace;color:#f0f4ff;";
      riga.innerHTML = `<span class="scelta-lista-cursore">&nbsp;&nbsp;</span>${testo}`;
      riga.onclick = () => scegli(i);
      cont.appendChild(riga);
      return riga;
    });

    let cursore = 0;
    function aggiornaCursore() {
      righe.forEach((r, i) => {
        const sel = i === cursore;
        r.style.color = sel ? '#ffcb05' : '#f0f4ff';
        r.querySelector('.scelta-lista-cursore').textContent = sel ? '▶ ' : '  ';
      });
      righe[cursore].scrollIntoView({ block: 'nearest' });
    }
    function scegli(i) {
      overlay.style.display = 'none';
      document.removeEventListener('keydown', suTastiera);
      resolve(i === tutte.length - 1 ? -1 : i);
    }
    function suTastiera(e) {
      // stopPropagation: stesso motivo di mostraScelta qui sopra, senza il
      // listener globale (isA/isB/isStart) reagirebbe alla stessa pressione.
      if (e.key === 'ArrowUp') { e.stopPropagation(); cursore = (cursore - 1 + tutte.length) % tutte.length; aggiornaCursore(); }
      else if (e.key === 'ArrowDown') { e.stopPropagation(); cursore = (cursore + 1) % tutte.length; aggiornaCursore(); }
      else if (e.key === 'Enter' || e.key === ' ' || e.key === 'a' || e.key === 'A') { e.stopPropagation(); scegli(cursore); }
      else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') { e.stopPropagation(); scegli(tutte.length - 1); }
    }
    document.addEventListener('keydown', suTastiera);
    aggiornaCursore();
    overlay.style.display = 'flex';
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
    segnaPokedex(starter.id, starter.nome, starter.sprite && starter.sprite.fronte, true);
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
      squadra: [{ id: starterRivale.id, livello: LIVELLO_STARTER }],
      premioSoldi: 500,
      dialogoSconfitta: 'Cosa?! Non è possibile! Avevo pure il vantaggio di tipo!',
    },
    stato: stato,
    // Unico caso in tutto il gioco (richiesta esplicita di Luca): se perdi
    // QUESTA lotta resti lì nel laboratorio, niente teletrasporto al
    // Centro Pokémon — troppo presto in partita, non ha ancora senso.
    senzaTeleportSuSconfitta: true,
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
      // Piccola cutscene di congedo (richiesta esplicita, sia in vittoria
      // che in sconfitta): dissolvenza a nero e ritorno, poi il rivale
      // sparisce per davvero dal laboratorio (era rimasto lì per sempre —
      // bug segnalato: "il rivale post lotta non sparisce"). L'NPC "Rivale"
      // nel .tmj/.tmx del lab ha condizione:"remoLabSparito" + gate:true
      // (compare finché il flag è falso, sparisce quando diventa vero).
      if (typeof GameMap !== 'undefined' && GameMap.fadeOutIn) await GameMap.fadeOutIn(500, 500, 400);
      if (!stato.flags) stato.flags = {};
      stato.flags.remoLabSparito = true;
      if (typeof GameMap !== 'undefined' && GameMap.rigeneraNpcMappa) GameMap.rigeneraNpcMappa();
      salvaPartita();
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

  // Ogni Capopalestra dona anche una MT (stile giochi ufficiali)
  const messaggi = [
    `Hai ottenuto la ${palestra.medaglia || 'medaglia di ' + palestra.comune}! (${stato.medaglie.length}/8)`,
    `Il level cap sale: ora i tuoi Pokémon possono crescere fino al livello ${stato.levelCap}.`,
  ];
  if (palestra.mtDonata && typeof OGGETTI !== 'undefined' && OGGETTI[palestra.mtDonata]) {
    if (!stato.zaino[palestra.mtDonata]) stato.zaino[palestra.mtDonata] = 0;
    stato.zaino[palestra.mtDonata] += 1;
    messaggi.push(`${palestra.capopalestra.nome} ti regala anche la ${OGGETTI[palestra.mtDonata].nome}!`);
  }
  // Permesso MN concesso direttamente dalla palestra (Cascata/Sub, sessione 12 agosto).
  if (palestra.mnDonata && !stato.mn[palestra.mnDonata]) {
    stato.mn[palestra.mnDonata] = true;
    const nomiMN = { cascata: 'Cascata', sub: 'Sub' };
    messaggi.push(`${palestra.capopalestra.nome} ti dà anche il permesso di usare la MN ${nomiMN[palestra.mnDonata] || palestra.mnDonata}!`);
  }
  messaggi.push(prossima
    ? `Prossima tappa: la palestra di ${prossima.comune} (tipo ${prossima.tipo})!`
    : 'Hai tutte le medaglie! La Via Vittoria è aperta — cercala tra Genzano e Colonna.');

  salvaPartita();
  aggiornaHUD();

  await mostraDialogo('🏅 ' + (palestra.medaglia || 'Medaglia'), messaggi);
}

// Chiamata da map.js quando si batte il Capopalestra dentro la palestra Tiled.
// Evita di ri-assegnare la medaglia se già presa.
function vinciPalestraTiled(idPalestra) {
  const palestra = PALESTRE.find(p => p.id === idPalestra);
  if (!palestra) return;
  if (stato.medaglie.includes(palestra.id)) return;   // già vinta
  vinciPalestra(palestra);
}

/* ============================================================
   EVOLUZIONI fuori battaglia (pietre, scambio) — usa EVOLUZIONI_DB
   ============================================================ */

// Evoluzione con animazione (flash bianco) + ricalcolo via Battle.evolviIstanza.
async function avviaEvoluzione(pkm, idEvo) {
  const vecchioNome = pkm.nome;
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;z-index:3000;' +
    'pointer-events:none;transition:opacity .45s;';
  document.body.appendChild(flash);

  await mostraDialogo('Evoluzione', [`Cosa?! ${vecchioNome} sta per evolversi!`]);
  flash.style.opacity = '1';
  await new Promise(r => setTimeout(r, 500));
  try {
    await Battle.evolviIstanza(pkm, idEvo);
  } catch (e) {
    flash.remove();
    await mostraDialogo('Evoluzione', ['Serve la connessione per evolvere: riprova più tardi.']);
    return false;
  }
  flash.style.opacity = '0';
  await new Promise(r => setTimeout(r, 450));
  flash.remove();
  salvaPartita();
  aggiornaHUD();
  if (typeof GameMap.aggiornaFollowerSpecie === 'function') GameMap.aggiornaFollowerSpecie();
  await mostraDialogo('Evoluzione', [`🎉 ${vecchioNome} si è evoluto in ${pkm.nome}!`]);
  return true;
}

// Cerca in EVOLUZIONI_DB l'evoluzione per PIETRA del Pokémon con quella pietra.
function trovaEvoluzionePietra(idPkm, chiavePietra) {
  if (typeof EVOLUZIONI_DB === 'undefined') return null;
  const e = EVOLUZIONI_DB[idPkm];
  if (!e) return null;
  const arr = Array.isArray(e) ? e : [e];
  return arr.find(x => x.metodo === 'pietra' && x.valore === chiavePietra) || null;
}

// Cerca l'evoluzione per SCAMBIO del Pokémon (valore = oggetto richiesto o null).
function trovaEvoluzioneScambio(idPkm) {
  if (typeof EVOLUZIONI_DB === 'undefined') return null;
  const e = EVOLUZIONI_DB[idPkm];
  if (!e) return null;
  const arr = Array.isArray(e) ? e : [e];
  return arr.find(x => x.metodo === 'scambio') || null;
}

/* Mercante degli scambi (NPC nei Centri Pokémon da Marino in poi).
   Aggancia un NPC Tiled con azione:'interagisciMercanteScambi'. Per semplicità
   l'oggetto richiesto si verifica nello ZAINO (non "tenuto" dal Pokémon). */
async function interagisciMercanteScambi() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Mercante degli Scambi';

  // Candidati: Pokémon in squadra che evolvono per scambio e (oggetto nello zaino o scambio semplice)
  const candidati = stato.squadra
    .map((pkm, idx) => ({ pkm, idx, evo: trovaEvoluzioneScambio(pkm.id) }))
    .filter(c => c.evo && (c.evo.valore === null || (stato.zaino[c.evo.valore] || 0) > 0));

  if (candidati.length === 0) {
    await mostraDialogo(nome, [
      'Vuoi scambiare un Pokémon? Ti offro una buona squadra!',
      'Al momento nessuno dei tuoi Pokémon può evolvere con uno scambio (serve anche l\'oggetto giusto, se richiesto).'
    ]);
    return;
  }

  // Propone il primo candidato (MVP). Si può estendere a una lista completa.
  const c = candidati[0];
  const oggReq = c.evo.valore ? OGGETTI[c.evo.valore] : null;
  const nomeEvo = (typeof NOMI_POKEMON !== 'undefined' && NOMI_POKEMON[c.evo.idEvo]) || `n.${c.evo.idEvo}`;
  const scelta = await mostraScelta(
    `Il tuo ${c.pkm.nome} può evolversi con uno scambio${oggReq ? ' (serve ' + oggReq.nome + ')' : ''}. Procedo?`,
    'Sì, scambia', 'No, lascia'
  );
  if (scelta !== 1) {
    await mostraDialogo(nome, ['Va bene, torna quando vuoi!']);
    return;
  }
  if (c.evo.valore) {                       // consuma l'oggetto richiesto
    stato.zaino[c.evo.valore] -= 1;
    if ((stato.zaino[c.evo.valore] || 0) <= 0) delete stato.zaino[c.evo.valore];
  }
  await avviaEvoluzione(c.pkm, c.evo.idEvo);
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
// Market "forzato": quando parli col venditore dentro un negozio Tiled, si apre
// quel market a prescindere dalla distanza geografica.
let marketTiledForzato = null;

function marketVicino() {
  if (marketTiledForzato) return POKE_MARKET.find(m => m.id === marketTiledForzato) || null;
  for (const market of POKE_MARKET) {
    if (GameMap.distanzaMetri(stato.posizione, market) <= RAGGIO_MARKET) return market;
  }
  return null;
}

// Apre il Poké Market parlando col venditore (NPC dentro la mappa del negozio).
function apriMarketVenditore(idMarket) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  marketTiledForzato = idMarket;
  // Market migrato a Scene nativa (MarketScene, map.js) — vedi apriMarketNativo().
  if (typeof GameMap !== 'undefined' && GameMap.apriMarketNativo) { GameMap.apriMarketNativo(); return; }
  impostaModalitaMenu('strumenti');
  GameMap.bloccaMovimento();
  document.getElementById('pannello-menu').classList.remove('nascosto');
  mostraSezioneMenu('market');
}

// Venditore della prima città: Poké Market di Frascati (merce base).
// Grottaferrata riusa la STESSA mappa market (mart_interno → file di Frascati),
// quindi lo stesso venditore/merce; nessuna funzione dedicata necessaria.
function apriMarketFrascati() { apriMarketVenditore('mk-frascati'); }

// Apre il Box interagendo col PC di un Centro Pokémon (oggetto Tiled tipo:'pc',
// vedi js/map.js). Un solo PC per Centro basta: i box sono condivisi in tutto
// il gioco, non serve un id come per i Market.
function apriBoxPC() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  // Box migrato a Scene nativa (BoxScene, map.js) — vedi apriBoxNativo().
  if (typeof GameMap !== 'undefined' && GameMap.apriBoxNativo) { GameMap.apriBoxNativo(); return; }
  impostaModalitaMenu('strumenti');
  GameMap.bloccaMovimento();
  document.getElementById('pannello-menu').classList.remove('nascosto');
  mostraSezioneMenu('box');
}

// Venditori dei Market dedicati di Marino e Castel Gandolfo (mappe proprie,
// non più il file riusato di Frascati). Ogni città ha anche un secondo NPC,
// il "venditore speciale", che vende solo oggetti evolutivi rari.
function apriMarketMarino() { apriMarketVenditore('mk-marino'); }
function apriVenditoreSpecialeMarino() { apriMarketVenditore('mk-marino-speciale'); }
function apriMarketCastelGandolfo() { apriMarketVenditore('mk-castel-gandolfo'); }
function apriVenditoreSpecialeCastelGandolfo() { apriMarketVenditore('mk-castel-gandolfo-speciale'); }

// Venditore del Market dedicato di Albano Laziale.
function apriMarketAlbano() { apriMarketVenditore('mk-albano'); }
function apriVenditoreSpecialeAlbano() { apriMarketVenditore('mk-albano-speciale'); }
function apriMarketGenzano() { apriMarketVenditore('mk-genzano'); }
function apriVenditoreSpecialeGenzano() { apriMarketVenditore('mk-genzano-speciale'); }
function apriMarketGrottaferrata() { apriMarketVenditore('mk-grottaferrata'); }

// Market di Colonna (città finale, post-Lega): merce end-game + l'Erborista
// come secondo venditore, stesso schema "venditore speciale" delle altre città.
function apriMarketColonna() { apriMarketVenditore('mk-colonna'); }
function apriErboristaColonna() { apriMarketVenditore('mk-colonna-erborista'); }

// Ricercatori "ignari" dell'Osservatorio (sess. 15 set 2026, richiesta
// esplicita di Luca): a differenza degli altri NON diventano mai grunt —
// restano ricercatori per sempre, solo la battuta cambia dopo la
// rivelazione CoTrAL (confusi, non capiscono cosa stia succedendo intorno
// a loro). Un solo NPC sempre presente (nessun gate), dialogo dinamico via
// azione invece di due oggetti Tiled gemelli.
function _interagisciRicercatoreIgnaro(nomeBase) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const scoperto = !!(stato.flags && stato.flags.osservatorio_cotral_scoperto);
  if (!scoperto) {
    mostraDialogo(nomeBase, ['Interessante, i dati di quest\'anno non hanno alcun senso. Il clima è impazzito.']);
    return;
  }
  mostraDialogo(nomeBase, [
    'Aspetta... i miei colleghi si comportano in modo strano da un po\'. Non capisco cosa stia succedendo.',
    'Io mi occupo solo di analizzare i dati, giuro! Non so niente di nessun "CoTrAL".',
  ]);
}
function interagisciRicercatoreIgnaro1f() { _interagisciRicercatoreIgnaro('Ricercatore'); }
function interagisciRicercatoreIgnaro2f() { _interagisciRicercatoreIgnaro('Ricercatrice'); }
function interagisciRicercatoreIgnaro3f() { _interagisciRicercatoreIgnaro('Ricercatore'); }

// Luogotenente (3F): resta fermo, si combatte SOLO parlandoci con [A]
// (richiesta esplicita di Luca — non un'imboscata automatica come i grunt
// liberi). Riusa la stessa lotta 2 contro 1 con Camilla alleata.
function interagisciLuogotenenteOsservatorio() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (!stato.flags) stato.flags = {};
  if (!stato.flags['grunt_attivo_cotral_osservatorio_luogotenente']) return;
  // Già sconfitto: resta lì (richiesta esplicita di Luca, non deve sparire
  // subito), ma non si può più rifare la lotta parlandogli di nuovo.
  if (stato.flags['grunt_sconfitto_cotral_osservatorio_luogotenente']) {
    if (typeof mostraDialogo === 'function') {
      mostraDialogo('Luogotenente', ['Ho già perso una volta. Non ho altro da dire.']);
    }
    return;
  }
  if (typeof GameMap === 'undefined' || !GameMap.avviaLottaOsservatorioSingola) return;
  GameMap.avviaLottaOsservatorioSingola('cotral_osservatorio_luogotenente');
}

/* ── Rocca di Papa — rocca_npc1, seconda parte cutscene "Baso è via" ──
   Prima parte (si avvicina al giocatore) in dati/cutscene.js. Qui: dialogo
   sul rapimento di Gianluca + dono MN Forza, una tantum. ── */
async function interagisciRoccaNpc1() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (!stato.flags) stato.flags = {};
  const nome = 'Abitante preoccupato';
  if (!stato.flags.rocca_cutscene1_vista) {
    await mostraDialogo(nome, ['Baso...? Non lo vedo da un bel po\'. Speriamo stia bene.']);
    return;
  }
  if (!stato.flags.rocca_cutscene2_vista) {
    await mostraDialogo(nome, [
      'Hanno rapito Gianluca, il nostro operatore della funivia, un oltraggio!',
      'Baso li ha inseguiti sul Percorso 11 per salvarlo e sconfiggere il team CoTrAL.',
    ]);
    await mostraDialogo(nome, ['Ti prego, aiutaci. Prendi questo, ti servirà.']);
    stato.mn.forza = true;
    stato.flags.rocca_cutscene2_vista = true;
    salvaPartita();
    aggiornaHUD();
    await mostraDialogo('🎁 MN Forza', [
      'Hai ottenuto la MN Forza!',
      'Ora puoi spingere i massi che bloccano il cammino in giro per i Castelli.',
    ]);
    return;
  }
  await mostraDialogo(nome, ['Corri, aiuta Baso a tornare sano e salvo!']);
}

/* ── Gianluca liberato (Rocca di Papa): primo dialogo una tantum, poi
   scelta ripetibile per salire a Monte Cavo con la funivia. ── */
async function interagisciGianluca() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (!stato.flags) stato.flags = {};
  const nome = 'Gianluca';
  if (!stato.flags.gianluca_grato) {
    stato.flags.gianluca_grato = true;
    salvaPartita();
    await mostraDialogo(nome, [
      'Grazie per avermi salvato, te ne sarò sempre grato!',
      'Usa pure la mia funivia quando vuoi!',
    ]);
    return;
  }
  const scelta = await mostraScelta('Vuoi salire in cima?', 'Sì', 'No');
  if (scelta !== 1) return;
  if (MAPPA_TILED && GameMap.vaiAMappa) {
    GameMap.vaiAMappa('monte_cavo', null, null, 'da_gianluca_funivia');
  }
}

/* ── Epilogo Rifugio CoTrAL di Rocca di Papa (sess. 12 set 2026): con
   Marcello/i grunt ormai spariti, restano solo Baso e Gianluca nella stanza.
   Baso [A] dà solo un promemoria; Gianluca [A] fa scattare la scena vera
   (Baso si avvicina, ringrazia, invita in palestra) — vedi
   _epilogoBasoCotralRocca in js/map.js. ── */
async function interagisciBasoCotralRocca() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  await mostraDialogo('Baso', ['Libera Gianluca! Vai, ci penso io a sistemare questi qui dentro.']);
}

async function interagisciGianlucaCotralRocca() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (!stato.flags) stato.flags = {};
  if (stato.flags.cotral_rocca_finale) {
    await mostraDialogo('Gianluca', ['Grazie ancora, davvero.']);
    return;
  }
  if (typeof GameMap !== 'undefined' && GameMap.avviaEpilogoBasoCotralRocca) {
    GameMap.avviaEpilogoBasoCotralRocca();
  }
}

async function interagisciOstaggioMuseo1() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Custode del Museo';
  if (stato.flags && stato.flags.museo_nemi_password) {
    await mostraDialogo(nome, ['Grazie per averci liberati! Speriamo che il Team GdF non torni più qui.']);
    return;
  }
  await mostraDialogo(nome, [
    'Non muoverti! Quei tizi ci minacciano da quando siamo entrati stamattina...',
    'Il loro capo è di sopra. Ti prego, fai qualcosa!',
  ]);
}

async function interagisciOstaggioMuseo2() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Visitatore spaventato';
  if (stato.flags && stato.flags.museo_nemi_password) {
    await mostraDialogo(nome, ['Sono ancora scosso, ma sto bene. Grazie di cuore.']);
    return;
  }
  await mostraDialogo(nome, [
    'Siamo bloccati qui dentro, hanno preso in ostaggio pure il custode al piano di sotto!',
    'Non ci hanno fatto niente... per ora.',
  ]);
}

async function interagisciScienziatoLab1() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (!stato.flags) stato.flags = {};
  const nome = 'Assistente del professore';
  if (!stato.flags.pozione_lab_data) {
    stato.flags.pozione_lab_data = true;
    stato.zaino.pozione = (stato.zaino.pozione || 0) + 1;
    salvaPartita();
    aggiornaHUD();
    await mostraDialogo(nome, [
      'Ne abbiamo prodotte troppe per gli esperimenti, tieni pure!',
      'Hai ottenuto una Pozione!',
    ]);
    return;
  }
  await mostraDialogo(nome, ['In bocca al lupo con la tua avventura!']);
}

// ── Riapprendi mosse (Move Relearner) — richiesta esplicita di Luca, NPC ad
// Albano Laziale, a pagamento. Riusa pkm.mosseImparabili (già presente su
// ogni Pokémon per i level-up futuri, vedi battle.js) invece di ricalcolare
// il moveset — nessun dato nuovo, solo un flusso di scelta in più.
const PREZZO_RIAPPRENDI_MOSSE = 1000; // per mossa — importo scelto qui, Luca può cambiarlo

async function interagisciRiapprendiMosse() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Maestro delle Mosse';
  const squadraReale = stato.squadra.filter(p => p && !p.uovo);
  if (squadraReale.length === 0) {
    await mostraDialogo(nome, ['Torna quando avrai un Pokémon con te!']);
    return;
  }

  await mostraDialogo(nome, [
    'Insegno ai Pokémon le mosse che hanno dimenticato lungo la crescita.',
    `Il servizio costa ₽ ${PREZZO_RIAPPRENDI_MOSSE.toLocaleString('it-IT')} a mossa. Su chi vuoi che lavori?`,
  ]);

  const nomiScelta = squadraReale.map(p => `${p.nome}  Lv.${p.livello}`);
  const idxPkm = await mostraSceltaLista('Su quale Pokémon?', nomiScelta);
  if (idxPkm < 0) return;
  const pkm = squadraReale[idxPkm];

  const candidate = (pkm.mosseImparabili || [])
    .filter(m => m.livello <= pkm.livello && !pkm.mosse.some(k => k.nome === m.nome));
  if (candidate.length === 0) {
    await mostraDialogo(nome, [`${pkm.nome} conosce già tutte le mosse che potrebbe riapprendere.`]);
    return;
  }
  if ((stato.soldi || 0) < PREZZO_RIAPPRENDI_MOSSE) {
    await mostraDialogo(nome, ['Non hai abbastanza Pokéyen per il servizio.']);
    return;
  }

  // Nomi italiani per la scelta: un fetch per candidata (in cache dopo la prima volta,
  // stesso meccanismo usato ovunque per le mosse — vedi PokeAPI.getMossa).
  let dettagli;
  try {
    dettagli = await Promise.all(candidate.map(m => PokeAPI.getMossa(m.nome)));
  } catch (e) {
    await mostraDialogo(nome, ['Errore di connessione: riprova più tardi.']);
    return;
  }
  const nomiMosse = dettagli.map((d, i) => `${d.nomeIt} (Lv.${candidate[i].livello})`);
  const idxMossa = await mostraSceltaLista(`Quale mossa vuoi che ${pkm.nome} riapprenda?`, nomiMosse);
  if (idxMossa < 0) return;
  const scelta = dettagli[idxMossa];

  const paga = () => {
    stato.soldi -= PREZZO_RIAPPRENDI_MOSSE;
    salvaPartita();
    aggiornaHUD();
  };

  if (pkm.mosse.length < 4) {
    pkm.mosse.push({ ...scelta, pp: scelta.ppMax });
    paga();
    await mostraDialogo(nome, [`${pkm.nome} ha riappreso ${scelta.nomeIt}!`]);
    return;
  }

  const opzioniDimentica = pkm.mosse.map(m => m.nomeIt || m.nome);
  const idxDimentica = await mostraSceltaLista(
    `${pkm.nome} conosce già 4 mosse. Quale dimenticare per riapprendere ${scelta.nomeIt}?`,
    opzioniDimentica
  );
  if (idxDimentica < 0) { await mostraDialogo(nome, ['Va bene, torna quando vuoi.']); return; }
  pkm.mosse[idxDimentica] = { ...scelta, pp: scelta.ppMax };
  paga();
  await mostraDialogo(nome, [`${pkm.nome} ha dimenticato una mossa e ha riappreso ${scelta.nomeIt}!`]);
}

// Venditori dei Market dedicati di Monte Porzio Catone e Rocca di Papa.
function apriMarketMonteporzio() { apriMarketVenditore('mk-monte-porzio'); }
function apriVenditoreSpecialeMonteporzio() { apriMarketVenditore('mk-monte-porzio-speciale'); }
function apriMarketRoccaDiPapa() { apriMarketVenditore('mk-rocca-di-papa'); }
function apriVenditoreSpecialeRoccaDiPapa() { apriMarketVenditore('mk-rocca-di-papa-speciale'); }

// Venditori del Market dedicato di Ariccia (sessione 6 agosto).
function apriMarketAriccia() { apriMarketVenditore('mk-ariccia'); }
function apriVenditoreSpecialeAriccia() { apriMarketVenditore('mk-ariccia-speciale'); }

/* ============================================================
   MARINO (F9, sess. 37) — Snorlax addormentato, guardia con parola
   d'ordine, puzzle masso/pulsante MN Forza. Posizioni SEGNAPOSTO nel
   .tmj: l'utente le sposterà dove preferisce quando disegna la mappa.
   ============================================================ */

// NPC vicino a Snorlax: regala il Flauto Pokémon (oggetto chiave, unico
// modo per svegliarlo — Snorlax addormentato è l'UNICO esemplare del gioco).
async function donaFlautoMarino() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Suonatore Ambulante';
  if (stato.inventario && stato.inventario.chiave && stato.inventario.chiave.flauto) {
    await mostraDialogo(nome, ['Quella nenia ormai la conosci a memoria, eh? Bel colpo con quel bestione!']);
    return;
  }
  await mostraDialogo(nome, [
    'Visto quel coso enorme addormentato in mezzo alla strada? Nessuno riesce a passare!',
    'Ho un vecchio flauto che potrebbe svegliarlo... Tieni, prendilo pure, io non lo suono più.',
  ]);
  if (!stato.inventario) stato.inventario = { chiave: {} };
  if (!stato.inventario.chiave) stato.inventario.chiave = {};
  stato.inventario.chiave.flauto = true;
  salvaPartita();
  aggiornaHUD();
  mostraToast('🎵 Hai ricevuto il Flauto Pokémon!', 3000);
}

// NPC che (se convinto) rivela la parola d'ordine per passare la guardia
// che blocca l'accesso a una zona di Marino (gate NPC, vedi 'guardia_marino').
async function rivelaParolaMarino() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Comare Ersilia';
  if (stato.flags && stato.flags.marino_password) {
    await mostraDialogo(nome, ['Te l\'ho già detta, no? "Fontana dei Mori". Non te la scordà!']);
    return;
  }
  const scelta = await mostraScelta(
    'Pss... vuoi sapere la parola d\'ordine per passare dalla guardia?',
    'Sì, dimmela', 'No, lascia stare'
  );
  if (scelta !== 1) {
    await mostraDialogo(nome, ['Come vuoi. Se cambi idea, sono sempre qui.']);
    return;
  }
  if (!stato.flags) stato.flags = {};
  stato.flags.marino_password = true;
  salvaPartita();
  await mostraDialogo(nome, ['È "Fontana dei Mori". Dilla alla guardia e ti farà passare.']);
}

// Custode all'ingresso della Zona Safari: fa pagare il biglietto una volta sola
// e sblocca il flag che apre il varco bloccato da 'guardia_safari' (gate NPC).
const PREZZO_INGRESSO_SAFARI = 500;
async function pagaIngressoSafari() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Custode della Riserva';
  if (stato.flags && stato.flags.safari_pagato) {
    await mostraDialogo(nome, ['Hai già pagato il biglietto, entra pure quando vuoi!']);
    return;
  }
  const scelta = await mostraScelta(
    `Benvenuto alla Zona Safari! L'ingresso costa ₽${PREZZO_INGRESSO_SAFARI}. Vuoi pagare?`,
    'Sì, pago', 'No, magari dopo'
  );
  if (scelta !== 1) {
    await mostraDialogo(nome, ['Va bene, torna quando vuoi provare la riserva!']);
    return;
  }
  if ((stato.soldi || 0) < PREZZO_INGRESSO_SAFARI) {
    await mostraDialogo(nome, [`Non hai abbastanza Pokéyen: te ne servono ₽${PREZZO_INGRESSO_SAFARI}.`]);
    return;
  }
  stato.soldi -= PREZZO_INGRESSO_SAFARI;
  if (!stato.flags) stato.flags = {};
  stato.flags.safari_pagato = true;
  salvaPartita();
  aggiornaHUD();
  await mostraDialogo(nome, ['Biglietto pagato! Buona caccia nella riserva.']);
}

// NPC di Frascati che insegna la MN Taglio DOPO aver vinto la palestra (Medaglia
// Vigna). Serve a farsi strada tra gli alberi/vigne verso i Boschi del Tuscolo.
function donaTaglioFrascati() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Vecchio Vignaiolo';
  if (stato.mn && stato.mn.taglio) {
    mostraDialogo(nome, ['Te la cavi già bene tra le vigne, figliuolo!']);
    return;
  }
  if (!stato.medaglie.includes('frascati')) {
    mostraDialogo(nome, [
      'Vedo che giri tra le vigne... ma prima dimostra il tuo valore!',
      'Batti Vinicio alla Palestra, poi ti insegno un trucco di noi vignaroli.'
    ]);
    return;
  }
  stato.mn.taglio = true;
  salvaPartita();
  aggiornaHUD();
  mostraDialogo(nome, [
    'Bravo! Hai battuto Vinicio, eh? Te lo dicevo che ce la facevi.',
    'Tieni, questa è la MN Taglio.',
    'Fatti strada tra le vigne de li Castelli, figliuolo!'
  ]);
}

// Sfida dei Porchettari (Ariccia): solo tra le 23:00 e le 02:00 (a cavallo di
// mezzanotte). Se l'orario è giusto, apre le 5 lotte di fila orchestrate da
// GameMap.avviaSfidaPorchettari; alla fine premia la Piuma (una tantum).
function sfidaPorchettari() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Learco';
  const minuti = (stato.tempo && stato.tempo.minuti) || 0;
  const inFinestra = minuti >= 1380 || minuti < 120;   // 23:00–02:00

  if (!inFinestra) {
    mostraDialogo(nome, ['Non vedi che stiamo ancora allestendo?!? Levati dai piedi!']);
    return;
  }
  if (stato.flags && stato.flags.piuma_porchettari) {
    mostraDialogo(nome, ['Sei già stato il campione della sagra stanotte. Torna un\'altra notte!']);
    return;
  }
  mostraDialogo(nome, [
    'Benvenuto alla sagra! Vino, porchetta e buona musica per tutti!',
    'Ma stanotte non è una sagra come le altre...',
    'Sei uno sfidante valido per i Porchettari?',
  ]).then(() => {
    if (typeof GameMap !== 'undefined' && GameMap.avviaSfidaPorchettari) {
      GameMap.avviaSfidaPorchettari();
    }
  });
}

// Sfida dei Parenti di Baso (Via dei Laghi): 5 lotte di fila, nessuna
// finestra oraria (a differenza dei Porchettari). Vittoria a tutte e 5 →
// stato.flags.famiglia_rocco_battuta (permanente, sblocca l'infermiera).
// (nome funzione/flag tecnici lasciati invariati, invisibili al giocatore)
function sfidaParentiRocco() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Ilario';
  if (stato.flags && stato.flags.famiglia_rocco_battuta) {
    mostraDialogo(nome, ['Hai già battuto tutta la famiglia. Rispetto, davero.']);
    return;
  }
  mostraDialogo(nome, [
    'Ao, fermo là! Prima de passà da qui devi vedertela co\' tutta la famija Baso.',
    'Semo in cinque, uno più duro dell\'antro. Pronto?',
  ]).then(() => {
    if (typeof GameMap !== 'undefined' && GameMap.avviaSfidaParentiRocco) {
      GameMap.avviaSfidaParentiRocco();
    }
  });
}

// Infermiera improvvisata di Via dei Laghi (compare solo dopo la sfida dei
// Parenti di Baso): cura la squadra ogni volta che le parli, come un mini
// Centro Pokémon — nessuna distanza da controllare, è già un dialogo diretto.
function curaSquadraViaLaghi() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Cesira';
  if (!stato.squadra || stato.squadra.length === 0) {
    mostraDialogo(nome, ['Nun hai ancora nessun Pokémon con te!']);
    return;
  }
  stato.squadra.forEach(p => {
    p.hpAttuale = p.hpMax;
    p.condizione = null;
    p.mosse.forEach(m => { m.pp = m.ppMax; });
  });
  salvaPartita();
  if (typeof aggiornaHUD === 'function') aggiornaHUD();
  mostraDialogo(nome, ['Doppo avè visto voatri contro tutta la famija, er minimo che pòzzo fà è curatte la squadra!', '✨ Squadra curata!']);
}

// Infiltrato nella Grotta del Vulcano (travestito da grunt GdF, sess. 7 set
// 2026): al PRIMO dialogo si limita a presentarsi sottovoce (nessuna cura
// ancora, altrimenti sarebbe troppo generoso al primo incontro); da lì in
// poi ogni volta che gli riparli cura la squadra come un Centro Pokémon
// improvvisato, esattamente come curaSquadraViaLaghi().
function curaSquadraGrottaVulcano() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = '???';
  if (!stato.flags) stato.flags = {};
  if (!stato.flags.infiltrato_grotta_vulcano_incontrato) {
    stato.flags.infiltrato_grotta_vulcano_incontrato = true;
    salvaPartita();
    mostraDialogo(nome, ['Shh! Sono un infiltrato...', 'Se ti serve curare i tuoi Pokémon, vieni pure da me!']);
    return;
  }
  if (!stato.squadra || stato.squadra.length === 0) {
    mostraDialogo(nome, ['Nun hai ancora nessun Pokémon con te!']);
    return;
  }
  stato.squadra.forEach(p => {
    p.hpAttuale = p.hpMax;
    p.condizione = null;
    p.mosse.forEach(m => { m.pp = m.ppMax; });
  });
  salvaPartita();
  if (typeof aggiornaHUD === 'function') aggiornaHUD();
  mostraDialogo(nome, ['Ecco fatto, tutto a posto! Occhio ai miei "colleghi"...', '✨ Squadra curata!']);
}

// Scienziato prigioniero del GdF (Grotta del Vulcano, 3° piano, sess. 8 set
// 2026): sempre visibile, ma finché il boss è vivo non gli si può parlare
// per davvero (è sorvegliato). Il "vero" dialogo di ringraziamento + Pietra
// Rubino parte da solo appena il boss cade (CUTSCENE grotta_vulcano_boss_dopo
// in dati/cutscene.js) — questa funzione gestisce solo chi gli parla PRIMA
// (flavor text) o DOPO che se n'è già andato (caso limite).
function parlaScienziatoGrottaVulcano() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nome = 'Professor Anselmi';
  if (!stato.flags) stato.flags = {};
  if (!stato.flags.gdf_boss_grotta_vulcano_sconfitto) {
    mostraDialogo('???', ['(È incatenato e sorvegliato a vista... non riesci ad avvicinarti abbastanza da parlargli, non finché quei GdF sono qui.)']);
    return;
  }
  mostraDialogo(nome, ['Grazie ancora per avermi salvato!']);
}

/* ============================================================
   PENSIONE POKÉMON — Nemi (F9.3)
   Lasci 1-2 Pokémon; se compatibili (maschio+femmina della stessa specie,
   oppure Ditto + qualsiasi altra specie non asessuata) dopo un po' di passi
   fatti insieme nasce un uovo. L'uovo va ritirato dal giocatore, viaggia
   nella squadra e si schiude dopo altri passi nello stadio 1 (Lv.5) della
   specie non-Ditto.
   ============================================================ */

const PASSI_PENSIONE_UOVO = 150;  // passi insieme (compatibili) prima che nasca l'uovo
const PASSI_SCHIUSA_UOVO  = 80;   // passi camminati col giocatore prima della schiusa

// Due Pokémon della pensione possono fare un uovo insieme?
function pensioneCompatibili(a, b) {
  if (!a || !b) return false;
  const DITTO = 132;
  if (a.id === DITTO && b.id === DITTO) return false;           // due Ditto: niente
  if (a.id === DITTO || b.id === DITTO) return true;             // Ditto + chiunque altro
  if (a.genere === 'N' || b.genere === 'N') return false;        // asessuati (non-Ditto): niente
  if (!a.genere || !b.genere || a.genere === b.genere) return false; // serve maschio+femmina
  if (typeof Battle === 'undefined' || !Battle.trovaSpecieBase) return false;
  return Battle.trovaSpecieBase(a.id) === Battle.trovaSpecieBase(b.id);
}

// Specie (stadio 1) del cucciolo che nascerà da una coppia compatibile
function pensioneSpecieUovo(a, b) {
  const DITTO = 132;
  const genitore = a.id === DITTO ? b : a; // se a è Ditto, la specie viene da b (e viceversa)
  return Battle.trovaSpecieBase(genitore.id);
}

// Crea l'oggetto "uovo" che viaggia nella squadra come un Pokémon in più.
// hpMax/hpAttuale a 0 di proposito: tiene l'uovo fuori da ogni logica di
// battaglia (mai selezionato come attivo, mai considerato "vivo") anche
// dopo una cura completa al Centro Pokémon (che imposta hpAttuale = hpMax).
function creaUovo(speciePadreId) {
  return {
    uovo: true,
    id: null,
    nome: 'Uovo',
    tipi: [],
    sprite: {
      fronte: 'sprites/NO/Graphics/Pokemon/Eggs/000.png',
      retro:  'sprites/NO/Graphics/Pokemon/Eggs/000.png',
    },
    livello: 0,
    hpMax: 0,
    hpAttuale: 0,
    mosse: [],
    basi: {},
    mod: { attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0, accuracy: 0, evasion: 0 },
    condizione: null,
    felicita: 0,
    oggetto: null,
    genere: 'N',
    speciePadre: speciePadreId,
    passiRimanenti: PASSI_SCHIUSA_UOVO,
  };
}

// Chiamata ad ogni passo (da alPasso): fa avanzare i passi insieme dei
// Pokémon depositati alla pensione e produce l'uovo al traguardo.
function aggiornaPensione() {
  if (!stato.pensione) return;
  const { slot1, slot2 } = stato.pensione;
  if (slot1 && slot2 && !stato.pensione.uovoPronto && pensioneCompatibili(slot1, slot2)) {
    stato.pensione.passiInsieme += 1;
    if (stato.pensione.passiInsieme >= PASSI_PENSIONE_UOVO) {
      stato.pensione.uovoPronto = true;
      stato.pensione.passiInsieme = 0;
    }
  }
}

// Chiamata ad ogni passo (da alPasso): fa avanzare la schiusa di ogni uovo
// presente in squadra.
function aggiornaUova() {
  if (!stato.squadra) return;
  stato.squadra.forEach(p => {
    if (p && p.uovo) p.passiRimanenti -= 1;
  });
  const pronto = stato.squadra.find(p => p && p.uovo && p.passiRimanenti <= 0);
  if (pronto) schiudiUovo(pronto);
}

async function schiudiUovo(uovo) {
  const idx = stato.squadra.indexOf(uovo);
  if (idx < 0) return;
  try {
    const nuovo = await Battle.creaIstanza(uovo.speciePadre, 5);
    segnaPokedex(nuovo.id, nuovo.nome, nuovo.sprite && nuovo.sprite.fronte, true);
    stato.squadra[idx] = nuovo;
    salvaPartita();
    aggiornaHUD();
    mostraToast(`🥚✨ L'uovo si è schiuso! È nato ${nuovo.nome} (Lv.5)!`, 6000);
  } catch (err) {
    console.error('[Pensione] Errore nella schiusa dell\'uovo:', err);
  }
}

// NPC della Pensione Pokémon di Nemi: deposita/ritira 1-2 Pokémon, ritira
// l'uovo quando è pronto.
async function interagisciPensione() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const nomeNpc = 'Reginella';
  if (!stato.pensione) stato.pensione = { slot1: null, slot2: null, passiInsieme: 0, uovoPronto: false };

  if (stato.pensione.uovoPronto) {
    if (stato.squadra.length >= 6) {
      await mostraDialogo(nomeNpc, [
        'Ce sta \'n uovo pronto pe\' te, ma la tu\' squadra è piena!',
        'Fa\' posto e torna a trovamme.',
      ]);
      return;
    }
    const speciePadre = pensioneSpecieUovo(stato.pensione.slot1, stato.pensione.slot2);
    stato.squadra.push(creaUovo(speciePadre));
    stato.pensione.uovoPronto = false;
    stato.pensione.passiInsieme = 0;
    salvaPartita();
    aggiornaHUD();
    await mostraDialogo(nomeNpc, [
      'Guarda che sorpresa! I tu\' Pokémon hanno fatto \'n uovo insieme!',
      'Portelo con te e continua a cammina\': prima o poi se schiuderà!',
    ]);
    return;
  }

  const occupanti = [stato.pensione.slot1, stato.pensione.slot2].filter(Boolean);

  await mostraDialogo(nomeNpc, [
    'Bentornato alla Pensione Pokémon de Nemi!',
    occupanti.length === 0
      ? 'Se vuoi, pòzzo tené\' compagnia a uno o due dei tu\' Pokémon.'
      : `Ho co\' me ${occupanti.length} tuo${occupanti.length > 1 ? 'i' : ''} Pokémon: ${occupanti.map(p => p.nome).join(' e ')}.`,
  ]);

  const opzioniMenu = [];
  if (occupanti.length < 2) opzioniMenu.push('Lascia un Pokémon');
  if (occupanti.length > 0) opzioniMenu.push('Ritira i tuoi Pokémon');
  opzioniMenu.push('Niente, grazie');

  const scelta = await mostraSceltaLista('Cosa vuoi fare?', opzioniMenu);
  const testoScelta = opzioniMenu[scelta];

  if (testoScelta === 'Lascia un Pokémon') await depositaPensione(nomeNpc);
  else if (testoScelta === 'Ritira i tuoi Pokémon') await ritiraPensione(nomeNpc);
}

async function depositaPensione(nomeNpc) {
  const eleggibili = stato.squadra
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => !p.uovo);
  if (eleggibili.length <= 1) {
    await mostraDialogo(nomeNpc, ['Devi avé\' almeno un Pokémon co\' te fori dalla pensione!']);
    return;
  }
  const opzioni = eleggibili.map(({ p }) => {
    const iconaGenere = p.genere === 'M' ? '♂' : (p.genere === 'F' ? '♀' : '—');
    return `${p.nome} Lv.${p.livello} (${iconaGenere})`;
  });
  const scelta = await mostraSceltaLista('Quale Pokémon vuoi lasciare alla pensione?', opzioni);
  if (scelta < 0) return;
  const { p, idx } = eleggibili[scelta];
  if (!p.genere && typeof Battle !== 'undefined' && Battle.generaGenere) p.genere = Battle.generaGenere(p.id);

  stato.squadra.splice(idx, 1);
  if (!stato.pensione.slot1) stato.pensione.slot1 = p;
  else stato.pensione.slot2 = p;
  stato.pensione.passiInsieme = 0;
  salvaPartita();
  aggiornaHUD();
  await mostraDialogo(nomeNpc, [`Va bene, me prendo cura de ${p.nome}!`]);
}

async function ritiraPensione(nomeNpc) {
  const occupanti = [stato.pensione.slot1, stato.pensione.slot2].filter(Boolean);
  if (occupanti.length === 0) return;
  if (stato.squadra.length + occupanti.length > 6) {
    await mostraDialogo(nomeNpc, ['Nun c\'hai posto abbastanza in squadra pe\' tutti e due! Libera qualche slot prima de torna\'.']);
    return;
  }
  occupanti.forEach(p => stato.squadra.push(p));
  stato.pensione.slot1 = null;
  stato.pensione.slot2 = null;
  stato.pensione.passiInsieme = 0;
  salvaPartita();
  aggiornaHUD();
  await mostraDialogo(nomeNpc, ['Eccoli qua, sani e contenti!']);
}

// NPC del Tunnel Roccioso 4F (sessione 6 agosto): fa scattare la scena
// Latios/Latias (GameMap.avviaLatiosLatiasScena) — dialogo, fuga, roaming.
function avviaLatiosLatiasScena() {
  if (typeof GameMap !== 'undefined' && GameMap.avviaLatiosLatiasScena) {
    GameMap.avviaLatiosLatiasScena();
  }
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

  if (typeof GameMap !== 'undefined' && GameMap.apriMarketNativo) { GameMap.apriMarketNativo(); return; }
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

// Donatori MN sul motore Tiled: nessun controllo di distanza (ci pensa il
// raggio di interazione [A]/Spazio del motore mappe), stesso testo/gate a
// Medaglie di DONATORI_MN. Una funzione per donatore perché l'"azione" di un
// NPC Tiled si chiama senza argomenti (window[dati.azione]()).
async function _interagisciDonatoreTiled(idDonatore) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const d = DONATORI_MN.find(x => x.id === idDonatore);
  if (!d) return;

  if (stato.mn && stato.mn[d.mn]) {
    await mostraDialogo(d.nome, d.dialogoDopo);
    return;
  }
  const pronto = d.palestraRichiesta
    ? stato.medaglie.includes(d.palestraRichiesta)
    : stato.medaglie.length >= d.medaglieMin;
  if (!pronto) {
    await mostraDialogo(d.nome, d.dialogoPrima);
    return;
  }

  await mostraDialogo(d.nome, d.dialogoDono);
  if (!stato.mn) stato.mn = { taglio: false, surf: false, volo: false };
  stato.mn[d.mn] = true;
  stato.ultimaZonaLocked = null;
  salvaPartita();
  aggiornaHUD();
  mostraToast(`🎉 Hai ottenuto la ${d.nomeMN}!`, 5000);
}

// NB: la MN Taglio è già ottenibile a Frascati (donaTaglioFrascati, dopo la
// Medaglia Vigna) — non va duplicata con un secondo donatore.
function interagisciDonatoreSurf() { _interagisciDonatoreTiled('mn-surf'); }
function interagisciDonatoreVolo() { _interagisciDonatoreTiled('mn-volo'); }

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

// Incontro ROAMING (Latios/Latias, sessione 6 agosto — stesso schema pronto
// per Raikou/Entei quando arriveranno, vedi ROADMAP): a differenza di
// triggeraLeggendario, qui si può fuggire/perdere senza conseguenze (il
// leggendario resta "in giro", niente respawn/scomparsa dopo 3 KO) — solo
// la cattura è definitiva. Nessun controllo di zona: può capitare ovunque
// ci sia una zona incontri (vedi _checkRoamingLatiosLatias in map.js).
function triggeraLeggendarioRoaming(id, livello, nomeSpec) {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (legCatturato(id)) return;

  stato.incontroAttivo = true;
  GameMap.bloccaMovimento();

  Battle.avvia({
    idPokemon: id,
    livello:   livello,
    fuggireImpossibile: false,
    stato:     stato,
    onFine: (esito) => {
      if (esito === 'cattura') {
        if (!Array.isArray(stato.legCatturati)) stato.legCatturati = [];
        if (!stato.legCatturati.includes(id)) stato.legCatturati.push(id);
        terminaIncontro(esito);
        mostraToast(`🌟 ${nomeSpec} catturato! È nella tua squadra o nel Box.`, 5000);
      } else {
        // Vittoria, fuga o sconfitta: nessuna penalità, resta in roaming.
        terminaIncontro(esito);
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

// Squadra del Rivale per gli incontri sulla mappa, scalata per "tappa" (n. di
// incontro: 1 = primo, 2 = secondo, …). L'ASSO è sempre lo starter che ha scelto
// (che si evolve con le tappe); i livelli salgono con la tappa.
// assoLivelloOverride (opzionale, prop Tiled "asso_livello"): scavalca il livello
// standard della tappa (14/26/38/50/62/74) quando serve un incontro "fuori scala"
// pur mantenendo lo stadio evolutivo/comprimari di quella tappa (es. Monte Porzio,
// richiesta esplicita: asso lv 32 invece del lv 38 che darebbe la tappa 3).
function costruisciSquadraRivale(tappa, assoLivelloOverride) {
  tappa = Math.max(1, Math.min(6, parseInt(tappa, 10) || 1));
  const aceLv = (assoLivelloOverride > 0) ? assoLivelloOverride : (2 + tappa * 12);  // 14, 26, 38, 50, 62, 74
  const lv = (g) => Math.max(5, aceLv - g);
  const base = (stato.rivale && stato.rivale.idStarter) || 1;
  // Stadio evolutivo dell'asso (starter) in base alla tappa
  let ace;
  if (tappa <= 1) ace = base;                                          // base
  else if (tappa === 2) ace = base + 1;                                // 1ª evoluzione
  else ace = (typeof STARTER_FINALE !== 'undefined' && STARTER_FINALE[base]) || (base + 2); // finale
  // Comprimari che evolvono con le tappe (solo ID 1-386)
  const uccello = tappa <= 1 ? 16 : (tappa <= 3 ? 17 : 18);            // Pidgey→Pidgeotto→Pidgeot
  const cane    = tappa <= 2 ? 261 : 262;                              // Poochyena→Mightyena
  const psi     = tappa <= 3 ? 63 : (tappa <= 4 ? 64 : 65);            // Abra→Kadabra→Alakazam
  const team = [{ id: uccello, livello: lv(2) }];
  if (tappa >= 2) team.push({ id: cane, livello: lv(2) });
  if (tappa >= 3) team.push({ id: psi,  livello: lv(1) });
  if (tappa >= 4) team.push({ id: 282,  livello: lv(1) });            // Gardevoir
  if (tappa >= 5) team.push({ id: 373,  livello: lv(1) });            // Salamence
  team.push({ id: ace, livello: aceLv });                             // ASSO = starter
  return team;
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
   VILLA ALDOBRANDINI (F12b) — Mew (151) post sconfitta Mewtwo
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
      'Il guardiano: "Solo il Campione dei Castelli può entrare."',
    ]);
    return;
  }

  if (!stato.flags.mewtwoSconfitto) {
    await mostraDialogo('🏛️ Villa Aldobrandini', [
      'I giardini in terrazza si aprono su Frascati e Roma.',
      'C\'è qualcosa nell\'aria... una presenza curiosa, leggera.',
      'Ma si nasconde ancora. Forse sente che non è arrivato il momento.',
      'Risolvi prima la questione al Bunkerino di Colonna.',
    ]);
    return;
  }

  if (legCatturato(151)) {
    await mostraDialogo('🏛️ Villa Aldobrandini', [
      'I giardini barocchi sono in pace. La creatura misteriosa è nel tuo Pokédex.',
    ]);
    return;
  }

  if (legScomparso(151)) {
    await mostraDialogo('🏛️ Villa Aldobrandini', [
      'La nebbia è densa. Qualcosa era qui... ma se n\'è dissolto.',
      'Uno spirito libero come quello non ha catene.',
    ]);
    return;
  }

  triggeraLeggendario(
    151, 50, 'Mew',
    {
      nome: '🌸 Villa Aldobrandini',
      righe: [
        'Tra le fontane barocche una forma piccola e rosa fluttua nell\'aria.',
        'Si gira e ti fissa con occhi enormi e curiosi.',
        '"Puui~!" — la voce è quasi un riso.',
        'MEW! Il Pokémon originale, progenitore di tutti gli altri.',
        'Contiene il DNA di ogni Pokémon mai esistito.',
        'Era scappato dal Bunkerino. Ora ha scelto di venire qui. E di fermarsi.',
      ]
    }
  );
}

/* ----------------------------------------------------------
   PORCHETTARO DI ARICCIA (F12b) — NPC chain per la Piuma Sacra
   ---------------------------------------------------------- */
async function interagisciPorchettaro() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof PORCHETTARO === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, PORCHETTARO);
  if (distanza > PORCHETTARO.raggioInterazione) {
    mostraToast(`🚶 Avvicinati ad Adriano (sei a ${Math.round(distanza)} m).`);
    return;
  }

  if (stato.inventario && stato.inventario.chiave && stato.inventario.chiave['piuma-sacra']) {
    await mostraDialogo('🐷 Adriano il Porchettaro', [
      'L\'hai già, quella piuma strana!',
      'Sul Ponte, all\'alba, durante la Sagra... vedrai tu stesso.',
    ]);
    return;
  }

  if (!stato.flags.legaCompletata) {
    await mostraDialogo('🐷 Adriano il Porchettaro', [
      'Aho! Sei venuto per la porchetta? La migliore dei Castelli!',
      'Solo che ultimamente ci sono dei tipi grigi in giro che disturbano la preparazione.',
      'Quando sei qualcuno di importante, torna. Forse puoi aiutarci.',
    ]);
    return;
  }

  const agentiIds = ['cotral-ariccia-1', 'cotral-ariccia-2', 'cotral-ariccia-3', 'cotral-ariccia-4'];
  const debellati = agentiIds.filter(id => stato.allenatoriBattuti.includes(id)).length;

  if (debellati < agentiIds.length) {
    await mostraDialogo('🐷 Adriano il Porchettaro', [
      'Campione! Questi del CoTrAL stanno bloccando il rifornimento di legna per il forno!',
      `Ho visto ${agentiIds.length} agenti in giro qui ad Ariccia. Ne hai sistemati ${debellati}.`,
      'Trovali tutti e quattro qui vicino, poi torna da me!',
    ]);
    return;
  }

  if (!stato.inventario) stato.inventario = { chiave: {} };
  if (!stato.inventario.chiave) stato.inventario.chiave = {};
  stato.inventario.chiave['piuma-sacra'] = true;
  salvaPartita();

  await mostraDialogo('🐷 Adriano il Porchettaro', [
    'Bravo Campione! Hai cacciato tutti quegli agenti grigi!',
    'La Sagra è salva. Possiamo preparare la porchetta in pace!',
    'Prendi questo: l\'ho trovato sul Ponte una mattina all\'alba.',
    'Una piuma iridescente. Non so di che uccello sia. Ma brilla come il cielo al tramonto.',
    'Presentati sul Ponte all\'alba durante la Sagra della Porchetta. Ho la sensazione...',
    '...che quella piuma e te abbiate un appuntamento con qualcosa di straordinario.',
  ]);
  mostraToast('🪶 Piuma Iridescente ottenuta! Il Porchettaro dice: vai sul Ponte all\'alba durante la Sagra.', 9000);
}

/* ----------------------------------------------------------
   BUNKERINO DI COLONNA (F12b) — dungeon CoTrAL, boss + Mewtwo
   ---------------------------------------------------------- */
const GRUNTI_BUNKERINO = ['bunkerino-grunt-1', 'bunkerino-grunt-2', 'bunkerino-grunt-3', 'bunkerino-grunt-4'];

async function interagisciBunkerino() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof BUNKERINO === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, BUNKERINO);
  if (distanza > BUNKERINO.raggioInterazione) {
    mostraToast(`🚶 Avvicinati al Bunkerino (sei a ${Math.round(distanza)} m).`);
    return;
  }

  if (!stato.flags.legaCompletata) {
    await mostraDialogo('🏭 Bunkerino', [
      'Una cantina sprangata con un lucchetto recente.',
      '"Cooperativa Agricola CoTrAL — Area privata" dice una targa.',
    ]);
    return;
  }

  if (stato.flags.mewtwoSconfitto) {
    const msg = legCatturato(151)
      ? 'Il laboratorio è silenzioso. La creatura misteriosa è nel tuo Pokédex.'
      : 'Il laboratorio è silenzioso. Il soggetto se n\'è andato.\n\nQualcosa di luminoso brilla tra i giardini barocchi di Frascati...';
    await mostraDialogo('🏭 Bunkerino', [msg]);
    return;
  }

  if (!stato.gauntletBunkerino) stato.gauntletBunkerino = { indice: 0 };

  if (stato.gauntletBunkerino.indice === 0) {
    await mostraDialogo('🏭 Bunkerino di Colonna', [
      'La cantina nasconde un laboratorio segreto.',
      'Luci al neon, centrifughe, file di botti convertite in incubatori.',
      'Dal fondo arrivano voci del Team CoTrAL. Non si aspettano visite.',
    ]);
  }

  await avviaGauntletBunkerino();
}

async function avviaGauntletBunkerino() {
  const idx = stato.gauntletBunkerino.indice;

  if (idx < GRUNTI_BUNKERINO.length) {
    const idGrunt = GRUNTI_BUNKERINO[idx];
    const grunt = ALLENATORI.find(a => a.id === idGrunt);
    if (!grunt || stato.allenatoriBattuti.includes(idGrunt)) {
      stato.gauntletBunkerino.indice++;
      await avviaGauntletBunkerino();
      return;
    }

    await mostraDialogo(`⚔️ ${grunt.classe} ${grunt.nome}`, grunt.dialogoIntro);
    stato.incontroAttivo = true;
    GameMap.bloccaMovimento();

    Battle.avvia({
      allenatore: {
        nome: `${grunt.classe} ${grunt.nome}`,
        squadra: grunt.squadra,
        premioSoldi: grunt.premioSoldi,
        dialogoSconfitta: grunt.dialogoSconfitta,
      },
      stato,
      onFine: async (esito) => {
        if (esito === 'vittoria') {
          stato.allenatoriBattuti.push(idGrunt);
          stato.soldi = (stato.soldi || 0) + grunt.premioSoldi;
          stato.gauntletBunkerino.indice++;
          terminaIncontro(esito);
          await mostraDialogo(grunt.nome, grunt.dialogoDopo);
          salvaPartita();
          const rimasti = GRUNTI_BUNKERINO.length - stato.gauntletBunkerino.indice;
          const scelta = await mostraScelta(
            rimasti > 0 ? `Avanti! Rimangono ${rimasti} guardie.` : 'Guardie eliminate! Il Direttore ti aspetta.',
            '❤️ Curami', '⚔️ Avanti'
          );
          if (scelta === 1) curaCompletaSquadra();
          await avviaGauntletBunkerino();
        } else {
          terminaIncontro(esito);
          stato.gauntletBunkerino = { indice: 0 };
          salvaPartita();
          await mostraDialogo('💀 Sconfitta', [
            'La squadra è a terra. Il CoTrAL ti ha ricacciato fuori.',
            'Cura i Pokémon e ritorna.',
          ]);
        }
      }
    });

  } else {
    // Boss: Direttore Lucio
    const boss = ALLENATORI.find(a => a.id === 'bunkerino-boss');
    if (!boss) return;

    if (stato.allenatoriBattuti.includes('bunkerino-boss')) {
      await triggeraMewtwo();
      return;
    }

    await mostraDialogo(`🔬 ${boss.classe} ${boss.nome}`, boss.dialogoIntro);
    stato.incontroAttivo = true;
    GameMap.bloccaMovimento();

    Battle.avvia({
      allenatore: {
        nome: boss.nome,
        squadra: boss.squadra,
        premioSoldi: boss.premioSoldi,
        dialogoSconfitta: boss.dialogoSconfitta,
      },
      stato,
      onFine: async (esito) => {
        if (esito === 'vittoria') {
          stato.allenatoriBattuti.push('bunkerino-boss');
          stato.soldi = (stato.soldi || 0) + boss.premioSoldi;
          stato.flags.bunkerinoDebellato = true;
          terminaIncontro(esito);
          await mostraDialogo(boss.nome, boss.dialogoDopo);
          salvaPartita();
          const scelta = await mostraScelta(
            'Il Direttore è sconfitto! Prosegui nel laboratorio?',
            '❤️ Curami prima', '🔬 Entra nel nucleo'
          );
          if (scelta === 1) curaCompletaSquadra();
          await triggeraMewtwo();
        } else {
          terminaIncontro(esito);
          stato.gauntletBunkerino = { indice: 0 };
          salvaPartita();
          await mostraDialogo('💀 Sconfitta', [
            'Il Direttore ha avuto la meglio. Cura la squadra e ritorna.',
          ]);
        }
      }
    });
  }
}

async function triggeraMewtwo() {
  if (legCatturato(150) || legScomparso(150)) {
    stato.flags.mewtwoSconfitto = true;
    stato.gauntletBunkerino = null;
    salvaPartita();
    await mostraDialogo('🏭 Bunkerino', [
      'Mewtwo ha già lasciato il Bunkerino.',
      'Un\'eco di potere immenso è rimasta nell\'aria.',
    ]);
    return;
  }

  triggeraLeggendario(
    150, 70, 'Mewtwo',
    {
      nome: '🔬 Progetto 150 — Il Nucleo',
      righe: [
        'In fondo al laboratorio, davanti a un antico camino di pietra...',
        'Una sagoma alta e silenziosa ti osserva.',
        'Occhi viola che bruciano nell\'ombra.',
        '"Sei venuto a catturarmi? Come tutti gli altri."',
        '"Nessuno mi comanda più. Sono ciò che non dovevo essere."',
        'MEWTWO usa la mente per far tremare il laboratorio!',
      ]
    },
    (esito) => {
      stato.flags.mewtwoSconfitto = true;
      stato.gauntletBunkerino = null;
      salvaPartita();
      const msg = esito === 'cattura'
        ? '🔬 Progetto 150 risolto! Tra i giardini barocchi di Frascati... qualcosa di luminoso si muove nell\'ombra.'
        : '🔬 Il soggetto è fuggito. Tra i giardini di Frascati... una presenza sfugge.';
      mostraToast(msg, 8000);
    }
  );
}

/* ----------------------------------------------------------
   PARCHEGGIONE DI GROTTAFERRATA (F12b) — Deoxys (386)
   ---------------------------------------------------------- */
async function interagisciParcheggione() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof PARCHEGGIONE === 'undefined') return;

  const distanza = GameMap.distanzaMetri(stato.posizione, PARCHEGGIONE);
  if (distanza > PARCHEGGIONE.raggioInterazione) {
    mostraToast(`🚶 Avvicinati al Parcheggione (sei a ${Math.round(distanza)} m).`);
    return;
  }

  if (!stato.flags.legaCompletata) {
    await mostraDialogo('🚀 Parcheggione di Grottaferrata', [
      'Un container bianco con il logo ASI — Agenzia Spaziale Italiana.',
      '"Reclutamento aperto ai Campioni certificati" — dice il cartello.',
      'Non sei ancora il Campione. Torna dopo aver vinto la Lega.',
    ]);
    return;
  }

  if (legCatturato(386)) {
    await mostraDialogo('🚀 Parcheggione di Grottaferrata', [
      'Il responsabile ti saluta con rispetto.',
      '"Missione completata, astronauta. Il tuo Pokédex si è aggiornato da solo durante il volo."',
      '"Ci vediamo sulla Luna, Campione."',
    ]);
    return;
  }

  if (legScomparso(386)) {
    await mostraDialogo('🚀 Parcheggione di Grottaferrata', [
      '"Il soggetto ha rilevato la tua presenza e si è ritirato nell\'orbita più lontana."',
      '"Potremmo rilanciare... ma ci vogliono mesi."',
      '(Il soggetto è scomparso definitivamente nell\'orbita.)',
    ]);
    return;
  }

  const haDivisa = stato.inventario && stato.inventario.chiave && stato.inventario.chiave['divisa-astronauta'];

  if (haDivisa) {
    await mostraDialogo('🚀 ASI — Finestra di lancio aperta', [
      'Il responsabile ti consegna il casco.',
      '"La sonda parte tra dieci minuti. Destinazione: superficie lunare."',
      '"Abbiamo rilevato una presenza aliena dopo l\'ultima eclissi. Un Pokémon cosmico."',
      '"Buona fortuna, astronauta."',
    ]);

    await mostraDialogo('🌕 Superficie Lunare', [
      'La sonda atterra in silenzio sulla polvere grigia.',
      'Il cielo è nero. La Terra brilla all\'orizzonte come un marmo blu.',
      'Davanti a te, una forma che cambia. Cristalli. Luce rossa. Un volto alieno.',
      'DEOXYS — giunto dai confini del cosmo su un meteorite.',
      'Ti fissa attraverso il casco. Ha visitato i Castelli prima di te.',
    ]);

    triggeraLeggendario(
      386, 60, 'Deoxys',
      {
        nome: '🌕 Luna',
        righe: [
          'Sulla polvere lunare, una forma aliena pulsa di luce.',
          'Si trasforma: attacco... difesa... velocità...',
          'DEOXYS — Pokémon DNA originario dello spazio esterno!',
        ]
      },
      () => {
        mostraToast('🌕 Sei tornato sulla Terra. Nessuno ci crederà mai.', 7000);
      }
    );
    return;
  }

  // Prima visita: dai la divisa
  await mostraDialogo('🚀 ASI — Agenzia Spaziale Italiana', [
    'Un uomo in camice si avvicina.',
    '"Sono il Responsabile del programma Castelli nello Spazio."',
    '"Cerchiamo un volontario-astronauta per una sonda di ricognizione lunare."',
    '"Requisiti: essere Campione della Lega Pokémon di Colonna."',
    '"Sei il Campione! La divisa è tua. Torna quando sei pronto per il lancio."',
  ]);

  if (!stato.inventario) stato.inventario = { chiave: {} };
  if (!stato.inventario.chiave) stato.inventario.chiave = {};
  stato.inventario.chiave['divisa-astronauta'] = true;
  salvaPartita();
  mostraToast('👨‍🚀 Divisa da Astronauta ricevuta! Torna al Parcheggione per partire.', 8000);
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
      sfondo: `elite${passo + 1}`,
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
      sfondo: 'champion',
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
        stato.flags.lingue_antiche = true;   // ora sai leggere le iscrizioni antiche
        stato.gauntletLega = null;
        terminaIncontro(esito);
        salvaPartita();
        await mostraDialogo('🏆 CAMPIONE DEI CASTELLI ROMANI!', [
          ...REMO_LEGA.dialogoSconfitta,
          '— — —',
          'Il tuo nome è stato inciso nella Hall of Fame dei Castelli Romani.',
          'Senti qualcosa di nuovo dentro di te: ora comprendi bene le lingue antiche dei Castelli. Le iscrizioni non avranno più segreti.',
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

// Dove "atterra" il Volo su ogni comune: la mappa Tiled e la casella FUORI dal
// Centro Pokémon di quel comune. Si popola man mano che le città vengono create.
// (Borgata: porta Centro a tile 5,13 → fuori 5,14. Frascati: porta a 5,26 → fuori 5,27.
// Marino: porta a 20,36 → fuori 20,37. Castel Gandolfo: porta a 10,29 → fuori 10,30.)
const VOLO_TILED = {
  // Ricalibrato: la mappa è stata allargata (30→79 di larghezza), il vecchio
  // tx:5 era tarato sul layout di prima e ora atterra lontanissimo dalla
  // porta del Centro Pokémon (che oggi è in tile 23,13). Atterra un tile a
  // sud della porta (23,14), verificato libero da collisioni.
  'Borgata Tuscolana': { mappa: 'borgata_tuscolana', tx: 23, ty: 14 },
  'Frascati':          { mappa: 'frascati_centro',   tx: 5,  ty: 27 },
  'Grottaferrata':     { mappa: 'grottaferrata',     tx: 11, ty: 39 },
  'Marino':            { mappa: 'marino',            tx: 20, ty: 37 },
  'Castel Gandolfo':   { mappa: 'castel_gandolfo',   tx: 10, ty: 30 },
  'Monte Porzio Catone': { mappa: 'monteporzio',     tx: 37, ty: 42 },
  'Rocca di Papa':       { mappa: 'rocca_di_papa',   tx: 18, ty: 40 },
  // Mancavano questi 3 (sess. 18 set 2026, segnalato da Luca: "se mi curo in
  // un Centro Pokémon posso volarci, ma con Genzano Albano e Ariccia non
  // funziona") — la città risultava visitata/curata ma voloVerso() non
  // trovava una voce qui, quindi mostrava solo "non ancora raggiungibile in
  // volo" invece di teletrasportare. Atterrano 1 casella a sud della porta
  // del rispettivo Centro Pokémon, verificato libero da collisioni.
  'Albano Laziale':   { mappa: 'albano',  tx: 31, ty: 33 },
  'Ariccia':          { mappa: 'ariccia', tx: 21, ty: 36 },
  'Genzano di Roma':  { mappa: 'genzano', tx: 9,  ty: 46 },
};

// Elenco completo delle destinazioni di volo (con coordinate sicure)
function destinazioniVolo() {
  const lista = [{ comune: 'Borgata Tuscolana', lat: CITTA_PARTENZA.lat, lon: CITTA_PARTENZA.lon }];
  for (const c of CENTRI_POKEMON) {
    lista.push({ comune: c.comune, lat: c.lat, lon: c.lon });
  }
  return lista;
}

// Mostra/nasconde il pulsante ✈️ a seconda che tu abbia la MN Volo E che ti
// trovi in un posto dove si può usare (mai dentro edifici/grotte/dungeon —
// richiesta esplicita di Luca: prima non c'era nessun controllo sul luogo).
function aggiornaBottoneVolo() {
  const btn = document.getElementById('btn-volo');
  if (!btn) return;
  const haVolo = stato.mn && stato.mn.volo;
  const consentito = typeof GameMap === 'undefined' || !GameMap.mappaConsenteVolo || GameMap.mappaConsenteVolo();
  btn.style.display = (haVolo && consentito) ? 'block' : 'none';
}

// Apre l'overlay con le città dove puoi volare (quelle visitate)
function apriVolo() {
  if (!stato.mn || !stato.mn.volo) return;
  if (stato.incontroAttivo || dialogoInCorso) return;
  if (typeof GameMap !== 'undefined' && GameMap.mappaConsenteVolo && !GameMap.mappaConsenteVolo()) {
    if (typeof mostraToast === 'function') mostraToast('🚫 Non puoi usare Volo qui dentro.', 2200);
    return;
  }

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

// Teletrasporta il giocatore al comune scelto: sul motore Tiled lo porta sulla
// mappa+casella FUORI dal Centro Pokémon di quel comune (vedi VOLO_TILED).
function voloVerso(lat, lon, comune) {
  const meta = VOLO_TILED[comune];
  if (MAPPA_TILED && meta && GameMap.vaiAMappa) {
    GameMap.vaiAMappa(meta.mappa, meta.tx, meta.ty);
  } else if (MAPPA_TILED) {
    // Comune visitato ma senza mappa Tiled ancora pronta
    mostraToast(`✈️ ${comune} non è ancora raggiungibile in volo.`, 3000);
    return;
  } else {
    // Vecchio motore lat/lon (fallback)
    GameMap.teleporta({ lat, lon });
  }
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
   MENU DI GIOCO — due modalità:
   'pausa'      (tasto Invio/Start): Squadra, Zaino, Recap, Salva.
   'strumenti'  (bottone ☰):         Market, Box.
   ============================================================ */

// Il Box resta raggiungibile SOLO dal PC del Centro Pokémon ('strumenti'),
// mai dal menu Start (richiesta esplicita dell'utente, come nei giochi veri).
const SCHEDE_PER_MODALITA = {
  // 'recap' non è più una scheda di pari livello (sess. 5 set): il suo
  // contenuto è ora la seconda pagina della Scheda Allenatore nativa
  // (TrainerCardScene/RecapScene in map.js), non un'uscita separata dal
  // menu Start — vedi VOCI_MENU_START in map.js per il perché.
  pausa:      ['squadra', 'zaino', 'salva'],
  strumenti:  ['market', 'box'],
};

let sezioneMenuAttiva = 'squadra';
let menuModalita = 'pausa';
// PROBLEMA 3 (menu Start nativo, Scene Phaser dedicate): true quando il
// pannello DOM è stato aperto come "sezione non ancora migrata" da
// PauseMenuScene (map.js) — in quel caso chiudiMenu() torna alla lista
// nativa invece di uscire del tutto dal menu. Vedi
// apriSezioneMenuDaSceneNativa() più sotto.
let menuNativoInAttesa = false;

// Mostra le tab solo in modalità 'pausa' (Squadra/Zaino/Recap/Salva).
// Market e Box ('strumenti') sono schermate indipendenti aperte interagendo
// nel mondo (NPC del negozio, PC del Centro): NIENTE tab tra loro, altrimenti
// aprendo il Box compariva anche la tab "Market" da cliccare per sbaglio.
function impostaModalitaMenu(modalita) {
  menuModalita = modalita || menuModalita || 'pausa';
  const tabsEl = document.getElementById('menu-tabs');
  if (menuModalita === 'strumenti') {
    if (tabsEl) tabsEl.style.display = 'none';
  } else {
    if (tabsEl) tabsEl.style.display = '';
    document.querySelectorAll('#menu-tabs .tab').forEach(t =>
      t.style.display = (t.dataset.modalita === menuModalita) ? '' : 'none');
  }
}

function apriMenu(modalita) {
  if (stato.incontroAttivo) return;
  impostaModalitaMenu(modalita);
  if (!SCHEDE_PER_MODALITA[menuModalita].includes(sezioneMenuAttiva)) {
    sezioneMenuAttiva = SCHEDE_PER_MODALITA[menuModalita][0];
  }
  GameMap.bloccaMovimento();
  document.getElementById('pannello-menu').classList.remove('nascosto');
  mostraSezioneMenu(sezioneMenuAttiva);
}

function chiudiMenu() {
  // Rete di sicurezza: se stavo tenendo un Pokémon "in mano" nel Box e chiudo
  // il menu senza posarlo, torna da solo al suo slot originale (mai perso).
  if (boxMano) {
    const o = boxMano.origine;
    if (o.tipo === 'box') stato.boxes[o.box][o.slot] = boxMano.pkm;
    else stato.squadra.splice(o.idx, 0, boxMano.pkm);
    boxMano = null;
  }
  document.getElementById('pannello-menu').classList.add('nascosto');
  marketTiledForzato = null;   // esci dal market del venditore
  salvaPartita();
  aggiornaHUD();
  // PROBLEMA 3: se questo pannello era stato aperto da PauseMenuScene per
  // una sezione non ancora migrata (Zaino/Recap/Salva), non uscire del
  // tutto dal menu: torna alla lista nativa, come nei giochi originali
  // (B da una sotto-schermata torna al menu, non alla mappa).
  if (menuNativoInAttesa) {
    menuNativoInAttesa = false;
    if (typeof GameMap !== 'undefined' && GameMap.tornaAMenuNativo) { GameMap.tornaAMenuNativo(); return; }
  }
  if (!stato.incontroAttivo) GameMap.sbloccaMovimento();
}

// PROBLEMA 3: apre una sezione del pannello DOM esistente (Zaino/Recap/
// Salva, non ancora riscritte come Scene Phaser native) da dentro il nuovo
// menu Start nativo — vedi PauseMenuScene in map.js. Non tocca in alcun
// modo il modo "strumenti" (Market/Box, aperti da NPC/PC, invariati).
function apriSezioneMenuDaSceneNativa(sezione) {
  menuNativoInAttesa = true;
  apriMenu('pausa');
  mostraSezioneMenu(sezione);
}
window.apriSezioneMenuDaSceneNativa = apriSezioneMenuDaSceneNativa;

/* ============================================================
   TASTIERA stile Game Boy (QoL)
   - [A]        = conferma / interagisci / avanza i dialoghi / in battaglia
                  conferma la voce col cursore (vedi Battle.confermaCursore)
   - [B]        = indietro / annulla (chiude menu, avanza dialoghi, in
                  battaglia torna al menu precedente)
   - [Invio]    = Start: apre/chiude il menu
   - [Shift]    = Select (in attesa della Bicicletta, vedi premiSelect)
   - frecce ← → = scorrono le schede del menu (quando è aperto) / in
                  battaglia muovono il cursore fra i pulsanti (↑↓ pure)
   Il movimento sulla mappa resta con le frecce (gestito da map.js).
   Le stesse funzioni premiA/premiB/premiStart/premiSelect sono richiamate
   anche dai pulsanti a schermo [A]/[B]/Start/Select (solo mobile, vedi
   initControlliMobile) — un'unica logica, due modi di premerla.
   ============================================================ */
const nascostoEl = (id) => {
  const el = document.getElementById(id);
  return !el || el.classList.contains('nascosto');
};

function premiA() {
  if (stato.incontroAttivo) {
    if (typeof Battle !== 'undefined' && Battle.confermaCursore) Battle.confermaCursore();
    return;
  }
  const sceltaEl = document.getElementById('overlay-scelta');
  if (sceltaEl && sceltaEl.style.display === 'flex') { document.getElementById('scelta-btn1').click(); return; }
  if (!nascostoEl('overlay-dialogo')) { document.getElementById('dialogo-avanti').click(); return; }
  if (!nascostoEl('pannello-menu')) return;   // si naviga col mouse/tocco diretto
  // Scena nativa aperta (Squadra/Zaino/Box/Market/Pausa/Scheda…): [A] a
  // schermo manda "keydown-ENTER" DIRETTAMENTE al KeyboardPlugin della
  // scena (GameMap.emitTastoSceneNative) — non un KeyboardEvent sintetico
  // nel DOM: su alcuni browser mobile forzare il keyCode via defineProperty
  // non è affidabile per tutti i tasti (bug reale: [B] funzionava così,
  // Invio no — risolto passando a questo meccanismo per entrambi).
  if (typeof GameMap !== 'undefined' && GameMap.menuNativoAttivo && GameMap.menuNativoAttivo()) {
    if (GameMap.emitTastoSceneNative) GameMap.emitTastoSceneNative('keydown-ENTER');
    return;
  }
  if (typeof GameMap !== 'undefined' && GameMap.interagisciVicino) GameMap.interagisciVicino();
}

function premiB() {
  if (stato.incontroAttivo) {
    if (typeof Battle !== 'undefined' && Battle.indietroCursore) Battle.indietroCursore();
    return;
  }
  const sceltaEl = document.getElementById('overlay-scelta');
  if (sceltaEl && sceltaEl.style.display === 'flex') { document.getElementById('scelta-btn2').click(); return; }
  if (!nascostoEl('overlay-dialogo')) { document.getElementById('dialogo-avanti').click(); return; }
  if (!nascostoEl('pannello-menu')) { chiudiMenu(); return; }
  // Scena nativa aperta: [B] a schermo = "keydown-B" diretto (indietro/
  // annulla, stesso meccanismo di premiA sopra).
  if (typeof GameMap !== 'undefined' && GameMap.menuNativoAttivo && GameMap.menuNativoAttivo()) {
    if (GameMap.emitTastoSceneNative) GameMap.emitTastoSceneNative('keydown-B');
    return;
  }
}

function premiStart() {
  if (stato.incontroAttivo) return;
  if (!nascostoEl('overlay-dialogo')) return;
  const sceltaEl = document.getElementById('overlay-scelta');
  if (sceltaEl && sceltaEl.style.display === 'flex') return;
  if (!nascostoEl('pannello-menu')) { chiudiMenu(); return; }
  if (typeof GameMap !== 'undefined' && GameMap.menuNativoAttivo && GameMap.menuNativoAttivo()) return;
  if (typeof GameMap !== 'undefined' && GameMap.apriMenuNativo) GameMap.apriMenuNativo();
}

// Select: riservato alla Bicicletta (si otterrà più avanti in partita).
// Per ora solo il collegamento del tasto, come richiesto esplicitamente:
// nessuna meccanica reale finché la Bicicletta non è ottenibile in gioco.
function premiSelect() {
  if (stato.incontroAttivo || !nascostoEl('overlay-dialogo') || !nascostoEl('pannello-menu')) return;
  if (typeof GameMap !== 'undefined' && GameMap.menuNativoAttivo && GameMap.menuNativoAttivo()) return;
  if (typeof mostraToast === 'function') mostraToast('🚲 Non hai ancora la Bicicletta.');
}

function initTastiera() {
  window.addEventListener('keydown', (e) => {
    // non interferire mentre si scrive in un campo di testo
    const t = e.target;
    if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;

    const k = e.key.toLowerCase();

    // In battaglia le frecce muovono il cursore fra i pulsanti (menu 2x2,
    // liste mosse/zaino/squadra…), A/Invio/Spazio confermano, B torna indietro.
    if (stato.incontroAttivo) {
      const dir = { arrowup: [0, -1], arrowdown: [0, 1], arrowleft: [-1, 0], arrowright: [1, 0] }[k];
      if (dir) { e.preventDefault(); if (typeof Battle !== 'undefined' && Battle.spostaCursore) Battle.spostaCursore(dir[0], dir[1]); return; }
      if (k === 'a' || k === 'enter' || k === ' ') { e.preventDefault(); premiA(); return; }
      if (k === 'b') { e.preventDefault(); premiB(); return; }
      return;
    }

    const isA     = (k === 'a');
    const isB     = (k === 'b');
    const isStart = (k === 'enter');
    const isSelect = (k === 'shift' && !e.repeat);
    const isFreccia = (k === 'arrowleft' || k === 'arrowright');
    if (!isA && !isB && !isStart && !isSelect && !isFreccia) return;

    if (isA) { e.preventDefault(); premiA(); return; }
    if (isB) { e.preventDefault(); premiB(); return; }
    if (isSelect) { e.preventDefault(); premiSelect(); return; }

    // Frecce ← →: cambiano scheda solo col menu di pausa aperto (invariato)
    if (isFreccia) {
      if (!nascostoEl('pannello-menu') && menuModalita === 'pausa') {
        e.preventDefault();
        const schede = SCHEDE_PER_MODALITA[menuModalita];
        let i = schede.indexOf(sezioneMenuAttiva);
        if (i < 0) i = 0;
        i = (i + (k === 'arrowright' ? 1 : schede.length - 1)) % schede.length;
        mostraSezioneMenu(schede[i]);
      }
      return;
    }

    if (isStart) { e.preventDefault(); premiStart(); }
  });
}

function mostraSezioneMenu(sezione) {
  sezioneMenuAttiva = sezione;
  document.querySelectorAll('#menu-tabs .tab').forEach(t =>
    t.classList.toggle('attiva', t.dataset.sezione === sezione));
  const contenuto = document.getElementById('menu-contenuto');
  contenuto.innerHTML = '';
  contenuto.classList.toggle('market-skin', sezione === 'market'); // reskin visivo (Fase 5)
  if (sezione === 'squadra')      renderSquadra(contenuto);
  else if (sezione === 'zaino')   renderZaino(contenuto);
  else if (sezione === 'market')  renderMarket(contenuto);
  else if (sezione === 'box')     renderBox(contenuto);
  else if (sezione === 'recap')   renderRecap(contenuto);
  else                            renderSalva(contenuto);
}

// ── Box PC: helper per lavorare sui 24 box × 30 slot ─────────
function tuttiIBoxFlat() {
  return stato.boxes.flat().filter(p => p);
}

function contaBox() {
  return tuttiIBoxFlat().length;
}

// Deposita un Pokémon nel primo slot libero (primo box con posto).
// Restituisce { box, slot } oppure null se anche i 24 box sono pieni (720
// slot in totale — nella pratica non dovrebbe mai succedere).
function depositaInBox(pkm) {
  for (let b = 0; b < stato.boxes.length; b++) {
    for (let s = 0; s < stato.boxes[b].length; s++) {
      if (!stato.boxes[b][s]) {
        stato.boxes[b][s] = pkm;
        return { box: b, slot: s };
      }
    }
  }
  return null;
}

// Eccezioni ai nomi PBS "normalizzati" (nome inglese senza spazi/trattini,
// tutto maiuscolo) per le icone: pochi Pokémon in Essentials FRLG hanno un
// file con un suffisso diverso dallo schema standard.
const ICONA_POKEMON_OVERRIDE = { 'Nidoran-f': 'NIDORANfE', 'Nidoran-m': 'NIDORANmA' };

// Nome del file icona (senza estensione) dentro sprites/pokemon_icons/ per
// un Pokémon dato il suo `ist.nome` (es. "Pikachu", "Mr-mime", "Ho-oh").
function chiaveIconaPokemon(nomeIst) {
  if (ICONA_POKEMON_OVERRIDE[nomeIst]) return ICONA_POKEMON_OVERRIDE[nomeIst];
  return (nomeIst || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

// Soglie allineate a Essentials FRLG (25%/50%, non più 20%) — vedi anche
// aggiornaBarraHp in battle.js. La barra usa la vera immagine a 3 fasce
// colore di Essentials (sprites/ui_party/hp.png) invece di un colore piatto.
function miniBarraHp(pkm) {
  const pct = Math.max(0, Math.min(100, pkm.hpAttuale / pkm.hpMax * 100));
  const classe = pct <= 25 ? 'rossa' : (pct <= 50 ? 'gialla' : '');
  return `<div class="mini-hp"><div class="mini-hp-barra ${classe}" style="width:${pct}%"></div></div>`;
}

function badgeTipi(pkm) {
  return pkm.tipi.map(t =>
    `<span class="tipo-badge" style="background:${TIPO_COLORI[t] || '#888'}">${TIPO_NOMI[t] || t}</span>`
  ).join(' ');
}

// ── Sezione SQUADRA ──────────────────────────────────────────

// Griglia della schermata Squadra di Essentials FRLG (Graphics/UI/Party/bg.png,
// UI_Party.rb): il primo Pokémon ha il pannello arrotondato più grande in alto
// a sinistra, gli altri 5 in griglia 2 colonne con un offset verticale di 16px
// (native) sulla colonna destra. Sfondo vero + posizioni esatte al posto
// della lista verticale semplice di prima.
function renderSquadra(contenuto) {
  if (stato.squadra.length === 0) {
    contenuto.innerHTML = '<p class="menu-vuoto">Non hai ancora nessun Pokémon.</p>';
    return;
  }
  const griglia = document.createElement('div');
  griglia.className = 'squadra-griglia';
  stato.squadra.forEach((pkm, idx) => {
    const card = document.createElement('div');
    card.className = 'card-pokemon' + (idx === 0 ? ' card-pokemon-attiva' : '');
    if (pkm.uovo) {
      card.innerHTML =
        `<img src="${pkm.sprite.fronte || ''}" alt="Uovo">` +
        `<div class="card-info">` +
          `<div class="card-riga1"><b>Uovo misterioso</b></div>` +
          `<small>🥚 Ancora ${pkm.passiRimanenti} passi alla schiusa…</small>` +
        `</div>`;
    } else {
      card.innerHTML =
        `<img src="${pkm.sprite.fronte || ''}" alt="${pkm.nome}">` +
        `<div class="card-info">` +
          `<div class="card-riga1"><b>${pkm.nome}</b> <span>Lv.${pkm.livello}</span></div>` +
          `<div class="card-tipi">${badgeTipi(pkm)}</div>` +
          `${miniBarraHp(pkm)}` +
          `<div class="card-hp-testo">${pkm.hpAttuale}/${pkm.hpMax} HP${pkm.hpAttuale <= 0 ? ' · KO' : ''}</div>` +
        `</div>`;
    }
    card.addEventListener('click', () => renderDettagli({ tipo: 'squadra', idx }));
    griglia.appendChild(card);
  });
  contenuto.appendChild(griglia);
  const nota = document.createElement('p');
  nota.className = 'menu-nota';
  nota.textContent = 'Tocca un Pokémon per i dettagli. Il primo della lista scende in campo per primo.';
  contenuto.appendChild(nota);
}

// ── Dettagli di un singolo Pokémon ───────────────────────────

// Legge il Pokémon indicato da una "fonte": { tipo:'squadra', idx }
// oppure { tipo:'box', box, slot }.
function pkmDaFonte(fonte) {
  return fonte.tipo === 'box' ? stato.boxes[fonte.box][fonte.slot] : stato.squadra[fonte.idx];
}

function renderDettagli(fonte) {
  const contenuto = document.getElementById('menu-contenuto');
  const pkm = pkmDaFonte(fonte);
  const daSquadra = fonte.tipo !== 'box';
  const idx = daSquadra ? fonte.idx : fonte.slot;
  if (!pkm) { mostraSezioneMenu(daSquadra ? 'squadra' : 'box'); return; }

  if (pkm.uovo) {
    contenuto.innerHTML =
      `<div class="dettagli-testata">` +
        `<img src="${pkm.sprite.fronte || ''}" alt="Uovo">` +
        `<div><h3>Uovo misterioso</h3>` +
        `<div>🥚 Ancora ${pkm.passiRimanenti} passi camminando insieme prima che si schiuda.</div></div>` +
      `</div>` +
      `<div class="dettagli-bottoni">` +
        (!daSquadra
          ? `<button id="btn-sposta-squadra" ${stato.squadra.length >= 6 ? 'disabled' : ''}>⬆ Sposta in squadra</button>`
          : '') +
        `<button id="btn-torna-squadra">↩ Indietro</button>` +
      `</div>`;
    // Il deposito nel Box si fa SOLO dal PC del Centro Pokémon (schermata
    // Box vera, con lo "sgabuzzino" squadra/box), mai dalla scheda Squadra
    // del menu Start — richiesta esplicita utente, come nei giochi veri.
    if (!daSquadra) {
      document.getElementById('btn-sposta-squadra').addEventListener('click', () => {
        if (stato.squadra.length >= 6) return;
        stato.squadra.push(pkm);
        stato.boxes[fonte.box][fonte.slot] = null;
        salvaPartita();
        mostraToast('⚡ L\'uovo è entrato in squadra!');
        mostraSezioneMenu('box');
      });
    }
    document.getElementById('btn-torna-squadra').addEventListener('click', () =>
      mostraSezioneMenu(daSquadra ? 'squadra' : 'box'));
    return;
  }

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
    `<div class="dettagli-testata" style="margin-top:6px;">` +
      (pkm.oggetto && OGGETTI[pkm.oggetto]
        ? `<div>🎒 Tiene: <b>${OGGETTI[pkm.oggetto].icona} ${OGGETTI[pkm.oggetto].nome}</b></div>`
        : `<div>🎒 Non tiene nessun oggetto</div>`) +
    `</div>` +
    `<h4>Mosse</h4><ul class="dettagli-mosse">${mosseHtml}</ul>` +
    `<div class="dettagli-bottoni">` +
      (daSquadra ? `<button id="btn-sposta-su" ${idx === 0 ? 'disabled' : ''}>⬆ Sposta su</button>` : '') +
      (!daSquadra
        ? `<button id="btn-sposta-squadra" ${stato.squadra.length >= 6 ? 'disabled' : ''}>⬆ Sposta in squadra</button>`
        : '') +
      (pkm.oggetto ? `<button id="btn-togli-oggetto">🎒 Togli oggetto</button>` : '') +
      (daSquadra && MODALITA_TEST ? `<button id="btn-caramella">🍬 Caramella Rara (×${stato.zaino.caramellarara || 0})</button>` : '') +
      (!daSquadra ? `<button id="btn-rilascia" class="pericolo">🗑 Rilascia</button>` : '') +
      `<button id="btn-torna-squadra">↩ Indietro</button>` +
    `</div>`;

  if (pkm.oggetto) {
    document.getElementById('btn-togli-oggetto').addEventListener('click', () => {
      const nome = OGGETTI[pkm.oggetto].nome;
      stato.zaino[pkm.oggetto] = (stato.zaino[pkm.oggetto] || 0) + 1;
      pkm.oggetto = null;
      salvaPartita();
      mostraToast(`🎒 ${nome} torna nello zaino.`);
      renderDettagli(fonte);
    });
  }

  if (daSquadra && MODALITA_TEST) {
    document.getElementById('btn-caramella').addEventListener('click', async () => {
      if ((stato.zaino.caramellarara || 0) <= 0) return;
      const risultato = await Battle.caramellaRara(pkm, stato.levelCap);
      if (risultato.ok) stato.zaino.caramellarara -= 1;
      salvaPartita();
      aggiornaHUD();
      mostraToast(risultato.messaggi.join(' '), 4000);
      renderDettagli(fonte);
    });
  }

  if (daSquadra) {
    document.getElementById('btn-sposta-su').addEventListener('click', () => {
      [stato.squadra[idx - 1], stato.squadra[idx]] = [stato.squadra[idx], stato.squadra[idx - 1]];
      salvaPartita();
      renderDettagli({ tipo: 'squadra', idx: idx - 1 });
    });
  } else {
    document.getElementById('btn-sposta-squadra').addEventListener('click', () => {
      if (stato.squadra.length >= 6) return;
      stato.squadra.push(pkm);
      stato.boxes[fonte.box][fonte.slot] = null;
      salvaPartita();
      mostraToast(`⚡ ${pkm.nome} è entrato in squadra!`);
      mostraSezioneMenu('box');
    });

    document.getElementById('btn-rilascia').addEventListener('click', () => {
      const sicuro = confirm(`Vuoi davvero rilasciare ${pkm.nome}? Non potrai più recuperarlo.`);
      if (!sicuro) return;
      stato.boxes[fonte.box][fonte.slot] = null;
      salvaPartita();
      mostraToast(`👋 ${pkm.nome} è stato liberato.`);
      mostraSezioneMenu('box');
    });
  }

  document.getElementById('btn-torna-squadra').addEventListener('click', () =>
    mostraSezioneMenu(daSquadra ? 'squadra' : 'box'));
}

// ── Sezione ZAINO — 3 tasche ─────────────────────────────────
// Tasca 1: cura/boost + vendibili + pietre evolutive + oggetti da tenere.
// Tasca 2: oggetti chiave/storia + contenitore MT/MN.
// Tasca 3: Poké Ball.

let zainoTascaAttiva = 1;
let zainoMtAperto = false;   // dentro la tasca 2: contenitore MT/MN aperto?
let zainoMtEspansa = null;   // chiave della MT di cui sto mostrando i dettagli mossa

function categoriaInTasca3(categoria) { return categoria === 'ball'; }
function categoriaInTasca2(categoria) { return categoria === 'mt'; }

// Icona di un oggetto: usa la grafica vera (oggetto.img, in
// CARTELLA_ICONE_OGGETTI) quando disponibile, altrimenti l'emoji di
// ripiego (oggetto.icona) — usata nella lista principale dello zaino.
function iconaOggettoHtml(oggetto) {
  if (oggetto.img) {
    return `<img class="oggetto-icona-img" src="${CARTELLA_ICONE_OGGETTI}${oggetto.img}" alt="" width="32" height="32">`;
  }
  return oggetto.icona || '';
}

// Costruisce la card di un oggetto dello zaino (icona, nome, quantità,
// descrizione, bottone "Usa" se applicabile). Riusata dalle tasche 1 e 3.
function creaCardOggetto(chiave, oggetto, quanti) {
  const suBersaglio = oggetto.categoria === 'cura' || oggetto.categoria === 'revive' || oggetto.categoria === 'test' || oggetto.categoria === 'curastato' || oggetto.categoria === 'pietra' || oggetto.categoria === 'mt' || oggetto.categoria === 'held' || oggetto.categoria === 'curatotale' || oggetto.categoria === 'pp' || oggetto.categoria === 'raracandy';
  const direttamente = oggetto.categoria === 'repellente';
  const usabile = suBersaglio || direttamente;

  const riga = document.createElement('div');
  riga.className = 'card-oggetto';
  riga.innerHTML =
    `<span class="oggetto-icona">${iconaOggettoHtml(oggetto)}</span>` +
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
  return riga;
}

// Schermata Zaino vera di Essentials FRLG (Graphics/UI/Bag/bg_N.png come
// sfondo intero + bag_N.png come icona zaino a (30,20) nativi — coordinate
// lette da UI_Bag.rb, pbRefresh/initialize). Il pannello bianco dell'elenco
// oggetti è nell'immagine stessa (misurato sui pixel: x 190-489, y 8-281 su
// 512x384) — la lista vera viene posizionata sopra a quelle coordinate.
const ZAINO_TEMA = {
  1: { bg: 'bg_oggetti.png', icona: 'bag_1.png' },
  2: { bg: 'bg_chiave.png',  icona: 'bag_3.png' },
  3: { bg: 'bg_ball.png',    icona: 'bag_2.png' },
};

function renderZaino(contenuto) {
  contenuto.innerHTML = '';
  const tema = ZAINO_TEMA[zainoTascaAttiva];

  const schermo = document.createElement('div');
  schermo.className = 'zaino-schermo';
  schermo.style.backgroundImage = `url('sprites/ui_bag/${tema.bg}')`;
  contenuto.appendChild(schermo);

  const icona = document.createElement('img');
  icona.className = 'zaino-icona';
  icona.src = 'sprites/ui_bag/' + tema.icona;
  icona.alt = '';
  schermo.appendChild(icona);

  const tasche = document.createElement('div');
  tasche.className = 'zaino-tasche';
  [
    { id: 1, etichetta: '🎒 Oggetti' },
    { id: 2, etichetta: '🗝️ Chiave' },
    { id: 3, etichetta: '🔴 Ball' },
  ].forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'tasca-tab' + (zainoTascaAttiva === t.id ? ' attiva' : '');
    btn.textContent = t.etichetta;
    btn.addEventListener('click', () => {
      zainoTascaAttiva = t.id;
      zainoMtAperto = false;
      zainoMtEspansa = null;
      mostraSezioneMenu('zaino');
    });
    tasche.appendChild(btn);
  });
  schermo.appendChild(tasche);

  const corpo = document.createElement('div');
  corpo.className = 'zaino-corpo';
  schermo.appendChild(corpo);

  if (zainoTascaAttiva === 1) renderZainoTascaOggetti(corpo);
  else if (zainoTascaAttiva === 3) renderZainoTascaBall(corpo);
  else renderZainoTascaChiave(corpo);
}

// Tasca 1: tutto tranne MT (tasca 2) e Ball (tasca 3)
function renderZainoTascaOggetti(corpo) {
  let almenoUno = false;
  for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
    if (oggetto.categoria === 'test' && !MODALITA_TEST) continue;
    if (categoriaInTasca2(oggetto.categoria) || categoriaInTasca3(oggetto.categoria)) continue;
    const quanti = stato.zaino[chiave] || 0;
    if (quanti <= 0) continue;
    almenoUno = true;
    corpo.appendChild(creaCardOggetto(chiave, oggetto, quanti));
  }
  if (!almenoUno) {
    corpo.innerHTML = '<p class="menu-vuoto">Nessun oggetto. Compra al 🛒 Poké Market di un comune.</p>';
  } else {
    const nota = document.createElement('p');
    nota.className = 'menu-nota';
    nota.textContent = 'Pozioni/Revitalizzanti/Antidoti/Pietre: premi "Usa" e scegli il Pokémon. Il Repellente si attiva subito.';
    corpo.appendChild(nota);
  }
}

// Tasca 3: solo Poké Ball (si usano solo in battaglia, nessun bottone "Usa")
function renderZainoTascaBall(corpo) {
  let almenoUno = false;
  for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
    if (!categoriaInTasca3(oggetto.categoria)) continue;
    const quanti = stato.zaino[chiave] || 0;
    if (quanti <= 0) continue;
    almenoUno = true;
    corpo.appendChild(creaCardOggetto(chiave, oggetto, quanti));
  }
  if (!almenoUno) {
    corpo.innerHTML = '<p class="menu-vuoto">Non hai nessuna Ball. Comprale al 🛒 Poké Market.</p>';
  } else {
    const nota = document.createElement('p');
    nota.className = 'menu-nota';
    nota.textContent = 'Le Ball si usano solo in battaglia, dal menu Zaino della schermata di lotta.';
    corpo.appendChild(nota);
  }
}

// Tasca 2: oggetti chiave/storia + contenitore MT/MN
function renderZainoTascaChiave(corpo) {
  // Contenitore MT/MN: conta quante MT/MN diverse possiede il giocatore
  const mtPossedute = Object.entries(OGGETTI).filter(
    ([chiave, o]) => categoriaInTasca2(o.categoria) && (stato.zaino[chiave] || 0) > 0
  );

  const contenitore = document.createElement('div');
  contenitore.className = 'card-oggetto card-contenitore-mt';
  contenitore.innerHTML =
    `<span class="oggetto-icona">📀</span>` +
    `<div class="card-info">` +
      `<div class="card-riga1"><b>MT/MN</b> <span>×${mtPossedute.length}</span></div>` +
      `<small>Contiene tutte le Macchine Tecniche/Nascoste che possiedi. Tocca per aprire.</small>` +
    `</div>` +
    `<button class="btn-preleva">${zainoMtAperto ? '▲' : '▼'}</button>`;
  contenitore.querySelector('.btn-preleva').addEventListener('click', () => {
    zainoMtAperto = !zainoMtAperto;
    zainoMtEspansa = null;
    mostraSezioneMenu('zaino');
  });
  corpo.appendChild(contenitore);

  if (zainoMtAperto) {
    const elenco = document.createElement('div');
    elenco.className = 'elenco-mt';
    if (mtPossedute.length === 0) {
      elenco.innerHTML = '<p class="menu-vuoto">Non possiedi ancora nessuna MT/MN.</p>';
    } else {
      for (const [chiave, oggetto] of mtPossedute) {
        elenco.appendChild(creaCardMt(chiave, oggetto, stato.zaino[chiave]));
      }
    }
    corpo.appendChild(elenco);
  }

  // Oggetti chiave/storia sciolti (bicicletta, canna da pesca, oggetti trama…)
  if (typeof OGGETTI_CHIAVE !== 'undefined' && stato.inventario && stato.inventario.chiave) {
    const chiavi = Object.entries(stato.inventario.chiave).filter(([, v]) => v);
    if (chiavi.length > 0) {
      const titolo = document.createElement('p');
      titolo.className = 'menu-nota';
      titolo.style.marginTop = '12px';
      titolo.style.fontWeight = 'bold';
      titolo.textContent = '🔑 Oggetti chiave';
      corpo.appendChild(titolo);
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
        corpo.appendChild(riga);
      }
    }
  }
}

// Card di una singola MT/MN dentro il contenitore: bottone "ℹ️" per i
// dettagli mossa (nome inglese, tipo, categoria, potenza, precisione, PP,
// effetto) e bottone "Insegna" che porta al flusso esistente di scelta del
// Pokémon bersaglio (usaOggettoSu, invariato).
function creaCardMt(chiave, oggetto, quanti) {
  const wrapper = document.createElement('div');

  const riga = document.createElement('div');
  riga.className = 'card-oggetto';
  riga.innerHTML =
    `<span class="oggetto-icona">${oggetto.icona}</span>` +
    `<div class="card-info">` +
      `<div class="card-riga1"><b>${oggetto.nome}</b> <span>×${quanti}</span></div>` +
      `<small>${oggetto.descrizione}</small>` +
    `</div>` +
    `<button class="btn-info-mossa">${zainoMtEspansa === chiave ? 'ℹ️ ▲' : 'ℹ️'}</button>` +
    `<button class="btn-preleva" ${stato.squadra.length === 0 ? 'disabled' : ''}>Insegna</button>`;

  riga.querySelector('.btn-info-mossa').addEventListener('click', () => {
    zainoMtEspansa = (zainoMtEspansa === chiave) ? null : chiave;
    mostraSezioneMenu('zaino');
  });
  riga.querySelector('.btn-preleva').addEventListener('click', () => renderScegliBersaglio(chiave));
  wrapper.appendChild(riga);

  if (zainoMtEspansa === chiave) {
    const dettaglio = document.createElement('div');
    dettaglio.className = 'mossa-dettaglio';
    dettaglio.textContent = 'Caricamento…';
    wrapper.appendChild(dettaglio);
    PokeAPI.getMossa(oggetto.mossa).then(d => {
      dettaglio.innerHTML =
        `<div class="riga-nome-mossa"><b>${d.nomeIt}</b> <span class="mossa-nome-en">${d.nomeEn}</span></div>` +
        `<div>${badgeTipoSingolo(d.tipo)} <span class="tipo-badge" style="background:#555">${classeMossaIt(d.classe)}</span></div>` +
        `<div class="mossa-stat-riga">Potenza: <b>${d.potenza ?? '—'}</b> · Precisione: <b>${d.precisione != null ? d.precisione : '—'}</b> · PP: <b>${d.ppMax}</b></div>` +
        `<div class="mossa-effetto">${descriviEffettoMossa(d)}</div>`;
    }).catch(() => {
      dettaglio.textContent = 'Errore di connessione: riprova più tardi.';
    });
  }

  return wrapper;
}

function badgeTipoSingolo(tipo) {
  return `<span class="tipo-badge" style="background:${TIPO_COLORI[tipo] || '#888'}">${TIPO_NOMI[tipo] || tipo}</span>`;
}

function classeMossaIt(classe) {
  return { physical: 'Fisico', special: 'Speciale', status: 'Stato' }[classe] || classe;
}

// Traduce i campi "grezzi" di PokeAPI.getMossa in una frase italiana breve
// (usato per il popup dettagli nel contenitore MT/MN dello zaino).
function descriviEffettoMossa(d) {
  const frasi = [];
  if (d.priorita > 0) frasi.push('Va sempre per primo (priorità).');
  else if (d.priorita < 0) frasi.push('Agisce sempre per ultimo (priorità negativa).');

  if (d.statoEffetto) {
    const nomiStato = { paralysis: 'paralizzare', poison: 'avvelenare', burn: 'scottare', sleep: 'addormentare', freeze: 'congelare', confusion: 'confondere' };
    const verbo = nomiStato[d.statoEffetto] || d.statoEffetto;
    frasi.push(`Può ${verbo} il bersaglio${d.statoProbabilita ? ` (${d.statoProbabilita}%)` : ''}.`);
  }

  if (d.cambiStat && d.cambiStat.length) {
    const nomiStat = { attack: 'Attacco', defense: 'Difesa', 'special-attack': 'Att. Speciale', 'special-defense': 'Dif. Speciale', speed: 'Velocità', accuracy: 'Precisione', evasion: 'Elusione' };
    const versoSe = (d.bersaglio === 'user' || d.bersaglio === 'users-field');
    d.cambiStat.forEach(c => {
      const verbo = c.modifica > 0 ? 'Aumenta' : 'Riduce';
      const stadi = Math.abs(c.modifica);
      frasi.push(`${verbo} ${nomiStat[c.stat] || c.stat} ${versoSe ? "dell'utilizzatore" : 'del bersaglio'} di ${stadi} stad${stadi === 1 ? 'io' : 'i'}${d.cambiStatProbabilita ? ` (${d.cambiStatProbabilita}%)` : ''}.`);
    });
  }

  if (frasi.length === 0) frasi.push('Nessun effetto secondario.');
  return frasi.join(' ');
}

// Attiva il repellente: niente incontri per N passi
function usaRepellente(chiave) {
  const oggetto = OGGETTI[chiave];
  if ((stato.zaino[chiave] || 0) <= 0) return;
  stato.zaino[chiave] -= 1;
  stato.repellentePassi = oggetto.passi || 100;
  salvaPartita();
  mostraToast(`🚷 Repellente attivato: niente incontri per ${stato.repellentePassi} passi.`);
  aggiornaBottoneRepellente();
  // Aggiorna la lista zaino solo se il menu è aperto (non aprirlo da solo)
  const menu = document.getElementById('pannello-menu');
  if (menu && !menu.classList.contains('nascosto')) mostraSezioneMenu('zaino');
}

// QoL — Bottone repellente rapido: chiavi repellente possedute nello zaino
function repellentiInZaino() {
  if (!stato.zaino) return [];
  return Object.keys(stato.zaino).filter(k =>
    (stato.zaino[k] || 0) > 0 && OGGETTI[k] && OGGETTI[k].categoria === 'repellente');
}

// Mostra/nasconde e aggiorna l'etichetta del bottone repellente
function aggiornaBottoneRepellente() {
  const btn = document.getElementById('btn-repellente');
  if (!btn) return;
  const chiavi = repellentiInZaino();
  const tot = chiavi.reduce((s, k) => s + (stato.zaino[k] || 0), 0);
  if (tot > 0 && !stato.incontroAttivo) {
    const attivo = (stato.repellentePassi > 0) ? ` · ${stato.repellentePassi}` : '';
    btn.textContent = `🚷 Repellente (${tot})${attivo}`;
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}

// Usa il repellente direttamente dalla mappa, senza aprire lo zaino
function usaRepellenteRapido() {
  if (stato.incontroAttivo || dialogoInCorso) return;
  const chiavi = repellentiInZaino();
  if (chiavi.length === 0) return;
  usaRepellente(chiavi[0]);
}

function renderScegliBersaglio(chiaveOggetto) {
  const contenuto = document.getElementById('menu-contenuto');
  const oggetto = OGGETTI[chiaveOggetto];
  const quanti = stato.zaino[chiaveOggetto] || 0;

  contenuto.innerHTML =
    `<p class="menu-nota">${oggetto.icona} <b>${oggetto.nome}</b> (×${quanti} rimaste) — su quale Pokémon?</p>`;

  stato.squadra.forEach((pkm, idx) => {
    if (pkm.uovo) return; // un uovo non può ricevere oggetti
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
      mostraToast(`${pkm.nome} non è esausto: il ${oggetto.nome} serve sui KO.`);
      return;
    }
    pkm.hpAttuale = oggetto.max ? pkm.hpMax : Math.floor(pkm.hpMax / 2);
    stato.zaino[chiave] -= 1;
    mostraToast(`💊 ${pkm.nome} si è ripreso! (${pkm.hpAttuale}/${pkm.hpMax} HP)`);
  } else if (oggetto.categoria === 'curatotale') {
    if (pkm.hpAttuale <= 0) {
      mostraToast(`${pkm.nome} è KO: serve un Revitalizzante, non la Cura Totale.`);
      return;
    }
    const guaritoStato = !!pkm.condizione;
    const curaHp = pkm.hpMax - pkm.hpAttuale;
    pkm.hpAttuale = pkm.hpMax;
    pkm.condizione = null;
    stato.zaino[chiave] -= 1;
    if (curaHp > 0 && guaritoStato) mostraToast(`✨ ${pkm.nome} recupera tutti gli HP e guarisce!`);
    else if (curaHp > 0) mostraToast(`✨ ${pkm.nome} recupera tutti gli HP!`);
    else if (guaritoStato) mostraToast(`✨ ${pkm.nome} guarisce dallo stato alterato!`);
    else { mostraToast(`${pkm.nome} è già al massimo!`); stato.zaino[chiave] += 1; return; }
  } else if (oggetto.categoria === 'pp') {
    // Versione semplificata: ripristina i PP di TUTTE le mosse insieme
    // (nei giochi originali l'Etere ne cura una sola per volta — qui non
    // c'è ancora un selettore di mossa nello zaino).
    const scariche = (pkm.mosse || []).filter(m => m.pp < m.ppMax);
    if (scariche.length === 0) {
      mostraToast(`Le mosse di ${pkm.nome} hanno già tutti i PP!`);
      return;
    }
    for (const m of pkm.mosse) m.pp = m.ppMax;
    stato.zaino[chiave] -= 1;
    mostraToast(`${oggetto.icona} ${pkm.nome} recupera i PP di tutte le mosse!`);
  } else if (oggetto.categoria === 'raracandy') {
    const risultato = await Battle.caramellaRara(pkm, stato.levelCap);
    if (risultato.ok) stato.zaino[chiave] -= 1;
    mostraToast(risultato.messaggi.join(' '), 4000);
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
  } else if (oggetto.categoria === 'pietra') {
    const evo = trovaEvoluzionePietra(pkm.id, chiave);
    if (!evo) {
      mostraToast(`La ${oggetto.nome} non ha effetto su ${pkm.nome}.`);
      return;
    }
    stato.zaino[chiave] -= 1;
    if ((stato.zaino[chiave] || 0) <= 0) delete stato.zaino[chiave];
    chiudiMenu();                       // chiude il menu per mostrare l'evoluzione
    await avviaEvoluzione(pkm, evo.idEvo);
    return;
  } else if (oggetto.categoria === 'mt') {
    // Compatibilità: non tutti i Pokémon imparano tutte le mosse tramite MT
    // (vedi dati/mt_compatibilita.js, generato da Essentials FRLG/PBS). Se il
    // dato di compatibilità manca per qualche motivo (file non caricato), si
    // lascia passare per non rompere il flusso — meglio permissivo che bloccato.
    if (typeof MT_COMPATIBILITA !== 'undefined') {
      const compatibili = MT_COMPATIBILITA[pkm.id];
      if (compatibili && !compatibili.includes(oggetto.mossa)) {
        mostraToast(`${pkm.nome} non può imparare questa mossa.`);
        return;
      }
    }
    let dettagli;
    try {
      dettagli = await PokeAPI.getMossa(oggetto.mossa);
    } catch (e) {
      mostraToast('Errore di connessione: riprova più tardi.');
      return;
    }
    if (pkm.mosse.some(m => m.nome === dettagli.nome)) {
      mostraToast(`${pkm.nome} conosce già ${dettagli.nomeIt}!`);
      return;
    }
    if (pkm.mosse.length < 4) {
      pkm.mosse.push({ ...dettagli, pp: dettagli.ppMax });
      stato.zaino[chiave] -= 1;
      if ((stato.zaino[chiave] || 0) <= 0) delete stato.zaino[chiave];
      mostraToast(`💿 ${pkm.nome} ha imparato ${dettagli.nomeIt}!`);
    } else {
      const opzioni = pkm.mosse.map(m => m.nomeIt || m.nome);
      const scelta = await mostraSceltaLista(
        `${pkm.nome} conosce già 4 mosse. Quale dimenticare per imparare ${dettagli.nomeIt}?`,
        opzioni
      );
      if (scelta < 0) { renderScegliBersaglio(chiave); return; }   // annullato, l'MT non si consuma
      pkm.mosse[scelta] = { ...dettagli, pp: dettagli.ppMax };
      stato.zaino[chiave] -= 1;
      if ((stato.zaino[chiave] || 0) <= 0) delete stato.zaino[chiave];
      mostraToast(`💿 ${pkm.nome} ha dimenticato una mossa e ha imparato ${dettagli.nomeIt}!`);
    }
  } else if (oggetto.categoria === 'held') {
    if (pkm.oggetto === chiave) {
      mostraToast(`${pkm.nome} sta già tenendo ${oggetto.nome}.`);
      return;
    }
    stato.zaino[chiave] -= 1;
    if ((stato.zaino[chiave] || 0) <= 0) delete stato.zaino[chiave];
    if (pkm.oggetto) {
      // Il vecchio oggetto torna nello zaino: un Pokémon ne tiene solo uno
      stato.zaino[pkm.oggetto] = (stato.zaino[pkm.oggetto] || 0) + 1;
      mostraToast(`${pkm.nome} lascia ${OGGETTI[pkm.oggetto].nome} e prende ${oggetto.icona} ${oggetto.nome}.`);
    } else {
      mostraToast(`${oggetto.icona} ${pkm.nome} ora tiene ${oggetto.nome}.`);
    }
    pkm.oggetto = chiave;
  }

  salvaPartita();
  aggiornaHUD();
  renderScegliBersaglio(chiave);
}

// ── Sezione BOX — 24 box da 30 slot (griglia 6×5) ───────────
// Interazione stile Essentials: tocca uno slot pieno senza nulla "in mano"
// per prenderlo; tocca uno slot (pieno o vuoto) mentre tieni qualcosa in
// mano per posarlo/scambiarlo. La striscia "⚡ Squadra" in basso permette
// di scambiare direttamente col box senza passare dalla scheda Squadra.

let boxIndiceAttivo = 0;
let boxMano = null; // { origine: {tipo:'squadra'} | {tipo:'box',box,slot}, pkm }

// I 24 numeri degli sfondi box_N.png usati (uno per pagina): 3 al posto di
// 16 (richiesta esplicita, il 16 non piaceva), poi 17..39 come da Essentials.
const NUMERI_SFONDO_BOX = [3, ...Array.from({ length: 23 }, (_, i) => 17 + i)];

function renderBox(contenuto) {
  contenuto.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'box-header';
  header.innerHTML =
    `<button id="box-prev">◀</button>` +
    `<b>Box ${boxIndiceAttivo + 1}/24</b>` +
    `<button id="box-next">▶</button>`;
  contenuto.appendChild(header);
  header.querySelector('#box-prev').addEventListener('click', () => {
    boxIndiceAttivo = (boxIndiceAttivo + 23) % 24;
    mostraSezioneMenu('box');
  });
  header.querySelector('#box-next').addEventListener('click', () => {
    boxIndiceAttivo = (boxIndiceAttivo + 1) % 24;
    mostraSezioneMenu('box');
  });

  const griglia = document.createElement('div');
  griglia.className = 'box-griglia';
  // Sfondo del box (24 disponibili, box_16..box_39.png, uno per pagina).
  griglia.style.backgroundImage = `url('sprites/ui_storage/box_${NUMERI_SFONDO_BOX[boxIndiceAttivo]}.png')`;
  stato.boxes[boxIndiceAttivo].forEach((pkm, slot) => {
    griglia.appendChild(creaCellaBox(pkm, { tipo: 'box', box: boxIndiceAttivo, slot }, false));
  });
  contenuto.appendChild(griglia);

  const nota = document.createElement('p');
  nota.className = 'menu-nota';
  nota.textContent = boxMano
    ? `✋ Stai tenendo ${boxMano.pkm.nome}. Tocca uno slot (anche in squadra, qui sotto) per posarlo o scambiarlo.`
    : 'Tocca uno Pokémon per prenderlo (ℹ️ per il riepilogo), uno slot vuoto per depositare.';
  contenuto.appendChild(nota);

  const dock = document.createElement('div');
  dock.className = 'box-dock-squadra';
  dock.innerHTML = `<div class="box-dock-titolo">⚡ Squadra</div>`;
  const fileSquadra = document.createElement('div');
  fileSquadra.className = 'box-dock-file';
  for (let i = 0; i < 6; i++) {
    fileSquadra.appendChild(creaCellaBox(stato.squadra[i] || null, { tipo: 'squadra', idx: i }, true));
  }
  dock.appendChild(fileSquadra);
  contenuto.appendChild(dock);
}

// Legge/scrive uno slot dato il suo riferimento { tipo, box, slot } o { tipo, idx }
function leggiSlotBox(ref) {
  return ref.tipo === 'box' ? stato.boxes[ref.box][ref.slot] : (stato.squadra[ref.idx] || null);
}

function creaCellaBox(pkm, ref, isDock) {
  const cella = document.createElement('div');
  cella.className = 'box-cella' + (isDock ? ' box-cella-dock' : '') + (pkm ? '' : ' vuota');

  if (pkm) {
    const chiaveIcona = chiaveIconaPokemon(pkm.nome);
    cella.title = `${pkm.nome} · Lv.${pkm.livello}`;
    cella.innerHTML =
      `<div class="box-icona" style="background-image:url('sprites/pokemon_icons/${chiaveIcona}.png')"></div>` +
      `<div class="box-cella-lv">${pkm.livello}</div>` +
      `<button class="box-cella-info" title="Riepilogo">ℹ️</button>`;
    cella.querySelector('.box-cella-info').addEventListener('click', (e) => {
      e.stopPropagation();
      renderDettagli(ref);
    });
  }

  cella.addEventListener('click', () => onClickCellaBox(ref));
  return cella;
}

function onClickCellaBox(ref) {
  const pkmQui = leggiSlotBox(ref);

  if (!boxMano) {
    // Niente in mano: prendo il Pokémon di questo slot (se c'è).
    if (!pkmQui) return;
    if (ref.tipo === 'squadra' && stato.squadra.length <= 1) {
      mostraToast('Non puoi lasciare la squadra senza nemmeno un Pokémon!');
      return;
    }
    if (ref.tipo === 'box') {
      stato.boxes[ref.box][ref.slot] = null;
    } else {
      stato.squadra.splice(ref.idx, 1);
    }
    // Non salvo qui apposta: finché il Pokémon è "in mano" (variabile
    // temporanea, non nello stato salvato) un ricaricamento della pagina
    // deve ritrovarlo al suo posto originale, non perderlo.
    boxMano = { origine: ref, pkm: pkmQui };
    mostraSezioneMenu('box');
    return;
  }

  // Ho qualcosa in mano: lo poso qui (scambio se lo slot è pieno).
  if (ref.tipo === 'box') {
    stato.boxes[ref.box][ref.slot] = boxMano.pkm;
  } else if (pkmQui) {
    stato.squadra[ref.idx] = boxMano.pkm; // scambio diretto, la squadra resta della stessa lunghezza
  } else if (stato.squadra.length < 6) {
    stato.squadra.push(boxMano.pkm); // slot vuoto in fondo alla squadra: aggiunta
  } else {
    mostraToast('La squadra è già al completo.');
    return;
  }
  const preso = boxMano.pkm;
  boxMano = pkmQui ? { origine: ref, pkm: pkmQui } : null;
  salvaPartita();
  mostraToast(boxMano ? `🔄 Scambiati ${preso.nome} e ${pkmQui.nome}.` : `📦 ${preso.nome} sistemato.`);
  mostraSezioneMenu('box');
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
  144: 'Articuno', 145: 'Zapdos',   146: 'Moltres',
  150: 'Mewtwo',   151: 'Mew',
  245: 'Suicune',  249: 'Lugia',    250: 'Ho-Oh',
  251: 'Celebi',
  377: 'Regirock', 378: 'Regice',   379: 'Registeel',
  386: 'Deoxys',
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

// ── Sezione RECAP (Trainer Card) ────────────────────────────
// Statistiche/riepilogo del giocatore — prima faceva parte della scheda
// Salva, spostate qui perché ora Salva contiene solo azioni (esporta/
// importa/nuova partita).
function renderRecap(contenuto) {
  contenuto.innerHTML =
    `<div class="salva-info">` +
      `<div>👣 Passi: <b>${stato.passi}</b></div>` +
      `<div>📅 Giorno: <b>${stato.tempo.giorno}</b> · 🕐 Ora: <b>${formatOrario(stato.tempo.minuti)}</b></div>` +
      `<div>💰 Pokéyen: <b>₽ ${(stato.soldi || 0).toLocaleString('it-IT')}</b></div>` +
      `<div>⚡ Squadra: <b>${stato.squadra.length}</b> · 📦 Box: <b>${contaBox()}</b></div>` +
      `<div>🏅 Medaglie: <b>${stato.medaglie.length}/8</b> · Level cap: <b>${stato.levelCap}</b></div>` +
      `<div>📀 MN: <b>${mnPosseduteTesto()}</b></div>` +
      `<div>⚔️ Allenatori battuti: <b>${(stato.allenatoriBattuti || []).length}/${ALLENATORI.length}</b></div>` +
      gdFStatoTesto() +
      leggendariStatoTesto() +
      legaStatoTesto() +
    `</div>`;
}

// ── Sezione SALVA (solo azioni: esporta/importa/nuova partita/test) ──
function renderSalva(contenuto) {
  contenuto.innerHTML =
    `<div class="salva-info">` +
      `<small>Il salvataggio è manuale: premi "Salva partita" per registrare i progressi. Se non salvi e ricarichi la pagina, riparti dall'ultimo salvataggio.</small>` +
    `</div>` +
    `<div class="dettagli-bottoni colonna">` +
      `<button id="btn-salva-ora" style="background:#2ecc71;color:#0a2a12;font-weight:bold;">💾 Salva partita</button>` +
      (MODALITA_TEST
        ? `<button id="btn-test-squadra" style="background:#7b2fff;color:#fff;">🧪 Setup squadra TEST (Lv.100 + Regi-kit)</button>` +
          `<label style="display:flex;align-items:center;gap:6px;color:#fff;padding:6px 0;">` +
            `<input type="checkbox" id="chk-no-trainer-sfide" ${stato.flags && stato.flags.testNoTrainerChallenge ? 'checked' : ''}>` +
            `🚫 Allenatori non mi sfidano a vista (test)` +
          `</label>` +
          `<button id="btn-reset-cutscene" style="background:#2f7bff;color:#fff;">🔄 Reset cutscene (test)</button>`
        : '') +
      `<button id="btn-esporta">📤 Esporta salvataggio (file JSON)</button>` +
      `<button id="btn-importa">📥 Importa salvataggio da file</button>` +
      `<button id="btn-nuova-partita" class="pericolo">🗑 Nuova partita (cancella tutto)</button>` +
    `</div>`;

  document.getElementById('btn-salva-ora').addEventListener('click', () => {
    const ok = salvaPartitaOra();
    mostraToast(ok ? '💾 Partita salvata!' : '⚠️ Errore nel salvataggio.');
  });

  if (MODALITA_TEST) {
    document.getElementById('btn-test-squadra').addEventListener('click', inizializzaSquadraTest);
    document.getElementById('chk-no-trainer-sfide').addEventListener('change', (e) => {
      if (!stato.flags) stato.flags = {};
      stato.flags.testNoTrainerChallenge = e.target.checked;
      salvaPartita();
    });
    document.getElementById('btn-reset-cutscene').addEventListener('click', () => {
      const sicuro = confirm('Resettare tutte le cutscene già viste? (solo test: potrai ritriggerarle tutte)');
      if (!sicuro) return;
      stato.cutsceneViste = [];
      // Uniche "viste" fuori da cutsceneViste (vedi js/map.js): gate della scena
      // Latios/Latias in due parti (npc fermo + fuga verso roaming).
      if (stato.flags) {
        delete stato.flags.latiosLatiasCutscene1Vista;
        delete stato.flags.latiosLatiasRoaming;
      }
      salvaPartita();
      alert('Cutscene resettate.');
    });
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

  // 6 Pokémon forti (~BST 535-560, tutti ID ≤ 386). Arcanine primo apposta:
  // è il primo non-KO della squadra, quindi scende in campo per primo in
  // battaglia senza dover cambiare Pokémon per provare Flamethrower.
  const idSquadra = [59, 130, 131, 143, 242, 149];
  // Arcanine(555), Gyarados(BST540), Lapras(535), Snorlax(540), Blissey(540), Dragonite(600)

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
      // Arcanine (id 59): forza Flamethrower in squadra per testare
      // l'animazione mossa appena allineata a Essentials (sessione allineamento F14).
      if (id === 59) {
        try {
          const fiammate = await PokeAPI.getMossa('flamethrower');
          pkm.mosse[0] = { ...fiammate, pp: fiammate.ppMax };
        } catch (e) {
          console.warn('[Squadra test] Impossibile insegnare Flamethrower ad Arcanine:', e.message);
        }
      }
      stato.squadra.push(pkm);
    }
  }

  // Non svuotare il box: aggiungi solo se non ci sono già
  const idGiaInBox = tuttiIBoxFlat().map(p => p.id);
  for (const id of idBox) {
    if (!idGiaInBox.includes(id)) {
      const pkm = await Battle.creaIstanza(id, 10);
      if (pkm) depositaInBox(pkm);
    }
  }

  // Attiva il roaming di Suicune (già "visto" al lago)
  stato.flags.suicuneVisto   = true;
  stato.flags.suicuneRoaming = true;

  // Tutti gli oggetti chiave per testare Lugia, Ho-Oh, Deoxys
  if (!stato.inventario) stato.inventario = { chiave: {} };
  stato.inventario.chiave['braciere-nemi']    = true;
  stato.inventario.chiave['piuma-sacra']      = true;
  stato.inventario.chiave['divisa-astronauta'] = true;
  // La Lega dev'essere completata per i trigger post-Lega
  stato.flags.legaCompletata = true;
  stato.flags.lingue_antiche = true;
  // Sblocca la catena Bunkerino e Mew (test)
  stato.flags.bunkerinoDebellato     = true;
  stato.flags.cotralAricciaDebellata = true;
  stato.flags.mewtwoSconfitto        = true;
  // Sblocca tutto: Surf, Taglio, Volo, Funivia, Forza, Spaccaroccia, Cascata,
  // Sub, Via Vittoria — tutti i permessi d'uso delle MN, per non bloccarsi
  // durante i test sui dungeon.
  stato.mn.surf         = true;
  stato.mn.taglio       = true;
  stato.mn.volo         = true;
  stato.mn.funivia      = true;
  stato.mn.forza        = true;
  stato.mn.spaccaroccia = true;
  stato.mn.cascata      = true;
  stato.mn.sub          = true;
  stato.mn.vittoria     = true;
  // Level cap max
  stato.levelCap = 66;

  salvaPartita();
  GameMap.sbloccaMovimento();
  aggiornaHUD();
  // Prova inequivocabile che il fix è attivo: mostra le mosse vere di
  // Arcanine appena create, senza dover aprire altri menu per controllare.
  const arcanineTest = stato.squadra.find(p => p.id === 59);
  const mosseArcanine = arcanineTest ? arcanineTest.mosse.map(m => m.nomeIt || m.nome).join(', ') : 'non trovato!';
  mostraToast(
    '🧪 Squadra TEST pronta! Lv.100, tutte le MN, Braciere+Piuma. ' +
    'Pratoni del Vivaro → Lugia · Ponte Ariccia alba+sagra → Ho-Oh! ' +
    `Mosse Arcanine: ${mosseArcanine}`,
    12000
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
  if (typeof GameMap.aggiornaFollowerSpecie === 'function') GameMap.aggiornaFollowerSpecie();
  aggiornaHUD();
  salvaPartita();
  console.log(`[Incontro] Battaglia terminata: ${esito}`);
}

// ── Callback per ogni passo ──────────────────────────────────

function alPasso(nuovaPosizione) {
  stato.posizione = nuovaPosizione;
  stato.passi += 1;
  stato.passiDaCheck += 1;

  // Veleno fuori dalla lotta (richiesta esplicita di Luca): 1 HP di danno
  // ogni 5 passi, come nei giochi veri — solo fuori da una battaglia (lì
  // ci pensa già battle.js coi suoi turni) e solo se la mappa lo consente
  // (non durante un dialogo/cutscene che blocca i passi comunque).
  if (stato.passi % 5 === 0 && !stato.incontroAttivo) {
    let colpito = false;
    (stato.squadra || []).forEach(p => {
      if (p.hpAttuale > 0 && p.condizione && p.condizione.tipo === 'poison') {
        p.hpAttuale = Math.max(0, p.hpAttuale - 1);
        colpito = true;
      }
    });
    if (colpito) mostraToast('☠️ Il veleno ha ferito un tuo Pokémon...', 1600);
  }

  // F9.1: avanza il tempo di gioco (indipendente dal booster)
  avanzaTempo();
  controllaEventiTempo();
  GameMap.aggiornaVeloTempo();
  aggiornaMeteo();

  // F9.2: consuma i passi del repellente, se attivo
  if (stato.repellentePassi > 0) {
    stato.repellentePassi -= 1;
    if (stato.repellentePassi === 0) {
      mostraToast('🚷 Il repellente ha esaurito il suo effetto.');
    }
  }

  // F9: aggiorna i comuni visitati (per la MN Volo)
  segnaCittaVisitata();

  // F9.3: Pensione Pokémon — passi insieme verso l'uovo + schiusa dell'uovo in squadra
  aggiornaPensione();
  aggiornaUova();

  // F11: cancella il cooldown leggendario se il giocatore ha cambiato zona
  if (stato.legCooldown) {
    const zonaOra = World.trovaZona(nuovaPosizione.lat, nuovaPosizione.lon);
    const zonaId = zonaOra ? zonaOra.id : null;
    if (zonaId !== stato.legCooldown.zonaId) stato.legCooldown = null;
  }

  aggiornaHUD();
  salvaPartita();

  // ── MOTORE MAPPA = TILED ──────────────────────────────────────
  // Da qui in giù c'è il VECCHIO sistema a coordinate lat/lon (mappa OSM):
  // incontri per zona, allenatori a distanza, raccolta automatica oggetti,
  // leggendari/eventi geografici. Sulle mappe Tiled comanda map.js, quindi
  // lo disattiviamo per non avere due motori che si pestano i piedi.
  if (MAPPA_TILED) return;

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
            'Le fiamme dell\'antico braciere hanno chiamato qualcosa dall\'alto dei cieli.',
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
                'All\'alba, la piuma iridescente che tieni in mano comincia a splendere di arancio...',
                'Dal cielo striato di rosa scende una scia di fuoco dorato.',
                'HO-OH! L\'uccello dell\'arcobaleno plana sul Ponte come un augurio!',
                '(La piuma vibra — questa è la tua unica chance!)',
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

// ── Scelta del personaggio (ragazzo/ragazza) — primissima schermata ────────
// Mostrata solo se manca "stato.genere" (salvataggio nuovo o vecchio senza
// questo campo): determina lo sprite del giocatore in tutto il gioco.
function scegliGenere() {
  return new Promise(resolve => {
    const overlay = document.getElementById('overlay-genere');
    overlay.classList.remove('nascosto');
    overlay.querySelectorAll('.card-genere').forEach(card => {
      card.addEventListener('click', () => {
        overlay.classList.add('nascosto');
        resolve(card.dataset.genere);
      }, { once: true });
    });
  });
}

// ── Avvio ────────────────────────────────────────────────────

async function avvia() {
  caricaPartita();

  if (!stato.genere) {
    stato.genere = await scegliGenere();
    salvaPartita();
  }

  if (MODALITA_TEST) {
    stato.zaino.caramellarara = 999;
    stato.zaino.repellente = 999;   // dev: per evitare gli incontri durante i test
  } else {
    delete stato.zaino.caramellarara;
  }

  GameMap.inizializza({
    posizione: stato.posizione,
    onPasso:   alPasso
  });

  aggiornaHUD();

  document.getElementById('btn-chiudi-menu').addEventListener('click', chiudiMenu);
  initTastiera();   // QoL: tasti A / B / Start (Invio) / Select (Shift)
  document.getElementById('btn-volo').addEventListener('click', apriVolo); // MN Volo (F9)
  document.getElementById('btn-repellente').addEventListener('click', usaRepellenteRapido); // QoL repellente

  // Pulsanti Select/Start a schermo (solo mobile — vedi .solo-mobile in
  // style.css): stessa logica dei tasti fisici, richiamano le stesse funzioni.
  const btnSelect = document.getElementById('btn-select');
  if (btnSelect) btnSelect.addEventListener('click', premiSelect);
  const btnStart = document.getElementById('btn-start');
  if (btnStart) btnStart.addEventListener('click', premiStart);

  // Chiudi overlay interno edificio
  document.getElementById('btn-esci-interno')?.addEventListener('click', () => {
    document.getElementById('overlay-interno').classList.add('nascosto');
    GameMap.sbloccaMovimento();
  });
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
    mostraToast('🔬 Avvicinati all\'edificio BLU vicino a te (segui il ▼ INIZIO) e premi [A] o Spazio!', 7000);
  }

  console.log('[Gioco] Pokémon Castelli Romani avviato. Buon viaggio!');
  console.log('[Info] Zone attive:', 'World.trovaZona(lat, lon)');
  console.log('[Info] Cache PokéAPI:', 'PokeAPI.svuotaCache()');
  console.log('[Info] Stato di gioco:', 'stato (squadra, zaino, levelCap, tempo)');
}

document.addEventListener('DOMContentLoaded', avvia);
