// View: DOM rendering and presentation only.
function renderQuestion(){
 const q=state.questions[state.idx];
 document.getElementById('modeTag').textContent=state.mode==='exam'?'🧪 Avaliação':state.mode==='daily'?'⚔️ Desafio':state.mode==='recommended'?'🩹 Recuperação':'🎮 Treinamento';
 document.getElementById('qdiff').textContent=['','Básico','Intermediário','Avançado','Expert','Especialista'][q.diff];
 document.getElementById('qcount').textContent=(state.idx+1)+'/'+state.questions.length;
 document.getElementById('qtext').textContent=q.q;
 document.getElementById('examBanner').innerHTML=state.mode==='exam'?'<div class="exam-box"><b>🧪 Avaliação de promoção</b><div class="small muted" style="margin-top:4px">Necessário: '+PROMOTION_SCORE+'% geral + mínimo '+REQUIRED_DOMAIN+'% nas competências obrigatórias.</div></div>':'';
 const idxArr=[0,1,2,3].sort(()=>Math.random()-.5);const correct=idxArr.indexOf(q.ans);
 const opts=document.getElementById('opts');opts.innerHTML='';
 idxArr.forEach((orig,pos)=>{const b=document.createElement('button');b.className='opt';b.innerHTML='<span class="letter">'+['A','B','C','D'][pos]+'</span><span>'+esc(q.opts[orig])+'</span>';b.dataset.pos=pos;b.dataset.action='answer';b.dataset.correct=correct;b.dataset.idxArr=idxArr.join(',');b.dataset.pos=pos;opts.appendChild(b);});
 document.getElementById('feedback').className='feedback';document.getElementById('nextBtn').style.display='none';
 window.scrollTo({top:0,behavior:'smooth'});
}

function showResult(p,comp,passed){
 showScreen('result');
 let title=state.mode==='exam'?(passed?'🎉 PROMOÇÃO CONQUISTADA!':'🧪 Avaliação concluída'):state.mode==='daily'?'⚔️ Desafio concluído':'📊 Treinamento concluído';
 let html='<div class="hero"><h1>'+title+'</h1><p>'+state.sessionCorrect+'/'+state.questions.length+' acertos · '+p+'% · '+profile.xp+' XP total</p></div>';
 if(state.mode==='exam'){if(passed)html+='<div class="promo"><h2>🔓 Novo nível desbloqueado!</h2><p style="margin-top:6px">'+esc(LEVELS[profile.level-1].label)+'</p></div>';else html+='<div class="card"><h3>❌ Promoção não liberada</h3><p class="muted small" style="margin-top:6px">Regra: '+PROMOTION_SCORE+'% geral e '+REQUIRED_DOMAIN+'% nas competências obrigatórias.</p></div>';}
 html+='<div class="stats" style="margin-top:10px"><div class="stat"><b style="color:var(--green)">'+state.sessionCorrect+'</b><span>Acertos</span></div><div class="stat"><b style="color:var(--red)">'+(state.questions.length-state.sessionCorrect)+'</b><span>Erros</span></div><div class="stat"><b style="color:var(--accent)">'+profile.xp+'</b><span>XP total</span></div><div class="stat"><b style="color:var(--amber)">'+profile.level+'</b><span>Nível</span></div></div>';
 if(comp.length){html+='<div class="section-title">Competências da avaliação</div><div class="card">'+comp.map(c=>'<div class="skill"><div class="skill-name">'+esc(c.g)+'</div><div class="bar"><i style="width:'+c.pc+'%;background:'+(c.pc>=REQUIRED_DOMAIN?'var(--green)':'var(--red)')+'"></i></div><div class="pct">'+c.pc+'%</div></div>').join('')+'</div>';}
 const errors=state.results.filter(r=>!r.ok);
 if(errors.length){html+='<div class="section-title">🩹 Revisão dos erros</div><div class="card">'+errors.map(r=>{const m=materialFor(r.q);return'<div class="review-item"><div class="review-q">'+esc(r.q.q)+'</div><div class="review-line righttxt">✓ Correto: '+esc(r.correctTxt)+'</div><div class="review-line wrongtxt">✗ Sua resposta: '+esc(r.yourTxt)+'</div><div class="review-line muted small" style="margin-top:3px">'+esc(r.q.exp||'')+'</div><a class="material" href="'+m.url+'" target="_blank" rel="noopener"><div class="play">▶</div><div><b>🎥 '+esc(m.title)+'</b><small>'+esc(r.q.concept)+'</small></div></a></div>';}).join('')+'</div>';}
 html+='<div class="actions"><button class="btn" type="button" data-action="recommended">🩹 Treinar meu ponto fraco</button><button class="btn secondary" type="button" data-screen="home">🏠 Voltar à jornada</button></div>';
 document.getElementById('resultBody').innerHTML=html;
}

