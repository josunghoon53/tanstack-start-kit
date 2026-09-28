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

const ITEM_HEIGHT = 32
const ITEM_GAP = 4
const SLOT = ITEM_HEIGHT + ITEM_GAP
const TRUNK_X = 8
const STUB_END_X = 16

function TreeLines({ count }: { count: number }) {
  const height = (count - 1) * SLOT + ITEM_HEIGHT / 2

  return (
    <svg
      width={STUB_END_X}
      height={height}
      viewBox={`0 0 ${STUB_END_X} ${height}`}
      className="pointer-events-none absolute top-0 left-0 text-border"
      aria-hidden="true"
    >
      <path d={`M${TRUNK_X} 0 V${height}`} stroke="currentColor" fill="none" />
      {Array.from({ length: count }).map((_, index) => {
        const y = index * SLOT + ITEM_HEIGHT / 2
        return (
          <path key={y} d={`M${TRUNK_X} ${y} H${STUB_END_X}`} stroke="currentColor" fill="none" />
        )
      })}
    </svg>
  )
}

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
            <SidebarMenu className="gap-1.5">
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
                        <SidebarMenuSub className="mx-0 gap-1.5 border-l-0 px-2 py-1.5">
                          {item.sections.map((section) => (
                            <div key={section.label} className="pt-4 first:pt-1">
                              <div className="pb-1.5 text-xs font-medium text-muted-foreground">
                                {section.label}
                              </div>
                              <div className="relative pl-4">
                                <TreeLines count={section.items.length} />
                                <div className="flex flex-col gap-1">
                                  {section.items.map((leaf) => {
                                    const LeafIcon = leaf.icon
                                    return (
                                      <SidebarMenuSubItem key={leaf.href}>
                                        <SidebarMenuSubButton
                                          asChild
                                          isActive={pathname === leaf.href}
                                          className="h-8"
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
                              </div>
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
