import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TreeConnector } from './tree-connector'

describe('TreeConnector', () => {
  it('renders nothing when branchYs is empty', () => {
    const { container } = render(<TreeConnector branchYs={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders an svg sized to the last branch position with one path per branch', () => {
    const branchYs = [10, 20, 30]
    const { container } = render(<TreeConnector branchYs={branchYs} />)

    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('height', String(branchYs.at(-1)))

    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(branchYs.length)
  })
})
