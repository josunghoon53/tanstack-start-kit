import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { NAV_ITEMS } from '@/config/nav'

function findOpenGroup(pathname: string) {
  return NAV_ITEMS.find(
    (item) =>
      item.type === 'group' &&
      item.sections.some((section) => section.items.some((leaf) => leaf.href === pathname)),
  )?.label
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [openGroup, setOpenGroup] = useState(() => findOpenGroup(pathname))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <span className="px-2 text-sm font-semibold group-data-[collapsible=icon]:hidden">
          Admin
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                if (item.type === 'link') {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link to={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const Icon = item.icon
                const isGroupActive = item.sections.some((section) =>
                  section.items.some((leaf) => leaf.href === pathname),
                )
                const isOpen = openGroup === item.label

                return (
                  <Collapsible
                    key={item.label}
                    open={isOpen}
                    onOpenChange={(open) => setOpenGroup(open ? item.label : undefined)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isGroupActive}>
                          <Icon />
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mx-0 gap-0.5 border-l-0 px-0 pl-6">
                          {item.sections.map((section) => (
                            <div key={section.label} className="pt-3 first:pt-1">
                              <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                                {section.label}
                              </div>
                              {section.items.map((leaf) => {
                                const LeafIcon = leaf.icon
                                return (
                                  <SidebarMenuSubItem key={leaf.href}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === leaf.href}
                                    >
                                      <Link to={leaf.href}>
                                        <LeafIcon />
                                        <span>{leaf.label}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                )
                              })}
                            </div>
                          ))}
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
    </Sidebar>
  )
}
