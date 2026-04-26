export interface StepSlice {
  currentStep: 0 | 1 | 2 | 3 | 4
  goStep: (n: 0 | 1 | 2 | 3 | 4) => void
}

export const createStepSlice = (set: (fn: (s: StepSlice) => Partial<StepSlice>) => void): StepSlice => ({
  currentStep: 0,
  goStep: (n) => set(() => ({ currentStep: n })),
})
