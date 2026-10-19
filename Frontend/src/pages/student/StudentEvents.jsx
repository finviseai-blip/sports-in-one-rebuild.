import { useState } from 'react'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import './StudentEvents.css'

const allEvents = [
  {
    id: 1,
    name: 'City League U-17 Championship',
    type: 'Football',
    date: 'Mar 15, 2026 · 10:00 AM',
    venue: 'Rajiv Gandhi Stadium, Mumbai',
    team: '11 - 6 spots left',
    fee: 500,
    joined: false,
    desc: 'Annual city-level U-17 football championship. Top teams from Mumbai compete for the trophy.',
  },
  {
    id: 2,
    name: 'Inter-Academy Friendly',
    type: 'Football',
    date: 'Mar 22, 2026 · 4:00 PM',
    venue: 'AcademyPro Ground, Pune',
    team: '7',
    fee: 0,
    joined: true,
    desc: 'Friendly match between top academies. Great exposure for young players.',
  },
  {
    id: 3,
    name: 'District Selection Trial',
    type: 'Football',
    date: 'Apr 6, 2026 · 9:00 AM',
    venue: 'Sports Complex, Thane',
    team: '11',
    fee: 0,
    joined: false,
    desc: 'District-level selection trial for state team. Top performers will be selected.',
  },
]

const QRCode = () => (
  <div style={{
    width: 140, height: 140,
    background: '#fff',
    padding: 10, borderRadius: 10,
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
  }}>
    {Array.from({ length: 49 }).map((_, i) => {
      const pattern = [0,1,2,3,4,5,6,7,13,14,21,27,28,29,30,31,32,33,34,35,41,42,43,44,45,46,47,48]
      return (
        <div key={i} style={{
          background: pattern.includes(i) || ((i * 17 + i * i * 3) % 10) > 5 ? '#000' : 'transparent',
          borderRadius: 1,
        }} />
      )
    })}
  </div>
)

/* ── Invites sent by admin/coach ── */
const initialInvites = [
  {
    id: 101, status: 'pending',
    eventName: 'City League U-17 Championship',
    sport: 'Football', date: 'Mar 15, 2026 · 10:00 AM',
    venue: 'Rajiv Gandhi Stadium, Mumbai',
    from: 'Coach Ramesh Kumar',
    message: 'You have been selected to represent AcademyPro in the City League. Confirm your availability.',
    fee: 0,
  },
  {
    id: 102, status: 'pending',
    eventName: 'Inter-Academy Friendly',
    sport: 'Football', date: 'Mar 22, 2026 · 4:00 PM',
    venue: 'AcademyPro Ground, Pune',
    from: 'Admin – AcademyPro',
    message: 'Friendly match invitation. You have been selected for starting XI. Accept to confirm your spot.',
    fee: 0,
  },
]

