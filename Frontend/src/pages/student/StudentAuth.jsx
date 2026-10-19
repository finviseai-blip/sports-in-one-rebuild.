import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/api'
import './StudentAuth.css'

export default function StudentAuth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', dob: '',
    password: '', confirmPassword: '', agree: false
  })

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (mode === 'register') {
      if (!form.fullName.trim()) e.fullName = 'Full name required'
      if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone'
      if (!form.dob) e.dob = 'Date of birth required'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
      if (!form.agree) e.agree = 'Please accept terms'
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Min 8 characters'
    if (!/[A-Z]/.test(form.password)) e.password = (e.password || '') + ' One uppercase required'
    if (!/[0-9]/.test(form.password)) e.password = (e.password || '') + ' One number required'
    if (!/[!@#$%^&*]/.test(form.password)) e.password = (e.password || '') + ' One special char required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const getStrength = (p) => {
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[!@#$%^&*]/.test(p)) s++
    return s
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      if (mode === 'register') {
        const res = await API.post('/auth/register', {
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          password: form.password,
          role: 'student'
        });
        login(res.data.user, res.data.user.role, res.data.token);
      } else {
        const res = await API.post('/auth/login', {
          email: form.email,
          password: form.password
        });
        login(res.data.user, res.data.user.role, res.data.token);
      }
      navigate('/student/home')
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Authentication failed')
    }
  }

  const strength = getStrength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#e53935', '#ff9800', '#ffeb3b', '#4caf50'][strength]

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={() => navigate('/role')}>← Back</button>
      <div className="auth-logo">
        <span>👤</span>
      </div>
      <h2 className="auth-title">Student Portal</h2>
      <p className="auth-sub">Elite Football Academy Management</p>

      <div className="auth-tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
      </div>

      <div className="auth-form">
        {mode === 'register' && (
          <>
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="Enter full name" value={form.fullName}
                onChange={e => update('fullName', e.target.value)} />
              {errors.fullName && <span className="err">{errors.fullName}</span>}
            </div>
            <div className="auth-field">
              <label>Phone Number</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone}
                onChange={e => update('phone', e.target.value)} />
              {errors.phone && <span className="err">{errors.phone}</span>}
            </div>
            <div className="auth-field">
              <label>Date of Birth</label>
              <input type="date" value={form.dob}
                onChange={e => update('dob', e.target.value)} />
              {errors.dob && <span className="err">{errors.dob}</span>}
            </div>
          </>
        )}
        <div className="auth-field">
          <label>Email Address</label>
          <input type="email" placeholder="your@email.com" value={form.email}
            onChange={e => update('email', e.target.value)} autoComplete="email" />
          {errors.email && <span className="err">{errors.email}</span>}
        </div>
        <div className="auth-field">
          <label>Password</label>
          <div className="pass-wrap">
            <input type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, uppercase, number, symbol"
              value={form.password} onChange={e => update('password', e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            <button className="pass-toggle" onClick={() => setShowPass(p => !p)}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {form.password && (
            <div className="strength-bar">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="strength-seg"
                  style={{ background: i <= strength ? strengthColor : 'var(--bg-card2)' }} />
              ))}
              <span style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
          {errors.password && <span className="err">{errors.password}</span>}
        </div>
        {mode === 'register' && (
          <div className="auth-field">
            <label>Confirm Password</label>
            <input type="password" placeholder="Repeat your password" value={form.confirmPassword}
              onChange={e => update('confirmPassword', e.target.value)} autoComplete="new-password" />
            {errors.confirmPassword && <span className="err">{errors.confirmPassword}</span>}
          </div>
        )}
        {mode === 'register' && (
          <label className="auth-check">
            <input type="checkbox" checked={form.agree} onChange={e => update('agree', e.target.checked)} />
            <span>I agree to the <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a></span>
          </label>
        )}
        {errors.agree && <span className="err">{errors.agree}</span>}
        {mode === 'login' && (
          <div className="auth-options">
            <label className="auth-check-sm">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <button className="forgot-btn">Forgot password?</button>
          </div>
        )}
        <button className="auth-submit" onClick={handleSubmit}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
        {mode === 'login' && (
          <p className="auth-switch">
            New here? <span onClick={() => setMode('register')}>Create account</span>
          </p>
        )}
      </div>
    </div>
  )
}