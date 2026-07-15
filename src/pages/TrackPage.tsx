import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getShipmentByTracking, type Shipment, type TrackingEvent, type ShipmentStatus, STATUS_META, STATUS_DISPLAY } from '@/api'
import StatusBadge from '@/components/StatusBadge'
import ModeIcon from '@/components/ModeIcon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function TrackPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>()
  const navigate = useNavigate()
  const [queryInput, setQueryInput] = useState(trackingNumber || '')
  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined)

  const doSearch = useCallback(async (tn: string) => {
    if (!tn.trim()) return
    try {
      const data = await getShipmentByTracking(tn)
      setShipment(data.shipment)
    } catch {
      setShipment(null)
    }
  }, [])

  useEffect(() => { if (trackingNumber) doSearch(trackingNumber) }, [trackingNumber, doSearch])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const tn = queryInput.trim()
    if (tn) navigate(`/track/${encodeURIComponent(tn)}`)
  }

  const statusOrder: ShipmentStatus[] = [
    'ORDER_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_FACILITY',
    'CUSTOMS_CLEARANCE', 'OUT_FOR_DELIVERY', 'DELIVERED',
  ]

  const currentStep = shipment ? statusOrder.indexOf(shipment.status) : -1

  const events: TrackingEvent[] = shipment?.events || []

  return (
    <div className="min-h-screen bg-slate py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="Enter tracking number..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-sky shadow-sm"
          />
          <button type="submit" className="bg-navy hover:bg-navy-mid text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Track
          </button>
        </form>

        {shipment === undefined && (
          <div className="text-center text-slate-400 py-16">
            <div className="animate-spin w-8 h-8 border-2 border-sky border-t-transparent rounded-full mx-auto mb-3" />
            Searching...
          </div>
        )}

        {shipment === null && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="font-display text-2xl font-bold text-navy mb-2">Shipment Not Found</h2>
            <p className="text-slate-500">No shipment found for <span className="font-mono font-semibold text-slate-700">"{trackingNumber}"</span>. Please check your tracking number and try again.</p>
            <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact Support on WhatsApp
            </a>
          </div>
        )}

        {shipment && (
          <div className="space-y-5">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-navy px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Tracking Number</div>
                    <div className="font-mono text-xl font-bold text-white">{shipment.trackingNumber}</div>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">From</div>
                  <div className="text-sm font-semibold text-navy">{shipment.origin}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">To</div>
                  <div className="text-sm font-semibold text-navy">{shipment.destination}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Mode</div>
                  <ModeIcon mode={shipment.mode} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Est. Delivery</div>
                  <div className="text-sm font-semibold text-navy">{formatDate(shipment.estimatedDelivery)}</div>
                </div>
              </div>

              {/* Progress bar */}
              {shipment.status !== 'EXCEPTION' && (
                <div className="px-6 pb-6">
                  <div className="overflow-x-auto">
                    <div className="flex items-center min-w-max gap-0">
                      {statusOrder.map((s, i) => {
                        const done = i <= currentStep
                        const active = i === currentStep
                        return (
                          <div key={s} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                                done ? 'bg-sky border-sky text-white' : 'bg-white border-slate-200 text-slate-300'
                              } ${active ? 'scale-110 shadow-md' : ''}`}>
                                {done ? '✓' : i + 1}
                              </div>
                              <div className={`text-[9px] mt-1 w-16 text-center leading-tight ${done ? 'text-sky font-semibold' : 'text-slate-400'}`}>{STATUS_DISPLAY[s]}</div>
                            </div>
                            {i < statusOrder.length - 1 && (
                              <div className={`w-8 h-0.5 mb-4 ${i < currentStep ? 'bg-sky' : 'bg-slate-200'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipment details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-display text-xl font-bold text-navy mb-4">Shipment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Sender</span>
                  <span className="font-medium text-navy text-right">{shipment.senderName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Receiver</span>
                  <span className="font-medium text-navy text-right">{shipment.receiverName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Origin</span>
                  <span className="font-medium text-navy text-right">{shipment.origin}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Destination</span>
                  <span className="font-medium text-navy text-right">{shipment.destination}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Ship Date</span>
                  <span className="font-medium text-navy">{formatDate(shipment.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Est. Delivery</span>
                  <span className="font-medium text-navy">{formatDate(shipment.estimatedDelivery)}</span>
                </div>
              </div>
            </div>

            {/* Tracking timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-display text-xl font-bold text-navy mb-5">Tracking History</h3>
              {events.length === 0 && <p className="text-slate-400 text-sm">No tracking events yet.</p>}
              <div className="space-y-0">
                {[...events].reverse().map((evt, i) => {
                  const m = STATUS_META[evt.status]
                  const isFirst = i === 0
                  return (
                    <div key={evt.id} className={`relative flex gap-4 pb-6 timeline-item ${isFirst ? 'done' : ''}`}>
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 ${isFirst ? 'border-sky bg-sky-light' : 'border-slate-200 bg-white'}`}>
                          {m.icon}
                        </div>
                      </div>
                      <div className="pt-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <StatusBadge status={evt.status} />
                        </div>
                        <div className="text-sm font-medium text-navy mt-1">{evt.location}</div>
                        {evt.note && <div className="text-sm text-slate-500 mt-0.5">{evt.note}</div>}
                        <div className="text-xs text-slate-400 mt-1">{formatDateTime(evt.timestamp)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-green-800 text-sm">Have questions about your shipment?</p>
                <p className="text-green-700 text-sm">Our team is available to help you on WhatsApp.</p>
              </div>
              <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm whitespace-nowrap">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}