// 이 킷의 목데이터는 날짜를 'YYYY-MM-DD' 문자열로 들고 있다(config/*.ts). 이 포맷은
// 문자열 비교(`<=`/`>=`)만으로도 날짜 비교가 정확히 맞아떨어지므로, 날짜 범위 필터에서
// Date를 파싱하는 대신 이 헬퍼로 같은 문자열 포맷으로 맞춰서 비교한다.
// `Date.toISOString()`은 쓰지 않는다 — UTC로 변환되면서 로컬 자정 근처 날짜가
// 하루 밀릴 수 있다.
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isWithinDateRange(
  dateKey: string,
  range: { from?: Date; to?: Date } | undefined,
): boolean {
  if (!range?.from) return true
  const fromKey = toDateKey(range.from)
  const toKey = toDateKey(range.to ?? range.from)
  return dateKey >= fromKey && dateKey <= toKey
}
