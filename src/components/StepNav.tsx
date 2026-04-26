import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

const STEPS = [
  { id: 0, label: '✦ 整理名單' },
  { id: 1, label: '① 名單調整' },
  { id: 2, label: '② 桌位設定' },
  { id: 3, label: '③ 排位結果－上課座位' },
  { id: 4, label: '④ 排位結果－用餐座位' },
]

export function StepNav() {
  const { currentStep, goStep, guests, diningTables } = useStore()

  function handleClick(id: number) {
    if (id === 1 && currentStep === 0) { goStep(1); return }
    if (id === 2 && guests.length === 0) return
    if (id === 4 && diningTables.length === 0) return
    if (id >= 0 && id <= 4) goStep(id as 0 | 1 | 2 | 3 | 4)
  }

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-100 rounded-xl shadow-sm mb-6">
      {STEPS.map((step) => {
        const isActive = currentStep === step.id
        const isDone = step.id < currentStep
        const isDisabled =
          (step.id === 4 && diningTables.length === 0) ||
          (step.id === 2 && guests.length === 0)
        return (
          <motion.button
            key={step.id}
            layout
            onClick={() => handleClick(step.id)}
            disabled={isDisabled}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm border transition-colors cursor-pointer select-none',
              isActive && 'bg-amber-400 text-gray-900 border-amber-400 font-semibold shadow-sm',
              isDone && !isActive && 'border-amber-300 text-amber-600 bg-white',
              !isActive && !isDone && 'border-gray-200 text-gray-400 bg-gray-50',
              isDisabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {step.label}
          </motion.button>
        )
      })}
    </div>
  )
}
