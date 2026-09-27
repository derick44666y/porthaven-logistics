import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SplashIntro from '../components/SplashIntro'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.1 })
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
    const observer = new IntersectionObserver(([entry]) => {
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
    }, { threshold: 0.3 })
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

const HERO_IMG = 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=900&q=70'
const SHIP_IMG = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=900&q=70'
const PLANE_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=70'
const TRUCK_IMG = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=70'

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState('')
  const navigate = useNavigate()
  useScrollReveal()

  // Hard SEO: keep document title & description locked for homepage
  useEffect(() => {
    document.title = 'Best Shipping Company in Syria | PortHaven Logistics — Air & Sea Freight, Customs Clearance Latakia Tartous'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'PortHaven Logistics is the best shipping site in Syria for international air freight, sea freight, and customs clearance. Reliable shipping to Syria via Latakia & Tartous ports. Track shipments in real-time.'
      )
    }
  }, [])

  function handleTrack(e: FormEvent) {
    e.preventDefault()
    const tn = trackingInput.trim()
    if (!tn) return
    navigate(`/track/${encodeURIComponent(tn)}`)
  }

  const features = [
    {
      icon: '✈️',
      title: 'Air Freight to Syria',
      desc: 'Priority air cargo to Damascus, Aleppo & all Syria. Door-to-door in days with live tracking.',
    },
    {
      icon: '🚢',
      title: 'Sea Freight Latakia & Tartous',
      desc: 'FCL & LCL ocean shipping to Port of Latakia and Tartous — the best rates for cargo to Syria.',
    },
    {
      icon: '📍',
      title: 'Live Tracking',
      desc: 'Track every checkpoint from origin to final delivery across Syria.',
    },
    {
      icon: '🛃',
      title: 'Customs Clearance Syria',
      desc: 'Expert customs clearance at Syrian ports and borders — fast, compliant, stress-free.',
    },
    {
      icon: '🔒',
      title: 'Secure Handling',
      desc: 'Fully insured cargo handled by certified pros for shipping to Syria.',
    },
    {
      icon: '📱',
      title: 'WhatsApp Updates',
      desc: 'Instant updates & chat with our Syria shipping team on WhatsApp.',
    },
  ]

  return (
    <div>
      <SplashIntro />

      {/* HERO — primary keyword target */}
      <section className="relative min-h-[88vh] md:min-h-[680px] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMG})`, backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 via-navy/55 to-navy-mid/85" />
        <div className="relative z-10 w-full px-5 py-16 md:py-28">
          <div className="max-w-3xl mx-auto text-center md:text-left">
            <div
              className="inline-flex items-center gap-2 bg-ember/20 border border-ember/30 rounded-full px-4 py-1.5 text-xs md:text-sm font-medium mb-5 md:mb-6"
              style={{ color: '#f97316' }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Best Shipping Site in Syria · Air & Sea Freight
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white mb-3 drop-shadow-lg">
              Best Shipping Company in <span className="text-ember">Syria.</span>
            </h1>
            <p className="text-slate-100 text-base md:text-xl mb-4 md:mb-6 max-w-xl mx-auto md:mx-0 leading-relaxed drop-shadow">
              PortHaven Logistics — reliable international air freight, sea freight to Latakia & Tartous, customs clearance, and door-to-door delivery across Damascus, Aleppo, Homs & all of Syria. Track every shipment in real time.
            </p>
            <p className="text-slate-300 text-sm md:text-base mb-6 md:mb-8 max-w-xl mx-auto md:mx-0">
              Freight forwarding Syria · Container shipping · LCL & FCL · شحن بحري وجوي إلى سوريا
            </p>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto md:mx-0">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Tracking number"
                style={{ fontSize: '16px' }}
                className="flex-1 px-4 py-3.5 md:px-5 md:py-4 rounded-xl text-navy-dark bg-white/95 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ember shadow-lg"
              />
              <button
                type="submit"
                className="bg-ember hover:bg-orange-400 text-white px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg transition-colors whitespace-nowrap"
              >
                Track Shipment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust counters */}
      <section className="bg-navy-dark border-y border-navy-mid">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2 py-4 md:py-6">
          <Counter value={1200} label="Shipments to Syria" />
          <Counter value={45} label="Countries Served" />
          <Counter value={98} label="On-Time Delivery %" suffix="%" />
          <Counter value={24} label="Support Hours" suffix="/7" />
        </div>
      </section>

      {/* Services — keyword-rich */}
      <section className="py-14 md:py-20 bg-slate">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center scroll-animate mb-10">
            <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-xs md:text-sm font-medium text-ember mb-3">
              Our Services
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy mb-2">
              Shipping & Logistics Solutions for Syria
            </h2>
            <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto">
              From the best sea freight rates into Latakia and Tartous to express air cargo and full customs clearance — PortHaven is the shipping partner Syria businesses trust.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="scroll-animate bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-navy text-base md:text-lg mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why PortHaven + Syria ports SEO block */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="scroll-animate">
              <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-xs md:text-sm font-medium text-ember mb-3">
                Why Choose PortHaven
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-4">
                The Best Shipping Site in Syria for International Cargo
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                Whether you need <strong>sea freight to Syria</strong> through the Port of Latakia or Port of Tartous, <strong>air freight</strong> into Damascus or Aleppo, or full <strong>customs clearance Syria</strong>, PortHaven Logistics handles end-to-end freight forwarding with complete transparency.
              </p>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
                We specialize in container shipping (FCL & LCL), project cargo, door-to-door delivery across Syria, and real-time tracking so you always know where your goods are. Importers and exporters choose us as the most reliable shipping company in Syria for competitive rates and professional service.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span className="text-ember font-bold">✓</span> Sea freight Latakia & Tartous — FCL / LCL</li>
                <li className="flex gap-2"><span className="text-ember font-bold">✓</span> Air freight Damascus, Aleppo & regional airports</li>
                <li className="flex gap-2"><span className="text-ember font-bold">✓</span> Customs clearance at Syrian ports & borders</li>
                <li className="flex gap-2"><span className="text-ember font-bold">✓</span> Inland trucking to all Syrian cities</li>
                <li className="flex gap-2"><span className="text-ember font-bold">✓</span> Live online tracking + WhatsApp support</li>
              </ul>
            </div>
            <div className="scroll-animate grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl bg-cover bg-center h-40 md:h-52 col-span-2"
                style={{ backgroundImage: `url(${SHIP_IMG})` }}
              />
              <div
                className="rounded-2xl bg-cover bg-center h-32 md:h-40"
                style={{ backgroundImage: `url(${PLANE_IMG})` }}
              />
              <div
                className="rounded-2xl bg-cover bg-center h-32 md:h-40"
                style={{ backgroundImage: `url(${TRUCK_IMG})` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Destinations / cities SEO */}
      <section className="py-12 md:py-16 bg-slate">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-navy mb-3 scroll-animate">
            Shipping Coverage Across Syria
          </h2>
          <p className="text-slate-500 text-sm md:text-base mb-8 max-w-2xl mx-auto scroll-animate">
            Door-to-door freight forwarding and delivery to major Syrian cities and ports. Best rates for shipping to Syria from China, Europe, UAE, Turkey and worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 scroll-animate">
            {[
              'Latakia Port',
              'Tartous Port',
              'Damascus',
              'Aleppo',
              'Homs',
              'Hama',
              'Idlib',
              'Lattakia City',
              'Customs Clearance Syria',
              'Sea Freight Syria',
              'Air Freight Syria',
              'Container Shipping Syria',
            ].map((city) => (
              <span
                key={city}
                className="bg-white border border-slate-200 text-navy text-xs md:text-sm font-medium px-3 py-1.5 rounded-full shadow-sm"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center scroll-animate mb-10">
            <div className="inline-flex items-center gap-2 bg-ember/10 border border-ember/20 rounded-full px-4 py-1 text-xs md:text-sm font-medium text-ember mb-3">
              How It Works
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-navy mb-2">
              Simple, Transparent Shipping to Syria
            </h2>
            <p className="text-slate-500 text-sm md:text-lg">
              From origin to Latakia, Tartous or any Syrian city — we handle everything.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                n: '01',
                title: 'Book Your Shipment',
                desc: 'Contact us for a quote. We generate a unique tracking number for your cargo to Syria instantly.',
              },
              {
                n: '02',
                title: 'We Handle Logistics',
                desc: 'Pickup, ocean or air freight, customs clearance at Latakia / Tartous, and inland delivery.',
              },
              {
                n: '03',
                title: 'Track & Receive',
                desc: 'Follow every update online. Your package arrives safely anywhere in Syria.',
              },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center scroll-animate">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-navy text-white font-display text-2xl md:text-3xl font-bold flex items-center justify-center shadow-md mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-navy text-base md:text-lg mb-1.5">{s.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ block — mirrors schema for on-page SEO */}
      <section className="py-12 md:py-16 bg-slate">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-navy mb-6 text-center scroll-animate">
            Frequently Asked Questions — Shipping to Syria
          </h2>
          <div className="space-y-4">
            <details className="scroll-animate bg-white rounded-xl border border-slate-100 p-4 md:p-5 group">
              <summary className="font-semibold text-navy cursor-pointer list-none flex justify-between items-center">
                What is the best shipping company in Syria?
                <span className="text-ember group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                PortHaven Logistics is a leading shipping site in Syria for international air and sea freight, customs clearance at Latakia and Tartous ports, and door-to-door delivery across Damascus, Aleppo, and all Syrian cities. Real-time tracking and competitive rates make us the preferred freight forwarder for importers and exporters.
              </p>
            </details>
            <details className="scroll-animate bg-white rounded-xl border border-slate-100 p-4 md:p-5 group">
              <summary className="font-semibold text-navy cursor-pointer list-none flex justify-between items-center">
                How do I ship cargo to Syria?
                <span className="text-ember group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Contact PortHaven via WhatsApp or the contact form. We arrange sea freight (FCL/LCL) to Latakia and Tartous, air freight, full customs clearance Syria, and inland transport with online tracking from pickup to final delivery.
              </p>
            </details>
            <details className="scroll-animate bg-white rounded-xl border border-slate-100 p-4 md:p-5 group">
              <summary className="font-semibold text-navy cursor-pointer list-none flex justify-between items-center">
                Which ports are used for sea freight to Syria?
                <span className="text-ember group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We primarily use the Port of Latakia and the Port of Tartous for container and general cargo into Syria, then coordinate customs clearance and trucking to Aleppo, Damascus, Homs, Hama and other destinations.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="flex flex-col md:flex-row">
          <div
            className="w-full md:w-1/2 h-56 md:min-h-[350px] bg-cover bg-center"
            style={{ backgroundImage: `url(${TRUCK_IMG})` }}
          />
          <div
            className="w-full md:w-1/2 py-12 md:py-20 px-6 md:px-12 text-center md:text-left"
            style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #152641 40%, #1e3a5f 100%)' }}
          >
            <div className="max-w-lg mx-auto md:mx-0">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-3">
                Ready to Ship to Syria?
              </h2>
              <p className="text-slate-300 text-sm md:text-lg mb-6">
                Get a quote for the best shipping rates to Syria — air freight, sea freight Latakia & Tartous, customs clearance included.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/contact"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3.5 rounded-xl text-sm md:text-base font-medium transition-colors justify-center backdrop-blur-sm"
                >
                  Contact / Get a Quote
                </Link>
                <a
                  href="https://wa.me/19162455173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-600 hover:bg-green-500 text-white px-5 py-3.5 rounded-xl text-sm md:text-base font-semibold transition-colors justify-center shadow-lg"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
