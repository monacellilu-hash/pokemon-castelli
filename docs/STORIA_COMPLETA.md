# STORIA — Pokémon Castelli Romani
# Narrativa completa, archi villain, catene leggendari

---

## PROLOGO — Borgata Tuscolana

Sei un ragazzo della periferia romana, cresciuto sulla Via Tuscolana
ai margini dei Castelli Romani. Il Professor Castagno, eccentrico
studioso di Pokémon locali, ti convoca nel suo laboratorio:
ha bisogno di qualcuno che esplori i Castelli e completi il Pokédex.

Ti offre la scelta tra tre starter. Prima ancora di uscire,
il tuo vicino **Remo** — competitivo, sbruffone, figlio di un allevatore
di Pokémon — ti sfida sul posto. Sceglie lo starter del tipo forte
contro il tuo e ti dice: *"Ci vediamo ai Castelli."*

Da qui inizia tutto.

---

## IL PATH — Le Otto Palestre

### Palestra 1 — Frascati · Vinicio · Tipo Erba · cap 14

Frascati accoglie il giocatore con le sue vigne e la Villa Aldobrandini
che domina la città dall'alto. Vinicio, il capopalestra, è un viticoltore
vecchio stampo che usa Pokémon Erba ispirati alla tradizione agricola
dei Castelli. Medaglia: **Medaglia Vigna**.

Qui trovi l'accesso ai **Boschi del Tuscolo** a nord — il dungeon
più ricco di contenuto del gioco, esplorabile fin dall'inizio.

### Palestra 2 — Grottaferrata · Nilo · Tipo Psico · cap 21

L'Abbazia di San Nilo domina la città. Nilo, il capopalestra,
è un monaco studioso che ha trasformato la palestra in un labirinto
di chiostri. I suoi Pokémon Psico riflettono la meditazione e la
spiritualità del luogo. Medaglia: **Medaglia Icona**.

Fuori dall'Abbazia, per la prima volta, incontri il **Team GdF**.

### Palestra 3 — Marino · Moro · Tipo Acqua · cap 28

Marino è famosa per la Sagra dell'Uva, ma Moro preferisce l'acqua
al vino. La palestra è costruita attorno a una vasca centrale.
I suoi Pokémon Acqua richiamano il lago vulcanico e le fontane
storiche della città. Medaglia: **Medaglia Fontana**.
Moro dà la **MN Surf** dopo la vittoria.

### Palestra 4 — Monte Porzio Catone · Stella · Tipo Elettro · cap 34

L'Osservatorio Astronomico INAF domina la collina. Stella è una
ricercatrice notturna ossessionata dalle stelle e dai Pokémon Elettro
che "brillano come costellazioni". Medaglia: **Medaglia Stella**.
La **MN Forza** si ottiene da un NPC dell'Osservatorio dopo
aver sventato il piano del Team CoTrAL.

### Palestra 5 — Rocca di Papa · Baso · Tipo Lotta · cap 40

Rocca di Papa si arrampica sul fianco del Monte Cavo, il punto più
alto dei Castelli Romani. Baso è un alpinista burbero che allena
Pokémon Lotta coi pugni duri come il peperino vulcanico. Medaglia:
**Medaglia Pigna**.

### Palestra 6 — Albano Laziale · Giorgia · Tipo Roccia · cap 46

Albano ha una lunga tradizione militare, con mura scavate nella
pietra viva dei Castra Albana. Giorgia allena Pokémon Roccia con
disciplina ferrea. La palestra sembra una caserma. Medaglia:
**Medaglia Scudo**.
La **MN Volo** si ottiene da Faustino, NPC di Rocca di Papa,
dopo la sesta medaglia.

### Palestra 7 — Ariccia · Ombretta · Tipo Buio · cap 52

Ariccia di notte è un posto diverso. Ombretta gestisce la palestra
in un vicolo buio, tra fraschette e ombre. I suoi Pokémon Buio
si nascondono nell'oscurità. Medaglia: **Medaglia Ombra**.

### Palestra 8 — Genzano · Flora · Tipo Fuoco · cap 58

Genzano è famosa per l'Infiorata — i fiori che decorano le strade.
Flora è una fioraia sognatrice i cui Pokémon di Fuoco scaldano il
sottosuolo che fa sbocciare i colori dell'Infiorata. Medaglia:
**Medaglia Lava**.

Un NPC a Genzano ti dice: *"Per Via Vittoria devi tornare a
Monte Porzio Catone. Da lì si parte."*

