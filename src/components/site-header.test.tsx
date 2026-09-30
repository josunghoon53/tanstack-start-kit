import { queryOptions } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteHeader } from './site-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'

// SiteHeader renders NotificationsMenu, which reads notificationsQueryOptions()
// via useSuspenseQuery. The real implementation calls a createServerFn-wrapped
// handler that needs a live HTTP request context (like loginFn/logoutFn),
// which doesn't exist in vitest — mock it to resolve instantly instead.
vi.mock('@/server/notifications', () => ({
  notificationsQueryOptions: () =>
    queryOptions({
      queryKey: ['notifications'],
      queryFn: () => Promise.resolve([]),
    }),
}))

describe('SiteHeader', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('shows the Korean label for the current nested route', async () => {
    renderWithRouter(
      <SidebarProvider>
        <SiteHeader />
      </SidebarProvider>,
      { initialPath: '/orders' },
    )

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for the heading before asserting its content.
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      '전체 주문',
    )
  })

  it('shows the dashboard title at the root path', async () => {
    renderWithRouter(
      <SidebarProvider>
        <SiteHeader />
      </SidebarProvider>,
      { initialPath: '/' },
    )

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      '대시보드',
    )
  })
})
