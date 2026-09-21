# GUIDA — Come chiedere una cutscene

> ⚠️ **Regola importante (imparata a mie spese)**: non modifico mai a mano i file `.tmj` —
> lavori in Tiled sul `.tmx`, e ogni tuo export/salvataggio da Tiled **rigenera il `.tmj` da
> zero**, cancellando in silenzio qualunque modifica che io avessi fatto fuori da Tiled. Se una
> cutscene richiede un oggetto nuovo su una mappa, o te lo faccio piazzare a te in Tiled
> (§3), o — per test rapidi senza toccare nessuna mappa — uso la tabella `CUTSCENE_SPAWN` in
> `js/map.js` (§3, punto C-bis), che vive solo nel codice.

## 1. Il vocabolario (cosa può fare una cutscene oggi)

| Istruzione | Cosa fa | Cosa mi devi dire |
|---|---|---|
| **Dialogo** | Apre un balloon di testo, aspetta che lo chiudi | Chi parla, cosa dice (anche più battute in fila) |
| **Muovi un NPC** | Lo fa camminare N caselle in una direzione | Quale NPC, direzione (nord/sud/est/ovest), quante caselle |
| **Muovi il giocatore** | Cammino forzato del tuo personaggio, senza input | Direzione, quante caselle |
| **Guarda** | Gira un NPC (o il giocatore) verso una direzione senza spostarlo | Chi, verso dove |
| **Aspetta** | Una pausa muta, per dare respiro alla scena | Quanti millisecondi (una cifra "a occhio" va benissimo, es. "mezzo secondo") |
| **Metti un flag** | Segna che "questo evento è successo" — serve per gate/condizioni future | Nome del flag (libero, in italiano va bene) |
| **Nascondi/mostra un NPC** | Fa sparire/ricomparire uno sprite già sulla mappa | Quale NPC |
| **Sposta la camera** | Inquadra un NPC o un punto della mappa invece del giocatore, poi torna | Su cosa punta, per quanto tempo |

Non esiste ancora: **lotta dentro la cutscene** (per ora finisce la scena e la lotta parte separatamente, come già succede oggi con gli allenatori), **doppio personaggio giocante**, **schermo nero/fade**. Se una scena ti serve con questi elementi, fermiamoci a discuterne prima — non li improvviso.

## 2. Come descrivermi una cutscene (il "copione")

Non serve che scrivi codice. Mi basta un copione in linguaggio naturale, tipo:

> **Dove**: Marino, davanti al rifugio GdF
> **Chi parte l'evento**: il giocatore entra nel rettangolo davanti alla porta (oppure: parlando con l'NPC "guardiano_rifugio")
> **Si ripete?**: no, solo la prima volta
> **Condizione**: solo se ho tutte e 3 le parti della password (flag `password_marino_completa`)
> **Cosa succede**:
> 1. Il guardiano dice "Fermo lì, chi sei?"
> 2. Il giocatore... (si mostra la password? niente, è automatico)
> 3. Il guardiano si sposta di 2 caselle a est, aprendo il passaggio
> 4. Dice "Va bene, entra."
> 5. Flag `rifugio_marino_aperto` = vero

Da questo copione scrivo io lo script in `dati/cutscene.js` — non devi conoscere il formato interno.

**Cose utili da specificarmi, se le sai**: il nome/id dell'NPC coinvolto (se già esiste su Tiled, dimmelo; se è nuovo, va bene anche solo il nome che vuoi dargli), se la scena deve poter essere rivista o solo una volta, e se dipende da qualcosa (medaglie, flag precedenti, oggetti in zaino).

## 3. Come si imposta su Tiled (per quando la scena esiste già in `dati/cutscene.js`)

Due modi, a seconda di cosa fa scattare la scena:

### A) La fa partire un NPC (ci parli con [A])
Non tocchi Tiled per niente: l'NPC deve già esistere come oggetto `type: npc` con un `id`. Io aggiungo in `dati/npc.js` la riga `cutscene: 'id_della_scena'` sulla sua voce. Fine.