---

## VIA VITTORIA E LA LEGA

La Via Vittoria parte da Monte Porzio Catone. Un gate NPC
la blocca finché non hai tutte e 8 le medaglie. È un dungeon
lungo e brutale, pieno di allenatori forti. Qui incontri **Moltres**
per la prima volta — non puoi evitarlo.

A **Colonna** si trova la Lega Pokémon. Quattro Superquattro
e infine il Campione: **Remo**, il tuo rivale. Ha scalato la Lega
mentre tu battevi le palestre. La sua squadra è costruita
attorno allo starter scelto contro il tuo, portato alla sua
forma finale.

---

## ARCO NARRATIVO — TEAM GdF

> **Riscritto l'8 settembre 2026** su indicazione diretta di Luca: sostituisce
> integralmente la vecchia struttura (Abbazia come climax post-Lega, Orb
> Rossa/Blu trovate lì insieme). Il Comandante GdF ha ora un nome —
> **Giovanni** — e lo si affronta DUE VOLTE in due luoghi diversi, non una
> sola volta in fondo all'Abbazia. Implementato lato codice nella stessa
> sessione (vedi `dati/trainer.js`, `dati/cutscene.js`, `js/map.js`) per le
> parti che non richiedono una mappa ancora da disegnare — vedi le note
> "⏳ CODICE" sotto per cosa resta bloccato in attesa dell'interno
> dell'Abbazia.

*Il Team GdF è il villain principale. Il loro obiettivo è risvegliare
Kyogre e Groudon, i leggendari dell'acqua e della terra, per usarli
come arma di potere sulla città di Roma e i Castelli Romani.*

### Atto 1 — L'Abbazia (Grottaferrata, P2)

Davanti all'Abbazia di San Nilo trovi tre grunt in uniforme.
Si avvicinano appena entri nella piazza. Parlano del loro Comandante,
di "Pokémon fondamentali" e di un piano per "tracciarli finalmente".
Restano vaghi. La porta del dungeon è sbarrata — resterà così fino a dopo
la 7ª palestra (vedi Atto 6).
*"Tornerai qui. Ma sarà troppo tardi."*

### Atto 2 — Il Laboratorio (Marino, P3)

Vicino a Marino si nasconde il **Rifugio GdF**, protetto da una password
in 3 parti (vedi Atto 3/4/6 per dove si ottiene ognuna). I grunt fuori
raccolgono dati sui laghi vulcanici dei Castelli. Dai dialoghi intercettati
emerge: cercano Kyogre e Groudon, convinti che i laghi di cratere
nascondano qualcosa di antico e potentissimo. **Non puoi ancora entrare**:
la porta resta chiusa finché non hai tutte e 3 le parti della password.

### Prima visita — La Grotta del Vulcano (presidio esterno)

Sul cratere sopra Rocca di Papa trovi la Grotta del Vulcano, presidiata da
grunt GdF. Puoi sconfiggere le guardie **fuori**, ma il corridoio verso
l'interno resta bloccato — troppi uomini di guardia per affrontarli da
solo, per ora. Groudon dorme nel nucleo, non ancora raggiungibile.
✅ **CODICE**: i 12 grunt del 1° piano si battono liberamente; i warp verso
i piani interni (2f/3f) restano chiusi finché non hai la Pietra Zaffiro
(vedi Atto 6) — messaggio di blocco dedicato invece del semplice silenzio.

### Atto 3 — Il Documento (Castel Gandolfo) — 1° luogotenente: Fernando

Nella Villa Pontificia di Castel Gandolfo, sconfiggi **Fernando**, il primo
dei tre luogotenenti GdF, che custodisce un documento negli archivi
storici. Sconfitto, rivela: *"Le pietre riposano al Museo delle Barche di
Nemi... devo correre ad avvisare Michela!"*
Flag: `documentoVillaOttenuto` (✅ già implementato).
*(Questo incontro non dà una parte della password: rivela solo la
destinazione successiva.)*

### Atto 4 — Il Furto (Museo delle Navi di Nemi) — 2° luogotenente: Michela

Al Museo delle Navi di Nemi, sconfiggi **Michela**, il secondo dei tre
luogotenenti, avvisata in tempo da Fernando. Ti dà la **2ª parte della
password** del Rifugio di Marino.
Flag: `museo_nemi_password` (✅ già implementato).

