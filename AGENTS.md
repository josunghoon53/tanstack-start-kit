# AGENTS.md

TanStack Start 기반의 **최소 어드민 셸 킷**입니다.

사이드바, 헤더, 스타일 테마, 다국어(ko/en), 공용 UI 패턴을 갖추고 폼(react-hook-form + zod)과
서버 데이터 왕복(React Query, 리스트 5개·대시보드·헤더 알림까지 전부 적용)까지는 붙어 있지만,
실제 DB와 외부 인증은 아직 의도적으로 비워뒀습니다.

> **설계 원칙**: 가볍게 시작해서 필요한 것만 그때그때 추가한다.
> 요청받지 않은 라이브러리(ORM 등)를 먼저 끌어오지 않는다. 전역 클라이언트 상태 라이브러리도
> 로케일처럼 정말 여러 컴포넌트가 공유해야 하는 상태가 생기기 전까지는 끌어오지 않는다 —
> 지금 쓰는 Zustand도 그 기준을 넘겨서(다국어 전환) 들어온 것이다.

---

## Stack

| 영역 | 사용 중 | 비고 |
|---|---|---|
| 프레임워크 | TanStack Start, TanStack Router | 파일 기반 라우팅 |
| UI | React 19, Vite 8 | |
| 스타일 | Tailwind CSS v4, shadcn/ui, Radix (`radix-ui`) | CSS-first `@theme` |
| 토스트 | `sonner` | |
| 아이콘 | `lucide-react` | |
| 애니메이션 | `motion` (`motion/react`) | `LazyMotion` + `m`만 사용, 규칙은 `src/lib/motion.tsx` — 아래 "애니메이션 — motion" 섹션 참고 |
| 클래스 유틸 | `cn` (npm 패키지) | `src/lib/utils.ts`에서 재노출, 자체 구현 아님 |
| 폼 | `react-hook-form`, `zod`, `@hookform/resolvers` | shadcn `form.tsx` 포함 |
| 서버 상태 | `@tanstack/react-query` | 리스트 5개 + 대시보드 + 헤더 알림까지 전부 적용됨 |
| 전역 클라이언트 상태 | `zustand` | 로케일(`ko`/`en`) 하나만 이걸로 관리 — 그 외 UI 상태는 로컬 `useState`로 충분 |
| 다국어 | 자체 딕셔너리(`src/i18n/`) | `ko`/`en` 지원, 사이드바 언어 토글로 전환 |
| LLM 연동 | `llm-runner` | Claude/Codex 구독 세션·API 키를 같은 인터페이스로 호출. `/llm-runner` 플레이그라운드와 설정 > "AI 연동" 탭에서 사용 — 아래 "AI 연동" 섹션 참고 |
| ORM / DB | 없음 | 아직 없음 |

---

## Commands

```bash
pnpm dev                                  # 개발 서버 (:3000)
pnpm build && pnpm preview                # 프로덕션 빌드 확인
pnpm lint                                 # eslint (@tanstack/eslint-config)
pnpm format                               # prettier --write . && eslint --fix
pnpm check                                # prettier --check .
pnpm test                                 # vitest run (유닛/컴포넌트 테스트, 1회 실행)
pnpm test:watch                           # vitest (watch 모드)
pnpm dlx shadcn@latest add <component>    # shadcn 컴포넌트 추가
```

**테스트**: `vitest` + `@testing-library/react`(유닛/컴포넌트)로 기존 기능 전체(훅, 순수
컴포넌트, 라우터/사이드바 의존 컴포넌트, 5개 리스트 페이지 + 대시보드 + 로그인/설정 페이지,
config 데이터 정합성, LLM 러너 페이지·사용량 패널)를 커버해뒀다 — 61개 테스트 파일, 451개 테스트. `vitest.config.ts`는
`vite.config.ts`와 별도 파일이다 — `tanstackStart()`/`devtools()` 플러그인은 개발 서버/빌드
전용이라 테스트에는 불필요하다. 테스트 파일은 `*.test.ts`/`*.test.tsx`로 테스트 대상 옆에 둔다
(예: `src/i18n/messages.test.ts`).

- **테스트 하네스** (`src/test/`): `render.tsx`가 `renderWithQueryClient(ui)`(React Query만
  필요한 컴포넌트용)와 `renderWithRouter(ui, { initialPath?, extraPaths? })`(`<Link>`/
  `useRouterState`/`useRouter`가 필요한 컴포넌트용 — 실제 앱의 `routeTree.gen.ts`가 아니라
  인증·로더 없는 최소 라우터를 새로 구성한다)를 제공한다. `query-client.ts`는 재시도/캐시를
  끈 테스트 전용 `QueryClient`를 만든다.
- **서버 함수는 항상 목(mock)한다**: `createServerFn`으로 만든 함수(`loginFn`, `logoutFn`,
  `get*Fn` 등)는 내부적으로 `useSession()`(`@tanstack/react-start/server`)을 통해 실제 요청
  컨텍스트를 요구해서, vitest 안에서 그대로 호출하면 던진다. 서버 데이터를 쓰는 컴포넌트를
  테스트할 때는 반드시 `vi.mock('@/server/<domain>', () => ({ xxxQueryOptions: () => ({...}) }))`
  처럼 해당 서버 모듈 전체를 목하고 시작할 것 — `src/routes/orders.test.tsx` 등 참고.
- **Sidebar 컨텍스트**: `SidebarMenuButton`/`SidebarTrigger` 등은 `<SidebarProvider>`
  (`@/components/ui/sidebar`) 밖에서 렌더링하면 "useSidebar must be used within a
  SidebarProvider" 에러를 던진다. 사이드바 관련 컴포넌트를 테스트할 때 빠뜨리지 말 것.
