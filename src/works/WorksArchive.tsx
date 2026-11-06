import ConnectedWorks from './ConnectedWorks'
import { dreamConnectionIds } from './connections'
import PictureBookDetail from './PictureBookDetail'
import EventDialog from './EventDialog'
import ExhibitionDetail from './ExhibitionDetail'
import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, works } from './data'
import type { Category } from './data'
import { compareChronological, mixWorks } from './ordering'
import { archiveUrl, navigate, useLocationSearch } from './navigation'
import WorkDetail from './WorkDetail'
import LiteratureDetail from './LiteratureDetail'
import { literature } from './literature'
import './works.css'

export default function WorksArchive() {
  const search = useLocationSearch()
  const workId = new URLSearchParams(search).get('work')
  const selected = works.find(work => work.id === workId)
  const eventWork = selected?.category === '이벤트' ? selected : undefined
  const archiveScroll = useRef(0)
  const title = useRef<HTMLHeadingElement>(null)
  const [category, setCategory] = useState<Category>('전체')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('mixed')
  const [mixedWorks] = useState(() => mixWorks(works))
  const [year, setYear] = useState('전체')
  const [connection, setConnection] = useState('전체')
  const reset = () => { setCategory('전체'); setYear('전체'); setQuery(''); setSort('mixed'); setConnection('전체') }
  useEffect(() => {
    document.title = eventWork?.title ?? (selected ? `${selected.title} - parkse0eum` : 'w0rks - parkse0eum')
    if (!eventWork) window.scrollTo(0, selected ? 0 : archiveScroll.current)
    if (!selected) title.current?.focus({ preventScroll: true })
  }, [selected, eventWork])
  const openWork = (id: string) => {
    archiveScroll.current = window.scrollY
    navigate(archiveUrl(id))
  }
  const visible = useMemo(() => mixedWorks.filter(work =>
    (connection === '전체' || dreamConnectionIds.includes(work.id)) &&
    (category === '전체' || (category === '참여작' ? work.participation : work.category === category)) &&
    (year === '전체' || String(work.year) === year) &&
    `${work.title} ${work.genre ?? ''} ${work.entries?.map(entry => `${entry.title} ${entry.genre ?? ''} ${entry.roles?.join(' ') ?? ''}`).join(' ') ?? ''} ${work.category} ${work.year ?? ''} ${work.roles?.join(' ') ?? ''}`.normalize('NFC').toLocaleLowerCase().includes(query.trim().normalize('NFC').toLocaleLowerCase())
  ).sort((a, b) => sort === 'mixed' ? 0 : sort === 'title' ? a.title.localeCompare(b.title, 'ko') :
    a.year === undefined ? (b.year === undefined ? a.id.localeCompare(b.id) : 1) : b.year === undefined ? -1 :
    sort === 'oldest' ? compareChronological(a, b) : compareChronological(b, a)), [category, query, sort, year, mixedWorks, connection])

  if (selected?.id === 'dream-book') return <PictureBookDetail key={selected.id} work={selected} />
  if (selected && literature[selected.id]) return <LiteratureDetail key={selected.id} work={selected} book={literature[selected.id]} />
  if (selected?.category === '전시') return <ExhibitionDetail key={selected.id} work={selected} />
  if (selected && !eventWork) return <WorkDetail key={selected.id} work={selected} />

  return <main className="works-page">

      {eventWork && <EventDialog key={eventWork.id} work={eventWork} />}
      <div className="archive-content">
        <h1 className="sr" ref={title} tabIndex={-1}>작품 아카이브</h1>
        <div className="archive-filterbar">
          <label className="archive-dropdown"><span>분류</span><select aria-label="작품 분류" value={category} onChange={e => { if (e.target.value === '몽글덤') window.location.assign('https://mongledum.com/'); else setCategory(e.target.value as Category) }}>{categories.map(item => <option key={item} value={item}>{item === '몽글덤' ? '몽글덤 ↗' : item}</option>)}</select></label>
          <label className="archive-dropdown"><span>연도</span><select aria-label="작품 연도" value={year} onChange={e => setYear(e.target.value)}><option>전체</option>{[...new Set(works.flatMap(work => work.year ? [work.year] : []))].sort((a, b) => b - a).map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="archive-dropdown"><span>정렬</span><select aria-label="작품 정렬" value={sort} onChange={e => setSort(e.target.value)}><option value="mixed">섞어 보기</option><option value="newest">최신순</option><option value="oldest">오래된순</option><option value="title">제목순</option></select></label>
          <label className="archive-dropdown archive-connection"><span>연결하기</span><select aria-label="작업 연결하기" value={connection} onChange={event => {
            setConnection(event.target.value)
            if (event.target.value !== '전체') { setCategory('전체'); setYear('전체'); setQuery('') }
          }}><option value="전체">전체</option><option value="dream">네가 잠들면 꿈꾸는 건 나</option></select></label>
          <button className="archive-reset" onClick={reset}>필터 초기화</button>
        </div>
        <div className="archive-tools"><p className="archive-count" role="status">{visible.length} works</p><label className="archive-search"><span className="sr">작품 검색</span><input type="search" placeholder="검색" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
        {visible.length ? connection !== '전체' ? <ConnectedWorks items={visible} onOpen={openWork} /> : <div className="archive-grid">{visible.map(work => {
          const className = `work-card${work.genre === '출판물' || work.genre === '그림책' ? ' work-card--book' : ''}`
          const artwork = <div className={`work-art work-art--${work.category === '음악' || work.category === '참여작' ? 'music' : 'paper'}`}>{work.image ? <img src={work.image} alt="" loading="lazy" /> : <div className="work-type-cover"><span>{work.title}</span></div>}</div>
          return work.href
            ? <a className={className} key={work.id} href={work.href} aria-label={`${work.title} — 몽글덤 음악 페이지로 이동`}>{artwork}</a>
            : <a className={className} aria-label={`${work.title} 상세 보기`} key={work.id} href={archiveUrl(work.id)} onClick={e => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); openWork(work.id) } }}>{artwork}</a>
        })}</div> : <div className="archive-empty"><p>{category === '참여작' && !query ? '참여한 음악의 기록을 준비하고 있어요.' : '검색 조건에 맞는 작품이 없어요.'}</p><button onClick={reset}>전체 작품 보기 ↗</button></div>}
        <footer className="archive-footer"><span>parkse0eum · archive</span></footer>
      </div>
    </main>
}
