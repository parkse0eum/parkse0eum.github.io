import room2 from '../assets/library/projects/busan-indie-book-fair/artwork-02.png'
import room3 from '../assets/library/projects/busan-indie-book-fair/artwork-03.png'
import room4 from '../assets/library/projects/busan-indie-book-fair/artwork-04.png'
import room5 from '../assets/library/projects/busan-indie-book-fair/artwork-05.png'
import room6 from '../assets/library/projects/busan-indie-book-fair/artwork-06.png'
import room from '../assets/library/projects/busan-indie-book-fair/artwork-01.png'
import event2 from '../assets/library/projects/dangmal-kkumwoo-02.jpg'
import eventBusan from '../assets/library/projects/dangmal-kkumwoo-busan.jpg'
import exhibition from '../assets/library/projects/two-person-exhibition-poster.jpg'
import event from '../assets/library/projects/dangmal-kkumwoo-01.jpeg'

export const categories = ['전체', '문학', '음악', '전시', '참여작', '이벤트', '몽글덤'] as const
export type Category = typeof categories[number]
export type LiteraryGenre = '시' | '산문' | '출판물' | '그림책'
export type Work = { href?: string; chronologicalOrder?: number; genre?: LiteraryGenre; entries?: { title: string; genre?: LiteraryGenre; roles?: string[] }[]; format?: 'EP' | '책'; id: string; title: string; category: Category; year?: number; date?: string; image?: string; images?: string[]; description?: string; roles?: ('작사' | '작곡' | '편곡' | '연주' | '보컬')[]; participation?: boolean }
// 장르는 작가가 지정한 창작적 분류입니다. 제목이나 일반적인 문학 형식으로 재분류하지 않습니다.
// 이미지는 image(대표 이미지), images(상세 이미지)에 추가합니다. 참여 음악에는 participation과 확인된 roles를 지정합니다.
export const works: Work[] = [
  { id: 'to', title: '(  )가 (  )에게', category: '문학', genre: '출판물', year: 2024, format: '책', image: '/images/works/to-book-corrected.png', entries: [{ title: '들어가며', genre: '시' }, { title: '나가며', genre: '시' }, { title: '편지질', genre: '시' }] },
  { id: 'blue-or-not', title: 'Blue or Nah', category: '문학', genre: '출판물', year: 2025, format: '책', image: '/images/works/blue-or-not.png', entries: [{ title: '靑', genre: '산문' }, { title: '순간을 기념하는 시', genre: '산문' }, { title: '너와 나 사이에는 파랑만큼의 거리', genre: '산문' }] },
  { id: 'dream-book', chronologicalOrder: 1, title: '네가 잠들면 꿈꾸는 건 나', category: '문학', genre: '그림책', year: 2026, image: '/images/works/dream-book-cover-left.png' },
  { id: 'chamomile', title: '캐모마일 달리기', category: '음악', year: 2022, image: '/images/works/chamomile-album.jpeg' },
  { id: 'dream-song', title: '네가 잠들면 꿈꾸는 건 나', category: '음악', year: 2023, image: '/images/works/dream-album.jpeg' },
  { id: 'eternal-sunshine', title: '인간은 별안간', href: 'https://mongledum.com/music?year=2025&album=001-%EC%9D%B8%EA%B0%84%EC%9D%80+%EB%B3%84%EC%95%88%EA%B0%84', category: '참여작', year: 2025, participation: true, image: '/images/works/eternal-sunshine.jpeg' },
  { id: 'mongledum-001', chronologicalOrder: 7, title: 'mongledum 001', category: '참여작', year: 2026, href: 'https://mongledum.com/music?year=2026&album=001-mongledum+001+%28feat.+%EA%B9%80%EB%A8%BC%EC%A7%80%29', format: 'EP', participation: true, image: '/images/works/mongledum-001-original.jpg', entries: [{ title: '물방울이 두근두근', roles: ['작사'] }, { title: '같지 않은 것과 같잖은 것', roles: ['작사'] }, { title: 'diib', roles: ['작사'] }, { title: '폭설', roles: ['작사'] }] },
  { id: 'dream-exhibition', chronologicalOrder: 2, title: '네가 잠들면 꿈꾸는 건 나', category: '전시', year: 2026, date: '2026. 4. 13. – 5. 31.', image: exhibition },
  { id: 'our-dream', chronologicalOrder: 3, title: '당신이 말하면 꿈꾸는 건 우리 1', category: '이벤트', year: 2026, date: '2026. 4. 17.', image: event },
  { id: 'our-dream-2', chronologicalOrder: 4, title: '당신이 말하면 꿈꾸는 건 우리 2', category: '이벤트', year: 2026, date: '2026. 5. 30.', image: event2 },
  { id: 'our-dream-3', chronologicalOrder: 6, title: '당신이 말하면 꿈꾸는 건 우리 3 · 부산', category: '이벤트', year: 2026, date: '2026. 7. 24.', image: eventBusan },
  { id: 'room', chronologicalOrder: 5, title: '부산인디북포트 《parkse0eum’s room》', category: '이벤트', year: 2026, date: '2026. 7. 24. – 30.', image: room, images: [room, room2, room3, room4, room5, room6] },
]
