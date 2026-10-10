# Roadmap animazioni mosse — stato reale (10 ott 2026)

Elenco di tutte le mosse con una voce in `ANIMAZIONI_ROM` (js/animazioni-essentials.js),
raggruppate per l'animazione che usano OGGI. Ogni gruppo con più di 1 mossa condivide
ancora un riuso generico (stessa grafica/coreografia per tipo o categoria) — quando una
mossa del gruppo riceve una coreografia VERA dedicata (dallo script originale in
pret/pokeemerald), esce dal gruppo e diventa una riga a parte da sola.

Le mosse SENZA alcuna voce qui (pure di stato, niente potenza) restano sul sistema
Essentials (`dati/animazioni_mosse_essentials.js`), non su questa lista.

Legenda: ✅ coreografia vera dedicata · 🔶 ancora sul riuso generico del gruppo.

---

## Fatte con coreografia vera (dedicata, non riuso)

- ✅ Lanciafiamme (FLAMETHROWER) — sess. precedente
- ✅ Idrocannone (HYDROPUMP) — sess. precedente
- ✅ Beccata (PECK) — 10 ott 2026
- ✅ Attacco Furia (FURYATTACK) — 10 ott 2026
- ✅ Doppio Calcio (DOUBLEKICK) — 10 ott 2026
- ✅ Raffica di Vento (GUST) — 10 ott 2026
- ✅ Pugnofuoco (FIREPUNCH) — 10 ott 2026 (particella small_ember + impatto)
- ✅ Pugnogelo (ICEPUNCH) — 10 ott 2026 (particella ice_crystals + impatto)
- ✅ Tuonopugno (THUNDERPUNCH) — 10 ott 2026 (particella spark + impatto)
- ✅ Centripugno (FOCUSPUNCH) — 10 ott 2026 (3 colpi in rapida successione, coreografia vera)

