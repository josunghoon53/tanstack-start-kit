import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ColorThemePicker } from '@/components/color-theme-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/settings')({ component: Settings })

// 탭을 추가/제거하려면 이 배열만 고치면 됩니다.
const SETTINGS_SECTIONS = [
  { key: 'general', label: '일반', component: GeneralSection },
  { key: 'theme', label: '테마', component: ThemeSection },
  { key: 'security', label: '보안', component: SecuritySection },
] as const

function Settings() {
  const [activeKey, setActiveKey] = useState<string>(SETTINGS_SECTIONS[0].key)
  const active =
    SETTINGS_SECTIONS.find((item) => item.key === activeKey) ?? SETTINGS_SECTIONS[0]
  const ActiveSection = active.component

  return (
    <div className="flex flex-1 gap-8">
      <nav className="-mt-4 flex w-40 shrink-0 flex-col gap-1 self-stretch border-r pt-4 pr-4">
        {SETTINGS_SECTIONS.map((item) => (
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
    </div>
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
        <span className={cn('text-sm text-muted-foreground', descriptionClassName)}>
          {description}
        </span>
      </div>
      {children}
    </div>
  )
}

const generalSchema = z.object({
  siteName: z.string().trim().min(1, '사이트 이름을 입력해주세요.'),
  notifyEmail: z.boolean(),
  maintenanceMode: z.boolean(),
})

type GeneralValues = z.infer<typeof generalSchema>

function GeneralSection() {
  const { control, register, handleSubmit, formState } = useForm<GeneralValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: { siteName: 'My Admin', notifyEmail: true, maintenanceMode: false },
  })

  function onSubmit() {
    toast.success('일반 설정이 저장됐어요.')
  }

  function onInvalid(errors: typeof formState.errors) {
    toast.error(errors.siteName?.message ?? '입력값을 확인해주세요.')
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <h2 className="pb-2 text-lg font-bold">일반</h2>
      <div className="rounded-xl bg-muted/50 px-4">
        <SettingRow
          htmlFor="site-name"
          label="사이트 이름"
          description={formState.errors.siteName?.message ?? '관리자 콘솔 상단에 표시돼요.'}
          descriptionClassName={formState.errors.siteName ? 'text-destructive' : undefined}
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
          label="이메일 알림"
          description="새 주문/결제 발생 시 이메일로 알려드려요."
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
          label="점검 모드"
          description="활성화하면 관리자 외 접근이 제한돼요."
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
          저장
        </Button>
      </div>
    </form>
  )
}

function ThemeSection() {
  return (
    <div className="flex flex-col">
      <h2 className="pb-2 text-lg font-bold">테마</h2>
      <div className="rounded-xl bg-muted/50 px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <Label>강조 색상</Label>
            <span className="text-sm text-muted-foreground">
              버튼, 링크 등에 사용되는 포인트 컬러를 선택하세요.
            </span>
          </div>
          <ColorThemePicker />
        </div>
      </div>
    </div>
  )
}

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 해요.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: '새 비밀번호가 일치하지 않아요.',
    path: ['confirmPassword'],
  })

type SecurityValues = z.infer<typeof securitySchema>

function SecuritySection() {
  const { register, handleSubmit, reset, formState } = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const { errors } = formState

  function onSubmit() {
    reset()
    toast.success('비밀번호가 변경됐어요.')
  }

  function onInvalid(invalidErrors: typeof errors) {
    const message =
      invalidErrors.currentPassword?.message ??
      invalidErrors.newPassword?.message ??
      invalidErrors.confirmPassword?.message
    toast.error(message ?? '입력값을 확인해주세요.')
  }

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <h2 className="pb-2 text-lg font-bold">보안</h2>
      <div className="rounded-xl bg-muted/50 px-4">
        <SettingRow
          htmlFor="current-password"
          label="현재 비밀번호"
          description={errors.currentPassword?.message ?? '본인 확인을 위해 입력해주세요.'}
          descriptionClassName={errors.currentPassword ? 'text-destructive' : undefined}
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
          label="새 비밀번호"
          description={errors.newPassword?.message ?? '8자 이상으로 설정해주세요.'}
          descriptionClassName={errors.newPassword ? 'text-destructive' : undefined}
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
          label="새 비밀번호 확인"
          description={errors.confirmPassword?.message ?? '같은 비밀번호를 한 번 더 입력해주세요.'}
          descriptionClassName={errors.confirmPassword ? 'text-destructive' : undefined}
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
          비밀번호 변경
        </Button>
      </div>
    </form>
  )
}
