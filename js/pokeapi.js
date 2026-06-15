/* ============================================================
   pokeapi.js — Accesso a PokéAPI (https://pokeapi.co) con cache
   REGOLE:
   - Solo Pokémon con ID da 1 a 386 (Generazioni 1–3).
   - Ogni risposta viene salvata in localStorage al primo fetch:
     le volte successive si legge dalla cache, MAI di nuovo dall'API
     (rispettiamo la fair-use policy di PokéAPI).
   - Salviamo solo i dati che servono al gioco (versione "snella"),
     perché localStorage ha un limite di circa 5 MB.
   ============================================================ */

const PokeAPI = (function () {

  const BASE_URL = "https://pokeapi.co/api/v2";
  const ID_MIN = 1;
  const ID_MAX = 386; // limite rigoroso: Gen 1–3 (scelta di design, vedi CLAUDE.md)
  const PREFISSO_CACHE = "pkc_cache_"; // prefisso delle chiavi in localStorage

  // ---- Funzioni di cache (localStorage) ----

  // Legge un valore dalla cache. Restituisce null se non c'è.
  function leggiCache(chiave) {
    try {
      const testo = localStorage.getItem(PREFISSO_CACHE + chiave);
      return testo ? JSON.parse(testo) : null;
    } catch (e) {
      return null; // cache corrotta o non disponibile: si rifarà il fetch
    }
  }

  // Scrive un valore in cache.
  function scriviCache(chiave, valore) {
    try {
      localStorage.setItem(PREFISSO_CACHE + chiave, JSON.stringify(valore));
    } catch (e) {
      // localStorage pieno: il gioco funziona lo stesso, solo senza cache
      console.warn("[PokeAPI] Impossibile salvare in cache:", e.message);
    }
  }

  // ---- Riduzione dei dati: teniamo solo ciò che serve ----

  // Da una risposta completa di /pokemon/{id} estraiamo i campi utili.
  function riduciPokemon(dati) {
    return {
      id: dati.id,
      nome: dati.name,
      // Esperienza base: serve in battaglia (F5) per calcolare l'EXP guadagnata
      baseExp: dati.base_experience || 64,
      // Tipi: array di stringhe, es. ["grass", "poison"]
      tipi: dati.types.map(t => t.type.name),
      // Statistiche base: { hp, attack, defense, special-attack, special-defense, speed }
      statistiche: Object.fromEntries(
        dati.stats.map(s => [s.stat.name, s.base_stat])
      ),
      // Sprite fronte (avversario) e retro (proprio Pokémon in battaglia)
      sprite: {
        fronte: dati.sprites.front_default,
        retro: dati.sprites.back_default
      },
      // Mosse imparate salendo di livello: [{ nome, url, livello }] ordinate per livello.
      // Servirà in battaglia (F5) per scegliere le 4 mosse del Pokémon.
      mosse: estraiMosseLivello(dati.moves)
    };
  }

  // Estrae le mosse apprese per livello ("level-up"), col livello più basso
  // tra le varie versioni di gioco in cui compaiono.
  function estraiMosseLivello(mosse) {
    const risultato = [];
    for (const voce of mosse) {
      let livelloMinimo = null;
      for (const dettaglio of voce.version_group_details) {
        if (dettaglio.move_learn_method.name === "level-up") {
          const lv = dettaglio.level_learned_at;
          if (livelloMinimo === null || lv < livelloMinimo) livelloMinimo = lv;
        }
      }
      if (livelloMinimo !== null) {
        risultato.push({
          nome: voce.move.name,
          url: voce.move.url,
          livello: livelloMinimo
        });
      }
    }
    // Ordiniamo per livello di apprendimento crescente
    risultato.sort((a, b) => a.livello - b.livello);
    return risultato;
  }

  // ---- Funzione principale: scarica (o legge da cache) un Pokémon ----

  // Restituisce una Promise con i dati "snelli" del Pokémon richiesto.
  // Esempio d'uso:  const pika = await PokeAPI.getPokemon(25);
  async function getPokemon(id) {
    // Controllo del limite Gen 1–5
    if (!Number.isInteger(id) || id < ID_MIN || id > ID_MAX) {
      throw new Error(`[PokeAPI] ID ${id} non valido: ammessi solo ID da ${ID_MIN} a ${ID_MAX} (Gen 1-3).`);
    }

    // 1) Proviamo prima la cache.
    // Se la voce in cache è "vecchia" (senza baseExp, aggiunto in F5),
    // la ignoriamo e riscarichiamo: così la cache si aggiorna da sola.
    const inCache = leggiCache("pokemon_" + id);
    if (inCache && inCache.baseExp !== undefined) {
      console.log(`[PokeAPI] Pokémon #${id} (${inCache.nome}) letto dalla CACHE ✔`);
      return inCache;
    }

    // 2) Non in cache: fetch dall'API
    console.log(`[PokeAPI] Pokémon #${id} non in cache: lo scarico dall'API...`);
    const risposta = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!risposta.ok) {
      throw new Error(`[PokeAPI] Errore HTTP ${risposta.status} per il Pokémon #${id}`);
    }
    const datiCompleti = await risposta.json();

    // 3) Riduciamo i dati e salviamo in cache per le prossime volte
    const datiSnelli = riduciPokemon(datiCompleti);
    scriviCache("pokemon_" + id, datiSnelli);
    console.log(`[PokeAPI] Pokémon #${id} (${datiSnelli.nome}) scaricato e salvato in cache ✔`);
    return datiSnelli;
  }

  // ---- Mosse: dettagli di una singola mossa (con cache) ----

  // Da una risposta completa di /move/{nome} estraiamo i campi utili.
  function riduciMossa(dati) {
    // Cerchiamo il nome italiano della mossa (PokéAPI lo fornisce!)
    const vocePerLingua = (dati.names || []).find(n => n.language.name === "it");
    const nomeIt = vocePerLingua
      ? vocePerLingua.name
      : dati.name.charAt(0).toUpperCase() + dati.name.slice(1);

    const meta = dati.meta || {};

    return {
      nome: dati.name,                 // nome inglese "tecnico" (chiave)
      nomeIt: nomeIt,                  // nome italiano da mostrare
      tipo: dati.type.name,            // es. "grass"
      classe: dati.damage_class ? dati.damage_class.name : "physical", // physical/special/status
      potenza: dati.power,             // null per le mosse di stato
      precisione: dati.accuracy,       // null = colpisce sempre
      ppMax: dati.pp || 10,
      // --- Campi per gli effetti in battaglia (F: motore mosse) ---
      priorita: dati.priority || 0,    // >0 = colpisce prima (Attacco Rapido ecc.)
      bersaglio: dati.target ? dati.target.name : "selected-pokemon", // "user" = se stesso
      // Effetto di stato inflitto (paralysis, sleep, poison, burn, freeze, confusion…)
      statoEffetto: (meta.ailment && meta.ailment.name && meta.ailment.name !== "none")
        ? meta.ailment.name : null,
      statoProbabilita: meta.ailment_chance || 0, // 0 = effetto garantito (mosse di stato pure)
      // Cambi di statistica: [{ stat: "attack", modifica: +1 }, …]
      cambiStat: (dati.stat_changes || []).map(s => ({ stat: s.stat.name, modifica: s.change })),
      cambiStatProbabilita: meta.stat_chance || 0
    };
  }

  // Restituisce i dettagli di una mossa. Si può passare il nome
  // (es. "tackle") oppure direttamente l'URL fornito da getPokemon.
  // Esempio d'uso:  const m = await PokeAPI.getMossa("tackle");
  async function getMossa(nome, url) {
    // 1) Cache (se "vecchia", cioè senza il campo priorita aggiunto per gli
    //    effetti di stato, la ignoriamo e riscarichiamo: la cache si aggiorna da sola)
    const inCache = leggiCache("mossa_" + nome);
    if (inCache && inCache.priorita !== undefined) return inCache;

    // 2) Fetch dall'API
    const indirizzo = url || `${BASE_URL}/move/${nome}`;
    const risposta = await fetch(indirizzo);
    if (!risposta.ok) {
      throw new Error(`[PokeAPI] Errore HTTP ${risposta.status} per la mossa "${nome}"`);
    }
    const datiCompleti = await risposta.json();

    // 3) Riduzione + cache
    const datiSnelli = riduciMossa(datiCompleti);
    scriviCache("mossa_" + nome, datiSnelli);
    console.log(`[PokeAPI] Mossa "${nome}" scaricata e salvata in cache ✔`);
    return datiSnelli;
  }

  // ---- Evoluzioni: a che livello (e in cosa) si evolve un Pokémon ----

  // Estrae l'ID numerico da un URL PokéAPI (es. ".../pokemon-species/2/" → 2)
  function idDaUrl(url) {
    const pezzi = url.split("/").filter(p => p !== "");
    return parseInt(pezzi[pezzi.length - 1], 10);
  }

  // Restituisce { id, nome, livello } se il Pokémon si evolve salendo
  // di livello, altrimenti { nessuna: true }. Tutto in cache.
  // Nota: per ora gestiamo SOLO le evoluzioni per livello (le evoluzioni
  // con pietre, scambi o amicizia arriveranno più avanti).
  async function getEvoluzione(id) {
    // 1) Cache
    const inCache = leggiCache("evo_" + id);
    if (inCache) return inCache;

    // 2) Specie → URL della catena evolutiva
    const rispostaSpecie = await fetch(`${BASE_URL}/pokemon-species/${id}`);
    if (!rispostaSpecie.ok) {
      throw new Error(`[PokeAPI] Errore HTTP ${rispostaSpecie.status} per la specie #${id}`);
    }
    const specie = await rispostaSpecie.json();

    // 3) Catena evolutiva completa
    const rispostaCatena = await fetch(specie.evolution_chain.url);
    if (!rispostaCatena.ok) {
      throw new Error(`[PokeAPI] Errore HTTP ${rispostaCatena.status} per la catena evolutiva di #${id}`);
    }
    const catena = await rispostaCatena.json();

    // 4) Troviamo il nodo della catena che corrisponde al NOSTRO Pokémon
    function trovaNodo(nodo) {
      if (idDaUrl(nodo.species.url) === id) return nodo;
      for (const figlio of nodo.evolves_to) {
        const trovato = trovaNodo(figlio);
        if (trovato) return trovato;
      }
      return null;
    }
    const nodo = trovaNodo(catena.chain);

    // 5) Cerchiamo un'evoluzione per livello (entro il limite Gen 1-5)
    let risultato = { nessuna: true };
    if (nodo) {
      for (const evoluzione of nodo.evolves_to) {
        const idEvo = idDaUrl(evoluzione.species.url);
        if (idEvo < ID_MIN || idEvo > ID_MAX) continue; // niente Gen 6+
        const dettaglio = (evoluzione.evolution_details || []).find(
          d => d.trigger && d.trigger.name === "level-up" && d.min_level
        );
        if (dettaglio) {
          risultato = {
            id: idEvo,
            nome: evoluzione.species.name,
            livello: dettaglio.min_level
          };
          break;
        }
      }
    }

    scriviCache("evo_" + id, risultato);
    console.log(`[PokeAPI] Evoluzione di #${id}:`,
      risultato.nessuna ? "nessuna (per livello)" : `#${risultato.id} al Lv.${risultato.livello}`);
    return risultato;
  }

  // Svuota tutta la cache PokéAPI (utile per i test).
  // Da console: PokeAPI.svuotaCache()
  function svuotaCache() {
    const daRimuovere = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chiave = localStorage.key(i);
      if (chiave.startsWith(PREFISSO_CACHE)) daRimuovere.push(chiave);
    }
    daRimuovere.forEach(k => localStorage.removeItem(k));
    console.log(`[PokeAPI] Cache svuotata (${daRimuovere.length} voci rimosse).`);
  }

  // Esponiamo solo le funzioni pubbliche del modulo
  return { getPokemon, getMossa, getEvoluzione, svuotaCache };

})();
