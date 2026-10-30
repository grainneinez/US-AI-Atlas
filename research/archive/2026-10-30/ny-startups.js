'use strict';
(() => {
 const root=document.getElementById('ny-ai-guide');if(!root)return;
 const $=id=>document.getElementById(id),controls=$('startup-features'),results=$('startup-results');
 const count=$('startup-count'),reset=$('startup-reset'),search=$('ny-guide-search'),kind=$('ny-guide-kind');
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=value=>new Date(value+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 const params=new URL(location.href).searchParams;
 const selected=new Set(['everyday','rights']),reviewed=new Set();
 let data=null,shown=[],initialLinkOpened=false;
 const lawLink=(reference,label)=>`<a href="?state=NY#regulations" data-startup-law="${escape(reference)}">${escape(label)}</a>`;
 const links=sources=>(sources||[]).map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)} ↗</a>`).join('');
 const cardKind=c=>c.status==='Upcoming duties'?'upcoming':c.status==='Agency guidance'?'guidance':/checklist|Rights depend/.test(c.status)?'practical':'current';
 function activeRole(){return data.roles.find(r=>r.features.length===selected.size&&r.features.every(f=>selected.has(f)));}
 function locationNote(){return ({city:'New York State law continues to apply in NYC. City hiring, biometrics, housing, subscription, and school-policy layers have separate triggers.',state:'Start with state requirements. NYC rules can still matter where jobs, customers, services, or schools have a city connection. City entries remain visible so you can check their scope.',unsure:'Check the work, people, data, and institutions involved. An office address alone does not settle which requirements apply.'})[$('ny-where').value];}
 function routeURL(){const url=new URL(location.href);url.search='';url.searchParams.set('state','NY');url.searchParams.set('nyuse',selected.size?[...selected].sort().join(','):'all');url.searchParams.set('nywhere',$('ny-where').value);url.hash='ny-ai-guide';return url.href;}
 function updateChoices(){
  controls.querySelectorAll('input').forEach(i=>i.checked=selected.has(i.value));
  const role=activeRole();
  $('ny-roles').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nyRole===role?.id)));
  $('ny-role-note').textContent=role?role.note:'Custom activity selection. Open each topic for its role, geographic scope, and source.';
  $('ny-location-note').textContent=locationNote();
 }
 function clearMessage(){ $('ny-plan-message').textContent='';$('ny-copy-fallback').hidden=true; }
 function updateProgress(){const done=shown.filter(c=>reviewed.has(c.id)).length;$('ny-checklist-count').textContent=`${done} of ${shown.length} first steps marked`;}
 function render(){
  if(!data)return;
  const q=search.value.trim().toLowerCase();
  shown=data.cards.filter(c=>(!selected.size||c.baseline||c.features.some(f=>selected.has(f)))&&(kind.value==='all'||cardKind(c)===kind.value)&&(!q||[c.title,c.trigger,c.rule,c.boundary,...c.actions].join(' ').toLowerCase().includes(q)));
  updateChoices();clearMessage();
  count.textContent=`${shown.length} of ${data.cards.length} practical topics · ${q||kind.value!=='all'?'search / type filters applied':selected.size?'selected activities':'all activities'}`;
  reset.hidden=!selected.size&&!q&&kind.value==='all';
  results.innerHTML=shown.length?shown.map(c=>`<article class="startup-card" id="startup-${escape(c.id)}"><div class="startup-meta"><span class="tag ${cardKind(c)==='upcoming'?'future':/guidance|checklist|policy/i.test(c.status)?'guidance':'status'}">${escape(c.status)}</span><span>${escape(c.jurisdiction)}</span>${c.baseline?'<span class="startup-baseline">Start here</span>':''}</div><h4>${escape(c.title)}</h4><p class="startup-trigger">${escape(c.trigger)}</p><p class="startup-rule">${escape(c.rule)}</p><details><summary>Practical steps &amp; sources</summary><div class="startup-detail"><h5>Practical next steps</h5><ul>${c.actions.map(a=>`<li>${escape(a)}</li>`).join('')}</ul><h5>Useful evidence to keep</h5><p>${escape(c.evidence)}</p><h5>Check the scope</h5><p>${escape(c.boundary)}</p><div class="startup-sources"><h5>Rules &amp; guidance</h5>${links(c.sources)}</div><p class="guide-card-reviewed">Sources checked ${date(c.reviewed||data.reviewed)}</p><div class="startup-related"><h5>In the regulation library</h5>${c.related.map(r=>lawLink(r.reference,r.label)).join('')}</div></div></details></article>`).join(''):'<div class="empty-results"><strong>No practical topics match.</strong><p>Try another search or type, or reset to all topics. This is not a finding that no rule applies.</p><button type="button" class="quiet-button" data-ny-reset>Reset to all topics</button></div>';
  $('ny-checklist-items').innerHTML=shown.map(c=>`<div class="ny-checklist-row"><label><input type="checkbox" data-ny-step="${escape(c.id)}" ${reviewed.has(c.id)?'checked':''}><span><strong>${escape(c.title)}</strong><span>${escape(c.actions[0])}</span></span></label><a href="#startup-${escape(c.id)}">Scope &amp; sources</a></div>`).join('')||'<p>No checklist steps for the current filters.</p>';
  updateProgress();['ny-copy-plan','ny-print-plan'].forEach(id=>$(id).disabled=!shown.length);$('ny-copy-route').disabled=false;
 }
 function resetAll(){selected.clear();search.value='';kind.value='all';render();}
 function checklistText(){
  return ['New York AI-use review checklist',`Route: ${activeRole()?.label||'Custom activities'}`,`Location context: ${$('ny-where').selectedOptions[0].textContent}`,locationNote(),'Suggested first steps only; not a compliance determination.',...shown.flatMap(c=>['',`${reviewed.has(c.id)?'[x]':'[ ]'} ${c.title}`,`${c.status} · ${c.jurisdiction}`,`Next step: ${c.actions[0]}`,`Scope: ${c.boundary}`,`Sources checked: ${date(c.reviewed||data.reviewed)}`,...c.sources.map(s=>`${s.label}: ${s.url}`)]),'',data.reviewNote,'Guide: '+routeURL()].join('\n');
 }
 async function copyText(text,message){try{await navigator.clipboard.writeText(text);$('ny-plan-message').textContent=message;}catch{$('ny-copy-fallback').value=text;$('ny-copy-fallback').hidden=false;$('ny-copy-fallback').focus();$('ny-copy-fallback').select();$('ny-plan-message').textContent='Select and copy the text below.';}}
 controls.addEventListener('change',event=>{const input=event.target.closest('input[data-startup-feature]');if(!input)return;if(input.checked)selected.add(input.value);else selected.delete(input.value);render();});
 reset.addEventListener('click',resetAll);search.addEventListener('input',render);kind.addEventListener('change',render);$('ny-where').addEventListener('change',()=>{if(data){updateChoices();clearMessage();}});
 root.addEventListener('click',event=>{
  const preset=event.target.closest('[data-ny-role]');if(preset&&data){const role=data.roles.find(r=>r.id===preset.dataset.nyRole);if(role){selected.clear();role.features.forEach(f=>selected.add(f));search.value='';kind.value='all';render();}return;}
  if(event.target.closest('[data-ny-reset]')){resetAll();return;}
  const link=event.target.closest('[data-startup-law]');if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();document.dispatchEvent(new CustomEvent('atlas:showlaw',{detail:{code:'NY',reference:link.dataset.startupLaw}}));
 });
 $('ny-checklist-items').addEventListener('change',event=>{const input=event.target.closest('[data-ny-step]');if(!input)return;if(input.checked)reviewed.add(input.dataset.nyStep);else reviewed.delete(input.dataset.nyStep);updateProgress();});
 $('ny-copy-plan').addEventListener('click',()=>{if(data&&shown.length)copyText(checklistText(),'Checklist copied with scope notes and source links.');});
 $('ny-copy-route').addEventListener('click',()=>{if(data)copyText(routeURL(),'Guide link copied. Search filters and checkmarks are not included.');});
 $('ny-print-plan').addEventListener('click',()=>{
  if(!data||!shown.length)return;
  let page=$('ny-print-sheet');if(!page){page=document.createElement('section');page.id='ny-print-sheet';page.className='ny-print-sheet';document.body.append(page);}
  page.innerHTML=`<h1>New York AI-use review checklist</h1><p>${escape(activeRole()?.label||'Custom activities')} · ${escape($('ny-where').selectedOptions[0].textContent)}</p><p>${escape(locationNote())}</p><p>Suggested first steps only. Checkmarks record review, not compliance.</p>${shown.map(c=>`<section><h2>${reviewed.has(c.id)?'Reviewed: ':'To review: '}${escape(c.title)}</h2><p>${escape(c.status)} · ${escape(c.jurisdiction)}</p><p><strong>Next step:</strong> ${escape(c.actions[0])}</p><p><strong>Scope:</strong> ${escape(c.boundary)}</p><p>Sources checked ${date(c.reviewed||data.reviewed)}</p>${c.sources.map(s=>`<p class="ny-print-source">${escape(s.label)}: ${escape(s.url)}</p>`).join('')}</section>`).join('')}<p>${escape(data.reviewNote)}</p><p class="ny-print-source">Guide: ${escape(routeURL())}</p>`;
  document.body.classList.add('ny-printing');try{window.print();}catch{document.body.classList.remove('ny-printing');$('ny-plan-message').textContent='Printing is unavailable here. Use Copy checklist instead.';}
 });
 addEventListener('afterprint',()=>document.body.classList.remove('ny-printing'));
 function openInitialLink(){if(data&&!root.hidden&&!initialLinkOpened&&['#ny-ai-guide','#ny-startup-guide'].includes(location.hash)){initialLinkOpened=true;root.scrollIntoView({block:'start'});}}
 document.addEventListener('atlas:statechange',event=>{root.hidden=event.detail.code!=='NY';openInitialLink();});
 async function loadGuide(){
  results.setAttribute('aria-busy','true');
  try{
   const response=await fetch('ny-startups.json',{cache:'no-cache'});if(!response.ok)throw Error('Practical guide unavailable');data=await response.json();
   if(params.has('nyuse')){const value=params.get('nyuse');const valid=value.split(',').filter(f=>data.features.some(x=>x.id===f));if(value==='all'||valid.length){selected.clear();valid.forEach(f=>selected.add(f));}}
   if(['city','state','unsure'].includes(params.get('nywhere')))$('ny-where').value=params.get('nywhere');
   controls.innerHTML=data.features.map(f=>`<label class="startup-choice"><input type="checkbox" value="${escape(f.id)}" data-startup-feature><span>${escape(f.label)}</span></label>`).join('');
   $('ny-roles').innerHTML=data.roles.map(r=>`<button type="button" data-ny-role="${escape(r.id)}" aria-pressed="false"><strong>${escape(r.label)}</strong><span>${escape(r.description)}</span></button>`).join('');
   $('ny-faqs').innerHTML=data.faqs.map(f=>`<details><summary>${escape(f.question)}</summary><div><p>${escape(f.answer)}</p><div class="ny-faq-links">${links(f.sources)}${(f.related||[]).map(r=>lawLink(r.reference,r.label)).join('')}</div></div></details>`).join('');
   $('ny-help-links').innerHTML=data.help.map(h=>`<a href="${escape(h.url)}" target="_blank" rel="noopener noreferrer"><strong>${escape(h.title)} ↗</strong><span>${escape(h.text)}</span></a>`).join('');
   $('startup-deadlines').innerHTML=data.deadlines.map(d=>`<li><time datetime="${escape(d.date)}">${date(d.date)}</time><strong>${lawLink(d.reference,d.title)}</strong><span>${escape(d.scope)}</span></li>`).join('');
   $('startup-reviewed').textContent=data.reviewNote;render();openInitialLink();
  }catch(error){count.textContent='The practical guide could not load.';results.innerHTML='<p class="error">The regulation library below remains available. <button type="button" class="quiet-button" id="startup-retry">Retry practical guide</button></p>';$('startup-retry').addEventListener('click',loadGuide);}
  finally{results.setAttribute('aria-busy','false');}
 }
 loadGuide();
})();
