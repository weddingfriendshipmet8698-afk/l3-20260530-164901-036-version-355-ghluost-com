(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        autoplay();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        autoplay();
      });
    });

    show(0);
    autoplay();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var scope = panel.closest("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var search = panel.querySelector("[data-search-input]");
      var year = panel.querySelector("[data-year-filter]");
      var type = panel.querySelector("[data-type-filter]");
      var category = panel.querySelector("[data-category-filter]");
      var reset = panel.querySelector("[data-filter-reset]");
      var noResults = scope.querySelector("[data-no-results]");

      function cardMatches(card) {
        var query = normalize(search && search.value);
        var yearValue = year ? year.value : "";
        var typeValue = normalize(type && type.value);
        var categoryValue = normalize(category && category.value);
        var title = normalize(card.getAttribute("data-title"));
        var cardYear = String(card.getAttribute("data-year") || "");
        var cardType = normalize(card.getAttribute("data-type"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var queryMatch = !query || [title, cardYear, cardType, cardRegion, cardCategory].join(" ").indexOf(query) !== -1;
        var yearMatch = !yearValue || cardYear === yearValue || (yearValue === "older" && Number(cardYear) < 2020);
        var typeMatch = !typeValue || cardType.indexOf(typeValue) !== -1;
        var categoryMatch = !categoryValue || cardCategory === categoryValue;

        return queryMatch && yearMatch && typeMatch && categoryMatch;
      }

      function apply() {
        var visibleCount = 0;

        cards.forEach(function (card) {
          var visible = cardMatches(card);
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });

        if (noResults) {
          noResults.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [search, year, type, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (category) {
            category.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-hls-player]");
    if (!video) {
      return;
    }

    var source = video.getAttribute("data-m3u8");
    if (!source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      video.addEventListener("destroy", function () {
        hls.destroy();
      });
    }
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
