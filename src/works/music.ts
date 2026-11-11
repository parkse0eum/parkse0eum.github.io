export type MusicDetail = {
  videoUrl: string
  releaseDate: string
  label: string
  introduction: string
  lyrics: string
  credits: [string, string][]
  links: { name: string; href: string }[]
  source: string
}

// Introduction and lyrics: the artist's local portfolio, “박서음의 살림살이, 서음집”.
// Release metadata and credits cross-checked against the distributor and Bugs album pages.
export const music: Record<string, MusicDetail> = {
  chamomile: {
    videoUrl: 'https://youtu.be/xrPbGzLnDrg?si=PFQB-eMIJfjcrAYc',
    releaseDate: '2022. 05. 04.',
    label: '최소우주주식회사',
    source: 'https://music.bugs.co.kr/album/20465648',
    introduction: `어제는 시를 한 편 썼어
친구랑 마주앉아
캐모마일 차를 마시다가
오후는 향긋했고

마일은 이국의 거리 단위

친구는 꾸벅꾸벅 졸다가 말고 유리잔 속으로
빨려 들어갈 것만 같은데

캐모마일만큼 달리는 기분이라니?

어디로 가야 하는지 모르고
처음도 끝도 모르고

사랑하던 날들이 흩날리고 있어

나는 꿈만 같았어

그대를 더 이상 볼 수 없는 이유는
우리가 태어나기 전에
사랑을 다하였기 때문이라고

고개를 끄덕이다가

오늘은 어제 써둔 시를 노래하듯이 읽어보았어

우리는 이렇게 지속되고 있는 거야`,
    lyrics: `나 언제까지 수줍을 수 있을까요
여기서 저기까지
살결을 지나쳐갈 때
그댈 믿는 건 쉬운 일이에요

늘 가득하게 비어 있는 땀방울과
작은 숨결 너머로
햇살이 허물어질 때
저 구름에서 몇 밤을 달려와도

혼자라는 약속이 아니라
우리라는 다짐을 믿어요
나 언젠가 반드시 그대를 보살피던 꿈
우린 그날 울다 웃다가 잠이 들 거예요

이제는 가볼게
나 언젠가는 미워할 수 있을까요
나의 두 눈이 눈물을 기다리던 봄날에서`,
    credits: [
      ['Produced by', '조동희 Jo Donghee'],
      ['Lyrics by', '박서음 Park Seoeum'],
      ['Composed by', '박서음 Park Seoeum, 이소정 Lee Sojeong'],
      ['Arranged by', '조동익 Jo Dongik'],
      ['Chorus by', '동은 Dongeun, 이소정 Lee Sojeong'],
      ['Keyboard by', '이소정 Lee Sojeong'],
      ['Recorded by', '이성록 Lee Seongrok @blue red Studio'],
      ['Mixed & Mastered by', '조동익 Jo Dongik'],
      ['Photo by', '정재희 Jeong Jaehee'],
      ['Designed by', 'Zioon'],
      ['Producted by', '최소우주 Micro Universe'],
    ],
    // Listening URLs are supplied by the artist; do not discover or substitute links.
    links: [
      { name: 'youtube music', href: 'https://music.youtube.com/playlist?list=OLAK5uy_n9V1BHhZL6zi2JKZ5qbYBkvz0ddb7q-xQ' },
      { name: 'apple music', href: 'https://music.apple.com/us/album//1621976802' },
      { name: 'spotify', href: 'https://open.spotify.com/intl-ko/album/1Qyb6SxsXDeOlhvzCUkafR' },
      { name: 'amazon music', href: 'https://www.amazon.com/dp/B09ZB1TJ4T' },
      { name: 'tidal', href: 'https://tidal.com/album/227112948' },
      { name: 'melon', href: 'https://www.melon.com/album/detail.htm?albumId=10939730&snsGate=Y' },
      { name: 'genie', href: 'https://www.genie.co.kr/detail/albumInfo?axnm=82669049' },
      { name: 'bugs', href: 'https://music.bugs.co.kr/album/20465648?wl_ref=list_tr_11_search' },
      { name: 'vibe', href: 'https://vibe.naver.com/album/7524107' },
      { name: 'flo', href: 'https://www.music-flo.com/detail/album/edhaizizn/albumtrack' },
    ],
  },
  'dream-song': {
    videoUrl: 'https://youtu.be/VejbjQwBUts?si=CD1ND-wuAnyGJAkm',
    releaseDate: '2023. 10. 25.',
    label: 'parkse0eum',
    source: 'https://music.bugs.co.kr/album/20599115',
    introduction: `미래의 정욱 씨와 미래의 서음 씨가 [네가 잠들면 꿈꾸는 건 나]라는 곡에 관해 이야기 나누고 있다. 나는 두 사람 사이에 잠자코 앉아만 있다가, (최대한 고스란히) 그들의 대화를 옮겨적기 시작한다.

정욱: 가사에서 너와의 이야기는 계속되는 중이야, 아니면 완전히 끝나버린 이후야?
서음: 이 노래에서 나는 실제로 겪었던 장면과 그저 바람일 뿐인 장면이 겹쳐 보이고 있어.
정욱: 오호랏.
서음: 그에게 시간이란 과거를 무한히 반복하다가 매번 새롭게 흐르게 되어버린 어떤 거라서, 네가 없어도 너와의 이야기는 시작도 끝도 없이 영원할 수 있어.
정욱: 그럼 마음이 늘 흐른다는 것도 비슷한 뜻이야?
서음: 마음은 시간에게조차 발견될 수 없게 숨어버린, 말하자면 사랑 같은 거라서 조금 다를지도?
정욱: 이야하하하. 갑자기 속이 울렁거린다!
서음: 됐고. 곡의 중간에 깃든 침묵은 어떤 의미야? 벌써 끝난 건가 싶었는데, 냅다 다시 시작되니까 은근히 기분 좋더라.
정욱: 아 그건 연극 중간의 인터미션을 염두에 둔 느낌? 아직 이야기가 남아 있으니, 쉬어가는 그런 느낌…
서음: 그럼 피아노랑 플루겔혼을 택한 것도 필라이크필이었어?
정욱: 두 악기 모두 반주의 영역으로 들어가고, 그 위에 보컬이 입혀지는 구성은 단순한 듯해도 쉽게 찾아볼 순 없어. 그렇기 때문에 더 시도해보고 싶었고.
서음: 아 웃겨. 아주 그냥 멋, 들어져.
정욱: 친숙한 재료들로 완전히 색다른 음식을 만들려고 했던 듯? 허술한 부분을 오히려 드러내보기도 하면서.
서음: 맛있는 생각… 플루겔혼 버튼 소리가 내 호흡마냥 들리는 것도 역시 세계분의 비빔박자,
정욱: 아 그럼 있잖아.
서음: 뭐가 있어!
정욱: 네가 잠들면 내가 꿈을 꾼다는 말이 설레기도 하고 슬프기도 한데. 둘 중 어떤 기분으로 썼던 거야?
서음: 한동안, 아니면 영영 잠드는 순간이 오면? 우리를 기억하는 누군가가 우리 대신에 꿈꾸게 될 거라고 생각했었어.
정욱: 아니 그러면 살아도 산 게 아니고 죽어도 죽은 게 아니라는 건가?
서음: 하여튼 사랑한다는 기분으로 썼다는 뜻이야. 나를 통과해갔던 모든 너에게 전하고픈, 아주 오래된 안부와도 같은 말이었어. 너도 이제 잘 가. 안녕히.
정욱: 안녕.

두 사람은 지금 미래의 가을, 미래의 지붕, 미래의 햇빛 아래에 있다.
나는 이 모든 게 아주 먼 옛날 먼 나라에서 모르는 아이가 꾸고 있는 꿈이거나, 아직 한 번도 펼쳐진 적 없는 책에 이미 적혀 있는 이야기라는 걸 알고 있었다.`,
    lyrics: `너의 눈빛이 나의 긴 휴일이었던
무더운 여름 이젠 식어가네
넌 지금 무얼 하나
남겨진 거리의 반짝임만이 대답이 되었네

놓아버린 것들이 있던가
두리번거리면
다시 또 내게 다녀왔다고
잘 있었냐고 말하던 너

그럼 난 아무 일 없었단 듯
너의 품에 안겼었네
행복하다고 말해 보았던 시절엔
많은 게 흐릿해져 가도

여전히 눈 감아도 볼 수 있는 건
마음은 늘 흐른단 것
나의 가까이에
날 재워주는 노래 있었단 것
그게 너의 이름이었네

변해버린 것들이 있던가
두리번거리면
언제나 내게 고마웠다고
잘 지내라고 말하던 너

서로에게 머물러 있었던
어느 평범한 오후엔
네가 잠들면 꿈을 꾸는 건 나였네`,
    credits: [
      ['Produced by', '박서음 Park Seoeum'],
      ['Lyrics by', '박서음 Park Seoeum'],
      ['Composed by', '박정욱 Park Jeongwook'],
      ['Arranged by', '박정욱 Park Jeongwook'],
      ['Vocal by', '박서음 Park Seoeum'],
      ['Piano by', '박정욱 Park Jeongwook'],
      ['Flugelhorn by', '박정욱 Park Jeongwook'],
      ['Recorded by', '이성록 Lee Seongrok @blueredstudio'],
      ['Vocal Directed by', '동은 Dongeun'],
      ['Vocal Tune & Edited by', '동은 Dongeun'],
      ['Mixed by', '조동익 Jo Dongik @rainbowstudio'],
      ['Mastered by', '조동익 Jo Dongik @rainbowstudio'],
      ['Artwork by', '정성아 Jung Sung A'],
      ['Thanks to', '조동희 Jo Donghee'],
    ],
    // Listening URLs supplied by the artist.
    links: [
      { name: 'youtube music', href: 'https://music.youtube.com/playlist?list=OLAK5uy_mHC8d9CAouWAm1dvlTUxIq3bUhm-hTwJQ' },
      { name: 'apple music', href: 'https://music.apple.com/US/album/1712443754?ls=1' },
      { name: 'spotify', href: 'https://open.spotify.com/intl-ko/album/4J2lJZxhiROmM7vPH4cPix' },
      { name: 'amazon music', href: 'https://www.amazon.com/dp/B0CL9Q84J8' },
      { name: 'tidal', href: 'https://tidal.com/album/322463538' },
      { name: 'melon', href: 'https://www.melon.com/album/detail.htm?albumId=11350012&snsGate=Y' },
      { name: 'genie', href: 'https://www.genie.co.kr/detail/albumInfo?axnm=84393018' },
      { name: 'bugs', href: 'https://music.bugs.co.kr/album/20599115?wl_ref=list_tr_11_search' },
      { name: 'vibe', href: 'https://vibe.naver.com/album/30107449' },
      { name: 'flo', href: 'https://www.music-flo.com/detail/album/418274074/albumtrack' },
    ],
  },
}
