import { useStore } from '@/store'
import { arrangeDining } from '@/lib/arrangeDining'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { OtherTable } from '@/types'

const TABLE_ROWS = [
  { key: 'std', emoji: '🟢', label: '標準桌', countId: 'stdCount', capId: 'stdCap', color: 'text-green-700' },
  { key: 'big', emoji: '🔵', label: '大桌',   countId: 'bigCount', capId: 'bigCap', color: 'text-blue-700' },
  { key: 'sm',  emoji: '🟠', label: '小桌',   countId: 'smCount',  capId: 'smCap',  color: 'text-orange-600' },
] as const

interface Props {
  onArranged?: () => void
  arrangeLabel?: string
}

export function DiningConfigPanel({ onArranged, arrangeLabel = '開始排用餐座位 ✦' }: Props) {
  const { guests, diningSettings, updateDiningSettings, setDiningTables } = useStore()

  const otherTables: OtherTable[] = diningSettings.otherTables ?? []
  const otherSeats = otherTables.reduce((s, t) => s + t.cap, 0)
  const nextOtherId = otherTables.length > 0 ? Math.max(...otherTables.map((t) => t.id)) + 1 : 1

  const plan2Guests = guests.filter((g) => g.plan === '方案2')
  const plan2Total = plan2Guests.reduce((s, g) => s + g.total, 0)

  const totalTables = diningSettings.stdCount + diningSettings.bigCount + diningSettings.smCount + otherTables.length
  const totalSeats =
    diningSettings.stdCount * diningSettings.stdCap +
    diningSettings.bigCount * diningSettings.bigCap +
    diningSettings.smCount * diningSettings.smCap +
    otherSeats
  const diningShortfall = plan2Guests.length > totalTables ? plan2Guests.length - totalTables : 0

  function handleArrange() {
    if (totalTables === 0 || plan2Guests.length === 0) return
    const { tables } = arrangeDining(guests, diningSettings)
    setDiningTables(tables)
    onArranged?.()
  }

  return (
    <div className="space-y-3">
      {/* 方案2 summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-pink-50 border border-pink-200 rounded-lg px-4 py-2 text-center min-w-[90px]">
          <div className="text-2xl font-semibold text-pink-700">{plan2Guests.length}</div>
          <div className="text-xs text-pink-500">方案2組數</div>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-lg px-4 py-2 text-center min-w-[90px]">
          <div className="text-2xl font-semibold text-pink-700">{plan2Total}</div>
          <div className="text-xs text-pink-500">方案2人數</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-600">
          桌位配置
          <span className="text-xs text-gray-400 font-normal ml-2">── 每組方案2賓客獨佔一桌，不與其他組合併</span>
        </p>

        {TABLE_ROWS.map(({ key, emoji, label, countId, capId, color }) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
            <span className={`text-sm font-semibold min-w-[56px] ${color}`}>{emoji} {label}</span>
            <Input
              type="number" min={0} max={100}
              value={diningSettings[countId]}
              onChange={(e) => updateDiningSettings({ [countId]: parseInt(e.target.value) || 0 })}
              className="w-16 text-center h-8 text-sm"
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">桌，每桌</span>
            <Input
              type="number" min={1} max={50}
              value={diningSettings[capId]}
              onChange={(e) => updateDiningSettings({ [capId]: parseInt(e.target.value) || 1 })}
              className="w-16 text-center h-8 text-sm"
            />
            <span className="text-sm text-gray-400">人</span>
            <span className={`text-xs ml-auto ${color}`}>
              → 共 {diningSettings[countId] * diningSettings[capId]} 位
            </span>
          </div>
        ))}

        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-700">🟣 其他桌</span>
            <Button
              variant="outline" size="sm"
              className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
              onClick={() => updateDiningSettings({ otherTables: [...otherTables, { id: nextOtherId, cap: 10 }] })}
            >
              + 新增桌子
            </Button>
          </div>
          {otherTables.length === 0 && (
            <p className="text-xs text-purple-400">點擊「新增桌子」可加入不同人數的桌子</p>
          )}
          {otherTables.map((ot, idx) => (
            <div key={ot.id} className="flex items-center gap-2 bg-white rounded-md border border-purple-100 px-3 py-2">
              <span className="text-sm text-purple-600 min-w-[48px]">桌 {idx + 1}</span>
              <span className="text-sm text-gray-400">容量</span>
              <Input
                type="number" min={1} max={50} value={ot.cap}
                onChange={(e) => updateDiningSettings({ otherTables: otherTables.map((t) => t.id === ot.id ? { ...t, cap: parseInt(e.target.value) || 1 } : t) })}
                className="w-16 text-center h-7 text-sm"
              />
              <span className="text-sm text-gray-400">人</span>
              <button
                className="ml-auto text-gray-400 hover:text-red-500 text-sm"
                onClick={() => updateDiningSettings({ otherTables: otherTables.filter((t) => t.id !== ot.id) })}
              >✕</button>
            </div>
          ))}
          {otherTables.length > 0 && (
            <p className="text-xs text-purple-500 pt-1">→ 共 {otherTables.length} 桌，合計 {otherSeats} 位</p>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
          <span className="text-sm text-gray-600">
            總桌數：<strong>{totalTables}</strong> 桌　總座位：<strong>{totalSeats}</strong> 位
          </span>
          {diningShortfall > 0 && (
            <span className="text-xs text-red-600">⚠ 桌數不足！方案2共 {plan2Guests.length} 組，差 {diningShortfall} 桌</span>
          )}
        </div>

        <div className="pt-1">
          <label className="text-xs text-gray-500 mb-1 block">桌號起始編號</label>
          <Input
            type="number" min={1} value={diningSettings.tableStart}
            onChange={(e) => updateDiningSettings({ tableStart: parseInt(e.target.value) || 1 })}
            className="w-24 h-8 text-sm"
          />
        </div>

        <div className="pt-1">
          <label className="text-xs text-gray-500 mb-1 block">留空備用位（每桌）</label>
          <Input
            type="number" min={0} max={5} value={diningSettings.reserveSeats}
            onChange={(e) => updateDiningSettings({ reserveSeats: parseInt(e.target.value) || 0 })}
            className="w-24 h-8 text-sm"
          />
        </div>
      </div>

      <Button
        disabled={totalTables === 0 || plan2Guests.length === 0}
        onClick={handleArrange}
        className="bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-40"
      >
        {arrangeLabel}
      </Button>
    </div>
  )
}
