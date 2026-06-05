interface Props { score: number; }
export default function ConfidenceBadge({ score }: Props) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{pct}%</span>;
}
