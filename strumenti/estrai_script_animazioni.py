# -*- coding: utf-8 -*-
"""
Estrae lo script di animazione REALE di una mossa da
pokeemerald-master/data/battle_anim_scripts.s (Metodo 1, 19 ott 2026).

Uso: python strumenti/estrai_script_animazioni.py NOME_MOSSA
Es:  python strumenti/estrai_script_animazioni.py THUNDERBOLT

Non interpreta ancora i comandi (quello lo fa il motore JS): qui si
ottiene solo la sequenza grezza, pulita e numerata, pronta da leggere
per scrivere a mano la funzione _gioca<Nome>Rom corrispondente (o, in
futuro, da passare a un vero interprete).
"""
import sys, re

PATH = 'pokeemerald-master/data/battle_anim_scripts.s'

def estrai(nome_mossa):
    testo = open(PATH, encoding='utf-8', errors='ignore').read()
    etichetta = f'Move_{nome_mossa.upper()}:'
    inizio = testo.find(etichetta)
    if inizio < 0:
        print(f'Mossa non trovata: {etichetta}')
        return None
    inizio += len(etichetta)
    fine = testo.find('\nMove_', inizio)
    if fine < 0:
        fine = testo.find('\n\n', inizio)
    blocco = testo[inizio:fine]
    righe = [r.strip() for r in blocco.splitlines() if r.strip() and not r.strip().startswith('@')]
    return righe

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: python estrai_script_animazioni.py NOME_MOSSA')
        sys.exit(1)
    righe = estrai(sys.argv[1])
    if righe:
        for i, r in enumerate(righe):
            print(f'{i:3d}  {r}')
