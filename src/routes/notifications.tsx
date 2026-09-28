import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NOTIFICATIONS } from '@/config/notifications'

export const Route = createFileRoute('/notifications')({
  component: Notifications,
})

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