*A questo punto della storia hai già battuto la 5ª palestra (Rocca di
Papa) — Fernando e Michela si affrontano in parallelo al normale
avanzamento fra le palestre, non in sequenza rigida dopo di esse.*

### Atto 5 — La Sagra e la strada bloccata (Ariccia → Genzano)

Dopo aver battuto la 7ª palestra (Ariccia), durante la Sagra della
Porchetta senti alcuni GdF parlare dell'Abbazia — la porta finalmente si
sblocca (vedi Atto 6). Sulla strada per Genzano, però, il Team GdF blocca
il passaggio: ufficialmente per "ubriachi molesti" della Sagra, in realtà
per guadagnare tempo.
⏳ **CODICE**: cutscene ancora da scrivere — serve la posizione esatta del
trigger sulla strada Ariccia→Genzano (da piazzare tu su Tiled, poi la
cablo).

### Atto 6 — L'Abbazia, per davvero — 3° luogotenente: Ginevra

Con la porta sbloccata (≥7 medaglie), entri nel dungeon interno
dell'Abbazia e sconfiggi **Ginevra**, il terzo e ultimo luogotenente. Ti dà
la **3ª parte della password** del Rifugio di Marino — ora completa.
⏳ **CODICE**: l'interno dell'Abbazia non esiste ancora come mappa Tiled —
Luca la disegna, poi si cabla Ginevra e il gate finale sulla porta del
Rifugio (oggi il Rifugio non ha ancora il controllo delle 3 parti insieme,
resta un "manca" fino a quel momento).

### Atto 7 — Il Rifugio di Marino — Giovanni, primo incontro

Con la password completa, entri nel Rifugio. In fondo trovi **Giovanni**,
il vero comandante GdF. Sconfitto, cede — a malincuore — la **Pietra
Zaffiro**, promettendo la rivincita.
Flag: `pietra_zaffiro_ottenuta` (✅ già implementato).
**Effetto:** Kyogre (Lago di Albano) è ora catturabile *(la posizione del
marcatore Kyogre sulla mappa resta da piazzare — vedi `docs/TODO.md`)*.

### Atto 8 — La Grotta del Vulcano, seconda visita — Giovanni, rivincita finale

Ora che hai la Pietra Zaffiro, i piani interni della Grotta del Vulcano si
sbloccano. Dentro trovi di nuovo Giovanni — stavolta manda avanti il suo
luogotenente Levantino, poi scende in campo lui stesso per la rivincita.
Sconfitto una seconda volta, fugge (*"Torneremo più forti di prima..."*),
e lo scienziato che teneva prigioniero ti dà la **Pietra Rossa**.
✅ **CODICE**: implementato per intero questa sessione (dialoghi,
sparizione dei GdF su tutti i piani, arrivo in scena di Giovanni).
**Effetto:** Groudon (nucleo della Grotta del Vulcano) è ora catturabile
(sveglia_con: `pietra_rubino`, già impostato sul suo marcatore).

Con Kyogre e Groudon entrambi in squadra, la fontana di Piazza San Rocco a
Frascati reagisce — e Rayquaza discende (dungeon/meccanica ancora da
scrivere, vedi `docs/TODO.md`).

---

## ARCO NARRATIVO — TEAM CoTrAL

*Il Team CoTrAL è il villain secondario. Operano nell'ombra,
con obiettivi scientifici disturbanti: clonare Mewtwo e usarlo
per controllare la rete di trasporti sotterranei dei Castelli.*

### Prima Comparsa — Osservatorio INAF (Monte Porzio, P4)

All'Osservatorio, i CoTrAL rubano dati astronomici per localizzare
i leggendari. *"Zapdos genera abbastanza energia elettrica
per alimentare il progetto per anni."* È il loro primo errore:
hanno lasciato tracce.

### Lab CoTrAL #1 — Albano (Fulvia)

Fulvia coordina la ricerca sul DNA di Pokémon leggendari.
15 trainer. Il piano Mewtwo è accennato nei dialoghi dei grunt.
*"Il professor... no, non devo dire il nome. Il progetto è quasi pronto."*

### Grunt ad Ariccia (4 grunt → Piuma Iridescente)

Quattro grunt CoTrAL presidiano un'area di Ariccia.
Sconfiggendoli, sblocchi il riconoscimento di **Adriano il Porchettaro**,
NPC locale che ti dà la **Piuma Iridescente** come ringraziamento.

### Lab CoTrAL #2 — Ariccia (Crasso)

