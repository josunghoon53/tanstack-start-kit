# AGENTS.md

TanStack Start 기반의 **최소 어드민 셸 킷**입니다.

사이드바, 헤더, 다크모드, 공용 UI 패턴을 갖추고 폼(react-hook-form + zod)과 서버 데이터
왕복(React Query, 리스트 5개·대시보드·헤더 알림까지 전부 적용)까지는 붙어 있지만, 실제 DB와
외부 인증은 아직 의도적으로 비워뒀습니다.

> **설계 원칙**: 가볍게 시작해서 필요한 것만 그때그때 추가한다.
> 요청받지 않은 라이브러리(전역 클라이언트 상태 라이브러리, ORM 등)를 먼저 끌어오지 않는다.

---

## Stack

| 영역 | 사용 중 | 비고 |
|---|---|---|
| 프레임워크 | TanStack Start, TanStack Router | 파일 기반 라우팅 |
| UI | React 19, Vite 8 | |
| 스타일 | Tailwind CSS v4, shadcn/ui, Radix (`radix-ui`) | CSS-first `@theme` |
| 토스트 | `sonner` | |
| 아이콘 | `lucide-react` | |
| 클래스 유틸 | `cn` (npm 패키지) | `src/lib/utils.ts`에서 재노출, 자체 구현 아님 |
| 폼 | `react-hook-form`, `zod`, `@hookform/resolvers` | shadcn `form.tsx` 포함 |
| 서버 상태 | `@tanstack/react-query` | 리스트 5개 + 대시보드 + 헤더 알림까지 전부 적용됨 |
| 전역 클라이언트 상태 / ORM / DB | 없음 | 전역 상태는 로컬 `useState`로 충분, ORM/DB는 아직 없음 |

---

## Commands

```bash
pnpm dev                                  # 개발 서버 (:3000)
pnpm build && pnpm preview                # 프로덕션 빌드 확인
pnpm lint                                 # eslint (@tanstack/eslint-config)
pnpm format                               # prettier --write . && eslint --fix
pnpm check                                # prettier --check .
pnpm dlx shadcn@latest add <component>    # shadcn 컴포넌트 추가
```

테스트 러너 없음 (vitest / playwright 미설치).
테스트 추가를 요청받으면 먼저 어떤 러너를 쓸지 확인할 것.

---

## 라우팅 — `src/routes`

- 파일 기반 라우팅. 새 페이지는 `src/routes/<name>.tsx`에 `createFileRoute`로 추가.
- `routeTree.gen.ts`는 자동 생성 파일 — 직접 손대지 말 것.
- `__root.tsx`가 전체 레이아웃(사이드바 + 헤더)을 정의하고, `beforeLoad`에서
  `getCurrentUserFn()`으로 인증 가드를 건다. `login.tsx`만 이 셸 밖에서 렌더링됨.

> **주의**: `src/config/nav.ts`의 사이드바 메뉴는 실제 라우트보다 항목이 많다.
> (예: `/users/admins`는 메뉴에만 있고 라우트 파일이 없음 → `not-found.tsx`로 떨어짐)
>
> - nav.ts에 항목을 추가할 때 → 대응하는 라우트 파일도 같이 만들 것
> - 새 라우트를 추가할 때 → nav.ts에도 등록할 것
>
> 둘이 어긋나면 죽은 링크가 생긴다.

---

## 인증 — 데모 구현, 프로덕션 전 필수 교체

| 파일 | 현재 상태 | 할 일 |
|---|---|---|
| `src/server/session.ts` | `SESSION_PASSWORD`가 **소스에 하드코딩된 평문 시크릿** | 배포 전 env var로 교체 + 로테이션 |
| `src/config/auth.ts` | `DEMO_ACCOUNT` 이메일/비밀번호 평문 비교 | 이 파일을 지우고 교체 |
| `src/server/auth.ts` | `loginFn`이 위 데모 계정과 비교만 함 | 이 검증 로직을 DB/외부 인증 서비스 호출로 교체 |

- 세션은 TanStack Start 내장 `useSession`(암호화 쿠키) 기반. Clerk / better-auth 등 외부 라이브러리 없음.
- 역할(RBAC)·권한 개념 없음. 사이드바에 "역할 관리" 메뉴가 있어도 실제 로직은 없다.
- 새로 짜는 코드에 시크릿을 하드코딩하지 말 것.
- 인증 관심사는 위 세 파일 밖으로 흩뿌리지 말 것.

---

## 데이터