- **로케일은 전역 싱글톤**: `useLocaleStore`는 테스트 파일 간에도 공유되는 모듈 스코프
  상태다. 한국어 문자열을 검증하는 테스트는 `beforeEach`에서
  `useLocaleStore.setState({ locale: 'ko' })`로 리셋해둘 것.
- 이 킷은 실제 DB·외부 인증이 없는 데모 상태라, `server/*.ts`(createServerFn 핸들러 자체)와
  세션/미들웨어는 단위 테스트 범위 밖이다 — 실제 서버 요청 컨텍스트가 있어야 의미 있게
  검증되므로, 필요해지면 Playwright 같은 E2E 러너로 다뤄야 한다. Playwright는 아직 없다 —
  필요해지면 먼저 어떤 플로우를 커버할지 확인할 것.

---

## 라우팅 — `src/routes`

- 파일 기반 라우팅. 새 페이지는 `src/routes/<name>.tsx`에 `createFileRoute`로 추가.
- `routeTree.gen.ts`는 자동 생성 파일 — 직접 손대지 말 것.
- 테스트 파일(`*.test.tsx`)을 `src/routes/`에 라우트 옆에 두는 관례라서, `tsr.config.json`의
  `routeFileIgnorePattern`(`\.test\.`)으로 라우트 생성기가 무시하게 해뒀다. 이걸 지우면 생성기가 파일마다
  "does not export a Route" 경고를 내는데, dev 서버에서 그 경고가 콘솔 전달을 타고 재귀적으로 로그에
  쌓여 로그 파일이 수 GB까지 폭주한 적이 있다. 지우지 말 것.
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

> **느린 데이터는 loader에 걸지 않는다.** loader의 `ensureQueryData`는 끝날 때까지 페이지 전환을 막는다.
> 인메모리 배열처럼 빠르면 문제없지만, 실제 DB/외부 API/CLI 호출처럼 느려질 수 있는 데이터는 loader
> prefetch를 빼고 컴포넌트에서 `useQuery`로 읽어 화면 안에서 로딩 표시를 한다(`llm-runner.tsx`,
> `settings.tsx`의 AI 연동 탭). 그래도 loader를 쓰는 라우트가 느려질 때를 대비해 `router.tsx`에
> `defaultPendingComponent`(`PageLoading`, 200ms 뒤 표시)가 걸려 있다. 루트 라우트는 사이드바/헤더까지
> 대기 화면으로 바뀌지 않게 `pendingMs: Infinity`다 — 지우지 말 것.

> **주의**: 서버-쿼리 통합 패키지는 `@tanstack/react-router-ssr-query`
> (+ `@tanstack/react-router` ≥1.170.33 필요)만 쓴다. 예전에 같은 역할을 하던
> `@tanstack/react-router-with-query`는 **deprecated**이고, 스트림이 끝날 때
> `hydrate(queryClient, undefined)`를 호출하는 버그가 있어 콘솔에
> `Cannot read properties of undefined (reading 'mutations')` 에러가 무한 누적된다
> (최신 1.130.17에서도 재현 확인). 절대 `@tanstack/react-router-with-query`로 되돌리지 말 것.

전역 클라이언트 상태 라이브러리는 로케일(`src/i18n/locale-store.ts`) 하나 때문에 **Zustand**를
도입해뒀다 — 이 킷에서 "전역 상태"로 보이는 대부분은 서버 데이터이고, 그건 React Query의
몫이다. 모달 열림 여부 같은 순수 UI 상태는 지금처럼 컴포넌트 로컬 `useState`로 충분하다.

> **정말 여러 컴포넌트가 공유하는 순수 클라이언트 상태**가 새로 필요해지면 같은 Zustand를
> 그대로 쓴다. Redux나 Jotai는 도입하지 말 것 — Zustand는 Provider 없이 `create()`로 만든
> 스토어를 React 트리 밖(서버 함수, 유틸 함수, `nav.ts`/`footer.ts` 같은 모듈 스코프 상수)에서도
> `store.getState()`로 바로 읽고 쓸 수 있어서, 이 킷 구조와 궁합이 좋다. `locale-store.ts`가
> 정확히 이 패턴이다. Jotai는 atom을 여러 개로 쪼개는 모델이라 소규모 어드민 UI에서는 이점보다
> 관리 비용(atom 간 조율, 전체 상태 스냅샷 어려움, 영속화를 atom별로 따로 설정)이 더 크다.
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

## AI 연동 — `llm-runner` (설정 > AI 연동 탭 + `/llm-runner` 플레이그라운드)

사이드바의 "AI 플레이그라운드" 메뉴(`/llm-runner`)는 `llm-runner`(npm)로 Claude/Codex **구독 세션** 또는 **API 키**를
같은 방식으로 호출해 보는 플레이그라운드다.
**연결(로그인·API 키 안내·사용량 확인)은 `settings.tsx`의 "AI 연동" 탭(`AiSection`)에서 한다** — provider 4종의
연결 상태를 보여주고, 구독 provider는 `LlmPlanUsage`(계정·로그인/로그아웃·플랜 잔량) 패널을 행 아래에 펼친다.
연결 여부의 기준은 상태 조회가 아니라 계정 조회(`llmAccountQueryOptions`) 결과다. 데이터 패턴(config → server → route)은 위 "데이터"
섹션과 같고, 파일은 `src/config/llm-runner.ts` + `src/server/llm-runner.ts` +
`src/routes/llm-runner.tsx` + `src/components/llm-plan-usage.tsx`(구독 사용량 패널)이다.

