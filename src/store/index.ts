import { create } from 'zustand'
import { createStepSlice, type StepSlice } from './stepSlice'
import { createGuestSlice, type GuestSlice } from './guestSlice'
import { createTableSlice, type TableSlice } from './tableSlice'
import { createSettingsSlice, type SettingsSlice } from './settingsSlice'

type AppStore = StepSlice & GuestSlice & TableSlice & SettingsSlice

export const useStore = create<AppStore>()((set) => ({
  ...createStepSlice(set as Parameters<typeof createStepSlice>[0]),
  ...createGuestSlice(set as Parameters<typeof createGuestSlice>[0]),
  ...createTableSlice(set as Parameters<typeof createTableSlice>[0]),
  ...createSettingsSlice(set as Parameters<typeof createSettingsSlice>[0]),
}))
