import AuthButton from '@/components/AuthButton'
import type { Metadata } from 'next'
import './globals.css'
import ExtractorApp from '@/components/ExtractorApp'
import PdfWorkerSetup from '@/components/PdfWorkerSetup' // 1. Import the setup component

export const metadata: Metadata = {
  title: 'Extracta — AI Data Extraction for Meta-Analysis',
  description: 'Upload research papers and let AI extract structured data for meta-analysis.',
}

export default function Home() {
  return (
    <>
      {/* 2. Initialize the worker silently on the client side */}
      <PdfWorkerSetup />

      <nav>
        <div className="logo">Extract<span>a</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="nav-badge">BETA v0.1</div>
          <a href="/pricing" className="text-sm underline">Upgrade</a>
          <AuthButton />
        </div>
        </nav>

      <div className="hero">
        <div className="hero-label">AI-powered research tool</div>
        <h1>Extract study data from PDFs in <em>minutes,</em> not weeks.</h1>
        <p className="hero-sub">
          Upload your research papers, configure your extraction fields, and let AI pull structured 
          data for your meta-analysis — ready to export to GradMeta, Excel, or CSV.
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">40×</span>
            <span className="stat-label">Faster than manual</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">90%</span>
            <span className="stat-label">Field accuracy</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">12</span>
            <span className="stat-label">Extraction fields</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">0</span>
            <span className="stat-label">Papers stored server-side</span>
          </div>
        </div>
      </div>

      <div className="app-container">
        <div className="app-card">
          <div className="app-toolbar">
            <div className="toolbar-dots">
              <div className="dot dot-r"></div>
              <div className="dot dot-y"></div>
              <div className="dot dot-g"></div>
            </div>
            <div className="toolbar-title">extracta.app — extraction workspace</div>
            <div style={{ width: '60px' }}></div>
          </div>
          <ExtractorApp />
        </div>
      </div>
    </>
  )
}
