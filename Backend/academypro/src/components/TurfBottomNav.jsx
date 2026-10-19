import { useNavigate, useLocation } from 'react-router-dom'
import './TurfNav.css'

const TABS = [
  { path: '/turf/home',     emoji: '🏠', label: 'Home' },
  { path: '/turf/bookings', emoji: '📋', label: 'Bookings' },
  { path: '/turf/slots',    emoji: '⏰', label: 'Slots', center: true },
  { path: '/turf/earnings', emoji: '💰', label: 'Earnings' },
  { path: '/turf/reports',  emoji: '📊', label: 'Reports' },
]

export default function TurfBottomNav() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const is = p => pathname === p || pathname.startsWith(p + '/')

  return (
    <nav className="tbn">
      {TABS.map(t => t.center ? (
        <div key={t.path} className="tbn-center">
          <button className={`tbn-center-btn ${is(t.path) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            <span>{t.emoji}</span>
          </button>
          <span className={`tbn-center-lbl ${is(t.path) ? 'active' : ''}`}>{t.label}</span>
        </div>
      ) : (
        <button key={t.path} className={`tbn-tab ${is(t.path) ? 'active' : ''}`} onClick={() => navigate(t.path)}>
          <span className="tbn-emoji">{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
