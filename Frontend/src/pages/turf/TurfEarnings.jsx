import { useState } from "react";
import { TurfHeader } from "../../components/TurfHeader";
import TurfBottomNav from "../../components/TurfBottomNav";
import "./TurfEarnings.css";

const MONTHS = ["Oct","Nov","Dec","Jan","Feb","Mar"];
const REV = [22400,28600,35200,41800,44200,48600];
const MAX = Math.max(...REV);

const TXS = [
  {t:"booking",ic:"⚽",name:"Arjun Mehta",sub:"Ground A · 6:00 AM · Mar 6",amt:800,cr:true,st:"settled"},
  {t:"booking",ic:"⚽",name:"Team RK",sub:"Ground A · 8:00 AM · Mar 6",amt:1600,cr:true,st:"settled"},
  {t:"payout",ic:"💳",name:"UPI Payout",sub:"raj@upi · Mar 6",amt:4800,cr:false,st:"paid"},
  {t:"booking",ic:"🏏",name:"Premier Batting",sub:"Box Cricket · 7:00 PM · Mar 5",amt:2400,cr:true,st:"settled"},
  {t:"booking",ic:"🏸",name:"Priya Patel",sub:"Badminton · 8:00 PM · Mar 5",amt:400,cr:true,st:"settled"},
  {t:"refund",ic:"↩️",name:"Rohit Verma",sub:"Cancellation refund · Mar 3",amt:800,cr:false,st:"refunded"},
  {t:"payout",ic:"💳",name:"UPI Payout",sub:"raj@upi · Feb 28",amt:12600,cr:false,st:"paid"},
];

