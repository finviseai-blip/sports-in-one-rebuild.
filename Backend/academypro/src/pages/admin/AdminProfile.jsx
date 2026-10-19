import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminProfile.css'

export default function AdminProfile() {
  const navigate  = useNavigate()
  const fileRef   = useRef(null)

  const [editing, setEditing]   = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [notifOn, setNotifOn]   = useState(true)
  const [autoPay, setAutoPay]   = useState(true)
  const [avatarSrc, setAvatar]  = useState(null)
  const [toast, setToast]       = useState(null)
  const [showCancelModal, setCancelModal] = useState(false)
  const [subCancelled, setSubCancelled]  = useState(false)

  const [form, setForm] = useState({
    name:     'Srushti Patil',
    email:    'srushti.admin@academypro.com',
    phone:    '+91 98765 43210',
    academy:  'Elite Sports Academy',
    role:     'Head Coach / Admin',
  })
  const [savedForm, setSavedForm] = useState({ ...form })

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

  const handleCancelSub = () => {
    setSubCancelled(true)
    setCancelModal(false)
    showToast('Subscription cancelled. Active till Apr 30.', 'error')
  }

  const handleLogout = () => navigate('/role')

  const initials = savedForm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`apro-page ${darkMode ? 'theme-dark' : 'theme-light'}`}>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`apro-toast apro-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── CANCEL MODAL ── */}
      {showCancelModal && (
        <div className="apro-modal-overlay" onClick={() => setCancelModal(false)}>
          <div className="apro-modal" onClick={e => e.stopPropagation()}>
            <div className="apro-modal-icon">⚠️</div>
            <h3>Cancel Subscription?</h3>
            <p>Your academy admin access will end on Apr 30, 2026. This cannot be undone.</p>
            <div className="apro-modal-actions">
              <button className="apro-modal-keep" onClick={() => setCancelModal(false)}>Keep Plan</button>
              <button className="apro-modal-confirm" onClick={handleCancelSub}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="apro-header">
        <div className="apro-header-left">
          <button onClick={() => navigate(-1)} className="apro-back-btn">←</button>
          <h2>Profile</h2>
        </div>
        {!editing ? (
          <button className="apro-edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
        ) : (
          <div className="apro-header-edit-actions">
            <button className="apro-edit-btn cancel" onClick={handleCancel}>✕</button>
            <button className="apro-edit-btn save"   onClick={handleSave}>✓ Save</button>
          </div>
        )}
      </div>

      <div className="apro-scroll">

        {/* ── AVATAR ── */}
        <div className="apro-avatar-section">
          <div className="apro-avatar-wrap">
            <div className="apro-avatar" onClick={() => editing && fileRef.current?.click()}>
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="apro-avatar-img" />
                : <span>{initials}</span>
              }
              {editing && <div className="apro-avatar-overlay"><span>📷</span></div>}
            </div>
            {editing && (
              <button className="apro-cam" onClick={() => fileRef.current?.click()}>📷</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>
          <p className="apro-name">{savedForm.name}</p>
          <p className="apro-role">{savedForm.role}</p>
          <div className="apro-badge">🛡️ Admin / Coach</div>
        </div>

        {/* ── PERSONAL INFO ── */}
        <p className="apro-section-label">PERSONAL INFO</p>
        <div className="apro-card">
          {[
            { key: 'name',    label: 'Full Name',     type: 'text',  icon: '👤' },
            { key: 'email',   label: 'Email',          type: 'email', icon: '✉️' },
            { key: 'phone',   label: 'Phone',          type: 'text',  icon: '📱' },
            { key: 'academy', label: 'Academy Name',   type: 'text',  icon: '🏟️' },
            { key: 'role',    label: 'Role',            type: 'text',  icon: '🛡️' },
          ].map(({ key, label, type, icon }) => (
            <div key={key} className="apro-field">
              <label>{icon} &nbsp;{label}</label>
              {editing ? (
                <input
                  type={type} value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                />
              ) : (
                <p className="apro-val">{form[key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── PREFERENCES ── */}
        <p className="apro-section-label">PREFERENCES</p>
        <div className="apro-card">
          <div className="apro-pref-row">
            <div className="apro-pref-left">
              <span>{darkMode ? '🌙' : '☀️'}</span>
              <div>
                <p>Theme</p>
                <p className="apro-pref-sub">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <div className={`apro-toggle ${darkMode ? 'on' : ''}`} onClick={() => {
              setDarkMode(p => !p)
              showToast(darkMode ? 'Switched to Light Mode ☀️' : 'Switched to Dark Mode 🌙', 'info')
            }}>
              <div className="apro-toggle-knob" />
            </div>
          </div>
          <div className="apro-pref-row">
            <div className="apro-pref-left">
              <span>{notifOn ? '🔔' : '🔕'}</span>
              <div>
                <p>Notifications</p>
                <p className="apro-pref-sub">{notifOn ? 'Push & in-app enabled' : 'All notifications muted'}</p>
              </div>
            </div>
            <div className={`apro-toggle ${notifOn ? 'on' : ''}`} onClick={() => {
              setNotifOn(p => !p)
              showToast(notifOn ? 'Notifications disabled 🔕' : 'Notifications enabled 🔔', 'info')
            }}>
              <div className="apro-toggle-knob" />
            </div>
          </div>
        </div>

        {/* ── ACADEMY SUBSCRIPTION ── */}
        <p className="apro-section-label">ACADEMY SUBSCRIPTION</p>
        <div className="apro-card">
          <div className="apro-sub-row">
            <div>
              <p className="apro-sub-plan-name">Admin Pro Plan</p>
              <p className="apro-pref-sub">
                {subCancelled ? '⚠️ Cancelled · Active till Apr 30' : 'Next due: Apr 1 2026'}
              </p>
            </div>
            <p className={`apro-sub-amount ${subCancelled ? 'cancelled' : ''}`}>₹4,999/mo</p>
          </div>
          <div className="apro-sub-features">
            <span>✓ Unlimited students</span>
            <span>✓ AI features</span>
            <span>✓ Event management</span>
            <span>✓ Revenue analytics</span>
          </div>
          <div className="apro-pref-row">
            <div className="apro-pref-left">
              <span>💳</span>
              <div>
                <p>Autopay</p>
                <p className="apro-pref-sub">
                  {autoPay ? 'Auto-debit on 1st of month' : 'Manual payment required'}
                </p>
              </div>
            </div>
            <div className={`apro-toggle ${autoPay ? 'on' : ''}`} onClick={() => {
              setAutoPay(p => !p)
              showToast(autoPay ? 'Autopay disabled' : 'Autopay enabled ✓', 'info')
            }}>
              <div className="apro-toggle-knob" />
            </div>
          </div>
          {!subCancelled ? (
            <button className="apro-cancel-sub" onClick={() => setCancelModal(true)}>
              Cancel Subscription
            </button>
          ) : (
            <button className="apro-renew-sub" onClick={() => {
              setSubCancelled(false)
              showToast('Subscription renewed ✓')
            }}>
              🔄 Renew Subscription
            </button>
          )}
        </div>

        {/* ── PLATFORM SUBSCRIPTION (how app owners earn) ── */}
        <p className="apro-section-label">PLATFORM SUBSCRIPTION</p>
        <div className="apro-card">
          <p className="apro-platform-note">
            AcademyPro charges a platform fee from each user — similar to how Swiggy/Zomato add convenience charges. This is how we generate income as app owners.
          </p>
          <div className="apro-platform-rows">
            <div className="apro-pr"><span>Admin Base Plan</span><span>₹49/mo</span></div>
            <div className="apro-pr"><span>AI Analytics</span><span>₹15/mo</span></div>
            <div className="apro-pr"><span>Booking Convenience</span><span>₹10/mo</span></div>
            <div className="apro-pr"><span>Event Hosting Fee</span><span>₹25/mo</span></div>
            <div className="apro-pr total"><span>Total</span><span className="accent">₹99/mo</span></div>
          </div>
          <p className="apro-tx-title">Transaction History</p>
          {[
            ['Platform Fee – March 2026', '₹99', 'Mar 1'],
            ['Platform Fee – Feb 2026',   '₹99', 'Feb 1'],
            ['Platform Fee – Jan 2026',   '₹99', 'Jan 1'],
          ].map(([label, amt, date], i) => (
            <div key={i} className="apro-tx-row">
              <span>🟡 {label}</span>
              <span>{amt} · {date}</span>
            </div>
          ))}
        </div>

        {/* ── SIGN OUT ── */}
        <button className="apro-signout" onClick={handleLogout}>← Sign Out</button>

        <div style={{ height: 80 }} />
      </div>

      <AdminBottomNav />
    </div>
  )
}