Se l'NPC **non esiste ancora**, in Tiled:
1. Nel layer `eventi`, disegna un oggetto punto (o piccolo rettangolo) dove vuoi che stia.
2. `Type` = `npc`.
3. Proprietà custom `id` = un nome univoco a tua scelta (es. `guardiano_rifugio`), senza spazi.
4. Salva. Del resto (sprite, cutscene, dialogo di riserva) mi occupo io in `dati/npc.js`.

### B) La fa partire un oggetto/zona con [A] (nessun NPC, es. "leggi/tocca qualcosa")
In Tiled, layer `eventi`:
1. Disegna un **rettangolo** (non un punto) sull'area che deve far scattare la scena.
2. `Type` = `trigger_cutscene`.
3. Proprietà custom:
   - `cutscene_id` = l'id della scena (te lo dico io quando la scrivo, o decidilo tu e usalo come riferimento quando me la descrivi).
   - `una_tantum` = `true` se deve succedere una volta sola (quasi sempre sì).
   - `condizione` (opzionale) = es. `medaglie >= 3` o un nome di flag — stesso formato già usato per i warp gated, se hai dubbi mandami un esempio di un warp esistente e la copio.
4. Salva.

### C) Parte DA SOLA appena entri nella mappa (niente [A], es. intro/imboscata)
Stesso oggetto di sopra, ma con una proprietà in più:
1. Layer `eventi`, oggetto punto qualsiasi (la posizione non è vincolante, serve solo a te come promemoria).
2. `Type` = `trigger_cutscene`.
3. Proprietà custom: `cutscene_id`, più `quando` = `spawn`, più `una_tantum` = `true` (o `false` se deve ripetersi ogni volta che entri in quella mappa).
4. Salva.

Se la scena coinvolge un NPC che deve trovarsi in un punto preciso quando parte (es. "ti viene incontro"), quell'NPC va piazzato per conto suo — dimmi dove lo vuoi e lo piazzi tu in Tiled quando ti è comodo; nel frattempo lo script della cutscene posso scriverlo usando la sua posizione REALE già presente su Tiled (cammina fin dove serve), senza aspettare che tu lo sposti.

### C-bis) Test rapido senza toccare nessuna mappa
Per provare velocemente una scena "allo spawn" prima ancora che una mappa sia pronta (o senza aspettare un tuo export da Tiled), la aggancio a `CUTSCENE_SPAWN` in cima a `js/map.js` — una tabella `{ chiave_mappa: 'id_cutscene' }` che vive solo nel codice. Comoda per provare, ma per una scena definitiva meglio comunque il trigger vero in Tiled (§C), così resta visibile e modificabile anche a te.

## 4. Proviamone una — demo già pronta (versione "allo spawn", C-bis)

**Sor Otello** (`pallet_oldman`) resta esattamente dove sta già su Tiled (nessuna mappa toccata). Ho agganciato `borgata_tuscolana` a `CUTSCENE_SPAWN` in `js/map.js`: appena carichi quella mappa, lui cammina dalla sua posizione reale fino ad affiancarti e ti parla.

**Come testarla**: avvia/ricarica una partita a Borgata Tuscolana. Appena la mappa è pronta, senza premere nulla: breve pausa, poi Sor Otello arriva camminando e dice due righe. Succede **una sola volta** (`stato.cutsceneViste`); le volte dopo non riparte, e parlandogli normalmente torna alla battuta originale ("AO NAMOOOO...").

Per toglierla basta che me lo dici, oppure tu stesso cancelli la riga `'borgata_tuscolana': 'demo_vicino_curioso'` da `CUTSCENE_SPAWN` in `js/map.js`.

Fammi sapere come va, e poi mi dai il primo copione vero (magari l'intro di Remo, visto che è la prima cutscene della storia)?
