import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library는 jest 환경에서만 자동으로 cleanup을 걸어준다 — vitest에서는 각 테스트
// 뒤에 렌더된 DOM을 직접 정리해줘야 여러 테스트 파일/케이스가 서로 DOM을 공유하지 않는다.
afterEach(() => {
  cleanup()
})
