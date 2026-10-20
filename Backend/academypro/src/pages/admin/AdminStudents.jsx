import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminStudents.css'

/* ── MOCK DATA ── */
const initialStudents = [
  { id: 1, name: 'Alex Thompson',  initials: 'AT', sport: 'Football',   batch: 'Morning Batch A', attendance: 87, status: 'present', fees: 'paid',
    attrs: [{ name:'Physical',val:78},{ name:'Technical',val:74},{name:'Attacking',val:72},{name:'Defensive',val:65},{name:'Tactical',val:76}],
    stats: { matches:24, goals:18, assists:6 }, rank: 2 },
  { id: 2, name: 'Jordan Lee',     initials: 'JL', sport: 'Basketball', batch: 'Evening Batch B', attendance: 92, status: 'present', fees: 'paid',
    attrs: [{ name:'Physical',val:85},{ name:'Technical',val:70},{name:'Attacking',val:88},{name:'Defensive',val:72},{name:'Tactical',val:80}],
    stats: { matches:20, goals:22, assists:8 }, rank: 1 },
  { id: 3, name: 'Sam Rivera',     initials: 'SR', sport: 'Tennis',     batch: 'Morning Batch A', attendance: 73, status: 'absent', fees: 'pending',
    attrs: [{ name:'Physical',val:68},{ name:'Technical',val:65},{name:'Attacking',val:60},{name:'Defensive',val:58},{name:'Tactical',val:64}],
    stats: { matches:18, goals:12, assists:4 }, rank: 4 },
  { id: 4, name: 'Morgan Davis',   initials: 'MD', sport: 'Swimming',   batch: 'Morning Batch A', attendance: 95, status: 'present', fees: 'paid',
    attrs: [{ name:'Physical',val:90},{ name:'Technical',val:82},{name:'Attacking',val:78},{name:'Defensive',val:74},{name:'Tactical',val:85}],
    stats: { matches:22, goals:20, assists:10 }, rank: 3 },
  { id: 5, name: 'Arjun Mehta',    initials: 'AM', sport: 'Football',   batch: 'Evening Batch B', attendance: 80, status: 'absent', fees: 'pending',
    attrs: [{ name:'Physical',val:72},{ name:'Technical',val:68},{name:'Attacking',val:65},{name:'Defensive',val:62},{name:'Tactical',val:70}],
    stats: { matches:14, goals: 9, assists:5 }, rank: 5 },
  { id: 6, name: 'Karan Shah',     initials: 'KS', sport: 'Football',   batch: 'Morning Batch A', attendance: 95, status: 'present', fees: 'paid',
    attrs: [{ name:'Physical',val:82},{ name:'Technical',val:80},{name:'Attacking',val:76},{name:'Defensive',val:70},{name:'Tactical',val:78}],
    stats: { matches:16, goals:14, assists: 6 }, rank: 2 },
]

const initialBatches = [
  { id: 1, name: 'Morning Batch A', sport: 'Football',   time: '7:00 AM – 9:00 AM',  days: 'Mon-Fri', ageGroup: '12–16', count: 8 },
  { id: 2, name: 'Evening Batch B', sport: 'Basketball', time: '5:00 PM – 7:00 PM',  days: 'Mon-Sat', ageGroup: '13–17', count: 6 },
  { id: 3, name: 'Morning Batch A', sport: 'Tennis',     time: '8:00 AM – 10:00 AM', days: 'Tue-Sun', ageGroup: '10–15', count: 5 },
  { id: 4, name: 'Morning Batch A', sport: 'Swimming',   time: '6:00 AM – 8:00 AM',  days: 'Mon-Sat', ageGroup: '10–18', count: 4 },
]

const TABS = ['All', 'Present', 'Absent', 'Performance', 'Batch']

const tooltipStyle = { background:'#111', border:'1px solid #2a2a2a', borderRadius:8, color:'#fff', fontSize:12 }

