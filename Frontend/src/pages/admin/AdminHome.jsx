import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminHome.css'

/* ── MOCK DATA ── */
const weeklyAttendance = [
  { day:'Mon', present:18, absent:4 },{ day:'Tue', present:20, absent:2 },
  { day:'Wed', present:15, absent:7 },{ day:'Thu', present:21, absent:1 },
  { day:'Fri', present:19, absent:3 },{ day:'Sat', present:10, absent:0 },
  { day:'Sun', present:0, absent:0 },
]

const PENDING_PAYMENTS = [
  { id:1, name:'Jordan Lee',   initials:'JL', amount:200, due:'2026-03-01', status:'PENDING' },
  { id:2, name:'Sam Rivera',   initials:'SR', amount:175, due:'2026-02-15', status:'OVERDUE' },
  { id:3, name:'Arjun Mehta',  initials:'AM', amount:150, due:'2026-03-10', status:'PENDING' },
  { id:4, name:'Priya Desai',  initials:'PD', amount:120, due:'2026-03-05', status:'PENDING' },
  { id:5, name:'Rohit Verma',  initials:'RV', amount:200, due:'2026-02-28', status:'OVERDUE' },
]

const ACTIVE_BATCHES = [
  { id:1, name:'Batch A – Morning', sport:'Football', timing:'7:00–9:00 AM', students:8, coach:'Coach Ramesh', status:'Active' },
  { id:2, name:'Batch B – Evening', sport:'Football', timing:'5:00–7:00 PM', students:7, coach:'Coach Priya',  status:'Active' },
  { id:3, name:'Batch C – Morning', sport:'Cricket',  timing:'8:00–10:00 AM',students:6, coach:'Coach Suresh', status:'Active' },
  { id:4, name:'Batch D – Weekend', sport:'Badminton',timing:'10:00–12:00 PM',students:5, coach:'Coach Anita', status:'Active' },
]

const recentActivity = [
  { id:1, color:'#f5a623', text:'Jordan Lee marked Present',        time:'2m ago' },
  { id:2, color:'#4caf50', text:'New event: Swimming Gala created', time:'1h ago' },
  { id:3, color:'#e05c5c', text:'Sam Rivera payment overdue',       time:'3h ago' },
  { id:4, color:'#aaaaaa', text:'Morgan Davis performance updated', time:'5h ago' },
]

const AI_SESSION_QUESTIONS = [
  { id:'students',  label:'Total no. of students',                        placeholder:'e.g. 22' },
  { id:'timing',    label:'Batch timing',                                 placeholder:'e.g. Morning 7–9 AM' },
  { id:'age',       label:'Age category',                                 placeholder:'e.g. 12–15' },
  { id:'gender',    label:'Gender',                                       placeholder:'e.g. Mixed / Boys / Girls' },
  { id:'sport',     label:'Sport / Activity focus',                       placeholder:'e.g. Football' },
]

/* ── Revenue per day per month ── */
const REVENUE_DATA = {
  '2026-01': { 5:3, 8:5, 12:4, 15:6, 20:3, 25:5, 28:4 },
  '2026-02': { 3:4, 7:6, 10:3, 14:5, 18:7, 22:4, 26:5 },
  '2026-03': { 1:4, 3:6, 5:3, 7:8, 10:5, 12:2, 15:7, 17:9, 20:4 },
}

const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December']

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const offset   = firstDay === 0 ? 6 : firstDay - 1
  const days     = new Date(year, month + 1, 0).getDate()
  const cells    = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  return cells
}

