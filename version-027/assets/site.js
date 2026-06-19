(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".site-nav");

        if (menuToggle && nav) {
            menuToggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function startHero() {
            if (!slides.length) {
                return;
            }
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide")) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startHero();
            });
        }

        startHero();

        var searchInput = document.querySelector(".js-search");
        var yearSelect = document.querySelector(".js-year");
        var typeSelect = document.querySelector(".js-type");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function runFilter() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute("data-year") === year;
                var matchType = !type || card.getAttribute("data-type") === type;
                card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchType));
            });
        }

        [searchInput, yearSelect, typeSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", runFilter);
                node.addEventListener("change", runFilter);
            }
        });
    });
})();

function initMoviePlayer(streamUrl) {
    var video = document.querySelector(".movie-video");
    var layer = document.querySelector(".player-layer");
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function attach() {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        video.setAttribute("data-ready", "1");
    }

    function play() {
        attach();
        if (layer) {
            layer.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "1" || video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (layer) {
            layer.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
