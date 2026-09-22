'use strict';
const NS='http://www.w3.org/2000/svg';
const svg=document.querySelector('#us-map'),select=document.querySelector('#state-select'),detail=document.querySelector('#state-detail'),tip=document.querySelector('#tooltip');
let states=[],selected='CA';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=(tag,attrs)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n};
const results=document.querySelector('#law-results');
let jurisdiction='all';
const formatDate=value=>new Date(value+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const statusClass=value=>({Upcoming:'future',Enjoined:'enjoined',Guidance:'guidance'}[value]||'status');
const jurisdictionName=l=>l.local?'New York City':'Statewide';
const sourceList=l=>l.sources||[{label:l.source||'Official source',url:l.url},...(l.url2?[{label:l.source2||'Related official source',url:l.url2}]:[])];
function metadata(l){return `<span class="tag ${statusClass(l.status)}">${esc(l.status||'Enacted')}</span><span class="tag">${esc(l.topic)}</span>${l.local?'<span class="tag local">Local · NYC</span>':''}`;}
function choose(code,scroll=false){
 const s=states.find(x=>x.code===code);if(!s)return;selected=code;select.value=code;
 svg.querySelectorAll('[data-code]').forEach(n=>{const on=n.dataset.code===code;n.classList.toggle('selected',on);if(n.getAttribute('role')==='button')n.setAttribute('aria-pressed',String(on))});
 const url=new URL(location.href);url.searchParams.set('state',code);history.replaceState(null,'',url);
 document.title=`${s.name} AI laws — US AI Atlas`;
 const local=s.laws.filter(l=>l.local).length;
 detail.innerHTML=`<div class="state-topline"><span class="state-code">${esc(s.code)}</span><span>${s.code==='NY'?'EXPANDED COVERAGE':'STATE OVERVIEW'}</span></div><h2 class="state-name">${esc(s.name)}</h2><p class="state-summary">${esc(s.summary)}</p><div class="overview-stats"><div><strong>${s.laws.length}</strong><span>selected measures</span></div><div><strong>${new Set(s.laws.map(l=>l.topic)).size}</strong><span>topics covered</span></div></div><a class="primary-link" href="#regulations">Explore ${s.laws.length===1?'the measure':`all ${s.laws.length} measures`} <span aria-hidden="true">↓</span></a><div class="overview-notice">${local?'Statewide and NYC measures are labeled separately.':'Selected laws and related rules; coverage varies by state.'}</div><div class="law-count"><span>START EXPLORING</span></div>${s.laws.slice(0,3).map((l,i)=>`<a class="law-preview" href="#law-${s.code}-${i}"><span class="preview-topic">${esc(l.topic)} · ${esc(l.status)}</span><strong>${esc(l.title)}</strong><span class="preview-arrow" aria-hidden="true">↗</span></a>`).join('')}`;
 document.querySelector('#research-title').textContent=`${s.name} / regulation library`;
 document.querySelector('#research-subtitle').textContent=s.code==='NY'?'A closer look at scope, duties, timing, and enforcement. Open a card to explore the provisions.':'Browse the selected measures and follow the sources for their full scope and requirements.';
 document.querySelector('#law-search').value='';jurisdiction='all';
 document.querySelector('#topic-filter').innerHTML='<option value="all">All topics</option>'+[...new Set(s.laws.map(l=>l.topic))].sort().map(t=>`<option>${esc(t)}</option>`).join('');
 document.querySelector('#status-filter').innerHTML='<option value="all">All statuses</option>'+[...new Set(s.laws.map(l=>l.status||'Enacted'))].sort().map(t=>`<option>${esc(t)}</option>`).join('');
 document.querySelector('[data-jurisdiction="local"]').disabled=local===0;
 document.querySelector('[data-jurisdiction="local"]').textContent=local?'New York City':'Local';
 document.querySelector('#action-message').textContent='';renderLaws();
 const pane=document.querySelector('.detail-pane');if(innerWidth>820)pane.scrollTop=0;
 if(scroll&&innerWidth<=820)document.querySelector('.select-wrap').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 tip.hidden=true;
}
function filteredLaws(){
 const s=states.find(s=>s.code===selected);if(!s)return [];
 const query=document.querySelector('#law-search').value.trim().toLowerCase();
 const topic=document.querySelector('#topic-filter').value,status=document.querySelector('#status-filter').value;
 return s.laws.map((law,index)=>({law,index})).filter(({law:l})=>
  (jurisdiction==='all'||(jurisdiction==='local'?l.local:!l.local))&&
  (topic==='all'||l.topic===topic)&&(status==='all'||(l.status||'Enacted')===status)&&
  (!query||[l.title,l.bill,l.description,l.topic,l.appliesTo,l.enforcement,l.limits,...(l.obligations||[])].filter(Boolean).join(' ').toLowerCase().includes(query)));
}
function renderLaws(){
 const s=states.find(s=>s.code===selected);if(!s)return;const matches=filteredLaws();
 document.querySelectorAll('[data-jurisdiction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.jurisdiction===jurisdiction)));
 document.querySelector('#result-count').textContent=`${matches.length} of ${s.laws.length} measures`;
 document.querySelector('#export-csv').disabled=matches.length===0;
 document.querySelector('#reset-filters').hidden=jurisdiction==='all'&&!document.querySelector('#law-search').value&&document.querySelector('#topic-filter').value==='all'&&document.querySelector('#status-filter').value==='all';
 results.innerHTML=matches.length?matches.map(({law:l,index})=>`<article class="law-card" id="law-${s.code}-${index}"><div class="law-meta">${metadata(l)}</div><h3>${esc(l.title)}</h3><div class="bill">${esc(l.bill)}</div><p>${esc(l.description)}</p><div class="timing"><span aria-hidden="true">◷</span><span>${esc(l.timing)}</span></div>${l.appliesTo||l.obligations||l.enforcement?`<details class="provisions"><summary>Scope & key provisions <span aria-hidden="true">+</span></summary><div class="provision-body">${l.appliesTo?`<h4>Who it covers</h4><p>${esc(l.appliesTo)}</p>`:''}${l.obligations?`<h4>Key duties</h4><ul>${l.obligations.map(o=>`<li>${esc(o)}</li>`).join('')}</ul>`:''}${l.enforcement?`<h4>Enforcement</h4><p>${esc(l.enforcement)}</p>`:''}${l.limits?`<h4>Scope & limitations</h4><p>${esc(l.limits)}</p>`:''}</div></details>`:''}<div class="card-sources"><span class="source-caption">${esc(l.type||'Legal source')} · ${jurisdictionName(l)}</span>${sourceList(l).map(a=>`<a class="source-link" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.label)} <span aria-hidden="true">↗</span></a>`).join('')}<span class="review-date">Sources checked ${formatDate(l.reviewed||s.reviewed)}</span></div></article>`).join(''):'<div class="empty-results"><strong>No measures match these filters.</strong><p>Try a broader term or reset the filters. This collection is not exhaustive.</p><button class="quiet-button" type="button" id="empty-reset">Reset filters</button></div>';
 document.querySelector('#empty-reset')?.addEventListener('click',resetFilters);
}
detail.addEventListener('click',e=>{if(e.target.closest('a[href^="#law-"]'))resetFilters()});
function resetFilters(){
 document.querySelector('#law-search').value='';document.querySelector('#topic-filter').value='all';document.querySelector('#status-filter').value='all';jurisdiction='all';renderLaws();
}
document.querySelector('#law-search').addEventListener('input',renderLaws);
['topic-filter','status-filter'].forEach(id=>document.getElementById(id).addEventListener('change',renderLaws));
document.querySelectorAll('[data-jurisdiction]').forEach(b=>b.addEventListener('click',()=>{jurisdiction=b.dataset.jurisdiction;renderLaws()}));
document.querySelector('#reset-filters').addEventListener('click',resetFilters);
document.querySelector('#ny-feature').addEventListener('click',e=>{if(!states.length)return;e.preventDefault();choose('NY');document.querySelector('#regulations').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
document.querySelector('#copy-link').addEventListener('click',async()=>{
 const url=new URL(location.href);url.search='';url.searchParams.set('state',selected);url.hash='regulations';const message=document.querySelector('#action-message');
 try{await navigator.clipboard.writeText(url.href);message.textContent='State link copied.';}catch{message.textContent=`State link: ${url.href}`;}
});
document.querySelector('#export-csv').addEventListener('click',()=>{
 const s=states.find(s=>s.code===selected);if(!s)return;
 const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
 const rows=[['State','Jurisdiction','Measure','Reference','Topic','Status','Type','Summary','Timing','Who it covers','Key duties','Enforcement','Limits','Sources checked','Sources'],...filteredLaws().map(({law:l})=>[s.name,jurisdictionName(l),l.title,l.bill,l.topic,l.status||'Enacted',l.type||'Legal source',l.description,l.timing,l.appliesTo,(l.obligations||[]).join(' | '),l.enforcement,l.limits,l.reviewed||s.reviewed,sourceList(l).map(x=>x.url).join(' | ')])];
 const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=`us-ai-atlas-${s.code.toLowerCase()}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);document.querySelector('#action-message').textContent=`Exported ${rows.length-1} measures for ${s.name}.`;
});
function bind(n,s){n.addEventListener('click',()=>choose(s.code,true));n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(s.code,true)}if(e.key==='Escape')tip.hidden=true});n.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;tip.innerHTML=`${esc(s.name)}<small>${s.laws.length} selected ${s.laws.length===1?'measure':'measures'} · Click to explore</small>`;tip.hidden=false;const r=document.querySelector('#map-wrap').getBoundingClientRect();tip.style.left=Math.max(8,Math.min(e.clientX-r.left+12,r.width-tip.offsetWidth-8))+'px';tip.style.top=Math.max(8,e.clientY-r.top-tip.offsetHeight-14)+'px'});n.addEventListener('pointerleave',()=>tip.hidden=true);n.addEventListener('blur',()=>tip.hidden=true)}
async function init(){try{
 const [sr,mr]=await Promise.all([fetch('states.json'),fetch('map.json')]);if(!sr.ok||!mr.ok)throw Error('Data unavailable');
 states=await sr.json();const geography=await mr.json();states.sort((a,b)=>a.name.localeCompare(b.name));
 select.innerHTML=states.map(s=>`<option value="${s.code}">${esc(s.name)}</option>`).join('');select.addEventListener('change',e=>choose(e.target.value));
 const pathGroup=el('g',{}),labelGroup=el('g',{}),calloutGroup=el('g',{});svg.append(pathGroup,labelGroup,calloutGroup);
 const small=['VT','NH','MA','RI','CT','NJ','DE','MD'];
 for(const g of geography){const s=states.find(x=>x.name===g.name);if(!s)continue;
  const p=el('path',{d:g.path,class:`state ${s.kind}`,'data-code':s.code,role:'button',tabindex:'0','aria-label':`${s.name}: ${s.laws.length} selected measures`,'aria-pressed':'false'});const title=el('title',{});title.textContent=s.name;p.append(title);pathGroup.append(p);bind(p,s);
  if(!small.includes(s.code)){const t=el('text',{x:g.center[0],y:g.center[1]+4,class:'state-label','data-code':s.code,'aria-hidden':'true'});t.textContent=s.code;labelGroup.append(t)}
 }
 small.forEach((code,i)=>{const s=states.find(x=>x.code===code);const g=geography.find(x=>x.name===s.name);const x=937,y=130+i*29;const line=el('path',{d:`M${g.center[0]},${g.center[1]}L${x-8},${y+12}`,class:'callout-line','aria-hidden':'true'});calloutGroup.append(line);const group=el('g',{class:'callout','data-code':code,role:'button',tabindex:'-1','aria-label':s.name,'aria-pressed':'false'});group.append(el('rect',{x,y,width:36,height:24}));const t=el('text',{x:x+18,y:y+16,'text-anchor':'middle'});t.textContent=code;group.append(t);calloutGroup.append(group);bind(group,s)});
 const initial=new URL(location.href).searchParams.get('state');choose(states.some(s=>s.code===initial)?initial:'NY');
 }catch(e){console.error(e);document.querySelector('#map-error').hidden=false;detail.innerHTML='<p class="error">The law collection could not load. Please reload to try again.</p>';select.innerHTML='<option>Unable to load states</option>';select.disabled=true;results.innerHTML='<p class="error">The regulation library could not load. Please reload the page.</p>';document.querySelector('#export-csv').disabled=true}}
init();

function registerAtlasTool(){
 if(!document.modelContext?.registerTool)return;
 const lifecycle=new AbortController();
 addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 try{Promise.resolve(document.modelContext.registerTool({
  name:'select_state',title:'Explore a state’s AI laws',description:'Select a US state in the map and display its curated law entries. Returns the same entries and sources visible in the state panel.',
  inputSchema:{type:'object',properties:{state:{type:'string',description:'Two-letter US state abbreviation, such as CA or NY.'}},required:['state'],additionalProperties:false},
  annotations:{readOnlyHint:false,untrustedContentHint:false},
  execute(input){if(!input||typeof input.state!=='string'||Object.keys(input).some(k=>k!=='state'))throw new Error('Provide only a two-letter state abbreviation.');const s=states.find(s=>s.code===input.state.toUpperCase());if(!s)throw new Error('State not found or data not yet loaded.');choose(s.code);return {state:s.name,coverage:'Selected measures; not exhaustive. Manually researched snapshot.',laws:s.laws};}
 },{signal:lifecycle.signal})).catch(e=>console.warn('State tool unavailable',e))}catch(e){console.warn('State tool unavailable',e)}
}
registerAtlasTool();
