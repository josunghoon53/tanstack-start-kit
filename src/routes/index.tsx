import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  return <div className="p-4">대시보드 준비 중</div>
}
