import { useNavigate } from 'react-router-dom'
import './RoleSelection.css'

const roles = [
  {
    id: 'student',
    icon: '👤',
    title: 'Student',
    desc: 'Track performance, book turfs & manage your academy journey.',
    path: '/student/auth',
    color: 'var(--accent)',
  },
  {
    id: 'admin',
    icon: '⚔️',
    title: 'Coach / Admin',
    desc: 'Manage students, batches, sessions & academy performance.',
    path: '/admin/auth',
    color: 'var(--accent)',
  },
  {
    id: 'turf',
    icon: '🏟️',
    title: 'Turf Owner',
    desc: 'List your venue, manage hourly slots & automated bookings.',
    path: '/turf/auth',
    color: '#4caf50',
    badge: 'MARKETPLACE',
  },
]

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div className="role-page animate-fade">
      <header className="role-header">
        <div className="role-logo-icon glow">⚽</div>
        <h1 className="gradient-text">Academy<span className="accent-gradient-text">Pro</span></h1>
        <p>Select your portal to continue</p>
      </header>

      <div className="role-cards">
        {roles.map((r, i) => (
          <div
            key={r.id}
            className="role-card glass"
            onClick={() => navigate(r.path)}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="role-card-icon" style={{ background: r.id === 'turf' ? 'rgba(76,175,80,0.1)' : 'var(--accent-dim)', borderColor: r.id === 'turf' ? 'rgba(76,175,80,0.2)' : 'var(--border-light)' }}>
              {r.icon}
            </div>
            <div className="role-card-content">
              <div className="role-card-title-row">
                <h3>{r.title}</h3>
                {r.badge && <span className="role-badge">{r.badge}</span>}
              </div>
              <p>{r.desc}</p>
              <div className="role-enter-row">
                <span style={{ color: r.id === 'turf' ? '#4caf50' : 'var(--accent)' }}>
                  {r.id === 'turf' ? 'List Venue' : 'Enter Portal'}
                </span>
                <span className="arrow">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="role-footer">
        <p>© 2026 AcademyPro · Premium Edition</p>
      </footer>
    </div>
  )
}
