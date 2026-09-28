import {
  HeadContent,
  Scripts,
  createRootRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { AppSidebar } from '../components/app-sidebar'
import { NotFound } from '../components/not-found'
import { SiteHeader } from '../components/site-header'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import { getCurrentUserFn } from '../server/auth'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;var color=window.localStorage.getItem('theme-color');if(color){root.setAttribute('data-color',color)}}catch(e){}})();`

export const Route = createRootRoute({
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
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isLoginPage = pathname === '/login'

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        {isLoginPage ? (
          children
        ) : (
          <SidebarProvider className="h-svh overflow-hidden">
            <AppSidebar />
            <SidebarInset className="overflow-hidden">
              <SiteHeader />
              <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        )}
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
