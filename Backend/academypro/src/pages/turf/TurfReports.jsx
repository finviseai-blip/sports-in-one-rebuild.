/* TurfReports.jsx */
import { useState } from 'react'
import { TurfHeader } from '../../components/TurfHeader'
import TurfBottomNav from '../../components/TurfBottomNav'

const WEEKS=['W1','W2','W3','W4','W5','W6'], WEEK_REV=[4200,8600,11200,9800,8900,5900]
const MAX_WK=Math.max(...WEEK_REV)

export default function TurfReports() {
  const [period, setPeriod] = useState('month')
  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#0a0a0a'}}>
      <TurfHeader />
      <div style={{flex:1,overflowY:'auto',paddingBottom:80}}>
        <div style={{padding:'14px 16px 8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 style={{fontSize:20,fontWeight:800,color:'#fff',margin:0}}>Reports</h2>
          <div style={{display:'flex',background:'#111',border:'1px solid #1c1c1c',borderRadius:10,padding:3,gap:3}}>
            {['week','month','year'].map(p=>(
              <button key={p} style={{background:period===p?'#f5a623':'none',color:period===p?'#000':'#555',border:'none',borderRadius:7,padding:'6px 12px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}} onClick={()=>setPeriod(p)}>{p[0].toUpperCase()+p.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,padding:'0 16px 14px'}}>
          {[['₹48,600','Total Revenue','#f5a623'],['124','Total Bookings','#fff'],['4.8★','Avg Rating','#f5a623'],['73%','Occupancy','#4caf50']].map(([v,l,c])=>(
            <div key={l} style={{background:'#111',border:'1px solid #1c1c1c',borderRadius:16,padding:16}}>
              <p style={{fontSize:24,fontWeight:800,color:c,margin:'0 0 4px'}}>{v}</p>
              <p style={{fontSize:11,color:'#555',margin:0,textTransform:'uppercase',letterSpacing:.5,fontWeight:600}}>{l}</p>
            </div>
          ))}
        </div>

        {/* Weekly chart */}
        <p style={{fontSize:9,color:'#444',letterSpacing:1.3,fontWeight:700,textTransform:'uppercase',padding:'0 16px 8px'}}>WEEKLY REVENUE TREND</p>
        <div style={{display:'flex',gap:8,alignItems:'flex-end',height:120,padding:'0 16px 16px'}}>
          {WEEKS.map((w,i)=>(
            <div key={w} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,height:'100%'}}>
              <span style={{fontSize:9,color:'#555',fontWeight:600}}>₹{(WEEK_REV[i]/1000).toFixed(0)}K</span>
              <div style={{flex:1,width:'100%',display:'flex',alignItems:'flex-end'}}>
                <div style={{width:'100%',height:`${(WEEK_REV[i]/MAX_WK)*100}%`,background:i===5?'#f5a623':'#2a2a2a',borderRadius:'5px 5px 0 0',minHeight:4,transition:'height .3s'}} />
              </div>
              <span style={{fontSize:10,color:'#444',fontWeight:600}}>{w}</span>
            </div>
          ))}
        </div>

        {/* Court performance */}
        <p style={{fontSize:9,color:'#444',letterSpacing:1.3,fontWeight:700,textTransform:'uppercase',padding:'0 16px 8px'}}>COURT PERFORMANCE</p>
        <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:8}}>
          {[['⚽ Ground A','Football','87%','₹24,800','#4caf50'],['⚽ Ground B','Football','64%','₹18,200','#f5a623'],['🏏 Box Cricket','Cricket','52%','₹8,400','#2196F3'],['🏸 Badminton 1','Badminton','41%','₹3,200','#FF9800']].map(([name,sport,occ,rev,c])=>(
            <div key={name} style={{background:'#111',border:'1px solid #1c1c1c',borderRadius:14,padding:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div><p style={{fontSize:13,fontWeight:700,color:'#fff',margin:'0 0 2px'}}>{name}</p><p style={{fontSize:10,color:'#555',margin:0}}>{sport}</p></div>
                <span style={{fontSize:16,fontWeight:800,color:'#f5a623'}}>{rev}</span>
              </div>
              <div style={{height:6,background:'#1a1a1a',borderRadius:3,overflow:'hidden',marginBottom:5}}>
                <div style={{height:'100%',width:occ,background:c,borderRadius:3}} />
              </div>
              <p style={{fontSize:10,color:'#555',margin:0,fontWeight:600}}>{occ} occupied this month</p>
            </div>
          ))}
        </div>

        {/* Top players */}
        <p style={{fontSize:9,color:'#444',letterSpacing:1.3,fontWeight:700,textTransform:'uppercase',padding:'14px 16px 8px'}}>TOP PLAYERS THIS MONTH</p>
        <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:8}}>
          {[['AM','Arjun Mehta','Football','8 bookings','₹6,400'],['TR','Team RK','Football','5 bookings','₹8,000'],['PB','Premier Batting','Box Cricket','4 bookings','₹9,600'],['PP','Priya Patel','Badminton','10 bookings','₹4,000']].map(([init,name,sport,bk,spent])=>(
            <div key={name} style={{display:'flex',alignItems:'center',gap:12,background:'#111',border:'1px solid #1c1c1c',borderRadius:13,padding:12}}>
              <div style={{width:38,height:38,background:'#f5a623',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#000',flexShrink:0}}>{init}</div>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:700,color:'#fff',margin:'0 0 2px'}}>{name}</p>
                <p style={{fontSize:11,color:'#555',margin:0}}>{sport} · {bk}</p>
              </div>
              <span style={{fontSize:14,fontWeight:800,color:'#f5a623'}}>{spent}</span>
            </div>
          ))}
        </div>
      </div>
      <TurfBottomNav />
    </div>
  )
}
