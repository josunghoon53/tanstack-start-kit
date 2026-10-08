import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { MotionGlobalConfig } from 'motion/react'

// Testing Library는 jest 환경에서만 자동으로 cleanup을 걸어준다 — vitest에서는 각 테스트
// 뒤에 렌더된 DOM을 직접 정리해줘야 여러 테스트 파일/케이스가 서로 DOM을 공유하지 않는다.
afterEach(() => {
  cleanup()
})

// jsdom에는 ResizeObserver가 없다 — use-tree-branches 훅이 이걸로 서브메뉴 높이를 잰다.
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Radix(Dialog/DropdownMenu/Collapsible 등)는 포인터 캡처/스크롤 API를 호출하는데
// jsdom에는 구현이 없어서, userEvent로 상호작용하는 테스트가 이유 없이 실패한다.
Element.prototype.hasPointerCapture = () => false
Element.prototype.setPointerCapture = () => {}
Element.prototype.releasePointerCapture = () => {}
Element.prototype.scrollIntoView = () => {}

// TanStack Router의 scrollRestoration이 네비게이션마다 window.scrollTo를 부르는데
// jsdom은 이걸 구현하지 않아서 매번 "not implemented" 경고를 찍는다.
window.scrollTo = () => {}

// motion 애니메이션은 테스트에서 모두 즉시 끝낸다 — 진입 애니메이션·카운트업·레이아웃 이동이
// 시간에 따라 중간 값을 보여주지 않게 해서 테스트를 결정적으로 만든다.
MotionGlobalConfig.skipAnimations = true
