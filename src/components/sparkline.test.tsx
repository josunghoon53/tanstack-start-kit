import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sparkline } from './sparkline'

describe('Sparkline', () => {
  it('draws one polyline point per value', () => {
    const { container } = render(
      <Sparkline values={[1, 3, 2, 5]} tone="positive" />,
    )

    const points = container
      .querySelector('polyline')
      ?.getAttribute('points')
      ?.split(' ')
    expect(points).toHaveLength(4)
  })

  it('uses the success color for positive and destructive for negative', () => {
    const { container, rerender } = render(
      <Sparkline values={[1, 2]} tone="positive" />,
    )
    expect(container.querySelector('polyline')).toHaveClass('stroke-success')

    rerender(<Sparkline values={[1, 2]} tone="negative" />)
    expect(container.querySelector('polyline')).toHaveClass(
      'stroke-destructive',
    )
  })

  it('does not produce NaN for flat or single-value series', () => {
    const flat = render(<Sparkline values={[4, 4, 4]} tone="positive" />)
    expect(flat.container.innerHTML).not.toContain('NaN')

    const single = render(<Sparkline values={[7]} tone="positive" />)
    expect(single.container.innerHTML).not.toContain('NaN')
  })

  it('renders nothing for an empty series and is hidden from assistive tech', () => {
    const empty = render(<Sparkline values={[]} tone="positive" />)
    expect(empty.container).toBeEmptyDOMElement()

    const filled = render(<Sparkline values={[1, 2]} tone="positive" />)
    expect(filled.container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
