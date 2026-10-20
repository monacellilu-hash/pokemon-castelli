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
   - { tipo: 'salva_giorno', nome: 'bunkerino_mewtwo_vuoto_giorno' }
       Scrive su stato.flags IL GIORNO DI GIOCO ATTUALE (numero, non
       booleano). Usalo insieme alla condizione Tiled "giorni_passati:
       <stesso_nome>:<N>" su un oggetto 'leggendario'/'npc' per farlo
       (ri)apparire solo dopo N giorni da questo momento.
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
   - { tipo: 'battaglia', trainer: 'id_in_DATI_TRAINER' }
       Lotta col trainer indicato. Vinta: flag/ricompense del trainer scattano
       e la scena prosegue. Persa: la scena si INTERROMPE (il teletrasporto al
       Centro Pokémon lo fa la battaglia). Un passo può restituire 'interrompi'.
   - { tipo: 'scelta_oggetto', messaggio, opzioni: ['chiave_OGGETTI', ...],
       salva_scelta: 'campo', salva_restanti: 'campo' }
       Menu per scegliere UN oggetto (con conferma Sì/No). Va nello zaino; in
       stato[salva_scelta] la chiave scelta, in stato[salva_restanti] le altre.
   - { tipo: 'rivela_oggetti' }
       Fa comparire gli oggetti a terra (type 'oggetto') con una `condizione`
       appena diventata vera (tile Poké Ball nascosto fino a quel momento).
   - { tipo: 'fade_out'/'fade_in', ms } e { tipo: 'rigenera_npc' }: schermo nero
       e rilettura di gate/condizioni degli NPC (vedi museo_navi_sfida).
   - { tipo: 'cura_squadra' } (19 ott 2026) Cura tutta la squadra (HP pieni,
       niente stati, PP ricaricati) come il Centro Pokémon ma senza dialogo.
   - { tipo: 'cambia_mappa', mappa: 'borgata_tuscolana', spawn: 'da_casamia_1f' }
       (19 ott 2026) Cambia mappa VERA a metà cutscene, come un warp normale
       ma scriptato — usa lo spawn_id di un warp/spawn già esistente su
       quella mappa. Mettilo SEMPRE tra un fade_out e un fade_in, altrimenti
       si vede il caricamento a nudo (vedi 'lega_finale_remo').
   - { tipo: 'trema', ms: 350, intensita: 0.012 }
       Scuote la camera (es. un boss che rivela la sua vera natura).
   - { tipo: 'cambia_sprite', npc: 'id_npc_tiled', sprite: 'NomeSprite' }
       Cambia LIVE lo sprite di un NPC già piazzato (es. un travestimento che
       si rivela). Prova prima il foglio NPC/trainer normale, poi ripiega sul
       foglio follower/leggendario — funziona sia per un NPC che diventa un
       altro NPC, sia per un NPC che si rivela un Pokémon leggendario.
   - { tipo: 'scelta_si_no', messaggio, testoSi, testoNo, salva_flag: 'campo' }
       Bivio Sì/No: salva il booleano in stato.flags[salva_flag].
   - { tipo: 'sostituisci_squadra_temporaneo', messaggio, pokemon: idSpecie,
       richiede_flag: 'campo' }
       Il giocatore scegli quale Pokémon della squadra mettere da parte per
       un alleato "in prestito" (eredita il livello del tuo Pokémon più alto),
       SOLO per la prossima battaglia della cutscene. Annullabile. Il
       ripristino è automatico e garantito a fine lotta (vittoria O sconfitta).
       richiede_flag (opzionale): esegue il passo solo se stato.flags[campo]
       è vero (es. dopo una 'scelta_si_no' precedente) — comodo per renderlo
       condizionale senza un vero "if" nel motore.
   - Test rapido: `stato.flags.debug_skip_lotta = true` in console PRIMA di far
       partire la cutscene salta la lotta vera di QUALUNQUE passo 'battaglia'
       e passa dritto all'esito di vittoria (vedi _cutscenaBattaglia).
   - { tipo: 'battaglia', trainer: '...', squadraAsync: 'nomeFunzioneGlobale' }
       Oltre al trainer statico, la squadra puó essere costruita al volo da
       una funzione ASINCRONA globale (passata per NOME-stringa, stesso motivo
       di rivaleRif sotto: dati/cutscene.js carica prima di js/app.js) — utile
       per boss la cui squadra dipende dallo stato attuale del giocatore
       (es. Mewtwo finale del Bunkerino, costruisciSquadraMewtwoFinale).
   - Nei testi dei dialoghi: {maschile|femminile} sceglie in base al genere del
       giocatore ("{ragazzino|ragazzina}"), {nome} è il nome del personaggio.

   Trigger a RETTANGOLO (trigger_cutscene con quando:'entra'): parte quando il
   giocatore entra nel rettangolo. Proprietà: cutscene_id, condizione,
   flag_fine (se vero la scena non riparte più), e per le scene "riprendibili"
   flag_ripresa + cutscene_id_ripresa (se il flag è vero parte quella di ripresa).

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
    { tipo: 'dialogo', nome: 'Lorenzo', testo: [
      'Ci risiamo. L\'ultima volta, al Rifugio di Marino, mi hai portato via la Pietra Zaffiro. Non ripeterai il colpo.',
      'Io sono Lorenzo, comandante della Grande di Frascati — e quello che dorme nel nucleo di questo vulcano presto risponderà solo a me.',
      'Con Groudon E Kyogre sotto controllo, altro che pioggia sulle vigne della concorrenza: rimodellerò il clima di tutti i Castelli Romani come e quando voglio. Nessuno potrà fermarmi, capisci? NESSUNO.',
      'Ma stavolta ho imparato la lezione: niente eroismi, niente rischi inutili. Prima di arrivare a me, ti scalderai i muscoli con Ginevra.',
      'Ginevra! Tocca a te. Stavolta non deludermi come l\'ultima volta.',
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
    { tipo: 'dialogo', nome: 'Lorenzo', testo: [
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

  /* ── Rifugio di Marino — dopo Lorenzo (sess. 8 set 2026, arco GdF
     riscritto; rinominato da "Giovanni" a "Lorenzo" il 13 ott 2026): PRIMO
     incontro col comandante GdF, prima della Grotta del Vulcano — vedi
     js/map.js, _applicaEsitoTrainer, blocco "id === 'gdf_capo_marino'", e
     docs/STORIA_COMPLETA.md. A differenza della Grotta, qui è Lorenzo
     stesso a consegnare la pietra (non c'è uno scienziato da liberare): la
     perde a malincuore, promette la rivincita che poi tiene fede alla
     Grotta del Vulcano. */
  /* ── Rifugio di Marino, 2F_B — discorso da cattivo PRIMA della lotta
     (sess. 14 ott 2026, richiesta esplicita di Luca): parte da sola entrando
     nel rettangolo "inizio_cutscene_gdf_marino_boss" (trigger_cutscene
     quando:'entra', condizione '!gdf_marino_boss_sconfitto' — non si rifà
     una volta battuto). Lorenzo e i 3 luogotenenti (Ginevra/Fernando/
     Michela, cameo type:'npc' solo per questa scena — non si combattono
     qui, hanno già le loro lotte vere altrove in città) festeggiano il
     piano riuscito per la Pietra Zaffiro, poi notano il giocatore e si
     girano verso di lui. La lotta vera parte da sola all'ultima battuta
     (passo 'battaglia'): l'esito (vittoria/sconfitta) è gestito come
     sempre da _applicaEsitoTrainer (js/map.js, blocco "gdf_capo_marino"),
     che a vittoria fa partire 'rifugio_marino_boss_dopo' qui sotto. */
  'rifugio_marino_boss_intro': [
    { tipo: 'dialogo', nome: 'Lorenzo', testo: [
      'Ottimo lavoro, davvero. Con voi tre al mio fianco, questo piano poteva solo riuscire.',
    ] },
    { tipo: 'dialogo', nome: 'Ginevra', testo: ['Il più difficile è stato distrarre la security del Museo, Capo. Ma ce l\'abbiamo fatta.'] },
    { tipo: 'dialogo', nome: 'Fernando', testo: ['Io mi sono occupato dei documenti a Castel Gandolfo: nessuno si è accorto di niente.'] },
    { tipo: 'dialogo', nome: 'Michela', testo: ['E io ho tenuto buoni i Grunt di guardia tutta la notte. Il risultato è questo.'] },
    { tipo: 'dialogo', nome: 'Lorenzo', testo: [
      'La Pietra Zaffiro, finalmente nelle nostre mani. Con questa possiamo riattivare il guardiano dell\'acqua: Kyogre risponderà solo a noi.',
      'Il Team GdF ha appena fatto un passo che nessuno potrà più fermare...',
    ] },
    { tipo: 'guarda_reciproco', npc: 'Luogotenente Ginevra' },
    { tipo: 'guarda_reciproco', npc: 'Luogotenente Fernando' },
    { tipo: 'guarda_reciproco', npc: 'Luogotenente Michela' },
    { tipo: 'guarda_reciproco', npc: 'gdf_capo_marino' },
    { tipo: 'aspetta', ms: 700 },
    { tipo: 'dialogo', nome: '', testo: [
      'Ecco il problema incontrato lungo la via, Capo: non si riesce a liberarsi di questa spina nel fianco.',
    ] },
    // Richiesta esplicita di Luca (14 ott 2026, dopo aver spostato "inizio
    // cutscene"): il percorso non è più una linea dritta ma uno "zig-zag" —
    // avanti, un passo a sinistra, ancora avanti.
    { tipo: 'muovi_player', direzione: 'nord', passi: 1 },
    { tipo: 'muovi_player', direzione: 'ovest', passi: 1 },
    { tipo: 'muovi_player', direzione: 'nord', passi: 1 },
    { tipo: 'dialogo', nome: 'Lorenzo', testo: [
      'Bene. Hai dato filo da torcere al nostro gruppo fin troppo a lungo: adesso basta.',
      'Questa storia finisce qui, ragazzino. Nessuno rovina i piani del Team GdF e se ne va a piede libero.',
    ] },
    { tipo: 'battaglia', trainer: 'gdf_capo_marino' },
  ],

  /* ── Rifugio di Marino, 2F_B — dopo il boss (sess. 14 ott 2026): parte da
     sola a vittoria (vedi js/map.js, _applicaEsitoTrainer, blocco
     "gdf_capo_marino"). Lorenzo, i 3 luogotenenti e TUTTI i Grunt del
     rifugio (1F/2F_A/2F_B/2F_C) spariscono insieme, coperti da un fade —
     stessa tecnica di 'grotta_vulcano_boss_dopo' (gate:true/condizione
     sulla flag "gdf_marino_boss_sconfitto" sui loro oggetti Tiled). A
     differenza di prima, la Pietra Zaffiro NON si regala più in automatico
     durante il dialogo: resta a terra (oggetto type:'oggetto', chiave:true,
     flag_raccolta:'pietra_zaffiro_ottenuta', condizione sulla stessa flag
     di sparizione) e va raccolta a piedi come una Poké Ball — rivelata
     subito dopo il fade col passo 'rivela_oggetti'. */
  'rifugio_marino_boss_dopo': [
    { tipo: 'dialogo', nome: 'Lorenzo', testo: [
      'Quest\'isola era mia... o almeno lo era, fino a un minuto fa.',
      'Non pensare che finisca qui: il piano del Team GdF continua, con o senza questa pietra.',
    ] },
    { tipo: 'aspetta', ms: 300 },
    { tipo: 'flag', nome: 'gdf_marino_boss_sconfitto', valore: true },
    { tipo: 'fade_out', ms: 600 },
    { tipo: 'rigenera_npc' },
    { tipo: 'rivela_oggetti' },
    { tipo: 'fade_in', ms: 600 },
  ],

};

/* ── Museo delle Navi di Nemi, 2F — il Capo GdF, Michela e Cenciarels
   (22 set 2026). Parte da sola quando entri nel rettangolo "inizio cutscene"
   (trigger_cutscene quando:'entra' in Museo_navi_2f.tmj, serve aver ottenuto
   il documento di Castel Gandolfo: flag documentoVillaOttenuto).

   Due pezzi:
   - 'museo_navi_sfida': Michela ti raggiunge, parla e parte la lotta. Se
     PERDI, la scena si interrompe (teletrasporto normale al Centro Pokémon) e
     al ritorno riparte SOLO da qui (flag museoIntroVista), senza rifare
     l'intro. Se VINCI, prosegue fino alla fine.
   - 'museo_navi_intro': dialogo iniziale + il Capo che se ne va, poi la sfida.

   FLAG della scena: museoBossVia (il Capo è sparito), museoIntroVista (intro
   fatta), museoGdfSparito (Michela + grunt spariti), museoLiberato (ostaggi
   passano alla versione "liberato"), cenciarelsFossileDato, museoPokeballVisibile
   (la Poké Ball con la password 2 compare), museoSceneCompleta (fine: non riparte).
   Il flag museo_nemi_password (2ª password del Rifugio di Marino) lo alza la
   RACCOLTA della Poké Ball, non la vittoria. */
CUTSCENE['museo_navi_sfida'] = [
  { tipo: 'muovi_npc_verso_giocatore', npc: 'museo_luogotenente', maxPassi: 30 },
  { tipo: 'guarda_reciproco', npc: 'museo_luogotenente' },
  { tipo: 'dialogo', nome: 'Michela', testo: [
    'Il Capo se n\'è andato, ma il museo resta nostro. Sono Michela, e da qui non si passa.',
    'Fernando mi aveva avvisata che qualcuno stava ficcando il naso. Vediamo se sei bravo quanto fai credere!',
  ] },
  { tipo: 'battaglia', trainer: 'gdf_capo_museo' },

  // ── Solo se hai VINTO (con una sconfitta la scena si è già interrotta) ──
  { tipo: 'dialogo', nome: 'Michela', testo: [
    'Ah ah ah! Ti sei dato tanto da fare... ma era solo per farti perdere tempo e coprire la fuga.',
    'Ormai non ci fermerete più.',
  ] },
  // Michela e i grunt svaniscono nello stesso istante.
  { tipo: 'nascondi_npc', npc: 'museo_luogotenente' },
  { tipo: 'nascondi_npc', npc: 'museo_grunt_a' },
  { tipo: 'nascondi_npc', npc: 'museo_grunt_b' },
  { tipo: 'nascondi_npc', npc: 'gdf_grunt_museo_3' },   // anche il grunt "di ronda" del 2F (e quelli del 1F, via gate)
  { tipo: 'flag', nome: 'museoGdfSparito', valore: true },
  { tipo: 'aspetta', ms: 700 },
  { tipo: 'guarda', npc: 'museo_scienziato_1_prig', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_scienziato_2_prig', direzione: 'sud' },
  { tipo: 'dialogo', nome: 'Scienziata rapita', testo: [
    'Grazie... grazie per averci liberati!',
    'Purtroppo non abbiamo fatto in tempo a nascondere le pietre, e non so come faremo adesso...',
  ] },
  { tipo: 'dialogo', nome: 'Scienziato rapito', testo: [
    'Aiutaci, ti prego! Quelle pietre non devono finire nelle mani sbagliate.',
  ] },

  // Mezza schermata nera: gli ostaggi passano alla versione "liberato".
  { tipo: 'fade_out', ms: 500 },
  { tipo: 'flag', nome: 'museoLiberato', valore: true },
  { tipo: 'rigenera_npc' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 500 },

  { tipo: 'dialogo', nome: 'Cenciarels', testo: [
    'Non so come ringraziarti. Ero costretta a obbedire, e il museo era ormai alla loro mercé.',
    'Da curatrice ho un tesoro da offrirti: un fossile. Scegli, è il minimo per ringraziarti.',
  ] },
  { tipo: 'scelta_oggetto',
    messaggio: 'Cenciarels ti offre un fossile. Quale scegli?',
    opzioni: ['fossile_elice', 'fossile_cupola', 'ambra_antica', 'fossile_artiglio', 'fossile_radice'],
    salva_scelta: 'fossileScelto',
    salva_restanti: 'fossiliDaCenciarels' },
  { tipo: 'dialogo', nome: 'Cenciarels', testo: [
    'Una buona scelta. Quando sarai riuscito a rianimarlo, torna da me.',
    'Ho delle missioni per il museo: in cambio ti darò gli altri fossili.',
  ] },
  { tipo: 'flag', nome: 'cenciarelsFossileDato', valore: true },

  // La Poké Ball con la 2ª password compare sul "dot" dove stava il Capo.
  { tipo: 'flag', nome: 'museoPokeballVisibile', valore: true },
  { tipo: 'rivela_oggetti' },
  { tipo: 'aspetta', ms: 500 },
  { tipo: 'dialogo', nome: '', testo: [
    'Qualcosa luccica sul pavimento, proprio dove stava il Capo GdF. Deve averla lasciata cadere durante la fuga...',
  ] },
  { tipo: 'flag', nome: 'museoSceneCompleta', valore: true },
];

CUTSCENE['museo_navi_intro'] = [
  { tipo: 'aspetta', ms: 400 },
  { tipo: 'dialogo', nome: 'Capo GdF', testo: [
    'Ce l\'abbiamo fatta. Le due pietre sono nostre.',
    'Dal Lago di Nemi a tutti i Castelli: ormai niente potrà fermarci.',
  ] },
  { tipo: 'dialogo', nome: 'Cenciarels', testo: [
    'Vi ho dato quello che volevate... ora lasciate stare la gente del museo. Non hanno nessuna colpa.',
  ] },
  { tipo: 'dialogo', nome: 'Scienziata rapita', testo: [
    'Ci avete tenuti qui tutta la notte... vi prego, lasciateci andare!',
  ] },
  { tipo: 'dialogo', nome: 'Scienziato rapito', testo: [
    'Quelle pietre sono pericolose! Non avete idea di cosa possono risvegliare!',
  ] },
  { tipo: 'dialogo', nome: 'Capo GdF', testo: [
    'Silenzio, voi. Le domande le faccio io.',
  ] },

  // Si accorgono di te: "!" e tutti si girano verso sud.
  { tipo: 'esclamativo', npc: 'museo_boss', durata: 700 },
  { tipo: 'guarda', npc: 'museo_boss', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_luogotenente', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_grunt_a', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_grunt_b', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_cenciarels_prigioniera', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_scienziato_1_prig', direzione: 'sud' },
  { tipo: 'guarda', npc: 'museo_scienziato_2_prig', direzione: 'sud' },
  { tipo: 'aspetta', ms: 300 },

  { tipo: 'dialogo', nome: 'Capo GdF', testo: [
    'E tu chi saresti? Una gita scolastica da Castel Gandolfo? Torna a casa, {ragazzino|ragazzina}.',
    'Non ci fermerai. Non ce la farai mai!',
    'Michela, ci pensi tu. È solo {un ragazzino|una ragazzina}, non ce la farà mai a sconfiggerci.',
  ] },

  // Il Capo se ne va: mezza schermata nera e sparisce.
  { tipo: 'fade_out', ms: 500 },
  { tipo: 'nascondi_npc', npc: 'museo_boss' },
  { tipo: 'flag', nome: 'museoBossVia', valore: true },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 500 },
  { tipo: 'flag', nome: 'museoIntroVista', valore: true },

  // ...e poi Michela ti raggiunge (stesso pezzo che riparte dopo una sconfitta).
  ...CUTSCENE['museo_navi_sfida'],
];

/* ── Lago di Nemi — Assuntina (gdf_gate_nemi) si scansa (18 ott 2026) ──
   Parte parlandole quando ha già "condizione: documentoVillaOttenuto" vera
   (quindi è già apparsa, vedi dati/npc.js). Una tantum (cutsceneUnaTantum
   di default): dopo questa, _creaNpcStato la ricrea 1 casella a est,
   rivolta a ovest, per sempre (vedi js/map.js — flag persistita in
   stato.cutsceneViste, chiave 'cutscene_npc:gdf_gate_nemi'). */
CUTSCENE['gdf_gate_nemi_passa'] = [
  { tipo: 'dialogo', nome: 'Assuntina', testo: [
    'Hai i documenti, puoi passare.',
  ] },
  { tipo: 'muovi_npc', npc: 'gdf_gate_nemi', direzione: 'est', passi: 1 },
  { tipo: 'guarda', npc: 'gdf_gate_nemi', direzione: 'ovest' },
];

/* ══════════════════════════════════════════════════════════
   VIA VITTORIA 5F — i due rivali (richiesta esplicita di Luca, 10 ott
   2026): all'ultimo piano, PRIMA della Lega, l'ALTRO rivale (quello che
   NON hai scelto/affrontato al laboratorio) ti sfida una volta sola, a
   un livello alto quanto il primo membro del Superquattro (62, vedi
   SUPERQUATTRO['sq-captain'].livMax in js/data.js). Dopo la vittoria, il
   TUO rivale di sempre si congeda e sparisce — risolve anche l'identità
   di "rivale2_via_vittoria" (D13 in TODO.md, prima un placeholder).

   Due varianti perché cambia CHI sfida e CHI saluta (dipende da
   stato.difficolta — scelta al laboratorio): quella giusta viene
   selezionata dal trigger Tiled stesso via cutscene_id_difficile
   (vedi _controllaCutsceneSpawn in js/map.js), NON da logica qui dentro.
   rivaleRif: 'altroRivale' è una STRINGA (non un riferimento diretto:
   dati/cutscene.js carica prima di js/app.js, dove altroRivale() vive),
   risolta a runtime da _cutscenaBattaglia. ══════════════════════════════════════════════════════════ */

// FACILE: hai scelto/affrontato Green al laboratorio → qui ti sfida Blue,
// e alla fine è Green (il tuo rivale di sempre) a salutarti e sparire.
CUTSCENE['via_vittoria_due_rivali_facile'] = [
  { tipo: 'guarda_reciproco', npc: 'rivale2_via_vittoria' },
  { tipo: 'dialogo', nome: 'Blue', testo: [
    'Eccoti. Ti aspettavo proprio qui, all\'ultimo piano prima della Lega.',
    'Green mi ha raccontato tutto il vostro cammino insieme. Io invece mi sono allenata per conto mio, lontano da tutti.',
    'Prima che tu affronti il Superquattro, voglio vedere con i miei occhi quanto vali davvero.',
  ] },
  { tipo: 'battaglia', trainer: 'rivale2_via_vittoria', rivaleDinamico: true, tappa: 6, assoLivello: 62, rivaleRif: 'altroRivale' },
  { tipo: 'guarda_reciproco', npc: 'rivale_via_vittoria' },
  { tipo: 'dialogo', nome: 'Green', testo: [
    'Bene, sei pronto!',
    'Ci vediamo presto, amico mio...',
  ] },
  { tipo: 'fade_out', ms: 500 },
  { tipo: 'nascondi_npc', npc: 'rivale_via_vittoria' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 500 },
  { tipo: 'flag', nome: 'via_vittoria_rivale_finale_vista', valore: true },
];

// DIFFICILE: hai scelto/affrontato Blue al laboratorio → qui ti sfida
// Green, e alla fine è Blue (il tuo rivale di sempre) a salutarti e sparire.
CUTSCENE['via_vittoria_due_rivali_difficile'] = [
  { tipo: 'guarda_reciproco', npc: 'rivale_via_vittoria' },
  { tipo: 'dialogo', nome: 'Green', testo: [
    'Eccoti. Ti aspettavo proprio qui, all\'ultimo piano prima della Lega.',
    'Blue mi ha raccontato tutto il vostro cammino insieme. Io invece mi sono allenato per conto mio, lontano da tutti.',
    'Prima che tu affronti il Superquattro, voglio vedere con i miei occhi quanto vali davvero.',
  ] },
  { tipo: 'battaglia', trainer: 'rivale_via_vittoria', rivaleDinamico: true, tappa: 6, assoLivello: 62, rivaleRif: 'altroRivale' },
  { tipo: 'guarda_reciproco', npc: 'rivale2_via_vittoria' },
  { tipo: 'dialogo', nome: 'Blue', testo: [
    'Bene, sei pronto!',
    'Ci vediamo presto, amico mio...',
  ] },
  { tipo: 'fade_out', ms: 500 },
  { tipo: 'nascondi_npc', npc: 'rivale2_via_vittoria' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 500 },
  { tipo: 'flag', nome: 'via_vittoria_rivale_finale_vista', valore: true },
];

/* ══════════════════════════════════════════════════════════
   SCONTRO FINALE DEL BUNKERINO (3F) — Mewtwo (richiesta esplicita di
   Luca, 12 ott 2026): Tom e Maso (già battuti altrove) vengono
   rimproverati da un capo misterioso ("xxxx" finché non si rivela) per
   non essere riusciti a fermarti — si scopre essere Mewtwo stesso,
   travestito da semplice Addetto CoTrAL. Dopo il monologo sui suoi piani
   (clonazione/potenziamento/controllo dei Castelli), si rivela anche Mew
   (omaggio al primo film): puoi scegliere di portarlo in squadra, al
   posto di un tuo Pokémon, SOLO per questa lotta (vedi
   'sostituisci_squadra_temporaneo' — il ripristino a fine lotta è
   automatico). Mewtwo ha moveset fisso (Psichico/Fulmine/
   Lanciafiamme/Ricarica, IA dedicata in js/battle.js) + fino a 5 cloni
   della tua squadra reale (esclude Mew se l'hai portato con te), tutti
   6 livelli sopra il tuo più forte — vedi costruisciSquadraMewtwoFinale
   in js/app.js.
   ══════════════════════════════════════════════════════════ */

// Epilogo condiviso da entrambe le varianti (normale e "ripresa"), subito
// dopo la battaglia vinta (richiesta esplicita di Luca, 12 ott 2026):
// Mewtwo non riesce a credere alla sconfitta, Mew ti ringrazia
// telepaticamente e se ne va con lui, Tom e Maso si danno per vinti e se ne
// vanno (anche loro, comico), infine una voce fuori campo avverte che
// nella stanza resta ancora energia psichica — Mewtwo torna DAVVERO
// catturabile (lotta selvatica normale) dopo 2 giorni di gioco da questo
// momento, vedi la condizione "giorni_passati:" sull'oggetto Tiled
// 'leggendario' piazzato nella stessa stanza (sprites/maps_tiled/
// bunkerino_3f.tmj) e il passo 'salva_giorno' qui sotto.
const EPILOGO_BUNKERINO_MEWTWO = [
  { tipo: 'dialogo', nome: 'Mewtwo', testo: [
    '...Non ci posso credere.',
    'Come diavolo è possibile?! Il mio piano era perfetto. PERFETTO.',
    'Ogni calcolo, ogni variabile, ogni possibilità... e tu, un semplice allenatore, le hai ignorate tutte, una dopo l\'altra.',
    '...',
    'Forse non sono poi così superiore come credevo di essere. O forse tu sei semplicemente qualcosa che nessun calcolo poteva prevedere.',
  ] },
  { tipo: 'guarda', npc: 'mew_bunkerino_finale', direzione: 'sud' },
  { tipo: 'dialogo', nome: 'Mew (telepaticamente)', testo: [
    'Grazie per aver salvato il mondo insieme a me.',
  ] },
  { tipo: 'guarda', npc: 'mew_bunkerino_finale', direzione: 'ovest' },
  { tipo: 'guarda', npc: 'mewtwo_bunkerino_finale_npc', direzione: 'est' },
  { tipo: 'fade_out', ms: 1000 },
  { tipo: 'nascondi_npc', npc: 'mew_bunkerino_finale' },
  { tipo: 'nascondi_npc', npc: 'mewtwo_bunkerino_finale_npc' },
  { tipo: 'aspetta', ms: 200 },
  { tipo: 'fade_in', ms: 1000 },
  { tipo: 'guarda', npc: 'capo_cotral_tom_cameo', direzione: 'est' },
  { tipo: 'guarda', npc: 'capo_cotral_maso_cameo', direzione: 'ovest' },
  { tipo: 'dialogo', nome: 'Tom', testo: ['Maledetta... possibile che perda anche stavolta?'] },
  { tipo: 'dialogo', nome: 'Maso', testo: [
    'E mo\' che famo?',
    'Proviamo da Lele Burger: quello apre un locale nuovo ogni due anni, magari cerca gente.',
  ] },
  { tipo: 'dialogo', nome: 'Tom', testo: ['Daje, annamo via da qui prima che arriva qualcun altro.'] },
  { tipo: 'fade_out', ms: 1000 },
  { tipo: 'nascondi_npc', npc: 'capo_cotral_tom_cameo' },
  { tipo: 'nascondi_npc', npc: 'capo_cotral_maso_cameo' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_1' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_2' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_3' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_4' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_5' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_6' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_7' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_8' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_9' },
  { tipo: 'nascondi_npc', npc: 'bunkerino_3f_guardia_10' },
  { tipo: 'aspetta', ms: 200 },
  { tipo: 'fade_in', ms: 1000 },
  { tipo: 'dialogo', nome: '???', testo: [
    'Qui c\'è ancora energia psichica. Torna tra un po\' a ricontrollare.',
  ] },
  { tipo: 'salva_giorno', nome: 'bunkerino_mewtwo_vuoto_giorno' },
  { tipo: 'flag', nome: 'bunkerino_mewtwo_sconfitto', valore: true },
  // flag_fine del trigger Tiled "INIZIO CUTSCENE": da QUI in poi il
  // rettangolo non fa più ripartire nessuna cutscene (si è vinto per
  // davvero) — settato a mano perché _checkTriggerCutsceneEntra lo
  // controlla ma non lo scrive mai da sola.
  { tipo: 'flag', nome: 'bunkerino_finale_mewtwo_vista', valore: true },
];

CUTSCENE['bunkerino_finale_mewtwo'] = [
  { tipo: 'dialogo', nome: 'xxxx', testo: [
    'Due capisquadra. Due Pokémon donati personalmente da me. E nemmeno così siete riusciti a fermare un solo intruso.',
    'Tom. Maso. Vi avevo chiesto una cosa sola: non farlo arrivare fin qui.',
    'Non importa. Come sempre, se una cosa deve essere fatta per bene, la faccio io.',
  ] },
  { tipo: 'fade_out', ms: 1000 },
  { tipo: 'cambia_sprite', npc: 'mewtwo_bunkerino_finale_npc', sprite: 'mewtwo' },
  { tipo: 'aspetta', ms: 200 },
  { tipo: 'fade_in', ms: 1000 },
  { tipo: 'guarda', npc: 'mewtwo_bunkerino_finale_npc', direzione: 'sud' },
  { tipo: 'dialogo', nome: 'Mewtwo', testo: ['Avvicinati.'] },
  { tipo: 'muovi_player', direzione: 'nord', passi: 4 },
  { tipo: 'guarda', npc: 'capo_cotral_tom_cameo', direzione: 'est' },
  { tipo: 'guarda', npc: 'capo_cotral_maso_cameo', direzione: 'ovest' },
  { tipo: 'aspetta', ms: 1000 },
  { tipo: 'dialogo', nome: 'Mewtwo', testo: [
    'Ti osservo da quando hai messo piede in questo posto.',
    'Un ragazzino che attraversa palestre, Lega, Superquattro... e crede che la storia finisca con una medaglia e un trono.',
    'Io sono stato creato per essere più di questo. Più di loro. Più di chiunque.',
  ] },
  { tipo: 'dialogo', nome: 'Mewtwo', testo: [
    'Il Progetto 150 non si è fermato quando sono nato io. Ho solo capito cosa farne, da solo, mentre i miei creatori litigavano su cosa fossi davvero.',
    'Clonazione. La stessa tecnologia che ha dato vita a me. Non la sprecherò per creare un\'altra copia imperfetta come me: la userò per potenziare ogni Pokémon, ogni allenatore, ogni creatura di questi Castelli.',
    'Non saranno più sé stessi. Saranno strumenti. Lotteranno per me, convinti di lottare per sé stessi.',
  ] },
  { tipo: 'dialogo', nome: 'Mewtwo', testo: [
    'Controllare il meteo, come hanno provato a fare i tuoi amici del GdF con Kyogre e Groudon, con tutta la loro ambizione minuscola... è stato solo l\'inizio. Un esperimento. E nemmeno mio.',
    'Io controllerò tutto. I Castelli, le persone, i Pokémon. E nessuno — nessuno — potrà fermarmi.',
    'Niente potrà fermare questo piano. Nemmeno io, se anche volessi tornare indietro adesso. E non voglio.',
  ] },
  { tipo: 'trema', ms: 400, intensita: 0.012 },
  { tipo: 'flag', nome: 'bunkerino_finale_mew_rivelato', valore: true },
  { tipo: 'fade_out', ms: 800 },
  { tipo: 'rigenera_npc' },
  { tipo: 'cambia_sprite', npc: 'mew_bunkerino_finale', sprite: 'mew' },
  // 'rigenera_npc' ricostruisce TUTTI gli NPC da zero (rilegge le
  // condizioni per far spuntare Mew), quindi Mewtwo torna temporaneamente
  // al suo sprite di travestimento di default — va ri-applicato qui,
  // altrimenti si "smaschera" da solo appena Mew si rivela (bug segnalato
  // da Luca, 12 ott 2026).
  { tipo: 'cambia_sprite', npc: 'mewtwo_bunkerino_finale_npc', sprite: 'mewtwo' },
  { tipo: 'fade_in', ms: 800 },
  { tipo: 'esclamativo', npc: 'mewtwo_bunkerino_finale_npc', durata: 700 },
  { tipo: 'guarda', npc: 'mewtwo_bunkerino_finale_npc', direzione: 'est' },
  { tipo: 'dialogo', nome: 'Mewtwo', testo: [
    '...Tu.',
    'Pensavo che Villa Aldobrandini ti avesse nascosto meglio. O forse è solo perché hai voluto farti trovare, proprio ora.',
    'Ci incontriamo di nuovo, dopo tutto questo tempo. L\'originale e la copia, ancora una volta nella stessa stanza.',
    'Sei venuto a fermarmi? O sei venuto solo a guardare, come hai sempre fatto?',
    'Non importa. Qualunque cosa tu sia venuto a fare, non cambierà quello che sta per succedere qui.',
    'Resta pure a guardare, se vuoi. Oppure...',
  ] },
  { tipo: 'guarda_reciproco', npc: 'mew_bunkerino_finale' },
  { tipo: 'flag', nome: 'bunkerino_finale_mewtwo_intro_vista', valore: true },
  { tipo: 'scelta_si_no', messaggio: 'Vuoi Mew in squadra per questa lotta?', testoSi: 'Sì', testoNo: 'No', salva_flag: 'bunkerino_finale_usa_mew' },
  { tipo: 'sostituisci_squadra_temporaneo', messaggio: 'Quale Pokémon metti da parte per Mew?', pokemon: 151, richiede_flag: 'bunkerino_finale_usa_mew' },
  { tipo: 'battaglia', trainer: 'mewtwo_bunkerino_finale', squadraAsync: 'costruisciSquadraMewtwoFinale' },
  ...EPILOGO_BUNKERINO_MEWTWO,
];

// Versione "ripresa" (dopo una sconfitta): salta dritta al faccia a faccia
// con Mew e alla scelta, senza rifare rimprovero/trasformazione/monologo —
// vedi flag_ripresa/cutscene_id_ripresa sull'oggetto Tiled "INIZIO CUTSCENE".
CUTSCENE['bunkerino_finale_mewtwo_ripresa'] = [
  { tipo: 'dialogo', nome: 'Mewtwo', testo: [
    'Sei tornato. Non mi aspettavo niente di diverso, in realtà.',
    'Riprendiamo da dove avevamo lasciato.',
  ] },
  { tipo: 'scelta_si_no', messaggio: 'Vuoi Mew in squadra per questa lotta?', testoSi: 'Sì', testoNo: 'No', salva_flag: 'bunkerino_finale_usa_mew' },
  { tipo: 'sostituisci_squadra_temporaneo', messaggio: 'Quale Pokémon metti da parte per Mew?', pokemon: 151, richiede_flag: 'bunkerino_finale_usa_mew' },
  { tipo: 'battaglia', trainer: 'mewtwo_bunkerino_finale', squadraAsync: 'costruisciSquadraMewtwoFinale' },
  ...EPILOGO_BUNKERINO_MEWTWO,
];

/* ── ANTRO KYOGRE, piano 9 (sess. 14 ott 2026, staging di Luca) ──
   Trigger: oggetto Tiled "inizio cutscene" (trigger_cutscene, quando:'entra',
   flag_fine:'antro9_kyogre_rapito') su antro_kyogre_9.tmj. Matilde e Isa
   (cameo, dati/npc.js 'npc_antro_kyogre_9_5'/'_6') e "boss gdf" (Lorenzo,
   dati/npc.js) discutono, poi il Comandante GdF ruba Kyogre con una
   Masterball e sparisce con tutti i Grunt del piano — stessa tecnica già
   vista al Rifugio di Marino/Grotta del Vulcano (fade_out dopo l'ultima
   battuta, non prima). La scelta sì/no con Matilde è VOLUTAMENTE fittizia
   (Luca: "qualsiasi cosa premi, lo prendo per un sì"): il flag salvato non
   viene mai letto da nessuna parte, si procede sempre uguale. Alla fine si
   imposta 'pietra_zaffiro_ottenuta' — lo STESSO flag che già apre i piani
   interni della Grotta del Vulcano (vedi 'gdf_gate_grotta_vulcano' in
   dati/npc.js): così il "poliziotto" di Rocca di Papa fa passare anche
   arrivando da questa strada, senza bisogno di toccare quel gate. */
CUTSCENE['antro_kyogre_9_matilde_isa'] = [
  { tipo: 'guarda', npc: 'npc_antro_kyogre_9_5', direzione: 'est' },
  { tipo: 'guarda', npc: 'npc_antro_kyogre_9_6', direzione: 'est' },
  { tipo: 'guarda', npc: 'boss gdf', direzione: 'ovest' },
  { tipo: 'dialogo', nome: 'Matilde', testo: [
    'Isa, dimmelo tu: hanno davvero intenzione di prendere Kyogre?',
    'Il lago si sta già ritirando anno dopo anno, con questo clima impazzito. Se gli tolgono anche il suo guardiano, è finita.',
  ] },
  { tipo: 'dialogo', nome: 'Isa', testo: [
    'Lo so bene. Kyogre non è un trofeo: è l\'unica speranza che resta a questi laghi, alle vigne, a tutti i Castelli.',
    'Senza di lui i Castelli Romani smettono di essere la perla che sono sempre stati. E al GdF non importa niente di tutto questo.',
  ] },
  { tipo: 'aspetta', ms: 400 },
  { tipo: 'esclamativo', npc: 'npc_antro_kyogre_9_5', durata: 700 },
  { tipo: 'esclamativo', npc: 'npc_antro_kyogre_9_6', durata: 700 },
  { tipo: 'esclamativo', npc: 'boss gdf', durata: 700 },
  { tipo: 'guarda', npc: 'npc_antro_kyogre_9_5', direzione: 'sud' },
  { tipo: 'guarda', npc: 'npc_antro_kyogre_9_6', direzione: 'sud' },
  { tipo: 'guarda', npc: 'boss gdf', direzione: 'sud' },
  { tipo: 'trema', ms: 400, intensita: 0.012 },
  { tipo: 'dialogo', nome: 'Lorenzo', testo: [
    'Ah ah ah! Tutto come previsto.',
    'Solo un vero castellano, con il cuore puro e la Pietra Zaffiro, può risvegliare Kyogre. Grazie, {nome}.',
    'Da qui ci penso io. Grazie alla mia Masterball.',
  ] },
  { tipo: 'guarda', npc: 'boss gdf', direzione: 'nord' },
  { tipo: 'fade_out', ms: 1000 },
  { tipo: 'flag', nome: 'antro9_kyogre_rapito', valore: true },
  { tipo: 'nascondi_npc', npc: 'kyogre_antro9_cutscene' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 600 },
  { tipo: 'dialogo', nome: 'Lorenzo', testo: [
    'Ah ah ah! Grazie a voi possiedo il re del lago!',
    'Addio... non mi prenderete mai!',
  ] },
  { tipo: 'fade_out', ms: 1000 },
  { tipo: 'nascondi_npc', npc: 'boss gdf' },
  { tipo: 'rigenera_npc' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 600 },
  { tipo: 'guarda_reciproco', npc: 'npc_antro_kyogre_9_5' },
  { tipo: 'dialogo', nome: 'Matilde', testo: [
    'Manco con un 20 critico lo prendevi, sai? Ci è riuscito solo con quella Masterball.',
  ] },
  { tipo: 'dialogo', nome: 'Isa', testo: [
    'Kyogre va riportato dove deve stare. I Castelli vanno salvati, prima che sia davvero troppo tardi.',
  ] },
  { tipo: 'dialogo', nome: 'Matilde', testo: ['{nome}, ci aiuterai?'] },
  { tipo: 'scelta_si_no', messaggio: 'Ci aiuterai?', testoSi: 'Sì', testoNo: 'No', salva_flag: 'antro9_matilde_risposta' },
  { tipo: 'dialogo', nome: 'Matilde', testo: [
    'Come hai detto? Con questo casino e l\'acqua scrosciante non riesco a sentirti... lo prendo per un sì.',
  ] },
  { tipo: 'flag', nome: 'pietra_zaffiro_ottenuta', valore: true },
  { tipo: 'fade_out', ms: 800 },
  { tipo: 'nascondi_npc', npc: 'npc_antro_kyogre_9_5' },
  { tipo: 'nascondi_npc', npc: 'npc_antro_kyogre_9_6' },
  { tipo: 'aspetta', ms: 200 },
  { tipo: 'fade_in', ms: 800 },
];

/* ── ABBAZIA DI SAN NILO (sess. 14 ott 2026, staging di Luca) ──
   Trigger: oggetto Tiled "inizio cutscene" (trigger_cutscene, quando:'entra',
   flag_fine:'abbazia_sannilo_ginevra_sconfitta') su Interno_San_Nilo.tmj.
   Terza e ultima password del Rifugio GdF di Marino. Igino (il monaco che ha
   cresciuto Ginevra, dati/npc.js 'gdf_sannilo_igino') la affronta a parole,
   poi nota il giocatore, racconta di essere stato ingannato (le ha detto
   lui dove trovare Zaffiro e Rubino), e la lotta vera parte da sola. A
   vittoria Ginevra NON si arrende davvero — finta promessa, poi fugge con
   tutti i grunt (gate su 'gdf_sannilo_ginevra_sconfitta', tutti i loro
   oggetti Tiled). Resta solo il "grunt_traditore" (ex allievo di Igino
   anche lui, gate separato su 'gdf_sannilo_traditore_partito'): consegna
   LUI la password a Igino, che a sua volta la dà al giocatore — imposta
   'abbazia_password' (controllato da _controllaPasswordRifugio, js/map.js,
   che a sua volta scrive 'password_rifugio_completa' quando anche le altre
   due parti sono vere). */
CUTSCENE['abbazia_sannilo_ginevra_igino'] = [
  { tipo: 'guarda', npc: 'gdf_sannilo_ginevra', direzione: 'est' },
  { tipo: 'guarda', npc: 'gdf_sannilo_igino', direzione: 'ovest' },
  { tipo: 'dialogo', nome: 'Igino', testo: [
    'Ginevra... eri la mia più grande allieva. Il mio orgoglio.',
    'Come puoi fare questo? Come puoi violare la sacralità di quest\'Abbazia e schierarti con questa gente?!',
  ] },
  { tipo: 'dialogo', nome: 'Ginevra', testo: [
    'La sacralità? Ho passato anni chinata su questi libri, Igino, a pregare per un mondo che non ascoltava mai nessuno di noi.',
    'Il GdF ascolta. Il GdF agisce. E io sono stanca di aspettare un miracolo che non arriva.',
  ] },
  { tipo: 'dialogo', nome: 'Igino', testo: [
    'Non è questa la via! Controllare il meteo, manovrare l\'economia dei Castelli con la paura... non è potere, è un tradimento verso tutto ciò che ti ho insegnato.',
  ] },
  { tipo: 'dialogo', nome: 'Ginevra', testo: [
    'Tu mi hai insegnato la pazienza, maestro. Loro mi hanno dato uno scopo. Non confondere le due cose.',
  ] },
  { tipo: 'dialogo', nome: 'Igino', testo: [
    'Uno scopo costruito su pietre rubate e minacce velate non è uno scopo: è una condanna. E tu lo sai bene, in fondo.',
  ] },
  { tipo: 'dialogo', nome: 'Ginevra', testo: [
    'Forse. Ma è una condanna che ho scelto io, con le mie mani — non una vita intera a servire qualcosa di più grande di me senza mai contare niente.',
  ] },
  { tipo: 'aspetta', ms: 500 },
  { tipo: 'esclamativo', npc: 'gdf_sannilo_igino', durata: 700 },
  { tipo: 'guarda', npc: 'gdf_sannilo_igino', direzione: 'sud' },
  { tipo: 'dialogo', nome: 'Igino', testo: [
    'Ah, {nome}, sei tu! Sentivo dei frastuoni fin dal chiostro — hai sconfitto tu tutti questi scagnozzi, da solo?',
  ] },
  { tipo: 'dialogo', nome: 'Igino', testo: [
    'Ginevra io la conosco bene, forse troppo bene: mi ha ingannato. Non pensavo fosse un\'infiltrata del GdF, mai.',
    'Sono stato io, senza saperlo, a dirle dove trovare la Pietra Zaffiro e la Pietra Rubino. Un errore che porterò sulla coscienza per molto tempo.',
    'Ma ora l\'ho scoperta. E vanno fermati, lei e tutto il suo Team, il più presto possibile.',
  ] },
  { tipo: 'guarda', npc: 'gdf_sannilo_igino', direzione: 'ovest' },
  { tipo: 'dialogo', nome: 'Ginevra', testo: [
    'Vieni pure, allora. Provaci a fermarmi.',
  ] },
  { tipo: 'battaglia', trainer: 'gdf_sannilo_ginevra' },

  // ── Solo se hai VINTO (con una sconfitta la scena si è già interrotta) ──
  { tipo: 'dialogo', nome: 'Ginevra', testo: [
    'Va bene... va bene! Lasciami andare, ti prego. In cambio ti do la password del Rifugio, parola mia.',
  ] },
  { tipo: 'aspetta', ms: 1000 },
  { tipo: 'dialogo', nome: 'Ginevra', testo: [
    'Ahahah! Illusi, davvero pensavate che mi sarei arresa così facilmente?',
    'Me ne vado. Non riuscirete mai a fermare il GdF!',
  ] },
  { tipo: 'fade_out', ms: 500 },
  { tipo: 'flag', nome: 'gdf_sannilo_ginevra_sconfitta', valore: true },
  { tipo: 'rigenera_npc' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 500 },

  // Resta solo il grunt_traditore (non era gated sulla stessa flag): cammina
  // verso Igino e si rivela.
  { tipo: 'muovi_npc', npc: 'gdf_sannilo_traditore', direzione: 'sud', passi: 2 },
  { tipo: 'muovi_npc', npc: 'gdf_sannilo_traditore', direzione: 'ovest', passi: 2 },
  { tipo: 'guarda', npc: 'gdf_sannilo_traditore', direzione: 'est' },
  { tipo: 'guarda', npc: 'gdf_sannilo_igino', direzione: 'ovest' },
  { tipo: 'dialogo', nome: '???', testo: [
    'Maestro Igino... non so se vi ricordate di me. Ero anche io un vostro allievo, tanto tempo fa.',
    'Non riconosco più il Team che ho servito. Quello che hanno fatto a quest\'Abbazia, quello che stanno per fare ai Castelli... non è per questo che mi ero unito a loro.',
    'Voglio aiutarvi a fermarli. In nome dei vecchi tempi, vi consegno l\'ultima password per accedere al Rifugio di Marino.',
  ] },
  { tipo: 'fade_out', ms: 1000 },
  { tipo: 'flag', nome: 'gdf_sannilo_traditore_partito', valore: true },
  { tipo: 'rigenera_npc' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 1000 },

  { tipo: 'guarda', npc: 'gdf_sannilo_igino', direzione: 'sud' },
  { tipo: 'dialogo', nome: 'Igino', testo: [
    '{nome}, te la consegno io, a questo punto. Mi raccomando: fanne buon uso.',
  ] },
  { tipo: 'oggetto', contenuto: 'password_3', chiave: true },
  { tipo: 'flag', nome: 'abbazia_password', valore: true },
];

/* ── Finale della Lega: Remo sconfitto (19 ott 2026, richiesta esplicita
   di Luca) ── Dopo la primissima vittoria sul Campione: lui non capisce
   come tu ci sia riuscito, poi titoli di coda scherzosi su schermo nero,
   e si ritorna davanti a casa a Borgata Tuscolana. Da lì in poi: Amintore
   (la guardia, dati/npc.js 'guardia_borgata') ha una battuta nuova se gli
   parli, e il Prof. Castagno (interagisciLaboratorio, js/app.js) regala
   la MN Sub alla prossima visita — nessuno dei due si muove da solo verso
   il giocatore qui, troppo rischioso scriptare un lungo cammino su una
   mappa diversa da questa: ci pensa il giocatore a tornare a parlargli. */
CUTSCENE['lega_finale_remo'] = [
  { tipo: 'dialogo', nome: '{{RIVALE}}', testo: [
    'Cosa...? Non è possibile. Io sono il Campione della Lega di Colonna. Nessuno mi batte, nessuno MAI.',
    'Eppure tu l\'hai fatto. {maschile|femminile}, da dove vieni? Come hai fatto ad arrivare fin qui così forte?',
    'Non lo capisco. Non lo capisco e forse non lo capirò mai. Ma un Campione sa riconoscere chi lo supera.',
    'Il titolo è tuo, {nome}. Porta il nome dei Castelli Romani con onore, ovunque tu vada da qui in avanti.',
  ] },
  { tipo: 'flag', nome: 'legaCompletata', valore: true },
  { tipo: 'aspetta', ms: 400 },
  { tipo: 'fade_out', ms: 900 },
  { tipo: 'dialogo', nome: '', testo: [
    'POKÉMON CASTELLI ROMANI',
    'by Marcs',
    '— un gioco fatto in casa, a tarda notte, a forza di caffè e testardaggine —',
    'Grazie per aver giocato. Sì, anche tu che stai leggendo i titoli di coda per sbaglio.',
    'La storia continua...',
  ] },
  { tipo: 'cambia_mappa', mappa: 'borgata_tuscolana', spawn: 'da_casamia_1f' },
  { tipo: 'aspetta', ms: 300 },
  { tipo: 'fade_in', ms: 900 },
];

/* ── Risfida del Campione (19 ott 2026): dalla SECONDA vittoria su Remo
   in poi — niente dialogo/titoli di coda (quelli solo la prima volta,
   vedi 'lega_finale_remo' sopra), solo schermo nero, squadra curata, e
   si torna davanti a casa a Borgata Tuscolana. ── */
CUTSCENE['lega_risfida_remo'] = [
  { tipo: 'fade_out', ms: 700 },
  { tipo: 'cura_squadra' },
  { tipo: 'cambia_mappa', mappa: 'borgata_tuscolana', spawn: 'da_casamia_1f' },
  { tipo: 'aspetta', ms: 200 },
  { tipo: 'fade_in', ms: 700 },
];
