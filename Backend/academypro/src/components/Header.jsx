import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

export default function Header() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isProfile = location.pathname === '/student/profile'

  return (
    <header className="top-header">
      <div
        className="hdr-left"
        onClick={() => !isProfile && navigate('/student/profile')}
        style={{ cursor: isProfile ? 'default' : 'pointer' }}
      >
        <span className="hdr-logo">⚽</span>
        <div>
          <p className="hdr-welcome-text">Welcome back</p>
          <p className="hdr-username">{user?.name?.split(' ')[0] || 'Marcus'}</p>
        </div>
      </div>

      <div className="hdr-icons">
        <button onClick={() => navigate('/student/chat')}>
          💬
        </button>
        <button className="hdr-notif-wrap" onClick={() => navigate('/student/notifications')}>
          🔔<span className="hdr-ndot" />
        </button>
      </div>
    </header>
  )
}