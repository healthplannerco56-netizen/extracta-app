export type Plan = 'free' | 'pro'

export interface Profile {
  id: string
  email: string
  plan: Plan
  created_at: string
}

export interface Extraction {
  id: string
  user_id: string
  file_count: number
  fields_count: number
  created_at: string
}

// Usage limits per plan
export const PLAN_LIMITS = {
  free: {
    extractionsPerMonth: 10,
    pdfsPerRun: 3,
  },
  pro: {
    extractionsPerMonth: Infinity,
    pdfsPerRun: 20,
  },
} as const
