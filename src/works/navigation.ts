import { useSyncExternalStore } from 'react'

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener)
  return () => window.removeEventListener('popstate', listener)
}
export const archiveUrl = (id?: string) => `?view=works${id ? `&work=${encodeURIComponent(id)}` : ''}`
export function navigate(href: string) {
  const current = new URLSearchParams(window.location.search)
  const fromArchive = current.get('view') === 'works' && !current.has('work')
  window.history.pushState({ archiveNavigation: true, fromArchive }, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
export function useLocationSearch() {
  return useSyncExternalStore(subscribe, () => window.location.search, () => '')
}
