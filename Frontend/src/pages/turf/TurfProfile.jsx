import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import TurfBottomNav from '../../components/TurfBottomNav'
import './TurfProfile.css'

export default function TurfProfile() {
  const navigate = useNavigate()
  const fileRef  = useRef()
  const { theme, setTheme } = useTheme()
  const darkMode = theme !== 'light'
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(null)
  const [autoPay, setAutoPay] = useState(true)
  const [cancelModal, setCancelModal] = useState(false)
  const [subCancelled, setSubCancelled] = useState(false)

  const [form, setForm] = useState({
    ownerName:'Raj Patel', email:'raj@venue.com', phone:'+91 98765 43210',
    venueName:'Champions Sports Arena', tagline:"Mumbai's Premier Football Destination",
    address:'Near Infinity Mall, Andheri West, Mumbai 400053',
    city:'Mumbai', state:'Maharashtra', pincode:'400053',
    openTime:'06:00', closeTime:'23:00',
    upi:'raj@upi', cancellationPolicy:'24hrs',
  })
  const [saved, setSaved] = useState({...form})
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const showToast=(msg,type='success')=>{setToast({msg,type});setTimeout(()=>setToast(null),2400)}
  const save=()=>{setSaved({...form});setEditing(false);showToast('Venue updated ✓')}
  const cancel=()=>{setForm({...saved});setEditing(false)}

  const initials = saved.ownerName.split(' ').map(w=>w[0]).join('').slice(0,2)

  return (
    <div className="tp-page">
      {toast && <div className={`tp-toast ${toast.type}`}>{toast.msg}</div>}
      {cancelModal && (
        <div className="tp-modal-bg" onClick={()=>setCancelModal(false)}>
          <div className="tp-modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:36,textAlign:'center',marginBottom:12}}>⚠️</div>
            <h3>Cancel Subscription?</h3>
            <p>Your listing will be unpublished on Apr 30, 2026. Players won't be able to book your venue.</p>
            <div className="tp-modal-btns">
              <button className="tp-modal-keep" onClick={()=>setCancelModal(false)}>Keep it Active</button>
              <button className="tp-modal-cancel" onClick={()=>{setSubCancelled(true);setCancelModal(false);showToast('Subscription cancelled','error')}}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="tp-header">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button className="tp-back" onClick={()=>navigate(-1)}>←</button>
          <h2>Venue Profile</h2>
        </div>
        {!editing
          ? <button className="tp-edit-btn" onClick={()=>setEditing(true)}>✏️ Edit</button>
          : <div style={{display:'flex',gap:8}}>
              <button className="tp-edit-btn cancel" onClick={cancel}>✕</button>
              <button className="tp-edit-btn save" onClick={save}>✓ Save</button>
            </div>
        }
      </div>

      <div className="tp-scroll">
        {/* Avatar + Verification */}
        <div className="tp-hero">
          <div className="tp-avatar" onClick={()=>editing&&fileRef.current?.click()}>
            <span>{initials}</span>
            {editing && <div className="tp-avatar-overlay">📷</div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} />
          <h2 className="tp-vname">{saved.venueName}</h2>
          <p className="tp-tagline">{saved.tagline}</p>
          <div className="tp-verify-chips">
            <span className="tp-vchip verified">✅ PAN Verified</span>
            <span className="tp-vchip verified">✅ Aadhaar Verified</span>
            <span className="tp-vchip verified">✅ Property Doc</span>
          </div>
          <div className="tp-live-badge">🟢 LIVE ON APP · 4.8★ · 124 Reviews</div>
        </div>

        {/* Owner Info */}
        <p className="tp-sec">OWNER INFORMATION</p>
        <div className="tp-card">
          {[['👤','ownerName','Full Name','text'],['✉️','email','Email','email'],['📱','phone','Phone','tel']].map(([ic,k,lb,t])=>(
            <div key={k} className="tp-field">
              <label>{ic} {lb}</label>
              {editing ? <input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} /> : <p className="tp-fval">{saved[k]}</p>}
            </div>
          ))}
        </div>

        {/* Venue Details */}
        <p className="tp-sec">VENUE DETAILS</p>
        <div className="tp-card">
          {[['🏟️','venueName','Venue Name','text'],['💬','tagline','Tagline','text'],['📍','address','Address','text'],['🏙️','city','City','text'],['📮','pincode','PIN Code','number']].map(([ic,k,lb,t])=>(
            <div key={k} className="tp-field">
              <label>{ic} {lb}</label>
              {editing ? <input type={t} value={form[k]} onChange={e=>set(k,e.target.value)} /> : <p className="tp-fval">{saved[k]}</p>}
            </div>
          ))}
          <div className="tp-field">
            <label>🕐 Operating Hours</label>
            {editing
              ? <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input type="time" value={form.openTime} onChange={e=>set('openTime',e.target.value)} style={{flex:1}} />
                  <span style={{color:'#555',fontSize:12}}>to</span>
                  <input type="time" value={form.closeTime} onChange={e=>set('closeTime',e.target.value)} style={{flex:1}} />
                </div>
              : <p className="tp-fval">{saved.openTime} – {saved.closeTime}</p>}
          </div>
        </div>

        {/* Payments */}
        <p className="tp-sec">PAYMENTS</p>
        <div className="tp-card">
          <div className="tp-field">
            <label>💳 UPI ID (Payouts)</label>
            {editing ? <input value={form.upi} onChange={e=>set('upi',e.target.value)} /> : <p className="tp-fval">{saved.upi}</p>}
          </div>
          <div className="tp-toggle-row">
            <div><p className="tp-toggle-label">Auto-Pay Platform Fee</p><p className="tp-toggle-sub">{autoPay?'Auto-debit on 1st every month':'Manual payment'}</p></div>
            <div className={`tp-toggle ${autoPay?'on':''}`} onClick={()=>setAutoPay(p=>!p)}><div className="tp-toggle-k"/></div>
          </div>
          <div className="tp-toggle-row">
            <div><p className="tp-toggle-label">{darkMode?'🌙 Dark Mode':'☀️ Light Mode'}</p><p className="tp-toggle-sub">App appearance preference</p></div>
            <div className={`tp-toggle ${darkMode?'on':''}`} onClick={()=>setTheme(darkMode?'light':'dark')}><div className="tp-toggle-k"/></div>
          </div>
        </div>

        {/* Platform Subscription */}
        <p className="tp-sec">PLATFORM SUBSCRIPTION</p>
        <div className="tp-card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><p style={{fontSize:14,fontWeight:700,color:'#fff',margin:'0 0 3px'}}>Venue Partner Plan</p><p style={{fontSize:11,color:'#555',margin:0}}>{subCancelled?'⚠️ Cancelled · Active till Apr 30':'Next due: Apr 1, 2026'}</p></div>
            <p style={{fontSize:17,fontWeight:800,color:subCancelled?'#555':'#f5a623',textDecoration:subCancelled?'line-through':'none'}}>10% / booking</p>
          </div>
          <div style={{background:'rgba(76,175,80,.06)',border:'1px solid rgba(76,175,80,.15)',borderRadius:10,padding:'10px 12px'}}>
            <p style={{fontSize:11,color:'#4caf50',margin:0,lineHeight:1.6}}>💡 Like Zomato/Swiggy, AcademyPro earns 10% per booking as a marketplace fee. Listing is completely free. We earn when you earn.</p>
          </div>
          {[['Listing Fee','Free ✓'],['Online Booking Commission','10%'],['Analytics & Reports','Free ✓'],['Customer Support','Free ✓']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#777'}}><span>{k}</span><span style={{color:'#ccc',fontWeight:600}}>{v}</span></div>
          ))}
          {[['Mar 2026','10% · ~₹4,860'],['Feb 2026','10% · ~₹4,420']].map(([d,a],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#555'}}><span>🟡 {d}</span><span>{a}</span></div>
          ))}
          {!subCancelled
            ? <button className="tp-cancel-sub" onClick={()=>setCancelModal(true)}>Cancel Subscription</button>
            : <button className="tp-renew-sub" onClick={()=>{setSubCancelled(false);showToast('Subscription renewed ✓')}}>🔄 Renew Subscription</button>}
        </div>

        <button className="tp-signout" onClick={()=>navigate('/role')}>← Sign Out</button>
        <div style={{height:80}} />
      </div>
      <TurfBottomNav />
    </div>
  )
}
