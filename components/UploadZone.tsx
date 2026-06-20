'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (file: File) => void
  uploading: boolean
}

export default function UploadZone({ onUpload, uploading }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file?.type === 'application/pdf') onUpload(file)
    },
    [onUpload],
  )

  const handleClick = () => inputRef.current?.click()
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onClick={handleClick}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-colors ${
        dragOver
          ? 'border-white/40 bg-white/5'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFile}
      />
      {uploading ? (
        <>
          <Loader2 className="mb-3 animate-spin text-white/40" size={32} />
          <p className="text-sm text-white/40">Uploading...</p>
        </>
      ) : (
        <>
          <Upload className="mb-3 text-white/30" size={32} />
          <p className="text-sm text-white/60">Drop a PDF here</p>
          <p className="mt-1 text-xs text-white/30">or click to browse</p>
        </>
      )}
    </div>
  )
}
