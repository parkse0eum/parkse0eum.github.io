import { works } from './data'
import { archiveUrl, navigate } from './navigation'

export default function BookNavigation({ currentId }: { currentId: string }) {
  const books = works.filter(item => item.category === '문학' && (item.genre === '출판물' || item.genre === '그림책')).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
  return <nav className="detail-album-nav detail-book-nav" aria-label="출간 연도순 도서">{books.map(book => <a key={book.id} href={archiveUrl(book.id)} aria-current={book.id === currentId ? 'page' : undefined} onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(archiveUrl(book.id))
  }}><span>{book.title}</span></a>)}</nav>
}
