/* ===== PRISMA v3 — SPA funcional con persistencia local ===== */
const CFG = { brand:"PRISMA" };

const $ = (q, el=document)=>el.querySelector(q);
const $$ = (q, el=document)=>[...el.querySelectorAll(q)];
const toast=(msg,type='ok')=>{ const t=document.createElement('div'); t.className='toast '+type; t.textContent=msg; $('#toasts')?.appendChild(t); setTimeout(()=>t.remove(),3600); };

// Splash + Tema
window.addEventListener('load',()=> setTimeout(()=>$('#splash')?.remove(), 900));
(function(){ const t=localStorage.getItem('theme')||'dark'; document.documentElement.dataset.theme=t; $('#btnTheme')?.addEventListener('click',()=>{const n=document.documentElement.dataset.theme==='dark'?'light':'dark'; document.documentElement.dataset.theme=n; localStorage.setItem('theme',n); $('#btnTheme').textContent=n==='dark'?'🌞':'🌙';}); $('#btnTheme')&&($('#btnTheme').textContent=t==='dark'?'🌞':'🌙'); })();
$('#btnMenu')?.addEventListener('click', ()=> $('#drawer')?.classList.toggle('open'));

// Idiomas
const dict={ es:{login:"Ingresar","nav.dashboard":"Dashboard","nav.forms":"Formularios","nav.worker":"Trabajador","nav.training":"Capacitación","nav.sensors":"Sensores","nav.reports":"Reportes","nav.messages":"Mensajes","nav.map":"Mapa","nav.gamification":"Gamificación","nav.settings":"Ajustes",
"kpis.title":"Indicadores clave (demo)","kpis.incidents":"Incidentes hoy","kpis.compliance":"% Cumplimiento","kpis.training":"Capacitaciones",
"quick.title":"Funciones rápidas","quick.panic":"Botón de pánico (GPS)","quick.training":"Microcursos con voz IA","quick.sensors":"Sensores en tiempo real","quick.audit":"Auditoría ISO automática",
"modules.title":"Módulos","modules.dash":"Riesgos, KPI y actividad.","modules.worker":"Check-in, EPP y QR por tarea.","modules.training":"Microcursos, voz y evaluación.","modules.sensors":"Lecturas, umbrales y alertas.","modules.reports":"Incidentes y auditoría ISO.",
"cta.open":"Abrir Dashboard","cta.login":"Ingresar","cta.title":"Listo para empezar","cta.subtitle":"Crea tu cuenta o ingresa para gestionar tu operación con PRISMA.","cta.login2":"Ingresar","cta.explore":"Explorar dashboard"},
en:{login:"Sign in","nav.dashboard":"Dashboard","nav.forms":"Forms","nav.worker":"Worker","nav.training":"Training","nav.sensors":"Sensors","nav.reports":"Reports","nav.messages":"Messages","nav.map":"Map","nav.gamification":"Gamification","nav.settings":"Settings",
"kpis.title":"Key metrics (demo)","kpis.incidents":"Incidents today","kpis.compliance":"% Compliance","kpis.training":"Trainings",
"quick.title":"Quick actions","quick.panic":"Panic button (GPS)","quick.training":"AI voice micro-courses","quick.sensors":"Real-time sensors","quick.audit":"Automated ISO audit",
"modules.title":"Modules","modules.dash":"Risks, KPIs & activity.","modules.worker":"Check-in, PPE & task QR.","modules.training":"Micro-courses, voice & quiz.","modules.sensors":"Readings, thresholds & alerts.","modules.reports":"Incidents & ISO audits.",
"cta.open":"Open Dashboard","cta.login":"Sign in","cta.title":"Ready to start","cta.subtitle":"Create an account or sign in to run your operation with PRISMA.","cta.login2":"Sign in","cta.explore":"Explore dashboard"}};
function setLang(l){ localStorage.setItem('lang',l); $('#btnLang')&&($('#btnLang').textContent=l.toUpperCase()); $$('[data-i18n]').forEach(el=>{ const k=el.dataset.i18n; if(dict[l]&&dict[l][k]) el.textContent=dict[l][k]; }); }
setLang(localStorage.getItem('lang')||'es'); $('#btnLang')?.addEventListener('click',()=> setLang(($('#btnLang').textContent.trim()||'ES')==='ES'?'en':'es'));

