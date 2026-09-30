import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { downloadCsv, toCsv } from '@/lib/csv'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { OrderItem } from '@/config/orders'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/csv', () => ({
  toCsv: vi.fn(() => 'mock-csv'),
  downloadCsv: vi.fn(),
}))

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

  it('expands a row on click to show a duplicate detail panel, and collapses it again', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    // 컬럼 자체에 고객명이 항상 보이므로, 펼쳤을 때 상세 패널에 한 번 더
    // 렌더링돼서 총 2번(행 셀 + 상세 패널)이 되는지로 검증한다.
    expect(screen.getAllByText('김민지')).toHaveLength(1)

    await user.click(screen.getByText('ORD-2001'))

    expect(screen.getAllByText('김민지')).toHaveLength(2)
    expect(screen.getAllByText('12,000원')).toHaveLength(2)

    await user.click(screen.getByText('ORD-2001'))

    expect(screen.getAllByText('김민지')).toHaveLength(1)
  })

  it('only keeps one row expanded at a time (accordion)', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(screen.getByText('ORD-2001'))
    expect(screen.getAllByText('김민지')).toHaveLength(2)
    expect(screen.getAllByText('이서준')).toHaveLength(1)

    await user.click(screen.getByText('ORD-2002'))
    expect(screen.getAllByText('김민지')).toHaveLength(1)
    expect(screen.getAllByText('이서준')).toHaveLength(2)
  })

  it('does not toggle the row when clicking the row actions menu', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    const [firstRowActions] = screen.getAllByRole('button', {
      name: /작업 열기/,
    })
    await user.click(firstRowActions)

    expect(screen.getAllByText('김민지')).toHaveLength(1)
  })

  it('filters rows by status via the status select, combined with search', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(
      screen.getByRole('combobox', { name: t.orders.columns.status }),
    )
    await user.click(await screen.findByRole('option', { name: '완료' }))

    expect(screen.queryByText('ORD-2001')).not.toBeInTheDocument()
    expect(screen.getByText('ORD-2002')).toBeInTheDocument()
    expect(screen.queryByText('ORD-2003')).not.toBeInTheDocument()

    // 검색어가 비어있어도 상태 필터가 계속 적용돼야 한다 (usePaginatedSearch가
    // 빈 검색어일 때 matchesQuery를 건너뛰지 않아야 하는 회귀 지점).
    const search = screen.getByPlaceholderText(t.orders.searchPlaceholder)
    await user.type(search, '이서준')
    await user.clear(search)

    expect(screen.queryByText('ORD-2001')).not.toBeInTheDocument()
    expect(screen.getByText('ORD-2002')).toBeInTheDocument()

    await user.click(
      screen.getByRole('combobox', { name: t.orders.columns.status }),
    )
    await user.click(await screen.findByRole('option', { name: t.common.all }))

    expect(screen.getByText('ORD-2001')).toBeInTheDocument()
    expect(screen.getByText('ORD-2003')).toBeInTheDocument()
  })

  it('sorts rows by column when a sortable header is clicked, toggling asc/desc', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    const idHeader = screen.getByRole('button', { name: t.orders.columns.id })

    await user.click(idHeader)
    expect(
      screen.getAllByText(/^ORD-\d{4}$/).map((el) => el.textContent),
    ).toEqual(['ORD-2001', 'ORD-2002', 'ORD-2003'])

    await user.click(idHeader)
    expect(
      screen.getAllByText(/^ORD-\d{4}$/).map((el) => el.textContent),
    ).toEqual(['ORD-2003', 'ORD-2002', 'ORD-2001'])
  })

  it('selects a row via its checkbox, shows the bulk actions bar, and clears it', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectRow('ORD-2001') }),
    )

    expect(screen.getByText(t.common.selectedCount(1))).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: t.common.clearSelection }),
    )

    expect(
      screen.queryByText(t.common.selectedCount(1)),
    ).not.toBeInTheDocument()
  })

  it('selects every row on the page via the header checkbox', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectAllRows }),
    )

    expect(
      screen.getByText(t.common.selectedCount(MOCK_ORDERS.length)),
    ).toBeInTheDocument()
  })

  it('confirms bulk delete, toasts success with the count, and clears the selection', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectRow('ORD-2001') }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectRow('ORD-2002') }),
    )

    await user.click(
      screen.getByRole('button', { name: t.common.deleteSelected }),
    )

    expect(
      await screen.findByText(t.common.deleteSelectedTitle(2)),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: t.common.delete }))

    expect(toast.success).toHaveBeenCalledWith(t.common.deleteSelectedToast(2))
    expect(
      screen.queryByText(t.common.selectedCount(2)),
    ).not.toBeInTheDocument()
  })

  it('exports all filtered rows as CSV via the toolbar export button', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(screen.getByRole('button', { name: t.common.exportCsv }))

    expect(toCsv).toHaveBeenCalledWith(MOCK_ORDERS, expect.any(Array))
    expect(downloadCsv).toHaveBeenCalledWith('orders.csv', 'mock-csv')
  })

  it('exports only the selected rows via the bulk actions export button', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Orders />)

    await screen.findByText('ORD-2001')

    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectRow('ORD-2002') }),
    )

    // 하나라도 선택되면 툴바의 기본 내보내기 버튼은 사라지고, 선택 항목용
    // 내보내기 버튼 하나만 남는다.
    await user.click(screen.getByRole('button', { name: t.common.exportCsv }))

    expect(toCsv).toHaveBeenCalledWith([MOCK_ORDERS[1]], expect.any(Array))
  })
})
