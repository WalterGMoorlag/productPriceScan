const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3344;

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║          PriceScan corriendo         ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║  Local:   http://localhost:${PORT}      ║`);
  console.log(`  ║  Red:     http://${ip}:${PORT}    ║`);
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  Para usar en el teléfono:           ║');
  console.log('  ║  1. Conectá el teléfono por USB      ║');
  console.log('  ║  2. Activá depuración USB            ║');
  console.log(`  ║  3. Ejecutá:                         ║`);
  console.log(`  ║     adb reverse tcp:${PORT} tcp:${PORT}      ║`);
  console.log(`  ║  4. Abrí: http://localhost:${PORT}      ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
