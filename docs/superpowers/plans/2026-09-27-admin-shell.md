# 어드민 셸 최소 버전 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 marketing landing 템플릿(Header/Footer/index/about)을 걷어내고, shadcn/ui 표준(Radix 기반) 사이드바 + 헤더로 구성된 최소 어드민 레이아웃 셸을 TanStack Start 위에 만든다.

**Architecture:** `src/routes/__root.tsx`의 `RootDocument`에서 직접 `SidebarProvider` + `AppSidebar` + `SidebarInset`(헤더+본문)으로 전체 앱을 감싼다. 별도의 pathless layout route를 두지 않고 루트에서 한 번만 감싸는 이유는, 이 저장소 전체가 어드민 전용 커스터로 전환되므로 모든 라우트에 동일한 셸이 적용되면 되기 때문이다(라우트별로 다른 레이아웃이 필요해지면 그때 pathless layout route로 쪼갠다). 사이드바 메뉴는 `src/config/nav.ts` 배열 하나로 정의해 이후 항목 추가/수정이 파일 하나로 끝나게 한다.

**Tech Stack:** TanStack Start, TanStack Router(file-based), React 19, Tailwind v4, shadcn/ui(Radix 기반) CLI, lucide-react(shadcn 사이드바 의존성으로 자동 설치)

**Spec:** `docs/superpowers/specs/2026-09-27-admin-shell-design.md`

---

## Task 1: 베이스라인 커밋 + 랜딩 템플릿 제거

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/styles.css`
- Delete: `src/components/Header.tsx`
- Delete: `src/components/Footer.tsx`
- Delete: `src/routes/about.tsx`

- [ ] **Step 1: 지금까지의 스캐폴드 상태를 그대로 커밋**

이후 diff에서 "무엇을 지웠는지"가 명확히 보이도록, 손대기 전 상태를 먼저 커밋한다.

```bash
cd /Users/joseonghun/Documents/MY_PLAYGROUND/tanstack-start-kit
git add -A
git commit -m "chore: TanStack Start 기본 스캐폴드 커밋"
```

- [ ] **Step 2: `src/routes/__root.tsx`에서 Header/Footer 참조 제거**

파일 전체를 아래 내용으로 교체한다 (테마 초기화 스크립트와 devtools는 그대로 유지):

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Admin',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: `src/routes/index.tsx`를 임시 placeholder로 교체**

사이드바/Card는 아직 없으므로, 우선 랜딩 콘텐츠만 걷어낸 단순한 placeholder로 바꾼다 (Task 7에서 최종 대시보드 카드로 다시 교체한다):

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  return <div className="p-4">대시보드 준비 중</div>
}
```

- [ ] **Step 4: `src/routes/about.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx` 삭제**

```bash
rm src/routes/about.tsx src/components/Header.tsx src/components/Footer.tsx
```

- [ ] **Step 5: `src/styles.css`를 랜딩 전용 CSS 없이 최소 형태로 교체**

```css
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");
@import "tailwindcss";

@theme {
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-sans);
}
```

- [ ] **Step 6: 타입체크와 빌드로 확인**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료 (Header/Footer/about 관련 미사용 import·미존재 참조가 없어야 함)

```bash
pnpm build
```
Expected: `vite build` 성공 (exit code 0)

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "refactor: 랜딩 템플릿 제거하고 어드민 셸 준비"
```

---

## Task 2: shadcn/ui 초기화

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `src/styles.css` (shadcn CLI가 CSS 변수 블록을 추가함)
- Modify: `package.json` (shadcn CLI가 의존성 추가: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css` 등)

- [ ] **Step 1: shadcn CLI 초기화 실행 (기본값 사용, 프롬프트 없이)**

```bash
pnpm dlx shadcn@latest init -d
```

CLI는 기존 `tsconfig.json`의 `@/*` alias, `src/styles.css`, Tailwind v4 설정을 자동 감지해서 `components.json`을 생성하고 `src/lib/utils.ts`(`cn()` 헬퍼)를 만든다.

- [ ] **Step 2: 생성된 파일 확인**

```bash
test -f components.json && test -f src/lib/utils.ts && echo OK
```
Expected: `OK` 출력

- [ ] **Step 3: 타입체크와 빌드로 확인**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료