- **`llm-runner`는 Node 전용이다 — 서버 함수 안에서만 import한다.** 그것도 모듈 최상단이 아니라
  핸들러 안에서 `await import('llm-runner')`로 가져온다. 최상단에서 `createAiRunner()`를 부르거나
  import하면 CLI 설치 검사가 돌아 CLI 없는 빌드 환경에서 깨질 수 있다. 클라이언트 코드
  (라우트, config, 컴포넌트)에서는 import하지 말 것 — 모델 이름 목록도 `llm-runner`의 상수를
  쓰지 않고 `config/llm-runner.ts`에 문자열로 둬서 클라이언트 번들에 끌어오지 않는다.
- **구독 provider(`claude-subscription`/`openai-subscription`)는 로컬 로그인 세션을 쓴다.**
  로컬 개발용이고 배포 서버에서는 동작하지 않을 수 있다. 화면에도 이 안내가 붙어 있다.
- **구독 계정은 머신 기본 로그인이 아니라 이 앱 전용 프로필(`~/.llm-runner/claude`,
  `~/.llm-runner/codex`)을 쓴다**(llm-runner 0.9.0의 `claudeConfigDir`/`codexHome`). 그래서 앱에서
  계정을 바꿔도 Claude Code/Codex CLI의 기본 로그인은 그대로다. 실행·사용량·계정 조회는 모두
  `getProfileOptions()`가 만든 프로필을 넘겨야 같은 계정을 본다 — 새 서버 함수를 추가할 때 빠뜨리지
  말 것. 프로필 폴더는 자격 증명이 저장되는 곳이라 프로젝트 안이 아니라 홈 아래에 두고 `0700`으로 만든다.
  **`claudeLogout()`/`codexLogout()`은 프로필을 생략하면 머신 기본 계정이 로그아웃돼 다른 터미널
  세션까지 끊기므로, 프로필 없이 호출하지 말 것**(`logoutLlmFn`은 항상 프로필을 넘긴다).
- **앱 안 로그인 흐름**(`LlmAccountControls`): `startLlmLoginFn`이 CLI 로그인을 시작해 `authUrl`을
  돌려주고 → 화면이 새 탭으로 열고(Claude는 브라우저에서 받은 코드를 붙여넣어 `submitLlmLoginCodeFn`,
  Codex는 승인만) → `getLlmLoginStateFn`을 2초마다 폴링해 성공하면 `['llm-runner']` 쿼리를 무효화한다.
  진행 중인 로그인 핸들은 서버 프로세스 메모리(`loginSessions`)에 두는 로컬 개발용 단일 프로세스
  전제라 서버가 재시작되면 사라진다. 화면에는 성공/실패 상태만 내려가고, 실패 사유는 서버 로그에
  메시지만 남긴다(URL·코드·토큰은 남기지 않는다). 프로필에 로그인이 안 된 구독 provider는 선택은
  되지만(`needsLogin`) 실행 버튼이 막힌다.
- **API 키는 `.env`(gitignore 대상)에만 둔다** — `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`. 코드에
  하드코딩 금지, 클라이언트로도 내려보내지 않고 "설정됐는지"만 boolean으로 판단한다. Vite는
  `.env`를 `VITE_` 접두사만 클라이언트용으로 로드하고 서버 `process.env`에는 넣어주지 않으므로,
  `vite.config.ts`에서 `loadEnv(mode, cwd, '')`로 접두사 없이 로드해 `process.env`에 합쳐둔다
  (셸에 이미 있는 값은 덮어쓰지 않는다). **이 로딩은 dev 서버 전용이다** — 프로덕션 실행은
  `node --env-file=.env`나 배포 환경 변수로 넣을 것. `.env`를 고치면 dev 서버를 재시작해야 한다.
- **이미지 생성**(`generateLlmImageFn`)은 `llm-runner/experimental`의 `generateCodexImage()`(0.10.0+)를
  쓴다 — **Codex 구독 전용**이라 플레이그라운드에서 `openai-subscription`을 고르면 "이미지 생성" 버튼이 나온다
  (`hasImageGeneration`). 텍스트와 **다른 사용량 한도**를 쓰고, 한 번에 1분 넘게 걸리며 여러 장이 나올 수
  있다. 한도 초과는 던지지 않고 `failure`로 오니 먼저 확인할 것. 이미지는 `Buffer`라서 서버 함수가 PNG를
  base64 data URL로 바꿔 내려보낸다(직렬화). 읽기 전용 샌드박스를 그대로 쓰고 앱 전용 프로필(`codexHome`)을 넘긴다.
- **`runLlmFn`은 비용이 나가는 호출이라 `context.user`가 없으면 던진다.** `authMiddleware`는
  사용자를 context에 실어줄 뿐 막지는 않으므로, 비용·부작용이 있는 서버 함수는 직접 확인할 것.
  이 킷엔 역할(RBAC)이 없어서 로그인한 누구나 실행할 수 있다.
- **구독 사용량 퍼센트**(`getLlmPlanUsageFn`)는 `llm-runner/experimental`의 `getClaudePlanUsage()`/
  `getCodexPlanUsage()`를 쓴다(토큰을 쓰지 않는 조회). 둘 다 SDK/CLI의 **실험적 API** 기반이라
  예고 없이 바뀔 수 있다 — 서버 함수는 실패하면 던지지 않고 `{ available: false }`로 폴백하고,
  화면은 "사용량을 확인할 수 없어요"로 처리한다. API 키 provider는 플랜 한도 개념이 없어서
  호출별 토큰/비용(`usage`)만 보여준다. 응답의 날짜는 `Date`가 아니라 ISO 문자열로 내려보낸다.
