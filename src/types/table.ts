import type { GuestEntry } from './guest'

export type TableType = 'std' | 'big' | 'sm'

export interface Table {
  num: number
  type: TableType
  cap: number
  eff: number
  guests: GuestEntry[]
  used: number
}
