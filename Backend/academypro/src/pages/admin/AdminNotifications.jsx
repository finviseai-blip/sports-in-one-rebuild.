import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminNotifications.css'

const initialNotifs = [
  { id:1,  type:'payment', icon:'💰', color:'#e05c5c', title:'Payment Overdue',       body:"Sam Rivera's fee is overdue since Feb 15.",        time:'2m ago',   read:false },
  { id:2,  type:'attend',  icon:'✅', color:'#4caf50', title:'Attendance Marked',      body:"Jordan Lee marked Present for today's session.",    time:'10m ago',  read:false },
  { id:3,  type:'event',   icon:'📅', color:'#f5a623', title:'New Event Created',      body:'Swimming Gala has been created for Mar 22.',        time:'1h ago',   read:false },
  { id:4,  type:'perf',    icon:'📊', color:'#aaa',    title:'Performance Updated',    body:"Morgan Davis's performance stats were updated.",    time:'3h ago',   read:true  },
  { id:5,  type:'payment', icon:'💰', color:'#f5a623', title:'Payment Received',       body:'Arjun Mehta paid Rs.150 for March 2026.',          time:'5h ago',   read:true  },
  { id:6,  type:'batch',   icon:'👥', color:'#f5a623', title:'New Student Enrolled',   body:'Riya Sharma joined Morning Batch A - Football.',    time:'1d ago',   read:true  },
  { id:7,  type:'system',  icon:'⚙️', color:'#555',    title:'App Update Available',   body:'AcademyPro v2.3 is now available. Tap to update.', time:'2d ago',   read:true  },
]

export default function AdminNotifications() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState(initialNotifs)
  const [filter, setFilter] = useState('All')

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })))
  const markRead    = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id) => setNotifs(p => p.filter(n => n.id !== id))

  const types = ['All', 'payment', 'attend', 'event', 'perf', 'batch', 'system']
  const typeLabels = { All:'All', payment:'Payments', attend:'Attendance', event:'Events', perf:'Performance', batch:'Students', system:'System' }

  const filtered = filter === 'All' ? notifs : notifs.filter(n => n.type === filter)
  const unread   = notifs.filter(n => !n.read).length

  return (
    <div className="adm-notif-page">
      <div className="adm-notif-header">
        <div className="adm-notif-header-left">
          <button className="adm-notif-back" onClick={() => navigate(-1)}>&#8592;</button>
          <div>
            <h2>Notifications</h2>
            {unread > 0 && <span className="adm-notif-unread-count">{unread} unread</span>}
          </div>
        </div>
        {unread > 0 && (
          <button className="adm-notif-mark-all" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      {/* Filter chips */}
      <div className="adm-notif-filters">
        {types.map(t => (
          <button
            key={t}
            className={`adm-notif-filter-btn ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {typeLabels[t]}
          </button>
        ))}
      </div>

      <div className="adm-notif-list">
        {filtered.length === 0 ? (
          <div className="adm-notif-empty">
            <span>&#128277;</span>
            <p>No notifications here</p>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              className={`adm-notif-item ${n.read ? 'read' : 'unread'}`}
              onClick={() => markRead(n.id)}
            >
              <div className="adm-notif-icon-wrap" style={{ background: `${n.color}18`, border: `1px solid ${n.color}30` }}>
                <span>{n.icon}</span>
              </div>
              <div className="adm-notif-content">
                <div className="adm-notif-title-row">
                  <span className="adm-notif-title">{n.title}</span>
                  {!n.read && <span className="adm-notif-dot" style={{ background: n.color }} />}
                </div>
                <p className="adm-notif-body">{n.body}</p>
                <span className="adm-notif-time">{n.time}</span>
              </div>
              <button
                className="adm-notif-delete"
                onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
              >
                &#10005;
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ height: 80 }} />
      <AdminBottomNav />
    </div>
  )
}
