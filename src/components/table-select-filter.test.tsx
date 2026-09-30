import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TABLE_FILTER_ALL, TableSelectFilter } from './table-select-filter'

describe('TableSelectFilter', () => {
  it('renders the all option plus every given option', async () => {
    const user = userEvent.setup()
    render(
      <TableSelectFilter
        ariaLabel="상태"
        value={TABLE_FILTER_ALL}
        onChange={vi.fn()}
        allLabel="전체"
        options={[
          { label: '완료', value: '완료' },
          { label: '취소', value: '취소' },
        ]}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: '상태' }))

    expect(screen.getByRole('option', { name: '전체' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '완료' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '취소' })).toBeInTheDocument()
  })

  it('calls onChange with the selected option value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TableSelectFilter
        ariaLabel="상태"
        value={TABLE_FILTER_ALL}
        onChange={onChange}
        allLabel="전체"
        options={[{ label: '완료', value: '완료' }]}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: '상태' }))
    await user.click(screen.getByRole('option', { name: '완료' }))

    expect(onChange).toHaveBeenCalledWith('완료')
  })
})
