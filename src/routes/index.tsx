import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { m } from 'motion/react'
import { AnimatedNumber } from '@/components/animated-number'
import { Sparkline } from '@/components/sparkline'
import { StatusDot } from '@/components/status-dot'
import { WeeklyBars } from '@/components/weekly-bars'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ORDER_STATUS_TONE } from '@/config/orders'
import { NOTIFICATION_ICONS } from '@/config/notifications'
import { ordersQueryOptions } from '@/server/orders'
import { notificationsQueryOptions } from '@/server/notifications'
import { useTranslation } from '@/i18n/use-translation'
import { fade, fadeUp, staggerDelay } from '@/lib/motion'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions()),
  component: Dashboard,
})

// 아래 추이/주간 수치는 킷의 데모 데이터다. 실제 지표를 붙일 때 서버 함수에서 받아 교체할 것.
const REVENUE_TREND = [2, 5, 4, 8, 6, 12, 10, 16]
const ORDERS_TREND = [4, 2, 9, 6, 11, 8, 14, 12]
const USERS_TREND = [16, 14, 15, 10, 11, 6, 8, 3]
const WEEKLY_REVENUE = [40, 55, 35, 70, 60, 48, 92]
const WEEKLY_TOTAL = '₩8,400,000'

// 진입 애니메이션: KPI 칸 4개(0~3) → 최근 주문(4) → 최근 알림(5) → 주간 매출(6) 순으로 60ms씩 늦게
// 올라온다(fadeUp, 마지막 카드까지 약 0.66초). 데이터·서버 함수는 그대로다.
const MotionCard = m.create(Card)
const ORDERS_CARD = 4
const NOTIFICATIONS_CARD = 5
const WEEKLY_CARD = 6

function Dashboard() {
  const t = useTranslation()
  const { data: orders } = useSuspenseQuery(ordersQueryOptions())
  const { data: notifications } = useSuspenseQuery(notificationsQueryOptions())

  const stats = [
    {
      ...t.dashboard.stats.todayRevenue,
      value: '₩1,240,000',
      trend: REVENUE_TREND,
      tone: 'positive' as const,
    },
    {
      ...t.dashboard.stats.newOrders,
      value: '18건',
      trend: ORDERS_TREND,
      tone: 'positive' as const,
    },
    {
      ...t.dashboard.stats.newUsers,
      value: '6명',
      trend: USERS_TREND,
      tone: 'negative' as const,
    },
    {
      ...t.dashboard.stats.unreadNotifications,
      value: t.dashboard.unreadCount(notifications.length),
      trend: null,
      tone: 'positive' as const,
    },
  ]

  return (
    <m.div initial="hidden" animate="visible" className="flex flex-col gap-4">
      <MotionCard
        variants={fade}
        className="grid grid-cols-4 gap-0 divide-x py-0"
      >
        {stats.map((stat, index) => (
          <m.div
            key={stat.label}
            variants={fadeUp}
            custom={index}
            className="flex flex-col gap-2 px-5 py-4"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
            <AnimatedNumber
              value={stat.value}
              delay={staggerDelay(index)}
              className="text-3xl tracking-tight [font-family:var(--font-title)] [font-weight:var(--weight-title)]"
            />
            <div className="flex items-end justify-between gap-2">
              <span className="text-sm text-muted-foreground">{stat.hint}</span>
              {stat.trend && (
                <Sparkline
                  values={stat.trend}
                  tone={stat.tone}
                  delay={staggerDelay(index) + 0.1}
                />
              )}
            </div>
          </m.div>
        ))}
      </MotionCard>

      <div className="grid grid-cols-[1.7fr_1fr] gap-4">
        <MotionCard variants={fadeUp} custom={ORDERS_CARD}>
          <CardHeader>
            <CardTitle>{t.dashboard.recentOrders.title}</CardTitle>
            <CardDescription>
              <Link to="/orders" className="hover:text-primary hover:underline">
                {t.dashboard.recentOrders.viewAll}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="border-y">
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orders.columns.id}</TableHead>
                  <TableHead>{t.orders.columns.customer}</TableHead>
                  <TableHead>{t.orders.columns.amount}</TableHead>
                  <TableHead>{t.orders.columns.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 4).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <StatusDot tone={ORDER_STATUS_TONE[order.status]}>
                        {order.status}
                      </StatusDot>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </MotionCard>

        <div className="flex flex-col gap-4">
          <MotionCard variants={fadeUp} custom={NOTIFICATIONS_CARD}>
            <CardHeader>
              <CardTitle>{t.dashboard.recentNotifications.title}</CardTitle>
              <CardDescription>
                {t.dashboard.recentNotifications.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {notifications.slice(0, 4).map((item, index) => {
                const Icon = NOTIFICATION_ICONS[item.iconKey]
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg px-2 py-2"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/10">
                      <Icon className="size-4 text-ink" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm">{item.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </MotionCard>

          <MotionCard variants={fadeUp} custom={WEEKLY_CARD}>
            <CardHeader>
              <CardTitle>{t.dashboard.weeklyRevenue.title}</CardTitle>
              <CardDescription>{WEEKLY_TOTAL}</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyBars
                values={WEEKLY_REVENUE}
                label={t.dashboard.weeklyRevenue.title}
                delay={staggerDelay(WEEKLY_CARD) + 0.05}
              />
            </CardContent>
          </MotionCard>
        </div>
      </div>
    </m.div>
  )
}
