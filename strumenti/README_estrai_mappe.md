# Estrazione mappe da pret/pokeemerald e pret/pokefirered

Script: `strumenti/estrai_mappe_pret.py`. **È il vero `convert2.py` perduto**
(visto nel commit `1681e26` del 4 ottobre 2026 — Luca lo ha ritrovato e
incollato in chat il 5 ottobre 2026). Non serve clonare nulla in locale:
scarica i dati via HTTP direttamente da GitHub (`raw.githubusercontent.com`).

**Verificato dal vivo il 5 ottobre 2026** su `PalletTown` (pokefirered):
risultato visivamente corretto al 100% — case, laboratorio di Oak, acqua,
alberi, tutto riconoscibile e con i colori veri. 3 NPC e 3 uscite estratti
come segnaposto.

## 1. Eseguire lo script

```
python -m pip install Pillow      # una tantum
python strumenti/estrai_mappe_pret.py --gioco firered --mappa PalletTown
```

`--mappa` vuole il nome esatto (case sensitive) della cartella dentro
`data/maps/` del repository pret scelto — per trovarlo, sfoglia
`github.com/pret/pokefirered/tree/master/data/maps` (o `pokeemerald`) nel
browser. Esempio: `PalletTown`, `Route21_North`, `CeladonCity_DepartmentStore_2F`.

Output in `strumenti/output_mappe_estratte/` (MAI dentro `sprites/maps_tiled/`
direttamente — scelta di sicurezza, vedi sotto):
- `<nome>.tmj`
- `<nome>_tileset.png`

## 2. Passi MANUALI dopo l'estrazione (lo script da solo non basta)

1. **Controlla il risultato in Tiled** prima di spostarlo dentro il progetto.
2. **Sposta i file**: il `.tmj` in `sprites/maps_tiled/`, il `.png` in `sprites/`.
3. **Correggi il percorso del tileset dentro il `.tmj`** (campo `tilesets[0].image`):
   appena generato è `<nome>_tileset.png` (giusto SOLO finché il file sta nella
   cartella di prova, dove `.tmj` e `.png` sono fianco a fianco) — dopo averlo
   spostato al punto 2, va aggiunto `../` davanti (`../<nome>_tileset.png`),
   la stessa convenzione di tutte le altre mappe del progetto (`.tmj` dentro
   `sprites/maps_tiled/`, immagini un livello sopra in `sprites/`). **Il gioco
   non se ne accorge se te lo dimentichi** (non legge mai questo campo — vedi
   `parseTilesets()` in `js/map.js`, usa solo `TILESET_IMMAGINI`/
   `TILESET_META`), **ma Tiled sì**: senza questa correzione, riaprendo la
   mappa in Tiled il tileset risulta "immagine mancante". Bug reale capitato
   l'8 ottobre 2026 sulle 11 mappe della Zona Safari, corretto a mano quella
   volta — da non ripetere.
4. **Registra il tileset in `js/map.js`** (`TILESET_IMMAGINI` + `TILESET_META`)
   — lo script non tocca `js/map.js`.
5. **Ricollega ogni "uscita"**: sono segnaposto con una proprietà
   `nota_origine` che dice verso quale mappa pret puntava (es. "verso
   MAP_PALLET_TOWN_PROFESSOR_OAKS_LAB") — vanno trasformate in warp veri
   verso le mappe di QUESTO progetto, con `destinazione`/`spawn_id` corretti.
6. **Registra la mappa in `MAPPE`** (`js/map.js`) con una chiave e il percorso
   del file, come per ogni altra mappa.
7. **NPC, trainer, zone di incontro, leggendari**: i "npc_*" generati sono
   SOLO segnaposto (hanno una proprietà `nota_origine` col nome grafico
   originale pret, es. `OBJ_EVENT_GFX_PROF_OAK`, utile per sapere CHI era in
   originale) — ma vanno sempre ricreati a mano con `dati/npc.js`/
   `dati/trainer.js`, esattamente come per le mappe disegnate da zero: pret
   usa script/puntatori a funzioni C che non hanno alcuna corrispondenza
   diretta con le convenzioni di questo progetto.

## Limiti noti (onesti, non nascosti)

- **Nomi cartella tileset**: dedotti dal simbolo C (`gTileset_GenericBuilding2`
  → `generic_building_2`) con una conversione euristica. Ha già un caso noto
  corretto (numeri in coda al nome), ma se un nome nuovo non corrisponde a
  nessuna cartella su GitHub, lo script si ferma con un errore — in quel caso
  va aperta la cartella `data/tilesets/` del repository nel browser e
  corretta `tileset_name_from_const()` a mano.
- **Un solo livello "sopra la testa"**: la mappa genera al massimo un 3°
  layer tile opzionale (`sopra_testa` di default, rinominabile — vedi
  parametro `sopra_nome` di `convert_map()`) per i metatile che in originale
  coprono il personaggio. Se la mappa di destinazione in questo progetto non
  ha un layer con quel nome, va aggiunto o il parametro va cambiato prima di
  generare.
- **Niente tile animati** (acqua, fiori, bandiere…): escono come singolo
  frame statico, da sistemare a mano se serve l'animazione.
