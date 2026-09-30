import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TablePagination } from './table-pagination'
import { useLocaleStore } from '@/i18n/locale-store'

describe('TablePagination', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
  })

  it('shows the total count text', () => {
    render(
      <TablePagination
        page={1}
        totalPages={3}
        totalCount={42}
        onPageChange={() => {}}
      />,
    )

    expect(screen.getByText('총 42건')).toBeInTheDocument()
  })

  it('disables the prev button when on the first page', () => {
    render(
      <TablePagination
        page={1}
        totalPages={3}
        totalCount={42}
        onPageChange={() => {}}
      />,
    )

    const [prevButton, nextButton] = screen.getAllByRole('button')
    expect(prevButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()
  })

  it('disables the next button when on the last page', () => {
    render(
      <TablePagination
        page={3}
        totalPages={3}
        totalCount={42}
        onPageChange={() => {}}
      />,
    )

    const [prevButton, nextButton] = screen.getAllByRole('button')
    expect(prevButton).not.toBeDisabled()
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange with page - 1 / page + 1 on prev/next click', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <TablePagination
        page={2}
        totalPages={3}
        totalCount={42}
        onPageChange={onPageChange}
      />,
    )

    const [prevButton, nextButton] = screen.getAllByRole('button')
    await user.click(prevButton)
    expect(onPageChange).toHaveBeenCalledWith(1)

    await user.click(nextButton)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
