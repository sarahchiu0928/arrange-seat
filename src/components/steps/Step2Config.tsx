import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ClassroomConfigPanel } from '@/components/ClassroomConfigPanel'
import { DiningConfigPanel } from '@/components/DiningConfigPanel'

export function Step2Config() {
  const { goStep } = useStore()
  const [tab, setTab] = useState<'classroom' | 'dining'>('classroom')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center text-sm font-bold">2</div>
        <h2 className="text-lg font-bold">桌位設定</h2>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            tab === 'classroom' ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
          onClick={() => setTab('classroom')}
        >
          上課座位
        </button>
        <button
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200',
            tab === 'dining' ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
          onClick={() => setTab('dining')}
        >
          用餐座位
        </button>
      </div>

      {tab === 'classroom' && (
        <>
          <ClassroomConfigPanel onArranged={() => goStep(3)} />
          <Button variant="outline" onClick={() => goStep(1)}>← 返回</Button>
        </>
      )}

      {tab === 'dining' && (
        <>
          <DiningConfigPanel onArranged={() => goStep(4)} />
          <Button variant="outline" onClick={() => goStep(1)}>← 返回</Button>
        </>
      )}
    </div>
  )
}
