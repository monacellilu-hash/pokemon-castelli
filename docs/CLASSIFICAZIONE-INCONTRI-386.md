# Classificazione 386 — chi si trova in natura e chi no

> Generato il 5 ottobre 2026 leggendo i dati VERI di `dati/evoluzioni.js` (non a memoria/a mano),
> più i nomi ufficiali da PokéAPI. Prima di distribuire le specie sulle mappe, questo file va
> confermato/corretto da Luca.

## La regola che ho applicato (dimmi se è quello che intendevi)

1. **Starter (27 specie: 9 linee × 3 stadi)**: MAI in natura, si ottengono solo dal Prof. Castagno +
   evolvendo. Escluse del tutto da questa classificazione.
2. **Leggendari (21 specie)**: gestiti a parte secondo la tabella di CLAUDE.md, non qui.
3. **Per tutti gli altri (338 specie)**: ho calcolato lo STADIO evolutivo vero (non a occhio) seguendo
   le catene in `dati/evoluzioni.js`:
   - **BASE** (non evolve da nessuno — 173 specie): **trovabile in natura**.
   - **STADIO 2** (evolve da una base, ed eventualmente evolve ancora — 129 specie): **trovabile in
     natura** (un po' meno comune, ma non "costosa" da ottenere).
   - **STADIO 3** (l'ultima evoluzione di una catena a 3 stadi — 36 specie): **MAI in natura**,
     ottenibile SOLO evolvendo lo stadio 2 — livello, pietra, felicità, o "Pietra Scambio" per le
     evoluzioni da scambio (coerente con la scelta già fatta nel gioco, vedi Market).

**In parole povere**: hai detto "le terze evoluzioni in particolare" devono costare fatica — ho
interpretato che TUTTE le 36 terze evoluzioni Gen 1-3 (tolti starter/leggendari) vanno tolte dalle
tabelle incontri, ottenibili solo evolvendo. Stadio 1 e 2 restano in natura. Se invece vuoi che anche
UNA PARTE degli stadi 2 sia "costosa" (non tutti), dimmelo e rifaccio la lista con un criterio diverso
(es. casuale, o per tipo, o per famiglia).

**Conteggio finale**: 173 trovabili (base) + 129 trovabili (stadio 2) = **302 specie disponibili per
le tabelle incontri**. 36 solo per evoluzione. 27 starter + 21 leggendari gestiti altrove.

---

| ID | Nome | Categoria | Trovabile in natura | Come si ottiene / note | Rarità (A:comune 40-50% /B:rara 15-20%/C:molto rara 7-10%/ D:ultra rara 3%/ E:semi impossibile 0.02% I:Impossibile 0.001% )
|---|---|---|---|---|
| 1 | bulbasaur | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 2 | ivysaur | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 3 | venusaur | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 4 | charmander | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 5 | charmeleon | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 6 | charizard | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 7 | squirtle | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 8 | wartortle | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 9 | blastoise | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 10 | caterpie | BASE | SI |  | A
| 11 | metapod | STADIO 2 | SI |  |C
| 12 | butterfree | STADIO 3 | SI | evoluzione di metapod al livello 10 |D
| 13 | weedle | BASE | SI |  |A
| 14 | kakuna | STADIO 2 | SI |  |C
| 15 | beedrill | STADIO 3 | SI | evoluzione di kakuna al livello 10 |D
| 16 | pidgey | BASE | SI |  |A
| 17 | pidgeotto | STADIO 2 | SI |  |D
| 18 | pidgeot | STADIO 3 | NO | evoluzione di pidgeotto al livello 36 |
| 19 | rattata | BASE | SI |  |A
| 20 | raticate | STADIO 2 | SI |  |E
| 21 | spearow | BASE | SI |  |A
| 22 | fearow | STADIO 2 | SI |  |D
| 23 | ekans | BASE | SI |  |A
| 24 | arbok | STADIO 2 | SI |  |E
| 25 | pikachu | STADIO 2 | SI |  |C
| 26 | raichu | STADIO 3 | NO | evoluzione di pikachu con pietra_tuono |
| 27 | sandshrew | BASE | SI |  |B
| 28 | sandslash | STADIO 2 | SI |  |D
| 29 | nidoran-f | BASE | SI |  |B
| 30 | nidorina | STADIO 2 | SI |  |D
| 31 | nidoqueen | STADIO 3 | NO | evoluzione di nidorina con pietra_luna |
| 32 | nidoran-m | BASE | SI |  |B
| 33 | nidorino | STADIO 2 | SI |  |D
| 34 | nidoking | STADIO 3 | NO | evoluzione di nidorino con pietra_luna |
| 35 | clefairy | STADIO 2 | SI |  |C
| 36 | clefable | STADIO 3 | NO | evoluzione di clefairy con pietra_luna |
| 37 | vulpix | BASE | SI |  |C
| 38 | ninetales | STADIO 2 | NO |  |E
| 39 | jigglypuff | STADIO 2 | SI |  |C
| 40 | wigglytuff | STADIO 3 | NO | evoluzione di jigglypuff con pietra_luna |
| 41 | zubat | BASE | SI |  |A
| 42 | golbat | STADIO 2 | SI |  |D
| 43 | oddish | BASE | SI |  |A
| 44 | gloom | STADIO 2 | SI |  |D
| 45 | vileplume | STADIO 3 | NO | evoluzione di gloom con pietra_foglia |
| 46 | paras | BASE | SI |  |A
| 47 | parasect | STADIO 2 | SI |  |D
| 48 | venonat | BASE | SI |  |A
| 49 | venomoth | STADIO 2 | SI |  |D
| 50 | diglett | BASE | SI |  |A
| 51 | dugtrio | STADIO 2 | SI |  |E
| 52 | meowth | BASE | SI |  |A
| 53 | persian | STADIO 2 | SI |  |D
| 54 | psyduck | BASE | SI |  |A
| 55 | golduck | STADIO 2 | SI |  |E
| 56 | mankey | BASE | SI |  |A
| 57 | primeape | STADIO 2 | SI |  |E
| 58 | growlithe | BASE | SI |  |C
| 59 | arcanine | STADIO 2 | NO |  |
| 60 | poliwag | BASE | SI |  |A
| 61 | poliwhirl | STADIO 2 | SI |  |D
| 62 | poliwrath | STADIO 3 | NO | evoluzione di poliwhirl con pietra_acqua |
| 63 | abra | BASE | SI |  |C
| 64 | kadabra | STADIO 2 | SI |  |E
| 65 | alakazam | STADIO 3 | NO | evoluzione di kadabra con Pietra Scambio |
| 66 | machop | BASE | SI |  |B
| 67 | machoke | STADIO 2 | SI |  |D
| 68 | machamp | STADIO 3 | NO | evoluzione di machoke con Pietra Scambio |
| 69 | bellsprout | BASE | SI |  |A
| 70 | weepinbell | STADIO 2 | SI |  |D
| 71 | victreebel | STADIO 3 | NO | evoluzione di weepinbell con pietra_foglia |
| 72 | tentacool | BASE | SI |  |A
| 73 | tentacruel | STADIO 2 | SI |  |E
| 74 | geodude | BASE | SI |  |A
| 75 | graveler | STADIO 2 | SI |  |D
| 76 | golem | STADIO 3 | NO | evoluzione di graveler con Pietra Scambio |
| 77 | ponyta | BASE | SI |  |A
| 78 | rapidash | STADIO 2 | NO |  |
| 79 | slowpoke | BASE | SI |  |A
| 80 | slowbro | STADIO 2 | SI |  |D
| 81 | magnemite | BASE | SI |  |A
| 82 | magneton | STADIO 2 | SI |  |C
| 83 | farfetchd | BASE | SI |  |D
| 84 | doduo | BASE | SI |  |A
| 85 | dodrio | STADIO 2 | NO |  |
| 86 | seel | BASE | SI |  | A
| 87 | dewgong | STADIO 2 | SI |  |D
| 88 | grimer | BASE | SI |  |A
| 89 | muk | STADIO 2 | SI |  |E
| 90 | shellder | BASE | SI |  |A
| 91 | cloyster | STADIO 2 | SI |  |E
| 92 | gastly | BASE | SI |  |C
| 93 | haunter | STADIO 2 | SI |  |D
| 94 | gengar | STADIO 3 | NO | evoluzione di haunter con Pietra Scambio |
| 95 | onix | BASE | SI |  |B
| 96 | drowzee | BASE | SI |  |A
| 97 | hypno | STADIO 2 | SI |  |D
| 98 | krabby | BASE | SI |  |A
| 99 | kingler | STADIO 2 | SI |  |E
| 100 | voltorb | BASE | SI |  |C
| 101 | electrode | STADIO 2 | SI |  |E
| 102 | exeggcute | BASE | SI |  |A
| 103 | exeggutor | STADIO 2 | NO |  |
| 104 | cubone | BASE | SI |  |B
| 105 | marowak | STADIO 2 | SI |  |E
| 106 | hitmonlee | STADIO 2 | SI |  |E
| 107 | hitmonchan | STADIO 2 | SI |  |E
| 108 | lickitung | BASE | SI |  |D
| 109 | koffing | BASE | SI |  |C
| 110 | weezing | STADIO 2 | SI |  |E
| 111 | rhyhorn | BASE | SI |  |C
| 112 | rhydon | STADIO 2 | SI |  |E
| 113 | chansey | BASE | SI |  |E
| 114 | tangela | BASE | SI |  |D
| 115 | kangaskhan | BASE | SI |  |E
| 116 | horsea | BASE | SI |  |C
| 117 | seadra | STADIO 2 | SI |  |D
| 118 | goldeen | BASE | SI |  |A
| 119 | seaking | STADIO 2 | SI |  |D
| 120 | staryu | BASE | SI |  |A
| 121 | starmie | STADIO 2 | SI |  |E
| 122 | mr-mime | BASE | SI |  |E
| 123 | scyther | BASE | SI |  |E
| 124 | jynx | STADIO 2 | SI |  |E
| 125 | electabuzz | STADIO 2 | SI |  |E
| 126 | magmar | STADIO 2 | SI |  |E
| 127 | pinsir | BASE | SI |  |E
| 128 | tauros | BASE | SI |  |E
| 129 | magikarp | BASE | SI |  |A
| 130 | gyarados | STADIO 2 | SI |  |E
| 131 | lapras | BASE | SI |  |E
| 132 | ditto | BASE | NO | ECCEZIONE (6 ott 2026, richiesta di Luca): mai in incontro casuale, solo una Poké Ball fissa in albano_condominio_a_roofroom.tmj (ex celadon_condominio_roofroom, clonato ad Albano) | — |
| 133 | eevee | BASE | SI |  |E
| 134 | vaporeon | STADIO 2 | NO |  |
| 135 | jolteon | STADIO 2 | NO |  |
| 136 | flareon | STADIO 2 | NO |  |
| 137 | porygon | BASE | SI |  |E
| 138 | omanyte | BASE | NO|  |
| 139 | omastar | STADIO 2 | NO |  |
| 140 | kabuto | BASE | NO |  |
| 141 | kabutops | STADIO 2 | NO |  |
| 142 | aerodactyl | BASE | NO |  |
| 143 | snorlax | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 144 | articuno | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 145 | zapdos | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 146 | moltres | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 147 | dratini | BASE | SI |  |E
| 148 | dragonair | STADIO 2 | SI |  |E
| 149 | dragonite | STADIO 3 | NO | evoluzione di dragonair al livello 55 |
| 150 | mewtwo | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 151 | mew | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 152 | chikorita | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 153 | bayleef | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 154 | meganium | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 155 | cyndaquil | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 156 | quilava | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 157 | typhlosion | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 158 | totodile | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 159 | croconaw | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 160 | feraligatr | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 161 | sentret | BASE | SI |  |A
| 162 | furret | STADIO 2 | SI |  |A
| 163 | hoothoot | BASE | SI |  |A
| 164 | noctowl | STADIO 2 | SI |  |C
| 165 | ledyba | BASE | SI |  |A
| 166 | ledian | STADIO 2 | SI |  |C
| 167 | spinarak | BASE | SI |  |A
| 168 | ariados | STADIO 2 | SI |  |C
| 169 | crobat | STADIO 3 | NO | evoluzione di golbat per felicità (220+) |
| 170 | chinchou | BASE | SI |  |A
| 171 | lanturn | STADIO 2 | SI |  |D
| 172 | pichu | BASE | SI |  |A
| 173 | cleffa | BASE | SI |  |C
| 174 | igglybuff | BASE | SI |  |A
| 175 | togepi | BASE | SI |  |D
| 176 | togetic | STADIO 2 | SI |  |I
| 177 | natu | BASE | SI |  |A
| 178 | xatu | STADIO 2 | SI |  |D
| 179 | mareep | BASE | SI |  |C
| 180 | flaaffy | STADIO 2 | SI |  |E
| 181 | ampharos | STADIO 3 | NO | evoluzione di flaaffy al livello 30 |
| 182 | bellossom | STADIO 3 | NO | evoluzione di gloom con pietra_sole |
| 183 | marill | STADIO 2 | SI |  |A
| 184 | azumarill | STADIO 3 | NO | evoluzione di marill al livello 18 |
| 185 | sudowoodo | BASE | SI |  |E
| 186 | politoed | STADIO 3 | NO | evoluzione di poliwhirl con Pietra Scambio |
| 187 | hoppip | BASE | SI |  |A
| 188 | skiploom | STADIO 2 | SI |  |A
| 189 | jumpluff | STADIO 3 | NO | evoluzione di skiploom al livello 27 |
| 190 | aipom | BASE | SI |  |A
| 191 | sunkern | BASE | SI |  |A
| 192 | sunflora | STADIO 2 | SI |  |D
| 193 | yanma | BASE | SI |  |A
| 194 | wooper | BASE | SI |  |A
| 195 | quagsire | STADIO 2 | SI |  |D
| 196 | espeon | STADIO 2 | NO |  |
| 197 | umbreon | STADIO 2 | NO |  |
| 198 | murkrow | BASE | SI |  |A
| 199 | slowking | STADIO 2 | NO |  |
| 200 | misdreavus | BASE | SI |  |C
| 201 | unown | BASE | SI |  |D
| 202 | wobbuffet | BASE | SI |  |D
| 203 | girafarig | BASE | SI |  |A
| 204 | pineco | BASE | SI |  |A
| 205 | forretress | STADIO 2 | SI |  |E
| 206 | dunsparce | BASE | SI |  |D
| 207 | gligar | BASE | SI |  |D
| 208 | steelix | STADIO 2 | SI |  |I
| 209 | snubbull | BASE | SI |  |C
| 210 | granbull | STADIO 2 | SI |  |D
| 211 | qwilfish | BASE | SI |  |D
| 212 | scizor | STADIO 2 | SI |  |I
| 213 | shuckle | BASE | SI |  |C
| 214 | heracross | BASE | SI |  |E
| 215 | sneasel | BASE | SI |  |C
| 216 | teddiursa | BASE | SI |  |A
| 217 | ursaring | STADIO 2 | SI |  |I
| 218 | slugma | BASE | SI |  |A
| 219 | magcargo | STADIO 2 | SI |  |D
| 220 | swinub | BASE | SI |  |A
| 221 | piloswine | STADIO 2 | SI |  |C
| 222 | corsola | BASE | SI |  |A
| 223 | remoraid | BASE | SI |  |A
| 224 | octillery | STADIO 2 | SI |  |D
| 225 | delibird | BASE | SI |  |A
| 226 | mantine | BASE | SI |  |A
| 227 | skarmory | BASE | SI |  |E
| 228 | houndour | BASE | SI |  |B
| 229 | houndoom | STADIO 2 | SI |  |E
| 230 | kingdra | STADIO 3 | NO | evoluzione di seadra con Pietra Scambio |
| 231 | phanpy | BASE | SI |  |C
| 232 | donphan | STADIO 2 | SI |  |E
| 233 | porygon2 | STADIO 2 | SI |  |I
| 234 | stantler | BASE | SI |  |B
| 235 | smeargle | BASE | SI |  |A
| 236 | tyrogue | BASE | SI |  |B
| 237 | hitmontop | STADIO 2 | SI |  |D
| 238 | smoochum | BASE | SI |  |A
| 239 | elekid | BASE | SI |  |A
| 240 | magby | BASE | SI |  |A
| 241 | miltank | BASE | SI |  |C
| 242 | blissey | STADIO 2 | NO |  |
| 243 | raikou | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 244 | entei | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 245 | suicune | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 246 | larvitar | BASE | SI |  |E
| 247 | pupitar | STADIO 2 | SI |  |I
| 248 | tyranitar | STADIO 3 | NO | evoluzione di pupitar al livello 55 |
| 249 | lugia | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 250 | ho-oh | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 251 | celebi | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 252 | treecko | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 253 | grovyle | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 254 | sceptile | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 255 | torchic | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 256 | combusken | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 257 | blaziken | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 258 | mudkip | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 259 | marshtomp | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 260 | swampert | STARTER | NO | linea starter, si ottiene solo dal Prof. Castagno + evoluzione |
| 261 | poochyena | BASE | SI |  |A
| 262 | mightyena | STADIO 2 | SI |  |C
| 263 | zigzagoon | BASE | SI |  |A
| 264 | linoone | STADIO 2 | SI |  |B
| 265 | wurmple | BASE | SI |  |A
| 266 | silcoon | STADIO 2 | SI |  |B
| 267 | beautifly | STADIO 3 | NO | evoluzione di silcoon al livello 10 |
| 268 | cascoon | STADIO 2 | SI |  |B
| 269 | dustox | STADIO 3 | NO | evoluzione di cascoon al livello 10 |
| 270 | lotad | BASE | SI |  |A
| 271 | lombre | STADIO 2 | SI |  |D
| 272 | ludicolo | STADIO 3 | NO | evoluzione di lombre con pietra_acqua |
| 273 | seedot | BASE | SI |  |A
| 274 | nuzleaf | STADIO 2 | SI |  |C
| 275 | shiftry | STADIO 3 | NO | evoluzione di nuzleaf con pietra_foglia |
| 276 | taillow | BASE | SI |  |A
| 277 | swellow | STADIO 2 | SI |  |D
| 278 | wingull | BASE | SI |  |A
| 279 | pelipper | STADIO 2 | SI |  |E
| 280 | ralts | BASE | SI |  |E
| 281 | kirlia | STADIO 2 | NO |  |
| 282 | gardevoir | STADIO 3 | NO | evoluzione di kirlia al livello 30 |
| 283 | surskit | BASE | SI |  |A
| 284 | masquerain | STADIO 2 | SI |  |B
| 285 | shroomish | BASE | SI |  |C
| 286 | breloom | STADIO 2 | SI |  |E
| 287 | slakoth | BASE | SI |  |A
| 288 | vigoroth | STADIO 2 | SI |  |D
| 289 | slaking | STADIO 3 | NO | evoluzione di vigoroth al livello 36 |
| 290 | nincada | BASE | SI |  |A
| 291 | ninjask | STADIO 2 | SI |  |E
| 292 | shedinja | STADIO 2 | SI |  |A
| 293 | whismur | BASE | SI |  |A
| 294 | loudred | STADIO 2 | SI |  |D
| 295 | exploud | STADIO 3 | NO | evoluzione di loudred al livello 40 |
| 296 | makuhita | BASE | SI |  |B
| 297 | hariyama | STADIO 2 | SI |  |E
| 298 | azurill | BASE | SI |  |A
| 299 | nosepass | BASE | SI |  |D
| 300 | skitty | BASE | SI |  |B
| 301 | delcatty | STADIO 2 | SI |  |B
| 302 | sableye | BASE | SI |  |D
| 303 | mawile | BASE | SI |  |E
| 304 | aron | BASE | SI |  |B
| 305 | lairon | STADIO 2 | SI |  |I
| 306 | aggron | STADIO 3 | NO | evoluzione di lairon al livello 42 |
| 307 | meditite | BASE | SI |  |A
| 308 | medicham | STADIO 2 | SI |  |C
| 309 | electrike | BASE | SI |  |C
| 310 | manectric | STADIO 2 | SI |  |I
| 311 | plusle | BASE | SI |  |A
| 312 | minun | BASE | SI |  |A
| 313 | volbeat | BASE | SI |  |A
| 314 | illumise | BASE | SI |  |A
| 315 | roselia | BASE | SI |  |A
| 316 | gulpin | BASE | SI |  |A
| 317 | swalot | STADIO 2 | SI |  |A
| 318 | carvanha | BASE | SI |  |A
| 319 | sharpedo | STADIO 2 | SI |  |E
| 320 | wailmer | BASE | SI |  |A
| 321 | wailord | STADIO 2 | SI |  |I
| 322 | numel | BASE | SI |  |A
| 323 | camerupt | STADIO 2 | SI |  |D
| 324 | torkoal | BASE | SI |  |A
| 325 | spoink | BASE | SI |  |B
| 326 | grumpig | STADIO 2 | SI |  |D
| 327 | spinda | BASE | SI |  |A
| 328 | trapinch | BASE | SI |  |D
| 329 | vibrava | STADIO 2 | SI |  |I
| 330 | flygon | STADIO 3 | NO | evoluzione di vibrava al livello 45 |
| 331 | cacnea | BASE | SI |  |A
| 332 | cacturne | STADIO 2 | SI |  |D
| 333 | swablu | BASE | SI |  |C
| 334 | altaria | STADIO 2 | SI |  |I
| 335 | zangoose | BASE | SI |  |A
| 336 | seviper | BASE | SI |  |A
| 337 | lunatone | BASE | SI |  |D
| 338 | solrock | BASE | SI |  |D
| 339 | barboach | BASE | SI |  |A
| 340 | whiscash | STADIO 2 | SI |  |E
| 341 | corphish | BASE | SI |  |A
| 342 | crawdaunt | STADIO 2 | SI |  |D
| 343 | baltoy | BASE | SI |  |A
| 344 | claydol | STADIO 2 | SI |  |E
| 345 | lileep | BASE | SI |  |A
| 346 | cradily | STADIO 2 | SI |  |E
| 347 | anorith | BASE | NO |  |
| 348 | armaldo | STADIO 2 | NO |  |
| 349 | feebas | BASE | SI |  |E
| 350 | milotic | STADIO 2 | NO |  |
| 351 | castform | BASE | SI |  |E
| 352 | kecleon | BASE | SI |  |C
| 353 | shuppet | BASE | SI |  |A
| 354 | banette | STADIO 2 | SI |  |C
| 355 | duskull | BASE | SI |  |A
| 356 | dusclops | STADIO 2 | SI |  |E
| 357 | tropius | BASE | SI |  |A
| 358 | chimecho | BASE | SI |  |A
| 359 | absol | BASE | SI |  |A
| 360 | wynaut | BASE | SI |  |A
| 361 | snorunt | BASE | SI |  |A
| 362 | glalie | STADIO 2 | SI |  |E
| 363 | spheal | BASE | SI |  |A
| 364 | sealeo | STADIO 2 | SI |  |E
| 365 | walrein | STADIO 3 | NO | evoluzione di sealeo al livello 44 |
| 366 | clamperl | BASE | SI |  |A
| 367 | huntail | STADIO 2 | SI |  |D
| 368 | gorebyss | STADIO 2 | SI |  |C
| 369 | relicanth | BASE | SI |  |C
| 370 | luvdisc | BASE | SI |  |C
| 371 | bagon | BASE | SI |  |E
| 372 | shelgon | STADIO 2 | SI |  |I
| 373 | salamence | STADIO 3 | NO | evoluzione di shelgon al livello 50 |
| 374 | beldum | BASE | SI |  |I
| 375 | metang | STADIO 2 | NO |  |
| 376 | metagross | STADIO 3 | NO | evoluzione di metang al livello 45 |
| 377 | regirock | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 378 | regice | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 379 | registeel | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 380 | latias | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 381 | latios | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 382 | kyogre | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 383 | groudon | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 384 | rayquaza | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 385 | jirachi | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
| 386 | deoxys-normal | LEGGENDARIO | — | gestito a parte (vedi tabella leggendari CLAUDE.md) |
