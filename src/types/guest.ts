export interface Guest {
  name: string
  phone: string
  adults: number
  kids: number
  total: number
  plan: string
  note?: string
  splits?: number[]   // e.g. [2, 3, 5] → "2+3+5"
}

export interface GuestEntry extends Guest {
  effective: number
  split: boolean
  splitLabel?: string
}

export interface CleanRow {
  name: string
  phone: string
  count: string
  plan: string
  kids: string
  amount: string
  note: string
  shopNote: string
}
