import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts'

import Header from '../../components/Header'
import BottomNav from '../../components/BottomNav'
import './StudentPerformance.css'

const student = { name:'Aryan Mehta', position:'CF', number:9, batch:'Batch A', rank:3, age:17 }

const attrs = [
  { name:'Physical',  val:75 },
  { name:'Technical', val:71 },
  { name:'Attacking', val:70 },
  { name:'Defensive', val:67 },
  { name:'Tactical',  val:74 },
]

const physicalStats   = [{ label:'Top Speed', value:'28.4 km/h', pct:80 },{ label:'Distance/Session', value:'9.2 km', pct:74 },{ label:'Sprints/Session', value:'21', pct:70 },{ label:'High Intensity Runs', value:'38', pct:67 }]
const technicalStats  = [{ label:'Pass Accuracy', value:'82%', pct:82 },{ label:'Dribble Success', value:'65%', pct:65 },{ label:'Ball Retention', value:'78%', pct:78 },{ label:'Shot Accuracy', value:'61%', pct:61 }]
const attackingStats  = [{ label:'Goals', value:9, pct:85 },{ label:'Assists', value:5, pct:80 },{ label:'Shots on Target', value:34, pct:72 },{ label:'Key Passes', value:28, pct:76 },{ label:'xG', value:'7.4', pct:78 },{ label:'xA', value:'4.1', pct:68 }]
const defensiveStats  = [{ label:'Tackles Won', value:'54%', pct:54 },{ label:'Interceptions', value:14, pct:52 },{ label:'Clearances', value:6, pct:40 },{ label:'Aerial Duels Won', value:'41%', pct:41 }]
const sessionDistData = [{session:'S1',dist:8.6},{session:'S2',dist:9.4},{session:'S3',dist:8.1},{session:'S4',dist:9.8},{session:'S5',dist:9.2},{session:'S6',dist:8.9},{session:'S7',dist:9.6}]
const passNetworkData = [{player:'LW Sharma',passes:28,color:'#f5a623'},{player:'CM Raza',passes:35,color:'#e0d44e'},{player:'RB Singh',passes:18,color:'#ea80fc'},{player:'ST Verma',passes:22,color:'#76ff03'},{player:'CB Nair',passes:12,color:'#00e5ff'}]
const xgData          = [{match:'M1',xG:0.5},{match:'M2',xG:0.8},{match:'M3',xG:0.3},{match:'M4',xG:1.2},{match:'M5',xG:0.9},{match:'M6',xG:0.6},{match:'M7',xG:1.1}]
const heatmapCells    = Array.from({length:60},(_,i) => { const col=i%10,row=Math.floor(i/10); const intensity=col>=5&&row>=1&&row<=4?Math.random()*0.8+0.2:col>=3&&row>=2&&row<=3?Math.random()*0.5+0.1:Math.random()*0.15; return {col,row,intensity} })
const reportGrades    = [{area:'Attacking',score:85,grade:'A',color:'#f5a623'},{area:'Technical',score:82,grade:'A',color:'#f5a623'},{area:'Tactical',score:74,grade:'B+',color:'#e0d44e'},{area:'Physical',score:75,grade:'B+',color:'#e0d44e'},{area:'Defensive',score:54,grade:'C+',color:'#e05c5c'}]

const tabs = ['Physical','Technical','Attacking','Defensive','Tactical','Compare','Report']
const tooltipStyle = { background:'#111111', border:'1px solid #2a2a2a', borderRadius:8, color:'#ffffff', fontSize:12 }

