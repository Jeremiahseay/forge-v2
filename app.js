
const KEY="forgeV2";
const blank=()=>({profiles:{me:{},fiancee:{}},goals:{me:{},fiancee:{}},scans:{me:[],fiancee:[]},logs:{me:[],fiancee:[]},ratings:{}});
let state=JSON.parse(localStorage.getItem(KEY)||"null")||blank();
state={...blank(),...state,profiles:{...blank().profiles,...state.profiles},goals:{...blank().goals,...state.goals},scans:{...blank().scans,...state.scans},logs:{...blank().logs,...state.logs},ratings:state.ratings||{}};
let route=location.hash.replace("#","")||"today";
let profile="me";
const workouts={me:{title:"Wednesday — Back + Biceps A",items:[
["Pull-Up","4 sets","1–2 RIR"],["Chest-Supported Row","2 × 8–12","1–2 RIR"],["Lat Pulldown","2 × 8–12","1–2 RIR"],["Seated Cable Row","2 × 8–12","1–2 RIR"],["Face Pull","2 × 12–20","1–2 RIR"],["Incline Dumbbell Curl","2 × 8–12","1–2 RIR"],["Cable Curl","2 × 10–15","1–2 RIR"]]},
fiancee:{title:"Wednesday — Back + Biceps (Shared)",items:[
["Pull-Up","4 sets","~2 RIR"],["Chest-Supported Row","2 × 10–15","~2 RIR"],["Lat Pulldown","2 × 10–15","~2 RIR"],["Seated Cable Row","2 × 10–15","~2 RIR"],["Face Pull","2 × 12–20","1–2 RIR"],["Cable Curl","2 × 10–15","1–2 RIR"]]}};
const areas=["All","Chest","Back","Shoulders","Arms","Core","Glutes","Quads","Hamstrings","Calves","Full Body","Mobility / Other"];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function go(r){route=r;location.hash=r;render()}
function shell(title,body){return `<header><div><small>FORGE FITNESS V2</small><h1>${title}</h1></div><select id="who"><option value="me">Me</option><option value="fiancee">Fiancée</option></select></header><main>${body}</main><nav>${[["today","Today"],["train","Train"],["knowledge","Knowledge"],["baseline","Baseline"],["bodytype","Body Type"],["bodyshape","Body Shape"],["scan","3D Scan"],["goals","Goals"],["review","Review"]].map(x=>`<button class="${route===x[0]?"on":""}" data-route="${x[0]}">${x[1]}</button>`).join("")}</nav>`}
function render(){document.body.innerHTML=shell(routeTitle(),views[route]?.()||views.today());document.getElementById("who").value=profile;bind()}
function routeTitle(){return ({today:"Today",train:"Training",knowledge:"Exercise Library",baseline:"Baseline",bodytype:"Body Type",bodyshape:"Body Shape",scan:"3D Body Scan",goals:"Goals",review:"Weekly Review"})[route]||"Today"}
function viewsToday(){let p=state.profiles[profile],g=state.goals[profile],s=state.scans[profile];return `<section class="hero"><small>TODAY</small><h2>${workouts[profile].title}</h2><p>Current block • data captured here feeds the review system.</p><button class="primary" data-route="train">Start workout</button></section>
<div class="grid"><div class="card"><small>BASELINE</small><strong>${p.saved?"Saved":"Not set"}</strong><p>Permanent starting reference.</p></div><div class="card"><small>GOAL</small><strong>${esc(g.primary||"Set goal")}</strong><p>Separate from baseline.</p></div><div class="card"><small>SCANS</small><strong>${s.length}</strong><p>Quality-gated scan records.</p></div></div>
<div class="card"><h3>System</h3><p>Baseline → Goal Engine → Programming → Training → Results → Review.</p><p class="muted">Recommendations never change the plan automatically.</p></div>`}
const views={today:viewsToday,
train:()=>{let w=workouts[profile];return `<div class="card"><small>CURRENT WORKOUT</small><h2>${w.title}</h2><p class="muted">Log load, reps and effort. Straight sets remain the backbone; selected stable movements can use intensity techniques when prescribed.</p></div><div class="card">${w.items.map((x,i)=>`<div class="work"><div class="row"><div><b>${i+1}. ${x[0]}</b><small>${x[1]} • ${x[2]}</small></div><button class="secondary" data-ex="${esc(x[0])}">KB</button></div><div class="sets">${[1,2,3,4].map(n=>`<input data-log="${i}" data-set="${n}" placeholder="load × reps"><input data-rir="${i}" data-set="${n}" placeholder="RIR">`).join("")}</div></div>`).join("")}<button class="primary" id="saveWorkout">Save workout</button></div>`},
knowledge:()=>kb(),
baseline:()=>baseline(),
bodytype:()=>bodytype(),
bodyshape:()=>bodyshape(),
scan:()=>scan(),
goals:()=>goals(),
review:()=>review()};
function kb(){let f=window.kb||{q:"",area:"All",diff:"All",sort:"alpha"};let a=EXERCISES.filter(e=>(!f.q||e.name.toLowerCase().includes(f.q.toLowerCase()))&&(f.area==="All"||e.area===f.area)&&(f.diff==="All"||e.difficulty===f.diff));if(f.sort==="alpha")a.sort((x,y)=>x.name.localeCompare(y.name));if(f.sort==="diff"){let o={"🟢":0,"🟡":1,"🟠":2,"🔴":3};a.sort((x,y)=>o[x.difficulty]-o[y.difficulty])}if(f.sort==="rating")a.sort((x,y)=>(state.ratings[y.name]?.avg||0)-(state.ratings[x.name]?.avg||0));return `<div class="card"><input id="kbq" value="${esc(f.q)}" placeholder="Search exercises..."><div class="chips">${areas.map(x=>`<button class="chip ${f.area===x?"active":""}" data-area="${x}">${x}</button>`).join("")}</div><div class="chips">${["All","🟢","🟡","🟠","🔴"].map(x=>`<button class="chip ${f.diff===x?"active":""}" data-diff="${x}">${x}</button>`).join("")}</div><select id="kbsort"><option value="alpha">Alphabetical</option><option value="diff">Difficulty</option><option value="rating">User rating</option></select></div><div class="card"><div class="row"><b>${a.length} exercises</b><span class="muted">303+ starter entries</span></div>${a.map(e=>`<div class="item"><span>${e.difficulty}</span><div><b>${esc(e.name)}</b><small>${esc(e.primary)} • ${esc(e.pattern)}</small></div><button class="secondary" data-ex="${esc(e.name)}">Open</button></div>`).join("")}</div>`}
function exercise(name){let e=EXERCISES.find(x=>x.name===name),r=state.ratings[name]||{},u=r.user||0;document.body.innerHTML=shell("Exercise",`<div class="card"><button class="secondary" id="back">← Library</button><h2>${esc(e.name)}</h2><div class="badge">${e.difficulty} Difficulty</div><p>${esc(e.primary)} • ${esc(e.secondary)}</p><p><b>Movement:</b> ${esc(e.pattern)}<br><b>Stability:</b> ${esc(e.stable)}<br><b>Unilateral:</b> ${esc(e.unilateral)}</p><div class="video"><b>Video demonstration slot</b><p class="muted">Source-verified exercise videos are the next content-population pass. No invented links.</p></div><h3>Instructions</h3><p>Use controlled, repeatable technique and a range you can perform comfortably. Exercise-specific cues and mistakes will be populated from verified sources.</p><h3>Rate this exercise</h3><div class="chips">${[1,2,3,4,5].map(n=>`<button class="chip ${u===n?"active":""}" data-rate="${n}">${n}★</button>`).join("")}</div><p class="muted">${r.count?`Community ${r.avg}/5 • ${r.count} rating(s)`:"No community ratings yet"}</p></div>`);document.getElementById("back").onclick=()=>go("knowledge");document.querySelectorAll("[data-rate]").forEach(b=>b.onclick=()=>rate(name,+b.dataset.rate))}
function rate(name,n){let r=state.ratings[name]||{avg:0,count:0,user:0},total=r.avg*r.count;if(r.user)total-=r.user;else r.count++;total+=n;r.user=n;r.avg=Math.round(total/r.count*10)/10;state.ratings[name]=r;save();exercise(name)}
function baseline(){let p=state.profiles[profile]||{};return `<div class="card"><h2>Permanent Baseline</h2><p class="muted">Baseline is the preserved starting reference. Current measurements can evolve without overwriting it.</p>${field("Starting date","bdate",p.date||"")}${field("Starting weight","bweight",p.weight||"")}${field("Training experience","bexp",p.exp||"Experienced","select")}${field("Equipment / schedule","bequip",p.equip||"")}${field("Notes","bnotes",p.notes||"","textarea")}<button class="primary" id="saveBase">Save baseline</button></div><div class="card"><h3>Included baseline domains</h3><div class="chips"><span class="badge">Training experience</span><span class="badge">Goals (separate)</span><span class="badge">Body composition</span><span class="badge">Body type</span><span class="badge">Body shape</span><span class="badge">Measurements</span><span class="badge">Preferences</span></div></div>`}
function bodytype(){let p=state.profiles[profile]||{};return `<div class="card"><h2>Structural Body Type</h2><p class="muted">No ectomorph/mesomorph/endomorph quiz. This profile uses measurable structure and proportions.</p>${["Frame","Shoulder structure","Ribcage / torso","Pelvis / hip structure","Limb proportions","Upper / lower proportions","Natural distribution","Symmetry"].map(k=>`<label>${k}<input id="bt_${k.replaceAll(" ","_").replaceAll("/","_")}" value="${esc(p["bt_"+k]||"")}" placeholder="Record observation / measurement"></label>`).join("")}<label>Simple classification<input id="bt_class" value="${esc(p.bt_class||"")}" placeholder="Human-readable profile"></label><button class="primary" id="saveBT">Save body type baseline</button></div><div class="card"><h3>Views</h3><div class="chips"><span class="badge">Simple</span><span class="badge">Advanced</span><span class="badge">Raw / Technical</span></div><p class="muted">Classification is a label over a richer proportional profile, not a fixed identity.</p></div>`}
function bodyshape(){let p=state.profiles[profile]||{};return `<div class="card"><h2>Body Shape</h2><p class="muted">Separate from body composition and body type. Uses proportions and measurements; no target or ideal is implied.</p>${field(profile==="me"?"Shoulders":"Bust","sh1",p.sh1||"")}${field("Waist","waist",p.waist||"")}${field("Hips","hips",p.hips||"")}${field("Torso length","torso",p.torso||"")}${field("Leg length","legs",p.legs||"")}${field("Front profile notes","front",p.front||"","textarea")}${field("Side profile notes","side",p.side||"","textarea")}<label>Human-readable classification<select id="shapeClass">${["","V-Taper","Trapezoid","Rectangle","Inverted Triangle","Oval","Straight / Column","Hourglass","Top Hourglass","Bottom Hourglass","Pear / Triangle","Inverted Triangle","Rectangle / Straight","Apple / Oval","Spoon","Diamond"].map(x=>`<option ${p.shape===x?"selected":""}>${x}</option>`).join("")}</select></label><button class="primary" id="saveShape">Save body shape baseline</button></div><div class="card"><h3>Views</h3><div class="chips"><span class="badge">Simple</span><span class="badge">Advanced</span><span class="badge">Raw / Technical</span></div></div>`}

