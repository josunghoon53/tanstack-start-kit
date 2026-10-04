import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { Route } from './settings'
import { useLocaleStore } from '@/i18n/locale-store'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const Settings = Route.options.component as () => ReactElement

describe('Settings route', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    vi.clearAllMocks()
  })

  it('defaults to the 일반 tab showing the general form fields', () => {
    render(<Settings />)

    expect(screen.getByLabelText('사이트 이름')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일 알림')).toBeInTheDocument()
    expect(screen.getByLabelText('점검 모드')).toBeInTheDocument()
  })

  it('submits the general form with a valid site name and toasts success', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    const siteNameInput = screen.getByLabelText('사이트 이름')
    await user.clear(siteNameInput)
    await user.type(siteNameInput, 'My Cool Admin')

    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(toast.success).toHaveBeenCalledWith('일반 설정이 저장됐어요.')
  })

  it('shows a validation error and does not toast when the site name is blank', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    const siteNameInput = screen.getByLabelText('사이트 이름')
    await user.clear(siteNameInput)
    await user.type(siteNameInput, '   ')

    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(
      await screen.findByText('사이트 이름을 입력해주세요.'),
    ).toBeInTheDocument()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('renders the style and color pickers under the 테마 tab', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole('button', { name: '테마' }))

    for (const name of ['Clean', 'Soft', 'Editorial', 'Crisp']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`^${name}`) }),
      ).toBeInTheDocument()
    }
    for (const label of ['무채색', '블루', '그린', '퍼플', '로즈', '오렌지']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('shows a mismatch error and does not toast when passwords differ, under 보안 tab', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole('button', { name: '보안' }))

    await user.type(screen.getByLabelText('현재 비밀번호'), 'currentpass')
    await user.type(screen.getByLabelText('새 비밀번호'), 'newpassword1')
    await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newpassword2')

    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }))

    expect(
      await screen.findByText('새 비밀번호가 일치하지 않아요.'),
    ).toBeInTheDocument()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('toasts success when passwords match and are long enough, under 보안 탭', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole('button', { name: '보안' }))

    await user.type(screen.getByLabelText('현재 비밀번호'), 'currentpass')
    await user.type(screen.getByLabelText('새 비밀번호'), 'newpassword1')
    await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newpassword1')

    await user.click(screen.getByRole('button', { name: '비밀번호 변경' }))

    expect(toast.success).toHaveBeenCalledWith('비밀번호가 변경됐어요.')
  })
})
