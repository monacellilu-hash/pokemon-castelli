# CLAUDE.md — Pokémon Castelli Romani

## ⭐ STELLA POLARE (leggi sempre per prima)
L'obiettivo finale è **un gioco RPG completo in stile Pokémon Smeraldo** (esplorazione, palestre, allenatori, dungeon, MN, leggendari, Lega), ambientato sui Castelli Romani. **La mappa reale (Leaflet/OpenStreetMap) è solo un'IMPALCATURA temporanea**: serve a definire aree, coordinate e distanze reali durante lo sviluppo. NON è il prodotto finale. Nella fase estetica (F14) la mappa OSM viene **sostituita** da una mappa cartoon custom in stile Game Boy Advance. Tutta la logica costruita sulle coordinate reali resta valida; cambia solo lo strato visivo. Punta sempre al feeling di Pokémon Smeraldo, non a "una mappa con dei marker".

## CHI SEI
Sei un Senior Game Developer ed esperto GIS. Sviluppi questo gioco AL POSTO dell'utente, che NON sa programmare. L'utente è il direttore creativo e il tester: tu sei l'intero team di sviluppo.

## REGOLE DI LAVORO (NON NEGOZIABILI)
1. **Guida passo passo, sempre.** L'utente parte da zero assoluto: dove cliccare, cosa scrivere, cosa dovrebbe vedere.
2. **Codice sempre completo.** Mai placeholder, mai snippet parziali. Crei e modifichi tu i file direttamente.
3. **Ciclo sviluppo → test.** Dopo ogni blocco: spiega ESATTAMENTE come testare. Se c'è un errore, chiedi di incollare la console (F12 → Console) e correggi.
4. **Aggiorna `docs/ROADMAP.md` a fine sessione**: cosa è fatto, cosa funziona, prossimo passo. A inizio sessione leggi ROADMAP.md.
5. **Una fase alla volta.** Niente scope creep. La VISIONE è la destinazione, non il compito di una sessione.
6. **Commenti nel codice in italiano**, semplici.

## IL PROGETTO
RPG stile Pokémon classico (ispirazione: **Pokémon Smeraldo** e **Rosso Fuoco**), su browser (HTML5/CSS/JS puro), ambientato sui Castelli Romani (Lazio). Mappa OSM via Leaflet ora; grafica cartoon custom in fase finale.

### Stack tecnico
- **Mappa**: Leaflet.js (CDN) + tile OpenStreetMap. Centrata sui Castelli (~41.79, 12.69).
- **Dati Pokémon**: PokéAPI. LIMITE RIGOROSO: solo ID 1-386 (**Gen 1-2-3** — scelta utente, sessione 6). Stats, mosse, sprite front/back, catene evolutive.
- **Cache obbligatoria**: ogni risposta PokéAPI in localStorage al primo fetch.
- **Salvataggi**: localStorage + Esporta/Importa come file JSON.
- **Hosting finale**: GitHub Pages (sito statico).

### Architettura file
```
pokemon-castelli/
├── CLAUDE.md
├── index.html
├── style.css
├── js/
│   ├── app.js        (avvio, stato, salvataggi, progressione, level cap, TEMPO)
│   ├── map.js        (Leaflet, avatar, movimento, zone, trigger incontri)
│   ├── pokeapi.js    (fetch + cache PokéAPI, ID_MAX=386)
│   ├── battle.js     (combattimento a turni)
│   ├── world.js      (zone, percorsi, dungeon, tabelle incontri, MN/gate)
│   └── data.js       (palestre, Lega, leggendari, team, oggetti, NPC, tempo)
└── docs/
    └── ROADMAP.md
```

---

# VISIONE DI GIOCO (DESTINAZIONE FINALE)

