import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { LlmPlanUsage } from '@/components/llm-plan-usage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  LLM_MODELS,
  LLM_PROMPT_MAX_LENGTH,
  LLM_PROVIDERS,
  LLM_PROVIDER_LABELS,
  hasImageGeneration,
  hasPlanUsage,
} from '@/config/llm-runner'
import type {
  LlmImageResult,
  LlmProvider,
  LlmProviderStatus,
  LlmRunResult,
} from '@/config/llm-runner'
import { useLocaleStore } from '@/i18n/locale-store'
import { useTranslation } from '@/i18n/use-translation'
import {
  generateLlmImageFn,
  llmPlanUsageQueryOptions,
  llmStatusQueryOptions,
  runLlmFn,
} from '@/server/llm-runner'

// loader에서 prefetch하지 않는다: provider 상태 조회는 CLI 설치/로그인 확인이라 느려서, loader에 걸면
// 그동안 페이지가 안 뜬다. 페이지는 바로 그리고 상태만 화면 안에서 로딩한다(설정 > AI 연동 탭과 같다).
export const Route = createFileRoute('/llm-runner')({
  component: LlmRunner,
})

// Radix Select는 빈 문자열 value를 허용하지 않아서 "모델 기본값"은 센티널로 표현한다.
const DEFAULT_MODEL = '__default__'

// 매개변수 타입은 Messages['llmRunner']를 그대로 쓰지 않고 필요한 필드만 넓혀서 선언한다 —
// `as const` 딕셔너리의 ko/en 리터럴 타입이 서로 대입되지 않기 때문이다.
function createRunSchema(t: {
  promptRequired: string
  promptTooLong: (max: number) => string
}) {
  return z.object({
    provider: z.enum(LLM_PROVIDERS),
    model: z.string(),
    enableWebSearch: z.boolean(),
    system: z
      .string()
      .max(LLM_PROMPT_MAX_LENGTH, t.promptTooLong(LLM_PROMPT_MAX_LENGTH)),
    prompt: z
      .string()
      .trim()
      .min(1, t.promptRequired)
      .max(LLM_PROMPT_MAX_LENGTH, t.promptTooLong(LLM_PROMPT_MAX_LENGTH)),
  })
}

type RunValues = z.infer<ReturnType<typeof createRunSchema>>

