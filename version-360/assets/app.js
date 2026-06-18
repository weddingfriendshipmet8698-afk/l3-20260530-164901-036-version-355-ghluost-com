(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function() {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.getElementById('mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function(slide, position) {
          slide.classList.toggle('is-active', position === index);
        });
        dots.forEach(function(dot, position) {
          dot.classList.toggle('is-active', position === index);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function() {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          var next = Number(dot.getAttribute('data-slide') || 0);
          show(next);
          start();
        });
      });

      show(0);
      start();
    }

    var grid = document.getElementById('library-grid');
    var filterForm = document.querySelector('.catalog-filter');
    var empty = document.getElementById('filter-empty');
    if (grid && filterForm) {
      var input = filterForm.querySelector('input[name="q"]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      function applyFilter(value) {
        var keyword = String(value || '').trim().toLowerCase();
        var shown = 0;
        cards.forEach(function(card) {
          var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      if (input) {
        input.value = query;
        input.addEventListener('input', function() {
          applyFilter(input.value);
        });
      }

      filterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        applyFilter(input ? input.value : '');
      });

      applyFilter(query);
    }
  });
}());
