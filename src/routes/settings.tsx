import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ColorThemePicker } from '@/components/color-theme-picker'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/use-translation'

export const Route = createFileRoute('/settings')({ component: Settings })

function Settings() {
  const t = useTranslation().settings
  // 탭 라벨이 로케일에 따라 바뀌어야 해서 이 배열은 모듈 스코프가 아니라 컴포넌트 안에서 만든다.
  const settingsSections = [
    { key: 'general', label: t.tabs.general, component: GeneralSection },
    { key: 'theme', label: t.tabs.theme, component: ThemeSection },
    { key: 'security', label: t.tabs.security, component: SecuritySection },
  ] as const
  const [activeKey, setActiveKey] = useState<string>(settingsSections[0].key)
  const active =
    settingsSections.find((item) => item.key === activeKey) ??
    settingsSections[0]
  const ActiveSection = active.component

  return (
    <Card className="flex-1">
      <CardContent className="flex gap-8">
        <nav className="flex w-40 shrink-0 flex-col gap-1 self-stretch border-r pr-4">
          {settingsSections.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveKey(item.key)}
              className={cn(
                'rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeKey === item.key
                  ? 'bg-primary/12 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="max-w-2xl flex-1">
          <ActiveSection />
        </div>
      </CardContent>
    </Card>
  )
}

function SettingRow({
  htmlFor,
  label,
  description,
  descriptionClassName,
  children,
  last,
}: {
  htmlFor: string
  label: string
  description: string
  descriptionClassName?: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-8 py-4',
        !last && 'border-b',
      )}
    >
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        <span
          className={cn('text-sm text-muted-foreground', descriptionClassName)}
        >
          {description}
        </span>
      </div>
      {children}
    </div>
  )
}

// 매개변수 타입을 Messages['settings']['general']이 아니라 string으로 넓혀서 선언한다 —
// `as const` 딕셔너리의 ko/en 리터럴 유니언 타입은 서로 대입할 수 없어서 그대로 쓰면 에러가 난다.
function createGeneralSchema(t: { siteNameRequired: string }) {
  return z.object({
    siteName: z.string().trim().min(1, t.siteNameRequired),
    notifyEmail: z.boolean(),
    maintenanceMode: z.boolean(),
  })
}

type GeneralValues = z.infer<ReturnType<typeof createGeneralSchema>>

function GeneralSection() {
  const t = useTranslation().settings
  const common = useTranslation().common
  const generalSchema = useMemo(() => createGeneralSchema(t.general), [t])
  const { control, register, handleSubmit, formState } = useForm<GeneralValues>(
    {
      resolver: zodResolver(generalSchema),
      defaultValues: {
        siteName: 'My Admin',
        notifyEmail: true,
        maintenanceMode: false,
      },
    },
  )

  function onSubmit() {
    toast.success(t.general.savedToast)
  }

  function onInvalid(errors: typeof formState.errors) {
    toast.error(errors.siteName?.message ?? t.general.checkInputToast)
  }

  return (
    <form
      className="flex flex-col"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
    >
      <h2 className="pb-2 text-lg font-bold">{t.general.heading}</h2>
      <div className="rounded-xl bg-muted/50 px-4">
        <SettingRow
          htmlFor="site-name"
          label={t.general.siteNameLabel}
          description={
            formState.errors.siteName?.message ?? t.general.siteNameDescription
          }
          descriptionClassName={
            formState.errors.siteName ? 'text-destructive' : undefined
          }
        >
          <Input
            id="site-name"
            className="w-56"
            aria-invalid={Boolean(formState.errors.siteName)}
            {...register('siteName')}
          />
        </SettingRow>
        <SettingRow
          htmlFor="notify-email"
          label={t.general.notifyEmailLabel}
          description={t.general.notifyEmailDescription}
        >
          <Controller
            control={control}
            name="notifyEmail"
            render={({ field }) => (
              <Switch
                id="notify-email"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </SettingRow>
        <SettingRow
          htmlFor="maintenance-mode"
          label={t.general.maintenanceModeLabel}
          description={t.general.maintenanceModeDescription}
          last
        >
          <Controller
            control={control}
            name="maintenanceMode"
            render={({ field }) => (
              <Switch
                id="maintenance-mode"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </SettingRow>
      </div>
      <div className="pt-4">
        <Button type="submit" size="sm">
          {common.save}
        </Button>
      </div>
    </form>
  )
}

function ThemeSection() {
  const t = useTranslation().settings

  return (
    <div className="flex flex-col">
      <h2 className="pb-2 text-lg font-bold">{t.theme.heading}</h2>
      <div className="rounded-xl bg-muted/50 px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <Label>{t.theme.accentColorLabel}</Label>
            <span className="text-sm text-muted-foreground">
              {t.theme.accentColorDescription}
            </span>
          </div>
          <ColorThemePicker />
        </div>
      </div>
    </div>
  )
}

function createSecuritySchema(t: {
  currentPasswordRequired: string
  newPasswordMinLength: string
  confirmPasswordMismatch: string
}) {
  return z
    .object({
      currentPassword: z.string().min(1, t.currentPasswordRequired),
      newPassword: z.string().min(8, t.newPasswordMinLength),
      confirmPassword: z.string(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t.confirmPasswordMismatch,
      path: ['confirmPassword'],
    })
}

type SecurityValues = z.infer<ReturnType<typeof createSecuritySchema>>

function SecuritySection() {
  const t = useTranslation().settings
  const securitySchema = useMemo(() => createSecuritySchema(t.security), [t])
  const { register, handleSubmit, reset, formState } = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const { errors } = formState

  function onSubmit() {
    reset()
    toast.success(t.security.savedToast)
  }

  function onInvalid(invalidErrors: typeof errors) {
    const message =
      invalidErrors.currentPassword?.message ??
      invalidErrors.newPassword?.message ??
      invalidErrors.confirmPassword?.message
    toast.error(message ?? t.security.checkInputToast)
  }

  return (
    <form
      className="flex flex-col"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
    >
      <h2 className="pb-2 text-lg font-bold">{t.security.heading}</h2>
      <div className="rounded-xl bg-muted/50 px-4">
        <SettingRow
          htmlFor="current-password"
          label={t.security.currentPasswordLabel}
          description={
            errors.currentPassword?.message ??
            t.security.currentPasswordDescription
          }
          descriptionClassName={
            errors.currentPassword ? 'text-destructive' : undefined
          }
        >
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            className="w-56"
            aria-invalid={Boolean(errors.currentPassword)}
            {...register('currentPassword')}
          />
        </SettingRow>
        <SettingRow
          htmlFor="new-password"
          label={t.security.newPasswordLabel}
          description={
            errors.newPassword?.message ?? t.security.newPasswordDescription
          }
          descriptionClassName={
            errors.newPassword ? 'text-destructive' : undefined
          }
        >
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="w-56"
            aria-invalid={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
        </SettingRow>
        <SettingRow
          htmlFor="confirm-password"
          label={t.security.confirmPasswordLabel}
          description={
            errors.confirmPassword?.message ??
            t.security.confirmPasswordDescription
          }
          descriptionClassName={
            errors.confirmPassword ? 'text-destructive' : undefined
          }
          last
        >
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className="w-56"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </SettingRow>
      </div>
      <div className="pt-4">
        <Button type="submit" size="sm">
          {t.security.submit}
        </Button>
      </div>
    </form>
  )
}
