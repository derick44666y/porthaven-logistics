import { type ShipmentStatus, STATUS_META, STATUS_DISPLAY } from '@/api'

export default function StatusBadge({ status }: { status: ShipmentStatus }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.color} ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {STATUS_DISPLAY[status]}
    </span>
  )
}