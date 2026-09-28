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
