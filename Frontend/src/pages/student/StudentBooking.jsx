import { useState } from 'react'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import './StudentBooking.css'

/* ─── DATA ──────────────────────────────────────────────── */
const sports = [
  { name: 'Football',    icon: '⚽' },
  { name: 'Cricket',     icon: '🏏' },
  { name: 'Basketball',  icon: '🏀' },
  { name: 'Badminton',   icon: '🏸' },
  { name: 'Tennis',      icon: '🎾' },
  { name: 'Swimming',    icon: '🏊' },
]

const venues = [
  {
    id: 1, name: 'Khelo Arena – Andheri', city: 'Mumbai',
    sport: ['Football','Cricket'],
    rating: 4.8, reviews: 312, distance: '1.2 km',
    amenities: ['Floodlights','Parking','Changing Room','Canteen'],
    price: 1200, perUnit: 'team/hr',
    image: '🏟️', tag: 'Most Booked',
  },
  {
    id: 2, name: 'Pro Turf – Bandra', city: 'Mumbai',
    sport: ['Football'],
    rating: 4.6, reviews: 198, distance: '2.8 km',
    amenities: ['Floodlights','Parking','Drinking Water'],
    price: 900, perUnit: 'team/hr',
    image: '🏟️', tag: 'Budget Pick',
  },
  {
    id: 3, name: 'Green Field – Powai', city: 'Mumbai',
    sport: ['Football','Cricket'],
    rating: 4.5, reviews: 156, distance: '4.1 km',
    amenities: ['Floodlights','Changing Room','First Aid'],
    price: 1000, perUnit: 'team/hr',
    image: '🏟️', tag: null,
  },
  {
    id: 4, name: 'Sports Hub – Connaught Place', city: 'Delhi',
    sport: ['Basketball','Badminton'],
    rating: 4.7, reviews: 244, distance: '3.5 km',
    amenities: ['AC Indoor','Parking','Canteen','Lockers'],
    price: 600, perUnit: 'court/hr',
    image: '🏀', tag: 'Top Rated',
  },
  {
    id: 5, name: 'AcademyPro Ground – Whitefield', city: 'Bengaluru',
    sport: ['Football','Cricket'],
    rating: 4.9, reviews: 410, distance: '0.9 km',
    amenities: ['Floodlights','Parking','Changing Room','Canteen','Coaching'],
    price: 1400, perUnit: 'team/hr',
    image: '🏟️', tag: 'Academy Pick',
  },
  {
    id: 6, name: 'Hyd Sports Arena – Gachibowli', city: 'Hyderabad',
    sport: ['Football','Kabaddi','Volleyball'],
    rating: 4.6, reviews: 187, distance: '2.2 km',
    amenities: ['Floodlights','Parking','First Aid'],
    price: 850, perUnit: 'team/hr',
    image: '🏟️', tag: null,
  },
]

const timeSlots = [
  '05:00 AM','06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM',
  '04:00 PM','05:00 PM','06:00 PM','07:00 PM','08:00 PM','09:00 PM',
]
const bookedSlots = ['07:00 AM','06:00 PM','08:00 PM']

const teamSizes = ['1v1','5v5','7v7','11v11']
const pricingTypes = ['Per Team','Per Player']

const history = [
  { venue:'Khelo Arena – Andheri', sport:'Football', time:'07:00 AM · Feb 28', price:'₹1,200', status:'Confirmed', rating: null },
  { venue:'AcademyPro Ground',     sport:'Football', time:'05:00 PM · Feb 20', price:'₹800',   status:'Confirmed', rating: 5 },
  { venue:'Green Field Turf',       sport:'Cricket',  time:'06:00 PM · Feb 12', price:'₹900',   status:'Confirmed', rating: 4 },
]

