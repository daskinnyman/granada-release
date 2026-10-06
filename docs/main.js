// Granada landing page: parallax, the pipeline schematic, tabs and copy buttons.
// The page reads in full without this script.
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var NS = "http://www.w3.org/2000/svg";

  // Stars: a seeded pattern so every load looks the same.
  var stars = document.getElementById("stars");
  if (stars) {
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var out = "";
    for (var i = 0; i < 190; i++) {
      var x = rnd() * 1440, y = rnd() * 900;
      if (rnd() < 0.07) {
        out += '<path d="M' + (x - 4) + " " + y + "h8M" + x + " " + (y - 4) + 'v8" stroke="#7cc8ff" stroke-width=".6" opacity=".7"/>';
      } else {
        out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (rnd() < 0.1 ? 1.4 : 0.7) + '" fill="#cfe9ff" opacity="' + (0.3 + rnd() * 0.6).toFixed(2) + '"/>';
      }
    }
    stars.innerHTML = out;
  }

  // Pipeline schematic, built from the station list in the page.
  var schem = document.getElementById("schem");
  var list = document.getElementById("feature-stations");
  var svg = null, flow = null, nodes = [], flowLen = 0, perRow = 0;
  var ST = list ? Array.prototype.map.call(list.children, function (li) {
    return { n: li.textContent.trim(), k: li.getAttribute("data-k"), h: li.hasAttribute("data-h"), off: li.hasAttribute("data-off") };
  }) : [];

  function rowsFor(width) { return width < 520 ? 2 : width < 860 ? 4 : 7; }

  function buildPipeline() {
    if (!schem || !ST.length) return;
    var want = rowsFor(schem.clientWidth);
    if (want === perRow) return;
    perRow = want;
    if (svg) svg.remove();
    var w = 130, h = 44, gx = 24, gy = 40, x0 = 2, y0 = 2;
    var rows = Math.ceil(ST.length / perRow);
    var W = x0 * 2 + perRow * w + (perRow - 1) * gx, H = y0 * 2 + rows * h + (rows - 1) * gy;
    svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("aria-hidden", "true");
    var pts = ST.map(function (s, i) {
      var row = Math.floor(i / perRow), col = i % perRow;
      var c = row % 2 ? perRow - 1 - col : col;
      return [x0 + c * (w + gx), y0 + row * (h + gy)];
    });
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + (p[0] + w / 2) + " " + (p[1] + h / 2); }).join("");
    var pipe = document.createElementNS(NS, "path");
    pipe.setAttribute("d", d); pipe.setAttribute("class", "pipe"); svg.appendChild(pipe);
    flow = document.createElementNS(NS, "path");
    flow.setAttribute("d", d); flow.setAttribute("class", "flowline"); svg.appendChild(flow);
    nodes = ST.map(function (s, i) {
      var x = pts[i][0], y = pts[i][1];
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "node " + s.k + (s.h ? " human" : "") + (s.off ? " off" : ""));
      g.innerHTML = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>' +
        '<text class="idx" x="' + (x + 8) + '" y="' + (y + 14) + '">' + String(i + 1).padStart(2, "0") + " · " + s.k + (s.off ? " · off" : "") + "</text>" +
        '<text x="' + (x + 8) + '" y="' + (y + 33) + '">' + s.n + "</text>" +
        (s.h ? '<circle cx="' + (x + w - 10) + '" cy="' + (y + 10) + '" r="4"/>' : "");
      svg.appendChild(g);
      return g;
    });
    schem.appendChild(svg);
    schem.classList.add("built");
    flowLen = flow.getTotalLength();
    flow.style.strokeDasharray = flowLen;
    update();
  }

  // Scroll-driven effects.
  var layers = Array.prototype.slice.call(document.querySelectorAll(".layer"));
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".bp"));
  var page = document.querySelector(".page-sheet");
  var sheetNo = document.getElementById("sheet");
  var marks = Array.prototype.slice.call(document.querySelectorAll("[data-sheet]"));
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };

  function update() {
    var vh = window.innerHeight, y = window.scrollY;
    if (!reduce) {
      if (y < vh * 1.5) {
        layers.forEach(function (l) { l.style.transform = "translate3d(0," + (y * parseFloat(l.getAttribute("data-depth"))).toFixed(1) + "px,0)"; });
      }
      sheets.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var p = clamp((vh - r.top) / (vh * 0.5) - i * 0.05);
        s.style.setProperty("--tilt", (28 * (1 - p)).toFixed(2) + "deg");
        s.style.setProperty("--lift", (40 * (1 - p)).toFixed(1) + "px");
      });
      if (page) {
        var pr = page.getBoundingClientRect();
        var pp = clamp((vh - pr.top) / (vh + pr.height));
        page.style.setProperty("--ry", (-16 + pp * 18).toFixed(2) + "deg");
        page.style.setProperty("--rx", (10 - pp * 10).toFixed(2) + "deg");
      }
    }
    if (flow && svg) {
      var p = 1;
      if (!reduce) {
        var r = svg.getBoundingClientRect();
        p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.25));
      }
      flow.style.strokeDashoffset = flowLen * (1 - p);
      var n = Math.round(p * nodes.length);
      nodes.forEach(function (g, i) { g.classList.toggle("lit", i < n); });
    }
    if (sheetNo) {
      var cur = "01";
      marks.forEach(function (m) { if (m.getBoundingClientRect().top < vh * 0.5) cur = m.getAttribute("data-sheet"); });
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) cur = "08";
      sheetNo.textContent = cur + " / 08";
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { buildPipeline(); onScroll(); });
  buildPipeline();
  update();

  // Host tabs.
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs [role=tab]"));
  var note = document.getElementById("panel-host");
  function select(t) {
    tabs.forEach(function (x) { x.setAttribute("aria-selected", String(x === t)); x.tabIndex = x === t ? 0 : -1; });
    if (note) { note.textContent = t.getAttribute("data-note"); note.setAttribute("aria-labelledby", t.id); }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
      if (j === null) return;
      var nt = tabs[(j + tabs.length) % tabs.length];
      select(nt); nt.focus(); e.preventDefault();
    });
  });
  if (tabs.length) select(tabs[0]);

  // Copy buttons.
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".copy-btn"), function (b) {
    var label = b.textContent;
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-target"));
      var text = el ? el.textContent.replace(/^\n+/, "") : "";
      var done = function (ok) {
        b.textContent = ok ? (root.getAttribute("data-copied") || "Copied") : (root.getAttribute("data-copy-failed") || "Select and copy");
        if (ok) b.classList.add("copied");
        setTimeout(function () { b.textContent = label; b.classList.remove("copied"); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });

  // Language: remember the reader's choice; on the English page, offer the
  // Chinese page to a browser set to Chinese. Never redirect.
  var KEY = "granada-lang";
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  Array.prototype.forEach.call(document.querySelectorAll(".lang a[data-lang]"), function (a) {
    a.addEventListener("click", function () { store(a.getAttribute("data-lang")); });
  });
  var tpl = document.getElementById("langhint-tpl");
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
  var wantsZh = String(langs[0] || "").toLowerCase().indexOf("zh") === 0;
  if (tpl && root.lang === "en" && wantsZh && !stored() && !navigator.webdriver) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector("a").addEventListener("click", function () { store("zh"); });
    node.querySelector("[data-lang-dismiss]").addEventListener("click", function () { store("en"); node.remove(); });
    document.body.appendChild(node);
  }
})();
