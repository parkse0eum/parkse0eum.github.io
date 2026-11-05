# Homepage

React + TypeScript + Vite로 만든 박서음의 아코디언북 홈페이지입니다.

## 개발

Node.js 24 LTS를 사용합니다.

```sh
npm install
npm run dev
```

## 확인 및 빌드

```sh
npm run lint
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성됩니다. `main` 브랜치에 푸시하면 기존 Cloudflare Workers Builds 연결이 빌드하여 https://parkse0eum.com 에 배포합니다. GitHub Pages 주소와 실제 도메인의 Cloudflare 배포는 별개입니다. `wrangler.jsonc`와 `worker.mjs`는 HTML 진입 요청을 HTTPS로 전환하고 HSTS를 적용합니다. 이미지·폰트·번들은 Worker를 거치지 않고 정적 파일로 제공합니다.

`npm run build`는 이미지 원본을 수정하지 않고 `dist/`의 배포 이미지만 WebP로 최적화하고 번들 URL을 갱신합니다. 그림책은 개발 중에는 원본 JPG, 배포 시에는 최적화한 WebP 펼침면을 사용합니다. `dist/`를 직접 편집하지 말고 소스를 수정한 뒤 다시 빌드하세요.

## 주요 파일

- `src/App.tsx`: 홈 화면과 책 각 면의 React 컴포넌트
- `src/book/content.ts`: 각 면의 제목, 설명, 이미지 경로
- `src/book/animation.ts`: 책 펼치기·접기, 드래그, 키보드 조작과 애니메이션
- `src/App.css`: 화면 디자인과 반응형 스타일
- `src/main.tsx`: React 진입점
- `index.html`: React를 불러오는 HTML 틀
- `public/images/book/`: 현재 홈 화면에서 사용하는 이미지 (중복 제거, 용도별 이름)
- `public/vendor/`: 원본에 포함된 GSAP 3.15.0과 출처·라이선스 안내

화면과 콘텐츠는 React·TypeScript 파일에서 수정합니다. 원본 HTML의 디자인, 이미지, 접힘 효과를 유지하며, 컴포넌트가 해제되면 이벤트와 애니메이션을 정리합니다.

## 이미지 관리

- `.local-assets/originals/서음이미지/`: 받은 원본을 파일명과 내용 그대로 보관합니다. Git에서 제외하며 빌드·배포에도 포함하지 않습니다. 로컬 전용이므로 다른 컴퓨터에는 별도로 백업해야 합니다.
- `public/images/book/`: 현재 홈페이지에서 사용 중인 이미지입니다. 기존 디자인을 유지하도록 HTML에서 추출한 이미지를 사용합니다. 예: `/images/book/cover.png`.
- `src/assets/library/`: 받은 이미지의 작업용 사본입니다. `book/`, `backgrounds/`, `projects/`, `icons/`, `misc/`로 분류하고 소문자 영문 파일명으로 정리했습니다. 코드에서 import한 파일만 빌드에 포함됩니다.
- `src/assets/library/manifest.json`: 원래 파일명과 정리한 경로, 원본 확인용 SHA-256 해시의 대응표입니다.

라이브러리의 이미지를 화면에 넣을 때:

```tsx
import image from './assets/library/projects/blue-or-not.png'

<img src={image} alt="블루오어낫" />
```

책 각 면의 현재 이미지 경로는 `src/book/content.ts`에서 관리합니다. 표지는 `src/App.tsx`, 홈 배경과 표지 마스크는 `src/App.css`에 있습니다. `misc/image-01.png`, `misc/image-02.png`는 원래 이름이 숫자라 용도를 추정하지 않고 보관했습니다.

추가 면은 `src/assets/library/book/works.png` 원본 한 장을 사용합니다. 비율을 유지해 확대하고, 연필 곡선을 삼각형 아래 양 끝에 맞춥니다.
