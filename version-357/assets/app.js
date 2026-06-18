(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupRows() {
    document.querySelectorAll('.scroll-shell').forEach(function (shell) {
      var row = shell.querySelector('[data-scroll-row]');
      var left = shell.querySelector('[data-scroll-left]');
      var right = shell.querySelector('[data-scroll-right]');
      if (!row) {
        return;
      }
      if (left) {
        left.addEventListener('click', function () {
          row.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          row.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function setupSearch() {
    var panel = document.querySelector('[data-search-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    if (!panel || !cards.length) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-year-filter]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-type-filter]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeType = '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matchesType(card, typeValue) {
      if (!typeValue) {
        return true;
      }
      var values = typeValue.split(/\s+/).filter(Boolean);
      var target = normalize(card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre'));
      return values.some(function (value) {
        return target.indexOf(normalize(value)) !== -1;
      });
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-haystack'));
        var cardYear = card.getAttribute('data-year') || '';
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          ok = false;
        }
        if (!matchesType(card, activeType)) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = button.getAttribute('data-type-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
    apply();
  }

  function initializeHls(video, source) {
    if (!video || !source || video.dataset.playerReady === 'true') {
      return;
    }
    video.dataset.playerReady = 'true';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play-trigger]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-source');
      initializeHls(video, source);

      function playVideo() {
        initializeHls(video, source);
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    });
  }

  function setupYear() {
    document.querySelectorAll('[data-current-year]').forEach(function (item) {
      item.textContent = String(new Date().getFullYear());
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupRows();
    setupSearch();
    setupPlayers();
    setupYear();
  });
})();
