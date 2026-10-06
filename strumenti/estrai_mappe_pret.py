# -*- coding: utf-8 -*-
"""
estrai_mappe_pret.py — converte una mappa da pret/pokeemerald o pret/pokefirered
(le decompilazioni open source pubbliche dei giochi originali) in un file Tiled
.tmj + tileset PNG, pronti da controllare in Tiled prima di usarli nel progetto.

5 ottobre 2026: questo È il vero "convert2.py" perduto (visto nel commit
1681e26 del 4 ottobre 2026, mai salvato a suo tempo) — Luca l'ha ritrovato e
incollato in chat. Una prima riscrittura da zero fatta nella stessa sessione
(prima di questo ritrovamento) aveva ancora 2 bug veri (palette non applicata,
tile dei tetti presi dal foglio sbagliato), scoperti testando su Pallet Town
vera — QUESTA versione, testata subito dopo sullo stesso identico caso, è
risultata corretta al primo colpo: non li ha. Se in futuro qualcosa non va,
ripartire da qui, non dalla riscrittura precedente (superata, non più nel
progetto).

Differenze dall'originale incollato da Luca:
  - Scarica da GitHub via HTTP (raw.githubusercontent.com): NON serve clonare
    pret in locale, basta la connessione.
  - Aggiunta una riga di comando (vedi in fondo) al posto della chiamata
    diretta a convert_map() in uno script a parte.
  - PROJECT di default punta a strumenti/output_mappe_estratte/ (cartella di
    prova), NON direttamente a sprites/maps_tiled/ — scelta di sicurezza:
    controlla sempre il risultato in Tiled prima di spostarlo nel progetto
    vero. Se preferisci scriva direttamente nel progetto, cambia PROJECT.

Dopo l'estrazione, passi MANUALI sempre necessari (lo script non li fa):
  1. Apri il .tmj in Tiled e controlla che abbia senso visivamente.
  2. Sposta .tmj in sprites/maps_tiled/ e il _tileset.png in sprites/.
  3. Registra il tileset in js/map.js (TILESET_IMMAGINI + TILESET_META) e la
     mappa in MAPPE — lo script non tocca js/map.js.
  4. Ricollega ogni "uscita" (oggi segnaposto con nota_origine) alla mappa
     giusta del progetto con destinazione/spawn_id veri.
  5. Gli "npc_*" generati sono SOLO segnaposto con `nota_origine` (il nome
     grafico originale pret, es. OBJ_EVENT_GFX_PROF_OAK) — vanno rifatti a
     mano in dati/npc.js/dati/trainer.js come per ogni mappa, pret non ha un
     formato compatibile con le convenzioni di questo progetto per NPC/
     allenatori/incontri.
"""

import argparse
import json
import os
import struct
import sys
import urllib.request

try:
    from PIL import Image
