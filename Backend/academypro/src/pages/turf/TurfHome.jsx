import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TurfHeader } from '../../components/TurfHeader'
import TurfBottomNav from '../../components/TurfBottomNav'
import './TurfHome.css'

/* ── Venue preview card ── exactly like KheloMore listing ── */
function VenuePreviewCard({ venue }) {
  return (
    <div className="th-venue-card">
      {/* Banner */}
      <div className="th-vc-banner" style={{ background: venue.bannerGrad }}>
        <div className="th-vc-sport-bg">{venue.sportEmoji}</div>
        <div className="th-vc-overlay">
          <span className="th-vc-live-badge">🟢 LIVE ON APP</span>
          <span className="th-vc-rating">★ {venue.rating} ({venue.reviews})</span>
        </div>
      </div>
      {/* Info */}
      <div className="th-vc-body">
        <div className="th-vc-top">
          <div>
            <h3 className="th-vc-name">{venue.name}</h3>
            <p className="th-vc-loc">📍 {venue.location}</p>
          </div>
          <div className="th-vc-price-col">
            <span className="th-vc-price">₹{venue.priceFrom}</span>
            <span className="th-vc-price-sub">per hour</span>
          </div>
        </div>
        <div className="th-vc-sport-tags">
          {venue.sports.map(s => (
            <span key={s.id} className="th-vc-sport-tag" style={{ background: s.color + '20', color: s.color }}>
              {s.emoji} {s.label}
            </span>
          ))}
        </div>
        <div className="th-vc-amenity-row">
          {venue.amenities.slice(0, 4).map(a => <span key={a} className="th-vc-amenity">{a}</span>)}
          {venue.amenities.length > 4 && <span className="th-vc-amenity">+{venue.amenities.length - 4}</span>}
        </div>
        <div className="th-vc-bottom">
          <span className="th-vc-avail">🕐 {venue.slotsToday} slots today</span>
          <button className="th-vc-book-btn">Book Now</button>
        </div>
      </div>
    </div>
  )
}

const VENUE_DATA = {
  name: 'Champions Sports Arena',
  location: 'Andheri West, Mumbai · 1.2 km',
  rating: 4.8, reviews: 124,
  priceFrom: 800,
  bannerGrad: 'linear-gradient(135deg,#1B5E20 0%,#2E7D32 50%,#1a2e1a 100%)',
  sportEmoji: '⚽',
  sports: [
    { id:'football',  emoji:'⚽', label:'Football',  color:'#4CAF50' },
    { id:'cricket',   emoji:'🏏', label:'Cricket',   color:'#2196F3' },
    { id:'badminton', emoji:'🏸', label:'Badminton', color:'#FF9800' },
  ],
  amenities: ['💡 Floodlights', '🚗 Parking', '🚿 Changing Room', '💧 Water', '🎥 CCTV'],
  slotsToday: 8,
}

const TODAY_BOOKINGS = [
  { time:'6:00 AM', name:'Arjun Mehta',   court:'Ground A', sport:'⚽', amt:800,  paid:true,  status:'confirmed' },
  { time:'8:00 AM', name:'Team RK',       court:'Ground A', sport:'⚽', amt:1600, paid:true,  status:'confirmed' },
  { time:'9:00 AM', name:'Rahul + 6',     court:'Ground B', sport:'⚽', amt:800,  paid:false, status:'pending'   },
  { time:'7:00 PM', name:'Premier Batch', court:'Box Crkt', sport:'🏏', amt:2400, paid:true,  status:'confirmed' },
  { time:'8:00 PM', name:'Priya Patel',   court:'Badminton',sport:'🏸', amt:400,  paid:true,  status:'confirmed' },
]

const ACTIVITY = [
  { icon:'📋', color:'#f5a623', text:'New booking: Arjun Mehta · 6AM · Ground A', time:'5m ago' },
  { icon:'💰', color:'#4caf50', text:'Payment ₹1,600 received from Team RK', time:'42m ago' },
  { icon:'💳', color:'#4caf50', text:'Weekly payout ₹4,800 → raj@upi settled', time:'2h ago' },
  { icon:'⭐', color:'#f5a623', text:'New 5★ review from Priya Patel', time:'Yesterday' },
  { icon:'❌', color:'#e53935', text:'Booking cancelled: Rohit Verma · 7PM Slot', time:'Yesterday' },
]

