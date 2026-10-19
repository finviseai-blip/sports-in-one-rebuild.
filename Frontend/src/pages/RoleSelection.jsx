import { useNavigate } from 'react-router-dom'
import './RoleSelection.css'

const roles = [
  {
    id: 'student',
    icon: '👤',
    title: 'Student',
    desc: 'Track performance, book turfs & manage your academy journey.',
    path: '/student/auth',
    color: '#f5a623',
  },
  {
    id: 'admin',
    icon: '🛡️',
    title: 'Admin / Coach',
    desc: 'Manage students, batches, sessions, events & academy revenue.',
    path: '/admin/auth',
    color: '#f5a623',
  },
  {
    id: 'turf',
    icon: '🏟️',
    title: 'Turf Owner',
    desc: 'List your venue on AcademyPro marketplace. Manage slots, bookings & UPI payouts.',
    path: '/turf/auth',
    color: '#4caf50',
    badge: 'KheloMore-style',
  },
]

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div className="role-page">
      <div className="role-header">
        <div className="role-logo-icon">⚽</div>
        <h1>Academy<span>Pro</span></h1>
        <p>Elite Sports Academy Management Platform</p>
      </div>
      <div className="role-cards">
        {roles.map(r => (
          <div key={r.id} className="role-card" onClick={() => navigate(r.path)}
            style={r.id === 'turf' ? { borderColor: 'rgba(76,175,80,.3)', background: 'rgba(76,175,80,.03)' } : {}}>
            <div className="role-card-icon" style={r.id === 'turf' ? { background: 'rgba(76,175,80,.12)', border: '1px solid rgba(76,175,80,.25)' } : {}}>{r.icon}</div>
            <div className="role-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3>{r.title}</h3>
                {r.badge && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(76,175,80,.15)', color: '#4caf50', padding: '2px 8px', borderRadius: 6, letterSpacing: .3 }}>MARKETPLACE</span>}
              </div>
              <p>{r.desc}</p>
              <button className="role-enter-btn" style={r.id === 'turf' ? { background: '#4caf50', color: '#000' } : {}}>
                {r.id === 'turf' ? 'List Your Venue →' : 'Enter Portal →'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="role-footer">© 2026 AcademyPro · All rights reserved</p>
    </div>
  )
}
