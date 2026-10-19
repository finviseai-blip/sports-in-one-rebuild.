import { useNavigate } from 'react-router-dom'
import './AdminHeader.css'

export default function AdminHeader({ adminName = 'srushti' }) {
  const navigate = useNavigate()

  return (
    <div className="adm-hdr">
      {/* Left: football icon (opens profile) + welcome text */}
      <div className="adm-hdr-left" onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer' }}>
        <div className="adm-hdr-icon-wrap">
          <span className="adm-hdr-football">⚽</span>
          <div className="adm-hdr-divider" />
        </div>
        <div className="adm-hdr-info">
          <span className="adm-hdr-welcome">Welcome back</span>
          <span className="adm-hdr-name">{adminName}</span>
        </div>
      </div>

      {/* Right: chat + notification */}
      <div className="adm-hdr-actions">
        <button className="adm-hdr-icon-btn" onClick={() => navigate('/admin/chat')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button className="adm-hdr-icon-btn adm-hdr-notif" onClick={() => navigate('/admin/notifications')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="adm-notif-badge" />
        </button>
      </div>
    </div>
  )
}
