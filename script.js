// Supreme — Brand Studio interactions
(() => {
  document.documentElement.classList.remove("no-js");
  const $ =(s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Footer year
  $("#year").textContent = new Date().getFullYear();

  // Sticky header style on scroll
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const setNav = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    // <html> is the page scroller, so lock scrolling there while the menu is open
    document.documentElement.style.overflow = open ? "hidden" : "";
  };

  // "Back to top" / logo: always scroll to the very top, and clean the URL hash
  $$('a[href="#top"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      setNav(false);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      history.replaceState(null, "", location.pathname + location.search);
    })
  );
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));

  // Reveal on scroll + stat counters
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          const counter = $(".stat-num", entry.target);
          if (counter) animateCount(counter);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      io.observe(el);
    });
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
    $$(".stat-num").forEach((el) => (el.textContent = el.dataset.count));
  }

  // Work filters
  const filters = $$(".filter");
  const cards = $$(".work-card");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      const f = btn.dataset.filter;
      cards.forEach((card) => {
        const show = f === "all" || card.dataset.category === f;
        card.classList.toggle("is-hidden", !show);
        // filtered views look better without the wide layout
        card.style.gridColumn = f === "all" ? "" : "auto";
      });
    })
  );

  // Testimonial slider
  const slider = $("#slider");
  const track = $(".testimonial-track", slider);
  const slides = $$(".testimonial", slider);
  const dotsWrap = $(".slider-dots", slider);
  let index = 0;
  let timer;

  const dots = slides.map((_, i) => {
    const d = document.createElement("button");
    d.setAttribute("role", "tab");
    d.setAttribute("aria-label", `Testimonial ${i + 1}`);
    d.addEventListener("click", () => go(i, true));
    dotsWrap.appendChild(d);
    return d;
  });

  function go(i, user = false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, j) => d.setAttribute("aria-selected", String(j === index)));
    slides.forEach((s, j) => s.setAttribute("aria-hidden", String(j !== index)));
    if (user) restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 6000);
  }
  $$(".slider-btn", slider).forEach((b) =>
    b.addEventListener("click", () => go(index + Number(b.dataset.dir), true))
  );
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", restart);
  go(0);
  restart();

  // Contact form (front-end validation only — connect to a backend/form service to send)
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    $$("input[required], textarea[required]", form).forEach((input) => {
      const ok = input.type === "email"
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
        : input.value.trim().length > 0;
      input.closest(".field").classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) valid = false;
    });

    status.className = "form-status";
    if (!valid) {
      status.textContent = "Please fill in your name, a valid email and a short message.";
      status.classList.add("is-error");
      return;
    }

    const name = form.elements.namedItem("name").value.trim().split(" ")[0];
    status.textContent = `Thanks ${name}! We'll be in touch within one business day.`;
    status.classList.add("is-success");
    form.reset();
  });
})();
