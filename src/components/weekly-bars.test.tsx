import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WeeklyBars } from './weekly-bars'

describe('WeeklyBars', () => {
  it('renders one bar per value, scaled to the maximum', () => {
    const { container } = render(
      <WeeklyBars values={[50, 100, 25]} label="주간 매출" />,
    )

    const bars = container.querySelectorAll<HTMLElement>('[data-bar]')
    expect(bars).toHaveLength(3)
    expect(bars[0].style.height).toBe('50%')
    expect(bars[1].style.height).toBe('100%')
    expect(bars[2].style.height).toBe('25%')
  })

  it('highlights only the last bar with the primary color', () => {
    const { container } = render(
      <WeeklyBars values={[10, 20, 30]} label="주간 매출" />,
    )

    const bars = container.querySelectorAll('[data-bar]')
    expect(bars[0]).not.toHaveClass('bg-primary')
    expect(bars[2]).toHaveClass('bg-primary')
  })

  it('exposes the chart as an image with the given label', () => {
    render(<WeeklyBars values={[1, 2]} label="주간 매출" />)

    expect(screen.getByRole('img', { name: '주간 매출' })).toBeInTheDocument()
  })
})
