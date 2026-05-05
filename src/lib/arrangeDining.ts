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

  const plan2 = guests.filter((g) => g.plan === '方案2' || g.plan === '方案5')
  const list: GuestEntry[] = plan2.map((g) => ({ ...g, effective: g.total, split: false }))

  // Sort largest group first so big guests claim appropriately-sized tables before small guests take them
  const sorted = [...list].sort((a, b) => b.effective - a.effective)

  const unassigned: GuestEntry[] = []

  for (const g of sorted) {
    // Among empty tables that fit, pick the smallest one (best-fit) to avoid wasting large tables on small groups
    const eligible = tables.filter((t) => t.guests.length === 0 && t.eff >= g.effective)
    eligible.sort((a, b) => a.eff - b.eff)
    const t = eligible[0]
    if (t) {
      t.guests.push({ ...g })
      t.used += g.effective
    } else {
      unassigned.push(g)
    }
  }

  return { tables, unassigned }
}
