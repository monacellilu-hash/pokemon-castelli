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
| **Albero tagliabile** (MN Taglio) | `albero_taglio` *(= alias di `trigger_taglio`)* | `id: "univoco"` | UN solo oggetto rettangolo sull'albero (no tile collisione) | È già solido da solo; con MN Taglio libera la casella |
| **Trigger Surf** | `acqua_surf` *(= `trigger_surf`)* | `id: "univoco"` | UN oggetto sul bordo dell'acqua | Con MN Surf libera la casella (movimento su acqua) |
| **Trigger Forza** | `roccia_forza` *(= `trigger_forza`)* | `id: "univoco"` | UN oggetto sul masso | Con MN Forza libera la casella |
| **Trigger Spaccaroccia** | `roccia_spaccaroccia` *(= `trigger_spaccaroccia`)* | `id: "univoco"` | UN oggetto sulla roccia | Con MN Spaccaroccia libera la casella |
| **Trigger Sub** | `acqua_sub` *(= `trigger_sub`)* | `id: "univoco"` | UN oggetto in acqua profonda | Con MN Sub libera la casella |
| **Pescatore** | `trigger_pesca` | `id: "univoco"`, `zona_incontri: "lago_albano"` | Sul bordo acqua | Attesa casuale → incontro con Pokémon acquatici della zona |
| **NPC donatore MN** | `npc` | `id`, `condizione: "medaglie >= 2"` | Posizioni l'NPC | Se condizione vera → dialogo + dona MN |
| **NPC donatore oggetto** | `npc` | `dona_oggetto: "superpozione"`, `quantita: 1`, `una_tantum: true` | Posizioni l'NPC | Dona una volta sola, flag in `stato.flags` |
| **Trigger evento storia** | `trigger_storia` | `testo: "..."`, `condizione` (opz.) | Sul punto-evento | Premi [A] → mostra il `testo` (es. iscrizione dei Regi). Se la `condizione` non è soddisfatta resta criptico (`messaggio_gate`). NON è un ostacolo MN |
| **Leggendario su mappa** | `pokemon leggendario` | `sprite: regice` (nome specie) **o** `pokemon_id: 378`, `livello: 65`, `condizione` (opz.) | Sull'altare/statua | Mostra lo **sprite PokéAPI** del Pokémon (niente overworld dedicato), è solido; [A] → lotta. Sparisce se catturato/scomparso |
| **Warp speciale** (condizionato) | `warp_speciale` | `id`, `destinazione`, `condizione: "kyogre_groudon_squadra"` | Sulla fontana | Teletrasporto verso zona speciale se condizione vera |
| **Rivale (Remo)** | `trainer` id `rivale_tuscolo` *(anche `trigger_rivale`)* | `sprite: RIVAL`, `vista: 5`, `direzione` | Sul sentiero | Visibile e con linea visiva: appena incroci il suo sguardo parte la lotta. Squadra/dialoghi/flag da `DATI_TRAINER['rivale_tuscolo']`. (Un `trigger_rivale` senza `id` viene mappato su `rivale_tuscolo`.) |
| **Gate palestra** (level cap) | `gate_palestra` | `id: "frascati"` | Sull'ingresso palestra | Blocca se il level cap non è raggiunto; se già battuta lascia passare |

