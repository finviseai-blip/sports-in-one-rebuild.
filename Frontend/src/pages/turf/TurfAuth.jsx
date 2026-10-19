import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TurfAuth.css'

const SPORT_OPTIONS = [
  { id:'football',   emoji:'⚽', label:'Football',  color:'#2E7D32' },
  { id:'cricket',    emoji:'🏏', label:'Cricket',   color:'#1565C0' },
  { id:'badminton',  emoji:'🏸', label:'Badminton', color:'#E65100' },
  { id:'basketball', emoji:'🏀', label:'Basketball',color:'#BF360C' },
  { id:'tennis',     emoji:'🎾', label:'Tennis',    color:'#1B5E20' },
  { id:'swimming',   emoji:'🏊', label:'Swimming',  color:'#0277BD' },
  { id:'kabaddi',    emoji:'🤼', label:'Kabaddi',   color:'#6A1B9A' },
  { id:'volleyball', emoji:'🏐', label:'Volleyball',color:'#F57F17' },
  { id:'box_cricket',emoji:'🏟️','label':'Box Cricket',color:'#37474F'},
  { id:'multi',      emoji:'🎯', label:'Multi-Sport',color:'#4527A0' },
]

const SURFACES  = ['Artificial Turf','Natural Grass','Wooden','Concrete','Synthetic Mat','Sand']
const AMENITIES = ['Floodlights','Changing Room','Parking','Cafeteria','First Aid','Drinking Water','Washrooms','CCTV','Wifi','Scoreboard']
const STATES    = ['Maharashtra','Delhi','Karnataka','Tamil Nadu','Telangana','Gujarat','Rajasthan','West Bengal','Punjab','Madhya Pradesh']

