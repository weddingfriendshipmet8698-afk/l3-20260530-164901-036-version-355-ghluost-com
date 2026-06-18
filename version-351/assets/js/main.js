(function () {
  var base = document.body.getAttribute('data-base') || '';
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img[data-cover], .mini-posters img, .search-result img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-fallback');
      image.removeAttribute('src');
    }, { once: true });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var sideCards = Array.prototype.slice.call(document.querySelectorAll('[data-hero-side]'));
  var active = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
    sideCards.forEach(function (card, i) {
      card.classList.toggle('is-active', i === active);
    });
  }

  function startHero() {
    if (timer) {
      clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = setInterval(function () {
        setHero(active + 1);
      }, 5600);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
      startHero();
    });
  });

  sideCards.forEach(function (card, index) {
    card.addEventListener('mouseenter', function () {
      setHero(index);
      startHero();
    });
  });

  setHero(0);
  startHero();

  var searchInput = document.getElementById('global-search');
  var searchPanel = document.getElementById('search-panel');

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function resultImage(movie) {
    return base + movie.image + '.jpg';
  }

  function resultUrl(movie) {
    return base + movie.url;
  }

  function renderSearch(query) {
    if (!searchPanel || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }
    var q = normalize(query);
    if (!q) {
      searchPanel.classList.remove('is-open');
      searchPanel.innerHTML = '';
      return;
    }
    var results = window.SITE_MOVIES.filter(function (movie) {
      return normalize(movie.title + movie.line + movie.genre + movie.region + movie.year + movie.tags).indexOf(q) !== -1;
    }).slice(0, 8);

    if (!results.length) {
      searchPanel.innerHTML = '<div class="search-result"><div></div><div><strong>未找到匹配影片</strong><p>换一个关键词继续搜索。</p></div></div>';
      searchPanel.classList.add('is-open');
      return;
    }

    searchPanel.innerHTML = results.map(function (movie) {
      return '<a class="search-result" href="' + resultUrl(movie) + '">' +
        '<img src="' + resultImage(movie) + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
        '<div><strong>' + movie.title + '</strong><p>' + movie.line + '</p></div>' +
      '</a>';
    }).join('');
    searchPanel.classList.add('is-open');
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
    document.addEventListener('click', function (event) {
      if (!searchPanel || !searchInput) {
        return;
      }
      if (!searchPanel.contains(event.target) && event.target !== searchInput) {
        searchPanel.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('[data-page-filter]').forEach(function (input) {
    var scope = document.querySelector(input.getAttribute('data-page-filter')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
    input.addEventListener('input', function () {
      var q = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-filter-text'));
        card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
      });
    });
  });
})();
