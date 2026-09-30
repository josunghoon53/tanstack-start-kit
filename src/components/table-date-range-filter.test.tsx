import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TableDateRangeFilter } from './table-date-range-filter'

describe('TableDateRangeFilter', () => {
  it('shows the placeholder when no range is selected', () => {
    render(
      <TableDateRangeFilter
        value={undefined}
        onChange={vi.fn()}
        placeholder="날짜 범위"
      />,
    )

    expect(
      screen.getByRole('button', { name: /날짜 범위/ }),
    ).toBeInTheDocument()
  })

  it('shows a single formatted date when only `from` is selected', () => {
    render(
      <TableDateRangeFilter
        value={{ from: new Date(2026, 8, 21), to: undefined }}
        onChange={vi.fn()}
        placeholder="날짜 범위"
      />,
    )

    expect(screen.getByRole('button', { name: /Sep 21/ })).toBeInTheDocument()
  })

  it('shows a formatted range when both `from` and `to` are selected', () => {
    render(
      <TableDateRangeFilter
        value={{ from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }}
        onChange={vi.fn()}
        placeholder="날짜 범위"
      />,
    )

    expect(
      screen.getByRole('button', { name: /Sep 10.*Sep 20/ }),
    ).toBeInTheDocument()
  })
})
