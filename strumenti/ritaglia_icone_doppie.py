# ritaglia_icone_doppie.py — le icone in sprites/pokemon_icons/ sono fogli
# Essentials a 2 fotogrammi (128x64 = due frame 64x64 affiancati, per
# l'animazione "bounce" nel PC originale) ma qui vengono mostrate ferme in un
# angolo di Box/Squadra: si vedeva il Pokémon "doppio". Tiene solo il primo
# fotogramma (metà sinistra) e sovrascrive il file.
#
# Uso: python strumenti/ritaglia_icone_doppie.py

import os
from PIL import Image

CARTELLA = os.path.join(os.path.dirname(__file__), '..', 'sprites', 'pokemon_icons')

def main():
    file_png = [f for f in os.listdir(CARTELLA) if f.lower().endswith('.png')]
    tagliati = 0
    saltati = []
    for nome in file_png:
        percorso = os.path.join(CARTELLA, nome)
        with Image.open(percorso) as img:
            w, h = img.size
            if w == h * 2:
                primo_frame = img.crop((0, 0, w // 2, h))
                primo_frame.save(percorso)
                tagliati += 1
            else:
                saltati.append(f'{nome} ({w}x{h})')
    print(f'Ritagliate {tagliati}/{len(file_png)} icone.')
    if saltati:
        print('Saltate (dimensioni inattese, non 2:1):', ', '.join(saltati))

if __name__ == '__main__':
    main()
