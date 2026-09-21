# -*- coding: utf-8 -*-
"""
genera_mt_tutte_mosse.py — legge Essentials FRLG/PBS/moves.txt e genera
dati/mt_tutte_mosse.js: un oggetto MT_TUTTE_LE_MOSSE con una MT "trovabile sul
campo" per OGNI mossa del file (chiave mt_<slug-inglese>, stesso pattern già
usato per mt_semitraglia/mt_scavare/mt_gelo_raggio ecc.).

Non tutte verranno piazzate nel mondo — servono solo ad avere il sistema
pronto (zaino/market/apprendimento) per qualunque mossa, senza doverle
aggiungere una per una a mano in futuro.

Uso: python strumenti/genera_mt_tutte_mosse.py
"""
import os
import re
import json

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE_MOVES = os.path.join(RADICE, "Essentials FRLG", "PBS", "moves.txt")
FILE_OUTPUT = os.path.join(RADICE, "dati", "mt_tutte_mosse.js")


def slug(nome_display):
    s = nome_display.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def chiave_python_sicura(s):
    # chiave oggetto JS: mt_ + slug con underscore al posto del trattino
    return "mt_" + s.replace("-", "_")


def main():
    with open(FILE_MOVES, "r", encoding="utf-8") as f:
        testo = f.read()

    blocchi = re.split(r"^\[", testo, flags=re.MULTILINE)[1:]
    mosse = []
    for blocco in blocchi:
        header, _, corpo = blocco.partition("]")
        m_name = re.search(r"^Name\s*=\s*(.+)$", corpo, re.MULTILINE)
        if not m_name:
            continue
        nome_display = m_name.group(1).strip()
        s = slug(nome_display)
        if not s:
            continue
        mosse.append((chiave_python_sicura(s), nome_display, s))

    # Dedup (alcune mosse potrebbero generare lo stesso slug in teoria)
    viste = set()
    righe = []
    righe.append("/* dati/mt_tutte_mosse.js — GENERATO da strumenti/genera_mt_tutte_mosse.py")
    righe.append("   (fonte: Essentials FRLG/PBS/moves.txt). NON modificare a mano: rilancia")
    righe.append("   lo script se moves.txt cambia.")
    righe.append("")
    righe.append("   Una MT 'trovabile sul campo' per OGNI mossa del gioco (stesso pattern di")
    righe.append("   mt_semitraglia/mt_scavare/mt_gelo_raggio già in js/data.js OGGETTI) — non")
    righe.append("   tutte verranno piazzate nel mondo, ma esistono già a sistema (zaino,")
    righe.append("   apprendimento, market) per quando servirà.")
    righe.append("")
    righe.append("   NOTA: 'nome' qui è ancora in INGLESE (nome della mossa da moves.txt) — le MT")
    righe.append("   già in OGGETTI (mt_semitraglia, mt05, mt_gelo_raggio, ecc.) restano quelle")
    righe.append("   con nome/descrizione in italiano già scritte a mano: NON sono duplicate qui")
    righe.append("   (stesso mossa= slug -> stessa chiave mt_<slug>, l'oggetto Object.assign in")
    righe.append("   js/data.js dà priorità alle versioni italiane già esistenti). Da tradurre in")
    righe.append("   italiano una per volta quando una di queste verrà davvero piazzata/donata.")
    righe.append("*/")
    righe.append("const MT_TUTTE_LE_MOSSE = {")
    for chiave, nome_display, s in mosse:
        if chiave in viste:
            continue
        viste.add(chiave)
        nome_js = nome_display.replace("\\", "\\\\").replace("'", "\\'")
        righe.append(
            "  %s: { nome: 'MT — %s', categoria: 'mt', mossa: '%s', prezzo: 2000, icona: '\U0001F4BF',"
            % (chiave, nome_js, s)
        )
        righe.append("               descrizione: 'Insegna %s. (nome provvisorio in inglese, da rivedere quando verrà piazzata)' }," % nome_js)
    righe.append("};")
    righe.append("")
    righe.append("if (typeof module !== 'undefined' && module.exports) module.exports = MT_TUTTE_LE_MOSSE;")
    righe.append("")

    with open(FILE_OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(righe))

    print("Generate", len(viste), "MT su", len(mosse), "mosse totali in moves.txt")
    print("Scritto:", FILE_OUTPUT)


if __name__ == "__main__":
    main()
