import { dreamConnectionIds } from './connections'
import { archiveUrl, navigate } from './navigation'

const stages = ['음악', '그림책', '전시']

export default function DreamNavigation({ currentId }: { currentId: string }) {
  if (!dreamConnectionIds.includes(currentId)) return null
  return <nav className="dream-navigation" aria-label="네가 잠들면 꿈꾸는 건 나 — 이어지는 세 작업">
    {dreamConnectionIds.map((id, index) => <span className="dream-navigation-step" key={id}>
      {index > 0 && <span className="dream-navigation-arrow" aria-hidden="true">→</span>}
      <a href={archiveUrl(id)} aria-current={id === currentId ? 'page' : undefined} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate(archiveUrl(id))
      }}>{stages[index]}</a>
    </span>)}
  </nav>
}
