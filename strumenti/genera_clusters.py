# -*- coding: utf-8 -*-
"""
genera_clusters.py — legge i file .world di Tiled in sprites/maps_tiled/
e genera js/clusters.js, il registro dei "cluster" di mappe continue
(mappe che nel motore vanno percorse senza fade, come in Pokemon Smeraldo).

Uso: python strumenti/genera_clusters.py
"""

import json
import os
import re
import sys

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_MAPPE = os.path.join(RADICE, "sprites", "maps_tiled")
FILE_MAPJS = os.path.join(RADICE, "js", "map.js")
FILE_OUTPUT = os.path.join(RADICE, "js", "clusters.js")

TILE = 32


def leggi_registro_mappe():
    """Legge js/map.js e ricava {basename_file: chiave} dal blocco MAPPE = { ... }."""
    with open(FILE_MAPJS, "r", encoding="utf-8") as f:
        contenuto = f.read()

    # Isola il blocco "const MAPPE = { ... };" (fino alla chiusura bilanciata).
    inizio = contenuto.index("const MAPPE = {")
    apertura = contenuto.index("{", inizio)
    profondita = 0
    fine = None
    for i in range(apertura, len(contenuto)):
        if contenuto[i] == "{":
            profondita += 1
        elif contenuto[i] == "}":
            profondita -= 1
            if profondita == 0:
                fine = i + 1
                break
    blocco = contenuto[apertura:fine]

    # Trova ogni voce "  'chiave': { ... file: '...' ... },"
    # Approccio: scansiona le chiavi di primo livello con i loro sotto-blocchi.
    voci = re.finditer(r"'([a-zA-Z0-9_]+)':\s*\{", blocco)
    mappa_file_a_chiave = {}
    for m in voci:
        chiave = m.group(1)
        start_sub = m.end() - 1
        profondita = 0
        end_sub = None
        for i in range(start_sub, len(blocco)):
            if blocco[i] == "{":
                profondita += 1
            elif blocco[i] == "}":
                profondita -= 1
                if profondita == 0:
                    end_sub = i + 1
                    break
        sotto = blocco[start_sub:end_sub]
        file_match = re.search(r"file:\s*'([^']+)'", sotto)
        if file_match:
            basename = os.path.basename(file_match.group(1))
            # Match indipendente dall'estensione: i .world (fonte Tiled) spesso
            # referenziano il .tmx originale, mentre il registro usa il .tmj
            # esportato — stesso nome, estensione diversa.
            radice_basename = os.path.splitext(basename)[0]
            # Se più chiavi puntano allo stesso file, teniamo la prima
            # trovata (le successive sono alias di interni riusati) ma
            # segnaliamo comunque tutte per il matching dei .world.
            mappa_file_a_chiave.setdefault(radice_basename, chiave)

    return mappa_file_a_chiave


def dimensioni_da_tmj(percorso_tmj):
    with open(percorso_tmj, "r", encoding="utf-8") as f:
        dati = json.load(f)
    tilewidth = dati.get("tilewidth", TILE)
    tileheight = dati.get("tileheight", TILE)
    larghezza_px = dati["width"] * tilewidth
    altezza_px = dati["height"] * tileheight
    return larghezza_px, altezza_px


