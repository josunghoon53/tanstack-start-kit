import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { LlmAccountControls } from '@/components/llm-account-controls'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { hasPlanUsage } from '@/config/llm-runner'
import type { LlmPlanWindow, LlmProvider } from '@/config/llm-runner'
import { useLocaleStore } from '@/i18n/locale-store'
import { useTranslation } from '@/i18n/use-translation'
import { cn } from '@/lib/utils'
import {
  llmAccountQueryOptions,
  llmPlanUsageQueryOptions,
} from '@/server/llm-runner'

// 사용률이 높을수록 색을 바꿔 한도 임박을 눈에 띄게 한다.
function barTone(usedPercent: number) {
  if (usedPercent >= 90) return 'bg-destructive'
  if (usedPercent >= 70) return 'bg-warning'
  return 'bg-ink'
}

export function LlmPlanUsage({ provider }: { provider: LlmProvider }) {
  const t = useTranslation().llmRunner.planUsage
  const locale = useLocaleStore((s) => s.locale)
  const enabled = hasPlanUsage(provider)
  const { data, isPending, isFetching, refetch } = useQuery({
    ...llmPlanUsageQueryOptions(provider),
    enabled,
  })
  // 어느 계정의 잔량인지 같이 보여준다. 실패해도 잔량 표시에는 영향이 없다.
  const { data: account } = useQuery({
    ...llmAccountQueryOptions(provider),
    enabled,
  })

  function windowLabel(window: LlmPlanWindow) {
    if (window.key === 'fiveHour') return t.fiveHour
    if (window.key === 'sevenDay') return t.sevenDay
    // Codex는 창 길이(분)를 같이 주므로 5시간/주간(10080분)을 그 값으로 구분한다.
    if (window.windowMinutes === 10080) return t.secondary
    if (window.windowMinutes) return t.windowMinutes(window.windowMinutes)
    return window.key === 'primary' ? t.primary : t.secondary
  }

  function formatReset(iso: string) {
    return new Date(iso).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{t.heading}</h3>
        {enabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t.refresh}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} />
          </Button>
        )}
      </div>

      {!enabled && (
        <p className="text-sm text-muted-foreground">{t.notApplicable}</p>
      )}

      {enabled && account?.available && account.email && (
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span>{t.account(account.email)}</span>
          {account.organization && (
            <span>{t.organization(account.organization)}</span>
          )}
        </div>
      )}

      {enabled && <LlmAccountControls provider={provider} />}

      {enabled && isPending && (
        <div className="flex flex-col gap-2" aria-label={t.loading}>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
      )}

      {enabled && data && !data.available && (
        <p className="text-sm text-muted-foreground">{t.unavailable}</p>
      )}

      {enabled && data?.available && (
        <>
          {data.plan && (
            <p className="text-xs text-muted-foreground">{t.plan(data.plan)}</p>
          )}
          <ul className="flex flex-col gap-3">
            {data.windows.map((window) => {
              const used = Math.round(window.usedPercent)
              const remaining = Math.round(window.remainingPercent)
              return (
                <li key={window.key} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">{windowLabel(window)}</span>
                    <span className="text-muted-foreground">
                      {t.remaining(remaining)}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={windowLabel(window)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={used}
                    className="h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={cn('h-full', barTone(window.usedPercent))}
                      style={{ width: `${Math.min(100, Math.max(0, used))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t.used(used)}</span>
                    {window.resetsAt && (
                      <span>{t.resetsAt(formatReset(window.resetsAt))}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          {data.credits && (
            <p className="text-xs text-muted-foreground">
              {t.credits}:{' '}
              {data.credits.unlimited
                ? t.creditsUnlimited
                : (data.credits.balance ?? '0')}
            </p>
          )}
        </>
      )}

      {enabled && (
        <p className="text-xs whitespace-pre-line text-muted-foreground">
          {t.experimentalNotice}
        </p>
      )}
    </section>
  )
}
