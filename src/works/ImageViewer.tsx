import { useEffect, useRef, useState } from 'react'

export default function ImageViewer({ images, initialIndex = 0, title, onClose }: { images: string[]; initialIndex?: number; title: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = useState(initialIndex)
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close() }, [])
  const go = (index: number) => setCurrent(Math.max(0, Math.min(images.length - 1, index)))
  return <dialog ref={dialog} className="image-viewer" aria-label={`${title} 크게 보기`} onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose() }} onClick={event => {
    event.stopPropagation()
    if (event.target === event.currentTarget) onClose()
  }} onKeyDown={event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); go(current + (event.key === 'ArrowRight' ? 1 : -1)) }
  }}>
    <div className="image-viewer-toolbar"><span>{title}</span><button type="button" onClick={onClose} autoFocus aria-label="확대 이미지 닫기">닫기 ×</button></div>
    <div className="image-viewer-stage"><img src={images[current]} alt={`${title} — ${current + 1} / ${images.length}`} /></div>
    <div className="image-viewer-controls"><button type="button" aria-label="확대 이미지 이전" onClick={() => go(current - 1)} disabled={current === 0}>{'<'}</button><span aria-live="polite">{current + 1} / {images.length}</span><button type="button" aria-label="확대 이미지 다음" onClick={() => go(current + 1)} disabled={current === images.length - 1}>{'>'}</button></div>
  </dialog>
}
