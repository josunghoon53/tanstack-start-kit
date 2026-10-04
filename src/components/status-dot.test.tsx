import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusDot } from './status-dot'
import type { StatusTone } from './status-dot'

describe('StatusDot', () => {
  it('renders children', () => {
    render(<StatusDot tone="success">Active</StatusDot>)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  const toneClasses: Record<StatusTone, string> = {
    success: 'bg-success',
    danger: 'bg-destructive',
    warning: 'bg-warning',
    neutral: 'bg-muted-foreground',
  }

  for (const [tone, expectedClass] of Object.entries(toneClasses) as Array<
    [StatusTone, string]
  >) {
    it(`applies "${expectedClass}" dot color class for tone="${tone}"`, () => {
      const { container } = render(<StatusDot tone={tone}>Label</StatusDot>)

      const dot = container.querySelector('span > span')
      expect(dot).toHaveClass(expectedClass)
    })
  }
})
