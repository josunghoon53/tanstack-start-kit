import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import {
  LLM_MODELS,
  LLM_PROMPT_MAX_LENGTH,
  LLM_PROVIDERS,
  LLM_SUBSCRIPTION_PROVIDERS,
  hasPlanUsage,
} from '@/config/llm-runner'
import type {
  LlmAccount,
  LlmImageInput,
  LlmImageResult,
  LlmLoginStart,
  LlmLoginState,
  LlmPlanUsage,
  LlmPlanWindow,
  LlmProvider,
  LlmProviderStatus,
  LlmRunInput,
  LlmRunResult,
  LlmSubscriptionProvider,
} from '@/config/llm-runner'
import { authMiddleware } from './auth-middleware'

// llm-runner는 Node 전용이고, createAiRunner()를 모듈 최상단에서 부르면 import만으로
// CLI 설치 검사가 돌아 CLI 없는 빌드 환경에서 깨질 수 있다. 그래서 import도 호출도
// 핸들러 안에서 한다. node:os/fs/path도 같은 이유로 헬퍼 안에서 동적으로 import한다
// (이 파일은 클라이언트도 import하므로 최상단에서 Node 내장 모듈을 끌어오지 않는다).

// API 키는 process.env에서만 읽는다(코드에 넣지 않는다). 값 자체는 클라이언트로 내려가지 않고
// "설정돼 있는지"만 boolean으로 판단한다.
const API_KEY_ENV: Record<'claude-api' | 'openai-api', string> = {
  'claude-api': 'ANTHROPIC_API_KEY',
  'openai-api': 'OPENAI_API_KEY',
}

// 구독 provider는 머신 기본 로그인(~/.claude, ~/.codex)이 아니라 이 앱 전용 프로필 폴더를 쓴다.
// 그래야 앱에서 계정을 바꿔도 Claude Code/Codex CLI의 기본 로그인은 그대로다. 자격 증명이
// 저장되는 곳이라 프로젝트 안이 아니라 홈 디렉터리 아래에 두고, 폴더 권한은 본인만 접근하게 한다.
const PROFILE_DIR_NAME: Record<LlmSubscriptionProvider, string> = {
  'claude-subscription': 'claude',
  'openai-subscription': 'codex',
}

async function ensureProfileDir(provider: LlmSubscriptionProvider) {
  const [{ homedir }, { join }, { mkdir }] = await Promise.all([
    import('node:os'),
    import('node:path'),
    import('node:fs/promises'),
  ])
  const dir = join(homedir(), '.llm-runner', PROFILE_DIR_NAME[provider])
  await mkdir(dir, { recursive: true, mode: 0o700 })
  return dir
}

// provider별로 llm-runner의 ProfileOptions 모양을 만든다. API 키 provider는 프로필이 없다.
async function getProfileOptions(provider: LlmProvider) {
  if (provider === 'claude-subscription') {
    return { claudeConfigDir: await ensureProfileDir(provider) }
  }
  if (provider === 'openai-subscription') {
    return { codexHome: await ensureProfileDir(provider) }
  }
  return {}
}

async function readAccount(provider: LlmProvider): Promise<LlmAccount> {
  try {
    const { getClaudeAccountInfo, getCodexAccountInfo } =
      await import('llm-runner/experimental')
    const profile = await getProfileOptions(provider)
    const info =
      provider === 'claude-subscription'
        ? await getClaudeAccountInfo(profile)
        : provider === 'openai-subscription'
          ? await getCodexAccountInfo(profile)
          : undefined
    if (!info?.available) return { available: false }
    return {
      available: true,
      email: info.email,
      plan: info.plan,
      organization: info.organization,
    }
  } catch {
    return { available: false }
  }
}

