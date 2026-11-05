import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import ImageViewer from './ImageViewer'

const spreads = Array.from({ length: 18 }, (_, index) => `/images/works/dream-book/spread-${String(index + 1).padStart(2, '0')}.jpg`)
const pageSpecs = [
  { spread: 0, side: 'left', cover: true },
  ...spreads.slice(1).flatMap((_, index) => [{ spread: index + 1, side: 'left', cover: false }, { spread: index + 1, side: 'right', cover: false }]),
  { spread: 0, side: 'right', cover: true },
]
const lastPage = pageSpecs.length - 1
const pageLabel = (page: number) => page === 0 ? '앞표지' : page === lastPage ? '뒤표지' : `${page % 2 ? page : page - 1}–${page % 2 ? page + 1 : page} / 34쪽`
type FlipApi = { flipNext: (corner?: string) => void; flipPrev: (corner?: string) => void; flip: (page: number, corner?: string) => void; turnToPage: (page: number) => void; getState: () => string; update: () => void }
type FlipRef = { pageFlip: () => FlipApi }

const FlipLeaf = forwardRef<HTMLDivElement, { spread: number; side: string; cover: boolean; index: number }>((props, ref) => <div ref={ref} className={`flipbook-leaf flipbook-leaf--${props.side}`} data-density={props.cover ? 'hard' : 'soft'} aria-label={props.cover ? props.index === 0 ? '앞표지' : '뒤표지' : `${props.index}쪽`}>
  <img src={spreads[props.spread]} alt="" draggable={false} decoding="sync" />
</div>)
FlipLeaf.displayName = 'FlipLeaf'

