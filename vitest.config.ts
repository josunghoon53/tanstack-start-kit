import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// vite.config.ts와 별도 파일로 둔다 — tanstackStart()/devtools() 플러그인은 라우트
// 생성·개발 서버 전용이라 테스트 실행과는 무관하고, 끼워 넣으면 테스트가 느려지거나
// 불필요하게 실패할 수 있다.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
})
