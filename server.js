/* server.js — mini server locale per giocare a Pokémon Castelli Romani.
   Serve i file del progetto su http://localhost:8000 così il browser
   può caricare le mappe (.tmj) e gli sprite, cosa che con doppio-click
   su index.html (file://) il browser BLOCCA.

   Avvio: doppio click su "start.bat"  (oppure: node server.js) */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 8000;
const ROOT = __dirname;

// Tipo di contenuto in base all'estensione del file
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.tmj':  'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.tsx':  'text/plain; charset=utf-8',
  '.tmx':  'application/xml; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // Toglie eventuali query string e decodifica gli spazi (%20) nei nomi file
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // Risolve il percorso e impedisce di uscire dalla cartella del progetto
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('403 Vietato'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — file non trovato: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('  Pokémon Castelli Romani — server avviato!');
  console.log('  Apri il browser su:  http://localhost:' + PORT);
  console.log('  (Per fermarlo: chiudi questa finestra nera)');
  console.log('====================================================');
});
