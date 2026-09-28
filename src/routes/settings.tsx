import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/settings')({ component: Settings })

const SECTIONS = ['일반', '보안'] as const
type Section = (typeof SECTIONS)[number]

function Settings() {
  const [section, setSection] = useState<Section>('일반')

  return (
    <div className="flex gap-8">
      <nav className="flex w-40 shrink-0 flex-col gap-1">
        {SECTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSection(item)}
            className={cn(
              'rounded-md px-3 py-2 text-left text-sm transition-colors',
              section === item
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="max-w-2xl flex-1">
        {section === '일반' ? <GeneralSection /> : <SecuritySection />}
      </div>
    </div>
  )
}

function SettingRow({
  htmlFor,
  label,
  description,
  children,
  last,
}: {
  htmlFor: string
  label: string
  description: string
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
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      {children}
    </div>
  )
}

function GeneralSection() {
  const [siteName, setSiteName] = useState('My Admin')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <div className="flex flex-col">
      <h2 className="pb-2 text-lg font-bold">일반</h2>
      <SettingRow
        htmlFor="site-name"
        label="사이트 이름"
        description="관리자 콘솔 상단에 표시돼요."
      >
        <Input
          id="site-name"
          className="w-56"
          value={siteName}
          onChange={(event) => setSiteName(event.target.value)}
        />
      </SettingRow>
      <SettingRow
        htmlFor="notify-email"
        label="이메일 알림"
        description="새 주문/결제 발생 시 이메일로 알려드려요."
      >
        <Switch
          id="notify-email"
          checked={notifyEmail}
          onCheckedChange={setNotifyEmail}
        />
      </SettingRow>
      <SettingRow
        htmlFor="maintenance-mode"
        label="점검 모드"
        description="활성화하면 관리자 외 접근이 제한돼요."
        last
      >
        <Switch
          id="maintenance-mode"
          checked={maintenanceMode}
          onCheckedChange={setMaintenanceMode}
        />
      </SettingRow>
      <div className="pt-4">
        <Button type="button" size="sm">
          저장
        </Button>
      </div>
    </div>
  )
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className="flex flex-col">
      <h2 className="pb-2 text-lg font-bold">보안</h2>
      <SettingRow
        htmlFor="current-password"
        label="현재 비밀번호"
        description="본인 확인을 위해 입력해주세요."
      >
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          className="w-56"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </SettingRow>
      <SettingRow
        htmlFor="new-password"
        label="새 비밀번호"
        description="8자 이상으로 설정해주세요."
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className="w-56"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </SettingRow>
      <SettingRow
        htmlFor="confirm-password"
        label="새 비밀번호 확인"
        description="같은 비밀번호를 한 번 더 입력해주세요."
        last
      >
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className="w-56"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </SettingRow>
      <div className="pt-4">
        <Button type="button" size="sm">
          비밀번호 변경
        </Button>
      </div>
    </div>
  )
}
