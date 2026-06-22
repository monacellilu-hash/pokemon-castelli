# DIZIONARIO TILESET REALE — Pokémon Castelli Romani
# Versione 3 — BASATO ESCLUSIVAMENTE SU ISPEZIONE VISIVA DIRETTA
# Ogni numero corrisponde a quello visibile nei tileset viewer del progetto
# NON INVENTATO — se un tile non è stato visto, non è in questo documento

---

## COME FUNZIONA IL SISTEMA DI COORDINATE

Il tileset principale si chiama `tileset-outside.png`.
Ogni tile è 32×32 pixel. La griglia è larga 8 tile per riga.
**Indice = (numero_riga × 8) + numero_colonna_0_to_7**

I tileset PNG senza numeri (Flowers1.png, Dirt.png, ecc.) sono sprite standalone:
vanno referenziati per NOME FILE, non per indice numerico.

---

## PARTE 1 — TILESET NUMERATO (tileset-outside.png)
### Righe R0–R25 (indici 0–207) — da Screenshot_20260615_191815.png

---

### 🟫 RIGA R0 — indici 0–7
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 0 | Nero pieno | Vuoto/fuori mappa | 1 BLOCCANTE |
| 1 | Verde chiaro acqua (erba chiarissima) | FILL erba base chiara | 0 |
| 2 | Verde chiaro acqua | FILL erba base variante | 0 |
| 3 | Verde chiaro acqua | FILL erba base variante | 0 |
| 4 | Verde chiaro acqua | FILL erba base variante | 0 |
| 5 | Verde chiaro acqua | FILL erba base variante | 0 |
| 6 | Verde chiaro acqua | ERBA ALTA PER POKEMON SELVATICI | 0 |
| 7 | Verde scuro con texture foglie | Albero / vegetazione densa | 1 BLOCCANTE |

### 🌿 RIGHE R1–R3 — indici 8–31 — ERBA BASE E TRANSIZIONI
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 8 | Verde acqua uniforme | FILL erba base principale (questo è il tile erba standard) | 0 |
| 9 | Verde acqua uniforme | FILL erba variante | 0 |
| 10 | Verde acqua leggermente più scuro | FILL erba variante scura | 0 |
| 11 | Verde acqua più scuro | FILL erba variante | 0 |
| 12 | Verde acqua chiaro | FILL erba variante | 0 |
| 13 | Verde acqua | FILL erba variante | 0 |
| 14 | Verde acqua | FILL erba variante | 0 |
| 15 | Verde scuro con foglie (albero) | Vegetazione densa / albero bordo | 1 BLOCCANTE |
| 16 | Verde acqua | FILL erba | 0 |
| 17 | Verde acqua con sfumatura | FILL erba con variazione | 0 |
| 18 | Verde acqua | FILL erba | 0 |
| 19 | Verde acqua | FILL erba | 0 |
| 20 | Verde acqua | FILL erba | 0 |
| 21 | Verde acqua | FILL erba | 0 |
| 22 | Verde acqua | FILL erba | 0 |
| 23 | Verde acqua | FILL erba | 0 |
| 24 | Verde acqua chiaro | FILL erba chiara | 0 |
| 25 | Verde acqua | FILL erba | 0 |
| 26 | Verde acqua | FILL erba | 0 |
| 27 | Verde acqua | FILL erba | 0 |
| 28 | Verde acqua | FILL erba | 0 |
| 29 | Verde acqua | FILL erba | 0 |
| 30 | Verde acqua con fiori bianchi piccoli | FILL erba con fiori bianchi | 0 DECOR |
| 31 | Verde acqua | FILL erba | 0 |

### 🌿 RIGHE R4–R5 — indici 32–47 — ERBA VARIANTI E TRANSIZIONI
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 32 | Verde acqua | FILL erba | 0 |
| 33 | Verde acqua | FILL erba | 0 |
| 34 | Verde acqua | FILL erba | 0 |
| 35 | Verde acqua | FILL erba | 0 |
| 36 | Verde acqua | FILL erba | 0 |
| 37 | Verde acqua | FILL erba | 0 |
| 38 | Verde acqua | FILL erba | 0 |
| 39 | ❌ Non usabile (X rossa) | VUOTO / INVALIDO | — |
| 40 | Verde acqua | FILL erba | 0 |
| 41 | Verde acqua | FILL erba | 0 |
| 42 | Verde acqua | FILL erba | 0 |
| 43 | Verde acqua | FILL erba | 0 |
| 44 | Verde acqua | FILL erba | 0 |
| 45 | Verde acqua | FILL erba | 0 |
| 46 | Verde acqua | FILL erba | 0 |
| 47 | Verde acqua | FILL erba | 0 |

### 🌿 RIGHE R6–R7 — indici 48–63
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 48 | Verde acqua più scuro (angolo/bordo) | Transizione erba scura | 0 |
| 49 | Verde acqua | FILL erba | 0 |
| 50 | Verde acqua | FILL erba | 0 |
| 51 | Verde acqua | FILL erba | 0 |
| 52 | Verde acqua | FILL erba | 0 |
| 53 | Verde acqua | FILL erba | 0 |
| 54 | Verde acqua | FILL erba | 0 |
| 55 | Verde acqua chiaro uniforme | FILL erba chiara liscia | 0 |
| 56 | Verde acqua | FILL erba | 0 |
| 57 | Verde acqua | FILL erba | 0 |
| 58 | Verde acqua | FILL erba | 0 |
| 59 | Verde acqua | FILL erba | 0 |
| 60 | Verde acqua | FILL erba | 0 |
| 61 | Verde acqua | FILL erba | 0 |
| 62 | Verde acqua | FILL erba | 0 |
| 63 | Verde acqua | FILL erba | 0 |

### 🟡 RIGHE R8–R11 — indici 64–95 — SABBIA / TERRA BATTUTA
Nota: dal R8 in poi il tileset mostra una zona sabbia/terra (colore beige/ocra).
Le X rosse indicano tile non usabili (invalidi in quel tileset).

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 64 | Verde acqua scuro (bordo erba) | Bordo erba scuro | 0 |
| 65 | Verde acqua | FILL erba | 0 |
| 66 | Verde acqua | FILL erba | 0 |
| 67 | Verde acqua | FILL erba | 0 |
| 68 | ❌ X rossa | INVALIDO | — |
| 69 | ❌ X rossa | INVALIDO | — |
| 70 | Verde acqua | FILL erba | 0 |
| 71 | Verde acqua | FILL erba | 0 |
| 72 | Verde acqua | FILL erba | 0 |
| 73 | Verde acqua | FILL erba | 0 |
| 74 | Verde acqua | FILL erba | 0 |
| 75 | Verde acqua | FILL erba | 0 |
| 76 | Verde acqua | FILL erba | 0 |
| 77 | ❌ X rossa | INVALIDO | — |
| 78 | Verde acqua | FILL erba | 0 |
| 79 | Verde acqua | FILL erba | 0 |
| 80 | Verde acqua | FILL erba | 0 |
| 81 | Verde acqua | FILL erba | 0 |
| 82 | Verde acqua | FILL erba | 0 |
| 83 | Verde acqua | FILL erba | 0 |
| 84 | Verde acqua | FILL erba | 0 |
| 85 | Verde acqua | FILL erba | 0 |
| 86 | Verde acqua | FILL erba | 0 |
| 87 | ❌ X rossa | INVALIDO | — |
| 88 | Verde acqua | FILL erba | 0 |
| 89 | Verde acqua | FILL erba | 0 |
| 90 | Verde acqua | FILL erba | 0 |
| 91 | ❌ X rossa | INVALIDO | — |
| 92 | ❌ X rossa | INVALIDO | — |
| 93 | Verde acqua | FILL erba | 0 |
| 94 | Verde acqua | FILL erba | 0 |
| 95 | ❌ X rossa | INVALIDO | — |

