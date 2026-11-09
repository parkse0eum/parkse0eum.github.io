import { useId, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { PERFORATION_X, tearGeometry } from './tearGeometry'
import './tearable-stationery.css'

export default function TearableStationery() {
  const [progress, setProgress] = useState(0)
  const grip = useRef<{ pointerId: number; target: HTMLDivElement; x: number; progress: number; width: number } | null>(null)
  const id = useId().replace(/:/g, '')
  const geometry = tearGeometry(progress)
  const torn = progress === 1
  const clearGrip = () => {
    const held = grip.current
    grip.current = null
    if (held?.target.hasPointerCapture(held.pointerId)) held.target.releasePointerCapture(held.pointerId)
  }
  const moveTo = (value: number) => {
    if (value >= .975) clearGrip()
    setProgress(value >= .975 ? 1 : Math.max(0, Math.min(1, value)))
  }
  const reset = () => { clearGrip(); setProgress(0) }
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (torn || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    grip.current = { pointerId: event.pointerId, target: event.currentTarget, x: event.clientX, progress, width: bounds.width }
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const held = grip.current
    if (!held || held.pointerId !== event.pointerId) return
    if ((event.buttons & 1) === 0) { clearGrip(); return }
    const distance = Math.max(0, event.clientX - held.x)
    moveTo(Math.max(progress, held.progress + distance / (held.width * .65)))
  }
  const end = (event: PointerEvent<HTMLDivElement>) => {
    const held = grip.current
    if (!held || held.pointerId !== event.pointerId) return
    clearGrip()
  }
  return <figure className="tearable-stationery" id="tearable-stationery" data-torn={torn}>
    <svg className="tearable-sheet" viewBox="0 0 1100 1595" role="img" aria-label="왼쪽 점선을 따라 뜯을 수 있는, 오른쪽 아래에 집 그림이 있는 편지지">
      <defs>
        <clipPath id={`body-${id}`}><polygon points={geometry.body} /></clipPath>
        <clipPath id={`strip-${id}`}><polygon points={geometry.strip} /></clipPath>
      </defs>
      <g transform={`translate(${progress * 36} 0)`} clipPath={`url(#body-${id})`}>
        <image href="/images/works/letters-stationery.jpg" width="1100" height="1595" />
        <image href="/images/works/letter-grain.svg" width="1100" height="1595" preserveAspectRatio="none" opacity=".45" />
      </g>
      {progress > 0 && <g className="stationary-tear-strip">
        <g clipPath={`url(#strip-${id})`}>
          <image href="/images/works/letters-stationery.jpg" width="1100" height="1595" />
          <image href="/images/works/letter-grain.svg" width="1100" height="1595" preserveAspectRatio="none" opacity=".45" />
        </g>
      </g>}
      {progress > 0 && !torn && <path className="tear-fibre-shadow" d={`M${PERFORATION_X - 3},${geometry.end - 8} l6,9 -4,4`} />}
    </svg>
    {!torn && <div className="perforation-grip" role="slider" tabIndex={0}
      aria-label="오른쪽 넓은 면을 잡고 오른쪽으로 당겨 점선을 따라 찢기. 오른쪽 방향키로 조금씩 뜯기, Home 키로 되돌리기."
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-orientation="horizontal"
      onPointerDown={start} onPointerMove={move} onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={() => { grip.current = null }}
      onKeyDown={event => {
        if (['ArrowDown', 'ArrowRight', ' ', 'Enter', 'End', 'Home'].includes(event.key)) event.preventDefault()
        if (['ArrowDown', 'ArrowRight', ' ', 'Enter'].includes(event.key)) moveTo(progress + .1)
        if (event.key === 'End') moveTo(1)
        if (event.key === 'Home') reset()
      }} />}
    {torn && <button className="stationery-reset" type="button" aria-label="편지지를 다시 놓기" onClick={reset}>↺</button>}
  </figure>
}
