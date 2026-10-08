import { createContext, useContext } from 'react'
import { AnimatePresence, LazyMotion, m, useReducedMotion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import type { Transition } from 'motion/react'
import { TableBody, TableRow } from '@/components/ui/table'
import { duration, ease, loadLayoutFeatures } from '@/lib/motion'

// 지금 보이는 행 목록(순서 포함)을 나타내는 문자열. 이 값이 바뀔 때만 행 위치를 다시 잰다.
const LayoutKeyContext = createContext<string | undefined>(undefined)

const MotionTableRow = m.create(TableRow)

interface AnimatedTableBodyProps extends ComponentProps<typeof TableBody> {
  // 현재 페이지에 보이는 행 id를 순서대로 이은 값(예: pageItems.map((o) => o.id).join('|')).
  // 검색·필터·정렬·페이지가 바뀌면 달라지고, 행 아코디언을 펼치거나 접을 때는 그대로다.
  layoutKey: string
  children: ReactNode
}

// 리스트 페이지 테이블 본문. 검색·필터·정렬·페이지 이동으로 행 목록이 바뀌면
// 남는 행은 새 위치로 미끄러지고(layout), 새 행은 나타나고, 빠지는 행은 짧게 사라진다.
// - 레이아웃 기능(domMax)은 이 테이블이 있는 화면에서만 지연 로드한다.
// - initial={false}: 페이지를 처음 열 때(SSR 포함)는 행이 페이드인하지 않는다.
// - mode="sync": 표의 행은 position:absolute로 빼면(popLayout) 칸 너비가 무너져서 쓰지 않는다.
//   빠지는 행이 짧게(150ms) 사라진 뒤 남은 행이 자리를 옮긴다.
export function AnimatedTableBody({
  layoutKey,
  children,
  ...props
}: AnimatedTableBodyProps) {
  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      <LayoutKeyContext.Provider value={layoutKey}>
        <TableBody {...props}>
          <AnimatePresence initial={false}>{children}</AnimatePresence>
        </TableBody>
      </LayoutKeyContext.Provider>
    </LazyMotion>
  )
}

const ROW_TRANSITION: Transition = {
  layout: { duration: duration.base, ease: ease.out },
  opacity: { duration: duration.fast, ease: ease.out },
}

const INSTANT: Transition = { duration: 0 }

// AnimatedTableBody 안에서 TableRow 대신 쓴다(행 하나 = 이 컴포넌트 하나, key는 바깥 Fragment/행에).
// layout="position"이라 글자가 늘어나 보이지 않고 위치만 옮긴다. layoutDependency를 layoutKey로 묶어
// 행 아코디언(TableRowDetail)이 펼쳐질 때처럼 목록이 그대로인 변화에서는 움직이지 않는다(겹쳐 튀는 것 방지).
export function AnimatedTableRow(props: ComponentProps<typeof TableRow>) {
  const layoutKey = useContext(LayoutKeyContext)
  const reduceMotion = useReducedMotion()

  return (
    <MotionTableRow
      {...(props as ComponentProps<typeof MotionTableRow>)}
      layout="position"
      layoutDependency={layoutKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduceMotion ? INSTANT : ROW_TRANSITION}
    />
  )
}
