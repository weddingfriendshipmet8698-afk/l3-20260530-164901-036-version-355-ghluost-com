(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function formatTime(value) {
        if (!Number.isFinite(value) || value < 0) {
            return '0:00';
        }
        var minutes = Math.floor(value / 60);
        var seconds = Math.floor(value % 60).toString().padStart(2, '0');
        return minutes + ':' + seconds;
    }

    function setupMenu() {
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function nextSlide() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(nextSlide, 5000);
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
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = qs('[data-filter-panel]');
        var list = qs('[data-filter-list]');
        if (!panel || !list) {
            return;
        }
        var keyword = qs('[data-filter-keyword]', panel);
        var type = qs('[data-filter-type]', panel);
        var year = qs('[data-filter-year]', panel);
        var reset = qs('[data-filter-reset]', panel);
        var empty = qs('[data-empty-state]');
        var cards = qsa('[data-movie-card]', list);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && keyword) {
            keyword.value = query;
        }

        function matchesYear(card, selected) {
            if (!selected) {
                return true;
            }
            var cardYear = card.getAttribute('data-year') || '';
            if (selected === 'before-2020') {
                var numeric = parseInt(cardYear, 10);
                return Number.isFinite(numeric) && numeric < 2020;
            }
            return cardYear === selected;
        }

        function filter() {
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var typeText = (card.getAttribute('data-type') || '') + ' ' + (card.getAttribute('data-genre') || '');
                var ok = true;
                if (keywordValue && haystack.indexOf(keywordValue) === -1) {
                    ok = false;
                }
                if (typeValue && typeText.indexOf(typeValue) === -1) {
                    ok = false;
                }
                if (!matchesYear(card, yearValue)) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', shown === 0);
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            if (keyword) {
                keyword.addEventListener(eventName, filter);
            }
            if (type) {
                type.addEventListener(eventName, filter);
            }
            if (year) {
                year.addEventListener(eventName, filter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                if (type) {
                    type.value = '';
                }
                if (year) {
                    year.value = '';
                }
                filter();
            });
        }
        filter();
    }

    window.initMoviePlayer = function (streamUrl) {
        var root = qs('[data-movie-player]');
        if (!root || !streamUrl) {
            return;
        }
        var video = qs('video', root);
        var overlay = qs('[data-player-overlay]', root);
        var playButton = qs('[data-player-play]', root);
        var muteButton = qs('[data-player-mute]', root);
        var fullButton = qs('[data-player-fullscreen]', root);
        var range = qs('[data-player-range]', root);
        var current = qs('[data-player-current]', root);
        var duration = qs('[data-player-duration]', root);
        var hls = null;
        var attached = false;
        var pendingPlay = false;

        if (!video) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        video.play().catch(function () {});
                    }
                });
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
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            pendingPlay = true;
            attach();
            video.play().catch(function () {});
        }

        function togglePlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        function updateButtons() {
            if (playButton) {
                playButton.textContent = video.paused ? '▶' : 'Ⅱ';
            }
            if (overlay) {
                overlay.classList.toggle('hidden', !video.paused);
            }
        }

        function updateTime() {
            if (range) {
                range.max = video.duration || 0;
                range.value = video.currentTime || 0;
            }
            if (current) {
                current.textContent = formatTime(video.currentTime || 0);
            }
            if (duration) {
                duration.textContent = formatTime(video.duration || 0);
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (playButton) {
            playButton.addEventListener('click', togglePlay);
        }
        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updateButtons);
        video.addEventListener('pause', updateButtons);
        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateTime);
        video.addEventListener('durationchange', updateTime);

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '🔇' : '🔊';
            });
        }
        if (fullButton) {
            fullButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }
        if (range) {
            range.addEventListener('input', function () {
                video.currentTime = Number(range.value || 0);
                updateTime();
            });
        }
        updateButtons();
        updateTime();
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
