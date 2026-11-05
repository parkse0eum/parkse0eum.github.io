import { exhibitionArtists } from './exhibitionArtists'
import OccasionText from './OccasionText'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Work } from './data'
import { works } from './data'
import { occasions } from './occasionTexts'
import { archiveUrl, navigate } from './navigation'

export default function ExhibitionDetail({ work }: { work: Work }) {
  const title = useRef<HTMLHeadingElement>(null)
  const layout = useRef<HTMLDivElement>(null)
  const poster = useRef<HTMLImageElement>(null)
  const info = useRef<HTMLDivElement>(null)
  const artist = useRef<HTMLParagraphElement>(null)
  const copy = occasions[work.id]
  const book = works.find(item => item.id === 'dream-book')
  useLayoutEffect(() => {
    let active = true
    const align = () => {
      if (!active || !layout.current) return
      layout.current.style.setProperty('--exhibition-poster-height', `${poster.current?.getBoundingClientRect().height ?? 0}px`)
      layout.current.style.setProperty('--exhibition-related-offset', `${Math.max(0, (artist.current?.getBoundingClientRect().top ?? 0) - (info.current?.getBoundingClientRect().top ?? 0))}px`)
    }
    const observer = new ResizeObserver(align)
    if (poster.current) observer.observe(poster.current)
    if (info.current) observer.observe(info.current)
    document.fonts.ready.then(align)
    align()
    return () => { active = false; observer.disconnect() }
  }, [])
  useEffect(() => { title.current?.focus({ preventScroll: true }) }, [])
  return <main className="works-page work-page exhibition-page">
    <header className="detail-page-header"><a href={archiveUrl()} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      if (window.history.state?.fromArchive) window.history.back()
      else navigate(archiveUrl())
    }}>← 작품 전체 보기</a><span>parkse0eum</span></header>
    <article>
      <div className="detail-page-layout" ref={layout}>
        <div className="detail-page-art">{work.image && <img ref={poster} src={work.image} alt={`${work.title} 2인전 포스터`} />}</div>
        <div className="detail-page-info" ref={info}>
          <p className="detail-page-category">전시</p>
          <h1 ref={title} tabIndex={-1}>《{work.title}》</h1>
          <p className="detail-page-artist" ref={artist}>박서음 × 송연조 2인전</p>
          <p className="detail-page-meta occasion-information">{copy?.information ?? work.date}</p>
          <div className="exhibition-shop-link"><a href="https://smartstore.naver.com/kamereon/products/13854348106" target="_blank" rel="noopener noreferrer">카메레온 선물가게 : 전시 굿즈 판매 ↗</a></div>
          <nav className="detail-section-nav exhibition-section-nav" aria-label="전시 상세 항목"><a href="#exhibition-intro">전시 소개</a><a href="#exhibition-artists">작가 소개</a><a href="#exhibition-map">전시 지도</a></nav>
        </div>
        {book?.image && <aside className="exhibition-related-book" aria-label="관련 그림책">
          <a href={archiveUrl(book.id)} onClick={event => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault(); navigate(archiveUrl(book.id))
          }}><img src={book.image} alt={`그림책 『${book.title}』 상세 보기`} /><span>그림책 펼치기</span></a>
        </aside>}
      </div>
      <div className="detail-page-body"><div className="detail-reading-column">
        <section className="detail-text-section" id="exhibition-intro"><h2>전시 소개</h2><p className="detail-text"><OccasionText text={copy?.body ?? work.description ?? ''} /></p></section>
        <section className="detail-text-section" id="exhibition-artists"><h2>작가 소개</h2>
          {exhibitionArtists.map(person => <section className="exhibition-artist-profile" key={person.name}>
            <h3>{person.name}</h3><p className="exhibition-artist-name">{person.romanized}</p>
            <p className="detail-text">{person.korean}</p>
            <p className="detail-text exhibition-artist-english" lang="en">{person.english}</p>
          </section>)}
        </section>
        <section className="detail-text-section" id="exhibition-map"><h2>전시 지도</h2>
          <a className="exhibition-map-link" href="/images/works/exhibition-map.jpg" target="_blank" rel="noopener noreferrer" aria-label="전시 지도 크게 보기"><img src="/images/works/exhibition-map.jpg" alt="전시 안내 지도. 입구에서 앨범자켓 원화, 그림책 원화 1~18, 엽서 1~9 순으로 이어지며 굿즈 공간과 창가, 피아노의 위치가 표시되어 있습니다." loading="lazy" /></a>
        </section>
      </div></div>
    </article>
    <footer className="detail-page-footer"><a href={archiveUrl()} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault(); navigate(archiveUrl())
    }}>← 작품 전체 보기</a></footer>
  </main>
}
