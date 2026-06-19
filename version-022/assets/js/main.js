(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var pillButtons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter-pill]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var currentGenre = '';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var selectedYear = yearSelect ? yearSelect.value : '';
      var selectedType = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.dataset.year === selectedYear;
        var matchType = !selectedType || card.dataset.type === selectedType;
        var matchGenre = !currentGenre || normalize(card.dataset.genre + ' ' + card.dataset.tags).indexOf(currentGenre) !== -1;
        var show = matchKeyword && matchYear && matchType && matchGenre;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    pillButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        pillButtons.forEach(function (item) {
          item.classList.remove('active');
        });

        button.classList.add('active');
        currentGenre = normalize(button.dataset.filterPill);
        applyFilter();
      });
    });
  }

  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));

  playButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var stage = button.closest('.player-stage');
      var video = stage ? stage.querySelector('video') : null;
      var stream = video ? video.dataset.stream : '';

      if (!stage || !video || !stream) {
        return;
      }

      function startVideo() {
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }

        stage.classList.add('playing');
      }

      if (video.dataset.ready === '1') {
        startVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.dataset.ready = '1';
          startVideo();
        });
      } else {
        video.src = stream;
        video.dataset.ready = '1';
        video.addEventListener('loadedmetadata', startVideo, { once: true });
        startVideo();
      }
    });
  });
})();
