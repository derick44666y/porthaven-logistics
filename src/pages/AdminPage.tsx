import { useState, useEffect, type FormEvent } from 'react'
import { getMyShipments, createShipment as apiCreateShipment, addTrackingEvent as apiAddEvent, updateShipment, deleteShipment, searchLocations, createCustomerUser, type Location, type Shipment, type ShipmentStatus, ALL_STATUSES, STATUS_META, STATUS_DISPLAY } from '@/api'
import StatusBadge from '@/components/StatusBadge'
import ModeIcon from '@/components/ModeIcon'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminPage() {
  const [tab, setTab] = useState<'shipments' | 'create' | 'event' | 'edit' | 'customer'>('shipments')
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [newShipment, setNewShipment] = useState({
    senderName: '', receiverName: '', origin: '', destination: '', mode: 'AIR' as 'AIR' | 'SEA', customerId: null as string | null, estimatedDelivery: ''
  })
  const [editShipment, setEditShipment] = useState<Shipment | null>(null)
  const [editForm, setEditForm] = useState({
    senderName: '', receiverName: '', origin: '', destination: '', mode: 'AIR' as 'AIR' | 'SEA', estimatedDelivery: ''
  })
  const [newEvent, setNewEvent] = useState({
    shipmentId: '', status: 'IN_TRANSIT' as ShipmentStatus, location: '', note: '', timestamp: new Date().toISOString().slice(0, 16)
  })
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', password: '' })
  const [createdCustomer, setCreatedCustomer] = useState<{ email: string; password: string; name: string } | null>(null)

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [showLocationSuggest, setShowLocationSuggest] = useState(false)

  useEffect(() => {
    const q = newEvent.location.trim()
    if (q.length < 2) {
      setLocationSuggestions([])
      return
    }
    const t = setTimeout(() => {
      searchLocations(q, 8)
        .then(setLocationSuggestions)
        .catch(() => setLocationSuggestions([]))
    }, 250)
    return () => clearTimeout(t)
  }, [newEvent.location])

  useEffect(() => {
    getMyShipments()
      .then(data => setShipments(data.shipments))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tab, success])

  const filtered = shipments.filter(s =>
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.receiverName.toLowerCase().includes(search.toLowerCase()) ||
    s.senderName.toLowerCase().includes(search.toLowerCase()) ||
    s.origin.toLowerCase().includes(search.toLowerCase()) ||
    s.destination.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreateShipment(e: FormEvent) {
    e.preventDefault()
    try {
      const data = await apiCreateShipment({ ...newShipment, estimatedDelivery: newShipment.estimatedDelivery + 'T00:00:00.000Z' })
      setCreatedShipment(data.shipment)
      setSuccess(`Shipment created! Tracking: ${data.shipment.trackingNumber}`)
      setNewShipment({ senderName: '', receiverName: '', origin: '', destination: '', mode: 'AIR', customerId: null, estimatedDelivery: '' })
      setTimeout(() => setSuccess(''), 8000)
    } catch (err) {
      setSuccess(`Error: ${err instanceof Error ? err.message : 'Failed to create shipment'}`)
    }
  }

  async function handleAddEvent(e: FormEvent) {
    e.preventDefault()
    try {
      await apiAddEvent(newEvent.shipmentId, {
        status: newEvent.status,
        location: newEvent.location,
        note: newEvent.note,
        timestamp: new Date(newEvent.timestamp).toISOString(),
      })
      setSuccess('Tracking event added successfully!')
      setNewEvent(prev => ({ shipmentId: prev.shipmentId, status: 'IN_TRANSIT', location: '', note: '', timestamp: new Date().toISOString().slice(0, 16) }))
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setSuccess(`Error: ${err instanceof Error ? err.message : 'Failed to add event'}`)
    }
  }

  function openEdit(shipment: Shipment) {
    setEditShipment(shipment)
    setEditForm({
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      origin: shipment.origin,
      destination: shipment.destination,
      mode: shipment.mode,
      estimatedDelivery: shipment.estimatedDelivery.slice(0, 10),
    })
    setTab('edit')
  }

  async function handleUpdateShipment(e: FormEvent) {
    e.preventDefault()
    if (!editShipment) return
    try {
      await updateShipment(editShipment.id, editForm)
      setSuccess('Shipment updated successfully!')
      setEditShipment(null)
      setTab('shipments')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setSuccess(`Error: ${err instanceof Error ? err.message : 'Failed to update shipment'}`)
    }
  }

  async function handleDeleteShipment(id: string) {
    if (!confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) return
    try {
      await deleteShipment(id)
      setSuccess('Shipment deleted successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setSuccess(`Error: ${err instanceof Error ? err.message : 'Failed to delete shipment'}`)
    }
  }

  function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let pwd = ''
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)]
    setNewCustomer(p => ({ ...p, password: pwd }))
  }

  async function handleCreateCustomer(e: FormEvent) {
    e.preventDefault()
    try {
      const data = await createCustomerUser(newCustomer)
      setCreatedCustomer({
        email: data.credentials.email,
        password: data.credentials.password,
        name: data.user.name,
      })
      setSuccess(`Customer account created for ${data.user.name}`)
      setNewCustomer({ name: '', email: '', password: '' })
      setTimeout(() => setSuccess(''), 8000)
    } catch (err) {
      setSuccess(`Error: ${err instanceof Error ? err.message : 'Failed to create customer'}`)
      setCreatedCustomer(null)
    }
  }

  const tabs = [
    { id: 'shipments' as const, label: '📦 All Shipments', short: '📦 All' },
    { id: 'create' as const, label: '➕ New Shipment', short: '➕ New' },
    { id: 'event' as const, label: '📍 Add Event', short: '📍 Event' },
    { id: 'customer' as const, label: '👤 New Customer', short: '👤 User' },
    { id: 'edit' as const, label: '✏️ Edit Shipment', short: '✏️ Edit' },
  ]

  return (
    <div className="min-h-screen bg-slate">
      {/* Admin header */}
      <div className="bg-navy-dark border-b border-navy-mid">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400 text-sm mt-0.5">Porthaven Logistics — Operations Dashboard</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Total Shipments</div>
              <div className="font-display text-3xl font-bold text-sky">{shipments.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Success/Error message */}
        {success && (
          <div className={`rounded-xl px-4 py-3 mb-5 text-sm font-medium flex items-center gap-2 ${success.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            <span>{success.startsWith('Error') ? '❌' : '✅'}</span>
            <span>{success.replace('Error: ', '')}</span>
            {createdShipment && (
              <a href={`/track/${createdShipment.trackingNumber}`} className="ml-auto text-green-700 underline font-semibold">View →</a>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCreatedShipment(null); if (t.id !== 'customer') setCreatedCustomer(null) }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === t.id ? 'bg-navy text-white shadow-sm' : 'text-slate-500 hover:text-navy'}`}>
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          ))}
        </div>

        {/* All Shipments */}
        {tab === 'shipments' && (
          <div>
            <div className="relative mb-4">
              <svg className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, tracking #, or location..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Total', count: shipments.length },
                { label: 'Active', count: shipments.filter(s => !['DELIVERED', 'EXCEPTION'].includes(s.status)).length },
                { label: 'Delivered', count: shipments.filter(s => s.status === 'DELIVERED').length },
                { label: 'Exceptions', count: shipments.filter(s => s.status === 'EXCEPTION').length },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 text-center">
                  <div className="font-display text-2xl font-bold text-navy">{s.count}</div>
                  <div className="text-[10px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center text-slate-400 py-16">
                <div className="animate-spin w-8 h-8 border-2 border-sky border-t-transparent rounded-full mx-auto mb-3" />
                Loading shipments...
              </div>
            )}

            {!loading && (
              <div className="space-y-3">
                {filtered.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-navy text-sm">{s.trackingNumber}</span>
                        <ModeIcon mode={s.mode} />
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                      <div><span className="text-slate-400">Sender:</span> <span className="font-medium text-slate-700">{s.senderName}</span></div>
                      <div><span className="text-slate-400">Receiver:</span> <span className="font-medium text-slate-700">{s.receiverName}</span></div>
                      <div><span className="text-slate-400">From:</span> <span className="font-medium text-slate-700">{s.origin}</span></div>
                      <div><span className="text-slate-400">To:</span> <span className="font-medium text-slate-700">{s.destination}</span></div>
                      <div><span className="text-slate-400">Created:</span> <span className="font-medium text-slate-700">{formatDate(s.createdAt)}</span></div>
                      <div><span className="text-slate-400">Est. Delivery:</span> <span className="font-medium text-slate-700">{formatDate(s.estimatedDelivery)}</span></div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <a href={`/track/${s.trackingNumber}`} className="inline-flex items-center gap-1 text-sky hover:text-navy text-xs font-semibold transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        View Tracking
                      </a>
                      <button onClick={() => { setNewEvent(prev => ({ ...prev, shipmentId: s.id })); setTab('event') }}
                        className="inline-flex items-center gap-1 text-ember hover:text-orange-600 text-xs font-semibold transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Event
                      </button>
                      <button onClick={() => openEdit(s)}
                        className="inline-flex items-center gap-1 text-navy hover:text-sky text-xs font-semibold transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteShipment(s.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-semibold transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Shipment */}
        {tab === 'create' && (
          <form onSubmit={handleCreateShipment} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <h2 className="font-display text-2xl font-bold text-navy">Create New Shipment</h2>
            <p className="text-slate-500 text-sm -mt-3">A tracking number will be auto-generated.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sender Name *</label>
                <input type="text" required value={newShipment.senderName}
                  onChange={e => setNewShipment(p => ({ ...p, senderName: e.target.value }))}
                  placeholder="e.g. Guangzhou Electronics Ltd"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Receiver Name *</label>
                <input type="text" required value={newShipment.receiverName}
                  onChange={e => setNewShipment(p => ({ ...p, receiverName: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Origin (City, Country) *</label>
                <input type="text" required value={newShipment.origin}
                  onChange={e => setNewShipment(p => ({ ...p, origin: e.target.value }))}
                  placeholder="e.g. Shenzhen, China"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Destination (City, Country) *</label>
                <input type="text" required value={newShipment.destination}
                  onChange={e => setNewShipment(p => ({ ...p, destination: e.target.value }))}
                  placeholder="e.g. New York, USA"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Freight Mode *</label>
                <select value={newShipment.mode} onChange={e => setNewShipment(p => ({ ...p, mode: e.target.value as 'AIR' | 'SEA' }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky">
                  <option value="AIR">✈️ Air Freight</option>
                  <option value="SEA">🚢 Sea Freight</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estimated Delivery *</label>
                <input type="date" required value={newShipment.estimatedDelivery.slice(0, 10)}
                  onChange={e => setNewShipment(p => ({ ...p, estimatedDelivery: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>

            <button type="submit" className="w-full bg-ember hover:bg-orange-400 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm">
              Create Shipment & Generate Tracking #
            </button>
          </form>
        )}

        {/* Add Tracking Event */}
        {tab === 'event' && (
          <form onSubmit={handleAddEvent} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <h2 className="font-display text-2xl font-bold text-navy">Add Tracking Event</h2>
            <p className="text-slate-500 text-sm -mt-3">Updates shipment status and adds a timeline entry.</p>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Shipment *</label>
              <select required value={newEvent.shipmentId} onChange={e => setNewEvent(p => ({ ...p, shipmentId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky">
                <option value="">— Choose a shipment —</option>
                {shipments.map(s => (
                  <option key={s.id} value={s.id}>{s.trackingNumber} — {s.receiverName} ({s.destination}) [{STATUS_DISPLAY[s.status]}]</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Status *</label>
              <select required value={newEvent.status} onChange={e => setNewEvent(p => ({ ...p, status: e.target.value as ShipmentStatus }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky">
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_META[s].icon} {STATUS_DISPLAY[s]}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location *</label>
              <input type="text" required autoComplete="off" value={newEvent.location}
                onChange={e => { setNewEvent(p => ({ ...p, location: e.target.value })); setShowLocationSuggest(true) }}
                onFocus={() => setShowLocationSuggest(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggest(false), 150)}
                placeholder="Type a city, e.g. London"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              {showLocationSuggest && locationSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                  {locationSuggestions.map(loc => (
                    <li key={loc.id}>
                      <button type="button"
                        onMouseDown={() => { setNewEvent(p => ({ ...p, location: `${loc.city}, ${loc.country}` })); setShowLocationSuggest(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-sky-light transition-colors">
                        <span className="font-medium text-navy">{loc.city}</span>
                        <span className="text-slate-400">, {loc.country}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes / Description</label>
              <textarea value={newEvent.note} onChange={e => setNewEvent(p => ({ ...p, note: e.target.value }))}
                placeholder="Optional: Describe the event (e.g. Package cleared customs inspection)"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Timestamp *</label>
              <input type="datetime-local" required value={newEvent.timestamp} onChange={e => setNewEvent(p => ({ ...p, timestamp: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>

            <button type="submit" className="w-full bg-navy hover:bg-navy-mid text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm">
              Add Tracking Event
            </button>
          </form>
        )}

        {/* Create Customer */}
        {tab === 'customer' && (
          <div className="space-y-5">
            {createdCustomer && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-display text-lg font-bold text-amber-900 mb-2">Customer credentials — copy now</h3>
                <p className="text-amber-800 text-sm mb-4">Share these login details with the customer. The password is shown only once.</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-semibold text-amber-900 w-24">Name</dt>
                    <dd className="font-medium text-amber-950">{createdCustomer.name}</dd>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-semibold text-amber-900 w-24">Email</dt>
                    <dd className="font-mono text-amber-950">{createdCustomer.email}</dd>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <dt className="font-semibold text-amber-900 w-24">Password</dt>
                    <dd className="font-mono text-amber-950 break-all">{createdCustomer.password}</dd>
                  </div>
                </dl>
                <button type="button" onClick={() => setCreatedCustomer(null)}
                  className="mt-4 text-sm font-semibold text-amber-800 hover:text-amber-950 underline">
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
              <h2 className="font-display text-2xl font-bold text-navy">Create Customer Account</h2>
              <p className="text-slate-500 text-sm -mt-3">Creates a CUSTOMER login. No public signup — share credentials manually.</p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                <input type="text" required value={newCustomer.name}
                  onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                <input type="email" required value={newCustomer.email}
                  onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Temporary Password *</label>
                  <button type="button" onClick={generateTempPassword}
                    className="text-xs font-semibold text-sky hover:text-navy transition-colors">
                    Generate random
                  </button>
                </div>
                <input type="text" required minLength={8} value={newCustomer.password}
                  onChange={e => setNewCustomer(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base font-mono focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>

              <button type="submit" className="w-full bg-navy hover:bg-navy-mid text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm">
                Create Customer Account
              </button>
            </form>
          </div>
        )}

        {/* Edit Shipment */}
        {tab === 'edit' && editShipment && (
          <form onSubmit={handleUpdateShipment} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Edit Shipment</h2>
                <p className="text-slate-500 text-sm -mt-1">Tracking: {editShipment.trackingNumber}</p>
              </div>
              <button type="button" onClick={() => { setEditShipment(null); setTab('shipments') }}
                className="text-slate-400 hover:text-navy text-sm font-semibold">Cancel</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sender Name</label>
                <input type="text" value={editForm.senderName}
                  onChange={e => setEditForm(p => ({ ...p, senderName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Receiver Name</label>
                <input type="text" value={editForm.receiverName}
                  onChange={e => setEditForm(p => ({ ...p, receiverName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Origin (City, Country)</label>
                <input type="text" value={editForm.origin}
                  onChange={e => setEditForm(p => ({ ...p, origin: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Destination (City, Country)</label>
                <input type="text" value={editForm.destination}
                  onChange={e => setEditForm(p => ({ ...p, destination: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Freight Mode</label>
                <select value={editForm.mode} onChange={e => setEditForm(p => ({ ...p, mode: e.target.value as 'AIR' | 'SEA' }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky">
                  <option value="AIR">✈️ Air Freight</option>
                  <option value="SEA">🚢 Sea Freight</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estimated Delivery</label>
                <input type="date" value={editForm.estimatedDelivery}
                  onChange={e => setEditForm(p => ({ ...p, estimatedDelivery: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base bg-white focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>

            <button type="submit" className="w-full bg-navy hover:bg-navy-mid text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm">
              Update Shipment
            </button>
          </form>
        )}
      </div>
    </div>
  )
}