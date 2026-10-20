import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/api'
import './AdminAuth.css'

export default function AdminAuth() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', academy: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all required fields.'); return }
    if (!isLogin && form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    setError('')
    try {
      if (!isLogin) {
        const res = await API.post('/auth/register', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'admin'
        });
        login(res.data.user, res.data.user.role, res.data.token);
      } else {
        const res = await API.post('/auth/login', {
          email: form.email,
          password: form.password
        });
        login(res.data.user, res.data.user.role, res.data.token);
      }
      navigate('/admin/home')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-auth-page">
      <button className="adm-auth-back" onClick={() => navigate('/role')}>← Back</button>

      <div className="adm-auth-header">
        <div className="adm-auth-icon">🛡️</div>
        <h1>Admin Portal</h1>
        <p>{isLogin ? 'Sign in to manage your academy' : 'Create your admin account'}</p>
      </div>

      {/* Tabs */}
      <div className="adm-auth-tabs">
        <button className={`adm-auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError('') }}>Sign In</button>
        <button className={`adm-auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError('') }}>Sign Up</button>
      </div>

      <div className="adm-auth-form">
        {!isLogin && (
          <>
            <div className="adm-auth-field">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div className="adm-auth-field">
              <label>Academy Name</label>
              <input value={form.academy} onChange={e => setForm(p => ({ ...p, academy: e.target.value }))} placeholder="Elite Sports Academy" />
            </div>
            <div className="adm-auth-field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </>
        )}

        <div className="adm-auth-field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@academy.com" />
        </div>

        <div className="adm-auth-field adm-auth-pass-field">
          <label>Password</label>
          <div className="adm-auth-pass-wrap">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Enter password"
            />
            <button className="adm-auth-eye" onClick={() => setShowPass(p => !p)}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div className="adm-auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Re-enter password"
            />
          </div>
        )}

        {error && <p className="adm-auth-error">{error}</p>}

        <button className="adm-auth-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
        </button>

        <p className="adm-auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(p => !p); setError('') }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
