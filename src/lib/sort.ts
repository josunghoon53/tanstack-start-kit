import type { SortDirection } from '@/hooks/use-sort'

// getValue는 "이 컬럼을 정렬할 때 비교할 값"을 뽑아내는 함수다 — 원본 필드를 그대로
// 쓰는 컬럼(이름 등)뿐 아니라, "128,000원" 같은 포맷된 문자열에서 숫자만 뽑아 비교해야
// 하는 컬럼(금액 등)도 같은 방식으로 다룰 수 있다. key가 없으면(정렬 해제 상태) 원본
// 순서를 그대로 반환한다. 숫자는 숫자 비교, 그 외는 한국어 로케일 기준으로 비교한다.
export function sortItems<T>(
  data: Array<T>,
  getValue: ((item: T) => string | number) | undefined,
  direction: SortDirection,
): Array<T> {
  if (!getValue) return data

  const sorted = [...data].sort((a, b) => {
    const av = getValue(a)
    const bv = getValue(b)
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av).localeCompare(String(bv), 'ko')
  })

  return direction === 'asc' ? sorted : sorted.reverse()
}