// ===== Data layer (LocalStorage persistente) =====
const DBKEY='prisma.v1';
const db = {
  _load(){ try{return JSON.parse(localStorage.getItem(DBKEY))||{users:[],session:null,checks:[],incidentes:[],sensores:[],mensajes:[]};}catch{return {users:[],session:null,checks:[],incidentes:[],sensores:[],mensajes:[]};} },
  _save(d){ localStorage.setItem(DBKEY, JSON.stringify(d)); },
  get(){ return this._load(); },
  set(patch){ const d=this._load(); Object.assign(d,patch); this._save(d); },
  push(key, val){ const d=this._load(); d[key].unshift(val); this._save(d); },
  where(key, fn){ return this._load()[key].filter(fn); },
  clear(){ localStorage.removeItem(DBKEY); }
};

// ===== Guardia de sesión (redirección si no estás autenticado) =====
const PUBLIC=['','/','index.html','auth.html'];
const path = location.pathname.split('/').pop().toLowerCase();
const session = db.get().session;
if (!PUBLIC.includes(path) && !session) { location.href='auth.html'; }

// Router
if (path==='dashboard.html') renderDashboard();
if (path==='formularios.html') renderForms();
if (path==='trabajador.html') renderWorker();
if (path==='entrenamiento.html') renderTraining();
if (path==='sensores.html') renderSensors();
if (path==='reportes.html') renderReports();
if (path==='mapa.html') renderMap();
if (path==='gamificacion.html') renderGamification();
if (path==='mensajes.html') renderMessages();
if (path==='ajustes.html') renderSettings();
if (path==='auth.html') renderAuth();

function wrap(html){ $('#app')?.innerHTML=html; }

/* ===== Dashboard ===== */
function renderDashboard(){
  wrap(`<section class="grid cols-2">
    <div class="card">
      <h2>Dashboard</h2>
      <div class="row">
        <div class="chip">Incidentes: <b id="kpiInc">0</b></div>
        <div class="chip">Checklists: <b id="kpiChk">0</b></div>
        <div class="chip">Capacitaciones: <b id="kpiCap">0</b></div>
      </div>
      <div class="sep"></div>
      <canvas id="spark" height="80"></canvas>
    </div>
    <div class="card"><h3>Atajos</h3>
      <div class="row">
        <a class="btn" href="formularios.html">Permisos/Checklists</a>
        <a class="btn" href="reportes.html">Incidentes & Reportes</a>
        <a class="btn" href="mapa.html">Mapa de riesgos</a>
      </div>
    </div>
  </section>`);
  const d=db.get(); $('#kpiInc').textContent=d.incidentes.length; $('#kpiChk').textContent=d.checks.length;
  const c=$('#spark'); const ctx=c.getContext('2d'); c.width=c.clientWidth; const h=c.height;
  const pts=Array.from({length:30},(_,i)=> 30+Math.sin(i*.45)*20 + (Math.random()*10));
  ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--brand'); ctx.lineWidth=2; ctx.beginPath();
  pts.forEach((v,i)=>{ const x=i/(pts.length-1)*c.width; const y=h-(v/60)*h; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}); ctx.stroke();
}

