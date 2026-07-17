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

/* ─── FAQ ACCORDION ──────────────────────────────── */
document.querySelectorAll(".faq-item").forEach(item => {
  const q = item.querySelector(".faq-q");
  q?.addEventListener("click", () => {
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(other => {
      if (other !== item) other.classList.remove("open");
    });
    item.classList.toggle("open", !wasOpen);
  });
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