function getColor(pct) {
  if (pct >= 75) return '#f5a623'
  if (pct >= 60) return '#e0d44e'
  return '#e05c5c'
}

/* ── PERFORMANCE EDIT PANEL ── */
function AdminPerformancePanel({ student, onSave, onClose }) {
  const [attrs, setAttrs]   = useState(student.attrs.map(a => ({ ...a })))
  const [stats, setStats]   = useState({ ...student.stats })
  const [summary, setSummary] = useState('')
  const [saved, setSaved]   = useState(false)

  const score = Math.round(attrs.reduce((s,a) => s+a.val, 0) / attrs.length)
  const radarData = attrs.map(a => ({ subject: a.name, A: a.val }))

  function handleSave() {
    onSave({ attrs, stats, summary })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="adm-perf-panel">
      <div className="adm-perf-topbar">
        <button className="adm-back-btn" onClick={onClose}>← Back</button>
        <span className="adm-perf-panel-title">{student.name} — Performance Edit</span>
      </div>

      {/* Radar */}
      <div className="adm-perf-radar-card">
        <div className="adm-perf-radar-header">
          <div>
            <div className="adm-perf-score">{score}<span>/100</span></div>
            <div className="adm-perf-score-label">Overall Score</div>
          </div>
          <div className="adm-perf-rank-badge">⭐ Rank #{student.rank}</div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData} outerRadius={75}>
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
            <Radar dataKey="A" stroke="#f5a623" fill="#f5a623" fillOpacity={0.2} strokeWidth={2}
              dot={{ fill:'#f5a623', r:4 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Attr sliders */}
      <div className="adm-perf-edit-card">
        <div className="adm-perf-edit-title">Adjust Attribute Scores</div>
        {attrs.map((a, i) => (
          <div key={a.name} className="adm-perf-attr-row">
            <span className="adm-perf-attr-name">{a.name}</span>
            <input
              type="range" min={0} max={100} value={a.val}
              onChange={e => setAttrs(prev => prev.map((x,idx) => idx===i ? {...x,val:+e.target.value} : x))}
              className="adm-perf-slider"
              style={{ '--fill-color': getColor(a.val) }}
            />
            <span className="adm-perf-attr-val" style={{ color: getColor(a.val) }}>{a.val}</span>
          </div>
        ))}
      </div>

      {/* Stats edit */}
      <div className="adm-perf-edit-card">
        <div className="adm-perf-edit-title">Match Stats</div>
        <div className="adm-perf-stats-grid">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="adm-perf-stat-field">
              <label>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
              <input
                type="number" value={v}
                onChange={e => setStats(p => ({ ...p, [k]: +e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stat bars preview */}
      <div className="adm-perf-bars-card">
        <div className="adm-perf-edit-title">Preview — Stat Bars</div>
        {attrs.map(a => (
          <div key={a.name} className="adm-sp-attr-row">
            <span className="adm-sp-attr-name">{a.name}</span>
            <div className="adm-sp-attr-bar-wrap">
              <div className="adm-sp-attr-bar" style={{ width:`${a.val}%`, background: getColor(a.val) }} />
            </div>
            <span className="adm-sp-attr-val">{a.val}</span>
          </div>
        ))}
      </div>

      {/* Coach note */}
      <div className="adm-perf-edit-card">
        <div className="adm-perf-edit-title">Coach Summary Note (shown to student)</div>
        <textarea
          className="adm-perf-summary"
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Write a performance summary visible to the student..."
          rows={3}
        />
      </div>

      <button className={`adm-perf-save-btn ${saved ? 'adm-perf-saved' : ''}`} onClick={handleSave}>
        {saved ? '✓ Saved!' : '✓ Save & Push to Student'}
      </button>

      <div style={{ height: 20 }} />
    </div>
  )
}

/* ── BATCH MANAGEMENT PANEL ── */
function AdminBatchPanel({ students }) {
  const [batches, setBatches] = useState(initialBatches)
  const [showCreate, setShowCreate] = useState(false)
  const [newBatch, setNewBatch] = useState({ name:'', sport:'', time:'', days:'', ageGroup:'', gender:'Mixed' })
  const [expanded, setExpanded] = useState(null)

  function createBatch() {
    if (!newBatch.name || !newBatch.sport) return
    setBatches(p => [...p, { id: Date.now(), ...newBatch, count: 0 }])
    setNewBatch({ name:'', sport:'', time:'', days:'', ageGroup:'', gender:'Mixed' })
    setShowCreate(false)
  }

  return (
    <div className="adm-batch-panel">
      <div className="adm-batch-topbar">
        <span className="adm-batch-title">Batch Management</span>
        <button className="adm-batch-create-btn" onClick={() => setShowCreate(p => !p)}>
          {showCreate ? '✕' : '+ New Batch'}
        </button>
      </div>

      {showCreate && (
        <div className="adm-batch-form">
          <div className="adm-form-row">
            <div className="adm-form-field">
              <label>Batch Name</label>
              <input value={newBatch.name} onChange={e=>setNewBatch(p=>({...p,name:e.target.value}))} placeholder="e.g. Morning Batch C" />
            </div>
            <div className="adm-form-field">
              <label>Sport</label>
              <input value={newBatch.sport} onChange={e=>setNewBatch(p=>({...p,sport:e.target.value}))} placeholder="e.g. Football" />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-field">
              <label>Time</label>
              <input value={newBatch.time} onChange={e=>setNewBatch(p=>({...p,time:e.target.value}))} placeholder="e.g. 7:00–9:00 AM" />
            </div>
            <div className="adm-form-field">
              <label>Days</label>
              <input value={newBatch.days} onChange={e=>setNewBatch(p=>({...p,days:e.target.value}))} placeholder="e.g. Mon–Fri" />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-form-field">
              <label>Age Group</label>
              <input value={newBatch.ageGroup} onChange={e=>setNewBatch(p=>({...p,ageGroup:e.target.value}))} placeholder="e.g. 12–16" />
            </div>
            <div className="adm-form-field">
              <label>Gender</label>
              <select value={newBatch.gender} onChange={e=>setNewBatch(p=>({...p,gender:e.target.value}))} className="adm-form-select">
                <option>Mixed</option><option>Boys</option><option>Girls</option>
              </select>
            </div>
          </div>
          <div className="adm-form-actions">
            <button className="adm-form-save" onClick={createBatch}>✓ Create Batch</button>
            <button className="adm-form-cancel" onClick={()=>setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      {batches.map(b => {
        const batchStudents = students.filter(s =>
          s.batch === b.name && s.sport === b.sport
        )
        const isOpen = expanded === b.id
        return (
          <div key={b.id} className="adm-batch-card">
            <div className="adm-batch-card-header" onClick={() => setExpanded(isOpen ? null : b.id)}>
              <div>
                <div className="adm-batch-card-name">{b.sport} — {b.name}</div>
                <div className="adm-batch-card-meta">{b.time} · {b.days}</div>
                <div className="adm-batch-card-meta">Age: {b.ageGroup} · {b.gender}</div>
              </div>
              <div className="adm-batch-card-right">
                <span className="adm-batch-count">{batchStudents.length || b.count} students</span>
                <span className="adm-batch-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>
            {isOpen && (
              <div className="adm-batch-students">
                {batchStudents.length === 0 ? (
                  <div className="adm-batch-empty">No students in this batch yet</div>
                ) : (
                  batchStudents.map(s => (
                    <div key={s.id} className="adm-batch-student-row">
                      <div className="adm-stu-avatar">{s.initials}</div>
                      <div className="adm-stu-info">
                        <span className="adm-stu-name">{s.name}</span>
                        <span className="adm-stu-att">{s.attendance}% attendance</span>
                      </div>
                      <span className={`adm-stu-status-dot ${s.status}`} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── STUDENT DETAIL ── */
function StudentDetail({ student, onBack, onSavePerf }) {
  const [subTab, setSubTab] = useState('info')

  return (
    <div className="adm-student-detail">
      <div className="adm-detail-topbar">
        <button className="adm-back-btn" onClick={onBack}>← Students</button>
        <span className="adm-detail-name">{student.name}</span>
      </div>

      <div className="adm-detail-profile-card">
        <div className="adm-detail-avatar">{student.initials}</div>
        <div className="adm-detail-info">
          <div className="adm-detail-sport">{student.sport} · {student.batch}</div>
          <div className="adm-detail-badges">
            <span className={`adm-detail-badge ${student.fees === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
              {student.fees.toUpperCase()}
            </span>
            <span className="adm-detail-badge badge-gray">Rank #{student.rank}</span>
          </div>
          <div className="adm-detail-att">{student.attendance}% attendance</div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="adm-detail-tabs">
        {['info','performance','attendance','payment'].map(t => (
          <button key={t} className={`adm-detail-tab ${subTab===t?'active':''}`} onClick={()=>setSubTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {subTab === 'info' && (
        <div className="adm-detail-section">
          <div className="adm-detail-row"><span>Sport</span><span>{student.sport}</span></div>
          <div className="adm-detail-row"><span>Batch</span><span>{student.batch}</span></div>
          <div className="adm-detail-row"><span>Attendance</span><span>{student.attendance}%</span></div>
          <div className="adm-detail-row"><span>Fees</span><span style={{color: student.fees==='paid'?'#4caf50':'#f5a623'}}>{student.fees}</span></div>
          <div className="adm-detail-row"><span>Matches</span><span>{student.stats.matches}</span></div>
          <div className="adm-detail-row"><span>Goals</span><span>{student.stats.goals}</span></div>
          <div className="adm-detail-row"><span>Assists</span><span>{student.stats.assists}</span></div>
        </div>
      )}

      {subTab === 'performance' && (
        <AdminPerformancePanel student={student} onSave={onSavePerf} onClose={onBack} />
      )}

      {subTab === 'attendance' && (
        <div className="adm-detail-section">
          <div className="adm-att-week">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
              <div key={d} className="adm-att-day">
                <div className={`adm-att-circle ${i<5 ? (i===2?'absent':'present') : 'off'}`} />
                <span>{d}</span>
              </div>
            ))}
          </div>
          <div className="adm-att-stat">{student.attendance}% overall attendance this season</div>
        </div>
      )}

      {subTab === 'payment' && (
        <div className="adm-detail-section">
          <div className="adm-detail-row"><span>January 2026</span><span style={{color:'#4caf50'}}>₹150 PAID</span></div>
          <div className="adm-detail-row"><span>February 2026</span><span style={{color:'#4caf50'}}>₹150 PAID</span></div>
          <div className="adm-detail-row"><span>March 2026</span>
            <span style={{color: student.fees==='paid'?'#4caf50':'#f5a623'}}>
              ₹150 {student.fees.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── MAIN COMPONENT ── */
export default function AdminStudents() {
  const [students, setStudents]   = useState(initialStudents)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)

  function handleSavePerf(data) {
    setStudents(prev => prev.map(s =>
      s.id === selected.id
        ? { ...s, attrs: data.attrs, stats: data.stats }
        : s
    ))
    setSelected(prev => ({ ...prev, attrs: data.attrs, stats: data.stats }))
  }

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.batch.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (activeTab === 'Present') return s.status === 'present'
    if (activeTab === 'Absent')  return s.status === 'absent'
    return true
  })

  /* ─ Performance tab shows all students with inline performance card ─ */
  if (selected) {
    return (
      <div className="adm-stu-page">
        <AdminHeader />
        <div className="adm-stu-scroll">
          <StudentDetail
            student={selected}
            onBack={() => setSelected(null)}
            onSavePerf={handleSavePerf}
          />
        </div>
        <AdminBottomNav />
      </div>
    )
  }

  return (
    <div className="adm-stu-page">
      <AdminHeader />
      <div className="adm-stu-scroll">

        <div className="adm-stu-toprow">
          <h2 className="adm-stu-title">Students</h2>
          <div className="adm-stu-meta">
            {students.filter(s=>s.status==='present').length} present ·{' '}
            {students.filter(s=>s.status==='absent').length} absent today
          </div>
        </div>

        {/* Search */}
        <div className="adm-stu-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="adm-stu-search"
            placeholder="Search students or batch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tab strip */}
        <div className="adm-stu-tabs-wrap">
          <div className="adm-stu-tabs">
            {TABS.map(t => (
              <button key={t} className={`adm-stu-tab ${activeTab===t?'active':''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Performance tab ── */}
        {activeTab === 'Performance' && (
          <div className="adm-perf-list">
            <div className="adm-perf-list-note">
              Tap a student to edit their performance. Changes sync to student's app.
            </div>
            {students.map(s => {
              const score = Math.round(s.attrs.reduce((acc,a)=>acc+a.val,0)/s.attrs.length)
              return (
                <div key={s.id} className="adm-perf-student-card" onClick={() => setSelected({...s, _openPerf: true})}>
                  <div className="adm-stu-avatar">{s.initials}</div>
                  <div className="adm-perf-student-info">
                    <div className="adm-stu-name">{s.name}</div>
                    <div className="adm-stu-batch">{s.sport} · {s.batch}</div>
                    <div className="adm-perf-mini-bars">
                      {s.attrs.map(a => (
                        <div key={a.name} className="adm-perf-mini-bar-wrap" title={a.name}>
                          <div className="adm-perf-mini-bar" style={{ height:`${a.val}%`, background: getColor(a.val) }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="adm-perf-score-pill" style={{ background: getColor(score)+'22', color: getColor(score) }}>
                    {score}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Batch tab ── */}
        {activeTab === 'Batch' && <AdminBatchPanel students={students} />}

        {/* ── Other tabs: student list ── */}
        {activeTab !== 'Performance' && activeTab !== 'Batch' && (
          <div className="adm-stu-list">
            {filtered.map(s => (
              <div key={s.id} className="adm-stu-card" onClick={() => setSelected(s)}>
                <div className="adm-stu-avatar-wrap">
                  <div className="adm-stu-avatar">{s.initials}</div>
                  <span className={`adm-stu-status-dot ${s.status}`} />
                </div>
                <div className="adm-stu-card-info">
                  <div className="adm-stu-name-row">
                    <span className="adm-stu-name">{s.name}</span>
                    <span className={`adm-fees-badge ${s.fees === 'paid' ? 'fees-paid' : 'fees-pending'}`}>
                      {s.fees}
                    </span>
                  </div>
                  <div className="adm-stu-batch">{s.sport} · {s.batch}</div>
                  <div className="adm-stu-att-row">
                    <span className="adm-stu-att-label">{s.attendance}% attendance</span>
                    <span className="adm-stu-kpis">G:{s.stats.goals} · A:{s.stats.assists}</span>
                  </div>
                  {/* Attendance mark buttons */}
                  <div className="adm-stu-att-btns">
                    <button
                      className={`adm-att-btn ${s.status==='present'?'adm-att-present':''}`}
                      onClick={e => {
                        e.stopPropagation()
                        setStudents(prev => prev.map(x => x.id===s.id ? {...x,status:'present'} : x))
                      }}
                    >✓ P</button>
                    <button
                      className={`adm-att-btn ${s.status==='absent'?'adm-att-absent':''}`}
                      onClick={e => {
                        e.stopPropagation()
                        setStudents(prev => prev.map(x => x.id===s.id ? {...x,status:'absent'} : x))
                      }}
                    >✕ A</button>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
      <AdminBottomNav />
    </div>
  )
}
