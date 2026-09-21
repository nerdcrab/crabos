const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let topZ = 10;
const openApps = new Set(['about']);
const boot = $('#boot');

if (localStorage.getItem('crabos-skip-boot') === 'true') boot.classList.add('done');
else {
  setTimeout(() => $('#boot-status').textContent = 'mounting questionable filesystems...', 650);
  setTimeout(() => $('#boot-status').textContent = 'starting unnecessary services...', 1300);
  setTimeout(() => boot.classList.add('done'), 2200);
}

function focusWindow(win) {
  $$('.window').forEach(w => w.classList.remove('active'));
  win.classList.add('active'); win.style.zIndex = ++topZ;
  $$('.task-app').forEach(b => b.classList.toggle('active', b.dataset.task === win.dataset.app));
}
function openApp(name) {
  const win = $(`#window-${name}`); if (!win) return;
  win.classList.remove('hidden'); openApps.add(name); focusWindow(win); renderTasks();
  $('#start-menu').classList.add('hidden'); $('#start-button').classList.remove('open');
  if (name === 'terminal') setTimeout(() => $('#command').focus(), 50);
}
function closeApp(win) { win.classList.add('hidden'); openApps.delete(win.dataset.app); renderTasks(); }
function renderTasks() {
  const labels={about:'WELCOME',files:'FILES',terminal:'TERMINAL',browser:'WEB',notes:'NOTES',pincer:'PINCER',trash:'TRASH',settings:'SETTINGS'};
  $('#running-apps').innerHTML=[...openApps].map(n=>`<button class="task-app" data-task="${n}"><span>${labels[n]}</span></button>`).join('');
  $$('.task-app').forEach(b=>b.onclick=()=>{const w=$(`#window-${b.dataset.task}`);if(w.classList.contains('hidden'))openApp(b.dataset.task);else focusWindow(w)});
  const active=$('.window.active:not(.hidden)'); if(active) $(`.task-app[data-task="${active.dataset.app}"]`)?.classList.add('active');
}
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openApp(b.dataset.open)));
$$('[data-close]').forEach(b=>b.onclick=()=>closeApp(b.closest('.window')));
$$('[data-minimize]').forEach(b=>b.onclick=()=>{b.closest('.window').classList.add('hidden');renderTasks()});
$$('.window').forEach(w=>w.addEventListener('pointerdown',()=>focusWindow(w)));

// Pointer-based window dragging.
$$('.window__bar').forEach(bar => {
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || innerWidth < 700) return;
    const win=bar.closest('.window'), rect=win.getBoundingClientRect(), dx=e.clientX-rect.left, dy=e.clientY-rect.top;
    bar.setPointerCapture(e.pointerId); focusWindow(win);
    const move=ev=>{win.style.left=Math.max(0,Math.min(innerWidth-win.offsetWidth,ev.clientX-dx))+'px';win.style.top=Math.max(0,Math.min(innerHeight-70,ev.clientY-dy))+'px'};
    bar.addEventListener('pointermove',move); bar.addEventListener('pointerup',()=>bar.removeEventListener('pointermove',move),{once:true});
  });
});

$('#start-button').onclick=()=>{$('#start-menu').classList.toggle('hidden');$('#start-button').classList.toggle('open')};
$('#desktop').addEventListener('pointerdown',e=>{if(!e.target.closest('.start-menu,.start-button')){$('#start-menu').classList.add('hidden');$('#start-button').classList.remove('open')}});

function tick(){const d=new Date();$('#clock').innerHTML=`${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}<br><small>${d.toLocaleDateString([],{month:'2-digit',day:'2-digit',year:'2-digit'})}</small>`;const s=Math.floor((Date.now()-started)/1000);$('#uptime').textContent=new Date(s*1000).toISOString().slice(11,19)}
const started=Date.now();tick();setInterval(tick,1000);

const fileContent={
  readme:'<h3>README.txt</h3>Welcome to crabOS. Please remember: every feature is experimental, every bug is structural, and the crab is in charge.',
  classified:'<h3>ACCESS DENIED</h3>This file requires PINCER clearance level 7. Nice try, guest_crab.',
  todo:'<h3>todo.txt</h3>☑ Invent operating system<br>☑ Add crab<br>☐ Find responsible adult<br>☐ Fix everything else',
  crab:'<h3>definitely_not_a_crab.gif</h3><span style="font-size:30px">🦀</span><br>Metadata appears to be lying.'
};
$$('[data-file]').forEach(b=>b.onclick=()=>{ $('#file-preview').innerHTML=fileContent[b.dataset.file]; if(b.dataset.file==='crab')discover('cache','CRAB #02 — CACHE') });