export default function TurfHome() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const todayRev   = TODAY_BOOKINGS.filter(b=>b.paid).reduce((s,b)=>s+b.amt,0)
  const pendingRev = TODAY_BOOKINGS.filter(b=>!b.paid).reduce((s,b)=>s+b.amt,0)
  const confirmed  = TODAY_BOOKINGS.filter(b=>b.status==='confirmed').length
  const pending    = TODAY_BOOKINGS.filter(b=>b.status==='pending').length

  return (
    <div className="th-page">
      <TurfHeader />
      <div className="th-scroll">

        {/* Availability toggle */}
        <div className={`th-avail-bar ${isOpen?'open':'closed'}`}>
          <div className="th-avail-left">
            <span className={`th-avail-dot ${isOpen?'open':'closed'}`} />
            <div>
              <p className="th-avail-title">{isOpen ? 'Open for Bookings' : 'Venue Closed'}</p>
              <p className="th-avail-sub">{isOpen ? '6:00 AM – 11:00 PM · Champions Sports Arena' : 'Toggle to accept new bookings'}</p>
            </div>
          </div>
          <div className={`th-toggle ${isOpen?'on':''}`} onClick={() => setIsOpen(p=>!p)}>
            <div className="th-toggle-k" />
          </div>
        </div>

        {/* Revenue strip */}
        <div className="th-rev-strip">
          <div className="th-rev-main">
            <span className="th-rev-icon">💰</span>
            <div>
              <p className="th-rev-val">₹{todayRev.toLocaleString()}</p>
              <p className="th-rev-lbl">Today's Revenue</p>
            </div>
          </div>
          <div className="th-rev-divider" />
          <div className="th-rev-mini">
            <p className="th-rev-val" style={{fontSize:18}}>₹48.6K</p>
            <p className="th-rev-lbl">This Month</p>
          </div>
          <div className="th-rev-divider" />
          <div className="th-rev-mini">
            <p className="th-rev-val" style={{fontSize:18,color:'#e53935'}}>₹{pendingRev}</p>
            <p className="th-rev-lbl">Pending</p>
          </div>
        </div>

        {/* Booking stats */}
        <div className="th-stats-row">
          <div className="th-stat-box" onClick={()=>navigate('/turf/bookings')}>
            <span className="th-stat-num">{TODAY_BOOKINGS.length}</span>
            <span className="th-stat-label">Today Bookings</span>
          </div>
          <div className="th-stat-box green" onClick={()=>navigate('/turf/bookings')}>
            <span className="th-stat-num">{confirmed}</span>
            <span className="th-stat-label">Confirmed</span>
          </div>
          <div className="th-stat-box amber" onClick={()=>navigate('/turf/bookings')}>
            <span className="th-stat-num">{pending}</span>
            <span className="th-stat-label">Pending</span>
          </div>
          <div className="th-stat-box" onClick={()=>navigate('/turf/slots')}>
            <span className="th-stat-num">8</span>
            <span className="th-stat-label">Slots Free</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="th-qa-row">
          {[
            {icon:'⏰',label:'Manage\nSlots',   path:'/turf/slots'},
            {icon:'📋',label:'All\nBookings',   path:'/turf/bookings'},
            {icon:'💳',label:'Withdraw\nEarnings',path:'/turf/earnings'},
            {icon:'✏️',label:'Edit\nVenue',     path:'/turf/profile'},
          ].map(a=>(
            <button key={a.label} className="th-qa-btn" onClick={()=>navigate(a.path)}>
              <span className="th-qa-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>

        {/* ── Venue Preview Card (how it appears to users) ── */}
        <div className="th-section-hdr">
          <span>YOUR VENUE ON APP</span>
          <button onClick={()=>navigate('/turf/profile')}>Edit →</button>
        </div>
        <div style={{padding:'0 16px'}}>
          <VenuePreviewCard venue={VENUE_DATA} />
        </div>

        {/* Today's schedule */}
        <div className="th-section-hdr">
          <span>TODAY'S SCHEDULE</span>
          <button onClick={()=>navigate('/turf/bookings')}>View All →</button>
        </div>
        <div className="th-schedule">
          {TODAY_BOOKINGS.map((b,i)=>(
            <div key={i} className={`th-schedule-row ${b.status==='pending'?'pending':''}`}>
              <div className="th-sch-time">
                <span className="th-sch-t">{b.time}</span>
                <span className="th-sch-sport">{b.sport}</span>
              </div>
              <div className="th-sch-bar" />
              <div className="th-sch-info">
                <span className="th-sch-name">{b.name}</span>
                <span className="th-sch-court">{b.court}</span>
              </div>
              <div className="th-sch-right">
                <span className="th-sch-amt">₹{b.amt}</span>
                <span className={`th-sch-badge ${b.status}`}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="th-section-hdr"><span>RECENT ACTIVITY</span></div>
        <div className="th-activity">
          {ACTIVITY.map((a,i)=>(
            <div key={i} className="th-act-row">
              <div className="th-act-icon" style={{background:a.color+'18'}}>{a.icon}</div>
              <div className="th-act-info">
                <p className="th-act-text">{a.text}</p>
                <span className="th-act-time">{a.time}</span>
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
