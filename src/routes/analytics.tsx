import { createFileRoute } from '@tanstack/react-router'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/analytics')({ component: Analytics })

const STATS = [
  { label: '총 매출', value: '₩42,180,000', hint: '지난 30일' },
  { label: '신규 사용자', value: '312명', hint: '지난 30일' },
  { label: '주문 수', value: '1,048건', hint: '지난 30일' },
  { label: '전환율', value: '3.2%', hint: '지난 30일' },
]

function Analytics() {
  return (
    <div className="grid grid-cols-4 gap-4">
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
  )
}
