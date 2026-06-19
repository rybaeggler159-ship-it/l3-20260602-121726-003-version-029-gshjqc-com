(function () {
    var input = document.querySelector('[data-search-input]');
    var year = document.querySelector('[data-filter-year]');
    var region = document.querySelector('[data-filter-region]');
    var button = document.querySelector('[data-search-button]');
    var results = document.querySelector('[data-search-results]');

    if (!input || !results || !window.MOVIE_SEARCH_INDEX) {
        return;
    }

    function renderSearch() {
        var keyword = input.value.trim().toLowerCase();
        var selectedYear = year ? year.value : '';
        var selectedRegion = region ? region.value : '';

        if (!keyword && !selectedYear && !selectedRegion) {
            results.classList.remove('is-visible');
            results.innerHTML = '';
            return;
        }

        var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
            var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
            var yearMatched = !selectedYear || String(movie.year) === selectedYear;
            var regionMatched = !selectedRegion || movie.region === selectedRegion;
            return keywordMatched && yearMatched && regionMatched;
        }).slice(0, 24);

        results.classList.add('is-visible');
        results.innerHTML = matched.map(function (movie) {
            return '<a class="search-result-item" href="' + movie.url + '">' +
                '<strong>' + movie.title + '</strong>' +
                '<span>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</span>' +
                '<p>' + movie.oneLine + '</p>' +
            '</a>';
        }).join('') || '<p>没有找到匹配影片。</p>';
    }

    input.addEventListener('input', renderSearch);
    if (year) {
        year.addEventListener('change', renderSearch);
    }
    if (region) {
        region.addEventListener('change', renderSearch);
    }
    if (button) {
        button.addEventListener('click', renderSearch);
    }
})();
