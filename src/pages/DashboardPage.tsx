import { useState, useEffect, type FormEvent } from 'react'
import { getMyShipments, getShipmentByTracking, linkShipment, type User, type Shipment } from '@/api'
import StatusBadge from '@/components/StatusBadge'
import ModeIcon from '@/components/ModeIcon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function DashboardPage({ user }: { user: User }) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [search, setSearch] = useState('')
  const [linkTN, setLinkTN] = useState('')
  const [linkMsg, setLinkMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyShipments()
      .then(data => setShipments(data.shipments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = shipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.origin.toLowerCase().includes(search.toLowerCase()) ||
    s.destination.toLowerCase().includes(search.toLowerCase()) ||
    s.status.toLowerCase().includes(search.toLowerCase())
  )

  async function handleLink(e: FormEvent) {
    e.preventDefault()
    if (!linkTN.trim()) return
    try {
      // First get shipment by tracking number to get the ID
      const data = await getShipmentByTracking(linkTN)
      // Then link it to the current user
      await linkShipment(data.shipment.id)
      setLinkMsg('✅ Shipment successfully linked to your account!')
      setLinkTN('')
      // Refresh shipments list
      const shipmentsData = await getMyShipments()
      setShipments(shipmentsData.shipments)
    } catch (err) {
      setLinkMsg(err instanceof Error ? err.message : 'Failed to link shipment')
    }
    setTimeout(() => setLinkMsg(''), 4000)
  }

  return (
    <div className="min-h-screen bg-slate py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-navy">My Shipments</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-navy">{user.name}</span></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: shipments.length, color: 'text-navy' },
            { label: 'In Transit', value: shipments.filter(s => s.status === 'IN_TRANSIT').length, color: 'text-sky' },
            { label: 'Delivered', value: shipments.filter(s => s.status === 'DELIVERED').length, color: 'text-green-600' },
            { label: 'Pending', value: shipments.filter(s => !['DELIVERED', 'EXCEPTION'].includes(s.status) && s.status !== 'IN_TRANSIT').length, color: 'text-ember' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
              <div className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Link shipment */}
        <div className="bg-sky-light border border-sky/30 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-navy text-sm mb-1">Have a tracking number?</h3>
          <p className="text-slate-500 text-sm mb-3">Look up a shipment to see its current status.</p>
          <form onSubmit={handleLink} className="flex gap-2">
            <input
              type="text" value={linkTN} onChange={e => setLinkTN(e.target.value)}
              placeholder="Enter tracking number..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-sky/40 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky"
            />
            <button type="submit" className="bg-navy hover:bg-navy-mid text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">Look Up</button>
          </form>
          {linkMsg && <p className={`text-sm mt-2 ${linkMsg.startsWith('✅') ? 'text-green-700' : 'text-red-600'}`}>{linkMsg}</p>}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shipments..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center text-slate-400 py-16">
            <div className="animate-spin w-8 h-8 border-2 border-sky border-t-transparent rounded-full mx-auto mb-3" />
            Loading shipments...
          </div>
        )}

        {/* Shipments list */}
        {!loading && filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-display text-xl font-bold text-navy mb-2">No Shipments Yet</h3>
            <p className="text-slate-500 text-sm">Contact us to create a new shipment and it will appear here.</p>
            <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono text-base font-bold text-navy">{s.trackingNumber}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Created {formatDate(s.createdAt)}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                  <div><span className="text-slate-400">From</span><br /><span className="font-medium text-navy">{s.origin}</span></div>
                  <div><span className="text-slate-400">To</span><br /><span className="font-medium text-navy">{s.destination}</span></div>
                  <div><span className="text-slate-400">Mode</span><br /><ModeIcon mode={s.mode} /></div>
                  <div><span className="text-slate-400">Est. Delivery</span><br /><span className="font-medium text-navy">{formatDate(s.estimatedDelivery)}</span></div>
                </div>
                <a href={`/track/${s.trackingNumber}`} className="inline-flex items-center gap-1.5 text-sky hover:text-navy font-semibold text-sm transition-colors">
                  View Full Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}