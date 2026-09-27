# 어드민 셸 최소 버전 설계

## 배경

`/Users/joseonghun/Documents/MY_PLAYGROUND/shadcn-dashboard`는 shadcn(base-ui 기반)로 만들던 어드민
보일러플레이트지만, Next.js → TanStack Start 마이그레이션이 미완료 상태(`src/app`과 `src/routes`
공존)에서 기능 데모(폼 4종, ui 컴포넌트 71개, kbar, RBAC 등)가 과도하게 쌓여 관리 부담이 커졌다.

이 저장소(`tanstack-start-kit`)는 그 경험을 반면교사 삼아, TanStack Start 위에 **필요한 것만 그때
그때 shadcn CLI로 얹는** 최소 어드민 셸을 새로 만든다. 지금 이 스캐폴드는 `create-tsrouter-app` 계열
기본 랜딩 템플릿(Header/Footer/ThemeToggle, `--sea-*` CSS 변수, index/about 페이지) 상태다.

## 목표

완성된 기능 목록을 한 번에 구현하는 게 아니라, **나중에 컴포넌트를 하나씩 추가해도 구조가 얽히지
않는 최소 뼈대**를 만드는 것이 이번 작업의 목표다.

## 이번 범위

1. **shadcn/ui 초기화**
   - `components.json`, `src/lib/utils.ts`의 `cn()` 헬퍼
   - Tailwind v4 CSS 변수 기반 뉴트럴 테마 (base color: neutral/slate 계열)
2. **사이드바 셋 도입**
   - `npx shadcn add sidebar button separator sheet tooltip skeleton` (shadcn 공식 sidebar 컴포넌트가
     요구하는 최소 의존 컴포넌트)
3. **레이아웃 뼈대**
   - TanStack Router의 pathless layout route(예: `src/routes/_layout.tsx`)에서
     `SidebarProvider` + `AppSidebar` + `SiteHeader` + `<Outlet />` 구성
4. **내비게이션 단일 소스**
   - `src/config/nav.ts` — 사이드바 메뉴 배열 하나로 정의. 지금은 `label`/`href`/`icon`만 두고,
     나중에 `access`(role/permission) 필드를 추가해도 구조가 깨지지 않게 타입을 설계
5. **다크모드**
   - 기존 `src/components/ThemeToggle.tsx`의 의존성 없는 로직(로컬스토리지 + `prefers-color-scheme`
     감지, light/dark/auto 3단 토글)은 그대로 재사용
   - 스타일만 shadcn `Button` variant로 다시 입힘
6. **홈 페이지**
   - `/`는 빈 대시보드 placeholder 카드 하나 정도로 대체 (실제 위젯은 이후 단계)

## 지우는 것

- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/ThemeToggle.tsx`의 기존 스타일(마크업/클래스) — 로직 함수는 유지해 재사용
- `src/styles.css`의 `--sea-*` 및 랜딩 전용 CSS
- `src/routes/about.tsx`
- `src/routes/index.tsx`의 기존 콘텐츠

## 이번에 하지 않는 것

인증(Clerk 연동), 데이터 테이블, 폼, CRUD 예제 도메인, RBAC, Cmd+K 커맨드바, 차트.
`shadcn-dashboard`는 각 기능이 실제로 필요해지는 시점에 패턴만 참고해 하나씩 가져온다.

## 참고: shadcn-dashboard에서 재사용 가치가 높다고 판단한 패턴 (지금은 가져오지 않음, 향후 참고용)

- provider-agnostic 인증 레이어(`src/lib/auth/{client,server,types,permissions}.ts` + `provider/`)
- `nav-config.ts` 단일 소스로 사이드바 + 커맨드바 + RBAC 겸용하는 패턴
- `features/*` 폴더 구조(api/components/schemas/constants 분리)
- `use-data-table.ts` 같은 테이블 URL-sync 훅

과했다고 판단해 가져오지 않는 것: `src/app`(Next.js 레거시 전체), 폼 데모 4종, 지나치게
many-variant로 확장된 `infobar.tsx`(762줄)/`sidebar.tsx`(692줄), kbar/carousel 등 실사용 빈도 낮은
기능성 컴포넌트, users/products/contents 3개 도메인에 반복된 동일 CRUD 보일러플레이트.
