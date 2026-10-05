'use strict';
(() => {
 const root=document.getElementById('ny-ai-guide');
 if(!root)return;
 const controls=document.getElementById('startup-features'),results=document.getElementById('startup-results');
 const count=document.getElementById('startup-count'),reset=document.getElementById('startup-reset');
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=value=>new Date(value+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 let data=null,initialLinkOpened=false;
 const selected=new Set(['everyday']);
 const lawLink=(reference,label)=>`<a href="?state=NY#regulations" data-startup-law="${escape(reference)}">${escape(label)}</a>`;
 function render(){
  if(!data)return;
  const cards=data.cards.filter(c=>!selected.size||c.baseline||c.features.some(f=>selected.has(f)));
  count.textContent=`${cards.length} of ${data.cards.length} practical topics · ${selected.size?'selected activities + starting checklist':'all topics'}`;
  reset.hidden=!selected.size;
  results.innerHTML=cards.map(c=>`<article class="startup-card" id="startup-${escape(c.id)}"><div class="startup-meta"><span class="tag ${c.status==='Upcoming duties'?'future':/guidance|checklist/i.test(c.status)?'guidance':'status'}">${escape(c.status)}</span><span>${escape(c.jurisdiction)}</span>${c.baseline?'<span class="startup-baseline">Start here</span>':''}</div><h4>${escape(c.title)}</h4><p class="startup-trigger">${escape(c.trigger)}</p><p class="startup-rule">${escape(c.rule)}</p><details><summary>Practical steps &amp; sources</summary><div class="startup-detail"><h5>Practical next steps</h5><ul>${c.actions.map(a=>`<li>${escape(a)}</li>`).join('')}</ul><h5>Useful evidence to keep</h5><p>${escape(c.evidence)}</p><h5>Check the scope</h5><p>${escape(c.boundary)}</p><div class="startup-sources"><h5>Rules &amp; guidance</h5>${c.sources.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a>`).join('')}</div><p class="guide-card-reviewed">Sources checked ${date(c.reviewed||data.reviewed)}</p><div class="startup-related"><h5>In the regulation library</h5>${c.related.map(r=>lawLink(r.reference,r.label)).join('')}</div></div></details></article>`).join('');
 }
 controls.addEventListener('change',event=>{
  const input=event.target.closest('input[data-startup-feature]');if(!input)return;
  if(input.checked)selected.add(input.value);else selected.delete(input.value);
  render();
 });
 reset.addEventListener('click',()=>{selected.clear();controls.querySelectorAll('input').forEach(i=>i.checked=false);render();controls.querySelector('input')?.focus();});
 root.addEventListener('click',event=>{
  const link=event.target.closest('[data-startup-law]');if(!link)return;
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();document.dispatchEvent(new CustomEvent('atlas:showlaw',{detail:{code:'NY',reference:link.dataset.startupLaw}}));
 });
 function openInitialLink(){if(data&&!root.hidden&&!initialLinkOpened&&['#ny-ai-guide','#ny-startup-guide'].includes(location.hash)){initialLinkOpened=true;root.scrollIntoView({block:'start'});}}
 document.addEventListener('atlas:statechange',event=>{root.hidden=event.detail.code!=='NY';openInitialLink();});
 async function loadGuide(){
  results.setAttribute('aria-busy','true');
  try{
   const response=await fetch('ny-startups.json',{cache:'no-cache'});if(!response.ok)throw Error('Practical guide unavailable');
   data=await response.json();
   controls.innerHTML=data.features.map(f=>`<label class="startup-choice"><input type="checkbox" value="${escape(f.id)}" ${selected.has(f.id)?'checked':''} data-startup-feature><span>${escape(f.label)}</span></label>`).join('');
   document.getElementById('startup-deadlines').innerHTML=data.deadlines.map(d=>`<li><time datetime="${escape(d.date)}">${date(d.date)}</time><strong>${lawLink(d.reference,d.title)}</strong><span>${escape(d.scope)}</span></li>`).join('');
   document.getElementById('startup-reviewed').textContent=data.reviewNote;
   render();
   openInitialLink();
  }catch(error){
   count.textContent='The practical guide could not load.';
   results.innerHTML='<p class="error">The regulation library below remains available. <button type="button" class="quiet-button" id="startup-retry">Retry practical guide</button></p>';
   document.getElementById('startup-retry').addEventListener('click',loadGuide);
  }finally{results.setAttribute('aria-busy','false');}
 }
 loadGuide();
})();
