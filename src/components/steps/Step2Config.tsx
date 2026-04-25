import { useStore } from '@/store'
import { arrange } from '@/lib/arrange'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export function Step2Config() {
  const { guests, settings, updateSettings, setTables, goStep } = useStore()

  const totalTables = settings.stdCount + settings.bigCount + settings.smCount
  const totalSeats =
    settings.stdCount * settings.stdCap +
    settings.bigCount * settings.bigCap +
    settings.smCount * settings.smCap
  const totalGuests = guests.reduce((s, g) => s + g.total, 0)
  const seatShortfall = totalGuests > totalSeats ? totalGuests - totalSeats : 0

  function handleArrange() {
    if (totalTables === 0) return
    const { tables } = arrange(guests, settings)
    setTables(tables)
    goStep(3)
  }

  const tableRows = [
    { key: 'std', emoji: '🟢', label: '標準桌', countId: 'stdCount', capId: 'stdCap', color: 'text-green-700' },
    { key: 'big', emoji: '🔵', label: '大桌',   countId: 'bigCount', capId: 'bigCap', color: 'text-blue-700' },
    { key: 'sm',  emoji: '🟠', label: '小桌',   countId: 'smCount',  capId: 'smCap',  color: 'text-orange-600' },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center text-sm font-bold">2</div>
        <h2 className="text-lg font-bold">桌位設定</h2>
      </div>

      {/* 桌位配置 */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-600">
          桌位配置
          <span className="text-xs text-gray-400 font-normal ml-2">── 設定幾桌就是幾桌，系統只會在這些桌子裡排位</span>
        </p>

        {tableRows.map(({ key, emoji, label, countId, capId, color }) => (
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

        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
          <span className="text-sm text-gray-600">
            總桌數：<strong>{totalTables}</strong> 桌　總座位：<strong>{totalSeats}</strong> 位
          </span>
          {seatShortfall > 0 && (
            <span className="text-xs text-red-600">
              ⚠ 座位不足！賓客共 {totalGuests} 人，差 {seatShortfall} 位
            </span>
          )}
        </div>

        <div className="pt-1">
          <label className="text-xs text-gray-500 mb-1 block">桌號起始編號</label>
          <Input
            type="number" min={1}
            value={settings.tableStart}
            onChange={(e) => updateSettings({ tableStart: parseInt(e.target.value) || 1 })}
            className="w-24 h-8 text-sm"
          />
        </div>
      </div>

      {/* 排位選項 */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
        <p className="text-sm font-medium text-gray-600">排位選項</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">同組賓客是否可拆桌</label>
            <Select
              value={settings.allowSplit ? 'yes' : 'no'}
              onValueChange={(v) => updateSettings({ allowSplit: v === 'yes' })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">❌ 不拆桌（整組坐同一桌）</SelectItem>
                <SelectItem value="yes">✅ 允許拆桌（人數超過時自動拆）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">排序方式</label>
            <Select
              value={settings.sortMode}
              onValueChange={(v) => updateSettings({ sortMode: v as 'desc' | 'asc' | 'keep' })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">人數多的優先排</SelectItem>
                <SelectItem value="asc">人數少的優先排</SelectItem>
                <SelectItem value="keep">依輸入順序</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">小孩計入桌位人數</label>
            <Select
              value={settings.kidsCount ? 'yes' : 'no'}
              onValueChange={(v) => updateSettings({ kidsCount: v === 'yes' })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">是（佔一個座位）</SelectItem>
                <SelectItem value="no">否（不計入桌位）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">留空備用位（每桌）</label>
            <Input
              type="number" min={0} max={5}
              value={settings.reserveSeats}
              onChange={(e) => updateSettings({ reserveSeats: parseInt(e.target.value) || 0 })}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => goStep(1)}>← 返回</Button>
        <Button disabled={totalTables === 0} onClick={handleArrange}>開始排位 ✦</Button>
      </div>
    </div>
  )
}