function getColor(pct) { return pct>=75?'#f5a623':pct>=60?'#e0d44e':'#e05c5c' }
function StatBar({ label, value, pct }) {
  const color = getColor(pct)
  return (
    <div className="sp2-stat-bar-card">
      <div className="sp2-stat-bar-top"><span className="sp2-stat-bar-label">{label.toUpperCase()}</span><span className="sp2-stat-bar-value" style={{color}}>{value}</span></div>
      <div className="sp2-stat-bar-bg"><div className="sp2-stat-bar-fill" style={{width:`${pct}%`,background:color}} /></div>
      <div className="sp2-stat-bar-pct">{pct}th percentile</div>
    </div>
  )
}
function SectionHeader({ title, subtitle }) {
  return <div className="sp2-section-header"><div className="sp2-section-title">{title}</div><div className="sp2-section-sub">{subtitle}</div></div>
}
function InsightCard({ icon, text, color }) {
  return <div className="sp2-insight-card" style={{background:`${color}12`,border:`1px solid ${color}35`}}><span style={{fontSize:20}}>{icon}</span><span className="sp2-insight-text">{text}</span></div>
}
function PlayerTag({ name, color }) {
  return <div className="sp2-player-tag" style={{background:`${color}18`,border:`1px solid ${color}45`,color}}>{name}</div>
}

