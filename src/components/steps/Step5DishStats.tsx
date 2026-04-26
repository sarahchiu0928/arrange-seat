import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { useStore } from '@/store'
import { buildDishStats, type DishStat } from '@/lib/food'
import { Button } from '@/components/ui/button'

// ─── Display structure ────────────────────────────────────────────────────────

type SingleItem = { type: 'single'; dish: string }
type GroupItem  = { type: 'group';  base: string; variants: { label: string; dish: string }[] }
type DisplayItem = SingleItem | GroupItem

const KITCHEN1: DisplayItem[] = [
  { type: 'group',  base: '炒青菜',    variants: [{ label: '小', dish: '炒青菜（小）' },    { label: '標準', dish: '炒青菜' }] },
  { type: 'single', dish: '櫻花蝦高麗菜' },
  { type: 'group',  base: '麻油松板肉', variants: [{ label: '小', dish: '麻油松板肉（小）' }, { label: '標準', dish: '麻油松板肉' }] },
  { type: 'single', dish: '炒山豬肉' },
  { type: 'single', dish: '黑椒霜降豬肉' },
  { type: 'group',  base: '客家小炒',  variants: [{ label: '小', dish: '客家小炒（小）' },  { label: '標準', dish: '客家小炒' }] },
  { type: 'single', dish: '炸豆腐' },
  { type: 'single', dish: '五味花枝' },
  { type: 'single', dish: '小卷米粉湯' },
]

const KITCHEN2: DisplayItem[] = [
  { type: 'group',  base: '蛤仔湯',    variants: [{ label: '白鍋', dish: '蛤仔湯（白鍋）' }, { label: '大鍋', dish: '蛤仔湯（大鍋）' }] },
  { type: 'single', dish: '九尾雞湯' },
  { type: 'group',  base: '黃金閹雞',  variants: [{ label: '半', dish: '黃金閹雞（半）' },   { label: '整', dish: '黃金閹雞' }] },
  { type: 'group',  base: '無刺鰻魚片', variants: [{ label: '小', dish: '無刺鰻魚片（小）' }, { label: '標準', dish: '無刺鰻魚片' }] },
  { type: 'single', dish: '清燙鮮蝦' },
  { type: 'group',  base: '炸南瓜酥',  variants: [{ label: '小', dish: '炸南瓜酥（小）' },   { label: '標準', dish: '炸南瓜酥' }] },
  { type: 'single', dish: '炸冰點' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCountMap(stats: DishStat[]) {
  return new Map(stats.map((s) => [s.dish, s.total]))
}

function KitchenSection({
  title, items, counts, headerCls, badgeCls, countCls,
}: {
  title: string
  items: DisplayItem[]
  counts: Map<string, number>
  headerCls: string
  badgeCls: string
  countCls: string
}) {
  const rows = items.filter((item) => {
    if (item.type === 'single') return (counts.get(item.dish) ?? 0) > 0
    return item.variants.some((v) => (counts.get(v.dish) ?? 0) > 0)
  })
  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-100 flex items-center gap-2 ${headerCls}`}>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeCls}`}>{title}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((item) => {
          if (item.type === 'single') {
            const total = counts.get(item.dish) ?? 0
            return (
              <div key={item.dish} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">{item.dish}</span>
                <span className={`text-sm font-semibold tabular-nums ${countCls}`}>{total} 份</span>
              </div>
            )
          }
          const present = item.variants.filter((v) => (counts.get(v.dish) ?? 0) > 0)
          return (
            <div key={item.base} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-gray-700">{item.base}</span>
              <div className="flex items-center gap-3">
                {present.map((v) => (
                  <span key={v.dish} className="text-sm text-gray-500">
                    {v.label}{' '}
                    <span className={`font-semibold tabular-nums ${countCls}`}>{counts.get(v.dish)} 份</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step5DishStats ───────────────────────────────────────────────────────────

export function Step5DishStats() {
  const { guests, goStep } = useStore()
  const resultRef = useRef<HTMLDivElement>(null)

  if (guests.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">4</div>
          <h2 className="text-lg font-bold">菜色統計</h2>
        </div>
        <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4">
          尚未匯入賓客資料，請先完成名單整理。
        </p>
        <Button variant="outline" onClick={() => goStep(0)}>← 返回整理名單</Button>
      </div>
    )
  }

  const { stats, details } = buildDishStats(guests)
  const counts = buildCountMap(stats)
  const totalIceCream = counts.get('炸冰點') ?? 0

  async function exportImage() {
    if (!resultRef.current) return
    const dataUrl = await toPng(resultRef.current, { backgroundColor: '#f9fafb', pixelRatio: 2 })
    const a = document.createElement('a')
    a.download = '菜色統計.png'
    a.href = dataUrl
    a.click()
  }

  // dishes that belong to kitchen 2 (for per-guest detail coloring)
  const k2Dishes = new Set(KITCHEN2.flatMap((i) => i.type === 'single' ? [i.dish] : i.variants.map((v) => v.dish)))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">4</div>
          <h2 className="text-lg font-bold">菜色統計（方案二）</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={exportImage}>⬇ 匯出圖片</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>🖨 列印</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex gap-3 flex-wrap">
        {[
          { val: details.length, lbl: '方案二組數' },
          { val: totalIceCream, lbl: '炸冰點總份數' },
        ].map(({ val, lbl }) => (
          <div key={lbl} className="bg-white border border-gray-100 rounded-lg px-4 py-2 text-center min-w-[100px] shadow-sm">
            <div className="text-2xl font-semibold text-teal-600">{val}</div>
            <div className="text-xs text-gray-400">{lbl}</div>
          </div>
        ))}
      </div>

      {stats.length === 0 && (
        <p className="text-sm text-gray-400 bg-white rounded-xl border border-gray-100 p-6 text-center">
          目前沒有方案二的賓客
        </p>
      )}

      {stats.length > 0 && (
        <div ref={resultRef} className="space-y-4 bg-gray-50 p-1 rounded-xl">
          <KitchenSection
            title="1 廚房"
            items={KITCHEN1}
            counts={counts}
            headerCls="bg-amber-50"
            badgeCls="bg-amber-100 text-amber-800"
            countCls="text-amber-700"
          />
          <KitchenSection
            title="2 廚房"
            items={KITCHEN2}
            counts={counts}
            headerCls="bg-blue-50"
            badgeCls="bg-blue-100 text-blue-800"
            countCls="text-blue-700"
          />

          {/* Per-guest breakdown */}
          {details.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-teal-50">
                <h3 className="text-sm font-semibold text-teal-800">各組明細</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {details.map((d, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{d.guestName}</span>
                      <span className="text-xs text-gray-400 ml-auto">{d.pax}人合菜</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.dishes.map(({ dish, qty }) => (
                        <span
                          key={dish}
                          className={`text-xs rounded px-2 py-0.5 border ${
                            k2Dishes.has(dish)
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
                          {dish}{qty > 1 ? ` ×${qty}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
