import { useState } from 'react'
import ImageViewer from './ImageViewer'

export default function EventGallery({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0)
  const [enlarged, setEnlarged] = useState(false)
  const go = (index: number) => setCurrent(Math.max(0, Math.min(images.length - 1, index)))
  return <section className="event-gallery" aria-label={`${title} 이미지 모음`}>
    <div className="event-gallery-frame"><button type="button" className="event-gallery-enlarge" onClick={() => setEnlarged(true)} aria-label="현재 사진 크게 보기"><img className="event-dialog-image" src={images[current]} alt={`${title} — ${current + 1} / ${images.length}`} /></button></div>
    <div className="event-gallery-controls">
      {images.length > 1 && <button type="button" onClick={() => go(current - 1)} disabled={current === 0} aria-label="이전 사진">{'<'}</button>}
      {images.length > 1 && <div className="event-gallery-dots">{images.map((src, index) => <button type="button" key={src} aria-label={`${index + 1}번째 사진 보기`} aria-current={index === current ? 'true' : undefined} onClick={() => go(index)} />)}</div>}
      <span className="event-gallery-count" aria-live="polite">{current + 1} / {images.length}</span>
      <button type="button" className="event-gallery-zoom-label" onClick={() => setEnlarged(true)}>크게 보기</button>
      {images.length > 1 && <button type="button" onClick={() => go(current + 1)} disabled={current === images.length - 1} aria-label="다음 사진">{'>'}</button>}
    </div>
    {enlarged && <ImageViewer images={images} initialIndex={current} title={title} onClose={() => setEnlarged(false)} />}
  </section>
}
