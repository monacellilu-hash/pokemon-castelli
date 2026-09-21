# Design — Rocca di Papa → Monte Cavo (cutscene, gate, Articuno)

> Documento di design per revisione PRIMA dell'implementazione. Non ancora scritto codice/mappe.
> Modifica pure le voci qui sotto e dimmi cosa aggiornare.

---

## 0. Stato attuale verificato (letto dai file, non presunto)

- **Rocca di Papa** (`rocca_di_papa.tmj`): ha già Pokécenter/Market/porta palestra, un gate GdF verso
  la grotta del vulcano (`gdf_gate_grotta_vulcano`, condizione `gdf_sconfitto`), un frammento di
  stella, una zona erba_alta. **Non ha**: nessun capopalestra/gregari piazzati (Baso e i 7 gregari
  esistono già come dati in `dati/trainer.js` ma non hanno una mappa-interno palestra — resta un gap
  noto, fuori da questo documento), nessun warp verso Percorso 11, nessun warp verso Monte Cavo.
- **Trovati in cerchio**: 1 NPC "rocca_npc1" (sprite NPC 60, guarda nord) + 1 NPC "rocca_npc2"
  originale (sprite NPC 61) + **10 cloni** di rocca_npc2, tutti con lo **stesso id Tiled** — bug da
  correggere (id non univoci) prima di scriptare la cutscene, li rinomino io in automatico
  (`rocca_npc2_a`, `_b`, … `_j`).
