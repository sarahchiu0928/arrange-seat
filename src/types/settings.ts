export interface OtherTable {
  id: number
  cap: number
}

export interface Settings {
  stdCount: number
  stdCap: number
  bigCount: number
  bigCap: number
  smCount: number
  smCap: number
  otherTables: OtherTable[]
  tableStart: number
  allowSplit: boolean
  sortMode: 'desc' | 'asc' | 'keep'
  kidsCount: boolean
  reserveSeats: number
}

export const defaultSettings: Settings = {
  stdCount: 6,
  stdCap: 10,
  bigCount: 0,
  bigCap: 14,
  smCount: 0,
  smCap: 5,
  otherTables: [],
  tableStart: 1,
  allowSplit: false,
  sortMode: 'desc',
  kidsCount: true,
  reserveSeats: 0,
}
