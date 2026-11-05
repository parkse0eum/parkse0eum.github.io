import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import ImageViewer from './ImageViewer'

const spreadFormat = import.meta.env.PROD ? 'webp' : 'jpg'
const spreads = Array.from({ length: 18 }, (_, index) => `/images/works/dream-book/spread-${String(index + 1).padStart(2, '0')}.${spreadFormat}`)
const pageSpecs = [
  { spread: 0, side: 'left', cover: true },
  ...spreads.slice(1).flatMap((_, index) => [{ spread: index + 1, side: 'left', cover: false }, { spread: index + 1, side: 'right', cover: false }]),
  { spread: 0, side: 'right', cover: true },
]
const turnDuration = 1000
const lastPage = pageSpecs.length - 1
const pageLabel = (page: number) => page === 0 ? '앞표지' : page === lastPage ? '뒤표지' : `${page % 2 ? page : page - 1}–${page % 2 ? page + 1 : page} / 34쪽`
type FlipApi = { flipNext: (corner?: string) => void; flipPrev: (corner?: string) => void; flip: (page: number, corner?: string) => void; turnToPage: (page: number) => void; getState: () => string; update: () => void; destroy: () => void }
type FlipRef = { pageFlip: () => FlipApi }

const FlipLeaf = forwardRef<HTMLDivElement, { spread: number; side: string; cover: boolean; index: number }>((props, ref) => <div ref={ref} className={`flipbook-leaf flipbook-leaf--${props.side}`} data-density="soft" aria-label={props.cover ? props.index === 0 ? '앞표지' : '뒤표지' : `${props.index}쪽`}>
  <img src={spreads[props.spread]} alt="" draggable={false} decoding="async" loading={props.spread <= 1 ? 'eager' : 'lazy'} />
</div>)
FlipLeaf.displayName = 'FlipLeaf'

