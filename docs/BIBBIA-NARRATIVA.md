# 📖 BIBBIA NARRATIVA — Pokémon Castelli Romani
### Documento di design narrativo (F9 → F12) · v2

> Fonte di verità per dialoghi, leggendari, team, città e meccaniche di storia.
> I dettagli ancora aperti restano marcati **[DA DEFINIRE]**.

---

## ✅ DECISIONI BLOCCATE (aggiornate)

1. **Due team**: **GdF** (meteo/business, pre-Lega) + **CoTrAL** (scienza/clonazione, post-Lega).
2. **CoTrAL** nasce per **scissione** del GdF (ex-membri delusi).
3. **Kyogre → Lago Albano** · **Groudon → Grotta del Vulcano**.
4. **Sistema del tempo**: orologio coi passi + "Dormi" al PC del Centro Pokémon (scegli l'ora del risveglio).
5. Solo specie **ID 1-386 (Gen 1-3)**.
6. **Mew → Villa Aldobrandini** (Frascati) — cattura dopo lo scontro col Mewtwo.
7. **Ho-Oh / Piuma**: ricompensa per una **catena di buone azioni** (NON palestre/rivale), incl. sgominare una cellula **CoTrAL**, e i **Porchettari** (al posto delle Kimono Girl).
8. **Trio Regi (Tuscolo)**: enigma in **latino** che indica il **tipo** richiesto. Per aprire ogni camera servono **almeno 3 Pokémon dello stesso tipo** in squadra → **Terra**, **Volante**, **Buio**.
9. **Bunkerino** = laboratorio grigio/asettico (vibe "grotta Celeste" ma artificiale). Mewtwo ha **sconfitto i suoi creatori** (la CoTrAL) e ora trama di **prendere il controllo**.
10. **Rayquaza**: dopo aver catturato Kyogre e Groudon, va a **Frascati, San Rocco**; con **entrambi in squadra** premi la **fontana** → si apre un **dungeon** → dentro c'è Rayquaza.

---

## 🦹 I DUE TEAM

### TEAM GdF — meteo & business (PRE-Lega) · costante `TEAM_GDF_NOME`
- Risveglia **Kyogre e Groudon** (servono le **sfere/pietre**) per controllare il meteo e manovrare l'economia (vino, acqua, turismo).
- **Comandante Crasso** (capo) · Admin **Fulvia** (acqua) · Admin **Tarcisio** (terra) · Grunt.
- **Le Sfere/pietre**: custodite al **Museo delle Navi Romane di Nemi** (luogo VERO, ospita i relitti delle navi di Caligola). Le navi romane le trasportavano quando affondarono nel lago. Il GdF le **ruba e scappa davanti al giocatore** in una **cutscene** (i cattivi parlano, tu assisti). Da lì la caccia per recuperarle prima del risveglio.
- Climax: scontro al cratere → Crasso arrestato. Dopo, i due leggendari restano dormienti (Albano / Grotta) e si catturano post-Lega.

### TEAM CoTrAL — scienza & clonazione (POST-Lega) · costante `TEAM_COTRAL_NOME`
- **Scissione del GdF**: "il meteo è roba da dilettanti, noi creiamo la vita".
- Facciata da cooperativa di trasporti (il bus che non arriva mai…), dietro un programma genetico: **Progetto 150 → Mewtwo** (da DNA di **Mew**).
- **Laboratori-dungeon pre-Lega** con indizi (no boss): **Lab 1 ~dopo Palestra 3 (Marino)**, **Lab 2 ~dopo Palestra 6 (Albano)**.
- **Bunkerino (Colonna, post-Lega)** — **laboratorio-dungeon travestito da cantina**: dall'esterno e nei primi ambienti sembra una cantina dei Castelli (botti di vino, marmellate, conserve, frutta, attrezzi da orto e vigna), ma sotto è un laboratorio grigio. Si attraversa **sfidando un po' di gente della CoTrAL** (resti del team), fino alla sala finale: **Mewtwo davanti a un grande camino**. **Colpo di scena**: la CoTrAL non comanda più — **Mewtwo ha già sconfitto i suoi creatori** e ora trama il controllo. Boss = **Mewtwo si sdoppia** → **doppia** Mewtwo + Mew (Mew IA). *(richiede estensione del motore: oggi solo 1v1.)*

---

## ⭐ LEGGENDARI (Gen 1-3) — POSIZIONAMENTO DEFINITIVO

| Pokémon | ID | Luogo / Modalità | Trigger |
|---|---|---|---|
| Articuno | 144 | **Rocca di Papa** → funivia → sentiero innevato | Sali con la funivia |
| Zapdos | 145 | **Osservatorio (Monte Porzio)**, in un temporale | NPC meteorologo annuncia la pioggia → vai nel giorno giusto (conta-giorni) |
| Moltres | 146 | **Via Vittoria** | Incontro fisso |
| Mewtwo | 150 | **Bunkerino** | Boss post-Lega, doppia con Mew |
| Mew | 151 | **Villa Aldobrandini** (Frascati) | Dopo lo scontro col Mewtwo |
| Raikou | 243 | **Roaming** | Sblocco post-Lega (dopo un temporale) |
| Entei | 244 | **Roaming** | Sblocco dopo il cratere (calore residuo) |
| Suicune | 245 | Lago (1ª volta) → **roaming** | Post-Surf, poi insegue |
| Lugia | 249 | **Monte Cavo** | In quota, post-Lega |
| Ho-Oh | 250 | All'**alba**, con la **Piuma** | Catena di buone azioni + Porchettari + cellula CoTrAL |
| Celebi | 251 | **Boschi del Tuscolo** | Evento tra le rovine |
| Regirock | 377 | **Tuscolo** (camera I) | Enigma latino → **3× Terra** in squadra |
| Registeel | 379 | **Tuscolo** (camera II) | Enigma latino → **3× Volante** in squadra |
| Regice | 378 | **Tuscolo** (camera III) | Enigma latino → **3× Buio** in squadra |
| Latias | 380 | **Roaming** | Post-Lega |
| Latios | 381 | **Roaming** | Post-Lega (sfalsato) |
| Kyogre | 382 | **Lago Albano** (sub) | Post-Lega |
| Groudon | 383 | **Grotta del Vulcano** (nucleo) | Post-Lega |
| Rayquaza | 384 | **Frascati, San Rocco** → fontana → dungeon | Premi la fontana con **Kyogre + Groudon** in squadra |
| Jirachi | 385 | **Osservatorio (Monte Porzio)** | Di **notte**, nei **giorni dispari**, usa il telescopio: dopo **5 osservazioni** si sblocca l'evento |
| Deoxys | 386 | **Luna** 🌕 | Astronauta volontario dalla base di lancio del "parcheggione" di Grottaferrata |

> Mappatura Regi↔tipo arbitraria (adattabile). Roaming sfalsati: Suicune → Entei → Raikou → Latias → Latios.

---

## 🕒 SISTEMA DEL TEMPO
`stato.tempo = { giorno, minuti }`. Scorre coi passi (~+1 min/passo, da tarare).
Fasce: 🌅 Mattina 06-12 · ☀️ Pomeriggio 12-18 · 🌆 Sera 18-21 · 🌙 Notte 21-06.
**"Dormi" al PC del Centro Pokémon**: scegli l'ora del risveglio → cura la squadra, avanza `giorno`/`minuti`, scatena gli eventi a tempo (pioggia di Zapdos, alba di Ho-Oh, notte di Ariccia).

---

## 🏙️ SCHELETRO CITTÀ PER CITTÀ
> Schema per ogni città: **Palestra · Centro Pokémon · Poké Market · Case · NPC notevoli · Luogo speciale · Gate/MN**.
> Gli **slot NPC** sono da riempire (nome + battuta). Ogni città ha 1 dialogo di esempio come template.
> Sulla mappa OSM gli NPC stanno "davanti agli edifici" (gli interni arrivano in F14).

### 🏠 0 · BORGATA TUSCOLANA (partenza)
- **Casa del protagonista** — la mamma: dialogo di partenza.
- **Laboratorio Prof. Castagno** 🏫 — starter, Pokédex, Ball, Pozioni.
- **Centro Pokémon** 🏥 (sì, anche qui, per il tutorial del "Dormi").
- **Poké Market** — base: Poké Ball, Pozione, Antidoto.
- **Case (×3)** — slot NPC: [vicino di casa], [vecchietta], [bambino con Pokémon].
- **NPC notevoli**: *Tizio del GRA* (all'imbocco del Percorso Tuscolana).
- *Esempio (Tizio del GRA):* "Aho, esci dar raccordo? Prima volta? In bocca ar lupo… ai Castelli mangiano li romani." *(ride da solo)*

### 🍇 1 · FRASCATI (Palestra Erba — Vinicio · Medaglia Vigna)
- **Palestra** 🏛️ (Villa Torlonia).
- **Centro Pokémon** 🏥 · **Poké Market** (base + Superpozione).
- **Case (×4)** — slot NPC: [produttore di vino], [oste], [turista], [nonna].
- **Luogo speciale — Villa Aldobrandini**: giardini esplorabili, NPC storico, **Mew (post-game)**.
- **Luogo speciale — San Rocco (fontana)**: **dungeon di Rayquaza (post-game)**.
- **NPC notevoli**: donatore item, *Porchettaro #1* (catena Ho-Oh).
- *Esempio (NPC giardiniere Villa Aldobrandini):* "Queste fontane le disegnò un genio. Dicono che di notte, tra gli zampilli, si veda qualcosa di rosa… ma sarà il vino."

### ⛪ 2 · GROTTAFERRATA (Palestra Psico — Nilo · Medaglia Icona)
- **Palestra** 🏛️ (Abbazia di San Nilo).
- **Centro Pokémon** 🏥 · **Poké Market** (base + Antiparalisi/Antiscottatura).
- **Case (×3)** — slot NPC: [monaco], [studioso], [restauratore].
- **Luogo speciale — Abbazia (chiostro)**: silenzio, NPC monaci.
- **Luogo speciale — "Parcheggione"/Piazza del Mercato**: **base di lancio Deoxys (post-game)**.
- **Gate/MN**: qui si ottiene la **MN Taglio** (donatore NPC).
- *Esempio (monaco):* "La fretta è nemica della mente. Siediti. Anche i Pokémon Psico imparano prima a stare fermi."

### ⛲ 3 · MARINO (Palestra Acqua — Moro · Medaglia Fontana)
- **Palestra** 🏛️ (Fontana Quattro Mori).
- **Centro Pokémon** 🏥 · **Poké Market** (Super Ball, Superpozione).
- **Case (×3)** — slot NPC: [vignaiolo della Sagra], [ragazzino], [pescatore].
- **Luogo speciale — Fontana di Marino / piazza**: durante la Sagra dell'Uva esce vino dalla fontana (evento).
- **Lab CoTrAL #1** nei dintorni (indizi, post-Palestra 3).
- **NPC**: *Porchettaro #2*.
- *Esempio (Moro, fuori palestra):* "OHÉ! Sei arrivato! Aspetta che finisco… ecco. L'acqua de Marino è la mejo, e li mii Pokémon pure!"

### 🔭 4 · MONTE PORZIO CATONE (Palestra Elettro — Stella · Medaglia Stella)
- **Palestra** 🏛️ (Osservatorio).
- **Centro Pokémon** 🏥 · **Poké Market** (Super Ball, Iperpozione).
- **Case (×3)** — slot NPC: [astrofilo], [insegnante], [contadino].
- **Luogo speciale — Osservatorio**: telescopio (notte), **Zapdos** in un giorno di temporale.
- **NPC notevoli**: *Meteorologo* (annuncia i giorni di pioggia → conta-giorni).
- *Esempio (Meteorologo):* "Tra tre giorni piove. E quando piove qui, sul telescopio, i fulmini fanno cose… strane. Portati qualcosa che regge l'elettricità."

### 🪨 5 · ROCCA DI PAPA (Palestra Roccia — Rocco · Medaglia Cratere)
- **Palestra** 🏛️.
- **Centro Pokémon** 🏥 · **Poké Market** (Ultra Ball, Iperpozione, Revitalizzante).
- **Case (×3)** — slot NPC: [guida alpina], [anziano del paese], [ragazza].
- **Luogo speciale — Funivia**: sale al sentiero innevato → **Articuno**.
- **Luogo speciale — accesso Monte Cavo** (Lugia) e vicinanza **Grotta del Vulcano** (covo GdF, Groudon).
- **Gate/MN**: snodo verso i dungeon vulcanici.
- *Esempio (guida funivia):* "Lassù fa freddo pure d'agosto. C'è chi giura di aver visto un uccello tutto ghiaccio. Io non salgo più da solo."

### 🏛️ 6 · ALBANO LAZIALE (Palestra Lotta — Massimo · Medaglia Legione)
- **Palestra** 🏛️ (Castra Albana).
- **Centro Pokémon** 🏥 · **Poké Market** (Ultra Ball, Iperpozione, Revitalizzante, Repellente).
- **Case (×3)** — slot NPC: [ex-militare], [storico], [bambino].
- **Luogo speciale — Villa Comunale/parco**: allenatori "militari in pensione".
- **Lab CoTrAL #2** nei dintorni (post-Palestra 6).
- **Gate/MN**: **MN Surf** via evento al **Lago Albano** (Nonna Assunta).
- *Esempio (Nonna Assunta, al lago):* "Fijo mio, quella canna vale più de te. Ripescamela e t'imparo a nuotà coi Pokémon."

### 🌉 7 · ARICCIA (Palestra Buio — Ombretta · Medaglia Fraschetta)
- **Palestra** 🏛️.
- **Centro Pokémon** 🏥 · **Poké Market** (Ultra Ball, Iperpozione, Repellente, Antidoto totale).
- **Case (×3)** — slot NPC: [oste della fraschetta], [musicista], [vecchio del ponte].
- **Luogo speciale — Ponte di Ariccia**: tappa obbligata; **di notte** nebbiolina, più Pokémon Buio, NPC misterioso.
- **NPC**: fraschetta → porchetta (+cura piccola una tantum), *Porchettaro #3*.
- *Esempio (NPC sul ponte, di notte):* "Di giorno è solo un ponte. Di notte… guarda meglio le ombre. A volte ti guardano indietro."

### 🌸 8 · GENZANO (Palestra Folletto — Flora · Medaglia Infiorata)
- **Palestra** 🏛️.
- **Centro Pokémon** 🏥 · **Poké Market** (Ultra Ball, Iperpozione, Revitalizzante max, Repellente).
- **Case (×3)** — slot NPC: [artista dell'Infiorata], [fioraio], [nonna].
- **Luogo speciale — Infiorata**: piazza decorata (evento visivo), NPC racconta la tradizione.
- **Gate**: dopo l'8ª medaglia, **Flora annuncia la Via Vittoria**.
- *Esempio (Flora, dopo sconfitta):* "Sei forte. L'anno prossimo ti disegno coi fiori. Tieni la Medaglia Infiorata… e va' verso la Via Vittoria."

### ⛵ • CASTEL GANDOLFO (cittadina secondaria)
- **Centro Pokémon** 🏥 (no market).
- **Case (×2)** — slot NPC: [guardia papale], [pescatore].
- **Luogo speciale — vista Lago Albano** (accesso riva con Surf).
- *Esempio (NPC buffo):* "Il Papa c'ha un Pokémon? Dicono de sì. Dicono che è un… Slowpoke. Ce sta tutto."

### 🌊 • NEMI (borgo del lago) — opzionale
- **Centro Pokémon** 🏥.
- **Luogo speciale — Lago di Nemi** ("specchio di Diana"): acqua avanzata, Suicune (1ª comparsa).
- **NPC**: *Er Baretto* (vende info sui percorsi notturni).

### 🏟️ • COLONNA (Lega + post-game)
- **Lega Pokémon**: Superquattro (Captain, Pres, Dema, Marcuois) + Campione **Remo**.
- **Bunkerino**: base CoTrAL → Mewtwo (doppia), Registeel, Deoxys (via lancio da Grottaferrata).
- **Centro Pokémon** 🏥 prima della Lega.

---

## 🛒 POKÉ MARKET — progressione merce (riferimento)
- **Inizio (Borgata/Frascati)**: Poké Ball, Pozione, Antidoto.
- **Metà (Marino→Rocca)**: + Super Ball, Superpozione, Antiparalisi, Antiscottatura.
- **Tardo (Albano→Genzano)**: + Ultra Ball, Iperpozione, Revitalizzante, Repellente, Antidoto totale.
- Le **Mega/Ultra Ball** e oggetti speciali anche da eventi/NPC.

---

## 🏛️ TUSCOLO — dungeon che cresce col giocatore
- **Prima visita (early game)**: dungeon-bosco tra le rovine. Ci vai per un **beat col rivale Remo** (ti avverte/sfida). Abitanti: **archeologi** (allenatori), selvatici coleottero/erba/roccia, all'occorrenza un **grunt GdF** che fruga tra i ruderi.
- **Post-game — santuario dei Regi**: 3 anfratti legati alle vere rovine, ognuno con enigma in **latino** che svela il tipo (servono **≥3 Pokémon di quel tipo** in squadra):
  - **Antro del Foro** → 3× **Terra** → **Regirock**
  - **Antro del Teatro** → 3× **Volante** → **Registeel**
  - **Antro dell'Anfiteatro** → 3× **Buio** → **Regice**
- **Celebi**: evento raro tra le rovine (post-game). Così il luogo non è "4 leggendari ammucchiati": dungeon → santuario → evento.

---

## 👤 NOMI NPC (locali + agganci a luoghi/prodotti veri)
- **Borgata Tuscolana**: mamma · *Sor Otello* (vicino) · *Tizio del GRA*.
- **Frascati**: *Settimio il cantiniere* (Frascati DOC/Cannellino) · *Iride* (giardiniera Villa Aldobrandini).
- **Grottaferrata**: **Cesare il fornaio** · *Fra' Bartolo* (Abbazia) · *Anselmo il rigattiere* (parcheggione/mercato).
- **Marino**: *Nello il vignarolo* · *Pina della Sagra* (fontana del vino).
- **Monte Porzio**: *Ruggero il meteorologo* · *Aldo l'astrofilo*.
- **Rocca di Papa**: *Faustino il funicolarista* · *Bruno la guida* (Via Sacra/Monte Cavo).
- **Albano**: *Settimio il legionario* (Castra Albana) · **Nonna Assunta** (MN Surf, al lago).
- **Ariccia**: *Sora Nunzia della fraschetta* · *Peppe er porchettaro* · *il vecchio del ponte*.
- **Genzano**: *Romolo il panettiere* (Pane di Genzano IGP) · *Iolanda dell'Infiorata*.
- **Castel Gandolfo**: *la guardia svizzera* · *Tonino il barcaiolo*.
- **Nemi**: *Rosa la fragolara* (fragoline di Nemi) · *il custode del Museo delle Navi*.

---

## 🚧 [DA DEFINIRE] — restano aperti
1. **Bunkerino**: nomi/storia dei creatori sconfitti da Mewtwo (lore di dettaglio).
2. **Battute di trama** degli NPC (i filler sono in `DIALOGHI-NPC.md`; i dialoghi di storia si rifiniscono in F9).
3. **Coordinate dei luoghi nuovi** (vedi checklist sotto): da assegnare in F9-F11.

---

## 🔧 RICONCILIAZIONE COL CODICE (gap analysis — sessione 8)
> Nessun conflitto bloccante: il canone si appoggia bene su `data.js`/`world.js`. Todo per fase:
- **F9** — Economia: soldi nello stato, Poké Market, Super/Ultra Ball, Iper/Superpozione, Revitalizzante, Repellente, Antidoti. Sistema **tempo**, **MN**, donatori, gate-MN. **Centri Pokémon nuovi**: Borgata Tuscolana (serve per il tutorial "Dormi"!), Castel Gandolfo, Nemi.
- **Coordinate nuove da creare (F9-F11)**: Museo delle Navi (Nemi), Villa Aldobrandini (Frascati), fontana di San Rocco (Frascati), funivia Rocca di Papa, **Osservatorio come luogo-evento** (oggi è solo il punto-palestra), "parcheggione" di Grottaferrata, **Bunkerino** (oggi c'è solo la coord `LEGA`), Lab CoTrAL #1 (Marino) e #2 (Albano), Ponte di Ariccia (evento notte).
- **F10** — Riconciliare la costante: il codice ha `NOME_TEAM = 'Team GdF'` → rinominare in `TEAM_GDF_NOME` e aggiungere `TEAM_COTRAL_NOME`.
- **F11** — Sezione LEGGENDARI di CLAUDE.md già allineata nel file nuovo. Attenzione alla **sovrapposizione**: grotta-vulcano (Groudon) sta dentro monte-cavo (Lugia); la priorità zone la gestisce, ma i due trigger vanno tenuti distinti.
- **F12** — `LEGA`: aggiungere campo **Campione = Remo** e i **pool** dei Superquattro.
