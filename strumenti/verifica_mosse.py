#!/usr/bin/env python3
"""Confronta le MT/MN definite in js/data.js con i dati canonici di
Essentials FRLG/PBS/moves.txt (potenza dichiarata nella descrizione italiana
vs Power reale). Stampa un report delle discrepanze trovate.
Uso: python strumenti/verifica_mosse.py
"""
import re
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
MOVES_TXT = RADICE / "Essentials FRLG" / "PBS" / "moves.txt"
DATA_JS = RADICE / "js" / "data.js"


def parse_moves_txt(percorso):
    testo = percorso.read_text(encoding="utf-8-sig")
    blocchi = re.split(r"(?m)^\[(\w+)\]$", testo)[1:]
    mosse = {}
    for i in range(0, len(blocchi), 2):
        chiave = blocchi[i]
        corpo = blocchi[i + 1]
        campi = {}
        for riga in corpo.splitlines():
            m = re.match(r"(\w+)\s*=\s*(.*)", riga)
            if m:
                campi[m.group(1)] = m.group(2).strip()
        mosse[chiave] = campi
    return mosse


def slug_a_chiave_pbs(slug):
    # "razor-leaf" -> "RAZORLEAF"
    return slug.replace("-", "").upper()


def estrai_mt_data_js(percorso):
    testo = percorso.read_text(encoding="utf-8")
    voci = []
    for m in re.finditer(
        r"(\w+):\s*\{\s*nome:\s*'([^']+)',\s*categoria:\s*'mt',\s*mossa:\s*'([^']+)',.*?"
        r"descrizione:\s*'([^']+)'",
        testo,
        re.DOTALL,
    ):
        voci.append({
            "chiave_oggetto": m.group(1),
            "nome": m.group(2),
            "mossa": m.group(3),
            "descrizione": m.group(4),
        })
    return voci


def main():
    mosse_pbs = parse_moves_txt(MOVES_TXT)
    mt_data_js = estrai_mt_data_js(DATA_JS)

    print(f"MT/MN trovate in js/data.js: {len(mt_data_js)}")
    print(f"Mosse censite in moves.txt: {len(mosse_pbs)}\n")

    problemi = 0
    for voce in mt_data_js:
        chiave_pbs = slug_a_chiave_pbs(voce["mossa"])
        pbs = mosse_pbs.get(chiave_pbs)
        if pbs is None:
            print(f"[MANCANTE] {voce['chiave_oggetto']} -> slug '{voce['mossa']}' "
                  f"(chiave PBS attesa '{chiave_pbs}') non trovata in moves.txt")
            problemi += 1
            continue

        m_potenza = re.search(r"potenza\s+(\d+)", voce["descrizione"])
        potenza_pbs = pbs.get("Power", "")
        if m_potenza and potenza_pbs.isdigit():
            if int(m_potenza.group(1)) != int(potenza_pbs):
                print(f"[POTENZA] {voce['chiave_oggetto']} ({voce['nome']}): "
                      f"descrizione dice {m_potenza.group(1)}, PBS dice {potenza_pbs}")
                problemi += 1

        print(f"  OK  {voce['chiave_oggetto']:22s} slug={voce['mossa']:16s} "
              f"PBS={chiave_pbs:16s} Name='{pbs.get('Name')}' "
              f"Type={pbs.get('Type')} Cat={pbs.get('Category')} "
              f"Power={pbs.get('Power')} Acc={pbs.get('Accuracy')} PP={pbs.get('TotalPP')}")

    print(f"\nDiscrepanze trovate: {problemi}")


if __name__ == "__main__":
    main()
