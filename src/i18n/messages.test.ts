import { describe, expect, it } from 'vitest'
import { messages } from './messages'

// 두 로케일 딕셔너리가 같은 shape인지 재귀적으로 비교한다. 값 타입까지는 보지 않고
// 키 집합만 비교한다 — 함수 vs 문자열처럼 값 형태가 같은 자리는 같은 종류여야 하므로
// typeof도 같이 확인한다.
function collectKeyTypes(
  value: unknown,
  path: string,
  out: Map<string, string>,
) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      collectKeyTypes(child, path ? `${path}.${key}` : key, out)
    }
    return
  }
  out.set(path, typeof value)
}

describe('messages dictionary parity', () => {
  it('ko and en expose the exact same set of keys', () => {
    const koKeys = new Map<string, string>()
    const enKeys = new Map<string, string>()
    collectKeyTypes(messages.ko, '', koKeys)
    collectKeyTypes(messages.en, '', enKeys)

    const missingInEn = [...koKeys.keys()].filter((key) => !enKeys.has(key))
    const missingInKo = [...enKeys.keys()].filter((key) => !koKeys.has(key))

    expect(missingInEn).toEqual([])
    expect(missingInKo).toEqual([])
  })

  it('ko and en use the same value kind (string vs function) for every key', () => {
    const koKeys = new Map<string, string>()
    const enKeys = new Map<string, string>()
    collectKeyTypes(messages.ko, '', koKeys)
    collectKeyTypes(messages.en, '', enKeys)

    const mismatched = [...koKeys.entries()].filter(
      ([key, kind]) => enKeys.get(key) !== kind,
    )

    expect(mismatched).toEqual([])
  })
})
