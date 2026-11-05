import { useEffect, useRef, useState } from 'react'
import type { Work } from './data'
import BookNavigation from './BookNavigation'
import PictureBookReader from './PictureBookReader'
import { archiveUrl, navigate } from './navigation'

export default function PictureBookDetail({ work }: { work: Work }) {
  const [unbound, setUnbound] = useState(false)
  const [canSwitch, setCanSwitch] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  return <main className="works-page work-page picture-book-page">
    <header className="detail-page-header"><a href={archiveUrl()} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      if (window.history.state?.fromArchive) window.history.back()
      else navigate(archiveUrl())
    }}>← 작품 전체 보기</a><span>parkse0eum</span></header>
    <BookNavigation currentId={work.id} />
    <article>
      <div className="picture-book-heading">
        <div><p className="detail-page-category">문학 · 그림책</p><h1 ref={heading} tabIndex={-1}>{work.title}</h1></div>
        <div className="picture-book-information"><p>글 · 박서음 / 그림 · 송연조</p><p>34p / 2026</p><button className="picture-book-mode-link" type="button" disabled={!canSwitch} aria-pressed={unbound} aria-controls="picture-book-reader" onClick={() => setUnbound(!unbound)}>{unbound ? '다시 책으로 묶기 ←' : '책을 묶기 전으로 →'}</button></div>
      </div>
      <div className="picture-book-body"><PictureBookReader unbound={unbound} onInteractionStateChange={setCanSwitch} /></div>
    </article>

  </main>
}
