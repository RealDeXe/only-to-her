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
const RUN_RADIUS = 120;      // finger/cursor distance to trigger running
const YES_SAFE_RADIUS = 160; // keep NO away from YES
const PADDING = 10;
const MAX_TRIES = 80;
const SMOOTH_MS = 180;

// Smooth move
noBtn.style.transition = `left ${SMOOTH_MS}ms ease, top ${SMOOTH_MS}ms ease`;

// Helpers
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Pick a safe position inside btnArea away from finger + away from YES
function pickSafePosition(pointer) {
  const area = btnArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();
  const yesC = center(yes);

  const maxX = Math.max(PADDING, area.width - btn.width - PADDING);
  const maxY = Math.max(PADDING, area.height - btn.height - PADDING);

  for (let i = 0; i < MAX_TRIES; i++) {
    // Bias away from pointer if we have one
    const midX = area.left + area.width / 2;
    const midY = area.top + area.height / 2;

    const biasX = pointer ? (pointer.x < midX ? 0.75 : 0.25) : 0.5;
    const biasY = pointer ? (pointer.y < midY ? 0.75 : 0.25) : 0.5;

    const x = clamp(
      biasX * maxX + (Math.random() - 0.5) * (maxX * 0.7),
      PADDING,
      maxX
    );

    const y = clamp(
      biasY * maxY + (Math.random() - 0.5) * (maxY * 0.7),
      PADDING,
      maxY
    );

    const btnC = {
      x: area.left + x + btn.width / 2,
      y: area.top + y + btn.height / 2,
    };

    if (dist(btnC, yesC) < YES_SAFE_RADIUS) continue;
    if (pointer && dist(btnC, pointer) < RUN_RADIUS) continue;

    return { x, y };
  }

  return { x: PADDING, y: PADDING };
}

function moveNo(pointerEventLike = null) {
  const pointer = pointerEventLike
    ? { x: pointerEventLike.clientX, y: pointerEventLike.clientY }
    : null;

  const pos = pickSafePosition(pointer);

  noBtn.style.position = "absolute";
  noBtn.style.transform = "none";
  noBtn.style.left = pos.x + "px";
  noBtn.style.top = pos.y + "px";
}

function shouldRun(pointerEventLike) {
  const btnC = center(noBtn.getBoundingClientRect());
  const p = { x: pointerEventLike.clientX, y: pointerEventLike.clientY };
  return dist(btnC, p) < RUN_RADIUS;
}

// ✅ Desktop + Mobile pointer support
btnArea.addEventListener("pointermove", (e) => {
  if (shouldRun(e)) moveNo(e);
});

// ✅ Mobile touch support: finger moving in the area
btnArea.addEventListener(
  "touchmove",
  (e) => {
    if (!e.touches || !e.touches.length) return;
    const t = e.touches[0];
    // Only run if finger is close
    if (shouldRun(t)) {
      // prevent the "click" from landing
      e.preventDefault();
      moveNo(t);
    }
  },
  { passive: false }
);

// ✅ Mobile: if she taps NO, it escapes instantly
noBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const t = e.touches && e.touches[0] ? e.touches[0] : null;
    moveNo(t);
  },
  { passive: false }
);

// If someone clicks it on desktop
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNo(e);
});

// YES click
yesBtn.addEventListener("click", () => {
  result.style.display = "block";
  btnArea.style.display = "none";
  burstHearts();
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
    { duration: 500, easing: "ease-out" }
  );
  burstHearts(1.4);
  for (let i = 0; i < 18; i++) spawnSparkle(true);
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

function spawnSparkle(isBurst = false) {
  if (!bgSparkles) return;
  const s = document.createElement("div");
  s.className = "bg-sparkle";
  s.style.left = Math.random() * 100 + "%";
  const size = Math.random() * 5 + 3 + (isBurst ? 2 : 0);
  s.style.width = s.style.height = size + "px";
  s.style.animationDuration = Math.random() * 6 + (isBurst ? 3 : 8) + "s";
  bgSparkles.appendChild(s);
  setTimeout(() => s.remove(), 16000);
}

setInterval(spawnBgHeart, 900);
setInterval(() => spawnSparkle(false), 260);

// Initial placement
moveNo();
window.addEventListener("resize", () => moveNo());
