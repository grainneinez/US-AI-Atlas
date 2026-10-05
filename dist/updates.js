'use strict';
(() => {
 const root=document.getElementById('state-updates'),result=document.getElementById('state-update-results');
 if(!root)return;
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=value=>new Date(value+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
 let data=null,current={code:'NY',name:'New York'},scope='all',seenState=false;
 function render(){
  document.getElementById('updates-selected').textContent=`Selected state · ${current.name}`;
  root.querySelectorAll('[data-update-scope]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.updateScope===scope)));
  if(!data)return;
  const records=data.updates.filter(u=>scope==='all'||u.state===current.code).sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('state-update-count').textContent=`${records.length} of ${data.updates.length} updates · latest event first`;
  result.innerHTML=records.length?records.map(u=>`<article class="state-update-card" id="update-${escape(u.id)}"><div class="update-meta"><span class="update-state">${escape(u.stateName)}</span><span class="tag ${u.status.includes('upcoming')?'future':''}">${escape(u.status)}</span></div><h3>${escape(u.title)}</h3><p class="update-date">${escape(u.dateLabel)} · <time datetime="${u.date}">${date(u.date)}</time></p><p>${escape(u.summary)}</p><div class="update-timing">${escape(u.timing)}</div><details><summary>Business impact &amp; official sources</summary><div><h4>What businesses should know</h4><p>${escape(u.meaning)}</p><h4>Context &amp; limits</h4><p>${escape(u.context)}</p><div class="update-sources">${u.sources.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)}</a>`).join('')}</div><p class="review-date">Sources checked ${date(data.reviewed)}</p></div></details><a class="update-law-link" href="?state=${escape(u.state)}#regulations" data-update-state="${escape(u.state)}" data-update-law="${escape(u.reference)}">Open ${escape(u.stateName)}’s related measure</a></article>`).join(''):`<div class="empty-results"><strong>No update has been added for ${escape(current.name)} in this feed.</strong><p>The regulation library below still shows the state’s selected measures. This feed currently covers California, Colorado, and Utah.</p><button type="button" class="quiet-button" data-update-scope="all">View all state updates</button></div>`;
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-update-scope]');
  if(button){scope=button.dataset.updateScope;render();return;}
  const link=event.target.closest('[data-update-law]');
  if(link&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&!document.getElementById('state-select').disabled&&/^[A-Z]{2}$/.test(document.getElementById('state-select').value)){
   event.preventDefault();document.dispatchEvent(new CustomEvent('atlas:showlaw',{detail:{code:link.dataset.updateState,reference:link.dataset.updateLaw}}));
  }
 });
 document.addEventListener('atlas:statechange',event=>{current=event.detail;if(seenState)scope='selected';seenState=true;render();});
 async function load(){
  result.setAttribute('aria-busy','true');
  try{
   const response=await fetch('updates.json',{cache:'no-cache'});if(!response.ok)throw Error('Updates unavailable');data=await response.json();
   render();
  }catch{
   result.innerHTML='<div class="empty-results"><strong>State updates could not load.</strong><p>The regulation library remains available below.</p><button type="button" class="quiet-button" id="updates-retry">Try again</button></div>';
   document.getElementById('state-update-count').textContent='Updates unavailable';document.getElementById('updates-retry').addEventListener('click',load);
  }finally{result.setAttribute('aria-busy','false');}
 }
 load();
})();
