import type { GuestEntry } from './guest'

export type TableType = 'std' | 'big' | 'sm' | 'other'

export interface Table {
  num: number
  type: TableType
  cap: number
  eff: number
  guests: GuestEntry[]
  used: number
}
