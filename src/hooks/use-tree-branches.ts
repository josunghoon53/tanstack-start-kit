import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Measures the vertical center of each `[data-tree-leaf]` element inside a
 * container, relative to the container's own top edge. Used to draw a tree
 * connector (trunk + branch stubs) that lines up with real, laid-out rows
 * instead of guessed pixel math.
 *
 * Re-measures via ResizeObserver rather than only on mount, since a parent
 * (e.g. a Radix Collapsible) may still be mid-animation when this first runs.
 */
export function useTreeBranches<T extends HTMLElement>(
  isOpen: boolean,
  deps: React.DependencyList = [],
) {
  const containerRef = useRef<T>(null)
  const [branchYs, setBranchYs] = useState<Array<number>>([])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || !isOpen) {
      setBranchYs([])
      return
    }

    function measure() {
      if (!container) return
      const leaves = Array.from(container.querySelectorAll<HTMLElement>('[data-tree-leaf]'))
      const containerTop = container.getBoundingClientRect().top
      setBranchYs(
        leaves.map((el) => {
          const rect = el.getBoundingClientRect()
          return rect.top - containerTop + rect.height / 2
        }),
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [isOpen, ...deps])

  return { containerRef, branchYs }
}
