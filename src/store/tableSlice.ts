import type { Table } from '@/types'

export interface TableSlice {
  tables: Table[]
  setTables: (tables: Table[]) => void
  moveGuest: (fromTableNum: number, guestIdx: number, toTableNum: number) => void
}

export const createTableSlice = (set: (fn: (s: TableSlice) => Partial<TableSlice>) => void): TableSlice => ({
  tables: [],
  setTables: (tables) => set(() => ({ tables })),
  moveGuest: (fromTableNum, guestIdx, toTableNum) =>
    set((s) => {
      const tables = s.tables.map((t) => ({ ...t, guests: [...t.guests] }))
      const from = tables.find((t) => t.num === fromTableNum)
      const to = tables.find((t) => t.num === toTableNum)
      if (!from || !to || from === to) return {}
      const [guest] = from.guests.splice(guestIdx, 1)
      from.used -= guest.effective
      to.guests.push(guest)
      to.used += guest.effective
      return { tables }
    }),
})
