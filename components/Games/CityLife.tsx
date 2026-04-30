<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>City Life — Choose a Career</title>
  <style>
    :root{--bg:#0f1724;--card:#0b1220;--accent:#ffb86b;--muted:#94a3b8;--good:#34d399}
    html,body{height:100%;margin:0;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial}
    body{background:linear-gradient(180deg,#071023 0%, #0b1220 60%);color:#e6eef8;display:flex;align-items:center;justify-content:center;padding:24px}
    .game{width:980px;max-width:98%;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.05));border:1px solid rgba(255,255,255,0.03);box-shadow:0 10px 30px rgba(2,6,23,0.6);border-radius:12px;padding:20px}
    header{display:flex;align-items:center;gap:16px}
    h1{margin:0;font-size:20px}
    .meta{color:var(--muted);font-size:13px}
    .layout{display:grid;grid-template-columns:320px 1fr;gap:16px;margin-top:16px}
    .panel{background:var(--card);padding:14px;border-radius:10px}
    select,input,button{font:inherit}
    .profession-list{display:flex;flex-direction:column;gap:8px}
    .desc{font-size:14px;color:var(--muted);margin-top:8px}
    .play-area{min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
    .big{font-size:28px}
    .score{font-size:18px;color:var(--accent)}
    .meter{height:12px;background:rgba(255,255,255,0.06);border-radius:8px;overflow:hidden;width:260px}
    .meter > i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#ffd3a4);width:0%}
    .controls{display:flex;gap:8px;align-items:center}
    .small{font-size:13px;color:var(--muted)}
    .grid-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:220px}
    .btn{background:#0b1726;border:1px solid rgba(255,255,255,0.03);padding:10px;border-radius:8px;color:#dfe9f6;cursor:pointer}
    .btn:active{transform:translateY(1px)}
    footer{margin-top:12px;color:var(--muted);font-size:13px;text-align:center}
    .success{color:var(--good);font-weight:700}
    @media (max-width:800px){.layout{grid-template-columns:1fr}.profession-list{flex-direction:row;overflow:auto}}
  </style>
</head>
<body>
  <div class="game">
    <header>
      <div>
        <h1>City Life — Try a Career</h1>
        <div class="meta">Play short challenges for different jobs. Pick a profession and press Start Challenge.</div>
      </div>
    </header>

    <div class="layout">
      <aside class="panel">
        <div class="profession-list">
          <label for="profession">Choose profession</label>
          <select id="profession">
            <option>Doctor</option>
            <option>Veterinarian</option>
            <option>Real Estate Agent</option>
            <option>Singer</option>
            <option>Dancer</option>
            <option>Handyman</option>
            <option>Architect</option>
            <option>Physician</option>
            <option>Teacher</option>
            <option>Software Developer</option>
            <option>Scientist</option>
            <option>Lawyer</option>
            <option>Pilot</option>
            <option>Firefighter</option>
            <option>Policeman</option>
            <option>Retail Salesperson</option>
            <option>Therapist</option>
            <option>Uber Driver</option>
            <option>Financial Manager</option>
          </select>

          <div class="desc" id="prof-desc">Select a profession to see a short description and a micro-challenge.</div>

          <div style="margin-top:12px;display:flex;gap:8px;align-items:center">
            <button class="btn" id="start">Start Challenge</button>
            <button class="btn" id="reset">Reset</button>
          </div>

          <div style="margin-top:12px;font-size:13px;color:var(--muted)">Tips: Challenges are short (10-30s). Each job uses a different interaction: clicking, quick keys, rhythm or quiz.</div>
        </div>
      </aside>

      <main class="panel">
        <div class="play-area" id="play-area">
          <div class="big">Welcome to City Life</div>
          <div class="small">Choose a profession on the left and press "Start Challenge" to begin.</div>

          <div id="challenge" style="display:none;width:100%">
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%;max-width:720px;margin:auto">
              <div class="score">Progress: <span id="progress">0</span>/<span id="target">0</span></div>
              <div class="small">Time left: <span id="time">0</span>s</div>
            </div>

            <div style="margin-top:18px;display:flex;gap:18px;align-items:center;flex-direction:column;">
              <div id="challenge-area"></div>
              <div class="meter" style="margin-top:6px"><i id="meter-fill"></i></div>
              <div id="result" class="small"></div>
            </div>

            <div style="margin-top:10px;display:flex;gap:8px;align-items:center;justify-content:center">
              <button class="btn" id="action-btn" style="display:none">Click</button>
              <div id="key-hint" class="small"></div>
            </div>
          </div>

        </div>
      </main>
    </div>

    <footer>Built-in simple micro-games: aim is to sample different interactions for each profession.</footer>
  </div>

  <script>
    const professions = {
      "Doctor": { type: 'click', desc: 'Treat patients: perform quick care actions. Click the "Action" button rapidly to stabilise patients.', target: 20, time: 15 },
      "Veterinarian": { type: 'click', desc: 'Care for animals: gentle quick clicks to comfort them.', target: 18, time: 18 },
      "Real Estate Agent": { type: 'quiz', desc: 'Pitch a house quickly. Answer a short pricing quiz under time pressure.', quiz: {q: 'If a house bought for $200k appreciates 5% yearly, approximate value after 1 year?', a: '210000'}, time:20 },
      "Singer": { type: 'rhythm', desc: 'Hit the spacebar on the beat sequence shown to perform well.', pattern: [0.8,1.6,2.4,3.2], time:8 },
      "Dancer": { type: 'rhythm', desc: 'Follow the rhythm by pressing Arrow keys when arrows appear.', pattern: [0.7,1.4,2.1,2.8], time:8 },
      "Handyman": { type: 'click', desc: 'Fix broken items: click the highlighted tile quickly.', target: 15, time:14 },
      "Architect": { type: 'arrange', desc: 'Arrange building blocks in order (1..3) quickly.', sequence: [1,2,3], time:20 },
      "Physician": { type: 'click', desc: 'Diagnose and treat quickly: stabilize vitals by clicking.', target:22, time:16 },
      "Teacher": { type: 'quiz', desc: 'Answer a quick knowledge question under time.', quiz: {q: 'What is 7 x 8?', a: '56'}, time:18 },
      "Software Developer": { type: 'debug', desc: 'Find the bug: pick the incorrect line from options.', choices: ['const a = 1','if(x === 1) {','console.log(a);'], answerIndex:1, time:20 },
      "Scientist": { type: 'click', desc: 'Run experiments: click to collect samples.', target:16, time:15 },
      "Lawyer": { type: 'quiz', desc: 'Choose the correct article: a short legal logic question.', quiz: {q:'Which is most important in a contract? Offer or Rain?', a:'Offer'}, time:18 },
      "Pilot": { type: 'react', desc: 'Quick reactions to keep the plane steady — press indicated keys quickly.', keys:['ArrowLeft','ArrowRight'], target:14, time:14 },
      "Firefighter": { type: 'react', desc: 'Respond to flames: press the shown key to spray water on time.', keys:['f','j'], target:12, time:12 },
      "Policeman": { type: 'react', desc: 'Quick decisions: press the highlighted key as it appears.', keys:['q','p'], target:12, time:12 },
      "Retail Salesperson": { type: 'click', desc: 'Serve customers fast — click to ring up items.', target:20, time:18 },
      "Therapist": { type: 'quiz', desc: 'Listen and choose the best response in a short scenario.', quiz: {q:'Client says they feel anxious. Best response: A) Dismiss B) Validate', a:'Validate'}, time:25 },
      "Uber Driver": { type: 'react', desc: 'Navigate traffic: press correct arrow when prompted.', keys:['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'], target:16, time:18 },
      "Financial Manager": { type: 'quiz', desc: 'Quick math/choice question under pressure.', quiz: {q:'If revenue=$1000 and cost=$600, profit margin=?', a:'40%'}, time:20 }
    };

    const sel = document.getElementById('profession');
    const desc = document.getElementById('prof-desc');
    const startBtn = document.getElementById('start');
    const resetBtn = document.getElementById('reset');
    const challenge = document.getElementById('challenge');
    const playArea = document.getElementById('play-area');
    const challArea = document.getElementById('challenge-area');
    const progressEl = document.getElementById('progress');
    const targetEl = document.getElementById('target');
    const timeEl = document.getElementById('time');
    const meter = document.getElementById('meter-fill');
    const result = document.getElementById('result');
    const actionBtn = document.getElementById('action-btn');
    const keyHint = document.getElementById('key-hint');

    let state = null;
    function escapeHtml(s){
      return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function updateDesc(){
      const p = sel.value;
      desc.textContent = professions[p].desc || '';
    }
    sel.addEventListener('change', updateDesc);
    updateDesc();

    function reset(){
      clearState();
      challenge.style.display='none';
      challArea.innerHTML='';
      result.textContent='';
      actionBtn.style.display='none';
      keyHint.textContent='';
      meter.style.width='0%';
      progressEl.textContent='0';
    }

    resetBtn.addEventListener('click', reset);

    function clearState(){
      if(state && state.timer) clearInterval(state.timer);
      if(state && state.listener) window.removeEventListener('keydown', state.listener);
      state = null;
    }

    startBtn.addEventListener('click', ()=>{
      clearState();
      const p = sel.value;
      const def = professions[p];
      challenge.style.display='block';
      result.textContent='';

      // initialize generic fields
      state = { profession: p, type: def.type, timeLeft: def.time || 15, progress: 0 };
      progressEl.textContent='0';

      if(def.target) targetEl.textContent = def.target; else targetEl.textContent = '1';
      timeEl.textContent = state.timeLeft;

      // render challenge area by type
      challArea.innerHTML='';
      actionBtn.style.display='none';
      keyHint.textContent='';

      if(def.type === 'click'){
        actionBtn.style.display='inline-block';
        actionBtn.textContent='Do action';
        actionBtn.onclick = ()=>{
          state.progress++;
          updateProgress(def.target);
        };
      }
      else if(def.type === 'react'){
        // show a random key to press
        actionBtn.style.display='none';
        keyHint.textContent='Press the highlighted key when shown.';
        challArea.innerHTML='<div id="react-box" class="small"></div>';
        const box = document.getElementById('react-box');
        state.reactKey = null;
        state.reactNext = ()=>{
          const keys = def.keys;
          const k = keys[Math.floor(Math.random()*keys.length)];
          state.reactKey = k;
          box.textContent = 'Press: ' + k;
          state.reactExpires = Date.now() + 1200;
        };
        state.listener = (e)=>{
          if(!state.reactKey) return;
          if(e.key === state.reactKey || e.key === state.reactKey.replace('Arrow','')){
            state.progress++;
            updateProgress(def.target);
            state.reactKey = null;
            box.textContent = 'Good!';
          }
        };
        window.addEventListener('keydown', state.listener);
        // first reveal after 800ms
        setTimeout(()=>{ if(state) state.reactNext(); }, 800);
      }
      else if(def.type === 'rhythm'){
        challArea.innerHTML='<div class="small">Press Space on the beat sequence. Try to hit as many beats as you can.</div>';
        actionBtn.style.display='none';
        state.pattern = def.pattern.slice();
        state.startTime = Date.now();
        state.hitCount = 0;
        state.listener = (e)=>{
          if(e.code === 'Space'){
            const t = (Date.now() - state.startTime)/1000;
            // check nearest beat within +/-0.4s
            for(let i=0;i<state.pattern.length;i++){
              if(Math.abs(t - state.pattern[i]) < 0.45 && !state.pattern[i].hit){
                state.pattern[i].hit = true;
                state.hitCount++;
                state.progress = state.hitCount;
                updateProgress(state.pattern.length);
              }
            }
          }
        };
        window.addEventListener('keydown', state.listener);
      }
      else if(def.type === 'quiz'){
        challArea.innerHTML = `<div style="max-width:700px"><div class=\"small\">${def.quiz.q}</div><input id=\"quiz-answer\" style=\"margin-top:8px;padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.04);width:200px;background:#071226;color:#eaf4ff\" placeholder=\"Your answer\"></div>`;
        actionBtn.style.display='inline-block';
        actionBtn.textContent='Submit Answer';
        actionBtn.onclick = ()=>{
          const a = (document.getElementById('quiz-answer').value || '').trim();
          if(a.toLowerCase() === (def.quiz.a||'').toLowerCase()){
            state.progress = 1; updateProgress(1);
            result.innerHTML = '<span class="success">Correct!</span>';
            end(true);
          } else {
            result.textContent = 'Incorrect — try again quickly.';
          }
        };
      }
      else if(def.type === 'arrange'){
        challArea.innerHTML = '<div class="small">Click blocks in ascending order (1→3).</div><div id="blocks" style="display:flex;gap:8px;margin-top:10px"></div>';
        const blocks = document.getElementById('blocks');
        const seq = def.sequence.slice().sort(()=>Math.random()-0.5);
        seq.forEach(n=>{
          const b = document.createElement('button'); b.className='btn'; b.textContent=n; b.onclick=()=>{
            if(n === (state.next||1)){
              state.progress++; state.next = (state.next||1)+1; updateProgress(def.sequence.length);
            } else {
              result.textContent='Wrong order — restart quickly.';
            }
          }; blocks.appendChild(b);
        });
      }
      else if(def.type === 'debug'){
        challArea.innerHTML = '<div class="small">Find the incorrect line in the code snippet:</div><div style="margin-top:8px"><pre style="background:#071226;padding:8px;border-radius:6px">1 const a = 1\n2 if(x === 1) {\n3 console.log(a);</pre></div><div id="choices" style="margin-top:8px;display:flex;gap:8px"></div>';
        const choices = document.getElementById('choices');
        def.choices.forEach((c,idx)=>{
          const b = document.createElement('button'); b.className='btn'; b.textContent=c; b.onclick=()=>{
            if(idx === def.answerIndex){ state.progress=1; updateProgress(1); result.innerHTML='<span class="success">Bug found — good job!</span>'; end(true);} else { result.textContent='Not that one.' }
          }; choices.appendChild(b);
        });
      }

      // timer
      state.timer = setInterval(()=>{
        state.timeLeft--;
        timeEl.textContent = state.timeLeft;
        // rhythm: keep a timeline
        if(state.type === 'rhythm'){
          // nothing additional, user presses space
        }
        if(state.type === 'react' && state.reactKey && Date.now() > state.reactExpires){
          // expired
          state.reactKey = null;
          const box = document.getElementById('react-box'); if(box) box.textContent='Missed!';
          // schedule next
          setTimeout(()=>{ if(state) state.reactNext(); }, 600);
        }

        // periodic reveal for react
        if(state.type === 'react' && !state.reactKey && Math.random() < 0.18){ if(state) state.reactNext(); }

        // check win
        const target = def.target || (def.pattern? def.pattern.length : 1);
        if(state.progress >= target){ end(true); }

        if(state.timeLeft <=0){ end(false); }
        // update meter
        const pct = Math.min(100, Math.round((state.progress/target)*100));
        meter.style.width = pct + '%';
      }, 1000);

      function updateProgress(target){
        progressEl.textContent = state.progress;
        meter.style.width = Math.min(100, Math.round((state.progress/target)*100)) + '%';
        if(state.type === 'react'){
          // reveal next after small delay
          setTimeout(()=>{ if(state && state.reactNext) state.reactNext(); }, 350);
        }
      }

      function end(won){
        clearState();
        if(won){ result.innerHTML = `<span class=\"success\">Success! You performed well as ${escapeHtml(p)}.</span>`; }
        else { result.textContent = `Time's up — you scored ${state.progress || 0}. Try again.` }
        actionBtn.style.display='none';
        keyHint.textContent='';
        // short confetti-like animation: brief color flash
        document.body.animate([{background:'radial-gradient(circle at 10% 10%, rgba(255,216,160,0.06), transparent 20%)'},{background:'none'}],{duration:900})
      }

    });

    // start with default state cleared
    reset();
  </script>
</body>
</html>
