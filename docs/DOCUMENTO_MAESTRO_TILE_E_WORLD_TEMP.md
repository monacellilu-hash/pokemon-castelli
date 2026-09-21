DOCUMENTO_MAESTRO_TILE_E_WORLD.md


# DOCUMENTO MAESTRO — Pokémon Castelli Romani
# PARTE A: mappatura tile (numeri di tile per ogni elemento)
# PARTE B: world design (scelte creative dell'utente)
#
# LEGENDA STATO:
#   ✅ = compilato (da map.js o dizionario verificato)
#   📁 = usa file PNG standalone (non tile numerato)
#   🔍 = da verificare nel tileset viewer
#   💬 = dato dall'utente, confermato
#   ❓ = non esiste come tile separato / usa alternativa indicata
# QUANDO USO VUOTO USA UN FILLER CHE STAI USANDO NELLA ZONA 
#
# TILESET DI RIFERIMENTO: sprites/Tiles per claude/tileset-outside.png
# Tile 32×32 px, 8 tile per riga.
# Indice N = riga floor(N/8), colonna N%8
# I file PNG standalone si usano per nome, non per indice.
 
# ════════════════════════════════════════════════════
# PARTE A — MAPPATURA TILE
# ════════════════════════════════════════════════════
 
# ─────────────────────────────────────────
# A1 — ERBA BASSA (terreno verde calpestabile, no incontri)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente e confermati dal dizionario.
# NOTA sugli angoli INTERNI: sono le "rientranze" concave (es. un angolo di erba
# che sbuca in un'area di terra). Nel tileset non esistono come tile dedicati —
# si usano gli angoli esterni corrispondenti nell'ordine inverso. Vedi note in codice.
 
Erba bassa - riempimento (fill) principale: 1
Erba bassa - variante 2: 2
Erba bassa - variante 3: 3
Erba bassa - variante 4: 4
Erba bassa - variante 5: 5
Erba bassa - variante 6: 31
Erba bassa - bordo NORD: 42
Erba bassa - bordo SUD: 58
Erba bassa - bordo EST: 51
Erba bassa - bordo OVEST: 49
Erba bassa - angolo NORD-EST (esterno): 43
Erba bassa - angolo NORD-OVEST (esterno): 41
Erba bassa - angolo SUD-EST (esterno): 59
Erba bassa - angolo SUD-OVEST (esterno): 57
Erba bassa - angolo interno NORD-EST:  (usa angolo SO esterno = 57 invertito)
Erba bassa - angolo interno NORD-OVEST:  (usa angolo SE esterno = 59 invertito)
Erba bassa - angolo interno SUD-EST:  (usa angolo NO esterno = 41 invertito)
Erba bassa - angolo interno SUD-OVEST:  (usa angolo NE esterno = 43 invertito)
 
# ─────────────────────────────────────────
# A2 — ERSA ALTA (zona incontri Pokémon)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente. Tile 6 confermato dal dizionario:
# "ERBA ALTA PER POKEMON SELVATICI". L'erba alta è un tile singolo
# sovrapposto all'erba base — non ha bordi/angoli separati.
 
Erba alta - riempimento centro: 6
Erba alta - (tutti i bordi e angoli): 6
# NOTA: L'erba alta si applica come layer sopra l'erba bassa.
# Non servono varianti di bordo — il engine gestisce la transizione automaticamente.
 
# ─────────────────────────────────────────
# A3 — TERRA BATTUTA / SENTIERO CAMPAGNA
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente, confermati dal dizionario (range 96-175).
# NOTA sugli angoli interni: stessa logica A1 — non esistono come tile separati.
 
Terra - riempimento centro: 162
Terra - variante 2: 163
Terra - bordo NORD (erba sopra, terra sotto): 154
Terra - bordo SUD: 170
Terra - bordo EST: 163
Terra - bordo OVEST: 161
Terra - angolo NORD-EST (esterno): 155
Terra - angolo NORD-OVEST (esterno): 153
Terra - angolo SUD-EST (esterno): 171
Terra - angolo SUD-OVEST (esterno): 169
Terra - angolo interno NORD-EST:  (vedi nota A1)
Terra - angolo interno NORD-OVEST:  (vedi nota A1)
Terra - angolo interno SUD-EST:  (vedi nota A1)
Terra - angolo interno SUD-OVEST:  (vedi nota A1)
 
# ─────────────────────────────────────────
# A4 — STRADA ASFALTO (città)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente — COMPLETO con due varianti colore.
 
# VARIANTE 1 (asfalto standard grigio):
Strada asfalto - riempimento centro: 337
Strada asfalto - bordo NORD (asfalto sotto, erba sopra): 329
Strada asfalto - bordo SUD: 345
Strada asfalto - bordo EST: 338
Strada asfalto - bordo OVEST: 336
Strada asfalto - angolo NORD-EST: 330
Strada asfalto - angolo NORD-OVEST: 328
Strada asfalto - angolo SUD-EST: 346
Strada asfalto - angolo SUD-OVEST: 344
 
# VARIANTE 2 (asfalto più chiaro, per non usare sempre lo stesso):
Strada asfalto v2 - riempimento: 401
Strada asfalto v2 - bordo NORD: 393
Strada asfalto v2 - bordo SUD: 409
Strada asfalto v2 - bordo EST: 402
Strada asfalto v2 - bordo OVEST: 400
Strada asfalto v2 - angolo NORD-EST: 394
Strada asfalto v2 - angolo NORD-OVEST: 392
Strada asfalto v2 - angolo SUD-EST: 410
Strada asfalto v2 - angolo SUD-OVEST: 408
 
