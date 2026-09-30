import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { OrderItem } from '@/config/orders'

const MOCK_ORDERS: Array<OrderItem> = [
  {
    id: 'ORD-2001',
    customer: '김민지',
    amount: '12,000원',
    status: '배송중',
    date: '2026-09-01',
  },
  {
    id: 'ORD-2002',
    customer: '이서준',
    amount: '24,000원',
    status: '완료',
    date: '2026-09-02',
  },
  {
    id: 'ORD-2003',
    customer: '박지훈',
    amount: '36,000원',
    status: '취소',
    date: '2026-09-03',
  },
]

vi.mock('@/server/orders', () => ({
  ordersQueryOptions: () => ({
    queryKey: ['orders'],
    queryFn: async () => MOCK_ORDERS,
  }),
}))

const { Route } = await import('@/routes/orders')
const Orders = Route.options.component as () => React.ReactElement

const t = messages.ko

describe('Orders route', () => {
  it('renders columns and rows for every mocked order', async () => {
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    expect(
      screen.getByRole('columnheader', { name: t.orders.columns.id }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.orders.columns.customer }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.orders.columns.amount }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.orders.columns.status }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.orders.columns.date }),
    ).toBeInTheDocument()

    for (const order of MOCK_ORDERS) {
      expect(screen.getByText(order.id)).toBeInTheDocument()
      expect(screen.getByText(order.customer)).toBeInTheDocument()
    }
  })

  it('renders pagination and row actions per row', async () => {
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    expect(screen.getByText(t.common.totalCount(3))).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /작업 열기/ })).toHaveLength(
      MOCK_ORDERS.length,
    )
  })

  it('filters rows by order id or customer via the search input', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    const search = screen.getByPlaceholderText(t.orders.searchPlaceholder)
    await user.type(search, '이서준')

    expect(screen.queryByText('ORD-2001')).not.toBeInTheDocument()
    expect(screen.getByText('ORD-2002')).toBeInTheDocument()
    expect(screen.queryByText('ORD-2003')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches the search query', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    const search = screen.getByPlaceholderText(t.orders.searchPlaceholder)
    await user.type(search, '존재하지않는검색어')

    expect(await screen.findByText(t.common.noResults)).toBeInTheDocument()
  })
})