def main():
    if not os.path.isdir(DIR_MAPPE):
        print(f"ERRORE: cartella non trovata: {DIR_MAPPE}")
        sys.exit(1)

    file_world = sorted(
        f for f in os.listdir(DIR_MAPPE) if f.lower().endswith(".world")
    )
    if not file_world:
        print("ERRORE: nessun file .world trovato in", DIR_MAPPE)
        sys.exit(1)

    mappa_file_a_chiave = leggi_registro_mappe()

    clusters = {}
    mappe_non_risolte = []
    warning_allineamento = []

    for nome_world in file_world:
        percorso_world = os.path.join(DIR_MAPPE, nome_world)
        nome_cluster = os.path.splitext(nome_world)[0]

        with open(percorso_world, "r", encoding="utf-8") as f:
            dati_world = json.load(f)

        mappe_cluster = {}
        for voce in dati_world.get("maps", []):
            file_name = voce["fileName"]
            basename = os.path.basename(file_name)
            x_px = voce["x"]
            y_px = voce["y"]

            larghezza_px = voce.get("width")
            altezza_px = voce.get("height")
            if larghezza_px is None or altezza_px is None:
                percorso_tmj = os.path.join(DIR_MAPPE, file_name)
                if not os.path.isfile(percorso_tmj):
                    print(f"ERRORE: impossibile trovare {percorso_tmj} per ricavare le dimensioni")
                    sys.exit(1)
                larghezza_px, altezza_px = dimensioni_da_tmj(percorso_tmj)

            radice_basename = os.path.splitext(basename)[0]
            chiave = mappa_file_a_chiave.get(radice_basename)
            if chiave is None:
                mappe_non_risolte.append((nome_cluster, basename))
                continue

            # Verifica allineamento a multipli di TILE (32px)
            for nome_valore, valore in (
                ("x", x_px), ("y", y_px),
                ("width", larghezza_px), ("height", altezza_px),
            ):
                if valore % TILE != 0:
                    warning_allineamento.append(
                        f"{nome_cluster} / {basename}: {nome_valore}={valore}px non è multiplo di {TILE}"
                    )

            mappe_cluster[chiave] = {
                "offsetX": x_px // TILE,
                "offsetY": y_px // TILE,
                "w": larghezza_px // TILE,
                "h": altezza_px // TILE,
            }

        clusters[nome_cluster] = {
            "nome": nome_cluster,
            "mappe": mappe_cluster,
        }

    if mappe_non_risolte:
        print("AVVISO: le seguenti mappe nei .world non hanno una chiave corrispondente in MAPPE (js/map.js)")
        print("        — escluse dal cluster, restano collegate solo con warp/fade finché non vengono registrate:")
        for nome_cluster, basename in mappe_non_risolte:
            print(f"  - [{nome_cluster}] {basename}")
        print()

    # Genera js/clusters.js
    righe = []
    righe.append("// GENERATO AUTOMATICAMENTE da strumenti/genera_clusters.py — non modificare a mano")
    righe.append("const CLUSTERS = {")
    for nome_cluster, cluster in clusters.items():
        righe.append(f"  {nome_cluster}: {{")
        righe.append(f"    nome: '{cluster['nome']}',")
        righe.append("    mappe: {")
        for chiave, box in cluster["mappe"].items():
            righe.append(
                f"      {chiave}: {{ offsetX: {box['offsetX']}, offsetY: {box['offsetY']}, "
                f"w: {box['w']}, h: {box['h']} }},"
            )
        righe.append("    }")
        righe.append("  },")
    righe.append("};")
    righe.append("")

    with open(FILE_OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(righe))

    # Report
    print(f"Generato {FILE_OUTPUT}\n")
    for nome_cluster, cluster in clusters.items():
        mappe = cluster["mappe"]
        if not mappe:
            print(f"Cluster '{nome_cluster}': 0 mappe (vuoto)")
            continue
        min_x = min(b["offsetX"] for b in mappe.values())
        min_y = min(b["offsetY"] for b in mappe.values())
        max_x = max(b["offsetX"] + b["w"] for b in mappe.values())
        max_y = max(b["offsetY"] + b["h"] for b in mappe.values())
        print(f"Cluster '{nome_cluster}': {len(mappe)} mappe — bounding box tile "
              f"[{min_x}..{max_x}] x [{min_y}..{max_y}] "
              f"({max_x - min_x}×{max_y - min_y} tile)")
        for chiave in mappe:
            print(f"    - {chiave}")

    if warning_allineamento:
        print("\nWARNING — offset/dimensioni non allineati a 32px (controllare in Tiled):")
        for w in warning_allineamento:
            print(f"  - {w}")
    else:
        print("\nNessun warning di allineamento.")


if __name__ == "__main__":
    main()
