'use client'

import { useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

export default function PdfWorkerSetup() {
  useEffect(() => {
    // This tells pdfjs where to find its worker script dynamically based on the installed version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
  }, [])

  return null // This component doesn't render anything to the screen
}
