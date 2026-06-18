(function () {
    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenus() {
        var toggle = document.querySelector(".site-menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;

        function show(next) {
            index = next % slides.length;
            if (index < 0) {
                index = slides.length - 1;
            }
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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

    function initSearchForms() {
        document.querySelectorAll("form[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function initCardFilters() {
        var filterBlocks = document.querySelectorAll("[data-filter-block]");
        filterBlocks.forEach(function (block) {
            var keywordInput = block.querySelector("[data-filter-keyword]");
            var yearSelect = block.querySelector("[data-filter-year]");
            var typeSelect = block.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(block.querySelectorAll("[data-movie-card]"));

            function apply() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-genre"));
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okYear = !year || card.getAttribute("data-year") === year;
                    var okType = !type || card.getAttribute("data-type") === type;
                    card.classList.toggle("hidden-by-filter", !(okKeyword && okYear && okType));
                });
            }

            [keywordInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function renderSearchResults(items) {
        var results = document.querySelector("[data-search-results]");
        if (!results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = document.querySelector("[data-search-input]");
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        var keyword = normalize(query);
        var matches = (items || []).filter(function (item) {
            var text = normalize([
                item.title,
                item.year,
                item.type,
                item.region,
                item.genre,
                item.category,
                item.tags,
                item.oneLine
            ].join(" "));
            return !keyword || text.indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (!matches.length) {
            results.innerHTML = "<div class=\"content-panel\"><p>暂无匹配影片。</p></div>";
            return;
        }

        results.innerHTML = matches.map(function (item) {
            return [
                "<a class=\"search-result\" href=\"" + item.url + "\">",
                "<img src=\"" + item.cover + "\" alt=\"" + item.title + "\">",
                "<span>",
                "<h3>" + item.title + "</h3>",
                "<p>" + item.oneLine + "</p>",
                "<span class=\"card-meta\"><span>" + item.year + "</span><span>" + item.type + "</span><span>" + item.category + "</span></span>",
                "</span>",
                "</a>"
            ].join("");
        }).join("");
    }

    function initSearchPage() {
        if (!document.querySelector("[data-search-results]")) {
            return;
        }
        renderSearchResults(window.SEARCH_DATA || []);
    }

    window.MoviePlayer = function (video, stream, playButton, overlay) {
        if (!video || !stream) {
            return;
        }

        var started = false;

        function begin() {
            if (started) {
                return;
            }
            started = true;

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = stream;
            video.play().catch(function () {});
        }

        if (playButton) {
            playButton.addEventListener("click", begin);
        }
        if (overlay && overlay !== playButton) {
            overlay.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });
    };

    onReady(function () {
        initMenus();
        initHero();
        initSearchForms();
        initCardFilters();
        initSearchPage();
    });
})();
