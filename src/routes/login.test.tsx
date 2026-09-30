import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Route } from './login'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'
import { loginFn } from '@/server/auth'

vi.mock('@/server/auth', () => ({
  loginFn: vi.fn(),
  logoutFn: vi.fn(),
}))

const LoginComponent = Route.options.component as React.ComponentType

describe('Login', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    vi.mocked(loginFn).mockReset()
  })

  function renderLogin() {
    return renderWithRouter(<LoginComponent />, {
      initialPath: '/login',
      extraPaths: ['/'],
    })
  }

  it('shows validation messages for empty input and does not call loginFn', async () => {
    const user = userEvent.setup()
    renderLogin()

    // TanStack Router resolves the route match asynchronously, so the first
    // paint is empty — wait for the submit button before interacting.
    await user.click(await screen.findByRole('button', { name: '로그인' }))

    expect(
      await screen.findByText('이메일을 입력해주세요.'),
    ).toBeInTheDocument()
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument()
    expect(loginFn).not.toHaveBeenCalled()
  })

  it('shows an invalid email message for malformed email and does not call loginFn', async () => {
    const user = userEvent.setup()
    const { container } = renderLogin()

    await user.type(await screen.findByLabelText('이메일'), 'not-an-email')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    // The email input is `type="email"`, so a real click on the submit button
    // would trigger the browser's native HTML5 constraint validation first,
    // which blocks the `submit` event (and thus RHF/zod) from ever running.
    // Dispatching `submit` directly bypasses that native check, the same way
    // it would if the browser allowed the mismatched-value case through.
    fireEvent.submit(container.querySelector('form')!)

    expect(
      await screen.findByText('올바른 이메일 형식이 아니에요.'),
    ).toBeInTheDocument()
    expect(loginFn).not.toHaveBeenCalled()
  })

  it('submits valid input and calls loginFn with the entered credentials', async () => {
    const user = userEvent.setup()
    vi.mocked(loginFn).mockResolvedValue({ ok: true })
    renderLogin()

    await user.type(await screen.findByLabelText('이메일'), 'admin@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(loginFn).toHaveBeenCalledWith({
      data: { email: 'admin@example.com', password: 'password123' },
    })
  })

  it('shows the server error message when loginFn resolves with ok: false', async () => {
    const user = userEvent.setup()
    vi.mocked(loginFn).mockResolvedValue({
      ok: false,
      error: '이메일 또는 비밀번호가 올바르지 않아요.',
    })
    renderLogin()

    await user.type(await screen.findByLabelText('이메일'), 'admin@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    expect(
      await screen.findByText('이메일 또는 비밀번호가 올바르지 않아요.'),
    ).toBeInTheDocument()
  })
})
