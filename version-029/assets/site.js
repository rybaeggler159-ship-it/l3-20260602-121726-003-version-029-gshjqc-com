(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function() {
            menu.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
        window.addEventListener('scroll', function() {
            backTop.classList.toggle('is-visible', window.scrollY > 480);
        });
        backTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-tab]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        tabs.forEach(function(tab, tabIndex) {
            tab.classList.toggle('is-active', tabIndex === activeIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function() {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    tabs.forEach(function(tab, index) {
        tab.addEventListener('click', function() {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var type = normalize(typeFilter && typeFilter.value);
        var visible = 0;

        cards.forEach(function(card) {
            var text = normalize(card.getAttribute('data-text'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }
            if (type && cardType !== type) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    [searchInput, yearFilter, typeFilter].forEach(function(control) {
        if (control) {
            control.addEventListener('input', filterCards);
            control.addEventListener('change', filterCards);
        }
    });
})();
