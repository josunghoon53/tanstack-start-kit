import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { OrderItem } from '@/config/orders'
import type { NotificationItem } from '@/config/notifications'

const MOCK_ORDERS: Array<OrderItem> = [
  {
    id: 'ORD-4001',
    customer: '김민지',
    amount: '12,000원',
    status: '배송중',
    date: '2026-09-01',
  },
  {
    id: 'ORD-4002',
    customer: '이서준',
    amount: '24,000원',
    status: '완료',
    date: '2026-09-02',
  },
  {
    id: 'ORD-4003',
    customer: '박지훈',
    amount: '36,000원',
    status: '완료',
    date: '2026-09-03',
  },
  {
    id: 'ORD-4004',
    customer: '최유나',
    amount: '48,000원',
    status: '취소',
    date: '2026-09-04',
  },
  {
    id: 'ORD-4005',
    customer: '한지민',
    amount: '60,000원',
    status: '배송중',
    date: '2026-09-05',
  },
]

const MOCK_NOTIFICATIONS: Array<NotificationItem> = [
  {
    iconKey: 'signup',
    category: '가입',
    message: '테스트유저1 님이 새로 가입했어요.',
    time: '5분 전',
  },
  {
    iconKey: 'order',
    category: '주문',
    message: 'ORD-4001 주문이 배송을 시작했어요.',
    time: '10분 전',
  },
  {
    iconKey: 'payment',
    category: '결제',
    message: 'PAY-9001 결제가 완료됐어요.',
    time: '1시간 전',
  },
  {
    iconKey: 'stock',
    category: '재고',
    message: '무선 마우스 재고가 소진됐어요.',
    time: '2시간 전',
  },
  {
    iconKey: 'signup',
    category: '가입',
    message: '테스트유저2 님이 새로 가입했어요.',
    time: '3시간 전',
  },
]

vi.mock('@/server/orders', () => ({
  ordersQueryOptions: () => ({
    queryKey: ['orders'],
    queryFn: async () => MOCK_ORDERS,
  }),
}))

vi.mock('@/server/notifications', () => ({
  notificationsQueryOptions: () => ({
    queryKey: ['notifications'],
    queryFn: async () => MOCK_NOTIFICATIONS,
  }),
}))

const { Route } = await import('@/routes/index')
const Dashboard = Route.options.component as () => React.ReactElement

const t = messages.ko

describe('Dashboard route', () => {
  it('renders the 4 stat cards with their labels', async () => {
    renderWithRouter(<Dashboard />, { extraPaths: ['/orders'] })

    await screen.findByText('ORD-4001')

    expect(
      screen.getByText(t.dashboard.stats.todayRevenue.label),
    ).toBeInTheDocument()
    expect(
      screen.getByText(t.dashboard.stats.newOrders.label),
    ).toBeInTheDocument()
    expect(
      screen.getByText(t.dashboard.stats.newUsers.label),
    ).toBeInTheDocument()
    expect(
      screen.getByText(t.dashboard.stats.unreadNotifications.label),
    ).toBeInTheDocument()
  })

  it('reflects the mocked notification count in the unread-notifications stat', async () => {
    renderWithRouter(<Dashboard />, { extraPaths: ['/orders'] })

    await screen.findByText('ORD-4001')

    expect(
      screen.getByText(t.dashboard.unreadCount(MOCK_NOTIFICATIONS.length)),
    ).toBeInTheDocument()
  })

  it('shows up to 4 recent orders with a link to the full orders page', async () => {
    renderWithRouter(<Dashboard />, { extraPaths: ['/orders'] })

    await screen.findByText('ORD-4001')

    expect(screen.getByText('ORD-4001')).toBeInTheDocument()
    expect(screen.getByText('ORD-4002')).toBeInTheDocument()
    expect(screen.getByText('ORD-4003')).toBeInTheDocument()
    expect(screen.getByText('ORD-4004')).toBeInTheDocument()
    expect(screen.queryByText('ORD-4005')).not.toBeInTheDocument()

    const viewAllLink = screen.getByRole('link', {
      name: t.dashboard.recentOrders.viewAll,
    })
    expect(viewAllLink).toHaveAttribute('href', '/orders')
  })

  it('shows up to 4 recent notifications', async () => {
    renderWithRouter(<Dashboard />, { extraPaths: ['/orders'] })

    await screen.findByText('ORD-4001')

    expect(
      screen.getByText('테스트유저1 님이 새로 가입했어요.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('ORD-4001 주문이 배송을 시작했어요.'),
    ).toBeInTheDocument()
    expect(screen.getByText('PAY-9001 결제가 완료됐어요.')).toBeInTheDocument()
    expect(
      screen.getByText('무선 마우스 재고가 소진됐어요.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('테스트유저2 님이 새로 가입했어요.'),
    ).not.toBeInTheDocument()
  })
})
