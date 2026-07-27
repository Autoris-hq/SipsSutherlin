/* ============================================================
   SUTHERLIN SIPS — shared scripts
   Injects the small SVG sprite (logo cup, icons, doodles),
   wires the mobile nav, scroll reveal, and the missing-photo
   fallback state for .photo-frame containers.
   ============================================================ */

(function () {
  "use strict";

  var SPRITE =
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    /* Logo cup — the "i" of the Sips wordmark */
    '<symbol id="logo-cup" viewBox="0 0 60 106">' +
    '<rect x="34" y="0" width="9" height="34" rx="4.5" transform="rotate(18 38 10)" fill="#7ac943"/>' +
    '<circle cx="49" cy="6" r="6" fill="#7ac943"/>' +
    '<path d="M8 34 L52 34 L45 98 Q44 104 37 104 L23 104 Q16 104 15 98 Z" fill="#7ac943"/>' +
    '<path d="M12 42 L48 42 L47 52 L13 52 Z" fill="#ffffff" opacity="0.35"/>' +
    "</symbol>" +
    /* Brush underline */
    '<symbol id="brush" viewBox="0 0 240 20" preserveAspectRatio="none">' +
    '<path d="M4 13 C60 5 180 3 236 9 C190 11 70 15 10 17 Z" fill="currentColor"/>' +
    "</symbol>" +
    /* Line-art sun, matching the banner artwork */
    '<symbol id="sun-line" viewBox="0 0 90 90" fill="none" stroke="#ffc83d" stroke-width="4" stroke-linecap="round">' +
    '<circle cx="45" cy="45" r="16"/>' +
    '<path d="M45 8 L45 18 M71 19 L64 26 M82 45 L72 45 M71 71 L64 64 M45 82 L45 72 M19 71 L26 64 M8 45 L18 45 M19 19 L26 26"/>' +
    "</symbol>" +
    /* Category icons — line style */
    '<symbol id="icon-soda" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M8 10 L24 10 L22 27 Q21.8 29 20 29 L12 29 Q10.2 29 10 27 Z"/>' +
    '<path d="M13 10 L20 3"/>' +
    '<path d="M9 16 L23 16"/>' +
    "</symbol>" +
    '<symbol id="icon-smoothie" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M9 8 L23 8 L21 28 Q20.8 29.5 19 29.5 L13 29.5 Q11.2 29.5 11 28 Z"/>' +
    '<path d="M7 5 L25 5"/>' +
    '<path d="M14 8 L18 2"/>' +
    '<circle cx="14" cy="17" r="1.2" fill="currentColor"/>' +
    '<circle cx="18.5" cy="21" r="1.2" fill="currentColor"/>' +
    '<circle cx="15" cy="24" r="1.2" fill="currentColor"/>' +
    "</symbol>" +
    '<symbol id="icon-bowl" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 15 L28 15 Q28 24 21 27 L11 27 Q4 24 4 15 Z"/>' +
    '<circle cx="11" cy="10" r="2"/>' +
    '<circle cx="17" cy="8" r="2"/>' +
    '<circle cx="22.5" cy="11" r="2"/>' +
    "</symbol>" +
    '<symbol id="icon-coffee" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M6 11 L22 11 L21 27 Q20.8 29 19 29 L9 29 Q7.2 29 7 27 Z"/>' +
    '<path d="M22 14 L26 14 Q28 14 28 17 Q28 20 26 20 L21.5 20"/>' +
    '<path d="M11 4 Q11 6 13 7 M17 4 Q17 6 19 7"/>' +
    "</symbol>" +
    /* Visit icons */
    '<symbol id="icon-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 21 C7 15.4 4 11.8 4 8.6 C4 4.4 7.6 2 12 2 C16.4 2 20 4.4 20 8.6 C20 11.8 17 15.4 12 21 Z"/>' +
    '<circle cx="12" cy="9" r="2.6"/>' +
    "</symbol>" +
    '<symbol id="icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="9"/>' +
    '<path d="M12 7 L12 12 L15.5 14"/>' +
    "</symbol>" +
    '<symbol id="icon-car" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 16 L4 11 L6 6 L18 6 L20 11 L20 16"/>' +
    '<path d="M2 16 L22 16"/>' +
    '<circle cx="7.5" cy="16.5" r="1.8"/>' +
    '<circle cx="16.5" cy="16.5" r="1.8"/>' +
    '<path d="M4 11 L20 11"/>' +
    "</symbol>" +
    '<symbol id="icon-megaphone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 10 L3 14 L6 14 L13 19 L13 5 L6 10 Z"/>' +
    '<path d="M17 9 Q19 12 17 15 M19.5 6.5 Q23 12 19.5 17.5"/>' +
    "</symbol>" +
    /* Social icons */
    '<symbol id="icon-facebook" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M13.5 21 L13.5 13.5 L16 13.5 L16.5 10.5 L13.5 10.5 L13.5 8.6 C13.5 7.7 14 7 15.2 7 L16.6 7 L16.6 4.2 C16.6 4.2 15.4 4 14.2 4 C11.7 4 10 5.5 10 8.3 L10 10.5 L7.4 10.5 L7.4 13.5 L10 13.5 L10 21 Z"/>' +
    "</symbol>" +
    '<symbol id="icon-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/>' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>' +
    "</symbol>" +
    '<symbol id="icon-tiktok" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M16.6 3 C16.9 5.2 18.3 6.6 20.5 6.9 L20.5 9.9 C19.1 9.9 17.8 9.5 16.7 8.8 L16.7 15.5 C16.7 19 14.2 21.2 11.1 21.2 C8 21.2 5.5 19 5.5 15.8 C5.5 12.7 7.9 10.5 11 10.5 C11.4 10.5 11.8 10.5 12.1 10.6 L12.1 13.7 C11.8 13.6 11.4 13.5 11.1 13.5 C9.7 13.5 8.6 14.5 8.6 15.9 C8.6 17.3 9.7 18.3 11.1 18.3 C12.6 18.3 13.6 17.3 13.6 15.7 L13.6 3 Z"/>' +
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
      nav.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    /* Header logo: fall back to the text wordmark until assets/brand/logo.png exists */
    var logoImg = document.querySelector(".logo .logo-img");
    if (logoImg) {
      var logoLink = logoImg.closest(".logo");
      var markLogoMissing = function () {
        logoLink.classList.add("logo-missing");
      };
      if (logoImg.complete && logoImg.naturalWidth === 0) {
        markLogoMissing();
      } else {
        logoImg.addEventListener("error", markLogoMissing);
      }
    }

    /* Missing-photo fallback: mark frames whose image hasn't been added yet */
    document.querySelectorAll(".photo-frame img").forEach(function (img) {
      var frame = img.closest(".photo-frame");
      function markMissing() {
        frame.classList.add("missing");
      }
      if (img.complete && img.naturalWidth === 0) {
        markMissing();
      } else {
        img.addEventListener("error", markMissing);
        img.addEventListener("load", function () {
          frame.classList.remove("missing");
        });
      }
    });

    /* Missing-video fallback: mark the frame only when NO source is playable */
    document.querySelectorAll(".video-frame video").forEach(function (video) {
      var frame = video.closest(".video-frame");
      var section = video.closest(".video-section");
      video.addEventListener(
        "error",
        function () {
          if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            frame.classList.add("missing");
            if (section) {
              section.classList.add("hidden");
            }
          }
        },
        true
      );
      video.addEventListener("loadedmetadata", function () {
        frame.classList.remove("missing");
        if (section) {
          section.classList.remove("hidden");
        }
      });
    });

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
