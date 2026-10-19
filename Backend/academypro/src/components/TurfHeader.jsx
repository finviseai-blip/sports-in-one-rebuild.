/* TurfHeader.jsx */
import { useNavigate } from 'react-router-dom'
import './TurfNav.css'

export function TurfHeader({ venue = 'Champions Sports Arena', name = 'Raj Patel', rating = 4.8, reviews = 124 }) {
  const navigate = useNavigate()
  return (
    <header className="tkh">
      <div className="tkh-left" onClick={() => navigate('/turf/profile')} style={{ cursor: 'pointer' }}>
        <div className="tkh-logo">🏟️</div>
        <div>
          <p className="tkh-venue">{venue}</p>
          <div className="tkh-meta">
            <span className="tkh-star">★ {rating}</span>
            <span className="tkh-dot">·</span>
            <span className="tkh-rev">{reviews} reviews</span>
          </div>
        </div>
      </div>
      <div className="tkh-right">
        <button className="tkh-icon" onClick={() => navigate('/turf/notifications')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="tkh-notif-badge" />
        </button>
      </div>
    </header>
  )
}
