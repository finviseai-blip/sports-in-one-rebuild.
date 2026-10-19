import { useNavigate, useLocation } from 'react-router-dom'
import './AdminBottomNav.css'

export default function AdminBottomNav() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const is = (path) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="adm-nav">

      {/* Home */}
      <button className={`adm-nav-item ${is('/admin/home') ? 'active' : ''}`} onClick={() => navigate('/admin/home')}>
        <span className="adm-nav-emoji">🏠</span>
        <span>Home</span>
      </button>

      {/* Students */}
      <button className={`adm-nav-item ${is('/admin/students') ? 'active' : ''}`} onClick={() => navigate('/admin/students')}>
        <span className="adm-nav-emoji">👥</span>
        <span>Students</span>
      </button>

      {/* Centre AI button */}
      <div className="adm-nav-center-wrap">
        <button
          className={`adm-nav-center ${is('/admin/ai') ? 'adm-nav-center--active' : ''}`}
          onClick={() => navigate('/admin/ai')}
        >
          <span style={{ fontSize: 26 }}>🤖</span>
        </button>
      </div>

      {/* Events */}
      <button className={`adm-nav-item ${is('/admin/events') ? 'active' : ''}`} onClick={() => navigate('/admin/events')}>
        <span className="adm-nav-emoji">📅</span>
        <span>Events</span>
      </button>

      {/* Booking */}
      <button className={`adm-nav-item ${is('/admin/booking') ? 'active' : ''}`} onClick={() => navigate('/admin/booking')}>
        <span className="adm-nav-emoji">📖</span>
        <span>Booking</span>
      </button>

    </nav>
  )
}
