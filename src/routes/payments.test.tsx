import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { downloadCsv, toCsv } from '@/lib/csv'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import type { PaymentItem } from '@/config/payments'

vi.mock('@/lib/csv', () => ({
  toCsv: vi.fn(() => 'mock-csv'),
  downloadCsv: vi.fn(),
}))

const MOCK_PAYMENTS: Array<PaymentItem> = [
  {
    id: 'PAY-3001',
    status: '결제완료',
    approvedAt: '2026-09-27 09:00:00',
    orderNo: 'ORD-3001',
    pg: 'KG이니시스',
    orderName: '프로 플랜 월 정기구독',
    customer: '한지민',
    method: '카드결제',
    amount: 29000,
  },
  {
    id: 'PAY-3002',
    status: '결제취소',
    approvedAt: '2026-09-27 08:00:00',
    orderNo: 'ORD-3002',
    pg: '토스페이먼츠',
    orderName: '스타터 플랜 연간 구독',
    customer: '오세훈',
    method: '계좌이체',
    amount: 168000,
  },
  {
    id: 'PAY-3003',
    status: '결제실패',
    approvedAt: '2026-09-26 21:00:00',
    orderNo: 'ORD-3003',
    pg: 'KG이니시스',
    orderName: '엔터프라이즈 플랜 월 정기구독',
    customer: '문수아',
    method: '카드결제',
    amount: 129000,
  },
]

vi.mock('@/server/payments', () => ({
  paymentsQueryOptions: () => ({
    queryKey: ['payments'],
    queryFn: async () => MOCK_PAYMENTS,
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const { Route } = await import('@/routes/payments')
const Payments = Route.options.component as () => React.ReactElement

const t = messages.ko

describe('Payments route', () => {
  it('renders columns and rows for every mocked payment', async () => {
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    expect(
      screen.getByRole('columnheader', { name: t.payments.columns.status }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', {
        name: t.payments.columns.approvedAt,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.payments.columns.orderNo }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.payments.columns.pg }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', {
        name: t.payments.columns.orderName,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.payments.columns.customer }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.payments.columns.method }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: t.payments.columns.amount }),
    ).toBeInTheDocument()

    for (const payment of MOCK_PAYMENTS) {
      expect(screen.getByText(payment.orderNo)).toBeInTheDocument()
      expect(screen.getByText(payment.customer)).toBeInTheDocument()
      expect(screen.getByText(payment.orderName)).toBeInTheDocument()
    }
  })

  it('filters rows by order no., customer, or order name via search', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    const search = screen.getByPlaceholderText(t.payments.searchPlaceholder)
    await user.type(search, '오세훈')

    expect(screen.queryByText('ORD-3001')).not.toBeInTheDocument()
    expect(screen.getByText('ORD-3002')).toBeInTheDocument()
    expect(screen.queryByText('ORD-3003')).not.toBeInTheDocument()
  })

  it('shows the empty state when nothing matches the search query', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    const search = screen.getByPlaceholderText(t.payments.searchPlaceholder)
    await user.type(search, '존재하지않는검색어')

    expect(await screen.findByText(t.common.noResults)).toBeInTheDocument()
  })

  it('filters rows by status via the status select', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    await user.click(
      screen.getByRole('combobox', { name: t.payments.columns.status }),
    )
    await user.click(await screen.findByRole('option', { name: '결제취소' }))

    expect(screen.queryByText('ORD-3001')).not.toBeInTheDocument()
    expect(screen.getByText('ORD-3002')).toBeInTheDocument()
    expect(screen.queryByText('ORD-3003')).not.toBeInTheDocument()
  })

  it('enables the cancel button only for completed payments', async () => {
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    const cancelButtons = screen.getAllByRole('button', {
      name: t.payments.cancelAction.button,
    })
    expect(cancelButtons).toHaveLength(MOCK_PAYMENTS.length)
    expect(cancelButtons[0]).toBeEnabled() // 결제완료
    expect(cancelButtons[1]).toBeDisabled() // 결제취소
    expect(cancelButtons[2]).toBeDisabled() // 결제실패
  })

  it('opens the confirmation dialog and toasts success when a completed payment is canceled', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    const [completedCancelButton] = screen.getAllByRole('button', {
      name: t.payments.cancelAction.button,
    })
    await user.click(completedCancelButton)

    expect(
      await screen.findByText(t.payments.cancelAction.dialogTitle),
    ).toBeInTheDocument()

    const confirmButton = screen.getByRole('button', {
      name: t.payments.cancelAction.confirmButton,
    })
    await user.click(confirmButton)

    expect(toast.success).toHaveBeenCalledWith(
      t.payments.cancelAction.successToast(MOCK_PAYMENTS[0].orderName),
    )
  })

  it('sorts rows by a sortable column header', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    await user.click(
      screen.getByRole('button', { name: t.payments.columns.orderNo }),
    )

    expect(
      screen.getAllByText(/^ORD-\d{4}$/).map((el) => el.textContent),
    ).toEqual(['ORD-3001', 'ORD-3002', 'ORD-3003'])
  })

  it('selects rows via checkboxes, bulk-deletes them, and does not affect the per-row cancel dialog', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectRow('ORD-3001') }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: t.common.selectRow('ORD-3002') }),
    )
    expect(screen.getByText(t.common.selectedCount(2))).toBeInTheDocument()

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

    // 벌크 삭제 확인 다이얼로그가 결제 취소용 AlertDialog와 상태를 공유하지
    // 않아야 한다 — 취소 버튼들은 여전히 정상 동작해야 한다.
    const cancelButtons = screen.getAllByRole('button', {
      name: t.payments.cancelAction.button,
    })
    expect(cancelButtons[0]).toBeEnabled()
  })

  it('exports all filtered rows as CSV via the toolbar export button', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<Payments />)

    await screen.findByText('ORD-3001')

    await user.click(screen.getByRole('button', { name: t.common.exportCsv }))

    expect(toCsv).toHaveBeenCalledWith(MOCK_PAYMENTS, expect.any(Array))
    expect(downloadCsv).toHaveBeenCalledWith('payments.csv', 'mock-csv')
  })
})
