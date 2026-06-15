/* ============================================================
   map.js — Mappa Leaflet, palestre, avatar del giocatore,
   movimento (click sulla mappa + pulsanti direzionali) e passi.
   ============================================================ */

const GameMap = (function () {

  // ---- Impostazioni del movimento ----
  const PASSO_METRI = 12;        // lunghezza di un passo in metri
  const VELOCITA_MS = 150;       // un passo ogni 150 millisecondi quando si cammina
  const RAGGIO_TERRA = 111320;   // metri per ogni grado di latitudine (circa)

  // ---- Variabili interne del modulo ----
  let mappa = null;          // l'oggetto mappa di Leaflet
  let markerGiocatore = null; // il marker dell'avatar
  let posizione = null;      // posizione attuale { lat, lon }
  let destinazione = null;   // dove sta andando il giocatore (click sulla mappa)
  let timerCammino = null;   // timer che fa avanzare il giocatore verso la destinazione
  let onPasso = null;        // funzione chiamata a ogni passo (la fornisce app.js)
  let bloccato = false;     // true durante un incontro: blocca tutto il movimento
  let moltVelocita = 1;     // booster di velocità: 1, 2, 3 o 5 (più alto = più veloce)
  const markerOggetti = {};  // { [id]: L.Marker } per rimuovere i marker raccolti

  // ---- Conversioni metri <-> gradi ----
  // Un grado di latitudine vale sempre ~111.320 m; un grado di longitudine
  // si accorcia verso i poli, quindi va diviso per il coseno della latitudine.
  function metriInGradiLat(metri) {
    return metri / RAGGIO_TERRA;
  }
  function metriInGradiLon(metri, lat) {
    return metri / (RAGGIO_TERRA * Math.cos(lat * Math.PI / 180));
  }

  // Distanza in metri tra due punti (formula approssimata, ottima su piccole distanze)
  function distanzaMetri(a, b) {
    const dLat = (b.lat - a.lat) * RAGGIO_TERRA;
    const dLon = (b.lon - a.lon) * RAGGIO_TERRA * Math.cos(a.lat * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  // ---- Inizializzazione della mappa ----
  function inizializza(opzioni) {
    posizione = { ...opzioni.posizione }; // copia della posizione iniziale
    onPasso = opzioni.onPasso || function () {};

    // Creiamo la mappa centrata sul giocatore
    mappa = L.map("mappa").setView([posizione.lat, posizione.lon], CENTRO_MAPPA.zoom);

    // Tile OpenStreetMap. ATTENZIONE: l'attribuzione è obbligatoria, non rimuoverla.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mappa);

    aggiungiPalestre();
    aggiungiCentriPokemon();
    aggiungiMarket();
    aggiungiAbitanti();
    aggiungiDonatoriMN();
    aggiungiAllenatori();
    aggiungiLaboratorio();
    aggiungiMuseoNavi();
    aggiungiLegaPorta();
    aggiungiFunivia();
    aggiungiMeteorologo();
    aggiungiAnfrattiRegi();
    aggiungiVillaAldobrandini();
    aggiungiBunkerino();
    aggiungiPorchettaro();
    aggiungiParcheggione();
    aggiungiOggettiMappa();
    aggiungiGiocatore();

    // Click sulla mappa = il giocatore cammina fin lì (solo se non bloccato)
    mappa.on("click", function (evento) {
      if (!bloccato) impostaDestinazione({ lat: evento.latlng.lat, lon: evento.latlng.lng });
    });

    collegaPulsantiDirezionali();
    collegaTastiera();
  }

  // ---- Marker delle palestre con popup ----
  function aggiungiPalestre() {
    for (const palestra of PALESTRE) {
      const icona = L.divIcon({
        className: "",          // niente classe di default di Leaflet
        html: '<div class="icona-palestra">🏛️</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      const marker = L.marker([palestra.lat, palestra.lon], { icon: icona }).addTo(mappa);
      // Il pulsante chiama interagisciPalestra() definita in app.js
      marker.bindPopup(
        `<b>Palestra di ${palestra.comune}</b><br>` +
        `📍 ${palestra.luogo}<br>` +
        `Tipo: <b>${palestra.tipo}</b><br>` +
        `<i>${palestra.descrizione}</i><br>` +
        `<button class="btn-cura-popup" onclick="interagisciPalestra('${palestra.id}')">⚔️ Sfida il Capopalestra</button>`
      );
    }
  }

  // ---- Marker dei Poké Market (negozi, F9.2) ----
  function aggiungiMarket() {
    if (typeof POKE_MARKET === 'undefined') return;
    for (const market of POKE_MARKET) {
      const icona = L.divIcon({
        className: "",
        html: '<div class="icona-market">🛒</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const marker = L.marker([market.lat, market.lon], { icon: icona }).addTo(mappa);
      // Il pulsante chiama apriMarket() definita in app.js
      marker.bindPopup(
        `<b>Poké Market di ${market.comune}</b><br>` +
        `Compra Ball, Pozioni e altro con i Pokéyen.<br>` +
        `<small>Devi essere a meno di ${RAGGIO_MARKET} m.</small><br>` +
        `<button class="btn-cura-popup" onclick="apriMarket('${market.id}')">🛒 Entra nel Market</button>`
      );
    }
  }

  // ---- Marker degli abitanti delle città (NPC filler, F9) ----
  function aggiungiAbitanti() {
    if (typeof ABITANTI === 'undefined') return;
    for (const gruppo of ABITANTI) {
      const icona = L.divIcon({
        className: "",
        html: '<div class="icona-npc">💬</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const marker = L.marker([gruppo.lat, gruppo.lon], { icon: icona }).addTo(mappa);
      // Il pulsante chiama interagisciAbitanti() definita in app.js
      marker.bindPopup(
        `<b>Gente di ${gruppo.comune}</b><br>` +
        `Due chiacchiere con la gente del posto.<br>` +
        `<button class="btn-cura-popup" onclick="interagisciAbitanti('${gruppo.id}')">💬 Parla</button>`
      );
    }
  }

  // ---- Marker dei donatori delle MN (F9) ----
  function aggiungiDonatoriMN() {
    if (typeof DONATORI_MN === 'undefined') return;
    for (const d of DONATORI_MN) {
      const icona = L.divIcon({
        className: "",
        html: '<div class="icona-donatore">🎁</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const marker = L.marker([d.lat, d.lon], { icon: icona }).addTo(mappa);
      // Il pulsante chiama interagisciDonatore() definita in app.js
      marker.bindPopup(
        `<b>${d.nome}</b><br>` +
        `📍 ${d.comune}<br>` +
        `<i>Forse ha qualcosa per te…</i><br>` +
        `<button class="btn-cura-popup" onclick="interagisciDonatore('${d.id}')">💬 Parla</button>`
      );
    }
  }

  // ---- Marker degli allenatori di percorso/dungeon (F9) ----
  function aggiungiAllenatori() {
    if (typeof ALLENATORI === 'undefined') return;
    for (const a of ALLENATORI) {
      const icona = L.divIcon({
        className: "",
        html: '<div class="icona-allenatore">⚔️</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const marker = L.marker([a.lat, a.lon], { icon: icona }).addTo(mappa);
      // Il pulsante chiama interagisciAllenatore() definita in app.js
      marker.bindPopup(
        `<b>${a.classe} ${a.nome}</b><br>` +
        `📍 ${a.zona}<br>` +
        `<button class="btn-cura-popup" onclick="interagisciAllenatore('${a.id}')">⚔️ Sfida!</button>`
      );
    }
  }

  // ---- Marker del laboratorio del Professore (città di partenza, F7) ----
  function aggiungiLaboratorio() {
    const icona = L.divIcon({
      className: "",
      html: '<div class="icona-laboratorio">🏫</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    const marker = L.marker([LABORATORIO.lat, LABORATORIO.lon], { icon: icona }).addTo(mappa);
    // Il pulsante chiama interagisciLaboratorio() definita in app.js
    marker.bindPopup(
      `<b>${LABORATORIO.nome}</b><br>` +
      `Il punto di partenza di ogni grande viaggio!<br>` +
      `<button class="btn-cura-popup" onclick="interagisciLaboratorio()">🚪 Entra nel laboratorio</button>`
    );
  }

  // ---- Marker dei Centri Pokémon (cura gratuita, F6) ----
  function aggiungiCentriPokemon() {
    for (const centro of CENTRI_POKEMON) {
      const icona = L.divIcon({
        className: "",
        html: '<div class="icona-centro">🏥</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const marker = L.marker([centro.lat, centro.lon], { icon: icona }).addTo(mappa);
      // Il pulsante chiama curaSquadraDaCentro() definita in app.js
      marker.bindPopup(
        `<b>Centro Pokémon di ${centro.comune}</b><br>` +
        `Cura gratuita per la tua squadra (HP e PP).<br>` +
        `<small>Devi essere a meno di ${RAGGIO_CURA} m.</small><br>` +
        `<button class="btn-cura-popup" onclick="curaSquadraDaCentro('${centro.id}')">❤️ Cura la squadra</button>` +
        `<button class="btn-dormi-popup" onclick="apriMenuDormi('${centro.id}')">🛏️ Dormi (scegli l'ora)</button>`
      );
    }
  }

  // ---- Marker del Museo delle Navi Romane di Nemi (F10 — evento GdF) ----
  function aggiungiMuseoNavi() {
    if (typeof MUSEO_NAVI === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-museo">🏛️📜</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const marker = L.marker([MUSEO_NAVI.lat, MUSEO_NAVI.lon], { icon: icona }).addTo(mappa);
    marker.bindPopup(
      `<b>${MUSEO_NAVI.nome}</b><br>` +
      `📍 ${MUSEO_NAVI.luogo}<br>` +
      `<i>Le antiche navi di Caligola riposano nel lago da duemila anni.</i><br>` +
      `<button class="btn-cura-popup" onclick="interagisciMuseoNavi()">🚪 Entra nel Museo</button>`
    );
  }

  // ---- Marker della Porta della Lega di Colonna (F12) ----
  function aggiungiLegaPorta() {
    if (typeof VIA_VITTORIA_PORTA === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-lega">🏆</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const marker = L.marker([VIA_VITTORIA_PORTA.lat, VIA_VITTORIA_PORTA.lon], { icon: icona }).addTo(mappa);
    marker.bindPopup(
      `<b>Lega Pokémon di Colonna</b><br>` +
      `<small>Porta della sfida finale</small><br>` +
      `<button class="btn-cura-popup" onclick="interagisciLega()">🏆 Entra nella Lega</button>`
    );
  }

  // ---- Marker della Funivia di Rocca di Papa (F11 — gate Articuno) ----
  function aggiungiFunivia() {
    if (typeof FUNIVIA_ROCCA === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-funivia">🚡</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    const marker = L.marker([FUNIVIA_ROCCA.lat, FUNIVIA_ROCCA.lon], { icon: icona }).addTo(mappa);
    marker.bindPopup(
      `<b>${FUNIVIA_ROCCA.nome}</b><br>` +
      `📍 ${FUNIVIA_ROCCA.luogo}<br>` +
      `<i>Porta verso il Sentiero Innevato e le cime del Vulcano Laziale.</i><br>` +
      `<button class="btn-cura-popup" onclick="interagisciFunivia()">🚡 Usa la funivia</button>`
    );
  }

  // ---- Marker del Meteorologo a Monte Porzio (F11 — previsioni Zapdos) ----
  function aggiungiMeteorologo() {
    if (typeof METEOROLOGO === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-meteo">🔭</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const marker = L.marker([METEOROLOGO.lat, METEOROLOGO.lon], { icon: icona }).addTo(mappa);
    marker.bindPopup(
      `<b>${METEOROLOGO.nome}</b><br>` +
      `📍 ${METEOROLOGO.comune} — Osservatorio<br>` +
      `<i>Studia i fenomeni atmosferici sul Telescopio INAF.</i><br>` +
      `<button class="btn-cura-popup" onclick="interagisciMeteorologo()">🌩️ Chiedi le previsioni</button>`
    );
  }

  // ---- Marker dei Tre Anfratti del Tuscolo (F11 — Trio Regi) ----
  function aggiungiAnfrattiRegi() {
    if (typeof ANFRATTI_REGI === 'undefined') return;
    for (const a of ANFRATTI_REGI) {
      const icona = L.divIcon({
        className: '',
        html: '<div class="icona-anfratto">🏛️✨</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      const marker = L.marker([a.lat, a.lon], { icon: icona }).addTo(mappa);
      marker.bindPopup(
        `<b>${a.nomeAnfratto}</b><br>` +
        `📍 Rovine del Tuscolo<br>` +
        `<i>${a.iscrizione}</i><br>` +
        `<button class="btn-cura-popup" onclick="interagisciAnfratto('${a.id}')">🏛️ Esamina l'anfratto</button>`
      );
    }
  }

  // ---- Marker Villa Aldobrandini (F12b — Mew post-Lega) ----
  function aggiungiVillaAldobrandini() {
    if (typeof VILLA_ALDOBRANDINI === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-villa">🏛️🌸</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const marker = L.marker([VILLA_ALDOBRANDINI.lat, VILLA_ALDOBRANDINI.lon], { icon: icona }).addTo(mappa);
    marker.bindPopup(
      `<b>${VILLA_ALDOBRANDINI.nome}</b><br>` +
      `📍 ${VILLA_ALDOBRANDINI.luogo}<br>` +
      `<i>Le ville tuscolane custodiscono segreti antichi e moderni.</i><br>` +
      `<button class="btn-cura-popup" onclick="interagisciVillaAldobrandini()">🏛️ Entra nei giardini</button>`
    );
  }

  // ---- Marker oggetti mappa (Pokéball con oggetti, F12b) ----
  function aggiungiOggettiMappa() {
    if (typeof OGGETTI_MAPPA === 'undefined') return;
    if (typeof stato === 'undefined') return;
    const raccolti = (stato.oggettiRaccolti && Array.isArray(stato.oggettiRaccolti))
      ? stato.oggettiRaccolti : [];

    for (const obj of OGGETTI_MAPPA) {
      if (raccolti.includes(obj.id)) continue; // già raccolto: non mostrare

      const isChiave = obj.tipo === 'chiave';
      const html = isChiave
        ? '<div class="icona-oggetto-chiave">🔑</div>'
        : '<div class="icona-oggetto">📦</div>';

      const icona = L.divIcon({
        className: '',
        html,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const m = L.marker([obj.lat, obj.lon], { icon: icona }).addTo(mappa);
      markerOggetti[obj.id] = m;

      if (isChiave) {
        const def = (typeof OGGETTI_CHIAVE !== 'undefined' && OGGETTI_CHIAVE[obj.nomeChiave]) || {};
        m.bindPopup(`<b>${def.icona || '🔑'} ${def.nome || obj.nomeChiave}</b><br><small>${def.descrizione || ''}</small>`);
      } else {
        const def = (typeof OGGETTI !== 'undefined' && OGGETTI[obj.tipo]) || {};
        const nome = def.nome || obj.tipo;
        const icn  = def.icona || '📦';
        m.bindPopup(`<b>${icn} ${nome}</b> ×${obj.quantita || 1}<br><small>Avvicinati per raccogliere.</small>`);
      }
    }
  }

  // ---- Marker Bunkerino di Colonna (F12b — CoTrAL + Mewtwo) ----
  function aggiungiBunkerino() {
    if (typeof BUNKERINO === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-bunkerino">🏭</div>',
      iconSize: [28, 28], iconAnchor: [14, 14]
    });
    L.marker([BUNKERINO.lat, BUNKERINO.lon], { icon: icona })
      .addTo(mappa)
      .bindPopup(
        `<b>🏭 ${BUNKERINO.nome}</b><br>` +
        `<small>${BUNKERINO.luogo}</small><br>` +
        `<button class="btn-cura-popup" onclick="interagisciBunkerino()">🔓 Entra nel Bunkerino</button>`
      );
  }

  // ---- Marker Porchettaro di Ariccia (F12b — catena Piuma Sacra) ----
  function aggiungiPorchettaro() {
    if (typeof PORCHETTARO === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-porchettaro">🐷</div>',
      iconSize: [26, 26], iconAnchor: [13, 13]
    });
    L.marker([PORCHETTARO.lat, PORCHETTARO.lon], { icon: icona })
      .addTo(mappa)
      .bindPopup(
        `<b>🐷 ${PORCHETTARO.nome}</b><br>` +
        `<small>${PORCHETTARO.luogo}</small><br>` +
        `<button class="btn-cura-popup" onclick="interagisciPorchettaro()">💬 Parla con Adriano</button>`
      );
  }

  // ---- Marker Parcheggione di Grottaferrata (F12b — Deoxys) ----
  function aggiungiParcheggione() {
    if (typeof PARCHEGGIONE === 'undefined') return;
    const icona = L.divIcon({
      className: '',
      html: '<div class="icona-parcheggione">🚀</div>',
      iconSize: [28, 28], iconAnchor: [14, 14]
    });
    L.marker([PARCHEGGIONE.lat, PARCHEGGIONE.lon], { icon: icona })
      .addTo(mappa)
      .bindPopup(
        `<b>🚀 ${PARCHEGGIONE.nome}</b><br>` +
        `<small>${PARCHEGGIONE.luogo}</small><br>` +
        `<button class="btn-cura-popup" onclick="interagisciParcheggione()">🌕 Programma Spaziale ASI</button>`
      );
  }

  // ---- Rimuove un marker oggetto dalla mappa (chiamata da app.js dopo raccolta) ----
  function rimuoviMarkerOggetto(id) {
    if (markerOggetti[id] && mappa) {
      mappa.removeLayer(markerOggetti[id]);
      delete markerOggetti[id];
    }
  }

  // ---- Marker del giocatore ----
  function aggiungiGiocatore() {
    const icona = L.divIcon({
      className: "",
      html: '<div class="icona-giocatore"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    markerGiocatore = L.marker([posizione.lat, posizione.lon], {
      icon: icona,
      zIndexOffset: 1000 // il giocatore sta sopra gli altri marker
    }).addTo(mappa);
  }

  // ---- Movimento: un singolo passo in una direzione ----
  // dLat e dLon valgono -1, 0 o +1 e indicano la direzione.
  function passo(dLat, dLon) {
    if (bloccato) return;
    posizione.lat += dLat * metriInGradiLat(PASSO_METRI);
    posizione.lon += dLon * metriInGradiLon(PASSO_METRI, posizione.lat);
    markerGiocatore.setLatLng([posizione.lat, posizione.lon]);

    // La mappa segue il giocatore senza animazione (più fluido durante il cammino)
    mappa.panTo([posizione.lat, posizione.lon], { animate: false });

    // Avvisiamo app.js che è stato fatto un passo (per contatore e salvataggio)
    onPasso({ ...posizione });
  }

  // ---- Click-to-move: cammina verso la destinazione, un passo alla volta ----

  // Un "tick" del cammino: avanza di un passo verso la destinazione
  function tickCammino() {
    if (!destinazione) { fermaCammino(); return; }

    const distanza = distanzaMetri(posizione, destinazione);
    if (distanza < PASSO_METRI) {
      // Arrivato (più vicino di un passo): ci fermiamo sulla destinazione
      posizione = { ...destinazione };
      markerGiocatore.setLatLng([posizione.lat, posizione.lon]);
      fermaCammino();
      onPasso({ ...posizione });
      return;
    }

    // Direzione normalizzata (interpolazione semplice in linea retta)
    const dLat = (destinazione.lat - posizione.lat) / metriInGradiLat(distanza);
    const dLon = (destinazione.lon - posizione.lon) / metriInGradiLon(distanza, posizione.lat);
    passo(dLat, dLon);
  }

  // (Ri)avvia il timer del cammino con la velocità attuale
  function avviaTimerCammino() {
    if (timerCammino) clearInterval(timerCammino);
    timerCammino = setInterval(tickCammino, VELOCITA_MS / moltVelocita);
  }

  function impostaDestinazione(dest) {
    destinazione = dest;
    if (!timerCammino) avviaTimerCammino(); // se cammina già, cambia solo direzione
  }

  // Booster di velocità (x1, x2, x3, x5): riduce l'intervallo tra i passi
  function impostaVelocita(molt) {
    moltVelocita = molt || 1;
    if (timerCammino) avviaTimerCammino(); // applica subito anche se sta camminando
  }

  function fermaCammino() {
    if (timerCammino) {
      clearInterval(timerCammino);
      timerCammino = null;
    }
    destinazione = null;
  }

  // ---- Pulsanti direzionali a schermo ----
  function collegaPulsantiDirezionali() {
    const direzioni = {
      "btn-su":       [ 1,  0],
      "btn-giu":      [-1,  0],
      "btn-sinistra": [ 0, -1],
      "btn-destra":   [ 0,  1]
    };
    for (const [idPulsante, [dLat, dLon]] of Object.entries(direzioni)) {
      document.getElementById(idPulsante).addEventListener("click", function () {
        fermaCammino();   // i pulsanti interrompono il cammino automatico
        passo(dLat, dLon);
      });
    }
  }

  // ---- Tasti freccia della tastiera (comodo su computer) ----
  function collegaTastiera() {
    const direzioni = {
      "ArrowUp":    [ 1,  0],
      "ArrowDown":  [-1,  0],
      "ArrowLeft":  [ 0, -1],
      "ArrowRight": [ 0,  1]
    };
    document.addEventListener("keydown", function (evento) {
      if (direzioni[evento.key]) {
        evento.preventDefault(); // le frecce non devono scorrere la pagina
        fermaCammino();
        const [dLat, dLon] = direzioni[evento.key];
        passo(dLat, dLon);
      }
    });
  }

  // ---- Pausa e ripresa del movimento (usati durante gli incontri) ----
  function bloccaMovimento() {
    bloccato = true;
    fermaCammino();
  }

  function sbloccaMovimento() {
    bloccato = false;
  }

  // ---- Funzioni utili esposte agli altri moduli ----
  function posizioneGiocatore() {
    return { ...posizione };
  }

  // ---- Teletrasporto (MN Volo, F9) ----
  // Sposta istantaneamente il giocatore (niente passi, niente incontri)
  function teleporta(pos) {
    fermaCammino();
    posizione = { lat: pos.lat, lon: pos.lon };
    if (markerGiocatore) markerGiocatore.setLatLng([posizione.lat, posizione.lon]);
    if (mappa) mappa.setView([posizione.lat, posizione.lon], CENTRO_MAPPA.zoom);
  }

  return { inizializza, posizioneGiocatore, distanzaMetri, bloccaMovimento, sbloccaMovimento, impostaVelocita, teleporta, rimuoviMarkerOggetto };

})();
