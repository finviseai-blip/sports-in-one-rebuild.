import { useState } from 'react'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminBooking.css'

/* ── DATA ── */
const SPORTS_FILTERS = ['All', 'Football', 'Cricket', 'Basketball', 'Tennis', 'Swimming']

const initialTurfs = [
  {
    id: 1, owned: true,
    name: 'AcademyPro Ground', sport: 'Football',
    location: 'Andheri West, Mumbai', distance: '0.0 km',
    price: 800, priceUnit: 'hr',
    rating: 4.8, reviews: 42, size: '7-a-side', turf: 'Natural Grass',
    amenities: ['💡 Floodlights', '🚿 Changing Room', '🅿️ Parking', '🚰 Water'],
    photos: ['⚽'],
    available: true,
    slots: {
      morning:  ['6:00', '7:00', '8:00', '9:00'],
      evening:  ['4:00', '5:00', '6:00', '7:00', '8:00'],
    },
    bookedSlots: ['7:00', '5:00'],
  },
  {
    id: 2, owned: false,
    name: 'Rajiv Gandhi Stadium', sport: 'Football',
    location: 'Bandra, Mumbai', distance: '3.2 km',
    price: 1200, priceUnit: 'hr',
    rating: 4.5, reviews: 88, size: '11-a-side', turf: 'Artificial Turf',
    amenities: ['💡 Floodlights', '☕ Cafeteria', '🅿️ Parking', '🚿 Changing Room', '🏥 First Aid'],
    photos: ['🏟️'],
    available: true,
    slots: {
      morning: ['7:00', '9:00'],
      evening: ['5:00', '6:00', '7:00'],
    },
    bookedSlots: ['9:00'],
  },
  {
    id: 3, owned: false,
    name: 'ProSport Cricket Ground', sport: 'Cricket',
    location: 'Powai, Mumbai', distance: '5.1 km',
    price: 2000, priceUnit: 'hr',
    rating: 4.7, reviews: 55, size: 'Full Pitch', turf: 'Natural Grass',
    amenities: ['💡 Floodlights', '🏏 Pitch Rolling', '🅿️ Parking', '🚿 Changing Room'],
    photos: ['🏏'],
    available: true,
    slots: {
      morning: ['6:00', '7:00', '8:00'],
      evening: ['4:00', '5:00', '6:00'],
    },
    bookedSlots: [],
  },
  {
    id: 4, owned: false,
    name: 'SwimZone Pro', sport: 'Swimming',
    location: 'Goregaon, Mumbai', distance: '6.8 km',
    price: 600, priceUnit: 'hr',
    rating: 4.9, reviews: 120, size: 'Olympic 50m', turf: 'Heated Pool',
    amenities: ['🌡️ Heated Pool', '🔒 Locker Room', '🏊 Coaching', '🧴 Showers'],
    photos: ['🏊'],
    available: false,
    slots: {
      morning: ['5:30', '6:30', '7:30'],
      evening: ['4:30', '5:30'],
    },
    bookedSlots: ['5:30', '6:30', '7:30', '4:30', '5:30'],
  },
  {
    id: 5, owned: false,
    name: 'Elite Basketball Court', sport: 'Basketball',
    location: 'Malad, Mumbai', distance: '4.4 km',
    price: 700, priceUnit: 'hr',
    rating: 4.6, reviews: 34, size: 'Full Court', turf: 'Wooden Indoor',
    amenities: ['❄️ AC Indoor', '🚿 Locker Room', '🅿️ Parking'],
    photos: ['🏀'],
    available: true,
    slots: {
      morning: ['6:00', '8:00', '10:00'],
      evening: ['5:00', '6:00', '7:00', '8:00'],
    },
    bookedSlots: [],
  },
]

const DURATIONS = ['1 hr', '2 hr', '3 hr']

