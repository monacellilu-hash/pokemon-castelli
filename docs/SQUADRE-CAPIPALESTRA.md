# Squadre Capipalestra (stato attuale, 10 ott 2026)

Item 11 del mega-prompt: qui c'è la squadra ATTUALE di ognuno dei 8 Capipalestra,
così come si trova oggi in `dati/trainer.js`. Modificala come vuoi tu — non le ho
toccate. Per cambiarle basta che mi dici i nuovi ID/livelli/mosse (le mosse non
sono fissate a mano, vengono prese dal moveset reale della specie via PokéAPI in
base al livello).

**Aggiornamento 10 ott 2026**: applicate le modifiche che hai scritto qui sotto
(ID e livelli sincronizzati in `dati/trainer.js`, il file VERO usato in battaglia
— `js/data.js` ha una copia di questi dati ma è codice morto del vecchio motore
pre-Tiled, non viene mai letto in combattimento). 3 cose da sapere:
- **ID mancanti riempiti**: Tangela=114, Lombre=271, Ivysaur=2, Grovyle=253,
  Espeon=196, Vaporeon=134, Jolteon=135, Blaziken=257, Tyranitar=248,
  Umbreon=197, Typhlosion=157, Charizard=6.
- **3 ID corretti perché non corrispondevano più al nome scritto** (probabilmente
  rimasti dal Pokémon precedente copiato/sostituito): Clefable era scritto con
  l'ID di Abra (63) → corretto a 36. Grumpig era scritto con l'ID di Spoink (325)
  → corretto a 326. Steelix era scritto con l'ID di Lairon (305) → corretto a 208.
- **Genzano, cap alzato a 63**: aggiornato anche `js/data.js` (il cap VERO,
  quello letto da `vinciPalestra()` in `js/app.js`). ⚠️ Attenzione: dopo Genzano
  il cap della Via Vittoria è **60**, fisso nel codice (`js/app.js` riga 1626) —
  con Camilla a 63 il cap scenderebbe DOPO l'ultima palestra, il che non ha
  senso. Non l'ho tocccato: dimmi tu a quanto va messo (60 era pensato per
  Camilla a 58).

Ogni Capopalestra ha `pokemonFianco: true`: l'ultimo della lista (l'asso) è
sempre il suo Pokémon più forte, mandato in campo per ultimo.

---

## 1. FRASCATI — Donnie (Erba) — cap 14
| # | Pokémon | Livello |
|---|---|---|
| 1 | Bellsprout (69) | 9 |
| 2 | Tangela (114) | 10 |
| 3 | Lombre (271) | 11 |
| 4 | Ivysaur (2) | 12 |
| 5 | Gloom (44) | 13 |
| 6 (asso) | Grovyle (253) | 14 |

## 2. GROTTAFERRATA — Igino (Psico) — cap 21
| # | Pokémon | Livello |
|---|---|---|
| 1 | Clefable (36) | 16 |
| 2 | Natu (177) | 17 |
| 3 | Grumpig (326) | 18 |
| 4 | Kadabra (64) | 19 |
| 5 | Hypno (97) | 20 |
| 6 (asso) | Espeon (196) | 21 |

## 3. MARINO — Matilde (Acqua) — cap 28
| # | Pokémon | Livello |
|---|---|---|
| 1 | Poliwhirl (61) | 24 |
| 2 | Vaporeon (134) | 25 |
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
| 4 | Jolteon (135) | 32 |
| 5 | Manectric (310) | 33 |
| 6 (asso) | Ampharos (181) | 34 |

## 5. ROCCA DI PAPA — Baso (Lotta) — cap 40
| # | Pokémon | Livello |
|---|---|---|
| 1 | Hariyama (297) | 35 |
| 2 | Hitmonchan (107) | 36 |
| 3 | Hitmonlee (106) | 37 |
| 4 | Blaziken (257) | 38 |
| 5 | Medicham (308) | 39 |
| 6 (asso) | Machamp (68) | 40 |

## 6. ALBANO LAZIALE — Giorgia (Roccia) — cap 46
| # | Pokémon | Livello |
|---|---|---|
| 1 | Nosepass (299) | 41 |
| 2 | Aggron (306) | 42 |
| 3 | Steelix (208) | 43 |
| 4 | Golem (76) | 44 |
| 5 | Rhydon (112) | 45 |
| 6 (asso) | Tyranitar (248) | 46 |

## 7. ARICCIA — Isa (Buio) — cap 52
| # | Pokémon | Livello |
|---|---|---|
| 1 | Houndoom (229) | 51 |
| 2 | Sharpedo (319) | 51 |
| 3 | Shiftry (275) | 51 |
| 4 | Crawdaunt (342) | 51 |
| 5 | Absol (359) | 51 |
| 6 (asso) | Umbreon (197) | 52 |

## 8. GENZANO — Camilla (Fuoco) — cap 63
| # | Pokémon | Livello |
|---|---|---|
| 1 | Ninetales (38) | 62 |
| 2 | Arcanine (59) | 62 |
| 3 | Camerupt (323) | 62 |
| 4 | Typhlosion (157) | 62 |
| 5 | Flareon (136) | 62 |
| 6 (asso) | Charizard (6) | 63 |

---

## Come mi dai le modifiche
Per ciascun Capopalestra che vuoi cambiare, scrivimi semplicemente:
```
Donnie: Bellsprout 9, Hoppip 10, Oddish 11, Shroomish 12, Gloom 13, Roselia 14 (asso)
```
oppure solo i cambi puntuali ("togli Hoppip, metti Skiploom 12 al suo posto").
Applico io le modifiche a `dati/trainer.js` una volta che mi dai la lista.
