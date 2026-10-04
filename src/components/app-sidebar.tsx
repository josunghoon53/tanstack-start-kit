import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { LanguageToggle } from '@/components/language-toggle'
import { NavHeader } from '@/components/nav-header'
import { NavUser } from '@/components/nav-user'
import { TreeConnector } from '@/components/tree-connector'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { getNavItems } from '@/config/nav'
import type { NavItem, NavSection } from '@/config/nav'
import { useAccordionGroup } from '@/hooks/use-accordion-group'
import { useTreeBranches } from '@/hooks/use-tree-branches'
import { useLocaleStore } from '@/i18n/locale-store'

function findOpenGroup(navItems: Array<NavItem>, pathname: string) {
  return navItems.find(
    (item) =>
      item.type === 'group' &&
      item.sections.some((section) =>
        section.items.some((leaf) => leaf.href === pathname),
      ),
  )?.label
}

function GroupSubmenu({
  sections,
  pathname,
  isOpen,
}: {
  sections: Array<NavSection>
  pathname: string
  isOpen: boolean
}) {
  const { containerRef, branchYs } = useTreeBranches<HTMLDivElement>(isOpen, [
    sections,
  ])

  return (
    <div ref={containerRef} className="relative">
      <TreeConnector branchYs={branchYs} />
      {sections.map((section) => (
        <div key={section.label} className="pt-4 first:pt-1">
          <div className="pb-1.5 pl-6 text-xs font-medium text-sidebar-foreground/70">
            {section.label}
          </div>
          <div className="flex flex-col gap-1 pl-6">
            {section.items.map((leaf) => {
              const LeafIcon = leaf.icon
              return (
                <SidebarMenuSubItem key={leaf.href} data-tree-leaf>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === leaf.href}
                    className="h-8"
                  >
                    <Link to={leaf.href}>
                      <LeafIcon />
                      <span className="leading-none">{leaf.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AppSidebar() {
  const locale = useLocaleStore((state) => state.locale)
  const navItems = getNavItems(locale)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const { isOpen, setOpen } = useAccordionGroup(
    findOpenGroup(navItems, pathname),
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border py-0">
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                if (item.type === 'link') {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link to={item.href}>
                          <Icon />
                          <span className="leading-none">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const Icon = item.icon
                const isGroupActive = item.sections.some((section) =>
                  section.items.some((leaf) => leaf.href === pathname),
                )

                return (
                  <Collapsible
                    key={item.label}
                    open={isOpen(item.label)}
                    onOpenChange={(open) => setOpen(item.label, open)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isGroupActive}>
                          <Icon />
                          <span className="leading-none">{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mx-0 gap-1.5 border-l-0 px-2 py-1.5">
                          <GroupSubmenu
                            sections={item.sections}
                            pathname={pathname}
                            isOpen={isOpen(item.label)}
                          />
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator className="mx-0" />
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <NavUser />
          </div>
          <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
            <LanguageToggle className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
