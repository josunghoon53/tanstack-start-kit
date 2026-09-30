import { Link } from '@tanstack/react-router'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useTranslation } from '@/i18n/use-translation'

export function NavHeader() {
  const t = useTranslation()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link to="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              A
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">{t.navHeader.brand}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t.navHeader.tagline}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
