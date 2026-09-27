import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>대시보드</CardTitle>
        <CardDescription>
          필요한 위젯을 여기에 하나씩 추가하세요.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