export default function StudentEvents() {
  const [mainTab, setMainTab] = useState('available')
  const [filterTab, setFilterTab] = useState('All Events')
  const [events, setEvents] = useState(allEvents)
  const [invites, setInvites] = useState(initialInvites)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [paymentStep, setPaymentStep] = useState('detail') // detail | payment | confirmed
  const [payMethod, setPayMethod] = useState('upi')

  const myEvents = events.filter(e => e.joined)
  const pendingInvites = invites.filter(i => i.status === 'pending')

  const filtered = events.filter(e => {
    if (filterTab === 'Free') return e.fee === 0
    if (filterTab === 'Paid') return e.fee > 0
    if (filterTab === 'Joined') return e.joined
    return true
  })

  const openEvent = (ev) => {
    setSelectedEvent(ev)
    setPaymentStep('detail')
  }

  const closeEvent = () => {
    setSelectedEvent(null)
    setPaymentStep('detail')
  }

  const handleJoin = () => {
    if (selectedEvent.fee > 0) {
      setPaymentStep('payment')
    } else {
      setPaymentStep('confirmed')
      setEvents(p => p.map(e => e.id === selectedEvent.id ? { ...e, joined: true } : e))
      setSelectedEvent(prev => ({ ...prev, joined: true }))
    }
  }

  const handlePayment = () => {
    setPaymentStep('confirmed')
    setEvents(p => p.map(e => e.id === selectedEvent.id ? { ...e, joined: true } : e))
    setSelectedEvent(prev => ({ ...prev, joined: true }))
  }

  return (
    <div className="se-page">
      <Header />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="se-modal-overlay" onClick={closeEvent}>
          <div className="se-modal" onClick={e => e.stopPropagation()}>
            <div className="se-modal-header">
              <button className="se-modal-close" onClick={closeEvent}>✕</button>
              <h3 className="se-modal-title">{selectedEvent.name}</h3>
              <span className="se-ev-type">{selectedEvent.type}</span>
            </div>

            <div className="se-modal-body">
              {paymentStep === 'detail' && (
                <>
                  <div className="se-modal-info">
                    <div className="se-info-row"><span>📅</span><span>{selectedEvent.date}</span></div>
                    <div className="se-info-row"><span>📍</span><span>{selectedEvent.venue}</span></div>
                    <div className="se-info-row"><span>👥</span><span>Team Size: {selectedEvent.team}</span></div>
                  </div>
                  <p className="se-modal-desc">{selectedEvent.desc}</p>
                  <div className="se-fee-row">
                    <span className="se-fee-label">Entry Fee</span>
                    <span className={`se-fee-val ${selectedEvent.fee === 0 ? 'free' : ''}`}>
                      {selectedEvent.fee === 0 ? '🟢 Free' : `₹${selectedEvent.fee}`}
                    </span>
                  </div>
                  {selectedEvent.joined ? (
                    <div className="se-already-joined">✓ You are registered for this event</div>
                  ) : (
                    <button className="se-modal-join-btn" onClick={handleJoin}>
                      {selectedEvent.fee > 0 ? `Pay ₹${selectedEvent.fee} & Join` : 'Join Event'}
                    </button>
                  )}
                </>
              )}

              {paymentStep === 'payment' && (
                <div className="se-payment-section">
                  <p className="se-pay-title">Complete Payment</p>
                  <div className="se-pay-amount">
                    <span>Amount to Pay</span>
                    <strong>₹{selectedEvent.fee}</strong>
                  </div>
                  <p className="se-pay-method-label">Select Payment Method</p>
                  <div className="se-pay-methods">
                    {['upi', 'card', 'netbanking'].map(m => (
                      <button
                        key={m}
                        className={`se-pay-method-btn ${payMethod === m ? 'active' : ''}`}
                        onClick={() => setPayMethod(m)}
                      >
                        <span>{m === 'upi' ? '📱' : m === 'card' ? '💳' : '🏦'}</span>
                        <span>{m === 'upi' ? 'UPI' : m === 'card' ? 'Card' : 'Net Banking'}</span>
                      </button>
                    ))}
                  </div>
                  {payMethod === 'upi' && (
                    <div className="se-upi-box">
                      <input placeholder="Enter UPI ID (e.g. name@upi)" className="se-upi-input" />
                    </div>
                  )}
                  {payMethod === 'card' && (
                    <div className="se-card-box">
                      <input placeholder="Card Number" className="se-upi-input" style={{marginBottom:8}} />
                      <div style={{display:'flex', gap:8}}>
                        <input placeholder="MM/YY" className="se-upi-input" style={{flex:1}} />
                        <input placeholder="CVV" className="se-upi-input" style={{flex:1}} />
                      </div>
                    </div>
                  )}
                  <button className="se-modal-join-btn" onClick={handlePayment}>
                    Confirm & Pay ₹{selectedEvent.fee}
                  </button>
                  <button className="se-back-btn" onClick={() => setPaymentStep('detail')}>← Back</button>
                </div>
              )}

              {paymentStep === 'confirmed' && (
                <div className="se-confirmed-section">
                  <div className="se-confirmed-icon">✅</div>
                  <p className="se-confirmed-title">Registration Confirmed!</p>
                  <p className="se-confirmed-sub">You're registered for {selectedEvent.name}</p>

                  <div className="se-pass-card">
                    <p className="se-pass-label">🎫 EVENT PASS</p>
                    <QRCode />
                    <p className="se-pass-sub">Present this QR at the venue</p>
                    <div className="se-pass-details">
                      <div className="se-pass-row">
                        <span>Event</span>
                        <strong>{selectedEvent.name}</strong>
                      </div>
                      <div className="se-pass-row">
                        <span>Date</span>
                        <strong>{selectedEvent.date}</strong>
                      </div>
                      <div className="se-pass-row">
                        <span>Venue</span>
                        <strong>{selectedEvent.venue}</strong>
                      </div>
                      {selectedEvent.fee > 0 && (
                        <div className="se-pass-row">
                          <span>Paid</span>
                          <strong style={{color:'#4caf50'}}>₹{selectedEvent.fee} ✓</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="se-modal-join-btn" onClick={closeEvent}>Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="se-scroll">
        <div className="se-main-tabs">
          <button className={mainTab === 'my' ? 'active' : ''} onClick={() => setMainTab('my')}>
            My Events {pendingInvites.length > 0 && <span className="se-inv-dot">{pendingInvites.length}</span>}
          </button>
          <button className={mainTab === 'available' ? 'active' : ''} onClick={() => setMainTab('available')}>
            Available ({allEvents.length})
          </button>
        </div>

        {mainTab === 'available' ? (
          <>
            <p className="se-sub-title">Upcoming academy events & tournaments</p>
            <div className="se-filter-tabs">
              {['All Events', 'Free', 'Paid', 'Joined'].map(f => (
                <button key={f} className={filterTab === f ? 'active' : ''} onClick={() => setFilterTab(f)}>{f}</button>
              ))}
            </div>
            <div className="se-event-list">
              {filtered.map(ev => (
                <div key={ev.id} className="se-event-card" onClick={() => openEvent(ev)}>
                  <p className="se-ev-name">{ev.name}</p>
                  <span className="se-ev-type">{ev.type}</span>
                  <div className="se-ev-details">
                    <p>📅 {ev.date}</p>
                    <p>📍 {ev.venue}</p>
                    <p>👥 Team Size: {ev.team}</p>
                  </div>
                  <div className="se-ev-footer">
                    <span className={`se-ev-fee ${ev.fee === 0 ? 'free' : ''}`}>
                      {ev.fee === 0 ? '🟢 Free entry' : `₹${ev.fee}`}
                    </span>
                    {ev.joined
                      ? <span className="se-joined-badge">✓ Joined</span>
                      : <button className="se-join-btn" onClick={e => { e.stopPropagation(); openEvent(ev) }}>Join Event</button>
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="se-my-events">
            {/* ── INVITES FROM COACH / ADMIN ── */}
            {pendingInvites.length > 0 && (
              <div className="se-invites-section">
                <p className="se-invites-hd">📩 Invitations ({pendingInvites.length})</p>
                {invites.map(inv => (
                  <div key={inv.id} className={`se-invite-card ${inv.status !== 'pending' ? 'resolved' : ''}`}>
                    <div className="se-invite-from">
                      <span className="se-invite-badge">INVITE</span>
                      <span className="se-invite-sender">from {inv.from}</span>
                    </div>
                    <p className="se-invite-event">{inv.eventName}</p>
                    <div className="se-invite-meta">
                      <span>⚽ {inv.sport}</span>
                      <span>📅 {inv.date}</span>
                      <span>📍 {inv.venue}</span>
                    </div>
                    <p className="se-invite-msg">{inv.message}</p>
                    {inv.status === 'pending' ? (
                      <div className="se-invite-actions">
                        <button className="se-inv-accept" onClick={() => setInvites(p => p.map(i => i.id === inv.id ? {...i, status:'accepted'} : i))}>
                          ✓ Accept
                        </button>
                        <button className="se-inv-decline" onClick={() => setInvites(p => p.map(i => i.id === inv.id ? {...i, status:'declined'} : i))}>
                          ✕ Decline
                        </button>
                      </div>
                    ) : (
                      <div className={`se-inv-result ${inv.status}`}>
                        {inv.status === 'accepted' ? '✓ Accepted' : '✕ Declined'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── JOINED EVENTS ── */}
            {myEvents.length === 0 && pendingInvites.length === 0 ? (
              <div className="se-empty-state">
                <span>🏆</span>
                <p>No events joined yet</p>
                <p className="se-empty-sub">Browse available events and join!</p>
              </div>
            ) : myEvents.length > 0 && (
              <>
                <p className="se-invites-hd">✓ Joined Events ({myEvents.length})</p>
                {myEvents.map(ev => (
                  <div key={ev.id} className="se-event-card" onClick={() => { openEvent(ev); setPaymentStep('confirmed') }}>
                    <p className="se-ev-name">{ev.name}</p>
                    <span className="se-ev-type">{ev.type}</span>
                    <div className="se-ev-details">
                      <p>📅 {ev.date}</p>
                      <p>📍 {ev.venue}</p>
                    </div>
                    <div className="se-ev-footer">
                      <span className={`se-ev-fee ${ev.fee === 0 ? 'free' : ''}`}>
                        {ev.fee === 0 ? '🟢 Free entry' : `₹${ev.fee}`}
                      </span>
                      <span className="se-joined-badge">✓ Joined · View Pass</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>
      <BottomNav />
    </div>
  )
}