import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFile: (file: File) => void
  accept: Record<string, string[]>
  icon: string
  hint: string
}

export function DropZone({ onFile, accept, icon, hint }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: false,
    onDrop: (files) => { if (files[0]) onFile(files[0]) },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-amber-400 bg-amber-50'
          : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/50',
      )}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">點擊選擇檔案</span>或拖曳至此
      </div>
      <div className="text-xs text-gray-400 mt-1">{hint}</div>
    </div>
  )
}
