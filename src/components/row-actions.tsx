import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
import { useTranslation } from '@/i18n/use-translation'

export interface RowDetail {
  label: string
  value: React.ReactNode
}

export function RowActions({
  label,
  details,
}: {
  label: string
  details?: Array<RowDetail>
}) {
  const t = useTranslation()
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editValue, setEditValue] = useState(label)

  function handleSaveEdit() {
    setEditOpen(false)
    toast.success(t.rowActions.editSuccessToast(editValue))
  }

  function handleConfirmDelete() {
    toast.success(t.rowActions.deleteSuccessToast(label))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
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
          <DropdownMenuItem
            onSelect={() => {
              setEditValue(label)
              setEditOpen(true)
            }}
          >
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
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{label}</SheetTitle>
            <SheetDescription>
              {t.rowActions.viewSheetDescription}
            </SheetDescription>
          </SheetHeader>
          {details && details.length > 0 && (
            <div className="flex flex-col gap-4 px-4">
              {details.map((detail) => (
                <div key={detail.label} className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    {detail.label}
                  </span>
                  <span className="text-sm font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{t.common.close}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
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
        <AlertDialogContent>
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