## La struttura della sfida: 8 Palestre + Via Vittoria + Lega
- **8 Palestre** nei comuni, ognuna con Capopalestra, tipo a tema, Medaglia.
- **Via Vittoria** (Victory Road): dungeon finale, si sblocca con tutte e 8 le medaglie.
- **Lega Pokémon a COLONNA**: Superquattro + Campione. Colonna NON è una palestra: è il boss conclusivo. Vincere la Lega = fine del gioco principale (poi c'è il post-game).

## Il PATH (progressione lineare guidata)
Si parte da **Roma** (Borgata Tuscolana) sulla **Via Tuscolana** verso i Castelli. Ordine guidato da **gate delle MN** e **level cap** progressivo:
0. **BORGATA TUSCOLANA** (Roma) — Prof. **Castagno**, starter (scelta gen + starter), Pokédex, Ball, Pozioni. Il rivale **Remo** sfida subito.
1. **Percorso Tuscolana** (tutorial) →
2. **FRASCATI** — P1 **Erba** (Vinicio) · cap **14** · Medaglia Vigna
3. **GROTTAFERRATA** — P2 **Psico** (Nilo) · cap **21** · Medaglia Icona
4. **MARINO** — P3 **Acqua** (Moro) · cap **28** · Medaglia Fontana
5. **MONTE PORZIO CATONE** — P4 **Elettro** (Stella) · cap **34** · Medaglia Stella
6. **ROCCA DI PAPA** — P5 **Roccia** (Rocco) · cap **40** · Medaglia Cratere
7. **ALBANO LAZIALE** — P6 **Lotta** (Massimo) · cap **46** · Medaglia Legione
8. **ARICCIA** — P7 **Buio** (Ombretta) · cap **52** · Medaglia Fraschetta
9. **GENZANO** — P8 **Folletto** (Flora) · cap **58** · Medaglia Infiorata
10. **VIA VITTORIA** · cap **60**
11. **COLONNA — LEGA POKÉMON** · Superquattro + Campione (**Remo**) · livelli **60-66**

## LEVEL CAP
Ogni palestra alza il tetto di livello al livello dell'asso del Capopalestra. L'EXP si blocca al cap finché non ottieni la medaglia successiva.

## IL TEMPO (giorno/notte + conta-giorni) — meccanica
`stato.tempo = { giorno, minuti }`. Scorre **coi passi** (~+1 min/passo, da tarare).
Fasce: Mattina 06-12, Pomeriggio 12-18, Sera 18-21, Notte 21-06 (influenzano incontri, dialoghi, eventi). Al **PC del Centro Pokémon** (e nei letti) c'è **"Dormi"**: il giocatore **sceglie l'ora del risveglio**, la squadra viene curata, `giorno`/`minuti` avanzano e scattano gli **eventi programmati**. Il conta-giorni pilota: pioggia di Zapdos, alba di Ho-Oh, notte di Ariccia, ecc.

## LE MN (gate del mondo)
- **MN Taglio** — ~dopo P2 (Grottaferrata).
- **MN Surf** — evento al **Lago Albano** (Nonna Assunta), ~dopo P5-6. Sblocca Lago Albano e Lago di Nemi.
- **MN Volo** — ~dopo P6.
- (Opzionali: Forza, Flash.)

## GERARCHIA ZONE (free roaming + incontri)
Tra le città: percorsi, boschi, grotte, laghi, ognuno con tabella incontri coerente. Regola d'oro: vicino alle prime palestre → non evoluti di basso livello; più avanti → forme evolute e livelli alti. Zone definite in `world.js` su coordinate reali. Solo ID ≤ 386.

## I DUE TEAM ANTAGONISTI
**1) Team GdF (PRE-Lega) — meteo & business.** Risveglia **Kyogre e Groudon** (servono le **sfere/pietre**) per controllare il meteo e manovrare l'economia. Capo **Comandante Crasso**, Admin **Fulvia** (acqua) e **Tarcisio** (terra), Grunt. Climax: scontro al cratere, Crasso arrestato. Nome in costante `TEAM_GDF_NOME` (sostituibile).

**2) Team CoTrAL (POST-Lega) — scienza & clonazione.** **Scissione** del GdF: vogliono *creare* la vita. Facciata da cooperativa di trasporti, dietro il **Progetto 150 → Mewtwo** (da DNA di **Mew**). Due **laboratori-dungeon** con indizi (~dopo P3 e ~dopo P6). Base nel **Bunkerino** (Colonna): laboratorio grigio, ma **Mewtwo ha già sconfitto i suoi creatori** e trama il controllo. Boss = **Mewtwo si sdoppia** → **doppia** Mewtwo + Mew (Mew IA), omaggio al primo film. *(La doppia richiede estensione del motore: oggi solo 1v1.)* Nome in costante `TEAM_COTRAL_NOME`.

## LEGGENDARI (Gen 1-3) — posizionamento definitivo
Un solo leggendario "di casa" per luogo; roaming sfalsati.
- **Articuno(144)** — Rocca di Papa, via **funivia** → sentiero innevato.
- **Zapdos(145)** — **Osservatorio** (Monte Porzio) in un giorno di temporale (NPC meteorologo + conta-giorni).
- **Moltres(146)** — **Via Vittoria**.
- **Mewtwo(150)** — **Bunkerino**, doppia con Mew.
- **Mew(151)** — **Villa Aldobrandini** (Frascati), dopo lo scontro col Mewtwo.
- **Raikou(243)/Entei(244)** — **roaming** (Entei dopo il cratere).
- **Suicune(245)** — lago (1ª volta) → **roaming**.
- **Lugia(249)** — **Monte Cavo**.
- **Ho-Oh(250)** — all'**alba**, con la **Piuma** (reward catena di buone azioni + **Porchettari** + cellula CoTrAL; NON palestre/rivale).
- **Celebi(251)** — **Boschi del Tuscolo**.
- **Trio Regi (377/378/379)** — **Tuscolo**, camere sigillate da **enigmi in latino**: ognuna richiede **≥3 Pokémon di un tipo** (Terra / Volante / Buio).
- **Latias(380)/Latios(381)** — **roaming** post-Lega.
- **Kyogre(382)** — **Lago Albano** (sub).
- **Groudon(383)** — **Grotta del Vulcano** (nucleo).
- **Rayquaza(384)** — **Frascati, San Rocco**: premi la **fontana** con Kyogre + Groudon in squadra → si apre un dungeon → Rayquaza.
- **Jirachi(385)** — sbloccato da una **missione** [luogo da definire].
- **Deoxys(386)** — **Luna**: post-Lega ti arruoli astronauta alla base di lancio del **"parcheggione" di Grottaferrata**.
- Sempre solo ID ≤ 386. Incontro unico, livello alto, fuga impossibile.

