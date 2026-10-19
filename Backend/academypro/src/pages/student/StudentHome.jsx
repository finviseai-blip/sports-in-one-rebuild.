import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/Header'
import API from '../../api/api'
import './StudentHome.css'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const calDays = [
  [null, null, null, null, null, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30],
  [31, null, null, null, null, null, null]
]

export default function StudentHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    attendance: '92%',
    matches: 12,
    goals: 8,
    rank: '#2'
  })
  const [events, setEvents] = useState([])
  const [showWeekCal, setShowWeekCal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          API.get(`/students/${user?.id}/analytics`).catch(() => ({ data: stats })),
          API.get('/events').catch(() => ({ data: [] }))
        ])
        setStats(prev => ({ ...prev, ...statsRes.data }))
        setEvents(eventsRes.data)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchData()
    else setLoading(false)
  }, [user])

  if (loading) return <div className="sh-loading">Loading Excellence...</div>

  return (
    <div className="sh-page animate-fade">
      <Header />

      <div className="sh-scroll">
        {/* Program Card */}
        <div className="sh-program-card glass glow">
          <p className="sh-academy-label">ELITE SPORTS ACADEMY</p>
          <h2 className="sh-program-title accent-gradient-text">Football Program</h2>
          <p className="sh-batch">Morning Batch A · Season 2026</p>
          <div className="sh-active-badge">● Active Student</div>

          <div className="sh-stats-row">
            <div className="sh-stat-box">
              <label>ATTENDANCE</label>
              <p className="sh-big-stat" style={{ color: 'var(--accent)' }}>{stats.attendance}</p>
              <div className="sh-progress"><div style={{ width: stats.attendance }} /></div>
            </div>
            <div className="sh-stat-box">
              <label>PAYMENT</label>
              <p className="sh-big-stat" style={{ color: 'var(--success)' }}>PAID</p>
              <p className="sh-stat-sub">Monthly Fee: ₹12,000</p>
            </div>
          </div>

          <div className="sh-bottom-stats">
            <div><span>{stats.matches}</span><label>Matches</label></div>
            <div><span>{stats.goals}</span><label>Goals</label></div>
            <div><span>{stats.rank}</span><label>Rank</label></div>
          </div>
        </div>

        {/* Weekly Attendance */}
        <div className="sh-section">
          <div className="sh-section-header">
            <p className="sh-section-title">Weekly Performance</p>
            <button className="sh-link" onClick={() => setShowWeekCal(p => !p)}>
              {showWeekCal ? 'Close' : 'View Calendar'}
            </button>
          </div>

          <div className="sh-week-attendance glass">
            {weekDays.map((d, i) => (
              <div key={i} className="sh-att-day">
                <span className="sh-att-label">{d}</span>
                <span className="sh-att-mark" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>✓</span>
              </div>
            ))}
          </div>

          {showWeekCal && (
            <div className="sh-week-month-cal glass animate-fade">
              <p className="sh-wm-title">March 2026</p>
              <div className="sh-cal-days-header">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
              {calDays.map((week, wi) => (
                <div key={wi} className="sh-cal-week">
                  {week.map((d, di) => (
                    <button
                      key={di}
                      className={`sh-cal-day ${!d ? 'empty' : ''}`}
                      disabled={!d}
                    >
                      {d || ''}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events */}
        <div className="sh-section">
          <p className="sh-section-title">Upcoming & Recent Events</p>
          <div className="sh-events-list">
            {events.length === 0 ? (
              <div className="sh-empty-state glass">
                <p>No events scheduled yet.</p>
                <button className="sh-refresh-btn" onClick={() => window.location.reload()}>Refresh</button>
              </div>
            ) : (
              events.map((e, i) => (
                <div key={i} className="sh-event-row glass">
                  <div className="sh-ev-left">
                    <p className="sh-ev-name">{e.title || e.name}</p>
                    <p className="sh-ev-date">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <div className="sh-ev-right">
                    <span className="sh-ev-badge">Invite Received</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>
      <BottomNav />
    </div>
  )
}