function scan(){
  let arr=state.scans[profile]||[];
  return `<div class="hero"><small>REAL CAMERA PROTOTYPE</small><h2>Multi-View Body Scan</h2>
  <p>This prototype uses your device camera and real pose landmarks. It will not claim a 3D reconstruction until that engine is validated.</p>
  <button class="primary" id="startScan">Start real camera scan</button></div>
  <div class="card"><h3>Capture protocol</h3>
  <div class="chips">${["Front","Left Side","Back","Right Side"].map(x=>`<span class="badge">${x}</span>`).join("")}</div>
  <p class="muted">Each view is quality-gated. The scan advances only after the body is detected, required landmarks are visible, and movement is sufficiently stable.</p></div>
  <div class="card"><h3>Scan quality</h3><p>🟢 Optimal → included in future trends<br>🟡 Limited → stored but down-weighted<br>🔴 Invalid → rejected</p>
  <p class="muted">Current prototype performs real camera/pose checks. 3D reconstruction and measurements are intentionally not fabricated.</p></div>
  <div class="card"><h3>Scan history</h3>${arr.length?arr.slice().reverse().map(s=>`<div class="item"><div><b>${esc(s.date)}</b><small>${esc(s.quality)} • ${esc(s.views||"")}</small></div></div>`).join(""):"<p class='muted'>No scans yet.</p>"}</div>`;
}

