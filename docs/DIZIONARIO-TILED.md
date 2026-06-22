# DIZIONARIO TILED — convenzioni mappe Pokémon Castelli Romani

> Fonte di verità per come vanno marcati tile e oggetti nelle mappe Tiled (`.tmx`/`.tmj`).
> Colonna "Tu in Tiled" = cosa fai tu. Colonna "Claude Code" = cosa fa il motore di gioco (`js/map.js`).
> **Regola sui nomi:** in italiano, minuscolo, senza spazi (usa `_`). Niente refusi (`spawn`, non `spwan`; `pattuglia`, non `patuglia`). Il motore tollera comunque alcuni refusi noti, ma non farci affidamento.

## TERRENI (tile layer)

| Cosa | Layer | Proprietà custom | Tu in Tiled | Claude Code |
|---|---|---|---|---|
| **Erba alta** (incontri) | `ground` | tile `type = erba_alta` | Disegni i tile | Legge il tile sotto il giocatore → incontro SOLO se `erba_alta` |
| **Acqua** (surf + incontri) | `ground` | tile `type = acqua` | Disegni i tile | Blocca il movimento senza Surf; incontri acquatici |
| **Ghiaccio scivoloso** | `ground` | tile `type = ghiaccio` | Disegni i tile | Il giocatore scivola finché non colpisce un muro |
| **Collisione solida** | `collisioni` (layer tile separato) | tile presente = bloccato | Dipingi i tile di blocco | Movimento bloccato dove c'è un tile |

## OGGETTI (object layer `eventi`)

| Cosa | type | Altre proprietà | Tu in Tiled | Claude Code |
|---|---|---|---|---|
| **Uscita / Warp** | `warp` | `destinazione: "chiave_mappa"`, `spawn_id: "nome_spawn"` | Sulla porta/bordo | Carica la mappa e mette il giocatore sullo spawn `spawn_id` |
| **Spawn point** | `spawn` | `id: "nome_univoco"` (es. `da_percorso_1`) | Posizioni lo spawn | Bersaglio dei warp |
| **Oggetto a terra** | `oggetto` | `contenuto: "pokeball"`, `quantita: 1`, `id: "univoco"` | Posizioni l'oggetto | Avvicini → Interagisci → raccogli (NON raccolto passandoci sopra) |
| **NPC statico** | `npc` | `id: "npc_id"`, `sprite: "NPC_01"`, `direzione: "sud"` | Posizioni l'NPC | Dialogo da `DATI_NPC[id]`, blocca movimento nel dialogo |
| **NPC movimento random** | `npc` | `movimento: "random"`, `raggio: 3` | Posizioni l'NPC | Ogni N frame si muove di 1 tile a caso nel raggio |
| **Trainer (vista fissa)** | `trainer` | `id: "trainer_id"`, `vista: 4`, `direzione: "sud"` | Posizioni il trainer | Se il giocatore entra nel cono vista → battaglia |
| **Trainer pattuglia** | `trainer` | `pattuglia: true`, `direzione_ciclo: "NS"` | Posizioni il trainer | Alterna direzione ogni N frame; vista attiva nella direzione corrente |
| **Capopalestra** | `capopalestra` | `id: "frascati"` | Nella palestra | Legge `PALESTRE[id]`, gauntlet gregari + boss |
| **Porta edificio** | `warp` | `destinazione: "pokecenter"`, `spawn_id: "entrata_principale"` | Sulla soglia | Identico al warp, destinazione = mappa interna |
| **Cartello** | `cartello` | `testo: "..."` | Posizioni il cartello | Interagisci → mostra il testo |
| **Albero tagliabile** (MN Taglio) | `albero_taglio` | `id: "univoco"`, `destinazione_warp: "..."` (opz.) | Posizioni l'albero | Con MN Taglio rimuove la collisione e sblocca il passaggio |
| **Trigger Surf** | `trigger_surf` | `id: "univoco"` | Sul bordo dell'acqua | Con MN Surf cambia sprite in surf e abilita il movimento su acqua |
| **Trigger Forza** | `trigger_forza` | `blocco_id: "masso_1"` | Vicino al masso | Spinge il masso di 1 tile, rimuove collisione |
| **Trigger Spaccaroccia** | `trigger_spaccaroccia` | `id: "univoco"` | Sulla roccia | Rimuove la collisione (per la sessione) |
| **Trigger Sub** | `trigger_sub` | `id: "univoco"` | In acqua profonda | Passa a tileset underwater, incontri subacquei |
| **Pescatore** | `trigger_pesca` | `id: "univoco"`, `zona_incontri: "lago_albano"` | Sul bordo acqua | Attesa casuale → incontro con Pokémon acquatici della zona |
| **NPC donatore MN** | `npc` | `id`, `condizione: "medaglie >= 2"` | Posizioni l'NPC | Se condizione vera → dialogo + dona MN |
| **NPC donatore oggetto** | `npc` | `dona_oggetto: "superpozione"`, `quantita: 1`, `una_tantum: true` | Posizioni l'NPC | Dona una volta sola, flag in `stato.flags` |
| **Trigger evento storia** | `trigger_storia` | `id`, `condizione: "medaglie >= 5"` | Sull'ingresso | Cutscene/dialogo (es. catena Team GdF) |
| **Trigger leggendario** | `trigger_leggendario` | `pokemon_id: 144`, `condizione: "funivia_sbloccata"` | Nella zona | Chiama `triggeraLeggendario(id)` se condizione vera |
| **Warp speciale** (condizionato) | `warp_speciale` | `id`, `destinazione`, `condizione: "kyogre_groudon_squadra"` | Sulla fontana | Teletrasporto verso zona speciale se condizione vera |
| **Trigger rivale** | `trigger_rivale` | `tappa: 2` | Sul sentiero pre-città | Avvia la battaglia con Remo alla tappa giusta |
| **Gate palestra** (level cap) | `gate_palestra` | `id: "frascati"` | Sull'ingresso palestra | Blocca se il level cap non è raggiunto; se già battuta lascia passare |

## NOTE
- **Stato di implementazione (sessione 18):** funzionanti = `warp`/`uscita`, `spawn`, `oggetto`, `npc` (statico+random), `trainer` (fisso+pattuglia), `cartello`, `erba_alta`/`acqua` come **oggetti** rettangolari. Da implementare = tutto il resto (ghiaccio, MN, capopalestra, gate, trigger vari).
- **Erba alta: oggetto vs tile.** Oggi nelle mappe l'erba alta è un **rettangolo oggetto** `type=erba_alta` nel layer `eventi`. La specifica nuova (tile `type=erba_alta` nel layer `ground`) è il bersaglio futuro: il motore va esteso per leggere le proprietà dei tile. Per ora vale il rettangolo.
- **`destinazione` dei warp:** meglio usare la **chiave** del registro `MAPPE` in `js/map.js` (es. `percorso_tuscolana`), non il nome file. Il motore tollera i nomi file ma è più fragile.