// SCREENS

function renderAuthStrip(){
 const w=document.getElementById('auth-strip-wrap');
 if(!w)return;
 if(currentUser){
  w.innerHTML='<div class="auth-strip" data-action="auth-menu"><div class="acloud">☁️</div><div class="atext"><b>'+esc(currentUser.email.split('@')[0])+'</b><span>'+esc(currentUser.email)+' · Progresso salvo na nuvem</span></div><div class="achev">›</div></div>';
 }else{
  w.innerHTML='<div class="auth-strip" data-action="auth-modal"><div class="acloud">🔐</div><div class="atext"><b>Entrar ou criar conta</b><span>Salve seu progresso na nuvem</span></div><div class="achev">›</div></div>';
 }
}

function renderHome(){
 ensureDay();
 document.getElementById('xp').textContent=profile.xp+' XP';
 document.getElementById('streakTop').textContent=profile.streak+' dias';
 document.getElementById('avatarInitials').textContent=currentUser?currentUser.email.slice(0,2).toUpperCase():'GM';
 document.getElementById('welcome').textContent=LEVELS[profile.level-1].label;
 document.getElementById('levelXPLabel').textContent=profile.xp+' XP acumulados';
 const weak=getWeakConcept();
 const weakPct=weak?masteryPct(weak):0;
 document.getElementById('continueConcept').textContent=weak||'Treinamento adaptativo';
 document.getElementById('continueQuestion').textContent=weak?'Questões adaptativas focadas no seu nível':'Comece um treinamento para continuar sua jornada';
 document.getElementById('continueBar').style.width=weak?Math.max(8,weakPct)+'%':'8%';
 document.getElementById('continuePct').textContent=weak?weakPct+'% domínio':'Pronto';
 document.getElementById('recommendedConcept').textContent=weak||'Comece seu treinamento';
 document.getElementById('recommendedPct').textContent=weakPct+'%';
 document.getElementById('recommendedBar').style.width=weakPct+'%';
 const dailyDone=profile.daily.date===dayKey()&&profile.daily.done;
 document.getElementById('dailyCount').textContent=dailyDone?'5 de 5 questões':'0 de 5 questões';
 document.getElementById('dailyBar').style.width=dailyDone?'100%':'0%';
 const next=profile.level<5?LEVELS[profile.level].label:'Nível máximo alcançado';
 document.getElementById('nextGoal').textContent=next;
 document.getElementById('goalText').textContent=profile.level<5?'Avaliação + domínio mínimo de '+REQUIRED_DOMAIN+'%':'Você concluiu toda a jornada';
 document.getElementById('goalBar').style.width=profile.level<5?'75%':'100%';
 document.getElementById('goalHint').textContent=profile.level<5?'Requisito geral: '+PROMOTION_SCORE+'%':'Continue praticando para manter o domínio';
 const journey=document.getElementById('journeyTrack');
 journey.innerHTML=LEVELS.map(l=>'<div class="journey-node '+(l.n===profile.level?'active':'')+'">'+(l.n<profile.level?'✓':l.n===profile.level?'●':'🔒')+'<div>'+esc(l.label.replace('Scrum Master ','SM '))+'</div></div>').join('');
 updateLevels();
}

function renderStudy(){
 let html='';
 TOPICS.forEach(([g,cs])=>{cs.forEach(c=>{const m=MATERIALS[c];const count=BANK.filter(q=>q.concept===c).length;if(!m)return;html+='<div class="study-card"><h3 style="font-size:13px">'+esc(c)+'</h3><div class="meta"><span class="chip">'+esc(g)+'</span><span class="chip">'+count+' perguntas</span><span class="chip">'+masteryPct(c)+'% domínio</span></div><div class="actions"><a class="btn secondary" href="'+esc(m[1])+'" target="_blank" rel="noopener" style="font-size:11px;padding:8px 10px">🎥 Vídeo</a><button class="btn" data-c="'+encodeURIComponent(c)+'" data-action="study-concept" style="font-size:11px;padding:8px 10px">🧠 Praticar</button></div></div>';});});
 document.getElementById('studyGrid').innerHTML=html;
}

