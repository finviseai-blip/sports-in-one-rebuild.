import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer
} from 'recharts'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminHome.css'

/* ── MOCK DATA ── */
const weeklyAttendance = [
  { day: 'Mon', present: 18, absent: 4 },
  { day: 'Tue', present: 20, absent: 2 },
  { day: 'Wed', present: 15, absent: 7 },
  { day: 'Thu', present: 21, absent: 1 },
  { day: 'Fri', present: 19, absent: 3 },
  { day: 'Sat', present: 10, absent: 0 },
  { day: 'Sun', present: 0, absent: 0 },
]

const paymentDue = [
  { id: 1, name: 'Jordan Lee',   initials: 'JL', amount: 200, due: '2026-03-01', status: 'PENDING' },
  { id: 2, name: 'Sam Rivera',   initials: 'SR', amount: 175, due: '2026-02-15', status: 'OVERDUE' },
  { id: 3, name: 'Arjun Mehta',  initials: 'AM', amount: 150, due: '2026-03-10', status: 'PENDING' },
]

const recentActivity = [
  { id: 1, color: '#f5a623', text: 'Jordan Lee marked Present',         time: '2m ago' },
  { id: 2, color: '#4caf50', text: 'New event: Swimming Gala created',  time: '1h ago' },
  { id: 3, color: '#e05c5c', text: 'Sam Rivera payment overdue',        time: '3h ago' },
  { id: 4, color: '#aaaaaa', text: 'Morgan Davis performance updated',  time: '5h ago' },
]

const AI_SESSION_QUESTIONS = [
  { id: 'students',  label: 'Total no. of students',                          placeholder: 'e.g. 22' },
  { id: 'timing',    label: 'Batch timing',                                   placeholder: 'e.g. Morning 7–9 AM' },
  { id: 'age',       label: 'Age category (between 10-15 or specific no.)',   placeholder: 'e.g. 12–15' },
  { id: 'gender',    label: 'Gender',                                         placeholder: 'e.g. Mixed / Boys / Girls' },
  { id: 'sport',     label: 'Sport / Activity focus',                         placeholder: 'e.g. Football' },
]

/* ── MONTHLY REVENUE CALENDAR ── */
const calendarData = {
  '2026-03-01': 4, '2026-03-03': 6, '2026-03-05': 3,
  '2026-03-07': 8, '2026-03-10': 5, '2026-03-12': 2,
  '2026-03-15': 7, '2026-03-17': 9, '2026-03-20': 4,
}