- **웹 검색 스위치**는 `runner.run({ enableWebSearch })`로 연결돼 있다. **구독 provider 전용**이고
  API 키 provider는 llm-runner가 무시하므로 화면에서는 비활성화하고 서버도 같은 규칙으로
  걸러서 넘긴다. 기본은 모든 도구가 잠겨 있고 이 옵션은 웹 검색만 연다. 웹 검색 실행은 1~3분까지
  걸릴 수 있어서 실행 중 안내 문구를 띄운다.
- **어느 계정의 사용량인지**(`getLlmAccountFn`)는 `getClaudeAccountInfo()`/`getCodexAccountInfo()`
  (0.7.0+)로 읽어 패널 상단에 이메일·조직을 표시한다. Claude와 Codex가 서로 다른 계정으로
  로그인돼 있을 수 있어서 잘못된 구독을 쓰는 실수를 막는 용도다. **이메일은 개인정보라
  로그인 사용자에게만 내려주고**(`context.user` 없으면 `{ available: false }`), 로그에 남기지
  않는다. 이 함수들은 토큰·키를 읽지 않는다.
- **테스트는 `@/server/llm-runner` 전체를 목한다** — `runLlmFn`, `llmStatusQueryOptions`,
  `llmPlanUsageQueryOptions`를 돌려주는 `vi.mock`으로 시작할 것(`src/routes/llm-runner.test.tsx`
  참고). 서버 함수 핸들러 자체는 다른 `server/*.ts`와 마찬가지로 단위 테스트 범위 밖이다.

---

## 다국어(i18n) — `src/i18n/`

`ko`/`en` 두 로케일을 지원한다. 사이드바 하단의 언어 토글(`language-toggle.tsx`)로 전환하고,
선택한 로케일은 `locale-store.ts`(Zustand, `localStorage`에 영속화)가 들고 있다.

- **일반 컴포넌트**: `useTranslation()`을 쓴다. 내부에서 `useLocaleStore`를 구독하므로
  로케일이 바뀌면 자동으로 리렌더된다 (`src/routes/orders.tsx` 등 리스트 페이지 참고).
- **모듈 스코프 상수** (`nav.ts`, `footer.ts`처럼 컴포넌트 밖에서 한 번만 평가되는 배열):
  훅을 못 쓰므로 로케일을 인자로 받는 함수(`getNavItems(locale)`, `getFooterColumns(locale)`)로
  만들고, 호출부 컴포넌트에서 `useLocaleStore((s) => s.locale)`로 현재 로케일을 구독한 뒤
  넘겨준다 (`app-sidebar.tsx`, `site-header.tsx`, `site-footer.tsx` 참고).
- **zod 스키마** (`login.tsx`, `settings.tsx`): 에러 메시지가 로케일에 따라 바뀌어야 해서
  스키마를 모듈 스코프 상수로 두지 않고, `t`를 받는 팩토리 함수(`createLoginSchema(t)` 등)로
  만든 뒤 컴포넌트 안에서 `useMemo(() => createXxxSchema(t), [t])`로 만든다. 팩토리 함수의
  매개변수 타입은 `Messages['login']`처럼 딕셔너리 타입을 직접 참조하지 말 것 — `messages.ts`가
  `as const`라 `ko`/`en` 값이 서로 다른 리터럴 타입이 되어 대입이 안 된다. `{ emailRequired: string }`
  처럼 필요한 필드만 `string`으로 넓혀서 인라인 타입을 선언한다.
- 새 로케일을 추가할 때는 `messages.ts`의 `ko` 객체와 정확히 같은 shape으로 채우면 된다.
  언어 이름 자체(예: "한국어"/"English")처럼 그 언어로만 표기하는 고유명사는 딕셔너리에
  넣지 않고 `language-toggle.tsx`의 `LOCALE_LABELS`처럼 별도 상수로 관리한다.
- 새 페이지/컴포넌트를 추가할 때 하드코딩된 한글 문자열을 넣지 말고 반드시 `messages.ts`에
  키를 추가한 뒤 위 패턴 중 하나로 연결할 것.

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
5개 리스트 페이지 전부에서 재사용 중. 완전 클라이언트 사이드, URL 쿼리 동기화 없음.
`usePaginatedSearch`의 `matchesQuery(item, query)`는 검색어가 빈 문자열이어도 항상
호출된다(건너뛰지 않는다) — 그래야 아래 테이블 필터처럼 검색어와 무관한 조건을
`matchesQuery` 클로저 안에 같이 접어넣었을 때도, 검색창이 비어있는 상태에서 필터만
걸어도 정상 동작한다. 텍스트 전용으로만 쓰는 호출부는 `''.includes('')`가 항상
`true`라 동작이 그대로다.

**테이블 필터**
`src/components/table-select-filter.tsx`(단일 선택) / `table-multi-select-filter.tsx`
(다중 선택) / `table-date-range-filter.tsx`(날짜 범위, `Popover`+`Calendar`) + `src/lib/date.ts`
(문자열 날짜 비교 헬퍼). 검색창과 나란히 두고, 상태는 각 라우트 컴포넌트에서
`useState`로 들고 있다가 `usePaginatedSearch`의 `matchesQuery` 클로저 안에서
`matchesText && matchesStatus && ...` 식으로 그냥 더 합치면 된다 — 훅 자체를 고칠 필요는
없다(위 항목 참고). 페이지가 필터 때문에 줄어들 때 별도로 `setPage(1)`을 부를 필요도
없다 — 훅이 이미 `Math.min(page, totalPages)`로 현재 페이지를 자동으로 클램프한다.
날짜는 이 킷의 목데이터처럼 `'YYYY-MM-DD'` 문자열로 저장돼 있다는 전제로,
`isWithinDateRange(dateString, range)`가 `Date` 파싱 없이 문자열 비교로 처리한다
(`orders.tsx`/`contents.tsx` 참고). 단일/다중 선택 예시는 `products.tsx`(카테고리
다중선택 + 상태 단일선택), `users.tsx`(역할 다중선택 + 상태 단일선택)에도 있다.

