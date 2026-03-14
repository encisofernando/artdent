/* ─── AUTH ──────────────────────────────────────── */
(function checkAuth() {
  const loggedIn =
    document.cookie.includes("laravel_session") ||
    document.cookie.includes("remember_web");
  if (loggedIn) {
    document.getElementById("guestButtons")?.classList.add("hidden");
    document.getElementById("userButtons")?.classList.remove("hidden");
  }
})();

/* ─── NAV SCROLL EFFECT ─────────────────────────── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}, { passive: true });

/* ─── MOBILE HAMBURGER ──────────────────────────── */
const hamburger = document.getElementById("hamburger");
const navDrawer  = document.getElementById("navDrawer");

hamburger?.addEventListener("click", () => {
  const open = hamburger.classList.toggle("open");
  navDrawer.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
});

// Close on link click
navDrawer?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navDrawer.classList.remove("open");
    document.body.style.overflow = "";
  });
});

/* ─── SCROLL REVEAL ─────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target); // fire once
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* ─── COUNTER ANIMATION ─────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  const start     = performance.now();
  const startVal  = 0;
  const isPercent = el.nextElementSibling?.textContent === "%";

  const update = now => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current.toLocaleString("es-AR");
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll(".stat-num[data-target]").forEach(el => {
  counterObserver.observe(el);
});

/* ─── SMOOTH ANCHOR SCROLLING ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const offset = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
      ) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});