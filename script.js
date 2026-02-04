// === Customize here ===
const NAME = "DoDo";
const FINAL_MESSAGE = "Ok bet 😌 be ready i'll pick u up at 18h aight ?";

document.getElementById("herName").textContent = NAME;
document.getElementById("finalLine").textContent = FINAL_MESSAGE;

// Elements
const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const btnArea = document.getElementById("btnArea");
const result = document.getElementById("result");
const hearts = document.getElementById("hearts");

// Background layers (optional)
const bgHearts = document.getElementById("bgHearts");
const bgSparkles = document.getElementById("bgSparkles");

// === Dodge settings ===
const SAFE_FROM_FINGER = 120;
const SAFE_FROM_YES = 170;
const PADDING = 10;
const MAX_TRIES = 120;
const SMOOTH_MS = 180;

noBtn.style.transition = `left ${SMOOTH_MS}ms ease, top ${SMOOTH_MS}ms ease`;
noBtn.style.willChange = "left, top";

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function center(rect) { return { x: rect.left + rect.width/2, y: rect.top + rect.height/2 }; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function getPoint(e){
  const t = e.touches?.[0] || e.changedTouches?.[0];
  if (t) return { x: t.clientX, y: t.clientY };
  return { x: e.clientX, y: e.clientY };
}

function pickSafe(point){
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();

  const yesC = center(yes);
  const maxX = Math.max(PADDING, area.width - btn.width - PADDING);
  const maxY = Math.max(PADDING, area.height - btn.height - PADDING);

  const areaC = { x: area.left + area.width/2, y: area.top + area.height/2 };
  const finger = point || areaC;

  const dirX = finger.x < areaC.x ? 0.75 : 0.25;
  const dirY = finger.y < areaC.y ? 0.75 : 0.25;

  for (let i=0;i<MAX_TRIES;i++){
    const x = clamp(dirX * maxX + (Math.random()-0.5)*(maxX*0.7), PADDING, maxX);
    const y = clamp(dirY * maxY + (Math.random()-0.5)*(maxY*0.7), PADDING, maxY);

    const c = { x: area.left + x + btn.width/2, y: area.top + y + btn.height/2 };

    if (dist(c, yesC) < SAFE_FROM_YES) continue;
    if (point && dist(c, point) < SAFE_FROM_FINGER) continue;

    return { x, y };
  }
  return { x: PADDING, y: PADDING };
}

function moveNo(point){
  const pos = pickSafe(point);
  noBtn.style.position = "absolute";
  noBtn.style.transform = "none";
  noBtn.style.left = pos.x + "px";
  noBtn.style.top = pos.y + "px";
}

function fingerClose(point){
  const c = center(noBtn.getBoundingClientRect());
  return dist(c, point) < SAFE_FROM_FINGER;
}

// ✅ Only listen on NO button (not whole area) -> keeps YES clickable on iPhone
noBtn.addEventListener("touchstart", (e) => {
  moveNo(getPoint(e));
}, { passive: true });

noBtn.addEventListener("touchmove", (e) => {
  const p = getPoint(e);
  if (fingerClose(p)) moveNo(p);
}, { passive: true });

// Desktop support
noBtn.addEventListener("mouseenter", () => moveNo(null));
btnArea.addEventListener("pointermove", (e) => {
  const p = getPoint(e);
  if (fingerClose(p)) moveNo(p);
});

// ✅ iPhone / WhatsApp browser: make YES always respond
function onYes(){
  result.style.display = "block";
  btnArea.style.display = "none";
  burstHearts(1.4);
}

yesBtn.addEventListener("click", onYes);
yesBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  onYes();
}, { passive: false });

// Block NO clicks
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNo(null);
});

// Hearts
function burstHearts(mult = 1) {
  const icons = ["💖","💘","💗","💓","💕","❤️"];
  const count = Math.floor(24 * mult);
  for (let i=0;i<count;i++){
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = icons[Math.floor(Math.random()*icons.length)];
    h.style.left = (Math.random()*90+5) + "%";
    h.style.bottom = "-10px";
    h.style.animationDuration = (Math.random()*1.2+1.4) + "s";
    h.style.fontSize = (Math.random()*16+16) + "px";
    hearts.appendChild(h);
    setTimeout(() => h.remove(), 2400);
  }
}

// Optional background decor
const bgHeartIcons = ["💗","💖","💕","💘","❤️"];
function spawnBgHeart(){
  if (!bgHearts) return;
  const h = document.createElement("div");
  h.className = "bg-heart";
  h.textContent = bgHeartIcons[Math.floor(Math.random()*bgHeartIcons.length)];
  h.style.left = Math.random()*100 + "%";
  h.style.fontSize = (Math.random()*18+14) + "px";
  h.style.animationDuration = (Math.random()*10+14) + "s";
  bgHearts.appendChild(h);
  setTimeout(() => h.remove(), 26000);
}
function spawnSparkle(){
  if (!bgSparkles) return;
  const s = document.createElement("div");
  s.className = "bg-sparkle";
  s.style.left = Math.random()*100 + "%";
  const size = (Math.random()*5+3) + "px";
  s.style.width = s.style.height = size;
  s.style.animationDuration = (Math.random()*6+8) + "s";
  bgSparkles.appendChild(s);
  setTimeout(() => s.remove(), 16000);
}
setInterval(spawnBgHeart, 900);
setInterval(spawnSparkle, 260);

// Initial
moveNo(null);
window.addEventListener("resize", () => moveNo(null));
window.addEventListener("orientationchange", () => setTimeout(() => moveNo(null), 200));
