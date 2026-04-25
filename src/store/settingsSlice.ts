import type { Settings } from '@/types'
import { defaultSettings } from '@/types'

export interface SettingsSlice {
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void
}

export const createSettingsSlice = (set: (fn: (s: SettingsSlice) => Partial<SettingsSlice>) => void): SettingsSlice => ({
  settings: defaultSettings,
  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),
})
