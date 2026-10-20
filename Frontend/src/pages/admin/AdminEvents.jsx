import { useState } from 'react'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminEvents.css'

const initialEvents = [
  {
    id: 1,
    name: 'City League U-17 Championship',
    sport: 'Football',
    startDate: '2026-03-15',
    endDate: '2026-03-17',
    time: '10:00 AM',
    locations: ['Rajiv Gandhi Stadium, Mumbai'],
    teams: [{ id: 1, name: 'Team Alpha', size: 11 }, { id: 2, name: 'Team Beta', size: 11 }],
    teamSize: 11,
    description: 'Annual city-level U-17 championship. All registered academy students eligible.',
    paymentRequired: true,
    qrPayment: true,
    perPlayer: 500,
    perTeam: 5000,
    edited: false,
  },
  {
    id: 2,
    name: 'Inter-Academy Friendly',
    sport: 'Football',
    startDate: '2026-03-22',
    endDate: '2026-03-22',
    time: '4:00 PM',
    locations: ['AcademyPro Ground, Pune'],
    teams: [{ id: 1, name: 'AcademyPro U-17', size: 7 }],
    teamSize: 7,
    description: 'Friendly match between AcademyPro and ProSport Academy.',
    paymentRequired: false,
    qrPayment: false,
    perPlayer: 0,
    perTeam: 0,
    edited: false,
  },
]

/* ── Academy students roster (admin can invite these) ── */
const ACADEMY_STUDENTS = [
  { id:1, name:'Aryan Mehta',   position:'CF',  batch:'Batch A', avatar:'AM' },
  { id:2, name:'Riya Sharma',   position:'LW',  batch:'Batch A', avatar:'RS' },
  { id:3, name:'Karan Patel',   position:'CM',  batch:'Batch B', avatar:'KP' },
  { id:4, name:'Priya Desai',   position:'RB',  batch:'Batch A', avatar:'PD' },
  { id:5, name:'Rohit Verma',   position:'GK',  batch:'Batch B', avatar:'RV' },
  { id:6, name:'Ananya Singh',  position:'CB',  batch:'Batch A', avatar:'AS' },
  { id:7, name:'Vikram Rao',    position:'ST',  batch:'Batch B', avatar:'VR' },
  { id:8, name:'Meera Nair',    position:'CAM', batch:'Batch A', avatar:'MN' },
]

