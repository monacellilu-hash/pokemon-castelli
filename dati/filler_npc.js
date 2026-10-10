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
  // Conversione del 10 ott 2026 (richiesta esplicita di Luca, item 1 del
  // mega-prompt: "troppi dialoghi in dialetto, almeno il 60% in italiano
  // corretto"): in ogni gruppo le prime righe sono state riscritte in
  // italiano standard, le ultime restano in romanesco per non perdere
  // tutto il colore locale — bilancio voluto, non un errore se ne vedi
  // ancora qualcuna in dialetto.
  BORGATA_TUSCOLANA: [
    { nome: 'Sora Pina', testo: 'Ma dove vai con quella bestia enorme? Ai miei tempi si usciva con una fionda e bastava!' },
    { nome: 'Ragazzino', testo: 'Mio cugino dice che il suo Rattata è il più forte di tutto il quartiere. Secondo me dice solo sciocchezze.' },
    { nome: 'Pensionato', testo: 'Una volta qui era tutta campagna. Adesso è tutto un continuo di Pidgey che ti rubano la merenda.' },
    { nome: 'Tizio del GRA', testo: 'Esci dar raccordo? Prima volta? In bocca ar lupo… ai Castelli mangiano li romani.' },
    { nome: 'Signora con la borsa', testo: 'Se vai dal Professore digli che me deve ancora ridà la teglia. Trent\'anni che aspetto.' },
  ],
  FRASCATI: [
    { nome: 'Settimio il cantiniere', testo: 'Sai qual è il segreto del Frascati DOC? L\'uva. E un Oddish che tiene lontane le lumache. Genio, vero?' },
    { nome: 'Turista perso', testo: 'Scusa, la Villa Aldobrandini? Cammino da un\'ora e trovo solo Pidgey che ridono.' },
    { nome: 'Oste', testo: 'Qui si beve bene e si lotta meglio. Vinicio? Quello ti frega con le piante, attento.' },
    { nome: 'Ragazza con l\'ombrellino', testo: 'Dicono che di notte, alle fontane di Villa Aldobrandini, si vede \'na cosa rosa che svolazza. Sarà er vino, mah.' },
    { nome: 'Vecchietto', testo: 'Ai miei tempi se lottava co\' le bocce, mica coi Pokémon. E se vinceva pure.' },
  ],
  GROTTAFERRATA: [
    { nome: 'Cesare il fornaio', testo: 'Pizza bianca appena sfornata! Nemmeno il tuo Pokémon resiste all\'odore: guarda come drizza le orecchie.' },
    { nome: 'Fra\' Bartolo', testo: 'Pace a te, viandante. E anche al tuo… come si chiama? Ah, un Pokémon. Bene, anche lui è una creatura di Dio.' },
    { nome: 'Anselmo il rigattiere', testo: 'Roba usata, ma buona! Ho anche una Poké Ball mezza ammaccata, te la do a metà prezzo.' },
    { nome: 'Studentessa', testo: 'Studio l\'abbazia da tre mesi. I monaci coi Pokémon Psico so\' più tranquilli de me prima de \'n esame.' },
    { nome: 'Tizio col cane', testo: 'No, \'sto qua è un cane normale eh. Non tutto quello che cammina è un Pokémon, oh.' },
  ],
  MARINO: [
    { nome: 'Nello il vignarolo', testo: 'Alla Sagra dell\'Uva dalla fontana esce vino, giuro! L\'anno scorso un Magikarp ci è caduto dentro e ne è uscito brillo.' },
    { nome: 'Pina della Sagra', testo: 'Ti prepari già la cesta per la Sagra? Porta un Pokémon Acqua, se la fontana si intasa può servire.' },
    { nome: 'Bambino bagnato', testo: 'Sono caduto nella fontana. Matilde ha riso. Anche il suo Gyarados ha riso.' },
    { nome: 'Pescatore annoiato', testo: 'Pesco da stamattina. Solo Magikarp. Sempre Magikarp. UN Magikarp lo vòi?' },
    { nome: 'Signora', testo: 'Marino è la città del vino. E del traffico. Soprattutto del traffico.' },
  ],
  MONTE_PORZIO: [
    { nome: 'Ruggero il meteorologo', testo: 'Tra qualche giorno pioverà. E quando piove qui, sull\'osservatorio, i fulmini fanno cose strane: fidati, segnatelo.' },
    { nome: 'Aldo l\'astrofilo', testo: 'Di notte, nei giorni dispari, col telescopio si vedono cose strane… Una volta ho visto una stella che si muoveva. O forse era solo una zanzara.' },
    { nome: 'Studente di astronomia', testo: 'Biretta è la Capopalestra più sveglia dei Castelli. Letteralmente: non dorme mai, guarda le stelle.' },
    { nome: 'Vecchietto col cappello', testo: 'Lassù all\'osservatorio fanno la scienza. Io guardo le stelle dalla finestra e mi basta.' },
    { nome: 'Ragazza', testo: 'C\'ho un Magnemite che si attacca alla calamita del frigo. Comodo, ma poi non se stacca più.' },
  ],
  ROCCA_DI_PAPA: [
    { nome: 'Faustino il funicolarista', testo: 'La funicolare risale dal \'32! Lassù, in cima, fa freddo anche d\'agosto. C\'è chi giura di aver visto un uccello fatto tutto di ghiaccio.' },
    { nome: 'Bruno la guida', testo: 'La Via Sacra la costruirono i romani, basolo su basolo. Quassù i Pokémon Roccia sono duri come queste pietre.' },
    { nome: 'Anziano del Carpino', testo: 'Maschio delle Faete, Monte Cavo… i due giganti. Da ragazzo ci salivo a piedi. Adesso ci mando il mio Pokémon.' },
    { nome: 'Signora col cane', testo: 'Il mio Growlithe non vole più camminà in salita. Pure lui s\'è romanizzato.' },
    { nome: 'Ragazzino', testo: 'Ho sentito un BOOM sotto terra ieri notte. Papà dice è il vulcano. Mamma dice è papà dopo i fagioli.' },
  ],
  // Nota: queste battute citano ancora "Massimo" come Capopalestra di
  // Albano — oggi è Giorgia (js/data.js/dati/trainer.js). Nome non
  // toccato qui (la conversione riguarda solo il dialetto, non i nomi
  // dei personaggi): dimmi tu se vuoi che lo corregga anche qui.
  ALBANO: [
    { nome: 'Settimio il legionario', testo: 'Salve! Qui stanziava la Seconda Legione Partica. Massimo tiene viva la disciplina, e colpisce anche molto forte.' },
    { nome: 'Storico', testo: 'I Castra Albana, l\'accampamento, le terme di Cellomaio… Albano è Roma in piccolo. Con i Pokémon in più.' },
    { nome: 'Bambino con la spada di legno', testo: 'Da grande voglio diventare un Capopalestra di tipo Lotta come Massimo! Per ora mi alleno litigando con mia sorella.' },
    { nome: 'Nonna Assunta', testo: 'Fijo, quella canna vale più de te. Aiutami a ripescalla e t\'imparo a nuotà coi Pokémon.' },
    { nome: 'Tizio sospettoso', testo: 'Hai visto pure tu quelli vestiti di grigioverde gironzolà vicino al lago? Non me piaceno per niente.' },
  ],
  ARICCIA: [
    { nome: 'Sora Nunzia', testo: 'Porchetta e vino, ragazzo! Mangia, che anche il tuo Pokémon ha una faccia pallida. Tieni, una fetta anche per lui.' },
    { nome: 'Peppe er porchettaro', testo: 'Porchetta di Ariccia IGP, altro che pizza e fichi! L\'aroma fa svenire persino gli Houndoom di Isa.' },
    { nome: 'Il vecchio del ponte', testo: 'Di giorno è solo un ponte. Di notte... guarda meglio le ombre: a volte ti restituiscono lo sguardo.' },
    { nome: 'Musicista', testo: 'Suono nelle fraschette. Di notte qui i Pokémon Buio escono a sentì la musica. Pubblico strano, ma applaude.' },
    { nome: 'Turista', testo: 'Sono venuto pe\' la porchetta. So\' rimasto pe\' la porchetta. Domani? Ancora porchetta.' },
  ],
  GENZANO: [
    { nome: 'Romolo il panettiere', testo: 'Pane di Genzano IGP, ragazzo! Crosta che scricchiola al taglio: ci appoggi sopra anche uno Snorlax e non si rompe.' },
    { nome: 'Iolanda dell\'Infiorata', testo: 'Ogni giugno copriamo la via di petali. Un anno feci un Gyarados tutto di fiori. Venne una meraviglia.' },
    { nome: 'Bambina', testo: 'Camilla è bravissima con i fiori. Ma se la fai arrabbiare, i suoi Folletto te le fanno vedere: delicati fuori, cattivelli dentro.' },
    { nome: 'Fioraio', testo: 'Petali a tonnellate per l\'Infiorata. E un Bellsprout che me li sceglie pe\' colore. Dipendente modello.' },
    { nome: 'Vecchietto', testo: 'Dopo Genzano c\'è la Via Vittoria. Robba seria. Curate bene, e non te fa\' fregà dal panorama.' },
  ],
  CASTEL_GANDOLFO: [
    { nome: 'Guardia', testo: 'La residenza è zona riservata. No, non puoi entrare. No, nemmeno con il Pokédex.' },
    { nome: 'Tonino il barcaiolo', testo: 'Un giro sul lago? Con questo Surf non serve nemmeno remare. Dicono che in fondo dorma qualcosa di grosso… io non scendo.' },
    { nome: 'Signora buffa', testo: 'Il Papa c\'ha un Pokémon? Dicono de sì. Dicono che è un… Slowpoke. Ce sta tutto, no?' },
  ],
  NEMI: [
    { nome: 'Rosa la fragolara', testo: 'Fragoline di Nemi, le più piccole e le più buone! Una per te, una per me, una… dov\'è finita? L\'ha presa il tuo Pokémon.' },
    { nome: 'Custode del Museo', testo: 'Qui c\'erano le navi di Caligola. E dicono... altre cose, custodite. Roba antica. Roba che è meglio non svegliare.' },
    { nome: 'Pescatore', testo: 'Lo specchio de Diana, lo chiamano. La notte è tutta un\'altra storia. C\'è chi giura d\'aver visto correre \'na cosa sull\'acqua.' },
  ],
  COLONNA: [
    { nome: 'Anziano', testo: 'Qui c\'è la Lega. Solo i migliori ci arrivano. Tu… mah, vedremo.' },
    { nome: 'Tizio davanti al Bunkerino', testo: 'Quella cantina laggiù? Strana. Entra gente in camice, esce gente che non parla. Io mi faccio i fatti miei.' },
    { nome: 'Ragazzo', testo: 'Hai battuto tutte e otto le palestre? E mo\' viene il difficile. In bocca ar lupo, campione.' },
  ],
};

