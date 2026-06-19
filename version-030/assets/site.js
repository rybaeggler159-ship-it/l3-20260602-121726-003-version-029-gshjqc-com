(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

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
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (searchInput && cards.length) {
            searchInput.addEventListener("input", function () {
                var value = searchInput.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    card.classList.toggle("hidden", value && text.indexOf(value) === -1);
                });
            });
        }
    });
})();

function initMoviePlayer(videoUrl, posterUrl) {
    var video = document.querySelector(".movie-video");
    var button = document.querySelector("[data-play-button]");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !button || !videoUrl) {
        return;
    }

    if (posterUrl) {
        video.setAttribute("poster", posterUrl);
    }

    function attachVideo() {
        if (loaded) {
            return Promise.resolve();
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else {
            video.src = videoUrl;
        }
        return Promise.resolve();
    }

    function playVideo() {
        button.classList.add("hide");
        attachVideo().then(function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    button.classList.remove("hide");
                });
            }
        });
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("play", function () {
        button.classList.add("hide");
    });
    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove("hide");
        }
    });
    video.addEventListener("click", function () {
        if (!loaded) {
            playVideo();
        }
    });
}
