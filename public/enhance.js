// Premium enhancement layer — Lenis smooth scroll, custom cursor, scroll progress,
// text/image/section reveals, parallax, counters, magnetic buttons, section numbers.
import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.13/+esm";

const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarse = matchMedia("(hover: none), (pointer: coarse)").matches;

document.documentElement.classList.add("enh");

/* ---------- Lenis smooth scroll ---------- */
const lenis = new Lenis({
  lerp: 0.08,
  wheelMultiplier: 1,
  smoothWheel: true,
  smoothTouch: false,
});
let scrollY = 0;
lenis.on("scroll", ({ scroll }) => { scrollY = scroll; });
function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* ---------- Custom cursor ---------- */
if (!isCoarse) {
  const dot = document.createElement("div"); dot.className = "enh-cursor-dot";
  const ring = document.createElement("div"); ring.className = "enh-cursor-ring";
  document.body.append(dot, ring);
  let mx = innerWidth / 2, my = innerHeight / 2;
  let dx = mx, dy = my, rx = mx, ry = my;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  addEventListener("mousedown", () => document.documentElement.classList.add("enh-down"));
  addEventListener("mouseup",   () => document.documentElement.classList.remove("enh-down"));
  const hoverSel = 'a,button,[role="button"],input,textarea,select,.enh-card,.enh-magnet,[data-hover]';
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSel)) document.documentElement.classList.add("enh-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSel)) document.documentElement.classList.remove("enh-hover");
  });
  (function tick() {
    dx += (mx - dx) * 0.9;   // dot fast follow
    dy += (my - dy) * 0.9;
    rx += (mx - rx) * 0.09;  // ring lags at 9%
    ry += (my - ry) * 0.09;
    dot.style.transform  = `translate3d(${dx}px,${dy}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(tick);
  })();
}

/* ---------- Scroll progress ---------- */
const progress = document.createElement("div");
progress.className = "enh-progress";
document.body.appendChild(progress);
function updateProgress() {
  const h = document.documentElement.scrollHeight - innerHeight;
  const p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
  progress.style.height = (p * 100).toFixed(2) + "%";
}
lenis.on("scroll", updateProgress);

/* ---------- Section indicator ---------- */
const label = document.createElement("div");
label.className = "enh-section-label hidden";
label.textContent = document.title.split("|")[0].trim();
document.body.appendChild(label);
let currentLabel = "";
function updateSectionLabel() {
  const sections = [...document.querySelectorAll("section, header, footer")];
  const mid = scrollY + innerHeight * 0.35;
  let best = null;
  for (const s of sections) {
    const top = s.offsetTop;
    if (top <= mid) best = s;
  }
  if (!best) return;
  const h = best.querySelector("h1,h2,h3");
  const text = (best.dataset.section || (h && h.textContent.trim()) || "").slice(0, 40);
  if (text && text !== currentLabel) {
    currentLabel = text;
    label.classList.add("hidden");
    setTimeout(() => { label.textContent = text; label.classList.remove("hidden"); }, 180);
  }
}

/* ---------- Instrument DOM ---------- */
// Wrap images
document.querySelectorAll("img").forEach((img) => {
  const p = img.parentElement;
  if (!p || p.classList.contains("enh-img")) return;
  // Preserve parent layout classes; wrap the img
  const wrap = document.createElement("span");
  wrap.className = "enh-img";
  wrap.style.display = "block";
  wrap.style.width = "100%";
  wrap.style.height = "100%";
  p.insertBefore(wrap, img);
  wrap.appendChild(img);
  img.loading = img.loading || "lazy";
});

// Fade sections & their columns
const sections = [...document.querySelectorAll("main > section, main > header, section, header.hero, footer")];
sections.forEach((s, i) => {
  s.classList.add("enh-fade", "enh-section");
  // Big background number
  const num = document.createElement("span");
  num.className = "enh-section-num";
  num.textContent = String(i + 1).padStart(2, "0");
  s.prepend(num);
  // Stagger direct grid children left/right
  const grid = s.querySelector(".grid");
  if (grid) {
    const cols = [...grid.children];
    cols.forEach((c, idx) => {
      c.classList.add("enh-fade");
      if (cols.length >= 2) c.classList.add(idx % 2 === 0 ? "enh-fade-l" : "enh-fade-r");
      c.style.transitionDelay = (idx * 100) + "ms";
    });
  }
});

// Text line reveal on all headline levels
document.querySelectorAll("h1, h2, h3.font-headline-lg, h3.font-display-xl").forEach((h) => {
  // Skip if already wrapped or contains complex markup like <br>
  if (h.querySelector(".enh-line-wrap")) return;
  const html = h.innerHTML;
  const parts = html.split(/<br\s*\/?>/i);
  h.innerHTML = parts.map(p => `<span class="enh-line-wrap"><span class="enh-line">${p}</span></span>`).join("");
});

// Cards
document.querySelectorAll(".grid > div, article, .card").forEach((c) => {
  if (c.querySelector("img") || c.classList.contains("enh-fade")) c.classList.add("enh-card");
});

// Nav links & buttons — magnetic
document.querySelectorAll("nav a").forEach((a) => a.classList.add("enh-nav-link"));
const magnets = [...document.querySelectorAll("button, nav a, .enh-magnet, [data-magnet]")];
magnets.forEach((el) => el.classList.add("enh-magnet"));

if (!isCoarse && !prefersReduced) {
  addEventListener("mousemove", (e) => {
    magnets.forEach((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 80) {
        el.style.transform = `translate3d(${dx * 0.3}px, ${dy * 0.3}px, 0) scale(1.02)`;
      } else if (el.style.transform) {
        el.style.transform = "";
      }
    });
  }, { passive: true });
}

/* ---------- Parallax layers ---------- */
// Auto-tag hero + large images as parallax
const parallaxTargets = [];
document.querySelectorAll("header img, section img").forEach((img, i) => {
  const speed = 0.15 + (i % 4) * 0.05; // 0.15 – 0.30
  img.dataset.speed = speed;
  img.classList.add("enh-parallax");
  parallaxTargets.push(img);
});

function applyParallax() {
  for (const el of parallaxTargets) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const speed = parseFloat(el.dataset.speed || "0.2");
    const offset = (r.top + r.height / 2 - innerHeight / 2) * -speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.08)`;
  }
}
lenis.on("scroll", applyParallax);

