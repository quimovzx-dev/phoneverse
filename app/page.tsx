"use client";
import {useMemo,useState} from "react";
import {Search,ChevronRight,Network,Building2,Smartphone,Layers3,ArrowUpRight} from "lucide-react";
import {nodes,Node} from "../data/phones";
const icons:any={company:Building2,brand:Network,subbrand:Layers3,series:Layers3,model:Smartphone};
export default function Home(){
 const [q,setQ]=useState(""); const [selected,setSelected]=useState<Node>(nodes[0]);
 const companies=nodes.filter(n=>n.type==="company");
 const visible=useMemo(()=>nodes.filter(n=>[n.name,n.desc,...n.tags].join(" ").toLowerCase().includes(q.toLowerCase())),[q]);
 const children=nodes.filter(n=>n.parent===selected.id);
 return <main>
  <header><div className="logo">PHONE<span>VERSE</span></div><nav><a href="#explore">Explore</a><a href="#map">Family Map</a><a href="#about">About</a></nav><button className="ghost">Global Index <ArrowUpRight size={15}/></button></header>
  <section className="hero"><div className="eyebrow">THE GLOBAL PHONE KNOWLEDGE GRAPH</div><h1>Every phone.<br/><i>Every lineage.</i></h1><p>Trace the world's phone industry from parent corporations to brands, sub-brands, series and individual models.</p><div className="search"><Search size={20}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search companies, brands, series or models..." /></div><div className="stats"><div><b>{companies.length}</b><span>Corporate groups</span></div><div><b>{nodes.filter(n=>n.type==="brand"||n.type==="subbrand").length}</b><span>Brands & sub-brands</span></div><div><b>∞</b><span>Phones to map</span></div></div></section>
  <section id="explore" className="section"><div className="sectionHead"><div><div className="eyebrow">EXPLORE THE INDUSTRY</div><h2>Corporate family tree</h2></div><span>{visible.length} mapped entities</span></div>
   <div className="workspace"><aside>{visible.filter(n=>n.type==="company").map(n=><button className={selected.id===n.id?"active":""} onClick={()=>setSelected(n)} key={n.id}><Building2 size={17}/><span>{n.name}</span><ChevronRight size={15}/></button>)}</aside>
   <div className="tree" id="map"><div className="node selected"><small>{selected.type}</small><strong>{selected.name}</strong><p>{selected.desc}</p></div>{children.length>0&&<div className="connector">↓</div>}<div className="children">{children.map(n=>{const I=icons[n.type]||Network;return <button className="node child" key={n.id} onClick={()=>setSelected(n)}><I size={18}/><small>{n.type}</small><strong>{n.name}</strong><p>{n.desc}</p>{n.year&&<em>{n.year}</em>}</button>})}</div></div></div>
  </section>
  <section id="about" className="about"><div className="eyebrow">THE MISSION</div><h2>Not a phone list.<br/><i>A phone family tree.</i></h2><p>PhoneVerse is being built as a source-backed knowledge graph connecting corporate ownership, brand relationships, product families, generations, regional variants and rebrands.</p><div className="chips">{["Parent companies","Brands","Sub-brands","Series","Models","Rebrands","Regional variants","Timelines"].map(x=><span key={x}>{x}</span>)}</div></section>
  <footer><span>PHONEVERSE © 2026</span><span>Built for the world's phone history.</span></footer>
 </main>
}