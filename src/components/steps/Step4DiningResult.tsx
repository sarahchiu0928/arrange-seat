import { useRef, useState } from 'react'
import {
  DndContext, DragOverlay,
  useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { toPng } from 'html-to-image'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { arrangeDining } from '@/lib/arrangeDining'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { GuestEntry, Table as TableType } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_STYLES: Record<string, string> = {
  方案1: 'bg-blue-50 text-blue-700 border-blue-200',
  方案2: 'bg-pink-50 text-pink-700 border-pink-200',
  方案3: 'bg-green-50 text-green-700 border-green-200',
  方案4: 'bg-orange-50 text-orange-700 border-orange-200',
}

const TABLE_STYLES = {
  std:   { card: 'bg-emerald-50 border-emerald-300', num: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', label: '標準桌' },
  big:   { card: 'bg-blue-50 border-blue-300',       num: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700',    bar: 'bg-blue-500',    label: '大桌' },
  sm:    { card: 'bg-orange-50 border-orange-300',   num: 'text-orange-700',  badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500', label: '小桌' },
  other: { card: 'bg-purple-50 border-purple-300',   num: 'text-purple-700',  badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500', label: '其他' },
}

// ─── GuestRow ─────────────────────────────────────────────────────────────────

function GuestRow({ g }: { g: GuestEntry }) {
  const planStyle = PLAN_STYLES[g.plan]
  const countLabel = `${g.adults}成人${g.kids > 0 ? `+${g.kids}小孩` : ''}`
  return (
    <div className="flex items-center justify-between text-sm px-2 py-1 rounded-md bg-white/70 select-none">
      <span className="font-medium text-gray-800 flex items-center gap-1">
        {g.plan && planStyle && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${planStyle}`}>{g.plan}</Badge>
        )}
        {g.name}
      </span>
      <span className="text-xs text-gray-400">{countLabel}</span>
    </div>
  )
}

// ─── DraggableGuestRow ────────────────────────────────────────────────────────

function DraggableGuestRow({ guest, id }: { guest: GuestEntry; id: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn('cursor-grab active:cursor-grabbing touch-none', isDragging && 'opacity-30')}
      {...attributes}
      {...listeners}
    >
      <GuestRow g={guest} />
    </div>
  )
}

// ─── DroppableTableCard ───────────────────────────────────────────────────────

function DroppableTableCard({ table }: { table: TableType }) {
  const { setNodeRef, isOver } = useDroppable({ id: `d:${table.num}` })
  const s = TABLE_STYLES[table.type]
  const pct = table.eff > 0 ? Math.round((table.used / table.eff) * 100) : 0
  const isOverCap = table.used > table.eff

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl border-2 p-3 relative transition-all duration-150',
        isOverCap
          ? 'bg-red-50 border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
          : s.card,
        isOver && !isOverCap && 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]',
      )}
    >
      {isOverCap && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
          ✕ 超出容量
        </div>
      )}

      <div className={cn('font-bold text-sm mb-1', isOverCap ? 'text-red-700' : s.num)}>
        第 {table.num} 桌
      </div>
      <div className={cn('absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full font-medium', isOverCap ? 'bg-red-100 text-red-700' : s.badge)}>
        {s.label} · {table.cap}位
      </div>

      <div className="space-y-1 mt-5">
        {table.guests.map((g, i) => (
          <DraggableGuestRow key={`d:${table.num}:${i}`} id={`d:${table.num}:${i}`} guest={g} />
        ))}
        {table.guests.length === 0 && (
          <p className="text-xs text-gray-400 py-1 text-center">（預留空桌）</p>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-2">
        <span className={cn('text-xs', isOverCap ? 'text-red-600 font-semibold' : 'text-gray-400')}>
          {table.used}/{table.eff}位
        </span>
        <div className="flex-1 h-1 bg-black/10 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', isOverCap ? 'bg-red-500' : s.bar)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className={cn('text-xs', isOverCap ? 'text-red-600' : 'text-gray-400')}>{pct}%</span>
      </div>
    </div>
  )
}

// ─── Step4DiningResult ────────────────────────────────────────────────────────

export function Step4DiningResult() {
  const { diningTables, guests, diningSettings, setDiningTables, moveDiningGuest, goStep } = useStore()
  const resultRef = useRef<HTMLDivElement>(null)
  const [activeGuest, setActiveGuest] = useState<GuestEntry | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragStart(event: DragStartEvent) {
    const [, tableNum, guestIdx] = String(event.active.id).split(':')
    const t = diningTables.find((t) => t.num === parseInt(tableNum))
    setActiveGuest(t?.guests[parseInt(guestIdx)] ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGuest(null)
    const { active, over } = event
    if (!over) return
    const [, fromNum, idx] = String(active.id).split(':')
    const [, toNum] = String(over.id).split(':')
    if (fromNum === toNum) return
    moveDiningGuest(parseInt(fromNum), parseInt(idx), parseInt(toNum))
  }

  const { unassigned } = arrangeDining(guests, diningSettings)
  const totalGuests = diningTables.reduce((s, t) => s + t.used, 0)
  const totalSeats = diningTables.reduce((s, t) => s + t.eff, 0)

  const stats = [
    { val: diningTables.length, lbl: '桌數' },
    { val: totalGuests, lbl: '方案2人數' },
    { val: totalSeats, lbl: '總座位數' },
    { val: totalSeats - totalGuests, lbl: '空位數' },
    { val: unassigned.length, lbl: '未排組數' },
  ]

  async function exportImage() {
    if (!resultRef.current) return
    const dataUrl = await toPng(resultRef.current, { backgroundColor: '#f9fafb', pixelRatio: 2 })
    const a = document.createElement('a')
    a.download = '用餐座位排列表.png'
    a.href = dataUrl
    a.click()
  }

  if (diningTables.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-400 text-white flex items-center justify-center text-sm font-bold">4</div>
          <h2 className="text-lg font-bold">排位結果－用餐座位</h2>
        </div>
        <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-4">
          尚未排用餐座位，請先至「桌位設定 → 用餐座位」進行排位。
        </p>
        <Button variant="outline" onClick={() => goStep(2)}>← 返回桌位設定</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-400 text-white flex items-center justify-center text-sm font-bold">4</div>
          <h2 className="text-lg font-bold">排位結果－用餐座位</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => goStep(2)}>← 修改設定</Button>
          <Button variant="outline" size="sm" onClick={() => { const { tables } = arrangeDining(guests, diningSettings); setDiningTables(tables) }}>↺ 重新排位</Button>
          <Button size="sm" onClick={exportImage}>⬇ 匯出圖片</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>🖨 列印</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {stats.map(({ val, lbl }) => (
          <div key={lbl} className="bg-white border border-gray-100 rounded-lg px-4 py-2 text-center min-w-[90px] shadow-sm">
            <div className="text-2xl font-semibold">{val}</div>
            <div className="text-xs text-gray-400">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-400 inline-block" />標準桌</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-200 border border-blue-400 inline-block" />大桌</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-200 border border-orange-400 inline-block" />小桌</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-200 border border-purple-400 inline-block" />其他</span>
        <span className="flex items-center gap-1.5 text-gray-400 ml-auto">拖曳賓客可換桌</span>
      </div>

      {/* Hall grid with DnD */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div ref={resultRef} className="overflow-x-auto">
          <div className="grid grid-cols-3 gap-3 min-w-[640px] mb-1">
            {['第一列', '第二列', '第三列'].map((lbl) => (
              <div key={lbl} className="text-center text-xs text-gray-400">{lbl}</div>
            ))}
          </div>
          <div
            className="grid grid-cols-3 gap-3 min-w-[640px]"
            style={{
              gridAutoFlow: 'column',
              gridTemplateRows: `repeat(${Math.ceil(diningTables.length / 3)}, auto)`,
            }}
          >
            {diningTables.map((t) => <DroppableTableCard key={t.num} table={t} />)}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeGuest && (
            <div className="bg-white rounded-lg shadow-xl border border-pink-300 px-3 py-2 opacity-95 min-w-[200px]">
              <GuestRow g={activeGuest} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div className="text-sm text-red-700 bg-red-50 border-l-4 border-red-400 px-4 py-3 rounded">
          ⚠ 以下 {unassigned.length} 組賓客無法排入現有桌位：
          {unassigned.map((g, i) => (
            <span key={i}> <strong>{g.name}</strong>（{g.effective}人）</span>
          ))}
        </div>
      )}
    </div>
  )
}
