/* dati/cutscene.js — registro delle cutscene (sequenze di eventi scriptate).
   Ogni cutscene è un array di "passi" eseguiti in ordine da _giocaCutscene
   (js/map.js). Il movimento del giocatore resta bloccato per tutta la durata.

   TIPI DI PASSO:
   - { tipo: 'dialogo', nome: 'Remo', testo: ['Riga 1', 'Riga 2'] }
       Mostra un balloon di dialogo, aspetta che il giocatore lo chiuda.
   - { tipo: 'muovi_npc', npc: 'id_npc_tiled', direzione: 'nord', passi: 3 }
       Fa camminare un NPC già presente sulla mappa di N caselle in una
       direzione (nord/sud/est/ovest). Si ferma da sola se trova un ostacolo.
   - { tipo: 'muovi_player', direzione: 'sud', passi: 2 }
       Come sopra ma muove il giocatore (cammino forzato, niente input).
   - { tipo: 'guarda', npc: 'id_npc_tiled', direzione: 'ovest' }
       Gira un NPC verso una direzione senza spostarlo (o 'player' per il giocatore).
   - { tipo: 'aspetta', ms: 600 }
       Pausa (utile per dare respiro tra un'azione e l'altra).
   - { tipo: 'flag', nome: 'remo_intro_vista', valore: true }
       Scrive su stato.flags — usalo per condizioni successive (gate).
   - { tipo: 'nascondi_npc', npc: 'id_npc_tiled' } / { tipo: 'mostra_npc', npc: '...' }
       Nasconde/mostra lo sprite di un NPC già piazzato su Tiled.
   - { tipo: 'camera', npc: 'id_npc_tiled', durata: 800 }  (oppure { tipo:'camera', tx, ty, durata })
       Sposta la camera su un NPC o su una casella per la durata indicata.
   - { tipo: 'camera_reset', durata: 500 }
       Riporta la camera a seguire il giocatore.
   - { tipo: 'muovi_npc_verso_giocatore', npc: 'id_npc_tiled', maxPassi: 20 }
       L'NPC cammina verso la posizione ATTUALE del giocatore (qualunque essa
       sia sulla mappa), un passo alla volta, finché non gli è adiacente o
       esaurisce maxPassi. Non è pathfinding vero: ad ogni passo sceglie
       l'asse con più distanza, se bloccato prova l'altro asse.
   - { tipo: 'esclamativo', npc: 'id_npc_tiled', durata: 700 }
       Vignetta bianca stile fumetto con "!" sopra la testa dell'NPC per
       `durata` ms (es. quando nota il giocatore, come un allenatore).
   - { tipo: 'guarda_reciproco', npc: 'id_npc_tiled' }
       L'NPC si gira verso la posizione attuale del giocatore E il giocatore
       si gira verso l'NPC — un "faccia a faccia" vero, da usare dopo
       muovi_npc_verso_giocatore.
   - { tipo: 'oggetto', contenuto: 'pietra_rubino', quantita: 1 }
       Regala un oggetto (stesso zaino/toast degli oggetti raccolti a terra),
       usalo per i doni scriptati dentro una cutscene.
   - { tipo: 'oggetto', contenuto: 'pietra_rubino', chiave: true }
       Come sopra ma per un oggetto-CHIAVE (OGGETTI_CHIAVE in js/data.js,
       es. quelli che svegliano un leggendario "addormentato" — vedi
       ev.props.addormentato/sveglia_con su un marcatore 'leggendario').

   Chi la fa partire (tre modi):
   1) Un NPC in Tiled con proprietà `cutscene: '<id>'` invece di `azione`/
      `dialogo` (in dati/npc.js) — parte quando ci parli con [A].
   2) Un oggetto Tiled type `trigger_cutscene` con proprietà `cutscene_id` —
      interagibile con [A], stesso pattern di trigger_storia (supporta anche
      `condizione` e `una_tantum`).
   3) Un oggetto Tiled type `trigger_cutscene` con proprietà `quando: 'spawn'`
      (oltre a `cutscene_id`) — parte DA SOLA appena la mappa è pronta, senza
      bisogno di premere niente (`una_tantum` di default true: succede una
      volta sola, mettere `una_tantum: false` per farla ripetere ad ogni
      ingresso nella mappa). La posizione dell'oggetto sulla mappa non conta
      per farla scattare (scatta comunque), serve solo come promemoria
      visivo in Tiled di dove è ambientata la scena.

   Test rapido SENZA piazzare nulla su Tiled: apri la Console (F12) e lancia
     GameMap.debugCutscene('test_saluto')
   con una qualunque partita già avviata.
*/