## NOTE
- **Stato di implementazione (sessione 18):** funzionanti = `warp`/`uscita`, `spawn`, `oggetto`, `npc` (statico+random), `trainer` (fisso+pattuglia), `cartello`, `erba_alta`/`acqua` come **oggetti** rettangolari. Da implementare = tutto il resto (ghiaccio, MN, capopalestra, gate, trigger vari).
- **Erba alta: oggetto vs tile.** Oggi nelle mappe l'erba alta è un **rettangolo oggetto** `type=erba_alta` nel layer `eventi`. La specifica nuova (tile `type=erba_alta` nel layer `ground`) è il bersaglio futuro: il motore va esteso per leggere le proprietà dei tile. Per ora vale il rettangolo.
- **`destinazione` dei warp:** meglio usare la **chiave** del registro `MAPPE` in `js/map.js` (es. `percorso_tuscolana`), non il nome file. Il motore tollera i nomi file ma è più fragile.
- **⭐ OSTACOLI MN — NOMI DEI TIPI (convenzione `<terreno>_<mn>`):** usa questi `type` sull'oggetto:

  | In Tiled (`type`) | MN richiesta | Tipo interno |
  |---|---|---|
  | `albero_taglio` | Taglio | `trigger_taglio` |
  | `acqua_surf` | Surf | `trigger_surf` |
  | `acqua_sub` | Sub | `trigger_sub` |
  | `roccia_spaccaroccia` / `sasso_spaccaroccia` / `masso_spaccaroccia` | Spaccaroccia | `trigger_spaccaroccia` |
  | `roccia_forza` / `sasso_forza` / `masso_forza` | Forza | `trigger_forza` |
  | `cascata` / `cascata_cascata` / `acqua_cascata` | Cascata | `trigger_cascata` |

  (Funzionano anche i vecchi `trigger_*` diretti. Il motore tollera **spazi e
  maiuscole** nel `type`: `acqua surf` = `acqua_surf`.) Le chiavi MN nello stato
  sono `taglio, surf, sub, spaccaroccia, forza, cascata, volo`. Lo stato MN ha le chiavi `taglio, surf, sub, spaccaroccia, forza, volo` — per ora si ottengono/donano solo Taglio/Surf/Volo; Forza/Sub/Spaccaroccia esistono ma non hanno ancora un donatore, quindi quegli ostacoli restano bloccati finché non aggiungiamo la MN.
- **⭐ OSTACOLI MN — REGOLA DEFINITIVA:** metti **UN SOLO oggetto** rettangolo col `type` qui sopra, **agganciato alla griglia 32×32** in modo da coprire la/e casella/e da bloccare. **NON aggiungere un tile/rettangolo di collisione separato sopra:** l'oggetto-trigger è **già solido da solo** (il motore lo blocca finché non hai la MN giusta) e con la MN libera quelle caselle. Se metti anche la collisione a mano, le due cose si disallineano e resti bloccato anche dopo aver usato la MN. *(Dalla sessione 21 il motore, quando usi la MN, libera anche la casella davanti al giocatore: così anche le vecchie mappe a "doppio tile" si superano — ma la regola pulita resta: solo l'evento.)* L'oggetto può stare nel layer `eventi` **o** `collisioni`: funziona in entrambi.
- **Sprite trainer:** la proprietà `sprite` può essere il nome nudo della classe (`YOUNGSTER`, `LASS`, `BUGCATCHER`…): il motore prova in automatico anche `trainer_<nome>.png`. Se l'`id` è in `DATI_TRAINER`, vince lo sprite definito lì.
- **⭐ CONDIZIONI (`richiede` / `condizione`) su warp e NPC/trainer:** valore possibile —
  - un **flag**: `post_lega` (= Lega completata), `<id>_sconfitto` (es. `il_solitario_sconfitto`), o qualsiasi nome in `stato.flags`;
  - un **requisito di squadra in italiano**: `"tre pokemon lotta in squadra"` (numero a parole o cifra + tipo italiano + "in squadra"). Tipi: normale, lotta, volante, veleno, terra, roccia, coleottero, spettro, acciaio, fuoco, acqua, erba, elettro, psico, ghiaccio, drago, buio, folletto.
  - **combinati con "e"**: `"legaCompletata e tre pokemon acqua in squadra"`.
  - **Warp**: se la condizione è falsa il passaggio è bloccato; messaggio personalizzabile con `messaggio_gate`.
  - **NPC/trainer**: `gate: true` → compare SOLO finché la condizione è FALSA (blocco che sparisce quando la soddisfi); senza `gate` → compare SOLO quando la condizione è VERA (personaggio "premio").
- **Trainer SPECIALE:** `speciale: true` (+ opz. `post_battaglia_npc: "id_npc"`) → alla sconfitta setta il flag `<id>_sconfitto`, il campione sparisce e compaiono gli NPC/eventi che dipendono da quel flag (es. l'NPC post-battaglia e l'incontro con Celebi).
