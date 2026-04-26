import type { Guest, Table } from '@/types'

interface FoodSpec {
  soup: string
  chicken: string | null
}

function getFoodForCount(n: number): FoodSpec {
  if (n <= 4) return { soup: '蛤蜊湯（小）', chicken: null }
  if (n <= 6) return { soup: '蛤蜊湯（大）', chicken: '雞肉（半）' }
  return { soup: '九尾雞湯', chicken: '雞肉（半）' }
}

// ─── Plan 2 full menu (excludes 果汁) ─────────────────────────────────────────

interface DishItem { dish: string; qty: number }

const PLAN2_MENU: Record<number, DishItem[]> = {
  2: [
    { dish: '蛤仔湯（白鍋）', qty: 1 },
    { dish: '炒青菜（小）', qty: 1 },
    { dish: '麻油松板肉（小）', qty: 1 },
    { dish: '炸南瓜酥（小）', qty: 1 },
    { dish: '客家小炒（小）', qty: 1 },
    { dish: '炸冰點', qty: 2 },
  ],
  3: [
    { dish: '蛤仔湯（白鍋）', qty: 1 },
    { dish: '炒青菜', qty: 1 },
    { dish: '炸南瓜酥（小）', qty: 1 },
    { dish: '麻油松板肉（小）', qty: 1 },
    { dish: '無刺鯛魚片（小）', qty: 1 },
    { dish: '客家小炒（小）', qty: 1 },
    { dish: '炸冰點', qty: 3 },
  ],
  4: [
    { dish: '蛤仔湯（白鍋）', qty: 1 },
    { dish: '炒青菜', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '清燙鮮蝦', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '炸冰點', qty: 4 },
  ],
  5: [
    { dish: '蛤仔湯（大鍋）', qty: 1 },
    { dish: '炒青菜', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '無刺鯛魚片（小）', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '炸冰點', qty: 5 },
  ],
  6: [
    { dish: '蛤仔湯（大鍋）', qty: 1 },
    { dish: '炒青菜', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '炸冰點', qty: 6 },
  ],
  7: [
    { dish: '九尾雞湯', qty: 1 },
    { dish: '櫻花蝦高麗菜', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '炸冰點', qty: 7 },
  ],
  8: [
    { dish: '九尾雞湯', qty: 1 },
    { dish: '櫻花蝦高麗菜', qty: 1 },
    { dish: '黃金脆雞', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '清燙鮮蝦', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '炸冰點', qty: 8 },
  ],
  9: [
    { dish: '九尾雞湯', qty: 1 },
    { dish: '櫻花蝦高麗菜', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '清燙鮮蝦', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '炒山豬肉', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '炸豆腐', qty: 1 },
    { dish: '炸冰點', qty: 9 },
  ],
  10: [
    { dish: '九尾雞湯', qty: 1 },
    { dish: '櫻花蝦高麗菜', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '清燙鮮蝦', qty: 1 },
    { dish: '炸豆腐', qty: 1 },
    { dish: '五味花枝', qty: 1 },
    { dish: '小卷米粉湯', qty: 1 },
    { dish: '炸冰點', qty: 10 },
  ],
  11: [
    { dish: '九尾雞湯', qty: 1 },
    { dish: '櫻花蝦高麗菜', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '清燙鮮蝦', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '炒山豬肉', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '五味花枝', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '炸冰點', qty: 11 },
  ],
  12: [
    { dish: '九尾雞湯', qty: 1 },
    { dish: '黃金脆雞（半）', qty: 1 },
    { dish: '櫻花蝦高麗菜', qty: 1 },
    { dish: '炒山豬肉', qty: 1 },
    { dish: '無刺鯛魚片', qty: 1 },
    { dish: '客家小炒', qty: 1 },
    { dish: '黑椒霜降豬肉', qty: 1 },
    { dish: '麻油松板肉', qty: 1 },
    { dish: '清燙鮮蝦', qty: 1 },
    { dish: '炸南瓜酥', qty: 1 },
    { dish: '五味花枝', qty: 1 },
    { dish: '小卷米粉湯', qty: 1 },
    { dish: '炸冰點', qty: 12 },
  ],
}

const DISH_ORDER = [
  '蛤仔湯（白鍋）', '蛤仔湯（大鍋）', '九尾雞湯',
  '炒青菜（小）', '炒青菜', '櫻花蝦高麗菜',
  '黃金脆雞（半）', '黃金脆雞',
  '麻油松板肉（小）', '麻油松板肉', '炒山豬肉', '黑椒霜降豬肉',
  '無刺鯛魚片（小）', '無刺鯛魚片', '清燙鮮蝦', '五味花枝', '小卷米粉湯',
  '客家小炒（小）', '客家小炒', '炸南瓜酥（小）', '炸南瓜酥', '炸豆腐',
  '炸冰點',
]

export interface DishStat { dish: string; total: number }

export interface GuestDishDetail {
  guestName: string
  pax: number
  dishes: DishItem[]
}

export function buildDishStats(guests: Guest[]): { stats: DishStat[]; details: GuestDishDetail[] } {
  const counts = new Map<string, number>()
  const details: GuestDishDetail[] = []

  for (const g of guests) {
    if (g.plan !== '方案2') continue
    const paxList = g.splits && g.splits.length > 0 ? g.splits : [g.total]
    for (const pax of paxList) {
      const menu = PLAN2_MENU[pax]
      if (!menu) continue
      for (const { dish, qty } of menu) {
        counts.set(dish, (counts.get(dish) ?? 0) + qty)
      }
      details.push({ guestName: g.name, pax, dishes: menu })
    }
  }

  const stats = DISH_ORDER
    .filter((d) => counts.has(d))
    .map((d) => ({ dish: d, total: counts.get(d)! }))

  return { stats, details }
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
