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
  let datiAllenatore = null;      // { nome, squadra, dialogoSconfitta }
  let squadraNemica = [];         // istanze dei Pokémon dell'allenatore
  let indiceNemico = 0;           // quale Pokémon nemico è in campo
  let fuggireImpossibile = false; // F11: true per i leggendari (fuga bloccata)

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
  // Converte il meteo di mappa (app.js, stato.meteo.tipo) nel meteo di battaglia
  const METEO_DA_MAPPA = { pioggia: 'rain', sole: 'sun', grandine: 'hail' }; // sabbia: nessuna zona ancora

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

  function calcolaStat(base, livello) {
    return Math.floor(2 * base * livello / 100) + 5;
  }

  function calcolaHpMax(baseHp, livello) {
    return Math.floor(2 * baseHp * livello / 100) + livello + 10;
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
    if (m.statoEffetto && STATI[m.statoEffetto]) return true; // infligge uno stato gestito
    if (m.cambiStat && m.cambiStat.length > 0) return true;   // modifica le statistiche
    if (MOSSE_METEO[m.nome]) return true;                     // imposta il meteo
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
    ist.hpMax    = calcolaHpMax(ist.basi.hp, ist.livello);
    ist.attacco  = calcolaStat(ist.basi.attack, ist.livello);
    ist.difesa   = calcolaStat(ist.basi.defense, ist.livello);
    ist.attSp    = calcolaStat(ist.basi['special-attack'], ist.livello);
    ist.difSp    = calcolaStat(ist.basi['special-defense'], ist.livello);
    ist.velocita = calcolaStat(ist.basi.speed, ist.livello);
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
  async function creaIstanza(id, livello) {
    const dati = await PokeAPI.getPokemon(id);
    const abilitaSlot = sceglieSlotAbilita(dati);
    const ist = {
      id: dati.id,
      nome: nomeBello(dati.nome),
      tipi: dati.tipi,
      sprite: dati.sprite,
      baseExp: dati.baseExp || 64,
      basi: dati.statistiche,
      catchRate: (typeof dati.catchRate === 'number') ? dati.catchRate : 45,
      livello: livello,
      exp: Math.pow(livello, 3),       // curva di crescita: Lv^3
      mosse: await scegliMosse(dati, livello),
      mosseImparabili: dati.mosse,     // lista specie: serve per i level-up futuri
      condizione: null,                // stato alterato: null | { tipo, turni }
      mod: modificatoriAzzerati(),     // sbalzi di statistica (-6..+6)
      felicita: 70,                    // 0-255: sale coi livelli/vittorie (evol. felicità)
      oggetto: null,                   // oggetto da tenere (chiave in OGGETTI, categoria 'held') o null
      genere: generaGenere(dati.id),   // F9.3: 'M' | 'F' | 'N'
      abilitaSlot,                     // F9.4: indice nella lista abilità della specie
      abilitaChiave: abilitaChiaveDaSlot(dati, abilitaSlot), // slug inglese (es. "static")
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

  /* MOD 6B — Mosse di FURIA: bloccano il Pokémon per 2-3 turni colpendo ogni
     turno; alla fine lo lasciano confuso. Chiavi = nome PokéAPI (inglese). */
  const MOSSE_FURIA = {
    'outrage':     "è in preda all'oltraggio",
    'petal-dance': 'è travolto dalla petalobufera',
    'thrash':      'si scatena senza controllo',
  };
  // MOD 6B — Mosse che fanno svenire chi le usa (dopo aver colpito).
  const MOSSE_AUTODISTRUZIONE = new Set(['explosion', 'self-destruct', 'selfdestruct']);
  // MOD 6B — Mosse di protezione: annullano la mossa avversaria per quel turno.
  const MOSSE_PROTEZIONE = new Set(['protect', 'detect']);

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

  // Un Pokémon è immune a quel tipo di stato per via dei suoi tipi?
  function immuneAStato(ist, tipoStato) {
    if (tipoStato === 'poison')  return ist.tipi.includes('poison') || ist.tipi.includes('steel');
    if (tipoStato === 'burn')    return ist.tipi.includes('fire');
    if (tipoStato === 'freeze')  return ist.tipi.includes('ice');
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

  // Colpo critico (0172_Battle_Move.rb/0174_Move_UsageCalculations.rb):
  // qui usiamo le regole "classiche" (pre-Gen 6, quelle di Rosso Fuoco/
  // Smeraldo — il progetto è dichiaratamente Gen 1-2-3, CLAUDE.md), non
  // quelle Gen 8 di default nel pacchetto Essentials estratto: rapporti
  // [16,8,4,3,2] (1/16 base, 1/8 per le mosse "alta probabilità di
  // critico" come Taglio/Rasoiovento) e danno ×2 (non ×1.5 come da Gen 6
  // in poi). Mancava del tutto prima: c'era il campo dati "colpo_critico_
  // alto" su alcune mosse in dati/mosse.js ma nessun codice lo leggeva.
  const RAPPORTI_CRITICO = [16, 8, 4, 3, 2];
  function tiraCritico(mossa) {
    const stadio = (mossa.effetto === 'colpo_critico_alto') ? 1 : 0;
    const rapporto = RAPPORTI_CRITICO[Math.min(stadio, RAPPORTI_CRITICO.length - 1)];
    return Math.random() < 1 / rapporto;
  }

  function calcolaDanno(attaccante, difensore, mossa) {
    const eff = efficacia(mossa.tipo, difensore.tipi);
    if (eff === 0) return { danno: 0, eff: 0, critico: false };

    // Mosse fisiche usano Attacco/Difesa, speciali Att.Sp./Dif.Sp.
    // Applichiamo gli sbalzi di statistica (Crescita, Urlo, ecc.).
    const fisica = mossa.classe !== 'special';
    let A = fisica
      ? statEffettiva(attaccante, attaccante.attacco, 'attack')
      : statEffettiva(attaccante, attaccante.attSp, 'special-attack');
    const D = fisica
      ? statEffettiva(difensore, difensore.difesa, 'defense')
      : statEffettiva(difensore, difensore.difSp, 'special-defense');

    // Scottatura: dimezza il danno delle mosse fisiche di chi ne soffre
    if (fisica && attaccante.condizione && attaccante.condizione.tipo === 'burn') {
      A = A * 0.5;
    }

    const critico = tiraCritico(mossa);

    // Formula reale (0174_Move_UsageCalculations.rb#pbCalcDamage): il
    // termine di livello va arrotondato per difetto PRIMA di moltiplicarlo
    // per potenza/attacco/difesa, non alla fine insieme al resto — prima
    // qui si perdeva un pizzico di precisione ai livelli non multipli di 5.
    const terminelivello = Math.floor(2 * attaccante.livello / 5 + 2);
    const base = Math.floor(terminelivello * mossa.potenza * A / D / 50) + 2;

    // Tutti i moltiplicatori (STAB, oggetto, meteo, critico, efficacia,
    // variazione casuale) si combinano in UN SOLO fattore, arrotondato una
    // volta sola alla fine — come fa davvero il motore (pbCalcDamageMultipliers
    // + un solo .round finale). Prima ogni moltiplicatore faceva il suo
    // Math.floor() separato, perdendo un po' di danno ad ogni passaggio
    // invece che una volta sola.
    let molt = 1;
    if (attaccante.tipi.includes(mossa.tipo)) molt *= 1.5; // STAB
    const heldAtt = attaccante.oggetto && typeof OGGETTI !== 'undefined' ? OGGETTI[attaccante.oggetto] : null;
    if (heldAtt && heldAtt.boostTipo === mossa.tipo) molt *= 1.2; // Oggetto potenziante (es. Carbonella)
    if (meteoBattaglia === 'sun') {
      if (mossa.tipo === 'fire') molt *= 1.5;
      else if (mossa.tipo === 'water') molt *= 0.5;
    } else if (meteoBattaglia === 'rain') {
      if (mossa.tipo === 'water') molt *= 1.5;
      else if (mossa.tipo === 'fire') molt *= 0.5;
    }
    if (critico) molt *= 2;
    molt *= eff;
    molt *= 0.85 + Math.random() * 0.15; // variazione casuale

    const danno = Math.round(base * molt);
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
  function di(testo) {
    return new Promise(resolve => {
      const el = $('battaglia-messaggio');
      el.textContent = testo;
      let fatto = false;
      const avanti = () => {
        if (fatto) return;
        fatto = true;
        el.removeEventListener('click', avanti);
        clearTimeout(timer);
        resolve();
      };
      const velocita = (statoGioco && statoGioco.velocita) || 1;
      const moltTesto = (statoGioco && statoGioco.opzioni &&
        MOLT_VELOCITA_TESTO[statoGioco.opzioni.velocitaTesto]) || 1;
      const timer = setTimeout(avanti, 1150 / velocita / moltTesto);
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
    $('nemico-nome').textContent = nemico.nome + siglaCondizione(nemico);
    $('nemico-lv').textContent = 'Lv.' + nemico.livello;
    aggiornaBarraHp('nemico-hp', nemico.hpAttuale, nemico.hpMax);

    // Contatore Pokémon avversario (solo battaglie allenatore)
    const elContatore = $('nemico-contatore');
    if (elContatore) {
      if (modalita === 'allenatore' && squadraNemica.length > 1) {
        const rimasti = squadraNemica.length - indiceNemico;
        let html = '';
        for (let i = 0; i < squadraNemica.length; i++) {
          const sconfitto = i >= rimasti;
          html += `<img src="sprites/NO/Graphics/UI/Battle/icon_ball${sconfitto ? '_faint' : ''}.png" alt="">`;
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
    $('nemico-sprite').src = nemico.sprite.fronte || '';
    $('giocatore-sprite').src = mio.sprite.retro || mio.sprite.fronte || '';
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

  /* ==========================================================
     EFFETTI VISIVI DELLE MOSSE — generici per categoria+tipo.
     Non un'animazione per ognuna delle 700+ mosse: solo 3 template
     (fisica = balzo+scossa, speciale = proiettile colorato dal tipo,
     stato = scintillio colorato sul vero bersaglio), scelti da
     mossa.classe/mossa.potenza/mossa.tipo (già letti da PokéAPI).
     ========================================================== */

  // Centro di uno sprite, in coordinate relative a #battaglia-schermo
  function centroSprite(chi) {
    const campo = $('battaglia-schermo');
    const el = elementoSprite(chi);
    const rC = campo.getBoundingClientRect();
    const rE = el.getBoundingClientRect();
    return {
      x: rE.left - rC.left + rE.width / 2,
      y: rE.top - rC.top + rE.height / 2,
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

  const CARTELLA_BALL_FX = 'Essentials FRLG/Graphics/Battle animations/';

  function nomeFileBall(chiaveBall) {
    const img = OGGETTI[chiaveBall] && OGGETTI[chiaveBall].img;
    return img ? img.replace(/\.png$/i, '') : 'POKEBALL';
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
    const cx = rE.left - rC.left + rE.width / 2;
    const cy = rE.top - rC.top + rE.height / 2;

    el.style.opacity = '0';

    const mostraBall = lato === 'giocatore' || modalita === 'allenatore';
    if (mostraBall) {
      const dim = lato === 'nemico' ? 60 : 74;
      const ball = document.createElement('div');
      ball.className = 'ball-fx';
      ball.style.width = dim + 'px';
      ball.style.height = dim + 'px';
      ball.style.left = cx + 'px';
      ball.style.top = cy + 'px';
      ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_POKEBALL_open.png')}')`;
      ball.style.backgroundSize = `${dim}px ${dim * 2}px`;
      ball.style.backgroundPosition = '0 0'; // frame chiusa
      campo.appendChild(ball);

      // Piccola scossa prima di aprirsi (come in Essentials: Ball tremolante
      // sul punto d'arrivo prima del flash), poi frame d'apertura.
      ball.classList.add('ball-scossa');
      await new Promise(r => setTimeout(r, durataFx(380)));
      ball.classList.remove('ball-scossa');
      ball.style.backgroundPosition = `0 -${dim}px`; // flash d'apertura
      await new Promise(r => setTimeout(r, durataFx(120)));

      // Il Pokémon inizia a "crescere" mentre la Ball sparisce in dissolvenza
      // (sovrapposti, non in sequenza: più naturale e più vicino all'originale).
      ball.style.transition = `opacity ${durataFx(250)}ms ease-out`;
      ball.style.opacity = '0';
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
    const da = { x: rD.left - rC.left + rD.width * 0.55, y: rD.top - rC.top + rD.height * 0.35 };
    const a  = { x: rA.left - rC.left + rA.width * 0.5,  y: rA.top - rC.top + rA.height * 0.55 };

    const nome = nomeFileBall(chiaveBall);
    const dim = 42;
    const ball = document.createElement('div');
    ball.className = 'ball-fx';
    ball.style.width = dim + 'px';
    ball.style.height = dim + 'px';
    ball.style.left = da.x + 'px';
    ball.style.top = da.y + 'px';
    ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_' + nome + '.png')}')`;
    ball.style.backgroundSize = `${dim * 8}px ${dim * 2}px`;
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
    const aFinale = { x: rA2.left - rC.left + rA2.width * 0.5, y: rA2.top - rC.top + rA2.height * 0.55 };
    ball.style.left = aFinale.x + 'px';
    ball.style.top = aFinale.y + 'px';

    // Il nemico viene "risucchiato" dentro la Ball
    aEl.style.transition = `opacity ${durataFx(180)}ms ease-in, transform ${durataFx(180)}ms ease-in`;
    aEl.style.opacity = '0';
    aEl.style.transform = 'scale(0.15)';

    ball.style.backgroundImage = `url('${encodeURI(CARTELLA_BALL_FX + 'ball_' + nome + '_open.png')}')`;
    ball.style.backgroundSize = `${dim}px ${dim * 2}px`;
    ball.style.backgroundPosition = `0 -${dim}px`; // flash d'apertura
    await new Promise(r => setTimeout(r, durataFx(220)));
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
    ball.style.backgroundPosition = `0 -${ball.clientWidth}px`; // frame apertura (sheet _open è dim x dim*2)
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

    if (typeof AnimazioniEssentials !== 'undefined' && AnimazioniEssentials.haAnimazione(mossa.nome)) {
      await AnimazioniEssentials.gioca(mossa.nome, elementoSprite(att), elementoSprite(bersaglioReale));
      scuotiSchermo();
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
      scuotiSchermo();
      await new Promise(r => setTimeout(r, durataFx(180)));
    } else {
      await proiettileMossa(att, dif, colore);
      scuotiSchermo();
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

    for (const mossa of mio.mosse) {
      const btn = document.createElement('button');
      btn.className = 'btn-mossa';
      btn.innerHTML =
        `<span class="mossa-nome">${mossa.nomeIt}</span>` +
        `<span class="tipo-badge" style="background:${TIPO_COLORI[mossa.tipo] || '#888'}">${TIPO_NOMI[mossa.tipo] || mossa.tipo}</span>` +
        `<span class="mossa-pp">PP ${mossa.pp}/${mossa.ppMax}</span>`;
      btn.disabled = mossa.pp <= 0;
      btn.addEventListener('click', () => turnoCompleto(mossa));
      menu.appendChild(btn);
    }

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
    resetCursore();
  }

  function mostraMenuZaino() {
    nascondiMenu();
    const menu = $('menu-zaino');
    menu.innerHTML = '';

    // In battaglia si usano Ball, Pozioni e X Item (statistiche temporanee)
    let almenoUno = false;
    for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
      if (oggetto.categoria !== 'ball' && oggetto.categoria !== 'cura' && oggetto.categoria !== 'xitem') continue;
      const quanti = statoGioco.zaino[chiave] || 0;
      if (quanti <= 0) continue;
      almenoUno = true;
      const btn = document.createElement('button');
      btn.innerHTML = `${oggetto.icona} ${oggetto.nome} <span class="mossa-pp">×${quanti}</span>`;
      btn.addEventListener('click', () => {
        if (oggetto.categoria === 'ball') tentaCattura(chiave);
        else if (oggetto.categoria === 'cura') usaPozione(chiave);
        else if (oggetto.categoria === 'xitem') usaXItem(chiave);
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
  function confermaCursore() {
    const bottoni = _bottoniCursore();
    if (bottoni[cursoreIdx]) bottoni[cursoreIdx].click();
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
  async function applicaStato(bersaglio, tipoStato, etichetta) {
    if (!STATI[tipoStato]) return;            // stato non gestito: ignora
    if (bersaglio.condizione) {               // ne ha già uno
      await di(`Ma ${etichetta} ha già un problema di stato!`);
      return;
    }
    if (immuneAStato(bersaglio, tipoStato)) {
      await di(`Non ha effetto su ${etichetta}!`);
      return;
    }
    // Il sonno dura da 1 a 3 turni
    const turni = tipoStato === 'sleep' ? 1 + Math.floor(Math.random() * 3) : 0;
    bersaglio.condizione = { tipo: tipoStato, turni };
    aggiornaPannelli();
    await di(`${etichetta} è ${STATI[tipoStato].nome}!`);
  }

  // Applica i cambi di statistica al bersaglio giusto (se stesso o avversario)
  async function applicaCambiStat(att, dif, mossa, etichettaAtt, etichettaDif) {
    // Le mosse con bersaglio "user" modificano CHI le usa (Crescita, Danza Spada…)
    const versoSe = (mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field');
    const obiettivo = versoSe ? att : dif;
    const etich = versoSe ? etichettaAtt : etichettaDif;

    for (const c of mossa.cambiStat) {
      if (obiettivo.mod[c.stat] === undefined) continue; // statistica non gestita
      const prima = obiettivo.mod[c.stat];
      obiettivo.mod[c.stat] = Math.max(-6, Math.min(6, prima + c.modifica));
      const nome = STAT_NOMI[c.stat] || c.stat;
      if (obiettivo.mod[c.stat] === prima) {
        await di(`${nome} di ${etich} non può cambiare ancora!`);
      } else if (c.modifica > 0) {
        await frecceStat(obiettivo, c.modifica);
        await di(`${nome} di ${etich} ${c.modifica >= 2 ? 'è aumentato molto!' : 'è aumentato!'}`);
      } else {
        await frecceStat(obiettivo, c.modifica);
        await di(`${nome} di ${etich} ${c.modifica <= -2 ? 'è diminuito molto!' : 'è diminuito!'}`);
      }
    }
    aggiornaPannelli();
  }

  // Tiro di precisione, tenendo conto degli sbalzi di Precisione/Elusione
  function colpisce(att, dif, mossa) {
    if (mossa.precisione === null || mossa.precisione === undefined) return true; // colpisce sempre
    const acc = moltiplicatoreStage(att.mod.accuracy || 0);
    const eva = moltiplicatoreStage(dif.mod.evasion || 0);
    let soglia = mossa.precisione * (acc / eva);
    // Polvere Abbaglio: rende il portatore più difficile da colpire
    if (dif.oggetto === 'polvere_abbaglio') soglia *= 0.9;
    return Math.random() * 100 <= soglia;
  }

  // Esegue una singola mossa di "att" contro "dif".
  // Gestisce PP, precisione, danno+efficacia (offensive), stati ed
  // effetti statistici (mosse di stato pure e secondari delle offensive).
  async function eseguiMossa(att, dif, mossa, etichettaAtt, etichettaDif, giaCaricata, opzioni) {
    opzioni = opzioni || {};
    // "silenzioso" = seconda (o successiva) risoluzione di una mossa ad area
    // già annunciata/scalata sui PP per il primo bersaglio (vedi eseguiMossaMultiBersaglio).
    if (!opzioni.silenzioso) {
      // I PP si consumano al turno di carica, non al turno del colpo (giaCaricata)
      if (!giaCaricata && mossa.pp !== undefined && mossa.pp < 900) mossa.pp = Math.max(0, mossa.pp - 1);
      await di(`${etichettaAtt} usa ${mossa.nomeIt}!`);
    }

    // Il colpo a vuoto si controlla PRIMA dell'animazione: se manca, niente
    // effetto visivo, solo il messaggio (richiesta esplicita utente).
    if (!colpisce(att, dif, mossa)) {
      await di('...ma il colpo è andato a vuoto!');
      return;
    }

    await animaMossa(att, dif, mossa);

    // MOD 6B: se il bersaglio si è protetto (Protezione/Individuazione), niente effetto
    if (dif.protetto) {
      await di(`${etichettaDif} si protegge dal colpo!`);
      return;
    }

    // --- MOSSA OFFENSIVA (ha potenza) ---
    if (mossa.potenza && mossa.potenza > 0) {
      let { danno, eff, critico } = calcolaDanno(att, dif, mossa);
      if (eff === 0) {
        await di(`Non ha alcun effetto su ${etichettaDif}!`);
        return;
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
        }
      }
      dif.hpAttuale = sopravvive ? 1 : Math.max(0, dif.hpAttuale - danno);
      lampeggia(dif);
      aggiornaPannelli();
      if (eff > 1) await di('È superefficace!');
      else if (eff < 1) await di('Non è molto efficace...');

      // Drenaggio/contraccolpo (mossa.drain, % del danno INFLITTO, da
      // PokéAPI meta.drain): positivo = l'attaccante recupera HP
      // (Assorbimento, Giga Prosciugo…), negativo = l'attaccante si fa male
      // da solo (Doppia Sfida, Testata…). Si applica sempre, anche se il
      // bersaglio va KO dal colpo (il contraccolpo colpisce comunque chi
      // attacca — punto 4, sess. 16 set 2026: "alcune ti levano o ridanno vita").
      if (mossa.drain && danno > 0) {
        const variazione = Math.max(1, Math.round(danno * Math.abs(mossa.drain) / 100));
        if (mossa.drain > 0) {
          const primaHp = att.hpAttuale;
          att.hpAttuale = Math.min(att.hpMax, att.hpAttuale + variazione);
          const recuperati = att.hpAttuale - primaHp;
          if (recuperati > 0) {
            aggiornaPannelli();
            await testoFluttuante(att, `+${recuperati}`, '#5cd65c');
            await di(`${etichettaAtt} ha drenato energia da ${etichettaDif}!`);
          }
        } else {
          att.hpAttuale = Math.max(0, att.hpAttuale - variazione);
          lampeggia(att);
          aggiornaPannelli();
          await testoFluttuante(att, `-${variazione}`, '#ff5c5c');
          await di(`${etichettaAtt} subisce il contraccolpo!`);
        }
      }

      if (dif.hpAttuale <= 0) return; // KO: niente effetti secondari

      // Effetto di stato secondario (es. 30% di paralisi)
      if (mossa.statoEffetto && STATI[mossa.statoEffetto] && !dif.condizione &&
          mossa.statoProbabilita > 0 && Math.random() * 100 < mossa.statoProbabilita) {
        await applicaStato(dif, mossa.statoEffetto, etichettaDif);
      }
      // Cambio di statistiche secondario
      if (mossa.cambiStat && mossa.cambiStat.length > 0 &&
          mossa.cambiStatProbabilita > 0 && Math.random() * 100 < mossa.cambiStatProbabilita) {
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
    if (mossa.statoEffetto && STATI[mossa.statoEffetto]) {
      qualcosa = true;
      // Mosse come Riposo hanno bersaglio "user": lo stato va a chi la usa,
      // non all'avversario (bug corretto punto 4, sess. 16 set 2026 — prima
      // "dif" era fisso, ignorando mossa.bersaglio).
      const versoSe = (mossa.bersaglio === 'user' || mossa.bersaglio === 'users-field');
      const obiettivoStato = versoSe ? att : dif;
      const etichObiettivo = versoSe ? etichettaAtt : etichettaDif;
      // Per le mosse di stato pure la probabilità API è 0 = effetto garantito
      const prob = mossa.statoProbabilita > 0 ? mossa.statoProbabilita : 100;
      if (Math.random() * 100 < prob) await applicaStato(obiettivoStato, mossa.statoEffetto, etichObiettivo);
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
      if (c.turni > 0) c.turni -= 1;
      if (c.turni <= 0) {
        att.condizione = null;
        aggiornaPannelli();
        await di(`${etichetta} si è svegliato!`);
        return true;
      }
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
      if (mossa.pp !== undefined && mossa.pp < 900) mossa.pp = Math.max(0, mossa.pp - 1);
      await di(`${etichettaAtt} ${MOSSE_DUE_TURNI[mossa.nome]}!`);
      return;
    }
    if (inCaricaQuesta) att.inCarica = null;

    // MOD 6B: FURIA — alla prima esecuzione blocca il Pokémon per 2-3 turni
    if (MOSSE_FURIA[mossa.nome] && !(att.furia && att.furia.nome === mossa.nome)) {
      att.furia = { nome: mossa.nome, turni: 2 + Math.floor(Math.random() * 2) };
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
  async function fineTurnoMeteo() {
    if (!meteoBattaglia) return;
    if (meteoBattaglia === 'sandstorm' || meteoBattaglia === 'hail') {
      const nomeMeteo = meteoBattaglia === 'sandstorm' ? 'tempesta di sabbia' : 'grandine';
      const lista = [[mio, mio.nome], [nemico, etichettaNemico()]];
      for (const [ist, etich] of lista) {
        if (ist.hpAttuale <= 0) continue;
        const immune = meteoBattaglia === 'sandstorm'
          ? (ist.tipi.includes('rock') || ist.tipi.includes('ground') || ist.tipi.includes('steel'))
          : ist.tipi.includes('ice');
        if (immune) continue;
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
    const lista = [[mio, mio.nome], [nemico, etichettaNemico()]];
    for (const [ist, etich] of lista) {
      if (ist.hpAttuale <= 0 || !ist.condizione) continue;
      if (ist.condizione.tipo === 'poison' || ist.condizione.tipo === 'burn') {
        const danno = Math.max(1, Math.floor(ist.hpMax / 8));
        ist.hpAttuale = Math.max(0, ist.hpAttuale - danno);
        lampeggia(ist);
        aggiornaPannelli();
        const causa = ist.condizione.tipo === 'poison' ? 'dal veleno' : 'dalla scottatura';
        await di(`${etich} è tormentato ${causa}!`);
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

  // Il nemico sceglie una mossa a caso tra quelle con PP
  function scegliMossaNemico() {
    return sceglieMossaCasuale(nemico);
  }

  // Velocità effettiva (sbalzi + dimezzamento da paralisi), per l'ordine dei turni
  function velocitaEffettiva(ist) {
    let v = statEffettiva(ist, ist.velocita, 'speed');
    if (ist.condizione && ist.condizione.tipo === 'paralysis') v *= 0.5;
    return v;
  }

  // Solo il nemico agisce (dopo che il giocatore usa un oggetto, cambia Pokémon
  // o fallisce la fuga): attacca, poi scattano i danni da stato.
  async function turnoNemicoEFine() {
    await eseguiTurno(nemico, mio, scegliMossaNemico(), etichettaNemico(), mio.nome);
    if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    await fineTurnoStati();
    if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
    mostraMenuPrincipale();
  }

  // Turno completo: l'ordine è deciso prima dalla PRIORITÀ della mossa,
  // poi (a parità) dalla velocità effettiva.
  async function turnoCompleto(mossaMia) {
    nascondiMenu();

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
    if (prioMia !== prioNem) mioPrima = prioMia > prioNem;
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
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    } else {
      await eseguiTurno(nemico, mio, mossaNemico, etNem, mio.nome);
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
      await eseguiTurno(mio, nemico, mossaMia, mio.nome, etNem);
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }   // MOD 6B: auto-KO
    }

    // Fine turno: veleno/scottatura colpiscono entrambi
    await fineTurnoStati();
    if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }

    mostraMenuPrincipale();
  }

  /* ==========================================================
     ESPERIENZA E LEVEL-UP (con level cap)
     ========================================================== */

  async function assegnaExp(ist, exp) {
    const cap = statoGioco.levelCap || 100;
    // L'EXP non può superare la soglia massima del cap:
    // si "blocca" finché non arriva la medaglia successiva.
    const expMassima = Math.pow(cap + 1, 3) - 1;

    ist.exp += exp;
    let capRaggiunto = false;
    if (ist.exp > expMassima) { ist.exp = expMassima; capRaggiunto = true; }

    await di(`${ist.nome} guadagna ${exp} Punti Esperienza!`);

    // Sale di livello finché l'EXP lo consente (e il cap lo permette)
    while (ist.livello < cap && ist.exp >= Math.pow(ist.livello + 1, 3)) {
      ist.livello += 1;
      const vecchioHpMax = ist.hpMax;
      ricalcolaStatistiche(ist);
      // Gli HP attuali crescono insieme agli HP massimi
      ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - vecchioHpMax));
      aggiornaPannelli();
      await di(`✨ ${ist.nome} sale al livello ${ist.livello}!`);
      await controllaNuoveMosse(ist);
      await controllaEvoluzione(ist);
    }

    aggiornaPannelli();
    if (capRaggiunto) {
      await di(`⛔ ${ist.nome} ha raggiunto il level cap (Lv.${cap}). Serve la prossima medaglia!`);
    }
  }

  // Al level-up: se la specie impara una mossa proprio a questo livello, la aggiunge
  async function controllaNuoveMosse(ist) {
    const nuove = (ist.mosseImparabili || []).filter(m => m.livello === ist.livello);
    for (const voce of nuove) {
      if (ist.mosse.some(s => s.nome === voce.nome)) continue;
      let dettagli;
      try { dettagli = await PokeAPI.getMossa(voce.nome, voce.url); }
      catch (e) { continue; }
      if (!dettagli.potenza) continue; // per ora solo mosse offensive

      if (ist.mosse.length < 4) {
        ist.mosse.push({ ...dettagli, pp: dettagli.ppMax });
        await di(`${ist.nome} impara ${dettagli.nomeIt}!`);
      } else {
        await di(`${ist.nome} vorrebbe imparare ${dettagli.nomeIt}, ma conosce già 4 mosse.`);
      }
    }
  }

  // Evoluzione per livello (F6): se la specie si evolve a questo
  // livello (o prima), il Pokémon si trasforma mantenendo mosse ed EXP.
  async function controllaEvoluzione(ist) {
    try {
      if (ist.felicita != null) ist.felicita = Math.min(255, ist.felicita + 5);  // sale coi livelli
      const evo = trovaEvoluzioneAuto(ist);
      if (!evo) return;

      await di(`Cosa?! ${ist.nome} si sta evolvendo!`);
      const vecchioNome = ist.nome;
      await evolviIstanza(ist, evo.idEvo);
      aggiornaSprite();
      aggiornaPannelli();
      await di(`🎉 ${vecchioNome} si è evoluto in ${ist.nome}!`);
    } catch (err) {
      // Se la rete fallisce non blocchiamo la battaglia: l'evoluzione
      // verrà ritentata al prossimo level-up.
      console.warn('[Battle] Controllo evoluzione saltato:', err.message);
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
      if (typeof segnaPokedex === 'function') {
        segnaPokedex(nemico.id, nemico.nome, nemico.sprite && nemico.sprite.fronte, true);
      }
      await di(`Gotcha! ${nemico.nome} è stato catturato! 🎉`);
      if (statoGioco.squadra.length < 6) {
        statoGioco.squadra.push(nemico);
        await di(`${nemico.nome} si unisce alla squadra!`);
      } else {
        depositaInBox(nemico);
        await di(`La squadra è al completo: ${nemico.nome} è stato inviato al Box.`);
      }
      fineBattaglia('cattura');
    } else {
      await animaCatturaFallita(ball);
      await di(`Oh no! ${nemico.nome} si è liberato!`);
      await turnoNemicoEFine();
    }
  }

  async function usaPozione(chiave) {
    if (mio.hpAttuale >= mio.hpMax) {
      await di(`Gli HP di ${mio.nome} sono già al massimo!`);
      mostraMenuZaino();
      return;
    }
    nascondiMenu();
    statoGioco.zaino[chiave] -= 1;
    const cura = Math.min(OGGETTI[chiave].cura, mio.hpMax - mio.hpAttuale);
    mio.hpAttuale += cura;
    aggiornaPannelli();
    await di(`${mio.nome} recupera ${cura} HP! 🧪`);

    // Usare un oggetto consuma il turno: il nemico attacca
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
    indiceAttivo = idx;
    mio = statoGioco.squadra[idx];
    azzeraModificatori(mio); // gli sbalzi di statistica si resettano al cambio
    mio.inCarica = null; mio.deveRicaricare = false; // il cambio annulla carica/ricarica
    mio.furia = null; mio.confusione = 0; mio.protetto = false; mio.protConsecutivi = 0; // MOD 6B
    aggiornaSprite(true);
    aggiornaPannelli();
    await animaEntrataPokemon('giocatore');
    await di(`Vai! ${mio.nome}!`);

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

    // Più sei veloce del nemico, più è facile scappare
    let prob = 0.55 + (mio.velocita - nemico.velocita) / 150;
    prob = Math.min(0.95, Math.max(0.25, prob));

    if (Math.random() < prob) {
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

    // EXP: formula vera dei giochi (Gen 1-4), baseExp*livello/7, +50% contro
    // allenatori. Il moltiplicatore "+50% per medaglia" qui sotto (rimosso
    // sess. 12 set 2026, segnalato da Luca con un confronto diretto: "un
    // pokemon al 75 con Lucky Egg mi dava 5.5k, qui un 42 ne dava 15k") era
    // sproporzionato: con 8 medaglie diventava un ×5 aggiuntivo, che sommato
    // al bonus allenatore portava l'EXP a quasi 10 volte il valore reale.
    let exp = Math.max(10, Math.floor(nemico.baseExp * nemico.livello / 7));
    if (modalita === 'allenatore') exp = Math.floor(exp * 1.5);
    await assegnaExp(mio, exp);

    // L'allenatore manda in campo il prossimo Pokémon, se ne ha ancora
    if (modalita === 'allenatore' && indiceNemico < squadraNemica.length - 1) {
      indiceNemico += 1;
      nemico = squadraNemica[indiceNemico];
      aggiornaSprite(true);
      aggiornaPannelli();
      await animaEntrataPokemon('nemico');
      const rimasti = squadraNemica.length - indiceNemico;
      await di(`${datiAllenatore.nome} manda in campo ${nemico.nome}! (gliene restano ${rimasti})`);
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
    }
    fineBattaglia('vittoria');
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
    } else {
      // C'è ancora qualcuno: scelta obbligatoria del sostituto
      mostraMenuSquadra(true);
    }
  }

  function fineBattaglia(esito) {
    inCorso = false;
    $('schermata-battaglia').classList.add('nascosto');
    if (onFine) onFine(esito);
  }

  /* ==========================================================
     CARAMELLA RARA (modalità test): +1 livello fuori battaglia.
     Replica il level-up di battaglia (statistiche, nuove mosse,
     evoluzione) ma senza interfaccia: restituisce i messaggi
     da mostrare, ci pensa app.js a visualizzarli.
     ========================================================== */

  async function caramellaRara(ist, levelCap) {
    if (ist.livello >= levelCap) {
      return { ok: false, messaggi: [`⛔ ${ist.nome} è già al level cap (Lv.${levelCap}): serve la prossima medaglia!`] };
    }

    const messaggi = [];
    ist.livello += 1;
    ist.exp = Math.max(ist.exp, Math.pow(ist.livello, 3));
    const vecchioHpMax = ist.hpMax;
    ricalcolaStatistiche(ist);
    ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - vecchioHpMax));
    messaggi.push(`✨ ${ist.nome} sale al livello ${ist.livello}!`);

    // Nuove mosse imparate a questo livello
    const nuove = (ist.mosseImparabili || []).filter(m => m.livello === ist.livello);
    for (const voce of nuove) {
      if (ist.mosse.some(s => s.nome === voce.nome)) continue;
      let dettagli;
      try { dettagli = await PokeAPI.getMossa(voce.nome, voce.url); }
      catch (e) { continue; }
      if (!dettagli.potenza) continue;
      if (ist.mosse.length < 4) {
        ist.mosse.push({ ...dettagli, pp: dettagli.ppMax });
        messaggi.push(`${ist.nome} impara ${dettagli.nomeIt}!`);
      } else {
        messaggi.push(`${ist.nome} vorrebbe imparare ${dettagli.nomeIt}, ma conosce già 4 mosse.`);
      }
    }

    // Evoluzione per livello/felicità (EVOLUZIONI_DB)
    try {
      if (ist.felicita != null) ist.felicita = Math.min(255, ist.felicita + 5);
      const evo = trovaEvoluzioneAuto(ist);
      if (evo) {
        const vecchioNome = ist.nome;
        await evolviIstanza(ist, evo.idEvo);
        messaggi.push(`🎉 ${vecchioNome} si è evoluto in ${ist.nome}!`);
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
  // #battaglia-schermo resta SEMPRE 512x384px "veri" (vedi style.css): qui si
  // calcola solo un transform:scale() per adattarlo allo spazio disponibile,
  // "il più grande possibile dentro #battaglia-campo senza deformarsi" (stile
  // emulatore). PRIMA si ridimensionava il box stesso (width/height dirette)
  // — sbagliato: i pannelli/barre HP dentro usano coordinate in pixel assoluti
  // (.pannello-info, .hp-binario…) tarate su un box realmente largo 512px, e
  // ridurre solo il CONTENITORE senza scalare anche LORO li faceva restare
  // "veri" 520px dentro un box magari largo 390px su telefono: sovrapposti e
  // tagliati (bug segnalato da Luca su iPhone, verticale e orizzontale).
  // transform:scale() invece scala TUTTO insieme (box + figli), proporzioni
  // sempre coerenti a qualunque dimensione schermo.
  function _dimensionaSchermoBattaglia() {
    const campo = $('battaglia-campo');
    const schermo = $('battaglia-schermo');
    if (!campo || !schermo) return;
    const availW = campo.clientWidth, availH = campo.clientHeight;
    const scala = Math.min(availW / 512, availH / 384);
    schermo.style.transform = `scale(${scala})`;
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
    // l'originale ha proporzioni diverse tra le due piattaforme). Scala
    // proporzionale alla larghezza reale del campo rispetto ai 512px nativi
    // di Essentials (Settings::SCREEN_WIDTH), così la resa resta coerente
    // qualunque sia la dimensione dello schermo del giocatore.
    const campoRect = campo ? campo.getBoundingClientRect() : { width: 512 };
    const scala = campoRect.width / 512;
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
    // Dimensioni sprite Pokémon proporzionate allo schermo nativo 512x384
    // (fronte nemico ~128px, dorso giocatore ~160px a scala 1): prima erano
    // px fissi (320/380) tarati per riempire l'intero viewport, enormi ora
    // che lo schermo è limitato al rapporto nativo (bug "battleback troppo
    // grandi" segnalato da Luca).
    if (spriteNemico) {
      spriteNemico.style.width = (128 * scala) + 'px';
      spriteNemico.style.height = (128 * scala) + 'px';
    }
    if (spriteGiocatore) {
      spriteGiocatore.style.width = (160 * scala) + 'px';
      spriteGiocatore.style.height = (160 * scala) + 'px';
    }
    if (piattaformaNemico) {
      const w = 256 * scala, h = 128 * scala;
      piattaformaNemico.style.background = 'none';
      piattaformaNemico.style.backgroundImage = `url('${cartella}${tema}_base1.png')`;
      piattaformaNemico.style.backgroundSize = 'contain';
      piattaformaNemico.style.backgroundRepeat = 'no-repeat';
      piattaformaNemico.style.backgroundPosition = 'center';
      piattaformaNemico.style.transform = '';
      piattaformaNemico.style.width = w + 'px';
      piattaformaNemico.style.height = h + 'px';
      piattaformaNemico.style.marginTop = (-(128 * scala) * 0.85) + 'px';
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
    fuggireImpossibile = opzioni.fuggireImpossibile || false;
    // Difesa: se la lotta precedente era in doppia e per qualunque motivo
    // fineBattagliaDoppia() non ha ripulito lo stato, modoDoppia restava
    // "true" — con quel flag agganciato, aggiornaPannelli()/aggiornaSprite()
    // richiamano SEMPRE le varianti doppia (che leggono doppiaNemiciAttivi/
    // doppiaMieiAttivi, qui vuoti): sprite/HP/sfondo sparivano del tutto in
    // una lotta singola dopo una doppia (bug del boss dell'Osservatorio,
    // sess. 18 set 2026 — non bastava solo la classe CSS "doppia", andava
    // anche il flag). Una lotta singola parte SEMPRE pulita da questo stato.
    modoDoppia = false;
    collegaUI();

    // Meteo di mappa ereditato in battaglia (come nei giochi originali): se
    // stava piovendo/splendeva il sole/grandinava fuori, la lotta comincia
    // già con quel meteo attivo, "permanente" per tutta la battaglia.
    const meteoMappa = statoGioco && statoGioco.meteo ? statoGioco.meteo.tipo : null;
    meteoBattaglia = METEO_DA_MAPPA[meteoMappa] || null;
    meteoBattagliaTurni = meteoBattaglia ? 998 : 0;
    aggiornaMeteoUI();
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
    mio.inCarica = null; mio.deveRicaricare = false; // niente carica/ricarica residue
    mio.furia = null; mio.confusione = 0; mio.protetto = false; mio.protConsecutivi = 0; // MOD 6B: stati volatili freschi

    // Mostriamo subito la schermata con un messaggio di caricamento
    nascondiMenu();
    $('schermata-battaglia').classList.remove('nascosto');
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
        for (const voce of datiAllenatore.squadra) {
          squadraNemica.push(await creaIstanza(voce.id, voce.livello));
        }
        indiceNemico = 0;
        nemico = squadraNemica[0];
      } else {
        nemico = await creaIstanza(opzioni.idPokemon, opzioni.livello);
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
        $('nemico-sprite' + suf).src = n.sprite.fronte || '';
        applicaOffsetSpecie($('nemico-sprite' + suf), n.id, 'front');
      } else {
        $('nemico-sprite' + suf).src = '';
      }
      const m = doppiaMieiAttivi[i];
      if (m) {
        $('giocatore-sprite' + suf).src = m.sprite.retro || m.sprite.fronte || '';
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

  function mostraMenuMosseDoppia(slot) {
    nascondiMenu();
    const m = doppiaMieiAttivi[slot];
    const menu = $('menu-mosse');
    menu.innerHTML = '';
    const tutteScariche = m.mosse.every(x => x.pp <= 0);
    for (const mossa of m.mosse) {
      const btn = document.createElement('button');
      btn.className = 'btn-mossa';
      btn.innerHTML =
        `<span class="mossa-nome">${mossa.nomeIt}</span>` +
        `<span class="tipo-badge" style="background:${TIPO_COLORI[mossa.tipo] || '#888'}">${TIPO_NOMI[mossa.tipo] || mossa.tipo}</span>` +
        `<span class="mossa-pp">PP ${mossa.pp}/${mossa.ppMax}</span>`;
      btn.disabled = mossa.pp <= 0;
      btn.addEventListener('click', () => _doppiaSceltaMossa(slot, mossa));
      menu.appendChild(btn);
    }
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
    resetCursore();
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
        if (oggetto.categoria === 'cura') _doppiaUsaPozione(slot, chiave);
        else _doppiaUsaXItem(slot, chiave);
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

  async function _doppiaUsaPozione(slot, chiave) {
    const m = doppiaMieiAttivi[slot];
    if (m.hpAttuale >= m.hpMax) {
      await di(`Gli HP di ${m.nome} sono già al massimo!`);
      mostraMenuZainoDoppia(slot);
      return;
    }
    nascondiMenu();
    statoGioco.zaino[chiave] -= 1;
    const cura = Math.min(OGGETTI[chiave].cura, m.hpMax - m.hpAttuale);
    m.hpAttuale += cura;
    aggiornaPannelli();
    await di(`${m.nome} recupera ${cura} HP! 🧪`);
    _doppiaSceltaAzione(slot, { tipo: 'nessuna' });
  }

  async function _doppiaUsaXItem(slot, chiave) {
    const m = doppiaMieiAttivi[slot];
    nascondiMenu();
    statoGioco.zaino[chiave] -= 1;
    const stat = OGGETTI[chiave].stat;
    const nome = STAT_NOMI[stat] || stat;
    const prima = m.mod[stat] || 0;
    m.mod[stat] = Math.max(-6, Math.min(6, prima + 1));
    aggiornaPannelli();
    if (m.mod[stat] === prima) await di(`${nome} di ${m.nome} non può aumentare ancora!`);
    else await di(`${nome} di ${m.nome} è aumentato! ${OGGETTI[chiave].icona}`);
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
    nuovo.inCarica = null; nuovo.deveRicaricare = false;
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
      const mossa = sceglieMossaCasuale(n);
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
    if (meteoBattaglia === 'sandstorm' || meteoBattaglia === 'hail') {
      const nomeMeteo = meteoBattaglia === 'sandstorm' ? 'tempesta di sabbia' : 'grandine';
      const tutti = [...doppiaMieiAttivi, ...doppiaNemiciAttivi].filter(x => x && x.hpAttuale > 0);
      for (const ist of tutti) {
        const immune = meteoBattaglia === 'sandstorm'
          ? (ist.tipi.includes('rock') || ist.tipi.includes('ground') || ist.tipi.includes('steel'))
          : ist.tipi.includes('ice');
        if (immune) continue;
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
      if (!ist.condizione) continue;
      if (ist.condizione.tipo === 'poison' || ist.condizione.tipo === 'burn') {
        const danno = Math.max(1, Math.floor(ist.hpMax / 8));
        ist.hpAttuale = Math.max(0, ist.hpAttuale - danno);
        lampeggia(ist);
        aggiornaPannelli();
        const causa = ist.condizione.tipo === 'poison' ? 'dal veleno' : 'dalla scottatura';
        await di(`${etichettaDi(ist)} è tormentato ${causa}!`);
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
  }

  /* ---------- KO, sostituzioni, EXP, fine lotta ---------- */

  async function _doppiaExpKO(n) {
    const vincitore = (n._datoDaMe && n._datoDaMe.hpAttuale > 0)
      ? n._datoDaMe
      : doppiaMieiAttivi.find(m => m && m.hpAttuale > 0);
    if (!vincitore) return;
    // Stessa formula corretta del 1v1 (vedi nemicoSconfitto): baseExp*livello/7,
    // ×1.5 perché in doppia è sempre lotta tra allenatori. Niente moltiplicatore
    // per medaglia (rimosso, era sproporzionato — vedi commento in nemicoSconfitto).
    let exp = Math.max(10, Math.floor(n.baseExp * n.livello / 7));
    exp = Math.floor(exp * 1.5);
    await assegnaExp(vincitore, exp);
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
    $('schermata-battaglia').classList.add('nascosto');
    $('schermata-battaglia').classList.remove('doppia');
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
    statoGioco = opzioni.stato;
    doppiaOnFine = opzioni.onFine || null;
    doppiaAllenatori = opzioni.allenatori;
    collegaUI();

    const meteoMappa = statoGioco && statoGioco.meteo ? statoGioco.meteo.tipo : null;
    meteoBattaglia = METEO_DA_MAPPA[meteoMappa] || null;
    meteoBattagliaTurni = meteoBattaglia ? 998 : 0;
    aggiornaMeteoUI();
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
      m.inCarica = null; m.deveRicaricare = false;
      m.furia = null; m.confusione = 0; m.protetto = false; m.protConsecutivi = 0;
      _registraSlotDoppia(m, 'giocatore', i);
    });

    nascondiMenu();
    $('schermata-battaglia').classList.remove('nascosto');
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
        for (const voce of all.squadra) istanze.push(await creaIstanza(voce.id, voce.livello));
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
          for (const voce of all.squadra) istanze.push(await creaIstanza(voce.id, voce.livello));
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
  };

})();
