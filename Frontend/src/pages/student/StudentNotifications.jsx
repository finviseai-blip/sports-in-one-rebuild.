import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StudentNotifications.css'

const notifs = [
  { id:1, icon:'✅', title:'Attendance Marked', desc:"Your attendance for today has been marked as Present.", time:'10:30 AM', unread:true },
  { id:2, icon:'📅', title:'New Event: Football Championship', desc:"You have been registered for the Inter-Academy Football Championship on March 10.", time:'Yesterday', unread:true },
  { id:3, icon:'💰', title:'Payment Reminder', desc:"Your monthly fee of $150 is due on March 15. Please make the payment on time.", time:'2 days ago', unread:false },
  { id:4, icon:'📈', title:'Performance Update', desc:"Your performance score has improved by 15% this month. Keep it up!", time:'3 days ago', unread:false },
  { id:5, icon:'🔄', title:'Training Session Rescheduled', desc:"Friday's training session has been moved to Saturday 10 AM due to field maintenance.", time:'1 week ago', unread:false },
]

export default function StudentNotifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState(notifs)

  const markAll = () => setItems(p => p.map(n => ({ ...n, unread: false })))

  return (
    <div className="sn-page">
      <div className="sn-header">
        <button onClick={() => navigate(-1)}>←</button>
        <div>
          <h2>Notifications</h2>
          <p>{items.filter(n => n.unread).length} unread</p>
        </div>
        <button className="sn-mark-all" onClick={markAll}>Mark all read</button>
      </div>
      <div className="sn-list">
        {items.map(n => (
          <div key={n.id} className={`sn-item ${n.unread ? 'unread' : ''}`}
            onClick={() => setItems(p => p.map(i => i.id === n.id ? { ...i, unread: false } : i))}>
            <div className="sn-icon">{n.icon}</div>
            <div className="sn-content">
              <div className="sn-title-row">
                <p className="sn-title">{n.title}</p>
                {n.unread && <span className="sn-dot" />}
              </div>
              <p className="sn-desc">{n.desc}</p>
              <p className="sn-time">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}