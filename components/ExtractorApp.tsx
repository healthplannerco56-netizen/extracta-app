'use client'

import { useState, useCallback } from 'react'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { DEFAULT_EXTRACTION_FIELDS } from '@/lib/constants'
import UploadZone from './UploadZone'

interface ExtractorAppProps {
  onDone: () => void
}

export default function ExtractorApp({ onDone }: ExtractorAppProps) {
  const [step, setStep] = useState<'upload' | 'extracting' | 'results'>('upload')
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [studyId, setStudyId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any> | null>(null)
  const [extractions, setExtractions] = useState<any[]>([])
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setStudyId(data.study.id)
      setStep('extracting')

      // Extract text from PDF using pdfjs-dist
      const text = await extractTextFromPDF(file)

      // Call extraction API
      setExtracting(true)
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyId: data.study.id,
          text,
          fields: DEFAULT_EXTRACTION_FIELDS,
        }),
      })

      const extractData = await extractRes.json()
      if (!extractRes.ok) throw new Error(extractData.error || 'Extraction failed')

      setResults(extractData.data)
      fetchExtractions(data.study.id)
      setStep('results')
    } catch (err: any) {
      setError(err.message)
      setStep('upload')
    } finally {
      setUploading(false)
      setExtracting(false)
    }
  }, [])

  const fetchExtractions = async (id: string) => {
    const { data } = await supabase
      .from('extractions')
      .select('*')
      .eq('study_id', id)
    setExtractions(data ?? [])
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (!results) return

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(results, null, 2)], {
        type: 'application/json',
      })
      downloadBlob(blob, `extraction-${studyId}.json`)
    } else {
      const headers = DEFAULT_EXTRACTION_FIELDS.map((f) => f.label)
      const values = DEFAULT_EXTRACTION_FIELDS.map(
        (f) => results[f.name] ?? '',
      )
      const csv = [headers.join(','), values.join(',')].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      downloadBlob(blob, `extraction-${studyId}.csv`)
    }
  }

  if (step === 'extracting') {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="mb-4 animate-spin text-white/40" size={40} />
        <p className="font-serif text-xl italic text-white/60">
          {extracting ? 'Claude is reading your paper...' : 'Uploading...'}
        </p>
        <p className="mt-2 text-sm text-white/30">
          This usually takes 15–30 seconds
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {step === 'upload' && (
        <>
          <div className="mb-8">
            <h2 className="font-serif text-2xl italic text-white">
              New extraction
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Upload a research PDF to extract structured data
            </p>
          </div>

          <UploadZone onUpload={handleUpload} uploading={uploading} />

          {error && (
            <p className="mt-4 text-center text-sm text-red-400">{error}</p>
          )}
        </>
      )}

      {step === 'results' && (
        <>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl italic text-white">
                Extraction results
              </h2>
              <p className="mt-1 text-sm text-white/40">
                AI-extracted fields from your PDF
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('csv')}
                className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Download size={14} />
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Download size={14} />
                JSON
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {DEFAULT_EXTRACTION_FIELDS.map((field) => {
              const extraction = extractions.find(
                (e) => e.field_name === field.name,
              )
              const value = results?.[field.name]
              const confidence = extraction?.confidence ?? 0

              return (
                <div
                  key={field.name}
                  className="liquid-glass rounded-2xl p-5"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">
                      {field.label}
                    </span>
                    {confidence > 0.7 ? (
                      <CheckCircle2 className="text-emerald-400" size={16} />
                    ) : (
                      <AlertCircle className="text-amber-400" size={16} />
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    {value ?? (
                      <span className="italic text-white/20">Not found</span>
                    )}
                  </p>
                  {confidence <= 0.7 && (
                    <p className="mt-1 text-xs text-amber-400/60">
                      Low confidence — please verify
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onDone}
              className="liquid-glass flex items-center gap-2 rounded-full px-6 py-2.5 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to studies
            </button>
          </div>
        </>
      )}
    </div>
  )
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import('pdfjs-dist')

  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''

  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item: any) => item.str).join(' ') + '\n'
  }

  return text.slice(0, 20000)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