except ImportError:
    print("Serve Pillow: python -m pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = "C:/Users/Luca/AppData/Local/Temp/conv"   # cache locale dei file scaricati da pret
PROJECT = os.path.join(os.path.dirname(__file__), "output_mappe_estratte")

REPO = {
    'emerald': "https://raw.githubusercontent.com/pret/pokeemerald/master",
    'firered': "https://raw.githubusercontent.com/pret/pokefirered/master",
}

# Split primario/secondario diverso tra progetti pret: emerald segue le
# costanti GBA "standard" (512 metatile / 6 palette primarie), firered usa
# un fieldmap.h diverso (640 metatile / 7 palette primarie). Confermato
# leggendo include/fieldmap.h di ciascun repo, non e' uguale a emerald.
SPLIT = {
    'emerald': {'metatiles': 512, 'pals': 6},
    'firered': {'metatiles': 640, 'pals': 7},
}


def fetch(url, path):
    if os.path.exists(path):
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    urllib.request.urlretrieve(url, path)


def load_pal(path):
    lines = open(path).read().splitlines()
    n = int(lines[2])
    return [tuple(map(int, lines[3 + i].split())) for i in range(n)]


def tileset_name_from_const(const):
    n = const.replace('gTileset_', '')
    out = []
    for i, c in enumerate(n):
        # underscore prima di una maiuscola O di una cifra (es. "Building2"
        # -> "building_2") - scoperto il 5 ott 2026 con ThreeIsland_House2:
        # gTileset_GenericBuilding2 e' davvero "generic_building_2" su
        # GitHub, non "generic_building2" come produceva la versione prima.
        if i > 0 and (c.isupper() or (c.isdigit() and not n[i - 1].isdigit())):
            out.append('_')
        out.append(c.lower())
    return ''.join(out)


def ensure_tileset(game, kind, name):
    raw = REPO[game]
    local = f"{ROOT}/tilesets/{game}_{kind}_{name}"
    fetch(f"{raw}/data/tilesets/{kind}/{name}/tiles.png", f"{local}/tiles.png")
    fetch(f"{raw}/data/tilesets/{kind}/{name}/metatiles.bin", f"{local}/metatiles.bin")
    fetch(f"{raw}/data/tilesets/{kind}/{name}/metatile_attributes.bin", f"{local}/metatile_attributes.bin")
    for i in range(16):
        fetch(f"{raw}/data/tilesets/{kind}/{name}/palettes/{i:02d}.pal", f"{local}/palettes/{i:02d}.pal")

    im = Image.open(f'{local}/tiles.png')
    w, h = im.size
    cols, rows = w // 8, h // 8
    px = im.load()
    tiles = []
    for ty in range(rows):
        for tx in range(cols):
            tiles.append([[px[tx * 8 + x, ty * 8 + y] for x in range(8)] for y in range(8)])
    mb = open(f'{local}/metatiles.bin', 'rb').read()
    metatiles = []
    for m in range(len(mb) // 16):
        entries = []
        for s in range(8):
            v = struct.unpack_from('<H', mb, m * 16 + s * 2)[0]
            entries.append((v & 0x3FF, (v >> 10) & 1, (v >> 11) & 1, (v >> 12) & 0xF))
        metatiles.append(entries)
    pals = [load_pal(f'{local}/palettes/{i:02d}.pal') for i in range(16)]
    ab = open(f'{local}/metatile_attributes.bin', 'rb').read()
    n_meta = len(metatiles)
    # Formato attributi variabile tra progetti pret: pokeemerald usa 2 byte
    # per metatile (layertype bit 12-13), pokefirered 4 byte (layertype bit
    # 29-30) - rilevato confrontando la dimensione del file col numero di
    # metatile invece di assumere sempre lo stesso formato.
    layertypes = []
    if n_meta and len(ab) // n_meta == 4:
        for m in range(n_meta):
            v = struct.unpack_from('<I', ab, m * 4)[0]
            layertypes.append((v >> 29) & 0x3)
    else:
        for m in range(len(ab) // 2):
            v = struct.unpack_from('<H', ab, m * 2)[0]
            layertypes.append((v >> 12) & 0x3)
    return tiles, metatiles, pals, layertypes


def convert_map(game, map_name, out_basename, id_suffix='', sopra_nome='sopra_testa', skip_var=True):
    """Converte una mappa (pokeemerald o pokefirered) in .tmj+tileset PNG.
    sopra_nome: nome del layer per il "top" dei metatile COVERED/SPLIT
    (davanti al giocatore) - default 'sopra_testa', puo' diventare 'edifici'
    su richiesta (Luca, 5 ott 2026: per alcune mappe vuole SOLO
    ground/deco_sotto/edifici, niente livello davanti al giocatore)."""
    raw = REPO[game]
    map_json = json.load(urllib.request.urlopen(f'{raw}/data/maps/{map_name}/map.json'))
    layout_id = map_json['layout']
    layouts = json.load(urllib.request.urlopen(f'{raw}/data/layouts/layouts.json'))
    layout = next(l for l in layouts['layouts'] if l and l.get('id') == layout_id)
    MW, MH = layout['width'], layout['height']
    prim_name = tileset_name_from_const(layout['primary_tileset'])
    sec_name = tileset_name_from_const(layout['secondary_tileset'])

    prim_tiles, prim_meta, prim_pals, prim_lt = ensure_tileset(game, 'primary', prim_name)
    sec_tiles, sec_meta, sec_pals, sec_lt = ensure_tileset(game, 'secondary', sec_name)
    split = SPLIT[game]
    META_SPLIT = split['metatiles']
    NUM_PALS_IN_PRIMARY = split['pals']
    combined_tiles = prim_tiles + sec_tiles
    combined_pals = prim_pals[:NUM_PALS_IN_PRIMARY] + sec_pals[NUM_PALS_IN_PRIMARY:]

    def entries_for(meta_id):
        return prim_meta[meta_id] if meta_id < META_SPLIT else sec_meta[meta_id - META_SPLIT]

    def layertype_for(meta_id):
        lt = prim_lt if meta_id < META_SPLIT else sec_lt
        idx = meta_id if meta_id < META_SPLIT else meta_id - META_SPLIT
        return lt[idx] if idx < len(lt) else 0

    def layer_image(meta_id, layer):
        entries = entries_for(meta_id)
        img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
        positions = [(0, 0), (8, 0), (0, 8), (8, 8)]
        for i in range(4):
            tile_id, hflip, vflip, pal_id = entries[layer * 4 + i]
            tile = combined_tiles[tile_id] if tile_id < len(combined_tiles) else [[0] * 8] * 8
            pal = combined_pals[pal_id] if pal_id < len(combined_pals) else [(0, 0, 0)] * 16
            px0, py0 = positions[i]
            for y in range(8):
                for x in range(8):
                    sx = (7 - x) if hflip else x
                    sy = (7 - y) if vflip else y
                    idx = tile[sy][sx]
                    if layer == 1 and idx == 0:
                        continue
                    r, g, b = pal[idx]
                    img.putpixel((px0 + x, py0 + y), (r, g, b, 255))
        return img.resize((32, 32), Image.NEAREST)

    map_bin_path = f"{ROOT}/tilesets/{game}_layout_{layout_id}_map.bin"
    fetch(f"{raw}/{layout['blockdata_filepath']}", map_bin_path)
    map_bin = open(map_bin_path, 'rb').read()
    grid = []
    for row in range(MH):
        r = []
        for col in range(MW):
            off = (row * MW + col) * 2
            v = struct.unpack_from('<H', map_bin, off)[0]
            r.append((v & 0x3FF, (v >> 10) & 0x3))
        grid.append(r)

    tile_index = {}
    tile_entries = []

    def gid_per(meta_id, layer):
        key = (meta_id, layer)
        if key not in tile_index:
            tile_index[key] = len(tile_entries)
            tile_entries.append(key)
        return tile_index[key] + 1

    ground_data, deco_data, sopra_data, collision_rects = [], [], [], []
    for row in range(MH):
        for col in range(MW):
            meta_id, coll = grid[row][col]
            ground_data.append(gid_per(meta_id, 0))
            top_gid = gid_per(meta_id, 1)
            if layertype_for(meta_id) == 0:
                deco_data.append(top_gid)
                sopra_data.append(0)
            else:
                deco_data.append(0)
                sopra_data.append(top_gid)
            if coll != 0:
                collision_rects.append((col, row))

    N = len(tile_entries)
    COLS = 16
    ROWS = (N + COLS - 1) // COLS
    tileset_img = Image.new('RGBA', (COLS * 32, ROWS * 32), (0, 0, 0, 0))
    for i, (meta_id, layer) in enumerate(tile_entries):
        im = layer_image(meta_id, layer)
        tileset_img.paste(im, ((i % COLS) * 32, (i // COLS) * 32))
    os.makedirs(PROJECT, exist_ok=True)
    tileset_path = f"{PROJECT}/{out_basename}_tileset.png"
    tileset_img.save(tileset_path)

    event_objects = []
    oid = 1
    for i, ev in enumerate(map_json['object_events']):
        if skip_var and '_VAR_' in ev['graphics_id']:
            continue
        event_objects.append({
            "id": oid, "name": f"npc_{out_basename}_{i+1}{id_suffix}", "type": "", "point": True,
            "x": ev['x'] * 32 + 16, "y": (ev['y'] + 1) * 32, "width": 0, "height": 0,
            "rotation": 0, "visible": True,
            "properties": [
                {"name": "type", "type": "string", "value": "npc"},
                {"name": "id", "type": "string", "value": f"npc_{out_basename}_{i+1}{id_suffix}"},
                {"name": "nota_origine", "type": "string", "value": ev['graphics_id']},
            ],
        })
        oid += 1
    for i, wp in enumerate(map_json['warp_events']):
        event_objects.append({
            "id": oid, "name": f"uscita_{i+1}{id_suffix}", "type": "", "x": wp['x'] * 32, "y": wp['y'] * 32,
            "width": 32, "height": 32, "rotation": 0, "visible": True,
            "properties": [
                {"name": "type", "type": "string", "value": "uscita"},
                {"name": "nota_origine", "type": "string",
                 "value": "verso " + wp['dest_map'] + " (da ricollegare a una tua mappa)"},
            ],
        })
        oid += 1

    collision_objects = [{
        "id": 1000 + i, "name": "", "type": "", "x": c * 32, "y": r * 32,
        "width": 32, "height": 32, "rotation": 0, "visible": True, "properties": [],
    } for i, (c, r) in enumerate(collision_rects)]

    layers = [
        {"id": 1, "name": "ground", "type": "tilelayer",
         "width": MW, "height": MH, "data": ground_data,
         "opacity": 1, "visible": True, "x": 0, "y": 0},
        {"id": 2, "name": "deco_sotto", "type": "tilelayer",
         "width": MW, "height": MH, "data": deco_data,
         "opacity": 1, "visible": True, "x": 0, "y": 0},
    ]
    if any(sopra_data):
        layers.append({"id": 3, "name": sopra_nome, "type": "tilelayer",
                        "width": MW, "height": MH, "data": sopra_data,
                        "opacity": 1, "visible": True, "x": 0, "y": 0})
    layers.append({"id": 4, "name": "collisioni", "type": "objectgroup",
                    "opacity": 1, "visible": True, "x": 0, "y": 0, "objects": collision_objects})
    layers.append({"id": 5, "name": "eventi", "type": "objectgroup",
                    "opacity": 1, "visible": True, "x": 0, "y": 0, "objects": event_objects})

    tmj = {
        "compressionlevel": -1, "width": MW, "height": MH,
        "tilewidth": 32, "tileheight": 32, "infinite": False,
        "orientation": "orthogonal", "renderorder": "right-down",
        "type": "map", "version": "1.10", "tiledversion": "1.11.0",
        "nextlayerid": 6, "nextobjectid": oid + len(collision_objects),
        "tilesets": [{
            "firstgid": 1, "image": f"{out_basename}_tileset.png",
            "imagewidth": COLS * 32, "imageheight": ROWS * 32,
            "columns": COLS, "tilecount": N, "tilewidth": 32, "tileheight": 32,
            "name": f"{out_basename}_tileset", "margin": 0, "spacing": 0,
        }],
        "layers": layers,
    }
    out_path = f"{PROJECT}/{out_basename}.tmj"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(tmj, f, ensure_ascii=False, indent=1)
    print(f"{out_basename}: {MW}x{MH}, {N} tile, {len(map_json['object_events'])} NPC(grezzi), "
          f"{len(map_json['warp_events'])} uscite, {len(collision_rects)} celle collisione -> {out_path}")
    return out_path, tileset_path


def main():
    p = argparse.ArgumentParser(description="Estrae una mappa da pret/pokeemerald o pret/pokefirered in formato Tiled.")
    p.add_argument("--gioco", choices=["emerald", "firered"], required=True)
    p.add_argument("--mappa", required=True, help="Nome esatto della mappa in data/maps/ (es. PalletTown)")
    p.add_argument("--nome-output", help="Nome base dei file generati (default: nome mappa in minuscolo)")
    args = p.parse_args()
    out_basename = args.nome_output or args.mappa.lower()
    convert_map(args.gioco, args.mappa, out_basename)


if __name__ == "__main__":
    main()
