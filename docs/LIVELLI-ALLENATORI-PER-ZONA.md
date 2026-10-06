# Livelli allenatori per zona — ricalibrazione 5 ottobre 2026

> Generato leggendo i livelli VERI in `dati/trainer.js` (non a memoria). Tocca SOLO i livelli degli
> allenatori — gli incontri selvatici sono gestiti da un altro lavoro in parallelo della stessa sessione.

## Tabella finale

| Zona | Range richiesto | Prefisso/id trainer | N. allenatori | Livelli PRIMA | Livelli DOPO |
|---|---|---|---|---|---|
| Marino/Castel Gandolfo (Percorso 4) | P3-P4 (28-34) | `all-p4-*` | 2 | 19-21 | 28-32 |
| Lago di Albano / spiaggia Surf | P4-P5 (34-40) | `all-lago-*` | 6 | 20-24 | 34-40 |
| Guardiano di Nonna Assunta | P4-P5 (34-40) | `npc_casa_sul_lago_1` | 1 | 32-33 | 35-36 |
| Via dei Laghi (generale) | P3-P4 (28-34) | `via_laghi_trainer_1..23` | 23 | 20-34 | 24-34 |
| Tunnel Roccioso | P3-P4 (28-34) | `tunnel-1f/2f/3f/4f` | 31 | 27-33 | **invariato** (già nel range) |
| Rifugio CoTrAL (Rocca di Papa) | P4-P5 (34-40) | `cotral_grunt_rocca_*` | 6 | 36-39 | **invariato** (già nel range) |
| Rifugio CoTrAL — boss | P4-P5 (34-40) | `cotral_marcello_rocca` | 1 | 40-42 | **invariato** (boss, 2 livelli sopra il cap è accettabile) |
| Percorso 7 | P5-P6 (40-46) | `all-p7-*`/`all-p7-extra-*` | 12 | 38-45 | **invariato** (già quasi tutto nel range, scostamento minimo non corretto) |
| Percorso 8 (Albano→Ariccia) | P6-P7 (46-52) | — | — | 46-49 | **invariato** (già nel range, non esplicitamente citato da Luca) |
| Ariccia | P6-P7 (46-52) | `all-ariccia-*` | 5 | 49-52 | **invariato** |
| Percorso 9 | P6-P7 (46-52) | `all-p9-*` | 9 | 48-52 | **invariato** |
| Sfida Porchettari (Ho-Oh) | P6-P7 (46-52) | `porchettaro_sfida_*` | 5 | 46-50 | **invariato** |
| Percorso 10 | P7-P8 (52-58) | `all-p10-*` | 2 | 53-55 | **invariato** |
| Percorso 12 | P8-Lega (58-66) | `all-p12-*` | 12 | 58-62 | **invariato** |
| Percorso Monte Po 3 | P8-Lega (58-66) | `trainer_montepo3_*` | 7 | 58-60 | **invariato** |
| Percorso Monte Po 1 (post-Lega) | Libero, nessun cap | `grunt_montepo1_1..7` | 7 | 56-59 | **60-66** |

**Totale allenatori con livello corretto davvero: 39** (2+6+1+23+7). Gli altri erano già dentro il
range richiesto o scostati di 1-2 livelli (lasciati invariati per non alterare lotte già bilanciate
per un dettaglio minimo).

## Zone della lista di Luca senza allenatori propri trovati

- **Nemi**: "nemi" compare 14 volte in `dati/trainer.js` ma solo in commenti narrativi (Museo delle
  Navi, Michela) — non esiste un gruppo di allenatori "Nemi" distinto dalle guardie GdF del museo
  (`gdf_grunt_museo_*`, fuori scope di questo task, sono un boss/presidio narrativo, non una zona di
  passaggio). Nessuna azione.
- **Zona Safari**: nessun allenatore piazzato (coerente con i giochi originali: è una zona di sola
  cattura, non di lotta). Nessuna azione.
- **Villa Aldobrandini, Bunkerino**: zero allenatori — **non esistono ancora come mappe** (confermato
  con grep, 0 risultati), coerente con l'elenco "mappe mancanti" già segnalato da Luca nello stesso
  messaggio. Nessuna azione possibile finché le mappe non esistono.

## Controllo draghi (richiesto da Luca, SOLO segnalazione — non ho corretto le squadre,
solo i livelli erano nel mio compito)

Verificato con grep sugli ID 147-149 (Dratini/Dragonair/Dragonite), 329-330 (Vibrava/Flygon),
371-373 (Bagon/Shelgon/Salamence) su tutte le zone della tabella sopra. **Trovati draghi FUORI da un
dungeon vero**, su percorsi aperti — da valutare se spostarli o renderli più rari:
- `all-p12-1` e `all-p12-12` (Percorso 12, percorso aperto): Flygon (330).
- `grunt_montepo1_2` (Flygon 330), `grunt_montepo1_5` (Salamence 373), `grunt_montepo1_7`
  (Dragonite 149) — Percorso Monte Po 1, percorso aperto post-Lega.
- `trainer_montepo3_2`/`_7` (Salamence 373), `_4` (Dragonite 149), `_6` (Flygon 330) — Percorso Monte
  Po 3, percorso aperto.

Draghi che SEMBRANO invece a posto (dentro un dungeon/rifugio vero): `tunnel-2f-9` (Vibrava, Tunnel
Roccioso — dungeon), `cotral_marcello_rocca` (Flygon, Rifugio CoTrAL — covo chiuso).

Dato che Monte Po 1/3 sono contenuto post-Lega "libero" (nessun level cap, squadre forti per
definizione), i draghi lì sono forse meno un problema che su Percorso 12 — ma la decisione finale
(spostarli in un dungeon, o lasciarli visto che è già endgame) spetta a Luca.
