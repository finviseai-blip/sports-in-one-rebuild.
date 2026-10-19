import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import BottomNav from '../../components/BottomNav'
import './StudentProfile.css'

export default function StudentProfile() {
  const navigate    = useNavigate()
  const { user, logout } = useAuth()
  const fileRef     = useRef(null)

  const [editing, setEditing]   = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [notifOn, setNotifOn]   = useState(true)
  const [autoPay, setAutoPay]   = useState(true)
  const [avatarSrc, setAvatar]  = useState(null)   // null = initials
  const [toast, setToast]       = useState(null)   // { msg, type }
  const [showCancelModal, setCancelModal] = useState(false)
  const [subCancelled, setSubCancelled]  = useState(false)

  const [form, setForm] = useState({
    name:  user?.name  || 'Marcus Silva',
    email: user?.email || 'marcus.silva@mail.com',
    phone: user?.phone || '+91 98765 43210',
    dob:   user?.dob   || '2009-03-15',
    batch: user?.batch || 'Batch A · U-17',
  })
  const [savedForm, setSavedForm] = useState({ ...form })

  /* ── helpers ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const handleSave = () => {
    setSavedForm({ ...form })
    setEditing(false)
    showToast('Profile updated successfully ✓')
  }

  const handleCancel = () => {
    setForm({ ...savedForm })
    setEditing(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return }
    if (file.size > 5 * 1024 * 1024)    { showToast('Image must be under 5 MB', 'error'); return }
    const reader = new FileReader()
    reader.onload = ev => { setAvatar(ev.target.result); showToast('Profile photo updated ✓') }
    reader.readAsDataURL(file)
  }

  const handleTheme = () => {
    setDarkMode(p => !p)
    showToast(darkMode ? 'Switched to Light Mode ☀️' : 'Switched to Dark Mode 🌙', 'info')
  }

  const handleNotif = () => {
    setNotifOn(p => {
      showToast(notifOn ? 'Notifications disabled 🔕' : 'Notifications enabled 🔔', 'info')
      return !p
    })
  }

  const handleCancelSub = () => {
    setSubCancelled(true)
    setCancelModal(false)
    showToast('Subscription cancelled. Active till Apr 30.', 'error')
  }

  const handleLogout = () => { logout(); navigate('/role') }

  const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`spro-page ${darkMode ? 'theme-dark' : 'theme-light'}`}>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`spro-toast spro-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── CANCEL MODAL ── */}
      {showCancelModal && (
        <div className="spro-modal-overlay" onClick={() => setCancelModal(false)}>
          <div className="spro-modal" onClick={e => e.stopPropagation()}>
            <div className="spro-modal-icon">⚠️</div>
            <h3>Cancel Subscription?</h3>
            <p>Your academy access will end on Apr 30, 2026. This cannot be undone.</p>
            <div className="spro-modal-actions">
              <button className="spro-modal-keep" onClick={() => setCancelModal(false)}>Keep Plan</button>
              <button className="spro-modal-confirm" onClick={handleCancelSub}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="spro-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)} className="spro-back-btn">←</button>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Profile</h2>
        </div>
        {!editing ? (
          <button className="spro-edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="spro-edit-btn cancel" onClick={handleCancel}>✕</button>
            <button className="spro-edit-btn save"   onClick={handleSave}>✓ Save</button>
          </div>
        )}
      </div>

      <div className="spro-scroll">

        {/* ── AVATAR ── */}
        <div className="spro-avatar-section">
          <div className="spro-avatar-wrap">
            <div className="spro-avatar" onClick={() => editing && fileRef.current?.click()}>
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="spro-avatar-img" />
                : <span>{initials}</span>
              }
              {editing && (
                <div className="spro-avatar-overlay">
                  <span>📷</span>
                </div>
              )}
            </div>
            {editing && (
              <button className="spro-cam" onClick={() => fileRef.current?.click()}>📷</button>
            )}
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handleImageChange}
            />
          </div>
          <p className="spro-name">{savedForm.name}</p>
          <p className="spro-batch">{savedForm.batch}</p>
          <div className="spro-badge">🏅 Active Student</div>
        </div>

        {/* ── PERSONAL INFO ── */}
        <p className="spro-section-label">PERSONAL INFO</p>
        <div className="spro-card">
          {[
            { key: 'name',  label: 'Full Name',     type: 'text',  icon: '👤' },
            { key: 'email', label: 'Email',          type: 'email', icon: '✉️' },
            { key: 'phone', label: 'Phone',          type: 'text',  icon: '📱' },
            { key: 'dob',   label: 'Date of Birth',  type: 'date',  icon: '🎂' },
            { key: 'batch', label: 'Batch Info',     type: 'text',  icon: '🏟️' },
          ].map(({ key, label, type, icon }) => (
            <div key={key} className="spro-field">
              <label>{icon} &nbsp;{label}</label>
              {editing ? (
                <input
                  type={type} value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                />
              ) : (
                <p className="spro-val">{form[key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── PREFERENCES ── */}
        <p className="spro-section-label">PREFERENCES</p>
        <div className="spro-card">

          <div className="spro-pref-row">
            <div className="spro-pref-left">
              <span>{darkMode ? '🌙' : '☀️'}</span>
              <div>
                <p>Theme</p>
                <p className="spro-pref-sub">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <div className={`spro-toggle ${darkMode ? 'on' : ''}`} onClick={handleTheme}>
              <div className="spro-toggle-knob" />
            </div>
          </div>

          <div className="spro-pref-row">
            <div className="spro-pref-left">
              <span>{notifOn ? '🔔' : '🔕'}</span>
              <div>
                <p>Notifications</p>
                <p className="spro-pref-sub">{notifOn ? 'Push & in-app enabled' : 'All notifications muted'}</p>
              </div>
            </div>
            <div className={`spro-toggle ${notifOn ? 'on' : ''}`} onClick={handleNotif}>
              <div className="spro-toggle-knob" />
            </div>
          </div>

        </div>

        {/* ── ACADEMY SUBSCRIPTION ── */}
        <p className="spro-section-label">ACADEMY SUBSCRIPTION</p>
        <div className="spro-card">
          <div className="spro-sub-row">
            <div>
              <p style={{ fontWeight: 600 }}>Monthly Fee</p>
              <p className="spro-pref-sub">
                {subCancelled ? '⚠️ Cancelled · Active till Apr 30' : 'Next due: Apr 1 2026'}
              </p>
            </div>
            <p className={`spro-sub-amount ${subCancelled ? 'cancelled' : ''}`}>₹2,500/mo</p>
          </div>

          <div className="spro-pref-row">
            <div className="spro-pref-left">
              <span>💳</span>
              <div>
                <p>Autopay</p>
                <p className="spro-pref-sub">
                  {autoPay ? 'Auto-debit on 1st of month' : 'Manual payment required'}
                </p>
              </div>
            </div>
            <div className={`spro-toggle ${autoPay ? 'on' : ''}`} onClick={() => {
              setAutoPay(p => !p)
              showToast(autoPay ? 'Autopay disabled' : 'Autopay enabled ✓', 'info')
            }}>
              <div className="spro-toggle-knob" />
            </div>
          </div>

          {!subCancelled ? (
            <button className="spro-cancel-sub" onClick={() => setCancelModal(true)}>
              Cancel Subscription
            </button>
          ) : (
            <button className="spro-renew-sub" onClick={() => {
              setSubCancelled(false)
              showToast('Subscription renewed ✓')
            }}>
              🔄 Renew Subscription
            </button>
          )}
        </div>

        {/* ── PLATFORM SUBSCRIPTION ── */}
        <p className="spro-section-label">PLATFORM SUBSCRIPTION</p>
        <div className="spro-card">
          <div className="spro-platform-rows">
            <div className="spro-pr"><span>Base Plan</span><span>₹19/mo</span></div>
            <div className="spro-pr"><span>AI Features</span><span>₹5/mo</span></div>
            <div className="spro-pr"><span>Booking Convenience</span><span>₹5/mo</span></div>
            <div className="spro-pr total"><span>Total</span><span className="accent">₹29/mo</span></div>
          </div>
          <p className="spro-tx-title">Transaction History</p>
          {[
            ['Platform Fee - March 2026', '₹29', 'Mar 1'],
            ['Platform Fee - Feb 2026',   '₹29', 'Feb 1'],
            ['Platform Fee - Jan 2026',   '₹29', 'Jan 1'],
          ].map(([label, amt, date], i) => (
            <div key={i} className="spro-tx-row">
              <span>🟡 {label}</span>
              <span>{amt} · {date}</span>
            </div>
          ))}
        </div>

        {/* ── SIGN OUT ── */}
        <button className="spro-signout" onClick={handleLogout}>← Sign Out</button>

        <div style={{ height: 80 }} />
      </div>

      <BottomNav />
    </div>
  )
}