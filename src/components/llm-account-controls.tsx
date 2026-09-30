import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type {
  LlmLoginStart,
  LlmSubscriptionProvider,
} from '@/config/llm-runner'
import { useTranslation } from '@/i18n/use-translation'
import {
  cancelLlmLoginFn,
  llmAccountQueryOptions,
  llmLoginStateQueryOptions,
  logoutLlmFn,
  startLlmLoginFn,
  submitLlmLoginCodeFn,
} from '@/server/llm-runner'

type Step = 'idle' | 'starting' | 'waiting' | 'failed'

// 구독 provider의 앱 전용 계정을 로그인/변경/로그아웃한다. 머신 기본 로그인(Claude Code/Codex CLI)은
// 건드리지 않는다 — 서버가 항상 앱 전용 프로필만 대상으로 한다.
export function LlmAccountControls({
  provider,
}: {
  provider: LlmSubscriptionProvider
}) {
  const t = useTranslation().llmRunner.accountControl
  const queryClient = useQueryClient()
  const { data: account } = useQuery(llmAccountQueryOptions(provider))
  const loggedIn = Boolean(account?.available)

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [login, setLogin] = useState<LlmLoginStart | null>(null)
  const [code, setCode] = useState('')
  const [logoutOpen, setLogoutOpen] = useState(false)

  // 로그인 승인이 끝났는지 서버에 주기적으로 물어본다(대기 중일 때만).
  const { data: loginState } = useQuery({
    ...llmLoginStateQueryOptions(provider),
    enabled: step === 'waiting',
    refetchInterval: 2000,
  })

  function refreshAccountData() {
    // 계정이 바뀌면 잔량·계정·provider 사용 가능 여부가 모두 달라진다.
    void queryClient.invalidateQueries({ queryKey: ['llm-runner'] })
  }

  useEffect(() => {
    if (step !== 'waiting' || !loginState) return
    if (loginState.state === 'success') {
      setOpen(false)
      setStep('idle')
      setLogin(null)
      setCode('')
      toast.success(t.loginSuccess)
      refreshAccountData()
    } else if (loginState.state === 'failed') {
      setStep('failed')
    }
    // refreshAccountData/t는 렌더마다 새로 만들어지지만 loginState 변화에만 반응하면 된다.
  }, [loginState, step])

  async function startLogin() {
    setOpen(true)
    setStep('starting')
    setCode('')
    try {
      const result = await startLlmLoginFn({ data: { provider } })
      setLogin(result)
      setStep('waiting')
      // 서버 머신이 곧 이 브라우저 머신인 로컬 개발 전제라 새 탭으로 바로 연다.
      // 팝업이 막히면 대화상자의 링크를 눌러 열면 된다.
      window.open(result.authUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setStep('failed')
    }
  }

  async function closeLogin() {
    setOpen(false)
    if (step === 'waiting' || step === 'starting') {
      try {
        await cancelLlmLoginFn({ data: { provider } })
      } catch {
        // 취소 실패는 무시한다 — 서버의 로그인 세션은 시간이 지나면 스스로 끝난다.
      }
    }
    setStep('idle')
    setLogin(null)
    setCode('')
  }

  async function submitCode() {
    try {
      const result = await submitLlmLoginCodeFn({ data: { provider, code } })
      if (!result.ok) setStep('failed')
    } catch {
      setStep('failed')
    }
  }

  async function logout() {
    try {
      const result = await logoutLlmFn({ data: { provider } })
      if (result.ok) toast.success(t.logoutDone)
      else toast.error(t.logoutFailed)
    } catch {
      toast.error(t.logoutFailed)
    }
    refreshAccountData()
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="xs"
          variant={loggedIn ? 'outline' : 'default'}
          onClick={() => void startLogin()}
        >
          {loggedIn ? t.change : t.login}
        </Button>
        {loggedIn && (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setLogoutOpen(true)}
          >
            {t.logout}
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) void closeLogin()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.loginTitle}</DialogTitle>
            <DialogDescription>{t.profileNotice}</DialogDescription>
          </DialogHeader>

          {step === 'starting' && (
            <p className="text-sm text-muted-foreground">{t.starting}</p>
          )}

          {step === 'waiting' && login && (
            <div className="flex flex-col gap-3 text-sm">
              <p>{t.stepBrowser}</p>
              <a
                href={login.authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                {t.openBrowser}
              </a>
              {login.needsCode ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="llm-login-code" className="font-medium">
                    {t.codeLabel}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="llm-login-code"
                      value={code}
                      placeholder={t.codePlaceholder}
                      autoComplete="off"
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <Button
                      type="button"
                      disabled={!code.trim()}
                      onClick={() => void submitCode()}
                    >
                      {t.submitCode}
                    </Button>
                  </div>
                </div>
              ) : null}
              <p className="text-muted-foreground">{t.waiting}</p>
            </div>
          )}

          {step === 'failed' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-destructive">{t.loginFailed}</p>
              <div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void startLogin()}
                >
                  {t.retry}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => void closeLogin()}
            >
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.logoutConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.logoutConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.close}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void logout()}>
              {t.logout}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
