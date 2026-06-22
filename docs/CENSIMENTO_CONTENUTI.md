# CENSIMENTO CONTENUTI — Pokémon Castelli Romani

> Generato leggendo il codice sorgente reale (js/data.js, js/world.js, js/app.js, js/battle.js, dati/*.js).
> Niente è inventato: se un contenuto non è nel codice, è segnalato come "NON IMPLEMENTATO".

---

## 1. TRAINER (Allenatori di percorso e dungeon)

**Totale: 168 allenatori** (131 nel vecchio sistema ALLENATORI + 15 Via Vittoria + 5 GdF Grunt + 4 CoTrAL Ariccia + 5 Bunkerino + 5 GdF Lab patrol + 3 nel nuovo sistema Tiled)

### 1A. Sistema vecchio (ALLENATORI in data.js) — 153 allenatori

| Zona | N° | Lv Range | ID Pattern | Note |
|---|---|---|---|---|
| Percorso Tuscolana | 8 | 4–8 | all-tusc-1…8 | Tutorial |
| Via Frascati→Grottaferrata | 6 | 7–11 | all-fg-1…6 | |
| Vigne di Frascati | 6 | 7–10 | all-frasc-1…6 | |
| **Boschi del Tuscolo** | **18** | 8–12 | all-bosco-1…18 | Dungeon grande |
| Via Grottaferrata→Marino | 5 | 9–14 | all-gm-1…5 | |
| Vigne di Marino | 6 | 7–10 | all-marino-1…6 | |
| Boschetto Segreto | 4 | 12–15 | all-boschetto-1, all-bosch-2…4 | Post MN Taglio |
| Via Marino→Monte Porzio | 5 | 12–17 | all-mmp-1…5 | |
| Via Monte Porzio→Rocca | 10 | 17–27 | all-mpr-1…5 + Famiglia Vinci (×6) | Nonno/Nonna/Papà/Mamma/Figlio/Figlia |
| Via Rocca→Albano | 5 | 27–35 | all-rpa-1…5 | |
| Via Albano→Ariccia | 5 | 36–42 | all-aa-1…5 | |
| Campagna Ariccia→Genzano | 8 | 30–44 | all-camp-1…8 | |
| **Grotta del Vulcano** | **16** | 17–25 | all-grotta-1…16 | Dungeon grande |
| Monte Cavo | 7 | 40–46 | all-cavo-1…7 | |
| Sentiero Innevato | 6 | 36–44 | all-neve-1…6 | Post Funivia |
| **Lab CoTrAL #1** | **15** | 22–30 | all-lab1-1…15 | Boss: Admin Fulvia |
| **Lab CoTrAL #2** | **17** | 40–50 | all-lab2-1…17 | Boss: Admin Tarcisio + Cmdt. Crasso |

### 1B. GdF Grunt (pattuglie) — 5 allenatori

| ID | Zona | Lv | Squadra |
|---|---|---|---|
| gdf-grunt-1 | Nemi | 23–25 | Gyarados 23, Golduck 25 |
| gdf-grunt-2 | Nemi | 22–24 | Lombre 22, Gyarados 24 |
| gdf-grunt-3 | Campagna Marino | 26–27 | Golduck 26, Poliwhirl 27 |
| gdf-grunt-4 | Albano→Lab | 34–35 | Gyarados 34, Onix 35 |
| gdf-grunt-5 | Avamposto Genzano | 38 | Houndoom 38, Umbreon 38 |

### 1C. Via Vittoria — 15 allenatori

| ID | Nome | Lv | Squadra (riassunto) | Premio |
|---|---|---|---|---|
| all-vv-1 | Manlio | 55 | Machamp 55, Steelix 55, Aggron 55 | 5500₽ |
| all-vv-2 | Tuzia | 56 | Vileplume 56, Bellossom 56, Cradily 56 | 5600₽ |
| all-vv-3 | Lucio | 56 | Electrode 56, Raichu 56, Magneton 56 | 5600₽ |
| all-vv-4 | Cornelia | 57 | Absol 57, Houndoom 57, Shiftry 57 | 5700₽ |
| all-vv-5 | Gaio | 57 | Flygon 57, Sandslash 57, Donphan 57 | 5700₽ |
| all-vv-6 | Livia | 57 | Walrein 57, Lapras 57, Milotic 57 | 5700₽ |
| all-vv-7 | Catone | 58 | Alakazam 58, Hypno 58, Mr.Mime 58 | 5800₽ |
| all-vv-8 | Galla | 58 | Dragonite 58, Salamence 58, Altaria 58 | 6000₽ |
| all-vv-9 | Servio | 58 | Snorlax 58, Blissey 58, Slaking 58 | 5800₽ |
| all-vv-10 | Fulvia-bis | 59 | Gengar 59, Weezing 59, Crobat 59 | 5900₽ |
| all-vv-11 | Tiberio | 59 | Heracross 59, Pinsir 59, Scizor 59 | 5900₽ |
| all-vv-12 | Aemilia | 59 | Gardevoir 59, Espeon 59, Grumpig 59 | 5900₽ |
| all-vv-13 | Valeria | 60 | Dragonite 60, Kingdra 60, Gyarados 60 | 6500₽ |
| all-vv-14 | Spurinna | 60 | Aggron 60, Metagross 60, Armaldo 60 | 6500₽ |
| all-vv-15 | Tullio (Custode) | 60 | Tyranitar 60, Golem 60, Gengar 60, Starmie 60 | 7000₽ |

### 1D. CoTrAL Ariccia (post-Lega) — 4 allenatori

| ID | Lv | Squadra |
|---|---|---|
| cotral-ariccia-1 | 50–52 | Houndoom 50, Mightyena 52 |
| cotral-ariccia-2 | 51–53 | Magneton 51, Electrode 53 |
| cotral-ariccia-3 | 52–53 | Crobat 52, Weezing 53 |
| cotral-ariccia-4 (Cmdt. Spurinna) | 52–54 | Houndoom 52, Magneton 53, Crobat 54 | `flagVittoria: 'cotralAricciaDebellata'` |

### 1E. Bunkerino di Colonna — 5 allenatori

| ID | Lv | Squadra |
|---|---|---|
| bunkerino-grunt-1 | 58–59 | Electrode 58, Magneton 59 |
| bunkerino-grunt-2 | 59–60 | Houndoom 59, Weezing 60 |
| bunkerino-grunt-3 | 60–61 | Crobat 60, Muk 61 |
| bunkerino-grunt-4 | 61–62 | Magneton 61, Electrode 62 |
| bunkerino-boss (Direttore Lucio) | 63–65 | Alakazam 63, Slowking 63, Exeggutor 63, Houndoom 65 | `flagVittoria: 'bunkerinoDebellato'` |

### 1F. Sistema nuovo Tiled (DATI_TRAINER in dati/trainer.js) — 3 allenatori

| ID | Sprite | Vista | Squadra | Premio |
|---|---|---|---|---|
| trainer path 1_0 | YOUNGSTER | 4 tile | Rattata 4, Pidgey 5 | 120₽ |
| trainer path 1_1 | BUGCATCHER | 7 tile | Caterpie 4, Weedle 4 | 100₽ |
| trainer path 1_2 | LASS | 7 tile | Nidoran♀ 5, Nidoran♂ 5 | 130₽ |

> ⚠ PLACEHOLDER: squadre e dialoghi provvisori — da riempire.

---

## 2. CAPOPALESTRA (8 palestre)

| # | Città | ID | Tipo | Capopalestra | Squadra | Medaglia | Cap |
|---|---|---|---|---|---|---|---|
| 1 | Frascati | frascati | Erba | Vinicio | Oddish 11, Shroomish 12, Gloom 13, **Roselia 14** | Vigna | 14 |
| 2 | Grottaferrata | grottaferrata | Psico | Nilo | Natu 17, Spoink 18, Kadabra 19, Hypno 20, **Grumpig 21** | Icona | 21 |
| 3 | Marino | marino | Acqua | Moro | Pelipper 25, Seaking 26, Quagsire 26, Azumarill 27, **Gyarados 28** | Fontana | 28 |
| 4 | Monte Porzio | monte-porzio | Elettro | Stella | Raichu 31, Electrode 32, Magneton 32, Manectric 33, **Ampharos 34** | Stella | 34 |
| 5 | Rocca di Papa | rocca-di-papa | Roccia | Rocco | Sandslash 36, Lairon 37, Golem 38, Rhydon 39, **Aggron 40** | Cratere | 40 |
| 6 | Albano | albano | Lotta | Massimo | Hitmonchan 42, Hitmonlee 43, Breloom 44, Hariyama 44, Medicham 45, **Machamp 46** | Legione | 46 |
| 7 | Ariccia | ariccia | Buio | Ombretta | Mightyena 48, Sharpedo 49, Shiftry 50, Crawdaunt 50, Absol 51, **Houndoom 52** | Fraschetta | 52 |
| 8 | Genzano | genzano | Folletto | Flora | Wigglytuff 54, Mr. Mime 55, Granbull 55, Clefable 56, Azumarill 57, **Gardevoir 58** | Infiorata | 58 |

**Grassetto = asso (ultimo Pokémon, livello = level cap)**

### Gregari per palestra (gauntlet)

| Palestra | Gregari | Lv Range |
|---|---|---|
| P1 Frascati | 3 | 9–13 |
| P2 Grottaferrata | 4 | 15–20 |
| P3 Marino | 5 | 22–27 |
| P4 Monte Porzio | 6 | 28–33 |
| P5 Rocca di Papa | 7 | 34–39 |
| P6 Albano | 8 | 40–45 |
| P7 Ariccia | 9 | 46–51 |
| P8 Genzano | 10 | 52–57 |

**Totale gregari: 52** — IMPLEMENTATI in data.js, sistema gauntlet in app.js.

---

## 3. NPC (abitanti e NPC speciali)

### 3A. ABITANTI (gente del posto — data.js) — 12 gruppi, ~52 NPC

| Comune | N° battute | Tipo |
|---|---|---|
| Borgata Tuscolana | 5 | Sora Pina, Ragazzino, Pensionato, Tizio del GRA, Signora con la borsa |
| Frascati | 5 | Settimio il cantiniere, Turista perso, Oste, Ragazza (hint Mew), Vecchietto |
| Grottaferrata | 5 | Cesare il fornaio, Fra' Bartolo, Anselmo, Studentessa, Tizio col cane |
| Marino | 5 | Nello il vignarolo, Pina della Sagra, Bambino bagnato, Pescatore, Signora |
| Monte Porzio Catone | 5 | Ruggero (hint Zapdos), Aldo l'astrofilo, Studente, Vecchietto, Ragazza |
| Rocca di Papa | 4 | Bruno la guida, Anziano del Carpino, Signora, Ragazzino (hint vulcano) |
| Albano Laziale | 4 | Settimio il legionario, Storico, Bambino, Tizio sospettoso (hint GdF) |
| Ariccia | 5 | Sora Nunzia, Peppe, Il vecchio del ponte, Musicista, Turista |
| Genzano | 5 | Romolo il panettiere, Iolanda, Bambina, Fioraio, Vecchietto (hint Via Vittoria) |
| Castel Gandolfo | 3 | Guardia, Tonino barcaiolo (hint Kyogre), Signora |
| Nemi | 3 | Rosa la fragolara, Custode Museo, Pescatore (hint Suicune) |
| Colonna | 3 | Anziano, Tizio (hint CoTrAL/Bunkerino), Ragazzo |

### 3B. NPC speciali (data.js — marker dedicati)

| NPC | Dove | Funzione |
|---|---|---|
| Prof. Castagno | Laboratorio, Borgata | Starter, Pokédex, Ball, Pozioni |
| Rivale Remo | Laboratorio + 3 rivincite lungo il path | Sfida con starter forte vs tuo |
| Fra' Potatore | Grottaferrata (Abbazia) | Dona MN Taglio (≥2 medaglie) |
| Nonna Assunta | Verso Lago Albano | Dona MN Surf (≥5 medaglie) |
| Faustino | Rocca di Papa (funivia) | Dona MN Volo (≥6 medaglie) + sblocco funivia |
| Ruggero il meteorologo | Monte Porzio Catone | Annuncia temporale → Zapdos (in 3 giorni) |
| Adriano il porchettaro | Ariccia | Dà Piuma Iridescente dopo aver battuto 4 CoTrAL |
| Custode Museo Navi | Nemi | Cutscene furto Sfere (Team GdF) |

### 3C. NPC nuovo sistema Tiled (DATI_NPC in dati/npc.js) — 6 NPC

| ID | Sprite | Dove | Azione |
|---|---|---|---|
| pallet_oldman | NPC 01 | Borgata TMJ | Dialogo: "AO NAMOOOO. IL VINO DELI CASTELLIIIII" |
| pallet_girl | npc girl | Borgata TMJ | Dialogo: "Preso il pokemon si? guarda che qua ti rubano tutto" |
| pallet_man | NPC 02 | Borgata TMJ | Dialogo: "Casa del nipote del professore…" |
| prof_castagno | npc professore castagno | Lab TMJ | → chiama `interagisciLaboratorio()` |
| Rivale | npc Rivale | Lab TMJ | Dialogo generico |
| npc_joy | npc joy | PokéCenter TMJ | → chiama `interagisciCentroTiled()` |

---

## 4. ZONE DI INCONTRO (Pokémon selvatici)

### 4A. Sistema vecchio (world.js) — 23 zone

| Zona | Terreno | Lv | Pokémon | Bloccata? |
|---|---|---|---|---|
| citta-partenza | urbano | 2–4 | Rattata, Pidgey | No |
| percorso-tuscolana | prato | 2–6 | Pidgey, Rattata, Caterpie, Weedle, Oddish, Poliwag, Bellsprout, Nidoran♀ | No |
| vigne-frascati | vigne | 3–8 | Oddish, Bellsprout, Caterpie, Wurmple, Nincada, Surskit, Budew | No |
| boschi-tuscolo | bosco | 5–11 | Oddish, Bellsprout, Paras, Spinarak, Murkrow, Poochyena, Shroomish, Hoothoot, Pineco, Seedot | No |
| vigne-marino | vigne | 4–9 | Oddish, Bellsprout, Caterpie, Wurmple, Nincada, Surskit, Budew, Volbeat, Illumise | No |
| boschetto-taglio | bosco | 9–15 | Gloom, Weepinbell, Parasect, Ariados, Murkrow, Mightyena, Breloom, Noctowl, Dustox | Sì (MN Taglio) |
| grotta-vulcano | grotta | 15–25 | Zubat, Golbat, Geodude, Graveler, Diglett, Onix, Numel | No |
| lago-albano | acqua | 15–25 | Tentacool, Magikarp, Goldeen, Poliwag, Psyduck, Marill, Carvanha | Sì (MN Surf) |
| lago-nemi | acqua | 25–40 | Tentacool, Tentacruel, Gyarados, Goldeen, Seaking, Poliwhirl, Golduck, Azumarill, Sharpedo, Milotic, Feebas, Corphish | Sì (MN Surf) |
| monte-cavo | montagna | 35–50 | Graveler, Golem, Machoke, Medicham, Donphan, Skarmory, Absol, Sneasel, Sableye, Lairon, Numel, Camerupt | No |
| sentiero-innevato | neve | 36–44 | Snorunt, Swinub, Piloswine, Sneasel, Delibird, Seel, Smoochum | Sì (Funivia) |
| via-vittoria | grotta | 55–60 | Golbat, Graveler, Machoke, Lairon, Hariyama, Medicham, Onix | Sì (8 medaglie) |
| pratoni-vivaro | prato | 35–50 | Tauros, Miltank, Nidoking, Nidoqueen, Dodrio, Rapidash, Kangaskhan, Scyther | No |
| lab-cotral-1 | interno | 22–30 | Magnemite, Voltorb, Zubat | No |
| lab-cotral-2 | interno | 40–50 | Magneton, Electrode, Unown, Golbat | No |
| 8 centri urbani | urbano | vari | Rattata, Meowth, Murkrow, Pidgey (tabella INCONTRI_URBANI) | No |
| campagna-aperta | campagna | 4–12 | Rattata, Pidgey, Oddish, Poliwag, Caterpie, Bellsprout, Nidoran♂, Sentret (zona fallback) | No |

### 4B. Sistema nuovo Tiled (dati/incontri.js) — 1 zona

| ID | Probabilità | Pokémon |
|---|---|---|
| incontri percorso 1 | 15% per passo | Pidgey 3–5, Rattata 2–5, Caterpie 3–5, Weedle 3–4, Nidoran♀ 2–4 |

---

## 5. DUNGEON

| Dungeon | Stato | N° Trainer | Lv | Note |
|---|---|---|---|---|
| Boschi del Tuscolo | **IMPLEMENTATO** | 18 | 8–12 | Dungeon grande, zona selvatici bosco |
| Grotta del Vulcano | **IMPLEMENTATO** | 16 | 17–25 | Dungeon grande, zona selvatici grotta |
| Lab CoTrAL #1 (Marino) | **IMPLEMENTATO** | 15 | 22–30 | Boss: Admin Fulvia |
| Lab CoTrAL #2 (Albano) | **IMPLEMENTATO** | 17 | 40–50 | Boss: Tarcisio + Crasso (fine Team GdF) |
| Sentiero Innevato | **IMPLEMENTATO** | 6 | 36–44 | Gate: funivia (5 medaglie). Articuno |
| Via Vittoria | **IMPLEMENTATO** | 15 | 55–60 | Gate: 8 medaglie. Moltres |
| Bunkerino di Colonna | **IMPLEMENTATO** | 5 (gauntlet) | 58–65 | Post-Lega, boss Direttore Lucio → Mewtwo |
| Boschetto Segreto | **IMPLEMENTATO** | 4 | 12–15 | Gate: MN Taglio |
| Monte Cavo | **IMPLEMENTATO** | 7 | 40–46 | Pre-Lega |
| Anfratti Regi (×3) | **IMPLEMENTATO** | 0 | — | Enigmi in latino → Regirock/Regice/Registeel |

---

## 6. POKÉMON LEGGENDARI

### Implementati con trigger e battaglia

| ID | Pokémon | Dove | Lv | Trigger | Funzione nel codice |
|---|---|---|---|---|---|
| 144 | Articuno | Sentiero Innevato | 50 | In zona dopo sblocco funivia (≥5 medaglie) | `alPasso` → `triggeraLeggendario(144)` |
| 145 | Zapdos | Osservatorio M. Porzio | 50 | Giorno del temporale (Meteorologo +3gg) | `controllaEventiTempo()` → `triggeraLeggendario(145)` |
| 146 | Moltres | Via Vittoria | 60 | Primo check in zona Via Vittoria | `alPasso` → `triggeraLeggendario(146)` |
| 150 | Mewtwo | Bunkerino, Colonna | 70 | Post-Lega, dopo gauntlet Bunkerino | `triggeraMewtwo()` |
| 151 | Mew | Villa Aldobrandini | 50 | Post-Lega + Mewtwo sconfitto | `interagisciVillaAldobrandini()` |
| 245 | Suicune | Lago di Nemi | — | Primo ingresso con MN Surf | `triggeraSuicuneScena()` (solo cinematica, poi roaming) |
| 249 | Lugia | Pratoni del Vivaro | 50 | Post-Lega + Braciere di Nemi + cinematica | `alPasso` → `triggeraLeggendario(249)` |
| 250 | Ho-Oh | Ponte di Ariccia | 50 | Post-Lega + Piuma Iridescente + alba + Sagra (ogni 15gg) | `alPasso` → `triggeraLeggendario(250)` |
| 251 | Celebi | Boschi del Tuscolo | 40 | 1,5% per check, evento raro | `alPasso` → `triggeraLeggendario(251)` |
| 377 | Regirock | Antro del Foro (Tuscolo) | 45 | ≥3 Pokémon Terra in squadra | `interagisciAnfratto()` |
| 378 | Regice | Antro dell'Anfiteatro | 45 | ≥3 Pokémon Buio in squadra | `interagisciAnfratto()` |
| 379 | Registeel | Antro del Teatro | 45 | ≥3 Pokémon Volante in squadra | `interagisciAnfratto()` |
| 386 | Deoxys | Luna (Parcheggione) | 60 | Post-Lega + Divisa da Astronauta | `interagisciParcheggione()` |

### NON implementati (pianificati in CLAUDE.md ma senza trigger nel codice)

| ID | Pokémon | Dove previsto | Note |
|---|---|---|---|
| 243 | Raikou | Roaming | Non codificato |
| 244 | Entei | Roaming (dopo cratere) | Non codificato |
| 380 | Latias | Roaming post-Lega | Non codificato |
| 381 | Latios | Roaming post-Lega | Non codificato |
| 382 | Kyogre | Lago Albano (sub) | Solo hint in dialoghi NPC |
| 383 | Groudon | Grotta del Vulcano (nucleo) | Solo come Pokémon nella squadra di Tarcisio/Crasso |
| 384 | Rayquaza | Frascati, San Rocco (fontana) | Non codificato |
| 385 | Jirachi | Osservatorio, notte giorni dispari | Non codificato |

### Meccaniche leggendari (implementate)

- **Fuga impossibile**: `fuggireImpossibile: true` in battle.js
- **Respawn**: se KO'd, respawn in 7 giorni, max 3 tentativi poi scomparso
- **Cooldown**: non si re-triggera nella stessa visita alla zona
- **Tracking**: `stato.legCatturati[]`, `stato.legScomparsi[]`, `stato.legRespawn{}`

---

## 7. OGGETTI

### 7A. Oggetti nel mondo (OGGETTI_MAPPA in data.js) — ~80 oggetti

Distribuiti lungo il path progressivo:

| Zona | N° | Contenuto tipico |
|---|---|---|
| Percorso Tuscolana | 4 | Poké Ball, Pozione, Antidoto |
| Vigne di Frascati | 3 | Super Ball, Pozione |
| Via Frascati→Grottaferrata | 3 | Poké Ball, Superpozione |
| Boschi del Tuscolo | 6 | Super Ball, Superpozione, Repellente |
| Boschetto Segreto | 3 | Ultra Ball, Iperpozione |
| Vigne di Marino | 3 | Poké Ball, Superpozione |
| Via Marino→Monte Porzio | 4 | Super Ball, Superpozione |
| Via Monte Porzio→Rocca | 4 | Ultra Ball, Iperpozione |
| Grotta del Vulcano | 7 | Ultra Ball, Iperpozione, Revitalizzante |
| Lago Albano (Surf) | 4 | Ultra Ball, Iperpozione |
| Lago di Nemi (Surf) | 4 | Include **Braciere di Nemi** (oggetto chiave) |
| Via Rocca→Albano | 4 | Ultra Ball, Repellente |
| Lab CoTrAL #1 | 3 | Superpozione, Antidoto |
| Campagna Ariccia→Genzano | 5 | Ultra Ball, Iperpozione |
| Lab CoTrAL #2 | 3 | Iperpozione, Revitalizzante |
| Monte Cavo | 3 | Ultra Ball, Iperpozione |
| Sentiero Innevato | 4 | Ultra Ball, Iperpozione |
| Via Vittoria | 5 | Ultra Ball, Iperpozione, Revitalizzante |
| Pratoni del Vivaro | 2 | Ultra Ball |
| Bonus sparsi | 6 | Vari |

### 7B. Oggetti chiave (OGGETTI_CHIAVE) — 3 implementati

| ID | Nome | Icona | Come si ottiene | Sblocca |
|---|---|---|---|---|
| braciere-nemi | Braciere di Nemi | 🏺 | Trovato sul fondo del Lago di Nemi (Surf) | Trigger Lugia ai Pratoni |
| piuma-sacra | Piuma Iridescente | 🪶 | Dal Porchettaro Adriano dopo 4 CoTrAL Ariccia | Trigger Ho-Oh al Ponte (alba + Sagra) |
| divisa-astronauta | Divisa da Astronauta | 👨‍🚀 | Dal responsabile ASI al Parcheggione (post-Lega) | Trigger Deoxys sulla Luna |

### 7C. Negozi (OGGETTI vendibili) — 14 oggetti

| Oggetto | Prezzo | Tipo | Disponibile da |
|---|---|---|---|
| Poké Ball | 200₽ | Cattura (bonus ×1.0) | Borgata |
| Super Ball | 600₽ | Cattura (bonus ×1.5) | Marino |
| Ultra Ball | 1200₽ | Cattura (bonus ×2.0) | Rocca di Papa |
| Pozione | 300₽ | Cura 20 HP | Borgata |
| Superpozione | 700₽ | Cura 50 HP | Frascati |
| Iperpozione | 1200₽ | Cura 200 HP | Monte Porzio |
| Revitalizzante | 1500₽ | Risveglia KO a metà HP | Rocca di Papa |
| Repellente | 350₽ | Niente incontri per 100 passi | Albano |
| Antidoto | 100₽ | Cura veleno | Grottaferrata |
| Antiparalisi | 200₽ | Cura paralisi | Grottaferrata |
| Antiscottatura | 250₽ | Cura scottatura | Monte Porzio |
| Antigelo | 250₽ | Cura congelamento | Monte Porzio |
| Antidoto totale | 600₽ | Cura qualsiasi stato | Ariccia |
| Caramella Rara | — | +1 livello (solo test) | Solo con MODALITA_TEST |

### 7D. Oggetto nel sistema Tiled — 1 oggetto

| ID nel TMJ | Contenuto | Quantità | Mappa |
|---|---|---|---|
| posizione_1 | Pozione | 1 | Borgata Tuscolana |

---

## 8. MAPPE E ZONE

### 8A. Sistema vecchio (procedurale in map.js fino alla riscrittura)

10 città con layout tile-by-tile (CITTA_DEFS):
1. **Anagnina** (Borgata Tuscolana) — partenza, 24×18 tile: PC, Lab, Casa PG, Casa Rivale
2. **Frascati** — 36×24: GYM, PC, Mart, Villa Aldobrandini, 3 case
3. **Grottaferrata** — 32×22: GYM, PC, Mart, Abbazia di San Nilo, 3 case
4. **Marino** — 30×20: GYM, PC, Mart, 3 case
5. **Monte Porzio Catone** — 30×20: GYM, PC, Mart, Osservatorio, 2 case
6. **Rocca di Papa** — 30×20: GYM, PC, Mart, 2 case
7. **Albano Laziale** — 32×22: GYM, PC, Mart, 3 case
8. **Ariccia** — 30×20: GYM, PC, Mart, Palazzo Chigi, 2 case
9. **Genzano** — 30×20: GYM, PC, Mart, 2 case
10. **Colonna** — 36×26: LEGA, PC, Mart, 3 case

> ⚠ Queste città sono **sostituite** dal nuovo sistema Tiled per le mappe che hanno file .tmj. Le città senza .tmj non sono più accessibili nel sistema attuale.

### 8B. Sistema nuovo Tiled (mappe .tmj) — 4 mappe

| Chiave | File TMJ | Dim (tile) | Tileset | Tipo |
|---|---|---|---|---|
| borgata_tuscolana | pokemon-castelli-Borgata_Tuscolana.tmj | 30×20 (32px) | Outside + Gyms interior | Esterno |
| percorso_tuscolana | pokemon-castelli-Percorso 1.tmj | 36×52 (32px) | Outside | Esterno |
| lab_professore | pokemon-castelli-laboratorio professore.tmj | 15×12 (16px) | Interior general | Interno |
| pokecenter | pokemon-castelli-Pokemon_center.tmj | 12×10 (32px) | Poke Centre interior | Interno |

### 8C. Transizioni implementate (da TMJ eventi)

- Borgata → Lab Professore (porta)
- Borgata → PokéCenter (porta)
- Borgata → Casa PG (porta, fallback interno generico)
- Borgata → Casa Rivale (porta, fallback interno generico)
- Borgata → Percorso 1 (uscita nord)
- Lab → Borgata (uscita)
- PokéCenter → Borgata (uscita)
- Percorso 1 → Borgata (entrata sud)

### 8D. Luoghi speciali (marker in data.js)

| Luogo | Coordinate | Funzione |
|---|---|---|
| MUSEO_NAVI | Nemi (41.7196, 12.7018) | Cutscene furto Sfere Team GdF |
| FUNIVIA_ROCCA | Rocca di Papa (41.7617, 12.7125) | Gate Sentiero Innevato |
| ANFRATTI_REGI | Tuscolo (×3) | Trio Regi |
| VILLA_ALDOBRANDINI | Frascati (41.8085, 12.6815) | Mew |
| PRATONI_VIVARO | (41.7340, 12.7340) | Lugia |
| PONTE_ARICCIA | (41.7210, 12.6700) | Ho-Oh |
| PARCHEGGIONE | Grottaferrata (41.7840, 12.6650) | Deoxys |
| BUNKERINO | Colonna (41.8360, 12.7570) | Mewtwo |
| PORCHETTARO | Ariccia (41.7185, 12.6750) | Piuma Iridescente → Ho-Oh |
| METEOROLOGO | Monte Porzio (41.8162, 12.7148) | Temporale → Zapdos |

---

## 9. SUPERQUATTRO E LEGA

### IMPLEMENTATO — Lega di Colonna

**Sistema a pool**: ogni membro ha 10 specie, ne estrae 6 per battaglia (5 random + core fisso come ultimo).

| Membro | Tipi | Lv | Core (sempre ultimo) | Pool (10 ID) |
|---|---|---|---|---|
| Captain | Lotta/Roccia/Buio/Terra | 60–62 | **Tyranitar** (248) | 68, 214, 76, 112, 306, 229, 359, 330, 34, 248 |
| Pres | Drago/Elettro/Acqua | 61–63 | **Dragonite** (149) | 149, 373, 334, 181, 135, 26, 130, 350, 121, 131 |
| Dema | Folletto/Volante/Psico | 61–63 | **Gardevoir** (282) | 282, 65, 196, 36, 176, 227, 178, 97, 210, 124 |
| Marcuois | Acqua/Acciaio/Psico | 62–64 | **Metagross** (376) | 376, 208, 212, 205, 80, 199, 134, 91, 230, 121 |

### Campione Remo

- **Livelli**: 64–66
- **Premio**: 20.000₽
- **Pool**: 11 specie — Pidgeot(18), Alakazam(65), Absol(359), Flygon(330), Snorlax(143), Heracross(214), Ampharos(181), Gengar(94), Salamence(373), Dragonite(149), Starmie(121)
- **Core**: lo starter finale (determinato dinamicamente dallo starter scelto dal giocatore)

### Rivincite Rivale Remo (RIVALE_TAPPE)

| Quando | Lv | N° Pokémon | Premio |
|---|---|---|---|
| Laboratorio (inizio) | 5–6 | 1 (starter forte vs tuo) | — |
| Prima di P3 Marino | 25–28 | 4 | 2800₽ |
| Prima di P6 Albano | 43–46 | 5 | 4600₽ |
| Prima di P8 Genzano | 54–58 | 6 vs 6 | 5800₽ |

---

## RIEPILOGO: IMPLEMENTATO vs PIANIFICATO

| Contenuto | Stato |
|---|---|
| 8 Palestre + 52 gregari | ✅ Implementato |
| 153 allenatori percorso/dungeon (vecchio sistema) | ✅ Implementato |
| 3 allenatori Tiled (Percorso 1) | ✅ Implementato (placeholder) |
| 15 allenatori Via Vittoria | ✅ Implementato |
| Team GdF (5 grunt + 32 lab) | ✅ Implementato |
| Team CoTrAL Ariccia (4) + Bunkerino (5) | ✅ Implementato |
| Lega (4 Superquattro + Campione Remo pool) | ✅ Implementato |
| 3 rivincite Rivale Remo | ✅ Implementato |
| 23 zone selvatiche | ✅ Implementato |
| 1 zona selvatica Tiled | ✅ Implementato |
| ~80 oggetti mappa | ✅ Implementato |
| 3 oggetti chiave | ✅ Implementato |
| 9 Poké Market progressivi | ✅ Implementato |
| 12 Centri Pokémon | ✅ Implementato |
| ~52 NPC dialogo (12 comuni) | ✅ Implementato |
| 6 NPC Tiled | ✅ Implementato |
| 3 donatori MN (Taglio/Surf/Volo) | ✅ Implementato |
| 13 leggendari con trigger e battaglia | ✅ Implementato |
| 8 leggendari (roaming + Kyogre/Groudon/Rayquaza/Jirachi) | ❌ Pianificato, non codificato |
| 4 mappe Tiled (Borgata, Percorso 1, Lab, PC) | ✅ Implementato |
| Mappe Tiled per le altre 9 città | ❌ Da creare |
| Contatore Pokémon avversario in battaglia trainer | ✅ Implementato |
| Sistema tempo giorno/notte | ✅ Implementato |
| Economia (Pokéyen) | ✅ Implementato |
