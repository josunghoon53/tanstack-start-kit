import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useLocaleStore } from '@/i18n/locale-store'
import { renderWithRouter } from '@/test/render'

vi.mock('@/server/auth', () => ({
  logoutFn: vi.fn(),
}))

// 사이드바 nav 전체 경로 + settings.tsx 등에서 쓰는 서버 데이터 쿼리를 상호작용/활성
// 상태 검증할 때 <Link to="...">가 라우터에 등록되지 않은 경로로 가지 않도록 전부 등록해둔다.
const ALL_NAV_PATHS = [
  '/',
  '/users',
  '/users/admins',
  '/users/roles',
  '/users/invites',
  '/orders',
  '/orders/shipping',
  '/orders/refunds',
  '/orders/stats',
  '/products',
  '/products/categories',
  '/products/stock',
  '/products/inbound',
  '/payments',
  '/payments/subscriptions',
  '/payments/settlements',
  '/payments/refunds',
  '/contents',
  '/contents/notices',
  '/contents/scheduled',
  '/contents/drafts',
  '/analytics',
  '/analytics/revenue',
  '/analytics/users',
  '/analytics/reports',
  '/settings',
]

function renderSidebar(initialPath = '/') {
  return renderWithRouter(
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
    { initialPath, extraPaths: ALL_NAV_PATHS },
  )
}

describe('AppSidebar', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('renders all top-level nav entries', async () => {
    renderSidebar('/')

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for the first nav link before asserting the rest.
    expect(
      await screen.findByRole('link', { name: '대시보드' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '설정' })).toBeInTheDocument()

    // group triggers
    expect(screen.getByRole('button', { name: '사용자' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '주문' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '상품' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '결제' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '콘텐츠' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '분석' })).toBeInTheDocument()
  })

  it('marks the leaf matching the current path as active and opens its group', async () => {
    renderSidebar('/orders')

    const activeLink = await screen.findByRole('link', { name: '전체 주문' })
    expect(activeLink).toHaveAttribute('data-active', 'true')

    // the group trigger itself should also be marked active
    const ordersTrigger = screen.getByRole('button', { name: '주문' })
    expect(ordersTrigger).toHaveAttribute('data-active', 'true')

    // a leaf that isn't the current path is not active
    const shippingLink = screen.getByRole('link', { name: '배송중' })
    expect(shippingLink).toHaveAttribute('data-active', 'false')
  })

  it('expands a group on click and collapses a previously open group (accordion)', async () => {
    const user = userEvent.setup()
    renderSidebar('/settings')

    // wait for the router to settle before asserting on absence
    await screen.findByRole('button', { name: '사용자' })

    // nothing matches the current path, so no group starts open
    expect(
      screen.queryByRole('link', { name: '전체 사용자' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: '전체 주문' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '사용자' }))

    expect(
      screen.getByRole('link', { name: '전체 사용자' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '주문' }))

    // opening 주문 closes 사용자 (accordion behavior)
    expect(screen.getByRole('link', { name: '전체 주문' })).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: '전체 사용자' }),
    ).not.toBeInTheDocument()
  })

  it('renders the footer with NavUser and the language toggle', async () => {
    renderSidebar('/')

    expect(await screen.findByText('관리자')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /theme mode/i }),
    ).not.toBeInTheDocument()
  })
})