export default function TurfAuth() {
  const navigate   = useNavigate()
  const [mode, setMode]     = useState('login')
  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)

  const [f, setF] = useState({
    /* login */
    loginId:'', loginPw:'',
    /* step 0 – account */
    name:'', email:'', phone:'', pw:'', cpw:'', ownerType:'individual',
    /* step 1 – KYC */
    pan:'', aadhaar:'', gst:'',
    panFile:null, aadhaarFile:null, propDoc:null,
    ownershipType:'owned',
    /* step 2 – venue */
    venueName:'', tagline:'', sports:[], amenities:[],
    city:'', state:'Maharashtra', pincode:'', address:'', mapLink:'',
    openTime:'06:00', closeTime:'23:00',
    advanceDays:'7', cancelPolicy:'24hrs',
    courts:[{ name:'Ground 1', sport:'football', surface:'Artificial Turf', size:'7-a-side', price:'800', lights:true, roofed:false, description:'' }],
    /* step 3 – payments */
    upi:'', bankName:'', acNo:'', ifsc:'', pan2:'',
    autoAccept:false,
  })
  const set  = (k,v) => setF(p => ({...p,[k]:v}))
  const tog  = (k,v) => set(k, f[k].includes(v) ? f[k].filter(x=>x!==v) : [...f[k],v])

  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)

  const sendOtp = () => {
    if (!/^\d{10}$/.test(f.phone.replace(/\D/g,''))) return
    setOtpSent(true); setOtpTimer(30)
    const t = setInterval(() => setOtpTimer(p => { if(p<=1){clearInterval(t);return 0} return p-1 }), 1000)
  }
  const verifyOtp = () => {
    if (otpValue.length === 6) { setOtpVerified(true) }
    else { setErrors(p=>({...p,otp:'Enter 6-digit OTP'})) }
  }
  const setCourt = (i,k,v) => set('courts', f.courts.map((c,idx) => idx===i?{...c,[k]:v}:c))
  const addCourt = () => set('courts', [...f.courts, { name: `Ground ${f.courts.length + 1}`, sport: f.sports[0] || 'football', surface: 'Artificial Turf', size: '7-a-side', price: '800', lights: true, roofed: false, description: '' }])
  const delCourt = (i) => set('courts', f.courts.filter((_,idx)=>idx!==i))

  const validate = () => {
    const e = {}
    if (step===0) {
      if (!f.name)                          e.name = 'Required'
      if (!/\S+@\S+\.\S+/.test(f.email))   e.email = 'Enter valid email'
      if (!/^\d{10}$/.test(f.phone.replace(/\D/g,''))) e.phone = 'Enter 10-digit mobile'
      if (f.pw.length < 8)                  e.pw = 'Min 8 characters'
      if (f.pw !== f.cpw)                   e.cpw = 'Passwords do not match'
    }
    if (step===1) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(f.pan)) e.pan = 'Invalid PAN (e.g. ABCDE1234F)'
      if (f.aadhaar.replace(/\D/g,'').length < 12) e.aadhaar = 'Enter 12-digit Aadhaar'
      if (!f.panFile)     e.panFile    = 'Required'
      if (!f.aadhaarFile) e.aadhaarFile = 'Required'
      if (!f.propDoc)     e.propDoc    = 'Required'
    }
    if (step===2) {
      if (!f.venueName)  e.venueName = 'Required'
      if (!f.sports.length) e.sports = 'Select at least 1 sport'
      if (!f.city)       e.city    = 'Required'
      if (!f.address)    e.address = 'Required'
      if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'Enter 6-digit PIN'
      if (!f.courts.length) e.courts = 'Add at least 1 court/ground'
    }
    if (step===3) {
      if (!f.upi && !f.acNo) e.payout = 'Add UPI ID or bank account'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const next = () => {
    if (!validate()) return
    if (step < 3) { setStep(s=>s+1); setErrors({}) }
    else { setLoading(true); setTimeout(()=>navigate('/turf/home'),1600) }
  }

  const doLogin = () => {
    if (!f.loginId || !f.loginPw) { setErrors({login:'Fill all fields'}); return }
    setLoading(true); setTimeout(()=>navigate('/turf/home'),1200)
  }

  const STEPS = [
    { num:1, icon:'👤', label:'Account' },
    { num:2, icon:'🔐', label:'KYC' },
    { num:3, icon:'🏟️', label:'Venue' },
    { num:4, icon:'💳', label:'Payout' },
  ]

  return (
    <div className="ka-wrap">
      {/* Top bar */}
      <div className="ka-topbar">
        <button className="ka-back-btn" onClick={()=>navigate('/role')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="ka-topbar-logo">
          <span>🏟️</span>
          <div><span className="ka-brand">AcademyPro</span><span className="ka-brand-tag"> Partner</span></div>
        </div>
        <div style={{width:36}} />
      </div>

      <div className="ka-body">
        {/* Mode switch */}
        <div className="ka-mode-switch">
          <button className={`ka-mode-btn ${mode==='login'?'on':''}`}    onClick={()=>{setMode('login');setErrors({})}}>Sign In</button>
          <button className={`ka-mode-btn ${mode==='register'?'on':''}`} onClick={()=>{setMode('register');setStep(0);setErrors({})}}>List Your Venue</button>
        </div>

        {/* ════ LOGIN ════ */}
        {mode==='login' && <>
          <div className="ka-login-hero">
            <div className="ka-login-icon">🏟️</div>
            <h2>Welcome back,<br/>Partner!</h2>
            <p>Manage bookings, slots & earnings</p>
          </div>
          <div className="ka-card">
            <KaField label="Email / Phone" error={errors.login}>
              <input placeholder="owner@venue.com or 9876543210" value={f.loginId} onChange={e=>set('loginId',e.target.value)} />
            </KaField>
            <KaField label="Password">
              <div className="ka-pw">
                <input type={showPw?'text':'password'} placeholder="Enter password" value={f.loginPw} onChange={e=>set('loginPw',e.target.value)} />
                <button className="ka-pw-eye" onClick={()=>setShowPw(p=>!p)}>{showPw?'🙈':'👁️'}</button>
              </div>
            </KaField>
            <button className="ka-forgot">Forgot password?</button>
          </div>
          <button className="ka-cta-btn" onClick={doLogin} disabled={loading}>
            {loading?'Signing in…':'Sign In →'}
          </button>

          {/* Trust signals */}
          <div className="ka-trust-strip">
            <div className="ka-trust-item">🔒<span>Secure Payments</span></div>
            <div className="ka-trust-item">🤝<span>Trusted Network</span></div>
            <div className="ka-trust-item">⚡<span>Fast Payouts</span></div>
          </div>
          <p className="ka-trust-tagline">Join our trusted sports venue network and manage your turf bookings easily.</p>

          {/* Why list here */}
          <div className="ka-why-grid">
            {[['📲','Instant Online Bookings'],['💰','Weekly UPI Payouts'],['📊','Revenue Analytics'],['⭐','Ratings & Reviews'],['🎯','Marketing Boost'],['🔧','Easy Slot Control']].map(([ic,lb])=>(
              <div key={lb} className="ka-why-item"><span>{ic}</span><span>{lb}</span></div>
            ))}
          </div>
        </>}

        {/* ════ REGISTER ════ */}
        {mode==='register' && <>
          {/* Stepper */}
          <div className="ka-stepper">
            {STEPS.map((s,i)=>(
              <div key={s.num} className={`ka-step-item ${i<step?'done':''} ${i===step?'active':''}`}>
                <div className="ka-step-circle">
                  {i<step ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : s.icon}
                </div>
                <span className="ka-step-lbl">{s.label}</span>
                {i<STEPS.length-1 && <div className={`ka-step-line ${i<step?'filled':''}`} />}
              </div>
            ))}
          </div>

          {/* ── STEP 0: Account ── */}
          {step===0 && <div className="ka-step-body">
            <div className="ka-step-title"><span>👤</span>Create Partner Account</div>

            <div className="ka-owner-type-row">
              {[['individual','👤','Individual'],['company','🏢','Company'],['trust','🏛️','Trust / NGO']].map(([v,ic,lb])=>(
                <button key={v} className={`ka-owner-type ${f.ownerType===v?'on':''}`} onClick={()=>set('ownerType',v)}>
                  <span>{ic}</span><span>{lb}</span>
                </button>
              ))}
            </div>

            <div className="ka-card">
              <KaField label="Full Name" error={errors.name}>
                <input placeholder="As per Aadhaar / PAN" value={f.name} onChange={e=>set('name',e.target.value)} />
              </KaField>
              <KaField label="Email Address" error={errors.email}>
                <input type="email" placeholder="partner@venue.com" value={f.email} onChange={e=>set('email',e.target.value)} />
              </KaField>
              <KaField label="Mobile Number" error={errors.phone}>
                <div className="ka-phone">
                  <span>🇮🇳 +91</span>
                  <input type="tel" placeholder="98765 43210" maxLength="10" value={f.phone} onChange={e=>{set('phone',e.target.value.replace(/\D/g,''));setOtpSent(false);setOtpVerified(false);setOtpValue('')}} />
                  {!otpVerified && <button className="ka-otp-send-btn" onClick={sendOtp} disabled={f.phone.length<10||otpTimer>0}>{otpTimer>0?`${otpTimer}s`:otpSent?'Resend':'Send OTP'}</button>}
                  {otpVerified && <span className="ka-otp-verified">✓ Verified</span>}
                </div>
              </KaField>
              {otpSent && !otpVerified && (
                <KaField label="Enter OTP" error={errors.otp}>
                  <div className="ka-phone">
                    <input type="tel" placeholder="6-digit OTP (use 123456)" maxLength={6} value={otpValue} onChange={e=>setOtpValue(e.target.value.replace(/\D/g,''))} />
                    <button className="ka-otp-send-btn" onClick={verifyOtp}>Verify</button>
                  </div>
                  <p className="ka-otp-hint">📱 Demo OTP: <strong>123456</strong></p>
                </KaField>
              )}
              <KaField label="Password" error={errors.pw}>
                <div className="ka-pw">
                  <input type={showPw?'text':'password'} placeholder="Min 8 characters" value={f.pw} onChange={e=>set('pw',e.target.value)} />
                  <button className="ka-pw-eye" onClick={()=>setShowPw(p=>!p)}>{showPw?'🙈':'👁️'}</button>
                </div>
              </KaField>
              <KaField label="Confirm Password" error={errors.cpw}>
                <input type="password" placeholder="Re-enter password" value={f.cpw} onChange={e=>set('cpw',e.target.value)} />
              </KaField>
            </div>
          </div>}

          {/* ── STEP 1: KYC ── */}
          {step===1 && <div className="ka-step-body">
            <div className="ka-step-title"><span>🔐</span>Identity Verification</div>
            <div className="ka-kyc-banner">
              <span>🛡️</span>
              <div>
                <p className="ka-kyc-t">Documents verified in 24–48 hrs</p>
                <p className="ka-kyc-s">256-bit encrypted · DPDP Act compliant · Only for KYC</p>
              </div>
            </div>

            <div className="ka-card">
              <KaField label="PAN Card Number" error={errors.pan}>
                <input placeholder="ABCDE1234F" maxLength={10} value={f.pan} onChange={e=>set('pan',e.target.value.toUpperCase())} className={errors.pan?'ka-inp-err':''} />
              </KaField>
              <KaField label="Aadhaar Number" error={errors.aadhaar}>
                <input placeholder="1234 5678 9012" value={f.aadhaar} onChange={e=>set('aadhaar',e.target.value.replace(/\D/g,'').slice(0,12))} className={errors.aadhaar?'ka-inp-err':''} />
              </KaField>
              <KaField label="GST Number (optional)">
                <input placeholder="22AAAAA0000A1Z5" value={f.gst} onChange={e=>set('gst',e.target.value.toUpperCase())} />
              </KaField>
            </div>

            <div className="ka-ownership-row">
              <span className="ka-field-lbl">Property Ownership Type</span>
              <div className="ka-ownership-btns">
                {[['owned','🏠 Owned'],['leased','📄 Leased'],['licensed','🔑 Licensed']].map(([v,lb])=>(
                  <button key={v} className={`ka-own-btn ${f.ownershipType===v?'on':''}`} onClick={()=>set('ownershipType',v)}>{lb}</button>
                ))}
              </div>
            </div>

            <div className="ka-upload-grid">
              {[
                {key:'panFile',     icon:'🪪', title:'PAN Card',        sub:'Clear photo/scan of PAN',     required:true,  err:errors.panFile},
                {key:'aadhaarFile', icon:'📄', title:'Aadhaar Card',    sub:'Both sides visible',          required:true,  err:errors.aadhaarFile},
                {key:'propDoc',     icon:'📋', title:'Ownership Proof', sub:'Registry / Lease / License',  required:true,  err:errors.propDoc},
                {key:'utilityBill', icon:'🔌', title:'Utility Bill',    sub:'Optional – Electricity bill', required:false, err:null},
              ].map(u=>(
                <label key={u.key} className={`ka-upload-box ${f[u.key]?'uploaded':''} ${u.err?'error':''}`}>
                  <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e=>set(u.key,e.target.files[0])} />
                  <span className="ka-upl-icon">{u.icon}</span>
                  <span className="ka-upl-title">{u.title}{u.required&&<span className="ka-required">*</span>}</span>
                  <span className="ka-upl-sub">{f[u.key] ? <span className="ka-upl-done">✓ Uploaded</span> : u.sub}</span>
                  {u.err && <span className="ka-ferr">{u.err}</span>}
                </label>
              ))}
            </div>
            <p className="ka-doc-note">Accepted: JPG, PNG, PDF · Max 5MB per file · All data encrypted</p>
          </div>}

          {/* ── STEP 2: Venue ── */}
          {step===2 && <div className="ka-step-body">
            <div className="ka-step-title"><span>🏟️</span>Venue Details</div>
            <div className="ka-card">
              <KaField label="Venue / Facility Name" error={errors.venueName}>
                <input placeholder="e.g. Champions Sports Arena" value={f.venueName} onChange={e=>set('venueName',e.target.value)} />
              </KaField>
              <KaField label="Tagline (optional)">
                <input placeholder="e.g. Mumbai's Premier Football Destination" value={f.tagline} onChange={e=>set('tagline',e.target.value)} />
              </KaField>
            </div>

            <div className="ka-field-outer">
              <span className="ka-field-lbl">Sports Available {errors.sports&&<span className="ka-ferr"> · {errors.sports}</span>}</span>
              <div className="ka-sports-chips">
                {SPORT_OPTIONS.map(s=>(
                  <button key={s.id} className={`ka-sport-chip ${f.sports.includes(s.id)?'on':''}`} style={f.sports.includes(s.id)?{background:s.color+'22',borderColor:s.color,color:s.color}:{}} onClick={()=>tog('sports',s.id)}>
                    <span>{s.emoji}</span><span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ka-field-outer">
              <span className="ka-field-lbl">Amenities</span>
              <div className="ka-amenity-chips">
                {AMENITIES.map(a=>(
                  <button key={a} className={`ka-amenity-chip ${f.amenities.includes(a)?'on':''}`} onClick={()=>tog('amenities',a)}>{a}</button>
                ))}
              </div>
            </div>

            <div className="ka-card">
              <div className="ka-2col">
                <KaField label="City" error={errors.city}>
                  <input placeholder="Mumbai" value={f.city} onChange={e=>set('city',e.target.value)} />
                </KaField>
                <KaField label="State">
                  <select value={f.state} onChange={e=>set('state',e.target.value)}>{STATES.map(s=><option key={s}>{s}</option>)}</select>
                </KaField>
              </div>
              <div className="ka-2col">
                <KaField label="PIN Code" error={errors.pincode}>
                  <input type="number" placeholder="400001" maxLength={6} value={f.pincode} onChange={e=>set('pincode',e.target.value.slice(0,6))} />
                </KaField>
                <KaField label="Google Maps Link">
                  <input placeholder="g.co/maps/…" value={f.mapLink} onChange={e=>set('mapLink',e.target.value)} />
                </KaField>
              </div>
              <KaField label="Full Address" error={errors.address}>
                <input placeholder="Building, Street, Landmark, Area" value={f.address} onChange={e=>set('address',e.target.value)} />
              </KaField>
              <div className="ka-2col">
                <KaField label="Opening Time"><input type="time" value={f.openTime} onChange={e=>set('openTime',e.target.value)} /></KaField>
                <KaField label="Closing Time"><input type="time" value={f.closeTime} onChange={e=>set('closeTime',e.target.value)} /></KaField>
              </div>
              <div className="ka-2col">
                <KaField label="Advance Booking">
                  <select value={f.advanceDays} onChange={e=>set('advanceDays',e.target.value)}>
                    {[['3','3 days'],['7','7 days'],['14','14 days'],['30','30 days']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </KaField>
                <KaField label="Cancellation">
                  <select value={f.cancelPolicy} onChange={e=>set('cancelPolicy',e.target.value)}>
                    {[['no_refund','No refund'],['24hrs','Free ≥24 hrs'],['48hrs','Free ≥48 hrs'],['any','Anytime free']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </KaField>
              </div>
            </div>

            {/* Courts */}
            <div className="ka-courts-hdr">
              <span className="ka-field-lbl">Courts / Grounds {errors.courts&&<span className="ka-ferr"> · {errors.courts}</span>}</span>
              <button className="ka-add-court" onClick={addCourt}>+ Add</button>
            </div>
            {f.courts.map((c,i)=>(
              <div key={i} className="ka-court-block">
                <div className="ka-court-block-hd">
                  <span>{SPORT_OPTIONS.find(s=>s.id===c.sport)?.emoji||'🏟️'} {c.name}</span>
                  {f.courts.length>1 && <button className="ka-del-court" onClick={()=>delCourt(i)}>✕</button>}
                </div>
                <div className="ka-2col">
                  <KaField label="Court Name"><input value={c.name} onChange={e=>setCourt(i,'name',e.target.value)} /></KaField>
                  <KaField label="Sport">
                    <select value={c.sport} onChange={e=>setCourt(i,'sport',e.target.value)}>
                      {SPORT_OPTIONS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
                    </select>
                  </KaField>
                </div>
                <div className="ka-2col">
                  <KaField label="Format / Size"><input placeholder="7-a-side / Singles" value={c.size} onChange={e=>setCourt(i,'size',e.target.value)} /></KaField>
                  <KaField label="Surface">
                    <select value={c.surface} onChange={e=>setCourt(i,'surface',e.target.value)}>
                      {SURFACES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </KaField>
                </div>
                <KaField label="Price per Hour (₹)"><input type="number" placeholder="800" value={c.price} onChange={e=>setCourt(i,'price',e.target.value)} /></KaField>
                <div className="ka-court-features">
                  <label className={`ka-feature-toggle ${c.lights?'on':''}`}>
                    <input type="checkbox" checked={c.lights} onChange={e=>setCourt(i,'lights',e.target.checked)} />
                    <span>💡 Floodlights</span>
                  </label>
                  <label className={`ka-feature-toggle ${c.roofed?'on':''}`}>
                    <input type="checkbox" checked={c.roofed} onChange={e=>setCourt(i,'roofed',e.target.checked)} />
                    <span>🏠 Roofed / Indoor</span>
                  </label>
                </div>
              </div>
            ))}
          </div>}

          {/* ── STEP 3: Payout ── */}
          {step===3 && <div className="ka-step-body">
            <div className="ka-step-title"><span>💳</span>Payout Setup</div>
            <div className="ka-payout-banner">
              <span>💰</span>
              <p>Earnings settled every Monday via UPI / NEFT to your account</p>
            </div>
            <div className="ka-card">
              <KaField label="UPI ID" error={errors.payout}>
                <input placeholder="name@paytm / name@upi / name@okicici" value={f.upi} onChange={e=>set('upi',e.target.value)} />
              </KaField>
            </div>
            <div className="ka-or-row"><div className="ka-or-line"/><span>OR Bank Account</span><div className="ka-or-line"/></div>
            <div className="ka-card">
              <KaField label="Bank Name"><input placeholder="HDFC / SBI / ICICI…" value={f.bankName} onChange={e=>set('bankName',e.target.value)} /></KaField>
              <div className="ka-2col">
                <KaField label="Account Number"><input type="number" placeholder="Account number" value={f.acNo} onChange={e=>set('acNo',e.target.value)} /></KaField>
                <KaField label="IFSC Code"><input placeholder="HDFC0001234" value={f.ifsc} onChange={e=>set('ifsc',e.target.value.toUpperCase())} /></KaField>
              </div>
            </div>

            <div className="ka-card">
              <div className="ka-toggle-row">
                <div>
                  <p className="ka-toggle-label">Auto-Accept Bookings</p>
                  <p className="ka-toggle-sub">Instantly confirm paid bookings without manual approval</p>
                </div>
                <div className={`ka-toggle ${f.autoAccept?'on':''}`} onClick={()=>set('autoAccept',!f.autoAccept)}>
                  <div className="ka-toggle-knob" />
                </div>
              </div>
            </div>

            <div className="ka-platform-fee-card">
              <div className="ka-pf-hd">Platform Fee — How it works</div>
              <p className="ka-pf-desc">Like Zomato or Swiggy, AcademyPro earns by connecting players to venues. We charge a small commission per booking — no upfront listing fee.</p>
              <div className="ka-pf-table">
                <div className="ka-pf-row"><span>Listing Your Venue</span><span className="green">FREE</span></div>
                <div className="ka-pf-row"><span>Online Booking Commission</span><span>10% per booking</span></div>
                <div className="ka-pf-row"><span>Payment Processing</span><span>Included</span></div>
                <div className="ka-pf-row"><span>Analytics Dashboard</span><span className="green">FREE</span></div>
                <div className="ka-pf-row"><span>Customer Support</span><span className="green">FREE</span></div>
              </div>
              <div className="ka-pf-example">
                <span>Example:</span> Booking of ₹800 → You receive ₹720 (₹80 platform fee)
              </div>
            </div>
          </div>}

          {/* Nav */}
          <div className="ka-nav-row">
            {step>0 && <button className="ka-prev" onClick={()=>setStep(s=>s-1)}>← Back</button>}
            <button className="ka-cta-btn flex1" onClick={next} disabled={loading}>
              {loading ? 'Submitting…' : step<3 ? 'Continue →' : '🎉 Go Live!'}
            </button>
          </div>
        </>}
      </div>
    </div>
  )
}

function KaField({ label, error, children }) {
  return (
    <div className="ka-field">
      <label className="ka-field-lbl">{label}</label>
      {children}
      {error && <span className="ka-ferr">{error}</span>}
    </div>
  )
}
