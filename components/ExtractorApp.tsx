'use client'

import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/AuthModal'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`

interface Field {
  id: string
  name: string
  desc: string
  group: string
  default: boolean
}

const FIELDS: Field[] = [
  // Study Identification
  { id: 'authors',          name: 'Authors',              desc: 'Author surnames',                       group: 'id',   default: true  },
  { id: 'year',             name: 'Publication Year',     desc: 'Year published',                        group: 'id',   default: true  },
  { id: 'journal',          name: 'Journal',              desc: 'Journal name',                          group: 'id',   default: false },
  { id: 'study_design',     name: 'Study Design',         desc: 'RCT, cohort, etc.',                     group: 'id',   default: true  },

  // Population
  { id: 'sample_size',      name: 'Sample Size (N)',      desc: 'Total participants',                    group: 'pop',  default: true  },
  { id: 'n_treatment',      name: 'N Treatment',          desc: 'Participants in treatment arm',         group: 'pop',  default: true  },
  { id: 'n_control',        name: 'N Control',            desc: 'Participants in control arm',           group: 'pop',  default: true  },
  { id: 'population',       name: 'Population',           desc: 'Patient/participant type',              group: 'pop',  default: true  },
  { id: 'mean_age',         name: 'Mean Age',             desc: 'Average age of participants',           group: 'pop',  default: false },

  // Intervention
  { id: 'intervention',     name: 'Intervention',         desc: 'Treatment / exposure',                  group: 'int',  default: true  },
  { id: 'comparator',       name: 'Comparator / Control', desc: 'Control or comparison arm',             group: 'int',  default: true  },

  // Outcomes — Binary
  { id: 'outcome',          name: 'Outcome Type',         desc: 'Primary measured outcome',              group: 'out',  default: true  },
  { id: 'events_treatment', name: 'Events (Treatment)',   desc: 'Event count in treatment arm',          group: 'out',  default: true  },
  { id: 'events_control',   name: 'Events (Control)',     desc: 'Event count in control arm',            group: 'out',  default: true  },
  { id: 'effect_size',      name: 'Effect Measure',       desc: 'OR, RR, RD, MD, SMD, HR',              group: 'out',  default: true  },
  { id: 'confidence_interval', name: '95% CI',            desc: 'Confidence interval',                   group: 'out',  default: true  },
  { id: 'p_value',          name: 'P-value',              desc: 'Statistical significance',              group: 'out',  default: false },

  // Outcomes — Continuous
  { id: 'mean_treatment',   name: 'Mean (Treatment)',     desc: 'Mean value in treatment arm',           group: 'out',  default: false },
  { id: 'mean_control',     name: 'Mean (Control)',       desc: 'Mean value in control arm',             group: 'out',  default: false },
  { id: 'sd_treatment',     name: 'SD (Treatment)',       desc: 'Standard deviation, treatment arm',     group: 'out',  default: false },
  { id: 'sd_control',       name: 'SD (Control)',         desc: 'Standard deviation, control arm',       group: 'out',  default: false },

  // Quality
  { id: 'rob',              name: 'Risk of Bias',         desc: 'Low / Some concerns / High / Unclear',  group: 'qual', default: false },
  { id: 'grade',            name: 'GRADE',                desc: 'High / Moderate / Low / Very Low',      group: 'qual', default: false },
  { id: 'subgroup',         name: 'Subgroup',             desc: 'Subgroup label if applicable',          group: 'qual', default: false },
  { id: 'funding',          name: 'Funding Source',       desc: 'Industry vs. public',                   group: 'qual', default: false },
]

const GROUP_LABELS: Record<string, string> = {
  id:   'Study Identification',
  pop:  'Population',
  int:  'Intervention',
  out:  'Outcomes & Effect Sizes',
  qual: 'Quality Assessment',
}

interface ExtractedRow {
  _filename: string
  _error?: string
  [key: string]: string | undefined
}

