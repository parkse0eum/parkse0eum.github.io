import BookNavigation from './BookNavigation'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { literaryRichText } from './literaryRichText'
import type { Work } from './data'
import type { BookDetail } from './literature'
import { archiveUrl, navigate } from './navigation'

export default function LiteratureDetail({ work, book }: { work: Work; book: BookDetail }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const layout = useRef<HTMLDivElement>(null)
  const authors = useRef<HTMLParagraphElement>(null)
  const info = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLImageElement>(null)
  useLayoutEffect(() => {
    const update = () => {
      const root = layout.current
      if (!root) return
      root.style.setProperty('--book-cover-height', `${cover.current?.getBoundingClientRect().height ?? 0}px`)
      const offset = (authors.current?.getBoundingClientRect().top ?? 0) - (info.current?.getBoundingClientRect().top ?? 0)
      root.style.setProperty('--book-contents-offset', `${Math.max(0, offset)}px`)
    }
    const observer = new ResizeObserver(update)
    if (cover.current) observer.observe(cover.current)
    if (info.current) observer.observe(info.current)
    document.fonts.ready.then(update)
    update()
    return () => observer.disconnect()
  }, [])
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  return <main className="works-page work-page literature-page">
    <nav className="detail-page-header" aria-label="작품 목록으로"><a href={archiveUrl()} onClick={e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      if (window.history.state?.fromArchive) window.history.back()
      else navigate(archiveUrl())
    }}>← 작품 전체 보기</a></nav>
    <BookNavigation currentId={work.id} />
    <article>
      <div className="detail-page-layout" ref={layout}>
        <div className="detail-page-art detail-page-art--book">{work.image && <img ref={cover} src={work.image} alt={`${work.title} 책 표지`} />}</div>
        <div className="detail-page-info" ref={info}>
          <p className="detail-page-category">문학 · 앤솔로지</p>
          <h1 ref={heading} tabIndex={-1}>{work.title}</h1>
          <p className="book-authors" ref={authors}>{book.authors.map((author, index) => <span key={author}>{index > 0 && ', '}{author === '박서음' ? <mark className="book-author-highlight">{author}</mark> : author}</span>)}</p>
          <p className="detail-page-meta">{book.publisher}</p>
          <p className="detail-page-meta">{book.width} x {book.height}mm / {book.pages}p / {book.year}</p>
          <div className="book-links"><a href={book.fundingUrl} target="_blank" rel="noopener noreferrer">텀블벅 ↗</a></div>
        </div>
        <nav className="book-contents" aria-labelledby="book-contents-title">
          <h2 id="book-contents-title">수록작</h2>
          <ol className="book-entry-list">{book.entries.map((entry, index) => <li key={entry.id}>
            <a href={`#literary-${entry.id}`}><span className="book-entry-number">{String(index + 1).padStart(2, '0')}</span><span className="book-entry-title">{entry.title}</span><span className="book-entry-genre">{entry.genre}</span></a>
          </li>)}</ol>
        </nav>
      </div>
      <div className="detail-page-body">
        {book.entries.map(entry => <section className="literary-work" id={`literary-${entry.id}`} key={entry.id} aria-labelledby={`title-${entry.id}`}>
          <div className="detail-reading-column">
            <h2 id={`title-${entry.id}`}>{entry.title}</h2>
            <div className="literary-text">{literaryRichText[entry.id]?.map((paragraph, index) => {
              if (paragraph.gap) return <div key={index} className="literary-gap" style={{ height: `${paragraph.gap * 1.4}em` }} aria-hidden="true" />
              if (paragraph.image) return <a key={index} className="literary-original" href={paragraph.image} target="_blank" rel="noopener noreferrer"><img src={paragraph.image} alt={paragraph.alt} loading="lazy" /></a>
              const Tag = paragraph.heading ? 'h3' : 'p'
              return <Tag key={index} className={paragraph.center ? 'literary-centered' : undefined}>{paragraph.runs?.map((run, ri) => <span key={ri} style={{ fontFamily: run.style.font === 'sans' ? "'Pretendard', sans-serif" : "'Nanum Myeongjo', serif", fontSize: `${run.style.size}em`, fontWeight: run.style.bold ? 700 : 400, fontStyle: run.style.italic ? 'italic' : undefined, textDecoration: run.style.underline ? 'underline' : undefined }}>{run.text}</span>)}</Tag>
            })}</div>
          </div>
        </section>)}
      </div>
    </article>
    <footer className="detail-page-footer"><a href={archiveUrl()} onClick={e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault(); navigate(archiveUrl())
    }}>← 작품 전체 보기</a></footer>
  </main>
}
