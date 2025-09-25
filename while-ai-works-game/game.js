
/* While AI works — mini game
   9 cells; tap good flower +1, tap bad -1 (not below 0).
   Random single spawn, quick but tappable.
   Vibration on bad where supported.
   Safari-ready: all logic pure JS/DOM, no Audio auto-play.
*/

const ASSETS = {
  good: 'assets/flower_good.png',
  bad: 'assets/flower_bad.png',
};

const board = document.querySelector('.board');
const cells = Array.from(document.querySelectorAll('.cell'));
const fxLayer = document.getElementById('fxLayer');
const scoreEl = document.getElementById('scoreValue');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let score = 0;
let spawnTimer = null;
let alive = false;
let activeIndex = -1;
let activeKind = null; // 'good' | 'bad'
let lockTap = false;

// Helpers
function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function sample(arr){ return arr[rand(0, arr.length-1)]; }
function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); }

function vibrateBad(){
  // On Android Chrome this works; iOS Safari usually ignores (no Web Vibration API).
  if ('vibrate' in navigator) {
    try { navigator.vibrate(50); } catch (e) {}
  }
}

function clearActive(){
  if (activeIndex >= 0){
    const cell = cells[activeIndex];
    cell.innerHTML = '';
    activeIndex = -1;
    activeKind = null;
    lockTap = false;
  }
}

function spawn(){
  clearActive();
  const idx = rand(0, cells.length-1);
  activeIndex = idx;

  // 75% chance good, 25% bad
  const kind = Math.random() < 0.75 ? 'good' : 'bad';
  activeKind = kind;

  const sprite = document.createElement('div');
  sprite.className = 'sprite' + (kind === 'bad' ? ' bad' : '');
  sprite.style.backgroundImage = `url(${ASSETS[kind]})`;
  sprite.setAttribute('aria-hidden', 'true');
  cells[idx].appendChild(sprite);

  // Lifetime ~900ms ± random jitter
  const lifetime = 900 + rand(-120, 160);
  setTimeout(() => {
    if (activeIndex === idx){ clearActive(); }
  }, lifetime);
}

function startGame(){
  if (alive) return;
  alive = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  score = 0; scoreEl.textContent = String(score);
  spawn();
  // Spawn every ~1s with slight jitter; ensures one at a time.
  spawnTimer = setInterval(() => { if (alive && activeIndex === -1) spawn(); }, 1000);
}

function stopGame(){
  alive = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  clearInterval(spawnTimer);
  spawnTimer = null;
  clearActive();
}

function floatText(cell, txt, positive){
  const b = cell.getBoundingClientRect();
  const host = document.createElement('div');
  host.className = 'float ' + (positive ? 'pos' : 'neg');
  host.textContent = txt;
  fxLayer.appendChild(host);

  const phone = document.querySelector('.phone-mock').getBoundingClientRect();
  host.style.left = (b.left - phone.left + b.width/2) + 'px';
  host.style.top = (b.top - phone.top + b.height/2) + 'px';

  setTimeout(() => host.remove(), 750);
}

function onCellTap(ev){
  const cell = ev.currentTarget;
  const idx = Number(cell.dataset.index);
  if (idx !== activeIndex || lockTap) return;

  lockTap = true; // prevent multi taps on same spawn
  const isGood = activeKind === 'good';
  if (isGood){
    score += 1;
    scoreEl.textContent = String(score);
    floatText(cell, '+1', true);
  } else {
    // -1 only if score > 0; otherwise do nothing
    if (score > 0){
      score = clamp(score - 1, 0, 9999);
      scoreEl.textContent = String(score);
      floatText(cell, '-1', false);
    } else {
      // Tiny shake to show no-op
      cell.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(3px)' },
        { transform: 'translateX(0px)' },
      ], { duration: 160, easing: 'ease-out' });
    }
    vibrateBad();
  }

  // Clear sprite quickly after tap
  setTimeout(clearActive, 60);
}

cells.forEach(c => {
  // Pointer events cover mouse/touch/pen
  c.addEventListener('pointerdown', onCellTap, { passive: true });
});

startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);

// Auto-start on user interaction anywhere (helpful on mobile)
window.addEventListener('pointerdown', () => { if (!alive) startGame(); }, { once: true });

// Expose hooks if you want to control from your AI task:
window.AI_MINIGAME = {
  start: startGame,
  stop: stopGame,
  setBusy(isBusy){ document.querySelector('.spinner').style.opacity = isBusy ? '1' : '.3'; }
};
