import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StatusDot } from '@/components/status-dot'
import type { StatusTone } from '@/components/status-dot'
import { useTranslation } from '@/i18n/use-translation'

export interface RowDetail {
  label: string
  value: React.ReactNode
}

export interface RowStatus {
  label: string
  tone: StatusTone
}

// 시트 제목 아래 한 줄 요약. 비어 있는 조각은 빼고 ' · '로 잇는다.
// 규칙: [대표 속성(역할·주문자·카테고리·작성자), '라벨 값' 형태의 날짜(없으면 대표 수치)].
export function joinSummary(
  ...parts: Array<string | number | null | undefined | false>
) {
  return parts
    .filter((part) => part !== '' && part != null && part !== false)
    .join(' · ')
}

// "보기" 시트 본문: 왼쪽 라벨(고정 폭) / 오른쪽 값, 행 사이 얇은 구분선.
function DetailList({ details }: { details: Array<RowDetail> }) {
  return (
    <dl className="divide-y">
      {details.map((detail) => (
        <div
          key={detail.label}
          data-slot="row-detail"
          className="grid grid-cols-[96px_1fr] items-baseline gap-4 py-3"
        >
          <dt className="text-sm text-muted-foreground">{detail.label}</dt>
          <dd className="text-sm font-medium break-words">{detail.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function RowActions({
  label,
  details,
  summary,
  status,
}: {
  label: string
  details?: Array<RowDetail>
  // 제목 아래 한 줄 요약(예: "관리자 · 가입일 2026-01-14"). 없으면 요약 줄을 그리지 않는다.
  summary?: string
  // 제목 옆 상태 배지(점 + 글자). 리스트의 *_STATUS_TONE과 같은 tone을 넘긴다.
  status?: RowStatus
}) {
  const t = useTranslation()
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // 시트의 수정/삭제 버튼으로 닫을 때는 포커스를 트리거로 돌리지 않는다(바로 다이얼로그가 받는다).
  const handingOffRef = useRef(false)

  function handleSaveEdit() {
    setEditOpen(false)
    toast.success(t.rowActions.editSuccessToast(editValue))
  }

  function handleConfirmDelete() {
    toast.success(t.rowActions.deleteSuccessToast(label))
  }

  function openEdit() {
    setEditValue(label)
    setEditOpen(true)
  }

  // 시트 → 다이얼로그: 시트를 먼저 닫고 같은 렌더에서 다이얼로그를 연다(겹쳐 띄우지 않는다).
  // 다이얼로그가 닫히면 포커스는 행의 작업 버튼으로 돌아간다(returnFocusToTrigger).
  function handOff(open: () => void) {
    handingOffRef.current = true
    setViewOpen(false)
    open()
  }

  function returnFocusToTrigger(event: Event) {
    event.preventDefault()
    triggerRef.current?.focus()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="size-8"
          >
            <span className="sr-only">{t.rowActions.openMenu(label)}</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t.rowActions.actionsLabel}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setViewOpen(true)}>
            <Eye />
            {t.common.view}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={openEdit}>
            <Pencil />
            {t.common.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 />
            {t.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent
          // ui/sheet 기본 폭(w-3/4 sm:max-w-sm)을 고정 440px로 덮는다. sm:은 생성된 기본값을 지우기 위한 것뿐이다.
          className="w-[440px] gap-0 sm:max-w-none"
          onCloseAutoFocus={(event) => {
            if (handingOffRef.current) {
              handingOffRef.current = false
              event.preventDefault()
              return
            }
            returnFocusToTrigger(event)
          }}
          {...(summary ? {} : { 'aria-describedby': undefined })}
        >
          <SheetHeader className="gap-2 border-b p-6 pr-12">
            <SheetTitle className="text-xl leading-tight [font-weight:var(--weight-title)]">
              {label}
            </SheetTitle>
            {status && (
              <span
                data-slot="row-status"
                className="inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
              >
                <StatusDot tone={status.tone}>{status.label}</StatusDot>
              </span>
            )}
            {summary && <SheetDescription>{summary}</SheetDescription>}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {details && details.length > 0 && <DetailList details={details} />}
          </div>
          <SheetFooter className="mt-0 flex-row items-center gap-2 border-t px-6 py-4">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handOff(() => setDeleteOpen(true))}
            >
              <Trash2 />
              {t.common.delete}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <SheetClose asChild>
                <Button variant="outline">{t.common.close}</Button>
              </SheetClose>
              <Button onClick={() => handOff(openEdit)}>
                <Pencil />
                {t.common.edit}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent onCloseAutoFocus={returnFocusToTrigger}>
          <DialogHeader>
            <DialogTitle>{t.rowActions.editDialogTitle(label)}</DialogTitle>
            <DialogDescription>
              {t.rowActions.editDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="row-edit-value">{t.rowActions.nameLabel}</Label>
            <Input
              id="row-edit-value"
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t.common.cancel}</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} disabled={!editValue.trim()}>
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onCloseAutoFocus={returnFocusToTrigger}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.rowActions.deleteDialogTitle(label)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.rowActions.deleteDialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
