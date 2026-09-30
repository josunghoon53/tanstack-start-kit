import { QueryClientProvider } from '@tanstack/react-query'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createTestQueryClient } from './query-client'
import type { QueryClient } from '@tanstack/react-query'

// 라우트 컴포넌트(list/dashboard 등)는 useSuspenseQuery만 쓰고 <Link>는 안 쓰는 경우가
// 많다 — 그런 컴포넌트는 QueryClientProvider만 있으면 되고 라우터가 필요 없다.
export function renderWithQueryClient(
  ui: ReactElement,
  { queryClient = createTestQueryClient() }: { queryClient?: QueryClient } = {},
) {
  const utils = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
  return { ...utils, queryClient }
}

// <Link>/useRouterState/useRouter를 쓰는 컴포넌트(대시보드, 헤더, 사이드바, 푸터 등)를
// 테스트할 때 쓴다. 실제 앱의 routeTree.gen.ts는 __root.tsx의 beforeLoad에서 서버 세션을
// 요구해서 테스트 환경에서 그대로 못 쓰므로, 인증/로더 없이 딱 필요한 만큼만 라우트를
// 새로 구성한다. `extraPaths`로 컴포넌트가 <Link to="..."> 하는 경로를 등록해두면
// 실제로 그 경로로 이동하는 상호작용도 검증할 수 있다.
export function renderWithRouter(
  ui: ReactElement,
  {
    initialPath = '/',
    extraPaths = [],
    queryClient = createTestQueryClient(),
  }: {
    initialPath?: string
    extraPaths?: Array<string>
    queryClient?: QueryClient
  } = {},
) {
  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <TestOutlet ui={ui} />
      </QueryClientProvider>
    ),
  })

  const childRoutes = [initialPath, ...extraPaths]
    .filter((path, index, all) => all.indexOf(path) === index)
    .map((path) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path,
        component: () => null,
      }),
    )

  const router = createRouter({
    routeTree: rootRoute.addChildren(childRoutes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  const utils = render(<RouterProvider router={router} />)
  return { ...utils, queryClient, router }
}

// 루트 라우트 컴포넌트 안에서 테스트 대상 ui를 그대로 렌더링만 해주는 아주 얇은 래퍼.
function TestOutlet({ ui }: { ui: ReactElement }) {
  return ui
}
