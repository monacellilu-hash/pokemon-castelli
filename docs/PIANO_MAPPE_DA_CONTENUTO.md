# PIANO MAPPE TILED — basato sul contenuto REALE del gioco
# Ogni mappa qui sotto elenca ESATTAMENTE cosa contiene il codice per quella zona,
# così la disegni in Tiled con il numero giusto di trainer, NPC, incontri, oggetti.
# Fonte: CENSIMENTO_CONTENUTI.md (contenuto reale nel codice).

# ════════════════════════════════════════════════════════
# COME USARE QUESTO DOCUMENTO
# ════════════════════════════════════════════════════════
# Per ogni zona trovi:
#   - TRAINER: quanti e con quali id reali (metti un marcatore type=trainer per ognuno)
#   - INCONTRI: quale zona selvatica collegare (un rettangolo type=incontri)
#   - NPC: quali NPC reali ci sono (un marcatore type=npc per ognuno)
#   - OGGETTI: quanti oggetti nascosti/visibili (type=oggetto)
#   - EDIFICI: cosa c'è da costruire (gym, PC, mart, case, landmark)
#   - USCITE: dove si collega
# In Tiled metti SOLO il marcatore (type + id). Claude Code collega il contenuto reale.
# Per gli id trainer usa quelli reali del censimento (es. all-tusc-1), così Claude Code
# li aggancia senza ambiguità.

# ════════════════════════════════════════════════════════
# BLOCCO 1 — ZONA INIZIALE (quello che stai facendo ora)
# ════════════════════════════════════════════════════════

## BORGATA TUSCOLANA (Quartiere Tuscolano) — città partenza [FATTA]
Dimensione attuale: 30×20 (32px). Già fatta.
- EDIFICI: PokéCenter, Laboratorio, Casa PG, Casa Rivale
- NPC reali (5): Sora Pina, Ragazzino, Pensionato, Tizio del GRA, Signora con la borsa
  + i 3 NPC Tiled già piazzati (pallet_oldman, pallet_girl, pallet_man)
- INCONTRI: zona "citta-partenza" (Rattata, Pidgey lv 2-4) — opzionale in città
- USCITE: → Percorso 1 (nord), → Lab, → PokéCenter, → Casa PG, → Casa Rivale
- NESSUN trainer

## PERCORSO TUSCOLANA — diviso in 2 mappe
Contenuto reale da distribuire sulle due mappe:
- TRAINER: 8 totali → all-tusc-1 … all-tusc-8 (lv 4-8)
- INCONTRI: zona "percorso-tuscolana" (Pidgey, Rattata, Caterpie, Weedle, Oddish,
  Poliwag, Bellsprout, Nidoran♀, lv 2-6)
- OGGETTI: 4 (Poké Ball, Pozione, Antidoto)
- NPC: nessuno specifico (puoi metterne 1-2 di colore se vuoi)

### pokemon-castelli - percorso 1 (prima metà)
- Metti 4 marcatori trainer: all-tusc-1, all-tusc-2, all-tusc-3, all-tusc-4
- 2 zone erba alta (rettangoli type=incontri, id collegato a percorso-tuscolana)
- 2 oggetti
- USCITE: sud → Borgata, nord → percorso 1b

### pokemon-castelli - percorso 1b (seconda metà)
- Metti 4 marcatori trainer: all-tusc-5, all-tusc-6, all-tusc-7, all-tusc-8
- 1-2 zone erba alta (id collegato a percorso-tuscolana)
- 2 oggetti
- USCITE: sud → percorso 1, nord → Frascati

# ════════════════════════════════════════════════════════
# BLOCCO 2 — FRASCATI E DINTORNI
# ════════════════════════════════════════════════════════

## FRASCATI — Palestra 1 (Erba, cap 14)
Dimensione consigliata: 36×24 (come il vecchio CITTA_DEFS)
- EDIFICI: GYM, PokéCenter, Mart, Villa Aldobrandini (landmark → Mew post-Lega), 3 case
- CAPOPALESTRA: Vinicio (Erba) — squadra Oddish 11, Shroomish 12, Gloom 13, Roselia 14
  + 3 gregari (lv 9-13) → interno palestra
- NPC reali (5): Settimio il cantiniere, Turista perso, Oste, Ragazza (hint Mew), Vecchietto
- INCONTRI: nessuno dentro città (i selvatici sono nelle vigne, vedi sotto)
- USCITE: sud → percorso 1b, est → Via Frascati-Grottaferrata, nord → Boschi del Tuscolo,
  ovest/altra → Vigne di Frascati

