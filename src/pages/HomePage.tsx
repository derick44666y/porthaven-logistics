import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import SplashIntro from '../components/SplashIntro'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    const elements = document.querySelectorAll('.scroll-animate')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function Counter({ value, label, suffix = '+' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const end = value
          const duration = 2000
          const startTime = performance.now()
          function tick(now: number) {
            const progress = Math.min((now - startTime) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center py-3 px-2">
      <div className="font-display text-2xl md:text-3xl font-bold text-ember">{count}{suffix}</div>
      <div className="text-slate-400 text-[10px] md:text-xs mt-0.5">{label}</div>
    </div>
  )
}

// Verified-working Unsplash IDs (all returned HTTP 200)
const HERO_IMG = 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=900&q=70'
const SHIP_IMG = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=70'
const PLANE_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=70'
const TRUCK_IMG = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=70'

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState('')
  const navigate = useNavigate()

  useScrollReveal()

  function handleTrack(e: FormEvent) {
    e.preventDefault()
    const tn = trackingInput.trim()
    if (!tn) return
    navigate(`/track/${encodeURIComponent(tn)}`)
  }

  const features = [
    { icon: '✈️', title: 'Air Freight', desc: 'Priority air cargo with real-time tracking. Door-to-door in days.' },
    { icon: '🚢', title: 'Sea Freight', desc: 'Cost-effective ocean shipping. Full container & LCL options.' },
    { icon: '📍', title: 'Live Tracking', desc: 'Track at every checkpoint — from pickup to delivery.' },
    { icon: '🛃', title: 'Customs Support', desc: 'Expert clearance for smooth international borders.' },
    { icon: '🔒', title: 'Secure Handling', desc: 'Fully insured cargo handled by certified pros.' },
    { icon: '📱', title: 'WhatsApp Updates', desc: 'Instant updates & chat with our team on WhatsApp.' },
  ]

  return (
    <div>
      {/* Branded intro splash — plays once per session on first homepage load */}
      <SplashIntro />

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] md:min-h-[680px] flex items-center overflow-hidden">
        {/* Background image — verified working, always visible */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: `url(${HERO_IMG})`,
          backgroundPosition: 'center',
        }} />
        {/* Lighter overlay so the image clearly shows */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 via-navy/55 to-navy-mid/85" />

        <div className="relative z-10 w-full px-5 py-16 md:py-28">
          <div className="max-w-3xl mx-auto text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-ember/20 border border-ember/30 rounded-full px-4 py-1.5 text-xs md:text-sm font-medium mb-5 md:mb-6" style={{ color: '#f97316' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              International Air & Sea Freight
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-3 drop-shadow-lg">
              Logistics <span className="text-ember">made easy.</span>
            </h1>

            <p className="text-slate-100 text-base md:text-xl mb-6 md:mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed drop-shadow">
              Track your shipment in real-time from anywhere in the world.
            </p>

            {/* Search — text-base (16px) prevents iOS zoom on focus */}
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto md:mx-0">
              <input
                type="text"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Tracking number"
                style={{ fontSize: '16px' }}
                className="flex-1 px-4 py-3.5 md:px-5 md:py-4 rounded-xl text-navy-dark bg-white/95 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ember shadow-lg"
              />
              <button type="submit" className="bg-ember hover:bg-orange-400 text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl text-sm md:text-base font-bold shadow-lg transition-colors animate-pulse-glow">
                Track Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────── */}
      <section className="bg-navy-dark divide-y md:divide-y-0 md:divide-x md:divide-navy-mid">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <Counter value={80} label="Countries Served" />
          <Counter value={50000} label="Shipments Delivered" />
          <Counter value={98} label="On-time Rate" suffix="%" />
          <Counter value={24} label="Support Available" suffix="/7" />
        </div>
      </section>

      {/* ─── Features with images ─────────────────────────── */}
      <section className="relative py-14 md:py-20 px-5 md:px-6 max-w-7xl mx-auto">
        {/* Ghosted cargo image on the right, visible on all sizes */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2/3 md:w-1/3 h-full opacity-[0.06] pointer-events-none" style={{
          backgroundImage: `url(${SHIP_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />

        <div className="text-center mb-10 relative z-10 scroll-animate">
          <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-xs md:text-sm font-medium text-ember mb-3">Our Services</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-navy mb-2">Why Choose Porthaven?</h2>
          <p className="text-slate-500 text-sm md:text-lg max-w-xl mx-auto">Full-service international logistics with transparency at every step.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
          {features.map((f, i) => (
            <div key={f.title} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-md active:scale-[0.98] transition-all scroll-animate">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-ember-light flex items-center justify-center text-xl md:text-2xl mb-3 md:mb-4">{f.icon}</div>
              <h3 className="font-display text-lg md:text-xl font-bold text-navy mb-1.5 md:mb-2">{f.title}</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────── */}
      <section className="relative py-14 md:py-20 px-5 md:px-6 bg-gradient-to-b from-white to-sky-light overflow-hidden">
        {/* Ghosted plane image */}
        <div className="absolute left-0 bottom-0 w-3/4 md:w-1/2 h-3/4 opacity-[0.05] pointer-events-none" style={{
          backgroundImage: `url(${PLANE_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="scroll-animate mb-10">
            <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-xs md:text-sm font-medium text-ember mb-3">How It Works</div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy mb-2">Simple, Transparent Shipping</h2>
            <p className="text-slate-500 text-sm md:text-lg">From origin to destination, we handle everything.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { n: '01', title: 'Book Your Shipment', desc: 'Contact us. We generate a unique tracking number instantly.' },
              { n: '02', title: 'We Handle Logistics', desc: 'Our team picks up, clears customs, and ships via air or sea.' },
              { n: '03', title: 'Track & Receive', desc: 'Follow every update online. Your package arrives safely.' },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center scroll-animate">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-navy text-white font-display text-2xl md:text-3xl font-bold flex items-center justify-center shadow-md mb-4">{s.n}</div>
                <h3 className="font-semibold text-navy text-base md:text-lg mb-1.5">{s.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA (stacked on mobile, image visible) ─────────── */}
      <section className="relative">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 h-56 md:min-h-[350px] bg-cover bg-center" style={{ backgroundImage: `url(${TRUCK_IMG})` }} />
          <div className="w-full md:w-1/2 py-12 md:py-20 px-6 md:px-12 text-center md:text-left" style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #152641 40%, #1e3a5f 100%)' }}>
            <div className="max-w-lg mx-auto md:mx-0">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">Ready to Ship?</h2>
              <p className="text-slate-300 text-sm md:text-lg mb-6">Get in touch today and we'll handle the rest.</p>
              <div className="flex flex-col gap-3">
                <a href="mailto:info@porthavendelivery.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3.5 rounded-xl text-sm md:text-base font-medium transition-colors justify-center backdrop-blur-sm">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-ember shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email us
                </a>
                <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-5 py-3.5 rounded-xl text-sm md:text-base font-semibold transition-colors justify-center shadow-lg">
                  <svg className="w-4 h-4 md:w-5 md:h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}