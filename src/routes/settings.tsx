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

export const Route = createFileRoute('/settings')({ component: Settings })

function Settings() {
  const [siteName, setSiteName] = useState('My Admin')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>설정</CardTitle>
        <CardDescription>사이트 기본 설정을 관리하세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex max-w-md flex-col gap-6">
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