function LlmRunner() {
  const t = useTranslation().llmRunner
  const { data: statuses, isError } = useQuery(llmStatusQueryOptions())

  // 폼의 기본 provider가 상태(첫 번째로 쓸 수 있는 것)에 달려 있어서, 상태가 오면 그때 폼을 만든다.
  if (!statuses) {
    return (
      <Card className="flex-1">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{t.heading}</h2>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>
          {isError ? (
            <p className="text-sm text-destructive">{t.statusLoadFailed}</p>
          ) : (
            <div className="flex flex-col gap-3" aria-label={t.statusLoading}>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  return <LlmRunnerForm statuses={statuses} />
}

function LlmRunnerForm({ statuses }: { statuses: Array<LlmProviderStatus> }) {
  const t = useTranslation().llmRunner
  const queryClient = useQueryClient()
  const schema = useMemo(() => createRunSchema(t), [t])

  const firstAvailable = statuses.find((s) => s.available)?.provider
  const form = useForm<RunValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      provider: firstAvailable ?? LLM_PROVIDERS[0],
      model: DEFAULT_MODEL,
      enableWebSearch: false,
      system: '',
      prompt: '',
    },
  })
  const provider = form.watch('provider')
  const status = statuses.find((s) => s.provider === provider)
  const isUnavailable = status ? !status.available : false
  // 구독 provider는 선택은 되지만 앱 전용 계정에 로그인해야 실행할 수 있다.
  const needsLogin = status?.needsLogin ?? false

  const mutation = useMutation<LlmRunResult, Error, RunValues>({
    mutationFn: (values) =>
      runLlmFn({
        data: {
          provider: values.provider,
          prompt: values.prompt,
          system: values.system || undefined,
          model: values.model === DEFAULT_MODEL ? undefined : values.model,
          enableWebSearch: values.enableWebSearch || undefined,
        },
      }),
    onSuccess: (_result, values) => {
      // 실행하면 구독 잔량이 줄어드니 해당 provider의 잔량을 다시 불러온다.
      if (hasPlanUsage(values.provider)) {
        void queryClient.invalidateQueries({
          queryKey: llmPlanUsageQueryOptions(values.provider).queryKey,
        })
      }
    },
    onError: () => toast.error(t.failedToast),
  })
  const result = mutation.data

  // 이미지 생성은 Codex 구독 전용이고 시스템 프롬프트·모델·웹 검색은 쓰지 않는다.
  const canGenerateImage = hasImageGeneration(provider)
  const locale = useLocaleStore((s) => s.locale)
  const imageMutation = useMutation<LlmImageResult, Error, string>({
    mutationFn: (prompt) => generateLlmImageFn({ data: { prompt } }),
    onSuccess: () => {
      // 이미지도 구독 한도를 쓰니 잔량을 다시 불러온다.
      void queryClient.invalidateQueries({
        queryKey: llmPlanUsageQueryOptions(provider).queryKey,
      })
    },
    onError: () => toast.error(t.imageFailedToast),
  })
  const imageResult = imageMutation.data

  async function onGenerateImage() {
    // 프롬프트만 검증한다(다른 필드는 이미지 생성과 무관하다).
    if (!(await form.trigger('prompt'))) return
    imageMutation.mutate(form.getValues('prompt').trim())
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
    <Card className="flex-1">
      <CardContent className="flex gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">{t.heading}</h2>
            <p className="text-sm text-muted-foreground">{t.description}</p>
          </div>

          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t.providerLabel}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          // 모델 목록이 provider마다 달라서 provider를 바꾸면 기본값으로 되돌린다.
                          form.setValue('model', DEFAULT_MODEL)
                          // 웹 검색은 구독 provider 전용이라 API 키 provider로 바꾸면 끈다.
                          if (!hasPlanUsage(value as LlmProvider)) {
                            form.setValue('enableWebSearch', false)
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LLM_PROVIDERS.map((id) => {
                            const available =
                              statuses.find((s) => s.provider === id)
                                ?.available ?? false
                            return (
                              <SelectItem
                                key={id}
                                value={id}
                                disabled={!available}
                              >
                                {LLM_PROVIDER_LABELS[id]}
                                {!available && ` (${t.unavailable})`}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      {isUnavailable && status?.hint && (
                        <p className="text-sm text-destructive">
                          {t.unavailableHint(status.hint)}
                        </p>
                      )}
                      {needsLogin && (
                        <p className="text-sm text-destructive">
                          {t.loginRequired}
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t.modelLabel}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DEFAULT_MODEL}>
                            {t.modelDefault}
                          </SelectItem>
                          {LLM_MODELS[provider].map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {hasPlanUsage(provider) && (
                <p className="text-xs text-muted-foreground">
                  {t.subscriptionNotice}
                </p>
              )}

              <FormField
                control={form.control}
                name="enableWebSearch"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel>{t.webSearchLabel}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {hasPlanUsage(provider)
                          ? t.webSearchDescription
                          : t.webSearchApiUnsupported}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!hasPlanUsage(provider)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.systemLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder={t.systemPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.promptLabel}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder={t.promptPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={mutation.isPending || isUnavailable || needsLogin}
                  >
                    {mutation.isPending ? t.running : t.run}
                  </Button>
                  {canGenerateImage && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        imageMutation.isPending || isUnavailable || needsLogin
                      }
                      onClick={() => void onGenerateImage()}
                    >
                      {imageMutation.isPending
                        ? t.generatingImage
                        : t.generateImage}
                    </Button>
                  )}
                </div>
                {canGenerateImage && (
                  <p className="pt-2 text-xs text-muted-foreground">
                    {t.imageNotice}
                  </p>
                )}
                {mutation.isPending && form.getValues('enableWebSearch') && (
                  <p className="pt-2 text-xs text-muted-foreground">
                    {t.webSearchSlow}
                  </p>
                )}
              </div>
            </form>
          </Form>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-bold">{t.responseHeading}</h3>
            <div className="min-h-32 rounded-xl bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result ? (
                result.text
              ) : (
                <span className="text-muted-foreground">{t.emptyResponse}</span>
              )}
            </div>
          </section>

          {canGenerateImage && (imageMutation.isPending || imageResult) && (
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">{t.imageHeading}</h3>
              <div className="flex flex-col gap-4 rounded-xl bg-muted/50 p-4 text-sm">
                {imageMutation.isPending && (
                  <span className="text-muted-foreground">
                    {t.generatingImage}
                  </span>
                )}
                {imageResult?.failure && (
                  <span className="text-destructive">
                    {imageResult.failure.resetsAt
                      ? t.imageLimitExceeded(
                          formatReset(imageResult.failure.resetsAt),
                        )
                      : t.imageLimitExceededNoTime}
                  </span>
                )}
                {imageResult &&
                  !imageResult.failure &&
                  imageResult.images.length === 0 && (
                    <span className="text-muted-foreground">
                      {imageResult.text || t.imageEmpty}
                    </span>
                  )}
                {imageResult?.images.map((image, index) => (
                  <figure key={index} className="flex flex-col gap-2">
                    <img
                      src={image.dataUrl}
                      alt={image.revisedPrompt ?? t.imageHeading}
                      className="max-h-96 w-fit rounded-lg border"
                    />
                    {image.revisedPrompt && (
                      <figcaption className="text-xs text-muted-foreground">
                        {t.imageRevisedPrompt(image.revisedPrompt)}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex w-80 shrink-0 flex-col gap-4">
          <LlmPlanUsage provider={provider} />
          {result?.usage && <RunUsage usage={result.usage} />}
        </aside>
      </CardContent>
    </Card>
  )
}

function RunUsage({ usage }: { usage: NonNullable<LlmRunResult['usage']> }) {
  const t = useTranslation().llmRunner
  const rows = [
    [t.inputTokens, usage.inputTokens],
    [t.outputTokens, usage.outputTokens],
    [t.cachedTokens, usage.cachedInputTokens],
    [t.reasoningTokens, usage.reasoningTokens],
  ] as const

  return (
    <section className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4">
      <h3 className="text-sm font-bold">{t.runUsageHeading}</h3>
      <dl className="flex flex-col gap-1 text-sm">
        {rows.map(
          ([label, value]) =>
            value !== undefined && (
              <div key={label} className="flex justify-between">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value.toLocaleString()}</dd>
              </div>
            ),
        )}
        {usage.costUsd !== undefined && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t.cost}</dt>
            <dd>${usage.costUsd.toFixed(4)}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
