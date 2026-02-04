// === Customize here ===
const NAME = "DoDo";
const FINAL_MESSAGE = "😌 so this is a yes bkhatrk yak hh ?";

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

// === Dodge settings (mobile-first) ===
const SAFE_FROM_FINGER = 28;   // px distance to the NO button box before it runs
const SAFE_FROM_YES = 140;     // keep NO away from YES
const PADDING = 10;
const MAX_TRIES = 180;
const SMOOTH_MS = 170;

// Smooth movement
noBtn.style.transition = `left ${SMOOTH_MS}ms ease, top ${SMOOTH_MS}ms ease`;
noBtn.style.willChange = "left, top";

// Helpers
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function center(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Distance from a point to a rectangle (0 if inside)
function distPointToRect(px, py, rect) {
  const dx = px < rect.left ? rect.left - px : px > rect.right ? px - rect.right : 0;
  const dy = py < rect.top ? rect.top - py : py > rect.bottom ? py - rect.bottom : 0;
  return Math.hypot(dx, dy);
}

function getPointFromEvent(e) {
  const t = e.touches && e.touches[0] ? e.touches[0] : null;
  const ct = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null;
  const p = t || ct;
  return p ? { x: p.clientX, y: p.clientY } : { x: e.clientX, y: e.clientY };
}

function isInsideArea(point) {
  const area = btnArea.getBoundingClientRect();
  return (
    point.x >= area.left &&
    point.x <= area.right &&
    point.y >= area.top &&
    point.y <= area.bottom
  );
}

// Finger close to the NO button (using rectangle distance, super reliable)
function fingerTooClose(point) {
  const rect = noBtn.getBoundingClientRect();
  return distPointToRect(point.x, point.y, rect) <= SAFE_FROM_FINGER;
}

// Find a safe place INSIDE btnArea, far from finger + far from YES
function pickSafePosition(point) {
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();

  const yesC = center(yes);

  const maxX = Math.max(PADDING, area.width - btn.width - PADDING);
  const maxY = Math.max(PADDING, area.height - btn.height - PADDING);

  const areaC = { x: area.left + area.width / 2, y: area.top + area.height / 2 };
  const finger = point || areaC;

  // Bias away from finger
  const dirX = finger.x < areaC.x ? 0.75 : 0.25;
  const dirY = finger.y < areaC.y ? 0.75 : 0.25;

  for (let i = 0; i < MAX_TRIES; i++) {
    const x = clamp(
      dirX * maxX + (Math.random() - 0.5) * (maxX * 0.85),
      PADDING,
      maxX
    );
    const y = clamp(
      dirY * maxY + (Math.random() - 0.5) * (maxY * 0.85),
      PADDING,
      maxY
    );

    const c = { x: area.left + x + btn.width / 2, y: area.top + y + btn.height / 2 };

    // Too close to YES
    const dYes = Math.hypot(c.x - yesC.x, c.y - yesC.y);
    if (dYes < SAFE_FROM_YES) continue;

    // Too close to finger
    if (point) {
      const fingerRectDist = Math.hypot(c.x - finger.x, c.y - finger.y);
      if (fingerRectDist < SAFE_FROM_FINGER + 30) continue;
    }

    return { x, y };
  }

  return { x: PADDING, y: PADDING };
}

function moveNoTo(point) {
  const pos = pickSafePosition(point);
  noBtn.style.position = "absolute";
  noBtn.style.transform = "none";
  noBtn.style.left = pos.x + "px";
  noBtn.style.top = pos.y + "px";
}

// ===== HARD FIX for iPhone / Instagram in-app browser =====
// Listen on DOCUMENT so touchmove always fires
let rafLock = false;

function globalTouchStart(e) {
  const p = getPointFromEvent(e);

  // Only react if touch begins inside the buttons area OR directly on NO
  if (!isInsideArea(p) && e.target !== noBtn) return;

  if (fingerTooClose(p)) moveNoTo(p);
}

function globalTouchMove(e) {
  const p = getPointFromEvent(e);

  // Only when finger is in the button zone
  if (!isInsideArea(p)) return;

  // Only dodge if close to NO
  if (!fingerTooClose(p)) return;

  // Stop scroll ONLY when we're dodging
  e.preventDefault();

  if (rafLock) return;
  rafLock = true;

  requestAnimationFrame(() => {
    moveNoTo(p);
    rafLock = false;
  });
}

document.addEventListener("touchstart", globalTouchStart, { passive: true });
document.addEventListener("touchmove", globalTouchMove, { passive: false });

// Desktop / modern browsers fallback
document.addEventListener("pointermove", (e) => {
  const p = getPointFromEvent(e);
  if (!isInsideArea(p)) return;
  if (fingerTooClose(p)) moveNoTo(p);
});

// If someone somehow taps NO
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoTo(null);
});

// YES click
yesBtn.addEventListener("click", () => {
  result.style.display = "block";
  btnArea.style.display = "none";
  burstHearts(1.4);
  celebrate();
});

// Hearts burst
function burstHearts(mult = 1) {
  const icons = ["💖", "💘", "💗", "💓", "💕", "❤️"];
  const count = Math.floor(24 * mult);

  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = icons[Math.floor(Math.random() * icons.length)];
    h.style.left = Math.random() * 90 + 5 + "%";
    h.style.bottom = "-10px";
    h.style.animationDuration = Math.random() * 1.2 + 1.4 + "s";
    h.style.fontSize = Math.random() * 16 + 16 + "px";
    hearts.appendChild(h);
    setTimeout(() => h.remove(), 2400);
  }
}

function celebrate() {
  document.body.animate(
    [{ filter: "brightness(1)" }, { filter: "brightness(1.08)" }, { filter: "brightness(1)" }],
    { duration: 520, easing: "ease-out" }
  );
}

// Background decor (optional)
const bgHeartIcons = ["💗", "💖", "💕", "💘", "❤️"];

function spawnBgHeart() {
  if (!bgHearts) return;
  const h = document.createElement("div");
  h.className = "bg-heart";
  h.textContent = bgHeartIcons[Math.floor(Math.random() * bgHeartIcons.length)];
  h.style.left = Math.random() * 100 + "%";
  h.style.fontSize = Math.random() * 18 + 14 + "px";
  h.style.animationDuration = Math.random() * 10 + 14 + "s";
  bgHearts.appendChild(h);
  setTimeout(() => h.remove(), 26000);
}

function spawnSparkle() {
  if (!bgSparkles) return;
  const s = document.createElement("div");
  s.className = "bg-sparkle";
  s.style.left = Math.random() * 100 + "%";
  const size = Math.random() * 5 + 3 + "px";
  s.style.width = s.style.height = size;
  s.style.animationDuration = Math.random() * 6 + 8 + "s";
  bgSparkles.appendChild(s);
  setTimeout(() => s.remove(), 16000);
}

setInterval(spawnBgHeart, 900);
setInterval(spawnSparkle, 260);

// Initial placement + iOS viewport weirdness
function refreshLayoutFix() {
  moveNoTo(null);
}

window.addEventListener("resize", () => setTimeout(refreshLayoutFix, 120));
window.addEventListener("orientationchange", () => {
  setTimeout(refreshLayoutFix, 150);
  setTimeout(refreshLayoutFix, 350);
});

if (window.visualViewport) {
  visualViewport.addEventListener("resize", () => setTimeout(refreshLayoutFix, 80));
  visualViewport.addEventListener("scroll", () => setTimeout(refreshLayoutFix, 80));
}

window.addEventListener("load", () => {
  setTimeout(refreshLayoutFix, 200);
  setTimeout(refreshLayoutFix, 650);
});
