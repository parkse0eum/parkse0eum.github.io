import mongledum from '../assets/library/icons/mongledum-white.png'
import exhibition from '../assets/library/projects/two-person-exhibition-poster.jpg'
import chamomile from '../assets/library/icons/image-01.png'
import dream from '../assets/library/icons/image-02.png'

export type PageIcon = { source: [number, number]; crop?: [number, number, number, number]; label: string; image?: string; rotate?: boolean; stretch?: boolean; href?: string }
export type PageLayout = { id: string; name?: string; icons: PageIcon[] }
export const PAGE_LAYOUTS: PageLayout[] = [
  { id: 'about', name: '박서음', icons: [] },
  { id: 'outside', icons: [
    { label: '몽글덤', source: [1169, 512], image: mongledum, href: 'https://mongledum.com/' },
    { label: '네잠꿈나 2인전', source: [2100, 2800], image: exhibition, href: '?view=works&work=dream-exhibition' },
  ] },
  { id: 'writing', icons: [
    { label: '( )가 ( )에게', stretch: true, source: [1076, 1462], image: '/images/works/to-book-corrected.png', href: '?view=works&work=to' },
    { label: 'Blue or Nah', stretch: true, source: [788, 1100], image: '/images/works/blue-or-not.png', href: '?view=works&work=blue-or-not' },
  ] },
  { id: 'music', icons: [
    { label: '캐모마일 달리기', source: [2775, 2622], image: chamomile },
    { label: '네가 잠들면 꿈꾸는 건 나', source: [2775, 2622], image: dream },
  ] },
  { id: 'extra', icons: [] },
  { id: 'contact', icons: [] },
]
