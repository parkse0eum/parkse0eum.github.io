import { useEffect, useLayoutEffect, useId, useRef, useState } from 'react'
import { nextEnvelopeStep } from './envelopeState'
import type { EnvelopeAction, EnvelopeStep } from './envelopeState'
import './envelope-letter.css'

export default function EnvelopeLetter() {
  const [step, setStep] = useState<EnvelopeStep>(0)
  const lockedUntil = useRef(0)
  const sheet = useRef<HTMLButtonElement>(null)
  const fold = useRef({ x: 0, y: 0 })
  const id = useId().replace(/:/g, '')
  const texture = `grain-${id}`
  const paperLabels = ['', '편지지 꺼내기', '편지지 절반 펼치기', '편지지 완전히 펼치기', '편지지 절반 접기', '편지지 한 번 더 접기', '편지지 봉투에 넣기', '']
  useEffect(() => {
    lockedUntil.current = 0
    return () => { lockedUntil.current = 0 }
  }, [])
  const act = (action: EnvelopeAction) => {
    if (Date.now() < lockedUntil.current) return
    const next = nextEnvelopeStep(step, action)
    if (next === step) return
    lockedUntil.current = Date.now() + (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900)
    setStep(next)
  }
  const outside = step >= 2 && step <= 6
  const half = step === 3 || step === 5
  const full = step === 4
  useLayoutEffect(() => {
    const element = sheet.current
    if (!element) return
    const from = { ...fold.current }
    const to = { x: half || full ? 1 : 0, y: full ? 1 : 0 }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const start = performance.now()
    const paint = (time: number) => {
      const t = reduced ? 1 : Math.min(1, (time - start) / 850)
      const eased = (1 - Math.cos(Math.PI * t)) / 2
      const x = from.x + (to.x - from.x) * eased
      const y = from.y + (to.y - from.y) * eased
      fold.current = { x, y }
      // Orthographic projection of a hinged sheet; no perspective or artificial depth.
      element.style.setProperty('--fold-x', String(-Math.cos(Math.PI * x)))
      element.style.setProperty('--fold-y', String(-Math.cos(Math.PI * y)))
      element.style.setProperty('--fold-shadow', String(Math.sin(Math.PI * y) * .12))
      element.dataset.yBack = String(y < .5)
      if (t < 1) frame = requestAnimationFrame(paint)
    }
    paint(start)
    return () => cancelAnimationFrame(frame)
  }, [half, full])
  const shape = (d: string, fill: string) => <g><path d={d} fill={fill} /><path d={d} fill={`url(#${texture})`} /></g>

  return <figure id="letter-poem" className="envelope-letter" data-step={step} data-outside={outside} data-fold={full ? 'full' : half ? 'half' : 'quarter'}>
    <div className="letter-stage">
      <svg className="envelope-back" viewBox="0 0 704 470" aria-hidden="true">
        <defs>
          <pattern id={texture} width="140" height="140" patternUnits="userSpaceOnUse"><image href="/images/works/letter-grain.svg" width="140" height="140" /></pattern>
          <linearGradient id={`lining-${id}`} x2="0" y2="1"><stop stopColor="#e5e1d9" /><stop offset="1" stopColor="#f0ede7" /></linearGradient>
        </defs>
        {shape('M0 0H704V470H0Z', `url(#lining-${id})`)}
      </svg>
      <div className="letter-carrier">
        <button ref={sheet} className="physical-letter" type="button" onClick={() => act('paper')} aria-label={paperLabels[step] || '봉투 안의 편지'} aria-expanded={full} tabIndex={step > 0 && step < 7 ? 0 : -1} aria-hidden={step === 0 || step === 7}>
          {(['left', 'right'] as const).map(side => <span className={`letter-half letter-half--${side}`} key={side}>
            <span className={`letter-panel letter-panel--top letter-panel--${side}`}>
              <span className="letter-face letter-face--front" />
            </span>
            <span className={`letter-panel letter-panel--bottom letter-panel--${side}`}>
              <span className="letter-face letter-face--front" />
              <span className="letter-face letter-face--back" />
            </span>
          </span>)}
          <span className="letter-crease-vertical" />
          <span className="letter-crease-horizontal" />
        </button>
      </div>
      <svg className="envelope-pocket" viewBox="0 0 704 470" aria-hidden="true">
        <defs>
          <linearGradient id={`left-${id}`} x2="1" y2="1"><stop stopColor="#f8f6f1" /><stop offset="1" stopColor="#e8e4dc" /></linearGradient>
          <linearGradient id={`right-${id}`} x1="1" x2="0" y2="1"><stop stopColor="#f8f6f1" /><stop offset="1" stopColor="#e9e5de" /></linearGradient>
          <linearGradient id={`bottom-${id}`} x2="0" y2="1"><stop stopColor="#f7f5ef" /><stop offset="1" stopColor="#eeebe4" /></linearGradient>
        </defs>
        {shape('M0 0Q38 2 80 43L320 263L0 470Z', `url(#left-${id})`)}
        {shape('M704 0Q665 2 624 43L384 263L704 470Z', `url(#right-${id})`)}
        {shape('M0 470Q5 438 42 400L235 219Q250 204 275 204H429Q454 204 470 220L662 400Q699 438 704 470Z', `url(#bottom-${id})`)}
        <path d="M0 0Q38 2 80 43L242 196M704 0Q665 2 624 43L462 196M0 470Q5 438 42 400L235 219Q250 204 275 204H429Q454 204 470 220L662 400Q699 438 704 470" fill="none" stroke="#d7d1c5" strokeWidth=".8" />
      </svg>
      <button className="envelope-flap" type="button" onClick={() => act('flap')} aria-label={step === 0 ? '편지봉투 윗부분 열기' : '편지봉투 윗부분 닫기'} aria-expanded={step !== 0} tabIndex={step === 0 || step === 7 ? 0 : -1}>
        <svg viewBox="0 0 704 320" aria-hidden="true">
          {shape('M0 0H704Q704 21 672 51L385 302Q352 331 319 302L32 51Q0 21 0 0Z', '#f0ede6')}
          <path d="M1 1H703M32 51L319 302Q352 331 385 302L672 51" fill="none" stroke="#d8d2c7" strokeWidth="1" />
        </svg>
      </button>
    </div>
  </figure>
}