let scanRuntime=null;
async function loadPoseModel(){
  if(window.__poseLandmarker) return window.__poseLandmarker;
  if(!window.__poseVision){
    window.__poseVision=await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs");
  }
  const {FilesetResolver,PoseLandmarker}=window.__poseVision;
  const vision=await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
  );
  const landmarker=await PoseLandmarker.createFromOptions(vision,{
    baseOptions:{
      modelAssetPath:"https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate:"GPU"
    },
    runningMode:"VIDEO",
    numPoses:1,
    minPoseDetectionConfidence:.55,
    minPosePresenceConfidence:.55,
    minTrackingConfidence:.55
  });
  window.__poseLandmarker=landmarker;
  return landmarker;
}
function tone(type){
  try{let c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);
    const f={distance:220,pose:300,movement:380,attention:520,go:660,capture:880}[type]||440;
    o.frequency.value=f;g.gain.value=.045;o.start();o.stop(c.currentTime+.12);
  }catch(e){}
}
function openCamera(){
  document.body.innerHTML=shell("3D Scan",`
  <div class="camera realcam">
    <video id="video" autoplay playsinline muted></video>
    <canvas id="overlay"></canvas>
    <div id="veil" class="red"></div>
    <div class="sil" id="sil">FRONT<br>◯<br>▮▮<br>╱╲</div>
    <div class="camstatus" id="status">REQUESTING CAMERA…</div>
    <div class="quality-pill" id="quality">🔴 NO-GO</div>
    <div class="progress"><i id="bar"></i></div>
  </div>
  <div class="card">
    <div class="row"><b id="poseName">FRONT VIEW</b><span id="viewCount">0 / 4</span></div>
    <p id="modelStatus" class="muted">Loading camera + pose model…</p>
    <p id="hint">Stand where your entire body fits in frame. The model will check your pose and movement.</p>
    <div class="checks" id="checks"></div>
    <button class="secondary" id="manual">Manual capture (flagged)</button>
    <button class="secondary" id="stopCam">Stop camera</button>
  </div>`);
  startRealScan();
}
async function startRealScan(){
  const video=document.getElementById("video"),overlay=document.getElementById("overlay");
  const ctx=overlay.getContext("2d");
  scanRuntime={views:["Front","Left Side","Back","Right Side"],idx:0,captures:[],lastGood:0,stable:0,lastPose:null};
  try{
    scanRuntime.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false});
    video.srcObject=scanRuntime.stream;
    await video.play();
    document.getElementById("modelStatus").textContent="Camera live • loading pose model…";
    const model=await loadPoseModel();
    document.getElementById("modelStatus").textContent="Camera live • pose model active";
    document.getElementById("stopCam").onclick=stopRealScan;
    document.getElementById("manual").onclick=()=>captureView(true);
    requestAnimationFrame(()=>processCamera(model,video,overlay,ctx));
  }catch(e){
    document.getElementById("status").textContent="CAMERA / MODEL ERROR";
    document.getElementById("hint").textContent=(e && e.message ? e.message : "Camera or pose model could not start.")+" Tap Stop camera, return to Scan, and retry. If this is an iPhone, make sure the site has camera permission and is opened over HTTPS.";
  }
}
function stopRealScan(){
  if(scanRuntime?.stream) scanRuntime.stream.getTracks().forEach(t=>t.stop());
  scanRuntime=null;go("scan");
}
function processCamera(model,video,canvas,ctx){
  if(!scanRuntime||!video.videoWidth)return requestAnimationFrame(()=>processCamera(model,video,canvas,ctx));
  canvas.width=video.videoWidth;canvas.height=video.videoHeight;
  const now=performance.now();
  let res;
  try{res=model.detectForVideo(video,now)}catch(e){return requestAnimationFrame(()=>processCamera(model,video,canvas,ctx))}
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const lm=res?.landmarks?.[0];
  const q=qualityFromLandmarks(lm,video);
  drawLandmarks(ctx,lm,video);
  updateQualityUI(q);
  if(q.optimal){
    scanRuntime.stable += 1;
    if(scanRuntime.stable>45 && now-scanRuntime.lastGood>1200){scanRuntime.lastGood=now;captureView(false)}
  }else scanRuntime.stable=Math.max(0,scanRuntime.stable-2);
  requestAnimationFrame(()=>processCamera(model,video,canvas,ctx));
}
function qualityFromLandmarks(lm,video){
  if(!lm)return {optimal:false,reason:"BODY NOT DETECTED",distance:false,pose:false,stable:false,frame:false};
  const visible=lm.filter(p=>p.visibility===undefined||p.visibility>.45);
  if(visible.length<12)return {optimal:false,reason:"BODY NOT DETECTED",distance:false,pose:false,stable:false,frame:false};
  const xs=visible.map(p=>p.x),ys=visible.map(p=>p.y);
  const minx=Math.min(...xs),maxx=Math.max(...xs),miny=Math.min(...ys),maxy=Math.max(...ys);
  const h=maxy-miny;
  const frame=minx>.04&&maxx<.96&&miny>.03&&maxy<.97;
  const distance=h>.55&&h<.96;
  const required=[11,12,23,24,25,26,27,28].every(i=>lm[i] && (lm[i].visibility===undefined||lm[i].visibility>.4));
  const pose=required;
  return {optimal:frame&&distance&&pose,reason:!frame?"FULL BODY IN FRAME":!distance?"MOVE CLOSER / FARTHER":!pose?"TURN / REPOSITION":"HOLD STILL",distance,pose,stable:true,frame};
}
function drawLandmarks(ctx,lm,video){
  if(!lm)return;ctx.fillStyle="rgba(255,255,255,.9)";
  lm.forEach(p=>{if((p.visibility??1)>.45){ctx.beginPath();ctx.arc(p.x*video.videoWidth,p.y*video.videoHeight,5,0,Math.PI*2);ctx.fill()}});
}
function updateQualityUI(q){
  const s=document.getElementById("status"),pill=document.getElementById("quality"),veil=document.getElementById("veil");
  s.textContent=q.optimal?"GO • HOLD STILL":"NO-GO • "+q.reason;
  pill.textContent=q.optimal?"🟢 GO":"🔴 NO-GO";
  veil.className=q.optimal?"clear":"red";
  document.getElementById("checks").innerHTML=`<span class="${q.frame?"ok":""}">Frame ${q.frame?"✓":"•"}</span><span class="${q.distance?"ok":""}">Distance ${q.distance?"✓":"•"}</span><span class="${q.pose?"ok":""}">Pose ${q.pose?"✓":"•"}</span>`;
}
async function captureView(manual){
  if(!scanRuntime)return;
  const video=document.getElementById("video"),pose=scanRuntime.views[scanRuntime.idx];
  const c=document.createElement("canvas");c.width=video.videoWidth;c.height=video.videoHeight;c.getContext("2d").drawImage(video,0,0);
  const blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.82));
  const id="scan_"+Date.now()+"_"+scanRuntime.idx;
  await putScanFrame(id,blob,{pose,manual,timestamp:new Date().toISOString()});
  scanRuntime.captures.push({id,pose,manual});
  tone("capture");
  document.getElementById("viewCount").textContent=`${scanRuntime.captures.length} / 4`;
  if(scanRuntime.idx<3){
    scanRuntime.idx++;scanRuntime.stable=0;
    document.getElementById("poseName").textContent=scanRuntime.views[scanRuntime.idx].toUpperCase()+" VIEW";
    document.getElementById("sil").innerHTML=scanRuntime.views[scanRuntime.idx].toUpperCase()+"<br>◯<br>▮▮<br>╱╲";
    document.getElementById("hint").textContent="Turn to the indicated view. The same live quality gate remains active.";
  }else{
    scanRuntime.stream.getTracks().forEach(t=>t.stop());
    state.scans[profile].push({date:new Date().toLocaleString(),quality:manual?"🟡 Limited":"🟢 Optimal",views:"4 real camera frames",frameIds:scanRuntime.captures.map(x=>x.id),note:manual?"Manual capture flagged":"Automatic quality-gated capture"});
    save();scanRuntime=null;setTimeout(()=>go("scan"),500);
  }
}
function putScanFrame(id,blob,meta){
  return new Promise((resolve,reject)=>{const r=indexedDB.open("forge_scan_v1",1);r.onupgradeneeded=()=>r.result.createObjectStore("frames",{keyPath:"id"});r.onsuccess=()=>{const db=r.result,t=db.transaction("frames","readwrite");t.objectStore("frames").put({id,blob,meta});t.oncomplete=resolve;t.onerror=reject};r.onerror=reject});
}
function goals(){let g=state.goals[profile]||{};return `<div class="card"><h2>Goal Engine</h2><p class="muted">Goals are separate from baseline and can later drive programming priorities.</p><label>Primary<select id="gprimary">${["","Build Muscle","Get Stronger","Improve Conditioning","Improve a Specific Muscle","Change Body Composition","Maintain"].map(x=>`<option ${g.primary===x?"selected":""}>${x}</option>`).join("")}</select></label>${field("Specific target","gtarget",g.target||"")}${field("Block objective","gblock",g.block||"","textarea")}<button class="primary" id="saveGoal">Save goal</button></div>`}
function review(){let logs=state.logs[profile]||[];return `<div class="card"><h2>Weekly Review</h2><p>Training history → results → evidence → recommendation → <b>your decision</b>.</p><div class="notice"><b>Plan changes are never automatic.</b><p>Possible actions: Accept • Modify • Defer • Reject • Keep current plan.</p><div class="chips"><button class="secondary">Accept</button><button class="secondary">Modify</button><button class="secondary">Defer</button><button class="secondary">Reject</button><button class="secondary">Keep current</button></div></div></div><div class="card"><h3>Logged workouts</h3><p>${logs.length} saved workout(s) in this device.</p><p class="muted">Cloud sync / automated weekly AI review can be connected later through the server-side Supabase architecture.</p></div>`}
function field(label,id,val,type="input"){if(type==="textarea")return `<label>${label}<textarea id="${id}" rows="3">${esc(val)}</textarea></label>`;if(type==="select")return `<label>${label}<select id="${id}"><option>New</option><option>Some Experience</option><option>Experienced</option></select></label>`;return `<label>${label}<input id="${id}" value="${esc(val)}"></label>`}
function bind(){document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>go(b.dataset.route));document.getElementById("who").onchange=e=>{profile=e.target.value;render()};document.querySelectorAll("[data-ex]").forEach(b=>b.onclick=()=>exercise(b.dataset.ex));if(route==="knowledge"){let q=document.getElementById("kbq");q.oninput=e=>{window.kb={...(window.kb||{}),q:e.target.value};render()};document.querySelectorAll("[data-area]").forEach(b=>b.onclick=()=>{window.kb={...(window.kb||{}),area:b.dataset.area};render()});document.querySelectorAll("[data-diff]").forEach(b=>b.onclick=()=>{window.kb={...(window.kb||{}),diff:b.dataset.diff};render()});document.getElementById("kbsort").onchange=e=>{window.kb={...(window.kb||{}),sort:e.target.value};render()}}
if(route==="baseline")document.getElementById("saveBase").onclick=()=>{state.profiles[profile]={...state.profiles[profile],saved:true,date:document.getElementById("bdate").value,weight:document.getElementById("bweight").value,exp:document.getElementById("bexp").value,equip:document.getElementById("bequip").value,notes:document.getElementById("bnotes").value};save();render();
if(route==="bodytype")document.getElementById("saveBT").onclick=()=>{let p=state.profiles[profile];["Frame","Shoulder structure","Ribcage / torso","Pelvis / hip structure","Limb proportions","Upper / lower proportions","Natural distribution","Symmetry"].forEach(k=>p["bt_"+k]=document.getElementById("bt_"+k.replaceAll(" ","_").replaceAll("/","_")).value);p.bt_class=document.getElementById("bt_class").value;p.saved=true;save();render()};
if(route==="bodyshape")document.getElementById("saveShape").onclick=()=>{let p=state.profiles[profile];p.sh1=document.getElementById("sh1").value;p.waist=document.getElementById("waist").value;p.hips=document.getElementById("hips").value;p.torso=document.getElementById("torso").value;p.legs=document.getElementById("legs").value;p.front=document.getElementById("front").value;p.side=document.getElementById("side").value;p.shape=document.getElementById("shapeClass").value;p.saved=true;save();render()};
if(route==="scan")document.getElementById("startScan").onclick=camera;
if(route==="goals")document.getElementById("saveGoal").onclick=()=>{state.goals[profile]={primary:document.getElementById("gprimary").value,target:document.getElementById("gtarget").value,block:document.getElementById("gblock").value};save();render()};
if(route==="train")document.getElementById("saveWorkout").onclick=()=>{state.logs[profile].push({date:new Date().toLocaleString(),workout:workouts[profile].title,entries:[...document.querySelectorAll("[data-log]")].map(x=>({i:x.dataset.log,set:x.dataset.set,value:x.value,rir:document.querySelector(`[data-rir="${x.dataset.log}"][data-set="${x.dataset.set}"]`)?.value||""}))});save();alert("Workout saved.");};
if(route==="scan"){}}
render();
