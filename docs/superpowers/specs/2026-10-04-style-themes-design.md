# 스타일 테마 시스템 + 디자인 리프레시 설계

> **갱신됨(2026-10-05):** 색상 프리셋이 전체 팔레트를 옮기던 부분과 스타일 4종(Graphite/Warm/Editorial/Nordic)은 [2026-10-05-style-color-split.md](../plans/2026-10-05-style-color-split.md)로 대체됐다.

## 배경

킷의 UI가 옛스럽다는 피드백이 있었다. 원인은 (1) 파란 원/점 일러스트 배경과 격자, (2) 사이드바와 메인이
같은 계열이라 영역 구분이 약함, (3) 얇고 위계가 약한 타이포, (4) 채도 높은 원색 포인트, (5) 정보 밀도가 낮은
카드 격자다. 시안을 여러 번 비교하며 방향을 정했고, 이 문서는 그 결과를 킷에 적용하는 설계다.

기준 시안: [`assets/style-themes-preview.html`](./assets/style-themes-preview.html) — 브라우저로 열면 스타일 4종과
색상 프리셋 5종을 전환해 볼 수 있다. **색 값, 굵기, 반경은 이 파일이 기준**이고 이 문서는 구조와 결정만 적는다.

## 결정 사항

- **라이트 전용.** 기존 라이트/다크/자동 토글과 `.dark` 팔레트는 제거한다.
- **스타일 테마 4종 선택형:** Graphite(기본), Warm Paper, Editorial, Nordic. 레이아웃은 하나로 통일하고
  색, 폰트, 굵기, 모서리 둥글기, 그림자만 바뀐다.
- **색상 프리셋은 전체 색 조합을 이동시킨다.** 포인트색만 덮어쓰지 않고, 배경/카드/테두리/사이드바/포인트가
  같은 색상 각도(`--h`)를 따라간다.
- **매트한 톤.** 포인트색 채도는 0.09~0.10 수준, 의미 색(성공/경고/위험)도 낮은 채도.
- **사이드바는 메인과 대비되는 어두운 색.** 활성 메뉴는 포인트색으로 채우고, 비활성 글씨는 충분히 밝게.
- **폰트는 `@fontsource`로 번들링.** 외부 CDN 의존 제거.

## 구조

### 속성

`<html>`에 두 속성을 둔다. (`data-theme`는 기존 라이트/다크용이었으므로 쓰지 않는다. 다크 제거 후 `data-theme`
참조는 모두 지운다.)

| 속성 | 값 | 저장 키(localStorage) |
|---|---|---|
| `data-style` | `graphite`(기본) / `warm` / `editorial` / `nordic` | `theme-style` |
| `data-color` | 없음(스타일 기본색) / `blue` / `green` / `purple` / `rose` / `orange` | `theme-color` |

기존 `slate` 프리셋은 무채색이라 새 구조(색상 각도 이동)와 맞지 않아 제거한다. 기존에 `theme-color`에 `slate`가
저장된 사용자는 기본색으로 폴백한다.

### 토큰 (`src/styles.css`)

스타일 블록이 shadcn 토큰을 `oklch(L C var(--h))`로 정의한다. 프리셋은 `--h`만 덮어쓴다(Editorial은 무채색이
기본이라 프리셋 선택 시 `--nk`, `--ak`도 켠다).

| shadcn 토큰 | 시안 변수 |
|---|---|
| `--background` | `--bg` |
| `--card`, `--popover` | `--panel` |
| `--foreground`, `--card-foreground` | `--text` |
| `--muted-foreground` | `--mute` |
| `--secondary`, `--muted`, `--accent` | `--sel` |
| `--border` | `--line` |
| `--input` | `--line2` |
| `--primary`, `--ring` | `--acc` |
| `--sidebar` | `--sbg` |
| `--sidebar-foreground` | `--smu` (비활성 글씨) |
| `--sidebar-primary` / `-foreground` | `--ssel` / `--sseltx` (활성 메뉴 채움/글씨) |
| `--sidebar-accent` / `--sidebar-border` | `--sln` |

추가 토큰: `--success`, `--warning`(시안의 `--ok`, `--warn`), `--font-title`(+ `--font-body`, `--weight-body`, `--weight-title`), `--shadow-card`, `--radius`(스타일별).

### 제거 대상

- `.dark` 팔레트 전체, `@custom-variant dark`, `ThemeToggle`(+테스트), 헤더/사이드바의 토글 노출부
- `.bg-grid-fade`와 `public/backgrounds/*.webp`, 이를 쓰는 레이아웃 클래스
- `THEME_INIT_SCRIPT`의 다크 해석 로직

### 타이포

- 기본 크기 14px. 제목/KPI 숫자/카드 제목은 스타일별 굵기 변수로 관리한다. 시안 기준 Graphite·Nordic은
  본문 400, 제목 600이고 Warm Paper·Editorial은 한 단계 더 굵다.
- 폰트: Graphite = IBM Plex Sans KR, Warm Paper = Gowun Dodum(본문)+Gowun Batang(제목),
  Editorial = Nanum Myeongjo, Nordic = Noto Sans KR. 모두 `@fontsource` 패키지로 설치한다.

### UI

- 설정 > 테마 탭: 기존 색상 선택 위에 **스타일 선택**(미리보기 카드 4개)을 추가한다. 선택 즉시 적용되고
  `localStorage`에 저장된다. 스타일/색상 이름은 i18n(ko/en)에 추가한다.
- `THEME_INIT_SCRIPT`가 `theme-style`과 `theme-color`를 복원해 첫 화면 깜빡임을 막는다.
- 사이드바(`app-sidebar`), 대시보드(`routes/index.tsx`)를 시안 구성(KPI 스트립+스파크라인, 촘촘한 표, 알림 목록,
  주간 막대)에 맞춘다. 데이터 소스와 서버 함수는 건드리지 않는다.

## 범위 밖

- 다크 모드, 모바일 반응형(킷은 원래 데스크톱 전용)
- 리스트 페이지(주문/사용자 등)의 구조 변경. 토큰이 바뀌므로 자동으로 새 색을 따라가는 것까지만 확인한다.
- 시안의 Terminal 테마(보류)

## 검증

- 새 테스트: 스타일 선택 컴포넌트(선택 시 `data-style` 적용/저장, 잘못된 저장값 폴백), 초기화 스크립트의 복원/폴백.
- 기존 테스트 중 다크/`ThemeToggle`/`data-theme`를 가정하는 것은 함께 정리한다.
- `pnpm test`, `pnpm build` 통과. 기존에 환경 로케일 때문에 실패하던 `table-date-range-filter` 2건은 이번 범위가 아니다.
- 실제 화면을 브라우저로 열어 4개 스타일 × 프리셋 몇 가지를 확인한다.

## JSH-OS 반영

킷에서 완료한 뒤 같은 변경을 `jsh-os`에 패치로 가져온다. JSH-OS 고유 변경(브랜드명, 탭 제목 `Admin` → `JSH-OS`)은
그쪽에서 별도로 처리한다.
