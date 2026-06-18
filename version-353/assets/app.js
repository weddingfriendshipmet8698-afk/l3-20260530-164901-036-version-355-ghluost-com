(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector(".hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFiltering() {
        var list = document.getElementById("movieList");
        if (!list) {
            return;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-item"));
        var search = document.getElementById("pageSearch");
        var year = document.getElementById("yearFilter");
        var region = document.getElementById("regionFilter");
        var type = document.getElementById("typeFilter");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (search && query) {
            search.value = query;
        }

        function getText(item) {
            return normalize([
                item.getAttribute("data-title"),
                item.getAttribute("data-year"),
                item.getAttribute("data-region"),
                item.getAttribute("data-type"),
                item.getAttribute("data-tags"),
                item.textContent
            ].join(" "));
        }

        function apply() {
            var q = normalize(search ? search.value : "");
            var y = normalize(year ? year.value : "");
            var r = normalize(region ? region.value : "");
            var t = normalize(type ? type.value : "");
            items.forEach(function (item) {
                var haystack = getText(item);
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (y && normalize(item.getAttribute("data-year")).indexOf(y) === -1 && haystack.indexOf(y) === -1) {
                    ok = false;
                }
                if (r && normalize(item.getAttribute("data-region")).indexOf(r) === -1 && haystack.indexOf(r) === -1) {
                    ok = false;
                }
                if (t && normalize(item.getAttribute("data-type")).indexOf(t) === -1 && haystack.indexOf(t) === -1) {
                    ok = false;
                }
                item.classList.toggle("is-filtered-out", !ok);
            });
        }

        [search, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (videoSelector, playSelector, overlaySelector, streamUrl) {
        var video = document.querySelector(videoSelector);
        var play = document.querySelector(playSelector);
        var overlay = document.querySelector(overlaySelector);
        if (!video || !streamUrl) {
            return;
        }

        function bindStream() {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        bindStream();

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        if (play) {
            play.addEventListener("click", function (event) {
                event.stopPropagation();
                startPlayback();
            });
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
    });
})();
