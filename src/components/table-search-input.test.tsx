import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { TableSearchInput } from './table-search-input'

function ControlledHarness({
  onChange,
}: {
  onChange: (value: string) => void
}) {
  const [value, setValue] = useState('')
  return (
    <TableSearchInput
      value={value}
      placeholder="검색"
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe('TableSearchInput', () => {
  it('renders with the given placeholder', () => {
    render(
      <TableSearchInput
        value=""
        placeholder="검색어를 입력하세요"
        onChange={() => {}}
      />,
    )

    expect(
      screen.getByPlaceholderText('검색어를 입력하세요'),
    ).toBeInTheDocument()
  })

  it('calls onChange with the new value as the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ControlledHarness onChange={onChange} />)

    await user.type(screen.getByPlaceholderText('검색'), 'abc')

    expect(onChange).toHaveBeenCalledWith('a')
    expect(onChange).toHaveBeenCalledWith('ab')
    expect(onChange).toHaveBeenCalledWith('abc')
    expect(screen.getByPlaceholderText('검색')).toHaveValue('abc')
  })
})
