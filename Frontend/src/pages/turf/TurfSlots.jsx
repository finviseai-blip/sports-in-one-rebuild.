import { useState } from 'react'
import { TurfHeader } from '../../components/TurfHeader'
import TurfBottomNav from '../../components/TurfBottomNav'
import './TurfSlots.css'

const COURTS = [
  { id:'ga', name:'Ground A', sport:'⚽', sportLabel:'Football',  color:'#4CAF50', pricePerHour:800 },
  { id:'gb', name:'Ground B', sport:'⚽', sportLabel:'Football',  color:'#4CAF50', pricePerHour:800 },
  { id:'bc', name:'Box Cricket', sport:'🏏', sportLabel:'Box Cricket', color:'#2196F3', pricePerHour:1200 },
  { id:'bd', name:'Badminton 1', sport:'🏸', sportLabel:'Badminton', color:'#FF9800', pricePerHour:400 },
]

const WEEK = [
  { day:'Thu', date:6  },{ day:'Fri', date:7  },{ day:'Sat', date:8  },
  { day:'Sun', date:9  },{ day:'Mon', date:10 },{ day:'Tue', date:11 },{ day:'Wed', date:12 },
]

const ALL_SLOTS = ['5:00 AM','6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM']

function initData() {
  const data = {}
  COURTS.forEach(c => {
    data[c.id] = {}
    WEEK.forEach(w => {
      const key = `${w.day}-${w.date}`
      const bookedIdx = c.id==='ga' ? [1,3,13] : c.id==='gb' ? [2,4,14] : c.id==='bc' ? [13,14] : [1,14]
      data[c.id][key] = ALL_SLOTS.map((t,i)=>({
        time:t, status: bookedIdx.includes(i) ? 'booked' : 'available',
        bookedBy: bookedIdx.includes(i) ? 'Player' : null,
        price: c.pricePerHour,
      }))
    })
  })
  return data
}

