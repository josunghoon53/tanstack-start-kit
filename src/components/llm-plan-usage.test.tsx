import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithQueryClient } from '@/test/render'
import { messages } from '@/i18n/messages'
import { useLocaleStore } from '@/i18n/locale-store'
import type { LlmAccount, LlmPlanUsage } from '@/config/llm-runner'

const state = vi.hoisted((): { usage: LlmPlanUsage; account: LlmAccount } => ({
  usage: { available: false, windows: [] },
  account: { available: false },
}))

vi.mock('@/server/llm-runner', () => ({
  // 패널 안의 계정 로그인 컨트롤이 쓰는 서버 함수들. 이 테스트에서는 호출하지 않는다.
  startLlmLoginFn: vi.fn(),
  submitLlmLoginCodeFn: vi.fn(),
  cancelLlmLoginFn: vi.fn(),
  logoutLlmFn: vi.fn(),
  llmLoginStateQueryOptions: (provider: string) => ({
    queryKey: ['llm-login-state', provider],
    queryFn: async () => ({ state: 'idle' }),
  }),
  llmAccountQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'account', provider],
    queryFn: async () => state.account,
  }),
  llmPlanUsageQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'plan-usage', provider],
    queryFn: async () => state.usage,
  }),
}))

const { LlmPlanUsage: PlanUsage } = await import('./llm-plan-usage')

const t = messages.ko.llmRunner.planUsage

describe('LlmPlanUsage', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    state.usage = { available: false, windows: [] }
    state.account = { available: false }
  })

  it('shows which account the usage belongs to', async () => {
    state.account = {
      available: true,
      email: 'me@example.com',
      organization: 'My Org',
    }
    renderWithQueryClient(<PlanUsage provider="claude-subscription" />)

    expect(
      await screen.findByText(t.account('me@example.com')),
    ).toBeInTheDocument()
    expect(screen.getByText(t.organization('My Org'))).toBeInTheDocument()
  })

  it('hides the account line when it cannot be read', async () => {
    renderWithQueryClient(<PlanUsage provider="claude-subscription" />)

    await screen.findByText(t.unavailable)
    expect(screen.queryByText(/계정:/)).not.toBeInTheDocument()
  })

  it('explains that API key providers have no plan limits', () => {
    renderWithQueryClient(<PlanUsage provider="claude-api" />)

    expect(screen.getByText(t.notApplicable)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows remaining and used percent for each Claude window', async () => {
    state.usage = {
      available: true,
      plan: 'max',
      windows: [
        {
          key: 'fiveHour',
          usedPercent: 30,
          remainingPercent: 70,
          resetsAt: '2026-09-30T10:00:00.000Z',
        },
        {
          key: 'sevenDay',
          usedPercent: 60,
          remainingPercent: 40,
          resetsAt: null,
        },
      ],
    }
    renderWithQueryClient(<PlanUsage provider="claude-subscription" />)

    expect(await screen.findByText(t.remaining(70))).toBeInTheDocument()
    expect(screen.getByText(t.used(30))).toBeInTheDocument()
    expect(screen.getByText(t.remaining(40))).toBeInTheDocument()
    expect(screen.getByText(t.plan('max'))).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: t.fiveHour }),
    ).toHaveAttribute('aria-valuenow', '30')
    expect(
      screen.getByRole('progressbar', { name: t.sevenDay }),
    ).toHaveAttribute('aria-valuenow', '60')
  })

  it('labels Codex windows by their length in minutes', async () => {
    state.usage = {
      available: true,
      plan: 'plus',
      windows: [
        {
          key: 'primary',
          usedPercent: 12,
          remainingPercent: 88,
          resetsAt: null,
          windowMinutes: 300,
        },
        {
          key: 'secondary',
          usedPercent: 40,
          remainingPercent: 60,
          resetsAt: null,
          windowMinutes: 10080,
        },
      ],
    }
    renderWithQueryClient(<PlanUsage provider="openai-subscription" />)

    expect(
      await screen.findByRole('progressbar', { name: t.windowMinutes(300) }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: t.secondary }),
    ).toBeInTheDocument()
  })

  it('falls back to an unavailable message when usage cannot be read', async () => {
    renderWithQueryClient(<PlanUsage provider="claude-subscription" />)

    expect(await screen.findByText(t.unavailable)).toBeInTheDocument()
  })
})
