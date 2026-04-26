import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Guest } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_STYLES: Record<string, string> = {
  方案1: 'bg-blue-50 text-blue-700 border-blue-200',
  方案2: 'bg-pink-50 text-pink-700 border-pink-200',
  方案3: 'bg-green-50 text-green-700 border-green-200',
  方案4: 'bg-orange-50 text-orange-700 border-orange-200',
}

const SPLIT_LABELS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛']

const EMPTY_GUEST: Guest = { name: '', phone: '', adults: 1, kids: 0, total: 1, plan: '', note: '' }

// ─── GuestDialog ──────────────────────────────────────────────────────────────

interface GuestDialogProps {
  open: boolean
  isEdit: boolean        // false = 新增（姓名電話可改）true = 編輯（唯讀）
  initial: Guest         // 一律帶入（新增時傳 EMPTY_GUEST）
  onSave: (g: Guest) => void
  onClose: () => void
}

function GuestDialog({ open, isEdit, initial, onSave, onClose }: GuestDialogProps) {
  const [adults, setAdults] = useState(initial.adults)
  const [kids, setKids]   = useState(initial.kids)
  const [plan, setPlan]   = useState(initial.plan || 'none')
  const [note, setNote]   = useState(initial.note ?? '')
  const [name, setName]   = useState(initial.name)
  const [phone, setPhone] = useState(initial.phone)

  // Split state
  const initSplits = initial.splits && initial.splits.length >= 2 ? initial.splits : null
  const [splitEnabled, setSplitEnabled] = useState(!!initSplits)
  const [splits, setSplits] = useState<number[]>(initSplits ?? [0, 0])

  const total = adults + kids
  const splitSum = splits.reduce((a, b) => a + b, 0)
  const splitValid = splitEnabled ? splitSum === total && splits.every((v) => v > 0) : true

  function updateSplit(idx: number, val: number) {
    setSplits((prev) => prev.map((v, i) => (i === idx ? Math.max(0, val) : v)))
  }

  function handleSave() {
    if (!name.trim() || total === 0) return
    const finalSplits = splitEnabled && splitValid ? splits : undefined
    onSave({ ...initial, name: name.trim(), phone, adults, kids, total, plan: plan === 'none' ? '' : plan, note, splits: finalSplits })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? `編輯 — ${initial.name}` : '新增賓客'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* 姓名 / 電話 */}
          {isEdit ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">姓名</Label>
                <div className="h-9 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200 text-sm font-medium">
                  {initial.name}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">電話</Label>
                <div className="h-9 flex items-center px-3 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-500">
                  {initial.phone || '-'}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>姓名 *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="王小美" />
              </div>
              <div className="space-y-1.5">
                <Label>電話</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912345678" />
              </div>
            </div>
          )}

          {/* 大人 / 小孩 / 合計 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>大人</Label>
              <Input type="number" min={0} value={adults} onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div className="space-y-1.5">
              <Label>小孩</Label>
              <Input type="number" min={0} value={kids} onChange={(e) => setKids(Math.max(0, parseInt(e.target.value) || 0))} />
            </div>
            <div className="space-y-1.5">
              <Label>合計</Label>
              <div className="h-9 flex items-center px-3 border border-gray-200 rounded-md bg-gray-50 text-sm font-semibold">{total}</div>
            </div>
          </div>

          {/* 方案 */}
          <div className="space-y-1.5">
            <Label>方案</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v ?? 'none')}>
              <SelectTrigger><SelectValue placeholder="無方案" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">無方案</SelectItem>
                <SelectItem value="方案1">方案1</SelectItem>
                <SelectItem value="方案2">方案2</SelectItem>
                <SelectItem value="方案3">方案3</SelectItem>
                <SelectItem value="方案4">方案4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 備註 */}
          <div className="space-y-1.5">
            <Label>備註</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="備餐需求、座位偏好…" />
          </div>

          {/* 拆桌 */}
          {total >= 2 && (
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Label className="text-gray-600">拆桌設定</Label>
                {splitEnabled ? (
                  <button className="text-xs text-red-400 hover:underline" onClick={() => { setSplitEnabled(false); setSplits([0, 0]) }}>清除拆桌</button>
                ) : (
                  <button className="text-xs text-blue-500 hover:underline" onClick={() => setSplitEnabled(true)}>啟用拆桌</button>
                )}
              </div>

              {splitEnabled && (
                <div className="space-y-2">
                  {splits.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-4">{SPLIT_LABELS[idx] ?? idx + 1}</span>
                      <Input
                        type="number" min={1} max={total}
                        value={val || ''}
                        placeholder="0"
                        onChange={(e) => updateSplit(idx, parseInt(e.target.value) || 0)}
                        className="w-20 text-center h-8 text-sm"
                      />
                      <span className="text-xs text-gray-400">人</span>
                      {splits.length > 2 && (
                        <button
                          onClick={() => setSplits((p) => p.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-600 text-xs border border-red-200 rounded px-1.5 py-0.5"
                        >✕</button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => setSplits((p) => [...p, 0])}>
                    + 再加一組
                  </Button>
                  <div className={`text-xs font-mono px-3 py-1.5 rounded-md ${splitValid ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                    {splits.join('+')} = {splitSum}
                    {splitSum > 0 && <span className="ml-1">{splitValid ? '✓ 合計正確' : `（應為 ${total} 人）`}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button disabled={!name.trim() || total === 0 || !splitValid} onClick={handleSave}>
            {isEdit ? '儲存' : '新增'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Step1Adjust ──────────────────────────────────────────────────────────────

export function Step1Adjust() {
  const { guests, cleanRows, addGuest, updateGuest, deleteGuest, importFromCleanRows, goStep } = useStore()

  const [addOpen, setAddOpen] = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null)

  const totalAdults  = guests.reduce((s, g) => s + g.adults, 0)
  const totalKids    = guests.reduce((s, g) => s + g.kids, 0)
  const plan1Count   = guests.filter((g) => g.plan === '方案1').length
  const plan2Count   = guests.filter((g) => g.plan === '方案2').length

  function handleAdd(g: Guest) {
    addGuest({ ...g, total: g.adults + g.kids })
  }

  function handleUpdate(g: Guest) {
    if (editIdx === null) return
    updateGuest(editIdx, { ...g, total: g.adults + g.kids })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center text-sm font-bold">1</div>
        <h2 className="text-lg font-bold">名單調整</h2>
      </div>

      {/* Import banner */}
      {guests.length === 0 && cleanRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-blue-700">有 <strong>{cleanRows.length}</strong> 筆整理後名單可以匯入</p>
          <Button size="sm" onClick={importFromCleanRows}>匯入名單</Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {guests.length > 0
            ? <>共 <strong className="text-gray-800">{guests.length}</strong> 組・大人 <strong className="text-gray-800">{totalAdults}</strong> 位・小孩 <strong className="text-gray-800">{totalKids}</strong> 位・合計 <strong className="text-gray-800">{totalAdults + totalKids}</strong> 人・<span className="inline-flex items-center gap-1"><span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-0.5 text-xs font-medium">方案1</span><strong className="text-gray-800 text-sm">{plan1Count}</strong><span className="text-xs text-blue-700">組</span></span>・<span className="inline-flex items-center gap-1"><span className="bg-pink-50 text-pink-700 border border-pink-200 rounded-md px-2 py-0.5 text-xs font-medium">方案2</span><strong className="text-gray-800 text-sm">{plan2Count}</strong><span className="text-xs text-pink-700">組</span></span></>
            : '尚無賓客'}
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>+ 新增賓客</Button>
      </div>

      {/* Table */}
      {guests.length > 0 && (
        <div className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>電話</TableHead>
                  <TableHead className="w-12 text-center">大人</TableHead>
                  <TableHead className="w-12 text-center">小孩</TableHead>
                  <TableHead className="w-12 text-center">合計</TableHead>
                  <TableHead className="w-16">方案</TableHead>
                  <TableHead className="w-24">拆桌</TableHead>
                  <TableHead>備註</TableHead>
                  <TableHead className="w-16 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((g, i) => {
                  const hasValidSplit = g.splits && g.splits.length >= 2 && g.splits.reduce((a, b) => a + b, 0) === g.total
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-gray-400">{i + 1}</TableCell>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{g.phone || '-'}</TableCell>
                      <TableCell className="text-center">{g.adults}</TableCell>
                      <TableCell className="text-center">{g.kids > 0 ? g.kids : '-'}</TableCell>
                      <TableCell className="text-center font-semibold">{g.total}</TableCell>
                      <TableCell>
                        {g.plan && (
                          <Badge variant="outline" className={`text-xs ${PLAN_STYLES[g.plan] ?? ''}`}>{g.plan}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasValidSplit
                          ? <span className="font-mono text-xs bg-gray-100 text-gray-700 rounded px-1.5 py-0.5">{g.splits!.join('+')}</span>
                          : <span className="text-xs text-gray-300">-</span>}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-[120px] truncate" title={g.note}>
                        {g.note || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => setEditIdx(i)}
                            className="text-xs text-blue-500 border border-blue-200 hover:bg-blue-50 rounded px-2 py-0.5 transition-colors"
                          >編輯</button>
                          <button
                            onClick={() => deleteGuest(i)}
                            className="text-xs text-red-400 border border-red-200 hover:bg-red-50 rounded px-2 py-0.5 transition-colors"
                          >✕</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {guests.length === 0 && cleanRows.length === 0 && (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm">尚無賓客名單</p>
          <p className="text-xs mt-1">請從步驟０匯入，或點右上角「新增賓客」手動新增</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => goStep(0)}>← 返回</Button>
        <Button disabled={guests.length === 0} onClick={() => goStep(2)}>下一步：排位結果 →</Button>
      </div>

      {/* 新增 Dialog — key="add" 固定，避免 state 殘留 */}
      {addOpen && (
        <GuestDialog
          key="add"
          open
          isEdit={false}
          initial={EMPTY_GUEST}
          onSave={handleAdd}
          onClose={() => setAddOpen(false)}
        />
      )}

      {/* 編輯 Dialog — key=editIdx 強制每次 remount，確保帶入正確資料 */}
      {editIdx !== null && (
        <GuestDialog
          key={editIdx}
          open
          isEdit
          initial={guests[editIdx]}
          onSave={handleUpdate}
          onClose={() => setEditIdx(null)}
        />
      )}
    </div>
  )
}