const out=$('#terminal-output');
function line(html=''){const p=document.createElement('p');p.innerHTML=html;out.append(p);out.scrollTop=out.scrollHeight}
const commands={
  help:()=>'<b>COMMANDS</b>: help, ls, cat readme, whoami, status, date, crab, clear, exit, reboot',
  ls:()=>'README.txt&nbsp;&nbsp; classified.dat&nbsp;&nbsp; todo.txt&nbsp;&nbsp; definitely_not_a_crab.gif',
  'cat readme':()=>fileContent.readme.replace(/<[^>]+>/g,' '),
  whoami:()=>'guest_crab (clearance: suspiciously low)',status:()=>`KERNEL: STABLE-ISH<br>NETWORK: WET<br>SECRET PROCESSES: ${secrets.size}/3`,
  date:()=>new Date().toString(),crab:()=>{discover('daemon','CRAB #01 — DAEMON');return 'crab-daemon is already running on port 8080.'},
  clear:()=>{out.innerHTML='';return ''},exit:()=>{closeApp($('#window-terminal'));return ''},reboot:()=>{location.reload();return ''},sudo:()=>'guest_crab is not in the pincers file.'
};
$('#terminal-form').onsubmit=e=>{e.preventDefault();const v=$('#command').value.trim().toLowerCase();if(!v)return;line(`<b>guest@crabos:~$</b> ${v.replace(/[<>]/g,'')}`);line(commands[v]?commands[v]():'command not found; try <b>help</b>');$('#command').value=''};

const notes=$('#notes');notes.value=localStorage.getItem('crabos-notes')||notes.value;let saveTimer;notes.oninput=()=>{$('#save-status').textContent='SAVING...';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{localStorage.setItem('crabos-notes',notes.value);$('#save-status').textContent='SAVED'},400)};
let pinches=Number(localStorage.getItem('crabos-pinches')||0);function updatePinches(){$('#pinches').textContent=pinches;$('#rank').textContent=pinches<10?'SOFT SHELL':pinches<30?'CLAW OPERATOR':pinches<75?'PINCER ENGINEER':'CRAB SUPREME'}updatePinches();
$('#big-crab').onclick=()=>{pinches++;localStorage.setItem('crabos-pinches',pinches);updatePinches();if(pinches===25)discover('clicker','CRAB #03 — CLICKER')};

const secrets=new Set(JSON.parse(localStorage.getItem('crabos-secrets')||'[]'));
function updateSecrets(){$('#secret-count').textContent=`${secrets.size}/3`}
function discover(id,name){if(secrets.has(id))return;secrets.add(id);localStorage.setItem('crabos-secrets',JSON.stringify([...secrets]));updateSecrets();$('#secret-name').textContent=name;$('#discovery').classList.add('show');setTimeout(()=>$('#discovery').classList.remove('show'),3300)}updateSecrets();
$('#inspect-trash').onclick=()=>{let n=Number($('#inspect-trash').dataset.clicks||0)+1;$('#inspect-trash').dataset.clicks=n;$('#inspect-trash').textContent=n<5?`NOTHING HERE (${n}/5)`:'FOUND SOMETHING';if(n===5)discover('cache','CRAB #02 — CACHE')};
$('#secret-counter').onclick=()=>line('Hint: one crab speaks shell, one hides in a file, and one respects persistence.');

$('#shutdown').onclick=()=>{boot.classList.remove('done');$('#boot-status').textContent='it is now safe to turn off your browser';$('.boot__bar i').style.animation='none'};
renderTasks();

// CrabScape browser — Scramjet v2 through proxy-bootstrap.
let proxyController, proxyFrame;
function normalizeUrl(value) {
  const input=value.trim();
  if (!input) return '';
  try { return new URL(input).toString(); } catch {}
  try { if (input.includes('.')) return new URL(`https://${input}`).toString(); } catch {}
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}
async function initProxy() {
  if (proxyFrame) return proxyFrame;
  const status=$('#browser-status');
  if (typeof initBootstrap !== 'function') throw new Error('Scramjet server runtime is unavailable. Run this build with npm start.');
  status.innerHTML='<span class="online-dot"></span> STARTING SCRAMJET V2...';
  proxyController=await initBootstrap();
  proxyFrame=proxyController.createFrame($('#browser-frame'));
  status.innerHTML='<span class="online-dot"></span> SCRAMJET V2 // SECURE TRANSPORT ONLINE';
  return proxyFrame;
}
async function browse(value) {
  const url=normalizeUrl(value); if(!url)return;
  const status=$('#browser-status');
  try { const frame=await initProxy(); $('#browser-address').value=url; $('.browser-app').classList.add('browsing'); status.textContent='LOADING // '+url; frame.go(url); $('#browser-frame').addEventListener('load',()=>status.innerHTML='<span class="online-dot"></span> CONNECTED',{once:true}); }
  catch(err){ status.textContent='PROXY ERROR // '+err.message; $('.browser-app').classList.remove('browsing'); }
}
$('#browser-form').onsubmit=e=>{e.preventDefault();browse($('#browser-address').value)};
$('#browser-search').onsubmit=e=>{e.preventDefault();browse($('input',e.currentTarget).value)};
$$('[data-url]').forEach(b=>b.onclick=()=>browse(b.dataset.url));
$('#browser-back').onclick=()=>proxyFrame?.back();
$('#browser-forward').onclick=()=>proxyFrame?.forward();
$('#browser-reload').onclick=()=>proxyFrame?.reload();
$('#browser-home').onclick=()=>{$('.browser-app').classList.remove('browsing');$('#browser-address').value='';$('#browser-status').innerHTML='<span class="online-dot"></span> SCRAMJET V2 // READY'};

