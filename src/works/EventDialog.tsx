import EventGallery from './EventGallery'
import OccasionText from './OccasionText'
import { useEffect, useRef } from 'react'
import type { Work } from './data'
import { occasions } from './occasionTexts'
import { archiveUrl, navigate } from './navigation'

export default function EventDialog({ work }: { work: Work }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const copy = occasions[work.id]
  const images = work.images?.length ? work.images : work.image ? [work.image] : []
  const close = () => {
    if (window.history.state?.fromArchive) window.history.back()
    else navigate(archiveUrl())
  }
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} className="event-dialog" aria-labelledby="event-title" onCancel={event => { event.preventDefault(); close() }} onClick={event => {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
  }}>
    <div className="event-dialog-toolbar"><span>이벤트 · {work.year}</span><button type="button" onClick={close} aria-label="이벤트 닫기" autoFocus>닫기 ×</button></div>
    <article>
      {images.length > 0 && <EventGallery images={images} title={copy?.title ?? work.title} />}
      <div className="event-dialog-copy">
        <h2 id="event-title">{copy?.title ?? work.title}</h2>
        <p className="occasion-information">{copy?.information ?? work.date}</p>
        <p className="occasion-text"><OccasionText text={copy?.body ?? work.description ?? ''} /></p>
      </div>
    </article>
  </dialog>
}