## VIGNE DI FRASCATI (zona selvatici + trainer)
- TRAINER: 6 → all-frasc-1 … all-frasc-6 (lv 7-10)
- INCONTRI: zona "vigne-frascati" (Oddish, Bellsprout, Caterpie, Wurmple, Nincada,
  Surskit, Budew, lv 3-8)
- OGGETTI: 3 (Super Ball, Pozione)

## VIA FRASCATI → GROTTAFERRATA
- TRAINER: 6 → all-fg-1 … all-fg-6 (lv 7-11)
- OGGETTI: 3 (Poké Ball, Superpozione)
- USCITE: → Frascati, → Grottaferrata

## BOSCHI DEL TUSCOLO (DUNGEON GRANDE)
- TRAINER: 18 → all-bosco-1 … all-bosco-18 (lv 8-12)
- INCONTRI: zona "boschi-tuscolo" (Oddish, Bellsprout, Paras, Spinarak, Murkrow,
  Poochyena, Shroomish, Hoothoot, Pineco, Seedot, lv 5-11)
- OGGETTI: 6 (Super Ball, Superpozione, Repellente)
- SPECIALE: Celebi (raro, post evento), 3 Anfratti Regi (Regirock/Regice/Registeel)
- Probabilmente da dividere in 2-3 mappe Tiled (è grande, 18 trainer)
- USCITE: da Frascati (nord), da Grottaferrata, da Monte Porzio

## BOSCHETTO SEGRETO (gate MN Taglio)
- TRAINER: 4 → all-boschetto-1, all-bosch-2, all-bosch-3, all-bosch-4 (lv 12-15)
- INCONTRI: zona "boschetto-taglio" (lv 9-15, richiede MN Taglio)
- OGGETTI: 3 (Ultra Ball, Iperpozione)

# ════════════════════════════════════════════════════════
# BLOCCO 3 — GROTTAFERRATA E MARINO
# ════════════════════════════════════════════════════════

## GROTTAFERRATA — Palestra 2 (Psico, cap 21)
Dimensione: 32×22
- EDIFICI: GYM, PC, Mart, Abbazia di San Nilo (landmark), 3 case
- CAPOPALESTRA: Nilo (Psico) — Natu 17, Spoink 18, Kadabra 19, Hypno 20, Grumpig 21
  + 4 gregari (lv 15-20)
- NPC reali (5): Cesare il fornaio, Fra' Bartolo, Anselmo, Studentessa, Tizio col cane
- SPECIALE: Fra' Potatore (dona MN Taglio, ≥2 medaglie)
- USCITE: → Via Frascati-Grottaferrata, → Via Grottaferrata-Marino, → Boschi Tuscolo

## VIA GROTTAFERRATA → MARINO
- TRAINER: 5 → all-gm-1 … all-gm-5 (lv 9-14)
- USCITE: → Grottaferrata, → Marino

