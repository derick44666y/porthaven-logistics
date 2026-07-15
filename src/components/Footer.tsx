import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-dark text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-sky to-navy-light rounded flex items-center justify-center text-white font-display font-bold text-lg">
                PH
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white">PORT</span>
                <span className="font-display text-xl font-bold text-sky">HAVEN</span>
                <div className="text-[9px] text-slate-400 tracking-widest uppercase">Delivering Trust. Delivering More.</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              International air and sea freight specialists. Connecting businesses and families across continents with reliable, trackable logistics.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Track a Shipment</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Air Freight</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Sea Freight</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:info@porthavendelivery.com" className="flex items-start gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4 mt-0.5 text-sky flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  info@porthavendelivery.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/19515896129" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 hover:text-white transition-colors group">
                  <svg className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span>
                    <span className="text-green-400 font-medium group-hover:text-green-300">Chat with us on WhatsApp</span>
                    <br /><span className="text-xs text-slate-500">+1 (951) 589-6129</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Porthaven Delivery. All rights reserved.</span>
          <span>Air & Sea Freight Specialists</span>
        </div>
      </div>
    </footer>
  )
}