export default function TurfSlots() {
  const [activeCourt,  setActiveCourt]  = useState('ga')
  const [activeDay,    setActiveDay]    = useState(0)
  const [data,         setData]         = useState(initData)
  const [showAdd,      setShowAdd]      = useState(false)
  const [newTime,      setNewTime]      = useState('')
  const [newPrice,     setNewPrice]     = useState('800')
  const [toast,        setToast]        = useState(null)

  const court   = COURTS.find(c=>c.id===activeCourt)
  const dayKey  = `${WEEK[activeDay].day}-${WEEK[activeDay].date}`
  const slots   = data[activeCourt]?.[dayKey] || []
  const morning = slots.filter(s=>s.time.includes('AM'))
  const noon    = slots.filter(s=>s.time.startsWith('12')||s.time.startsWith('1:')||s.time.startsWith('2:')||s.time.startsWith('3:'))
  const evening = slots.filter(s=>['4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM'].includes(s.time))

  const toast2 = m => { setToast(m); setTimeout(()=>setToast(null),2000) }

  const toggle = t => {
    setData(p=>({...p,[activeCourt]:{...p[activeCourt],[dayKey]:p[activeCourt][dayKey].map(s=>s.time===t&&s.status!=='booked'?{...s,status:s.status==='blocked'?'available':'blocked'}:s)}}))
  }

  const booked    = slots.filter(s=>s.status==='booked').length
  const free      = slots.filter(s=>s.status==='available').length
  const blocked   = slots.filter(s=>s.status==='blocked').length
  const todayRev  = slots.filter(s=>s.status==='booked').reduce((a,s)=>a+s.price,0)

  return (
    <div className="ts-page">
      <TurfHeader />
      {toast && <div className="ts-toast">{toast}</div>}

      <div className="ts-scroll">

        {/* Court selector */}
        <div className="ts-court-strip">
          {COURTS.map(c=>{
            const bk = (data[c.id]?.[dayKey]||[]).filter(s=>s.status==='booked').length
            return (
              <button key={c.id} className={`ts-court-chip ${activeCourt===c.id?'on':''}`}
                style={activeCourt===c.id?{borderColor:c.color,background:c.color+'15',color:c.color}:{}} onClick={()=>setActiveCourt(c.id)}>
                <span className="ts-cc-sport">{c.sport}</span>
                <span className="ts-cc-name">{c.name}</span>
                {bk>0 && <span className="ts-cc-badge" style={{background:c.color}}>{bk}</span>}
              </button>
            )
          })}
        </div>

        {/* Week picker */}
        <div className="ts-week-strip">
          {WEEK.map((w,i)=>{
            const k=`${w.day}-${w.date}`
            const freeCount=(data[activeCourt]?.[k]||[]).filter(s=>s.status==='available').length
            return (
              <button key={i} className={`ts-day-pill ${activeDay===i?'on':''}`} onClick={()=>setActiveDay(i)}>
                <span className="ts-dp-day">{w.day}</span>
                <span className="ts-dp-date">{w.date}</span>
                {freeCount>0 && <span className="ts-dp-free" style={{color:activeDay===i?'#000':court.color}}>{freeCount}</span>}
              </button>
            )
          })}
        </div>

        {/* Summary */}
        <div className="ts-summary-strip">
          <div className="ts-sum-item booked">📋 {booked} Booked · ₹{todayRev.toLocaleString()}</div>
          <div className="ts-sum-item free">✅ {free} Free</div>
          <div className="ts-sum-item blocked">🔒 {blocked} Blocked</div>
        </div>

        {/* Add slot + Bulk */}
        <div className="ts-action-row">
          <button className="ts-act-btn add" onClick={()=>setShowAdd(p=>!p)}>{showAdd?'✕':'+ Slot'}</button>
          <button className="ts-act-btn block" onClick={()=>{
            setData(p=>({...p,[activeCourt]:{...p[activeCourt],[dayKey]:p[activeCourt][dayKey].map(s=>s.status==='available'?{...s,status:'blocked'}:s)}}))
            toast2('All free slots blocked')
          }}>🔒 Block All Free</button>
          <button className="ts-act-btn unblock" onClick={()=>{
            setData(p=>({...p,[activeCourt]:{...p[activeCourt],[dayKey]:p[activeCourt][dayKey].map(s=>s.status==='blocked'?{...s,status:'available'}:s)}}))
            toast2('All slots opened')
          }}>✅ Unblock All</button>
        </div>

        {showAdd && (
          <div className="ts-add-panel">
            <div className="ts-add-hd">Add Slot · {court.name} · Mar {WEEK[activeDay].date}</div>
            <div className="ts-add-row">
              <div className="ts-add-f"><label>Time</label><input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)} /></div>
              <div className="ts-add-f"><label>₹/hr</label><input type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)} /></div>
            </div>
            <div className="ts-add-btns">
              <button className="ts-add-save" onClick={()=>{
                if (!newTime) return
                /* Convert HH:MM to display format e.g. "14:30" → "2:30 PM" */
                const [hh, mm] = newTime.split(':').map(Number)
                const period = hh >= 12 ? 'PM' : 'AM'
                const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
                const display = `${h12}:${String(mm).padStart(2,'0')} ${period}`
                const newSlot = { time: display, status: 'available', bookedBy: null, price: +newPrice || court.pricePerHour }
                setData(p => ({
                  ...p,
                  [activeCourt]: {
                    ...p[activeCourt],
                    [dayKey]: [...(p[activeCourt][dayKey] || []), newSlot]
                      .sort((a, b) => {
                        /* sort by actual time */
                        const toMin = t => {
                          const [time, per] = t.split(' ')
                          const [h, m] = time.split(':').map(Number)
                          return (per==='PM' && h!==12 ? h+12 : per==='AM' && h===12 ? 0 : h) * 60 + m
                        }
                        return toMin(a.time) - toMin(b.time)
                      })
                  }
                }))
                toast2(`Slot ${display} added!`)
                setShowAdd(false)
                setNewTime('')
              }}>Add Slot</button>
              <button className="ts-add-cancel" onClick={()=>setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── SLOT GRID — exactly like KheloMore customer booking ── */}
        {[['🌅 Morning', morning], ['☀️ Afternoon', noon], ['🌆 Evening', evening]].map(([label, group])=>(
          group.length > 0 && (
            <div key={label}>
              <div className="ts-section-lbl">{label}</div>
              <div className="ts-slot-grid">
                {group.map(s=>(
                  <button
                    key={s.time}
                    className={`ts-slot-cell ${s.status}`}
                    style={s.status==='booked'?{borderColor:court.color+'40',background:court.color+'0D'}:{}}
                    onClick={()=>s.status!=='booked'&&toggle(s.time)}
                    disabled={s.status==='booked'}
                  >
                    <span className="ts-sc-time">{s.time}</span>
                    <span className="ts-sc-price">₹{s.price}</span>
                    <span className="ts-sc-state">
                      {s.status==='booked'    && <span style={{color:court.color}}>⬤ Booked</span>}
                      {s.status==='available' && <span style={{color:'#4caf50'}}>⬤ Free</span>}
                      {s.status==='blocked'   && <span style={{color:'#555'}}>⬤ Blocked</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}

        <div style={{height:80}} />
      </div>
      <TurfBottomNav />
    </div>
  )
}
