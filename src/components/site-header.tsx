import { useRouterState } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NAV_ITEMS } from '@/config/nav'
import ThemeToggle from './ThemeToggle'

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const title = NAV_ITEMS.find((item) => item.href === pathname)?.label ?? ''

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-semibold">{title}</h1>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
