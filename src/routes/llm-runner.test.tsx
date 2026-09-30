import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import { useLocaleStore } from '@/i18n/locale-store'
import type { LlmProviderStatus } from '@/config/llm-runner'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mocks = vi.hoisted(() => ({
  runLlmFn: vi.fn(),
  generateLlmImageFn: vi.fn(),
  statuses: [] as Array<LlmProviderStatus>,
}))

vi.mock('@/server/llm-runner', () => ({
  runLlmFn: mocks.runLlmFn,
  generateLlmImageFn: mocks.generateLlmImageFn,
  startLlmLoginFn: vi.fn(),
  submitLlmLoginCodeFn: vi.fn(),
  cancelLlmLoginFn: vi.fn(),
  logoutLlmFn: vi.fn(),
  llmLoginStateQueryOptions: (provider: string) => ({
    queryKey: ['llm-login-state', provider],
    queryFn: async () => ({ state: 'idle' }),
  }),
  llmStatusQueryOptions: () => ({
    queryKey: ['llm-runner', 'status'],
    queryFn: async () => mocks.statuses,
  }),
  llmAccountQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'account', provider],
    queryFn: async () => ({ available: true, email: 'me@example.com' }),
  }),
  llmPlanUsageQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'plan-usage', provider],
    queryFn: async () => ({
      available: true,
      plan: 'max',
      windows: [
        {
          key: 'fiveHour',
          usedPercent: 25,
          remainingPercent: 75,
          resetsAt: null,
        },
      ],
    }),
  }),
}))

const { Route } = await import('@/routes/llm-runner')
const LlmRunner = Route.options.component as () => React.ReactElement

const t = messages.ko.llmRunner

const allAvailable: Array<LlmProviderStatus> = [
  { provider: 'claude-subscription', available: true },
  { provider: 'openai-subscription', available: true },
  { provider: 'claude-api', available: true },
  { provider: 'openai-api', available: true },
]

