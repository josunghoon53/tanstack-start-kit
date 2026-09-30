import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TableBulkActionsBar } from './table-bulk-actions-bar'
import { useLocaleStore } from '@/i18n/locale-store'

describe('TableBulkActionsBar', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('renders nothing when count is 0', () => {
    const { container } = render(
      <TableBulkActionsBar count={0} onClear={vi.fn()}>
        <button>action</button>
      </TableBulkActionsBar>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the selected count and the given action buttons', () => {
    render(
      <TableBulkActionsBar count={3} onClear={vi.fn()}>
        <button>내보내기</button>
      </TableBulkActionsBar>,
    )

    expect(screen.getByText('3개 선택됨')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '내보내기' })).toBeInTheDocument()
  })

  it('calls onClear when the clear-selection button is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <TableBulkActionsBar count={2} onClear={onClear}>
        <button>action</button>
      </TableBulkActionsBar>,
    )

    await user.click(screen.getByRole('button', { name: '선택 해제' }))

    expect(onClear).toHaveBeenCalled()
  })
})
