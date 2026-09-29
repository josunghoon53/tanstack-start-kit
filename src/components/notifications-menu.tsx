import { useSuspenseQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { NOTIFICATION_CATEGORIES, NOTIFICATION_ICONS } from '@/config/notifications'
import { notificationsQueryOptions } from '@/server/notifications'

export function NotificationsMenu() {
  const { data: notifications } = useSuspenseQuery(notificationsQueryOptions())
  const [category, setCategory] = useState<string | null>(null)
  const items = category
    ? notifications.filter((item) => item.category === category)
    : notifications

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative focus-visible:ring-0"
        >
          <span className="sr-only">알림</span>
          <Bell className="size-6" />
          <span className="absolute -top-1 -right-1 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] leading-none font-bold text-white ring-2 ring-background">
            {notifications.length}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>알림</DropdownMenuLabel>
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto px-2 pb-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
              category === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-accent',
            )}
          >
            전체
          </button>
          {NOTIFICATION_CATEGORIES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
                category === value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-accent',
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            해당 카테고리의 알림이 없어요.
          </p>
        )}
        {items.map((item, index) => {
          const Icon = NOTIFICATION_ICONS[item.iconKey]
          return (
            <div key={index} className="flex items-start gap-3 px-2 py-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm text-foreground">{item.message}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
