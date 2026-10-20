import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell
} from 'recharts'
import AdminHeader from '../../components/AdminHeader'
import AdminBottomNav from '../../components/AdminBottomNav'
import './AdminReports.css'

const revenueData = [
  { month: 'Oct', monthly: 220000, tournament: 30000, academy: 190000 },
  { month: 'Nov', monthly: 260000, tournament: 45000, academy: 215000 },
  { month: 'Dec', monthly: 240000, tournament: 20000, academy: 220000 },
  { month: 'Jan', monthly: 310000, tournament: 60000, academy: 250000 },
  { month: 'Feb', monthly: 340000, tournament: 70000, academy: 270000 },
  { month: 'Mar', monthly: 380000, tournament: 80000, academy: 300000 },
]

const attendanceTrend = [
  { week: 'W1 Jan', pct: 78 }, { week: 'W3 Jan', pct: 81 },
  { week: 'W1 Feb', pct: 83 }, { week: 'W3 Feb', pct: 85 },
  { week: 'W1 Mar', pct: 88 }, { week: 'W2 Mar', pct: 90 },
]

const studentRankings = [
  { rank: 1, name: 'Jordan Lee',    sport: 'Basketball', goals: 22, attendance: 92, color: '#f5a623' },
  { rank: 2, name: 'Alex Thompson', sport: 'Football',   goals: 18, attendance: 87, color: '#aaa' },
  { rank: 3, name: 'Morgan Davis',  sport: 'Swimming',   goals: 20, attendance: 95, color: '#cd7f32' },
  { rank: 4, name: 'Sam Rivera',    sport: 'Tennis',     goals: 12, attendance: 73, color: '#555' },
]

const initialExpenses = [
  { id: 1, name: 'Ground Maintenance', amount: 15000, date: 'Mar 1' },
  { id: 2, name: 'Equipment Purchase',  amount: 28000, date: 'Feb 20' },
  { id: 3, name: 'Coach Stipend',       amount: 75000, date: 'Feb 28' },
]

const tooltipStyle = { background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 12 }

