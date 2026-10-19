import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StudentChat.css'

export default function StudentChat() {
  const navigate = useNavigate()
  const [msg, setMsg] = useState('')
  const [msgs, setMsgs] = useState([])

  const send = () => {
    if (!msg.trim()) return
    setMsgs(p => [...p, { text: msg, mine: true }])
    setMsg('')
    setTimeout(() => {
      setMsgs(p => [...p, { text: 'Message received! Coach will respond shortly.', mine: false }])
    }, 800)
  }

  return (
    <div className="sc-page">
      <div className="sc-header">
        <button onClick={() => navigate(-1)}>←</button>
        <div className="sc-coach-info">
          <div className="sc-coach-avatar">MJ</div>
          <div>
            <p className="sc-coach-name">Marcus Johnson</p>
            <span className="sc-online">● Online</span>
          </div>
        </div>
        <span className="sc-unread">2 unread</span>
      </div>
      <div className="sc-messages">
        {msgs.length === 0 ? (
          <div className="sc-empty">
            <span>💬</span>
            <p>No messages yet</p>
            <p className="sc-empty-sub">Start a conversation</p>
          </div>
        ) : msgs.map((m, i) => (
          <div key={i} className={`sc-msg ${m.mine ? 'mine' : 'theirs'}`}>
            <div className="sc-bubble">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="sc-input">
        <input placeholder="Type a message..." value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send}>➤</button>
      </div>
    </div>
  )
}