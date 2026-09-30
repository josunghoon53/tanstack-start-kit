import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { renderWithRouter } from '@/test/render'
import { useLocaleStore } from '@/i18n/locale-store'
import type { LlmAccount, LlmProviderStatus } from '@/config/llm-runner'

const state = vi.hoisted(
  (): { statuses: Array<LlmProviderStatus>; account: LlmAccount } => ({
    statuses: [],
    account: { available: false },
  }),
)

vi.mock('@/server/llm-runner', () => ({
  llmStatusQueryOptions: () => ({
    queryKey: ['llm-runner', 'status'],
    queryFn: async () => state.statuses,
  }),
  llmAccountQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'account', provider],
    queryFn: async () => state.account,
  }),
  llmPlanUsageQueryOptions: (provider: string) => ({
    queryKey: ['llm-runner', 'plan-usage', provider],
    queryFn: async () => ({
      available: true,
      plan: 'max',
      windows: [
        {
          key: 'fiveHour',
          usedPercent: 30,
          remainingPercent: 70,
          resetsAt: null,
        },
      ],
    }),
  }),
  // 계정 로그인 컨트롤이 쓰는 서버 함수들. 이 테스트에서는 호출하지 않는다.
  startLlmLoginFn: vi.fn(),
  submitLlmLoginCodeFn: vi.fn(),
  cancelLlmLoginFn: vi.fn(),
  logoutLlmFn: vi.fn(),
  llmLoginStateQueryOptions: (provider: string) => ({
    queryKey: ['llm-login-state', provider],
    queryFn: async () => ({ state: 'idle' }),
  }),
}))

const { Route } = await import('./settings')
const Settings = Route.options.component as () => ReactElement

describe('Settings AI 연동 tab', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'ko' })
    state.account = { available: false }
    state.statuses = [
      { provider: 'claude-subscription', available: true, needsLogin: true },
      {
        provider: 'openai-subscription',
        available: false,
        hint: 'npm i -g @openai/codex',
      },
      { provider: 'claude-api', available: true },
      { provider: 'openai-api', available: false, hint: 'OPENAI_API_KEY' },
    ]
  })

  async function openTab() {
    const user = userEvent.setup()
    renderWithRouter(<Settings />)
    await user.click(await screen.findByRole('button', { name: 'AI 연동' }))
  }

  it('shows every provider with its connection state', async () => {
    await openTab()

    expect(await screen.findByText('Claude (구독)')).toBeInTheDocument()
    expect(
      await screen.findByText(/아직 로그인하지 않았어요/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('CLI 설치가 필요해요: npm i -g @openai/codex'),
    ).toBeInTheDocument()
    expect(screen.getByText('API 키가 설정돼 있어요.')).toBeInTheDocument()
    expect(screen.getByText(/서버 환경 변수 OPENAI_API_KEY를 설정해/)).toBeInTheDocument()
  })

  it('shows the logged-in email and lets the user log in from settings', async () => {
    state.account = { available: true, email: 'me@example.com' }
    state.statuses[0] = { provider: 'claude-subscription', available: true }
    await openTab()

    expect(
      await screen.findByText('연결됨 · me@example.com'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
    // 구독 사용량 패널(플랜 잔량)도 같은 탭에 보인다.
    expect(await screen.findByText('70% 남음')).toBeInTheDocument()

    // 사용량 패널은 접었다 펼 수 있다.
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '사용량 접기' }))
    expect(screen.queryByText('70% 남음')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '사용량 보기' }))
    expect(await screen.findByText('70% 남음')).toBeInTheDocument()
  })
})
