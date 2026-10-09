# Squadre Capipalestra (stato attuale, 9 ott 2026)

Item 11 del mega-prompt: qui c'è la squadra ATTUALE di ognuno dei 8 Capipalestra,
così come si trova oggi in `dati/trainer.js`. Modificala come vuoi tu — non le ho
toccate. Per cambiarle basta che mi dici i nuovi ID/livelli/mosse (le mosse non
sono fissate a mano, vengono prese dal moveset reale della specie via PokéAPI in
base al livello).

Ogni Capopalestra ha `pokemonFianco: true`: l'ultimo della lista (l'asso) è
sempre il suo Pokémon più forte, mandato in campo per ultimo.

---

## 1. FRASCATI — Donnie (Erba) — cap 14
| # | Pokémon | Livello |
|---|---|---|
| 1 | Bellsprout (69) | 9 |
| 2 | Hoppip (187) | 10 |
| 3 | Oddish (43) | 11 |
| 4 | Shroomish (285) | 12 |
| 5 | Gloom (44) | 13 |
| 6 (asso) | Roselia (315) | 14 |

## 2. GROTTAFERRATA — Igino (Psico) — cap 21
| # | Pokémon | Livello |
|---|---|---|
| 1 | Abra (63) | 16 |
| 2 | Natu (177) | 17 |
| 3 | Spoink (325) | 18 |
| 4 | Kadabra (64) | 19 |
| 5 | Hypno (97) | 20 |
| 6 (asso) | Grumpig (326) | 21 |

## 3. MARINO — Matilde (Acqua) — cap 28
| # | Pokémon | Livello |
|---|---|---|
| 1 | Poliwhirl (61) | 24 |
| 2 | Pelipper (279) | 25 |
| 3 | Seaking (119) | 26 |
| 4 | Quagsire (195) | 26 |
| 5 | Azumarill (184) | 27 |
| 6 (asso) | Gyarados (130) | 28 |

## 4. MONTE PORZIO CATONE — Biretta (Elettro) — cap 34
| # | Pokémon | Livello |
|---|---|---|
| 1 | Electabuzz (125) | 30 |
| 2 | Raichu (26) | 31 |
| 3 | Electrode (101) | 32 |
| 4 | Magneton (82) | 32 |
| 5 | Manectric (310) | 33 |
| 6 (asso) | Ampharos (181) | 34 |

## 5. ROCCA DI PAPA — Baso (Lotta) — cap 40
| # | Pokémon | Livello |
|---|---|---|
| 1 | Hariyama (297) | 35 |
| 2 | Hitmonchan (107) | 36 |
| 3 | Hitmonlee (106) | 37 |
| 4 | Breloom (286) | 38 |
| 5 | Medicham (308) | 39 |
| 6 (asso) | Machamp (68) | 40 |

## 6. ALBANO LAZIALE — Giorgia (Roccia) — cap 46
| # | Pokémon | Livello |
|---|---|---|
| 1 | Nosepass (299) | 41 |
| 2 | Sandslash (28) | 42 |
| 3 | Lairon (305) | 43 |
| 4 | Golem (76) | 44 |
| 5 | Rhydon (112) | 45 |
| 6 (asso) | Aggron (306) | 46 |

## 7. ARICCIA — Isa (Buio) — cap 52
| # | Pokémon | Livello |
|---|---|---|
| 1 | Mightyena (262) | 48 |
| 2 | Sharpedo (319) | 49 |
| 3 | Shiftry (275) | 50 |
| 4 | Crawdaunt (342) | 50 |
| 5 | Absol (359) | 51 |
| 6 (asso) | Houndoom (229) | 52 |

## 8. GENZANO — Camilla (Fuoco) — cap 58
| # | Pokémon | Livello |
|---|---|---|
| 1 | Ninetales (38) | 54 |
| 2 | Magmar (126) | 55 |
| 3 | Camerupt (323) | 55 |
| 4 | Torkoal (324) | 56 |
| 5 | Flareon (136) | 57 |
| 6 (asso) | Arcanine (59) | 58 |

---

## Come mi dai le modifiche
Per ciascun Capopalestra che vuoi cambiare, scrivimi semplicemente:
```
Donnie: Bellsprout 9, Hoppip 10, Oddish 11, Shroomish 12, Gloom 13, Roselia 14 (asso)
```
oppure solo i cambi puntuali ("togli Hoppip, metti Skiploom 12 al suo posto").
Applico io le modifiche a `dati/trainer.js` una volta che mi dai la lista.
