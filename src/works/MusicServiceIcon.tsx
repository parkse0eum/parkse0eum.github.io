export default function MusicServiceIcon({ name }: { name: string }) {
  let artwork
  switch (name) {
    case 'youtube music':
      artwork = <><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" /><path d="m10 9 6 3-6 3Z" fill="white" /></>
      break
    case 'apple music':
      artwork = <path fill="currentColor" d="M17.1 12.4c0-2 1.7-3 1.8-3.1-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.2.8s-1.8-.8-2.9-.8c-1.5 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.1 2.6 2 1.1 0 1.5-.7 2.9-.7s1.8.7 3 .7 1.9-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.2-.1 0-2.4-.9-2.4-3.7ZM14.9 6.3c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.3-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3Z" />
      break
    case 'spotify':
      artwork = <><circle cx="12" cy="12" r="10" fill="currentColor" /><g fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M6 9c4-1.5 8-1 12 1" /><path d="M6.7 12.3c3.8-1.1 7-0.7 10.2 1" /><path d="M7.4 15.5c3-.8 5.6-.5 8.3.8" /></g></>
      break
    case 'tidal':
      artwork = <path fill="currentColor" d="m3 5 3 3-3 3-3-3Zm6 0 3 3-3 3-3-3Zm6 0 3 3-3 3-3-3Zm6 0 3 3-3 3-3-3ZM9 11l3 3-3 3-3-3Zm6 0 3 3-3 3-3-3Zm-3 6 3 3-3 3-3-3Z" />
      break
    default:
      artwork = <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17V5l12-2v12M9 9l12-2" /><ellipse cx="5.5" cy="17.5" rx="3.5" ry="2.5" /><ellipse cx="17.5" cy="15.5" rx="3.5" ry="2.5" /></g>
  }
  return <svg className="music-service-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{artwork}</svg>
}
