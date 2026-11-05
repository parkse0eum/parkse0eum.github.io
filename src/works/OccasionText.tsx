const profiles: Record<string, string> = {
  '@gwasuwon': 'https://www.instagram.com/gwasuwon/',
  '@parkse0eum': 'https://www.instagram.com/parkse0eum/',
  '@yonjosong': 'https://www.instagram.com/yonjosong/',
  '@mongledum_official': 'https://www.instagram.com/mongledum_official/',
  '@meonji._.o': 'https://www.instagram.com/meonji._.o/',
  '@shop.bluekey': 'https://www.instagram.com/shop.bluekey/',
}

export default function OccasionText({ text }: { text: string }) {
  return <>{text.split(/(@[A-Za-z0-9_.]+)/g).map((part, index) => profiles[part]
    ? <a className="instagram-mention" key={index} href={profiles[part]} target="_blank" rel="noopener noreferrer">{part}</a>
    : part)}</>
}
