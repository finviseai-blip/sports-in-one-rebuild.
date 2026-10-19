import { useState, useRef, useEffect } from 'react'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminAI.css'

const QUICK_ACTIONS = [
  { id: 'analysis',     icon: '📊', label: 'Analyse academy performance' },
  { id: 'improvements', icon: '⚡', label: 'Suggest improvements' },
  { id: 'batch',        icon: '👥', label: 'Who to include in which batch' },
  { id: 'collab',       icon: '🤝', label: 'Collaboration suggestions' },
]

const SYSTEM_PROMPT = `You are an expert AI Sports Academy Analyst and Coach Assistant. 
You help the academy admin/coach by:
- Analysing student performance data
- Suggesting which students should be in which batches
- Recommending training improvements
- Identifying collaboration opportunities between students
- Providing strategic insights about the academy
- Helping with session planning and student development

Academy context: Elite Sports Academy, Season 2026. 22 students across Football, Basketball, Tennis, Swimming batches.
Key students: Jordan Lee (Basketball, 92% att, Rank 1), Alex Thompson (Football, 87% att), Morgan Davis (Swimming, 95% att), Sam Rivera (Tennis, 73% att - needs attention).

Always be specific, data-driven, and actionable. Provide concise but detailed responses.`

export default function AdminAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your AI Sports Academy Analyst. I can analyse student performance, suggest batch groupings, identify improvement areas, and help with strategic decisions. What would you like to explore?",
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function sendMessage(text) {
    const userText = text || input.trim()
    if (!userText) return
    setInput('')

    const updated = [...messages, { role: 'user', content: userText }]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.content?.find(b => b.type === 'text')?.text || 'Sorry, I could not process that.'
      setMessages(p => [...p, { role: 'assistant', content: reply }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Connection error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="adm-ai-page">
      <AdminHeader />

      <div className="adm-ai-scroll" ref={scrollRef}>

        {/* AI Header */}
        <div className="adm-ai-hero">
          <div className="adm-ai-hero-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div className="adm-ai-hero-title">AI Sports Analyst</div>
            <div className="adm-ai-hero-status">
              <span className="adm-ai-status-dot" />
              Active
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="adm-ai-actions-label">QUICK ACTIONS</div>
        <div className="adm-ai-actions-grid">
          {QUICK_ACTIONS.map(a => (
            <button key={a.id} className="adm-ai-action-btn" onClick={() => sendMessage(a.label)}>
              <span className="adm-ai-action-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="adm-ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`adm-ai-msg ${m.role}`}>
              {m.role === 'assistant' && (
                <div className="adm-ai-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              )}
              <div className="adm-ai-msg-bubble">
                {m.content.split('\n').map((line, j) => (
                  <p key={j} style={{ margin: line ? '0 0 4px' : '0' }}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="adm-ai-msg assistant">
              <div className="adm-ai-msg-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div className="adm-ai-msg-bubble adm-ai-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Input */}
      <div className="adm-ai-input-bar">
        <input
          className="adm-ai-input"
          placeholder="Ask your AI analyst..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <button
          className={`adm-ai-send-btn ${input.trim() ? 'active' : ''}`}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <AdminBottomNav />
    </div>
  )
}
