import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AnimatedTableBody, AnimatedTableRow } from './animated-table-row'
import { Table, TableCell } from '@/components/ui/table'
import { MotionProvider } from '@/lib/motion'

function List({
  items,
  onRowClick = () => {},
}: {
  items: Array<string>
  onRowClick?: (item: string) => void
}) {
  return (
    <MotionProvider>
      <Table>
        <AnimatedTableBody layoutKey={items.join('|')}>
          {items.map((item) => (
            <AnimatedTableRow
              key={item}
              className="cursor-pointer"
              onClick={() => onRowClick(item)}
            >
              <TableCell>{item}</TableCell>
            </AnimatedTableRow>
          ))}
        </AnimatedTableBody>
      </Table>
    </MotionProvider>
  )
}

function rowTexts() {
  const body = screen.getAllByRole('rowgroup')[0]
  return within(body)
    .getAllByRole('row')
    .map((row) => row.textContent)
}

describe('AnimatedTableBody / AnimatedTableRow', () => {
  it('keeps table semantics, row props and click handlers', async () => {
    const onRowClick = vi.fn()
    render(<List items={['A', 'B', 'C']} onRowClick={onRowClick} />)

    expect(rowTexts()).toEqual(['A', 'B', 'C'])
    const row = screen.getByText('B').closest('tr')
    expect(row).toHaveAttribute('data-slot', 'table-row')
    expect(row).toHaveClass('cursor-pointer')
    // 처음 렌더(initial={false})에서는 행이 투명하게 시작하지 않는다.
    expect(row).not.toHaveStyle({ opacity: '0' })

    await userEvent.click(screen.getByText('B'))
    expect(onRowClick).toHaveBeenCalledWith('B')
  })

  it('reorders, adds and removes rows when the list changes', async () => {
    const { rerender } = render(<List items={['A', 'B', 'C']} />)

    rerender(<List items={['C', 'A', 'D']} />)

    // 빠지는 행(B)은 exit 애니메이션 뒤에 사라진다 — 테스트에서는 skipAnimations라 바로 끝난다.
    await waitFor(() => expect(rowTexts()).toEqual(['C', 'A', 'D']))
  })
})
