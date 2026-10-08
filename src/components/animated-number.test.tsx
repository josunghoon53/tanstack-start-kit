import { act, render, screen } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AnimatedNumber,
  formatAnimatedNumber,
  parseAnimatedNumber,
} from './animated-number'
import { MotionProvider } from '@/lib/motion'
import type * as MotionReact from 'motion/react'

// 동작 줄이기 설정은 motion이 matchMedia로 한 번만 읽어 캐시하므로, 훅 자체를 목해서 바꾼다.
const motionPrefs = vi.hoisted(() => ({ reduced: false }))
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof MotionReact>()),
  useReducedMotion: () => motionPrefs.reduced,
}))

afterEach(() => {
  MotionGlobalConfig.skipAnimations = true
  motionPrefs.reduced = false
})

describe('parseAnimatedNumber', () => {
  it('keeps the prefix, grouping and suffix of formatted values', () => {
    expect(parseAnimatedNumber('₩1,240,000')).toEqual({
      prefix: '₩',
      value: 1240000,
      suffix: '',
      decimals: 0,
      grouped: true,
    })
    expect(parseAnimatedNumber('18건')).toMatchObject({
      prefix: '',
      value: 18,
      suffix: '건',
    })
    expect(parseAnimatedNumber('6명')).toMatchObject({ value: 6, suffix: '명' })
    expect(parseAnimatedNumber('12.5%')).toMatchObject({
      value: 12.5,
      suffix: '%',
      decimals: 1,
    })
  })

  it('returns null when there is no number to count', () => {
    expect(parseAnimatedNumber('-')).toBeNull()
    expect(parseAnimatedNumber('없음')).toBeNull()
  })

  it('formats intermediate values in the original shape', () => {
    const parsed = parseAnimatedNumber('₩1,240,000')!
    expect(formatAnimatedNumber(parsed, 0)).toBe('₩0')
    expect(formatAnimatedNumber(parsed, 507377.4)).toBe('₩507,377')
    expect(formatAnimatedNumber(parsed, 1240000)).toBe('₩1,240,000')
    expect(formatAnimatedNumber(parseAnimatedNumber('12.5%')!, 3)).toBe('3.0%')
  })
})

describe('AnimatedNumber', () => {
  it.each(['₩1,240,000', '18건', '6명', '-', '12.5%'])(
    'renders the final text %s right away when animations are skipped',
    (value) => {
      render(
        <MotionProvider>
          <AnimatedNumber value={value} />
        </MotionProvider>,
      )
      expect(screen.getByText(value)).toBeInTheDocument()
    },
  )

  it('renders the final text right away when the user prefers reduced motion', async () => {
    MotionGlobalConfig.skipAnimations = false
    motionPrefs.reduced = true
    render(
      <MotionProvider>
        <AnimatedNumber value="₩1,240,000" />
      </MotionProvider>,
    )
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(screen.getByText('₩1,240,000')).toBeInTheDocument()
  })

  it('counts up from zero and ends exactly on the final string', async () => {
    MotionGlobalConfig.skipAnimations = false
    render(
      <MotionProvider>
        <AnimatedNumber value="₩1,240,000" />
      </MotionProvider>,
    )
    // 마운트 직후 0으로 되돌리고, 중간 값을 거쳐 원래 문자열로 끝난다.
    const node = await screen.findByText(/^₩\d/)
    const seen = new Set<string>()
    await act(async () => {
      const started = Date.now()
      while (Date.now() - started < 1200) {
        seen.add(node.textContent)
        await new Promise((resolve) => setTimeout(resolve, 16))
      }
    })
    expect(node).toHaveTextContent('₩1,240,000')
    expect([...seen].some((text) => text !== '₩1,240,000')).toBe(true)
  })
})
