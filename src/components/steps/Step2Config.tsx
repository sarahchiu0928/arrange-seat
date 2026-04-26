import { useState } from 'react'
import { useStore } from '@/store'
import { arrange } from '@/lib/arrange'
import { arrangeDining } from '@/lib/arrangeDining'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { OtherTable } from '@/types'

export function Step2Config() {
  const {
    guests, settings, updateSettings,
    diningSettings, updateDiningSettings,
    setTables, setDiningTables, goStep,
  } = useStore()
  const [tab, setTab] = useState<'classroom' | 'dining'>('classroom')

  // ── 上課座位 ──────────────────────────────────────────────
  const otherTables: OtherTable[] = settings.otherTables ?? []
  const otherSeats = otherTables.reduce((s, t) => s + t.cap, 0)
  const nextOtherId = otherTables.length > 0 ? Math.max(...otherTables.map((t) => t.id)) + 1 : 1

  function addOtherTable() {
    updateSettings({ otherTables: [...otherTables, { id: nextOtherId, cap: 10 }] })
  }
  function removeOtherTable(id: number) {
    updateSettings({ otherTables: otherTables.filter((t) => t.id !== id) })
  }
  function updateOtherTableCap(id: number, cap: number) {
    updateSettings({ otherTables: otherTables.map((t) => t.id === id ? { ...t, cap } : t) })
  }

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
    goStep(3)
  }

  // ── 用餐座位 ──────────────────────────────────────────────
  const diningOtherTables: OtherTable[] = diningSettings.otherTables ?? []
  const diningOtherSeats = diningOtherTables.reduce((s, t) => s + t.cap, 0)
  const nextDiningOtherId = diningOtherTables.length > 0 ? Math.max(...diningOtherTables.map((t) => t.id)) + 1 : 1

  function addDiningOtherTable() {
    updateDiningSettings({ otherTables: [...diningOtherTables, { id: nextDiningOtherId, cap: 10 }] })
  }
  function removeDiningOtherTable(id: number) {
    updateDiningSettings({ otherTables: diningOtherTables.filter((t) => t.id !== id) })
  }
  function updateDiningOtherTableCap(id: number, cap: number) {
    updateDiningSettings({ otherTables: diningOtherTables.map((t) => t.id === id ? { ...t, cap } : t) })
  }

  const diningTotalTables = diningSettings.stdCount + diningSettings.bigCount + diningSettings.smCount + diningOtherTables.length
  const diningTotalSeats =
    diningSettings.stdCount * diningSettings.stdCap +
    diningSettings.bigCount * diningSettings.bigCap +
    diningSettings.smCount * diningSettings.smCap +
    diningOtherSeats
  const plan2Guests = guests.filter((g) => g.plan === '方案2')
  const plan2Total = plan2Guests.reduce((s, g) => s + g.total, 0)
  const diningShortfall = plan2Guests.length > diningTotalTables ? plan2Guests.length - diningTotalTables : 0

  function handleDiningArrange() {
    if (diningTotalTables === 0) return
    const { tables } = arrangeDining(guests, diningSettings)
    setDiningTables(tables)
    goStep(4)
  }

  const classroomTableRows = [
    { key: 'std', emoji: '🟢', label: '標準桌', countId: 'stdCount', capId: 'stdCap', color: 'text-green-700' },
    { key: 'big', emoji: '🔵', label: '大桌',   countId: 'bigCount', capId: 'bigCap', color: 'text-blue-700' },
    { key: 'sm',  emoji: '🟠', label: '小桌',   countId: 'smCount',  capId: 'smCap',  color: 'text-orange-600' },
  ] as const

  const diningTableRows = [
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

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            tab === 'classroom' ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
          onClick={() => setTab('classroom')}
        >
          上課座位
        </button>
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200',
            tab === 'dining' ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
          onClick={() => setTab('dining')}
        >
          用餐座位
        </button>
      </div>

      {/* ── 上課座位 tab ── */}
      {tab === 'classroom' && (
        <>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
            <p className="text-sm font-medium text-gray-600">
              桌位配置
              <span className="text-xs text-gray-400 font-normal ml-2">── 設定幾桌就是幾桌，系統只會在這些桌子裡排位</span>
            </p>

            {classroomTableRows.map(({ key, emoji, label, countId, capId, color }) => (
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
                <Button variant="outline" size="sm" className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-100" onClick={addOtherTable}>
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
                  <Input type="number" min={1} max={50} value={ot.cap} onChange={(e) => updateOtherTableCap(ot.id, parseInt(e.target.value) || 1)} className="w-16 text-center h-7 text-sm" />
                  <span className="text-sm text-gray-400">人</span>
                  <button className="ml-auto text-gray-400 hover:text-red-500 text-sm" onClick={() => removeOtherTable(ot.id)} title="移除此桌">✕</button>
                </div>
              ))}
              {otherTables.length > 0 && (
                <p className="text-xs text-purple-500 pt-1">→ 共 {otherTables.length} 桌，合計 {otherSeats} 位</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
              <span className="text-sm text-gray-600">
                總桌數：<strong>{totalTables}</strong> 桌總座位：<strong>{totalSeats}</strong> 位
              </span>
              {seatShortfall > 0 && (
                <span className="text-xs text-red-600">⚠ 座位不足！賓客共 {totalGuests} 人，差 {seatShortfall} 位</span>
              )}
            </div>

            <div className="pt-1">
              <label className="text-xs text-gray-500 mb-1 block">桌號起始編號</label>
              <Input type="number" min={1} value={settings.tableStart} onChange={(e) => updateSettings({ tableStart: parseInt(e.target.value) || 1 })} className="w-24 h-8 text-sm" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
            <p className="text-sm font-medium text-gray-600">排位選項</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">小孩計入桌位人數</label>
                <Select value={settings.kidsCount ? 'yes' : 'no'} onValueChange={(v) => updateSettings({ kidsCount: v === 'yes' })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">是（佔一個座位）</SelectItem>
                    <SelectItem value="no">否（不計入桌位）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">留空備用位（每桌）</label>
                <Input type="number" min={0} max={5} value={settings.reserveSeats} onChange={(e) => updateSettings({ reserveSeats: parseInt(e.target.value) || 0 })} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => goStep(1)}>← 返回</Button>
            <Button disabled={totalTables === 0} onClick={handleArrange}>開始排位 ✦</Button>
          </div>
        </>
      )}

      {/* ── 用餐座位 tab ── */}
      {tab === 'dining' && (
        <>
          {/* 方案2 統計 */}
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

            {diningTableRows.map(({ key, emoji, label, countId, capId, color }) => (
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
                <Button variant="outline" size="sm" className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-100" onClick={addDiningOtherTable}>
                  + 新增桌子
                </Button>
              </div>
              {diningOtherTables.length === 0 && (
                <p className="text-xs text-purple-400">點擊「新增桌子」可加入不同人數的桌子</p>
              )}
              {diningOtherTables.map((ot, idx) => (
                <div key={ot.id} className="flex items-center gap-2 bg-white rounded-md border border-purple-100 px-3 py-2">
                  <span className="text-sm text-purple-600 min-w-[48px]">桌 {idx + 1}</span>
                  <span className="text-sm text-gray-400">容量</span>
                  <Input type="number" min={1} max={50} value={ot.cap} onChange={(e) => updateDiningOtherTableCap(ot.id, parseInt(e.target.value) || 1)} className="w-16 text-center h-7 text-sm" />
                  <span className="text-sm text-gray-400">人</span>
                  <button className="ml-auto text-gray-400 hover:text-red-500 text-sm" onClick={() => removeDiningOtherTable(ot.id)} title="移除此桌">✕</button>
                </div>
              ))}
              {diningOtherTables.length > 0 && (
                <p className="text-xs text-purple-500 pt-1">→ 共 {diningOtherTables.length} 桌，合計 {diningOtherSeats} 位</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
              <span className="text-sm text-gray-600">
                總桌數：<strong>{diningTotalTables}</strong> 桌總座位：<strong>{diningTotalSeats}</strong> 位
              </span>
              {diningShortfall > 0 && (
                <span className="text-xs text-red-600">⚠ 桌數不足！方案2共 {plan2Guests.length} 組，差 {diningShortfall} 桌</span>
              )}
            </div>

            <div className="pt-1">
              <label className="text-xs text-gray-500 mb-1 block">桌號起始編號</label>
              <Input type="number" min={1} value={diningSettings.tableStart} onChange={(e) => updateDiningSettings({ tableStart: parseInt(e.target.value) || 1 })} className="w-24 h-8 text-sm" />
            </div>

            <div className="pt-1">
              <label className="text-xs text-gray-500 mb-1 block">留空備用位（每桌）</label>
              <Input type="number" min={0} max={5} value={diningSettings.reserveSeats} onChange={(e) => updateDiningSettings({ reserveSeats: parseInt(e.target.value) || 0 })} className="w-24 h-8 text-sm" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => goStep(1)}>← 返回</Button>
            <Button
              disabled={diningTotalTables === 0 || plan2Guests.length === 0}
              onClick={handleDiningArrange}
              className="bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-40"
            >
              開始排用餐座位 ✦
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
