import { useState } from 'react'

/**
 * Tracks which single item (by key) is open in a group where opening one
 * closes the rest — e.g. a sidebar's collapsible menu groups.
 */
export function useAccordionGroup(defaultKey?: string) {
  const [openKey, setOpenKey] = useState<string | undefined>(defaultKey)

  return {
    isOpen: (key: string) => openKey === key,
    setOpen: (key: string, open: boolean) => setOpenKey(open ? key : undefined),
  }
}
