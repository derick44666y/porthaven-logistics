import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState('')
  const navigate = useNavigate()

  function handleTrack(e: FormEvent) {
    e.preventDefault()
    const tn = trackingInput.trim()
    if (!tn) return
    navigate(`/track/${encodeURIComponent(tn)}`)
  }

  const features = [
    { icon: '✈️', title: 'Air Freight', desc: 'Priority air cargo services with real-time flight tracking. Door-to-door in days, not weeks.' },
    { icon: '🚢', title: 'Sea Freight', desc: 'Cost-effective ocean shipping for large cargo. Full container and LCL options available.' },
    { icon: '📍', title: 'Live Tracking', desc: 'Track your shipment at every checkpoint — from pickup to delivery, every step visible.' },
    { icon: '🛃', title: 'Customs Support', desc: 'Expert customs clearance assistance for smooth international border crossings.' },
    { icon: '🔒', title: 'Secure Handling', desc: 'Your cargo is fully insured and handled with care by certified logistics professionals.' },
    { icon: '📱', title: 'WhatsApp Updates', desc: 'Get instant shipment updates and chat with our team directly on WhatsApp.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[600px] flex items-center justify-center text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #152641 40%, #1e3a5f 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(29,143,218,0.8) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute bottom-0 right-0 opacity-5 text-[320px] leading-none select-none pointer-events-none">🚢</div>

        <div className="relative z-10 text-center px-4 sm:px-6 py-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sky/20 border border-sky/30 rounded-full px-4 py-1.5 text-sm text-sky-muted font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            International Air & Sea Freight
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4">
            Track Your <span className="text-sky">Shipment</span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Enter your tracking number below to get real-time updates on your package, wherever it is in the world.
          </p>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              placeholder="Enter tracking number (e.g. TRKABC12345)"
              className="flex-1 px-5 py-4 rounded-xl text-navy-dark bg-white text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky shadow-lg"
            />
            <button type="submit" className="bg-ember hover:bg-orange-400 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-colors whitespace-nowrap">
              Track Now
            </button>
          </form>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy border-b border-navy-mid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-navy-mid">
            {[
              { label: 'Countries Served', value: '80+' },
              { label: 'Shipments Delivered', value: '50,000+' },
              { label: 'On-time Rate', value: '98.4%' },
              { label: 'Support Available', value: '24/7' },
            ].map(s => (
              <div key={s.label} className="text-center py-5 px-4">
                <div className="font-display text-2xl font-bold text-sky">{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-3">Why Choose Porthaven?</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Full-service international logistics with transparency at every step.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display text-xl font-bold text-navy mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-sky-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-3">How It Works</h2>
          <p className="text-slate-500 text-lg mb-12">Simple, transparent shipping from origin to destination.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Book Your Shipment', desc: 'Contact us with your shipping details. We generate a unique tracking number instantly.' },
              { n: '2', title: 'We Handle Logistics', desc: 'Our team picks up, clears customs, and ships your cargo via air or sea freight.' },
              { n: '3', title: 'Track & Receive', desc: 'Follow every update online. Your package arrives safely at its destination.' },
            ].map(s => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-navy text-white font-display text-2xl font-bold flex items-center justify-center mb-4 shadow-md">{s.n}</div>
                <h3 className="font-semibold text-navy text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Ready to Ship?</h2>
          <p className="text-slate-300 text-lg mb-8">Get in touch today and we'll handle the rest.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:info@porthavendelivery.com" className="flex items-center gap-3 bg-navy-mid hover:bg-navy-light border border-slate-700 text-white px-6 py-3.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center">
              <svg className="w-5 h-5 text-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              info@porthavendelivery.com
            </a>
            <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors w-full sm:w-auto justify-center shadow-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}