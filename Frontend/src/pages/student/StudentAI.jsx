import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import './StudentAI.css'

const QUICK = [
  { icon: '📈', label: 'Analyse my performance' },
  { icon: '💡', label: 'Suggest improvements' },
  { icon: '📊', label: 'Compare with last month' },
  { icon: '🏃', label: 'Training tips' },
]

const BOT_INTRO = "Hi srushti! 👋\nI'm your AI Sports Coach. I can analyse your performance, suggest improvements, and help you reach your goals. What would you like to explore?"

export default function StudentAI() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([{ role: 'bot', text: BOT_INTRO }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text }
    setMessages(p => [...p, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(p => [...p, {
        role: 'bot',
        text: `Great question about "${text}"! Based on your current stats — 14 matches, 9 goals, 5 assists — your attacking performance is strong. Your physical score is 75/100. Focus on defensive positioning to improve your overall rank from #3. Keep up the great work! 💪`
      }])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="ai-page">
      <div className="ai-header">
        <button className="ai-back" onClick={() => navigate(-1)}>←</button>
        <div className="ai-header-info">
          <div className="ai-avatar">🤖</div>
          <div>
            <p className="ai-name">AI Sports Coach</p>
            <span className="ai-status">● Active</span>
          </div>
        </div>
      </div>

      <p className="ai-quick-label">QUICK ACTIONS</p>
      <div className="ai-quick-grid">
        {QUICK.map((q, i) => (
          <button key={i} className="ai-quick-btn" onClick={() => send(q.label)}>
            <span>{q.icon}</span> {q.label}
          </button>
        ))}
      </div>

      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            {m.role === 'bot' && <div className="ai-msg-avatar">🤖</div>}
            <div className="ai-msg-bubble">{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg bot">
            <div className="ai-msg-avatar">🤖</div>
            <div className="ai-msg-bubble ai-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-bar">
        <input
          placeholder="Ask your AI coach..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button onClick={() => send(input)}>➤</button>
      </div>
      <BottomNav />
    </div>
  )
}