### 🟡 RIGHE R12–R18 — indici 96–151 — TERRA BATTUTA / SABBIA
Da qui in poi il tileset mostra chiaramente la zona **sabbia/terra beige** con transizioni verso erba.

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 96 | Sabbia/terra beige chiara | FILL terra/sabbia principale | 0 |
| 97 | Sabbia beige | FILL terra variante | 0 |
| 98 | Sabbia beige | FILL terra variante | 0 |
| 99 | Sabbia beige | FILL terra variante | 0 |
| 100 | Sabbia beige | FILL terra | 0 |
| 101 | Sabbia beige | FILL terra | 0 |
| 102 | Sabbia beige | FILL terra | 0 |
| 103 | Sabbia beige | FILL terra | 0 |
| 104 | Sabbia/terra con bordo erba sx | BORDO O terra→erba | 0 |
| 105 | Sabbia/terra | FILL terra | 0 |
| 106 | Sabbia/terra | FILL terra | 0 |
| 107 | Sabbia/terra | FILL terra | 0 |
| 108 | Sabbia/terra | FILL terra | 0 |
| 109 | Sabbia/terra | FILL terra | 0 |
| 110 | Sabbia/terra | FILL terra | 0 |
| 111 | ❌ X rossa | INVALIDO | — |
| 112 | Sabbia/terra — angolo NO (erba sopra-sx) | ANGOLO NO terra→erba | 0 |
| 113 | Sabbia/terra — bordo N (erba sopra) | BORDO N terra→erba | 0 |
| 114 | Sabbia/terra — bordo N variante | BORDO N terra→erba | 0 |
| 115 | Sabbia/terra — bordo N variante | BORDO N terra→erba | 0 |
| 116 | Sabbia/terra — angolo NE (erba sopra-dx) | ANGOLO NE terra→erba | 0 |
| 117 | Sabbia/terra — bordo N | BORDO N terra | 0 |
| 118 | Sabbia/terra — bordo N variante | BORDO N terra | 0 |
| 119 | ❌ X rossa | INVALIDO | — |
| 120 | Sabbia/terra — bordo O (erba sx) | BORDO O terra→erba | 0 |
| 121 | Sabbia/terra — FILL pieno | FILL terra pieno | 0 |
| 122 | Sabbia/terra — FILL | FILL terra | 0 |
| 123 | Sabbia/terra — FILL | FILL terra | 0 |
| 124 | ❌ X rossa | INVALIDO | — |
| 125 | ❌ X rossa | INVALIDO | — |
| 126 | Sabbia/terra — FILL | FILL terra | 0 |
| 127 | Sabbia/terra — bordo E (erba dx) | BORDO E terra→erba | 0 |
| 128 | Sabbia/terra — bordo O | BORDO O terra | 0 |
| 129 | Sabbia/terra — FILL | FILL terra | 0 |
| 130 | Sabbia/terra — FILL | FILL terra | 0 |
| 131 | Sabbia/terra — FILL | FILL terra | 0 |
| 132 | Sabbia/terra — FILL | FILL terra | 0 |
| 133 | ❌ X rossa | INVALIDO | — |
| 134 | ❌ X rossa | INVALIDO | — |
| 135 | Sabbia/terra — bordo E | BORDO E terra | 0 |
| 136 | Sabbia/terra — bordo O | BORDO O terra | 0 |
| 137 | Sabbia/terra — FILL | FILL terra | 0 |
| 138 | Sabbia/terra — FILL | FILL terra | 0 |
| 139 | Sabbia/terra — FILL | FILL terra | 0 |
| 140 | Sabbia/terra — FILL | FILL terra | 0 |
| 141 | Sabbia/terra — FILL | FILL terra | 0 |
| 142 | Sabbia/terra — bordo E | BORDO E terra | 0 |
| 143 | ❌ X rossa | INVALIDO | — |
| 144 | Sabbia/terra — angolo SO (erba sotto-sx) | ANGOLO SO terra→erba | 0 |
| 145 | Sabbia/terra — bordo S (erba sotto) | BORDO S terra→erba | 0 |
| 146 | Sabbia/terra — bordo S variante | BORDO S terra | 0 |
| 147 | Sabbia/terra — bordo S | BORDO S terra | 0 |
| 148 | ❌ X rossa | INVALIDO | — |
| 149 | Sabbia/terra — bordo S | BORDO S terra | 0 |
| 150 | Sabbia/terra — bordo S | BORDO S terra | 0 |
| 151 | Sabbia/terra — angolo SE (erba sotto-dx) | ANGOLO SE terra→erba | 0 |

### 🌿 RIGHE R19–R25 — indici 152–207 — ERBA CHIARA + TERRA (seconda palette)
Zona con erba più chiara / gialla e nuove transizioni terra:

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 152 | Erba chiara gialla | FILL erba chiara/secca | 0 |
| 153–159 | Erba chiara varianti | FILL erba chiara | 0 |
| 160–167 | Erba chiara + terre con bordi | FILL / transizioni erba chiara | 0 |
| 168–175 | Erba chiara con transizioni | BORDI erba chiara→terra | 0 |
| 176 | Erba chiara — FILL | FILL erba chiara | 0 |
| 177 | Erba chiara — FILL | FILL erba chiara | 0 |
| 178 | Erba chiara — FILL | FILL erba chiara | 0 |
| 179 | Erba chiara — FILL | FILL erba chiara | 0 |
| 180 | Erba chiara — FILL | FILL erba chiara | 0 |
| 181 | ❌ X rossa | INVALIDO | — |
| 182 | ❌ X rossa | INVALIDO | — |
| 183 | Erba chiara | FILL erba chiara | 0 |
| 184–191 | Erba chiara con transizioni sabbia | FILL / BORDI erba chiara | 0 |
| 192–199 | Erba chiara con transizioni | BORDI e ANGOLI erba chiara→sabbia | 0 |
| 200–207 | Erba chiara varianti + transizioni | FILL / BORDI erba chiara | 0 |

---

### ⛰️ RIGHE R26–R32 — indici 208–263 — ROCCIA / PIETRA GRIGIA
Da Screenshot_20260615_192014.png — zona chiaramente grigia/rocciosa:

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 208 | Grigio pietra scuro — FILL | FILL roccia/pietra — zona montagna | 1 BLOCCANTE |
| 209 | Grigio pietra — FILL variante | FILL roccia | 1 BLOCCANTE |
| 210 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 211 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 212 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 213 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 214 | Grigio pietra chiaro | FILL roccia chiara | 1 BLOCCANTE |
| 215 | Grigio pietra chiaro | FILL roccia chiara | 1 BLOCCANTE |
| 216 | Grigio pietra — FILL | FILL roccia | 1 BLOCCANTE |
| 217 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 218 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 219 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 220 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 221 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 222 | Grigio pietra | FILL roccia | 1 BLOCCANTE |
| 223 | ❌ X rossa | INVALIDO | — |
| 224 | Grigio con bordo erba — angolo NO | ANGOLO NO roccia→erba (scarpata) | 1 |
| 225 | Grigio con bordo erba N | BORDO N roccia→erba (scarpata nord) | 1 |
| 226 | Grigio con bordo N | BORDO N roccia | 1 |
| 227 | Grigio con bordo N | BORDO N roccia | 1 |
| 228 | Grigio con bordo N | BORDO N roccia | 1 |
| 229 | ❌ X rossa | INVALIDO | — |
| 230 | Grigio con bordo erba — angolo NE | ANGOLO NE roccia→erba | 1 |
| 231 | ❌ X rossa | INVALIDO | — |
| 232 | Grigio con bordo O | BORDO O roccia→erba | 1 |
| 233 | Grigio pietra — FILL | FILL roccia | 1 BLOCCANTE |
| 234 | Grigio pietra — FILL | FILL roccia | 1 BLOCCANTE |
| 235 | Grigio pietra — FILL | FILL roccia | 1 BLOCCANTE |
| 236 | ❌ X rossa | INVALIDO | — |
| 237 | ❌ X rossa | INVALIDO | — |
| 238 | Grigio pietra | FILL roccia | 1 |
| 239 | Grigio pietra con bordo E | BORDO E roccia | 1 |
| 240 | Grigio con bordo O | BORDO O roccia | 1 |
| 241–247 | Grigio roccia FILL e bordi | FILL / BORDI roccia | 1 |
| 248–255 | Grigio roccia bordi e angoli | BORDI / ANGOLI roccia | 1 |
| 256 | Grigio con bordo O | BORDO O roccia | 1 |
| 257 | Grigio roccia — FILL | FILL roccia | 1 |
| 258 | Grigio roccia — FILL | FILL roccia | 1 |
| 259 | ❌ X rossa | INVALIDO | — |
| 260 | ❌ X rossa | INVALIDO | — |
| 261 | ❌ X rossa | INVALIDO | — |
| 262 | Grigio roccia | FILL roccia | 1 |
| 263 | Grigio con bordo E | BORDO E roccia | 1 |

