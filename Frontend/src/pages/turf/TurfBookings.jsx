/* TurfBookings.jsx */
import { useState } from 'react'
import { TurfHeader } from '../../components/TurfHeader'
import TurfBottomNav from '../../components/TurfBottomNav'
import './TurfBookings.css'

const INIT = [
  { id:1,  initials:'AM', name:'Arjun Mehta',    ph:'+91 98765 43210', court:'Ground A',   sport:'⚽', date:'Today',    slot:'6:00 AM', dur:'1 hr',  amt:800,  paid:true,  status:'confirmed', mode:'UPI',     players:7  },
  { id:2,  initials:'TR', name:'Team RK',         ph:'+91 87654 32109', court:'Ground A',   sport:'⚽', date:'Today',    slot:'8:00 AM', dur:'2 hr',  amt:1600, paid:true,  status:'confirmed', mode:'Online',  players:10 },
  { id:3,  initials:'RP', name:'Rahul + 6',       ph:'+91 76543 21098', court:'Ground B',   sport:'⚽', date:'Today',    slot:'9:00 AM', dur:'1 hr',  amt:800,  paid:false, status:'pending',   mode:'Pending', players:7  },
  { id:4,  initials:'PB', name:'Premier Batting', ph:'+91 65432 10987', court:'Box Cricket',sport:'🏏', date:'Today',    slot:'7:00 PM', dur:'3 hr',  amt:2400, paid:true,  status:'confirmed', mode:'UPI',     players:8  },
  { id:5,  initials:'PP', name:'Priya Patel',     ph:'+91 54321 09876', court:'Badminton 1',sport:'🏸', date:'Today',    slot:'8:00 PM', dur:'1 hr',  amt:400,  paid:true,  status:'confirmed', mode:'UPI',     players:2  },
  { id:6,  initials:'ND', name:'Nita Desai',      ph:'+91 43210 98765', court:'Ground A',   sport:'⚽', date:'Tomorrow', slot:'6:00 AM', dur:'2 hr',  amt:1600, paid:false, status:'pending',   mode:'Pending', players:7  },
  { id:7,  initials:'FC', name:'FC Warriors',     ph:'+91 32109 87654', court:'Ground B',   sport:'⚽', date:'Mar 8',    slot:'7:00 PM', dur:'1 hr',  amt:800,  paid:true,  status:'confirmed', mode:'Card',    players:11 },
  { id:8,  initials:'RK', name:'Ravi Kumar',      ph:'+91 21098 76543', court:'Ground A',   sport:'⚽', date:'Feb 28',   slot:'5:00 PM', dur:'1 hr',  amt:800,  paid:true,  status:'completed', mode:'UPI',     players:7  },
  { id:9,  initials:'VS', name:'Vikram Singh',    ph:'+91 10987 65432', court:'Box Cricket',sport:'🏏', date:'Feb 25',   slot:'6:00 PM', dur:'2 hr',  amt:1600, paid:true,  status:'completed', mode:'Cash',    players:6  },
  { id:10, initials:'RV', name:'Rohit Verma',     ph:'+91 09876 54321', court:'Ground A',   sport:'⚽', date:'Feb 20',   slot:'7:00 PM', dur:'1 hr',  amt:800,  paid:false, status:'cancelled', mode:'Refund',  players:7  },
]

const FILTERS = ['All','Today','Upcoming','Pending','Confirmed','Completed','Cancelled']

