import { createFileRoute } from '@tanstack/react-router'
import { Bell, CreditCard, Package, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/notifications')({
  component: Notifications,
})

const NOTIFICATIONS = [
  {
    icon: UserPlus,
    message: '최유나 님이 새로 가입했어요.',
    time: '5분 전',
  },
  {
    icon: Package,
    message: 'ORD-1042 주문이 배송을 시작했어요.',
    time: '32분 전',
  },
  {
    icon: CreditCard,
    message: 'PAY-9078 결제가 환불 처리됐어요.',
    time: '1시간 전',
  },
  {
    icon: Bell,
    message: '무선 이어폰 Pro 재고가 소진됐어요.',
    time: '어제',
  },
]

function Notifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>알림</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {NOTIFICATIONS.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-accent"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm">{item.message}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
