import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/placeholder-page'

export const Route = createFileRoute('/analytics')({ component: Analytics })

function Analytics() {
  return (
    <PlaceholderPage
      title="분석"
      description="필요한 위젯을 여기에 하나씩 추가하세요."
    />
  )
}
