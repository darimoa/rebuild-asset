# Don's Auto Upholstery — 리빌딩 사이트

[dons-upholstery.com](https://dons-upholstery.com/)의 3페이지 구식 HTML 사이트를 정적 9페이지로 재구축한 결과물.

- 설계: [08-06-2026_dons-auto-upholstery-웹사이트-설계.md](../../docs/superpowers/specs/08-06-2026_dons-auto-upholstery-웹사이트-설계.md)
- 구현 계획: [08-06-2026_dons-auto-upholstery-웹사이트-구현계획.md](../../docs/superpowers/plans/08-06-2026_dons-auto-upholstery-웹사이트-구현계획.md)

## 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 홈 |
| `auto-upholstery.html` | 오토 |
| `boat-upholstery.html` | 보트·마린 |
| `rv-upholstery.html` | RV |
| `commercial-upholstery.html` | 커머셜·플릿 |
| `materials.html` | 소재·스타일 |
| `about.html` | 소개 |
| `contact.html` | 연락처 + 견적 위저드 (`#quote`) |
| `404.html` | |

빌드 도구 없음. 파일을 그대로 올리면 끝난다. `tools/`는 이미지 빌드 전용이라 올리지 않아도 된다.

## 헤더의 모바일 메뉴 — JS 없이 동작하는 이유

모바일 메뉴는 JS 버튼이 아니라 **체크박스 + CSS 형제 선택자**로 만들었다.

```
input#navtoggle (체크박스, 시각적으로 숨김)
label.nav-toggle[for=navtoggle] (사용자가 누르는 "Menu" 버튼)
nav#nav.site-nav (메뉴 본문)
```

CSS가 `.nav-checkbox:checked ~ .site-nav { display: flex; }`로 열고 닫는다. 이 순서 때문에 JavaScript가 꺼져 있어도 메뉴가 열린다 — `main.js`는 `aria-expanded`와 Esc 닫기만 얹을 뿐, 열고 닫는 동작 자체엔 관여하지 않는다.

**헤더를 고칠 때 반드시 지킬 것**: `input#navtoggle` → `label.nav-toggle` → `nav#nav`, 이 DOM 순서를 유지해야 한다. CSS의 `~` 형제 선택자는 뒤에 오는 형제에만 적용되므로, 순서가 바뀌면 메뉴가 아예 안 열린다.

## 사진에 대한 경고

`assets/img/`의 사진은 **전부 무료 스톡이고 Don's의 실제 작업물이 아니다.** 출처는 `assets/img/CREDITS.md`에 있다.
사이트 어디에서도 작업물이라고 주장하지 않으며, `materials.html`은 상단에 안내 문구를 두고 다섯 개 카드 전부 본문 앞에 `Style reference.`를 명시한다.

실제 작업 사진을 받으면 같은 파일명으로 덮어쓰면 된다. 치수는 hero 1920×1080, card 800×600, sq 600×600.

**사진을 새로 넣거나 바꿀 때는 `tools/images.json`도 같이 고쳐야 한다.** 이 매니페스트는 이미지 슬러그 11개 전부에 `quality` 값을 명시하고 있고, `tools/build-images.mjs`는 슬러그에 `quality`가 없으면 그 파일을 건너뛰고 에러로 종료한다(기본값으로 대충 넘어가지 않는다). 지금 커밋된 WebP 11종 20개 파일은 이 매니페스트로 다시 빌드하면 바이트 단위로 동일하게 재현된다 — 직접 재빌드해서 확인했다. 사진을 교체하면 그 슬러그의 `quality`를 새로 정하고 매니페스트에 적어야 한다(고주파 텍스처는 76 이하, 단순한 사진은 82 정도가 파일 용량 예산 안에 든다).

## 고칠 때 어디를 보나

| 바꿀 것 | 위치 |
|---|---|
| 전화번호 | 전 HTML의 `tel:+13608593411`, `360-859-3411`, `main.js` |
| 이메일 | 전 HTML의 `DonsAutoUph@gmail.com`, `main.js`의 `mailtoFallback` |
| 색·폰트·간격 | `assets/css/style.css` 상단 `:root` |
| About의 사진-옆-텍스트 레이아웃 | `assets/css/style.css`의 `.split` / `.split-text` / `.split-media` (사용처: `about.html`) |
| 사진 | `assets/img/`에 같은 파일명으로 덮어쓰기 (교체 시 `tools/images.json`도 함께) |
| 견적 폼 항목 | `contact.html`의 `.wz-step` |

전 페이지에 같은 헤더·푸터가 복사돼 있다. 연락처를 바꿀 땐 9개 HTML을 전부 찾아 바꿔야 한다.
템플릿 엔진을 안 쓴 건 인수자가 빌드 없이 고칠 수 있게 하려는 의도적 선택이다.

## 검증

검사기는 사이트 폴더 밖에 있다. 여러 사이트가 같은 걸 쓰기 때문이다.

```bash
npm run check-site don-auto
```

경로·링크·앵커·이미지 속성·h1 개수·헤딩 레벨·title/description 길이·JSON-LD·파비콘·대비비·금지 표현을 검사한다.
페이지 목록은 폴더에서 자동으로 찾으므로 새 페이지를 추가해도 따로 등록할 게 없다.

사이트마다 다른 값(팔레트·전화번호·금지어)은 `scripts/site-checks/don-auto.json`에 있다.
**색 토큰을 바꿨으면 그 파일의 `contrastPairs`도 같이 고쳐야 한다.** 안 고치면 검사기가
"토큰이 바뀌었으면 don-auto.json도 고쳐라"라고 실패시킨다 — 검사가 조용히 무의미해지는 걸 막는 장치다.

**검사기가 안 보는 것 하나**: 금지 표현 검사는 `<script>` 태그 내용을 통째로 제외하고 돈다(코드 안의 우연한 일치를 막기 위해서다). 그래서 JSON-LD 안에 근거 없는 사실(주소, 영업시간, 평점 등)을 적어도 검사기는 잡지 못한다. JSON-LD를 고칠 땐 사람이 직접 확인해야 한다.

## 로컬에서 보기

```bash
npx --yes serve sites/don-auto -l 8080
```

## 견적 폼 켜기

`contact.html`의 견적 폼은 기본적으로 `<form action="mailto:DonsAutoUph@gmail.com" enctype="text/plain">`로 되어 있다. JavaScript가 꺼져 있으면 이 mailto 그대로 제출되고, 사용자의 메일 앱이 열린다 — 이게 no-JS 경로의 전부다.

`assets/js/main.js`의 `WEB3FORMS_KEY`가 **비어 있지 않을 때만** 스크립트가 폼의 `action`을 `https://api.web3forms.com/submit`로, `enctype`을 `multipart/form-data`로 바꾸고, 그 시점에 `access_key` / `subject` / `botcheck` 히든 인풋을 새로 만들어 붙인다. 키가 비어 있으면 이 코드는 아예 실행되지 않고 HTML의 mailto 기본값이 그대로 유지된다 — 그래서 no-JS 환경에서도 폼이 항상 동작한다.

사진 첨부를 받으려면 키를 넣는 게 낫다 (지금은 메일 앱이 열려도 사진은 사용자가 직접 첨부해야 한다).

1. [web3forms.com](https://web3forms.com)에서 이메일만 넣으면 무료 키가 나온다 (월 250건, 파일 첨부 지원).
2. `assets/js/main.js`의 `var WEB3FORMS_KEY = '';` 따옴표 사이에 붙여넣는다.

키가 있어도 요청이 실패하면 메일 앱 폴백으로 내려앉는다. 폼이 죽는 경우는 없다.

## 배포

이 폴더가 곧 미리보기 포털이 서빙하는 원본이다. 복사 단계가 없다.
커밋·푸시한 뒤 서버에서 받아 다시 빌드하면 반영된다 —
절차는 [docs/사이트-작업-절차.md](../../docs/사이트-작업-절차.md).

**Don에게 넘길 때** — Netlify·Cloudflare Pages·GitHub Pages 아무 데나 폴더째 드래그하면 된다.
`README.md`만 빼면 나머지는 그대로 올려도 된다.

## 알려진 제약

- **이미지 3종이 용량 예산을 초과한다.** `boat-seating-hero.webp`는 207KB(목표 200KB), `fabric-swatch-card.webp`는 73KB, `vinyl-swatch-card.webp`는 72KB(둘 다 목표 60KB). 의도적으로 그대로 뒀다 — 재인코딩하면 화질이 눈에 띄게 떨어져서다.
- **`srcset`이 없다.** 히어로 이미지는 화면 크기와 무관하게 항상 원본(1920×1080) 그대로 내려간다. 모바일에서도 풀사이즈를 받는다.
- **사진을 교체하려면 원본이 필요하다.** 이미지 파이프라인은 `scripts/build-images.mjs`로 옮겼고,
  매니페스트는 `scripts/site-images/don-auto.json`, 원본 JPEG는 `scripts/site-images/don-auto-raw/`에 둔다.
  원본은 커밋하지 않으므로 다른 PC에서는 다시 받아야 한다 (출처는 `assets/img/CREDITS.md`).

  ```bash
  npm run build-images don-auto
  ```

## Don에게 확인받아야 할 것

- **정확한 경력 연차** — 현행 사이트가 홈 "nearly 50", 서비스 "over 40"으로 엇갈린다. 보수적으로 "over 40"을 썼다.
- **물리 주소와 영업시간** — 현행 사이트에 없다. 받으면 JSON-LD에 `address` / `openingHoursSpecification` / `geo`를 넣어야 구글 로컬 결과에 뜬다.
- **실제 작업 사진** — 지금 사이트의 가장 큰 구멍. 받으면 `gallery.html`을 추가하고 스톡을 교체한다.
- **후기** — Google 비즈니스 프로필이 있는지, 있다면 인용해도 되는지.
- **가격** — 대표 항목 몇 개라도 공개하면 경쟁사 대비 차별화가 된다.
- **Web3Forms 키** — 견적 폼으로 사진을 받으려면 필요하다.
