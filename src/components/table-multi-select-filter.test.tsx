import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TableMultiSelectFilter } from './table-multi-select-filter'

const OPTIONS = [
  { label: '전자기기', value: '전자기기' },
  { label: '리빙', value: '리빙' },
  { label: '뷰티', value: '뷰티' },
]

describe('TableMultiSelectFilter', () => {
  it('shows no count badge when nothing is selected', () => {
    render(
      <TableMultiSelectFilter
        label="카테고리"
        options={OPTIONS}
        selected={[]}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '카테고리' })).toBeInTheDocument()
  })

  it('shows a count badge reflecting the number of selected options', () => {
    render(
      <TableMultiSelectFilter
        label="카테고리"
        options={OPTIONS}
        selected={['전자기기', '리빙']}
        onChange={vi.fn()}
      />,
    )

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('adds a value to the selection when its checkbox is checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TableMultiSelectFilter
        label="카테고리"
        options={OPTIONS}
        selected={['전자기기']}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /카테고리/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: '리빙' }))

    expect(onChange).toHaveBeenCalledWith(['전자기기', '리빙'])
  })

  it('removes a value from the selection when its checkbox is unchecked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <TableMultiSelectFilter
        label="카테고리"
        options={OPTIONS}
        selected={['전자기기', '리빙']}
        onChange={onChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /카테고리/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: '전자기기' }))

    expect(onChange).toHaveBeenCalledWith(['리빙'])
  })
})