export default function AdminHome() {
  const navigate = useNavigate()

  /* session mode: null | 'manual' | 'ai' */
  const [sessionMode, setSessionMode] = useState(null)
  const [manualSession, setManualSession] = useState({ sport: '', batch: '', date: '', time: '', notes: '' })
  const [aiAnswers, setAiAnswers]   = useState({})
  const [aiPrompt, setAiPrompt]     = useState('')
  const [aiResult, setAiResult]     = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)

  const [showCalendar, setShowCalendar]    = useState(false)
  const [calSelected, setCalSelected]      = useState(null)
  const [showPaymentAll, setShowPaymentAll] = useState(false)

  /* ── AI SESSION GENERATION ── */
  async function generateAISession() {
    setAiLoading(true)
    setAiResult(null)
    try {
      const questionsSummary = AI_SESSION_QUESTIONS
        .map(q => `${q.label}: ${aiAnswers[q.id] || 'not specified'}`)
        .join('\n')
      const userMessage = aiPrompt
        ? `${questionsSummary}\n\nAdmin additional context: ${aiPrompt}`
        : questionsSummary

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an expert sports academy session planner. Based on the inputs provided, generate a well-structured training session plan. 
          Respond ONLY with a JSON object (no markdown, no backticks) with these fields:
          {
            "sessionName": "string",
            "sport": "string",
            "duration": "string",
            "warmup": ["activity1","activity2"],
            "mainDrills": [{"name":"string","duration":"string","description":"string"}],
            "cooldown": ["activity1","activity2"],
            "coachTips": "string",
            "suggestedBatch": "string"
          }`,
          messages: [{ role: 'user', content: `Create a training session for:\n${userMessage}` }],
        }),
      })
      const data = await res.json()
      const text = data.content?.find(b => b.type === 'text')?.text || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      setAiResult(JSON.parse(clean))
    } catch {
      setAiResult({ error: 'Could not generate session. Please try again.' })
    }
    setAiLoading(false)
  }

  const tooltipStyle = {
    background: '#111', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#fff', fontSize: 12,
  }

  return (
    <div className="adm-home-page">
      <AdminHeader />

      <div className="adm-home-scroll">
        {/* Academy Banner */}
        <div className="adm-academy-banner">
          <span className="adm-academy-dot" />
          Elite Sports Academy — Season 2026
        </div>

        {/* Stats Cards 2x2 */}
        <div className="adm-stats-grid">
          <div className="adm-stat-card" onClick={() => navigate('/admin/students')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div className="adm-stat-value">22</div>
            <div className="adm-stat-label">Total Students</div>
            <div className="adm-stat-sub adm-stat-green">+3 this month</div>
          </div>

          <div className="adm-stat-card" onClick={() => navigate('/admin/students')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div className="adm-stat-value">4</div>
            <div className="adm-stat-label">Active Batches</div>
            <div className="adm-stat-sub">2 morning, 2 evening</div>
          </div>

          <div className="adm-stat-card adm-stat-card-warn" onClick={() => navigate('/admin/reports')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="adm-stat-value adm-stat-red">₹525</div>
            <div className="adm-stat-label">Pending Payments</div>
            <div className="adm-stat-sub adm-stat-red-sub">3 students overdue</div>
          </div>

          <div
            className="adm-stat-card"
            onClick={() => setShowCalendar(p => !p)}
          >
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <div className="adm-stat-value">₹6,800</div>
            <div className="adm-stat-label">Monthly Revenue</div>
            <div className="adm-stat-sub adm-stat-green">+9.7% vs last month</div>
          </div>
        </div>

        {/* Monthly Revenue Calendar */}
        {showCalendar && (
          <div className="adm-calendar-card">
            <div className="adm-calendar-title">March 2026 — Fee Collection</div>
            <div className="adm-calendar-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="adm-cal-day-label">{d}</div>
              ))}
              {/* offset = 0 for Mar 2026 starts Sunday */}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1
                const key = `2026-03-${String(day).padStart(2,'0')}`
                const count = calendarData[key] || 0
                const selected = calSelected === key
                return (
                  <div
                    key={day}
                    className={`adm-cal-day ${count > 0 ? 'adm-cal-has-data' : ''} ${selected ? 'adm-cal-selected' : ''}`}
                    onClick={() => setCalSelected(selected ? null : key)}
                  >
                    <span>{day}</span>
                    {count > 0 && <span className="adm-cal-count">{count}</span>}
                  </div>
                )
              })}
            </div>
            {calSelected && (
              <div className="adm-cal-detail">
                <strong>{calSelected}</strong>: {calendarData[calSelected] || 0} students paid fees
              </div>
            )}
          </div>
        )}

        {/* ─── CREATE SESSION SECTION (between cards & payment due) ─── */}
        <div className="adm-session-section">
          <div className="adm-session-header">
            <div className="adm-session-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Session
            </div>
            <span className="adm-session-sub">Plan a new training session</span>
          </div>

          {sessionMode === null && (
            <div className="adm-session-btns">
              <button className="adm-session-btn-manual" onClick={() => setSessionMode('manual')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Create Session (Manual)
              </button>
              <button className="adm-session-btn-ai" onClick={() => setSessionMode('ai')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Create via AI
              </button>
            </div>
          )}

          {/* MANUAL SESSION FORM */}
          {sessionMode === 'manual' && (
            <div className="adm-manual-form">
              <div className="adm-form-row">
                <div className="adm-form-field">
                  <label>Sport</label>
                  <input value={manualSession.sport} onChange={e => setManualSession(p => ({ ...p, sport: e.target.value }))} placeholder="e.g. Football" />
                </div>
                <div className="adm-form-field">
                  <label>Batch</label>
                  <input value={manualSession.batch} onChange={e => setManualSession(p => ({ ...p, batch: e.target.value }))} placeholder="e.g. Batch A" />
                </div>
              </div>
              <div className="adm-form-row">
                <div className="adm-form-field">
                  <label>Date</label>
                  <input type="date" value={manualSession.date} onChange={e => setManualSession(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="adm-form-field">
                  <label>Time</label>
                  <input type="time" value={manualSession.time} onChange={e => setManualSession(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div className="adm-form-field">
                <label>Session Notes</label>
                <textarea value={manualSession.notes} onChange={e => setManualSession(p => ({ ...p, notes: e.target.value }))} placeholder="Describe the session plan..." rows={3} />
              </div>
              <div className="adm-form-actions">
                <button className="adm-form-save" onClick={() => setSessionMode(null)}>✓ Save Session</button>
                <button className="adm-form-cancel" onClick={() => setSessionMode(null)}>Cancel</button>
              </div>
            </div>
          )}

          {/* AI SESSION FORM */}
          {sessionMode === 'ai' && !aiResult && (
            <div className="adm-ai-form">
              <div className="adm-ai-form-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                AI Pre-built Questions
              </div>
              {AI_SESSION_QUESTIONS.map(q => (
                <div key={q.id} className="adm-form-field">
                  <label>{q.label}</label>
                  <input
                    value={aiAnswers[q.id] || ''}
                    onChange={e => setAiAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                    placeholder={q.placeholder}
                  />
                </div>
              ))}
              <div className="adm-form-field">
                <label>Additional prompt (optional)</label>
                <textarea
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Add any extra context for the AI..."
                  rows={2}
                />
              </div>
              <div className="adm-form-actions">
                <button className="adm-form-save" onClick={generateAISession} disabled={aiLoading}>
                  {aiLoading ? '⏳ Generating...' : '✦ Generate Session Plan'}
                </button>
                <button className="adm-form-cancel" onClick={() => { setSessionMode(null); setAiAnswers({}); setAiPrompt('') }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* AI RESULT */}
          {sessionMode === 'ai' && aiResult && (
            <div className="adm-ai-result">
              {aiResult.error ? (
                <p className="adm-ai-error">{aiResult.error}</p>
              ) : (
                <>
                  <div className="adm-ai-result-title">{aiResult.sessionName}</div>
                  <div className="adm-ai-result-meta">
                    <span>{aiResult.sport}</span>
                    <span>·</span>
                    <span>{aiResult.duration}</span>
                    <span>·</span>
                    <span>{aiResult.suggestedBatch}</span>
                  </div>
                  <div className="adm-ai-section-label">WARM-UP</div>
                  {aiResult.warmup?.map((w, i) => <div key={i} className="adm-ai-item">• {w}</div>)}
                  <div className="adm-ai-section-label">MAIN DRILLS</div>
                  {aiResult.mainDrills?.map((d, i) => (
                    <div key={i} className="adm-ai-drill">
                      <div className="adm-ai-drill-name">{d.name} <span>{d.duration}</span></div>
                      <div className="adm-ai-drill-desc">{d.description}</div>
                    </div>
                  ))}
                  <div className="adm-ai-section-label">COOL-DOWN</div>
                  {aiResult.cooldown?.map((c, i) => <div key={i} className="adm-ai-item">• {c}</div>)}
                  <div className="adm-ai-tips">💡 {aiResult.coachTips}</div>
                </>
              )}
              <div className="adm-form-actions" style={{ marginTop: 14 }}>
                <button className="adm-form-save" onClick={() => { setSessionMode(null); setAiResult(null); setAiAnswers({}); setAiPrompt('') }}>✓ Save This Plan</button>
                <button className="adm-form-cancel" onClick={() => { setAiResult(null) }}>← Regenerate</button>
              </div>
            </div>
          )}
        </div>

        {/* ─── PAYMENT DUE ─── */}
        <div className="adm-section-card">
          <div className="adm-section-top">
            <span className="adm-section-heading">Payment Due</span>
            <button className="adm-view-all" onClick={() => setShowPaymentAll(p => !p)}>
              {showPaymentAll ? 'Show Less' : 'View All ›'}
            </button>
          </div>
          {(showPaymentAll ? paymentDue : paymentDue.slice(0, 2)).map(p => (
            <div key={p.id} className="adm-payment-row">
              <div className="adm-payment-avatar">{p.initials}</div>
              <div className="adm-payment-info">
                <span className="adm-payment-name">{p.name}</span>
                <span className="adm-payment-due">Due: {p.due}</span>
              </div>
              <div className="adm-payment-right">
                <span className="adm-payment-amount">₹{p.amount}</span>
                <span className={`adm-payment-badge ${p.status === 'OVERDUE' ? 'adm-badge-red' : 'adm-badge-yellow'}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── WEEKLY ATTENDANCE ─── */}
        <div className="adm-section-card">
          <div className="adm-section-top">
            <span className="adm-section-heading">Weekly Attendance</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyAttendance} barGap={2} barCategoryGap="25%">
              <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="present" radius={[4, 4, 0, 0]} fill="#f5a623" />
              <Bar dataKey="absent"  radius={[4, 4, 0, 0]} fill="#2a2a2a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="adm-attendance-legend">
            <span className="adm-leg-dot" style={{ background: '#f5a623' }} /> Present
            <span className="adm-leg-dot" style={{ background: '#2a2a2a', border: '1px solid #444' }} /> Absent
          </div>
        </div>

        {/* ─── RECENT ACTIVITY ─── */}
        <div className="adm-section-card">
          <div className="adm-section-top">
            <span className="adm-section-heading">Recent Activity</span>
          </div>
          {recentActivity.map(a => (
            <div key={a.id} className="adm-activity-row">
              <span className="adm-activity-dot" style={{ background: a.color }} />
              <span className="adm-activity-text">{a.text}</span>
              <span className="adm-activity-time">{a.time}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 80 }} />
      </div>

      <AdminBottomNav />
    </div>
  )
}
