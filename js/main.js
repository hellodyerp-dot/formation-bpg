/* =========================================================
   Formation Bureau de la Procureure Générale — script commun
   ========================================================= */
(function () {
  "use strict";

  var PAGES = [
    { id: "accueil", file: "index.html", emo: "🏛️", title: "Accueil", desc: "Le parcours de formation" },
    { id: "intro", file: "introduction.html", emo: "📜", title: "Introduction", desc: "Le Bureau : origines et attributions" },
    { id: "fond", file: "fondamentaux.html", emo: "⚖️", title: "I. Fondamentaux", desc: "Règles du Bureau, amendements, Code pénal, procédure, grands principes, latin" },
    { id: "plaintes", file: "plaintes.html", emo: "📝", title: "II. Plaintes", desc: "Plainte DOJ, plainte citoyenne, le grand schéma" },
    { id: "preuves", file: "preuves.html", emo: "🔎", title: "III. Preuves", desc: "Types, admissibilité, chaîne de possession, exclusion, Brady" },
    { id: "interro", file: "interrogatoire.html", emo: "🎙️", title: "IV. Interrogatoire", desc: "Tenir la salle, encadrer l'avocat, la comparution immédiate" },
    { id: "accusation", file: "accusation.html", emo: "🎯", title: "V. Accusation", desc: "Chefs, théorie du dossier, accords et leur rédaction" },
    { id: "tribunal", file: "tribunal.html", emo: "🧑‍⚖️", title: "VI. Tribunal", desc: "Requêtes, plaidoiries, questions aux témoins" },
    { id: "mandats", file: "mandats.html", emo: "📄", title: "VII. Mandats", desc: "Types de mandats, RICO, demande sur le MDT" }
  ];

  /* ---------- Stockage sécurisé ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function getScore(id) {
    try { return JSON.parse(store.get("bpg-quiz-" + id)); } catch (e) { return null; }
  }

  var root = document.documentElement;
  var pageId = document.body.getAttribute("data-page") || "accueil";
  var pageIndex = PAGES.findIndex(function (p) { return p.id === pageId; });

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------- Coquille : barre latérale + barre mobile ---------- */
  function buildShell() {
    var main = document.getElementById("main");
    if (!main) return;
    var shell = el("div", { class: "shell" });
    var side = el("aside", { class: "sidebar", id: "sidebar", "aria-label": "Navigation de la formation" });

    var navHtml = PAGES.map(function (p) {
      var s = getScore(p.id);
      var badge = s ? '<span class="score" title="Meilleur score au quiz">' + s.s + "/" + s.n + "</span>" : "<span></span>";
      var cur = p.id === pageId ? ' aria-current="page"' : "";
      return '<li><a href="' + p.file + '"' + cur + '><span class="emo" aria-hidden="true">' + p.emo + "</span><span>" + p.title + "</span>" + badge + "</a></li>";
    }).join("");

    side.innerHTML =
      '<a class="brand" href="index.html"><img src="assets/img/sceau-bleu.png" alt="Sceau du Department of Justice de San Andreas"><span><b>Bureau de la Procureure Générale</b><small>Formation des substituts</small></span></a>' +
      '<nav><ul class="nav">' + navHtml + "</ul></nav>" +
      '<div class="settings" aria-label="Réglages de lecture">' +
      '<button class="btn-set btn-dys" id="t-dys" aria-pressed="false" title="Police adaptée à la dyslexie">Aa Lecture dys</button>' +
      '<div class="row"><button class="btn-set" id="t-theme" aria-pressed="false">🌙 Sombre</button>' +
      '<button class="btn-set" id="t-size" title="Taille du texte">A+ Texte</button></div>' +
      "</div>";

    var top = el("header", { class: "topbar" },
      '<img src="assets/img/sceau-bleu.png" alt=""><b>Formation des substituts</b>' +
      '<button class="menu-btn" id="menu-btn" aria-controls="sidebar" aria-expanded="false">☰ Menu</button>');

    main.parentNode.insertBefore(shell, main);
    shell.appendChild(side);
    var wrap = el("div", { class: "main-col" });
    wrap.appendChild(top);
    wrap.appendChild(main);
    shell.appendChild(wrap);
    document.body.insertBefore(el("div", { class: "progress", id: "progress", "aria-hidden": "true" }), shell);

    var btn = document.getElementById("menu-btn");
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("nav-open") && !side.contains(e.target) && e.target !== btn) {
        document.body.classList.remove("nav-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { document.body.classList.remove("nav-open"); closeLightbox(); }
    });
  }

  /* ---------- Réglages de lecture ---------- */
  function initSettings() {
    var dys = document.getElementById("t-dys");
    var theme = document.getElementById("t-theme");
    var size = document.getElementById("t-size");
    if (!dys) return;

    function sync() {
      dys.setAttribute("aria-pressed", root.classList.contains("dys") ? "true" : "false");
      var dark = root.getAttribute("data-theme") === "dark";
      theme.setAttribute("aria-pressed", dark ? "true" : "false");
      theme.textContent = dark ? "☀️ Clair" : "🌙 Sombre";
      var s = root.getAttribute("data-size") || "m";
      size.textContent = s === "m" ? "A+ Texte" : s === "l" ? "A++ Texte" : "A Texte";
    }
    dys.addEventListener("click", function () {
      var on = root.classList.toggle("dys");
      store.set("bpg-dys", on ? "1" : "0");
      sync();
    });
    theme.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") !== "dark";
      root.setAttribute("data-theme", dark ? "dark" : "light");
      store.set("bpg-theme", dark ? "dark" : "light");
      sync();
    });
    size.addEventListener("click", function () {
      var s = root.getAttribute("data-size") || "m";
      var next = s === "m" ? "l" : s === "l" ? "xl" : "m";
      root.setAttribute("data-size", next);
      store.set("bpg-size", next);
      sync();
    });
    sync();
  }

  /* ---------- Barre de progression de lecture ---------- */
  function initProgress() {
    var bar = document.getElementById("progress");
    if (!bar) return;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Pages précédente / suivante ---------- */
  function buildPager() {
    var content = document.querySelector("#main .content");
    if (!content || pageIndex < 0) return;
    var prev = PAGES[pageIndex - 1];
    var next = PAGES[pageIndex + 1];
    var pager = el("nav", { class: "pager", "aria-label": "Pages voisines" });
    if (prev) pager.appendChild(el("a", { href: prev.file }, "<small>← Précédent</small><b>" + prev.emo + " " + prev.title + "</b>"));
    if (next) pager.appendChild(el("a", { href: next.file, class: "next" }, "<small>Suivant →</small><b>" + next.emo + " " + next.title + "</b>"));
    content.appendChild(pager);
    content.appendChild(el("p", { class: "site-foot" },
      "Ce site complète les cours : il ne constitue pas à lui seul le socle de connaissances attendu d'un Substitut de la Procureure Générale."));
  }

  /* ---------- Parcours de l'accueil ---------- */
  function buildRoute() {
    var route = document.getElementById("route");
    if (!route) return;
    route.innerHTML = PAGES.slice(1).map(function (p) {
      var s = getScore(p.id);
      var sc = s ? '<span class="score has">Quiz ' + s.s + "/" + s.n + "</span>" : '<span class="score">Quiz à faire</span>';
      return '<li><a href="' + p.file + '"><span class="ico" aria-hidden="true">' + p.emo + "</span><span><b>" + p.title + "</b><small>" + p.desc + "</small></span>" + sc + "</a></li>";
    }).join("");
  }

  /* ---------- Cartes retournables ---------- */
  function initFlips() {
    document.querySelectorAll(".flip").forEach(function (f) {
      f.setAttribute("aria-pressed", "false");
      f.addEventListener("click", function () {
        var on = f.classList.toggle("on");
        f.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  }

  /* ---------- Onglets ---------- */
  function initTabs() {
    document.querySelectorAll(".tabs").forEach(function (t, ti) {
      var btns = t.querySelectorAll(":scope > .tablist button");
      var panels = t.querySelectorAll(":scope > .tabpanel");
      t.querySelector(":scope > .tablist").setAttribute("role", "tablist");
      function show(i) {
        btns.forEach(function (b, j) { b.setAttribute("aria-selected", i === j ? "true" : "false"); b.tabIndex = i === j ? 0 : -1; });
        panels.forEach(function (p, j) { p.hidden = i !== j; });
      }
      btns.forEach(function (b, i) {
        b.setAttribute("role", "tab");
        b.id = "tab-" + ti + "-" + i;
        if (panels[i]) { panels[i].setAttribute("role", "tabpanel"); panels[i].setAttribute("aria-labelledby", b.id); }
        b.addEventListener("click", function () { show(i); });
        b.addEventListener("keydown", function (e) {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            var n = (i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length;
            show(n); btns[n].focus();
          }
        });
      });
      show(0);
    });
  }

  /* ---------- Échelles et éléments dépliables simples ---------- */
  function initToggles() {
    document.querySelectorAll(".rung").forEach(function (r) {
      r.setAttribute("aria-expanded", "false");
      r.addEventListener("click", function () {
        r.setAttribute("aria-expanded", r.getAttribute("aria-expanded") === "true" ? "false" : "true");
      });
    });
    document.querySelectorAll("[data-fold-all]").forEach(function (b) {
      b.addEventListener("click", function () {
        var scope = document.getElementById(b.getAttribute("data-fold-all"));
        var open = b.getAttribute("data-open") === "1";
        if (scope) scope.querySelectorAll("details").forEach(function (d) { d.open = open; });
      });
    });
    document.querySelectorAll(".etym button").forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        var group = b.closest(".etym");
        group.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var out = document.getElementById(group.getAttribute("data-out"));
        if (out) out.innerHTML = b.getAttribute("data-say");
      });
    });
  }

  /* ---------- Faisceau d'indices ---------- */
  function initFaisceau() {
    document.querySelectorAll(".faisceau").forEach(function (f) {
      var btns = f.querySelectorAll("button[data-w]");
      var bar = f.querySelector(".fx-bar span");
      var out = f.querySelector(".fx-out");
      var msgs = JSON.parse(f.getAttribute("data-msgs"));
      function upd() {
        var total = 0;
        btns.forEach(function (b) { if (b.getAttribute("aria-pressed") === "true") total += +b.getAttribute("data-w"); });
        bar.style.width = Math.min(total, 100) + "%";
        var n = f.querySelectorAll("button[aria-pressed=true]").length;
        out.innerHTML = msgs[n] || "";
      }
      btns.forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
          upd();
        });
      });
      upd();
    });
  }

  /* ---------- Filtres de tableau ---------- */
  function initFilters() {
    document.querySelectorAll(".filter-chips").forEach(function (bar) {
      var table = document.getElementById(bar.getAttribute("data-target"));
      var btns = bar.querySelectorAll("button");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          var f = b.getAttribute("data-filter");
          btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          table.querySelectorAll("tbody tr").forEach(function (tr) {
            var who = tr.getAttribute("data-who") || "";
            tr.hidden = !(f === "all" || who.split(" ").indexOf(f) >= 0);
          });
        });
      });
    });
  }

  /* ---------- Fiches réflexe cochables ---------- */
  function initChecklists() {
    document.querySelectorAll(".box.reflexe .checklist").forEach(function (list) {
      var reset = el("button", { class: "reflex-reset", type: "button" }, "Tout décocher");
      reset.addEventListener("click", function () {
        list.querySelectorAll("input").forEach(function (i) { i.checked = false; });
      });
      list.parentNode.appendChild(reset);
    });
  }

  /* ---------- Copier un modèle ---------- */
  function initCopy() {
    document.querySelectorAll(".template").forEach(function (t) {
      var b = el("button", { class: "copy", type: "button" }, "Copier");
      b.addEventListener("click", function () {
        var clone = t.cloneNode(true);
        clone.querySelectorAll(".copy").forEach(function (c) { c.remove(); });
        var text = clone.innerText.trim();
        var done = function () { b.textContent = "Copié ✓"; setTimeout(function () { b.textContent = "Copier"; }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
      });
      t.appendChild(b);
    });
  }

  /* ---------- Visionneuse d'image ---------- */
  var lb;
  function closeLightbox() { if (lb) lb.classList.remove("on"); }
  function initLightbox() {
    var thumbs = document.querySelectorAll("[data-full]");
    if (!thumbs.length) return;
    lb = el("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "Schéma en grand" },
      '<div class="lb-bar"><button data-z="fit">Ajuster</button><button data-z="1">Taille réelle</button><button data-z="close">✕ Fermer</button></div><div class="lb-view"><img alt=""></div>');
    document.body.appendChild(lb);
    var img = lb.querySelector("img");
    var view = lb.querySelector(".lb-view");
    function fit() { img.style.width = view.clientWidth + "px"; }
    lb.querySelector(".lb-bar").addEventListener("click", function (e) {
      var z = e.target.getAttribute("data-z");
      if (z === "close") closeLightbox();
      if (z === "fit") fit();
      if (z === "1") img.style.width = img.naturalWidth + "px";
    });
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        img.src = t.getAttribute("data-full");
        img.alt = t.getAttribute("data-alt") || "";
        lb.classList.add("on");
        img.onload = function () { img.style.width = Math.min(img.naturalWidth, view.clientWidth * 2.2) + "px"; };
        lb.querySelector("[data-z=close]").focus();
      });
    });
  }

  /* ---------- Explorateur de schémas ---------- */
  function initExplorers() {
    document.querySelectorAll(".explorer").forEach(function (box) {
      var src = document.getElementById(box.getAttribute("data-src"));
      if (!src) return;
      var data = JSON.parse(src.textContent);
      var trail = [data.start];

      function render() {
        var id = trail[trail.length - 1];
        var n = data.nodes[id];
        var crumbs = trail.map(function (tid, i) {
          var t = data.nodes[tid];
          return (i ? '<span class="sep">➜</span>' : "") + '<button type="button" data-back="' + i + '">' + (t.short || t.t) + "</button>";
        }).join("");
        var choices = (n.ch || []).map(function (c) {
          return '<button type="button" class="ex-choice ' + (c.c || "") + '" data-to="' + c.to + '">' + c.l + "</button>";
        }).join("");
        box.innerHTML =
          '<div class="ex-trail" aria-label="Chemin parcouru">' + crumbs + "</div>" +
          '<div class="ex-node ' + (n.c || "") + '" aria-live="polite"><h4>' + (n.emo ? '<span aria-hidden="true">' + n.emo + "</span>" : "") + n.t + "</h4>" +
          '<div class="ex-text">' + (n.html || "") + "</div>" +
          (n.note ? '<div class="ex-note">' + n.note + "</div>" : "") + "</div>" +
          (choices ? '<div class="ex-choices">' + choices + "</div>" : "") +
          '<div class="ex-end">' +
          (trail.length > 1 ? '<button type="button" data-act="prev">↩ Étape précédente</button>' : "") +
          (trail.length > 1 ? '<button type="button" data-act="restart"' + (choices ? "" : ' class="primary"') + ">⟲ Recommencer depuis le début</button>" : "") +
          "</div>";
      }
      box.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        if (b.hasAttribute("data-to")) trail.push(b.getAttribute("data-to"));
        else if (b.hasAttribute("data-back")) trail = trail.slice(0, +b.getAttribute("data-back") + 1);
        else if (b.getAttribute("data-act") === "prev") trail.pop();
        else if (b.getAttribute("data-act") === "restart") trail = [data.start];
        else return;
        render();
        var focusTarget = box.querySelector(".ex-node h4");
        if (focusTarget) { focusTarget.setAttribute("tabindex", "-1"); focusTarget.focus({ preventScroll: true }); }
        var r = box.getBoundingClientRect();
        if (r.top < 0) box.scrollIntoView({ block: "start" });
      });
      render();
    });
  }

  /* ---------- Moteur de quiz ---------- */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var LETTERS = ["A", "B", "C", "D", "E"];

  function initQuizzes() {
    document.querySelectorAll(".quiz[data-quiz]").forEach(function (quiz) {
      var qid = quiz.getAttribute("data-quiz");
      var raw = JSON.parse(quiz.querySelector("script[type='application/json']").textContent);
      var holder = el("div");
      quiz.appendChild(holder);
      var order;

      function build() {
        quiz.classList.remove("done");
        order = raw.map(function (q) {
          return { q: q.q, e: q.e, opts: shuffle(q.o.map(function (txt, i) { return { txt: txt, good: i === q.a }; })) };
        });
        holder.innerHTML = order.map(function (q, qi) {
          return '<fieldset class="q" style="border:0;margin:0;border-top:1px solid var(--line)"><legend class="q-title" style="padding:0"><span class="n">' + (qi + 1) + "</span><span>" + q.q + "</span></legend>" +
            '<div class="q-opts">' + q.opts.map(function (o, oi) {
              return '<label class="q-opt"><input type="radio" name="' + qid + "-" + qi + '" value="' + oi + '"><span class="letter">' + LETTERS[oi] + "</span><span>" + o.txt + "</span></label>";
            }).join("") + "</div></fieldset>";
        }).join("") +
          '<div class="quiz-actions"><button type="button" class="btn" data-act="check">Valider mes réponses</button><span class="quiz-msg" role="status"></span></div>' +
          '<div class="result" hidden></div>';
      }

      var confirmPending = false;
      quiz.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-act]");
        if (!b) return;
        if (b.getAttribute("data-act") === "retry") {
          build(); confirmPending = false;
          quiz.scrollIntoView({ block: "start" });
          return;
        }
        if (b.getAttribute("data-act") !== "check") return;
        var answers = order.map(function (q, qi) {
          var c = holder.querySelector("input[name='" + qid + "-" + qi + "']:checked");
          return c ? +c.value : -1;
        });
        var missing = answers.filter(function (a) { return a < 0; }).length;
        var msg = holder.querySelector(".quiz-msg");
        if (missing && !confirmPending) {
          msg.textContent = missing + " question" + (missing > 1 ? "s" : "") + " sans réponse. Cliquez à nouveau pour valider quand même.";
          b.textContent = "Valider quand même";
          confirmPending = true;
          return;
        }
        msg.textContent = "";
        grade(answers);
      });

      function grade(answers) {
        quiz.classList.add("done");
        var score = 0;
        var items = order.map(function (q, qi) {
          var goodIdx = q.opts.findIndex(function (o) { return o.good; });
          var ok = answers[qi] === goodIdx;
          if (ok) score++;
          var labels = holder.querySelectorAll("fieldset")[qi].querySelectorAll(".q-opt");
          labels.forEach(function (l, li) {
            l.querySelector("input").disabled = true;
            if (li === goodIdx) l.classList.add("good");
            else if (li === answers[qi]) l.classList.add("bad");
          });
          var yours = answers[qi] < 0 ? "<em>pas de réponse</em>" : LETTERS[answers[qi]] + ") " + q.opts[answers[qi]].txt;
          return '<li class="' + (ok ? "ok" : "ko") + '"><div class="qline">' + (ok ? "✅" : "❌") + " " + (qi + 1) + ". " + q.q + "</div>" +
            (ok ? "" : '<div class="ans">Votre réponse : ' + yours + "</div>") +
            '<div class="ans"><strong>Bonne réponse : ' + LETTERS[goodIdx] + ") " + q.opts[goodIdx].txt + "</strong></div>" +
            '<div class="why">' + q.e + "</div></li>";
        });
        var n = order.length;
        var pct = Math.round((score / n) * 100);
        var color = pct >= 80 ? "var(--green)" : pct >= 50 ? "var(--orange)" : "var(--red)";
        var verdict = pct === 100 ? "Sans faute. La Procureure Générale peut vous déléguer ce dossier. 🏆"
          : pct >= 80 ? "Très solide. Relisez les points manqués et c'est acquis. 💪"
          : pct >= 50 ? "Bonne base, mais quelques réflexes restent à ancrer. Relisez les encadrés « À retenir ». 📌"
          : "À retravailler : reprenez la page, puis retentez le quiz (les réponses changent d'ordre). 📚";

        var best = getScore(qid);
        if (!best || score > best.s) store.set("bpg-quiz-" + qid, JSON.stringify({ s: score, n: n }));
        var navBadge = document.querySelector('.nav a[aria-current="page"] span:last-child');
        var nb = getScore(qid);
        if (navBadge && nb) { navBadge.className = "score"; navBadge.textContent = nb.s + "/" + nb.n; }

        var res = holder.querySelector(".result");
        res.hidden = false;
        res.innerHTML = '<div class="score-big"><div class="score-ring" style="--p:' + pct + ";--c:" + color + '"><span>' + score + "/" + n + "</span></div><div><h3 style=\"margin:0 0 4px\">Correction</h3><p style=\"margin:0\">" + verdict + "</p></div></div>" +
          '<ol class="corr">' + items.join("") + "</ol>" +
          '<div class="quiz-actions"><button type="button" class="btn" data-act="retry">⟲ Recommencer (nouvel ordre des réponses)</button></div>';
        var chk = holder.querySelector("[data-act=check]");
        if (chk) chk.parentNode.remove();
        res.scrollIntoView({ block: "start" });
      }

      build();
    });
  }

  /* ---------- Lancement ---------- */
  buildShell();
  initSettings();
  initProgress();
  buildRoute();
  initFlips();
  initTabs();
  initToggles();
  initFaisceau();
  initFilters();
  initChecklists();
  initCopy();
  initLightbox();
  initExplorers();
  initQuizzes();
  buildPager();
})();
