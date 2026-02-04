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
const SAFE_FROM_FINGER = 120;   // how close before it runs (mobile)
const SAFE_FROM_YES = 160;      // keep NO away from YES
const PADDING = 10;
const MAX_TRIES = 120;
const SMOOTH_MS = 180;          // glide speed (smooth)

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

// Convert finger/client coords to a good cursor-like point
function getPointFromEvent(e) {
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

// True if finger is getting close to the NO button
function fingerTooClose(point) {
  const btn = noBtn.getBoundingClientRect();
  const btnC = center(btn);
  return dist(btnC, point) < SAFE_FROM_FINGER;
}

// Find a safe place INSIDE btnArea, far from finger + far from YES
function pickSafePosition(point) {
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();

  const yesC = center(yes);

  const maxX = Math.max(PADDING, area.width - btn.width - PADDING);
  const maxY = Math.max(PADDING, area.height - btn.height - PADDING);

  const areaCenter = { x: area.left + area.width / 2, y: area.top + area.height / 2 };
  const finger = point || areaCenter;

  // Direction away from finger
  const dirX = finger.x < areaCenter.x ? 0.75 : 0.25;
  const dirY = finger.y < areaCenter.y ? 0.75 : 0.25;

  for (let i = 0; i < MAX_TRIES; i++) {
    // Biased away + little randomness so it feels natural
    const x = clamp(
      dirX * maxX + (Math.random() - 0.5) * (maxX * 0.65),
      PADDING,
      maxX
    );
    const y = clamp(
      dirY * maxY + (Math.random() - 0.5) * (maxY * 0.65),
      PADDING,
      maxY
    );

    const candidateCenter = {
      x: area.left + x + btn.width / 2,
      y: area.top + y + btn.height / 2
    };

    // Too close to YES?
    if (dist(candidateCenter, yesC) < SAFE_FROM_YES) continue;

    // Too close to finger?
    if (point && dist(candidateCenter, point) < SAFE_FROM_FINGER) continue;

    return { x, y };
  }

  // Fallback
  return { x: PADDING, y: PADDING };
}

function moveNoTo(point) {
  const pos = pickSafePosition(point);
  noBtn.style.position = "absolute";
  noBtn.style.transform = "none";
  noBtn.style.left = pos.x + "px";
  noBtn.style.top = pos.y + "px";
}

// ---- iPhone/Safari: use touchstart + touchmove (THIS is the real fix) ----
let rafLock = false;

function handleMove(e) {
  const p = getPointFromEvent(e);

  // Only move when finger gets close (prevents jitter)
  if (!fingerTooClose(p)) return;

  // Throttle to avoid spam on iPhone
  if (rafLock) return;
  rafLock = true;

  requestAnimationFrame(() => {
    moveNoTo(p);
    rafLock = false;
  });
}

// Make the area react to finger movement
btnArea.addEventListener("touchstart", handleMove, { passive: true });
btnArea.addEventListener("touchmove", handleMove, { passive: true });

// Also react if the finger is directly on the NO button
noBtn.addEventListener("touchstart", (e) => {
  const p = getPointFromEvent(e);
  moveNoTo(p);
}, { passive: true });

// Desktop fallback (still works on PC)
btnArea.addEventListener("pointermove", handleMove);

// Prevent NO clicks
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

// Hearts burst inside card
function burstHearts(mult = 1) {
  const icons = ["💖", "💘", "💗", "💓", "💕", "❤️"];
  const count = Math.floor(24 * mult);

  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = icons[Math.floor(Math.random() * icons.length)];
    h.style.left = (Math.random() * 90 + 5) + "%";
    h.style.bottom = "-10px";
    h.style.animationDuration = (Math.random() * 1.2 + 1.4) + "s";
    h.style.fontSize = (Math.random() * 16 + 16) + "px";
    hearts.appendChild(h);
    setTimeout(() => h.remove(), 2400);
  }
}

function celebrate() {
  document.body.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.01)" }, { transform: "scale(1)" }],
    { duration: 500, easing: "ease-out" }
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
  h.style.fontSize = (Math.random() * 18 + 14) + "px";
  h.style.animationDuration = (Math.random() * 10 + 14) + "s";
  bgHearts.appendChild(h);
  setTimeout(() => h.remove(), 26000);
}

function spawnSparkle() {
  if (!bgSparkles) return;
  const s = document.createElement("div");
  s.className = "bg-sparkle";
  s.style.left = Math.random() * 100 + "%";
  const size = (Math.random() * 5 + 3) + "px";
  s.style.width = s.style.height = size;
  s.style.animationDuration = (Math.random() * 6 + 8) + "s";
  bgSparkles.appendChild(s);
  setTimeout(() => s.remove(), 16000);
}

setInterval(spawnBgHeart, 900);
setInterval(spawnSparkle, 260);

// Initial placement
moveNoTo(null);
window.addEventListener("resize", () => moveNoTo(null));
// === iPhone Safari fix: viewport changes / address bar ===
function refreshLayoutFix() {
  // Re-place NO safely after Safari changes the viewport
  moveNoTo(null);
}

// iPhone rotation
window.addEventListener("orientationchange", () => {
  setTimeout(refreshLayoutFix, 150);
  setTimeout(refreshLayoutFix, 350);
});

// Normal resize
window.addEventListener("resize", () => {
  setTimeout(refreshLayoutFix, 120);
});

// Safari iOS address bar / visual viewport resize
if (window.visualViewport) {
  visualViewport.addEventListener("resize", () => {
    setTimeout(refreshLayoutFix, 80);
  });
  visualViewport.addEventListener("scroll", () => {
    setTimeout(refreshLayoutFix, 80);
  });
}

// Also fix it once after load (Safari needs a beat)
window.addEventListener("load", () => {
  setTimeout(refreshLayoutFix, 200);
  setTimeout(refreshLayoutFix, 600);
});

