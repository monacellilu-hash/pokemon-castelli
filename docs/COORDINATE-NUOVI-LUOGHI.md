# 📍 COORDINATE — Luoghi nuovi (F9-F11)
### Pronte da incollare in `data.js` (marker) o `world.js` (zone/dungeon)

> **LEGENDA STATO**
> - ✅ **VERIFICATO** = indirizzo/luogo reale confermato; lat/lon stimata sul punto reale, rifinibile su OSM al pixel.
> - 🟡 **APPROSSIMATO** = luogo reale ma coordinata stimata dal centro paese; da rifinire su OSM.
> - 🔵 **INVENTATO** = luogo di fantasia (covi CoTrAL, Bunkerino); coordinata plausibile scelta da me.
>
> Il progetto già verifica le coord su Nominatim: questi numeri sono ottimi punti di partenza.

---

## 🗺️ TABELLA LUOGHI NUOVI

| # | Luogo | Lat | Lon | Serve per | Tipo nel codice | Stato |
|---|---|---|---|---|---|---|
| 1 | **Museo delle Navi Romane** (Nemi) | **41.7196** | **12.7018** | Cutscene: il GdF ruba le **Sfere** e scappa | marker-evento (`data.js`) | ✅ Via Diana 13-15, sponda nord del lago |
| 2 | **Villa Aldobrandini** (Frascati) | **41.8043** | **12.6820** | **Mew** (post-game) | marker-evento | ✅ Via Card. Massaia 18 (Google ≈41.8035,12.6829) |
| 3 | **Fontana di Piazza San Rocco** (Frascati) | **41.8099** | **12.6764** | **Rayquaza**: premi la fontana con Kyogre+Groudon → dungeon | marker-evento | ✅ confermata: fontana del 1480 (la più antica di Frascati), in Piazza San Rocco accanto a Santa Maria in Vivario; coord ≈ da rifinire su OSM |
| 4 | **Funivia di Rocca di Papa** (staz. a monte) | **41.7625** | **12.7100** | Accesso al sentiero innevato → **Articuno** | marker/gate | 🟡 Funicolare storica reale (1932-63, in riapertura); coord vicino al centro |
| 4b | **Vetta innevata** (Maschio delle Faete) | **41.7455** | **12.7160** | Zona neve dove sta **Articuno** | **zona** (`world.js`, cerchio r≈400) | 🟡 punto più alto (956 m), sopra Monte Cavo |
| 5 | **Osservatorio INAF** (Monte Porzio) | **41.8044** | **12.7025** | **Zapdos** (temporale) + **Jirachi** (notte, giorni dispari) | marker-evento | ✅ Via Frascati 33 — **diverso** dal punto-palestra in centro (41.8164, 12.7153) |
| 6 | **"Parcheggione" / Piazza Mercato** (Grottaferrata) | **41.7880** | **12.6700** | Base di lancio → **Deoxys** sulla Luna | marker-evento | 🟡 centro Grottaferrata, da rifinire sul piazzale reale |
| 7 | **Bunkerino** (Colonna) | **41.8360** | **12.7560** | Base **CoTrAL** + **Mewtwo** | dungeon + marker | 🔵 INVENTATO (oggi c'è solo `LEGA` a 41.8337, 12.7532; lo metto poco fuori Colonna) |
| 8 | **Lab CoTrAL #1** (Marino) | **41.7725** | **12.6560** | Dungeon-indizi, post-P3 | dungeon (`world.js`, r≈250) | 🔵 INVENTATO, periferia di Marino |
| 9 | **Lab CoTrAL #2** (Albano) | **41.7350** | **12.6500** | Dungeon-indizi, post-P6 | dungeon (`world.js`, r≈250) | 🔵 INVENTATO, periferia di Albano |
| 10 | **Ponte di Ariccia** (Monumentale) | **41.7228** | **12.6722** | Evento **notte** (atmosfera Buio, NPC misterioso) | marker/zona-evento | ✅ tra Albano e il centro di Ariccia (palestra a 41.7212, 12.6720) |

---

## 🏥 CENTRI POKÉMON MANCANTI (da aggiungere a `CENTRI_POKEMON` in data.js)
> Segnalati da Claude Code. Il primo è **necessario** per il tutorial del "Dormi".

| Luogo | Lat | Lon | Stato |
|---|---|---|---|
| **CP Borgata Tuscolana** (spawn) | **41.8423** | **12.6158** | 🟡 accanto a casa/laboratorio (CITTA_PARTENZA 41.8420,12.6150) — serve per "Dormi" |
| **CP Castel Gandolfo** | **41.7476** | **12.6500** | 🟡 centro Castel Gandolfo, vista lago |
| **CP Nemi** | **41.7203** | **12.7186** | 🟡 centro storico di Nemi |

---

## 🧩 NOTE DI INTEGRAZIONE (per la F9-F11)
- **Marker vs zona**: i luoghi-evento (Museo, Villa Aldobrandini, San Rocco, Osservatorio, parcheggione, Ponte) sono **marker puntuali** in `data.js`, con un trigger di interazione (come palestre/CP). I **dungeon** (Bunkerino, Lab CoTrAL, vetta innevata) sono **zone** in `world.js` (cerchio + raggio + eventuale `locked`).
- **Osservatorio**: oggi 41.8164/12.7153 è il *punto-palestra in centro*. L'edificio INAF vero (riga 5) è **un secondo punto** a ovest: tienili distinti — palestra in centro, eventi Zapdos/Jirachi all'INAF.
- **Bunkerino vs LEGA**: la Lega resta a 41.8337/12.7532; il Bunkerino è un luogo separato (riga 7) che si sblocca **post-Lega**.
- **Sovrapposizioni**: Lab #2 (Albano) e vetta-Faete cadono vicino a zone esistenti — quando li aggiungi a `world.js`, mettili **prima** delle zone grandi (priorità), come già fatto per grotta-vulcano dentro monte-cavo.
- **Tutto confermato**: la Fontana di Piazza San Rocco (riga 3) è ora verificata. Tutti i punti sono piazzabili; gli 🟡/🔵 si rifiniscono su OSM al bisogno.
