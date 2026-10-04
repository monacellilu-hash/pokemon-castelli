# Pietre evolutive e oggetti per evoluzione (Gen 1-3)

Censimento completo di tutto ciò che serve per far evolvere i Pokémon tramite
oggetto, scritto il 5 ottobre 2026 su richiesta di Luca. Fonte di verità:
`dati/evoluzioni.js` (33 evoluzioni per pietra/scambio, tutte già coperte).

## 1. Pietre evolutive (categoria `pietra` in `js/data.js`)

Si usano da Zaino → Oggetti, selezionando il Pokémon. Se la pietra non ha
effetto su quel Pokémon non viene consumata.

| Pietra | Prezzo | Fa evolvere |
|---|---|---|
| Pietra Fuoco | 8000 | Vulpix→Ninetales, Growlithe→Arcanine, Eevee→Flareon |
| Pietra Acqua | 8000 | Poliwhirl→Poliwrath, Shellder→Cloyster, Staryu→Starmie, Eevee→Vaporeon, Lombre→Ludicolo |
| Pietra Tuono | 8000 | Pikachu→Raichu, Eevee→Jolteon, Nosepass→Probopass* |
| Pietra Foglia | 8000 | Gloom→Vileplume, Weepinbell→Victreebel, Exeggcute→Exeggutor, Nuzleaf→Shiftry |
| Pietra Luna | 9000 | Nidorina→Nidoqueen, Nidorino→Nidoking, Clefairy→Clefable, Jigglypuff→Wigglytuff, Skitty→Delcatty |
| Pietra Sole | 9500 | Gloom→Bellossom, Sunkern→Sunflora |

*Nosepass→Probopass non è attiva in `evoluzioni.js` (fuori lista attuale,
ID 476 > 386 comunque — esclusa dal progetto per il limite Gen 1-3).

Venduto in: Frascati (base), Marino (completa 7 pietre + Patroclo), Genzano,
Castel Gandolfo, Grande Magazzino 4°F (anche gli oggetti scambio, vedi sotto).

## 2. Evoluzioni da SCAMBIO (categoria `scambio` + oggetti `held`)

Nei giochi originali serve scambiare il Pokémon con un altro giocatore.
Qui non c'è il multiplayer, quindi ci sono **due scorciatoie equivalenti**:

**A) Mercante degli Scambi** — NPC fisso nei Centri Pokémon da Marino in poi
(`azione: 'interagisciMercanteScambi'`). Parla con lui, lui controlla la
squadra e propone l'evoluzione.

**B) Pietra Scambio** (nuovo oggetto, categoria `scambio`, 10000¥) — si usa
da Zaino → Oggetti come una pietra normale. Stesso risultato, ma portatile:
non serve cercare il Mercante.

Entrambe le strade controllano la STESSA regola:

| Pokémon | Evolve in | Oggetto da TENERE prima (held) |
|---|---|---|
| Kadabra (64) | Alakazam (65) | nessuno — basta lo scambio |
| Machoke (67) | Machamp (68) | nessuno |
| Graveler (75) | Golem (76) | nessuno |
| Haunter (93) | Gengar (94) | nessuno |
| Onix (95) | Steelix (208) | Rivestimetallo |
| Scyther (123) | Scizor (212) | Rivestimetallo |
| Seadra (117) | Kingdra (230) | Squamadragone |
| Poliwhirl (61) | Politoed (186) | Patroclo |
| Slowpoke (79) | Slowking (199) | Patroclo |
| Porygon (137) | Porygon2 (233) | Upgrade |
| Clamperl (366) | Huntail (367) | Dente Oscuro |
| Clamperl (366) | Gorebyss (368) | Conchigliamutante |

**Regola dell'oggetto tenuto** (richiesta esplicita di Luca, 5 ott 2026): per
le 8 evoluzioni che richiedono un oggetto, il Pokémon deve PRIMA tenerlo
(Zaino → Oggetti → scegli il Pokémon, l'oggetto è categoria `held`), POI si
può usare la Pietra Scambio o parlare col Mercante. Non c'è scorciatoia che
salti questo passaggio — se il Pokémon non tiene già l'oggetto giusto, sia
la Pietra Scambio sia il Mercante rifiutano con un messaggio esplicito.

Gli oggetti `held` richiesti (Rivestimetallo, Patroclo, Squamadragone, Dente
Oscuro, Conchigliamutante, Upgrade) sono in vendita al Grande Magazzino 4°F
e in alcuni market dedicati (vedi `js/data.js`, `MERCATI`).

## 3. Copertura

Ogni evoluzione per pietra o scambio presente in `dati/evoluzioni.js` (ID
Pokémon 1-386, limite di progetto) ha il suo oggetto corrispondente già
definito in `js/data.js` — **censimento 5 ottobre 2026: nessuna mancanza.**
Se in futuro si aggiungono nuove evoluzioni (es. nuove specie sbloccate),
verificare qui prima di introdurre un oggetto nuovo per evitare doppioni.
