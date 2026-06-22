# PIETRE EVOLUTIVE E OGGETTI SPECIALI — Distribuzione nei Market

> Da integrare in `data.js` → `NEGOZI` per ogni Comune

## Disponibilità nei negozi

| Oggetto | Prezzo | Dove acquistare | Pokémon interessati |
|---|---|---|---|
|Pietra Luna|₽2100|Grottaferrata (Market) / Monte Porzio Catone (Market)|Nidorina→Nidoqueen, Nidorino→Nidoking, Clefairy→Clefable, Jigglypuff→Wigglytuff, Skitty→Delcatty|
|Pietra Fuoco|₽2100|Marino (Market) / Rocca di Papa (Market)|Vulpix→Ninetales, Growlithe→Arcanine, Eevee→Flareon|
|Pietra Acqua|₽2100|Albano Laziale (Market) / Lago di Nemi (oggetto a terra post-Surf)|Poliwhirl→Poliwrath, Shellder→Cloyster, Staryu→Starmie, Eevee→Vaporeon, Lombre→Ludicolo|
|Pietra Tuono|₽2100|Monte Porzio Catone (Market) / Grotta del Vulcano (oggetto a terra)|Pikachu→Raichu, Eevee→Jolteon|
|Pietra Foglia|₽2100|Genzano (Market) / Boschi del Tuscolo (oggetto nascosto)|Gloom→Vileplume, Weepinbell→Victreebel, Exeggcute→Exeggutor, Nuzleaf→Shiftry|
|Pietra Sole|₽2100|Ariccia (Market) / Monte Cavo (oggetto a terra)|Gloom→Bellossom, Sunkern→Sunflora|
|Rivestimetallo|₽3000|Colonna (Market post-Lega) / Grotta del Vulcano (oggetto a terra)|Onix→Steelix (scambio), Scyther→Scizor (scambio)|
|Patroclo|₽3000|Marino (Market) / Albano (Market)|Poliwhirl→Politoed (scambio), Slowpoke→Slowking (scambio)|
|Squamadragone|₽3000|Colonna (Market post-Lega) / Lago di Nemi (pescatore dopo Surf)|Seadra→Kingdra (scambio)|
|Upgrade|₽3500|Bunkerino di Colonna (oggetto post-CoTrAL)|Porygon→Porygon2 (scambio)|
|Dente Oscuro|₽3000|Ariccia (Market) / Campagna Ariccia-Genzano (oggetto a terra)|Clamperl→Huntail (scambio)|
|Conchigliamutante|₽3500|Genzano (Market post-Palestra 8)|Clamperl→Gorebyss (scambio)|

---

## Oggetti di evoluzione per zona — da aggiungere come oggetti a terra nei TMJ

| Oggetto | Mappa TMJ | Posizione suggerita |
|---|---|---|
|Pietra Foglia|tuscolo_rovine|Nascosta nell'erba alta, angolo NE|
|Pietra Tuono|tuscolo_profondo|Oggetto nella sala delle iscrizioni|
|Rivestimetallo|grotta_vulcano_interno|Fondo grotta, dietro Groudon|
|Squamadragone|lago_nemi|Pescatore NPC dopo Surf|
|Dente Oscuro|campagna_ariccia|Erba alta, zona est|
|Upgrade|bunkerino_colonna|Dopo sconfitta Direttore Lucio|
|Pietra Acqua|lago_albano|Oggetto a terra vicino riva|
|Pietra Sole|monte_cavo|Vetta, vicino osservatorio|

---

## Implementazione NPC Mercante Scambi

Aggiungi un NPC `type:npc`, `id:mercante_scambi_X` in ogni PokéCenter da Marino in poi.
Dialogo: *'Vuoi scambiare un Pokémon? Ti offro una buona squadra!'*
Claude Code implementa: se il Pokémon è scambiabile + ha oggetto richiesto → evolve.
