import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Circular swatch matching the supplied pale yellow reference.
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="362" height="362" viewBox="0 0 362 362"><circle cx="181" cy="181" r="181" fill="#fff8b5"/></svg>')
for (const [size, file] of [[96, 'favicon-circle-96.png'], [180, 'apple-touch-icon.png']]) {
  await sharp(svg).resize(size, size).png().toFile(`public/${file}`)
}
const png = await readFile('public/favicon-circle-96.png')
const header = Buffer.alloc(22)
header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)
header[6] = 96; header[7] = 96
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12)
header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18)
await writeFile('public/favicon.ico', Buffer.concat([header, png]))