export default function AdminEvents() {
  const [events, setEvents]     = useState(initialEvents)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [inviteEventId, setInviteEventId] = useState(null)
  const [inviteTeamName, setInviteTeamName] = useState('')
  const [inviteTeamSize, setInviteTeamSize] = useState('')
  const [showPlayerInvite, setShowPlayerInvite] = useState(null) // event id
  const [invitedPlayers, setInvitedPlayers] = useState({})       // { eventId: [studentId, ...] }
  const [inviteToast, setInviteToast] = useState(null)

  const [form, setForm] = useState({
    name: '', sport: '', startDate: '', endDate: '', time: '',
    locations: [''], teamSize: '', description: '',
    paymentRequired: false, qrPayment: false, perPlayer: '', perTeam: '',
  })

  function resetForm() {
    setForm({
      name: '', sport: '', startDate: '', endDate: '', time: '',
      locations: [''], teamSize: '', description: '',
      paymentRequired: false, qrPayment: false, perPlayer: '', perTeam: '',
    })
    setEditId(null)
  }

  function openEdit(ev) {
    if (ev.edited) return
    setForm({
      name: ev.name, sport: ev.sport, startDate: ev.startDate, endDate: ev.endDate,
      time: ev.time, locations: [...ev.locations], teamSize: String(ev.teamSize),
      description: ev.description, paymentRequired: ev.paymentRequired,
      qrPayment: ev.qrPayment, perPlayer: String(ev.perPlayer), perTeam: String(ev.perTeam),
    })
    setEditId(ev.id)
    setShowCreate(true)
  }

  function saveEvent() {
    if (!form.name || !form.sport) return
    if (editId) {
      setEvents(prev => prev.map(ev =>
        ev.id === editId
          ? { ...ev, ...form, teamSize: +form.teamSize, perPlayer: +form.perPlayer, perTeam: +form.perTeam, edited: true }
          : ev
      ))
    } else {
      setEvents(prev => [...prev, {
        id: Date.now(), ...form,
        teamSize: +form.teamSize, perPlayer: +form.perPlayer, perTeam: +form.perTeam,
        teams: [], edited: false,
      }])
    }
    setShowCreate(false)
    resetForm()
  }

  function addLocation() {
    setForm(p => ({ ...p, locations: [...p.locations, ''] }))
  }

  function updateLocation(i, val) {
    setForm(p => {
      const locs = [...p.locations]
      locs[i] = val
      return { ...p, locations: locs }
    })
  }

  function inviteTeam(eventId) {
    if (!inviteTeamName) return
    setEvents(prev => prev.map(ev =>
      ev.id === eventId
        ? { ...ev, teams: [...ev.teams, { id: Date.now(), name: inviteTeamName, size: +inviteTeamSize || ev.teamSize }] }
        : ev
    ))
    setInviteTeamName('')
    setInviteTeamSize('')
    setInviteEventId(null)
  }

  function togglePlayerInvite(eventId, studentId) {
    setInvitedPlayers(p => {
      const existing = p[eventId] || []
      const has = existing.includes(studentId)
      return { ...p, [eventId]: has ? existing.filter(id => id !== studentId) : [...existing, studentId] }
    })
  }

  function sendPlayerInvites(eventId) {
    const count = (invitedPlayers[eventId] || []).length
    if (!count) return
    setInviteToast(`✓ ${count} player${count > 1 ? 's' : ''} invited successfully!`)
    setTimeout(() => { setInviteToast(null) }, 2500)
    setShowPlayerInvite(null)
  }

  function removeTeam(eventId, teamId) {
    setEvents(prev => prev.map(ev =>
      ev.id === eventId ? { ...ev, teams: ev.teams.filter(t => t.id !== teamId) } : ev
    ))
  }

  return (
    <div className="adm-evt-page">
      {inviteToast && <div className="adm-invite-toast">{inviteToast}</div>}
      <AdminHeader />
      <div className="adm-evt-scroll">

        <div className="adm-evt-toprow">
          <div>
            <h2 className="adm-evt-title">Event Management</h2>
            <div className="adm-evt-sub">{events.length} events scheduled</div>
          </div>
          <button className="adm-evt-create-btn" onClick={() => { resetForm(); setShowCreate(p => !p) }}>
            {showCreate && !editId ? '✕' : '+ Create Event'}
          </button>
        </div>

        {/* ── Create / Edit Form ── */}
        {showCreate && (
          <div className="adm-evt-form-card">
            <div className="adm-evt-form-header">
              <span>{editId ? 'Edit Event' : 'New Event'}</span>
              <button className="adm-evt-form-close" onClick={() => { setShowCreate(false); resetForm() }}>✕</button>
            </div>

            <div className="adm-form-field">
              <label>Event Name</label>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Summer Cup 2026" />
            </div>

            <div className="adm-form-row">
              <div className="adm-form-field">
                <label>Sport</label>
                <input value={form.sport} onChange={e=>setForm(p=>({...p,sport:e.target.value}))} placeholder="Football" />
              </div>
              <div className="adm-form-field">
                <label>Team Size</label>
                <input type="number" value={form.teamSize} onChange={e=>setForm(p=>({...p,teamSize:e.target.value}))} placeholder="11" />
              </div>
            </div>

            <div className="adm-form-row">
              <div className="adm-form-field">
                <label>Start Date</label>
                <input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} />
              </div>
              <div className="adm-form-field">
                <label>End Date</label>
                <input type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} />
              </div>
            </div>

            <div className="adm-form-row">
              <div className="adm-form-field">
                <label>Time</label>
                <input value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} placeholder="e.g. 10:00 AM" />
              </div>
            </div>

            {/* Multiple locations */}
            <div className="adm-form-field">
              <label>Locations</label>
              {form.locations.map((loc, i) => (
                <input
                  key={i}
                  value={loc}
                  onChange={e=>updateLocation(i,e.target.value)}
                  placeholder={`Location ${i+1}`}
                  style={{ marginBottom: i < form.locations.length-1 ? 6 : 0 }}
                />
              ))}
              <button className="adm-add-loc-btn" onClick={addLocation}>+ Add Location</button>
            </div>

            <div className="adm-form-field">
              <label>Description</label>
              <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Event description..." rows={2} />
            </div>

            {/* Payment */}
            <div className="adm-evt-checks">
              <label className="adm-check-label">
                <input type="checkbox" checked={form.paymentRequired}
                  onChange={e=>setForm(p=>({...p,paymentRequired:e.target.checked}))} />
                Payment Required
              </label>
              <label className="adm-check-label">
                <input type="checkbox" checked={form.qrPayment}
                  onChange={e=>setForm(p=>({...p,qrPayment:e.target.checked}))} />
                QR Payment
              </label>
            </div>

            {form.paymentRequired && (
              <div className="adm-form-row">
                <div className="adm-form-field">
                  <label>Per Player (₹)</label>
                  <input type="number" value={form.perPlayer} onChange={e=>setForm(p=>({...p,perPlayer:e.target.value}))} placeholder="500" />
                </div>
                <div className="adm-form-field">
                  <label>Per Team (₹)</label>
                  <input type="number" value={form.perTeam} onChange={e=>setForm(p=>({...p,perTeam:e.target.value}))} placeholder="5000" />
                </div>
              </div>
            )}

            {editId && (
              <div className="adm-edit-warning">
                ⚠ This event can only be edited once. After saving, only team invitations can be changed.
              </div>
            )}

            <div className="adm-form-actions">
              <button className="adm-form-save" onClick={saveEvent}>
                ✓ {editId ? 'Save Changes' : 'Create Event'}
              </button>
              <button className="adm-form-cancel" onClick={() => { setShowCreate(false); resetForm() }}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── Event cards ── */}
        {events.map(ev => (
          <div key={ev.id} className="adm-evt-card">
            <div className="adm-evt-card-header">
              <div>
                <div className="adm-evt-card-name">{ev.name}</div>
                <div className="adm-evt-tags">
                  <span className="adm-evt-sport-tag">{ev.sport}</span>
                  {ev.qrPayment && <span className="adm-evt-qr-tag">◻ QR Pay</span>}
                  {ev.edited && <span className="adm-evt-locked-tag">🔒 Locked</span>}
                </div>
              </div>
              <button
                className={`adm-evt-edit-btn ${ev.edited ? 'adm-evt-edit-disabled' : ''}`}
                onClick={() => openEdit(ev)}
                disabled={ev.edited}
                title={ev.edited ? 'Event can only be edited once' : 'Edit event'}
              >
                {ev.edited ? '🔒 Locked' : '✏ Edit'}
              </button>
            </div>

            <div className="adm-evt-details">
              <div className="adm-evt-detail-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{ev.startDate === ev.endDate ? ev.startDate : `${ev.startDate} – ${ev.endDate}`} · {ev.time}</span>
              </div>
              {ev.locations.map((loc, i) => (
                <div key={i} className="adm-evt-detail-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{loc}</span>
                </div>
              ))}
              <div className="adm-evt-detail-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Team Size: {ev.teamSize}</span>
              </div>
              {ev.paymentRequired && (
                <div className="adm-evt-detail-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  <span>₹{ev.perPlayer}/player · ₹{ev.perTeam}/team</span>
                </div>
              )}
            </div>

            {/* Teams */}
            <div className="adm-evt-teams">
              <div className="adm-evt-teams-label">Teams ({ev.teams.length})</div>
              <div className="adm-evt-teams-row">
                {ev.teams.map(t => (
                  <div key={t.id} className="adm-evt-team-chip">
                    {t.name}
                    <button className="adm-team-remove" onClick={() => removeTeam(ev.id, t.id)}>✕</button>
                  </div>
                ))}
                <button className="adm-evt-invite-btn" onClick={() => setInviteEventId(inviteEventId === ev.id ? null : ev.id)}>
                  + Invite Team
                </button>
              </div>
              {inviteEventId === ev.id && (
                <div className="adm-invite-form">
                  <div className="adm-form-row">
                    <div className="adm-form-field">
                      <label>Team Name</label>
                      <input value={inviteTeamName} onChange={e=>setInviteTeamName(e.target.value)} placeholder="e.g. ProSport U-17" />
                    </div>
                    <div className="adm-form-field">
                      <label>Team Size</label>
                      <input type="number" value={inviteTeamSize} onChange={e=>setInviteTeamSize(e.target.value)} placeholder={String(ev.teamSize)} />
                    </div>
                  </div>
                  <div className="adm-form-actions">
                    <button className="adm-form-save" onClick={() => inviteTeam(ev.id)}>✓ Send Invite</button>
                    <button className="adm-form-cancel" onClick={() => setInviteEventId(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {/* ── Invite Individual Players ── */}
              <button className="adm-evt-invite-player-btn" onClick={() => setShowPlayerInvite(showPlayerInvite === ev.id ? null : ev.id)}>
                👤 Invite Players ({(invitedPlayers[ev.id] || []).length} selected)
              </button>
              {showPlayerInvite === ev.id && (
                <div className="adm-player-invite-panel">
                  <p className="adm-player-invite-hd">Select students to invite</p>
                  <div className="adm-player-invite-list">
                    {ACADEMY_STUDENTS.map(s => {
                      const isSelected = (invitedPlayers[ev.id] || []).includes(s.id)
                      return (
                        <div key={s.id} className={`adm-player-inv-row ${isSelected ? 'selected' : ''}`} onClick={() => togglePlayerInvite(ev.id, s.id)}>
                          <div className="adm-pi-avatar">{s.avatar}</div>
                          <div className="adm-pi-info">
                            <span className="adm-pi-name">{s.name}</span>
                            <span className="adm-pi-meta">{s.position} · {s.batch}</span>
                          </div>
                          <div className={`adm-pi-check ${isSelected ? 'checked' : ''}`}>
                            {isSelected ? '✓' : ''}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="adm-form-actions">
                    <button className="adm-form-save" onClick={() => sendPlayerInvites(ev.id)}>
                      ✓ Send to {(invitedPlayers[ev.id] || []).length} Players
                    </button>
                    <button className="adm-form-cancel" onClick={() => setShowPlayerInvite(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div className="adm-evt-desc">{ev.description}</div>
          </div>
        ))}

        <div style={{ height: 80 }} />
      </div>
      <AdminBottomNav />
    </div>
  )
}
