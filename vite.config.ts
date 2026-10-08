import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(({ mode }) => {
  // Vite는 .env를 VITE_ 접두사 변수만 클라이언트용으로 로드하고 process.env에는 넣지 않는다.
  // 서버 함수(llm-runner의 ANTHROPIC_API_KEY/OPENAI_API_KEY 등)가 process.env로 읽을 수 있게
  // 접두사 없이 전부 로드해서 합친다. 셸에서 이미 설정한 값은 덮어쓰지 않는다.
  // 프로덕션 실행은 이 설정이 적용되지 않으니 `node --env-file=.env`나 배포 환경 변수를 쓸 것.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ''))) {
    process.env[key] ??= value
  }

  return {
    resolve: { tsconfigPaths: true },
    server: {
      // Vite 8의 브라우저 콘솔 → 터미널 전달을 끈다. TanStack Devtools의 콘솔 파이프(터미널 ↔ 브라우저)와
      // 같이 켜져 있으면 경고 한 줄이 "[vite] (client) [console.warn] [Server] ..."로 서로 되먹임되며
      // 무한히 불어나 dev 로그가 수 GB가 된다(동작 줄이기를 켠 기기에서 motion의 개발용 경고 한 줄로 재현).
      // 브라우저 로그는 Devtools 파이프가 이미 "[Client]"로 터미널에 찍어준다.
      forwardConsole: false,
    },
    plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  }
})

export default config
