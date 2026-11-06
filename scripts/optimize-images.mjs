import { readdir, readFile, writeFile, rename, unlink, stat, mkdir } from 'node:fs/promises'
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
const images = files.filter(file => /\.(png|jpe?g)$/i.test(file) && !['favicon-circle-96.png', 'apple-touch-icon.png'].includes(path.basename(file)))
const replacements = new Map()
let originalBytes = 0, optimizedBytes = 0
for (let offset = 0; offset < images.length; offset += 3) {
  await Promise.all(images.slice(offset, offset + 3).map(async file => {
    const output = file.replace(/\.(png|jpe?g)$/i, '.webp')
    const before = (await stat(file)).size
    const limit = file.includes('/images/brand/parkse0eum-black') ? 160 : 1800
    const image = sharp(file).rotate().resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true })
    await image.webp({ quality: file.includes('dream-book/') || file.includes('letters-') ? 92 : 88, alphaQuality: 100, lossless: file.includes('mask'), effort: 5 }).toFile(output)
    // Archive cards never need the full-resolution detail artwork.
    if (file.includes('/assets/') || /\/images\/works\/[^/]+$/.test(file)) {
      const thumbnails = path.join(directory, 'images/archive')
      await mkdir(thumbnails, { recursive: true })
      for (const width of [240, 480]) {
        await sharp(file).rotate().resize({ width, withoutEnlargement: true })
          .webp({ quality: 60, alphaQuality: 100, effort: 6 })
          .toFile(path.join(thumbnails, `${path.basename(output, '.webp')}-${width}.webp`))
      }
    }
    if (file.includes('dream-book/spread-')) {
      const mobileDirectory = path.join(path.dirname(file), 'mobile')
      await mkdir(mobileDirectory, { recursive: true })
      await sharp(file).rotate().resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 90, effort: 5 }).toFile(path.join(mobileDirectory, path.basename(output)))
    }
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

// Publish exact byte budgets for honest loading progress in the reader.
const bookDirectory = path.join(directory, 'images/works/dream-book')
const bookManifest = async (folder, prefix) => Promise.all((await readdir(folder)).filter(name => /^spread-\d+\.webp$/.test(name)).sort().map(async name => ({ url: `${prefix}/${name}`, bytes: (await stat(path.join(folder, name))).size })))
await writeFile(path.join(bookDirectory, 'manifest.json'), JSON.stringify({
  files: await bookManifest(bookDirectory, '/images/works/dream-book'),
  mobile: { files: await bookManifest(path.join(bookDirectory, 'mobile'), '/images/works/dream-book/mobile') },
}))