### ❄️ RIGHE R33–R40 — indici 264–327 — NEVE / GHIACCIO
Zona chiaramente bianco-azzurra = neve/ghiaccio:

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 264 | Bianco-azzurro neve — FILL | FILL neve principale | 0 (scivoloso tipo 7) |
| 265–271 | Neve FILL varianti | FILL neve | 0 |
| 272–279 | Neve con transizioni roccia | BORDI neve→roccia | 0/1 |
| 280–287 | Neve FILL e bordi | FILL / BORDI neve | 0 |
| 288–295 | Neve con transizioni | BORDI e ANGOLI neve | 0 |
| 296–303 | Neve FILL e bordi | FILL / BORDI neve | 0 |
| 304–311 | Neve con ghiaccio (più azzurro) | FILL ghiaccio (scivoloso!) | 7 (scivola) |
| 312–319 | Neve/ghiaccio con transizioni | BORDI ghiaccio | 7 |
| 320–327 | Tutto ❌ X rosse o neve | INVALIDI o neve | — |

### 🟡 RIGHE R41–R51 — indici 328–415 — SABBIA CHIARA / SPIAGGIA
Zona beige chiara = sabbia:

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 328–335 | Beige sabbia — FILL | FILL sabbia spiaggia | 0 |
| 336–343 | Sabbia FILL varianti | FILL sabbia | 0 |
| 344–351 | Sabbia con bordi | BORDI sabbia→erba/acqua | 0 |
| 352–359 | Sabbia FILL e bordi | FILL / BORDI sabbia | 0 |
| 360–367 | Sabbia con transizioni | BORDI e ANGOLI sabbia | 0 |
| 368–375 | Sabbia — X rosse e fill | INVALIDI / FILL sabbia | 0 |
| 376–383 | Sabbia — X rosse e fill | INVALIDI / FILL sabbia | 0 |
| 384–391 | Sabbia — X rosse e fill | INVALIDI / FILL sabbia | 0 |
| 392–399 | Grigio chiaro — asfalto/marciapiede | FILL asfalto / cemento | 0 |
| 400–407 | Grigio asfalto chiaro | FILL asfalto variante | 0 |
| 408–415 | Grigio asfalto con texture | FILL asfalto / marciapiede | 0 |

---

### 🌲 RIGHE R52–R76 — indici 416–615 — ALBERI (da alberi_da_bordo_e_riempimento.png)

Questa sezione è ENORME. Contiene decine di varianti di alberi verdi, tronchi,
chiome, alberi gialli (autunno), alberi teal/acqua, e varianti con sfondo acqua.

#### ALBERI VERDI STANDARD (il set principale per le città)

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 416 | Chioma verde scuro — top-left grande | ALBERO VERDE — parte alto-sinistra | 1 BLOCCANTE |
| 417 | Chioma verde — top-center | ALBERO VERDE — parte alto-centro | 1 BLOCCANTE |
| 418 | Chioma verde — top-right | ALBERO VERDE — parte alto-destra | 1 BLOCCANTE |
| 419 | Chioma verde — top variante | ALBERO VERDE top | 1 BLOCCANTE |
| 420 | Chioma verde scuro top-left | ALBERO VERDE top-sx variante | 1 BLOCCANTE |
| 421 | Chioma verde top-right | ALBERO VERDE top-dx variante | 1 BLOCCANTE |
| 422 | ❌ X rossa | INVALIDO | — |
| 423 | ❌ X rossa | INVALIDO | — |
| 424 | Tronco+chioma verde — mid-left | ALBERO VERDE — parte medio-sinistra | 1 BLOCCANTE |
| 425 | Tronco — centro basso | ALBERO VERDE — parte centrale/tronco | 1 BLOCCANTE |
| 426 | Chioma+tronco — mid-right | ALBERO VERDE — parte medio-destra | 1 BLOCCANTE |
| 427 | Chioma verde mid | ALBERO VERDE mid variante | 1 BLOCCANTE |
| 428 | Chioma verde scuro mid-left | ALBERO VERDE mid-sx | 1 BLOCCANTE |
| 429 | Chioma verde mid-right | ALBERO VERDE mid-dx | 1 BLOCCANTE |
| 430 | ❌ X rossa | INVALIDO | — |
| 431 | ❌ X rossa | INVALIDO | — |
| 432 | Radici/base albero — bot-left | ALBERO VERDE — base sinistra | 1 BLOCCANTE |
| 433 | Radici/base — bot-center | ALBERO VERDE — base centro | 1 BLOCCANTE |
| 434 | Radici/base — bot-right | ALBERO VERDE — base destra | 1 BLOCCANTE |
| 435 | ❌ X rossa | INVALIDO | — |
| 436 | Base albero variante sx | ALBERO VERDE base-sx variante | 1 BLOCCANTE |
| 437 | Base albero variante dx | ALBERO VERDE base-dx variante | 1 BLOCCANTE |
| 438 | ❌ X rossa | INVALIDO | — |
| 439 | ❌ X rossa | INVALIDO | — |

#### ALBERI VERDI — VARIANTE CON ACQUA/TEAL SOTTO (per zone lacustri)

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 440 | Chioma verde scuro — sfondo teal | ALBERO su acqua/lago — top-sx | 1 BLOCCANTE |
| 441 | Chioma verde — sfondo teal | ALBERO su acqua — top | 1 BLOCCANTE |
| 442 | Chioma verde — sfondo teal | ALBERO su acqua — top-dx | 1 BLOCCANTE |
| 443 | ❌ X rossa | INVALIDO | — |
| 444 | Chioma verde sfondo teal | ALBERO su acqua | 1 BLOCCANTE |
| 445 | Chioma verde sfondo teal | ALBERO su acqua | 1 BLOCCANTE |
| 446 | Chioma verde sfondo teal — teal acqua | FILL acqua teal con vegetazione | 3 ACQUA |
| 447 | Chioma verde — sfondo teal | ALBERO su acqua | 1 |
| 448–455 | Alberi teal varianti (mid) | ALBERO su acqua — parti medie | 1/3 |
| 456 | Chioma verde — sfondo teal bordo | ALBERO su acqua — base | 1 |
| 457 | Base albero sfondo teal | ALBERO su acqua — base | 1 |
| 458 | Base albero sfondo teal | ALBERO su acqua base | 1 |
| 459 | ❌ X rossa | INVALIDO | — |
| 460 | Acqua teal con riflesso | FILL acqua teal (lago) | 3 ACQUA |
| 461 | Acqua teal | FILL acqua teal | 3 ACQUA |
| 462 | Acqua teal chiara | FILL acqua teal chiara | 3 ACQUA |
| 463 | Acqua teal | FILL acqua teal | 3 ACQUA |

#### ALBERO SENZA FOGLIE / CON BUCO (per MN Taglio)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 464 | ❌ X rossa | INVALIDO | — |
| 465 | Ceppo/moncone alberello | ALBERELLO TAGLIATO (post-MN Taglio) | 0 |
| 466 | Alberello piccolo verde | ALBERELLO (pre-MN Taglio) | 4 MN-TAGLIO |