실제 DB는 아직 없지만, `orders`/`users`/`contents`/`products`/`payments`(리스트 5개) +
대시보드(`index.tsx`, `orders`/`notifications` 재사용) + 헤더 알림(`notifications-menu.tsx`)
전부 **실제 서버 함수 왕복 + React Query**로 붙어 있다(클라이언트 → `createServerFn` → 서버,
진짜 네트워크 호출). 서버 데이터가 필요한 새 페이지를 요청받으면, 아래 패턴을 그대로
복제해서 적용할 것.

**라우트에 걸리지 않는 전역 컴포넌트(헤더 알림 등)는 root 라우트의 `loader`에서 prefetch한다.**
`notifications`는 특정 라우트 하나가 아니라 모든 페이지의 헤더에 떠 있어서, 개별 라우트
loader가 아니라 `src/routes/__root.tsx`의 `loader`에서 `ensureQueryData(notificationsQueryOptions())`를
호출해 둔다. 그래야 어느 페이지로 처음 들어와도 헤더의 `NotificationsMenu`(`useSuspenseQuery`
사용)가 데이터 없이 suspend하지 않는다.

**아이콘처럼 직렬화 안 되는 값은 데이터에 직접 넣지 않는다.** `notifications`처럼 항목마다
아이콘이 다른 경우, 서버 함수가 반환하는 데이터에 컴포넌트/함수를 담으면 안 된다(함수는
JSON으로 직렬화가 안 돼서 서버→클라이언트 전송 중 깨진다). `src/config/notifications.ts`처럼
데이터에는 `iconKey` 같은 문자열만 담고, `NOTIFICATION_ICONS: Record<Key, ComponentType>` 같은
매핑은 별도로 export해서 렌더링할 때만 클라이언트 쪽에서 조합한다.

**패턴 (`src/config/orders.ts` + `src/server/orders.ts` + `src/routes/orders.tsx` 참고)**

0. 데이터(배열 상수 + 타입 + 상태 톤 매핑 등)는 라우트 파일이 아니라 `src/config/<domain>.ts`에
   둔다. 라우트/서버 파일은 그 config를 import해서만 쓴다.

1. `src/server/<domain>.ts`에 `createServerFn`으로 데이터를 반환하는 핸들러를 만든다.
   지금은 핸들러 내부가 `config/*.ts`의 인메모리 배열을 그대로 반환하지만, 나중에 실제 DB를
   붙일 때는 **이 핸들러 내부만** 실제 쿼리로 바꾸면 되고 라우트/컴포넌트는 그대로 둘 수 있다.
   읽기 전용이라도 인증이 필요한 데이터면 `authMiddleware`를 붙인다.
2. 같은 파일에 `queryOptions({ queryKey, queryFn: () => xxxFn() })`를 export한다.
3. 라우트의 `loader`에서 `context.queryClient.ensureQueryData(xxxQueryOptions())`로 prefetch하고,
   컴포넌트에서는 `useSuspenseQuery(xxxQueryOptions())`로 읽는다. SSR에서 dehydrate된 데이터가
   `src/router.tsx`의 `setupRouterSsrQueryIntegration`을 통해 클라이언트로 자동 전달되므로
   별도로 loader 데이터를 `initialData`에 수동으로 넘길 필요는 없다.

> **주의**: 서버-쿼리 통합 패키지는 `@tanstack/react-router-ssr-query`
> (+ `@tanstack/react-router` ≥1.170.33 필요)만 쓴다. 예전에 같은 역할을 하던
> `@tanstack/react-router-with-query`는 **deprecated**이고, 스트림이 끝날 때
> `hydrate(queryClient, undefined)`를 호출하는 버그가 있어 콘솔에
> `Cannot read properties of undefined (reading 'mutations')` 에러가 무한 누적된다
> (최신 1.130.17에서도 재현 확인). 절대 `@tanstack/react-router-with-query`로 되돌리지 말 것.

전역 클라이언트 상태 라이브러리는 아직 도입하지 않는다 — 이 킷에서 "전역 상태"로 보이는
대부분은 서버 데이터이고, 그건 React Query의 몫이다. 모달 열림 여부 같은 순수 UI 상태는
지금처럼 컴포넌트 로컬 `useState`로 충분하다.

