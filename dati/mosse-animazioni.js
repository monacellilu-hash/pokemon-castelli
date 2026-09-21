// Registro delle animazioni delle mosse (spritesheet presi da Essentials FRLG,
// Graphics/Animations, formato RPG Maker XP: griglia fissa a celle 192x192px,
// letta in ordine riga per riga da sinistra a destra). Copiati in
// sprites/animazioni_mosse/. Vedi ANIMAZIONI_SHEET per la scheda di ogni file
// (colonne/righe) e MOSSA_ANIMAZIONE/TIPO_ANIMAZIONE per capire quale sheet
// usa ogni mossa. Usato da js/battle.js (animaMossa).
//
// Non tutte le mosse hanno uno sheet dedicato: quando manca un match preciso
// si usa un fallback generico per tipo elementale (TIPO_ANIMAZIONE). Il
// fallback è una scelta ragionevole ma approssimativa (es. "estranho.png" per
// buio, "many.png" per coleottero) — va rivisto se Luca trova sheet migliori.

// Alcuni sheet sono stati controllati a occhio (fotogramma per fotogramma,
// vedi sessione 7 agosto in docs/ROADMAP.md per la diagnosi del problema
// originale) e hanno un campo `frames` con l'ordine giusto da riprodurre
// (indici nella griglia cols x rows, letta riga per riga) + `fps` dedicato.
// SOLO questi vengono davvero mostrati in battaglia (vedi risolviAnimazioneMossa
// sotto) — gli altri sheet restano nel registro come riferimento ma non sono
// ancora vagliati, per non mostrare sequenze mescolate a caso.
const ANIMAZIONI_SHEET = {
  // Rognodenti: righe 0-1 (8 celle) = fauci che si aprono e si richiudono di
  // scatto sul bersaglio. Righe 2-4 contengono altre mini-clip (vista dall'alto,
  // scintille) non usate per restare un morso pulito.
  crunch:        { file: 'Crunch.png',                     cols: 4, rows: 5,
                   frames: [0,1,2,3,4,5,6,7], fps: 12 },
  sandAttack:    { file: 'Sand-Attack.png',                 cols: 4, rows: 1 },
  scratch:       { file: 'Scratch + Shadow Claw.png',       cols: 4, rows: 3 },
  growl:         { file: 'Growl.png',                       cols: 4, rows: 1 },
  aerialAce:     { file: 'Aerial Ace.png',                  cols: 4, rows: 2 },
  rockTomb:      { file: 'Rock Tomb.png',                   cols: 4, rows: 2 },
  ironHead:      { file: 'Iron Head.png',                   cols: 4, rows: 3 },
  leechSeed:     { file: 'leech-seed.png',                  cols: 4, rows: 3 },
  waterPulse:    { file: 'Water pulse.png',                 cols: 5, rows: 3 },
  dragonClaw:    { file: 'dragon claw.png',                 cols: 5, rows: 3 },
  gust:          { file: 'Gust.png',                        cols: 4, rows: 1 },
  struggle:      { file: 'Struggle.png',                    cols: 4, rows: 1 },
  thunderShock:  { file: 'T. Shock.png',                    cols: 4, rows: 2 },
  fakeOut:       { file: 'Fakeout.png',                     cols: 5, rows: 2 },
  leer:          { file: 'leer.png',                        cols: 5, rows: 2 },
  block:         { file: 'block.png',                       cols: 5, rows: 2 },
  xScissor:      { file: 'X-Scizzor.png',                   cols: 4, rows: 1 },
  ancientPower:  { file: 'Ancient-PowerFilesheet.png',      cols: 5, rows: 3 },
  psychoCut:     { file: 'Psycho Cut.png',                  cols: 4, rows: 4 },
  fireBlast:     { file: 'fire blast.png',                  cols: 5, rows: 3 },
  // Fallback generici per tipo elementale (mosse fisiche/speciali senza sheet dedicato)
  tipoNormale:   { file: 'normal1.png',                     cols: 5, rows: 3 },
  // fire4: riga 0 (5 celle) = palla di fuoco che cresce, riga 1 (5 celle) =
  // esplosione che si spegne in braci — una sequenza unica e coerente.
  tipoFuoco:     { file: 'fire4.png',                       cols: 5, rows: 3,
                   frames: [0,1,2,3,4,5,6,7,8,9], fps: 18 },
  // water3: cella 0 è un anello verde scollegato (altra mini-clip, esclusa).
  // Frame 1-9 = colonna d'acqua che sale e ruota, poi si scioglie in vortici;
  // 10-11 = ultime gocce (coda finale morbida).
  tipoAcqua:     { file: 'water3.png',                      cols: 5, rows: 3,
                   frames: [1,2,3,4,5,6,7,8,9,10,11], fps: 15 },
  tipoElettro:   { file: 'electric1.png',                   cols: 5, rows: 3 },
  tipoErba:      { file: 'grass2.png',                      cols: 5, rows: 3 },
  tipoGhiaccio:  { file: 'Ice1.png',                         cols: 5, rows: 2 },
  tipoLotta:     { file: 'punches.png',                     cols: 5, rows: 4 },
  tipoVeleno:    { file: 'poison.png',                      cols: 5, rows: 3 },
  tipoTerra:     { file: 'Earth1.png',                       cols: 5, rows: 2 },
  tipoVolante:   { file: 'Wind1.png',                        cols: 5, rows: 3 },
  tipoPsico:     { file: 'Light1.png',                       cols: 5, rows: 3 },
  tipoColeottero:{ file: 'many.png',                        cols: 5, rows: 5 },
  tipoRoccia:    { file: 'rockice.png',                     cols: 5, rows: 3 },
  tipoSpettro:   { file: 'ghost1.png',                      cols: 5, rows: 3 },
  tipoDrago:     { file: 'dragon claw.png',                 cols: 5, rows: 3 },
  tipoBuio:      { file: 'estranho.png',                    cols: 5, rows: 3 },
  tipoAcciaio:   { file: 'Sword5.png',                      cols: 5, rows: 5 },
};