export const getLlmStatusFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<LlmProviderStatus>> => {
    const { checkSubscriptionSetup } = await import('llm-runner')
    const { claude, codex } = checkSubscriptionSetup()

    // 설치돼 있으면 선택은 가능하다. 앱 전용 프로필에 로그인돼 있는지는 계정 조회로 확인한다.
    const subscription = async (
      provider: LlmSubscriptionProvider,
      cli: typeof claude,
    ): Promise<LlmProviderStatus> => {
      if (!cli.installed) {
        return { provider, available: false, hint: cli.installCommand }
      }
      const account = await readAccount(provider)
      return { provider, available: true, needsLogin: !account.available }
    }
    const apiKey = (
      provider: 'claude-api' | 'openai-api',
    ): LlmProviderStatus => {
      const env = API_KEY_ENV[provider]
      return {
        provider,
        available: Boolean(process.env[env]),
        hint: process.env[env] ? undefined : env,
      }
    }

    const [claudeStatus, codexStatus] = await Promise.all([
      subscription('claude-subscription', claude),
      subscription('openai-subscription', codex),
    ])
    return [
      claudeStatus,
      codexStatus,
      apiKey('claude-api'),
      apiKey('openai-api'),
    ]
  })

export const llmStatusQueryOptions = () =>
  queryOptions({
    queryKey: ['llm-runner', 'status'],
    queryFn: () => getLlmStatusFn(),
  })

const runSchema = z.object({
  provider: z.enum(LLM_PROVIDERS),
  prompt: z.string().trim().min(1).max(LLM_PROMPT_MAX_LENGTH),
  system: z.string().max(LLM_PROMPT_MAX_LENGTH).optional(),
  model: z.string().optional(),
  enableWebSearch: z.boolean().optional(),
})

export const runLlmFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: LlmRunInput) => runSchema.parse(data))
  .handler(async ({ data, context }): Promise<LlmRunResult> => {
    // 구독 세션/API 키로 비용이 나가는 호출이라 로그인 사용자만 허용한다.
    if (!context.user) throw new Error('UNAUTHORIZED')
    if (data.model && !LLM_MODELS[data.provider].includes(data.model)) {
      throw new Error('INVALID_MODEL')
    }

    const { createAiRunner } = await import('llm-runner')
    const runner = createAiRunner({
      provider: data.provider,
      // 구독 provider는 앱 전용 프로필 계정으로 실행한다(API 키 provider는 빈 객체).
      ...(await getProfileOptions(data.provider)),
    })
    const { text, usage } = await runner.run({
      prompt: data.prompt,
      system: data.system || undefined,
      model: data.model || undefined,
      // 웹 검색은 구독 provider 전용이라 API 키 provider에는 넘기지 않는다(넘겨도 무시되지만
      // 화면과 서버가 같은 규칙을 따르게 한다). 켜면 웹 검색만 열리고 다른 도구는 계속 잠겨 있다.
      enableWebSearch:
        hasPlanUsage(data.provider) && data.enableWebSearch ? true : undefined,
    })

    return { text, usage }
  })

const imageSchema = z.object({
  prompt: z.string().trim().min(1).max(LLM_PROMPT_MAX_LENGTH),
})

// 이미지 생성은 Codex 구독 전용이고 텍스트와 다른 사용량 한도를 쓴다. 한 번에 1분 이상, 2장 안팎이
// 걸릴 수 있다. 한도 초과는 던지지 않고 failure로 오므로 화면이 그대로 안내할 수 있게 넘긴다.
export const generateLlmImageFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: LlmImageInput) => imageSchema.parse(data))
  .handler(async ({ data, context }): Promise<LlmImageResult> => {
    if (!context.user) throw new Error('UNAUTHORIZED')
    const { generateCodexImage } = await import('llm-runner/experimental')
    const profile = await getProfileOptions('openai-subscription')
    const { images, text, failure } = await generateCodexImage({
      prompt: data.prompt,
      ...profile,
    })
    return {
      images: images.map((image) => ({
        dataUrl: `data:image/png;base64,${image.data.toString('base64')}`,
        revisedPrompt: image.revisedPrompt,
      })),
      text,
      failure: failure
        ? {
            type: failure.type,
            resetsAt: failure.resetsAt ? failure.resetsAt.toISOString() : null,
          }
        : undefined,
    }
  })

const usageSchema = z.object({ provider: z.enum(LLM_PROVIDERS) })

// 이메일이 들어 있어서 로그인 사용자에게만 내려준다. 토큰은 SDK/CLI가 알아서 쓰고 이 코드는
// 자격 증명을 읽지 않는다. 구독이 아닌 인증이거나 실패하면 { available: false }로 폴백한다.
export const getLlmAccountFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmProvider }) => usageSchema.parse(data))
  .handler(async ({ data, context }): Promise<LlmAccount> => {
    if (!context.user) return { available: false }
    return readAccount(data.provider)
  })

