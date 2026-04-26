import { useStore } from '@/store'
import { arrange } from '@/lib/arrange'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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

export function ClassroomConfigPanel({ onArranged, arrangeLabel = '開始排位 ✦' }: Props) {
  const { guests, settings, updateSettings, setTables } = useStore()

  const otherTables: OtherTable[] = settings.otherTables ?? []
  const otherSeats = otherTables.reduce((s, t) => s + t.cap, 0)
  const nextOtherId = otherTables.length > 0 ? Math.max(...otherTables.map((t) => t.id)) + 1 : 1

  const totalTables = settings.stdCount + settings.bigCount + settings.smCount + otherTables.length
  const totalSeats =
    settings.stdCount * settings.stdCap +
    settings.bigCount * settings.bigCap +
    settings.smCount * settings.smCap +
    otherSeats
  const totalGuests = guests.reduce((s, g) => s + g.total, 0)
  const seatShortfall = totalGuests > totalSeats ? totalGuests - totalSeats : 0

  function handleArrange() {
    if (totalTables === 0) return
    const { tables } = arrange(guests, settings)
    setTables(tables)
    onArranged?.()
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-600">
          桌位配置
          <span className="text-xs text-gray-400 font-normal ml-2">── 設定幾桌就是幾桌，系統只會在這些桌子裡排位</span>
        </p>

        {TABLE_ROWS.map(({ key, emoji, label, countId, capId, color }) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
            <span className={`text-sm font-semibold min-w-[56px] ${color}`}>{emoji} {label}</span>
            <Input
              type="number" min={0} max={100}
              value={settings[countId]}
              onChange={(e) => updateSettings({ [countId]: parseInt(e.target.value) || 0 })}
              className="w-16 text-center h-8 text-sm"
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">桌，每桌</span>
            <Input
              type="number" min={1} max={50}
              value={settings[capId]}
              onChange={(e) => updateSettings({ [capId]: parseInt(e.target.value) || 1 })}
              className="w-16 text-center h-8 text-sm"
            />
            <span className="text-sm text-gray-400">人</span>
            <span className={`text-xs ml-auto ${color}`}>
              → 共 {settings[countId] * settings[capId]} 位
            </span>
          </div>
        ))}

        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-purple-700">🟣 其他桌</span>
            <Button
              variant="outline" size="sm"
              className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
              onClick={() => updateSettings({ otherTables: [...otherTables, { id: nextOtherId, cap: 10 }] })}
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
                onChange={(e) => updateSettings({ otherTables: otherTables.map((t) => t.id === ot.id ? { ...t, cap: parseInt(e.target.value) || 1 } : t) })}
                className="w-16 text-center h-7 text-sm"
              />
              <span className="text-sm text-gray-400">人</span>
              <button
                className="ml-auto text-gray-400 hover:text-red-500 text-sm"
                onClick={() => updateSettings({ otherTables: otherTables.filter((t) => t.id !== ot.id) })}
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
          {seatShortfall > 0 && (
            <span className="text-xs text-red-600">⚠ 座位不足！賓客共 {totalGuests} 人，差 {seatShortfall} 位</span>
          )}
        </div>

        <div className="pt-1">
          <label className="text-xs text-gray-500 mb-1 block">桌號起始編號</label>
          <Input
            type="number" min={1} value={settings.tableStart}
            onChange={(e) => updateSettings({ tableStart: parseInt(e.target.value) || 1 })}
            className="w-24 h-8 text-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <p className="text-sm font-medium text-gray-600">排位選項</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">小孩計入桌位人數</label>
            <Select
              value={settings.kidsCount ? 'yes' : 'no'}
              onValueChange={(v) => updateSettings({ kidsCount: v === 'yes' })}
            >
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">是（佔一個座位）</SelectItem>
                <SelectItem value="no">否（不計入桌位）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">留空備用位（每桌）</label>
            <Input
              type="number" min={0} max={5} value={settings.reserveSeats}
              onChange={(e) => updateSettings({ reserveSeats: parseInt(e.target.value) || 0 })}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      <Button disabled={totalTables === 0} onClick={handleArrange}>{arrangeLabel}</Button>
    </div>
  )
}