**행(row) 액션 모달 / 상세 보기**
`src/components/row-actions.tsx`
수정은 `Dialog`, 삭제 확인은 `AlertDialog`, "보기"는 `Sheet`로 한 컴포넌트 안에서
구성하는 게 표준 패턴. `details?: Array<{ label, value }>`를 넘기면 Sheet 안에 그
목록을 정의 목록(`dl`, 왼쪽 96px 라벨 / 오른쪽 값, 옅은 둥근 박스 하나에 선 없이 행 간격으로만 구분)으로 보여준다.
시트 구조는 헤더(제목 첫 글자 원형 + 제목 + 상태 배지, 아래 한 줄 요약) → 본문(`flex-1`) → 푸터(`삭제` ghost 위험색 · `닫기` · `수정` 주 버튼)다.
선택 prop: `status?: { label, tone }`(리스트의 `*_STATUS_TONE`과 같은 tone, 없으면 배지 생략 — `details`에 같은 글자의 값이 있으면 그 줄도 배지로 보인다),
`summary?: string`(제목 아래 요약, 없으면 그리지 않는다 — 일반 문구로 채우지 말 것). 요약은 `joinSummary(대표 속성, '라벨 값')`으로 만든다
(사용자: 역할 · 가입일, 주문: 주문자 · 주문일, 상품: 카테고리 · 가격, 콘텐츠: 작성자 · 작성일).
시트의 수정/삭제는 메뉴와 같은 다이얼로그를 연다 — 시트를 먼저 닫고 같은 렌더에서 다이얼로그를 열며(겹쳐 띄우지 않음), 다이얼로그가 닫히면 포커스는 행의 작업 버튼으로 돌아간다.
**시트는 떠 있는 패널이다**: `ui/sheet.tsx`는 그대로 두고 `SheetContent` className으로 위·아래·오른쪽 12px 여백, 고정 폭 440px,
스타일별 토큰 `--radius-panel`/`--shadow-panel`/`--panel-border`(crisp·editorial은 각진 0)를 준다. 여백 때문에 슬라이드 시작/끝이 화면에 남지 않도록
`styles.css`의 `[data-floating-panel]` 규칙이 이동 거리를 늘린다. 내용은 `riseIn`(8px, 30ms 간격)으로 헤더 → 줄 → 푸터 순서로 나타난다.
같은 `details` 배열을 `src/components/table-row-detail.tsx`에도 넘기면
테이블 행을 클릭했을 때 인라인 아코디언으로도 똑같이 펼쳐 보여줄 수 있다 — 한 번
필드를 정의해서 Sheet와 인라인 확장 양쪽에 재사용하는 게 패턴이다(`orders.tsx` 등 참고).
행 아코디언은 `useAccordionGroup`(한 번에 하나만 펼쳐짐)으로 열림 상태를 관리하고,
행 안의 `RowActions` 셀에는 `onClick={(e) => e.stopPropagation()}`을 꼭 걸어야
드롭다운 클릭이 행 토글을 같이 발동시키지 않는다.

**컬럼 정렬**
`src/hooks/use-sort.ts`(헤더 클릭 상태: asc → desc → 정렬 해제 순환) + `src/lib/sort.ts`의
`sortItems(data, getValue, direction)` + `src/components/sortable-table-head.tsx`(클릭 가능한
헤더, 방향에 따라 화살표 아이콘 표시). `getValue`는 원본 필드를 그대로 쓰는 컬럼뿐 아니라
`"128,000원"`처럼 포맷된 문자열에서 숫자만 뽑아 비교해야 하는 컬럼(금액 등)도 같은 방식으로
다룰 수 있게 함수로 받는다 — 컬럼별 `getValue` 맵을 만들어두고 `sortKey`로 찾아 쓰는 게
패턴이다(`orders.tsx`의 `ORDER_SORT_VALUES` 참고). 정렬은 검색/필터보다 먼저 적용한다 —
`sortItems`로 정렬한 배열을 `usePaginatedSearch`에 넘기면, 검색·필터·페이지네이션이 그
순서를 그대로 유지한 채로 동작한다.

**체크박스 다중선택 + 일괄 작업 + CSV 내보내기**
`src/hooks/use-row-selection.ts`(선택 상태는 id 문자열 `Set`으로 관리 — 페이지를 넘겨도
유지된다), `src/components/table-bulk-actions-bar.tsx`(하나 이상 선택됐을 때만 나타나는
액션 줄. 별도 박스로 감싸지 않고 툴바 오른쪽 위, 평소 CSV 내보내기 버튼이 있던 자리에
`{selection.count === 0 ? 기본 내보내기 버튼 : <TableBulkActionsBar>...}`로 자리를
바꿔 끼운다 — `orders.tsx` 참고), `src/lib/csv.ts`(`toCsv` + `downloadCsv`, UTF-8 BOM을
붙여서 엑셀에서 한글이 안 깨지게 한다). 툴바의 기본 내보내기 버튼은
`usePaginatedSearch`가 반환하는 `filteredItems`(현재 페이지가 아니라 검색/필터링된
전체 결과)를 내보내고, 선택 후 나타나는 내보내기 버튼은 `pageItems.filter(selection.isSelected)`
로 선택된 것만 내보낸다. 일괄 삭제는 다른 행 액션과 마찬가지로 실제로 데이터를 지우지
않고 `toast.success` + `selection.clear()`만 한다(데모 데이터라 서버 상태가 없다).