export default function TurfEarnings(){

const [tab,setTab]=useState("overview");
const [showWd,setShowWd]=useState(false);
const [wdAmt,setWdAmt]=useState("");
const [wdDone,setWdDone]=useState(false);
const [upi,setUpi]=useState("raj@upi");
const [showPending,setShowPending]=useState(false);

const PENDING_PAYMENTS=[
{id:1,name:"Rahul + 6",court:"Ground B",slot:"9:00 AM · Mar 8",amt:800,due:"Today",initials:"RP"},
{id:2,name:"Nita Desai",court:"Ground A",slot:"6:00 AM · Mar 9",amt:1600,due:"Tomorrow",initials:"ND"},
{id:3,name:"Star Eleven",court:"Ground A",slot:"7:00 PM · Mar 10",amt:800,due:"Mar 10",initials:"SE"},
];

const doWd=()=>{
if(!wdAmt)return;
setWdDone(true);
setTimeout(()=>{
setWdDone(false);
setShowWd(false);
setWdAmt("");
},2000);
};

return(
<div className="te-page">

<TurfHeader/>

<div className="te-scroll">

{/* HERO */}
<div className="te-hero">
<div>
<p className="te-hero-lbl">Available Balance</p>
<p className="te-hero-amt">₹6,400</p>
<p className="te-hero-sub">Last payout ₹4,800 · {upi}</p>
</div>
<button className="te-wd-btn" onClick={()=>setShowWd(p=>!p)}>
{showWd?"✕":"💳 Withdraw"}
</button>
</div>

{/* WITHDRAW PANEL */}
{showWd && (
<div className="te-wd-panel">
<p className="te-wd-hd">Withdraw to UPI</p>
<div className="te-wd-upi">UPI: <span>{upi}</span></div>

<div className="te-wd-presets">
{[1000,2000,5000,6400].map(a=>(
<button key={a}
className={`te-wd-pre ${wdAmt===String(a)?"on":""}`}
onClick={()=>setWdAmt(String(a))}
>
₹{a.toLocaleString()}
</button>
))}
</div>

<input
className="te-wd-inp"
type="number"
placeholder="Enter amount"
value={wdAmt}
onChange={e=>setWdAmt(e.target.value)}
/>

<button
className={`te-wd-confirm ${wdDone?"done":""}`}
onClick={doWd}
disabled={!wdAmt||wdDone}
>
{wdDone?"✓ Initiated!":"Withdraw →"}
</button>
</div>
)}

{/* CARDS */}
<div className="te-3cards">
{[
["₹48.6K","This Month","#f5a623"],
["₹6,400","This Week","#4caf50"],
["₹2,000","Pending","#e53935"],
].map(([v,l,c])=>(
<div
key={l}
className={`te-3card ${l==="Pending"?"te-clickable":""}`}
onClick={l==="Pending"?()=>setShowPending(p=>!p):undefined}
>
<span style={{color:c}}>{v}</span>
<span>{l}</span>
{l==="Pending" && (
<span style={{fontSize:9,color:"#e53935"}}>
{showPending?"▲ Hide":"▼ View"}
</span>
)}
</div>
))}
</div>

{/* PENDING PAYMENTS */}
{showPending && (
<div className="te-pending-panel">
<div className="te-pending-title">⏳ Pending Payments</div>

{PENDING_PAYMENTS.map(p=>(
<div key={p.id} className="te-pending-row">

<div className="te-pending-avatar">{p.initials}</div>

<div className="te-pending-info">
<span className="te-pending-name">{p.name}</span>
<span className="te-pending-sub">{p.court} · {p.slot}</span>
</div>

<div className="te-pending-right">
<span className="te-pending-amt">₹{p.amt}</span>
<span className="te-pending-due">{p.due}</span>
</div>

</div>
))}
</div>
)}

{/* TABS */}
<div className="te-tabs">
{["overview","transactions","payouts"].map(t=>(
<button
key={t}
className={`te-tab ${tab===t?"on":""}`}
onClick={()=>setTab(t)}
>
{t[0].toUpperCase()+t.slice(1)}
</button>
))}
</div>

{/* OVERVIEW */}
{tab==="overview" && (
<>
<p className="te-sec">MONTHLY REVENUE</p>

<div className="te-bars">
{MONTHS.map((m,i)=>(
<div key={m} className="te-bar-col">

<span className="te-bv">
₹{(REV[i]/1000).toFixed(0)}K
</span>

<div className="te-btrack">
<div
className="te-bfill"
style={{
height:`${(REV[i]/MAX)*100}%`,
background:i===5?"#f5a623":"#2a2a2a"
}}
/>
</div>

<span className="te-bm">{m}</span>

</div>
))}
</div>
</>
)}

{/* TRANSACTIONS */}
{tab==="transactions" && (
<div className="te-txlist">

{TXS.map((tx,i)=>(
<div key={i} className="te-tx">

<div className={`te-tx-ic ${tx.t}`}>
{tx.ic}
</div>

<div className="te-tx-info">
<p className="te-tx-nm">{tx.name}</p>
<p className="te-tx-sub">{tx.sub}</p>
</div>

<div className="te-tx-r">
<span className={`te-tx-amt ${tx.cr?"cr":"dr"}`}>
{tx.cr?"+":"-"}₹{tx.amt.toLocaleString()}
</span>
<span className={`te-tx-st ${tx.st}`}>
{tx.st}
</span>
</div>

</div>
))}

</div>
)}

{/* PAYOUTS */}
{tab==="payouts" && (
<div className="te-payouts">

<div className="te-upi-card">
<span>💳 {upi}</span>
<button
className="te-upi-change"
onClick={()=>{
const n=prompt("New UPI");
if(n)setUpi(n);
}}
>
Change
</button>
</div>

<div className="te-payout-sched">
<span>📅 Every Monday</span>
<span className="te-ps-sub">
Mon–Sun settled next Monday
</span>
</div>

{[
["Mar 6","₹4,800"],
["Feb 28","₹12,600"],
["Feb 21","₹9,200"],
["Feb 14","₹8,400"],
].map(([d,a],i)=>(
<div key={i} className="te-ph-row">

<div>
<p className="te-ph-d">{d}</p>
<p className="te-ph-u">{upi}</p>
</div>

<span className="te-ph-a">{a}</span>

</div>
))}

</div>
)}

<div style={{height:80}}/>

</div>

<TurfBottomNav/>

</div>
);
}