const amenityIcons = {
  'Floodlights': '💡', 'Parking': '🅿️', 'Changing Room': '🚿',
  'Canteen': '🍽️', 'Drinking Water': '💧', 'First Aid': '🩺',
  'AC Indoor': '❄️', 'Lockers': '🔒', 'Coaching': '🎓',
}

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function StudentBooking() {
  const [step, setStep]           = useState(1)   // 1=search, 2=venues, 3=book, 4=confirm
  const [sport, setSport]         = useState('')
  const [city]                    = useState('Mumbai')   // auto-detected city
  const [areaSearch, setAreaSearch] = useState('')
  const [date, setDate]           = useState('')
  const [selectedVenue, setVenue] = useState(null)
  const [slot, setSlot]           = useState('')
  const [teamSize, setTeamSize]   = useState('11v11')
  const [pricing, setPricing]     = useState('Per Team')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromo]  = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [bookings, setBookings]   = useState(history)

  const filteredVenues = venues.filter(v =>
    v.city === city &&
    (!sport || v.sport.includes(sport)) &&
    (!areaSearch || v.name.toLowerCase().includes(areaSearch.toLowerCase()) || v.city.toLowerCase().includes(areaSearch.toLowerCase()))
  )

  const discount     = promoApplied ? 0.1 : 0
  const basePrice    = selectedVenue?.price ?? 0
  const finalPrice   = Math.round(basePrice * (1 - discount))
  const todayStr     = new Date().toISOString().split('T')[0]

  const handleSearch = () => {
    if (!sport || !date) { alert('Please select sport and date'); return }
    setStep(2)
  }

  const handleSelectVenue = (v) => {
    setVenue(v); setSlot(''); setStep(3)
  }

  const handleBook = () => {
    if (!slot) { alert('Please select a time slot'); return }
    const newBooking = {
      venue: selectedVenue.name, sport,
      time: `${slot} · ${date}`,
      price: `₹${finalPrice}`,
      status: 'Confirmed', rating: null,
    }
    setBookings(prev => [newBooking, ...prev])
    setStep(4)
  }

  const handleReset = () => {
    setSport(''); setDate(''); setVenue(null)
    setSlot(''); setPromoCode(''); setPromo(false)
    setStep(1)
  }

  return (
    <div className="sb-page">
      <Header />
      <div className="sb-scroll">

        {/* ── HEADER ── */}
        <div className="sb-top-bar">
          <div>
            <h2 className="sb-main-title">Book a Turf</h2>
            <p className="sb-main-sub">Premium grounds · Instant confirmation</p>
          </div>
          <button className="sb-history-toggle" onClick={() => setShowHistory(p => !p)}>
            📋 {showHistory ? 'Hide' : 'History'}
          </button>
        </div>

        {/* ── BOOKING HISTORY (toggle) ── */}
        {showHistory && (
          <div className="sb-history-section">
            <p className="sb-history-title">My Bookings</p>
            {bookings.map((b, i) => (
              <div key={i} className="sb-history-card">
                <div className="sb-hc-left">
                  <p className="sb-hc-venue">{b.venue}</p>
                  <p className="sb-hc-meta">
                    {sports.find(s => s.name === b.sport)?.icon ?? '⚽'} {b.sport} · 🕐 {b.time}
                  </p>
                  {b.rating && (
                    <div className="sb-hc-stars">
                      {'★'.repeat(b.rating)}{'☆'.repeat(5 - b.rating)}
                    </div>
                  )}
                </div>
                <div className="sb-hc-right">
                  <p className="sb-hc-price">{b.price}</p>
                  <span className="sb-hc-status">✓ {b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════ STEP 1 — SEARCH ══════════════ */}
        {step === 1 && (
          <div className="sb-step">

            {/* Sport Pills */}
            <p className="sb-step-label">Select Sport</p>
            <div className="sb-sport-grid">
              {sports.map(s => (
                <button
                  key={s.name}
                  className={`sb-sport-pill ${sport === s.name ? 'active' : ''}`}
                  onClick={() => setSport(s.name)}
                >
                  <span className="sb-sport-icon">{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>

            {/* Location — auto-detected, no manual city select */}
            <div className="sb-location-banner">
              <span>📍</span>
              <div>
                <p className="sb-loc-city">{city}</p>
                <p className="sb-loc-sub">Showing turfs near your location</p>
              </div>
              <span className="sb-loc-badge">Auto</span>
            </div>

            {/* Area search */}
            <p className="sb-step-label" style={{marginTop:16}}>Search Area / Venue</p>
            <div className="sb-area-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="e.g. Andheri, Bandra, Arena name..." value={areaSearch} onChange={e=>setAreaSearch(e.target.value)} />
            </div>

            {/* Date */}
            <p className="sb-step-label" style={{ marginTop: 20 }}>Select Date</p>
            <div className="sb-field">
              <input type="date" min={todayStr} value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <button className="sb-primary-btn" onClick={handleSearch}>
              🔍 &nbsp;Search Turfs
            </button>
          </div>
        )}

        {/* ══════════════ STEP 2 — VENUE LIST ══════════════ */}
        {step === 2 && (
          <div className="sb-step">
            <div className="sb-step-nav">
              <button className="sb-back-btn" onClick={() => setStep(1)}>← Back</button>
              <span className="sb-step-info">{filteredVenues.length} venues · {city}</span>
            </div>

            {/* Active filters */}
            <div className="sb-filter-chips">
              <span className="sb-chip">{sports.find(s=>s.name===sport)?.icon} {sport}</span>
              <span className="sb-chip">📍 {city}</span>
              <span className="sb-chip">📅 {date}</span>
            </div>

            {filteredVenues.length === 0 ? (
              <div className="sb-empty">😕 No venues found for selected filters</div>
            ) : (
              filteredVenues.map(v => (
                <div key={v.id} className="sb-venue-card" onClick={() => handleSelectVenue(v)}>
                  {v.tag && <span className="sb-venue-tag">{v.tag}</span>}
                  <div className="sb-venue-top">
                    <div className="sb-venue-icon">{v.image}</div>
                    <div className="sb-venue-info">
                      <p className="sb-venue-name">{v.name}</p>
                      <p className="sb-venue-city">📍 {v.city} · {v.distance}</p>
                      <div className="sb-venue-rating">
                        <span className="sb-star">★</span>
                        <span className="sb-rating-val">{v.rating}</span>
                        <span className="sb-reviews">({v.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="sb-venue-price-wrap">
                      <span className="sb-venue-price">₹{v.price}</span>
                      <span className="sb-venue-per">/{v.perUnit}</span>
                    </div>
                  </div>
                  <div className="sb-amenities">
                    {v.amenities.map(a => (
                      <span key={a} className="sb-amenity">
                        {amenityIcons[a] ?? '✓'} {a}
                      </span>
                    ))}
                  </div>
                  <button className="sb-select-btn">Book This Venue →</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ══════════════ STEP 3 — SLOT & DETAILS ══════════════ */}
        {step === 3 && selectedVenue && (
          <div className="sb-step">
            <div className="sb-step-nav">
              <button className="sb-back-btn" onClick={() => setStep(2)}>← Back</button>
              <span className="sb-step-info">Select slot</span>
            </div>

            {/* Venue summary */}
            <div className="sb-selected-venue">
              <span className="sb-sv-icon">{selectedVenue.image}</span>
              <div>
                <p className="sb-sv-name">{selectedVenue.name}</p>
                <p className="sb-sv-meta">📍 {selectedVenue.city} · ★ {selectedVenue.rating}</p>
              </div>
            </div>

            {/* Time Slots */}
            <p className="sb-step-label">Select Time Slot</p>
            <div className="sb-slots">
              {timeSlots.map(s => (
                <button
                  key={s}
                  className={`sb-slot ${slot === s ? 'selected' : ''} ${bookedSlots.includes(s) ? 'taken' : ''}`}
                  disabled={bookedSlots.includes(s)}
                  onClick={() => setSlot(s)}
                >
                  {bookedSlots.includes(s) ? <s>{s}</s> : s}
                </button>
              ))}
            </div>
            <div className="sb-slot-legend">
              <span className="sb-legend-dot available" /> Available &nbsp;
              <span className="sb-legend-dot selected-dot" /> Selected &nbsp;
              <span className="sb-legend-dot taken-dot" /> Booked
            </div>

            {/* Team Size */}
            <p className="sb-step-label" style={{ marginTop: 18 }}>Team Size</p>
            <div className="sb-option-row">
              {teamSizes.map(s => (
                <button key={s} className={`sb-option-btn ${teamSize === s ? 'active' : ''}`}
                  onClick={() => setTeamSize(s)}>{s}</button>
              ))}
            </div>

            {/* Pricing Type */}
            <p className="sb-step-label" style={{ marginTop: 16 }}>Pricing Type</p>
            <div className="sb-option-row">
              {pricingTypes.map(p => (
                <button key={p} className={`sb-option-btn ${pricing === p ? 'active' : ''}`}
                  onClick={() => setPricing(p)}>{p}</button>
              ))}
            </div>

            {/* Promo */}
            <p className="sb-step-label" style={{ marginTop: 16 }}>Promo Code</p>
            <div className="sb-promo-row">
              <input
                className="sb-promo-input"
                placeholder="e.g. KHELO10"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
              />
              <button
                className={`sb-promo-btn ${promoApplied ? 'applied' : ''}`}
                onClick={() => {
                  if (promoCode === 'KHELO10') setPromo(true)
                  else alert('Invalid promo code. Try KHELO10')
                }}
              >{promoApplied ? '✓ Applied' : 'Apply'}</button>
            </div>

            {/* Price Summary */}
            <div className="sb-price-summary">
              <div className="sb-ps-row"><span>Base Price</span><span>₹{basePrice}</span></div>
              {promoApplied && <div className="sb-ps-row discount"><span>Discount (10%)</span><span>−₹{Math.round(basePrice * 0.1)}</span></div>}
              <div className="sb-ps-divider" />
              <div className="sb-ps-row total"><span>Total</span><span>₹{finalPrice}</span></div>
            </div>

            <button className="sb-primary-btn" onClick={handleBook}>
              ✅ &nbsp;Confirm Booking · ₹{finalPrice}
            </button>
          </div>
        )}

        {/* ══════════════ STEP 4 — SUCCESS ══════════════ */}
        {step === 4 && (
          <div className="sb-success-screen">
            <div className="sb-success-icon">🎉</div>
            <h3 className="sb-success-title">Booking Confirmed!</h3>
            <p className="sb-success-sub">You're all set. See you on the ground!</p>
            <div className="sb-success-card">
              <div className="sb-sc-row"><span>Venue</span><span>{selectedVenue?.name}</span></div>
              <div className="sb-sc-row"><span>Sport</span><span>{sport}</span></div>
              <div className="sb-sc-row"><span>Date</span><span>{date}</span></div>
              <div className="sb-sc-row"><span>Slot</span><span>{slot}</span></div>
              <div className="sb-sc-row"><span>Team</span><span>{teamSize}</span></div>
              <div className="sb-sc-row total"><span>Amount Paid</span><span>₹{finalPrice}</span></div>
            </div>
            <div className="sb-success-actions">
              <button className="sb-outline-btn" onClick={() => { setShowHistory(true); handleReset() }}>
                📋 View History
              </button>
              <button className="sb-primary-btn" onClick={handleReset}>
                + New Booking
              </button>
            </div>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
      <BottomNav />
    </div>
  )
}