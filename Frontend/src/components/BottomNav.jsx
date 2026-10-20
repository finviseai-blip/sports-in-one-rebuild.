import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

const tabs = [
  { label: 'Home', icon: '🏠', path: '/student/home' },
  { label: 'Performance', icon: '📊', path: '/student/performance' },
  { label: 'AI', icon: '🤖', path: '/student/ai' },
  { label: 'Events', icon: '📅', path: '/student/events' },
  { label: 'Booking', icon: '📖', path: '/student/booking' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <button
          key={t.path}
          className={`bnav-tab ${pathname === t.path ? 'active' : ''}`}
          onClick={() => navigate(t.path)}
        >
          <span className="bnav-icon">{t.icon}</span>
          <span className="bnav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}