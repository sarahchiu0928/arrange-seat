import { useStore } from '@/store'
import { parseRawCSV } from '@/lib/csvParser'
import { DropZone } from '@/components/DropZone'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import * as XLSX from 'xlsx'

export function Step0Clean() {
  const { cleanRows, setCleanRows, importFromCleanRows, goStep } = useStore()

  function handleImport() {
    importFromCleanRows()
    goStep(1)
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { rows, skippedCancel, skippedUnpaid } = parseRawCSV(text)
      setCleanRows(rows)
      void skippedCancel
      void skippedUnpaid
    }
    reader.readAsText(file, 'UTF-8')
  }

  function downloadCSV() {
    const headers = ['姓名', '手機號碼', '人數', '指定預約', '3歲以下兒童', '訂金金額', '備註', '店家備註']
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const lines = [headers.map(esc).join(',')]
    cleanRows.forEach((r) => {
      lines.push([r.name, r.phone, r.count, r.plan, r.kids, r.amount, r.note, r.shopNote].map(esc).join(','))
    })
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '整理後名單.csv'
    a.click()
  }

  function downloadExcel() {
    const wb = XLSX.utils.book_new()
    const data = [
      ['姓名', '手機號碼', '人數', '指定預約', '3歲以下兒童', '訂金金額', '備註', '店家備註'],
      ...cleanRows.map((r) => [r.name, r.phone, r.count, r.plan, r.kids, r.amount, r.note, r.shopNote]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(data)
    ws['!cols'] = [12, 14, 6, 28, 12, 10, 20, 20].map((w) => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, '整理後名單')
    XLSX.writeFile(wb, '整理後名單.xlsx')
  }

  const totalPeople = cleanRows.reduce((s, r) => s + (parseInt(r.count) || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center text-sm font-bold">✦</div>
        <h2 className="text-lg font-bold">整理預約名單</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
        <p className="text-sm font-medium text-gray-600">上傳原始預約 CSV 檔案</p>
        <DropZone
          onFile={handleFile}
          accept={{ 'text/csv': ['.csv'] }}
          icon="📥"
          hint="支援預約系統匯出的 .csv 格式"
        />
        <div className="text-xs text-blue-700 bg-blue-50 border-l-4 border-blue-400 px-3 py-2 rounded">
          自動過濾：<strong>取消預約</strong> 及 <strong>訂金未付款</strong> 的紀錄會被排除。
        </div>
      </div>

      {cleanRows.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-medium text-gray-600">整理後預覽</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={downloadCSV}>⬇ 下載 CSV</Button>
              <Button size="sm" variant="outline" onClick={downloadExcel}>⬇ 下載 Excel</Button>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {[
              { val: cleanRows.length, lbl: '有效筆數' },
              { val: totalPeople, lbl: '總人數' },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-center min-w-[90px]">
                <div className="text-2xl font-semibold">{val}</div>
                <div className="text-xs text-gray-400">{lbl}</div>
              </div>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>手機號碼</TableHead>
                  <TableHead className="w-12">人數</TableHead>
                  <TableHead>指定預約</TableHead>
                  <TableHead>3歲以下兒童</TableHead>
                  <TableHead className="w-20">訂金</TableHead>
                  <TableHead>備註</TableHead>
                  <TableHead>店家備註</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cleanRows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-gray-400">{i + 1}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{r.phone}</TableCell>
                    <TableCell className="text-center">{r.count}</TableCell>
                    <TableCell className="text-xs">{r.plan}</TableCell>
                    <TableCell className="text-center text-xs">{r.kids || '-'}</TableCell>
                    <TableCell className="text-right text-xs">{r.amount ? `$${r.amount}` : '-'}</TableCell>
                    <TableCell className="text-xs">{r.note || '-'}</TableCell>
                    <TableCell className="text-xs">{r.shopNote || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => goStep(1)}>前往名單調整 →</Button>
        {cleanRows.length > 0 && (
          <Button onClick={handleImport}>匯入整理後名單並調整 →</Button>
        )}
      </div>
    </div>
  )
}
