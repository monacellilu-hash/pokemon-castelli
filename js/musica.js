/* ============================================================
   musica.js — Musica di sottofondo (richiesta di Luca, 6 ott 2026)

   Un solo elemento <audio> che cambia traccia in base a dove sei
   (città/percorso/dungeon/palestra/centro pokémon) o cosa stai facendo
   (lotta selvatica/allenatore/capopalestra/rivale, vittoria, medaglia).
   Le tracce vengono da Essentials FRLG (uso personale, stesso principio
   degli sprite — vedi CLAUDE.md, vincoli legali).

   ATTENZIONE (6 ott 2026): i file .ogg originali sono enormi (4-5 MB
   l'uno, ~194MB in totale per 43 tracce) — nessun ffmpeg disponibile per
   comprimerli. Finché Luca non decide come procedere (comprimerli lui,
   usarne pochi, o accettare il peso), i file audio potrebbero non essere
   ancora presenti in sprites/audio/ — in quel caso il motore semplicemente
   non riproduce nulla (try/catch silenzioso), nessun errore bloccante.
   ============================================================ */

const Musica = (function () {
  const CARTELLA = 'sprites/audio/';
  let elemento = null;
  let tracciaCorrente = null;
  let tracciaOverworldSospesa = null;   // per tornare al tema giusto dopo una lotta/jingle
  let muto = false;

  const TRACCE = {
    // Battaglie
    battaglia_selvatico:   'Battle (Wild Pokémon).ogg',
    battaglia_allenatore:  'Battle (Trainer).ogg',
    battaglia_capopalestra:'Battle (Gym Leader).ogg',
    battaglia_rivale:      'Final Battle (Rival).ogg',
    vittoria_selvatico:    'Victory (Wild Pokémon).ogg',
    vittoria_allenatore:   'Victory (Trainer).ogg',
    vittoria_capopalestra: 'Victory (Gym Leader).ogg',
    medaglia:              'Obtained a Badge.ogg',
    evoluzione:            'Evolution.ogg',
    // HP critico (22 ott 2026, richiesta esplicita di Luca): nei giochi
    // veri, sotto una certa soglia di HP la musica di lotta CAMBIA in una
    // variante più urgente (non è un effetto sonoro a parte) — qui
    // "Tense Battle.ogg" del pacchetto, suonata al posto di qualsiasi
    // battaglia_* quando l'HP del Pokémon in campo scende in rosso.
    battaglia_critico: 'Tense Battle.ogg',
    // Luoghi generici
    centro_pokemon: 'Pokémon Center.ogg',
    palestra:       'Pokémon Gym.ogg',
    laboratorio:    'Oak Pokémon Lab.ogg',
    // Città (riusate più volte, solo 7 temi città disponibili per ~11 comuni)
    borgata_tuscolana: 'Pallet Town.ogg',
    frascati:          'Pewter City.ogg',
    grottaferrata:     'Cerulean City.ogg',
    marino:            'Vermilion City.ogg',
    monteporzio:       'Celadon City.ogg',
    rocca_di_papa:     'Lavender Town.ogg',
    albano:            'Cinnabar Island.ogg',
    ariccia:           'Pewter City.ogg',     // riuso: solo 7 temi per 11 comuni
    genzano:           'Cerulean City.ogg',   // riuso
    castel_gandolfo:   'Vermilion City.ogg',  // riuso
    colonna:           'Lavender Town.ogg',   // riuso
    // Percorsi/natura (ruotati per varietà)
    percorso_a: 'Route 1.ogg',
    percorso_b: 'Route 3.ogg',
    percorso_c: 'Route 11.ogg',
    percorso_d: 'Route 24.ogg',
    ciclismo:   'Cycling.ogg',
    // Dungeon/luoghi speciali
    tunnel_roccioso: 'Mt. Moon.ogg',
    boschi_tuscolo:  'Viridian Forest.ogg',
    grotta_vulcano:  'Pokémon Mansion.ogg',
    rifugio_gdf:     'Rocket Hideout.ogg',
    cotral:          'Rocket Hideout.ogg',
    bunkerino:       'Silph Co..ogg',
    osservatorio:    'Silph Co..ogg',
    treno:           'S.S. Anne.ogg',
    via_vittoria:    'Victory Road.ogg',
    lega:            'Hall of Fame.ogg',
    // Grande Magazzino (ex-Celadon, 22 ott 2026): tema dedicato invece del
    // fallback generico "percorso" — nei giochi veri non ha una musica
    // propria (riusa il tema città), ma qui Luca ha chiesto musica
    // dedicata per i market, e "Game Corner" nel pacchetto non era mai
    // usata da nessuna parte.
    grande_magazzino: 'Game Corner.ogg',
  };

  function _elem() {
    if (!elemento) {
      elemento = new Audio();
      elemento.loop = true;
      elemento.volume = muto ? 0 : 0.5;
    }
    return elemento;
  }

  // Suona una traccia per CHIAVE (una delle voci di TRACCE sopra). Se è
  // già quella in corso, non la ri-avvia da capo (niente "scatto" ad ogni
  // passo quando si resta sulla stessa mappa).
  function _suona(chiaveTraccia, { aNomediale } = {}) {
    const file = TRACCE[chiaveTraccia];
    if (!file) return;
    if (tracciaCorrente === chiaveTraccia && !aNomediale) return;
    tracciaCorrente = chiaveTraccia;
    try {
      const el = _elem();
      el.src = CARTELLA + encodeURIComponent(file);
      el.loop = !aNomediale;
      el.currentTime = 0;
      el.play().catch(() => {});  // niente errore bloccante se il browser nega l'autoplay
    } catch (e) { /* file assente o non ancora caricato: silenzioso */ }
  }

  // Decide la traccia giusta per una mappa (chiave del registro MAPPE in
  // js/map.js) usando regole per pattern, non un elenco di tutte le 300+
  // mappe una per una. Case = casa (NPC fuori scena): non cambia musica,
  // resta quella della città in cui ti trovi.
  function _chiaveDaMappa(chiave) {
    const k = String(chiave).toLowerCase();
    if (k.includes('casa') || k.includes('condominio')) return null;    // niente cambio, resta il tema città
    if (k.startsWith('pokecenter') || k.includes('pokecenter')) return 'centro_pokemon';
    if (k.includes('palestra')) return 'palestra';
    if (k === 'borgata_tuscolana' || k.includes('laboratorio')) return 'laboratorio';
    if (k.includes('tunnel_roccioso')) return 'tunnel_roccioso';
    if (k.includes('bosch') && k.includes('tuscolo')) return 'boschi_tuscolo';
    if (k.includes('vulcano')) return 'grotta_vulcano';
    if (k.includes('gdf_marino') || k.includes('rifugio')) return 'rifugio_gdf';
    if (k.includes('cotral')) return 'cotral';
    if (k.includes('bunkerino')) return 'bunkerino';
    if (k.includes('osservatorio')) return 'osservatorio';
    if (k.includes('treno')) return 'treno';
    if (k.includes('via_vittoria')) return 'via_vittoria';
    if (k.includes('lega') || k === 'colonna' || k.includes('colonna_2')) return 'lega';

    // Città vere e proprie (chiave esatta nel registro MAPPE)
    const CITTA = ['borgata_tuscolana','frascati','grottaferrata','marino','monteporzio',
                   'rocca_di_papa','albano','ariccia','genzano','castel_gandolfo','colonna'];

    // Market (22 ott 2026, bug corretto: "mart_<città>" non era gestito da
    // nessuna regola, finiva sempre nel ripiego generico "percorso_a" —
    // richiesta esplicita di Luca di avere musica sensata nei market).
    // I giochi veri non hanno un tema dedicato per lo shop: riusano quello
    // della città, qui si fa lo stesso. 'mart_interno' è il market generico
    // di Borgata Tuscolana/inizio partita.
    if (k.startsWith('mart_')) {
      const citta = k.slice(5);
      if (CITTA.includes(citta)) return citta;
      return 'borgata_tuscolana';   // mart_interno e altri generici
    }
    // Grande Magazzino (ex-Celadon): tema dedicato, vedi TRACCE sopra.
    if (k.includes('celadon_dept')) return 'grande_magazzino';
    // Erboristeria di Percorso 9 (lavaridgetown_herbshop): stesso tema del
    // percorso a cui appartiene, non un fallback a caso.
    if (k.includes('herbshop')) return _chiaveDaMappa('percorso_9');

    for (const c of CITTA) {
      if (k === c || k.startsWith(c + '_centro') || k.startsWith(c + '_est') ||
          k.startsWith(c + '_ovest') || k.startsWith(c + '_sud') || k.startsWith(c + '_nord')) {
        return c;
      }
    }

    // Percorsi/natura: una delle 4 tracce percorso, scelta in modo stabile
    // (stessa mappa = sempre la stessa traccia, non a caso ogni volta).
    if (k.includes('percorso') || k.includes('lago') || k.includes('tuscolo')) {
      const varianti = ['percorso_a', 'percorso_b', 'percorso_c', 'percorso_d'];
      let h = 0;
      for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
      return varianti[h % varianti.length];
    }

    return 'percorso_a'; // fallback generico
  }

  // Chiamata da js/map.js dopo ogni caricaMappa riuscito.
  function suonaPerMappa(chiave) {
    const chiaveTraccia = _chiaveDaMappa(chiave);
    if (!chiaveTraccia) return;   // case/condomini: resta il tema attuale
    tracciaOverworldSospesa = chiaveTraccia;
    _suona(chiaveTraccia);
  }

  // Chiamata da js/battle.js all'inizio di una lotta.
  function suonaBattaglia(tipo) {
    const mappa = {
      selvatico: 'battaglia_selvatico',
      allenatore: 'battaglia_allenatore',
      capopalestra: 'battaglia_capopalestra',
      rivale: 'battaglia_rivale',
    };
    _suona(mappa[tipo] || 'battaglia_allenatore');
  }

  // HP critico in lotta (22 ott 2026): sovrascrive la musica di lotta in
  // corso con la variante "tesa", ricordandosi quale traccia riprendere
  // quando l'HP non è più critico (fermaCritico). Diverso da ripristina()
  // sopra, che invece torna al tema dell'OVERWORLD dopo una lotta/jingle.
  let battagliaSospesaSottoCritico = null;
  function suonaCritico() {
    if (tracciaCorrente === 'battaglia_critico') return;   // già attivo
    battagliaSospesaSottoCritico = tracciaCorrente;
    _suona('battaglia_critico');
  }
  function fermaCritico() {
    if (tracciaCorrente !== 'battaglia_critico' || !battagliaSospesaSottoCritico) return;
    _suona(battagliaSospesaSottoCritico);
    battagliaSospesaSottoCritico = null;
  }

  // Jingle di vittoria (NON in loop, si ferma da solo): dopo la sua durata
  // (o su chiamata esplicita) torna al tema della mappa sospeso.
  function suonaVittoria(tipo) {
    const mappa = {
      selvatico: 'vittoria_selvatico',
      allenatore: 'vittoria_allenatore',
      capopalestra: 'vittoria_capopalestra',
    };
    _suona(mappa[tipo] || 'vittoria_allenatore', { aNomediale: true });
  }

  function suonaMedaglia() { _suona('medaglia', { aNomediale: true }); }
  function suonaEvoluzione() { _suona('evoluzione', { aNomediale: true }); }

  // Torna al tema dell'overworld (dopo una lotta o un jingle one-shot).
  function ripristina() {
    if (tracciaOverworldSospesa) _suona(tracciaOverworldSospesa, { aNomediale: true });
  }

  function impostaMuto(v) {
    muto = !!v;
    if (elemento) elemento.volume = muto ? 0 : 0.5;
  }

  function stop() {
    if (elemento) { try { elemento.pause(); } catch (e) {} }
    tracciaCorrente = null;
  }

  return { suonaPerMappa, suonaBattaglia, suonaCritico, fermaCritico, suonaVittoria, suonaMedaglia, suonaEvoluzione, ripristina, impostaMuto, stop };
})();
