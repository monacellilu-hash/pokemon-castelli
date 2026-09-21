import json

BASE = "sprites/maps_tiled/via vittoria_{}.tmj"

def load(floor):
    return json.load(open(BASE.format(floor), encoding="utf-8"))

def save(floor, data):
    with open(BASE.format(floor), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

def eventi(data):
    return next(l for l in data["layers"] if l["name"] == "eventi")

def find_obj(data, obj_id):
    return next(o for o in eventi(data)["objects"] if o["id"] == obj_id)

def set_props(obj, props):
    obj["properties"] = [
        {"name": k, "type": ("bool" if isinstance(v, bool) else "int" if isinstance(v, int) else "string"),
         "value": v}
        for k, v in props.items()
    ]
    obj["point"] = True

def add_spawn(data, spawn_id, x, y):
    ev = eventi(data)
    new_id = data["nextobjectid"]
    data["nextobjectid"] = new_id + 1
    obj = {
        "height": 0, "id": new_id, "name": "spawn", "opacity": 1, "point": True,
        "properties": [
            {"name": "id", "type": "string", "value": spawn_id},
            {"name": "type", "type": "string", "value": "spawn"},
        ],
        "rotation": 0, "type": "", "visible": True, "width": 0, "x": x, "y": y,
    }
    ev["objects"].append(obj)

def warp_pair(fa, ida, fb, idb):
    da = load(fa)
    db = load(fb)
    oa = find_obj(da, ida)
    ob = find_obj(db, idb)
    spawn_a = f"spawn_{fa}_{ida}"
    spawn_b = f"spawn_{fb}_{idb}"
    set_props(oa, {"destinazione": f"via_vittoria_{fb}", "spawn_id": spawn_b, "type": "warp"})
    set_props(ob, {"destinazione": f"via_vittoria_{fa}", "spawn_id": spawn_a, "type": "warp"})
    add_spawn(da, spawn_a, oa["x"], oa["y"])
    add_spawn(db, spawn_b, ob["x"], ob["y"])
    save(fa, da)
    save(fb, db)

# ---- 1f <-> 2f (3 coppie) ----
warp_pair("1f", 1, "2f", 1)   # alto a sinistra
warp_pair("1f", 2, "2f", 2)   # alto/basso a destra
warp_pair("1f", 3, "2f", 3)   # secret

# ---- 1f <-> secret (stanza Moltres) ----
warp_pair("1f", 4, "secret", 3)

# ---- 1f <-> 3f (2 coppie) ----
warp_pair("1f", 8, "3f", 2)   # centrale <-> centrale
warp_pair("1f", 7, "3f", 3)   # basso a destra <-> in alto a destra (elimina per esclusione)

# ---- 3f <-> 4f (3f: porta rimasta "estremamente in alto al centro") ----
warp_pair("3f", 1, "4f", 3)   # "scala primo piano"

# ---- 4f <-> 5f ----
warp_pair("4f", 4, "5f", 1)   # "scala per il primo piano centrale alto" <-> "collegamento primo piano"

print("Fatto: 9 collegamenti bidirezionali cablati su via vittoria_1f/2f/3f/4f/5f/secret.")
