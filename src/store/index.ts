import { create } from 'zustand'
import { createStepSlice, type StepSlice } from './stepSlice'
import { createGuestSlice, type GuestSlice } from './guestSlice'
import { createTableSlice, type TableSlice } from './tableSlice'
import { createSettingsSlice, type SettingsSlice } from './settingsSlice'

type AppStore = StepSlice & GuestSlice & TableSlice & SettingsSlice

export const useStore = create<AppStore>()((set) => {
  const guestSlice = createGuestSlice(set as Parameters<typeof createGuestSlice>[0])

  function clearArrangements() {
    set(() => ({ tables: [], diningTables: [] }))
  }

  return {
    ...createStepSlice(set as Parameters<typeof createStepSlice>[0]),
    ...guestSlice,
    addGuest:           (g)    => { guestSlice.addGuest(g);           clearArrangements() },
    updateGuest:        (i, g) => { guestSlice.updateGuest(i, g);     clearArrangements() },
    deleteGuest:        (i)    => { guestSlice.deleteGuest(i);        clearArrangements() },
    importFromCleanRows:()     => { guestSlice.importFromCleanRows(); clearArrangements() },
    ...createTableSlice(set as Parameters<typeof createTableSlice>[0]),
    ...createSettingsSlice(set as Parameters<typeof createSettingsSlice>[0]),
  }
})
