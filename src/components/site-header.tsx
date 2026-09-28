import { useRouterState } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NAV_ITEMS } from '@/config/nav'
import ThemeToggle from './ThemeToggle'

function findTitle(pathname: string) {
  for (const item of NAV_ITEMS) {
    if (item.type === 'link') {
      if (item.href === pathname) return item.label
      continue
    }
    for (const section of item.sections) {
      const leaf = section.items.find((candidate) => candidate.href === pathname)
      if (leaf) return leaf.label
    }
  }
  return ''
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const title = findTitle(pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