/* ---------- IntersectionObserver reveals ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("enh-in");
      // stagger .enh-line children
      const lines = e.target.querySelectorAll(".enh-line");
      lines.forEach((l, i) => { l.style.transitionDelay = (i * 120) + "ms"; });
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

document.querySelectorAll(".enh-fade, .enh-img, .enh-section, h1, h2").forEach((el) => io.observe(el));

/* ---------- Counter animation ---------- */
const numRegex = /^\s*([0-9][0-9,\.]*)\s*([^\d\s].*)?$/;
document.querySelectorAll("h1,h2,h3,.stat,[data-count]").forEach((el) => {
  const m = el.textContent && el.textContent.match(numRegex);
  if (!m) return;
  const target = parseFloat(m[1].replace(/,/g, ""));
  if (!isFinite(target) || target < 3) return;
  const suffix = m[2] || "";
  const useComma = m[1].includes(",");
  const digits = (m[1].split(".")[1] || "").length;
  el.dataset.origText = el.textContent;
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(el);
      const start = performance.now(), dur = 1800;
      function step(t) {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = target * eased;
        let s = digits ? v.toFixed(digits) : Math.round(v).toString();
        if (useComma) s = Number(s).toLocaleString();
        el.textContent = s + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });
  cio.observe(el);
});

/* ---------- Hero entrance stagger ---------- */
const hero = document.querySelector("header, main > *:first-child");
if (hero) {
  const kids = [...hero.querySelectorAll("span, h1, p, div, button, a")].slice(0, 6);
  const delays = [150, 300, 500, 650, 850, 1000];
  kids.forEach((k, i) => { if (k.classList.contains("enh-fade")) k.style.transitionDelay = (delays[i] || 1000) + "ms"; });
  requestAnimationFrame(() => hero.classList.add("enh-in"));
}

/* ---------- Nav frosted-glass on scroll ---------- */
const nav = document.querySelector("nav");
if (nav) {
  nav.style.transition = "background-color .7s ease, backdrop-filter .7s ease, border-color .7s ease";
  lenis.on("scroll", () => {
    if (scrollY > 60) {
      nav.style.background = "rgba(250,249,246,.72)";
      nav.style.backdropFilter = "blur(28px) saturate(1.5)";
    } else {
      nav.style.background = "transparent";
      nav.style.backdropFilter = "";
    }
  });
}

/* ---------- Scroll velocity tilt on cards ---------- */
let lastY = 0, velocity = 0;
lenis.on("scroll", () => {
  velocity = scrollY - lastY;
  lastY = scrollY;
});
const cards = [...document.querySelectorAll(".enh-card")];
function tiltLoop() {
  const tilt = Math.max(-2, Math.min(2, velocity * 0.05));
  cards.forEach((c) => {
    const base = c.style.transform && c.style.transform.includes("translate3d(0,-6px") ? "translate3d(0,-6px,0)" : "";
    c.style.transform = `${base} perspective(900px) rotateY(${tilt.toFixed(2)}deg)`;
  });
  velocity *= 0.9;
  requestAnimationFrame(tiltLoop);
}
if (!prefersReduced) requestAnimationFrame(tiltLoop);

/* ---------- Per-frame updates ---------- */
function frame() {
  updateProgress();
  updateSectionLabel();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
applyParallax();
updateProgress();
