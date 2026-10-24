const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icons = () => { if (window.lucide) window.lucide.createIcons(); };

function initTheme() {
  const btn = $("#theme-btn"), root = document.documentElement;
  const sync = () => btn.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  sync();
  btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    sync();
  });
}

function initNav() {
  const header = $("#site-header"), btn = $("#menu-btn"), menu = $("#mobile-menu");
  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("open", open);
    header.classList.toggle("scrolled", open || window.scrollY > 10);
  };
  btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  $$(".mobile-link").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#lightbox").open) setOpen(false); });
  window.addEventListener("resize", () => { if (window.innerWidth >= 768) setOpen(false); });
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10 || menu.classList.contains("open"));
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  const links = $$(".nav-link");
  const map = { about: "about", projects: "projects", experience: "experience", contact: "contact" };
  if ("IntersectionObserver" in window && document.getElementById("projects")) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + map[en.target.id]));
    }), { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
}

function initLightbox() {
  const dlg = $("#lightbox"), img = $("#lb-img"), cap = $("#lb-cap"), count = $("#lb-count");
  let items = [], idx = 0;
  const show = () => {
    const a = items[idx];
    img.src = a.getAttribute("href");
    img.alt = a.querySelector("img")?.alt || "";
    cap.textContent = a.dataset.caption || "";
    count.textContent = items.length > 1 ? `${idx + 1} / ${items.length}` : "";
    $("#lb-prev").hidden = $("#lb-next").hidden = items.length < 2;
  };
  $$("a.zoom[data-gallery]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    items = $$(`a.zoom[data-gallery="${a.dataset.gallery}"]`);
    idx = items.indexOf(a); show(); dlg.showModal();
  }));
  const step = (d) => { idx = (idx + d + items.length) % items.length; show(); };
  $("#lb-prev").addEventListener("click", () => step(-1));
  $("#lb-next").addEventListener("click", () => step(1));
  $("#lb-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target === dlg.firstElementChild) dlg.close(); });
  dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); });
  let x0 = null;
  dlg.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  });
}

function initVideos() {
  $$("a.yt[data-yt]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const wrap = document.createElement("div");
    wrap.className = "relative overflow-hidden bg-black";
    wrap.style.aspectRatio = a.dataset.vertical ? "9 / 16" : "16 / 9";
    wrap.innerHTML = `<iframe class="absolute inset-0 h-full w-full" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(a.dataset.yt)}?autoplay=1&rel=0" title="Project video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    a.replaceWith(wrap);
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  initTheme(); initNav(); initLightbox(); initVideos(); icons();
});
