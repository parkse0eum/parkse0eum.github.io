import { readdir, readFile, writeFile, rename, unlink, stat } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

// Build artifacts only: original artwork in src/ and public/ stays untouched.
const directory = path.resolve('dist')
async function walk(root) {
  const entries = await readdir(root, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(root, entry.name)) : path.join(root, entry.name)))).flat()
}
const files = await walk(directory)
const images = files.filter(file => /\.(png|jpe?g)$/i.test(file) && !['favicon-96.png', 'apple-touch-icon.png'].includes(path.basename(file)))
const replacements = new Map()
let originalBytes = 0, optimizedBytes = 0
for (let offset = 0; offset < images.length; offset += 3) {
  await Promise.all(images.slice(offset, offset + 3).map(async file => {
    const output = file.replace(/\.(png|jpe?g)$/i, '.webp')
    const before = (await stat(file)).size
    const image = sharp(file).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
    await image.webp({ quality: file.includes('dream-book/') || file.includes('letters-') ? 92 : 88, alphaQuality: 100, lossless: file.includes('mask'), effort: 5 }).toFile(output)
    originalBytes += before
    optimizedBytes += (await stat(output)).size
    replacements.set(path.basename(file), path.basename(output))
    await unlink(file)
  }))
}
const textFiles = files.filter(file => /\.(html|css|js|json)$/i.test(file))
const replaceNames = (text, names) => {
  for (const [from, to] of [...names].sort((a, b) => b[0].length - a[0].length)) text = text.replaceAll(from, to)
  return text
}
for (const file of textFiles) await writeFile(file, replaceNames(await readFile(file, 'utf8'), replacements))
// New URLs prevent clients caching the previous, unoptimized JS/CSS bundle.
const bundleNames = new Map()
const renamedFiles = []
for (const file of textFiles.filter(file => /\.(js|css)$/.test(file) && file.startsWith(path.join(directory, 'assets') + path.sep))) {
  const hash = createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 10)
  const extension = path.extname(file)
  const next = file.slice(0, -extension.length) + `-${hash}` + extension
  bundleNames.set(path.basename(file), path.basename(next))
  await rename(file, next)
  renamedFiles.push(next)
}
for (const file of [...textFiles.filter(file => !bundleNames.has(path.basename(file))), ...renamedFiles]) {
  await writeFile(file, replaceNames(await readFile(file, 'utf8'), bundleNames))
}
console.log(`Deployment images: ${images.length} files, ${(originalBytes / 1024 / 1024).toFixed(1)} MB → ${(optimizedBytes / 1024 / 1024).toFixed(1)} MB (${Math.round((1 - optimizedBytes / originalBytes) * 100)}% smaller)`)
