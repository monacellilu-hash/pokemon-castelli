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

  // Crea un'istanza completa di un Pokémon (scarica i dati se servono)
  async function creaIstanza(id, livello) {
    const dati = await PokeAPI.getPokemon(id);
    const ist = {
      id: dati.id,
      nome: nomeBello(dati.nome),
      tipi: dati.tipi,
      sprite: dati.sprite,
      baseExp: dati.baseExp || 64,
      basi: dati.statistiche,
      livello: livello,
      exp: Math.pow(livello, 3),       // curva di crescita: Lv^3
      mosse: await scegliMosse(dati, livello),
      mosseImparabili: dati.mosse,     // lista specie: serve per i level-up futuri
      condizione: null,                // stato alterato: null | { tipo, turni }
      mod: modificatoriAzzerati(),     // sbalzi di statistica (-6..+6)
    };
    ricalcolaStatistiche(ist);
    ist.hpAttuale = ist.hpMax;
    return ist;
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

  function calcolaDanno(attaccante, difensore, mossa) {
    const eff = efficacia(mossa.tipo, difensore.tipi);
    if (eff === 0) return { danno: 0, eff: 0 };

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

    let danno = Math.floor((2 * attaccante.livello / 5 + 2) * mossa.potenza * A / D / 50) + 2;

    // STAB: bonus se la mossa è dello stesso tipo dell'attaccante
    if (attaccante.tipi.includes(mossa.tipo)) danno = Math.floor(danno * 1.5);

    danno = Math.floor(danno * eff);
    danno = Math.floor(danno * (0.85 + Math.random() * 0.15)); // variazione casuale
    return { danno: Math.max(1, danno), eff };
  }

  /* ==========================================================
     INTERFACCIA: messaggi, barre HP, sprite
     ========================================================== */

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
      const timer = setTimeout(avanti, 1700 / velocita);
      el.addEventListener('click', avanti);
    });
  }

  // Aggiorna una barra HP (larghezza + colore verde/giallo/rosso)
  function aggiornaBarraHp(idBarra, hpAttuale, hpMax) {
    const barra = $(idBarra);
    const pct = Math.max(0, Math.min(100, hpAttuale / hpMax * 100));
    barra.style.width = pct + '%';
    barra.classList.remove('gialla', 'rossa');
    if (pct <= 20) barra.classList.add('rossa');
    else if (pct <= 50) barra.classList.add('gialla');
  }

  // Aggiorna tutti i pannelli informativi (nomi, livelli, HP, EXP)
  function aggiornaPannelli() {
    // Nemico (col tag dello stato alterato, es. " [PAR]")
    $('nemico-nome').textContent = nemico.nome + siglaCondizione(nemico);
    $('nemico-lv').textContent = 'Lv.' + nemico.livello;
    aggiornaBarraHp('nemico-hp', nemico.hpAttuale, nemico.hpMax);

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
  function aggiornaSprite() {
    $('nemico-sprite').src = nemico.sprite.fronte || '';
    $('giocatore-sprite').src = mio.sprite.retro || mio.sprite.fronte || '';
  }

  // Fa lampeggiare lo sprite colpito
  function lampeggia(chi) {
    const el = $(chi === nemico ? 'nemico-sprite' : 'giocatore-sprite');
    el.classList.remove('colpito');
    void el.offsetWidth; // trucco per riavviare l'animazione CSS
    el.classList.add('colpito');
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
    $('battaglia-messaggio').textContent = `Cosa deve fare ${mio.nome}?`;
    $('menu-principale').classList.remove('nascosto');
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
  }

  function mostraMenuZaino() {
    nascondiMenu();
    const menu = $('menu-zaino');
    menu.innerHTML = '';

    // In battaglia si usano solo Ball e Pozioni, e solo se se ne possiede
    let almenoUno = false;
    for (const [chiave, oggetto] of Object.entries(OGGETTI)) {
      if (oggetto.categoria !== 'ball' && oggetto.categoria !== 'cura') continue;
      const quanti = statoGioco.zaino[chiave] || 0;
      if (quanti <= 0) continue;
      almenoUno = true;
      const btn = document.createElement('button');
      btn.innerHTML = `${oggetto.icona} ${oggetto.nome} <span class="mossa-pp">×${quanti}</span>`;
      btn.addEventListener('click', () => {
        if (oggetto.categoria === 'ball') tentaCattura(chiave);
        else if (oggetto.categoria === 'cura') usaPozione(chiave);
      });
      menu.appendChild(btn);
    }

    if (!almenoUno) {
      const vuoto = document.createElement('button');
      vuoto.className = 'btn-mossa';
      vuoto.disabled = true;
      vuoto.innerHTML = '<span class="mossa-nome">Zaino vuoto (Ball/Pozioni)</span>';
      menu.appendChild(vuoto);
    }

    menu.appendChild(bottoneIndietro());
    menu.classList.remove('nascosto');
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
  }

  function bottoneIndietro() {
    const btn = document.createElement('button');
    btn.className = 'btn-indietro';
    btn.textContent = '↩ Indietro';
    btn.addEventListener('click', mostraMenuPrincipale);
    return btn;
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
        await di(`${nome} di ${etich} ${c.modifica >= 2 ? 'è aumentato molto!' : 'è aumentato!'}`);
      } else {
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
    const soglia = mossa.precisione * (acc / eva);
    return Math.random() * 100 <= soglia;
  }

  // Esegue una singola mossa di "att" contro "dif".
  // Gestisce PP, precisione, danno+efficacia (offensive), stati ed
  // effetti statistici (mosse di stato pure e secondari delle offensive).
  async function eseguiMossa(att, dif, mossa, etichettaAtt, etichettaDif) {
    if (mossa.pp !== undefined && mossa.pp < 900) mossa.pp = Math.max(0, mossa.pp - 1);
    await di(`${etichettaAtt} usa ${mossa.nomeIt}!`);

    if (!colpisce(att, dif, mossa)) {
      await di('...ma il colpo è andato a vuoto!');
      return;
    }

    // --- MOSSA OFFENSIVA (ha potenza) ---
    if (mossa.potenza && mossa.potenza > 0) {
      const { danno, eff } = calcolaDanno(att, dif, mossa);
      if (eff === 0) {
        await di(`Non ha alcun effetto su ${etichettaDif}!`);
        return;
      }
      dif.hpAttuale = Math.max(0, dif.hpAttuale - danno);
      lampeggia(dif);
      aggiornaPannelli();
      if (eff > 1) await di('È superefficace!');
      else if (eff < 1) await di('Non è molto efficace...');

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
    if (mossa.statoEffetto && STATI[mossa.statoEffetto]) {
      qualcosa = true;
      // Per le mosse di stato pure la probabilità API è 0 = effetto garantito
      const prob = mossa.statoProbabilita > 0 ? mossa.statoProbabilita : 100;
      if (Math.random() * 100 < prob) await applicaStato(dif, mossa.statoEffetto, etichettaDif);
      else await di('...ma non ha funzionato!');
    }
    if (mossa.cambiStat && mossa.cambiStat.length > 0) {
      qualcosa = true;
      await applicaCambiStat(att, dif, mossa, etichettaAtt, etichettaDif);
    }
    if (!qualcosa) await di('...ma non succede nulla!');
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

  // Un "turno" di un combattente: prima controlla se può agire, poi esegue la mossa
  async function eseguiTurno(att, dif, mossa, etichettaAtt, etichettaDif) {
    if (!(await puoAgire(att, etichettaAtt))) return;
    await eseguiMossa(att, dif, mossa, etichettaAtt, etichettaDif);
  }

  // Danni di fine turno da veleno e scottatura (1/8 degli HP massimi)
  async function fineTurnoStati() {
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
  }

  // Il nemico sceglie una mossa a caso tra quelle con PP
  function scegliMossaNemico() {
    const utilizzabili = nemico.mosse.filter(m => m.pp > 0);
    return utilizzabili.length
      ? utilizzabili[Math.floor(Math.random() * utilizzabili.length)]
      : mossaFallback();
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

    let mioPrima;
    if (prioMia !== prioNem) mioPrima = prioMia > prioNem;
    else mioPrima = velocitaEffettiva(mio) >= velocitaEffettiva(nemico);

    const etNem = etichettaNemico();

    if (mioPrima) {
      await eseguiTurno(mio, nemico, mossaMia, mio.nome, etNem);
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
      await eseguiTurno(nemico, mio, mossaNemico, etNem, mio.nome);
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
    } else {
      await eseguiTurno(nemico, mio, mossaNemico, etNem, mio.nome);
      if (mio.hpAttuale <= 0) { await gestisciKO(); return; }
      await eseguiTurno(mio, nemico, mossaMia, mio.nome, etNem);
      if (nemico.hpAttuale <= 0) { await nemicoSconfitto(); return; }
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
      const evo = await PokeAPI.getEvoluzione(ist.id);
      if (!evo || evo.nessuna || ist.livello < evo.livello) return;

      await di(`Cosa?! ${ist.nome} si sta evolvendo!`);

      const dati = await PokeAPI.getPokemon(evo.id);
      const vecchioNome = ist.nome;
      const vecchioHpMax = ist.hpMax;

      // Cambia la specie: id, nome, tipi, sprite, statistiche base
      ist.id = dati.id;
      ist.nome = nomeBello(dati.nome);
      ist.tipi = dati.tipi;
      ist.sprite = dati.sprite;
      ist.basi = dati.statistiche;
      ist.baseExp = dati.baseExp || ist.baseExp;
      ist.mosseImparabili = dati.mosse;

      // Statistiche ricalcolate; gli HP crescono della differenza
      ricalcolaStatistiche(ist);
      ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - vecchioHpMax));

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

    // Formula semplificata: più il nemico è ferito, più è facile catturarlo
    const pctHp = nemico.hpAttuale / nemico.hpMax;
    let prob = (0.25 + 0.55 * (1 - pctHp)) * OGGETTI[chiaveBall].bonus;
    prob = Math.min(0.90, Math.max(0.05, prob));

    await di('La Ball oscilla...');
    await di('...oscilla ancora...');

    if (Math.random() < prob) {
      await di(`Gotcha! ${nemico.nome} è stato catturato! 🎉`);
      if (statoGioco.squadra.length < 6) {
        statoGioco.squadra.push(nemico);
        await di(`${nemico.nome} si unisce alla squadra!`);
      } else {
        statoGioco.box.push(nemico);
        await di(`La squadra è al completo: ${nemico.nome} è stato inviato al Box.`);
      }
      fineBattaglia('cattura');
    } else {
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

  async function cambiaPokemon(idx, eraObbligatorio) {
    nascondiMenu();
    indiceAttivo = idx;
    mio = statoGioco.squadra[idx];
    azzeraModificatori(mio); // gli sbalzi di statistica si resettano al cambio
    aggiornaSprite();
    aggiornaPannelli();
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

    // EXP: contro gli allenatori si guadagna il 50% in più (come nei giochi).
    // EXP scalato (F8): +50% per ogni medaglia, così i livelli alti non
    // richiedono ore di allenamento.
    let exp = Math.max(1, Math.floor(nemico.baseExp * nemico.livello / 7));
    if (modalita === 'allenatore') exp = Math.floor(exp * 1.5);
    const medaglie = (statoGioco.medaglie && statoGioco.medaglie.length) || 0;
    exp = Math.floor(exp * (1 + 0.5 * medaglie));
    await assegnaExp(mio, exp);

    // L'allenatore manda in campo il prossimo Pokémon, se ne ha ancora
    if (modalita === 'allenatore' && indiceNemico < squadraNemica.length - 1) {
      indiceNemico += 1;
      nemico = squadraNemica[indiceNemico];
      aggiornaSprite();
      aggiornaPannelli();
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
        statoGioco.soldi = (statoGioco.soldi || 0) + datiAllenatore.premioSoldi;
        await di(`Hai ricevuto ₽${datiAllenatore.premioSoldi} per la vittoria!`);
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

    // Evoluzione per livello
    try {
      const evo = await PokeAPI.getEvoluzione(ist.id);
      if (evo && !evo.nessuna && ist.livello >= evo.livello) {
        const dati = await PokeAPI.getPokemon(evo.id);
        const vecchioNome = ist.nome;
        const hpMaxPre = ist.hpMax;
        ist.id = dati.id;
        ist.nome = nomeBello(dati.nome);
        ist.tipi = dati.tipi;
        ist.sprite = dati.sprite;
        ist.basi = dati.statistiche;
        ist.baseExp = dati.baseExp || ist.baseExp;
        ist.mosseImparabili = dati.mosse;
        ricalcolaStatistiche(ist);
        ist.hpAttuale = Math.min(ist.hpMax, ist.hpAttuale + (ist.hpMax - hpMaxPre));
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
    $('btn-attacca').addEventListener('click', mostraMenuMosse);
    $('btn-pokemon').addEventListener('click', () => mostraMenuSquadra(false));
    $('btn-zaino').addEventListener('click', mostraMenuZaino);
    $('btn-fuga').addEventListener('click', tentaFuga);
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
    collegaUI();

    // Il primo Pokémon non-KO della squadra scende in campo
    indiceAttivo = statoGioco.squadra.findIndex(p => p.hpAttuale > 0);
    if (indiceAttivo < 0) { // non dovrebbe accadere: difesa extra
      inCorso = false;
      if (onFine) onFine('errore');
      return;
    }
    mio = statoGioco.squadra[indiceAttivo];
    azzeraModificatori(mio); // sbalzi di statistica freschi a inizio lotta

    // Mostriamo subito la schermata con un messaggio di caricamento
    nascondiMenu();
    $('schermata-battaglia').classList.remove('nascosto');
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

    aggiornaSprite();
    aggiornaPannelli();

    if (modalita === 'allenatore') {
      await di(`${datiAllenatore.nome} vuole lottare! (${squadraNemica.length} Pokémon)`);
      await di(`${datiAllenatore.nome} manda in campo ${nemico.nome}!`);
    } else {
      await di(`Un ${nemico.nome} selvatico appare! (Lv.${nemico.livello})`);
    }
    await di(`Vai! ${mio.nome}!`);
    mostraMenuPrincipale();
  }

  // Funzioni pubbliche del modulo
  return { avvia, creaIstanza, caramellaRara };

})();
