import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import { AppSidebar } from '../components/app-sidebar'
import { NotFound } from '../components/not-found'
import { SiteFooter } from '../components/site-footer'
import { SiteHeader } from '../components/site-header'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import { Toaster } from '../components/ui/sonner'
import { getCurrentUserFn } from '../server/auth'
import { notificationsQueryOptions } from '../server/notifications'
import { THEME_INIT_SCRIPT } from '../config/theme'
import { MotionProvider } from '../lib/motion'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async ({ location }) => {
      const user = await getCurrentUserFn()
      const isLoginPage = location.pathname === '/login'

      if (!user && !isLoginPage) {
        throw redirect({ to: '/login' })
      }

      if (user && isLoginPage) {
        throw redirect({ to: '/' })
      }

      return { user }
    },
    loader: ({ context }) =>
      context.queryClient.ensureQueryData(notificationsQueryOptions()),
    // 루트가 대기 화면으로 바뀌면 사이드바/헤더까지 사라진다. 페이지 대기 화면은 자식 라우트만 쓴다.
    pendingMs: Infinity,
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          // 이 킷은 데스크톱 전용 어드민이라 모바일 반응형을 지원하지 않는다.
          // width=device-width 대신 고정 너비를 줘서, 좁은 화면에서도 축소된
          // "모바일 레이아웃"으로 깨지지 않고 데스크톱 레이아웃 그대로 가로 스크롤되게 한다.
          name: 'viewport',
          content: 'width=1280, initial-scale=1',
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
    notFoundComponent: NotFound,
    shellComponent: RootDocument,
  },
)

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isLoginPage = pathname === '/login'

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <MotionProvider>
          {isLoginPage ? (
            children
          ) : (
            <SidebarProvider className="h-svh overflow-hidden">
              <AppSidebar />
              <SidebarInset className="overflow-hidden">
                <SiteHeader />
                <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
                  <div className="flex min-h-full min-w-5xl shrink-0 flex-col gap-4 p-4">
                    {children}
                  </div>
                  <SiteFooter />
                </div>
              </SidebarInset>
            </SidebarProvider>
          )}
        </MotionProvider>
        <Toaster position="top-center" />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Tanstack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
