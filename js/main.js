/* ============================================================
   SIPS — shared scripts
   Injects the SVG sprite (cups, icons, illustrations), wires up
   the mobile nav toggle and the scroll-reveal animation.
   ============================================================ */

(function () {
  "use strict";

  var SPRITE =
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    /* ---- Drink cup (colors via --liquid / --straw CSS vars) ---- */
    '<symbol id="cup" viewBox="0 0 140 210">' +
    '<rect x="86" y="2" width="12" height="66" rx="6" transform="rotate(16 92 20)" fill="var(--straw,#7ac943)"/>' +
    '<path d="M26 56 L114 56 L103 194 Q102 204 91 204 L49 204 Q38 204 37 194 Z" fill="var(--liquid,#45d0e8)"/>' +
    '<path d="M30 60 L44 60 L40 200 Q34 198 33 192 Z" fill="#ffffff" opacity="0.3"/>' +
    '<rect x="46" y="70" width="24" height="24" rx="5" transform="rotate(-12 58 82)" fill="#ffffff" opacity="0.4"/>' +
    '<rect x="80" y="86" width="22" height="22" rx="5" transform="rotate(18 91 97)" fill="#ffffff" opacity="0.38"/>' +
    '<rect x="56" y="150" width="22" height="22" rx="5" transform="rotate(-20 67 161)" fill="#ffffff" opacity="0.32"/>' +
    '<rect x="86" y="160" width="18" height="18" rx="4" transform="rotate(10 95 169)" fill="#ffffff" opacity="0.3"/>' +
    '<circle cx="52" cy="120" r="4" fill="#ffffff" opacity="0.5"/>' +
    '<circle cx="92" cy="132" r="3" fill="#ffffff" opacity="0.5"/>' +
    '<circle cx="72" cy="180" r="3" fill="#ffffff" opacity="0.45"/>' +
    '<rect x="22" y="48" width="96" height="12" rx="6" fill="#ffffff" opacity="0.9"/>' +
    '<text x="70" y="138" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="30" letter-spacing="-1" fill="#111111">Sips</text>' +
    "</symbol>" +
    /* ---- Logo cup (the "i" of the wordmark) ---- */
    '<symbol id="logo-cup" viewBox="0 0 60 106">' +
    '<rect x="34" y="0" width="9" height="34" rx="4.5" transform="rotate(18 38 10)" fill="#7ac943"/>' +
    '<circle cx="49" cy="6" r="6" fill="#7ac943"/>' +
    '<path d="M8 34 L52 34 L45 98 Q44 104 37 104 L23 104 Q16 104 15 98 Z" fill="#7ac943"/>' +
    '<path d="M12 42 L48 42 L47 52 L13 52 Z" fill="#ffffff" opacity="0.35"/>' +
    "</symbol>" +
    /* ---- Hand-drawn style icons ---- */
    '<symbol id="icon-face" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="32" cy="36" r="20"/>' +
    '<path d="M14 30 Q18 12 32 14 Q48 10 50 30"/>' +
    '<path d="M22 16 L20 8 M32 14 L32 5 M42 16 L44 8"/>' +
    '<circle cx="25" cy="36" r="1.6" fill="currentColor"/>' +
    '<circle cx="39" cy="36" r="1.6" fill="currentColor"/>' +
    '<path d="M25 45 Q32 51 39 45"/>' +
    "</symbol>" +
    '<symbol id="icon-sun" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="32" cy="32" r="13"/>' +
    '<path d="M32 8 L32 3 M49 15 L53 11 M56 32 L61 32 M49 49 L53 53 M32 56 L32 61 M15 49 L11 53 M8 32 L3 32 M15 15 L11 11"/>' +
    '<circle cx="27" cy="30" r="1.4" fill="currentColor"/>' +
    '<circle cx="37" cy="30" r="1.4" fill="currentColor"/>' +
    '<path d="M27 36 Q32 40 37 36"/>' +
    "</symbol>" +
    '<symbol id="icon-heart" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M32 54 C10 40 6 24 14 16 C21 9 30 13 32 20 C34 13 43 9 50 16 C58 24 54 40 32 54 Z"/>' +
    "</symbol>" +
    '<symbol id="icon-leaf" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M50 12 C28 14 12 26 12 44 C12 48 14 52 16 54 C34 54 50 40 52 14 Z"/>' +
    '<path d="M16 52 C24 40 34 30 46 20"/>' +
    "</symbol>" +
    '<symbol id="icon-sparkle" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">' +
    '<path d="M6 20 L16 20 M22 8 L30 4 M22 32 L30 36"/>' +
    "</symbol>" +
    '<symbol id="icon-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 21 C7 15.4 4 11.8 4 8.6 C4 4.4 7.6 2 12 2 C16.4 2 20 4.4 20 8.6 C20 11.8 17 15.4 12 21 Z"/>' +
    '<circle cx="12" cy="9" r="2.6"/>' +
    "</symbol>" +
    '<symbol id="icon-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M5 3 L9 3 L11 8 L8.5 10 C9.5 12.5 11.5 14.5 14 15.5 L16 13 L21 15 L21 19 C21 20 20 21 19 21 C10 20.5 3.5 14 3 5 C3 4 4 3 5 3 Z"/>' +
    "</symbol>" +
    '<symbol id="icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="9"/>' +
    '<path d="M12 7 L12 12 L15.5 14"/>' +
    "</symbol>" +
    '<symbol id="icon-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="5" width="18" height="14" rx="2"/>' +
    '<path d="M3 7 L12 13 L21 7"/>' +
    "</symbol>" +
    '<symbol id="icon-facebook" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M13.5 21 L13.5 13.5 L16 13.5 L16.5 10.5 L13.5 10.5 L13.5 8.6 C13.5 7.7 14 7 15.2 7 L16.6 7 L16.6 4.2 C16.6 4.2 15.4 4 14.2 4 C11.7 4 10 5.5 10 8.3 L10 10.5 L7.4 10.5 L7.4 13.5 L10 13.5 L10 21 Z"/>' +
    "</symbol>" +
    '<symbol id="icon-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/>' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>' +
    "</symbol>" +
    /* ---- Doodles ---- */
    '<symbol id="sun-doodle" viewBox="0 0 80 80">' +
    '<g stroke="#ffc83d" stroke-width="5" stroke-linecap="round">' +
    '<path d="M40 6 L40 0 M63 17 L68 12 M74 40 L80 40 M63 63 L68 68 M40 74 L40 80 M17 63 L12 68 M6 40 L0 40 M17 17 L12 12"/>' +
    "</g>" +
    '<circle cx="40" cy="40" r="22" fill="#ffc83d"/>' +
    '<circle cx="33" cy="37" r="2.4" fill="#111111"/>' +
    '<circle cx="47" cy="37" r="2.4" fill="#111111"/>' +
    '<path d="M32 46 Q40 53 48 46" fill="none" stroke="#111111" stroke-width="3" stroke-linecap="round"/>' +
    "</symbol>" +
    '<symbol id="palm-leaf" viewBox="0 0 200 220" fill="none" stroke="#4caf50" stroke-width="6" stroke-linecap="round">' +
    '<path d="M100 210 C95 150 95 90 110 20"/>' +
    '<path d="M108 40 C80 30 55 35 35 55 M110 70 C85 65 60 72 45 90 M106 105 C85 102 65 110 52 128"/>' +
    '<path d="M108 40 C135 28 160 32 178 50 M109 70 C135 62 158 68 172 85 M107 105 C128 100 148 108 160 125"/>' +
    "</symbol>" +
    /* ---- Brush underline ---- */
    '<symbol id="brush" viewBox="0 0 240 20" preserveAspectRatio="none">' +
    '<path d="M4 13 C60 5 180 3 236 9 C190 11 70 15 10 17 Z" fill="currentColor"/>' +
    "</symbol>" +
    /* ---- Torn paper edge ---- */
    '<symbol id="torn" viewBox="0 0 1200 40" preserveAspectRatio="none">' +
    '<path d="M0 40 L0 18 L48 27 L96 12 L150 25 L204 10 L258 23 L312 13 L366 27 L420 14 L474 25 L528 10 L582 21 L636 12 L690 27 L744 14 L798 25 L852 10 L906 23 L960 13 L1014 25 L1068 12 L1122 24 L1200 16 L1200 40 Z" fill="currentColor"/>' +
    "</symbol>" +
    /* ---- Storefront illustration ---- */
    '<symbol id="storefront" viewBox="0 0 640 400">' +
    '<rect width="640" height="400" fill="#dff0fa"/>' +
    '<circle cx="560" cy="60" r="34" fill="#ffc83d"/>' +
    '<g stroke="#ffc83d" stroke-width="6" stroke-linecap="round">' +
    '<path d="M560 8 L560 -2 M600 20 L608 12 M614 60 L626 60 M600 100 L608 108"/>' +
    "</g>" +
    '<rect y="300" width="640" height="100" fill="#cfcfc6"/>' +
    '<rect y="296" width="640" height="10" fill="#b9b9af"/>' +
    '<rect x="0" y="270" width="640" height="30" fill="#8fd94f"/>' +
    '<rect x="120" y="120" width="300" height="160" rx="6" fill="#7ac943"/>' +
    '<rect x="112" y="108" width="316" height="20" rx="6" fill="#4caf50"/>' +
    '<rect x="150" y="160" width="90" height="80" rx="4" fill="#f7f7f2"/>' +
    '<rect x="150" y="160" width="90" height="80" rx="4" fill="none" stroke="#111111" stroke-width="4"/>' +
    '<rect x="300" y="160" width="70" height="120" rx="4" fill="#111111"/>' +
    '<circle cx="312" cy="222" r="4" fill="#f7f7f2"/>' +
    '<text x="195" y="150" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="26" fill="#111111">Sips</text>' +
    '<rect x="484" y="120" width="14" height="180" fill="#111111"/>' +
    '<rect x="446" y="60" width="90" height="64" rx="10" fill="#ffc83d"/>' +
    '<text x="491" y="104" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="34" fill="#111111">Sips</text>' +
    '<ellipse cx="80" cy="290" rx="52" ry="34" fill="#4caf50"/>' +
    '<ellipse cx="470" cy="292" rx="44" ry="28" fill="#4caf50"/>' +
    '<ellipse cx="560" cy="296" rx="40" ry="26" fill="#9b7fd4"/>' +
    '<ellipse cx="260" cy="294" rx="34" ry="20" fill="#8fd94f"/>' +
    "</symbol>" +
    "</svg>";

  function init() {
    var mount = document.createElement("div");
    mount.innerHTML = SPRITE;
    document.body.insertBefore(mount.firstChild, document.body.firstChild);

    /* Mobile nav */
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    /* Scroll reveal */
    var revealed = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealed.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealed.forEach(function (el) {
        el.classList.add("visible");
      });
    }

    /* Footer year */
    var year = document.querySelector("[data-year]");
    if (year) {
      year.textContent = new Date().getFullYear();
    }

    /* Contact form (static site — no backend) */
    var form = document.querySelector("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = form.querySelector(".form-note");
        if (note) {
          note.textContent =
            "Thanks! Your message is ready — this demo form doesn't send yet, so email us at hello@sipsdrinks.com and we'll get right back to you.";
          note.style.color = "#4caf50";
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