Crasso gestisce la fase finale. 17 trainer.
Il progetto Mewtwo è quasi completo. *"Tutto è pronto al Bunkerino.
Mewtwo sarà il controllo definitivo."*

### CLIMAX: Bunkerino (Colonna, post-lega)

Sotto la sede della Lega di Colonna si trova il Bunkerino:
una cantina-laboratorio scavata nei sotterranei.
Resti del team CoTrAL. Attrezzature abbandonate. Silenzio.

**Mewtwo ha già sconfitto i suoi creatori.** Lo trovi solo,
in fondo alla struttura. Non è arrabbiato. È solo.
Flag: `cotral_sconfitto`

**Effetto:** Mew (Villa Aldobrandini, Frascati) si sblocca.

---

## I 21 LEGGENDARI

### Catturabili da subito (da Palestra 1)

**Regirock (377)** — Tuscolo, Antro del Foro
Condizione: ≥3 Pokémon di tipo Terra in squadra.
Iscrizione: *"TERRA TENET — TRIA CORPORA TERRAE PORTANT"*

**Regice (378)** — Tuscolo, Antro dell'Anfiteatro
Condizione: ≥3 Pokémon di tipo Buio in squadra.
Iscrizione: *"NOCTIS UMBRA REGNAT — TRIA CORPORA NOCTIS PORTANT"*

**Registeel (379)** — Tuscolo, Antro del Teatro
Condizione: ≥3 Pokémon di tipo Volante in squadra.
Iscrizione: *"CAELUM PETIT — TRIA CORPORA CAELI PORTANT"*

---

### Catturabili pre-lega

**Articuno (144)** — Funivia di Rocca di Papa → Monte Cavo
Condizione: ≥5 medaglie. La funivia si sblocca salendo da Rocca di Papa.

**Zapdos (145)** — Osservatorio INAF, Monte Porzio Catone
Condizione: giorno di temporale. Un NPC meteorologo dell'Osservatorio
prevede il tempo: se torna dopo 3 giorni di previsione di temporale,
Zapdos appare sul tetto dell'Osservatorio.

**Jirachi (385)** — Osservatorio INAF, Monte Porzio Catone
Condizione: notte, giorno dispari del mese, aver fatto 5 osservazioni
notturne al telescopio. Jirachi dorme per mille anni e si sveglia
per un breve momento ogni anno.

**Moltres (146)** — Via Vittoria
Condizione: primo accesso alla zona. Lo incontri obbligatoriamente
sul percorso. Non puoi evitarlo.

**Suicune (245)** — Lago di Nemi
Condizione: MN Surf. Appare sulla superficie del lago al tuo arrivo.
Ti guarda, poi scompare. *Non è ancora catturabile.* Questo incontro
sblocca Raikou ed Entei come roaming post-lega.

---

### Catturabili durante l'arco GdF (non più post-Lega)

