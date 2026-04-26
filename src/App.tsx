import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store'
import { Header } from '@/components/Header'
import { StepNav } from '@/components/StepNav'
import { Step0Clean } from '@/components/steps/Step0Clean'
import { Step1Adjust } from '@/components/steps/Step1Adjust'
import { Step3Result } from '@/components/steps/Step3Result'
import { Step4DiningResult } from '@/components/steps/Step4DiningResult'
import { Step5DishStats } from '@/components/steps/Step5DishStats'

const STEPS = [Step0Clean, Step1Adjust, Step3Result, Step4DiningResult, Step5DishStats]

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

export default function App() {
  const { currentStep } = useStore()
  const StepComponent = STEPS[currentStep]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-7 pb-20">
        <StepNav />
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
