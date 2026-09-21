#!/usr/bin/env python3
"""Ritaglia gli sfondi dei Box PC (Essentials FRLG/Graphics/UI/Storage/box_N.png,
originali 324x296) a 345x245, e li copia in sprites/ui_storage/ con lo stesso nome.
Usa il numero 3 al posto del 16 (richiesta esplicita di Luca: il 16 non piaceva).

L'altezza (296 -> 245) si ottiene TAGLIANDO la parte in alto (si tengono le
ultime 245 righe in basso, non uno schiacciamento) — richiesta esplicita di
Luca. La larghezza (324 -> 345) resta invece un ridimensionamento normale,
perché per quella non è stata chiesta nessuna regola di ritaglio.
Uso: python strumenti/ridimensiona_box.py
"""
from pathlib import Path
from PIL import Image

RADICE = Path(__file__).resolve().parent.parent
SORGENTE = RADICE / "Essentials FRLG" / "Graphics" / "UI" / "Storage"
DEST = RADICE / "sprites" / "ui_storage"

NUMERI = [3] + list(range(17, 40))  # 24 box: 3, 17..39 (niente 16)
LARGHEZZA_FINALE = 345
ALTEZZA_FINALE = 245

for n in NUMERI:
    src = SORGENTE / f"box_{n}.png"
    dst = DEST / f"box_{n}.png"
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    # Taglia la parte SOPRA: tiene solo le ultime ALTEZZA_FINALE righe in basso.
    tagliata = im.crop((0, h - ALTEZZA_FINALE, w, h))
    finale = tagliata.resize((LARGHEZZA_FINALE, ALTEZZA_FINALE), Image.LANCZOS)
    finale.save(dst)
    print(f"box_{n}.png: {im.size} -> tagliata {tagliata.size} -> {finale.size}")

print(f"\nFatto: {len(NUMERI)} immagini salvate in {DEST}")
