import { literaryTexts } from './literaryTexts'
import type { LiteraryGenre } from './data'

export type LiteraryEntry = { id: string; title: string; genre: LiteraryGenre; body: string }
export type BookDetail = {
  authors: string[]
  publisher: string
  width: number
  height: number
  pages: number
  year: number
  fundingUrl: string
  entries: LiteraryEntry[]
}

export const literature: Record<string, BookDetail> = {
  to: {
    authors: ['설수진', '조유진', '장서은', '정승현', '박선아', '신정연', '박서음', '신윤서', '김정인'],
    publisher: '오글', width: 135, height: 195, pages: 160, year: 2024,
    fundingUrl: 'https://tumblbug.com/5geul3',
    entries: [
      { id: 'intro', title: '들어가며', genre: '시', body: literaryTexts.intro },
      { id: 'outro', title: '나가며', genre: '시', body: literaryTexts.outro },
      { id: 'letters', title: '편지질', genre: '시', body: literaryTexts.letters },
    ],
  },
  'blue-or-not': {
    // Names checked against the creator's author-introduction image on Tumblbug.
    authors: ['김학표', '도로시', '간지원', '배준호', '이훈정', '박부연', '이강진', '유지원', '오연석', '안재욱', '심성무', '박서음'],
    publisher: '오어낫', width: 131, height: 191, pages: 202, year: 2025,
    fundingUrl: 'https://tumblbug.com/ornah',
    // Genre labels follow the author's explicit decisions, irrespective of form.
    entries: [
      { id: 'blue', title: '靑', genre: '산문', body: literaryTexts.blue },
      { id: 'moments', title: '순간을 기념하는 시', genre: '산문', body: literaryTexts.moments },
      { id: 'distance', title: '너와 나 사이에는 파랑만큼의 거리', genre: '산문', body: literaryTexts.distance },
    ],
  },
}
