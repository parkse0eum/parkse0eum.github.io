import type { Work } from './data'
import ArchiveImage from './ArchiveImage'
import { archiveUrl } from './navigation'

import { dreamConnectionIds } from './connections'

export default function ConnectedWorks({ items, onOpen }: { items: Work[]; onOpen: (id: string) => void }) {
  const ordered = dreamConnectionIds.flatMap(id => items.find(item => item.id === id) ?? [])
  return <section className="connected-works" aria-label="음악에서 그림책, 전시로 이어지는 작업">
    <ol className="connected-path">{ordered.map(item => <li key={item.id}>
      <a href={archiveUrl(item.id)} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault(); onOpen(item.id)
      }}><div className="connected-path-art"><ArchiveImage work={item} connected /></div></a>
    </li>)}</ol>
  </section>
}
