(() => {
    "use strict";
  
    document.documentElement.classList.add("js-enabled");
  
    const body = document.body;
    const menuToggle = document.getElementById("menuToggle");
    const mainMenu = document.getElementById("mainMenu");
    const navLinks = [...document.querySelectorAll(".nav-link")];
    const progressBar = document.getElementById("progressBar");
    const presentationToggle = document.getElementById("presentationToggle");
    const presentationHint = document.getElementById("presentationHint");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observedSections = ["home", "percorso", "auriga", "competenze", "riflessione"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const slideSections = [...document.querySelectorAll("main > section")];
  
    function closeMenu() {
      if (!menuToggle || !mainMenu) return;
      menuToggle.setAttribute("aria-expanded", "false");
      mainMenu.classList.remove("is-open");
    }
  
    if (menuToggle && mainMenu) {
      menuToggle.addEventListener("click", () => {
        const opening = menuToggle.getAttribute("aria-expanded") !== "true";
        menuToggle.setAttribute("aria-expanded", String(opening));
        mainMenu.classList.toggle("is-open", opening);
      });
  
      navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  
      document.addEventListener("click", (event) => {
        if (!mainMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
      });
    }
  
    function updateProgress() {
      if (!progressBar) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  
    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.dataset.section === entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      }, {
        rootMargin: "-35% 0px -52% 0px",
        threshold: 0
      });
  
      observedSections.forEach((section) => sectionObserver.observe(section));
  
      if (!reducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: "0px 0px -10% 0px",
          threshold: 0.08
        });
  
        document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
      } else {
        document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
      }
    } else {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    }
  
    function setPresentationMode(enabled) {
      body.classList.toggle("presentation-mode", enabled);
      if (presentationToggle) {
        presentationToggle.setAttribute("aria-pressed", String(enabled));
        const text = presentationToggle.querySelector("span");
        if (text) text.textContent = enabled ? "Esci dalla presentazione" : "Modalità presentazione";
      }
      if (presentationHint) {
        presentationHint.setAttribute("aria-hidden", String(!enabled));
      }
    }
  
    if (presentationToggle) {
      presentationToggle.addEventListener("click", () => {
        setPresentationMode(!body.classList.contains("presentation-mode"));
      });
    }
  
    function activeSlideIndex() {
      const marker = window.scrollY + window.innerHeight * 0.38;
      let current = 0;
      slideSections.forEach((section, index) => {
        if (section.offsetTop <= marker) current = index;
      });
      return current;
    }
  
    function goToSlide(index) {
      const target = slideSections[Math.max(0, Math.min(slideSections.length - 1, index))];
      if (!target) return;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }
  
    document.addEventListener("keydown", (event) => {
      const tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  
      if (event.key === "Escape") {
        closeMenu();
        if (body.classList.contains("presentation-mode")) setPresentationMode(false);
        return;
      }
  
      if (!body.classList.contains("presentation-mode")) return;
  
      if (["ArrowDown", "PageDown", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        goToSlide(activeSlideIndex() + 1);
      }
  
      if (["ArrowUp", "PageUp", "ArrowLeft"].includes(event.key)) {
        event.preventDefault();
        goToSlide(activeSlideIndex() - 1);
      }
  
      if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      }
  
      if (event.key === "End") {
        event.preventDefault();
        goToSlide(slideSections.length - 1);
      }
    });
  })();
  