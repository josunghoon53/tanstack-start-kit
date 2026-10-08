import { useRouterState } from '@tanstack/react-router'
import { m } from 'motion/react'
import type { ReactNode } from 'react'
import { duration, ease, useHasMounted } from '@/lib/motion'

const ENTER = { opacity: 0, y: 8 }
const VISIBLE = { opacity: 1, y: 0 }

// 라우트 콘텐츠의 진입 전용 전환. 경로가 바뀌면 key가 바뀌어 새로 마운트되며 살짝 올라오며 나타난다.
// - 퇴장 애니메이션과 AnimatePresence는 쓰지 않는다: Outlet을 AnimatePresence로 감싸면 나가는 쪽이
//   새 라우트 상태로 다시 렌더링되거나 멈춰 보이는("frozen route") 문제가 있다.
// - 서버 렌더와 하이드레이션 첫 렌더는 initial={false}라 둘이 같고 깜빡이지 않는다.
// - 대기 화면(defaultPendingComponent)이 이미 떠 있는 상태로 바뀐 경로는 애니메이션하지 않는다.
// - flex-1 flex-col gap-4로 부모 콘텐츠 래퍼(min-h-full shrink-0 flex-col)의 규칙을 그대로 이어받아
//   페이지의 Card className="flex-1"이 푸터 위까지 늘어난다.
export function PageTransition({ children }: { children: ReactNode }) {
  const mounted = useHasMounted()
  const pathname = useRouterState({
    select: (state) =>
      state.matches.at(-1)?.pathname ?? state.location.pathname,
  })
  const pending = useRouterState({
    select: (state) => state.matches.at(-1)?.status === 'pending',
  })

  return (
    <m.div
      key={pathname}
      data-page-transition={pathname}
      initial={mounted && !pending ? ENTER : false}
      animate={VISIBLE}
      transition={{ duration: duration.base - 0.03, ease: ease.out }}
      className="flex flex-1 flex-col gap-4"
    >
      {children}
    </m.div>
  )
}
