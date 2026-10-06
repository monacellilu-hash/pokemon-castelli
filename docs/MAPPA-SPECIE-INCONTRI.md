# Mappa Specie → Zone di Incontro (sessione 5 ottobre 2026)

Elenco di dove si trova OGNI specie "trovabile in natura" secondo
`docs/CLASSIFICAZIONE-INCONTRI-386.md` (281 specie), dopo la distribuzione
completa delle 93 che non avevano ancora una zona. Fonte di verità per le
quantità: `dati/incontri.js`.

## Come leggere questo file
- Chiave = valore `id` della tabella in `dati/incontri.js` = id del
  rettangolo `erba_alta`/`trigger_surf` nel `.tmj`/`.tmx` della mappa.
- "notte" = presente solo nel pool `pokemonNotte` di quella zona (si attiva
  tra le 21:00 e le 06:00, vedi `fasciaOraria()` in `js/app.js` e
  `_tentaIncontro()` in `js/map.js`).
- Le famiglie evolutive sono tenute nella stessa zona quando lo stadio
  successivo non supera troppo il livello locale (es. Gastly/Haunter a
  Tuscolo, Caterpie/Metapod/Butterfree sempre a Tuscolo). Quando la famiglia
  copre un salto di livello enorme (es. Magikarp→Gyarados), gli stadi
  restano "a parte" per design (coerente con le zone già esistenti).

## Zone nuove/aggiornate in questa sessione

| Zona (id in `dati/incontri.js`) | Specie aggiunte |
|---|---|
| `incontri tuscolo` | Butterfree, Beedrill, Parasect, Unown, Dunsparce + **notte**: Gastly↑, Haunter, Unown↑ |
| `incontri percorso 1` | Raticate, Ekans, Furret, Silcoon, Cascoon, Swellow |
| `incontri frascati` | Nidorina, Nidorino, Farfetch'd |
| `incontri percorso 2` | Pidgeotto, Girafarig, Linoone |
| `incontri percorso 3` | Weepinbell, Kingler |
| `incontri percorso 4` | Fearow |
| `incontri marino` | Venomoth, Loudred, Delcatty, Swalot |
| `acqua_marino_surf` | Poliwhirl, Azurill |
| `incontri lago albano` (= `incontri lago di albano spiaggia`) | Slowbro, Pelipper |
| `incontri lago albano profondo` | Lapras, Remoraid, Mantine, Wailmer |
| `acqua_lago di albano_surf` | Tentacool, Tentacruel, Seel, Dewgong, Staryu, Luvdisc |
| `incontri castel gandolfo` | Togepi, Togetic, Xatu, Quagsire |
| `incontri percorso 5` | Mankey, Primeape, Cacnea, Cacturne |
| `incontri via dei laghi` | Tangela, Scyther, Smeargle, Slakoth, Vigoroth, Tropius |
| `incontri osservatorio` | Clefairy, Kadabra, Mr. Mime, Cleffa, Castform, Chimecho |
| `incontri percorso montano` | Jynx, Piloswine, Smoochum, Glalie |
| `incontri monteporzio` | Meowth, Persian, Eevee, Igglybuff, Granbull |
| `incontri rocca di papa` | Gligar, Lileep, Cradily |
| `incontri albano` | Hitmonlee, Hitmonchan, Medicham |
| `incontri zona safari` | Lickitung, Ditto |
| `incontri collegamento cotral` | Koffing, Mawile |
| `incontri power plant` | Electabuzz, Porygon, Porygon2 |
| `incontri grotta vulcano` | Magmar, Magby, Torkoal |
| `incontri percorso 10` | Spinda |
| `incontri percorso 11` | Wobbuffet, Ralts, Wynaut |
| `acqua_tunnel_roccioso_1f_surf` | Dratini, Dragonair (dungeon-only, draghi ultra rari) |
| `incontri tunnel roccioso 3f` | Bagon, Shelgon (dungeon-only, draghi ultra rari) |
| `incontri via vittoria 1f` | Altaria (dungeon-only, drago/volante ultra raro) |
| `incontri ariccia` | **notte**: Noctowl, Misdreavus, Absol↑, Umbreon↑, Sableye (tema Buio più marcato col buio vero) |

## Regole applicate
1. **Famiglie evolutive insieme**: ogni specie evoluta aggiunta sta nella
   stessa zona (o pozza/surf) della sua pre-evoluzione già presente, con
   livello minimo leggermente più alto e `rate` più basso (più rara).
2. **Giorno/notte**: implementato a motore (`pokemonNotte` in
   `js/map.js` → `_tentaIncontro`, retrocompatibile). Applicato a due zone
   pilota (Tuscolo, Ariccia) dove il tema narrativo lo richiede esplicitamente
   (rovine infestate di notte, città a tema Buio). Le altre zone restano
   invariate a qualunque ora — estendere il pattern ad altre zone è
   immediato se Luca lo chiede.
3. **Coerenza tipo/habitat**: acquatici solo in zone Surf/laghi
   (Tentacool/Seel/Staryu/Lapras ecc.), elettrici solo a Percorso 4/
   Power Plant, fuoco solo a Grotta del Vulcano/Genzano, psico/misteriosi a
   Osservatorio/Percorso 11, fate/bambini (Togepi, Cleffa, Igglybuff,
   Azurill, Wynaut) nelle zone già "dolci" (giardini, laghi, villaggi).
4. **Draghi ultra rari solo nei dungeon**: Dratini/Dragonair (Tunnel
   Roccioso 1F acqua), Bagon/Shelgon (Tunnel Roccioso 3F), Altaria (Via
   Vittoria 1F) — mai in superficie, `rate: 1` (quasi impossibile).
5. **Ogni specie trovabile in almeno una zona vera**: verificato a
   programma — 281/281 specie "SI" nel censimento hanno ora almeno una
   occorrenza in `dati/incontri.js` (pool diurno o notturno).

## Verifiche eseguite
- `node --check dati/incontri.js` → OK, nessun errore di sintassi.
- Script di conteggio: 281 specie "trovabile" nel censimento, 303 occorrenze
  totali piazzate (molte specie in più di una zona per le famiglie), **0
  mancanti**.
- Confermato che i rettangoli `erba_alta` per le 5 zone precedentemente
  segnate "PRONTE" (Frascati, Percorso 4, Lago Albano, Castel Gandolfo,
  Percorso 5) esistono già nei rispettivi `.tmj`: sono quindi ATTIVE, non più
  solo "pronte" (header di `dati/incontri.js` aggiornato di conseguenza).
  L'unica discrepanza: il rettangolo di Lago di Albano usa l'id
  `"incontri lago di albano spiaggia"` invece di `"incontri lago albano"` —
  risolto con un alias in `dati/incontri.js`, non rinominando il `.tmj` (per
  non toccare lavoro di un'altra sessione/fork).

## ⚠️ Problema trovato, FUORI dallo scope di questo task (solo segnalato)
`sprites/maps_tiled/frascati_est.tmx` contiene **JSON** (formato `.tmj`), non
XML — non è un `.tmx` valido. Non l'ho toccato: molto probabile che sia stato
sovrascritto per errore da un'altra sessione che lavorava oggi su Frascati
(rename capopalestra, warp, ecc.). Se si apre questo file in Tiled andrà in
errore. Va rigenerato come vero `.tmx` XML (stesso contenuto di
`frascati_est.tmj`, formato Tiled nativo) prima di aprire la mappa in Tiled.