export default function AdminHome() {
  const navigate = useNavigate()

  /* session mode */
  const [sessionMode, setSessionMode] = useState(null)
  const [manualSession, setManualSession] = useState({ sport:'', batch:'', date:'', time:'', notes:'' })
  const [aiAnswers, setAiAnswers]   = useState({})
  const [aiPrompt, setAiPrompt]     = useState('')
  const [aiResult, setAiResult]     = useState(null)
  const [aiLoading, setAiLoading]   = useState(false)
  // Saved sessions list
  const CUTOFF_DAYS = 15
  const initSessions = [
    { id:1, type:'manual', sport:'Football', batch:'Batch A', date:'2026-03-05', time:'07:00', notes:'Focus on passing drills and small-sided games.', createdAt: new Date('2026-03-05').getTime() },
    { id:2, type:'ai', sessionName:'High Intensity Football Conditioning', sport:'Football', batch:'Batch B', duration:'90 mins', createdAt: new Date('2026-03-01').getTime(), warmup:['5-min jog','Dynamic stretching'], mainDrills:[{name:'Passing circuits',duration:'20 min',description:'4-cone passing drill'},{name:'5v5 small-sided',duration:'30 min',description:'High press, quick transitions'}], cooldown:['Static stretch','Breathing exercises'], coachTips:'Keep intensity high throughout.' },
  ]
  const [savedSessions, setSavedSessions] = useState(() => {
    const now = Date.now()
    return initSessions.filter(s => (now - s.createdAt) < CUTOFF_DAYS * 86400000)
  })
  const [showSessions, setShowSessions] = useState(false)
  const [expandedSession, setExpandedSession] = useState(null)

  /* card drill-downs */
  const [cardView, setCardView]   = useState(null) // 'revenue' | 'pending' | 'batches'
  const [calYear, setCalYear]     = useState(2026)
  const [calMonth, setCalMonth]   = useState(2)  // 0-indexed March
  const [calSelected, setCalSelected] = useState(null)

  const toggleCard = (key) => setCardView(p => p === key ? null : key)

  const prevMonth = () => { if (calMonth===0){setCalYear(y=>y-1);setCalMonth(11)} else setCalMonth(m=>m-1) }
  const nextMonth = () => { if (calMonth===11){setCalYear(y=>y+1);setCalMonth(0)} else setCalMonth(m=>m+1) }

  async function generateAISession() {
    setAiLoading(true); setAiResult(null)
    try {
      const qs = AI_SESSION_QUESTIONS.map(q=>`${q.label}: ${aiAnswers[q.id]||'not specified'}`).join('\n')
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:1000,
          system:`You are an expert sports academy session planner. Respond ONLY with a JSON object (no markdown, no backticks) with: {"sessionName":"","sport":"","duration":"","warmup":[],"mainDrills":[{"name":"","duration":"","description":""}],"cooldown":[],"coachTips":"","suggestedBatch":""}`,
          messages:[{role:'user',content:`Create training session:\n${qs}${aiPrompt?'\n\nExtra: '+aiPrompt:''}`}]
        })
      })
      const data = await res.json()
      const text = data.content?.find(b=>b.type==='text')?.text||'{}'
      setAiResult(JSON.parse(text.replace(/```json|```/g,'').trim()))
    } catch { setAiResult({error:'Could not generate. Please try again.'}) }
    setAiLoading(false)
  }

  const calCells   = buildCalendar(calYear, calMonth)
  const calKey     = `${calYear}-${String(calMonth+1).padStart(2,'0')}`
  const dayRevData = REVENUE_DATA[calKey] || {}
  const tooltipStyle = { background:'#111', border:'1px solid #2a2a2a', borderRadius:8, color:'#fff', fontSize:12 }

  return (
    <div className="adm-home-page">
      <AdminHeader />
      <div className="adm-home-scroll">

        {/* Academy Banner */}
        <div className="adm-academy-banner">
          <span className="adm-academy-dot" />
          Elite Sports Academy — Season 2026
        </div>

        {/* Stats Cards 2×2 */}
        <div className="adm-stats-grid">
          {/* Total Students */}
          <div className="adm-stat-card" onClick={() => navigate('/admin/students')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div className="adm-stat-value">22</div>
            <div className="adm-stat-label">Total Students</div>
            <div className="adm-stat-sub adm-stat-green">+3 this month</div>
          </div>

          {/* Active Batches — click shows batch list */}
          <div className="adm-stat-card" onClick={() => toggleCard('batches')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <div className="adm-stat-value">4</div>
            <div className="adm-stat-label">Active Batches</div>
            <div className="adm-stat-sub">{cardView==='batches'?'▲ Hide':'▼ View batches'}</div>
          </div>

          {/* Pending Payments — click shows pending list */}
          <div className="adm-stat-card adm-stat-card-warn" onClick={() => toggleCard('pending')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e05c5c" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div className="adm-stat-value adm-stat-red">₹525</div>
            <div className="adm-stat-label">Pending Payments</div>
            <div className="adm-stat-sub adm-stat-red-sub">{cardView==='pending'?'▲ Hide':'▼ 3 students overdue'}</div>
          </div>

          {/* Monthly Revenue — click shows navigable calendar */}
          <div className="adm-stat-card" onClick={() => toggleCard('revenue')}>
            <div className="adm-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
            <div className="adm-stat-value">₹6,800</div>
            <div className="adm-stat-label">Monthly Revenue</div>
            <div className="adm-stat-sub adm-stat-green">{cardView==='revenue'?'▲ Hide calendar':'▼ +9.7% vs last month'}</div>
          </div>
        </div>

        {/* ── ACTIVE BATCHES LIST ── */}
        {cardView === 'batches' && (
          <div className="adm-drilldown-card">
            <div className="adm-dd-title">Active Batches</div>
            {ACTIVE_BATCHES.filter(b=>b.status==='Active').map(b => (
              <div key={b.id} className="adm-batch-row">
                <div className="adm-batch-sport">{b.sport==='Football'?'⚽':b.sport==='Cricket'?'🏏':'🏸'}</div>
                <div className="adm-batch-info">
                  <span className="adm-batch-name">{b.name}</span>
                  <span className="adm-batch-meta">{b.timing} · {b.coach}</span>
                </div>
                <div className="adm-batch-right">
                  <span className="adm-batch-count">{b.students}</span>
                  <span className="adm-batch-active">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PENDING PAYMENTS LIST ── */}
        {cardView === 'pending' && (
          <div className="adm-drilldown-card">
            <div className="adm-dd-title">Pending Payments</div>
            {PENDING_PAYMENTS.map(p => (
              <div key={p.id} className="adm-payment-row">
                <div className="adm-payment-avatar">{p.initials}</div>
                <div className="adm-payment-info">
                  <span className="adm-payment-name">{p.name}</span>
                  <span className="adm-payment-due">Due: {p.due}</span>
                </div>
                <div className="adm-payment-right">
                  <span className="adm-payment-amount">₹{p.amount}</span>
                  <span className={`adm-payment-badge ${p.status==='OVERDUE'?'adm-badge-red':'adm-badge-yellow'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MONTHLY REVENUE CALENDAR (navigable) ── */}
        {cardView === 'revenue' && (
          <div className="adm-calendar-card">
            {/* Year nav */}
            <div className="adm-cal-year-row">
              <button className="adm-cal-nav-btn" onClick={()=>setCalYear(y=>y-1)}>‹‹</button>
              <span className="adm-cal-year-lbl">{calYear}</span>
              <button className="adm-cal-nav-btn" onClick={()=>setCalYear(y=>y+1)}>››</button>
            </div>
            {/* Month nav */}
            <div className="adm-calendar-title-row">
              <button className="adm-cal-nav-btn" onClick={prevMonth}>‹</button>
              <span className="adm-calendar-title">{MONTHS_LONG[calMonth]} {calYear} — Fee Collection</span>
              <button className="adm-cal-nav-btn" onClick={nextMonth}>›</button>
            </div>
            <div className="adm-calendar-grid">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
                <div key={d} className="adm-cal-day-label">{d}</div>
              ))}
              {calCells.map((day, i) => {
                if (!day) return <div key={i} className="adm-cal-day empty" />
                const count = dayRevData[day] || 0
                const key   = `${calKey}-${String(day).padStart(2,'0')}`
                const sel   = calSelected === key
                return (
                  <div key={i} className={`adm-cal-day ${count>0?'adm-cal-has-data':''} ${sel?'adm-cal-selected':''}`} onClick={()=>setCalSelected(sel?null:key)}>
                    <span>{day}</span>
                    {count > 0 && <span className="adm-cal-count">{count}</span>}
                  </div>
                )
              })}
            </div>
            {calSelected && (
              <div className="adm-cal-detail">
                <strong>{calSelected}</strong>: {dayRevData[parseInt(calSelected.split('-')[2])]||0} students paid fees
              </div>
            )}
          </div>
        )}

        {/* ─── CREATE SESSION ─── */}
        <div className="adm-session-section">
          <div className="adm-session-header">
            <div className="adm-session-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Session
            </div>
            <span className="adm-session-sub">Plan a new training session</span>
          </div>

          {sessionMode === null && (
            <div className="adm-session-btns">
              <button className="adm-session-btn-manual" onClick={() => setSessionMode('manual')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Create Session (Manual)
              </button>
              <button className="adm-session-btn-ai" onClick={() => setSessionMode('ai')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Create via AI
              </button>
            </div>
          )}

          {sessionMode === 'manual' && (
            <div className="adm-manual-form">
              <div className="adm-form-row">
                <div className="adm-form-field"><label>Sport</label><input value={manualSession.sport} onChange={e=>setManualSession(p=>({...p,sport:e.target.value}))} placeholder="e.g. Football" /></div>
                <div className="adm-form-field"><label>Batch</label><input value={manualSession.batch} onChange={e=>setManualSession(p=>({...p,batch:e.target.value}))} placeholder="e.g. Batch A" /></div>
              </div>
              <div className="adm-form-row">
                <div className="adm-form-field"><label>Date</label><input type="date" value={manualSession.date} onChange={e=>setManualSession(p=>({...p,date:e.target.value}))} /></div>
                <div className="adm-form-field"><label>Time</label><input type="time" value={manualSession.time} onChange={e=>setManualSession(p=>({...p,time:e.target.value}))} /></div>
              </div>
              <div className="adm-form-field"><label>Session Notes</label><textarea value={manualSession.notes} onChange={e=>setManualSession(p=>({...p,notes:e.target.value}))} placeholder="Describe the session plan..." rows={3} /></div>
              <div className="adm-form-actions">
                <button className="adm-form-save" onClick={()=>{
                  if(manualSession.sport && manualSession.date) {
                    setSavedSessions(p=>[...p,{id:Date.now(),type:'manual',...manualSession,createdAt:Date.now()}])
                    setManualSession({ sport:'', batch:'', date:'', time:'', notes:'' })
                  }
                  setSessionMode(null)
                }}>✓ Save Session</button>
                <button className="adm-form-cancel" onClick={()=>setSessionMode(null)}>Cancel</button>
              </div>
            </div>
          )}

          {sessionMode === 'ai' && !aiResult && (
            <div className="adm-ai-form">
              <div className="adm-ai-form-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                AI Pre-built Questions
              </div>
              {AI_SESSION_QUESTIONS.map(q=>(
                <div key={q.id} className="adm-form-field"><label>{q.label}</label><input value={aiAnswers[q.id]||''} onChange={e=>setAiAnswers(p=>({...p,[q.id]:e.target.value}))} placeholder={q.placeholder} /></div>
              ))}
              <div className="adm-form-field"><label>Additional prompt (optional)</label><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="Add any extra context for the AI..." rows={2} /></div>
              <div className="adm-form-actions">
                <button className="adm-form-save" onClick={generateAISession} disabled={aiLoading}>{aiLoading?'⏳ Generating...':'✦ Generate Session Plan'}</button>
                <button className="adm-form-cancel" onClick={()=>{setSessionMode(null);setAiAnswers({});setAiPrompt('')}}>Cancel</button>
              </div>
            </div>
          )}

          {sessionMode === 'ai' && aiResult && (
            <div className="adm-ai-result">
              {aiResult.error ? <p className="adm-ai-error">{aiResult.error}</p> : (
                <>
                  <div className="adm-ai-result-title">{aiResult.sessionName}</div>
                  <div className="adm-ai-result-meta"><span>{aiResult.sport}</span><span>·</span><span>{aiResult.duration}</span><span>·</span><span>{aiResult.suggestedBatch}</span></div>
                  <div className="adm-ai-section-label">WARM-UP</div>
                  {aiResult.warmup?.map((w,i)=><div key={i} className="adm-ai-item">• {w}</div>)}
                  <div className="adm-ai-section-label">MAIN DRILLS</div>
                  {aiResult.mainDrills?.map((d,i)=><div key={i} className="adm-ai-drill"><div className="adm-ai-drill-name">{d.name} <span>{d.duration}</span></div><div className="adm-ai-drill-desc">{d.description}</div></div>)}
                  <div className="adm-ai-section-label">COOL-DOWN</div>
                  {aiResult.cooldown?.map((c,i)=><div key={i} className="adm-ai-item">• {c}</div>)}
                  <div className="adm-ai-tips">💡 {aiResult.coachTips}</div>
                </>
              )}
              <div className="adm-form-actions" style={{marginTop:14}}>
                <button className="adm-form-save" onClick={()=>{
                  setSavedSessions(p=>[...p,{id:Date.now(),type:'ai',...aiResult,createdAt:Date.now()}])
                  setSessionMode(null);setAiResult(null);setAiAnswers({});setAiPrompt('')
                }}>✓ Save This Plan</button>
                <button className="adm-form-cancel" onClick={()=>setAiResult(null)}>← Regenerate</button>
              </div>
            </div>
          )}
        </div>

        {/* ─── SAVED SESSIONS ─── */}
        {savedSessions.length > 0 && (
          <div className="adm-sessions-list-section">
            <div className="adm-session-header" style={{cursor:'pointer'}} onClick={()=>setShowSessions(p=>!p)}>
              <div className="adm-session-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Created Sessions ({savedSessions.length})
              </div>
              <span className="adm-session-sub">{showSessions ? '▲ Hide' : '▼ View all'}</span>
            </div>
            {showSessions && (
              <div className="adm-saved-tabs">
                {/* Manual sessions */}
                {savedSessions.filter(s=>s.type==='manual').length > 0 && (
                  <div className="adm-saved-group">
                    <div className="adm-saved-group-hd">✏️ Manual Sessions</div>
                    {savedSessions.filter(s=>s.type==='manual').map(s=>(
                      <div key={s.id} className="adm-saved-card" onClick={()=>setExpandedSession(expandedSession===s.id?null:s.id)}>
                        <div className="adm-saved-card-top">
                          <div>
                            <span className="adm-saved-sport">{s.sport} · {s.batch}</span>
                            <span className="adm-saved-date">{s.date}{s.time && ` · ${s.time}`}</span>
                          </div>
                          <button className="adm-saved-del" onClick={e=>{e.stopPropagation();setSavedSessions(p=>p.filter(x=>x.id!==s.id))}}>✕</button>
                        </div>
                        {expandedSession===s.id && s.notes && (
                          <div className="adm-saved-notes">{s.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* AI sessions */}
                {savedSessions.filter(s=>s.type==='ai').length > 0 && (
                  <div className="adm-saved-group">
                    <div className="adm-saved-group-hd">✦ AI-Generated Sessions</div>
                    {savedSessions.filter(s=>s.type==='ai').map(s=>(
                      <div key={s.id} className="adm-saved-card" onClick={()=>setExpandedSession(expandedSession===s.id?null:s.id)}>
                        <div className="adm-saved-card-top">
                          <div>
                            <span className="adm-saved-sport">{s.sessionName || s.sport}</span>
                            <span className="adm-saved-date">{s.duration} · {s.suggestedBatch || s.batch}</span>
                          </div>
                          <button className="adm-saved-del" onClick={e=>{e.stopPropagation();setSavedSessions(p=>p.filter(x=>x.id!==s.id))}}>✕</button>
                        </div>
                        {expandedSession===s.id && (
                          <div className="adm-saved-expand">
                            {s.warmup?.length>0 && <><div className="adm-ai-section-label">WARM-UP</div>{s.warmup.map((w,i)=><div key={i} className="adm-ai-item">• {w}</div>)}</>}
                            {s.mainDrills?.length>0 && <><div className="adm-ai-section-label">MAIN DRILLS</div>{s.mainDrills.map((d,i)=><div key={i} className="adm-ai-drill"><div className="adm-ai-drill-name">{d.name} <span>{d.duration}</span></div><div className="adm-ai-drill-desc">{d.description}</div></div>)}</>}
                            {s.coachTips && <div className="adm-ai-tips">💡 {s.coachTips}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="adm-sessions-note">⏱ Sessions auto-delete after 15 days</p>
              </div>
            )}
          </div>
        )} 
        <div className="adm-section-card">
          <div className="adm-section-top">
            <span className="adm-section-heading">Weekly Attendance</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyAttendance} barGap={2} barCategoryGap="25%">
              <XAxis dataKey="day" tick={{fill:'#555',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} formatter={(val,name)=>[val, name==='present'?'Present':'Absent']} />
              <Bar dataKey="present" radius={[4,4,0,0]} fill="#f5a623" />
              <Bar dataKey="absent"  radius={[4,4,0,0]} fill="#e53935" />
            </BarChart>
          </ResponsiveContainer>
          {/* Summary numbers */}
          <div className="adm-att-totals">
            {weeklyAttendance.reduce((acc,d)=>({p:acc.p+d.present,a:acc.a+d.absent}),{p:0,a:0}) && (() => {
              const totP = weeklyAttendance.reduce((s,d)=>s+d.present,0)
              const totA = weeklyAttendance.reduce((s,d)=>s+d.absent,0)
              return (
                <>
                  <div className="adm-att-total present"><span>{totP}</span><label>Total Present</label></div>
                  <div className="adm-att-total absent"><span>{totA}</span><label>Total Absent</label></div>
                  <div className="adm-att-total rate"><span>{Math.round(totP/(totP+totA)*100)}%</span><label>Rate</label></div>
                </>
              )
            })()}
          </div>
          <div className="adm-attendance-legend">
            <span className="adm-leg-dot" style={{background:'#f5a623'}} /> Present
            <span className="adm-leg-dot" style={{background:'#e53935',marginLeft:12}} /> Absent
          </div>
        </div>

        {/* ─── RECENT ACTIVITY ─── */}
        <div className="adm-section-card">
          <div className="adm-section-top"><span className="adm-section-heading">Recent Activity</span></div>
          {recentActivity.map(a=>(
            <div key={a.id} className="adm-activity-row">
              <span className="adm-activity-dot" style={{background:a.color}} />
              <span className="adm-activity-text">{a.text}</span>
              <span className="adm-activity-time">{a.time}</span>
            </div>
          ))}
        </div>

        <div style={{height:80}} />
      </div>
      <AdminBottomNav />
    </div>
  )
}