#### ALBERI VERDI GRANDI VARIANTE 2 (R59-R63)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 472–479 | Chiome verdi variante 2 (top) | ALBERO VERDE grande V2 — top | 1 BLOCCANTE |
| 480–487 | Chiome+tronchi V2 (mid) | ALBERO VERDE grande V2 — mid | 1 BLOCCANTE |
| 488–495 | Basi albero V2 (bot) | ALBERO VERDE grande V2 — base | 1 BLOCCANTE |
| 496–503 | Chiome V2 variante piccola | ALBERO VERDE piccolo V2 | 1 BLOCCANTE |
| 504–511 | Basi V2 + sfondo acqua | ALBERO su acqua V2 | 1/3 |

#### ALBERI GIALLI (autunno / zone secche)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 520–527 | Chioma giallo-verde — top | ALBERO GIALLO — top (autunno) | 1 BLOCCANTE |
| 528–535 | Chioma gialla — mid | ALBERO GIALLO — mid | 1 BLOCCANTE |
| 536–543 | Tronco+base giallo | ALBERO GIALLO — base | 1 BLOCCANTE |
| 544–551 | Albero giallo piccolo | ALBERO GIALLO piccolo | 1 BLOCCANTE |
| 552–559 | Albero giallo — basi | ALBERO GIALLO base variante | 1 BLOCCANTE |

#### ALBERI TEAL/ACQUA (per zone lacustri e paludi)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 560–567 | Chioma teal/verde acqua — top | ALBERO TEAL — top | 1 BLOCCANTE |
| 568–575 | Chioma teal — mid | ALBERO TEAL — mid | 1 BLOCCANTE |
| 576–583 | Base teal | ALBERO TEAL — base | 1 BLOCCANTE |
| 584–591 | Albero teal piccolo | ALBERO TEAL piccolo | 1 BLOCCANTE |
| 592–599 | Albero teal su acqua | ALBERO su acqua teal | 1/3 |
| 600–607 | Albero teal variante | ALBERO TEAL variante | 1 BLOCCANTE |
| 608–615 | Albero teal con base acqua | ALBERO TEAL base acqua | 1/3 |

---

## PARTE 2 — TILESET SIEPI, ACQUA, EDIFICI SPECIALI
### da siepi_e_acque_anche_per_sub_quelle_scure.png (R82–R90, indici 656–727)

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 656 | Siepe verde scura — FILL | FILL siepe (tipo recinzione vegetale) | 1 BLOCCANTE |
| 657 | Siepe verde — FILL variante | FILL siepe variante | 1 BLOCCANTE |
| 658 | Siepe verde | FILL siepe | 1 BLOCCANTE |
| 659 | ❌ X rossa | INVALIDO | — |
| 660 | Siepe verde rotonda grande | Siepe/cespuglio grande decorativo | 1 BLOCCANTE |
| 661 | Siepe verde rotonda grande | Siepe/cespuglio grande | 1 BLOCCANTE |
| 662 | Siepe verde grande | Siepe/cespuglio | 1 BLOCCANTE |
| 663 | ❌ X rossa | INVALIDO | — |
| 664 | Siepe verde scura bordo | BORDO siepe | 1 BLOCCANTE |
| 665 | Edificio verde/teal (PokéCenter?) con tetto | Edificio speciale verde | 1 BLOCCANTE |
| 666 | Edificio verde variante | Edificio verde | 1 BLOCCANTE |
| 667 | ❌ X rossa | INVALIDO | — |
| 668 | Siepe rotonda grande top-left | Cespuglio grande TL | 1 BLOCCANTE |
| 669 | Siepe rotonda grande top-right | Cespuglio grande TR | 1 BLOCCANTE |
| 670 | Siepe verde grande | Cespuglio grande variante | 1 BLOCCANTE |
| 671 | Siepe verde grande | Cespuglio grande | 1 BLOCCANTE |
| 672 | ❌ X rossa | INVALIDO | — |
| 673 | ❌ X rossa | INVALIDO | — |
| 674 | ❌ X rossa | INVALIDO | — |
| 675 | Siepe verde bordo | BORDO siepe | 1 |
| 676 | Siepe verde FILL | FILL siepe | 1 |
| 677 | Siepe verde FILL | FILL siepe | 1 |
| 678 | Siepe verde FILL | FILL siepe | 1 |
| 679 | Siepe verde FILL | FILL siepe | 1 |
| 680 | Toro / statua bianca | DECOR statua | 1 BLOCCANTE |
| 681 | Edificio mattoni rossi piccolo | Casa mattoni — tile 1×1 | 1 BLOCCANTE |
| 682 | Edificio mattoni rossi variante | Casa mattoni variante | 1 BLOCCANTE |
| 683 | Edificio grigio | Casa grigia | 1 BLOCCANTE |
| 684 | Siepe grande bot-left | Cespuglio grande BL | 1 BLOCCANTE |
| 685 | Siepe grande bot-right | Cespuglio grande BR | 1 BLOCCANTE |
| 686 | Siepe verde grande | Cespuglio grande | 1 BLOCCANTE |
| 687 | Siepe verde grande | Cespuglio grande | 1 BLOCCANTE |
| 688 | Acqua blu scuro — FILL | FILL acqua lago/fiume scuro | 3 ACQUA |
| 689 | ❌ X rossa | INVALIDO | — |
| 690 | Acqua blu con bordo terra marrone | BORDO acqua→terra (riva) | 3/0 |
| 691 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 692 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 693 | Acqua blu chiara — FILL | FILL acqua chiara | 3 ACQUA |
| 694 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 695 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 696 | Acqua blu scuro con bordo | BORDO acqua sx | 3 |
| 697 | ❌ X rossa | INVALIDO | — |
| 698 | Acqua con curva riva | ANGOLO riva acqua | 3/0 |
| 699 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 700 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 701 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 702 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 703 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 704 | Acqua con bordo terra curvo | RIVA curva acqua | 0/3 |
| 705 | Acqua con riva | RIVA acqua | 0/3 |
| 706 | Acqua con riva | RIVA acqua | 0/3 |
| 707 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 708 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 709 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 710 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 711 | Acqua blu con riva dx | RIVA E acqua | 0/3 |
| 712 | Acqua con riva curva bot | RIVA S curva | 0/3 |
| 713 | Acqua con riva S | RIVA S acqua | 0/3 |
| 714 | Acqua con riva S | RIVA S acqua | 0/3 |
| 715 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 716 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 717 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 718 | Acqua blu con teal | FILL acqua teal scura (sub/profonda) | 3 ACQUA |
| 719 | Acqua teal scura — FILL | FILL acqua profonda (SUB) | 3 ACQUA |
| 720 | Acqua con riva bot-sx | RIVA SO acqua | 0/3 |
| 721 | ❌ X rossa | INVALIDO | — |
| 722 | ❌ X rossa | INVALIDO | — |
| 723 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 724 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 725 | Acqua blu — FILL | FILL acqua | 3 ACQUA |
| 726 | ❌ X rossa | INVALIDO | — |
| 727 | Acqua teal scura / sub | FILL acqua sub profonda | 3 ACQUA |

**NOTA IMPORTANTE SUB/SURF**:
- Acqua standard (688–717): usa per Lago Albano, Lago Nemi — navigabile con MN Surf
- Acqua teal scura (718–719, 727): usa per zone più profonde — navigabile con MN Sub (Dive)

---

## PARTE 3 — EDIFICI (da outstide.png, R91–R106, indici 728–855)

### 🚢 NAVI / VEICOLI (R91–R92, indici 728–743)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 728–735 | Nave/barca grigia + porta FREE PASS | NAVE — parte superiore con porta | 1/0 (porta) |
| 736–743 | Nave/barca — parte inferiore | NAVE — parte bassa | 1 BLOCCANTE |

### 🏛️ ARCHI / ENTRATE ANTICHE (R93–R95, indici 744–767)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 744–751 | Arco/entrata antica grigia | ARCO ANTICO — top | 1/0 (passaggio) |
| 752–759 | Arco antico — parte bassa | ARCO — base | 1/0 |
| 760–767 | Arco variante / entrata | ARCO variante | 1/0 |

