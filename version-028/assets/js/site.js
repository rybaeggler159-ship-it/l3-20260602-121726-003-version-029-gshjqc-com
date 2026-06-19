(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-site-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    inputs.forEach(function (input) {
      var scopeSelector = input.getAttribute('data-filter-scope');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
      input.addEventListener('input', function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-category') + ' ' + card.getAttribute('data-tags'));
          card.classList.toggle('is-filtered-out', keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function initQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    input.value = q;
    input.dispatchEvent(new Event('input'));
    input.focus();
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('.js-player-video');
    var cover = document.querySelector('.js-player-cover');
    if (!video || !source) {
      return;
    }
    var loaded = false;
    function loadSource() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = source;
      }
      loaded = true;
    }
    function play() {
      loadSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        play();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initQuerySearch();
  });
})();
