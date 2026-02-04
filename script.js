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

// Background layers (make sure these exist in index.html)
const bgHearts = document.getElementById("bgHearts");
const bgSparkles = document.getElementById("bgSparkles");

// === Smooth dodge settings (tune these) ===
const CURSOR_SAFE_RADIUS = 140; // how close before it runs
const YES_SAFE_RADIUS = 150;    // keep NO away from YES
const PADDING = 10;
const MAX_TRIES = 80;
const SMOOTH_MS = 170;          // glide speed (ms)

// Make movement smooth (no shaking)
noBtn.style.transition = `left ${SMOOTH_MS}ms ease, top ${SMOOTH_MS}ms ease`;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function center(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Pick a target position that is:
// - inside area
// - far from cursor
// - far from YES
function pickSafePosition(cursor) {
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();

  const yesC = center(yes);

  const maxX = Math.max(PADDING, area.width - btn.width - PADDING);
  const maxY = Math.max(PADDING, area.height - btn.height - PADDING);

  for (let i = 0; i < MAX_TRIES; i++) {
    // bias: move away from cursor direction (soft dodge, not random spam)
    const awayX = cursor ? (cursor.x < area.left + area.width / 2 ? 0.75 : 0.25) : 0.5;
    const awayY = cursor ? (cursor.y < area.top + area.height / 2 ? 0.75 : 0.25) : 0.5;

    // mix biased + random so it feels natural
    const x = clamp(
      (awayX * maxX) + (Math.random() - 0.5) * (maxX * 0.6),
      PADDING,
      maxX
    );
    const y = clamp(
      (awayY * maxY) + (Math.random() - 0.5) * (maxY * 0.6),
      PADDING,
      maxY
    );

    // Convert to viewport center for checks
    const btnC = {
      x: area.left + x + btn.width / 2,
      y: area.top + y + btn.height / 2,
    };

    // Check YES safe zone
    if (dist(btnC, yesC) < YES_SAFE_RADIUS) continue;

    // Check cursor safe zone
    if (cursor && dist(btnC, cursor) < CURSOR_SAFE_RADIUS) continue;

    return { x, y };
  }

  // fallback (still valid-ish)
  return { x: PADDING, y: PADDING };
}

function moveNoSmooth(cursorEvent) {
  const cursor = cursorEvent
    ? { x: cursorEvent.clientX, y: cursorEvent.clientY }
    : null;

  const pos = pickSafePosition(cursor);

  noBtn.style.position = "absolute";
  noBtn.style.transform = "none";
  noBtn.style.left = pos.x + "px";
  noBtn.style.top = pos.y + "px";
}

// Only run when pointer gets close to NO (no jitter)
function shouldRunByPointer(e) {
  const btn = noBtn.getBoundingClientRect();
  const btnC = center(btn);
  const p = { x: e.clientX, y: e.clientY };
  return dist(btnC, p) < CURSOR_SAFE_RADIUS;
}

// Pointer (works on modern phones too)
btnArea.addEventListener("pointermove", (e) => {
  if (shouldRunByPointer(e)) moveNoSmooth(e);
});

// === MOBILE HARD MODE (touch) ===
// When finger moves anywhere near NO -> it escapes
function touchPoint(touch) {
  return { clientX: touch.clientX, clientY: touch.clientY };
}

noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoSmooth(); // instant escape
}, { passive: false });

noBtn.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const t = e.touches && e.touches[0];
  if (!t) return;
  moveNoSmooth(touchPoint(t)); // escape away from finger
}, { passive: false });

// Also: if she slides finger on the whole area, still dodge
btnArea.addEventListener("touchmove", (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;

  // only dodge if finger is close (prevents spam)
  const fakeEvent = touchPoint(t);
  if (shouldRunByPointer(fakeEvent)) {
    e.preventDefault();
    moveNoSmooth(fakeEvent);
  }
}, { passive: false });

// If someone somehow clicks it (desktop)
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoSmooth();
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

// Tiny celebration flash (soft)
function celebrate() {
  document.body.animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(1.08)" },
      { filter: "brightness(1)" }
    ],
    { duration: 500, easing: "ease-out" }
  );

  burstHearts(1.4);
  for (let i = 0; i < 18; i++) spawnSparkle(true);

  // small vibration on phones (optional, safe)
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
}

// YES click
yesBtn.addEventListener("click", () => {
  result.style.display = "block";
  btnArea.style.display = "none";
  burstHearts();
  celebrate();
});

// === Background decor (floating hearts + sparkles) ===
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

function spawnSparkle(isBurst = false) {
  if (!bgSparkles) return;
  const s = document.createElement("div");
  s.className = "bg-sparkle";
  s.style.left = Math.random() * 100 + "%";
  const size = (Math.random() * 5 + 3) + (isBurst ? 2 : 0);
  s.style.width = s.style.height = size + "px";
  s.style.animationDuration = (Math.random() * 6 + (isBurst ? 3 : 8)) + "s";
  bgSparkles.appendChild(s);
  setTimeout(() => s.remove(), 16000);
}

setInterval(spawnBgHeart, 900);
setInterval(() => spawnSparkle(false), 260);

// Initial placement
moveNoSmooth();
window.addEventListener("resize", () => moveNoSmooth());