> **정말 여러 컴포넌트가 공유하는 순수 클라이언트 상태**가 필요해지면 **Zustand**를 쓴다.
> Redux나 Jotai는 도입하지 말 것 — Zustand는 Provider 없이 `create()`로 만든 스토어를
> React 트리 밖(서버 함수, 유틸 함수 등)에서도 `store.getState()`로 바로 읽고 쓸 수 있어서,
> 이 킷 구조와 궁합이 좋다. Jotai는 atom을 여러 개로 쪼개는 모델이라 소규모 어드민 UI에서는
> 이점보다 관리 비용(atom 간 조율, 전체 상태 스냅샷 어려움, 영속화를 atom별로 따로 설정)이
> 더 크다.
>
> **Zustand를 쓸 때 반드시 selector로 구독할 것**:
> ```ts
> const count = useStore((s) => s.count)   // OK: count가 바뀔 때만 리렌더
> const state = useStore()                 // 금지: 스토어 아무 값이나 바뀌어도 리렌더됨
> ```
> selector 없이 훅을 호출하면 스토어 전체를 구독하게 되어 불필요한 리렌더가 생긴다. 여러
> 필드를 한 번에 꺼낼 때(`(s) => ({ a: s.a, b: s.b })`)는 매번 새 객체가 생겨 얕은 비교로도
> 항상 "다름"으로 판정되니, `useShallow`(zustand/react/shallow) 같은 얕은 비교 유틸을 같이 쓸 것.

---

## 폼 & 유효성 검사

`react-hook-form` + `zod`(`@hookform/resolvers/zod`) 사용. shadcn `form` 컴포넌트가
`src/components/ui/form.tsx`에 있음 (`Form`, `FormField`, `FormItem`, `FormLabel`,
`FormControl`, `FormMessage`).

- 스키마는 각 라우트/섹션 파일 안에 `z.object({...})`로 선언 (예: `src/routes/login.tsx`의
  `loginSchema`, `src/routes/settings.tsx`의 `generalSchema` / `securitySchema`)
- 필드 구조가 shadcn 기본 레이아웃과 맞으면 `Form` + `FormField` 조합을 그대로 쓴다
  (`login.tsx` 참고).
- `SettingRow`처럼 라벨/설명이 양옆에 배치되는 커스텀 레이아웃에서는 `Form`/`FormItem`을
  강제로 끼워 맞추지 말고, `register()` / `Controller`만 가져와 기존 레이아웃 컴포넌트에
  연결한다 (`settings.tsx`의 `GeneralSection` / `SecuritySection` 참고). `Switch`처럼
  `onChange` 이벤트가 아닌 커스텀 핸들러를 쓰는 컴포넌트는 `Controller`로 감쌀 것.
- `handleSubmit(onValid, onInvalid)`을 쓸 때 `onInvalid`는 **인자로 받은 `errors`를 사용**할
  것 — 클로저로 캡처한 `formState.errors`는 제출 시점 이전 렌더의 값이라 갱신되지 않는다.
- 결과 피드백은 `sonner` 토스트(`toast.success` / `toast.error`)로, 기존 패턴과 동일하게 유지.

---

## 반복되는 UI 패턴 — 새로 만들기 전에 재사용할 것

**검색 / 페이지네이션**
`src/hooks/use-paginated-search.ts` + `table-search-input.tsx` + `table-pagination.tsx`
orders / users / contents에서 재사용 중. 완전 클라이언트 사이드, URL 쿼리 동기화 없음.

**행(row) 액션 모달**
`src/components/row-actions.tsx`
수정은 `Dialog`, 삭제 확인은 `AlertDialog`로 한 컴포넌트 안에서 구성하는 게 표준 패턴.

**토스트**
`sonner`. `Toaster`는 `__root.tsx`에 전역 1회 마운트.
`toast.success` / `toast.error`만 사용.

**테마**
라이트 / 다크 / 자동 (`ThemeToggle.tsx`) + 6종 색상 프리셋 (`color-theme-picker.tsx`).
`localStorage` + `<html>`의 `data-theme` / `data-color` 속성으로 관리하고,
`__root.tsx`의 인라인 스크립트로 FOUC를 방지한다.
새 색상 프리셋은 `src/styles.css`에 `:root[data-color="..."]` 블록을 추가하고 피커에 옵션을 추가할 것.

---

## 레이아웃 — 데스크톱 전용, 모바일 반응형 없음

이 킷은 모바일 브레이크포인트를 지원하지 않는다. `sm:`/`md:`/`lg:` 같은 반응형 prefix로
레이아웃을 분기하지 말 것 — 화면이 좁아지면 레이아웃이 줄어드는 게 아니라 **콘텐츠 영역에만
스크롤이 생긴다.**

- 뷰포트는 `src/routes/__root.tsx`의 `<meta name="viewport" content="width=1280, ...">`로
  고정돼 있다. `width=device-width`로 되돌리지 말 것 — 되돌리면 모바일 기기에서 실제 화면
  너비 기준으로 미디어 쿼리가 다시 활성화되어 레이아웃이 깨진다.
