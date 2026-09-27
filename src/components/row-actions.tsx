import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function RowActions({ label }: { label: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <span className="sr-only">{label} 작업 열기</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>작업</DropdownMenuLabel>
        <DropdownMenuItem>
          <Eye />
          보기
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil />
          수정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 />
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
