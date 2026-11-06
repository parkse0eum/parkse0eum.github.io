import type { Work } from './data'
import dimensions from './archiveImageSizes.json'

export default function ArchiveImage({ work, priority = false, connected = false }: { work: Work; priority?: boolean; connected?: boolean }) {
  if (!work.image) return null
  const name = work.image.split('/').pop()!.replace(/\.[^.]+$/, '')
  const thumbnail = `/images/archive/${name}`
  const size = dimensions[work.id as keyof typeof dimensions]
  return <img src={import.meta.env.PROD ? `${thumbnail}-480.webp` : work.image}
    srcSet={import.meta.env.PROD ? `${thumbnail}-240.webp ${Math.min(240, size?.width ?? 240)}w, ${thumbnail}-480.webp ${Math.min(480, size?.width ?? 480)}w` : undefined}
    sizes={connected ? '(max-width: 650px) 80vw, 28vw' : '(max-width: 650px) 43vw, (max-width: 1000px) 23vw, 15vw'}
    width={size?.width} height={size?.height} alt={connected ? work.title : ''}
    loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
}
