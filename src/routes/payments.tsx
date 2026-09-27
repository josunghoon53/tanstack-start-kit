import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/placeholder-page'

export const Route = createFileRoute('/payments')({ component: Payments })

function Payments() {
  return (
    <PlaceholderPage
      title="결제"
      description="필요한 위젯을 여기에 하나씩 추가하세요."
    />
  )
}
