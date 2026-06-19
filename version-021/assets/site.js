(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var yearFilter = document.querySelector('[data-card-year]');
    var genreFilter = document.querySelector('[data-card-genre]');
    var grid = document.querySelector('[data-card-grid]');

    function applyCardFilter() {
        if (!grid) {
            return;
        }

        var keyword = localFilter ? localFilter.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        var genre = genreFilter ? genreFilter.value : '';
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var text = (card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.region).toLowerCase();
            var yearMatched = !year || card.dataset.year === year;
            var genreMatched = !genre || (card.dataset.genre || '').indexOf(genre) !== -1;
            var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = yearMatched && genreMatched && keywordMatched ? '' : 'none';
        });
    }

    [localFilter, yearFilter, genreFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyCardFilter);
            control.addEventListener('change', applyCardFilter);
        }
    });
})();
