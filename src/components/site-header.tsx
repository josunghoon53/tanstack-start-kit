import { useRouterState } from '@tanstack/react-router'
import { NotificationsMenu } from '@/components/notifications-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getNavItems } from '@/config/nav'
import type { NavItem } from '@/config/nav'
import { useLocaleStore } from '@/i18n/locale-store'

function findTitle(navItems: Array<NavItem>, pathname: string) {
  for (const item of navItems) {
    if (item.type === 'link') {
      if (item.href === pathname) return item.label
      continue
    }
    for (const section of item.sections) {
      const leaf = section.items.find(
        (candidate) => candidate.href === pathname,
      )
      if (leaf) return leaf.label
    }
  }
  return ''
}

export function SiteHeader() {
  const locale = useLocaleStore((state) => state.locale)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const title = findTitle(getNavItems(locale), pathname)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="ml-auto">
        <NotificationsMenu />
      </div>
    </header>
  )
}
