import ThemeToggle from './ThemeToggle'

export function SiteHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <h1 className="text-sm font-semibold">대시보드</h1>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
