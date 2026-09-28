import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
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
import { NAV_ITEMS, type NavSection } from '@/config/nav'

const TRUNK_X = 8
const STUB_END_X = 16
const CORNER_RADIUS = 6

function findOpenGroup(pathname: string) {
  return NAV_ITEMS.find(
    (item) =>
      item.type === 'group' &&
      item.sections.some((section) => section.items.some((leaf) => leaf.href === pathname)),
  )?.label
}

function GroupSubmenu({
  sections,
  pathname,
}: {
  sections: Array<NavSection>
  pathname: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [branchYs, setBranchYs] = useState<Array<number>>([])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const leaves = Array.from(container.querySelectorAll<HTMLElement>('[data-tree-leaf]'))
    const containerTop = container.getBoundingClientRect().top
    setBranchYs(
      leaves.map((el) => {
        const rect = el.getBoundingClientRect()
        return rect.top - containerTop + rect.height / 2
      }),
    )
  }, [sections])

  const lastY = branchYs.at(-1) ?? 0
  const cornerStartY = Math.max(lastY - CORNER_RADIUS, 0)

  return (
    <div ref={containerRef} className="relative">
      {branchYs.length > 0 && (
        <svg
          width={STUB_END_X}
          height={lastY}
          viewBox={`0 0 ${STUB_END_X} ${lastY}`}
          className="pointer-events-none absolute top-0 left-0 text-muted-foreground/50"
          aria-hidden="true"
        >
          <path
            d={`M${TRUNK_X} 0 L${TRUNK_X} ${cornerStartY} Q${TRUNK_X} ${lastY} ${TRUNK_X + CORNER_RADIUS} ${lastY} H${STUB_END_X}`}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          {branchYs.slice(0, -1).map((y) => (
            <path
              key={y}
              d={`M${TRUNK_X} ${y} H${STUB_END_X}`}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </svg>
      )}
      {sections.map((section) => (
        <div key={section.label} className="pt-4 first:pt-1">
          <div className="pb-1.5 text-xs font-medium text-muted-foreground">
            {section.label}
          </div>
          <div className="flex flex-col gap-1 pl-4">
            {section.items.map((leaf) => {
              const LeafIcon = leaf.icon
              return (
                <SidebarMenuSubItem key={leaf.href} data-tree-leaf>
                  <SidebarMenuSubButton asChild isActive={pathname === leaf.href} className="h-8">
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
      ))}
    </div>
  )
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
                          <GroupSubmenu sections={item.sections} pathname={pathname} />
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
