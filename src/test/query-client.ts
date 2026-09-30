import { QueryClient } from '@tanstack/react-query'

// 테스트용 QueryClient는 재시도/캐시를 끈다 — 실패한 쿼리를 재시도하느라 테스트가
// 타임아웃되거나, 이전 테스트의 캐시가 다음 테스트로 새는 것을 막는다.
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}
