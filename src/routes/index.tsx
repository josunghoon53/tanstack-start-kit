import { createFileRoute, Link } from '@tanstack/react-router'
import { StatusDot } from '@/components/status-dot'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ORDER_STATUS_TONE, ORDERS } from '@/config/orders'
import { NOTIFICATIONS } from '@/config/notifications'

export const Route = createFileRoute('/')({ component: Dashboard })

const STATS = [
  { label: '오늘 매출', value: '₩1,240,000', hint: '어제 대비 +8%' },
  { label: '신규 주문', value: '18건', hint: '오늘' },
  { label: '신규 사용자', value: '6명', hint: '오늘' },
  { label: '미확인 알림', value: `${NOTIFICATIONS.length}건`, hint: '지금' },
]

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
              <CardDescription>{stat.hint}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
            <CardDescription>
              <Link to="/orders" className="hover:text-foreground hover:underline">
                전체 주문 보기
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>고객</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS.slice(0, 4).map((order) => (
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
            <CardTitle>최근 알림</CardTitle>
            <CardDescription>새로 들어온 활동이에요.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {NOTIFICATIONS.slice(0, 4).map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-start gap-3 rounded-lg px-2 py-2">
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
      </div>
    </div>
  )
}
