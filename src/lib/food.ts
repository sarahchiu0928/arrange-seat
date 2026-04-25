import type { Table } from '@/types'

interface FoodSpec {
  soup: string
  chicken: string | null
}

function getFoodForCount(n: number): FoodSpec {
  if (n <= 4) return { soup: '蛤蜊湯（小）', chicken: null }
  if (n <= 6) return { soup: '蛤蜊湯（大）', chicken: '雞肉（半）' }
  return { soup: '九尾雞湯', chicken: '雞肉（半）' }
}

export interface FoodGuestRow {
  tableNum: number
  guestName: string
  plan: string
  pax: number
  soup: string
  chicken: string | null
}

export interface FoodSummary {
  rows: FoodGuestRow[]
  totalSm: number
  totalBig: number
  totalJiuwei: number
  totalHalf: number
}

export function buildFoodSummary(tables: Table[]): FoodSummary {
  const rows: FoodGuestRow[] = []

  for (const t of tables) {
    for (const g of t.guests) {
      if (g.plan !== '方案2' && g.plan !== '方案4') continue
      const pax = g.split ? g.effective : g.total
      const food = getFoodForCount(pax)
      rows.push({ tableNum: t.num, guestName: g.name, plan: g.plan, pax, ...food })
    }
  }

  let totalSm = 0, totalBig = 0, totalJiuwei = 0, totalHalf = 0
  for (const r of rows) {
    if (r.soup === '蛤蜊湯（小）') totalSm++
    else if (r.soup === '蛤蜊湯（大）') totalBig++
    else totalJiuwei++
    if (r.chicken) totalHalf++
  }

  return { rows, totalSm, totalBig, totalJiuwei, totalHalf }
}
