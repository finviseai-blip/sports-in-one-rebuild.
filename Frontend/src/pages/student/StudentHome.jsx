import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import Header from '../../components/Header'
import './StudentHome.css'

/* Attendance by YYYY-MM-DD: P=present A=absent null=no session */
const ATT_ALL = {
  '2026-02-03':'P','2026-02-04':'P','2026-02-05':'A','2026-02-06':'P','2026-02-07':'P',
  '2026-02-10':'P','2026-02-11':'P','2026-02-12':'P','2026-02-13':'A','2026-02-14':'P',
  '2026-02-17':'P','2026-02-18':'A','2026-02-19':'P','2026-02-20':'P','2026-02-21':'P',
  '2026-02-24':'P','2026-02-25':'P','2026-02-26':'P','2026-02-27':'P','2026-02-28':'P',
  '2026-03-03':'P','2026-03-04':'P','2026-03-05':'A','2026-03-06':'P','2026-03-07':'P',
  '2026-03-10':'P','2026-03-11':'P','2026-03-12':'P','2026-03-13':'A','2026-03-14':'P',
  '2026-03-17':'P','2026-03-18':'A','2026-03-19':'P','2026-03-20':'P','2026-03-21':'P',
  '2026-03-24':'P','2026-03-25':'P','2026-03-26':'P','2026-03-27':'P','2026-03-28':'P',
  '2026-03-31':'P',
  '2026-01-05':'P','2026-01-06':'P','2026-01-07':'A','2026-01-08':'P','2026-01-09':'P',
  '2026-01-12':'P','2026-01-13':'P','2026-01-14':'A','2026-01-19':'P','2026-01-20':'P',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function buildCal(year, month) {
  const first   = new Date(year, month, 1).getDay()
  const offset  = first === 0 ? 6 : first - 1
  const daysInM = new Date(year, month + 1, 0).getDate()
  const cells   = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInM; d++) cells.push(d)
  return cells
}

function pad(n) { return String(n).padStart(2,'0') }

export default function StudentHome() {
  const navigate     = useNavigate()
  const [showCal, setShowCal] = useState(false)
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(2) // 0-indexed: 2 = March

  const prevMonth = () => { if (calMonth===0){setCalYear(y=>y-1);setCalMonth(11)} else setCalMonth(m=>m-1) }
  const nextMonth = () => { if (calMonth===11){setCalYear(y=>y+1);setCalMonth(0)} else setCalMonth(m=>m+1) }

  const cells   = buildCal(calYear, calMonth)
  const moKey   = `${calYear}-${pad(calMonth+1)}`

  /* Count for current viewed month */
  const present = cells.filter(d => d && ATT_ALL[`${moKey}-${pad(d)}`]==='P').length
  const absent  = cells.filter(d => d && ATT_ALL[`${moKey}-${pad(d)}`]==='A').length
  const sessions= present + absent
  const pct     = sessions > 0 ? Math.round((present/sessions)*100) : 0

  /* Current month summary for header card */
  const curKey  = '2026-03'
  const cp = Object.keys(ATT_ALL).filter(k=>k.startsWith(curKey)&&ATT_ALL[k]==='P').length
  const ca = Object.keys(ATT_ALL).filter(k=>k.startsWith(curKey)&&ATT_ALL[k]==='A').length
  const cpct = Math.round((cp/(cp+ca))*100)

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
              <p className="sh-big-stat" style={{color:'var(--accent)'}}>{cpct}%</p>
              <div className="sh-progress"><div style={{width:`${cpct}%`}} /></div>
            </div>
            <div className="sh-stat-box">
              <label>PAYMENT</label>
              <p className="sh-big-stat" style={{color:'var(--success)'}}>PAID</p>
              <p className="sh-stat-sub">Monthly Fee: ₹12,000</p>
            </div>
          </div>

          <div className="sh-bottom-stats">
            <div><span>12</span><label>Matches</label></div>
            <div><span>8</span><label>Goals</label></div>
            <div><span>#2</span><label>Rank</label></div>
          </div>
        </div>

        {/* Attendance Calendar — full navigable */}
        <div className="sh-section">
          <div className="sh-section-header">
            <p className="sh-section-title">Attendance Calendar</p>
            <button className="sh-link" onClick={()=>setShowCal(p=>!p)}>
              {showCal ? 'Hide' : 'View Calendar'}
            </button>
          </div>

          {/* Summary chips */}
          <div className="sh-att-summary-row">
            <div className="sh-att-chip present">
              <p className="sh-att-chip-num">{present}</p>
              <span>Present</span>
            </div>
            <div className="sh-att-chip absent">
              <p className="sh-att-chip-num">{absent}</p>
              <span>Absent</span>
            </div>
            <div className="sh-att-chip rate">
              <p className="sh-att-chip-num">{pct}%</p>
              <span>Rate</span>
            </div>
          </div>

          {showCal && (
            <div className="sh-month-cal glass animate-fade">
              {/* Year nav */}
              <div className="sh-cal-year-row">
                <button className="sh-cal-ynav" onClick={()=>setCalYear(y=>y-1)}>‹‹</button>
                <span className="sh-cal-year">{calYear}</span>
                <button className="sh-cal-ynav" onClick={()=>setCalYear(y=>y+1)}>››</button>
              </div>

              {/* Month nav */}
              <div className="sh-cal-top">
                <button className="sh-cal-nav" onClick={prevMonth}>‹</button>
                <div>
                  <span className="sh-cal-month">{MONTHS[calMonth]}</span>
                  <div className="sh-cal-legend">
                    <span className="sh-leg present">■ Present</span>
                    <span className="sh-leg absent">■ Absent</span>
                  </div>
                </div>
                <button className="sh-cal-nav" onClick={nextMonth}>›</button>
              </div>

              {/* Day headers */}
              <div className="sh-cal-hdr">
                {['M','T','W','T','F','S','S'].map((d,i)=><span key={i}>{d}</span>)}
              </div>

              {/* Calendar grid */}
              <div className="sh-cal-grid">
                {cells.map((d, i) => {
                  const key = d ? `${moKey}-${pad(d)}` : null
                  const s   = key ? ATT_ALL[key] : null
                  return (
                    <div key={i} className={`sh-cal-day ${!d?'empty':s==='P'?'present':s==='A'?'absent':'neutral'}`}>
                      {d || ''}
                    </div>
                  )
                })}
              </div>

              {/* Month summary */}
              <div className="sh-cal-summary">
                <span className="sh-cal-sum-item present">{present} Present</span>
                <span className="sh-cal-sum-item absent">{absent} Absent</span>
                <span className="sh-cal-sum-item rate">{pct}% Rate</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="sh-section">
          <p className="sh-section-title">Quick Actions</p>
          <div className="sh-quick-grid">
            {[
              ['📊','Performance','/student/performance'],
              ['🎯','Events','/student/events'],
              ['🏟️','Book Turf','/student/booking'],
              ['🤖','AI Coach','/student/ai'],
            ].map(([ic,lb,path]) => (
              <button key={lb} className="sh-quick-btn glass" onClick={()=>navigate(path)}>
                <span className="sh-qi">{ic}</span>
                <span>{lb}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{height:100}} />
      </div>
      <BottomNav />
    </div>
  )
}