export default function TurfBookings() {
  const [bks, setBks]       = useState(INIT)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sel, setSel]       = useState(null)

  const accept = id => setBks(p=>p.map(b=>b.id===id?{...b,status:'confirmed',paid:true}:b))
  const reject = id => setBks(p=>p.map(b=>b.id===id?{...b,status:'cancelled'}:b))

  const TODAY_DATES = ['Today']
  const UPCOMING_DATES = ['Tomorrow', 'Mar 8', 'Mar 9', 'Mar 10', 'Mar 11', 'Mar 12']

  const filtered = bks.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.court.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    switch(filter) {
      case 'Today':     return TODAY_DATES.includes(b.date)
      case 'Upcoming':  return UPCOMING_DATES.includes(b.date)
      case 'Pending':   return b.status === 'pending'
      case 'Confirmed': return b.status === 'confirmed'
      case 'Completed': return b.status === 'completed'
      case 'Cancelled': return b.status === 'cancelled'
      default:          return true // All
    }
  })
  const pendingCt = bks.filter(b=>b.status==='pending').length
  const todayRev  = bks.filter(b=>b.date==='Today'&&b.paid).reduce((s,b)=>s+b.amt,0)

  if (sel) {
    const b = bks.find(x=>x.id===sel)
    return (
      <div className="tbk-page">
        <TurfHeader />
        <div className="tbk-detail">
          <button className="tbk-back" onClick={()=>setSel(null)}>← Back</button>
          <div className="tbk-dcard">
            <div className="tbk-davatar">{b.initials}</div>
            <h2>{b.name}</h2><p>{b.ph}</p>
            <span className={`tbk-status ${b.status}`}>{b.status}</span>
          </div>
          <div className="tbk-dinfo">
            {[['Court',b.court],['Sport',b.sport+' '+b.sport],['Date',b.date],['Slot',b.slot],['Duration',b.dur],['Players',b.players+'p'],['Payment',b.mode],['Amount','₹'+b.amt]].map(([k,v])=>(
              <div key={k} className="tbk-drow"><span>{k}</span><span className="tbk-dval">{v}</span></div>
            ))}
          </div>
          {b.status==='pending' && <div className="tbk-dactions"><button className="tbk-dacpt" onClick={()=>{accept(b.id);setSel(null)}}>✓ Accept</button><button className="tbk-drjct" onClick={()=>{reject(b.id);setSel(null)}}>✕ Decline</button></div>}
          {b.status==='confirmed' && <div className="tbk-dactions"><button className="tbk-drjct full" onClick={()=>{reject(b.id);setSel(null)}}>Cancel This Booking</button></div>}
        </div>
        <TurfBottomNav />
      </div>
    )
  }

  return (
    <div className="tbk-page">
      <TurfHeader />
      <div className="tbk-scroll">
        <div className="tbk-summary">
          <div className="tbk-scard"><span>{bks.filter(b=>b.date==='Today').length}</span><span>Today</span></div>
          <div className="tbk-scard amber"><span>{pendingCt}</span><span>Pending</span></div>
          <div className="tbk-scard green"><span>₹{(todayRev/1000).toFixed(1)}K</span><span>Today Rev</span></div>
        </div>
        <div className="tbk-search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Search name, court…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div className="tbk-filters">{FILTERS.map(f=><button key={f} className={`tbk-fc ${filter===f?'on':''}`} onClick={()=>setFilter(f)}>{f}{f==='Pending'&&pendingCt?` (${pendingCt})`:''}</button>)}</div>
        <div className="tbk-list">
          {filtered.length===0 ? <div className="tbk-empty"><span>📋</span><p>No bookings</p></div> : filtered.map(b=>(
            <div key={b.id} className={`tbk-card ${b.status==='pending'?'pend':''}`} onClick={()=>setSel(b.id)}>
              <div className="tbk-cl">
                <div className="tbk-cavatar">{b.sport}</div>
                <div>
                  <div className="tbk-cnr"><span className="tbk-cname">{b.name}</span><span className={`tbk-status ${b.status}`}>{b.status}</span></div>
                  <span className="tbk-ccourt">🏟️ {b.court}</span>
                  <div className="tbk-cmeta"><span>📅 {b.date}</span><span>🕐 {b.slot}</span><span>⏱️ {b.dur}</span><span>👥 {b.players}p</span></div>
                </div>
              </div>
              <div className="tbk-cr">
                <span className="tbk-camt">₹{b.amt}</span>
                <span className={`tbk-cpay ${b.paid?'pd':'up'}`}>{b.paid?'Paid':'Unpaid'}</span>
                {b.status==='pending' && <div className="tbk-cqa"><button className="tbk-qa-a" onClick={e=>{e.stopPropagation();accept(b.id)}}>✓</button><button className="tbk-qa-r" onClick={e=>{e.stopPropagation();reject(b.id)}}>✕</button></div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{height:80}} />
      </div>
      <TurfBottomNav />
    </div>
  )
}