export default function PictureBookReader({ unbound, onInteractionStateChange }: { unbound: boolean; onInteractionStateChange: (enabled: boolean) => void }) {
  const flip = useRef<FlipRef>(null)
  const position = useRef(0)
  const [current, setCurrent] = useState(0)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [centering, setCentering] = useState(false)
  const [center, setCenter] = useState('front')
  const [resetting, setResetting] = useState(false)
  const [closing, setClosing] = useState<'front' | 'back' | null>(null)
  const [enlarged, setEnlarged] = useState<number | null>(null)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  // Keep every leaf and the library instance stable while its paper geometry animates.
  const pages = useMemo(() => pageSpecs.map((page, index) => <FlipLeaf key={index} {...page} index={index} />), [])
  useEffect(() => {
    let active = true
    Promise.all(spreads.map(src => { const image = new Image(); image.src = src; return image.decode() }))
      .then(() => { if (active) setReady(true) }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!unbound && ready) { const frame = requestAnimationFrame(() => flip.current?.pageFlip()?.update()); return () => cancelAnimationFrame(frame) }
  }, [unbound, ready])
  useEffect(() => {
    if (!resetting) return
    let firstFrame = 0, secondFrame = 0
    const timer = window.setTimeout(() => {
      flip.current?.pageFlip()?.turnToPage(0)
      position.current = 0; setCurrent(0); setCenter('front')
      firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => { setResetting(false); setBusy(false) }) })
    }, 850)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [resetting])
  useEffect(() => {
    if (!centering) return
    const timer = window.setTimeout(() => setCentering(false), 850)
    return () => window.clearTimeout(timer)
  }, [centering])
  const centerBook = (target: string) => {
    if (target !== center && !reduced) setCentering(true)
    setCenter(target)
  }
  const locked = busy || centering
  useEffect(() => { onInteractionStateChange(ready && !locked) }, [ready, locked, onInteractionStateChange])
  const onFlip = useCallback((event: { data: number }) => {
    const page = event.data
    position.current = page; setCurrent(page)
    setCenter(page === 0 ? 'front' : page === lastPage ? 'back' : 'open')
  }, [])
  const onState = useCallback((event: { data: string }) => setBusy(event.data !== 'read'), [])
  const next = () => {
    const api = flip.current?.pageFlip()
    if (!api || locked || resetting) return
    if (current === lastPage) {
      if (reduced) { api.turnToPage(0); return }
      setBusy(true); setResetting(true); return
    }
    setBusy(true); centerBook(current >= lastPage - 2 ? 'back' : 'open')
    if (reduced) { api.turnToPage(current === 0 ? 1 : Math.min(current + 2, lastPage)); setBusy(false) }
    else api.flipNext('top')
  }
  const previous = () => {
    const api = flip.current?.pageFlip()
    if (!api || current === 0 || locked || resetting) return
    setBusy(true); centerBook(current <= 2 ? 'front' : 'open')
    if (reduced) { api.turnToPage(current === lastPage ? lastPage - 2 : Math.max(0, current - 2)); setBusy(false) }
    else api.flipPrev('top')
  }
  useEffect(() => {
    if (!closing) return
    let firstFrame = 0, secondFrame = 0
    const timer = window.setTimeout(() => {
      flip.current?.pageFlip()?.turnToPage(closing === 'front' ? 0 : lastPage)
      setCenter(closing)
      firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => { setClosing(null); setBusy(false) }) })
    }, 800)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [closing])
  const closeBook = () => {
    const api = flip.current?.pageFlip()
    if (!api || locked || resetting || current === 0 || current === lastPage) return
    const side = current < lastPage / 2 ? 'front' : 'back'
    if (reduced) { api.turnToPage(side === 'front' ? 0 : lastPage); return }
    setBusy(true); setClosing(side)
  }
  const jump = (page: number) => {
    const api = flip.current?.pageFlip()
    if (!api || locked || resetting) return
    centerBook(page === 0 ? 'front' : page === lastPage ? 'back' : 'open')
    api.turnToPage(page)
  }

  return <section id="picture-book-reader" className="picture-reader" aria-label="네가 잠들면 꿈꾸는 건 나 그림책 읽기">
    <div className="pf-reader-bound" hidden={unbound}>
      <div className="pf-reader-stage" tabIndex={0} aria-busy={!ready || locked} aria-label="그림책. 좌우 방향키 또는 아래 버튼으로 넘길 수 있습니다." onKeyDown={event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
        if (event.key === 'ArrowRight') { event.preventDefault(); next() }
        if (event.key === 'Home') { event.preventDefault(); jump(0) }
        if (event.key === 'End') { event.preventDefault(); jump(lastPage - 2) }
      }}>
        {!ready ? <p className="pf-loading" role="status">{loadError ? '그림책을 불러오지 못했어요. 페이지를 새로고침해 주세요.' : '그림책을 펼칠 준비 중…'}</p> : <>
          <div className={`pf-center pf-center--${center}${resetting || closing ? ' pf-center--resetting' : ''}`} onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setCentering(false) }}>
            <HTMLFlipBook ref={flip} width={440} height={622} size="stretch" minWidth={100} maxWidth={550} minHeight={140} maxHeight={778} startPage={0} drawShadow flippingTime={750} usePortrait={false} startZIndex={0} autoSize maxShadowOpacity={0.25} showCover mobileScrollSupport clickEventForward={false} useMouseEvents={false} swipeDistance={30} showPageCorners={false} disableFlipByClick className="picture-flipbook" style={{}} renderOnlyPageLengthChange onFlip={onFlip} onChangeState={onState}>{pages}</HTMLFlipBook>
          </div>
          {!locked && <button className={`pf-book-toggle${current === 0 || current === lastPage ? ' pf-book-toggle--cover' : ''}`} type="button" aria-label={current === 0 ? '표지를 열어 그림책 펼치기' : current === lastPage ? '책을 뒤집어 앞표지 보기' : '펼쳐진 그림책 덮기'} onClick={current === 0 || current === lastPage ? next : closeBook} />}
          {closing && <div className={`pf-shut pf-shut--${closing}`} aria-hidden="true"><div className="pf-shut-left" style={{ backgroundImage: `url('${spreads[pageSpecs[current].spread]}')` }} /><div className="pf-shut-flap"><div className="pf-shut-face" style={{ backgroundImage: `url('${spreads[pageSpecs[current].spread]}')` }} /><div className="pf-shut-face pf-shut-back" style={{ backgroundImage: `url('${spreads[0]}')` }} /></div></div>}
          {resetting && <div className="pf-reset-cover" aria-hidden="true"><div className="pf-reset-face" style={{ backgroundImage: `url('${spreads[0]}')` }} /><div className="pf-reset-face pf-reset-front" style={{ backgroundImage: `url('${spreads[0]}')` }} /></div>}
        </>}
        <div className="pf-edge-nav"><button type="button" onClick={previous} disabled={!ready || current === 0 || locked} aria-label="그림책 이전 펼침면">{'<'}</button><button type="button" onClick={next} disabled={!ready || locked} aria-label={current === 0 ? '그림책 펼치기' : current === lastPage ? '책을 뒤집어 앞표지 보기' : current >= lastPage - 2 ? '마지막 장을 덮어 뒤표지 보기' : '그림책 다음 펼침면'}>{'>'}</button></div>
      </div>
      <p className="picture-reader-page-number" aria-live="polite">{pageLabel(current)}</p>
    </div>
    {unbound && <div className="picture-proof-gallery" aria-label="순서대로 펼쳐 놓은 그림책">{spreads.map((src, index) => <button key={src} type="button" onClick={() => setEnlarged(index)} aria-label={`${index === 0 ? '표지' : `${index * 2 - 1}–${index * 2} / 34쪽`} 크게 보기`}><img src={src} alt={index === 0 ? '앞표지와 뒤표지' : `${index * 2 - 1}–${index * 2}쪽`} loading="lazy" /><span>{index === 0 ? '표지' : `${index * 2 - 1}–${index * 2} / 34쪽`}</span></button>)}</div>}
    {enlarged !== null && <ImageViewer images={spreads} initialIndex={enlarged} title="네가 잠들면 꿈꾸는 건 나" onClose={() => setEnlarged(null)} />}
  </section>
}
