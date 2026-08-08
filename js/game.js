/* ============================================================
   SECRET SIPS CATCH — hidden easter-egg game
   Open it by triple-clicking the sun in the hero, or by typing
   "sips" anywhere on the page. Catch falling ice, soda,
   smoothies, and coffee in a Sips cup. Three misses ends it.
   ============================================================ */

(function () {
  "use strict";

  var CUP_W = 96;
  var CUP_H = 110;
  var ITEM_SIZE = 52;
  var LIVES = 3;
  var BEST_KEY = "sips-catch-best";

  var ITEMS = [
    {
      name: "ice",
      color: "#45d0e8",
      svg:
        '<svg viewBox="0 0 32 32" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="7" y="7" width="18" height="18" rx="4" fill="rgba(255,255,255,0.7)"/>' +
        '<path d="M11 15 L15 11" stroke="#fff"/></svg>',
    },
    {
      name: "soda",
      color: "#7ac943",
      svg:
        '<svg viewBox="0 0 32 32" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 11 L23 11 L21.5 26 Q21.3 27.5 19.8 27.5 L12.2 27.5 Q10.7 27.5 10.5 26 Z"/>' +
        '<path d="M14 11 L20 4"/><path d="M10 16 L22 16"/></svg>',
    },
    {
      name: "smoothie",
      color: "#ff6b6b",
      svg:
        '<svg viewBox="0 0 32 32" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M10 9 L22 9 L20.5 26 Q20.3 27.5 18.8 27.5 L13.2 27.5 Q11.7 27.5 11.5 26 Z"/>' +
        '<path d="M8 6 L24 6"/><path d="M15 9 L18 3"/>' +
        '<circle cx="14" cy="16" r="1" fill="#111"/><circle cx="18" cy="20" r="1" fill="#111"/></svg>',
    },
    {
      name: "coffee",
      color: "#c69063",
      svg:
        '<svg viewBox="0 0 32 32" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M7 11 L21 11 L20 26 Q19.8 27.5 18.3 27.5 L9.7 27.5 Q8.2 27.5 8 26 Z"/>' +
        '<path d="M21 14 L24 14 Q26 14 26 16.5 Q26 19 24 19 L20.6 19"/>' +
        '<path d="M11 5 Q11 7 13 8 M16 5 Q16 7 18 8"/></svg>',
    },
  ];

  var CUP_SVG =
    '<svg viewBox="0 0 96 110" fill="none">' +
    '<path d="M10 18 L86 18 L77 98 Q76 106 68 106 L28 106 Q20 106 19 98 Z" fill="#7ac943" stroke="#111" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M15 30 L81 30 L79.5 42 L16.5 42 Z" fill="#fff" opacity="0.35"/>' +
    '<text x="48" y="74" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="24" fill="#111">Sips</text>' +
    "</svg>";

  var game = null;

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function best() {
    try {
      return parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(score) {
    try {
      if (score > best()) localStorage.setItem(BEST_KEY, String(score));
    } catch (e) {
      /* private mode — no best score, no problem */
    }
  }

  /* ---------- Shared scoreboard (Cloudflare KV via the Worker) ---------- */

  var NAME_KEY = "sips-catch-name";

  function savedName() {
    try {
      return localStorage.getItem(NAME_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function rememberName(n) {
    try {
      localStorage.setItem(NAME_KEY, n);
    } catch (e) {
      /* ignore */
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fetchBoard() {
    return fetch("/scores", { headers: { accept: "application/json" } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  function submitScore(name, score) {
    return fetch("/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name, score: score }),
    })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  function boardHtml(board) {
    if (!board || !board.top || !board.top.length) {
      return '<p class="sc-empty">No scores yet — be the first!</p>';
    }
    var rows = board.top
      .map(function (e, i) {
        var rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1 + ".";
        return (
          '<li><span class="sc-rank">' +
          rank +
          '</span><span class="sc-name">' +
          escapeHtml(e.name) +
          '</span><span class="sc-pts">' +
          e.score +
          "</span></li>"
        );
      })
      .join("");
    return '<ol class="sc-board">' + rows + "</ol>";
  }

  function openGame() {
    if (game) return;
    var overlay = el("div", "sc-overlay");
    overlay.innerHTML =
      '<div class="sc-topbar">' +
      '<span class="sc-title display">Secret Sips Catch</span>' +
      '<span class="sc-score" data-sc-score>Score: 0</span>' +
      '<span class="sc-lives" data-sc-lives></span>' +
      '<button class="sc-close" aria-label="Close game">&times;</button>' +
      "</div>" +
      '<div class="sc-arena" data-sc-arena>' +
      '<div class="sc-cup" data-sc-cup>' + CUP_SVG + "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    game = {
      overlay: overlay,
      arena: overlay.querySelector("[data-sc-arena]"),
      cup: overlay.querySelector("[data-sc-cup]"),
      scoreEl: overlay.querySelector("[data-sc-score]"),
      livesEl: overlay.querySelector("[data-sc-lives]"),
      items: [],
      score: 0,
      lives: LIVES,
      cupX: 0,
      running: false,
      lastSpawn: 0,
      lastTime: 0,
      raf: 0,
      keys: {},
    };

    overlay.querySelector(".sc-close").addEventListener("click", closeGame);
    game.onKeyDown = function (e) {
      if (e.key === "Escape") {
        closeGame();
        return;
      }
      game.keys[e.key] = true;
    };
    game.onKeyUp = function (e) {
      game.keys[e.key] = false;
    };
    game.onPointerMove = function (e) {
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      moveCup(x - game.arena.getBoundingClientRect().left);
      if (e.touches) e.preventDefault();
    };
    document.addEventListener("keydown", game.onKeyDown);
    document.addEventListener("keyup", game.onKeyUp);
    game.arena.addEventListener("mousemove", game.onPointerMove);
    game.arena.addEventListener("touchmove", game.onPointerMove, { passive: false });

    game.cupX = game.arena.clientWidth / 2;
    positionCup();
    renderLives();
    fetchBoard().then(function (board) {
      var hi =
        board && board.high
          ? "<br><br>🏆 High score: <strong>" +
            board.high.score +
            "</strong> by " +
            escapeHtml(board.high.name)
          : "";
      showModal(
        "You found the secret stand!",
        "Catch the falling sips in your cup — move with your finger, mouse, or arrow keys. Miss three and the stand closes." +
          hi,
        "Start Catching"
      );
    });
  }

  function closeGame() {
    if (!game) return;
    cancelAnimationFrame(game.raf);
    document.removeEventListener("keydown", game.onKeyDown);
    document.removeEventListener("keyup", game.onKeyUp);
    game.overlay.remove();
    document.body.style.overflow = "";
    game = null;
  }

  function showModal(title, bodyHtml, buttonLabel) {
    var modal = el(
      "div",
      "sc-modal",
      '<div class="sc-card">' +
        '<h2 class="display">' + title + "</h2>" +
        "<p>" + bodyHtml + "</p>" +
        '<div class="sc-card-actions">' +
        '<button class="btn btn-lime" data-sc-start>' + buttonLabel + "</button>" +
        '<button class="btn" data-sc-exit>Back to the Site</button>' +
        "</div></div>"
    );
    game.overlay.appendChild(modal);
    modal.querySelector("[data-sc-start]").addEventListener("click", function () {
      modal.remove();
      startRound();
    });
    modal.querySelector("[data-sc-exit]").addEventListener("click", closeGame);
  }

  function startRound() {
    game.score = 0;
    game.lives = LIVES;
    game.items.forEach(function (item) {
      item.node.remove();
    });
    game.items = [];
    game.running = true;
    game.lastSpawn = 0;
    game.lastTime = 0;
    updateScore();
    renderLives();
    game.raf = requestAnimationFrame(tick);
  }

  function updateScore() {
    game.scoreEl.textContent = "Score: " + game.score;
  }

  function renderLives() {
    var html = "";
    for (var i = 0; i < LIVES; i++) {
      html +=
        '<svg class="sc-life' + (i < game.lives ? "" : " lost") + '" viewBox="0 0 64 64" fill="currentColor">' +
        '<path d="M32 54 C10 40 6 24 14 16 C21 9 30 13 32 20 C34 13 43 9 50 16 C58 24 54 40 32 54 Z"/></svg>';
    }
    game.livesEl.innerHTML = html;
  }

  function moveCup(x) {
    if (!game) return;
    var w = game.arena.clientWidth;
    game.cupX = Math.max(CUP_W / 2, Math.min(w - CUP_W / 2, x));
    positionCup();
  }

  function positionCup() {
    game.cup.style.transform = "translateX(" + (game.cupX - CUP_W / 2) + "px)";
  }

  function spawnItem() {
    var spec = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    var node = el("div", "sc-item", spec.svg);
    node.style.background = spec.color;
    var x = ITEM_SIZE / 2 + Math.random() * (game.arena.clientWidth - ITEM_SIZE);
    node.style.left = x - ITEM_SIZE / 2 + "px";
    game.arena.appendChild(node);
    game.items.push({ node: node, x: x, y: -ITEM_SIZE, wobble: Math.random() * Math.PI * 2 });
  }

  function tick(now) {
    if (!game || !game.running) return;
    if (!game.lastTime) game.lastTime = now;
    var dt = Math.min((now - game.lastTime) / 1000, 0.05);
    game.lastTime = now;

    /* difficulty ramps with score */
    var fallSpeed = 150 + Math.min(game.score * 9, 330);
    var spawnEvery = Math.max(900 - game.score * 14, 420);

    if (game.keys.ArrowLeft) moveCup(game.cupX - 460 * dt);
    if (game.keys.ArrowRight) moveCup(game.cupX + 460 * dt);

    if (!game.lastSpawn || now - game.lastSpawn > spawnEvery) {
      game.lastSpawn = now;
      spawnItem();
    }

    var arenaH = game.arena.clientHeight;
    var catchTop = arenaH - CUP_H - 8;
    for (var i = game.items.length - 1; i >= 0; i--) {
      var item = game.items[i];
      item.y += fallSpeed * dt;
      item.wobble += dt * 3;
      var drawX = item.x + Math.sin(item.wobble) * 6 - ITEM_SIZE / 2;
      item.node.style.transform = "translate(" + (drawX - (item.x - ITEM_SIZE / 2)) + "px," + item.y + "px)";

      var bottom = item.y + ITEM_SIZE;
      if (bottom >= catchTop + 14 && bottom <= catchTop + CUP_H * 0.7 && Math.abs(item.x - game.cupX) < CUP_W * 0.52) {
        /* caught! */
        game.score++;
        updateScore();
        item.node.classList.add("sc-caught");
        (function (node) {
          setTimeout(function () {
            node.remove();
          }, 240);
        })(item.node);
        game.items.splice(i, 1);
      } else if (item.y > arenaH) {
        /* missed */
        item.node.remove();
        game.items.splice(i, 1);
        game.lives--;
        renderLives();
        if (game.lives <= 0) {
          endRound();
          return;
        }
      }
    }

    game.raf = requestAnimationFrame(tick);
  }

  function endRound() {
    game.running = false;
    cancelAnimationFrame(game.raf);
    saveBest(game.score);
    var score = game.score;

    var modal = el("div", "sc-modal");
    var card = el("div", "sc-card");
    modal.appendChild(card);
    game.overlay.appendChild(modal);

    card.innerHTML =
      '<h2 class="display">The stand is closed!</h2>' +
      "<p>You caught <strong>" + score + "</strong> sips.</p>" +
      "<div data-sc-prize></div>" +
      "<div data-sc-entry></div>" +
      '<div class="sc-board-wrap" data-sc-boardwrap><p class="sc-loading">Loading scoreboard…</p></div>' +
      '<div class="sc-card-actions">' +
      '<button class="btn btn-lime" data-sc-again>Play Again</button>' +
      '<button class="btn" data-sc-exit>Back to the Site</button>' +
      "</div>";

    card.querySelector("[data-sc-again]").addEventListener("click", function () {
      modal.remove();
      startRound();
    });
    card.querySelector("[data-sc-exit]").addEventListener("click", closeGame);

    var boardWrap = card.querySelector("[data-sc-boardwrap]");
    var entryWrap = card.querySelector("[data-sc-entry]");
    var prizeWrap = card.querySelector("[data-sc-prize]");

    function renderBoard(board) {
      boardWrap.innerHTML = '<h3 class="sc-board-title">Scoreboard</h3>' + boardHtml(board);
    }

    if (score <= 0) {
      entryWrap.innerHTML = "<p>The ice was slippery — try another round!</p>";
      fetchBoard().then(renderBoard);
      return;
    }

    entryWrap.innerHTML =
      '<label class="sc-entry-label">Add your name to the scoreboard:</label>' +
      '<div class="sc-entry-row">' +
      '<input class="sc-name-input" maxlength="16" placeholder="Your name" value="' +
      escapeHtml(savedName()) +
      '" />' +
      '<button class="btn btn-yellow" data-sc-submit>Submit</button>' +
      "</div>";
    fetchBoard().then(renderBoard);

    var submitBtn = entryWrap.querySelector("[data-sc-submit]");
    var input = entryWrap.querySelector(".sc-name-input");
    input.focus();

    function doSubmit() {
      var name = (input.value || "").trim() || "Anonymous";
      rememberName(name);
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";
      submitScore(name, score).then(function (res) {
        if (!res) {
          entryWrap.innerHTML =
            '<p class="sc-err">Couldn\'t reach the scoreboard — check your connection and try again.</p>';
          return;
        }
        entryWrap.innerHTML =
          '<p class="sc-saved">Saved! You\'re #' + (res.rank || "?") + " on the board.</p>";
        renderBoard(res);
        if (res.isHighScore) {
          prizeWrap.innerHTML =
            '<div class="sc-prize">🏆 NEW HIGH SCORE!<br>Show this screen at the window for a <strong>free drink</strong>!' +
            '<span class="sc-prize-date">' +
            new Date().toLocaleDateString() +
            "</span></div>";
        }
      });
    }

    submitBtn.addEventListener("click", doSubmit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        doSubmit();
      }
    });
  }

  /* ---------- Hidden triggers ---------- */

  function arm() {
    var sun = document.querySelector(".hero-sticker");
    if (sun) {
      var clicks = 0;
      var timer;
      sun.addEventListener("click", function () {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(function () {
          clicks = 0;
        }, 1200);
        if (clicks >= 3) {
          clicks = 0;
          openGame();
        }
      });
    }
    var buffer = "";
    document.addEventListener("keydown", function (e) {
      if (game || !e.key || e.key.length !== 1) return;
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      buffer = (buffer + e.key.toLowerCase()).slice(-4);
      if (buffer === "sips") {
        buffer = "";
        openGame();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arm);
  } else {
    arm();
  }
})();
