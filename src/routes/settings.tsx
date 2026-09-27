import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/placeholder-page'

export const Route = createFileRoute('/settings')({ component: Settings })

function Settings() {
  return (
    <PlaceholderPage
      title="설정"
      description="필요한 위젯을 여기에 하나씩 추가하세요."
    />
  )
}
