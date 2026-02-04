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

// === Dodge settings (mobile-first) ===
const SAFE_FROM_FINGER = 135;
const SAFE_FROM_YES = 170;
const PADDING = 10;
const MAX_TRIES = 140;
const SMOOTH_MS = 180;

// Smooth movement
noBtn.style.transition = `left ${SMOOTH_MS}ms ease, top ${SMOOTH_MS}ms ease`;
noBtn.style.willChange = "left, top";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
function center(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function getPointFromEvent(e) {
  const t = e.touches && e.touches[0] ? e.touches[0] : null;
  const ct = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null;
  const p = t || ct;
  return p ? { x: p.clientX, y: p.clientY } : { x: e.clientX, y: e.clientY };
}

function fingerTooClose(point) {
  const btnC = center(noBtn.getBoundingClientRect());
  return dist(btnC, point) < SAFE_FROM_FINGER;
}

function pickSafePosition(point) {
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();
  const yesC = center(yes);

  const maxX = Math.max(PADDING, area.width - btn.width - PADDING);
  const maxY = Math.max(PADDING, area.height - btn.height - PADDING);

  const areaCenter = { x: area.left + area.width / 2, y: area.top + area.height / 2 };
  const finger = point || areaCenter;

  const dirX = finger.x < areaCenter.x ? 0.75 : 0.25;
  const dirY = finger.y < areaCenter.y ? 0.75 : 0.25;

  for (let i = 0; i < MAX_TRIES; i++) {
    const x = clamp(
      dirX * maxX + (Math.random() - 0.5) * (maxX * 0.75),
      PADDING,
      maxX
    );
    const y = clamp(
      dirY * maxY + (Math.random() - 0.5) * (maxY * 0.75),
      PADDING,
      maxY
    );

    const c = { x: area.left + x + btn.width / 2, y: area.top + y + btn.height / 2 };

    if (dist(c, yesC) < SAFE_FROM_YES) continue;
    if (point && dist(c, point) < SAFE_FROM_FINGER) continue;

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

// ===== iPhone/Instagram browser fix =====
// ✅ IMPORTANT: DO NOT preventDefault on touchstart (kills button clicks)
// ✅ Only preventDefault on touchmove (when finger is sliding)
let rafLock = false;

function onTouchStart(e) {
  // don't block clicks
  const p = getPointFromEvent(e);
  if (fingerTooClose(p)) moveNoTo(p);
}

function onTouchMove(e) {
  const p = getPointFromEvent(e);
  if (!fingerTooClose(p)) return;

  // Now we can block scroll so tracking works
  e.preventDefault();

  if (rafLock) return;
  rafLock = true;

  requestAnimationFrame(() => {
    moveNoTo(p);
    rafLock = false;
  });
}

// Track touches in the area
btnArea.addEventListener("touchstart", onTouchStart, { passive: true });
btnArea.addEventListener("touchmove", onTouchMove, { passive: false });

// If finger lands directly on NO
noBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    moveNoTo(getPointFromEvent(e));
  },
  { passive: false }
);

// Desktop / modern browsers
btnArea.addEventListener("pointermove", (e) => {
  const p = getPointFromEvent(e);
  if (fingerTooClose(p)) moveNoTo(p);
});

// Prevent NO click
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
