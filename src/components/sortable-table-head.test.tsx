import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SortableTableHead } from './sortable-table-head'
import { Table, TableBody, TableRow } from '@/components/ui/table'

function renderHead(props: Partial<Parameters<typeof SortableTableHead>[0]>) {
  return render(
    <Table>
      <TableBody>
        <TableRow>
          <SortableTableHead
            sortKey="name"
            activeKey={undefined}
            direction="asc"
            onSort={vi.fn()}
            {...props}
          >
            이름
          </SortableTableHead>
        </TableRow>
      </TableBody>
    </Table>,
  )
}

describe('SortableTableHead', () => {
  it('calls onSort with its own key when clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    renderHead({ onSort })

    await user.click(screen.getByRole('button', { name: /이름/ }))

    expect(onSort).toHaveBeenCalledWith('name')
  })

  it('renders the label regardless of active state', () => {
    renderHead({ activeKey: 'name', direction: 'desc' })
    expect(screen.getByText('이름')).toBeInTheDocument()
  })
})
