'use client'

import { useEffect, useState } from 'react'

export default function PdfWorkerSetup() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const setup = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
        setReady(true)
      } catch {
        setError('Failed to load PDF engine')
      }
    }
    setup()
  }, [])

  if (error) {
    return <p className="text-xs text-red-400">{error}</p>
  }

  if (!ready) {
    return <p className="text-xs text-white/30">Loading PDF engine...</p>
  }

  return null
}
