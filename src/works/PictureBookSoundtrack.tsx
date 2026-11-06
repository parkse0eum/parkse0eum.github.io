import { useRef } from 'react'

export default function PictureBookSoundtrack({ titleId, open, onOpenChange }: { titleId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const button = useRef<HTMLButtonElement>(null)
  // The artist supplied this exact video; load it only after the listening click.
  const params = new URLSearchParams({ playsinline: '1', rel: '0', autoplay: '1' })
  return <>
    <button ref={button} className="picture-book-headphones" type="button" aria-label={open ? '그림책 음악 끄기' : '그림책과 함께 음악 듣기'} aria-pressed={open} aria-expanded={open} aria-controls="picture-book-soundtrack" title="책을 읽으며 음악 듣기" onClick={() => onOpenChange(!open)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 14v-3a9 9 0 0 1 18 0v3" /><rect x="3" y="12" width="4" height="9" rx="2" /><rect x="17" y="12" width="4" height="9" rx="2" /></svg>
    </button>
    {open && <section className="picture-book-soundtrack" id="picture-book-soundtrack" aria-labelledby={titleId}>
      <div className="picture-book-soundtrack-bar"><span>함께 듣기</span><button type="button" aria-label="음악 재생기 닫기" onClick={() => { onOpenChange(false); button.current?.focus() }}>닫기 ×</button></div>
      <iframe src={`https://www.youtube-nocookie.com/embed/VejbjQwBUts?${params}`} title="네가 잠들면 꿈꾸는 건 나 — YouTube 음악 재생기" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </section>}
  </>
}