**Kyogre (382)** — Lago di Albano, profondità
Condizione: Pietra Zaffiro ottenuta sconfiggendo Giovanni al Rifugio di
Marino (Atto 7 dell'arco GdF, vedi sopra) — non più nell'Abbazia.
Il leggendario dei mari dorme da secoli nel lago di cratere.
*(Marcatore Kyogre sulla mappa ancora da piazzare, vedi `docs/TODO.md`.)*

**Groudon (383)** — Grotta del Vulcano, nucleo
Condizione: Pietra Rubino ottenuta sconfiggendo Giovanni una seconda volta
alla Grotta del Vulcano (Atto 8 dell'arco GdF, vedi sopra) — non più
nell'Abbazia. Il leggendario della terra dorme nel cuore del Vulcano
Laziale. **Già implementato e funzionante.**

**Rayquaza (384)** — Fontana di Piazza San Rocco, Frascati Ovest
Condizione: Kyogre E Groudon entrambi in squadra.
L'acqua della fontana si illumina. Un vortice di vento scende
dal cielo. Rayquaza appare sopra Frascati.

---

### Catturabili post-lega (altri archi)

**Ho-Oh (250)** — Ponte di Ariccia, all'alba
Catena: sconfiggi 4 grunt CoTrAL → Adriano il Porchettaro dà la
Piuma Iridescente. Post-lega: entra nella sagra di Ariccia,
sconfiggi 5 Porchettari. Ti dicono: *"Con quella piuma, all'alba,
sul Ponte... c'è chi dice di aver visto qualcosa."*
Vai al Ponte di Ariccia all'alba. Ho-Oh plana dall'orizzonte.

**Lugia (249)** — Monte Cavo
Catena: post-Via Vittoria, trovi un braciere abbandonato.
Torna a Genzano: un NPC propone una "scampagnata".
Il warp porta a una radura sul Monte Cavo che non si vede
dalla funivia. Lugia emerge dalle nebbie del vulcano.
*"Si diceva che lo Spirito del Lago si fermasse sulle vette
quando il cielo e l'acqua si incontrano."*

**Mewtwo (150)** — Bunkerino, Colonna
Vedi arco CoTrAL. Lo trovi solo, dopo aver battuto
tutto il Team CoTrAL nel dungeon.

**Mew (151)** — Villa Aldobrandini, Frascati
Condizione: `cotral_sconfitto` (Mewtwo battuto).
Nel giardino della Villa Aldobrandini appare un'energia rosa.
Mew è il Pokémon originale, l'antenato di tutti.
Si nascondeva qui da prima che arrivassero i CoTrAL.

**Deoxys (386)** — Parcheggione di Grottaferrata
Condizione: post-lega, notti senza luna (cielo completamente buio).
Il parcheggione di Grottaferrata nelle notti senza luna diventa
stranamente silenzioso. Un oggetto cade dal cielo.
Deoxys è arrivato dallo spazio.

**Celebi (251)** — Boschi del Tuscolo, erba alta
Condizione: Il Solitario sconfitto (post-lega).
3% di probabilità per ogni check incontro, solo nelle zone Tuscolo.
Il Solitario, dopo la sconfitta, ti dice:
*"Celebi vive in questo bosco da prima che esistesse Tuscolo.
Cammina nell'erba alta. Ha una probabilità su trentatré di apparire.
Non usare repellenti. E abbi pazienza."*

---

### Roaming (vagano sulla mappa)

**Raikou (243)** — Roaming post-lega
Sblocco: Suicune incontrato al Lago di Nemi.
Raikou attraversa i percorsi dei Castelli come un fulmine.

**Entei (244)** — Roaming post-lega
Sblocco: Suicune incontrato al Lago di Nemi.
Entei corre tra le colline vulcaniche.

**Latias (380) / Latios (381)** — Roaming post-lega
Trigger: da definire.

---

## IL SOLITARIO — Il Boss Segreto

Nel Boschetto Segreto (accessibile dal Tuscolo Interno con MN Taglio),
un guardiano blocca il sentiero verso il fondo.
*"Questo sentiero porta a qualcuno che non incontra chiunque.
Prima dimostra il tuo valore: sconfiggi la Lega di Colonna.
Poi torna qui."*

Post-lega, il guardiano si fa da parte. In fondo alla radura,
sotto un albero antico, siede **Il Solitario** — un trainer
senza nome che si allena qui in silenzio da anni, lontano
da tutto. La sua squadra è al limite:

Dragonite Lv65 · Metagross Lv65 · Milotic Lv66 ·
Absol Lv66 · Salamence Lv67 · **Celebi Lv70**

*"Anni di allenamento in silenzio. E tu li hai superati tutti.
Questo bosco ha qualcosa di speciale. Ora puoi sentirlo anche tu."*

Dopo la vittoria, torna a parlargli: ti rivela Celebi.

---

## REMO — Il Rivale

Remo ti sfida cinque volte lungo il percorso:

1. **Borgata Tuscolana** — primo scontro, subito dopo la scelta degli starter
2. **Prima di Grottaferrata** — livellato alla P2
3. **Tuscolo Interno** — nel cuore del dungeon
4. **Prima della Lega** — livellato al massimo
5. **La Lega — Campione** — Remo è il Campione. La sua squadra
   è costruita attorno al suo starter (sempre quello forte contro il tuo),
   ora alla forma finale. Lv 64-66.

Dopo che lo batti come Campione:
*"...p**** ***. Vabbè. Bravo."*

---

## ADRIANO IL PORCHETTARO — NPC Chiave per Ho-Oh

Adriano è un porchettaro di Ariccia, famoso per la sua porchetta.
Ha visto qualcosa sul Ponte anni fa, all'alba, ma nessuno gli crede.
Quando sconfiggi i 4 grunt CoTrAL che infastidivano il suo locale,
ti dà la **Piuma Iridescente** come ringraziamento.

*"Non so cosa sia questa piuma. L'ho trovata sul Ponte anni fa,
all'alba. Era lì, sul corrimano, come se qualcuno l'avesse lasciata.
Prendila. Tu sembra uno che sa usarla."*

