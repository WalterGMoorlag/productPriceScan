// Genera icon-512.png sin dependencias externas
const zlib = require('zlib');
const fs = require('fs');

const SIZE = 512;
const BG    = [15, 23, 42];    // #0f172a
const GREEN = [34, 197, 94];   // #22c55e

// Pixel grid
const pixels = Array.from({ length: SIZE }, () =>
  Array.from({ length: SIZE }, () => [...BG])
);

// Dibujar barras del código de barras
const bars = [
  [96,20],[128,10],[150,30],[192,14],[218,24],
  [254,10],[276,20],[308,14],[334,30],[376,10],[398,20]
];
for (const [x, w] of bars) {
  for (let py = 160; py < 320; py++)
    for (let px = x; px < x + w && px < SIZE; px++)
      pixels[py][px] = [...GREEN];
}

// Dibujar label de precio
for (let py = 348; py < 404; py++)
  for (let px = 152; px < 360 && px < SIZE; px++)
    pixels[py][px] = [...GREEN];

// ─── PNG helpers ───
function crc32(buf) {
  const t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = t[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const lb = Buffer.allocUnsafe(4); lb.writeUInt32BE(data.length);
  const cb = Buffer.allocUnsafe(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([lb, tb, data, cb]);
}

// Raw rows
const rows = pixels.map(row => {
  const buf = Buffer.allocUnsafe(1 + SIZE * 3);
  buf[0] = 0;
  row.forEach(([r,g,b], x) => { buf[1+x*3]=r; buf[2+x*3]=g; buf[3+x*3]=b; });
  return buf;
});
const compressed = zlib.deflateSync(Buffer.concat(rows));

const ihdr = Buffer.allocUnsafe(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;

const png = Buffer.concat([
  Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.writeFileSync('icon-512.png', png);
console.log('✓ icon-512.png generado (512x512)');
