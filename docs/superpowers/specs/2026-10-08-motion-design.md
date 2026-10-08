# 모션 설계 — `motion`으로 UI 애니메이션 통일

> 규칙 요약은 `AGENTS.md`의 "애니메이션 — motion" 섹션, 토큰·변형·Provider는 `src/lib/motion.tsx`가 단일 출처다.

## 결정 사항

- 애니메이션 라이브러리는 **`motion`**(npm `motion`, `motion/react`, framer-motion의 후속) 하나로 통일한다. 설치 버전 14.0.0
  (2026-10-02 배포, 저장소의 `minimumReleaseAge` 기본값(1일)을 넘겨 예외 등록 없이 설치됨). 의존성은 `motion` → `framer-motion`,
  `motion-dom`, `motion-utils`, `tslib`(기존)뿐이다.
- **번들 규율**: `LazyMotion features={domAnimation} strict` + `m` 컴포넌트만 쓴다. `layout`/`layoutId`가 필요한 화면(테마 선택기, 리스트 테이블)만
  `domMax`를 `loadLayoutFeatures()`(동적 import, 별도 청크)로 받는다.
- **톤**: 차분하고 짧게. 상호작용 150ms, 기본 250ms, 진입 450ms 이하, 이징은 `cubic-bezier(0.22, 1, 0.36, 1)`(ease-out),
  스프링은 감쇠비 약 0.95의 작은 것 하나(선택 표시 이동)만 쓴다. 튀는 오버슈트는 쓰지 않는다.
- `MotionConfig reducedMotion="user"`로 OS "동작 줄이기"를 따른다. transform이 아닌 애니메이션(카운트업, 스파크라인 pathLength, 리스트 행 opacity)은
  `useReducedMotion()`으로 직접 즉시 처리한다.

## 영감 — 대시보드 애니메이션 릴

참고한 인스타그램 릴은 어드민 대시보드가 열릴 때 카드가 위에서부터 차례로 살짝 떠오르고, KPI 숫자가 0부터 빠르게 올라가 최종 값에서 멈추고,
막대 차트가 바닥에서 차례로 자라고, 모달은 뒤 배경을 흐리게 만들며 열리고, 강조색을 바꾸면 화면 전체가 순간 전환이 아니라 부드럽게 다시 물드는
흐름이었다. 이 킷에는 그 중 "정보를 읽는 데 방해되지 않는 것"만 가져왔다 — 길이는 모두 1초 안쪽, 오버슈트 없음.

## 무엇이 어떻게 움직이나

| 대상                               | 동작                                                                                       | 값                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| 대시보드 진입 (`routes/index.tsx`) | KPI 칸 4개 → 최근 주문 → 최근 알림 → 주간 매출 순 `fadeUp`(y 12→0, opacity 0→1)            | 각 300ms, 60ms 간격, 마지막 카드 시작 360ms·끝 약 660ms |
| KPI 숫자 (`AnimatedNumber`)        | 포맷 문자열의 숫자 부분만 0→값(접두/접미사·쉼표·소수 자릿수 유지), 끝은 원래 문자열 그대로 | 800ms ease-out, 칸 순서만큼 지연                        |
| 스파크라인                         | `pathLength` 0→1로 그려짐                                                                  | 600ms, 칸 지연 + 100ms                                  |
| 주간 막대 (`WeeklyBars`)           | `scaleY` 0→1, 바닥 기준                                                                    | 450ms, 막대마다 30ms, 카드 지연 + 50ms                  |
| 페이지 전환 (`PageTransition`)     | 진입만: opacity 0→1, y 8→0                                                                 | 220ms                                                   |
| 선택 표시 (색·스타일 선택기)       | `layoutId` 공유 테두리가 카드 사이를 이동, 체크 배지는 `scaleIn`                           | 스프링(stiffness 500, damping 38), 배지 150ms           |
| 테마 재착색                        | CSS `transition`(background-color/color/border-color/fill/stroke)                          | 250ms, 바꿀 때만 300ms 동안 켬                          |
| 다이얼로그/시트                    | Radix CSS 애니메이션 유지 + 오버레이 `backdrop-filter: blur(2px)`                          | 250ms(시트 열림 350ms), ease-out                        |
| 리스트 행                          | 남는 행 `layout="position"` 이동, 새 행 페이드인, 빠지는 행 페이드아웃                     | 이동 250ms, 페이드 150ms                                |

## SSR·하이드레이션