# INCROCI (usare in coppia nella stessa riga):
Strada - incrocio a T verso nord: 395 + 396 (in quest'ordine)
Strada - incrocio a T verso sud: 403 + 404
Strada - incrocio a T verso est: 396 + 404
Strada - incrocio a T verso ovest: 395 + 403
Strada - incrocio a 4 vie: 395, 396, 403, 404
 
# ─────────────────────────────────────────
# A5 — MARCIAPIEDE
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente.
 
Marciapiede - riempimento: 406
Marciapiede - bordo verso strada: 405
Marciapiede - bordo verso edificio: 407
Marciapiede - angolo: 413
 
# ─────────────────────────────────────────
# A6 — PIAZZA / PAVIMENTO MATTONI
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente.
 
Piazza mattoni - riempimento: 369
Piazza mattoni - bordo NORD: 361
Piazza mattoni - bordo SUD: 377
Piazza mattoni - bordo EST: 370
Piazza mattoni - bordo OVEST: 368
Piazza mattoni - angolo NORD-EST: 362
Piazza mattoni - angolo NORD-OVEST: 360
Piazza mattoni - angolo SUD-EST: 378
Piazza mattoni - angolo SUD-OVEST: 376
 
# ─────────────────────────────────────────
# A7 — ACQUA (laghi)
# TILESET: tileset-outside.png + file PNG standalone
# ─────────────────────────────────────────
# 💬 Dati inseriti dall'utente (confermati parzialmente dal dizionario).
# NOTA: Le rive SUD, est e ovest seguono la logica dell'utente:
# sotto l'acqua si mette il tile di transizione più il materiale dell'area (sabbia/erba).
 
Acqua - riempimento centro: 52
Acqua - animata frame 1: 85
Acqua - animata frame 2: 73
Acqua - riva NORD (erba sopra, acqua sotto): 705
Acqua - riva SUD: 913 (poi tile spiaggia sotto)
Acqua - riva EST: 161 (dipende dall'area, poi tile materiale area)
Acqua - riva OVEST: 163 (dipende dall'area)
Acqua - angolo riva NORD-EST: 706
Acqua - angolo riva NORD-OVEST: 704
Acqua - angolo riva SUD-EST: ❓ (tile acqua + bordo area sotto, vedi logica utente)
Acqua - angolo riva SUD-OVEST: ❓ (tile acqua + bordo area sotto)
Acqua - angolo interno riva NORD-EST: 690
Acqua - angolo interno riva NORD-OVEST: 688
Acqua - angolo interno riva SUD-EST: ❓ (tile acqua + bordo area, vedi logica utente)
Acqua - angolo interno riva SUD-OVEST: ❓ (tile acqua + bordo area)
Acqua profonda (per Sub/Dive): 691
 
 
# ─────────────────────────────────────────
# A8 — PONTI
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# 💬 Dato dall'utente. Il ponte si percorre da SUD verso NORD.
# NOTA: i bordi del ponte sono gli estremi della sequenza (dove i numeri saltano).
 
Ponte verticale: — arrivo (lato nord): 1200, 1201, 1202, 1203, 1204
Ponte verticale: — sezione centrale (ripetibile): 1208, 1209, 1210, 1211, 1212
Ponte verticale: — sezione centrale 2(ripetibile): 1216, 1217, 1218, 1219, 1220
Ponte verticale: — imbocco (lato sud): 1224, 1225, 1226, 1227, 1228
# NOTA: i tile ai margini (estremi sinistro e destro di ogni riga) = bordi laterali del ponte.
 
Ponte orizzontale: 1240 1241 1242, 1248 1249 1250, 1256 1257 1258
Ponticello legno sentiero: 1232 - 1233 - 1234
 
# ─────────────────────────────────────────
# A9 — ALBERO 1 (verde scuro standard, 3×3 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto direttamente da map.js (template TREE, confermato dal dizionario).
# non ha centro è un albero a due tile x3 in verticlae
Albero1 - chioma alto-sinistra: 416
Albero1 - chioma alto-destra: 418
Albero1 - tronco medio-sinistra: 424
Albero1 - tronco medio-destra: 426
Albero1 - base basso-sinistra: 432
Albero1 - base basso-destra: 434
# Tutti BLOCCANTI (collision 1).
 
# ─────────────────────────────────────────
# A10 — ALBERO 2 (verde acqua/teal, per zone lacustri, 3×3)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario verificato (range 560-583 = ALBERI TEAL).
# Riga 70 (560-567) = top | Riga 71 (568-575) = mid | Riga 72 (576-583) = base
 
Albero2 - chioma alto-sinistra: 560
Albero2 - chioma alto-centro: 561
Albero2 - chioma alto-destra: 562
Albero2 - tronco medio-sinistra: 568
Albero2 - tronco medio-centro: 569
Albero2 - tronco medio-destra: 570
Albero2 - base basso-sinistra: 576
Albero2 - base basso-centro: 577
Albero2 - base basso-destra: 578
# Tutti BLOCCANTI. Usa questo albero vicino ai laghi (Lago Albano, Lago Nemi).
 
# ─────────────────────────────────────────
# A11 — ALBERO 3 (giallo/autunno, per percorsi secchi/montagna, 3×3)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (range 520-543 = ALBERI GIALLI).
# Riga 65 (520-527) = top | Riga 66 (528-535) = mid | Riga 67 (536-543) = base
Albero3 - chioma alto-alto punta: 513
Albero3 - chioma alto-sinistra: 520
Albero3 - chioma alto-centro: 521
Albero3 - chioma alto-destra: 522
Albero3 - tronco medio-sinistra: 528
Albero3 - tronco medio-centro: 529
Albero3 - tronco medio-destra: 530
Albero3 - base basso-sinistra: 552
Albero3 - base basso-centro: 553
Albero3 - base basso-destra: 554
# Tutti BLOCCANTI. Usa sui percorsi montagna e Rocca di Papa.
 
# ─────────────────────────────────────────
# A12 — VEGETAZIONE VARIA
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (range siepi 656-687).
 
Cespuglio piccolo (calpestabile): 🔍 DA VERIFICARE (potrebbe non esistere come tile singolo)
Cespuglio grande (bloccante): 660 (rotondo) oppure 661
Siepe - riempimento orizzontale: 686
Siepe - riempimento verticale: 676
 
Siepe - cespuglio grande top-left: 669
Siepe - cespuglio grande top-right: 670
Siepe - cespuglio grande bot-left: 677
Siepe - cespuglio grande bot-right: 678
Siepe - bordo bot: 684
Siepe - bordo top 668: 684
Alberello MN TAGLIO (pre-taglio, bloccante): 947
# oppure: 947 (verifica nel viewer quale sembra più giusto)
Ceppo dopo il taglio (passabile): 608
 
# ─────────────────────────────────────────
# A13 — FIORI E DECORI ERBA
# FILE PNG standalone + tile
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario.
 
Fiori rossi (decoro su erba): 📁 Flowers1.png
Fiori misti rosso+bianco: 📁 Flowers2.png
Fiori bianchi piccoli su erba: 30 (tile "verde con fiori bianchi" dal dizionario)
Fiori/decoro generico: 956 (tile "fiori decorativi misti" dal dizionario)
 
# ─────────────────────────────────────────
# A14 — ROCCE E MASSI
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario.
 
Masso grande MN FORZA : 945
# collision type 5 = MN-FORZA
Roccia piccola MN ROCKSM ASH (rompibile): 944
# oppure 1120 (verifica nel viewer) — collision type 6
Roccia decorativa (non interattiva 2 righex1 colonna): 1136,1144 o 1137 1145 
 
# PARETE ROCCIA / SCARPATA (zona montagna grigia): CAMMINABILE
Parete roccia - riempimento: 218
Parete roccia - bordo NORD (roccia sotto, erba sopra): 210
Parete roccia - bordo EST: 219
Parete roccia - bordo OVEST: 217
Parete roccia - angolo NORD-EST: 209
Parete roccia - angolo NORD-OVEST: 211
Parete roccia - bordo SUD: 226
Parete roccia - angoli SUD-EST: 227
Parete roccia - angoli SUD-OVEST: 225
 
 
 
# ─────────────────────────────────────────
# A15 — NEVE E GHIACCIO
# TILESET: snow cave floor.png  + caves.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (range 264-327 = NEVE/GHIACCIO).
 
Neve - riempimento (calpestabile): 7
Neve - bordo verso erba/roccia: 0
# (range 272-295 = bordi e angoli neve→roccia/erba — da verificare le direzioni esatte)
Neve - bordi e angoli completi: 3-4-5 6-7-8 9-10-11
Ghiaccio scivoloso - riempimento: 944 caves.png
# collision type 7 = scivoloso
Ghiaccio - bordi: usa rocce, tipo 965 982
Cumulo neve decorativo: 983
 
Parte rialzata dentro la grotta ghiaccio: 912-913-914,920-921-922,928-929-930
 
# FILE PNG per grotte neve/ghiaccio:
Pavimento grotta ghiaccio: 📁 Snow cave floor.png (collision 7 scivoloso)
Pavimento ghiaccio lucido: 📁 Snow cave highlight.png
Bordo ghiaccio grotta: 📁 Snow cave ice border.png
 
# ─────────────────────────────────────────
# A16 — SABBIA / SPIAGGIA
# TILESET: tileset-outside.png + file PNG
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario.
# NOTA: "Sabbia" (spiaggia, lungo le rive) è diversa da "Terra" (A3, sentieri).
 
Sabbia - riempimento: 📁 Sand.png (oppure tile 328 dal tileset)
Sabbia - bordo verso acqua: 📁 Sand shore.png
Sabbia - bordi e angoli verso erba: 📁 Sand.png rappresenta un quadrato e ai bordi c'è l'erba.
 
 
# ─────────────────────────────────────────
# A17 — CASA PICCOLA TETTO VERDE (5x4 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto da map.js (template CASA) + confermato dal dizionario.
 
Dimensione: 5 tile larga × 4 tile alta
Riga tetto (riga 0): 1336, 1337, 1338, 1339,1340
Riga tetto continuo (riga 1): 1344, 1345, 1346, 1347,1348
Riga muro e finestra (riga 2): 1352, 1353, 1354, 1355,1356
Riga base con porta (riga 3): 1360,1361,1362(porta),1363,1364
Porta: tile 1362 (collision 0 = passabile, trigger entrata)
 
# ─────────────────────────────────────────
# A18 — CASA PICCOLA TETTO BLU (5x4 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (range 1368-1391 = CASA BLU).
 
 
Dimensione: 4 tile larga × 3 tile alta
Riga tetto (riga 0): 1368, 1369, 1370, 1371,1372
Riga tetto continuo (riga 1): 1376, 1377, 1378, 1379,1380
Riga muro e finestra (riga 2): 1384, 1385, 1386, 1387,1388
Riga base con porta (riga 2): 1392, 1393, 1394 (porta), 1395,1396
Porta: 1394 (collision 0 = passabile, trigger entrata)
 
# ─────────────────────────────────────────
# A19 — CASA TETTO GRIGIA (5X4)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ⚠️ Nel dizionario è documentato solo il tetto (1360-1367).
# Mid e base non identificati con certezza.
 
Riga tetto: 1432 Fino a 1436 
Riga tetto: 1440 Fino a 1444
Riga muro: 1448 Fino a 1452
Riga base (porta): 1456 Fino a 1460
Porta: 1457
 
# ─────────────────────────────────────────
# A20 — PALAZZO GRANDE (due varianti disponibili)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario. Disponibili due tipi:
 
## VARIANTE A — PALAZZO GIALLO (5×5, per edifici importanti tipo Lega/Abbazia)
Dimensione: 8 tile largo × 5 tile alto
Riga 1 (tetto dorato):  1713, 1714, 1715, 1716, 1717, 
Riga 2:  1721, 1722, 1723, 1724, 1725
Riga 3:  1729, 1730, 1731, 1732, 1733
Riga 4:  1737, 1738, 1739, 1740, 1741
Riga 5 (base):  1745, 1746, 1747, 1748, 1749
Porta: No porta, palazzo senza ingresso qusto
 
## VARIANTE B ma più di prestigio quindi ce ne sono di meno — villa MATTONI ROSSI (7×5, ultimo pezzo 6) - museo o scuole o ville
Dimensione: 7 tile largo × 6 ultimo pezzo
Riga 1 (tetto mattoni): 2400, 2401, 2402, 2403, 2404, 2405, 2406
Riga 2 (archi): 2408, 2409, 2410, 2411, 2412, 2413, 2414
Riga 3: 2416, 2417, 2418, 2419, 2420, 2421, 2422
Riga 4 (entrata): 2424, 2425, 2426, 2427, 2428, 2429, 2430
Riga 5 (base): 2432, 2433, 2434, 2435, 2436, 2437, 2438
Porta su 3 tile parte da tile al centro di riga 4 : 2426 2427 2428 
Porta su 3 tile parte da tile al centro di riga 4 : 2434 2435 2436  (collision 0, si può entrare)
Porta su 3 tile parte da tile al centro di riga 4 : 2442 2443 2444  (collision 0, si può entrare)
 
## VARIANTE c — PALAZZO VERDE (5×5, per edifici importanti tipo Lega/Abbazia)
Dimensione: 8 tile largo × 5 tile alto
Riga 1 (tetto dorato):  2328 FINO A 2332
Riga 2:  2336 FINO A 2340
Riga 3:  2344 FINO A 2348
Riga 4:  2352 FINO A 2356
Riga 5 (base)ATTENZIONE QUI RISPETTA ANCHE SE NON HA SENSO:  2392 2394 2397,2398(PORTA) 2399
Porta: 2398
 
# ─────────────────────────────────────────
# A21 — POKÉMON CENTER (tetto rosso, 4×5 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto da map.js (template PC) + confermato dal dizionario.
 
Dimensione: 5 tile larga × 5 tile alta
Riga 1 (tetto rosso): 2608,2609,2610, 2611, 2612
Riga 2: 2616,2617,2618, 2619, 2620
Riga 3 (): 2624,2625,2626, 2627, 2628
Riga 4 (finestre + logo P.C.): 2632,2633,2634, 2635, 2636
Riga 5 (base): 2640,2641,2642, 2643, 2644
 
Porta (trigger cura team): tile 2642 (riga 5, collision 0)
 
# ─────────────────────────────────────────
# A22 — POKÉMART (negozio, 4×4 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto da map.js (template MART) + confermato dal dizionario.
 
Dimensione: 4 tile larga × 4 tile alta
Riga 1 (tetto blu): 2648, 2649, 2650, 2651
Riga 2: 2656, 2657, 2658, 2659
Riga 3 (ingresso + logo MART): 2664, 2665, 2666, 2667
Riga 4 (base): 2672, 2673, 2674, 2675
Porta (trigger shop): 2674 (riga 3, collision 0)
 
# ─────────────────────────────────────────
# A23 — PALESTRA (edificio gym, 8×6 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto da map.js (template GYM) + confermato dal dizionario.
# Aspetto: edificio arancione/dorato grande con arco decorativo.
 
Dimensione: 7 tile larga × 6 tile alta
Riga 1 (tetto dorato): 2744, 2745, 2746, 2747, 2748, 2749, 2750
Riga 2: 2752, 2753, 2754, 2755, 2756, 2757, 2758
Riga 3 (arco dorato): 2760, 2761, 2762, 2763, 2764, 2765, 2766
Riga 4 (arco + insegna): 2768, 2769, 2770, 2771, 2772, 2773, 2774
Riga 5 (base grigia): 2776, 2777, 2778, 2779, 2780, 2781, 2782
Riga 6 (ingresso blu): 2784, 2785, 2786, 2787, 2788, 2789, 2790
Porta (trigger battaglia capopalestra): tile 2787 (riga 6, collision 0)
RIGA 7 DEVI LASCIARE 2 TILE VUOTI POI 2794 VUOTO 2796 VUOTO VUOTO
 
# ─────────────────────────────────────────
# A24 — LEGA POKÉMON (edificio Colonna, 8×8 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto da map.js (template LEGA) + confermato dal dizionario.
# Aspetto: edificio grigio-verde monumentale con colonne.
 
Dimensione: 8 tile larga × 8 tile alta
Riga 1: 3128, 3129, 3130, 3131, 3132, 3133, 3134, 3135
Riga 2: 3136, 3137, 3138, 3139, 3140, 3141, 3142, 3143
Riga 3 (finestre + porte laterali): 3144, 3145, 3146, 3147, 3148, 3149, 3150, 3151
Riga 4 (portone centrale): 3152, 3153, 3154, 3155, 3156, 3157, 3158, 3159
Riga 5: 3160, 3161, 3162, 3163, 3164, 3165, 3166, 3167
Riga 6 (statua): 3168, 3169, 3170, 3171, 3172, 3173, 3174, 3175
Riga 7 (base): 3176, 3177, 3178, 3179, 3180, 3181, 3182, 3183
rIGA 8: VUOTO VUOTO VUOTO 3187 3188 3189 VUOTO VUOTO
Porta: tile 3172 (riga 8, collision 0)
 
# ─────────────────────────────────────────
# A25 — VILLA ALDOBRANDINI / LABORATORIO PROFESSORE (7×6 tile)
# TILESET: tileset-outside.png
# ─────────────────────────────────────────
# ✅ Estratto da map.js (template LAB) + confermato dal dizionario.
# Aspetto: villa rosa con colonne — perfetta per Villa Aldobrandini e Lab Prof. Castagno.
VILLA ALDOBRANDINI
Dimensione: 7 tile larga × 6 tile alta
Riga 1 (top, colonne rosa): 2448, 2449, 2450, 2451, 2452, 2453, 2454
Riga 2: 2456, 2457, 2458, 2459, 2460, 2461, 2462
Riga 3: 2464, 2465, 2466, 2467, 2468, 2469, 2470
Riga 4: 2472, 2473, 2474, 2475, 2476, 2477, 2478
Riga 5 (finestre): 2480, 2481, 2482, 2483, 2484, 2485, 2486
Riga 6 (portone): 2488, 2489, 2490, 2491, 2492, 2493, 2494
Porta in 2 righe- riga 1 : tile 2498 e 2499 e 2500 (riga 7, collision 0)
Porta in 2 righe- riga 2 : tile 2506 e 2507 e 2508 (riga 8, collision 0)
il resto delle caselle nella riga di porta mettici erba base.
 
LAB PROFESSORE
Dimensione: 8 tile larga × 5 tile alta
DA 3088 A 3127. PORTA IN 3123 ALLA BASE COLLISION 0 RIGA 5.
 
# ─────────────────────────────────────────
# A26 — EDIFICI SPECIALI A TEMA (landmark)
# ─────────────────────────────────────────
# ✅ Proposta basata sugli edifici disponibili. L'utente può ridefinire.
 
Villa Aldobrandini (Frascati):
  → Usa template LAB/VILLA ROSA (A25): tile 2448-2495
  → È la stessa sagoma del laboratorio, ma visivamente è una villa colonnata
 
Abbazia San Nilo (Grottaferrata):
  → Usa VILLA MATTONI ROSSI (A20 variante B): tile 2400-2439
  → Aspetto: mattoni rossi con archi, perfetto per abbazia medievale
 
Osservatorio (Monte Porzio Catone):
  → Usa  edificio specifico: 7X4: 2544 FINO A 2550, 2552 FINO A 2558, 2560 FINO A 2566, 2568 FINO A 2574 PORTA IN 2571 COLLISION 0 RIGA 4
 
Palazzo Chigi (Ariccia):
  → Usa PALAZZO GIALLO (A20 variante A) SOLO CHE LA PORTA è IN 1747 MA VA SOSTITUITO CON 1779
  → Aspetto: palazzo monumentale dorato
 
# ─────────────────────────────────────────
# A27 — ARREDO URBANO
# TILESET: tileset-outside.png + file PNG
# ─────────────────────────────────────────
# ✅ Parzialmente estratto dal dizionario.
 
Lampione (base):  1040 1041
Lampione (mid): 1032
Lampione (parte alta):  1024 1025
Cartello/segnale stradale: 952
Fontana (piccola): 📁 Fountain1.png
Fontana (grande/variante): 📁 Fountain2.png
Statua/monumento: 966-974 2x1 (toro/statua bianca)
Recinzione orizzontale (ringhiera): 1296 
Recinzione verticale (ringhiera): 1288
Recinzione angolo: 1283
Cancello: combo di 2 tile prima 1307 e poi 1306 mi raccomando
 
 
# ─────────────────────────────────────────
# A28 — OGGETTI RACCOGLIBILI (sul terreno)
# TILESET: tileset-outside.png pokecenter interior.png
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (range 936-1039 = oggetti interattivi).
 
Poké Ball per terra (raccoglibile): 948
Sfera/oggetto lucente (gemma): 946
Moneta d'oro: 977 (oppure 976)
Zaino/oggetto generico: 948
Oggetto PC/computer (box Pokémon): 254,262,270 1x3
 
# ─────────────────────────────────────────
# A29 — SCALE E DISLIVELLI
# TILESET: tileset-outside.png + caves.png per le scale dungeon
# ─────────────────────────────────────────
# 🔍 Non trovato con certezza nel dizionario — da verificare nel viewer.
# Potrebbero essere negli "ARCHI ANTICHI" (744-767) o in un'altra sezione.
 
Scala su: quelle dentro casa 1226
Scala giù: 1202
Gradino/scalino singolo: 🔍 DA VERIFICARE
Scala su - dungeon e grotta: 156-164 sono 2 tile impilati 
Scala giù -dungeon e grotta: 157
Gradino/scalino singolo: 🔍 DA VERIFICARE
 
# ─────────────────────────────────────────
# A30 — PAVIMENTI GROTTA/DUNGEON (file PNG standalone)
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (file PNG separati per ogni tipo di grotta).
 
Grotta del Vulcano (pavimento rosso-vulcanico): 📁 Red cave floor.png
Grotta del Vulcano (evidenziazione): 📁 Red cave highlight.png
Grotta entrata standard (marrone): 📁 Brown cave floor.png
Grotta entrata (sabbia marrone): 📁 Brown cave sand.png
Grotta ghiaccio (Rocca di Papa): 📁 Snow cave floor.png
Grotta ghiaccio (evidenziazione): 📁 Snow cave highlight.png
Bosco Tuscolo (verde muschio): 📁 Green cave floor.png
Rovine Tuscolo (pietra/grigio): 📁 White cave floor.png
Rovine Tuscolo (evidenziazione): 📁 White cave highlight.png
Parete grotta (roccia marrone, bloccante): range 784-807 (tileset-outside.png)
Parete grotta - fill roccia principale: 784
Parete grotta - bordi e angoli: 808-831 (range da verificare le direzioni)
Entrata grotta (apertura nera): 0 (tile nero pieno) oppure 800-807 (roccia+nero)
 
# ─────────────────────────────────────────
# A31 — INTERNI (file PNG da usare per ogni tipo)
# FILE PNG standalone dalla cartella Tiles per claude
# ─────────────────────────────────────────
# ✅ Estratto dal dizionario (tutti i file di interni presenti nella cartella).
 
Casa NPC normale: 📁 Interior general.png
Palestra interno: 📁 Gyms interior.png
PokéCenter interno: 📁 Poke Centre interior.png
PokéMart interno: 📁 Mart interior.png
Villa Aldobrandini / Laboratorio Prof.: 📁 Mansion interior.png
Abbazia interno: 📁 Ruins interior.png
Osservatorio interno: 📁 Museum interior.png (o Department store interior.png)
Fraschetta interno: 📁 Interior general.png (versione calda/rustica)
Covo Team GdF interno: 📁 Factory interior.png
Bunkerino CoTrAL interno: 📁 Underground path.png
Palazzo Chigi interno: 📁 Mansion interior.png
Lega Pokémon interno (corridoi): 📁 Trainer Tower interior.png
Angolo di Gioco / sala scommesse: 📁 Game Corner interior.png
 
# ─────────────────────────────────────────
# A32 — VUOTO / FUORI MAPPA
# ─────────────────────────────────────────
# 💬 Dato dall'utente. Confermato: tile 0 = nero pieno.
 
Tile nero/vuoto (bordo mappa): 731
# oppure tile 0 (stesso effetto — entrambi neri)
 
# ════════════════════════════════════════════════════
# RIEPILOGO STATO PARTE A
# ════════════════════════════════════════════════════
#
# ✅ COMPLETO: A1, A2, A3, A4, A5, A6, A7 (parziale), A8 (parziale),
#              A9, A10, A11, A12 (parziale), A13, A14 (parziale),
#              A15 (parziale), A16, A17, A18 (da confermare),
#              A19 (da completare), A20, A21, A22, A23, A24, A25,
#              A26, A27 (parziale), A28, A30, A31, A32
#
# 🔍 DA VERIFICARE NEL VIEWER:
#    - A12: cespuglio piccolo calpestabile
#    - A14: bordi/angoli SUD della parete roccia, porta palazzo A20
#    - A15: bordi/angoli specifici neve, cumulo neve decorativo
#    - A18: confermare i 4 tile esatti della casa blu
#    - A19: riga muro e base casa beige
#    - A27: lampione, panchina, angolo recinzione
#    - A29: scale e dislivelli
#    - A8: ponti verticale e ponticello legno
#
# ════════════════════════════════════════════════════
# PARTE B — WORLD DESIGN
# ════════════════════════════════════════════════════
# Compila con le tue scelte. Scrivi LIBERO dove non hai preferenze.
 
# ─────────────────────────────────────────
# B0 — REGOLE GLOBALI
# ─────────────────────────────────────────
- Erba uniforme o variegata (mischio 2-3 toni)? si
- Strade città: asfalto / mattoni / misto? misto
- Marciapiedi: sempre / solo città grandi / mai? mai
- Sentieri campagna: larghezza 3 o 5 tile? 5
- Alberi: fitti (muro) o radi ai bordi dei percorsi? muro
- Lampioni: tutte le città / solo grandi / solo piazze? piazze e grandi
- Panchine: solo piazze / anche strade? no
- Siepi: giardini privati / palestre / entrambi? entrambi
- Fontane: ogni città / solo grandi / solo Marino? ogni città 1
- Fiori: solo Genzano / anche altrove / ovunque? Genzano di più
- Cartelli: inizio+fine percorsi / ingresso città / entrambi? entrambi e per aree (tipo fontana di marino o piazza san rocco a frascati o infiorata a genzano)
- Neve: sempre a Rocca di Papa+Monte Cavo / evento stagionale? monte cavo sempre
- Ghiaccio scivoloso: solo Grotta / anche Rocca di Papa / solo cima? grotta ma quella di monte cavo no ogni grotta e ovviamente non tutto scivoloso
- Ruscelli sui percorsi: sì con ponticelli / solo i 2 laghi? solo i 2 laghi per ora
# ─────────────────────────────────────────
# B1 — CITTÀ DI PARTENZA (Borgata Tuscolana)
# ─────────────────────────────────────────
- Nome città: Anagnina
- Nome Professore (uomo/donna, aspetto, carattere): Giovanni
- Nome Rivale (Remo o altro? aspetto, carattere): Lascialo inserire, tile nella cartella chiamato "rivale.png"
- Dimensione città (piccola tipo Pallet o più grande): pallet
- Strada principale (orizzontale/verticale): verticale
- C'è una piazza? Dove: no
- Uscita verso Percorso Tuscolana (nord/sud/est/ovest): nord
- Quante case NPC: 2
- Casa player (1 o 2 piani, c'è la mamma?): 2 e si
- Casa Remo (vicina o lontana dal player): vicina
- Laboratorio (grande villa o casa media): laboratorio l'ho specificato
- C'è PokéCenter? C'è Market?: solo poke center
- Laboratorio interno: quante stanze, cosa c'è dentro, dove sono gli starter: 1 stanza, non visibili te li da il professore
- Remo ti sfida dentro o fuori dal lab: fuori lab
- Alberi/lampioni/siepi in città (dove): bordi limiti città
- Qualcosa di speciale visivamente: no
- NPC per strada (quanti, cosa dicono): 2, "in bocca al lupo", "il vino de li castelli...."
- Mamma cosa dice quando esci: "torna presto"
- Remo dialogo prima battaglia: "ehi, proviamo i nostri nuovi pokemon. ti sfido!"
- Remo dialogo quando perde: " p**** ***"
# ─────────────────────────────────────────
# B2 — PERCORSO TUSCOLANA
# ─────────────────────────────────────────
- Forma (rettilineo o curve): fagli fare un paio di curve, costeggiato da erba alta, a volte erba alta su percorso così da rendere inevitabile encounter
- Quante schermate di lunghezza: 3
- Larghezza sentiero (3 o 5 tile):5
- Alberi ai lati (fitti o radi):fitti
- Fiori/rocce decorative: si
- Cartello nome percorso (sì/no, dove): si, percorso 1, all'inizio prima schermata in basso a sinistra "via Tuscolana"
- Ruscello con ponticello (sì/no, dove): no
- Panchina (sì/no): no
- Alberello MN Taglio (sì/no, dove, cosa sblocca): si, a un lato, non blocca il personaggio ma sblocca un oggetto (pokeball), contiene una mt.
- Oggetti nascosti (quali, dove): no
- Oggetti visibili per terra (quali): si 2 pozioni dentro le pokeball
- Quanti allenatori (tipo): 2 tipo normale
- Allenatori visibili o nascosti: visibili
- Remo appare sul percorso (sì/no, dove): no
- Erba alta: solo bordi o anche centro: anche centro
# ─────────────────────────────────────────
# B3 — FRASCATI (Palestra 1, Erba, cap 14)
# ─────────────────────────────────────────
- Dimensione:
- Strada principale (orizz/vert):
- Strade secondarie (quante):
- Piazza centrale (dove):
- Zone della città:
- Pavimentazione piazza:
- Quante case NPC:
- Tipo case (piccole/mix/palazzi):
- PokéCenter (dove):
- Market (dove):
- Palestra (dove):
- Villa Aldobrandini (dove):
- Villa Aldobrandini visitabile? Cosa c'è dentro:
- Villa ha giardino/cancello:
- Piazza: fontana, panchine, alberi, aiuole, NPC, bacheca:
- Arredo: lampioni, viale alberato, siepi, recinzioni, parco:
- Uscita verso Città Partenza:
- Uscita verso Grottaferrata:
- Uscita verso Boschi Tuscolo (bloccata da Taglio?):
- Uscita sud verso Roma:
- Palestra esterno (siepi/vigne/erba alta davanti):
- Palestra interno (dritto o labirinto):
- Palestra puzzle:
- Palestra allenatori interni (quanti):
- Capopalestra: nome, sesso, aspetto:
- Capopalestra squadra (o LIBERO):
- Capopalestra dialogo pre-battaglia:
- Capopalestra dialogo sconfitta:
- Nome medaglia:
- TM data (o LIBERO):
- Chi dà MN Taglio (nome, dove, dialogo):
- NPC che racconta storia:
- NPC che dà oggetto:
- Grunt Team GdF in città:
- Remo appare:
# ─────────────────────────────────────────
# B4 — PERCORSO 2 (Frascati → Grottaferrata)
# ─────────────────────────────────────────
- Forma e schermate:
- Bosco leggero o fitto:
- Ruscello/ponticello:
- Alberello MN Taglio:
- Oggetti:
- Cartelli:
- Area sosta panchina:
- Allenatori (quanti, tipo):
- Remo appare:
- Cittadina intermedia (sì/no):
# ─────────────────────────────────────────
# B5 — GROTTAFERRATA (Palestra 2, Psico, cap 21)
# ─────────────────────────────────────────
- Dimensione:
- Strade strette o larghe:
- Piazza vicino Abbazia:
- Zone città:
- Pavimentazione:
- Quante case NPC:
- Abbazia San Nilo dimensione:
- PokéCenter/Market (dove):
- Palestra (dentro/accanto Abbazia):
- Giardino/chiostro Abbazia:
- Abbazia interno:
- Team GdF all'Abbazia:
- Uscite:
- Palestra interno:
- Capopalestra: nome, sesso, aspetto, carattere:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- NPC:
- Remo appare:
# ─────────────────────────────────────────
# B6 — PERCORSO 3 (Grottaferrata → Marino)
# ─────────────────────────────────────────
- Forma e schermate:
- Campagna o bosco:
- Si intravede il lago:
- Ruscello/ponticello:
- Alberello MN Taglio:
- Oggetti:
- Allenatori:
- Remo:
# ─────────────────────────────────────────
# B7 — MARINO (Palestra 3, Acqua, cap 28)
# ─────────────────────────────────────────
- Dimensione:
- Strada principale:
- Piazza fontana al centro:
- Zona lungolago:
- Zone città:
- Pavimentazione:
- Quante case NPC:
- PokéCenter/Market:
- Palestra:
- Edificio Sagra visitabile:
- Molo/pontile:
- Fontana:
- Lungolago:
- Evento Sagra:
- Uscite:
- Palestra interno:
- Capopalestra: nome, sesso, aspetto:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- Castel Gandolfo (sì/no):
# ─────────────────────────────────────────
# B8 — LAGO ALBANO
# ─────────────────────────────────────────
- Circumnavigabile tutto o in parte:
- Isole al centro:
- Zone di pesca:
- Rocce emergenti:
- Rive (sabbia/erba):
- Molo, barche:
- Grotta accessibile dalla riva:
- Evento Kyogre:
# ─────────────────────────────────────────
# B9 — PERCORSO 4 (Marino → Monte Porzio)
# ─────────────────────────────────────────
- Forma e schermate:
- Si sale di quota:
- Vegetazione cambia:
- Ruscello/ponticello:
- Massi MN Forza:
- Alberello MN Taglio:
- Si vede osservatorio in lontananza:
- Oggetti:
- Entrata Boschi Tuscolo:
- Allenatori:
- Remo:
# ─────────────────────────────────────────
# B10 — MONTE PORZIO CATONE (Palestra 4, Elettro, cap 34)
# ─────────────────────────────────────────
- Dimensione:
- Pianoro o dislivelli:
- Piazza vicino osservatorio:
- Zone città:
- Quante case NPC:
- Osservatorio dimensione:
- PokéCenter/Market:
- Palestra (dentro osservatorio o separata):
- Belvedere:
- Osservatorio interno:
- Team GdF all'osservatorio:
- Arredo:
- Capopalestra: nome, sesso, aspetto:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- Chi dà MN Forza:
- Remo appare:
# ─────────────────────────────────────────
# B11 — PERCORSO 5 (Monte Porzio → Rocca di Papa)
# ─────────────────────────────────────────
- Quante schermate:
- Sale verso montagna (scarpate):
- Vegetazione cambia (verde→rado→neve):
- Massi MN Forza:
- Accenno neve verso fine:
- Rifugio a metà (NPC):
- Oggetti:
- Allenatori:
# ─────────────────────────────────────────
# B12 — ROCCA DI PAPA (Palestra 5, Roccia/Terra, cap 40)
# ─────────────────────────────────────────
- Dimensione:
- Dislivelli interni (scale):
- Piazza ghiacciata o solo innevata:
- Zone città:
- Quante case NPC (tetti innevati):
- PokéCenter/Market:
- Palestra (scavata roccia o normale):
- Rifugio/chalet:
- Accesso Grotta Vulcano:
- Arredo (abeti, cumuli neve, belvedere, panchine):
- Uscite:
- Capopalestra: nome, sesso, aspetto:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- Chi dà MN Flash/Forza:
- NPC avvisa della grotta:
- Remo, grunt GdF:
# ─────────────────────────────────────────
# B13 — GROTTA DEL VULCANO
# ─────────────────────────────────────────
- Quante stanze:
- Sempre buia o solo alcune:
- Zona ghiaccio interna:
- Stanza 1 Entrata:
- Stanza 2 Corridoio:
- Stanza 3 Covo GdF:
- Stanza 4 Camera Groudon:
- Oggetti nella grotta:
# ─────────────────────────────────────────
# B14 — PERCORSO 6 (Rocca di Papa → Albano)
# ─────────────────────────────────────────
- Scende verso il lago:
- Quante schermate:
- Si vede Lago Albano:
- Scarpate:
- Masso MN Forza:
- Oggetti:
- Punto panoramico con panchina:
- Allenatori:
# ─────────────────────────────────────────
# B15 — ALBANO LAZIALE (Palestra 6, Lotta, cap 46)
# ─────────────────────────────────────────
- Dimensione:
- Zona militare separata:
- Zona lungolago:
- Strada principale:
- Zone città:
- Quante case NPC:
- PokéCenter/Market:
- Palestra (stile caserma):
- Caserma visitabile:
- Monumento ai soldati:
- Porto/molo:
- Zona militare:
- Riva Lago Albano:
- Lago di Nemi (come si raggiunge):
- Capopalestra: nome, sesso, aspetto:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- NPC militare, chi dà Surf:
- Remo appare:
# ─────────────────────────────────────────
# B16 — PERCORSO 7 (Albano → Ariccia + Ponte)
# ─────────────────────────────────────────
- Quante schermate:
- Ponte di Ariccia (schermata a sé o integrato):
- Atmosfera più scura:
- Lampioni lungo percorso:
- Ponte: vista, allenatori, lampioni:
- Alberello MN Taglio:
- Oggetti:
- Allenatori:
# ─────────────────────────────────────────
# B17 — ARICCIA (Palestra 7, Buio, cap 52)
# ─────────────────────────────────────────
- Dimensione:
- Strade strette (vicoli):
- Zona fraschette separata:
- Palazzo Chigi landmark:
- Zone città:
- Pavimentazione:
- Quante case NPC:
- Palazzo Chigi visitabile:
- Quante fraschette:
- PokéCenter/Market:
- Palestra (vicolo buio):
- Fraschetta interno:
- Arredo notturno:
- Capopalestra: nome, sesso, aspetto:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- Palestra interno (buio, puzzle interruttori):
- Chi dà MN Volo:
- Remo, NPC storia ponte:
# ─────────────────────────────────────────
# B18 — PERCORSO 8 (Ariccia → Genzano)
# ─────────────────────────────────────────
- Quante schermate:
- Fiori lungo sentiero:
- Vegetazione primaverile:
- Ruscello/ponticello:
- Oggetti:
- Allenatori:
# ─────────────────────────────────────────
# B19 — GENZANO (Palestra 8, Folletto, cap 58)
# ─────────────────────────────────────────
- Dimensione:
- Strada dell'Infiorata (fiori sul pavimento):
- Piazza Infiorata:
- Zone città:
- Pavimentazione speciale:
- Quante case NPC:
- PokéCenter/Market:
- Palestra (giardino fiori):
- Edificio Infiorata (museo):
- Mercato fiori:
- Piazza Infiorata:
- Accesso Via Vittoria:
- Capopalestra: nome, sesso, aspetto:
- Squadra (o LIBERO):
- Dialoghi, medaglia, TM:
- Chi dà MN Cascata:
- Remo ultima sfida pre-Lega:
- NPC oggetto potente:
# ─────────────────────────────────────────
# B20 — VIA VITTORIA
# ─────────────────────────────────────────
- Quante zone/stanze:
- Pavimenti diversi per zona:
- MN richieste:
- Zona 1 Bosco:
- Zona 2 Grotta:
- Zona 3 Altura:
- Oggetti:
# ─────────────────────────────────────────
# B21 — COLONNA / LEGA
# ─────────────────────────────────────────
- Piazza cerimoniale:
- PokéCenter prima ingresso:
- Market endgame:
- Statue/monumenti/fontane:
- Quante sale (4 + Campione):
- Temi visivi sale:
- Corridoio centrale:
- Stanze di recupero tra sale:
- Captain: nome, aspetto, dialoghi:
- Pres: nome, aspetto, dialoghi:
- Dema: nome, aspetto, dialoghi:
- Marcuois: nome, aspetto, dialoghi:
- Campione: nome, sesso, aspetto, twist narrativo:
- Campione dialoghi pre/post:
- Scena finale dopo vittoria:
- Hall of Fame (sì/no):
- Crediti con foto Castelli reali (sì/no):
- Postgame dopo crediti:
# ─────────────────────────────────────────
# B22 — BOSCHI DEL TUSCOLO
# ─────────────────────────────────────────
- Quante zone:
- Accessibile da:
- Richiede MN Taglio:
- Zona 1 Entrata:
- Zona 2 Bosco+Rovine:
- Zona 3 Regirock:
- Oggetti:
# ─────────────────────────────────────────
# B23 — MONTE CAVO (post-Lega)
# ─────────────────────────────────────────
- Quante zone:
- Accesso da Rocca di Papa:
- Allenatori forti:
- Massi/alberelli:
- Cima: atmosfera, come si attiva Rayquaza, narrativa:
# ─────────────────────────────────────────
# B24 — I TRE REGI
# ─────────────────────────────────────────
- Regirock (Rovine Tuscolo): enigma:
- Regice (grotta Faete): dove, enigma, atmosfera:
- Registeel (sotterraneo): dove, enigma, atmosfera:
# ─────────────────────────────────────────
# B25 — TEAM GdF
# ─────────────────────────────────────────
- Capo: nome, sesso, aspetto:
- Admin (quanti, dove, nomi, aspetto):
- Grunt (uniforme, cosa dicono):
- Frascati: cosa fa il Team:
- Grottaferrata: cosa fa all'Abbazia:
- Monte Porzio: cosa fa all'Osservatorio:
- Rocca di Papa: covo nella grotta:
- Capo prima apparizione:
- Scontro finale:
- Dialoghi grunt a tema:
- Discorso finale del Capo:
# ════════════════════════════════════════════════════
# FINE DOCUMENTO
# Prossimo passo: l'utente compila la Parte B.
# Poi costruiamo il JSON di ogni città/percorso.
# ════════════════════════════════════════════════════
 
