import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, type User } from '@/api'

export default function Navbar({ user, onAuthChange }: { user: User | null; onAuthChange: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    onAuthChange()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="bg-navy sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-sky to-navy-light rounded flex items-center justify-center text-white font-display font-bold text-lg">
              PH
            </div>
            <div className="leading-none">
              <span className="font-display text-xl font-bold text-white tracking-wide">PORT</span>
              <span className="font-display text-xl font-bold text-sky tracking-wide">HAVEN</span>
              <div className="text-[9px] text-sky-muted tracking-widest uppercase font-medium -mt-0.5">Delivering Trust. Delivering More.</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-navy-mid transition-colors">Home</Link>
            {user && user.role === 'CUSTOMER' && (
              <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-navy-mid transition-colors">My Shipments</Link>
            )}
            {user && user.role === 'ADMIN' && (
              <Link to="/admin" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-navy-mid transition-colors">Admin Panel</Link>
            )}
            <Link to="/contact" className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-navy-mid transition-colors">Contact</Link>
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-slate-300 text-sm">Hi, <span className="text-white font-semibold">{user.name.split(' ')[0]}</span></span>
                <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">Sign Out</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-1.5 text-sm font-medium rounded transition-colors">Sign In</Link>
                <Link to="/signup" className="bg-ember hover:bg-orange-400 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors shadow-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2 rounded-md hover:bg-navy-mid transition-colors">
            {menuOpen
              ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-navy-mid bg-navy-dark">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white px-3 py-2.5 text-base font-medium rounded-md hover:bg-navy-mid">Home</Link>
            {user?.role === 'CUSTOMER' && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white px-3 py-2.5 text-base font-medium rounded-md hover:bg-navy-mid">My Shipments</Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white px-3 py-2.5 text-base font-medium rounded-md hover:bg-navy-mid">Admin Panel</Link>
            )}
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block text-slate-300 hover:text-white px-3 py-2.5 text-base font-medium rounded-md hover:bg-navy-mid">Contact</Link>
            {user ? (
              <>
                <div className="text-slate-400 text-sm px-3 py-1">{user.name} — {user.role === 'ADMIN' ? 'Admin' : 'Customer'}</div>
                <button onClick={handleLogout} className="w-full text-left bg-slate-700 hover:bg-slate-600 text-white px-3 py-2.5 rounded-md text-base font-medium">Sign Out</button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-center text-white border border-slate-600 px-4 py-2.5 rounded-md text-base font-medium hover:bg-navy-mid">Sign In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="block text-center bg-ember hover:bg-orange-400 text-white px-4 py-2.5 rounded-md text-base font-semibold">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}