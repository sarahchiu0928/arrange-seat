import type { Guest, GuestEntry, Table } from '@/types'
import type { DiningSettings } from '@/types'

export interface DiningArrangeResult {
  tables: Table[]
  unassigned: GuestEntry[]
}

export function arrangeDining(guests: Guest[], settings: DiningSettings): DiningArrangeResult {
  const { stdCount, stdCap, bigCount, bigCap, smCount, smCap, otherTables, tableStart, reserveSeats } = settings

  const tables: Table[] = []
  for (let i = 0; i < stdCount; i++)
    tables.push({ type: 'std', cap: stdCap, eff: stdCap - reserveSeats, guests: [], used: 0, num: 0 })
  for (let i = 0; i < bigCount; i++)
    tables.push({ type: 'big', cap: bigCap, eff: bigCap - reserveSeats, guests: [], used: 0, num: 0 })
  for (let i = 0; i < smCount; i++)
    tables.push({ type: 'sm', cap: smCap, eff: smCap - reserveSeats, guests: [], used: 0, num: 0 })
  for (const ot of (otherTables ?? []))
    tables.push({ type: 'other', cap: ot.cap, eff: ot.cap - reserveSeats, guests: [], used: 0, num: 0 })

  tables.forEach((t, i) => { t.num = tableStart + i })

  const plan2 = guests.filter((g) => g.plan === '方案2')
  const list: GuestEntry[] = plan2.map((g) => ({ ...g, effective: g.total, split: false }))

  const unassigned: GuestEntry[] = []

  for (const g of list) {
    // 一人一桌：只找空桌（guests.length === 0）且容量足夠的桌子
    const t = tables.find((t) => t.guests.length === 0 && t.eff >= g.effective)
    if (t) {
      t.guests.push({ ...g })
      t.used += g.effective
    } else {
      unassigned.push(g)
    }
  }

  return { tables, unassigned }
}