describe('LlmRunner route', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    mocks.statuses = allAvailable
    mocks.runLlmFn.mockReset()
    mocks.generateLlmImageFn.mockReset()
    vi.mocked(toast.error).mockClear()
  })

  it('shows the playground and the subscription usage percent', async () => {
    renderWithQueryClient(<LlmRunner />)

    expect(await screen.findByText(t.heading)).toBeInTheDocument()
    expect(
      await screen.findByText(t.planUsage.remaining(75)),
    ).toBeInTheDocument()
  })

  it('disables running and shows the setup hint when the provider is unavailable', async () => {
    mocks.statuses = allAvailable.map((s) =>
      s.provider === 'claude-subscription'
        ? { ...s, available: false, hint: 'claude login' }
        : { ...s, available: false },
    )
    renderWithQueryClient(<LlmRunner />)

    expect(
      await screen.findByText(t.unavailableHint('claude login')),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.run })).toBeDisabled()
  })

  it('blocks running until the app account is logged in', async () => {
    mocks.statuses = allAvailable.map((s) =>
      s.provider === 'claude-subscription' ? { ...s, needsLogin: true } : s,
    )
    renderWithQueryClient(<LlmRunner />)

    expect(await screen.findByText(t.loginRequired)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t.run })).toBeDisabled()
  })

  it('requires a prompt before running', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<LlmRunner />)

    await user.click(await screen.findByRole('button', { name: t.run }))

    expect(await screen.findByText(t.promptRequired)).toBeInTheDocument()
    expect(mocks.runLlmFn).not.toHaveBeenCalled()
  })

  it('runs the prompt and shows the response with per-call usage', async () => {
    mocks.runLlmFn.mockResolvedValue({
      text: '안녕하세요!',
      usage: { inputTokens: 12, outputTokens: 34, costUsd: 0.0123 },
    })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmRunner />)

    await user.type(await screen.findByLabelText(t.promptLabel), '인사해줘')
    await user.click(screen.getByRole('button', { name: t.run }))

    expect(await screen.findByText('안녕하세요!')).toBeInTheDocument()
    expect(mocks.runLlmFn).toHaveBeenCalledWith({
      data: {
        provider: 'claude-subscription',
        prompt: '인사해줘',
        system: undefined,
        model: undefined,
      },
    })
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('$0.0123')).toBeInTheDocument()
  })

  it('sends enableWebSearch when the web search switch is on', async () => {
    mocks.runLlmFn.mockResolvedValue({ text: '검색 결과' })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmRunner />)

    await user.click(
      await screen.findByRole('switch', { name: t.webSearchLabel }),
    )
    await user.type(screen.getByLabelText(t.promptLabel), '오늘 뉴스')
    await user.click(screen.getByRole('button', { name: t.run }))

    expect(await screen.findByText('검색 결과')).toBeInTheDocument()
    expect(mocks.runLlmFn).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: 'claude-subscription',
        enableWebSearch: true,
      }),
    })
  })

  it('does not send enableWebSearch by default', async () => {
    mocks.runLlmFn.mockResolvedValue({ text: 'ok' })
    const user = userEvent.setup()
    renderWithQueryClient(<LlmRunner />)

    await user.type(await screen.findByLabelText(t.promptLabel), '안녕')
    await user.click(screen.getByRole('button', { name: t.run }))

    await screen.findByText('ok')
    expect(mocks.runLlmFn.mock.calls[0][0].data.enableWebSearch).toBeUndefined()
  })

  it('disables web search for API key providers', async () => {
    mocks.statuses = allAvailable.map((s) => ({
      ...s,
      available: s.provider === 'claude-api',
    }))
    renderWithQueryClient(<LlmRunner />)

    expect(
      await screen.findByRole('switch', { name: t.webSearchLabel }),
    ).toBeDisabled()
    expect(screen.getByText(t.webSearchApiUnsupported)).toBeInTheDocument()
  })

  it('shows an error toast when the run fails', async () => {
    mocks.runLlmFn.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    renderWithQueryClient(<LlmRunner />)

    await user.type(await screen.findByLabelText(t.promptLabel), '실패')
    await user.click(screen.getByRole('button', { name: t.run }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(t.failedToast))
  })

  describe('image generation (Codex subscription)', () => {
    // 첫 번째로 쓸 수 있는 provider가 기본 선택이라, Claude 구독을 막아 Codex 구독이 선택되게 한다.
    const codexFirst = allAvailable.map((s) =>
      s.provider === 'claude-subscription' ? { ...s, available: false } : s,
    )

    it('only offers image generation for the Codex subscription', async () => {
      renderWithQueryClient(<LlmRunner />)
      await screen.findByText(t.heading)
      expect(
        screen.queryByRole('button', { name: t.generateImage }),
      ).not.toBeInTheDocument()
    })

    it('requires a prompt before generating', async () => {
      mocks.statuses = codexFirst
      const user = userEvent.setup()
      renderWithQueryClient(<LlmRunner />)

      await user.click(
        await screen.findByRole('button', { name: t.generateImage }),
      )

      expect(await screen.findByText(t.promptRequired)).toBeInTheDocument()
      expect(mocks.generateLlmImageFn).not.toHaveBeenCalled()
    })

    it('generates and shows the images with the revised prompt', async () => {
      mocks.statuses = codexFirst
      mocks.generateLlmImageFn.mockResolvedValue({
        images: [
          {
            dataUrl: 'data:image/png;base64,AAAA',
            revisedPrompt: '빨간 삼각형',
          },
        ],
        text: '',
      })
      const user = userEvent.setup()
      renderWithQueryClient(<LlmRunner />)

      await user.type(await screen.findByLabelText(t.promptLabel), '삼각형')
      await user.click(screen.getByRole('button', { name: t.generateImage }))

      const image = await screen.findByRole('img', { name: '빨간 삼각형' })
      expect(image).toHaveAttribute('src', 'data:image/png;base64,AAAA')
      expect(mocks.generateLlmImageFn).toHaveBeenCalledWith({
        data: { prompt: '삼각형' },
      })
      expect(
        screen.getByText(t.imageRevisedPrompt('빨간 삼각형')),
      ).toBeInTheDocument()
    })

    it('explains a usage-limit failure instead of showing an image', async () => {
      mocks.statuses = codexFirst
      mocks.generateLlmImageFn.mockResolvedValue({
        images: [],
        text: '',
        failure: { type: 'usageLimitExceeded', resetsAt: null },
      })
      const user = userEvent.setup()
      renderWithQueryClient(<LlmRunner />)

      await user.type(await screen.findByLabelText(t.promptLabel), '삼각형')
      await user.click(screen.getByRole('button', { name: t.generateImage }))

      expect(
        await screen.findByText(t.imageLimitExceededNoTime),
      ).toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
