import Papa from 'papaparse'
import type { CleanRow } from '@/types'

const COL = {
  name: '姓名',
  phone: '手機號碼',
  count: '人數',
  plan: '指定預約',
  status: '狀態',
  deposit: '訂金狀態',
  kids: '請告知隨行有3歲以下兒童參加活動人數便於安排座位',
  amount: '訂金金額',
  note: '備註',
  shopNote: '店家備註',
}

export interface ParseRawResult {
  rows: CleanRow[]
  skippedCancel: number
  skippedUnpaid: number
}

export function parseRawCSV(text: string): ParseRawResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  const rows: CleanRow[] = []
  let skippedCancel = 0
  let skippedUnpaid = 0

  for (const r of result.data) {
    const get = (col: string) => (r[col] ?? '').trim()
    if (get(COL.status) === '取消預約') { skippedCancel++; continue }
    if (get(COL.deposit) === '未付款') { skippedUnpaid++; continue }
    rows.push({
      name: get(COL.name),
      phone: get(COL.phone),
      count: get(COL.count),
      plan: get(COL.plan),
      kids: get(COL.kids),
      amount: get(COL.amount),
      note: get(COL.note),
      shopNote: get(COL.shopNote),
    })
  }

  return { rows, skippedCancel, skippedUnpaid }
}
