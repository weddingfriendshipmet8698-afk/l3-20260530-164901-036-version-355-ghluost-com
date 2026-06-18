(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
        showSlide(next);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(options) {
    var cards = Array.prototype.slice.call(options.root.querySelectorAll('.movie-card'));
    var keyword = normalize(options.keyword);
    var year = normalize(options.year);
    var category = normalize(options.category);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.classList.toggle('is-hidden-card', !matched);

      if (matched) {
        visibleCount += 1;
      }
    });

    if (options.countNode) {
      options.countNode.textContent = '共 ' + visibleCount + ' 部影片';
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-year-filter]');
    var clearButton = filterPanel.querySelector('[data-clear-filter]');
    var countNode = document.querySelector('[data-result-count]');
    var root = document.querySelector('.filter-results') || document;

    function updateCategoryFilter() {
      filterCards({
        root: root,
        keyword: input ? input.value : '',
        year: yearSelect ? yearSelect.value : '',
        category: '',
        countNode: countNode
      });
    }

    if (input) {
      input.addEventListener('input', updateCategoryFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', updateCategoryFilter);
    }

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        updateCategoryFilter();
      });
    }
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var searchInput = searchPage.querySelector('[data-search-input]');
    var searchYear = searchPage.querySelector('[data-search-year]');
    var searchCategory = searchPage.querySelector('[data-search-category]');
    var searchClear = searchPage.querySelector('[data-search-clear]');
    var searchCount = searchPage.querySelector('[data-search-count]');
    var searchResults = searchPage.querySelector('[data-search-results]') || searchPage;

    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }

    function updateSearch() {
      filterCards({
        root: searchResults,
        keyword: searchInput ? searchInput.value : '',
        year: searchYear ? searchYear.value : '',
        category: searchCategory ? searchCategory.value : '',
        countNode: searchCount
      });
    }

    [searchInput, searchYear, searchCategory].forEach(function (node) {
      if (node) {
        node.addEventListener('input', updateSearch);
        node.addEventListener('change', updateSearch);
      }
    });

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (searchYear) {
          searchYear.value = '';
        }
        if (searchCategory) {
          searchCategory.value = '';
        }
        updateSearch();
      });
    }

    updateSearch();
  }
})();
