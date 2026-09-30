import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { StatusDot } from '@/components/status-dot'
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

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions()),
  component: Dashboard,
})

function Dashboard() {
  const t = useTranslation()
  const { data: orders } = useSuspenseQuery(ordersQueryOptions())
  const { data: notifications } = useSuspenseQuery(notificationsQueryOptions())

  const stats = [
    { ...t.dashboard.stats.todayRevenue, value: '₩1,240,000' },
    { ...t.dashboard.stats.newOrders, value: '18건' },
    { ...t.dashboard.stats.newUsers, value: '6명' },
    {
      ...t.dashboard.stats.unreadNotifications,
      value: t.dashboard.unreadCount(notifications.length),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
              <CardDescription>{stat.hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
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
        </Card>

        <Card>
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
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-4 text-primary" />
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
        </Card>
      </div>
    </div>
  )
}