### 🏢 EDIFICI MODERNI / CANCELLI (R96–R97, indici 768–783)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 768 | ❌ X rossa | INVALIDO | — |
| 769 | ❌ X rossa | INVALIDO | — |
| 770 | Struttura acciaio/ringhiera grigia | RINGHIERA / recinzione metallica | 1 BLOCCANTE |
| 771 | Struttura acciaio variante | RINGHIERA variante | 1 BLOCCANTE |
| 772 | Struttura/cancello | CANCELLO / ingresso | 1/0 |
| 773 | Struttura grigia | RINGHIERA | 1 |
| 774 | ❌ X rossa | INVALIDO | — |
| 775 | Struttura grigia | RINGHIERA | 1 |
| 776–783 | Strutture acciaio righe orizzontali | COPERTURA / tetto struttura metallica | 1 BLOCCANTE |

### 🪨 ROCCE E MASSI (R98–R106, indici 784–855)
Zona chiaramente con texture rocciosa brunastra — massi, rocce, pareti grotta:

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 784–791 | Roccia marrone grande (top) | MASSO grande — parte superiore | 1 BLOCCANTE |
| 792–799 | Roccia marrone (mid) | MASSO — parte centrale | 1 BLOCCANTE |
| 800–807 | Roccia marrone (bot) + nero profondo | MASSO base + entrata grotta buia | 1 BLOCCANTE |
| 808–815 | Roccia marrone variante | MASSO variante | 1 BLOCCANTE |
| 816–823 | Rocce + sabbia/terra | ROCCE su sabbia | 1 BLOCCANTE |
| 824–831 | ❌ X rosse + rocce | invalidi + rocce | 1 |
| 832–839 | Erba gialla chiara | FILL erba secca/gialla (zona rocciosa) | 0 |
| 840–847 | Erba gialla chiara | FILL erba gialla variante | 0 |
| 848–855 | Erba/acqua chiara teal | FILL erba acquatica / zona palude | 0/3 |

---

## PARTE 4 — NAVI, ROCCE, ENTRATE, TEMPLI, PONTI
### da navi_rocce_entrate_templi_vecchi_ponti.png (R137–R153+)

### 🚢 NAVI (R137–R138, indici 1096–1111)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1096–1103 | Nave bianca grande (top) | NAVE grande — parte superiore | 1 BLOCCANTE |
| 1104–1111 | Nave bianca grande (bot) | NAVE grande — parte inferiore | 1 BLOCCANTE |
| 1101–1103 | Giardino/pianta su sfondo marrone | Zona esterna con piante | 0 |

### 🪨 ROCCE SINGOLE GRANDI (R139–R144)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1112–1115 | Roccia grande grigia singola | ROCCIA GRANDE — MN Forza (spostabile) | 5 MN-FORZA |
| 1117–1119 | Finestra rotonda / occhio di bue | DECORAZIONE edificio (finestra) | 1 |
| 1120–1123 | Roccia grigia media | ROCCIA MEDIA — MN Rocksm ash | 6 MN-ROCKSM ASH |
| 1128–1131 | Rocce grigie piccole (cluster) | ROCCE PICCOLE decorative | 1 BLOCCANTE |
| 1133 | Occhio di bue / tondo | DECORAZIONE edificio | 1 |
| 1134–1135 | Finestra rotonda | DECORAZIONE | 1 |
| 1136–1143 | Rocce medie grigie varianti | ROCCE — MN Rocksm ash | 6 |
| 1144–1148 | Rocce grosse grigie | ROCCE GRANDI — MN Forza | 5 MN-FORZA |
| 1152–1157 | Brocche/vasi antichi | VASI DECORATIVI (decor interno/esterno) | 1 BLOCCANTE |

### 🛤️ MARCIAPIEDI / STRADE GRIGIE (R145–R146)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1157–1159 | Mattoni beige/ocra — FILL | FILL marciapiede ocra / lastricato antico | 0 |
| 1160–1163 | Mattoni beige varianti | FILL lastricato variante | 0 |
| 1164–1167 | Mattoni beige varianti | FILL lastricato | 0 |
| 1168–1171 | Struttura grigia tetto/copertura | TETTO GRIGIO struttura | 1 BLOCCANTE |
| 1172 | Porta/ingresso scuro | PORTA edificio scura | 0 (trigger) |
| 1173–1175 | Lastricato beige | FILL lastricato | 0 |

### 🏛️ PORTE E INGRESSI (R147–R149)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1176–1183 | Porta blu grande (doppia) — top | PORTA BLU GRANDE — parte superiore | 1 BLOCCANTE |
| 1184–1191 | Porta blu grande — bot | PORTA BLU GRANDE — parte inferiore + soglia | 0 (trigger entrata) |
| 1192–1199 | Porta grigia/acciaio (scorrevole) | PORTA ACCIAIO — edificio industriale | 0/1 (trigger) |

### 🏭 STRUTTURE INDUSTRIALI / HANGAR (R150–R152)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1200–1207 | Struttura giallo-grigio — top | HANGAR / fabbrica — parte superiore | 1 BLOCCANTE |
| 1208–1212 | Struttura giallo-grigio — mid | HANGAR — parte centrale | 1 BLOCCANTE |
| 1213–1215 | Mattoni beige + struttura | FABBRICA base | 1 BLOCCANTE |
| 1216–1220 | Struttura grigia — bot | HANGAR — base | 1 BLOCCANTE |
| 1221–1223 | Segnale "PLAYER GOES UNDER / OVER" | PONTE con player sotto/sopra | 0 (layer) |
| 1224–1228 | Struttura grigia con ringhiere | PONTE / cavalcavia | 0 (camminabile) |

---

## PARTE 5 — PALAZZI, RINGHIERE, CASE
### da ringhiere_e_case.png (R158–R174)

### 🏠 RINGHIERE / BALAUSTRE (R158–R166, indici 1264–1335)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1264–1271 | Ringhiera grigia orizzontale (top) | RINGHIERA TOP — bordo superiore balcone | 1 BLOCCANTE |
| 1272–1279 | Ringhiera grigia | RINGHIERA FILL | 1 BLOCCANTE |
| 1280–1287 | Ringhiera grigia variante | RINGHIERA variante | 1 BLOCCANTE |
| 1288–1295 | Ringhiera grigia | RINGHIERA | 1 BLOCCANTE |
| 1296–1303 | Ringhiera grigia | RINGHIERA | 1 BLOCCANTE |
| 1304–1311 | Ringhiera grigia scura | RINGHIERA SCURA | 1 BLOCCANTE |
| 1312–1319 | Ringhiera grigia scura variante | RINGHIERA SCURA variante | 1 BLOCCANTE |
| 1314 | ❌ X rossa | INVALIDO | — |
| 1320–1327 | Ringhiera con porte/cancelli | CANCELLO con ringhiera | 1/0 (cancello) |
| 1328–1335 | ❌ X rosse / Ringhiere | INVALIDI / RINGHIERE | — |

### 🏠 CASE (R167–R174, indici 1336–1399)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1336–1343 | Casa verde grande (tipo laboratorio Pokémon) — top | CASA VERDE top | 1 BLOCCANTE |
| 1344–1351 | Casa verde — mid (finestre, porta) | CASA VERDE mid | 1/0 (porta) |
| 1352–1359 | Casa verde — bot | CASA VERDE base | 1 BLOCCANTE |
| 1360–1367 | Casa beige/crema — top | CASA BEIGE top | 1 BLOCCANTE |
| 1368–1375 | Casa blu grande — top | CASA BLU top | 1 BLOCCANTE |
| 1376–1383 | Casa blu — mid | CASA BLU mid | 1/0 |
| 1384–1391 | Casa blu — bot | CASA BLU base | 1 BLOCCANTE |
| 1392–1399 | Case varianti bot | CASE varianti base | 1 BLOCCANTE |

---

## PARTE 6 — TETTI PALAZZI
### da top_palazzi.png (R206–R222, indici 1648–1783)

