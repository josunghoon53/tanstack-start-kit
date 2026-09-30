import { describe, expect, it } from 'vitest'
import { sortItems } from './sort'

interface Item {
  name: string
  amount: number
}

const DATA: Array<Item> = [
  { name: '다', amount: 30 },
  { name: '가', amount: 10 },
  { name: '나', amount: 20 },
]

describe('sortItems', () => {
  it('returns the original order when getValue is undefined', () => {
    expect(sortItems(DATA, undefined, 'asc')).toEqual(DATA)
  })

  it('sorts numbers ascending and descending', () => {
    expect(
      sortItems(DATA, (item) => item.amount, 'asc').map((i) => i.amount),
    ).toEqual([10, 20, 30])
    expect(
      sortItems(DATA, (item) => item.amount, 'desc').map((i) => i.amount),
    ).toEqual([30, 20, 10])
  })

  it('sorts strings using Korean locale order', () => {
    expect(
      sortItems(DATA, (item) => item.name, 'asc').map((i) => i.name),
    ).toEqual(['가', '나', '다'])
  })

  it('does not mutate the original array', () => {
    const copy = [...DATA]
    sortItems(DATA, (item) => item.amount, 'asc')
    expect(DATA).toEqual(copy)
  })
})