## MARINO — Palestra 3 (Acqua, cap 28)
Dimensione: 30×20
- EDIFICI: GYM, PC, Mart, 3 case (+ accesso Lab CoTrAL #1 nei pressi)
- CAPOPALESTRA: Moro (Acqua) — Pelipper 25, Seaking 26, Quagsire 26, Azumarill 27,
  Gyarados 28 + 5 gregari (lv 22-27)
- NPC reali (5): Nello il vignarolo, Pina della Sagra, Bambino bagnato, Pescatore, Signora
- USCITE: → Via Grottaferrata-Marino, → Vigne di Marino, → Via Marino-Monte Porzio,
  → Lago Albano (Surf), → Lab CoTrAL #1

## VIGNE DI MARINO
- TRAINER: 6 → all-marino-1 … all-marino-6 (lv 7-10)
- INCONTRI: zona "vigne-marino" (lv 4-9)
- OGGETTI: 3

## LAB COTRAL #1 (DUNGEON, boss Admin Fulvia)
- TRAINER: 15 → all-lab1-1 … all-lab1-15 (lv 22-30)
- INCONTRI: zona "lab-cotral-1" (Magnemite, Voltorb, Zubat, lv 22-30)
- OGGETTI: 3 (Superpozione, Antidoto)
- Interno industriale (Factory_interior). Da dividere in più piani/stanze.

# ════════════════════════════════════════════════════════
# BLOCCO 4 — MONTE PORZIO, ROCCA, GROTTA VULCANO
# ════════════════════════════════════════════════════════

## VIA MARINO → MONTE PORZIO
- TRAINER: 5 → all-mmp-1 … all-mmp-5 (lv 12-17)
- OGGETTI: 4

## MONTE PORZIO CATONE — Palestra 4 (Elettro, cap 34)
Dimensione: 30×20
- EDIFICI: GYM, PC, Mart, Osservatorio (landmark → Zapdos, Jirachi), 2 case
- CAPOPALESTRA: Stella (Elettro) — Raichu 31, Electrode 32, Magneton 32, Manectric 33,
  Ampharos 34 + 6 gregari (lv 28-33)
- NPC reali (5): Ruggero (hint Zapdos), Aldo l'astrofilo, Studente, Vecchietto, Ragazza
- SPECIALE: Ruggero il meteorologo (temporale → Zapdos)
- USCITE: → Via Marino-Monte Porzio, → Via Monte Porzio-Rocca, → Boschi Tuscolo

## VIA MONTE PORZIO → ROCCA
- TRAINER: 10 → all-mpr-1…5 + Famiglia Vinci (Nonno/Nonna/Papà/Mamma/Figlio/Figlia) (lv 17-27)
- OGGETTI: 4 (Ultra Ball, Iperpozione)

## ROCCA DI PAPA — Palestra 5 (Roccia, cap 40)
Dimensione: 30×20 — NEVE
- EDIFICI: GYM, PC, Mart, 2 case, accesso Funivia, accesso Grotta del Vulcano
- CAPOPALESTRA: Rocco (Roccia) — Sandslash 36, Lairon 37, Golem 38, Rhydon 39,
  Aggron 40 + 7 gregari (lv 34-39)
- NPC reali (4): Bruno la guida, Anziano del Carpino, Signora, Ragazzino (hint vulcano)
- SPECIALE: Faustino (dona MN Volo + sblocca funivia, ≥6 medaglie)
- USCITE: → Via Monte Porzio-Rocca, → Via Rocca-Albano, → Grotta del Vulcano,
  → Sentiero Innevato (via funivia), → Monte Cavo

## GROTTA DEL VULCANO (DUNGEON GRANDE)
- TRAINER: 16 → all-grotta-1 … all-grotta-16 (lv 17-25)
- INCONTRI: zona "grotta-vulcano" (Zubat, Golbat, Geodude, Graveler, Diglett, Onix,
  Numel, lv 15-25)
- OGGETTI: 7 (Ultra Ball, Iperpozione, Revitalizzante)
- Pavimento rosso vulcanico. Da dividere in più stanze (è grande).

## SENTIERO INNEVATO (gate funivia, Articuno)
- TRAINER: 6 → all-neve-1 … all-neve-6 (lv 36-44)
- INCONTRI: zona "sentiero-innevato" (Snorunt, Swinub, Piloswine, Sneasel, Delibird,
  Seel, Smoochum, lv 36-44)
- SPECIALE: Articuno (lv 50)

## MONTE CAVO (pre-Lega)
- TRAINER: 7 → all-cavo-1 … all-cavo-7 (lv 40-46)
- INCONTRI: zona "monte-cavo" (lv 35-50)
- OGGETTI: 3

# ════════════════════════════════════════════════════════
# BLOCCO 5 — ALBANO, ARICCIA, GENZANO, LAGHI
# ════════════════════════════════════════════════════════

## VIA ROCCA → ALBANO
- TRAINER: 5 → all-rpa-1 … all-rpa-5 (lv 27-35)
- OGGETTI: 4 (Ultra Ball, Repellente)

## ALBANO LAZIALE — Palestra 6 (Lotta, cap 46)
Dimensione: 32×22
- EDIFICI: GYM, PC, Mart, 3 case, accesso Lab CoTrAL #2
- CAPOPALESTRA: Massimo (Lotta) — Hitmonchan 42, Hitmonlee 43, Breloom 44, Hariyama 44,
  Medicham 45, Machamp 46 + 8 gregari (lv 40-45)
- NPC reali (4): Settimio il legionario, Storico, Bambino, Tizio sospettoso (hint GdF)
- SPECIALE: Nonna Assunta (dona MN Surf, ≥5 medaglie) — verso Lago Albano
- USCITE: → Via Rocca-Albano, → Via Albano-Ariccia, → Lab CoTrAL #2, → Lago Albano

## LAB COTRAL #2 (DUNGEON, fine Team GdF — boss Tarcisio + Crasso)
- TRAINER: 17 → all-lab2-1 … all-lab2-17 (lv 40-50)
- INCONTRI: zona "lab-cotral-2" (Magneton, Electrode, Unown, Golbat, lv 40-50)
- OGGETTI: 3 (Iperpozione, Revitalizzante)

## LAGO ALBANO (Surf)
- INCONTRI: zona "lago-albano" (lv 15-25, richiede Surf)
- TRAINER GdF: gdf-grunt-4 (Albano→Lab)
- OGGETTI: 4

## LAGO DI NEMI (Surf, avanzato)
- INCONTRI: zona "lago-nemi" (lv 25-40)
- TRAINER GdF: gdf-grunt-1, gdf-grunt-2 (Nemi)
- NPC reali (3): Rosa la fragolara, Custode Museo, Pescatore (hint Suicune)
- SPECIALE: Suicune (cinematica), Braciere di Nemi (oggetto chiave), Museo Navi
- OGGETTI: 4 (incluso Braciere di Nemi)

## VIA ALBANO → ARICCIA
- TRAINER: 5 → all-aa-1 … all-aa-5 (lv 36-42)
- Ponte di Ariccia (landmark → Ho-Oh post-Lega)

## ARICCIA — Palestra 7 (Buio, cap 52)
Dimensione: 30×20
- EDIFICI: GYM, PC, Mart, Palazzo Chigi (landmark), 2 case
- CAPOPALESTRA: Ombretta (Buio) — Mightyena 48, Sharpedo 49, Shiftry 50, Crawdaunt 50,
  Absol 51, Houndoom 52 + 9 gregari (lv 46-51)
- NPC reali (5): Sora Nunzia, Peppe, Il vecchio del ponte, Musicista, Turista
- SPECIALE: Adriano il porchettaro (Piuma Iridescente dopo 4 CoTrAL → Ho-Oh)
- POST-LEGA: 4 trainer CoTrAL Ariccia (cotral-ariccia-1…4)
- USCITE: → Via Albano-Ariccia, → Campagna Ariccia-Genzano

## CAMPAGNA ARICCIA → GENZANO
- TRAINER: 8 → all-camp-1 … all-camp-8 (lv 30-44)
- OGGETTI: 5
- TRAINER GdF: gdf-grunt-5 (Avamposto Genzano)

## GENZANO — Palestra 8 (Folletto, cap 58)
Dimensione: 30×20 — INFIORATA (fiori)
- EDIFICI: GYM, PC, Mart, 2 case, accesso Via Vittoria
- CAPOPALESTRA: Flora (Folletto) — Wigglytuff 54, Mr.Mime 55, Granbull 55, Clefable 56,
  Azumarill 57, Gardevoir 58 + 10 gregari (lv 52-57)
- NPC reali (5): Romolo il panettiere, Iolanda, Bambina, Fioraio, Vecchietto (hint Via Vittoria)
- USCITE: → Campagna Ariccia-Genzano, → Via Vittoria (gate 8 medaglie)

# ════════════════════════════════════════════════════════
# BLOCCO 6 — VIA VITTORIA E LEGA
# ════════════════════════════════════════════════════════

## VIA VITTORIA (gate 8 medaglie, Moltres)
- TRAINER: 15 → all-vv-1 … all-vv-15 (lv 55-60, i più forti) — vedi censimento per squadre
- INCONTRI: zona "via-vittoria" (Golbat, Graveler, Machoke, Lairon, Hariyama, Medicham,
  Onix, lv 55-60)
- OGGETTI: 5 (Ultra Ball, Iperpozione, Revitalizzante)
- SPECIALE: Moltres (lv 60)
- Dungeon grande (grotta + altura): dividere in più mappe

## COLONNA — LEGA POKÉMON
Dimensione: 36×26
- EDIFICI: edificio Lega, PC, Mart, 3 case
- LEGA: 4 Superquattro (Captain, Pres, Dema, Marcuois) + Campione Remo
  (sistema a pool, vedi censimento) — 4-5 sale interne
- NPC reali (3): Anziano, Tizio (hint CoTrAL/Bunkerino), Ragazzo
- POST-LEGA: Bunkerino (5 trainer gauntlet → Direttore Lucio → Mewtwo)

# ════════════════════════════════════════════════════════
# ORDINE CONSIGLIATO DI LAVORO
# ════════════════════════════════════════════════════════
1. [in corso] Finisci Percorso 1 + crea Percorso 1b → test con i trainer veri all-tusc
2. Frascati (città + palestra interno) → prima palestra giocabile
3. Vigne Frascati + Via Frascati-Grottaferrata → primi percorsi pieni
4. Grottaferrata → seconda palestra
5. Avanti città per città seguendo i blocchi 3→6
6. I dungeon grandi (Boschi Tuscolo 18, Grotta Vulcano 16, Lab CoTrAL) li dividi
   in più mappe Tiled collegate da uscite
7. Laghi e zone Surf quando hai la MN Surf nel flusso
8. Via Vittoria + Lega per ultimi

REGOLA: ogni volta che finisci una mappa, esporta in .tmj e falla collegare a
Claude Code ai contenuti reali (gli id sono nel censimento). Testa prima di proseguire.