**토스트**
`sonner`. `Toaster`는 `__root.tsx`에 전역 1회 마운트.
`toast.success` / `toast.error`만 사용.

**테마**
테마는 두 축이다. 스타일 4종(`clean` 기본/`soft`/`editorial`/`crisp`)은 `<html data-style>`로 고르고
모양과 글꼴(`--radius`, 폰트·굵기, `--shadow-card`, `--card-border`, `--input`)만 바꾼다 — 색은 하나도 갖지 않는다.
컬러 팔레트는 `<html data-color>`로 고른다. 값이 없으면 기본(무채색 — 어두운 중립 사이드바, 흰 활성 메뉴 박스)이고,
프리셋은 12종이다: `pop`(코발트/라임/아이보리), `pop-red`(잉크/레드/오프화이트), `dreamy`(플럼/모브/애프리콧),
`nature`(모스/라일락/미스트), `energy`(인디고/오렌지/옐로), `pop-color`(바이올렛/코랄/레몬), `sweet`(라즈베리/피스타치오/옐로),
`cozy`(코코아/피치/바닐라), `retro`(그린/탠저린/블루), `rest`(말차/살구/크림), `elegant`(버건디/핑크/아이보리),
`clear`(틸/라벤더/아이스). 이름은 `messages.ts`의 `colorThemePicker.presets`에 있다. 라이트 전용이다(다크 모드 없음).

- **역할은 상대 휘도로 정한다**: 가장 어두운 색 = 주색(`main`), 중간 = 포인트(`accent`), 가장 밝은 색 = 옅은 색(`soft`).
  두 색의 휘도 차가 0.05 미만이면 프리셋별로 순서를 명시해도 된다(지금 12종은 해당 없음).
- **사이드바만 팔레트 면을 갖는다**: 면 = 주색, 비활성 글자 = 옅은 색을 흰색 쪽으로 40%(4.5:1 미만이면 더 흰색 쪽으로),
  활성 메뉴 = 포인트 박스 + `#111`/`#FFF` 중 대비 높은 글자(굵게), 구분선·호버 = 주색을 흰색 쪽으로 16%.
- **메인은 무채색으로 둔다.** 페이지·카드·표·본문/제목/KPI 글자·테두리·차트의 일반 막대·보조 버튼에는 팔레트를 쓰지 않는다.
  팔레트가 메인에 나오는 곳은 `--primary`(= 주색: 주요 버튼 면(흰 글자), 링크, 주간 막대의 강조 1개, 활성 탭/세그먼트, 포커스 링)와
  `--chip`(= 옅은 색 면 + 진한 글자: secondary 배지·칩)뿐이다. 알림 아이콘처럼 팔레트와 무관해야 하는 작은 장식은 `--ink`(항상 무채색)를 쓴다.
  큰 면 토큰(`--background`, `--card`, `--secondary`, `--muted`, `--accent`, `--border` …)을 팔레트에 연결하지 말 것 — `theme.test.ts`가 막는다.
- **값은 미리 계산해 둔다**: `src/config/theme.ts`의 `PALETTE_PRESETS`가 프리셋별 최종 hex(`main`, `accent`, `soft`, `mainFg`,
  `accentFg`, `softFg`, `sidebarText`, `sidebarStrong`, `sidebarLine`)를 갖고, `styles.css`의 `:root[data-color='…']` 블록이 같은 값을
  `--pal-*` 변수로 정의한다. 공용 `:root[data-color]` 블록이 `--pal-*`를 shadcn 토큰(`--primary`, `--ring`, `--chip`, `--chart-1`,
  `--sidebar*`)에 연결한다. 프리셋이 없으면 `:root` 기본값(예전 무채색과 같은 값)이 그대로 쓰인다.
- 허용 값·저장 키(`theme-style`, `theme-color`)·초기화 스크립트는 `src/config/theme.ts`가 단일 출처이고,
  선택 UI는 `style-theme-picker.tsx` / `color-theme-picker.tsx`(라디오 그룹, 카드마다 주색/포인트/옅은 색 스와치)다.
  예전 저장값은 읽을 때 옮긴다(스타일 `graphite`/`nordic` → `clean`, `warm` → `soft`; 예전 포인트색 `blue`/`green`/`purple`/`rose`/`orange`와
  알 수 없는 값 → 기본(무채색)).

새 스타일은 `THEME_STYLES`에 추가하고 `styles.css`에 `:root[data-style='...']` 블록을 만들면 된다 —
이 블록에는 **색 토큰을 넣지 말 것**(모양·글꼴 토큰만). `theme.test.ts`가 둘의 불일치를 잡아준다.
새 팔레트는 (1) 세 색을 휘도 순으로 정렬해 역할을 정하고, (2) 위 규칙(미리보기
`docs/superpowers/specs/assets/color-combos-preview.html`의 `derive()`, 모드 2)으로 파생 값을 계산해
(3) `THEME_COLORS`·`PALETTE_PRESETS`·`messages.ts`(ko/en 이름)·`styles.css`의 `:root[data-color='...']` 블록(`--pal-*`만, 스타일 블록보다 뒤)에
추가한다. `palette-contrast.test.ts`가 대비(흰 글자/주색 ≥ 4.5, 사이드바 글자/주색 ≥ 4.5, 활성 메뉴 글자/포인트 ≥ 4.5,
칩 글자/옅은 색 ≥ 4.5, 포인트/주색 ≥ 3)를 확인하고, `theme.test.ts`가 CSS 값 일치를 확인한다.
흰 글자가 주색 위에서 4.5:1이 안 되면 주색을 검정 쪽으로 5%씩 어둡게 해서 저장한다.

