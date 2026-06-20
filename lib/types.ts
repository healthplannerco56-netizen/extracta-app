export interface Profile {
  id: string
  email: string
  plan: 'free' | 'pro'
  created_at: string
}

export interface Study {
  id: string
  user_id: string
  title: string
  status: 'pending' | 'processing' | 'done' | 'error'
  pdf_path?: string
  created_at: string
}

export interface Extraction {
  id: string
  study_id: string
  field_name: string
  field_value: string
  confidence: number
  status: 'extracted' | 'verified' | 'flagged'
  notes?: string
  created_at: string
}

export interface ExtractionConfig {
  fields: ExtractionField[]
}

export interface ExtractionField {
  name: string
  label: string
  type: 'text' | 'number' | 'select'
  options?: string[]
  required: boolean
  prompt: string
}
