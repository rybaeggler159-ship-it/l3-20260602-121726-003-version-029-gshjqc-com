const streamFallbacks = [
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
    "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8"
];

document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
});

function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
        toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
}

function initHero() {
    const hero = document.querySelector('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
        return;
    }

    let current = 0;

    const activate = (index) => {
        current = index % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => activate(index));
    });

    window.setInterval(() => activate(current + 1), 5200);
}

function initFilters() {
    const panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach((panel) => {
        const area = panel.parentElement.querySelector('[data-filter-area]');
        const empty = panel.parentElement.querySelector('[data-empty-state]');

        if (!area) {
            return;
        }

        const cards = Array.from(area.querySelectorAll('[data-card]'));
        const search = panel.querySelector('[data-filter-search]');
        const category = panel.querySelector('[data-filter-category]');
        const year = panel.querySelector('[data-filter-year]');
        const region = panel.querySelector('[data-filter-region]');
        const reset = panel.querySelector('[data-filter-reset]');
        const queryParams = new URLSearchParams(window.location.search);

        if (search && queryParams.get('q')) {
            search.value = queryParams.get('q');
        }

        const apply = () => {
            const keyword = search ? search.value.trim().toLowerCase() : '';
            const categoryValue = category ? category.value : '';
            const yearValue = year ? year.value : '';
            const regionValue = region ? region.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const text = [
                    card.dataset.title || '',
                    card.dataset.genre || '',
                    card.dataset.region || '',
                    card.dataset.year || ''
                ].join(' ').toLowerCase();
                const matchesKeyword = !keyword || text.includes(keyword);
                const matchesCategory = !categoryValue || card.dataset.category === categoryValue;
                const matchesYear = !yearValue || card.dataset.year === yearValue;
                const matchesRegion = !regionValue || card.dataset.region === regionValue;
                const show = matchesKeyword && matchesCategory && matchesYear && matchesRegion;

                card.classList.toggle('is-hidden', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        [search, category, year, region].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', () => {
                if (search) {
                    search.value = '';
                }
                if (category) {
                    category.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (region) {
                    region.value = '';
                }
                apply();
            });
        }

        apply();
    });
}

function initPlayers() {
    const players = document.querySelectorAll('[data-player]');

    players.forEach((player) => {
        const video = player.querySelector('[data-video]');
        const button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        const primary = player.dataset.src;
        const backups = (player.dataset.backups || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        const sources = Array.from(new Set([primary, ...backups, ...streamFallbacks].filter(Boolean)));
        let sourceIndex = 0;
        let hls = null;
        let loaded = false;

        const destroyHls = () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        };

        const loadSource = () => {
            const source = sources[sourceIndex];

            if (!source) {
                return;
            }

            destroyHls();

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) {
                        nextSource();
                    }
                });
            } else {
                video.src = source;
            }

            loaded = true;
        };

        const nextSource = () => {
            if (sourceIndex >= sources.length - 1) {
                return;
            }

            sourceIndex += 1;
            loadSource();
            video.play().catch(() => {});
        };

        const playVideo = () => {
            if (!loaded) {
                loadSource();
            }

            video.controls = true;
            button.classList.add('is-hidden');
            video.play().catch(() => {});
        };

        button.addEventListener('click', playVideo);

        video.addEventListener('click', () => {
            if (video.paused) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });

        video.addEventListener('error', nextSource);
    });
}
