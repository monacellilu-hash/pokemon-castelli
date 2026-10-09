/* dati/filler_npc.js — Battute di riempimento per gli NPC "orfani" (senza
   una voce propria in dati/npc.js, né una proprietà "dialogo" sull'oggetto
   Tiled): richiesta di Luca, 6 ott 2026 — "ogni NPC deve avere un dialogo,
   riguardante la città/zona in cui si trova, o random se si trova in un
   percorso. Ma qualcosa deve dire".

   Contenuto preso da docs/DIALOGHI-NPC.md (scritto da Luca, mai collegato
   al motore prima d'ora) — battute in romanesco a tema per ognuna delle 12
   città/zone principali. FILLER_GENERICO è nuovo (richiesto qui): usato per
   qualunque mappa che non corrisponda a nessuna città (percorsi, grotte,
   dungeon, tunnel...).

   Uso: vedi _dialogoFillerPerNpc in js/map.js (sceglie città/generico in
   base al nome della mappa corrente, poi una battuta deterministica in
   base all'id dell'NPC, cosi' non cambia a ogni interazione). */

const FILLER_NPC_PER_CITTA = {
  BORGATA_TUSCOLANA: [
    { nome: 'Sora Pina', testo: 'A regà, ma \'ndo vai co\' quel bestione? Ai miei tempi se usciva co\' \'na fionda e bastava!' },
    { nome: 'Ragazzino', testo: 'Mio cugino dice che il suo Rattata è il più forte de tutto er quartiere. Secondo me dice fregnacce.' },
    { nome: 'Pensionato', testo: 'Una volta qui era tutta campagna. Mo\' è tutto un Pidgey che te ruba la merenda.' },
    { nome: 'Tizio del GRA', testo: 'Esci dar raccordo? Prima volta? In bocca ar lupo… ai Castelli mangiano li romani.' },
    { nome: 'Signora con la borsa', testo: 'Se vai dal Professore digli che me deve ancora ridà la teglia. Trent\'anni che aspetto.' },
  ],
  FRASCATI: [
    { nome: 'Settimio il cantiniere', testo: 'Sai qual è il segreto del Frascati DOC? L\'uva. E un Oddish che tiene lontane le lumache. Genio mio.' },
    { nome: 'Turista perso', testo: 'Scusa, la Villa Aldobrandini? Cammino da un\'ora e trovo solo Pidgey che ridono.' },
    { nome: 'Oste', testo: 'Qui se beve bene e se lotta meglio. Vinicio? Quello te frega co\' le piante, attento.' },
    { nome: 'Ragazza con l\'ombrellino', testo: 'Dicono che di notte, alle fontane di Villa Aldobrandini, si vede \'na cosa rosa che svolazza. Sarà er vino, mah.' },
    { nome: 'Vecchietto', testo: 'Ai miei tempi se lottava co\' le bocce, mica coi Pokémon. E se vinceva pure.' },
  ],
  GROTTAFERRATA: [
    { nome: 'Cesare il fornaio', testo: 'Pizza bianca appena sfornata! Manco il tuo Pokémon resiste all\'odore. Anvedi come drizza le orecchie.' },
    { nome: 'Fra\' Bartolo', testo: 'Pace a te, viandante. E pure al tuo… come si chiama? Ah, un Pokémon. Bene, anche lui è creatura.' },
    { nome: 'Anselmo il rigattiere', testo: 'Roba usata, roba bona! C\'ho pure \'na Poké Ball mezza ammaccata, te la do a metà prezzo.' },
    { nome: 'Studentessa', testo: 'Studio l\'abbazia da tre mesi. I monaci coi Pokémon Psico so\' più tranquilli de me prima de \'n esame.' },
    { nome: 'Tizio col cane', testo: 'No, \'sto qua è un cane normale eh. Non tutto quello che cammina è un Pokémon, oh.' },
  ],
  MARINO: [
    { nome: 'Nello il vignarolo', testo: 'Alla Sagra dell\'Uva dalla fontana esce VINO. Giuro! L\'anno scorso un Magikarp c\'è cascato dentro e è uscito allegro.' },
    { nome: 'Pina della Sagra', testo: 'Te la prepari la cesta pe\' la Sagra? Porta un Pokémon Acqua, che se la fontana s\'intasa serve.' },
    { nome: 'Bambino bagnato', testo: 'So\' caduto nella fontana. Matilde ha riso. Pure il suo Gyarados ha riso.' },
    { nome: 'Pescatore annoiato', testo: 'Pesco da stamattina. Solo Magikarp. Sempre Magikarp. UN Magikarp lo vòi?' },
    { nome: 'Signora', testo: 'Marino è la città del vino. E del traffico. Soprattutto del traffico.' },
  ],
  MONTE_PORZIO: [
    { nome: 'Ruggero il meteorologo', testo: 'Tra qualche giorno piove. E quando piove qui, sull\'osservatorio, i fulmini fanno cose strane. Tiè, segnatelo.' },
    { nome: 'Aldo l\'astrofilo', testo: 'La notte, nei giorni dispari, col telescopio si vedono cose… Una volta ho visto \'na stella che s\'è mossa. O era \'n moscerino.' },
    { nome: 'Studente di astronomia', testo: 'Biretta è la Capopalestra più sveglia dei Castelli. Letteralmente: non dorme mai, guarda le stelle.' },
    { nome: 'Vecchietto col cappello', testo: 'Lassù all\'osservatorio fanno la scienza. Io guardo le stelle dalla finestra e mi basta.' },
    { nome: 'Ragazza', testo: 'C\'ho un Magnemite che si attacca alla calamita del frigo. Comodo, ma poi non se stacca più.' },
  ],
  ROCCA_DI_PAPA: [
    { nome: 'Faustino il funicolarista', testo: 'La funicolare risale dal \'32! Su, in cima, fa freddo pure d\'agosto. C\'è chi giura d\'aver visto un uccello tutto ghiaccio.' },
    { nome: 'Bruno la guida', testo: 'La Via Sacra la fecero i romani, basolo su basolo. Quassù i Pokémon Roccia so\' duri come \'sti sassi.' },
    { nome: 'Anziano del Carpino', testo: 'Maschio delle Faete, Monte Cavo… i due giganti. Da ragazzo ci salivo a piedi. Mo\' ce mando il Pokémon.' },
    { nome: 'Signora col cane', testo: 'Il mio Growlithe non vole più camminà in salita. Pure lui s\'è romanizzato.' },
    { nome: 'Ragazzino', testo: 'Ho sentito un BOOM sotto terra ieri notte. Papà dice è il vulcano. Mamma dice è papà dopo i fagioli.' },
  ],
  ALBANO: [
    { nome: 'Settimio il legionario', testo: 'AVE! Qui stanziava la Seconda Legione Partica. Massimo tiene viva la disciplina. E mena pure forte.' },
    { nome: 'Storico', testo: 'I Castra Albana, l\'accampamento, le terme di Cellomaio… Albano è Roma in piccolo. Coi Pokémon in più.' },
    { nome: 'Bambino con la spada di legno', testo: 'Da grande faccio il Capopalestra de Lotta come Massimo! Intanto meno mi\' sorella. Per allenarmi.' },
    { nome: 'Nonna Assunta', testo: 'Fijo, quella canna vale più de te. Aiutami a ripescalla e t\'imparo a nuotà coi Pokémon.' },
    { nome: 'Tizio sospettoso', testo: 'Hai visto pure tu quelli vestiti di grigioverde gironzolà vicino al lago? Non me piaceno per niente.' },
  ],
  ARICCIA: [
    { nome: 'Sora Nunzia', testo: 'Porchetta e vino, fijo! Mangia, che pure il tuo Pokémon c\'ha \'na faccia smunta. Tiè, \'na fetta pure a lui.' },
    { nome: 'Peppe er porchettaro', testo: 'Porchetta de Ariccia IGP, mica pizza e fichi! L\'aroma fa svenì pure gli Houndoom de Isa.' },
    { nome: 'Il vecchio del ponte', testo: 'Di giorno è solo un ponte. Di notte… guarda mejo le ombre. A volte te guardano indietro.' },
    { nome: 'Musicista', testo: 'Suono nelle fraschette. Di notte qui i Pokémon Buio escono a sentì la musica. Pubblico strano, ma applaude.' },
    { nome: 'Turista', testo: 'Sono venuto pe\' la porchetta. So\' rimasto pe\' la porchetta. Domani? Ancora porchetta.' },
  ],
  GENZANO: [
    { nome: 'Romolo il panettiere', testo: 'Pane de Genzano IGP, fijo! Crosta che canta. Ce reggi sopra pure un Snorlax e non se rompe.' },
    { nome: 'Iolanda dell\'Infiorata', testo: 'Ogni giugno copriamo la via di petali. Un anno feci un Gyarados tutto de fiori. Venne \'na meraviglia.' },
    { nome: 'Bambina', testo: 'Camilla è bravissima coi fiori. Ma se la fai arrabbià, i suoi Folletto te le sòneno. Delicati de fuori, cattivelli de dentro.' },
    { nome: 'Fioraio', testo: 'Petali a tonnellate per l\'Infiorata. E un Bellsprout che me li sceglie pe\' colore. Dipendente modello.' },
    { nome: 'Vecchietto', testo: 'Dopo Genzano c\'è la Via Vittoria. Robba seria. Curate bene, e non te fa\' fregà dal panorama.' },
  ],
  CASTEL_GANDOLFO: [
    { nome: 'Guardia', testo: 'La residenza è zona riservata. No, non puoi entrà. No, nemmeno col Pokédex.' },
    { nome: 'Tonino il barcaiolo', testo: 'Giro sul lago? Co\' \'sto Surf che ce vòi a remà. Dicono che giù in fondo dorme qualcosa de grosso… io non scendo.' },
    { nome: 'Signora buffa', testo: 'Il Papa c\'ha un Pokémon? Dicono de sì. Dicono che è un… Slowpoke. Ce sta tutto, no?' },
  ],
  NEMI: [
    { nome: 'Rosa la fragolara', testo: 'Fragoline de Nemi, le più piccole e le più bone! Una pe\' te, una pe\' me, una… ndo\' è finita? L\'ha presa er Pokémon.' },
    { nome: 'Custode del Museo', testo: 'Qui c\'erano le navi di Caligola. E dicono… altre cose, custodite. Roba antica. Roba che è mejo non svejà.' },
    { nome: 'Pescatore', testo: 'Lo specchio de Diana, lo chiamano. La notte è tutta un\'altra storia. C\'è chi giura d\'aver visto correre \'na cosa sull\'acqua.' },
  ],
  COLONNA: [
    { nome: 'Anziano', testo: 'Qui c\'è la Lega. Solo i mejo ce arrivano. Tu… mah, vedremo.' },
    { nome: 'Tizio davanti al Bunkerino', testo: 'Quella cantina laggiù? Strana. Entra gente in camice, esce gente che non parla. Io me faccio li fatti mia.' },
    { nome: 'Ragazzo', testo: 'Hai battuto tutte e otto le palestre? E mo\' viene il difficile. In bocca ar lupo, campione.' },
  ],
};