- 서버와 하이드레이션 첫 렌더는 같은 결과여야 한다. 클라이언트 전용 값(`useReducedMotion()` 등)으로 `initial`이나 글자를 분기하지 않고 `transition`만 바꾼다.
- 페이지 전환은 `useHasMounted()`로 첫 렌더에 `initial={false}` — SSR 페이지가 깜빡이지 않는다.
- 대시보드 진입은 첫 화면이 목적이라 SSR도 `initial`(투명) 상태로 나가고 하이드레이션 후 재생된다. JS가 늦으면 그동안 카드가 비어 보이는 것이 대가다.
- `AnimatedNumber`는 SSR에서 최종 문자열을 내보내고 브라우저에서 페인트 전에(`useLayoutEffect`) 0으로 되돌려 센다. StrictMode의 이중 실행에서도 다시 센다.

## 의도적인 예외

- **다이얼로그/시트/알림 다이얼로그는 motion이 아니라 CSS다.** Radix가 이미 `data-[state]`로 열림/닫힘을 애니메이션하고 언마운트 시점을 관리한다.
  motion으로 다시 만들려면 `forceMount` + `AnimatePresence`로 Radix 수명 주기를 가로채야 해서 포커스 트랩·스크롤 잠금과 엇갈릴 위험이 크다.
  `styles.css`에서 오버레이 블러와 길이·이징만 토큰에 맞추고, `prefers-reduced-motion: reduce`에서는 1ms로 줄인다. `ui/*` 파일은 손대지 않았다.
- **테마 재착색도 CSS다.** 색 토큰은 CSS 변수라 motion으로 보간할 대상이 아니고, 필요한 요소만 골라 `transition`을 잠깐 켜는 편이 싸다.
- **페이지 전환은 진입 전용이다.** `Outlet`을 `AnimatePresence`로 감싸 퇴장을 넣으면, 나가는 라우트가 이미 바뀐 라우터 상태로 다시 렌더링돼
  내용이 바뀌거나 멈춘 화면이 남는 문제가 알려져 있다. 대기 화면(`defaultPendingComponent`)을 거친 전환도 애니메이션하지 않는다.

## 리스트 행 재배치

- 공용 `AnimatedTableBody`(`layoutKey` = 보이는 행 id를 순서대로 이은 문자열) + `AnimatedTableRow`(`TableRow` 대체)를 주문·사용자·상품·결제·콘텐츠
  5개 리스트에 적용했다. 행은 여전히 `<tr>`이라 테이블 시맨틱·체크박스·일괄 작업·CSV·행 액션 모달은 그대로다.
- `AnimatePresence mode="sync"`: `popLayout`은 빠지는 행을 `position: absolute`로 빼는데 `<tr>`에서는 칸 너비가 무너져서 쓰지 않는다.
- **아코디언 보정**: 모든 행의 `layoutDependency`를 `layoutKey`로 묶었다. 행을 펼치면(`TableRowDetail` 추가) 목록은 그대로라 아래 행이 움직이지 않고
  즉시 밀린다. 이게 없으면 아래 행들이 이전 위치에서 미끄러져 내려오며 펼친 상세 위에 잠깐 겹친다. 같은 이유로 위치 측정은 목록이 바뀔 때만 일어나
  타이핑 중 비용도 행 10개 측정 수준이다(브라우저에서 long task 없음).
- `initial={false}`라 페이지를 처음 열 때는 행이 페이드인하지 않는다(페이지 전환이 이미 있다).

## 테스트

- `src/test/setup.ts`에서 `MotionGlobalConfig.skipAnimations = true`. 애니메이션은 즉시 끝나고 최종 상태만 검증한다.
- `animated-number.test.tsx`(파싱/포맷, 건너뛰기·동작 줄이기, 실제 카운트업이 최종 문자열로 끝나는지), `page-transition.test.tsx`(자식 렌더, 경로별 key),
  `animated-table-row.test.tsx`(시맨틱·클릭, 재정렬·추가·삭제).

## 보류

- **필터 시 카드 재배치(`layout`)**: 대시보드/분석 카드가 필터로 다시 배치되는 화면이 아직 없다. 생기면 `layoutDependency`로 측정 시점을 묶는 리스트 행 방식을 따른다.
- **칸반 드래그**: `drag`는 `domMax`가 필요하고 키보드 접근성(드래그 대체 조작)을 같이 설계해야 해서 칸반 화면이 생길 때 다룬다.
- **퇴장 전환**: 라우트 퇴장과 리스트 외 요소의 퇴장은 위의 frozen-route 문제와 포커스 이동 문제 때문에 넣지 않았다.