export const llmAccountQueryOptions = (provider: LlmProvider) =>
  queryOptions({
    queryKey: ['llm-runner', 'account', provider],
    queryFn: () => getLlmAccountFn({ data: { provider } }),
    // 로그인 계정은 세션 중에 거의 바뀌지 않는다. 로그인/로그아웃 뒤에는 명시적으로 무효화한다.
    staleTime: 5 * 60_000,
  })

const toIso = (date?: Date) => (date ? date.toISOString() : null)

// 플랜 잔량은 SDK/CLI의 실험적 API에 의존한다. 이름이 바뀌거나 실패해도 화면이 깨지지 않게
// 항상 { available: false }로 폴백한다. 조회는 토큰을 쓰지 않는다.
export const getLlmPlanUsageFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmProvider }) => usageSchema.parse(data))
  .handler(async ({ data }): Promise<LlmPlanUsage> => {
    const empty: LlmPlanUsage = { available: false, windows: [] }
    try {
      const profile = await getProfileOptions(data.provider)

      if (data.provider === 'claude-subscription') {
        const { getClaudePlanUsage } = await import('llm-runner/experimental')
        const usage = await getClaudePlanUsage(profile)
        if (!usage.available) return empty

        const windows: Array<LlmPlanWindow> = []
        for (const [key, window] of [
          ['fiveHour', usage.fiveHour],
          ['sevenDay', usage.sevenDay],
        ] as const) {
          if (window?.usedPercent === undefined) continue
          windows.push({
            key,
            usedPercent: window.usedPercent,
            remainingPercent:
              window.remainingPercent ?? 100 - window.usedPercent,
            resetsAt: toIso(window.resetsAt),
          })
        }
        return { available: true, plan: usage.subscriptionType, windows }
      }

      if (data.provider === 'openai-subscription') {
        const { getCodexPlanUsage } = await import('llm-runner/experimental')
        const usage = await getCodexPlanUsage(profile)
        if (!usage.available) return empty

        const windows: Array<LlmPlanWindow> = []
        for (const [key, window] of [
          ['primary', usage.primary],
          ['secondary', usage.secondary],
        ] as const) {
          if (window?.usedPercent === undefined) continue
          windows.push({
            key,
            usedPercent: window.usedPercent,
            remainingPercent:
              window.remainingPercent ?? 100 - window.usedPercent,
            resetsAt: toIso(window.resetsAt),
            windowMinutes: window.windowMinutes,
          })
        }
        return {
          available: true,
          plan: usage.planType,
          windows,
          credits: usage.credits,
        }
      }
    } catch {
      return empty
    }
    return empty
  })

export const llmPlanUsageQueryOptions = (provider: LlmProvider) =>
  queryOptions({
    queryKey: ['llm-runner', 'plan-usage', provider],
    queryFn: () => getLlmPlanUsageFn({ data: { provider } }),
    // 잔량 조회는 CLI를 띄우므로 자주 다시 부르지 않는다. 실행 후에는 명시적으로 무효화한다.
    staleTime: 30_000,
  })

// ── 계정 로그인/로그아웃 ────────────────────────────────────────────────────────
// 로그인은 브라우저 OAuth라서 서버가 CLI 로그인 흐름을 시작하고 authUrl만 화면에 넘긴다.
// 진행 중인 로그인 핸들은 요청 사이에 이어져야 해서 이 서버 프로세스의 메모리에 둔다 —
// 로컬 개발용 단일 프로세스 전제이고, 서버가 재시작되면 진행 중이던 로그인은 사라진다.
// 로그인 실패 사유(error)는 화면에 내려보내지 않는다(상태만 알린다).
interface LoginSession {
  authUrl: string
  state: LlmLoginState
  cancel: () => Promise<void>
  submitCode?: (code: string) => void
}

const loginSessions = new Map<LlmSubscriptionProvider, LoginSession>()

const loginSchema = z.object({ provider: z.enum(LLM_SUBSCRIPTION_PROVIDERS) })
const loginCodeSchema = loginSchema.extend({
  code: z.string().trim().min(1).max(2000),
})

function assertUser(user: unknown) {
  if (!user) throw new Error('UNAUTHORIZED')
}

