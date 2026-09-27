"use client";

import { useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Building2, ChevronDown, ChevronRight, GitBranch, Layers3, Network, Search, Smartphone, Sparkles } from "lucide-react";
import { nodes, Node } from "../data/phones";

const icons: Record<Node["type"], typeof Building2> = {
  company: Building2, brand: Network, subbrand: Layers3, series: Layers3, model: Smartphone,
};
const labels: Record<Node["type"], string> = {
  company:"Corporate group", brand:"Brand", subbrand:"Sub-brand", series:"Series", model:"Model",
};

export default function Home() {
  const [q,setQ]=useState("");
  const [webQ,setWebQ]=useState("");
  const [webLoading,setWebLoading]=useState(false);
  const [webResults,setWebResults]=useState<{title:string;url:string;description:string;source:string}[]>([]);
  const [webError,setWebError]=useState("");

  async function searchWeb(){
    if(!webQ.trim()) return;
    setWebLoading(true); setWebError("");
    try{
      const res=await fetch(`/api/web-search?q=${encodeURIComponent(webQ.trim())}`);
      const data=await res.json();
      if(!res.ok){
        const message = data.error || "Search failed";
        if(res.status===503){
          setWebError(message + " You can still search the web directly below.");
          const fallbackUrl = "https://www.google.com/search?q=" + encodeURIComponent(webQ.trim());
          window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        } else {
          setWebError(message);
        }
        return;
      }
      setWebResults(data.results || []);
      if((data.results || []).length===0) setWebError("No results found. Try a more specific model name.");
    }catch(e){setWebError(e instanceof Error ? e.message : "Search failed");}
    finally{setWebLoading(false);}
  }

  const [selected,setSelected]=useState<Node>(nodes[0]);
  const [expanded,setExpanded]=useState<Record<string,boolean>>({});
  const companies=nodes.filter(n=>n.type==="company");
  const visible=useMemo(()=>{
    const term=q.trim().toLowerCase();
    if(!term) return nodes;
    return nodes.filter(n=>[n.name,n.desc,...n.tags].join(" ").toLowerCase().includes(term));
  },[q]);

  const children=(id:string)=>nodes.filter(n=>n.parent===id);
  const descendants=(id:string):Node[]=>{
    const out:Node[]=[];
    for(const child of children(id)){out.push(child,...descendants(child.id));}
    return out;
  };

  function toggle(id:string){
    setExpanded(v=>({...v,[id]:!v[id]}));
  }

  function select(n:Node){
    setSelected(n);
    setExpanded(v=>({...v,[n.id]:true}));
  }

  function TreeNode({node,depth=0}:{node:Node;depth?:number}){
    const kids=children(node.id);
    const open=expanded[node.id] ?? depth<1;
    const match=!q || visible.some(v=>v.id===node.id);
    if(q && !match) return null;
    const I=icons[node.type];

    return <div className="treeBranch" style={{"--depth":depth} as React.CSSProperties}>
      <div className={selected.id===node.id ? "treeCard selectedTree" : "treeCard"} onClick={()=>select(node)}>
        <div className="treeIcon"><I size={17}/></div>
        <div className="treeInfo">
          <small>{labels[node.type]}</small>
          <strong>{node.name}</strong>
          <span>{node.year || node.tags.slice(0,3).join(" • ")}</span>
        </div>
        {kids.length>0 && <button className="expand" onClick={e=>{e.stopPropagation();toggle(node.id)}} aria-label={open?"Collapse":"Expand"}>
          {open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}
        </button>}
      </div>
      {open && kids.length>0 && <div className="branchChildren">{kids.map(k=><TreeNode key={k.id} node={k} depth={depth+1}/>)}</div>}
    </div>;
  }

  const selectedChildren=children(selected.id);
  const selectedDesc=descendants(selected.id);

  return <main>
    <header>
      <a className="logo" href="#">PHONE<span>VERSE</span></a>
      <nav><a href="#explore">Explore</a><a href="#map">Family Map</a><a href="#about">About</a></nav>
      <a className="ghost" href="#explore">Global Index <ArrowUpRight size={15}/></a>
    </header>

    <section className="hero">
      <div className="hero-grid"/><div className="hero-glow hero-glow-one"/><div className="hero-glow hero-glow-two"/>
      <div className="hero-particles" aria-hidden="true">{Array.from({length:28}).map((_,i)=><span key={i}/>)}</div>
      <div className="hero-content">
        <div className="hero-badge"><Sparkles size={14}/> THE GLOBAL PHONE KNOWLEDGE GRAPH</div>
        <h1>Every phone.<br/><i>Every lineage.</i></h1>
        <p>Explore corporate ownership, brands, sub-brands, series, generations and individual phone models in one expandable industry tree.</p>
        <div className="hero-actions">
          <a className="primary-cta" href="#explore">Explore the tree <ArrowRight size={17}/></a>
          <a className="secondary-cta" href="#map"><GitBranch size={16}/> Open family map</a>
        </div>
        <div className="search hero-search"><Search size={20}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search any company, brand, series or model..." aria-label="Search phone catalog"/></div>
        <div className="stats">
          <div><b>{companies.length}</b><span>Corporate groups</span></div>
          <div><b>{nodes.filter(n=>n.type==="brand"||n.type==="subbrand").length}</b><span>Brands & sub-brands</span></div>
          <div><b>{nodes.filter(n=>n.type==="series").length}</b><span>Series mapped</span></div>
          <div><b>{nodes.filter(n=>n.type==="model").length}</b><span>Models mapped</span></div>
        </div>
      </div>
    </section>

    <section id="explore" className="section">
      <div className="sectionHead">
        <div><div className="eyebrow">EXPAND • DISCOVER • TRACE</div><h2>Phone industry tree</h2></div>
        <span>{visible.length} matching entities</span>
      </div>
      <div className="workspace">
        <aside>
          <div className="sideTitle">CORPORATE GROUPS</div>
          {companies.map(n=><button className={selected.id===n.id?"active":""} onClick={()=>select(n)} key={n.id}><Building2 size={16}/><span>{n.name}</span><ChevronRight size={15}/></button>)}
        </aside>

        <div className="mapArea" id="map">
          <div className="mapToolbar">
            <span><GitBranch size={15}/> {selected.name}</span>
            <span>{selectedDesc.length} descendants</span>
          </div>
          <div className="treeRoot">{companies.map(n=><TreeNode key={n.id} node={n}/>)}</div>
        </div>

        <section className="details">
          <div className="detailIcon">{(()=>{const I=icons[selected.type];return <I size={23}/>})()}</div>
          <small>{labels[selected.type]}</small>
          <h3>{selected.name}</h3>
          <p>{selected.desc}</p>
          <div className="tagList">{selected.tags.map(t=><span key={t}>{t}</span>)}</div>
          <div className="detailStats"><div><b>{selectedChildren.length}</b><span>Direct children</span></div><div><b>{selectedDesc.length}</b><span>Descendants</span></div></div>
          {selectedChildren.length>0 && <div className="quickList"><strong>Next branch</strong>{selectedChildren.map(c=><button key={c.id} onClick={()=>select(c)}>{c.name}<ChevronRight size={14}/></button>)}</div>}
        </section>
      </div>
    </section>

    <section className="catalogNote">
      <div className="eyebrow">CATALOG ARCHITECTURE</div>
      <h2>Built to scale from hundreds to thousands of models.</h2>
      <p>The site stores every entity as a node with a parent relationship. That lets us add historical phones, regional variants, rebrands and new launches without redesigning the tree.</p>
      <div className="chips">{["Ownership","Brands","Sub-brands","Series","Generations","Models","Variants","Launch years","Regions","Sources"].map(x=><span key={x}>{x}</span>)}</div>
    </section>

    <section className="webSearchSection">
      <div className="eyebrow">LIVE WEB SEARCH</div>
      <h2>Search beyond PhoneVerse.</h2>
      <p className="webIntro">Search the wider web for a phone model, review, specification, launch, price or article. Results open directly on the source website.</p>
      <div className="webSearchBox">
        <Search size={21}/>
        <input value={webQ} onChange={e=>setWebQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")searchWeb()}} placeholder="Search the internet for a phone model..." aria-label="Search the internet"/>
        <button type="button" className="webSearchButton" onClick={searchWeb} disabled={webLoading} aria-label="Search the web"><Search size={17}/>{webLoading?"Searching...":"Search web"}</button>
      </div>
      {webError && <div className="webError">{webError}</div>}
      {webResults.length>0 && <div className="webResults">{webResults.map((r,i)=><a className="webResult" href={r.url} target="_blank" rel="noreferrer" key={r.url+i}><div><span>{r.source}</span><h3>{r.title}</h3><p>{r.description}</p><small>{r.url}</small></div><ArrowUpRight size={17}/></a>)}</div>}
    </section>

    <section id="about" className="about">
      <div className="eyebrow">THE MISSION</div><h2>Not a phone list.<br/><i>A phone family tree.</i></h2>
      <p>PhoneVerse is designed as a source-backed knowledge graph. Corporate relationships and product catalogs can be updated independently as companies launch, rename, acquire or retire products.</p>
    </section>
    <footer><span>PHONEVERSE © 2026</span><span>Built for the world's phone history.</span></footer>
  </main>;
}

// Force a fresh Vercel build after the web-search syntax fix.