- 사이드바(`AppSidebar`)와 헤더(`SiteHeader`)는 항상 고정이다. `src/components/ui/sidebar.tsx`의
  `isMobile`도 `false`로 하드코딩되어 있고(모바일 오프캔버스 Sheet 안 씀), `use-mobile.ts` 훅은
  이 결정 때문에 삭제했다 — 다시 만들지 말 것.
- **푸터(`SiteFooter`)는 고정이 아니라 콘텐츠 스크롤 흐름의 일부다** — 페이지를 처음 열면
  화면 밖에 있고, 아래로 스크롤해야 보인다(일반 웹사이트 푸터처럼). `__root.tsx`에서
  `{children}`을 감싼 콘텐츠 div에 `min-h-full`을 줘서, 콘텐츠가 짧아도 스크롤 컨테이너의
  가시 영역만큼은 항상 채우게 만들고, `SiteFooter`는 그 바로 다음 형제로 둬서 그 아래로
  밀려나게 한다. 이 `min-h-full`을 지우면 콘텐츠가 짧을 때 푸터가 스크롤 없이 바로 보여버린다
  — 지우지 말 것. (참고: 시행착오 과정에서 "헤더/사이드바처럼 푸터도 항상 화면에 고정"과
  "콘텐츠 바로 아래 자연스럽게 붙임" 둘 다 시도했지만 둘 다 어색하다는 피드백을 받았다.
  지금 방식이 최종 결정이다.)
- 가로 스크롤은 **`__root.tsx`의 콘텐츠 래퍼(`min-w-5xl`)에만** 있다. `body`나
  `SidebarProvider`/`SidebarInset` 같은 상위 레이아웃 요소에 `overflow-x-auto`나 `min-width`를
  직접 걸지 말 것 — 그러면 사이드바/헤더까지 같이 옆으로 밀려서 스크롤하면 화면 밖으로
  사라진다(실제로 한 번 겪은 버그).
- 새 페이지의 최상위 컨테이너는 이 최소 너비(1024px, `min-w-5xl`) 안에서 자연스럽게 보이도록
  짤 것. `grid-cols-4`처럼 고정 컬럼 수를 그냥 써도 된다 — 반응형으로 줄어들 필요가 없다.
- 푸터(`src/components/site-footer.tsx`)는 얇은 바가 아니라 **일반 웹사이트형 풀 푸터**다:
  브랜드/설명/소셜 아이콘 + 링크 컬럼 3개(`src/config/footer.ts`의 `FOOTER_COLUMNS`,
  `FOOTER_SOCIAL_LINKS`) + 구분선 + 저작권/버전 바(`src/config/site.ts`의
  `APP_NAME`/`APP_VERSION`, `package.json`의 `version`과 같이 맞춰서 올릴 것). 링크 컬럼
  내용은 실제 서비스로 바꿀 때 `footer.ts`의 label/href만 고치면 된다.
- 링크가 내부 라우트(`/`로 시작)면 `FooterLinkItem`이 TanStack Router `Link`로,
  외부 링크(`#`, `mailto:` 등)면 일반 `<a>`로 자동 분기한다. 새 링크를 추가할 때 이 구분을
  건드릴 필요는 없다 — `href`만 올바르게 넣으면 된다.
- 소셜 아이콘: lucide-react엔 GitHub/X(Twitter) 브랜드 아이콘이 없어서 `FolderGit2`(GitHub),
  `AtSign`(X) 같은 일반 아이콘으로 대체했다. 실제 브랜드 아이콘이 필요하면 `simple-icons`
  같은 별도 패키지를 추가로 고려할 것 — 지금은 lucide 하나로 통일하는 쪽을 택했다.
- dev 모드에서는 우측 하단 TanStack Devtools 플로팅 버튼이 화면 일부를 가릴 수 있는데,
  프로덕션 빌드에는 devtools가 빠지므로 실제 문제는 아니다.

---

## 코드 스타일

- TypeScript `strict` + `noUnusedLocals` / `noUnusedParameters` 활성화
- path alias: `@/*` → `./src/*`
- ESLint는 `@tanstack/eslint-config` 기반. `import/order`, `sort-imports` 등 일부 규칙은 꺼져 있음 — 임의로 켜지 말 것
- `src/components/ui/*`(shadcn 컴포넌트)는 가급적 CLI로 생성된 형태를 유지
- 커스텀 컴포넌트는 `src/components/*.tsx`에 named export로 작성
  (`ThemeToggle.tsx`만 예외적으로 default export — 새 컴포넌트는 named export 관례를 따를 것)
