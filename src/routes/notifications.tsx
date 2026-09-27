import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/placeholder-page'

export const Route = createFileRoute('/notifications')({
  component: Notifications,
})

function Notifications() {
  return (
    <PlaceholderPage
      title="알림"
      description="필요한 위젯을 여기에 하나씩 추가하세요."
    />
  )
}
