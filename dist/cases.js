'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date = value => new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 const regionNames = new Intl.DisplayNames(['en'], {type:'region'});
 let records = [], ready = false, stateSeen = false, current = {code:'NY',name:'New York'};
 let names = {CA:'California',NY:'New York',DC:'District of Columbia'};
 const controls = ['case-search','case-jurisdiction','case-stage','case-court','case-federal'];
 const result = $('case-results');
 function jurisdictions() {
  const value = $('case-jurisdiction').value;
  for (const option of $('state-select').options) if (/^[A-Z]{2}$/.test(option.value)) names[option.value] = option.textContent;
  const active = $('state-select').value;
  if (names[active]) current = {code:active,name:names[active]};
  $('case-jurisdiction').innerHTML = `<option value="selected">Selected state · ${escape(current.name)}</option><option value="all">All jurisdictions</option><option value="federal">Federal matters only</option>` + Object.entries(names).sort((a,b)=>a[1].localeCompare(b[1])).map(([code,name])=>`<option value="${code}">${escape(name)}</option>`).join('');
  $('case-jurisdiction').value = [...$('case-jurisdiction').options].some(o=>o.value===value) ? value : 'selected';
 }
 function clearDeepLink() {
  const url = new URL(location.href);
  url.searchParams.delete('case');
  if(url.hash.startsWith('#case-')) url.hash = 'court-cases';
  history.replaceState(null,'',url);
 }
 function filtered() {
  const scope = $('case-jurisdiction').value, code = scope === 'selected' ? current.code : scope;
  const query = $('case-search').value.trim().toLowerCase();
  return records.filter(c =>
   (scope==='all' || (scope==='federal' ? c.scope==='federal' : c.affectedJurisdictions.includes(code) || (c.scope==='federal' && $('case-federal').checked))) &&
   ($('case-stage').value==='all' || c.stage===$('case-stage').value) &&
   ($('case-court').value==='all' || c.courtLocation===$('case-court').value) &&
   (!query || [c.name,c.headline,c.court,c.docket,c.law,c.holding,c.effect,c.limits,c.topic,c.reach,names[c.courtLocation]].join(' ').toLowerCase().includes(query))
  );
 }
 function card(c) {
  return `<article class="case-card" id="case-${escape(c.id)}" tabindex="-1" aria-labelledby="case-title-${escape(c.id)}">
   <div class="case-topline"><span class="tag ${c.scope==='federal'?'case-federal-tag':'local'}">${c.scope==='federal'?'Federal matter':escape(c.affectedJurisdictions.map(s=>names[s]||s).join(', '))+' law'}</span><time datetime="${c.decisionDate}">${date(c.decisionDate)}</time></div>
   <h3 id="case-title-${escape(c.id)}">${escape(c.headline)}</h3><p class="case-name">${escape(c.name)}</p>
   <div class="law-meta"><span class="tag ${c.stage==='Preliminary ruling'?'future':''}">${escape(c.stage)}</span><span class="tag">${escape(c.outcome)}</span></div>
   <dl class="case-facts"><div><dt>Court</dt><dd>${escape(c.court)}</dd></div><div><dt>Legal reach</dt><dd>${escape(c.reach)}</dd></div><div><dt>Law at issue</dt><dd>${escape(c.law)}</dd></div></dl>
   <div class="case-effect"><h4>What this decision changes</h4><p>${escape(c.effect)}</p></div>
   <details class="case-details"><summary>Holding, limits &amp; case history</summary><div><h4>What the court decided</h4><p>${escape(c.holding)}</p><h4>Limits on the decision</h4><p>${escape(c.limits)}</p><h4>Review status</h4><p>${escape(c.reviewStatus)}</p><h4>Key developments</h4><ol class="case-timeline">${c.timeline.map(t=>`<li><time datetime="${t.date}">${date(t.date)}</time><span>${escape(t.text)}</span></li>`).join('')}</ol><p class="case-docket">Docket: ${escape(c.docket)}</p></div></details>
   ${c.relatedCases.length||c.relatedLaws.length?`<div class="case-related">${c.relatedCases.map(id=>{const related=records.find(r=>r.id===id);return related?`<a href="?case=${escape(id)}#case-${escape(id)}" data-case-link="${escape(id)}">Related decision: ${escape(related.headline)}</a>`:''}).join('')}${c.relatedLaws.map(l=>`<a href="?state=${escape(l.state)}#regulations" data-law-state="${escape(l.state)}" data-law-reference="${escape(l.reference)}">Related law: ${escape(l.label)}</a>`).join('')}</div>`:''}
   <div class="card-sources">${c.sources.map(s=>`<a class="source-link" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a>`).join('')}<span class="review-date">Sources checked ${date(c.reviewed)} · Later review may be incomplete</span></div>
   <button class="text-button case-copy" type="button" data-copy-case="${escape(c.id)}">Copy case link</button>
  </article>`;
 }
 function render() {
  if(!ready) return;
  const scope = $('case-jurisdiction').value, code = scope==='selected'?current.code:scope;
  const matches = filtered(), federal = matches.filter(c=>c.scope==='federal').length;
  $('case-federal').disabled = scope==='all'||scope==='federal';
  $('case-count').textContent = `${matches.length} of ${records.length} decisions · state matters first, newest within each group`;
  $('case-reset').hidden = scope==='selected' && $('case-federal').checked && !$('case-search').value && $('case-stage').value==='all' && $('case-court').value==='all';
  const local = records.filter(c=>c.scope==='state'&&c.affectedJurisdictions.includes(code));
  $('case-scope').textContent = scope==='all' ? 'All catalogued decisions. Court location is shown separately from the law affected; federal matters may be relevant across state lines.' : scope==='federal' ? 'Federal matters only. Their relevance can cross state lines, but these cards do not imply that every state’s law changed or that every court is bound.' : `${local.length?`${local.length} state-specific decision${local.length===1?' is':'s are'} catalogued for ${names[code]||code}.`:`No state-specific decision is catalogued for ${names[code]||code}; this is a coverage gap, not a finding that no case law exists.`} ${federal?`Also showing ${federal} federal matter${federal===1?'':'s'} with multistate relevance.`:$('case-federal').checked?'Federal matters are included when they match the other filters.':'Federal matters are excluded.'}`;
  const stateMatches=matches.filter(c=>c.scope==='state'),federalMatches=matches.filter(c=>c.scope==='federal');
  const group=(id,title,items)=>items.length?`<div class="case-group" id="${id}" role="region" aria-labelledby="${id}-title"><h3 class="case-group-title" id="${id}-title">${title}</h3><div class="case-grid">${items.map(card).join('')}</div></div>`:'';
  result.innerHTML = matches.length ? group('state-court-updates','State-specific court updates',stateMatches)+group('federal-court-updates','Federal updates',federalMatches) : '<div class="empty-results"><strong>No decisions match these filters.</strong><p>Coverage is selective. Try all jurisdictions or broaden your search.</p><button class="quiet-button" type="button" data-all-cases>Show all decisions</button></div>';
  document.querySelector('.case-context').hidden=!federal;
 }
 function reset(scope='selected') {
  $('case-search').value='';$('case-jurisdiction').value=scope;$('case-stage').value='all';$('case-court').value='all';$('case-federal').checked=true;
  $('case-message').textContent='';render();
 }
 function caseUrl(c) {
  const url = new URL(location.href);url.search='';url.searchParams.set('state',c.affectedJurisdictions[0]||current.code);url.searchParams.set('case',c.id);url.hash=`case-${c.id}`;return url;
 }
 function openCase(id, scroll=true) {
  if(!ready) return false;
  const c=records.find(c=>c.id===id);if(!c)return false;
  reset('all');
  const node=$(`case-${id}`);node.querySelector('details').open=true;
  const url=new URL(location.href);url.searchParams.set('case',id);url.hash=`case-${id}`;history.replaceState(null,'',url);
  if(scroll){node.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});node.focus({preventScroll:true});}
  return true;
 }
 function annotateLaws() {
  if(!ready)return;
  document.querySelectorAll('.law-case-note').forEach(n=>n.remove());
  for(const c of records) for(const law of c.relatedLaws) {
   if(law.state!==current.code)continue;
   for(const node of document.querySelectorAll('.law-card')) if(node.querySelector('.bill')?.textContent.includes(law.reference)) {
    const note=document.createElement('div');note.className='law-case-note';
    note.innerHTML=`<span>COURT DEVELOPMENT · ${date(c.decisionDate)}</span><a href="?state=${law.state}&amp;case=${c.id}#case-${c.id}" data-case-link="${c.id}">${escape(c.headline)}</a><small>${escape(c.stage)} · ${escape(c.outcome)}</small>`;
    node.querySelector('.card-sources').before(note);
   }
  }
 }
 document.addEventListener('atlas:statechange',e=>{const first=!stateSeen;stateSeen=true;current=e.detail;jurisdictions();if(!first)clearDeepLink();render();annotateLaws();const requested=new URL(location.href).searchParams.get('case');if(first&&requested)openCase(requested);});
 document.addEventListener('atlas:lawsrender',e=>{if(names[e.detail.code])current={code:e.detail.code,name:names[e.detail.code]};annotateLaws();});
 controls.forEach(id=>$(id).addEventListener(id==='case-search'?'input':'change',()=>{clearDeepLink();$('case-message').textContent='';render();}));
 $('case-reset').addEventListener('click',()=>{clearDeepLink();reset();});
 document.addEventListener('click',async e=>{
  const caseLink=e.target.closest('[data-case-link]');
  if(caseLink&&ready&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();openCase(caseLink.dataset.caseLink);return;}
  const stateLink=e.target.closest('[data-state-cases]');
  if(stateLink&&ready&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){clearDeepLink();reset();return;}
  const lawLink=e.target.closest('[data-law-state]');
  if(lawLink&&$('state-select').value in names&&!$('state-select').disabled&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();document.dispatchEvent(new CustomEvent('atlas:showlaw',{detail:{code:lawLink.dataset.lawState,reference:lawLink.dataset.lawReference}}));return;}
  if(e.target.closest('[data-all-cases]')){clearDeepLink();reset('all');$('case-jurisdiction').focus();}
  if(e.target.closest('[data-case-retry]'))init();
  const copy=e.target.closest('[data-copy-case]');
  if(copy){const c=records.find(c=>c.id===copy.dataset.copyCase),url=caseUrl(c).href;try{await navigator.clipboard.writeText(url);$('case-message').textContent='Case link copied.';}catch{$('case-message').textContent=`Case link: ${url}`;}}
 });
 async function init() {
  ready=false;controls.forEach(id=>$(id).disabled=true);result.setAttribute('aria-busy','true');
  try {
   const response=await fetch('cases.json',{cache:'no-cache'});if(!response.ok)throw Error('Case data unavailable');
   const data=await response.json();if(data.schemaVersion!==1||!Array.isArray(data.cases))throw Error('Unsupported case data');
   const ids=new Set();
   for(const c of data.cases){
    if(!/^[a-z0-9-]+$/.test(c.id)||ids.has(c.id)||!['state','federal'].includes(c.scope)||!/^\d{4}-\d{2}-\d{2}$/.test(c.decisionDate)||!Array.isArray(c.affectedJurisdictions)||!Array.isArray(c.timeline)||!Array.isArray(c.relatedCases)||!Array.isArray(c.relatedLaws)||!c.sources?.length||c.sources.some(s=>!s.url.startsWith('https://')))throw Error('Invalid case record');
    ids.add(c.id);
   }
   records=data.cases.sort((a,b)=>b.decisionDate.localeCompare(a.decisionDate));ready=true;controls.forEach(id=>$(id).disabled=false);jurisdictions();
   $('case-court').innerHTML='<option value="all">All court locations</option>'+[...new Set(records.map(c=>c.courtLocation))].sort().map(code=>`<option value="${escape(code)}">${escape(names[code]||regionNames.of(code))}</option>`).join('');
   $('case-stage').innerHTML='<option value="all">All stages</option>'+[...new Set(records.map(c=>c.stage))].sort().map(stage=>`<option>${escape(stage)}</option>`).join('');
   $('court-total').textContent=`${records.length} decisions catalogued`;
   render();annotateLaws();
   const requested=new URL(location.href).searchParams.get('case');
   if(requested&&!openCase(requested)){reset('all');$('case-message').textContent='That case link is not in this collection. Showing available decisions.';}
  }catch(error){ready=false;result.innerHTML='<div class="empty-results"><strong>Court decisions could not load.</strong><p>You can still explore the state regulation library.</p><button type="button" class="quiet-button" data-case-retry>Try again</button></div>';$('case-count').textContent='Case data unavailable';console.warn('Court collection unavailable',error);}
  finally{result.setAttribute('aria-busy','false');}
 }
 init();
})();