- 알려진 주의사항 1: 스타일별 폰트(@fontsource) CSS를 전부 정적 import해서 렌더 차단 CSS가 약 1.1MB(gzip ~400KB)다. 폰트 파일 자체는 unicode-range로 필요한 조각만 받지만 @font-face 선언이 모든 페이지 첫 렌더에 포함된다. 줄이려면 쓰지 않는 굵기를 빼거나 선택한 스타일의 폰트만 동적으로 import하는 방식을 검토할 것.
- 알려진 주의사항 2: Editorial의 `--radius`는 rounded-xl이 0이 되도록 의도적으로 음수(-0.25rem)다. sonner 토스트처럼 `var(--radius)`를 직접 쓰는 곳에서는 무효값이 되어 기본 반경으로 떨어진다. Crisp의 `--radius`도 0이라 같은 주의가 필요하고, 카드만 4px로 따로 둔다.

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
  밀려나게 한다. 같은 래퍼의 `shrink-0`도 지우지 말 것 — 래퍼는 스크롤 컨테이너(flex-col)의 아이템이라 이게 없으면 콘텐츠가
  화면보다 길 때 `min-h-full` 높이로 줄어들어 카드가 넘쳐서 푸터와 겹친다(설정 > AI 연동 탭에서 겪음).
  이 `min-h-full`을 지우면 콘텐츠가 짧을 때 푸터가 스크롤 없이 바로 보여버린다
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
- 콘텐츠 영역 배경은 단색 `--background`다(예전에는 색상별 오버레이 이미지와 격자 패턴이었지만 옛스럽다는
  피드백으로 제거했다). 무늬/배경 이미지를 되살리자는 요청이 오면 방향부터 먼저 확인할 것.
- **페이지 콘텐츠는 반드시 `Card`/`CardContent`로 감싼다** — 배경 위에 카드로
  떠 있어야 "카드가 배경과 구분이 안 된다"는 밋밋함이 안 생긴다. 리스트 페이지는 검색창+테이블+
  페이지네이션 전체를, 설정 페이지(`settings.tsx`)는 탭 내비게이션+콘텐츠 전체를 하나의 `Card`로
  감싼다. 새 페이지를 만들 때 이 카드 래핑을 빼먹지 말 것 — 빼먹으면 배경 위에 맨몸으로 떠서
  다른 페이지들과 붕 뜬 느낌으로 보인다.
- 이 `Card`에는 **`className="flex-1"`을 꼭 붙인다** — 그래야 콘텐츠가 짧아도 카드가 푸터
  바로 위까지 늘어난다(부모인 `__root.tsx`의 콘텐츠 래퍼가 `flex flex-col`이라 자식에 `flex-1`만
  주면 남은 공간을 채운다). `flex-1`을 빼면 카드가 자기 콘텐츠 높이만큼만 차지하고, 그 아래로
  배경이 그대로 드러나 카드가 붕 떠 보인다 — 예전에 이것 때문에 "박스가 푸터 있는 데까지
  길게 있는 게 낫다"는 피드백을 받고 전부 고쳤다. 대시보드(`index.tsx`)/분석(`analytics.tsx`)처럼
  카드가 여러 개로 나뉜 페이지는 이 규칙 대상이 아니다 — 개별 카드에 `flex-1`을 억지로 주지 말 것.

---

## 애니메이션 — motion

UI 애니메이션은 `motion`(framer-motion 후속, `motion/react`) 하나로 통일한다. 짧고 차분하게 — 150~450ms, 튀는 스프링 없음.
설계 메모: `docs/superpowers/specs/2026-10-08-motion-design.md`.

- **`LazyMotion` + `m`만 쓴다.** `__root.tsx`의 `MotionProvider`(`src/lib/motion.tsx`)가 `LazyMotion features={domAnimation} strict`와
  `MotionConfig reducedMotion="user"`를 건다. `strict`라서 `motion.div`를 쓰면 런타임 에러가 난다 — 항상 `m.div`, 컴포넌트는 `m.create(Card)`.
  레이아웃 애니메이션(`layout`/`layoutId`)이 필요한 곳만 `<LazyMotion features={loadLayoutFeatures} strict>`로 감싸 `domMax`를 지연 로드한다
  (선택기 2종, 리스트 테이블). 메인 번들에 `domMax`를 넣지 말 것.
- **값은 `src/lib/motion.tsx`의 토큰을 쓴다**: `duration.fast/base/slow`(0.15/0.25/0.45초, 카운트업만 `count` 0.8초), `ease.out`/`ease.inOut`,
  작은 `spring`, 형제 간격 `STAGGER`(60ms)·`STAGGER_TIGHT`(30ms), 변형 `fadeUp`(custom=순번)/`riseIn`(custom=순번, 행 보기 시트)/`fade`/`scaleIn`/`staggerContainer()`. 숫자를 컴포넌트에 직접 박지 말 것.
  CSS 쪽 같은 값은 `styles.css`의 `--motion-ease-out`, `--motion-duration-*`.
- **동작 줄이기**: `reducedMotion="user"`가 transform/레이아웃을 즉시 끝낸다. `animate()`를 직접 부르는 곳(`AnimatedNumber`)과
  opacity·pathLength처럼 transform이 아닌 애니메이션은 `useReducedMotion()`으로 직접 끈다(`transition`만 바꾸고 렌더 결과는 바꾸지 않는다 — 아래 SSR 규칙).
