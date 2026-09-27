import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/placeholder-page'

export const Route = createFileRoute('/contents')({ component: Contents })

function Contents() {
  return (
    <PlaceholderPage
      title="콘텐츠"
      description="필요한 위젯을 여기에 하나씩 추가하세요."
    />
  )
}
