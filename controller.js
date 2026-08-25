// Controller: events, navigation, authentication and boot.
// AUTH MODAL

function showAuthMenu(){
 if(!currentUser){showAuthModal();return;}
 document.getElementById('modalBody').innerHTML='<h2 style="margin-bottom:4px;font-size:18px">☁️ Conta conectada</h2><p class="muted small" style="margin-bottom:16px">'+esc(currentUser.email)+'</p><div class="actions"><button class="btn secondary" type="button" data-action="signout">Sair da conta</button><button class="btn ghost" type="button" data-action="close-modal">Cancelar</button></div>';
 document.getElementById('modal').classList.add('show');
}
function showAuthModal(){
 document.getElementById('modalBody').innerHTML='<h2 style="margin-bottom:4px;font-size:18px">🔐 Entrar na Academia Agile</h2><p class="muted small" style="margin-bottom:16px">Seu progresso fica salvo na nuvem e acessível em qualquer dispositivo.</p><div style="display:flex;gap:8px;margin-bottom:16px"><button class="btn" id="btnL" type="button" data-auth-mode="login">Entrar</button><button class="btn ghost" id="btnR" type="button" data-auth-mode="register">Criar conta</button></div><div style="display:flex;flex-direction:column;gap:10px"><input id="aEmail" type="email" placeholder="seu@email.com" autocomplete="email" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--s2);color:var(--text);font-size:14px;font-family:var(--font)"><input id="aPass" type="password" placeholder="Senha (mínimo 6 caracteres)" autocomplete="current-password" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border2);background:var(--s2);color:var(--text);font-size:14px;font-family:var(--font)"><div id="aErr" style="font-size:12px;color:var(--red);display:none;padding:8px 10px;background:rgba(255,110,123,.08);border-radius:7px"></div><button class="btn" id="aBtn" type="button" data-action="submit-auth">Entrar</button></div><p class="small muted" style="margin-top:12px;line-height:1.6">Seu progresso local é preservado e sincronizado automaticamente após o login.</p>';
 document.getElementById('modal').classList.add('show');
 window._authMode='login';
}
function setM(m){window._authMode=m;document.getElementById('aBtn').textContent=m==='login'?'Entrar':'Criar conta';document.getElementById('btnL').className=m==='login'?'btn':'btn ghost';document.getElementById('btnR').className=m==='register'?'btn':'btn ghost';}
async function submitAuth(){
 const email=document.getElementById('aEmail').value.trim();
 const pass=document.getElementById('aPass').value;
 const err=document.getElementById('aErr');
 const btn=document.getElementById('aBtn');
 if(!email||!pass){err.textContent='Preencha email e senha.';err.style.display='block';return;}
 if(pass.length<6){err.textContent='A senha deve ter pelo menos 6 caracteres.';err.style.display='block';return;}
 btn.textContent='Aguarde...';btn.disabled=true;err.style.display='none';
 try{
  let res;
  if(window._authMode==='login'){
   res=await sb.signIn(email,pass);
   if(res.error){
    const msg=res.error.message;
    err.textContent=msg.includes('Invalid')||msg.includes('credentials')?'Email ou senha incorretos. Verifique e tente novamente.':msg.includes('Email not confirmed')?'Confirme seu email antes de entrar. Verifique sua caixa de entrada.':msg;
    err.style.display='block';btn.textContent='Entrar';btn.disabled=false;return;
   }
   currentUser=res.user;localStorage.setItem('supa_user',JSON.stringify(currentUser));
   const loaded=await loadFromCloud();if(!loaded)await syncToCloud();
  }else{
   res=await sb.signUp(email,pass);
   if(res.error){err.textContent=res.error.message.includes('already')?'Este email já tem conta. Tente entrar em vez de criar conta.':res.error.message;err.style.display='block';btn.textContent='Criar conta';btn.disabled=false;return;}
   currentUser=res.user;
   if(currentUser){localStorage.setItem('supa_user',JSON.stringify(currentUser));await syncToCloud();}
  }
  closeModal();toast('✅ Bem-vindo, '+email.split('@')[0]+'!');
  renderHome();renderProfile();updateAll();
 }catch(e){
  console.error('auth error',e);
  err.textContent='Erro de conexão com o servidor. Verifique sua internet e tente novamente.';
  err.style.display='block';btn.textContent=window._authMode==='login'?'Entrar':'Criar conta';btn.disabled=false;
 }
}
async function doSignOut(){
 closeModal();
 await sb.signOut();currentUser=null;localStorage.removeItem('supa_user');localStorage.removeItem('supa_token');
 profile=defaultProfile();
 try{const l=localStorage.getItem('agile-academy-v3');if(l)Object.assign(profile,JSON.parse(l));}catch(e){}
 renderHome();renderProfile();updateAll();toast('Sessão encerrada.');
}

// BOOT
(async function boot(){
 try{
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  // Carrega progresso local primeiro
  try{const l=localStorage.getItem('agile-academy-v3');if(l)Object.assign(profile,JSON.parse(l));}catch(e){}
  showScreen('home');ensureDay();renderHome();renderStudy();renderProfile();updateAll();
  window.scrollTo(0,0);requestAnimationFrame(()=>{window.scrollTo(0,0);setTimeout(()=>window.scrollTo(0,0),80);});
  // Verifica sessão Supabase em background
  await loadAuth();
  if(currentUser){
   const ok=await loadFromCloud();
   if(ok){renderHome();renderProfile();updateAll();}
  }
 }catch(e){console.error('BOOT_ERROR',e);}
})();


