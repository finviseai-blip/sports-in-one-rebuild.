import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'

import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import './StudentPerformance.css'

/* ─── DATA (admin-controlled) ───────────────────────────── */
const student = {
  name: 'Aryan Mehta',
  batch: 'Batch A',
  rank: 3,
  age: 17,
  position: 'Centre Forward',
  number: 9,
}

const attrs = [
  { name: 'Physical',  val: 75 },
  { name: 'Technical', val: 71 },
  { name: 'Attacking', val: 70 },
  { name: 'Defensive', val: 67 },
  { name: 'Tactical',  val: 74 },
]

const physicalStats = [
  { label: 'Top Speed',           value: '28.4 km/h', pct: 80 },
  { label: 'Distance/Session',    value: '9.2 km',    pct: 74 },
  { label: 'Sprints/Session',     value: '21',        pct: 70 },
  { label: 'High Intensity Runs', value: '38',        pct: 67 },
]

const technicalStats = [
  { label: 'Pass Accuracy',  value: '82%', pct: 82 },
  { label: 'Dribble Success',value: '65%', pct: 65 },
  { label: 'Ball Retention', value: '78%', pct: 78 },
  { label: 'Shot Accuracy',  value: '61%', pct: 61 },
]

const attackingStats = [
  { label: 'Goals',          value: 9,      pct: 85 },
  { label: 'Assists',        value: 5,      pct: 80 },
  { label: 'Shots on Target',value: 34,     pct: 72 },
  { label: 'Key Passes',     value: 28,     pct: 76 },
  { label: 'xG',             value: '7.4',  pct: 78 },
  { label: 'xA',             value: '4.1',  pct: 68 },
]

const defensiveStats = [
  { label: 'Tackles Won',      value: '54%', pct: 54 },
  { label: 'Interceptions',    value: 14,    pct: 52 },
  { label: 'Clearances',       value: 6,     pct: 40 },
  { label: 'Aerial Duels Won', value: '41%', pct: 41 },
]

const passNetworkData = [
  { player: 'LW Sharma',  passes: 28, color: '#f5a623' },
  { player: 'CM Raza',    passes: 35, color: '#e0d44e' },
  { player: 'RB Singh',   passes: 18, color: '#ea80fc' },
  { player: 'ST Verma',   passes: 22, color: '#76ff03' },
  { player: 'CB Nair',    passes: 12, color: '#00e5ff' },
]

const sessionDistData = [
  { session: 'S1', dist: 8.6 },
  { session: 'S2', dist: 9.4 },
  { session: 'S3', dist: 8.1 },
  { session: 'S4', dist: 9.8 },
  { session: 'S5', dist: 9.2 },
  { session: 'S6', dist: 8.9 },
  { session: 'S7', dist: 9.6 },
]

const xgData = [
  { match: 'M1', xG: 0.5 },
  { match: 'M2', xG: 0.8 },
  { match: 'M3', xG: 0.3 },
  { match: 'M4', xG: 1.2 },
  { match: 'M5', xG: 0.9 },
  { match: 'M6', xG: 0.6 },
  { match: 'M7', xG: 1.1 },
]

const heatmapCells = Array.from({ length: 10 * 6 }, (_, i) => {
  const col = i % 10
  const row = Math.floor(i / 10)
  const intensity =
    col >= 5 && row >= 1 && row <= 4 ? Math.random() * 0.8 + 0.2
    : col >= 3 && row >= 2 && row <= 3 ? Math.random() * 0.5 + 0.1
    : Math.random() * 0.15
  return { col, row, intensity }
})

const reportGrades = [
  { area: 'Attacking', score: 85, grade: 'A',  color: '#f5a623' },
  { area: 'Technical', score: 82, grade: 'A',  color: '#f5a623' },
  { area: 'Tactical',  score: 74, grade: 'B+', color: '#e0d44e' },
  { area: 'Physical',  score: 75, grade: 'B+', color: '#e0d44e' },
  { area: 'Defensive', score: 54, grade: 'C+', color: '#e05c5c' },
]

