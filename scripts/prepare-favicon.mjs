import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

// Clip the supplied photograph exactly, without redrawing or recoloring it.
const source = await readFile('src/assets/brand/favicon-original.jpg')
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1170" height="1170" viewBox="0 0 1170 1170"><defs><clipPath id="round"><circle cx="585" cy="585" r="585"/></clipPath></defs><image width="1170" height="1170" href="data:image/jpeg;base64,${source.toString('base64')}" clip-path="url(#round)"/></svg>`)
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