// Battute generiche (nessuna città): percorsi, grotte, dungeon, tunnel...
// Scritte apposta per questo fix (non erano in DIALOGHI-NPC.md, che copriva
// solo le città), stesso tono/stile delle altre.
const FILLER_NPC_GENERICO = [
  { nome: 'Viandante', testo: 'Questo percorso non finisce mai, eh? Pure i Rattata se so\' stufati de girà in tondo.' },
  { nome: 'Escursionista', testo: 'Hai visto \'na Poké Ball a terra da queste parti? No? Vabbè, sarà stata \'n\'allucinazione mia.' },
  { nome: 'Passante', testo: 'Io cammino, cammino, e vedo sempre lo stesso albero. O so\' io che gira in tondo?' },
  { nome: 'Allenatore di passaggio', testo: 'Allenatore pure tu, eh? Bella vita de strada, no? Anche se i piedi dicono il contrario.' },
  { nome: 'Tizio con lo zaino', testo: 'Attento ai Pokémon nell\'erba alta, certe volte spuntano quando meno te l\'aspetti.' },
  { nome: 'Turista', testo: 'Ogni tanto mi fermo qui giusto pe\' guardà il panorama. Poi riparto, che devo arrivà prima del buio.' },
  { nome: 'Vecchio del posto', testo: 'Hai già un bel po\' de Pokémon in squadra, eh? Io invece so\' ancora alla ricerca del primo.' },
  { nome: 'Camminatore', testo: 'Fa un caldo bestiale oggi. O so\' io che ho camminato troppo?' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FILLER_NPC_PER_CITTA, FILLER_NPC_GENERICO };
}
