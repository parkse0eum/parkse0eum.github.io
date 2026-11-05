import PictureBookSoundtrack from './PictureBookSoundtrack'
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
    <nav className="detail-page-header" aria-label="작품 목록으로"><a href={archiveUrl()} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      if (window.history.state?.fromArchive) window.history.back()
      else navigate(archiveUrl())
    }}>← 모든 이야기</a></nav>
    <BookNavigation currentId={work.id} />
    <article>
      <div className="picture-book-heading">
        <div><p className="detail-page-category">문학 · 그림책</p><div className="picture-book-title-line"><h1 id="picture-book-title" ref={heading} tabIndex={-1}>{work.title}</h1><PictureBookSoundtrack titleId="picture-book-title" /></div></div>
        <div className="picture-book-information"><p>글 · 박서음 / 그림 · 송연조</p><p>34p / 2026</p><button className="picture-book-mode-link" type="button" disabled={!canSwitch} aria-pressed={unbound} aria-controls="picture-book-reader" onClick={() => setUnbound(!unbound)}>{unbound ? '다시 책으로 묶기' : '책을 묶기 전으로'}<svg className="picture-book-reset-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M3 11a9 9 0 1 1 2.6 6.4" /><path d="M3 4v7h7" /></svg></button></div>
      </div>
      <div className="picture-book-body"><PictureBookReader unbound={unbound} onInteractionStateChange={setCanSwitch} /></div>
    </article>

  </main>
}