export const startLlmLoginFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmSubscriptionProvider }) =>
    loginSchema.parse(data),
  )
  .handler(async ({ data, context }): Promise<LlmLoginStart> => {
    assertUser(context.user)
    // 같은 provider로 이미 진행 중인 로그인이 있으면 취소하고 새로 시작한다.
    const previous = loginSessions.get(data.provider)
    if (previous?.state === 'pending') await previous.cancel()

    const { startClaudeLogin, startCodexLogin } =
      await import('llm-runner/experimental')
    const profile = await getProfileOptions(data.provider)

    // 화면에는 "실패"라는 상태만 내려가므로, 원인을 알 수 있게 서버 로그에는 사유(메시지만)를
    // 남긴다. URL·코드·토큰은 남기지 않는다.
    const logFailure = (reason: unknown) =>
      console.error(
        `[llm-runner] ${data.provider} 로그인 실패:`,
        reason instanceof Error ? reason.message : String(reason),
      )

    let session: LoginSession
    try {
      if (data.provider === 'claude-subscription') {
        const handle = await startClaudeLogin(profile)
        session = {
          authUrl: handle.authUrl,
          state: 'pending',
          cancel: () => {
            handle.cancel()
            return Promise.resolve()
          },
          submitCode: (code) => handle.submitCode(code),
        }
        void handle.waitForCompletion().then((result) => {
          session.state = result.success ? 'success' : 'failed'
          if (!result.success) logFailure(result.error ?? 'unknown')
        })
      } else {
        const handle = await startCodexLogin(profile)
        session = {
          authUrl: handle.authUrl,
          state: 'pending',
          cancel: () => handle.cancel(),
        }
        void handle.waitForCompletion().then((result) => {
          session.state = result.success ? 'success' : 'failed'
          if (!result.success) logFailure(result.error ?? 'unknown')
        })
      }
    } catch (error) {
      logFailure(error)
      throw error
    }
    loginSessions.set(data.provider, session)

    return {
      authUrl: session.authUrl,
      needsCode: data.provider === 'claude-subscription',
    }
  })

export const submitLlmLoginCodeFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmSubscriptionProvider; code: string }) =>
    loginCodeSchema.parse(data),
  )
  .handler(({ data, context }): { ok: boolean } => {
    assertUser(context.user)
    const session = loginSessions.get(data.provider)
    if (session?.state !== 'pending' || !session.submitCode) {
      return { ok: false }
    }
    session.submitCode(data.code)
    return { ok: true }
  })

export const getLlmLoginStateFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmSubscriptionProvider }) =>
    loginSchema.parse(data),
  )
  .handler(({ data, context }): { state: LlmLoginState } => {
    assertUser(context.user)
    return { state: loginSessions.get(data.provider)?.state ?? 'idle' }
  })

export const llmLoginStateQueryOptions = (provider: LlmSubscriptionProvider) =>
  queryOptions({
    queryKey: ['llm-login-state', provider],
    queryFn: () => getLlmLoginStateFn({ data: { provider } }),
    // 로그인 진행 상태는 캐시하면 안 된다. 폴링할 때마다 서버에 물어본다.
    staleTime: 0,
    gcTime: 0,
  })

export const cancelLlmLoginFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmSubscriptionProvider }) =>
    loginSchema.parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    assertUser(context.user)
    const session = loginSessions.get(data.provider)
    if (session?.state === 'pending') await session.cancel()
    loginSessions.delete(data.provider)
    return { ok: true }
  })

// 로그아웃은 항상 앱 전용 프로필만 대상으로 한다. 프로필을 생략하면 머신 기본 계정이
// 로그아웃돼 다른 터미널 세션까지 끊기므로, 이 함수는 기본 계정을 건드릴 수 없게 만든다.
export const logoutLlmFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((data: { provider: LlmSubscriptionProvider }) =>
    loginSchema.parse(data),
  )
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    assertUser(context.user)
    const { claudeLogout, codexLogout } =
      await import('llm-runner/experimental')
    const profile = await getProfileOptions(data.provider)
    const result =
      data.provider === 'claude-subscription'
        ? await claudeLogout(profile)
        : await codexLogout(profile)
    loginSessions.delete(data.provider)
    return { ok: result.ok }
  })
