import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import { useLocaleStore } from '@/i18n/locale-store'
import type { LlmAccount, LlmLoginState } from '@/config/llm-runner'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mocks = vi.hoisted(
  (): {
    account: LlmAccount
    loginState: LlmLoginState
    startLlmLoginFn: ReturnType<typeof vi.fn>
    submitLlmLoginCodeFn: ReturnType<typeof vi.fn>
    cancelLlmLoginFn: ReturnType<typeof vi.fn>
    logoutLlmFn: ReturnType<typeof vi.fn>
  } => ({
    account: { available: false },
    loginState: 'pending',
    startLlmLoginFn: vi.fn(),
    submitLlmLoginCodeFn: vi.fn(),
    cancelLlmLoginFn: vi.fn(),
    logoutLlmFn: vi.fn(),
  }),
)

vi.mock('@/server/llm-runner', () => ({
  startLlmLoginFn: mocks.startLlmLoginFn,
  submitLlmLoginCodeFn: mocks.submitLlmLoginCodeFn,
  cancelLlmLoginFn: mocks.cancelLlmLoginFn,
  logoutLlmFn: mocks.logoutLlmFn,
  llmAccountQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'account', provider],
    queryFn: async () => mocks.account,
  }),
  llmLoginStateQueryOptions: (provider: string) => ({
    queryKey: ['llm-login-state', provider],
    queryFn: async () => ({ state: mocks.loginState }),
    staleTime: 0,
    gcTime: 0,
  }),
}))

const { LlmAccountControls } = await import('./llm-account-controls')

const t = messages.ko.llmRunner.accountControl

describe('LlmAccountControls', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    mocks.account = { available: false }
    mocks.loginState = 'pending'
    mocks.startLlmLoginFn.mockReset()
    mocks.submitLlmLoginCodeFn.mockReset()
    mocks.cancelLlmLoginFn.mockReset().mockResolvedValue({ ok: true })
    mocks.logoutLlmFn.mockReset()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
    vi.spyOn(window, 'open').mockReturnValue(null)
  })

  it('offers login (no logout) when the app account is not logged in', async () => {
    renderWithQueryClient(<LlmAccountControls provider="claude-subscription" />)

    expect(
      await screen.findByRole('button', { name: t.login }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: t.logout }),
    ).not.toBeInTheDocument()
  })

  it('offers change and logout when already logged in', async () => {
    mocks.account = { available: true, email: 'me@example.com' }
    renderWithQueryClient(<LlmAccountControls provider="claude-subscription" />)

    expect(
      await screen.findByRole('button', { name: t.change }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.logout })).toBeInTheDocument()
  })

  it('starts a Claude login, opens the URL and submits the pasted code', async () => {
    mocks.startLlmLoginFn.mockResolvedValue({
      authUrl: 'https://claude.example/auth',
      needsCode: true,
    })
    mocks.submitLlmLoginCodeFn.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmAccountControls provider="claude-subscription" />)

    await user.click(await screen.findByRole('button', { name: t.login }))

    expect(mocks.startLlmLoginFn).toHaveBeenCalledWith({
      data: { provider: 'claude-subscription' },
    })
    expect(
      await screen.findByRole('link', { name: t.openBrowser }),
    ).toHaveAttribute('href', 'https://claude.example/auth')
    expect(window.open).toHaveBeenCalledWith(
      'https://claude.example/auth',
      '_blank',
      'noopener,noreferrer',
    )

    await user.type(screen.getByLabelText(t.codeLabel), 'abc-123')
    await user.click(screen.getByRole('button', { name: t.submitCode }))

    expect(mocks.submitLlmLoginCodeFn).toHaveBeenCalledWith({
      data: { provider: 'claude-subscription', code: 'abc-123' },
    })
  })

  it('does not ask for a code for Codex, which only needs browser approval', async () => {
    mocks.startLlmLoginFn.mockResolvedValue({
      authUrl: 'https://codex.example/auth',
      needsCode: false,
    })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmAccountControls provider="openai-subscription" />)

    await user.click(await screen.findByRole('button', { name: t.login }))

    await screen.findByRole('link', { name: t.openBrowser })
    expect(screen.queryByLabelText(t.codeLabel)).not.toBeInTheDocument()
  })

  it('closes the dialog and toasts when the server reports success', async () => {
    mocks.startLlmLoginFn.mockResolvedValue({
      authUrl: 'https://claude.example/auth',
      needsCode: true,
    })
    mocks.loginState = 'success'
    const user = userEvent.setup()
    renderWithQueryClient(<LlmAccountControls provider="claude-subscription" />)

    await user.click(await screen.findByRole('button', { name: t.login }))

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(t.loginSuccess),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a retry option when the login fails', async () => {
    mocks.startLlmLoginFn.mockResolvedValue({
      authUrl: 'https://claude.example/auth',
      needsCode: true,
    })
    mocks.loginState = 'failed'
    const user = userEvent.setup()
    renderWithQueryClient(<LlmAccountControls provider="claude-subscription" />)

    await user.click(await screen.findByRole('button', { name: t.login }))

    expect(await screen.findByText(t.loginFailed)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.retry })).toBeInTheDocument()
  })

  it('cancels the pending login when the dialog is closed', async () => {
    mocks.startLlmLoginFn.mockResolvedValue({
      authUrl: 'https://claude.example/auth',
      needsCode: true,
    })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmAccountControls provider="claude-subscription" />)

    await user.click(await screen.findByRole('button', { name: t.login }))
    await screen.findByRole('link', { name: t.openBrowser })
    await user.click(screen.getAllByRole('button', { name: t.close })[0])

    await waitFor(() =>
      expect(mocks.cancelLlmLoginFn).toHaveBeenCalledWith({
        data: { provider: 'claude-subscription' },
      }),
    )
  })

  it('logs out only after confirmation', async () => {
    mocks.account = { available: true, email: 'me@example.com' }
    mocks.logoutLlmFn.mockResolvedValue({ ok: true })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmAccountControls provider="openai-subscription" />)

    await user.click(await screen.findByRole('button', { name: t.logout }))
    expect(mocks.logoutLlmFn).not.toHaveBeenCalled()

    const dialog = await screen.findByRole('alertdialog')
    await user.click(
      // 확인 버튼(로그아웃)은 대화상자 안의 두 번째 버튼이다.
      Array.from(dialog.querySelectorAll('button')).find(
        (b) => b.textContent === t.logout,
      )!,
    )

    await waitFor(() =>
      expect(mocks.logoutLlmFn).toHaveBeenCalledWith({
        data: { provider: 'openai-subscription' },
      }),
    )
    expect(toast.success).toHaveBeenCalledWith(t.logoutDone)
  })
})
