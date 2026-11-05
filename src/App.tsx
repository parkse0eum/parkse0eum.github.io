import { useLayoutEffect, useRef } from 'react'
import { BOOKS } from './book/content'
import { PAGE_LAYOUTS } from './book/layout'
import type { PageIcon } from './book/layout'
import { mountBook } from './book/animation'
import './App.css'
import WorksArchive from './works/WorksArchive'
import { archiveUrl, navigate, useLocationSearch } from './works/navigation'

function IconArtwork({ icon }: { icon: PageIcon }) {
  const [width, height] = icon.source
  const [x, y, w, h] = icon.crop ?? [0, 0, width, height]
  return <svg className="book__icon-image" viewBox={icon.rotate ? `0 0 ${h} ${w}` : `${x} ${y} ${w} ${h}`} preserveAspectRatio={icon.stretch ? 'none' : undefined} role="img" aria-label={icon.label}>
    <g transform={icon.rotate ? `translate(${h} 0) rotate(90) translate(${-x} ${-y})` : undefined}>
      <image href={icon.image} width={width} height={height} />
    </g>
  </svg>
}

function Home() {
  const host = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => mountBook(host.current!), [])

  return <div ref={host} className="home-page">
    <header className="topbar"><img className="home-brand" src="/images/brand/parkse0eum-black.png" alt="박서음" /><span className="home-brand-name">parkse0eum</span></header>
    <main className="stage">
      <div className="cover-intro"><button className="cover-hit" id="coverHit" type="button" aria-expanded="false" aria-controls="accordionBook" aria-label="집 표지를 열고 아코디언북 펼치기" /></div>
      <section className="lep" id="accordionBook" role="region" aria-roledescription="캐러셀" aria-label="박서음의 아코디언북" data-lep="" inert aria-hidden="true">
        <div className="lep__view" tabIndex={0} aria-label="좌우로 넘기는 아코디언북" aria-describedby="lep-help" data-view="">
          <span className="lep__shadow" aria-hidden="true" data-shadow="" />
          <div className="lep__boards" aria-hidden="true">{[0, BOOKS.length - 1].map(i => <div className="leaf cover-plane" data-board={i} key={i}><div className="cover-board" /></div>)}</div>
          <div className="lep__strip" data-strip="">{BOOKS.map(([title, , image], i) => <div key={title} data-page={PAGE_LAYOUTS[i].id} className={`leaf${i === 0 ? ' leaf--first' : ''}${i === BOOKS.length - 1 ? ' leaf--last' : ''}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${BOOKS.length}: ${title.split('|').join(' ')}`}>
            <div className="leaf__face leaf__face--front">
              <div className="paper-surface" style={{ backgroundImage: `url('${image}')` }} />
              <div className="book">
                <h2 className={`book__title${['about', 'extra', 'contact'].includes(PAGE_LAYOUTS[i].id) ? ' book__title--english' : ''}`}>{title}</h2>
                {PAGE_LAYOUTS[i].id === 'about' && <div className="home-page-copy home-about-copy"><div className="home-about-intro"><p className="home-author-name">박서음 <span className="home-author-latin">Park Seoeum</span></p><p className="home-greeting">“안녕히히히,<br />여기는 시 쓰고 노래하는<br />서음이의 집이야요”</p></div><div className="home-social-links" aria-label="박서음 SNS"><a href="https://www.instagram.com/parkse0eum/" target="_blank" rel="noopener noreferrer" aria-label="인스타그램"><svg className="home-social-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg></a><a href="https://youtube.com/@parkse0eum_official?si=cSgfpzSjKNZXSPiT" target="_blank" rel="noopener noreferrer" aria-label="유튜브"><svg className="home-social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1C1.9 9.1 1.9 12 1.9 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8Z" /><path fill="#fffdf4" d="m10 15.4 5.5-3.4L10 8.6Z" /></svg></a></div></div>}
                {PAGE_LAYOUTS[i].id === 'contact' && <div className="home-page-copy"><a href="mailto:parkse0eum@gmail.com">parkse0eum@gmail.com</a></div>}
                {PAGE_LAYOUTS[i].id === 'extra' && <div className="home-page-copy"><a className="home-story-link" href={archiveUrl()} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigate(archiveUrl()) } }}>서음이의 모든 이야기</a></div>}
                {PAGE_LAYOUTS[i].icons.length > 0 ? <div className="book__icons">
                  {PAGE_LAYOUTS[i].icons.map(icon => <figure className="book__icon" key={icon.label}>
                    {icon.href ? <a className="book__icon-art book__icon-art--logo" href={icon.href} target={icon.href.startsWith('http') ? '_blank' : undefined} rel={icon.href.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={event => {
                      if (icon.href && !icon.href.startsWith('http') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigate(icon.href) }
                    }} aria-label={`${icon.label} 보기`}><IconArtwork icon={icon} /></a> : <div className="book__icon-art">
                      <IconArtwork icon={icon} />
                    </div>}
                  </figure>)}
                </div> : null}
              </div>
              <i className="leaf__shade" aria-hidden="true" />
            </div>
            <div className="leaf__face leaf__face--back" aria-hidden="true"><i className="leaf__shade" />{i === 0 && <img className="cover-art" src="/images/book/cover.png" alt="직접 그린 집 모양 겉표지" draggable={false} />}</div>
          </div>)}</div>
        </div>
        <button className="accessible-close" id="closeBook" type="button">책 닫기</button>
        <p className="sr" id="lep-help">좌우 방향키로 이동합니다. Home은 첫 면, End는 마지막 면, Escape는 집 닫기입니다. 마우스나 손가락으로 좌우로 끌어 넘길 수 있습니다.</p>
        <p className="sr" aria-live="polite" data-live="" />
      </section>
    </main>
    <nav className="home-bottom-nav" aria-label="집과 작품 보기"><button type="button" data-home-open>들어가며</button><span aria-hidden="true">/</span><button type="button" data-home-close>나가며</button><span aria-hidden="true">/</span><a href={archiveUrl()} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); navigate(archiveUrl()) } }}>모든 이야기</a></nav>
  </div>
}

export default function App() {
  const search = useLocationSearch()
  return new URLSearchParams(search).get('view') === 'works' ? <WorksArchive /> : <Home />
}
