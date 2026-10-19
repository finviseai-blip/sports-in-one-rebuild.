import { useState } from 'react'
import { TurfHeader } from '../../components/TurfHeader'
import TurfBottomNav from '../../components/TurfBottomNav'
import './TurfReports.css'

const DATA = {
  week: {
    label: 'This Week',
    metrics: [['₹11,400','Revenue','#f5a623'],['28','Bookings','#fff'],['4.9★','Rating','#f5a623'],['81%','Occupancy','#4caf50']],
    barLabels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    barValues: [800, 1600, 2400, 800, 1600, 3200, 1000],
    courts: [['⚽ Ground A','Football','91%','₹6,400','#4caf50'],['⚽ Ground B','Football','78%','₹3,200','#f5a623'],['🏏 Box Cricket','Cricket','63%','₹1,200','#2196F3'],['🏸 Badminton','Badminton','52%','₹600','#FF9800']],
  },
  month: {
    label: 'This Month',
    metrics: [['₹48,600','Revenue','#f5a623'],['124','Bookings','#fff'],['4.8★','Rating','#f5a623'],['73%','Occupancy','#4caf50']],
    barLabels: ['W1','W2','W3','W4','W5','W6'],
    barValues: [4200, 8600, 11200, 9800, 8900, 5900],
    courts: [['⚽ Ground A','Football','87%','₹24,800','#4caf50'],['⚽ Ground B','Football','64%','₹18,200','#f5a623'],['🏏 Box Cricket','Cricket','52%','₹8,400','#2196F3'],['🏸 Badminton','Badminton','41%','₹3,200','#FF9800']],
  },
  year: {
    label: 'This Year',
    metrics: [['₹4.2L','Revenue','#f5a623'],['1,240','Bookings','#fff'],['4.7★','Rating','#f5a623'],['68%','Occupancy','#4caf50']],
    barLabels: ['Oct','Nov','Dec','Jan','Feb','Mar'],
    barValues: [22400, 28600, 35200, 41800, 44200, 48600],
    courts: [['⚽ Ground A','Football','84%','₹1,82,000','#4caf50'],['⚽ Ground B','Football','61%','₹1,32,000','#f5a623'],['🏏 Box Cricket','Cricket','49%','₹54,000','#2196F3'],['🏸 Badminton','Badminton','38%','₹24,000','#FF9800']],
  },
}

export default function TurfReports() {
  const [period, setPeriod] = useState('month')
  const d = DATA[period]
  const maxBar = Math.max(...d.barValues)

  return (
    <div className="tr-page">
      <TurfHeader />
      <div className="tr-scroll">
        <div className="tr-header">
          <h2 className="tr-title">Reports</h2>
          <div className="tr-period-pills">
            {['week','month','year'].map(p=>(
              <button key={p} className={`tr-pill ${period===p?'on':''}`} onClick={()=>setPeriod(p)}>
                {p[0].toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <p className="tr-period-label">{d.label}</p>

        {/* Key metrics */}
        <div className="tr-metrics">
          {d.metrics.map(([v,l,c])=>(
            <div key={l} className="tr-metric-card">
              <p className="tr-metric-val" style={{color:c}}>{v}</p>
              <p className="tr-metric-lbl">{l}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <p className="tr-sec-label">REVENUE TREND</p>
        <div className="tr-bars">
          {d.barLabels.map((lbl,i)=>(
            <div key={lbl} className="tr-bar-col">
              <span className="tr-bar-val">
                {d.barValues[i]>=1000 ? `₹${(d.barValues[i]/1000).toFixed(0)}K` : `₹${d.barValues[i]}`}
              </span>
              <div className="tr-bar-track">
                <div className="tr-bar-fill" style={{
                  height:`${(d.barValues[i]/maxBar)*100}%`,
                  background: d.barValues[i]===maxBar ? '#f5a623' : '#2a2a2a'
                }} />
              </div>
              <span className="tr-bar-lbl">{lbl}</span>
            </div>
          ))}
        </div>

        {/* Court performance */}
        <p className="tr-sec-label">COURT PERFORMANCE</p>
        <div className="tr-courts">
          {d.courts.map(([name,sport,occ,rev,c])=>(
            <div key={name} className="tr-court-card">
              <div className="tr-court-top">
                <div>
                  <p className="tr-court-name">{name}</p>
                  <p className="tr-court-sport">{sport}</p>
                </div>
                <span className="tr-court-rev">{rev}</span>
              </div>
              <div className="tr-occ-bar">
                <div style={{width:occ, background:c}} />
              </div>
              <p className="tr-occ-label">{occ} occupancy</p>
            </div>
          ))}
        </div>

        {/* Top players */}
        <p className="tr-sec-label">TOP PLAYERS</p>
        <div className="tr-players">
          {[['AM','Arjun Mehta','Football','8 bookings','₹6,400'],['TR','Team RK','Football','5 bookings','₹8,000'],['PB','Premier Batting','Box Cricket','4 bookings','₹9,600'],['PP','Priya Patel','Badminton','10 bookings','₹4,000']].map(([init,name,sport,bk,spent])=>(
            <div key={name} className="tr-player-row">
              <div className="tr-player-av">{init}</div>
              <div className="tr-player-info">
                <p className="tr-player-name">{name}</p>
                <p className="tr-player-sub">{sport} · {bk}</p>
              </div>
              <span className="tr-player-spent">{spent}</span>
            </div>
          ))}
        </div>

        <div style={{height:100}} />
      </div>
      <TurfBottomNav />
    </div>
  )
}
