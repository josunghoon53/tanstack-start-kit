// llm-runner 플레이그라운드 데이터. 서버 함수가 반환하는 값에는 함수/컴포넌트를 넣지 않는다
// (직렬화 불가) — 날짜도 Date가 아니라 ISO 문자열로 내려준다.

export const LLM_PROVIDERS = [
  'claude-subscription',
  'openai-subscription',
  'claude-api',
  'openai-api',
] as const

export type LlmProvider = (typeof LLM_PROVIDERS)[number]

export const LLM_PROVIDER_LABELS: Record<LlmProvider, string> = {
  'claude-subscription': 'Claude (구독)',
  'openai-subscription': 'Codex (ChatGPT 구독)',
  'claude-api': 'Claude (API 키)',
  'openai-api': 'OpenAI (API 키)',
}

// llm-runner의 *_MODELS 상수와 같은 값이다. 클라이언트 번들에 llm-runner를 끌어오지 않으려고
// 여기에 문자열로 둔다 — llm-runner는 Node 전용이라 서버 함수 안에서만 import한다.
export const LLM_MODELS: Record<LlmProvider, Array<string>> = {
  'claude-subscription': ['haiku', 'sonnet', 'opus', 'fable'],
  'openai-subscription': [
    'gpt-5.6-luna',
    'gpt-5.6-terra',
    'gpt-5.6-sol',
    'gpt-6-astra',
  ],
  'claude-api': [
    'claude-haiku-4-5-20251001',
    'claude-sonnet-5',
    'claude-opus-5',
    'claude-fable-5-1',
  ],
  'openai-api': ['gpt-4o-mini', 'gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'],
}

// 구독 provider만 플랜 잔량 조회가 된다. API 키 provider는 한도 개념이 없다.
export function hasPlanUsage(
  provider: LlmProvider,
): provider is LlmSubscriptionProvider {
  return (
    provider === 'claude-subscription' || provider === 'openai-subscription'
  )
}

export const LLM_SUBSCRIPTION_PROVIDERS = [
  'claude-subscription',
  'openai-subscription',
] as const

// 앱에서 로그인/로그아웃을 다루는 provider. API 키 provider에는 계정 개념이 없다.
export type LlmSubscriptionProvider =
  (typeof LLM_SUBSCRIPTION_PROVIDERS)[number]

export type LlmLoginState = 'idle' | 'pending' | 'success' | 'failed'

export interface LlmLoginStart {
  // 브라우저에서 열어야 하는 OAuth URL
  authUrl: string
  // Claude는 브라우저에서 받은 인증 코드를 앱에 붙여넣어야 한다. Codex는 승인만 하면 된다.
  needsCode: boolean
}

export interface LlmProviderStatus {
  provider: LlmProvider
  // 선택할 수 있는가(CLI 설치됨 / API 키 설정됨). 로그인이 필요한 구독도 선택은 할 수 있어야
  // 화면에서 로그인할 수 있으므로, 로그인 여부는 needsLogin으로 따로 알린다.
  available: boolean
  // 구독 provider 전용 — 앱 전용 프로필에 로그인이 안 돼 있어 실행할 수 없다.
  needsLogin?: boolean
  // 사용 불가일 때 사용자에게 보여줄 안내(로그인 명령, 필요한 env 등)
  hint?: string
}

export type LlmWindowKey = 'fiveHour' | 'sevenDay' | 'primary' | 'secondary'

export interface LlmPlanWindow {
  key: LlmWindowKey
  usedPercent: number
  remainingPercent: number
  resetsAt: string | null
  // Codex 창은 길이(분)가 함께 온다. 5시간/주간 라벨 대신 보여줄 때 쓴다.
  windowMinutes?: number
}

export interface LlmPlanUsage {
  available: boolean
  plan?: string
  windows: Array<LlmPlanWindow>
  credits?: { hasCredits: boolean; unlimited: boolean; balance?: string }
}

// 어느 계정으로 실행되는지. 이메일은 개인정보라 로그인한 사용자에게만 내려간다.
export interface LlmAccount {
  available: boolean
  email?: string
  plan?: string
  organization?: string
}

export interface LlmRunInput {
  provider: LlmProvider
  prompt: string
  system?: string
  model?: string
  // 구독 provider에서만 적용된다. API 키 provider는 llm-runner가 무시한다.
  enableWebSearch?: boolean
}

export interface LlmRunResult {
  text: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
    cachedInputTokens?: number
    reasoningTokens?: number
    costUsd?: number
  }
}

export const LLM_PROMPT_MAX_LENGTH = 8000

// 이미지 생성은 Codex 구독(openai-subscription)에서만 된다. 이미지는 PNG를 base64 data URL로
// 실어 보낸다(서버 함수 반환값은 JSON이라 Buffer를 그대로 못 보낸다).
export interface LlmImageInput {
  prompt: string
}

export interface LlmImageResult {
  images: Array<{ dataUrl: string; revisedPrompt?: string }>
  text: string
  // 한도 초과 등으로 실패한 경우. resetsAt은 Date가 아니라 ISO 문자열이다.
  failure?: { type: string; resetsAt: string | null }
}

export function hasImageGeneration(provider: LlmProvider) {
  return provider === 'openai-subscription'
}
