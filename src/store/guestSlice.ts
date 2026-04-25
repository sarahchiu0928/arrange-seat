import type { Guest, CleanRow } from '@/types'

// 處理「3歲以下兒童參加人數 x 1」這種文字格式，取 x 後面的數字
function parseKidsCount(raw: string): number {
  if (!raw) return 0
  const afterX = raw.match(/[xX×]\s*(\d+)/)
  if (afterX) return parseInt(afterX[1])
  return parseInt(raw) || 0
}

// 只保留「方案X」，省略後面的斜線說明文字
function normalizePlan(raw: string): string {
  const match = raw.match(/方案\d+/)
  return match ? match[0] : raw
}

export interface GuestSlice {
  guests: Guest[]
  cleanRows: CleanRow[]
  setGuests: (guests: Guest[]) => void
  setCleanRows: (rows: CleanRow[]) => void
  addGuest: (g: Guest) => void
  updateGuest: (i: number, g: Guest) => void
  deleteGuest: (i: number) => void
  importFromCleanRows: () => void
}

export const createGuestSlice = (set: (fn: (s: GuestSlice) => Partial<GuestSlice>) => void): GuestSlice => ({
  guests: [],
  cleanRows: [],
  setGuests: (guests) => set(() => ({ guests })),
  setCleanRows: (rows) => set(() => ({ cleanRows: rows })),
  addGuest: (g) => set((s) => ({ guests: [...s.guests, g] })),
  updateGuest: (i, g) =>
    set((s) => {
      const guests = [...s.guests]
      guests[i] = g
      return { guests }
    }),
  deleteGuest: (i) =>
    set((s) => ({ guests: s.guests.filter((_, idx) => idx !== i) })),
  importFromCleanRows: () =>
    set((s) => {
      const guests: Guest[] = s.cleanRows
        .map((r) => {
          const adults = parseInt(r.count) || 0
          const kids = parseKidsCount(r.kids)
          if (adults === 0 && kids === 0) return null
          return {
            name: r.name,
            phone: r.phone,
            adults,
            kids,
            total: adults + kids,
            plan: normalizePlan(r.plan),
            note: [r.note, r.shopNote].filter(Boolean).join(' / ') || undefined,
          }
        })
        .filter(Boolean) as Guest[]
      return { guests }
    }),
})