export default function PictureBookReader({ unbound, onInteractionStateChange }: { unbound: boolean; onInteractionStateChange: (enabled: boolean) => void }) {
  const flip = useRef<FlipRef>(null)
  const reader = useRef<HTMLElement>(null)
  const engine = useRef<FlipApi | null>(null)
  const gesture = useRef<{ x: number; y: number; moved: boolean; active: boolean } | null>(null)
  const centerMode = useRef('front')
  const position = useRef(0)
  const decoded = useRef(new Map<number, Promise<void>>())
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      const instance = engine.current
      // Skip React StrictMode's immediate effect replay, but release native
      // window mouse/touch handlers when leaving the reader for another page.
      queueMicrotask(() => { if (!alive.current) instance?.destroy() })
    }
  }, [])
  const loadSpread = useCallback(async (index: number) => {
    let pending = decoded.current.get(index)
    if (!pending) {
      const image = new Image(); image.src = spreads[index]
      pending = image.decode().catch(error => { decoded.current.delete(index); throw error })
      decoded.current.set(index, pending)
    }
    await pending
    // Decode the actual paper faces too: a cached preload alone does not force
    // a lazy <img> to paint before the animation starts on mobile browsers.
    await Promise.all(Array.from(reader.current?.querySelectorAll<HTMLImageElement>('.flipbook-leaf img') ?? [])
      .filter(image => image.getAttribute('src') === spreads[index])
      .map(image => { image.loading = 'eager'; return image.decode() }))
  }, [])
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
    Promise.all([loadSpread(0), loadSpread(1)])
      .then(() => { if (active) setReady(true) }).catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [loadSpread])
  useEffect(() => {
    if (ready && !unbound) {
      for (const page of [Math.max(0, current - 2), Math.min(current + 2, lastPage)]) {
        void loadSpread(pageSpecs[page].spread).catch(() => {})
      }
    }
  }, [ready, current, unbound, loadSpread])
  useEffect(() => {
    if (!unbound && ready) { const frame = requestAnimationFrame(() => flip.current?.pageFlip()?.update()); return () => cancelAnimationFrame(frame) }
  }, [unbound, ready])
  useEffect(() => {
    if (!resetting) return
    let firstFrame = 0, secondFrame = 0
    const timer = window.setTimeout(() => {
      flip.current?.pageFlip()?.turnToPage(0)
      position.current = 0; setCurrent(0); centerMode.current = 'front'; setCenter('front')
      firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => { setResetting(false); setBusy(false) }) })
    }, turnDuration + 50)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [resetting])
  useEffect(() => {
    if (!centering) return
    const timer = window.setTimeout(() => setCentering(false), turnDuration + 100)
    return () => window.clearTimeout(timer)
  }, [centering])
  const centerBook = (target: string) => {
    centerMode.current = target
    if (target !== center && !reduced) setCentering(true)
    setCenter(target)
  }
  const locked = busy || centering
  useEffect(() => { onInteractionStateChange(ready && !locked) }, [ready, locked, onInteractionStateChange])
  const onFlip = useCallback((event: { data: number }) => {
    const page = event.data
    position.current = page; setCurrent(page)
    const target = page === 0 ? 'front' : page === lastPage ? 'back' : 'open'
    if (centerMode.current !== target && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setCentering(true)
    centerMode.current = target
    setCenter(target)
  }, [])
  const onState = useCallback((event: { data: string }) => {
    // A corner preview is interactive, not a running page turn.
    setBusy(event.data === 'flipping' || event.data === 'user_fold')
  }, [])
  const next = async () => {
    const api = flip.current?.pageFlip()
    if (!api || locked || resetting) return
    if (current === lastPage) {
      if (reduced) { api.turnToPage(0); return }
      setBusy(true); setResetting(true); return
    }
    const target = current === 0 ? 1 : Math.min(current + 2, lastPage)
    setBusy(true)
    try {
      await loadSpread(pageSpecs[target].spread)
      if (!alive.current) return
      centerBook(current >= lastPage - 2 ? 'back' : 'open')
      if (reduced) { api.turnToPage(target); setBusy(false) }
      else api.flipNext('top')
    } catch { if (alive.current) setBusy(false) }
  }
  const previous = async () => {
    const api = flip.current?.pageFlip()
    if (!api || current === 0 || locked || resetting) return
    const target = current === lastPage ? lastPage - 2 : Math.max(0, current - 2)
    setBusy(true)
    try {
      await loadSpread(pageSpecs[target].spread)
      if (!alive.current) return
      centerBook(current <= 2 ? 'front' : 'open')
      if (reduced) { api.turnToPage(target); setBusy(false) }
      else api.flipPrev('top')
    } catch { if (alive.current) setBusy(false) }
  }
  useEffect(() => {
    if (!closing) return
    let firstFrame = 0, secondFrame = 0
    const timer = window.setTimeout(() => {
      flip.current?.pageFlip()?.turnToPage(closing === 'front' ? 0 : lastPage)
      centerMode.current = closing
      setCenter(closing)
      firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => { setClosing(null); setBusy(false) }) })
    }, turnDuration + 50)
    return () => { window.clearTimeout(timer); cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame) }
  }, [closing])
  const closeBook = () => {
    const api = flip.current?.pageFlip()
    if (!api || locked || resetting || current === 0 || current === lastPage) return
    const side = current < lastPage / 2 ? 'front' : 'back'
    if (reduced) { api.turnToPage(side === 'front' ? 0 : lastPage); return }
    setBusy(true); setClosing(side)
  }
  const jump = async (page: number) => {
    const api = flip.current?.pageFlip()
    if (!api || locked || resetting) return
    setBusy(true)
    try {
      await loadSpread(pageSpecs[page].spread)
      if (!alive.current) return
      centerBook(page === 0 ? 'front' : page === lastPage ? 'back' : 'open')
      api.turnToPage(page)
    } finally { if (alive.current) setBusy(false) }
  }

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const press = gesture.current
      if (press?.active && !press.moved && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) {
        press.moved = true
        reader.current?.setAttribute('data-dragging', 'true')
      }
    }
    const end = () => {
      if (gesture.current) gesture.current.active = false
      reader.current?.removeAttribute('data-dragging')
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [])

  return <section ref={reader} id="picture-book-reader" className="picture-reader" aria-label="네가 잠들면 꿈꾸는 건 나 그림책 읽기">
    <div className="pf-reader-bound" hidden={unbound}>
      <div className="pf-reader-stage" tabIndex={0} aria-busy={!ready || locked} aria-label="그림책. 모서리를 끌거나 좌우 방향키로 넘기고, 가운데를 클릭하면 덮습니다." onPointerDownCapture={event => {
        if (!event.isPrimary || event.button !== 0 || !(event.target as Element).closest('.picture-flipbook')) return
        gesture.current = { x: event.clientX, y: event.clientY, moved: false, active: true }
      }} onClick={event => {
        if (!(event.target as Element).closest('.picture-flipbook') || gesture.current?.moved || locked || resetting) return
        // The engine owns drags and corner clicks; only a stationary body click
        // keeps the original open / close / turn-over gesture.
        if (flip.current?.pageFlip()?.getState() !== 'read') return
        if (current === 0 || current === lastPage) void next()
        else closeBook()
      }} onKeyDown={event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
        if (event.key === 'ArrowRight') { event.preventDefault(); next() }
        if (event.key === 'Home') { event.preventDefault(); jump(0) }
        if (event.key === 'End') { event.preventDefault(); jump(lastPage - 2) }
      }}>
        {!ready ? <p className="pf-loading" role="status">{loadError ? '그림책을 불러오지 못했어요. 페이지를 새로고침해 주세요.' : '그림책을 펼칠 준비 중…'}</p> : <>
          <div className={`pf-center pf-center--${center}${resetting || closing ? ' pf-center--resetting' : ''}`} onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === 'transform') setCentering(false) }}>
            <HTMLFlipBook ref={flip} width={440} height={622} size="stretch" minWidth={100} maxWidth={590} minHeight={140} maxHeight={835} startPage={0} drawShadow flippingTime={turnDuration} usePortrait={false} startZIndex={0} autoSize maxShadowOpacity={0.5} showCover mobileScrollSupport clickEventForward={false} useMouseEvents={!reduced} swipeDistance={30} showPageCorners={!reduced} disableFlipByClick className="picture-flipbook" style={{}} renderOnlyPageLengthChange onInit={() => { engine.current = flip.current?.pageFlip() ?? null }} onFlip={onFlip} onChangeState={onState}>{pages}</HTMLFlipBook>
          </div>
          {!locked && <button className={`pf-book-toggle${current === 0 || current === lastPage ? ' pf-book-toggle--cover' : ''}`} type="button" aria-label={current === 0 ? '표지를 열어 그림책 펼치기' : current === lastPage ? '책을 뒤집어 앞표지 보기' : '펼쳐진 그림책 덮기'} onClick={current === 0 || current === lastPage ? next : closeBook} />}
          {closing && <div className={`pf-shut pf-shut--${closing}`} aria-hidden="true"><div className="pf-shut-left" style={{ backgroundImage: `url('${spreads[pageSpecs[current].spread]}')` }} /><div className="pf-shut-flap"><div className="pf-shut-face" style={{ backgroundImage: `url('${spreads[pageSpecs[current].spread]}')` }} /><div className="pf-shut-face pf-shut-back" style={{ backgroundImage: `url('${spreads[0]}')` }} /></div></div>}
          {resetting && <div className="pf-reset-cover" aria-hidden="true"><div className="pf-reset-face" style={{ backgroundImage: `url('${spreads[0]}')` }} /><div className="pf-reset-face pf-reset-front" style={{ backgroundImage: `url('${spreads[0]}')` }} /></div>}
        </>}

      </div>
      <nav className="picture-reader-pagination" aria-label="그림책 페이지 이동"><button type="button" onClick={previous} disabled={!ready || current === 0 || locked} aria-label="그림책 이전 펼침면">{'<'}</button><p className="picture-reader-page-number" aria-live="polite">{pageLabel(current)}</p><button type="button" onClick={next} disabled={!ready || locked} aria-label={current === 0 ? '그림책 펼치기' : current === lastPage ? '책을 뒤집어 앞표지 보기' : current >= lastPage - 2 ? '마지막 장을 덮어 뒤표지 보기' : '그림책 다음 펼침면'}>{'>'}</button></nav>
    </div>
    {unbound && <div className="picture-proof-gallery" aria-label="순서대로 펼쳐 놓은 그림책">{spreads.map((src, index) => <button key={src} type="button" onClick={() => setEnlarged(index)} aria-label={`${index === 0 ? '표지' : `${index * 2 - 1}–${index * 2} / 34쪽`} 크게 보기`}><img src={src} alt={index === 0 ? '앞표지와 뒤표지' : `${index * 2 - 1}–${index * 2}쪽`} loading="lazy" /><span>{index === 0 ? '표지' : `${index * 2 - 1}–${index * 2} / 34쪽`}</span></button>)}</div>}
    {enlarged !== null && <ImageViewer images={spreads} initialIndex={enlarged} title="네가 잠들면 꿈꾸는 건 나" onClose={() => setEnlarged(null)} />}
  </section>
}
