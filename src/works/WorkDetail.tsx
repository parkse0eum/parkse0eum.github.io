import BookNavigation from './BookNavigation'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import type { Work } from './data'
import { works } from './data'
import { music } from './music'
import MusicServiceIcon from './MusicServiceIcon'
import { archiveUrl, navigate } from './navigation'

function follow(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(href)
}

export default function WorkDetail({ work }: { work: Work }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const layout = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLImageElement>(null)
  const release = useRef<HTMLParagraphElement>(null)
  const info = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLParagraphElement>(null)
  const related = useRef<HTMLElement>(null)
  const sectionButtons = useRef<HTMLElement>(null)
  const album = music[work.id]
  useLayoutEffect(() => {
    if (!album || !layout.current || !cover.current || !release.current || !info.current) return
    const container = layout.current
    let active = true
    const align = () => {
      if (!active || !cover.current || !release.current) return
      container.style.setProperty('--album-cover-height', `${cover.current.getBoundingClientRect().height}px`)
      const contentTop = container.getBoundingClientRect().top + parseFloat(getComputedStyle(container).paddingTop)
      container.style.setProperty('--music-links-offset', `${Math.max(0, release.current.getBoundingClientRect().top - contentTop - 3)}px`)
      if (sectionButtons.current) {
        const start = release.current.getBoundingClientRect().top + 3
        container.style.setProperty('--music-links-offset', `${Math.max(0, start - contentTop)}px`)
        container.style.setProperty('--music-links-height', `${Math.max(0, sectionButtons.current.getBoundingClientRect().bottom - start)}px`)
        const firstButton = sectionButtons.current.querySelector('a')
        if (related.current && label.current && firstButton) {
          const labelBottom = label.current.getBoundingClientRect().bottom
          const space = Math.max(0, firstButton.getBoundingClientRect().top - labelBottom - 6)
          container.style.setProperty('--music-related-top', `${labelBottom - info.current!.getBoundingClientRect().top + 3}px`)
          container.style.setProperty('--music-related-height', `${space}px`)
          related.current.dataset.compact = String(space < 40)
        }
      }
    }
    const observer = new ResizeObserver(align)
    observer.observe(container)
    observer.observe(cover.current)
    observer.observe(info.current)
    if (sectionButtons.current) observer.observe(sectionButtons.current)
    align()
    document.fonts.ready.then(align)
    return () => { active = false; observer.disconnect() }
  }, [album])
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])

  return <main className={`works-page work-page${album ? ' work-page--music' : ''}`}>
    <nav className="detail-page-header" aria-label="작품 목록으로">
      <a href={archiveUrl()} onClick={e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        if (window.history.state?.fromArchive) window.history.back()
        else navigate(archiveUrl())
      }}>← 모든 이야기</a>
    </nav>
    {album && <nav className="detail-album-nav" aria-label="개인 음악">{works.filter(item => item.category === '음악').map(item => <a key={item.id} href={archiveUrl(item.id)} aria-current={item.id === work.id ? 'page' : undefined} onClick={e => follow(e, archiveUrl(item.id))}>{item.title}</a>)}</nav>}
    {work.category === '문학' && <BookNavigation currentId={work.id} />}
    <article>
      <div className="detail-page-layout" ref={layout}>
        <div className={`detail-page-art${work.genre ? ' detail-page-art--book' : ''}${album ? ' detail-page-art--playable' : ''}`}>
          {work.image && <img ref={cover} src={work.image} alt={`${work.title} ${album ? '앨범 재킷' : '대표 이미지'}`} />}
          {work.image && album && <a className="album-video-link" href={album.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`${work.title} 유튜브에서 재생 (새 탭)`}>
            <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M17 9 L39 24 L17 39 Z" /></svg>
          </a>}
        </div>
        <div className="detail-page-info" ref={info}>
          <p className="detail-page-category">{work.category}</p>
          <h1 ref={heading} tabIndex={-1}>{work.title}</h1>
          {album ? <>
            <p className="detail-page-artist">박서음</p>
            <p className="detail-page-meta" ref={release}>{album.releaseDate} / 싱글 / 발라드</p>
            <p className="detail-page-meta" ref={label}>{album.label} / 미러볼뮤직</p>
            {work.id === 'dream-song' && <nav ref={related} className="album-related-links" aria-label="이 노래에서 이어지는 작업">
              <a href={archiveUrl('dream-book')} onClick={event => follow(event, archiveUrl('dream-book'))}>그림책 펼치기 ↗</a>
              <a href={archiveUrl('dream-exhibition')} onClick={event => follow(event, archiveUrl('dream-exhibition'))}>전시 놀러가기 ↗</a>
            </nav>}
            <nav className="detail-section-nav" ref={sectionButtons} aria-label="앨범 상세 항목"><a href="#album-intro">앨범 소개</a><a href="#album-lyrics">가사</a><a href="#album-credits">크레딧</a></nav>
          </> : <>
            <p className="detail-page-meta">{[work.genre, work.date ?? work.year, work.format].filter(Boolean).join(' / ')}</p>
            {work.roles?.length ? <p className="detail-page-meta">{work.roles.join(' · ')}</p> : null}
          </>}
        </div>
        {album && album.links.length > 0 && <div className="detail-page-actions"><div className="music-service-links" aria-label="음원 사이트">{album.links.map(link => <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"><MusicServiceIcon name={link.name} /><span>{link.name}</span></a>)}</div></div>}
      </div>
      <div className="detail-page-body">
        <div className="detail-reading-column">
          {album ? <>
            <section className="detail-text-section" id="album-intro"><h2>앨범 소개</h2><p className="detail-text">{album.introduction}</p></section>
            <section className="detail-text-section" id="album-lyrics"><h2>가사</h2><p className="detail-text">{album.lyrics}</p></section>
            <section className="detail-text-section" id="album-credits"><h2>Credits</h2><dl className="detail-credits">{album.credits.map(([role, name]) => <div key={role}><dt>{role}</dt><dd>{name}</dd></div>)}</dl></section>
          </> : <>
            {work.entries?.length ? <section className="detail-text-section"><h2>{work.format === 'EP' ? '수록곡' : '수록작'}</h2><ol className="detail-entry-list">{work.entries.map(entry => <li key={entry.title}><span>{entry.title}</span><small>{entry.genre ?? entry.roles?.join(' · ')}</small></li>)}</ol></section> : null}
            {work.description && <section className="detail-text-section"><p className="detail-text">{work.description}</p></section>}
          </>}
        </div>
      </div>
    </article>
    {!!work.images?.length && <section className="detail-page-gallery" aria-label="작품 이미지">{work.images.map((src, i) => <img key={src} src={src} alt={`${work.title} — ${i + 1}`} loading="lazy" />)}</section>}
    <footer className="detail-page-footer"><a href={archiveUrl()} onClick={e => follow(e, archiveUrl())}>← 모든 이야기</a></footer>
  </main>
}
