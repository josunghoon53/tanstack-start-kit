const TRUNK_X = 8
const STUB_END_X = 20
const CORNER_RADIUS = 6

/**
 * Draws a file-tree-style connector (a vertical trunk with a horizontal
 * branch to each item, rounded at the last one) from a list of vertical
 * center positions — see `useTreeBranches`.
 */
export function TreeConnector({ branchYs }: { branchYs: Array<number> }) {
  if (branchYs.length === 0) return null

  const lastY = branchYs.at(-1) ?? 0
  const cornerStartY = Math.max(lastY - CORNER_RADIUS, 0)

  return (
    <svg
      width={STUB_END_X}
      height={lastY}
      viewBox={`0 0 ${STUB_END_X} ${lastY}`}
      className="pointer-events-none absolute top-0 left-0 text-sidebar-foreground/30"
      aria-hidden="true"
    >
      <path
        d={`M${TRUNK_X} 0 L${TRUNK_X} ${cornerStartY} Q${TRUNK_X} ${lastY} ${TRUNK_X + CORNER_RADIUS} ${lastY} H${STUB_END_X}`}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {branchYs.slice(0, -1).map((y) => (
        <path
          key={y}
          d={`M${TRUNK_X} ${y} H${STUB_END_X}`}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  )
}
