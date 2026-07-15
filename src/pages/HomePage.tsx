import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    const elements = document.querySelectorAll('.scroll-animate')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useCountUp(end: number, duration = 2000) {
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
          const startTime = performance.now()
          function tick(now: number) {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return { count, ref }
}

function Counter({ value, label, suffix = '+' }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center py-5 px-4">
      <div className="font-display text-3xl font-bold text-ember">{count}{suffix}</div>
      <div className="text-slate-400 text-xs mt-0.5">{label}</div>
    </div>
  )
}

function HeroAnimationText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block animate-hero-char"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

const HERO_IMG = 'https://images.unsplash.com/photo-1494412574643-11ff0a5c1c3c?w=1920&q=80'
const SHIP_IMG = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80'
const PLANE_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80'
const TRUCK_IMG = 'https://images.unsplash.com/photo-1566576912321-b58ed6b7ae1c?w=800&q=80'

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
    { icon: '✈️', title: 'Air Freight', desc: 'Priority air cargo services with real-time flight tracking. Door-to-door in days, not weeks.' },
    { icon: '🚢', title: 'Sea Freight', desc: 'Cost-effective ocean shipping for large cargo. Full container and LCL options available.' },
    { icon: '📍', title: 'Live Tracking', desc: 'Track your shipment at every checkpoint — from pickup to delivery, every step visible.' },
    { icon: '🛃', title: 'Customs Support', desc: 'Expert customs clearance assistance for smooth international border crossings.' },
    { icon: '🔒', title: 'Secure Handling', desc: 'Your cargo is fully insured and handled with care by certified logistics professionals.' },
    { icon: '📱', title: 'WhatsApp Updates', desc: 'Get instant shipment updates and chat with our team directly on WhatsApp.' },
  ]

  return (
    <div>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[750px] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,26,46,0.92) 0%, rgba(21,38,65,0.85) 40%, rgba(30,58,95,0.75) 100%)' }} />

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 w-full px-4 sm:px-6 py-28">
          <div className="max-w-3xl mx-auto">
            <div className="animate-fade-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center gap-2 bg-ember/20 border border-ember/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6" style={{ color: '#f97316' }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                International Air & Sea Freight
              </div>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4 text-white">
              <HeroAnimationText text="Logistics" />
              <br />
              <span className="text-ember">
                <HeroAnimationText text="made easy." />
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed animate-fade-slide-up" style={{ animationDelay: '0.8s' }}>
              Enter your tracking number below to get real-time updates on your package, wherever it is in the world.
            </p>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl animate-fade-slide-up" style={{ animationDelay: '1s' }}>
              <input
                type="text"
                value={trackingInput}
                onChange={e => setTrackingInput(e.target.value)}
                placeholder="Enter tracking number (e.g. TRKABC12345)"
                className="flex-1 px-5 py-4 rounded-xl text-navy-dark bg-white/95 text-base font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ember shadow-xl backdrop-blur-sm"
              />
              <button type="submit" className="bg-ember hover:bg-orange-400 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg transition-colors whitespace-nowrap animate-pulse-glow">
                Track Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ──────────────────────────────────────── */}
      <section className="bg-navy-dark border-b border-navy-mid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-navy-mid">
            <Counter value={80} label="Countries Served" />
            <Counter value={50000} label="Shipments Delivered" />
            <Counter value={98} label="On-time Rate" suffix="%" />
            <Counter value={24} label="Support Available" suffix="/7" />
          </div>
        </div>
      </section>

      {/* ─── Features / Services ────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle background image on the right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-[0.04] pointer-events-none" style={{
          backgroundImage: `url(${SHIP_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-14 scroll-animate">
            <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-sm font-medium text-ember mb-4">Our Services</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-3">Why Choose Porthaven?</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Full-service international logistics with transparency at every step.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 scroll-animate group" style={{ animationDelay: `${i * 0.1}s`, transitionDelay: `${i * 0.05}s` }}>
                <div className="w-12 h-12 rounded-xl bg-ember-light flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="font-display text-xl font-bold text-navy mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white to-sky-light">
        {/* Background image */}
        <div className="absolute left-0 bottom-0 w-1/2 h-3/4 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url(${PLANE_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="scroll-animate">
            <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-sm font-medium text-ember mb-4">How It Works</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-3">Simple, Transparent Shipping</h2>
            <p className="text-slate-500 text-lg mb-12">From origin to destination, we handle everything.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Book Your Shipment', desc: 'Contact us with your shipping details. We generate a unique tracking number instantly.' },
              { n: '02', title: 'We Handle Logistics', desc: 'Our team picks up, clears customs, and ships your cargo via air or sea freight.' },
              { n: '03', title: 'Track & Receive', desc: 'Follow every update online. Your package arrives safely at its destination.' },
            ].map((s, i) => (
              <div key={s.n} className="flex flex-col items-center text-center scroll-animate" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-navy text-white font-display text-3xl font-bold flex items-center justify-center shadow-lg shadow-navy/20">{s.n}</div>
                  {i < 2 && <div className="hidden md:block absolute top-10 left-full w-[calc(100%-5rem)] h-0.5 bg-ember/20 -z-10" />}
                </div>
                <h3 className="font-semibold text-navy text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA with image split ────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image side */}
          <div className="md:w-1/2 min-h-[300px] bg-cover bg-center" style={{
            backgroundImage: `url(${TRUCK_IMG})`,
          }} />
          {/* Content side */}
          <div className="md:w-1/2 py-20 px-8 sm:px-12" style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #152641 40%, #1e3a5f 100%)' }}>
            <div className="max-w-lg scroll-animate">
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Ready to Ship?</h2>
              <p className="text-slate-300 text-lg mb-8">Get in touch today and we'll handle the rest.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:info@porthavendelivery.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-ember" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  info@porthavendelivery.com
                </a>
                <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-6 py-3.5 rounded-xl font-semibold transition-colors w-full sm:w-auto justify-center shadow-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}