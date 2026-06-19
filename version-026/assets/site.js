(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMobileMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".mobile-menu-button");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function setupFilters() {
        var filterBars = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));
        filterBars.forEach(function (bar) {
            var scopeSelector = bar.getAttribute("data-scope") || ".movie-list";
            var scope = document.querySelector(scopeSelector);
            var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".searchable-card")) : [];
            var search = bar.querySelector(".filter-search");
            var region = bar.querySelector(".filter-region");
            var type = bar.querySelector(".filter-type");
            var year = bar.querySelector(".filter-year");
            var empty = document.querySelector(bar.getAttribute("data-empty") || "");
            var params = new URLSearchParams(window.location.search);
            if (search && params.get("q")) {
                search.value = params.get("q");
            }
            function apply() {
                var q = normalize(search && search.value);
                var r = normalize(region && region.value);
                var t = normalize(type && type.value);
                var y = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && normalize(card.getAttribute("data-region")) !== r) {
                        ok = false;
                    }
                    if (t && normalize(card.getAttribute("data-type")) !== t) {
                        ok = false;
                    }
                    if (y && normalize(card.getAttribute("data-year")) !== y) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }
            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, overlayId, stream) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !overlay || !stream) {
            return;
        }
        var hls = null;
        var attached = false;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }
        function start() {
            attach();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }
        function toggle() {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        }
        attach();
        overlay.addEventListener("click", start);
        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    onReady(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
