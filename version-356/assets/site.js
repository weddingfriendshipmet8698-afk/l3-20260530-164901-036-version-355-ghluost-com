(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupScrollRows() {
    Array.prototype.slice.call(document.querySelectorAll("[data-scroll]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll"));
        var dir = button.getAttribute("data-direction") === "left" ? -1 : 1;
        if (target) {
          target.scrollBy({ left: dir * 420, behavior: "smooth" });
        }
      });
    });
  }

  function setupTabs() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".tab-button"));
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-tab");
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        Array.prototype.slice.call(document.querySelectorAll(".tab-panel")).forEach(function (panel) {
          panel.classList.toggle("active", panel.id === id);
        });
      });
    });
  }

  function createCard(movie) {
    var safeTitle = escapeHtml(movie.title);
    var meta = [movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(" · ");
    return "<article class=\"movie-card movie-card-medium\">" +
      "<a class=\"movie-cover\" href=\"" + movie.url + "\" aria-label=\"" + safeTitle + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + safeTitle + "\" loading=\"lazy\">" +
      "<span class=\"cover-layer\"></span>" +
      "<span class=\"cover-region\">" + escapeHtml(movie.region) + "</span>" +
      "<span class=\"cover-type\">" + escapeHtml(movie.type) + "</span>" +
      "<span class=\"cover-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<h3><a href=\"" + movie.url + "\">" + safeTitle + "</a></h3>" +
      "<p class=\"movie-meta\">" + escapeHtml(meta) + "</p>" +
      "<p class=\"movie-line\">" + escapeHtml(movie.oneLine || "") + "</p>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setupSearch() {
    var root = document.getElementById("search-app");
    if (!root || !window.MOVIES) {
      return;
    }
    var form = document.getElementById("search-form");
    var input = document.getElementById("search-input");
    var region = document.getElementById("region-filter");
    var type = document.getElementById("type-filter");
    var year = document.getElementById("year-filter");
    var results = document.getElementById("search-results");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (q && input) {
      input.value = q;
    }
    function fillSelect(select, values) {
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }
    fillSelect(region, unique(window.MOVIES.map(function (movie) { return movie.region; })).slice(0, 80));
    fillSelect(type, unique(window.MOVIES.map(function (movie) { return movie.type; })).slice(0, 80));
    fillSelect(year, unique(window.MOVIES.map(function (movie) { return String(movie.year); })).sort().reverse());
    function render() {
      var keyword = (input.value || "").trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;
      var filtered = window.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!regionValue || movie.region === regionValue) &&
          (!typeValue || movie.type === typeValue) &&
          (!yearValue || String(movie.year) === yearValue);
      }).slice(0, 120);
      results.innerHTML = filtered.map(createCard).join("") || "<p class=\"empty-result\">未找到相关影片。</p>";
    }
    [input, region, type, year].forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    render();
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      value = String(value || "").trim();
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupScrollRows();
    setupTabs();
    setupSearch();
  });
})();

function initPlayer(stream) {
  var video = document.getElementById("player");
  var trigger = document.getElementById("play-trigger");
  if (!video || !stream) {
    return;
  }
  var loaded = false;
  function loadVideo() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }
  function start() {
    loadVideo();
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }
  if (trigger) {
    trigger.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
  });
}
