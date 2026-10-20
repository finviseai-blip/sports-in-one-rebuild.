import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminChat.css'

const CONTACTS = [
  { id: 1, name: 'Jordan Lee',   initials: 'JL', sport: 'Basketball',  lastMsg: 'Coach, can I miss Thursday?',    time: '2m',   unread: 2, online: true },
  { id: 2, name: 'Sam Rivera',   initials: 'SR', sport: 'Tennis',      lastMsg: 'My fee receipt is attached',      time: '15m',  unread: 1, online: true },
  { id: 3, name: 'Alex Thompson',initials: 'AT', sport: 'Football',    lastMsg: 'Thanks for the feedback!',        time: '1h',   unread: 0, online: false },
  { id: 4, name: 'Morgan Davis', initials: 'MD', sport: 'Swimming',    lastMsg: 'What time is practice tomorrow?', time: '2h',   unread: 0, online: true },
  { id: 5, name: 'Arjun Mehta',  initials: 'AM', sport: 'Football',    lastMsg: 'Okay coach, understood.',         time: '5h',   unread: 0, online: false },
]

const INITIAL_MESSAGES = {
  1: [
    { id:1, from:'student', text:'Hi Coach! Quick question.', time:'10:05' },
    { id:2, from:'student', text:'Coach, can I miss Thursday session? I have exams.', time:'10:06' },
  ],
  2: [
    { id:1, from:'student', text:'Hello, I sent the fee payment.', time:'09:30' },
    { id:2, from:'student', text:'My fee receipt is attached.', time:'09:31' },
  ],
  3: [
    { id:1, from:'admin', text:'Alex, great improvement in your passing accuracy this week!', time:'08:00' },
    { id:2, from:'student', text:'Thanks for the feedback!', time:'08:15' },
  ],
  4: [
    { id:1, from:'student', text:'What time is practice tomorrow?', time:'07:30' },
  ],
  5: [
    { id:1, from:'admin', text:'Arjun, please work on your defensive positioning.', time:'Yesterday' },
    { id:2, from:'student', text:'Okay coach, understood.', time:'Yesterday' },
  ],
}

export default function AdminChat() {
  const navigate  = useNavigate()
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput]       = useState('')
  const [search, setSearch]     = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, activeContact])

  const sendMessage = () => {
    const text = input.trim()
    if (!text || !activeContact) return
    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [
        ...(prev[activeContact.id] || []),
        { id: Date.now(), from: 'admin', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    }))
    setInput('')
  }

  const openContact = (c) => {
    setActiveContact(c)
    // mark as read
    // (in real app you'd update unread count)
  }

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sport.toLowerCase().includes(search.toLowerCase())
  )

  /* ─ Chat detail view ─ */
  if (activeContact) {
    const msgs = messages[activeContact.id] || []
    return (
      <div className="adm-chat-page">
        <div className="adm-chat-detail-header">
          <button className="adm-chat-back" onClick={() => setActiveContact(null)}>←</button>
          <div className="adm-chat-detail-avatar">{activeContact.initials}</div>
          <div className="adm-chat-detail-info">
            <span className="adm-chat-detail-name">{activeContact.name}</span>
            <span className={`adm-chat-detail-status ${activeContact.online ? 'online' : ''}`}>
              {activeContact.online ? '● Online' : '● Offline'}
            </span>
          </div>
        </div>

        <div className="adm-chat-messages" ref={scrollRef}>
          {msgs.map(m => (
            <div key={m.id} className={`adm-chat-msg ${m.from === 'admin' ? 'sent' : 'received'}`}>
              <div className="adm-chat-bubble">
                <p>{m.text}</p>
                <span className="adm-chat-msg-time">{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="adm-chat-input-bar">
          <input
            className="adm-chat-input"
            placeholder={`Message ${activeContact.name}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            className={`adm-chat-send ${input.trim() ? 'active' : ''}`}
            onClick={sendMessage}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  /* ─ Contact list ─ */
  return (
    <div className="adm-chat-page">
      <div className="adm-chat-header">
        <button className="adm-chat-back" onClick={() => navigate(-1)}>←</button>
        <h2>Messages</h2>
      </div>

      <div className="adm-chat-search-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="adm-chat-search"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="adm-chat-list">
        {filtered.map(c => (
          <div key={c.id} className="adm-chat-contact" onClick={() => openContact(c)}>
            <div className="adm-chat-contact-avatar-wrap">
              <div className="adm-chat-contact-avatar">{c.initials}</div>
              {c.online && <span className="adm-chat-online-dot" />}
            </div>
            <div className="adm-chat-contact-info">
              <div className="adm-chat-contact-top">
                <span className="adm-chat-contact-name">{c.name}</span>
                <span className="adm-chat-contact-time">{c.time}</span>
              </div>
              <div className="adm-chat-contact-bottom">
                <span className="adm-chat-contact-msg">{c.lastMsg}</span>
                {c.unread > 0 && <span className="adm-chat-unread-badge">{c.unread}</span>}
              </div>
              <span className="adm-chat-contact-sport">{c.sport}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 80 }} />
      <AdminBottomNav />
    </div>
  )
}