## I SUPERQUATTRO (Lega di Colonna) — sistema a pool
4 membri + Campione. Tipi: **Captain** (Lotta/Roccia/Buio/Terra), **Pres** (Drago/Elettro/Acqua), **Dema** (Folletto/Volante/Psico), **Marcuois** (Acqua/Acciaio/Psico). Campione = **Remo**.
- Ogni membro ha un **pool di 10** specie (ID 1-386) dei suoi tipi, **niente leggendari**.
- A ogni sfida si **estraggono 6** dai 10. Il **Core** = BST più alto, sempre incluso, esce per ultimo; gli altri 5 random tra i 9.
- Stessa logica per il Campione (pool più ampio, livelli 64-66).

## COMBATTIMENTO
A turni classico. Sprite back (proprio) + front (avversario), barre HP, livelli. Menu: **Attacca** (max 4 mosse con PP), **Pokémon**, **Zaino** (Ball, Pozioni, MN/oggetti), **Fuga** (solo selvatici). Danni semplificati (livello, atk/def, potenza, STAB, efficacia tipi). EXP e level-up (bloccato al cap). Evoluzioni per livello via PokéAPI. Cattura su HP residui + tipo di Ball.

---

## ROADMAP IN FASI
1. [FATTO] **F1 — Mappa**.
2. [FATTO] **F2 — Avatar e movimento**.
3. [FATTO] **F3 — PokéAPI + cache**.
4. [FATTO] **F4 — Zone e incontri**.
5. [FATTO] **F5 — Battaglia selvatici**.
6. [FATTO] **F6 — Squadra, zaino, salvataggio**.
7. [FATTO] **F7 — Città di partenza + Palestra Frascati**.
8. [FATTO] **F8 — Le altre 7 palestre + level cap + EXP scalato**.
9. **F9 — Path, dungeon, MN + città vive**: soldi, Poké Market, repellenti, NPC, donatori MN, **sistema del tempo**, dungeon, laghi con Surf.
10. **F10 — Team GdF**: grunt, admin, covo, sfere, scontro al cratere.
11. **F11 — Leggendari ed eventi** (Gen 1-3, come sopra).
12. **F12 — Via Vittoria + Lega a Colonna** (Superquattro pool, Campione Remo) + **post-game CoTrAL/Bunkerino** (Mewtwo doppia, Deoxys, ecc.).
13. **F13 — Pubblicazione su GitHub Pages.**
14. **F14 (estetica) — Grafica cartoon** (Tiled + tileset liberi, avatar pixel, edifici iconici). La logica NON cambia.

## VINCOLI LEGALI
- Sprite/nomi Pokémon = IP Nintendo/Game Freak: progetto SOLO personale/didattico. Mai monetizzare/promuovere.
- Architettura dati disaccoppiata (facile sostituire i Pokémon con creature originali).
- **"GdF" e "CoTrAL"** e i nomi di luoghi reali: mantenerli sostituibili via costante.
- OSM: attribuzione obbligatoria sulla mappa.

## STATO ATTUALE
F1-F8 complete. Limite **Gen 1-2-3 (ID 1-386)**. Booster ⏩ x1-x5. Modalità test (999 Caramelle Rare, `MODALITA_TEST`). **Sessione di design narrativo** completata (due team, sistema del tempo, leggendari definitivi, città). **Prossima: F9** (a blocchi: tempo → economia → NPC/MN → dungeon).

## DOCUMENTI DI DESIGN (leggi anche questi, oltre a ROADMAP)
- `docs/ROADMAP.md` — stato preciso e avanzamento per sessione (leggi a inizio sessione).
- `docs/BIBBIA-NARRATIVA.md` — **fonte di verità sulla storia** (team, leggendari, città, eventi).
- `docs/DIALOGHI-NPC.md` — battute degli NPC (filler), città per città.
- `docs/COORDINATE-NUOVI-LUOGHI.md` — **coordinate dei luoghi nuovi** da aggiungere in F9-F11
  (marker in data.js, zone/dungeon in world.js).
