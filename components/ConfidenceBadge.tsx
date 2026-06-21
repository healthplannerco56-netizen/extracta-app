import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'

interface ConfidenceBadgeProps {
  confidence: number
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  if (confidence >= 0.8) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
        <CheckCircle2 size={12} />
        High
      </span>
    )
  }

  if (confidence >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
        <AlertCircle size={12} />
        Medium
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
      <HelpCircle size={12} />
      Low
    </span>
  )
}
