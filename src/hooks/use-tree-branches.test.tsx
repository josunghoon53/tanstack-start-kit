import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTreeBranches } from './use-tree-branches'

function TestTree({
  isOpen,
  deps = [],
}: {
  isOpen: boolean
  deps?: Array<unknown>
}) {
  const { containerRef, branchYs } = useTreeBranches<HTMLDivElement>(
    isOpen,
    deps,
  )

  return (
    <div ref={containerRef} data-testid="container">
      <div data-tree-leaf>leaf-1</div>
      <div data-tree-leaf>leaf-2</div>
      <div data-tree-leaf>leaf-3</div>
      <div data-testid="branch-count">{branchYs.length}</div>
    </div>
  )
}

describe('useTreeBranches', () => {
  it('does not throw when mounted and unmounted', () => {
    const { unmount } = render(<TestTree isOpen={true} />)
    expect(() => unmount()).not.toThrow()
  })

  it('returns a containerRef assignable to a ref and an array for branchYs', () => {
    const { getByTestId } = render(<TestTree isOpen={true} />)

    const container = getByTestId('container')
    expect(container).toBeInTheDocument()

    const branchCount = getByTestId('branch-count')
    expect(Number.isNaN(Number(branchCount.textContent))).toBe(false)
  })

  it('produces an empty branchYs array when isOpen is false', () => {
    const { getByTestId } = render(<TestTree isOpen={false} />)

    expect(getByTestId('branch-count').textContent).toBe('0')
  })

  it('does not crash when isOpen toggles across rerenders', () => {
    const { rerender, getByTestId } = render(<TestTree isOpen={false} />)
    expect(getByTestId('branch-count').textContent).toBe('0')

    expect(() => rerender(<TestTree isOpen={true} />)).not.toThrow()
    expect(() => rerender(<TestTree isOpen={false} />)).not.toThrow()
  })

  it('does not crash when deps change across rerenders', () => {
    const { rerender } = render(<TestTree isOpen={true} deps={[1]} />)

    expect(() => rerender(<TestTree isOpen={true} deps={[2]} />)).not.toThrow()
    expect(() => rerender(<TestTree isOpen={true} deps={[3]} />)).not.toThrow()
  })
})
