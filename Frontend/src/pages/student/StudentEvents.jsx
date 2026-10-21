import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import API from '../../api/api'
import './StudentEvents.css'

function formatDate(value) {
  if (!value) return 'Date to be announced'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date to be announced'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function mapEvent(event, registrationStatus) {
  return {
    ...event,
    name: event.title,
    type: 'Sports event',
    date: formatDate(event.date),
    venue: event.location || 'Venue to be announced',
    desc: event.description || 'Event details will be announced by the organizer.',
    fee: 0,
    joined: registrationStatus === 'ACCEPTED',
    registrationStatus: registrationStatus || null,
  }
}

export default function StudentEvents() {
  const [mainTab, setMainTab] = useState('available')
  const [filterTab, setFilterTab] = useState('All Events')
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joiningId, setJoiningId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [eventResponse, registrationResponse] = await Promise.all([
        API.get('/events'),
        API.get('/events/mine'),
      ])
      const registrationRows = registrationResponse.data?.events || []
      setRegistrations(registrationRows.map((event) => mapEvent(event, event.registrationStatus)))
      const statusById = new Map(registrationRows.map((event) => [event.id, event.registrationStatus]))
      const eventRows = Array.isArray(eventResponse.data) ? eventResponse.data : []
      setEvents(eventRows.map((event) => mapEvent(event, statusById.get(event.id))))
    } catch (loadError) {
      setError(loadError.response?.data?.error || loadError.response?.data?.message || 'Unable to load events. Check your connection and sign in again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const myEvents = useMemo(
    () => registrations.filter((event) => event.registrationStatus === 'ACCEPTED'),
    [registrations]
  )

  const pendingInvites = useMemo(
    () => registrations.filter((event) => event.registrationStatus === 'PENDING'),
    [registrations]
  )

  const filtered = useMemo(() => events.filter((event) => {
    if (filterTab === 'Free') return true
    if (filterTab === 'Paid') return false
    if (filterTab === 'Joined') return event.joined
    return true
  }), [events, filterTab])

  const openEvent = (event) => {
    setSelectedEvent(event)
    setNotice('')
  }

  const closeEvent = () => setSelectedEvent(null)

  const handleJoin = async () => {
    if (!selectedEvent || selectedEvent.joined || joiningId) return
    setJoiningId(selectedEvent.id)
    setError('')
    setNotice('')
    try {
      await API.post(`/events/${selectedEvent.id}/register`)
      setNotice('Your registration has been saved.')
      setSelectedEvent({ ...selectedEvent, joined: true, registrationStatus: 'ACCEPTED' })
      await loadEvents()
    } catch (joinError) {
      setError(joinError.response?.data?.error || joinError.response?.data?.message || 'Unable to register for this event.')
    } finally {
      setJoiningId(null)
    }
  }

  const updateInvite = async (event, status) => {
    setError('')
    setNotice('')
    try {
      await API.patch(`/events/${event.id}/registration`, { status })
      setNotice(status === 'ACCEPTED' ? 'Invitation accepted.' : 'Invitation declined.')
      await loadEvents()
    } catch (updateError) {
      setError(updateError.response?.data?.error || 'Unable to update this invitation.')
    }
  }

  return (
    <div className="se-page">
      <Header />

      {selectedEvent && (
        <div className="se-modal-overlay" onClick={closeEvent}>
          <div className="se-modal" onClick={(event) => event.stopPropagation()}>
            <div className="se-modal-header">
              <button className="se-modal-close" onClick={closeEvent} aria-label="Close event details">✕</button>
              <h3 className="se-modal-title">{selectedEvent.name}</h3>
              <span className="se-ev-type">{selectedEvent.type}</span>
            </div>
            <div className="se-modal-body">
              <div className="se-modal-info">
                <div className="se-info-row"><span>📅</span><span>{selectedEvent.date}</span></div>
                <div className="se-info-row"><span>📍</span><span>{selectedEvent.venue}</span></div>
              </div>
              <p className="se-modal-desc">{selectedEvent.desc}</p>
              <div className="se-fee-row">
                <span className="se-fee-label">Registration</span>
                <span className="se-fee-val free">Free to register</span>
              </div>
              {selectedEvent.joined ? (
                <div className="se-already-joined">✓ You are registered for this event</div>
              ) : (
                <button className="se-modal-join-btn" onClick={handleJoin} disabled={joiningId === selectedEvent.id}>
                  {joiningId === selectedEvent.id ? 'Registering…' : 'Register for Event'}
                </button>
              )}
              {notice && <p role="status" className="se-confirmed-sub">{notice}</p>}
              {error && <p role="alert" className="se-confirmed-sub">{error}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="se-scroll">
        {error && <p role="alert" className="se-confirmed-sub">{error}</p>}
        {notice && !selectedEvent && <p role="status" className="se-confirmed-sub">{notice}</p>}

        <div className="se-main-tabs">
          <button className={mainTab === 'my' ? 'active' : ''} onClick={() => setMainTab('my')}>
            My Events {pendingInvites.length > 0 && <span className="se-inv-dot">{pendingInvites.length}</span>}
          </button>
          <button className={mainTab === 'available' ? 'active' : ''} onClick={() => setMainTab('available')}>
            Available ({events.length})
          </button>
        </div>

        {loading ? (
          <p className="se-sub-title" role="status">Loading events…</p>
        ) : mainTab === 'available' ? (
          <>
            <p className="se-sub-title">Upcoming academy events & tournaments</p>
            <div className="se-filter-tabs">
              {['All Events', 'Free', 'Paid', 'Joined'].map((filter) => (
                <button key={filter} className={filterTab === filter ? 'active' : ''} onClick={() => setFilterTab(filter)}>{filter}</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="se-empty-state">
                <span>🏆</span>
                <p>No events to show yet</p>
                <p className="se-empty-sub">New events published by coaches will appear here.</p>
              </div>
            ) : (
              <div className="se-event-list">
                {filtered.map((event) => (
                  <div key={event.id} className="se-event-card" role="button" tabIndex={0} onClick={() => openEvent(event)} onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter' || keyEvent.key === ' ') openEvent(event) }}>
                    <p className="se-ev-name">{event.name}</p>
                    <span className="se-ev-type">{event.type}</span>
                    <div className="se-ev-details">
                      <p>📅 {event.date}</p>
                      <p>📍 {event.venue}</p>
                    </div>
                    <div className="se-ev-footer">
                      <span className="se-ev-fee free">Free registration</span>
                      {event.joined
                        ? <span className="se-joined-badge">✓ Registered</span>
                        : <button className="se-join-btn" onClick={(clickEvent) => { clickEvent.stopPropagation(); openEvent(event) }}>Register</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="se-my-events">
            {pendingInvites.length > 0 && (
              <div className="se-invites-section">
                <p className="se-invites-hd">Invitations ({pendingInvites.length})</p>
                {pendingInvites.map((event) => (
                  <div key={event.id} className="se-invite-card">
                    <p className="se-invite-event">{event.name}</p>
                    <div className="se-invite-meta">
                      <span>📅 {event.date}</span>
                      <span>📍 {event.venue}</span>
                    </div>
                    <p className="se-invite-msg">{event.desc}</p>
                    <div className="se-invite-actions">
                      <button className="se-inv-accept" onClick={() => updateInvite(event, 'ACCEPTED')}>✓ Accept</button>
                      <button className="se-inv-decline" onClick={() => updateInvite(event, 'DECLINED')}>✕ Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {myEvents.length === 0 && pendingInvites.length === 0 ? (
              <div className="se-empty-state">
                <span>🏆</span>
                <p>No events registered yet</p>
                <p className="se-empty-sub">Browse available events to register.</p>
              </div>
            ) : myEvents.length > 0 && (
              <>
                <p className="se-invites-hd">Registered Events ({myEvents.length})</p>
                {myEvents.map((event) => (
                  <div key={event.id} className="se-event-card" onClick={() => openEvent(event)}>
                    <p className="se-ev-name">{event.name}</p>
                    <span className="se-ev-type">{event.type}</span>
                    <div className="se-ev-details">
                      <p>📅 {event.date}</p>
                      <p>📍 {event.venue}</p>
                    </div>
                    <div className="se-ev-footer">
                      <span className="se-ev-fee free">Free registration</span>
                      <span className="se-joined-badge">✓ Registered</span>
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
