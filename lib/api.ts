const API_BASE = ''

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }

  return res.json()
}

export async function uploadPDF(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Upload failed')
  }
  return res.json()
}

export async function extractText(studyId: string, text: string, fields: any[]) {
  return request('/api/extract', {
    method: 'POST',
    body: JSON.stringify({ studyId, text, fields }),
  })
}

export async function fetchStudies() {
  return request<{ studies: any[] }>('/api/studies')
}

export async function exportStudy(studyId: string, format: 'csv' | 'json') {
  const accept = format === 'csv' ? 'text/csv' : 'application/json'
  const res = await fetch(`/api/export/${studyId}`, {
    headers: { accept },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Export failed')
  }

  if (format === 'csv') {
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extraction-${studyId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return res.json()
}

export async function createCheckout() {
  return request<{ url: string }>('/api/dodo/checkout', {
    method: 'POST',
  })
}
