import type { Work } from './data'

const kind = (work: Work) => work.category === '문학' ? 'book' : work.category === '음악' || work.category === '참여작' ? 'album' : 'poster'

// Shuffle once on entry, then alternate formats while alternatives remain.
// Search and filters retain this order so the archive never jumps as you type.
export function mixWorks(works: readonly Work[], random = Math.random): Work[] {
  const pool = [...works]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const result: Work[] = []
  while (pool.length) {
    const previous = result.at(-1)
    const index = previous ? pool.findIndex(work => kind(work) !== kind(previous)) : 0
    result.push(...pool.splice(index < 0 ? 0 : index, 1))
  }
  return result
}

// The author's order resolves works within the same year, including overlapping events.
export function compareChronological(a: Work, b: Work): number {
  if (a.year === undefined) return b.year === undefined ? a.id.localeCompare(b.id) : 1
  if (b.year === undefined) return -1
  return a.year - b.year || (a.chronologicalOrder ?? 0) - (b.chronologicalOrder ?? 0) || a.id.localeCompare(b.id)
}
