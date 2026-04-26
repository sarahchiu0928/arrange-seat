import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { useStore } from '@/store'
import { buildDishStats } from '@/lib/food'
import { Button } from '@/components/ui/button'

const KITCHEN2_DISHES = new Set([
  '蛤仔湯（白鍋）', '蛤仔湯（大鍋）', '九尾雞湯',
  '黃金脆雞（半）',
  '無刺鯛魚片（小）', '無刺鯛魚片',
  '清燙鮮蝦',
  '炸南瓜酥（小）', '炸南瓜酥',
  '炸冰點',
])

function KitchenSection({
  title, color, dishes,
}: {
  title: string
  color: { header: string; badge: string; count: string }
  dishes: { dish: string; total: number }[]
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-100 flex items-center gap-2 ${color.header}`}>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color.badge}`}>{title}</span>
      </div>
      <div className="divide-y divide-gray-50">
        {dishes.map(({ dish, total }) => (
          <div key={dish} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-700">{dish}</span>
            <span className={`text-sm font-semibold tabular-nums min-w-[3rem] text-right ${color.count}`}>
              {total} 份
            </span>
          </div>
        ))}
        {dishes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">無</p>
        )}
      </div>
    </div>
  )
}

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
  const totalIceCream = stats.find((s) => s.dish === '炸冰點')?.total ?? 0

  const kitchen2 = stats.filter((s) => KITCHEN2_DISHES.has(s.dish))
  const kitchen1 = stats.filter((s) => !KITCHEN2_DISHES.has(s.dish))

  async function exportImage() {
    if (!resultRef.current) return
    const dataUrl = await toPng(resultRef.current, { backgroundColor: '#f9fafb', pixelRatio: 2 })
    const a = document.createElement('a')
    a.download = '菜色統計.png'
    a.href = dataUrl
    a.click()
  }

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
          { val: stats.length, lbl: '菜色種類' },
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
          {/* Kitchen 1 */}
          <KitchenSection
            title="1 廚房"
            color={{ header: 'bg-amber-50', badge: 'bg-amber-100 text-amber-800', count: 'text-amber-700' }}
            dishes={kitchen1}
          />

          {/* Kitchen 2 */}
          <KitchenSection
            title="2 廚房"
            color={{ header: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800', count: 'text-blue-700' }}
            dishes={kitchen2}
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
                            KITCHEN2_DISHES.has(dish)
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
