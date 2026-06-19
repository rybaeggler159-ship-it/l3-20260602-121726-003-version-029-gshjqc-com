(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter(input) {
    var root = input.closest("main") || document;
    var cards = root.querySelectorAll("[data-title][data-meta]");
    var query = normalize(input.value);

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
      card.classList.toggle("is-hidden-card", query && haystack.indexOf(query) === -1);
    });
  }

  document.querySelectorAll(".card-filter-input").forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      input.value = q;
      applyFilter(input);
    }
  });

  document.querySelectorAll(".clear-filter").forEach(function (button) {
    button.addEventListener("click", function () {
      var form = button.closest("form") || document;
      var input = form.querySelector(".card-filter-input");

      if (input) {
        input.value = "";
        applyFilter(input);
      }
    });
  });

  document.querySelectorAll("[data-filter-year]").forEach(function (button) {
    button.addEventListener("click", function () {
      var root = button.closest("main") || document;
      var input = root.querySelector(".card-filter-input");

      if (input) {
        input.value = button.getAttribute("data-filter-year");
        applyFilter(input);
      }
    });
  });
})();
