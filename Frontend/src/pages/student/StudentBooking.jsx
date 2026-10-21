import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import API from '../../api/api'
import './StudentBooking.css'

const sports = [
  { name: 'Football', icon: '⚽' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Badminton', icon: '🏸' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Swimming', icon: '🏊' },
]
const dateKey = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
const timeLabel = (value) => new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

export default function StudentBooking() {
  const [step, setStep] = useState(1)
  const [sport, setSport] = useState('')
  const [areaSearch, setAreaSearch] = useState('')
  const [date, setDate] = useState('')
  const [turfs, setTurfs] = useState([])
  const [selectedVenue, setVenue] = useState(null)
  const [slotId, setSlotId] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const todayStr = dateKey(new Date())

  const loadTurfs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await API.get('/turfs')
      const rows = response.data?.turfs || []
      setTurfs(rows.map((turf) => ({
        ...turf,
        image: '🏟️',
        city: turf.location,
        price: turf.pricePerHour,
        slots: (turf.slots || []).filter((slot) => !slot.isBooked && new Date(slot.startTime) > new Date()),
      })))
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Unable to load turf listings. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadBookings = useCallback(async () => {
    try {
      const response = await API.get('/bookings/mine')
      setBookings(response.data?.bookings || [])
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Sign in to view your booking history.')
    }
  }, [])

  useEffect(() => {
    loadTurfs()
    loadBookings()
  }, [loadTurfs, loadBookings])

  const filteredVenues = useMemo(() => turfs.filter((venue) => {
    const matchesArea = !areaSearch || venue.name.toLowerCase().includes(areaSearch.toLowerCase()) ||
      venue.location.toLowerCase().includes(areaSearch.toLowerCase())
    const hasSlots = venue.slots.some((slot) => !date || dateKey(slot.startTime) === date)
    return matchesArea && hasSlots
  }), [turfs, areaSearch, date])

  const availableSlots = useMemo(() => {
    if (!selectedVenue) return []
    return selectedVenue.slots.filter((slot) => dateKey(slot.startTime) === date && !slot.isBooked)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  }, [selectedVenue, date])

  const selectedSlot = availableSlots.find((slot) => slot.id === slotId)
  const finalPrice = selectedVenue?.pricePerHour ?? 0

  const handleSearch = () => {
    if (!sport || !date) {
      setError('Please select a sport and date.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSelectVenue = (venue) => {
    setVenue(venue)
    setSlotId('')
    setStep(3)
  }

  const handleBook = async () => {
    if (!selectedVenue || !slotId) {
      setError('Please select an available time slot.')
      return
    }
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const response = await API.post('/bookings', { turfId: selectedVenue.id, slotId })
      setNotice(response.data?.message || 'Booking confirmed.')
      setStep(4)
      await Promise.all([loadBookings(), loadTurfs()])
    } catch (bookError) {
      setError(bookError.response?.data?.error || 'Booking failed. The slot may no longer be available.')
      await loadTurfs()
    } finally {
      setSubmitting(false)
    }
  }

  const cancelBooking = async (booking) => {
    if (!window.confirm('Cancel this booking?')) return
    setError('')
    setNotice('')
    try {
      await API.patch(`/bookings/${booking.id}/cancel`)
      setNotice('Booking cancelled and the slot released.')
      await Promise.all([loadBookings(), loadTurfs()])
    } catch (cancelError) {
      setError(cancelError.response?.data?.error || 'Unable to cancel booking.')
    }
  }

  const handleReset = () => {
    setSport('')
    setDate('')
    setVenue(null)
    setSlotId('')
    setAreaSearch('')
    setError('')
    setStep(1)
  }

  return (
    <div className="sb-page">
      <Header />
      <div className="sb-scroll">
        <div className="sb-top-bar">
          <div>
            <h2 className="sb-main-title">Book a Turf</h2>
            <p className="sb-main-sub">Live availability · Secure booking</p>
          </div>
          <button className="sb-history-toggle" onClick={() => { setShowHistory((value) => !value); if (!showHistory) loadBookings() }}>
            {showHistory ? 'Hide' : 'History'}
          </button>
        </div>

        {error && <p className="sb-empty" role="alert">{error}</p>}
        {notice && <p className="sb-step-info" role="status">{notice}</p>}

        {showHistory && (
          <div className="sb-history-section">
            <p className="sb-history-title">My Bookings</p>
            {bookings.length === 0 ? <p className="sb-empty">No bookings found.</p> : bookings.map((booking) => (
              <div key={booking.id} className="sb-history-card">
                <div className="sb-hc-left">
                  <p className="sb-hc-venue">{booking.turf?.name || 'Turf'}</p>
                  <p className="sb-hc-meta">{booking.slot?.startTime ? `${dateLabel(booking.slot.startTime)} · ${timeLabel(booking.slot.startTime)}` : 'Time unavailable'}</p>
                </div>
                <div className="sb-hc-right">
                  <p className="sb-hc-price">₹{booking.turf?.pricePerHour ?? '—'}</p>
                  <span className="sb-hc-status">{booking.status}</span>
                  {booking.status === 'CONFIRMED' && booking.slot?.startTime && new Date(booking.slot.startTime) > new Date() && (
                    <button className="sb-outline-btn" onClick={() => cancelBooking(booking)}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="sb-step">
            <p className="sb-step-label">Select Sport</p>
            <div className="sb-sport-grid">
              {sports.map((item) => (
                <button key={item.name} className={`sb-sport-pill ${sport === item.name ? 'active' : ''}`} onClick={() => setSport(item.name)}>
                  <span className="sb-sport-icon">{item.icon}</span><span>{item.name}</span>
                </button>
              ))}
            </div>
            <p className="sb-step-label" style={{ marginTop: 16 }}>Search Area / Venue</p>
            <div className="sb-area-search">
              <input placeholder="Enter area, city, or turf name" value={areaSearch} onChange={(event) => setAreaSearch(event.target.value)} />
            </div>
            <p className="sb-step-label" style={{ marginTop: 20 }}>Select Date</p>
            <div className="sb-field">
              <input type="date" min={todayStr} value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <button className="sb-primary-btn" onClick={handleSearch} disabled={loading}>Search Turfs</button>
            <button className="sb-outline-btn" onClick={loadTurfs} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh availability'}</button>
            {turfs.length === 0 && !loading && <p className="sb-empty">No turf listings are available yet.</p>}
          </div>
        )}

        {step === 2 && (
          <div className="sb-step">
            <div className="sb-step-nav">
              <button className="sb-back-btn" onClick={() => setStep(1)}>← Back</button>
              <span className="sb-step-info">{filteredVenues.length} turfs found</span>
            </div>
            {filteredVenues.length === 0 ? <div className="sb-empty">No turfs with available slots match this search.</div> : filteredVenues.map((venue) => (
              <div key={venue.id} className="sb-venue-card">
                <div className="sb-venue-top">
                  <div className="sb-venue-icon">{venue.image}</div>
                  <div className="sb-venue-info">
                    <p className="sb-venue-name">{venue.name}</p>
                    <p className="sb-venue-city">Location: {venue.location}</p>
                    <p className="sb-reviews">{venue.slots.length} upcoming available slots</p>
                  </div>
                  <div className="sb-venue-price-wrap">
                    <span className="sb-venue-price">₹{venue.pricePerHour}</span>
                    <span className="sb-venue-per">/hour</span>
                  </div>
                </div>
                <button className="sb-select-btn" onClick={() => handleSelectVenue(venue)}>Choose a slot →</button>
              </div>
            ))}
          </div>
        )}

        {step === 3 && selectedVenue && (
          <div className="sb-step">
            <div className="sb-step-nav">
              <button className="sb-back-btn" onClick={() => setStep(2)}>← Back</button>
              <span className="sb-step-info">Select slot</span>
            </div>
            <div className="sb-selected-venue">
              <span className="sb-sv-icon">{selectedVenue.image}</span>
              <div>
                <p className="sb-sv-name">{selectedVenue.name}</p>
                <p className="sb-sv-meta">{selectedVenue.location} · ₹{selectedVenue.pricePerHour}/hour</p>
              </div>
            </div>
            <p className="sb-step-label">Available time slots · {date}</p>
            <div className="sb-slots">
              {availableSlots.length === 0 ? <p className="sb-empty">No slots available for this date. Go back and choose another date.</p> : availableSlots.map((availableSlot) => (
                <button key={availableSlot.id} className={`sb-slot ${slotId === availableSlot.id ? 'selected' : ''}`} onClick={() => setSlotId(availableSlot.id)}>
                  {timeLabel(availableSlot.startTime)}
                </button>
              ))}
            </div>
            <p className="sb-step-label" style={{ marginTop: 18 }}>Sport selected: {sport}</p>
            <div className="sb-price-summary">
              <div className="sb-ps-row"><span>Hourly price</span><span>₹{finalPrice}</span></div>
              <div className="sb-ps-divider" />
              <div className="sb-ps-row total"><span>Total (one-hour slot)</span><span>₹{finalPrice}</span></div>
            </div>
            <button className="sb-primary-btn" onClick={handleBook} disabled={!slotId || submitting}>
              {submitting ? 'Confirming…' : `Confirm Booking · ₹${finalPrice}`}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="sb-success-screen">
            <div className="sb-success-icon">✓</div>
            <h3 className="sb-success-title">Booking Confirmed!</h3>
            <p className="sb-success-sub">{notice || 'Your booking is saved.'}</p>
            <div className="sb-success-card">
              <div className="sb-sc-row"><span>Venue</span><span>{selectedVenue?.name}</span></div>
              <div className="sb-sc-row"><span>Sport</span><span>{sport}</span></div>
              <div className="sb-sc-row"><span>Date</span><span>{date}</span></div>
              <div className="sb-sc-row"><span>Slot</span><span>{selectedSlot ? timeLabel(selectedSlot.startTime) : 'Confirmed'}</span></div>
              <div className="sb-sc-row total"><span>Hourly price</span><span>₹{finalPrice}</span></div>
            </div>
            <div className="sb-success-actions">
              <button className="sb-outline-btn" onClick={() => { setShowHistory(true); handleReset(); loadBookings() }}>View History</button>
              <button className="sb-primary-btn" onClick={handleReset}>+ New Booking</button>
            </div>
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>
      <BottomNav />
    </div>
  )
}