/* ===== Formularios (checklists) ===== */
function renderForms(){
  wrap(`<section class="grid">
    <div class="card">
      <h2>Formularios</h2>
      <ul>
        <li><a href="#" data-form="stop">Auditoría STOP</a></li>
        <li><a href="#" data-form="epp">Checklist EPP</a></li>
        <li><a href="#" data-form="extintor">Control de Extintores</a></li>
      </ul>
    </div>
    <div class="card" id="formHost"><em class="muted">Selecciona un formulario</em></div>
  </section>`);
  $$('#app [data-form]').forEach(a=>a.onclick=(e)=>{ e.preventDefault(); loadForm(a.dataset.form); });
}
function loadForm(id){
  const defs={ stop:{title:'Auditoría STOP', items:['Orden y limpieza','Señalización','Riesgos críticos']},
               epp:{title:'Checklist EPP', items:['Casco','Guantes','Botas','Lentes']},
               extintor:{title:'Control de Extintores', items:['Manómetro OK','Sello intacto','Fecha vigente']} };
  const f=defs[id]; if(!f) return;
  $('#formHost').innerHTML = `
    <h3>${f.title}</h3>
    <form class="grid">
      ${f.items.map(x=>`<label class="row"><input type="checkbox" name="it"> ${x}</label>`).join('')}
      <textarea name="obs" placeholder="Observaciones"></textarea>
      <div class="row">
        <button class="btn primary" type="submit">Guardar</button>
        <button class="btn outline" type="button" id="btnPrint">PDF</button>
        <button class="btn outline" type="button" data-csv>CSV</button>
      </div>
    </form>`;
  $('#formHost form').onsubmit=(e)=>{
    e.preventDefault();
    const items=[...$$('input[name="it"]')].map((x,i)=>({item:i+1, ok:x.checked}));
    const rec={ id:Date.now(), tipo:f.title, items, obs:$('textarea[name="obs"]').value, ts:new Date().toISOString() };
    db.push('checks', rec); toast('Checklist guardado','ok');
  };
  $('#btnPrint').onclick=()=>window.print();
  $$('[data-csv]').forEach(btn=>btn.onclick=()=>{
    const rows=[...$$('label')].map(l=>`"${l.textContent.trim()}","${l.querySelector('input').checked}"`).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows],{type:'text/csv'})); a.download='formulario.csv'; a.click();
  });
}