// Nome mossa PokéAPI (mossa.nome, es. "crunch") → chiave in ANIMAZIONI_SHEET.
// Elenco volutamente corto: solo le mosse per cui esiste davvero uno sheet
// dedicato e riconoscibile. Tutte le altre mosse fisiche/speciali usano il
// fallback per tipo (vedi TIPO_ANIMAZIONE sotto), le mosse di stato restano
// sullo scintillio generico esistente.
const MOSSA_ANIMAZIONE = {
  'crunch':        'crunch',
  'sand-attack':   'sandAttack',
  'scratch':       'scratch',
  'shadow-claw':   'scratch',
  'growl':         'growl',
  'aerial-ace':    'aerialAce',
  'rock-tomb':     'rockTomb',
  'iron-head':     'ironHead',
  'leech-seed':    'leechSeed',
  'water-pulse':   'waterPulse',
  'dragon-claw':   'dragonClaw',
  'gust':          'gust',
  'struggle':      'struggle',
  'thunder-shock': 'thunderShock',
  'fake-out':      'fakeOut',
  'leer':          'leer',
  'block':         'block',
  'x-scissor':     'xScissor',
  'ancient-power': 'ancientPower',
  'psycho-cut':    'psychoCut',
  'fire-blast':    'fireBlast',
};

// Tipo elementale (mossa.tipo, es. "fire") → chiave fallback in ANIMAZIONI_SHEET
const TIPO_ANIMAZIONE = {
  normal:   'tipoNormale',
  fire:     'tipoFuoco',
  water:    'tipoAcqua',
  electric: 'tipoElettro',
  grass:    'tipoErba',
  ice:      'tipoGhiaccio',
  fighting: 'tipoLotta',
  poison:   'tipoVeleno',
  ground:   'tipoTerra',
  flying:   'tipoVolante',
  psychic:  'tipoPsico',
  bug:      'tipoColeottero',
  rock:     'tipoRoccia',
  ghost:    'tipoSpettro',
  dragon:   'tipoDrago',
  dark:     'tipoBuio',
  steel:    'tipoAcciaio',
};

// Risolve lo sheet da usare per una mossa (o null se non c'è nulla, mosse di
// stato pure restano sullo scintillio generico in battle.js)
function risolviAnimazioneMossa(mossa) {
  const nome = mossa.nome || '';

  // Qualsiasi mossa "morso" (Morso, Rognodenti, Zannata di Fuoco/Gelo/Tuono,
  // Zanne Psichiche, Ultramorso ecc.) usa sempre il morso di Rognodenti,
  // indipendentemente dal tipo elementale della mossa — richiesta esplicita:
  // un morso deve sempre "chiudersi" sull'avversario.
  if (nome === 'crunch' || nome.includes('bite') || nome.includes('fang')) {
    return ANIMAZIONI_SHEET.crunch;
  }

  const chiave = MOSSA_ANIMAZIONE[nome] || TIPO_ANIMAZIONE[mossa.tipo];
  const sheet = chiave ? ANIMAZIONI_SHEET[chiave] : null;
  // Solo gli sheet con `frames` esplicito sono stati vagliati a occhio: gli
  // altri restano nel registro come riferimento ma non vengono mostrati
  // finché qualcuno non ne verifica l'ordine giusto dei fotogrammi.
  return (sheet && sheet.frames) ? sheet : null;
}
