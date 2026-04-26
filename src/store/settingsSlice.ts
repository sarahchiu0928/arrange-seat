import type { Settings, DiningSettings } from '@/types'
import { defaultSettings, defaultDiningSettings } from '@/types'

export interface SettingsSlice {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
  diningSettings: DiningSettings
  updateDiningSettings: (partial: Partial<DiningSettings>) => void
}

export const createSettingsSlice = (set: (fn: (s: SettingsSlice) => Partial<SettingsSlice>) => void): SettingsSlice => ({
  settings: defaultSettings,
  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),
  diningSettings: defaultDiningSettings,
  updateDiningSettings: (partial) =>
    set((s) => ({ diningSettings: { ...s.diningSettings, ...partial } })),
})
