// scarica_menu_sprites_gen3.js — scarica le icone menu stile Gen 3 (FireRed/
// LeafGreen/Emerald, le "MS3") da Bulbagarden Archives per i Pokémon 1-386
// (stesso limite Gen 1-2-3 del progetto) e le salva in sprites/pokemon_icons_gen3/.
//
// Fonte: https://archives.bulbagarden.net (Category:Generation III menu sprites),
// uso personale/non commerciale, coerente coi vincoli legali di CLAUDE.md.
//
// Uso: node strumenti/scarica_menu_sprites_gen3.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const CARTELLA_OUT = path.join(__dirname, '..', 'sprites', 'pokemon_icons_gen3');
const USER_AGENT = 'Mozilla/5.0 (compatible; PokemonCastelliRomani/1.0; progetto personale/didattico)';
const API = 'https://archives.bulbagarden.net/w/api.php?action=query&generator=categorymembers' +
  '&gcmtitle=Category:Generation%20III%20menu%20sprites&gcmlimit=500&gcmtype=file' +
  '&prop=imageinfo&iiprop=url&format=json';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} per ${url}`));
        return;
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function attesa(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(CARTELLA_OUT, { recursive: true });

  console.log('Interrogo l\'API di Bulbagarden Archives...');
  const dati = await fetchJson(API);
  const pagine = Object.values(dati.query.pages);

  // Solo il pattern standard "NNNMS3.png" (specie base, ID 1-386): esclude
  // forme alternative (Deoxys A/D/S, Unown A-Z/!/?), l'uovo (000) e i file
  // fuori formato (es. GoldenBulbasaurMS.png, evento speciale).
  const voci = [];
  for (const p of pagine) {
    const nome = (p.title || '').replace(/^File:/, '');
    const m = /^(\d{3})MS3\.png$/.exec(nome);
    if (!m) continue;
    const id = parseInt(m[1], 10);
    if (id < 1 || id > 386) continue;
    const url = p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url;
    if (!url) continue;
    voci.push({ id, url });
  }
  voci.sort((a, b) => a.id - b.id);
  console.log(`Trovate ${voci.length} icone (attese 386).`);

  let ok = 0, falliti = [];
  for (const { id, url } of voci) {
    const nomeFile = String(id).padStart(3, '0') + '.png';
    const dest = path.join(CARTELLA_OUT, nomeFile);
    if (fs.existsSync(dest)) { ok++; continue; } // già scaricata (ripresa da interruzione)
    try {
      await downloadFile(url, dest);
      ok++;
      if (ok % 25 === 0) console.log(`  ...${ok}/${voci.length}`);
    } catch (err) {
      console.error(`Errore su #${id}:`, err.message);
      falliti.push(id);
    }
    await attesa(120); // piccola pausa, non martellare il server
  }

  console.log(`Fatto: ${ok} icone salvate in ${CARTELLA_OUT}`);
  if (falliti.length) console.log('Falliti:', falliti.join(', '));
}

main().catch((err) => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
