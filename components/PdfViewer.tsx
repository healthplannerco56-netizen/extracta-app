'use client'

import { useState, useEffect, useRef } from 'react'

interface PdfViewerProps {
  file: File
  pageNum?: number
}

export default function PdfViewer({ file, pageNum = 1 }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [numPages, setNumPages] = useState(0)

  useEffect(() => {
    const render = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        setNumPages(pdf.numPages)

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })

        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = viewport.width
        canvas.height = viewport.height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise
      } catch (err) {
        setError('Failed to render PDF')
      }
    }

    render()
  }, [file, pageNum])

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="rounded-lg" />
      {numPages > 0 && (
        <p className="mt-2 text-xs text-white/30">
          Page {pageNum} of {numPages}
        </p>
      )}
    </div>
  )
}