/* ===== Trabajador (check-in + QR) ===== */
function renderWorker(){
  wrap(`<section class="grid cols-2">
    <div class="card">
      <h2>Check-in del trabajador</h2>
      <div class="grid">
        <input name="nombre" placeholder="Nombre">
        <select name="rol"><option>Operario</option><option>Supervisor</option><option>Contratista</option></select>
        <label>Fatiga (0–10) <input id="fatiga" type="range" min="0" max="10" value="2"></label>
        <div class="row">
          <label><input type="checkbox"> Casco</label>
          <label><input type="checkbox"> Guantes</label>
          <label><input type="checkbox"> Botas</label>
          <label><input type="checkbox"> Lentes</label>
        </div>
        <select name="tarea"><option>Altura</option><option>Espacio confinado</option><option>Eléctrico</option></select>
        <div class="row">
          <button class="btn primary" id="btnReg">Registrar</button>
          <button class="btn outline" id="btnQR">Generar QR</button>
          <button class="btn outline" id="btnCSV">CSV</button>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>Últimos registros</h3>
      <table class="table" id="tblReg"><thead><tr><th>Fecha</th><th>Nombre</th><th>Rol</th><th>EPP</th><th>Fatiga</th><th>Tarea</th></tr></thead><tbody></tbody></table>
    </div>
  </section>
  <div id="qrModal" class="card" style="position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.55)">
    <div class="card" style="padding:16px;border-radius:14px">
      <canvas id="qrCanvas" width="240" height="240"></canvas>
      <div class="row" style="margin-top:10px">
        <button class="btn outline" onclick="document.getElementById('qrModal').style.display='none'">Cerrar</button>
        <a id="qrDown" class="btn primary" download="qr-trabajo.png">Descargar</a>
      </div>
    </div>
  </div>`);
  const tbody=$('#tblReg tbody');
  $('#btnReg').onclick=()=>{
    const nombre=$('[name="nombre"]').value||'—', rol=$('[name="rol"]').value, fat=$('#fatiga').value, tarea=$('[name="tarea"]').value;
    const epp=[...$$('input[type="checkbox"]')].filter(x=>x.checked).length;
    const row=`<tr><td>${new Date().toISOString().slice(0,10)}</td><td>${nombre}</td><td>${rol}</td><td>${epp}</td><td>${fat}</td><td>${tarea}</td></tr>`;
    tbody.insertAdjacentHTML('afterbegin',row); toast('Check-in guardado','ok');
  };
  $('#btnCSV').onclick=()=>{ const rows=[...$('#tblReg').rows].map(r=>[...r.cells].map(td=>`"${td.textContent}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows],{type:'text/csv'})); a.download='registros.csv'; a.click(); };
  $('#btnQR').onclick=()=>{ const payload=JSON.stringify({app:"PRISMA",tarea:$('[name="tarea"]').value,ts:Date.now()}); qrEncode(payload,$('#qrCanvas')); $('#qrDown').href=$('#qrCanvas').toDataURL(); $('#qrModal').style.display='grid'; };
}
function qrEncode(text,canvas){ const size=29,s=canvas.width/size,ctx=canvas.getContext('2d'); const enc=new TextEncoder().encode(text);
  ctx.fillStyle="#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle="#111";
  crypto.subtle.digest('SHA-256', enc).then(buf=>{ const arr=[...new Uint8Array(buf)]; let k=0;
    for(let y=0;y<size;y++) for(let x=0;x<size;x++){ if(x<2||y<2||x>size-3||y>size-3){ctx.fillRect(x*s,y*s,s,s);continue;}
      if(((arr[k%arr.length]>>(x*y%8))&1)===1) ctx.fillRect(x*s,y*s,s,s); k++; }
  }); }

/* ===== Entrenamiento ===== */
function renderTraining(){
  wrap(`<section class="grid cols-2">
    <div class="card">
      <h2>Capacitación</h2>
      <textarea id="curso" rows="6">Tema: Uso correcto de EPP.
1. Verificar estado antes de usar.
2. Ajuste del casco y barbijo.
3. Señales de reemplazo de guantes.</textarea>
      <div class="row"><button class="btn" id="leer">Leer con voz</button><button class="btn outline" id="aiSlides">Guion tipo cómic</button></div>
      <div id="slides" class="grid" style="margin-top:10px"></div>
    </div>
    <div class="card">
      <h3>Evaluación rápida</h3>
      <label>¿Cuándo reemplazar guantes?</label>
      <select id="q1"><option>Cuando estén dañados o sucios</option><option>Una vez al año</option></select>
      <button class="btn primary" id="eval">Enviar</button>
    </div>
  </section>`);
  $('#leer').onclick=()=> speechSynthesis.speak(new SpeechSynthesisUtterance($('#curso').value));
  $('#eval').onclick=()=> toast('¡Correcto!','ok');
  $('#aiSlides').onclick=()=>{ const el=$('#slides'); el.innerHTML=''; $('#curso').value.split(/\n\d+\. /).slice(1).forEach((b,i)=> el.insertAdjacentHTML('beforeend', `<div class="card"><b>Viñeta ${i+1}</b><p>${b}</p></div>`)); };
}

/* ===== Sensores ===== */
function renderSensors(){
  wrap(`<section class="grid cols-2">
    <div class="card">
      <h2>Agregar sensor</h2>
      <input id="tipo" placeholder="CO₂ / Temp / Ruido">
      <input id="unidad" placeholder="ppm / °C / dB">
      <input id="min" placeholder="Mín">
      <input id="max" placeholder="Máx">
      <div class="row"><button class="btn primary" id="addS">Añadir</button><button class="btn outline" id="csvS">CSV</button></div>
    </div>
    <div class="card">
      <h3>Lecturas</h3>
      <table class="table" id="tblS"><thead><tr><th>Tipo</th><th>Lectura</th><th>Estado</th></tr></thead><tbody></tbody></table>
    </div>
  </section>`);
  const tbody=$('#tblS tbody');
  function addReading(tipo,unidad,min,max){ const v=(min+max)/2+(Math.random()-.5)*(max-min)*.6; const ok=v>=min&&v<=max; tbody.insertAdjacentHTML('afterbegin', `<tr><td>${tipo} (${unidad})</td><td>${v.toFixed(1)}</td><td>${ok?'OK':'ALERTA'}</td></tr>`); if(!ok) toast(`${tipo}: fuera de rango`,'warn'); }
  $('#addS').onclick=()=> addReading($('#tipo').value||'CO₂',$('#unidad').value||'ppm',+($('#min').value||350),+($('#max').value||1500));
  addReading('CO₂','ppm',350,1500); addReading('Temp','°C',10,45); addReading('Ruido','dB',40,85);
  $('#csvS').onclick=()=>{ const rows=[...$('#tblS').rows].map(r=>[...r.cells].map(td=>`"${td.textContent}"`).join(',')).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows],{type:'text/csv'})); a.download='sensores.csv'; a.click(); };
}

/* ===== Reportes (Incidentes + export) ===== */
function renderReports(){
  wrap(`<section class="grid cols-2">
    <div class="card">
      <h2>Nuevo incidente</h2>
      <input id="tipo" placeholder="Tipo (lesión, daño, cuasi-accidente)">
      <textarea id="desc" placeholder="Descripción"></textarea>
      <input id="foto" type="file" accept="image/*" />
      <div class="row"><button class="btn" id="gps">Adjuntar ubicación</button><span class="muted" id="gpsTxt">—</span></div>
      <div class="row"><button class="btn primary" id="save">Guardar</button></div>
    </div>
    <div class="card">
      <h3>Incidentes</h3>
      <div class="row"><button class="btn outline" id="csvR">CSV</button><a class="btn" href="mapa.html">Ver en mapa</a></div>
      <table class="table" id="tblR"><thead><tr><th>Fecha</th><th>Tipo</th><th>Ubicación</th><th>Evidencia</th></tr></thead><tbody></tbody></table>
    </div>
  </section>`);
  const tbody=$('#tblR tbody');
  function paint(){ tbody.innerHTML=''; db.get().incidentes.forEach(i=> tbody.insertAdjacentHTML('beforeend', `<tr><td>${i.fecha}</td><td>${i.tipo}</td><td>${i.lat?`${i.lat.toFixed(4)}, ${i.lng.toFixed(4)}`:'—'}</td><td>${i.img?'📎':'—'}</td></tr>`)); }
  paint();
  let coords=null, imgb64=null;
  $('#gps').onclick=async()=>{ try{ const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:6000})); coords={lat:pos.coords.latitude,lng:pos.coords.longitude}; $('#gpsTxt').textContent=`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`; toast('Ubicación añadida','ok'); }catch{ toast('GPS no disponible','warn'); } };
  $('#foto').onchange=()=>{ const f=$('#foto').files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{imgb64=r.result; toast('Foto cargada','ok')}; r.readAsDataURL(f); };
  $('#save').onclick=()=>{ const rec={id:Date.now(), fecha:new Date().toISOString().slice(0,10), tipo:$('#tipo').value||'Incidente', desc:$('#desc').value||'', ...coords, img:imgb64}; db.push('incidentes', rec); paint(); toast('Incidente guardado','ok'); };
  $('#csvR').onclick=()=>{ const rows=[['fecha','tipo','lat','lng'].join(',')].concat(db.get().incidentes.map(i=>[i.fecha,i.tipo,i.lat||'',i.lng||''].map(x=>`"${x}"`).join(','))).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([rows],{type:'text/csv'})); a.download='incidentes.csv'; a.click(); };
}

/* ===== Mapa ===== */
function renderMap(){
  wrap(`<section class="grid"><div class="card"><h2>Mapa de riesgos</h2><div id="map" style="width:100%;height:420px;border-radius:12px;overflow:hidden"></div><p class="muted" id="mapNote">Usa Leaflet si hay internet; si no, render básico.</p></div></section>`);
  const points=db.get().incidentes.filter(x=>x.lat&&x.lng);
  if (window.L){ // Leaflet disponible (ver mapa.html)
    const m = L.map('map').setView(points[0]?[points[0].lat,points[0].lng]:[-38.95,-68.06], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OSM'}).addTo(m);
    points.forEach(p=> L.marker([p.lat,p.lng]).addTo(m).bindPopup(`<b>${p.tipo}</b><br>${p.fecha}`));
    $('#mapNote').textContent='Leaflet activo';
  } else {
    const c=document.createElement('canvas'); c.width=$('#map').clientWidth; c.height=$('#map').clientHeight; $('#map').appendChild(c);
    const g=c.getContext('2d'); g.fillStyle='#0f251b'; g.fillRect(0,0,c.width,c.height);
    points.forEach((_,i)=>{ g.fillStyle=['#19c37d','#f5a524','#ff4d4f'][i%3]; g.beginPath(); g.arc(60+120*i, 220, 10, 0, 7); g.fill(); });
    $('#mapNote').textContent='Leaflet no disponible (offline).';
  }
}

/* ===== Mensajes ===== */
function renderMessages(){
  wrap(`<section class="grid">
    <div class="card"><h2>Mensajes</h2>
      <div class="row"><input id="msg" placeholder="Mensaje a equipo..."><button class="btn primary" id="send">Enviar</button></div>
      <ul id="list" style="margin:8px 0 0 0; padding-left:18px"></ul>
    </div>
  </section>`);
  const list=$('#list'); db.get().mensajes.forEach(m=> list.insertAdjacentHTML('afterbegin', `<li>${m}</li>`));
  $('#send').onclick=()=>{ const v=$('#msg').value.trim(); if(!v) return; db.push('mensajes', v); list.insertAdjacentHTML('afterbegin', `<li>${v}</li>`); $('#msg').value=''; };
}

/* ===== Ajustes ===== */
function renderSettings(){
  wrap(`<section class="grid">
    <div class="card"><h2>Ajustes</h2>
      <div class="row"><button class="btn" id="sync">Sincronizar (demo)</button><button class="btn outline" id="clr">Borrar datos locales</button></div>
      <pre class="muted" id="dbg"></pre>
    </div>
  </section>`);
  $('#dbg').textContent = JSON.stringify(db.get(),null,2);
  $('#clr').onclick=()=>{ db.clear(); toast('LocalStorage limpiado','ok'); location.reload(); };
  $('#sync').onclick=()=> toast('Placeholder de sync','warn');
}

/* ===== Auth (login + registro local) ===== */
function renderAuth(){
  wrap(`<section class="grid cols-2">
    <div class="card">
      <h2>Ingresar</h2>
      <input id="lemail" type="email" placeholder="Email">
      <input id="lpass" type="password" placeholder="Contraseña">
      <button id="doLogin" class="btn primary">Iniciar sesión</button>
    </div>
    <div class="card">
      <h2>Crear cuenta</h2>
      <input id="remail" type="email" placeholder="Email">
      <input id="rpass" type="password" placeholder="Contraseña">
      <button id="doReg" class="btn">Registrarme</button>
    </div>
  </section>`);
  $('#doReg').onclick=()=>{ const d=db.get(); const email=$('#remail').value.trim(), pass=$('#rpass').value.trim();
    if(!email||!pass) return toast('Completa email y contraseña','warn');
    if(d.users.find(u=>u.email===email)) return toast('Ya existe ese usuario','err');
    d.users.push({email,pass}); db.set(d); toast('Usuario creado','ok');
  };
  $('#doLogin').onclick=()=>{ const d=db.get(); const email=$('#lemail').value.trim(), pass=$('#lpass').value.trim();
    const u=d.users.find(u=>u.email===email && u.pass===pass) || (email==='demo@prisma'&&pass==='demo'&&{email});
    if(!u) return toast('Credenciales inválidas','err'); d.session={email:u.email, ts:Date.now()}; db.set(d); toast('Sesión iniciada','ok'); location.href='dashboard.html';
  };
}

// SOS
$('#panic')?.addEventListener('click', async ()=>{ try{ navigator.vibrate?.(180); const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000})); toast(`SOS · ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,'err'); }catch{ toast('GPS no disponible','warn'); } });
