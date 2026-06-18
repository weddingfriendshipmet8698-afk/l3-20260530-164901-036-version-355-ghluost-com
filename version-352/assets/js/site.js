(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupSlider() {
        var slider = document.querySelector("[data-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slider-dot]"));
        var prev = slider.querySelector("[data-slider-prev]");
        var next = slider.querySelector("[data-slider-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
                slide.setAttribute("aria-hidden", i === index ? "false" : "true");
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter(input) {
        var selector = input.getAttribute("data-target") || ".movie-card";
        var root = document.querySelector(input.getAttribute("data-root") || "body") || document.body;
        var cards = Array.prototype.slice.call(root.querySelectorAll(selector));
        var query = normalize(input.value);
        var visible = 0;
        cards.forEach(function(card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            var ok = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !ok);
            if (ok) {
                visible += 1;
            }
        });
        var empty = root.querySelector(".no-results");
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
        if (!inputs.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        inputs.forEach(function(input) {
            if (q && !input.value) {
                input.value = q;
            }
            input.addEventListener("input", function() {
                applyFilter(input);
            });
            applyFilter(input);
        });
    }

    ready(function() {
        setupMenu();
        setupSlider();
        setupFilters();
    });
})();

function bindMoviePlayer(source) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !overlay || !source) {
        return;
    }

    var started = false;
    var hlsInstance = null;

    function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function() {});
        }
    }

    function start() {
        overlay.classList.add("is-hidden");
        if (started) {
            playVideo();
            return;
        }
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            playVideo();
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
                playVideo();
            });
            return;
        }

        video.src = source;
        playVideo();
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function() {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener("beforeunload", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
