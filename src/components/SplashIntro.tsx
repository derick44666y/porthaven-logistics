import { useEffect, useState } from 'react'

const SESSION_KEY = 'ph_splash_seen'

/**
 * Branded intro splash shown once per browser session on first homepage load.
 * Pure CSS animation (glowing logo pulse) — no video/GIF, keeps load fast.
 */
export default function SplashIntro() {
  const [visible, setVisible] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(true)

    // Total lifetime: ~1.3s pulse + ~0.5s fade-out ≈ < 2s
    const fadeTimer = setTimeout(() => setVisible(false), 1300)
    const removeTimer = setTimeout(() => setHidden(true), 1900)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      <div className="splash-logo-wrap">
        <div className="splash-logo">
          <span className="splash-mark">PH</span>
          <div className="splash-word">
            <span className="text-white">PORT</span>
            <span className="text-sky">HAVEN</span>
          </div>
          <div className="splash-sub">LOGISTICS</div>
        </div>
      </div>
    </div>
  )
}