```bash
pnpm build
```
Expected: 성공 (exit code 0)

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: shadcn/ui 초기화"
```

---

## Task 3: 사이드바 컴포넌트 셋 설치

**Files:**
- Create: `src/components/ui/sidebar.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/input.tsx` (sidebar 검색 인풋이 의존)
- Modify: `package.json` (`@radix-ui/*` 관련 의존성 추가)

- [ ] **Step 1: shadcn CLI로 컴포넌트 추가**

```bash
pnpm dlx shadcn@latest add sidebar card button separator sheet tooltip skeleton input
```

- [ ] **Step 2: 파일이 모두 생성됐는지 확인**

```bash
ls src/components/ui/
```
Expected: `sidebar.tsx button.tsx card.tsx separator.tsx sheet.tsx tooltip.tsx skeleton.tsx input.tsx` 포함

- [ ] **Step 3: 타입체크와 빌드로 확인**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료

```bash
pnpm build
```
Expected: 성공 (exit code 0)

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: shadcn 사이드바 컴포넌트 셋 설치"
```

---

## Task 4: 내비게이션 단일 소스 작성

**Files:**
- Create: `src/config/nav.ts`

- [ ] **Step 1: `src/config/nav.ts` 작성**

```ts
import type { ComponentType } from 'react'
import { LayoutDashboard } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export const NAV_ITEMS: Array<NavItem> = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
]
```

`access`(role/permission) 같은 필드가 나중에 필요해지면 `NavItem`에 옵셔널로 추가하면 되고, 지금은 최소 형태만 둔다.

- [ ] **Step 2: 타입체크**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료

- [ ] **Step 3: 커밋**

```bash
git add src/config/nav.ts
git commit -m "feat: 사이드바 내비게이션 단일 소스 추가"
```

---

## Task 5: AppSidebar / SiteHeader 컴포넌트 작성

**Files:**
- Create: `src/components/app-sidebar.tsx`
- Create: `src/components/site-header.tsx`

- [ ] **Step 1: `src/components/app-sidebar.tsx` 작성**

```tsx
import { Link, useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NAV_ITEMS } from '@/config/nav'

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <span className="px-2 text-sm font-semibold">Admin</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link to={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

- [ ] **Step 2: `src/components/site-header.tsx` 작성**

```tsx
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import ThemeToggle from './ThemeToggle'

export function SiteHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-semibold">대시보드</h1>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
```

- [ ] **Step 3: 타입체크**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료 (아직 `__root.tsx`에서 사용하지 않으므로 빌드는 이번 단계에서 하지 않음)

- [ ] **Step 4: 커밋**

```bash
git add src/components/app-sidebar.tsx src/components/site-header.tsx
git commit -m "feat: AppSidebar/SiteHeader 컴포넌트 추가"
```

---

## Task 6: 루트에 사이드바 셸 연결 + ThemeToggle 재스타일

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/components/ThemeToggle.tsx`

- [ ] **Step 1: `src/routes/__root.tsx`의 `RootDocument`를 사이드바 셸로 교체**

`import appCss from '../styles.css?url'` 아래에 다음 import를 추가:

```tsx
import { AppSidebar } from '../components/app-sidebar'
import { SiteHeader } from '../components/site-header'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
```

`RootDocument` 함수의 `<body>` 내부를 다음으로 교체 (Task 1에서 넣었던 `{children}` 한 줄을 대체):

```tsx
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
```

- [ ] **Step 2: `src/components/ThemeToggle.tsx`의 버튼을 shadcn `Button`으로 교체**

파일 상단 import에 `import { Button } from './ui/button'` 추가하고, 파일 맨 아래 `return` 블록만 다음으로 교체 (state/effect 로직은 그대로 유지):

```tsx
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleMode}
      aria-label={label}
      title={label}
    >
      {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
    </Button>
  )
```

- [ ] **Step 3: 타입체크와 빌드로 확인**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료

```bash
pnpm build
```
Expected: 성공 (exit code 0)

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "feat: 루트 레이아웃에 사이드바 셸 연결"
```

---

## Task 7: 대시보드 placeholder 카드 + 브라우저 검증

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: `src/routes/index.tsx`를 Card 기반 placeholder로 교체**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>대시보드</CardTitle>
        <CardDescription>
          필요한 위젯을 여기에 하나씩 추가하세요.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
```

- [ ] **Step 2: 타입체크와 빌드로 확인**

```bash
pnpm exec tsc --noEmit -p tsconfig.json
```
Expected: 에러 없이 종료

```bash
pnpm build
```
Expected: 성공 (exit code 0)

- [ ] **Step 3: 개발 서버 실행**

```bash
pnpm dev
```
백그라운드로 실행하고 `http://localhost:3000`이 뜰 때까지 대기한다.

- [ ] **Step 4: Playwright로 브라우저 검증**

`mcp__playwright__browser_navigate`로 `http://localhost:3000` 접속 후 `mcp__playwright__browser_snapshot`으로 확인:
- 좌측에 "Admin" 헤더와 "대시보드" 메뉴 항목이 있는 사이드바가 보인다
- 상단 헤더에 사이드바 토글 버튼과 테마 토글 버튼("Auto"/"Light"/"Dark" 중 하나)이 보인다
- 본문에 "대시보드" 제목의 Card가 보인다

`mcp__playwright__browser_click`으로 테마 토글 버튼을 클릭하고, `mcp__playwright__browser_evaluate`로 `document.documentElement.className`을 읽어 `light` → `dark` (또는 `auto` 순환)로 바뀌는지 확인한다.

Expected: 위 요소가 모두 스냅샷에 존재하고, 테마 토글 클릭 시 `<html>` 클래스가 바뀐다.

- [ ] **Step 5: 개발 서버 종료**

Playwright 검증에 사용한 dev 서버 프로세스를 종료한다.

- [ ] **Step 6: 커밋**

```bash
git add src/routes/index.tsx
git commit -m "feat: 대시보드 placeholder 카드로 홈 화면 구성"
```

---

## 완료 후 상태

- 랜딩 템플릿(Header/Footer/about/`--sea-*` CSS)이 모두 제거되고, shadcn/ui 기반 사이드바+헤더 어드민 셸로 교체됨
- `src/config/nav.ts` 하나로 사이드바 메뉴를 관리
- 인증/데이터 테이블/폼/RBAC 등은 이번 범위에 포함하지 않음 — 필요해질 때 `shadcn-dashboard`의 해당 패턴만 골라 참고해서 추가