### 🏢 TETTI EDIFICI COLORATI
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 1648–1655 | Tetto ROSSO + tetto VERDE | TETTO ROSSO (sx) e TETTO VERDE (dx) — parte top | 1 BLOCCANTE |
| 1656–1663 | Tetto rosso bot + tetto verde | TETTO ROSSO base + TETTO VERDE bot | 1 BLOCCANTE |
| 1664–1671 | Tetto BLU + tetto ARANCIONE | TETTO BLU top (sx) + TETTO ARANCIONE top (dx) | 1 BLOCCANTE |
| 1672–1679 | Tetto blu bot + arancione bot | TETTO BLU base + TETTO ARANCIONE base | 1 BLOCCANTE |
| 1680–1687 | Tetto grigio/beige + finestre | TETTO GRIGIO edificio | 1 BLOCCANTE |
| 1688–1695 | ❌ X rosse + tetto verde grande | INVALIDI + TETTO VERDE GRANDE top | 1 |
| 1696–1703 | Tetto verde grande — mid | TETTO VERDE GRANDE mid | 1 BLOCCANTE |
| 1704–1711 | Tetto verde + ❌ | TETTO VERDE base + INVALIDI | 1 |
| 1712–1719 | Palazzo GIALLO grande — top (con portone dorato) | PALAZZO GIALLO — top | 1 BLOCCANTE |
| 1720–1727 | Palazzo giallo — mid | PALAZZO GIALLO — mid | 1 BLOCCANTE |
| 1728–1735 | Palazzo giallo — mid2 | PALAZZO GIALLO — mid2 | 1 BLOCCANTE |
| 1736–1743 | Palazzo giallo — mid3 | PALAZZO GIALLO — mid3 | 1 BLOCCANTE |
| 1744–1751 | Palazzo giallo — bot | PALAZZO GIALLO — base | 1 BLOCCANTE |
| 1752–1759 | Palazzo giallo + ❌ | PALAZZO GIALLO variante + INVALIDI | 1 |
| 1760–1767 | Palazzo giallo con finestre viola | PALAZZO GIALLO con accenti viola | 1 BLOCCANTE |
| 1768–1775 | Palazzo giallo + ❌ | varianti + INVALIDI | 1 |
| 1776–1783 | Palazzo giallo base finale | PALAZZO GIALLO base finale | 1 BLOCCANTE |

---

## PARTE 7 — CASE IMPORTANTI E PALAZZI
### da case_importanti_e_palazzi.png (R291–R305, indici 2328–2447)

### 🏛️ PALAZZO GRIGIO GRANDE (R291–R292, indici 2328–2343)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2328–2335 | Palazzo grigio scuro con finestre — top | PALAZZO GRIGIO top | 1 BLOCCANTE |
| 2336–2343 | Palazzo grigio — mid | PALAZZO GRIGIO mid | 1 BLOCCANTE |

### 🏠 CASE CON FINESTRE BLU (R293–R299, indici 2344–2399)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2344–2351 | Casa con finestre blu — top | CASA FINESTRE BLU top | 1 BLOCCANTE |
| 2352–2359 | Casa finestre blu — mid | CASA FINESTRE BLU mid | 1 BLOCCANTE |
| 2360–2367 | Casa finestre blu — bot | CASA FINESTRE BLU base | 1/0 (porta) |
| 2368–2375 | Casa con finestre + porta marrone | CASA PORTA MARRONE | 1/0 |
| 2376–2383 | ❌ X rosse | INVALIDI | — |
| 2384–2391 | Casa tetto marrone — variante | CASA MARRONE top | 1 BLOCCANTE |
| 2392–2399 | Casa marrone — bot | CASA MARRONE base | 1/0 |

### 🏢 PALAZZO ROSSO / MATTONI (R300–R305, indici 2400–2447)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2400–2407 | Palazzo rosso/mattoni — top | PALAZZO MATTONI top | 1 BLOCCANTE |
| 2408–2415 | Palazzo mattoni — mid (archi) | PALAZZO MATTONI mid con archi | 1 BLOCCANTE |
| 2416–2423 | Palazzo mattoni — mid2 | PALAZZO MATTONI mid2 | 1 BLOCCANTE |
| 2424–2431 | Palazzo mattoni — mid3 (entrata) | PALAZZO MATTONI mid entrata | 1/0 |
| 2432–2439 | Palazzo mattoni — bot | PALAZZO MATTONI base | 1 BLOCCANTE |
| 2440–2447 | ❌ X rosse | INVALIDI | — |

---

## PARTE 8 — VILLA E LABORATORI
### da villa_e_laboratori.png (R306–R325, indici 2448–2607)

### 🏠 VILLA ROSA / LABORATORIO PROFESSORE (R306–R317)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2448–2455 | Palazzo rosa — top (colonne) | VILLA ROSA top | 1 BLOCCANTE |
| 2456–2463 | Villa rosa — mid (con colonne) | VILLA ROSA mid | 1 BLOCCANTE |
| 2464–2471 | Villa rosa — mid2 | VILLA ROSA mid2 | 1 BLOCCANTE |
| 2472–2479 | Villa rosa — mid3 | VILLA ROSA mid3 | 1 BLOCCANTE |
| 2480–2487 | Villa rosa — mid4 (finestre) | VILLA ROSA mid finestre | 1 BLOCCANTE |
| 2488–2495 | Villa rosa — mid5 (portone) | VILLA ROSA portone | 1/0 |
| 2496–2503 | ❌ X rosse + villa | INVALIDI + VILLA | — |
| 2504–2511 | Villa rosa — bot | VILLA ROSA base | 1 BLOCCANTE |
| 2512–2519 | Villa rosa — base finale | VILLA ROSA base finale | 1 BLOCCANTE |
| 2520–2527 | Villa rosa variante | VILLA ROSA variante | 1 BLOCCANTE |
| 2528–2535 | Villa rosa — fine | VILLA ROSA fine | 1 BLOCCANTE |
| 2536–2543 | Villa rosa bot con ingresso | VILLA ROSA ingresso | 1/0 |

### 🔬 LABORATORIO / CENTRO RICERCHE (R318–R325)
(Edificio beige/crema con setup da laboratorio — per il Professore)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2544–2551 | Laboratorio beige — top | LAB PROFESSORE top | 1 BLOCCANTE |
| 2552–2559 | Laboratorio — mid (banconi) | LAB mid | 1 BLOCCANTE |
| 2560–2567 | Laboratorio — mid2 (schermo) | LAB mid con schermo | 1 BLOCCANTE |
| 2568–2575 | Laboratorio — mid3 | LAB mid3 | 1 BLOCCANTE |
| 2576–2583 | Laboratorio — mid4 | LAB mid4 | 1 BLOCCANTE |
| 2584–2591 | Laboratorio — mid5 | LAB mid5 | 1 BLOCCANTE |
| 2592–2599 | Laboratorio — bot | LAB base | 1/0 |
| 2600–2607 | Laboratorio — base finale | LAB base finale | 1 BLOCCANTE |

---

## PARTE 9 — PALESTRE E LEGA
### da gym.png (R343–R349, indici 2744–2799) e lega.png (R391–R398, indici 3128–3183)

### 🏋️ PALESTRA (GYM)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2744–2751 | Edificio ARANCIONE/DORATO grande — top | PALESTRA top (tetto dorato) | 1 BLOCCANTE |
| 2752–2759 | Palestra — R1 | PALESTRA mid top | 1 BLOCCANTE |
| 2760–2767 | Palestra — R2 (arco dorato) | PALESTRA con arco decorativo | 1 BLOCCANTE |
| 2768–2775 | Palestra — R3 (arco + insegna) | PALESTRA arco + insegna | 1 BLOCCANTE |
| 2776–2783 | Palestra — R4 grigio (base edificio) | PALESTRA base grigia con porta | 1/0 |
| 2784–2791 | Palestra — R5 (ingresso blu) | PALESTRA ingresso blu (PORTA GYM) | 0 TRIGGER BATTAGLIA |
| 2792–2799 | ❌ X rosse + palestra base | INVALIDI + base palestra | — |

**Porta palestra**: tile nella riga 2784–2791 che mostra l'ingresso blu = TRIGGER battaglia Capopalestra.