export default function AdminReports() {
  const [expenses, setExpenses]       = useState(initialExpenses)
  const [showAddExp, setShowAddExp]   = useState(false)
  const [newExp, setNewExp]           = useState({ name: '', amount: '' })
  const [showBreakdown, setShowBreakdown] = useState(false)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  function addExpense() {
    if (!newExp.name || !newExp.amount) return
    setExpenses(p => [...p, { id: Date.now(), name: newExp.name, amount: +newExp.amount, date: 'Mar' }])
    setNewExp({ name: '', amount: '' })
    setShowAddExp(false)
  }

  return (
    <div className="adm-rpt-page">
      <AdminHeader />
      <div className="adm-rpt-scroll">

        <h2 className="adm-rpt-title">Reports</h2>
        <p className="adm-rpt-sub">Financial & performance analytics</p>

        {/* Top KPI cards */}
        <div className="adm-rpt-kpi-grid">
          <div className="adm-rpt-kpi">
            <span className="adm-rpt-kpi-label">This Month</span>
            <span className="adm-rpt-kpi-value">₹3.7L</span>
          </div>
          <div className="adm-rpt-kpi adm-rpt-kpi-green">
            <span className="adm-rpt-kpi-label">Growth</span>
            <span className="adm-rpt-kpi-value">+2.8%</span>
          </div>
          <div className="adm-rpt-kpi">
            <span className="adm-rpt-kpi-label">Tournament</span>
            <span className="adm-rpt-kpi-value">₹70K</span>
          </div>
          <div className="adm-rpt-kpi">
            <span className="adm-rpt-kpi-label">Academy</span>
            <span className="adm-rpt-kpi-value">₹300K</span>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="adm-rpt-chart-card">
          <div className="adm-rpt-chart-label">REVENUE TRENDS</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${v/1000}K`} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#666' }} />
              <Line dataKey="monthly"    stroke="#f5a623" strokeWidth={2} dot={false} name="Monthly" />
              <Line dataKey="tournament" stroke="#aaa"    strokeWidth={2} dot={false} name="Tournament" />
              <Line dataKey="academy"    stroke="#555"    strokeWidth={2} dot={false} name="Academy" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* This Month breakdown */}
        <div className="adm-rpt-chart-card">
          <div className="adm-rpt-month-row">
            <div>
              <div className="adm-rpt-chart-label">THIS MONTH</div>
              <div className="adm-rpt-month-amount">₹6,800</div>
            </div>
            <div className="adm-rpt-month-growth">▲ Growth</div>
          </div>

          <button className="adm-rpt-breakdown-btn" onClick={() => setShowBreakdown(p => !p)}>
            {showBreakdown ? '▲ Hide Breakdown' : '▼ View Breakdown'}
            <span>This shows all payment sources</span>
          </button>

          {showBreakdown && (
            <div className="adm-rpt-breakdown-section">
              <div className="adm-rpt-breakdown-title">REVENUE BREAKDOWN</div>

              <div className="adm-rpt-breakdown-row">
                <div>
                  <div className="adm-rpt-bk-name">Subscription Revenue</div>
                  <div className="adm-rpt-bk-sub">81% of total</div>
                </div>
                <span className="adm-rpt-bk-amount">₹3,00,000</span>
              </div>
              <div className="adm-rpt-breakdown-row">
                <div>
                  <div className="adm-rpt-bk-name">Tournament Revenue</div>
                  <div className="adm-rpt-bk-sub">19% of total</div>
                </div>
                <span className="adm-rpt-bk-amount">₹70,000</span>
              </div>
              <div className="adm-rpt-breakdown-row">
                <div>
                  <div className="adm-rpt-bk-name">Platform Fee (collected)</div>
                  <div className="adm-rpt-bk-sub">— of total</div>
                </div>
                <span className="adm-rpt-bk-amount">₹4,350</span>
              </div>
            </div>
          )}
        </div>

        {/* Expenses */}
        <div className="adm-rpt-chart-card">
          <div className="adm-rpt-expenses-header">
            <span className="adm-rpt-chart-label">EXPENSES</span>
            <button className="adm-rpt-add-exp-btn" onClick={() => setShowAddExp(p => !p)}>
              + Add Expense
            </button>
          </div>

          {showAddExp && (
            <div className="adm-rpt-add-exp-form">
              <div className="adm-form-row">
                <div className="adm-form-field">
                  <label>Name</label>
                  <input value={newExp.name} onChange={e=>setNewExp(p=>({...p,name:e.target.value}))} placeholder="e.g. Equipment" />
                </div>
                <div className="adm-form-field">
                  <label>Amount (₹)</label>
                  <input type="number" value={newExp.amount} onChange={e=>setNewExp(p=>({...p,amount:e.target.value}))} placeholder="10000" />
                </div>
              </div>
              <div className="adm-form-actions">
                <button className="adm-form-save" onClick={addExpense}>✓ Add</button>
                <button className="adm-form-cancel" onClick={()=>setShowAddExp(false)}>Cancel</button>
              </div>
            </div>
          )}

          {expenses.map(e => (
            <div key={e.id} className="adm-rpt-exp-row">
              <span className="adm-rpt-exp-name">{e.name}</span>
              <span className="adm-rpt-exp-date">{e.date}</span>
              <span className="adm-rpt-exp-amount">₹{e.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="adm-rpt-exp-total">
            <span>Total Expenses</span>
            <span>₹{totalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="adm-rpt-chart-card">
          <div className="adm-rpt-chart-label">ATTENDANCE TREND</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={attendanceTrend}>
              <XAxis dataKey="week" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => `${v}%`} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                {attendanceTrend.map((v, i) => (
                  <Cell key={i} fill={v.pct >= 85 ? '#f5a623' : '#3a3a3a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Student Rankings */}
        <div className="adm-rpt-chart-card">
          <div className="adm-rpt-chart-label">STUDENT RANKINGS</div>
          <div className="adm-rpt-rankings-note">Based on fees paid, attendance, academy activity & app usage</div>
          {studentRankings.map(s => (
            <div key={s.rank} className="adm-rpt-rank-row">
              <div className="adm-rpt-rank-num" style={{ color: s.color }}>{s.rank}</div>
              <div className="adm-rpt-rank-info">
                <div className="adm-rpt-rank-name">{s.name}</div>
                <div className="adm-rpt-rank-sport">{s.sport}</div>
              </div>
              <div className="adm-rpt-rank-right">
                <span className="adm-rpt-rank-goals">{s.goals} goals</span>
                <span className="adm-rpt-rank-att">{s.attendance}%</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 80 }} />
      </div>
      <AdminBottomNav />
    </div>
  )
}
