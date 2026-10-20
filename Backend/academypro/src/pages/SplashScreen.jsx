import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './SplashScreen.css'

export default function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/role'), 2500)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="splash animate-fade">
      <div className="splash-icon glow">
        <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5a623" />
              <stop offset="100%" stopColor="#ffc107" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="22" fill="url(#iconGrad)" />
          <text x="24" y="32" textAnchor="middle" fontSize="24" fill="#000" fontWeight="900">⚽</text>
        </svg>
      </div>
      <h1 className="splash-title gradient-text">Academy<span className="accent-gradient-text">Pro</span></h1>
      <p className="splash-sub">Elite Academy Management</p>

      <div className="splash-loader-container">
        <div className="splash-loader-bar" />
      </div>
    </div>
  )
}