import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { RowActions } from './row-actions'
import { useLocaleStore } from '@/i18n/locale-store'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('RowActions', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    vi.clearAllMocks()
  })

  it('opens the dropdown menu with 보기/수정/삭제 items', async () => {
    const user = userEvent.setup()
    render(<RowActions label="상품 A" />)

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))

    expect(screen.getByRole('menuitem', { name: '보기' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '수정' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: '삭제' })).toBeInTheDocument()
  })

  it('edits and saves via the dialog, toasting success and closing', async () => {
    const user = userEvent.setup()
    render(<RowActions label="상품 A" />)

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))
    await user.click(screen.getByRole('menuitem', { name: '수정' }))

    const input = await screen.findByLabelText('이름')
    expect(input).toHaveValue('상품 A')

    await user.clear(input)
    await user.type(input, '상품 B')
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(toast.success).toHaveBeenCalledWith('상품 B(으)로 수정됐어요.')

    // 다이얼로그가 닫혀야 한다
    expect(screen.queryByLabelText('이름')).not.toBeInTheDocument()
  })

  it('confirms delete via the alert dialog and toasts success', async () => {
    const user = userEvent.setup()
    render(<RowActions label="상품 A" />)

    await user.click(screen.getByRole('button', { name: /상품 A 작업 열기/ }))
    await user.click(screen.getByRole('menuitem', { name: '삭제' }))

    expect(
      await screen.findByText('상품 A을(를) 삭제할까요?'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(toast.success).toHaveBeenCalledWith('상품 A 삭제됐어요.')
  })
})
