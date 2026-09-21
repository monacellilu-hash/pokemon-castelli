# CENSIMENTO MOSSE MULTI-TURNO — Gen 1-3 (fonte PokéAPI)

> Generato automaticamente da PokéAPI (GraphQL, generation_id ≤ 3, escluse le mosse speciali ID ≥ 10000).
> ID e `nome` sono quelli **PokéAPI**: il motore di battaglia identifica queste mosse per **nome inglese**.
> Stato **per singola mossa**: ✅ = già gestita nel motore (`battle.js`) · ❌ = comportamento non ancora implementato.


## CARICA — turno 1 si prepara, turno 2 colpisce (8) — fatte 8/8

- ✅ **13** `razor-wind` — Requires a turn to charge before attacking.
- ✅ **19** `fly` — User flies high into the air, dodging all attacks, and hits next turn.
- ✅ **76** `solar-beam` — Requires a turn to charge before attacking.
- ✅ **91** `dig` — User digs underground, dodging all attacks, and hits next turn.
- ✅ **130** `skull-bash` — Raises the user's Defense by one stage.  User charges for one turn before attacking.
- ✅ **143** `sky-attack` — User charges for one turn before attacking.  Has a $effect_chance% chance to make the target flinch.
- ✅ **291** `dive` — User dives underwater, dodging all attacks, and hits next turn.
- ✅ **340** `bounce` — User bounces high into the air, dodging all attacks, and hits next turn.

## RICARICA — dopo l'uso salta il turno successivo (4) — fatte 4/4

- ✅ **63** `hyper-beam` — User foregoes its next turn to recharge.
- ✅ **307** `blast-burn` — User foregoes its next turn to recharge.
- ✅ **308** `hydro-cannon` — User foregoes its next turn to recharge.
- ✅ **338** `frenzy-plant` — User foregoes its next turn to recharge.

## FURIA — bloccato 2-3 turni di fila, poi confusione (3) — fatte 3/3

- ✅ **37** `thrash` — Hits every turn for 2-3 turns, then confuses the user.
- ✅ **80** `petal-dance` — Hits every turn for 2-3 turns, then confuses the user.
- ✅ **200** `outrage` — Hits every turn for 2-3 turns, then confuses the user.

## PROTEZIONE / RESISTENZA — annulla il colpo (o sopravvive con 1 HP) (3) — fatte 2/3

- ✅ **182** `protect` — Prevents any moves from hitting the user this turn.
- ✅ **197** `detect` — Prevents any moves from hitting the user this turn.
- ❌ **203** `endure` — Prevents the user's HP from lowering below 1 this turn.

## SVENIMENTO DELL'UTENTE — la mossa fa svenire chi la usa (5) — fatte 2/5

- ✅ **120** `self-destruct` — User faints.
- ✅ **153** `explosion` — User faints.
- ❌ **194** `destiny-bond` — If the user faints this turn, the target automatically will, too.
- ❌ **262** `memento` — Lowers the target's Attack and Special Attack by two stages.  User faints.
- ❌ **288** `grudge` — If the user faints this turn, the PP of the move that fainted it drops to 0.

## CUMULO/LOCK — danno raddoppia ogni turno, lock 5 turni (Rotolamento) (2) — fatte 0/2

- ❌ **205** `rollout` — Power doubles every turn this move is used in succession after the first, resetting after five turns.
- ❌ **301** `ice-ball` — Power doubles every turn this move is used in succession after the first, resetting after five turns.

## LEGATURA — blocca la fuga + danno a fine turno per 2-5 turni (6) — fatte 0/6

- ❌ **20** `bind` — Prevents the target from fleeing and inflicts damage for 2-5 turns.
- ❌ **35** `wrap` — Prevents the target from fleeing and inflicts damage for 2-5 turns.
- ❌ **83** `fire-spin` — Prevents the target from fleeing and inflicts damage for 2-5 turns.
- ❌ **128** `clamp` — Prevents the target from fleeing and inflicts damage for 2-5 turns.
- ❌ **250** `whirlpool` — Prevents the target from leaving battle and inflicts 1/16 its max HP in damage for 2-5 turns.
- ❌ **328** `sand-tomb` — Prevents the target from fleeing and inflicts damage for 2-5 turns.

## BACCANO — forzato per più turni, impedisce il sonno (1) — fatte 0/1

- ❌ **253** `uproar` — Forced to use this move for several turns.  Pokémon cannot fall asleep in that time.

## DANNO RITARDATO — colpisce 2 turni dopo (2) — fatte 0/2

- ❌ **248** `future-sight` — Hits the target two turns later.
- ❌ **353** `doom-desire` — Hits the target two turns later.

## EFFETTO RITARDATO — cura/sonno al turno successivo (2) — fatte 0/2

- ❌ **273** `wish` — User will recover half its max HP at the end of the next turn.
- ❌ **281** `yawn` — Target sleeps at the end of the next turn.

## PAZIENZA — accumula 2 turni e restituisce il doppio (1) — fatte 0/1

- ❌ **117** `bide` — User waits for two turns, then hits back for twice the damage it took.

## POTENZA CRESCENTE (NON bloccante) — cresce con l'uso ripetuto ma libero (1) — fatte 0/1

- ❌ **210** `fury-cutter` — Power doubles every turn this move is used in succession after the first, maxing out after five turns.

---
**Riepilogo:** 38 mosse multi-turno/speciali · ✅ 19 fatte · ❌ 19 da fare.

### Note di precisione
- `endure` (Resistenza) e `destiny-bond`/`memento`/`grudge` finiscono nei gruppi affini per il testo, ma hanno logica propria: **non** sono ancora implementate (solo Protezione/Individuazione e Esplosione/Autodistruzione lo sono).
- `fury-cutter` raddoppia col testo simile a Rotolamento ma **non blocca** il Pokémon: è una normale mossa a potenza crescente.
- `whirlpool`, `bind`, `wrap`, `fire-spin`, `clamp`, `sand-tomb` = stesso comportamento di legatura (ailment PokéAPI `trap`).
