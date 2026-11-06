import { useEffect, useState } from 'react'

type Manifest = { files: { url: string; bytes: number }[]; mobile?: { files: { url: string; bytes: number }[] } }
type Progress = { bytes: number; total: number; completed: number; speed: number }
const initialProgress: Progress = { bytes: 0, total: 0, completed: 0, speed: 0 }

export default function usePictureBookAssets() {
  const [attempt, setAttempt] = useState(0)
  const [urls, setUrls] = useState<string[]>([])
  const [progress, setProgress] = useState(initialProgress)
  const [error, setError] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    const allocated: string[] = []
    let active = true
    setUrls([]); setProgress(initialProgress); setError(false)
    async function download() {
      const response = await fetch('/images/works/dream-book/manifest.json', { signal: abort.signal })
      if (!response.ok) throw new Error('Book manifest unavailable')
      const manifest: Manifest = await response.json()
      const files = window.matchMedia('(max-width:900px)').matches && manifest.mobile ? manifest.mobile.files : manifest.files
      if (files.length !== 18) throw new Error('Incomplete book manifest')
      const total = files.reduce((sum, file) => sum + file.bytes, 0)
      const started = performance.now()
      let bytes = 0, completed = 0, cursor = 0, lastUpdate = 0
      const images = new Array<string>(files.length)
      const publish = (force = false) => {
        const now = performance.now()
        if (active && (force || now - lastUpdate > 100)) {
          lastUpdate = now
          setProgress({ bytes, total, completed, speed: bytes / Math.max((now - started) / 1000, 0.1) })
        }
      }
      publish(true)
      // Bound concurrent downloads and decodes on mobile. Every page is verified
      // before mounting the book, so native drags cannot reach missing artwork.
      await Promise.all(Array.from({ length: 3 }, async () => {
        while (cursor < files.length && active) {
          const index = cursor++
          const result = await fetch(files[index].url, { signal: abort.signal })
          if (!result.ok) throw new Error('Book image unavailable')
          const chunks: BlobPart[] = []
          if (result.body) {
            const stream = result.body.getReader()
            while (true) {
              const { done, value } = await stream.read()
              if (done) break
              chunks.push(new Uint8Array(value)); bytes += value.byteLength; publish()
            }
          } else {
            const buffer = await result.arrayBuffer()
            chunks.push(buffer); bytes += buffer.byteLength
          }
          const url = URL.createObjectURL(new Blob(chunks, { type: result.headers.get('content-type') ?? 'image/webp' }))
          allocated.push(url)
          const image = new Image(); image.src = url
          await image.decode()
          images[index] = url; completed++; publish(true)
        }
      }))
      if (active) setUrls(images)
    }
    void download().catch(() => {
      if (!active) return
      active = false; abort.abort(); setError(true)
      allocated.forEach(url => URL.revokeObjectURL(url))
    })
    return () => {
      active = false; abort.abort()
      allocated.forEach(url => URL.revokeObjectURL(url))
    }
  }, [attempt])
  return { urls, progress, error, retry: () => setAttempt(value => value + 1) }
}