### 🏆 LEGA POKÉMON (indici 3128–3183)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 3120–3127 | Edificio grigio-verde grande — top (colonne) | LEGA top | 1 BLOCCANTE |
| 3128–3135 | Lega — mid top | LEGA mid | 1 BLOCCANTE |
| 3136–3143 | Lega — mid | LEGA mid2 | 1 BLOCCANTE |
| 3144–3151 | Lega — mid (finestre + porte laterali) | LEGA mid finestre | 1 BLOCCANTE |
| 3152–3159 | Lega — mid (portone centrale) | LEGA portone | 1/0 |
| 3160–3167 | Lega — mid bot | LEGA mid bot | 1 BLOCCANTE |
| 3168–3175 | Lega — bot (statua) | LEGA bot con statua | 1 BLOCCANTE |
| 3176–3183 | ❌ X rosse + lega base | INVALIDI + LEGA base | — |

---

## PARTE 10 — POKÉCENTER E POKÉMART
### da poke_center_e_poke_mart.png (R326–R334, indici 2608–2679)

### 🏥 POKÉMON CENTER
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2608–2615 | Edificio ROSSO (tetto) — top | POKÉCENTER top (tetto rosso) | 1 BLOCCANTE |
| 2616–2623 | PokéCenter — mid (tetto rosso) | POKÉCENTER mid | 1 BLOCCANTE |
| 2624–2631 | PokéCenter — mid2 (finestre + logo P.C.) | POKÉCENTER mid con logo | 1 BLOCCANTE |
| 2632–2639 | PokéCenter — bot (ingresso + logo P.C.) | POKÉCENTER ingresso | 1/0 TRIGGER CURA |
| 2640–2647 | PokéCenter — base | POKÉCENTER base | 1 BLOCCANTE |

**Porta PokéCenter**: tile in riga 2632–2639 con l'ingresso = TRIGGER cura team.

### 🛒 POKÉMART (due varianti)
| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 2648–2655 | Edificio BLU — top (Poké Mart grande) | POKÉMART BLU top | 1 BLOCCANTE |
| 2656–2663 | PokéMart blu — mid | POKÉMART BLU mid | 1 BLOCCANTE |
| 2664–2671 | PokéMart blu — bot (ingresso + logo MART) | POKÉMART BLU ingresso | 0 TRIGGER SHOP |
| 2672–2679 | PokéMart — base | POKÉMART base | 1 BLOCCANTE |

---

## PARTE 11 — TILESET PNG STANDALONE (senza numeri)
Questi file sono sprite singoli o piccoli set, da referenziare per NOME FILE.

### 🌊 ACQUA E RIVE
| File | Visivo | Uso | Collision |
|------|--------|-----|-----------|
| `Still_water.png` | Acqua blu con riva marrone in alto | Lago con riva N — tile singolo 2×3 | 3 ACQUA |
| `Sea.png` | Acqua blu con riva marrone (tipo arco) — riga multipla | MARE con riva N — più varianti | 3 ACQUA |
| `Sea_deep.png` | Acqua blu scuro profonda con archi riva | MARE PROFONDO / OCEANO | 3 ACQUA |
| `Sea_without_shore.png` | Acqua blu senza riva | MARE APERTO (nessuna riva) | 3 ACQUA |
| `Sand_shore.png` | Sabbia beige con bordo acqua blu | RIVA SABBIOSA — transizione sabbia→acqua | 0/3 |
| `Water_current_north.png` | Acqua blu con onde verso nord (frecce) | CORRENTE verso N (MN Surf trascinamento) | 3 ACQUA |
| `Water_current_south.png` | Acqua blu onde verso sud | CORRENTE verso S | 3 ACQUA |
| `Water_current_east.png` | Acqua blu onde verso est | CORRENTE verso E | 3 ACQUA |
| `Water_current_west.png` | Acqua blu onde verso ovest | CORRENTE verso O | 3 ACQUA |
| `Waterfall.png` | Acqua blu chiara con strisce bianche verticali | CASCATA (MN Cascata per salire) | 3 ACQUA |
| `Waterfall_crest.png` | Parte alta cascata | CIMA CASCATA | 3 |
| `Waterfall_bottom.png` | Parte bassa cascata con schiuma | BASE CASCATA | 3 |
| `Water_rock.png` | Rocce grigie su sfondo acqua blu (1×1 e 2×2) | ROCCE IN ACQUA — decorative | 1 BLOCCANTE |
| `Underwater.png` | Acqua blu chiara con piante subacquee | FONDALE (dopo MN Sub/Dive) | 3 SUB |
| `Underwater_dark.png` | Acqua blu scura fondo | FONDALE SCURO | 3 SUB |
| `Seaweed_light.png` | Alga verde chiara | ALGA (decor subacqueo) | 0 |
| `Seaweed_dark.png` | Alga verde scura | ALGA SCURA (decor subacqueo) | 0 |

### 🌿 VEGETAZIONE E TERRENO
| File | Visivo | Uso | Collision |
|------|--------|-----|-----------|
| `Light_grass.png` | Verde teal chiaro uniforme con piccolo rombo in alto | FILL ERBA CHIARA (tipo acqua teal) | 0 |
| `Dirt.png` | Sabbia beige con rombo in alto | FILL TERRA BATTUTA / SABBIA | 0 |
| `Gravel.png` | Grigio con puntini viola scuro | FILL GHIAIA / ASFALTO GREZZO | 0 |
| `Brick_path.png` | Piastrelle azzurre/grigie intrecciate | FILL MARCIAPIEDE / SENTIERO MATTONI | 0 |
| `White_path.png` | Piastrelle chiare | FILL SENTIERO BIANCO / PIAZZA | 0 |
| `Black.png` | Nero pieno | VUOTO / fuori mappa / sfondo notte | 1 |
| `Sand.png` | Beige sabbia chiara uniforme | FILL SABBIA SPIAGGIA | 0 |
| `Flowers1.png` | Fiori rossi su sfondo verde — riga di 4 varianti | FIORI ROSSI (decor erba) — 4 frames animati | 0 DECOR |
| `Flowers2.png` | Fiori rosso+bianco su verde — riga di 4 | FIORI MISTI (decor erba) — 4 frames | 0 DECOR |

### ❄️ NEVE E GHIACCIO
| File | Visivo | Uso | Collision |
|------|--------|-----|-----------|
| `Snow_cave_floor.png` | Azzurro chiarissimo con piccoli cristalli | PAVIMENTO GROTTA NEVE/GHIACCIO | 7 SCIVOLOSO |
| `Snow_cave_highlight.png` | Azzurro chiaro (stesso tono ma con evidenziazione) | PAVIMENTO GHIACCIO LUCIDO | 7 SCIVOLOSO |
| `Snow_cave_ice_border.png` | Azzurro con bordi ondulati | BORDO GHIACCIO in grotta | 1/7 |

### 🏺 FONTANE
| File | Visivo | Uso | Collision |
|------|--------|-----|-----------|
| `Fountain1.png` | Fontana blu con struttura — top visibile, base X | FONTANA versione 1 — 3 tile visibili (top + 2 mid) | 1 BLOCCANTE |
| `Fountain2.png` | Fontana blu variante — più piatta | FONTANA versione 2 — 3 tile visibili | 1 BLOCCANTE |

### 🏔️ GROTTE (cave fill per grotte)
| File | Visivo | Uso | Collision |
|------|--------|-----|-----------|
| `Brown_cave_floor.png` | Marrone caldo con texture rocciosa | PAVIMENTO GROTTA MARRONE (tipo Grotta Vulcano) | 0 |
| `Brown_cave_sand.png` | Marrone chiaro sabbioso | SABBIA IN GROTTA MARRONE | 0 |
| `Dirt_cave_highlight.png` | Terra marrone con evidenziazione | EVIDENZIAZIONE pavimento grotta terra | 0 |
| `Blue_cave_floor.png` | Blu scuro con texture roccia | PAVIMENTO GROTTA BLU | 0 |
| `Blue_cave_mud.png` | Blu con fango | FANGO IN GROTTA BLU | 0 |
| `White_cave_floor.png` | Grigio chiaro / bianco roccia | PAVIMENTO GROTTA BIANCA | 0 |
| `White_cave_highlight.png` | Grigio bianco con evidenziazione | EVIDENZIAZIONE grotta bianca | 0 |
| `Red_cave_floor.png` | Rosso/vulcanico con texture | PAVIMENTO GROTTA ROSSA (zona vulcanica!) | 0 |
| `Red_cave_highlight.png` | Rosso con evidenziazione | EVIDENZIAZIONE grotta rossa | 0 |
| `Green_cave_floor.png` | Verde muschio con texture | PAVIMENTO GROTTA VERDE (bosco/muschio) | 0 |

