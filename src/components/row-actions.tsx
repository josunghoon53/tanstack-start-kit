import { Eye, FileText, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
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
import { riseIn } from '@/lib/motion'

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

const MotionSheetHeader = m.create(SheetHeader)
const MotionSheetFooter = m.create(SheetFooter)

// 시트 내용 진입: 헤더(0) → 상세 줄(1..n) → 푸터(n+1) 순서로 30ms씩.
// 시트는 열릴 때만(클라이언트에서) 렌더되므로 동작 줄이기면 initial={false}로 바로 보여도 SSR 불일치가 없다.
function useEnterProps() {
  const reduceMotion = useReducedMotion()
  return {
    variants: riseIn,
    initial: reduceMotion ? false : ('hidden' as const),
    animate: 'visible' as const,
  }
}

function StatusBadge({ status }: { status: RowStatus }) {
  return (
    <span
      data-slot="row-status"
      className="inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
    >
      <StatusDot tone={status.tone}>{status.label}</StatusDot>
    </span>
  )
}

// "보기" 시트 본문: 옅은 둥근 박스 하나에 왼쪽 라벨(고정 96px) / 오른쪽 값.
// 선을 긋지 않고 행 패딩으로만 나눈다. 값이 상태 배지의 글자와 같으면 그 줄은 배지로 보여준다.
function DetailList({
  details,
  status,
}: {
  details: Array<RowDetail>
  status?: RowStatus
}) {
  const enter = useEnterProps()
  return (
    <dl className="rounded-[calc(var(--radius-panel)-0.25rem)] bg-muted/50 px-4 py-1">
      {details.map((detail, index) => (
        <m.div
          {...enter}
          custom={index + 1}
          key={detail.label}
          data-slot="row-detail"
          className="grid grid-cols-[96px_1fr] items-center gap-4 py-3.5"
        >
          <dt className="text-[13px] text-muted-foreground">{detail.label}</dt>
          <dd className="text-sm leading-relaxed break-words">
            {status && detail.value === status.label ? (
              <StatusBadge status={status} />
            ) : (
              detail.value
            )}
          </dd>
        </m.div>
      ))}
    </dl>
  )
}

// 제목 첫 글자를 넣은 옅은 무채색 원. 글자가 없으면 아이콘.
function Initial({ label }: { label: string }) {
  const initial = Array.from(label.trim())[0]
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-base font-medium text-muted-foreground"
    >
      {initial ? initial.toUpperCase() : <FileText className="size-4" />}
    </span>
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
  const enter = useEnterProps()
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

  const openedFromMenuRef = useRef(false)
  function fromMenu(open: () => void) {
    openedFromMenuRef.current = true
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
        <DropdownMenuContent
          align="end"
          // 메뉴 항목이 시트/다이얼로그를 열었으면, 메뉴가 닫힌 뒤(퇴장 애니메이션 후) 포커스를 트리거로
          // 되돌리지 않는다 — 되돌리면 방금 연 시트/다이얼로그에서 포커스를 빼앗는다.
          onCloseAutoFocus={(event) => {
            if (!openedFromMenuRef.current) return
            openedFromMenuRef.current = false
            event.preventDefault()
          }}
        >
          <DropdownMenuLabel>{t.rowActions.actionsLabel}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => fromMenu(() => setViewOpen(true))}>
            <Eye />
            {t.common.view}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fromMenu(openEdit)}>
            <Pencil />
            {t.common.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => fromMenu(() => setDeleteOpen(true))}
          >
            <Trash2 />
            {t.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent
          // 화면 가장자리에 붙지 않는 떠 있는 패널: 위·아래·오른쪽 12px 여백, 고정 폭 440px.
          // ui/sheet 기본(inset-y-0 right-0 h-full border-l w-3/4 sm:max-w-sm shadow-lg)을 className으로만 덮는다
          // (sm:은 생성된 기본값을 지우기 위한 것뿐). 반경·그림자는 스타일별 토큰(--radius-panel, --shadow-panel).
          data-floating-panel=""
          className="inset-y-3 right-3 h-auto w-[440px] gap-0 overflow-hidden rounded-(--radius-panel) border border-(--panel-border) shadow-(--shadow-panel) outline-none sm:max-w-none"
          // 첫 포커스를 맨 앞 버튼(삭제)이 아니라 패널 자체에 둔다 — Enter 한 번에 삭제 확인이 열리지 않게.
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            const panel = event.currentTarget as HTMLElement | null
            panel?.focus()
          }}
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
          <MotionSheetHeader
            {...enter}
            custom={0}
            className="gap-3 px-7 pt-7 pb-5 pr-14"
          >
            <div className="flex items-center gap-3">
              <Initial label={label} />
              <div className="flex min-w-0 flex-col items-start gap-1.5">
                {/* 굵기는 스타일 토큰보다 한 단계 가볍게 */}
                <SheetTitle className="text-xl leading-snug [font-weight:calc(var(--weight-title)_-_100)]">
                  {label}
                </SheetTitle>
                {status && <StatusBadge status={status} />}
              </div>
            </div>
            {summary && (
              <SheetDescription className="leading-relaxed">
                {summary}
              </SheetDescription>
            )}
          </MotionSheetHeader>
          <div className="flex-1 overflow-y-auto px-7 py-1">
            {details && details.length > 0 && (
              <DetailList details={details} status={status} />
            )}
          </div>
          <MotionSheetFooter
            {...enter}
            custom={(details?.length ?? 0) + 1}
            className="mt-0 flex-row items-center gap-2 px-7 pt-4 pb-7"
          >
            <Button
              variant="ghost"
              className="h-10 rounded-lg px-3 text-destructive hover:bg-transparent hover:text-destructive hover:underline hover:underline-offset-4"
              onClick={() => handOff(() => setDeleteOpen(true))}
            >
              <Trash2 />
              {t.common.delete}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <SheetClose asChild>
                <Button variant="ghost" className="h-10 rounded-lg px-4">
                  {t.common.close}
                </Button>
              </SheetClose>
              <Button
                className="h-10 rounded-lg px-5"
                onClick={() => handOff(openEdit)}
              >
                <Pencil />
                {t.common.edit}
              </Button>
            </div>
          </MotionSheetFooter>
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