// Persistent appearance settings.
const prefs=JSON.parse(localStorage.getItem('crabos-prefs')||'{}');
function savePrefs(){localStorage.setItem('crabos-prefs',JSON.stringify(prefs))}
function setAccent(color){document.documentElement.style.setProperty('--green',color);prefs.accent=color;$('#custom-color').value=color;$$('.color-swatch').forEach(s=>s.classList.toggle('selected',s.dataset.color.toLowerCase()===color.toLowerCase()));savePrefs()}
$$('.color-swatch').forEach(s=>s.onclick=()=>setAccent(s.dataset.color));
$('#custom-color').oninput=e=>setAccent(e.target.value);
if(prefs.accent)setAccent(prefs.accent);
function setToggle(id,key,apply){const el=$(id);el.checked=Boolean(prefs[key]);apply(el.checked);el.onchange=e=>{prefs[key]=e.target.checked;apply(e.target.checked);savePrefs()}}
setToggle('#motion-toggle','reduceMotion',v=>document.body.classList.toggle('reduce-motion',v));
setToggle('#boot-toggle','skipBoot',v=>localStorage.setItem('crabos-skip-boot',String(v)));
$('#scan-toggle').checked=prefs.scanlines!==false;$('#scanlines').classList.toggle('off',prefs.scanlines===false);$('#scan-toggle').onchange=e=>{prefs.scanlines=e.target.checked;$('#scanlines').classList.toggle('off',!e.target.checked);savePrefs()};
$('#glow-toggle').checked=prefs.glow!==false;$('#glow').classList.toggle('off',prefs.glow===false);$('#glow-toggle').onchange=e=>{prefs.glow=e.target.checked;$('#glow').classList.toggle('off',!e.target.checked);savePrefs()};

const wallpaperDb=new Promise((resolve,reject)=>{const req=indexedDB.open('crabos-customization',1);req.onupgradeneeded=()=>req.result.createObjectStore('assets');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
async function storeWallpaper(blob){const db=await wallpaperDb;const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put(blob,'wallpaper');return new Promise(r=>tx.oncomplete=r)}
async function getWallpaper(){const db=await wallpaperDb;const req=db.transaction('assets').objectStore('assets').get('wallpaper');return new Promise(r=>{req.onsuccess=()=>r(req.result);req.onerror=()=>r(null)})}
async function clearWallpaper(){const db=await wallpaperDb;const tx=db.transaction('assets','readwrite');tx.objectStore('assets').delete('wallpaper');return new Promise(r=>tx.oncomplete=r)}
let wallpaperUrl;
function applyWallpaper(blob){if(wallpaperUrl)URL.revokeObjectURL(wallpaperUrl);const desk=$('#desktop');desk.classList.remove('wallpaper-cover','wallpaper-contain','wallpaper-center','wallpaper-repeat');if(!blob){desk.classList.remove('has-wallpaper');desk.style.removeProperty('--wallpaper');return}wallpaperUrl=URL.createObjectURL(blob);desk.style.setProperty('--wallpaper',`url("${wallpaperUrl}")`);desk.classList.add('has-wallpaper','wallpaper-'+(prefs.wallpaperFit||'cover'))}
$('#wallpaper-input').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>15*1024*1024){alert('Wallpaper must be under 15 MB.');return}await storeWallpaper(file);applyWallpaper(file)};
$('#clear-wallpaper').onclick=async()=>{await clearWallpaper();applyWallpaper(null);$('#wallpaper-input').value=''};
$('#wallpaper-fit').value=prefs.wallpaperFit||'cover';$('#wallpaper-fit').onchange=async e=>{prefs.wallpaperFit=e.target.value;savePrefs();applyWallpaper(await getWallpaper())};
getWallpaper().then(applyWallpaper);
