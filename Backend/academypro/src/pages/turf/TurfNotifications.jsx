import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TurfBottomNav from '../../components/TurfBottomNav'

const INIT=[
  {id:1,type:'booking',icon:'📋',color:'#f5a623',title:'New Booking Request',body:"Arjun Mehta wants to book Ground A · 6:00 AM · Mar 7.",time:'2m ago',read:false},
  {id:2,type:'payment',icon:'💰',color:'#4caf50',title:'Payment Received',body:"₹1,600 received from Team RK for Mar 6 booking.",time:'32m ago',read:false},
  {id:3,type:'payout', icon:'💳',color:'#4caf50',title:'Payout Settled',body:"₹4,800 settled to raj@upi successfully.",time:'2h ago',read:false},
  {id:4,type:'cancel', icon:'❌',color:'#e53935',title:'Booking Cancelled',body:"Rohit Verma cancelled 7:00 PM slot on Ground A.",time:'5h ago',read:true},
  {id:5,type:'review', icon:'⭐',color:'#f5a623',title:'New 5★ Review',body:"Arjun Mehta: 'Best football turf in Andheri!'",time:'1d ago',read:true},
  {id:6,type:'system', icon:'🏟️',color:'#888',title:'Venue Verified',body:"Your documents have been verified. Venue is live!",time:'2d ago',read:true},
]
const FILTERS=['All','Bookings','Payments','Reviews','System']
const filterMap={Bookings:'booking',Payments:'payment',Reviews:'review',System:'system'}

export default function TurfNotifications() {
  const navigate = useNavigate()
  const [notifs,setNotifs]=useState(INIT)
  const [filter,setFilter]=useState('All')
  const filtered=filter==='All'?notifs:notifs.filter(n=>n.type===filterMap[filter]||n.type===filterMap[filter]?.toLowerCase()||n.type==='cancel'&&filter==='Bookings')
  const unread=notifs.filter(n=>!n.read).length

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#0a0a0a'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 16px',background:'#111',borderBottom:'1px solid #1c1c1c',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button style={{background:'none',border:'none',color:'#888',fontSize:20,cursor:'pointer'}} onClick={()=>navigate(-1)}>←</button>
          <div>
            <h2 style={{fontSize:17,fontWeight:700,color:'#fff',margin:0}}>Notifications</h2>
            {unread>0&&<span style={{fontSize:10,color:'#f5a623',fontWeight:600}}>{unread} unread</span>}
          </div>
        </div>
        {unread>0&&<button style={{background:'none',border:'none',color:'#f5a623',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))}>Mark all read</button>}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:7,overflowX:'auto',padding:'10px 16px'}}>
        {FILTERS.map(f=>(
          <button key={f} style={{background:filter===f?'#f5a623':'#111',border:`1px solid ${filter===f?'#f5a623':'#1c1c1c'}`,color:filter===f?'#000':'#444',fontSize:11,fontWeight:600,padding:'7px 14px',borderRadius:20,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',transition:'all .2s'}} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* List */}
      <div style={{padding:'0 16px',display:'flex',flexDirection:'column',gap:8,flex:1,overflowY:'auto',paddingBottom:80}}>
        {filtered.map(n=>(
          <div key={n.id} style={{display:'flex',gap:12,alignItems:'flex-start',background:'#111',border:`1px solid ${n.read?'#1c1c1c':'#2a2a2a'}`,borderRadius:14,padding:14,cursor:'pointer'}} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}>
            <div style={{width:40,height:40,borderRadius:12,background:`${n.color}18`,border:`1px solid ${n.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{n.title}</span>
                {!n.read&&<span style={{width:7,height:7,borderRadius:'50%',background:n.color,flexShrink:0}}/>}
              </div>
              <p style={{fontSize:12,color:'#777',margin:'0 0 4px',lineHeight:1.5}}>{n.body}</p>
              <span style={{fontSize:10,color:'#444'}}>{n.time}</span>
            </div>
            <button style={{background:'none',border:'none',color:'#333',fontSize:13,cursor:'pointer',flexShrink:0,transition:'color .2s'}} onClick={e=>{e.stopPropagation();setNotifs(p=>p.filter(x=>x.id!==n.id))}}>✕</button>
          </div>
        ))}
      </div>
      <TurfBottomNav />
    </div>
  )
}