export default function AdminBooking() {
  const [turfs, setTurfs]               = useState(initialTurfs)
  const [sportFilter, setSportFilter]   = useState('All')
  const [sortBy, setSortBy]             = useState('rating') // rating | price | distance
  const [searchText, setSearchText]     = useState('')
  const [selected, setSelected]         = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedDuration, setDuration] = useState('1 hr')
  const [bookingDone, setBookingDone]   = useState(false)
  const [showAddTurf, setShowAddTurf]   = useState(false)
  const [editTurf, setEditTurf]         = useState(null)  // my turf being edited
  const [newTurf, setNewTurf]           = useState({ name:'', sport:'Football', location:'', price:'', size:'', turf:'', amenities:'', morningSlots:'', eveningSlots:'' })

  function confirmBooking() {
    if (!selectedSlot || !selectedDate) return
    setBookingDone(true)
    setTimeout(() => { setBookingDone(false); setSelected(null); setSelectedSlot(null); setSelectedDate('') }, 2200)
  }

  function addMyTurf() {
    if (!newTurf.name || !newTurf.location) return
    const t = {
      id: Date.now(), owned: true,
      name: newTurf.name, sport: newTurf.sport,
      location: newTurf.location, distance: '0.0 km',
      price: +newTurf.price || 0, priceUnit: 'hr',
      rating: 5.0, reviews: 0, size: newTurf.size, turf: newTurf.turf,
      amenities: newTurf.amenities.split(',').map(a => a.trim()).filter(Boolean),
      photos: ['⚽'], available: true,
      slots: {
        morning: newTurf.morningSlots.split(',').map(s => s.trim()).filter(Boolean),
        evening: newTurf.eveningSlots.split(',').map(s => s.trim()).filter(Boolean),
      },
      bookedSlots: [],
    }
    setTurfs(p => [t, ...p])
    setNewTurf({ name:'', sport:'Football', location:'', price:'', size:'', turf:'', amenities:'', morningSlots:'', eveningSlots:'' })
    setShowAddTurf(false)
  }

  const displayed = turfs
    .filter(t => (sportFilter === 'All' || t.sport === sportFilter) && t.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price')    return a.price - b.price
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
      return b.rating - a.rating
    })

  /* ── BOOKING DETAIL ── */
  if (selected) {
    const allSlots = [...(selected.slots.morning || []), ...(selected.slots.evening || [])]
    const totalPrice = +selectedDuration.split(' ')[0] * selected.price

    return (
      <div className="adm-bk-page">
        <AdminHeader />
        <div className="adm-bk-scroll">

          {/* Hero */}
          <div className="adm-bk-hero">
            <div className="adm-bk-hero-emoji">{selected.photos[0]}</div>
            {selected.owned && <span className="adm-bk-owned-ribbon">MY TURF</span>}
          </div>

          <div className="adm-bk-detail-body">
            <button className="adm-bk-back-btn" onClick={() => { setSelected(null); setSelectedSlot(null); setBookingDone(false) }}>
              ← Back
            </button>

            <div className="adm-bk-detail-name-row">
              <h2 className="adm-bk-detail-name">{selected.name}</h2>
              <div className="adm-bk-rating-pill">⭐ {selected.rating}</div>
            </div>

            <div className="adm-bk-detail-meta">
              <span>📍 {selected.location}</span>
              <span>·</span>
              <span>📏 {selected.distance}</span>
              <span>·</span>
              <span>{selected.reviews} reviews</span>
            </div>

            <div className="adm-bk-chips-row">
              <span className="adm-bk-chip">{selected.sport}</span>
              <span className="adm-bk-chip">{selected.size}</span>
              <span className="adm-bk-chip">{selected.turf}</span>
            </div>

            {/* Amenities */}
            <div className="adm-bk-section-label">AMENITIES</div>
            <div className="adm-bk-amenities-grid">
              {selected.amenities.map(a => (
                <span key={a} className="adm-bk-amenity">{a}</span>
              ))}
            </div>

            {/* Price + Duration */}
            <div className="adm-bk-price-row">
              <div>
                <span className="adm-bk-price">₹{selected.price}</span>
                <span className="adm-bk-price-unit">/{selected.priceUnit}</span>
              </div>
              <div className="adm-bk-duration-pills">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    className={`adm-bk-dur-btn ${selectedDuration === d ? 'active' : ''}`}
                    onClick={() => setDuration(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div className="adm-bk-section-label">SELECT DATE</div>
            <input
              type="date" className="adm-bk-date-input"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Slots */}
            <div className="adm-bk-section-label">MORNING SLOTS</div>
            <div className="adm-bk-slots-grid">
              {(selected.slots.morning || []).map(slot => {
                const booked = selected.bookedSlots.includes(slot)
                return (
                  <button
                    key={slot}
                    className={`adm-bk-slot ${selectedSlot === slot ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                    onClick={() => !booked && setSelectedSlot(slot)}
                    disabled={booked}
                  >
                    {slot} AM
                    {booked && <span className="adm-bk-slot-booked">Booked</span>}
                  </button>
                )
              })}
            </div>

            <div className="adm-bk-section-label">EVENING SLOTS</div>
            <div className="adm-bk-slots-grid">
              {(selected.slots.evening || []).map(slot => {
                const booked = selected.bookedSlots.includes(slot)
                return (
                  <button
                    key={slot}
                    className={`adm-bk-slot ${selectedSlot === slot ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                    onClick={() => !booked && setSelectedSlot(slot)}
                    disabled={booked}
                  >
                    {slot} PM
                    {booked && <span className="adm-bk-slot-booked">Booked</span>}
                  </button>
                )
              })}
            </div>

            {/* Total */}
            {selectedSlot && selectedDate && (
              <div className="adm-bk-total-card">
                <div className="adm-bk-total-row"><span>Slot</span><span>{selectedSlot} · {selectedDate}</span></div>
                <div className="adm-bk-total-row"><span>Duration</span><span>{selectedDuration}</span></div>
                <div className="adm-bk-total-row"><span>Rate</span><span>₹{selected.price}/hr</span></div>
                <div className="adm-bk-total-divider" />
                <div className="adm-bk-total-row adm-bk-grand-total"><span>Total</span><span className="adm-bk-total-price">₹{totalPrice}</span></div>
              </div>
            )}

            <button
              className={`adm-bk-confirm-btn ${bookingDone ? 'done' : ''} ${(!selectedSlot || !selectedDate) ? 'disabled' : ''}`}
              onClick={confirmBooking}
              disabled={!selectedSlot || !selectedDate || bookingDone}
            >
              {bookingDone ? '✓ Booking Confirmed!' : `Confirm Booking${selectedSlot ? ` · ${selectedSlot}` : ''}`}
            </button>
          </div>

          <div style={{ height: 80 }} />
        </div>
        <AdminBottomNav />
      </div>
    )
  }

  /* ── LISTING ── */
  return (
    <div className="adm-bk-page">
      <AdminHeader />
      <div className="adm-bk-scroll">

        {/* Top bar */}
        <div className="adm-bk-topbar">
          <div>
            <h2 className="adm-bk-title">Book a Turf</h2>
            <p className="adm-bk-subtitle">Mumbai · {displayed.length} venues available</p>
          </div>
          <button className="adm-bk-add-btn" onClick={() => setShowAddTurf(p => !p)}>
            {showAddTurf ? '✕ Close' : '+ My Turf'}
          </button>
        </div>

        {/* Search */}
        <div className="adm-bk-search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="adm-bk-search"
            placeholder="Search venue, area..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        {/* Add My Turf Form */}
        {showAddTurf && (
          <div className="adm-bk-add-form">
            <div className="adm-bk-add-form-title">📍 Add Your Venue</div>
            <div className="adm-bk-form-row">
              <div className="adm-bk-form-field">
                <label>Venue Name</label>
                <input value={newTurf.name} onChange={e=>setNewTurf(p=>({...p,name:e.target.value}))} placeholder="My Sports Ground" />
              </div>
              <div className="adm-bk-form-field">
                <label>Sport</label>
                <select value={newTurf.sport} onChange={e=>setNewTurf(p=>({...p,sport:e.target.value}))}>
                  {SPORTS_FILTERS.slice(1).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-bk-form-field">
              <label>Location / Address</label>
              <input value={newTurf.location} onChange={e=>setNewTurf(p=>({...p,location:e.target.value}))} placeholder="Area, City" />
            </div>
            <div className="adm-bk-form-row">
              <div className="adm-bk-form-field">
                <label>Price/hr (₹)</label>
                <input type="number" value={newTurf.price} onChange={e=>setNewTurf(p=>({...p,price:e.target.value}))} placeholder="800" />
              </div>
              <div className="adm-bk-form-field">
                <label>Ground Size</label>
                <input value={newTurf.size} onChange={e=>setNewTurf(p=>({...p,size:e.target.value}))} placeholder="7-a-side" />
              </div>
            </div>
            <div className="adm-bk-form-row">
              <div className="adm-bk-form-field">
                <label>Turf Type</label>
                <input value={newTurf.turf} onChange={e=>setNewTurf(p=>({...p,turf:e.target.value}))} placeholder="Natural Grass" />
              </div>
            </div>
            <div className="adm-bk-form-field">
              <label>Amenities (comma separated)</label>
              <input value={newTurf.amenities} onChange={e=>setNewTurf(p=>({...p,amenities:e.target.value}))} placeholder="Floodlights, Parking, Changing Room" />
            </div>
            <div className="adm-bk-form-row">
              <div className="adm-bk-form-field">
                <label>Morning Slots (comma sep.)</label>
                <input value={newTurf.morningSlots} onChange={e=>setNewTurf(p=>({...p,morningSlots:e.target.value}))} placeholder="6:00, 7:00, 8:00" />
              </div>
              <div className="adm-bk-form-field">
                <label>Evening Slots (comma sep.)</label>
                <input value={newTurf.eveningSlots} onChange={e=>setNewTurf(p=>({...p,eveningSlots:e.target.value}))} placeholder="5:00, 6:00, 7:00" />
              </div>
            </div>
            <div className="adm-bk-form-actions">
              <button className="adm-bk-form-save" onClick={addMyTurf}>✓ Add Turf</button>
              <button className="adm-bk-form-cancel" onClick={() => setShowAddTurf(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Sport filter strip */}
        <div className="adm-bk-sport-filters">
          {SPORTS_FILTERS.map(s => (
            <button
              key={s}
              className={`adm-bk-sport-btn ${sportFilter === s ? 'active' : ''}`}
              onClick={() => setSportFilter(s)}
            >
              {s === 'Football' ? '⚽ ' : s === 'Cricket' ? '🏏 ' : s === 'Basketball' ? '🏀 ' : s === 'Tennis' ? '🎾 ' : s === 'Swimming' ? '🏊 ' : ''}{s}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div className="adm-bk-sort-bar">
          <span className="adm-bk-sort-label">Sort by:</span>
          {['rating', 'price', 'distance'].map(s => (
            <button
              key={s}
              className={`adm-bk-sort-btn ${sortBy === s ? 'active' : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* My turfs section */}
        {displayed.some(t => t.owned) && (
          <div className="adm-bk-section-heading">MY VENUES</div>
        )}

        {/* Turf cards */}
        <div className="adm-bk-cards">
          {displayed.map(t => (
            <TurfCard key={t.id} turf={t} onSelect={() => t.available && setSelected(t)} />
          ))}
        </div>

        <div style={{ height: 80 }} />
      </div>
      <AdminBottomNav />
    </div>
  )
}

/* ── TURF CARD ── */
function TurfCard({ turf, onSelect }) {
  const availableCount = Object.values(turf.slots).flat().length - turf.bookedSlots.length

  return (
    <div
      className={`adm-bk-card ${!turf.available ? 'unavail' : ''} ${turf.owned ? 'owned' : ''}`}
      onClick={turf.available ? onSelect : undefined}
    >
      {/* Emoji banner */}
      <div className="adm-bk-card-banner">
        <span className="adm-bk-card-emoji">{turf.photos[0]}</span>
        {turf.owned && <span className="adm-bk-card-mine-tag">MY TURF</span>}
        {!turf.available && <span className="adm-bk-card-unavail-tag">FULLY BOOKED</span>}
        <span className="adm-bk-card-dist-tag">📍 {turf.distance}</span>
      </div>

      <div className="adm-bk-card-body">
        <div className="adm-bk-card-top-row">
          <span className="adm-bk-card-name">{turf.name}</span>
          <div className="adm-bk-card-rating">⭐ {turf.rating} <span>({turf.reviews})</span></div>
        </div>

        <div className="adm-bk-card-location">📍 {turf.location}</div>

        <div className="adm-bk-card-chips">
          <span>{turf.sport}</span>
          <span>{turf.size}</span>
          <span>{turf.turf}</span>
        </div>

        <div className="adm-bk-card-amenities-row">
          {turf.amenities.slice(0, 3).map(a => (
            <span key={a} className="adm-bk-card-amenity">{a}</span>
          ))}
          {turf.amenities.length > 3 && <span className="adm-bk-card-amenity">+{turf.amenities.length - 3}</span>}
        </div>

        <div className="adm-bk-card-footer">
          <div className="adm-bk-card-price-wrap">
            <span className="adm-bk-card-price">₹{turf.price}</span>
            <span className="adm-bk-card-price-unit">/{turf.priceUnit}</span>
          </div>
          <div className="adm-bk-card-slot-info">
            {turf.available
              ? <span className="adm-bk-avail-text">{availableCount} slots available</span>
              : <span className="adm-bk-unavail-text">Fully booked</span>
            }
            {turf.available && <span className="adm-bk-book-arrow">Book Now →</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
