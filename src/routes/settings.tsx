import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

      <div className="max-w-md flex-1">
        {section === '일반' ? <GeneralSection /> : <SecuritySection />}
      </div>
    </div>
  )
}

function GeneralSection() {
  const [siteName, setSiteName] = useState('My Admin')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>일반</CardTitle>
        <CardDescription>사이트 기본 설정을 관리하세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="site-name">사이트 이름</Label>
          <Input
            id="site-name"
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="notify-email">이메일 알림</Label>
            <span className="text-sm text-muted-foreground">
              새 주문/결제 발생 시 이메일로 알려드려요.
            </span>
          </div>
          <Switch
            id="notify-email"
            checked={notifyEmail}
            onCheckedChange={setNotifyEmail}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="maintenance-mode">점검 모드</Label>
            <span className="text-sm text-muted-foreground">
              활성화하면 관리자 외 접근이 제한돼요.
            </span>
          </div>
          <Switch
            id="maintenance-mode"
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button">저장</Button>
      </CardFooter>
    </Card>
  )
}

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <Card>
      <CardHeader>
        <CardTitle>보안</CardTitle>
        <CardDescription>비밀번호를 변경하세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="current-password">현재 비밀번호</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">새 비밀번호</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="button">비밀번호 변경</Button>
      </CardFooter>
    </Card>
  )
}