const CUTSCENE = {

  // Cutscene di prova: usa solo passi che non richiedono nessun NPC/oggetto
  // piazzato sulla mappa corrente, così è testabile da console ovunque tu sia.
  'test_saluto': [
    { tipo: 'dialogo', nome: 'Voce misteriosa', testo: [
      'Ehi, tu.',
      'Sì, proprio tu che stai testando le cutscene dalla console.',
      'Se leggi questo, il motore funziona.',
    ] },
    { tipo: 'aspetta', ms: 400 },
    { tipo: 'flag', nome: 'cutscene_test_vista', valore: true },
    { tipo: 'dialogo', nome: 'Voce misteriosa', testo: ['Ora prova con un NPC vero.'] },
  ],

  // Demo "allo spawn": parte da sola all'avvio di Borgata Tuscolana (vedi
  // CUTSCENE_SPAWN in js/map.js — niente oggetto Tiled, per non rischiare che
  // un export da Tiled la cancelli mentre la mappa è ancora in lavorazione).
  // Sor Otello (pallet_oldman) NON è stato spostato su Tiled: cammina dalla
  // sua vera posizione (tile 19,12) fino ad affiancare lo spawn (14,9) — ovest
  // 5, poi nord 3 (si ferma da solo un passo prima: la casella del giocatore
  // non è mai libera, vedi _liberoPerNPC).
  'demo_vicino_curioso': [
    { tipo: 'aspetta', ms: 300 },
    { tipo: 'muovi_npc', npc: 'pallet_oldman', direzione: 'ovest', passi: 5 },
    { tipo: 'muovi_npc', npc: 'pallet_oldman', direzione: 'nord', passi: 3 },
    { tipo: 'dialogo', nome: 'Sor Otello', testo: [
      'Ehi, aspetta! Sei tu quello nuovo del laboratorio, vero?',
      'Mo\' te lo dico io come se magna bene ai Castelli...',
    ] },
    { tipo: 'flag', nome: 'demo_vicino_curioso_vista', valore: true },
  ],

  /* ── Rocca di Papa — "Baso è via" (sessione 8 agosto) ──
     Innescata da _checkRoccaBasoTrigger (js/map.js) quando il giocatore si
     avvicina davvero alla piazza, non appena entra in città. Il cerchio di
     abitanti (rocca_npc2_1..12) resta fermo per tutta la durata del blocco
     narrativo (gate:true, condizione:baso_tornato sui loro oggetti Tiled).
     Qui parte solo la PRIMA parte (npc1 nota il giocatore e lo raggiunge):
     la seconda parte (racconto rapimento + dono MN Forza) è un dialogo
     normale riparlando con npc1 dopo, vedi dati/npc.js 'rocca_npc1'. */
  'rocca_papa_baso_via': [
    { tipo: 'dialogo', nome: '', testo: [
      'Baso sta combattendo quei maledetti del CoTrAL, ci hanno disattivato la funivia!',
      'Ha detto che andava sul Percorso 11 a riprendersi Gianluca, l\'operatore della funivia...',
      'Speriamo torni presto, senza di lui la palestra resta chiusa!',
    ] },
    { tipo: 'aspetta', ms: 300 },
    { tipo: 'guarda', npc: 'rocca_npc1', direzione: 'nord' },
    { tipo: 'esclamativo', npc: 'rocca_npc1', durata: 700 },
    { tipo: 'guarda', npc: 'rocca_npc1', direzione: 'sud' },
    { tipo: 'muovi_npc_verso_giocatore', npc: 'rocca_npc1', maxPassi: 30 },
    { tipo: 'guarda_reciproco', npc: 'rocca_npc1' },
    { tipo: 'flag', nome: 'rocca_cutscene1_vista', valore: true },
  ],

  /* ── Grotta del Vulcano — discorso da cattivo prima della lotta (sess. 8
     set 2026, riscritto stessa sessione dopo il nuovo arco GdF): parte da
     _prossimitaSpotta (js/map.js) appena Giovanni ti raggiunge (dopo
     l'avvicinamento a piedi), PRIMA di aprire la lotta vera col suo
     luogotenente. È il SECONDO incontro con Giovanni (il primo è al Rifugio
     di Marino, dove perde la Pietra Zaffiro — vedi 'rifugio_marino_boss_dopo'
     e docs/STORIA_COMPLETA.md) — il discorso richiama esplicitamente quella
     sconfitta. Solo dialogo, nessun'azione — la lotta parte da sola subito
     dopo l'ultima riga. */
  'grotta_vulcano_boss_intro': [
    { tipo: 'dialogo', nome: 'Giovanni', testo: [
      'Ci risiamo. L\'ultima volta, al Rifugio di Marino, mi hai portato via la Pietra Zaffiro. Non ripeterai il colpo.',
      'Io sono Giovanni, comandante della Grande di Frascati — e quello che dorme nel nucleo di questo vulcano presto risponderà solo a me.',
      'Con Groudon E Kyogre sotto controllo, altro che pioggia sulle vigne della concorrenza: rimodellerò il clima di tutti i Castelli Romani come e quando voglio. Nessuno potrà fermarmi, capisci? NESSUNO.',
      'Ma stavolta ho imparato la lezione: niente eroismi, niente rischi inutili. Prima di arrivare a me, ti scalderai i muscoli con Levantino.',
      'Levantino! Tocca a te. Stavolta non deludermi come l\'ultima volta.',
    ] },
  ],

  /* ── Grotta del Vulcano — dopo il boss (sess. 8 set 2026): parte da sola
     (vedi js/map.js, _applicaEsitoTrainer, blocco "gdf_boss_grotta_vulcano")
     appena Giovanni viene sconfitto, ultimo stadio della catena luogotenente
     →boss. TUTTI i GdF del dungeon (1f, 2f, 3f, non solo la stanza del boss)
     spariscono per sempre TUTTI INSIEME, non uno alla volta a piedi (richiesta
     esplicita di Luca) — gate:true/condizione sui loro oggetti Tiled sulla
     stessa flag "gdf_boss_grotta_vulcano_sconfitto", che scatta subito dopo
     "filiamo" e viene applicata (rigenera_npc) coperta da un fade_out/fade_in
     di mezzo secondo, così la sparizione secca non si vede. Lo scienziato
     (gdf_scienziato_grotta_vulcano, SEMPRE visibile fin dall'inizio — non più
     nascosto da un flag) ringrazia, regala la Pietra Rubino, poi cammina
     verso sud ("cammina fuori schermo", richiesta esplicita di Luca — non
     serve precisione pixel-perfect sul suo punto di uscita) e sparisce per
     sempre (flag grotta_vulcano_scienziato_partito, gate sul suo oggetto
     Tiled — impedisce che un _rigeneraNpc successivo lo ricrei da capo nella
     stanza, il bug della "copia che rimane" segnalato da Luca). Groudon
     resta SEMPRE visibile nel nucleo (non è mai stato nascosto: fisicamente
     irraggiungibile finché Giovanni blocca il corridoio) — l'oggetto-chiave
     sveglia_con:'pietra_rubino' sul suo marcatore è quello che lo rende
     davvero sfidabile, non un flag qui. */
  'grotta_vulcano_boss_dopo': [
    { tipo: 'dialogo', nome: '', testo: [
      'Un boato scuote la grotta: qualcosa, da qualche parte più in profondità, si è appena mosso.',
    ] },
    { tipo: 'dialogo', nome: 'Giovanni', testo: [
      'Impossibile... IMPOSSIBILE! Due volte. Mi hai battuto DUE volte.',
      'Maledetto ragazzino... ma non finisce qui. Non ti illudere.',
      'Torneremo più forti di prima. Abbiamo appoggi che nemmeno immagini — fondi veri, subito, senza fare una piega. Grazie alla destra italiana, vedrai.',
      'Ritirata! Filiamo, ragazzi, prima che sia troppo tardi!',
    ] },
    { tipo: 'aspetta', ms: 300 },
    // Tutti i GdF della grotta (stanza del boss compresa, 1f e 2f) spariscono
    // insieme, coperti da un fade — non uno alla volta a piedi.
    { tipo: 'flag', nome: 'gdf_boss_grotta_vulcano_sconfitto', valore: true },
    { tipo: 'fade_out', ms: 600 },
    { tipo: 'rigenera_npc' },
    { tipo: 'fade_in', ms: 600 },
    { tipo: 'aspetta', ms: 400 },
    { tipo: 'dialogo', nome: 'Professor Anselmi', testo: [
      'Finalmente libero... grazie per l\'aiuto! Ora Groudon potrà riposare in tranquillità.',
      'Ero rinchiuso qui da settimane: il GdF voleva usare Groudon come arma, io volevo solo studiarlo, capirlo. Non me lo hanno mai perdonato.',
      'Questa pietra è l\'unica cosa che riesce a calmarlo abbastanza da avvicinarsi senza rischiare la pelle: l\'ho portata con me nella fuga, sperando di poterla usare un giorno.',
      'Ma quel giorno, a quanto pare, sei arrivato tu. E questa pietra non serve più a me, ora — serve a te.',
      'Prendila: è tua.',
    ] },
    { tipo: 'oggetto', contenuto: 'pietra_rubino', chiave: true },
    { tipo: 'dialogo', nome: 'Professor Anselmi', testo: [
      'Io vado: ho una famiglia che mi aspetta da troppo tempo. Grazie ancora, di cuore.',
    ] },
    { tipo: 'muovi_npc', npc: 'gdf_scienziato_grotta_vulcano', direzione: 'sud', passi: 14 },
    { tipo: 'nascondi_npc', npc: 'gdf_scienziato_grotta_vulcano' },
    { tipo: 'flag', nome: 'grotta_vulcano_scienziato_partito', valore: true },
  ],

  /* ── Rifugio di Marino — dopo Giovanni (sess. 8 set 2026, arco GdF
     riscritto): PRIMO incontro col comandante GdF, prima della Grotta del
     Vulcano — vedi js/map.js, _applicaEsitoTrainer, blocco "id ===
     'gdf_capo_marino'", e docs/STORIA_COMPLETA.md. A differenza della Grotta,
     qui è Giovanni stesso a consegnare la pietra (non c'è uno scienziato da
     liberare): la perde a malincuore, promette la rivincita che poi tiene
     fede alla Grotta del Vulcano. */
  'rifugio_marino_boss_dopo': [
    { tipo: 'dialogo', nome: 'Giovanni', testo: [
      'Quest\'isola era mia... o almeno lo era, fino a un minuto fa.',
      'Non hai idea di cosa hai appena rimandato, ragazzino. Ma la Pietra Zaffiro a mani vuote non mi serve a niente: tienila pure, ne troverò un\'altra strada.',
    ] },
    { tipo: 'oggetto', contenuto: 'pietra_zaffiro', chiave: true },
    // Flag semplice (verificaCondizione, js/map.js, capisce solo singoli
    // flag, non il possesso di un oggetto-chiave): usato per sbloccare
    // l'accesso ai piani profondi della Grotta del Vulcano — prima di questo
    // momento della storia ci si può solo avvicinare e battere le guardie
    // fuori, non entrare (richiesta esplicita di Luca).
    { tipo: 'flag', nome: 'pietra_zaffiro_ottenuta', valore: true },
    { tipo: 'dialogo', nome: 'Giovanni', testo: [
      'Ma questa non è una sconfitta: è solo un rinvio. Ci rivedremo — e la prossima volta non sarai così fortunato.',
    ] },
  ],

};