- **Trovati 2 "dot" segnaposto** vicini fra loro (diversi dal gate palestra, confermato da Luca):
  uno per il gate NPC "qui non c'è più nessuno per far funzionare l'aggeggio" (operatore funivia),
  uno per dove starà **Gianluca** (nome dell'operatore, non più "Peppe") una volta liberato.
- **Monte Cavo** (`monte_cavo.tmj`): esiste come file ma **non registrato** in `MAPPE`, **nessun
  layer collisioni**, solo 2 dot segnaposto ("ARTICUNO", "MINIBOSS"), nessun oggetto reale.
- **Percorso 11**: ha già il suo warp verso `rocca_di_papa` (spawn atteso: `da_percorso_11`) e uno
  spawn `da_rocca_di_papa` pronto per il ritorno — manca solo il lato **Rocca di Papa** (warp+spawn).
- **MN Forza**: nel motore è un flag (`stato.mn.forza`), oggi assegnato dal rivale Remo a Monte
  Porzio (tappa 4). Non ha un numero "MN5" nel codice attuale — la tua richiesta di darla a Rocca di
  Papa come ricompensa della cutscene è un **secondo modo di ottenerla**, si aggiunge al primo (da
  discutere se va rimosso quello di Remo, non l'ho tolto qui).
- **MT05** è già assegnata a Rocca di Papa/Rocco: è "Slavina" (Rock Slide), donata a fine palestra.
  **Gelo Raggio (Ice Beam) non esiste ancora come oggetto/MT** — va creato da zero.
- **Icona "!" sopra la testa di un NPC**: non esiste nel motore, va costruita.
- **NPC che raggiunge il giocatore ovunque si trovi**: esiste già (`muovi_npc_verso_giocatore`),
  confermato funzionante ma non documentato in `GUIDA-CUTSCENE.md` (lo aggiorno).
- **Cura automatica squadra dopo lotta**: non esiste ancora come funzione riutilizzabile, va aggiunta.

---

## 1. Collegamenti da aggiungere (solo warp/spawn, posizioni segnaposto al centro mappa)

- **Percorso 11 → Rocca di Papa**: nuovo warp+spawn su `rocca_di_papa.tmj` (`destinazione:
  percorso_11`, `spawn_id: da_rocca_di_papa`), spawn con `id: da_percorso_11` per il ritorno.
- **Rocca di Papa ↔ Monte Cavo (funivia)**: registro `monte_cavo` in `MAPPE`. Interpretazione mia
  (dimmi se sbaglio): **la salita NON è un warp fisico calpestabile** — si sblocca solo parlando con
  Gianluca dopo la liberazione (vedi §3). **La discesa invece è un warp normale**, sempre disponibile,
  piazzato su Monte Cavo verso Rocca di Papa. Se invece volevi ANCHE un warp fisico di salita
  (magari come scaffolding provvisorio prima di costruire la cutscene), dimmelo e lo aggiungo.
- **Rocca di Papa → Grotta del Vulcano**: nuovo warp+spawn (`destinazione: grotta_vulcano`) — la
  mappa `grotta_vulcano` non esiste ancora come file: il warp resta un collegamento "a vuoto" (come
  già fatto per `nascondiglio_cotral`) finché non la disegni. Il gate GdF esistente
  (`gdf_gate_grotta_vulcano`) resta davanti a questo warp, invariato.

---

## 2. Cutscene 1 — Rocca di Papa, il capopalestra è via

**Trigger**: il giocatore entra nell'area della piazza (raggio attorno al cerchio di NPC) — non ai
primi passi in città, solo quando si avvicina al cerchio.

**Sequenza**:
1. 3 battute in sequenza, **dialogo generico non legato a sprite specifici** (come confermato):
   - *"Baso sta combattendo quei maledetti del CoTrAL, ci hanno disattivato la funivia!"*
   - *(2ª battuta di rincaro — proponi tu il testo esatto o lo scrivo io provvisorio?)*
   - *(3ª battuta di rincaro — idem)*
2. **rocca_npc1** (guarda nord di base): appare l'icona "!" sopra la testa (nuova, da costruire),
   si gira verso sud, poi cammina verso il giocatore (`muovi_npc_verso_giocatore`, come confermato).
   Arrivato adiacente: NPC1 si gira verso il giocatore E il giocatore si gira verso NPC1 (dialogo
   "vero", entrambi orientati), come richiesto.
3. Comandi tornano al giocatore (fine prima parte).
4. Il giocatore può riparlare con NPC1 quando vuole → parte la seconda parte:
   - *"Hanno rapito Gianluca, il nostro operatore della funivia, un oltraggio! Baso li ha inseguiti
     sul Percorso 11 per salvarlo e sconfiggere il team CoTrAL."*
   - *"Ti prego aiutaci, prendi questo, ti servirà."*
   - Popup ricompensa: **Giocatore ottiene MN5 – Forza**.
5. Fine cutscene, comandi tornano al giocatore. Flag permanente (es. `stato.flags.rocca_cutscene_baso`).

**Finché Baso non torna** (flag `stato.flags.baso_liberato_cotral` o simile, da impostare quando
implementerò l'inseguimento su Percorso 11 — **nota**: oggi Percorso 11 non ha nessun trainer/scena
legata a Baso o al CoTrAL, quindi questo trigger di "ritorno" per ora resta un flag manuale/futuro,
non collegato a un evento reale finché non mi dici come si sblocca esattamente — es. sconfiggere un
trainer preciso su Percorso 11?):
- I 12 NPC del cerchio restano fermi in cerchio, **rivolti verso il centro** (da sistemare in Tiled:
  hai chiesto tu di controllare l'orientamento, lo imposto nei dati ma la direzione "verso il centro"
  dipende dalla posizione di ciascun clone — ve la calcolo io in base alle coordinate).
- Pokécenter e Market funzionano normalmente.
- La palestra ha il gate "Baso non c'è" (vedi §3).

**Quando Baso torna**: gli NPC del cerchio si liberano (tornano a `movimento: random`) con nuovo
dialogo *"Hai salvato Gianluca, sei un grande!"*, il gate della palestra sparisce, Baso è finalmente
sfidabile (**nota**: qui serve comunque l'interno-palestra che ancora non esiste, gap noto).

---

## 3. Gate NPC (due, distinti come confermato)

- **Gate palestra** (nuovo, da piazzare davanti a `palestra_rocco_door`): *"Baso non c'è, non vedi
  che sta succedendo?"* — `gate: true`, `condizione` legata al flag di ritorno di Baso (stesso di
  sopra).
- **Gate casa di Gianluca** (sul dot già presente): *"Qui non c'è più nessuno per far funzionare
  questo aggeggio."* — `gate: true`, stessa condizione/flag di liberazione.

---

## 4. Gianluca liberato — dialogo e funivia

- Dopo la liberazione, Gianluca appare sul dot "POST LIBERAZIONE" (fermo, sprite da assegnare).
- **Primo dialogo (una tantum)**: *"Grazie per avermi salvato, te ne sarò sempre grato! Usa pure la
  mia funivia quando vuoi!"* — flag permanente `stato.flags.gianluca_grato` (o simile).
- **Dialoghi successivi**: *"Vuoi salire in cima?"* → scelta Sì/No (nuovo pattern conferma, riuso
  dello stile "conferma" già usato altrove per azioni tipo rilascio Pokémon). Sì → teletrasporto
  diretto allo spawn di Monte Cavo (non un warp calpestabile, un'azione NPC come Taglio/Flauto).

---

## 5. Monte Cavo — Articuno + miniboss

- **Registrazione mappa**: `monte_cavo` in `MAPPE` (serve un layer collisioni — oggi il file non
  ne ha nessuno: lo aggiungo vuoto, tu disegni i muri veri in Tiled quando pronto).
- **Articuno**: oggetto `type: "pokemon leggendario"` sul dot esistente, `sprite: articuno`
  (id Pokédex 144 già mappato nel motore), livello da definire (proposta: 55-60, dimmi tu se altro).
- **Miniboss**: trainer `speciale: true` sul dot "MINIBOSS". Dialogo pre-lotta: *"Fermo lì, cosa
  credi di fare? Sto aspettando da anni questo momento, questo Pokémon è mio, è il mio destino."*
  Dialogo post-sconfitta: *"Evidentemente 'sto destino è una cagata."* + cura automatica squadra
  (funzione nuova, non esiste ancora) + ricompensa in soldi (quanto? propongo 2000-3000, alto perché
  è un miniboss unico — dimmi tu il numero).
  **Nome/classe/sprite/squadra del miniboss**: non specificati — te li propongo io (livello adeguato,
  tipo neutro non Ghiaccio per non oscurare la sfida di Articuno) o li scegli tu?
- **Oggetti**: MT nuova "Gelo Raggio" (Ice Beam, categoria MT trovabile sul campo, come
  `mt_semitraglia`/`mt_scavare` — non donata da palestra) + oggetto da tenere **Gelomai** (NeverMelt
  Ice): stesso pattern degli altri 13 oggetti-tipo già implementati (+20% danno mosse Ghiaccio).
  Posizioni: da decidere, segnaposto al centro mappa come il resto.

---

## 6. Ghiaccio scivoloso (Monte Cavo, tileset Caves.tsj)

- **Tile 944** (Caves.tsj) = ghiaccio: il giocatore, camminandoci sopra, continua a scivolare
  nell'ultima direzione premuta finché non incontra un ostacolo (collisione o bordo mappa) o un tile
  non-ghiaccio — a quel punto si ferma e può scegliere una nuova direzione. Standard Pokémon
  (Percorso Ghiacciato). Confermo di aver capito bene il funzionamento.
- **Tile 983 e 965** = collisione fissa. **Assunzione mia**: anche questi due sono sul tileset
  Caves.tsj (lo stesso di 944, e coerente col precedente già implementato per il tile 1213 = sasso).
  Se invece sono sul nuovo tileset Snow Tiles, dimmelo.
- **Nuovo tileset Snow Tiles**: trovato `sprites/snow tiles.tsj` (già presente, punta a
  `sprites/maps_tiled/snow tiles.png`, anche questo già presente) — verrà solo registrato in
  `TILESET_META`/`TILESET_IMMAGINI` per il rendering (decorativo, nessuna fisica speciale legata a
  questo tileset, la fisica del ghiaccio resta legata solo a Caves.tsj come da tua richiesta).

---

## 7. Cose da confermarmi prima di implementare

1. Testo esatto della 2ª e 3ª battuta iniziale del cerchio NPC (ho lasciato placeholder).
2. Come si sblocca "Baso è tornato" — un trainer preciso da battere su Percorso 11, o un flag che
   imposto a mano per ora (test) in attesa che tu costruisca quella parte?
3. Livello Articuno, nome/squadra/livello del miniboss, ricompensa in soldi del miniboss.
4. Salita Rocca→Montecavo: solo via Gianluca (nessun warp fisico), come interpretato al §1 — confermi?
5. Tile 983/965: Caves.tsj (come 944) o Snow Tiles?

Rispondimi anche solo sui punti che ti interessano correggere, il resto lo considero approvato così
com'è scritto.