function renderProfile(){
 document.getElementById('profileStats').innerHTML=[['XP',profile.xp],['Precisão',profile.totalAnswered?Math.round(profile.totalCorrect/profile.totalAnswered*100)+'%':'0%'],['Streak máx.',profile.bestStreak],['Promoções',profile.level-1]].map(x=>'<div class="stat"><b>'+x[1]+'</b><span>'+x[0]+'</span></div>').join('');
 document.getElementById('history').innerHTML=profile.history.length?profile.history.slice(0,12).map(h=>'<div class="row"><span>'+h.date+' · '+esc(h.mode)+'</span><span>'+h.correct+'/'+h.total+' · '+h.score+'%</span></div>').join(''):'<div class="empty">Seu histórico aparecerá aqui.</div>';
 document.getElementById('achievements').innerHTML=ACH.map(a=>{const got=!!profile.achievements[a[0]];return'<div class="achievement '+(got?'':'lock')+'"><div class="aicon">'+a[1]+'</div><div><b>'+a[2]+'</b><div class="small muted">'+a[3]+'</div></div></div>';}).join('');
 updateLevels();
}
function updateLevels(){
 document.querySelectorAll('.lev').forEach(x=>x.classList.toggle('active',+x.dataset.lv===profile.level));
 const pct=profile.level===5?100:((profile.level-1)/4*100)+5;
 document.getElementById('levelFill').style.width=pct+'%';
 document.getElementById('levelBadge').textContent=LEVELS[profile.level-1].label+(profile.level<5?' · próxima promoção: '+PROMOTION_SCORE+'%':' · nível máximo');
 document.getElementById('levelBadge').style.color=LEVELS[profile.level-1].color;
 document.getElementById('levelBadge').style.borderColor=LEVELS[profile.level-1].color;
}
function updateAll(){document.getElementById('xp').textContent=profile.xp+' XP';updateLevels();}
function unlock(id){if(!profile.achievements[id]){profile.achievements[id]=Date.now();const a=ACH.find(x=>x[0]===id);if(a)toast('🏅 '+a[2]);}}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600);}



function renderMetrics(){
 const groups={};
 BANK.forEach(q=>{const g=catGroup(q.concept);groups[g]=groups[g]||new Set();groups[g].add(q.concept);});
 const arr=Object.keys(groups).map(g=>{const concepts=[...groups[g]];const pct=Math.round(concepts.reduce((sum,c)=>sum+masteryPct(c),0)/concepts.length);return [g,pct];}).sort((a,b)=>a[1]-b[1]);
 const precision=profile.totalAnswered?Math.round(profile.totalCorrect/profile.totalAnswered*100):0;
 document.getElementById('metricsOverview').innerHTML=[['📊',Math.round(arr.reduce((s,x)=>s+x[1],0)/(arr.length||1))+'%','Domínio médio','Por competência'],['🎯',precision+'%','Precisão','Acertos gerais'],['📝',profile.totalAnswered,'Questões respondidas','Histórico total'],['🔥',profile.streak+' dias','Streak atual','Consistência']].map(x=>'<div class="metric-big"><b>'+x[1]+'</b><span>'+x[2]+'</span><div class="metric-note">'+x[3]+'</div></div>').join('');
 document.getElementById('metricsSkills').innerHTML=arr.map(x=>'<div class="skill"><div class="skill-name">'+esc(x[0])+'</div><div class="bar"><i style="width:'+x[1]+'%"></i></div><div class="pct">'+x[1]+'%</div></div>').join('')||'<div class="empty">Responda questões para começar a medir seu domínio.</div>';
 const focus=arr.filter(x=>x[1]<70).slice(0,5);
 document.getElementById('metricsFocus').innerHTML=focus.length?focus.map(x=>'<div class="metric-focus"><b>'+esc(x[0])+'</b><span>'+x[1]+'% · Recomendado</span></div>').join(''):'<div class="empty">Nenhum ponto de atenção no momento. Continue assim.</div>';
}