export default function ExtractorApp() {
  const [activeTab, setActiveTab] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(FIELDS.filter(f => f.default).map(f => f.id))
  )
  const [extractedData, setExtractedData] = useState<ExtractedRow[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [notification, setNotification] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [editableCells, setEditableCells] = useState({} as Record<string, Record<number, string>>)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const notify = useCallback((msg: string) => {
    setNotification(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }, [])

  const goToTab = useCallback((n: number) => setActiveTab(n), [])

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles = Array.from(fileList).filter(
      f => f.type === 'application/pdf' && !files.find(existing => existing.name === f.name)
    )
    setFiles(prev => [...prev, ...newFiles])
  }, [files])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const toggleField = useCallback((id: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const extractPDFText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    const maxPages = Math.min(pdf.numPages, 15)
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    return text.slice(0, 12000)
  }

  const callClaudeAPI = async (pdfText: string, fields: Field[]): Promise<Record<string, string>> => {
    const fieldList = fields.map(f => `- ${f.name} (${f.desc}): field key "${f.id}"`).join('\n')
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { session } } = await sb.auth.getSession()
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ pdfText, fields: fieldList }),
    })
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'API error')
    }
    return response.json()
  }

  const startExtraction = async () => {
    if (!user) { setShowAuth(true); return }
    if (files.length === 0) { notify('Please upload at least one PDF first'); goToTab(0); return }
    if (selectedFields.size === 0) { notify('Please select at least one field to extract'); return }

    goToTab(2)
    setIsExtracting(true)
    setExtractedData([])
    setProgress(0)

    const selFields = FIELDS.filter(f => selectedFields.has(f.id))
    const results: ExtractedRow[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress(Math.round((i / files.length) * 100))
      setProgressLabel(`Processing ${i + 1} of ${files.length}: ${file.name}`)
      try {
        setProgressLabel(`Extracting text from ${file.name}...`)
        const pdfText = await extractPDFText(file)
        setProgressLabel(`Sending to Claude AI...`)
        const apiResult = await callClaudeAPI(pdfText, selFields)
        results.push({ ...apiResult, _filename: file.name } as ExtractedRow)
      } catch (err: any) {
        results.push({ _filename: file.name, _error: err.message } as ExtractedRow)
      }
    }

    setExtractedData(results)
    setIsExtracting(false)
    setProgress(100)
    setProgressLabel(`Complete — ${results.filter(d => !d._error).length} of ${files.length} extracted`)
  }

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    if (extractedData.length === 0) { notify('No data to export yet'); return }
    const headers = ['File', ...FIELDS.filter(f => selectedFields.has(f.id)).map(f => f.name)]
    const rows = extractedData.map(row => [
      row._filename,
      ...FIELDS.filter(f => selectedFields.has(f.id)).map(f => row[f.id] || '')
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    downloadFile('extracta_data.csv', csv, 'text/csv')
    notify('CSV downloaded')
  }

  const exportJSON = () => {
    if (extractedData.length === 0) { notify('No data to export yet'); return }
    downloadFile('extracta_data.json', JSON.stringify(extractedData, null, 2), 'application/json')
    notify('JSON downloaded')
  }

  const exportGradMetaBinary = () => {
    if (extractedData.length === 0) { notify('No data to export yet'); return }
    const headers = ['study_id','title','authors','year','journal','n_treatment','n_control','events_treatment','events_control','outcome_type','effect_measure','rob','grade','subgroup']
    const rows = extractedData.filter(d => !d._error).map((d, i) => [
      `S${i + 1}`, '', d.authors||'', d.year||'', d.journal||'',
      d.n_treatment||'', d.n_control||'',
      d.events_treatment||'', d.events_control||'',
      d.outcome||'', d.effect_size||'', d.rob||'', d.grade||'', d.subgroup||''
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    downloadFile('gradmeta_binary.csv', csv, 'text/csv')
    notify('GradMeta Binary CSV downloaded')
  }

  const exportGradMetaContinuous = () => {
    if (extractedData.length === 0) { notify('No data to export yet'); return }
    const headers = ['study_id','title','authors','year','journal','outcome_type','effect_measure','n_treatment','n_control','mean_treatment','mean_control','sd_treatment','sd_control','rob','grade','subgroup']
    const rows = extractedData.filter(d => !d._error).map((d, i) => [
      `S${i + 1}`, '', d.authors||'', d.year||'', d.journal||'',
      d.outcome||'', d.effect_size||'',
      d.n_treatment||'', d.n_control||'',
      d.mean_treatment||'', d.mean_control||'',
      d.sd_treatment||'', d.sd_control||'',
      d.rob||'', d.grade||'', d.subgroup||''
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    downloadFile('gradmeta_continuous.csv', csv, 'text/csv')
    notify('GradMeta Continuous CSV downloaded')
  }

  const handleCellEdit = (fieldId: string, rowIndex: number, value: string) => {
    setEditableCells(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], [rowIndex]: value }
    }))
  }

  const getCellValue = (row: ExtractedRow, fieldId: string, rowIndex: number): string => {
    if (editableCells[fieldId]?.[rowIndex] !== undefined) return editableCells[fieldId][rowIndex]
    return row[fieldId] || ''
  }

  const selFields = FIELDS.filter(f => selectedFields.has(f.id))
  const successCount = extractedData.filter(d => !d._error).length
  const fillRate = selFields.length > 0 && successCount > 0 ? Math.round(extractedData.reduce((acc, row) => acc + selFields.filter(f => row[f.id] && row[f.id] !== null).length, 0) / (successCount * selFields.length) * 100) : 0

  return (
    <>
      {/* AUTH BUTTON */}
      <button
        onClick={() => user ? supabase.auth.signOut() : setShowAuth(true)}
        style={{
          position: 'fixed', top: '20px', right: '80px', zIndex: 9999,
          padding: '8px 18px',
          background: user ? 'transparent' : '#b5451b',
          border: user ? '1px solid #999' : 'none',
          borderRadius: '4px',
          color: user ? '#666' : '#fff',
          fontSize: '12px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.05em'
        }}
      >
        {user ? 'Sign Out' : 'Sign In'}
      </button>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />
      )}

      <div className="steps-bar">
        {[0, 1, 2, 3].map(n => (
          <div
            key={n}
            className={`step-tab ${n === activeTab ? 'active' : ''} ${n < activeTab ? 'done' : ''}`}
            onClick={() => goToTab(n)}
          >
            <div className="step-num">{n + 1}</div>
            {['Upload Papers', 'Configure Fields', 'Extract Data', 'Export'][n]}
          </div>
        ))}
      </div>

      {/* PANEL 1: UPLOAD */}
      <div className={`panel ${activeTab === 0 ? 'active' : ''}`}>
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={e => handleFiles(e.target.files)} />
          <div className="upload-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="upload-title">Drop research papers here</div>
          <p className="upload-sub">PDF files up to 20MB each · Multiple files supported</p>
          <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
            Browse files
          </button>
        </div>

        <div className="file-list">
          {files.map((file, i) => (
            <div key={file.name} className="file-item">
              <div className="file-icon">PDF</div>
              <div className="file-name">{file.name}</div>
              <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <button className="remove-btn" onClick={() => removeFile(i)}>×</button>
            </div>
          ))}
        </div>

        <div className="panel-nav">
          <div></div>
          <button className="btn btn-primary" onClick={() => goToTab(1)}>Configure Fields →</button>
        </div>
      </div>

      {/* PANEL 2: CONFIGURE */}
      <div className={`panel ${activeTab === 1 ? 'active' : ''}`}>
        {FIELDS.map((field, idx) => {
          if (idx === 0 || FIELDS[idx - 1].group !== field.group) {
            return (
              <>
                <div key={`label-${field.group}`} className="section-label" style={{ gridColumn: '1 / -1', marginTop: idx === 0 ? 0 : '12px' }}>
                  {GROUP_LABELS[field.group]}
                </div>
                <div
                  key={field.id}
                  className={`field-toggle ${selectedFields.has(field.id) ? 'selected' : ''}`}
                  onClick={() => toggleField(field.id)}
                >
                  <div className="toggle-check">{selectedFields.has(field.id) ? '✓' : ''}</div>
                  <div className="field-info">
                    <div className="field-name">{field.name}</div>
                    <div className="field-desc">{field.desc}</div>
                  </div>
                </div>
              </>
            )
          }
          return (
            <div
              key={field.id}
              className={`field-toggle ${selectedFields.has(field.id) ? 'selected' : ''}`}
              onClick={() => toggleField(field.id)}
            >
              <div className="toggle-check">{selectedFields.has(field.id) ? '✓' : ''}</div>
              <div className="field-info">
                <div className="field-name">{field.name}</div>
                <div className="field-desc">{field.desc}</div>
              </div>
            </div>
          )
        })}
        <div className="panel-nav">
          <button className="btn btn-ghost" onClick={() => goToTab(0)}>← Back</button>
          <button className="btn btn-primary" onClick={startExtraction}>Extract Data →</button>
        </div>
      </div>

      {/* PANEL 3: EXTRACT */}
      <div className={`panel ${activeTab === 2 ? 'active' : ''}`}>
        <div className="extract-header">
          <div className="extract-title">Extraction Results</div>
          <div className={`status-badge ${isExtracting ? 'status-processing' : extractedData.length > 0 ? 'status-done' : 'status-idle'}`}>
            {isExtracting ? 'PROCESSING' : extractedData.length > 0 ? 'COMPLETE' : 'READY'}
          </div>
        </div>

        {isExtracting && (
          <div className="progress-section">
            <div className="progress-bar-wrap">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-label">{progressLabel}</div>
          </div>
        )}

        {extractedData.length === 0 && !isExtracting && (
          <div className="empty-state">
            <div className="empty-state-icon">🔬</div>
            <div className="empty-state-text">Click &quot;Extract Data&quot; on the previous step to begin AI extraction.</div>
          </div>
        )}

        {extractedData.length > 0 && (
          <>
            <div className="summary-box">
              <div className="summary-item">
                <span className="summary-num">{files.length}</span>
                <span className="summary-label">Papers Uploaded</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">{successCount}</span>
                <span className="summary-label">Successfully Extracted</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">{selFields.length}</span>
                <span className="summary-label">Fields Configured</span>
              </div>
              <div className="summary-item">
                <span className="summary-num">{fillRate}%</span>
                <span className="summary-label">Field Fill Rate</span>
              </div>
            </div>

            <div className="results-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File</th>
                    {selFields.map(f => <th key={f.id}>{f.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((row, i) => (
                    <tr key={i}>
                      <td className="row-num">{i + 1}</td>
                      <td style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row._filename}>
                        {row._filename}
                      </td>
                      {row._error ? (
                        <td colSpan={selFields.length} style={{ color: 'var(--accent)', fontSize: '12px', fontStyle: 'italic' }}>
                          Error: {row._error}
                        </td>
                      ) : selFields.map(f => {
                        const val = getCellValue(row, f.id, i)
                        const isMono = ['sample_size','n_treatment','n_control','effect_size','p_value','confidence_interval','year','mean_age','mean_treatment','mean_control','sd_treatment','sd_control','events_treatment','events_control'].includes(f.id)
                        return (
                          <td
                            key={f.id}
                            className={isMono ? 'cell-mono' : !val || val === 'null' ? 'missing' : ''}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={e => handleCellEdit(f.id, i, (e.target as HTMLElement).textContent || '')}
                          >
                            {(!val || val === 'null') ? 'not found' : val}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="panel-nav">
          <button className="btn btn-ghost" onClick={() => goToTab(1)}>← Back</button>
          {extractedData.length > 0 && (
            <button className="btn btn-accent" onClick={() => goToTab(3)}>Export Results →</button>
          )}
        </div>
      </div>

      {/* PANEL 4: EXPORT */}
      <div className={`panel ${activeTab === 3 ? 'active' : ''}`}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '8px' }}>Export your data</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '4px' }}>
          Choose your format. All exports include a human-review audit trail.
        </p>

        <div className="export-options">
          <div className="export-card" onClick={exportCSV}>
            <div className="export-card-icon">📊</div>
            <div className="export-card-name">CSV</div>
            <div className="export-card-desc">Universal format, opens in Excel, Numbers, Google Sheets</div>
          </div>
          <div className="export-card" onClick={exportJSON}>
            <div className="export-card-icon">🗂️</div>
            <div className="export-card-name">JSON</div>
            <div className="export-card-desc">For developers and API integrations</div>
          </div>
          <div className="export-card" onClick={exportGradMetaBinary}>
            <div className="export-card-icon">📈</div>
            <div className="export-card-name">GradMeta — Binary</div>
            <div className="export-card-desc">OR / RR / RD · events-based outcomes</div>
          </div>
          <div className="export-card" onClick={exportGradMetaContinuous}>
            <div className="export-card-icon">📉</div>
            <div className="export-card-name">GradMeta — Continuous</div>
            <div className="export-card-desc">MD / SMD · means &amp; SD outcomes</div>
          </div>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '3px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '0.08em' }}>
            ▸ NEXT STEP: RUN YOUR META-ANALYSIS
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7' }}>
            Take your extracted data to <strong style={{ color: 'var(--ink)' }}>GradMeta.com</strong> to run forest plots,
            heterogeneity tests, and publication bias analysis — no R required. Your CSV is ready to import directly.
          </p>
          <a href="https://www.gradmeta.com" target="_blank" className="btn btn-ghost" style={{ marginTop: '12px', fontSize: '11px' }}>
            Open GradMeta ↗
          </a>
        </div>

        <div className="panel-nav">
          <button className="btn btn-ghost" onClick={() => goToTab(2)}>← Back to Results</button>
          <button className="btn btn-accent" onClick={exportCSV}>Download CSV</button>
        </div>
      </div>

      {/* NOTIFICATION */}
      <div className={`notification ${showNotification ? 'show' : ''}`}>
        {notification}
      </div>
    </>
  )
}