// Battute generiche (nessuna città): percorsi, grotte, dungeon, tunnel...
// Scritte apposta per questo fix (non erano in DIALOGHI-NPC.md, che copriva
// solo le città), stesso tono/stile delle altre.
const FILLER_NPC_GENERICO = [
  { nome: 'Viandante', testo: 'Questo percorso non finisce mai, eh? Anche i Rattata si sono stufati di girare in tondo.' },
  { nome: 'Escursionista', testo: 'Hai visto una Poké Ball a terra da queste parti? No? Vabbè, sarà stata una mia allucinazione.' },
  { nome: 'Passante', testo: 'Io cammino, cammino, e vedo sempre lo stesso albero. O sono io che continuo a girare in tondo?' },
  { nome: 'Allenatore di passaggio', testo: 'Allenatore anche tu, eh? Bella vita da strada, no? Anche se i piedi direbbero il contrario.' },
  { nome: 'Tizio con lo zaino', testo: 'Attento ai Pokémon nell\'erba alta, certe volte spuntano quando meno te l\'aspetti.' },
  { nome: 'Vecchio del posto', testo: 'Hai già un bel po\' di Pokémon in squadra, eh? Io invece sono ancora alla ricerca del primo.' },
  { nome: 'Turista', testo: 'Ogni tanto mi fermo qui giusto pe\' guardà il panorama. Poi riparto, che devo arrivà prima del buio.' },
  { nome: 'Camminatore', testo: 'Fa un caldo bestiale oggi. O so\' io che ho camminato troppo?' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FILLER_NPC_PER_CITTA, FILLER_NPC_GENERICO };
}