---

## PARTE 12 — OGGETTI INTERATTIVI
### da oggetti.png (R117–R130, indici 936–1039+)

| Indice | Visivo | Uso | Collision |
|--------|--------|-----|-----------|
| 936–943 | Rocce grigie grandi (varie) | ROCCE GRANDI — sfondo grigio | 1 BLOCCANTE |
| 944 | Moneta d'oro | OGGETTO raccoglibile (denaro) | 0 PICKUP |
| 945 | Sfera grigia | ROCCIA PICCOLA / PIETRA | 6 MN-ROCKSM ASH |
| 946 | Sfera bianca lucente | OGGETTO speciale / gemma | 0 PICKUP |
| 947 | Alberello verde piccolo | ALBERELLO (MN Taglio) | 4 MN-TAGLIO |
| 948 | Poké Ball (sfera rossa/bianca) | POKÉ BALL trovata nel mondo | 0 PICKUP |
| 949 | PC / computer schermo blu | PC POKEMON (gestione box) | 1 INTERACT |
| 950 | Zaino / bag | OGGETTO zaino | 0 PICKUP |
| 951 | ❌ X rossa | INVALIDO | — |
| 952 | Distributore automatico | DISTRIBUTORE (tipo negozio) | 1 INTERACT |
| 953 | Distributore variante | DISTRIBUTORE variante | 1 INTERACT |
| 954 | Distributore variante | DISTRIBUTORE | 1 INTERACT |
| 955 | Roccia rossa con macchie | ROCCIA VULCANICA decorativa | 1 BLOCCANTE |
| 956 | Fiori decorativi misti | FIORI decorativi | 0 DECOR |
| 957 | Sfera / globo | OGGETTO globo / mappa | 1 INTERACT |
| 958 | Macchina / apparecchio | APPARECCHIO MEDICO (guaritore?) | 1 INTERACT |
| 959 | Monitor / schermo | COMPUTER SCHERMO | 1 INTERACT |
| 960–967 | Scaffali / librerie | SCAFFALI (decor interno) | 1 BLOCCANTE |
| 968–975 | Tavoli / scrivanie | TAVOLI (decor interno) | 1 BLOCCANTE |
| 976 | Moneta grossa d'oro | OGGETTO moneta | 0 PICKUP |
| 977 | Sfera dorata | OGGETTO sfera dorata / gemma | 0 PICKUP |
| 978 | Piramide / montagna | OGGETTO decorativo | 0 |
| 979 | Foglio scritto | OGGETTO nota / lettera | 0 PICKUP |
| 980 | Personaggio su bici | BICI (oggetto ottenibile) | 0 PICKUP |
| 981 | Armatura robot | GOLEM / STATUA | 1 BLOCCANTE |
| 982 | Segnale/indicatore | SEGNALE decorativo | 1 |
| 983 | Porta singola grigia | PORTA interna | 0 TRIGGER |
| 984–991 | Casse colorate (verdi, marroni) | CASSE (MN Forza / decor) | 5 MN-FORZA |
| 992–999 | Macchinari vari | MACCHINARI industriali | 1 BLOCCANTE |
| 1000–1007 | Struttura gialla grande | STRUTTURA GIALLA (edificio/decor grande) | 1 BLOCCANTE |
| 1008–1015 | Struttura grigia rettangolare | STRUTTURA GRIGIA | 1 BLOCCANTE |
| 1016–1023 | Oggetti vari (pompe, lampade) | DECOR vari interni | 1 BLOCCANTE |
| 1024–1031 | Oggetti vari (sfere, robot) | DECOR / INTERACTABLE | 1/0 |
| 1032–1039 | ❌ X rosse + oggetti | INVALIDI + oggetti | — |

---

## RIEPILOGO RAPIDO — INDICI CHIAVE DA USARE

### Per costruire le CITTÀ:
- **Erba**: indici 1–14 (usa 8–14 come base)
- **Terra/sentiero**: indici 96–151 (con bordi 112–151)
- **Asfalto/marciapiede**: indici 392–415
- **Mattoni/piazza**: file `Brick_path.png`, `White_path.png`
- **Casa piccola**: indici 1336–1359 (casa verde) o 2344–2399 (case finestre blu)
- **Palazzo grande**: indici 1712–1783 (giallo) o 2400–2439 (mattoni)
- **Villa/Laboratorio Prof.**: indici 2448–2607
- **Palestra**: indici 2744–2799 (porta = riga 2784–2791)
- **PokéCenter**: indici 2608–2647 (porta = riga 2632–2639)
- **PokéMart**: indici 2648–2679 (porta = riga 2664–2671)
- **Lega Pokémon**: indici 3120–3183
- **Siepe/recinzione**: indici 656–679
- **Ringhiera**: indici 1264–1335
- **Fontana piazza**: file `Fountain1.png` o `Fountain2.png`
- **Fiori decorativi**: file `Flowers1.png`, `Flowers2.png`

### Per costruire NATURA / PERCORSI:
- **Alberi verdi**: indici 416–439 (3×3 tile per albero completo)
- **Alberi gialli (autunno)**: indici 520–559
- **Alberi su acqua**: indici 440–463, 568–615
- **Alberello MN Taglio**: indice 947 o 466
- **Roccia MN Forza**: indici 1112–1115 o 984–991
- **Erba secca/gialla**: indici 832–847
- **Scarpata/collina**: indici 208–263

### Per costruire ACQUA:
- **Lago standard**: indici 688–727 (con rive)
- **Mare/oceano**: file `Sea.png`, `Sea_deep.png`
- **Correnti Surf**: file `Water_current_*.png`
- **Cascata**: file `Waterfall.png`, `Waterfall_crest.png`, `Waterfall_bottom.png`
- **Rocce in acqua**: file `Water_rock.png`
- **Sub/Dive**: file `Underwater.png`, `Underwater_dark.png`

### Per costruire GROTTE:
- **Pavimento Grotta Vulcano**: file `Red_cave_floor.png` + `Red_cave_highlight.png`
- **Pavimento grotta standard**: file `Brown_cave_floor.png`
- **Neve/ghiaccio grotta**: file `Snow_cave_floor.png`, `Snow_cave_ice_border.png`
- **Rocce pareti**: indici 784–831

### Per costruire NEVE (Rocca di Papa / Monte Cavo):
- **Pavimento neve**: indici 264–319
- **Ghiaccio scivoloso**: indici 304–319 (collision type 7)
- **Grotta neve**: file `Snow_cave_floor.png`

---

## NOTE FINALI PER CLAUDE CODE

1. **I tile con ❌ (X rossa) NON ESISTONO** — non usarli mai. Sono slot vuoti nel tileset.

2. **Gli indici si basano su tileset-outside.png a 8 colonne per riga**:
   indice = riga × 8 + colonna (da 0 a 7)

3. **I file PNG standalone** (Dirt.png, Flowers1.png, ecc.) sono sprite separati —
   vanno caricati come immagini indipendenti, non come slice del tileset numerato.

4. **Le rive dell'acqua** (indici 690–727) sono la transizione terra→acqua.
   Il player cammina SULLA riva (collision 0), ma NON sull'acqua (collision 3).

5. **Gli alberi occupano più tile**: un albero verde standard occupa 3 colonne × 3 righe
   (top: 416-418, mid: 424-426, bot: 432-434). Tutti BLOCCANTI tranne il tile terra sotto.

6. **Il SUB (Dive)** usa i file `Underwater.png` — zone separate dal normale Surf.
   Surf = navigazione in superficie. Sub = immersione sul fondale.

7. **Non inventare indici**. Se hai dubbi su un tile, chiedi all'utente.