// Navigation and quiz interaction orchestration.
function showScreen(id){
 document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
 document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
 const n=document.getElementById('nav-'+(id==='result'||id==='quiz'?'home':id));if(n)n.classList.add('active');
 if(id==='home')renderHome();if(id==='study')renderStudy();if(id==='profile')renderProfile();
 window.scrollTo({top:0,behavior:'smooth'});
}
function openQuiz(){showScreen('quiz');renderQuestion();}
function answer(btn,correct,pos,idxArr){
 document.querySelectorAll('.opt').forEach(b=>b.disabled=true);
 const q=state.questions[state.idx];const ok=pos===correct;
 document.querySelectorAll('.opt')[correct].classList.add('correct');
 if(!ok)btn.classList.add('wrong');
 const m=mastery(q.concept);m.seen++;
 if(ok){m.correct++;state.sessionCorrect++;state.sessionStreak++;profile.totalCorrect++;}
 else{state.sessionStreak=0;m.recovery=(m.recovery||0)+1;profile.recovered++;}
 m.last=Date.now();profile.totalAnswered++;
 state.results.push({q,ok,correctTxt:q.opts[idxArr[correct]],yourTxt:q.opts[idxArr[pos]]});
 const mat=materialFor(q);
 const fb=document.getElementById('feedback');fb.className='feedback show';
 fb.innerHTML='<div class="fb '+(ok?'ok':'err')+'"><h4>'+(ok?'✅ Correto! +'+xpFor(q)+' XP':'❌ Não desta vez — revise o conceito')+'</h4><div class="small" style="line-height:1.6">'+esc(q.exp||'')+'</div><a class="material" href="'+mat.url+'" target="_blank" rel="noopener"><div class="play">▶</div><div><b>🎥 '+esc(mat.title)+'</b><small>Material: '+esc(q.concept)+'</small></div><div style="margin-left:auto;font-size:14px">↗</div></a>'+(ok?'':'<div class="small" style="margin-top:7px;color:var(--amber)">🩹 A próxima recuperação deste conceito será considerada no seu domínio.</div>')+'</div>';
 if(ok)addXP(xpFor(q));else addXP(5);
 if(state.sessionStreak>=5)unlock('streak5');if(masteryPct(q.concept)>=90)unlock('master90');if(!ok&&m.recovery>=10)unlock('recover10');
 const nb=document.getElementById('nextBtn');nb.style.display='block';nb.textContent=state.idx<state.questions.length-1?'Próxima →':'Ver resultado →';
 save();
}
function nextQuestion(){if(state.idx<state.questions.length-1){state.idx++;renderQuestion();}else finishSession();}
async function finishSession(){
 const total=state.questions.length,correct=state.sessionCorrect,p=Math.round(correct/total*100);
 if(state.mode==='daily'){profile.daily={date:dayKey(),done:true,score:p};addXP(100);}
 if(currentUser){try{await sb.insertSession({user_id:currentUser.id,mode:state.mode,score:p,correct,total,xp_earned:profile.xp});}catch(e){}}
 if(state.mode==='exam'){
  profile.promotionCount++;
  const req=REQUIRED_BY_LEVEL[profile.level]||[];
  const comp=req.map(g=>{const arr=state.results.filter(r=>catGroup(r.q.concept)===g);const pc=arr.length?Math.round(arr.filter(r=>r.ok).length/arr.length*100):0;return{g,pc};});
  const passed=p>=PROMOTION_SCORE&&comp.every(x=>x.pc>=REQUIRED_DOMAIN);
  if(passed&&profile.level<5){profile.level++;addXP(250);unlock('coach');}
  showResult(p,comp,passed);
 }else{
  profile.trainingCount++;profile.history.unshift({date:new Date().toLocaleDateString('pt-BR'),mode:state.mode,score:p,correct,total,xp:profile.xp});profile.history=profile.history.slice(0,20);unlock('first');showResult(p,[],false);
 }
 save();
}


// Event delegation keeps HTML declarative and preserves the MVC boundary.
document.addEventListener('click', function(event){
 const screenBtn=event.target.closest('[data-screen]');
 if(screenBtn){showScreen(screenBtn.dataset.screen);return;}
 const action=event.target.closest('[data-action]');
 if(!action)return;
 switch(action.dataset.action){
  case 'training': startTraining(); break;
  case 'exam': startExam(); break;
  case 'daily': startDaily(); break;
  case 'recommended': startRecommended(); break;
  case 'next': nextQuestion(); break;
  case 'reset': resetProgress(); break;
  case 'auth-menu': currentUser ? showAuthMenu() : showAuthModal(); break;
  case 'auth-modal': showAuthModal(); break;
  case 'close-modal': closeModal(); break;
  case 'submit-auth': submitAuth(); break;
  case 'signout': doSignOut(); break;
  case 'study-concept': studyConcept(action.dataset.c); break;
  case 'answer': {
    const idxArr=action.dataset.idxArr.split(',').map(Number);
    answer(action,Number(action.dataset.correct),Number(action.dataset.pos),idxArr);
    break;
  }
 }
});
document.addEventListener('click',function(event){
 const authMode=event.target.closest('[data-auth-mode]');
 if(authMode)setM(authMode.dataset.authMode);
});

function studyConcept(enc){const c=decodeURIComponent(enc);const p=BANK.filter(q=>q.concept===c);state={mode:'recommended',questions:uniquePick(p,Math.min(8,p.length)),idx:0,results:[],sessionCorrect:0,sessionStreak:0};markSeen(state.questions);save();openQuiz();}

function closeModal(){document.getElementById('modal').classList.remove('show');}

function resetProgress(){if(confirm('Zerar todo o progresso?')){if(currentUser)sb.upsertProfile({user_id:currentUser.id,level:1,xp:0,streak:0,best_streak:0,last_day:null,total_answered:0,total_correct:0,recovered:0,achievements:{},daily:{},training_count:0,promotion_count:0});profile=defaultProfile();save();showScreen('home');}}
