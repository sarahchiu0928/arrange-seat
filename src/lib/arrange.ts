import type { Guest, GuestEntry, Table, Settings } from '@/types'

export interface ArrangeResult {
  tables: Table[]
  unassigned: GuestEntry[]
}

const SPLIT_LABELS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛']

export function arrange(guests: Guest[], settings: Settings): ArrangeResult {
  const {
    stdCount, stdCap, bigCount, bigCap, smCount, smCap, otherTables,
    tableStart, allowSplit, sortMode, kidsCount, reserveSeats,
  } = settings

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

  // Expand manually-split guests into sub-entries
  let list: GuestEntry[] = []
  for (const g of guests) {
    const eff = kidsCount ? g.total : g.adults
    const splitsSum = g.splits?.reduce((a, b) => a + b, 0) ?? 0

    if (g.splits && g.splits.length >= 2 && splitsSum === g.total) {
      g.splits.forEach((count, idx) => {
        list.push({
          ...g,
          effective: kidsCount ? count : Math.min(count, g.adults),
          split: true,
          splitLabel: `(${SPLIT_LABELS[idx] ?? idx + 1})`,
        })
      })
    } else {
      list.push({ ...g, effective: eff, split: false })
    }
  }

  if (sortMode === 'desc') list.sort((a, b) => b.effective - a.effective)
  else if (sortMode === 'asc') list.sort((a, b) => a.effective - b.effective)

  const unassigned: GuestEntry[] = []

  for (const g of list) {
    if (!allowSplit) {
      const t = tables.find((t) => t.eff - t.used >= g.effective)
      if (t) {
        t.guests.push({ ...g })
        t.used += g.effective
      } else {
        unassigned.push(g)
      }
    } else {
      let remaining = g.effective
      let partNum = 0
      for (const t of tables) {
        if (remaining <= 0) break
        const space = t.eff - t.used
        if (space <= 0) continue
        const take = Math.min(space, remaining)
        partNum++
        t.guests.push({ ...g, effective: take, split: take < g.effective, splitLabel: `(部分${partNum})` })
        t.used += take
        remaining -= take
      }
      if (remaining > 0) unassigned.push({ ...g, effective: remaining })
    }
  }

  return { tables, unassigned }
}