### Miglioria condivisa (non una voce a parte, ma vale per TUTTO il gruppo sotto)
- ✅ 10 ott 2026 — `_giocaImpattoRom` (l'helper condiviso da Pugno E Corno)
  ora fa balzare l'attaccante verso il bersaglio prima del lampo, come
  fa lo script vero (gBowMonSpriteTemplate) — prima mancava del tutto,
  solo il lampo sul bersaglio. Migliora insieme TUTTE le mosse dei due
  gruppi sotto, anche quelle ancora 🔶.

---

## Gruppi ancora sul riuso generico, in ordine di quante mosse coprono
(il numero è quante mosse diventano fedeli se/quando si fa la coreografia vera di quel gruppo)

### 🔶 16 — Pugno/impatto generico (_giocaPugnoRom, ora col balzo — vedi sopra)
Megapugno, Megacalcio, Comandopugno (DYNAMICPUNCH), Attacco Rapido Pugno
(MACHPUNCH), Proiettile (BULLETPUNCH), Prosciugopugno (DRAINPUNCH),
Sferza Cielo (SKYUPPERCUT), Braccio Martello (HAMMERARM), Testata
(HEADBUTT), Pestone (STOMP), Schianto (BODYSLAM), Colpo di Corpo (SLAM),
Doppio Fendente (DOUBLEEDGE), Pressing (TAKEDOWN), Smelling Salts,
Pugno Confuso (DIZZYPUNCH)
*(era 20, tolti i 3 pugni elementali + Centripugno sopra)*
⚠️ Proiettile (BULLETPUNCH)/Prosciugopugno (DRAINPUNCH)/Braccio Martello
(HAMMERARM) sono mosse Gen 4+: NON esistono in pret/pokeemerald (è
Smeraldo, Gen 3) — nessuno script vero da copiare per queste 3, resteranno
per sempre sul riuso generico (comunque migliorato dal balzo).

### 🔶 13 — Suono (_giocaSuonoRom)
Urlo (SCREECH), Rumorsuono (METALSOUND), Scarica Rumorosa (HYPERVOICE),
Botto Sonico (SONICBOOM), Rombo (UPROAR), Ululato (ROAR), Ringhio (GROWL),
Ninnananna (SING), Ipnoshock (SUPERSONIC), Russare (SNORE), Polvere
Sonnifera (SLEEPPOWDER), Ipnosi (HYPNOSIS), Spora (SPORE)

### 🔶 12 — Sguardo (_giocaSguardoRom)
Attrazione (ATTRACT), Mira (LOCKON), Sguardo Cupo (MEANLOOK), Fragranza
(SWEETSCENT), Blandisci (CAPTIVATE), Fascino (CHARM), Previsione
(FORESIGHT), Odora Pista (ODORSLEUTH), Sfottò (TAUNT), Bis (ENCORE),
Spavento (DISABLE), Tormento (TORMENT)

### 🔶 10 — Fuoco/Incendio generico (_giocaEmberRom)
Incendio (EMBER), Fuocobomba (FIREBLAST), Magma Vulcano (LAVAPLUME),
Scoppio di Fuoco (FLAMEBURST), Vampata (HEATWAVE), Giorno di Sole
(OVERHEAT), Brace (INCINERATE), Fuoco Fatuo (FIRESPIN), Eruzione
(ERUPTION), Fuoco Magico (MYSTICALFIRE)

### 🔶 10 — Potenziamento su se stessi (_giocaPotenziamentoRom)
Focus Energy, Spada Danza (SWORDSDANCE), Rafforza (HARDEN), Affila
(SHARPEN), Ululato (HOWL), Medita (MEDITATE), Bulk Up, Calma Mente
(CALMMIND), Danza Drago (DRAGONDANCE), Forza Cosmica (COSMICPOWER)

### 🔶 10 — Cura su se stessi (_giocaCuraRom)
Rilassamento (RECOVER), Covauova (SOFTBOILED), Riposo (REST), Sole
Mattutino (MORNINGSUN), Sintesi (SYNTHESIS), Latte Caldo (MILKDRINK),
Appollaio (ROOST), Scarico (SLACKOFF), Desiderio (WISH), Chiaro di Luna
(MOONLIGHT)

### 🔶 9 — Elettro generico (_giocaFulmineRom)
Tuonoshock (THUNDERSHOCK), Fulmine (THUNDERBOLT), Tuono (THUNDER),
Scintilla (SPARK), Scarica (DISCHARGE), Zapcannon (SHOCKWAVE), Palla
Elettro (ELECTROBALL), Scarica Elettrica (CHARGEBEAM), Elettrocannone
(ZAPCANNON)

### 🔶 9 — Scudo su se stessi (_giocaScudoRom)
Protezione (PROTECT), Individuazione (DETECT), Barriera Luce
(LIGHTSCREEN), Riflesso (REFLECT), Salvaguardia (SAFEGUARD), Resistenza
(ENDURE), Spike Shield, Barriera (BARRIER), Sostituto (SUBSTITUTE)

### 🔶 8 — Psico generico (_giocaPsywaveRom)
Psiraggio (PSYBEAM), Psichico (PSYCHIC), Extrasenso (EXTRASENSORY),
Psicobotta (FUTURESIGHT), Psicotaglio (PSYCHOCUT), Confusione
(CONFUSION), Accumulo Forza (STOREDPOWER) — più Fluttuonda (PSYWAVE)
già "capofila" del gruppo

### 🔶 8 — Acqua generico (_giocaWaterGunRom)
Bollaraggio (BUBBLE), Bollaspruzzo (BUBBLEBEAM), Idropulsar
(WATERPULSE), Salmastro (BRINE), Idrocaos (MUDDYWATER), Idrovortice
(WHIRLPOOL), Octazooka — più Idrogetto (WATERGUN) già "capofila"

### 🔶 7 — Erba generico (_giocaFoglieRom)
Foglia Magica (MAGICALLEAF), Palla Energia (ENERGYBALL), Uragano Erba
(LEAFSTORM), Semibomba (SEEDBOMB), Nodo Erba (GRASSKNOT), Foglielama
(RAZORLEAF), Leaftornado

### 🔶 7 — Taglio/sciabolata (_giocaSlashRom)
Lacerazione (SLASH), Notte Fonda (NIGHTSLASH), X-Forbici (XSCISSOR),
Fogliame Lama (LEAFBLADE), Attacco d'Ali (AERIALACE), Furia di Falci
(FURYCUTTER), Incrocio Veleno (CROSSPOISON)

*(gruppi sotto le 7 mosse — Assorbimento, Ghiaccio, Roccia, Corno,
Fanghiglia, Melma, Acciaio, Viticci, Artigli, Palla Ombra, Volante,
Drago, Raggio Segnale, Acido, Buio, Lotta, Osso, Esplosione — lasciati
per ultimi, meno impatto per mossa sistemata)*

---

## Come continuare
Quando riprendi: scegli un gruppo dall'alto (più mosse = più impatto),
controlla gli script veri in `data/battle_anim_scripts.s` (cartella
locale `pokeemerald-master/`, mai pushata) per le mosse più importanti
di quel gruppo, scrivi una funzione dedicata `_gioca<Nome>Rom` in
js/animazioni-essentials.js riusando gli helper già collaudati
(`_preparaAnimOnda`, `_particellaOndaVersoTarget`, `_giocaImpattoRom`,
`_scuotiSpriteRom` — MAI canvas scritto da zero a mano, per evitare il
bug del blocco turno risolto il 10 ott 2026), poi togli quella mossa dal
gruppo generico in `ANIMAZIONI_ROM` e aggiorna sia questo file sia
`sprites/animazioni_mosse_rom/FONTE.txt`.