const tabs = ['Physical','Technical','Attacking','Defensive','Tactical','Compare','Report']

const tabMeta = {
  Physical:  { icon: '🏃', sub: 'Speed, stamina & strength metrics' },
  Technical: { icon: '⚙️', sub: 'Ball control, passing & shooting' },
  Attacking: { icon: '⚽', sub: 'Goals, xG & chance creation' },
  Defensive: { icon: '🛡️', sub: 'Tackles, interceptions & duels' },
  Tactical:  { icon: '🧠', sub: 'Positioning, pressing & awareness' },
  Compare:   { icon: '⚖️', sub: 'Head-to-head attribute comparison' },
  Report:    { icon: '📋', sub: 'Season performance summary' },
}

/* ─── HELPERS ────────────────────────────────────────────── */
function getColor(pct) {
  if (pct >= 75) return '#f5a623'
  if (pct >= 60) return '#e0d44e'
  return '#e05c5c'
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="sp2-section-header">
      <div className="sp2-section-title">{title}</div>
      <div className="sp2-section-sub">{subtitle}</div>
    </div>
  )
}

function StatBar({ label, value, pct }) {
  const color = getColor(pct)
  return (
    <div className="sp2-stat-bar-card">
      <div className="sp2-stat-bar-top">
        <span className="sp2-stat-bar-label">{label.toUpperCase()}</span>
        <span className="sp2-stat-bar-value" style={{ color }}>{value}</span>
      </div>
      <div className="sp2-stat-bar-bg">
        <div className="sp2-stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="sp2-stat-bar-pct">{pct}th percentile</div>
    </div>
  )
}