- **SSR 규칙**: 서버 렌더와 하이드레이션 첫 렌더는 같은 결과여야 한다. `useReducedMotion()`·`window` 같은 클라이언트 값으로 `initial`이나 글자를
  분기하지 말 것(불일치 경고). "첫 화면엔 애니메이션 없이, 이후 변화에만"이 필요하면 `useHasMounted()`로 `initial={false}`를 고른다(`PageTransition`).
  대시보드 진입처럼 첫 화면부터 애니메이션하는 곳은 SSR도 `initial` 상태(투명)로 나가고 하이드레이션 뒤 재생된다 — JS가 늦으면 그동안 카드가 안 보이니
  이런 연출은 대시보드처럼 꼭 필요한 곳에만 쓴다. `AnimatedNumber`는 SSR에서 최종 글자를 내보내고 페인트 전에 0으로 되돌린다.
- **페이지 전환은 진입 전용이다** (`src/components/page-transition.tsx`): 렌더된 마지막 매치의 경로를 key로 쓰는 `m.div`가 opacity 0→1, y 8→0(220ms).
  **`Outlet`(children)을 `AnimatePresence`로 감싸지 말고 퇴장 애니메이션도 넣지 말 것** — 나가는 라우트가 새 라우터 상태로 다시 렌더링돼
  내용이 바뀌거나 멈춰 보이는 문제가 있다. 대기 화면(`defaultPendingComponent`)이 떠 있는 상태로 바뀐 경로와 첫(SSR) 렌더는 애니메이션하지 않는다.
  래퍼는 `flex flex-1 flex-col gap-4`라 위 레이아웃 규칙(`min-h-full shrink-0` 래퍼, 페이지 `Card className="flex-1"`)이 그대로 동작한다.
  사이드바·헤더·푸터는 애니메이션하지 않는다.
- **다이얼로그/시트/알림 다이얼로그는 CSS 그대로다.** Radix의 `data-[state]` + `tw-animate-css`를 쓰고 motion으로 다시 만들지 않는다(`forceMount` 금지).
  `styles.css` 끝에서 오버레이 블러(2px)와 길이·이징만 토큰에 맞춘다. `ui/*` 파일은 생성된 형태로 둔다.
- **테마 전환**: 팔레트/스타일을 바꿀 때 `startThemeTransition()`이 `<html data-theme-transition>`을 300ms 붙여 사이드바·버튼·링크·배지·탭·막대의
  색만 250ms로 바꾼다(`*` 전체 전환 금지). 초기화 스크립트로 정해지는 첫 로드에는 이 속성이 없어서 애니메이션되지 않는다. 새 선택 UI도 같은 함수를 부를 것.
- **리스트 테이블 행** (`src/components/animated-table-row.tsx`): 리스트 페이지는 `TableBody` 대신 `AnimatedTableBody layoutKey={pageItems.map((x) => x.id).join('|')}`,
  행은 `TableRow` 대신 `AnimatedTableRow`(key는 바깥 `Fragment`/행)를 쓴다. 검색·필터·정렬·페이지가 바뀌면 남는 행이 `layout="position"`으로 이동하고,
  새 행은 페이드인, 빠지는 행은 `AnimatePresence`로 짧게 사라진다. 표 칸 너비가 무너지므로 `mode="popLayout"`은 쓰지 않는다.
  **아코디언 보정**: `layoutDependency`가 `layoutKey`라서 `TableRowDetail`을 펼치거나 접을 때(목록 동일)는 행이 움직이지 않는다 — 이게 없으면 펼친 상세 위로
  아래 행들이 미끄러져 겹친다. 같은 이유로 목록이 바뀔 때만 위치를 재서 타이핑 중 비용도 작다. 한 페이지(≤10행) 테이블에만 쓰고, 수백 행 테이블에는 쓰지 말 것.
- **테스트**: `src/test/setup.ts`가 `MotionGlobalConfig.skipAnimations = true`로 모든 애니메이션을 즉시 끝낸다. 시간에 따른 중간 값을 검증해야 하면
  그 테스트 안에서만 `false`로 바꾸고 `afterEach`에서 되돌린다(`animated-number.test.tsx`).
- **새 애니메이션 컴포넌트 추가 방법**: (1) `m.*`/`m.create()`로 만들고 (2) `variants`/`transition`은 `src/lib/motion.tsx`에서 가져오고
  (부족하면 거기에 토큰·변형을 추가) (3) SSR 첫 렌더가 서버와 같은지, 동작 줄이기에서 즉시 끝나는지 확인하고 (4) 테스트는 skip 상태에서 최종 결과를 검증한다.
- **dev 콘솔 되먹임 주의**: OS "동작 줄이기"가 켜진 기기에서는 motion이 개발 모드에서 경고 한 줄("You have Reduced Motion enabled…")을 찍는다.
  Vite 8의 `server.forwardConsole`(브라우저 → 터미널)과 TanStack Devtools 콘솔 파이프(터미널 ↔ 브라우저)가 같이 켜져 있으면 이 한 줄이
  서로 되먹임되며 무한히 불어나 dev 로그가 수 GB가 된다(실제로 9.5GB까지 감). 그래서 `vite.config.ts`에서 `forwardConsole: false`로 끊어뒀다 — 되돌리지 말 것.
- 보류: 칸반 드래그, 퇴장 전환, 필터 시 카드 재배치(`layout`) — 필요해지면 설계 메모의 "보류" 항목부터 볼 것.

---

## 코드 스타일

- TypeScript `strict` + `noUnusedLocals` / `noUnusedParameters` 활성화
- path alias: `@/*` → `./src/*`
- ESLint는 `@tanstack/eslint-config` 기반. `import/order`, `sort-imports` 등 일부 규칙은 꺼져 있음 — 임의로 켜지 말 것
- `src/components/ui/*`(shadcn 컴포넌트)는 가급적 CLI로 생성된 형태를 유지
- 커스텀 컴포넌트는 `src/components/*.tsx`에 named export로 작성