/* ── FIFA-INSPIRED PLAYER CARD ── */
function PlayerCard({ score, name, position, attrs: cardAttrs }) {
  const tier    = score >= 90 ? 'gold' : score >= 80 ? 'silver' : 'bronze'
  const tierMap = {
    gold:   { label:'GOLD',   bg:'linear-gradient(145deg,#b8902a 0%,#f5d060 35%,#ffe87c 55%,#c9a227 80%,#7c5c10 100%)', glow:'rgba(245,208,96,.45)', textColor:'#1a0e00', numColor:'#3d1f00', statColor:'#4a2800' },
    silver: { label:'SILVER', bg:'linear-gradient(145deg,#607080 0%,#a8bcc8 35%,#cfe0ec 55%,#8faabb 80%,#3a4d5a 100%)', glow:'rgba(168,188,200,.35)', textColor:'#0a1a22', numColor:'#0a1a22', statColor:'#0d2030' },
    bronze: { label:'BRONZE', bg:'linear-gradient(145deg,#7a4520 0%,#c07040 35%,#e09060 55%,#a05030 80%,#4a200a 100%)', glow:'rgba(192,112,64,.4)', textColor:'#1a0800', numColor:'#1a0800', statColor:'#220c00' },
  }
  const t = tierMap[tier]
  const cardStats = [
    { k:'PAC', v: cardAttrs.find(a=>a.name==='Physical')?.val||75 },
    { k:'SHO', v: cardAttrs.find(a=>a.name==='Attacking')?.val||70 },
    { k:'PAS', v: cardAttrs.find(a=>a.name==='Technical')?.val||71 },
    { k:'DRI', v: cardAttrs.find(a=>a.name==='Tactical')?.val||74 },
    { k:'DEF', v: cardAttrs.find(a=>a.name==='Defensive')?.val||67 },
    { k:'PHY', v: cardAttrs.find(a=>a.name==='Physical')?.val||75 },
  ]

  return (
    <div className="pc-wrap">
      <div className="pc-card" style={{background:t.bg, boxShadow:`0 0 40px ${t.glow}, 0 20px 60px rgba(0,0,0,.8)`}}>
        {/* Corner metallic sheen */}
        <div className="pc-sheen" />

        {/* Top-left: score, position, icons */}
        <div className="pc-top-left">
          <span className="pc-score" style={{color:t.numColor}}>{score}</span>
          <span className="pc-position" style={{color:t.numColor}}>{position}</span>
          <span className="pc-tier-icon">{tier==='gold'?'★':tier==='silver'?'◆':'●'}</span>
          <span className="pc-rank" style={{color:t.numColor}}>#{student.rank}</span>
        </div>

        {/* Player avatar area */}
        <div className="pc-avatar-zone">
          <div className="pc-avatar">{student.number}</div>
        </div>

        {/* Name banner */}
        <div className="pc-name-band">
          <span className="pc-name" style={{color:t.textColor}}>{name.toUpperCase()}</span>
        </div>

        {/* Divider */}
        <div className="pc-divider" style={{background:`${t.textColor}40`}} />

        {/* Stats grid */}
        <div className="pc-stats">
          {cardStats.map(s => (
            <div key={s.k} className="pc-stat">
              <span className="pc-stat-val" style={{color:t.numColor}}>{s.v}</span>
              <span className="pc-stat-key" style={{color:t.statColor}}>{s.k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier label below card */}
      <div className={`pc-tier-badge ${tier}`}>{t.label}</div>
      <p className="pc-tier-desc">
        {tier==='gold' ? '🏆 Elite performer · 90+ overall rating' :
         tier==='silver' ? '🥈 Strong performer · 80–89 overall rating' :
                          '🥉 Developing player · Below 80 overall'}
      </p>

      {/* Tier thresholds */}
      <div className="pc-tiers">
        <div className={`pc-tier-row ${tier==='gold'?'active':''}`}><span className="gold-label">GOLD</span><span>≥ 90 · Premium look</span></div>
        <div className={`pc-tier-row ${tier==='silver'?'active':''}`}><span className="silver-label">SILVER</span><span>80–89 · Moderate</span></div>
        <div className={`pc-tier-row ${tier==='bronze'?'active':''}`}><span className="bronze-label">BRONZE</span><span>Below 80 · Normal but attractive</span></div>
      </div>
    </div>
  )
}

export default function StudentPerformance() {
  const [activeTab, setActiveTab] = useState('Physical')
  const [editing, setEditing]     = useState(false)
  const [stats, setStats]         = useState({ matches:14, goals:9, assists:5 })
  const [editStats, setEditStats] = useState({ ...stats })
  const [showCard, setShowCard]   = useState(false)

  const score     = Math.round(attrs.reduce((s,a)=>s+a.val,0)/attrs.length)
  const radarData = attrs.map(a=>({subject:a.name,A:a.val}))

  return (
    <div className="sp-page">
      <Header />
      <div className="sp-scroll">

        {/* Title */}
        <div className="sp-title-row">
          <div>
            <h2 className="sp-title">Performance</h2>
            <p className="sp-rank-sub">Your ranking: <span>#3 in Batch A</span></p>
          </div>
          <button className="sp-edit-btn" onClick={()=>setEditing(p=>!p)}>
            ✏️ {editing?'Editing':'Edit Mode'}
          </button>
        </div>

        {/* Score block — score bubble at RIGHT CORNER ONLY, bars stop before it */}
        {editing ? (
          <div className="sp-edit-card">
            <p className="sp-edit-label">Update Your Stats</p>
            <div className="sp-edit-grid">
              {['matches','goals','assists'].map(k=>(
                <div key={k} className="sp-edit-field">
                  <label>{k}</label>
                  <input type="number" value={editStats[k]} onChange={e=>setEditStats(p=>({...p,[k]:+e.target.value}))} />
                </div>
              ))}
            </div>
            <div className="sp-edit-actions">
              <button className="sp-save-btn" onClick={()=>{setStats(editStats);setEditing(false)}}>✓ Save</button>
              <button className="sp-cancel-btn" onClick={()=>{setEditStats(stats);setEditing(false)}}>✕ Cancel</button>
            </div>
          </div>
        ) : (
          <div className="sp-bars-card">
            {/* Bars area — takes only left portion, score on right */}
            <div className="sp-bars-area">
              {attrs.map(a => (
                <div key={a.name} className="sp-attr-row">
                  <span className="sp-attr-name">{a.name}</span>
                  <div className="sp-attr-bar-wrap">
                    <div className="sp-attr-bar" style={{width:`${a.val}%`}} />
                  </div>
                  <span className="sp-attr-val">{a.val}</span>
                </div>
              ))}
            </div>
            {/* Score bubble — click to show FIFA card */}
            <div className="sp-score-panel">
              <div className="sp-score-circle" onClick={()=>setShowCard(p=>!p)} style={{cursor:'pointer'}} title="Click to view your player card">
                <span>{score}</span>
                <label>OVR</label>
              </div>
              <div className="sp-rank-badge">⭐ #{student.rank}</div>
              <div className="sp-card-hint">{showCard?'▲ Hide':'▼ Card'}</div>
            </div>
          </div>
        )}

        {/* KPI row */}
        <div className="sp-kpi-row">
          <div><span>{stats.matches}</span><label>Matches</label></div>
          <div><span>{stats.goals}</span><label>Goals</label></div>
          <div><span>{stats.assists}</span><label>Assists</label></div>
        </div>

        {/* Inline FIFA Card — shown when score is clicked */}
        {showCard && (
          <div className="sp2-tab-content">
            <SectionHeader title="Your Player Card" subtitle="Generated from your overall performance" />
            <PlayerCard score={score} name={student.name} position={student.position} attrs={attrs} />
            {/* Share button */}
            <button className="sp-share-btn" onClick={() => { if (navigator.share) navigator.share({ title:'My AcademyPro Card', text:`${student.name} · OVR ${score}` }).catch(()=>{}) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share My Card
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="sp-tabs-wrap"><div className="sp-tabs">
          {tabs.map(t => (
            <button key={t} className={`sp-tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>{t}</button>
          ))}
        </div></div>

        {/* ── PHYSICAL ── */}
        {activeTab==='Physical' && <div className="sp2-tab-content"><SectionHeader title="Physical Performance" subtitle="Athletic metrics & movement data" /><div className="sp2-grid-2">{physicalStats.map(s=><StatBar key={s.label} {...s} />)}</div><div className="sp2-chart-card"><div className="sp2-chart-title">DISTANCE COVERED — LAST 7 SESSIONS (km)</div><ResponsiveContainer width="100%" height={200}><BarChart data={sessionDistData}><XAxis dataKey="session" tick={{fill:'#666666',fontSize:11}} axisLine={false} tickLine={false} /><YAxis domain={[7,11]} tick={{fill:'#666666',fontSize:11}} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="dist" radius={[4,4,0,0]}>{sessionDistData.map((v,i)=><Cell key={i} fill={v.dist>=9.5?'#f5a623':'#3a3a3a'} />)}</Bar></BarChart></ResponsiveContainer></div></div>}

        {/* ── TECHNICAL ── */}
        {activeTab==='Technical' && <div className="sp2-tab-content"><SectionHeader title="Technical Skills" subtitle="Ball control, passing & shooting" /><div className="sp2-grid-2">{technicalStats.map(s=><StatBar key={s.label} {...s} />)}</div><div className="sp2-chart-card"><div className="sp2-chart-title">PASS NETWORK — TOP CONNECTIONS</div><ResponsiveContainer width="100%" height={200}><BarChart data={passNetworkData} layout="vertical"><XAxis type="number" tick={{fill:'#666666',fontSize:11}} axisLine={false} tickLine={false} /><YAxis dataKey="player" type="category" tick={{fill:'#cccccc',fontSize:11}} axisLine={false} tickLine={false} width={90} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="passes" radius={[0,4,4,0]}>{passNetworkData.map((e,i)=><Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer></div></div>}

        {/* ── ATTACKING ── */}
        {activeTab==='Attacking' && <div className="sp2-tab-content"><SectionHeader title="Attacking Performance" subtitle="Goals, xG, assists & chance creation" /><div className="sp2-grid-2">{attackingStats.map(s=><StatBar key={s.label} {...s} />)}</div><div className="sp2-chart-card"><div className="sp2-chart-title">xG PER MATCH</div><ResponsiveContainer width="100%" height={200}><BarChart data={xgData}><XAxis dataKey="match" tick={{fill:'#666666',fontSize:11}} axisLine={false} tickLine={false} /><YAxis tick={{fill:'#666666',fontSize:11}} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="xG" radius={[4,4,0,0]}>{xgData.map((v,i)=><Cell key={i} fill={v.xG>=1?'#f5a623':'#3a3a3a'} />)}</Bar></BarChart></ResponsiveContainer></div></div>}

        {/* ── DEFENSIVE ── */}
        {activeTab==='Defensive' && <div className="sp2-tab-content"><SectionHeader title="Defensive Metrics" subtitle="Tackles, interceptions & duels" /><div className="sp2-grid-2">{defensiveStats.map(s=><StatBar key={s.label} {...s} />)}</div><InsightCard icon="⚠️" text="Defensive contribution is below average for your position. Aerial duel success (41%) and tackle win rate (54%) need focused improvement in training sessions." color="#e0d44e" /></div>}

        {/* ── TACTICAL ── */}
        {activeTab==='Tactical' && <div className="sp2-tab-content"><SectionHeader title="Tactical Analysis" subtitle="Heatmap, pressing & positioning" /><div className="sp2-chart-card"><div className="sp2-chart-title">PITCH HEATMAP</div><div style={{position:'relative'}}><div className="sp2-heatmap-pitch"><div className="sp2-heatmap-center-line" /><div className="sp2-heatmap-center-circle" /><div className="sp2-heatmap-grid">{heatmapCells.map((cell,i)=><div key={i} style={{background:`rgba(245,166,35,${cell.intensity*0.85})`}} />)}</div><div className="sp2-heatmap-label">OPPONENT GOAL →</div></div></div></div><div className="sp2-grid-3">{[{label:'Pressing Success',value:'31%',pct:62},{label:'PPDA',value:'9.1',pct:68},{label:'Position Score',value:'74',pct:74}].map(s=><StatBar key={s.label} {...s} />)}</div></div>}

        {/* ── COMPARE ── */}
        {activeTab==='Compare' && <div className="sp2-tab-content"><SectionHeader title="Player Comparison" subtitle="Head-to-head attribute analysis" /><div className="sp2-chart-card"><div className="sp2-compare-tags"><PlayerTag name="Aryan Mehta" color="#f5a623" /><span className="sp2-vs-label">VS</span><PlayerTag name="R. Sharma" color="#ea80fc" /></div><ResponsiveContainer width="100%" height={260}><RadarChart data={[{subject:'Physical',A:75,B:80},{subject:'Technical',A:71,B:68},{subject:'Tactical',A:74,B:70},{subject:'Attacking',A:70,B:65},{subject:'Defensive',A:67,B:75}]} outerRadius={90}><PolarGrid stroke="#2a2a2a" /><PolarAngleAxis dataKey="subject" tick={{fill:'#888888',fontSize:12}} /><Radar dataKey="A" stroke="#f5a623" fill="#f5a623" fillOpacity={0.2} strokeWidth={2} dot={{fill:'#f5a623',r:4}} /><Radar dataKey="B" stroke="#ea80fc" fill="#ea80fc" fillOpacity={0.1} strokeWidth={2} dot={{fill:'#ea80fc',r:3}} /></RadarChart></ResponsiveContainer><div className="sp2-compare-rows">{[{label:'Goals',a:9,b:7},{label:'Assists',a:5,b:4},{label:'Pass Acc.',a:'82%',b:'78%'},{label:'Dribbles',a:'65%',b:'60%'},{label:'Overall',a:71,b:74}].map(row=><div key={row.label} className="sp2-compare-row"><span className="sp2-compare-a">{row.a}</span><span className="sp2-compare-label">{row.label.toUpperCase()}</span><span className="sp2-compare-b">{row.b}</span></div>)}</div></div></div>}

        {/* ── REPORT ── */}
        {activeTab==='Report' && <div className="sp2-tab-content"><SectionHeader title="Season Report" subtitle="Comprehensive performance summary" /><div className="sp2-chart-card"><div className="sp2-report-summary-label">SUMMARY</div><p className="sp2-report-summary-text">Aryan has shown consistent improvement across attacking and technical areas this season, ranking #3 in Batch A. Technical precision and goal conversion are standout strengths. Defensive metrics remain the primary area requiring dedicated coaching attention.</p></div>{reportGrades.map(r=><div key={r.area} className="sp2-report-row"><div className="sp2-report-grade-box" style={{background:`${r.color}20`,border:`1px solid ${r.color}40`}}><span style={{color:r.color,fontWeight:700,fontSize:14}}>{r.grade}</span></div><div style={{flex:1}}><div className="sp2-report-area">{r.area}</div><div className="sp2-report-bar-bg"><div className="sp2-report-bar-fill" style={{width:`${r.score}%`,background:r.color}} /></div></div><span style={{color:r.color,fontSize:18,fontWeight:800}}>{r.score}</span></div>)}<button className="sp2-export-btn">⬇ EXPORT PDF REPORT</button></div>}

        <div style={{height:80}} />
      </div>
      <BottomNav />
    </div>
  )
}