function InsightCard({ icon, text, color }) {
  return (
    <div className="sp2-insight-card" style={{ background: `${color}12`, border: `1px solid ${color}35` }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span className="sp2-insight-text">{text}</span>
    </div>
  )
}

function PlayerTag({ name, color }) {
  return (
    <div className="sp2-player-tag" style={{ background: `${color}18`, border: `1px solid ${color}45`, color }}>
      {name}
    </div>
  )
}

const tooltipStyle = {
  background: '#111111', border: '1px solid #2a2a2a',
  borderRadius: 8, color: '#ffffff', fontSize: 12,
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function StudentPerformance() {

  const [activeTab, setActiveTab] = useState('Physical')
  const [editing, setEditing]     = useState(false)
  const [stats, setStats]         = useState({ matches: 14, goals: 9, assists: 5 })
  const [editStats, setEditStats] = useState({ ...stats })

  const score = Math.round(attrs.reduce((s, a) => s + a.val, 0) / attrs.length)
  const radarData = attrs.map(a => ({ subject: a.name, A: a.val }))
  const activeAttr = attrs.find(a => a.name === activeTab) || null

  return (
    <div className="sp-page">
      <Header />

      <div className="sp-scroll">

        {/* ── TITLE ── */}
        <div className="sp-title-row">
          <div>
            <h2 className="sp-title">Performance</h2>
            <p className="sp-rank-sub">Your ranking: <span>#3 in Batch A</span></p>
          </div>
          <button className="sp-edit-btn" onClick={() => setEditing(p => !p)}>
            ✏️ {editing ? 'Editing' : 'Edit Mode'}
          </button>
        </div>

        {/* ── BARS / EDIT ── */}
        {editing ? (
          <div className="sp-edit-card">
            <p className="sp-edit-label">Update Your Stats</p>
            <div className="sp-edit-grid">
              {['matches','goals','assists'].map(k => (
                <div key={k} className="sp-edit-field">
                  <label>{k}</label>
                  <input
                    type="number" value={editStats[k]}
                    onChange={e => setEditStats(p => ({ ...p, [k]: +e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="sp-edit-actions">
              <button className="sp-save-btn" onClick={() => { setStats(editStats); setEditing(false) }}>✓ Save</button>
              <button className="sp-cancel-btn" onClick={() => { setEditStats(stats); setEditing(false) }}>✕ Cancel</button>
            </div>
          </div>
        ) : (
          <div className="sp-bars-card">
            {attrs.map(a => (
              <div key={a.name} className="sp-attr-row">
                <span className="sp-attr-name">{a.name}</span>
                <div className="sp-attr-bar-wrap">
                  <div className="sp-attr-bar" style={{ width: `${a.val}%` }} />
                </div>
                <span className="sp-attr-val">{a.val}</span>
              </div>
            ))}
            <div className="sp-score-bubble"><span>{score}</span><label>Score</label></div>
            <div className="sp-rank-badge">⭐ Rank #3</div>
          </div>
        )}

        {/* ── KPI ROW ── */}
        <div className="sp-kpi-row">
          <div><span>{stats.matches}</span><label>Matches</label></div>
          <div><span>{stats.goals}</span><label>Goals</label></div>
          <div><span>{stats.assists}</span><label>Assists</label></div>
        </div>

        {/* ── TABS ── */}
        <div className="sp-tabs-wrap">
          <div className="sp-tabs">
            {tabs.map(t => (
              <button key={t} className={`sp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════
            TAB CONTENT
        ══════════════════════════════════ */}

        {/* ── PHYSICAL ── */}
        {activeTab === 'Physical' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Physical Performance" subtitle="Athletic metrics & movement data" />
            <div className="sp2-grid-2">
              {physicalStats.map(s => <StatBar key={s.label} {...s} />)}
            </div>
            <div className="sp2-chart-card">
              <div className="sp2-chart-title">DISTANCE COVERED — LAST 7 SESSIONS (km)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sessionDistData}>
                  <XAxis dataKey="session" tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[7, 11]} tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="dist" radius={[4, 4, 0, 0]}>
                    {sessionDistData.map((v, i) => (
                      <Cell key={i} fill={v.dist >= 9.5 ? '#f5a623' : '#3a3a3a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TECHNICAL ── */}
        {activeTab === 'Technical' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Technical Skills" subtitle="Ball control, passing & shooting" />
            <div className="sp2-grid-2">
              {technicalStats.map(s => <StatBar key={s.label} {...s} />)}
            </div>
            <div className="sp2-chart-card">
              <div className="sp2-chart-title">PASS NETWORK — TOP CONNECTIONS</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={passNetworkData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="player" type="category" tick={{ fill: '#cccccc', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="passes" radius={[0, 4, 4, 0]}>
                    {passNetworkData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── ATTACKING ── */}
        {activeTab === 'Attacking' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Attacking Performance" subtitle="Goals, xG, assists & chance creation" />
            <div className="sp2-grid-2">
              {attackingStats.map(s => <StatBar key={s.label} {...s} />)}
            </div>
            <div className="sp2-chart-card">
              <div className="sp2-chart-title">xG PER MATCH</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={xgData}>
                  <XAxis dataKey="match" tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="xG" radius={[4, 4, 0, 0]}>
                    {xgData.map((v, i) => (
                      <Cell key={i} fill={v.xG >= 1 ? '#f5a623' : '#3a3a3a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── DEFENSIVE ── */}
        {activeTab === 'Defensive' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Defensive Metrics" subtitle="Tackles, interceptions & duels" />
            <div className="sp2-grid-2">
              {defensiveStats.map(s => <StatBar key={s.label} {...s} />)}
            </div>
            <InsightCard
              icon="⚠️"
              text="Defensive contribution is below average for your position. Aerial duel success (41%) and tackle win rate (54%) need focused improvement in training sessions."
              color="#e0d44e"
            />
          </div>
        )}

        {/* ── TACTICAL ── */}
        {activeTab === 'Tactical' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Tactical Analysis" subtitle="Heatmap, pressing & positioning" />
            <div className="sp2-chart-card">
              <div className="sp2-chart-title">PITCH HEATMAP</div>
              <div style={{ position: 'relative' }}>
                <div className="sp2-heatmap-pitch">
                  <div className="sp2-heatmap-center-line" />
                  <div className="sp2-heatmap-center-circle" />
                  <div className="sp2-heatmap-grid">
                    {heatmapCells.map((cell, i) => (
                      <div key={i} style={{ background: `rgba(245,166,35,${cell.intensity * 0.85})` }} />
                    ))}
                  </div>
                  <div className="sp2-heatmap-label">OPPONENT GOAL →</div>
                </div>
              </div>
              <div className="sp2-heatmap-legend">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
                  <div key={i} style={{ width: 24, height: 10, background: `rgba(245,166,35,${v})`, borderRadius: 3 }} />
                ))}
                <span className="sp2-heatmap-legend-label">Activity intensity</span>
              </div>
            </div>
            <div className="sp2-grid-3">
              {[
                { label: 'Pressing Success', value: '31%', pct: 62 },
                { label: 'PPDA',             value: '9.1', pct: 68 },
                { label: 'Position Score',   value: '74',  pct: 74 },
              ].map(s => <StatBar key={s.label} {...s} />)}
            </div>
          </div>
        )}

        {/* ── COMPARE ── */}
        {activeTab === 'Compare' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Player Comparison" subtitle="Head-to-head attribute analysis" />
            <div className="sp2-chart-card">
              <div className="sp2-compare-tags">
                <PlayerTag name="Aryan Mehta" color="#f5a623" />
                <span className="sp2-vs-label">VS</span>
                <PlayerTag name="R. Sharma" color="#ea80fc" />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={[
                  { subject: 'Physical',  A: 75, B: 80 },
                  { subject: 'Technical', A: 71, B: 68 },
                  { subject: 'Tactical',  A: 74, B: 70 },
                  { subject: 'Attacking', A: 70, B: 65 },
                  { subject: 'Defensive', A: 67, B: 75 },
                ]} outerRadius={90}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12 }} />
                  <Radar dataKey="A" stroke="#f5a623" fill="#f5a623" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#f5a623', r: 4 }} />
                  <Radar dataKey="B" stroke="#ea80fc" fill="#ea80fc" fillOpacity={0.1} strokeWidth={2} dot={{ fill: '#ea80fc', r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="sp2-compare-rows">
                {[
                  { label: 'Goals',      a: 9,     b: 7    },
                  { label: 'Assists',    a: 5,     b: 4    },
                  { label: 'Pass Acc.',  a: '82%', b: '78%'},
                  { label: 'Dribbles',   a: '65%', b: '60%'},
                  { label: 'Overall',    a: 71,    b: 74   },
                ].map(row => (
                  <div key={row.label} className="sp2-compare-row">
                    <span className="sp2-compare-a">{row.a}</span>
                    <span className="sp2-compare-label">{row.label.toUpperCase()}</span>
                    <span className="sp2-compare-b">{row.b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {activeTab === 'Report' && (
          <div className="sp2-tab-content">
            <SectionHeader title="Season Report" subtitle="Comprehensive performance summary" />
            <div className="sp2-chart-card">
              <div className="sp2-report-summary-label">SUMMARY</div>
              <p className="sp2-report-summary-text">
                Aryan has shown consistent improvement across attacking and technical areas this season,
                ranking #3 in Batch A. Technical precision and goal conversion are standout strengths.
                Defensive metrics remain the primary area requiring dedicated coaching attention.
              </p>
            </div>
            {reportGrades.map(r => (
              <div key={r.area} className="sp2-report-row">
                <div className="sp2-report-grade-box" style={{ background: `${r.color}20`, border: `1px solid ${r.color}40` }}>
                  <span style={{ color: r.color, fontWeight: 700, fontSize: 14 }}>{r.grade}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="sp2-report-area">{r.area}</div>
                  <div className="sp2-report-bar-bg">
                    <div className="sp2-report-bar-fill" style={{ width: `${r.score}%`, background: r.color }} />
                  </div>
                </div>
                <span style={{ color: r.color, fontSize: 18, fontWeight: 800 }}>{r.score}</span>
              </div>
            ))}
            <button className="sp2-export-btn">⬇ EXPORT PDF REPORT</button>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>

      <BottomNav />
    </div>
  )
}