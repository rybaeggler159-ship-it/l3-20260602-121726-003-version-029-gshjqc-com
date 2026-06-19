function qs(selector, root) {
  return (root || document).querySelector(selector);
}

function qsa(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function initMenu() {
  var toggle = qs("[data-menu-toggle]");
  var panel = qs("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  var slides = qsa("[data-hero-slide]");
  var dots = qsa("[data-hero-dot]");
  if (slides.length < 2) {
    return;
  }
  var current = 0;
  function show(index) {
    current = index;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
    });
  });
  window.setInterval(function () {
    show((current + 1) % slides.length);
  }, 5200);
}

function initFilters() {
  qsa("[data-filter-area]").forEach(function (area) {
    var input = qs("[data-filter-input]", area);
    var year = qs("[data-filter-year]", area);
    var type = qs("[data-filter-type]", area);
    var cards = qsa("[data-movie-card]", area);
    var empty = qs("[data-empty]", area);
    function apply() {
      var keyword = normalizeText(input && input.value);
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalizeText(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }
    apply();
  });
}

function startMoviePlayer(source) {
  var video = qs("#movie-video");
  var cover = qs("[data-play-cover]");
  if (!video || !source) {
    return;
  }
  var started = false;
  function begin() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (started) {
      video.play();
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      return;
    }
    video.src = source;
    video.play();
  }
  if (cover) {
    cover.addEventListener("click", begin);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initMenu();
  initHero();
  initFilters();
});
